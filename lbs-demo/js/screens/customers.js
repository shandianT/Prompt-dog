/* ============================================================
   客户列表 · 街道模式（customers）+ 街道选择（street-picker）
   PRD 7 页面表「客户列表／街道模式」· F01 · F02
   ============================================================ */
(function () {
  'use strict';
  const esc = App.esc;
  const NEEDS = '待补地址';
  // 演示补充：一条暂无客户的街道，用于展示空态（不改 data.js）
  const EXTRA_STREETS = [{ id: 'st_5', name: '科苑路', district: '浦东新区', city: '上海' }];

  App.css('cus', `
    .cus-seg { margin-bottom: 10px; }
    .cus-street { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; background: var(--surface); border-radius: var(--radius-lg); border: 1px solid rgba(17,24,39,.04); box-shadow: var(--shadow-xs); margin-bottom: 10px; text-align: left; }
    .cus-street .ci { width: 40px; height: 40px; border-radius: 12px; background: var(--brand-soft); color: var(--brand); display: flex; align-items: center; justify-content: center; flex: none; }
    .cus-street .t { font-size: 16px; font-weight: 700; letter-spacing: -.01em; }
    .cus-street .s { font-size: 12px; color: var(--ink-3); margin-top: 3px; line-height: 1.4; }
    .cus-street .sw { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 9px; background: var(--surface-3); color: var(--brand); flex: none; }
    .cus-search { margin-bottom: 6px; }
    .cus-search .clr { display: flex; color: var(--ink-4); }
    .cus-card { padding: 12px 14px; margin-bottom: 10px; }
    .cus-card .hd { display: flex; align-items: flex-start; gap: 8px; }
    .cus-card .hd > svg { flex: none; margin-top: 3px; color: var(--ink-4); }
    .cus-card .nm { font-size: 15.5px; font-weight: 700; line-height: 1.3; display: flex; align-items: center; gap: 6px; min-width: 0; }
    .cus-card .nm .chip { flex: none; }
    .cus-card .meta { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
    .cus-card .chips { margin-top: 8px; }
    .cus-card .kv2 { display: grid; grid-template-columns: 58px 1fr; gap: 4px 8px; font-size: 12.5px; margin-top: 8px; line-height: 1.4; }
    .cus-card .kv2 .k { color: var(--ink-3); }
    .cus-card .kv2 .v { color: var(--ink-2); min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cus-card .kv2 .v.due { color: #b91c1c; font-weight: 600; }
    .cus-card .kv2 .v.today { color: var(--brand-3); font-weight: 600; }
    .cus-card .ft { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px; padding-top: 9px; border-top: .5px solid var(--line); }
    .cus-card .own { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--ink-2); min-width: 0; }
    .cus-card .own .up { color: var(--ink-3); font-size: 11px; white-space: nowrap; }
    .cus-appt { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 7px 10px; border-radius: 10px; background: var(--brand-soft); color: var(--brand-3); font-size: 12.5px; font-weight: 600; }
    .cus-appt.done { background: var(--ok-soft); color: #15803d; }
    .cus-warn { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 6px 10px; border-radius: 10px; background: var(--warn-soft); color: #92400e; font-size: 12px; font-weight: 500; }
    .cus-warn svg { flex: none; }
    .cus-min .lock { width: 36px; height: 36px; border-radius: 10px; background: var(--gray-soft); color: var(--ink-3); display: flex; align-items: center; justify-content: center; flex: none; }
    .cus-min .msg { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 7px 10px; border-radius: 10px; background: var(--surface-3); color: var(--ink-2); font-size: 12.5px; }
    .cus-min .msg svg { flex: none; color: var(--ink-3); }
    .cus-needs { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--surface); border-radius: var(--radius-lg); border: 1px dashed var(--line-2); margin: 4px 0 10px; }
    .cus-needs .ni { width: 34px; height: 34px; border-radius: 10px; background: var(--warn-soft); color: var(--warn); display: flex; align-items: center; justify-content: center; flex: none; }
    .cus-mine { display: flex; align-items: center; gap: 10px; }
    .cus-count { font-size: 11px; color: var(--ink-3); margin: -2px 2px 8px; }
    .cus-empty .btn { margin: 0 auto; }
    .sp-city { display: flex; gap: 8px; margin-top: 8px; }
    .sp-city .pick { display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 12px; border-radius: 10px; background: var(--surface-3); font-size: 13px; font-weight: 600; color: var(--ink); }
    .sp-cnt { font-size: 15px; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
  `);

  const S = window.S_CUS = { q: '' };
  const U = () => (App.state.ui = App.state.ui || {});
  const allStreets = () => (App.state.streets || []).concat(EXTRA_STREETS);
  const streetMeta = (name) => allStreets().find((s) => s.name === name) || { name, district: '浦东新区', city: '上海' };
  const ownerOf = (st) => Object.values(App.state.users).find((u) => u.id === st.ownerId) || { name: st.ownerName || '—' };
  const isMine = (st) => st.ownerId === App.me().id;
  const stStores = (street) => (street === NEEDS ? App.state.stores.filter((s) => s.needsAddress) : App.state.stores.filter((s) => s.street === street));
  const myStores = () => (App.isMgr() ? App.state.stores.filter((s) => s.perm !== 'minimal') : App.state.stores.filter(isMine));
  const todoTasks = (st) => App.tasksOf(st.id).filter((t) => t.status === 'todo').sort((a, b) => ((a.due + (a.time || '')) < (b.due + (b.time || '')) ? -1 : 1));
  const nextTask = (st) => todoTasks(st)[0] || null;
  const apptToday = (st) => !!(st.appointment && st.appointment.date === App.TODAY);
  const visitedToday = (st) => !!(st.lastVisit && st.lastVisit.date === App.TODAY);
  const daysAgo = (st) => (st.lastVisit ? -App.fmt.days(st.lastVisit.date) : null);
  const recent7 = (st) => !!st.lastVisit && daysAgo(st) >= 0 && daysAgo(st) <= 7;
  // 重复拜访提示：近 7 天内本人到店（电话触达不算），风险提示、不阻断
  const repeatRisk = (st) => st.perm !== 'minimal' && !!st.lastVisit && st.lastVisit.by === App.me().name && daysAgo(st) > 0 && daysAgo(st) <= 7 && st.lastVisit.type !== '电话';
  const shortMd = (d) => (d ? `${+d.slice(5, 7)}/${+d.slice(8, 10)}` : '');
  const shortDt = (d) => (d ? shortMd(d) + (d.length > 10 ? ' ' + d.slice(11, 16) : '') : '');
  S.repeatRisk = repeatRisk;
  S.daysAgo = daysAgo;

  const FILTERS = [
    { id: 'all', label: '全部', test: () => true },
    { id: 'active', label: '服务中', test: (s) => s.coop === 'active' },
    { id: 'paused', label: '停做', test: (s) => s.coop === 'paused' },
    { id: 'recent', label: '近期拜访(7天)', test: (s) => s.perm !== 'minimal' && recent7(s) },
    { id: 'complaint', label: '未结客诉', test: (s) => !!s.complaint && s.complaint.status === 'open' },
    { id: 'new', label: '新录入·新开店', test: (s) => !!(s.isNewEntry || s.isNewOpen) },
    { id: 'untouched', label: '待触达', test: (s) => s.perm !== 'minimal' && App.oppsOf(s.id).some((o) => o.stage === '待触达') },
    { id: 'noperm', label: '无权查看', test: (s) => s.perm === 'minimal' },
  ];
  const rank = (s) => (apptToday(s) ? 0 : s.coop === 'active' ? 1 : s.perm === 'minimal' ? 3 : 2);

  /* ---------- 当前街道 / 模式 ---------- */
  function current(params, ctx) {
    const ui = U();
    if (params && params.street && ctx && ctx.entry && !ctx.entry._streetApplied) { ctx.entry._streetApplied = true; ui.street = params.street; ui.custMode = 'street'; App.save(); }
    if (!ui.street) ui.street = '一马路';
    return ui.street;
  }
  const mode = () => (U().custMode === 'mine' ? 'mine' : 'street');
  const baseList = () => (mode() === 'mine' ? myStores() : stStores(U().street || '一马路'));

  /* ---------- 片段 ---------- */
  function taskLabel(t) {
    const n = App.fmt.days(t.due);
    const when = n === 0 ? '今日' : n === 1 ? '明天' : n < 0 ? `逾期${-n}天` : App.fmt.md(t.due);
    const cls = n < 0 ? 'due' : n === 0 ? 'today' : '';
    return `<span class="v ${cls}">${esc(when)}${t.time ? ' ' + esc(t.time) : ''} ${esc(t.type)} · ${esc(t.title)}</span>`;
  }
  function apptHtml(st) {
    const a = st.appointment;
    if (visitedToday(st)) return `<div class="cus-appt done">${App.icon('check-circle', 14)}<span>今日 ${esc(a.time)} 约访已到店 · 拜访事实已确认</span></div>`;
    return `<div class="cus-appt">${App.icon('calendar', 14)}<span>今日 ${esc(a.time)} 约访 · ${esc(a.with)}</span></div>`;
  }
  function storeChips(st) {
    const chips = [App.ui.coopChip(st.coop), App.ui.complaintChip(st.complaint)];
    if (st.isNewOpen) chips.push(App.ui.chip(`新开店 · ${shortMd(st.openedAt)} 开业（有开业证据）`, 'ok', { icon: 'star' }));
    if (st.isNewEntry) chips.push(App.ui.chip('新录入 · 非新开店', 'outline'));
    return chips.filter(Boolean).join('');
  }
  S.storeChips = storeChips;

  function card(st) {
    if (st.perm === 'minimal') return minimalCard(st);
    const own = ownerOf(st); const mine = isMine(st); const t = nextTask(st); const lv = st.lastVisit; const rr = repeatRisk(st);
    const where = mode() === 'mine' && !(st.address || '').startsWith(st.street || '') ? ` · ${esc(st.street || NEEDS)}` : '';
    return `<div class="card cus-card pressable" data-store="${st.id}" onclick="App.go('customer',{id:'${st.id}'})">
      <div class="hd">
        <div class="grow">
          <div class="nm"><span class="ellipsis">${esc(st.name)}</span>${st.alias ? App.ui.chip(st.alias, 'gray', { sm: true }) : ''}</div>
          <div class="meta ellipsis">${esc(st.type)} · ${esc(st.address)}${where}</div>
        </div>${App.icon('chevron-right', 16)}
      </div>
      <div class="chips">${storeChips(st)}</div>
      ${apptToday(st) ? apptHtml(st) : ''}
      <div class="kv2">
        <span class="k">最近拜访</span>${lv ? `<span class="v">${esc(App.fmt.rel(lv.date))} · ${esc(lv.type)} · ${esc(lv.result)}</span>` : '<span class="v muted">暂无有效拜访</span>'}
        <span class="k">下次任务</span>${t ? taskLabel(t) : '<span class="v muted">暂无待办</span>'}
      </div>
      ${rr ? `<div class="cus-warn">${App.icon('alert', 14)}<span>${daysAgo(st)} 天前已拜访 · 重复拜访提示（不阻断）</span></div>` : ''}
      <div class="ft">
        <div class="own">${App.ui.avatar(own.name, 'sm' + (mine ? '' : ' gray'))}<span class="ellipsis">${mine ? '本人' : esc(own.name)}</span><span class="up">· 更新 ${esc(shortDt(st.updatedAt))}</span></div>
        <button class="btn xs secondary" onclick="event.stopPropagation();S_CUS.visit('${st.id}')">${App.icon('camera', 14)}记录拜访</button>
      </div>
    </div>`;
  }
  function minimalCard(st) {
    return `<div class="card cus-card cus-min pressable" data-store="${st.id}" onclick="App.toast('无权查看该门店详情',{icon:'lock'})">
      <div class="hd"><div class="lock">${App.icon('lock', 18)}</div>
        <div class="grow"><div class="nm"><span class="ellipsis">${esc(st.name)}</span></div><div class="meta ellipsis">${esc(st.type)} · ${esc(st.address)}</div></div>
      </div>
      <div class="msg">${App.icon('users', 15)}<span>该门店已有负责人跟进 · ${esc(st.recentTouch || '近 7 天有触达')}</span></div>
      <div class="ft"><span class="muted tiny">联系人 / 拜访 / 附件不可见（服务端权限）</span>
        <button class="btn xs ghost" onclick="event.stopPropagation();App.go('collab-request',{storeId:'${st.id}'})">${App.icon('handshake', 14)}申请协作</button></div>
    </div>`;
  }
  function needsCard(st) {
    return `<div class="card cus-card" data-store="${st.id}">
      <div class="hd"><div class="grow"><div class="nm"><span class="ellipsis">${esc(st.name)}</span></div><div class="meta">${esc(st.type)}</div></div></div>
      <div class="chips">${App.ui.chip('待补地址', 'warn', { icon: 'map-pin' })}${App.ui.coopChip(st.coop)}</div>
      <div class="kv2"><span class="k">原始地址</span><span class="v">${esc(st.address)}</span><span class="k">标准街道</span><span class="v muted">未匹配 · 不进入街道列表</span></div>
      <div class="ft"><div class="own">${App.ui.avatar(ownerOf(st).name, 'sm')}<span>${isMine(st) ? '本人' : esc(ownerOf(st).name)}</span><span class="up">· 录入 ${esc(shortMd(st.updatedAt))}</span></div>
        <button class="btn xs secondary" onclick="App.toast('演示：补充地址后按标准街道 ID 归入列表')">${App.icon('edit', 14)}补充地址（演示）</button></div>
    </div>`;
  }

  function streetButton(street, base) {
    const m = streetMeta(street);
    const active = base.filter((s) => s.coop === 'active').length;
    const open = base.filter((s) => s.complaint && s.complaint.status === 'open').length;
    const appt = base.filter(apptToday).length;
    const title = street === NEEDS ? `${m.city} · ${m.district} · 待补地址` : `${m.city} · ${m.district} · ${m.name}`;
    const sub = street === NEEDS ? `${base.length} 家门店无标准街道 · 待治理清单` : (base.length ? `${base.length} 家门店 · 服务中 ${active} · 未结客诉 ${open} · 今日约访 ${appt}` : '该街道暂无客户');
    return `<button class="cus-street pressable" onclick="App.go('street-picker')"><div class="ci">${App.icon('map-pin', 20)}</div><div class="grow"><div class="t ellipsis">${esc(title)}</div><div class="s">${esc(sub)}</div></div><div class="sw" aria-label="切换街道">${App.icon('chevron-down', 18)}</div></button>`;
  }
  function mineSummary(base) {
    const me = App.me();
    const groups = {};
    base.forEach((s) => { const k = s.street || NEEDS; groups[k] = (groups[k] || 0) + 1; });
    const parts = Object.keys(groups).map((k) => `${k} ${groups[k]}`).join(' · ');
    return `<div class="cus-street"><div class="ci">${App.ui.avatar(me.name, 'sm')}</div><div class="grow"><div class="t ellipsis">${App.isMgr() ? '团队客户' : '本人负责'} · ${base.length} 家门店</div><div class="s ellipsis">${esc(parts || '暂无')}</div></div></div>`;
  }

  /* ---------- 列表（搜索时局部刷新） ---------- */
  S.renderList = function () {
    const ui = U(); const md = mode(); const street = ui.street || '一马路';
    const base = baseList();
    const f = FILTERS.find((x) => x.id === ui.custFilter) || FILTERS[0];
    const q = (S.q || '').trim();
    let list = base.filter(f.test);
    if (q) list = list.filter((s) => (s.name + (s.alias || '') + (s.address || '')).includes(q));
    if (md === 'street' && street === NEEDS) {
      if (!list.length) return App.ui.empty({ icon: 'map-pin', title: '暂无待补地址客户', sub: '无标准街道的客户会进入这里' });
      return App.ui.notice('warn', '无标准街道 ID 的客户进入待治理清单；<b>原始地址保留用于核对</b>，避免同名街道混淆。', 'map-pin') + list.map(needsCard).join('');
    }
    if (!base.length) {
      return `<div class="cus-empty">${App.ui.empty({ icon: 'store', title: '该街道暂无客户', sub: '新增门店会先经过名称 / 地址候选去重，再关联或新建', action: App.ui.btn('新增门店', { icon: 'plus', size: 'sm', onclick: "App.toast('演示：新店线索提交为草稿，经候选去重后关联或新建')" }) })}</div>`;
    }
    if (!list.length) return App.ui.empty({ icon: 'search', title: q ? '未找到匹配门店' : '没有符合条件的门店', sub: q ? `"${q}" 在当前筛选下无结果` : '切换筛选或街道再试' });
    list = list.slice().sort((a, b) => rank(a) - rank(b) || ((a.updatedAt || '') < (b.updatedAt || '') ? 1 : -1));
    const needs = App.state.stores.filter((s) => s.needsAddress);
    const needsEntry = md === 'street' && f.id === 'all' && !q && needs.length
      ? `<div class="cus-needs pressable" onclick="S_CUS.pick('${NEEDS}')"><div class="ni">${App.icon('map-pin', 18)}</div><div class="grow"><div style="font-size:14px;font-weight:600">待补地址（${needs.length}）</div><div class="tiny muted">无标准街道 ID · 待治理清单</div></div>${App.icon('chevron-right', 16, 'muted')}</div>` : '';
    return `<div class="cus-count">${list.length} 家门店 · 今日约访优先 → 服务中 → 其他 · 无权门店置后</div>` + list.map(card).join('') + needsEntry;
  };

  /* ---------- 动作 ---------- */
  S.filter = (id) => { U().custFilter = id; App.save(); App.refresh(); };
  S.mode = (m) => { const ui = U(); ui.custMode = m; ui.custFilter = 'all'; App.save(); App.refresh(); };
  S.pick = (street) => { const ui = U(); ui.street = street; ui.custMode = 'street'; ui.custFilter = 'all'; S.q = ''; App.save(); if (App.stack.length > 1 && App.currentEntry().id === 'street-picker') App.back(); else App.refresh(); };
  S.clear = () => { S.q = ''; App.refresh(); };
  S.visit = function (id, extra) {
    const st = App.store(id); if (!st) return;
    const params = Object.assign({ storeId: id }, extra || {});
    if (repeatRisk(st)) {
      App.prompt(`${daysAgo(st)} 天前已拜访 · 重复拜访提示`, '提示不阻断。请填写本次拜访的合理原因（如：已约定复访 / 客诉处理 / 补充勘查）', (reason) => {
        const r = (reason || '').trim();
        if (!r) { App.toast('请填写合理原因后继续（仅需留痕，不阻断）'); return; }
        App.toast('已记录原因，继续记录拜访', { icon: 'check' });
        App.go('visit-capture', Object.assign(params, { repeatReason: r }));
      }, '填写原因并继续');
      return;
    }
    App.go('visit-capture', params);
  };

  /* ---------- 页面：客户列表 ---------- */
  App.register('customers', {
    title: '客户', tab: 'customers',
    prd: ['7 页面表 · 客户列表/街道模式', '7.1 典型交互：一马路 甲/乙/丙店', 'F02 街道客户与访前准备', 'F01 协作申请不抢占归属'],
    rules: ['按标准街道 ID 筛选，缺地址进入待补地址', '卡片：合作状态 / 最近有效拜访 / 下次任务 / 客诉 / 负责人 / 更新时间', '客诉未接入显示"未接入"，同步过期显示"数据待更新"', '新开店需开业证据，新录入≠新开店', '重复拜访提示不阻断，可填原因继续', '无权门店仅显示避重提示 + 申请协作'],
    render(params, ctx) {
      const street = current(params, ctx);
      const md = mode(); const ui = U();
      const base = baseList();
      const cur = FILTERS.find((x) => x.id === ui.custFilter) ? ui.custFilter : 'all';
      const fb = FILTERS.map((f) => `<button class="fchip ${f.id === cur ? 'active' : ''}" onclick="S_CUS.filter('${f.id}')">${esc(f.label)}<span class="count">${base.filter(f.test).length}</span></button>`).join('');
      return `<div class="seg block cus-seg"><button class="${md === 'street' ? 'active' : ''}" onclick="S_CUS.mode('street')">街道模式</button><button class="${md === 'mine' ? 'active' : ''}" onclick="S_CUS.mode('mine')">我的客户</button></div>
        ${md === 'street' ? streetButton(street, base) : mineSummary(base)}
        <div class="search cus-search">${App.icon('search', 18)}<input id="cus-q" placeholder="搜索门店名 / 别名 / 地址" value="${esc(S.q)}">${S.q ? `<button class="clr" onclick="S_CUS.clear()">${App.icon('x', 16)}</button>` : ''}</div>
        <div class="filter-bar">${fb}</div>
        <div id="cus-list">${S.renderList()}</div>`;
    },
    mount(root) {
      const inp = root.querySelector('#cus-q'); if (!inp) return;
      inp.value = S.q;
      inp.addEventListener('input', () => { S.q = inp.value; const l = root.querySelector('#cus-list'); if (l) l.innerHTML = S.renderList(); });
      // 让当前筛选芯片保持可见
      const bar = root.querySelector('.filter-bar'); const act = bar && bar.querySelector('.fchip.active');
      if (bar && act) bar.scrollLeft = Math.max(0, act.offsetLeft - 14);
    },
    demoActions: [
      { label: '切换到二马路', icon: 'road', run() { S.pick('二马路'); App.toast('已切换到二马路', { icon: 'map-pin' }); } },
      { label: '回到一马路', icon: 'map-pin', run() { S.pick('一马路'); } },
      { label: '模拟客诉数据过期（满堂红）', icon: 'clock', run() {
        const st = App.store('s_jia'); if (!st) return;
        st.complaint = { status: 'stale', summary: '客诉数据最近同步于 9/3 08:30，可能不是最新', date: '2026-09-03', source: '服务系统 · 同步中断' };
        App.save(); App.refresh(); App.toast('满堂红客诉状态 → 数据待更新（不显示"无客诉"）', { icon: 'clock' });
      } },
      { label: '恢复客诉数据（满堂红）', icon: 'refresh', run() {
        const st = App.store('s_jia'); const fresh = App.freshState().stores.find((s) => s.id === 's_jia');
        if (st && fresh) { st.complaint = fresh.complaint; App.save(); App.refresh(); App.toast('已恢复：未结客诉（9/7 08:30 同步）', { icon: 'refresh' }); }
      } },
    ],
  });

  /* ---------- 页面：街道选择 ---------- */
  App.register('street-picker', {
    title: '选择街道', tab: 'customers', nav: { title: '选择街道', solid: true },
    prd: ['F02 按行政区和标准街道 ID 筛选', 'F01 稳定 ID 与外部 ID 映射'],
    rules: ['同名街道靠标准街道 ID 区分', '无标准街道的客户进入待治理清单', '不显示未授权区域的数据'],
    render() {
      const cur = U().street;
      const rows = allStreets().map((s) => {
        const list = stStores(s.name);
        const active = list.filter((x) => x.coop === 'active').length;
        const open = list.filter((x) => x.complaint && x.complaint.status === 'open').length;
        const noperm = list.filter((x) => x.perm === 'minimal').length;
        const sub = list.length ? `服务中 ${active} · 未结客诉 ${open}${noperm ? ` · 无权 ${noperm}` : ''}` : '暂无客户';
        return App.ui.cell({ title: esc(s.name), badge: `${App.ui.chip(s.id, 'outline', { sm: true })}${cur === s.name ? App.ui.chip('当前', 'brand', { sm: true }) : ''}`, sub, icon: 'road', iconTone: list.length ? '' : 'gray', right: `<span class="sp-cnt">${list.length}</span>`, onclick: `S_CUS.pick('${s.name}')` });
      }).join('');
      const needs = App.state.stores.filter((s) => s.needsAddress);
      return `<div class="card"><div class="eyebrow">城市 / 行政区</div>
          <div class="sp-city"><button class="pick" onclick="App.toast('演示仅包含上海')">上海${App.icon('chevron-down', 14)}</button><button class="pick" onclick="App.toast('演示仅包含浦东新区（授权范围）')">浦东新区${App.icon('chevron-down', 14)}</button></div>
          <div class="small muted mt12">按行政区与<b>标准街道 ID</b> 筛选；原始地址保留用于核对，避免同名街道混淆。仅显示本人授权范围内的街道。</div></div>
        ${App.ui.section('街道', `${allStreets().length} 条`)}
        <div class="list">${rows}</div>
        ${App.ui.section('待治理')}
        <div class="list">${App.ui.cell({ title: '待补地址', badge: App.ui.chip(`${needs.length}`, 'warn', { sm: true }), sub: '无标准街道 ID · 原始地址待核对', icon: 'map-pin', iconTone: 'warn', onclick: `S_CUS.pick('${NEEDS}')` })}</div>`;
    },
  });
})();
