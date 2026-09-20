import { EDGE_KINDS, EDGE_LABEL, type EdgeKind } from '../flow'
import { EDGE_COLOR, EDGE_DASH } from './edgeGeometry'

/**
 * 五种线的图例，带计数，横着排成一行贴画布左下角。
 * 不竖排：首帧整幅画布可见时，竖排的图例正好盖住数据泳道左下角的节点（示例里是 CRM）；一行只占底下一条。
 */
export function EdgeLegend({ counts }: { counts: Record<EdgeKind, number> }) {
  return (
    <div className="rounded-btn flex items-center gap-3 border border-line bg-white/95 px-2.5 py-1.5" data-testid="edge-legend">
      {EDGE_KINDS.map((k) => (
        <span key={k} className="text-tag flex items-center gap-1.5 text-sub whitespace-nowrap">
          <svg width="26" height="8" aria-hidden>
            <line x1="1" y1="4" x2="25" y2="4" stroke={EDGE_COLOR[k]} strokeWidth="1.8" strokeDasharray={EDGE_DASH[k]} />
          </svg>
          {EDGE_LABEL[k]}
          <b className="text-ink tabular-nums" data-kind={k}>{counts[k]}</b>
        </span>
      ))}
    </div>
  )
}
