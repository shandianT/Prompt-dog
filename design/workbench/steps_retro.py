# -*- coding: utf-8 -*-
"""10.2 复盘与回归 · 达标可发布（现有 10 是不达标态）。这是全流程第三个停机点「改版 / 不改版」的界面。示例数据均为演示值。"""
from gen import (ico, sidebar, topbar, right_head, right_col, frame, HEAD, TAIL, COLS3,
                 AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, MID, LO, FIXBG, MONO)
from screens_v3 import _metric, _reg
from screens_v2 import btn

pass_main = (
    f'<main style="min-width:0;overflow:hidden;padding:26px 32px;display:flex;flex-direction:column;gap:16px">'
    f'<div style="display:flex;align-items:flex-end;gap:14px"><div style="display:flex;flex-direction:column;gap:4px">'
    f'<span style="font-size:23px;font-weight:800;letter-spacing:-.01em">复盘与回归 · 合同审查</span>'
    f'<span style="font-size:13.5px;color:{SUB}">改完环节 3 提示词后重跑回归：两份历史样本都过了，六项门槛全过。</span></div>'
    f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;border-radius:8px;'
    f'background:{FIXBG};border:1px solid {OK};color:{OK};font-size:12.5px;font-weight:700;white-space:nowrap">{ico("check",15,OK,2.4)}达标 · 6 / 6 过门槛 · 可发布 v1.3</span></div>'
    f'<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:12px">'
    + _metric("漏审", "0", "1", "§9.3 验收期限类型已进检查清单第 6 类")
    + _metric("误报", "1", "3", "违约金惯例区间内不再单独成条")
    + _metric("定位失败", "0", "0", "风险点与原文位置全部对得上")
    + _metric("虚构来源", "0", "0", "法条链接逐条可追溯")
    + '</div>'
    f'<div style="display:flex;flex-direction:column;gap:8px">'
    f'<div style="display:flex;align-items:center;gap:9px"><span style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">回归对照 · 2 份历史样本</span>'
    f'<span style="font-size:12px;color:{OK};font-weight:600">2 / 2 通过</span></div>'
    f'<table style="border-collapse:collapse;width:100%"><thead><tr>'
    + ''.join(f'<th style="text-align:left;font-size:11.5px;color:{SUB};font-weight:600;padding:0 10px 6px 0;border-bottom:1px solid {LINE}">{h}</th>' for h in ["历史样本", "预期", "本次结果", ""])
    + '</tr></thead><tbody>'
    + _reg("设备采购合同 2025-11", "高风险 2 · 中 3", "高风险 2 · 中 3", True)
    + _reg("技术服务合同 2026-03", "高风险 1 · 中 2", "高风险 1 · 中 2", True)
    + '</tbody></table></div>'
    f'<div style="display:flex;gap:12px">'
    f'<div style="flex:1;border:1px solid {LINE};border-left:3px solid {AMBER};border-radius:10px;padding:11px 14px;display:flex;flex-direction:column;gap:3px">'
    f'<span style="font-size:12.5px;font-weight:700">本次改版 · v1.3 候选</span>'
    f'<span style="font-size:12px;color:{SUB};line-height:1.6">环节 3 风险扫描：违约金在行业惯例区间内并入「商务条款提示」；检查清单 +「验收期限未约定」。改动只在 prompts/环节3.md。</span></div>'
    f'<div style="flex:1;border:1px solid {LINE};border-left:3px solid {OK};border-radius:10px;padding:11px 14px;display:flex;flex-direction:column;gap:3px">'
    f'<span style="font-size:12.5px;font-weight:700">发布门槛 · 6 / 6</span>'
    f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 14px;font-size:12px;color:{SUB};line-height:1.6">'
    + ''.join(f'<span style="display:inline-flex;align-items:center;gap:5px">{ico("check",13,OK,2.4)}{t}</span>' for t in ["回归 2 / 2 通过", "漏审 = 0", "定位失败 = 0", "虚构来源 = 0", "每环节 ≥1 条必带验收项", "确认点只在不可逆前"])
    + '</div></div></div>'
    f'<div style="background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:14px 18px 12px;display:flex;flex-direction:column;gap:10px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12.5px;color:{AMBER};font-weight:800;letter-spacing:.04em">改版 / 不改版 · 全流程第三个停机点</span>'
    f'<span style="font-size:12.5px;color:{SUB}">不回复 = 不改版，日志照常累积；发布是不可逆动作，所以停一下</span></div>'
    f'<div style="display:flex;gap:8px;align-items:center">'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 18px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:14px">{ico("check",16,"#ffffff",2.2)}发布 v1.3</span>'
    + btn("不改版 · 留在 v1.2", False) + btn("先看 diff", False, "file")
    + f'<span style="margin-left:auto;font-size:12px;color:{SUB}">发布后：09 版本行 + v1.3 · 两条流程下次运行用新版 · 日志顶部规律清空重新累积</span></div></div>'
    + '</main>')
pass_right = (
    f'<div style="border:1px solid {OK};background:{FIXBG};border-radius:12px;padding:12px 15px;display:flex;flex-direction:column;gap:7px">'
    f'<div style="display:flex;align-items:center;gap:7px">{ico("refresh",16,OK)}<span style="font-size:12.5px;font-weight:800;color:{OK}">回流已抬升</span></div>'
    f'<div style="font-size:12.5px;line-height:1.65">「引用法条附可追溯来源」已写进 <span style="font-family:{MONO}">references/verification.md</span> 的必带验收项表：以后每只处理法律 / 合规文本的狗都自动带上。</div>'
    f'<div style="font-size:11.5px;color:{SUB}">触发条件：同一规律出现 2 次（合同审查 · 标书撰写）</div></div>'
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">已知规律 · 4 / 10</div>'
    + ''.join(f'<div style="display:flex;gap:9px;align-items:flex-start;padding:8px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5">'
              f'<span style="color:{AMBER};font-weight:700;flex-shrink:0;font-family:{MONO}">{i+1}</span><span>{t}</span></div>'
              for i, t in enumerate([
                  "违约金条款先查行业惯例区间，再判是否成风险",
                  "扫描件合同必须先过 OCR，否则条款定位会偏一整页",
                  "「合同未约定」与「约定不利」要分开报，律师看的是两回事",
                  f'<b>验收期限未约定要单列</b> <span style="font-size:11px;color:{OK};font-weight:700">本期新增</span>']))
    + f'<div style="font-size:11.5px;color:{SUB};padding-top:8px;line-height:1.6">发布 v1.3 时这 4 条抬升进 AGENTS.md「已知规律」，日志顶部清空重新累积。</div></div>'
    f'<div style="margin-top:auto;border:1px solid {LINE};border-radius:12px;padding:11px 14px;font-size:12px;color:{SUB};line-height:1.6">'
    f'数据来自这只狗自己的 <span style="font-family:{MONO}">复盘/日志.md</span> 与 <span style="font-family:{MONO}">验收清单.json</span>，不经过任何服务端。</div>')
RETRO_PASS = HEAD + frame(COLS3, sidebar("retro") +
    topbar("复盘与回归 · 合同审查", chips=("对照期 2026-08", "候选 v1.3", "回归 2 / 2", "示例数据")) + pass_main +
    right_col(right_head("回流与规律"), pass_right)) + TAIL

FILES = {"RetroPass.dc.html": RETRO_PASS}
