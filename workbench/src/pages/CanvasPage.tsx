import { ReactFlowProvider, useViewport } from '@xyflow/react'
import sample from '../../sample/投标流程.json'
import { FlowCanvas, ZOOM_MAX, ZOOM_MIN } from '../canvas/FlowCanvas'
import { fiveNumbers, type Flow } from '../flow'

/**
 * 07 流程画布的第一版：顶栏五个数字 + 画布。示例数据来自 sample/投标流程.json。
 * 侧栏、组件库面板、属性面板都还没有——它们各有自己的故事（S06、S08、S13+）。
 */

const flow = sample as unknown as Flow

function Stat({ label, value, dot }: { label: string; value: number; dot?: string }) {
  return (
    <span className="text-aux flex h-7 items-center gap-1.5 rounded-tag border border-line bg-page px-2.5 text-sub whitespace-nowrap">
      {dot && <span className="inline-block h-2 w-2 rounded-full" style={{ background: dot }} />}
      {label} <b className="text-ink tabular-nums">{value}</b>
    </span>
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

export default function CanvasPage() {
  const five = fiveNumbers(flow)
  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-line bg-white px-5">
          <span className="text-[15px] font-bold whitespace-nowrap">{flow.name} · 组织流程画布</span>
          <span className="text-aux text-sub hidden md:inline">{flow.essence}</span>
          <div className="ml-auto flex items-center gap-1.5" data-testid="five-numbers">
            <Stat label="自动" value={five.auto} />
            <Stat label="人" value={five.human} />
            <Stat label="卡点" value={five.block} dot="var(--color-hi)" />
            <Stat label="缺口" value={five.missing} dot="var(--color-amber)" />
            <Stat label="待打通" value={five.pending} dot="var(--color-lo)" />
          </div>
          <ZoomReadout />
        </header>
        <div className="min-h-0 flex-1">
          <FlowCanvas flow={flow} />
        </div>
      </div>
    </ReactFlowProvider>
  )
}
