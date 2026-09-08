/* ============================================================
   主管模块：S_TEAM.render()（主管首页主体，由 home.js 调用）
   页面：ask（数据咨询）/ approvals（待审批）/ low-records（低分记录）/
         team-member（成员）/ task（任务详情）/ tasks（待办列表）
   命名空间 window.S_TEAM；页面专属样式通过 App.css('team') 注入
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_TEAM = {};
  const esc = App.esc;
  const TODAY = App.TODAY;

  App.css('team', `
  /* --- hero 内元素 --- */
  .tm-hero .h-title { font-size: 21px; }
  .tm-hero .h-chip { background: rgba(255,255,255,.16); color: #fff; border: 1px solid rgba(255,255,255,.18); height: 26px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; flex: none; }
  .tm-hero .h-metrics.tiles .m { cursor: pointer; }
  .tm-hero .h-metrics.tiles .m:active { background: rgba(255,255,255,.22); }
  /* --- 四宫格 --- */
  .tm-quick .quick { padding: 12px 4px; gap: 8px; font-size: 13px; color: var(--ink); }
  .tm-quick .qi { font-size: 18px; font-weight: 800; width: 42px; height: 42px; }
  .tm-quick .qi.navy { background: #0f2444; color: #fff; }
  .tm-quick .qi.warn { background: var(--warn-soft); color: #b45309; }
  .tm-quick .qi.brand { background: var(--brand-soft); color: var(--brand-3); }
  .tm-quick .qi.ai { background: var(--ai-soft); color: var(--ai); }
  /* --- 团队即时总结（藏青卡） --- */
  .tm-sum { border-radius: 18px; padding: 14px 16px; color: #fff; margin: 12px 0; background: linear-gradient(135deg, #16355f 0%, #0f2444 60%, #0b1a33 100%); box-shadow: 0 10px 24px rgba(15,36,68,.28); }
  .tm-sum .st { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
  .tm-sum .st .t { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
  .tm-sum .st .ai-tag { background: rgba(21,150,173,.35); color: #bff0f8; border: 1px solid rgba(21,150,173,.6); border-radius: 999px; padding: 3px 9px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .tm-sum p { font-size: 14px; line-height: 1.6; opacity: .95; margin: 0 0 6px; }
  .tm-sum p:last-of-type { margin-bottom: 0; }
  .tm-sum .sf { font-size: 11px; opacity: .6; margin-top: 10px; }
  /* --- 头像块 / 成员行 --- */
  .tm-tile { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex: none; letter-spacing: .02em; }
  .tm-tile.navy { background: #0f2444; color: #fff; }
  .tm-tile.brand { background: var(--brand-soft); color: var(--brand-3); }
  .tm-tile.ai { background: var(--ai-soft); color: var(--ai); }
  .tm-tile.warn { background: var(--warn-soft); color: #b45309; }
  .tm-tile.gray { background: var(--gray-soft); color: var(--gray); }
  .tm-tile.danger { background: var(--danger-soft); color: #b91c1c; }
  .tm-av { width: 38px; height: 38px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 15px; flex: none; }
  .tm-av.lg { width: 56px; height: 56px; font-size: 22px; }
  .tm-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .tm-row + .tm-row { border-top: .5px solid var(--line); }
  .tm-row .tn { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
  .tm-row .ts { font-size: 12.5px; color: var(--ink-3); margin-top: 2px; }
  .tm-row.pressable { cursor: pointer; }
  .tm-row.pressable:active { opacity: .7; }
  .tm-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .tm-card-head .card-title { margin: 0; }
  .tm-card-head a { color: var(--ink-3); font-size: 13px; white-space: nowrap; }
  .tm-pend { border-left: 4px solid var(--warn); }
  /* --- 数据咨询 --- */
  .tm-ask { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
  .tm-ask input { flex: 1; min-width: 0; height: 42px; border: 1px solid var(--line-2); border-radius: 12px; padding: 0 12px; font-size: 14px; background: var(--surface); outline: 0; }
  .tm-ask input:focus { border-color: var(--brand); }
  .tm-ask .btn { height: 42px; padding: 0 16px; }
  .tm-qchip { height: 32px; padding: 0 12px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line-2); font-size: 13px; color: var(--ink-2); white-space: nowrap; display: inline-flex; align-items: center; }
  .tm-qchip.on { background: var(--brand-soft); border-color: var(--brand-soft-2); color: var(--brand-3); font-weight: 600; }
  .tm-qchip:active { background: var(--surface-3); }
  .tm-qwrap { display: flex; flex-wrap: wrap; gap: 6px; }
  .tm-chat { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
  .tm-me { align-self: flex-end; max-width: 82%; background: var(--brand); color: #fff; padding: 10px 14px; border-radius: 16px 6px 16px 16px; font-size: 14px; line-height: 1.5; }
  .tm-ans { background: var(--surface); border-radius: 18px; border: 1px solid rgba(17,24,39,.04); box-shadow: var(--shadow-xs); overflow: hidden; }
  .tm-ans .ah { display: flex; align-items: center; gap: 8px; padding: 12px 14px 8px; }
  .tm-ans .ah .logo { width: 26px; height: 26px; border-radius: 8px; background: var(--ai); color: #fff; display: flex; align-items: center; justify-content: center; flex: none; }
  .tm-ans .ah .t { font-size: 15px; font-weight: 700; }
  .tm-ans .ah .m { font-size: 11px; color: var(--ai); }
  .tm-ans .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; padding: 8px 14px; background: var(--surface-2); font-size: 11.5px; color: var(--ink-3); }
  .tm-ans .meta b { color: var(--ink-2); font-weight: 600; margin-right: 4px; }
  .tm-ans .meta .full { grid-column: 1 / -1; }
  .tm-ans .ab { padding: 12px 14px; }
  .tm-ans .af { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 14px 12px; font-size: 11.5px; color: var(--ink-3); }
  .tm-ans .af a { color: var(--brand); font-weight: 600; font-size: 13px; }
  .tm-ans .bars .bl { width: 74px; }
  .tm-ans .bars .bv { width: 92px; font-size: 12px; }
  .tm-stat { display: flex; align-items: baseline; gap: 10px; }
  .tm-stat .v { font-size: 38px; font-weight: 800; letter-spacing: -.02em; color: var(--brand); line-height: 1; font-variant-numeric: tabular-nums; }
  .tm-stat .s { font-size: 14px; color: var(--ink-2); }
  .tm-nodata { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; }
  .tm-nodata .ni { width: 36px; height: 36px; border-radius: 10px; background: var(--gray-soft); color: var(--gray); display: flex; align-items: center; justify-content: center; flex: none; }
  .tm-nodata .nt { font-size: 15px; font-weight: 700; }
  .tm-nodata .ns { font-size: 13px; color: var(--ink-2); margin-top: 3px; line-height: 1.5; }
  /* --- 审批 --- */
  .tm-appr .ap-amt { font-size: 22px; font-weight: 800; letter-spacing: -.01em; }
  .tm-appr .ap-line { display: flex; justify-content: space-between; gap: 8px; font-size: 13.5px; padding: 8px 0; border-top: .5px solid var(--line); }
  .tm-appr .ap-line .k { color: var(--ink-3); flex: none; }
  .tm-appr .ap-line .v { text-align: right; min-width: 0; }
  .tm-appr .ap-ph { background: var(--surface-2); border-radius: 12px; padding: 10px 12px; font-size: 13px; color: var(--ink-2); line-height: 1.5; margin-top: 8px; }
  .tm-appr .ap-ph b { color: var(--ink); }
  /* --- 任务详情 --- */
  .tm-task-head { display: flex; align-items: flex-start; gap: 12px; }
  .tm-task-head h2 { font-size: 18px; font-weight: 700; line-height: 1.3; margin-top: 8px; letter-spacing: -.01em; }
  .tm-task-head p { font-size: 14px; color: var(--ink-2); line-height: 1.55; margin-top: 6px; }
  .tm-kv { display: flex; flex-direction: column; }
  .tm-kv .r { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 11px 0; font-size: 14.5px; }
  .tm-kv .r + .r { border-top: .5px solid var(--line); }
  .tm-kv .r .k { color: var(--ink-2); font-weight: 600; flex: none; width: 72px; }
  .tm-kv .r .v { text-align: right; min-width: 0; color: var(--ink); }
  .tm-kv .r .v.link { color: var(--brand); cursor: pointer; }
  .tm-kv .r .v .muted { display: block; font-size: 12px; margin-top: 2px; }
  .tm-kv .r.stack { flex-direction: column; gap: 4px; }
  .tm-kv .r.stack .v { text-align: left; color: var(--ink-2); line-height: 1.55; }
  .tm-foot { font-size: 12px; color: var(--ink-3); text-align: center; padding: 4px 10px 8px; line-height: 1.5; }
  /* --- 成员页 KPI --- */
  .tm-kpi4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
  .tm-kpi4 .k { background: var(--surface); border-radius: 14px; padding: 12px 8px 10px; border: 1px solid rgba(17,24,39,.04); text-align: center; }
  .tm-kpi4 .k .v { font-size: 22px; font-weight: 800; letter-spacing: -.02em; line-height: 1; font-variant-numeric: tabular-nums; }
  .tm-kpi4 .k .l { font-size: 11.5px; color: var(--ink-3); margin-top: 5px; }
  .tm-kpi4 .k.brand .v { color: var(--brand); } .tm-kpi4 .k.ok .v { color: var(--ok); } .tm-kpi4 .k.ai .v { color: var(--ai); } .tm-kpi4 .k.danger .v { color: var(--danger); }
  /* --- 指标口径小卡 --- */
  .tm-cap { background: var(--surface-2); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; margin-bottom: 12px; }
  .tm-cap .ct { font-size: 12.5px; font-weight: 700; color: var(--ink-2); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .tm-cap .ci { display: grid; grid-template-columns: 74px 1fr; gap: 3px 8px; font-size: 12px; color: var(--ink-3); line-height: 1.5; }
  .tm-cap .ci b { color: var(--ink-2); font-weight: 600; }
  .tm-cap .cn { font-size: 11px; color: var(--ink-4); margin-top: 8px; }
  /* --- 表单浮层 --- */
  .tm-form { max-height: 82%; display: flex; flex-direction: column; }
  .tm-form .ft { font-size: 17px; font-weight: 700; text-align: center; padding: 2px 16px 10px; color: var(--ink); }
  .tm-form .fb { overflow-y: auto; padding: 0 16px; }
  .tm-form .frow { padding: 10px 0; border-top: .5px solid var(--line); }
  .tm-form .frow .fl { font-size: 12.5px; color: var(--ink-3); font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .tm-form .frow .fl.req::after { content: "必填"; font-size: 10.5px; color: var(--danger); font-weight: 600; background: var(--danger-soft); padding: 1px 6px; border-radius: 999px; }
  .tm-form .fchips { display: flex; flex-wrap: wrap; gap: 8px; }
  .tm-form .fchip { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px 0 6px; border-radius: 999px; border: 1px solid var(--line-2); background: var(--surface); font-size: 13.5px; color: var(--ink-2); cursor: pointer; }
  .tm-form .fchip .av { width: 24px; height: 24px; border-radius: 50%; color: #fff; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
  .tm-form .fchip.on { border-color: var(--brand); background: var(--brand-soft); color: var(--brand-3); font-weight: 600; }
  .tm-form textarea, .tm-form input[type=text] { width: 100%; border: 1px solid var(--line-2); border-radius: 12px; padding: 10px 12px; font-size: 14px; background: var(--surface); outline: 0; line-height: 1.5; }
  .tm-form textarea { min-height: 78px; resize: none; }
  .tm-form textarea:focus, .tm-form input:focus { border-color: var(--brand); }
  .tm-form select { width: 100%; height: 42px; border: 1px solid var(--line-2); border-radius: 12px; padding: 0 12px; font-size: 14px; background: var(--surface); outline: 0; }
  .tm-form .fseg { display: flex; gap: 8px; }
  .tm-form .fseg button { flex: 1; height: 38px; border-radius: 10px; border: 1px solid var(--line-2); background: var(--surface); font-size: 13.5px; color: var(--ink-2); }
  .tm-form .fseg button.on { border-color: var(--brand); background: var(--brand-soft); color: var(--brand-3); font-weight: 600; }
  .tm-form .fseg button small { display: block; font-size: 10.5px; color: var(--ink-4); font-weight: 400; margin-top: 1px; }
  .tm-form .ff { padding: 12px 16px 0; }
  .tm-form .fnote { font-size: 11.5px; color: var(--ink-3); text-align: center; margin-top: 8px; }
  `);

  /* ----------------------------------------------------------
     数据帮手
     ---------------------------------------------------------- */
  const team = () => App.state.team;
  const me = () => App.me();
  const isMe = (id) => id === me().id;
  S.member = (id) => team().members.find((m) => m.id === id) || null;
  S.memberByName = (name) => team().members.find((m) => m.name === name) || null;
  S.memberName = (id) => { const m = S.member(id); if (m) return m.name; const u = Object.values(App.state.users).find((x) => x.id === id); return u ? u.name : id; };
  S.addDays = (s, n) => { const d = App.dayjs(s); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  // 演示时钟：从 10:30 起每次操作 +1 分钟
  S.stamp = function () { const ui = App.state.ui; ui.tmClock = (ui.tmClock || 30) + 1; const m = ui.tmClock; return `${TODAY} ${m >= 60 ? '11' : '10'}:${String(m % 60).padStart(2, '0')}`; };
  S.isOverdue = (t) => t.due && t.due < TODAY && !['已完成', '已拒绝'].includes(t.status);
  S.kindTone = (kind) => ({ 催办: 'warn', 辅导: 'brand', 报价: 'ai', 下发: 'navy', 任务: 'gray' }[kind] || 'gray');
  S.kindGlyph = (kind) => ({ 催办: '催', 辅导: '辅', 报价: '价', 下发: '发', 任务: '建' }[kind] || (kind || '任').slice(0, 1));
  S.kindLabel = (kind) => ({ 催办: '催办', 辅导: '辅导任务', 报价: '报价待办', 下发: '下发客户', 任务: '主管任务' }[kind] || kind);
  S.statusChip = (st, opts) => ({ 待接受: App.ui.chip('待接受', 'warn', opts), 执行中: App.ui.chip('执行中', 'info', opts), 已完成: App.ui.chip('已完成', 'ok', opts), 已拒绝: App.ui.chip('已拒绝', 'gray', opts) }[st] || App.ui.chip(st, 'gray', opts));
  S.dueText = (due) => `${App.fmt.md(due)}（${App.fmt.dueLabel(due)}）`;
  S.initiator = (t) => t.fromRole === 'sys' ? null : (t.fromRole === 'mgr' ? 'u_mgr' : (t.fromRole === 'ka' ? 'u_ka' : (t.fromRole === 'dj' ? 'u_dj' : null)));
  S.pendingApprovalCount = () => team().approvals.filter((a) => a.status === '审批中').length + (App.state.proposals || []).filter((p) => p.status === '审批中').length;
  S.avatar = (m, cls = '') => `<div class="tm-av ${cls}" style="background:${esc(m.color || '#1e5bd8')}">${esc(App.initials(m.name))}</div>`;
  S.tile = (t) => `<div class="tm-tile ${S.kindTone(t.kind)}">${esc(S.kindGlyph(t.kind))}</div>`;

  // 创建任务（任意角色可发；接收方接受 / 拒绝须填意见，结果推回发起人）
  S.createTask = function ({ kind, title, toId, due, source, body, storeId, visitId }) {
    const u = me();
    const t = {
      id: App.uid('t'), kind, title, from: `${u.name}（${u.roleName.replace('销售', '') === '主管' ? '主管' : u.roleName}）`, fromRole: App.state.role, toId, due: due || TODAY,
      status: '待接受', source: source || '主管创建', body: body || '', storeId: storeId || null, visitId: visitId || null,
      createdAt: S.stamp(), history: [],
    };
    t.history.push({ t: t.createdAt, e: `${u.roleName === '销售主管' ? '主管 ' : ''}${u.name} 发起 · ${source || '主管创建'}` });
    App.state.tasks.unshift(t);
    App.save();
    return t;
  };
  S.taskCell = function (t, opts = {}) {
    const to = S.memberName(t.toId);
    const sub = opts.showTo ? `发给 ${esc(to)} · ${esc(t.source || t.from)} · 截止 ${App.fmt.md(t.due)}` : `${esc(t.source || t.from)} · 截止 ${App.fmt.md(t.due)}（${App.fmt.rel(t.due)}）`;
    const right = S.isOverdue(t) ? App.ui.chip('逾期', 'danger', { sm: true }) + S.statusChip(t.status, { sm: true }) : S.statusChip(t.status, { sm: true });
    return `<div class="cell pressable" onclick="App.go('task',{id:'${t.id}'})">${S.tile(t)}<div class="cell-body"><div class="cell-title ellipsis">${esc(t.title)}</div><div class="cell-sub ellipsis">${sub}</div></div><div class="cell-right">${right}${App.icon('chevron-right', 16)}</div></div>`;
  };

  /* ----------------------------------------------------------
     表单浮层（接收人 / 内容 / 截止）
     ---------------------------------------------------------- */
  S._form = null;
  S.form = function ({ title, fields, submit = '发起', note, onSubmit }) {
    App.closeOverlay();
    const ov = App.q('#overlay');
    const mask = document.createElement('div'); mask.className = 'mask'; mask.onclick = App.closeOverlay;
    const sh = document.createElement('div'); sh.className = 'sheet tm-form';
    const vals = {}; fields.forEach((f) => { vals[f.key] = f.value != null ? f.value : (f.type === 'member' ? null : ''); });
    S._form = { vals, fields };
    const rows = fields.map((f) => {
      let ctl = '';
      if (f.type === 'member') ctl = `<div class="fchips" data-key="${f.key}">${f.options.map((m) => `<div class="fchip ${vals[f.key] === m.id ? 'on' : ''}" data-v="${m.id}"><span class="av" style="background:${esc(m.color)}">${esc(App.initials(m.name))}</span>${esc(m.name)}<span class="muted tiny">${esc(m.role)}</span></div>`).join('')}</div>`;
      else if (f.type === 'seg') ctl = `<div class="fseg" data-key="${f.key}">${f.options.map((o) => `<button type="button" class="${vals[f.key] === o.v ? 'on' : ''}" data-v="${esc(o.v)}">${esc(o.l)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>`).join('')}</div>`;
      else if (f.type === 'select') ctl = `<select data-key="${f.key}">${f.options.map((o) => `<option value="${esc(o.v)}" ${vals[f.key] === o.v ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
      else if (f.type === 'textarea') ctl = `<textarea data-key="${f.key}" placeholder="${esc(f.placeholder || '')}">${esc(vals[f.key])}</textarea>`;
      else if (f.type === 'static') ctl = `<div style="font-size:14.5px">${f.html || esc(vals[f.key])}</div>`;
      else ctl = `<input type="text" data-key="${f.key}" placeholder="${esc(f.placeholder || '')}" value="${esc(vals[f.key])}">`;
      return `<div class="frow"><div class="fl ${f.required ? 'req' : ''}">${esc(f.label)}</div>${ctl}</div>`;
    }).join('');
    sh.innerHTML = `<div class="sheet-handle"></div><div class="ft">${esc(title)}</div><div class="fb">${rows}</div><div class="ff">${App.ui.btn(submit, { tone: 'primary', block: true, cls: 'tm-submit' })}<div class="fnote">${note ? esc(note) : '发起后接收方「待接受」；接受 / 拒绝（附意见）结果推回发起人'}</div></div>`;
    // 绑定
    App.qa('.fchips', sh).forEach((box) => App.qa('.fchip', box).forEach((c) => { c.onclick = () => { vals[box.dataset.key] = c.dataset.v; App.qa('.fchip', box).forEach((x) => x.classList.toggle('on', x === c)); }; }));
    App.qa('.fseg', sh).forEach((box) => App.qa('button', box).forEach((b) => { b.onclick = () => { vals[box.dataset.key] = b.dataset.v; App.qa('button', box).forEach((x) => x.classList.toggle('on', x === b)); }; }));
    App.qa('select, textarea, input', sh).forEach((n) => { n.oninput = n.onchange = () => { vals[n.dataset.key] = n.value; }; });
    App.q('.tm-submit', sh).onclick = () => {
      for (const f of fields) {
        if (f.required && !(vals[f.key] && String(vals[f.key]).trim())) { App.toast(`请填写${f.label}`, { bottom: true, icon: 'alert' }); return; }
      }
      App.closeOverlay(); S._form = null;
      onSubmit(vals);
    };
    ov.appendChild(mask); ov.appendChild(sh);
    const ta = App.q('textarea', sh); if (ta && !ta.value) setTimeout(() => ta.focus(), 80);
  };
  const DUE_OPTS = [{ v: S.addDays(TODAY, 1), l: '明天', sub: App.fmt.md(S.addDays(TODAY, 1)) }, { v: S.addDays(TODAY, 3), l: '3 天后', sub: App.fmt.md(S.addDays(TODAY, 3)) }, { v: '2026-09-11', l: '本周五', sub: '9月11日' }];
  S.afterCreate = function (t) {
    App.refresh();
    App.toast(`已发起 · 等待 ${S.memberName(t.toId)} 接受 / 拒绝，结果推回`, { icon: 'send', duration: 2000 });
  };

  /* ---------- 四个主管动作 ---------- */
  // 一键催办：对今日已打点未留痕的成员
  S.urge = function (memberId, storeId) {
    const p = team().pendingTrace.find((x) => (!memberId || x.memberId === memberId) && (!storeId || x.storeId === storeId)) || team().pendingTrace[0];
    if (!p) { App.toast('今日全部已留痕，无需催办', { icon: 'check-circle' }); return; }
    const store = App.store(p.storeId) || { name: '门店' };
    const exists = App.state.tasks.find((t) => t.kind === '催办' && t.toId === p.memberId && t.storeId === p.storeId && !['已完成', '已拒绝'].includes(t.status)) || App.state.tasks.find((t) => t.id === 't_cuiban' && t.toId === p.memberId && !['已完成', '已拒绝'].includes(t.status));
    if (exists) { S.pushHistory(exists, `${me().name} 再次催办`); App.save(); App.refresh(); App.toast(`已催办过 · 已再次提醒 ${p.name}（待办「${exists.title.slice(0, 10)}…」仍${exists.status}）`, { icon: 'bell', duration: 2000 }); return; }
    const t = S.createTask({ kind: '催办', title: `催办：${store.name.replace(/（.*?）/g, '')}今日已打点未留痕`, toId: p.memberId, due: TODAY, source: '主管催办', body: `${p.checkin} 打点${store.route && store.route.checkout ? `、${store.route.checkout} 离店` : ''}，尚未留痕；请今天内补录（30 秒留痕 · 设计目标）。`, storeId: p.storeId });
    App.refresh();
    App.toast(`已催办：${p.name} 的待办里出现「${t.title.slice(0, 10)}…」`, { icon: 'bell', duration: 2000 });
  };
  S.urgeForm = function () {
    const p = team().pendingTrace;
    if (!p.length) { App.toast('今日全部已留痕，无需催办', { icon: 'check-circle' }); return; }
    S.form({
      title: '一键催办 · 已打点未留痕', submit: '发起催办',
      fields: [
        { key: 'toId', label: '接收人', type: 'member', required: true, value: p[0].memberId, options: team().members.filter((m) => p.some((x) => x.memberId === m.id)) },
        { key: 'body', label: '内容', type: 'textarea', required: true, value: `${(App.store(p[0].storeId) || {}).name || ''} ${p[0].checkin} 打点，尚未留痕；请今天内补录。` },
        { key: 'due', label: '截止', type: 'seg', value: TODAY, options: [{ v: TODAY, l: '今天 18:00', sub: '当日补录' }, DUE_OPTS[0]] },
      ],
      onSubmit(v) { const p0 = p.find((x) => x.memberId === v.toId) || p[0]; const store = App.store(p0.storeId) || { name: '门店' }; const t = S.createTask({ kind: '催办', title: `催办：${store.name.replace(/（.*?）/g, '')}今日已打点未留痕`, toId: v.toId, due: v.due, source: '主管催办', body: v.body, storeId: p0.storeId }); S.afterCreate(t); },
    });
  };
  S.coachForm = function (memberId, opts = {}) {
    const m = S.member(memberId) || team().members.find((x) => x.low > 0) || team().members[0];
    S.form({
      title: '发起辅导', submit: '发起 · 销售端待接受',
      fields: [
        { key: 'toId', label: '接收人', type: 'member', required: true, value: m.id, options: team().members },
        { key: 'title', label: '主题', type: 'text', required: true, value: opts.title || '辅导：预算与下一步的记录方法' },
        { key: 'body', label: '内容', type: 'textarea', required: true, placeholder: '结合哪条记录、练什么', value: opts.body || `结合近 7 天低于门槛的记录${opts.store ? `（${opts.store}）` : ''}，一起过一遍「预算区间 + 具体时间 + 动作」的口述结构；完成一次 15 分钟对练并重新提交该条记录。` },
        { key: 'due', label: '截止', type: 'seg', value: DUE_OPTS[1].v, options: DUE_OPTS },
      ],
      onSubmit(v) { const t = S.createTask({ kind: '辅导', title: v.title, toId: v.toId, due: v.due, source: opts.source || '来自记录复盘', body: v.body, visitId: opts.visitId || null }); S.afterCreate(t); },
    });
  };
  S.assignForm = function () {
    const stores = App.state.stores.filter((s) => s.isNew || s.coop === 'none' && !s.lastVisit);
    const opts = (stores.length ? stores : App.state.stores.slice(0, 6)).map((s) => ({ v: s.id, l: `${s.name} · ${s.street}${s.isNew ? ' · 新开' : ''}` }));
    S.form({
      title: '下发客户', submit: '下发 · 生成任务',
      fields: [
        { key: 'storeId', label: '客户', type: 'select', required: true, value: opts[0].v, options: opts },
        { key: 'toId', label: '下发给', type: 'member', required: true, value: 'u_dj', options: team().members.filter((m) => m.role !== 'KA') },
        { key: 'body', label: '要求', type: 'textarea', required: true, value: '请接手该客户并于本周完成首次触达，拜访后 30 秒留痕（设计目标）。' },
        { key: 'due', label: '截止', type: 'seg', value: DUE_OPTS[1].v, options: DUE_OPTS },
      ],
      onSubmit(v) { const s = App.store(v.storeId); const t = S.createTask({ kind: '下发', title: `下发客户：${s ? s.name : '客户'}${s && s.isNew ? '（新开）' : ''}`, toId: v.toId, due: v.due, source: '主管下发客户', body: v.body, storeId: v.storeId }); S.afterCreate(t); },
    });
  };
  S.taskForm = function () {
    S.form({
      title: '创建任务', submit: '创建 · 等待接受',
      fields: [
        { key: 'toId', label: '接收人', type: 'member', required: true, value: null, options: team().members },
        { key: 'title', label: '任务内容', type: 'textarea', required: true, placeholder: '例：本周补齐二马路合作客户的回访，逐店留痕' },
        { key: 'due', label: '截止', type: 'seg', value: DUE_OPTS[0].v, options: DUE_OPTS },
      ],
      onSubmit(v) { const t = S.createTask({ kind: '任务', title: v.title.trim().slice(0, 40), toId: v.toId, due: v.due, source: '主管创建', body: v.title.trim() }); S.afterCreate(t); },
    });
  };

  /* ----------------------------------------------------------
     主管首页主体（由 home.js 在 role==='mgr' 时调用）
     ---------------------------------------------------------- */
  S.render = function () {
    const st = App.state, tm = st.team, k = tm.kpi, u = me();
    const pendingAppr = S.pendingApprovalCount();
    const hero = `<div class="hero tm-hero"><div class="row between top" style="position:relative;z-index:1"><div class="grow"><div class="h-title">${esc(u.name)} · ${esc(u.roleName)}</div><div class="h-sub">${esc(u.org)} · 近 7 天 · 虚构</div></div><span class="h-chip">${App.icon('users', 12)}团队视图</span></div>
      <div class="h-metrics tiles" style="position:relative;z-index:1">
        <div class="m" onclick="App.go('ask',{q:'团队留痕率是多少'})"><div class="v">${Math.round(k.traceRate * 100)}%</div><div class="l">留痕率</div></div>
        <div class="m" onclick="App.go('ask',{q:'按街道看本周拜访数'})"><div class="v">${k.traced}</div><div class="l">已留痕</div></div>
        <div class="m" onclick="App.go('low-records')"><div class="v">${k.avgScore}</div><div class="l">平均分</div></div>
        <div class="m" onclick="App.go('approvals')"><div class="v">${pendingAppr}</div><div class="l">待审批</div></div>
      </div></div>`;
    const quick = `<div class="quick-grid tm-quick">
      <div class="quick" onclick="S_TEAM.urgeForm()"><div class="qi warn">催</div>一键催办</div>
      <div class="quick" onclick="S_TEAM.coachForm()"><div class="qi brand">辅</div>发起辅导</div>
      <div class="quick" onclick="S_TEAM.assignForm()"><div class="qi ai">发</div>下发客户</div>
      <div class="quick" onclick="S_TEAM.taskForm()"><div class="qi navy">建</div>创建任务</div></div>`;
    const sum = `<div class="tm-sum"><div class="st"><div class="t">${App.icon('sparkle', 16)}团队即时总结</div><span class="ai-tag">日日新大模型 · 近 7 天</span></div>${tm.summary.map((l) => `<p>${esc(l)}</p>`).join('')}<div class="sf">按已归档记录即时生成 · AI 派生，不改正式值 · 门槛 ${st.settings.threshold} 分</div></div>`;
    const pend = tm.pendingTrace;
    const pendCard = `<div class="card tm-pend"><div class="tm-card-head"><div class="card-title">今日已打点未留痕 · ${pend.length}</div>${App.ui.chip('点名', 'warn', { sm: true })}</div>
      ${pend.length ? pend.map((p) => { const m = S.member(p.memberId) || { name: p.name, color: '#b9770e' }; const s = App.store(p.storeId) || { name: '—' }; const urged = st.tasks.some((t) => t.kind === '催办' && t.toId === p.memberId && !['已完成', '已拒绝'].includes(t.status)); return `<div class="tm-row"><div class="tm-tile warn">${esc(App.initials(m.name))}</div><div class="grow" style="min-width:0"><div class="tn ellipsis">${esc(p.name)} · ${esc(s.name.replace(/（.*?）/g, ''))}</div><div class="ts ellipsis">${esc(p.checkin)} 打点 · 尚未留痕${urged ? ' · 已催办' : ''}</div></div>${App.ui.btn('一键催办', { tone: 'primary', size: 'sm', onclick: `S_TEAM.urge('${p.memberId}','${p.storeId}')` })}</div>`; }).join('') : '<div class="muted small">今日打点门店均已留痕</div>'}</div>`;
    const askCard = `<div class="card"><div class="tm-card-head"><div class="card-title">数据咨询</div><a onclick="App.go('ask')">日日新大模型 · 按数据范围</a></div>
      <div class="tm-ask"><input id="tmHomeAsk" placeholder="例：按门店类型看转化率" onkeydown="if(event.key==='Enter')S_TEAM.askFromHome()">${App.ui.btn('问', { tone: 'primary', size: 'sm', onclick: 'S_TEAM.askFromHome()' })}</div>
      <div class="tm-qwrap">${tm.ask.map((a) => `<span class="tm-qchip" onclick="App.go('ask',{q:'${esc(a.q)}'})">${esc(a.q)}</span>`).join('')}</div></div>`;
    const members = `<div class="card"><div class="tm-card-head"><div class="card-title">成员留痕 · 近 7 天</div>${App.ui.chip(`${tm.members.length} 人`, 'gray', { sm: true })}</div>
      ${tm.members.map((m) => `<div class="tm-row pressable" onclick="App.go('team-member',{id:'${m.id}'})">${S.avatar(m)}<div class="grow" style="min-width:0"><div class="tn"><span class="ellipsis">${esc(m.name)}</span>${App.ui.chip(m.role, m.role === 'KA' ? 'ai' : 'outline', { sm: true })}</div><div class="ts">打点 ${m.checked} · 留痕 ${m.traced} · 平均 ${m.avg}</div></div>${m.low > 0 ? App.ui.chip(`低分 ${m.low}`, 'danger', { sm: true }) : App.ui.chip('无低分', 'ok', { sm: true })}${App.icon('chevron-right', 16)}</div>`).join('')}</div>`;
    const appr = tm.approvals.filter((a) => a.status === '审批中');
    const lows = tm.lowRecords;
    const rows = `<div class="list">
      ${App.ui.cell({ title: `待审批方案 · ${pendingAppr}`, sub: appr.length ? `${esc(appr[0].title)} · 折扣 ${appr[0].discount}% · ${esc(appr[0].by)}` : '暂无待审批', icon: 'receipt', iconTone: 'warn', onclick: "App.go('approvals')", right: pendingAppr ? App.ui.chip('通过 / 驳回', 'warn', { sm: true }) : '' })}
      ${App.ui.cell({ title: `低分记录 · 近 7 天 · ${k.lowScore7d}`, sub: `${esc(lows.map((l) => l.by).filter((v, i, a) => a.indexOf(v) === i).join(' / '))} · 门槛 ${st.settings.threshold} 分 · 可发起辅导`, icon: 'alert', iconTone: 'danger', onclick: "App.go('low-records')" })}
      ${App.ui.cell({ title: `我发出的任务 · ${st.tasks.filter((t) => t.fromRole === 'mgr' && !isMe(t.toId)).length}`, sub: `待接受 ${st.tasks.filter((t) => t.fromRole === 'mgr' && t.status === '待接受').length} · 执行中 ${st.tasks.filter((t) => t.fromRole === 'mgr' && t.status === '执行中').length} · 结果推回本页`, icon: 'send', iconTone: 'info', onclick: "App.go('tasks')" })}
    </div>`;
    const cap = `<div class="tm-cap"><div class="ct">${App.icon('info', 13)}五个过程指标口径（deck p24）</div><div class="ci"><b>留痕率</b><span>已归档 ÷ 已打点</span><b>平均质量分</b><span>评分之和 ÷ 已归档，门槛 ${st.settings.threshold} 分</span><b>下一步兑现率</b><span>按期完成 ÷ 待办与回访提醒</span><b>轨迹覆盖率</b><span>已打点 ÷ 计划拜访</span><b>方案转化率</b><span>进方案与审批 ÷ 已归档</span></div><div class="cn">口径为本方案建议，目标值由试点共同设定 · 每个数字可下钻到具体一条拜访记录 · 团队成员与数字均为虚构演示值</div></div>`;
    return `${hero}${quick}${sum}${pendCard}${askCard}${members}${rows}${cap}`;
  };
  S.mount = function () { /* 首页无需额外绑定；输入框使用内联事件 */ };
  S.askFromHome = function () {
    const inp = App.q('#tmHomeAsk');
    const q = inp ? inp.value.trim() : '';
    if (!q) { App.toast('请输入问题或点下方示例', { bottom: true }); return; }
    App.go('ask', { q });
  };

  /* ----------------------------------------------------------
     ask · 数据咨询（只读已入库数据；无数据即答无数据）
     ---------------------------------------------------------- */
  S.findAsk = function (q) {
    const list = team().ask;
    const exact = list.find((a) => a.q === q); if (exact) return exact;
    const s = q.replace(/\s/g, '');
    if (/留痕率/.test(s)) return list.find((a) => a.kind === 'stat') || null;
    if (/街道/.test(s)) return list.find((a) => /街道/.test(a.q)) || null;
    if (/类型|转化/.test(s)) return list.find((a) => /类型/.test(a.q)) || null;
    if (/每天|每日|按天|周几/.test(s)) return list.find((a) => /每天/.test(a.q)) || null;
    return null;
  };
  S.askLog = () => { const ui = App.state.ui; if (!Array.isArray(ui.askLog)) ui.askLog = []; return ui.askLog; };
  S.ask = function (q) {
    q = (q || '').trim(); if (!q) return;
    const log = S.askLog();
    log.push({ q, at: S.stamp() });
    if (log.length > 6) log.splice(0, log.length - 6);
    App.save();
    const cur = App.currentEntry();
    if (cur && cur.id === 'ask') { App.refresh(); S.scrollAskBottom(); } else App.go('ask');
  };
  S.askSubmit = function () { const inp = App.q('#tmAskIn'); const q = inp ? inp.value.trim() : ''; if (!q) { App.toast('请输入问题', { bottom: true }); return; } if (inp) inp.value = ''; S.ask(q); };
  S.askClear = function () { App.state.ui.askLog = []; App.save(); App.refresh(); };
  S.scrollAskBottom = function () { const c = App.currentEntry() && App.currentEntry().el.querySelector('.content'); if (c) setTimeout(() => { c.scrollTop = c.scrollHeight; }, 30); };
  S.askDetail = function (i) {
    const a = team().ask[i]; if (!a) return;
    const items = a.kind === 'bars'
      ? a.rows.map((r) => ({ label: r.label, sub: `${a.definition}`, right: r.display != null ? r.display : String(r.value), icon: 'chart', onSelect() { App.toast(`下钻 · ${r.label}：可查看具体拜访记录（演示）`, { icon: 'list' }); } }))
      : [{ label: `${a.value} · ${a.sub}`, sub: a.definition, icon: 'chart' }, { label: '按成员查看', sub: team().members.map((m) => `${m.name} ${m.traced}/${m.checked}`).join(' · '), icon: 'users', onSelect() { App.toast('已按成员展开（演示）', { icon: 'users' }); } }];
    App.sheet({ title: `${a.q} · 明细（${a.period} · ${a.scope}）`, items });
  };
  S.answerCard = function (q) {
    const a = S.findAsk(q);
    const idx = a ? team().ask.indexOf(a) : -1;
    if (!a) {
      return `<div class="tm-ans"><div class="ah"><div class="logo">${App.icon('sparkle', 15)}</div><div class="grow"><div class="t">无数据即答无数据</div><div class="m">日日新大模型 · 只读已入库数据</div></div></div>
        <div class="tm-nodata"><div class="ni">${App.icon('inbox', 18)}</div><div><div class="nt">当前范围内没有可回答的数据</div><div class="ns">「${esc(q)}」在 地推一队 · 近 7 天 的已入库数据里找不到对应统计口径，不用常识补数。可以换一个问法：</div></div></div>
        <div class="ab" style="padding-top:0"><div class="tm-qwrap">${team().ask.map((x) => `<span class="tm-qchip" onclick="S_TEAM.ask('${esc(x.q)}')">${esc(x.q)}</span>`).join('')}</div></div>
        <div class="af"><span>写入类操作不在数据咨询内，请到对应页面并经人工确认</span></div></div>`;
    }
    let body = '';
    if (a.kind === 'bars') {
      const rows = a.rows.map((r) => ({ label: r.label, value: r.value || 0, display: r.display != null ? r.display : (r.value ? String(r.value) : '暂无数据'), tone: r.value ? '' : 'warn' }));
      body = App.ui.bars(rows);
    } else if (a.kind === 'stat') {
      body = `<div class="tm-stat"><div class="v">${esc(a.value)}</div><div class="s">${esc(a.sub)}</div></div><div class="muted small mt8">口径：${esc(a.definition)}</div>`;
    }
    return `<div class="tm-ans"><div class="ah"><div class="logo">${App.icon('sparkle', 15)}</div><div class="grow"><div class="t">${esc(a.q)}</div><div class="m">日日新大模型 · 统计结果 · 只读已入库数据</div></div></div>
      <div class="meta"><div class="full"><b>时间范围</b>${esc(a.period)}</div><div><b>组织范围</b>${esc(a.scope)}</div><div><b>样本</b>${a.sample} 条 · <b>更新</b>${esc(a.updatedAt.slice(11))}</div><div class="full"><b>口径</b>${esc(a.definition)}</div></div>
      <div class="ab">${body}</div>
      <div class="af"><span>演示数据 · 数字可下钻到具体记录</span><a onclick="S_TEAM.askDetail(${idx})">查看明细 ›</a></div></div>`;
  };
  App.register('ask', {
    title: '数据咨询', tab: 'home',
    prd: ['deck p21 · 主管手机端', 'deck p26 · 数据咨询问答'],
    rules: ['回答带时间范围、组织范围与口径', '只读已入库数据', '无数据即答无数据，不用常识补数'],
    render(params) {
      const log = S.askLog();
      if (params.q && !params._seen) { params._seen = true; if (!log.length || log[log.length - 1].q !== params.q) { log.push({ q: params.q, at: S.stamp() }); if (log.length > 6) log.splice(0, log.length - 6); App.save(); } }
      const chips = `<div class="card tight"><div class="row between mb8"><div class="small" style="font-weight:600">${App.icon('sparkle', 14)} 日日新大模型 · 按数据范围 · 只读已入库数据</div>${log.length ? `<a class="small muted" onclick="S_TEAM.askClear()">清空</a>` : ''}</div>
        <div class="tm-qwrap">${team().ask.map((a) => `<span class="tm-qchip ${log.length && log[log.length - 1].q === a.q ? 'on' : ''}" onclick="S_TEAM.ask('${esc(a.q)}')">${esc(a.q)}</span>`).join('')}<span class="tm-qchip" onclick="S_TEAM.ask('各成员的客诉数量')">各成员的客诉数量</span></div>
        <div class="muted tiny mt8">数据范围：${esc(me().scope)}（${esc(me().org)}）· 演示为预置问答</div></div>`;
      const chat = log.length ? `<div class="tm-chat">${log.map((l) => `<div class="tm-me">${esc(l.q)}</div>${S.answerCard(l.q)}`).join('')}</div>` : `<div class="list">${App.ui.empty({ icon: 'chart', title: '问一句就有统计结果', sub: '例：按门店类型看转化率 · 回答附时间范围、组织范围与口径' })}</div>`;
      return `${chips}${chat}`;
    },
    footer() { return `<div class="tm-ask" style="margin:0"><input id="tmAskIn" placeholder="例：按门店类型看转化率" onkeydown="if(event.key==='Enter')S_TEAM.askSubmit()">${App.ui.btn('问', { tone: 'primary', onclick: 'S_TEAM.askSubmit()', icon: 'send' })}</div>`; },
    mount() { if (S.askLog().length) S.scrollAskBottom(); },
    demoActions: [{ label: '问一个无数据的问题', icon: 'inbox', run() { S.ask('各成员的客诉数量'); } }],
  });

  /* ----------------------------------------------------------
     approvals · 待审批方案（通过 / 驳回附意见）
     ---------------------------------------------------------- */
  S.approvalList = function () {
    const list = team().approvals.map((a) => Object.assign({ _src: 'team' }, a));
    (App.state.proposals || []).forEach((p) => {
      if (p.status !== '审批中' && p.status !== '已通过' && p.status !== '已驳回') return;
      if (list.some((a) => a.id === p.id)) return;
      const s = App.store(p.storeId);
      list.push({ _src: 'proposal', id: p.id, title: p.title || `${s ? s.name.replace(/（.*?）/g, '') : '客户'} · 报价 ${p.version || 'v1'}`, by: p.by || (s ? s.ownerName : '王小明'), discount: p.discount != null ? p.discount : (p.discountPct || 0), amount: p.amount || (p.total != null ? App.fmt.money(p.total) : '—'), reason: p.reason || '折扣超阈值（10%）提交价格审批', status: p.status, submittedAt: p.submittedAt || TODAY, history: p.history || [] });
    });
    return list;
  };
  S.approvalStatusChip = (st) => ({ 审批中: App.ui.chip('审批中', 'warn'), 已通过: App.ui.chip('已通过', 'ok'), 已驳回: App.ui.chip('已驳回', 'danger') }[st] || App.ui.chip(st, 'gray'));
  S.selectApproval = function (id) { App.state.ui.apprSel = id; App.save(); App.refresh(); };
  S.findApproval = function (id) { return team().approvals.find((a) => a.id === id) || (App.state.proposals || []).find((p) => p.id === id) || null; };
  S.decide = function (id, ok, comment) {
    const a = S.findApproval(id); if (!a) return;
    a.status = ok ? '已通过' : '已驳回';
    a.decidedAt = S.stamp(); a.comment = comment || (ok ? '同意，按规则内执行' : '');
    a.history = a.history || [];
    a.history.push({ t: a.decidedAt, e: `主管 李华 ${ok ? '通过' : '驳回'}${comment ? `：${comment}` : ''}` });
    const byM = S.memberByName(a.by);
    const toId = byM ? byM.id : 'u_dj';
    const opp = App.state.opportunities.find((o) => o.approval === '审批中' && (a.title || '').includes((o.name || '').split(' ')[0].replace(/（.*?）/g, '').slice(0, 4)));
    if (opp) opp.approval = a.status;
    if (ok) {
      S.createTask({ kind: '报价', title: `发送正式报价 · ${(a.title || '').replace(/ · 报价.*$/, '')}（审批已通过）`, toId, due: S.addDays(TODAY, 1), source: '审批通过自动生成', body: `折扣 ${a.discount}%，主管审批已通过，请发送正式报价单。${a.comment ? `审批意见：${a.comment}` : ''}` });
      const t = App.state.tasks[0]; if (t) { t.from = '价格审批'; t.fromRole = 'sys'; t.status = '执行中'; t.history = [{ t: a.decidedAt, e: `主管 李华 审批通过（折扣 ${a.discount}%）` }, { t: a.decidedAt, e: '系统生成待办' }]; }
    } else {
      S.createTask({ kind: '报价', title: `报价被驳回 · 修改后重新提交 · ${(a.title || '').replace(/ · 报价.*$/, '')}`, toId, due: S.addDays(TODAY, 1), source: '价格审批驳回', body: `驳回意见：${comment}` });
      const t = App.state.tasks[0]; if (t) { t.from = '价格审批'; t.fromRole = 'sys'; t.status = '执行中'; t.history = [{ t: a.decidedAt, e: `主管 李华 驳回：${comment}` }, { t: a.decidedAt, e: '结论已回推销售手机端' }]; }
    }
    team().kpi.pendingApprovals = S.pendingApprovalCount();
    App.save(); App.refresh();
    App.toast(ok ? '已通过 · 结论已回推销售手机端，并生成「发送正式报价」待办' : '已驳回 · 结论与意见已回推销售手机端', { icon: ok ? 'check-circle' : 'x', duration: 2200 });
  };
  S.approve = function (id) { App.confirm('通过审批', '通过后锁定该报价版本，销售端生成「发送正式报价」待办；成本与毛利为占位字段（口径由贵司提供）。', () => S.decide(id, true, '同意，按规则内执行'), '通过'); };
  S.reject = function (id) {
    App.prompt('驳回 · 意见必填', '例：折扣超 10% 但账期未压缩，请改为 6% 或缩短账期后重新提交', (v) => {
      const c = (v || '').trim();
      if (!c) { App.toast('驳回须附意见，已推回前请填写', { bottom: true, icon: 'alert' }); setTimeout(() => S.reject(id), 200); return; }
      S.decide(id, false, c);
    }, '驳回并推回');
  };
  App.register('approvals', {
    title: '待审批方案', tab: 'home',
    prd: ['deck p20 · 分享与审批', 'deck p21 · 主管手机端'],
    rules: ['折扣超阈值（10%）须价格审批，销售端不能自批', '驳回附意见必填，结论回推销售手机端', '成本与毛利为占位字段，口径由贵司提供'],
    render() {
      const list = S.approvalList();
      const pend = list.filter((a) => a.status === '审批中');
      const sel = list.find((a) => a.id === App.state.ui.apprSel) || pend[0] || list[0];
      const head = `<div class="row between" style="padding:4px 2px 10px"><div><div style="font-size:22px;font-weight:800;letter-spacing:-.01em">待审批 · ${pend.length}</div><div class="muted small">价格审批 · 折扣超阈值 10% · 审批人 ${esc(me().name)} · ${esc(me().org)}</div></div>${App.ui.chip('审批人可见成本', 'outline', { sm: true, icon: 'eye-off' })}</div>`;
      const cells = list.length ? `<div class="list">${list.map((a) => `<div class="cell pressable ${sel && sel.id === a.id ? 'tm-sel' : ''}" onclick="S_TEAM.selectApproval('${a.id}')" style="${sel && sel.id === a.id ? 'background:var(--brand-soft)' : ''}"><div class="tm-tile ai">价</div><div class="cell-body"><div class="cell-title ellipsis">${esc(a.title)}</div><div class="cell-sub ellipsis">${esc(a.by)} · 折扣 ${a.discount}% · ${esc(a.amount)}</div></div><div class="cell-right">${S.approvalStatusChip(a.status)}</div></div>`).join('')}</div>` : `<div class="list">${App.ui.empty({ icon: 'check-circle', title: '暂无待审批', sub: '销售端提交超阈值折扣后会出现在这里' })}</div>`;
      if (!sel) return head + cells;
      const hist = (sel.history || []).length ? App.ui.timeline(sel.history.map((h) => ({ time: h.t, title: esc(h.e), tone: /驳回/.test(h.e) ? 'warn' : '' }))) : '';
      const detail = `<div class="card tm-appr"><div class="row between top"><div class="grow"><div class="eyebrow" style="text-transform:none">方案版本 · 报价 ${esc(sel.title.match(/v\d+/) ? sel.title.match(/v\d+/)[0] : 'v1')} · 提交 ${esc(App.fmt.md(sel.submittedAt))}</div><div class="ap-amt mt4">${esc(sel.amount)}</div></div>${S.approvalStatusChip(sel.status)}</div>
        <div class="mt12">
          <div class="ap-line"><span class="k">方案</span><span class="v">${esc(sel.title)}</span></div>
          <div class="ap-line"><span class="k">提交人</span><span class="v">${esc(sel.by)}</span></div>
          <div class="ap-line"><span class="k">折扣</span><span class="v">${sel.discount}%${sel.discount > App.state.gtm.discountThreshold ? ` ${App.ui.chip(`超阈值 ${App.state.gtm.discountThreshold}%`, 'warn', { sm: true })}` : ` ${App.ui.chip('账期条款触发', 'warn', { sm: true })}`}</span></div>
          <div class="ap-line"><span class="k">申请理由</span><span class="v">${esc(sel.reason)}</span></div>
          ${sel.comment ? `<div class="ap-line"><span class="k">审批意见</span><span class="v">${esc(sel.comment)}</span></div>` : ''}
        </div>
        <div class="ap-ph">${App.icon('lock', 13)} 成本与毛利（审批人可见）：<b>成本 ¥— · 毛利 —</b>（占位字段，口径由贵司提供；销售端不可见）</div>
        ${sel.status === '审批中' ? `<div class="btn-row mt12">${App.ui.btn('驳回（附意见）', { tone: 'outline', onclick: `S_TEAM.reject('${sel.id}')` })}${App.ui.btn('通过', { tone: 'primary', onclick: `S_TEAM.approve('${sel.id}')`, icon: 'check' })}</div>` : App.ui.notice(sel.status === '已通过' ? 'ok' : 'warn', `${esc(sel.status)} · ${esc(sel.decidedAt || '')} · 结论已回推销售手机端${sel.status === '已通过' ? '，并生成「发送正式报价」待办' : '，销售修改折扣后可重新提交'}`)}
        ${hist ? `<div class="mt12"><div class="eyebrow mb8">审批记录</div>${hist}</div>` : ''}</div>`;
      return head + cells + detail + `<div class="tm-foot">通过后锁定版本并生成「发送正式报价」待办；驳回须附意见并推回销售。同时记录审批时长与驳回原因（方案转化率口径）。</div>`;
    },
    demoActions: [{ label: '重置审批为审批中', icon: 'refresh', run() { team().approvals.forEach((a) => { a.status = '审批中'; delete a.comment; delete a.decidedAt; a.history = []; }); team().kpi.pendingApprovals = S.pendingApprovalCount(); App.save(); App.refresh(); App.toast('已重置'); } }],
  });

  /* ----------------------------------------------------------
     low-records · 低分记录（近 7 天）
     ---------------------------------------------------------- */
  S.openLow = function (i) {
    const r = team().lowRecords[i]; if (!r) return;
    if (r.visitId && App.visit(r.visitId)) App.go('visit-detail', { id: r.visitId });
    else App.toast(`${r.by} · ${r.store}：该条记录原文未纳入演示（团队成员数据）`, { icon: 'eye-off', duration: 2000 });
  };
  S.coachFromLow = function (i) {
    const r = team().lowRecords[i]; if (!r) return;
    const m = S.memberByName(r.by);
    S.coachForm(m ? m.id : 'u_dj', { store: r.store, visitId: r.visitId || null, title: `辅导：${r.issue.split('、')[0].replace(/为空|缺失|模糊/g, '')}的记录方法`.replace('辅导：缺', '辅导：'), body: `结合 ${r.store} 那条 ${r.score} 分记录（${r.issue}），一起过一遍「预算区间 + 具体时间 + 动作」的口述结构；完成一次 15 分钟对练并重新提交该条记录。`, source: '来自记录复盘' });
  };
  App.register('low-records', {
    title: '低分记录', tab: 'home',
    prd: ['deck p21 · 主管手机端', 'deck p25 · 拜访记录复盘'],
    rules: ['门槛 60 分（贵司口径默认），低于门槛归档禁用', '每条可下钻到原音原文与五维评分', '发起辅导任务落到销售待办，接受 / 拒绝附意见'],
    render() {
      const st = App.state, lows = team().lowRecords;
      const head = `<div class="row between" style="padding:4px 2px 10px"><div><div style="font-size:22px;font-weight:800;letter-spacing:-.01em">低分记录 · 近 7 天 · ${team().kpi.lowScore7d}</div><div class="muted small">${esc(me().org)} · 门槛 ${st.settings.threshold} 分 · 展示 ${lows.length} 条样例</div></div>${App.ui.chip(`门槛 ${st.settings.threshold}`, 'warn', { sm: true })}</div>`;
      const dims = `<div class="card tight"><div class="row wrap" style="gap:6px">${Object.entries(st.settings.weights).map(([k, v]) => App.ui.chip(`${k} ${v}`, 'outline', { sm: true })).join('')}</div><div class="muted tiny mt8">五维评分：低于门槛时给分项理由与 AI 建议；集中问题：缺预算、下一步模糊、沟通结论缺失</div></div>`;
      const list = `<div class="list">${lows.map((r, i) => `<div class="cell pressable" onclick="S_TEAM.openLow(${i})"><div class="tm-tile danger">${r.score}</div><div class="cell-body"><div class="cell-title row"><span class="ellipsis">${esc(r.store)}</span>${App.ui.chip(`${r.score} 分`, 'warn', { sm: true })}</div><div class="cell-sub ellipsis">${esc(r.by)} · ${esc(r.issue)}${r.visitId ? ' · 可看原文' : ''}</div></div><div class="cell-right">${App.ui.btn('发起辅导', { tone: 'secondary', size: 'xs', onclick: `event.stopPropagation();S_TEAM.coachFromLow(${i})` })}</div></div>`).join('')}</div>`;
      const sum = App.ui.aiCard({ title: 'AI 复盘提示', meta: '日日新大模型 · 派生数据 · 不改正式值', body: `<ul><li>3 条集中在「缺预算」与「下一步模糊」，建议对王小明发起一次 15 分钟对练。</li><li>「近期跟进」类下一步不通过硬校验，示范写法：「9月12日前送方案与报价」。</li></ul>` });
      return head + dims + list + sum + `<div class="tm-foot">点击记录查看原音 / 原文 / 结构化字段与五维评分；团队成员数据为虚构演示值</div>`;
    },
  });

  /* ----------------------------------------------------------
     team-member · 成员
     ---------------------------------------------------------- */
  App.register('team-member', {
    title: '成员', tab: 'home',
    prd: ['deck p21 · 主管手机端', 'deck p25 · 成员表'],
    rules: ['主管看直属团队成员的过程指标', '数字可下钻到该成员客户与记录'],
    nav(params) { const m = S.member(params.id); return { title: m ? m.name : '成员' }; },
    render(params) {
      const m = S.member(params.id);
      if (!m) return App.ui.empty({ icon: 'user', title: '成员不存在', sub: '仅可查看直属团队成员' });
      const stores = App.state.stores.filter((s) => s.ownerId === m.id || s.ownerName === m.name);
      const rate = m.checked ? Math.round((m.traced / m.checked) * 100) : null;
      const tasks = App.state.tasks.filter((t) => t.toId === m.id && t.status !== '已完成');
      const head = `<div class="hero tm-hero"><div class="row" style="position:relative;z-index:1;gap:14px">${S.avatar(m, 'lg')}<div class="grow"><div class="h-title">${esc(m.name)}</div><div class="h-sub">${esc(m.role === 'KA' ? 'KA 销售 · KA 部 · 华东' : '地推销售 · 地推一队')} · 近 7 天 · 虚构</div><div class="mt8 row wrap" style="gap:6px"><span class="h-chip">留痕率 ${rate == null ? '暂无数据' : rate + '%'}</span><span class="h-chip">${m.low > 0 ? `低分 ${m.low}` : '无低分'}</span></div></div></div></div>`;
      const kpis = `<div class="tm-kpi4"><div class="k brand"><div class="v">${m.checked}</div><div class="l">打点</div></div><div class="k ok"><div class="v">${m.traced}</div><div class="l">留痕</div></div><div class="k ai"><div class="v">${m.avg}</div><div class="l">平均分</div></div><div class="k ${m.low > 0 ? 'danger' : ''}"><div class="v">${m.low}</div><div class="l">低分</div></div></div>`;
      const storeList = stores.length ? `<div class="list">${stores.slice(0, 12).map((s) => App.ui.cell({ title: esc(s.name), sub: `${esc(s.street)} · ${esc(s.category)} · ${s.lastVisit ? `上次 ${App.fmt.md(s.lastVisit)}` : '未拜访'}${s.lastNext ? ` · ${esc(s.lastNext)}` : ''}`, right: App.ui.traceChip(s.route ? s.route.trace : 'todo', { sm: true }), onclick: `App.go('customer',{id:'${s.id}'})` })).join('')}${stores.length > 12 ? `<div class="cell"><div class="cell-body muted small">还有 ${stores.length - 12} 家 · 到「客户」Tab 按负责人筛选</div></div>` : ''}</div>` : `<div class="list">${App.ui.empty({ icon: 'store', title: '演示数据未收录该成员客户', sub: '客户表三端共用，按负责人筛选' })}</div>`;
      const taskSec = `${App.ui.section(`发给 ${esc(m.name)} 的任务 · ${tasks.length}`, `<a onclick="App.go('tasks')">全部 ›</a>`)}<div class="list">${tasks.length ? tasks.map((t) => S.taskCell(t)).join('') : App.ui.empty({ icon: 'check-circle', title: '暂无进行中任务' })}</div>`;
      return `${head}${kpis}${App.ui.section(`负责客户 · ${stores.length}`, `<span class="muted small">今日留痕状态</span>`)}${storeList}${taskSec}<div class="tm-foot">留痕率 = 已归档 ÷ 已打点；平均分为已归档记录评分均值；均为虚构演示值</div>`;
    },
    footer(params) { return `<div class="btn-row">${App.ui.btn('一键催办', { tone: 'outline', onclick: `S_TEAM.urge('${esc(params.id)}')`, icon: 'bell' })}${App.ui.btn('发起辅导任务', { tone: 'primary', onclick: `S_TEAM.coachForm('${esc(params.id)}')`, icon: 'coach' })}</div>`; },
  });

  /* ----------------------------------------------------------
     task · 任务详情（接受 / 拒绝附意见 / 完成 / 延期）
     ---------------------------------------------------------- */
  S.pushHistory = (t, e) => { t.history = t.history || []; t.history.push({ t: S.stamp(), e }); };
  S.accept = function (id) {
    const t = App.task(id); if (!t) return;
    t.status = '执行中'; S.pushHistory(t, `${me().name} 接受 · 已推回发起人${t.fromRole === 'sys' ? '' : ` ${t.from.replace(/（.*?）/g, '')}`}`);
    App.save(); App.refresh(); App.toast('已接受 · 任务进入执行中，结果推回发起人', { icon: 'check-circle' });
  };
  S.rejectTask = function (id) {
    const t = App.task(id); if (!t) return;
    App.prompt('拒绝并附意见 · 必填', '例：本周路线已排满，建议改到下周三例会后对练', (v) => {
      const c = (v || '').trim();
      if (!c) { App.toast('拒绝须附意见，否则无法推回发起人', { bottom: true, icon: 'alert' }); setTimeout(() => S.rejectTask(id), 200); return; }
      t.status = '已拒绝'; t.rejectReason = c; S.pushHistory(t, `${me().name} 拒绝：${c}（已推回发起人）`);
      App.save(); App.refresh(); App.toast('已拒绝 · 意见已推回发起人', { icon: 'x' });
    }, '拒绝并推回');
  };
  S.complete = function (id) {
    const t = App.task(id); if (!t) return;
    App.prompt('标记完成 · 记录结果', '例：已完成对练并重新提交记录，评分 74', (v) => {
      const c = (v || '').trim();
      t.status = '已完成'; t.result = c || '已完成'; t.doneAt = S.stamp(); S.pushHistory(t, `${me().name} 完成：${c || '已完成'}（结果推回发起人）`);
      App.save(); App.refresh(); App.toast('已完成 · 结果已推回发起人', { icon: 'check-circle' });
    }, '完成');
  };
  S.defer = function (id) {
    const t = App.task(id); if (!t) return;
    App.prompt('延期 · 原因必填（一键延至次日）', '例：客户老板出差，改到明天', (v) => {
      const c = (v || '').trim();
      if (!c) { App.toast('延期须填原因', { bottom: true, icon: 'alert' }); setTimeout(() => S.defer(id), 200); return; }
      const from = t.due; t.due = S.addDays(t.due < TODAY ? TODAY : t.due, 1); t.deferred = { from, reason: c };
      S.pushHistory(t, `${me().name} 延期至次日（${App.fmt.md(t.due)}）：${c}`);
      App.save(); App.refresh(); App.toast(`已延期至 ${App.fmt.md(t.due)} · 原因已记录并推回发起人`, { icon: 'clock' });
    }, '延期一天');
  };
  S.nudge = function (id) { const t = App.task(id); if (!t) return; S.pushHistory(t, `${me().name} 催了一下`); App.save(); App.refresh(); App.toast(`已提醒 ${S.memberName(t.toId)} · 微信通知已发送（演示）`, { icon: 'bell' }); };
  App.register('task', {
    title: '任务详情', tab: 'home',
    prd: ['deck p21 · 任务详情', 'deck p25 · 发起辅导任务'],
    rules: ['任意角色可发；接收方接受 / 拒绝须填意见，结果推回发起人', '标记完成记录结果；延期原因必填，一键延至次日', '来源标明主管辅导 / 催办 / 审批自动生成'],
    render(params) {
      const t = App.task(params.id);
      if (!t) return App.ui.empty({ icon: 'inbox', title: '任务不存在', sub: '可能已被重置', action: App.ui.btn('回到待办', { tone: 'ghost', size: 'sm', onclick: "App.go('tasks')" }) });
      const mine = isMe(t.toId);
      const initiatorId = S.initiator(t);
      const iAmInitiator = !mine && initiatorId === me().id;
      const overdue = S.isOverdue(t);
      const store = t.storeId ? App.store(t.storeId) : null;
      const visit = t.visitId ? App.visit(t.visitId) : null;
      const head = `<div class="card"><div class="row between"><span class="chip ${t.kind === '催办' ? 'warn' : ''}" style="${t.kind === '催办' ? '' : 'background:#0f2444;color:#fff'}">${esc(S.kindLabel(t.kind))}</span><span class="row" style="gap:6px">${overdue ? App.ui.chip('逾期', 'danger', { icon: 'alert' }) : ''}${S.statusChip(t.status)}</span></div>
        <div class="tm-task-head"><div class="grow"><h2>${esc(t.title)}</h2></div></div></div>`;
      const criteria = { 催办: '完成该客户留痕并通过两道闸门', 辅导: '完成一次 15 分钟对练并重新提交该条记录', 下发: '完成首次拜访并留痕', 报价: '发送正式报价单并在客户档案标记已发送', 任务: '按内容完成并记录结果' }[t.kind] || '按内容完成并记录结果';
      const kv = `<div class="card"><div class="tm-kv">
        <div class="r"><span class="k">来源</span><span class="v">${esc(t.source || '—')}</span></div>
        <div class="r"><span class="k">发起人</span><span class="v">${esc(t.from)}${iAmInitiator ? '（我）' : ''}</span></div>
        <div class="r"><span class="k">执行人</span><span class="v">${esc(S.memberName(t.toId))}${mine ? '（我）' : ''}</span></div>
        ${store ? `<div class="r"><span class="k">关联客户</span><span class="v link" onclick="App.go('customer',{id:'${store.id}'})">${esc(store.name)} ›</span></div>` : ''}
        ${visit ? `<div class="r"><span class="k">关联记录</span><span class="v link" onclick="App.go('visit-detail',{id:'${visit.id}'})">${App.fmt.md(visit.time)} · ${visit.score.total} 分 ›</span></div>` : ''}
        <div class="r"><span class="k">截止</span><span class="v" style="${overdue ? 'color:var(--danger);font-weight:600' : ''}">${App.fmt.md(t.due)} 18:00 · ${esc(overdue ? App.fmt.dueLabel(t.due) : App.fmt.rel(t.due))}${t.deferred ? `<span class="muted">曾延期：${esc(t.deferred.reason)}（原 ${App.fmt.md(t.deferred.from)}）</span>` : ''}</span></div>
        <div class="r stack"><span class="k">内容</span><span class="v">${esc(t.body || t.title)}</span></div>
        <div class="r stack"><span class="k">完成标准</span><span class="v">${esc(criteria)}</span></div>
        <div class="r"><span class="k">相关方</span><span class="v">${esc(t.from.replace(/（.*?）/g, ''))}、${esc(S.memberName(t.toId))}</span></div>
        ${t.rejectReason ? `<div class="r"><span class="k">拒绝意见</span><span class="v" style="color:var(--danger)">${esc(t.rejectReason)}</span></div>` : ''}
        ${t.result ? `<div class="r"><span class="k">完成结果</span><span class="v" style="color:var(--ok)">${esc(t.result)}</span></div>` : ''}
      </div></div>`;
      let actions = '';
      if (mine && t.status === '待接受') actions = `<div class="btn-row mb12">${App.ui.btn('接受', { tone: 'primary', size: 'lg', onclick: `S_TEAM.accept('${t.id}')` })}${App.ui.btn('拒绝并附意见', { tone: 'outline', size: 'lg', onclick: `S_TEAM.rejectTask('${t.id}')` })}</div>`;
      else if (mine && t.status === '执行中') actions = `<div class="btn-row mb12">${App.ui.btn('标记完成 · 记录结果', { tone: 'primary', size: 'lg', onclick: `S_TEAM.complete('${t.id}')` })}${App.ui.btn('延期 · 原因必填', { tone: 'outline', size: 'lg', onclick: `S_TEAM.defer('${t.id}')` })}</div>`;
      else if (mine && t.status === '已拒绝') actions = `${App.ui.notice('gray', `已拒绝 · 意见「${esc(t.rejectReason || '')}」已推回发起人`, 'x')}<div class="mb12">${App.ui.btn('改为接受', { tone: 'secondary', block: true, onclick: `S_TEAM.accept('${t.id}')` })}</div>`;
      else if (mine && t.status === '已完成') actions = App.ui.notice('ok', `已完成 ${esc(t.doneAt || '')} · ${esc(t.result || '')} · 结果已推回发起人`);
      else if (iAmInitiator) {
        const note = { 待接受: `等待 ${esc(S.memberName(t.toId))} 接受 / 拒绝；拒绝会附意见推回本页`, 执行中: `${esc(S.memberName(t.toId))} 执行中；完成结果与延期原因会推回本页`, 已完成: `已完成：${esc(t.result || '')}`, 已拒绝: `已拒绝，意见：${esc(t.rejectReason || '')}` }[t.status] || '';
        actions = `${App.ui.notice(t.status === '已拒绝' ? 'warn' : (t.status === '已完成' ? 'ok' : 'info'), `发起人视图（只读）· ${note}`, 'eye-off')}${['待接受', '执行中'].includes(t.status) ? `<div class="mb12">${App.ui.btn('催一下', { tone: 'secondary', block: true, icon: 'bell', onclick: `S_TEAM.nudge('${t.id}')` })}</div>` : ''}`;
      } else actions = App.ui.notice('gray', `只读 · 该任务的执行人是 ${esc(S.memberName(t.toId))}，发起人 ${esc(t.from)}；切换演示账号可操作`, 'eye-off');
      const hist = (t.history || []).length ? App.ui.timeline(t.history.map((h) => ({ time: h.t, title: esc(h.e), tone: /拒绝/.test(h.e) ? 'warn' : (/完成/.test(h.e) ? '' : (/延期|催/.test(h.e) ? 'warn' : 'gray')) }))) : `<div class="muted small">尚无操作记录</div>`;
      return `${head}${kv}${actions}${App.ui.section('操作历史')}<div class="card">${hist}</div><div class="tm-foot">接受 / 拒绝 / 完成会同步到主管首页与 PC 看板；拒绝须附意见并推回发起人；延期一键延至次日并记录原因</div>`;
    },
    demoActions: [{ label: '重置该任务为待接受', icon: 'refresh', run() { const t = App.task(App.currentEntry().params.id); if (!t) return; t.status = '待接受'; delete t.rejectReason; delete t.result; delete t.deferred; t.history = (t.history || []).slice(0, 1); App.save(); App.refresh(); App.toast('已重置'); } }],
  });

  /* ----------------------------------------------------------
     tasks · 待办列表（我的：待接受 / 执行中 / 已完成）
     ---------------------------------------------------------- */
  S.myTasks = function () {
    const u = me();
    return App.state.tasks.filter((t) => t.toId === u.id || (t.fromRole === App.state.role && t.fromRole !== 'sys'));
  };
  S.setTaskSeg = function (s) { App.state.ui.taskSeg = s; App.save(); App.refresh(); };
  App.register('tasks', {
    title: '待办', tab: 'home',
    prd: ['deck p18 · 回访提醒与待办', 'deck p21 · 任务闭环'],
    rules: ['来源标明：主管催办 / 辅导 / 下发 / 审批自动生成', '逾期红标，一键延至次日须填原因'],
    render() {
      const all = S.myTasks();
      const seg = App.state.ui.taskSeg || '待接受';
      const cnt = (s) => all.filter((t) => t.status === s).length;
      const segs = ['待接受', '执行中', '已完成'].map((s) => `<button class="${seg === s ? 'active' : ''}" onclick="S_TEAM.setTaskSeg('${s}')">${s} ${cnt(s)}</button>`).join('');
      const list = all.filter((t) => t.status === seg).sort((a, b) => (a.due < b.due ? -1 : 1));
      const mine = list.filter((t) => isMe(t.toId));
      const sent = list.filter((t) => !isMe(t.toId));
      const head = `<div class="row between" style="padding:4px 2px 10px"><div><div style="font-size:22px;font-weight:800;letter-spacing:-.01em">待办 · ${all.filter((t) => ['待接受', '执行中'].includes(t.status)).length}</div><div class="muted small">${esc(me().name)} · 收到 ${all.filter((t) => isMe(t.toId) && ['待接受', '执行中'].includes(t.status)).length} · 发出 ${all.filter((t) => !isMe(t.toId) && ['待接受', '执行中'].includes(t.status)).length}${cnt('已拒绝') ? ` · 已拒绝 ${cnt('已拒绝')}` : ''}</div></div>${App.isMgr() ? App.ui.btn('创建任务', { tone: 'secondary', size: 'sm', icon: 'plus', onclick: 'S_TEAM.taskForm()' }) : App.ui.btn('回访提醒', { tone: 'ghost', size: 'sm', icon: 'bell', onclick: "App.go('reminders')" })}</div>`;
      const segHtml = `<div class="seg block mb12">${segs}</div>`;
      const overdueN = all.filter(S.isOverdue).length;
      const amber = overdueN && seg !== '已完成' ? `<div class="amber-bar"><span>${overdueN} 项已逾期 · 打开可一键延至次日（原因必填）</span><span class="pill">逾期</span></div>` : '';
      const body = list.length
        ? `${mine.length ? `${sent.length ? App.ui.section(`我收到的 · ${mine.length}`) : ''}<div class="list">${mine.map((t) => S.taskCell(t)).join('')}</div>` : ''}${sent.length ? `${App.ui.section(`我发出的 · ${sent.length}`)}<div class="list">${sent.map((t) => S.taskCell(t, { showTo: true })).join('')}</div>` : ''}`
        : `<div class="list">${App.ui.empty({ icon: 'check-circle', title: `没有${seg}的任务`, sub: '主管任务、审批自动生成与本人创建的待办会出现在这里' })}</div>`;
      const rejected = seg === '已完成' && cnt('已拒绝') ? `${App.ui.section(`已拒绝 · ${cnt('已拒绝')}`)}<div class="list">${all.filter((t) => t.status === '已拒绝').map((t) => S.taskCell(t, { showTo: !isMe(t.toId) })).join('')}</div>` : '';
      return `${head}${segHtml}${amber}${body}${rejected}<div class="tm-foot">回访提醒（分层规则 / 上次约定）在「路线 → 回访提醒与待办」；本页为任务闭环：接受 / 拒绝附意见 / 完成 / 延期</div>`;
    },
  });
})();
