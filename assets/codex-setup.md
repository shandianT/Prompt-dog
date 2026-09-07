# 在 Codex / 编程 Agent 中使用 PromptDog

Codex、Claude Code 这类编程 Agent 有文件系统和工具，不需要单文件压缩版——用完整 Skill 结构，渐进式加载与行业候选库全部保留，效果最好。

## 配置步骤

1. 把 `Prompt-dog/` 完整目录（即本仓库）放进 Agent 工作的仓库。文件夹名保持 `Prompt-dog`，下面的路由按这个名字写；改了名就把路由里的路径一起改。
2. 在仓库根目录 `AGENTS.md`（Codex 每次会话自动读取）加入：

```markdown
## 提示词架构师

当用户要求：写/优化提示词、诊断现有提示词、设计 SOP 或 AI 工作流时——
读取 Prompt-dog/SKILL.md 并严格按其流程执行（它会指引你按需读取
references/ 下的对应文件）。不要凭默认习惯直接回答这类请求。
用户说「直接做 / 不要问我」或没有人在交互时，按 SKILL.md 的无人值守规则一次交付。
```

3. Agent 的名字/简介按平台正常填写，不影响行为。

## 版本选择

| 环境 | 用哪个 |
|---|---|
| 有文件系统的编程 Agent（Codex/Claude Code） | 完整 Skill 目录 + AGENTS.md 路由（本文件方案）|
| 只有一个指令框、无法带仓库文件 | `assets/system-prompt.md` 单文件版贴入 |
| Coze/Dify 低代码平台 | `assets/persona-single-field.md` |

## 附注

- 编程 Agent 自带工具：架构师产出的 L3 提示链/L4 编排可由 Agent 直接执行；运行环境题会自动预填「带工具 Agent」并跳过，除非用户说要部署到别处或定时运行
- 会话内试跑在这类环境里是真实执行（写文件、跑首环节），不是纸上走查
- 产物保持标准 L1–L4 形态（勿合并为单段），质量不打折；一次性任务不建资产包，重复使用的场景才建
