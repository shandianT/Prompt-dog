import { ViewportPortal } from '@xyflow/react'
import { CANVAS_H, CANVAS_W, LANES } from '../flow'

/**
 * 三条泳道。画在 ViewportPortal 里，所以跟节点用同一套坐标，平移缩放一起动。
 * 泳道只是背景语义（节点落在哪一带就归谁做），不参与命中，pointer-events: none。
 */
export function Lanes() {
  return (
    <ViewportPortal>
      <div className="lanes" style={{ width: CANVAS_W, height: CANVAS_H }} aria-hidden>
        {LANES.map((lane, i) => {
          const bottom = LANES[i + 1]?.top ?? CANVAS_H
          return (
            <div key={lane.id} className={`lane lane--${lane.id}`} style={{ top: lane.top, height: bottom - lane.top }}>
              <span className="lane__name">{lane.name}</span>
              <span className="lane__hint">{lane.hint}</span>
            </div>
          )
        })}
      </div>
    </ViewportPortal>
  )
}
