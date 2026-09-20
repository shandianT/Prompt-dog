import { useState } from 'react'
import { ViewportPortal, useViewport } from '@xyflow/react'
import { CANVAS_H, CANVAS_W, type Flow, type PaletteGroup, type PaletteItem } from '../flow'

/**
 * 组件搜索弹层（原型 .quick）：端口拖到空白松手、或双击空白时出现。输入即过滤，点一项或回车选第一项。
 * 画在 ViewportPortal 里锚在画布坐标上（跟着平移走），再按 1 / zoom 反向缩放，所以字号不随画布缩放变。
 */
export function QuickAdd({ x, y, from, flow, groups, onPick, onClose }: {
  x: number; y: number; from?: string; flow: Flow; groups: PaletteGroup[]; onPick: (item: PaletteItem) => void; onClose: () => void
}) {
  const { zoom } = useViewport()
  const [q, setQ] = useState('')
  const query = q.trim()
  const items = groups.flatMap((g) => g.items).filter((it) => !query || (it.name + (it.sub ?? '')).includes(query))
  const fromNode = from ? flow.nodes.find((n) => n.id === from) : undefined
  const left = Math.min(x, CANVAS_W - 250), top = Math.min(y, CANVAS_H - 300)
  return (
    <ViewportPortal>
      <div
        className="quick nowheel nopan" data-testid="quick" role="dialog" aria-label="搜组件"
        style={{ left, top, transform: `scale(${1 / zoom})` }}
        onMouseDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
      >
        <input
          className="ins__fi" autoFocus value={q} data-testid="quick-search"
          placeholder={fromNode ? `接在「${fromNode.name}」之后…` : '搜组件，回车选第一项'}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && items[0]) onPick(items[0]) }}
        />
        <div className="quick__list">
          {items.map((it) => (
            <button key={it.kind + it.name} type="button" className="quick__item" data-kind={it.kind} data-name={it.name} onClick={() => onPick(it)}>
              <span className={`kdot kdot--${it.kind}`} />{it.name}<span className="ins__muted">{it.sub}</span>
            </button>
          ))}
          {!items.length && <div className="ins__muted quick__empty">没有匹配的组件</div>}
        </div>
      </div>
    </ViewportPortal>
  )
}
