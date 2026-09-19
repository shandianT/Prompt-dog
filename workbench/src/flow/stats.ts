import type { Flow, EdgeKind, NodeKind, NodeFlag } from './types'
import { EDGE_KINDS } from './types'

/** 算进「自动」那一列的节点类型：工作狗、技能、行业 know-how */
export const AUTOMATED_KINDS: readonly NodeKind[] = ['dog', 'skill', 'know']

/** 顶栏那五个数字。process-rebuild.md 的口径：自动 N · 人 N · 卡点 N · 缺口 N · 待打通 N */
export interface FiveNumbers {
  auto: number
  human: number
  block: number
  missing: number
  pending: number
}

export function fiveNumbers(flow: Flow): FiveNumbers {
  const flagIs = (f: NodeFlag) => flow.nodes.filter((n) => (n.flag ?? 'ok') === f).length
  return {
    auto: flow.nodes.filter((n) => AUTOMATED_KINDS.includes(n.kind)).length,
    human: flow.nodes.filter((n) => n.kind === 'human').length,
    block: flagIs('block'),
    missing: flagIs('missing'),
    pending: flagIs('pending'),
  }
}

export function edgeCounts(flow: Flow): Record<EdgeKind, number> {
  const out = Object.fromEntries(EDGE_KINDS.map((k) => [k, 0])) as Record<EdgeKind, number>
  for (const e of flow.edges) out[e.kind] += 1
  return out
}

/** 子图节点数（工作狗钻取用），不计入五个数字 */
export function childNodeCount(flow: Flow): number {
  return flow.nodes.reduce((n, node) => n + (node.children?.length ?? 0), 0)
}
