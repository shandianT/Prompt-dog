# -*- coding: utf-8 -*-
"""12 用户旅程 · 每一步（Journey.dc.html）
把 交互流程.md 的主线画成一屏：四个阶段、十二步，每步写清在哪屏、你做什么、系统做什么、停不停。"""
from gen import (ico, sidebar, topbar, frame, HEAD, TAIL, COLS2,
                 AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, LO, MONO)

# (步号, 名称, 屏, 你做, 系统做, 停机文案 or None)
PHASES = [
    ("准备", "一次性 · 5 分钟", [
        ("0", "安装", "本机", "文件夹放进工作区，AGENTS.md 加一段路由", "下次会话自动读到，不装依赖", None),
    ]),
    ("画出现状", "30 分钟", [
        ("1", "第一次打开", "00", "看五步时间线，或直接跳过", "记住进度，做完第 1 步收成顶栏 chip", None),
        ("2", "说一段流程 + 贴材料", "01.2 → 01.3", "谁做什么、卡在哪；把文档聊天记录拖进来", "有材料反推现状并记来源，没材料按行业库出草稿标 H", None),
        ("3", "读图", "07 · 08", "只是看。三十秒答五问", "无", None),
        ("4", "纠错", "07 → 07.2", "说节点编号，或把步骤拖过泳道边界", "跨泳道即改「谁来做」；不可逆前的人定节点受保护", None),
    ]),
    ("建第一只狗", "30 分钟", [
        ("5", "按这个建", "07.3 → 02", "点主按钮，或说「先建标书撰写」", "取打包建议第一只转判级；缺口没解决也能建", "停 · 无人时取楔子 ★"),
        ("6", "确认卡", "02 → 02.2", "可以什么都不做；要改回「1C」", "最多两题架构级，其余转 H；产物同时在生成", None),
        ("7", "交付与入犬舍", "03 → 04", "点「入犬舍」", "资产包落盘，在画布上占一个节点并记服务流程节点号", None),
    ]),
    ("跑起来，回到图上", "1 小时 + 25 分钟", [
        ("8", "上岗一次", "05.1 → 05.2", "用一份真实材料跑启动指令", "一轮一环节，验收打钩写回 验收清单.json", None),
        ("9", "人工确认点", "05.3", "通过 / 退回某环节 / 先看", "对外发送前暂停，持久化等你", "停 · 不回复就一直停"),
        ("10", "复盘", "10.1 / 10.2", "说「复盘」", "读日志不重跑；规律进日志顶部；回归没过不许发布", "停 · 改版 / 不改版"),
        ("11", "回到图上", "07.4 · 08", "切「对照现状」，定下一只建谁", "标出原来怎么做，卡点 2 → 0", None),
    ]),
]

def _card(no, name, screen, you, sys_, stop):
    stop_html = (f'<div style="display:inline-flex;align-items:center;gap:4px;height:19px;padding:0 7px;border-radius:5px;'
                 f'background:{AMBER_SOFT};color:{AMBER};font-size:10px;font-weight:700;white-space:nowrap;align-self:flex-start">'
                 f'{ico("flag",11,AMBER,2.4)}{stop}</div>') if stop else ''
    bd = AMBER if stop else LINE
    return (f'<div style="border:{"1.5px" if stop else "1px"} solid {bd};background:{WHITE};border-radius:10px;'
            f'padding:9px 11px;display:flex;flex-direction:column;gap:4px;min-width:0">'
            f'<div style="display:flex;align-items:center;gap:6px;min-width:0">'
            f'<span style="width:19px;height:19px;border-radius:50%;background:{AMBER};color:#ffffff;font-size:10.5px;'
            f'font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">{no}</span>'
            f'<span style="font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{name}</span>'
            f'<span style="margin-left:auto;font-family:{MONO};font-size:10px;color:{SUB};flex-shrink:0">{screen}</span></div>'
            f'<div style="display:flex;gap:5px;font-size:11px;line-height:1.45"><span style="color:{AMBER};font-weight:700;flex-shrink:0">你</span>'
            f'<span style="min-width:0">{you}</span></div>'
            f'<div style="display:flex;gap:5px;font-size:11px;line-height:1.45;color:{SUB}"><span style="font-weight:700;flex-shrink:0">它</span>'
            f'<span style="min-width:0">{sys_}</span></div>{stop_html}</div>')

def _phase(i, title, sub, cards):
    arrow = ('' if i == 0 else
             f'<div style="display:flex;align-items:flex-start;padding-top:30px;flex-shrink:0;color:#c3c9d2;'
             f'font-size:19px;font-weight:300;line-height:1">›</div>')
    return arrow + (
        f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px">'
        f'<div style="display:flex;flex-direction:column;gap:1px;padding-left:2px">'
        f'<span style="font-size:13px;font-weight:800">{title}</span>'
        f'<span style="font-size:11px;color:{SUB}">{sub}</span></div>'
        + ''.join(_card(*c) for c in cards) + '</div>')

rules = ''.join(
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:8px;'
    f'background:{WHITE};border:1px solid {LINE};font-size:12px;color:{SUB}">{ico(i,14,AMBER,2)}<b style="color:{INK};font-weight:600">{t}</b>{d}</span>'
    for i, t, d in [("bolt", "先做出来再纠错", "不先问问题"),
                    ("edit", "纠错只有一种语法", "说编号"),
                    ("flag", "只在不可逆动作前停", "其余走 ★ 默认")])

def _stop(t, d):
    return (f'<div style="flex:1;min-width:0;border:1px solid {LINE};border-left:3px solid {AMBER};border-radius:9px;'
            f'padding:8px 12px;display:flex;flex-direction:column;gap:1px">'
            f'<span style="font-size:12px;font-weight:700">{t}</span>'
            f'<span style="font-size:11.5px;color:{SUB};line-height:1.45">{d}</span></div>')

def _exc(t, d):
    return (f'<div style="display:flex;gap:7px;align-items:flex-start;font-size:11.5px;line-height:1.5">'
            f'<span style="color:{HI};font-weight:700;flex-shrink:0;white-space:nowrap">{t}</span>'
            f'<span style="color:{SUB};min-width:0">{d}</span></div>')

journey_main = (
    f'<main style="min-width:0;overflow:hidden;padding:22px 28px 20px;display:flex;flex-direction:column;gap:14px;background:{CHATBG}">'
    f'<div style="display:flex;align-items:flex-end;gap:16px">'
    f'<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:22px;font-weight:800;letter-spacing:-.01em">用户怎么用 · 每一步</span>'
    f'<span style="font-size:13px;color:{SUB}">第一周只做一条流程、一只狗。每一步都写清在哪屏、你做什么、它做什么、停不停。</span></div>'
    f'<div style="margin-left:auto;display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end">{rules}</div></div>'
    f'<div style="display:flex;gap:12px;align-items:flex-start">'
    + ''.join(_phase(i, t, s, c) for i, (t, s, c) in enumerate(PHASES)) +
    f'</div>'
    f'<div style="display:flex;flex-direction:column;gap:7px">'
    f'<span style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">全流程只有三个地方会停</span>'
    f'<div style="display:flex;gap:10px">'
    + _stop("「按这个建」", "决定先建哪只狗。无人时取楔子 ★ 那只，继续")
    + _stop("人工确认点", "对外发送 / 提交 / 付款前。不回复就一直停，不会自动执行")
    + _stop("「改版 / 不改版」", "复盘之后。不回复就不改版，日志照常累积")
    + '</div></div>'
    f'<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:4px 22px;border-top:1px solid {LINE};padding-top:9px">'
    + _exc("入口判错", "回「我要的是图」，改路由重出，不重问")
    + _exc("材料不足", "按行业惯例出草稿并标 H，第二次再补")
    + _exc("中途改主意", "重算复杂度，变级则换产物形态")
    + _exc("上岗止损", "同时给已达标部分 + 未达标清单 + 卡点报告")
    + _exc("回归不达标", "发布门槛拦住，改完重跑才能发")
    + _exc("说「直接做」", "卡片全折进 H 假设，一次交付")
    + '</div></main>')

JOURNEY = HEAD + frame(COLS2, sidebar("dog") +
    topbar("用户怎么用 · 每一步", chips=("12 步", "3 个停机点", "示例：投标流程"), actions=[("逐步规格见 交互流程.md · 评审见 逐步评审.md", "text", "book")]) +
    journey_main) + TAIL
