/**
 * 流程图契约的单一来源：仓库的 design/workbench/flow.schema.json。
 * 这里不拷贝一份——技能产出它、画布渲染它、复盘回流改它，三处必须看同一个文件。
 * （Vite 的 server.fs.allow 已放行仓库根目录，见 vite.config.ts）
 */
import schemaJson from '../../../design/workbench/flow.schema.json'

export const flowSchema = schemaJson as unknown as FlowSchema

export interface FlowSchema {
  $id: string
  title: string
  definitions: Record<string, { enum?: string[] }>
  'x-compat': {
    port: Record<string, string>
    rules: string[]
  }
}

/** x-compat.rules 的原文，compat.ts 逐条实现，编号与数组下标一一对应 */
export const compatRuleTexts: readonly string[] = flowSchema['x-compat'].rules
