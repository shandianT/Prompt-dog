/**
 * 反向测试：故意把流程图改坏，确认每道检查真的会报错。
 * 一个从不失败的校验器等于没有校验器——这个脚本就是防这件事。
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { validateFlow } from '../src/flow/validate'
import { checkCompat, checkRefs } from '../src/flow/compat'
import { connectionProblem, newEdge } from '../src/flow/connect'
import { applyLaneRule, borderMessage } from '../src/flow/laneRule'
import type { Flow, FlowNode, FlowEdge } from '../src/flow/types'

const samplePath = fileURLToPath(new URL('../sample/投标流程.json', import.meta.url))
const good = JSON.parse(readFileSync(samplePath, 'utf8')) as Flow
const clone = (): Flow => JSON.parse(JSON.stringify(good)) as Flow
const node = (f: Flow, id: string): FlowNode => {
  const n = f.nodes.find((x) => x.id === id)
  if (!n) throw new Error(`示例里没有节点 ${id}`)
  return n
}
const edge = (f: Flow, id: string): FlowEdge => {
  const e = f.edges.find((x) => x.id === id)
  if (!e) throw new Error(`示例里没有连线 ${id}`)
  return e
}

type Case = { name: string; break: (f: Flow) => void; detect: (f: Flow) => boolean }

const cases: Case[] = [
  {
    name: 'schema · 未知字段被拦下',
    break: (f) => { (node(f, 'n1') as unknown as Record<string, unknown>).颜色 = '红' },
    detect: (f) => !validateFlow(f).ok,
  },
  {
    name: 'schema · 枚举外的取值被拦下',
    break: (f) => { (node(f, 'n1') as unknown as Record<string, unknown>).kind = 'robot' },
    detect: (f) => !validateFlow(f).ok,
  },
  {
    name: 'schema · 缺必填字段被拦下',
    break: (f) => { delete (node(f, 'n1') as Partial<FlowNode>).name },
    detect: (f) => !validateFlow(f).ok,
  },
  {
    name: '引用 · 连线指向不存在的节点',
    break: (f) => { edge(f, 'e1').to = 'n999' },
    detect: (f) => checkRefs(f).length > 0,
  },
  {
    name: '规则 1 · 决定类产物直连数据节点',
    break: (f) => { f.edges.push({ id: 'ebad', from: 'n4', to: 's1', kind: 'seq', dtype: 'decision', label: '投不投' }) },
    detect: (f) => checkCompat(f).some((x) => x.rule === 0),
  },
  {
    name: '规则 2 · 数据节点跑出数据泳道',
    break: (f) => { node(f, 's1').y = 100 },
    detect: (f) => checkCompat(f).some((x) => x.rule === 1),
  },
  {
    name: '规则 3 · 受保护的人工确认点被改成自动',
    break: (f) => { const n = node(f, 'n12'); n.kind = 'skill'; n.role = 'auto' },
    detect: (f) => checkCompat(f).some((x) => x.rule === 2),
  },
  {
    name: '规则 3 · 给受保护节点一个变自动的目标态',
    break: (f) => { node(f, 'n12').target = { role: 'auto' } },
    detect: (f) => checkCompat(f).some((x) => x.rule === 2),
  },
  {
    name: '规则 4 · 待打通的线两端都不是数据节点',
    break: (f) => { edge(f, 'e0').from = 'n1'; edge(f, 'e0').to = 'n2' },
    detect: (f) => checkCompat(f).some((x) => x.rule === 3),
  },
  {
    name: '规则 4 · 已接口化却还挂着待打通',
    break: (f) => { node(f, 's1').method = 'api' },
    detect: (f) => checkCompat(f).some((x) => x.rule === 3),
  },
]

let failed = 0
// 先确认好样本是干净的，否则下面的「检出」可能是本来就有的问题
const baseClean = validateFlow(good).ok && checkRefs(good).length === 0 && checkCompat(good).length === 0
if (!baseClean) {
  console.error('✗ 基线不干净：未改动的示例本身就报错，反向测试无意义')
  process.exit(1)
}
console.log('基线干净：未改动的示例全过\n')

for (const c of cases) {
  const f = clone()
  c.break(f)
  const caught = c.detect(f)
  console.log(`${caught ? '✓' : '✗'} ${c.name}`)
  if (!caught) failed += 1
}

// 连线判定（S07）：什么能连、连出来是什么线
const connects: { name: string; ok: boolean }[] = [
  { name: '连线 · n8 → n13 合规，生成顺序线 / 结构化产物 / e23', ok: connectionProblem(good, 'n8', 'n13') === null && (() => { const e = newEdge(good, 'n8', 'n13'); return e.kind === 'seq' && e.dtype === 'struct' && e.label === '结构化产物' && e.id === 'e23' })() },
  { name: '连线 · 决定类端口（人）拖到数据节点被拦（规则 1）', ok: (connectionProblem(good, 'n1', 's2') ?? '').includes('决定类产物') },
  { name: '连线 · 已经连过的不再连', ok: connectionProblem(good, 'n1', 'n2') === '已经连过了' },
  { name: '连线 · 不能连到自己', ok: connectionProblem(good, 'n1', 'n1') === '不能连到自己' },
  { name: '连线 · 待打通的数据节点出去是待打通线', ok: newEdge(good, 's5', 'n12').kind === 'pending' },
  { name: '连线 · 已打通的数据节点（缺口但非待打通）出去是数据线、产物系统数据', ok: newEdge(good, 's3', 'n7').kind === 'data' && newEdge(good, 's3', 'n7').dtype === 'sys' },
]
console.log('')
for (const c of connects) { console.log(`${c.ok ? '✓' : '✗'} ${c.name}`); if (!c.ok) failed += 1 }

// 泳道语义（S09，SPEC §6.6）
const lanes: { name: string; ok: boolean }[] = [
  { name: '泳道 · 人的步骤拖进 AI 泳道：变技能、自动、标缺口、记原：人做', ok: (() => { const o = applyLaneRule({ ...node(good, 'n14'), y: 200 }); return o.node.kind === 'skill' && o.node.role === 'auto' && o.node.flag === 'missing' && o.node.was === 'human' && (o.node.sub ?? '').startsWith('原：') && !!o.message?.includes('要自动化') })() },
  { name: '泳道 · AI 节点拖进人泳道：改人审，类型不变', ok: (() => { const o = applyLaneRule({ ...node(good, 'n6'), y: 560 }); return o.node.kind === 'skill' && o.node.role === 'review' && o.message === '「素材检索」改为人审' })() },
  { name: '泳道 · 受保护的人定节点不会被改（就算 y 落在 AI 泳道）', ok: (() => { const o = applyLaneRule({ ...node(good, 'n12'), y: 200 }); return o.node.kind === 'human' && o.node.role === 'decide' && !o.message })() },
  { name: '泳道 · 数据节点撞在数据泳道顶：只提示', ok: borderMessage({ ...node(good, 's1'), y: 720 }, 780) === '系统节点留在「数据与系统」泳道' && borderMessage({ ...node(good, 's1'), y: 720 }, 720) === undefined },
  { name: '泳道 · 步骤节点撞在人泳道底：只提示', ok: borderMessage({ ...node(good, 'n9'), y: 656 }, 500) === '步骤节点不能放进数据泳道' },
]
for (const c of lanes) { console.log(`${c.ok ? '✓' : '✗'} ${c.name}`); if (!c.ok) failed += 1 }

console.log(failed ? `\n${failed} 道检查形同虚设` : `\n${cases.length + connects.length + lanes.length} 道检查全部能抓到问题`)
process.exit(failed ? 1 : 0)
