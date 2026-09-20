import { useCallback, type ReactNode } from 'react'
import {
  ReactFlow, Background, BackgroundVariant, Controls, SelectionMode, useConnection,
  type NodeTypes, type EdgeTypes, type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './canvas.css'
import { FlowNodeRF } from './FlowNodeRF'
import { FlowEdgeRF } from './FlowEdgeRF'
import { ConnectionLineRF } from './ConnectionLineRF'
import { EdgeMarkers } from './EdgeMarkers'
import { Lanes } from './Lanes'
import { CanvasOptions } from './options'
import type { FlowRFEdge, FlowRFNode } from './toReactFlow'
import type { FlowEditor } from './useFlowEditor'
import { fitFrame } from './viewport'

/** 缩放范围按 SPEC §6.1：50%–160% */
export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 1.6

const nodeTypes: NodeTypes = { flow: FlowNodeRF }
const edgeTypes: EdgeTypes = { flow: FlowEdgeRF }

/**
 * 流程画布本体。S03 泳道 + 节点定位 + 平移缩放；S04 五种连线与标签；S05 选中 / 拖动 / 框选；S07 从输出端口拖线。
 * 状态不在这里：nodes / edges 与所有改动都来自 useFlowEditor，这里只负责把 React Flow 配成规范要的样子。
 * 首帧取景到整幅画布（viewport.ts），所以关掉了 Controls 自带的「适应」——它按节点外框取景，会裁掉贴边绕的回填线。
 *
 * 操作约定（SPEC §6.4）：空白处拖 = 框选（相交即选中）；拖节点 = 移动，选中的一起动，锁在各自泳道内（S09 放开）；
 * Shift / Cmd / Ctrl + 点 = 加选。平移：按住空格拖、中键或右键拖；滚轮仍是缩放（S03 定的，等真人用过再议）。
 * Delete / Backspace 由 useFlowEditor 的快捷键处理（RF 自带的 deleteKeyCode 关掉：不然删两次，而且它那次不进撤销栈）；节点拖动 3px 起算，点一下不会抖成一步撤销。
 */
export function FlowCanvas({ editor, labels = false, children }: { editor: FlowEditor; labels?: boolean; children?: ReactNode }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onNodeDragStop, onSelectionStart, onSelectionEnd, isValidConnection, onConnect, onConnectEnd } = editor
  const onInit = useCallback((inst: ReactFlowInstance<FlowRFNode, FlowRFEdge>) => { void fitFrame(inst) }, [])
  // 拖线中给容器加个类：节点整块的落点 Handle 只在这时接指针事件
  const connecting = useConnection((c) => c.inProgress)

  return (
    <CanvasOptions.Provider value={{ labels, flow: editor.flow }}>
    <ReactFlow
      className={`flow-canvas${connecting ? ' flow-canvas--connecting' : ''}`}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      elevateEdgesOnSelect
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={onNodeDragStop}
      onSelectionStart={onSelectionStart}
      onSelectionEnd={onSelectionEnd}
      minZoom={ZOOM_MIN}
      maxZoom={ZOOM_MAX}
      onInit={onInit}
      nodesDraggable
      nodeDragThreshold={3}
      nodesConnectable
      connectionLineComponent={ConnectionLineRF}
      isValidConnection={isValidConnection}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      elementsSelectable
      selectionOnDrag
      selectionMode={SelectionMode.Partial}
      panOnDrag={[1, 2]}
      multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
      deleteKeyCode={null}
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
