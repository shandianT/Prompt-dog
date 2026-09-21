/**
 * 在真浏览器里验收组件，而不是靠肉眼看截图。
 * 自己起 vite preview，用 CDP 读计算样式，逐条断言 SPEC §6.3 的视觉编码，跑完关掉。
 *
 *   npm run check:ui
 *
 * 颜色不写死十六进制：从 :root 上解析同一个 token 再比，所以「组件里偷偷写了个相近的颜色」也会被抓到。
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import sample from '../sample/投标流程.json'
import { CANVAS_H, CANVAS_W, EDGE_KINDS, LANE_HUMAN_TOP, NODE_FLAGS, NODE_KINDS, edgeCounts, type Flow } from '../src/flow'

const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
const PORT = Number(process.env.UI_PORT ?? 4183)
const BASE = `http://localhost:${PORT}`
const ROLES_IN_MATRIX = 3
/** 设了就把关键时刻的截图存到这个目录（证据，不是断言） */
const SHOT_DIR = process.env.UI_SHOT_DIR
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
    // 先去 about:blank 再来：同一个 URL 只换 hash 是「同文档导航」，页面不会重载，上一段留下的缩放 / 选中会串进下一段
    navigate: async (url) => { await send('Page.navigate', { url: 'about:blank' }); await sleep(200); await send('Page.navigate', { url }); await sleep(3500) },
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

const PD_INSTALL = `window.__pd = {
    pos: (id) => { const el = document.querySelector('.react-flow__node[data-id="' + id + '"]'); const m = /translate\\(([-\\d.]+)px,\\s*([-\\d.]+)px\\)/.exec(el ? el.style.transform : ''); return m ? { x: Number(m[1]), y: Number(m[2]) } : null },
    screen: (x, y) => { const m = new DOMMatrix(getComputedStyle(document.querySelector('.react-flow__viewport')).transform); const rf = document.querySelector('.react-flow').getBoundingClientRect(); return { x: rf.x + m.e + x * m.a, y: rf.y + m.f + y * m.d } },
    edgeMid: (id, t) => { const p = document.querySelector('.react-flow__edge[data-id="' + id + '"] path.react-flow__edge-path'); if (!p) return null; const pt = p.getPointAtLength(p.getTotalLength() * (t ?? 0.5)); return window.__pd.screen(pt.x, pt.y) },
    selected: () => [...document.querySelectorAll('.react-flow__node.selected')].map((n) => n.dataset.id).sort(),
    selectedEdges: () => document.querySelectorAll('.react-flow__edge.selected').length,
    undoDisabled: () => !!document.querySelector('[data-testid="undo"]')?.disabled,
    undo: () => document.querySelector('[data-testid="undo"]').click(),
    bar: () => document.querySelector('[data-testid="selection-bar"]')?.textContent ?? '',
    barCancel: () => [...document.querySelectorAll('[data-testid="selection-bar"] button')].find((b) => b.textContent === '取消').click(),
    marquee: () => { const el = document.querySelector('.react-flow__selection'); if (!el) return null; const s = getComputedStyle(el); return { color: s.borderTopColor, style: s.borderTopStyle, w: el.getBoundingClientRect().width } },
    five: () => (document.querySelector('[data-testid="five-numbers"]')?.textContent ?? '').replace(/\\s+/g, ' '),
    mode: () => document.querySelector('[data-testid="inspector"]')?.dataset.mode ?? '',
    count: (sel) => document.querySelectorAll(sel).length,
    text: (sel) => (document.querySelector(sel)?.textContent ?? '').replace(/\\s+/g, ' ').trim(),
    value: (sel) => document.querySelector(sel)?.value ?? '',
    labels: () => [...document.querySelectorAll('[data-testid="inspector"] .ins__lb')].map((l) => l.textContent),
    click: (sel) => document.querySelector(sel).click(),
    segPick: (testId, label) => [...document.querySelectorAll('[data-testid="' + testId + '"] button')].find((b) => b.textContent === label).click(),
    setInput: (sel, v) => { const el = document.querySelector(sel); el.focus(); Object.getOwnPropertyDescriptor(el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.blur() },
    nodeText: (id, cls) => document.querySelector('.react-flow__node[data-id="' + id + '"] .' + cls)?.textContent ?? '',
    edgeDash: (id) => getComputedStyle(document.querySelector('.react-flow__edge[data-id="' + id + '"] path.react-flow__edge-path')).strokeDasharray,
    edgeIds: () => [...document.querySelectorAll('.react-flow__edge')].map((g) => g.dataset.id).sort(),
    toast: () => document.querySelector('[data-testid="toast"]')?.textContent ?? '',
    connLine: () => { const p = document.querySelector('.react-flow__connectionline path'); if (!p) return null; const s = getComputedStyle(p); return { stroke: s.stroke, dash: s.strokeDasharray, why: document.querySelector('.cl__why')?.textContent ?? '' } },
    attr: (sel, name) => document.querySelector(sel)?.getAttribute(name) ?? '',
    at: (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } },
    menuPick: (label) => [...document.querySelectorAll('[data-testid="context-menu"] button')].find((b) => b.textContent === label).click(),
    center: (sel) => { const el = document.querySelector(sel); if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } },
    type: (sel, v) => { const el = document.querySelector(sel); el.focus(); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) },
  }; 'ok'`

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

  const shot = async (name: string) => {
    if (!SHOT_DIR) return
    const r = (await cdp.send('Page.captureScreenshot', { format: 'png' })) as { result?: { data?: string } }
    if (r.result?.data) writeFileSync(`${SHOT_DIR}/${name}.png`, Buffer.from(r.result.data, 'base64'))
  }

  await cdp.navigate(`${BASE}/#/`)
  const contract = (await cdp.evaluate(`document.body.innerText.includes('契约自检全部通过')`)) as boolean
  check(contract, '契约自检页仍然全绿')

  // ---- S03 画布：泳道、节点定位、五个数字、缩放范围、缩放后节点可点中
  // 画布页按真实的 1400 × 900 视口跑（变体页需要长窗口，画布页不需要），截图才是用户看到的样子
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 2, mobile: false })
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

  // ---- S05 选中、移动、框选、撤销：拖动写回 flow 并可撤销、锁在泳道与画布内、空白拖矩形框选、浮条、多选一起动、快捷键、撤销栈 40 步
  await cdp.navigate(`${BASE}/#/canvas`)
  await cdp.evaluate(PD_INSTALL)
  type P = { x: number; y: number }
  const pd = async <T,>(expr: string) => (await cdp.evaluate(`window.__pd.${expr}`)) as T
  const pos = (id: string) => pd<P | null>(`pos('${id}')`)
  const screen = (x: number, y: number) => pd<P>(`screen(${x}, ${y})`)
  const mouse = (type: 'mousePressed' | 'mouseReleased' | 'mouseMoved', at: P, extra: Record<string, unknown> = {}) =>
    cdp.send('Input.dispatchMouseEvent', { type, x: at.x, y: at.y, button: 'left', clickCount: 1, ...extra })
  /**
   * 按画布坐标拖：from 按下，先挪 5px 越过 3px 的拖动阈值，再到 to 松手。
   * React Flow 从越过阈值那一刻起算位移（节点不跳），所以松手点要补回那 5px，节点才正好落在 to。
   */
  const drag = async (from: P, to: P, settle = 250, midway?: () => Promise<void>) => {
    const a = await screen(from.x, from.y), b = await screen(to.x, to.y)
    const end = { x: b.x + 5, y: b.y + 5 }
    await mouse('mouseMoved', a, { button: 'none' })
    await mouse('mousePressed', a)
    await sleep(30)
    await mouse('mouseMoved', { x: a.x + 5, y: a.y + 5 }, { buttons: 1 })
    await sleep(30)
    await mouse('mouseMoved', end, { buttons: 1 })
    await sleep(60)
    if (midway) await midway()
    await mouse('mouseReleased', end)
    await sleep(settle)
  }
  const key = async (k: string, code: string, vk: number, modifiers = 0) => {
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers })
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk, modifiers })
    await sleep(150)
  }
  const near = (p: P | null, x: number, y: number, tol = 2) => !!p && Math.abs(p.x - x) <= tol && Math.abs(p.y - y) <= tol
  const fmt = (p: P | null) => (p ? `(${p.x}, ${p.y})` : 'null')
  const center = (x: number, y: number): P => ({ x: x + 75, y: y + 32 })

  const five0 = await pd<string>('five()')
  check((await pd<boolean>('undoDisabled()')) && (await pd<string[]>('selected()')).length === 0 && near(await pos('n9'), 700, 500, 0), '初始：没有选中、撤销按钮灰着、n9 在 (700, 500)')

  await drag(center(700, 500), center(760, 540))
  const p1 = await pos('n9')
  check(near(p1, 760, 540), '拖 n9 (+60, +40)：位置写回并取整', fmt(p1))
  check(!(await pd<boolean>('undoDisabled()')) && (await pd<string>('five()')) === five0, '拖完撤销按钮亮起，五个数字不变')

  await drag(center(p1?.x ?? 760, p1?.y ?? 540), center(-100, 940))
  const p2 = await pos('n9')
  check(near(p2, 0, 656, 0), '往左下拖出画布和泳道：锁在画布左边与人泳道底（y = 720 − 64）', fmt(p2))

  await pd('undo()'); await sleep(200); await pd('undo()'); await sleep(200)
  check(near(await pos('n9'), 700, 500, 0), '撤销两步回到 (700, 500)', fmt(await pos('n9')))
  await pd('undo()'); await sleep(200)
  check(near(await pos('n9'), 700, 500, 0) && (await pd<boolean>('undoDisabled()')), '栈空再撤销：什么都不发生，按钮灰掉')

  // 空白处拖矩形：从 (350, 50) 到 (690, 270)，与 n3 / n5 / n6 相交
  let mq: { color: string; style: string; w: number } | null = null
  await drag({ x: 350, y: 50 }, { x: 690, y: 270 }, 300, async () => { mq = await pd('marquee()') })
  const amber = (await cdp.evaluate(`(() => { const s = document.createElement('span'); s.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-amber').trim(); document.body.appendChild(s); const c = getComputedStyle(s).color; s.remove(); return c })()`)) as string
  const mqv = mq as { color: string; style: string; w: number } | null
  check(!!mqv && mqv.color === amber && mqv.style === 'dashed' && mqv.w > 100, '拖的过程中有琥珀虚线框', mqv ? `${mqv.color} ${mqv.style} 宽 ${Math.round(mqv.w)}px` : '没抓到框')
  const sel1 = await pd<string[]>('selected()'), selE = await pd<number>('selectedEdges()')
  check(sel1.join(',') === 'n3,n5,n6' && selE === 0, '框选相交即选中：n3 / n5 / n6，只选节点不选线', `${sel1.join(',')}，选中的线 ${selE} 条`)
  const bar1 = await pd<string>('bar()')
  check(bar1.includes('已选 3 个节点') && bar1.includes('取消'), '浮条：已选 3 个节点 · 取消', bar1)
  await shot('s05-marquee')

  // 多选一起动：拖 n5 (+20, +30)，n3 / n6 跟着
  await drag(center(530, 60), center(550, 90))
  const [q3, q5, q6] = [await pos('n3'), await pos('n5'), await pos('n6')]
  check(near(q3, 380, 150) && near(q5, 550, 90) && near(q6, 550, 230), '多选一起动：三个节点同一位移', `${fmt(q3)} ${fmt(q5)} ${fmt(q6)}`)
  await shot('s05-group-moved')
  await pd('barCancel()'); await sleep(200)
  check((await pd<string[]>('selected()')).length === 0 && (await pd<string>('bar()')) === '', '浮条「取消」：清空选中，浮条消失')
  await pd('undo()'); await sleep(200)
  check(near(await pos('n3'), 360, 120, 0) && near(await pos('n5'), 530, 60, 0) && near(await pos('n6'), 530, 200, 0), '撤销一步：三个节点一起回去')

  // 快捷键：点 n9 选中 → 方向键 1px / Shift 10px → Esc 取消选中 → Ctrl+Z 撤销两步
  await click(await screen(775, 532))
  check((await pd<string[]>('selected()')).join(',') === 'n9', '点 n9 选中')
  await key('ArrowRight', 'ArrowRight', 39)
  const k1 = await pos('n9')
  await key('ArrowRight', 'ArrowRight', 39, 8)
  const k2 = await pos('n9')
  check(near(k1, 701, 500, 0) && near(k2, 711, 500, 0), '方向键微移 1px，Shift 10px（各一步撤销）', `${fmt(k1)} → ${fmt(k2)}`)
  await key('Escape', 'Escape', 27)
  check((await pd<string[]>('selected()')).length === 0, 'Esc 取消选中')
  await key('z', 'KeyZ', 90, 2); await key('z', 'KeyZ', 90, 2)
  const kz = await pos('n9'), kzDisabled = await pd<boolean>('undoDisabled()')
  check(near(kz, 700, 500, 0) && kzDisabled, 'Ctrl+Z 两次回到 (700, 500)，栈空', `${fmt(kz)}，撤销按钮${kzDisabled ? '灰' : '亮'}`)

  // 撤销栈 40 步：拖 41 次，撤销 40 次回到第 1 次拖完的位置（最早那份被挤掉），再撤销无事发生
  let x = 700
  let firstX = 0
  for (let i = 0; i < 41; i++) {
    await drag(center(x, 500), center(x + 6, 500), 90)
    x = (await pos('n9'))?.x ?? x
    if (i === 0) firstX = x
  }
  const xAfter41 = (await pos('n9'))?.x ?? -1
  for (let i = 0; i < 40; i++) { await pd('undo()'); await sleep(25) }
  await sleep(200)
  const x40 = (await pos('n9'))?.x ?? -1
  await pd('undo()'); await sleep(150)
  const x41 = (await pos('n9'))?.x ?? -1
  check(xAfter41 > 900 && x40 === firstX && firstX !== 700 && x41 === x40 && (await pd<boolean>('undoDisabled()')),
    '拖 41 次、撤销 40 次：回到第 1 次拖完的位置，最早那步已挤出栈，第 41 次撤销无事发生',
    `41 次后 x=${xAfter41}，撤销 40 次后 x=${x40}（第 1 次拖完 x=${firstX}），再撤销 x=${x41}`)

  await shot('s05-final')
  // ---- S06 属性面板：诊断 / 节点 / 连线三态、分类型字段、改字段可撤销、待打通改数据变实线、契约提示、删除三条路
  await cdp.navigate(`${BASE}/#/canvas`)
  await cdp.evaluate(PD_INSTALL)
  const mode = () => pd<string>('mode()')
  const fiveText = () => pd<string>('five()')
  const count = (sel: string) => pd<number>(`count(${JSON.stringify(sel)})`)
  const text = (sel: string) => pd<string>(`text(${JSON.stringify(sel)})`)
  const labelsOf = () => pd<string[]>('labels()')
  const pick = async (testId: string, label: string) => { await pd(`segPick(${JSON.stringify(testId)}, ${JSON.stringify(label)})`); await sleep(150) }
  const clickSel = async (sel: string) => { await pd(`click(${JSON.stringify(sel)})`); await sleep(200) }
  const undoBtn = async (n = 1) => { for (let i = 0; i < n; i++) { await pd('undo()'); await sleep(120) } }
  /** 点一条线上的一点（默认中点；画布坐标经 viewport 变换成屏幕坐标）。回填线的中点在画布右下角、压在缩放按钮下面，要点它就取 1/4 处 */
  const clickEdge = async (id: string, t = 0.5) => {
    const at = await pd<P | null>(`edgeMid(${JSON.stringify(id)}, ${t})`)
    if (!at) throw new Error(`找不到线 ${id}`)
    await click(at)
  }

  const fiveBase = await fiveText()
  check((await mode()) === 'diag', '无选中：面板是诊断')
  const dBlock = await text('[data-testid="diag-block"] b'), dMissing = await text('[data-testid="diag-missing"] b'), dPending = await text('[data-testid="diag-pending"] b')
  check(fiveBase.includes(`卡点 ${dBlock}`) && fiveBase.includes(`缺口 ${dMissing}`) && fiveBase.includes(`待打通 ${dPending}`), '诊断三个数字与顶栏一致', `${dBlock} / ${dMissing} / ${dPending}`)
  check((await count('[data-testid="diag-block"] .chip')) === 2 && (await count('[data-testid="diag-missing"] .chip')) === 1 && (await count('[data-testid="diag-pending"] .chip')) === 4, '三行各带节点 chip：2 / 1 / 4')
  check((await count('[data-testid="diag-suggestions"] li')) === 7, '重构建议 7 条（每个带标记的节点一条）', `${await count('[data-testid="diag-suggestions"] li')} 条`)
  await shot('s06-diag')

  await clickSel('[data-testid="diag-block"] .chip')
  check((await pd<string[]>('selected()')).join() === 'n2' && (await mode()) === 'node', '点卡点 chip：选中 n2，面板切到节点')
  check((await text('[data-testid="node-kind"]')) === '人' && (await pd<string>('value(\'[data-testid="f-name"]\')')) === '获取招标文件', '节点面板：类型徽章「人」，名称已填', await pd<string>('value(\'[data-testid="f-name"]\')'))
  const humanLabels = await labelsOf()
  check(['谁来做', '状态', '负责人 / 部门', '时限', '通知', '怎么解', '输入', '输出'].every((l) => humanLabels.includes(l)) && !humanLabels.includes('打通方式'), '人节点：负责人 / 部门、时限、通知；有标记才有「怎么解」', humanLabels.join(' · '))
  await shot('s06-node')

  await click(await screen(20 + 75, 780 + 32))
  const dataLabels = await labelsOf()
  check((await mode()) === 'node' && ['打通方式', '方向', '系统负责人'].every((l) => dataLabels.includes(l)) && !dataLabels.includes('谁来做'), '数据节点：打通方式、方向、系统负责人，没有「谁来做」', dataLabels.join(' · '))
  await click(await screen(360 + 75, 120 + 32))
  const dogLabels = await labelsOf()
  check(['子流程', '复用于'].every((l) => dogLabels.includes(l)), '工作狗：子流程环节数、复用于 N 条流程', dogLabels.join(' · '))
  await click(await screen(530 + 75, 200 + 32))
  const skillLabels = await labelsOf()
  check(['复用于', '改一处'].every((l) => skillLabels.includes(l)), '技能：复用于 N 只工作狗、改一处全部同步（know-how 的「来源」示例里没有节点可验）', skillLabels.join(' · '))
  await click(await screen(1040 + 75, 500 + 32))
  check((await count('[data-testid="f-role"] button:disabled')) === 2, '受保护的人定节点（递交）：自动 / 人审两个选项灰掉')

  // 改字段：谁来做 → 人审；状态 → 正常；名称；每一步可撤销
  await click(await screen(190 + 75, 500 + 32))
  await pick('f-role', '人审')
  check((await pd<string>('nodeText("n2", "fnode__role")')) === '人审', '谁来做改人审：画布上的徽章跟着变')
  await undoBtn()
  check((await pd<string>('nodeText("n2", "fnode__role")')) === '人定', '撤销：回到人定')
  await pick('f-flag', '正常')
  check((await fiveText()).includes('卡点 1') && (await count('.react-flow__node[data-id="n2"] .fnode__flag')) === 0, '状态改正常：顶栏卡点 2 → 1，节点上的标记消失')
  await undoBtn()
  check((await fiveText()) === fiveBase, '撤销：五个数字回到原样')
  await pd(`setInput('[data-testid="f-name"]', '获取招标文件 2')`); await sleep(200)
  check((await pd<string>('nodeText("n2", "fnode__name")')) === '获取招标文件 2', '改名称、失焦写回：画布上的名字跟着变')
  await undoBtn()
  check((await pd<string>('nodeText("n2", "fnode__name")')) === '获取招标文件', '撤销：名字回来')

  // 连线：待打通改数据 → 实线；产物类型改成决定进数据节点 → 契约提示
  await clickEdge('e0')
  check((await mode()) === 'edge' && (await text('[data-testid="edge-pair"]')).includes('CRM') && (await text('[data-testid="edge-pair"]')).includes('商机进入'), '点线：面板切到连线，显示 CRM → 商机进入', await text('[data-testid="edge-pair"]'))
  await shot('s06-edge')
  await pick('f-kind', '数据')
  const dash1 = await pd<string>('edgeDash("e0")'), legend1 = await text('[data-testid="edge-legend"]')
  check((await count('.react-flow__edge.fe-data[data-id="e0"]')) === 1 && dash1 === 'none' && legend1.includes('数据4') && legend1.includes('待打通3'), '待打通改为数据：变实线，图例 数据 4 · 待打通 3', `dasharray ${dash1}`)
  await undoBtn()
  check((await count('.react-flow__edge.fe-pending[data-id="e0"]')) === 1 && (await pd<string>('edgeDash("e0")')) !== 'none', '撤销：回到待打通虚线')
  await clickEdge('e22', 0.25)
  await pick('f-dtype', '决定')
  check((await count('[data-testid="compat-warning"]')) === 1 && (await text('[data-testid="compat-warning"]')).includes('契约规则 1'), '回填线的产物改成「决定」进数据节点：面板提示契约规则 1', await text('[data-testid="compat-warning"]'))
  await undoBtn()
  check((await count('[data-testid="compat-warning"]')) === 0, '撤销：提示消失')

  // 数据节点打通方式改成接口：它的待打通线降为数据线，节点自己的待打通标记清掉
  await click(await screen(20 + 75, 780 + 32))
  await pick('f-method', '接口')
  check((await count('.react-flow__edge.fe-data[data-id="e0"]')) === 1 && (await fiveText()).includes('待打通 3') && (await text('[data-testid="f-flag"] [aria-checked="true"]')) === '正常', 'CRM 打通方式改接口：e0 降为数据线，待打通 4 → 3，状态变正常')
  await undoBtn()
  check((await count('.react-flow__edge.fe-pending[data-id="e0"]')) === 1 && (await fiveText()) === fiveBase, '撤销：线与数字都回来')

  // 删除三条路：面板按钮、Delete 键、浮条
  await click(await screen(360 + 75, 620 + 32))
  await clickSel('[data-testid="delete"]')
  check((await count('.react-flow__node')) === 18 && (await count('.react-flow__edge')) === 22 && (await mode()) === 'diag', '删除节点「不投 · 归档」：18 节点 / 22 线，面板回到诊断')
  await undoBtn()
  check((await count('.react-flow__node')) === 19 && (await count('.react-flow__edge')) === 23, '撤销：19 / 23')
  await clickEdge('e0')
  await key('Delete', 'Delete', 46)
  check((await count('.react-flow__edge')) === 22 && (await mode()) === 'diag', 'Delete 键删线：22 条')
  await undoBtn()
  await drag({ x: 350, y: 50 }, { x: 690, y: 270 }, 300)
  await clickSel('[data-testid="bar-delete"]')
  check((await count('.react-flow__node')) === 16 && (await count('.react-flow__edge')) === 14, '浮条「删除」：n3 / n5 / n6 连同 9 条线一起删，16 节点 / 14 线')
  await undoBtn()
  check((await count('.react-flow__node')) === 19 && (await count('.react-flow__edge')) === 23 && (await fiveText()) === fiveBase, '撤销一步：全部回来')

  // 关闭与重置
  await click(await screen(190 + 75, 500 + 32))
  await clickSel('[data-testid="close"]')
  check((await mode()) === 'diag' && (await pd<string[]>('selected()')).length === 0, '「关闭」：取消选中，面板回到诊断')
  await click(await screen(190 + 75, 500 + 32))
  await pick('f-flag', '正常')
  await clickSel('[data-testid="close"]')
  await clickSel('[data-testid="reset"]')
  check((await fiveText()) === fiveBase, '「重置示例」：回到示例')
  await undoBtn()
  check((await fiveText()).includes('卡点 1'), '重置也可撤销')

  // ---- S07 拖线：从输出端口拖到另一节点生成线；不合规的线变红、松手不连并提示原因；契约判定与 check-guards 同一份代码
  await cdp.navigate(`${BASE}/#/canvas`)
  await cdp.evaluate(PD_INSTALL)
  type Line = { stroke: string; dash: string; why: string } | null
  const port = async (id: string): Promise<P> => { const p = await pos(id); if (!p) throw new Error(`找不到节点 ${id}`); return { x: p.x + 150, y: p.y + 32 } }
  const body = async (id: string): Promise<P> => { const p = await pos(id); if (!p) throw new Error(`找不到节点 ${id}`); return { x: p.x + 75, y: p.y + 32 } }
  const edgeIds = () => pd<string[]>('edgeIds()')
  const toast = () => pd<string>('toast()')
  const connLine = () => pd<Line>('connLine()')
  const rgb = async (token: string) => (await cdp.evaluate(`(() => { const s = document.createElement('span'); s.style.color = getComputedStyle(document.documentElement).getPropertyValue('${token}').trim(); document.body.appendChild(s); const c = getComputedStyle(s).color; s.remove(); return c })()`)) as string
  const hi = await rgb('--color-hi'), amberRgb = await rgb('--color-amber')
  const legendText = () => text('[data-testid="edge-legend"]')

  const before = await edgeIds()
  let lineOk: Line = null
  await drag(await port('n8'), await body('n13'), 300, async () => { lineOk = await connLine() })
  const after = await edgeIds()
  const added = after.filter((id) => !before.includes(id))
  const lo = lineOk as Line
  check(after.length === 24 && added.join() === 'e23', 'n8 → n13 拖线成功：线数 23 → 24，新线编号接着往下（e23）', added.join())
  check(!!lo && lo.stroke !== hi && lo.why === '', '拖的过程中悬在合规节点上：线按将要生成的样子画，没有红字', lo ? `${lo.stroke} ${lo.why || '（无原因）'}` : '没抓到线')
  check((await toast()) === '已连线' && (await legendText()).includes('顺序15'), '松手：提示「已连线」，图例 顺序 15', await toast())
  await clickEdge('e23')
  check((await mode()) === 'edge' && (await pd<string>('value(\'[data-testid="f-label"]\')')) === '结构化产物' && (await text('[data-testid="f-dtype"] [aria-checked="true"]')) === '结构化' && (await text('[data-testid="f-kind"] [aria-checked="true"]')) === '顺序',
    '新线：顺序线，产物 = 工作狗的输出「结构化产物」', `${await pd<string>('value(\'[data-testid="f-label"]\')')} / ${await text('[data-testid="f-dtype"] [aria-checked="true"]')} / ${await text('[data-testid="f-kind"] [aria-checked="true"]')}`)
  await shot('s07-connected')
  await undoBtn()
  check((await edgeIds()).length === 23 && (await mode()) === 'diag', '撤销：线回到 23 条')

  // 决定类端口（人）拖到数据节点：红线 + 原因，松手不连
  let lineBad: Line = null
  await drag(await port('n1'), await body('s2'), 300, async () => { lineBad = await connLine(); await shot('s07-invalid') })
  const lb = lineBad as Line
  check(!!lb && lb.stroke === hi && lb.why.includes('决定类产物'), '商机进入（人 · 决定）拖到招标平台（数据）：线变红，原因跟着线', lb ? `${lb.stroke} · ${lb.why}` : '没抓到线')
  check((await edgeIds()).length === 23 && (await toast()).includes('决定类产物不能直接进数据节点'), '松手不连，提示原因', await toast())

  // 已经连过 / 连到自己
  let lineDup: Line = null
  await drag(await port('n1'), await body('n2'), 300, async () => { lineDup = await connLine() })
  const ld = lineDup as Line
  check(!!ld && ld.why === '已经连过了' && (await edgeIds()).length === 23 && (await toast()) === '已经连过了', '已经连过的一对：红线「已经连过了」，不连', ld?.why ?? '')
  const n1 = await pos('n1')
  let lineSelf: Line = null
  await drag(await port('n1'), { x: (n1?.x ?? 20) - 1, y: (n1?.y ?? 500) + 32 }, 300, async () => { lineSelf = await connLine() })
  const ls = lineSelf as Line
  check(!!ls && ls.why === '不能连到自己' && (await edgeIds()).length === 23, '拖回自己的输入端口：「不能连到自己」', ls?.why ?? '')

  // 待打通的数据节点出去：待打通线（蓝虚），产物 = 系统数据
  await drag(await port('s5'), await body('n12'), 300)
  check((await edgeIds()).length === 24 && (await count('.react-flow__edge.fe-pending[data-id="e23"]')) === 1 && (await toast()) === '已连线 · 标为待打通' && (await legendText()).includes('待打通5'),
    'OA 审批（待打通）→ 递交：生成待打通线，提示「已连线 · 标为待打通」，图例 待打通 5', await toast())
  await clickEdge('e23')
  check((await text('[data-testid="f-dtype"] [aria-checked="true"]')) === '系统数据', '新线的产物 = 数据节点的输出「系统数据」')
  await undoBtn()

  // 拖到空白松手：橡皮筋是琥珀虚线，松手什么都不发生（拖到空白新建是 S08）
  let lineFree: Line = null
  await drag(await port('n8'), { x: 900, y: 320 }, 300, async () => { lineFree = await connLine() })
  const lf = lineFree as Line
  check(!!lf && lf.stroke === amberRgb && lf.why === '' && (await edgeIds()).length === 23, '拖到空白：琥珀橡皮筋，松手不生成线', lf ? lf.stroke : '没抓到线')

  // ---- S08 快速添加：端口拖到空白弹组件搜索并连上；双击空白弹搜索；组件库拖入（数据类默认待打通，工作狗带子图）；新组件占位
  await cdp.navigate(`${BASE}/#/canvas`)
  await cdp.evaluate(PD_INSTALL)
  const quickOpen = () => count('[data-testid="quick"]')
  const placeholder = () => pd<string>('attr(\'[data-testid="quick-search"]\', "placeholder")')
  const typeQuick = async (q: string) => { await pd(`type('[data-testid="quick-search"]', ${JSON.stringify(q)})`); await sleep(150) }
  const dblclick = async (at: P) => {
    await mouse('mouseMoved', at, { button: 'none' })
    await mouse('mousePressed', at); await mouse('mouseReleased', at)
    await mouse('mousePressed', at, { clickCount: 2 }); await mouse('mouseReleased', at, { clickCount: 2 })
    await sleep(300)
  }
  const nodesN = () => count('.react-flow__node'), edgesN = () => count('.react-flow__edge')
  const paletteDrag = async (name: string, to: P, midway?: () => Promise<void>) => {
    const r = await pd<{ x: number; y: number } | null>(`center('[data-testid="palette"] [data-name=${JSON.stringify(name)}]')`)
    if (!r) throw new Error(`组件库里没有「${name}」`)
    const b = await screen(to.x, to.y)
    await mouse('mouseMoved', r, { button: 'none' })
    await mouse('mousePressed', r)
    await sleep(30)
    await mouse('mouseMoved', { x: r.x + 40, y: r.y }, { buttons: 1 })
    await sleep(30)
    await mouse('mouseMoved', b, { buttons: 1 })
    await sleep(80)
    if (midway) await midway()
    await mouse('mouseReleased', b)
    await sleep(300)
  }

  // 端口拖到空白 → 弹层 → 搜「联网」→ 点选：节点 +1 且已连上，一步撤销
  await drag(await port('n6'), { x: 790, y: 330 }, 300)
  check((await quickOpen()) === 1 && (await placeholder()).includes('素材检索'), '从 n6 端口拖到空白：弹出组件搜索，提示「接在「素材检索」之后…」', await placeholder())
  await typeQuick('联网')
  check((await count('[data-testid="quick"] .quick__item')) === 1 && (await text('[data-testid="quick"] .quick__item')).includes('联网检索'), '输入即过滤：只剩「联网检索」')
  await shot('s08-quick')
  await clickSel('[data-testid="quick"] .quick__item')
  const np1 = await pos('x1')
  check((await nodesN()) === 20 && (await edgesN()) === 24 && near(np1, 797, 337, 8) && (await pd<string>('nodeText("x1", "fnode__name")')) === '联网检索' && (await pd<string[]>('selected()')).join() === 'x1',
    '选「联网检索」：节点 20 / 线 24，新节点 x1 的左上角就是松手点（与原型一致）、选中，两个动作加了一个连好线的节点', `${fmt(np1)} · ${await toast()}`)
  check((await toast()) === '已新建「联网检索」并连上' && (await quickOpen()) === 0, '提示「已新建「联网检索」并连上」，弹层关闭')
  await undoBtn()
  check((await nodesN()) === 19 && (await edgesN()) === 23, '撤销一步：节点和线一起回去')

  // 端口拖到空白但离端口太近：不弹（用右边没有邻居的 n13，免得落到别的节点身上）
  const p13 = await port('n13')
  await drag(p13, { x: p13.x + 3, y: p13.y + 1 }, 300)
  check((await quickOpen()) === 0 && (await edgesN()) === 23, '离端口不到 24px 就松手：不当作「拖到空白新建」，也不连线', `${await edgesN()} 线`)

  // 双击空白 → 弹层 → 搜「人审」→ 选：人节点落进人泳道（双击点在 AI 泳道）
  await dblclick(await screen(300, 300))
  check((await quickOpen()) === 1 && (await placeholder()).startsWith('搜组件'), '双击空白：弹出组件搜索', await placeholder())
  await typeQuick('人审')
  await clickSel('[data-testid="quick"] .quick__item')
  const np2 = await pos('x1'), np2n = await nodesN(), np2e = await edgesN(), np2r = await pd<string>('nodeText("x1", "fnode__role")'), np2f = await fiveText()
  check(np2n === 20 && np2e === 23 && !!np2 && np2.y === 440 && np2r === '人审' && np2f.includes('人 8'),
    '选「人审」：人节点新建在人泳道顶（双击点在 AI 泳道也归到人泳道），人 7 → 8', `${fmt(np2)} · ${np2n} 节点 / ${np2e} 线 · 角色「${np2r}」· ${np2f} · ${await toast()}`)
  await undoBtn()

  // Esc 关弹层；点空白关弹层
  await dblclick(await screen(300, 300))
  await key('Escape', 'Escape', 27)
  check((await quickOpen()) === 0, 'Esc：弹层关闭')
  await dblclick(await screen(300, 300))
  await click(await screen(900, 930))
  check((await quickOpen()) === 0, '点空白：弹层关闭')

  // 组件库拖入：CRM（数据）拖到 AI 泳道 → 归到数据泳道、默认待打通；拖的过程中有幽灵节点
  let ghost = 0
  await paletteDrag('CRM', { x: 300, y: 300 }, async () => { ghost = await count('[data-testid="ghost"]'); await shot('s08-ghost') })
  const np3 = await pos('x1')
  check(ghost === 1, '拖的过程中幽灵节点跟着指针')
  check((await nodesN()) === 20 && !!np3 && np3.y === 720 && (await fiveText()).includes('待打通 5') && (await toast()) === '已加入「CRM」· 默认待打通',
    '拖入 CRM：落进数据泳道顶、默认待打通（4 → 5）', `${fmt(np3)} · ${await toast()}`)
  await undoBtn()
  await paletteDrag('合同审查', { x: 600, y: 300 })
  check((await nodesN()) === 20 && (await pd<string>('nodeText("x1", "fnode__kids")')) === '7 环节 · 双击打开', '拖入工作狗「合同审查」：带 7 环节的子图', await pd<string>('nodeText("x1", "fnode__kids")'))
  await undoBtn()
  await paletteDrag('联网检索', { x: 1500, y: 300 })
  check((await nodesN()) === 19, '拖到画布外松手：取消，不新建')

  // 组件库搜索、新组件占位
  await pd(`type('[data-testid="palette-search"]', '检索')`); await sleep(150)
  check((await count('[data-testid="palette"] .pal__item')) === 2, '组件库搜索「检索」：只剩联网检索、素材检索', `${await count('[data-testid="palette"] .pal__item')} 项`)
  await pd(`type('[data-testid="palette-search"]', '')`); await sleep(150)
  await clickSel('[data-testid="palette-new"]')
  check((await nodesN()) === 20 && (await pd<string>('nodeText("x1", "fnode__name")')) === '新组件（待定义）' && (await fiveText()).includes('缺口 2'), '「新组件（占位缺口）」：加一个标缺口的占位节点，缺口 1 → 2')
  await undoBtn()
  check((await nodesN()) === 19 && (await fiveText()) === fiveBase, '撤销：回到示例')

  // ---- S09 泳道语义与角色切换：跨泳道改角色 / 类型 / 标记并提示；撞边提示；角色徽章循环；受保护；右键菜单
  await cdp.navigate(`${BASE}/#/canvas`)
  await cdp.evaluate(PD_INSTALL)
  const rightClick = async (at: P) => {
    await mouse('mouseMoved', at, { button: 'none' })
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: at.x, y: at.y, button: 'right', clickCount: 1 })
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: at.x, y: at.y, button: 'right', clickCount: 1 })
    await sleep(250)
  }
  const menuOpen = () => count('[data-testid="context-menu"]')
  const menuPick = async (label: string) => { await pd(`menuPick(${JSON.stringify(label)})`); await sleep(200) }
  const badge = (id: string, cls: string) => pd<string>(`nodeText(${JSON.stringify(id)}, ${JSON.stringify(cls)})`)
  const badgeAt = async (id: string) => { const r = await pd<P | null>(`at('.react-flow__node[data-id="${id}"] .fnode__role')`); if (!r) throw new Error(`${id} 没有角色徽章`); return r }
  const baseFive = await fiveText()

  await drag(center(360, 620), center(360, 200))
  const l1 = await pos('n14')
  check(!!l1 && l1.y < 440 && (await badge('n14', 'fnode__kind')) === '技能' && (await badge('n14', 'fnode__role')) === '自动' && (await badge('n14', 'fnode__flag')) === '缺口',
    '把「不投 · 归档」拖进 AI 泳道：变技能、自动、标缺口', `${fmt(l1)} · ${await badge('n14', 'fnode__kind')} / ${await badge('n14', 'fnode__role')} / ${await badge('n14', 'fnode__flag')}`)
  check((await toast()).includes('标为要自动化') && (await fiveText()).includes('自动 8') && (await fiveText()).includes('人 6') && (await fiveText()).includes('缺口 2'),
    '提示「标为要自动化：还缺一个组件来做它」，自动 8 · 人 6 · 缺口 2', `${await toast()} · ${await fiveText()}`)
  check((await pd<string>('value(\'[data-testid="f-sub"]\')')).startsWith('原：'), '面板说明记着「原：人做 · 待配组件」', await pd<string>('value(\'[data-testid="f-sub"]\')'))
  await shot('s09-lane')
  await undoBtn()
  check((await badge('n14', 'fnode__kind')) === '人' && (await badge('n14', 'fnode__role')) === '人定' && (await count('.react-flow__node[data-id="n14"] .fnode__flag')) === 0 && (await fiveText()) === baseFive, '撤销：位置和语义一起回去')

  await drag(center(530, 200), center(530, 560))
  check((await badge('n6', 'fnode__role')) === '人审' && (await badge('n6', 'fnode__kind')) === '技能' && (await toast()) === '「素材检索」改为人审', '把技能「素材检索」拖进人泳道：改人审，类型不变', `${await badge('n6', 'fnode__role')} · ${await toast()}`)
  await undoBtn()
  check((await badge('n6', 'fnode__role')) === '自动', '撤销：回到自动')

  await drag(center(1040, 500), center(1040, 200))
  const l3 = await pos('n12')
  check(!!l3 && l3.y === 440 && (await badge('n12', 'fnode__role')) === '人定' && (await toast()).includes('不能改成自动'), '受保护的「递交」往 AI 泳道拖：挡在人泳道顶，仍是人定，提示为什么', `${fmt(l3)} · ${await toast()}`)
  await undoBtn()
  await drag(center(20, 780), center(20, 300))
  const l4 = await pos('s1')
  check(!!l4 && l4.y === 720 && (await toast()) === '系统节点留在「数据与系统」泳道', '数据节点往上拖：挡在数据泳道顶并提示', `${fmt(l4)} · ${await toast()}`)
  await undoBtn()
  await drag(center(700, 500), center(700, 900))
  const l5 = await pos('n9')
  check(!!l5 && l5.y === 656 && (await toast()) === '步骤节点不能放进数据泳道', '步骤节点往数据泳道拖：挡在人泳道底并提示', `${fmt(l5)} · ${await toast()}`)
  await undoBtn()

  await click(await badgeAt('n9'))
  check((await badge('n9', 'fnode__role')) === '自动' && (await toast()) === '谁来做 → 自动', '点「报价」的角色徽章：人定 → 自动', `${await badge('n9', 'fnode__role')} · ${await toast()}`)
  await click(await badgeAt('n9'))
  check((await badge('n9', 'fnode__role')) === '人审', '再点：自动 → 人审')
  await undoBtn(2)
  check((await badge('n9', 'fnode__role')) === '人定', '撤销两步：回到人定')
  await click(await badgeAt('n12'))
  check((await badge('n12', 'fnode__role')) === '人定' && (await toast()).includes('受保护'), '受保护的「递交」点徽章：不动，只提示', await toast())

  await rightClick(await screen(190 + 75, 500 + 32))
  const menuLabelsOf = async () => (await cdp.evaluate(`[...document.querySelectorAll('[data-testid="context-menu"] button')].map((b) => b.textContent)`)) as string[] | undefined
  const menuLabels = (await menuLabelsOf()) ?? []
  check((await menuOpen()) === 1 && menuLabels.join(',') === '改为自动,改为人审,改为人定,标为卡点,标为缺口,标为待打通,清除标记,删除', '右键「获取招标文件」：菜单贴光标，改谁来做 / 标记状态 / 删除', menuLabels.join(' · '))
  await shot('s09-menu')
  await menuPick('改为人审')
  check((await badge('n2', 'fnode__role')) === '人审' && (await menuOpen()) === 0, '菜单「改为人审」：徽章变人审，菜单关')
  await rightClick(await screen(190 + 75, 500 + 32))
  await menuPick('标为缺口')
  check((await badge('n2', 'fnode__flag')) === '缺口' && (await fiveText()).includes('卡点 1') && (await fiveText()).includes('缺口 2'), '菜单「标为缺口」：卡点 2 → 1，缺口 1 → 2')
  await rightClick(await screen(190 + 75, 500 + 32))
  await menuPick('删除')
  check((await count('.react-flow__node')) === 18, '菜单「删除」：18 节点')
  await undoBtn(3)
  check((await count('.react-flow__node')) === 19 && (await badge('n2', 'fnode__role')) === '人定' && (await badge('n2', 'fnode__flag')) === '卡点' && (await fiveText()) === baseFive, '撤销三步：全部回去')
  await rightClick(await screen(190 + 75, 500 + 32))
  await key('Escape', 'Escape', 27)
  check((await menuOpen()) === 0, 'Esc：菜单关')
  await rightClick(await screen(1040 + 75, 500 + 32))
  check((await count('[data-testid="context-menu"] button:disabled')) === 2, '受保护节点的菜单：改为自动 / 人审 灰掉')
  await key('Escape', 'Escape', 27)
  await drag({ x: 350, y: 50 }, { x: 690, y: 270 }, 300)
  await rightClick(await screen(530 + 75, 60 + 32))
  const multiLabel = ((await menuLabelsOf()) ?? []).find((l) => l.startsWith('删除所选'))
  check(multiLabel === '删除所选（3）', '框选三个再右键：「删除所选（3）」', multiLabel ?? '')
  await menuPick('删除所选（3）')
  check((await count('.react-flow__node')) === 16, '删除所选：16 节点')
  await undoBtn()
  check((await count('.react-flow__node')) === 19 && (await fiveText()) === baseFive, '撤销：回到示例')

  check(cdp.errors.length === 0, '浏览器控制台没有报错', cdp.errors.slice(0, 2).join(' | '))
  cdp.close()
} finally {
  chrome?.kill()
  preview?.kill()
}

console.log(failed ? `\n${failed} 项没过` : '\n浏览器验收全部通过')
process.exit(failed ? 1 : 0)
