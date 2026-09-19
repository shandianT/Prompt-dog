import type { Flow, FlowNode } from './types'
import { compatRuleTexts } from './schema'
import { laneOf } from './lanes'

/**
 * flow.schema.json 的 x-compat.rules 四条规则的实现。
 * schema 只能表达「字段长什么样」，表达不了「这两个字段一起出现时不合法」——这四条就是那部分。
 * rule 的下标与 x-compat.rules 数组一一对应，报错时把原文一起带出来。
 */
export interface CompatFinding {
  rule: number
  /** x-compat.rules 里的原话 */
  ruleText: string
  where: string
  message: string
}

const byId = (flow: Flow) => new Map(flow.nodes.map((n) => [n.id, n]))

export function checkCompat(flow: Flow): CompatFinding[] {
  const found: CompatFinding[] = []
  const nodes = byId(flow)
  const add = (rule: number, where: string, message: string) =>
    found.push({ rule, ruleText: compatRuleTexts[rule] ?? '', where, message })

  // 0 决定类产物不能直接进数据节点
  for (const e of flow.edges) {
    if (e.dtype !== 'decision') continue
    const to = nodes.get(e.to)
    if (to?.kind === 'data') {
      add(0, `edges/${e.id}`, `「${e.label || e.id}」是决定类产物，却直接连进数据节点「${to.name}」`)
    }
  }

  // 1 data 节点只能出现在数据与系统泳道
  for (const n of flow.nodes) {
    if (n.kind !== 'data') continue
    const lane = laneOf(n.y)
    if (lane !== 'data') {
      add(1, `nodes/${n.id}`, `数据节点「${n.name}」落在 ${lane === 'ai' ? 'AI 自动' : '人'} 泳道（y=${n.y ?? 0}）`)
    }
  }

  // 2 decide 且位于不可逆动作前的人节点不可改为 auto
  for (const n of flow.nodes) {
    if (!n.irreversible) continue
    if (n.kind !== 'human' || n.role !== 'decide') {
      add(2, `nodes/${n.id}`, `「${n.name}」标了不可逆，就必须是人定的人节点，现在是 ${n.kind} / ${n.role || '无角色'}`)
    }
    if (n.target && (n.target.role === 'auto' || n.target.kind !== undefined)) {
      add(2, `nodes/${n.id}/target`, `「${n.name}」是受保护的人工确认点，不能给它一个把它变成自动的目标态`)
    }
  }

  // 3 pending 边两端至少一端是 data 节点；method≠manual 后应降为 data 边
  for (const e of flow.edges) {
    if (e.kind !== 'pending') continue
    const from = nodes.get(e.from)
    const to = nodes.get(e.to)
    const dataEnd: FlowNode | undefined = from?.kind === 'data' ? from : to?.kind === 'data' ? to : undefined
    if (!dataEnd) {
      add(3, `edges/${e.id}`, `待打通的线两端都不是数据节点（${e.from} → ${e.to}）`)
      continue
    }
    if (dataEnd.method && dataEnd.method !== 'manual') {
      add(3, `edges/${e.id}`, `「${dataEnd.name}」的打通方式已经是 ${dataEnd.method}，这条线该降为 data（实线），不该还是待打通`)
    }
  }

  return found
}

/** 悬空引用：连线指向不存在的节点。schema 管不到跨对象的引用 */
export function checkRefs(flow: Flow): CompatFinding[] {
  const nodes = byId(flow)
  const out: CompatFinding[] = []
  for (const e of flow.edges) {
    for (const [end, id] of [['from', e.from], ['to', e.to]] as const) {
      if (!nodes.has(id)) {
        out.push({ rule: -1, ruleText: '连线两端必须指向存在的节点', where: `edges/${e.id}/${end}`, message: `找不到节点「${id}」` })
      }
    }
  }
  const seen = new Set<string>()
  for (const n of flow.nodes) {
    if (seen.has(n.id)) out.push({ rule: -1, ruleText: '节点 id 必须唯一', where: `nodes/${n.id}`, message: `id「${n.id}」重复` })
    seen.add(n.id)
  }
  return out
}
