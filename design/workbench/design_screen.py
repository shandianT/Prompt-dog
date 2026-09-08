# -*- coding: utf-8 -*-
"""11 设计 · 从一个想法到能开工的三件套（DesignScreen.dc.html）
主栏：三件套 tab（产品定义 ★ / 故事 / SPEC）+ 五问首行 + 一页产品定义；右栏：泳道图（档位由环境决定）+ H 假设 + 可选纠错卡。
示例：小餐馆排班工具（evals 用例 11）。数据均为演示值。"""
from gen import (ico, sidebar, topbar, right_head, right_col, frame, assumption, option, question, tile,
                 HEAD, TAIL, COLS3, AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, LO, MONO)

def tab(label, on=False, badge=None):
    b = f'<span style="font-size:11px;background:{AMBER if on else LINE};color:{"#ffffff" if on else SUB};border-radius:5px;padding:1px 6px;font-weight:700">{badge}</span>' if badge else ''
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:8px;font-size:13.5px;font-weight:{700 if on else 500};'
            f'background:{WHITE if on else "transparent"};color:{INK if on else SUB};border:1px solid {LINE if on else "transparent"}">{label}{b}</span>')

def sec(title, body):
    return (f'<div style="display:flex;flex-direction:column;gap:3px"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">{title}</div>{body}</div>')

def table(head, rows):
    th = ''.join(f'<th style="text-align:left;font-size:12px;color:{SUB};font-weight:600;padding:4px 8px;border-bottom:1px solid {LINE}">{h}</th>' for h in head)
    trs = ''.join('<tr>' + ''.join(f'<td style="font-size:12.5px;padding:5px 8px;border-bottom:1px solid {LINE};vertical-align:top;line-height:1.4">{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<table style="border-collapse:collapse;width:100%"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>'

def star(t):
    return f'<span style="color:{AMBER};font-weight:700">★ {t}</span>'

FIVE = [("为谁", "小餐馆店长"), ("解决什么", "排班 2 小时且常漏人"), ("怎么算成功", "≤10 分钟 · 漏班 0"), ("不做什么", "考勤 · 工资 · 多门店"), ("先做", "S01 录入可用时段")]
five_row = ''.join(
    f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:11px;color:{SUB};font-weight:700">{k}</span>'
    f'<span style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{v}</span></div>' for k, v in FIVE)
five_band = (f'<div style="display:grid;grid-template-columns:.9fr 1.4fr 1.2fr 1.2fr 1.3fr;gap:12px;background:{AMBER_SOFT};border:1px solid {AMBER};border-radius:12px;padding:10px 16px">'
             f'{five_row}</div>')

doc = (
    f'<div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:20px;font-weight:800">排班工具 · 产品定义</span>'
    f'<span style="font-family:{MONO};font-size:12px;color:{SUB}">v0.1 · 2026-09-08</span><span style="margin-left:auto;font-size:12px;color:{SUB}">范例骨架：design/workbench/产品定义.md</span></div>'
    + sec("一句话", f'<div style="font-size:14.5px;line-height:1.6">让店长在手机上 10 分钟排好一周班，换班不用打电话。</div>')
    + sec("用户", table(["角色", "要什么", "成功的样子"], [
        ["店长", "10 分钟排完；有人请假能立刻补", "周一早上排完，不再改"],
        ["员工", "看自己的班；一键申请换班", "换班 5 分钟内有回复"],
        ["老板", "人力成本别超", "每周看到工时汇总"]]))
    + sec("已建议的决定", f'<div style="display:flex;gap:8px;flex-wrap:wrap">'
          f'<span style="display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:8px;background:{WHITE};border:1px solid {LINE};font-size:12.5px">{star("只做微信小程序")}<span style="color:{SUB};margin-left:6px">店长不开电脑</span></span>'
          f'<span style="display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:8px;background:{WHITE};border:1px solid {LINE};font-size:12.5px">{star("排班先用规则，不上 AI")}<span style="color:{SUB};margin-left:6px">规则可解释，先验证 H3</span></span></div>')
    + sec("核心场景 · 故事逐一覆盖", f'<div style="font-size:13px;line-height:1.7">1 录入员工与可用时段 → S01 · 2 一键生成周班表 → S02、S03 · 3 请假与换班 → S04、S05 · 4 工时汇总 → S06、S07</div>')
    + sec("非目标", f'<div style="font-size:13px;line-height:1.7">考勤打卡 · 工资计算 · 多门店 · 排班算法优化（先规则）</div>')
    + sec("假设与验证", table(["编号", "假设", "怎么验", "验不过怎么办"], [
        [f'<span style="font-family:{MONO};font-weight:700;color:{AMBER}">H1</span>', "店长愿意在手机上排班", "访谈 3 家店，2 家以上说愿意", "改桌面网页版"],
        [f'<span style="font-family:{MONO};font-weight:700;color:{AMBER}">H2</span>', "员工可用时段两周内改动 ≤2 次", "一家店记录 2 周", "加每日确认"],
        [f'<span style="font-family:{MONO};font-weight:700;color:{AMBER}">H3</span>', "规则排班能覆盖 80% 情况", "一家店跑 4 周，人工改动 ≤20%", "上 AI 建议"],
        [f'<span style="font-family:{MONO};font-weight:700;color:{AMBER}">H4</span>', "错误代价：中（漏班当天补人）", "推断，店长可上调", "按高处理，加对抗审查"]]))
    + sec("待拍板（≤6，每条 ★）", f'<div style="font-size:13px;line-height:1.6">1 小程序还是 H5 → {star("小程序")}　·　2 换班要不要店长批 → {star("要，人审")}　·　成功指标见五问首行：≤10 分钟 · 漏班 0 · 换班响应 ≤5 分钟</div>'))

review_strip = (
    f'<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:8px">'
    + tile("✓", "老板 · 五问可答", OK) + tile("✓", "搭建者 · S01 可开工", OK) + tile("✓", "执行者 · 停在店长批", OK) + tile("H3", "反方 · 最先垮，已写验法", AMBER)
    + '</div>')

main_col = (
    f'<main style="display:flex;flex-direction:column;min-width:0;background:{CHATBG}">'
    f'<div style="display:flex;align-items:center;gap:6px;padding:12px 26px 0">{tab("产品定义", True)}{tab("故事", False, "7")}{tab("SPEC", False, "可选")}'
    f'<span style="margin-left:auto;font-size:12px;color:{SUB}">四视角找茬已过 · 说编号（H 号 / 故事号）就能改</span></div>'
    f'<div style="flex-grow:1;min-height:0;padding:14px 26px 18px;display:flex;flex-direction:column;gap:14px;overflow:hidden">'
    f'{five_band}'
    f'<div style="background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:14px 22px;display:flex;flex-direction:column;gap:7px;overflow:hidden;flex-grow:1;min-height:0">{doc}</div>'
    f'{review_strip}</div></main>')

# 右栏：泳道图（三条道：店长 / 员工 / 系统）——从同一份 flow JSON 渲染，本环境有画布 → 高保真档
def nd(x, y, w, label, kind="auto", flag=None):
    bd = {"auto": LINE, "human": AMBER, "data": LINE}[kind]
    bg = {"auto": WHITE, "human": WHITE, "data": "#f5f2ec"}[kind]
    f = ''
    if flag == "block":
        f = f'<span style="position:absolute;right:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:{HI}"></span>'
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:30px;border:1.5px solid {bd};background:{bg};border-radius:8px;'
            f'font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:600;color:{INK}">{label}{f}</div>')

lanes = ''.join(
    f'<div style="position:absolute;left:0;top:{y}px;width:100%;height:56px;border-top:1px dashed {LINE}"><span style="position:absolute;left:6px;top:4px;font-size:10px;color:{SUB};font-weight:700">{name}</span></div>'
    for name, y in [("系统 · 自动", 0), ("店长 · 人审 / 人定", 56), ("员工", 112)])
arrows = (f'<svg style="position:absolute;left:0;top:0" width="440" height="168" viewBox="0 0 440 168">'
          f'<defs><marker id="dm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#9aa4af"></path></marker></defs>'
          f'<g fill="none" stroke="#9aa4af" stroke-width="1.4" marker-end="url(#dm)">'
          f'<path d="M108 128V100H181V46"></path><path d="M181 44V62H238V78"></path><path d="M262 80V62H268V46"></path><path d="M300 29H328"></path><path d="M224 128V118H238V112"></path><path d="M324 128V118H336V112"></path><path d="M336 80V62H290V46"></path></g></svg>')
diagram = (f'<div style="position:relative;height:160px;background:{CHATBG};border:1px solid {LINE};border-radius:10px;overflow:hidden">{lanes}{arrows}'
           + nd(150, 14, 62, "生成班表") + nd(236, 14, 64, "发布通知") + nd(330, 14, 84, "工时汇总", "auto")
           + nd(200, 80, 76, "店长确认", "human") + nd(300, 80, 72, "换班审批", "human", "block")
           + nd(60, 128, 96, "录入可用时段", "human") + nd(200, 128, 48, "请假", "human") + nd(300, 128, 48, "换班", "human")
           + '</div>')
right_body = (
    f'<div style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700;font-size:13.5px">泳道流程图</span>'
    f'<span style="font-size:11px;background:{AMBER_SOFT};color:{AMBER};border-radius:5px;padding:2px 7px;font-weight:700">高保真档</span>'
    f'<span style="margin-left:auto;font-size:11.5px;color:{SUB}">自动 3 · 人 5 · 卡点 1</span></div>{diagram}'
    f'<div style="font-size:11.5px;color:{SUB};line-height:1.5">H5 图按高保真档，依据：本环境有画布；普通对话窗口给泳道表 + Mermaid。卡点：换班全靠电话 → 申请进系统，店长只审。</div></div>'
    + f'<div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:{SUB};padding-bottom:6px">{ico("flag",16,SUB)}<span>生效假设</span><span style="font-weight:500">不符请指出编号</span></div>'
    + assumption("H1", "店长愿意在手机上排班", "原话「店长不开电脑」")
    + assumption("H3", "规则排班覆盖 80% 情况", "小店班次固定 · 待验")
    + '</div>'
    + f'<div style="background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:12px 16px;display:flex;flex-direction:column;gap:10px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:800;font-size:13.5px">可选纠错</span><span style="font-size:12px;color:{SUB}">不回复即按 ★ 生效</span></div>'
    + question("Q1 深度", [option("产品定义 + 故事", "已采用：先验证方向", True), option("加 SPEC 骨架"), option("只要故事")])
    + question("Q2 先做哪条", [option("S01 录入与生成", "已采用：原话痛点", True), option("S04 换班"), option("其他（一句话说明）")])
    + '</div>')

design_actions = (f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:8px;background:{AMBER};color:#ffffff;font-size:13px;font-weight:700">{ico("bolt",16,"#ffffff")}按这个建</span>')
DESIGN = HEAD + frame(COLS3,
    sidebar("dog", design_active=True) + topbar("设计 · 小餐馆排班工具", chips=("五问 5/5", "故事 7 · 0 通过", "H 假设 5"), right=design_actions) +
    main_col +
    right_col(right_head("图 · 假设 · 纠错", None, f'<span style="margin-left:auto;font-size:12px;color:{SUB}">复用 07 画布只读态</span>'), right_body)) + TAIL
