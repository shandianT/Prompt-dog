/* ============================================================
   工作助手：销售问答（assistant）/ 知识条目（faq）/ 转技术协助（tech-request）/ 主管问数（ask）
   规则：只引用已发布知识；建议对客表达 + 依据 + 适用限制；内部提示单独标注；
         未收录 → 待核实 + 转技术协助；问数含期间/口径/样本量/更新时间，金额未接入不推算。
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_AST = {};
  const esc = (s) => App.esc(s);
  const ui = () => App.ui;

  /* ---------- 工具 ---------- */
  const norm = (s) => String(s == null ? '' : s).trim().replace(/[？?！!。，,、\s"“”]/g, '').toLowerCase();
  const pubFaq = () => (App.state.faq || []).filter((f) => f.status === '已发布');
  const faqById = (id) => App.by(App.state.faq, 'id', id);
  const GUARANTEE = ['保证', '承诺', '根除', '一定', '肯定', '100%', '绝对', '永远', '不再有'];
  const UNKNOWN_Q = '你们能保证一年不再有老鼠吗？';

  function hits(f, q) { const nq = norm(q); let n = 0; (f.keywords || []).forEach((k) => { if (k && nq.includes(norm(k))) n++; }); return n; }
  function overlap(f, q) { const a = new Set(norm(f.q).split('')); let c = 0; norm(q).split('').forEach((ch) => { if (a.has(ch)) c++; }); return c; }

  S.related = function (q, n = 2) {
    const pub = pubFaq();
    const scored = pub.map((f) => ({ f, s: hits(f, q) * 3 + overlap(f, q) })).sort((a, b) => b.s - a.s);
    const top = scored.filter((x) => x.s > 0).slice(0, n).map((x) => x.f);
    for (const f of pub) { if (top.length >= n) break; if (!top.includes(f)) top.push(f); }
    return top.map((f) => f.id);
  };

  // 检索：仅已发布知识参与；保证/承诺类问题不编造；已失效仅提示不引用
  S.match = function (q) {
    const nq = norm(q);
    const pub = pubFaq();
    const exact = pub.find((f) => norm(f.q) === nq);
    if (exact) return { kind: 'answer', faqId: exact.id };
    const related = S.related(q, 2);
    if (GUARANTEE.some((g) => nq.includes(norm(g)))) {
      return { kind: 'unknown', related, why: '问题涉及"保证 / 承诺"类表述：已发布知识中没有可引用的依据，不能替公司作出承诺。' };
    }
    const scored = pub.map((f) => ({ f, h: hits(f, q), o: overlap(f, q) })).filter((x) => x.h > 0).sort((a, b) => b.h - a.h || b.o - a.o);
    if (scored.length) return { kind: 'answer', faqId: scored[0].f.id };
    const expired = (App.state.faq || []).filter((f) => f.status === '已失效').find((f) => hits(f, q) > 0);
    if (expired) return { kind: 'expired', faqId: expired.id, related };
    return { kind: 'unknown', related };
  };

  const suggestList = () => pubFaq().map((f) => f.q).concat([UNKNOWN_Q]);

  /* ---------- 片段 ---------- */
  const aiAv = () => `<div class="ast-av">${App.icon('sparkle', 14)}</div>`;
  const msgUser = (text) => `<div class="msg me">${ui().avatar(App.me().name, 'sm')}<div class="bubble">${esc(text)}</div></div>`;
  const msgAI = (inner, rich) => `<div class="msg ${rich ? 'ast-rich' : ''}">${aiAv()}<div class="bubble">${inner}</div></div>`;
  const typingHtml = () => `<div class="msg" id="ast-typing">${aiAv()}<div class="bubble"><div class="ast-typing"><i></i><i></i><i></i></div></div></div>`;
  const kindChip = (f) => ui().chip(f.kind, f.kind === 'FAQ' ? 'brand' : 'info', { sm: true });
  const scopeChips = (f, sm) => `${ui().chip(f.service, 'outline', { sm })}${ui().chip(f.segment, 'outline', { sm })}${ui().chip(f.region, 'outline', { sm })}`;

  function srcBlock(f) {
    return `<div class="ast-src"><div class="ast-label">${App.icon('shield', 12)}依据</div>
      <div class="r"><span class="k">来源</span><span class="v">${esc(f.source)}</span></div>
      <div class="r"><span class="k">审核人</span><span class="v">${esc(f.reviewer)}</span></div>
      <div class="r"><span class="k">版本</span><span class="v">${esc(f.version)} · 已发布</span></div>
      <div class="r"><span class="k">有效期</span><span class="v">至 ${esc(f.validUntil)}</span></div></div>`;
  }
  const internalBlock = (f) => f.internal ? `<div class="ast-internal"><div class="ast-label">${App.icon('lock', 12)}内部销售提示 · 不进入对客文本</div><div>${esc(f.internal)}</div></div>` : '';
  const limitBlock = (f) => f.limits ? `<div class="ast-limit">${App.icon('alert', 14)}<div><b>适用限制</b>${esc(f.limits)}</div></div>` : '';

  function answerHtml(f) {
    return `<div class="row between mb8"><div class="row gap6 grow" style="min-width:0">${kindChip(f)}<span class="small muted ellipsis">${esc(f.q)}</span></div>${ui().chip('已审核发布', 'ok', { sm: true, icon: 'check' })}</div>
      <div class="ast-label">建议对客表达</div>
      <div class="ast-answer">${esc(f.answer)}</div>
      ${srcBlock(f)}
      ${limitBlock(f)}
      <div class="chips mt8">${scopeChips(f, true)}</div>
      ${internalBlock(f)}
      <div class="btn-row mt12">${ui().btn('打开来源', { tone: 'secondary', size: 'sm', icon: 'link', onclick: `App.go('faq',{id:'${f.id}'})` })}${ui().btn('反馈', { tone: 'ghost', size: 'sm', icon: 'thumbs', onclick: `S_AST.feedback('${f.id}')` })}</div>`;
  }
  function unknownHtml(m, i) {
    return `<div class="row gap6 mb8">${ui().factTag('pending')}<span class="tiny muted">已发布知识中无匹配条目</span></div>
      <div class="ast-answer">未检索到依据，暂不能给出公司承诺。已标记待核实。</div>
      ${m.why ? `<div class="ast-src">${esc(m.why)}</div>` : ''}
      <div class="btn-row mt12">${ui().btn('转技术协助', { tone: 'primary', size: 'sm', icon: 'coach', onclick: `S_AST.tech(${i})` })}${ui().btn('查看相关知识', { tone: 'ghost', size: 'sm', icon: 'doc', onclick: `S_AST.relatedSheet(${i})` })}</div>`;
  }
  function expiredHtml(m, i) {
    const f = faqById(m.faqId) || {};
    return `<div class="row gap6 mb8">${ui().chip('已失效', 'danger', { sm: true, icon: 'clock' })}<span class="small muted ellipsis">${esc(f.q || '')}</span></div>
      <div class="ast-answer">该知识已失效（${esc(f.validUntil || '2025-12-31')}），不再引用。</div>
      <div class="ast-src">未检索到其他已发布依据，暂不能给出公司承诺。已标记待核实。</div>
      <div class="btn-row mt12">${ui().btn('转技术协助', { tone: 'primary', size: 'sm', icon: 'coach', onclick: `S_AST.tech(${i})` })}${ui().btn('查看相关知识', { tone: 'ghost', size: 'sm', icon: 'doc', onclick: `S_AST.relatedSheet(${i})` })}</div>`;
  }
  function suggestHtml(cls) {
    return `<div class="suggest ${cls}">${suggestList().map((q, i) => `<button onclick="S_AST.askSuggest(${i})">${esc(q)}</button>`).join('')}</div>`;
  }
  function chatHtml() {
    const chat = App.state.chat || [];
    let h = msgAI('我可以回答客户常见问题并给出依据；未收录的问题会提示待核实。');
    if (!chat.length) h += suggestHtml('ast-suggest');
    chat.forEach((m, i) => {
      if (m.role === 'user') { h += msgUser(m.text); return; }
      if (m.kind === 'answer') { const f = faqById(m.faqId); h += f ? msgAI(answerHtml(f), true) : msgAI(unknownHtml(m, i), true); }
      else if (m.kind === 'expired') h += msgAI(expiredHtml(m, i), true);
      else h += msgAI(unknownHtml(m, i), true);
    });
    return `<div class="chat" id="ast-chat">${h}</div>`;
  }
  function heroHtml() {
    const me = App.me();
    const tiles = [
      { icon: 'message', tone: 'ai', label: '销售问答', sub: '引用审核知识', onclick: 'S_AST.focus()', active: true },
      { icon: 'template', tone: 'brand', label: '常用模板', sub: `${(App.state.templates || []).length} 个已审核`, onclick: 'S_AST.templates()' },
    ];
    if (App.isMgr()) tiles.push({ icon: 'chart', tone: 'violet', label: '主管问数', sub: '口径 · 样本量', onclick: "App.go('ask')" });
    else tiles.push({ icon: 'bug', tone: 'warn', label: '虫害识别', sub: 'P1 预览', onclick: "App.go('p1-pest')" });
    return `<div class="hero ai ast-hero"><div class="h-eyebrow">工作助手 · ${esc(me.roleName)} · ${esc(me.name)}</div><div class="h-title">只引用已审核发布的知识</div><div class="h-sub">回答 = 建议对客表达 + 依据来源 + 适用限制；未收录提示待核实，不编造承诺</div></div>
      <div class="ast-tiles">${tiles.map((t) => `<div class="ast-tile pressable ${t.active ? 'active' : ''}" onclick="${t.onclick}"><div class="ti ${t.tone}">${App.icon(t.icon, 20)}</div><div class="tl">${esc(t.label)}</div><div class="ts">${esc(t.sub)}</div></div>`).join('')}</div>`;
  }
  function scrollBottom(sel) {
    const top = App.currentEntry(); if (!top || !top.el) return;
    const c = top.el.querySelector('.content'); if (!c) return;
    requestAnimationFrame(() => { c.scrollTop = c.scrollHeight; });
  }
  function bindInput(root, inputId, sendId, fn) {
    const input = root.querySelector('#' + inputId); const send = root.querySelector('#' + sendId);
    const go = () => { const v = input ? input.value : ''; if (input) input.value = ''; fn(v); };
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    if (send) send.addEventListener('click', go);
  }

  /* ---------- 动作：销售问答 ---------- */
  S.askSuggest = (i) => S.send(suggestList()[i]);
  S.send = function (text) {
    text = String(text || '').trim(); if (!text) return;
    App.state.chat = App.state.chat || [];
    App.state.chat.push({ role: 'user', text });
    App.save();
    const top = App.currentEntry();
    const chat = top && top.el && top.el.querySelector('#ast-chat');
    if (chat) {
      const sug = chat.querySelector('.ast-suggest'); if (sug) sug.remove();
      chat.insertAdjacentHTML('beforeend', msgUser(text) + typingHtml());
    }
    scrollBottom();
    setTimeout(() => {
      const r = S.match(text);
      App.state.chat.push(Object.assign({ role: 'assistant', q: text }, r));
      App.save();
      const cur = App.currentEntry();
      if (cur && cur.id === 'assistant') { App.refresh(); scrollBottom(); }
    }, 700);
  };
  S.feedback = function (id) {
    const f = faqById(id) || {};
    const done = (label) => App.toast('已进入运营队列，新经验需审核后才成为正式知识', { icon: 'inbox', duration: 2000 });
    App.sheet({ title: `反馈该条知识 · ${f.q || ''}`, items: [
      { label: '有帮助', sub: '标记为有效引用', icon: 'thumbs', onSelect: () => done('有帮助') },
      { label: '不准确', sub: '提交给知识运营复核', icon: 'alert', onSelect: () => done('不准确') },
      { label: '已过期', sub: '申请失效或更新版本', icon: 'clock', onSelect: () => done('已过期') },
    ] });
  };
  S.tech = function (i) {
    const m = (App.state.chat || [])[i];
    App.go('tech-request', { q: (m && m.q) || '' });
  };
  S.relatedSheet = function (i) {
    const m = (App.state.chat || [])[i];
    const ids = (m && m.related && m.related.length) ? m.related : S.related((m && m.q) || '', 2);
    App.sheet({ title: '相关知识（仅已发布）', items: ids.map((id) => faqById(id)).filter(Boolean).map((f) => ({ label: f.q, sub: `${f.kind} · ${f.source} · ${f.version}`, icon: 'doc', onSelect: () => App.go('faq', { id: f.id }) })) });
  };
  S.templates = function () {
    const tpls = App.state.templates || [];
    App.sheet({ title: '常用模板（已审核）', items: tpls.map((t) => ({ label: t.name, sub: `${t.version} · ${t.status} · 审核：${t.reviewedBy}`, icon: 'template', right: t.pricing.includes('待审批') ? '报价待审批' : '', onSelect: () => App.toast(t.status === '已发布' ? '请在客户商机中发起方案，模板将在方案工作台使用' : '该模板审核中，暂不可用', { icon: 'template', duration: 2000 }) })) });
  };
  S.focus = function () {
    const top = App.currentEntry(); const input = top && top.el && top.el.querySelector('#ast-input');
    if (input) input.focus();
    scrollBottom();
  };
  S.clearChat = function () {
    App.state.chat = []; App.save();
    if (App.currentEntry() && App.currentEntry().id === 'assistant') App.refresh();
    App.toast('会话已清空', { icon: 'refresh' });
  };

  App.register('assistant', {
    title: '工作助手', tab: 'assistant', flush: true,
    prd: ['F07 销售问答与经验知识', '7 页面表 · 工作助手', 'R08 销冠问答知识库'],
    rules: ['只引用已发布知识；已失效不出现', '建议对客表达 + 依据来源 + 适用限制', '内部提示单独标注，不进对客文本', '未收录提示待核实，可转技术协助，不编造承诺', '反馈进入运营队列，审核后才成正式知识'],
    demoActions: [{ label: '清空会话', icon: 'refresh', run() { S.clearChat(); } }],
    render() { return `<div class="ast-wrap">${heroHtml()}${chatHtml()}</div>`; },
    footer() {
      const has = (App.state.chat || []).length > 0;
      return `${has ? suggestHtml('ast-suggest-bar') : ''}<div class="chat-input"><div class="in ast-input"><input id="ast-input" placeholder="输入客户提出的问题…" autocomplete="off"></div><button class="ib ghost" onclick="App.toast('演示中请用文字', {icon:'mic'})" aria-label="语音">${App.icon('mic', 18)}</button><button class="ib" id="ast-send" aria-label="发送">${App.icon('send', 18)}</button></div>`;
    },
    mount(root) {
      bindInput(root, 'ast-input', 'ast-send', S.send);
      if ((App.state.chat || []).length) scrollBottom();
    },
  });

  /* ---------- 知识条目 ---------- */
  App.register('faq', {
    nav: () => ({ title: '知识条目', solid: true }), tab: 'assistant',
    prd: ['F07 销售问答与经验知识', '11 数据对象 · 知识（来源/审核/版本/有效期）'],
    rules: ['来源 / 审核人 / 版本 / 有效期可见', '内部销售提示单独标注', '有帮助 / 不准确 / 已过期 → 运营队列', '已失效知识不再引用'],
    render(p) {
      const f = faqById(p.id);
      if (!f) return `<div class="mt16">${ui().empty({ icon: 'doc', title: '未找到该知识条目', sub: '条目可能已下线或不在你的权限范围内' })}</div>`;
      const expired = f.status !== '已发布';
      return `<div class="card">
          <div class="row gap6 mb8 wrap">${kindChip(f)}${expired ? ui().chip('已失效', 'danger', { sm: true, icon: 'clock' }) : ui().chip('已发布', 'ok', { sm: true, icon: 'check' })}${ui().chip('版本 ' + f.version, 'gray', { sm: true })}</div>
          <div class="fq-q">${esc(f.q)}</div>
          <div class="chips mt8">${scopeChips(f, true)}</div>
        </div>
        ${expired ? ui().notice('danger', `该知识已于 ${esc(f.validUntil)} 失效，不再参与检索与引用；如需更新请联系知识运营。`, 'clock') : ''}
        ${ui().section('建议对客表达')}
        <div class="card">${expired ? '<div class="muted">（已失效，不再展示对客文本）</div>' : `<div class="fq-answer">${esc(f.answer)}</div>`}</div>
        ${ui().section('依据')}
        <div class="card">${ui().kv([
          ['来源', esc(f.source)],
          ['审核人', esc(f.reviewer)],
          ['版本', `${esc(f.version)} · ${esc(f.status)}`],
          ['生效/失效', expired ? `已于 ${esc(f.validUntil)} 失效` : `发布即生效 · 至 ${esc(f.validUntil)} 失效`],
          ['适用范围', `<div class="chips">${scopeChips(f, true)}</div>`],
        ])}</div>
        ${f.limits ? `${ui().section('适用限制')}${ui().notice('warn', esc(f.limits))}` : ''}
        ${f.internal ? `${ui().section('内部销售提示')}<div class="card ast-internal-card"><div class="ast-label">${App.icon('lock', 12)}仅内部可见 · 不进入对客文本</div><div class="mt4">${esc(f.internal)}</div></div>` : ''}
        <div class="tiny muted" style="padding:0 4px 8px">反馈进入知识运营队列；新经验需审核后才成为正式知识。</div>`;
    },
    footer(p) {
      if (!faqById(p.id)) return '';
      return `<div class="btn-row">${ui().btn('有帮助', { tone: 'secondary', icon: 'thumbs', onclick: "S_AST.fb('有帮助')" })}${ui().btn('不准确', { tone: 'ghost', icon: 'alert', onclick: "S_AST.fb('不准确')" })}${ui().btn('已过期', { tone: 'ghost', icon: 'clock', onclick: "S_AST.fb('已过期')" })}</div>`;
    },
  });
  S.fb = () => App.toast('已进入运营队列，新经验需审核后才成为正式知识', { icon: 'inbox', duration: 2000 });

  /* ---------- 转技术协助 ---------- */
  const TR = { key: null, q: '', storeId: '', urgency: '一般', note: '' };
  const myStores = () => (App.state.stores || []).filter((s) => s.perm === 'full' && (App.isMgr() || s.ownerId === App.me().id));
  const coopLabel = (c) => ({ active: '服务中', paused: '停做', none: '未合作' }[c] || '');
  function trSync() {
    const top = App.currentEntry(); if (!top || top.id !== 'tech-request') return;
    const q = top.el.querySelector('#tr-q'); const n = top.el.querySelector('#tr-note');
    if (q) TR.q = q.value; if (n) TR.note = n.value;
  }
  S.trStore = function () {
    trSync();
    App.sheet({ title: '选择客户（我负责的门店）', items: myStores().map((s) => ({ label: s.name, sub: `${s.street || '地址待补'} · ${coopLabel(s.coop)}`, icon: 'store', onSelect: () => { TR.storeId = s.id; App.refresh(); } })) });
  };
  S.trUrgency = function (v) { trSync(); TR.urgency = v; App.refresh(); };
  S.trSubmit = function () {
    trSync();
    if (!TR.q.trim()) { App.toast('请填写问题', { icon: 'alert' }); return; }
    if (!TR.storeId) { TR.missing = true; App.refresh(); App.toast('请选择客户', { icon: 'alert' }); return; }
    App.state.techRequests = App.state.techRequests || [];
    App.state.techRequests.push({ id: App.uid('tr'), q: TR.q, storeId: TR.storeId, urgency: TR.urgency, note: TR.note, by: App.me().name, at: '2026-09-07 15:20', status: '待技术复核' });
    App.save();
    App.toast('已创建技术协助请求，技术同事复核后回复', { icon: 'check-circle', duration: 2000 });
    setTimeout(() => { if (App.currentEntry() && App.currentEntry().id === 'tech-request') App.back(); }, 600);
  };
  App.register('tech-request', {
    nav: () => ({ title: '转技术协助', solid: true }), tab: 'assistant',
    prd: ['F07 · 无法检索到依据 → 创建技术协助请求'],
    rules: ['不编造公司承诺', '技术复核后的回复需审核才成为正式知识', '请求关联客户与紧急程度'],
    render(p, ctx) {
      if (TR.key !== ctx.entry.key) { TR.key = ctx.entry.key; TR.q = p.q || ''; TR.storeId = ''; TR.urgency = '一般'; TR.note = ''; TR.missing = false; }
      const st = App.store(TR.storeId);
      return `${ui().notice('info', '未收录的问题不替公司作承诺。技术同事复核后回复你；回复作为新经验进入运营队列，审核后才成为正式知识。', 'coach')}
        <div class="list tr-form">
          <div class="form-item required top"><label>问题</label><div class="fv"><textarea id="tr-q" placeholder="客户提出的问题">${esc(TR.q)}</textarea></div></div>
          <div class="form-item required pressable ${TR.missing && !TR.storeId ? 'missing' : ''}" onclick="S_AST.trStore()"><label>客户</label><div class="fv">${st ? `${esc(st.name)}<div class="tiny muted">${esc(st.street || '地址待补')} · ${coopLabel(st.coop)}</div>` : '<span class="placeholder">选择门店</span>'}</div><div class="cell-right">${App.icon('chevron-right', 16)}</div></div>
          <div class="form-item"><label>紧急程度</label><div class="fv"><div class="seg">${['一般', '紧急'].map((v) => `<button class="${TR.urgency === v ? 'active' : ''}" onclick="S_AST.trUrgency('${v}')">${v}</button>`).join('')}</div></div></div>
          <div class="form-item top"><label>补充说明</label><div class="fv"><textarea id="tr-note" placeholder="客户原话、现场情况、希望回复时间">${esc(TR.note)}</textarea></div></div>
        </div>
        <div class="card"><div class="card-title">处理流程</div>${ui().stepper(['提交请求', '技术复核', '回复销售', '运营审核入库'], 0)}<div class="tiny muted mt8">${esc(TR.urgency === '紧急' ? '紧急请求：技术同事将优先处理' : '一般请求：技术同事按队列处理')} · 回复不会自动写入知识库</div></div>`;
    },
    footer() { return ui().btn('提交技术协助请求', { tone: 'primary', block: true, icon: 'send', onclick: 'S_AST.trSubmit()' }); },
  });

  /* ---------- 主管问数 ---------- */
  const ASK_KW = { a1: ['逾期', '超期', '过期', '没完成', '未完成'], a2: ['签约', '金额', '产出', '区域', '街', '收入', '业绩'], a3: ['转化', '新触达', '触达', '漏斗', '推进', '新客'], a4: ['拜访', '分布', '每个人', '团队', '谁', '多少'] };
  const RANK_WORDS = ['排名', '排行', '绩效', '考核', '最好', '最差', '最厉害', '第一名', '谁最'];
  const tmplById = (id) => App.by(App.state.askTemplates, 'id', id);
  S.isRanking = (q) => { const nq = norm(q); return RANK_WORDS.some((w) => nq.includes(norm(w))); };
  S.askMatch = function (q) {
    const nq = norm(q); const ts = App.state.askTemplates || [];
    const direct = ts.find((t) => norm(t.q) === nq || (t.variants || []).some((v) => norm(v) === nq));
    if (direct) return direct;
    const scored = ts.map((t) => ({ t, s: (ASK_KW[t.id] || []).filter((k) => nq.includes(norm(k))).length + (t.variants || []).filter((v) => nq.includes(norm(v))).length * 3 })).sort((a, b) => b.s - a.s);
    return scored.length && scored[0].s > 0 ? scored[0].t : null;
  };
  const metaHtml = (a) => `<div class="ask-meta"><div><span class="k">统计期间</span><span class="v">${esc(a.period)}</span></div><div><span class="k">样本量</span><span class="v">N = ${a.sample}</span></div><div class="wide"><span class="k">口径定义</span><span class="v">${esc(a.definition)}</span></div><div class="wide"><span class="k">更新时间</span><span class="v">${esc(a.updatedAt)} · Asia/Shanghai · 服务端按权限过滤后计算</span></div></div>`;
  const explainHtml = (text) => `<div class="ask-explain">${App.icon('sparkle', 14)}<div><b class="ai-ink">解释（AI）</b> ${esc(text)}</div></div>`;
  function altCard(alt) {
    if (!alt) return '';
    return `<div class="ask-alt"><div class="t">${esc(alt.title)}</div>${ui().bars(alt.rows.map((r) => ({ label: r.label, value: r.value == null ? 0 : r.value, display: r.display != null ? r.display : (r.value == null ? '暂无数据' : r.value), tone: r.tone })))}${alt.note ? `<div class="n">${esc(alt.note)}</div>` : ''}</div>`;
  }
  function askAnswerHtml(t) {
    const a = t.answer; let body = ''; let canTask = true;
    if (a.kind === 'list') {
      body = `<table class="table ask-table"><colgroup><col style="width:40%"><col style="width:22%"><col style="width:20%"><col style="width:18%"></colgroup><thead><tr><th>门店</th><th>任务</th><th>负责人</th><th class="r">逾期天</th></tr></thead><tbody>${a.rows.map((r) => `<tr class="pressable" onclick="App.go('customer',{id:'${r.storeId}'})"><td title="${esc(r.store)}">${esc(r.store)}</td><td>${esc(r.task)}</td><td>${esc(r.owner)}</td><td class="r"><span class="d">${r.days}</span></td></tr>`).join('')}</tbody></table><div class="tiny muted mt4">点击行可进入客户详情（下钻）</div>${explainHtml(a.explain)}`;
    } else if (a.kind === 'unavailable') {
      canTask = false;
      body = `${ui().notice('warn', '<b>签约金额未接入（P1）</b>，不可计算；不用商机预估额替代。', 'cloud-off')}<div class="small" style="color:var(--ink-2)">${esc(a.reason)}</div>${altCard(a.alt)}${altCard(a.alt2)}${explainHtml('替代指标只说明活动量与反馈情况，不等于"产出"；分母为零的街道显示"暂无数据"。')}`;
    } else if (a.kind === 'funnel') {
      body = `${ui().bars(a.rows)}${explainHtml(a.explain)}`;
    } else {
      body = `${ui().bars(a.rows)}<div class="row gap6 mt8">${ui().chip('地推', 'brand', { sm: true, dot: true })}${ui().chip('KA', 'info', { sm: true, dot: true })}<span class="tiny muted">地推 / KA 分开比较</span></div>${explainHtml(a.explain)}`;
    }
    return `<div class="ask-card"><div class="ask-q">${esc(t.q)}</div>${metaHtml(a)}${body}<div class="ask-links"><a class="link" onclick="S_AST.detail('${t.id}')">${App.icon('list', 14)}查看计算明细</a>${canTask ? `<a class="link" onclick="S_AST.coach('${t.id}')">${App.icon('coach', 14)}发起辅导/任务</a>` : ''}</div></div>`;
  }
  function askUnknownHtml(m) {
    const ts = App.state.askTemplates || [];
    const opts = `<div class="ask-opts">${ts.map((t, i) => `<button onclick="S_AST.askSend(${i})">${esc(t.q)}</button>`).join('')}</div>`;
    if (m && m.kind === 'ranking') {
      return `<div class="row gap6 mb8">${ui().chip('不生成排名 / 绩效结论', 'gray', { sm: true, icon: 'eye-off' })}</div><div class="ast-answer">问数只返回事实指标（覆盖、有效拜访、阶段分布、超期等）并按地推 / KA 分开比较，不生成销售个人排名或绩效结论。可以改问：</div>${opts}`;
    }
    return `<div class="row gap6 mb8">${ui().chip('口径不明确', 'warn', { sm: true, icon: 'question' })}</div><div class="ast-answer">口径不明确：请选择默认口径或换一种问法。</div>${opts}`;
  }
  function askChatHtml() {
    const chat = App.state.askChat || [];
    let h = '';
    chat.forEach((m) => {
      if (m.role === 'user') h += msgUser(m.text);
      else if (m.kind === 'answer') { const t = tmplById(m.tid); h += t ? askAnswerHtml(t) : msgAI(askUnknownHtml(m), true); }
      else h += msgAI(askUnknownHtml(m), true);
    });
    if (!chat.length) h += msgAI('选择上方固定问题，或直接输入自然语言变体。回答由服务端按指标字典计算，我只负责理解问题与解释结果。');
    return `<div class="chat" id="ask-chat">${h}</div>`;
  }
  S.askSend = (i) => S.ask((App.state.askTemplates || [])[i].q);
  S.ask = function (text) {
    text = String(text || '').trim(); if (!text) return;
    App.state.askChat = App.state.askChat || [];
    App.state.askChat.push({ role: 'user', text }); App.save();
    const top = App.currentEntry(); const chat = top && top.el && top.el.querySelector('#ask-chat');
    if (chat) chat.insertAdjacentHTML('beforeend', msgUser(text) + typingHtml());
    scrollBottom();
    setTimeout(() => {
      const t = S.isRanking(text) ? null : S.askMatch(text);
      App.state.askChat.push(t ? { role: 'assistant', kind: 'answer', tid: t.id, q: text } : { role: 'assistant', kind: S.isRanking(text) ? 'ranking' : 'unknown', q: text });
      App.save();
      const cur = App.currentEntry();
      if (cur && cur.id === 'ask') { App.refresh(); scrollBottom(); }
    }, 650);
  };
  S.detail = function (tid) {
    const t = tmplById(tid); if (!t) return; const a = t.answer;
    App.sheet({ title: `计算明细 · ${t.q}`, items: [
      { label: '口径定义', sub: a.definition, icon: 'doc' },
      { label: '统计期间', sub: `${a.period} · 时区 Asia/Shanghai`, icon: 'calendar' },
      { label: '筛选条件', sub: `${App.me().org} · 地推 / KA 分开 · 多人协作按主负责人归集，协作贡献另列`, icon: 'filter' },
      { label: '样本量', sub: `N = ${a.sample}${a.sample === 0 ? '（无样本，不计算比率）' : ''}`, icon: 'layers' },
      { label: '更新时间与来源', sub: `${a.updatedAt} · 指标字典 v0.1-demo · 服务端权限过滤后计算，模型不生成数值`, icon: 'shield' },
    ], cancel: '关闭' });
  };
  S.coach = function (tid) {
    const t = tmplById(tid); if (!t) return;
    const members = ((App.state.team || {}).members || []);
    App.sheet({ title: '发起辅导/任务 · 选择责任人', items: members.map((m) => ({ label: m.name, sub: `${m.role} · 超期 ${m.overdue} · 待确认 ${m.pendingConfirm}`, icon: 'user', onSelect: () => S.coachConfirm(t, m) })) });
  };
  S.coachConfirm = function (t, m) {
    const title = `辅导：${t.q.replace(/[？?]/g, '')}`;
    const row = t.answer.rows && t.answer.rows.find((r) => r.owner === m.name);
    App.confirm('创建辅导任务', `<div class="col"><div><b>责任人</b>：${esc(m.name)}（${esc(m.role)}）</div><div><b>任务</b>：${esc(title)}</div><div><b>来源</b>：问数「${esc(t.q)}」${row ? ` · ${esc(row.store)}` : ''}</div><div><b>截止</b>：9月9日（周三）</div><div class="tiny muted mt4">不由问数对话自动改客户归属；责任人需确认。</div></div>`, () => {
      App.state.tasks.unshift({ id: App.uid('t'), storeId: row ? row.storeId : null, oppId: null, title, type: '辅导', ownerId: m.id, ownerName: m.name, due: '2026-09-09', time: '', status: 'todo', source: '主管分配', reason: `主管${App.me().name}从问数结果发起`, evidence: [`问数 · ${t.q} · ${t.answer.updatedAt}`], expected: '复盘卡点并明确下一步' });
      App.save();
      App.toast('已创建任务（需指定责任人并确认）', { icon: 'check-circle', duration: 2000 });
    }, '创建任务');
  };
  S.clearAsk = function () { App.state.askChat = []; App.save(); if (App.currentEntry() && App.currentEntry().id === 'ask') App.refresh(); App.toast('问数记录已清空', { icon: 'refresh' }); };

  App.register('ask', {
    nav: () => ({ title: '主管问数', solid: true }), tab: 'assistant', flush: true,
    prd: ['F08 团队管理与问数', '12 指标定义', 'R07 区域产出与门店转化分析'],
    rules: ['回答含统计期间 / 口径 / 样本量 / 更新时间', '金额未接入显示"未接入"，不用预估额替代', '分母为零显示"暂无数据"不显示 0%', '地推 / KA 分开；不生成个人绩效结论', '口径歧义时提供选择或说明默认口径', '发起任务需指定责任人并确认'],
    demoActions: [{ label: '清空问数记录', icon: 'refresh', run() { S.clearAsk(); } }],
    render() {
      App.state.askChat = App.state.askChat || [];
      const ts = App.state.askTemplates || [];
      return `<div class="ast-wrap">
        ${App.isMgr() ? '' : ui().notice('info', '问数按角色数据范围返回，当前为主管演示（数据范围：华东一区）。', 'shield')}
        <div class="hero ast-hero"><div class="h-eyebrow">主管问数 · ${esc(App.me().org)} · ${esc(App.me().name)}</div><div class="h-title">问数</div><div class="h-sub">服务端按权限过滤后按指标字典计算，模型只理解问题与解释结果，不自行生成数值</div></div>
        <div class="card tight ask-tpl"><div class="ast-label">${App.icon('list', 12)}固定问题模板</div><div class="suggest ast-suggest ask-suggest">${ts.map((t, i) => `<button onclick="S_AST.askSend(${i})">${esc(t.q)}</button>`).join('')}</div><div class="tiny muted mt8">也可用自然语言变体，例如"这周有哪些回访逾期了"、"哪条街产出高"</div></div>
        ${askChatHtml()}
      </div>`;
    },
    footer() {
      return `<div class="chat-input"><div class="in ast-input"><input id="ask-input" placeholder="用自然语言提问，例如：逾期的客户有哪些" autocomplete="off"></div><button class="ib" id="ask-send" aria-label="发送">${App.icon('send', 18)}</button></div>`;
    },
    mount(root) {
      bindInput(root, 'ask-input', 'ask-send', S.ask);
      if ((App.state.askChat || []).length) scrollBottom();
    },
  });
})();
