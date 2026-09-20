import { CANVAS_H, CANVAS_W, NODE_H, NODE_W, type EdgeKind } from '../flow'

/**
 * 五种线的路径，移植自原型 design/workbench/flow.py 的 edgePath——两边算出来的线必须一样。
 * 坐标是节点左上角（flow 坐标），不是端口坐标；宽高用常量，与 lanes.ts 同源。
 *
 *   seq / data / pending  右端口 → 左端口的贝塞尔；上下叠着（x 差 < 40）时走底 → 顶
 *   back                  从两个节点顶部拱起，红虚线（人审不通过退回）
 *   loop                  从右端口出去，贴画布右边、沿底边绕回目标底部，绿虚线（结果回填上游）
 *
 * 标签位置比原型多一条规则（S04 建到这里才发现，已同步回原型）：横向端口距 < 60 时线近乎竖着，「抬到线上方 5px」没有意义——
 *   并排紧挨（同一行）：标签抬到节点顶边之上，放在线中点会被两边的节点盖住，「跟进的线索」「审批通过」在第一张截图上只剩一个字；
 *   上下错开（近竖的 S 线）：标签居中在两个节点之间的空带里，抬 5px 会顶进上面那个节点（「偏离表依据」）。
 */
export interface Pt { x: number; y: number }
export interface EdgePath { d: string; labelX: number; labelY: number }

/** 并排紧挨的判定：横向端口距小于这个值，线中点放不下一个标签 */
export const TIGHT_GAP = 60

export function edgePath(a: Pt, b: Pt, kind: EdgeKind): EdgePath {
  const ax = a.x, ay = a.y, bx = b.x, by = b.y
  if (kind === 'loop') {
    const y1 = ay + NODE_H / 2, xr = CANVAS_W - 12, yb = CANVAS_H - 22, x2 = bx + NODE_W / 2, y2 = by + NODE_H + 8
    return { d: `M ${ax + NODE_W} ${y1} L ${xr} ${y1} L ${xr} ${yb} L ${x2} ${yb} L ${x2} ${y2}`, labelX: (xr + x2) / 2, labelY: yb - 6 }
  }
  if (kind === 'back') {
    const sx = ax + NODE_W / 2, tx = bx + NODE_W / 2, top = Math.min(ay, by) - 64
    return { d: `M ${sx} ${ay} C ${sx} ${top}, ${tx} ${top}, ${tx} ${by}`, labelX: (sx + tx) / 2, labelY: top + 18 }
  }
  if (Math.abs(bx - ax) < 40) {
    const x = ax + NODE_W / 2, xb = bx + NODE_W / 2
    if (by > ay) {
      return { d: `M ${x} ${ay + NODE_H} C ${x} ${ay + NODE_H + 40}, ${xb} ${by - 40}, ${xb} ${by}`, labelX: x + 4, labelY: (ay + NODE_H + by) / 2 + 4 }
    }
    return { d: `M ${x} ${ay} C ${x} ${ay - 40}, ${xb} ${by + NODE_H + 40}, ${xb} ${by + NODE_H}`, labelX: x + 4, labelY: (ay + by + NODE_H) / 2 + 4 }
  }
  const px1 = ax + NODE_W, py1 = ay + NODE_H / 2, px2 = bx, py2 = by + NODE_H / 2
  const dx = Math.abs(px2 - px1), dy = Math.abs(py2 - py1), midY = (py1 + py2) / 2
  const c = Math.max(50, dx / 2)
  const labelY = dx >= TIGHT_GAP ? midY - 5 : dy < NODE_H ? Math.min(ay, by) - 9 : midY
  return { d: `M ${px1} ${py1} C ${px1 + c} ${py1}, ${px2 - c} ${py2}, ${px2} ${py2}`, labelX: (px1 + px2) / 2, labelY }
}

/** SPEC §6.3：顺序灰 · 数据深灰 · 待打通蓝 · 回填绿 · 退回红；选中琥珀加粗 */
export const EDGE_COLOR: Record<EdgeKind | 'selected', string> = {
  seq: 'var(--color-port)',
  data: 'var(--color-slate)',
  pending: 'var(--color-lo)',
  loop: 'var(--color-ok)',
  back: 'var(--color-hi)',
  selected: 'var(--color-amber)',
}

/** 虚线：待打通、回填、退回三种「还没落地 / 非主路径」的线 */
export const EDGE_DASH: Partial<Record<EdgeKind, string>> = { pending: '6 5', loop: '6 5', back: '5 4' }

/** 箭头 marker 的 id；EdgeMarkers 定义、FlowEdgeRF 引用。放这里而不放组件文件里，是为了不从组件文件导出函数（fast refresh） */
export const markerId = (kind: EdgeKind | 'selected') => `pd-arrow-${kind}`
