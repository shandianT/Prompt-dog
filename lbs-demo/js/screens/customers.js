/* ============================================================
   客户模块：customers（Tab 根 · 中间凸起）/ customer（客户 360 · 手机端）
   命名空间 window.S_CUS；页面专属样式通过 App.css('cus') 注入
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_CUS = {};
  const esc = App.esc;
  const TODAY = App.TODAY;

  App.css('cus', `
  .cu-head { padding: 6px 2px 10px; }
  .cu-head h1 { font-size: 22px; font-weight: 800; letter-spacing: -.01em; line-height: 1.2; }
  .cu-head .d { color: var(--ink-3); font-size: 13px; margin-top: 4px; line-height: 1.45; }
  .cu-tools { display: flex; align-items: center; gap: 8px; margin: 6px 0 4px; }
  .cu-tools .search { flex: 1; }
  .cu-tools .tb { height: 38px; padding: 0 12px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line-2); font-size: 13px; font-weight: 600; color: var(--ink-2); display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; flex: none; }
  .cu-tools .tb.on { background: var(--brand-soft); border-color: var(--brand-soft-2); color: var(--brand-3); }
  .cu-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--ink-3); margin: 0 2px 8px; }
  .cu-meta .sort { display: inline-flex; align-items: center; gap: 2px; font-weight: 600; color: var(--ink-2); }
  /* 客户卡 */
  .cu-card { display: flex; gap: 12px; padding: 14px 14px 12px; background: var(--surface); cursor: pointer; }
  .cu-card + .cu-card { border-top: .5px solid var(--line); }
  .cu-card:active { background: var(--surface-2); }
  .cu-av { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex: none; letter-spacing: .02em; }
  .cu-av.A { background: var(--brand); color: #fff; }
  .cu-av.B { background: var(--ai-soft); color: var(--ai); }
  .cu-av.C { background: var(--ok-soft); color: #15803d; }
  .cu-av.D { background: var(--gray-soft); color: var(--gray); }
  .cu-av.pending { background: var(--surface); color: var(--ink-3); border: 1.5px dashed var(--line-2); }
  .cu-body { flex: 1; min-width: 0; }
  .cu-top { display: flex; align-items: flex-start; gap: 8px; }
  .cu-name { font-size: 15.5px; font-weight: 700; line-height: 1.3; display: flex; align-items: center; gap: 6px; min-width: 0; }
  .cu-name > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cu-name .alias { flex: none; font-size: 10.5px; font-weight: 700; padding: 1px 6px; border-radius: 6px; background: var(--surface-3); color: var(--ink-3); }
  .cu-act { flex: none; }
  .cu-act .btn { height: 30px; padding: 0 11px; font-size: 12.5px; border-radius: 9px; }
  .cu-act .btn.primary { box-shadow: none; }
  .cu-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
  .cu-line { font-size: 12.5px; color: var(--ink-3); margin-top: 5px; line-height: 1.4; }
  .cu-line.next { color: var(--ink-2); }
  .cu-line.next b { color: var(--ink); font-weight: 600; }
  .cu-foot { display: flex; align-items: center; gap: 8px; margin-top: 7px; font-size: 12.5px; color: var(--ink-3); flex-wrap: wrap; }
  .cu-foot .own { display: inline-flex; align-items: center; gap: 4px; }
  .cu-foot .own b { color: var(--ink-2); font-weight: 600; }
  .cu-foot .own.other b { color: var(--warn); }
  .cu-scope { text-align: center; font-size: 11.5px; color: var(--ink-3); padding: 4px 8px 6px; line-height: 1.5; }
  /* 客户 360 头部 */
  .cu-hero { border-radius: 20px; padding: 16px 16px 14px; color: #fff; margin-bottom: 12px; position: relative; overflow: hidden;
    background: linear-gradient(135deg, #16355f 0%, #0f2444 60%, #0b1a33 100%); box-shadow: 0 10px 24px rgba(15,36,68,.28); }
  .cu-hero::after { content: ""; position: absolute; right: -40px; top: -60px; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,.08); }
  .cu-hero > * { position: relative; z-index: 1; }
  .cu-hero .cat { font-size: 11.5px; opacity: .8; letter-spacing: .04em; font-weight: 600; }
  .cu-hero .nm { font-size: 20px; font-weight: 800; letter-spacing: -.01em; line-height: 1.25; margin-top: 2px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .cu-hero .nm .alias { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.2); }
  .cu-hero .ent { font-size: 13px; opacity: .9; margin-top: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .cu-hero .addr { font-size: 12.5px; opacity: .8; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
  .cu-hero .h-chip { background: rgba(255,255,255,.16); color: #fff; border: 1px solid rgba(255,255,255,.18); height: 22px; padding: 0 8px; border-radius: 999px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
  .cu-hero .h-chip.ok { background: rgba(31,138,76,.35); border-color: rgba(31,138,76,.5); color: #d7f5e3; }
  .cu-hero .h-chip.warn { background: rgba(185,119,14,.35); border-color: rgba(185,119,14,.5); color: #fde9c4; }
  .cu-hero .h-chip.danger { background: rgba(184,67,58,.4); border-color: rgba(184,67,58,.55); color: #ffd9d5; }
  .cu-hero .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .cu-hero .tags .chip { background: rgba(255,255,255,.92); }
  .cu-hero .rule { font-size: 11px; opacity: .7; margin-top: 8px; }
  .cu-hero .own { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.14); font-size: 12.5px; }
  .cu-hero .own .a { display: flex; align-items: center; gap: 6px; }
  .cu-hero .own .a .avatar { width: 22px; height: 22px; font-size: 10px; background: rgba(255,255,255,.2); }
  /* 五个标签 */
  .cu-tabs { display: flex; background: var(--surface-3); border-radius: 12px; padding: 3px; gap: 2px; margin-bottom: 12px; position: sticky; top: -8px; z-index: 5; }
  .cu-tabs button { flex: 1; height: 34px; border-radius: 9px; font-size: 12.5px; font-weight: 600; color: var(--ink-2); display: inline-flex; align-items: center; justify-content: center; gap: 3px; padding: 0 2px; white-space: nowrap; }
  .cu-tabs button.active { background: var(--surface); color: var(--ink); box-shadow: var(--shadow-xs); }
  .cu-tabs button i { font-style: normal; font-size: 10.5px; font-weight: 700; color: var(--ink-3); min-width: 14px; height: 14px; border-radius: 7px; background: var(--surface); padding: 0 3px; display: inline-flex; align-items: center; justify-content: center; }
  .cu-tabs button.active i { background: var(--brand-soft); color: var(--brand-3); }
  .cu-tabs button i.hot { background: var(--warn-soft); color: #b45309; }
  /* 概览 */
  .cu-kv { display: grid; grid-template-columns: 78px 1fr; gap: 9px 10px; font-size: 13.5px; }
  .cu-kv dt { color: var(--ink-3); }
  .cu-kv dd { color: var(--ink); min-width: 0; line-height: 1.4; }
  .cu-kv dd .muted { font-size: 12px; }
  .cu-next { display: flex; gap: 10px; align-items: flex-start; }
  .cu-next .ni { width: 36px; height: 36px; border-radius: 11px; background: var(--brand-soft); color: var(--brand); display: flex; align-items: center; justify-content: center; flex: none; }
  .cu-next .nt { font-size: 14.5px; font-weight: 600; line-height: 1.4; }
  .cu-next .ns { font-size: 12px; color: var(--ink-3); margin-top: 3px; }
  .cu-cmp { border-left: 4px solid var(--danger); }
  .cu-cmp .ct { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 14px; }
  .cu-cmp .cb { font-size: 13px; color: var(--ink-2); margin-top: 6px; line-height: 1.5; }
  .cu-cmp .cs { font-size: 12px; color: var(--ink-3); margin-top: 6px; }
  /* 拜访时间线 */
  .cu-tl .tl-item { cursor: pointer; }
  .cu-tl .tl-title { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .cu-tl .tl-body { font-size: 13px; color: var(--ink-2); line-height: 1.5; }
  .cu-tl .tl-foot { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 11.5px; color: var(--ink-3); }
  .cu-tl .tl-foot .chip { height: 18px; font-size: 10.5px; padding: 0 6px; }
  /* 商机 / 方案 */
  .cu-opp { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; background: var(--surface); cursor: pointer; }
  .cu-opp + .cu-opp { border-top: .5px solid var(--line); }
  .cu-opp .oi { width: 38px; height: 38px; border-radius: 11px; background: var(--warn-soft); color: #b45309; display: flex; align-items: center; justify-content: center; flex: none; }
  .cu-opp .oi.ok { background: var(--ok-soft); color: #15803d; }
  .cu-opp .oi.brand { background: var(--brand-soft); color: var(--brand); }
  .cu-opp .ot { font-size: 14.5px; font-weight: 600; line-height: 1.35; }
  .cu-opp .om { font-size: 12.5px; color: var(--ink-3); margin-top: 4px; }
  .cu-opp .oc { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
  .cu-prop { display: flex; gap: 12px; align-items: center; padding: 12px 14px; background: var(--surface); cursor: pointer; }
  .cu-prop + .cu-prop { border-top: .5px solid var(--line); }
  .cu-prop .pv { width: 42px; height: 42px; border-radius: 12px; background: #0f2444; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; }
  .cu-prop .pt { font-size: 14.5px; font-weight: 600; }
  .cu-prop .pm { font-size: 12.5px; color: var(--ink-3); margin-top: 3px; }
  /* 回访待办 */
  .cu-rem { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; background: var(--surface); }
  .cu-rem + .cu-rem { border-top: .5px solid var(--line); }
  .cu-rem.pressable { cursor: pointer; }
  .cu-rem .ri { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex: none; font-size: 12px; font-weight: 700; }
  .cu-rem .ri.rule { background: var(--ai-soft); color: var(--ai); }
  .cu-rem .ri.next { background: var(--brand-soft); color: var(--brand-3); }
  .cu-rem .ri.mgr { background: #0f2444; color: #fff; }
  .cu-rem .ri.task { background: var(--warn-soft); color: #b45309; }
  .cu-rem .rt { font-size: 14.5px; font-weight: 600; line-height: 1.35; }
  .cu-rem .rm { font-size: 12.5px; color: var(--ink-3); margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px 6px; align-items: center; }
  .cu-foot-btns { display: flex; gap: 8px; }
  .cu-foot-btns .btn { flex: 1; padding: 0 8px; font-size: 14px; }
  `);

  /* ----------------------------------------------------------
     公共：数据范围 / 工具
     ---------------------------------------------------------- */
  const FILTERS = [
    { id: 'all', label: '全部' }, { id: 'mine', label: '我的' }, { id: 'new', label: '新开' }, { id: 'active', label: '合作中' },
    { id: 'A', label: 'A 主攻' }, { id: 'B', label: 'B 培育' }, { id: 'due', label: '待回访' }, { id: 'dup', label: '疑似重复' },
  ];
  S.isMe = (ownerId) => ownerId === App.me().id;
  // 数据范围（deck p31）：销售只见本人客户；KA 协同客户按分配可见；主管看直属团队
  S.scoped = function () {
    const st = App.state, me = App.me();
    if (App.isMgr()) return st.stores.slice();
    if (st.role === 'ka') return st.stores.filter((s) => s.ownerId === me.id);
    // 地推：本人客户 + 本人街道内同事负责的客户（仅展示负责人，避免重复打扰）
    const myStreets = new Set(st.stores.filter((s) => s.ownerId === me.id).map((s) => s.street));
    return st.stores.filter((s) => s.ownerId === me.id || myStreets.has(s.street));
  };
  S.scopeText = function () {
    const r = App.state.role;
    if (r === 'mgr') return '数据范围：本人与直属团队（地推一队 7 人）· 销售看本人客户';
    if (r === 'ka') return '数据范围：本人负责的集团客户及协作门店 · 协同客户按分配可见';
    return '数据范围：本人客户 · 主管看直属团队 · 同街道他人客户仅显示负责人';
  };
  S.isDue = (s) => !!(s.nextDue && App.fmt.days(s.nextDue) <= 0 && s.coop !== 'paused');
  S.applyFilter = function (list, f) {
    const me = App.me();
    switch (f) {
      case 'mine': return list.filter((s) => s.ownerId === me.id);
      case 'new': return list.filter((s) => s.isNew);
      case 'active': return list.filter((s) => s.coop === 'active');
      case 'A': case 'B': return list.filter((s) => s.tier === f);
      case 'due': return list.filter(S.isDue);
      case 'dup': return list.filter((s) => s.dupSuspect);
      default: return list;
    }
  };
  S.sortByVisit = (list) => list.slice().sort((a, b) => {
    if (!a.lastVisit && !b.lastVisit) return (b.updatedAt || '') < (a.updatedAt || '') ? -1 : 1;
    if (!a.lastVisit) return 1; if (!b.lastVisit) return -1;
    return a.lastVisit < b.lastVisit ? 1 : a.lastVisit > b.lastVisit ? -1 : 0;
  });
  S.shortName = (name) => String(name || '').replace(/（.*?）/g, '');
  S.glyph = (s) => `<div class="cu-av ${s.tier || 'pending'}">${esc(App.initials(s.name))}</div>`;
  S.ownerHtml = (s) => S.isMe(s.ownerId) ? `<span class="own"><b>负责人 ${esc(s.ownerName)}（我）</b></span>` : `<span class="own other">负责人 <b>${esc(s.ownerName)}</b></span>`;
  S.crmChip = function (s, opts) {
    const pending = s.route && s.route.trace === 'pending';
    return pending ? App.ui.chip('CRM 待同步', 'warn', Object.assign({ icon: 'cloud-off' }, opts)) : App.ui.chip(`CRM 已同步 ${App.fmt.hm(s.updatedAt) || '09:30'}`, 'ok', Object.assign({ icon: 'sync' }, opts));
  };
  S.maskPhone = function (s) {
    if (!s.contact || !s.contact.name) return '';
    let h = 0; for (const ch of s.id) h = (h * 31 + ch.charCodeAt(0)) % 10000;
    return `13${(h % 9) + 1}****${String(1000 + (h % 9000)).slice(0, 4)}`;
  };

  /* ----------------------------------------------------------
     customers · 客户列表（Tab 根）
     ---------------------------------------------------------- */
  S.setFilter = function (f) { App.state.ui.custFilter = f; App.save(); App.refresh(); };
  S.pickStreet = function () {
    const cur = App.state.ui.custStreet || '全部';
    const items = [{ label: '全部街道', sub: '不按街道筛选', icon: 'globe', right: cur === '全部' ? '当前' : '', onSelect: () => { App.state.ui.custStreet = '全部'; App.save(); App.refresh(); } }]
      .concat(App.state.streets.map((st) => ({ label: st.name, sub: `${st.district} · 计划 ${st.planned} 家`, icon: 'map-pin', right: cur === st.name ? '当前' : '', onSelect: () => { App.state.ui.custStreet = st.name; App.save(); App.refresh(); } })));
    App.sheet({ title: '按街道筛选（与路线 / 扫街辅助共用同一份客户表）', items });
  };
  S.sortInfo = function () { App.toast('按最近拜访排序 · 未拜访的排最后', { bottom: true, icon: 'list' }); };
  S.contactOwner = function (id) {
    const s = App.store(id); if (!s) return;
    App.modal({ title: '联系负责人', body: `<div>「${esc(s.name)}」由 <b>${esc(s.ownerName)}</b> 负责，避免重复打扰。</div><div class="muted small mt8">如需协同跟进，请通过主管「下发客户」或与负责人沟通；数据范围按组织与角色判定。</div>`, actions: [{ label: '取消', tone: 'ghost' }, { label: '发消息（演示）', tone: 'primary', onClick: () => App.toast(`已向 ${s.ownerName} 发送协同请求（演示）`, { icon: 'send' }) }] });
  };
  S.startVisit = function (id) { App.go('visit-start', { storeId: id }); };
  S.card = function (s) {
    const mine = S.isMe(s.ownerId);
    const chips = [
      App.ui.coopChip(s.coop),
      App.ui.tierChip(s.tier, { sm: false }),
      s.isNew ? App.ui.chip('新开', 'ai') : '',
      s.dupSuspect ? App.ui.chip('疑似重复', 'danger', { icon: 'alert' }) : '',
    ].filter(Boolean).join('');
    const last = s.lastVisit ? `上次 ${App.fmt.md(s.lastVisit)}${s.lastVisit === TODAY ? '（今天）' : ''}` : '未拜访';
    const next = s.lastNext ? ` · 下一步：<b>${esc(s.lastNext)}</b>` : (s.isNew ? ' · 门头 / 营业执照可识别' : ' · 下一步：待补充');
    const due = s.nextDue && s.coop !== 'paused' ? App.ui.chip(`回访 ${App.fmt.dueLabel(s.nextDue)}`, App.fmt.days(s.nextDue) < 0 ? 'danger' : App.fmt.days(s.nextDue) === 0 ? 'warn' : 'outline', { sm: true, icon: 'bell' }) : (s.coop === 'paused' ? App.ui.chip('停做 · 不生成回访', 'gray', { sm: true }) : '');
    const action = mine || App.isMgr()
      ? App.ui.btn('开始拜访', { tone: 'primary', size: 'sm', onclick: `event.stopPropagation();S_CUS.startVisit('${s.id}')` })
      : App.ui.btn('联系负责人', { tone: 'outline', size: 'sm', onclick: `event.stopPropagation();S_CUS.contactOwner('${s.id}')` });
    return `<div class="cu-card" onclick="App.go('customer',{id:'${s.id}'})">${S.glyph(s)}<div class="cu-body">
      <div class="cu-top"><div class="cu-name grow"><span>${esc(s.name)}</span>${s.alias ? `<span class="alias">${esc(s.alias)}</span>` : ''}</div><div class="cu-act">${action}</div></div>
      <div class="cu-chips">${chips}</div>
      <div class="cu-line ellipsis">${esc(s.category)} · ${esc(s.address)}</div>
      <div class="cu-line next ellipsis">${esc(last)}${next}</div>
      <div class="cu-foot">${due}${S.ownerHtml(s)}</div>
    </div></div>`;
  };
  S.list = function () {
    const ui = App.state.ui;
    const f = ui.custFilter || 'all';
    const street = ui.custStreet || '全部';
    let list = S.scoped();
    if (street !== '全部') list = list.filter((s) => s.street === street);
    const q = (ui.custQuery || '').trim();
    if (q) list = list.filter((s) => [s.name, s.alias, s.entity, s.address, s.category, s.ownerName, s.contact && s.contact.name].filter(Boolean).some((x) => String(x).includes(q)));
    return S.sortByVisit(S.applyFilter(list, f));
  };
  App.register('customers', {
    title: '客户', tab: 'customers',
    prd: ['deck p26 · 客户 360 与区域客户视图', 'deck p31 · 数据范围'],
    rules: ['与路线 / 扫街辅助读同一份客户表', '分层由规则计算不可手改', '疑似重复给出合并提示，由人确认', '同事负责的客户显示负责人，避免重复打扰'],
    render() {
      const ui = App.state.ui;
      const f = ui.custFilter || 'all';
      const street = ui.custStreet || '全部';
      const base = S.scoped();
      const scopedStreet = street === '全部' ? base : base.filter((s) => s.street === street);
      const counts = {}; FILTERS.forEach((x) => { counts[x.id] = S.applyFilter(scopedStreet, x.id).length; });
      const list = S.list();
      const me = App.me();
      const chips = FILTERS.map((x) => `<button class="fchip ${f === x.id ? 'active' : ''}" onclick="S_CUS.setFilter('${x.id}')">${esc(x.label)}<span class="count">${counts[x.id]}</span></button>`).join('');
      const cards = list.length ? `<div class="list">${list.map(S.card).join('')}</div>` : `<div class="list">${App.ui.empty({ icon: 'search', title: '没有符合条件的客户', sub: '换个筛选条件或搜索关键词试试', action: App.ui.btn('清除筛选', { tone: 'ghost', size: 'sm', onclick: "S_CUS.clearFilter()" }) })}</div>`;
      return `<div class="cu-head"><h1>客户 · ${base.length} 家</h1><div class="d">${esc(me.name)} · ${esc(me.roleName)} · ${App.isMgr() ? '本人与直属团队' : '本人客户'} · 与路线 / 扫街辅助共用一份客户表</div></div>
      <div class="cu-tools"><div class="search">${App.icon('search', 16)}<input id="cusSearch" placeholder="搜门店 / 主体 / 联系人 / 负责人" value="${esc(ui.custQuery || '')}"></div><button class="tb ${street !== '全部' ? 'on' : ''}" onclick="S_CUS.pickStreet()">${App.icon('map-pin', 14)}${esc(street === '全部' ? '街道' : street)}${App.icon('chevron-down', 12)}</button></div>
      <div class="filter-bar">${chips}</div>
      <div class="cu-meta"><span>${list.length} 家 · ${street === '全部' ? '全部街道' : esc(street)}${f !== 'all' ? ` · ${esc(FILTERS.find((x) => x.id === f).label)}` : ''}</span><span class="sort" onclick="S_CUS.sortInfo()">${App.icon('list', 13)}按最近拜访</span></div>
      ${cards}
      <div class="cu-scope">${App.icon('shield', 11)} ${esc(S.scopeText())}</div>`;
    },
    footer() { return App.ui.btn('拍照建档（新客户）', { tone: 'primary', block: true, icon: 'camera', onclick: "App.go('capture')" }); },
    mount(root) {
      const inp = root.querySelector('#cusSearch'); if (!inp) return;
      inp.oninput = () => {
        App.state.ui.custQuery = inp.value; App.save();
        // 只重绘列表区域，保留输入焦点
        const list = S.list();
        const lc = root.querySelector('.list'); const meta = root.querySelector('.cu-meta > span:first-child');
        if (lc) lc.outerHTML = list.length ? `<div class="list">${list.map(S.card).join('')}</div>` : `<div class="list">${App.ui.empty({ icon: 'search', title: '没有符合条件的客户', sub: '换个筛选条件或搜索关键词试试' })}</div>`;
        if (meta) meta.textContent = `${list.length} 家 · 匹配「${inp.value.trim()}」`;
      };
    },
    demoActions: [
      { label: '切到主管视角看全队', icon: 'users', run() { App.setRole('mgr'); App.tab('customers'); } },
      { label: '清除筛选', icon: 'refresh', run() { S.clearFilter(); } },
    ],
  });
  S.clearFilter = function () { const ui = App.state.ui; ui.custFilter = 'all'; ui.custStreet = '全部'; ui.custQuery = ''; App.save(); App.refresh(); };

  /* ----------------------------------------------------------
     customer · 客户 360（手机端）
     ---------------------------------------------------------- */
  // 金牌烤鸭店的报价单 v2（审批已通过 · 待发送）：state.proposals 为空时的演示兜底
  const DEMO_PROPOSALS = {
    s_jinpai: [{ id: 'g_jinpai', storeId: 's_jinpai', oppId: 'o_jinpai', title: '金牌烤鸭店 · 有害生物防治标准方案 + 报价单', version: 'v2', template: '连锁餐饮 · 标准方案 v3 / 标准报价单 v2', total: 14520, discount: 12, approval: '审批已通过', status: '待发送', updatedAt: '2026-09-06 16:02', validUntil: '2026-10-06', note: '折扣 12% 超阈值 10%，主管 李华 已审批通过' }],
    s_ka1: [{ id: 'g_ka1', storeId: 's_ka1', oppId: 'o_ka1', title: '华信张江工厂 · 食品工厂综合防治（AIB）方案 + 报价单', version: 'v2', template: '食品工厂 · 综合防治（AIB）方案 v1', total: 86400, discount: 8, approval: '审批中', status: '待审批', updatedAt: '2026-09-05 18:30', validUntil: '2026-10-05', note: '账期 60 天 + 一年两次风险勘查，提交主管审批' }],
  };
  S.proposalsOf = function (id) {
    const own = (App.state.proposals || []).filter((p) => p.storeId === id);
    if (own.length) return own;
    return DEMO_PROPOSALS[id] || [];
  };
  S.remindersOf = (id) => App.state.reminders.filter((r) => r.storeId === id);
  S.tasksAbout = function (s) {
    const key = S.shortName(s.name).slice(0, 3);
    return App.state.tasks.filter((t) => t.storeId === s.id || (t.title || '').includes(key) || (t.body || '').includes(key));
  };
  S.setTab = function (t) { App.state.ui.customerTab = t; App.save(); App.refresh(); };
  S.mergeHint = function (id) {
    const s = App.store(id);
    App.sheet({ title: `「${s.name}」疑似与已有客户重复 · 由人确认，不自动合并`, items: [
      { label: '仍新建', sub: '确认为不同门店，保留本条', icon: 'plus', onSelect: () => { s.dupSuspect = false; App.save(); App.refresh(); App.toast('已标记为独立客户 · 写入审计', { icon: 'check-circle' }); } },
      { label: '关联为子门店', sub: '挂到同主体的连锁门店下', icon: 'link', onSelect: () => { s.dupSuspect = false; App.save(); App.refresh(); App.toast('已关联为子门店 · 写入审计', { icon: 'link' }); } },
      { label: '合并到已有', sub: '保留已有客户，本条并入（关键动作写审计日志）', icon: 'layers', danger: true, onSelect: () => App.confirm('合并到已有客户？', '合并后拜访记录与商机一并归入已有客户；操作人、时间与前后值写入审计日志，不可删改。', () => { s.dupSuspect = false; App.save(); App.refresh(); App.toast('已合并 · 审计日志已记录', { icon: 'check-circle' }); }, '确认合并') },
    ] });
  };
  S.tierRuleInfo = function () {
    App.modal({ title: '分层由规则计算', body: `<div>四象限 A 主攻 / B 培育 / C 维护 / D 观察 由分层规则自动计算，销售端不可手改。</div><div class="mt8"><b>规则 ${esc(App.state.settings.tierRule)}</b></div><div class="muted small mt8">回访周期：A 7 天 · B 14 天 · C 30 天 · D 60 天（演示值）；规则在企业管理后台配置并带版本。</div>` });
  };
  S.hero = function (s) {
    const matched = !!s.entity;
    return `<div class="cu-hero">
      <div class="cat">${esc(s.category)} · ${esc(s.street)}${s.isNew ? ' · 新开' : ''}</div>
      <div class="nm"><span>${esc(s.name)}</span>${s.alias ? `<span class="alias">${esc(s.alias)}</span>` : ''}</div>
      <div class="ent">${App.icon('building', 14)}<span>${esc(s.entity || '工商主体待匹配')}</span>${matched ? `<span class="h-chip ok">${App.icon('check', 11)}工商主体 · 已匹配</span>` : `<span class="h-chip warn">${App.icon('alert', 11)}待匹配 · 拍营业执照</span>`}</div>
      <div class="addr">${App.icon('map-pin', 13)}<span>${esc(s.address)}</span></div>
      <div class="tags">${App.ui.coopChip(s.coop)}${App.ui.tierChip(s.tier)}${s.dupSuspect ? App.ui.chip('疑似重复', 'danger', { icon: 'alert' }) : ''}${S.crmChip(s)}</div>
      <div class="rule" onclick="S_CUS.tierRuleInfo()">分层由规则计算 · 规则 v3 · 不可手改 ›</div>
      <div class="own"><div class="a">${App.ui.avatar(s.ownerName)}<span>负责人 ${esc(s.ownerName)}${S.isMe(s.ownerId) ? '（我）' : ''}</span></div><span style="opacity:.75">${s.lastVisit ? `上次拜访 ${App.fmt.md(s.lastVisit)} · ${App.fmt.rel(s.lastVisit)}` : '尚未拜访'}</span></div>
    </div>`;
  };
  S.tabOverview = function (s) {
    const c = s.contact || {};
    const kv = [['联系人', c.name ? `${esc(c.name)} <span class="muted">· ${esc(c.role || '—')}</span>` : '<span class="chip warn sm">待补充</span>'], ['电话', c.name ? `${S.maskPhone(s)} <span class="muted">· 脱敏显示</span>` : '<span class="muted">—</span>']];
    if (s.coop === 'active') { kv.push(['合作起始', App.fmt.md(s.since || '')]); kv.push(['合同到期', s.contractEnd ? `${App.fmt.md(s.contractEnd)} <span class="muted">· ${App.fmt.days(s.contractEnd)} 天后 · 来自 CRM</span>` : '<span class="muted">—</span>']); kv.push(['服务项', (s.services || []).map((x) => App.ui.chip(x, 'brand', { sm: true })).join(' ') || '—']); }
    if (s.coop === 'paused') { kv.push(['停做时间', App.fmt.md(s.pausedAt || '')]); kv.push(['停做原因', esc(s.pausedReason || '—')]); }
    if (s.isNew) kv.push(['新开', `${App.fmt.md(s.newSince)} 起 <span class="muted">· 扫街发现</span>`]);
    if (s.group) kv.push(['所属集团', `${esc(s.group.name)} <span class="muted">· ${s.group.sites} 个站点 · 协作门店按分配可见</span>`]);
    kv.push(['回访周期', s.tier && s.tier !== 'pending' ? `${App.tierCycle(s.tier)} 天 <span class="muted">· 按分层规则</span>${s.nextDue ? ` · 下次 ${App.fmt.md(s.nextDue)}` : ''}` : '<span class="muted">待判定 · 归档后按规则计算</span>']);
    kv.push(['商机阶段', App.ui.stageChip(s.stage || '线索')]);
    const basic = `<div class="card"><div class="card-title">基本信息 ${App.ui.chip('三端共用同一份客户表', 'outline', { sm: true })}</div><dl class="cu-kv">${kv.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl></div>`;
    const next = `<div class="card"><div class="card-title">最近下一步</div>
      ${s.lastNext ? `<div class="cu-next"><div class="ni">${App.icon('flag', 18)}</div><div class="grow"><div class="nt">${esc(s.lastNext)}</div><div class="ns">来自 ${s.lastVisit ? App.fmt.md(s.lastVisit) : '上次'} 留痕 · ${s.nextDue ? `到期 ${App.fmt.md(s.nextDue)}（${App.fmt.dueLabel(s.nextDue)}）` : '未设到期'} · 已生成回访提醒</div></div></div>` : App.ui.notice('warn', '上次留痕未记录下一步（待补充）。下一步需同时有明确时间与动作，如「9月12日前送方案」。', 'alert')}
    </div>`;
    let complaint = '';
    if (s.complaint && s.complaint.status === 'open') complaint = `<div class="card cu-cmp"><div class="ct">${App.icon('alert', 16)}客诉 ${App.ui.complaintChip(s.complaint)}</div><div class="cb">${esc(s.complaint.date.slice(5).replace('-', '/'))} 未结客诉 · 服务部复处理中。${esc(s.complaint.summary)}</div><div class="cs">来自派单系统 · 处理结果回流后自动更新 · 拜访时请先回应客诉</div></div>`;
    else if (s.coop === 'active') complaint = `<div class="card"><div class="row between"><div class="card-title" style="margin:0">客诉</div>${App.ui.chip('近 90 天无客诉', 'ok', { sm: true, dot: true })}</div></div>`;
    const dup = s.dupSuspect ? App.ui.notice('danger', `<b>疑似重复</b>：与已有客户「${esc(S.shortName(s.name))}」名称 / 地址相近。合并提示由人确认，不自动合并。<a class="link" style="color:#991b1b;text-decoration:underline" onclick="S_CUS.mergeHint('${s.id}')">处理 ›</a>`, 'alert') : '';
    return dup + basic + next + complaint;
  };
  S.tabVisits = function (s) {
    const vs = App.visitsOf(s.id);
    const th = App.state.settings.threshold;
    if (!vs.length) return `<div class="card">${App.ui.empty({ icon: 'mic', title: '还没有留痕记录', sub: '拜访后「说一句留痕」，30 秒（设计目标）生成 16+4 项字段', action: App.ui.btn('说一句留痕', { tone: 'primary', size: 'sm', icon: 'mic', onclick: `App.go('record',{storeId:'${s.id}'})` }) })}</div>`;
    const items = vs.map((v) => {
      const ok = v.score.total >= th;
      const next = v.fields && v.fields['下一步'] && v.fields['下一步'].v;
      return `<div class="tl-item ${ok ? '' : 'warn'}" onclick="App.go('visit-detail',{id:'${v.id}'})">
        <div class="tl-time">${App.fmt.md(v.time)} ${App.fmt.hm(v.time)}${v.end ? `–${esc(v.end)}` : ''} · ${esc(v.by)} · ${esc(v.mode || '语音')}</div>
        <div class="tl-title">${App.ui.chip(v.type || '拜访', 'brand', { sm: true })}${App.ui.chip(`${v.score.total} 分`, ok ? 'ok' : 'warn', { sm: true })}${!ok ? `<span class="tiny" style="color:#b45309">低于门槛 ${th}</span>` : ''}</div>
        <div class="tl-body">${esc((v.transcript || '').slice(0, 40))}${(v.transcript || '').length > 40 ? '…' : ''}</div>
        ${next && next !== '—' ? `<div class="tl-body"><span class="muted">下一步：</span>${esc(next)}</div>` : ''}
        <div class="tl-foot">${App.ui.chip('已归档', 'gray', { sm: true, icon: 'check' })}${App.ui.chip('已同步', 'ok', { sm: true, icon: 'sync' })}${v.oppAction ? `<span>· ${esc(v.oppAction)}</span>` : ''}<span class="grow"></span>${App.icon('chevron-right', 14)}</div>
      </div>`;
    }).join('');
    return `<div class="card"><div class="row between mb8"><div class="card-title" style="margin:0">拜访时间线 · ${vs.length}</div><span class="muted tiny">门槛 ${th} 分 · 点开看原文与字段</span></div><div class="timeline cu-tl">${items}</div></div>
    ${App.ui.notice('gray', '原文、AI 抽取、人工修改与确认结果全部留痕，可复盘可审计；缺失字段标「待补充」，不编造。', 'shield')}`;
  };
  S.tabOpps = function (s) {
    const opps = App.oppsOf(s.id);
    if (!opps.length) return `<div class="card">${App.ui.empty({ icon: 'briefcase', title: '暂无商机', sub: '归档留痕后可选择「新建商机」', action: App.ui.btn('说一句留痕', { tone: 'primary', size: 'sm', icon: 'mic', onclick: `App.go('record',{storeId:'${s.id}'})` }) })}</div>`;
    const rows = opps.map((o) => `<div class="cu-opp" onclick="${o.proposalId || S.proposalsOf(s.id).length ? `App.go('gtm-result',{storeId:'${s.id}'})` : `App.toast('商机详情以 CRM 为准 · 演示')`}"><div class="oi ${o.stage === '已成交' ? 'ok' : (o.stage === '线索' || o.stage === '意向') ? 'brand' : ''}">${App.icon('briefcase', 18)}</div><div class="grow"><div class="ot">${esc(o.name)}</div><div class="om">${esc(o.amount)} · 负责人 ${esc(o.ownerName)} · 更新 ${App.fmt.md(o.updatedAt)}</div><div class="oc">${App.ui.stageChip(o.stage)}${o.approval ? App.ui.chip(`价格 ${o.approval}`, 'warn', { icon: 'clock' }) : ''}${o.proposalId ? App.ui.chip('方案已生成', 'ai', { icon: 'doc' }) : ''}</div></div>${App.icon('chevron-right', 16, 'muted')}</div>`).join('');
    return `<div class="list">${rows}</div>${App.ui.notice('gray', '商机与合同、回款留在贵司 CRM；本小程序只承接过程，阶段变化随留痕归档同步。', 'info')}`;
  };
  S.tabProposals = function (s) {
    const ps = S.proposalsOf(s.id);
    const rows = ps.map((p) => `<div class="cu-prop" onclick="App.go('gtm-result',{storeId:'${s.id}'})"><div class="pv">${esc(p.version || 'v1')}</div><div class="grow"><div class="pt ellipsis">${esc(p.title || `${S.shortName(s.name)} · 方案与报价`)}</div><div class="pm">${p.total != null ? `${App.fmt.money(p.total)}` : '报价待生成'}${p.discount != null ? ` · 折扣 ${p.discount}%` : ''} · ${App.fmt.md(p.updatedAt || TODAY)}</div><div class="chips mt4">${App.ui.chip(`报价单 ${esc(p.version || 'v1')}`, 'brand', { sm: true })}${p.approval ? App.ui.chip(p.approval, p.approval.includes('通过') ? 'ok' : 'warn', { sm: true, icon: p.approval.includes('通过') ? 'check' : 'clock' }) : App.ui.chip('规则内无需审批', 'gray', { sm: true })}${p.status ? App.ui.chip(p.status, p.status === '待发送' ? 'warn' : 'gray', { sm: true, icon: 'send' }) : ''}</div></div>${App.icon('chevron-right', 16, 'muted')}</div>`).join('');
    const head = `<div class="row between mb8" style="margin-top:2px"><div class="card-title" style="margin:0">方案与报价 · ${ps.length}</div>${App.ui.btn('新建', { tone: 'secondary', size: 'xs', icon: 'sparkle', onclick: `App.go('gtm',{storeId:'${s.id}'})` })}</div>`;
    const body = ps.length ? `<div class="list">${rows}</div>` : `<div class="card">${App.ui.empty({ icon: 'template', title: '还没有方案与报价', sub: '有意向即可用 GTM 助手生成六段方案 + 报价单', action: App.ui.btn('生成方案与报价', { tone: 'primary', size: 'sm', icon: 'sparkle', onclick: `App.go('gtm',{storeId:'${s.id}'})` }) })}</div>`;
    const note = ps.some((p) => p.note) ? App.ui.notice('info', ps.filter((p) => p.note).map((p) => esc(p.note)).join('；') + '。折扣超阈值 10% 需价格审批，销售端不能自批。', 'shield') : App.ui.notice('gray', '三类模版（方案 / 报价单 / 保险单）由贵司预置；折扣超阈值 10% 需价格审批，销售端不能自批。', 'info');
    return head + body + note;
  };
  S.tabTodos = function (s) {
    const rems = S.remindersOf(s.id).sort((a, b) => (a.due < b.due ? -1 : 1));
    const tasks = S.tasksAbout(s);
    const srcCls = (src) => src === '分层规则' ? 'rule' : src === '主管任务' ? 'mgr' : 'next';
    const srcGlyph = (src) => src === '分层规则' ? '分层' : src === '主管任务' ? '主管' : '约定';
    const remRows = rems.map((r) => {
      const done = r.status === 'done';
      const tone = done ? 'gray' : App.fmt.days(r.due) < 0 ? 'danger' : App.fmt.days(r.due) === 0 ? 'warn' : 'outline';
      return `<div class="cu-rem"><div class="ri ${srcCls(r.source)}">${srcGlyph(r.source)}</div><div class="grow"><div class="rt">${esc(r.note || (r.tier ? `${App.tierLabel(r.tier)} · ${r.cycle} 天周期回访` : '回访'))}</div><div class="rm"><span>来源 ${esc(r.source)}</span>${r.tier ? `<span>· ${App.tierLabel(r.tier)} · ${r.cycle} 天</span>` : ''}${App.ui.chip(done ? '已完成' : App.fmt.dueLabel(r.due), tone, { sm: true })}${r.status === 'deferred' || r.deferred ? App.ui.chip(`曾延期：${r.deferred ? r.deferred.reason : ''}`, 'gray', { sm: true }) : ''}${r.dedupNote ? App.ui.chip('同周期合并展示', 'ai', { sm: true }) : ''}</div></div>${!done ? App.ui.btn('开始拜访', { tone: 'secondary', size: 'xs', onclick: `S_CUS.startVisit('${s.id}')` }) : ''}</div>`;
    }).join('');
    const taskRows = tasks.map((t) => `<div class="cu-rem pressable" onclick="App.go('task',{id:'${t.id}'})"><div class="ri task">${esc(t.kind)}</div><div class="grow"><div class="rt">${esc(t.title)}</div><div class="rm"><span>来源 ${esc(t.source)}</span><span>· 截止 ${App.fmt.md(t.due)}</span>${App.ui.chip(t.status, t.status === '待接受' ? 'warn' : t.status === '执行中' ? 'brand' : 'gray', { sm: true })}</div></div>${App.icon('chevron-right', 16, 'muted')}</div>`).join('');
    const remSec = `${App.ui.section(`回访提醒 · ${rems.length}`, `<a onclick="App.go('reminders')">全部 ›</a>`)}${rems.length ? `<div class="list">${remRows}</div>` : `<div class="list">${App.ui.empty({ icon: 'bell', title: '暂无回访提醒', sub: '归档即按分层周期与下一步约定自动生成' })}</div>`}`;
    const taskSec = `${App.ui.section(`相关待办 · ${tasks.length}`, `<a onclick="App.go('tasks')">全部 ›</a>`)}${tasks.length ? `<div class="list">${taskRows}</div>` : `<div class="list">${App.ui.empty({ icon: 'check-circle', title: '暂无相关待办' })}</div>`}`;
    return remSec + taskSec + App.ui.notice('gray', '延期须填原因；同店同周期提醒合并展示；每条提醒带来源（分层规则 / 上次下一步约定 / 主管任务）。', 'info');
  };
  App.register('customer', {
    title: '客户档案', tab: 'customers',
    prd: ['deck p26 · 客户 360（手机端）', 'deck p31 · 去重匹配 / 数据范围'],
    rules: ['分层由规则计算不可手改（规则带版本）', 'CRM 同步状态在客户档案内可见', '疑似重复合并提示由人确认', '合同、回款留在 CRM，只承接过程'],
    nav(params) { const s = App.store(params.id); return { title: s ? S.shortName(s.name) : '客户档案' }; },
    render(params) {
      const s = App.store(params.id);
      if (!s) return App.ui.empty({ icon: 'store', title: '客户不存在', sub: '演示数据中没有该客户', action: App.ui.btn('返回客户列表', { tone: 'ghost', size: 'sm', onclick: "App.tab('customers')" }) });
      const tab = App.state.ui.customerTab || 'overview';
      const nV = App.visitsOf(s.id).length, nO = App.oppsOf(s.id).length, nP = S.proposalsOf(s.id).length, nT = S.remindersOf(s.id).filter((r) => r.status !== 'done').length + S.tasksAbout(s).filter((t) => t.status !== '已完成').length;
      const hot = S.remindersOf(s.id).some((r) => r.status !== 'done' && App.fmt.days(r.due) <= 0);
      const tabs = [['overview', '概览', ''], ['visits', '拜访', nV], ['opps', '商机', nO], ['props', '方案报价', nP], ['todos', '回访待办', nT]];
      const seg = `<div class="cu-tabs">${tabs.map(([id, l, n]) => `<button class="${tab === id ? 'active' : ''}" onclick="S_CUS.setTab('${id}')">${esc(l)}${n !== '' ? `<i class="${id === 'todos' && hot ? 'hot' : ''}">${n}</i>` : ''}</button>`).join('')}</div>`;
      const body = { overview: S.tabOverview, visits: S.tabVisits, opps: S.tabOpps, props: S.tabProposals, todos: S.tabTodos }[tab](s);
      return S.hero(s) + seg + body;
    },
    footer(params) {
      const s = App.store(params.id); if (!s) return '';
      return `<div class="cu-foot-btns">${App.ui.btn('开始拜访', { tone: 'primary', icon: 'play', onclick: `S_CUS.startVisit('${s.id}')` })}${App.ui.btn('说一句留痕', { tone: 'secondary', icon: 'mic', onclick: `App.go('record',{storeId:'${s.id}'})` })}${App.ui.btn('方案与报价', { tone: 'outline', icon: 'template', onclick: `App.go('gtm',{storeId:'${s.id}'})` })}</div>`;
    },
    demoActions: [
      { label: '模拟归档丙店（蜀香居）', icon: 'sparkle', run() { if (!App.state.demo.archived) DATA.archiveDemoVisit(App.state, 'good', '新建商机'); App.save(); App.refresh(); App.toast('已按归档后数据刷新'); } },
      { label: '模拟 CRM 同步', icon: 'sync', run() { const c = App.loading('同步到 CRM…'); setTimeout(() => { c(); App.toast('CRM 已同步（演示）', { icon: 'check-circle' }); }, 800); } },
    ],
  });
})();
