import type { CSSProperties, MouseEvent } from 'react'
import type { FlowNode, NodeFlag, NodeRole } from '../flow'
import { FLAG_LABEL, KIND_BADGE, NODE_H, NODE_W, OUTPUT_TYPE, PORT_COLOR, ROLE_LABEL, inputType } from '../flow'
import './FlowNode.css'

/**
 * 画布上的一个节点。纯展示：位置、拖拽、连线由画布负责（S03 起）。
 * S03 会把它包成 React Flow 的自定义 node，届时端口换成 <Handle>，传 ports="none" 关掉这里画的圆点。
 */

/** 对照现状的三种 chip：前两种黑底，新增绿底 */
export type DiffChip = '原：人做' | '原：手工搬' | '新增'

/** 运行态徽章，数字来自这只狗的 验收清单.json */
export interface RunBadge {
  state: 'ok' | 'running' | 'wait' | 'todo'
  text: string
}

export interface FlowNodeCardProps {
  node: FlowNode
  selected?: boolean
  /** 正在从别处拉线过来，等着落点 */
  connecting?: boolean
  /** 运行态：当前正在跑的环节 */
  running?: boolean
  /** 对照现状里没变过的节点压暗 */
  dim?: boolean
  diff?: DiffChip
  run?: RunBadge
  /** 端口画法：dots = 自己画圆点；none = 交给 React Flow 的 Handle */
  ports?: 'dots' | 'none'
  /** 可交互时才有 grab 光标与 hover 反馈 */
  interactive?: boolean
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  onDoubleClick?: (e: MouseEvent<HTMLDivElement>) => void
  /** 点角色徽章循环切换 自动 → 人审 → 人定 */
  onRoleCycle?: (next: NodeRole) => void
  style?: CSSProperties
  className?: string
}

const ROLE_CYCLE: NodeRole[] = ['auto', 'review', 'decide']

function nextRole(role: NodeRole | undefined): NodeRole {
  const i = ROLE_CYCLE.indexOf(role ?? 'auto')
  return ROLE_CYCLE[(i + 1) % ROLE_CYCLE.length] ?? 'auto'
}

export function FlowNodeCard({
  node, selected, connecting, running, dim, diff, run,
  ports = 'dots', interactive = false, onClick, onDoubleClick, onRoleCycle, style, className,
}: FlowNodeCardProps) {
  const flag: NodeFlag = node.flag ?? 'ok'
  // 数据节点不谈「谁来做」——它不是一个步骤
  const showRole = node.kind !== 'data' && !!node.role
  const kids = node.children?.length ?? 0

  const classes = [
    'fnode',
    `fnode--${node.kind}`,
    flag !== 'ok' && `fnode--${flag}`,
    selected && 'fnode--selected',
    connecting && 'fnode--connecting',
    running && 'fnode--running',
    dim && 'fnode--dim',
    interactive && 'fnode--interactive',
    className,
  ].filter(Boolean).join(' ')

  const cycleRole = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onRoleCycle?.(nextRole(node.role))
  }

  return (
    <div
      className={classes}
      style={{ '--fnode-w': `${NODE_W}px`, '--fnode-h': `${NODE_H}px`, ...style } as CSSProperties}
      data-id={node.id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      tabIndex={interactive ? 0 : -1}
    >
      {ports === 'dots' && (
        <span
          className="fnode__port fnode__port--in"
          style={{ borderColor: PORT_COLOR[inputType(node.kind)] }}
          aria-hidden
        />
      )}

      {flag !== 'ok' && <span className={`fnode__flag fnode__flag--${flag}`}>{FLAG_LABEL[flag]}</span>}
      {diff && <span className={`fnode__diff${diff === '新增' ? ' fnode__diff--new' : ''}`}>{diff}</span>}

      <div className="fnode__head">
        <span className={`fnode__kind fnode__kind--${node.kind}`}>{KIND_BADGE[node.kind]}</span>
        {showRole &&
          (onRoleCycle ? (
            <button
              type="button"
              className={`fnode__role fnode__role--${node.role}`}
              onClick={cycleRole}
              title="点一下切换：自动 → 人审 → 人定"
            >
              {ROLE_LABEL[node.role ?? '']}
            </button>
          ) : (
            <span className={`fnode__role fnode__role--${node.role}`}>{ROLE_LABEL[node.role ?? '']}</span>
          ))}
      </div>

      <div className="fnode__name" title={node.name}>{node.name}</div>
      <div className="fnode__sub" title={node.sub}>{node.sub}</div>

      {kids > 0 && <span className="fnode__kids">{kids} 环节 · 双击打开</span>}
      {node.irreversible && !kids && <span className="fnode__lock">🔒 受保护</span>}
      {run && <span className={`fnode__run fnode__run--${run.state}`}>{run.text}</span>}

      {ports === 'dots' && (
        <span
          className="fnode__port fnode__port--out"
          style={{ borderColor: PORT_COLOR[OUTPUT_TYPE[node.kind]] }}
          aria-hidden
        />
      )}
    </div>
  )
}
