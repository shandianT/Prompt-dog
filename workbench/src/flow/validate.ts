import { Ajv } from 'ajv'
import type { ErrorObject, ValidateFunction } from 'ajv'
import type { Flow } from './types'
import { flowSchema } from './schema'
import {
  NODE_KINDS, NODE_ROLES, NODE_FLAGS, NODE_WAS,
  DATA_METHODS, DATA_DIRS, EDGE_KINDS, DATA_TYPES,
} from './types'

export interface Problem {
  /** 出问题的位置，如 nodes/3/kind */
  where: string
  message: string
}

export interface ValidationResult {
  ok: boolean
  problems: Problem[]
}

const ajv = new Ajv({ allErrors: true, strictSchema: true })
// x-compat 是我们自己加的元数据（端口兼容色、四条规则原文），不是 JSON Schema 关键字。
// 登记成已知关键字，这样既不用关掉 strict，也不会被当成写错的关键字。
ajv.addKeyword({ keyword: 'x-compat', valid: true })

let compiled: ValidateFunction | null = null
function validator(): ValidateFunction {
  compiled ??= ajv.compile(flowSchema)
  return compiled
}

function describe(err: ErrorObject): Problem {
  const where = err.instancePath.replace(/^\//, '') || '(根)'
  if (err.keyword === 'enum') {
    const allowed = (err.params as { allowedValues?: unknown[] }).allowedValues ?? []
    return { where, message: `取值不在允许范围内，只能是 ${allowed.map((v) => JSON.stringify(v)).join(' / ')}` }
  }
  if (err.keyword === 'additionalProperties') {
    const extra = (err.params as { additionalProperty?: string }).additionalProperty
    return { where, message: `出现了 schema 里没有的字段「${extra}」——要么写错了，要么该给 schema 加上` }
  }
  if (err.keyword === 'required') {
    const missing = (err.params as { missingProperty?: string }).missingProperty
    return { where, message: `缺少必填字段「${missing}」` }
  }
  if (err.keyword === 'pattern') {
    const p = (err.params as { pattern?: string }).pattern
    return { where, message: `格式不符合 ${p}` }
  }
  return { where, message: err.message ?? '不符合 schema' }
}

/** 按 flow.schema.json 校验一份流程图 */
export function validateFlow(data: unknown): ValidationResult {
  const check = validator()
  const ok = check(data) as boolean
  return { ok, problems: ok ? [] : (check.errors ?? []).map(describe) }
}

/** 校验通过就返回带类型的流程图，不通过就抛出可读的错误 */
export function parseFlow(data: unknown): Flow {
  const { ok, problems } = validateFlow(data)
  if (!ok) {
    const lines = problems.map((p) => `  ${p.where}: ${p.message}`).join('\n')
    throw new Error(`流程图不符合 flow.schema.json：\n${lines}`)
  }
  return data as Flow
}

const ENUM_MIRRORS: ReadonlyArray<[string, readonly string[]]> = [
  ['kind', NODE_KINDS],
  ['role', NODE_ROLES],
  ['flag', NODE_FLAGS],
  ['was', NODE_WAS],
  ['method', DATA_METHODS],
  ['dir', DATA_DIRS],
]

/**
 * types.ts 的枚举必须等于 schema 的枚举。
 * 编译器管不到这件事（TS 不读 JSON 的 enum），所以在校验里显式比一遍。
 */
export function enumDrift(): Problem[] {
  const out: Problem[] = []
  const compare = (name: string, mine: readonly string[], theirs: string[] | undefined) => {
    if (!theirs) {
      out.push({ where: `definitions/${name}`, message: 'schema 里找不到这个枚举' })
      return
    }
    const a = [...mine].sort().join('|')
    const b = [...theirs].sort().join('|')
    if (a !== b) {
      out.push({
        where: `definitions/${name}`,
        message: `types.ts 与 schema 不一致：types.ts = [${mine.join(', ')}]，schema = [${theirs.join(', ')}]`,
      })
    }
  }
  for (const [name, mine] of ENUM_MIRRORS) compare(name, mine, flowSchema.definitions[name]?.enum)
  const edgeKind = flowSchema.definitions.edge as { properties?: { kind?: { enum?: string[] } } } | undefined
  compare('edge.kind', EDGE_KINDS, edgeKind?.properties?.kind?.enum)
  const dtype = flowSchema.definitions.edge as { properties?: { dtype?: { enum?: string[] } } } | undefined
  compare('edge.dtype', DATA_TYPES, dtype?.properties?.dtype?.enum)
  return out
}
