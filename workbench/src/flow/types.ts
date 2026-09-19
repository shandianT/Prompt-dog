/**
 * 流程图的 TypeScript 类型，与 design/workbench/flow.schema.json 一一对应。
 *
 * schema 是运行时的真相（validate.ts 用它校验），这里的类型是编译期的镜像。
 * 两者会不会漂移？会——所以枚举值在这里写成 `as const` 数组，
 * `assertEnumsMatchSchema()` 在 `npm run validate:sample` 里逐个比对；
 * 改了 schema 的枚举而忘了改这里，校验会失败并指出是哪个枚举。
 */

export const NODE_KINDS = ['human', 'dog', 'skill', 'know', 'data'] as const
export const NODE_ROLES = ['auto', 'review', 'decide', ''] as const
export const NODE_FLAGS = ['ok', 'block', 'missing', 'pending'] as const
export const NODE_WAS = ['', 'human', 'manual', 'new'] as const
export const DATA_METHODS = ['', 'api', 'rpa', 'file', 'manual'] as const
export const DATA_DIRS = ['', 'read', 'write', 'rw'] as const
export const EDGE_KINDS = ['seq', 'data', 'pending', 'loop', 'back'] as const
export const DATA_TYPES = ['file', 'struct', 'text', 'decision', 'event', 'sys'] as const

/** 人 / 工作狗 / 技能 / 行业 know-how / 数据与系统 */
export type NodeKind = (typeof NODE_KINDS)[number]
/** 自动 / 人审 / 人定；数据节点为空 */
export type NodeRole = (typeof NODE_ROLES)[number]
/** 正常 / 卡点（等人）/ 缺口（缺组件或材料）/ 待打通（人在搬数据） */
export type NodeFlag = (typeof NODE_FLAGS)[number]
/** 对照现状用：原来人做 / 原来手工搬 / 新增 */
export type NodeWas = (typeof NODE_WAS)[number]
/** 数据节点的打通方式 */
export type DataMethod = (typeof DATA_METHODS)[number]
export type DataDir = (typeof DATA_DIRS)[number]
/** 顺序 / 数据 / 待打通 / 回填 / 退回 */
export type EdgeKind = (typeof EDGE_KINDS)[number]
/** 产物类型，决定端口颜色与兼容性 */
export type DataType = (typeof DATA_TYPES)[number]

/** 应用建议后的目标状态，字段是 node 的子集 */
export interface NodeTarget {
  kind?: NodeKind
  role?: NodeRole
  flag?: NodeFlag
  sub?: string
  method?: DataMethod
}

export interface FlowNode {
  id: string
  kind: NodeKind
  role?: NodeRole
  name: string
  /** 一句说明：部门 / 来源 / 环节号 */
  sub?: string
  x?: number
  y?: number
  flag?: NodeFlag
  /** 卡在哪 / 缺什么 / 要打通什么 */
  note?: string
  /** 怎么解 */
  fix?: string
  was?: NodeWas
  target?: NodeTarget
  /** 人：负责人或部门；数据：系统负责人 */
  owner?: string
  /** 人：时限 */
  sla?: string
  /** 人：通知渠道 */
  notify?: string
  method?: DataMethod
  dir?: DataDir
  /** 复用于 N 条流程 / N 只工作狗 */
  reuse?: number
  /** know-how 来源，或反推现状时的材料出处 */
  src?: string
  /** 所属资产包目录，复盘回流用 */
  pack?: string
  /** 人节点：这一步是或紧接不可逆动作。受保护，不可改为 auto */
  irreversible?: boolean
  /** 子图，工作狗才有 */
  children?: FlowNode[]
  childEdges?: FlowEdge[]
}

export interface FlowEdge {
  id: string
  from: string
  to: string
  kind: EdgeKind
  /** 线上流动的产物名 */
  label?: string
  dtype?: DataType
  /** 数据契约：字段与格式 */
  contract?: string
}

export interface Flow {
  name: string
  /** 本质一句话，汇报模式顶部显示 */
  essence?: string
  version?: string
  lanes?: { mode?: 'role' | 'dept'; bands?: string[] }
  nodes: FlowNode[]
  edges: FlowEdge[]
}
