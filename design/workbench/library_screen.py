# -*- coding: utf-8 -*-
"""14 组件库列表：侧栏「组件库 12」的落点。三处来源在这里汇合：犬舍（工作狗）· 诊断存入（技能）· 行业库（know-how / 数据模板）。示例数据均为演示值。"""
from gen import (ico, sidebar, topbar, frame, HEAD, TAIL, COLS2,
                 AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, MID, LO, FIXBG, MONO)

KIND = {"dog": ("工作狗", AMBER, AMBER_SOFT), "skill": ("技能", LO, "#eff4ff"), "know": ("know-how", OK, FIXBG), "data": ("数据", INK, "#f5f2ec")}
ROWS = [
    ("dog", "合同审查", "七环节初审，三件套交付", "v1.2", "2 条流程 · n8 · c3", "ok", "犬舍", "2026-09-07"),
    ("dog", "标书撰写", "按评分点写，废标项逐条核对", "v1.2", "1 条流程 · n3–n10", "stop", "犬舍", "2026-09-05"),
    ("dog", "内容营销", "透明换信任写作，素材库保真", "v1.1", "1 条流程", "ok", "犬舍", "2026-08-30"),
    ("dog", "竞品分析", "每周一采集 → 周环比 → 摘要", "v1.0", "1 条流程 · n6", "new", "犬舍 · 今天", "2026-09-08"),
    ("skill", "联网检索", "带来源的检索，逐条可追溯", "v2.0", "3 只狗", "ok", "行业库", "2026-08-12"),
    ("skill", "对抗审查", "切换成挑剔评审，只找问题", "v1.4", "3 只狗", "ok", "行业库", "2026-08-20"),
    ("skill", "素材检索", "按应答矩阵从素材库取材", "v1.1", "2 只狗", "ok", "犬舍拆出", "2026-09-01"),
    ("skill", "复盘回填", "结果与评审意见回流上游资产", "v1.0", "4 处引用", "new", "行业库", "2026-09-08"),
    ("skill", "会议纪要三要点", "纪要 → 恰好 3 条要点", "v1.0", "0 · 刚存入", "new", "诊断存入", "2026-09-08"),
    ("know", "来源清单", "可信来源与排除项", "v3", "2 只狗", "ok", "你的材料", "2026-08-02"),
    ("know", "招投标废标项清单", "行业库 · 逐条核对", "v3", "1 只狗", "ok", "行业库", "2026-07-15"),
    ("data", "CRM 商机", "只读接口 · 商机 / 客户资料", "—", "1 条流程 · s1", "pending", "数据模板", "2026-09-08"),
]
STATUS = {"ok": (OK, "check", "达标"), "stop": (HI, "warn", "止损待处理"), "new": (SUB, "clock", "新 · 尚未运行"), "pending": (LO, "dot", "待打通")}

def row(kind, name, sub, ver, used, st, src, date):
    k, kc, kbg = KIND[kind]
    sc, si, sl = STATUS[st]
    return (f'<tr>'
            f'<td style="padding:7px 10px 7px 0;border-bottom:1px solid {LINE}"><div style="display:flex;gap:10px;align-items:center;min-width:0">'
            f'<span style="width:8px;height:8px;border-radius:50%;background:{kc};flex-shrink:0;{"border:2px solid " + INK + ";background:#fff;" if kind == "data" else ""}"></span>'
            f'<span style="font-weight:700;font-size:13.5px;white-space:nowrap">{name}</span>'
            f'<span style="font-size:12px;color:{SUB};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">{sub}</span></div></td>'
            f'<td style="padding:7px 10px;border-bottom:1px solid {LINE}"><span style="display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:6px;background:{kbg};color:{kc};font-size:11.5px;font-weight:700;white-space:nowrap">{k}</span></td>'
            f'<td style="padding:7px 10px;border-bottom:1px solid {LINE};font-family:{MONO};font-size:12px;color:{SUB};white-space:nowrap">{ver}</td>'
            f'<td style="padding:7px 10px;border-bottom:1px solid {LINE};font-size:12.5px;white-space:nowrap">{used}</td>'
            f'<td style="padding:7px 10px;border-bottom:1px solid {LINE}"><span style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:{sc};font-weight:600;white-space:nowrap">{ico(si,14,sc,2.2)}{sl}</span></td>'
            f'<td style="padding:7px 10px;border-bottom:1px solid {LINE};font-size:12.5px;color:{SUB};white-space:nowrap">{src}</td>'
            f'<td style="padding:7px 0 7px 10px;border-bottom:1px solid {LINE};font-family:{MONO};font-size:11.5px;color:{SUB};white-space:nowrap;text-align:right">{date}</td></tr>')

filters = ''.join(
    f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;border:1px solid {AMBER if i == 0 else LINE};background:{AMBER_SOFT if i == 0 else WHITE};color:{AMBER if i == 0 else SUB};font-size:13.5px;font-weight:{700 if i == 0 else 500};white-space:nowrap">{t}</span>'
    for i, t in enumerate(("全部 12", "工作狗 4", "技能 5", "know-how 2", "数据 1", "待回归 / 止损 1", "新 3")))
def src_card(icon, title, body):
    return (f'<div style="flex:1;min-width:0;border:1px solid {LINE};border-radius:12px;padding:11px 14px;background:{WHITE};display:flex;gap:10px;align-items:flex-start">'
            f'<span style="width:32px;height:32px;border-radius:8px;background:{AMBER_SOFT};display:flex;align-items:center;justify-content:center;flex-shrink:0">{ico(icon,17,AMBER,1.8)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-weight:700;font-size:13px">{title}</span><span style="font-size:12px;color:{SUB};line-height:1.5">{body}</span></div></div>')
lib_main = (
    f'<main style="min-width:0;overflow:hidden;padding:26px 36px;display:flex;flex-direction:column;gap:16px">'
    f'<div style="display:flex;align-items:flex-end;gap:16px"><div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:24px;font-weight:800;letter-spacing:-.01em">组件库</span>'
    f'<span style="font-size:14px;color:{SUB}">组件即资产：工作狗、技能、know-how、数据模板都在这里，改一处全局同步；点进去看契约、复用于哪些流程、版本与改动（09）。</span></div>'
    f'<div style="margin-left:auto;display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;border:1px solid {LINE};border-radius:10px;background:{WHITE};color:{SUB};font-size:13.5px;min-width:240px">{ico("search",18,SUB)}<span>搜组件</span></div></div>'
    f'<div style="display:flex;gap:8px;align-items:center">{filters}</div>'
    f'<div style="background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:4px 20px 6px;overflow:hidden"><table style="border-collapse:collapse;width:100%"><thead><tr>'
    + ''.join(f'<th style="text-align:{"right" if h == "上次改动" else "left"};font-size:11.5px;color:{SUB};font-weight:600;padding:10px {"0 10px 10px" if h == "上次改动" else "10px 10px 0"};border-bottom:1px solid {LINE};white-space:nowrap">{h}</th>' for h in ["组件", "类型", "版本", "复用于", "状态", "来源", "上次改动"])
    + '</tr></thead><tbody>' + ''.join(row(*r) for r in ROWS) + '</tbody></table></div>'
    f'<div style="display:flex;gap:12px">'
    + src_card("grid", "犬舍 → 工作狗", "03 交付时自动入库；一只狗 = 一个可复用的子图，双击画布节点即钻取")
    + src_card("edit", "诊断存入 → 技能", "13.3 / 03.2 的单条提示词存进来，任何工作狗都能当技能引用")
    + src_card("book", "行业库 → know-how / 数据模板", "废标项清单、来源清单、CRM / ERP / OA 模板；拖进画布即标待打通")
    + '</div></main>')
LIBRARY = HEAD + frame(COLS2, sidebar("library") +
    topbar("组件库", chips=("12 个组件", "工作狗 4 · 技能 5 · know-how 2 · 数据 1", "示例数据"), actions=[("新组件", "primary", "plus")]) + lib_main) + TAIL

FILES = {"Library.dc.html": LIBRARY}
