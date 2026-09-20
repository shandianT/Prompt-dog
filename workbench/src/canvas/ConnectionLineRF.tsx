import { useContext } from 'react'
import type { ConnectionLineComponentProps } from '@xyflow/react'
import { NODE_H, NODE_W, connectionProblem, newEdge } from '../flow'
import { EDGE_COLOR, EDGE_DASH, edgePath, markerId } from './edgeGeometry'
import { CanvasOptions } from './options'
import type { FlowRFNode } from './toReactFlow'

/**
 * 拖线时的那根线（SPEC §6.4「橡皮筋；不兼容时线变红并说明」）。
 * 指针悬在某个节点上时，按「松手会生成的那条线」画：同样的路径、颜色、虚实——所见即所得；连不上就红虚线 + 原因。
 * 没悬在节点上就是从输出端口到指针的琥珀虚线。
 */
export function ConnectionLineRF({ fromNode, toNode, toX, toY }: ConnectionLineComponentProps<FlowRFNode>) {
  const { flow } = useContext(CanvasOptions)
  const a = fromNode.internals.positionAbsolute
  if (toNode) {
    const problem = connectionProblem(flow, fromNode.id, toNode.id)
    const kind = problem ? 'seq' : newEdge(flow, fromNode.id, toNode.id).kind
    const { d, labelX, labelY } = edgePath(a, toNode.internals.positionAbsolute, kind)
    return (
      <g className={`cl ${problem ? 'cl--invalid' : 'cl--valid'}`}>
        {/* 颜色写成 style 而不是属性：RF 的样式表给 .react-flow__connection-path 定了灰色，属性打不过样式表 */}
        <path
          d={d} fill="none" className="react-flow__connection-path"
          style={{ stroke: problem ? 'var(--color-hi)' : EDGE_COLOR[kind], strokeWidth: 2, strokeDasharray: problem ? '5 4' : EDGE_DASH[kind] }}
          markerEnd={`url(#${markerId(problem ? 'back' : kind)})`}
        />
        {problem && (
          <foreignObject x={labelX - 170} y={labelY - 20} width={340} height={44}>
            <div className="cl__why">{problem}</div>
          </foreignObject>
        )}
      </g>
    )
  }
  const px = a.x + NODE_W, py = a.y + NODE_H / 2
  const c = Math.max(50, Math.abs(toX - px) / 2)
  return (
    <path
      d={`M ${px} ${py} C ${px + c} ${py}, ${toX - c} ${toY}, ${toX} ${toY}`}
      fill="none" className="react-flow__connection-path cl cl--free" style={{ stroke: 'var(--color-amber)', strokeWidth: 1.8, strokeDasharray: '6 5' }}
    />
  )
}
