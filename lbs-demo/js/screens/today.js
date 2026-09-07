/* ============================================================
   今日工作台 / 通知 — today.js
   页面：today（Tab 根，角色感知；主管可切"我的 / 团队"）、notifications
   依据：PRD 7 页面表（今日工作台 / 团队工作台）、F05 回访任务与提醒、F08 团队管理
   ============================================================ */
(function () {
  'use strict';
  const T = window.S_TODAY = {};

  /* ---------- 工具 ---------- */
  const esc = (s) => App.esc(s);
  const TODAY = () => App.TODAY;
  const uiState = () => { App.state.ui = App.state.ui || {}; return App.state.ui; };
  const isActive = (t) => t.status === 'todo' || t.status === 'doing';
  const pad = (x) => String(x).padStart(2, '0');
  const addDays = (s, n) => { const d = App.dayjs(s); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const APPT_TYPES = ['约访', '勘查'];
  const TYPE_ICON = { 约访: 'calendar', 勘查: 'search', 回访: 'history', 陌拜: 'map-pin', 商务: 'briefcase', 承诺核对: 'contract', 辅导: 'coach', 客诉跟进: 'alert', 方案: 'doc' };
  const COOP = { active: '服务中', paused: '停做', none: '未合作' };
  const DATA_UPDATED = '09:30';
  // 通知归属（data.js 的通知无 ownerId；已知样本按门店/拜访归属推断，未知的对所有角色可见；主管看全部）
  const NOTIF_OWNER = { n1: 'u_dj', n2: 'u_dj', n3: 'u_dj' };

  /* ---------- 取数（按当前角色） ---------- */
  T.myTasks = () => App.state.tasks.filter((t) => t.ownerId === App.me().id);
  T.myStores = () => App.state.stores.filter((s) => s.perm === 'full' && (App.isMgr() || s.ownerId === App.me().id));
  T.notifs = function () {
    const me = App.me();
    return (App.state.notifications || []).filter((n) => {
      if (App.isMgr()) return true;
      const st = n.storeId ? App.store(n.storeId) : null;
      const owner = n.ownerId || NOTIF_OWNER[n.id] || (st && st.ownerId) || null;
      return !owner || owner === me.id;
    });
  };
  T.risks = function () {
    const me = App.me(); const out = []; const seen = {};
    App.state.stores.forEach((s) => {
      if (!(App.isMgr() || s.ownerId === me.id) || !s.complaint) return;
      if (s.complaint.status === 'open') { seen[s.id] = 1; out.push({ kind: 'open', order: 0, store: s }); }
      else if (s.complaint.status === 'stale') { seen[s.id] = 1; out.push({ kind: 'stale', order: 2, store: s }); }
    });
    T.notifs().filter((n) => n.kind === 'risk' && !(n.storeId && seen[n.storeId])).forEach((n) => out.push({ kind: 'notif', order: 1, n, store: n.storeId ? App.store(n.storeId) : null }));
    return out.sort((a, b) => a.order - b.order);
  };
  T.data = function () {
    const me = App.me(), today = TODAY(), horizon = addDays(today, 2);
    const mine = T.myTasks();
    const appts = mine.filter((t) => t.due === today && APPT_TYPES.includes(t.type) && t.status !== 'cancelled')
      .sort((a, b) => ((a.time || '') < (b.time || '') ? -1 : 1));
    const apptIds = appts.map((t) => t.id);
    const overdue = mine.filter((t) => isActive(t) && t.due < today).sort((a, b) => (a.due < b.due ? -1 : 1));
    const todos = mine.filter((t) => isActive(t) && t.due >= today && t.due <= horizon && !apptIds.includes(t.id))
      .sort((a, b) => (a.due !== b.due ? (a.due < b.due ? -1 : 1) : ((a.time || '') < (b.time || '') ? -1 : 1)));
    const pending = App.state.visits.filter((v) => v.status === 'pending_confirm' && v.by === me.name);
    return { appts, overdue, todos, pending, risks: T.risks(), unread: T.notifs().filter((n) => !n.read).length };
  };

  /* ---------- 片段 ---------- */
  const link = (label, onclick) => `<span class="tdy-link" onclick="${onclick}">${esc(label)}${App.icon('chevron-right', 14)}</span>`;
  const compactEmpty = (icon, title, sub) => `<div class="list tdy-empty">${App.ui.empty({ icon, title, sub })}</div>`;
  const greeting = () => '早上好'; // 演示时刻固定 09:41

  function hero(d) {
    const me = App.me();
    const metrics = [
      { v: d.appts.length, l: '今日约访' }, { v: d.overdue.length, l: '超期回访', warn: d.overdue.length > 0 },
      { v: d.pending.length, l: '待确认', warn: d.pending.length > 0 }, { v: d.todos.length, l: '今日待办' },
    ];
    return `<div class="hero tdy-hero">
      <div class="tdy-bell" onclick="App.go('notifications')" aria-label="通知">${App.icon('bell', 20)}${d.unread ? `<span class="n">${d.unread}</span>` : ''}</div>
      <div class="h-eyebrow">${esc(App.fmt.mdw(TODAY()))} · ${esc(me.org)}</div>
      <div class="h-title">${greeting()}，${esc(me.name)}</div>
      <div class="h-sub">${esc(me.roleName)} · ${esc(me.scope)}</div>
      <div class="h-metrics">${metrics.map((m) => `<div class="m ${m.warn ? 'warn' : ''}"><div class="v">${m.v}</div><div class="l">${esc(m.l)}</div></div>`).join('')}</div>
      <div class="tdy-foot"><span>${App.icon('refresh', 11)}数据更新 ${DATA_UPDATED} · 演示数据</span><span>${esc(TODAY())}</span></div>
    </div>`;
  }
  function quickGrid() {
    const q = (label, icon, tone, onclick) => `<div class="quick" onclick="${onclick}"><div class="qi ${tone}">${App.icon(icon, 20)}</div>${esc(label)}</div>`;
    return `<div class="quick-grid tdy-quick">${q('记录拜访', 'camera', 'brand', 'S_TODAY.pickStore()')}${q('选街道', 'road', 'info', "App.tab('customers')")}${q('工作助手', 'sparkle', 'ai', "App.tab('assistant')")}${q('我的任务', 'list', 'warn', "App.go('tasks')")}</div>`;
  }

  function riskCell(r) {
    const s = r.store || {};
    const go = s.id ? `App.go('customer',{id:'${s.id}'})` : '';
    if (r.kind === 'open') {
      const c = s.complaint || {};
      return App.ui.cell({
        title: esc(s.name), badge: App.ui.chip('未结客诉', 'danger', { sm: true, icon: 'alert' }),
        sub: `<span class="tdy-em">先了解/协调服务问题</span> · ${esc(c.summary || '')}<div class="tiny muted mt4">${esc(c.source || '')} · 未结客诉期间不建立额外收费商机</div>`,
        icon: 'alert', iconTone: 'danger', onclick: go,
      });
    }
    if (r.kind === 'stale') {
      const c = s.complaint || {};
      return App.ui.cell({
        title: esc(s.name), badge: App.ui.chip('数据待更新', 'warn', { sm: true, icon: 'clock' }),
        sub: `客诉数据最近同步 ${esc(App.fmt.md(c.date))}，回访前先核实${s.lastVisit && s.lastVisit.result ? ` · ${esc(s.lastVisit.result)}` : ''}`,
        icon: 'clock', iconTone: 'warn', onclick: go,
      });
    }
    return App.ui.cell({ title: esc(r.n.title), sub: esc(r.n.body), icon: 'alert', iconTone: 'danger', right: `<span class="tiny">${esc(r.n.time || '')}</span>`, onclick: go || "App.go('notifications')" });
  }

  function apptCell(t) {
    const st = App.store(t.storeId) || {};
    const done = t.status === 'done';
    const who = st.appointment && st.appointment.with ? ` · ${esc(st.appointment.with)}` : '';
    const sub = done
      ? `${esc(t.title)} · ${esc(App.fmt.hm(t.doneAt) || '')} 已确认拜访记录${st.lastVisit && st.lastVisit.result ? `<div class="tiny muted mt4">${esc(st.lastVisit.result)}</div>` : ''}`
      : `${esc(t.title)}${who}${st.address ? `<div class="tiny muted mt4">${App.icon('map-pin', 11)} ${esc(st.address)}${t.reason ? ` · ${esc(t.reason)}` : ''}</div>` : ''}`;
    const badge = done ? App.ui.chip('已完成', 'ok', { sm: true, icon: 'check' }) : App.ui.chip(t.source || t.type, 'outline', { sm: true });
    return `<div class="cell pressable" onclick="App.go('task',{id:'${t.id}'})">
      <div class="tdy-time ${done ? 'done' : ''}">${done ? App.icon('check', 20) : esc(t.time || '全天')}</div>
      <div class="cell-body"><div class="cell-title row"><span class="ellipsis">${esc(st.name || t.title)}</span>${badge}</div><div class="cell-sub">${sub}</div></div>
      <div class="cell-right">${App.icon('chevron-right', 16)}</div></div>`;
  }
  function oppShortcut() {
    const o = App.opp('o_bing'); if (!o) return '';
    const confirmed = !!(App.state.demo && App.state.demo.oppConfirmed);
    const ai = o.ai || {};
    const sub = confirmed
      ? `已确认：${esc(o.stage)} · 分层 ${esc(App.tierLabel(o.tier))} · 下一步任务已生成（客户约定 9/15）`
      : `AI 建议 ${esc(App.tierLabel(o.tier))}→${esc(App.tierLabel(ai.tier || 50))} · ${esc(ai.stage || '需求确认')} · 置信度${esc(ai.confidence || '中')} · 待你确认，不改正式值`;
    return App.ui.cell({
      title: '商机推进卡 · 蜀香居川菜馆', sub, icon: 'sparkle', iconTone: confirmed ? '' : 'ai',
      badge: confirmed ? App.ui.chip('已确认', 'ok', { sm: true, icon: 'check' }) : App.ui.chip('AI 建议', 'ai', { sm: true, icon: 'sparkle' }),
      onclick: "App.go('opportunity',{id:'o_bing'})",
    });
  }
  function overdueCell(t) {
    const st = App.store(t.storeId) || {};
    const n = -App.fmt.days(t.due);
    const isComplaint = t.type === '客诉跟进';
    return App.ui.cell({
      title: esc(t.title), sub: `${esc(st.name || '')} · ${esc(t.source || '')}${t.reason ? ` · ${esc(t.reason)}` : ''}`,
      icon: isComplaint ? 'alert' : (TYPE_ICON[t.type] || 'history'), iconTone: isComplaint ? 'danger' : 'warn',
      right: App.ui.chip(`逾期${n}天`, 'danger', { sm: true }), onclick: `App.go('task',{id:'${t.id}'})`,
    });
  }
  function pendingCell(v) {
    const st = App.store(v.storeId) || {};
    const miss = v.aiMissing || [];
    const missTxt = miss.length ? `缺少：${esc(miss[0])}${miss.length > 1 ? ` 等 ${miss.length} 项` : ''}` : '请核对 AI 草稿';
    return App.ui.cell({
      title: esc(st.name || '拜访记录'), badge: App.ui.chip('待确认', 'warn', { sm: true }),
      sub: `${esc(v.type)} · ${esc(App.fmt.md(v.time))} ${esc(App.fmt.hm(v.time))} · ${App.ui.factTag('derived')} ${missTxt}`,
      icon: 'edit', iconTone: 'warn', onclick: `App.go('visit-confirm',{id:'${v.id}'})`,
    });
  }
  function todoCell(t) {
    const st = App.store(t.storeId) || {};
    const n = App.fmt.days(t.due);
    const isAI = t.source === 'AI建议';
    return App.ui.cell({
      title: esc(t.title), sub: `${esc(st.name || '')} · ${esc(t.source || '')}${t.time ? ` · ${esc(t.time)}` : ''}`,
      badge: isAI ? App.ui.chip('AI 建议 · 待确认', 'ai', { sm: true, icon: 'sparkle' }) : '',
      icon: TYPE_ICON[t.type] || 'list', iconTone: isAI ? 'ai' : (n === 0 ? 'warn' : 'info'),
      right: App.ui.chip(App.fmt.dueLabel(t.due), n === 0 ? 'warn' : (n === 1 ? 'info' : 'gray'), { sm: true }),
      onclick: `App.go('task',{id:'${t.id}'})`,
    });
  }

  /* ---------- 今日工作台（我的） ---------- */
  function myBody() {
    const d = T.data();
    const rule = (App.state.settings && App.state.settings.revisitRule) || {};
    const visitConfirmed = !!(App.state.demo && App.state.demo.visitConfirmed);
    const noTasks = !d.appts.length && !d.overdue.length && !d.todos.length;
    let h = hero(d) + quickGrid();

    // 1. 服务风险提醒（未结客诉优先）
    h += App.ui.section('服务风险提醒', link('通知', "App.go('notifications')"));
    h += d.risks.length
      ? `<div class="list">${d.risks.slice(0, 3).map(riskCell).join('')}</div>`
      : compactEmpty('check-circle', '暂无服务风险提醒', '客诉数据来自服务系统 · 9/7 08:30 同步');

    if (noTasks) {
      h += App.ui.section('今日任务');
      h += `<div class="card">${App.ui.empty({
        icon: 'calendar', title: '今天没有安排的任务', sub: '从街道挑选客户开始拜访，或进入客户列表',
        action: `<div class="btn-row">${App.ui.btn('选街道', { tone: 'primary', size: 'sm', icon: 'road', onclick: "App.tab('customers');App.go('street-picker')" })}${App.ui.btn('客户列表', { tone: 'outline', size: 'sm', icon: 'store', onclick: "App.tab('customers')" })}</div>`,
      })}</div>`;
    } else {
      // 2. 今日约访
      h += App.ui.section('今日约访', `<span class="muted">${esc(App.fmt.mdw(TODAY()))}</span>`);
      h += (d.appts.length || visitConfirmed)
        ? `<div class="list">${d.appts.map(apptCell).join('')}${visitConfirmed ? oppShortcut() : ''}</div>`
        : compactEmpty('calendar', '今日无约访', '可从客户详情发起约访，或直接记录拜访');
      // 3. 超期回访
      h += App.ui.section('超期回访', link('全部超期', "App.go('tasks',{filter:'overdue'})"));
      h += d.overdue.length
        ? `<div class="list">${d.overdue.map(overdueCell).join('')}</div><div class="tdy-caption">${App.icon('info', 12)}回访日期优先级：客户约定 › 已接受任务 › 规则周期（${esc(rule.label || '演示规则')}）；改期需填写原因。</div>`
        : compactEmpty('check-circle', '没有超期回访', '规则型回访按演示规则生成，客户约定日期优先');
    }
    // 4. 待确认记录
    h += App.ui.section('待确认记录', d.pending.length ? link('草稿箱', "App.tab('me')") : '');
    h += d.pending.length
      ? `<div class="list">${d.pending.map(pendingCell).join('')}</div>`
      : compactEmpty('edit', '没有待确认记录', '拜访采集后的 AI 草稿会先在这里等待你确认');
    // 5. 今日待办
    if (!noTasks) {
      h += App.ui.section('今日待办', link('我的任务', "App.go('tasks')"));
      h += d.todos.length
        ? `<div class="list">${d.todos.map(todoCell).join('')}</div>`
        : compactEmpty('list', '近两天没有其他待办', '');
    }
    h += `<div class="tdy-caption center">${App.icon('shield', 12)}AI 建议为派生数据，仅在 AI 标识内出现；正式阶段/分层需人工确认后才改变</div>`;
    return h;
  }

  /* ---------- 团队工作台（主管） ---------- */
  const seg = (mode) => `<div class="seg block tdy-seg"><button class="${mode === 'my' ? 'active' : ''}" onclick="S_TODAY.mode('my')">我的</button><button class="${mode === 'team' ? 'active' : ''}" onclick="S_TODAY.mode('team')">团队</button></div>`;
  function teamBody(params, ctx) {
    if (window.S_TEAM && typeof window.S_TEAM.render === 'function') {
      try { return window.S_TEAM.render(params, ctx) || ''; } catch (e) { console.error(e); return App.ui.notice('danger', `团队工作台渲染失败：${esc(e.message)}`); }
    }
    return `<div class="card">${App.ui.empty({ icon: 'users', title: '团队工作台尚未纳入演示', sub: '重点卡点 · 未跟进客户 · 任务完成 · 待复核 · 基础趋势（由 team.js 提供）' })}</div>`
      + App.ui.notice('info', '主管在"今日"切换"我的 / 团队"；团队数据按权限过滤，不显示未经授权的跨区数据。', 'shield');
  }
  T.mode = function (m) {
    uiState().todayMode = m === 'team' ? 'team' : 'my';
    App.save(); App.refresh(); App.scrollTop();
  };

  /* ---------- 交互 ---------- */
  T.pickStore = function () {
    const today = TODAY();
    const isAppt = (s) => !!(s.appointment && s.appointment.date === today);
    const stores = T.myStores().slice().sort((a, b) => (isAppt(a) ? 0 : 1) - (isAppt(b) ? 0 : 1));
    const items = stores.slice(0, 8).map((s) => ({
      label: s.name, icon: 'store',
      sub: [s.street || '待补地址', COOP[s.coop] || '未合作', s.lastVisit ? `最近拜访 ${App.fmt.rel(s.lastVisit.date)}` : '未拜访'].join(' · '),
      right: isAppt(s) ? `今日 ${s.appointment.time} 约访` : '',
      onSelect: () => App.go('visit-capture', { storeId: s.id }),
    }));
    items.push({ label: '更多客户…', icon: 'search', sub: '到客户列表按街道查找', onSelect: () => App.tab('customers') });
    App.sheet({ title: '选择门店记录拜访', items });
  };
  T.addOverdueDemo = function () {
    const me = App.me(); const s = App.state; const rule = (s.settings && s.settings.revisitRule) || {};
    const cands = s.opportunities.filter((o) => o.ownerId === me.id && [20, 50, 80].includes(o.tier) && !['已赢单', '已丢单', '暂停培育'].includes(o.stage));
    for (const o of cands) {
      // F05：已有未结任务不复制新任务；同一商机同一周期规则型任务去重
      if (s.tasks.find((t) => t.oppId === o.id && isActive(t))) continue;
      const cycle = rule[o.tier] || 7;
      let due = addDays(o.updatedAt || TODAY(), cycle); if (due >= TODAY()) due = addDays(TODAY(), -1);
      const st = App.store(o.storeId) || {};
      s.tasks.unshift({
        id: App.uid('t_rule'), storeId: o.storeId, oppId: o.id, title: `回访：${st.name || ''}（${o.service} · ${o.kind}）`, type: '回访',
        ownerId: me.id, ownerName: me.name, due, status: 'todo', source: '规则型',
        reason: `${App.tierLabel(o.tier)} 分层 · ${cycle} 天周期（演示规则）`, evidence: [`商机分层 ${App.tierLabel(o.tier)} · ${o.tierSource || ''}`],
        expected: '完成有效跟进后关闭提醒并开启下一周期', overdue: true, demo: true,
      });
      App.save(); App.refresh();
      App.toast(`已生成规则型超期回访：${st.name || ''}`, { icon: 'clock' });
      return;
    }
    App.toast('本周期内相关商机已有未结任务，按去重规则不重复生成', { icon: 'info', duration: 2600 });
  };

  App.register('today', {
    tab: 'today',
    nav() { return { title: App.isMgr() && uiState().todayMode === 'team' ? '团队工作台' : '今日工作台' }; },
    prd: ['7 页面表·今日工作台', '7 页面表·团队工作台（主管切换）', 'F05 回访任务与提醒', 'F08 团队管理与问数'],
    rules: ['未结客诉优先：先了解/协调服务问题', '客户约定日期 › 任务日期 › 规则周期（演示规则）', '已有未结任务不复制；同商机同周期去重', '无任务显示选街道与客户入口', 'AI 派生仅在 AI 标识内出现'],
    demoActions: [
      { label: '新增一条超期回访（演示）', icon: 'clock', run() { T.addOverdueDemo(); } },
      { label: '模拟蜀香居拜访已确认（演示）', icon: 'check-circle', run() {
        if (App.state.role !== 'dj') { App.toast('请先切换为地推销售（刘晓芸）', { icon: 'user' }); return; }
        window.DATA.ensureDemoVisit(App.state, true); App.save(); App.refresh();
        App.toast('蜀香居拜访已确认 · 商机推进卡待确认', { icon: 'check-circle' });
      } },
    ],
    render(params, ctx) {
      const mgr = App.isMgr();
      const mode = mgr ? (uiState().todayMode === 'team' ? 'team' : 'my') : 'my';
      let h = mgr ? seg(mode) : '';
      h += mode === 'team' ? teamBody(params, ctx) : myBody();
      return h;
    },
    mount(rootEl, params, ctx) {
      if (App.isMgr() && uiState().todayMode === 'team' && window.S_TEAM && typeof window.S_TEAM.mount === 'function') {
        try { window.S_TEAM.mount(rootEl, params, ctx); } catch (e) { console.error(e); }
      }
    },
  });

  /* ---------- 通知 ---------- */
  const KIND = { risk: ['alert', 'danger'], confirm: ['edit', 'warn'], sync: ['cloud-off', 'gray'], task: ['clock', 'brand'], review: ['compare', 'ai'] };
  function notifCell(n) {
    const [icon, tone] = KIND[n.kind] || ['bell', 'info'];
    return App.ui.cell({
      title: esc(n.title), badge: n.read ? '' : App.ui.chip('未读', 'danger', { sm: true }),
      sub: `${esc(n.body || '')}<div class="tiny muted mt4">${esc(n.time || '')}</div>`,
      icon, iconTone: tone, onclick: `S_TODAY.openNotif('${n.id}')`,
    });
  }
  T.openNotif = function (id) {
    const n = (App.state.notifications || []).find((x) => x.id === id); if (!n) return;
    n.read = true; App.save();
    if (n.kind === 'risk' && n.storeId) return App.go('customer', { id: n.storeId });
    if (n.kind === 'confirm' && n.visitId) return App.go('visit-confirm', { id: n.visitId });
    if (n.kind === 'sync') return App.go('sync-center');
    if (n.kind === 'task' && n.taskId) return App.go('task', { id: n.taskId });
    if (n.kind === 'review' && n.oppId) return App.go('opportunity', { id: n.oppId });
    App.refresh();
  };
  T.readAll = function () { T.notifs().forEach((n) => { n.read = true; }); App.save(); App.refresh(); App.toast('已全部标为已读', { icon: 'check' }); };
  T.pushDemoNotif = function () {
    const me = App.me();
    (App.state.notifications = App.state.notifications || []).unshift({ id: App.uid('n'), kind: 'task', title: '回访提醒：金牌烤鸭店 明天到期', body: '客户承诺周二前回复方案反馈（客户约定日期优先于规则周期）', taskId: 't_jinpai', time: '刚刚', ownerId: me.id });
    App.save(); App.refresh(); App.toast('已推送一条任务提醒（演示）', { icon: 'bell' });
  };
  App.register('notifications', {
    title: '通知', tab: 'today',
    prd: ['F05 回访任务与提醒', '7 页面表·今日工作台'],
    rules: ['工作台始终显示任务，通知失败不丢任务', '未结客诉优先提示', '外部通知需渠道/授权/组织配置允许'],
    demoActions: [{ label: '模拟一条任务提醒（演示）', icon: 'bell', run() { T.pushDemoNotif(); } }],
    render() {
      const list = T.notifs();
      const unread = list.filter((n) => !n.read).length;
      let h = App.ui.notice('info', '工作台始终显示任务；外部通知仅在渠道能力、用户授权与组织配置允许时发送，送达失败不影响任务。', 'bell');
      h += App.ui.section('提醒', unread ? link('全部已读', 'S_TODAY.readAll()') : '', unread ? `${unread} 条未读` : `共 ${list.length} 条`);
      h += list.length ? `<div class="list">${list.map(notifCell).join('')}</div>` : compactEmpty('bell', '暂无通知', '任务到期、服务风险与待确认记录会在这里提醒');
      h += App.ui.section('设置');
      h += `<div class="list">${App.ui.cell({ title: '通知设置', sub: '任务提醒 · 服务风险 · 外部渠道', icon: 'settings', iconTone: 'gray', onclick: "App.go('settings-notify')" })}${App.ui.cell({ title: '同步与上传异常', sub: '失败任务可在此重试', icon: 'sync', iconTone: 'info', onclick: "App.go('sync-center')" })}</div>`;
      return h;
    },
  });
})();
