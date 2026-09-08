# -*- coding: utf-8 -*-
"""Generate the five PromptDog workbench artboards (.dc.html) from shared fragments.
Tokens lifted from index.html (landing page + embedded workbench demo)."""
import os, json

OUT = os.path.dirname(os.path.abspath(__file__))

# ---- tokens (exact values from index.html) ----
AMBER = "#d97706"; AMBER_SOFT = "#fdf0dd"; AMBER_HOVER = "#b45309"
SIDE = "#1b1f27"; SIDE_TXT = "#c8cdd6"; SIDE_ON = "#2e3542"; SIDE_SMALL = "#7b8494"; SIDE_SEC = "#5d6572"; SIDE_AV = "#2a303c"
INK = "#1e232b"; SUB = "#68707c"; LINE = "#e5e8ee"; CHATBG = "#f7f8fa"; WHITE = "#ffffff"
OK = "#16a34a"; HI = "#dc2626"; MID = "#d97706"; LO = "#2563eb"; FIXBG = "#f0faf2"; QUOTEBG = "#f7f8fa"
MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"

# ---- inline SVG icons (stroke, 20px grid) ----
def ico(name, size=20, color="currentColor", sw=1.8):
    paths = {
        "plus": '<path d="M10 4v12M4 10h12"/>',
        "search": '<circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2 17 17"/>',
        "clip": '<path d="M14.5 9.5 9.2 14.8a3 3 0 0 1-4.2-4.2l6-6a2 2 0 0 1 2.8 2.8l-6 6a1 1 0 0 1-1.4-1.4l5.3-5.3"/>',
        "send": '<path d="M10 16V4M5 9l5-5 5 5"/>',
        "folder": '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3.4l1.6 1.8h6A1.5 1.5 0 0 1 17 8.3v6.2a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5z"/>',
        "check": '<path d="M4.5 10.5 8.3 14 15.5 6.5"/>',
        "chev": '<path d="M5.5 8 10 12.5 14.5 8"/>',
        "gear": '<circle cx="10" cy="10" r="2.6"/><path d="M10 2.8v2M10 15.2v2M2.8 10h2M15.2 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"/>',
        "refresh": '<path d="M16 9.5A6 6 0 0 0 5.2 6.2M4 10.5a6 6 0 0 0 10.8 3.3"/><path d="M15.5 3.5v3.3h-3.3M4.5 16.5v-3.3h3.3"/>',
        "download": '<path d="M10 3.5v9M6.5 9l3.5 3.5L13.5 9M4 16.5h12"/>',
        "clock": '<circle cx="10" cy="10" r="6.5"/><path d="M10 6.5V10l2.5 1.5"/>',
        "help": '<circle cx="10" cy="10" r="6.5"/><path d="M8.2 8a1.9 1.9 0 0 1 3.7.6c0 1.2-1.9 1.5-1.9 2.6M10 14h.01"/>',
        "spinner": '<path d="M10 3.5a6.5 6.5 0 1 1-6.3 4.9"/>',
        "dot": '<circle cx="10" cy="10" r="3"/>',
        "file": '<path d="M6 3h5.5L15 6.5V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M11 3v4h4"/>',
        "bolt": '<path d="M11 3 5 11h4.5L9 17l6-8h-4.5z"/>',
        "flag": '<path d="M5 17V3.5h9l-2 3.5 2 3.5H5"/>',
        "edit": '<path d="M13.5 3.8l2.7 2.7L7.5 15.2H4.8v-2.7z"/>',
        "grid": '<rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1"/><rect x="11" y="3.5" width="5.5" height="5.5" rx="1"/><rect x="3.5" y="11" width="5.5" height="5.5" rx="1"/><rect x="11" y="11" width="5.5" height="5.5" rx="1"/>',
        "warn": '<path d="M10 3.5 17 16H3z"/><path d="M10 8.5v3.5M10 14h.01"/>',
        "book": '<path d="M4 4.5h5a2 2 0 0 1 2 2v10a1.5 1.5 0 0 0-1.5-1.5H4z"/><path d="M16 4.5h-5a2 2 0 0 0-2 2v10a1.5 1.5 0 0 1 1.5-1.5H16z"/>',
        "user": '<circle cx="10" cy="7" r="3.2"/><path d="M4 17a6 6 0 0 1 12 0"/>',
        "grip": '<path d="M7.5 5h.01M12.5 5h.01M7.5 10h.01M12.5 10h.01M7.5 15h.01M12.5 15h.01"/>',
        "flow": '<rect x="3" y="3.5" width="5" height="4" rx="1"/><rect x="12" y="8" width="5" height="4" rx="1"/><rect x="3" y="12.5" width="5" height="4" rx="1"/><path d="M8 5.5h2a1.5 1.5 0 0 1 1.5 1.5v1.5M8 14.5h2a1.5 1.5 0 0 0 1.5-1.5v-1.5"/>',
        "puzzle": '<path d="M8 3.5h3a1 1 0 0 1 1 1V6a1.5 1.5 0 1 0 0 3v1.5a1 1 0 0 1-1 1H9.5a1.5 1.5 0 1 0-3 0H5a1 1 0 0 1-1-1V8a1.5 1.5 0 1 1 0-3V4.5a1 1 0 0 1 1-1z"/><path d="M11 11.5h3.5a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1h-2a1.5 1.5 0 1 1-3 0H8a1 1 0 0 1-1-1v-2"/>',
    }
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 20 20" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;display:block">{paths[name]}</svg>')

# ---- shared chrome ----
HEAD = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; color: #1e232b; background: #f7f8fa; -webkit-font-smoothing: antialiased; }
    a { color: #d97706; text-decoration: none; } a:hover { color: #b45309; }
    * { box-sizing: border-box; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blink { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
  </style>
</helmet>
'''
TAIL = '''</x-dc>
</body>
</html>
'''

AGENTS = [
    ("dog",  "🐕", "提示狗",     "提示词 · SOP · 工作流"),
    ("law",  "⚖️", "合同审查助手", "粘贴合同，自动初审"),
    ("bid",  "📑", "标书撰写",    "招标文件 → 投标初稿"),
    ("mkt",  "✍️", "内容营销",    "素材库 → 多平台文案"),
    ("comp", "📈", "竞品分析",    "每周一 · 竞品周报"),
]

def sidebar(active="dog", kennel_active=False, flow_active=False, design_active=False):
    items = []
    for key, av, name, sub in AGENTS:
        on = (key == active) and not kennel_active and not flow_active and not design_active
        bg = SIDE_ON if on else "transparent"
        col = "#ffffff" if on else SIDE_TXT
        new = ''
        if key == "comp":
            new = f'<span style="margin-left:auto;font-size:11px;font-weight:700;color:{AMBER};background:{SIDE_AV};border-radius:6px;padding:2px 7px">新</span>'
        items.append(
            f'<div style="display:flex;gap:11px;align-items:center;min-height:48px;padding:6px 10px;border-radius:10px;background:{bg};color:{col};font-size:14px;line-height:1.3">'
            f'<span style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;background:{SIDE_AV};flex-shrink:0">{av}</span>'
            f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-weight:600;white-space:nowrap">{name}</span>'
            f'<span style="font-size:11.5px;color:{SIDE_SMALL};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{sub}</span></span>{new}</div>')
    kbg = SIDE_ON if kennel_active else "transparent"
    kcol = "#ffffff" if kennel_active else SIDE_TXT
    return (
        f'<aside style="grid-row:1 / span 2;background:{SIDE};color:{SIDE_TXT};padding:16px 12px 14px;display:flex;flex-direction:column;gap:6px;overflow:hidden">'
        f'<div style="display:flex;align-items:center;gap:9px;padding:2px 8px 10px;color:#ffffff;font-weight:800;font-size:16px"><span style="font-size:20px;line-height:1">🐕</span><span>PromptDog</span></div>'
        f'<div style="display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:14px;padding:0 14px">{ico("plus",18)}<span>造一只工作狗</span></div>'
        f'<div style="font-size:11px;letter-spacing:.1em;color:{SIDE_SEC};padding:14px 10px 6px;font-weight:700">我的数字员工</div>'
        f'<div style="display:flex;flex-direction:column;gap:2px">{"".join(items)}</div>'
        f'<div style="font-size:11px;letter-spacing:.1em;color:{SIDE_SEC};padding:14px 10px 6px;font-weight:700">组织</div>'
        f'<div style="display:flex;gap:11px;align-items:center;min-height:44px;padding:6px 10px;border-radius:10px;background:{SIDE_ON if flow_active else "transparent"};color:{"#ffffff" if flow_active else SIDE_TXT};font-size:14px">{ico("flow",20)}<span style="font-weight:600">流程画布</span><span style="margin-left:auto;font-size:12px;color:{SIDE_SMALL}">3</span></div>'
        f'<div style="display:flex;gap:11px;align-items:center;min-height:44px;padding:6px 10px;border-radius:10px;background:{SIDE_ON if design_active else "transparent"};color:{"#ffffff" if design_active else SIDE_TXT};font-size:14px">{ico("book",20)}<span style="font-weight:600">设计</span><span style="margin-left:auto;font-size:12px;color:{SIDE_SMALL}">1</span></div>'
        f'<div style="font-size:11px;letter-spacing:.1em;color:{SIDE_SEC};padding:12px 10px 6px;font-weight:700">犬舍</div>'
        f'<div style="display:flex;gap:11px;align-items:center;min-height:44px;padding:6px 10px;border-radius:10px;background:{kbg};color:{kcol};font-size:14px">{ico("grid",20)}<span style="font-weight:600">全部工作狗</span><span style="margin-left:auto;font-size:12px;color:{SIDE_SMALL}">4</span></div>'
        f'<div style="display:flex;gap:11px;align-items:center;min-height:44px;padding:6px 10px;border-radius:10px;color:{SIDE_TXT};font-size:14px">{ico("puzzle",20)}<span style="font-weight:600">组件库</span><span style="margin-left:auto;font-size:12px;color:{SIDE_SMALL}">12</span></div>'
        f'<div style="display:flex;gap:11px;align-items:center;min-height:44px;padding:6px 10px;border-radius:10px;color:{SIDE_TXT};font-size:14px">{ico("refresh",20)}<span style="font-weight:600">复盘与回归</span><span style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:{AMBER}"></span></div>'
        f'<div style="flex-grow:1"></div>'
        f'<div style="display:flex;gap:11px;align-items:center;min-height:44px;padding:6px 10px;border-radius:10px;color:{SIDE_TXT};font-size:13px;border-top:1px solid {SIDE_AV}">{ico("gear",20)}<span>我的工作区</span></div>'
        f'</aside>')

def topbar(title, badge=None, chips=(), right=None):
    b = f'<span style="font-size:11px;background:{AMBER};color:#ffffff;border-radius:5px;padding:2px 8px;font-weight:700">{badge}</span>' if badge else ''
    c = ''.join(f'<span style="display:inline-flex;align-items:center;height:28px;border:1px solid {LINE};background:{CHATBG};border-radius:8px;padding:0 11px;font-size:12.5px;color:{SUB}">{t}</span>' for t in chips)
    if right is None:
        right = (f'<div style="display:flex;gap:6px;align-items:center;height:36px;padding:0 12px;border-radius:8px;color:{SUB};font-size:13px">{ico("clock",18)}<span>历史会话</span></div>'
                 f'<div style="display:flex;gap:6px;align-items:center;height:36px;padding:0 12px;border-radius:8px;color:{SUB};font-size:13px">{ico("help",18)}<span>帮助</span></div>')
    return (f'<header style="grid-column:2 / -1;background:{WHITE};border-bottom:1px solid {LINE};display:flex;align-items:center;gap:10px;padding:0 20px">'
            f'<span style="font-weight:700;font-size:15px">{title}</span>{b}<div style="display:flex;gap:8px;align-items:center">{c}</div>'
            f'<div style="margin-left:auto;display:flex;gap:4px;align-items:center">{right}</div></header>')

def inputbar(placeholder, value=None, direct=False):
    txt = value if value else placeholder
    col = INK if value else SUB
    dbg = AMBER_SOFT if direct else CHATBG
    dcol = AMBER if direct else SUB
    dbd = AMBER if direct else LINE
    return (f'<div style="padding:12px 22px 16px;background:{WHITE};border-top:1px solid {LINE};display:flex;gap:10px;align-items:center">'
            f'<div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;color:{SUB};border:1px solid {LINE};background:{CHATBG}">{ico("clip",20)}</div>'
            f'<div style="flex-grow:1;display:flex;align-items:center;min-height:44px;border:1px solid {LINE};border-radius:10px;padding:0 14px;color:{col};font-size:14px;background:{CHATBG}">{txt}</div>'
            f'<div style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 13px;border-radius:10px;border:1px solid {dbd};background:{dbg};color:{dcol};font-size:13px;font-weight:600;white-space:nowrap">{ico("bolt",16)}<span>直接做</span></div>'
            f'<div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:{AMBER};color:#ffffff">{ico("send",20)}</div></div>')

def right_head(title, status=None, actions=''):
    s = ''
    if status == "live":
        s = f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:12px;color:{OK};font-weight:700"><span style="width:7px;height:7px;border-radius:50%;background:{OK};animation:blink 1.2s infinite"></span>实时生成</span>'
    elif status == "done":
        s = f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:12px;color:{OK};font-weight:700">{ico("check",14,OK,2.2)}已完成</span>'
    return (f'<div style="padding:0 20px;min-height:52px;border-bottom:1px solid {LINE};display:flex;align-items:center;gap:8px">'
            f'<span style="font-weight:700;font-size:14px">{title}</span>{s}{actions}</div>')

def user_msg(html):
    return (f'<div style="align-self:flex-end;max-width:78%;padding:11px 15px;border-radius:14px;border-bottom-right-radius:4px;'
            f'background:{AMBER};color:#ffffff;font-size:14px;line-height:1.6">{html}</div>')

def bot_msg(who, html):
    return (f'<div style="align-self:flex-start;max-width:82%;padding:11px 15px;border-radius:14px;border-bottom-left-radius:4px;'
            f'background:{WHITE};border:1px solid {LINE};font-size:14px;line-height:1.6">'
            f'<div style="font-size:12px;font-weight:800;color:{AMBER};margin-bottom:4px">{who}</div>{html}</div>')

def filechip(text):
    return (f'<div style="display:inline-flex;gap:8px;align-items:center;background:rgba(255,255,255,.18);border-radius:8px;padding:6px 11px;margin-bottom:6px;font-size:13px">{ico("file",16)}<span>{text}</span></div>')

def option(label, star=None, picked=False):
    bg = AMBER_SOFT if picked else "transparent"
    col = INK if picked else SUB
    dot = (f'<span style="width:16px;height:16px;border-radius:50%;border:1.5px solid {AMBER};background:{AMBER};box-shadow:inset 0 0 0 3px #ffffff;flex-shrink:0"></span>'
           if picked else f'<span style="width:16px;height:16px;border-radius:50%;border:1.5px solid {LINE};background:#ffffff;flex-shrink:0"></span>')
    st = f'<span style="color:{AMBER};font-weight:700;font-size:12.5px;line-height:1.4">★ {star}</span>' if star else ''
    return (f'<div style="display:flex;gap:10px;align-items:flex-start;min-height:36px;padding:6px 10px;border-radius:8px;background:{bg};color:{col};font-size:14px;line-height:1.4">'
            f'<span style="display:flex;align-items:center;height:20px">{dot}</span><span style="display:flex;flex-direction:column;gap:1px;min-width:0"><span>{label}</span>{st}</span></div>')

def question(title, opts, note=None):
    n = f'<span style="font-weight:500;color:{SUB};font-size:13px">（{note}）</span>' if note else ''
    return (f'<div style="display:flex;flex-direction:column;gap:2px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">{title}{n}</div>{"".join(opts)}</div>')

def stage(label, detail, state):
    if state == "done":
        ic = ico("check", 18, OK, 2.2); op = "1"; dcol = SUB
    elif state == "run":
        ic = f'<span style="display:inline-block;animation:spin 1s linear infinite">{ico("spinner",18,AMBER,2)}</span>'; op = "1"; dcol = AMBER
    else:
        ic = f'<span style="width:18px;height:18px;border-radius:50%;border:1.5px dashed {LINE};display:block"></span>'; op = ".38"; dcol = SUB
    return (f'<div style="display:flex;gap:10px;align-items:center;min-height:32px;font-size:14px;opacity:{op}">'
            f'<span style="width:18px;display:flex;justify-content:center;flex-shrink:0">{ic}</span><span>{label}</span>'
            f'<span style="margin-left:auto;font-size:12.5px;color:{dcol};text-align:right">{detail}</span></div>')

def stages_panel(title, rows):
    return (f'<div style="align-self:stretch;background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:14px 18px 10px;display:flex;flex-direction:column;gap:2px">'
            f'<div style="display:flex;align-items:center;gap:7px;font-size:13px;color:{SUB};font-weight:600;margin-bottom:6px">{ico("gear",16,SUB)}<span>{title}</span></div>{"".join(rows)}</div>')

def tile(v, k, color):
    return (f'<div style="border:1px solid {LINE};border-radius:10px;padding:8px 6px;text-align:center;display:flex;flex-direction:column;gap:1px">'
            f'<span style="font-weight:800;font-size:19px;color:{color};line-height:1.2">{v}</span><span style="font-size:11.5px;color:{SUB}">{k}</span></div>')

def tiles(items):
    return f'<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:8px">{"".join(tile(*i) for i in items)}</div>'

def tree_row(text, comment="", is_dir=False):
    col = AMBER if is_dir else INK
    w = "700" if is_dir else "500"
    c = f'<span style="color:{SUB};font-size:12px;margin-left:10px">{comment}</span>' if comment else ''
    return f'<div style="display:flex;align-items:baseline;min-height:26px;white-space:nowrap"><span style="color:{col};font-weight:{w}">{text}</span>{c}</div>'

def assumption(n, text, basis):
    return (f'<div style="display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-top:1px solid {LINE};font-size:13.5px;line-height:1.5">'
            f'<span style="font-family:{MONO};font-weight:700;color:{AMBER};flex-shrink:0;padding-top:1px">{n}</span>'
            f'<span style="display:flex;flex-direction:column;gap:1px;min-width:0"><span>{text}</span><span style="font-size:12px;color:{SUB}">依据：{basis}</span></span>'
            f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 10px;border:1px solid {LINE};border-radius:8px;font-size:12px;color:{SUB};flex-shrink:0">{ico("edit",14,SUB)}改</span></div>')

def frame(cols, body):
    return (f'<div style="width:1440px;height:900px;display:grid;grid-template-columns:{cols};grid-template-rows:56px minmax(0, 1fr);'
            f'overflow:hidden;background:{CHATBG};color:{INK}">{body}</div>')

COLS3 = "240px minmax(0, 1fr) 480px"
COLS2 = "240px minmax(0, 1fr)"

def chat_col(stream_html, input_html, extra_style=""):
    return (f'<main style="display:flex;flex-direction:column;min-width:0;background:{CHATBG};{extra_style}">'
            f'<div style="flex-grow:1;min-height:0;padding:22px 26px;display:flex;flex-direction:column;gap:14px;overflow:hidden">{stream_html}</div>{input_html}</main>')

def right_col(head, body_html, body_style=""):
    return (f'<aside style="background:{WHITE};border-left:1px solid {LINE};display:flex;flex-direction:column;min-width:0">{head}'
            f'<div style="flex-grow:1;min-height:0;padding:18px 20px;display:flex;flex-direction:column;gap:14px;overflow:hidden;{body_style}">{body_html}</div></aside>')

# =====================================================================
# 01 首页 · 空状态  (Main.dc.html)
# =====================================================================
examples = ["客服质检 SOP", "每周竞品周报工作流", "改进我的翻译提示词", "合同初审工作狗"]
ex_chips = ''.join(f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 16px;border-radius:999px;background:{WHITE};border:1px solid {LINE};font-size:13.5px;color:{SUB}">{e}</span>' for e in examples)
home_stream = (
    f'<div style="flex-grow:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;padding:0 40px">'
    f'<span style="font-size:56px;line-height:1">🐕</span>'
    f'<div style="display:flex;flex-direction:column;gap:8px;max-width:560px">'
    f'<div style="font-size:26px;font-weight:800;letter-spacing:-.01em">说一句你想让 AI 帮你做的事</div>'
    f'<div style="font-size:15px;color:{SUB};line-height:1.7">或贴一段现有提示词，我给你评分和改进版。信息够就直接交付；拿不准方向才出选择题，最多两轮，回「都按推荐」就放行。</div></div>'
    f'<div style="width:100%;max-width:720px;background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:16px 18px 12px;display:flex;flex-direction:column;gap:12px;text-align:left;box-shadow:0 8px 28px rgba(217,119,6,.10)">'
    f'<div style="min-height:72px;font-size:15px;color:{SUB};line-height:1.6">例如：我想要一个每周自动做竞品分析报告的工作流</div>'
    f'<div style="display:flex;gap:8px;align-items:center;border-top:1px solid {LINE};padding-top:10px">'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {LINE};background:{CHATBG};font-size:13px;color:{SUB}">{ico("clip",16)}<span>贴文件 / 提示词</span></span>'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {LINE};background:{CHATBG};font-size:13px;color:{SUB}">{ico("bolt",16)}<span>直接做（不出选择题）</span></span>'
    f'<span style="margin-left:auto;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:{AMBER};color:#ffffff">{ico("send",20)}</span></div></div>'
    f'<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:720px">{ex_chips}</div></div>')
home_right_body = (
    f'<div style="flex-grow:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;border:1.5px dashed {LINE};border-radius:14px;padding:32px;color:{SUB}">'
    f'<span style="width:56px;height:56px;border-radius:14px;background:{AMBER_SOFT};display:flex;align-items:center;justify-content:center">{ico("folder",26,AMBER,1.6)}</span>'
    f'<div style="font-size:14.5px;font-weight:600;color:{INK}">资产包会在这里实时生成</div>'
    f'<div style="font-size:13px;line-height:1.7;max-width:280px">路由 · 主控 · 各环节提示词 · 启动指令 · 复盘与回归目录——拖进任意 Agent 工作区即上岗</div></div>')
MAIN = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 新会话") +
    chat_col(home_stream, '') +
    right_col(right_head("交付物预览"), home_right_body)) + TAIL

# =====================================================================
# 02 确认卡片  (Confirm.dc.html)
# =====================================================================
card = (
    f'<div style="align-self:stretch;background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:16px 20px 14px;display:flex;flex-direction:column;gap:14px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12.5px;color:{AMBER};font-weight:800;letter-spacing:.04em">确认卡片 · 仅 1 轮</span>'
    f'<span style="font-size:12.5px;color:{SUB}">已按我的理解预填 ★，不符再改</span></div>'
    f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:14px 24px">'
    + question("Q1 竞品范围？", [option("A. 固定 3–5 家核心竞品", "范围稳定才能做周环比", True), option("B. 每周自动发现新玩家"), option("C. 其他（一句话说明）")])
    + question("Q2 报告受众？", [option("A. 高管摘要 + 团队附录", "一份两用", True), option("B. 仅内部参考"), option("C. 其他（一句话说明）")])
    + question("Q3 信息来源？", [option("A. 官网 / 公告", "公开信息可溯源", True), option("B. 行业媒体", None, True), option("C. 应用商店评价"), option("D. 其他（一句话说明）")], "可多选")
    + question("Q4 在哪里运行？", [option("A. 普通对话窗口"), option("B. 带工具的 Agent 工作台", "你提到了「自动」", True), option("C. API / 代码编排（定时、并行）"), option("D. 其他 / 不确定")])
    + f'</div>'
    f'<div style="display:flex;gap:8px;align-items:center;border-top:1px solid {LINE};padding-top:12px">'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 18px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:14px">{ico("check",16,"#ffffff",2.2)}都按推荐</span>'
    f'<span style="display:inline-flex;align-items:center;height:40px;padding:0 14px;border-radius:10px;border:1px solid {LINE};background:{CHATBG};font-size:13.5px;color:{SUB}">1B 其余默认</span>'
    f'<span style="display:inline-flex;align-items:center;height:40px;padding:0 14px;border-radius:10px;border:1px solid {LINE};background:{CHATBG};font-size:13.5px;color:{SUB}">3AC</span>'
    f'<span style="margin-left:auto;font-size:12.5px;color:{SUB}">也可以直接打一句话修正某题</span></div></div>')
confirm_stream = (
    user_msg("我想要一个每周自动做竞品分析报告的工作流")
    + bot_msg("提示狗 🐕", "这是个<b>定时、多来源采集</b>的任务，我按<b>提示链方案</b>设计。有 4 件事方向没定，先确认——回「都按推荐」可直接通过，之后不再问第二轮。")
    + card)
skel = ''.join(f'<span style="display:block;height:12px;border-radius:6px;background:{CHATBG};width:{w}%"></span>' for w in (62, 84, 74, 90, 68, 80, 56, 72))
confirm_right_body = (
    f'<div style="border:1px solid {LINE};border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:10px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;font-weight:800;color:{AMBER};letter-spacing:.08em">判级</span>'
    f'<span style="font-weight:700;font-size:14.5px">L3 · 提示链</span><span style="margin-left:auto;font-size:12px;color:{SUB}">六信号 7 / 12</span></div>'
    f'<div style="font-size:13.5px;line-height:1.6;color:{INK}">定时触发、多来源采集、周环比成稿——单条提示词装不下，拆成环节、环节之间只传显式产物。</div>'
    f'<div style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:{SUB};min-height:32px">{ico("chev",16,SUB)}<span>展开打分明细</span></div></div>'
    f'<div style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:{SUB}">'
    f'{ico("folder",16,SUB)}<span>竞品分析Agent / 资产包</span><span style="margin-left:auto;font-size:12px;font-weight:500">回复卡片后开始生成</span></div>'
    f'<div style="display:flex;flex-direction:column;gap:12px;padding:16px;border:1.5px dashed {LINE};border-radius:14px">{skel}</div></div>')
CONFIRM = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 竞品分析工作流", chips=("L3 提示链", "第 1 / 2 轮")) +
    chat_col(confirm_stream, inputbar("回「都按推荐」，或「1B 3C 其余默认」")) +
    right_col(right_head("交付物预览"), confirm_right_body)) + TAIL

# =====================================================================
# 03 资产包交付  (Deliver.dc.html)
# =====================================================================
build_rows = [
    stage("验收标准先行", "6 条可二值判定", "done"),
    stage("环节设计与数据契约", "5 环节 · JSON 契约锁死", "done"),
    stage("各环节提示词", "含验证点与失败回退", "done"),
    stage("会话内试跑", "样例输入 · 验收 6 / 6 通过", "done"),
    stage("自检与文档化", "版本头 · 假设清单 · 上手指南", "done"),
]
punch = (f'<div style="align-self:center;background:linear-gradient(100deg,{AMBER},#f59e0b);color:#ffffff;border-radius:14px;padding:12px 26px;text-align:center;'
         f'font-weight:700;font-size:15px;box-shadow:0 8px 24px rgba(217,119,6,.35);display:flex;flex-direction:column;gap:3px">'
         f'<span>一句话，养出一只能上岗的工作狗</span><span style="font-weight:500;opacity:.92;font-size:12.5px">42 秒 · 只答了一次选择题 · 资产入犬舍，可复用、可迭代、可迁移</span></div>')
deliver_stream = (
    user_msg("都按推荐")
    + bot_msg("提示狗 🐕", "生效：全部 ★。开始构建<b>资产包</b>——右侧实时生成。")
    + stages_panel("构建流水线", build_rows)
    + bot_msg("提示狗 🐕", "资产包就绪 📦 一只新的「<b>竞品分析工作狗</b>」已入犬舍——每周一说一句「跑竞品周报」。"
              f'<div style="font-size:13px;color:{SUB};margin-top:4px">想调整任何环节，说编号就行：如「环节 2 加个价格监控」「H2 不对，也要看内部数据」。</div>')
    + punch)
TREE = [
    ("竞品分析Agent/", "", True),
    ("├── AGENTS.md", "路由 + 渐进式加载", False),
    ("├── 分析流程.md", "主控：验收标准 + 环节表", False),
    ("├── prompts/", "环节 1 采集 … 环节 5 成稿", False),
    ("├── templates/", "周报模板 + JSON 契约", False),
    ("├── 启动指令.md", "每周一句话触发", False),
    ("├── 复盘/", "四指标回填 → 越用越准", False),
    ("├── 回归测试/", "改版必跑，达标才发布", False),
    ("└── 输出/", "周报自动落盘", False),
]
deliver_actions = (f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {AMBER};color:{AMBER};font-size:13px;font-weight:600">{ico("download",16,AMBER)}下载资产包</span>')
deliver_right_body = (
    f'<div style="display:flex;flex-direction:column;gap:3px"><div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:16px">{ico("folder",20,AMBER,1.7)}<span>竞品分析Agent · 资产包</span></div>'
    f'<div style="font-size:12.5px;color:{SUB}">L3 提示链 · 5 环节 · 含复盘飞轮与回归门槛 · v1.0 · 2026-09-07</div></div>'
    f'<div style="font-family:{MONO};font-size:13px;line-height:1.6;background:{CHATBG};border:1px solid {LINE};border-radius:12px;padding:12px 16px;overflow:hidden">'
    + ''.join(tree_row(t, c, d) for t, c, d in TREE) + '</div>'
    + tiles([("✓", "验收标准先行", OK), ("✓", "来源强制引用", OK), ("✓", "闭环有终点", OK), ("✓", "拖入即上岗", OK)])
    + f'<div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:{SUB};padding-bottom:8px">{ico("flag",16,SUB)}<span>生效假设</span><span style="font-weight:500">不符请指出编号</span></div>'
    + assumption("H1", "报告语言为中文，周一 09:00 生成", "对话语言 · 「每周」")
    + assumption("H2", "数据以公开信息为限", "未提及内部数据源")
    + assumption("H3", "错误代价：中——供团队与高管参考", "内部报告，非对外发布")
    + '</div>')
DELIVER = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 竞品分析工作流", chips=("L3 提示链", "已交付 v1.0")) +
    chat_col(deliver_stream, inputbar("说编号即可调整：如「环节 2 加价格监控」「H2 不对」")) +
    right_col(right_head("交付物预览 · Agent 资产包", "done", f'<span style="margin-left:8px">{deliver_actions}</span>'), deliver_right_body)) + TAIL

# =====================================================================
# 04 犬舍  (Kennel.dc.html)
# =====================================================================
def stat(k, v, color=INK):
    return (f'<div style="display:flex;flex-direction:column;gap:1px;min-width:0"><span style="font-size:11.5px;color:{SUB}">{k}</span>'
            f'<span style="font-size:13.5px;font-weight:600;color:{color};white-space:nowrap">{v}</span></div>')
def dog_card(av, name, desc, ver, stats, status_html, new=False):
    nb = f'<span style="font-size:11px;font-weight:700;color:{AMBER};background:{AMBER_SOFT};border-radius:6px;padding:2px 8px">新</span>' if new else ''
    return (f'<div style="background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:20px 22px 18px;display:flex;flex-direction:column;gap:14px;min-height:236px">'
            f'<div style="display:flex;gap:12px;align-items:center"><span style="width:44px;height:44px;border-radius:10px;background:{AMBER_SOFT};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">{av}</span>'
            f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:800;font-size:16px">{name}</span>{nb}</div>'
            f'<span style="font-size:13px;color:{SUB};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{desc}</span></div>'
            f'<span style="margin-left:auto;font-family:{MONO};font-size:12px;color:{SUB};flex-shrink:0">{ver}</span></div>'
            f'<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:10px;padding:12px 0;border-top:1px solid {LINE};border-bottom:1px solid {LINE}">{"".join(stats)}</div>'
            f'<div style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;align-items:center;min-height:20px;white-space:nowrap">{status_html}</div>'
            f'<div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">'
            f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;border:1px solid {LINE};font-size:13px;color:{SUB};white-space:nowrap">复盘</span>'
            f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;border:1px solid {LINE};font-size:13px;color:{SUB};white-space:nowrap">跑回归</span>'
            f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 18px;border-radius:8px;background:{AMBER};color:#ffffff;font-size:13px;font-weight:700;white-space:nowrap">上岗</span></div></div></div>')
ok_badge = f'<span style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:{OK};font-weight:600">{ico("check",15,OK,2.2)}回归达标 · 可日常使用</span>'
warn_badge = f'<span style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:{AMBER};font-weight:600">{ico("warn",15,AMBER,1.8)}改版后未跑回归</span>'
new_badge = f'<span style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:{SUB};font-weight:600">{ico("clock",15,SUB)}尚未运行 · 下次：周一 09:00</span>'
cards = [
    dog_card("⚖️", "合同审查助手", "七环节初审，三件套交付", "v1.2",
             [stat("上次运行", "昨天 16:20"), stat("累计审查", "23 份"), stat("漏审 / 虚构来源", "0 / 0", OK)], ok_badge),
    dog_card("📑", "标书撰写", "按评分点写，废标项逐条核对", "v1.1",
             [stat("上次运行", "3 天前"), stat("累计应标", "6 个"), stat("待补材料", "4 项", AMBER)], warn_badge),
    dog_card("✍️", "内容营销", "透明换信任写作，素材库保真", "v1.1",
             [stat("上次运行", "今天 09:10"), stat("累计成稿", "18 篇"), stat("近期存取比", "3 : 1", OK)], ok_badge),
    dog_card("📈", "竞品分析", "每周一采集 → 周环比 → 摘要", "v1.0",
             [stat("上次运行", "—"), stat("环节", "5 个"), stat("触发", "每周一")], new_badge, new=True),
    (f'<div style="border:1.5px dashed {LINE};border-radius:14px;padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:236px;color:{SUB};text-align:center">'
     f'<span style="width:48px;height:48px;border-radius:12px;background:{AMBER_SOFT};display:flex;align-items:center;justify-content:center">{ico("plus",24,AMBER,2)}</span>'
     f'<span style="font-weight:700;font-size:15px;color:{INK}">造一只新工作狗</span><span style="font-size:13px;line-height:1.6;max-width:220px">说一句想让它干的事，选择题确认后资产包直接入犬舍</span></div>'),
]
filters = ''.join(
    f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;border:1px solid {AMBER if i==0 else LINE};background:{AMBER_SOFT if i==0 else WHITE};color:{AMBER if i==0 else SUB};font-size:13.5px;font-weight:{700 if i==0 else 500}">{t}</span>'
    for i, t in enumerate(("全部 4", "常态运行", "待回归 1", "新建")))
kennel_main = (
    f'<main style="min-width:0;overflow:hidden;padding:28px 36px;display:flex;flex-direction:column;gap:22px">'
    f'<div style="display:flex;align-items:flex-end;gap:16px"><div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:24px;font-weight:800;letter-spacing:-.01em">犬舍</span>'
    f'<span style="font-size:14px;color:{SUB}">工作狗 = 场景专用 Agent 资产包，整个文件夹拖进任意工作区即上岗，越用越准。</span></div>'
    f'<div style="margin-left:auto;display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;border:1px solid {LINE};border-radius:10px;background:{WHITE};color:{SUB};font-size:13.5px;min-width:260px">{ico("search",18,SUB)}<span>搜索工作狗</span></div></div>'
    f'<div style="display:flex;gap:8px;align-items:center">{filters}</div>'
    f'<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:18px">{"".join(cards)}</div></main>')
kennel_right = (f'<div style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:14px">{ico("plus",18,"#ffffff",2)}造一只工作狗</div>')
KENNEL = HEAD + frame(COLS2, sidebar(kennel_active=True) + topbar("犬舍", chips=("4 只工作狗", "1 只待回归"), right=kennel_right) + kennel_main) + TAIL

# =====================================================================
# 05 工作狗上岗 · 合同审查  (WorkdogRun.dc.html)
# =====================================================================
law_rows = [
    stage("1 文件解析", "28 页 · 识别 142 个条款", "done"),
    stage("2 事实提取", "事实卡 14 项 · 3 项标【合同未约定】", "done"),
    stage("3 风险扫描", "发现 7 个风险（高 2 · 中 3 · 低 2）", "done"),
    stage("4 法律核查", "官方来源 2 条 · 1 项标【待律师核查】", "done"),
    stage("5 条款建议", "生成 5 条示范修改文本", "done"),
    stage("6 对抗审查", "复核中 · 只找问题不润色", "run"),
    stage("7 交付生成", "三件套 → 输出/", "todo"),
]
run_stream = (
    user_msg(filechip("设备采购合同.pdf · 2.4 MB") + "<div>审查这份合同。立场：<b>甲方风险优先</b>，委托方：华南智造。</div>")
    + bot_msg("合同审查工作狗 ⚖️", "收到。多步骤、高错误代价的审查任务，按<b>七环节提示链</b>执行——交付物在右侧实时生成，对外发送前才会停下来等你确认。")
    + stages_panel("审查流水线 · 第 1 轮", law_rows)
    + f'<div style="align-self:flex-start;display:flex;gap:6px;align-items:center;background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:12px 16px">'
      f'<span style="width:7px;height:7px;border-radius:50%;background:{SUB};animation:blink 1s infinite"></span><span style="width:7px;height:7px;border-radius:50%;background:{SUB};animation:blink 1s infinite .2s"></span><span style="width:7px;height:7px;border-radius:50%;background:{SUB};animation:blink 1s infinite .4s"></span></div>')
def risk(lv, rid, loc, title, quote, why, fix, check=False):
    color = {"hi": HI, "mid": MID, "lo": LO}[lv]
    lvl = {"hi": "高风险", "mid": "中风险", "lo": "低风险"}[lv]
    tag = f'<span style="display:inline-flex;align-self:flex-start;align-items:center;height:22px;font-size:11.5px;background:{AMBER_SOFT};color:{AMBER};border-radius:5px;padding:0 8px;font-weight:700;margin-top:2px">待律师核查</span>' if check else ''
    return (f'<div style="border:1px solid {LINE};border-left:4px solid {color};border-radius:10px;padding:11px 14px;font-size:13px;display:flex;flex-direction:column;gap:5px;line-height:1.5">'
            f'<div style="display:flex;gap:8px;align-items:center"><span style="font-family:{MONO};font-weight:700;font-size:12.5px">{rid}</span>'
            f'<span style="font-size:11px;border-radius:5px;padding:1px 7px;color:#ffffff;font-weight:700;background:{color}">{lvl}</span>'
            f'<span style="margin-left:auto;color:{SUB};font-size:11.5px;font-family:{MONO}">{loc}</span></div>'
            f'<div style="font-weight:700;font-size:13.5px">{title}</div>'
            f'<div style="background:{QUOTEBG};border-radius:8px;padding:7px 10px;color:{SUB};border-left:3px solid {LINE};font-size:12.5px">{quote}</div>'
            f'<div style="color:{SUB}">{why}</div>'
            f'<div style="background:{FIXBG};border-radius:8px;padding:7px 10px;border-left:3px solid {OK};font-size:12.5px"><b style="color:{OK};font-size:11.5px;margin-right:6px">示范修改</b>{fix}</div>{tag}</div>')
run_right_body = (
    f'<div style="display:flex;flex-direction:column;gap:3px"><div style="font-weight:800;font-size:16px">合同风险审查报告 <span style="font-size:12px;color:{SUB};font-weight:500;font-family:{MONO}">v1.0</span></div>'
    f'<div style="font-size:12.5px;color:{SUB}">设备采购合同 · 立场：甲方风险优先 · 委托方：华南智造</div></div>'
    + tiles([("2", "高风险", HI), ("3", "中风险", MID), ("2", "低风险", LO), ("3", "待律师确认", OK)])
    + risk("hi", "R-001", "§7.2 · 第 11 页", "逾期付款违约金畸高（责任失衡）",
           "「甲方逾期付款的，每逾期一日按合同金额的 5% 向乙方支付违约金。」",
           "日 5% 年化超 1800%。虽可请求法院调减，但谈判与诉讼中我方全程被动。",
           "按逾期<b>金额</b>的 0.05% / 日计付，且累计不超过合同总额的 10%。")
    + risk("hi", "R-002", "§5.3 · 第 8 页", "乙方逾期交付完全免责（救济被架空）",
           "「乙方逾期交付的，不承担任何责任。」",
           "对方违约零成本，我方核心救济条款形同虚设。",
           "删除免责表述；增加对等违约金【待填写比例】及逾期 30 日我方单方解除权。")
    + risk("mid", "R-004", "§12.1 · 第 19 页", "争议管辖约定在对方所在地仲裁",
           "「因本合同发生的争议，提交乙方所在地仲裁委员会仲裁。」",
           "异地仲裁维权成本高、程序不可上诉。",
           "谈判改为我方所在地法院管辖【待律师确认策略】。"))
RUN = HEAD + frame(COLS3,
    sidebar("law") + topbar("合同审查助手", chips=("立场：甲方风险优先", "委托方：华南智造", "设备采购合同.pdf")) +
    chat_col(run_stream, inputbar("审查中… 完成后可说「环节 3 漏掉了验收风险」或「输出改成只要报告和 JSON」")) +
    right_col(right_head("交付物预览 · 合同风险审查报告", "live"), run_right_body)) + TAIL

# =====================================================================
# 02b 流程重构  (ProcessRebuild.dc.html)
# =====================================================================
SKILL_BG, SKILL_FG = "#eff4ff", LO          # 技能：蓝
DOG_BG, DOG_FG = AMBER_SOFT, AMBER          # 工作狗：琥珀
KNOW_BG, KNOW_FG = FIXBG, OK                # 行业 know-how：绿
USER_BG, USER_FG = "#f5f2ec", INK           # 你的输入：暖灰（官网 --code）
def chip(kind, label, prov=None, size=12):
    bg, fg, icon = {
        "skill": (SKILL_BG, SKILL_FG, ico("bolt", 13, SKILL_FG, 2)),
        "dog":   (DOG_BG, DOG_FG, f'<span style="font-size:12px;line-height:1">🐾</span>'),
        "know":  (KNOW_BG, KNOW_FG, ico("book", 13, KNOW_FG, 1.9)),
        "user":  (USER_BG, USER_FG, ico("user", 13, USER_FG, 1.9)),
    }[kind]
    p = f'<span style="font-weight:500;opacity:.75">· {prov}</span>' if prov else ''
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 8px;border-radius:6px;background:{bg};color:{fg};'
            f'font-size:{size}px;font-weight:700;white-space:nowrap">{icon}<span>{label}</span>{p}</span>')

def role_badge(role):
    if role == "auto":
        return f'<span style="display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:6px;background:{LINE};color:{INK};font-size:11.5px;font-weight:700;white-space:nowrap">{ico("bolt",12,INK,2)}自动</span>'
    if role == "review":
        return f'<span style="display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:6px;border:1.5px solid {AMBER};color:{AMBER};font-size:11.5px;font-weight:700;white-space:nowrap">{ico("user",12,AMBER,2)}人审</span>'
    return f'<span style="display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:6px;background:{AMBER};color:#ffffff;font-size:11.5px;font-weight:700;white-space:nowrap">{ico("user",12,"#ffffff",2)}人定</span>'

SLOT_LINE = "#cfd4dc"
def empty_slot():
    return (f'<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:22px;border:1.5px dashed {SLOT_LINE};border-radius:6px;color:{SUB};flex-shrink:0">{ico("plus",12,SUB,2)}</span>')

def step_card(n, name, what, role, chips, out=None, tag=None, width=None):
    human = role != "auto"
    numbg, numfg = (AMBER, "#ffffff") if human else (LINE, INK)
    border = f'1.5px solid {AMBER}' if human else f'1px solid {LINE}'
    o = f'<span style="margin-left:auto;font-size:11.5px;color:{SUB};white-space:nowrap;padding-left:6px">→ {out}</span>' if out else ''
    t = f'<span style="display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:6px;background:{AMBER_SOFT};color:{AMBER};font-size:11.5px;font-weight:700;white-space:nowrap">{ico("refresh",12,AMBER,2)}{tag}</span>' if tag else ''
    slots = (f'<span style="display:inline-flex;align-items:center;gap:5px;padding:2px 5px;border:1.5px dashed {SLOT_LINE};border-radius:8px;min-width:0;overflow:hidden">{"".join(chips)}{empty_slot()}</span>'
             if chips else empty_slot())
    w = f'width:{width}px;' if width else ''
    return (f'<div style="{w}background:{WHITE};border:{border};border-radius:10px;padding:6px 10px 6px 6px;display:flex;flex-direction:column;gap:4px;min-width:0">'
            f'<div style="display:flex;align-items:center;gap:6px;min-width:0"><span style="color:{SLOT_LINE};display:flex;flex-shrink:0">{ico("grip",16,SLOT_LINE,2.4)}</span>'
            f'<span style="width:20px;height:20px;border-radius:50%;background:{numbg};color:{numfg};font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">{n}</span>'
            f'<span style="font-weight:700;font-size:13.5px;white-space:nowrap">{name}</span><span style="font-size:12px;color:{SUB};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">{what}</span>'
            f'<span style="margin-left:auto;flex-shrink:0">{role_badge(role)}</span></div>'
            f'<div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;overflow:hidden;padding-left:22px">{slots}{t}{o}</div></div>')

def step_row(n, name, what, role, chips, out=None, tag=None, first=False, last=False):
    human = role != "auto"
    numbg = AMBER if human else LINE
    top = "50%" if first else "0"; bottom = "50%" if last else "0"
    rail = (f'<div style="position:relative"><span style="position:absolute;left:9px;top:{top};bottom:{bottom};width:2px;background:{LINE}"></span>'
            f'<span style="position:absolute;left:4px;top:50%;margin-top:-6px;width:12px;height:12px;border-radius:50%;background:{numbg};border:2px solid #ffffff;box-shadow:0 0 0 1px {LINE}"></span></div>')
    card = step_card(n, name, what, role, chips, out, tag)
    empty = '<div></div>'
    cells = (empty + card) if human else (card + empty)
    return f'<div style="display:grid;grid-template-columns:20px minmax(0, 1.75fr) minmax(0, 1fr);gap:0 14px;min-height:56px">{rail}{cells}</div>'

def inv_item(kind, label, prov, used):
    return (f'<div style="display:flex;align-items:center;gap:6px;min-height:30px"><span style="display:flex;color:{SLOT_LINE};flex-shrink:0">{ico("grip",14,SLOT_LINE,2.4)}</span>{chip(kind, label)}'
            f'<span style="font-size:11.5px;color:{SUB};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">{prov}</span>'
            f'<span style="margin-left:auto;font-size:11px;color:{SUB};white-space:nowrap;font-family:{MONO}">{used}</span></div>')

def inv_group(title, sub, items):
    return (f'<div style="display:flex;flex-direction:column;gap:2px"><div style="display:flex;align-items:baseline;gap:6px;padding:0 0 4px"><span style="font-size:12.5px;font-weight:800">{title}</span>'
            f'<span style="font-size:11.5px;color:{SUB}">{sub}</span></div>{"".join(items)}</div>')

inventory = (
    f'<aside style="width:324px;flex-shrink:0;background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:16px 16px 14px;display:flex;flex-direction:column;gap:14px;overflow:hidden">'
    f'<div style="display:flex;flex-direction:column;gap:3px"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:800;font-size:15px">组件库 · 本次装配 11 个</span>'
    f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 9px;border-radius:7px;border:1px solid {LINE};font-size:12px;color:{SUB};white-space:nowrap">{ico("plus",13,SUB,2)}新组件</span></div>'
    f'<span style="font-size:12px;color:{SUB};line-height:1.5">四类组件，拖进右侧模块的虚线插槽；颜色即来源，右列是它插在第几步。</span></div>'
    + inv_group("技能", "犬舍已有，直接复用", [
        inv_item("skill", "联网检索", "复用自 合同审查 · 环节 4", "第 1 步"),
        inv_item("skill", "快照比对", "新写", "第 2 步"),
        inv_item("skill", "来源核查", "复用自 合同审查 · 环节 4", "第 3 步"),
        inv_item("skill", "对抗审查", "×3 · 合同审查 环节 6", "第 5 步"),
    ])
    + inv_group("工作狗", "整只当作一步", [
        inv_item("dog", "数据看板", "犬舍 · 出周环比图", "第 4 步"),
    ])
    + inv_group("行业 know-how", "行业库给起点", [
        inv_item("know", "来源清单", "行业库 · 竞品 / 市场研究", "第 1 步"),
        inv_item("know", "对比维度 5 项", "行业库 + 你的 Q3", "第 3 步"),
    ])
    + inv_group("你的输入", "优先级最高，覆盖行业库默认", [
        inv_item("user", "Q1 竞品名单 3 家", "确认卡", "第 1 步"),
        inv_item("user", "历史周报 ×6", "材料→判据写法", "第 3、4 步"),
        inv_item("user", "H3 错误代价：中", "假设→验证强度", "第 5 步"),
        inv_item("user", "复盘回填", "每周 · 尚未开始", "第 3、4 步"),
    ])
    + f'<div style="margin-top:auto;background:{CHATBG};border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;color:{INK}"><b style="color:{AMBER}">装配规则</b>　先复用组件库里已有的技能和工作狗，再查行业库，最后才新写；你的材料和回答优先级最高，会覆盖行业库默认值。组件改一处，所有用它的工作狗一起变。</div>'
    f'</aside>')

before_pills = ''.join(
    f'<span style="display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;background:{LINE};color:{SUB};font-size:11.5px;white-space:nowrap">{ico("user",12,SUB,2)}{t}</span>'
    + (f'<span style="color:{SUB};font-size:12px">→</span>' if i < 4 else '')
    for i, t in enumerate(("实习生翻官网", "复制进表格", "分析师写周报", "总监审", "发到高管群")))
def stat_inline(v, k, color):
    return (f'<span style="display:inline-flex;align-items:baseline;gap:5px;white-space:nowrap"><span style="font-weight:800;font-size:17px;color:{color};line-height:1">{v}</span>'
            f'<span style="font-size:11.5px;color:{SUB}">{k}</span></span>')
head_block = (
    f'<div style="background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:12px 18px;display:flex;flex-direction:column;gap:9px">'
    f'<div style="display:flex;align-items:center;gap:10px"><span style="font-size:11px;font-weight:800;color:{AMBER};letter-spacing:.08em;flex-shrink:0">本质</span>'
    f'<span style="font-size:14.5px;font-weight:700;line-height:1.45;min-width:0">竞品周报不是「整理新闻」，是每周一告诉高管：三家竞品变了什么、该不该管。</span>'
    f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:14px;flex-shrink:0;padding-left:14px;border-left:1px solid {LINE}">'
    + stat_inline("5 步", "全人工", SUB) + f'<span style="color:{SUB};font-size:12px">→</span>' + stat_inline("7 步", "5 步自动", INK)
    + f'<span style="color:{SUB};font-size:12px">→</span>' + stat_inline("2 步", "人工", AMBER) + '</span></div>'
    f'<div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;overflow:hidden"><span style="font-size:11px;font-weight:800;color:{SUB};letter-spacing:.08em;flex-shrink:0;margin-right:4px">现在怎么做</span>{before_pills}'
    f'<span style="margin-left:auto;font-size:11.5px;color:{SUB};white-space:nowrap;padding-left:10px">推断 · H4</span></div></div>')

lane_head = (f'<div style="display:grid;grid-template-columns:20px minmax(0, 1.75fr) minmax(0, 1fr);gap:0 14px">'
             f'<div></div><div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;color:{SUB};letter-spacing:.06em;padding:0 2px 4px;border-bottom:2px solid {LINE}">{ico("bolt",14,SUB,2)}AI 自动</div>'
             f'<div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;color:{AMBER};letter-spacing:.06em;padding:0 2px 4px;border-bottom:2px solid {AMBER}">{ico("user",14,AMBER,2)}人</div></div>')
steps = [
    step_row(1, "采集", "三家竞品的官网公告、行业媒体报道，近 7 天", "auto",
             [chip("skill", "联网检索"), chip("know", "来源清单"), chip("user", "Q1 竞品名单")], out="带来源的素材 JSON", first=True),
    step_row(2, "变化检测", "与上周快照比对，只留新增和变化", "auto",
             [chip("skill", "快照比对"), chip("user", "上周快照", "数据契约")], out="变化清单"),
    step_row(3, "归因与打分", "每条变化：影响谁、要不要管", "auto",
             [chip("know", "对比维度"), chip("user", "历史周报判据"), chip("skill", "来源核查")], out="打分表"),
    step_row(4, "成稿", "高管摘要 + 团队附录 + 周环比图", "auto",
             [chip("user", "周报写法", "材料"), chip("dog", "数据看板"), chip("user", "Q2 受众")], out="周报草稿"),
    step_row(5, "自检与找茬", "对照 6 条验收标准，反方挑刺后修正", "auto",
             [chip("skill", "对抗审查", "×3"), chip("user", "H3 → 验证强度")], out="终稿 + 打钩"),
    step_row(6, "审摘要", "看摘要与变化清单", "review",
             [], tag="不通过 → 退回第 3 步"),
    step_row(7, "发送", "发到高管群", "decide",
             [], tag="人工确认点 · 发送前", last=True),
]
flywheel = (f'<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:{SUB};padding:2px 0 0 34px">{ico("refresh",14,OK,2)}'
            f'<span><b style="color:{OK}">复盘飞轮</b>　每周复盘：漏报、误报、被高管打回的点 → 回填第 3 步判据与第 4 步写法 → 改版必跑回归，达标才发布</span></div>')
proposal = (
    f'<div style="flex-grow:1;min-width:0;display:flex;flex-direction:column;gap:10px">'
    + head_block + lane_head
    + f'<div style="display:flex;flex-direction:column;gap:5px">{"".join(steps)}</div>'
    + flywheel + '</div>')
rebuild_bot = (
    f'<div style="display:flex;align-items:center;gap:12px;background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:8px 16px">'
    f'<span style="font-size:12px;font-weight:800;color:{AMBER};white-space:nowrap">提示狗 🐕</span>'
    f'<span style="font-size:14px;line-height:1.5;min-width:0">我把这件事切成 7 个模块：5 个自动、1 个人审、1 个人定（发送前）。每个模块的虚线插槽里是它用的组件，左边是组件库。拖组件、拖模块换序，或直接「按这个建」。</span>'
    f'<span style="margin-left:auto;display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:10px;border:1px solid {LINE};background:{CHATBG};font-size:13px;color:{SUB};white-space:nowrap">换个切法</span>'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:13.5px;white-space:nowrap">{ico("check",15,"#ffffff",2.2)}按这个建</span></div>')
rebuild_main = (
    f'<main style="min-width:0;display:flex;flex-direction:column;background:{CHATBG}">'
    f'<div style="flex-grow:1;min-height:0;padding:14px 28px 12px;display:flex;flex-direction:column;gap:10px;overflow:hidden">{rebuild_bot}'
    f'<div style="display:flex;gap:16px;align-items:stretch;min-height:0;flex-grow:1">{inventory}{proposal}</div></div>'
    + inputbar("也可以说：「第 6 步改成自动」「第 3 步用我的判据」「第 4 步不要图」") + '</main>')
REBUILD = HEAD + frame(COLS2, sidebar("dog") + topbar("提示狗 · 竞品分析工作流", chips=("L3 提示链", "流程重构 · 构建前")) + rebuild_main) + TAIL

# =====================================================================
# 06 组件表  (Components.dc.html)
# =====================================================================
def spec(cname, zh, body, tokens, span=1):
    sp = f'grid-column:span {span};' if span > 1 else ''
    return (f'<div style="{sp}background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:16px 18px 14px;display:flex;flex-direction:column;gap:12px;min-width:0">'
            f'<div style="display:flex;align-items:baseline;gap:10px"><span style="font-weight:800;font-size:14px">{zh}</span><span style="font-family:{MONO};font-size:11.5px;color:{SUB}">{cname}</span></div>'
            f'<div style="display:flex;flex-direction:column;gap:10px;min-width:0">{body}</div>'
            f'<div style="font-family:{MONO};font-size:11px;color:{SUB};line-height:1.6;border-top:1px solid {LINE};padding-top:8px">{tokens}</div></div>')

def swatch(hexv, name):
    return (f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0"><span style="display:block;height:34px;border-radius:8px;background:{hexv};border:1px solid {LINE}"></span>'
            f'<span style="font-size:11.5px;font-weight:600;white-space:nowrap">{name}</span><span style="font-family:{MONO};font-size:10.5px;color:{SUB}">{hexv}</span></div>')
sw = [(AMBER,"主色 琥珀"),(AMBER_SOFT,"浅琥珀"),(SIDE,"侧栏"),(SIDE_ON,"侧栏激活"),(INK,"正文"),(SUB,"次要"),(LINE,"分割线"),(CHATBG,"页面底"),(OK,"达标 / know-how"),(HI,"高风险"),(LO,"技能 / 低风险"),(USER_BG,"你的输入")]
palette_body = f'<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:10px">{"".join(swatch(h,n) for h,n in sw)}</div>'

type_body = (
    f'<div style="display:flex;flex-direction:column;gap:6px">'
    f'<div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:26px;font-weight:800;letter-spacing:-.01em">页面标题</span><span style="font-family:{MONO};font-size:11px;color:{SUB}">26 / 800</span></div>'
    f'<div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:16px;font-weight:800">卡片标题</span><span style="font-family:{MONO};font-size:11px;color:{SUB}">16 / 800</span></div>'
    f'<div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:14px">正文与对话</span><span style="font-family:{MONO};font-size:11px;color:{SUB}">14 / 400 · lh 1.6</span></div>'
    f'<div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:12.5px;color:{SUB}">辅助说明</span><span style="font-family:{MONO};font-size:11px;color:{SUB}">12.5 / 400</span></div>'
    f'<div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:{SUB}">标签 · 区块名</span><span style="font-family:{MONO};font-size:11px;color:{SUB}">11.5 / 700 · ls .06em</span></div></div>'
    f'<div style="display:flex;gap:10px;align-items:flex-end;padding-top:4px">'
    + ''.join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><span style="display:block;width:{36}px;height:{36}px;border:1.5px solid {AMBER};border-radius:{r}px;background:{AMBER_SOFT}"></span><span style="font-family:{MONO};font-size:10.5px;color:{SUB}">{r} {n}</span></div>' for r,n in ((14,"卡片"),(10,"按钮"),(8,"标签"),(6,"徽章"),(999,"胶囊")))
    + '</div>')

btn_body = (
    f'<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:14px">{ico("check",16,"#ffffff",2.2)}主按钮 44</span>'
    f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 16px;border-radius:8px;background:{AMBER};color:#ffffff;font-weight:700;font-size:13px">紧凑 36</span>'
    f'<span style="display:inline-flex;align-items:center;height:40px;padding:0 14px;border-radius:10px;border:1px solid {LINE};background:{CHATBG};font-size:13.5px;color:{SUB}">次按钮</span>'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {AMBER};color:{AMBER};font-size:13px;font-weight:600">{ico("download",16,AMBER)}线框强调</span></div>'
    f'<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
    f'<span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:{AMBER};color:#ffffff">{ico("send",20)}</span>'
    f'<span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;color:{SUB};border:1px solid {LINE};background:{CHATBG}">{ico("clip",20)}</span>'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;color:{SUB};font-size:13px">{ico("clock",18)}文字按钮</span>'
    f'<span style="display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 10px;border:1px solid {LINE};border-radius:8px;font-size:12px;color:{SUB}">{ico("edit",14,SUB)}改</span></div>')

badge_body = (
    f'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">{role_badge("auto")}{role_badge("review")}{role_badge("decide")}'
    f'<span style="font-family:{MONO};font-size:11px;color:{SUB}">RoleBadge</span></div>'
    f'<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">{ok_badge}{warn_badge}</div>'
    f'<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">'
    f'<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:{OK};font-weight:700"><span style="width:7px;height:7px;border-radius:50%;background:{OK}"></span>实时生成</span>'
    f'<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:{OK};font-weight:700">{ico("check",14,OK,2.2)}已完成</span>'
    f'<span style="font-size:11px;font-weight:700;color:{AMBER};background:{AMBER_SOFT};border-radius:6px;padding:2px 8px">新</span>'
    f'<span style="font-size:11px;background:{AMBER};color:#ffffff;border-radius:5px;padding:2px 8px;font-weight:700">DEMO</span>'
    f'<span style="font-size:11px;border-radius:5px;padding:1px 7px;color:#ffffff;font-weight:700;background:{HI}">高风险</span>'
    f'<span style="font-size:11px;border-radius:5px;padding:1px 7px;color:#ffffff;font-weight:700;background:{MID}">中风险</span></div>')

chip_body = (
    f'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">{chip("skill","技能")}{chip("dog","工作狗")}{chip("know","行业 know-how")}{chip("user","你的输入")}</div>'
    f'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">{chip("skill","对抗审查","×3")}{chip("user","周报写法","你的材料")}{empty_slot()}<span style="font-family:{MONO};font-size:11px;color:{SUB}">带来源 · 空插槽</span></div>'
    f'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
    f'<span style="display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;background:{LINE};color:{SUB};font-size:11.5px">{ico("user",12,SUB,2)}现流程步骤</span>'
    f'<span style="display:inline-flex;align-items:center;height:28px;border:1px solid {LINE};background:{CHATBG};border-radius:8px;padding:0 11px;font-size:12.5px;color:{SUB}">顶栏上下文</span>'
    f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;border:1px solid {AMBER};background:{AMBER_SOFT};color:{AMBER};font-size:13.5px;font-weight:700">筛选 · 选中</span>'
    f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 16px;border-radius:999px;background:{WHITE};border:1px solid {LINE};font-size:13.5px;color:{SUB}">示例胶囊</span></div>')

module_body = (
    f'<div style="display:grid;grid-template-columns:minmax(0, 1.6fr) minmax(0, 1fr);gap:12px">'
    + step_card(1, "采集", "三家竞品的官网公告、行业媒体报道", "auto", [chip("skill","联网检索"), chip("know","来源清单"), chip("user","Q1 竞品名单")], out="素材 JSON")
    + step_card(6, "审摘要", "看摘要与变化清单", "review", [], tag="不通过 → 退回第 3 步")
    + f'</div>'
    f'<div style="display:grid;grid-template-columns:minmax(0, 1.6fr) minmax(0, 1fr);gap:12px">'
    + step_card(7, "发送", "发到高管群", "decide", [chip("user","H1 周一 09:00")], tag="人工确认点 · 发送前")
    + f'<div style="border:1.5px dashed {SLOT_LINE};border-radius:10px;display:flex;align-items:center;justify-content:center;gap:8px;color:{SUB};font-size:13px;min-height:56px">{ico("plus",16,SUB,2)}新模块</div></div>')

option_body = (
    f'<div style="display:flex;flex-direction:column;gap:2px">'
    + option("A. 固定 3–5 家核心竞品", "范围稳定才能做周环比", True) + option("B. 每周自动发现新玩家") + option("C. 其他（一句话说明）")
    + f'</div>'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12.5px;color:{AMBER};font-weight:800;letter-spacing:.04em">确认卡片 · 仅 1 轮</span><span style="font-size:12.5px;color:{SUB}">已按我的理解预填 ★，不符再改</span></div>')

msg_body = (
    f'<div style="display:flex;flex-direction:column;gap:10px;background:{CHATBG};border-radius:10px;padding:12px">'
    + user_msg(filechip("设备采购合同.pdf · 2.4 MB") + "<div>审查这份合同。</div>")
    + bot_msg("提示狗 🐕", "生效：全部 ★。开始构建<b>资产包</b>。")
    + f'<div style="align-self:flex-start;display:flex;gap:6px;align-items:center;background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:12px 16px">'
      f'<span style="width:7px;height:7px;border-radius:50%;background:{SUB}"></span><span style="width:7px;height:7px;border-radius:50%;background:{SUB};opacity:.6"></span><span style="width:7px;height:7px;border-radius:50%;background:{SUB};opacity:.3"></span></div></div>')

stage_body = stages_panel("流水线", [stage("1 文件解析", "28 页 · 142 个条款", "done"), stage("2 事实提取", "复核中", "run"), stage("3 风险扫描", "待执行", "todo")])

tile_body = tiles([("2", "高风险", HI), ("3", "中风险", MID), ("✓", "验收标准先行", OK), ("6 / 6", "试跑通过", INK)])

risk_body = risk("hi", "R-001", "§7.2 · 第 11 页", "逾期付款违约金畸高（责任失衡）",
                 "「甲方逾期付款的，每逾期一日按合同金额的 5% 向乙方支付违约金。」",
                 "日 5% 年化超 1800%，谈判与诉讼中我方全程被动。",
                 "按逾期<b>金额</b>的 0.05% / 日计付，累计不超过合同总额的 10%。", check=True)

def side_item(av, name, sub, on=False, new=False):
    bg = SIDE_ON if on else "transparent"; col = "#ffffff" if on else SIDE_TXT
    nb = f'<span style="margin-left:auto;font-size:11px;font-weight:700;color:{AMBER};background:{SIDE_AV};border-radius:6px;padding:2px 7px">新</span>' if new else ''
    return (f'<div style="display:flex;gap:11px;align-items:center;min-height:48px;padding:6px 10px;border-radius:10px;background:{bg};color:{col};font-size:14px;line-height:1.3">'
            f'<span style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;background:{SIDE_AV};flex-shrink:0">{av}</span>'
            f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-weight:600;white-space:nowrap">{name}</span><span style="font-size:11.5px;color:{SIDE_SMALL};white-space:nowrap">{sub}</span></span>{nb}</div>')
side_body = (
    assumption("H2", "数据以公开信息为限", "未提及内部数据源")
    + f'<div style="background:{SIDE};border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:2px">'
      f'<div style="font-size:11px;letter-spacing:.1em;color:{SIDE_SEC};padding:4px 10px 6px;font-weight:700">我的数字员工</div>'
    + side_item("🐕", "提示狗", "提示词 · SOP · 工作流", on=True) + side_item("📈", "竞品分析", "每周一 · 竞品周报", new=True)
    + f'<div style="display:flex;gap:11px;align-items:center;min-height:44px;padding:6px 10px;border-radius:10px;color:{SIDE_TXT};font-size:14px">{ico("puzzle",20,SIDE_TXT)}<span style="font-weight:600">组件库</span><span style="margin-left:auto;font-size:12px;color:{SIDE_SMALL}">12</span></div></div>')

comp_grid = (
    spec("Palette", "色板", palette_body, "主色仅用于：主按钮、选中态、确认卡边框、人类触点。语义色只在风险等级与四类来源上出现。")
    + spec("Type · Radius", "字号与圆角", type_body, "font: -apple-system, PingFang SC, Microsoft YaHei · mono: ui-monospace（编号、hash、版本号）")
    + spec("Button", "按钮", btn_body, "高度 44 / 40 / 36 · 圆角 10（44/40）/ 8（36）· 主按钮一屏只出现一次")
    + spec("InputBar", "输入栏", f'<div style="border:1px solid {LINE};border-radius:12px;overflow:hidden">{inputbar("说编号即可调整：如「环节 2 加价格监控」「H2 不对」")}</div>', "附件 44×44 · 输入框 min-h 44 · 「直接做」= 无人值守开关（激活态浅琥珀）· 发送 44×44", span=2)
    + spec("RoleBadge · Status", "角色徽章与状态", badge_body, "自动=灰 · 人审=琥珀线框 · 人定=琥珀实底；状态徽章绿=达标 / 琥珀=待处理")
    + spec("SourceChip · Slot", "来源标签与插槽", chip_body, "技能 #eff4ff/#2563eb · 工作狗 #fdf0dd/#d97706 · know-how #f0faf2/#16a34a · 你的输入 #f5f2ec/#1e232b · 高 24 · 圆角 6 · 插槽虚线 #cfd4dc")
    + spec("StepModule", "步骤模块", module_body, "grip = 可拖动换序 · 圆点编号灰/琥珀区分 AI/人 · 虚线框 = 插槽，末尾常驻空槽 · 人类模块 1.5px 琥珀边框 · 标签 tag 用于退回与确认点", span=2)
    + spec("OptionRow", "确认卡片选项", option_body, "16px 单选点 · 选中态 #fdf0dd 底 + 琥珀实心点 · ★ 理由另起一行 12.5 · 每题末尾必有「其他」逃生口")
    + spec("Message", "消息气泡", msg_body, "用户=琥珀实底右下角 4 · 机器人=白底线框左下角 4 · who 标签 12/800 琥珀 · 文件 chip 半透明白")
    + spec("StageRow", "流水线行", stage_body, "done=绿勾 · run=琥珀旋转 · todo=虚线圆 + 38% 透明 · 右侧 detail 12.5")
    + spec("Tile", "指标块", tile_body, "4 列 grid · 数值 19/800 语义色 · 说明 11.5 次要色")
    + spec("RiskCard", "风险卡", risk_body, "左侧 4px 等级色边（沿用官网 demo）· 编号 mono · 原文引用灰底 · 示范修改绿底 · 待律师核查 tag")
    + spec("AssumptionRow · SidebarItem", "假设行与侧栏项", side_body, "H 编号 mono 琥珀 · 每条带依据 · 「改」按钮 28 · 侧栏项 48 · 激活 #2e3542 · 头像 32 圆角 8"))

COMPONENTS = HEAD + (
    f'<div style="width:1440px;height:1700px;overflow:hidden;background:{CHATBG};color:{INK};padding:36px 40px;display:flex;flex-direction:column;gap:20px">'
    f'<div style="display:flex;align-items:flex-end;gap:16px"><div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:24px;font-weight:800;letter-spacing:-.01em">组件表</span>'
    f'<span style="font-size:14px;color:{SUB}">六个屏幕全部由这些组件拼装；名称是实现时的组件名，底部一行是它的 token。改组件即改全站。</span></div>'
    f'<span style="margin-left:auto;font-family:{MONO};font-size:12px;color:{SUB}">PromptDog 工作台 · v0.1 · 2026-09-07</span></div>'
    f'<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:18px;align-items:start">{comp_grid}</div></div>') + TAIL

# ---- write files + canvas.json ----
W, H, GX, GY = 1440, 900, 120, 160
def build(extra_files=None, extra_boards=None, extra_notes=None):
  files = {"Main.dc.html": MAIN, "Confirm.dc.html": CONFIRM, "ProcessRebuild.dc.html": REBUILD, "Deliver.dc.html": DELIVER, "Kennel.dc.html": KENNEL, "WorkdogRun.dc.html": RUN, "Components.dc.html": COMPONENTS}
  files.update(extra_files or {})
  import re as _re
  def canon(html):  # expand self-closing SVG children so the template parser sees canonical HTML
    return _re.sub(r'<(path|circle|rect|line|polyline|polygon)(\b[^>]*?)\s*/>', r'<\1\2></\1>', html)
  for name, html in files.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(canon(html))
  canvas = {
    "artboards": [
        {"file": "Main.dc.html",           "x": 0,              "y": 0,      "w": W, "h": H, "title": "01 首页 · 一句话开始"},
        {"file": "Confirm.dc.html",        "x": W + GX,         "y": 0,      "w": W, "h": H, "title": "02 确认卡片 · 仅 1 轮"},
        {"file": "ProcessRebuild.dc.html", "x": 2 * (W + GX),   "y": 0,      "w": W, "h": H, "title": "02b 流程重构 · 确认卡之后、构建之前"},
        {"file": "Deliver.dc.html",        "x": 3 * (W + GX),   "y": 0,      "w": W, "h": H, "title": "03 资产包交付"},
        {"file": "Kennel.dc.html",         "x": 0,              "y": H + GY, "w": W, "h": H, "title": "04 犬舍"},
        {"file": "WorkdogRun.dc.html",     "x": W + GX,         "y": H + GY, "w": W, "h": H, "title": "05 工作狗上岗 · 合同审查"},
        {"file": "Components.dc.html",     "x": 0,              "y": 2 * (H + GY), "w": W, "h": 1700, "title": "06 组件表 · 所有屏幕由这些组件拼装"},
    ],
    "annotations": [
        {"id": "brief", "x": 0, "y": -230, "w": 640,
         "text": "PromptDog 工作台 · 6 屏静态高保真 + 1 张组件表 + 1 个可交互的流程画布\n视觉沿用官网：琥珀 #d97706 / 浅琥珀 #fdf0dd / 侧栏 #1b1f27 / 分割线 #e5e8ee / 圆角 14·10·8 / 系统中文字体栈\n上排 01→02→02b→03 是「一句话造工作狗」主流程；中排 04 犬舍、05 工作狗上岗；下排 06 组件表、07 流程画布（点进去或展开后可拖拽、拼接、连线）\n文案与数字均取自官网 demo 场景，属示例数据"},
        {"id": "components-note", "x": W + GX, "y": 2 * (H + GY), "w": 560,
         "text": "06 组件表：组件化落在两层\n产品层——工作狗 = 模块（步骤）× 组件（技能 / 工作狗 / know-how / 你的输入）；组件进库，改一处全站变；侧栏新增「组件库」入口\n设计层——13 个 UI 组件覆盖全部六屏，每个标了 token；前端按这张表建组件库即可，屏幕只是组合"},
        {"id": "rebuild-note", "x": 2 * (W + GX), "y": -260, "w": 640,
         "text": "02b 流程重构：左栏「装进流程的东西」按四类来源列清单（技能 = 蓝 / 工作狗 = 琥珀 / 行业 know-how = 绿 / 你的输入 = 暖灰），右侧双泳道（AI 自动 / 人）每一步挂同色标签，标签即来源，右列写明用在第几步\n装配优先级：复用犬舍 > 行业库 > 新写；你的材料与回答覆盖默认值\n人审可退回、发送前设人工确认点、复盘回填到具体步骤——这三条把 SKILL 的规则画进了流程"},
        {"id": "rule-card", "x": 3 * (W + GX), "y": -150, "w": 520,
         "text": "规则对应：卡片是纠错窗口不是审批——03 屏的假设清单 H1–H3 带「改」按钮；确认卡片顶部写明「仅 1 轮」；输入栏常驻「直接做」开关即无人值守入口"},
    ],
    "launch": {"view": "canvas"},
  }
  canvas["artboards"] += (extra_boards or [])
  canvas["annotations"] += (extra_notes or [])
  with open(os.path.join(OUT, "canvas.json"), "w", encoding="utf-8") as f:
    json.dump(canvas, f, ensure_ascii=False, indent=2)
  for name, html in files.items():
    print(f"{name}: {len(html.encode('utf-8'))/1024:.1f} KB")
  print("canvas.json written")

if __name__ == "__main__":
  build()
