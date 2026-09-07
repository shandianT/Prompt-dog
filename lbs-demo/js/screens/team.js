/* ============================================================
   团队工作台（销售主管）· team.js
   - window.S_TEAM.render()：今日工作台在"团队"模式下调用，返回团队工作台正文
   - 注册页面：team（独立入口）/ team-member / team-blockers / team-reviews
   数据：App.state.team（members / blockers / reviews / unfollowed / trend）+ tasks / stores / opportunities
   ============================================================ */
(function () {
  'use strict';
  const T = window.S_TEAM = {};

  /* ---------- 页面专属样式（App.css 注入，不改 app.css） ---------- */
  App.css('team', `
.tm-filter { margin: 4px 0 12px; }
.tm-chip { height: 30px; padding: 0 10px 0 12px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line-2); font-size: 13px; font-weight: 500; color: var(--ink-2); display: inline-flex; align-items: center; gap: 4px; }
.tm-chip:active { background: var(--surface-2); }
.tm-chip.warn { border-color: #fdba74; color: #9a3412; background: #fff7ed; }
.tm-cap { font-size: 11.5px; color: var(--ink-3); margin: 8px 2px 0; display: flex; align-items: center; gap: 4px; line-height: 1.4; }
.tm-cap svg { flex: none; }
.tm-av-xs { width: 20px; height: 20px; font-size: 10.5px; }
.tm-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ink-4); flex: none; }
.tm-owner { flex: none; color: var(--ink-2); }
.tm-blocker .cell-title { font-size: 14.5px; }
.tm-blocker .cell-sub { overflow: hidden; }
.tm-c-ok { color: var(--brand); } .tm-c-info { color: var(--info); } .tm-c-danger { color: var(--danger); }
.tm-trow + .tm-trow { margin-top: 12px; }
.tm-trow .tm-stack { margin-top: 6px; }
.tm-stack { display: flex; height: 10px; border-radius: 5px; overflow: hidden; background: var(--surface-3); gap: 2px; }
.tm-stack i { display: block; height: 100%; }
.tm-stack i.ok { background: var(--brand); } .tm-stack i.info { background: var(--info); } .tm-stack i.danger { background: var(--danger); }
.tm-stack.empty { align-items: center; justify-content: center; font-size: 10.5px; color: var(--ink-3); height: 14px; }
.tm-legend { display: flex; gap: 12px; margin-top: 10px; font-size: 11px; color: var(--ink-3); flex-wrap: wrap; align-items: center; }
.tm-legend span { display: inline-flex; align-items: center; gap: 4px; }
.tm-legend i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
.tm-linkrow { padding-top: 10px; margin-top: 10px; border-top: .5px solid var(--line); }
.tm-bars .bar-row .bv { width: 64px; }
.tm-bars.wide .bar-row .bv { width: 96px; }
.tm-chart { width: 100%; height: auto; display: block; }
.tm-chart text { font-family: var(--font); }
.tm-member { padding: 12px 14px; }
.tm-mini { display: flex; gap: 12px; flex: none; }
.tm-mini > div { text-align: center; min-width: 32px; }
.tm-mini .n { font-size: 17px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
.tm-mini .l { font-size: 10.5px; color: var(--ink-3); margin-top: 2px; }
.tm-note { font-size: 11.5px; color: var(--ink-3); line-height: 1.5; padding: 3px 2px; display: flex; gap: 6px; align-items: flex-start; }
.tm-note svg { flex: none; margin-top: 2px; }
.tm-head { display: flex; align-items: center; gap: 12px; }
.tm-name { font-size: 18px; font-weight: 700; letter-spacing: -.01em; }
.tm-bcard .tm-btitle { font-size: 15px; font-weight: 600; line-height: 1.35; }
.tm-bcard .tm-chev { transition: transform .2s ease; color: var(--ink-3); flex: none; margin-top: 2px; }
.tm-bcard.open .tm-chev { transform: rotate(180deg); }
.tm-kv { display: flex; gap: 10px; font-size: 13.5px; margin-top: 8px; line-height: 1.5; }
.tm-kv .k { width: 46px; flex: none; color: var(--ink-3); white-space: nowrap; }
.tm-kv .v { flex: 1; min-width: 0; color: var(--ink); }
.tm-kv.ai .v { color: #3b3bb0; }
.tm-cmp { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.tm-cmp > div { border-radius: 12px; padding: 10px 12px; background: var(--surface-2); border: 1px solid var(--line); min-width: 0; }
.tm-cmp > div.ai { background: var(--ai-soft); border-color: #dfe2ff; }
.tm-cmp .e { font-size: 10.5px; font-weight: 700; letter-spacing: .04em; color: var(--ink-3); display: flex; align-items: center; justify-content: space-between; gap: 4px; }
.tm-cmp .big { font-size: 22px; font-weight: 700; margin-top: 6px; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.tm-cmp .ai .big { color: var(--ai); }
.tm-cmp .s { font-size: 11px; color: var(--ink-3); margin-top: 2px; line-height: 1.4; }
  `);
  const TODAY = '2026-09-07';
  const WEEK_START = '2026-09-01';
  const PERIOD = '本周 9/1–9/7';
  const UPDATED = '更新 09:30';
  const KIND_TONE = { 停滞: 'warn', 服务风险: 'danger', 承诺差异: 'violet', 逾期: 'danger' };
  const STAGES = { 地推: ['待触达', '已触达', '需求确认', '方案沟通', '报价商务'], KA: ['需求确认', '方案沟通', '报价商务', '待签约'] };
  const GROUPS = [{ id: '餐饮单店', icon: 'store' }, { id: '食品工厂', icon: 'building' }, { id: '全部客群', icon: 'layers' }];
  const DEFAULT_GROUP = { 地推: '餐饮单店', KA: '食品工厂' };
  const ORG = { 地推: '华东一区 · 地推组', KA: '华东 KA 组' };

  /* ---------- 取数与小工具 ---------- */
  const ui = () => (App.state.ui = App.state.ui || {});
  const seg = () => ui().teamSeg || '地推';
  const group = () => ui().teamGroup || DEFAULT_GROUP[seg()];
  const team = () => App.state.team;
  const members = (s) => team().members.filter((m) => m.role === (s || seg()));
  const member = (id) => App.by(team().members, 'id', id);
  const memberByName = (name) => team().members.find((m) => m.name === name);
  // 王磊 / 赵敏 的门店与任务在样本里以 ownerName 关联（ownerId 为 u_other），按 id 或姓名匹配
  const ownsTask = (m, t) => t.ownerId === m.id || t.ownerName === m.name;
  const ownsStore = (m, s) => s.ownerId === m.id || s.ownerName === m.name;
  const inSeg = (owner, ms) => ms.some((m) => m.name === owner);
  const hasData = () => group() === '全部客群' || group() === DEFAULT_GROUP[seg()];
  const av = (m, cls = '') => `<div class="avatar ${cls}" style="background:${m.color}">${App.esc(App.initials(m.name))}</div>`;
  const roleChip = (m) => App.ui.chip(m.role, m.role === 'KA' ? 'info' : 'brand', { sm: true });
  const sum = (arr, k) => arr.reduce((a, m) => a + (m[k] || 0), 0);
  const chev = (size = 16) => App.icon('chevron-right', size);
  const esc = App.esc;
  const noPerm = () => App.ui.empty({ icon: 'lock', title: '无权限查看团队数据', sub: `团队统计与下钻仅对授权主管开放（当前：${App.me().name} · ${App.me().roleName}）`, action: App.ui.btn('切换为销售主管', { tone: 'secondary', size: 'sm', onclick: "App.setRole('mgr')" }) });
  const note = (text, icon = 'shield') => `<div class="tm-note">${App.icon(icon, 13)}<span>${text}</span></div>`;
  const FOOT_NOTES = () => `<div class="mt8">${note('仅显示已授权团队（华东一区）范围内数据；不显示未经授权的跨区数据。')}${note('地推 / KA 分开比较，KA 不采用地推次数门槛；AI 不生成销售个人能力排名或自动绩效结论。', 'sparkle')}</div>`;

  /* ---------- 筛选 ---------- */
  T.setSeg = function (s) { ui().teamSeg = s; ui().teamGroup = DEFAULT_GROUP[s]; App.save(); App.refresh(); };
  T.pickGroup = function () {
    App.sheet({
      title: `按客群筛选 · 与地推 / KA 分开比较（当前 ${seg()}）`,
      items: GROUPS.map((g) => ({ label: g.id, icon: g.icon, right: g.id === group() ? '当前' : '', sub: g.id === '全部客群' ? '不跨区、不跨授权范围' : (g.id === DEFAULT_GROUP[seg()] ? `${seg()}团队本周样本所在客群` : `${seg()}团队本周无该客群样本`), onSelect() { ui().teamGroup = g.id; App.save(); App.refresh(); } })),
    });
  };
  T.drill = function (kind) {
    const ms = members();
    const def = kind === 'coverage'
      ? { t: '覆盖门店 · 计算明细：期间产生至少一条已确认触达记录的去重门店数（同店多次只算一次，纯拍照不算）', k: 'coverage' }
      : { t: '有效拜访 · 计算明细：符合已发布有效拜访规则且已生效的活动数（共同拜访按活动去重）', k: 'effective' };
    App.sheet({ title: def.t, items: ms.map((m) => ({ label: m.name, sub: `${m.role} · 覆盖 ${m.coverage} · 有效拜访 ${m.effective}`, icon: 'user', right: String(m[def.k]), onSelect() { App.go('team-member', { id: m.id }); } })) });
  };

  /* ---------- 计算 ---------- */
  function taskStats(ms) {
    const mine = App.state.tasks.filter((t) => ms.some((m) => ownsTask(m, t)));
    const day = (t) => (t.doneAt || t.due || '').slice(0, 10);
    const inWeek = (d) => d >= WEEK_START && d <= TODAY;
    const overdue = mine.filter((t) => t.status === 'todo' && t.due < TODAY).length;
    const today = { done: mine.filter((t) => t.status === 'done' && day(t) === TODAY).length, todo: mine.filter((t) => t.status === 'todo' && t.due === TODAY).length, overdue };
    const week = { done: mine.filter((t) => t.status === 'done' && inWeek(day(t))).length, todo: mine.filter((t) => t.status === 'todo' && t.due >= TODAY && inWeek(t.due)).length, overdue };
    const resched = mine.filter((t) => t.status === 'rescheduled' || t.status === 'cancelled').length;
    return { today, week, resched, onTime: { n: week.done, d: week.done + overdue } };
  }
  function stack(s) {
    const total = s.done + s.todo + s.overdue;
    if (!total) return '<div class="tm-stack empty"><span>暂无任务</span></div>';
    const w = (n) => ((n / total) * 100).toFixed(1) + '%';
    return `<div class="tm-stack">${s.done ? `<i class="ok" style="width:${w(s.done)}"></i>` : ''}${s.todo ? `<i class="info" style="width:${w(s.todo)}"></i>` : ''}${s.overdue ? `<i class="danger" style="width:${w(s.overdue)}"></i>` : ''}</div>`;
  }
  const trow = (label, s) => `<div class="tm-trow"><div class="row between"><span class="small bold">${label}</span><span class="tiny muted num"><b class="tm-c-ok">${s.done}</b> 完成 · <b class="tm-c-info">${s.todo}</b> 待办 · <b class="tm-c-danger">${s.overdue}</b> 逾期</span></div>${stack(s)}</div>`;
  function stageRows(ms, s) {
    const agg = {};
    ms.forEach((m) => Object.keys(m.stages || {}).forEach((k) => { agg[k] = (agg[k] || 0) + m.stages[k]; }));
    const total = Object.values(agg).reduce((a, b) => a + b, 0);
    return { total, rows: STAGES[s].map((st) => ({ label: st, value: agg[st] || 0, display: total ? `${agg[st] || 0} · ${Math.round(((agg[st] || 0) / total) * 100)}%` : '暂无数据' })) };
  }
  const fbRows = (ms) => ms.map((m) => ({ label: m.name, value: m.proposalsSent ? m.feedback / m.proposalsSent : 0, display: m.proposalsSent ? `${Math.round((m.feedback / m.proposalsSent) * 100)}%（${m.feedback}/${m.proposalsSent}）` : '暂无数据' }));

  /* ---------- 趋势图（内联 SVG，330 宽） ---------- */
  function trendSvg(tr) {
    const W = 330, H = 158, L = 30, R = 14, TP = 20, B = 26;
    const n = tr.weeks.length;
    const top = Math.ceil(Math.max(...tr.coverage, ...tr.effective) / 10) * 10 || 10;
    const x = (i) => L + (i * (W - L - R)) / (n - 1);
    const y = (v) => TP + (H - TP - B) * (1 - v / top);
    const f = (v) => v.toFixed(1);
    const pathOf = (a) => a.map((v, i) => `${i ? 'L' : 'M'}${f(x(i))},${f(y(v))}`).join(' ');
    const grid = [0, top / 2, top].map((v) => `<line x1="${L}" x2="${W - R}" y1="${f(y(v))}" y2="${f(y(v))}" stroke="#e2e6eb" stroke-width="1"${v ? ' stroke-dasharray="3 3"' : ''}/><text x="${L - 7}" y="${f(y(v) + 3.5)}" text-anchor="end" font-size="10.5" fill="#8a94a6">${v}</text>`).join('');
    const xl = tr.weeks.map((w, i) => `<text x="${f(x(i))}" y="${H - 7}" text-anchor="middle" font-size="10.5" fill="#8a94a6">${esc(w)}</text>`).join('');
    const series = (arr, color, above) => `<path d="${pathOf(arr)}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>` + arr.map((v, i) => `<circle cx="${f(x(i))}" cy="${f(y(v))}" r="3.5" fill="#fff" stroke="${color}" stroke-width="2"/><text x="${f(x(i))}" y="${f(y(v) + (above ? -8 : 15))}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${color}">${v}</text>`).join('');
    return `<svg class="tm-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="近 4 周覆盖门店与有效拜访趋势">${grid}${series(tr.coverage, '#0e8f6e', false)}${series(tr.effective, '#2563eb', true)}${xl}</svg>`;
  }

  /* ---------- 片段 ---------- */
  function blockerCell(b) {
    const m = memberByName(b.owner);
    const go = b.oppId ? `App.go('opportunity',{id:'${b.oppId}'})` : `App.go('customer',{id:'${b.storeId}'})`;
    return `<div class="cell pressable tm-blocker" onclick="${go}"><div class="cell-body"><div class="row gap6">${App.ui.chip(b.kind, KIND_TONE[b.kind] || 'gray', { sm: true })}<span class="cell-title ellipsis grow">${esc(b.title)}</span></div><div class="cell-sub row gap6 mt4">${m ? av(m, 'sm tm-av-xs') : ''}<span class="tm-owner">${esc(b.owner)}</span><span class="tm-dot"></span><span class="ellipsis grow">${esc(b.evidence)}</span></div></div><div class="cell-right">${chev()}</div></div>`;
  }
  function unfollowedCell(u) {
    const st = App.store(u.storeId);
    const hot = u.days >= 21;
    return App.ui.cell({
      title: esc(st ? st.name : u.storeId), icon: 'store', iconTone: hot ? 'danger' : 'warn',
      sub: `${st && st.street ? esc(st.street) + ' · ' : ''}负责人 ${esc(u.owner)} · ${st && st.lastVisit ? '上次 ' + App.fmt.md(st.lastVisit.date) + ' ' + esc(st.lastVisit.type) : '无有效触达记录'}`,
      right: App.ui.chip(`${u.days} 天未跟进`, hot ? 'danger' : 'warn', { sm: true }),
      onclick: `App.go('customer',{id:'${u.storeId}'})`,
    });
  }
  function memberCard(m) {
    return `<div class="card tight pressable tm-member" onclick="App.go('team-member',{id:'${m.id}'})"><div class="row gap12">${av(m)}<div class="grow"><div class="row gap6"><span class="bold ellipsis">${esc(m.name)}</span>${roleChip(m)}${m.overdue ? App.ui.chip(`超期 ${m.overdue}`, 'danger', { sm: true }) : ''}</div><div class="tiny muted mt4 ellipsis">${m.pendingConfirm ? `待确认记录 ${m.pendingConfirm}` : '无待确认记录'} · 方案反馈 ${m.proposalsSent ? `${m.feedback}/${m.proposalsSent}` : '暂无数据'}</div></div><div class="tm-mini"><div><div class="n">${m.coverage}</div><div class="l">覆盖</div></div><div><div class="n">${m.effective}</div><div class="l">有效</div></div></div>${chev()}</div></div>`;
  }
  const kpiDash = () => App.ui.kpis([
    { label: '覆盖门店', value: '—', sub: '暂无数据' }, { label: '有效拜访', value: '—', sub: '暂无数据' }, { label: '跟进超期', value: '—', sub: '暂无数据' }, { label: '待复核', value: '—', sub: '暂无数据' },
  ], true);
  const filterRow = (s, g, ok) => `<div class="row between tm-filter"><div class="seg" role="tablist"><button class="${s === '地推' ? 'active' : ''}" onclick="S_TEAM.setSeg('地推')">地推</button><button class="${s === 'KA' ? 'active' : ''}" onclick="S_TEAM.setSeg('KA')">KA</button></div><button class="tm-chip ${ok ? '' : 'warn'}" onclick="S_TEAM.pickGroup()">${App.icon('filter', 14)}${esc(g)}${App.icon('chevron-down', 14)}</button></div>`;

  /* ---------- 团队工作台正文 ---------- */
  T.render = function () {
    if (!App.isMgr()) return noPerm();
    const s = seg(), g = group(), ok = hasData(), ms = members(s), tm = team();
    if (!ok) {
      return filterRow(s, g, ok) + kpiDash() + `<div class="tm-cap">${PERIOD} · ${UPDATED} · 样本量 0</div>` +
        App.ui.empty({ icon: 'filter', title: '该筛选下暂无数据', sub: `${s} · ${g}：本周样本量 0，分母为零不显示 0%`, action: App.ui.btn(`恢复 ${DEFAULT_GROUP[s]}`, { tone: 'secondary', size: 'sm', onclick: `S_TEAM.setSeg('${s}')` }) }) + FOOT_NOTES();
    }
    const blockers = tm.blockers.filter((b) => inSeg(b.owner, ms));
    const unfollowed = tm.unfollowed.filter((u) => inSeg(u.owner, ms));
    const reviews = tm.reviews.filter((r) => inSeg(r.owner, ms));
    const cov = sum(ms, 'coverage'), eff = sum(ms, 'effective'), od = sum(ms, 'overdue');
    const ts = taskStats(ms);
    const sr = stageRows(ms, s);
    const sent = sum(ms, 'proposalsSent'), fb = sum(ms, 'feedback');

    let h = filterRow(s, g, ok);
    // KPI
    h += App.ui.kpis([
      { label: '覆盖门店', value: cov, tone: 'brand', sub: '去重门店', onclick: "S_TEAM.drill('coverage')" },
      { label: '有效拜访', value: eff, tone: 'info', sub: '已生效活动', onclick: "S_TEAM.drill('effective')" },
      { label: '跟进超期', value: od, tone: od ? 'danger' : '', sub: '到期未改期', onclick: "App.go('tasks',{filter:'超期'})" },
      { label: '待复核', value: reviews.length, tone: reviews.length ? 'warn' : '', sub: '分层不一致', onclick: "App.go('team-reviews')" },
    ], true);
    h += `<div class="tm-cap">${App.icon('clock', 12)}${PERIOD} · ${UPDATED} · 点击指标可下钻到计算明细</div>`;

    // 重点卡点
    h += App.ui.section('重点卡点', `<span class="pressable" onclick="App.go('team-blockers')">查看全部 ${chev(14)}</span>`, `${s} · ${blockers.length} 项`);
    h += blockers.length ? `<div class="list">${blockers.slice(0, 3).map(blockerCell).join('')}</div>` : App.ui.empty({ icon: 'check-circle', title: '暂无卡点', sub: '本周无停滞 / 服务风险 / 承诺差异 / 逾期' });

    // 未跟进客户
    h += App.ui.section('未跟进客户', `<span class="muted">超 7 天无有效跟进</span>`);
    h += unfollowed.length ? `<div class="list">${unfollowed.map(unfollowedCell).join('')}</div>` : App.ui.empty({ icon: 'check-circle', title: '无未跟进客户' });

    // 任务完成 + 待复核
    h += App.ui.section('任务完成', `<span class="muted">团队 · 完成 / 待办 / 逾期</span>`);
    h += `<div class="card">${trow('今日', ts.today)}${trow('本周', ts.week)}
      <div class="tm-legend"><span><i style="background:var(--brand)"></i>完成</span><span><i style="background:var(--info)"></i>待办</span><span><i style="background:var(--danger)"></i>逾期</span><span class="grow"></span><span>改期 / 取消单列：${ts.resched}</span></div>
      <div class="divider"></div>
      <div class="row between small"><span>回访按期完成 <b class="num">${ts.onTime.d ? `${ts.onTime.n}/${ts.onTime.d} · ${Math.round((ts.onTime.n / ts.onTime.d) * 100)}%` : '暂无数据'}</b></span><span class="tiny muted">改期不抹掉原始逾期</span></div>
      <div class="row between pressable tm-linkrow" onclick="App.go('team-reviews')"><div class="row gap6">${App.icon('compare', 16, 'muted')}<span class="small bold">待复核</span>${App.ui.chip('AI 建议 vs 正式分层', 'ai', { sm: true })}</div><div class="row gap4 small muted"><b class="num" style="color:var(--ink)">${reviews.length}</b> 项 ${chev(14)}</div></div>
    </div>`;

    // 阶段分布
    h += App.ui.section('阶段分布', `<span class="muted">正式阶段 · 商机 ${sr.total}</span>`);
    h += `<div class="card"><div class="tm-bars">${App.ui.bars(sr.rows)}</div><div class="tiny muted mt8">以正式阶段计（AI 建议不计入）；${s === 'KA' ? 'KA 看关键人覆盖、需求清晰度与阶段证据' : '地推 Playbook 七阶段，赢单仅来自权威签约事件'}。</div></div>`;

    // 方案反馈
    h += App.ui.section('方案反馈', `<span class="muted">${sent ? `团队 ${fb}/${sent} · ${Math.round((fb / sent) * 100)}%` : '暂无数据'}</span>`);
    h += `<div class="card"><div class="tm-bars wide">${App.ui.bars(fbRows(ms), 'info')}</div><div class="tiny muted mt8">口径：已确认发送方案的商机中，观察窗内获客户反馈的去重商机数 / 该批商机数（生成、导出不算已发送；分母为零显示暂无数据）。</div></div>`;

    // 基础趋势
    h += App.ui.section('基础趋势', `<span class="muted">近 4 周 · 周口径</span>`);
    if (s === '地推') {
      const tr = tm.trend;
      h += `<div class="card">${trendSvg(tr)}<div class="tm-legend"><span><i style="background:var(--brand)"></i>覆盖门店</span><span><i style="background:var(--info)"></i>有效拜访</span><span class="grow"></span><span>方案发送 ${tr.proposals.join(' · ')}</span></div><div class="tiny muted mt8">统计期间 8/11–9/7 · 更新 09:30 · 同店多次只算一次；趋势只作参考，不构成绩效结论。</div></div>`;
    } else {
      h += `<div class="card">${App.ui.notice('gray', 'KA 不采用地推次数口径，不展示拜访趋势；请看关键人覆盖、阶段证据与商务风险（P1 客户经营卡）。')}</div>`;
    }

    // 成员列表
    h += App.ui.section('成员', `<span class="muted">${ms.length} 人 · 按组织顺序，不排名</span>`);
    h += ms.map(memberCard).join('');
    h += FOOT_NOTES();
    return h;
  };

  /* ---------- 发起辅导 / 任务（必须指定责任人并确认） ---------- */
  T.coach = function (memberId, ctx = {}) {
    const m = member(memberId); if (!m) return;
    App.prompt(`发起辅导任务 · ${m.name}`, '任务内容，例如：复盘金牌烤鸭方案反馈，准备异议处理话术', (txt) => {
      const title = (txt || '').trim();
      if (!title) { App.toast('请填写任务内容', { icon: 'alert' }); return; }
      pickDue(title, m, ctx);
    }, '下一步');
  };
  T.taskFromBlocker = function (bid) {
    const b = App.by(team().blockers, 'id', bid); if (!b) return;
    const def = memberByName(b.owner);
    App.prompt('从卡点发起任务', `任务内容（留空则使用建议：${b.suggest}）`, (txt) => {
      const title = (txt || '').trim() || b.suggest;
      pickOwner(title, def, { storeId: b.storeId, oppId: b.oppId, blocker: b });
    }, '下一步：指定责任人');
  };
  function pickOwner(title, def, ctx) {
    App.sheet({
      title: '指定责任人（必填）· 不改变客户归属',
      items: team().members.map((m) => ({ label: m.name, sub: `${m.role} · 覆盖 ${m.coverage} · 超期 ${m.overdue}`, icon: 'user', right: def && m.id === def.id ? '当前负责人' : '', onSelect() { pickDue(title, m, ctx); } })),
    });
  }
  function pickDue(title, m, ctx) {
    const opts = [['+1 天', '2026-09-08'], ['+3 天', '2026-09-10'], ['+7 天', '2026-09-14']];
    App.sheet({ title: `截止日期 · 责任人 ${m.name}`, items: opts.map(([l, d]) => ({ label: `${l} · ${App.fmt.mdw(d)}`, icon: 'calendar', onSelect() { confirmTask(title, m, d, ctx); } })) });
  }
  function confirmTask(title, m, due, ctx) {
    const st = ctx.storeId ? App.store(ctx.storeId) : null;
    const body = App.ui.kv([
      ['责任人', `${esc(m.name)} · ${esc(m.role)}`],
      ['截止', `${App.fmt.mdw(due)}（${App.fmt.rel(due)}）`],
      ['内容', esc(title)],
      ['关联', st ? esc(st.name) : '无（辅导）'],
      ['来源', ctx.blocker ? `卡点 · ${esc(ctx.blocker.kind)}` : '主管分配'],
    ]) + '<div class="tiny muted mt8">创建后通知责任人，需其确认接受；本操作不改变客户归属。</div>';
    App.confirm('确认发起任务', body, () => {
      const t = {
        id: App.uid('t_coach'), storeId: ctx.storeId || null, oppId: ctx.oppId || null, title, type: ctx.blocker ? '跟进' : '辅导',
        ownerId: m.id, ownerName: m.name, due, time: '', status: 'todo', source: '主管分配',
        reason: `主管${App.me().name} 9/7 分配${ctx.blocker ? '（来自卡点：' + ctx.blocker.title + '）' : ''}`,
        evidence: ctx.blocker ? [ctx.blocker.evidence] : [], expected: '', accept: '待责任人确认', createdBy: App.me().id, createdAt: '2026-09-07 09:45',
      };
      App.state.tasks.unshift(t);
      App.save(); App.refresh();
      App.toast('已创建并通知责任人（需其确认）', { icon: 'check-circle' });
    }, '确认发起');
  }

  /* ---------- 复核（采纳 / 维持均需原因并留痕） ---------- */
  T.review = function (rid, decision) {
    const tm = team(); const r = App.by(tm.reviews, 'id', rid); if (!r) return;
    const o = App.opp(r.oppId); if (!o || !o.ai) { App.toast('缺少 AI 建议记录'); return; }
    const adopt = decision === 'adopt';
    App.prompt(adopt ? '采纳 AI 建议 · 复核原因（必填）' : '维持正式值 · 复核原因（必填）',
      adopt ? '例如：已与刘晓芸核实，吴总明确表示正在比较其他供应商' : '例如：客户口头不满但合同正常履行，先核实原因再定',
      (txt) => {
        const reason = (txt || '').trim();
        if (!reason) { App.toast('复核原因不能为空', { icon: 'alert' }); return; }
        const before = o.tier;
        if (adopt) { o.tier = o.ai.tier; o.tierSource = '主管复核 · 9/7'; }
        o.review = { decision: adopt ? '采纳建议' : '维持正式值', reason, by: App.me().name, at: '2026-09-07 09:45', officialBefore: before, aiTier: o.ai.tier };
        o.reviewNote = `${o.review.decision} · ${reason}（${App.me().name} 9/7）`;
        o.ai.reviewStatus = adopt ? '已采纳（主管复核）' : '已维持正式值（主管复核）';
        tm.reviews = tm.reviews.filter((x) => x.id !== rid);
        (tm.reviewed = tm.reviewed || []).unshift(Object.assign({}, r, { status: o.review.decision, reason, at: o.review.at, before, after: o.tier }));
        App.save(); App.refresh();
        App.toast(adopt ? `已采纳：分层 ${App.tierLabel(before)} → ${App.tierLabel(o.tier)}，已留痕` : '已维持正式值，原因已留痕', { icon: 'check-circle' });
      }, adopt ? '采纳并留痕' : '维持并留痕');
  };

  /* ---------- 页面：独立入口 ---------- */
  App.register('team', {
    title: '团队工作台', tab: 'today',
    prd: ['7 页面表·团队工作台', 'F08 团队管理与问数', '6.5 从拜访数量到经营动作', '12 指标定义'],
    rules: ['地推/KA 分开比较，不混算', '分母为零显示暂无数据不显示 0%', '每项指标可下钻到计算明细', '不显示未经授权的跨区数据', 'AI 不生成个人排名或绩效结论'],
    render() { return T.render(); },
  });

  /* ---------- 页面：成员下钻 ---------- */
  T._allStores = false;
  T.toggleStores = function () { T._allStores = !T._allStores; App.refresh(); };
  App.register('team-member', {
    nav(p) { const m = member(p.id); return { title: m ? `${m.name} · ${m.role}` : '成员', solid: true }; },
    tab: 'today',
    prd: ['F08 团队管理与问数（下钻）', '7 页面表·团队工作台', '13.1 权限矩阵·主管授权团队'],
    rules: ['只显示授权团队范围内的客户与任务', '按地推/KA 口径分别展示，不构成个人绩效结论', '发起辅导任务须指定责任人并确认，责任人需确认接受'],
    render(p) {
      if (!App.isMgr()) return noPerm();
      const m = member(p.id);
      if (!m) return App.ui.empty({ icon: 'user', title: '未找到成员', sub: '该成员不在你的授权团队范围内' });
      const tasks = App.state.tasks.filter((t) => ownsTask(m, t) && t.status === 'todo').sort((a, b) => (a.due < b.due ? -1 : 1));
      const overdueT = tasks.filter((t) => t.due < TODAY);
      const upcoming = tasks.filter((t) => t.due >= TODAY).slice(0, 4);
      const stores = App.state.stores.filter((st) => ownsStore(m, st));
      const shown = T._allStores ? stores : stores.slice(0, 5);
      const sr = stageRows([m], m.role);
      const fbr = m.proposalsSent ? `${Math.round((m.feedback / m.proposalsSent) * 100)}%（${m.feedback}/${m.proposalsSent}）` : '暂无数据';
      const taskCell = (t) => {
        const late = t.due < TODAY;
        return App.ui.cell({ title: esc(t.title), icon: late ? 'alert' : 'clock', iconTone: late ? 'danger' : 'info', sub: `${App.fmt.dueLabel(t.due)}${t.time ? ' ' + t.time : ''} · ${esc(t.source)}${t.accept ? ' · ' + esc(t.accept) : ''}`, right: late ? App.ui.chip('逾期', 'danger', { sm: true }) : App.ui.taskStatusChip(t.status), onclick: `App.go('task',{id:'${t.id}'})` });
      };
      const storeCell = (st) => {
        const o = App.primaryOpp(st.id);
        return App.ui.cell({ title: esc(st.name), icon: 'store', iconTone: st.coop === 'active' ? '' : 'gray', sub: `<span class="row gap4 wrap">${App.ui.coopChip(st.coop)}${o ? App.ui.stageChip(o.stage) + App.ui.tierChip(o.tier, { sm: true }) : App.ui.chip('无当前商机', 'gray', { sm: true })}${App.ui.complaintChip(st.complaint)}</span>`, onclick: `App.go('customer',{id:'${st.id}'})` });
      };
      let h = `<div class="card"><div class="tm-head">${av(m, 'lg')}<div class="grow"><div class="row gap6"><span class="tm-name">${esc(m.name)}</span>${roleChip(m)}</div><div class="small muted mt4">${esc(ORG[m.role])} · 授权团队范围内</div></div></div><div class="tm-cap">${App.icon('clock', 12)}${PERIOD} · ${UPDATED} · ${m.role} 口径</div></div>`;
      h += App.ui.kpis([
        { label: '覆盖门店', value: m.coverage, tone: 'brand', sub: '去重门店' },
        { label: '有效拜访', value: m.effective, tone: 'info', sub: '已生效活动' },
        { label: '跟进超期', value: m.overdue, tone: m.overdue ? 'danger' : '', sub: '到期未改期' },
        { label: '待确认', value: m.pendingConfirm, tone: m.pendingConfirm ? 'warn' : '', sub: '拜访记录' },
      ], true);
      h += App.ui.section('阶段分布', `<span class="muted">正式阶段 · 商机 ${sr.total}</span>`);
      h += `<div class="card"><div class="tm-bars">${App.ui.bars(sr.rows)}</div><div class="divider"></div><div class="row between small"><span>方案反馈率 <b class="num">${fbr}</b></span><span class="tiny muted">已发送 ${m.proposalsSent} · 观察窗内反馈 ${m.feedback}</span></div></div>`;
      h += App.ui.section('超期与待办任务', `<span class="${overdueT.length ? 'tm-c-danger' : 'muted'}">${overdueT.length} 项超期</span>`);
      h += (overdueT.length || upcoming.length) ? `<div class="list">${overdueT.map(taskCell).join('')}${upcoming.map(taskCell).join('')}</div>` : App.ui.empty({ icon: 'check-circle', title: '暂无待办任务' });
      h += App.ui.section('负责客户', `<span class="muted">${stores.length} 家</span>`);
      h += stores.length ? `<div class="list">${shown.map(storeCell).join('')}${stores.length > 5 ? `<div class="cell pressable" onclick="S_TEAM.toggleStores()"><div class="cell-body" style="text-align:center;color:var(--brand);font-size:14px;font-weight:500">${T._allStores ? '收起' : `展开全部 ${stores.length} 家`}</div></div>` : ''}</div>` : App.ui.empty({ icon: 'store', title: '暂无负责客户' });
      h += `<div class="mt8">${note('数据为该成员授权范围内的客户与任务；不展示跨区数据。指标不构成个人绩效结论。')}</div>`;
      return h;
    },
    footer(p) { const m = member(p.id); return m && App.isMgr() ? App.ui.btn('发起辅导任务', { block: true, icon: 'coach', onclick: `S_TEAM.coach('${m.id}')` }) : ''; },
  });

  /* ---------- 页面：卡点清单 ---------- */
  T._open = null;
  T.toggle = function (id) { const s = T._open || (T._open = new Set()); if (s.has(id)) s.delete(id); else s.add(id); App.refresh(); };
  T.setKind = function (k) { ui().blockerKind = k; App.save(); App.refresh(); };
  App.register('team-blockers', {
    title: '卡点清单', tab: 'today',
    prd: ['F08 团队管理与问数', '6.5 从拜访数量到经营动作', '7 页面表·团队工作台'],
    rules: ['从卡点发起辅导或任务，必须指定责任人并确认', '证据为已确认事实；建议为 AI 派生，不改正式值', '不由问数或建议自动改客户归属', '责任人需确认接受任务'],
    render() {
      if (!App.isMgr()) return noPerm();
      const all = team().blockers;
      const kind = ui().blockerKind || '全部';
      if (!T._open) T._open = new Set(all.length ? [all[0].id] : []);
      const kinds = ['全部'].concat(all.map((b) => b.kind).filter((k, i, a) => a.indexOf(k) === i));
      const list = all.filter((b) => kind === '全部' || b.kind === kind);
      let h = `<div class="filter-bar">${kinds.map((k) => `<button class="fchip ${k === kind ? 'active' : ''}" onclick="S_TEAM.setKind('${k}')">${esc(k)}<span class="count">${k === '全部' ? all.length : all.filter((b) => b.kind === k).length}</span></button>`).join('')}</div>`;
      h += `<div class="tm-cap" style="margin-top:0;margin-bottom:10px">${App.icon('info', 12)}${list.length} 项 · 按已发布规则识别 · ${UPDATED}</div>`;
      if (!list.length) h += App.ui.empty({ icon: 'check-circle', title: '该类型暂无卡点' });
      h += list.map((b) => {
        const m = memberByName(b.owner); const st = App.store(b.storeId); const open = T._open.has(b.id);
        const go = b.oppId ? `App.go('opportunity',{id:'${b.oppId}'})` : `App.go('customer',{id:'${b.storeId}'})`;
        return `<div class="card tm-bcard ${open ? 'open' : ''}"><div class="row top gap12 pressable" onclick="S_TEAM.toggle('${b.id}')"><div class="grow"><div class="row gap6">${App.ui.chip(b.kind, KIND_TONE[b.kind] || 'gray', { sm: true })}${m ? roleChip(m) : ''}${b.oppId ? App.ui.chip('商机', 'gray', { sm: true }) : ''}</div><div class="tm-btitle mt4">${esc(b.title)}</div><div class="row gap6 small muted mt4">${m ? av(m, 'sm tm-av-xs') : ''}<span>${esc(b.owner)}</span><span class="tm-dot"></span><span class="ellipsis">${esc(st ? st.street || st.district : '')}</span></div></div>${App.icon('chevron-down', 18, 'tm-chev')}</div>
          ${open ? `<div class="divider"></div>
          <div class="tm-kv"><div class="k">证据</div><div class="v">${esc(b.evidence)} ${App.ui.factTag('fact')}</div></div>
          <div class="tm-kv ai"><div class="k">建议</div><div class="v">${esc(b.suggest)} ${App.ui.factTag('derived')}</div></div>
          <div class="btn-row mt12">${App.ui.btn('打开证据', { tone: 'outline', size: 'sm', icon: 'file', onclick: go })}${App.ui.btn('发起任务', { tone: 'primary', size: 'sm', icon: 'coach', onclick: `S_TEAM.taskFromBlocker('${b.id}')` })}</div>` : ''}
        </div>`;
      }).join('');
      h += `<div class="mt8">${note('从卡点发起的任务必须指定责任人并确认，责任人收到后需确认接受；建议为 AI 派生，不改正式阶段 / 分层，不改客户归属。', 'sparkle')}</div>`;
      return h;
    },
  });

  /* ---------- 页面：待复核 ---------- */
  App.register('team-reviews', {
    title: '待复核', tab: 'today',
    prd: ['F08 团队管理与问数', '6.4 258 建议与回访规则', '13.1 权限矩阵·主管复核留痕'],
    rules: ['AI 建议与正式分层不一致进入复核，不自动降级、不改跟进责任', '维持 / 采纳均需填写原因并留痕', '修正事实优先；人工结论与 AI 建议分别存储'],
    render() {
      if (!App.isMgr()) return noPerm();
      const tm = team(); const rs = tm.reviews; const done = tm.reviewed || [];
      let h = App.ui.notice('info', '复核规则：AI 分层建议与正式值不一致时进入复核；<b>修正事实优先</b>，人工结论与 AI 建议分别存储，采纳后才改正式值。');
      if (!rs.length) h += App.ui.empty({ icon: 'check-circle', title: '暂无待复核', sub: '所有 AI 分层建议与正式值一致或已处理' });
      h += rs.map((r) => {
        const o = App.opp(r.oppId); const st = App.store(r.storeId); const m = memberByName(r.owner); const ai = o && o.ai;
        if (!o || !ai) return `<div class="card">${esc(r.title)}<div class="small muted">缺少商机或 AI 建议记录</div></div>`;
        return `<div class="card">
          <div class="row top gap12">${m ? av(m) : ''}<div class="grow"><div class="tm-btitle">${esc(r.title)}</div><div class="small muted mt4">${esc(st ? st.name : '')} · 负责人 ${esc(r.owner)} · ${esc(o.service)} · ${esc(o.kind)}</div></div>${App.ui.chip(r.status, 'warn', { sm: true })}</div>
          <div class="mt12">${App.ui.notice('warn', `<b>冲突</b>：${esc(r.reason)}${ai.conflict ? '<br><span class="tiny">' + esc(ai.conflict) + '</span>' : ''}`)}</div>
          <div class="tm-cmp"><div><div class="e"><span>正式分层</span>${App.ui.factTag('official')}</div><div class="big">${App.tierLabel(o.tier)}</div><div class="s">${esc(o.tierSource)} · 阶段 ${esc(o.stage)}</div></div><div class="ai"><div class="e"><span>AI 建议</span>${App.ui.factTag('derived')}</div><div class="big">${App.tierLabel(ai.tier)}</div><div class="s">置信度 ${esc(ai.confidence)} · 不改正式值</div></div></div>
          <div class="tm-kv"><div class="k">依据</div><div class="v">${(ai.basis || []).map(esc).join('；')}</div></div>
          <div class="tm-kv"><div class="k">缺失</div><div class="v">${(ai.missing || []).map(esc).join('、') || '—'}</div></div>
          <div class="tm-kv"><div class="k">下一步</div><div class="v">${(ai.next || []).map(esc).join('；')}</div></div>
          <div class="mt12">${App.ui.btn('查看商机推进卡', { tone: 'outline', size: 'sm', icon: 'briefcase', block: true, onclick: `App.go('opportunity',{id:'${o.id}'})` })}</div>
          <div class="btn-row mt8">${App.ui.btn('维持正式值', { tone: 'ghost', onclick: `S_TEAM.review('${r.id}','keep')` })}${App.ui.btn('采纳建议', { tone: 'primary', icon: 'check', onclick: `S_TEAM.review('${r.id}','adopt')` })}</div>
          <div class="mt8">${note('两种结论均需填写原因并留痕；采纳后正式分层来源记为"主管复核 · 9/7"，AI 建议原文保留。', 'info')}</div>
        </div>`;
      }).join('');
      if (done.length) {
        h += App.ui.section('已处理', `<span class="muted">${done.length} 项 · 已留痕</span>`);
        h += `<div class="list">${done.map((d) => App.ui.cell({ title: esc(d.title), icon: 'history', iconTone: 'gray', sub: `${esc(d.status)} · ${App.tierLabel(d.before)} → ${App.tierLabel(d.after)} · 原因：${esc(d.reason)}`, right: App.ui.chip(d.status === '采纳建议' ? '已采纳' : '已维持', d.status === '采纳建议' ? 'brand' : 'gray', { sm: true }), onclick: `App.go('opportunity',{id:'${d.oppId}'})` })).join('')}</div>`;
      }
      h += `<div class="mt8">${note('修正事实优先：若冲突源于拜访事实错误，应先纠错（需原因）再复核分层；人工结论与 AI 建议分别存储。')}</div>`;
      return h;
    },
  });
})();
