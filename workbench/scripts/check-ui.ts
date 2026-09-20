/**
 * 在真浏览器里验收组件，而不是靠肉眼看截图。
 * 自己起 vite preview，用 CDP 读计算样式，逐条断言 SPEC §6.3 的视觉编码，跑完关掉。
 *
 *   npm run check:ui
 *
 * 颜色不写死十六进制：从 :root 上解析同一个 token 再比，所以「组件里偷偷写了个相近的颜色」也会被抓到。
 */
import { spawn, type ChildProcess } from 'node:child_process'
import sample from '../sample/投标流程.json'
import { CANVAS_H, CANVAS_W, EDGE_KINDS, LANE_HUMAN_TOP, NODE_FLAGS, NODE_KINDS, edgeCounts, type Flow } from '../src/flow'

const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
const PORT = Number(process.env.UI_PORT ?? 4183)
const BASE = `http://localhost:${PORT}`
const ROLES_IN_MATRIX = 3
const flow = sample as unknown as Flow

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function waitFor(url: string, tries = 40): Promise<void> {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url)
      if (r.ok) return
    } catch { /* 还没起来 */ }
    await sleep(250)
  }
  throw new Error(`${url} 一直没起来`)
}

interface Cdp {
  evaluate: (expression: string) => Promise<unknown>
  navigate: (url: string) => Promise<void>
  send: (method: string, params?: Record<string, unknown>) => Promise<unknown>
  errors: string[]
  close: () => void
}

async function connect(debugPort: number): Promise<Cdp> {
  let wsUrl = ''
  for (let i = 0; i < 40 && !wsUrl; i++) {
    try {
      const list = (await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json()) as { type: string; webSocketDebuggerUrl: string }[]
      wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl ?? ''
    } catch { /* 浏览器还没起来 */ }
    if (!wsUrl) await sleep(250)
  }
  if (!wsUrl) throw new Error('连不上浏览器')

  const sock = new WebSocket(wsUrl)
  await new Promise((r) => { sock.onopen = r })
  let id = 0
  const pending = new Map<number, (v: unknown) => void>()
  const errors: string[] = []
  sock.onmessage = (m: MessageEvent) => {
    const msg = JSON.parse(String(m.data)) as { id?: number; method?: string; params?: { exceptionDetails?: { text?: string }; type?: string; args?: { value?: unknown }[] } }
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)?.(msg); pending.delete(msg.id) }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params?.exceptionDetails?.text ?? '未知异常')
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') {
      errors.push(msg.params.args?.map((a) => String(a.value)).join(' ') ?? 'console.error')
    }
  }
  const send = (method: string, params: Record<string, unknown> = {}): Promise<{ result?: { result?: { value?: unknown } } }> =>
    new Promise((res) => { const i = ++id; pending.set(i, res as (v: unknown) => void); sock.send(JSON.stringify({ id: i, method, params })) })

  await send('Page.enable')
  await send('Runtime.enable')
  return {
    evaluate: async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value,
    navigate: async (url) => { await send('Page.navigate', { url }); await sleep(3500) },
    send,
    errors,
    close: () => sock.close(),
  }
}

/** 在页面里跑的取样：把每个节点的计算样式和 token 解析结果一起带回来 */
const SAMPLE = `(() => {
  const asRgb = (v) => {
    const probe = document.createElement('span')
    probe.style.color = v
    document.body.appendChild(probe)
    const out = getComputedStyle(probe).color
    probe.remove()
    return out
  }
  const token = (name) => asRgb(getComputedStyle(document.documentElement).getPropertyValue(name).trim())
  const box = (el) => {
    const s = getComputedStyle(el)
    return { w: s.borderWidth, color: s.borderColor, style: s.borderStyle, bg: s.backgroundColor }
  }
  const pin = (el) => { const s = getComputedStyle(el); return { pos: s.position, top: s.top, right: s.right, left: s.left, bg: s.backgroundColor } }
  const all = [...document.querySelectorAll('.fnode')]
  const plainHuman = all.filter((n) => n.classList.contains('fnode--human') && !['block', 'missing', 'pending'].some((f) => n.classList.contains('fnode--' + f)))
  const byFlag = (f) => all.filter((n) => n.classList.contains('fnode--' + f))
  return {
    matrix: document.querySelectorAll('[data-testid="kind-matrix"] .fnode').length,
    tokens: { amber: token('--color-amber'), warm: token('--color-warm'), hi: token('--color-hi'), lo: token('--color-lo'), ok: token('--color-ok'), line: token('--color-line') },
    plainHuman: plainHuman.map(box),
    data: [...document.querySelectorAll('.fnode--data')].map(box),
    roleBadgesInData: document.querySelectorAll('.fnode--data .fnode__role').length,
    block: byFlag('block').map(box),
    missing: byFlag('missing').map(box),
    pending: byFlag('pending').map(box),
    flagPins: [...document.querySelectorAll('.fnode__flag')].map(pin),
    diffPins: [...document.querySelectorAll('.fnode__diff')].map(pin),
    diffNew: [...document.querySelectorAll('.fnode__diff--new')].map(pin),
    ports: [...document.querySelectorAll('.fnode__port')].length,
  }
})()`

let failed = 0
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!ok) failed += 1
}

let preview: ChildProcess | undefined
let chrome: ChildProcess | undefined
try {
  preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
  await waitFor(`${BASE}/`)

  const debugPort = 9361
  // 关键：devicePixelRatio = 2。DPR 1 时 Chrome 会把 1.5px 的边框「用值」舍成 1px，
  // 断言 1.5px 会假报错——规范要的是 1.5px，那就在能看见 1.5px 的密度下验。
  chrome = spawn(CHROME, ['--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${debugPort}`, '--window-size=1400,3400', '--force-device-scale-factor=2', 'about:blank'], { stdio: 'ignore' })
  const cdp = await connect(debugPort)

  await cdp.navigate(`${BASE}/#/flow-node`)
  const s = (await cdp.evaluate(SAMPLE)) as {
    matrix: number
    tokens: Record<string, string>
    plainHuman: { w: string; color: string; style: string; bg: string }[]
    data: { bg: string }[]
    roleBadgesInData: number
    block: { color: string; style: string }[]
    missing: { color: string; style: string }[]
    pending: { color: string; style: string }[]
    flagPins: { pos: string; top: string; right: string }[]
    diffPins: { top: string; left: string }[]
    diffNew: { bg: string }[]
    ports: number
  }

  const expectMatrix = NODE_KINDS.length * ROLES_IN_MATRIX * NODE_FLAGS.length
  check(s.matrix === expectMatrix, `变体矩阵渲染 ${expectMatrix} 个组合`, `kind ${NODE_KINDS.length} × role ${ROLES_IN_MATRIX} × flag ${NODE_FLAGS.length}，实际 ${s.matrix}`)

  check(
    s.plainHuman.length > 0 && s.plainHuman.every((n) => n.color === s.tokens.amber && n.style === 'solid' && n.w === '1.5px'),
    '人节点：琥珀 1.5px 实线边框',
    `${s.plainHuman.length} 个，取到 ${s.plainHuman[0]?.w} ${s.plainHuman[0]?.color}`,
  )
  check(s.data.length > 0 && s.data.every((n) => n.bg === s.tokens.warm), '数据节点：暖灰底', `${s.data.length} 个`)
  check(s.roleBadgesInData === 0, '数据节点不画角色徽章', '它不是一个步骤，不谈「谁来做」')

  check(s.block.length > 0 && s.block.every((n) => n.color === s.tokens.hi && n.style === 'solid'), '卡点：红实边')
  check(s.missing.length > 0 && s.missing.every((n) => n.color === s.tokens.amber && n.style === 'dashed'), '缺口：琥珀虚边')
  check(s.pending.length > 0 && s.pending.every((n) => n.color === s.tokens.lo && n.style === 'dashed'), '待打通：蓝虚边')

  check(
    s.flagPins.length > 0 && s.flagPins.every((p) => p.pos === 'absolute' && p.top === '-9px' && p.right === '8px'),
    '三种标记压在右上角',
    `${s.flagPins.length} 个`,
  )
  check(
    s.diffPins.length > 0 && s.diffPins.every((p) => p.top === '-9px' && p.left === '8px'),
    '对照 chip 压在左上角，与标记分列两侧',
    `${s.diffPins.length} 个`,
  )
  check(s.diffNew.length > 0 && s.diffNew.every((p) => p.bg === s.tokens.ok), '「新增」chip 绿底，其余黑底')
  check(s.ports > 0, '端口渲染', `${s.ports} 个`)

  await cdp.navigate(`${BASE}/#/`)
  const contract = (await cdp.evaluate(`document.body.innerText.includes('契约自检全部通过')`)) as boolean
  check(contract, '契约自检页仍然全绿')

  // ---- S03 画布：泳道、节点定位、五个数字、缩放范围、缩放后节点可点中
  await cdp.navigate(`${BASE}/#/canvas`)
  const CANVAS_SAMPLE = `(() => {
    const vp = document.querySelector('.react-flow__viewport')
    const m = vp ? getComputedStyle(vp).transform : 'none'
    const scale = m && m !== 'none' ? Number(m.slice(m.indexOf('(') + 1).split(',')[0]) : 1
    const mid = (el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }
    const n9 = document.querySelector('.react-flow__node[data-id="n9"]')
    const pane = document.querySelector('.react-flow__pane')
    return {
      five: (document.querySelector('[data-testid="five-numbers"]')?.textContent ?? ''),
      nodes: document.querySelectorAll('.react-flow__node').length,
      edges: document.querySelectorAll('.react-flow__edge').length,
      lanes: [...document.querySelectorAll('.lane__name')].map((e) => e.textContent),
      handles: document.querySelectorAll('.react-flow__handle.fnode__port').length,
      scale,
      n9: n9 ? mid(n9) : null,
      n9Selected: !!document.querySelector('.react-flow__node[data-id="n9"].selected .fnode--selected'),
      pane: pane ? mid(pane) : null,
      zoomText: document.querySelector('[data-testid="zoom"]')?.textContent ?? '',
      frame: (() => { const l = document.querySelector('.lanes'), p = document.querySelector('.react-flow__pane'); if (!l || !p) return null; const a = l.getBoundingClientRect(), b = p.getBoundingClientRect(); return { inside: a.left >= b.left - 1 && a.top >= b.top - 1 && a.right <= b.right + 1 && a.bottom <= b.bottom + 1, w: a.width, h: a.height } })(),
    }
  })()`
  type CanvasSample = { five: string; nodes: number; edges: number; lanes: string[]; handles: number; scale: number; n9: { x: number; y: number } | null; n9Selected: boolean; pane: { x: number; y: number } | null; zoomText: string; frame: { inside: boolean; w: number; h: number } | null }
  const sampleCanvas = async () => (await cdp.evaluate(CANVAS_SAMPLE)) as CanvasSample
  const wheel = async (at: { x: number; y: number }, deltaY: number, times = 1) => {
    for (let i = 0; i < times; i++) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: at.x, y: at.y, deltaX: 0, deltaY })
      await sleep(60)
    }
    await sleep(400)
  }
  const click = async (at: { x: number; y: number }) => {
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: at.x, y: at.y })
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: at.x, y: at.y, button: 'left', clickCount: 1 })
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: at.x, y: at.y, button: 'left', clickCount: 1 })
    await sleep(400)
  }

  const c0 = await sampleCanvas()
  const five = c0.five.replace(/\s+/g, ' ').trim()
  check(/自动 7.*人 7.*卡点 2.*缺口 1.*待打通 4/.test(five), '顶栏五个数字：自动 7 · 人 7 · 卡点 2 · 缺口 1 · 待打通 4', five)
  check(c0.nodes === 19, '投标示例 19 个节点全部渲染', `实际 ${c0.nodes}`)
  check(c0.edges === 23, '23 条线全部渲染', `实际 ${c0.edges}`)
  check(c0.lanes.join('/') === 'AI 自动/人/数据与系统', '三条泳道按序：AI 自动 / 人 / 数据与系统', c0.lanes.join(' / '))
  check(c0.handles === 38, '每个节点两个端口，边框色 = 产物类型', `${c0.handles} 个 Handle`)
  check(c0.frame?.inside === true && c0.pane !== null, '首帧取景到整幅画布：三条泳道连底边一起可见，不按节点外框取景', `scale ${c0.scale.toFixed(3)}，画布 ${Math.round(c0.frame?.w ?? 0)} × ${Math.round(c0.frame?.h ?? 0)} px`)

  if (c0.pane) {
    await wheel(c0.pane, -200, 3)
    const c1 = await sampleCanvas()
    check(c1.scale > c0.scale, '滚轮放大：scale 变大', `${c0.scale.toFixed(3)} → ${c1.scale.toFixed(3)}`)
    check(/\d+%/.test(c1.zoomText) && c1.zoomText.startsWith(String(Math.round(c1.scale * 100))), '顶栏缩放读数跟着变', c1.zoomText)

    await wheel(c0.pane, -400, 12)
    const cMax = await sampleCanvas()
    check(cMax.scale <= 1.6 + 1e-6 && cMax.scale >= 1.6 - 1e-3, '放大封顶 160%', `scale ${cMax.scale.toFixed(3)}`)

    await wheel(c0.pane, 400, 24)
    const cMin = await sampleCanvas()
    check(cMin.scale >= 0.5 - 1e-6 && cMin.scale <= 0.5 + 1e-3, '缩小到底 50%', `scale ${cMin.scale.toFixed(3)}`)

    // 缩到 50% 后，按屏幕坐标点节点 n9：能选中说明坐标换算对
    if (cMin.n9) {
      await click(cMin.n9)
      const cClick = await sampleCanvas()
      check(cClick.n9Selected, '缩放后按屏幕坐标点中 n9，节点进入选中态', `点在 (${Math.round(cMin.n9.x)}, ${Math.round(cMin.n9.y)})，scale ${cMin.scale.toFixed(2)}`)
    } else {
      check(false, '找不到节点 n9')
    }
  }

  // ---- S04 连线：五种线各几条、标签是 HTML、默认只显非顺序与决定类、拱顶 / 绕底的几何、点线选中、「产物」全开
  await cdp.navigate(`${BASE}/#/canvas`)
  const wantCounts = edgeCounts(flow)
  const wantDefault = flow.edges.filter((e) => e.label && (e.kind !== 'seq' || e.dtype === 'decision')).length
  const wantAll = flow.edges.filter((e) => e.label).length
  const plainSeq = flow.edges.find((e) => e.from === 'n12' && e.to === 'n13' && e.kind === 'seq' && e.dtype !== 'decision')
  if (!plainSeq) throw new Error('示例里找不到 n12 → n13 这条普通顺序线，选中测试没法做')

  const EDGE_SAMPLE = `(() => {
    const q = (s) => document.querySelectorAll(s).length
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, r: r.right, b: r.bottom } }
    const overlap = (a, b) => a.x < b.r - 0.5 && b.x < a.r - 0.5 && a.y < b.b - 0.5 && b.y < a.b - 0.5
    const nodes = [...document.querySelectorAll('.react-flow__node')].map(rect)
    // getBBox 是 svg 用户坐标 = flow 坐标，与缩放无关，几何断言直接用画布常量比
    const bbox = (sel) => { const p = document.querySelector(sel + ' path.react-flow__edge-path'); if (!p) return null; const b = p.getBBox(); return { x: b.x, y: b.y, r: b.x + b.width, b: b.y + b.height } }
    const labels = [...document.querySelectorAll('.react-flow__edgelabel-renderer .fe-label')]
    const selG = document.querySelector('.react-flow__edge.selected')
    const selPath = selG ? selG.querySelector('path.react-flow__edge-path') : null
    const probe = document.createElement('span')
    probe.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-amber').trim()
    document.body.appendChild(probe); const amber = getComputedStyle(probe).color; probe.remove()
    return {
      kinds: Object.fromEntries(['seq', 'data', 'pending', 'loop', 'back'].map((k) => [k, q('.react-flow__edge.fe-' + k)])),
      markers: q('marker[id^="pd-arrow-"]'),
      svgText: q('.react-flow__edges text'),
      labels: labels.length,
      decision: labels.filter((l) => l.classList.contains('fe-label--decision')).length,
      hidden: labels.filter((l) => nodes.some((n) => overlap(n, rect(l)))).map((l) => l.textContent),
      back: bbox('.react-flow__edge.fe-back'),
      loop: bbox('.react-flow__edge.fe-loop'),
      legend: Object.fromEntries([...document.querySelectorAll('[data-testid="edge-legend"] b')].map((b) => [b.dataset.kind, Number(b.textContent)])),
      selected: q('.react-flow__edge.selected'),
      selId: selG ? selG.dataset.id : '',
      selStroke: selPath ? getComputedStyle(selPath).stroke : '',
      selWidth: selPath ? getComputedStyle(selPath).strokeWidth : '',
      selMarker: selPath ? selPath.getAttribute('marker-end') : '',
      selLabel: selG ? q('.fe-label[data-edge="' + selG.dataset.id + '"]') : 0,
      pressed: document.querySelector('[data-testid="toggle-labels"]')?.getAttribute('aria-pressed') ?? '',
      amber,
    }
  })()`
  type Box = { x: number; y: number; r: number; b: number }
  type EdgeSample = {
    kinds: Record<string, number>; markers: number; svgText: number; labels: number; decision: number; hidden: string[]
    back: Box | null; loop: Box | null; legend: Record<string, number>
    selected: number; selId: string; selStroke: string; selWidth: string; selMarker: string; selLabel: number; pressed: string; amber: string
  }
  const sampleEdges = async () => (await cdp.evaluate(EDGE_SAMPLE)) as EdgeSample

  const e0 = await sampleEdges()
  check(EDGE_KINDS.every((k) => e0.kinds[k] === wantCounts[k]), '五种线各按 kind 落到 <g class="fe-…">，数量与示例一致', Object.entries(e0.kinds).map(([k, v]) => `${k} ${v}`).join(' · '))
  check(e0.markers === 6, '六个箭头 marker（五种 + 选中）定义在文档里', `${e0.markers} 个`)
  check(e0.svgText === 0 && e0.labels > 0, '标签是 HTML（EdgeLabelRenderer），svg 里没有 <text>', `${e0.labels} 个 .fe-label`)
  check(e0.labels === wantDefault && e0.decision === 4, `默认只显示非顺序线与决定类：${wantDefault} 个`, `实际 ${e0.labels}，其中决定类 ${e0.decision}`)
  check(e0.hidden.length === 0, '没有标签被节点盖住（紧挨的两个节点之间，标签抬到节点顶边之上）', e0.hidden.join(' / '))
  check(
    !!e0.back && e0.back.y > LANE_HUMAN_TOP && e0.back.y < 500 && e0.back.x >= 774 && e0.back.r <= 946,
    '退回线在两个节点顶上拱起，拱顶不越过泳道线',
    e0.back ? `拱顶 y=${e0.back.y.toFixed(1)}，x ${e0.back.x.toFixed(0)}–${e0.back.r.toFixed(0)}` : '没找到',
  )
  check(
    !!e0.loop && Math.abs(e0.loop.r - (CANVAS_W - 12)) < 0.5 && Math.abs(e0.loop.b - (CANVAS_H - 22)) < 0.5,
    '回填线贴画布右边、沿底边绕回目标底部',
    e0.loop ? `右到 x=${e0.loop.r}，底到 y=${e0.loop.b}` : '没找到',
  )
  check(EDGE_KINDS.every((k) => e0.legend[k] === wantCounts[k]), '图例计数与线一致', JSON.stringify(e0.legend))
  check(e0.selected === 0 && e0.pressed === 'false', '初始没有选中的线，「产物」关着')

  // 点一条普通顺序线的中点：变琥珀、加粗、换箭头，并临时显示它的标签。屏幕坐标 = 画布坐标经 viewport 变换
  const mid = (await cdp.evaluate(`(() => {
    const p = document.querySelector('.react-flow__edge[data-id="${plainSeq.id}"] path.react-flow__edge-path')
    if (!p) return null
    const pt = p.getPointAtLength(p.getTotalLength() / 2)
    const m = new DOMMatrix(getComputedStyle(document.querySelector('.react-flow__viewport')).transform)
    const rf = document.querySelector('.react-flow').getBoundingClientRect()
    return { x: rf.x + m.e + pt.x * m.a, y: rf.y + m.f + pt.y * m.d }
  })()`)) as { x: number; y: number } | null
  if (mid) {
    await click(mid)
    const e1 = await sampleEdges()
    check(e1.selected === 1 && e1.selId === plainSeq.id, `点线的中点选中 ${plainSeq.from} → ${plainSeq.to}`, `点在 (${Math.round(mid.x)}, ${Math.round(mid.y)})，选中 ${e1.selected} 条：${e1.selId}`)
    check(e1.selStroke === e1.amber && e1.selWidth === '2.6px' && e1.selMarker === 'url(#pd-arrow-selected)', '选中线：琥珀 2.6px + 琥珀箭头', `${e1.selStroke} ${e1.selWidth} ${e1.selMarker}`)
    check(e1.selLabel === 1 && e1.labels === wantDefault + 1, '选中的顺序线临时显示自己的标签', `${e1.labels} 个`)
  } else {
    check(false, `找不到线 ${plainSeq.id}`)
  }

  await cdp.evaluate(`document.querySelector('[data-testid="toggle-labels"]').click()`)
  await sleep(300)
  const e2 = await sampleEdges()
  check(e2.pressed === 'true' && e2.labels === wantAll, `「产物」打开：${wantAll} 条线全部带标签`, `实际 ${e2.labels}`)
  await cdp.evaluate(`document.querySelector('[data-testid="toggle-labels"]').click()`)
  await sleep(300)
  const e3 = await sampleEdges()
  check(e3.pressed === 'false' && e3.labels === wantDefault + e3.selected, '再点一次关掉，回到默认（选中那条仍显示）', `实际 ${e3.labels}`)

  check(cdp.errors.length === 0, '浏览器控制台没有报错', cdp.errors.slice(0, 2).join(' | '))
  cdp.close()
} finally {
  chrome?.kill()
  preview?.kill()
}

console.log(failed ? `\n${failed} 项没过` : '\n浏览器验收全部通过')
process.exit(failed ? 1 : 0)
