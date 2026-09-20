import { useEffect, useState } from 'react'
import ContractCheck from './pages/ContractCheck'
import FlowNodeVariants from './pages/FlowNodeVariants'
import CanvasPage from './pages/CanvasPage'

/**
 * 工作台还没有产品导航（那是 Sidebar 组件的事，见 组件清单.md）。
 * 这里只有一个开发用的页签条：契约自检 + 组件变体页，按 hash 切。
 */

const PAGES = [
  { hash: '#/', title: '契约自检', note: 'S01', wide: false, render: () => <ContractCheck /> },
  { hash: '#/flow-node', title: 'FlowNode 变体', note: 'S02', wide: false, render: () => <FlowNodeVariants /> },
  { hash: '#/canvas', title: '流程画布', note: 'S03', wide: true, render: () => <CanvasPage /> },
] as const

function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const page = PAGES.find((p) => p.hash === hash) ?? PAGES[0]

  // 画布要铺满：宽页去掉居中容器，页面自己撑满剩下的高度
  return (
    <div className={page.wide ? 'flex h-screen flex-col p-4' : 'mx-auto max-w-[1180px] p-8 pb-16'}>
      <div className={`flex items-center gap-3 ${page.wide ? 'mb-3' : 'mb-6'}`}>
        <span className="text-[28px] leading-none">🐕</span>
        <span className="text-card font-extrabold">工作台</span>
        <nav className="ml-2 flex gap-1">
          {PAGES.map((p) => {
            const on = p.hash === page.hash
            return (
              <a
                key={p.hash}
                href={p.hash}
                className={`rounded-tag px-3 py-1.5 text-aux font-semibold ${
                  on ? 'bg-amber-soft text-amber' : 'text-sub hover:bg-white'
                }`}
              >
                {p.title}
                <span className="ml-1.5 font-mono opacity-60">{p.note}</span>
              </a>
            )
          })}
        </nav>
        <span className="text-tag text-sub ml-auto">开发页，不是产品界面</span>
      </div>
      {page.wide ? (
        <div className="rounded-card min-h-0 flex-1 overflow-hidden border border-line bg-white">{page.render()}</div>
      ) : (
        page.render()
      )}
    </div>
  )
}
