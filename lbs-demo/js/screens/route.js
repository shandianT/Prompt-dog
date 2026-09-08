/* ============================================================
   销售智助 · 路线 Tab：今日路线（route）/ 扫街辅助（street）/ 回访提醒与待办（reminders）
   全部数据来自 App.state（data.js），状态随归档实时更新；无后端。
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_ROUTE = {};
  const ui = () => App.ui;
  const esc = (s) => App.esc(s);
  const TODAY = () => App.TODAY;

  /* ---------- 页面专属样式 ---------- */
  App.css('route', `
    .rt-head { padding: 6px 2px 10px; }
    .rt-head .rt-h1 { font-size: 22px; font-weight: 800; letter-spacing: -.02em; line-height: 1.2; }
    .rt-head .rt-h2 { font-size: 12.5px; color: var(--ink-3); margin-top: 4px; }
    .rt-head .rt-h2.tight { font-size: 12px; letter-spacing: -.01em; }
    .rt-kpis .kpi.done .v { color: var(--brand); } .rt-kpis .kpi.running .v { color: var(--brand); } .rt-kpis .kpi.pending .v { color: var(--warn); } .rt-kpis .kpi.todo .v { color: var(--ink-2); }
    .rt-kpis .kpi.active { box-shadow: inset 0 0 0 1.5px var(--brand); }
    .rt-amber { background: #fdf6e7; border-left: 4px solid var(--warn); border-radius: 14px; padding: 12px 12px 12px 14px; margin: 12px 0; }
    .rt-amber .rt-at { font-weight: 700; color: #8a5a0c; font-size: 14px; }
    .rt-amber .rt-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
    .rt-amber .rt-av { width: 32px; height: 32px; border-radius: 10px; background: #f6e3b8; color: #8a5a0c; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; flex: none; }
    .rt-amber .rt-nm { font-weight: 700; font-size: 15px; color: var(--ink); }
    .rt-amber .rt-sub { font-size: 11px; color: var(--ink-3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rt-amber .pill { background: var(--warn); color: #fff; border-radius: 999px; padding: 7px 9px; font-size: 11px; font-weight: 700; white-space: nowrap; flex: none; }
    .rt-amber .pill:active { opacity: .85; }
    .rt-group { display: flex; align-items: baseline; justify-content: space-between; margin: 14px 2px 8px; }
    .rt-group b { font-size: 14px; font-weight: 700; color: var(--ink-2); }
    .rt-group span { font-size: 12.5px; color: var(--ink-3); }
    .rt-item { display: flex; gap: 10px; padding: 12px 10px 12px 12px; background: var(--surface); align-items: flex-start; }
    .rt-item + .rt-item { border-top: .5px solid var(--line); }
    .rt-item:active { background: var(--surface-2); }
    .rt-idx { width: 36px; flex: none; text-align: left; padding-top: 2px; }
    .rt-idx b { display: block; font-size: 13px; color: var(--ink-3); font-weight: 600; font-variant-numeric: tabular-nums; }
    .rt-idx span { display: block; font-size: 11px; color: var(--ink-4); margin-top: 4px; font-variant-numeric: tabular-nums; }
    .rt-body { flex: 1; min-width: 0; }
    .rt-name { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px; min-width: 0; }
    .rt-name .nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    .rt-item.done .rt-name .nm { color: var(--ink-3); font-weight: 600; }
    .rt-line { font-size: 12.5px; color: var(--ink-3); margin-top: 4px; display: flex; align-items: center; gap: 6px; min-width: 0; }
    .rt-line .tx { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    .rt-line.wrap { flex-wrap: wrap; row-gap: 3px; } .rt-line.wrap .tx { white-space: normal; overflow: visible; }
    .rt-filters .fchip { font-size: 12.5px; padding: 0 10px; height: 29px; } .rt-filters { gap: 6px; }
    .rt-line .chip { flex: none; }
    .rt-right { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .rt-mv { display: flex; flex-direction: row; gap: 4px; }
    .rt-mv button { width: 26px; height: 22px; border-radius: 6px; background: var(--surface-3); color: var(--ink-3); font-size: 10.5px; display: flex; align-items: center; justify-content: center; }
    .rt-mv button:active { background: var(--brand-soft); color: var(--brand); }
    .rt-mv button[disabled] { opacity: .3; }
    .rt-act { margin-top: 8px; }
    .rt-appt { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 11.5px; font-weight: 600; color: #b45309; background: var(--warn-soft); padding: 3px 8px; border-radius: 999px; }
    /* 扫街辅助 */
    .st-enter { border-radius: 20px; padding: 16px; color: #fff; margin-bottom: 12px; background: linear-gradient(135deg, #16355f 0%, #0f2444 60%, #0b1a33 100%); box-shadow: 0 10px 24px rgba(15, 36, 68, .28); position: relative; overflow: hidden; }
    .st-enter::after { content: ""; position: absolute; right: -50px; top: -70px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,.07); }
    .st-enter .eb { font-size: 11px; letter-spacing: .08em; font-weight: 600; color: #9fc0ff; display: flex; align-items: center; gap: 4px; }
    .st-enter .t { font-size: 22px; font-weight: 800; margin-top: 6px; letter-spacing: -.01em; }
    .st-enter .s { font-size: 12.5px; opacity: .82; margin-top: 4px; }
    .st-enter .tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
    .st-enter .tiles .m { background: rgba(255,255,255,.12); border-radius: 12px; padding: 10px 8px; }
    .st-enter .tiles .m .v { font-size: 22px; font-weight: 700; line-height: 1; }
    .st-enter .tiles .m .l { font-size: 11px; opacity: .8; margin-top: 4px; }
    .st-enter .acts { display: flex; gap: 8px; margin-top: 14px; position: relative; }
    .st-enter .acts .btn { flex: 1; }
    .st-enter .acts .btn.ghost { background: rgba(255,255,255,.14); color: #fff; }
    .st-chips { display: flex; gap: 8px; overflow-x: auto; margin: 0 -14px 4px; padding: 2px 14px 8px; }
    .st-chips .fchip { flex: none; height: 30px; padding: 0 12px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line-2); font-size: 13px; font-weight: 500; color: var(--ink-2); display: inline-flex; align-items: center; gap: 4px; }
    .st-chips .fchip.em { background: var(--ai-soft); border-color: var(--ai-soft-2); color: var(--ai); font-weight: 600; }
    .st-chips .fchip.ok { background: var(--ok-soft); border-color: #cfe9d9; color: #15803d; font-weight: 600; }
    .st-chips .fchip.warn { background: var(--warn-soft); border-color: #f1dfb4; color: #b45309; font-weight: 600; }
    .st-item { display: flex; gap: 12px; padding: 14px 12px; background: var(--surface); align-items: flex-start; }
    .st-item + .st-item { border-top: .5px solid var(--line); }
    .st-item .avatar { width: 44px; height: 44px; border-radius: 12px; font-size: 16px; }
    .st-item .avatar.new { background: var(--ai-soft); color: var(--ai); }
    .st-item .avatar.coop { background: var(--brand-soft); color: var(--brand-3); }
    .st-item .avatar.due { background: var(--warn-soft); color: #b45309; }
    .st-item .avatar.other { background: var(--gray-soft); color: var(--ink-2); }
    .st-body { flex: 1; min-width: 0; }
    .st-top { display: flex; align-items: center; gap: 8px; }
    .st-top .nm { font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 0 1 auto; }
    .st-top .btn { margin-left: auto; flex: none; }
    .st-line { font-size: 12.5px; color: var(--ink-3); margin-top: 5px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .st-line .tx { min-width: 0; }
    .st-note { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 11.5px; font-weight: 600; color: #b45309; background: var(--warn-soft); padding: 3px 8px; border-radius: 999px; }
    .st-dept { display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; border-radius: 12px; background: var(--surface-3); color: var(--ink-2); font-size: 12px; line-height: 1.5; margin: 4px 0 12px; }
    .st-dept svg { flex: none; margin-top: 2px; color: var(--ink-3); }
    /* 回访提醒 */
    .rm-kpis .kpi.overdue .v { color: var(--danger); } .rm-kpis .kpi.today .v { color: var(--brand); } .rm-kpis .kpi.week .v { color: var(--brand); }
    .rm-item { padding: 14px 14px 12px; background: var(--surface); }
    .rm-item + .rm-item { border-top: .5px solid var(--line); }
    .rm-top { display: flex; align-items: center; gap: 8px; }
    .rm-top .nm { font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1; }
    .rm-src { font-size: 12.5px; color: var(--ink-3); margin-top: 5px; line-height: 1.5; }
    .rm-src .due { white-space: nowrap; }
    .rm-src .due-over { color: var(--danger); font-weight: 600; }
    .rm-src .due-today { color: var(--brand); font-weight: 600; }
    .rm-src .defer { color: #b45309; }
    .rm-merge { display: flex; align-items: flex-start; gap: 6px; margin-top: 6px; font-size: 12px; color: var(--ink-2); background: var(--surface-3); border-radius: 10px; padding: 7px 10px; line-height: 1.45; }
    .rm-merge svg { flex: none; margin-top: 2px; color: var(--ink-3); }
    .rm-acts { display: flex; gap: 8px; margin-top: 10px; }
    .rm-item.done .nm { color: var(--ink-3); text-decoration: line-through; }
  `);

  /* ---------- 通用 ---------- */
  const meId = () => App.me().id;
  const visibleStore = (s) => App.isMgr() ? true : (App.state.role === 'dj' ? (s.ownerId === meId() || s.ownerId === 'u_other') : s.ownerId === meId());
  const routeStores = () => App.state.stores.filter((s) => s.route && s.route.order).sort((a, b) => a.route.order - b.route.order);
  const contactLine = (s) => [s.contact && s.contact.name ? `${s.contact.name} · ${s.contact.role || ''}`.replace(/ · $/, '') : '暂无联系人', s.category].filter(Boolean).join(' · ');
  const lastLine = (s) => `${s.lastVisit ? '上次 ' + App.fmt.rel(s.lastVisit) : '未拜访过'} · 下一步：${s.lastNext || '—'}`;
  const dueRel = (d) => { const n = App.fmt.days(d); if (n === 0) return '今天'; if (n < 0) return `${-n} 天前`; return `${n} 天后`; };
  const addDays = (d, n) => { const t = App.dayjs(d); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); };
  const stop = 'event.stopPropagation();';

  /* ============================================================
     route · 今日路线（Tab 根）
     ============================================================ */
  const FILTERS = [['all', '全部'], ['todo', '未去'], ['running', '进行中'], ['done', '已留痕'], ['pending', '未留痕']];
  S.setFilter = (f) => { App.state.ui.routeFilter = f; App.save(); App.refresh(); };
  S.move = (id, dir) => {
    const s = App.store(id); if (!s || !s.route) return;
    const peers = routeStores().filter((x) => x.street === s.street);
    const i = peers.findIndex((x) => x.id === id); const j = i + dir;
    if (j < 0 || j >= peers.length) return;
    const o = s.route.order; s.route.order = peers[j].route.order; peers[j].route.order = o;
    App.save(); App.refresh();
    App.toast(`已${dir < 0 ? '上移' : '下移'}：${s.name.replace(/（.*?）/g, '')}`, { icon: 'list', bottom: true });
  };
  S.startVisit = (id) => App.go('visit-start', { storeId: id });
  S.remind = (name) => App.toast(`已催办 ${name}（演示）`, { icon: 'bell' });

  function routeItem(s, i, peersN) {
    const r = s.route; const done = r.trace === 'done';
    const canStart = r.trace === 'todo' || r.trace === 'running';
    return `<div class="rt-item ${done ? 'done' : ''}" onclick="App.go('customer',{id:'${s.id}'})">
      <div class="rt-idx"><b>${String(r.order).padStart(2, '0')}</b><span>${esc(r.time || '')}</span></div>
      <div class="rt-body">
        <div class="rt-name"><span class="nm">${esc(s.name)}</span>${done ? App.icon('check-circle', 15, '') : ''}</div>
        <div class="rt-line wrap"><span class="tx">${esc(contactLine(s))}</span>${ui().tierChip(s.tier, { sm: true })}</div>
        <div class="rt-line"><span class="tx">${esc(lastLine(s))}</span></div>
        ${r.appointment && !done ? `<div class="rt-appt">${App.icon('clock', 12)}${esc(r.appointment)}</div>` : ''}
        ${r.trace === 'pending' ? `<div class="rt-appt">${App.icon('alert', 12)}${esc(r.checkin)} 打点 · ${esc(r.checkout)} 离店 · 未留痕</div>` : ''}
        ${canStart ? `<div class="rt-act">${ui().btn(r.trace === 'running' ? '继续拜访' : '开始拜访', { tone: r.trace === 'running' ? 'secondary' : 'primary', size: 'xs', icon: 'play', onclick: `${stop}S_ROUTE.startVisit('${s.id}')` })}</div>` : ''}
        ${r.trace === 'pending' ? `<div class="rt-act">${ui().btn('补录留痕', { tone: 'primary', size: 'xs', icon: 'mic', onclick: `${stop}App.go('record',{storeId:'${s.id}'})` })}</div>` : ''}
      </div>
      <div class="rt-right">${ui().traceChip(r.trace, { sm: true })}
        <div class="rt-mv"><button ${i === 0 ? 'disabled' : ''} onclick="${stop}S_ROUTE.move('${s.id}',-1)" aria-label="上移">▲</button><button ${i === peersN - 1 ? 'disabled' : ''} onclick="${stop}S_ROUTE.move('${s.id}',1)" aria-label="下移">▼</button></div>
      </div>
    </div>`;
  }

  App.register('route', {
    title: '今日路线', tab: 'route',
    prd: ['deck p12 · 今日路线', 'deck p24 · 留痕率 = 已归档 ÷ 已打点'],
    rules: ['路线按街道与顺序排，每张卡带上次「下一步」与分层标签', '「已拜访未留痕」橙色高亮，一键直达语音页', '状态随归档实时更新（丙店归档后自动变为已留痕）'],
    demoActions: [
      { label: '重置为全部筛选', icon: 'filter', run() { S.setFilter('all'); } },
      { label: '查看回访提醒与待办', icon: 'bell', run() { App.go('reminders'); } },
    ],
    render() {
      const st = App.state; const mgr = App.isMgr();
      const all = routeStores();
      const cnt = (t) => all.filter((s) => s.route.trace === t).length;
      const filter = st.ui.routeFilter || 'all';
      const list = filter === 'all' ? all : all.filter((s) => s.route.trace === filter);
      const pending = all.filter((s) => s.route.trace === 'pending');
      // 街道分组（按最小顺序号排序）
      const streets = []; list.forEach((s) => { if (!streets.includes(s.street)) streets.push(s.street); });
      const groups = streets.map((name) => { const items = list.filter((s) => s.street === name); const peers = all.filter((s) => s.street === name); return { name, items, total: peers.length, done: peers.filter((s) => s.route.trace === 'done').length, peers }; });

      const head = `<div class="rt-head"><div class="rt-h1">${mgr ? '团队今日路线' : '今日路线'} · ${all.length} 家</div><div class="rt-h2">${App.fmt.md(TODAY())} · 按街道分组 · 状态随归档实时更新${mgr ? ' · 主管视角 · 地推一队' : ''}</div></div>`;
      const kpis = `<div class="kpis four rt-kpis">${[['done', '已留痕'], ['running', '进行中'], ['pending', '未留痕'], ['todo', '未去']].map(([k, l]) => `<div class="kpi ${k} ${filter === k ? 'active' : ''}" onclick="S_ROUTE.setFilter('${filter === k ? 'all' : k}')" style="cursor:pointer"><div class="v">${cnt(k)}</div><div class="l">${l}</div></div>`).join('')}</div>`;
      const amber = pending.length ? `<div class="rt-amber"><div class="row between"><div class="rt-at">已拜访未留痕 · ${pending.length}</div>${ui().chip('主管端可见', 'warn', { sm: true, icon: 'eye-off' })}</div>${pending.map((s) => `<div class="rt-row"><div class="rt-av">${esc(App.initials(s.name))}</div><div class="grow"><div class="rt-nm ellipsis">${esc(s.name.replace(/（.*?）/g, ''))}</div><div class="rt-sub">${mgr ? esc(s.ownerName) + ' · ' : ''}${esc(s.route.checkin || '')} 打点 · ${esc(s.route.checkout || '')} 离店</div></div>${mgr ? `<button class="pill" onclick="S_ROUTE.remind('${esc(s.ownerName)}')">一键催办</button>` : `<button class="pill" onclick="App.go('record',{storeId:'${s.id}'})">30 秒留痕（设计目标）</button>`}</div>`).join('')}</div>` : '';
      const chips = `<div class="filter-bar rt-filters">${FILTERS.map(([k, l]) => `<button class="fchip ${filter === k ? 'active' : ''}" onclick="S_ROUTE.setFilter('${k}')">${l} <span class="count">${k === 'all' ? all.length : cnt(k)}</span></button>`).join('')}</div>`;
      const body = groups.length ? groups.map((g) => `<div class="rt-group"><b>${esc(g.name)} · ${g.total} 家</b><span>${g.done} 已留痕</span></div><div class="list">${g.items.map((s) => routeItem(s, g.peers.findIndex((x) => x.id === s.id), g.peers.length)).join('')}</div>`).join('')
        : ui().empty({ icon: 'road', title: '该状态下没有门店', sub: '换个筛选看看', action: ui().btn('查看全部', { tone: 'secondary', size: 'sm', onclick: "S_ROUTE.setFilter('all')" }) });
      const foot = `<div class="row between mt8" style="padding:0 2px"><span class="tiny muted">上下箭头可调整同一街道内顺序 · 顺序仅影响本人今日路线</span></div>`;
      return head + kpis + amber + chips + body + foot;
    },
  });

  /* ============================================================
     street · 扫街辅助
     ============================================================ */
  function streetData(name) {
    const st = App.state;
    const stores = st.stores.filter((s) => s.street === name);
    const isNew = (s) => !!s.isNew;
    const isCoop = (s) => s.coop === 'active';
    const dueSoon = (s) => { if (!s.nextDue) return false; const n = App.fmt.days(s.nextDue); return n <= 7; };
    const newOpen = stores.filter(isNew);
    const partners = stores.filter((s) => !isNew(s) && isCoop(s));
    const due = stores.filter((s) => !isNew(s) && !isCoop(s) && dueSoon(s));
    const others = stores.filter((s) => !newOpen.includes(s) && !partners.includes(s) && !due.includes(s));
    return { name, stores, newOpen, partners, due, others, street: App.by(st.streets, 'name', name) || { name, district: '' } };
  }
  S.enterList = () => { App.state.ui.streetEntered = true; App.save(); App.refresh(); App.scrollTop(); };
  S.backToCard = () => { App.state.ui.streetEntered = false; App.save(); App.refresh(); App.scrollTop(); };
  S.pickStreet = () => {
    App.sheet({ title: '切换街道（定位未命中时手动选择）', items: App.state.streets.map((x) => ({ label: x.name, sub: `${x.district} · ${App.state.stores.filter((s) => s.street === x.name).length} 家客户`, icon: 'map-pin', onSelect: () => { App.state.ui.street = x.name; App.state.ui.streetEntered = false; App.save(); App.replace('street', { name: x.name }); } })) });
  };
  S.contactOwner = (name) => App.toast(`已向负责人 ${name} 发送协同提醒（演示）`, { icon: 'send' });

  function streetItem(s, kind) {
    const mine = s.ownerId === meId() || (App.isMgr() && s.ownerId !== 'u_other');
    const chips = [];
    if (kind === 'new') chips.push(ui().chip('新开', 'ai', { sm: true }));
    if (s.coop === 'active') chips.push(ui().chip('合作中', 'ok', { sm: true }));
    if (s.coop === 'paused') chips.push(ui().chip('停做', 'danger', { sm: true }));
    const dup = s.dupSuspect ? ui().chip('疑似重复', 'danger', { sm: true, icon: 'alert' }) : '';
    const act = mine ? ui().btn('开始拜访', { tone: 'primary', size: 'xs', onclick: `${stop}S_ROUTE.startVisit('${s.id}')` }) : ui().btn('联系负责人', { tone: 'outline', size: 'xs', onclick: `${stop}S_ROUTE.contactOwner('${esc(s.ownerName)}')` });
    let l1;
    if (kind === 'new') l1 = `${dup}<span class="tx">${s.lastVisit ? '仅电话联系 · 未到店 · ' : '未拜访 · '}门头 / 营业执照可识别</span>`;
    else l1 = `${dup}<span class="tx">拜访 ${s.lastVisit ? App.fmt.rel(s.lastVisit) : '未拜访'}${s.lastNext ? ' · ' + esc(s.lastNext) : ''}</span>`;
    const l2 = kind === 'new' ? `${ui().tierChip(s.tier, { sm: true })}` : `<span class="tx">回访 ${s.nextDue ? App.fmt.md(s.nextDue) : '—'}${s.nextDue && App.fmt.days(s.nextDue) < 0 ? '（逾期）' : ''}</span>${ui().tierChip(s.tier, { sm: true })}`;
    const owner = `<span class="tx">负责人 ${esc(s.ownerName)}${s.ownerId === meId() ? '（我）' : ''}</span>`;
    const avCls = { new: 'new', coop: 'coop', due: 'due' }[kind] || 'other';
    return `<div class="st-item" onclick="App.go('customer',{id:'${s.id}'})">
      <div class="avatar ${avCls}">${esc(App.initials(s.name))}</div>
      <div class="st-body">
        <div class="st-top"><span class="nm" title="${esc(s.name)}">${esc(s.name.replace(/（.*?）/g, ''))}</span>${chips.join('')}${act}</div>
        <div class="st-line">${l1}</div>
        <div class="st-line">${l2}${kind === 'new' ? owner : ''}</div>
        ${kind !== 'new' ? `<div class="st-line">${owner}</div>` : ''}
        <div class="st-line"><span class="tx">${esc(s.address)} · ${esc(s.category)}</span></div>
        ${s.route && s.route.appointment && s.route.trace !== 'done' ? `<div class="st-note">${App.icon('clock', 12)}${esc(s.route.appointment)}（电话约定）</div>` : ''}
      </div>
    </div>`;
  }

  App.register('street', {
    title: '扫街辅助', tab: 'route',
    prd: ['deck p13 · 扫街辅助', '决策 c · 展示项按部门配置'],
    rules: ['按销售所在街道列出 新开 / 合作 / 待回访 三组', '展示项按「地推部」配置 v2，不开放个人自定义', '同事负责的客户显示负责人，只可「联系负责人」，避免重复打扰', '疑似重复由人选择，不自动合并'],
    demoActions: [
      { label: '模拟进入街道（重置提示卡）', icon: 'map-pin', run() { App.state.ui.streetEntered = false; App.save(); App.refresh(); App.toast('已模拟进入街道 · 定位触发', { icon: 'map-pin' }); } },
      { label: '切换街道', icon: 'road', run() { S.pickStreet(); } },
    ],
    render(params) {
      const st = App.state;
      const name = params.name || st.ui.street || '一马路';
      if (name !== st.ui.street) { st.ui.street = name; }
      const d = streetData(name);
      const geo = st.perms && st.perms.geo;
      const cfg = st.settings.streetDisplay || '地推部 · 配置 v2 · 不开放个人自定义';
      const fields = ['合作状态', '拜访记录', '回访日期', '分层', '负责人'];

      if (!st.ui.streetEntered) {
        return `<div class="rt-head"><div class="rt-h1">扫街辅助</div><div class="rt-h2">进入目标街道自动列出新开 / 合作 / 待回访客户</div></div>
        <div class="st-enter">
          <div class="eb">${App.icon('map-pin', 12)} 定位提示 · ${geo ? '定位已获取' : '定位未授权 · 手动选择'}</div>
          <div class="t">你已进入 ${esc(d.name)}</div>
          <div class="s">${esc(d.street.district || '')} · 半径 200 米（演示值） · ${d.stores.length} 家客户</div>
          <div class="tiles"><div class="m"><div class="v">${d.newOpen.length}</div><div class="l">新开客户</div></div><div class="m"><div class="v">${d.partners.length}</div><div class="l">合作客户</div></div><div class="m"><div class="v">${d.due.length}</div><div class="l">待回访</div></div></div>
          <div class="acts">${ui().btn('查看清单', { tone: 'primary', icon: 'list', onclick: 'S_ROUTE.enterList()' })}${ui().btn('不是这条街？切换', { tone: 'ghost', onclick: 'S_ROUTE.pickStreet()' })}</div>
        </div>
        <div class="card"><div class="card-title">${App.icon('settings', 16)}展示项由部门配置</div><div class="small muted">当前「${esc(cfg)}」：${fields.join(' / ')}。管理员在企业管理后台按部门勾选（地推部与 KA 部各一套）。</div></div>
        <div class="card"><div class="row between mb8"><div class="card-title" style="margin:0">清单预览 · ${d.stores.length} 家</div><span class="tiny muted">进入街道后自动触发</span></div>
          ${[['新开', 'ai', d.newOpen], ['合作', 'ok', d.partners], ['待回访', 'warn', d.due], ['其他', 'gray', d.others]].map(([l, tone, arr]) => `<div class="row" style="padding:7px 0;border-top:.5px solid var(--line)">${ui().chip(`${l} ${arr.length}`, tone, { sm: true })}<span class="small muted ellipsis grow">${arr.length ? esc(arr.map((c) => c.name.replace(/（.*?）/g, '')).join('、')) : '—'}</span></div>`).join('')}
        </div>
        <div class="card"><div class="card-title">不是这条街？</div><div class="chips">${st.streets.map((x) => `<span class="chip ${x.name === d.name ? 'brand' : 'outline'}" onclick="App.state.ui.street='${esc(x.name)}';App.save();App.replace('street',{name:'${esc(x.name)}'})">${esc(x.name)}</span>`).join('')}</div></div>`;
      }

      const group = (title, right, arr, kind) => `<div class="rt-group"><b>${title}</b>${right}</div><div class="list">${arr.length ? arr.map((s) => streetItem(s, kind)).join('') : `<div class="cell"><div class="cell-body"><div class="cell-sub">本街道暂无</div></div></div>`}</div>`;
      return `<div class="rt-head"><div class="rt-h1">${esc(d.name)}</div><div class="rt-h2">共 ${d.stores.length} 家客户 · 展示项按「地推部」配置 v2 · 不开放个人自定义</div></div>
      <div class="st-chips"><span class="fchip em">新开 ${d.newOpen.length}</span><span class="fchip ok">合作 ${d.partners.length}</span><span class="fchip warn">待回访 ${d.due.length}</span><button class="fchip" onclick="S_ROUTE.backToCard()">← 定位卡</button></div>
      ${group('新开客户 · 未拜访过', ui().chip('优先触达', 'ai', { sm: true }), d.newOpen, 'new')}
      ${group('合作客户 · 避免重复打扰', ui().chip('合作中', 'ok', { sm: true }), d.partners, 'coop')}
      ${group('待回访 · 7 天内到期', ui().chip(`${d.due.filter((s) => App.fmt.days(s.nextDue) < 0).length} 逾期`, 'warn', { sm: true }), d.due, 'due')}
      ${d.others.length ? group(`其他客户 · ${d.others.length} 家`, '<span class="tiny muted">今日已拜访 / 周期未到</span>', d.others, 'other') : ''}
      <div class="st-dept">${App.icon('lock', 14)}<div>已由同事负责的客户只可「联系负责人」，不可重复建档与打扰；展示项由部门配置（${esc(cfg)}）。</div></div>`;
    },
  });

  /* ============================================================
     reminders · 回访提醒与待办
     ============================================================ */
  function myReminders() {
    const st = App.state;
    return st.reminders.filter((r) => { const s = App.store(r.storeId); if (!s) return false; return App.isMgr() ? true : s.ownerId === meId(); });
  }
  function bucket(r) { const n = App.fmt.days(r.due); if (n < 0) return 'overdue'; if (n === 0) return 'today'; if (n <= 7) return 'week'; return 'later'; }
  S.defer = (id) => {
    const r = App.by(App.state.reminders, 'id', id); if (!r) return;
    App.prompt('延期原因（必填）', '例：客户老板出差，改约下周', (reason) => {
      reason = (reason || '').trim();
      if (!reason) { App.toast('延期须填写原因', { icon: 'alert' }); return; }
      const apply = (due) => { r.deferred = { from: r.due, reason, at: TODAY() }; r.due = due; r.status = 'todo'; App.save(); App.refresh(); App.toast(`已延期至 ${App.fmt.md(due)} · 原因已留痕`, { icon: 'calendar' }); };
      App.sheet({ title: `延期到哪天？（原因：${reason}）`, items: [
        { label: '+1 天', sub: App.fmt.mdw(addDays(r.due, 1)), icon: 'calendar', onSelect: () => apply(addDays(r.due, 1)) },
        { label: '+3 天', sub: App.fmt.mdw(addDays(r.due, 3)), icon: 'calendar', onSelect: () => apply(addDays(r.due, 3)) },
        { label: '自选日期', sub: '输入 YYYY-MM-DD', icon: 'edit', onSelect: () => App.prompt('延期至（YYYY-MM-DD）', addDays(TODAY(), 7), (v) => { v = (v || '').trim(); if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { App.toast('日期格式：2026-09-12', { icon: 'alert' }); return; } apply(v); }) },
      ] });
    }, '下一步');
  };
  S.done = (id) => {
    const r = App.by(App.state.reminders, 'id', id); if (!r) return;
    r.status = 'done'; r.doneAt = TODAY();
    const s = App.store(r.storeId);
    if (r.source === '分层规则' && s) {
      const cycle = App.tierCycle(s.tier) || r.cycle || 30;
      App.state.reminders.push({ id: App.uid('r'), storeId: r.storeId, source: '分层规则', tier: s.tier, cycle, due: addDays(TODAY(), cycle), status: 'todo', createdFrom: r.id });
    }
    App.save(); App.refresh();
    App.toast(r.source === '分层规则' ? '已完成 · 已按分层开启下一周期' : '已完成', { icon: 'check-circle' });
  };
  S.addOverdueDemo = () => {
    const st = App.state;
    const s = st.stores.find((x) => x.id === 's_xiangyu') || st.stores[0];
    st.reminders.push({ id: App.uid('r'), storeId: s.id, source: '主管任务', note: '主管 李华：本周内补一次到店', due: addDays(TODAY(), -2), status: 'todo' });
    App.save(); App.refresh(); App.toast('已新增一条逾期提醒（演示）', { icon: 'bell' });
  };

  function srcLine(r) {
    const s = App.store(r.storeId);
    const n = App.fmt.days(r.due);
    const dueTxt = `到期 ${App.fmt.md(r.due)}（${dueRel(r.due)}）`;
    const dueCls = 'due ' + (n < 0 ? 'due-over' : (n === 0 ? 'due-today' : ''));
    let src;
    if (r.source === '分层规则') src = `来源：分层规则 · ${esc(r.tier || s.tier)} 类 · 每 ${r.cycle || App.tierCycle(r.tier || s.tier) || '—'} 天回访`;
    else if (r.source === '上次下一步约定') src = `来源：上次下一步约定${r.note ? '「' + esc(r.note) + '」' : ''}`;
    else src = `来源：${esc(r.source)}${r.note ? ' · ' + esc(r.note) : ''}`;
    const deferred = r.deferred ? ` · <span class="defer">曾延期：${esc(r.deferred.reason)}（原 ${App.fmt.md(r.deferred.from)}）</span>` : '';
    return `${src} · <span class="${dueCls}">${dueTxt}</span>${deferred}`;
  }
  function reminderItem(r, merged) {
    const s = App.store(r.storeId);
    return `<div class="rm-item ${r.status === 'done' ? 'done' : ''}">
      <div class="rm-top"><span class="nm" onclick="App.go('customer',{id:'${s.id}'})">${esc(s.name)}</span>${ui().tierChip(s.tier, { sm: true })}</div>
      <div class="rm-src">${srcLine(r)}</div>
      ${merged.map((m) => `<div class="rm-merge">${App.icon('layers', 13)}<div>${ui().chip('同店同周期合并', 'gray', { sm: true })} ${srcLine(m)}<div class="tiny muted">${esc(m.dedupNote || '')}</div></div></div>`).join('')}
      ${r.status === 'done' ? `<div class="rm-acts">${ui().chip('已完成 · ' + App.fmt.md(r.doneAt || TODAY()), 'ok', { sm: true })}</div>` : `<div class="rm-acts">${ui().btn('开始拜访', { tone: 'primary', size: 'sm', onclick: `S_ROUTE.startVisit('${s.id}')` })}${ui().btn('延期', { tone: 'outline', size: 'sm', onclick: `S_ROUTE.defer('${r.id}')` })}${ui().btn('完成', { tone: 'secondary', size: 'sm', onclick: `S_ROUTE.done('${r.id}')` })}</div>`}
    </div>`;
  }

  App.register('reminders', {
    title: '回访与待办', tab: 'route',
    prd: ['deck p18 · 分层与回访', '决策 b · 回访规则后台配置'],
    rules: ['回访提醒按分层周期自动生成，每条带来源（分层规则 / 上次下一步约定 / 主管任务）', '延期须填原因，留痕可查', '同店同周期提醒合并展示', '分层由规则计算不可手改（规则 v3 · 阈值为演示值）'],
    demoActions: [
      { label: '新增一条逾期提醒（演示）', icon: 'bell', run() { S.addOverdueDemo(); } },
      { label: '模拟丙店归档（生成回访提醒）', icon: 'check-circle', run() { if (!App.state.demo.archived) { window.DATA.archiveDemoVisit(App.state, 'good', '新建商机'); App.save(); App.refresh(); App.toast('蜀香居已归档 · 回访提醒已生成', { icon: 'check-circle' }); } else App.toast('丙店已归档'); } },
    ],
    render() {
      const st = App.state;
      const all = myReminders();
      const open = all.filter((r) => r.status !== 'done');
      // 同店同周期合并：带 dedupNote 的提醒并入同店另一条未完成提醒
      const merged = new Set(); const mergeMap = {};
      open.forEach((r) => { if (!r.dedupNote) return; const host = open.find((x) => x.storeId === r.storeId && x.id !== r.id && !x.dedupNote); if (host) { merged.add(r.id); (mergeMap[host.id] = mergeMap[host.id] || []).push(r); } });
      const shown = open.filter((r) => !merged.has(r.id)).sort((a, b) => (a.due < b.due ? -1 : 1));
      const groups = { overdue: [], today: [], week: [], later: [] };
      shown.forEach((r) => groups[bucket(r)].push(r));
      const doneList = all.filter((r) => r.status === 'done');
      const myTasks = st.tasks.filter((t) => t.toId === meId() && t.status !== '已完成').length;

      const head = `<div class="rt-head"><div class="row between"><div class="rt-h1">回访提醒与待办</div><button class="link small" style="flex:none" onclick="App.go('tasks')">${App.icon('list', 14)} 待办 ${myTasks} ›</button></div><div class="rt-h2 tight">按分层自动生成回访周期（规则由贵司配置）· 延期须填原因</div></div>`;
      const kpis = `<div class="kpis rm-kpis">${[['overdue', '逾期'], ['today', '今天'], ['week', '本周']].map(([k, l]) => `<div class="kpi ${k}"><div class="v">${groups[k].length}</div><div class="l">${l}</div></div>`).join('')}</div>`;
      const g = (k, title) => groups[k].length ? `<div class="rt-group"><b>${title} · ${groups[k].length}</b>${k === 'overdue' ? '<span>优先处理</span>' : ''}</div><div class="list">${groups[k].map((r) => reminderItem(r, mergeMap[r.id] || [])).join('')}</div>` : '';
      const body = shown.length ? g('overdue', '逾期') + g('today', '今天') + g('week', '本周') + g('later', '之后') : ui().empty({ icon: 'bell', title: '暂无回访提醒', sub: '归档留痕后按分层规则自动生成' });
      const done = doneList.length ? `<div class="rt-group"><b>已完成 · ${doneList.length}</b><span>本周期已关闭</span></div><div class="list">${doneList.slice(0, 3).map((r) => reminderItem(r, [])).join('')}</div>` : '';
      const foot = `<div class="st-dept">${App.icon('info', 14)}<div>分层由规则计算不可手改（${esc(st.settings.tierRule)}）；周期 A 7 天 / B 14 天 / C 30 天 / D 60 天为演示值。</div></div>`;
      return head + kpis + body + done + foot;
    },
  });
})();
