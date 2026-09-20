import { useContext } from 'react'
import { BaseEdge, EdgeLabelRenderer, useInternalNode, type EdgeProps } from '@xyflow/react'
import { EDGE_COLOR, EDGE_DASH, edgePath, markerId } from './edgeGeometry'
import { CanvasOptions } from './options'
import type { FlowRFEdge } from './toReactFlow'

/**
 * 一条线。路径按两端节点的左上角算（edgeGeometry.ts），不用 RF 给的端口坐标——
 * 回填要绕底边、退回要拱顶，端口坐标表达不了。
 * 标签是 HTML（EdgeLabelRenderer），不是 SVG text：要换行、要省略号、要用 token，都只有 HTML 能做。
 */
export function FlowEdgeRF({ id, source, target, data, selected }: EdgeProps<FlowRFEdge>) {
  const a = useInternalNode(source)
  const b = useInternalNode(target)
  const { labels } = useContext(CanvasOptions)
  if (!a || !b || !data) return null

  const e = data.edge
  const { d, labelX, labelY } = edgePath(a.internals.positionAbsolute, b.internals.positionAbsolute, e.kind)
  // 默认只显示非顺序线与决定类——顺序线上「上一步的产物」多半一眼就知道，全显示会糊成一片
  const show = labels || !!selected || e.kind !== 'seq' || e.dtype === 'decision'
  const labelKind = e.kind === 'seq' ? (e.dtype ?? 'struct') : e.kind

  return (
    <>
      <BaseEdge
        id={id}
        path={d}
        className={`fe fe--${e.kind}${selected ? ' fe--selected' : ''}`}
        markerEnd={`url(#${markerId(selected ? 'selected' : e.kind)})`}
        interactionWidth={14}
        style={{
          stroke: selected ? EDGE_COLOR.selected : EDGE_COLOR[e.kind],
          strokeWidth: selected ? 2.6 : 1.8,
          strokeDasharray: EDGE_DASH[e.kind],
        }}
      />
      {show && e.label && (
        <EdgeLabelRenderer>
          <div
            className={`fe-label fe-label--${labelKind}`}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            data-edge={id}
          >
            {e.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
