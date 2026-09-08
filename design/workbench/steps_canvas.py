# -*- coding: utf-8 -*-
"""07 流程画布的五个静态状态：07.0 空态 / 07.2 拖拽反馈 / 07.3 构建预览 / 07.4 对照现状 / 07.5 运行态。
与 07 可交互画板同一份 NODES / EDGES、同一套 CSS（flow.NODE_CSS + flow.CANVAS_CSS），只是把某个瞬间定格成 1440 × 900，
便于逐步看。示例数据均为演示值。"""
import copy
import flow
from gen import (ico, sidebar, topbar, HEAD, TAIL, AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, LO, MONO)

NW, NH, CW, CH = flow.NW, flow.NH, flow.CW, flow.CH
SCALE = 0.72
KIND = {"human": "人", "dog": "🐾 工作狗", "skill": "技能", "know": "know-how", "data": "数据 / 系统"}
ROLE = {"auto": "自动", "review": "人审", "decide": "人定"}
FLAG = {"block": "卡点", "missing": "缺口", "pending": "待打通"}
OT = {"human": "decision", "dog": "struct", "skill": "struct", "know": "text", "data": "sys"}

EXTRA_CSS = r'''
    .fc .main.two { grid-template-columns: minmax(0, 1fr) 292px; }
    .fc .cwrap { overflow: hidden; }
    .fc .rb { position: absolute; left: 8px; bottom: -10px; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; background: #ffffff; border: 1px solid #e5e8ee; color: #68707c; white-space: nowrap; }
    .fc .rb.ok { border-color: #16a34a; color: #16a34a; } .fc .rb.run { border-color: #d97706; color: #d97706; background: #fdf0dd; } .fc .rb.wait { border-color: #d97706; color: #d97706; }
    .fc .lock { position: absolute; right: 8px; bottom: -10px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: #1e232b; color: #ffffff; white-space: nowrap; }
    .fc .stoast { position: absolute; left: 50%; transform: translateX(-50%); background: #1e232b; color: #ffffff; padding: 10px 16px; border-radius: 10px; font-size: 13px; z-index: 60; max-width: 640px; text-align: center; box-shadow: 0 8px 24px rgba(30,35,43,.25); white-space: nowrap; }
    .fc .stoast .u { color: #f0c78a; font-weight: 700; margin-left: 10px; }
    .fc .stoast.deny { background: #fff1f2; color: #dc2626; border: 1px solid #dc2626; }
    .fc .mqlab { position: absolute; font-size: 11px; font-weight: 800; color: #d97706; background: #fdf0dd; border: 1px solid #d97706; border-radius: 5px; padding: 2px 8px; white-space: nowrap; }
    .fc .empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
    .fc .ecard { width: 236px; background: #ffffff; border: 1px solid #e5e8ee; border-radius: 14px; padding: 18px 18px 16px; display: flex; flex-direction: column; gap: 8px; }
    .fc .ecard.pri { border: 1.5px solid #d97706; box-shadow: 0 8px 28px rgba(217,119,6,.10); }
    .fc .ecard .ic { width: 40px; height: 40px; border-radius: 10px; background: #fdf0dd; display: flex; align-items: center; justify-content: center; }
    .fc .ecard b { font-size: 14.5px; } .fc .ecard p { margin: 0; font-size: 12.5px; color: #68707c; line-height: 1.6; }
    .fc .ecard .go { margin-top: 4px; display: inline-flex; align-items: center; height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid #e5e8ee; font-size: 12.5px; color: #68707c; align-self: flex-start; font-weight: 600; }
    .fc .ecard.pri .go { background: #d97706; color: #ffffff; border-color: #d97706; font-weight: 700; }
    .fc .tb-btn.off { opacity: .4; }
    .fc .runrow { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-top: 1px solid #e5e8ee; font-size: 12.5px; }
    .fc .runrow .n { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #68707c; font-size: 11.5px; width: 26px; flex-shrink: 0; }
    .fc .runrow .c { margin-left: auto; font-weight: 700; white-space: nowrap; }
    .fc .runrow .c.ok { color: #16a34a; } .fc .runrow .c.run { color: #d97706; } .fc .runrow .c.todo { color: #9aa4af; }
'''

def helmet():
    return flow.helmet(flow.NODE_CSS + flow.CANVAS_CSS + EXTRA_CSS)

# ---------------------------------------------------------------- 节点与连线（与 07 同一几何）
def node(n, sel=False, dim=False, running=False, diff=None, rb=None, lock=None):
    flag = n.get("flag", "ok")
    cls = f'node k-{n["kind"]} f-{flag}' + (' sel' if sel else '') + (' dim' if dim else '') + (' running' if running else '')
    fl = f'<span class="fl {flag}">{FLAG[flag]}</span>' if flag in FLAG else ''
    df = f'<span class="df {"new" if diff == "新增" else ""}">{diff}</span>' if diff else ''
    role = ''
    if n["kind"] != "data" and n.get("role"):
        role = f'<span class="rl {n["role"]}">{ROLE[n["role"]]}</span>'
    kids = ''
    if n.get("children"):
        kids = f'<span class="kids">{len(n["children"]["nodes"])} 环节 · 双击打开</span>'
    rbh = f'<span class="rb {rb[0]}">{rb[1]}</span>' if rb else ''
    lk = f'<span class="lock">{lock}</span>' if lock else ''
    it = 'sys' if n["kind"] == "data" else 'struct'
    return (f'<div class="nw" style="left: {n["x"]}px; top: {n["y"]}px"><div class="{cls}" data-id="{n["id"]}">'
            f'<span class="port in t-{it}"></span>{fl}{df}'
            f'<div class="nh"><span class="kd {n["kind"]}">{KIND[n["kind"]]}</span>{role}</div>'
            f'<div class="nn">{n["name"]}</div><div class="ns">{n["sub"]}</div>{kids}{rbh}{lk}'
            f'<span class="port out t-{OT[n["kind"]]}"></span></div></div>')

def edge_path(a, b, kind):
    ax, ay, bx, by = a["x"], a["y"], b["x"], b["y"]
    if kind == "loop":
        y1, xr, yb, x2, y2 = ay + NH / 2, CW - 12, CH - 22, bx + NW / 2, by + NH + 8
        return f'M {ax + NW} {y1} L {xr} {y1} L {xr} {yb} L {x2} {yb} L {x2} {y2}', (xr + x2) / 2, yb - 6
    if kind == "back":
        sx, tx = ax + NW / 2, bx + NW / 2; top = min(ay, by) - 64
        return f'M {sx} {ay} C {sx} {top}, {tx} {top}, {tx} {by}', (sx + tx) / 2, top + 18
    if abs(bx - ax) < 40:
        x, xb = ax + NW / 2, bx + NW / 2
        if by > ay:
            return f'M {x} {ay + NH} C {x} {ay + NH + 40}, {xb} {by - 40}, {xb} {by}', x + 4, (ay + NH + by) / 2 + 4
        return f'M {x} {ay} C {x} {ay - 40}, {xb} {by + NH + 40}, {xb} {by + NH}', x + 4, (ay + by + NH) / 2 + 4
    px1, py1, px2, py2 = ax + NW, ay + NH / 2, bx, by + NH / 2
    c = max(50, abs(px2 - px1) / 2)
    return f'M {px1} {py1} C {px1 + c} {py1}, {px2 - c} {py2}, {px2} {py2}', (px1 + px2) / 2, (py1 + py2) / 2 - 5

def edges_html(nodes, edges, labels=False, dim_ids=()):
    byid = {n["id"]: n for n in nodes}
    out = []
    for e in edges:
        a, b = byid.get(e["from"]), byid.get(e["to"])
        if not a or not b:
            continue
        d, lx, ly = edge_path(a, b, e["kind"])
        op = ' style="opacity:.35"' if (e["from"] in dim_ids and e["to"] in dim_ids) else ''
        lab = ''
        if labels and e.get("label"):
            lc = e["dtype"] if e["kind"] == "seq" else e["kind"]
            lab = f'<div class="elabh {lc}" style="left: {round(lx)}px; top: {round(ly)}px">{e["label"]}</div>'
        out.append(f'<div class="ew"{op}><svg class="esvg" viewBox="0 0 {CW} {CH}"><path class="edge {e["kind"]}" d="{d}"></path></svg>{lab}</div>')
    return ''.join(out)

def counts(nodes):
    autos = sum(1 for n in nodes if n["kind"] in ("dog", "skill", "know"))
    humans = sum(1 for n in nodes if n["kind"] == "human")
    f = lambda k: sum(1 for n in nodes if n.get("flag") == k)
    return autos, humans, f("block"), f("missing"), f("pending")

def stat(label, v, dot=None):
    d = f'<span class="dot {dot}"></span>' if dot else ''
    return f'<span class="stat">{d}{label} <b>{v}</b></span>'

def tb(label, icon, on=False, primary=False, off=False):
    cls = 'tb-btn' + (' on' if on else '') + (' primary' if primary else '') + (' off' if off else '')
    col = "#ffffff" if primary else SUB
    return f'<span class="{cls}">{ico(icon,15,col,2 if primary else 1.8)}{label}</span>'

def toolbar(nodes, diff_on=False, labels_on=False, run_on=False, build_on=False, off=False, block_text=None):
    a, h, b, m, p = counts(nodes)
    stats = (stat("自动", a) + stat("人", h) + stat("卡点", block_text or b, "block") + stat("缺口", m, "missing") + stat("待打通", p, "pending"))
    btns = (tb("撤销", "refresh", off=off) + tb("对照现状", "flag", on=diff_on, off=off) + tb("产物", "file", on=labels_on, off=off)
            + tb("运行态", "bolt", on=run_on, off=off) + tb("按这个建", "check", primary=True, off=off))
    return (f'<div style="display:flex;gap:6px;align-items:center">{stats}</div>'
            f'<div style="display:flex;gap:6px;align-items:center;margin-left:14px">{btns}</div>')

def canvas(nodes, edges, labels=False, extras='', over='', node_kw=None, dim_ids=()):
    """extras 放在缩放后的画布坐标里（框选框等）；over 放在 cwrap 里不缩放（提示条、标签）。"""
    node_kw = node_kw or {}
    body = (flow.lanes_html() + flow.DEFS_SVG + edges_html(nodes, edges, labels, dim_ids)
            + ''.join(node(n, dim=(n["id"] in dim_ids), **node_kw.get(n["id"], {})) for n in nodes))
    return (f'<div class="cwrap"><div class="canvas" style="transform: scale({SCALE}); margin: 10px 0 0 12px">{body}{extras}</div>{over}</div>')

def frame(title, chips, toolbar_html, main_html, ins_html):
    return (HEAD.replace('</helmet>', '</helmet>') if False else helmet()) + (
        f'<div class="fc" style="width:1440px;height:900px;display:grid;grid-template-columns:240px minmax(0, 1fr);grid-template-rows:56px minmax(0, 1fr);overflow:hidden;background:{CHATBG};color:{INK};position:relative">'
        + sidebar(flow_active=True)
        + topbar(title, chips=chips, right=toolbar_html)
        + f'<div class="main two">{main_html}<div class="ins">{ins_html}</div></div></div>') + TAIL

def ins_h(t, muted=''):
    m = f'<span class="muted">{muted}</span>' if muted else ''
    return f'<div class="ins-h"><b>{t}</b>{m}</div>'

def chips(items, cls=''):
    return '<div class="chips">' + ''.join(f'<span class="chip {cls}">{t}</span>' for t in items) + '</div>'

def sug_list(items):
    return '<ol class="sug">' + ''.join(f'<li>{t}</li>' for t in items) + '</ol>'

def seg(opts, on, on_cls=''):
    return '<div class="seg">' + ''.join(f'<span class="sb{" on " + on_cls if o == on else ""}">{o}</span>' for o in opts) + '</div>'

BASE = copy.deepcopy(flow.NODES)
EDGES = copy.deepcopy(flow.EDGE_OBJS)

def targeted():
    """所有建议都「应用」之后的目标态（对照现状 / 运行态的底图）。"""
    ns = copy.deepcopy(BASE)
    for n in ns:
        t = n.get("target")
        if not t:
            continue
        if t.get("role") and t["role"] != n.get("role") and n["kind"] == "human":
            n["was"] = "human"
        for k in ("kind", "role", "sub", "method"):
            if t.get(k): n[k] = t[k]
        n["flag"] = t.get("flag", "ok")
        if n["kind"] not in ("human", "data") and n["y"] > 440:
            n["y"] = 300
    es = copy.deepcopy(EDGES)
    ids = {n["id"]: n for n in ns}
    for e in es:
        if e["kind"] == "pending" and ids[e["from"]]["kind"] == "data" and ids[e["from"]]["flag"] == "ok":
            e["kind"] = "data"
    return ns, es

# ================================================================ 07.0 空态
empty_cards = (
    '<div class="empty"><div style="display:flex;flex-direction:column;gap:18px;align-items:center">'
    f'<div style="display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center"><span style="font-size:22px;font-weight:800">还没有流程图</span>'
    f'<span style="font-size:13.5px;color:{SUB};line-height:1.6;white-space:nowrap">先出图再纠错：三条泳道回答哪些自动、人在哪、卡在哪、缺什么、要打通什么。</span></div>'
    '<div style="display:flex;gap:16px">'
    f'<div class="ecard pri"><span class="ic">{ico("edit",20,AMBER,1.8)}</span><b>说一段流程</b><p>谁做什么、什么顺序、卡在哪、用哪些系统；顺手把流程文档、聊天记录拖进来</p><span class="go">去首页说（01）</span></div>'
    f'<div class="ecard"><span class="ic">{ico("file",20,AMBER,1.8)}</span><b>导入流程 JSON</b><p>技能在对话窗口里产出的 flow JSON（`flow.schema.json`）直接拖进来，节点、标记、诊断都在</p><span class="go">选择文件</span></div>'
    f'<div class="ecard"><span class="ic">{ico("book",20,AMBER,1.8)}</span><b>从行业模板开始</b><p>投标 · 合同管理 · 内容营销 · 竞品分析——按行业惯例出草稿，每个推断处标 H</p><span class="go">挑一个模板</span></div>'
    '</div></div></div>')
empty_ins = (ins_h("诊断", "还没有图") + '<div class="hint">出图后这里实时汇总卡点 / 缺口 / 待打通，每条写「怎么解」，点「应用」就变成打通后的样子。</div>'
             + ins_h("三条泳道", "图的语义") + sug_list(["AI 自动：工作狗 / 技能 / know-how 做的步骤", "人：人审（看一眼，可退回）与人定（不可逆前拍板）", "数据与系统：虚线 = 现在靠人搬数据"]))
CANVAS_EMPTY = frame("新流程 · 组织流程画布", (), toolbar([], off=True),
                     f'<div class="cwrap"><div class="canvas" style="transform: scale({SCALE}); margin: 10px 0 0 12px"></div>{empty_cards}</div>', empty_ins)

# ================================================================ 07.2 拖拽反馈
drag_nodes = copy.deepcopy(BASE)
for n in drag_nodes:
    if n["id"] == "n2":
        n.update(kind="skill", role="auto", flag="missing", sub="原：商务 · 待配组件", y=300)
drag_extras = (
    '<div class="stoast deny" style="bottom: 74px">「递交」是不可逆动作前的人定节点，不能改成自动——留在人泳道</div>'
    '<div class="stoast" style="bottom: 26px">「获取招标文件」标为要自动化：还缺一个组件来做它（缺口）<span class="u">撤销</span></div>')
drag_ins = (
    '<div class="ins-h"><span class="kd skill">技能</span><span class="muted">n2 · 刚从人泳道拖进来</span><span class="btn sm">关闭</span></div>'
    '<div><span class="lb">名称</span><div class="fi">获取招标文件</div></div>'
    '<div><span class="lb">说明</span><div class="fi">原：商务 · 待配组件</div></div>'
    '<div><span class="lb">谁来做</span>' + seg(["自动", "人审", "人定"], "自动") + '</div>'
    '<div><span class="lb">状态</span>' + seg(["正常", "卡点", "缺口", "待打通"], "缺口") + '</div>'
    '<div><span class="lb">怎么解</span><div class="fi ta">给这一步配一个组件：从组件库拖「联网检索」替换，或等招标平台打通后改关键词监控自动拉取。</div></div>'
    '<span class="btn amber">应用建议 · 变成打通后的样子</span>'
    '<div><span class="lb">输入</span>' + chips(["公告、招标文件"]) + '</div><div><span class="lb">输出</span>' + chips(["招标文件 PDF"]) + '</div>'
    '<div class="hint">拖过泳道边界 = 改「谁来做」：人的步骤进 AI 泳道会自动标缺口；AI 节点进人泳道改成人审；不可逆动作前的人定节点受保护。每一步可撤销。</div>'
    '<div class="ins-foot"><span class="btn danger">删除节点</span></div>')
CANVAS_DRAG = frame("投标流程 · 组织流程画布", ("拖拽纠错",), toolbar(drag_nodes),
                    canvas(drag_nodes, EDGES, node_kw={"n2": dict(sel=True), "n12": dict(lock="🔒 受保护")}, over=drag_extras), drag_ins)

# ================================================================ 07.3 构建预览
build_extras = '<div class="mq" style="left: 348px; top: 44px; width: 862px; height: 152px"></div>'
build_over = '<div class="mqlab" style="left: 268px; top: 30px">将打包 · 标书撰写 · 4 环节（楔子 ★）</div>' 
build_ins = (
    ins_h("构建预览", "按这个建会得到") 
    + '<div><span class="lb">环节（按顺序，来自 AI 泳道）</span>' + sug_list([
        '招标解析与废标项<span class="muted"> · 输出结构化解析，废标项置顶</span>', '评分拆解与应答矩阵<span class="muted"> · 每个评分点一行</span>',
        '分章撰写<span class="muted"> · 篇幅跟着分值走</span>', '合规自查与模拟评审<span class="muted"> · 只找扣分点</span>']) + '</div>'
    + '<div><span class="lb">工具清单（数据与系统）</span>' + chips(["招标平台 · 待打通", "素材库 · 缺口", "ERP 成本 · 待打通", "OA 审批 · 待打通"]) + '</div>'
    + '<div><span class="lb">人工确认点（人定）</span>' + chips(["n4 投不投", "n11 领导审批", "n12 递交 · 不可逆"]) + '</div>'
    + '<div><span class="lb">交付前必须解决</span>' + sug_list(['素材库缺口<span class="muted"> · 没有素材，分章撰写只能出框架并标【待补材料】</span>', '招标平台待打通<span class="muted"> · 打通前由商务手动把文件放进「招标文件/」</span>']) + '</div>'
    + '<div><span class="lb">打包建议 · 先建哪只</span>' + sug_list(['<b style="color:#d97706">★ 标书撰写</b>（楔子：卡点最多、复用最广）', '合同审查 · 已在犬舍，直接复用（n8）', '复盘回填 · 等第一次投标结束再建']) + '</div>'
    + '<div class="hint">缺口和卡点没解决也能建：会写进资产包的未达标清单。无人时取 ★ 那只，不会卡住。点「按这个建」进 02。</div>')
CANVAS_BUILD = frame("投标流程 · 组织流程画布", ("构建预览",), toolbar(BASE), canvas(BASE, EDGES, extras=build_extras, over=build_over), build_ins)

# ================================================================ 07.4 对照现状
diff_nodes, diff_edges = targeted()
WAS = {"human": "原：人做", "manual": "原：手工搬", "new": "新增"}
diff_kw, dim_ids = {}, []
for n in diff_nodes:
    w = n.get("was")
    if w in WAS:
        diff_kw[n["id"]] = dict(diff=WAS[w])
    else:
        dim_ids.append(n["id"])
diff_ins = (
    ins_h("对照现状", "变过的标出来，没变的压暗")
    + '<div class="dg">'
    + '<div class="dg-row"><div class="t"><span class="dot block"></span>卡点 2 → 0</div><div class="muted">获取招标文件：人定 → 自动（关键词监控）· 报价：人定 → 人审（ERP 成本 + 报价模板，人只定折扣）</div></div>'
    + '<div class="dg-row"><div class="t"><span class="dot missing"></span>缺口 1 → 0</div><div class="muted">素材库补齐业绩扫描件与人员证书，每次投标后回填</div></div>'
    + '<div class="dg-row"><div class="t"><span class="dot pending"></span>待打通 4 → 0</div><div class="muted">CRM / 招标平台 / ERP / OA 从手工搬改成接口，虚线变实线</div></div>'
    + '</div>'
    + '<div><span class="lb">变化汇总</span>' + sug_list(["6 步从人做变自动（原：人做）", "5 处数据从手工搬变接口（原：手工搬）", "1 步新增：复盘回填 → 素材库", "人的步骤 7 → 5；人定 5 → 4"]) + '</div>'
    + '<div class="hint">这一层不改图，只改标注。给老板看用 08 汇报模式；决定下一只建谁回到「按这个建」。</div>')
CANVAS_DIFF = frame("投标流程 · 组织流程画布", ("对照现状",), toolbar(diff_nodes, diff_on=True, block_text="0"),
                    canvas(diff_nodes, diff_edges, node_kw=diff_kw, dim_ids=dim_ids), diff_ins)

# ================================================================ 07.5 运行态
run_kw = {
    "n3": dict(rb=("ok", "✓ 2 / 2")), "n5": dict(rb=("ok", "✓ 3 / 3")), "n7": dict(rb=("run", "● 1 / 3 · 第 3 轮"), running=True),
    "n10": dict(rb=("", "0 / 2")), "n8": dict(rb=("ok", "✓ 15 / 15")), "n6": dict(rb=("ok", "✓ 2 / 2")), "n13": dict(rb=("", "未到")),
    "n1": dict(rb=("ok", "✓ 已录入")), "n2": dict(rb=("ok", "✓ 已下载")), "n4": dict(rb=("ok", "✓ 已定：投")), "n9": dict(rb=("wait", "等财务")),
    "n11": dict(rb=("", "未到")), "n12": dict(rb=("wait", "确认点 · 未到")),
}
def runrow(n, t, c, cls):
    return f'<div class="runrow"><span class="n">{n}</span><span>{t}</span><span class="c {cls}">{c}</span></div>'
run_ins = (
    ins_h("运行态", "来自 验收清单.json")
    + '<div class="kv"><div><span class="lb">正在跑</span><b>标书撰写 · 第 3 轮</b></div><div><span class="lb">停机</span><b>无</b></div><div><span class="lb">验收</span><b>6 / 13 通过</b></div><div><span class="lb">更新于</span><b>10:42</b></div></div>'
    + '<div><span class="lb">环节</span>'
    + runrow("n3", "招标解析与废标项", "✓ 2 / 2", "ok") + runrow("n5", "评分拆解与应答矩阵", "✓ 3 / 3", "ok")
    + runrow("n7", "分章撰写", "● 1 / 3", "run") + runrow("n10", "合规自查与模拟评审", "0 / 2", "todo") + '</div>'
    + '<div><span class="lb">复用的狗</span>' + runrow("n8", "合同审查 v1.2", "✓ 15 / 15", "ok") + '</div>'
    + '<div><span class="lb">人</span>' + runrow("n9", "报价 · 财务", "等财务", "run") + runrow("n12", "递交 · 人工确认点", "未到", "todo") + '</div>'
    + '<span class="btn amber">打开上岗（05）看当前环节</span>'
    + '<div class="hint">画布不执行任何东西：狗在 05 上岗，每轮把打钩写回 验收清单.json，这里只是把数据放回图上。</div>')
CANVAS_RUN = frame("投标流程 · 组织流程画布", ("第 3 轮",), toolbar(BASE, run_on=True),
                   canvas(BASE, EDGES, node_kw=run_kw), run_ins)

FILES = {"CanvasEmpty.dc.html": CANVAS_EMPTY, "CanvasDrag.dc.html": CANVAS_DRAG, "CanvasBuild.dc.html": CANVAS_BUILD,
         "CanvasDiff.dc.html": CANVAS_DIFF, "CanvasRun.dc.html": CANVAS_RUN}
