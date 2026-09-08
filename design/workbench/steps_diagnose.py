# -*- coding: utf-8 -*-
"""13 诊断（贴现有提示词）的三步：13.1 贴入 / 13.2 评分与改法 / 13.3 改进版对照。
方法见 references/diagnose.md：零提问诊断 · 十维打分 · 针对最低 2–3 维改 · 改进版头部带 H · 回归对照 · 只在真有分歧时附一题。示例数据均为演示值。"""
from gen import (ico, sidebar, topbar, inputbar, right_head, right_col, chat_col, frame, user_msg, bot_msg,
                 option, question, stage, stages_panel, tile, tiles, assumption, HEAD, TAIL, COLS3,
                 AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, MID, LO, FIXBG, MONO)
from screens_v2 import btn, preview_card
from steps_entry import recog_bar, input_box, hero, dim, picked, why_card, ENTRIES

ORIGINAL = "把下面的英文翻译成中文，要求准确流畅。\n\n{text}"

# ===================================================================== 13.1 贴入
paste_main = hero("说一句想让 AI 做的事，或把你们的流程和材料丢进来", "四种进法自动识别，都先按推荐值把东西做出来，卡片只用来纠错——不回复也能用。",
                  recog_bar("贴现有提示词", " → 评分 + 改进版", "零提问：先打分再给改进版", [ENTRIES[0], ENTRIES[2], ENTRIES[3]]),
                  input_box(ORIGINAL, mono=True),
                  "发送后同一回复内给出：十维打分 · 三条建议 · 改进版全文 · 回归对照。只有改法真有分歧才附一题。")
paste_right = (
    f'<div style="font-size:12.5px;color:{SUB};line-height:1.6">贴的是提示词就走诊断线，不判级、不建资产包。</div>'
    + picked("edit", "评分 + 改进版", "十维打分（1–10）→ 针对最低 2–3 维给三条建议 → 改进版全文（改动加粗、头部带 H）→ 回归对照", "零提问：你全程最多做一次选择题，通常零次")
    + dim(preview_card("flow", "泳道流程图", "一段流程 → 三条道，标卡点 · 缺口 · 待打通", "五问 30 秒"))
    + dim(preview_card("folder", "资产包", "一句话 → 路由 · 主控 · 各环节提示词 · 验收清单.json", "拖进任意工作区即上岗"))
    + why_card("识别依据", [("命中", "第二人称指令 + 占位符 {text}：这是一段提示词，不是需求"), ("升级", "六信号有 2 分项才提示「用工作流更稳」，先满足改提示词"), ("出口", "改进版可复制、可存进组件库当技能")]))
DIAG_PASTE = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 新会话", chips=("已识别：贴现有提示词",)) +
    chat_col(paste_main, '') +
    right_col(right_head("交付物预览 · 先做出来再纠错"), paste_right)) + TAIL

# ===================================================================== 13.2 评分与改法
DIMS = [("明确性", 6, "指令清楚，但「准确流畅」无法判定"), ("相关性", 7, "紧扣翻译任务"), ("完整性", 3, "无人设 · 无领域 · 无格式 · 无边界"), ("中立性", 8, "无不当引导"),
        ("创造性", 6, "翻译任务不需要"), ("结构", 5, "指令与待译文本没有分隔"), ("语法", 8, "无错"), ("流畅性", 8, "自然"), ("目标对齐", 7, "各部分服务同一目标"), ("可测试性", 4, "什么叫「准确」没有判据")]
LOW = {"完整性", "可测试性", "结构"}
def dim_row(name, score, why):
    low = name in LOW
    c = HI if low else (OK if score >= 8 else INK)
    return (f'<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;padding:5px 0;border-top:1px solid {LINE}"><span style="width:52px;font-weight:700;flex-shrink:0;{"color:" + HI if low else ""}">{name}</span>'
            f'<span style="width:110px;flex-shrink:0;height:6px;border-radius:3px;background:{CHATBG};position:relative;overflow:hidden"><span style="position:absolute;left:0;top:0;height:100%;width:{score * 10}%;background:{c};border-radius:3px"></span></span>'
            f'<span style="width:16px;text-align:right;font-weight:800;color:{c};flex-shrink:0">{score}</span>'
            f'<span style="font-size:11px;color:{SUB};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">{why}</span></div>')
score_card = (
    f'<div style="display:flex;flex-direction:column;gap:2px">'
    f'<div style="display:flex;align-items:center;gap:10px;padding-bottom:4px"><span style="font-weight:800;font-size:13.5px">诊断结果 · 十维</span>'
    f'<span style="font-size:20px;font-weight:800;color:{HI};line-height:1">58<span style="font-size:12px;color:{SUB};font-weight:600"> / 100</span></span>'
    f'<span style="margin-left:auto;font-size:11.5px;color:{SUB}">红色 = 最低 3 维</span></div>'
    + ''.join(dim_row(*d) for d in DIMS) + '</div>')
def sug(n, dim, score, what, orig, mech):
    return (f'<div style="display:flex;flex-direction:column;gap:3px;padding:9px 0;border-top:1px solid {LINE};font-size:13px;line-height:1.5">'
            f'<div><span style="font-family:{MONO};font-weight:700;color:{AMBER}">建议 {n}</span> <span style="font-size:11px;background:#fff1f2;color:{HI};border-radius:4px;padding:1px 6px;font-weight:700">{dim} {score}</span> {what}</div>'
            f'<div style="font-size:12px;color:{SUB}">原文：{orig} · 机制：{mech}</div></div>')
sug_card = (
    f'<div style="align-self:stretch;background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:10px 18px 4px;display:flex;flex-direction:column">'
    f'<div style="font-weight:800;font-size:14px;padding-bottom:4px">三条改进建议 · 针对最低的 2–3 维</div>'
    + sug(1, "完整性", 3, "补人设与领域：专业英中技术文档译者，读者是开发者", "「把下面的英文翻译成中文」", "人设收窄词汇与语域的选择空间，术语一致性随之提高")
    + sug(2, "可测试性", 4, "加验收：术语表 100% 命中 · 数字与代码块原样保留 · 输出只含译文", "「要求准确流畅」", "可二值判定的标准让好坏能被一致地判定，也让回归对照成立")
    + sug(3, "结构", 5, "用「### 待译文本」分隔指令与内容，规则单列", "「{text}」直接接在指令后", "分隔符降低指令与数据混淆，防止待译文本里的指令被执行")
    + '</div>')
diag_q = (
    f'<div style="align-self:stretch;background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:12px 18px 10px;display:flex;flex-direction:column;gap:8px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12.5px;color:{AMBER};font-weight:800;letter-spacing:.04em">可选纠错 · 不回复即按 ★ 生效</span>'
    f'<span style="font-size:12.5px;color:{SUB}">只因这一处改法真有分歧；其余已按 H 处理</span></div>'
    + question("Q1 「完整性」仅 3 分——我按 A 补了人设，如果不符请选：", [option("A. 专业英中技术文档译者（读者：开发者）", "已采用：原文出现 API、SDK", True), option("B. 市场文案译者（读者：客户）"), option("C. 其他（一句话说明）")])
    + '</div>')
score_stream = (
    user_msg(f'<div style="font-family:{MONO};font-size:13px;white-space:pre-wrap">{ORIGINAL}</div>')
    + bot_msg("提示狗 🐕", "诊断结果 <b>58 / 100</b>（十维在右侧）。最大的问题是<b>可测试性</b>与<b>完整性</b>：没说清什么叫译得好，没给人设、领域和格式。改这两处预计提到 80+，改进版正在生成。")
    + sug_card + diag_q)
score_rows = [stage("补人设与领域", "建议 1 · H1", "done"), stage("加验收标准", "建议 2 · 3 条可二值判定", "done"), stage("分隔符与输出格式", "建议 3 · 生成中", "run"), stage("回归对照", "同一输入 · 原版 vs 改进版各一句", "todo")]
skel = ''.join(f'<span style="display:block;height:12px;border-radius:6px;background:{CHATBG};width:{w}%"></span>' for w in (70, 88, 62, 92, 76, 58))
score_right = (score_card + stages_panel("改进版 · 生成中", score_rows)
               + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">打分要拉开差距：处处 7 分没有信息量。改进版只动最低的维，不重写你的意图。</div>')
DIAG_SCORE = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 诊断 · 翻译提示词", chips=("零提问诊断", "58 / 100")) +
    chat_col(score_stream, inputbar("不回复也行；要改就回「1B」，或「建议 2 不要」")) +
    right_col(right_head("十维打分 · 改进版", "live"), score_right)) + TAIL

# ===================================================================== 13.3 改进版对照
def tag(n):
    return f'<span style="font-family:{MONO};font-size:10px;font-weight:700;color:{AMBER};background:{AMBER_SOFT};border-radius:3px;padding:0 4px;margin-left:4px;vertical-align:1px">建议 {n}</span>'
IMPROVED = (
    f'<b>你是专业的英中技术文档译者，读者是开发者。</b>{tag(1)}\n'
    f'<b>术语按下方术语表翻译，首次出现括注英文；数字、代码块、命令原样保留。</b>{tag(1)}\n\n'
    f'<b>### 待译文本</b>{tag(3)}\n{{text}}\n\n'
    f'<b>### 术语表</b>{tag(3)}\n{{glossary}}\n\n'
    f'<b>### 输出</b>{tag(3)}\n只输出译文，不加解释；保留原文的段落与列表结构。\n\n'
    f'<b>### 验收</b>{tag(2)}\n- 术语表 100% 命中\n- 数字 / 代码块 / 命令与原文一致\n- 输出不含译文以外的内容')
def pane(title, sub, body, strong=False):
    return (f'<div style="flex:1;min-width:0;background:{WHITE};border:{"1.5px solid " + AMBER if strong else "1px solid " + LINE};border-radius:12px;overflow:hidden;display:flex;flex-direction:column">'
            f'<div style="display:flex;align-items:center;gap:8px;padding:9px 14px;border-bottom:1px solid {LINE};background:{CHATBG}"><span style="font-weight:700;font-size:13px">{title}</span><span style="font-size:11.5px;color:{SUB}">{sub}</span></div>'
            f'<div style="padding:12px 14px;font-family:{MONO};font-size:12px;line-height:1.7;white-space:pre-wrap;color:{INK};flex-grow:1">{body}</div></div>')
compare = (f'<div style="display:flex;gap:12px;align-self:stretch;min-height:0">'
           + pane("原版", "58 / 100", f'<span style="color:{SUB}">{ORIGINAL}</span>')
           + pane("改进版", "预计 82 / 100 · 改动加粗，标建议号 · 头部 H1 H2", IMPROVED, True) + '</div>')
regress = (
    f'<div style="align-self:stretch;background:{WHITE};border:1px solid {LINE};border-radius:12px;padding:10px 14px;display:flex;flex-direction:column;gap:6px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:800;font-size:13px">回归对照 · 同一输入：一段 SDK 安装文档</span><span style="font-size:11.5px;color:{SUB}">改进必须可验证，不能只靠分数——建议各跑一次</span></div>'
    f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12.5px;line-height:1.5">'
    f'<div><span style="color:{SUB};font-weight:700">原版预期</span>　术语「dependency」时译「依赖」时译「依赖项」，命令行被翻成中文，输出末尾附一句解释</div>'
    f'<div><span style="color:{OK};font-weight:700">改进版预期</span>　术语一致、命令原样、只输出译文；三条验收可逐条打钩</div></div></div>')
cmp_stream = (compare + regress)
cmp_right = (
    f'<div style="display:flex;gap:6px;flex-wrap:wrap">{btn("复制改进版", True, "check")}{btn("存进组件库（技能）", False, "puzzle")}{btn("各跑一次", False, "bolt")}</div>'
    + f'<div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:{SUB};padding-bottom:6px">{ico("flag",16,SUB)}<span>生效假设</span><span style="font-weight:500">不符请指出编号</span></div>'
    + assumption("H1", "人设按「技术文档译者」补全", "原文出现 API、SDK")
    + assumption("H2", "目标读者是开发者，术语保留英文括注", "技术文档惯例") + '</div>'
    + tiles([("58", "原版", HI), ("82", "预计", OK), ("3", "建议", AMBER), ("0 / 12", "六信号", INK)])
    + f'<div style="font-size:12.5px;line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px"><b>不需要工作流。</b>六信号 0 / 12：无工具、无定时、单角色。有 2 分项时才会提一句「用工作流做更稳」，不强推。</div>'
    + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">回「1B」只重出人设那一段，不重打分。存进组件库后出现在 14 组件库「技能 · 诊断存入」。</div>')
DIAG_COMPARE = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 诊断 · 翻译提示词", chips=("零提问诊断", "58 → 预计 82", "已交付")) +
    chat_col(cmp_stream, inputbar("说编号即可调整：如「建议 2 不要」「H1 不对，是市场文案」")) +
    right_col(right_head("出口 · 假设 · 回归", "done"), cmp_right)) + TAIL

FILES = {"DiagnosePaste.dc.html": DIAG_PASTE, "DiagnoseScore.dc.html": DIAG_SCORE, "DiagnoseCompare.dc.html": DIAG_COMPARE}
