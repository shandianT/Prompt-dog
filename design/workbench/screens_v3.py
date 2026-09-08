# -*- coding: utf-8 -*-
"""08 汇报模式 / 09 组件详情 / 10 复盘与回归 —— SPEC §5 里已列规格但还没画的三屏。
08 的泳道图直接从 flow.py 的 NODES / EDGES 渲染，与 07 同一份数据。示例数字均为演示值。"""
from gen import (ico, sidebar, topbar, right_head, right_col, frame, tile, stat, tree_row,
                 HEAD, TAIL, COLS2, COLS3, AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE,
                 OK, HI, MID, LO, FIXBG, QUOTEBG, MONO)
import flow

# ===================================================================== 08 汇报模式
NW, NH = 140, 58
XS = {20: 12, 190: 172, 360: 332, 530: 492, 700: 652, 870: 812, 1040: 972}
YS = {60: 38, 120: 100, 200: 162, 500: 290, 620: 356, 780: 472}
LANES = [("AI · 自动", 0, 240), ("人 · 人审 / 人定", 252, 172), ("数据与系统", 436, 112)]
KCOL = {"human": AMBER, "dog": AMBER, "skill": LO, "know": OK, "data": "#94a3b8"}
FCOL = {"block": HI, "missing": AMBER, "pending": LO}
ECOL = {"seq": "#9aa4af", "data": "#64748b", "pending": LO, "loop": OK, "back": HI}

def _x(v):
    return XS.get(v, round(12 + (v - 20) * 160 / 170))

def _y(v):
    if v in YS:
        return YS[v]
    if v < 440:
        return round(38 + (v - 60) * 0.62)
    if v < 720:
        return round(290 + (v - 500) * 0.97)
    return 472

def _pos(n):
    return _x(n["x"]), _y(n["y"])

def _node(n):
    x, y = _pos(n)
    hum = n["kind"] in ("human",)
    bd = AMBER if hum else (LINE if n["kind"] != "data" else "#d8d2c6")
    bw = "1.5px" if hum else "1px"
    bg = "#f5f2ec" if n["kind"] == "data" else WHITE
    flag = ''
    if n["flag"] in FCOL:
        c = FCOL[n["flag"]]
        lbl = {"block": "卡点", "missing": "缺口", "pending": "待打通"}[n["flag"]]
        flag = (f'<span style="position:absolute;right:-5px;top:-9px;height:17px;padding:0 6px;border-radius:5px;'
                f'background:{c};color:#ffffff;font-size:9.5px;font-weight:700;display:flex;align-items:center">{lbl}</span>')
    role = ''
    if n.get("role") in ("review", "decide"):
        t = "人审" if n["role"] == "review" else "人定"
        role = (f'<span style="position:absolute;left:6px;bottom:-8px;height:16px;padding:0 6px;border-radius:4px;'
                f'background:{AMBER};color:#ffffff;font-size:9.5px;font-weight:700;display:flex;align-items:center">{t}</span>')
    dot = f'<span style="width:6px;height:6px;border-radius:50%;background:{KCOL[n["kind"]]};flex-shrink:0"></span>'
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{NW}px;height:{NH}px;border:{bw} solid {bd};'
            f'background:{bg};border-radius:9px;padding:7px 9px;display:flex;flex-direction:column;gap:2px;justify-content:center">'
            f'<div style="display:flex;align-items:center;gap:5px;min-width:0">{dot}'
            f'<span style="font-size:11.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{n["name"]}</span></div>'
            f'<span style="font-size:9.5px;color:{SUB};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{n["sub"]}</span>'
            f'{flag}{role}</div>')

def _path(e, byid):
    a, b = byid[e["from"]], byid[e["to"]]
    ax, ay = _pos(a); bx, by = _pos(b)
    sx, sy = ax + NW, ay + NH / 2
    tx, ty = bx, by + NH / 2
    if e["kind"] == "back":
        return f'M{ax + NW / 2} {ay}C{ax + NW / 2} {ay - 34},{bx + NW / 2} {by - 34},{bx + NW / 2} {by}'
    if e["kind"] == "loop":
        return f'M{ax + NW / 2} {ay + NH}C{ax + NW / 2} {ay + 250},{bx + NW / 2} {by + 96},{bx + NW / 2} {by + NH}'
    if bx <= ax:
        return f'M{ax + NW / 2} {ay + NH}C{ax + NW / 2} {ay + NH + 26},{bx + NW / 2} {by - 26},{bx + NW / 2} {by}'
    d = max(28, (tx - sx) * 0.55)
    return f'M{sx} {sy}C{sx + d} {sy},{tx - d} {ty},{tx} {ty}'

byid = {n["id"]: n for n in flow.NODES}
marks = ''.join(
    f'<marker id="rm-{k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">'
    f'<path d="M0 0L10 5L0 10z" fill="{c}"></path></marker>' for k, c in ECOL.items())
DASH = 'stroke-dasharray="5 4"'
def _epath(e):
    d = DASH if e["kind"] in ("pending", "loop", "back") else ""
    return (f'<path d="{_path(e, byid)}" fill="none" stroke="{ECOL[e["kind"]]}" stroke-width="1.5" '
            f'{d} marker-end="url(#rm-{e["kind"]})"></path>')
paths = ''.join(_epath(e) for e in flow.EDGE_OBJS)
lane_bg = ''.join(
    f'<div style="position:absolute;left:0;top:{y}px;width:100%;height:{h}px;border-radius:10px;background:{WHITE};border:1px solid {LINE}">'
    f'<span style="position:absolute;left:11px;top:8px;font-size:10.5px;font-weight:700;color:{SUB};letter-spacing:.04em">{name}</span></div>'
    for name, y, h in LANES)
diagram = (f'<div style="position:relative;height:548px;flex-shrink:0">{lane_bg}'
           f'<svg style="position:absolute;left:0;top:0;overflow:visible" width="1140" height="548"><defs>{marks}</defs>{paths}</svg>'
           + ''.join(_node(n) for n in flow.NODES) + '</div>')

def _num(v, k, c=INK):
    return (f'<div style="display:flex;flex-direction:column;gap:1px;padding:0 22px 0 0;border-right:1px solid {LINE}">'
            f'<span style="font-size:30px;font-weight:800;line-height:1;color:{c}">{v}</span>'
            f'<span style="font-size:12px;color:{SUB}">{k}</span></div>')
five = (f'<div style="display:flex;gap:22px;align-items:center">'
        + _num("7", "自动") + _num("7", "人") + _num("2", "卡点", HI) + _num("1", "缺口", AMBER)
        + f'<div style="display:flex;flex-direction:column;gap:1px"><span style="font-size:30px;font-weight:800;line-height:1;color:{LO}">4</span>'
        f'<span style="font-size:12px;color:{SUB}">待打通</span></div></div>')
def _fix(c, t, d):
    return (f'<div style="flex:1;min-width:0;border:1px solid {LINE};border-left:3px solid {c};border-radius:9px;padding:9px 13px;'
            f'display:flex;flex-direction:column;gap:2px"><span style="font-size:12.5px;font-weight:700">{t}</span>'
            f'<span style="font-size:12px;color:{SUB};line-height:1.5">{d}</span></div>')
report_main = (
    f'<main style="min-width:0;overflow:hidden;padding:22px 30px 20px;display:flex;flex-direction:column;gap:16px;background:{CHATBG}">'
    f'<div style="display:flex;align-items:flex-end;gap:26px">'
    f'<div style="display:flex;flex-direction:column;gap:5px;min-width:0">'
    f'<span style="font-size:12px;font-weight:800;letter-spacing:.08em;color:{AMBER}">本质</span>'
    f'<span style="font-size:23px;font-weight:800;letter-spacing:-.01em">{flow.ESSENCE}</span></div>'
    f'<div style="margin-left:auto">{five}</div></div>'
    f'{diagram}'
    f'<div style="display:flex;gap:12px">'
    + _fix(HI, "卡点 · 获取招标文件", "商务每天刷平台，常漏标。打通招标平台后改关键词监控自动拉取，这一步从人定变自动。")
    + _fix(HI, "卡点 · 报价", "等财务出成本，整条流程常卡两天。接 ERP 成本口径后先自动出报价框架，人只定折扣。")
    + _fix(AMBER, "缺口 · 素材库", "历史业绩缺扫描件、人员证书没入库。补齐后每次投标回填，命中率越用越高。")
    + '</div></main>')
report_right = (f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {LINE};background:{WHITE};color:{SUB};font-size:13px;font-weight:600;white-space:nowrap">{ico("download",16,SUB)}导出 PNG / PDF</span>'
                f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:8px;background:{AMBER};color:#ffffff;font-size:13px;font-weight:700">{ico("bolt",16,"#ffffff",2)}先打通招标平台</span>')
REPORT = HEAD + frame(COLS2, sidebar(flow_active=True) +
    topbar("投标流程 · 汇报模式", chips=("只读", "19 个节点 · 23 条线", "示例数据"), right=report_right) + report_main) + TAIL

# ===================================================================== 09 组件详情
def _row(k, v, mono=False):
    f = f'font-family:{MONO};' if mono else ''
    return (f'<div style="display:flex;gap:14px;align-items:baseline;padding:7px 0;border-top:1px solid {LINE};font-size:13px">'
            f'<span style="width:92px;flex-shrink:0;color:{SUB};font-size:12px">{k}</span>'
            f'<span style="{f}line-height:1.5;min-width:0">{v}</span></div>')
def _pill(t, c=SUB, bg=CHATBG):
    return (f'<span style="display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:6px;'
            f'background:{bg};border:1px solid {LINE};font-size:11.5px;color:{c};white-space:nowrap">{t}</span>')
STEPS7 = ["文件解析", "事实提取", "风险扫描", "法律核查", "条款建议", "对抗审查", "交付生成"]
chain = ('<div style="position:relative;display:grid;grid-template-columns:repeat(7, minmax(0, 1fr));gap:6px">'
         + f'<div style="position:absolute;left:8px;right:8px;top:26px;height:1px;background:{LINE}"></div>'
         + ''.join(
    f'<div style="position:relative;border:1px solid {LINE};background:{WHITE};border-radius:8px;padding:6px 4px;'
    f'display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0">'
    f'<span style="font-size:11.5px;font-weight:800;color:{AMBER};line-height:1">{i+1}</span>'
    f'<span style="font-size:10.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">{t}</span>'
    f'<span style="font-size:9.5px;color:{SUB};white-space:nowrap">验收 {3 if i == 2 else 2}</span></div>'
    for i, t in enumerate(STEPS7)) + '</div>')
used = ''.join(
    f'<div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-top:1px solid {LINE};font-size:13px">'
    f'{ico("flow",16,AMBER)}<span style="font-weight:600">{a}</span>'
    f'<span style="font-family:{MONO};font-size:11.5px;color:{SUB}">节点 {b}</span>'
    f'<span style="margin-left:auto;font-size:12px;color:{SUB}">{c}</span></div>'
    for a, b, c in [("投标流程", "n8", "审招标文件里的合同条款"), ("合同管理流程", "c3", "新签合同初审")])
vers = ''.join(
    f'<div style="display:flex;gap:12px;align-items:baseline;padding:7px 0;border-top:1px solid {LINE};font-size:12.5px">'
    f'<span style="font-family:{MONO};font-weight:700;color:{AMBER};flex-shrink:0">{v}</span>'
    f'<span style="color:{SUB};font-size:11.5px;flex-shrink:0;width:74px">{d}</span>'
    f'<span style="line-height:1.5">{t}</span></div>'
    for v, d, t in [("v1.2", "2026-09-07", "立场缺省按委托方推断；落盘不再等确认；单人设版去掉每阶段等「继续」"),
                    ("v1.1", "2026-08-12", "环节 4 增加来源记录，法条链接必须可追溯"),
                    ("v1.0", "2026-07-24", "初版：七环节，三件套交付")])
cd_main = (
    f'<main style="min-width:0;overflow:hidden;padding:26px 32px;display:flex;flex-direction:column;gap:18px">'
    f'<div style="display:flex;gap:14px;align-items:center">'
    f'<span style="width:52px;height:52px;border-radius:12px;background:{AMBER_SOFT};display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">⚖️</span>'
    f'<div style="display:flex;flex-direction:column;gap:3px;min-width:0">'
    f'<div style="display:flex;align-items:center;gap:9px"><span style="font-size:22px;font-weight:800">合同审查</span>'
    f'{_pill("工作狗", AMBER, AMBER_SOFT)}{_pill("v1.2", SUB)}{_pill("用于 2 条流程", SUB)}</div>'
    f'<span style="font-size:13.5px;color:{SUB}">七环节初审，三件套交付：风险审查报告 + 原文逐条批注 + 结构化风险清单</span></div>'
    f'<div style="margin-left:auto;display:flex;gap:8px">'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {LINE};font-size:13px;color:{SUB};font-weight:600;white-space:nowrap">{ico("edit",15,SUB)}编辑</span>'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:8px;background:{AMBER};color:#ffffff;font-size:13px;font-weight:700;white-space:nowrap">{ico("flow",15,"#ffffff",2)}在画布中查看</span></div></div>'
    f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 26px">'
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:3px">契约</div>'
    + _row("输入", "合同 PDF / DOCX（<span style=\"font-family:%s\">file</span>）＋ 立场 ＋ 委托方" % MONO)
    + _row("输出", "报告 md ＋ 批注 md ＋ 风险清单 json（<span style=\"font-family:%s\">struct</span>），落盘 输出/" % MONO)
    + _row("失败回退", "环节 4 无搜索工具时降级为 [待核实] ＋ 人工核对清单")
    + '</div>'
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:3px">参数</div>'
    + _row("立场", "甲方风险优先 ★ / 乙方 / 中立")
    + _row("错误代价", "高（对外交付、供决策）→ 装对抗审查 ＋ 来源强制")
    + _row("人工确认点", "仅「交付生成」前，对外发送才停")
    + '</div></div>'
    f'<div style="display:flex;flex-direction:column;gap:8px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">子流程 · 7 环节</span>'
    f'<span style="font-size:12px;color:{SUB}">双击画布上的节点即钻取到这里</span></div>'
    f'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">{chain}</div></div>'
    f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 26px">'
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:3px">复用于</div>{used}</div>'
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:3px">版本与改动</div>{vers}</div>'
    f'</div></main>')
cd_right = (
    f'<div style="border:1px solid {LINE};border-radius:12px;padding:12px 15px;display:flex;flex-direction:column;gap:8px">'
    f'<div style="display:flex;align-items:center;gap:7px"><span style="font-size:12px;font-weight:800;color:{SUB};letter-spacing:.06em">改一处，全局同步</span></div>'
    f'<div style="font-size:12.5px;line-height:1.65;color:{INK}">这只狗被 2 条流程引用。改它的环节提示词，两条流程下次运行都会用新版。是否需要审批仍<b>待拍板</b>；★ 建议不设审批，回归测试当门槛。</div></div>'
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">发布前必过</div>'
    + ''.join(f'<div style="display:flex;gap:9px;align-items:flex-start;padding:7px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5">'
              f'{ico("check",15,OK,2.2)}<span>{t}</span></div>' for t in
              ["回归测试：2 份历史合同重跑，漏审 0", "每环节 ≥1 条按类型必带的验收项", "引用法条附可追溯来源", "人工确认点只在交付生成前"])
    + '</div>'
    f'<div style="background:{FIXBG};border:1px solid {OK};border-radius:12px;padding:11px 14px;font-size:12.5px;line-height:1.6">'
    f'<b style="color:{OK}">v1.2 回归达标</b>　2 / 2 通过，日常在用。<br><span style="color:{AMBER};font-weight:700">v1.3 候选</span> 正在回归中，未过门槛前不发布——见 10 复盘与回归。</div>')
COMPONENT_DETAIL = HEAD + frame(COLS3, sidebar(kennel_active=True) +
    topbar("组件库 · 合同审查", chips=("工作狗", "7 环节", "v1.2 已发布", "示例数据")) + cd_main +
    right_col(right_head("资产状态"), cd_right)) + TAIL

# ===================================================================== 10 复盘与回归
def _metric(k, v, base, note):
    a, b = int(v), int(base)
    if a == b:
        c, delta = (OK if a == 0 else SUB), f"持平 上期 {base}"
    elif a < b:
        c, delta = OK, f"↓ 上期 {base}"
    else:
        c, delta = HI, f"↑ 上期 {base}"
    return (f'<div style="border:1px solid {LINE};border-radius:11px;padding:12px 15px;display:flex;flex-direction:column;gap:5px">'
            f'<span style="font-size:12px;color:{SUB}">{k}</span>'
            f'<div style="display:flex;align-items:baseline;gap:7px"><span style="font-size:26px;font-weight:800;line-height:1;color:{c}">{v}</span>'
            f'<span style="font-size:12px;color:{c};font-weight:700;white-space:nowrap">{delta}</span></div>'
            f'<span style="font-size:11.5px;color:{SUB};line-height:1.5">{note}</span></div>')
def _reg(name, exp, got, ok):
    ic = ico("check", 15, OK, 2.2) if ok else ico("warn", 15, HI, 1.9)
    return (f'<tr><td style="font-size:12.5px;padding:8px 10px 8px 0;border-bottom:1px solid {LINE}">{name}</td>'
            f'<td style="font-size:12.5px;padding:8px 10px;border-bottom:1px solid {LINE};color:{SUB}">{exp}</td>'
            f'<td style="font-size:12.5px;padding:8px 10px;border-bottom:1px solid {LINE}">{got}</td>'
            f'<td style="padding:8px 0;border-bottom:1px solid {LINE};text-align:right">{ic}</td></tr>')
retro_main = (
    f'<main style="min-width:0;overflow:hidden;padding:26px 32px;display:flex;flex-direction:column;gap:18px">'
    f'<div style="display:flex;align-items:flex-end;gap:14px"><div style="display:flex;flex-direction:column;gap:4px">'
    f'<span style="font-size:23px;font-weight:800;letter-spacing:-.01em">复盘与回归 · 合同审查</span>'
    f'<span style="font-size:13.5px;color:{SUB}">对照期内 输出/ 的审查结果与律师人工修改稿填写；改版必须先过回归。</span></div>'
    f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;border-radius:8px;'
    f'background:#fff1f2;border:1px solid {HI};color:{HI};font-size:12.5px;font-weight:700;white-space:nowrap">{ico("warn",15,HI,1.9)}不达标 · 1 项待修，暂不发布</span></div>'
    f'<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:12px">'
    + _metric("漏审", "1", "2", "示例：§9.3 验收期限风险未报，律师人工补")
    + _metric("误报", "3", "1", "违约金条款连报 3 次，实际是行业惯例")
    + _metric("定位失败", "0", "0", "风险点与原文位置全部对得上")
    + _metric("虚构来源", "0", "0", "法条链接逐条可追溯")
    + '</div>'
    f'<div style="display:flex;flex-direction:column;gap:8px">'
    f'<div style="display:flex;align-items:center;gap:9px"><span style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">回归对照 · 2 份历史样本</span>'
    f'<span style="font-size:12px;color:{SUB}">改 prompts/ 后必跑；漏检废标项或漏审高风险 = 不许发布</span></div>'
    f'<table style="border-collapse:collapse;width:100%"><thead><tr>'
    + ''.join(f'<th style="text-align:left;font-size:11.5px;color:{SUB};font-weight:600;padding:0 10px 6px 0;border-bottom:1px solid {LINE}">{h}</th>'
              for h in ["历史样本", "预期", "本次结果", ""])
    + '</tr></thead><tbody>'
    + _reg("设备采购合同 2025-11", "高风险 2 · 中 3", "高风险 2 · 中 3", True)
    + _reg("技术服务合同 2026-03", "高风险 1 · 中 2", "高风险 1 · 中 4（多报 2 条违约金）", False)
    + '</tbody></table></div>'
    f'<div style="display:flex;gap:12px">'
    f'<div style="flex:1;border:1px solid {LINE};border-left:3px solid {AMBER};border-radius:10px;padding:11px 14px;display:flex;flex-direction:column;gap:3px">'
    f'<span style="font-size:12.5px;font-weight:700">提示词修改建议</span>'
    f'<span style="font-size:12px;color:{SUB};line-height:1.6">环节 3 风险扫描：违约金比例在行业惯例区间内的不单独成条，并入「商务条款提示」。改完重跑回归。</span></div>'
    f'<div style="flex:1;border:1px solid {LINE};border-left:3px solid {OK};border-radius:10px;padding:11px 14px;display:flex;flex-direction:column;gap:3px">'
    f'<span style="font-size:12.5px;font-weight:700">回填素材库</span>'
    f'<span style="font-size:12px;color:{SUB};line-height:1.6">新风险类型「验收期限未约定」→ 加入环节 3 检查清单第 6 类。</span></div></div>'
    f'<div style="display:flex;flex-direction:column;gap:8px">'
    f'<div style="display:flex;align-items:center;gap:9px"><span style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">发布门槛 · 4 / 6 通过</span>'
    f'<span style="font-size:12px;color:{HI};font-weight:600">两项未过，改完提示词重跑回归才能发 v1.3</span></div>'
    f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:0 26px">'
    + ''.join(
        (lambda ok: f'<div style="display:flex;gap:9px;align-items:flex-start;padding:8px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5">'
                    f'{ico("check",15,OK,2.2) if ok else ico("warn",15,HI,1.9)}'
                    f'<span style="{"" if ok else f"color:{HI};font-weight:600"}">{t}</span></div>')(o)
        for t, o in [("回归 2 / 2 通过", False), ("定位失败 = 0", True),
                     ("漏审 = 0", False), ("每环节 ≥1 条按类型必带验收项", True),
                     ("虚构来源 = 0", True), ("人工确认点只在不可逆动作前", True)])
    + '</div></div></main>')
retro_right = (
    f'<div style="border:1.5px solid {AMBER};background:{AMBER_SOFT};border-radius:12px;padding:12px 15px;display:flex;flex-direction:column;gap:7px">'
    f'<div style="display:flex;align-items:center;gap:7px">{ico("refresh",16,AMBER)}<span style="font-size:12.5px;font-weight:800;color:{AMBER}">回流建议 · 等你改版时确认</span></div>'
    f'<div style="font-size:12.5px;line-height:1.65">「引用法条附可追溯来源」这条验收项已在<b>合同审查</b>与<b>标书撰写</b>两只狗上出现，满足「同一规律出现 2 次」的触发条件。</div>'
    f'<div style="display:flex;gap:7px;align-items:center;padding-top:2px">'
    f'<span style="display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:7px;background:{AMBER};color:#ffffff;font-size:12.5px;font-weight:700">抬升为必带验收项</span>'
    f'<span style="display:inline-flex;align-items:center;height:30px;padding:0 11px;border-radius:7px;border:1px solid {LINE};background:{WHITE};font-size:12.5px;color:{SUB}">暂不</span></div></div>'
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">已知规律 · 3 / 10</div>'
    + ''.join(f'<div style="display:flex;gap:9px;align-items:flex-start;padding:8px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5">'
              f'<span style="color:{AMBER};font-weight:700;flex-shrink:0;font-family:{MONO}">{i+1}</span><span>{t}</span></div>'
              for i, t in enumerate([
                  "违约金条款先查行业惯例区间，再判是否成风险",
                  "扫描件合同必须先过 OCR，否则条款定位会偏一整页",
                  "「合同未约定」与「约定不利」要分开报，律师看的是两回事"]))
    + f'<div style="font-size:11.5px;color:{SUB};padding-top:8px;line-height:1.6">满 10 条时合并；改版时抬升进 AGENTS.md 的「已知规律」，日志顶部清空重新累积。</div></div>'
    f'<div style="margin-top:auto;border:1px solid {LINE};border-radius:12px;padding:11px 14px;font-size:12px;color:{SUB};line-height:1.6">'
    f'数据来自这只狗自己的 <span style="font-family:{MONO}">复盘/日志.md</span> 与 <span style="font-family:{MONO}">验收清单.json</span>，不经过任何服务端。</div>')
RETRO = HEAD + frame(COLS3, sidebar(kennel_active=True) +
    topbar("复盘与回归 · 合同审查", chips=("对照期 2026-08", "候选 v1.3", "回归 1 / 2", "示例数据")) + retro_main +
    right_col(right_head("回流与规律"), retro_right)) + TAIL
