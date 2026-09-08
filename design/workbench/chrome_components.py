# -*- coding: utf-8 -*-
"""三个真组件（可传参、可被 <dc-import> 引用）：Sidebar / Topbar / InputBar。
屏幕在 gen.IMPORTS=True 时引用它们；gen.IMPORTS=False 时内联同样的标记（gen.sidebar_inline 等）。
两份标记的 token 完全一致，改这里 = 改所有屏。"""
import json
from gen import (ico, HEAD, TAIL, AGENTS, SIDE_KEYS, ACT_ICONS, AMBER, AMBER_SOFT, SIDE, SIDE_TXT, SIDE_ON,
                 SIDE_SMALL, SIDE_SEC, SIDE_AV, INK, SUB, LINE, CHATBG, WHITE)

def _helmet(css):
    return HEAD.replace('  </style>\n</helmet>', css + '  </style>\n</helmet>')

# ------------------------------------------------------------------ Sidebar
SIDEBAR_CSS = f'''
    .sb {{ width: 240px; height: 100%; background: {SIDE}; color: {SIDE_TXT}; padding: 16px 12px 14px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }}
    .sb .brand {{ display: flex; align-items: center; gap: 9px; padding: 2px 8px 10px; color: #ffffff; font-weight: 800; font-size: 16px; }}
    .sb .brand .lg {{ font-size: 20px; line-height: 1; }}
    .sb .cta {{ display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; border-radius: 10px; background: {AMBER}; color: #ffffff; font-weight: 700; font-size: 14px; padding: 0 14px; }}
    .sb .sec {{ font-size: 11px; letter-spacing: .1em; color: {SIDE_SEC}; padding: 14px 10px 6px; font-weight: 700; }}
    .sb .sec.k {{ padding-top: 12px; }}
    .sb .list {{ display: flex; flex-direction: column; gap: 2px; }}
    .sb .it {{ display: flex; gap: 11px; align-items: center; min-height: 48px; padding: 6px 10px; border-radius: 10px; color: {SIDE_TXT}; font-size: 14px; line-height: 1.3; }}
    .sb .it.r {{ min-height: 44px; }}
    .sb .it.on {{ background: {SIDE_ON}; color: #ffffff; }}
    .sb .av {{ width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px; background: {SIDE_AV}; flex-shrink: 0; }}
    .sb .col {{ display: flex; flex-direction: column; gap: 2px; min-width: 0; }}
    .sb .nm {{ font-weight: 600; white-space: nowrap; }}
    .sb .sm {{ font-size: 11.5px; color: {SIDE_SMALL}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
    .sb .new {{ margin-left: auto; font-size: 11px; font-weight: 700; color: {AMBER}; background: {SIDE_AV}; border-radius: 6px; padding: 2px 7px; }}
    .sb .cnt {{ margin-left: auto; font-size: 12px; color: {SIDE_SMALL}; }}
    .sb .dot {{ margin-left: auto; width: 8px; height: 8px; border-radius: 50%; background: {AMBER}; }}
    .sb .grow {{ flex-grow: 1; }}
    .sb .ws {{ font-size: 13px; border-top: 1px solid {SIDE_AV}; border-radius: 10px; }}
'''
def _agent_rows():
    out = []
    for k, av, name, sub in AGENTS:
        new = '<span class="new">新</span>' if k == "comp" else ''
        out.append(f'<div class="it {{{{on_{k}}}}}"><span class="av">{av}</span><span class="col"><span class="nm">{name}</span><span class="sm">{sub}</span></span>{new}</div>')
    return ''.join(out)
def _row(k, icon, label, tail):
    return f'<div class="it r {{{{on_{k}}}}}">{ico(icon,20)}<span class="nm">{label}</span>{tail}</div>'

SIDEBAR = _helmet(SIDEBAR_CSS) + (
    '<aside class="sb" style="min-height: {{h}}px">'
    '<div class="brand"><span class="lg">🐕</span><span>PromptDog</span></div>'
    f'<div class="cta">{ico("plus",18)}<span>造一只工作狗</span></div>'
    '<div class="sec">我的数字员工</div><div class="list">' + _agent_rows() + '</div>'
    '<div class="sec">组织</div>'
    + _row("flow", "flow", "流程画布", '<span class="cnt">3</span>') + _row("design", "book", "设计", '<span class="cnt">1</span>')
    + '<div class="sec k">犬舍</div>'
    + _row("kennel", "grid", "全部工作狗", '<span class="cnt">4</span>') + _row("library", "puzzle", "组件库", '<span class="cnt">12</span>')
    + _row("retro", "refresh", "复盘与回归", '<span class="dot"></span>')
    + '<div class="grow"></div>'
    f'<div class="it r ws">{ico("gear",20)}<span>我的工作区</span></div>'
    '</aside>\n</x-dc>\n'
    '<script data-dc-script data-props=\'' + json.dumps({
        "active": {"editor": "enum", "options": list(SIDE_KEYS), "default": "dog", "section": "变体预览"},
        "h": {"editor": None}, "$preview": {"width": 240, "height": 900}}, ensure_ascii=False) + '\'>\n'
    'class Component extends DCLogic {\n'
    '  renderVals() {\n'
    '    var p = this.props || {}; var a = p.active || "dog"; var o = { h: Number(p.h) || 900 };\n'
    '    ' + json.dumps(list(SIDE_KEYS)) + '.forEach(function (k) { o["on_" + k] = (a === k) ? "on" : ""; });\n'
    '    return o;\n  }\n}\n</script>\n</body>\n</html>\n')

# ------------------------------------------------------------------ Topbar
TOPBAR_CSS = f'''
    .tb {{ height: 56px; width: 100%; background: {WHITE}; border-bottom: 1px solid {LINE}; display: flex; align-items: center; gap: 10px; padding: 0 20px; color: {INK}; }}
    .tb .ttl {{ font-weight: 700; font-size: 15px; white-space: nowrap; }}
    .tb .badge {{ font-size: 11px; background: {AMBER}; color: #ffffff; border-radius: 5px; padding: 2px 8px; font-weight: 700; }}
    .tb .chips {{ display: flex; gap: 8px; align-items: center; }}
    .tb .chip {{ display: inline-flex; align-items: center; height: 28px; border: 1px solid {LINE}; background: {CHATBG}; border-radius: 8px; padding: 0 11px; font-size: 12.5px; color: {SUB}; white-space: nowrap; }}
    .tb .right {{ margin-left: auto; display: flex; gap: 4px; align-items: center; }}
    .tb .act {{ display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 8px; color: {SUB}; font-size: 13px; white-space: nowrap; }}
    .tb .act.primary {{ padding: 0 14px; background: {AMBER}; color: #ffffff; font-weight: 700; }}
    .tb .act.amber {{ border: 1px solid {AMBER}; background: {WHITE}; color: {AMBER}; font-weight: 600; }}
    .tb .act.ghost {{ border: 1px solid {LINE}; background: {WHITE}; font-weight: 600; }}
    .tb .act svg {{ width: 16px; height: 16px; }}
    .tb .act.text svg {{ width: 18px; height: 18px; }}
'''
_icon_ifs = ''.join(f'<sc-if value="{{{{a.i_{n}}}}}" hint-placeholder-val="{{{{false}}}}">{ico(n,16,"currentColor",1.9)}</sc-if>' for n in ACT_ICONS)
TOPBAR = _helmet(TOPBAR_CSS) + (
    '<header class="tb"><span class="ttl">{{title}}</span>'
    '<sc-if value="{{hasBadge}}" hint-placeholder-val="{{false}}"><span class="badge">{{badge}}</span></sc-if>'
    '<div class="chips"><sc-for list="{{chips}}" as="c" hint-placeholder-count="2"><span class="chip">{{c.t}}</span></sc-for></div>'
    '<div class="right"><sc-for list="{{actions}}" as="a" hint-placeholder-count="2"><span class="act {{a.kind}}">' + _icon_ifs + '<span>{{a.label}}</span></span></sc-for></div>'
    '</header>\n</x-dc>\n'
    '<script data-dc-script data-props=\'' + json.dumps({
        "data": {"editor": None},
        "sample": {"editor": "enum", "options": ["会话", "犬舍", "汇报", "上岗"], "default": "会话", "section": "变体预览"},
        "$preview": {"width": 1200, "height": 56}}, ensure_ascii=False) + '\'>\n'
    'class Component extends DCLogic {\n'
    '  renderVals() {\n'
    '    var p = this.props || {}; var d = null;\n'
    '    try { d = p.data ? JSON.parse(p.data) : null; } catch (e) { d = null; }\n'
    '    var S = ' + json.dumps({
        "会话": {"title": "提示狗 · 竞品分析工作流", "badge": "", "chips": [{"t": "L3 提示链"}, {"t": "预填交付 · 纠错卡 1 张"}], "actions": [{"label": "历史会话", "kind": "text", "icon": "clock"}, {"label": "帮助", "kind": "text", "icon": "help"}]},
        "犬舍": {"title": "犬舍", "badge": "", "chips": [{"t": "4 只工作狗"}, {"t": "1 只止损待处理"}], "actions": [{"label": "造一只工作狗", "kind": "primary", "icon": "plus"}]},
        "汇报": {"title": "投标流程 · 汇报模式", "badge": "", "chips": [{"t": "只读"}, {"t": "19 个节点 · 23 条线"}], "actions": [{"label": "导出 PNG / PDF", "kind": "ghost", "icon": "download"}, {"label": "同意：先建标书撰写", "kind": "primary", "icon": "check"}]},
        "上岗": {"title": "合同审查", "badge": "DEMO", "chips": [{"t": "环节 7 / 7"}, {"t": "第 7 轮 · 一轮一环节"}, {"t": "停机：待确认"}], "actions": [{"label": "它在流程画布的节点 n8", "kind": "text", "icon": "flow"}]},
    }, ensure_ascii=False) + ';\n'
    '    if (!d) d = S[p.sample] || S["会话"];\n'
    '    var ICONS = ' + json.dumps(list(ACT_ICONS)) + ';\n'
    '    var acts = (d.actions || []).map(function (a) { var o = { label: a.label || "", kind: a.kind || "text" }; ICONS.forEach(function (n) { o["i_" + n] = (a.icon === n); }); return o; });\n'
    '    return { title: d.title || "", badge: d.badge || "", hasBadge: !!d.badge, chips: d.chips || [], actions: acts };\n'
    '  }\n}\n</script>\n</body>\n</html>\n')

# ------------------------------------------------------------------ InputBar
INPUTBAR_CSS = f'''
    .ib {{ padding: 12px 22px 16px; background: {WHITE}; border-top: 1px solid {LINE}; display: flex; gap: 10px; align-items: center; color: {INK}; }}
    .ib .sq {{ display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 10px; color: {SUB}; border: 1px solid {LINE}; background: {CHATBG}; flex-shrink: 0; }}
    .ib .box {{ flex-grow: 1; display: flex; align-items: center; min-height: 44px; border: 1px solid {LINE}; border-radius: 10px; padding: 0 14px; color: {SUB}; font-size: 14px; background: {CHATBG}; min-width: 0; }}
    .ib .box.filled {{ color: {INK}; }}
    .ib .direct {{ display: inline-flex; align-items: center; gap: 6px; height: 44px; padding: 0 13px; border-radius: 10px; border: 1px solid {LINE}; background: {CHATBG}; color: {SUB}; font-size: 13px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }}
    .ib .direct.on {{ border-color: {AMBER}; background: {AMBER_SOFT}; color: {AMBER}; }}
    .ib .send {{ display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 10px; background: {AMBER}; color: #ffffff; flex-shrink: 0; }}
'''
INPUTBAR = _helmet(INPUTBAR_CSS) + (
    f'<div class="ib"><span class="sq">{ico("clip",20)}</span><div class="box {{{{filled}}}}">{{{{text}}}}</div>'
    f'<span class="direct {{{{directOn}}}}">{ico("bolt",16)}<span>直接做</span></span><span class="send">{ico("send",20)}</span></div>\n</x-dc>\n'
    '<script data-dc-script data-props=\'' + json.dumps({
        "placeholder": {"editor": None}, "value": {"editor": None},
        "direct": {"editor": "enum", "options": ["0", "1"], "default": "0", "section": "变体预览"},
        "$preview": {"width": 720, "height": 72}}, ensure_ascii=False) + '\'>\n'
    'class Component extends DCLogic {\n'
    '  renderVals() {\n'
    '    var p = this.props || {}; var v = p.value || ""; var ph = p.placeholder || "说编号即可调整：如「环节 2 加价格监控」「H2 不对」";\n'
    '    return { text: v || ph, filled: v ? "filled" : "", directOn: (String(p.direct) === "1") ? "on" : "" };\n'
    '  }\n}\n</script>\n</body>\n</html>\n')

FILES = {"Sidebar.dc.html": SIDEBAR, "Topbar.dc.html": TOPBAR, "InputBar.dc.html": INPUTBAR}
