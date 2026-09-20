import type { ReactFlowInstance } from '@xyflow/react'
import { FRAME } from '../flow'

/** 取景留白：整幅画布占满视口，四边各留 2% */
export const FIT_PADDING = 0.02

/**
 * 取景到整幅画布（1220 × 1024），而不是 React Flow 默认的「节点外框」：
 * 回填线贴着画布右边和底边绕，按节点外框取景会把它裁掉；泳道也应该整条可见，才看得出「哪一带是空的」。
 * 首帧（onInit）和顶栏「适应」都走这里。
 */
export function fitFrame(inst: Pick<ReactFlowInstance, 'fitBounds'>, duration = 0): Promise<boolean> {
  return inst.fitBounds(FRAME, { padding: FIT_PADDING, duration })
}
