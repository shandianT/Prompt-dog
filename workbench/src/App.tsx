import sample from '../sample/投标流程.json'
import {
  validateFlow, enumDrift, checkCompat, checkRefs,
  fiveNumbers, edgeCounts, childNodeCount, laneOf, compatRuleTexts,
  type Flow, type FlowNode,
} from './flow'

/**
 * S01 的产物只有骨架与契约，所以首屏是一张「契约自检」页，不是产品的 01 首页。
 * 它回答一件事：schema、示例数据、类型、四条规则，是不是真的对得上。
 * 画布本身从 S02 / S03 开始建。
 */

const FLAG_LABEL: Record<string, string> = { block: '卡点', missing: '缺口', pending: '待打通' }
const FLAG_COLOR: Record<string, string> = { block: 'text-hi', missing: 'text-amber', pending: 'text-lo' }
const KIND_LABEL: Record<string, string> = { human: '人', dog: '工作狗', skill: '技能', know: 'know-how', data: '数据 / 系统' }
const LANE_LABEL: Record<string, string> = { ai: 'AI 自动', human: '人', data: '数据与系统' }

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-white p-5">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-card font-extrabold">{title}</h2>
        {note && <span className="text-aux text-sub">{note}</span>}
      </div>
      {children}
    </section>
  )
}

function Check({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-2.5 border-t border-line py-2 first:border-t-0 first:pt-0">
      <span className={`mt-0.5 font-bold ${ok ? 'text-ok' : 'text-hi'}`}>{ok ? '✓' : '✗'}</span>
      <div className="min-w-0">
        <div className="text-aux font-semibold">{label}</div>
        {detail && <div className="text-tag text-sub leading-relaxed">{detail}</div>}
      </div>
    </div>
  )
}

function Tile({ value, label, color = 'text-ink' }: { value: number; label: string; color?: string }) {
  return (
    <div className="rounded-btn border border-line px-4 py-3">
      <div className={`text-[30px] font-extrabold leading-none ${color}`}>{value}</div>
      <div className="text-aux text-sub mt-1">{label}</div>
    </div>
  )
}

export default function App() {
  const result = validateFlow(sample)
  const drift = enumDrift()
  const flow = sample as unknown as Flow
  const refs = result.ok ? checkRefs(flow) : []
  const compat = result.ok ? checkCompat(flow) : []
  const five = fiveNumbers(flow)
  const edges = edgeCounts(flow)
  const flagged: FlowNode[] = flow.nodes.filter((n) => n.flag && n.flag !== 'ok')
  const allOk = result.ok && !drift.length && !refs.length && !compat.length

  return (
    <div className="mx-auto max-w-[1100px] p-8 pb-16">
      <header className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-[28px] leading-none">🐕</span>
          <h1 className="text-title font-extrabold tracking-tight">工作台 · 契约自检</h1>
          <span className="text-aux text-sub">S01 工程骨架与数据契约</span>
        </div>
        <p className="text-aux text-sub mt-2 leading-relaxed">
          这一屏不是产品界面，是骨架的自检页：确认 <code className="font-mono">flow.schema.json</code>、示例数据、
          TypeScript 类型、<code className="font-mono">x-compat</code> 四条规则四者对得上。画布从 S02 / S03 开始建。
        </p>
      </header>

      <div
        className={`rounded-card mb-6 border px-5 py-4 ${allOk ? 'border-ok bg-[#f0faf2]' : 'border-hi bg-[#fff1f2]'}`}
      >
        <div className={`text-card font-extrabold ${allOk ? 'text-ok' : 'text-hi'}`}>
          {allOk ? '契约自检全部通过' : '契约自检未通过'}
        </div>
        <div className="text-aux text-sub mt-1">
          同样的检查在命令行里跑：<code className="font-mono">npm run check</code>（类型 + lint + 契约），
          反向测试跑 <code className="font-mono">npx tsx scripts/check-guards.ts</code>
        </div>
      </div>

      <div className="grid items-start gap-5 md:grid-cols-2">
        <Card title="四道检查" note="任一不过，命令行退出码 1">
          <Check ok={result.ok} label="示例符合 flow.schema.json" detail={result.problems.map((p) => `${p.where}: ${p.message}`).join('；') || `${flow.nodes.length} 节点 · ${flow.edges.length} 条线，逐字段过 schema`} />
          <Check ok={!drift.length} label="types.ts 的枚举等于 schema 的枚举" detail={drift.map((p) => p.message).join('；') || '八组枚举逐一比对：kind / role / flag / was / method / dir / edge.kind / dtype'} />
          <Check ok={!refs.length} label="连线两端都指向存在的节点，id 无重复" detail={refs.map((f) => f.message).join('；') || '跨对象引用 schema 管不到，单独查'} />
          <Check ok={!compat.length} label="x-compat 四条规则全过" detail={compat.map((f) => `[规则 ${f.rule + 1}] ${f.message}`).join('；') || '字段合法不等于组合合法，这四条查的是组合'} />
        </Card>

        <Card title={flow.name} note={flow.essence}>
          <div className="grid grid-cols-5 gap-2">
            <Tile value={five.auto} label="自动" />
            <Tile value={five.human} label="人" />
            <Tile value={five.block} label="卡点" color="text-hi" />
            <Tile value={five.missing} label="缺口" color="text-amber" />
            <Tile value={five.pending} label="待打通" color="text-lo" />
          </div>
          <div className="text-aux text-sub mt-3 leading-relaxed">
            {flow.nodes.length} 个节点（另有子图 {childNodeCount(flow)} 个）· {flow.edges.length} 条线
          </div>
          <div className="text-aux text-sub flex flex-wrap gap-x-3 gap-y-1">
            {([['顺序', edges.seq], ['数据', edges.data], ['待打通', edges.pending], ['回填', edges.loop], ['退回', edges.back]] as const).map(
              ([k, v]) => (
                <span key={k} className="whitespace-nowrap">
                  {k} <b className="text-ink font-semibold">{v}</b>
                </span>
              ),
            )}
          </div>
          <div className="text-tag text-sub mt-1">
            数据从 <code className="font-mono">design/workbench/flow.py</code> 导出，
            跑 <code className="font-mono">npm run sample</code> 重新生成并校验
          </div>
        </Card>

        <Card title="诊断清单" note="三种标记，每条写了怎么解">
          <div className="flex flex-col">
            {flagged.map((n) => (
              <div key={n.id} className="border-t border-line py-2.5 first:border-t-0 first:pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-tag text-sub">{n.id}</span>
                  <span className="text-aux font-bold">{n.name}</span>
                  <span className={`text-tag font-bold ${FLAG_COLOR[n.flag ?? ''] ?? ''}`}>
                    {FLAG_LABEL[n.flag ?? ''] ?? n.flag}
                  </span>
                  <span className="text-tag text-sub ml-auto">
                    {KIND_LABEL[n.kind]} · {LANE_LABEL[laneOf(n.y)]}泳道
                  </span>
                </div>
                {n.fix && <div className="text-tag text-sub mt-1 leading-relaxed">怎么解：{n.fix}</div>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="x-compat 四条规则" note="schema 表达不了的组合约束">
          <ol className="text-aux text-sub m-0 flex list-decimal flex-col gap-2 pl-5 leading-relaxed">
            {compatRuleTexts.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          <div className="text-tag text-sub mt-3 leading-relaxed">
            四条都在 <code className="font-mono">src/flow/compat.ts</code> 里实现，
            <code className="font-mono">scripts/check-guards.ts</code> 用故意改坏的流程图证明每条真的会报错。
          </div>
        </Card>
      </div>
    </div>
  )
}
