import { useMemo } from 'react'
import {
  ReactFlow, Background, BackgroundVariant, Controls,
  useNodesState, useEdgesState, type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './canvas.css'
import type { Flow } from '../flow'
import { FlowNodeRF } from './FlowNodeRF'
import { Lanes } from './Lanes'
import { toRFEdges, toRFNodes } from './toReactFlow'

/** 缩放范围按 SPEC §6.1：50%–160% */
export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 1.6

const nodeTypes: NodeTypes = { flow: FlowNodeRF }

/**
 * 流程画布本体。S03：泳道 + 节点定位 + 平移缩放。
 * 还不能拖节点（S05 加移动与撤销，S09 加泳道规则——没有规则的拖动会让数据节点跑出数据泳道）。
 * 连线暂用素线，S04 换成五种 FlowEdge。
 */
export function FlowCanvas({ flow }: { flow: Flow }) {
  const initialNodes = useMemo(() => toRFNodes(flow), [flow])
  const initialEdges = useMemo(() => toRFEdges(flow), [flow])
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <ReactFlow
      className="flow-canvas"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={ZOOM_MIN}
      maxZoom={ZOOM_MAX}
      fitView
      fitViewOptions={{ padding: 0.06 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      selectNodesOnDrag={false}
      defaultEdgeOptions={{ type: 'default' }}
    >
      <Lanes />
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#dfe3ea" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  )
}
