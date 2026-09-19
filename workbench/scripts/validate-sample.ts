/**
 * 契约自检，CI 可跑：
 *   1. sample/投标流程.json 是否符合 flow.schema.json
 *   2. types.ts 的枚举是否还等于 schema 的枚举
 *   3. x-compat 四条规则与引用完整性
 *   4. 打印计数，和 stories.json 的验收数字对照
 * 任何一项不过就退出码 1。
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { validateFlow, enumDrift, parseFlow } from '../src/flow/validate'
import { checkCompat, checkRefs } from '../src/flow/compat'
import { fiveNumbers, edgeCounts, childNodeCount } from '../src/flow/stats'

const samplePath = fileURLToPath(new URL('../sample/投标流程.json', import.meta.url))
const raw: unknown = JSON.parse(readFileSync(samplePath, 'utf8'))

let failed = false
const fail = (title: string, lines: string[]) => {
  failed = true
  console.error(`\n✗ ${title}`)
  for (const l of lines) console.error(`   ${l}`)
}
const pass = (title: string, detail = '') => console.log(`✓ ${title}${detail ? `  ${detail}` : ''}`)

// 1 schema
const result = validateFlow(raw)
if (!result.ok) fail('sample 不符合 flow.schema.json', result.problems.map((p) => `${p.where}: ${p.message}`))
else pass('sample 符合 flow.schema.json')

// 2 枚举漂移
const drift = enumDrift()
if (drift.length) fail('types.ts 与 schema 的枚举不一致', drift.map((p) => `${p.where}: ${p.message}`))
else pass('types.ts 的枚举与 schema 一致')

if (result.ok) {
  const flow = parseFlow(raw)

  // 3 x-compat 与引用
  const refs = checkRefs(flow)
  if (refs.length) fail('引用不完整', refs.map((f) => `${f.where}: ${f.message}`))
  else pass('连线两端都指向存在的节点，id 无重复')

  const compat = checkCompat(flow)
  if (compat.length) fail('x-compat 规则不通过', compat.map((f) => `[规则 ${f.rule + 1}] ${f.where}: ${f.message}\n      规则原文：${f.ruleText}`))
  else pass('x-compat 四条规则全过')

  // 4 计数
  const five = fiveNumbers(flow)
  const edges = edgeCounts(flow)
  console.log(
    `\n${flow.name}  ${flow.nodes.length} 节点（含子图 ${childNodeCount(flow)}）· ${flow.edges.length} 条线\n` +
    `  五问数字  自动 ${five.auto} · 人 ${five.human} · 卡点 ${five.block} · 缺口 ${five.missing} · 待打通 ${five.pending}\n` +
    `  连线种类  顺序 ${edges.seq} · 数据 ${edges.data} · 待打通 ${edges.pending} · 回填 ${edges.loop} · 退回 ${edges.back}`,
  )

  // stories.json S03 / S04 写死的验收数字
  const expected = { auto: 7, human: 7, block: 2, missing: 1, pending: 4 }
  const mismatch = Object.entries(expected).filter(([k, v]) => five[k as keyof typeof five] !== v)
  if (mismatch.length) {
    fail('五问数字与 stories.json S03 的验收不符', mismatch.map(([k, v]) => `${k}: 期望 ${v}，实际 ${five[k as keyof typeof five]}`))
  } else {
    pass('五问数字与 S03 验收一致', '自动 7 · 人 7 · 卡点 2 · 缺口 1 · 待打通 4')
  }
  const expectedEdges = { seq: 14, data: 3, pending: 4, loop: 1, back: 1 }
  const edgeMismatch = Object.entries(expectedEdges).filter(([k, v]) => edges[k as keyof typeof edges] !== v)
  if (edgeMismatch.length) {
    fail('连线计数与 stories.json S04 的验收不符', edgeMismatch.map(([k, v]) => `${k}: 期望 ${v}，实际 ${edges[k as keyof typeof edges]}`))
  } else {
    pass('连线计数与 S04 验收一致', '14 / 3 / 4 / 1 / 1')
  }
}

console.log(failed ? '\n契约自检未通过' : '\n契约自检全部通过')
process.exit(failed ? 1 : 0)
