import type { NodeKind } from './types'

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
 * 节点能动的范围（S09，SPEC §6.6 里三条「弹回」改成挡在边界上）：
 *   数据节点只能在数据泳道；步骤节点在 AI + 人两条泳道之间自由跨（跨过去的含义见 laneRule.ts）；
 *   不可逆动作前的人定节点受保护，只能在人泳道。整块留在带内，不出画布——拖完的图仍过 x-compat 规则 2 / 3。
 */
export function laneExtent(kind: NodeKind, guarded = false): [[number, number], [number, number]] {
  if (kind === 'data') return [[0, LANE_DATA_TOP], [CANVAS_W, CANVAS_H]]
  if (kind === 'human' && guarded) return [[0, LANE_HUMAN_TOP], [CANVAS_W, LANE_DATA_TOP]]
  return [[0, 0], [CANVAS_W, LANE_DATA_TOP]]
}

/** 节点归哪条泳道：按节点中心的 y 判定，与原型 laneRule 同一套算法 */
export function laneOf(y: number | undefined): LaneId {
  const cy = (y ?? 0) + NODE_H / 2
  if (cy < LANE_HUMAN_TOP) return 'ai'
  if (cy < LANE_DATA_TOP) return 'human'
  return 'data'
}
