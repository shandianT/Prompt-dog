/* ============================================================
   拜访采集：开始拜访（打点）/ 拍照建档（OCR）/ 工商匹配与去重 / 语音留痕
   页面：visit-start · capture · match · record
   命名空间：window.S_VISIT
   ============================================================ */
(function () {
  'use strict';
  const D = window.DATA;
  const ui = App.ui;
  const S = window.S_VISIT = {};

  /* ---------- 页面专属样式 ---------- */
  App.css('visit', `
    .vs-h1 { font-size: 22px; font-weight: 800; letter-spacing: -.01em; margin: 6px 2px 0; }
    .vs-sub { font-size: 13px; color: var(--ink-3); margin: 3px 2px 12px; line-height: 1.45; }
    .vs-store { margin-bottom: 12px; }
    .vs-store .eyebrow { color: var(--brand); font-size: 11.5px; font-weight: 700; letter-spacing: .04em; }
    .vs-store .name { font-size: 18px; font-weight: 800; margin-top: 2px; }
    .vs-store .addr { font-size: 13px; color: var(--ink-3); margin-top: 2px; }
    .vs-punch { border-radius: 20px; padding: 16px; color: #fff; margin-bottom: 12px; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #16355f 0%, #0f2444 60%, #0b1a33 100%); box-shadow: 0 10px 24px rgba(15, 36, 68, .28); }
    .vs-punch::after { content: ""; position: absolute; right: -40px; top: -60px; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,.07); }
    .vs-punch > * { position: relative; z-index: 1; }
    .vs-punch .pk { display: grid; grid-template-columns: 64px 1fr; gap: 10px 8px; font-size: 13.5px; }
    .vs-punch .pk dt { opacity: .7; }
    .vs-punch .pk dd { font-weight: 600; min-width: 0; }
    .vs-punch .pk dd .ok { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #34d399; margin-right: 6px; vertical-align: 1px; }
    .vs-punch .timer { font-size: 34px; font-weight: 800; letter-spacing: -.02em; font-variant-numeric: tabular-nums; line-height: 1; }
    .vs-punch .tl { font-size: 11.5px; opacity: .75; margin-top: 4px; }
    .vs-punch .live { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.14); border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
    .vs-punch .live i { width: 7px; height: 7px; border-radius: 50%; background: #34d399; animation: vsBlink 1.2s ease-in-out infinite; }
    @keyframes vsBlink { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
    .vs-punch .btn.white { background: #fff; color: var(--brand-3); font-weight: 700; box-shadow: 0 6px 16px rgba(0,0,0,.18); }
    .vs-punch .hint { font-size: 11.5px; opacity: .72; margin-top: 10px; display: flex; gap: 6px; align-items: flex-start; line-height: 1.4; }
    .vs-acts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
    .vs-act { background: var(--surface); border-radius: 16px; padding: 14px 6px 12px; text-align: center; box-shadow: var(--shadow-xs); border: 1px solid rgba(17,24,39,.04); }
    .vs-act:active { transform: scale(.98); }
    .vs-act .ai-i { width: 46px; height: 46px; border-radius: 13px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #fff; }
    .vs-act .ai-i.em { background: var(--ai); } .vs-act .ai-i.navy { background: #0f2444; } .vs-act .ai-i.rose { background: #b8433a; }
    .vs-act .t { font-size: 15px; font-weight: 700; } .vs-act .t.em { color: var(--ai); }
    .vs-act .s { font-size: 11px; color: var(--ink-3); margin-top: 2px; }
    .vs-act.disabled { opacity: .5; pointer-events: none; }
    /* 拍照 */
    .vs-cam { background: #0f2444; border-radius: 20px; padding: 12px; margin-bottom: 12px; position: relative; box-shadow: 0 10px 24px rgba(15,36,68,.25); }
    .vs-cam .frame { border: 2px dashed rgba(255,255,255,.55); border-radius: 14px; padding: 8px; position: relative; }
    .vs-cam .photo { aspect-ratio: 4 / 3; border-radius: 10px; }
    .vs-cam .tag { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 999px; z-index: 2; }
    .vs-cam .shoot { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 2; width: 66px; height: 66px; border-radius: 50%; background: #fff; border: 4px solid rgba(255,255,255,.55); box-shadow: 0 6px 18px rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; color: var(--brand-3); font-weight: 800; font-size: 13px; }
    .vs-cam .shoot:active { transform: translateX(-50%) scale(.95); }
    .vs-cam .done { position: absolute; right: 12px; bottom: 12px; z-index: 2; }
    .vs-ocr-row { display: grid; grid-template-columns: 78px 1fr auto; gap: 8px; align-items: center; padding: 10px 0; border-top: .5px solid var(--line); }
    .vs-ocr-row:first-of-type { border-top: 0; }
    .vs-ocr-row .k { font-size: 13px; color: var(--ink-2); }
    .vs-ocr-row .v { font-size: 15px; font-weight: 600; min-width: 0; display: flex; align-items: center; gap: 6px; }
    .vs-ocr-row .v .ed { color: var(--brand); display: inline-flex; }
    .vs-raw { background: var(--surface-3); border-radius: 12px; padding: 10px 12px; font-size: 13px; color: var(--ink-2); line-height: 1.5; margin-top: 10px; }
    /* 匹配 */
    .vs-cand { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-top: .5px solid var(--line); }
    .vs-cand:first-of-type { border-top: 0; padding-top: 4px; }
    .vs-cand .radio { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--line-2); flex: none; margin-top: 1px; display: flex; align-items: center; justify-content: center; }
    .vs-cand.on .radio { border-color: var(--brand); }
    .vs-cand.on .radio::after { content: ""; width: 12px; height: 12px; border-radius: 50%; background: var(--brand); }
    .vs-cand .n { font-size: 15px; font-weight: 700; }
    .vs-cand .m { font-size: 12px; color: var(--ink-3); margin-top: 3px; line-height: 1.45; }
    .vs-dup { border-left: 4px solid var(--warn); }
    .vs-dup .who { display: flex; gap: 10px; align-items: center; margin: 10px 0 12px; }
    .vs-dup .who .av { width: 44px; height: 44px; border-radius: 12px; background: var(--warn-soft); color: #b45309; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px; flex: none; }
    .vs-opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .vs-opts button { height: 40px; border-radius: 12px; border: 1px solid var(--line-2); background: var(--surface); font-size: 13.5px; font-weight: 600; color: var(--ink-2); }
    .vs-opts button.on { border-color: var(--brand); background: var(--brand-soft); color: var(--brand-3); }
    /* 录音 */
    .vs-mic-wrap { display: flex; flex-direction: column; align-items: center; padding: 6px 0 4px; }
    .vs-mic { width: 118px; height: 118px; border-radius: 50%; background: #b8433a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-weight: 800; font-size: 15px; box-shadow: 0 10px 26px rgba(184,67,58,.35); cursor: pointer; user-select: none; }
    .vs-mic:active { transform: scale(.96); }
    .vs-mic.idle { background: var(--brand); box-shadow: 0 10px 26px rgba(30,91,216,.32); }
    .vs-mic .wave { height: 26px; } .vs-mic .wave i { background: #fff; }
    .vs-mic .wave.small i { animation: vsWaveS 1s ease-in-out infinite; }
    @keyframes vsWaveS { 0%,100% { height: 6px } 50% { height: 22px } }
    .vs-wave { margin-top: 10px; height: 34px; }
    .vs-wave.wave i { background: #b8433a; }
    .vs-wave.wave.off i { animation: none; height: 8px; background: var(--line-2); }
    .vs-wave.wave.off i:nth-child(3n) { height: 16px; } .vs-wave.wave.off i:nth-child(5n) { height: 22px; }
    .vs-meta { font-size: 12.5px; color: var(--ink-3); margin-top: 8px; display: flex; gap: 8px; align-items: center; font-variant-numeric: tabular-nums; }
    .vs-meta .st.ok { color: var(--ok); font-weight: 600; } .vs-meta .st.warn { color: var(--warn); font-weight: 600; }
    .vs-tx { background: var(--surface); border-radius: 18px; padding: 14px 16px; min-height: 150px; font-size: 15.5px; line-height: 1.7; box-shadow: var(--shadow-xs); margin-top: 12px; outline: 0; white-space: pre-wrap; word-break: break-all; }
    .vs-tx.editing { border: 1.5px solid var(--brand); background: #fff; }
    .vs-tx .ph { color: var(--ink-4); }
    .vs-tx .caret { display: inline-block; width: 2px; height: 1.1em; background: var(--brand); vertical-align: -3px; margin-left: 1px; animation: vsBlink .9s steps(1) infinite; }
    .vs-tx .del { color: var(--danger); text-decoration: line-through; opacity: .75; }
    .vs-tx .ins { background: var(--ok-soft); color: #15803d; padding: 0 3px; border-radius: 4px; }
    .vs-hits { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 10px; font-size: 12.5px; color: var(--ink-3); }
    .vs-hits .chip { height: 22px; font-size: 12px; }
    .vs-ctl { display: flex; gap: 8px; margin-top: 12px; }
    .vs-ctl .btn { flex: 1; min-width: 0; padding: 0 8px; font-size: 13.5px; height: 40px; white-space: nowrap; } .vs-ctl .btn svg { flex: none; }
    .vs-sw { margin-top: 12px; }
    .vs-sw .r { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 0; border-top: .5px solid var(--line); font-size: 14px; }
    .vs-sw .r:first-child { border-top: 0; padding-top: 2px; } .vs-sw .r:last-child { padding-bottom: 2px; }
    .vs-sw select { border: 1px solid var(--line-2); border-radius: 10px; padding: 7px 10px; font-size: 13px; background: var(--surface); max-width: 210px; color: var(--ink); }
    .vs-toggle { width: 46px; height: 27px; border-radius: 999px; background: #d9e0ea; position: relative; flex: none; transition: background .2s; }
    .vs-toggle::after { content: ""; position: absolute; top: 3px; left: 3px; width: 21px; height: 21px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.2); transition: left .2s; }
    .vs-toggle.on { background: var(--brand); } .vs-toggle.on::after { left: 22px; }
    .vs-write { margin-top: 12px; }
  `);

  /* ---------- 模块状态 ---------- */
  const V = S._v = { storeId: null, checkin: null, startedAt: null, transcript: '', version: 'good', firstVisit: true, weakNet: false, edits: 0,
    cap: { src: 'storefront', phase: 'idle', rows: [] },
    mt: { cand: 'c1', dup: 'merge' },
    rec: { phase: 'idle', text: '', target: '', sec: 0, editing: false, interrupted: false, sync: 'online', original: '' } };
  const SRC = { storefront: { label: '门头', scene: 'storefront', tip: '对准招牌，整店入镜' }, card: { label: '名片', scene: 'doc', tip: '名片平放，避免反光' }, license: { label: '营业执照', scene: 'doc', tip: '执照正面，四角入框' } };
  const RISK = ['蟑螂', '异味', '鼠迹', '老鼠', '德国小蠊'];
  const SAMPLES = [{ id: 'good', label: '标准场景 · 连锁餐饮后厨' }, { id: 'weak', label: '弱样例 · 缺预算与下一步' }];
  let timers = [];
  const clearTimers = () => { timers.forEach(clearInterval); timers = []; };
  const every = (ms, fn, alive) => { const t = setInterval(() => { if (alive && !alive()) { clearInterval(t); return; } fn(); }, ms); timers.push(t); return t; };

  function persist() {
    const st = App.state; st.ui = st.ui || {};
    st.ui.visit = { storeId: V.storeId, checkin: V.checkin, transcript: V.transcript, version: V.version, firstVisit: V.firstVisit, weakNet: V.weakNet };
    st.settings.firstVisit = V.firstVisit; st.settings.weakNet = V.weakNet;
    App.save();
  }
  function restore() {
    const u = App.state.ui && App.state.ui.visit;
    if (u) { V.storeId = u.storeId || V.storeId; V.checkin = u.checkin || V.checkin; V.transcript = u.transcript || V.transcript; V.version = u.version || V.version; if (u.firstVisit != null) V.firstVisit = u.firstVisit; if (u.weakNet != null) V.weakNet = u.weakNet; }
    else { V.firstVisit = App.state.settings.firstVisit !== false; V.weakNet = !!App.state.settings.weakNet; }
    V.rec.target = D.demoTranscripts[V.version] || D.demoTranscripts.good;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const mmss = (sec) => `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
  const routeStores = () => App.state.stores.filter((s) => s.route && s.route.order).sort((a, b) => a.route.order - b.route.order);
  const routeNo = (s) => (s && s.route && s.route.order ? `路线 ${pad(s.route.order)}` : '临时拜访');
  const isRunning = (s) => !!(s && s.route && s.route.trace === 'running');
  const archivedToday = (id) => App.state.visits.some((v) => v.storeId === id && v.status === 'archived' && (v.time || '').slice(0, 10) === App.TODAY);
  const confChip = (c) => { const p = Math.round(c * 100) + '%'; return c >= .9 ? ui.chip(p, 'ok', { sm: true }) : c >= .7 ? ui.chip(p, 'warn', { sm: true }) : ui.chip(p, 'gray', { sm: true }); };

  /* ---------- 选店 sheet ---------- */
  S.pickStore = function (target, replace) {
    const traceTxt = { done: '已留痕', running: '进行中', pending: '未留痕', todo: '未去' };
    App.sheet({
      title: '选择今日路线内的门店', items: routeStores().map((s) => ({
        label: `${pad(s.route.order)}  ${s.name}`, sub: `${s.route.time} · ${s.address}${s.contact && s.contact.name ? ' · ' + s.contact.name : ''}`, right: traceTxt[s.route.trace] || '', icon: 'store',
        onSelect: () => { V.storeId = s.id; persist(); replace ? App.replace(target, { storeId: s.id }) : App.go(target, { storeId: s.id }); },
      })),
    });
  };

  /* ============================================================
     visit-start · 开始拜访（打点）
     ============================================================ */
  function storeCard(s, rightHtml) {
    return `<div class="card vs-store"><div class="row between top"><div class="grow"><div class="eyebrow">${App.esc(routeNo(s))} · ${App.esc(s.street)}</div><div class="name">${App.esc(s.name)}</div><div class="addr">${App.esc(s.entity || s.address)}</div></div>${rightHtml || ''}</div>
      <div class="chips mt8">${s.isNew ? ui.chip('新开', 'ai', { sm: true }) : ''}${ui.tierChip(s.tier, { sm: true })}${ui.chip(s.category, 'gray', { sm: true })}${s.contact && s.contact.name ? ui.chip(`${s.contact.name} · ${s.contact.role}`, 'gray', { sm: true }) : ''}${s.lastVisit ? ui.chip(`上次 ${App.fmt.rel(s.lastVisit)}`, 'gray', { sm: true }) : ui.chip('首次拜访', 'brand', { sm: true })}</div></div>`;
  }
  App.register('visit-start', {
    title: '开始拜访', tab: 'route',
    prd: ['deck p14 · 到店打点', '决策 a · 轨迹自动带入'], rules: ['开始 / 结束两次打点自动带入 地点 / 时长 / 日期', '只在拜访期间打点，结束拜访即停止定位'],
    render(p) {
      restore();
      const id = p.storeId || V.storeId; const s = App.store(id);
      if (!s) return `<div class="vs-h1">开始拜访</div><div class="vs-sub">到店一键打点 · 地点 / 时长 / 日期自动带入，销售不用填</div>${ui.empty({ icon: 'map-pin', title: '先选一家门店', sub: '从今日路线里选择，或在路线页点「开始拜访」', action: ui.btn('选择门店', { onclick: "S_VISIT.pickStore('visit-start',true)", icon: 'store' }) })}`;
      V.storeId = s.id;
      const run = isRunning(s);
      const ci = s.route.checkin || V.checkin || s.route.time || '10:45';
      const right = run ? `<span class="chip info dot">拜访中 · <span id="vsChipT">${mmss(S._elapsed())}</span></span>` : ui.chip('未打点', 'gray', { dot: true });
      const punch = run
        ? `<div class="vs-punch"><div class="row between"><span class="live"><i></i>定位中 · 仅拜访期间</span><span class="tiny" style="opacity:.75">${App.esc(App.TODAY)} · ${App.esc(ci)} 打点</span></div>
            <dl class="pk mt12"><dt>定位</dt><dd><span class="ok"></span>${App.esc(s.address)}（演示）</dd><dt>时间戳</dt><dd>${App.esc(App.TODAY)} ${App.esc(ci)} 到店打点</dd><dt>拜访计时</dt><dd><div class="timer" id="vsTimer">${mmss(S._elapsed())}</div><div class="tl">计时中 · 结束拜访后写入「时长」字段</div></dd></dl>
            <div class="hint">${App.icon('shield', 14)}<span>只在拜访期间打点，结束拜访即停止定位；地点、时长、日期三个字段自动带入。</span></div></div>`
        : `<div class="vs-punch"><dl class="pk"><dt>定位</dt><dd><span class="ok"></span>已获取 · ${App.esc(s.address)}（演示）</dd><dt>时间戳</dt><dd>${App.esc(App.TODAY)} ${App.esc(ci)}（当前）</dd><dt>拜访计时</dt><dd style="opacity:.7">开始后计时</dd></dl>
            <div class="mt16">${ui.btn('开始拜访 · 到店一键打点', { tone: 'white', block: true, size: 'lg', icon: 'map-pin', onclick: 'S_VISIT.start()' })}</div>
            <div class="hint">${App.icon('shield', 14)}<span>只在拜访期间打点，结束拜访即停止定位；地点、时长、日期三个字段自动带入。</span></div></div>`;
      const acts = `<div class="vs-acts">
        <div class="vs-act ${run ? '' : 'disabled'}" onclick="App.go('record',{storeId:'${s.id}'})"><div class="ai-i em">${App.icon('mic', 22)}</div><div class="t em">说一句留痕</div><div class="s">30 秒（设计目标）</div></div>
        <div class="vs-act ${run ? '' : 'disabled'}" onclick="App.go('capture',{storeId:'${s.id}'})"><div class="ai-i navy">${App.icon('camera', 22)}</div><div class="t">拍照建档</div><div class="s">门头 / 名片 / 执照</div></div>
        <div class="vs-act ${run ? '' : 'disabled'}" onclick="S_VISIT.end()"><div class="ai-i rose">${App.icon('stop', 22)}</div><div class="t">结束拜访</div><div class="s">算时长并留痕</div></div></div>`;
      const tip = run ? ui.notice('info', '拜访中 · 随时说一句 / 拍一张；结束后 30 秒留痕（设计目标）。未留痕就结束会记为「已打点未留痕」，今日回顾会点名。', 'info') : ui.notice('gray', '打点后可拍照建档、说一句留痕；结束拜访自动写入离店时间与时长。', 'info');
      const traced = archivedToday(s.id);
      return storeCard(s, right) + punch + tip + acts + (traced ? ui.notice('ok', '本次拜访已留痕归档 · 结束拜访将记为「已留痕」') : '') + `<div class="tiny muted" style="text-align:center;margin-top:4px">定位与时间为演示值 · 不采集拜访以外的轨迹</div>`;
    },
    mount(root, p) {
      clearTimers();
      const s = App.store(p.storeId || V.storeId);
      if (!s && !p.storeId) { setTimeout(() => S.pickStore('visit-start', true), 250); return; }
      if (s && isRunning(s)) {
        const el = root.querySelector('#vsTimer'), chip = root.querySelector('#vsChipT');
        every(1000, () => { const t = mmss(S._elapsed()); if (el) el.textContent = t; if (chip) chip.textContent = t; }, () => document.body.contains(root));
      }
    },
    demoActions: [{ label: '一键开始拜访', icon: 'play', run() { S.start(); } }, { label: '结束拜访（未留痕）', icon: 'stop', run() { S.end(true); } }],
  });
  S._elapsed = () => { if (!V.startedAt) V.startedAt = Date.now() - 12000; return Math.max(0, Math.floor((Date.now() - V.startedAt) / 1000)); };
  S.start = function () {
    const s = App.store(V.storeId); if (!s) { S.pickStore('visit-start', true); return; }
    if (!App.state.perms.geo) App.toast('定位未授权 · 改为手动选择地址（演示）', { icon: 'map-pin' });
    s.route = s.route || {}; s.route.trace = 'running'; s.route.checkin = s.route.time || '10:45'; s.updatedAt = `${App.TODAY} ${s.route.checkin}`;
    V.checkin = s.route.checkin; V.startedAt = Date.now(); App.state.demo.checkedIn = true; persist();
    App.refresh(); App.toast('已打点 · 定位与时间自动记录', { icon: 'map-pin' });
  };
  S.end = function (silent) {
    const s = App.store(V.storeId); if (!s) return;
    const doEnd = () => {
      const traced = archivedToday(s.id);
      const mins = Math.max(1, Math.round(S._elapsed() / 60));
      s.route.checkout = s.route.checkout || (() => { const [h, m] = (s.route.checkin || '10:45').split(':').map(Number); const t = h * 60 + m + Math.max(mins, 18); return `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`; })();
      s.route.trace = traced ? 'done' : 'pending'; s.updatedAt = `${App.TODAY} ${s.route.checkout}`;
      V.startedAt = null; persist(); App.save();
      App.tab('route');
      App.toast(traced ? '已结束 · 已打点并留痕，时长已写入' : '已结束 · 已打点未留痕（今日回顾会点名）', { icon: traced ? 'check-circle' : 'alert' });
    };
    if (silent || archivedToday(s.id)) doEnd(); else App.confirm('结束拜访？', `<div class="small">本次尚未留痕。结束后门店记为「已打点未留痕」，今日回顾与主管端会点名，可稍后一键补录。</div>`, doEnd, '仍结束');
  };

  /* ============================================================
     capture · 拍照建档（OCR）
     ============================================================ */
  App.register('capture', {
    title: '拍照建档', tab: 'customers',
    prd: ['deck p14 · 拍门头 OCR', '贵司补充 · 公司名抓取'], rules: ['客户全称必填但不手打：门头 / 名片 / 营业执照识别', '识别失败可改可重拍，已识别内容不丢', '各字段带置信度'],
    render(p) {
      restore(); if (p.storeId) V.storeId = p.storeId;
      const c = V.cap; const src = SRC[c.src];
      const s = App.store(V.storeId);
      const head = `<div class="vs-h1">拍照抓公司名</div><div class="vs-sub">拍门头 / 名片 / 营业执照 → 识别公司名 → 工商匹配 → 一键建档，公司名不用手输</div>`;
      const seg = `<div class="seg block mb12">${Object.keys(SRC).map((k) => `<button class="${k === c.src ? 'active' : ''}" onclick="S_VISIT.capSrc('${k}')">${SRC[k].label}</button>`).join('')}</div>`;
      const cam = `<div class="vs-cam"><div class="tag">${App.esc(src.label)} · 示意图 · ${App.esc(src.tip)}</div><div class="frame">${ui.scene(src.scene, s ? `${s.address}` : '')}</div>
        ${c.phase === 'idle' ? `<div class="shoot" onclick="S_VISIT.shoot()">拍摄</div>` : `<div class="done">${ui.chip(c.phase === 'fail' ? '识别失败' : '已识别', c.phase === 'fail' ? 'danger' : 'ok', { icon: c.phase === 'fail' ? 'alert' : 'check' })}</div>`}</div>`;
      let result = '';
      if (c.phase === 'result') {
        const top = c.rows[0];
        result = `<div class="card"><div class="row between mb8"><div class="card-title" style="font-weight:700">识别结果 · 日日新大模型</div>${top ? ui.chip(`置信度 ${Math.round(top.conf * 100)}%`, top.conf >= .9 ? 'ok' : 'warn') : ''}</div>
          ${c.rows.map((r, i) => `<div class="vs-ocr-row"><div class="k">${App.esc(r.k)}</div><div class="v"><span class="ellipsis">${App.esc(r.v)}</span><span class="ed" onclick="S_VISIT.capEdit(${i})">${App.icon('edit', 15)}</span></div><div>${r.manual ? ui.chip('已改', 'ok', { sm: true, icon: 'check' }) : confChip(r.conf)}</div></div>`).join('')}
          <div class="vs-raw"><b>原文：</b>${App.esc(D.demoOCR.text)} · ${App.esc(c.rows[1] ? c.rows[1].v : '')}<br><span class="tiny muted">置信度低于 70% 的字段建议核对；识别为预置样本，需贵司样本共同验证</span></div></div>
          ${ui.notice('gray', '识别失败可改可重拍，已识别内容不丢；非企业主体走人工建档。', 'info')}`;
      } else if (c.phase === 'fail') {
        result = ui.notice('warn', '识别失败 · 未提取到公司名（光线 / 角度不足）。可手填或重拍，已识别内容不丢。', 'alert') + `<div class="card"><div class="card-title" style="font-weight:700">识别结果 · 日日新大模型</div>
          ${c.rows.length ? c.rows.map((r, i) => `<div class="vs-ocr-row"><div class="k">${App.esc(r.k)}</div><div class="v"><span class="ellipsis">${App.esc(r.v)}</span><span class="ed" onclick="S_VISIT.capEdit(${i})">${App.icon('edit', 15)}</span></div><div>${ui.chip('手填', 'brand', { sm: true })}</div></div>`).join('') : `<div class="muted small mt8">暂无识别字段</div>`}
          <div class="btn-row mt12">${ui.btn('手填公司名', { tone: 'secondary', icon: 'edit', onclick: 'S_VISIT.capManual()' })}${ui.btn('重新拍照', { tone: 'outline', icon: 'camera', onclick: 'S_VISIT.capRetake()' })}</div></div>`;
      } else {
        result = ui.notice('gray', `点「拍摄」用预置样本模拟识别；真实识别率以试点评测为准。${s ? `本次关联门店：${App.esc(s.name)}（${routeNo(s)}）` : ''}`, 'info');
      }
      return head + seg + cam + result;
    },
    footer() {
      const ok = V.cap.phase === 'result' || (V.cap.phase === 'fail' && V.cap.rows.length);
      return `<div class="btn-row">${ui.btn('重新拍照', { tone: 'outline', icon: 'camera', onclick: 'S_VISIT.capRetake()', disabled: V.cap.phase === 'idle' })}${ui.btn('下一步：工商匹配', { tone: 'primary', icon: 'arrow-right', onclick: `App.go('match',{storeId:'${App.esc(V.storeId || '')}'})`, disabled: !ok })}</div>`;
    },
    mount() { clearTimers(); },
    demoActions: [{ label: '模拟识别失败', icon: 'alert', run() { V.cap.phase = 'fail'; V.cap.rows = []; App.refresh(); App.toast('已模拟识别失败 · 可手填或重拍'); } }, { label: '拍摄并识别', icon: 'camera', run() { S.shoot(); } }],
  });
  S.capSrc = function (k) { V.cap.src = k; V.cap.phase = 'idle'; V.cap.rows = []; App.refresh(); };
  S.shoot = function () {
    if (!App.state.perms.cam) App.toast('相机未授权 · 演示用预置样本', { icon: 'camera' });
    const close = App.loading('日日新大模型识别中…');
    setTimeout(() => { close(); V.cap.phase = 'result'; V.cap.rows = App.clone(D.demoOCR.extra); App.refresh(); }, 900);
  };
  S.capRetake = function () { V.cap.phase = 'idle'; V.cap.rows = []; App.refresh(); App.toast('已重拍 · 上次识别内容已暂存', { icon: 'camera' }); };
  S.capEdit = function (i) {
    const r = V.cap.rows[i]; if (!r) return;
    App.prompt(`修改「${r.k}」`, r.v, (val) => { if (val && val.trim()) { r.v = val.trim(); r.manual = true; App.refresh(); App.toast('已修改 · 标记为人工校正', { icon: 'check' }); } });
  };
  S.capManual = function () { App.prompt('手填公司名', '如：蜀香居川菜馆', (val) => { if (val && val.trim()) { V.cap.rows = [{ k: '门店名', v: val.trim(), conf: 0, manual: true }]; App.refresh(); App.toast('已手填 · 下一步做工商匹配', { icon: 'check' }); } }); };

  /* ============================================================
     match · 工商匹配与去重
     ============================================================ */
  const DUP_OPTS = [{ id: 'new', label: '仍新建', why: '新建一条独立客户档案，与已有客户并存；后续可再合并。' }, { id: 'child', label: '关联为子门店', why: '作为已有客户的子门店挂接，拜访记录归入同一客户视图。' }, { id: 'merge', label: '合并到已有', why: '同一家店：本次拍照识别结果写入已有客户「蜀香居川菜馆」，不新建重复档案。' }];
  App.register('match', {
    title: '工商匹配', tab: 'customers',
    prd: ['deck p14 · 工商匹配与去重', '商汤能力 · 主体匹配与去重'], rules: ['建档前与工商数据源匹配并做重复检测', '疑似重复由人判定 仍新建 / 关联为子门店 / 合并到已有，不自动合并'],
    render(p) {
      restore(); if (p.storeId) V.storeId = p.storeId;
      const o = D.demoOCR; const m = V.mt;
      const name = (V.cap.rows[0] && V.cap.rows[0].v) || o.text;
      const head = `<div class="vs-h1">工商匹配与去重</div><div class="vs-sub">识别到「${App.esc(name)}」· 候选 ${o.candidates.length} 条 · 由你选择，不自动合并</div>`;
      const cands = `<div class="card mb12"><div class="row between mb8"><div class="card-title" style="font-weight:700">工商候选主体（演示库）</div><span class="tiny muted">按匹配度降序</span></div>
        ${o.candidates.map((c) => `<div class="vs-cand ${m.cand === c.id ? 'on' : ''}" onclick="S_VISIT.pickCand('${c.id}')"><div class="radio"></div><div class="grow"><div class="row between top"><div class="n grow">${App.esc(c.name)}</div>${c.match >= .9 ? ui.chip(`匹配度 ${Math.round(c.match * 100)}%`, 'ok', { sm: true }) : ui.chip(`匹配度 ${Math.round(c.match * 100)}%`, 'gray', { sm: true })}</div><div class="m">${App.esc(c.code)} · ${App.esc(c.addr)} · ${App.esc(c.status)}</div></div></div>`).join('')}
        <div class="tiny muted mt8">非企业主体（个体 / 摊位）走人工建档；工商数据源由贵司提供或采购接入。</div></div>`;
      const d = o.dup; const cur = DUP_OPTS.find((x) => x.id === m.dup);
      const dup = `<div class="card vs-dup mb12"><div class="row between"><div class="card-title" style="font-weight:700">与已有客户疑似重复</div>${ui.chip(`${1} 条`, 'danger', { sm: true })}</div>
        <div class="who"><div class="av">${App.esc(d.name.slice(0, 2))}</div><div class="grow"><div style="font-weight:700;font-size:15px">${App.esc(d.name)}</div><div class="small muted">负责人 ${App.esc(d.owner)} · ${App.esc(d.stage)} · ${App.esc(d.street)} · 相似 ${Math.round(d.sim * 100)}%</div></div><span onclick="App.go('customer',{id:'${d.storeId}'})" class="link small">查看</span></div>
        <div class="vs-opts">${DUP_OPTS.map((x) => `<button class="${m.dup === x.id ? 'on' : ''}" onclick="S_VISIT.pickDup('${x.id}')">${x.label}</button>`).join('')}</div>
        <div class="small muted mt8">${cur ? App.esc(cur.why) : ''}</div>
        <div class="tiny muted mt4">与已有客户「${App.esc(d.name)}」疑似重复（负责人 ${App.esc(d.owner)}），系统只提示不自动合并，由你确认。</div></div>`;
      return head + cands + dup;
    },
    footer() { return `<div class="col" style="gap:8px">${ui.btn('一键建档', { tone: 'primary', block: true, size: 'lg', icon: 'check', onclick: 'S_VISIT.build()' })}${ui.btn('重新拍照', { tone: 'outline', block: true, onclick: 'S_VISIT.rephoto()' })}</div>`; },
    mount() { clearTimers(); },
    demoActions: [{ label: '一键建档并去留痕', icon: 'check', run() { S.build(); } }],
  });
  S.pickCand = function (id) { V.mt.cand = id; App.refresh(); };
  S.pickDup = function (id) { V.mt.dup = id; App.refresh(); };
  S.rephoto = function () { V.cap.phase = 'idle'; V.cap.rows = []; if (App.stack.length > 1 && App.stack[App.stack.length - 2].id === 'capture') App.back(); else App.replace('capture', { storeId: V.storeId || '' }); };
  S.build = function () {
    const cand = D.demoOCR.candidates.find((c) => c.id === V.mt.cand) || D.demoOCR.candidates[0];
    const st = App.store('s_bing');
    if (st) { st.entity = cand.name; if (!st.route.trace || st.route.trace === 'todo') { /* 建档不等于打点 */ } st.updatedAt = `${App.TODAY} 10:4${Math.min(9, 6 + Math.floor(S._elapsed() / 60))}`; }
    V.storeId = 's_bing'; persist(); App.save();
    const msg = { merge: '已建档 · 关联到已有客户 蜀香居川菜馆（不自动合并，由人确认）', child: '已建档 · 关联为 蜀香居川菜馆 子门店（由人确认）', new: '已新建客户档案（演示）· 与已有客户并存，可稍后合并' }[V.mt.dup];
    App.toast(msg, { icon: 'check-circle', duration: 2200 });
    setTimeout(() => App.go('record', { storeId: 's_bing' }), 350);
  };

  /* ============================================================
     record · 语音留痕
     ============================================================ */
  function hotRegex() { const words = D.hotwords.slice().sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); return new RegExp(`(${words.join('|')})`, 'g'); }
  function highlight(text) { if (!text) return ''; return text.split(hotRegex()).map((seg, i) => (i % 2 ? `<span class="hw ${RISK.includes(seg) ? 'risk' : ''}">${App.esc(seg)}</span>` : App.esc(seg))).join(''); }
  function hits(text) { const set = []; (text.match(hotRegex()) || []).forEach((w) => { if (!set.includes(w)) set.push(w); }); return set; }
  function diff(a, b) { // 单处修改：公共前缀 / 后缀
    if (a === b) return null; let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    let j = 0; while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
    return { pre: b.slice(0, i), del: a.slice(i, a.length - j), ins: b.slice(i, b.length - j), post: b.slice(b.length - j) };
  }
  const syncLabel = () => ({ online: ['在线', ''], queued: ['已缓存待同步', 'warn'], synced: ['已同步', 'ok'] }[V.rec.sync] || ['在线', '']);
  function txHtml() {
    const r = V.rec;
    if (r.editing) return App.esc(r.text);
    if (!r.text && r.phase === 'idle') return `<span class="ph">点击上方按钮开始说话；转写会实时出现在这里，可直接修改。热词（客户名 / 虫害名 / 术语）自动高亮。</span>`;
    const d = r.original && r.original !== r.text ? diff(r.original, r.text) : null;
    const body = d ? `${highlight(d.pre)}${d.del ? `<span class="del">${App.esc(d.del)}</span>` : ''}${d.ins ? `<span class="ins">${App.esc(d.ins)}</span>` : ''}${highlight(d.post)}` : highlight(r.text);
    return body + (r.phase === 'rec' ? '<span class="caret"></span>' : '');
  }
  function hitsHtml() {
    const r = V.rec; const h = hits(r.text); const d = r.original && r.original !== r.text ? diff(r.original, r.text) : null;
    return `${h.length ? `<span>热词命中 ${h.length}：</span>${h.map((w) => `<span class="chip ${RISK.includes(w) ? 'danger' : 'brand'}">${App.esc(w)}</span>`).join('')}` : `<span>热词表 ${D.hotwords.length} 条（客户名 / 虫害名 / 术语），随客户表更新，提升识别</span>`}${d ? `<span style="margin-left:auto">${ui.chip('已人工校正 · 改动 1 处', 'ok', { sm: true, icon: 'check' })}</span>` : ''}`;
  }
  App.register('record', {
    title: '语音留痕', tab: 'route',
    prd: ['deck p15 · 30 秒留痕（设计目标）', '商汤能力 · 语音转写与热词'], rules: ['一次点击开始、再次点击结束；转写实时进入文本框可改', '识别失败不丢已录内容；原音与原文都保存', '弱网：已缓存待同步 → 已同步', '勾选首次拜访追加 4 项字段'],
    render(p) {
      restore(); if (p.storeId) V.storeId = p.storeId;
      const r = V.rec; const s = App.store(V.storeId);
      if (!r.target) r.target = D.demoTranscripts[V.version] || D.demoTranscripts.good;
      const meta = s ? `${s.address} · ${isRunning(s) || s.route.checkin ? `打点 ${s.route.checkin || V.checkin} · ${Math.max(1, Math.round(S._elapsed() / 60))} 分钟` : routeNo(s)}` : '直接在语音里说出公司名，提交后自动匹配';
      const store = `<div class="card tight mb12"><div class="row between"><div class="grow"><div style="font-weight:700;font-size:15px" class="ellipsis">${s ? App.esc(s.name) : '<span class="muted">未选客户</span>'}</div><div class="small muted ellipsis">${App.esc(meta)}</div></div>${ui.btn(s ? '切换' : '选择客户', { tone: 'secondary', size: 'xs', onclick: "S_VISIT.pickStore('record',true)" })}</div></div>`;
      const micLabel = r.phase === 'rec' ? '录音中' : r.phase === 'paused' ? '继续说' : r.text ? '继续说' : '点击开始';
      const micInner = r.phase === 'rec' ? `<div class="wave small"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span>${micLabel}</span>` : `${App.icon('mic', 28)}<span>${micLabel}</span>`;
      const sl = syncLabel();
      const mic = `<div class="vs-mic-wrap"><div class="vs-mic ${r.phase === 'rec' ? 'pulse' : (r.text ? '' : 'idle')}" id="vsMic" onclick="S_VISIT.mic()">${micInner}</div>
        <div class="wave vs-wave ${r.phase === 'rec' ? '' : 'off'}">${'<i></i>'.repeat(15)}</div>
        <div class="vs-meta"><span id="vsRecT">${mmss(r.sec)}</span><span>·</span><span>${r.phase === 'rec' ? '演示模式逐字播放' : '支持真麦克风 · 默认演示语音'}</span><span>·</span><span class="st ${sl[1]}" id="vsSync">${sl[0]}</span></div></div>`;
      const tx = `<div class="vs-tx ${r.editing ? 'editing' : ''}" id="vsTx" ${r.editing ? 'contenteditable="true" oninput="S_VISIT.txInput(this)"' : ''}>${txHtml()}</div>`;
      const d = r.original && r.original !== r.text ? diff(r.original, r.text) : null;
      const editLine = d ? `<div class="small muted mt8">人工修改 1 处：<span class="del" style="color:var(--danger);text-decoration:line-through">${App.esc(d.del || '（空）')}</span> → <span style="color:#15803d;font-weight:600">${App.esc(d.ins || '（删除）')}</span>（原音与 AI 原文保留，可回溯）</div>` : '';
      const hh = `<div class="vs-hits" id="vsHits">${hitsHtml()}</div>`;
      const interrupt = r.phase === 'paused' ? ui.notice('warn', `<div class="row between"><span>识别中断 · 已录内容未丢（${r.text.length} 字），可继续或改文字</span>${ui.btn('继续', { tone: 'primary', size: 'xs', onclick: 'S_VISIT.resume()' })}</div>`, 'alert').replace('class="notice warn"', 'class="notice warn mt12" style="margin-bottom:0"') : '';
      const ctl = `<div class="vs-ctl">${ui.btn('演示语音', { tone: r.phase === 'rec' ? 'primary' : 'secondary', onclick: 'S_VISIT.demoVoice()' })}${ui.btn('模拟识别中断', { tone: 'outline', onclick: 'S_VISIT.interrupt()', disabled: r.phase !== 'rec' })}${ui.btn(r.editing ? '完成编辑' : '改文字', { tone: r.editing ? 'primary' : 'outline', onclick: 'S_VISIT.edit()', disabled: !r.text })}</div>`;
      const sw = `<div class="card vs-sw"><div class="r"><span>弱网模拟</span><div class="vs-toggle ${V.weakNet ? 'on' : ''}" onclick="S_VISIT.weak()"></div></div>
        <div class="r"><span>首次拜访（追加 4 项字段）</span><div class="vs-toggle ${V.firstVisit ? 'on' : ''}" onclick="S_VISIT.first()"></div></div>
        <div class="r"><span>口述样例</span><select onchange="S_VISIT.sample(this.value)">${SAMPLES.map((x) => `<option value="${x.id}" ${x.id === V.version ? 'selected' : ''}>${x.label}</option>`).join('')}</select></div></div>`;
      const weakNote = V.weakNet && r.text ? ui.notice('warn', '弱网：记录先缓存在本机排队上传，网络恢复后自动同步，不会丢。').replace('class="notice warn"', 'class="notice warn mt12" style="margin-bottom:0"') : '';
      const doneNote = r.phase === 'done' && r.text ? ui.notice('ok', `转写完成 · ${d ? '已人工校正 · ' : ''}${V.rec.sync === 'queued' ? '已缓存待同步' : '已同步'} · 原音与原文已保存`, 'check-circle').replace('class="notice ok"', 'class="notice ok mt12" style="margin-bottom:0"') : '';
      const write = `<div class="card vs-write"><div class="row between mb8"><div class="card-title" style="font-weight:700">本次留痕将写入</div><span class="tiny muted">归档后自动</span></div><div class="chips">${ui.chip(`拜访记录 16${V.firstVisit ? ' + 4' : ''} 字段`, 'brand')}${ui.chip('路线状态 → 已留痕', 'ok')}${ui.chip('回访提醒', 'info')}${ui.chip('今日回顾', 'gray')}</div><div class="tiny muted mt8">AI 只负责把话变成字段，证据永远是你的原话；「30 秒留痕」为设计目标。</div></div>`;
      return store + mic + tx + editLine + hh + interrupt + ctl + doneNote + weakNote + sw + write;
    },
    footer() {
      const ok = !!V.rec.text && V.rec.phase !== 'rec' && !V.rec.editing;
      return ui.btn('提交结构化 · 日日新大模型抽取字段', { tone: 'primary', block: true, size: 'lg', icon: 'sparkle', onclick: 'S_VISIT.submit()', disabled: !ok });
    },
    mount(root) {
      clearTimers();
      if (V.rec.phase === 'rec') S._runTyping(root);
      if (V.rec.editing) { const el = root.querySelector('#vsTx'); if (el) setTimeout(() => el.focus(), 60); }
    },
    demoActions: [
      { label: '一键完成录音（演示）', icon: 'check', run() { S.finishNow(); } },
      { label: '切换弱样例', icon: 'refresh', run() { S.sample('weak'); S.demoVoice(); } },
      { label: '模拟识别中断', icon: 'alert', run() { if (V.rec.phase !== 'rec') S.demoVoice(); setTimeout(() => S.interrupt(), 1500); } },
    ],
  });
  S._runTyping = function (root) {
    const r = V.rec; const alive = () => document.body.contains(root) && r.phase === 'rec';
    every(1000, () => { r.sec++; const el = root.querySelector('#vsRecT'); if (el) el.textContent = mmss(r.sec); }, alive);
    every(70, () => {
      if (r.text.length >= r.target.length) { r.phase = 'done'; r.original = r.text; V.transcript = r.text; if (V.weakNet) r.sync = 'queued'; persist(); App.refresh(); return; }
      r.text = r.target.slice(0, r.text.length + 1);
      const tx = root.querySelector('#vsTx'); if (tx) { tx.innerHTML = txHtml(); }
      const hh = root.querySelector('#vsHits'); if (hh) hh.innerHTML = hitsHtml();
    }, alive);
  };
  S.mic = function () {
    const r = V.rec;
    if (r.phase === 'rec') { r.phase = 'done'; r.original = r.text; V.transcript = r.text; persist(); App.refresh(); App.toast('录音结束 · 原音与原文已保存', { icon: 'check' }); return; }
    if (r.phase === 'paused' || (r.phase === 'done' && r.text.length < r.target.length)) { S.resume(); return; }
    if (r.phase === 'done' && r.text) { App.toast('本段已说完 · 可改文字或提交结构化', { icon: 'mic' }); return; }
    S.demoVoice();
  };
  S.demoVoice = function () {
    const r = V.rec;
    if (!App.state.perms.mic) App.toast('录音未授权 · 演示用预置语音', { icon: 'mic' });
    r.target = D.demoTranscripts[V.version] || D.demoTranscripts.good;
    r.text = ''; r.original = ''; r.sec = 0; r.phase = 'rec'; r.editing = false; r.interrupted = false; r.sync = V.weakNet ? 'queued' : 'online';
    V.transcript = ''; persist(); App.refresh();
  };
  S.resume = function () { const r = V.rec; if (!r.target) r.target = D.demoTranscripts[V.version]; r.phase = 'rec'; r.editing = false; App.refresh(); App.toast('继续识别 · 已录内容保留', { icon: 'mic' }); };
  S.interrupt = function () { const r = V.rec; if (r.phase !== 'rec') return; r.phase = 'paused'; r.interrupted = true; V.transcript = r.text; persist(); App.refresh(); App.toast(`识别中断（演示）· 已录 ${r.text.length} 字未丢`, { icon: 'alert' }); };
  S.finishNow = function () { const r = V.rec; clearTimers(); r.target = D.demoTranscripts[V.version] || D.demoTranscripts.good; r.text = r.target; r.original = r.text; r.phase = 'done'; r.editing = false; r.sec = r.sec || 38; r.sync = V.weakNet ? 'queued' : 'synced'; V.transcript = r.text; persist(); App.refresh(); App.toast('录音已完成（演示）', { icon: 'check' }); };
  S.edit = function () {
    const r = V.rec;
    if (r.phase === 'rec') { r.phase = 'paused'; }
    if (!r.editing) { r.editing = true; if (!r.original) r.original = r.text; App.refresh(); App.toast('可直接修改文字 · 改动处标「已人工校正」', { icon: 'edit' }); return; }
    r.editing = false; if (r.phase === 'paused' && r.text.length >= r.target.length) r.phase = 'done'; if (r.phase === 'paused' && !r.interrupted) r.phase = 'done';
    V.transcript = r.text; persist(); App.refresh();
    if (r.original !== r.text) App.toast('已人工校正 · 原音与 AI 原文保留', { icon: 'check' });
  };
  S.txInput = function (el) { V.rec.text = el.innerText.replace(/\n+$/, ''); };
  S.weak = function () {
    V.weakNet = !V.weakNet; const r = V.rec;
    if (V.weakNet) { r.sync = r.text ? 'queued' : 'online'; persist(); App.refresh(); App.toast('弱网模拟开启 · 记录先缓存本机', { icon: 'cloud-off' }); if (r.text) setTimeout(() => { if (V.weakNet && r.sync === 'queued') { r.sync = 'synced'; const el = App.q('#vsSync'); if (el) { el.textContent = '已同步'; el.className = 'st ok'; } else App.refresh(); App.toast('网络恢复 · 已同步', { icon: 'cloud' }); } }, 1200); }
    else { r.sync = r.text ? 'synced' : 'online'; persist(); App.refresh(); App.toast('弱网模拟关闭', { icon: 'wifi' }); }
  };
  S.first = function () { V.firstVisit = !V.firstVisit; persist(); App.refresh(); App.toast(V.firstVisit ? '首次拜访：确认页追加 4 项字段' : '已取消首次拜访追加字段', { icon: 'list' }); };
  S.sample = function (v) {
    if (!D.demoTranscripts[v]) return; V.version = v; const r = V.rec; clearTimers();
    r.target = D.demoTranscripts[v]; r.text = ''; r.original = ''; r.phase = 'idle'; r.sec = 0; r.editing = false; r.interrupted = false; r.sync = 'online'; V.transcript = '';
    persist(); App.refresh(); App.toast(`已切换：${SAMPLES.find((x) => x.id === v).label}`, { icon: 'refresh' });
  };
  S.submit = function () {
    const r = V.rec; if (!r.text) { App.toast('先说一句或改文字，再提交结构化'); return; }
    V.transcript = r.text; if (r.sync === 'queued') r.sync = 'synced'; persist();
    const s = App.store(V.storeId); if (s && s.route && s.route.trace === 'todo') { s.route.trace = 'running'; s.route.checkin = s.route.checkin || s.route.time || '10:45'; App.state.demo.checkedIn = true; App.save(); }
    const close = App.loading('上传原文 → 日日新大模型抽取 16' + (V.firstVisit ? ' + 4' : '') + ' 字段…');
    setTimeout(() => { close(); App.go('confirm', { storeId: V.storeId || 's_bing', version: V.version, first: V.firstVisit ? '1' : '0' }); }, 900);
  };
})();
