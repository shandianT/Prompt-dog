/* ============================================================
   客户详情（customer）+ 申请协作（collab-request）
   PRD 7 页面表「客户详情」· F01 · F02 · F05（未结客诉优先）
   ============================================================ */
(function () {
  'use strict';
  const esc = App.esc;

  App.css('cdt', `
    .cdt-head { padding: 14px 16px 12px; }
    .cdt-head .nm { font-size: 19px; font-weight: 700; letter-spacing: -.01em; line-height: 1.25; }
    .cdt-head .meta { font-size: 12.5px; color: var(--ink-3); margin-top: 3px; }
    .cdt-addr { display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--ink-2); margin-top: 6px; }
    .cdt-addr svg { flex: none; color: var(--ink-3); }
    .cdt-head .kv { font-size: 13px; gap: 7px 10px; grid-template-columns: 72px 1fr; }
    .cdt-head .kv dd { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .cdt-quick { margin-bottom: 12px; }
    .cdt-quick .quick { width: 100%; }
    .cdt-quick .quick.dis { opacity: .5; }
    .cdt-tabs { position: sticky; top: -1px; z-index: 4; background: var(--bg); padding: 6px 0 8px; margin-bottom: 2px; }
    .cdt-tabs .seg button { padding: 0 2px; font-size: 13px; }
    .cdt-lock { width: 56px; height: 56px; border-radius: 18px; background: var(--gray-soft); color: var(--ink-3); display: flex; align-items: center; justify-content: center; margin: 0 auto; }
    .cdt-opp .cell-title { font-size: 14.5px; }
    .cdt-opp .chips { margin-top: 5px; }
    .cdt-cm .cell-title { font-size: 14px; font-weight: 500; }
    .cdt-cm .cell-title .chip { flex: none; }
    .cdt-note { display: flex; gap: 6px; align-items: flex-start; font-size: 11.5px; color: var(--ink-3); line-height: 1.5; padding: 2px 4px 0; margin-bottom: 12px; }
    .cdt-note svg { flex: none; margin-top: 2px; }
    .cdt-tl .tl-title { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .cdt-tl .tl-title .chip { flex: none; }
    .cdt-prop .kv { font-size: 12.5px; gap: 5px 10px; grid-template-columns: 62px 1fr; margin-top: 10px; }
    .cdt-form .form-item.ta { align-items: flex-start; }
    .cdt-form .form-item .seg button { height: 28px; padding: 0 12px; font-size: 12.5px; }
    .cdt-summary { display: flex; gap: 8px; margin-bottom: 10px; }
    .cdt-summary .kpi { padding: 10px 10px; }
    .cdt-summary .kpi .v { font-size: 18px; }
  `);

  const S = window.S_CDT = {};
  const U = () => (App.state.ui = App.state.ui || {});
  const TABS = [['overview', '概览'], ['timeline', '时间线'], ['contacts', '联系人'], ['opps', '商机'], ['commit', '承诺'], ['proposals', '方案']];
  const ownerOf = (st) => Object.values(App.state.users).find((u) => u.id === st.ownerId) || { name: st.ownerName || '—' };
  const isMine = (st) => st.ownerId === App.me().id;
  const shortMd = (d) => (d ? `${+d.slice(5, 7)}/${+d.slice(8, 10)}` : '');
  const shortDt = (d) => (d ? shortMd(d) + (d.length > 10 ? ' ' + d.slice(11, 16) : '') : '');
  const ymdDot = (d) => (d ? d.slice(0, 10).replace(/-/g, '.') : '—');
  const tlTime = (d) => (d ? `${App.fmt.md(d.slice(0, 10))}${d.length > 10 ? ' ' + d.slice(11, 16) : ''}` : '');
  const sortKey = (d) => ((d || '').length > 10 ? d : (d || '') + ' 12:00');
  const tomorrow = () => { const d = new Date(App.dayjs(App.TODAY).getTime() + 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const DEC_TONE = { 对接人: 'info', 决策人: 'brand', 使用方: 'gray', 采购方: 'violet' };
  const KIND_TONE = { 新购: 'info', 续约: 'brand', 增购: 'violet' };
  const PROP_STATUS = { draft: ['草稿', 'gray'], generated: ['已生成', 'info'], confirmed: ['已确认', 'brand'], exported: ['已导出', 'info'], marked_sent: ['已标记发送', 'ok'], internal_draft: ['内部草稿', 'warn'], pending_review: ['待技术复核', 'warn'] };
  const storeChips = (st) => (window.S_CUS ? S_CUS.storeChips(st) : App.ui.coopChip(st.coop) + App.ui.complaintChip(st.complaint));
  const todo = (st) => App.tasksOf(st.id).filter((t) => t.status === 'todo').sort((a, b) => ((a.due + (a.time || '')) < (b.due + (b.time || '')) ? -1 : 1));
  const note = (text, icon) => `<div class="cdt-note">${App.icon(icon || 'info', 13)}<span>${text}</span></div>`;

  /* ---------- 头部 ---------- */
  function header(st) {
    const own = ownerOf(st); const mine = isMine(st);
    const kv = [['负责人', `${App.ui.avatar(own.name, 'sm' + (mine ? '' : ' gray'))}<span>${mine ? `本人（${esc(own.name)}）` : esc(own.name)}</span>`]];
    if (st.group) { kv.push(['集团', esc(st.group.name)]); kv.push(['签约主体', esc(st.group.entity)]); kv.push(['服务门店', `${st.group.sites} 家 · 本店为其中之一`]); }
    if (st.coop === 'active') { const n = App.fmt.days(st.contractEnd); kv.push(['合同期', `${ymdDot(st.since)} – ${ymdDot(st.contractEnd)}${n != null ? ` <span class="${n <= 90 ? 'chip warn sm' : 'muted'}">${n < 0 ? '已到期' : n + ' 天后到期'}</span>` : ''}`]); }
    if (st.coop === 'paused') kv.push(['停做原因', `${App.ui.chip(`${shortMd(st.pausedAt)} 停做`, 'danger', { sm: true })}<span>${esc(st.pausedReason || '—')}</span>`]);
    if (st.services && st.services.length) kv.push(['服务项目', esc(st.services.join(' / '))]);
    kv.push(['数据更新', `${esc(st.updatedAt)} ${App.ui.factTag('official')}`]);
    return `<div class="card cdt-head">
      <div class="row top gap6"><div class="grow"><div class="nm">${esc(st.name)}</div><div class="meta">${esc(st.type)}</div></div>${st.alias ? App.ui.chip(st.alias, 'gray') : ''}</div>
      <div class="cdt-addr">${App.icon('map-pin', 14)}<span>${esc(st.district || '')} · ${esc(st.address)}</span></div>
      <div class="chips mt8">${storeChips(st)}</div>
      <div class="divider"></div>
      ${App.ui.kv(kv)}
    </div>`;
  }
  function actions(st) {
    const opp = App.primaryOpp(st.id);
    return `<div class="quick-grid cdt-quick">
      <button class="quick pressable" onclick="S_CDT.visit('${st.id}')"><div class="qi brand">${App.icon('camera', 20)}</div>记录拜访</button>
      <button class="quick pressable ${opp ? '' : 'dis'}" onclick="S_CDT.proposal('${st.id}')"><div class="qi info">${App.icon('doc', 20)}</div>发起方案</button>
      <button class="quick pressable" onclick="App.tab('assistant')"><div class="qi violet">${App.icon('question', 20)}</div>问答</button>
      <button class="quick pressable" onclick="S_CDT.newTask('${st.id}')"><div class="qi warn">${App.icon('flag', 20)}</div>建任务</button>
    </div>`;
  }
  function tabs(cur) {
    return `<div class="cdt-tabs"><div class="seg block">${TABS.map(([id, l]) => `<button class="${id === cur ? 'active' : ''}" data-tab="${id}" onclick="S_CDT.tab('${id}')">${l}</button>`).join('')}</div></div>`;
  }

  /* ---------- 概览 ---------- */
  function complaintBlock(st) {
    const c = st.complaint || {};
    if (c.status === 'open') {
      const task = App.tasksOf(st.id).find((t) => t.type === '客诉跟进' && t.status === 'todo');
      return App.ui.notice('danger', `<b>未结客诉</b>（${esc(shortMd(c.date))}）：${esc(c.summary || '')}<div class="mt4"><b>先了解 / 协调服务问题</b>，再谈续约或新商机；AI 不建立额外收费商机。</div><div class="tiny mt4" style="opacity:.75">${esc(c.source || '')}</div>${task ? `<div class="mt8">${App.ui.btn('查看客诉跟进任务', { tone: 'danger', size: 'xs', icon: 'flag', onclick: `App.go('task',{id:'${task.id}'})` })}</div>` : ''}`, 'alert');
    }
    if (c.status === 'stale') return App.ui.notice('warn', `<b>客诉数据待更新</b>：${esc(c.summary || '同步过期')}${c.date ? `（最近同步 ${esc(shortMd(c.date))}）` : ''}。同步恢复前不按"无客诉"处理。`, 'clock');
    if (c.status === 'not_connected') return App.ui.notice('gray', '<b>客诉系统未接入</b>：无法判断是否存在客诉，不显示"无客诉"。', 'cloud-off');
    return '';
  }
  function complaintText(c) {
    if (!c || c.status === 'none') return '<span class="muted">无未结客诉</span>';
    if (c.status === 'closed') return `${App.ui.complaintChip(c)}`;
    return `${App.ui.complaintChip(c)}${c.source ? `<span class="muted tiny">${esc(c.source)}</span>` : ''}`;
  }
  function oppRow(o) {
    return `<div class="cell pressable cdt-opp" onclick="App.go('opportunity',{id:'${o.id}'})">
      <div class="cell-body"><div class="cell-title row gap6"><span class="ellipsis">${esc(o.service)}</span>${App.ui.chip(o.kind, KIND_TONE[o.kind] || 'gray', { sm: true })}</div>
        <div class="chips">${App.ui.stageChip(o.stage)}${App.ui.tierChip(o.tier)}${o.ai ? App.ui.chip('AI 建议', 'ai', { icon: 'sparkle' }) : ''}${o.ai && o.ai.reviewStatus ? App.ui.chip(o.ai.reviewStatus, 'warn', { sm: true }) : ''}</div>
        <div class="cell-sub">分层来源：${esc(o.tierSource)}${o.stallReason ? ` · 停滞：${esc(o.stallReason)}` : ''}</div></div>
      <div class="cell-right">${App.icon('chevron-right', 16)}</div></div>`;
  }
  function taskCell(t) {
    const n = App.fmt.days(t.due);
    const when = n === 0 ? '今日' : n === 1 ? '明天' : n < 0 ? `逾期 ${-n} 天` : App.fmt.md(t.due);
    return App.ui.cell({ title: esc(t.title), badge: App.ui.chip(t.type, 'gray', { sm: true }), sub: `${when}${t.time ? ' ' + t.time : ''} · 来源：${esc(t.source)}${t.reason ? ' · ' + esc(t.reason) : ''}`, icon: n < 0 ? 'alert' : 'flag', iconTone: n < 0 ? 'danger' : n === 0 ? '' : 'info', right: n < 0 ? App.ui.chip('逾期', 'danger', { sm: true }) : '', onclick: `App.go('task',{id:'${t.id}'})` });
  }
  function overview(st) {
    const opps = App.oppsOf(st.id); const tasks = todo(st); const visits = App.visitsOf(st.id); const lv = st.lastVisit;
    let h = complaintBlock(st);
    if (st.isNewOpen) h += App.ui.notice('ok', `<b>新开店</b> · ${esc(shortMd(st.openedAt))} 开业 · 证据：${esc(st.openEvidence || '')}`, 'star');
    if (st.isNewEntry) h += App.ui.notice('gray', `<b>新录入</b>（${esc(shortMd(st.enteredAt))}）· 无开业证据，不按新开店处理`, 'info');
    h += App.ui.section('服务状态', App.ui.factTag('official'));
    h += `<div class="card">${App.ui.kv([
      ['合作状态', App.ui.coopChip(st.coop)],
      ['服务项目', st.services && st.services.length ? esc(st.services.join(' / ')) : '<span class="muted">暂无（未合作）</span>'],
      st.coop === 'active' ? ['合同期', `${ymdDot(st.since)} – ${ymdDot(st.contractEnd)}`] : null,
      st.coop === 'paused' ? ['停做', `${esc(shortMd(st.pausedAt))} · ${esc(st.pausedReason || '')}`] : null,
      ['客诉状态', complaintText(st.complaint)],
      ['数据更新', esc(st.updatedAt)],
    ].filter(Boolean))}</div>`;
    h += App.ui.section('商机', `<span onclick="S_CDT.tab('opps')">${opps.length} 个 ${App.icon('chevron-right', 14)}</span>`);
    h += opps.length ? `<div class="list">${opps.map(oppRow).join('')}</div>` : `<div class="card"><div class="muted small">暂无商机 · 有效接触并确认需求后再新建</div><div class="mt8">${App.ui.btn('新增商机', { tone: 'secondary', size: 'sm', icon: 'plus', onclick: `S_CDT.newOpp('${st.id}')` })}</div></div>`;
    h += App.ui.section('下一步');
    h += tasks.length ? `<div class="list">${tasks.slice(0, 2).map(taskCell).join('')}</div>` : `<div class="card"><div class="muted small">暂无待办任务</div><div class="mt8">${App.ui.btn('建任务', { tone: 'secondary', size: 'sm', icon: 'plus', onclick: `S_CDT.newTask('${st.id}')` })}</div></div>`;
    h += App.ui.section('最近拜访', visits.length ? `<span onclick="S_CDT.tab('timeline')">时间线 ${App.icon('chevron-right', 14)}</span>` : '');
    if (lv) {
      const v = visits[0];
      h += `<div class="card ${v ? 'pressable' : ''}" ${v ? `onclick="App.go('visit-detail',{id:'${v.id}'})"` : ''}>
        <div class="row between"><div class="row gap6"><b>${esc(App.fmt.mdw(lv.date))}</b>${App.ui.chip(lv.type, 'brand', { sm: true })}<span class="muted small">${esc(App.fmt.rel(lv.date))}</span></div>${v ? App.icon('chevron-right', 16, 'muted') : ''}</div>
        <div class="mt8" style="font-size:14px">${esc(lv.result)}</div>
        <div class="row between mt8"><span class="muted small">记录人 ${esc(lv.by)}</span>${v ? App.ui.visitStatusChip(v.status) : App.ui.factTag('fact')}</div></div>`;
    } else h += `<div class="card"><div class="muted small">暂无有效拜访 · 纯拍照不算有效接触</div></div>`;
    return h;
  }

  /* ---------- 时间线 ---------- */
  function timelineItems(st) {
    const items = [];
    App.visitsOf(st.id).forEach((v) => {
      const pending = !['synced', 'saved'].includes(v.status);
      const who = v.contact && v.contact.name ? `${v.contact.name}（${v.contact.role || ''}）` : (v.contact && v.contact.role ? `${v.contact.role} · 姓名未记录` : '未记录对接人');
      const cm = [].concat((v.commitments || {}).customer || [], (v.commitments || {}).sales || []).map((c) => (typeof c === 'string' ? c : c.text));
      items.push({ t: v.time, tone: pending ? 'warn' : '', tag: pending ? App.ui.factTag('pending') : App.ui.factTag('fact'),
        title: `<span>${esc(v.type)} · ${esc(who)}</span>${App.ui.visitStatusChip(v.status)}`,
        body: `${esc(v.result || '')}${v.next ? ` · 下一步：${esc(v.next)}` : ''}${cm.length ? `<div class="tiny muted mt4">承诺：${esc(cm.join('；'))}</div>` : ''}`,
        onclick: `App.go('visit-detail',{id:'${v.id}'})` });
    });
    App.oppsOf(st.id).forEach((o) => {
      if (o.ai) items.push({ t: o.updatedAt, tone: 'ai', tag: App.ui.factTag('derived'), title: `<span>AI 建议 · ${esc(o.service)}（${esc(o.kind)}）</span>${App.ui.chip(`${o.ai.stage} / ${App.tierLabel(o.ai.tier)}`, 'ai', { sm: true })}`, body: `${esc((o.ai.next || [])[0] && ((o.ai.next[0].text) || o.ai.next[0]) || '')}<div class="tiny muted mt4">置信度 ${esc(o.ai.confidence || '—')} · 不改正式值${o.ai.reviewStatus ? ' · ' + esc(o.ai.reviewStatus) : ''}</div>`, onclick: `App.go('opportunity',{id:'${o.id}'})` });
    });
    App.tasksOf(st.id).forEach((t) => {
      if (t.status === 'done' && t.doneAt) items.push({ t: t.doneAt, tone: 'gray', tag: App.ui.factTag('fact'), title: `<span>任务完成 · ${esc(t.title)}</span>`, body: `来源：${esc(t.source)}`, onclick: `App.go('task',{id:'${t.id}'})` });
      if (t.status === 'rescheduled' && t.rescheduledAt) items.push({ t: t.rescheduledAt, tone: 'gray', tag: App.ui.factTag('fact'), title: `<span>任务改期 · ${esc(t.title)}</span>`, body: esc(t.rescheduleReason || '') });
    });
    const c = st.complaint || {};
    if (c.date && (c.status === 'open' || c.status === 'stale')) items.push({ t: c.date, tone: 'warn', tag: App.ui.factTag('fact'), title: `<span>${c.status === 'open' ? '客诉' : '客诉（数据待更新）'}</span>${App.ui.complaintChip(c)}`, body: `${esc(c.summary || '')}<div class="tiny muted mt4">${esc(c.source || '服务系统')}</div>` });
    App.state.proposals.filter((p) => p.storeId === st.id).forEach((p) => {
      const tpl = App.by(App.state.templates, 'id', p.templateId) || {};
      (p.events || []).forEach((e) => items.push({ t: e.t, tone: 'gray', tag: App.ui.factTag('fact'), title: `<span>方案 · ${esc(e.e)}</span>`, body: `${esc(tpl.name || '')} ${esc(p.templateVersion || '')}`, onclick: `App.go('proposal',{id:'${p.id}'})` }));
    });
    if (st.since) items.push({ t: st.since, tone: '', tag: App.ui.factTag('official'), title: '<span>开始服务</span>', body: `合同期至 ${ymdDot(st.contractEnd)}` });
    if (st.pausedAt) items.push({ t: st.pausedAt, tone: 'warn', tag: App.ui.factTag('official'), title: '<span>停做</span>', body: esc(st.pausedReason || '') });
    if (st.openedAt) items.push({ t: st.openedAt, tone: 'gray', tag: App.ui.factTag('fact'), title: '<span>新开店录入</span>', body: `证据：${esc(st.openEvidence || '')}` });
    if (st.enteredAt) items.push({ t: st.enteredAt, tone: 'gray', tag: App.ui.factTag('fact'), title: '<span>新录入门店</span>', body: '非新开店' });
    return items.sort((a, b) => (sortKey(a.t) < sortKey(b.t) ? 1 : -1));
  }
  function timeline(st) {
    const items = timelineItems(st);
    if (!items.length) return App.ui.empty({ icon: 'history', title: '暂无记录', sub: '拜访、任务、客诉、方案事件会汇总在这里' });
    return note('统一时间线：拜访 / 任务 / 客诉 / 方案 / AI 建议按时间倒序；<b>AI 派生</b>与<b>已确认事实</b>分别标注。', 'layers')
      + `<div class="card cdt-tl"><div class="timeline">${items.map((it) => `<div class="tl-item ${it.tone || ''} ${it.onclick ? 'pressable' : ''}" ${it.onclick ? `onclick="${it.onclick}"` : ''}><div class="tl-time">${esc(tlTime(it.t))} · ${it.tag}</div><div class="tl-title">${it.title}</div>${it.body ? `<div class="tl-body">${it.body}</div>` : ''}</div>`).join('')}</div></div>`;
  }

  /* ---------- 联系人 ---------- */
  function contacts(st) {
    const list = st.contacts || [];
    if (!list.length) return App.ui.empty({ icon: 'users', title: '暂无联系人', sub: '拜访确认后由结构化事实写入；口述未提供的姓名标"待核实"，不填造' });
    const rows = list.map((c) => `<div class="cell"><div class="avatar ${c.verified ? '' : 'gray'}" style="width:36px;height:36px">${esc(App.initials(c.name))}</div>
      <div class="cell-body"><div class="cell-title row gap6"><span class="ellipsis">${esc(c.name)}</span>${App.ui.chip(c.decision || '—', DEC_TONE[c.decision] || 'gray', { sm: true })}</div>
        <div class="cell-sub">${esc(c.role || '')} · 来源：${esc(c.source || '—')} · ${c.phone && c.phone !== '—' ? esc(c.phone) : '未留电话'}</div></div>
      <div class="cell-right">${c.verified ? App.ui.chip('已核实', 'ok', { sm: true, icon: 'check' }) : App.ui.chip('待核实', 'warn', { sm: true })}</div></div>`).join('');
    return `<div class="list">${rows}</div>` + note('决策角色（对接人 / 决策人 / 使用方 / 采购方）来自 CRM 或拜访确认；电话脱敏显示；口述里没有的姓名不填造。', 'shield');
  }

  /* ---------- 商机 ---------- */
  function opps(st) {
    const list = App.oppsOf(st.id);
    let h = list.length ? `<div class="list">${list.map(oppRow).join('')}</div>` : App.ui.empty({ icon: 'trend', title: '暂无商机', sub: '有效接触并确认需求后再新建' });
    h += note('同店续约与新购分开，互不覆盖；阶段与 258 分层挂在商机上，列表只展示主商机。', 'layers');
    h += App.ui.btn('新增商机', { tone: 'secondary', block: true, icon: 'plus', onclick: `S_CDT.newOpp('${st.id}')` });
    return h;
  }

  /* ---------- 承诺 ---------- */
  function commitmentsOf(st) {
    const out = [];
    App.visitsOf(st.id).forEach((v) => {
      ['customer', 'sales'].forEach((side) => ((v.commitments || {})[side] || []).forEach((c) => {
        out.push({ side, text: typeof c === 'string' ? c : c.text, key: !!(typeof c === 'object' && c.key), visit: v, confirmed: ['synced', 'saved'].includes(v.status) });
      }));
    });
    return out;
  }
  function commitments(st) {
    const items = commitmentsOf(st); const opp = App.primaryOpp(st.id);
    let h = '';
    if (st.group) h += `<div class="list">${App.ui.cell({ title: '承诺一致性核对（P1 预览）', badge: App.ui.chip('P1', 'warn', { sm: true }), sub: '承诺—方案—报价—合同差异；差异未处理阻断提交', icon: 'compare', iconTone: 'warn', onclick: `App.go('p1-commitments',{oppId:'${opp ? opp.id : ''}'})` })}</div>`;
    if (!items.length) return h + App.ui.empty({ icon: 'handshake', title: '暂无承诺记录', sub: '拜访确认时，客户 / 我方承诺单独突出确认后写入' });
    const cust = items.filter((i) => i.side === 'customer').length; const pend = items.filter((i) => !i.confirmed).length;
    h += `<div class="kpis cdt-summary">${[['客户承诺', cust, ''], ['我方承诺', items.length - cust, 'brand'], ['待确认', pend, pend ? 'warn' : '']].map(([l, v, tone]) => `<div class="kpi ${tone}"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('')}</div>`;
    h += `<div class="list">${items.map((c) => `<div class="cell cdt-cm"><div class="cell-icon ${c.side === 'customer' ? 'info' : ''}">${App.icon(c.side === 'customer' ? 'user' : 'handshake', 18)}</div>
      <div class="cell-body"><div class="cell-title row gap6">${App.ui.chip(c.side === 'customer' ? '客户' : '我方', c.side === 'customer' ? 'info' : 'brand', { sm: true })}<span>${esc(c.text)}</span></div>
        <div class="cell-sub">证据：拜访记录 ${esc(shortDt(c.visit.time))} · ${esc(c.visit.type)}${c.visit.contact && c.visit.contact.name ? ' · ' + esc(c.visit.contact.name) : ''}</div></div>
      <div class="cell-right">${c.confirmed ? App.ui.chip('已确认', 'ok', { sm: true }) : App.ui.chip('待确认', 'warn', { sm: true })}</div></div>`).join('')}</div>`;
    h += note('承诺来自已确认的拜访事实；金额 / 日期类承诺需单独确认；不得口头承诺"根除"或减免。', 'shield');
    return h;
  }

  /* ---------- 方案 ---------- */
  function proposals(st) {
    const list = App.state.proposals.filter((p) => p.storeId === st.id); const opp = App.primaryOpp(st.id);
    let h = list.length ? list.map((p) => {
      const tpl = App.by(App.state.templates, 'id', p.templateId) || {}; const ev = p.events || []; const last = ev[ev.length - 1]; const stt = PROP_STATUS[p.status] || [p.status, 'gray'];
      return `<div class="card cdt-prop pressable" onclick="App.go('proposal',{id:'${p.id}'})">
        <div class="row between"><div class="card-title" style="margin:0"><span class="ellipsis">${esc(tpl.name || '方案')}</span></div>${App.icon('chevron-right', 16, 'muted')}</div>
        <div class="chips mt8">${App.ui.chip(`模板 ${p.templateVersion || tpl.version || ''}`, 'outline')}${App.ui.chip(`v${p.version}`, 'gray')}${App.ui.chip(stt[0], stt[1])}</div>
        ${App.ui.kv([['审核人', esc(tpl.reviewedBy || '—')], ['确认人', esc(p.confirmedBy || '—')], ['最近事件', last ? `${esc(last.e)} · ${esc(shortDt(last.t))}` : '—'], ['事件', `${ev.length} 条（生成 / 导出 / 人工标记发送）`]])}
      </div>`;
    }).join('') : App.ui.empty({ icon: 'doc', title: '暂无方案', sub: '使用已审核模板生成；需要价格处显示"报价待审批"' });
    h += note('仅生成 / 发送方案不推进阶段；重新生成产生新版本，不覆盖已确认版本。', 'info');
    h += App.ui.btn('发起方案', { block: true, icon: 'doc', onclick: `S_CDT.proposal('${st.id}')`, disabled: !opp });
    if (!opp) h += `<div class="tiny muted mt8" style="text-align:center">暂无商机，请先在"商机"页新增</div>`;
    return h;
  }

  function body(st, tab) {
    return ({ overview, timeline, contacts, opps, commit: commitments, proposals }[tab] || overview)(st);
  }

  /* ---------- 无权门店：最小视图 ---------- */
  function minimalView(st) {
    return `<div class="card" style="text-align:center;padding:28px 16px 22px">
      <div class="cdt-lock">${App.icon('lock', 26)}</div>
      <div style="font-size:18px;font-weight:700;margin-top:12px">${esc(st.name)}</div>
      <div class="muted small mt4">${esc(st.type)} · ${esc(st.address)}</div>
      <div class="chips mt12" style="justify-content:center">${App.ui.chip('该门店已有负责人跟进', 'gray', { icon: 'users' })}${App.ui.chip(st.recentTouch || '近 7 天有触达', 'info', { icon: 'clock' })}</div>
    </div>
    ${App.ui.notice('gray', '按服务端权限，本页仅返回必要的重复触达提示：<b>不显示联系人、合同、拜访详情与附件</b>。如需跟进，请申请协作，负责人 / 主管确认后生效，不自动抢占归属。', 'shield')}
    ${App.ui.btn('申请协作', { block: true, icon: 'handshake', onclick: `App.go('collab-request',{storeId:'${st.id}'})` })}`;
  }

  /* ---------- 动作 ---------- */
  S.tab = (id) => { U().customerTab = id; App.save(); App.refresh(); };
  S.visit = (id) => { if (window.S_CUS && S_CUS.visit) S_CUS.visit(id); else App.go('visit-capture', { storeId: id }); };
  S.proposal = (storeId) => {
    const opp = App.primaryOpp(storeId);
    if (!opp) { App.toast('该门店暂无商机，请先在"商机"页新增'); return; }
    App.go('proposal-new', { oppId: opp.id });
  };
  S.newTask = (storeId) => {
    const me = App.me(); const opp = App.primaryOpp(storeId);
    App.prompt('新建任务', '例如：回访确认油烟机清洗参数（默认明天到期，可在任务详情改期）', (txt) => {
      const title = (txt || '').trim(); if (!title) { App.toast('请输入任务内容'); return; }
      App.state.tasks.unshift({ id: App.uid('t'), storeId, oppId: opp ? opp.id : null, title, type: '跟进', ownerId: me.id, ownerName: me.name, due: tomorrow(), time: '', status: 'todo', source: '本人创建', reason: '', evidence: [], expected: '', createdAt: App.TODAY });
      App.save(); App.refresh(); App.toast('已创建任务 · 明天到期', { icon: 'check-circle' });
    }, '创建');
  };
  S.newOpp = (storeId) => {
    const st = App.store(storeId); if (!st) return; const me = App.me();
    const lines = ['有害生物防治', '油烟机清洗', '卫生间深度清洁', '消毒杀菌'];
    App.sheet({ title: '新增商机 · 选择服务线（阶段从"待触达"开始，分层待判断）', items: lines.map((l) => {
      const exists = App.oppsOf(storeId).some((o) => o.service === l);
      const inService = (st.services || []).some((s) => s.startsWith(l));
      const kind = inService ? '续约' : st.coop === 'active' ? '增购' : '新购';
      return { label: l, icon: 'tag', sub: `${kind}${exists ? ' · 已有同服务线商机，可并存不覆盖' : ''}`, onSelect() {
        App.state.opportunities.push({ id: App.uid('o'), storeId, service: l, kind, stage: '待触达', tier: 'pending', tierSource: '新建 · 待判断', ownerId: me.id, ownerName: me.name, done: [], missing: ['真实接触结果', '对接人角色与决策人'], stallReason: null, ai: null, updatedAt: App.TODAY });
        App.save(); U().customerTab = 'opps'; App.refresh(); App.toast(`已新增商机：${l}（${kind}）`, { icon: 'check-circle' });
      } };
    }) });
  };

  App.register('customer', {
    title: '客户详情', tab: 'customers',
    nav: (p) => { const st = App.store(p.id); return { title: st ? st.name : '客户详情', solid: true }; },
    prd: ['7 页面表 · 客户详情', 'F01 集团 / 签约主体 / 门店 分别建模；一店多商机', 'F02 无权门店只返回避重提示', 'F05 未结客诉优先"先了解/协调服务问题"'],
    rules: ['事实 vs AI 派生分别标注', '同店续约与新购分开、互不覆盖', '口述未提供的姓名标"待核实"，不填造', '未结客诉期间不建立额外收费商机', '无权门店不显示联系人、合同、附件', '仅生成方案不推进阶段'],
    render(p) {
      const st = App.store(p.id);
      if (!st) return App.ui.empty({ icon: 'store', title: '未找到该门店', sub: `ID：${p.id || '—'}` });
      if (st.perm === 'minimal') return minimalView(st);
      const tab = TABS.some(([id]) => id === U().customerTab) ? U().customerTab : 'overview';
      return header(st) + actions(st) + tabs(tab) + `<div id="cdt-body">${body(st, tab)}</div>`;
    },
    demoActions: [
      { label: '查看：时间线', icon: 'history', run() { S.tab('timeline'); } },
      { label: '查看：承诺', icon: 'handshake', run() { S.tab('commit'); } },
      { label: '模拟：客诉已结（满堂红）', icon: 'check-circle', run() { const st = App.store('s_jia'); if (!st) return; st.complaint = { status: 'closed', summary: '9/3 客诉已复处理并关闭', date: '2026-09-07', source: '服务系统 · 9/7 16:00 同步' }; App.save(); App.refresh(); App.toast('满堂红：客诉已结', { icon: 'check-circle' }); } },
      { label: '恢复：未结客诉（满堂红）', icon: 'refresh', run() { const st = App.store('s_jia'); const fresh = App.freshState().stores.find((s) => s.id === 's_jia'); if (st && fresh) { st.complaint = fresh.complaint; App.save(); App.refresh(); App.toast('已恢复未结客诉', { icon: 'refresh' }); } } },
    ],
  });

  /* ---------- 申请协作 ---------- */
  App.register('collab-request', {
    title: '申请协作', tab: 'customers', nav: { title: '申请协作', solid: true },
    prd: ['F01 非本人客户申请协作，不自动抢占归属', '13.1 权限矩阵 · 客户转交由主管审批'],
    rules: ['申请不改变归属', '负责人确认或主管指定后生效', '确认前不开放联系人 / 合同 / 附件'],
    render(p) {
      const st = App.store(p.storeId); const me = App.me();
      return `${App.ui.notice('info', '申请提交后由门店负责人或主管确认；<b>确认前不改变归属</b>，也不开放联系人 / 合同 / 附件。', 'shield')}
        <div class="list cdt-form">
          <div class="form-item"><label>门店</label><div class="fv">${esc(st ? st.name : '—')}</div></div>
          <div class="form-item"><label>申请人</label><div class="fv">${esc(me.name)} <span class="muted small">· ${esc(me.roleName)}</span></div></div>
          <div class="form-item"><label>协作类型</label><div class="fv"><div class="seg" id="collab-type"><button class="active" data-v="协作跟进" onclick="S_CDT.collabType(this)">协作跟进</button><button data-v="申请转交" onclick="S_CDT.collabType(this)">申请转交</button></div></div></div>
          <div class="form-item required ta"><label>原因</label><div class="fv"><textarea id="collab-reason" placeholder="例如：客户主动联系我方，希望与现负责人共同跟进；或已约定到店时间"></textarea></div></div>
        </div>
        ${note('转交需接收人确认或主管指定后生效；正式转交保留历史责任人、协作权限及未结任务。', 'info')}`;
    },
    footer(p) { return App.ui.btn('提交申请', { block: true, size: 'lg', icon: 'send', onclick: `S_CDT.submitCollab('${p.storeId}')` }); },
  });
  S.collabType = (btn) => { App.qa('button', btn.parentNode).forEach((b) => b.classList.toggle('active', b === btn)); };
  S.submitCollab = (storeId) => {
    const scr = App.currentEntry() && App.currentEntry().el;
    const ta = scr && scr.querySelector('#collab-reason'); const v = ta ? ta.value.trim() : '';
    if (!v) { App.toast('请填写申请原因'); if (ta) ta.focus(); return; }
    const type = ((scr && scr.querySelector('#collab-type .active')) || {}).dataset ? scr.querySelector('#collab-type .active').dataset.v : '协作跟进';
    (App.state.collabRequests = App.state.collabRequests || []).push({ id: App.uid('cr'), storeId, type, reason: v, by: App.me().id, at: App.TODAY, status: '待确认' });
    App.save();
    App.toast('已提交协作申请，等待负责人/主管确认（不自动抢占归属）', { icon: 'check-circle', duration: 2400 });
    setTimeout(() => App.back(), 500);
  };
})();
