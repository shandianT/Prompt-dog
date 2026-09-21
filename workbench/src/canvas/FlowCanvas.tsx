import { useCallback, type ReactNode } from 'react'
import {
  ReactFlow, Background, BackgroundVariant, Controls, SelectionMode, useConnection, useReactFlow,
  type NodeTypes, type EdgeTypes, type OnConnectEnd, type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './canvas.css'
import { FlowNodeRF } from './FlowNodeRF'
import { FlowEdgeRF } from './FlowEdgeRF'
import { ConnectionLineRF } from './ConnectionLineRF'
import { EdgeMarkers } from './EdgeMarkers'
import { Lanes } from './Lanes'
import { CanvasOptions } from './options'
import { NODE_H, NODE_W } from '../flow'
import type { FlowRFEdge, FlowRFNode } from './toReactFlow'
import type { FlowEditor } from './useFlowEditor'
import { fitFrame } from './viewport'

/** 缩放范围按 SPEC §6.1：50%–160% */
export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 1.6

const nodeTypes: NodeTypes = { flow: FlowNodeRF }
const edgeTypes: EdgeTypes = { flow: FlowEdgeRF }

/**
 * 流程画布本体。S03 泳道 + 节点定位 + 平移缩放；S04 五种连线与标签；S05 选中 / 拖动 / 框选；S07 从输出端口拖线；S08 双击空白弹组件搜索；S09 跨泳道语义、角色徽章、右键菜单。
 * 状态不在这里：nodes / edges 与所有改动都来自 useFlowEditor，这里只负责把 React Flow 配成规范要的样子。
 * 首帧取景到整幅画布（viewport.ts），所以关掉了 Controls 自带的「适应」——它按节点外框取景，会裁掉贴边绕的回填线。
 *
 * 操作约定（SPEC §6.4）：空白处拖 = 框选（相交即选中）；拖节点 = 移动，选中的一起动；步骤节点可在 AI / 人两条泳道间跨（松手按 §6.6 改角色），数据节点与受保护的人定节点挡在自己那条泳道里；
 * Shift / Cmd / Ctrl + 点 = 加选。平移：按住空格拖、中键或右键拖；滚轮仍是缩放（S03 定的，等真人用过再议）。
 * Delete / Backspace 由 useFlowEditor 的快捷键处理（RF 自带的 deleteKeyCode 关掉：不然删两次，而且它那次不进撤销栈）；节点拖动 3px 起算，点一下不会抖成一步撤销。
 */
export function FlowCanvas({ editor, labels = false, children }: { editor: FlowEditor; labels?: boolean; children?: ReactNode }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onNodeDragStop, onSelectionStart, onSelectionEnd, isValidConnection, onConnect, onConnectEnd, openQuick, closeQuick, openMenu, closeMenu, select, selectedIds, cycleRole } = editor
  const rf = useReactFlow()
  const onPaneClick = useCallback(() => { closeQuick(); closeMenu() }, [closeQuick, closeMenu])
  const onMoveStart = useCallback(() => { closeQuick(); closeMenu() }, [closeQuick, closeMenu])
  // 节点上右键：菜单贴光标；不在多选里的节点先选中它
  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: FlowRFNode) => {
    e.preventDefault()
    if (!selectedIds.includes(node.id)) select(node.id)
    openMenu(node.id, e.clientX, e.clientY)
  }, [openMenu, select, selectedIds])
  // 框选后 RF 在所选节点上盖一层选区框，右键落在它上面：按指针位置找出被点的那个节点
  const onSelectionContextMenu = useCallback((e: React.MouseEvent, picked: FlowRFNode[]) => {
    e.preventDefault()
    const p = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const hit = picked.find((n) => p.x >= n.position.x && p.x <= n.position.x + NODE_W && p.y >= n.position.y && p.y <= n.position.y + NODE_H) ?? picked[0]
    if (hit) openMenu(hit.id, e.clientX, e.clientY)
  }, [rf, openMenu])
  // RF 连线状态里的 to 是容器坐标，不是画布坐标；松手点从事件坐标换算，交给 editor 判断「离端口够远、在画布内」
  const onConnectEndAt: OnConnectEnd = useCallback((e, state) => {
    const c = 'clientX' in e ? { x: e.clientX, y: e.clientY } : { x: e.changedTouches[0]?.clientX ?? 0, y: e.changedTouches[0]?.clientY ?? 0 }
    onConnectEnd(e, state, rf.screenToFlowPosition(c))
  }, [onConnectEnd, rf])
  // 双击空白：在那个点弹组件搜索（RF 自带的双击缩放关掉）
  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).classList.contains('react-flow__pane')) return
    const p = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    openQuick(p.x, p.y)
  }, [rf, openQuick])
  const onInit = useCallback((inst: ReactFlowInstance<FlowRFNode, FlowRFEdge>) => { void fitFrame(inst) }, [])
  // 拖线中给容器加个类：节点整块的落点 Handle 只在这时接指针事件
  const connecting = useConnection((c) => c.inProgress)

  return (
    <CanvasOptions.Provider value={{ labels, flow: editor.flow, cycleRole }}>
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
      onConnectEnd={onConnectEndAt}
      zoomOnDoubleClick={false}
      onDoubleClick={onDoubleClick}
      onPaneClick={onPaneClick}
      onMoveStart={onMoveStart}
      onNodeContextMenu={onNodeContextMenu}
      onSelectionContextMenu={onSelectionContextMenu}
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
