import { createContext } from 'react'

/** 画布级开关。放 context 而不放每条线的 data 里：切一次开关不该重写 23 条线的数据 */
export interface CanvasOptionsValue {
  /** 「产物」开关：开了所有线都显示标签；关着只显示非顺序线与决定类 */
  labels: boolean
}

export const CanvasOptions = createContext<CanvasOptionsValue>({ labels: false })
