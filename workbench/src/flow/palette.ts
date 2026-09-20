import type { Flow, FlowEdge, FlowNode, NodeFlag, NodeKind, NodeRole } from './types'
import { CANVAS_H, CANVAS_W, LANE_DATA_TOP, LANE_HUMAN_TOP, NODE_H, NODE_W } from './lanes'

/** 组件库的一项（sample/组件库.json，由 flow.py 的 PALETTE 导出） */
export interface PaletteItem {
  kind: NodeKind
  name: string
  sub?: string
  role?: NodeRole
  flag?: NodeFlag
  /** 工作狗才有：子图 */
  children?: FlowNode[]
  childEdges?: FlowEdge[]
}
export interface PaletteGroup { title: string; sub?: string; items: PaletteItem[] }

/** 「新组件（占位缺口）」：先占个位，标缺口，等你说清它要做什么 */
export const PLACEHOLDER_ITEM: PaletteItem = { kind: 'skill', name: '新组件（待定义）', sub: '缺口 · 说清它要做什么', flag: 'missing' }

/** 画布上加的节点 id：x1、x2 …（n / s 是示例自带的） */
export function nextNodeId(flow: Flow): string {
  let max = 0
  for (const n of flow.nodes) { const m = /^x(\d+)$/.exec(n.id); if (m) max = Math.max(max, Number(m[1])) }
  return `x${max + 1}`
}

/** 新节点落在哪条泳道（按种类）：数据 → 数据泳道；人 → 人泳道；其余 → AI 泳道。跨泳道的语义是 S09 的事 */
export function laneBandFor(kind: NodeKind): [number, number] {
  if (kind === 'data') return [LANE_DATA_TOP, CANVAS_H - NODE_H]
  if (kind === 'human') return [LANE_HUMAN_TOP, LANE_DATA_TOP - NODE_H]
  return [0, LANE_HUMAN_TOP - NODE_H]
}

/**
 * 从组件库的一项造一个节点，中心尽量落在 (cx, cy)，与原型 addNode 同一套默认值：
 * 数据类默认待打通（打通方式人工、方向读、「怎么解」写着定打通方式）；人带角色；know-how 的来源 = 它的说明；工作狗带子图（子节点 id 加前缀）。
 * 落点按种类归入对应泳道的带内，不出画布——这样加完的图仍过 x-compat 规则 2。
 */
export function newNode(flow: Flow, item: PaletteItem, cx: number, cy: number): FlowNode {
  const id = nextNodeId(flow)
  const isData = item.kind === 'data'
  const [y0, y1] = laneBandFor(item.kind)
  const node: FlowNode = {
    id, kind: item.kind, role: isData ? '' : (item.role ?? 'auto'), name: item.name, sub: item.sub ?? '',
    x: Math.round(Math.min(Math.max(cx - NODE_W / 2, 0), CANVAS_W - NODE_W)),
    y: Math.round(Math.min(Math.max(cy - NODE_H / 2, y0), y1)),
    flag: isData ? 'pending' : (item.flag ?? 'ok'), was: 'new', reuse: 1,
  }
  if (isData) { node.fix = '定打通方式（接口 / RPA / 文件），打通后把状态改为正常。'; node.method = 'manual'; node.dir = 'read' }
  if (item.kind === 'human') node.notify = '企业微信'
  if (item.kind === 'know') node.src = item.sub ?? ''
  if (item.children?.length) {
    node.children = item.children.map((c) => ({ ...c, id: `${id}_${c.id}` }))
    node.childEdges = (item.childEdges ?? []).map((e) => ({ ...e, id: `${id}_${e.id}`, from: `${id}_${e.from}`, to: `${id}_${e.to}` }))
  }
  return node
}
