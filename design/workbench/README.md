# 工作台（设计中）

「PromptDog 工作台」的全部设计资产。**产物**（画板、截图、在线 artifact）都能从这里的**源**重新生成；接手的人或 agent 按下表决定先读哪份。

| 你是 | 先读 | 然后 |
|---|---|---|
| 产品负责人：定方向 | `产品定义.md`（一页：用户、楔子、运行模型、假设、里程碑、待拍板） | 拍板末尾六条 |
| 要动手写代码前 | `开源选型.md`（每项能力用哪个开源项目、许可证、复用方式） | 按 `stories.json` S01 装依赖，不重新论证 |
| 第一次用的人，或按使用逻辑做产品的人 | `使用逻辑.md`（从 0 到 1：第一周五步） | 对照画布 00 首次引导与 `design/figures/first-run.svg` |
| 要实现每一步的交互 | `交互流程.md`（逐步规格 + 异常 + 停机总表） | 对照画布「每个功能每一步」页，每行一个功能 |
| 要知道每一步为什么这样画、哪里删了哪里补了 | `逐步评审.md`（每步：合理 / 缺少 / 没用 / 决定 + 状态机对账） | 画布每行行首的便签是它的摘要 |
| 要建前端组件库 | `组件清单.md`（每个组件的 props · 状态 · 用在哪些屏 · 用什么开源件承接 · 设计源函数） | 对照画布「组件」页 |
| 原型或前端的 agent / 工程师 | `SPEC.md`（屏幕、画布规格、交互、token、验收） | 按 `stories.json` 的顺序做，一次一条 |
| 写流程重构技能或对接画布的人 | `flow.schema.json`（流程图数据契约） | 示例数据在 `flow.py` 的 `NODES` / `EDGES`；方法在 `references/process-rebuild.md` |
| 想看设计稿 | 设计画布 <https://claude.ai/code/artifact/cac62e7f-15b7-4363-9d67-613c6468110f> · 设计文档 <https://claude.ai/code/artifact/66c6f966-40e6-483d-a0f9-17a2bb687376> | 文档 HTML 源：`promptdog-design-spec.html` |

## 文件

| 文件 | 作用 |
|---|---|
| `产品定义.md` | 定方向：一句话、用户、两个已建议的决定、非目标、假设与验证、里程碑、待拍板 |
| `SPEC.md` | 构建规范：屏幕清单、流程画布规格（对象模型、视觉编码、交互清单、面板、泳道语义、快捷键）、token、参考、验收指标 |
| `stories.json` | 按依赖排序的构建故事，每条一个上下文能做完，验收项可二值判定，`passes` 记进度（与 `references/run-loop.md` 同一套跑法） |
| `flow.schema.json` | 流程图 JSON Schema：技能产出它，画布渲染它，复盘回流改它；含端口兼容规则 |
| `gen.py` | 视觉令牌、图标、积木函数（侧栏 / 顶栏 / 输入栏 / 消息 / 选项 / 流水线行 / 指标块 / 假设行 …）与 `build()`；`IMPORTS` 开关决定侧栏 / 顶栏 / 输入栏输出 `<dc-import>` 还是内联 |
| `chrome_components.py` | 三个真组件的源：`Sidebar.dc.html`（active）· `Topbar.dc.html`（title / badge / chips / actions）· `InputBar.dc.html`（placeholder / value / direct） |
| `screens_v2.py` | 01.1 / 02.1 / 03.1 / 04 / 05.3：四个入口、预填交付、入犬舍 / 画布出口、验收清单驱动的犬舍状态、停在人工确认点的上岗屏 |
| `steps_entry.py` | 01.2 已识别入口 · 01.3 生成中 · 02.2 生效复述 · 03.2 单提示词交付 |
| `steps_diagnose.py` | 13.1 贴入 · 13.2 评分与改法 · 13.3 改进版对照（方法：`references/diagnose.md`） |
| `steps_canvas.py` | 07 的五个静态状态：07.0 空态 · 07.2 拖拽反馈 · 07.3 构建预览 · 07.4 对照现状 · 07.5 运行态（与 07 同一份数据与 CSS） |
| `steps_design.py` | 11.2 故事清单 · 11.3 四视角找茬 |
| `steps_run.py` | 05.1 启动 · 05.2 运行中 · 05.4 完成 · 05.5 止损 |
| `steps_retro.py` | 10.2 复盘 · 达标发布（停机点③） |
| `library_screen.py` | 14 组件库列表 |
| `components_page.py` | 「组件」页的 12 张状态表，每一块由生成屏幕的同一个函数产出 |
| `逐步评审.md` | 每个功能每一步的评审：合理 / 缺少 / 没用 / 决定；状态机对账；缺少与没用的汇总 |
| `组件清单.md` | 设计组件 → 开发组件：props、状态、用在哪些屏、开源承接、设计源函数；组件 × 屏幕矩阵 |
| `design_screen.py` | 11 设计屏：三件套 tab、五问首行、泳道图、H 假设、可选纠错卡 |
| `screens_v3.py` | 08 汇报模式（从 `flow.py` 的 NODES / EDGES 渲染只读泳道图）、09 组件详情、10 复盘与回归 |
| `onboarding_screen.py` | 00 首次引导：从 0 到 1 的五步时间线、准备清单、入口选择、常见误区 |
| `开源选型.md` | 每项能力用哪个现成开源项目、许可证是什么、fork 还是依赖还是只借鉴；画布定 React Flow 的依据；与 Dify 的互操作映射 |
| `交互流程.md` | 逐步交互规格：每一步的屏幕 / 你做什么 / 系统做什么 / 产物 / 停在哪 / 不回复怎样 / 出错怎么办；异常路径与停机总表 |
| `journey_screen.py` | 12 用户旅程：把交互流程画成一屏 |
| `使用逻辑.md` | 从 0 到 1 的使用逻辑：第 0 天准备、第一周五步（输入 / 产出 / 屏幕 / 耗时 / 停在哪）、节奏、入口选择、常见误区 |
| `flow.py` | 入口。07 流程画布（可交互）与 FlowNode 组件；投标流程示例数据的单一来源；两页排版（`STRIPS` 每行一个功能 + 行首便签）；运行它重建全部画板 |
| `canvas.json` | 两页（每个功能每一步 / 组件）的画板坐标、评审便签、启动配置 |
| `cdp-look2.mjs` | 无头 Chromium + CDP 交互验证：驱动拖拽 / 连线 / 框选 / 钻取并截图 |
| `promptdog-design-spec.html` | 设计文档的 HTML 展示稿（内容与 `SPEC.md` 同源） |

## 怎么和画布联动

源码是唯一真相：屏幕在 `screens_v2.py`、`screens_v3.py`、`steps_*.py`、`design_screen.py`、`onboarding_screen.py`、`journey_screen.py`、`library_screen.py`，积木在 `gen.py`，真组件在 `chrome_components.py`，流程数据在 `flow.py` 的 `NODES` / `EDGES`。画布分两页：「每个功能每一步」每行一个功能、从左到右是用户走的顺序、行首便签是评审；「组件」页是真组件与状态表。两条回路：

| 回路 | 怎么做 | 适合 |
|---|---|---|
| 对话 → 源码 → 画布 | 在对话里说「屏号 + 位置 + 改法」，改源码、重新生成、重新发布，链接不变 | 加屏、改布局、改流程数据这类结构性改动 |
| 画布 → 源码 | 在画布上直接改文字、间距、颜色后点 Save；再在对话里说「把画布上的改动同步回源码」，用 read 拉回最新版本，逐画板 diff 后移植进源码再发布 | 微调文案和视觉 |

画布上的改动如果不同步回源码，下次重新生成就会被覆盖。画布评论要在对话里说一声「看评论」才会被读取（本会话收不到唤醒）。07 流程画布里的拖拽、连线、打包是原型交互，不会保存；要把真实流程画上去，把流程描述交给对话，改 `flow.py` 数据后重新发布。给老板看用画布的导出 PNG / PDF。工作台建成后（`stories.json` S12 导入 JSON）这两条回路合并为一条：技能产出 flow JSON，画布直接导入编辑，「按这个建」生成资产包。

## 重新生成画板

依赖 Claude Code 的 `design` 技能（提供 `seed-canvas.mjs` 与 `payload.template.html`）。

```bash
cd design/workbench
python3 flow.py                      # 写出 49 个 *.dc.html（侧栏 / 顶栏 / 输入栏用 <dc-import> 引用真组件）与 canvas.json
python3 flow.py --inline --out /tmp/inline   # 内联版：给无编辑器的无头 Chromium 截图用
SK=<design 技能目录>
ARGS=$(python3 -c "import json;print(' '.join('--artboard '+a['file'] for a in json.load(open('canvas.json'))['artboards']))")
node "$SK/seed-canvas.mjs" --template "$SK/payload.template.html" \
  --out promptdog-workbench.html --title "PromptDog 工作台" $ARGS --canvas canvas.json
node "$SK/seed-canvas.mjs" --check promptdog-workbench.html
```

单屏静态截图（内联版）：

```bash
<无头 Chromium> --no-sandbox --disable-gpu --hide-scrollbars --screenshot=shots/RunStop.png \
  --window-size=1440,900 --virtual-time-budget=2000 file:///tmp/inline/RunStop.dc.html
```

## 验证交互

```bash
node cdp-look2.mjs "$PWD/promptdog-workbench.html" shots/look
```

脚本打印每一步的断言（节点是否移动、连线数、快速添加是否弹出、框选后是否出现多选条、钻取后是否出现面包屑）并输出两张截图。`BIN` 常量指向本机无头 Chromium，换机器时改路径。

## 八条设计原则

1 先读懂再动手（五问 30 秒）· 2 两条线不混 · 3 节点即组件、组件即资产 · 4 类型约束替代规则说明 · 5 一张图三种看法 · 6 人机边界显式且可拖 · 7 默认值先行 · 8 最短路径。落点与验收方法见 `SPEC.md` §3。
