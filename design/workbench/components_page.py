# -*- coding: utf-8 -*-
"""「组件」页：每个组件一张画板，列出它的全部状态（状态表），与三个可传参的真组件（Sidebar / Topbar / InputBar，见 chrome_components.py）
和 FlowNode（flow.py）放在一起。状态表里的每一块都由生成屏幕的同一个 Python 函数产出，所以屏幕和组件表不会漂移。
开发时每个组件对应哪个开源件、有哪些 props，见 组件清单.md。"""
import gen, flow, screens_v2 as v2, screens_v3 as v3, steps_entry as se, steps_run as sr, steps_diagnose as sd, steps_canvas as sc, steps_design as sdn, library_screen as ls, journey_screen as js
from gen import (ico, HEAD, TAIL, AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, MID, LO, FIXBG, MONO,
                 user_msg, bot_msg, filechip, option, question, stage, stages_panel, tile, tiles, tree_row, assumption, stat)

W = 760

def block(label, html, note='', bg=CHATBG):
    n = f'<span style="font-size:11.5px;color:{SUB}">{note}</span>' if note else ''
    return (f'<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">{label}</span>{n}</div>'
            f'<div style="background:{bg};border:1px solid {LINE};border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px">{html}</div></div>')

def sheet(title, cname, sub, blocks, dev, width=W, height=None, extra_css=''):
    body = (f'<div style="width:{width}px;{"height:" + str(height) + "px;" if height else ""}background:{WHITE};color:{INK};padding:22px 26px 26px;display:flex;flex-direction:column;gap:16px;overflow:hidden">'
            f'<div style="display:flex;flex-direction:column;gap:3px"><div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:18px;font-weight:800">{title}</span><span style="font-family:{MONO};font-size:12px;color:{SUB}">{cname}</span></div>'
            f'<span style="font-size:12.5px;color:{SUB};line-height:1.6">{sub}</span></div>'
            + ''.join(blocks)
            + f'<div style="font-family:{MONO};font-size:11px;color:{SUB};line-height:1.7;border-top:1px solid {LINE};padding-top:8px">{dev}</div></div>')
    head = HEAD.replace('  </style>\n</helmet>', extra_css + '  </style>\n</helmet>') if extra_css else HEAD
    return head + body + TAIL

# ------------------------------------------------------------------ 纠错卡家族
CARD = sheet("纠错卡", "CorrectionCard", "同一个组件的五种用法：架构级两题（02）· 生效收起态（02.2）· 人工确认点（05.3）· 止损三栏（05.5）· 诊断一题（13.2）。规则：★ 预填、不回复即生效、每题末尾有逃生口；只有人工确认点会一直停。", [
    block("架构级两题 · 02", v2.card, "≤2 题，其余转 H chip；主按钮写「不用回复」"),
    block("生效收起态 · 02.2", se.applied_card, "回复后收成一行，只重出受影响部分"),
    block("人工确认点 · 05.3", v2.confirm_point, "对外发送前；不回复一直停"),
    block("止损三栏 · 05.5", sr.stop_card, "同时给已达标 / 未达标 / 卡点报告"),
    block("诊断一题 · 13.2", sd.diag_q, "只在改法真有分歧时出现"),
], "props: kind=architect|applied|gate|stop|diagnose · questions[] · assumptions[] · defaultAction · sticky(gate only) · 开源：shadcn/ui Card + RadioGroup + Badge")

# ------------------------------------------------------------------ 流水线
STAGES = sheet("流水线", "StagesPanel · StageRow", "行的四种状态：done 绿勾 / run 琥珀旋转 / todo 虚线圆 38% / pause 琥珀旗（停机）/ stop 红警告（止损）。面板标题带来源（验收清单.json）与计数。", [
    block("构建流水线 · 03", stages_panel("构建流水线", v2.build_rows), "全部 done"),
    block("生成中 · 02 / 01.3", stages_panel("反推现状 · 投标流程 · 第 4 / 5 步", se.gen_rows), "done → run → todo"),
    block("上岗 · 停在人工确认点 · 05.3", stages_panel("审查流水线 · 验收清单.json · 15 / 15 通过", v2.law_rows), "pause 行"),
    block("上岗 · 止损 · 05.5", stages_panel("撰写流水线 · 验收清单.json · 6 / 10 通过", sr.bid_rows), "stop 行"),
], "props: title · source · rows[{label, detail, state: done|run|todo|pause|stop}] · 开源：自绘（shadcn/ui Card 容器）· 数据来自 验收清单.json")

# ------------------------------------------------------------------ 消息
typing = (f'<div style="align-self:flex-start;display:flex;gap:6px;align-items:center;background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:12px 16px">'
          f'<span style="width:7px;height:7px;border-radius:50%;background:{SUB}"></span><span style="width:7px;height:7px;border-radius:50%;background:{SUB};opacity:.6"></span><span style="width:7px;height:7px;border-radius:50%;background:{SUB};opacity:.3"></span></div>')
bot_actions = bot_msg("合同审查工作狗 ⚖️", '已通过。三件套落盘；下一步三选一：<div style="margin-top:8px">' + sr.next_chips + '</div>')
MSG = sheet("消息气泡", "Message", "用户 = 琥珀实底右下角 4；机器人 = 白底线框左下角 4，who 标签 12/800 琥珀；文件 chip 半透明白；输入中三点。机器人消息可内嵌动作 chip 行（05.4）。", [
    block("用户 · 带文件", f'<div style="display:flex;flex-direction:column;gap:10px">{user_msg(filechip("设备采购合同.pdf · 2.4 MB") + "<div>审查这份合同。立场：<b>甲方风险优先</b>。</div>")}{user_msg("1C")}</div>'),
    block("机器人 · 带动作行", f'<div style="display:flex;flex-direction:column;gap:10px">{bot_actions}{typing}</div>'),
], "props: role=user|bot · who · files[] · html · actions[] · 开源：自绘（Tailwind）；输入中用 shadcn/ui Skeleton")

# ------------------------------------------------------------------ 工作狗卡
DOG = sheet("工作狗卡", "DogCard", "四种状态：回归达标 / 止损待处理 / 新建尚未运行 / 空槽（造一只）。状态来自 验收清单.json；「用于 N 条流程」来自 flow JSON。", [
    block("四种状态", f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:14px">{"".join(v2.cards)}</div>'.replace('min-height:236px', 'min-height:220px')),
], "props: avatar · name · desc · version · stats[3] · status=ok|stop|new · flows · actions · 开源：shadcn/ui Card + Badge + Button", width=1000)

# ------------------------------------------------------------------ 诊断条目
diag_rows = ('<div class="fc" style="display:flex;flex-direction:column;gap:12px">'
             '<div class="dg">'
             '<div class="dg-row"><div class="t"><span class="dot block"></span>卡点 2<span class="muted" style="font-weight:500;margin-left:auto">流程在哪等人</span></div><div class="chips"><span class="chip">获取招标文件</span><span class="chip">报价</span></div></div>'
             '<div class="dg-row"><div class="t"><span class="dot missing"></span>缺口 1<span class="muted" style="font-weight:500;margin-left:auto">缺组件 / 材料</span></div><div class="chips"><span class="chip">素材库</span></div></div>'
             '<div class="dg-row"><div class="t"><span class="dot pending"></span>待打通 4<span class="muted" style="font-weight:500;margin-left:auto">人在搬数据</span></div><div class="chips"><span class="chip">CRM</span><span class="chip">招标平台</span><span class="chip">ERP 成本</span><span class="chip">OA 审批</span></div></div></div>'
             '<ol class="sug"><li><b>获取招标文件</b>：招标平台打通后改为关键词监控自动拉取<span class="ap">应用</span></li><li><b>素材库</b>：补齐业绩扫描件与人员证书<span class="ap">应用</span></li></ol></div>')
DIAG = sheet("诊断条目", "DiagCard · Suggestion", "三种标记（卡点红 / 缺口琥珀 / 待打通蓝）在四个地方复用：07 属性面板（汇总 + 建议「应用」）· 08 汇报三卡 · 03 未达标清单链到节点 · 05.5 未达标行。", [
    block("07 属性面板 · 汇总 + 建议", diag_rows),
    block("08 汇报三卡", f'<div style="display:flex;gap:12px">{v3._fix(HI, "卡点 · 获取招标文件", "商务每天刷平台，常漏标。打通后改关键词监控自动拉取。")}{v3._fix(HI, "卡点 · 报价", "等财务出成本。接 ERP 后先自动出报价框架，人只定折扣。")}{v3._fix(AMBER, "缺口 · 素材库", "补齐后每次投标回填，命中率越用越高。")}</div>'),
    block("03 未达标清单 · 链到节点", v2.gap_card),
    block("05.5 未达标行", f'<div style="display:flex;flex-direction:column">{sr.gap_row("业绩扫描件 × 2（近三年同类项目）", "放进 素材库/业绩/ 即可，重跑时自动命中")}{sr.gap_row("项目经理一级建造师证书", "素材库/人员/ 缺此人")}</div>'),
], "props: flag=block|missing|pending · name · fix · nodeId(链接) · canApply · 开源：shadcn/ui Card + Badge；「应用」= React Flow 节点数据更新", extra_css=flow.CANVAS_CSS)

# ------------------------------------------------------------------ 指标块
TILES = sheet("指标块", "Tile · Metric · FiveNumbers · DimRow", "四种数字展示：指标块（4 列）· 五问数字（08 顶部）· 复盘指标（带上期对比，0→0 显示持平）· 十维打分行（13.2）。数值 19–30/800，语义色只在含义上用。", [
    block("指标块 · 03 / 05", tiles([("5 / 6", "验收", OK), ("5", "环节", INK), ("2", "假设", INK), ("1", "未达标", AMBER)])),
    block("五问数字 · 08", v3.five),
    block("复盘指标 · 10", f'<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:12px">{v3._metric("漏审", "1", "2", "↓ 绿")}{v3._metric("误报", "3", "1", "↑ 红")}{v3._metric("定位失败", "0", "0", "0 → 0 持平（绿）")}{v3._metric("虚构来源", "0", "0", "持平")}</div>'),
    block("十维打分行 · 13.2", f'<div style="display:flex;flex-direction:column">{sd.dim_row("完整性", 3, "无人设 · 无领域 · 无格式")}{sd.dim_row("语法", 8, "无错")}{sd.dim_row("目标对齐", 7, "各部分服务同一目标")}</div>'),
], "props: value · label · color · base(对比) · 开源：Tremor Metric / Card；进度条用 shadcn/ui Progress")

# ------------------------------------------------------------------ chip 家族
def hchip_plain(t):
    return f'<span style="display:inline-flex;align-items:center;height:26px;padding:0 9px;border-radius:6px;background:{CHATBG};border:1px solid {LINE};font-size:12px;color:{SUB}"><b style="font-family:{MONO};color:{AMBER};margin-right:5px">H</b>{t}</span>'
CHIPS = sheet("标签与识别条", "Chip · RecognitionBar · Badge", "所有小标签：入口 chip（01）· 识别条（01.2 / 13.1）· H 假设 chip（02）· 来源标签（02b）· 筛选（04 / 14）· 顶栏上下文 chip · 状态徽章 · 类型 pill（14）。", [
    block("入口 chip · 01", f'<div style="display:flex;gap:8px;flex-wrap:wrap">{v2.entry_chips}</div>'),
    block("识别条 · 01.2 / 13.1", se.recog_bar("一段流程", " → 泳道图找卡点", "不判级，直接出图", [se.ENTRIES[0], se.ENTRIES[1], se.ENTRIES[3]])),
    block("H 假设 chip · 02", f'<div style="display:flex;gap:6px;flex-wrap:wrap">{hchip_plain("1 竞品固定 3–5 家")}{hchip_plain("2 高管摘要 + 团队附录")}{hchip_plain("3 来源：官网 / 公告 / 行业媒体")}</div>'),
    block("来源标签 · 插槽", gen.chip_body),
    block("筛选 · 04 / 14", f'<div style="display:flex;gap:8px">{ls.filters}</div>'),
    block("状态徽章 · 类型 pill", f'<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">{v2.ok_badge}{v2.stop_badge}{v2.new_badge}</div><div style="display:flex;gap:8px;flex-wrap:wrap">' + ''.join(f'<span style="display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:6px;background:{bg};color:{c};font-size:11.5px;font-weight:700">{k}</span>' for k, c, bg in [("工作狗", AMBER, AMBER_SOFT), ("技能", LO, "#eff4ff"), ("know-how", OK, FIXBG), ("数据", INK, "#f5f2ec")]) + '</div>'),
], "props: kind · label · icon · active · 开源：shadcn/ui Badge / Toggle；识别条 = Badge + ToggleGroup")

# ------------------------------------------------------------------ 行家族
ROWS = sheet("行", "AssumptionRow · AcceptanceRow · RunRow · TreeRow · KVRow · StoryRow", "六种「一行一条」：H 假设行（带改）· 验收行（绿勾）· 运行行（07.5 属性面板）· 目录树行 · 键值行（09）· 故事行（11.2）。", [
    block("H 假设行 · 03 / 13.3", f'<div style="display:flex;flex-direction:column">{assumption("H1", "报告语言为中文，周一 09:00 生成", "对话语言 · 「每周」")}{assumption("H2", "数据以公开信息为限", "未提及内部数据源")}</div>'),
    block("验收行 · 03.2 / 09", f'<div style="display:flex;flex-direction:column">{se.acc_row("恰好 3 条，每条 ≤ 30 字")}{se.acc_row("不引入纪要里没有的信息")}</div>'),
    block("运行行 · 07.5", f'<div class="fc" style="display:flex;flex-direction:column">{sc.runrow("n3", "招标解析与废标项", "✓ 2 / 2", "ok")}{sc.runrow("n7", "分章撰写", "● 1 / 3", "run")}{sc.runrow("n10", "合规自查与模拟评审", "0 / 2", "todo")}</div>'),
    block("目录树行 · 03 / 05.4", f'<div style="font-family:{MONO};font-size:12.5px;line-height:1.6;background:{WHITE};border:1px solid {LINE};border-radius:12px;padding:10px 16px">{"".join(tree_row(*t) for t in sr.OUT_TREE)}</div>'),
    block("键值行 · 09", f'<div style="display:flex;flex-direction:column">{v3._row("输入", "合同 PDF / DOCX ＋ 立场 ＋ 委托方")}{v3._row("失败回退", "环节 4 无搜索工具时降级为 [待核实] ＋ 人工核对清单")}</div>'),
    block("故事行 · 11.2", f'<table style="border-collapse:collapse;width:100%"><tbody>{sdn.s_row(*sdn.STORIES[0])}{sdn.s_row(*sdn.STORIES[6])}</tbody></table>'),
], "props: 各自的字段 + 可选动作（改 / 链接）· 开源：shadcn/ui Table（行家族统一为 TableRow 变体）", extra_css=flow.CANVAS_CSS + sc.EXTRA_CSS)

# ------------------------------------------------------------------ 预览卡与入口卡
PREVIEW = sheet("预览卡与入口卡", "PreviewCard · EntryCard · SourceCard", "三种「告诉你会得到什么」的卡：交付物预览卡（01 默认 / 已选 / 压暗）· 画布空态入口卡（07.0）· 组件来源卡（14）。", [
    block("交付物预览卡 · 默认 / 已选 / 压暗", v2.preview_card("flow", "泳道流程图", "一段流程 → 三条道，标卡点 · 缺口 · 待打通", "五问 30 秒") + se.picked("flow", "泳道流程图", "自动 / 人 / 数据与系统三条道", "有材料：先从 2 份材料反推现状") + se.dim(v2.preview_card("folder", "资产包", "一句话 → 路由 · 主控 · 各环节提示词", "拖进任意工作区即上岗"))),
    block("画布空态入口卡 · 07.0", f'<div class="fc" style="display:flex;gap:12px">' + sc.empty_cards.split('<div style="display:flex;gap:16px">')[1].rsplit('</div></div></div>', 1)[0] + '</div>'),
    block("组件来源卡 · 14", f'<div style="display:flex;gap:12px">{ls.src_card("grid", "犬舍 → 工作狗", "03 交付时自动入库")}{ls.src_card("edit", "诊断存入 → 技能", "单条提示词存进来当技能")}</div>'),
], "props: icon · title · sub · note · state=default|picked|dim · cta · 开源：shadcn/ui Card", extra_css=flow.CANVAS_CSS + sc.EXTRA_CSS)

# ------------------------------------------------------------------ FlowEdge
DEFS_INNER = flow.DEFS_SVG.replace('<svg class="defs" viewBox="0 0 10 10">', '').replace('</svg>', '')
EDGE_LABEL = {"seq": "应答矩阵", "data": "素材 + 待补清单", "pending": "公告、招标文件", "loop": "新章节、评审意见", "back": "不通过 · 退回"}
EDGE_NOTE = {"seq": "顺序线 · 灰实 · 标产物", "data": "数据线 · 深灰实", "pending": "待打通 · 蓝虚 · 现在靠人搬", "loop": "回填 · 绿虚 · 结果回流上游", "back": "退回 · 红虚 · 人审不通过"}
def _edge_demo(kind, label, sel=False):
    cls = f'edge {kind}' + (' sel' if sel else '')
    lcls = kind if kind != "seq" else "struct"
    return (f'<div style="display:flex;align-items:center;gap:12px"><span style="width:88px;font-size:12.5px;font-weight:700;flex-shrink:0">{label}</span>'
            f'<div class="fc" style="position:relative;width:420px;height:44px;flex-shrink:0"><svg class="esvg" style="width:420px;height:44px" viewBox="0 0 420 44">{DEFS_INNER}<path class="{cls}" d="M 8 22 C 120 22, 300 22, 412 22"></path></svg>'
            f'<div class="elabh {lcls}" style="left:210px;top:22px">{EDGE_LABEL[kind]}</div></div>'
            f'<span style="font-size:11.5px;color:{SUB}">{EDGE_NOTE[kind]}</span></div>')
EDGE = sheet("连线", "FlowEdge", "五种关系 × 选中态，线上标产物（产物类型决定标签颜色）。端口颜色 = 产物类型：decision 琥珀 / struct 深灰 / text 绿 / sys 蓝。", [
    block("五种关系", '<div style="display:flex;flex-direction:column;gap:10px">' + ''.join(_edge_demo(k, l) for k, l in [("seq", "顺序"), ("data", "数据"), ("pending", "待打通"), ("loop", "回填"), ("back", "退回")]) + '</div>'),
    block("选中态", _edge_demo("seq", "选中", sel=True)),
    block("端口", '<div class="fc" style="display:flex;gap:18px;align-items:center;padding-left:10px">' + ''.join(f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px"><span class="port t-{t}" style="position:static;margin:0"></span>{n}</span>' for t, n in [("decision", "decision"), ("struct", "struct"), ("text", "text"), ("sys", "sys")]) + '</div>'),
], "props: kind=seq|data|pending|loop|back · label · dtype · selected · contract · 开源：React Flow 自定义 Edge（BaseEdge + EdgeLabelRenderer）", extra_css=flow.NODE_CSS + flow.CANVAS_CSS)

# ------------------------------------------------------------------ FlowNode 状态矩阵（静态，真组件在 FlowNode.dc.html）
def _n(kind, role, flag, name, sub, **kw):
    return sc.node(dict(id="x", kind=kind, role=role, flag=flag, name=name, sub=sub, x=0, y=0), **kw).replace('class="nw" style="left: 0px; top: 0px"', 'class="nw" style="position:relative;left:0;top:0;width:150px;height:64px;flex-shrink:0"')
NODE = sheet("节点状态矩阵", "FlowNode（真组件见 FlowNode.dc.html，变体用属性面板切）", "kind × role × flag 的常见组合，加 selected / running / dim / 对照 chip / 运行徽章 / 受保护。", [
    block("五种 kind", '<div class="fc" style="display:flex;gap:18px;flex-wrap:wrap">' + _n("human", "decide", "ok", "投不投", "售前负责人") + _n("dog", "auto", "ok", "分章撰写", "标书撰写 · 环节 3") + _n("skill", "auto", "ok", "素材检索", "技能") + _n("know", "auto", "ok", "废标项清单", "行业库") + _n("data", "", "ok", "CRM", "商机 · 客户资料") + '</div>'),
    block("三种 role · 三种 flag", '<div class="fc" style="display:flex;gap:18px;flex-wrap:wrap">' + _n("human", "review", "ok", "领导审批", "人审") + _n("human", "decide", "block", "报价", "卡点 · 人定") + _n("skill", "auto", "missing", "获取招标文件", "缺口") + _n("data", "", "pending", "招标平台", "待打通") + '</div>'),
    block("交互态", '<div class="fc" style="display:flex;gap:18px;flex-wrap:wrap;padding-top:6px">' + _n("dog", "auto", "ok", "分章撰写", "选中", sel=True) + _n("dog", "auto", "ok", "分章撰写", "运行中", running=True, rb=("run", "● 1 / 3")) + _n("human", "decide", "ok", "商机进入", "压暗", dim=True) + _n("dog", "auto", "ok", "分章撰写", "对照", diff="原：人做") + _n("human", "decide", "ok", "递交", "受保护", lock="🔒 受保护") + '</div>'),
], "props: node{kind, role, flag, name, sub, children} · selected · connecting · running · dim · diff · rb · 开源：React Flow 自定义 Node + Handle（端口）", width=1000, extra_css=flow.NODE_CSS + flow.CANVAS_CSS + sc.EXTRA_CSS)

# ------------------------------------------------------------------ 旅程与时间线
JOURNEY = sheet("旅程卡", "JourneyStep", "12 用户旅程的一步：编号 · 名称 · 屏号 · 你做 · 它做 · 停机标签（有则琥珀边框）。", [
    block("普通步 / 停机步", f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px">{js._card("4", "纠错", "07", "说节点编号，或把步骤拖过泳道边界", "跨泳道即改「谁来做」", None)}{js._card("9", "人工确认点", "05.3", "通过 / 退回某环节 / 先看", "对外发送前暂停，持久化等你", "停 · 不回复就一直停")}</div>'),
], "props: no · name · screen · you · sys · stop · 开源：shadcn/ui Card")

FILES = {"CompCorrectionCard.dc.html": CARD, "CompStages.dc.html": STAGES, "CompMessage.dc.html": MSG, "CompDogCard.dc.html": DOG, "CompDiag.dc.html": DIAG,
         "CompTiles.dc.html": TILES, "CompChips.dc.html": CHIPS, "CompRows.dc.html": ROWS, "CompPreview.dc.html": PREVIEW, "CompFlowEdge.dc.html": EDGE,
         "CompFlowNode.dc.html": NODE, "CompJourney.dc.html": JOURNEY}
# 画板高度（估算 + 5% 余量，超出会裁切所以宁大勿小）
SIZES = {"CompCorrectionCard.dc.html": (W, 1900), "CompStages.dc.html": (W, 1320), "CompMessage.dc.html": (W, 640), "CompDogCard.dc.html": (1000, 740), "CompDiag.dc.html": (W, 1180),
         "CompTiles.dc.html": (W, 900), "CompChips.dc.html": (W, 1000), "CompRows.dc.html": (W, 1400), "CompPreview.dc.html": (W, 1060), "CompFlowEdge.dc.html": (W, 720),
         "CompFlowNode.dc.html": (1000, 620), "CompJourney.dc.html": (W, 380)}
