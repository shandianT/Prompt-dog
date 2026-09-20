/**
 * 浮条：框选或多选 ≥ 2 个节点时压在画布顶部中央（原型 .bar）。
 * 「打包成工作狗」是 S11、「删除」是 S06——到那两条故事再加按钮，现在不放灰按钮占位。
 */
export function SelectionBar({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <div className="selbar" data-testid="selection-bar" role="status">
      <span>已选 <b data-count={count}>{count}</b> 个节点</span>
      <button type="button" className="selbar__btn selbar__btn--ghost" onClick={onClear}>取消</button>
    </div>
  )
}
