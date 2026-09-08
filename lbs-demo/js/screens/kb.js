/* ============================================================
   知识库随身问 · 知识条目 · 拍照识虫（kb / kb-article / pest）
   规则（deck p19）：答案带出处 ≥2 条可展开原文；按角色权限；未命中不编答案，
   提示「未找到依据」并回流管理员；识虫为预置样本，需贵司样本共同验证。
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_KB = {};
  const esc = App.esc;

  App.css('kb', `
    .pg-head { padding: 6px 2px 12px; }
    .pg-head .pg-t { font-size: 22px; font-weight: 800; letter-spacing: -.01em; line-height: 1.2; }
    .pg-head .pg-s { font-size: 13px; color: var(--ink-3); margin-top: 4px; line-height: 1.45; }
    .hero.kb { padding: 14px 16px 12px; }
    .hero.kb .h-title { font-size: 19px; }
    .hero.kb .h-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .hero.kb .h-tags span { font-size: 11px; padding: 3px 8px; border-radius: 999px; background: rgba(255,255,255,.14); color: #fff; }
    .kb-entries { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .kb-entry { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 16px; background: var(--surface); box-shadow: var(--shadow-xs); border: 1px solid rgba(17,24,39,.04); }
    .kb-entry:active { transform: scale(.985); }
    .kb-entry .ei { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; background: var(--ai); flex: none; }
    .kb-entry .ei.navy { background: #0f2444; }
    .kb-entry .et { font-size: 14.5px; font-weight: 700; }
    .kb-entry .es { font-size: 11px; color: var(--ink-3); margin-top: 1px; }
    .kb-chat .msg .bubble { max-width: 88%; }
    .kb-chat .msg.me .bubble { max-width: 80%; }
    .kb-chat .b-head { font-size: 11px; color: var(--ai); font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
    .kb-chat .b-head.miss { color: #b45309; }
    .kb-chat .b-head.lock { color: var(--ink-3); }
    .kb-av { width: 30px; height: 30px; border-radius: 10px; flex: none; display: flex; align-items: center; justify-content: center; background: var(--ai); color: #fff; margin-top: 2px; }
    .kb-av.gray { background: var(--surface-3); color: var(--ink-3); }
    .kb-src { margin-top: 10px; padding-top: 8px; border-top: .5px solid var(--line-2); }
    .kb-src .st { font-size: 11px; color: var(--ink-3); font-weight: 600; margin-bottom: 4px; }
    .kb-src .si { border-radius: 10px; background: var(--surface-2); padding: 8px 10px; margin-top: 6px; font-size: 12.5px; }
    .kb-src .si .row { cursor: pointer; }
    .kb-src .si b { color: var(--ink); font-weight: 600; font-size: 12.5px; }
    .kb-src .si .loc { color: var(--ink-3); font-size: 11px; }
    .kb-src .si .quote { margin-top: 6px; padding: 8px 10px; border-left: 3px solid var(--ai); background: #fff; border-radius: 6px; color: var(--ink-2); font-size: 12.5px; line-height: 1.5; }
    .kb-src .si .quote .q-cap { font-size: 10.5px; color: var(--ai); font-weight: 600; margin-bottom: 2px; }
    .kb-acts { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
    .kb-acts .btn.xs { height: 28px; }
    .kb-faq { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
    .kb-faq button { height: 28px; padding: 0 10px; border-radius: 999px; background: var(--brand-soft); color: var(--brand-3); font-size: 12px; font-weight: 600; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .kb-think { display: inline-flex; gap: 4px; align-items: center; height: 18px; }
    .kb-think i { width: 6px; height: 6px; border-radius: 50%; background: var(--ai); opacity: .35; animation: kbdot 1s infinite; }
    .kb-think i:nth-child(2) { animation-delay: .2s } .kb-think i:nth-child(3) { animation-delay: .4s }
    @keyframes kbdot { 0%,100% { opacity: .3; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-3px) } }
    .suggest.wrap { flex-wrap: wrap; overflow: visible; }
    .suggest button.unknown { border-style: dashed; color: var(--ink-3); }
    .chat-input .in input { flex: 1; border: 0; outline: 0; background: transparent; color: var(--ink); font-size: 14px; min-width: 0; }
    .kb-art-q { font-size: 18px; font-weight: 700; line-height: 1.35; }
    .kb-art .ans { font-size: 14.5px; line-height: 1.65; color: var(--ink); }
    .kb-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .kb-meta .mi { background: var(--surface-2); border-radius: 12px; padding: 10px 12px; }
    .kb-meta .mi .l { font-size: 11px; color: var(--ink-3); }
    .kb-meta .mi .v { font-size: 14px; font-weight: 600; margin-top: 2px; }
    .pest-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .pest-tile { border-radius: 16px; overflow: hidden; background: var(--surface); border: 2px solid transparent; box-shadow: var(--shadow-xs); }
    .pest-tile.on { border-color: var(--ai); }
    .pest-tile .photo { border-radius: 0; aspect-ratio: 4 / 3; }
    .pest-tile .pt { padding: 8px 10px; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; gap: 6px; }
    .pest-tile .pt .muted { font-weight: 500; font-size: 11px; }
    .pest-res .sp { font-size: 19px; font-weight: 800; letter-spacing: -.01em; }
    .pest-res .alt { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
    .pest-rows { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
    .pest-rows .pr { display: grid; grid-template-columns: 44px 1fr; gap: 8px; font-size: 13.5px; line-height: 1.5; }
    .pest-rows .pr .k { color: var(--ai); font-weight: 700; }
    .pest-unknown { display: flex; align-items: center; gap: 12px; }
    .pest-unknown .ico { width: 44px; height: 44px; border-radius: 12px; background: var(--warn-soft); color: var(--warn); display: flex; align-items: center; justify-content: center; flex: none; }
  `);

  /* ---------- 工具 ---------- */
  const KB = () => App.state.kb || [];
  const article = (id) => KB().find((k) => k.id === id);
  const canSee = (k) => k.role !== '主管可见' || App.isMgr();
  const chat = () => { if (!App.state.ui.chat) App.state.ui.chat = []; return App.state.ui.chat; };
  const now = () => { const d = new Date(); return `${App.TODAY} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const firstSentence = (s) => (s || '').split(/[；;。]/)[0] + '。';
  const UNKNOWN_Q = '你们能保证一年不再有老鼠吗？';

  // 关键词匹配（不做语义猜测：命中数为 0 即未命中）
  function match(q) {
    let best = null, bestN = 0;
    KB().forEach((k) => {
      const n = (k.keywords || []).filter((w) => q.includes(w)).length + (q.includes(k.q.replace(/[？?]/g, '')) ? 3 : 0);
      if (n > bestN) { best = k; bestN = n; }
    });
    return best;
  }
  // 相关 FAQ：按字符重叠度取最近 2 条（排除自身、排除无权限）
  function related(q, excludeId, n = 2) {
    const chars = new Set(q.replace(/[？?，。、\s]/g, '').split(''));
    return KB().filter((k) => k.id !== excludeId && canSee(k))
      .map((k) => ({ k, s: (k.keywords || []).filter((w) => q.includes(w)).length * 3 + k.q.split('').filter((c) => chars.has(c)).length / 4 + k.hits / 100 }))
      .sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.k);
  }

  /* ---------- 渲染：气泡 ---------- */
  function bubbleAI(inner, head, headCls = '') {
    return `<div class="msg"><div class="kb-av ${headCls === 'lock' ? 'gray' : ''}">${App.icon(headCls === 'lock' ? 'lock' : 'sparkle', 16)}</div><div class="bubble">${head ? `<div class="b-head ${headCls}">${head}</div>` : ''}${inner}</div></div>`;
  }
  function renderMsg(m, i) {
    if (m.role === 'me') return `<div class="msg me"><div class="bubble">${esc(m.text)}</div></div>`;
    if (m.kind === 'thinking') return bubbleAI(`<div class="kb-think"><i></i><i></i><i></i></div>`, '日日新大模型 · 检索知识库中');
    if (m.kind === 'welcome') return bubbleAI(`你好，我是知识库随身问。客户追问虫害、药剂、保险与效果类问题时，可直接问我：答案只来自贵司知识库并带出处；库里没有的我不会编。`, '日日新大模型 · 检索范围：贵司知识库');
    if (m.kind === 'denied') {
      const k = article(m.kbId);
      return bubbleAI(`该条目「${esc(k ? k.q : '')}」仅主管可见，已提示申请权限。<div class="kb-acts">${App.ui.btn('申请查看权限', { tone: 'outline', size: 'xs', onclick: "App.toast('已向主管 李华 发送权限申请（演示）',{icon:'send'})" })}</div>`, '按角色权限 · 地推销售不可见', 'lock');
    }
    if (m.kind === 'hit') {
      const k = article(m.kbId); if (!k) return '';
      const open = m.open || {};
      const src = k.sources.map((s, j) => `<div class="si"><div class="row between" onclick="S_KB.toggleSrc(${i},${j})"><div class="grow"><b>${esc(s.title)}</b><div class="loc">${esc(s.loc)}${j === 0 ? ' · 主要依据' : ''}</div></div>${App.icon(open[j] ? 'chevron-down' : 'chevron-right', 16)}</div>${open[j] ? `<div class="quote"><div class="q-cap">原文摘录（演示）</div>${esc(firstSentence(k.answer))}</div>` : ''}</div>`).join('');
      const faq = related(k.q, k.id, 2);
      return bubbleAI(`${esc(k.answer)}<div class="kb-src"><div class="st">出处 · ${k.sources.length} 条 · 点击展开原文</div>${src}</div><div class="kb-acts">${App.ui.btn('打开条目', { tone: 'secondary', size: 'xs', icon: 'doc', onclick: `App.go('kb-article',{id:'${k.id}'})` })}${App.ui.btn('有帮助', { tone: 'ghost', size: 'xs', icon: 'thumbs', onclick: "App.toast('已反馈：有帮助',{icon:'check'})" })}${App.ui.btn('不准确', { tone: 'ghost', size: 'xs', onclick: "App.toast('已反馈：不准确，回流管理员复核',{icon:'send'})" })}</div>${faq.length ? `<div class="kb-src"><div class="st">相关 FAQ</div><div class="kb-faq">${faq.map((f) => `<button onclick="S_KB.ask('${f.id}')">${esc(f.q)}</button>`).join('')}</div></div>` : ''}`, `日日新大模型 · 依据 ${k.sources.length} 条出处 · ${esc(k.kind)}`);
    }
    if (m.kind === 'miss') {
      const faq = (m.faq || []).map(article).filter(Boolean);
      return bubbleAI(`未找到依据，不编答案。已回流管理员补充。<div class="kb-src"><div class="st">可能相关 · 按关键词就近推荐</div><div class="kb-faq">${faq.map((f) => `<button onclick="S_KB.ask('${f.id}')">${esc(f.q)}</button>`).join('')}</div></div><div class="kb-acts">${App.ui.chip('已回流管理员', 'warn', { sm: true, icon: 'send' })}${App.ui.btn('反馈给管理员', { tone: 'outline', size: 'xs', onclick: `S_KB.feedback(${i})` })}</div>`, '日日新大模型 · 未找到依据', 'miss');
    }
    return '';
  }

  /* ---------- 动作 ---------- */
  S.toggleSrc = function (i, j) {
    const m = chat()[i]; if (!m) return;
    m.open = m.open || {}; m.open[j] = !m.open[j];
    App.save(); App.refresh();
  };
  S.feedback = function () { App.toast('已附问题与时间提交管理员（演示）', { icon: 'send' }); };
  S.ask = function (id) { const k = article(id); if (k) S.send(k.q); };
  S.askUnknown = function () { S.send(UNKNOWN_Q); };
  S.mic = function () { App.toast('演示中请用文字提问', { icon: 'mic' }); };
  S.sendInput = function () {
    const el = document.getElementById('kbInput');
    const v = el ? el.value.trim() : '';
    if (!v) { App.toast('请输入问题'); return; }
    S.send(v);
  };
  S.send = function (q) {
    const c = chat();
    if (!c.length) c.push({ role: 'ai', kind: 'welcome' });
    c.push({ role: 'me', text: q, at: now() });
    c.push({ role: 'ai', kind: 'thinking' });
    App.save(); App.refresh(); scrollBottom();
    setTimeout(() => {
      const cc = chat();
      const ti = cc.findIndex((m) => m.kind === 'thinking');
      if (ti < 0) return;
      const k = match(q);
      let reply;
      if (k && !canSee(k)) reply = { role: 'ai', kind: 'denied', kbId: k.id };
      else if (k) { reply = { role: 'ai', kind: 'hit', kbId: k.id, open: {} }; k.hits = (k.hits || 0) + 1; }
      else {
        reply = { role: 'ai', kind: 'miss', faq: related(q, null, 2).map((x) => x.id) };
        App.state.kbMissLog = App.state.kbMissLog || [];
        if (!App.state.kbMissLog.find((x) => x.q === q)) App.state.kbMissLog.unshift({ q, at: now(), status: '已回流管理员' });
      }
      cc.splice(ti, 1, reply);
      App.save();
      if (App.currentEntry() && App.currentEntry().id === 'kb') { App.refresh(); scrollBottom(); }
    }, 700);
  };
  S.history = function () {
    const qs = chat().filter((m) => m.role === 'me');
    const miss = App.state.kbMissLog || [];
    const items = qs.slice().reverse().map((m) => ({ label: m.q || m.text, sub: `${m.at || ''} · 再问一次`, icon: 'history', onSelect: () => S.send(m.text) }));
    miss.forEach((x) => items.push({ label: x.q, sub: `${x.at} · ${x.status}`, icon: 'send' }));
    if (!items.length) items.push({ label: '暂无历史提问', sub: '本次演示尚未提问', icon: 'inbox' });
    App.sheet({ title: '历史提问 · 本人', items });
  };
  S.clear = function () { App.state.ui.chat = []; App.save(); App.refresh(); App.toast('已清空对话'); };
  function scrollBottom() { const e = App.currentEntry(); const c = e && e.el && e.el.querySelector('.content'); if (c) c.scrollTop = c.scrollHeight; }

  /* ---------- 页面：知识库（Tab 根） ---------- */
  App.register('kb', {
    title: '知识库', tab: 'kb',
    prd: ['deck p19 · 识虫与知识库随身问', '决策 d · 知识库按角色权限'],
    rules: ['答案带出处 ≥2 条，可展开原文', '未命中不编答案，回流管理员', '10 秒查到为设计目标'],
    demoActions: [
      { label: '演示：命中（k1）', icon: 'sparkle', run() { S.ask('k1'); } },
      { label: '演示：未命中', icon: 'alert', run() { S.askUnknown(); } },
      { label: '清空对话', icon: 'refresh', run() { S.clear(); } },
    ],
    render() {
      const me = App.me();
      const c = chat();
      const visible = KB().filter(canSee);
      const chips = KB().map((k) => `<button onclick="S_KB.ask('${k.id}')">${canSee(k) ? '' : App.icon('lock', 12)}${esc(k.q)}</button>`).join('') + `<button class="unknown" onclick="S_KB.askUnknown()">${esc(UNKNOWN_Q)}</button>`;
      const hero = `<div class="hero ai kb"><div class="h-eyebrow">知识库 · 日日新大模型检索</div><div class="h-title">知识库随身问</div><div class="h-sub">答案带出处 · 未命中不编答案 · 按角色权限（${esc(me.roleName)}）</div><div class="h-tags"><span>10 秒查到（设计目标）</span><span>条目 ${visible.length} 条可见</span><span>未命中回流管理员</span></div></div>`;
      const entries = `<div class="kb-entries"><div class="kb-entry" onclick="App.go('pest')"><div class="ei">${App.icon('camera', 20)}</div><div class="grow"><div class="et">拍照识虫</div><div class="es">种类 / 习性 / 危害 / 处置</div></div>${App.icon('chevron-right', 16)}</div><div class="kb-entry" onclick="S_KB.history()"><div class="ei navy">${App.icon('history', 20)}</div><div class="grow"><div class="et">历史提问</div><div class="es">${c.filter((m) => m.role === 'me').length} 条 · 未命中 ${(App.state.kbMissLog || []).length}</div></div>${App.icon('chevron-right', 16)}</div></div>`;
      const suggest = `<div class="section" style="margin-top:6px"><div><div class="eyebrow">${c.length ? '相关 FAQ · 继续问' : '客户常问 · 点一下就问'}</div><h3 style="font-size:15px">${c.length ? '换个问题' : '试试这些问题'}</h3></div>${c.length ? `<div class="more" onclick="S_KB.clear()">清空对话</div>` : `<div class="more">按点击热度</div>`}</div><div class="suggest wrap">${chips}</div>`;
      const body = c.length ? c.map(renderMsg).join('') : renderMsg({ role: 'ai', kind: 'welcome' });
      return `${hero}${entries}${suggest}<div class="chat kb-chat mt12" id="kbChat">${body}</div>`;
    },
    footer() {
      return `<div class="chat-input"><div class="ib ghost" onclick="S_KB.mic()">${App.icon('mic', 18)}</div><div class="in"><input id="kbInput" placeholder="客户问什么，就问什么…（Enter 发送）"></div><div class="ib" onclick="S_KB.sendInput()">${App.icon('send', 18)}</div></div>`;
    },
    mount(root) {
      const inp = root.querySelector('#kbInput');
      if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); S.sendInput(); } });
      if (chat().length) scrollBottom();
    },
  });

  /* ---------- 页面：知识条目 ---------- */
  App.register('kb-article', {
    title: '知识条目', tab: 'kb',
    prd: ['deck p19 · 答案带出处'], rules: ['出处可展开原文', '可见角色由管理后台配置', '反馈回流管理员'],
    render(p) {
      const k = article(p.id);
      if (!k) return App.ui.empty({ icon: 'inbox', title: '条目不存在', sub: '该知识条目未纳入演示' });
      if (!canSee(k)) return `<div class="card"><div class="row"><div class="kb-av gray">${App.icon('lock', 16)}</div><div class="grow"><div class="card-title" style="margin:0">仅主管可见</div><div class="small muted">该条目按角色权限限制，地推销售不可查看</div></div></div></div>${App.ui.btn('申请查看权限', { tone: 'primary', block: true, onclick: "App.toast('已向主管 李华 发送权限申请（演示）',{icon:'send'})" })}`;
      const src = k.sources.map((s, j) => `<div class="si"><div class="row between"><div class="grow"><b>${esc(s.title)}</b><div class="loc">${esc(s.loc)}</div></div>${App.ui.chip(j === 0 ? '主要依据' : '佐证', j === 0 ? 'ai' : 'gray', { sm: true })}</div><div class="quote"><div class="q-cap">原文摘录（演示）</div>${esc(firstSentence(k.answer))}</div></div>`).join('');
      return `<div class="card kb-art"><div class="row top between"><div class="kb-art-q grow">${esc(k.q)}</div>${App.ui.chip(k.kind, 'brand', { sm: true })}</div><div class="divider"></div><div class="eyebrow mb8">答案 · 来自知识库，非 AI 生成</div><div class="ans">${esc(k.answer)}</div><div class="kb-src"><div class="st">出处 · ${k.sources.length} 条</div>${src}</div></div>
      <div class="card"><div class="card-title">适用范围</div><div class="chips">${k.scope.map((s) => App.ui.chip(s, 'outline')).join('')}</div><div class="kb-meta mt12"><div class="mi"><div class="l">可见角色</div><div class="v">${esc(k.role)}</div></div><div class="mi"><div class="l">命中次数</div><div class="v">${k.hits} 次</div></div><div class="mi"><div class="l">版本</div><div class="v">v2 · 2026-08（演示）</div></div><div class="mi"><div class="l">更新</div><div class="v">管理员 · 企业管理后台</div></div></div></div>
      <div class="card"><div class="card-title">这条回答对现场有帮助吗？</div><div class="btn-row">${App.ui.btn('有帮助', { tone: 'secondary', size: 'sm', icon: 'thumbs', onclick: "App.toast('已反馈：有帮助',{icon:'check'})" })}${App.ui.btn('不准确', { tone: 'ghost', size: 'sm', onclick: "App.toast('已反馈：不准确，回流管理员复核',{icon:'send'})" })}${App.ui.btn('补充建议', { tone: 'ghost', size: 'sm', onclick: "App.prompt('补充建议','例：客户常追问药剂气味…',()=>App.toast('已提交管理员（演示）',{icon:'send'}))" })}</div></div>`;
    },
    footer(p) { return App.ui.btn('就这个问题继续问', { tone: 'primary', block: true, icon: 'message', onclick: `App.tab('kb');S_KB.ask('${esc(p.id)}')` }); },
  });

  /* ---------- 页面：拍照识虫 ---------- */
  const sample = (id) => (App.state.pestSamples || []).find((s) => s.id === id);
  S.pick = function (id) {
    const s = sample(id); if (!s) return;
    App.state.ui.pestPicked = id; App.state.ui.pestResult = null; App.save(); App.refresh();
    const close = App.loading('日日新大模型识别中…');
    setTimeout(() => { close(); App.state.ui.pestResult = id; App.save(); if (App.currentEntry() && App.currentEntry().id === 'pest') App.refresh(); }, 1000);
  };
  S.pestClear = function () { App.state.ui.pestPicked = null; App.state.ui.pestResult = null; App.state.ui.pestWritten = false; App.save(); App.refresh(); };
  S.pestWrite = function () { App.state.ui.pestWritten = true; App.save(); App.refresh(); App.toast('已作为候选写入拜访记录（非勘查结论）', { icon: 'check' }); };
  App.register('pest', {
    title: '拍照识虫', tab: 'kb',
    prd: ['deck p19 · 拍照识虫'], rules: ['识别为预置样本，需贵司样本共同验证', '给种类 / 习性 / 危害 / 处置 + 置信度', '模糊返回未知 + 补拍 / 人工协助', '写入拜访为候选，非勘查结论'],
    demoActions: [{ label: '清除结果', icon: 'refresh', run() { S.pestClear(); } }],
    render(p) {
      const st = App.state.ui; const picked = st.pestPicked; const res = st.pestResult ? sample(st.pestResult) : null;
      const store = p.storeId ? App.store(p.storeId) : null;
      const head = `<div class="pg-head"><div class="pg-t">拍照识虫</div><div class="pg-s">识别为预置样本，需贵司样本共同验证 · 结果给 种类 / 习性 / 危害 / 处置 + 置信度${store ? ` · 本次拜访：${esc(store.name)}` : ''}</div></div>`;
      const tiles = `<div class="pest-tiles">${(App.state.pestSamples || []).map((s) => `<div class="pest-tile ${picked === s.id ? 'on' : ''}" onclick="S_KB.pick('${s.id}')">${App.ui.scene(s.kind, s.label)}<div class="pt"><span>${esc(s.kind === 'blur' ? '样例 2 · 模糊' : '样例 1 · 清晰')}</span>${picked === s.id ? App.ui.chip(res ? '已识别' : '识别中', res ? 'ai' : 'gray', { sm: true }) : `<span class="muted">点击识别</span>`}</div></div>`).join('')}</div><div class="tiny muted" style="margin:8px 2px 0">演示图片 · 拍摄时靠近点位、避免逆光；真实识别能力需贵司提供样本共同验证，不给准确率</div>`;
      let result = '';
      if (res && res.unknown) {
        result = `<div class="card mt12 pest-res"><div class="pest-unknown"><div class="ico">${App.icon('eye-off', 22)}</div><div class="grow"><div class="sp">无法识别（未知）</div><div class="alt">不强制给出唯一答案 · 置信度不足</div></div></div>${App.ui.notice('warn', esc(res.note), 'alert')}<div class="btn-row">${App.ui.btn('补拍', { tone: 'primary', size: 'sm', icon: 'camera', onclick: "S_KB.pick('ps1')" })}${App.ui.btn('人工协助', { tone: 'outline', size: 'sm', icon: 'users', onclick: "App.toast('已转技术部人工识别，结果回推手机（演示）',{icon:'send'})" })}</div></div>`;
      } else if (res) {
        result = `<div class="card mt12 pest-res"><div class="row top between"><div class="grow"><div class="eyebrow">识别结果 · 日日新大模型</div><div class="sp">${esc(res.species)}</div><div class="alt">候选：${res.alt.map((a) => `${esc(a.name)} ${Math.round(a.conf * 100)}%`).join(' · ')}</div></div>${App.ui.chip(`置信度 ${Math.round(res.conf * 100)}%`, 'ai')}</div><div class="pest-rows"><div class="pr"><div class="k">习性</div><div>${esc(res.habits)}</div></div><div class="pr"><div class="k">危害</div><div>${esc(res.harm)}</div></div><div class="pr"><div class="k">处置</div><div>${esc(res.handling)}</div></div></div><div class="kb-src"><div class="st">出处</div><div class="si"><b>${esc(res.source)}</b><div class="loc">蜚蠊目 · 德国小蠊 · 与知识条目 k5 一致</div></div></div>${App.ui.notice('ai', esc(res.note) + '；写入拜访记录时标注为候选，勘查结论以技术部现场为准', 'info')}<div class="btn-row">${st.pestWritten ? App.ui.btn('已写入本次拜访', { tone: 'ghost', size: 'sm', icon: 'check', disabled: true }) : App.ui.btn('写入本次拜访记录', { tone: 'primary', size: 'sm', icon: 'check', onclick: 'S_KB.pestWrite()' })}${App.ui.btn('查看知识条目', { tone: 'outline', size: 'sm', icon: 'doc', onclick: "App.go('kb-article',{id:'k5'})" })}</div></div>`;
      } else if (picked) {
        result = `<div class="card mt12"><div class="row"><div class="kb-av">${App.icon('sparkle', 16)}</div><div class="grow"><div class="bold">日日新大模型识别中…</div><div class="small muted">比对预置样本库 · 约 1 秒</div></div></div><div class="mt8">${App.ui.progress(60, true)}</div></div>`;
      } else {
        result = `<div class="card mt12"><div class="row"><div class="kb-av gray">${App.icon('bug', 16)}</div><div class="grow"><div class="bold">选一张样例开始识别</div><div class="small muted">清晰样例 → 种类 + 置信度 + 候选；模糊样例 → 未知 + 补拍 / 人工协助</div></div></div></div>`;
      }
      return `${head}${tiles}${result}`;
    },
  });
})();
