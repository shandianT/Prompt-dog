import type { EdgeKind, NodeFlag, NodeKind, NodeRole } from './types'
import type { LaneId } from './lanes'

/** 界面上的中文说法，集中在这里，免得同一个词在不同屏上有两种叫法 */

export const KIND_LABEL: Record<NodeKind, string> = {
  human: '人',
  dog: '工作狗',
  skill: '技能',
  know: 'know-how',
  data: '数据 / 系统',
}

/** 节点上的类型徽章比正文多一个爪印，用来在密集的图上一眼认出工作狗 */
export const KIND_BADGE: Record<NodeKind, string> = { ...KIND_LABEL, dog: '🐾 工作狗' }

export const ROLE_LABEL: Record<NodeRole, string> = {
  auto: '自动',
  review: '人审',
  decide: '人定',
  '': '',
}

export const FLAG_LABEL: Record<NodeFlag, string> = {
  ok: '正常',
  block: '卡点',
  missing: '缺口',
  pending: '待打通',
}

export const LANE_LABEL: Record<LaneId, string> = {
  ai: 'AI 自动',
  human: '人',
  data: '数据与系统',
}

export const EDGE_LABEL: Record<EdgeKind, string> = {
  seq: '顺序',
  data: '数据',
  pending: '待打通',
  loop: '回填',
  back: '退回',
}
