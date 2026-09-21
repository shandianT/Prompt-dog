import { useState, type ReactNode } from 'react'
import './Inspector.css'
import {
  DATA_TYPES, EDGE_KINDS, checkCompat, diffSummary, fiveNumbers, runBadges, runSummary,
  DIR_LABEL, DTYPE_LABEL, EDGE_LABEL, FLAG_LABEL, KIND_LABEL, METHOD_LABEL, ROLE_LABEL,
  type CompatFinding, type DataDir, type DataMethod, type DataType, type EdgeKind, type Flow, type FlowEdge, type FlowNode, type NodeFlag, type NodeRole,
  type RunBadge, type RunList,
} from '../flow'
import type { CanvasView } from './options'
import type { FlowEditor } from './useFlowEditor'

/**
 * 属性面板（SPEC §6.5）：右栏——无选中时按画布的看图方式显示诊断 / 对照汇总 / 运行态，选一个节点显示分类型字段，选一条线显示产物 / 类型 / 关系 / 契约。
 * 所有改动走 editor.updateNode / updateEdge，一次改动一步撤销；文本框失焦或回车才写回，不是每个键一步。
 * 「应用建议」把节点切到 target（S10）；「打开子流程」是 S11——到那条故事再加，这里不放灰按钮。
 */
export function Inspector({ editor, view = 'edit', initial, run }: { editor: FlowEditor; view?: CanvasView; initial: Flow; run?: RunList }) {
  const { flow, selectedIds, selectedEdgeIds } = editor
  const node = selectedIds.length === 1 ? flow.nodes.find((n) => n.id === selectedIds[0]) : undefined
  const edge = !node && selectedIds.length === 0 && selectedEdgeIds.length === 1 ? flow.edges.find((e) => e.id === selectedEdgeIds[0]) : undefined
  const mode = node ? 'node' : edge ? 'edge' : view === 'diff' ? 'diff' : view === 'run' && run ? 'run' : 'diag'
  return (
    <aside className="ins" data-testid="inspector" data-mode={mode} aria-label="属性面板">
      {node ? <NodeView key={node.id} node={node} editor={editor} />
        : edge ? <EdgeView key={edge.id} edge={edge} editor={editor} />
        : mode === 'diff' ? <DiffView editor={editor} initial={initial} />
        : mode === 'run' && run ? <RunView editor={editor} run={run} />
        : <DiagView editor={editor} />}
    </aside>
  )
}

// ---- 小件

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="ins__f"><span className="ins__lb">{label}</span>{children}</div>
}

/** 文本框：本地编辑，失焦或回车才写回（一次编辑 = 一步撤销），Esc 放弃。外部值变了（撤销）由父组件用 key 重建 */
function TextField({ value, onCommit, multiline = false, placeholder, testId }: {
  value: string; onCommit: (v: string) => void; multiline?: boolean; placeholder?: string; testId?: string
}) {
  const [v, setV] = useState(value)
  const commit = () => { if (v !== value) onCommit(v) }
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) e.currentTarget.blur()
    if (e.key === 'Escape') { setV(value); e.currentTarget.blur() }
  }
  const shared = { value: v, placeholder, 'data-testid': testId, onBlur: commit, onKeyDown }
  return multiline
    ? <textarea {...shared} className="ins__fi ins__ta" rows={3} onChange={(e) => setV(e.target.value)} />
    : <input {...shared} className="ins__fi" onChange={(e) => setV(e.target.value)} />
}

interface SegOption<T extends string> { v: T; label: string; disabled?: boolean; title?: string }

/** 分段选择（原型 .seg）：一组互斥按钮，选中态琥珀；卡点 / 待打通有自己的颜色 */
function Seg<T extends string>({ options, value, onPick, testId }: { options: SegOption<T>[]; value: T | undefined; onPick: (v: T) => void; testId?: string }) {
  return (
    <div className="seg" role="radiogroup" data-testid={testId}>
      {options.map((o) => (
        <button
          key={o.v} type="button" role="radio" aria-checked={o.v === value} disabled={o.disabled} title={o.title}
          className={`seg__b seg__b--${o.v || 'none'}${o.v === value ? ' seg__b--on' : ''}`}
          onClick={() => onPick(o.v)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Chips({ items, onPick, empty = '无' }: { items: { id: string; name: string }[]; onPick: (id: string) => void; empty?: string }) {
  if (!items.length) return <span className="ins__muted">{empty}</span>
  return (
    <div className="chips">
      {items.map((n) => <button key={n.id} type="button" className="chip" onClick={() => onPick(n.id)} data-node={n.id}>{n.name}</button>)}
    </div>
  )
}

/** x-compat 四条规则里与当前对象有关的：只提示，不拦——拦了就没法先改到中间态再改回来 */
function Warnings({ items }: { items: CompatFinding[] }) {
  if (!items.length) return null
  return (
    <div className="ins__warn" role="alert" data-testid="compat-warning">
      {items.map((f) => <div key={f.where + f.message}><b>契约规则 {f.rule + 1}</b>：{f.message}</div>)}
    </div>
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return <button type="button" className="btn btn--sm ins__close" onClick={onClick} data-testid="close">关闭</button>
}

// ---- 选项表

const ROLE_OPTIONS: SegOption<NodeRole>[] = (['auto', 'review', 'decide'] as const).map((v) => ({ v, label: ROLE_LABEL[v] }))
const FLAG_OPTIONS: SegOption<NodeFlag>[] = (['ok', 'block', 'missing', 'pending'] as const).map((v) => ({ v, label: FLAG_LABEL[v] }))
const METHOD_OPTIONS: SegOption<DataMethod>[] = (['api', 'rpa', 'file', 'manual'] as const).map((v) => ({ v, label: METHOD_LABEL[v] }))
const DIR_OPTIONS: SegOption<DataDir>[] = (['read', 'write', 'rw'] as const).map((v) => ({ v, label: DIR_LABEL[v] }))
const NOTIFY_OPTIONS: SegOption<string>[] = ['企业微信', '邮件', '站内'].map((v) => ({ v, label: v }))
const SRC_OPTIONS: SegOption<string>[] = ['行业库', '你的材料', '待沉淀'].map((v) => ({ v, label: v }))
const DTYPE_OPTIONS: SegOption<DataType>[] = DATA_TYPES.map((v) => ({ v, label: DTYPE_LABEL[v] }))
const KIND_OPTIONS: SegOption<EdgeKind>[] = EDGE_KINDS.map((v) => ({ v, label: EDGE_LABEL[v] }))

// ---- 三态

const DIAG_ROWS: { flag: NodeFlag; label: string; hint: string; color: string }[] = [
  { flag: 'block', label: '卡点', hint: '流程在哪等人', color: 'var(--color-hi)' },
  { flag: 'missing', label: '缺口', hint: '缺组件 / 材料', color: 'var(--color-amber)' },
  { flag: 'pending', label: '待打通', hint: '人在搬数据', color: 'var(--color-lo)' },
]

function DiagView({ editor }: { editor: FlowEditor }) {
  const { flow } = editor
  const five = fiveNumbers(flow)
  const count = { block: five.block, missing: five.missing, pending: five.pending } as const
  const flagged = flow.nodes.filter((n) => n.flag && n.flag !== 'ok')
  return (
    <>
      <div className="ins__h"><b>诊断</b><span className="ins__muted">按标记实时汇总</span></div>
      <div className="dg">
        {DIAG_ROWS.map((r) => (
          <div key={r.flag} className="dg__row" data-testid={`diag-${r.flag}`}>
            <div className="dg__t">
              <span className="dg__dot" style={{ background: r.color }} />
              {r.label} <b data-count={count[r.flag as keyof typeof count]}>{count[r.flag as keyof typeof count]}</b>
              <span className="ins__muted dg__hint">{r.hint}</span>
            </div>
            <Chips items={flow.nodes.filter((n) => n.flag === r.flag)} onPick={editor.select} empty="没有" />
          </div>
        ))}
      </div>
      <div className="ins__h"><b>重构建议</b><span className="ins__muted">「应用」= 把它改成打通后的样子</span></div>
      <ol className="sug" data-testid="diag-suggestions">
        {flagged.map((n) => (
          <li key={n.id}>
            <button type="button" className="sug__go" onClick={() => editor.select(n.id)}>{n.name}</button>：{n.fix || n.note || '还没写怎么解'}
            {n.target && <button type="button" className="sug__apply" data-apply={n.id} onClick={() => editor.applyFix(n.id)}>应用</button>}
          </li>
        ))}
      </ol>
      <div className="ins__hint">拖节点 = 移动（先锁在本泳道）；空白处拖 = 框选；Shift + 点 = 加选；点节点或线，在这里改字段；Delete 删除；Cmd/Ctrl+Z 撤销。</div>
      <div className="ins__foot"><button type="button" className="btn" onClick={editor.reset} data-testid="reset">重置示例</button></div>
    </>
  )
}

function NodeView({ node, editor }: { node: FlowNode; editor: FlowEditor }) {
  const { flow } = editor
  const set = (patch: Partial<FlowNode>) => editor.updateNode(node.id, patch)
  const byId = new Map(flow.nodes.map((n) => [n.id, n]))
  const ins = flow.edges.filter((e) => e.to === node.id).map((e) => byId.get(e.from)).filter((n): n is FlowNode => !!n)
  const outs = flow.edges.filter((e) => e.from === node.id).map((e) => byId.get(e.to)).filter((n): n is FlowNode => !!n)
  const isData = node.kind === 'data'
  // 不可逆动作前的人定节点受保护（x-compat 规则 3）：谁来做只能是人定
  const guarded = !!node.irreversible
  const roleOptions = ROLE_OPTIONS.map((o) => (guarded && o.v !== 'decide' ? { ...o, disabled: true, title: '不可逆动作前的人定节点，受保护，不能改成自动或人审' } : o))
  const warnings = checkCompat(flow).filter((f) => f.where.startsWith(`nodes/${node.id}`))
  return (
    <>
      <div className="ins__h">
        <span className={`fnode__kind fnode__kind--${node.kind}`} data-testid="node-kind">{KIND_LABEL[node.kind]}</span>
        <span className="ins__muted">{node.id}{guarded ? ' · 🔒 受保护' : ''}</span>
        <CloseButton onClick={editor.clearSelection} />
      </div>
      <Field label="名称"><TextField key={node.name} value={node.name} onCommit={(v) => set({ name: v })} testId="f-name" /></Field>
      <Field label="说明"><TextField key={node.sub ?? ''} value={node.sub ?? ''} onCommit={(v) => set({ sub: v })} placeholder="部门 / 来源 / 环节号" testId="f-sub" /></Field>
      {!isData && <Field label="谁来做"><Seg options={roleOptions} value={node.role} onPick={(v) => set({ role: v })} testId="f-role" /></Field>}
      <Field label="状态"><Seg options={FLAG_OPTIONS} value={node.flag ?? 'ok'} onPick={(v) => set({ flag: v })} testId="f-flag" /></Field>
      {node.kind === 'human' && (
        <>
          <div className="ins__kv">
            <Field label="负责人 / 部门"><TextField key={node.owner ?? ''} value={node.owner ?? ''} onCommit={(v) => set({ owner: v })} /></Field>
            <Field label="时限"><TextField key={node.sla ?? ''} value={node.sla ?? ''} onCommit={(v) => set({ sla: v })} placeholder="如 2 天" /></Field>
          </div>
          <Field label="通知"><Seg options={NOTIFY_OPTIONS} value={node.notify} onPick={(v) => set({ notify: v })} /></Field>
        </>
      )}
      {isData && (
        <>
          <Field label="打通方式"><Seg options={METHOD_OPTIONS} value={node.method} onPick={(v) => set({ method: v })} testId="f-method" /></Field>
          <Field label="方向"><Seg options={DIR_OPTIONS} value={node.dir} onPick={(v) => set({ dir: v })} /></Field>
          <Field label="系统负责人"><TextField key={node.owner ?? ''} value={node.owner ?? ''} onCommit={(v) => set({ owner: v })} /></Field>
        </>
      )}
      {node.kind === 'dog' && (
        <div className="ins__kv">
          <Field label="子流程"><b>{node.children?.length ? `${node.children.length} 环节` : '无（可框选打包）'}</b></Field>
          <Field label="复用于"><b>{node.reuse ?? 1} 条流程</b></Field>
        </div>
      )}
      {node.kind === 'skill' && (
        <div className="ins__kv">
          <Field label="复用于"><b>{node.reuse ?? 1} 只工作狗</b></Field>
          <Field label="改一处"><b>全部同步</b></Field>
        </div>
      )}
      {node.kind === 'know' && <Field label="来源"><Seg options={SRC_OPTIONS} value={node.src} onPick={(v) => set({ src: v })} /></Field>}
      <Field label="备注 · 卡在哪 / 缺什么 / 要打通什么"><TextField key={node.note ?? ''} value={node.note ?? ''} onCommit={(v) => set({ note: v })} multiline /></Field>
      {node.flag && node.flag !== 'ok' && (
        <Field label="怎么解"><TextField key={node.fix ?? ''} value={node.fix ?? ''} onCommit={(v) => set({ fix: v })} multiline /></Field>
      )}
      {node.target && (
        <button type="button" className="btn btn--amber" onClick={() => editor.applyFix(node.id)} data-testid="apply">应用建议 · 变成打通后的样子</button>
      )}
      <Field label="输入"><Chips items={ins} onPick={editor.select} /></Field>
      <Field label="输出"><Chips items={outs} onPick={editor.select} /></Field>
      <Warnings items={warnings} />
      <div className="ins__foot"><button type="button" className="btn btn--danger" onClick={() => editor.deleteNodes([node.id])} data-testid="delete">删除节点</button></div>
    </>
  )
}

function EdgeView({ edge, editor }: { edge: FlowEdge; editor: FlowEditor }) {
  const { flow } = editor
  const set = (patch: Partial<FlowEdge>) => editor.updateEdge(edge.id, patch)
  const a = flow.nodes.find((n) => n.id === edge.from), b = flow.nodes.find((n) => n.id === edge.to)
  const warnings = checkCompat(flow).filter((f) => f.where.startsWith(`edges/${edge.id}`))
  return (
    <>
      <div className="ins__h"><b>连线</b><span className="ins__muted">{edge.id}</span><CloseButton onClick={editor.clearSelection} /></div>
      <div className="ins__pair" data-testid="edge-pair">
        <button type="button" className="chip" onClick={() => editor.select(edge.from)}>{a?.name ?? edge.from}</button>
        <span className="ins__muted">→</span>
        <button type="button" className="chip" onClick={() => editor.select(edge.to)}>{b?.name ?? edge.to}</button>
      </div>
      <Field label="流动的产物"><TextField key={edge.label ?? ''} value={edge.label ?? ''} onCommit={(v) => set({ label: v })} testId="f-label" /></Field>
      <Field label="产物类型"><Seg options={DTYPE_OPTIONS} value={edge.dtype} onPick={(v) => set({ dtype: v })} testId="f-dtype" /></Field>
      <Field label="关系"><Seg options={KIND_OPTIONS} value={edge.kind} onPick={(v) => set({ kind: v })} testId="f-kind" /></Field>
      <Field label="数据契约 · 字段 / 格式"><TextField key={edge.contract ?? ''} value={edge.contract ?? ''} onCommit={(v) => set({ contract: v })} multiline placeholder="字段与格式，打通时照这个对" /></Field>
      <div className="ins__hint">待打通 = 现在靠人搬；打通后改成「数据」就变实线。退回 = 人审不通过回到哪一步。回填 = 结果回流到上游资产。</div>
      <Warnings items={warnings} />
      <div className="ins__foot"><button type="button" className="btn btn--danger" onClick={() => editor.deleteEdges([edge.id])} data-testid="delete">删除连线</button></div>
    </>
  )
}

// ---- 对照现状 / 运行态（S10）：无选中时按画布的看图方式显示

const DIFF_ROWS: { flag: NodeFlag; label: string; color: string }[] = [
  { flag: 'block', label: '卡点', color: 'var(--color-hi)' },
  { flag: 'missing', label: '缺口', color: 'var(--color-amber)' },
  { flag: 'pending', label: '待打通', color: 'var(--color-lo)' },
]

/** 对照汇总（07.4）：五个数字前后对照，变过的节点按「原：人做 / 原：手工搬 / 新增」分组。这一层不改图，只改标注 */
function DiffView({ editor, initial }: { editor: FlowEditor; initial: Flow }) {
  const d = diffSummary(initial, editor.flow)
  const names = (nodes: FlowNode[]) => nodes.map((n) => n.name).join('、')
  const count = (five: typeof d.before, flag: NodeFlag) => (flag === 'block' ? five.block : flag === 'missing' ? five.missing : five.pending)
  return (
    <>
      <div className="ins__h"><b>对照现状</b><span className="ins__muted">变过的标出来，没变的压暗</span></div>
      <div className="dg">
        {DIFF_ROWS.map((r) => (
          <div key={r.flag} className="dg__row" data-testid={`diff-${r.flag}`}>
            <div className="dg__t"><span className="dg__dot" style={{ background: r.color }} />{r.label} {count(d.before, r.flag)} → {count(d.after, r.flag)}</div>
            <div className="ins__muted">{names(initial.nodes.filter((n) => n.flag === r.flag)) || '—'}</div>
          </div>
        ))}
      </div>
      <Field label="变化汇总">
        <ol className="sug" data-testid="diff-summary">
          <li>{d.was.human.length} 步从人做变自动（原：人做）{d.was.human.length ? `：${names(d.was.human)}` : ''}</li>
          <li>{d.was.manual.length} 处数据从手工搬变接口（原：手工搬）{d.was.manual.length ? `：${names(d.was.manual)}` : ''}</li>
          <li>{d.was.new.length} 步新增{d.was.new.length ? `：${names(d.was.new)}` : ''}</li>
          <li>人的步骤 {d.before.human} → {d.after.human}；自动 {d.before.auto} → {d.after.auto}</li>
        </ol>
      </Field>
      <div className="ins__hint">这一层不改图，只改标注。变化来自「应用建议」和拖过泳道边界；给老板看用汇报模式。</div>
    </>
  )
}

function RunRow({ id, name, badge, onPick }: { id?: string; name: string; badge?: RunBadge; onPick: (id: string) => void }) {
  return (
    <button type="button" className="runrow" onClick={() => id && onPick(id)} data-node={id}>
      <span className="runrow__name">{name}</span>
      <span className={`runrow__badge runrow__badge--${badge?.state ?? 'todo'}`}>{badge?.text ?? '—'}</span>
    </button>
  )
}

/** 运行态（07.5）：来自 验收清单.json。画布不执行任何东西，只把打钩数放回图上 */
function RunView({ editor, run }: { editor: FlowEditor; run: RunList }) {
  const s = runSummary(run), badges = runBadges(run)
  const nameOf = (id: string) => editor.flow.nodes.find((n) => n.id === id)?.name ?? id
  return (
    <>
      <div className="ins__h"><b>运行态</b><span className="ins__muted">来自 验收清单.json</span></div>
      <div className="ins__kv" data-testid="run-summary">
        <Field label="正在跑"><b>{s.title}</b></Field>
        <Field label="停机"><b>{s.stop}</b></Field>
        <Field label="验收"><b>{s.passed} / {s.total} 通过</b></Field>
        <Field label="更新于"><b>{s.updated || '—'}</b></Field>
      </div>
      <Field label="环节">
        {run.环节.map((st) => <RunRow key={st.id} id={st.节点} name={st.名称} badge={st.节点 ? badges[st.节点] : undefined} onPick={editor.select} />)}
      </Field>
      {run.复用?.length ? (
        <Field label="复用的狗">{run.复用.map((r) => <RunRow key={r.节点} id={r.节点} name={r.名称} badge={badges[r.节点]} onPick={editor.select} />)}</Field>
      ) : null}
      {run.节点状态?.length ? (
        <Field label="其他节点">{run.节点状态.map((n) => <RunRow key={n.节点} id={n.节点} name={nameOf(n.节点)} badge={badges[n.节点]} onPick={editor.select} />)}</Field>
      ) : null}
      {s.current?.备注 && <div className="ins__hint">{s.current.名称}：{s.current.备注}</div>}
      <div className="ins__hint">画布不执行任何东西：狗在上岗时每轮把打钩写回 验收清单.json，这里只是把数据放回图上。</div>
    </>
  )
}
