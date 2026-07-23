<div align="center">

# 🐕 PromptDog · 提示狗

**把说不清的需求，变成能上岗的 Agent。**

[🌐 在线演示](https://prompt-dog.vercel.app/) · [⚡ 30 秒上手](#-30-秒上手) · [🏠 犬舍](#-犬舍现成的工作狗) · [English](README.en.md)

<img src="docs/screenshot.png" width="880" alt="PromptDog 首页：提示词提示狗，把说不清的需求变成能上岗的 Agent">

*↑ PromptDog 首页：把说不清的需求，变成能上岗的 Agent（[看动态演示](https://prompt-dog.vercel.app/)）*

</div>

---

## 它解决什么问题

普通人用 AI 最大的障碍不是不会用，是**说不清需求**。AI 反问「你们的质检标准是什么？」——你答不上来。PromptDog 把这件事反过来：**它从不开放式提问，只出选择题**——把你所在行业的常见做法列出来、标好 ★ 推荐项，你回一句「都按推荐」就放行。

## ⚡ 30 秒上手

**方式一：编程 Agent（Codex / Claude Code，效果最好）**

```bash
git clone https://github.com/shandianT/Prompt-dog
```

然后在你的 `AGENTS.md` 加一段路由：

```markdown
遇到写提示词 / 优化提示词 / 设计 SOP 或工作流的任务时，
读取 Prompt-dog/SKILL.md 并严格按其流程执行。
```

**方式二：Agent 工作台（WorkBuddy / SoWork）** —— 把整个 `Prompt-dog` 文件夹拖进工作区；如果平台支持项目指令，就按上面的 `AGENTS.md` 路由接入。要直接使用现成工作狗时，把 `kennel/标书撰写Agent`、`kennel/合同审查Agent` 或 `kennel/内容营销Agent` 整个文件夹放进工作区，按里面的 `启动指令.md` 发一句话即可。

**方式三：低代码工作流平台（Coze 等）** —— 这类平台更适合拆成节点使用：主 Agent 用 [`assets/persona-single-field.md`](assets/persona-single-field.md) 里的名称 / 简介 / 人设，流程节点按 `references/` 或 `kennel/*/prompts/` 逐段配置。

**方式四：任意对话 AI** —— 复制 [`assets/system-prompt.md`](assets/system-prompt.md) 分隔线以下全文，贴进系统提示词框或对话第一条。

## 一次交互长什么样

> **你**：我是做跨境电商的，想让 AI 帮我做客服质检
>
> **PromptDog**：这是个需要行业惯例的中等任务，我按 SOP 方案设计。确认一件事，回「都按推荐」可直接通过：
> **Q1 质检维度？**（可多选）A. 响应及时性 ★　B. 话术合规 ★　C. 问题解决率 ★　D. 情绪安抚　E. 其他
>
> **你**：都按推荐
>
> **PromptDog**：生效：全部 ★。（直接交付完整 SOP + 生效假设清单 + 上手指南）

全程零开放式提问，你打的字不超过十个。

## 🏠 犬舍：现成的工作狗

工作狗 = PromptDog 产出的场景专用 Agent 资产包，整个文件夹拖进工作区即上岗，自带启动指令、复盘飞轮和回归测试：

| 工作狗 | 干什么 | 位置 |
|---|---|---|
| 📑 标书撰写 | 拆评分标准 → 按评分点写 → 废标项逐条核对 → 模拟评审 | [`kennel/标书撰写Agent`](kennel/标书撰写Agent) |
| ⚖️ 合同审查 | 七环节初审，三件套交付（报告/批注/JSON），律所级红线 | [`kennel/合同审查Agent`](kennel/合同审查Agent) |
| ✍️ 内容营销 | 「透明换信任」方法论写作，素材库保真，平台三吃 | [`kennel/内容营销Agent`](kennel/内容营销Agent) |

## 它怎么保证质量

**先量活儿，再干活儿**：收到需求先判复杂度——小事给一段好提示词，多步的事给操作手册，复杂的事给带质检的流水线，大工程给一支互相把关的 AI 团队。

四道保险：动手前先说清「什么算好」；关键结论多方核对；交付前有人专门找茬；改三轮不行就止损，绝不空转。原理见 [`references/`](references/) 下的方法论文档。

## 与传统提示词工具的差别

| | 传统做法 | PromptDog |
|---|---|---|
| 需求澄清 | 开放式提问 | 选择题 + ★推荐，「都按推荐」放行 |
| 复杂度 | 一律一段提示词 | 判级后给提示词 / SOP / 流水线 / AI 团队 |
| 质量 | 看运气 | 验收标准先行 + 交付前找茬 + 止损线 |
| 交付 | 一段文字 | 可复用资产包（含复盘与回归） |

## 参与

- 用出问题、想要新的工作狗：提 [Issue](https://github.com/shandianT/Prompt-dog/issues)
- 欢迎 PR 你所在行业的候选库与场景
- 觉得有用，给个 ⭐ 就是最好的支持

## License

见 [LICENSE](LICENSE)。
