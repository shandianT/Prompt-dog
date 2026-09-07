/* ============================================================
   商机推进卡 / 阶段证据清单 —— opportunity.js
   screens: opportunity (id) · opportunity-stage (id)
   规则：AI 建议不覆盖正式值 · 258 为业务标签 · 赢单只能来自权威签约事件
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_OPP = {};
  const ui = App.ui, esc = App.esc, icon = App.icon;

  App.css('opp', `
    .opp-store { font-size: 17px; font-weight: 700; letter-spacing: -.01em; display: flex; align-items: center; gap: 2px; color: var(--ink); cursor: pointer; }
    .opp-store svg { color: var(--ink-4); flex: none; }
    .opp-official { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .opp-official .ov { background: var(--surface-2); border-radius: 12px; padding: 10px 12px; min-width: 0; }
    .opp-official .ov .l { font-size: 11.5px; color: var(--ink-3); margin-bottom: 6px; }
    .opp-official .ov .src { font-size: 11px; color: var(--ink-3); margin-top: 6px; line-height: 1.35; }
    .opp-note { display: flex; gap: 6px; align-items: flex-start; font-size: 11.5px; color: var(--ink-3); margin-top: 10px; line-height: 1.45; }
    .opp-note svg { flex: none; margin-top: 2px; }
    .opp-states { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .opp-state { background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; padding: 10px 6px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .opp-state .l { font-size: 11.5px; color: var(--ink-2); font-weight: 600; }
    .opp-state .s { font-size: 10.5px; color: var(--ink-3); line-height: 1.3; }
    .opp-ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 4px; }
    .opp-ai-grid .g { background: rgba(255, 255, 255, .7); border-radius: 10px; padding: 8px 10px; min-width: 0; }
    .opp-ai-grid .g .l { font-size: 11px; color: #7b7fb3; margin-bottom: 4px; }
    .opp-ai-grid .g .v { font-size: 13px; font-weight: 600; color: #3b3bb0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .opp-ai-grid .g .v .delta { font-size: 11px; font-weight: 500; color: #7b7fb3; }
    .opp-ai-list h5 { font-size: 12px; font-weight: 700; color: #3b3bb0; margin: 10px 0 4px; display: flex; align-items: center; gap: 4px; }
    .opp-ai-list ul { padding-left: 16px; margin: 0; }
    .opp-ai-list li { font-size: 13px; margin: 3px 0; color: #2f3350; line-height: 1.45; }
    .opp-ai-list .none { font-size: 12px; color: #7b7fb3; }
    .opp-next { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; background: rgba(255, 255, 255, .75); border-radius: 10px; margin-top: 6px; font-size: 13px; color: #2f3350; line-height: 1.4; }
    .opp-next .n { width: 20px; height: 20px; border-radius: 6px; background: var(--ai); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; margin-top: 1px; }
    .opp-next .meta { font-size: 11.5px; color: #7b7fb3; margin-top: 2px; }
    .opp-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .opp-cols h5 { font-size: 12px; font-weight: 700; color: var(--ink-2); margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
    .opp-cols h5.ok { color: var(--brand-3); }
    .opp-item { display: flex; gap: 6px; align-items: flex-start; font-size: 13px; line-height: 1.4; padding: 4px 0; color: var(--ink-2); }
    .opp-item svg { flex: none; margin-top: 2px; }
    .opp-item.done svg { color: var(--brand); }
    .opp-item.miss svg { color: var(--ink-4); }
    .opp-wrapchip { height: auto; min-height: 22px; padding: 3px 9px; white-space: normal; line-height: 1.3; text-align: left; }
    .opp-rule { display: flex; flex-direction: column; gap: 6px; }
    .opp-rule .r { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 10px; background: var(--surface-2); font-size: 13px; color: var(--ink-2); line-height: 1.4; }
    .opp-rule .r.on { background: var(--brand-soft); color: var(--brand-3); }
    .opp-rule .r .v { flex: 1; min-width: 0; }
    .opp-rule .r .v b { color: inherit; }
    .opp-rule .r .rank { width: 18px; height: 18px; border-radius: 50%; background: var(--surface); border: 1px solid var(--line-2); font-size: 10.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; color: var(--ink-3); }
    .opp-rule .r.on .rank { background: var(--brand); border-color: var(--brand); color: #fff; }
    .opp-rejected { background: var(--surface-3); border-radius: 14px; padding: 12px 14px; margin-bottom: 12px; font-size: 13px; color: var(--ink-2); line-height: 1.45; }
    .opp-rejected b { color: var(--ink); }
    .opp-confirmed .btn-row { margin-top: 8px; }
    .opp-confirmed .btn-row .btn { flex: 1; }
    .sheet-item.opp-locked { opacity: .45; }
    .sheet-item.opp-locked svg { color: var(--ink-3); }
    .opp-foot-sub { display: flex; gap: 8px; margin-top: 8px; }
    .opp-foot-sub .btn { flex: 1; }
    /* 阶段证据清单 */
    .opp-stage { display: flex; gap: 12px; padding: 12px 14px; background: var(--surface); border-radius: 16px; border: 1px solid rgba(17, 24, 39, .04); margin-bottom: 10px; }
    .opp-stage .num { width: 26px; height: 26px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: var(--surface-3); color: var(--ink-3); margin-top: 1px; }
    .opp-stage.done .num { background: var(--brand); color: #fff; }
    .opp-stage.current { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-soft); }
    .opp-stage.current .num { background: var(--surface); border: 2px solid var(--brand); color: var(--brand); }
    .opp-stage.future { opacity: .78; }
    .opp-stage.terminal .num { background: var(--surface-3); color: var(--ink-3); }
    .opp-stage .t { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .opp-stage .lbl { font-size: 11px; color: var(--ink-3); font-weight: 600; margin-top: 8px; }
    .opp-stage .txt { font-size: 13px; color: var(--ink-2); line-height: 1.45; margin-top: 2px; }
    .opp-ka .f { display: flex; gap: 10px; padding: 9px 0; border-top: .5px solid var(--line); font-size: 13px; line-height: 1.45; align-items: flex-start; }
    .opp-ka .f:first-child { border-top: 0; }
    .opp-ka .f .k { width: 108px; flex: none; color: var(--ink-3); }
    .opp-ka .f .k .st { display: block; font-size: 10.5px; color: var(--ink-4); margin-top: 1px; }
    .opp-ka .f .v { flex: 1; min-width: 0; color: var(--ink); }
    .opp-ka .f.need { background: #fffaf0; margin: 0 -16px; padding-left: 16px; padding-right: 16px; }
    .opp-ka .f.need .k { color: #b45309; }
  `);

  /* ---------- 常量 ---------- */
  const STAGES = [
    { name: '待触达', facts: ['门店存在', '地址正确', '归属明确'], exit: '有真实接触结果；无人接待保留待触达并约下次' },
    { name: '已触达', facts: ['对接人角色', '当前服务状态', '是否允许继续联系'], exit: '找到有效需求或明确无意向；拍照不算有效接触' },
    { name: '需求确认', facts: ['客户要解决的问题、风险点', '现供应商', '时间要求', '谁决定'], exit: '客户确认问题及下一次沟通；安排必要勘查' },
    { name: '方案沟通', facts: ['服务范围、频次', '客户现场证据', '方案反馈'], exit: '客户已收到并给出反馈；仅生成文档不推进阶段' },
    { name: '报价商务', facts: ['预算口径', '报价版本', '付款约定', '异议', '审批状态'], exit: '商务条件确认，报价按规则批准' },
    { name: '待签约', facts: ['合同主体', '服务承诺', '报价与合同版本'], exit: '有可核验签署结果后进入已赢单' },
    { name: '已赢单 / 已丢单 / 暂停培育', short: '结果', facts: ['权威签约信息', '已确认客户反馈'], exit: '赢单交接；丢单写原因；培育写触发条件或复访日期', terminal: true },
  ];
  const ALL_STAGES = ['待触达', '已触达', '需求确认', '方案沟通', '报价商务', '待签约', '已赢单', '已丢单', '暂停培育'];
  const LOCKED = ['已赢单', '已丢单'];
  const TIERS = [
    { v: 'unknown', sub: '没有足够有效接触记录，或证据相互冲突' },
    { v: 'none', sub: '客户明确拒绝、暂无需求或已确认的限制' },
    { v: 20, sub: '有效接触并出现初步需求，关键人/时间尚缺' },
    { v: 50, sub: '需求较清楚，关键角色和时间有证据' },
    { v: 80, sub: '方案与关键商务条件基本达成，有签约推进安排' },
  ];
  const KIND_TONE = { 新购: 'brand', 续约: 'info', 增购: 'violet' };
  const stageIdx = (st) => { const i = STAGES.findIndex((s) => s.name === st); if (i >= 0) return i; return ['已赢单', '已丢单', '暂停培育'].includes(st) ? 6 : 0; };
  const tl = (t) => App.tierLabel(t);

  /* ---------- 工具 ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  S.addDays = (s, n) => { const d = App.dayjs((s || App.TODAY).slice(0, 10)); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  // 演示时钟：固定演示日 + 递增分钟，保证记录有先后
  S.stamp = function () { const u = App.state.ui = App.state.ui || {}; u.clock = (u.clock || 0) + 1; return `${App.TODAY} 15:${pad(Math.min(59, 6 + u.clock * 2))}`; };
  const hist = (opp) => (opp.history = opp.history || []);
  const tierSourceLabel = (s) => { if (!s) return '—'; if (/^CRM ·/.test(s)) return '来自 ' + s; return s; };
  const kindChip = (k) => ui.chip(k, KIND_TONE[k] || 'gray');
  const nextObj = (n) => (typeof n === 'string' ? { text: n } : (n || null));

  S.isConfirmed = (opp) => !!opp.aiConfirmed || (opp.id === 'o_bing' && !!(App.state.demo && App.state.demo.oppConfirmed));
  S.confirmInfo = (opp) => opp.aiConfirmed || (opp.id === 'o_bing' ? { at: `${App.TODAY} 15:08`, taskId: 't_bing_next', from: { stage: '已触达', tier: 20 } } : null);

  // 回访日期优先级：客户约定 > 已接受任务 > 规则周期
  S.revisit = function (opp) {
    const open = App.state.tasks.filter((t) => t.oppId === opp.id && (t.status === 'todo' || t.status === 'doing')).sort((a, b) => (a.due < b.due ? -1 : 1));
    const agreed = open.find((t) => t.source === '客户约定') || null;
    const accepted = open.find((t) => t.source !== '客户约定' && !(t.source === 'AI建议' && !t.aiConfirmed)) || null;
    const rule = (App.state.settings && App.state.settings.revisitRule) || {};
    const days = rule.enabled ? rule[opp.tier] : null;
    const store = App.store(opp.storeId);
    const base = (store && store.lastVisit && store.lastVisit.date) || opp.updatedAt || App.TODAY;
    const ruleDate = days ? S.addDays(base, days) : null;
    const effective = agreed ? 'agreed' : accepted ? 'accepted' : ruleDate ? 'rule' : 'none';
    return { agreed, accepted, days, ruleDate, base, effective, rule };
  };

  /* ---------- 商机推进卡 ---------- */
  function headerCard(opp, store) {
    return `<div class="card">
      <div class="opp-store" onclick="App.go('customer',{id:'${store.id}'})"><span class="ellipsis">${esc(store.name)}</span>${icon('chevron-right', 18)}</div>
      <div class="muted small mt4">${esc(store.type)} · ${esc(store.street || store.district)} · ${esc(store.address)}</div>
      <div class="chips mt8">${ui.chip(opp.service, 'outline', { icon: 'bug' })}${kindChip(opp.kind)}${ui.chip('负责人 ' + opp.ownerName, 'gray', { icon: 'user' })}${store.group ? ui.chip('KA · ' + store.group.name, 'info', { icon: 'building' }) : ''}</div>
    </div>`;
  }

  function officialCard(opp) {
    return `<div class="card">
      <div class="card-title">正式值 ${ui.factTag('official')}<span class="grow"></span><span class="muted tiny" style="font-weight:400">更新 ${esc(App.fmt.md(opp.updatedAt))}</span></div>
      <div class="opp-official">
        <div class="ov"><div class="l">正式阶段</div>${ui.stageChip(opp.stage)}<div class="src">按证据进度推进，变更需原因</div></div>
        <div class="ov"><div class="l">正式分层（258）</div>${ui.tierChip(opp.tier)}<div class="src">${esc(tierSourceLabel(opp.tierSource))}</div></div>
      </div>
      <div class="opp-note">${icon('info', 13)}<span>258 为业务标签，非统计校准的赢单概率；签约以权威事件为准</span></div>
      <div class="row mt12">
        ${ui.btn('阶段变更', { tone: 'ghost', size: 'xs', onclick: `S_OPP.changeStage('${opp.id}')` })}
        ${ui.btn('分层调整', { tone: 'ghost', size: 'xs', onclick: `S_OPP.changeTier('${opp.id}')` })}
        <span class="grow"></span>
        <span class="link small" onclick="App.go('opportunity-stage',{id:'${opp.id}'})">查看阶段证据清单 ›</span>
      </div>
    </div>`;
  }

  function statesCard(opp, store) {
    const others = App.oppsOf(store.id).filter((o) => o.id !== opp.id);
    return `<div class="card">
      <div class="card-title">三组状态分开看<span class="muted tiny" style="font-weight:400">互不覆盖 · 阶段与分层挂在商机上</span></div>
      <div class="opp-states">
        <div class="opp-state"><div class="l">合作状态</div>${ui.coopChip(store.coop)}<div class="s">门店 · 合同/服务信息</div></div>
        <div class="opp-state"><div class="l">商机阶段</div>${ui.stageChip(opp.stage)}<div class="s">商机 · 证据进度</div></div>
        <div class="opp-state"><div class="l">意向分层</div>${ui.tierChip(opp.tier)}<div class="s">商机 · 258 业务标签</div></div>
      </div>
      ${others.length ? `<div class="muted tiny mt8">同店其他商机：${others.map((o) => `<span class="link" onclick="App.go('opportunity',{id:'${o.id}'})">${esc(o.kind + ' ' + o.service)}</span> · ${esc(o.stage)} · ${esc(tl(o.tier))}`).join('；')}（互不覆盖）</div>` : ''}
    </div>`;
  }

  function aiCard(opp) {
    const ai = opp.ai;
    if (!ai) {
      return ui.notice('gray', `<div>确认拜访事实后生成建议（AI 不覆盖正式值）</div><div class="tiny muted mt4">建议将附依据、缺失证据、置信度与规则版本，需人工确认后才写入正式值</div><div class="mt8">${ui.btn('记录拜访', { tone: 'secondary', size: 'sm', icon: 'camera', onclick: `App.go('visit-capture',{storeId:'${opp.storeId}',oppId:'${opp.id}'})` })}</div>`, 'sparkle');
    }
    const tierDelta = ai.tier !== opp.tier ? `<span class="delta">正式 ${esc(tl(opp.tier))} → ${esc(tl(ai.tier))}</span>` : '<span class="delta">与正式值一致</span>';
    const stageDelta = ai.stage !== opp.stage ? `<span class="delta">正式 ${esc(opp.stage)} → ${esc(ai.stage)}</span>` : '<span class="delta">与正式值一致</span>';
    const nexts = (ai.next || []).map(nextObj);
    const body = `
      ${ai.conflict ? `<div class="notice warn" style="margin-bottom:10px">${icon('alert', 16)}<div><b>${esc(ai.reviewStatus === '待复核' ? '待主管复核' : ai.reviewStatus || '待主管复核')}</b> · ${esc(ai.conflict)}<div class="tiny mt4">不自动降级、不改变跟进责任；复核前正式分层保持 ${esc(tl(opp.tier))}</div></div></div>` : ''}
      <div class="opp-ai-grid">
        <div class="g"><div class="l">建议分层</div><div class="v">${ui.chip(tl(ai.tier), 'ai')}${tierDelta}</div></div>
        <div class="g"><div class="l">建议阶段</div><div class="v">${ui.chip(ai.stage, 'ai')}${stageDelta}</div></div>
        <div class="g"><div class="l">置信度</div><div class="v">${esc(ai.confidence || '—')}</div></div>
        <div class="g"><div class="l">规则版本</div><div class="v">${esc(ai.ruleVersion || '258 规则 v0.1-demo')}</div></div>
      </div>
      <div class="opp-ai-list">
        <h5>${icon('file', 13)}依据</h5>${(ai.basis || []).length ? `<ul>${ai.basis.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '<div class="none">无</div>'}
        <h5>${icon('warning', 13)}缺失证据</h5>${(ai.missing || []).length ? `<ul>${ai.missing.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '<div class="none">无缺失项</div>'}
        <h5>${icon('arrow-right', 13)}建议下一步</h5>${nexts.length ? nexts.map((n, i) => `<div class="opp-next"><div class="n">${i + 1}</div><div class="grow"><div>${esc(n.text)}</div>${n.date || n.type ? `<div class="meta">${n.date ? esc(App.fmt.mdw(n.date)) : ''}${n.date && n.type ? ' · ' : ''}${n.type ? esc(n.type) : ''}${n.date ? ' · 来源 客户约定' : ''}</div>` : ''}</div></div>`).join('') : '<div class="none">无</div>'}
      </div>`;
    return ui.aiCard({ title: 'AI 建议 · 258 分层与阶段', meta: `派生数据 · 不改正式值 · 基于 ${App.fmt.md(opp.updatedAt)} 已确认事实`, body, note: ai.note ? esc(ai.note) : '用户可"一次确认"或"拒绝并说明"，未确认前正式值不变' });
  }

  function confirmedNotice(opp) {
    const c = S.confirmInfo(opp); if (!c) return '';
    const task = c.taskId && App.task(c.taskId);
    return `<div class="notice ok opp-confirmed">${icon('check-circle', 16)}<div><b>已一次确认</b>（${esc(c.at)}）：阶段 ${esc(c.from.stage)} → ${esc(opp.stage)} · 分层 ${esc(tl(c.from.tier))} → ${esc(tl(opp.tier))}${task ? ` · 任务草稿「${esc(task.title)}」已写入` : (c.dedup ? ' · 任务同周期去重，未新建' : '')}
      <div class="btn-row">${task ? ui.btn('查看任务', { tone: 'outline', size: 'sm', icon: 'list', onclick: `App.go('task',{id:'${task.id}'})` }) : ''}${ui.btn('生成方案', { tone: 'primary', size: 'sm', icon: 'doc', onclick: `App.go('proposal-new',{oppId:'${opp.id}'})` })}</div></div></div>`;
  }

  function rejectedCard(opp) {
    const r = opp.aiRejected; if (!r) return '';
    return `<div class="opp-rejected">
      <div class="row"><b>已拒绝 AI 建议</b>${ui.chip(r.review ? '已转主管复核' : '原因已记录', r.review ? 'warn' : 'gray', { sm: true })}<span class="grow"></span><span class="tiny muted">${esc(r.at)}</span></div>
      <div class="mt4">原因：${esc(r.reason)}</div>
      <div class="tiny muted mt4">正式值未变化 · 可补事实重算或转主管复核</div>
      <div class="btn-row mt8">${ui.btn('补充事实', { tone: 'secondary', size: 'sm', icon: 'camera', onclick: `App.go('visit-capture',{storeId:'${opp.storeId}',oppId:'${opp.id}'})` })}${ui.btn(r.review ? '已转主管复核' : '转主管复核', { tone: 'ghost', size: 'sm', icon: 'users', disabled: !!r.review, onclick: `S_OPP.toReview('${opp.id}')` })}</div>
    </div>`;
  }

  function actionsCard(opp) {
    const done = opp.done || [], missing = opp.missing || [];
    return `<div class="card">
      <div class="card-title">已完成 / 缺失动作</div>
      ${opp.stallReason ? `<div class="mb8">${ui.chip('停滞原因: ' + opp.stallReason, 'warn', { icon: 'alert', cls: 'opp-wrapchip' })}</div>` : ''}
      ${opp.reconnect ? `<div class="mb8">${ui.chip('重新联系条件: ' + opp.reconnect, 'gray', { icon: 'clock', cls: 'opp-wrapchip' })}</div>` : ''}
      <div class="opp-cols">
        <div><h5 class="ok">${icon('check-circle', 14)}已完成 ${done.length}</h5>${done.length ? done.map((d) => `<div class="opp-item done">${icon('check', 14)}<span>${esc(d)}</span></div>`).join('') : '<div class="muted small">暂无</div>'}</div>
        <div><h5>${icon('warning', 14)}缺失 ${missing.length}</h5>${missing.length ? missing.map((m) => `<div class="opp-item miss">${icon('clock', 14)}<span>${esc(m)}</span></div>`).join('') : '<div class="muted small">无缺失项</div>'}</div>
      </div>
    </div>`;
  }

  function revisitCard(opp) {
    const rv = S.revisit(opp);
    const on = (k) => (rv.effective === k ? 'on' : '');
    const tag = (k) => (rv.effective === k ? ui.chip('生效', 'brand', { sm: true }) : '');
    return `<div class="card">
      <div class="card-title">回访规则<span class="grow"></span>${ui.chip('演示规则', 'warn', { sm: true })}</div>
      <div class="muted small mb8">回访日期优先级：客户约定 &gt; 已接受任务 &gt; 规则周期（${esc(rv.rule.label || '演示规则 20%=7天 · 50%=3天 · 80%=1天')}）</div>
      <div class="opp-rule">
        <div class="r ${on('agreed')}"><div class="rank">1</div><div class="v"><b>客户约定</b>${rv.agreed ? ` · ${esc(App.fmt.mdw(rv.agreed.due))} · <span class="link" onclick="App.go('task',{id:'${rv.agreed.id}'})">${esc(rv.agreed.title)}</span>` : ' · 暂无销售确认的客户约定日期'}</div>${tag('agreed')}</div>
        <div class="r ${on('accepted')}"><div class="rank">2</div><div class="v"><b>已接受任务</b>${rv.accepted ? ` · ${esc(App.fmt.mdw(rv.accepted.due))} · <span class="link" onclick="App.go('task',{id:'${rv.accepted.id}'})">${esc(rv.accepted.title)}</span>` : ' · 暂无'}</div>${tag('accepted')}</div>
        <div class="r ${on('rule')}"><div class="rank">3</div><div class="v"><b>规则周期</b>${rv.days ? ` · ${esc(tl(opp.tier))}=${rv.days} 天 · 自最近有效跟进 ${esc(App.fmt.md(rv.base))} 起 → ${esc(App.fmt.mdw(rv.ruleDate))}${rv.ruleDate < App.TODAY ? '（已过，以上一级为准）' : ''}` : ` · 分层「${esc(tl(opp.tier))}」未配置周期，不生成规则型任务`}</div>${tag('rule')}</div>
      </div>
      ${rv.agreed ? `<div class="notice info" style="margin:10px 0 0">${icon('info', 16)}<div>已存在客户约定任务，同一商机同一周期的规则型提醒<b>已去重</b>，不再重复生成</div></div>` : ''}
      <div class="tiny muted mt8">资料编辑、AI 重算、创建草稿、发送系统提醒不重置跟进计时；仅发材料无反馈只记"已发送"</div>
    </div>`;
  }

  function historyCard(opp) {
    const h = opp.history || []; if (!h.length) return '';
    return `<div class="card"><div class="card-title">变更记录<span class="muted tiny" style="font-weight:400">跳级/退回/拒绝均留原因</span></div>${ui.timeline(h.map((x) => ({ time: x.time, tag: x.type, title: esc(x.title), body: x.body ? esc(x.body) : '', tone: x.tone || '' })))}</div>`;
  }

  App.register('opportunity', {
    title: '商机推进卡', tab: 'customers',
    prd: ['F04 阶段、258 与下一步行动', '6.1 三组状态分开', '6.2 地推 Playbook', '6.4 258 建议与回访规则', '7 页面表·商机推进卡'],
    rules: ['AI 建议不覆盖正式值，确认后一次写入', '258 为业务标签，非成交概率', '赢单只能来自权威签约事件', '拒绝建议须记录原因，可重算或转复核', '回访日期：客户约定 > 已接受任务 > 规则周期', '旧快照分析不覆盖新建议', '同一商机同一周期规则任务去重'],
    demoActions: [{ label: '模拟旧快照分析（不覆盖新建议）', icon: 'history', run() { S.oldSnapshot(); } }],
    render(params) {
      const opp = App.opp(params.id);
      if (!opp) return ui.empty({ icon: 'trend', title: '商机不存在', sub: '该商机未纳入演示数据', action: ui.btn('返回', { tone: 'ghost', size: 'sm', onclick: 'App.back()' }) });
      const store = App.store(opp.storeId) || { id: '', name: '—', type: '', address: '', coop: 'none' };
      const confirmed = S.isConfirmed(opp);
      return [
        headerCard(opp, store),
        officialCard(opp),
        statesCard(opp, store),
        opp.ai && confirmed ? confirmedNotice(opp) : '',
        opp.ai && opp.aiRejected ? rejectedCard(opp) : '',
        aiCard(opp),
        actionsCard(opp),
        revisitCard(opp),
        historyCard(opp),
      ].join('');
    },
    footer(params) {
      const opp = App.opp(params.id); if (!opp) return '';
      const id = opp.id;
      const sub = `<div class="opp-foot-sub">${ui.btn('阶段变更', { tone: 'ghost', size: 'sm', onclick: `S_OPP.changeStage('${id}')` })}${ui.btn('分层调整', { tone: 'ghost', size: 'sm', onclick: `S_OPP.changeTier('${id}')` })}</div>`;
      if (!opp.ai) return ui.btn('记录拜访 · 确认事实后生成建议', { block: true, icon: 'camera', onclick: `App.go('visit-capture',{storeId:'${opp.storeId}',oppId:'${id}'})` }) + sub;
      if (S.isConfirmed(opp)) {
        const c = S.confirmInfo(opp); const task = c && c.taskId && App.task(c.taskId);
        return `<div class="btn-row">${task ? ui.btn('查看任务', { tone: 'secondary', icon: 'list', onclick: `App.go('task',{id:'${task.id}'})` }) : ui.btn('记录拜访', { tone: 'secondary', icon: 'camera', onclick: `App.go('visit-capture',{storeId:'${opp.storeId}',oppId:'${id}'})` })}${ui.btn('生成方案', { icon: 'doc', onclick: `App.go('proposal-new',{oppId:'${id}'})` })}</div>`;
      }
      if (opp.aiRejected) return ui.btn('补充事实重算（记录拜访）', { block: true, icon: 'camera', onclick: `App.go('visit-capture',{storeId:'${opp.storeId}',oppId:'${id}'})` }) + sub;
      if (opp.ai.conflict) {
        return `<div class="btn-row">${ui.btn('拒绝建议并说明', { tone: 'outline', icon: 'x', onclick: `S_OPP.reject('${id}')` })}${ui.btn('补充事实', { icon: 'camera', onclick: `App.go('visit-capture',{storeId:'${opp.storeId}',oppId:'${id}'})` })}</div><div class="tiny muted mt8" style="text-align:center">降层建议已进入主管复核，复核通过前不可直接确认；补充事实 = 记录拜访后重算</div>`;
      }
      return ui.btn('一次确认：阶段 + 分层 + 任务草稿', { block: true, icon: 'check-circle', onclick: `S_OPP.confirmSuggestion('${id}')` })
        + `<div class="opp-foot-sub">${ui.btn('拒绝建议并说明', { tone: 'outline', size: 'sm', icon: 'x', onclick: `S_OPP.reject('${id}')` })}${ui.btn('阶段变更', { tone: 'ghost', size: 'sm', onclick: `S_OPP.changeStage('${id}')` })}${ui.btn('分层调整', { tone: 'ghost', size: 'sm', onclick: `S_OPP.changeTier('${id}')` })}</div>`;
    },
  });

  /* ---------- 一次确认 ---------- */
  S.findDup = function (opp, n) {
    const open = App.state.tasks.filter((t) => t.oppId === opp.id && (t.status === 'todo' || t.status === 'doing'));
    if (n && n.date) return open.find((t) => t.due === n.date) || null;
    const rv = S.revisit(opp); const span = rv.days || 7; const limit = S.addDays(App.TODAY, span);
    return open.find((t) => t.due >= App.TODAY && t.due <= limit) || null;
  };
  S.confirmSuggestion = function (id) {
    const opp = App.opp(id); if (!opp || !opp.ai) return;
    const ai = opp.ai; const n = nextObj((ai.next || [])[0]); const dup = S.findDup(opp, n); const rv = S.revisit(opp);
    const stageLine = ai.stage !== opp.stage ? `${esc(opp.stage)} → <b>${esc(ai.stage)}</b>` : `保持 <b>${esc(opp.stage)}</b>`;
    const tierLine = ai.tier !== opp.tier ? `${esc(tl(opp.tier))} → <b>${esc(tl(ai.tier))}</b>` : `保持 <b>${esc(tl(opp.tier))}</b>`;
    let taskLine = '无建议任务';
    if (n && dup) taskLine = `已存在「${esc(dup.title)} · ${esc(App.fmt.md(dup.due))}」，同一商机同一周期去重，不再新建`;
    else if (n) { const due = n.date || rv.ruleDate || S.addDays(App.TODAY, 3); taskLine = `新建「${esc(n.text)}」 · ${esc(App.fmt.md(due))} · 来源 ${n.date ? '客户约定' : 'AI建议（本次确认）'}`; }
    App.modal({
      title: '一次确认',
      body: `<div class="small muted mb8">以下将一次写入正式值，减少多次弹窗</div>${ui.kv([['阶段', stageLine], ['分层', tierLine], ['任务草稿', taskLine]])}<div class="tiny muted mt12">确认人 ${esc(App.me().name)} · 记录来源为 AI 建议 ${esc(ai.ruleVersion || '258 规则 v0.1-demo')}；签约状态不在此处变更</div>`,
      actions: [{ label: '取消', tone: 'ghost' }, { label: '确认', tone: 'primary', onClick: () => S.applyConfirm(id, n, dup) }],
    });
  };
  S.applyConfirm = function (id, n, dup) {
    const opp = App.opp(id); const ai = opp.ai; const at = S.stamp();
    const from = { stage: opp.stage, tier: opp.tier };
    let taskId = null;
    if (id === 'o_bing') {
      window.DATA.confirmDemoOpp(App.state); taskId = 't_bing_next';
    } else {
      opp.stage = ai.stage; opp.tier = ai.tier; opp.tierSource = '确认 · 9/7（依据 AI 建议）'; opp.updatedAt = App.TODAY;
      if (n && dup) taskId = dup.id;
      else if (n) {
        const rv = S.revisit(opp); const due = n.date || rv.ruleDate || S.addDays(App.TODAY, 3);
        const task = { id: App.uid('t'), storeId: opp.storeId, oppId: opp.id, title: n.text, type: n.type || '回访', ownerId: opp.ownerId, ownerName: opp.ownerName, due, time: '', status: 'todo',
          source: n.date ? '客户约定' : 'AI建议', aiConfirmed: true, confirmedAt: at,
          reason: n.date ? `客户约定日期 ${App.fmt.md(n.date)}，优先于规则周期` : `AI 建议下一步，已由 ${App.me().name} 一次确认`,
          evidence: [`拜访记录 ${App.fmt.md(opp.updatedAt)} · 已确认事实`], expected: n.text, dedup: '同一商机同一周期规则型提醒不再重复生成' };
        App.state.tasks.unshift(task); taskId = task.id;
      }
    }
    opp.aiConfirmed = { at, taskId, from, dedup: !!dup };
    const task = taskId && App.task(taskId);
    hist(opp).unshift({ time: at, type: '一次确认', title: `阶段 ${from.stage} → ${opp.stage} · 分层 ${tl(from.tier)} → ${tl(opp.tier)}`, body: task ? `任务草稿：${task.title} · ${App.fmt.md(task.due)}` : '无新任务（同周期去重）', tone: '' });
    App.save();
    App.toast('已确认：阶段 · 分层 · 任务草稿一次写入', { icon: 'check-circle', duration: 2000 });
    App.refresh();
  };

  /* ---------- 拒绝 / 复核 ---------- */
  S.reject = function (id) {
    App.prompt('拒绝建议并说明原因', '例如：口头意向不代表决策人态度，暂不升 50%', (v) => {
      const reason = (v || '').trim(); if (!reason) { App.toast('拒绝需要填写原因'); return; }
      const opp = App.opp(id); const at = S.stamp();
      opp.aiRejected = { reason, at };
      hist(opp).unshift({ time: at, type: '拒绝建议', title: '已拒绝 AI 建议 · 正式值未变', body: '原因：' + reason, tone: 'gray' });
      App.save(); App.toast('已记录拒绝原因 · 正式值未变化'); App.refresh();
    });
  };
  S.toReview = function (id) {
    const opp = App.opp(id); if (!opp || !opp.aiRejected) return;
    const at = S.stamp(); opp.aiRejected.review = true; opp.aiRejected.reviewAt = at;
    hist(opp).unshift({ time: at, type: '转主管复核', title: '已转主管复核', body: '进入待复核队列，复核前不改变分层与跟进责任', tone: 'warn' });
    App.save(); App.toast('已转主管复核 · 进入待复核队列', { icon: 'users' }); App.refresh();
  };

  /* ---------- 手动阶段 / 分层（需原因；赢单/丢单锁定） ---------- */
  S.changeStage = function (id) {
    const opp = App.opp(id); if (!opp) return;
    const items = ALL_STAGES.map((st) => {
      const locked = LOCKED.includes(st); const cur = st === opp.stage;
      return {
        label: st, locked,
        sub: locked ? '由权威签约事件/确认反馈产生，不可手动设置' : cur ? '当前阶段' : st === '暂停培育' ? '需写触发条件或复访日期' : '',
        right: cur ? '当前' : '', icon: locked ? 'lock' : undefined,
        onSelect: () => { if (locked) { App.toast('赢单/丢单只能来自权威签约事件或已确认客户反馈', { icon: 'lock', duration: 2200 }); return; } if (cur) { App.toast('已是当前阶段'); return; } S.applyStage(id, st); },
      };
    });
    App.sheet({ title: '阶段变更 · 允许有证据的跳级/退回，需填写原因', items });
    App.qa('.sheet-item').forEach((n, i) => { if (items[i] && items[i].locked) n.classList.add('opp-locked'); });
  };
  S.applyStage = function (id, st) {
    App.prompt(`变更阶段为「${st}」的原因 / 证据`, st === '暂停培育' ? '请写触发条件或复访日期，例如：装修完成后（约 11 月）复访' : '例如：客户已确认问题并约定下次沟通时间', (v) => {
      const reason = (v || '').trim(); if (!reason) { App.toast('阶段变更需要填写原因'); return; }
      const opp = App.opp(id); const at = S.stamp(); const from = opp.stage;
      opp.stage = st; opp.updatedAt = App.TODAY;
      hist(opp).unshift({ time: at, type: stageIdx(st) < stageIdx(from) ? '阶段退回' : '阶段变更', title: `阶段 ${from} → ${st}（手动）`, body: '原因：' + reason, tone: '' });
      App.save(); App.toast('阶段已变更 · 原因已记录', { icon: 'check-circle' }); App.refresh();
    });
  };
  S.changeTier = function (id) {
    const opp = App.opp(id); if (!opp) return;
    App.sheet({ title: '分层调整（258 业务标签）· 需填写原因', items: TIERS.map((t) => ({ label: tl(t.v), sub: t.sub, right: String(t.v) === String(opp.tier) ? '当前' : '', onSelect: () => {
      if (String(t.v) === String(opp.tier)) { App.toast('已是当前分层'); return; }
      App.prompt(`调整分层为「${tl(t.v)}」的原因`, '例如：决策人明确表示暂无需求（9/7 到店）', (v) => {
        const reason = (v || '').trim(); if (!reason) { App.toast('分层调整需要填写原因'); return; }
        const o = App.opp(id); const at = S.stamp(); const from = o.tier;
        o.tier = t.v; o.tierSource = '确认 · 9/7（手动）'; o.updatedAt = App.TODAY;
        hist(o).unshift({ time: at, type: '分层调整', title: `分层 ${tl(from)} → ${tl(t.v)}（手动）`, body: '原因：' + reason, tone: '' });
        App.save(); App.toast('分层已调整 · 原因已记录', { icon: 'check-circle' }); App.refresh();
      });
    } })) });
  };

  /* ---------- 演示动作：旧快照分析 ---------- */
  S.oldSnapshot = function () {
    const top = App.currentEntry(); const opp = top && App.opp(top.params.id); if (!opp) return;
    const at = S.stamp(); const oldDate = App.fmt.md(S.addDays(opp.updatedAt || App.TODAY, -5));
    hist(opp).unshift({ time: at, type: '旧快照分析', title: `旧快照分析结果到达（基于 ${oldDate} 数据），已丢弃`, body: `快照早于当前正式值/建议更新时间（${App.fmt.md(opp.updatedAt)}），不覆盖新建议；仅留记录`, tone: 'gray' });
    App.save();
    App.toast(`旧快照（${oldDate}）分析晚到，不覆盖 ${App.fmt.md(opp.updatedAt)} 的新建议`, { icon: 'history', duration: 2600 });
    App.refresh();
  };

  /* ---------- 阶段证据清单（Playbook） ---------- */
  function kaFields(opp, store) {
    const ka = opp.ka || {}; const contacts = store.contacts || [];
    const byRole = (d) => contacts.filter((c) => c.decision === d).map((c) => `${c.name}（${c.role}${c.verified ? '' : ' · 待核实'}）`).join('、');
    const roles = ['使用方', '决策人', '采购方'].map((d) => { const v = byRole(d); return v ? `${d === '决策人' ? '决策方' : d} ${v}` : null; }).filter(Boolean).join(' · ');
    return [
      { k: '集团/子公司关系', stage: '已触达', v: store.group ? `${store.group.name} · 签约主体 ${store.group.entity} · ${store.group.sites} 个服务点` : null },
      { k: '使用方/决策方/采购方', stage: '需求确认', v: roles || null },
      { k: '现场审核要求', stage: '需求确认', v: ka.auditReq || null },
      { k: '勘查结论', stage: '方案沟通', v: ka.surveyResult || null },
      { k: '服务边界', stage: '方案沟通', v: ka.serviceBoundary || null },
      { k: '成本核算', stage: '报价商务', v: ka.costing || null },
      { k: '账期', stage: '报价商务', v: ka.paymentTerms || null },
      { k: '非标承诺与审批', stage: '报价商务', v: ka.nonStandard || null },
      { k: '首次服务交接', stage: '待签约', v: ka.handover || null },
    ];
  }

  App.register('opportunity-stage', {
    title: '阶段证据清单', tab: 'customers',
    prd: ['6.2 地推 Playbook 七阶段', '6.3 KA Playbook 增补', 'F04 阶段、258 与下一步行动'],
    rules: ['允许有证据的跳级/退回/重开，记录原因', '仅生成文档不推进阶段', '有可核验签署结果后才进入已赢单', 'KA 首期不要求填满所有字段'],
    render(params) {
      const opp = App.opp(params.id);
      if (!opp) return ui.empty({ icon: 'layers', title: '商机不存在' });
      const store = App.store(opp.storeId) || { name: '—', contacts: [] };
      const idx = stageIdx(opp.stage); const isKA = !!store.group;
      const missing = opp.missing || [], done = opp.done || [];
      const head = `<div class="card">
        <div class="row between"><div class="grow"><div class="bold" style="font-size:16px">${esc(store.name)}</div><div class="muted small mt4">${esc(opp.kind)} · ${esc(opp.service)} · ${isKA ? 'KA Playbook（含增补字段）' : '地推 Playbook 七阶段'}</div></div>${ui.stageChip(opp.stage)}</div>
        <div class="mt12">${ui.stepper(STAGES.map((s) => s.short || s.name), idx)}</div>
        <div class="muted tiny mt8">当前第 ${idx + 1} / 7 阶段 · 每阶段列出"要确认的业务事实"与"退出证据"，缺失项来自商机推进卡</div>
      </div>`;
      const cards = STAGES.map((s, i) => {
        const cls = i < idx ? 'done' : i === idx ? 'current' : 'future';
        return `<div class="opp-stage ${cls} ${s.terminal ? 'terminal' : ''}">
          <div class="num">${i < idx ? icon('check', 14) : i + 1}</div>
          <div class="grow">
            <div class="t">${esc(s.name)}${i === idx ? ui.chip('当前', 'brand', { sm: true }) : i < idx ? ui.chip('已完成', 'ok', { sm: true }) : ''}${s.terminal ? ui.chip('权威事件产生', 'gray', { sm: true, icon: 'lock' }) : ''}</div>
            <div class="lbl">要确认的业务事实</div><div class="txt">${s.facts.map(esc).join(' · ')}</div>
            <div class="lbl">退出证据 / 下一步</div><div class="txt">${esc(s.exit)}</div>
            ${i === idx && done.length ? `<div class="lbl">已具备</div><div class="chips mt4">${done.map((d) => ui.chip(d, 'ok', { sm: true, icon: 'check' })).join('')}</div>` : ''}
            ${i === idx && missing.length ? `<div class="lbl">当前缺失</div><div class="chips mt4">${missing.map((m) => ui.chip(m, 'warn', { sm: true })).join('')}</div>` : ''}
          </div>
        </div>`;
      }).join('');
      let ka = '';
      if (isKA) {
        const fields = kaFields(opp, store);
        ka = `${ui.section('KA 增补证据', ui.chip('6.3', 'gray', { sm: true }), 'KA PLAYBOOK')}
          <div class="notice info">${icon('info', 16)}<div>首期不要求填满所有字段，按阶段展示当前需要补的证据；标黄为「${esc(opp.stage)}」阶段应具备的项</div></div>
          <div class="card opp-ka">${fields.map((f) => `<div class="f ${f.stage === opp.stage ? 'need' : ''}"><div class="k">${esc(f.k)}<span class="st">${esc(f.stage)} 阶段</span></div><div class="v">${f.v ? esc(f.v) : ui.chip('待补', 'warn', { sm: true })}</div></div>`).join('')}</div>`;
      }
      const foot = `<div class="notice gray">${icon('shield', 16)}<div>允许有证据的跳级、退回和重开，都记录原因；不会因为拜访次数多、发了方案或 AI 判断热情就自动赢单。</div></div>`;
      return head + cards + ka + foot;
    },
    footer(params) {
      const opp = App.opp(params.id); if (!opp) return '';
      return `<div class="btn-row">${ui.btn('阶段变更（需原因）', { tone: 'outline', icon: 'edit', onclick: `S_OPP.changeStage('${opp.id}')` })}${ui.btn('返回推进卡', { tone: 'primary', icon: 'trend', onclick: 'App.back()' })}</div>`;
    },
  });
})();
