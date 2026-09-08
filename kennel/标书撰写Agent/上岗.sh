#!/bin/bash
# 标书撰写工作狗 · 无人上岗循环
# 用法：./上岗.sh [--tool claude|codex] [最大轮数]
# 每轮开一个全新上下文，只做 验收清单.json 里下一个未通过的环节；记忆在文件里（清单 / 日志 / git），不在上下文里。
TOOL=claude; MAX=0
while [[ $# -gt 0 ]]; do case $1 in --tool) TOOL=$2; shift 2;; *) MAX=$1; shift;; esac; done
cd "$(dirname "$0")"
[ "$MAX" -gt 0 ] || MAX=$(python3 -c "import json;d=json.load(open('验收清单.json',encoding='utf-8'));print(len(d['环节'])+d.get('最大轮次',3))")
PROMPT="读取 标书撰写Agent/AGENTS.md，按「无人上岗」规则执行 验收清单.json 里下一个未通过的环节；只做一个环节，产物落盘到 输出/，写回清单并追加 复盘/日志.md。"
for i in $(seq 1 "$MAX"); do
  echo "== 第 $i/$MAX 轮 ($TOOL)"
  if [ "$TOOL" = claude ]; then OUT=$(claude --print "$PROMPT" 2>&1 | tee /dev/stderr); else OUT=$(codex exec "$PROMPT" 2>&1 | tee /dev/stderr); fi
  echo "$OUT" | grep -q "<promise>交付</promise>" && { echo "全部环节通过，三件套在 输出/"; exit 0; }
  echo "$OUT" | grep -q "<promise>止损</promise>" && { echo "止损：见 复盘/日志.md 与卡点报告"; exit 2; }
  echo "$OUT" | grep -q "<promise>待确认</promise>" && { echo "停在人工确认点（递交），回复后重跑"; exit 3; }
  sleep 2
done
echo "到达最大轮数仍未交付，按止损处理"; exit 1
