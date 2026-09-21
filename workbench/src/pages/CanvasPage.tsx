import { useCallback, useState } from 'react'
import { Panel, ReactFlowProvider, useReactFlow, useViewport } from '@xyflow/react'
import sample from '../../sample/投标流程.json'
import paletteSample from '../../sample/组件库.json'
import { FlowCanvas, ZOOM_MAX, ZOOM_MIN } from '../canvas/FlowCanvas'
import { EdgeLegend } from '../canvas/EdgeLegend'
import { fitFrame } from '../canvas/viewport'
import { SelectionBar } from '../canvas/SelectionBar'
import { Inspector } from '../canvas/Inspector'
import { Palette } from '../canvas/Palette'
import { QuickAdd } from '../canvas/QuickAdd'
import { PlacingLayer } from '../canvas/Placing'
import { ContextMenu } from '../canvas/ContextMenu'
import { useFlowEditor } from '../canvas/useFlowEditor'
import { PLACEHOLDER_ITEM, edgeCounts, fiveNumbers, type Flow, type PaletteGroup, type PaletteItem } from '../flow'

/**
 * 07 流程画布：顶栏五个数字 + 左栏组件库（S08）+ 画布 + 右栏属性面板（S06）。示例数据来自 sample/投标流程.json 与 组件库.json。
 * 侧栏还没有（S16+）。
 */

const flow = sample as unknown as Flow
const groups = paletteSample as PaletteGroup[]

function Stat({ label, value, dot }: { label: string; value: number; dot?: string }) {
  return (
    <span className="text-aux flex h-7 items-center gap-1.5 rounded-tag border border-line bg-page px-2.5 text-sub whitespace-nowrap">
      {dot && <span className="inline-block h-2 w-2 rounded-full" style={{ background: dot }} />}
      {label} <b className="text-ink tabular-nums">{value}</b>
    </span>
  )
}

/** 顶栏工具按钮：与原型 tb-btn 同款，开着是浅琥珀 */
function ToolButton({ on, disabled, onClick, children, testId }: { on?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode; testId?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      aria-pressed={on}
      className={`text-aux flex h-9 items-center gap-1.5 rounded-btn border px-3 font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40 ${
        on ? 'border-amber bg-amber-soft text-amber' : 'border-line bg-page text-sub hover:bg-white'
      }`}
    >
      {children}
    </button>
  )
}

function ZoomReadout() {
  const { zoom } = useViewport()
  return (
    <span className="text-tag text-sub font-mono tabular-nums" data-testid="zoom">
      {Math.round(zoom * 100)}%
      <span className="ml-1 opacity-60">（{ZOOM_MIN * 100}–{ZOOM_MAX * 100}%）</span>
    </span>
  )
}

/** 「适应」：回到整幅画布（与首帧同一种取景） */
function FitButton() {
  const inst = useReactFlow()
  return <ToolButton onClick={() => void fitFrame(inst, 200)} testId="fit">适应</ToolButton>
}

export default function CanvasPage() {
  const editor = useFlowEditor(flow)
  const five = fiveNumbers(editor.flow)
  const counts = edgeCounts(editor.flow)
  const [labels, setLabels] = useState(false)
  const [placing, setPlacing] = useState<PaletteItem | null>(null)
  const { addNode } = editor
  const onDrop = useCallback((item: PaletteItem, at: { x: number; y: number }) => { addNode(item, at.x, at.y); setPlacing(null) }, [addNode])
  const cancelPlacing = useCallback(() => setPlacing(null), [])
  const quick = editor.quick
  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-line bg-white px-5">
          <span className="text-[15px] font-bold whitespace-nowrap">{editor.flow.name} · 组织流程画布</span>
          <span className="text-aux text-sub hidden md:inline">{editor.flow.essence}</span>
          <div className="ml-auto flex items-center gap-1.5" data-testid="five-numbers">
            <Stat label="自动" value={five.auto} />
            <Stat label="人" value={five.human} />
            <Stat label="卡点" value={five.block} dot="var(--color-hi)" />
            <Stat label="缺口" value={five.missing} dot="var(--color-amber)" />
            <Stat label="待打通" value={five.pending} dot="var(--color-lo)" />
          </div>
          <ZoomReadout />
          <FitButton />
          <ToolButton onClick={editor.undo} disabled={!editor.canUndo} testId="undo">撤销</ToolButton>
          <ToolButton on={labels} onClick={() => setLabels((v) => !v)} testId="toggle-labels">
            产物{labels ? ' · 全部' : ''}
          </ToolButton>
        </header>
        <div className="flex min-h-0 flex-1">
          <Palette groups={groups} onGrab={setPlacing} onNewComponent={() => addNode(PLACEHOLDER_ITEM, 600, 330)} />
          <div className="min-w-0 flex-1">
            <FlowCanvas editor={editor} labels={labels}>
              {quick && (
                <QuickAdd
                  x={quick.x} y={quick.y} from={quick.from} flow={editor.flow} groups={groups}
                  onPick={(it) => addNode(it, quick.x + 75, quick.y + 32, quick.from)} onClose={editor.closeQuick}
                />
              )}
              {editor.selectedIds.length >= 2 && (
                <Panel position="top-center">
                  <SelectionBar count={editor.selectedIds.length} onDelete={editor.deleteSelected} onClear={editor.clearSelection} />
                </Panel>
              )}
              <Panel position="bottom-left">
                <EdgeLegend counts={counts} />
              </Panel>
              {editor.notice && (
                <Panel position="bottom-center" style={{ pointerEvents: 'none' }}>
                  <div className="toast" role="status" data-testid="toast" key={editor.notice.n}>{editor.notice.text}</div>
                </Panel>
              )}
            </FlowCanvas>
          </div>
          <Inspector editor={editor} />
        </div>
      </div>
      {placing && <PlacingLayer item={placing} onDrop={onDrop} onCancel={cancelPlacing} />}
      <ContextMenu editor={editor} />
    </ReactFlowProvider>
  )
}
