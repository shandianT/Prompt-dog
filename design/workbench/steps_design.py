# -*- coding: utf-8 -*-
"""11 设计的两个补画状态：11.2 故事清单（stories.json 的界面）/ 11.3 四视角找茬（交付前的对抗审查）。
11.1 产品定义在 design_screen.py。方法见 references/design-mode.md。示例：小餐馆排班工具。示例数据均为演示值。"""
from gen import (ico, sidebar, topbar, right_head, right_col, frame, assumption, option, question, tile, tiles,
                 HEAD, TAIL, COLS3, AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, LO, FIXBG, MONO)
from design_screen import tab, sec, table, star, five_band, design_actions
from screens_v2 import btn

# ===================================================================== 11.2 故事清单
STORIES = [
    ("S01", "作为店长，我要录入员工和每人的可用时段，以便生成班表有依据", "—", "★ 先做", ["员工 ≥1 人可保存", "时段冲突即时提示"]),
    ("S02", "作为店长，我要一键按规则生成一周班表，以便 10 分钟排完", "S01", "", ["每天每班至少 1 人", "无人排在不可用时段"]),
    ("S03", "作为店长，我要手工调整并发布班表，以便员工看到", "S02", "", ["拖动换人后冲突重算", "发布后员工端可见"]),
    ("S04", "作为员工，我要申请换班，以便不用打电话", "S03", "", ["申请写入记录", "对方与店长收到通知"]),
    ("S05", "作为店长，我要审批换班（人审），以便班表始终有人负责", "S04", "人审 · 停在这里", ["通过 / 驳回二选一", "5 分钟未处理提醒"]),
    ("S06", "作为老板，我要每周工时汇总，以便人力成本不超", "S03", "", ["按人按周合计", "超过阈值标红"]),
    ("S07", "作为店长，我要 AI 排班建议，以便规则覆盖不到时有参考 —— 转主循环", "S02 · H3 验不过", "转主循环", ["建议附理由", "可一键采纳或忽略"]),
]
def s_row(no, story, dep, tag, acc):
    t = ''
    if tag:
        c = AMBER if "★" in tag else (LO if "转主循环" in tag else SUB)
        t = f'<span style="display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:6px;background:{AMBER_SOFT if "★" in tag else CHATBG};border:1px solid {c if "★" in tag else LINE};font-size:11px;color:{c};font-weight:700;white-space:nowrap">{tag}</span>'
    box = f'<span style="width:16px;height:16px;border-radius:4px;border:1.5px solid {LINE};background:{WHITE};display:inline-block"></span>'
    return (f'<tr>'
            f'<td style="padding:8px 8px 8px 0;border-bottom:1px solid {LINE};font-family:{MONO};font-weight:700;color:{AMBER};font-size:12.5px;vertical-align:top;white-space:nowrap">{no}</td>'
            f'<td style="padding:8px;border-bottom:1px solid {LINE};font-size:13px;line-height:1.5;vertical-align:top">{story}<div style="font-size:11.5px;color:{SUB};margin-top:2px">验收：{" · ".join(acc)}</div></td>'
            f'<td style="padding:8px;border-bottom:1px solid {LINE};font-family:{MONO};font-size:12px;color:{SUB};vertical-align:top;white-space:nowrap">{dep}</td>'
            f'<td style="padding:8px;border-bottom:1px solid {LINE};vertical-align:top;text-align:center">{ico("check",15,OK,2.4)}</td>'
            f'<td style="padding:8px;border-bottom:1px solid {LINE};vertical-align:top;text-align:center">{box}</td>'
            f'<td style="padding:8px 0 8px 8px;border-bottom:1px solid {LINE};vertical-align:top">{t}</td></tr>')
stories_table = (
    f'<table style="border-collapse:collapse;width:100%"><thead><tr>'
    + ''.join(f'<th style="text-align:{"center" if h in ("一个上下文", "passes") else "left"};font-size:11.5px;color:{SUB};font-weight:600;padding:4px 8px 8px {"0" if h == "编号" else "8px"};border-bottom:1px solid {LINE};white-space:nowrap">{h}</th>' for h in ["编号", "故事（作为 … 我要 … 以便 …）", "依赖", "一个上下文", "passes", "标签"])
    + '</tr></thead><tbody>' + ''.join(s_row(*s) for s in STORIES) + '</tbody></table>')
stories_main = (
    f'<main style="display:flex;flex-direction:column;min-width:0;background:{CHATBG}">'
    f'<div style="display:flex;align-items:center;gap:6px;padding:12px 26px 0">{tab("产品定义")}{tab("故事", True, "7")}{tab("SPEC", False, "可选")}'
    f'<span style="margin-left:auto;font-size:12px;color:{SUB}">按依赖排序 · 每条一个上下文能做完 · 说故事号就能改</span></div>'
    f'<div style="flex-grow:1;min-height:0;padding:14px 26px 18px;display:flex;flex-direction:column;gap:12px;overflow:hidden">'
    f'{five_band}'
    f'<div style="background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:10px 20px 6px;overflow:hidden;flex-grow:1;min-height:0">{stories_table}</div>'
    f'<div style="display:flex;gap:12px;font-size:12px;color:{SUB};line-height:1.6">'
    f'<div style="flex:1;border:1px solid {LINE};border-radius:10px;padding:8px 12px;background:{WHITE}"><b style="color:{INK}">passes</b> 由搭建者验收后置 true，不驱动上岗循环；上岗只认 验收清单.json。</div>'
    f'<div style="flex:1;border:1px solid {LINE};border-radius:10px;padding:8px 12px;background:{WHITE}"><b style="color:{INK}">转主循环</b> 的故事按「按这个建」进 02 判级；其余故事是人来开发的开工单。</div></div>'
    '</div></main>')
stories_right = (
    f'<div style="background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:12px 16px;display:flex;flex-direction:column;gap:10px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:800;font-size:13.5px">可选纠错</span><span style="font-size:12px;color:{SUB}">不回复即按 ★ 生效</span></div>'
    + question("Q1 先做哪条", [option("S01 录入与生成", "已采用：原话痛点「排班 2 小时」", True), option("S04 换班"), option("其他（一句话说明）")])
    + '</div>'
    + tiles([("7", "故事", INK), ("0", "passes", SUB), ("1", "转主循环", LO), ("4", "核心场景全覆盖", OK)])
    + f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">依赖链</div>'
    f'<div style="font-family:{MONO};font-size:12px;line-height:1.9;color:{INK}">S01 → S02 → S03 → S04 → S05<br>S03 → S06　　S02 → S07<span style="color:{SUB}">（H3 验不过时）</span></div></div>'
    + f'<div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:{SUB};padding-bottom:6px">{ico("flag",16,SUB)}<span>相关假设</span></div>'
    + assumption("H3", "规则排班覆盖 80% 情况", "S07 只在验不过时建")
    + assumption("H2", "可用时段两周内改动 ≤2 次", "决定 S01 是否要每日确认") + '</div>'
    + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">每条 ≥2 条二值验收，其中 ≥1 条来自 verification.md 类型必带项；产品定义的 4 个核心场景各至少一条。</div>')
DESIGN_STORIES = HEAD + frame(COLS3,
    sidebar("dog", design_active=True) + topbar("设计 · 小餐馆排班工具", chips=("五问 5/5", "故事 7 · 0 通过", "H 假设 5"), actions=[("按这个建 · S07", "primary", "bolt")]) +
    stories_main +
    right_col(right_head("先做哪条 · 依赖 · 假设"), stories_right)) + TAIL

# ===================================================================== 11.3 四视角找茬
LENSES = [
    ("老板", "30 秒答不出五问中的哪一问", OK, [
        ("✓", "五问 30 秒可答；一句话 32 字含对象与动作", "通过"),
        ("△", "「怎么算成功」没有基线", "已改 · 指标补基线：现在 2 小时 → ≤10 分钟"),
    ]),
    ("搭建者", "按 S01 今天能开工吗，缺什么输入", OK, [
        ("✓", "S01 一个上下文能做完；技术栈 ★ 小程序已定", "通过"),
        ("△", "缺数据结构：员工 / 班次 / 可用时段", "已改 · 写进 SPEC 可选骨架 §数据"),
    ]),
    ("执行者", "跑完知道停在哪吗", OK, [
        ("✓", "只停两处：发布班表（人定）· 换班审批（人审）", "通过"),
        ("△", "员工没有账号怎么看班表", "转 H5 · 微信链接免登录，验：3 家店员工打开率 ≥80%"),
    ]),
    ("反方", "哪条 H 最先垮；哪条指标不能从文件回填", AMBER, [
        ("✗", "H3「规则覆盖 80%」最先垮", "已写验法 · 一家店跑 4 周，人工改动 ≤20%；验不过上 S07"),
        ("△", "已有钉钉排班，为什么不用", "驳回附理由 · 非目标补差异：小店无审批链，换班要 5 分钟内有回复"),
        ("△", "「换班响应 ≤5 分钟」能从文件回填吗", "已改 · 复盘模板加「申请→回复」时间戳字段"),
    ]),
]
def lens_col(name, q, c, rows):
    def r(mark, finding, handling):
        mc = OK if mark == "✓" else (HI if mark == "✗" else AMBER)
        return (f'<div style="display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5">'
                f'<span style="font-weight:800;color:{mc};flex-shrink:0;width:14px">{mark}</span>'
                f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span>{finding}</span><span style="font-size:11.5px;color:{SUB}">{handling}</span></div></div>')
    return (f'<div style="flex:1;min-width:0;background:{WHITE};border:1px solid {LINE};border-top:3px solid {c};border-radius:12px;padding:10px 14px 4px;display:flex;flex-direction:column">'
            f'<div style="display:flex;flex-direction:column;gap:1px;padding-bottom:6px"><span style="font-size:14px;font-weight:800">{name}</span><span style="font-size:11.5px;color:{SUB}">{q}</span></div>'
            + ''.join(r(*x) for x in rows) + '</div>')
review_main = (
    f'<main style="display:flex;flex-direction:column;min-width:0;background:{CHATBG}">'
    f'<div style="display:flex;align-items:center;gap:6px;padding:12px 26px 0">{tab("产品定义", True)}{tab("故事", False, "7")}{tab("SPEC", False, "可选")}'
    f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:12px;color:{OK};font-weight:700">{ico("check",14,OK,2.4)}四视角找茬已过 · 9 条反驳全部处理</span></div>'
    f'<div style="flex-grow:1;min-height:0;padding:14px 26px 18px;display:flex;flex-direction:column;gap:12px;overflow:hidden">'
    f'{five_band}'
    f'<div style="display:flex;align-items:center;gap:10px"><span style="font-size:15px;font-weight:800">四视角找茬 · 交付前</span>'
    f'<span style="font-size:12.5px;color:{SUB}">每个视角至少一条反驳，处理方式三选一：采纳并改文档 / 写入 H / 驳回附理由。找茬不是评审会，是就地修。</span></div>'
    f'<div style="display:flex;gap:10px;align-items:stretch">' + ''.join(lens_col(*l) for l in LENSES) + '</div>'
    f'<div style="display:flex;gap:10px;font-size:12px;color:{SUB}">'
    f'<div style="flex:1;border:1px solid {LINE};border-radius:10px;padding:8px 12px;background:{WHITE}">处理结果：<b style="color:{INK}">采纳并改文档 4</b> · <b style="color:{INK}">写入 H 2</b>（H5 新增、H3 补验法）· <b style="color:{INK}">驳回附理由 1</b> · 通过 3</div>'
    f'<div style="flex:1;border:1px solid {LINE};border-radius:10px;padding:8px 12px;background:{WHITE}">改动落点：产品定义 §指标 §非目标 · SPEC §数据 · 复盘模板 +1 字段 · H 假设表 +1</div></div>'
    '</div></main>')
GATES = ["五问首行五段各非空，或带 H 号", "一句话 ≤40 字，含对象与动作", "用户表每行三列齐", "每条成功指标有数字与判法", "非目标 ≥3 条，且不在 stories 里",
         "每条 H 有「怎么验 / 验不过怎么办」", "待拍板 ≤6 条，每条带 ★", "stories 每条 ≥2 条二值验收、一个上下文能做完", "每个核心场景在 stories 里至少一条",
         "四视角各 ≥1 条反驳已处理", "章节骨架与 output-templates 一致", "有图时图档位已写入 H"]
review_right = (
    f'<div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:8px;padding-bottom:4px"><span style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">门槛 · 12 / 12</span><span style="font-size:11.5px;color:{SUB}">design-mode.md · 写不成打钩项的不算</span></div>'
    + ''.join(f'<div style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;border-top:1px solid {LINE};font-size:12px;line-height:1.45">{ico("check",14,OK,2.4)}<span>{g}</span></div>' for g in GATES) + '</div>'
    + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">门槛全过才交付；交付顺序固定：五问首行 → 产品定义 → stories → 图 → H → 可选纠错卡。</div>')
DESIGN_REVIEW = HEAD + frame(COLS3,
    sidebar("dog", design_active=True) + topbar("设计 · 小餐馆排班工具", chips=("五问 5/5", "找茬 9 / 9 已处理", "H 假设 6"), actions=[("按这个建", "primary", "bolt")]) +
    review_main +
    right_col(right_head("门槛清单", "done"), review_right)) + TAIL

FILES = {"DesignStories.dc.html": DESIGN_STORIES, "DesignReview.dc.html": DESIGN_REVIEW}
