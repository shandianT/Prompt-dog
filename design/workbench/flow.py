# -*- coding: utf-8 -*-
"""流程画布 v2（设计画布内的可交互组件拼接版）
- FlowNode.dc.html   节点组件：类型化端口、角色徽章可点、右键菜单、双击钻取、对照 chip、运行态
- FlowCanvas.dc.html 画布：拖连线 / 拖到空白快速添加 / 双击搜索 / 框选 / 打包成工作狗 / 钻取子流程 /
                     泳道语义（拖过边界改谁来做）/ 对照现状 / 试跑 / 缩放 / 撤销 / 分类型属性面板 / 构建预览
运行本文件重建全部画板（含 01–06）。"""
import json, os
import gen
from gen import (ico, sidebar, topbar, HEAD, AMBER, INK, SUB, CHATBG, SLOT_LINE, W, H, GX, GY)

OUT = gen.OUT
NW, NH, CW, CH = 150, 64, 1220, 1024

# ---------------------------------------------------------------- 犬舍工作狗的子流程（钻取用）
ESSENCE = "按评分表答题，让评标专家无处扣分"
FLOW_NAME = "投标流程"
DOGS = {
    "合同审查": ["文件解析", "事实提取", "风险扫描", "法律核查", "条款建议", "对抗审查", "交付生成"],
    "标书撰写": ["招标解析与废标项", "评分拆解与应答矩阵", "分章撰写", "合规自查与模拟评审"],
    "内容营销": ["选题与钩子", "骨架与初稿", "语言打磨", "自检与三吃"],
    "竞品分析": ["采集", "变化检测", "归因与打分", "成稿", "自检与找茬"],
    "数据看板": ["读取 Excel", "清洗与口径", "分析成图"],
}
def dog_children(name, prefix):
    steps = DOGS[name]
    nodes = [dict(id=f"{prefix}c{i+1}", kind="skill", role="auto", name=s, sub=f"{name} · 环节 {i+1}", x=20 + i * 170, y=140, flag="ok", note="", fix="", reuse=1)
             for i, s in enumerate(steps)]
    edges = [(f"{prefix}c{i+1}", f"{prefix}c{i+2}", "seq", f"环节 {i+1} 产物", "struct") for i in range(len(steps) - 1)]
    return dict(nodes=nodes, edges=[dict(id=f"{prefix}ce{i}", **{"from": e[0], "to": e[1]}, kind=e[2], label=e[3], dtype=e[4], contract="") for i, e in enumerate(edges)])

# ---------------------------------------------------------------- 数据（单一来源）
def N(id, kind, role, name, sub, x, y, flag="ok", note="", fix="", **k):
    d = dict(id=id, kind=kind, role=role, name=name, sub=sub, x=x, y=y, flag=flag, note=note, fix=fix, was="", owner="", sla="", notify="企业微信", method="", dir="", reuse=0, src="")
    d.update(k); return d

NODES = [
    N("n1", "human", "decide", "商机进入", "销售 · 录入线索", 20, 500, note="销售把线索录进来，决定跟不跟。", owner="销售", sla="当天"),
    N("s1", "data", "", "CRM", "商机 · 客户资料", 20, 780, "pending", "现在靠人从 CRM 抄到表格。", "打通商机状态与客户资料的只读同步，商机进入后自动带出客户背景。", was="manual", method="manual", dir="read", target=dict(flag="ok", method="api")),
    N("n2", "human", "decide", "获取招标文件", "商务 · 刷平台下载", 190, 500, "block", "每天人工刷招标平台，常漏标，常晚一天才看到。", "招标平台打通后改为关键词监控自动拉取，这一步从人定变自动，卡点消失。", owner="商务", sla="当天", target=dict(kind="skill", role="auto", flag="ok", sub="关键词监控 · 自动拉取")),
    N("s2", "data", "", "招标平台", "公告 · 文件下载", 190, 780, "pending", "公告订阅与文件下载都靠人。", "RPA 或平台接口：公告订阅 + 文件自动下载到「招标文件/」。", was="manual", method="manual", dir="read", target=dict(flag="ok", method="rpa")),
    N("n3", "dog", "auto", "招标解析与废标项", "标书撰写 · 环节 1", 360, 120, note="输出结构化解析，废标项清单置顶。", was="human", reuse=1),
    N("n4", "human", "decide", "投不投", "售前负责人", 360, 500, note="看废标项与评分结构决定是否投标。", owner="售前负责人", sla="1 天"),
    N("n14", "human", "decide", "不投 · 归档", "记录原因，回填线索", 360, 620, note="不投也要留痕，原因回 CRM。", owner="商务", sla="当天"),
    N("n5", "dog", "auto", "评分拆解与应答矩阵", "标书撰写 · 环节 2", 530, 60, note="每个评分点一行：分值、细则原文、我方素材、得分策略。", was="human", reuse=1),
    N("n6", "skill", "auto", "素材检索", "技能 · 资质 / 业绩 / 人员", 530, 200, note="按应答矩阵从素材库取材料，缺的标【待补材料】。", was="human", reuse=2),
    N("s3", "data", "", "素材库", "资质 · 业绩 · 技术模块", 530, 780, "missing", "历史业绩缺扫描件，人员证书没入库，素材命中率低。", "补齐业绩扫描件与人员证书；每次投标后新章节回填，越用越全。", was="manual", method="file", dir="rw", target=dict(flag="ok")),
    N("n7", "dog", "auto", "分章撰写", "标书撰写 · 环节 3", 700, 60, note="篇幅跟着分值走，只引用素材库真实材料。", was="human", reuse=1),
    N("n8", "dog", "auto", "合同条款审查", "合同审查 · 复用 · 7 环节", 700, 200, note="复用合同审查工作狗审招标文件里的合同条款，给偏离表依据。双击可钻进去看 7 个环节。", was="human", reuse=2, children=dog_children("合同审查", "n8")),
    N("n9", "human", "decide", "报价", "财务 · 成本核算", 700, 500, "block", "等财务出成本，整条流程常卡在这里。", "ERP 成本只读接口 + 报价模板，先自动出报价框架，人只定折扣，这一步从人定变人审。", owner="财务", sla="2 天", target=dict(role="review", flag="ok", sub="ERP 成本 + 报价模板 · 人只定折扣")),
    N("s4", "data", "", "ERP 成本", "物料 · 人工 · 历史报价", 700, 780, "pending", "成本口径在财务手里，每次现算。", "只读接口拉成本口径与历史报价。", was="manual", method="manual", dir="read", target=dict(flag="ok", method="api")),
    N("n10", "skill", "auto", "合规自查与模拟评审", "对抗审查 + 废标项清单", 870, 120, note="切换成挑剔的评标专家，只找扣分点。", was="human", reuse=3),
    N("n11", "human", "review", "领导审批", "分管领导", 870, 500, note="看自查清单与报价，通过才递交；不通过退回报价。", owner="分管领导", sla="1 天"),
    N("s5", "data", "", "OA 审批", "流程 · 签章", 870, 780, "pending", "审批在 OA 里另起一单，结果要人回来告诉流程。", "审批单自动发起与回写，审批结果直接推进到递交。", was="manual", method="manual", dir="rw", target=dict(flag="ok", method="api")),
    N("n12", "human", "decide", "递交", "人工确认点", 1040, 500, note="不可逆动作，递交前暂停等人确认。", owner="商务", sla="截止前 1 天"),
    N("n13", "skill", "auto", "复盘回填", "中标结果 → 素材库", 1040, 200, note="中标 / 落标结果、评审意见、新写章节回填素材库。", was="new", reuse=4),
]
# (from, to, kind, label, dtype)  kind: seq 顺序 / data 数据 / pending 待打通 / loop 回填 / back 退回
EDGES = [
    ("s1", "n1", "pending", "商机、客户资料", "sys"), ("n1", "n2", "seq", "跟进的线索", "decision"), ("s2", "n2", "pending", "公告、招标文件", "sys"),
    ("n2", "n3", "seq", "招标文件 PDF", "file"), ("n3", "n4", "seq", "废标项清单 + 评分结构", "struct"), ("n4", "n5", "seq", "投", "decision"), ("n4", "n14", "seq", "不投", "decision"),
    ("n5", "n6", "seq", "应答矩阵", "struct"), ("s3", "n6", "data", "资质 / 业绩材料", "file"), ("n5", "n7", "seq", "应答矩阵", "struct"), ("n6", "n7", "data", "素材 + 待补清单", "struct"),
    ("n3", "n8", "seq", "合同条款", "file"), ("n5", "n9", "seq", "报价表框架", "struct"), ("s4", "n9", "pending", "成本口径、历史报价", "sys"),
    ("n7", "n10", "seq", "标书初稿", "file"), ("n8", "n10", "data", "偏离表依据", "struct"), ("n9", "n10", "seq", "报价", "struct"), ("n10", "n11", "seq", "自查清单 + 三件套", "file"),
    ("s5", "n11", "pending", "审批单", "sys"), ("n11", "n12", "seq", "审批通过", "decision"), ("n11", "n9", "back", "不通过 · 退回", "decision"),
    ("n12", "n13", "seq", "中标结果", "event"), ("n13", "s3", "loop", "新章节、评审意见", "file"),
]
EDGE_OBJS = [dict(id=f"e{i}", **{"from": e[0], "to": e[1]}, kind=e[2], label=e[3], dtype=e[4], contract="") for i, e in enumerate(EDGES)]
PALETTE = [
    dict(title="工作狗", sub="整只当一个节点，双击可钻取", items=[dict(kind="dog", name=n, sub=f"{len(DOGS[n])} 环节", children=dog_children(n, "p" + str(i))) for i, n in enumerate(DOGS)]),
    dict(title="技能", sub="可复用的一步", items=[dict(kind="skill", name="联网检索", sub="带来源"), dict(kind="skill", name="文件解析", sub="PDF / OCR"), dict(kind="skill", name="对抗审查", sub="只找问题"), dict(kind="skill", name="来源核查", sub="逐条核对"), dict(kind="skill", name="素材检索", sub="按矩阵取材")]),
    dict(title="行业 know-how", sub="行业库 / 你的材料", items=[dict(kind="know", name="废标项清单", sub="行业库"), dict(kind="know", name="评分点写法", sub="你的中标标书"), dict(kind="know", name="报价策略", sub="缺 · 待沉淀", flag="missing")]),
    dict(title="数据与系统", sub="拖进来即标待打通", items=[dict(kind="data", name="CRM", sub="商机 · 客户"), dict(kind="data", name="招标平台", sub="公告 · 下载"), dict(kind="data", name="ERP", sub="成本 · 报价"), dict(kind="data", name="OA", sub="审批 · 签章"), dict(kind="data", name="邮箱", sub="收发件"), dict(kind="data", name="网盘", sub="文件")]),
    dict(title="人", sub="人审 / 人定", items=[dict(kind="human", name="人审", sub="看一眼，可退回", role="review"), dict(kind="human", name="人定", sub="不可逆前拍板", role="decide")]),
]

# ---------------------------------------------------------------- CSS
NODE_CSS = r'''
    .node { position: relative; width: 150px; height: 64px; box-sizing: border-box; background: #ffffff; border: 1px solid #e5e8ee; border-radius: 10px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px; cursor: grab; user-select: none; box-shadow: 0 1px 2px rgba(30,35,43,.05); outline: none; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; color: #1e232b; }
    .node.k-human { border: 1.5px solid #d97706; }
    .node.k-data { background: #f5f2ec; }
    .node.f-block { border: 1.5px solid #dc2626; }
    .node.f-missing { border: 1.5px dashed #d97706; }
    .node.f-pending { border: 1.5px dashed #2563eb; }
    .node.sel { box-shadow: 0 0 0 3px #fdf0dd, 0 6px 18px rgba(217,119,6,.18); border-color: #d97706; border-style: solid; }
    .node.connecting { box-shadow: 0 0 0 3px #eff4ff; }
    .node.running { box-shadow: 0 0 0 3px #fdf0dd, 0 0 0 6px rgba(217,119,6,.25); border-color: #d97706; }
    .node.dim { opacity: .38; }
    .nh { display: flex; align-items: center; gap: 6px; font-size: 10.5px; line-height: 1; }
    .kd { display: inline-flex; align-items: center; gap: 3px; padding: 2px 5px; border-radius: 4px; font-weight: 700; white-space: nowrap; }
    .kd.human, .kd.dog { background: #fdf0dd; color: #d97706; } .kd.skill { background: #eff4ff; color: #2563eb; } .kd.know { background: #f0faf2; color: #16a34a; } .kd.data { background: #ffffff; color: #1e232b; border: 1px solid #cfd4dc; }
    .rl { margin-left: auto; font-weight: 700; padding: 2px 5px; border-radius: 4px; white-space: nowrap; cursor: pointer; }
    .rl.auto { background: #e5e8ee; color: #1e232b; } .rl.review { border: 1px solid #d97706; color: #d97706; } .rl.decide { background: #d97706; color: #ffffff; }
    .rl:hover { outline: 2px solid #fdf0dd; }
    .nn { font-weight: 700; font-size: 13px; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ns { font-size: 11px; color: #68707c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fl { position: absolute; top: -9px; right: 8px; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; color: #ffffff; letter-spacing: .04em; }
    .fl.block { background: #dc2626; } .fl.missing { background: #d97706; } .fl.pending { background: #2563eb; }
    .df { position: absolute; top: -9px; left: 8px; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; letter-spacing: .04em; background: #1e232b; color: #ffffff; }
    .df.new { background: #16a34a; }
    .kids { position: absolute; right: 8px; bottom: -9px; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: #ffffff; border: 1px solid #e5e8ee; color: #68707c; }
    .port { position: absolute; top: 50%; width: 12px; height: 12px; margin-top: -6px; border-radius: 50%; background: #ffffff; border: 2px solid #9aa4af; cursor: crosshair; }
    .port.in { left: -7px; } .port.out { right: -7px; }
    .port.t-decision { border-color: #d97706; } .port.t-struct { border-color: #64748b; } .port.t-text { border-color: #16a34a; } .port.t-sys { border-color: #2563eb; }
    .port.out:hover { background: #fdf0dd; transform: scale(1.25); }
'''
CANVAS_CSS = r'''
    .fc * { box-sizing: border-box; }
    .fc .main { display: grid; grid-template-columns: 200px minmax(0, 1fr) 292px; min-height: 0; background: #f7f8fa; }
    .fc .pal { background: #ffffff; border-right: 1px solid #e5e8ee; overflow: auto; padding: 12px 12px 16px; display: flex; flex-direction: column; gap: 12px; }
    .fc .pal h4 { margin: 0; font-size: 12px; font-weight: 800; letter-spacing: .04em; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
    .fc .pal h4 small { font-weight: 500; color: #68707c; font-size: 11px; letter-spacing: 0; }
    .fc .pg { display: flex; flex-direction: column; gap: 4px; }
    .fc .pi { display: flex; align-items: center; gap: 6px; min-height: 36px; padding: 4px 6px; border-radius: 8px; border: 1px solid #e5e8ee; background: #ffffff; cursor: grab; user-select: none; }
    .fc .pi:hover { border-color: #d97706; background: #fffaf2; }
    .fc .pi .grip { color: #cfd4dc; display: flex; flex-shrink: 0; }
    .fc .pcol { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .fc .pn { font-size: 12.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fc .ps { font-size: 10.5px; color: #68707c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fc .kdot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .fc .kdot.dog, .fc .kdot.human { background: #d97706; } .fc .kdot.skill { background: #2563eb; } .fc .kdot.know { background: #16a34a; } .fc .kdot.data { background: #ffffff; border: 2px solid #1e232b; }
    .fc .psearch { width: 100%; border: 1px solid #e5e8ee; border-radius: 8px; padding: 7px 9px; font: inherit; font-size: 12.5px; background: #f7f8fa; outline: none; }
    .fc .psearch:focus { border-color: #d97706; background: #ffffff; }
    .fc .cwrap { overflow: auto; position: relative; }
    .fc .canvas { position: relative; width: 1220px; height: 1024px; transform-origin: 0 0; background-color: #f7f8fa; background-image: radial-gradient(#dfe3ea 1px, transparent 1px); background-size: 20px 20px; user-select: none; }
    .fc .lane { position: absolute; left: 0; right: 0; border-top: 1px dashed #d3d8e0; pointer-events: none; }
    .fc .lane .ll { position: absolute; left: 10px; top: 6px; font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #9aa4af; display: flex; align-items: center; gap: 5px; }
    .fc .lane .lh { position: absolute; right: 12px; top: 6px; font-size: 10.5px; color: #9aa4af; }
    .fc .lane.human { border-top-color: #f0c78a; } .fc .lane.human .ll { color: #d97706; }
    .fc .defs { position: absolute; width: 0; height: 0; }
    .fc .esvg { position: absolute; left: 0; top: 0; width: 1220px; height: 1024px; overflow: visible; pointer-events: none; }
    .fc .hit { fill: none; stroke: transparent; stroke-width: 14px; pointer-events: stroke; cursor: pointer; }
    .fc .edge { fill: none; stroke: #9aa4af; stroke-width: 1.8px; pointer-events: none; marker-end: url(#m-flow); }
    .fc .edge.data { stroke: #64748b; marker-end: url(#m-data); }
    .fc .edge.pending { stroke: #2563eb; stroke-dasharray: 6 5; marker-end: url(#m-pending); }
    .fc .edge.loop { stroke: #16a34a; stroke-dasharray: 6 5; marker-end: url(#m-loop); }
    .fc .edge.back { stroke: #dc2626; stroke-dasharray: 5 4; marker-end: url(#m-back); }
    .fc .edge.sel { stroke: #d97706; stroke-width: 2.6px; marker-end: url(#m-sel); }
    .fc .edge.temp { stroke: #d97706; stroke-dasharray: 4 4; stroke-width: 1.6px; marker-end: none; }
    .fc .ew { position: absolute; left: 0; top: 0; width: 0; height: 0; }
    .fc .elabh { position: absolute; transform: translate(-50%, -50%); font-size: 10.5px; line-height: 1; color: #68707c; font-weight: 600; background: rgba(247,248,250,.92); border-radius: 4px; padding: 2px 5px; white-space: nowrap; pointer-events: none; }
    .fc .elabh:empty { display: none; }
    .fc .elabh.decision { color: #d97706; } .fc .elabh.pending { color: #2563eb; } .fc .elabh.back { color: #dc2626; } .fc .elabh.loop { color: #16a34a; }
    .fc .nw { position: absolute; width: 150px; height: 64px; }
    .fc .mq { position: absolute; border: 1.5px dashed #d97706; background: rgba(217,119,6,.06); pointer-events: none; }
    .fc .quick { position: absolute; z-index: 40; width: 240px; background: #ffffff; border: 1px solid #e5e8ee; border-radius: 12px; box-shadow: 0 12px 32px rgba(30,35,43,.16); padding: 8px; display: flex; flex-direction: column; gap: 6px; }
    .fc .qlist { display: flex; flex-direction: column; gap: 2px; max-height: 240px; overflow: auto; }
    .fc .qi { display: flex; align-items: center; gap: 7px; min-height: 30px; padding: 3px 8px; border-radius: 7px; cursor: pointer; font-size: 12.5px; }
    .fc .qi:hover { background: #fdf0dd; }
    .fc .qi .muted { margin-left: auto; font-size: 11px; }
    .fc .crumb { position: absolute; left: 12px; top: 10px; z-index: 30; display: flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #e5e8ee; border-radius: 10px; padding: 6px 8px 6px 12px; font-size: 13px; box-shadow: 0 4px 14px rgba(30,35,43,.08); }
    .fc .crumb .root { color: #d97706; cursor: pointer; font-weight: 700; }
    .fc .zoom { position: absolute; right: 12px; bottom: 12px; z-index: 30; display: flex; gap: 4px; background: #ffffff; border: 1px solid #e5e8ee; border-radius: 10px; padding: 4px; box-shadow: 0 4px 14px rgba(30,35,43,.08); }
    .fc .zb { font: inherit; font-size: 12.5px; font-weight: 700; min-width: 32px; height: 30px; padding: 0 8px; border-radius: 7px; border: 0; background: transparent; color: #1e232b; cursor: pointer; }
    .fc .zb:hover { background: #f7f8fa; }
    .fc .menu { position: fixed; z-index: 70; width: 190px; background: #ffffff; border: 1px solid #e5e8ee; border-radius: 10px; box-shadow: 0 12px 32px rgba(30,35,43,.18); padding: 6px; display: flex; flex-direction: column; gap: 1px; }
    .fc .mi { display: flex; align-items: center; min-height: 32px; padding: 0 10px; border-radius: 7px; font-size: 13px; cursor: pointer; }
    .fc .mi:hover { background: #fdf0dd; }
    .fc .mi.danger { color: #dc2626; }
    .fc .mi.sep { border-top: 1px solid #e5e8ee; margin-top: 4px; padding-top: 4px; border-radius: 0; }
    .fc .ins { background: #ffffff; border-left: 1px solid #e5e8ee; overflow: auto; padding: 14px 16px 18px; display: flex; flex-direction: column; gap: 12px; font-size: 13px; }
    .fc .ins-h { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .fc .ins-h b { font-weight: 800; }
    .fc .muted { color: #68707c; font-size: 12px; }
    .fc .lb { display: block; font-size: 11px; font-weight: 800; letter-spacing: .06em; color: #68707c; margin: 4px 0 4px; }
    .fc .fi { width: 100%; border: 1px solid #e5e8ee; border-radius: 8px; padding: 8px 10px; font: inherit; font-size: 13px; color: #1e232b; background: #f7f8fa; outline: none; }
    .fc .fi:focus { border-color: #d97706; background: #ffffff; }
    .fc .ta { min-height: 60px; resize: vertical; line-height: 1.5; }
    .fc .seg { display: flex; gap: 4px; flex-wrap: wrap; }
    .fc .sb { font: inherit; font-size: 12px; font-weight: 600; min-height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid #e5e8ee; background: #ffffff; color: #68707c; cursor: pointer; }
    .fc .sb.on { border-color: #d97706; background: #fdf0dd; color: #d97706; }
    .fc .sb.on.v-block { border-color: #dc2626; background: #fef2f2; color: #dc2626; }
    .fc .sb.on.v-pending { border-color: #2563eb; background: #eff4ff; color: #2563eb; }
    .fc .sb:focus-visible, .fc .btn:focus-visible, .fc .tb-btn:focus-visible, .fc .zb:focus-visible { outline: 2px solid #d97706; outline-offset: 1px; }
    .fc .chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .fc .chip { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 6px; background: #f7f8fa; border: 1px solid #e5e8ee; font-size: 12px; cursor: pointer; }
    .fc .chip:hover { border-color: #d97706; }
    .fc .dg { display: flex; flex-direction: column; gap: 10px; }
    .fc .dg-row { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px solid #e5e8ee; border-radius: 10px; }
    .fc .dg-row .t { display: flex; align-items: center; gap: 7px; font-weight: 800; }
    .fc .dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
    .fc .dot.block { background: #dc2626; } .fc .dot.missing { background: #d97706; } .fc .dot.pending { background: #2563eb; }
    .fc .sug { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; line-height: 1.55; }
    .fc .sug .ap { display: inline-flex; align-items: center; height: 24px; padding: 0 8px; border-radius: 6px; border: 1px solid #d97706; color: #d97706; font-size: 11.5px; font-weight: 700; cursor: pointer; margin-left: 6px; background: #ffffff; }
    .fc .sug .ap:hover { background: #fdf0dd; }
    .fc .kv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 10px; font-size: 12.5px; }
    .fc .kv b { font-weight: 800; }
    .fc .btn { font: inherit; font-size: 13px; font-weight: 700; min-height: 36px; padding: 0 14px; border-radius: 8px; border: 1px solid #e5e8ee; background: #f7f8fa; color: #68707c; cursor: pointer; }
    .fc .btn.sm { min-height: 30px; padding: 0 10px; margin-left: auto; }
    .fc .btn.amber { border-color: #d97706; color: #d97706; background: #ffffff; }
    .fc .btn.danger { color: #dc2626; border-color: #f3c2c2; background: #ffffff; }
    .fc .ins-foot { margin-top: auto; display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #e5e8ee; }
    .fc .pair { font-weight: 700; font-size: 14px; }
    .fc .hint { font-size: 12px; color: #68707c; line-height: 1.5; background: #f7f8fa; border-radius: 8px; padding: 8px 10px; }
    .fc .stat { display: inline-flex; align-items: center; gap: 6px; height: 28px; border: 1px solid #e5e8ee; background: #f7f8fa; border-radius: 8px; padding: 0 10px; font-size: 12.5px; color: #68707c; white-space: nowrap; }
    .fc .stat b { color: #1e232b; font-variant-numeric: tabular-nums; }
    .fc .tb-btn { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 10px; border: 1px solid #e5e8ee; background: #f7f8fa; font: inherit; font-size: 13px; color: #68707c; cursor: pointer; white-space: nowrap; }
    .fc .tb-btn.on { border-color: #d97706; background: #fdf0dd; color: #d97706; }
    .fc .tb-btn.primary { background: #d97706; color: #ffffff; border-color: #d97706; font-weight: 700; }
    .fc .ghost { position: fixed; pointer-events: none; z-index: 50; width: 150px; opacity: .92; }
    .fc .ghost .node { box-shadow: 0 10px 30px rgba(30,35,43,.18); }
    .fc .toast { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%); background: #1e232b; color: #ffffff; padding: 10px 16px; border-radius: 10px; font-size: 13px; z-index: 60; pointer-events: none; max-width: 640px; text-align: center; }
    .fc .bar { position: absolute; left: 50%; top: 12px; transform: translateX(-50%); z-index: 30; display: flex; align-items: center; gap: 8px; background: #1e232b; color: #ffffff; border-radius: 10px; padding: 6px 8px 6px 14px; font-size: 13px; box-shadow: 0 8px 24px rgba(30,35,43,.25); }
    .fc .bar .bb { font: inherit; font-size: 12.5px; font-weight: 700; height: 30px; padding: 0 12px; border-radius: 8px; border: 0; background: #d97706; color: #ffffff; cursor: pointer; }
    .fc .bar .bb.ghostb { background: transparent; color: #c8cdd6; }
'''

def helmet(css):
    return HEAD.replace('  </style>\n</helmet>', css + '  </style>\n</helmet>')

# ---------------------------------------------------------------- FlowNode 组件
FLOW_NODE = helmet(NODE_CSS) + '''<div class="node k-{{kind}} f-{{flag}} {{cls}}" data-id="{{id}}" onMouseDown="{{down}}" onContextMenu="{{menu}}" onDoubleClick="{{open}}" tabindex="0">
  <span class="port in t-{{itype}}"></span>
  <sc-if value="{{hasFlag}}" hint-placeholder-val="{{false}}"><span class="fl {{flag}}">{{flagLabel}}</span></sc-if>
  <sc-if value="{{hasDiff}}" hint-placeholder-val="{{false}}"><span class="df {{diffCls}}">{{diff}}</span></sc-if>
  <div class="nh"><span class="kd {{kind}}">{{kindLabel}}</span><sc-if value="{{hasRole}}" hint-placeholder-val="{{true}}"><span class="rl {{role}}" onMouseDown="{{roleDown}}" onClick="{{roleClick}}" title="点一下切换：自动 → 人审 → 人定">{{roleLabel}}</span></sc-if></div>
  <div class="nn">{{name}}</div>
  <div class="ns">{{sub}}</div>
  <sc-if value="{{hasKids}}" hint-placeholder-val="{{false}}"><span class="kids">{{kids}}</span></sc-if>
  <span class="port out t-{{otype}}" onMouseDown="{{portDown}}" title="按住拖到另一个节点连线；拖到空白处新建"></span>
</div>
</x-dc>
<script data-dc-script data-props='{"node":{"editor":null},"selected":{"editor":null},"connecting":{"editor":null},"running":{"editor":null},"dim":{"editor":null},"diff":{"editor":null},"onDown":{"editor":null},"onPort":{"editor":null},"onRole":{"editor":null},"onMenu":{"editor":null},"onOpen":{"editor":null},"kind":{"editor":"enum","options":["human","dog","skill","know","data"],"default":"dog","section":"变体预览"},"role":{"editor":"enum","options":["auto","review","decide"],"default":"auto","section":"变体预览"},"flag":{"editor":"enum","options":["ok","block","missing","pending"],"default":"ok","section":"变体预览"},"$preview":{"width":150,"height":64}}'>
class Component extends DCLogic {
  renderVals() {
    var p = this.props || {};
    var n = p.node || { id: 'sample', kind: p.kind || 'dog', role: p.role || 'auto', flag: p.flag || 'ok', name: '招标解析与废标项', sub: '标书撰写 · 环节 1' };
    var KIND = { human: '人', dog: '\\uD83D\\uDC3E 工作狗', skill: '技能', know: 'know-how', data: '数据 / 系统' };
    var ROLE = { auto: '自动', review: '人审', decide: '人定' };
    var FLAG = { ok: '正常', block: '卡点', missing: '缺口', pending: '待打通' };
    var OT = { human: 'decision', dog: 'struct', skill: 'struct', know: 'text', data: 'sys' };
    var flag = n.flag || 'ok';
    var noop = function () {};
    var kids = n.children && n.children.nodes ? n.children.nodes.length : 0;
    var stop = function (e) { e.stopPropagation(); };
    return {
      id: n.id || 'sample', kind: n.kind, flag: flag, role: n.role || '', name: n.name || '', sub: n.sub || '',
      kindLabel: KIND[n.kind] || n.kind, roleLabel: ROLE[n.role] || '', flagLabel: FLAG[flag] || '',
      hasFlag: flag !== 'ok', hasRole: n.kind !== 'data' && !!n.role,
      hasDiff: !!p.diff, diff: p.diff || '', diffCls: (p.diff === '新增') ? 'new' : '',
      hasKids: kids > 0, kids: kids + ' 环节 · 双击打开',
      itype: n.kind === 'data' ? 'sys' : 'struct', otype: OT[n.kind] || 'struct',
      cls: (p.selected ? 'sel ' : '') + (p.connecting ? 'connecting ' : '') + (p.running ? 'running ' : '') + (p.dim ? 'dim' : ''),
      down: p.onDown || noop, portDown: p.onPort || noop, roleDown: stop, roleClick: p.onRole || noop, menu: p.onMenu || noop, open: p.onOpen || noop
    };
  }
}
</script>
</body>
</html>
'''

# ---------------------------------------------------------------- FlowCanvas 模板
def lanes_html():
    return (f'<div class="lane ai" style="top: 28px"><span class="ll">{ico("bolt",13,"#9aa4af",2.2)}AI 自动</span><span class="lh">把人的步骤拖进来 = 我要把它自动化</span></div>'
            f'<div class="lane human" style="top: 440px"><span class="ll">{ico("user",13,AMBER,2.2)}人</span><span class="lh">拖进来 = 这一步还是人来做</span></div>'
            f'<div class="lane data" style="top: 720px"><span class="ll">{ico("folder",13,"#9aa4af",1.8)}数据与系统</span><span class="lh">虚线 = 现在靠人搬数据</span></div>')

DEFS_SVG = ('<svg class="defs" viewBox="0 0 10 10"><defs>' + ''.join(
    f'<marker id="m-{k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="{c}"></path></marker>'
    for k, c in (("flow", "#9aa4af"), ("data", "#64748b"), ("pending", "#2563eb"), ("loop", "#16a34a"), ("back", "#dc2626"), ("sel", "#d97706"))) + '</defs></svg>')

def stat(label, hole, dot=None):
    d = f'<span class="dot {dot}"></span>' if dot else ''
    return f'<span class="stat">{d}{label} <b>{{{{{hole}}}}}</b></span>'

TOPBAR_RIGHT = ('<div style="display:flex;gap:6px;align-items:center">'
                + stat("自动", "stAuto") + stat("人", "stHuman") + stat("卡点", "stBlock", "block") + stat("缺口", "stMissing", "missing") + stat("待打通", "stPending", "pending")
                + '<span style="width:6px"></span>'
                + f'<button class="tb-btn" type="button" onClick="{{{{btnUndo}}}}" title="撤销上一步">{ico("refresh",15,SUB)}撤销</button>'
                + f'<button class="tb-btn {{{{diffOn}}}}" type="button" onClick="{{{{btnDiff}}}}" title="标出每个节点原来怎么做">{ico("flag",15,SUB)}对照现状</button>'
                + f'<button class="tb-btn {{{{labelsOn}}}}" type="button" onClick="{{{{btnLabels}}}}" title="显示每条线上流动的产物">{ico("file",15,SUB)}产物</button>'
                + f'<button class="tb-btn" type="button" onClick="{{{{btnRun}}}}" title="按顺序点亮自动节点">{ico("bolt",15,SUB,2)}试跑</button>'
                + f'<button class="tb-btn primary" type="button" onClick="{{{{btnBuild}}}}">{ico("check",16,"#ffffff",2.2)}按这个建</button></div>')

PALETTE_TPL = ('<input class="psearch" value="{{pq}}" onChange="{{setPq}}" placeholder="搜组件，或在画布空白处双击">'
               '<sc-for list="{{palette}}" as="g" hint-placeholder-count="5"><div class="pg"><h4>{{g.title}}<small>{{g.sub}}</small></h4>'
               '<sc-for list="{{g.items}}" as="it" hint-placeholder-count="4">'
               f'<div class="pi" onMouseDown="{{{{it.grab}}}}"><span class="grip">{ico("grip",14,SLOT_LINE,2.4)}</span><span class="kdot {{{{it.kind}}}}"></span>'
               '<span class="pcol"><span class="pn">{{it.name}}</span><span class="ps">{{it.sub}}</span></span></div>'
               '</sc-for></div></sc-for>'
               f'<button class="btn" type="button" onClick="{{{{btnNewComp}}}}" style="margin-top:4px">{ico("plus",14,SUB,2)} 新组件（占位缺口）</button>')

CANVAS_TPL = ('<div class="cwrap">'
              '<sc-if value="{{inScope}}" hint-placeholder-val="{{false}}"><div class="crumb"><span class="root" onClick="{{goRoot}}">投标流程</span><span class="muted">›</span><b>{{scopeName}}</b><span class="muted">{{scopeSub}}</span><button class="btn sm" type="button" onClick="{{goRoot}}">返回上一层</button></div></sc-if>'
              '<sc-if value="{{hasMulti}}" hint-placeholder-val="{{false}}"><div class="bar"><span>已选 {{multiN}} 个节点</span><button class="bb" type="button" onClick="{{btnGroup}}">打包成工作狗</button><button class="bb ghostb" type="button" onClick="{{btnDelMulti}}">删除</button><button class="bb ghostb" type="button" onClick="{{btnClearMulti}}">取消</button></div></sc-if>'
              '<div class="zoom"><button class="zb" type="button" onClick="{{zoomOut}}">−</button><button class="zb" type="button" onClick="{{zoomReset}}">{{zoomPct}}</button><button class="zb" type="button" onClick="{{zoomIn}}">+</button><button class="zb" type="button" onClick="{{zoomFit}}">适应</button></div>'
              '<div class="canvas" style="transform: scale({{zoom}})" onMouseDown="{{canvasDown}}" onMouseMove="{{canvasMove}}" onMouseUp="{{canvasUp}}" onDoubleClick="{{canvasDbl}}">'
              + lanes_html() + DEFS_SVG
              + '<sc-for list="{{edges}}" as="e" hint-placeholder-count="3"><div class="ew"><svg class="esvg" viewBox="0 0 1220 1024"><path class="hit" d="{{e.d}}" onMouseDown="{{e.pick}}"></path><path class="{{e.cls}}" d="{{e.d}}"></path></svg><div class="elabh {{e.lcls}}" style="left: {{e.lx}}px; top: {{e.ly}}px">{{e.label}}</div></div></sc-for>'
              + '<sc-if value="{{hasTemp}}" hint-placeholder-val="{{false}}"><svg class="esvg" viewBox="0 0 1220 1024"><path class="edge temp" d="{{tempD}}"></path></svg></sc-if>'
              + '<sc-for list="{{nodes}}" as="n" hint-placeholder-count="6"><div class="nw" style="left: {{n.x}}px; top: {{n.y}}px">'
              + '<dc-import name="FlowNode" node="{{n}}" selected="{{n.selected}}" connecting="{{n.connecting}}" running="{{n.running}}" dim="{{n.dim}}" diff="{{n.diff}}" on-down="{{n.down}}" on-port="{{n.port}}" on-role="{{n.roleCycle}}" on-menu="{{n.menu}}" on-open="{{n.open}}" hint-size="150px,64px"></dc-import>'
              + '</div></sc-for>'
              + '<sc-if value="{{hasMarquee}}" hint-placeholder-val="{{false}}"><div class="mq" style="left: {{mqX}}px; top: {{mqY}}px; width: {{mqW}}px; height: {{mqH}}px"></div></sc-if>'
              + '<sc-if value="{{hasQuick}}" hint-placeholder-val="{{false}}"><div class="quick" style="left: {{quickX}}px; top: {{quickY}}px" onMouseDown="{{stop}}" onDoubleClick="{{stop}}">'
              + '<input class="fi" value="{{quickQ}}" onChange="{{setQuickQ}}" placeholder="{{quickHint}}">'
              + '<div class="qlist"><sc-for list="{{quickItems}}" as="q" hint-placeholder-count="5"><div class="qi" onClick="{{q.pick}}"><span class="kdot {{q.kind}}"></span><span>{{q.name}}</span><span class="muted">{{q.sub}}</span></div></sc-for></div></div></sc-if>'
              + '</div></div>')

def seg(list_hole):
    return f'<div class="seg"><sc-for list="{{{{{list_hole}}}}}" as="o" hint-placeholder-count="3"><button class="sb {{{{o.cls}}}}" type="button" onClick="{{{{o.pick}}}}">{{{{o.label}}}}</button></sc-for></div>'

def chips(list_hole):
    return f'<div class="chips"><sc-for list="{{{{{list_hole}}}}}" as="c" hint-placeholder-count="2"><span class="chip" onClick="{{{{c.go}}}}">{{{{c.name}}}}</span></sc-for></div>'

INSPECTOR_TPL = ('<div class="ins">'
  # ---- 诊断
  '<sc-if value="{{showDiag}}" hint-placeholder-val="{{true}}">'
  '<div class="ins-h"><b>诊断</b><span class="muted">按标记实时汇总</span></div>'
  '<div class="dg">'
  '<div class="dg-row"><div class="t"><span class="dot block"></span>卡点 {{stBlock}}<span class="muted" style="font-weight:500;margin-left:auto">流程在哪等人</span></div>' + chips("blocks") + '</div>'
  '<div class="dg-row"><div class="t"><span class="dot missing"></span>缺口 {{stMissing}}<span class="muted" style="font-weight:500;margin-left:auto">缺组件 / 材料</span></div>' + chips("missings") + '</div>'
  '<div class="dg-row"><div class="t"><span class="dot pending"></span>待打通 {{stPending}}<span class="muted" style="font-weight:500;margin-left:auto">人在搬数据</span></div>' + chips("pendings") + '</div>'
  '</div>'
  '<div class="ins-h"><b>重构建议</b><span class="muted">「应用」= 把它改成打通后的样子</span></div>'
  '<ol class="sug"><sc-for list="{{sug}}" as="s" hint-placeholder-count="4"><li><b>{{s.name}}</b>：{{s.fix}}<sc-if value="{{s.canApply}}" hint-placeholder-val="{{false}}"><span class="ap" onClick="{{s.apply}}">应用</span></sc-if></li></sc-for></ol>'
  '<div class="hint">拖法：人的步骤拖进 AI 泳道 = 要自动化（会标缺口，等你配组件）；AI 节点拖进人泳道 = 改成人审；从右侧圆点拖到空白 = 新建并连上；框选多个 = 打包成工作狗；双击工作狗 = 钻进去。</div>'
  '<div class="ins-foot"><button class="btn" type="button" onClick="{{btnReset}}">重置示例</button></div>'
  '</sc-if>'
  # ---- 构建预览
  '<sc-if value="{{showBuild}}" hint-placeholder-val="{{false}}">'
  '<div class="ins-h"><b>构建预览</b><span class="muted">按这个建会得到</span><button class="btn sm" type="button" onClick="{{btnClose}}">关闭</button></div>'
  '<div><span class="lb">环节（按顺序，来自 AI 泳道）</span><ol class="sug"><sc-for list="{{bSteps}}" as="s" hint-placeholder-count="5"><li>{{s.name}}<span class="muted"> · {{s.sub}}</span></li></sc-for></ol></div>'
  '<div><span class="lb">工具清单（数据与系统）</span>' + chips("bTools") + '</div>'
  '<div><span class="lb">人工确认点（人定）</span>' + chips("bGates") + '</div>'
  '<div><span class="lb">交付前必须解决</span><ol class="sug"><sc-for list="{{bTodo}}" as="s" hint-placeholder-count="3"><li>{{s.name}}<span class="muted"> · {{s.sub}}</span></li></sc-for></ol></div>'
  '<div class="hint">{{bSummary}}</div>'
  '</sc-if>'
  # ---- 节点
  '<sc-if value="{{showNode}}" hint-placeholder-val="{{false}}">'
  '<div class="ins-h"><span class="kd {{selKind}}">{{selKindLabel}}</span><span class="muted">{{selId}}</span><button class="btn sm" type="button" onClick="{{btnClose}}">关闭</button></div>'
  '<div><span class="lb">名称</span><input class="fi" value="{{selName}}" onChange="{{setName}}"></div>'
  '<div><span class="lb">说明</span><input class="fi" value="{{selSub}}" onChange="{{setSub}}"></div>'
  '<sc-if value="{{selHasRole}}" hint-placeholder-val="{{true}}"><div><span class="lb">谁来做</span>' + seg("roleOpts") + '</div></sc-if>'
  '<div><span class="lb">状态</span>' + seg("flagOpts") + '</div>'
  '<sc-if value="{{selIsHuman}}" hint-placeholder-val="{{false}}"><div class="kv"><div><span class="lb">负责人 / 部门</span><input class="fi" value="{{selOwner}}" onChange="{{setOwner}}"></div><div><span class="lb">时限</span><input class="fi" value="{{selSla}}" onChange="{{setSla}}"></div></div><div><span class="lb">通知</span>' + seg("notifyOpts") + '</div></sc-if>'
  '<sc-if value="{{selIsData}}" hint-placeholder-val="{{false}}"><div><span class="lb">打通方式</span>' + seg("methodOpts") + '</div><div><span class="lb">方向</span>' + seg("dirOpts") + '</div></sc-if>'
  '<sc-if value="{{selIsDog}}" hint-placeholder-val="{{false}}"><div class="kv"><div><span class="lb">子流程</span><b>{{selKids}}</b></div><div><span class="lb">复用于</span><b>{{selReuse}} 条流程</b></div></div><sc-if value="{{selHasKids}}" hint-placeholder-val="{{false}}"><button class="btn amber" type="button" onClick="{{btnOpen}}">打开子流程</button></sc-if></sc-if>'
  '<sc-if value="{{selIsSkill}}" hint-placeholder-val="{{false}}"><div class="kv"><div><span class="lb">复用于</span><b>{{selReuse}} 只工作狗</b></div><div><span class="lb">改一处</span><b>全部同步</b></div></div></sc-if>'
  '<sc-if value="{{selIsKnow}}" hint-placeholder-val="{{false}}"><div><span class="lb">来源</span>' + seg("srcOpts") + '</div></sc-if>'
  '<div><span class="lb">备注 · 卡在哪 / 缺什么 / 要打通什么</span><textarea class="fi ta" value="{{selNote}}" onChange="{{setNote}}"></textarea></div>'
  '<sc-if value="{{selHasFix}}" hint-placeholder-val="{{false}}"><div><span class="lb">怎么解</span><textarea class="fi ta" value="{{selFix}}" onChange="{{setFix}}"></textarea></div><sc-if value="{{selCanApply}}" hint-placeholder-val="{{false}}"><button class="btn amber" type="button" onClick="{{btnApply}}">应用建议 · 变成打通后的样子</button></sc-if></sc-if>'
  '<div><span class="lb">输入</span>' + chips("ins") + '</div><div><span class="lb">输出</span>' + chips("outs") + '</div>'
  '<div class="ins-foot"><button class="btn danger" type="button" onClick="{{btnDel}}">删除节点</button></div>'
  '</sc-if>'
  # ---- 连线
  '<sc-if value="{{showEdge}}" hint-placeholder-val="{{false}}">'
  '<div class="ins-h"><b>连线</b><button class="btn sm" type="button" onClick="{{btnClose}}">关闭</button></div>'
  '<div class="pair">{{pair}}</div>'
  '<div><span class="lb">流动的产物</span><input class="fi" value="{{eLabel}}" onChange="{{setELabel}}"></div>'
  '<div><span class="lb">产物类型</span>' + seg("dtOpts") + '</div>'
  '<div><span class="lb">关系</span>' + seg("ekOpts") + '</div>'
  '<div><span class="lb">数据契约 · 字段 / 格式</span><textarea class="fi ta" value="{{eContract}}" onChange="{{setEContract}}"></textarea></div>'
  '<div class="hint">待打通 = 现在靠人搬；打通后改成「数据」就变实线。退回 = 人审不通过回到哪一步。回填 = 结果回流到上游资产。</div>'
  '<div class="ins-foot"><button class="btn danger" type="button" onClick="{{btnDel}}">删除连线</button></div>'
  '</sc-if>'
  '</div>')

OVERLAY_TPL = ('<sc-if value="{{placing}}" hint-placeholder-val="{{false}}"><div class="ghost" style="left: {{ghostX}}px; top: {{ghostY}}px">'
               '<div class="node k-{{ghostKind}}"><div class="nh"><span class="kd {{ghostKind}}">{{ghostKindLabel}}</span></div><div class="nn">{{ghostName}}</div><div class="ns">{{ghostSub}}</div></div></div></sc-if>'
               '<sc-if value="{{hasMenu}}" hint-placeholder-val="{{false}}"><div class="menu" style="left: {{menuX}}px; top: {{menuY}}px" onMouseDown="{{stop}}"><sc-for list="{{menuItems}}" as="m" hint-placeholder-count="5"><div class="mi {{m.cls}}" onClick="{{m.pick}}">{{m.label}}</div></sc-for></div></sc-if>'
               '<sc-if value="{{hasToast}}" hint-placeholder-val="{{false}}"><div class="toast">{{toast}}</div></sc-if>')

# ---------------------------------------------------------------- 逻辑
LOGIC = r'''
var NW = 150, NH = 64, CW = 1220, CH = 1024;
var KIND = { human: '人', dog: '🐾 工作狗', skill: '技能', know: 'know-how', data: '数据 / 系统' };
var OT = { human: 'decision', dog: 'struct', skill: 'struct', know: 'text', data: 'sys' };
var DEF_LABEL = { decision: '决定', struct: '结构化产物', text: '要点', sys: '系统数据', file: '文件', event: '事件' };
function clone(o) { return JSON.parse(JSON.stringify(o)); }
class Component extends DCLogic {
  init() {
    if (this.S) return this.S;
    var D = __DATA__; try { window.__flow = this; } catch (err) {}
    this.S = { root: { nodes: clone(D.nodes), edges: clone(D.edges) }, palette: D.palette, stack: [], sel: null, multi: [], connecting: null, drag: null, marquee: null,
      placing: null, ghost: { x: 0, y: 0 }, quick: null, menu: null, zoom: 1, diff: false, labels: false, running: null, build: false, pq: '', hist: [], toast: '', seq: 100 };
    return this.S;
  }
  graph() { var S = this.init(); var g = S.root; for (var i = 0; i < S.stack.length; i++) { var n = g.nodes.filter(function (x) { return x.id === S.stack[i]; })[0]; if (!n || !n.children) { S.stack = []; return S.root; } g = n.children; } return g; }
  componentDidMount() { var self = this; this._mm = function (e) { self.winMove(e); }; this._mu = function (e) { self.winUp(e); }; window.addEventListener('mousemove', this._mm); window.addEventListener('mouseup', this._mu); }
  componentWillUnmount() { window.removeEventListener('mousemove', this._mm); window.removeEventListener('mouseup', this._mu); clearInterval(this._run); }
  refresh() { this.forceUpdate(); }
  say(msg) { var S = this.init(), self = this; S.toast = msg; this.refresh(); clearTimeout(this._tt); this._tt = setTimeout(function () { S.toast = ''; self.refresh(); }, 2200); }
  snap() { var S = this.init(); S.hist.push(JSON.stringify(S.root)); if (S.hist.length > 40) S.hist.shift(); }
  undo() { var S = this.init(); if (!S.hist.length) { this.say('没有可撤销的操作'); return; } S.root = JSON.parse(S.hist.pop()); S.sel = null; S.multi = []; S.quick = null; S.menu = null; this.graph(); this.say('已撤销'); }
  byId(id) { return this.graph().nodes.filter(function (n) { return n.id === id; })[0]; }
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  pt(e) { var r = this.rect || { left: 0, top: 0 }; var z = this.init().zoom; return { x: (e.clientX - r.left) / z, y: (e.clientY - r.top) / z }; }
  nodeAt(x, y, skip) { return this.graph().nodes.filter(function (n) { return n.id !== skip && x >= n.x && x <= n.x + NW && y >= n.y && y <= n.y + NH; })[0]; }
  /* ---- 节点事件 */
  nodeDown(e, id) {
    var S = this.init(); e.stopPropagation(); S.menu = null; S.quick = null; if (e.button !== 0) return;
    if (S.connecting) { if (S.connecting.from !== id) { this.snap(); this.addEdge(S.connecting.from, id); } S.connecting = null; this.refresh(); return; }
    var n = this.byId(id); if (!n) return;
    var ids = (S.multi.indexOf(id) >= 0) ? S.multi.slice() : [id];
    var g = this.graph(); var orig = {}; ids.forEach(function (i) { var m = g.nodes.filter(function (x) { return x.id === i; })[0]; if (m) orig[i] = { x: m.x, y: m.y }; });
    S.drag = { ids: ids, orig: orig, sx: e.clientX, sy: e.clientY, moved: false };
    e.preventDefault();
  }
  portDown(e, id) { var S = this.init(); e.stopPropagation(); e.preventDefault(); var c = e.currentTarget && e.currentTarget.closest ? e.currentTarget.closest('.canvas') : null; if (c) this.rect = c.getBoundingClientRect(); var n = this.byId(id); S.connecting = { from: id, sx: n.x + NW, sy: n.y + NH / 2, x: n.x + NW, y: n.y + NH / 2 }; S.menu = null; S.quick = null; this.refresh(); }
  roleCycle(e, id) { e.stopPropagation(); var n = this.byId(id); if (!n || n.kind === 'data') return; this.snap(); n.role = n.role === 'auto' ? 'review' : (n.role === 'review' ? 'decide' : 'auto'); this.say('谁来做 → ' + ({ auto: '自动', review: '人审', decide: '人定' })[n.role]); }
  menuOpen(e, id) { var S = this.init(); e.preventDefault(); e.stopPropagation(); S.menu = { x: e.clientX, y: e.clientY, id: id }; if (S.multi.indexOf(id) < 0) { S.multi = []; S.sel = { type: 'node', id: id }; } this.refresh(); }
  openNode(e, id) { if (e) { e.stopPropagation(); } var S = this.init(); var n = this.byId(id); if (!n || !n.children) { this.say('这个节点没有子流程；框选几个节点可以打包成工作狗'); return; } S.stack.push(id); S.sel = null; S.multi = []; S.quick = null; S.menu = null; this.refresh(); }
  /* ---- 画布事件 */
  canvasDown(e) {
    var S = this.init(); this.rect = e.currentTarget.getBoundingClientRect(); S.menu = null;
    if (S.quick) { S.quick = null; this.refresh(); return; }
    if (S.connecting) { S.connecting = null; this.refresh(); return; }
    if (e.button !== 0) return;
    var p = this.pt(e); S.marquee = { x0: p.x, y0: p.y, x1: p.x, y1: p.y, moved: false };
    if (S.sel || S.multi.length) { S.sel = null; S.multi = []; S.build = false; }
    this.refresh();
  }
  canvasMove(e) { this.rect = e.currentTarget.getBoundingClientRect(); }
  canvasUp(e) { var S = this.init(); this.rect = e.currentTarget.getBoundingClientRect(); if (S.placing) { var it = S.placing; S.placing = null; var p = this.pt(e); this.snap(); this.addNode(it, p.x, p.y, null); } }
  canvasDbl(e) { var S = this.init(); if (e.target && e.target.closest && e.target.closest('.node, .quick, .crumb, .zoom, .bar')) return; this.rect = e.currentTarget.getBoundingClientRect(); var p = this.pt(e); S.quick = { x: p.x, y: p.y, q: '', from: null }; S.marquee = null; this.refresh(); }
  winMove(e) {
    var S = this.init(), dirty = false, self = this;
    if (S.drag) { var z = S.zoom; if (Math.abs(e.clientX - S.drag.sx) + Math.abs(e.clientY - S.drag.sy) > 3) S.drag.moved = true;
      S.drag.ids.forEach(function (id) { var n = self.byId(id), o = S.drag.orig[id]; if (n && o) { n.x = Math.round(self.clamp(o.x + (e.clientX - S.drag.sx) / z, 0, CW - NW)); n.y = Math.round(self.clamp(o.y + (e.clientY - S.drag.sy) / z, 0, CH - NH)); } }); dirty = true; }
    if (S.placing) { S.ghost = { x: e.clientX + 12, y: e.clientY + 12 }; dirty = true; }
    if (S.connecting) { var p = this.pt(e); S.connecting.x = p.x; S.connecting.y = p.y; dirty = true; }
    if (S.marquee) { var q = this.pt(e); S.marquee.x1 = q.x; S.marquee.y1 = q.y; if (Math.abs(q.x - S.marquee.x0) + Math.abs(q.y - S.marquee.y0) > 4) S.marquee.moved = true; dirty = true; }
    if (dirty) this.refresh();
  }
  winUp(e) {
    var S = this.init(), dirty = false, self = this;
    if (S.drag) { var d = S.drag; S.drag = null; if (!d.moved) { S.sel = { type: 'node', id: d.ids[0] }; S.build = false; if (d.ids.length === 1) S.multi = []; } else { this.snap(); d.ids.forEach(function (id) { self.laneRule(id); }); } dirty = true; }
    if (S.connecting) { var c = S.connecting; var p = this.pt(e); var target = this.nodeAt(p.x, p.y, c.from); var far = (Math.abs(p.x - c.sx) + Math.abs(p.y - c.sy)) > 24;
      if (target) { S.connecting = null; this.snap(); this.addEdge(c.from, target.id); }
      else if (far && p.x >= 0 && p.x <= CW && p.y >= 0 && p.y <= CH) { S.connecting = null; S.quick = { x: p.x, y: p.y, q: '', from: c.from }; }
      else if (far) { S.connecting = null; }
      dirty = true; }
    if (S.placing) { S.placing = null; dirty = true; }
    if (S.marquee) { var m = S.marquee; S.marquee = null; if (m.moved) { var x0 = Math.min(m.x0, m.x1), x1 = Math.max(m.x0, m.x1), y0 = Math.min(m.y0, m.y1), y1 = Math.max(m.y0, m.y1);
        S.multi = this.graph().nodes.filter(function (n) { return n.x < x1 && n.x + NW > x0 && n.y < y1 && n.y + NH > y0; }).map(function (n) { return n.id; }); S.sel = null; if (S.multi.length === 1) { S.sel = { type: 'node', id: S.multi[0] }; S.multi = []; } } dirty = true; }
    if (dirty) this.refresh();
  }
  laneRule(id) {
    var n = this.byId(id); if (!n) return; var cy = n.y + NH / 2; var lane = cy < 440 ? 'ai' : (cy < 720 ? 'human' : 'data');
    if (n.kind === 'data') { if (lane !== 'data') { n.y = 780; this.say('系统节点留在「数据与系统」泳道'); } return; }
    if (lane === 'data') { n.y = 630; this.say('步骤节点不能放进数据泳道'); return; }
    if (n.kind === 'human' && lane === 'ai') { n.kind = 'skill'; n.role = 'auto'; n.flag = 'missing'; n.was = 'human'; n.sub = '原：' + (n.owner || '人做') + ' · 待配组件'; n.fix = n.fix || '给这一步配一个组件（技能 / 工作狗），或从组件库拖一个替换。'; this.say('「' + n.name + '」标为要自动化：还缺一个组件来做它（缺口）'); return; }
    if (n.kind !== 'human' && lane === 'human' && n.role === 'auto') { n.role = 'review'; this.say('「' + n.name + '」改为人审'); }
  }
  grab(e, it) { var S = this.init(); if (e.button !== 0) return; e.preventDefault(); S.placing = it; S.ghost = { x: e.clientX + 12, y: e.clientY + 12 }; S.menu = null; this.refresh(); }
  addNode(it, x, y, from) {
    var S = this.init(), g = this.graph(); var id = 'x' + (S.seq++); var isData = it.kind === 'data';
    var n = { id: id, kind: it.kind, role: isData ? '' : (it.role || 'auto'), name: it.name, sub: it.sub || '', x: Math.round(this.clamp(x - NW / 2, 0, CW - NW)), y: Math.round(this.clamp(y - NH / 2, 0, CH - NH)),
      flag: isData ? 'pending' : (it.flag || 'ok'), note: '', fix: isData ? '定打通方式（接口 / RPA / 文件），打通后把状态改为正常。' : '', was: 'new', owner: '', sla: '', notify: '企业微信', method: isData ? 'manual' : '', dir: isData ? 'read' : '', reuse: 1, src: it.kind === 'know' ? (it.sub || '') : '' };
    if (it.children) { n.children = clone(it.children); n.children.nodes.forEach(function (c) { c.id = id + '_' + c.id; }); n.children.edges.forEach(function (ed) { ed.id = id + '_' + ed.id; ed.from = id + '_' + ed.from; ed.to = id + '_' + ed.to; }); }
    if (isData) n.y = Math.max(n.y, 740); else if (n.y > 640) n.y = 630;
    g.nodes.push(n); if (from) this.addEdge(from, id, true);
    S.sel = { type: 'node', id: id }; S.multi = []; S.quick = null;
    if (!from) this.say(isData ? '已加入「' + it.name + '」· 默认待打通' : '已加入「' + it.name + '」'); else this.say('已新建「' + it.name + '」并连上');
  }
  addEdge(from, to, quiet) {
    var S = this.init(), g = this.graph(); if (from === to) return;
    if (g.edges.some(function (e) { return e.from === from && e.to === to; })) { this.say('已经连过了'); return; }
    var a = this.byId(from), b = this.byId(to); if (!a || !b) return;
    var kind = (a.kind === 'data' || b.kind === 'data') ? ((a.flag === 'pending' || b.flag === 'pending') ? 'pending' : 'data') : 'seq';
    var dt = OT[a.kind] || 'struct'; if (dt === 'sys' && kind !== 'pending') dt = 'sys';
    g.edges.push({ id: 'e' + (S.seq++), from: from, to: to, kind: kind, label: DEF_LABEL[dt] || '产物', dtype: dt, contract: '' });
    if (!quiet) this.say(kind === 'pending' ? '已连线 · 标为待打通' : '已连线');
  }
  select(type, id) { var S = this.init(); S.sel = { type: type, id: id }; S.multi = []; S.build = false; S.menu = null; this.refresh(); }
  setField(f, v) {
    var S = this.init(), g = this.graph(); if (!S.sel) return;
    if (S.sel.type === 'node') { var n = this.byId(S.sel.id); if (n) { if (f === 'role' || f === 'flag' || f === 'method' || f === 'dir' || f === 'notify' || f === 'src') this.snap(); n[f] = v; } }
    else { var e = g.edges.filter(function (x) { return x.id === S.sel.id; })[0]; if (e) { if (f === 'kind' || f === 'dtype') this.snap(); e[f] = v; } }
    this.refresh();
  }
  del() {
    var S = this.init(), g = this.graph(); if (!S.sel) return; this.snap();
    if (S.sel.type === 'node') { var id = S.sel.id; g.nodes = g.nodes.filter(function (n) { return n.id !== id; }); g.edges = g.edges.filter(function (e) { return e.from !== id && e.to !== id; }); }
    else { var eid = S.sel.id; g.edges = g.edges.filter(function (e) { return e.id !== eid; }); }
    S.sel = null; S.menu = null; this.say('已删除');
  }
  delMulti() { var S = this.init(), g = this.graph(); if (!S.multi.length) return; this.snap(); var ids = S.multi.slice(); g.nodes = g.nodes.filter(function (n) { return ids.indexOf(n.id) < 0; }); g.edges = g.edges.filter(function (e) { return ids.indexOf(e.from) < 0 && ids.indexOf(e.to) < 0; }); S.multi = []; S.sel = null; this.say('已删除 ' + ids.length + ' 个节点'); }
  group() {
    var S = this.init(), g = this.graph(); var ids = S.multi.slice(); if (ids.length < 2) { this.say('先框选 2 个以上节点'); return; }
    var picked = g.nodes.filter(function (n) { return ids.indexOf(n.id) >= 0 && n.kind !== 'data'; }); if (picked.length < 2) { this.say('数据节点不能打包，请选步骤节点'); return; }
    this.snap(); var pid = ids.filter(function (i) { return picked.some(function (p) { return p.id === i; }); });
    var cx = picked.reduce(function (s, n) { return s + n.x; }, 0) / picked.length, cy = picked.reduce(function (s, n) { return s + n.y; }, 0) / picked.length;
    var id = 'x' + (S.seq++); var minx = Math.min.apply(null, picked.map(function (n) { return n.x; }));
    var kids = clone(picked).map(function (n, i) { n.x = 20 + i * 170; n.y = 140; return n; }).sort(function (a, b) { return a.x - b.x; });
    var inner = g.edges.filter(function (e) { return pid.indexOf(e.from) >= 0 && pid.indexOf(e.to) >= 0; });
    var dog = { id: id, kind: 'dog', role: 'auto', name: '新工作狗（待命名）', sub: picked.length + ' 环节 · 打包自本流程', x: Math.round(this.clamp(cx, 0, CW - NW)), y: Math.round(this.clamp(Math.min(cy, 360), 0, 360)), flag: 'ok', note: '由 ' + picked.map(function (n) { return n.name; }).join('、') + ' 打包而成；改名后进犬舍。', fix: '', was: 'new', owner: '', sla: '', notify: '', method: '', dir: '', reuse: 1, src: '', children: { nodes: clone(picked).map(function (n, i) { n.x = 20 + i * 170; n.y = 140; return n; }), edges: clone(inner) } };
    g.nodes = g.nodes.filter(function (n) { return pid.indexOf(n.id) < 0; }); g.nodes.push(dog);
    g.edges = g.edges.filter(function (e) { return !(pid.indexOf(e.from) >= 0 && pid.indexOf(e.to) >= 0); }).map(function (e) { if (pid.indexOf(e.from) >= 0) e.from = id; if (pid.indexOf(e.to) >= 0) e.to = id; return e; });
    var seen = {}; g.edges = g.edges.filter(function (e) { var k = e.from + '>' + e.to; if (e.from === e.to || seen[k]) return false; seen[k] = 1; return true; });
    S.multi = []; S.sel = { type: 'node', id: id }; this.say('已打包成工作狗，双击可钻进去；改名后进犬舍');
  }
  applyFix(id) {
    var S = this.init(), g = this.graph(); var n = this.byId(id); if (!n || !n.target) return; this.snap();
    var t = n.target; if (t.role && t.role !== n.role) n.was = n.kind === 'human' ? 'human' : n.was; if (t.kind) n.kind = t.kind; if (t.role) n.role = t.role; if (t.sub) n.sub = t.sub; if (t.method) n.method = t.method; n.flag = t.flag || 'ok';
    if (n.kind === 'data') { g.edges.forEach(function (e) { if ((e.from === id || e.to === id) && e.kind === 'pending') e.kind = 'data'; }); }
    if (n.kind !== 'human' && n.y > 440) n.y = 300;
    delete n.target; this.say('已应用：「' + n.name + '」变成打通后的样子（对照现状可看变化）');
  }
  run() {
    var S = this.init(), self = this; var g = this.graph(); var seq = g.nodes.filter(function (n) { return n.kind !== 'data' && n.role === 'auto'; }).sort(function (a, b) { return a.x - b.x || a.y - b.y; }); if (!seq.length) { this.say('没有自动节点可试跑'); return; }
    clearInterval(this._run); var i = 0; S.running = seq[0].id; this.refresh();
    this._run = setInterval(function () { i++; if (i >= seq.length) { clearInterval(self._run); S.running = null; self.say('试跑完成：' + seq.length + ' 个自动节点按顺序执行（示例，不含真实调用）'); return; } S.running = seq[i].id; self.refresh(); }, 420);
  }
  edgePath(a, b, kind) {
    var ax = a.x, ay = a.y, bx = b.x, by = b.y;
    if (kind === 'loop') { var y1 = ay + NH / 2, xr = CW - 12, yb = CH - 22, x2 = bx + NW / 2, y2 = by + NH + 8; return { d: 'M ' + (ax + NW) + ' ' + y1 + ' L ' + xr + ' ' + y1 + ' L ' + xr + ' ' + yb + ' L ' + x2 + ' ' + yb + ' L ' + x2 + ' ' + y2, lx: (xr + x2) / 2, ly: yb - 6 }; }
    if (kind === 'back') { var sx = ax + NW / 2, tx = bx + NW / 2; var top = Math.min(ay, by) - 64; return { d: 'M ' + sx + ' ' + ay + ' C ' + sx + ' ' + top + ', ' + tx + ' ' + top + ', ' + tx + ' ' + by, lx: (sx + tx) / 2, ly: top + 18 }; }
    if (Math.abs(bx - ax) < 40) { var x = ax + NW / 2, xb = bx + NW / 2; if (by > ay) return { d: 'M ' + x + ' ' + (ay + NH) + ' C ' + x + ' ' + (ay + NH + 40) + ', ' + xb + ' ' + (by - 40) + ', ' + xb + ' ' + by, lx: x + 4, ly: (ay + NH + by) / 2 + 4 }; return { d: 'M ' + x + ' ' + ay + ' C ' + x + ' ' + (ay - 40) + ', ' + xb + ' ' + (by + NH + 40) + ', ' + xb + ' ' + (by + NH), lx: x + 4, ly: (ay + by + NH) / 2 + 4 }; }
    var px1 = ax + NW, py1 = ay + NH / 2, px2 = bx, py2 = by + NH / 2, c = Math.max(50, Math.abs(px2 - px1) / 2);
    return { d: 'M ' + px1 + ' ' + py1 + ' C ' + (px1 + c) + ' ' + py1 + ', ' + (px2 - c) + ' ' + py2 + ', ' + px2 + ' ' + py2, lx: (px1 + px2) / 2, ly: (py1 + py2) / 2 - 5 };
  }
  renderVals() {
    var self = this, S = this.init(), g = this.graph();
    var selN = (S.sel && S.sel.type === 'node') ? this.byId(S.sel.id) : null;
    var selE = (S.sel && S.sel.type === 'edge') ? g.edges.filter(function (x) { return x.id === S.sel.id; })[0] : null;
    var WAS = { human: '原：人做', manual: '原：手工搬', 'new': '新增' };
    var nodes = g.nodes.map(function (n) {
      var isSel = !!(selN && selN.id === n.id) || S.multi.indexOf(n.id) >= 0;
      return Object.assign({}, n, { selected: isSel, connecting: !!(S.connecting && S.connecting.from === n.id), running: S.running === n.id,
        dim: S.diff && !n.was, diff: S.diff ? (WAS[n.was] || '') : '',
        down: function (e) { self.nodeDown(e, n.id); }, port: function (e) { self.portDown(e, n.id); }, roleCycle: function (e) { self.roleCycle(e, n.id); }, menu: function (e) { self.menuOpen(e, n.id); }, open: function (e) { self.openNode(e, n.id); } });
    });
    var edges = g.edges.map(function (e) {
      var a = self.byId(e.from), b = self.byId(e.to); if (!a || !b) return null; var p = self.edgePath(a, b, e.kind); var isSel = !!(selE && selE.id === e.id);
      var show = S.labels || isSel || e.kind !== 'seq' || e.dtype === 'decision';
      return { id: e.id, d: p.d, lx: Math.round(p.lx), ly: Math.round(p.ly), label: show ? (e.label || '') : '', lcls: (e.kind === 'seq' ? e.dtype : e.kind), cls: 'edge ' + e.kind + (isSel ? ' sel' : ''), pick: function (ev) { ev.stopPropagation(); self.select('edge', e.id); } };
    }).filter(function (x) { return !!x; });
    var q = (S.pq || '').trim();
    var palette = S.palette.map(function (gp) { return { title: gp.title, sub: gp.sub, items: gp.items.filter(function (it) { return !q || (it.name + it.sub).indexOf(q) >= 0; }).map(function (it) { return { kind: it.kind, name: it.name, sub: it.sub, grab: function (e) { self.grab(e, it); } }; }) }; }).filter(function (gp) { return gp.items.length; });
    var flagged = function (k) { return g.nodes.filter(function (n) { return n.flag === k; }).map(function (n) { return { id: n.id, name: n.name, go: function () { self.select('node', n.id); } }; }); };
    var blocks = flagged('block'), missings = flagged('missing'), pendings = flagged('pending');
    var sug = g.nodes.filter(function (n) { return n.flag !== 'ok'; }).map(function (n) { return { name: n.name, fix: n.fix || '（点节点写下怎么解）', canApply: !!n.target, apply: function () { self.applyFix(n.id); } }; });
    var opts = function (f, list, cur) { return list.map(function (o) { return { label: o[1], cls: (o[0] === cur) ? ('on v-' + o[0]) : '', pick: function () { self.setField(f, o[0]); } }; }); };
    var steps = g.nodes.filter(function (n) { return n.kind !== 'data'; }); var autos = steps.filter(function (n) { return n.role === 'auto'; });
    var flat = []; S.palette.forEach(function (gp) { gp.items.forEach(function (it) { flat.push(it); }); }); flat.push({ kind: 'skill', name: '新组件（占位）', sub: '缺口 · 待定义', flag: 'missing' });
    var qq = S.quick ? (S.quick.q || '').trim() : '';
    var quickItems = S.quick ? flat.filter(function (it) { return !qq || (it.name + it.sub).indexOf(qq) >= 0; }).map(function (it) { return { kind: it.kind, name: it.name, sub: it.sub, pick: function () { var k = S.quick; self.snap(); self.addNode(it, k.x + NW / 2, k.y + NH / 2, k.from); self.refresh(); } }; }) : [];
    var scopeNode = S.stack.length ? (function () { var gg = S.root, nn = null; for (var i = 0; i < S.stack.length; i++) { nn = gg.nodes.filter(function (x) { return x.id === S.stack[i]; })[0]; if (!nn) break; gg = nn.children; } return nn; })() : null;
    var menuItems = [];
    if (S.menu) { var mn = this.byId(S.menu.id); if (mn) {
      var mk = function (label, fn, cls) { return { label: label, cls: cls || '', pick: function () { S.menu = null; fn(); self.refresh(); } }; };
      if (mn.kind !== 'data') { menuItems.push(mk('改为自动', function () { self.snap(); mn.role = 'auto'; }), mk('改为人审', function () { self.snap(); mn.role = 'review'; }), mk('改为人定', function () { self.snap(); mn.role = 'decide'; })); }
      menuItems.push(mk('标为卡点', function () { self.snap(); mn.flag = 'block'; }, 'sep'), mk('标为缺口', function () { self.snap(); mn.flag = 'missing'; }), mk('标为待打通', function () { self.snap(); mn.flag = 'pending'; }), mk('清除标记', function () { self.snap(); mn.flag = 'ok'; }));
      if (mn.children) menuItems.push(mk('打开子流程', function () { self.openNode(null, mn.id); }, 'sep'));
      if (S.multi.length >= 2) menuItems.push(mk('打包成工作狗（' + S.multi.length + '）', function () { self.group(); }, 'sep'));
      menuItems.push(mk(S.multi.length >= 2 ? '删除所选' : '删除', function () { if (S.multi.length >= 2) self.delMulti(); else { S.sel = { type: 'node', id: mn.id }; self.del(); } }, 'danger sep'));
    } }
    var v = {
      nodes: nodes, edges: edges, palette: palette, pq: S.pq, setPq: function (e) { S.pq = e.target.value; self.refresh(); },
      blocks: blocks, missings: missings, pendings: pendings, sug: sug,
      stAuto: autos.length, stRate: (steps.length ? Math.round(100 * autos.length / steps.length) : 0) + '%', stHuman: g.nodes.filter(function (n) { return n.kind === 'human'; }).length,
      stBlock: blocks.length, stMissing: missings.length, stPending: pendings.length,
      showDiag: !S.sel && !S.build, showBuild: !S.sel && S.build, showNode: !!selN, showEdge: !!selE,
      selKind: '', selKindLabel: '', selId: '', selName: '', selSub: '', selNote: '', selFix: '', selOwner: '', selSla: '', selKids: '', selReuse: 0, selHasKids: false,
      selHasRole: false, selHasFix: false, selCanApply: false, selIsHuman: false, selIsData: false, selIsDog: false, selIsSkill: false, selIsKnow: false,
      roleOpts: [], flagOpts: [], notifyOpts: [], methodOpts: [], dirOpts: [], srcOpts: [], ekOpts: [], dtOpts: [], ins: [], outs: [], pair: '', eLabel: '', eContract: '',
      placing: !!S.placing, ghostX: S.ghost.x, ghostY: S.ghost.y, ghostKind: S.placing ? S.placing.kind : 'skill', ghostKindLabel: S.placing ? (KIND[S.placing.kind] || '') : '', ghostName: S.placing ? S.placing.name : '', ghostSub: S.placing ? (S.placing.sub || '') : '',
      hasTemp: !!S.connecting, tempD: S.connecting ? ('M ' + (self.byId(S.connecting.from) ? self.byId(S.connecting.from).x + NW : 0) + ' ' + (self.byId(S.connecting.from) ? self.byId(S.connecting.from).y + NH / 2 : 0) + ' L ' + S.connecting.x + ' ' + S.connecting.y) : '',
      hasMarquee: !!(S.marquee && S.marquee.moved), mqX: S.marquee ? Math.min(S.marquee.x0, S.marquee.x1) : 0, mqY: S.marquee ? Math.min(S.marquee.y0, S.marquee.y1) : 0, mqW: S.marquee ? Math.abs(S.marquee.x1 - S.marquee.x0) : 0, mqH: S.marquee ? Math.abs(S.marquee.y1 - S.marquee.y0) : 0,
      hasQuick: !!S.quick, quickX: S.quick ? Math.min(S.quick.x, CW - 250) : 0, quickY: S.quick ? Math.min(S.quick.y, CH - 300) : 0, quickQ: S.quick ? S.quick.q : '', quickHint: (S.quick && S.quick.from) ? '接在「' + (self.byId(S.quick.from) || {}).name + '」之后…' : '搜组件，回车前先点选', quickItems: quickItems,
      setQuickQ: function (e) { if (S.quick) { S.quick.q = e.target.value; self.refresh(); } }, stop: function (e) { e.stopPropagation(); },
      canvasDown: function (e) { self.canvasDown(e); }, canvasMove: function (e) { self.canvasMove(e); }, canvasUp: function (e) { self.canvasUp(e); }, canvasDbl: function (e) { self.canvasDbl(e); },
      hasMenu: !!S.menu, menuX: S.menu ? S.menu.x : 0, menuY: S.menu ? S.menu.y : 0, menuItems: menuItems,
      hasMulti: S.multi.length >= 2, multiN: S.multi.length, btnGroup: function () { self.group(); self.refresh(); }, btnDelMulti: function () { self.delMulti(); self.refresh(); }, btnClearMulti: function () { S.multi = []; self.refresh(); },
      inScope: !!scopeNode, scopeName: scopeNode ? scopeNode.name : '', scopeSub: scopeNode ? ('· ' + scopeNode.sub) : '', goRoot: function () { S.stack = []; S.sel = null; S.multi = []; self.refresh(); },
      zoom: S.zoom, zoomPct: Math.round(S.zoom * 100) + '%', zoomIn: function () { S.zoom = Math.min(1.6, +(S.zoom + 0.1).toFixed(2)); self.refresh(); }, zoomOut: function () { S.zoom = Math.max(0.5, +(S.zoom - 0.1).toFixed(2)); self.refresh(); }, zoomReset: function () { S.zoom = 1; self.refresh(); }, zoomFit: function () { S.zoom = 0.8; self.refresh(); },
      diffOn: S.diff ? 'on' : '', labelsOn: S.labels ? 'on' : '', btnDiff: function () { S.diff = !S.diff; self.refresh(); }, btnLabels: function () { S.labels = !S.labels; self.refresh(); },
      btnUndo: function () { self.undo(); }, btnRun: function () { self.run(); },
      btnBuild: function () { S.sel = null; S.multi = []; S.build = true; self.refresh(); },
      btnReset: function () { self.S = null; self.init(); self.say('已恢复示例流程'); },
      btnClose: function () { S.sel = null; S.build = false; self.refresh(); },
      btnDel: function () { self.del(); }, btnApply: function () { if (selN) self.applyFix(selN.id); }, btnOpen: function () { if (selN) self.openNode(null, selN.id); },
      btnNewComp: function () { self.snap(); self.addNode({ kind: 'skill', name: '新组件（待定义）', sub: '缺口 · 说清它要做什么', flag: 'missing' }, 600, 330, null); self.refresh(); },
      setName: function (e) { self.setField('name', e.target.value); }, setSub: function (e) { self.setField('sub', e.target.value); }, setNote: function (e) { self.setField('note', e.target.value); }, setFix: function (e) { self.setField('fix', e.target.value); },
      setOwner: function (e) { self.setField('owner', e.target.value); }, setSla: function (e) { self.setField('sla', e.target.value); },
      setELabel: function (e) { self.setField('label', e.target.value); }, setEContract: function (e) { self.setField('contract', e.target.value); },
      bSteps: [], bTools: [], bGates: [], bTodo: [], bSummary: ''
    };
    if (S.build) {
      v.bSteps = g.nodes.filter(function (n) { return n.kind !== 'data' && n.role === 'auto'; }).sort(function (a, b) { return a.x - b.x || a.y - b.y; }).map(function (n) { return { name: n.name, sub: (KIND[n.kind] || '') }; });
      v.bTools = g.nodes.filter(function (n) { return n.kind === 'data'; }).map(function (n) { return { name: n.name + (n.flag === 'pending' ? ' · 待打通' : ''), go: function () { self.select('node', n.id); } }; });
      v.bGates = g.nodes.filter(function (n) { return n.kind === 'human' && n.role === 'decide'; }).map(function (n) { return { name: n.name, go: function () { self.select('node', n.id); } }; });
      v.bTodo = g.nodes.filter(function (n) { return n.flag === 'missing' || n.flag === 'block'; }).map(function (n) { return { name: n.name, sub: ({ missing: '缺口，需配组件或补材料', block: '卡点，需打通或改人审' })[n.flag] }; });
      v.bSummary = '资产包草案：' + v.bSteps.length + ' 个环节、' + v.bTools.length + ' 项工具、' + v.bGates.length + ' 个人工确认点；自动化率 ' + v.stRate + '。缺口和卡点不解决也能建，会写进未达标清单。';
    }
    if (selN) {
      var link = function (id) { var n = self.byId(id); return n ? { id: n.id, name: n.name, go: function () { self.select('node', n.id); } } : null; };
      v.selKind = selN.kind; v.selKindLabel = KIND[selN.kind] || selN.kind; v.selId = selN.id; v.selName = selN.name; v.selSub = selN.sub || ''; v.selNote = selN.note || ''; v.selFix = selN.fix || '';
      v.selOwner = selN.owner || ''; v.selSla = selN.sla || ''; v.selReuse = selN.reuse || 1; v.selHasKids = !!(selN.children && selN.children.nodes.length); v.selKids = v.selHasKids ? (selN.children.nodes.length + ' 环节') : '无（可框选打包）';
      v.selHasRole = selN.kind !== 'data'; v.selHasFix = selN.flag !== 'ok'; v.selCanApply = !!selN.target;
      v.selIsHuman = selN.kind === 'human'; v.selIsData = selN.kind === 'data'; v.selIsDog = selN.kind === 'dog'; v.selIsSkill = selN.kind === 'skill'; v.selIsKnow = selN.kind === 'know';
      v.roleOpts = opts('role', [['auto', '自动'], ['review', '人审'], ['decide', '人定']], selN.role);
      v.flagOpts = opts('flag', [['ok', '正常'], ['block', '卡点'], ['missing', '缺口'], ['pending', '待打通']], selN.flag);
      v.notifyOpts = opts('notify', [['企业微信', '企业微信'], ['邮件', '邮件'], ['站内', '站内']], selN.notify);
      v.methodOpts = opts('method', [['api', '接口'], ['rpa', 'RPA'], ['file', '文件'], ['manual', '人工']], selN.method);
      v.dirOpts = opts('dir', [['read', '读'], ['write', '写'], ['rw', '读写']], selN.dir);
      v.srcOpts = opts('src', [['行业库', '行业库'], ['你的材料', '你的材料'], ['待沉淀', '待沉淀']], selN.src);
      v.ins = g.edges.filter(function (e) { return e.to === selN.id; }).map(function (e) { return link(e.from); }).filter(function (x) { return !!x; });
      v.outs = g.edges.filter(function (e) { return e.from === selN.id; }).map(function (e) { return link(e.to); }).filter(function (x) { return !!x; });
    }
    if (selE) {
      var a = this.byId(selE.from), b = this.byId(selE.to);
      v.pair = (a ? a.name : '?') + ' → ' + (b ? b.name : '?'); v.eLabel = selE.label || ''; v.eContract = selE.contract || '';
      v.ekOpts = opts('kind', [['seq', '顺序'], ['data', '数据'], ['pending', '待打通'], ['loop', '回填'], ['back', '退回']], selE.kind);
      v.dtOpts = opts('dtype', [['file', '文件'], ['struct', '结构化'], ['text', '文本'], ['decision', '决定'], ['event', '事件'], ['sys', '系统数据']], selE.dtype);
    }
    return v;
  }
}
'''

FLOW_CANVAS = helmet(NODE_CSS + CANVAS_CSS) + (
    f'<div class="fc" style="width:1920px;height:1080px;display:grid;grid-template-columns:240px minmax(0, 1fr);grid-template-rows:56px minmax(0, 1fr);overflow:hidden;background:{CHATBG};color:{INK};position:relative">'
    + sidebar(flow_active=True)
    + topbar("投标流程 · 组织流程画布", chips=(), right=TOPBAR_RIGHT)
    + '<div class="main"><div class="pal">' + PALETTE_TPL + '</div>' + CANVAS_TPL + INSPECTOR_TPL + '</div>'
    + OVERLAY_TPL + '</div>\n</x-dc>\n'
    + '<script data-dc-script data-props=\'{"$preview":{"width":1920,"height":1080}}\'>\n'
    + LOGIC.replace('__DATA__', json.dumps({"nodes": NODES, "edges": EDGE_OBJS, "palette": PALETTE}, ensure_ascii=False))
    + '\n</script>\n</body>\n</html>\n')

FLOW_Y = 2 * (H + GY)
FLOW_X = W + GX
if __name__ == "__main__":
    gen.build(
        extra_files={"FlowCanvas.dc.html": FLOW_CANVAS, "FlowNode.dc.html": FLOW_NODE, "DesignScreen.dc.html": __import__("design_screen").DESIGN, "Onboarding.dc.html": __import__("onboarding_screen").ONBOARDING,
                     "Journey.dc.html": __import__("journey_screen").JOURNEY,
                     **{f"{k}.dc.html": getattr(__import__("screens_v3"), v) for k, v in (("Report", "REPORT"), ("ComponentDetail", "COMPONENT_DETAIL"), ("Retro", "RETRO"))},
                     **{f"{k}.dc.html": getattr(__import__("screens_v2"), v) for k, v in (("Main", "MAIN"), ("Confirm", "CONFIRM"), ("Deliver", "DELIVER"), ("Kennel", "KENNEL"), ("WorkdogRun", "RUN"))}},
        extra_boards=[
            {"file": "Onboarding.dc.html", "x": -(W + GX), "y": 0, "w": W, "h": H, "title": "00 首次引导 · 从 0 到 1（第一周把一条流程跑起来）"},
            {"file": "Journey.dc.html", "x": -(W + GX), "y": H + GY, "w": W, "h": H, "title": "12 用户旅程 · 每一步（在哪屏 · 你做什么 · 它做什么 · 停不停）"},
            {"file": "ComponentDetail.dc.html", "x": 3 * (W + GX), "y": H + GY, "w": W, "h": H, "title": "09 组件详情 · 合同审查（组件即资产：契约 · 复用 · 版本）"},
            {"file": "Retro.dc.html", "x": 4 * (W + GX), "y": H + GY, "w": W, "h": H, "title": "10 复盘与回归 · 四指标回填 + 回归门槛 + 回流建议"},
            {"file": "Report.dc.html", "x": W + GX, "y": 3980, "w": W, "h": H, "title": "08 汇报模式 · 给老板看的一屏（五问 30 秒答完）"},
            {"file": "DesignScreen.dc.html", "x": 2 * (W + GX), "y": H + GY, "w": W, "h": H, "title": "11 设计 · 从一个想法到能开工的三件套（产品定义 · 故事 · 图）"},
            {"file": "FlowCanvas.dc.html", "x": FLOW_X, "y": FLOW_Y, "w": 1920, "h": 1080, "title": "07 流程画布 · 投标流程（拖连线 · 框选打包 · 钻取 · 对照 · 试跑）", "is_interactive": True, "expand": "fill"},
            {"file": "FlowNode.dc.html", "x": FLOW_X + 1920 + GX, "y": FLOW_Y, "w": 150, "h": 64, "title": "FlowNode · 节点组件（变体用上方调节）"},
        ],
        extra_notes=[
            {"id": "journey-note", "x": -(W + GX), "y": H + GY - 230, "w": 660,
             "text": "12 用户旅程（新）· 把「用户怎么用」的每一步摊开\n四个阶段十二步，每步写清：在哪屏 · 你做什么 · 它做什么 · 停不停\n三条贯穿规则：先做出来再纠错（不先问问题）· 纠错只有一种语法（说编号）· 只在不可逆动作前停（其余走 ★ 默认）\n全流程只有三个地方会停：按这个建 / 人工确认点 / 改版不改版；其中只有人工确认点在不回复时会一直停着\n逐步规格（含每步的产物、异常路径、出错怎么办）见 design/workbench/交互流程.md"},
            {"id": "new-screens-note", "x": 3 * (W + GX), "y": H + GY - 250, "w": 700,
             "text": "09 组件详情 / 10 复盘与回归（新）· 补齐 SPEC §5 里已列规格但没画的屏\n09 回答原则 3「组件即资产」：一只工作狗的输入输出契约、参数、7 环节子图、复用于哪两条流程与节点号、版本与改动；右栏是「改一处全局同步」与发布前必过项\n10 是飞轮的操作面：四指标回填（漏审 / 误报 / 定位失败 / 虚构来源，带上期对比）、2 份历史样本的回归对照、不达标就不许发布、右栏给出到达触发条件的回流建议与已知规律\n两屏的数据都来自狗自己的 复盘/日志.md 与 验收清单.json，不经服务端"},
            {"id": "report-note", "x": W + GX, "y": 3980 - 250, "w": 700,
             "text": "08 汇报模式（新）· 原则 1「先读懂再动手」的直接产物\n与 07 流程画布同一份数据（flow.py 的 NODES / EDGES），只读、放大、隐藏组件库与属性面板\n一屏要能 30 秒答完五问：哪些自动 · 人在哪 · 卡在哪 · 缺什么 · 打通什么——所以顶部固定五个数字，图上只保留卡点 / 缺口 / 待打通三种标记与人审 / 人定徽章\n底部三张卡是诊断结论，每条写「怎么解」与「解完变成什么」；主按钮只有一个：先打通招标平台"},
            {"id": "onboarding-note", "x": -(W + GX), "y": -190, "w": 640,
             "text": "00 首次引导 · 使用逻辑（从 0 到 1）\n第一周只做一条流程、一只狗：画出现状（30 分钟）→ 建第一只狗（30 分钟）→ 上岗一次（1 小时，只在递交前停）→ 复盘（15 分钟）→ 回到图上（10 分钟，卡点 2 → 0）\n每一步有输入、产出、屏幕、耗时、停在哪；用户只做纠错，不写文档、不整理材料、不一次建多只狗\n文档：design/workbench/使用逻辑.md · 图：design/figures/first-run.svg · QUICKSTART 第八节"},
            {"id": "design-note", "x": 2 * (W + GX), "y": H + 30, "w": 640,
             "text": "11 设计（新）· 入口「设计」：一个产品想法 → 三件套 + 图，不判级\n五问首行（为谁 / 解决什么 / 怎么算成功 / 不做什么 / 先做哪条）是验收，动笔前先填；答不出的转 H\n一页产品定义骨架固定：一句话 · 用户表 · ★ 决定 · 核心场景 · 非目标 · H 与验法 · 里程碑 · 指标 · 待拍板\n右栏图从同一份 flow JSON 渲染，档位由环境决定（高保真 / Mermaid / 泳道表），写成 H\n交付前四视角找茬：老板 / 搭建者 / 执行者 / 反方；唯一一张卡只问深度与楔子，不回复即 ★ 生效\n方法：references/design-mode.md · 范例：design/workbench/ 三件套"},
            {"id": "flow-note", "x": FLOW_X, "y": FLOW_Y - 300, "w": 720,
             "text": "07 流程画布（可交互）· 八条设计原则的落点\n1 先读懂再动手：泳道 + 三种标记回答五个问题（哪些自动 / 人在哪 / 卡在哪 / 缺什么 / 打通什么）\n2 两条线不混：顺序线（灰实）/ 数据线（深灰实）/ 待打通（蓝虚）/ 退回（红虚）/ 回填（绿虚），线上标产物\n3 节点即组件：工作狗 = 子图，双击钻取；框选多个 = 打包成新工作狗\n4 类型化端口：端口颜色 = 产物类型，新连线自动带默认产物与契约\n5 一张图三种看法：目标态（默认）/ 对照现状（每个节点标「原：人做 / 手工搬 / 新增」）/ 试跑（按顺序点亮）\n6 人机边界可拖：人的步骤拖进 AI 泳道 = 要自动化并标缺口；AI 拖进人泳道 = 改人审\n7 默认值先行：AI 先给出图，人只纠错；诊断建议一键「应用」变成打通后的样子\n8 最短路径：从端口拖到空白 = 新建并连上；双击空白搜组件；右键菜单；撤销"},
        ],
    )
