import { createContext } from 'react'
import type { Flow } from '../flow'

/** 画布级开关与数据。放 context 而不放每条线的 data 里：切一次开关不该重写 23 条线的数据 */
export interface CanvasOptionsValue {
  /** 「产物」开关：开了所有线都显示标签；关着只显示非顺序线与决定类 */
  labels: boolean
  /** 当前 flow：拖线时预判「松手会生成什么线 / 为什么连不上」要看全图 */
  flow: Flow
}

export const CanvasOptions = createContext<CanvasOptionsValue>({ labels: false, flow: { name: '', nodes: [], edges: [] } })
