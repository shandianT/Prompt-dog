/**
 * 运行态（S10）：读上岗循环写的 验收清单.json（结构见 references/run-loop.md），把打钩数放回图上。
 * 画布不执行任何东西——狗在上岗时每轮把 passes 写回这个文件，这里只是把数据放回图上。
 *
 * run-loop.md 之外的三个可选字段，画布用来把状态放回图上，上岗循环不写它们也能用：
 *   环节[].节点     这一环节对应的画布节点（主控文件写进「服务流程与节点号」）
 *   复用[]         复用的狗 / 技能：名称、节点、验收通过 / 总数
 *   节点状态[]      不属于环节的节点（人、未到的步骤）的一句状态
 */
export interface RunItem { 项: string; passes: boolean }
export interface RunStep { id: number; 名称: string; 节点?: string; 验收: RunItem[]; passes?: boolean; 当前?: boolean; 备注?: string }
export interface RunReuse { 名称: string; 节点: string; 验收通过: number; 验收总数: number }
export interface RunNodeState { 节点: string; 状态: string; 阶段: 'ok' | 'wait' | 'todo' }
export interface RunList {
  场景: string
  版本?: string
  任务?: string
  轮次: number
  最大轮次?: number
  状态: string
  更新于?: string
  不可逆动作?: string[]
  环节: RunStep[]
  复用?: RunReuse[]
  节点状态?: RunNodeState[]
}

/** 节点上的运行态徽章：✓ 全过 / ● 正在跑 / 等人 / 还没到 */
export interface RunBadge {
  state: 'ok' | 'running' | 'wait' | 'todo'
  text: string
  /** 当前正在跑的环节，节点外圈琥珀光晕 */
  current?: boolean
}

export function runBadges(list: RunList): Record<string, RunBadge> {
  const out: Record<string, RunBadge> = {}
  for (const s of list.环节) {
    if (!s.节点) continue
    const total = s.验收.length, passed = s.验收.filter((v) => v.passes).length
    if (s.当前) out[s.节点] = { state: 'running', text: `● ${passed} / ${total} · 第 ${list.轮次} 轮`, current: true }
    else if (total > 0 && passed === total) out[s.节点] = { state: 'ok', text: `✓ ${passed} / ${total}` }
    else out[s.节点] = { state: 'todo', text: `${passed} / ${total}` }
  }
  for (const r of list.复用 ?? []) {
    const done = r.验收通过 >= r.验收总数
    out[r.节点] = { state: done ? 'ok' : 'todo', text: `${done ? '✓ ' : ''}${r.验收通过} / ${r.验收总数}` }
  }
  for (const n of list.节点状态 ?? []) out[n.节点] = { state: n.阶段, text: n.状态 }
  return out
}

export interface RunSummary { title: string; passed: number; total: number; current?: RunStep; stop: string; updated: string }

export function runSummary(list: RunList): RunSummary {
  const total = list.环节.reduce((a, s) => a + s.验收.length, 0)
  const passed = list.环节.reduce((a, s) => a + s.验收.filter((v) => v.passes).length, 0)
  return {
    title: `${list.场景} · 第 ${list.轮次} 轮`,
    passed, total,
    current: list.环节.find((s) => s.当前),
    stop: list.状态 === '待确认' ? '待确认' : list.状态 === '止损' ? '止损' : '无',
    updated: list.更新于 ?? '',
  }
}
