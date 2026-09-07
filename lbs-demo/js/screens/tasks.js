/* ============================================================
   任务列表 / 任务详情 —— tasks.js
   screens: tasks (filter?) · task (id)
   规则：客户约定 > 已接受任务 > 规则周期 · 同商机同周期去重 · 改期保留原因 · AI 自拟任务先待人确认
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_TASK = {};
  const ui = App.ui, esc = App.esc, icon = App.icon;

  App.css('tk', `
    .tk-seg { margin: 12px 0 8px; }
    .tk-seg button { padding: 0 6px; font-size: 13px; }
    .tk-seg button .n { font-size: 11px; opacity: .6; margin-left: 2px; font-weight: 600; }
    .tk-caption { font-size: 11.5px; color: var(--ink-3); padding: 0 4px; margin-bottom: 8px; line-height: 1.5; display: flex; gap: 5px; align-items: flex-start; }
    .tk-caption svg { flex: none; margin-top: 3px; }
    .tk-cell { display: flex; gap: 12px; padding: 12px 14px; background: var(--surface); align-items: flex-start; }
    .tk-cell + .tk-cell { border-top: .5px solid var(--line); }
    .tk-cell:active { background: var(--surface-2); }
    .tk-cell .tk-ico { width: 36px; height: 36px; border-radius: 10px; flex: none; display: flex; align-items: center; justify-content: center; background: var(--brand-soft); color: var(--brand); margin-top: 1px; }
    .tk-cell .tk-ico.danger { background: var(--danger-soft); color: var(--danger); }
    .tk-cell .tk-ico.warn { background: var(--warn-soft); color: var(--warn); }
    .tk-cell .tk-ico.ai { background: var(--ai-soft); color: var(--ai); }
    .tk-cell .tk-ico.gray { background: var(--gray-soft); color: var(--gray); }
    .tk-cell .tk-ico.violet { background: var(--violet-soft); color: var(--violet); }
    .tk-cell .tk-body { flex: 1; min-width: 0; }
    .tk-cell .tk-title { font-size: 15px; font-weight: 500; line-height: 1.35; }
    .tk-cell .tk-sub { font-size: 12.5px; color: var(--ink-3); margin-top: 3px; display: flex; gap: 6px; align-items: center; min-width: 0; }
    .tk-cell .tk-sub .st { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tk-cell .tk-sub .due { flex: none; font-weight: 600; }
    .tk-cell .tk-sub .due.over { color: var(--danger); }
    .tk-cell .tk-sub .due.today { color: var(--brand-3); }
    .tk-cell .tk-chips { display: flex; gap: 5px; margin-top: 7px; flex-wrap: wrap; }
    .tk-cell .tk-right { flex: none; color: var(--ink-4); padding-top: 9px; }
    .tk-title-lg { font-size: 18px; font-weight: 700; line-height: 1.35; letter-spacing: -.01em; }
    .tk-due { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .tk-due .d { background: var(--surface-2); border-radius: 12px; padding: 10px 12px; }
    .tk-due .d .l { font-size: 11.5px; color: var(--ink-3); margin-bottom: 3px; }
    .tk-due .d .v { font-size: 14px; font-weight: 600; }
    .tk-due .d .v.over { color: var(--danger); }
    .tk-due .d .v.today { color: var(--brand-3); }
    .tk-ev { display: flex; gap: 8px; align-items: flex-start; padding: 8px 0; border-top: .5px solid var(--line); font-size: 13.5px; line-height: 1.45; }
    .tk-ev:first-child { border-top: 0; padding-top: 2px; }
    .tk-ev svg { flex: none; color: var(--brand); margin-top: 2px; }
    .tk-hist { display: flex; flex-direction: column; }
    .tk-hist .h { display: flex; gap: 10px; padding: 9px 0; border-top: .5px solid var(--line); font-size: 13px; line-height: 1.45; }
    .tk-hist .h:first-child { border-top: 0; padding-top: 2px; }
    .tk-hist .h .t { flex: none; width: 92px; color: var(--ink-3); font-size: 12px; padding-top: 2px; }
    .tk-hist .h .b { flex: 1; min-width: 0; color: var(--ink-2); }
    .tk-hist .h .b b { color: var(--ink); }
    .tk-foot .btn.icon-only { flex: 0 0 auto; width: 44px; padding: 0; }
  `);

  /* ---------- 常量 / 工具 ---------- */
  const SRC_TONE = { 客户约定: 'brand', 规则型: 'info', AI建议: 'ai', 主管分配: 'violet', 服务风险: 'danger', 本人创建: 'gray' };
  const SRC_ICON = { 客户约定: 'handshake', 规则型: 'clock', AI建议: 'sparkle', 主管分配: 'users', 服务风险: 'alert', 本人创建: 'user' };
  const TYPE_ICON = { 约访: 'calendar', 回访: 'phone', 陌拜: 'map-pin', 客诉跟进: 'alert', 勘查: 'search', 商务: 'briefcase', 承诺核对: 'contract', 辅导: 'coach', 方案: 'doc' };
  const STATUS = { todo: ['待办', 'info'], doing: ['进行中', 'warn'], done: ['已完成', 'ok'], rescheduled: ['已改期', 'gray'], cancelled: ['已取消', 'gray'] };
  const FILTERS = ['今日', '超期', '全部', '已完成'];
  const pad = (n) => String(n).padStart(2, '0');
  const addDays = (s, n) => { const d = App.dayjs((s || App.TODAY).slice(0, 10)); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const stamp = () => { const u = App.state.ui = App.state.ui || {}; u.clock = (u.clock || 0) + 1; return `${App.TODAY} 15:${pad(Math.min(59, 6 + u.clock * 2))}`; };
  const hist = (t) => (t.history = t.history || []);

  S.srcChip = (src, sm) => ui.chip(src, SRC_TONE[src] || 'gray', { sm, icon: SRC_ICON[src] });
  S.statusChip = (st, sm) => ui.chip((STATUS[st] || [st, 'gray'])[0], (STATUS[st] || [st, 'gray'])[1], { sm });
  S.isOpen = (t) => t.status === 'todo' || t.status === 'doing';
  S.isOverdue = (t) => S.isOpen(t) && t.due < App.TODAY;
  S.aiPending = (t) => t.source === 'AI建议' && !t.aiConfirmed;
  S.mine = () => { const me = App.me(); return App.state.tasks.filter((t) => App.isMgr() || t.ownerId === me.id); };
  S.filtered = function (f) {
    const all = S.mine(); let r;
    if (f === '超期') r = all.filter(S.isOverdue);
    else if (f === '已完成') r = all.filter((t) => t.status === 'done');
    else if (f === '全部') r = all.slice();
    else r = all.filter((t) => S.isOpen(t) && t.due <= App.TODAY);
    const rank = (t) => (S.isOpen(t) ? 0 : t.status === 'done' ? 1 : 2);
    return r.sort((a, b) => rank(a) - rank(b) || (a.status === 'done' ? (b.doneAt || '').localeCompare(a.doneAt || '') : (a.due || '').localeCompare(b.due || '') || (a.time || '').localeCompare(b.time || '')));
  };
  S.dueText = (t) => {
    if (t.status === 'done') return `完成 ${App.fmt.md(t.doneAt)}`;
    if (t.status === 'cancelled') return '已取消';
    return App.fmt.dueLabel(t.due) + (t.time ? ' ' + t.time : '');
  };

  /* ---------- 列表单元 ---------- */
  S.cellHtml = function (t) {
    const store = App.store(t.storeId); const over = S.isOverdue(t); const isToday = S.isOpen(t) && t.due === App.TODAY;
    const tone = over ? 'danger' : S.aiPending(t) ? 'ai' : t.status !== 'todo' && t.status !== 'doing' ? 'gray' : t.source === '服务风险' ? 'warn' : t.source === '主管分配' ? 'violet' : '';
    return `<div class="tk-cell pressable" onclick="App.go('task',{id:'${t.id}'})">
      <div class="tk-ico ${tone}">${icon(TYPE_ICON[t.type] || 'list', 20)}</div>
      <div class="tk-body">
        <div class="tk-title">${esc(t.title)}</div>
        <div class="tk-sub"><span class="st">${esc(store ? store.name : '—')}${App.isMgr() ? ' · ' + esc(t.ownerName) : ''}</span><span class="due ${over ? 'over' : isToday ? 'today' : ''}">${esc(S.dueText(t))}</span></div>
        <div class="tk-chips">${S.srcChip(t.source, true)}${S.statusChip(t.status, true)}${over ? ui.chip('逾期', 'danger', { sm: true }) : ''}${S.aiPending(t) ? ui.chip('AI 拟定 · 待确认', 'ai', { sm: true }) : ''}${t.transfer ? ui.chip('转交待确认', 'warn', { sm: true }) : ''}</div>
      </div>
      <div class="tk-right">${icon('chevron-right', 16)}</div>
    </div>`;
  };

  /* ---------- 任务列表 ---------- */
  App.register('tasks', {
    title: '任务', tab: 'today',
    prd: ['F05 回访任务与提醒', '7 页面表·任务/审批详情', '6.4 回访规则'],
    rules: ['回访日期：客户约定 > 已接受任务 > 规则周期（演示规则）', '同一商机同一周期规则任务去重', 'AI 自拟任务先待人确认', '首次逾期提醒负责人，升级阈值未配置不启用', '已有未结任务不每日复制'],
    render(params) {
      const f = FILTERS.includes(params.filter) ? params.filter : '今日';
      const all = S.mine(); const me = App.me();
      const todayN = all.filter((t) => S.isOpen(t) && t.due === App.TODAY).length;
      const overdue = all.filter(S.isOverdue).length;
      const openN = all.filter(S.isOpen).length;
      const counts = { 今日: all.filter((t) => S.isOpen(t) && t.due <= App.TODAY).length, 超期: overdue, 全部: all.length, 已完成: all.filter((t) => t.status === 'done').length };
      const list = S.filtered(f);
      const emptyMap = { 今日: ['今日无到期任务', '去客户列表选街道，安排拜访'], 超期: ['没有超期任务', '按时完成或改期都会保留记录'], 全部: ['暂无任务', '拜访确认后会生成客户约定/规则型任务'], 已完成: ['暂无已完成任务', '完成需关联拜访记录或填写说明'] };
      return `${ui.kpis([
        { label: '今日到期', value: todayN, tone: 'brand', onclick: "S_TASK.setFilter('今日')" },
        { label: '超期', value: overdue, tone: overdue ? 'danger' : '', onclick: "S_TASK.setFilter('超期')" },
        { label: '待办合计', value: openN, onclick: "S_TASK.setFilter('全部')" },
      ])}
      <div class="seg block tk-seg">${FILTERS.map((x) => `<button class="${x === f ? 'active' : ''}" onclick="S_TASK.setFilter('${x}')">${x}<span class="n">${counts[x]}</span></button>`).join('')}</div>
      <div class="tk-caption">${icon('info', 13)}<span>${App.isMgr() ? '主管视角：显示团队全部任务' : esc(me.name) + ' 的任务'} · 截止日按 客户约定 &gt; 已接受任务 &gt; 规则周期（演示规则 20%=7天 · 50%=3天 · 80%=1天）</span></div>
      ${list.length ? `<div class="list">${list.map(S.cellHtml).join('')}</div>` : ui.empty({ icon: 'inbox', title: emptyMap[f][0], sub: emptyMap[f][1], action: ui.btn('去客户列表', { tone: 'secondary', size: 'sm', onclick: "App.tab('customers')" }) })}`;
    },
  });
  S.setFilter = function (f) { const e = App.currentEntry(); if (!e) return; e.params.filter = f; App.refresh(); App._syncHash(); };

  /* ---------- 任务详情 ---------- */
  App.register('task', {
    title: '任务详情', tab: 'today',
    prd: ['F05 回访任务与提醒', '7 页面表·任务/审批详情', 'F04 建议任务含客户/商机/动作/责任人/日期/原因/预期产物'],
    rules: ['完成需要证据（拜访记录或说明）', '改期保留原因，不伪装成完成', '转交需接收人确认或主管指定', 'AI 拟定任务先待人确认', '同一商机同一周期去重'],
    render(params) {
      const t = App.task(params.id);
      if (!t) return ui.empty({ icon: 'list', title: '任务不存在或尚未生成', sub: '演示任务在商机推进卡"一次确认"后生成', action: ui.btn('返回', { tone: 'ghost', size: 'sm', onclick: 'App.back()' }) });
      const store = App.store(t.storeId); const opp = t.oppId ? App.opp(t.oppId) : null;
      const over = S.isOverdue(t); const isToday = S.isOpen(t) && t.due === App.TODAY; const aiPending = S.aiPending(t);
      const n = App.fmt.days(t.due);
      const head = `<div class="card">
        <div class="chips mb8">${S.srcChip(t.source)}${S.statusChip(t.status)}${over ? ui.chip(`逾期 ${-n} 天`, 'danger', { icon: 'alert' }) : ''}${aiPending ? ui.chip('AI 拟定 · 待确认', 'ai', { icon: 'sparkle' }) : ''}</div>
        <div class="tk-title-lg">${esc(t.title)}</div>
        <div class="muted small mt4">${esc(t.type)} · 责任人 ${esc(t.ownerName)}${t.transfer ? ` · 转交申请中（${esc(t.transfer.to)}）` : ''}</div>
        <div class="tk-due mt12">
          <div class="d"><div class="l">截止日</div><div class="v ${over ? 'over' : isToday ? 'today' : ''}">${esc(App.fmt.mdw(t.due))}${t.time ? ' ' + esc(t.time) : ''}</div></div>
          <div class="d"><div class="l">${t.status === 'done' ? '完成时间' : '提醒'}</div><div class="v ${over ? 'over' : isToday ? 'today' : ''}">${esc(t.status === 'done' ? (t.doneAt || '—') : t.status === 'cancelled' ? '已取消' : App.fmt.dueLabel(t.due))}</div></div>
        </div>
      </div>`;
      const notices = [
        aiPending ? ui.notice('ai', '<b>AI 拟定任务先待人确认</b>：确认后才进入待办提醒周期；可改期后再确认') : '',
        t.transfer ? ui.notice('info', `转交申请已提交给 <b>${esc(t.transfer.to)}</b>（${esc(t.transfer.at)}）· 待接收人确认或主管指定；生效前仍由 ${esc(t.ownerName)} 负责，历史与未结任务不丢失`) : '',
        over && S.isOpen(t) ? ui.notice('danger', `首次逾期已提醒负责人 ${esc(t.ownerName)}；主管升级阈值未配置，不自动升级`) : '',
      ].join('');
      const links = `<div class="list">
        ${store ? ui.cell({ title: esc(store.name), sub: `${esc(store.type)} · ${esc(store.street || store.district || '')}`, icon: 'store', right: ui.coopChip(store.coop), onclick: `App.go('customer',{id:'${store.id}'})` }) : ''}
        ${opp ? ui.cell({ title: `${esc(opp.kind)} · ${esc(opp.service)}`, sub: `商机推进卡 · 阶段 ${esc(opp.stage)} · 分层 ${esc(App.tierLabel(opp.tier))}`, icon: 'trend', iconTone: 'info', onclick: `App.go('opportunity',{id:'${opp.id}'})` }) : ''}
      </div>`;
      const source = `<div class="card"><div class="card-title">来源与原因</div>${ui.kv([
        ['来源', S.srcChip(t.source)],
        ['原因', t.reason ? esc(t.reason) : '<span class="muted">—</span>'],
        ['责任人', esc(t.ownerName)],
        ['截止日', `${esc(App.fmt.mdw(t.due))}${t.time ? ' ' + esc(t.time) : ''} · ${esc(App.fmt.dueLabel(t.due))}`],
        ['预期产物', t.expected ? esc(t.expected) : '<span class="muted">—</span>'],
      ])}</div>`;
      const dedup = t.dedup ? ui.notice('info', `<b>同一商机同一周期去重</b> · ${esc(t.dedup)}`) : '';
      const ev = (t.evidence || []);
      const evidence = `<div class="card"><div class="card-title">证据<span class="muted tiny" style="font-weight:400">${ev.length} 项</span></div>${ev.length ? ev.map((e) => `<div class="tk-ev">${icon('file', 16)}<div>${esc(e)}</div></div>`).join('') : '<div class="muted small">暂无证据 · 完成时需关联拜访记录或填写说明</div>'}</div>`;
      const doneCard = t.status === 'done' ? `<div class="card"><div class="card-title">${icon('check-circle', 16)}完成情况</div>${ui.kv([['完成时间', esc(t.doneAt || '—')], ['完成证据', esc(ev[ev.length - 1] || '—')], ['提醒周期', '本周期提醒已关闭，下一周期按规则/约定生成']])}</div>` : '';
      const cancelCard = t.status === 'cancelled' ? ui.notice('gray', `已取消 · 原因：${esc(t.cancelReason || '—')}`) : '';
      const h = t.history || [];
      const history = h.length ? `<div class="card"><div class="card-title">变更记录<span class="muted tiny" style="font-weight:400">改期保留原因，不伪装成完成</span></div><div class="tk-hist">${h.map((x) => `<div class="h"><div class="t">${esc(x.at)}</div><div class="b"><b>${esc(x.type)}</b>${x.from && x.to ? ` · ${esc(App.fmt.md(x.from))} → ${esc(App.fmt.md(x.to))}` : ''}${x.body ? `<div class="small">${esc(x.body)}</div>` : ''}</div></div>`).join('')}</div></div>` : '';
      return head + notices + links + source + dedup + evidence + doneCard + cancelCard + history;
    },
    footer(params) {
      const t = App.task(params.id); if (!t || !S.isOpen(t)) return '';
      const id = t.id;
      const more = `<button class="btn outline icon-only" aria-label="更多" onclick="S_TASK.more('${id}')">${icon('more', 20)}</button>`;
      if (S.aiPending(t)) {
        return `<div class="btn-row tk-foot">${more}${ui.btn('改期', { tone: 'outline', icon: 'calendar', onclick: `S_TASK.reschedule('${id}')` })}${ui.btn('确认任务', { tone: 'ai', icon: 'check', onclick: `S_TASK.confirmAi('${id}')` })}</div>`;
      }
      return `<div class="btn-row tk-foot">${more}${ui.btn('改期', { tone: 'outline', icon: 'calendar', onclick: `S_TASK.reschedule('${id}')` })}${ui.btn('完成', { icon: 'check', onclick: `S_TASK.complete('${id}')` })}</div>`;
    },
  });

  /* ---------- 操作：完成（需证据） ---------- */
  S.complete = function (id) {
    const t = App.task(id); if (!t) return;
    const v = App.visitsOf(t.storeId).filter((x) => x.status === 'synced')[0];
    App.sheet({
      title: '完成需要证据：真实客户互动结果或推进证据',
      items: [
        { label: '关联最近拜访记录', icon: 'file', sub: v ? `${v.time} · ${v.type} · ${v.result}` : '该门店暂无已确认拜访记录', onSelect: () => { if (!v) { App.toast('暂无可关联的拜访记录，请先记录拜访'); return; } S.finish(id, `拜访记录 ${App.fmt.md(v.time)} · ${v.type} · ${v.result}`); } },
        { label: '填写完成说明', icon: 'edit', sub: '电话 / 微信等互动结果', onSelect: () => App.prompt('完成说明', '例如：电话确认客户已收到方案，周四给反馈', (val) => { const s = (val || '').trim(); if (!s) { App.toast('需要填写完成说明'); return; } S.finish(id, '完成说明：' + s); }) },
        { label: '先去记录拜访', icon: 'camera', sub: '拍门头 / 口述 → 确认事实后再完成', onSelect: () => App.go('visit-capture', { storeId: t.storeId, oppId: t.oppId || undefined }) },
      ],
    });
  };
  S.finish = function (id, evidence) {
    const t = App.task(id); if (!t) return;
    const at = stamp();
    t.status = 'done'; t.doneAt = at; t.evidence = [...(t.evidence || []), evidence];
    hist(t).unshift({ type: '完成', at, body: evidence });
    App.save(); App.toast('已完成 · 已关闭本周期提醒并开启下一周期', { icon: 'check-circle', duration: 2200 }); App.refresh();
  };

  /* ---------- 改期（原因 → 新日期） ---------- */
  S.reschedule = function (id) {
    App.prompt('改期原因（保留记录，不视为完成）', '例如：客户临时有事，约到周四', (v) => {
      const reason = (v || '').trim(); if (!reason) { App.toast('改期需要填写原因'); return; }
      const t = App.task(id); if (!t) return;
      const base = t.due < App.TODAY ? App.TODAY : t.due;
      App.sheet({
        title: `选择新的截止日（原 ${App.fmt.md(t.due)}）`,
        items: [1, 3, 7].map((n) => { const d = addDays(base, n); return { label: `+${n} 天 · ${App.fmt.mdw(d)}`, icon: 'calendar', sub: n === 1 ? '明天优先处理' : n === 3 ? '50% 分层规则周期' : '20% 分层规则周期', onSelect: () => S.applyResched(id, d, reason) }; }),
      });
    });
  };
  S.applyResched = function (id, to, reason) {
    const t = App.task(id); if (!t) return;
    const at = stamp(); const from = t.due;
    hist(t).unshift({ type: '改期', at, from, to, body: '原因：' + reason });
    t.due = to; t.rescheduled = (t.rescheduled || 0) + 1; delete t.overdue;
    App.save(); App.toast('已改期 · 原因已保留，不计为完成', { icon: 'calendar', duration: 2000 }); App.refresh();
  };

  /* ---------- 更多：转交 / 取消 ---------- */
  S.more = function (id) {
    const t = App.task(id); if (!t) return;
    App.sheet({ items: [
      { label: '转交申请', icon: 'users', sub: '待接收人确认或主管指定后生效', onSelect: () => S.transfer(id) },
      { label: '查看商机推进卡', icon: 'trend', onSelect: () => (t.oppId ? App.go('opportunity', { id: t.oppId }) : App.toast('该任务未关联商机')) },
      { label: '取消任务', icon: 'x', danger: true, sub: '需填写原因', onSelect: () => S.cancel(id) },
    ] });
  };
  S.transfer = function (id) {
    App.sheet({ title: '转交给同事（保留历史责任人与未结任务）', items: [
      { label: '王磊', sub: '地推 · 华东一区', icon: 'user', onSelect: () => S.applyTransfer(id, '王磊') },
      { label: '赵敏', sub: '地推 · 华东一区', icon: 'user', onSelect: () => S.applyTransfer(id, '赵敏') },
    ] });
  };
  S.applyTransfer = function (id, to) {
    const t = App.task(id); if (!t) return;
    const at = stamp(); t.transfer = { to, at, status: '待确认' };
    hist(t).unshift({ type: '转交申请', at, body: `申请转交给 ${to}，待接收人确认或主管指定` });
    App.save(); App.toast('已提交转交申请，待接收人确认或主管指定', { icon: 'users', duration: 2200 }); App.refresh();
  };
  S.cancel = function (id) {
    App.prompt('取消原因', '例如：客户已明确不再联系（尊重不再联系要求）', (v) => {
      const reason = (v || '').trim(); if (!reason) { App.toast('取消需要填写原因'); return; }
      const t = App.task(id); if (!t) return;
      const at = stamp(); t.status = 'cancelled'; t.cancelReason = reason; t.cancelledAt = at;
      hist(t).unshift({ type: '取消', at, body: '原因：' + reason });
      App.save(); App.toast('任务已取消 · 原因已记录'); App.refresh();
    });
  };
  S.confirmAi = function (id) {
    const t = App.task(id); if (!t) return;
    const at = stamp(); t.aiConfirmed = true; t.confirmedAt = at;
    hist(t).unshift({ type: '确认', at, body: `AI 拟定任务经 ${App.me().name} 确认，进入待办` });
    App.save(); App.toast('已确认 AI 拟定任务 · 进入待办', { icon: 'check-circle' }); App.refresh();
  };
})();
