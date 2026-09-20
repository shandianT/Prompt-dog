/**
 * 画布几何与泳道分带。数值来自 SPEC.md §6.1 与原型 design/workbench/flow.py，
 * 两边必须一致：节点 150 × 64，画布 1220 × 1024，人泳道从 y=440 起，数据泳道从 y=720 起。
 */
export const NODE_W = 150
export const NODE_H = 64
export const CANVAS_W = 1220
export const CANVAS_H = 1024

/** 整幅画布的矩形：首帧与「适应」按它取景，不按节点外框——回填线贴着右边和底边走，按节点外框取景会把它裁掉 */
export const FRAME = { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H } as const

export const LANE_AI_TOP = 28
export const LANE_HUMAN_TOP = 440
export const LANE_DATA_TOP = 720

export const LANES = [
  { id: 'ai', name: 'AI 自动', top: LANE_AI_TOP, hint: '把人的步骤拖进来 = 我要把它自动化' },
  { id: 'human', name: '人', top: LANE_HUMAN_TOP, hint: '拖进来 = 这一步还是人来做' },
  { id: 'data', name: '数据与系统', top: LANE_DATA_TOP, hint: '虚线 = 现在靠人搬数据' },
] as const

export type LaneId = (typeof LANES)[number]['id']

/**
 * 节点能动的范围（S05）：整块留在自己那条泳道里、不出画布——拖完的图仍过 x-compat 规则 2（data 只能在数据泳道）。
 * 跨泳道的语义（人 → AI = 要自动化并标缺口，AI → 人 = 改人审，不可逆前的人定受保护）是 S09 的事，到那时再放开。
 */
export function laneExtent(y: number | undefined): [[number, number], [number, number]] {
  const lane = laneOf(y)
  const top = lane === 'ai' ? 0 : lane === 'human' ? LANE_HUMAN_TOP : LANE_DATA_TOP
  const bottom = lane === 'ai' ? LANE_HUMAN_TOP : lane === 'human' ? LANE_DATA_TOP : CANVAS_H
  return [[0, top], [CANVAS_W, bottom]]
}

/** 节点归哪条泳道：按节点中心的 y 判定，与原型 laneRule 同一套算法 */
export function laneOf(y: number | undefined): LaneId {
  const cy = (y ?? 0) + NODE_H / 2
  if (cy < LANE_HUMAN_TOP) return 'ai'
  if (cy < LANE_DATA_TOP) return 'human'
  return 'data'
}
