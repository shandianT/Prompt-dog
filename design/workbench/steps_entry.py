# -*- coding: utf-8 -*-
"""入口与交付的补画状态：01.2 已识别入口 / 01.3 生成中 / 02.2 生效复述 / 03.2 单提示词交付。示例数据均为演示值。"""
from gen import (ico, sidebar, topbar, inputbar, right_head, right_col, chat_col, frame, user_msg, bot_msg, filechip,
                 option, question, stage, stages_panel, tile, tiles, tree_row, assumption, HEAD, TAIL, COLS3,
                 AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, MID, LO, FIXBG, MONO)
from screens_v2 import btn, preview_card, hchip

ENTRIES = [("一句话", "bolt"), ("贴现有提示词", "edit"), ("描述一段流程", "flow"), ("一个产品想法", "book")]

def recog_bar(hit, arrow, note, alts):
    """识别条：命中的入口 + 「不对？」可切换到其余入口。"""
    others = ''.join(f'<span style="display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 9px;border-radius:999px;background:{WHITE};border:1px solid {LINE};font-size:12px;color:{SUB}">{ico(i,13,SUB,1.8)}{k}</span>' for k, i in alts)
    return (f'<div style="width:100%;max-width:760px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;text-align:left">'
            f'<span style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border-radius:999px;background:{AMBER_SOFT};border:1px solid {AMBER};font-size:12.5px;color:{AMBER};font-weight:700">{ico("check",14,AMBER,2.4)}识别为：{hit}<span style="font-weight:500;color:{INK}">{arrow}</span></span>'
            f'<span style="font-size:12px;color:{SUB}">{note}</span>'
            f'<span style="margin-left:auto;font-size:12px;color:{SUB}">不对？换成</span>{others}</div>')

def input_box(text, files=(), mono=False):
    fchips = ''.join(f'<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:8px;background:{CHATBG};border:1px solid {LINE};font-size:12.5px;color:{INK}">{ico("file",14,SUB)}{f}<span style="color:{SUB};margin-left:2px">×</span></span>' for f in files)
    fam = f'font-family:{MONO};font-size:13.5px;' if mono else 'font-size:15px;'
    return (f'<div style="width:100%;max-width:760px;background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:16px 18px 12px;display:flex;flex-direction:column;gap:10px;text-align:left;box-shadow:0 8px 28px rgba(217,119,6,.10)">'
            f'<div style="min-height:64px;{fam}color:{INK};line-height:1.6;white-space:pre-wrap">{text}<span style="display:inline-block;width:2px;height:16px;background:{AMBER};vertical-align:-3px;animation:blink 1s infinite"></span></div>'
            + (f'<div style="display:flex;gap:6px;flex-wrap:wrap">{fchips}</div>' if files else '')
            + f'<div style="display:flex;gap:8px;align-items:center;border-top:1px solid {LINE};padding-top:10px">'
            f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1.5px solid {AMBER};background:{AMBER_SOFT};font-size:13px;color:{AMBER};font-weight:700">{ico("clip",16,AMBER,2)}<span>再贴材料</span></span>'
            f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {LINE};background:{CHATBG};font-size:13px;color:{SUB}">{ico("bolt",16)}<span>直接做</span></span>'
            f'<span style="margin-left:auto;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:{AMBER};color:#ffffff">{ico("send",20)}</span></div></div>')

def hero(title, sub, recog, box, foot):
    return (f'<div style="flex-grow:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:0 40px">'
            f'<span style="font-size:44px;line-height:1">🐕</span>'
            f'<div style="display:flex;flex-direction:column;gap:6px;max-width:640px"><div style="font-size:24px;font-weight:800;letter-spacing:-.01em">{title}</div>'
            f'<div style="font-size:14px;color:{SUB};line-height:1.7">{sub}</div></div>{recog}{box}'
            f'<div style="font-size:12.5px;color:{SUB}">{foot}</div></div>')

def dim(html):
    return f'<div style="opacity:.45">{html}</div>'

def picked(icon, title, sub, note):
    return (f'<div style="display:flex;gap:12px;align-items:flex-start;border:1.5px solid {AMBER};border-radius:12px;padding:12px 14px;background:{WHITE};box-shadow:0 6px 20px rgba(217,119,6,.10)">'
            f'<span style="width:38px;height:38px;border-radius:10px;background:{AMBER};display:flex;align-items:center;justify-content:center;flex-shrink:0">{ico(icon,20,"#ffffff",1.8)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-weight:700;font-size:13.5px">{title} <span style="font-size:11px;background:{AMBER_SOFT};color:{AMBER};border-radius:4px;padding:1px 6px;font-weight:700;margin-left:4px">已选</span></span>'
            f'<span style="font-size:12.5px;color:{SUB};line-height:1.5">{sub}</span><span style="font-size:11.5px;color:{AMBER};font-weight:600">{note}</span></div></div>')

def why_card(title, rows):
    return (f'<div style="border:1px solid {LINE};border-radius:12px;padding:11px 14px;display:flex;flex-direction:column;gap:5px">'
            f'<span style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">{title}</span>'
            + ''.join(f'<div style="display:flex;gap:8px;font-size:12.5px;line-height:1.5"><span style="color:{AMBER};font-weight:700;flex-shrink:0">{k}</span><span style="color:{INK}">{v}</span></div>' for k, v in rows) + '</div>')

# ===================================================================== 01.2 已识别入口（一段流程）
FLOW_TEXT = ("我们投标流程：销售把线索录进 CRM → 商务每天刷招标平台下载文件 → 售前看废标项决定投不投 → 写标书要找资质和业绩 → 财务报价常卡两天 → 领导审批 → 递交。哪些能交给 AI？")
typing_main = hero("说一句想让 AI 做的事，或把你们的流程和材料丢进来", "四种进法自动识别，都先按推荐值把东西做出来，卡片只用来纠错——不回复也能用。",
                   recog_bar("一段流程", " → 泳道图找卡点", "不判级，直接出图", [ENTRIES[0], ENTRIES[1], ENTRIES[3]]),
                   input_box(FLOW_TEXT, ["投标流程说明.docx · 12 页", "商务群聊天记录.txt · 3.8k 字"]),
                   "发送后先出图（20–40 秒），出图后可拖可改，不问问题。材料决定现状图八成质量。")
typing_right = (
    f'<div style="font-size:12.5px;color:{SUB};line-height:1.6">按你给的东西自动选一种先做出来；说编号（节点号 / H 号）就能改。</div>'
    + picked("flow", "泳道流程图", "自动 / 人 / 数据与系统三条道，标卡点 · 缺口 · 待打通，附打包建议", "有材料：先从 2 份材料反推现状，每个节点记来源")
    + dim(preview_card("book", "三件套", "一个产品想法 → 五问首行 + 一页产品定义 + 故事清单", "先做哪条故事，★ 已选好"))
    + dim(preview_card("folder", "资产包", "一句话 → 路由 · 主控 · 各环节提示词 · 启动指令 · 验收清单.json", "拖进任意工作区即上岗"))
    + why_card("识别依据", [("命中", "「流程」「→」「谁做什么」「哪些能交给 AI」"), ("材料", "2 份 → 反推现状，不按行业库猜"), ("不判级", "流程重构与设计两个入口先出图，判级在「按这个建」之后")]))
ENTRY_TYPING = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 新会话", chips=("已识别：一段流程",)) +
    chat_col(typing_main, '') +
    right_col(right_head("交付物预览 · 先做出来再纠错"), typing_right)) + TAIL

# ===================================================================== 01.3 生成中（= 07.1）
gen_rows = [stage("读材料", "2 份 · 抽出 31 条事实，每条记出处", "done"), stage("抽节点", "19 个 · 7 个来自材料原话，12 个推断标 H", "done"),
            stage("分泳道", "自动 7 · 人 7 · 数据与系统 5", "done"), stage("打标记", "卡点 2 · 缺口 1 · 待打通 4 · 逐条写「怎么解」", "run"),
            stage("出目标态", "打包建议 · 楔子 ★ · 构建预览", "todo")]
gen_stream = (
    user_msg(filechip("投标流程说明.docx · 12 页") + filechip("商务群聊天记录.txt · 3.8k 字") + f"<div>{FLOW_TEXT}</div>")
    + bot_msg("提示狗 🐕", "收到 2 份材料。先从材料<b>反推现状</b>，不问问题；20–40 秒后出泳道图，出图后你只需要纠错——说节点编号，或直接拖。")
    + stages_panel("反推现状 · 投标流程 · 第 4 / 5 步", gen_rows)
    + f'<div style="font-size:12.5px;color:{SUB};padding:0 4px">这一步没有按钮——没有可以按的。生成中也可以先说话，下一步生效。</div>')
def ph(x, y, w, label='', flag=None):
    f = f'<span style="position:absolute;right:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:{flag}"></span>' if flag else ''
    bg = WHITE if label else CHATBG
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:28px;border:1px solid {LINE};background:{bg};border-radius:7px;'
            f'font-size:10.5px;display:flex;align-items:center;justify-content:center;font-weight:600;color:{INK};overflow:hidden;white-space:nowrap">{label}{f}</div>')
forming = (f'<div style="position:relative;height:188px;background:{CHATBG};border:1px solid {LINE};border-radius:10px;overflow:hidden">'
           + ''.join(f'<div style="position:absolute;left:0;top:{y}px;width:100%;height:62px;border-top:1px dashed {LINE}"><span style="position:absolute;left:6px;top:4px;font-size:10px;color:{SUB};font-weight:700">{n}</span></div>'
                     for n, y in [("AI 自动", 0), ("人", 62), ("数据与系统", 124)])
           + ph(120, 20, 84, "招标解析") + ph(214, 20, 84, "应答矩阵") + ph(308, 20, 74, "分章撰写") + ph(392, 20, 40)
           + ph(20, 82, 68, "商机进入") + ph(98, 82, 84, "获取招标文件", HI) + ph(192, 82, 56, "投不投") + ph(258, 82, 56, "报价", HI) + ph(324, 82, 68, "领导审批") + ph(402, 82, 30)
           + ph(20, 144, 56, "CRM", LO) + ph(98, 144, 68, "招标平台", LO) + ph(214, 144, 60, "素材库", AMBER) + ph(300, 144, 40) + ph(360, 144, 40)
           + f'<div style="position:absolute;right:10px;bottom:8px;font-size:10.5px;color:{SUB}">19 / 19 节点 · 正在打标记</div></div>')
other_rows = [("一句话", "判级 → 验收标准 → 环节表 → 各环节提示词 → 会话内试跑"), ("贴提示词", "十维打分 → 三条建议 → 改进版全文 → 回归对照"), ("产品想法", "五问 → 产品定义 → 故事清单 → 图 → 四视角找茬")]
gen_right = (
    f'<div style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700;font-size:13.5px">图正在成形</span>'
    f'<span style="margin-left:auto;font-size:11.5px;color:{SUB}">自动 7 · 人 7 · 数据 5</span></div>{forming}'
    f'<div style="font-size:11.5px;color:{SUB};line-height:1.5">红点 = 卡点 · 琥珀 = 缺口 · 蓝 = 待打通；名字来自材料原话的节点先出现，推断的后出现并标 H。</div></div>'
    + f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">其他入口的生成步骤</div>'
    + ''.join(f'<div style="display:flex;gap:10px;align-items:baseline;padding:7px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5"><span style="width:64px;flex-shrink:0;font-weight:700">{k}</span><span style="color:{SUB}">{v}</span></div>' for k, v in other_rows)
    + '</div>'
    + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">生成完成直接进 07 画布；一句话的 L3 进 02，L1–L2 进 03.2；贴提示词进 13.2；产品想法进 11。</div>')
ENTRY_GENERATING = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 投标流程", chips=("流程重构", "生成中 · 第 4 / 5 步")) +
    chat_col(gen_stream, inputbar("生成中也能说：比如「财务报价其实要三天」")) +
    right_col(right_head("交付物预览 · 泳道流程图", "live"), gen_right)) + TAIL

# ===================================================================== 02.2 生效复述
applied_card = (
    f'<div style="align-self:stretch;background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:10px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
    f'<span style="font-size:12.5px;color:{OK};font-weight:800;display:inline-flex;align-items:center;gap:5px">{ico("check",14,OK,2.4)}纠错已生效</span>'
    + hchip("Q1 = C · 你选的").replace(f'<b style="font-family:{MONO};color:{AMBER};margin-right:5px">H</b>', '') + hchip("Q2 = C · ★ 未答按推荐").replace(f'<b style="font-family:{MONO};color:{AMBER};margin-right:5px">H</b>', '')
    + hchip("1 竞品固定 3–5 家") + hchip("2 高管摘要 + 团队附录") + hchip("3 来源：官网 / 公告 / 行业媒体") + hchip("4 周一 09:00 生成，中文")
    + f'<span style="margin-left:auto;font-size:12px;color:{SUB};display:inline-flex;align-items:center;gap:4px">{ico("chev",14,SUB)}展开卡片</span></div>')
applied_stream = (
    user_msg("我想要一个每周自动做竞品分析报告的工作流")
    + user_msg("1C")
    + bot_msg("提示狗 🐕", "生效：<b>Q1 = C</b>（API / 代码编排：定时、并行）。受影响的只有<b>环节 2 采集</b>与<b>环节 5 成稿</b>的运行方式，正在重出这两处；其余不动，H1–H4 不变。Q2 你没答，按 ★ C（错误代价高）生效。")
    + applied_card
    + bot_msg("提示狗 🐕", f'重出完成后直接进交付（03），不再问第二轮。<span style="color:{SUB}">「不对」也只会重出受影响的部分，不重来。</span>'))
applied_rows = [stage("验收标准先行", "6 条可二值判定 · 不变", "done"), stage("环节表与数据契约", "5 环节 · JSON 契约 · 不变", "done"),
                stage("各环节提示词", "重出环节 2、5 · 定时触发 + 并行采集", "run"), stage("会话内试跑", "重出后再跑一次", "todo"), stage("验收清单.json · 上手指南", "运行环境写 API 编排", "todo")]
applied_right = (
    f'<div style="border:1px solid {LINE};border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:10px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;font-weight:800;color:{AMBER};letter-spacing:.08em">判级</span>'
    f'<span style="font-weight:700;font-size:14.5px">L3 · 提示链 · 资产包</span><span style="margin-left:auto;font-size:12px;color:{SUB}">级别不变</span></div>'
    f'<div style="display:flex;gap:6px;flex-wrap:wrap"><span style="display:inline-flex;align-items:center;height:26px;padding:0 9px;border-radius:6px;background:{AMBER_SOFT};border:1px solid {AMBER};font-size:12px;color:{AMBER};font-weight:700">运行环境：API / 代码编排</span>'
    f'<span style="display:inline-flex;align-items:center;height:26px;padding:0 9px;border-radius:6px;background:{CHATBG};border:1px solid {LINE};font-size:12px;color:{SUB}">原：带工具的 Agent 环境</span></div>'
    f'<div style="font-size:13px;line-height:1.6;color:{INK}">改运行环境只影响「怎么触发、能不能并行」，不改环节和契约，所以只重出两处。</div></div>'
    + stages_panel("竞品分析Agent / 资产包 · 重出中", applied_rows)
    + f'<div style="font-size:12.5px;color:{SUB};line-height:1.6;padding:0 4px">纠错与重问的区别：回复后只重出受影响的部分；变级才会换产物形态并宣告。</div>')
CONFIRM_APPLIED = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 竞品分析工作流", chips=("L3 提示链", "纠错已生效 · 重出 2 处")) +
    chat_col(applied_stream, inputbar("还想改就继续说编号；不说就等交付")) +
    right_col(right_head("交付物预览", "live"), applied_right)) + TAIL

# ===================================================================== 03.2 单提示词交付（L1）
PROMPT_BODY = [
    ("角色", "你是会议纪要整理助手，服务没参会的人。"),
    ("任务", "把「### 纪要」下的文本压缩成恰好 3 条要点。"),
    ("输出格式", "1. 要点（≤ 30 字）— 责任人 · 截止日\n2. …\n3. …"),
    ("规则", "只用纪要里有的信息；没有责任人或截止日写【未提及】；不评价、不建议。"),
    ("验收", "3 条 · 每条 ≤ 30 字 · 责任人 / 截止日字段齐 · 无纪要外信息"),
    ("### 纪要", "{在这里贴纪要}"),
]
prompt_card = (
    f'<div style="align-self:stretch;background:{WHITE};border:1px solid {LINE};border-radius:14px;overflow:hidden">'
    f'<div style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid {LINE};background:{CHATBG}">'
    f'<span style="font-weight:700;font-size:13.5px;white-space:nowrap">会议纪要 → 三条要点</span><span style="font-family:{MONO};font-size:11.5px;color:{SUB};white-space:nowrap">v1.0 · 2026-09-08</span>'
    f'<span style="font-size:11.5px;color:{SUB};white-space:nowrap">生效假设 H1 H2</span><span style="margin-left:auto;font-size:11.5px;color:{SUB}">单提示词 · 可复制、可存为技能</span></div>'
    f'<div style="padding:12px 16px;display:flex;flex-direction:column;gap:7px;font-family:{MONO};font-size:12.5px;line-height:1.6">'
    + ''.join(f'<div style="display:flex;gap:12px"><span style="width:76px;flex-shrink:0;color:{AMBER};font-weight:700">{k}</span><span style="white-space:pre-wrap;color:{INK}">{v}</span></div>' for k, v in PROMPT_BODY)
    + '</div>'
    f'<div style="display:flex;gap:8px;align-items:center;padding:10px 16px;border-top:1px solid {LINE}">{btn("复制", True, "check")}{btn("存进组件库（技能）", False, "puzzle")}{btn("试一次（自拟样例）", False, "bolt")}'
    f'<span style="margin-left:auto;font-size:12px;color:{SUB}">想改就说编号</span></div></div>')
prompt_stream = (
    user_msg("帮我写一个把会议纪要总结成三条要点的提示词")
    + bot_msg("提示狗 🐕", "这是单条提示词就能做好的事（六信号 <b>0 / 12</b>），直接给，不出选择题：")
    + prompt_card
    + bot_msg("提示狗 🐕", f'用法：把纪要贴在「### 纪要」下面发出。想改就说编号：「H2 不对」「验收 2 改成 40 字」。<span style="color:{SUB}">存进组件库后，任何工作狗都能把它当技能引用。</span>'))
def acc_row(t):
    return f'<div style="display:flex;gap:9px;align-items:flex-start;padding:8px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5">{ico("check",15,OK,2.2)}<span>{t}</span></div>'
prompt_right = (
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">验收标准 · 先于提示词写</div>'
    + acc_row("恰好 3 条，每条 ≤ 30 字") + acc_row("每条含责任人与截止日，缺则写【未提及】") + acc_row("不引入纪要里没有的信息") + '</div>'
    + f'<div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:{SUB};padding-bottom:6px">{ico("flag",16,SUB)}<span>生效假设</span><span style="font-weight:500">不符请指出编号</span></div>'
    + assumption("H1", "输出中文，要点面向没参会的人", "对话语言 · 「总结」")
    + assumption("H2", "纪要为文本，不含音频转写", "未提及录音") + '</div>'
    + tiles([("0 / 12", "六信号", INK), ("L1", "单提示词", AMBER), ("3", "验收标准", OK), ("2", "假设", INK)])
    + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">不建资产包：L1 / L2 只交付提示词或 SOP，家在组件库（14）不在犬舍。</div>')
DELIVER_PROMPT = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 会议纪要三要点", chips=("L1 单提示词", "已交付 v1.0")) +
    chat_col(prompt_stream, inputbar("说编号即可调整：如「验收 2 改成 40 字」「H2 不对」")) +
    right_col(right_head("验收与假设", "done"), prompt_right)) + TAIL

FILES = {"EntryTyping.dc.html": ENTRY_TYPING, "EntryGenerating.dc.html": ENTRY_GENERATING, "ConfirmApplied.dc.html": CONFIRM_APPLIED, "DeliverPrompt.dc.html": DELIVER_PROMPT}
