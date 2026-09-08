# -*- coding: utf-8 -*-
"""01–05 屏幕 v2：按产品目标重做（画布是中心 · 四个入口 · 预填交付 · 验收清单.json 驱动上岗 · 回流）。
覆盖 gen.py 里同名画板（gen.py 的原版保留作对照）。示例数据均为演示值。"""
import gen
from gen import (ico, sidebar, topbar, inputbar, right_head, right_col, chat_col, frame, user_msg, bot_msg, filechip,
                 option, question, stage, stages_panel, tile, tiles, tree_row, assumption, stat, dog_card,
                 HEAD, TAIL, COLS2, COLS3, AMBER, AMBER_SOFT, INK, SUB, LINE, CHATBG, WHITE, OK, HI, MID, LO, MONO)

def btn(label, primary=False, icon=None, color=None):
    c = color or (AMBER if primary else SUB)
    i = ico(icon, 16, "#ffffff" if primary else c, 2) if icon else ''
    if primary:
        return f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:8px;background:{AMBER};color:#ffffff;font-size:13px;font-weight:700;white-space:nowrap">{i}{label}</span>'
    return f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {LINE};background:{WHITE};color:{c};font-size:13px;font-weight:600;white-space:nowrap">{i}{label}</span>'

# =====================================================================
# 01 首页 · 四个入口，一个输入框
# =====================================================================
entries = [
    ("一句话", "→ 工作狗资产包", "bolt"), ("贴现有提示词", "→ 评分 + 改进版", "edit"),
    ("描述一段流程", "→ 泳道图找卡点", "flow"), ("一个产品想法", "→ 产品定义 + 故事清单", "book"),
]
entry_chips = ''.join(
    f'<span style="display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 12px;border-radius:999px;background:{WHITE};border:1px solid {LINE};font-size:12.5px;color:{SUB}">{ico(i,15,AMBER,1.8)}<b style="color:{INK};font-weight:600">{k}</b><span>{v}</span></span>'
    for k, v, i in entries)
examples = ["投标流程哪些能交给 AI", "做一个小餐馆排班工具", "改进我的翻译提示词", "每周竞品周报工作狗"]
ex_chips = ''.join(f'<span style="display:inline-flex;align-items:center;height:34px;padding:0 14px;border-radius:999px;background:{CHATBG};border:1px solid {LINE};font-size:13px;color:{SUB}">{e}</span>' for e in examples)
home_stream = (
    f'<div style="flex-grow:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:0 40px">'
    f'<span style="font-size:52px;line-height:1">🐕</span>'
    f'<div style="display:flex;flex-direction:column;gap:8px;max-width:640px">'
    f'<div style="font-size:26px;font-weight:800;letter-spacing:-.01em">说一句想让 AI 做的事，或把你们的流程和材料丢进来</div>'
    f'<div style="font-size:14.5px;color:{SUB};line-height:1.7">四种进法自动识别，都先按推荐值把东西做出来，卡片只用来纠错——不回复也能用。</div></div>'
    f'<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:760px">{entry_chips}</div>'
    f'<div style="width:100%;max-width:760px;background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:16px 18px 12px;display:flex;flex-direction:column;gap:12px;text-align:left;box-shadow:0 8px 28px rgba(217,119,6,.10)">'
    f'<div style="min-height:64px;font-size:15px;color:{SUB};line-height:1.6">例如：我们投标流程是销售录线索、商务每天刷平台下载文件、财务报价常卡两天……哪些能交给 AI</div>'
    f'<div style="display:flex;gap:8px;align-items:center;border-top:1px solid {LINE};padding-top:10px">'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1.5px solid {AMBER};background:{AMBER_SOFT};font-size:13px;color:{AMBER};font-weight:700">{ico("clip",16,AMBER,2)}<span>贴材料</span><span style="font-weight:500;color:{SUB}">流程文档 / 聊天记录 / 表格</span></span>'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:8px;border:1px solid {LINE};background:{CHATBG};font-size:13px;color:{SUB}">{ico("bolt",16)}<span>直接做（不出选择题）</span></span>'
    f'<span style="margin-left:auto;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:{AMBER};color:#ffffff">{ico("send",20)}</span></div></div>'
    f'<div style="font-size:12.5px;color:{SUB}">材料决定现状图八成质量：有材料先反推现状，没材料按行业惯例出草稿并标 H</div>'
    f'<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:760px">{ex_chips}</div></div>')

def preview_card(icon, title, sub, note):
    return (f'<div style="display:flex;gap:12px;align-items:flex-start;border:1px solid {LINE};border-radius:12px;padding:12px 14px;background:{WHITE}">'
            f'<span style="width:38px;height:38px;border-radius:10px;background:{AMBER_SOFT};display:flex;align-items:center;justify-content:center;flex-shrink:0">{ico(icon,20,AMBER,1.7)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-weight:700;font-size:13.5px">{title}</span>'
            f'<span style="font-size:12.5px;color:{SUB};line-height:1.5">{sub}</span><span style="font-size:11.5px;color:{AMBER};font-weight:600">{note}</span></div></div>')
home_right_body = (
    f'<div style="font-size:12.5px;color:{SUB};line-height:1.6">按你给的东西自动选一种先做出来，放在这里；说编号（H 号 / 环节号 / 节点号）就能改。</div>'
    + preview_card("flow", "泳道流程图", "一段流程 → 自动 / 人 / 数据与系统三条道，标卡点 · 缺口 · 待打通，附打包建议", "五问 30 秒：哪些自动、人在哪、卡在哪、缺什么、打通什么")
    + preview_card("book", "三件套", "一个产品想法 → 五问首行 + 一页产品定义 + 按依赖排序的故事清单", "先做哪条故事，★ 已选好")
    + preview_card("folder", "资产包", "一句话 → 路由 · 主控 · 各环节提示词 · 启动指令 · 验收清单.json", "拖进任意工作区即上岗，无人也能跑完")
    + preview_card("edit", "评分 + 改进版", "贴现有提示词 → 十维打分 + 三条建议 + 改进版全文 + 回归对照", "零提问：先打分再改，通常一题都不出"))
MAIN = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 新会话") +
    chat_col(home_stream, '') +
    right_col(right_head("交付物预览 · 先做出来再纠错"), home_right_body)) + TAIL

# =====================================================================
# 02 确认卡片 · 预填交付形态：只问架构级，产物已在右侧生成
# =====================================================================
hchip = lambda t: f'<span style="display:inline-flex;align-items:center;height:26px;padding:0 9px;border-radius:6px;background:{CHATBG};border:1px solid {LINE};font-size:12px;color:{SUB}"><b style="font-family:{MONO};color:{AMBER};margin-right:5px">H</b>{t}</span>'
card = (
    f'<div style="align-self:stretch;background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:16px 20px 14px;display:flex;flex-direction:column;gap:14px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12.5px;color:{AMBER};font-weight:800;letter-spacing:.04em">可选纠错 · 不回复即按 ★ 生效</span>'
    f'<span style="font-size:12.5px;color:{SUB}">只剩两件会改变架构的事；其余已按我的理解做了，见下方 H</span></div>'
    f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:14px 24px">'
    + question("Q1 这套流程在哪里运行？", [option("A. 普通对话窗口（每步手动）"), option("B. 带工具的 Agent 环境", "已采用：你提到了「自动」", True), option("C. API / 代码编排（定时、并行）"), option("D. 其他 / 不确定（一句话说明）")])
    + question("Q2 错误代价？", [option("A. 低——错了改一下就行"), option("B. 中——浪费别人时间"), option("C. 高——供高管决策，有实际损失", "已采用：周报供管理层参考", True)])
    + f'</div>'
    f'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span style="font-size:12px;color:{SUB};font-weight:700">已转为假设：</span>'
    + hchip("1 竞品固定 3–5 家") + hchip("2 高管摘要 + 团队附录") + hchip("3 来源：官网 / 公告 / 行业媒体") + hchip("4 周一 09:00 生成，中文")
    + f'<span style="font-size:12px;color:{SUB}">说「H2 不对，实际是…」只重出受影响的部分</span></div>'
    f'<div style="display:flex;gap:8px;align-items:center;border-top:1px solid {LINE};padding-top:12px">'
    f'<span style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px;border-radius:10px;border:1.5px solid {AMBER};background:{AMBER_SOFT};color:{AMBER};font-weight:700;font-size:13.5px">{ico("check",16,AMBER,2.2)}不用回复 · 已按 ★ 进行</span>'
    f'<span style="display:inline-flex;align-items:center;height:40px;padding:0 14px;border-radius:10px;border:1px solid {LINE};background:{CHATBG};font-size:13.5px;color:{SUB}">1C</span>'
    f'<span style="display:inline-flex;align-items:center;height:40px;padding:0 14px;border-radius:10px;border:1px solid {LINE};background:{CHATBG};font-size:13.5px;color:{SUB}">2B</span>'
    f'<span style="margin-left:auto;font-size:12.5px;color:{SUB}">也可以直接打一句话修正某题</span></div></div>')
confirm_stream = (
    user_msg("我想要一个每周自动做竞品分析报告的工作流")
    + bot_msg("提示狗 🐕", "这是个<b>定时、多来源采集</b>的任务，我按<b>提示链方案</b>设计，行业常见做法已替你选好，右侧已经在生成。只有两件事会改变架构，先摆在这里——不回复也照常交付。")
    + card)
gen_rows = [
    stage("验收标准先行", "6 条可二值判定", "done"),
    stage("环节表与数据契约", "5 环节 · JSON 契约", "done"),
    stage("各环节提示词", "生成中 · 含验证点与失败回退", "run"),
    stage("会话内试跑", "自拟样例，不向你要材料", "todo"),
    stage("验收清单.json · 上手指南", "无人也能跑完", "todo"),
]
confirm_right_body = (
    f'<div style="border:1px solid {LINE};border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:10px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;font-weight:800;color:{AMBER};letter-spacing:.08em">判级</span>'
    f'<span style="font-weight:700;font-size:14.5px">L3 · 提示链 · 资产包</span><span style="margin-left:auto;font-size:12px;color:{SUB}">六信号 7 / 12 · 重复使用</span></div>'
    f'<div style="font-size:13.5px;line-height:1.6;color:{INK}">定时触发、多来源采集、周环比成稿——拆成环节，环节之间只传显式产物；每周都跑，所以建资产包并带状态文件。</div>'
    f'<div style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:{SUB};min-height:32px">{ico("chev",16,SUB)}<span>展开打分明细</span></div>'
    f'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;border-top:1px solid {LINE};padding-top:10px"><span style="font-size:12px;color:{SUB}">判错了？换形态：</span>'
    f'<span style="display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:8px;border:1px solid {LINE};background:{CHATBG};font-size:12px;color:{SUB}">只要一条提示词（L1）</span>'
    f'<span style="display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:8px;border:1px solid {LINE};background:{CHATBG};font-size:12px;color:{SUB}">我要的是图</span></div></div>'
    + stages_panel("竞品分析Agent / 资产包 · 生成中", gen_rows)
    + f'<div style="font-size:12.5px;color:{SUB};line-height:1.6;padding:0 4px">生成完成后：入犬舍，并在流程画布上占一个节点；服务流程与节点号写进主控文件，复盘时数据回到图上。</div>')
CONFIRM = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 竞品分析工作流", chips=("L3 提示链", "预填交付 · 纠错卡 1 张")) +
    chat_col(confirm_stream, inputbar("不回复也行；要改就回「1C」或「H2 不对，实际是…」")) +
    right_col(right_head("交付物预览", "live"), confirm_right_body)) + TAIL

# =====================================================================
# 03 资产包交付 · 两个出口：入犬舍 / 在画布中查看；未达标清单链到缺口
# =====================================================================
build_rows = [
    stage("验收标准先行", "6 条可二值判定", "done"),
    stage("环节设计与数据契约", "5 环节 · 一环节一上下文", "done"),
    stage("各环节提示词", "含验证点与失败回退", "done"),
    stage("会话内试跑", "样例输入 · 验收 5 / 6 通过", "done"),
    stage("验收清单.json · 上岗.sh", "5 环节 × 验收项 · passes 全 false", "done"),
    stage("自检与文档化", "版本头 · 假设清单 · 上手指南", "done"),
]
deliver_stream = (
    user_msg("都按推荐")
    + bot_msg("提示狗 🐕", "生效：全部 ★。开始构建<b>资产包</b>——右侧实时生成。")
    + stages_panel("构建流水线", build_rows)
    + bot_msg("提示狗 🐕", "资产包就绪 📦 「<b>竞品分析工作狗</b>」已入犬舍，在流程画布上占了节点 n6。试跑 5 / 6 通过，未达标的 1 项列在右侧，不影响上岗。"
              f'<div style="font-size:13px;color:{SUB};margin-top:4px">想调整任何环节，说编号就行：如「环节 2 加个价格监控」「H2 不对，也要看内部数据」。每周一说一句「跑竞品周报」，或直接运行 上岗.sh。</div>')
    + gen.punch)
TREE = [
    ("竞品分析Agent/", "", True),
    ("├── AGENTS.md", "路由 + 渐进式加载 + 已知规律", False),
    ("├── 分析流程.md", "主控：验收标准 + 环节表 + 服务流程节点 n6", False),
    ("├── prompts/", "环节 1 采集 … 环节 5 成稿", False),
    ("├── templates/", "周报模板 + JSON 契约", False),
    ("├── 启动指令.md", "每周一句话触发 / 无人上岗", False),
    ("├── 验收清单.json", "状态文件：环节 × 验收项 × passes", False),
    ("├── 上岗.sh", "每轮新上下文只做一个环节", False),
    ("├── 复盘/", "日志.md 每轮追加 · 已知规律抬升", False),
    ("├── 回归测试/", "改版必跑，达标才发布", False),
    ("└── 输出/", "周报自动落盘", False),
]
deliver_actions = (btn("下载", False, "download") + btn("入犬舍", False, "grid") + btn("画布中查看", True, "flow"))
gap_card = (f'<div style="border:1px solid {LINE};border-left:4px solid {AMBER};border-radius:10px;padding:10px 14px;display:flex;flex-direction:column;gap:4px;font-size:13px">'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700">未达标清单 · 1 项</span><span style="font-size:11px;background:{AMBER_SOFT};color:{AMBER};border-radius:5px;padding:1px 7px;font-weight:700">缺口</span>'
            f'<span style="margin-left:auto;font-size:12px;color:{AMBER};font-weight:600">在画布中查看节点 s2 →</span></div>'
            f'<div style="color:{SUB};line-height:1.5">验收 4「含内部销售数据对比」：内部数据源未接入，暂按公开信息出稿并标 [待核实]；接入 CRM 只读接口后自动达标。</div></div>')
deliver_right_body = (
    f'<div style="display:flex;flex-direction:column;gap:3px"><div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:16px">{ico("folder",20,AMBER,1.7)}<span>竞品分析Agent · 资产包</span></div>'
    f'<div style="font-size:12.5px;color:{SUB}">L3 提示链 · 5 环节 · 含状态文件与复盘飞轮 · v1.0 · 2026-09-08</div></div>'
    f'<div style="font-family:{MONO};font-size:12.5px;line-height:1.55;background:{CHATBG};border:1px solid {LINE};border-radius:12px;padding:10px 16px;overflow:hidden">'
    + ''.join(tree_row(t, c, d) for t, c, d in TREE) + '</div>'
    + tiles([("5 / 6", "试跑验收", OK), ("5", "环节", INK), ("2", "假设", INK), ("1", "未达标", AMBER)])
    + f'<div style="border:1px solid {LINE};border-radius:10px;padding:10px 14px;display:flex;flex-direction:column;gap:5px;font-size:13px">'
      f'<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700">怎么用它</span><span style="margin-left:auto;font-size:12px;color:{AMBER};font-weight:600">复制启动指令</span></div>'
      f'<div style="font-family:{MONO};font-size:12.5px;background:{CHATBG};border-radius:8px;padding:6px 10px">跑竞品周报</div>'
      f'<div style="font-size:12px;color:{SUB};line-height:1.5">每周一说这一句；无人值守用 <span style="font-family:{MONO}">上岗.sh</span>，只在对外发送前停。</div></div>'
    + gap_card
    + f'<div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:{SUB};padding-bottom:6px">{ico("flag",16,SUB)}<span>生效假设</span><span style="font-weight:500">不符请指出编号</span></div>'
    + assumption("H1", "报告语言为中文，周一 09:00 生成", "对话语言 · 「每周」")
    + '</div>')
DELIVER = HEAD + frame(COLS3,
    sidebar("dog") + topbar("提示狗 · 竞品分析工作流", chips=("L3 提示链", "已交付 v1.0", "试跑 5 / 6")) +
    chat_col(deliver_stream, inputbar("说编号即可调整：如「环节 2 加价格监控」「H2 不对」")) +
    right_col(right_head("资产包", None, f'<span style="margin-left:auto;display:flex;gap:6px">{deliver_actions}</span>'), deliver_right_body)) + TAIL

# =====================================================================
# 04 犬舍 · 状态来自 验收清单.json；每只狗知道自己服务哪些流程
# =====================================================================
def dog_card2(av, name, desc, ver, stats, status_html, new=False, flows="用于 1 条流程"):
    nb = f'<span style="font-size:11px;font-weight:700;color:{AMBER};background:{AMBER_SOFT};border-radius:6px;padding:2px 8px">新</span>' if new else ''
    return (f'<div style="background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:20px 22px 18px;display:flex;flex-direction:column;gap:14px;min-height:236px">'
            f'<div style="display:flex;gap:12px;align-items:center"><span style="width:44px;height:44px;border-radius:10px;background:{AMBER_SOFT};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">{av}</span>'
            f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:800;font-size:16px">{name}</span>{nb}</div>'
            f'<span style="font-size:13px;color:{SUB};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{desc}</span></div>'
            f'<span style="margin-left:auto;font-family:{MONO};font-size:12px;color:{SUB};flex-shrink:0">{ver}</span></div>'
            f'<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:10px;padding:12px 0;border-top:1px solid {LINE};border-bottom:1px solid {LINE}">{"".join(stats)}</div>'
            f'<div style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;align-items:center;min-height:20px;white-space:nowrap">{status_html}<span style="margin-left:auto;font-size:12px;color:{SUB}">{flows}</span></div>'
            f'<div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">'
            f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;border:1px solid {LINE};font-size:13px;color:{SUB};white-space:nowrap">复盘</span>'
            f'<span style="display:inline-flex;align-items:center;gap:5px;height:36px;padding:0 14px;border-radius:8px;border:1px solid {LINE};font-size:13px;color:{SUB};white-space:nowrap">{ico("flow",15,SUB)}画布</span>'
            f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 18px;border-radius:8px;background:{AMBER};color:#ffffff;font-size:13px;font-weight:700;white-space:nowrap">上岗</span></div></div></div>')
ok_badge = f'<span style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:{OK};font-weight:600">{ico("check",15,OK,2.2)}回归达标 · 可日常使用</span>'
stop_badge = f'<span style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:{HI};font-weight:600">{ico("warn",15,HI,1.8)}止损 1 次 · 卡点报告待处理</span>'
new_badge = f'<span style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:{SUB};font-weight:600">{ico("clock",15,SUB)}尚未运行 · 下次：周一 09:00</span>'
cards = [
    dog_card2("⚖️", "合同审查", "七环节初审，三件套交付", "v1.2",
              [stat("上次运行", "昨天 16:20"), stat("累计审查", "23 份"), stat("漏审 / 虚构来源", "0 / 0", OK)], ok_badge, flows="用于 2 条流程"),
    dog_card2("📑", "标书撰写", "按评分点写，废标项逐条核对", "v1.2",
              [stat("上次运行", "3 天前 · 环节 3 止损"), stat("累计应标", "6 个"), stat("待补材料", "4 项", AMBER)], stop_badge, flows="用于 1 条流程 · 投标"),
    dog_card2("✍️", "内容营销", "透明换信任写作，素材库保真", "v1.1",
              [stat("上次运行", "今天 09:10"), stat("累计成稿", "18 篇"), stat("近期存取比", "3 : 1", OK)], ok_badge),
    dog_card2("📈", "竞品分析", "每周一采集 → 周环比 → 摘要", "v1.0",
              [stat("上次运行", "—"), stat("环节", "5 个"), stat("触发", "每周一")], new_badge, new=True, flows="用于 1 条流程 · 节点 n6"),
    (f'<div style="border:1.5px dashed {LINE};border-radius:14px;padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:236px;color:{SUB};text-align:center">'
     f'<span style="width:48px;height:48px;border-radius:12px;background:{AMBER_SOFT};display:flex;align-items:center;justify-content:center">{ico("plus",24,AMBER,2)}</span>'
     f'<span style="font-weight:700;font-size:15px;color:{INK}">造一只新工作狗</span><span style="font-size:13px;line-height:1.6;max-width:240px">说一句想让它干的事，或在流程画布上框选几步「打包成工作狗」</span></div>'),
]
filters = ''.join(
    f'<span style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;border:1px solid {AMBER if i==0 else LINE};background:{AMBER_SOFT if i==0 else WHITE};color:{AMBER if i==0 else SUB};font-size:13.5px;font-weight:{700 if i==0 else 500}">{t}</span>'
    for i, t in enumerate(("全部 4", "常态运行 2", "止损待处理 1", "新建 1")))
kennel_main = (
    f'<main style="min-width:0;overflow:hidden;padding:28px 36px;display:flex;flex-direction:column;gap:22px">'
    f'<div style="display:flex;align-items:flex-end;gap:16px"><div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:24px;font-weight:800;letter-spacing:-.01em">犬舍</span>'
    f'<span style="font-size:14px;color:{SUB}">工作狗 = 场景专用 Agent 资产包，拖进任意工作区即上岗；状态来自它自己的 验收清单.json，复盘数据回到流程画布。</span></div>'
    f'<div style="margin-left:auto;display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;border:1px solid {LINE};border-radius:10px;background:{WHITE};color:{SUB};font-size:13.5px;min-width:260px">{ico("search",18,SUB)}<span>搜索工作狗</span></div></div>'
    f'<div style="display:flex;gap:8px;align-items:center">{filters}</div>'
    f'<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:18px">{"".join(cards)}</div></main>')
kennel_right = (f'<div style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px;border-radius:10px;background:{AMBER};color:#ffffff;font-weight:700;font-size:14px">{ico("plus",18,"#ffffff",2)}造一只工作狗</div>')
KENNEL = HEAD + frame(COLS2, sidebar(kennel_active=True) + topbar("犬舍", chips=("4 只工作狗", "1 只止损待处理"), actions=[("造一只工作狗", "primary", "plus")]) + kennel_main) + TAIL

# =====================================================================
# 05 工作狗上岗 · 合同审查 · 停在人工确认点（一轮一环节，进度来自 验收清单.json）
# =====================================================================
def stage_pause(label, detail):
    return (f'<div style="display:flex;gap:10px;align-items:center;min-height:32px;font-size:14px;font-weight:700;color:{AMBER}">'
            f'<span style="width:18px;display:flex;justify-content:center;flex-shrink:0"><span style="width:18px;height:18px;border-radius:50%;background:{AMBER};display:flex;align-items:center;justify-content:center">{ico("flag",11,"#ffffff",2.4)}</span></span><span>{label}</span>'
            f'<span style="margin-left:auto;font-size:12.5px;color:{AMBER};text-align:right;font-weight:600">{detail}</span></div>')
law_rows = [
    stage("1 文件解析", "验收 2 / 2 · 28 页 · 142 个条款", "done"),
    stage("2 事实提取", "验收 2 / 2 · 3 项标【合同未约定】", "done"),
    stage("3 风险扫描", "验收 3 / 3 · 7 个风险（高 2 · 中 3 · 低 2）", "done"),
    stage("4 法律核查", "验收 2 / 2 · 1 项标【待律师核查】", "done"),
    stage("5 条款建议", "验收 2 / 2 · 5 条示范修改", "done"),
    stage("6 对抗审查", "验收 2 / 2 · 只找问题不润色", "done"),
    stage_pause("7 交付生成 · 人工确认点", "停在这里 · 待确认"),
]
confirm_point = (
    f'<div style="align-self:stretch;background:{WHITE};border:1.5px solid {AMBER};border-radius:14px;padding:14px 18px 12px;display:flex;flex-direction:column;gap:10px">'
    f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12.5px;color:{AMBER};font-weight:800;letter-spacing:.04em">人工确认点 · 对外发送前</span>'
    f'<span style="font-size:12.5px;color:{SUB}">流程里唯一停下来等人的地方；不回复不会自动发送</span></div>'
    f'<div style="font-size:13.5px;line-height:1.5">3 项标【待律师核查】，报告与批注已在右侧。发给委托方前请定一下：</div>'
    + question("", [option("A. 通过：生成三件套并落盘 输出/", "推荐：待核查项已标注在正文", True), option("B. 退回环节 3：补扫一遍验收与交付风险（重跑 3–7）"), option("C. 先看报告，暂不发送")])
    + f'<div style="font-size:12px;color:{SUB}">回复后重跑同一环节；这是第 7 轮，一轮一环节，进度都在 验收清单.json 里。</div></div>')
run_stream = (
    user_msg(filechip("设备采购合同.pdf · 2.4 MB") + "<div>审查这份合同。立场：<b>甲方风险优先</b>，委托方：华南智造。</div>")
    + bot_msg("合同审查工作狗 ⚖️", "收到。<b>七环节</b>一轮一个环节跑，验收打钩写回 验收清单.json；只在对外发送前停下来等你。")
    + stages_panel("审查流水线 · 验收清单.json · 15 / 15 通过", law_rows)
    + confirm_point)
RUN = HEAD + frame(COLS3,
    sidebar("law") + topbar("合同审查", chips=("环节 7 / 7", "第 7 轮 · 一轮一环节", "停机：待确认"), actions=[("它在流程画布的节点 n8", "text", "flow")]) +
    chat_col(run_stream, inputbar("回「A」通过，或「B」退回环节 3；也可以说「R-002 改成…」直接改报告")) +
    right_col(right_head("交付物预览 · 合同风险审查报告", "done"), gen.run_right_body)) + TAIL
