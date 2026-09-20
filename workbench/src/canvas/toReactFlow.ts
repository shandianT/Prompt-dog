import type { Edge, Node } from '@xyflow/react'
import type { Flow, FlowNode, FlowEdge } from '../flow'
import { NODE_H, NODE_W } from '../flow'

/**
 * flow.schema.json 的节点 / 连线 → React Flow 的节点 / 连线。
 * 我们的数据结构就是契约本身，不为画布另存一份：RF 节点的 data 里原样放 FlowNode，
 * 画布上改了什么，改的就是契约对象。
 */
export type FlowRFNode = Node<{ node: FlowNode }, 'flow'>
export type FlowRFEdge = Edge<{ edge: FlowEdge }, 'flow'>

export function toRFNodes(flow: Flow): FlowRFNode[] {
  return flow.nodes.map((node) => ({
    id: node.id,
    type: 'flow',
    position: { x: node.x ?? 0, y: node.y ?? 0 },
    data: { node },
    // 先告诉 RF 尺寸，fitView 首帧就能算对，不用等 DOM 量完
    width: NODE_W,
    height: NODE_H,
  }))
}

export function toRFEdges(flow: Flow): FlowRFEdge[] {
  return flow.edges.map((edge) => ({
    id: edge.id,
    type: 'flow',
    source: edge.from,
    target: edge.to,
    data: { edge },
    // 落到 <g class> 上，验收脚本按种类数线用
    className: `fe-${edge.kind}`,
  }))
}
