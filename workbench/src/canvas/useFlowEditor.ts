import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useEdgesState, useNodesState,
  type IsValidConnection, type OnConnect, type OnConnectEnd, type OnEdgesChange, type OnNodeDrag, type OnNodesChange,
} from '@xyflow/react'
import { CANVAS_H, CANVAS_W, NODE_H, NODE_W, connectionProblem, laneExtent, newEdge, newNode, type Flow, type FlowEdge, type FlowNode, type PaletteItem } from '../flow'
import { toRFEdges, toRFNodes, type FlowRFEdge, type FlowRFNode } from './toReactFlow'

/** 撤销栈深度，SPEC §6.4：最多 40 步 */
export const HISTORY_MAX = 40
/** 方向键微移：1px，按住 Shift 10px（SPEC §6.8） */
const NUDGE: Record<string, readonly [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

type Pt = { x: number; y: number }

export interface FlowEditor {
  /** 契约对象本身：画布上改了什么，改的就是它 */
  flow: Flow
  nodes: FlowRFNode[]
  edges: FlowRFEdge[]
  onNodesChange: OnNodesChange<FlowRFNode>
  onEdgesChange: OnEdgesChange<FlowRFEdge>
  onNodeDragStop: OnNodeDrag<FlowRFNode>
  /** 框选开始 / 结束：框选只选节点（SPEC §6.4），期间 RF 顺手选上的连线要拦掉 */
  onSelectionStart: () => void
  onSelectionEnd: () => void
  selectedIds: string[]
  selectedEdgeIds: string[]
  /** 只选这一个节点（面板里的 chip、输入 / 输出链接用） */
  select: (id: string) => void
  clearSelection: () => void
  /** 改节点字段；数据节点的打通方式改成非人工时，连着它的待打通线降为数据线（x-compat 规则 4 后半句） */
  updateNode: (id: string, patch: Partial<FlowNode>) => void
  updateEdge: (id: string, patch: Partial<FlowEdge>) => void
  /** 删节点连带它的线 */
  deleteNodes: (ids: string[]) => void
  deleteEdges: (ids: string[]) => void
  /** 删掉当前选中的：有节点删节点，否则删线；返回是否删了东西 */
  deleteSelected: () => boolean
  /** 回到示例（可撤销） */
  reset: () => void
  undo: () => void
  canUndo: boolean
  /** 拖线：RF 逐帧问「这样连合不合规」；松手合规就连，不合规就提示原因 */
  isValidConnection: IsValidConnection<FlowRFEdge>
  onConnect: OnConnect
  /** 松手：RF 的回调 + 松手点的画布坐标（RF 状态里的 to 不是画布坐标，FlowCanvas 用 screenToFlowPosition 换好再传） */
  onConnectEnd: (event: MouseEvent | TouchEvent, state: Parameters<OnConnectEnd>[1], at: { x: number; y: number }) => void
  /** 连一条线；连不上返回 false 并提示原因 */
  connect: (from: string, to: string) => boolean
  /** 一条短提示（原型的 toast），2.2 秒后自己消失 */
  notice: { text: string; n: number } | null
  say: (text: string) => void
  /** 组件搜索弹层：画布坐标；from = 接在谁之后（端口拖到空白）；双击空白没有 from */
  quick: { x: number; y: number; from?: string } | null
  openQuick: (x: number, y: number, from?: string) => void
  closeQuick: () => void
  /** 从组件库的一项新建节点，中心尽量在 (cx, cy)；给了 from 就顺手连上（合规才连）。返回新节点 id */
  addNode: (item: PaletteItem, cx: number, cy: number, from?: string) => string
}

/**
 * 画布的编辑状态：flow（契约）是真相，React Flow 的 nodes / edges 是它的视图态（多了 selected、拖动中的位置、量出来的尺寸）。
 * 所有改动都走 commit：推一份快照进撤销栈（40），换掉 flow，再把 flow 投回 RF 的视图——选中态保留、尺寸保留，其余以 flow 为准。
 * 拖动过程中只有 RF 的位置在变；松手才把整数坐标写回 flow——一次拖动 = 一步撤销，与原型 snap() 同一节奏。
 * 撤销只回节点 / 连线，不回选中——选中是界面状态，不入文件（SPEC §5）。
 *
 * flowRef 是「此刻已提交的 flow」，与 state 同步改：同一个 tick 里第二次写入必须看到第一次的结果，否则一次动作会推两份快照。
 * 拖选框松手时 React Flow 同时叫 onNodeDragStop 与 onSelectionDragStop（xyflow/system XYDrag），所以只接前者。
 */
export function useFlowEditor(initial: Flow): FlowEditor {
  const [flow, setFlow] = useState(initial)
  const flowRef = useRef(initial)
  const initialNodes = useMemo(() => toRFNodes(initial), [initial])
  const initialEdges = useMemo(() => toRFEdges(initial), [initial])
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowRFNode>(initialNodes)
  const [edges, setEdges, applyEdgeChanges] = useEdgesState<FlowRFEdge>(initialEdges)
  const history = useRef<Flow[]>([])
  const [depth, setDepth] = useState(0)

  // React Flow 的框选会把与所选节点相连的线一并选上（Pane 里按 edge.selectable 判断，关掉它就不能点线了）。
  // 规范说框选「相交节点全部选中」，只有节点；所以框选期间丢掉连线的「选上」变更，「取消」照放。
  const marquee = useRef(false)
  const onSelectionStart = useCallback(() => { marquee.current = true }, [])
  const onSelectionEnd = useCallback(() => { marquee.current = false }, [])
  const onEdgesChange: OnEdgesChange<FlowRFEdge> = useCallback((changes) => {
    applyEdgeChanges(marquee.current ? changes.filter((c) => !(c.type === 'select' && c.selected)) : changes)
  }, [applyEdgeChanges])

  /** flow → RF 视图：保留选中与量好的尺寸；flow 里没有的（已删）消失，新出现的出现 */
  const syncView = useCallback((next: Flow) => {
    setNodes((prev) => {
      const by = new Map(prev.map((n) => [n.id, n]))
      return toRFNodes(next).map((rn) => { const p = by.get(rn.id); return p ? { ...rn, selected: p.selected, measured: p.measured } : rn })
    })
    setEdges((prev) => {
      const by = new Map(prev.map((e) => [e.id, e]))
      return toRFEdges(next).map((re) => { const p = by.get(re.id); return p ? { ...re, selected: p.selected } : re })
    })
  }, [setNodes, setEdges])

  const commit = useCallback((next: Flow) => {
    history.current = [...history.current.slice(-(HISTORY_MAX - 1)), flowRef.current]
    flowRef.current = next
    setDepth(history.current.length)
    setFlow(next)
    syncView(next)
  }, [syncView])

  /** 把一批节点的新位置写回 flow（整数）；位置没变（或同一次松手已经写过）就什么都不做 */
  const applyMoves = useCallback((moves: Map<string, Pt>) => {
    const cur = flowRef.current
    const changed = cur.nodes.some((n) => { const m = moves.get(n.id); return !!m && (m.x !== (n.x ?? 0) || m.y !== (n.y ?? 0)) })
    if (!changed) return
    commit({ ...cur, nodes: cur.nodes.map((n) => { const m = moves.get(n.id); return m ? { ...n, x: m.x, y: m.y } : n }) })
  }, [commit])

  const onNodeDragStop: OnNodeDrag<FlowRFNode> = useCallback((_e, _node, dragged) => {
    applyMoves(new Map(dragged.map((d) => [d.id, { x: Math.round(d.position.x), y: Math.round(d.position.y) }])))
  }, [applyMoves])

  const updateNode = useCallback((id: string, patch: Partial<FlowNode>) => {
    const cur = flowRef.current
    const node = cur.nodes.find((n) => n.id === id)
    if (!node) return
    if (!(Object.keys(patch) as (keyof FlowNode)[]).some((k) => patch[k] !== node[k])) return
    const merged: FlowNode = { ...node, ...patch }
    let nextEdges = cur.edges
    if (merged.kind === 'data' && patch.method !== undefined && patch.method !== '' && patch.method !== 'manual') {
      nextEdges = cur.edges.map((e) => (e.kind === 'pending' && (e.from === id || e.to === id) ? { ...e, kind: 'data' as const } : e))
      if (merged.flag === 'pending') merged.flag = 'ok'
    }
    commit({ ...cur, nodes: cur.nodes.map((n) => (n.id === id ? merged : n)), edges: nextEdges })
  }, [commit])

  const updateEdge = useCallback((id: string, patch: Partial<FlowEdge>) => {
    const cur = flowRef.current
    const edge = cur.edges.find((e) => e.id === id)
    if (!edge) return
    if (!(Object.keys(patch) as (keyof FlowEdge)[]).some((k) => patch[k] !== edge[k])) return
    commit({ ...cur, edges: cur.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) })
  }, [commit])

  const deleteNodes = useCallback((ids: string[]) => {
    const cur = flowRef.current, gone = new Set(ids)
    if (!cur.nodes.some((n) => gone.has(n.id))) return
    commit({ ...cur, nodes: cur.nodes.filter((n) => !gone.has(n.id)), edges: cur.edges.filter((e) => !gone.has(e.from) && !gone.has(e.to)) })
  }, [commit])

  const deleteEdges = useCallback((ids: string[]) => {
    const cur = flowRef.current, gone = new Set(ids)
    if (!cur.edges.some((e) => gone.has(e.id))) return
    commit({ ...cur, edges: cur.edges.filter((e) => !gone.has(e.id)) })
  }, [commit])

  const selectedIds = useMemo(() => nodes.filter((n) => n.selected).map((n) => n.id), [nodes])
  const selectedEdgeIds = useMemo(() => edges.filter((e) => e.selected).map((e) => e.id), [edges])

  const deleteSelected = useCallback((): boolean => {
    if (selectedIds.length) { deleteNodes(selectedIds); return true }
    if (selectedEdgeIds.length) { deleteEdges(selectedEdgeIds); return true }
    return false
  }, [selectedIds, selectedEdgeIds, deleteNodes, deleteEdges])

  const reset = useCallback(() => { commit(initial) }, [commit, initial])

  const [notice, setNotice] = useState<{ text: string; n: number } | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const say = useCallback((text: string) => {
    setNotice((cur) => ({ text, n: (cur?.n ?? 0) + 1 }))
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(null), 2200)
  }, [])
  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  const [quick, setQuick] = useState<{ x: number; y: number; from?: string } | null>(null)
  const openQuick = useCallback((x: number, y: number, from?: string) => setQuick({ x, y, from }), [])
  const closeQuick = useCallback(() => setQuick(null), [])

  const connect = useCallback((from: string, to: string): boolean => {
    const cur = flowRef.current
    const problem = connectionProblem(cur, from, to)
    if (problem) { say(problem); return false }
    const edge = newEdge(cur, from, to)
    commit({ ...cur, edges: [...cur.edges, edge] })
    say(edge.kind === 'pending' ? '已连线 · 标为待打通' : '已连线')
    return true
  }, [commit, say])
  const isValidConnection: IsValidConnection<FlowRFEdge> = useCallback((c) => connectionProblem(flowRef.current, c.source, c.target) === null, [])
  const onConnect: OnConnect = useCallback((c) => { connect(c.source, c.target) }, [connect])
  // 松手在一个连不上的节点上：RF 不会叫 onConnect，原因由这里说。
  // 松手在空白处（离端口够远、在画布内）：弹组件搜索，接在这个节点之后（SPEC §6.4「拖到空白新建」）
  const onConnectEnd = useCallback((_e: MouseEvent | TouchEvent, state: Parameters<OnConnectEnd>[1], at: { x: number; y: number }) => {
    if (!state.fromNode) return
    if (state.toNode) {
      if (state.isValid === false) { const problem = connectionProblem(flowRef.current, state.fromNode.id, state.toNode.id); if (problem) say(problem) }
      return
    }
    const p = state.fromNode.internals.positionAbsolute
    const port = { x: p.x + NODE_W, y: p.y + NODE_H / 2 }
    if (Math.hypot(at.x - port.x, at.y - port.y) > 24 && at.x >= 0 && at.x <= CANVAS_W && at.y >= 0 && at.y <= CANVAS_H) openQuick(at.x, at.y, state.fromNode.id)
  }, [say, openQuick])

  const undo = useCallback(() => {
    const prev = history.current.pop()
    setDepth(history.current.length)
    if (!prev) return
    flowRef.current = prev
    setFlow(prev)
    syncView(prev)
    setQuick(null)
  }, [syncView])

  const select = useCallback((id: string) => {
    setNodes((ns) => ns.map((n) => (n.selected !== (n.id === id) ? { ...n, selected: n.id === id } : n)))
    setEdges((es) => es.map((e) => (e.selected ? { ...e, selected: false } : e)))
  }, [setNodes, setEdges])

  const clearSelection = useCallback(() => {
    setNodes((ns) => ns.map((n) => (n.selected ? { ...n, selected: false } : n)))
    setEdges((es) => es.map((e) => (e.selected ? { ...e, selected: false } : e)))
  }, [setNodes, setEdges])

  const addNode = useCallback((item: PaletteItem, cx: number, cy: number, from?: string): string => {
    const cur = flowRef.current
    const node = newNode(cur, item, cx, cy)
    let next: Flow = { ...cur, nodes: [...cur.nodes, node] }
    let msg = item.kind === 'data' ? `已加入「${item.name}」· 默认待打通` : `已加入「${item.name}」`
    if (from) {
      const problem = connectionProblem(next, from, node.id)
      if (problem) msg = `已加入「${item.name}」，但没连上：${problem}`
      else { next = { ...next, edges: [...next.edges, newEdge(next, from, node.id)] }; msg = `已新建「${item.name}」并连上` }
    }
    commit(next)
    select(node.id)
    setQuick(null)
    say(msg)
    return node.id
  }, [commit, select, say])

  /** 方向键：选中的节点一起挪，仍锁在各自泳道与画布内；每按一次是一步撤销 */
  const nudge = useCallback((d: readonly [number, number], step: number): boolean => {
    const picked = nodes.filter((n) => n.selected)
    if (!picked.length) return false
    const moves = new Map<string, Pt>()
    for (const n of picked) {
      const [[x0, y0], [x1, y1]] = laneExtent(n.position.y)
      moves.set(n.id, {
        x: Math.min(Math.max(Math.round(n.position.x) + d[0] * step, x0), x1 - NODE_W),
        y: Math.min(Math.max(Math.round(n.position.y) + d[1] * step, y0), y1 - NODE_H),
      })
    }
    applyMoves(moves)
    return true
  }, [nodes, applyMoves])

  // 快捷键（SPEC §6.8）：Cmd/Ctrl+Z 撤销、Esc 取消选中、Delete / Backspace 删除、方向键微移。输入框里的按键不管。
  // 用 window 的捕获阶段：方向键要抢在 React Flow 自带的「焦点节点按方向键挪 1px」之前，否则一次按键挪两次、而且它那次不进撤销栈。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return }
      if (e.key === 'Escape') {
        setQuick(null)
        clearSelection()
        // 焦点在节点上时 React Flow 自己也接 Esc（反选那一个）。我们的清空先在微任务里落地，它再看那节点已不是选中态，就会把它重新选上——所以到它之前截住。
        if (t?.closest('.react-flow__node')) { e.stopPropagation(); t.blur() }
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (deleteSelected()) e.preventDefault(); return }
      const d = NUDGE[e.key]
      if (d && nudge(d, e.shiftKey ? 10 : 1)) { e.preventDefault(); e.stopPropagation() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [undo, clearSelection, deleteSelected, nudge])

  return {
    flow, nodes, edges, onNodesChange, onEdgesChange, onNodeDragStop, onSelectionStart, onSelectionEnd,
    selectedIds, selectedEdgeIds, select, clearSelection, updateNode, updateEdge, deleteNodes, deleteEdges, deleteSelected, reset,
    undo, canUndo: depth > 0,
    isValidConnection, onConnect, onConnectEnd, connect, notice, say,
    quick, openQuick, closeQuick, addNode,
  }
}
