# PromptDog 工作台

流程画布 MVP 的前端工程。**目前只有 S01 的骨架与数据契约**，画布本身从 S02 / S03 开始建。

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

## 示例数据

`sample/投标流程.json` 由 `design/workbench/export_flow_json.py` 从 `flow.py` 的 `NODES` / `EDGES` 导出——
原型和工作台共用同一份示例，改一处两边都变。19 节点（含子图 7）· 23 条线 ·
自动 7 · 人 7 · 卡点 2 · 缺口 1 · 待打通 4。

## 接着建什么

按 [`../design/workbench/stories.json`](../design/workbench/stories.json) 的顺序，一次一条：
S02 FlowNode 变体页 → S03 画布与泳道 → S04 五种连线 → S05 选中移动框选撤销 → S06 属性面板 …

界面长什么样见 `../design/workbench/` 的设计画布与 `组件清单.md`（每个组件的 props、状态、用哪个 shadcn/ui 件承接）。
