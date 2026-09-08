# -*- coding: utf-8 -*-
"""00 首次引导 · 从 0 到 1（Onboarding.dc.html）
第一周把一条流程跑起来：五步，每步有输入、产出、耗时、停在哪。右栏：你需要准备的 / 什么时候用哪个入口 / 常见误区。"""
from gen import (ico, sidebar, topbar, right_head, right_col, frame, HEAD, TAIL, COLS3, AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, MONO)

STEPS = [
    ("done", "画出现状", "说一段流程，把材料丢进来", "泳道图 + 五问数字 + 诊断清单 + 打包建议", "01 → 07", "30 分钟", "停在「按这个建」", "你只做纠错：说节点编号，拖一拖人机边界"),
    ("now", "建第一只狗", "点「按这个建」，或说「先建标书撰写」", "资产包 + 验收清单.json + 上手指南", "02 → 03 → 04", "30 分钟", "停在「入犬舍」", "最多问 1–2 题会改架构的事，其余按 ★"),
    ("todo", "上岗一次", "拖进工作区，用一份真实材料跑启动指令", "三件套落盘 输出/；日志开始累积", "05", "1 小时", "只在递交前停（待确认）", "通过或退回到某环节，其余不用管"),
    ("todo", "复盘", "说「复盘」", "日志 → 已知规律；改版后跑回归", "04 → 10", "15 分钟", "停在「改版 / 不改版」", "不对的地方说环节号，只改那一处"),
    ("todo", "回到图上", "打开流程画布，切「对照现状」", "卡点 2 → 0 的变化；下一只狗的打包建议", "07 · 汇报模式", "10 分钟", "停在「下一只建谁」", "给老板看的一屏，30 秒答五问"),
]
def dot(state, n):
    if state == "done":
        return f'<span style="width:30px;height:30px;border-radius:50%;background:{OK};display:flex;align-items:center;justify-content:center;flex-shrink:0">{ico("check",16,"#ffffff",2.4)}</span>'
    if state == "now":
        return f'<span style="width:30px;height:30px;border-radius:50%;background:{AMBER};color:#ffffff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 0 5px {AMBER_SOFT}">{n}</span>'
    return f'<span style="width:30px;height:30px;border-radius:50%;border:1.5px dashed {LINE};color:{SUB};font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:{WHITE}">{n}</span>'
def chipm(t, icon=None):
    i = ico(icon, 13, SUB, 1.8) if icon else ''
    return f'<span style="display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:6px;background:{CHATBG};border:1px solid {LINE};font-size:11.5px;color:{SUB};white-space:nowrap">{i}{t}</span>'
def step_row(i, st):
    state, title, inp, out, screens, mins, stop, tip = st
    on = state == "now"
    bd = AMBER if on else LINE
    cta = (f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:8px;background:{AMBER};color:#ffffff;font-size:13px;font-weight:700;white-space:nowrap">{ico("bolt",15,"#ffffff",2)}开始这一步</span>' if on
           else (f'<span style="font-size:12px;color:{OK};font-weight:700;white-space:nowrap">已完成 · 第 1 天</span>' if state == "done" else f'<span style="font-size:12px;color:{SUB};white-space:nowrap">第 {"2" if i < 4 else "5"} 天</span>'))
    return (f'<div style="display:flex;gap:14px;align-items:flex-start">'
            f'<div style="display:flex;flex-direction:column;align-items:center;gap:0;padding-top:14px">{dot(state, i)}<span style="width:2px;flex-grow:1;min-height:22px;background:{LINE};margin-top:6px"></span></div>'
            f'<div style="flex-grow:1;min-width:0;background:{WHITE};border:1.5px solid {bd};border-radius:14px;padding:12px 16px;display:flex;flex-direction:column;gap:7px;{"box-shadow:0 8px 24px rgba(217,119,6,.10)" if on else ""}">'
            f'<div style="display:flex;align-items:center;gap:10px"><span style="font-weight:800;font-size:15px">第 {i} 步 · {title}</span>'
            f'<span style="font-size:12.5px;color:{SUB}">{inp}</span><span style="margin-left:auto">{cta}</span></div>'
            f'<div style="display:flex;gap:10px;align-items:baseline;font-size:13px"><span style="font-size:11.5px;font-weight:700;color:{SUB};flex-shrink:0">你得到</span><span>{out}</span></div>'
            f'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">{chipm("屏幕 " + screens, "grid")}{chipm(mins, "clock")}{chipm(stop, "flag")}<span style="font-size:12px;color:{SUB};margin-left:4px">{tip}</span></div></div></div>')
main = (
    f'<main style="min-width:0;display:flex;flex-direction:column;background:{CHATBG};overflow:hidden">'
    f'<div style="padding:22px 28px 0;display:flex;flex-direction:column;gap:4px">'
    f'<div style="display:flex;align-items:baseline;gap:12px"><span style="font-size:24px;font-weight:800;letter-spacing:-.01em">从 0 到 1 · 第一周把一条流程跑起来</span><span style="font-size:13px;color:{SUB}">示例：投标流程</span></div>'
    f'<div style="font-size:14px;color:{SUB};line-height:1.6">五步，每步都有明确的产出和停下来的地方。做完第一步你就有一张能拿给老板看的图；不必先写文档，不必把材料整理完整，也不用一次建很多只狗。</div></div>'
    f'<div style="flex-grow:1;min-height:0;padding:14px 28px 12px;display:flex;flex-direction:column;gap:2px;overflow:hidden">'
    + ''.join(step_row(i + 1, st) for i, st in enumerate(STEPS)) +
    f'</div>'
    f'<div style="margin:0 28px 18px;background:{WHITE};border:1px solid {LINE};border-radius:12px;padding:10px 16px;display:flex;gap:18px;align-items:center;font-size:12.5px;color:{SUB}">'
    f'<span style="font-weight:800;color:{INK};font-size:12px;letter-spacing:.06em">节奏</span><span>第 1 周：1 条流程、1 只狗</span><span>第 2 周：第二只狗，打通一个系统</span><span>第 1 个月：流程图上 AI 段 ≥ 50%，卡点归零</span></div></main>')

def need(t, sub, must=True):
    tag = f'<span style="font-size:10.5px;background:{AMBER_SOFT};color:{AMBER};border-radius:5px;padding:1px 6px;font-weight:700">必需</span>' if must else f'<span style="font-size:10.5px;background:{CHATBG};color:{SUB};border-radius:5px;padding:1px 6px;font-weight:700">可选</span>'
    return f'<div style="display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-top:1px solid {LINE};font-size:13px;line-height:1.45"><span style="padding-top:2px">{ico("check",15,OK,2.2)}</span><div style="display:flex;flex-direction:column;gap:2px"><div style="display:flex;align-items:center;gap:6px"><span style="font-weight:600">{t}</span>{tag}</div><span style="font-size:12px;color:{SUB}">{sub}</span></div></div>'
def route(k, v):
    return f'<tr><td style="font-size:12.5px;padding:5px 6px 5px 0;border-bottom:1px solid {LINE};color:{SUB};white-space:nowrap">{k}</td><td style="font-size:12.5px;padding:5px 0;border-bottom:1px solid {LINE}"><b style="color:{AMBER}">{v.split("·")[0]}</b>·{v.split("·",1)[1]}</td></tr>'
right = (
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">你需要准备的</div>'
    + need("一句话，或一段流程的描述", "谁做什么、什么顺序、卡在哪；说不清也行，先给候选让你挑")
    + need("材料", "流程文档 / 聊天记录 / 表格 / 历史标书；决定现状图八成质量", False)
    + need("你自己的 Claude Code 或 Codex", "工作台是壳，引擎是它；把 Prompt-dog 放进工作区即可")
    + need("一份真实样例", "上岗那一步用，比如一份真实招标文件")
    + '</div>'
    f'<div style="display:flex;flex-direction:column;gap:4px"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">什么时候用哪个入口</div><table style="border-collapse:collapse;width:100%">'
    + route("手里有一段流程或一个部门", "流程重构 · 先出图，再建狗")
    + route("只有一句要做的事", "新建 · 直接出资产包")
    + route("手里已有提示词", "诊断 · 评分 + 改进版")
    + route("想做一个产品或功能", "设计 · 产品定义 + 故事清单")
    + '</table></div>'
    f'<div style="background:{AMBER_SOFT};border:1px solid {AMBER};border-radius:12px;padding:10px 14px;font-size:12.5px;line-height:1.7;color:{INK}"><b>常见误区</b><br>先写 PRD 再开始 → 不用，先出图<br>等材料整理完整 → 不用，先丢进来<br>一次建很多只狗 → 先一只，跑通再说<br>每一步等确认 → 它只在不可逆动作前停</div>')
ONBOARDING = HEAD + frame(COLS3,
    sidebar("dog") + topbar("从 0 到 1", chips=("第 1 周", "第 2 步 / 5"), right=f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;color:{SUB};font-size:13px">{ico("help",18,SUB)}<span>跳过引导</span></span>') +
    main +
    right_col(right_head("准备与入口"), right)) + TAIL
