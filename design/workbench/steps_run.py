# -*- coding: utf-8 -*-
"""05 上岗的四个补画状态：05.1 启动 / 05.2 运行中 / 05.4 完成 / 05.5 止损（05.3 人工确认点在 screens_v2）。
进度全部来自 验收清单.json；一轮一环节；只在不可逆动作前停。示例数据均为演示值。"""
from gen import (ico, sidebar, topbar, inputbar, right_head, right_col, chat_col, frame, user_msg, bot_msg, filechip,
                 option, question, stage, stages_panel, tile, tiles, tree_row, HEAD, TAIL, COLS3,
                 AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, MID, LO, FIXBG, MONO)
from screens_v2 import btn, stage_pause

def card(body, border=LINE, bw="1px", pad="14px 18px 12px", gap=10):
    return f'<div style="align-self:stretch;background:{WHITE};border:{bw} solid {border};border-radius:14px;padding:{pad};display:flex;flex-direction:column;gap:{gap}px">{body}</div>'

def lab(t, extra=''):
    return f'<div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB}">{t}{extra}</div>'

def pill(t, c=SUB, bg=CHATBG, bd=LINE):
    return f'<span style="display:inline-flex;align-items:center;height:26px;padding:0 9px;border-radius:6px;background:{bg};border:1px solid {bd};font-size:12px;color:{c};white-space:nowrap">{t}</span>'

def mono_box(t):
    return f'<div style="font-family:{MONO};font-size:12.5px;line-height:1.6;background:{CHATBG};border:1px solid {LINE};border-radius:10px;padding:9px 12px">{t}</div>'

def stage_stop(label, detail):
    return (f'<div style="display:flex;gap:10px;align-items:center;min-height:32px;font-size:14px;font-weight:700;color:{HI}">'
            f'<span style="width:18px;display:flex;justify-content:center;flex-shrink:0">{ico("warn",18,HI,2)}</span><span>{label}</span>'
            f'<span style="margin-left:auto;font-size:12.5px;color:{HI};text-align:right;font-weight:600">{detail}</span></div>')

LAW_STEPS = [("1 文件解析", "验收 2 / 2 · 28 页 · 142 个条款"), ("2 事实提取", "验收 2 / 2 · 3 项标【合同未约定】"), ("3 风险扫描", "验收 3 / 3 · 7 个风险（高 2 · 中 3 · 低 2）"),
             ("4 法律核查", "验收 2 / 2 · 1 项标【待律师核查】"), ("5 条款建议", "验收 2 / 2 · 5 条示范修改"), ("6 对抗审查", "验收 2 / 2 · 只找问题不润色"), ("7 交付生成", "验收 2 / 2 · 三件套落盘 输出/")]
LAW_TODO = ["验收 2 项 · 解析 + 条款定位", "验收 2 项 · 事实表 + 未约定项", "验收 3 项 · 风险 + 定位 + 等级", "验收 2 项 · 法条可追溯", "验收 2 项 · 示范修改", "验收 2 项 · 只找问题", "验收 2 项 · 人工确认点 · 对外发送前"]
LAW_ACTION = [("它在流程画布的节点 n8", "text", "flow")]

# ===================================================================== 05.1 启动
dropzone = (f'<div style="border:1.5px dashed {AMBER};background:{AMBER_SOFT};border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px">'
            f'<span style="width:40px;height:40px;border-radius:10px;background:{WHITE};display:flex;align-items:center;justify-content:center">{ico("clip",20,AMBER,1.8)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:3px;min-width:0"><span style="font-weight:700;font-size:14px">拖一份真实合同进来 · PDF / DOCX</span>'
            f'<span style="font-size:12.5px;color:{SUB}">不用先整理；扫描件会先过 OCR（已知规律 2）</span></div>'
            f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;border-radius:8px;background:{WHITE};border:1px solid {LINE};font-size:12.5px">{ico("file",15,SUB)}设备采购合同.pdf · 2.4 MB {ico("check",14,OK,2.4)}</span></div>')
params = (lab("参数 · 来自资产包默认值", f'<span style="font-weight:500;letter-spacing:0">改参数去组件库 09，这里只确认</span>')
          + f'<div style="display:flex;gap:8px;flex-wrap:wrap">'
          + pill(f'立场 <b style="color:{AMBER}">★ 甲方风险优先</b>', INK, WHITE) + pill('委托方 <b>华南智造</b> · H1 从合同抬头推断', INK, WHITE)
          + pill('错误代价 <b>高</b> · 装对抗审查 + 来源强制', INK, WHITE) + pill('人工确认点 <b>仅交付生成前</b>', INK, WHITE) + '</div>')
launch = (lab("启动指令 · 一句话", f'<span style="margin-left:auto;font-weight:500;letter-spacing:0;color:{AMBER}">复制</span>')
          + mono_box("审查这份合同。立场：甲方风险优先，委托方：华南智造。"))
unattended = (f'<div style="display:flex;align-items:center;gap:12px;border-top:1px solid {LINE};padding-top:10px">'
              f'<span style="width:38px;height:22px;border-radius:11px;background:{LINE};position:relative;flex-shrink:0"><span style="position:absolute;left:2px;top:2px;width:18px;height:18px;border-radius:50%;background:{WHITE};box-shadow:0 1px 3px rgba(30,35,43,.25)"></span></span>'
              f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:13.5px;font-weight:700">无人上岗</span>'
              f'<span style="font-size:12.5px;color:{SUB};line-height:1.5">跑 <span style="font-family:{MONO}">上岗.sh</span>：每轮新上下文只做一个环节，停机标记 交付 / 止损 / 待确认；Claude Code 用 <span style="font-family:{MONO}">/loop until:</span> 零脚本。开着也只在对外发送前停。</span></div></div>')
start_actions = (f'<div style="display:flex;gap:8px;align-items:center;padding-top:2px">'
                 f'<span style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 18px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:14px">{ico("bolt",16,"#ffffff",2)}开始上岗</span>'
                 + btn("先看 启动指令.md", False, "book") + f'<span style="margin-left:auto;font-size:12.5px;color:{SUB}">开始后可以离开；停下来会在这里等你</span></div>')
start_stream = (bot_msg("合同审查工作狗 ⚖️", "拖一份<b>真实材料</b>进来就能开始。七环节一轮一个，验收打钩写回 验收清单.json；只在对外发送前停下来等你。")
                + card(dropzone + params + launch + unattended + start_actions, AMBER, "1.5px"))
start_right = (stages_panel("这只狗 · 7 环节 · 尚未开始", [stage(l, LAW_TODO[i], "todo") for i, (l, _) in enumerate(LAW_STEPS)])
               + tiles([("0 / 15", "验收清单.json", INK), ("2", "服务流程", INK), ("昨天", "上次运行", INK), ("v1.2", "回归达标", OK)])
               + f'<div style="font-size:12.5px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:10px 12px">服务的流程：<b>投标流程</b> 节点 n8（审招标文件里的合同条款）· <b>合同管理流程</b> 节点 c3。跑完后打钩数回到这两张图上。</div>')
RUN_START = HEAD + frame(COLS3,
    sidebar("law") + topbar("合同审查", chips=("v1.2", "回归达标 · 可日常使用"), actions=LAW_ACTION) +
    chat_col(start_stream, inputbar("也可以直接说：审查这份合同，立场甲方", None, False)) +
    right_col(right_head("上岗前 · 这只狗会做什么"), start_right)) + TAIL

# ===================================================================== 05.2 运行中
run_rows = [stage(LAW_STEPS[0][0], LAW_STEPS[0][1], "done"), stage(LAW_STEPS[1][0], LAW_STEPS[1][1], "done"),
            stage("3 风险扫描", "验收 1 / 3 · 扫描中 · 已发现 高 2 · 中 1", "run")] + [stage(l, LAW_TODO[i], "todo") for i, (l, _) in enumerate(LAW_STEPS) if i >= 3]
running_stream = (
    user_msg(filechip("设备采购合同.pdf · 2.4 MB") + "<div>审查这份合同。立场：<b>甲方风险优先</b>，委托方：华南智造。</div>")
    + bot_msg("合同审查工作狗 ⚖️", "收到。<b>七环节</b>一轮一个环节跑，每轮新开上下文，只带上一环节的产物；验收打钩逐条写回 验收清单.json。你可以离开，回来看进度。")
    + stages_panel("审查流水线 · 验收清单.json · 4 / 15 通过", run_rows)
    + bot_msg("合同审查工作狗 ⚖️", f'第 3 轮 · 风险扫描进行中。<span style="color:{SUB}">这一轮结束会把 3 条验收逐条打钩；打不满就再精调一轮，一轮不增加即止损（05.5）。</span>'))
def mid_card(title, sub, body, live=False):
    st = (f'<span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:{AMBER};font-weight:700"><span style="width:6px;height:6px;border-radius:50%;background:{AMBER};animation:blink 1.2s infinite"></span>生成中</span>'
          if live else f'<span style="margin-left:auto;font-size:11.5px;color:{OK};font-weight:700">{ico("check",13,OK,2.4)} 已验收</span>')
    return (f'<div style="border:1px solid {AMBER if live else LINE};border-radius:12px;padding:11px 14px;display:flex;flex-direction:column;gap:6px">'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700;font-size:13.5px">{title}</span><span style="font-size:11.5px;color:{SUB}">{sub}</span>{st}</div>{body}</div>')
skel = ''.join(f'<span style="display:block;height:11px;border-radius:6px;background:{CHATBG};width:{w}%"></span>' for w in (84, 66, 90))
running_right = (
    mid_card("文件解析结果", "环节 1 产物", f'<div style="font-size:12.5px;color:{SUB};line-height:1.6">28 页 · 142 个条款 · 3 个附件；条款定位表已建（§ 号 → 页码）。</div>')
    + mid_card("事实清单", "环节 2 产物", f'<div style="font-size:12.5px;color:{SUB};line-height:1.6">合同金额 386 万 · 付款 3 期 · 交付 90 天；<b style="color:{INK}">3 项【合同未约定】</b>：验收期限 · 保修期 · 争议管辖。</div>')
    + mid_card("风险清单", "环节 3 · 第 3 轮", f'<div style="display:flex;flex-direction:column;gap:6px;font-size:12.5px;line-height:1.5">'
               f'<div><span style="font-family:{MONO};font-weight:700">R-001</span> <span style="font-size:10.5px;background:{HI};color:#fff;border-radius:4px;padding:1px 6px;font-weight:700">高</span> 逾期付款违约金畸高 · §7.2</div>'
               f'<div><span style="font-family:{MONO};font-weight:700">R-002</span> <span style="font-size:10.5px;background:{HI};color:#fff;border-radius:4px;padding:1px 6px;font-weight:700">高</span> 乙方逾期交付完全免责 · §5.3</div>'
               f'<div><span style="font-family:{MONO};font-weight:700">R-003</span> <span style="font-size:10.5px;background:{MID};color:#fff;border-radius:4px;padding:1px 6px;font-weight:700">中</span> 争议管辖约定在对方所在地 · §12.1</div>'
               f'<div style="display:flex;flex-direction:column;gap:6px;padding-top:4px">{skel}</div></div>', live=True)
    + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">每环节的产物先落到 <span style="font-family:{MONO}">输出/中间产物/</span>，三件套只在环节 7 通过人工确认点后生成。</div>')
RUN_RUNNING = HEAD + frame(COLS3,
    sidebar("law") + topbar("合同审查", chips=("环节 3 / 7", "第 3 轮 · 一轮一环节", "停机：无"), actions=LAW_ACTION) +
    chat_col(running_stream, inputbar("运行中也能说话：比如「R-002 是行业惯例，别报」，下一轮生效")) +
    right_col(right_head("交付物预览 · 中间产物", "live"), running_right)) + TAIL

# ===================================================================== 05.4 完成
done_rows = [stage(l, d, "done") for l, d in LAW_STEPS]
next_chips = (f'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
              f'<span style="display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 16px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:13.5px">{ico("refresh",15,"#ffffff",2)}复盘（10）</span>'
              + btn("再跑一份", False, "bolt") + btn("回到画布 · n8 已更新", False, "flow") + '</div>')
done_stream = (
    user_msg("A")
    + bot_msg("合同审查工作狗 ⚖️", "已通过。三件套落盘 <span style=\"font-family:%s\">输出/2026-09-08-设备采购合同/</span>；验收清单.json <b>15 / 15</b>；复盘/日志.md 追加 1 条。交付就是完成，下一步三选一：" % MONO
              + f'<div style="margin-top:8px">{next_chips}</div>')
    + stages_panel("审查流水线 · 验收清单.json · 15 / 15 通过 · 第 8 轮交付", done_rows))
OUT_TREE = [("输出/2026-09-08-设备采购合同/", "", True), ("├── 风险审查报告.md", "7 个风险 · 3 项待律师核查", False), ("├── 原文逐条批注.md", "142 条款 · 12 处批注", False), ("└── 风险清单.json", "struct · 给下游流程用", False)]
done_right = (
    f'<div style="font-family:{MONO};font-size:12.5px;line-height:1.6;background:{CHATBG};border:1px solid {LINE};border-radius:12px;padding:10px 16px">' + ''.join(tree_row(*t) for t in OUT_TREE) + '</div>'
    + tiles([("2", "高风险", HI), ("3", "中风险", MID), ("3", "待律师核查", AMBER), ("14 分", "8 轮用时", INK)])
    + f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">本次写回</div>'
    + ''.join(f'<div style="display:flex;gap:9px;align-items:flex-start;padding:8px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5">{ico("check",15,OK,2.2)}<span>{t}</span></div>' for t in [
        f'<span style="font-family:{MONO}">验收清单.json</span> 15 / 15 · 全部 passes = true',
        f'<span style="font-family:{MONO}">复盘/日志.md</span> +1 条：「验收期限未约定」类型首次出现，候选已知规律',
        '流程画布 n8 运行态已更新（投标流程 · 合同管理流程）',
        '犬舍卡片：上次运行 刚刚 · 累计审查 24 份'])
    + '</div>'
    + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">没有「发送」按钮：对外发送是你的动作，狗只落盘。</div>')
RUN_DONE = HEAD + frame(COLS3,
    sidebar("law") + topbar("合同审查", chips=("环节 7 / 7", "第 8 轮 · 已交付", "停机：交付"), actions=LAW_ACTION) +
    chat_col(done_stream, inputbar("说「复盘」，或再拖一份合同进来")) +
    right_col(right_head("交付物 · 已落盘", "done", f'<span style="margin-left:8px">{btn("打开文件夹", False, "folder")}</span>'), done_right)) + TAIL

# ===================================================================== 05.5 止损（标书撰写 · 环节 3）
bid_rows = [stage("1 招标解析与废标项", "验收 2 / 2 · 废标项 6 条置顶", "done"), stage("2 评分拆解与应答矩阵", "验收 3 / 3 · 41 个评分点", "done"),
            stage_stop("3 分章撰写 · 止损", "验收 1 / 3 · 第 4 轮精调后未增加"), stage("4 合规自查与模拟评审", "未执行 · 等环节 3", "todo")]
def col(title, color, items):
    return (f'<div style="flex:1;min-width:0;border:1px solid {LINE};border-top:3px solid {color};border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:5px">'
            f'<span style="font-size:12.5px;font-weight:800;color:{color}">{title}</span>'
            + ''.join(f'<div style="font-size:12.5px;line-height:1.5;color:{INK}">{t}</div>' for t in items) + '</div>')
stop_card = (
    f'<div style="align-self:stretch;background:{WHITE};border:1.5px solid {HI};border-radius:14px;padding:14px 18px 12px;display:flex;flex-direction:column;gap:10px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12.5px;color:{HI};font-weight:800;letter-spacing:.04em">止损 · 环节 3 分章撰写</span>'
    f'<span style="font-size:12.5px;color:{SUB}">一轮精调后打钩数没有增加，不再空转；同时给三样，不会只上报不交付</span></div>'
    f'<div style="display:flex;gap:10px">'
    + col("已达标部分", OK, ["环节 1：解析 + 废标项清单 6 条", "环节 2：应答矩阵 41 项", "环节 3：已成 2 / 5 章（技术方案 · 实施方案）"])
    + col("未达标清单 · 4 项", AMBER, ["第 3 章 业绩：缺 2 份业绩扫描件", "第 4 章 人员：缺项目经理证书", "第 5 章 售后：素材库无该模块", "验收 3.2「每章引用真实素材」未过"])
    + col("卡点报告", HI, ["根因：素材库 s3 缺口（历史业绩未入库）", "影响：3 章只能出框架并标【待补材料】", "解法：补齐后重跑环节 3，约 6 分钟", f'<span style="color:{AMBER};font-weight:600">在画布中查看 s3 →</span>'])
    + '</div>'
    + question("", [option("A. 补材料后重跑环节 3（只重跑 3 及其下游 4）", "推荐：根因在素材，不在提示词", True), option("B. 先用已达标部分出初稿，缺的章标【待补材料】"), option("C. 看卡点报告，暂不处理")])
    + f'<div style="font-size:12px;color:{SUB}">犬舍卡片已标「止损 1 次 · 卡点报告待处理」；复盘会把这一次记进日志。</div></div>')
stop_stream = (
    user_msg(filechip("智慧园区项目招标文件.pdf · 6.1 MB") + "<div>写这份标书，先出初稿。</div>")
    + stages_panel("撰写流水线 · 验收清单.json · 6 / 10 通过 · 素材从素材库取，缺的标【待补材料】", bid_rows)
    + stop_card)
def gap_row(t, note):
    return (f'<div style="display:flex;gap:9px;align-items:flex-start;padding:8px 0;border-top:1px solid {LINE};font-size:12.5px;line-height:1.5">'
            f'<span style="font-size:10.5px;background:{AMBER_SOFT};color:{AMBER};border-radius:4px;padding:1px 6px;font-weight:700;flex-shrink:0;margin-top:2px">缺口</span>'
            f'<span style="display:flex;flex-direction:column;gap:1px"><span>{t}</span><span style="font-size:11.5px;color:{SUB}">{note}</span></span></div>')
stop_right = (
    f'<div style="display:flex;flex-direction:column"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;color:{SUB};padding-bottom:4px">未达标清单 · 补上即自动达标</div>'
    + gap_row("业绩扫描件 × 2（近三年同类项目）", "放进 素材库/业绩/ 即可，重跑时自动命中")
    + gap_row("项目经理一级建造师证书", "素材库/人员/ 缺此人")
    + gap_row("售后服务方案模块", "行业库有通用版，需要你的 SLA 数字")
    + gap_row("验收 3.2 每章引用真实素材", "以上三项补齐后自动通过") + '</div>'
    + f'<div style="font-family:{MONO};font-size:12.5px;line-height:1.6;background:{CHATBG};border:1px solid {LINE};border-radius:12px;padding:10px 16px">'
    + ''.join(tree_row(*t) for t in [("输出/中间产物/", "", True), ("├── 01-解析与废标项.md", "✓", False), ("├── 02-应答矩阵.json", "✓ 41 项", False), ("├── 03-分章/技术方案.md", "✓", False), ("├── 03-分章/实施方案.md", "✓", False), ("└── 03-分章/业绩.md", "框架 · 待补材料", False)]) + '</div>'
    + f'<div style="margin-top:auto;font-size:12px;color:{SUB};line-height:1.6;border:1px solid {LINE};border-radius:10px;padding:9px 12px">止损不是失败：已达标部分照常可用；缺口在画布上 s3 处，补齐后所有依赖它的狗都受益。</div>')
RUN_STOP = HEAD + frame(COLS3,
    sidebar("bid") + topbar("标书撰写", chips=("环节 3 / 4", "第 4 轮 · 止损", "停机：止损"), actions=[("它在流程画布的节点 n3 – n10", "text", "flow")]) +
    chat_col(stop_stream, inputbar("回「A」，或把业绩扫描件拖进来我直接重跑")) +
    right_col(right_head("未达标清单 · 4 项", None, f'<span style="margin-left:auto">{btn("画布中查看 s3", False, "flow")}</span>'), stop_right)) + TAIL

FILES = {"RunStart.dc.html": RUN_START, "RunRunning.dc.html": RUN_RUNNING, "RunDone.dc.html": RUN_DONE, "RunStop.dc.html": RUN_STOP}
