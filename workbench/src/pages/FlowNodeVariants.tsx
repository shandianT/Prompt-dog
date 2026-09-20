import { useState } from 'react'
import { FlowNodeCard, type DiffChip, type RunBadge } from '../components/FlowNode'
import {
  NODE_FLAGS, NODE_KINDS, DATA_TYPES, PORT_COLOR, OUTPUT_TYPE,
  FLAG_LABEL, KIND_LABEL, ROLE_LABEL,
  type FlowNode, type NodeFlag, type NodeKind, type NodeRole,
} from '../flow'

/**
 * FlowNode 变体矩阵：kind × role × flag 全部组合，加上交互态、对照 chip、角标。
 * 这一页是给人看的——改了组件样式，先到这里扫一眼哪个变体坏了，再去画布上找。
 */

/** 数据节点不谈「谁来做」，但矩阵仍按 3 列排，好让「这一格故意没有角色徽章」看得见 */
const ROLES: NodeRole[] = ['auto', 'review', 'decide']

const SAMPLE_NAME: Record<NodeKind, { name: string; sub: string }> = {
  human: { name: '报价', sub: '财务 · 成本核算' },
  dog: { name: '分章撰写', sub: '标书撰写 · 环节 3' },
  skill: { name: '素材检索', sub: '技能 · 资质 / 业绩' },
  know: { name: '废标项清单', sub: '行业库' },
  data: { name: 'ERP 成本', sub: '物料 · 人工 · 历史报价' },
}

function node(kind: NodeKind, role: NodeRole, flag: NodeFlag, extra: Partial<FlowNode> = {}): FlowNode {
  const s = SAMPLE_NAME[kind]
  return { id: `${kind}-${role || 'none'}-${flag}`, kind, role, flag, name: s.name, sub: s.sub, ...extra }
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-card font-extrabold">{title}</h2>
        {note && <span className="text-aux text-sub">{note}</span>}
      </div>
      {children}
    </section>
  )
}

function Cell({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-[84px] items-center justify-center">{children}</div>
      {label && <span className="text-tag text-sub">{label}</span>}
    </div>
  )
}

function KindMatrix({ kind }: { kind: NodeKind }) {
  const dataKind = kind === 'data'
  return (
    <div className="rounded-card border border-line bg-white p-5" data-testid="kind-matrix">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-card font-extrabold">{KIND_LABEL[kind]}</span>
        <span className="text-tag text-sub font-mono">kind = {kind}</span>
        {dataKind && <span className="text-tag text-sub">数据节点不谈「谁来做」，三行故意都不画角色徽章</span>}
      </div>
      <div className="grid grid-cols-[62px_repeat(4,minmax(0,1fr))] items-center gap-x-2">
        <div />
        {NODE_FLAGS.map((f) => (
          <div key={f} className="text-tag text-sub pb-2 text-center font-semibold">
            {FLAG_LABEL[f]}
            <span className="font-mono opacity-60"> {f}</span>
          </div>
        ))}
        {ROLES.map((role) => (
          <FlowNodeRow key={role} kind={kind} role={role} />
        ))}
      </div>
    </div>
  )
}

function FlowNodeRow({ kind, role }: { kind: NodeKind; role: NodeRole }) {
  return (
    <>
      <div className="text-tag text-sub text-right font-semibold">{ROLE_LABEL[role]}</div>
      {NODE_FLAGS.map((flag) => (
        <Cell key={flag}>
          <FlowNodeCard node={node(kind, role, flag)} />
        </Cell>
      ))}
    </>
  )
}

const DIFFS: DiffChip[] = ['原：人做', '原：手工搬', '新增']
const RUNS: RunBadge[] = [
  { state: 'ok', text: '✓ 2 / 2' },
  { state: 'running', text: '● 1 / 3 · 第 3 轮' },
  { state: 'wait', text: '等财务' },
  { state: 'todo', text: '0 / 2' },
]

export default function FlowNodeVariants() {
  const [role, setRole] = useState<NodeRole>('auto')
  const total = NODE_KINDS.length * ROLES.length * NODE_FLAGS.length

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-title font-extrabold tracking-tight">FlowNode 变体</h1>
        <p className="text-aux text-sub mt-2 leading-relaxed">
          kind {NODE_KINDS.length} × role {ROLES.length} × flag {NODE_FLAGS.length} =
          <b className="text-ink"> {total} </b>
          个组合，加交互态、对照 chip 与三种角标。视觉编码按 SPEC §6.3：人节点琥珀 1.5px 边框，
          数据节点暖灰底，三种标记压右上角（卡点实边、缺口与待打通虚边）。
        </p>
      </header>

      <Section title={`全部组合 · ${total} 个`} note="每一格都是真组件渲染的，不是截图">
        <div className="flex flex-col gap-5">
          {NODE_KINDS.map((k) => (
            <KindMatrix key={k} kind={k} />
          ))}
        </div>
      </Section>

      <Section title="交互态" note="叠加在任何组合之上">
        <div className="rounded-card grid grid-cols-2 gap-x-2 gap-y-4 border border-line bg-white p-5 md:grid-cols-4">
          <Cell label="选中 · 琥珀描边 + 投影">
            <FlowNodeCard node={node('dog', 'auto', 'ok')} selected />
          </Cell>
          <Cell label="连线中 · 蓝色光晕表示可落点">
            <FlowNodeCard node={node('skill', 'auto', 'ok')} connecting />
          </Cell>
          <Cell label="运行中 · 琥珀双圈">
            <FlowNodeCard node={node('dog', 'auto', 'ok')} running run={{ state: 'running', text: '● 1 / 3' }} />
          </Cell>
          <Cell label="压暗 38% · 对照现状里没变过的">
            <FlowNodeCard node={node('human', 'decide', 'ok')} dim />
          </Cell>
        </div>
      </Section>

      <Section title="对照 chip" note="压左上角，与右上角的状态标记分列两侧">
        <div className="rounded-card grid grid-cols-2 gap-x-2 gap-y-4 border border-line bg-white p-5 md:grid-cols-4">
          {DIFFS.map((d) => (
            <Cell key={d} label={d === '新增' ? '绿底' : '黑底'}>
              <FlowNodeCard node={node(d === '新增' ? 'skill' : 'dog', 'auto', 'ok')} diff={d} />
            </Cell>
          ))}
          <Cell label="标记与 chip 同时出现">
            <FlowNodeCard node={node('skill', 'auto', 'missing')} diff="原：人做" />
          </Cell>
        </div>
      </Section>

      <Section title="角标" note="右下角子图 / 受保护，左下角运行态">
        <div className="rounded-card grid grid-cols-2 gap-x-2 gap-y-4 border border-line bg-white p-5 md:grid-cols-4">
          <Cell label="工作狗的子图，双击钻取">
            <FlowNodeCard
              node={node('dog', 'auto', 'ok', {
                name: '合同条款审查',
                sub: '合同审查 · 复用 · 7 环节',
                children: Array.from({ length: 7 }, (_, i) => node('skill', 'auto', 'ok', { id: `c${i}` })),
              })}
            />
          </Cell>
          <Cell label="不可逆动作前，不可改为自动">
            <FlowNodeCard node={node('human', 'decide', 'ok', { name: '递交', sub: '人工确认点', irreversible: true })} />
          </Cell>
          {RUNS.slice(0, 2).map((r) => (
            <Cell key={r.text} label={`运行态 · ${r.state}`}>
              <FlowNodeCard node={node('dog', 'auto', 'ok')} run={r} />
            </Cell>
          ))}
        </div>
      </Section>

      <Section title="角色徽章可点" note="点一下循环切换 自动 → 人审 → 人定，画布上靠它改人机边界">
        <div className="rounded-card flex items-center gap-8 border border-line bg-white p-5">
          <FlowNodeCard
            node={node('human', role, 'ok')}
            interactive
            onRoleCycle={setRole}
          />
          <div className="text-aux text-sub">
            当前 role = <code className="font-mono text-ink">{role}</code>
            <div className="text-tag mt-1">同一个组件，受控：点击只抛出下一个值，改不改由画布决定。</div>
          </div>
        </div>
      </Section>

      <Section title="端口颜色 = 产物类型" note="取值来自 flow.schema.json 的 x-compat.port">
        <div className="rounded-card border border-line bg-white p-5">
          <div className="mb-4 flex flex-wrap gap-4">
            {DATA_TYPES.map((t) => (
              <span key={t} className="text-aux flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full border-2 bg-white"
                  style={{ borderColor: PORT_COLOR[t] }}
                />
                <code className="font-mono">{t}</code>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 md:grid-cols-5">
            {NODE_KINDS.map((k) => (
              <Cell key={k} label={`${KIND_LABEL[k]} 出 ${OUTPUT_TYPE[k]}`}>
                <FlowNodeCard node={node(k, 'auto', 'ok')} />
              </Cell>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
