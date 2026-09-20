import { Handle, Position, useConnection, type NodeProps } from '@xyflow/react'
import { FlowNodeCard } from '../components/FlowNode'
import { OUTPUT_TYPE, PORT_COLOR, inputType } from '../flow'
import type { FlowRFNode } from './toReactFlow'

/**
 * FlowNodeCard 包成 React Flow 的自定义节点：端口换成 <Handle>，卡片自己的圆点关掉（ports="none"）。
 * Handle 复用 .fnode__port 的样式，所以画布上和变体页上的端口长得一样。
 * 只能从输出端口起线（左边的输入端口 isConnectableStart=false）。
 * 整块卡片还铺着一个看不见的目标 Handle（.fnode__drop）：拖线时拖到节点身上任何地方松手都能连，不用瞄准 12px 的圆点。
 * 它必须一直挂着而不是拖线时才出现——RF 只在节点挂载时量 Handle 的位置，临时出现的 Handle 它认不出来；平时靠 CSS 关掉它的指针事件。
 */
export function FlowNodeRF({ id, data, selected }: NodeProps<FlowRFNode>) {
  const n = data.node
  const hovered = useConnection((c) => c.inProgress && c.toNode?.id === id)
  return (
    <>
      <Handle
        type="target"
        id="in"
        position={Position.Left}
        isConnectableStart={false}
        className="fnode__port fnode__port--in"
        style={{ borderColor: PORT_COLOR[inputType(n.kind)] }}
      />
      <FlowNodeCard node={n} selected={selected} connecting={hovered} ports="none" interactive />
      <Handle
        type="source"
        id="out"
        position={Position.Right}
        className="fnode__port fnode__port--out"
        style={{ borderColor: PORT_COLOR[OUTPUT_TYPE[n.kind]] }}
      />
      <Handle type="target" id="body" position={Position.Left} isConnectableStart={false} className="fnode__drop" />
    </>
  )
}
