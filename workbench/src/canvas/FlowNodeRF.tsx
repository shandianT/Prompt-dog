import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FlowNodeCard } from '../components/FlowNode'
import { OUTPUT_TYPE, PORT_COLOR, inputType } from '../flow'
import type { FlowRFNode } from './toReactFlow'

/**
 * FlowNodeCard 包成 React Flow 的自定义节点：端口换成 <Handle>，卡片自己的圆点关掉（ports="none"）。
 * Handle 复用 .fnode__port 的样式，所以画布上和变体页上的端口长得一样。
 */
export function FlowNodeRF({ data, selected }: NodeProps<FlowRFNode>) {
  const n = data.node
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="fnode__port fnode__port--in"
        style={{ borderColor: PORT_COLOR[inputType(n.kind)] }}
      />
      <FlowNodeCard node={n} selected={selected} ports="none" interactive />
      <Handle
        type="source"
        position={Position.Right}
        className="fnode__port fnode__port--out"
        style={{ borderColor: PORT_COLOR[OUTPUT_TYPE[n.kind]] }}
      />
    </>
  )
}
