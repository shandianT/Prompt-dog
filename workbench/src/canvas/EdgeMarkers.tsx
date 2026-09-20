import { EDGE_KINDS, type EdgeKind } from '../flow'
import { EDGE_COLOR, markerId } from './edgeGeometry'

/**
 * 箭头。一次定义六个（五种线 + 选中），画在一个 0×0 的 svg 里，
 * 连线通过 url(#id) 引用——同一文档里跨 svg 引用 marker 是合法的。
 * 不用 React Flow 自带的 MarkerType：它只为当前 edges 里出现过的 marker 建 defs，
 * 选中态临时换的那个箭头就找不到了。
 */
export function EdgeMarkers() {
  const kinds: (EdgeKind | 'selected')[] = [...EDGE_KINDS, 'selected']
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        {kinds.map((k) => (
          <marker key={k} id={markerId(k)} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9 z" style={{ fill: EDGE_COLOR[k] }} />
          </marker>
        ))}
      </defs>
    </svg>
  )
}
