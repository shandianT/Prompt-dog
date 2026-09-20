import { useCallback, useMemo, type ReactNode } from 'react'
import {
  ReactFlow, Background, BackgroundVariant, Controls,
  useNodesState, useEdgesState, type NodeTypes, type EdgeTypes, type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './canvas.css'
import type { Flow } from '../flow'
import { FlowNodeRF } from './FlowNodeRF'
import { FlowEdgeRF } from './FlowEdgeRF'
import { EdgeMarkers } from './EdgeMarkers'
import { Lanes } from './Lanes'
import { CanvasOptions } from './options'
import { toRFEdges, toRFNodes, type FlowRFEdge, type FlowRFNode } from './toReactFlow'
import { fitFrame } from './viewport'

/** 缩放范围按 SPEC §6.1：50%–160% */
export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 1.6

const nodeTypes: NodeTypes = { flow: FlowNodeRF }
const edgeTypes: EdgeTypes = { flow: FlowEdgeRF }

/**
 * 流程画布本体。S03 泳道 + 节点定位 + 平移缩放；S04 五种连线与标签。
 * 首帧取景到整幅画布（viewport.ts），所以关掉了 Controls 自带的「适应」——它按节点外框取景，会裁掉贴边绕的回填线。
 * 还不能拖节点（S05 加移动与撤销，S09 加泳道规则——没有规则的拖动会让数据节点跑出数据泳道）。
 */
export function FlowCanvas({ flow, labels = false, children }: { flow: Flow; labels?: boolean; children?: ReactNode }) {
  const initialNodes = useMemo(() => toRFNodes(flow), [flow])
  const initialEdges = useMemo(() => toRFEdges(flow), [flow])
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const onInit = useCallback((inst: ReactFlowInstance<FlowRFNode, FlowRFEdge>) => { void fitFrame(inst) }, [])

  return (
    <CanvasOptions.Provider value={{ labels }}>
    <ReactFlow
      className="flow-canvas"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      elevateEdgesOnSelect
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={ZOOM_MIN}
      maxZoom={ZOOM_MAX}
      onInit={onInit}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      selectNodesOnDrag={false}
    >
      <EdgeMarkers />
      <Lanes />
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#dfe3ea" />
      <Controls showInteractive={false} showFitView={false} position="bottom-right" />
      {children}
    </ReactFlow>
    </CanvasOptions.Provider>
  )
}
