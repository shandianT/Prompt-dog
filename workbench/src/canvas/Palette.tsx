import { useState } from 'react'
import './Palette.css'
import type { PaletteGroup, PaletteItem } from '../flow'

/**
 * 组件库面板（SPEC §6.5）：搜索框；五组——工作狗、技能、行业 know-how、数据与系统、人；底部「新组件（占位缺口）」。
 * 每项带拖动把手、类型圆点、名称与一句说明；工作狗的说明就是环节数；缺的 know-how 说明里写着「缺 · 待沉淀」。
 * 拖入用指针事件而不是 HTML5 拖放：幽灵节点跟着指针走（原型 grab / ghost），落点由 PlacingLayer 算。
 */
export function Palette({ groups, onGrab, onNewComponent }: { groups: PaletteGroup[]; onGrab: (item: PaletteItem) => void; onNewComponent: () => void }) {
  const [q, setQ] = useState('')
  const query = q.trim()
  const hit = (it: PaletteItem) => !query || (it.name + (it.sub ?? '')).includes(query)
  return (
    <aside className="pal" data-testid="palette" aria-label="组件库">
      <input className="ins__fi" value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜组件，或在画布空白处双击" data-testid="palette-search" />
      {groups.map((g) => {
        const items = g.items.filter(hit)
        if (!items.length) return null
        return (
          <div key={g.title} className="pal__group">
            <h4 className="pal__title">{g.title}<small>{g.sub}</small></h4>
            {items.map((it) => (
              <div
                key={it.kind + it.name} className="pal__item" data-name={it.name} data-kind={it.kind}
                onMouseDown={(e) => { if (e.button !== 0) return; e.preventDefault(); onGrab(it) }}
                title="按住拖到画布"
              >
                <span className="pal__grip" aria-hidden>⋮⋮</span>
                <span className={`kdot kdot--${it.kind}`} />
                <span className="pal__col"><span className="pal__name">{it.name}</span><span className="pal__sub">{it.sub}</span></span>
              </div>
            ))}
          </div>
        )
      })}
      <button type="button" className="btn pal__new" onClick={onNewComponent} data-testid="palette-new">＋ 新组件（占位缺口）</button>
    </aside>
  )
}
