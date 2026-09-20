# PromptDog 工作台

流程画布 MVP 的前端工程。**已完成 S01 骨架与数据契约、S02 FlowNode 组件、S03 画布与泳道**；连线、选中移动、属性面板从 S04 起。

## 这个工程是干什么的

PromptDog 有两层：

| 层 | 是什么 | 状态 |
|---|---|---|
| **方法** | `../SKILL.md` + `../references/`：说一段流程，它用文字给你泳道表、卡点、打包建议；说「先建标书撰写」，它给你资产包 | **已完成，今天就能用，不依赖任何代码** |
| **产品** | 这个工程：把「读文字版的诊断」变成「在屏幕上看一张图、在图上拖一下」 | 建设中，按 `../design/workbench/stories.json` 一条一条来 |

为什么要建产品层——文字版的流程诊断只有会用 Claude Code 的人能用；一张标了卡点的泳道图，任何业务负责人 30 秒能读懂、能拿给老板看、能把一步拖进 AI 泳道说「这个交给 AI」。`../design/workbench/开源选型.md` 里写明了：一句话生成工作流 Dify / n8n 都有，我们唯一别人没做的两样——**泳道语义**和**对照现状**——只存在于画布上。

如果你只是想自己用 PromptDog，方法层已经够了。这个工程是为了让不打开 Claude Code 的人也能用，以及让它成为一个能展示、能给别人试的产品。

前三条故事看着不像产品，这是正常的：S01 定「一张流程图在文件里长什么样」（三处看同一份文件，这份错了后面全错），S02 定「图上每个方块长什么样」（方块读不懂，图就读不懂），S03 才把方块放到泳道上——从这里开始长得像设计画布里的 07 屏。

## 跑起来

```bash
cd workbench
npm install
npm run dev        # http://localhost:5173 → 契约自检页
npm run check      # 类型 + lint + 契约自检，CI 用这条
```

| 命令 | 做什么 |
|---|---|
| `npm run dev` | 开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run validate:sample` | 校验示例流程图：schema + 枚举漂移 + 引用 + x-compat 四条规则 |
| `npm run check:ui` | 真浏览器验收：起 preview、用 CDP 读计算样式、逐条断言 SPEC §6.3 的视觉编码 |
| `npm run sample` | 从 `design/workbench/flow.py` 重新导出示例再校验 |
| `npx tsx scripts/check-guards.ts` | 反向测试：故意改坏流程图，确认每道检查真的会报错 |

## 技术栈

选型理由、许可证核查、为什么不 fork Dify / n8n / Flowise——全部在
[`../design/workbench/开源选型.md`](../design/workbench/开源选型.md)，这里不重复论证，只列结果：

| 用途 | 依赖 | 许可证 |
|---|---|---|
| 画布底座 | `@xyflow/react` v12 | MIT |
| 图导出 PNG | `html-to-image` **锁 1.11.11**（之后版本导出有 bug） | MIT |
| 图导出 PDF | `jspdf` ≥ 4.2.1（4.2.0 及以下有 critical 漏洞） | MIT |
| 文本档图 | `mermaid` | MIT |
| 运行时校验 | `ajv` draft-07 | MIT |
| 框架 | React 19 + TypeScript + Vite 7 + Tailwind v4 | MIT |

泳道语义与对照现状是自研的——没有开源项目做过这两件事。

## 数据契约

**唯一来源是 [`../design/workbench/flow.schema.json`](../design/workbench/flow.schema.json)**，这里不拷贝副本：
技能产出它、画布渲染它、复盘回流改它，三处必须看同一个文件。`src/flow/schema.ts` 直接 import 它，
`vite.config.ts` 为此放行了仓库根目录。

```
src/flow/
├── types.ts      TS 类型，与 schema 一一对应；枚举写成 as const 数组，供漂移检查比对
├── schema.ts     import 仓库里的 schema，导出 x-compat 规则原文
├── validate.ts   ajv 校验 + 可读的中文错误 + 枚举漂移检查
├── compat.ts     x-compat 四条规则的实现 + 引用完整性
├── lanes.ts      画布几何与泳道分带（150×64 节点，y=440 / 720 分界）
└── stats.ts      五问数字与连线计数
```

四道检查，任一不过 `npm run check` 退出码 1：

1. **schema** — 字段、枚举、必填、`additionalProperties: false`
2. **枚举漂移** — `types.ts` 的枚举必须等于 schema 的枚举（编译器管不到，所以显式比）
3. **引用完整性** — 连线两端指向存在的节点、id 不重复（跨对象引用 schema 管不到）
4. **x-compat 四条规则** — 字段合法不等于组合合法，这四条查的是组合

`scripts/check-guards.ts` 用十个故意改坏的流程图证明这四道检查真的会报错。

## 组件与画布

```
src/components/
└── FlowNode.tsx / .css    画布上的一个节点：kind × role × flag 全部变体，
                           加选中 / 连线中 / 运行中 / 压暗、对照 chip、子图与运行角标
src/canvas/
├── FlowCanvas.tsx         React Flow 画布本体：缩放 50%–160%、fitView、底纹
├── FlowNodeRF.tsx         FlowNodeCard 包成 RF 自定义节点：端口换 <Handle>，卡片 ports="none"
├── Lanes.tsx              三条泳道，画在 ViewportPortal 里，跟节点同一套坐标
├── toReactFlow.ts         flow JSON → RF 节点 / 连线；RF 节点的 data 里原样放契约对象，不另存一份
└── canvas.css             泳道、Handle 借用 .fnode__port 的样子、素线
src/pages/
├── ContractCheck.tsx      契约自检页（S01）
├── FlowNodeVariants.tsx   FlowNode 变体矩阵（S02）
└── CanvasPage.tsx         07 流程画布第一版：顶栏五个数字 + 画布（S03）
```

S03 的画布故意**还不能拖节点**：没有泳道规则的拖动会让数据节点跑出数据泳道，违反 x-compat 规则 2。S05 加移动与撤销，S09 加泳道规则。连线暂时是素线，S04 换成五种 FlowEdge。

没有引 Storybook：变体页就是它的替代品——一个组件家族一页，每个状态一格，
`npm run dev` 里点开就能看，`npm run check:ui` 在无头浏览器里逐条断言。
样式写在同名 `.css` 里而不是 Tailwind 类名：节点的状态组合（边框 × 虚实 × 角标 × 光晕）
用类名表达会长到读不动，而且颜色必须走 `tokens.css` 的变量，不能在组件里写死十六进制。

`check:ui` 跑在 **devicePixelRatio = 2** 下。SPEC §6.3 要求人节点 1.5px 边框，
而 DPR 1 时 Chrome 会把 1.5px 的「用值」舍成 1px，在那个密度下断言 1.5px 会假报错。

## 示例数据

`sample/投标流程.json` 由 `design/workbench/export_flow_json.py` 从 `flow.py` 的 `NODES` / `EDGES` 导出——
原型和工作台共用同一份示例，改一处两边都变。19 节点（含子图 7）· 23 条线 ·
自动 7 · 人 7 · 卡点 2 · 缺口 1 · 待打通 4。

## 接着建什么

按 [`../design/workbench/stories.json`](../design/workbench/stories.json) 的顺序，一次一条：
S04 五种连线 → S05 选中移动框选撤销 → S06 属性面板 → S07 端口类型校验 …

`npm run check:ui` 对画布的断言：五个数字、19 节点 / 23 线 / 3 泳道 / 38 端口、滚轮放大 scale 变大、
封顶 160%、到底 50%、**缩到 50% 后按屏幕坐标点 n9 能选中**（坐标换算对了才点得中）。

界面长什么样见 `../design/workbench/` 的设计画布与 `组件清单.md`（每个组件的 props、状态、用哪个 shadcn/ui 件承接）。
