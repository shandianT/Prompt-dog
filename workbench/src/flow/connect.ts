import type { DataType, EdgeKind, Flow, FlowEdge } from './types'
import { OUTPUT_TYPE } from './ports'
import { DEF_LABEL } from './labels'

/**
 * 连线的契约判定（S07）。画布拖线时逐帧问、松手时再问一次；不依赖浏览器，check-guards 也能跑。
 * 连不上的只有三种：连到自己、已经连过、决定类产物直接进数据节点（x-compat 规则 1）。
 * 其余组合都合法——数据节点收结构化产物（回填）、技能收系统数据（读库）都是正常流程。
 */
export function connectionProblem(flow: Flow, from: string, to: string): string | null {
  if (from === to) return '不能连到自己'
  const a = flow.nodes.find((n) => n.id === from), b = flow.nodes.find((n) => n.id === to)
  if (!a || !b) return '找不到节点'
  if (flow.edges.some((e) => e.from === from && e.to === to)) return '已经连过了'
  if (OUTPUT_TYPE[a.kind] === 'decision' && b.kind === 'data') return '决定类产物不能直接进数据节点（契约规则 1）：先经一个步骤，或由人把决定录进系统'
  return null
}

/**
 * 新线长什么样，与原型 addEdge 同一套规则：
 * 两端有数据节点 → 数据线；那个数据节点还在待打通 → 待打通线（蓝虚）；否则顺序线。产物 = 来源节点的输出类型，标签用默认叫法。
 */
export function newEdge(flow: Flow, from: string, to: string): FlowEdge {
  const a = flow.nodes.find((n) => n.id === from), b = flow.nodes.find((n) => n.id === to)
  const touchesData = a?.kind === 'data' || b?.kind === 'data'
  const kind: EdgeKind = touchesData ? (a?.flag === 'pending' || b?.flag === 'pending' ? 'pending' : 'data') : 'seq'
  const dtype: DataType = a ? OUTPUT_TYPE[a.kind] : 'struct'
  return { id: nextEdgeId(flow), from, to, kind, label: DEF_LABEL[dtype], dtype }
}

/** e0、e1 … 往后接着编：现有最大编号 + 1 */
export function nextEdgeId(flow: Flow): string {
  let max = -1
  for (const e of flow.edges) { const m = /^e(\d+)$/.exec(e.id); if (m) max = Math.max(max, Number(m[1])) }
  return `e${max + 1}`
}
