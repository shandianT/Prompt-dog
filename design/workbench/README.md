# 工作台原型源文件

这里是「PromptDog 工作台」高保真原型的**源**，不是产物。产物（画板、截图、在线 artifact）都能从这里重新生成。

| 文件 | 作用 |
|---|---|
| `gen.py` | 视觉令牌、图标、侧栏/顶栏/卡片等积木，生成 01–06 六块画板（首页 / 确认 / 流程重构 / 交付 / 犬舍 / 工作狗上岗 / 组件表） |
| `flow.py` | 入口。07 流程画布（可交互：拖连线、拖到空白快速添加、框选打包、钻取、泳道语义、对照现状、试跑、撤销、缩放）与 FlowNode 节点组件；运行它会连同 01–06 一起重建 |
| `canvas.json` | 画板坐标、说明便签、启动配置（由 `flow.py` 写出，随源码一起提交以便比对） |
| `cdp-look2.mjs` | 无头 Chromium + CDP 的交互验证脚本：在画板 iframe 里驱动拖拽 / 连线 / 框选 / 钻取并截图 |
| `promptdog-design-spec.html` | 《工作台设计文档》的源（原则、组件规格、交互规格、待拍板项） |

在线版本：

- 设计画布：<https://claude.ai/code/artifact/cac62e7f-15b7-4363-9d67-613c6468110f>
- 设计文档：<https://claude.ai/code/artifact/66c6f966-40e6-483d-a0f9-17a2bb687376>

## 重新生成

依赖 Claude Code 的 `design` 技能（提供 `seed-canvas.mjs` 与 `payload.template.html`）。

```bash
cd design/workbench
python3 flow.py                      # 写出 9 个 *.dc.html 与 canvas.json
SK=<design 技能目录>
node "$SK/seed-canvas.mjs" --template "$SK/payload.template.html" \
  --out promptdog-workbench.html --title "PromptDog 工作台" \
  --artboard Main.dc.html --artboard Confirm.dc.html --artboard ProcessRebuild.dc.html \
  --artboard Deliver.dc.html --artboard Kennel.dc.html --artboard WorkdogRun.dc.html \
  --artboard Components.dc.html --artboard FlowCanvas.dc.html --artboard FlowNode.dc.html \
  --canvas canvas.json
node "$SK/seed-canvas.mjs" --check promptdog-workbench.html
```

## 验证交互

```bash
node cdp-look2.mjs "$PWD/promptdog-workbench.html" shots/look
```

脚本会打印每一步的断言结果（节点是否移动、连线数、快速添加是否弹出、框选后是否出现多选条、钻取后是否出现面包屑）并输出两张截图。`BIN` 常量指向本机无头 Chromium，换机器时改成本地路径。

## 设计原则（画布落点）

1. 先读懂再动手：泳道 + 三种标记，三十秒回答「哪些自动 / 人在哪 / 卡在哪 / 缺什么 / 打通什么」
2. 两条线不混：顺序线 / 数据线 / 待打通 / 退回 / 回填，线上标产物
3. 节点即组件、组件即资产：工作狗是子图，框选即可打包成新工作狗
4. 类型约束替代规则说明：端口颜色即产物类型
5. 一张图三种看法：目标态 / 对照现状 / 运行态
6. 人机边界显式且可拖：跨泳道拖动即改「谁来做」
7. 默认值先行：AI 先出图，人只纠错
8. 最短路径：端口拖到空白即新建并连上，双击搜组件，右键菜单，撤销
