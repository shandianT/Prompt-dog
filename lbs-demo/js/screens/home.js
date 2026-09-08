/* ============================================================
   首页模块：auth（首次授权）/ home（Tab 根）/ review（今日回顾）
   命名空间 window.S_HOME；页面专属样式通过 App.css('home') 注入
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_HOME = {};
  const esc = App.esc;

  App.css('home', `
  /* --- 通用：页首大标题 --- */
  .hm-head { padding: 6px 2px 12px; }
  .hm-head h1 { font-size: 22px; font-weight: 800; letter-spacing: -.01em; line-height: 1.2; }
  .hm-head .d { color: var(--ink-3); font-size: 13px; margin-top: 4px; }
  .hm-head .d a { font-weight: 600; }
  /* --- iOS 开关 --- */
  .hm-switch { position: relative; width: 50px; height: 30px; border-radius: 15px; background: #d9dfe8; transition: background .2s ease; flex: none; cursor: pointer; }
  .hm-switch::after { content: ""; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.18); transition: transform .2s cubic-bezier(.2,.8,.2,1); }
  .hm-switch.on { background: var(--brand); }
  .hm-switch.on::after { transform: translateX(20px); }
  /* --- 授权卡 --- */
  .hm-perm { display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; }
  .hm-perm .ph { display: flex; align-items: center; gap: 12px; }
  .hm-perm .pi { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex: none; }
  .hm-perm .pi.rose { background: #fbe4e2; color: #b8433a; }
  .hm-perm .pi.brand { background: var(--brand-soft); color: var(--brand); }
  .hm-perm .pi.navy { background: #e4e9f3; color: #0f2444; }
  .hm-perm .pt { font-size: 16px; font-weight: 700; }
  .hm-perm .pd { font-size: 13.5px; color: var(--ink-2); line-height: 1.55; }
  .hm-perm .pd b { color: var(--ink); font-weight: 600; margin-right: 4px; }
  .hm-perm .pm { display: flex; gap: 6px; flex-wrap: wrap; }
  .hm-scope { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .hm-scope .sc { background: var(--surface-2); border-radius: 12px; padding: 10px 12px; }
  .hm-scope .sc .k { font-size: 11px; color: var(--ink-3); font-weight: 600; letter-spacing: .04em; }
  .hm-scope .sc .v { font-size: 13.5px; font-weight: 600; margin-top: 3px; line-height: 1.4; }
  /* --- 首页 hero 内元素 --- */
  .hero .h-chip { background: rgba(255,255,255,.16); color: #fff; border: 1px solid rgba(255,255,255,.18); height: 26px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; flex: none; }
  .hero .h-metrics.tiles .m { cursor: pointer; }
  .hero .h-metrics.tiles .m:active { background: rgba(255,255,255,.2); }
  /* --- 街道进度小块 --- */
  .hm-streets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .hm-street { background: var(--surface-2); border-radius: 12px; padding: 10px 10px 10px; cursor: pointer; }
  .hm-street:active { background: var(--surface-3); }
  .hm-street .sn { font-size: 12px; color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hm-street .sv { margin-top: 3px; font-size: 13px; color: var(--ink-3); white-space: nowrap; }
  .hm-street .sv b { font-size: 18px; font-weight: 700; color: var(--ink); margin-right: 1px; }
  .hm-street .progress { margin-top: 8px; height: 5px; }
  .hm-street .progress.ok > i { background: var(--ok); }
  .hm-cap { font-size: 12px; color: var(--ink-3); margin-top: 10px; line-height: 1.5; }
  /* --- 任务 / 提醒 cell 内头像块 --- */
  .hm-tile { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex: none; letter-spacing: .02em; }
  .hm-tile.navy { background: #0f2444; color: #fff; }
  .hm-tile.brand { background: var(--brand-soft); color: var(--brand-3); }
  .hm-tile.ai { background: var(--ai-soft); color: var(--ai); }
  .hm-tile.warn { background: var(--warn-soft); color: #b45309; }
  .hm-tile.gray { background: var(--gray-soft); color: var(--gray); }
  .hm-tile.danger { background: var(--danger-soft); color: #b91c1c; }
  /* --- 今日回顾入口卡 --- */
  .hm-review { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; color: #fff; margin-bottom: 12px; cursor: pointer;
    background: linear-gradient(135deg, #16355f 0%, #0f2444 100%); box-shadow: 0 8px 20px rgba(15,36,68,.22); }
  .hm-review .ri { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,.14); display: flex; align-items: center; justify-content: center; flex: none; }
  .hm-review .rt { font-size: 15px; font-weight: 700; }
  .hm-review .rs { font-size: 12px; opacity: .8; margin-top: 2px; }
  .hm-review:active { opacity: .92; }
  /* --- 回顾页数字块 --- */
  .hm-nums { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
  .hm-num { background: var(--surface); border-radius: 14px; padding: 12px 8px 10px; border: 1px solid rgba(17,24,39,.04); text-align: center; }
  .hm-num .v { font-size: 24px; font-weight: 800; letter-spacing: -.02em; line-height: 1; font-variant-numeric: tabular-nums; }
  .hm-num .l { font-size: 11.5px; color: var(--ink-3); margin-top: 5px; }
  .hm-num.brand .v { color: var(--brand); } .hm-num.ai .v { color: var(--ai); } .hm-num.warn .v { color: var(--warn); } .hm-num.ok .v { color: var(--ok); }
  .hm-sum { border-radius: 18px; padding: 14px 16px; color: #fff; margin-bottom: 12px; background: linear-gradient(135deg, #16355f 0%, #0f2444 60%, #0b1a33 100%); box-shadow: 0 10px 24px rgba(15,36,68,.28); }
  .hm-sum .st { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
  .hm-sum .st .t { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
  .hm-sum .st .ai-tag { background: rgba(21,150,173,.35); color: #bff0f8; border: 1px solid rgba(21,150,173,.6); border-radius: 999px; padding: 3px 9px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .hm-sum p { font-size: 14px; line-height: 1.6; opacity: .95; margin: 0 0 6px; }
  .hm-sum p:last-of-type { margin-bottom: 0; }
  .hm-sum .sf { font-size: 11px; opacity: .6; margin-top: 10px; }
  .hm-pend { border-left: 4px solid var(--warn); }
  .hm-tomo { display: flex; flex-direction: column; gap: 8px; }
  .hm-tomo .ti { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; line-height: 1.5; }
  .hm-tomo .ti .n { width: 22px; height: 22px; border-radius: 7px; background: var(--brand-soft); color: var(--brand-3); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; margin-top: 1px; }
  .hm-seg { display: flex; justify-content: center; margin: 2px 0 10px; }
  .hm-seg .seg button { padding: 0 22px; }
  `);

  /* ----------------------------------------------------------
     数据帮手
     ---------------------------------------------------------- */
  const TODAY = App.TODAY;
  const isMe = (id) => id === App.me().id;
  S.routeStores = function () {
    const st = App.state, me = App.me();
    return st.stores.filter((s) => s.route && (st.role === 'dj' || s.ownerId === me.id)).sort((a, b) => a.route.order - b.route.order);
  };
  S.checked = (list) => list.filter((s) => ['done', 'pending', 'running'].includes(s.route.trace));
  S.traced = (list) => list.filter((s) => s.route.trace === 'done');
  S.pendingStores = (list) => list.filter((s) => s.route.trace === 'pending');
  S.myTasks = () => App.state.tasks.filter((t) => isMe(t.toId) && (t.status === '待接受' || t.status === '执行中'));
  S.dueReminders = () => App.state.reminders.filter((r) => r.status !== 'done' && r.due <= TODAY).sort((a, b) => (a.due < b.due ? -1 : 1));
  S.greeting = function () {
    if (App.state.ui.evening) return '今天辛苦了';
    const h = 10; // 演示时钟 10:30
    if (h < 12) return '早上好'; if (h < 18) return '下午好'; return '晚上好';
  };
  S.kindTone = (kind) => ({ 催办: 'navy', 辅导: 'brand', 报价: 'ai', 下发: 'warn' }[kind] || 'gray');
  S.kindGlyph = (kind) => ({ 催办: '主管', 辅导: '辅导', 报价: '报价', 下发: '下发' }[kind] || (kind || '任务').slice(0, 2));
  S.taskChip = (st) => ({ 待接受: App.ui.chip('待接受', 'warn'), 执行中: App.ui.chip('执行中', 'info'), 已完成: App.ui.chip('已完成', 'ok'), 已拒绝: App.ui.chip('已拒绝', 'gray') }[st] || App.ui.chip(st, 'gray'));
  S.taskSub = (t) => `${esc(t.source || t.from)} · 截止 ${App.fmt.md(t.due)}（${App.fmt.rel(t.due)}）`;
  S.taskCell = (t) => `<div class="cell pressable" onclick="App.go('task',{id:'${t.id}'})"><div class="hm-tile ${S.kindTone(t.kind)}">${esc(S.kindGlyph(t.kind))}</div><div class="cell-body"><div class="cell-title ellipsis">${esc(t.title)}</div><div class="cell-sub">${S.taskSub(t)}</div></div><div class="cell-right">${S.taskChip(t.status)}</div></div>`;
  S.reminderCell = function (r) {
    const s = App.store(r.storeId) || { name: '—', tier: 'pending' };
    const n = App.fmt.days(r.due);
    const dueChip = n < 0 ? App.ui.chip(`逾期 ${-n} 天`, 'danger', { sm: true }) : App.ui.chip('今天', 'warn', { sm: true });
    const src = r.source + (r.tier ? ` · ${App.tierLabel(r.tier)} · ${r.cycle} 天` : (r.note ? ` · ${r.note}` : ''));
    return `<div class="cell pressable" onclick="App.go('reminders')"><div class="hm-tile ${n < 0 ? 'danger' : 'warn'}">${esc(App.initials(s.name))}</div><div class="cell-body"><div class="cell-title ellipsis">${esc(s.name)}</div><div class="cell-sub ellipsis">${esc(src)}</div></div><div class="cell-right">${dueChip}${App.icon('chevron-right', 16)}</div></div>`;
  };

  /* ----------------------------------------------------------
     auth · 首次授权页
     ---------------------------------------------------------- */
  const PERMS = [
    { key: 'mic', title: '录音', sub: '语音留痕', icon: 'mic', tone: 'rose', purpose: '拜访后说一句话，由日日新大模型转写为文字并抽取字段；原文与音频保存在贵司租户内。', scope: '留痕转写，仅在你点击「开始」后录制，不做后台录音。', when: '点击麦克风时' },
    { key: 'geo', title: '定位', sub: '到店打点与扫街辅助', icon: 'map-pin', tone: 'brand', purpose: '开始拜访时记录到店位置与时间；进入街道时列出该街道客户。', scope: '仅在拜访期间打点，结束即停止；不记录额外轨迹。', when: '开始拜访 / 打开路线时' },
    { key: 'cam', title: '相机', sub: '拍门头 / 名片 / 执照识别', icon: 'camera', tone: 'navy', purpose: '拍门头、名片、营业执照识别公司名与联系人；拍照识虫辅助现场应答。', scope: '照片仅用于识别与本次记录，不用于其他用途。', when: '点击拍照时' },
  ];
  S.togglePerm = function (key) {
    const p = App.state.perms; p[key] = !p[key]; App.save();
    App.refresh();
    App.toast(`${PERMS.find((x) => x.key === key).title}已${p[key] ? '开启' : '关闭'}`, { bottom: true, icon: p[key] ? 'check-circle' : 'x' });
  };
  S.authLater = function () { App.state.ui.authDone = true; App.save(); App.tab('home'); App.toast('可随时在「我的」里更改授权', { bottom: true }); };
  S.authAll = function () {
    App.state.perms = { mic: true, geo: true, cam: true }; App.state.ui.authDone = true; App.save();
    App.tab('home'); App.toast('三项授权已开启', { icon: 'shield' });
  };
  S.scopeInfo = function () {
    App.modal({ title: '数据范围说明', body: `<div class="col gap6"><div><b>销售</b>：只看本人负责的客户、拜访记录与待办。</div><div><b>主管</b>：看本人与直属团队（地推一队 7 人）的留痕、审批与低分记录。</div><div><b>管理员</b>：字段、门槛、热词与分层规则在企业管理后台配置。</div><div class="muted small">录音原文与音频保存在贵司租户内；具体制度由贵司确定。</div></div>` });
  };

  App.register('auth', {
    title: '隐私与授权', tab: 'home',
    prd: ['deck p12 · 授权与出发', '录音 / 定位 / 相机三项用途'],
    rules: ['授权明示，可关可看状态', '只在拜访期间打点'],
    render() {
      const p = App.state.perms;
      const cards = PERMS.map((x) => `<div class="card hm-perm">
        <div class="ph"><div class="pi ${x.tone}">${App.icon(x.icon, 20)}</div><div class="grow"><div class="pt">${esc(x.title)} · ${esc(x.sub)}</div><div class="mt4">${p[x.key] ? App.ui.chip('已授权', 'ok', { sm: true, dot: true }) : App.ui.chip('未授权', 'gray', { sm: true, dot: true })}</div></div><div class="hm-switch ${p[x.key] ? 'on' : ''}" role="switch" aria-checked="${!!p[x.key]}" onclick="S_HOME.togglePerm('${x.key}')"></div></div>
        <div class="pd"><b>用途</b>${esc(x.purpose)}</div>
        <div class="pd"><b>范围</b>${esc(x.scope)}</div>
        <div class="pm">${App.ui.chip('采集时机 · ' + x.when, 'outline', { sm: true, icon: 'clock' })}</div>
      </div>`).join('');
      return `<div class="hm-head"><h1>欢迎使用销售智助</h1><div class="d">首次进入请确认三项授权与用途 · 可随时在「我的」里更改 · <a onclick="S_HOME.scopeInfo()">数据范围说明 ›</a></div></div>
      ${cards}
      <div class="card"><div class="card-title">${App.icon('shield', 16)} 数据范围说明</div>
        <div class="hm-scope"><div class="sc"><div class="k">销售</div><div class="v">本人客户</div></div><div class="sc"><div class="k">主管</div><div class="v">看直属团队</div></div></div>
        <div class="muted small mt8">录音原文与音频保存在贵司租户内；关闭定位后打点改为手动选址，关闭录音后留痕按钮变为「文字留痕」。</div></div>
      <div class="muted tiny" style="text-align:center;padding:0 8px 4px">授权说明为本方案建议；具体制度由贵司确定 · 演示数据</div>`;
    },
    footer() {
      return `<div class="btn-row">${App.ui.btn('稍后再说', { tone: 'outline', onclick: 'S_HOME.authLater()' })}${App.ui.btn('全部开启并进入', { tone: 'primary', onclick: 'S_HOME.authAll()' })}</div>`;
    },
    demoActions: [
      { label: '重置授权状态', icon: 'refresh', run() { App.state.perms = { mic: false, geo: false, cam: false }; App.state.ui.authDone = false; App.save(); App.refresh(); App.toast('授权已重置'); } },
    ],
  });

  /* ----------------------------------------------------------
     home · 首页（Tab 根）
     ---------------------------------------------------------- */
  S.hero = function (opts) {
    const me = App.me();
    return `<div class="hero"><div class="row between top" style="position:relative;z-index:1"><div class="grow"><div class="h-title">${esc(S.greeting())}，${esc(me.name)}</div><div class="h-sub">${App.fmt.mdw(TODAY)} · ${esc(me.org)} · ${esc(me.roleName)}（虚构）</div></div><span class="h-chip">${App.icon(opts.chipIcon || 'road', 12)}${esc(opts.chip)}</span></div>
      <div class="h-metrics tiles" style="position:relative;z-index:1">${opts.metrics.map((m) => `<div class="m" ${m.onclick ? `onclick="${m.onclick}"` : ''}><div class="v">${m.value}</div><div class="l">${esc(m.label)}</div></div>`).join('')}</div></div>`;
  };
  S.reviewCard = function () {
    const n = App.state.review.numbers;
    return `<div class="hm-review" onclick="App.go('review')"><div class="ri">${App.icon('sparkle', 20)}</div><div class="grow"><div class="rt">今日回顾 · ${App.fmt.md(TODAY)}</div><div class="rs">已打点 ${n.checked} · 已留痕 ${n.traced} · 未留痕 ${n.pending} · AI 即时总结已生成</div></div>${App.icon('chevron-right', 18)}</div>`;
  };
  S.renderSales = function () {
    const st = App.state, ui = st.ui;
    const list = S.routeStores();
    const checked = S.checked(list), traced = S.traced(list), pend = S.pendingStores(list);
    const tasks = S.myTasks();
    const rems = S.dueReminders();
    const rate = checked.length ? Math.round((traced.length / checked.length) * 100) : 0;
    const evening = !!ui.evening;

    // 街道进度
    const streets = st.streets.map((s) => {
      const ss = list.filter((x) => x.street === s.name);
      const d = ss.filter((x) => x.route.trace === 'done').length;
      return { name: s.name, total: ss.length, done: d };
    }).filter((s) => s.total > 0);

    const hero = S.hero({
      chip: evening ? '收工模式' : '出发模式', chipIcon: evening ? 'sun' : 'road',
      metrics: [
        { value: list.length, label: '今日路线', onclick: "App.tab('route')" },
        { value: checked.length, label: '已拜访', onclick: "App.tab('route')" },
        { value: tasks.length, label: '待办', onclick: "App.go('tasks')" },
        { value: rems.length, label: '回访提醒', onclick: "App.go('reminders')" },
      ],
    });

    const amber = pend.length ? `<div class="amber-bar" onclick="App.go('record',{storeId:'${pend[0].id}'})" style="cursor:pointer"><span class="ellipsis">${pend.length} 家已打点未留痕：${esc(pend.map((s) => (s.name.replace(/（.*?）/g, ''))).join('、'))}</span><span class="pill">30 秒留痕（设计目标）</span></div>` : '';

    const entries = `<div class="entry-grid">
      <div class="entry" onclick="App.go('visit-start')"><div class="ei">${App.icon('play', 22)}</div><div class="et">开始拜访</div><div class="es">到店一键打点</div></div>
      <div class="entry" onclick="App.go('record')"><div class="ei em">${App.icon('mic', 22)}</div><div class="et">说一句留痕</div><div class="es">30 秒（设计目标）</div></div>
      <div class="entry" onclick="App.go('capture')"><div class="ei navy">${App.icon('camera', 22)}</div><div class="et">拍照建档</div><div class="es">门头 / 名片 / 执照</div></div></div>`;

    const routeCard = `<div class="card mt12"><div class="row between mb8"><div class="card-title" style="margin:0">今日路线 · ${list.length} 家</div><a class="small" onclick="App.tab('route')">查看路线 ›</a></div>
      <div class="hm-streets">${streets.map((s) => `<div class="hm-street" onclick="App.go('street',{name:'${esc(s.name)}'})"><div class="sn">${esc(s.name)}</div><div class="sv"><b>${s.done}</b> / ${s.total} 已留痕</div>${App.ui.progress(s.total ? (s.done / s.total) * 100 : 0).replace('class="progress ', `class="progress ${s.done === s.total ? 'ok' : ''} `)}</div>`).join('')}</div>
      <div class="hm-cap">已打点 ${checked.length} · 已留痕 ${traced.length} · 留痕率 ${rate}%（已留痕 / 已打点）· 门槛 ${st.settings.threshold} 分</div></div>`;

    const taskSec = `${App.ui.section(`待办 · ${tasks.length}`, `<a onclick="App.go('tasks')">全部 ›</a>`)}
      ${tasks.length ? `<div class="list">${tasks.slice(0, 4).map(S.taskCell).join('')}</div>` : `<div class="list">${App.ui.empty({ icon: 'check-circle', title: '暂无待办', sub: '主管任务与归档生成的待办会出现在这里' })}</div>`}`;

    const remSec = `${App.ui.section(`回访提醒 · ${rems.length}`, `<a onclick="App.go('reminders')">全部 ›</a>`)}
      ${rems.length ? `<div class="list">${rems.slice(0, 3).map(S.reminderCell).join('')}</div>` : `<div class="list">${App.ui.empty({ icon: 'bell', title: '今天没有到期回访', sub: '回访提醒按分层周期与上次约定自动生成' })}</div>`}`;

    const review = S.reviewCard();
    return evening
      ? `${hero}${review}${amber}${entries}${routeCard}${taskSec}${remSec}`
      : `${hero}${amber}${entries}${routeCard}${taskSec}${remSec}${App.ui.section('晚上收工', '', '')}${review}`;
  };

  // 主管「我的」模式：本人发起 / 本人待办
  S.renderMgrMine = function () {
    const me = App.me();
    const mine = App.state.tasks.filter((t) => isMe(t.toId) && t.status !== '已完成');
    const sent = App.state.tasks.filter((t) => t.fromRole === 'mgr' && !isMe(t.toId));
    const team = App.state.team;
    const hero = S.hero({ chip: '我的视图', chipIcon: 'user', metrics: [
      { value: sent.length, label: '我发出的', onclick: "App.go('tasks')" },
      { value: sent.filter((t) => t.status === '待接受').length, label: '待对方接受' },
      { value: mine.length, label: '我的待办', onclick: "App.go('tasks')" },
      { value: team.kpi.pendingApprovals, label: '待审批', onclick: "App.go('approvals')" },
    ] });
    const sentCells = sent.map((t) => { const to = App.state.team.members.find((m) => m.id === t.toId); return `<div class="cell pressable" onclick="App.go('task',{id:'${t.id}'})"><div class="hm-tile ${S.kindTone(t.kind)}">${esc(S.kindGlyph(t.kind))}</div><div class="cell-body"><div class="cell-title ellipsis">${esc(t.title)}</div><div class="cell-sub">发给 ${esc(to ? to.name : t.toId)} · 截止 ${App.fmt.md(t.due)}（${App.fmt.rel(t.due)}）</div></div><div class="cell-right">${S.taskChip(t.status)}</div></div>`; }).join('');
    return `${hero}
      ${App.ui.section(`我发出的任务 · ${sent.length}`, `<a onclick="App.go('tasks')">全部 ›</a>`)}<div class="list">${sentCells || App.ui.empty({ icon: 'send', title: '还没有发出任务' })}</div>
      ${App.ui.section(`我的待办 · ${mine.length}`)}<div class="list">${mine.length ? mine.map(S.taskCell).join('') : App.ui.empty({ icon: 'check-circle', title: '暂无待办' })}</div>
      ${App.ui.notice('gray', `${esc(me.name)} · ${esc(me.roleName)} · 数据范围：${esc(me.scope)}`, 'shield')}`;
  };
  S.setTeamMode = function (mode) { App.state.ui.teamMode = mode; App.save(); App.refresh(); };
  S.renderMgr = function () {
    const mode = App.state.ui.teamMode || 'team';
    const seg = `<div class="hm-seg"><div class="seg"><button class="${mode === 'mine' ? 'active' : ''}" onclick="S_HOME.setTeamMode('mine')">我的</button><button class="${mode === 'team' ? 'active' : ''}" onclick="S_HOME.setTeamMode('team')">团队</button></div></div>`;
    if (mode === 'mine') return seg + S.renderMgrMine();
    const body = window.S_TEAM && typeof S_TEAM.render === 'function' ? S_TEAM.render() : App.ui.notice('gray', '团队工作台由 team.js 提供（尚未接入）');
    return seg + body;
  };

  App.register('home', {
    title: '销售智助', tab: 'home',
    prd: ['deck p12 · 早上出发', 'deck p21 · 主管手机端'],
    rules: ['已拜访未留痕橙色高亮，一键直达语音页', '待办来自昨日归档与主管任务', '回访提醒按分层规则自动生成'],
    nav() { return { title: App.isMgr() && (App.state.ui.teamMode || 'team') === 'team' ? '团队' : '销售智助' }; },
    render() { return App.isMgr() ? S.renderMgr() : S.renderSales(); },
    mount(root) {
      const st = App.state;
      if (!st.ui.authDone && st.role === 'dj' && App.stack.length === 1 && App.currentEntry().id === 'home') {
        setTimeout(() => { if (App.currentEntry() && App.currentEntry().id === 'home' && !App.state.ui.authDone) App.replace('auth'); }, 0);
        return;
      }
      if (App.isMgr() && (st.ui.teamMode || 'team') === 'team' && window.S_TEAM && typeof S_TEAM.mount === 'function') { try { S_TEAM.mount(root); } catch (e) { console.error(e); } }
    },
    demoActions: [
      { label: '切换晚间态（演示）', icon: 'sun', run() { App.state.ui.evening = !App.state.ui.evening; App.save(); App.refresh(); App.toast(App.state.ui.evening ? '已切换为晚间态' : '已恢复早间态'); } },
      { label: '重置授权页', icon: 'shield', run() { App.state.ui.authDone = false; App.state.perms = { mic: false, geo: false, cam: false }; App.save(); App.tab('home'); } },
    ],
  });

  /* ----------------------------------------------------------
     review · 今日回顾
     ---------------------------------------------------------- */
  S.intentStores = () => App.state.stores.filter((s) => s.lastVisit === TODAY && s.lastNext && ['A', 'B'].includes(s.tier)).sort((a, b) => (a.tier < b.tier ? -1 : 1));
  S.genReport = function () {
    const close = App.loading('日日新大模型生成日报中…');
    setTimeout(() => { close(); App.toast('日报已生成并发送给主管（演示）', { icon: 'check-circle' }); }, 900);
  };
  App.register('review', {
    title: '今日回顾', tab: 'home',
    prd: ['deck p21 · 晚上收工', '四个数字 + AI 即时总结'],
    rules: ['总结按已归档记录即时生成', '「已打点未留痕」点名只给本人看，一键补录', '留痕率 = 已归档 ÷ 已打点'],
    render() {
      const st = App.state, rv = st.review, n = rv.numbers;
      const pend = st.stores.filter((s) => s.route && s.route.trace === 'pending' && isMe(s.ownerId));
      const intents = S.intentStores();
      const rate = n.checked ? Math.round((n.traced / n.checked) * 100) : 0;
      const nums = `<div class="hm-nums">
        <div class="hm-num brand"><div class="v">${n.checked}</div><div class="l">已打点</div></div>
        <div class="hm-num ok"><div class="v">${n.traced}</div><div class="l">已留痕</div></div>
        <div class="hm-num warn"><div class="v">${n.pending}</div><div class="l">未留痕</div></div>
        <div class="hm-num ai"><div class="v">${n.intents}</div><div class="l">意向客户</div></div></div>`;
      const sum = `<div class="hm-sum"><div class="st"><div class="t">${App.icon('sparkle', 16)}AI 即时总结 · 日日新大模型</div><span class="ai-tag">按已归档记录实时生成</span></div>
        ${rv.summary.map((l) => `<p>${esc(l)}</p>`).join('')}
        <div class="sf">留痕率 ${rate}%（已留痕 / 已打点）· 门槛 ${st.settings.threshold} 分 · AI 派生，不改正式值</div></div>`;
      const pendSec = `<div class="card hm-pend"><div class="row between mb8"><div class="card-title" style="margin:0">已打点未留痕 · ${pend.length}</div>${App.ui.chip('仅本人可见', 'warn', { sm: true, icon: 'eye-off' })}</div>
        ${pend.length ? pend.map((s) => `<div class="row" style="padding:6px 0"><div class="hm-tile warn">${esc(App.initials(s.name))}</div><div class="grow"><div class="bold ellipsis">${esc(s.name)}</div><div class="muted small">${esc(s.route.checkin || s.route.time)} 打点${s.route.checkout ? ` · ${esc(s.route.checkout)} 离店` : ''} · ${esc(s.street)}</div></div>${App.ui.btn('一键补录', { tone: 'primary', size: 'sm', icon: 'mic', onclick: `App.go('record',{storeId:'${s.id}'})` })}</div>`).join('') : `<div class="muted small">今日打点门店均已留痕</div>`}</div>`;
      const intentSec = `<div class="card"><div class="card-title">意向客户 · ${intents.length}</div>
        ${intents.length ? intents.map((s) => `<div class="row" style="padding:7px 0" onclick="App.go('customer',{id:'${s.id}'})"><div class="hm-tile ${s.tier === 'A' ? 'brand' : 'ai'}">${esc(App.initials(s.name))}</div><div class="grow"><div class="row"><span class="bold ellipsis">${esc(s.name)}</span>${App.ui.tierChip(s.tier, { sm: true })}</div><div class="muted small ellipsis">下一步：${esc(s.lastNext)}</div></div>${App.icon('chevron-right', 16)}</div>`).join('') : `<div class="muted small">今日暂无新增意向客户</div>`}</div>`;
      const tomo = `<div class="card"><div class="card-title">${App.icon('road', 16)} 明日路线建议 ${App.ui.chip('AI 建议', 'ai', { sm: true })}</div><div class="hm-tomo">${rv.tomorrow.map((t, i) => `<div class="ti"><div class="n">${i + 1}</div><div>${esc(t)}</div></div>`).join('')}</div>
        <div class="row mt12">${App.ui.btn('查看明日路线', { tone: 'secondary', size: 'sm', onclick: "App.tab('route')" })}${App.ui.btn('回访提醒', { tone: 'ghost', size: 'sm', onclick: "App.go('reminders')" })}</div></div>`;
      return `<div class="hm-head"><h1>今日回顾 · ${App.fmt.md(TODAY)}</h1><div class="d">${App.fmt.mdw(TODAY)} · 留了痕，日报就有了 · ${esc(App.me().name)}</div></div>${nums}${sum}${pendSec}${intentSec}${tomo}`;
    },
    footer() { return App.ui.btn('生成日报（演示）', { tone: 'primary', block: true, icon: 'doc', onclick: 'S_HOME.genReport()' }); },
    demoActions: [
      { label: '模拟归档丙店后的回顾', icon: 'sparkle', run() { if (!App.state.demo.archived) DATA.archiveDemoVisit(App.state, 'good', '新建商机'); App.save(); App.refresh(); App.toast('已按归档后数据刷新'); } },
    ],
  });
})();
