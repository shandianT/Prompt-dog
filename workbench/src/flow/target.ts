import type { Flow, FlowNode } from './types'

/**
 * 「应用建议」（S10）：把节点切到它的目标态 target，与原型 applyFix 同一套规则——
 * kind / role / sub / method 按 target 改，flag 按 target（没写就正常）；
 * 人的步骤变成组件记「原：人做」并归到 AI 泳道；数据节点打通方式从人工变接口记「原：手工搬」，连着它的待打通线降为数据线。
 * 应用完 target 删掉，「对照现状」用 was 把变化标出来。
 */
export function applyTarget(flow: Flow, id: string): { flow: Flow; message: string } | null {
  const n = flow.nodes.find((x) => x.id === id)
  if (!n?.target) return null
  const t = n.target
  const next: FlowNode = { ...n }
  delete next.target
  if (t.kind && t.kind !== n.kind) { next.kind = t.kind; if (n.kind === 'human') next.was = 'human' }
  if (t.role) next.role = t.role
  if (t.sub) next.sub = t.sub
  if (t.method && t.method !== n.method) { next.method = t.method; if (n.kind === 'data' && (!n.method || n.method === 'manual')) next.was = 'manual' }
  next.flag = t.flag ?? 'ok'
  let edges = flow.edges
  if (next.kind === 'data' && next.method && next.method !== 'manual') {
    edges = edges.map((e) => (e.kind === 'pending' && (e.from === id || e.to === id) ? { ...e, kind: 'data' as const } : e))
  }
  if (n.kind === 'human' && next.kind !== 'human' && next.kind !== 'data' && (next.y ?? 0) > 440) next.y = 300
  return {
    flow: { ...flow, nodes: flow.nodes.map((x) => (x.id === id ? next : x)), edges },
    message: `已应用：「${n.name}」变成打通后的样子（对照现状可看变化）`,
  }
}
