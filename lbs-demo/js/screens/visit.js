/* ============================================================
   拜访采集 / 待确认事实 / 拜访详情（F03）
   visit-capture(storeId, oppId?) → visit-confirm(id) → visit-detail(id)
   状态机可见：本地草稿 → 上传中 → AI处理中 → 待确认 → 本系统已保存 → 待同步 CRM → CRM 同步成功
   ============================================================ */
(function () {
  'use strict';
  const ui = App.ui;
  const esc = App.esc;
  const alive = (id) => { const e = App.currentEntry(); return !!e && e.id === id; };
  const refreshIf = (id) => { if (alive(id)) App.refresh(); };
  const T = (x) => (x == null ? '' : (typeof x === 'string' ? x : (x.text || '')));
  const list = (arr) => (arr || []).map(T).filter(Boolean);
  const TYPES = ['陌拜', '约访', '回访', '勘查'];
  const PHOTO_SEQ = [
    { kind: 'kitchen', label: '后厨墙角 · 风险点位 1' },
    { kind: 'corner', label: '仓库门缝 · 风险点位 2' },
    { kind: 'pest', label: '排水沟 · 风险点位 3' },
  ];
  const REC_LIMIT = 6; // 演示：录音自动在 6 秒结束

  /* ============================================================
     一、采集页状态（模块级，App.refresh 重绘）
     ============================================================ */
  const CAP = {
    storeId: null, oppId: null, type: '约访', oppTouched: false,
    ocr: null,          // null | {status:'done', text, candidates, matched} | {status:'blur'}
    ocrPick: null,      // 选中的候选 id
    ocrChoice: null,    // 'link' | 'new'
    manualName: '',
    photos: [],
    rec: { status: 'idle', seconds: 0, text: '', typed: 0 },   // idle | recording | transcribing | done
    textMode: false, text: '', micDenied: false, resumed: false,
    sub: { status: 'idle', stage: 0, pct: 0, lines: [], error: '' }, // idle | running | error | ai_error
    sim: { offline: false, aiFail: false },
    gen: 0,
  };
  let recTimer = null, typeTimer = null;
  function clearTimers() { clearInterval(recTimer); recTimer = null; clearInterval(typeTimer); typeTimer = null; }

  function defaultType(st) {
    if (!st) return '约访';
    if (st.appointment) return '约访';
    if (st.coop === 'active') return '回访';
    return '陌拜';
  }
  function capReset(storeId, oppId) {
    clearTimers();
    const st = App.store(storeId);
    CAP.gen++;
    CAP.storeId = storeId;
    CAP.oppId = oppId || (st && st.primaryOppId) || (App.primaryOpp(storeId) || {}).id || null;
    CAP.oppTouched = false;
    CAP.type = defaultType(st);
    CAP.ocr = null; CAP.ocrPick = null; CAP.ocrChoice = null; CAP.manualName = '';
    CAP.photos = [];
    CAP.rec = { status: 'idle', seconds: 0, text: '', typed: 0 };
    CAP.textMode = false; CAP.text = ''; CAP.micDenied = false; CAP.resumed = false;
    CAP.sub = { status: 'idle', stage: 0, pct: 0, lines: [], error: '' };
    CAP.sim = { offline: false, aiFail: false };
  }
  function capInit(params) {
    const sid = params.storeId || 's_bing';
    if (CAP.storeId !== sid) capReset(sid, params.oppId);
    else if (params.oppId && !CAP.oppTouched) CAP.oppId = params.oppId;
  }
  const hasContent = () => !!(CAP.ocr || CAP.photos.length || CAP.rec.status === 'done' || (CAP.textMode && CAP.text.trim()));
  const speechText = () => (CAP.textMode ? CAP.text.trim() : (CAP.rec.status === 'done' ? CAP.rec.text : ''));

  /* ---------- 采集页片段 ---------- */
  function secHead(n, title, right) {
    return `<div class="section"><div class="row gap6"><span class="vis-n">${n}</span><h3>${esc(title)}</h3></div>${right ? `<div class="more">${right}</div>` : ''}</div>`;
  }
  function topStrip(st) {
    const rec = CAP.rec;
    const speech = rec.status === 'done' ? `${rec.seconds} 秒` : (CAP.textMode && CAP.text.trim() ? `${CAP.text.trim().length} 字` : '未录');
    const ocr = !CAP.ocr ? '未拍' : (CAP.ocr.status === 'blur' ? '模糊' : (CAP.ocrChoice === 'link' ? '已关联' : (CAP.ocrChoice === 'new' ? '新店草稿' : '待关联')));
    const mini = (icon, l, v, on) => `<div class="vis-mini ${on ? 'on' : ''}">${App.icon(icon, 16)}<div><div class="l">${esc(l)}</div><div class="v ellipsis">${esc(v)}</div></div></div>`;
    return `<div class="card tight vis-top">
      <div class="row between">
        <div class="row gap6">${ui.visitStatusChip('draft')}<span class="tiny muted">自动保存在本机 · 中途退出可恢复</span></div>
        <span class="tiny muted num">9/7 14:36</span>
      </div>
      <div class="vis-minis mt8">
        ${mini('store', '客户', st.alias || st.name, true)}
        ${mini('camera', '门头', ocr, !!CAP.ocr && CAP.ocr.status === 'done' && !!CAP.ocrChoice)}
        ${mini('image', '现场', CAP.photos.length ? `${CAP.photos.length} 张` : '未拍', CAP.photos.length > 0)}
        ${mini('mic', '口述', speech, rec.status === 'done' || (CAP.textMode && !!CAP.text.trim()))}
      </div>
      ${CAP.resumed ? `<div class="mt8">${ui.notice('info', '已恢复上次未提交的本地草稿，可继续补充后提交。', 'history')}</div>` : ''}
    </div>`;
  }
  function stepCustomer(st) {
    const opp = App.opp(CAP.oppId);
    const appt = st.appointment ? `今日 ${st.appointment.time} 约访 · ${st.appointment.with}` : (st.lastVisit ? `上次 ${App.fmt.md(st.lastVisit.date)} ${st.lastVisit.type}` : '首次接触');
    return `${secHead(1, '选择客户 / 商机')}
    <div class="card">
      <div class="row gap12">
        <div class="cell-icon">${App.icon('store', 20)}</div>
        <div class="grow"><div class="bold">${esc(st.name)}</div><div class="small muted mt4">${esc(st.address)} · ${esc(st.type || '')}</div></div>
        ${ui.coopChip(st.coop)}
      </div>
      <div class="divider"></div>
      <div class="row between">
        <span class="small muted">关联商机</span>
        <button class="vis-pick pressable" onclick="S_VISIT.pickOpp()">${opp ? `${esc(opp.service)} · ${esc(opp.kind)}` : '未关联商机'}${App.icon('chevron-down', 14)}</button>
      </div>
      ${opp ? `<div class="chips mt8">${ui.stageChip(opp.stage)}${ui.tierChip(opp.tier, { sm: false })}<span class="tiny muted">正式值 · ${esc(opp.tierSource || '')}</span></div>` : ''}
      <div class="divider"></div>
      <div class="row between"><span class="small muted">拜访类型</span><span class="tiny muted">${esc(appt)}</span></div>
      <div class="seg block mt8">${TYPES.map((t) => `<button class="${t === CAP.type ? 'active' : ''}" onclick="S_VISIT.setType('${t}')">${t}</button>`).join('')}</div>
      ${CAP.type === '陌拜' ? `<div class="tiny muted mt8">陌拜未见到关键人可保存真实结果，不要求强填预算。</div>` : ''}
    </div>`;
  }
  function stepStorefront(st) {
    const o = CAP.ocr;
    let body = '';
    if (!o) {
      body = `<div class="photo-grid">
        <div class="photo add pressable" onclick="S_VISIT.shoot()">${App.icon('camera', 22)}<span>拍门头</span></div>
        <div class="vis-tip"><div class="bold small">先拍门头，再核对门店</div><div class="tiny muted mt4">识别门店名称等可见信息 · 只给候选，不按名称自动合并</div></div>
      </div>`;
    } else if (o.status === 'blur') {
      body = `<div class="photo-grid"><div class="vis-ph">${ui.scene('blur', '门头 · 模糊')}</div></div>
      <div class="mt12">${ui.notice('warn', '<b>照片模糊，请补拍或手填门店名。</b><div class="tiny mt4">模糊照片不进入识别，也不会自动关联门店。</div>')}</div>
      <div class="btn-row"><button class="btn secondary sm" onclick="S_VISIT.shoot()">${App.icon('camera', 16)}补拍</button><button class="btn outline sm" onclick="S_VISIT.manualName()">${App.icon('keyboard', 16)}手填门店名</button></div>
      ${CAP.manualName ? `<div class="mt8">${ui.chip('手填：' + CAP.manualName, 'brand', { icon: 'keyboard' })}</div>` : ''}`;
    } else {
      const picked = o.candidates.find((c) => c.id === CAP.ocrPick) || o.candidates[0];
      const cands = o.candidates.map((c) => `<div class="vis-cand ${c.id === CAP.ocrPick ? 'on' : ''} pressable" onclick="S_VISIT.pickCand('${c.id}')">
          <div class="vis-radio"></div>
          <div class="grow"><div class="t ellipsis">${esc(c.name)}</div><div class="s ellipsis">${esc(c.addr)}</div></div>
          <div class="vis-score"><i style="width:${Math.round(c.score * 100)}%"></i></div><span class="vis-pct num">${Math.round(c.score * 100)}%</span>
        </div>`).join('');
      let decision = '';
      if (CAP.ocrChoice === 'link') decision = `<div class="row between mt12">${ui.chip('已关联：' + picked.name, 'ok', { icon: 'check' })}<button class="link small" onclick="S_VISIT.ocrChange()">更改</button></div>`;
      else if (CAP.ocrChoice === 'new') decision = `<div class="row between mt12">${ui.chip('新店草稿：' + o.text + '（待去重审核）', 'warn', { icon: 'plus' })}<button class="link small" onclick="S_VISIT.ocrChange()">更改</button></div>`;
      else decision = `<div class="btn-row mt12"><button class="btn primary sm" onclick="S_VISIT.ocrDecide('link')">${App.icon('check', 16)}关联已有门店</button><button class="btn outline sm" onclick="S_VISIT.ocrDecide('new')">提交新店草稿</button></div>`;
      body = `<div class="photo-grid"><div class="vis-ph">${ui.scene('storefront', '门头')}</div>
        <div class="vis-ocr-head"><div class="row gap6">${App.icon('scan', 16, 'ai-ink')}<span class="small bold">识别文字</span>${ui.chip('OCR 候选', 'ai', { sm: true })}</div><div class="vis-ocr-text">${esc(o.text)}</div><div class="tiny muted">可见信息 · 未推断电话/法人/价格</div></div>
      </div>
      <div class="vis-cands mt12">${cands}</div>
      ${decision}
      <div class="tiny muted mt8 row gap4">${App.icon('info', 12)}门头识别只提供候选，不按名称相同自动合并（F01）</div>`;
    }
    return `${secHead(2, '门头照片', CAP.ocr ? `<button class="link small" onclick="S_VISIT.shoot()">重拍</button>` : '')}<div class="card">${body}</div>`;
  }
  function stepScene() {
    const cells = CAP.photos.map((p, i) => `<div class="vis-ph">${ui.scene(p.kind, p.label)}<span class="mark">${ui.chip('风险点位', 'danger', { sm: true, icon: 'alert' })}</span><button class="rm" onclick="S_VISIT.removePhoto(${i})" aria-label="删除">${App.icon('x', 12)}</button></div>`).join('');
    const add = `<div class="photo add pressable" onclick="S_VISIT.addPhoto()">${App.icon('plus', 22)}<span>${CAP.photos.length ? '再拍一张' : '拍现场'}</span></div>`;
    return `${secHead(3, '现场照片 · 风险点位', `<span class="muted small">${CAP.photos.length}/9</span>`)}
    <div class="card">
      <div class="photo-grid">${cells}${add}</div>
      <div class="tiny muted mt8 row gap4">${App.icon('eye-off', 12)}照片只记录可见的现场情况，不推断法人/电话/价格等不可见信息（F03）</div>
    </div>`;
  }
  function stepSpeech() {
    const r = CAP.rec;
    let body = '';
    if (CAP.micDenied) body += ui.notice('warn', '<b>麦克风权限被拒绝</b><div class="tiny mt4">可改用文字及已有图片继续记录；随时可在系统设置中重新授权。</div>', 'mic');
    if (CAP.textMode) {
      body += `<textarea class="textarea" id="visText" placeholder="按拜访后口述的方式写：见到谁 · 什么需求/异议 · 现场观察 · 承诺 · 下一步…" oninput="S_VISIT.onText(this.value)">${esc(CAP.text)}</textarea>
        <div class="row between mt8"><span class="tiny muted">${CAP.text.trim().length} 字 · 文字与照片同样进入 AI 整理</span>${CAP.micDenied ? '' : `<button class="link small" onclick="S_VISIT.toggleText(false)">改用录音</button>`}</div>`;
    } else if (r.status === 'idle') {
      body += `<div class="vis-mic-wrap">
        <button class="vis-mic pressable" onclick="S_VISIT.mic()">${App.icon('mic', 30)}</button>
        <div class="vis-mic-hint">点击开始口述</div>
        <div class="tiny muted">拜访后口述即可 · 不要求现场持续录音</div>
      </div>
      <div class="row between mt8"><span class="tiny muted">示例：见到谁 · 需求 · 现场观察 · 承诺 · 下一步</span><button class="link small" onclick="S_VISIT.toggleText(true)">改用文字</button></div>`;
    } else if (r.status === 'recording') {
      body += `<div class="vis-mic-wrap">
        <button class="vis-mic rec pulse pressable" onclick="S_VISIT.mic()">${App.icon('stop', 26)}</button>
        <div class="wave mt8">${'<i></i>'.repeat(18)}</div>
        <div class="row gap6 mt4"><span class="vis-dot"></span><span class="vis-timer num">00:0${r.seconds}</span><span class="tiny muted">录音中 · 再次点击结束</span></div>
      </div>`;
    } else if (r.status === 'transcribing') {
      body += `<div class="vis-mic-wrap">
        <div class="vis-mic ai">${App.icon('refresh', 26, 'spin')}</div>
        <div class="vis-mic-hint">转写中…</div>
        <div class="tiny muted">录音 ${r.seconds} 秒 · 原始录音已保留</div>
      </div>`;
    } else {
      body += `<div class="vis-quote"><div class="vis-quote-ico">${App.icon('mic', 16)}</div><div class="grow"><div class="vis-quote-meta">原始口述 · 转写</div><div class="vis-quote-text" id="visTyped">${esc(r.text.slice(0, r.typed))}</div></div></div>
        <div class="row between mt8"><div class="row gap6">${ui.chip('已转写 · ' + r.seconds + ' 秒', 'ok', { sm: true, icon: 'check' })}<span class="tiny muted">可提交后再修改</span></div><div class="row gap12"><button class="link small" onclick="S_VISIT.reRecord()">重录</button><button class="link small" onclick="S_VISIT.toggleText(true)">改用文字</button></div></div>`;
    }
    return `${secHead(4, '口述 / 文字')}<div class="card">${body}</div>`;
  }
  function procCard() {
    const s = CAP.sub;
    const err = s.status === 'error' || s.status === 'ai_error';
    const lines = s.lines.map((l, i) => {
      const last = i === s.lines.length - 1;
      const ico = l.tone === 'error' ? App.icon('alert', 14, 'vis-l-err') : (last && s.status === 'running' ? App.icon('refresh', 14, 'spin vis-l-cur') : App.icon('check', 14, 'vis-l-ok'));
      return `<div class="vis-line ${l.tone || ''}">${ico}<span>${esc(l.text)}</span></div>`;
    }).join('');
    let action = '';
    if (s.status === 'error') action = `<div class="mt12">${ui.notice('danger', '<b>上传失败：网络中断</b> · 内容已保存为本地草稿，不会丢失。')}<div class="btn-row"><button class="btn primary sm" onclick="S_VISIT.retry()">${App.icon('refresh', 16)}重试上传</button><button class="btn ghost sm" onclick="S_VISIT.saveDraft()">稍后再传</button></div></div>`;
    if (s.status === 'ai_error') action = `<div class="mt12">${ui.notice('warn', '<b>AI 暂不可用</b> · 原始录音与照片已保存，可人工填写事实，不影响记录保存。')}<div class="btn-row"><button class="btn primary sm" onclick="S_VISIT.manualFill()">${App.icon('edit', 16)}人工填写</button><button class="btn ghost sm" onclick="S_VISIT.retryAI()">${App.icon('refresh', 16)}重试 AI</button></div></div>`;
    return `<div class="card vis-proc">
      <div class="card-title">${App.icon('sparkle', 16, 'ai-ink')}提交 AI 整理<span class="muted small" style="margin-left:auto;font-weight:500">${s.pct}%</span></div>
      ${ui.stepper(['本地草稿', '上传中', 'AI处理中', '待确认'], s.stage, { error: err })}
      <div class="mt12">${ui.progress(s.pct, s.stage >= 2)}</div>
      <div class="vis-lines mt12">${lines}</div>
      ${action}
    </div>`;
  }

  /* ---------- 采集页动作 ---------- */
  const S_VISIT = window.S_VISIT = {
    setType(t) { CAP.type = t; App.refresh(); },
    pickOpp() {
      const opps = App.oppsOf(CAP.storeId);
      const items = opps.map((o) => ({ label: `${o.service} · ${o.kind}`, sub: `${o.stage} · ${App.tierLabel(o.tier)}`, icon: 'briefcase', onSelect: () => { CAP.oppId = o.id; CAP.oppTouched = true; App.refresh(); } }));
      items.push({ label: '新建商机（草稿）', sub: '一店可有多个商机，互不覆盖', icon: 'plus', onSelect: () => App.toast('演示：新建商机草稿需选择服务项，此处略', { icon: 'info' }) });
      App.sheet({ title: '关联商机', items });
    },
    shoot() {
      const done = App.loading('识别门头…');
      setTimeout(() => {
        done();
        const st = App.store(CAP.storeId);
        const demo = DATA.demoVisit().ocr;
        if (CAP.storeId === 's_bing') CAP.ocr = { status: 'done', text: demo.text, matched: demo.matched, candidates: demo.candidates };
        else CAP.ocr = { status: 'done', text: st.name, matched: st.id, candidates: [{ id: st.id, name: st.name, addr: st.address, score: 0.93 }, { id: 'x', name: st.name.replace(/（.*?）/, '') + '（其他门店）', addr: '其他区域 · 同品牌不同地址', score: 0.38 }] };
        CAP.ocrPick = CAP.ocr.matched; CAP.ocrChoice = null; CAP.manualName = '';
        refreshIf('visit-capture');
      }, 900);
    },
    pickCand(id) { CAP.ocrPick = id; CAP.ocrChoice = null; App.refresh(); },
    ocrDecide(choice) {
      CAP.ocrChoice = choice;
      if (choice === 'link') { const c = CAP.ocr.candidates.find((x) => x.id === CAP.ocrPick); App.toast(`已关联 ${c ? c.name : '门店'}`, { icon: 'check', bottom: true }); }
      else App.toast('已记为新店草稿，等待去重审核', { icon: 'plus', bottom: true });
      App.refresh();
    },
    ocrChange() { CAP.ocrChoice = null; App.refresh(); },
    manualName() { App.prompt('手填门店名', '如：蜀香居川菜馆', (v) => { if (!v.trim()) return; CAP.manualName = v.trim(); App.toast('已手填门店名，将进入候选去重', { icon: 'check', bottom: true }); App.refresh(); }); },
    addPhoto() {
      if (CAP.photos.length >= PHOTO_SEQ.length) { App.toast('演示样本：已提供 3 张现场照片', { icon: 'image' }); return; }
      const done = App.loading('拍摄中…');
      setTimeout(() => { done(); CAP.photos.push(PHOTO_SEQ[CAP.photos.length]); refreshIf('visit-capture'); }, 500);
    },
    removePhoto(i) { CAP.photos.splice(i, 1); CAP.photos.forEach((p, k) => { p.label = PHOTO_SEQ[k] ? PHOTO_SEQ[k].label : p.label; }); App.refresh(); },
    mic() {
      const r = CAP.rec;
      if (r.status === 'idle' || r.status === 'done') {
        CAP.rec = { status: 'recording', seconds: 0, text: '', typed: 0 };
        App.refresh();
        clearInterval(recTimer);
        recTimer = setInterval(() => {
          if (!alive('visit-capture') || CAP.rec.status !== 'recording') { clearInterval(recTimer); return; }
          CAP.rec.seconds++;
          const el = App.q('.vis-timer');
          if (el) el.textContent = '00:0' + CAP.rec.seconds;
          if (CAP.rec.seconds >= REC_LIMIT) S_VISIT.stopRec();
        }, 1000);
      } else if (r.status === 'recording') {
        S_VISIT.stopRec();
      }
    },
    stopRec() {
      clearInterval(recTimer); recTimer = null;
      if (CAP.rec.status !== 'recording') return;
      if (CAP.rec.seconds < 1) CAP.rec.seconds = 1;
      CAP.rec.status = 'transcribing';
      App.refresh();
      setTimeout(() => {
        if (CAP.rec.status !== 'transcribing') return;
        CAP.rec.status = 'done'; CAP.rec.text = DATA.demoTranscript; CAP.rec.typed = 0;
        refreshIf('visit-capture');
      }, 1100);
    },
    reRecord() { CAP.rec = { status: 'idle', seconds: 0, text: '', typed: 0 }; App.refresh(); },
    toggleText(on) { CAP.textMode = !!on; App.refresh(); if (on) setTimeout(() => { const ta = App.q('#visText'); if (ta) ta.focus(); }, 50); },
    onText(v) { CAP.text = v; const c = App.q('#visText'); if (c) { /* 不重绘，避免失焦 */ } },
    saveDraft() {
      clearTimers();
      if (CAP.sub.status === 'running') return;
      CAP.sub = { status: 'idle', stage: 0, pct: 0, lines: [], error: '' };
      CAP.resumed = hasContent();
      App.toast('本地草稿已保存', { icon: 'check' });
      setTimeout(() => App.back(), 350);
    },
    /* ---- 提交状态机 ---- */
    submit() {
      if (CAP.sub.status === 'running') return; // 重复点击不重复建记录
      if (!hasContent()) { App.toast('请先拍照或口述/输入文字', { icon: 'info' }); return; }
      if (CAP.rec.status === 'recording') S_VISIT.stopRec();
      const gen = ++CAP.gen;
      CAP.sub = { status: 'running', stage: 0, pct: 8, lines: [], error: '' };
      const media = CAP.photos.length + (CAP.ocr && CAP.ocr.status === 'done' ? 1 : 0);
      const spd = speechText();
      CAP.sub.lines.push({ text: `本地草稿已保存（${media} 张照片${CAP.rec.status === 'done' ? `、录音 ${CAP.rec.seconds} 秒` : (spd ? `、文字 ${spd.length} 字` : '')}）` });
      App.refresh(); App.scrollTop();
      const step = (ms, fn) => setTimeout(() => { if (gen !== CAP.gen || !alive('visit-capture')) return; fn(); refreshIf('visit-capture'); }, ms);
      const runUpload = () => {
        step(500, () => { CAP.sub.stage = 1; CAP.sub.pct = 30; CAP.sub.lines.push({ text: `上传 ${media} 张照片（压缩后 ${(media * 0.4).toFixed(1)}MB）` }); });
        step(1300, () => {
          if (CAP.sim.offline) { CAP.sub.status = 'error'; CAP.sub.pct = 38; CAP.sub.lines.push({ text: '上传失败：网络中断 · 内容已保存为本地草稿', tone: 'error' }); return; }
          CAP.sub.pct = 52;
          CAP.sub.lines.push({ text: CAP.rec.status === 'done' ? `上传录音 ${CAP.rec.seconds} 秒（${CAP.rec.seconds * 16}KB）` : (spd ? '上传文字记录' : '无录音 · 仅照片') });
          runAI();
        });
      };
      const runAI = () => {
        step(600, () => { CAP.sub.stage = 2; CAP.sub.pct = 66; CAP.sub.lines.push({ text: CAP.rec.status === 'done' ? `转写 ${CAP.rec.seconds} 秒录音` : (spd ? '解析文字记录' : '识别照片可见信息') }); });
        step(1500, () => {
          if (CAP.sim.aiFail) { CAP.sub.status = 'ai_error'; CAP.sub.pct = 70; CAP.sub.lines.push({ text: 'AI 暂不可用，原始录音与照片已保存，可人工填写事实', tone: 'error' }); return; }
          CAP.sub.pct = 84; CAP.sub.lines.push({ text: '抽取结构化字段…（接触对象 / 需求 / 观察 / 承诺 / 下一步）' });
        });
        step(2300, () => { CAP.sub.pct = 95; CAP.sub.lines.push({ text: '标注缺失项与待核实项 · 不填造姓名 / 预算' }); });
        step(2900, () => { CAP.sub.stage = 3; CAP.sub.pct = 100; CAP.sub.lines.push({ text: '待确认事实已生成' }); S_VISIT.finish(false); });
      };
      S_VISIT._runUpload = runUpload; S_VISIT._runAI = runAI;
      runUpload();
    },
    retry() {
      if (CAP.sub.status !== 'error') return;
      CAP.sim.offline = false;
      CAP.sub.status = 'running';
      CAP.sub.lines.push({ text: '网络已恢复 · 使用同一请求 ID 续传，不重复建记录' });
      App.refresh();
      const gen = CAP.gen; const spd = speechText();
      setTimeout(() => {
        if (gen !== CAP.gen || !alive('visit-capture')) return;
        CAP.sub.pct = 52;
        CAP.sub.lines.push({ text: CAP.rec.status === 'done' ? `上传录音 ${CAP.rec.seconds} 秒（${CAP.rec.seconds * 16}KB）` : (spd ? '上传文字记录' : '无录音 · 仅照片') });
        App.refresh();
        S_VISIT._runAI && S_VISIT._runAI();
      }, 900);
    },
    retryAI() {
      if (CAP.sub.status !== 'ai_error') return;
      CAP.sim.aiFail = false; CAP.sub.status = 'running'; CAP.sub.lines.push({ text: '重新提交 AI 处理（原始内容不重复上传）' });
      App.refresh();
      S_VISIT._runAI && S_VISIT._runAI();
    },
    manualFill() { S_VISIT.finish(true); },
    finish(manual) {
      clearTimers();
      const sid = CAP.storeId;
      const isBing = sid === 's_bing';
      const id = isBing ? 'v_bing_new' : 'v_' + sid + '_new';
      const st = App.store(sid);
      const v = DATA.demoVisit();
      v.id = id; v.storeId = sid; v.oppId = CAP.oppId || v.oppId; v.type = CAP.type; v.time = '2026-09-07 14:52'; v.by = App.me().name;
      const spd = speechText();
      v.transcript = spd || '';
      v.inputMode = CAP.textMode ? '文字' : (CAP.rec.status === 'done' ? '录音' : '仅照片');
      if (CAP.rec.status === 'done') v.recordSeconds = CAP.rec.seconds;
      // 媒体：按实际采集内容
      const media = [];
      if (CAP.ocr && CAP.ocr.status === 'done') media.push({ kind: 'storefront', label: '门头 · OCR：' + CAP.ocr.text });
      else if (CAP.ocr && CAP.ocr.status === 'blur') media.push({ kind: 'blur', label: '门头 · 模糊' + (CAP.manualName ? '（手填：' + CAP.manualName + '）' : '') });
      CAP.photos.forEach((p) => media.push({ kind: p.kind, label: p.label }));
      v.media = media;
      if (!isBing) {
        v.ocr = CAP.ocr && CAP.ocr.status === 'done' ? { text: CAP.ocr.text, matched: CAP.ocr.matched, candidates: CAP.ocr.candidates } : null;
        v.observations = CAP.photos.map((p) => ({ text: p.label.replace(/ · 风险点位.*$/, '') + '：销售拍照记录的风险点位', tag: '销售描述 · 非确认虫害', photo: p.label }));
      }
      v.storeLink = CAP.ocrChoice === 'new' ? '新店草稿（待去重审核）' : (st ? st.name : '');
      if (manual) {
        v.aiFailed = true;
        v.contact = { name: '', role: '', decision: '', source: '' };
        v.decisionMaker = { name: '', role: '', status: '待填写', note: 'AI 未处理；人工填写' };
        v.needs = []; v.objections = []; v.observations = CAP.photos.map((p) => ({ text: p.label.replace(/ · 风险点位.*$/, ''), tag: '销售拍照记录 · 非确认虫害', photo: p.label }));
        v.commitments = { customer: [], sales: [] }; v.budget = { value: '', status: '未填写（不强填）' };
        v.result = ''; v.next = ''; v.planDate = '';
        v.aiMissing = ['AI 未处理：请人工填写接触对象、需求/异议、承诺、结果、下一步与计划日期', '原始录音与照片已保留，可随时回听'];
      } else if (!spd) {
        // 仅照片：不从照片推断接触对象/需求/承诺
        v.contact = { name: '', role: '', decision: '', source: '' };
        v.decisionMaker = { name: '', role: '', status: '待核实', note: '无口述，不推断' };
        v.needs = []; v.objections = []; v.commitments = { customer: [], sales: [] };
        v.observations = CAP.photos.map((p) => ({ text: p.label.replace(/ · 风险点位.*$/, ''), tag: '销售拍照记录 · 非确认虫害', photo: p.label }));
        v.result = ''; v.next = ''; v.planDate = ''; v.budget = { value: '', status: '未提及（不强填）' };
        v.aiMissing = ['接触对象与角色', '需求 / 异议', '客户承诺与销售承诺', '结果与下一步', '计划日期'];
        v.aiNote = '仅有照片：照片不推断法人 / 电话 / 价格等不可见信息';
      }
      v.status = 'pending_confirm';
      const existing = App.state.visits.find((x) => x.id === id);
      if (!existing) App.state.visits.unshift(v); else Object.assign(existing, v);
      App.save();
      CONF.id = null; // 确认页状态重置
      capReset(sid, CAP.oppId);
      CAP.storeId = null; // 下次进入全新开始
      App.toast(manual ? '已保存，请人工填写事实' : '待确认事实已生成', { icon: 'check' });
      setTimeout(() => App.replace('visit-confirm', { id }), manual ? 300 : 500);
    },
    /* ---- 演示动作 ---- */
    autofill() {
      const demo = DATA.demoVisit();
      const st = App.store(CAP.storeId);
      if (!CAP.ocr || CAP.ocr.status !== 'done') {
        CAP.ocr = CAP.storeId === 's_bing' ? { status: 'done', text: demo.ocr.text, matched: demo.ocr.matched, candidates: demo.ocr.candidates } : { status: 'done', text: st.name, matched: st.id, candidates: [{ id: st.id, name: st.name, addr: st.address, score: 0.93 }] };
        CAP.ocrPick = CAP.ocr.matched;
      }
      if (!CAP.ocrChoice) CAP.ocrChoice = 'link';
      if (!CAP.photos.length) CAP.photos = [PHOTO_SEQ[0], PHOTO_SEQ[1]].map((p) => Object.assign({}, p));
      if (!CAP.textMode && CAP.rec.status !== 'done') { clearInterval(recTimer); CAP.rec = { status: 'done', seconds: 6, text: DATA.demoTranscript, typed: DATA.demoTranscript.length }; }
      App.refresh();
    },
  };

  App.register('visit-capture', {
    title: '记录拜访',
    tab: 'customers',
    prd: ['F03 照片/语音/文字拜访留痕', 'F01 门头 OCR 仅候选', '7 页面表 · 拜访采集与确认', '7.1 典型交互示例'],
    rules: ['门头识别只给候选，不按同名合并', '照片不推断不可见信息', '拒绝权限可改用文字', '状态机可见：草稿→上传→AI→待确认', '失败显示环节并可重试', '重复点击不重复建记录'],
    render(params) {
      capInit(params);
      const st = App.store(CAP.storeId);
      if (!st) return ui.empty({ icon: 'store', title: '未找到门店', sub: '请从客户详情进入记录拜访' });
      const busy = CAP.sub.status !== 'idle';
      return `${topStrip(st)}${busy ? procCard() : ''}<div class="${busy ? 'vis-dim' : ''}">${stepCustomer(st)}${stepStorefront(st)}${stepScene()}${stepSpeech()}<div class="tiny muted" style="text-align:center;padding:6px 0 2px">清理设备缓存可能导致未上传内容丢失 · 上传状态在“我的 · 上传任务”可查</div></div>`;
    },
    footer() {
      const s = CAP.sub.status;
      if (s === 'running') return `<div class="btn-row"><button class="btn primary block" disabled>${App.icon('refresh', 18, 'spin')}处理中 · 请勿重复提交</button></div>`;
      if (s === 'error' || s === 'ai_error') return `<div class="btn-row"><button class="btn ghost" onclick="S_VISIT.saveDraft()">保存草稿</button><button class="btn primary" disabled>${App.icon('sparkle', 18)}提交 AI 整理</button></div>`;
      return `<div class="btn-row"><button class="btn ghost" onclick="S_VISIT.saveDraft()">保存草稿</button><button class="btn primary" id="visSubmit" onclick="S_VISIT.submit()">${App.icon('sparkle', 18)}提交 AI 整理</button></div>`;
    },
    mount(root) {
      // 转写文字逐字出现
      const r = CAP.rec;
      clearInterval(typeTimer); typeTimer = null;
      if (r.status === 'done' && r.typed < r.text.length) {
        const el = root.querySelector('#visTyped');
        typeTimer = setInterval(() => {
          if (!alive('visit-capture') || CAP.rec.status !== 'done') { clearInterval(typeTimer); return; }
          CAP.rec.typed = Math.min(CAP.rec.text.length, CAP.rec.typed + 1);
          if (el) el.textContent = CAP.rec.text.slice(0, CAP.rec.typed);
          if (CAP.rec.typed >= CAP.rec.text.length) { clearInterval(typeTimer); typeTimer = null; }
        }, 45);
      }
    },
    demoActions: [
      { label: '一键填充演示内容', icon: 'play', run() { S_VISIT.autofill(); App.toast('已填充：门头 + 2 张现场照片 + 口述', { icon: 'check' }); } },
      { label: '模拟模糊照片', icon: 'image', run() { CAP.ocr = { status: 'blur' }; CAP.ocrPick = null; CAP.ocrChoice = null; App.refresh(); App.toast('照片模糊，请补拍或手填门店名', { icon: 'alert' }); } },
      { label: '模拟拒绝麦克风权限', icon: 'mic', run() { clearTimers(); CAP.micDenied = true; CAP.textMode = true; CAP.rec = { status: 'idle', seconds: 0, text: '', typed: 0 }; App.refresh(); App.toast('麦克风权限被拒绝 · 已切换为文字输入', { icon: 'mic' }); } },
      { label: '模拟断网（上传失败）', icon: 'cloud-off', run() { CAP.sim.offline = true; CAP.sim.aiFail = false; if (CAP.sub.status === 'idle') { S_VISIT.autofill(); S_VISIT.submit(); } else App.toast('已设置：上传环节将失败', { icon: 'cloud-off' }); } },
      { label: '模拟 AI 失败', icon: 'bug', run() { CAP.sim.aiFail = true; CAP.sim.offline = false; if (CAP.sub.status === 'idle') { S_VISIT.autofill(); S_VISIT.submit(); } else App.toast('已设置：AI 处理环节将失败', { icon: 'bug' }); } },
      { label: '重新开始采集', icon: 'refresh', run() { const sid = CAP.storeId; capReset(sid, null); App.refresh(); App.toast('已清空本地草稿', { icon: 'refresh' }); } },
    ],
  });

  /* ============================================================
     二、待确认事实
     ============================================================ */
  const CONF = { id: null, keys: {}, edited: {}, sync: { status: 'idle', stage: 0, lines: [] }, sim: { crmTimeout: false }, gen: 0 };
  function confInit(id) {
    if (CONF.id !== id) { CONF.id = id; CONF.keys = {}; CONF.edited = {}; CONF.sync = { status: 'idle', stage: 0, lines: [] }; CONF.sim.crmTimeout = false; CONF.gen++; }
  }
  function getVisit(id) {
    let v = App.visit(id);
    if (!v && id === 'v_bing_new') { v = DATA.demoVisit(); App.state.visits.unshift(v); App.save(); }
    return v;
  }
  function keyItems(v) {
    const items = [];
    (v.commitments && v.commitments.customer || []).forEach((c, i) => items.push({ k: 'cust' + i, label: '客户承诺', text: T(c), icon: 'handshake' }));
    (v.commitments && v.commitments.sales || []).forEach((c, i) => items.push({ k: 'sales' + i, label: '销售承诺', text: T(c), icon: 'hand' }));
    items.push({ k: 'date', label: '计划日期', text: v.planDate ? `${App.fmt.mdw(v.planDate)}（${App.fmt.rel(v.planDate)}）` : '未填写 · 可留空，稍后补充', icon: 'calendar', missing: !v.planDate });
    items.push({ k: 'budget', label: '金额 / 预算', text: v.budget ? (v.budget.value || v.budget.status) : '未提及（不强填）', icon: 'yuan' });
    return items;
  }
  function dateLabel(d) { if (!d) return ''; const n = App.fmt.days(d); const wk = n >= 7 && n < 14 ? '下周' : (n >= 0 && n < 7 ? '本周' : ''); return `${App.fmt.mdw(d)}${wk ? ` · ${wk}` : ''}（${App.fmt.rel(d)}）`; }
  function srcTag(v, field, kind) {
    if (CONF.edited[field]) return ui.chip('已编辑', 'brand', { sm: true, icon: 'edit' });
    if (kind === 'pending') return ui.factTag('pending');
    if (v.aiFailed) return ui.chip('待人工填写', 'warn', { sm: true });
    return ui.chip('AI 抽取', 'ai', { sm: true });
  }
  function fieldRow({ label, value, placeholder, tag, helper, missing, onclick, extra, required }) {
    return `<div class="form-item vis-f ${missing ? 'missing' : ''} ${required ? 'required' : ''} pressable" onclick="${onclick}">
      <label>${esc(label)}</label>
      <div class="fv">${value ? `<div class="vis-fv">${value}</div>` : `<span class="placeholder">${esc(placeholder || '未填写 · 点击补充')}</span>`}${extra || ''}${helper ? `<div class="tiny muted mt4">${helper}</div>` : ''}</div>
      <div class="vis-ftag">${tag || ''}${App.icon('chevron-right', 14)}</div>
    </div>`;
  }
  function factsCard(v, readOnly) {
    const c = v.contact || {};
    const dm = v.decisionMaker;
    const needs = list(v.needs); const objs = list(v.objections);
    const obs = (v.observations || []).map((o) => (typeof o === 'string' ? { text: o } : o));
    const on = (f) => (readOnly ? '' : `S_VC.edit('${f}')`);
    const rows = [];
    rows.push(fieldRow({ label: '联系人', value: c.name || c.role ? `${esc(c.name || '（未提供姓名）')}${c.role ? ` · ${esc(c.role)}` : ''}${c.decision ? ` <span class="muted small">（${esc(c.decision)}）</span>` : ''}` : '', placeholder: '未填写 · 接触对象与角色', tag: srcTag(v, 'contact'), onclick: on('contact') }));
    if (dm) rows.push(fieldRow({ label: '决策人', value: dm.name ? `${esc(dm.name)} · ${esc(dm.role || '老板')}` : `<span class="vis-pending">（待核实）姓名未提供</span> · ${esc(dm.role || '老板')}`, tag: srcTag(v, 'decision', dm.name ? '' : 'pending'), helper: dm.name ? '' : '系统不填造姓名，可补充或留空', onclick: on('decision') }));
    rows.push(fieldRow({ label: '拜访类型', value: `${ui.chip(v.type || '—', 'info', { sm: true })} <span class="small muted">${esc(v.time || '')}</span>`, tag: ui.chip('销售选择', 'gray', { sm: true }), onclick: on('type') }));
    rows.push(fieldRow({ label: '需求 / 异议', value: needs.length || objs.length ? `${needs.map((n) => `<div>${esc(n)}</div>`).join('')}${objs.map((o) => `<div class="muted">异议：${esc(o)}</div>`).join('')}` : '', placeholder: '未提及', tag: srcTag(v, 'needs'), onclick: on('needs') }));
    rows.push(fieldRow({ label: '现场观察', value: obs.length ? obs.map((o) => `<div>${esc(o.text)}${o.photo ? ` <span class="tiny muted">· 照片：${esc(o.photo)}</span>` : ''}</div>${o.tag ? `<div class="mt4">${ui.chip(o.tag.indexOf('疑似') >= 0 ? '销售描述的疑似 · 非确认虫害' : o.tag, 'warn', { sm: true, icon: 'eye-off' })}</div>` : ''}`).join('') : '', placeholder: '无观察记录', tag: srcTag(v, 'observations'), onclick: on('observations') }));
    rows.push(fieldRow({ label: '结果', value: v.result ? esc(v.result) : '', placeholder: '未填写 · 如"未见到关键人"也可保存', tag: srcTag(v, 'result'), onclick: on('result') }));
    rows.push(fieldRow({ label: '下一步', value: v.next ? esc(v.next) : '', tag: srcTag(v, 'next'), onclick: on('next') }));
    rows.push(fieldRow({ label: '计划日期', value: v.planDate ? `${esc(dateLabel(v.planDate))}` : '', placeholder: '未填写 · 点击补充（可留空）', missing: !v.planDate, tag: srcTag(v, 'planDate'), onclick: on('planDate'), helper: v.planDate && !CONF.edited.planDate ? '客户约定日期优先于规则周期' : '' }));
    return `<div class="list">${rows.join('')}</div>`;
  }
  function transcriptCard(v) {
    if (!v.transcript) return `<div class="card tight"><div class="row gap8 muted small">${App.icon('mic', 16)}无口述记录${v.inputMode ? ` · ${esc(v.inputMode)}` : ''}${v.aiNote ? ` · ${esc(v.aiNote)}` : ''}</div></div>`;
    return `<div class="card vis-quote-card"><div class="vis-quote"><div class="vis-quote-ico">${App.icon('mic', 16)}</div><div class="grow"><div class="vis-quote-meta">原始口述${v.recordSeconds ? ` · 录音 ${v.recordSeconds} 秒` : ''}${v.inputMode === '文字' ? ' · 文字录入' : ''} · 原始证据保留</div><div class="vis-quote-text">“${esc(v.transcript)}”</div></div></div></div>`;
  }
  function photosCard(v) {
    if (!v.media || !v.media.length) return '';
    return `<div class="card"><div class="row between mb8"><span class="card-title" style="margin:0">材料证据</span><span class="tiny muted">${v.media.length} 张</span></div><div class="photo-grid">${v.media.map((m) => `<div class="vis-ph">${ui.scene(m.kind, m.label)}${/风险点位/.test(m.label || '') ? `<span class="mark">${ui.chip('风险点位', 'danger', { sm: true, icon: 'alert' })}</span>` : ''}</div>`).join('')}</div></div>`;
  }
  function keyCard(v) {
    const items = keyItems(v);
    const done = items.filter((it) => CONF.keys[it.k]).length;
    return `<div class="card vis-keycard">
      <div class="card-title">${App.icon('shield', 16)}关键信息单独确认<span class="vis-count ${done === items.length ? 'ok' : ''}">${done}/${items.length}</span></div>
      <div class="card-sub">承诺、金额、日期逐项确认；未提及的不强填，不替你补。</div>
      <div class="vis-keys mt12">${items.map((it) => `<div class="vis-key ${CONF.keys[it.k] ? 'on' : ''} ${it.missing ? 'miss' : ''} pressable" onclick="S_VC.toggleKey('${it.k}')"><div class="vis-check">${App.icon('check', 14)}</div><div class="grow"><div class="vis-key-l">${App.icon(it.icon, 12)}${esc(it.label)}</div><div class="vis-key-t">${esc(it.text)}</div></div></div>`).join('')}</div>
    </div>`;
  }
  function syncCard(v) {
    const s = CONF.sync;
    const err = s.status === 'error';
    const lines = s.lines.map((l, i) => {
      const last = i === s.lines.length - 1;
      const ico = l.tone === 'error' ? App.icon('alert', 14, 'vis-l-err') : (last && s.status === 'running' ? App.icon('refresh', 14, 'spin vis-l-cur') : App.icon('check', 14, 'vis-l-ok'));
      return `<div class="vis-line ${l.tone || ''}">${ico}<span>${esc(l.text)}</span></div>`;
    }).join('');
    return `<div class="card vis-proc">
      <div class="card-title">${App.icon('sync', 16)}保存与同步<span style="margin-left:auto">${ui.visitStatusChip(v.status)}</span></div>
      ${ui.stepper(['本系统已保存', '待同步 CRM', 'CRM 同步成功'], s.stage, { error: err })}
      <div class="vis-lines mt12">${lines}</div>
      ${err ? `<div class="mt12">${ui.notice('warn', '<b>CRM 同步超时</b> · 本系统已保存，稍后自动重试（不冒充已进入正式统计）。')}<div class="btn-row"><button class="btn primary sm" onclick="S_VC.retrySync()">${App.icon('refresh', 16)}立即重试</button><button class="btn ghost sm" onclick="App.toast('已加入同步队列 · 可在“我的 · 同步异常”查看',{icon:'clock'})">稍后自动重试</button></div></div>` : ''}
    </div>`;
  }
  function successCard(v) {
    const isBing = v.id === 'v_bing_new';
    const obs = (v.observations || []).length;
    const cust = list(v.commitments && v.commitments.customer).length;
    return `<div class="card vis-success">
      <div class="vis-ok-ico">${App.icon('check-circle', 30)}</div>
      <div class="t">已写入一次，驱动分析与任务建议</div>
      <div class="s">${esc(v.confirmedAt || '2026-09-07 15:03')} · 确认人 ${esc(v.by || App.me().name)}</div>
      <div class="chips mt12" style="justify-content:center">${ui.chip('本系统已保存', 'ok', { icon: 'check' })}${ui.chip('CRM 同步成功', 'ok', { icon: 'sync' })}${isBing ? ui.chip('AI 建议已生成', 'ai', { icon: 'sparkle' }) : ''}</div>
      <div class="vis-written mt12">
        <div><b>1</b><span>拜访事实</span></div>
        <div><b>${obs}</b><span>现场观察${obs ? '（疑似）' : ''}</span></div>
        <div><b>${cust}</b><span>客户承诺 → 任务建议</span></div>
        <div><b>${v.media ? v.media.length : 0}</b><span>材料证据</span></div>
      </div>
      <div class="tiny muted mt12">正式阶段 / 分层未改变；AI 建议需在商机推进卡上由你确认。</div>
    </div>`;
  }
  const S_VC = window.S_VC = {
    toggleKey(k) { if (CONF.sync.status !== 'idle') return; CONF.keys[k] = !CONF.keys[k]; App.refresh(); },
    confirmAll() { const v = getVisit(CONF.id); if (!v) return; keyItems(v).forEach((it) => { CONF.keys[it.k] = true; }); App.refresh(); },
    edit(field) {
      const v = getVisit(CONF.id); if (!v || CONF.sync.status !== 'idle') return;
      const set = (fn) => (val) => { fn(val); CONF.edited[field] = true; App.save(); App.refresh(); App.toast('已修改，确认后一次写入', { icon: 'edit', bottom: true }); };
      if (field === 'type') { App.sheet({ title: '拜访类型', items: TYPES.map((t) => ({ label: t, icon: 'tag', onSelect: set((x) => { v.type = t; })(t) })) }); return; }
      const map = {
        contact: ['联系人姓名 · 角色', '如：王女士 店长', (val) => { const p = val.trim().split(/[\s·/]+/); v.contact = Object.assign({}, v.contact, { name: p[0] || '', role: p[1] || (v.contact && v.contact.role) || '', decision: (v.contact && v.contact.decision) || '对接人', source: '销售填写' }); }],
        decision: ['补充决策人姓名（可留空）', '如：李老板 · 无法核实请留空', (val) => { v.decisionMaker = Object.assign({}, v.decisionMaker, { name: val.trim(), status: val.trim() ? '销售补充 · 待核实' : '待核实' }); }],
        needs: ['需求 / 异议', '如：希望先看每月服务方案；担心影响营业', (val) => { v.needs = val.trim() ? [val.trim()] : []; }],
        observations: ['现场观察（描述即可，不下结论）', '如：后厨墙角疑似鼠迹', (val) => { const first = (v.observations || [])[0]; v.observations = val.trim() ? [Object.assign({}, typeof first === 'object' ? first : {}, { text: val.trim(), tag: (first && first.tag) || '销售描述 · 非确认虫害' })] : []; }],
        result: ['本次结果', '如：需求初步确认，等待决策人沟通', (val) => { v.result = val.trim(); }],
        next: ['下一步', '如：下周老板到店时带方案沟通', (val) => { v.next = val.trim(); }],
        planDate: ['计划日期（YYYY-MM-DD，可留空）', '如：2026-09-15', (val) => { const d = val.trim(); if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) { App.toast('日期格式：2026-09-15', { icon: 'alert' }); return; } v.planDate = d; }],
      };
      const m = map[field]; if (!m) return;
      App.prompt(m[0], m[1], (val) => { if (val == null) return; set(m[2])(val); });
    },
    supplement() { App.toast('点击任一字段即可修改；缺失项可留空', { icon: 'edit', bottom: true }); const el = App.q('.screen:not(.under) .vis-facts'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    confirm() {
      const v = getVisit(CONF.id); if (!v) return;
      if (CONF.sync.status !== 'idle') return; // 重复点击不重复写入
      const items = keyItems(v);
      if (items.some((it) => !CONF.keys[it.k])) { App.toast('请逐项确认关键信息', { icon: 'shield' }); return; }
      const gen = ++CONF.gen;
      const reqId = 'REQ-20260907-0' + (140 + (v.id.length % 9));
      v.status = 'saved'; v.confirmedAt = '2026-09-07 15:03'; v.confirmedBy = App.me().name; v.requestId = reqId; App.save();
      CONF.sync = { status: 'running', stage: 0, lines: [{ text: '本系统已保存 · 已确认事实与原始证据（录音 / 照片）落库' }] };
      App.refresh(); App.scrollTop();
      const step = (ms, fn) => setTimeout(() => { if (gen !== CONF.gen || !alive('visit-confirm')) return; fn(); refreshIf('visit-confirm'); }, ms);
      step(700, () => { CONF.sync.stage = 1; CONF.sync.lines.push({ text: `待同步 CRM · 请求 ID ${reqId}（去重，重试不重复建记录）` }); });
      step(1500, () => {
        if (CONF.sim.crmTimeout) { CONF.sync.status = 'error'; CONF.sync.lines.push({ text: 'CRM 同步超时 · 本系统已保存，稍后自动重试', tone: 'error' }); return; }
        S_VC.finishSync(v);
      });
    },
    retrySync() {
      const v = getVisit(CONF.id); if (!v || CONF.sync.status !== 'error') return;
      CONF.sim.crmTimeout = false; CONF.sync.status = 'running'; CONF.sync.lines.push({ text: `重试同步 · 同一请求 ID ${v.requestId || ''}，不新增记录` });
      App.refresh();
      const gen = CONF.gen;
      setTimeout(() => { if (gen !== CONF.gen || !alive('visit-confirm')) return; S_VC.finishSync(v); refreshIf('visit-confirm'); }, 900);
    },
    finishSync(v) {
      CONF.sync.stage = 2; CONF.sync.status = 'done'; CONF.sync.lines.push({ text: 'CRM 同步成功 · 已进入正式统计' });
      if (v.id === 'v_bing_new') { DATA.confirmDemoVisit(App.state); }
      else {
        v.status = 'synced'; v.confirmedAt = v.confirmedAt || '2026-09-07 15:03';
        const st = App.store(v.storeId);
        if (st) { st.lastVisit = { date: v.time ? v.time.slice(0, 10) : App.TODAY, type: v.type, result: v.result || (v.next ? '下一步：' + v.next : '已确认'), by: v.by || App.me().name }; st.updatedAt = '2026-09-07 15:03'; }
      }
      // 从"我的 · 草稿"移除
      if (App.state.sync && App.state.sync.drafts) App.state.sync.drafts = App.state.sync.drafts.filter((d) => d.visitId !== v.id);
      if (App.state.notifications) App.state.notifications = App.state.notifications.filter((n) => n.visitId !== v.id);
      App.save();
      App.toast('已写入一次', { icon: 'check' });
    },
  };

  App.register('visit-confirm', {
    nav(params) { const v = App.visit(params.id); return { title: v && v.status === 'synced' && CONF.sync.status === 'done' ? '拜访已确认' : '确认拜访事实' }; },
    tab: 'customers',
    prd: ['F03 结构化字段 / 关键信息单独确认', 'F03 缺口提示不整条拒收', '10.2 一次录入与同步原则', '7.1 典型交互示例'],
    rules: ['不填造老板姓名（待核实）', '"疑似鼠迹"不写成确认虫害', '预算未提及不强填', '承诺 / 金额 / 日期单独确认', '本系统已保存 ≠ CRM 同步成功', '请求 ID 去重，重试不重复建记录'],
    render(params) {
      const id = params.id;
      confInit(id);
      const v = getVisit(id);
      if (!v) return ui.empty({ icon: 'doc', title: '未找到拜访记录', sub: '该记录可能已被清理或未生成' });
      const st = App.store(v.storeId) || {};
      const opp = App.opp(v.oppId);
      const done = CONF.sync.status === 'done';
      const busy = CONF.sync.status === 'running' || CONF.sync.status === 'error';
      const head = `<div class="card vis-head">
        <div class="row between top">
          <div class="grow"><div class="row gap6 wrap">${ui.chip(v.type || '拜访', 'info', { sm: true })}${ui.visitStatusChip(v.status)}</div><div class="vis-head-t mt8">${esc(st.name || '未知门店')}</div><div class="small muted mt4">${esc(v.time || '')} · ${esc(v.by || '')}${opp ? ` · ${esc(opp.service)} · ${esc(opp.kind)}` : ''}</div></div>
          <div class="cell-icon">${App.icon('store', 20)}</div>
        </div>
        ${v.storeLink && /新店草稿/.test(v.storeLink) ? `<div class="mt8">${ui.chip(v.storeLink, 'warn', { sm: true, icon: 'plus' })}</div>` : ''}
      </div>`;
      const missing = (v.aiMissing || []).length ? ui.notice('warn', `<b>缺失项提示</b><ul class="vis-ul">${v.aiMissing.map((m) => `<li>${esc(m)}</li>`).join('')}</ul><div class="tiny mt4">低质量内容给缺口提示，不整条拒收；可补充或留空后确认。</div>`, 'alert') : '';
      if (done) {
        return `${successCard(v)}${head}${ui.section('已确认事实', ui.factTag('fact'))}<div class="vis-facts">${factsCard(v, true)}</div>${transcriptCard(v)}${photosCard(v)}`;
      }
      return `${head}${busy ? syncCard(v) : ''}<div class="${busy ? 'vis-dim' : ''}">
        ${transcriptCard(v)}
        ${photosCard(v)}
        ${ui.section('AI 整理的待确认事实', ui.factTag('derived'), '点击字段可修改')}
        ${v.aiFailed ? ui.notice('ai', 'AI 未处理本次内容：以下字段为空，请人工填写；原始录音与照片已保留。', 'sparkle') : ''}
        <div class="vis-facts">${factsCard(v, false)}</div>
        ${keyCard(v)}
        ${missing}
        <div class="tiny muted" style="text-align:center;padding:0 8px 6px">确认后一次写入：本系统保存 → 回写 CRM；AI 建议只在商机推进卡上出现，不改正式值。</div>
      </div>`;
    },
    footer(params) {
      const v = App.visit(params.id); if (!v) return '';
      if (CONF.sync.status === 'done') {
        const opp = App.opp(v.oppId);
        const label = v.id === 'v_bing_new' ? '查看商机推进卡 · AI 建议已生成' : '查看商机推进卡';
        return `<div class="col gap6">${opp ? ui.btn(label, { tone: v.id === 'v_bing_new' ? 'ai' : 'primary', block: true, icon: 'sparkle', onclick: `App.go('opportunity',{id:'${opp.id}'})` }) : ''}<button class="btn ghost block" onclick="S_VC.backToCustomer()">返回客户</button></div>`;
      }
      if (CONF.sync.status === 'running') return `<button class="btn primary block" disabled>${App.icon('refresh', 18, 'spin')}写入中 · 请勿重复提交</button>`;
      if (CONF.sync.status === 'error') return `<div class="btn-row"><button class="btn ghost" onclick="S_VC.backToCustomer()">返回客户</button><button class="btn primary" onclick="S_VC.retrySync()">${App.icon('refresh', 18)}重试同步</button></div>`;
      const items = keyItems(v); const done = items.filter((it) => CONF.keys[it.k]).length;
      const ready = done === items.length;
      return `<div class="btn-row"><button class="btn ghost" onclick="S_VC.supplement()">${App.icon('edit', 18)}补充 / 修改</button><button class="btn primary" id="vcConfirm" ${ready ? '' : 'disabled'} onclick="S_VC.confirm()">${App.icon('check', 18)}确认并保存${ready ? '' : `（${done}/${items.length}）`}</button></div>`;
    },
    demoActions: [
      { label: '一键确认全部关键信息', icon: 'check', run() { S_VC.confirmAll(); } },
      { label: '模拟 CRM 超时', icon: 'cloud-off', run() { CONF.sim.crmTimeout = true; if (CONF.sync.status === 'idle') { S_VC.confirmAll(); S_VC.confirm(); } else App.toast('已设置：CRM 同步将超时', { icon: 'cloud-off' }); } },
    ],
  });
  S_VC.backToCustomer = function () {
    if (App.stack.some((e) => e.id === 'customer')) App.popTo('customer');
    else App.back();
  };

  /* ============================================================
     三、拜访详情（只读）
     ============================================================ */
  App.register('visit-detail', {
    title: '拜访详情',
    tab: 'customers',
    prd: ['F03 已确认事实与草稿明确区分', '10.2 本系统已保存 / CRM 同步成功'],
    rules: ['已确认事实只读，修改需新记录', '派生判断保存输入快照'],
    render(params) {
      const v = App.visit(params.id);
      if (!v) return ui.empty({ icon: 'doc', title: '未找到拜访记录' });
      const st = App.store(v.storeId) || {};
      const opp = App.opp(v.oppId);
      const c = v.contact || {};
      const obs = (v.observations || []).map((o) => (typeof o === 'string' ? { text: o } : o));
      const cust = list(v.commitments && v.commitments.customer); const sales = list(v.commitments && v.commitments.sales);
      const isFact = v.status === 'synced' || v.status === 'saved';
      const head = `<div class="card vis-head">
        <div class="row between top"><div class="grow"><div class="row gap6 wrap">${ui.chip(v.type || '拜访', 'info', { sm: true })}${ui.visitStatusChip(v.status)}${isFact ? ui.factTag('fact') : ui.factTag('pending')}</div><div class="vis-head-t mt8">${esc(st.name || '未知门店')}</div><div class="small muted mt4">${esc(v.time || '')} · ${esc(v.by || '')}</div></div><div class="cell-icon">${App.icon('store', 20)}</div></div>
        <div class="divider"></div>
        <div class="row between"><span class="small muted">确认人 / 时间</span><span class="small">${esc(v.confirmedBy || v.by || '')} · ${esc(v.confirmedAt || v.time || '')}</span></div>
        ${v.status === 'synced' ? `<div class="row between mt4"><span class="small muted">同步</span><span class="row gap6">${ui.chip('本系统已保存', 'ok', { sm: true })}${ui.chip('CRM 同步成功', 'ok', { sm: true })}</span></div>` : (v.status === 'saved' ? `<div class="row between mt4"><span class="small muted">同步</span>${ui.chip('本系统已保存 · 待同步 CRM', 'info', { sm: true })}</div>` : '')}
      </div>`;
      const kv = [
        ['联系人', c.name || c.role ? `${esc(c.name || '（未提供姓名）')}${c.role ? ` · ${esc(c.role)}` : ''}${c.decision ? ` <span class="muted">（${esc(c.decision)}）</span>` : ''}` : '<span class="muted">—</span>'],
      ];
      if (v.decisionMaker) kv.push(['决策人', v.decisionMaker.name ? esc(v.decisionMaker.name) + ' · ' + esc(v.decisionMaker.role || '') : `<span class="vis-pending">（待核实）</span> ${esc(v.decisionMaker.role || '')} ${ui.factTag('pending')}`]);
      kv.push(['需求', list(v.needs).length ? list(v.needs).map(esc).join('；') : '<span class="muted">未提及</span>']);
      if (list(v.objections).length) kv.push(['异议', list(v.objections).map(esc).join('；')]);
      kv.push(['现场观察', obs.length ? obs.map((o) => `<div>${esc(o.text)}${o.tag ? ` ${ui.chip(o.tag.indexOf('疑似') >= 0 ? '销售描述的疑似 · 非确认虫害' : o.tag, 'warn', { sm: true })}` : ''}</div>`).join('') : '<span class="muted">无</span>']);
      kv.push(['结果', v.result ? esc(v.result) : '<span class="muted">—</span>']);
      kv.push(['下一步', v.next ? esc(v.next) : '<span class="muted">—</span>']);
      kv.push(['计划日期', v.planDate ? esc(dateLabel(v.planDate)) : '<span class="muted">未填写</span>']);
      if (v.budget) kv.push(['金额 / 预算', esc(v.budget.value || v.budget.status)]);
      const commit = (cust.length || sales.length) ? `<div class="card"><div class="card-title">${App.icon('handshake', 16)}承诺${ui.factTag('fact')}</div>${cust.map((t) => `<div class="vis-cm"><span class="chip brand sm">客户</span><span>${esc(t)}</span></div>`).join('')}${sales.map((t) => `<div class="vis-cm"><span class="chip info sm">销售</span><span>${esc(t)}</span></div>`).join('')}</div>` : '';
      return `${head}
        ${ui.section('已确认事实', isFact ? ui.factTag('fact') : ui.factTag('pending'))}
        <div class="card">${ui.kv(kv)}</div>
        ${commit}
        ${transcriptCard(v)}
        ${photosCard(v)}
        <div class="list">${opp ? ui.cell({ title: `${esc(opp.service)} · ${esc(opp.kind)}`, sub: `商机推进卡 · ${esc(opp.stage)} · ${App.tierLabel(opp.tier)}`, icon: 'briefcase', onclick: `App.go('opportunity',{id:'${opp.id}'})` }) : ''}${st.id ? ui.cell({ title: esc(st.name), sub: '客户详情 · 统一时间线', icon: 'store', onclick: `App.go('customer',{id:'${st.id}'})` }) : ''}</div>
        ${v.status === 'pending_confirm' ? `<div class="mt8">${ui.btn('去确认事实', { block: true, icon: 'check', onclick: `App.go('visit-confirm',{id:'${v.id}'})` })}</div>` : ''}`;
    },
  });
})();
