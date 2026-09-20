import type { DataDir, DataMethod, DataType, EdgeKind, NodeFlag, NodeKind, NodeRole } from './types'
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

export const DTYPE_LABEL: Record<DataType, string> = {
  file: '文件',
  struct: '结构化',
  text: '文本',
  decision: '决定',
  event: '事件',
  sys: '系统数据',
}

/** 数据节点的打通方式；空 = 还没定 */
export const METHOD_LABEL: Record<DataMethod, string> = {
  '': '未定',
  api: '接口',
  rpa: 'RPA',
  file: '文件',
  manual: '人工',
}

export const DIR_LABEL: Record<DataDir, string> = {
  '': '未定',
  read: '读',
  write: '写',
  rw: '读写',
}
