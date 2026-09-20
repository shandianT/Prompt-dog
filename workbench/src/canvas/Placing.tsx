import { useEffect, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { FlowNodeCard } from '../components/FlowNode'
import type { FlowNode, PaletteItem } from '../flow'

/**
 * 从组件库拖一项进画布：幽灵节点跟着指针（原型 .ghost），在画布上松手就在那个点新建；在别处松手或按 Esc 取消。
 * 落点从屏幕坐标换成画布坐标交给 onDrop；具体放哪条泳道由 palette.ts 的 newNode 定。
 */
export function PlacingLayer({ item, onDrop, onCancel }: { item: PaletteItem; onDrop: (item: PaletteItem, at: { x: number; y: number }) => void; onCancel: () => void }) {
  const rf = useReactFlow()
  const [at, setAt] = useState<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const move = (e: MouseEvent) => setAt({ x: e.clientX, y: e.clientY })
    const up = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el?.closest('.react-flow')) onDrop(item, rf.screenToFlowPosition({ x: e.clientX, y: e.clientY }))
      else onCancel()
    }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('keydown', key, true)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); window.removeEventListener('keydown', key, true) }
  }, [item, onDrop, onCancel, rf])
  if (!at) return null
  const preview: FlowNode = { id: 'ghost', kind: item.kind, role: item.kind === 'data' ? '' : (item.role ?? 'auto'), name: item.name, sub: item.sub, flag: item.kind === 'data' ? 'pending' : (item.flag ?? 'ok') }
  return (
    <div className="ghost" data-testid="ghost" style={{ left: at.x + 12, top: at.y + 12 }} aria-hidden>
      <FlowNodeCard node={preview} ports="none" />
    </div>
  )
}
