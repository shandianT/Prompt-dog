import type { FlowNode, NodeRole } from './types'
import { LANE_DATA_TOP, LANE_HUMAN_TOP, NODE_H, laneOf } from './lanes'

/** 角色徽章点一下循环：自动 → 人审 → 人定 → 自动 */
const ROLE_CYCLE: readonly NodeRole[] = ['auto', 'review', 'decide']
export function nextRole(role: NodeRole | undefined): NodeRole {
  const i = ROLE_CYCLE.indexOf(role ?? 'auto')
  return ROLE_CYCLE[(i + 1) % ROLE_CYCLE.length] ?? 'auto'
}

export interface LaneOutcome { node: FlowNode; message?: string }

/**
 * 松手后的泳道语义（SPEC §6.6）。位置已经被 extent 裁在合法范围里，这里只管「跨过边界意味着什么」：
 *   人的步骤 → AI 泳道：变技能节点、自动、标缺口、记「原：人做」——还缺一个组件来做它
 *   AI 节点 → 人泳道：角色改人审，类型不变
 * 数据节点出不了数据泳道、步骤节点进不了数据泳道、受保护的人定节点进不了 AI 泳道——这三条由 laneExtent 挡在边界上，提示见 borderMessage。
 */
export function applyLaneRule(node: FlowNode): LaneOutcome {
  const lane = laneOf(node.y)
  if (node.kind === 'human' && lane === 'ai' && !node.irreversible) {
    return {
      node: {
        ...node, kind: 'skill', role: 'auto', flag: 'missing', was: 'human',
        sub: `原：${node.owner || '人做'} · 待配组件`,
        fix: node.fix || '给这一步配一个组件（技能 / 工作狗），或从组件库拖一个替换。',
      },
      message: `「${node.name}」标为要自动化：还缺一个组件来做它（缺口）`,
    }
  }
  if (node.kind !== 'human' && node.kind !== 'data' && lane === 'human' && node.role === 'auto') {
    return { node: { ...node, role: 'review' }, message: `「${node.name}」改为人审` }
  }
  return { node }
}

/** 拖到边界被挡住时说一句为什么（节点动过、且正好停在自己那条边上） */
export function borderMessage(node: FlowNode, prevY: number | undefined): string | undefined {
  const y = node.y ?? 0
  if (prevY === y) return undefined
  if (node.kind === 'data') return y === LANE_DATA_TOP ? '系统节点留在「数据与系统」泳道' : undefined
  if (node.kind === 'human' && node.irreversible) return y === LANE_HUMAN_TOP ? `「${node.name}」是不可逆动作前的人定节点，不能改成自动——留在人泳道` : undefined
  return y === LANE_DATA_TOP - NODE_H ? '步骤节点不能放进数据泳道' : undefined
}
