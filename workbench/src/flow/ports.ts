import type { DataType, NodeKind } from './types'

/**
 * 端口颜色 = 产物类型。取值来自 flow.schema.json 的 x-compat.port
 * （那里写的是颜色名：决定琥珀 / 结构化石板灰 / 文本 · 文件绿 / 系统蓝 / 事件琥珀），
 * 这里翻成 token。`portDrift()` 保证两边的 key 不会分家。
 */
export const PORT_COLOR: Record<DataType, string> = {
  decision: 'var(--color-amber)',
  event: 'var(--color-amber)',
  struct: 'var(--color-slate)',
  text: 'var(--color-ok)',
  file: 'var(--color-ok)',
  sys: 'var(--color-lo)',
}

/** 节点输出的产物类型：人出决定，狗与技能出结构化，know-how 出文本，数据节点出系统数据 */
export const OUTPUT_TYPE: Record<NodeKind, DataType> = {
  human: 'decision',
  dog: 'struct',
  skill: 'struct',
  know: 'text',
  data: 'sys',
}

/** 节点接收的产物类型：数据节点收系统数据，其余收结构化 */
export function inputType(kind: NodeKind): DataType {
  return kind === 'data' ? 'sys' : 'struct'
}
