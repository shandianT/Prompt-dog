# 在 Codex / 编程 Agent 中使用 skill-architect

Codex、Claude Code 这类编程 Agent 有文件系统和工具，不需要单文件压缩版——用完整 Skill 结构，渐进式加载与行业候选库全部保留，效果最好。

## 配置步骤

1. 把 `prompt-dog/` 完整目录放进 Agent 工作的仓库。
2. 在仓库根目录 `AGENTS.md`（Codex 每次会话自动读取）加入：

```markdown
## 提示词架构师

当用户要求：写/优化提示词、诊断现有提示词、设计 SOP 或 AI 工作流时——
读取 prompt-dog/SKILL.md 并严格按其流程执行（它会指引你按需读取
references/ 下的对应文件）。不要凭默认习惯直接回答这类请求。
```

3. Agent 的名字/简介按平台正常填写，不影响行为。

## 版本选择

| 环境 | 用哪个 |
|---|---|
| 有文件系统的编程 Agent（Codex/Claude Code） | 完整 Skill 目录 + AGENTS.md 路由（本文件方案）|
| 只有一个指令框、无法带仓库文件 | `assets/system-prompt.md` 单文件版贴入 |
| Coze/Dify 低代码平台 | `assets/persona-single-field.md` |

## 附注

- 编程 Agent 自带工具：架构师产出的 L3 提示链/L4 编排可由 Agent 直接执行，运行环境题通常选「带工具 Agent」
- 产物保持标准 L1–L4 形态（勿合并为单段），质量不打折
