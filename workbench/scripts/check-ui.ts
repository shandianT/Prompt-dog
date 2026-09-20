/**
 * 在真浏览器里验收组件，而不是靠肉眼看截图。
 * 自己起 vite preview，用 CDP 读计算样式，逐条断言 SPEC §6.3 的视觉编码，跑完关掉。
 *
 *   npm run check:ui
 *
 * 颜色不写死十六进制：从 :root 上解析同一个 token 再比，所以「组件里偷偷写了个相近的颜色」也会被抓到。
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { NODE_FLAGS, NODE_KINDS } from '../src/flow'

const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
const PORT = Number(process.env.UI_PORT ?? 4183)
const BASE = `http://localhost:${PORT}`
const ROLES_IN_MATRIX = 3

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

  check(cdp.errors.length === 0, '浏览器控制台没有报错', cdp.errors.slice(0, 2).join(' | '))
  cdp.close()
} finally {
  chrome?.kill()
  preview?.kill()
}

console.log(failed ? `\n${failed} 项没过` : '\n浏览器验收全部通过')
process.exit(failed ? 1 : 0)
