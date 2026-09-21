import { useEffect, useRef } from 'react'
import { FLAG_LABEL, ROLE_LABEL, type NodeFlag, type NodeRole } from '../flow'
import type { FlowEditor } from './useFlowEditor'

interface Item { label: string; run: () => void; sep?: boolean; danger?: boolean; disabled?: boolean }

/**
 * 节点右键菜单（SPEC §6.4）：改谁来做、标记状态、删除。贴光标，点外面 / Esc / 平移都关。
 * 「打开子流程」「打包成工作狗」是 S11，到时再加两行。
 */
export function ContextMenu({ editor }: { editor: FlowEditor }) {
  const ref = useRef<HTMLUListElement>(null)
  const { menu, closeMenu } = editor
  useEffect(() => {
    if (!menu) return
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) closeMenu() }
    window.addEventListener('mousedown', down, true)
    return () => window.removeEventListener('mousedown', down, true)
  }, [menu, closeMenu])
  if (!menu) return null
  const node = editor.flow.nodes.find((n) => n.id === menu.id)
  if (!node) return null
  const multi = editor.selectedIds.length >= 2 && editor.selectedIds.includes(node.id)
  const guarded = !!node.irreversible
  const items: Item[] = []
  if (node.kind !== 'data') {
    for (const r of ['auto', 'review', 'decide'] as const satisfies readonly NodeRole[]) {
      items.push({ label: `改为${ROLE_LABEL[r]}`, run: () => editor.updateNode(node.id, { role: r }), disabled: guarded && r !== 'decide' })
    }
  }
  for (const [i, f] of (['block', 'missing', 'pending'] as const satisfies readonly NodeFlag[]).entries()) {
    items.push({ label: `标为${FLAG_LABEL[f]}`, run: () => editor.updateNode(node.id, { flag: f }), sep: i === 0 })
  }
  items.push({ label: '清除标记', run: () => editor.updateNode(node.id, { flag: 'ok' }) })
  items.push({
    label: multi ? `删除所选（${editor.selectedIds.length}）` : '删除', danger: true, sep: true,
    run: () => { if (multi) editor.deleteSelected(); else editor.deleteNodes([node.id]) },
  })
  const left = Math.min(menu.x, window.innerWidth - 200), top = Math.min(menu.y, window.innerHeight - 40 * items.length - 24)
  return (
    <ul ref={ref} className="menu" role="menu" data-testid="context-menu" data-node={node.id} style={{ left, top }}>
      {items.map((it) => (
        <li key={it.label} role="none">
          <button
            type="button" role="menuitem" disabled={it.disabled}
            className={`menu__item${it.sep ? ' menu__item--sep' : ''}${it.danger ? ' menu__item--danger' : ''}`}
            onClick={() => { it.run(); closeMenu() }}
          >
            {it.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
