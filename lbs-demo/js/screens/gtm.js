/* ============================================================
   GTM 助手：选模版 / 方案与报价 / 分享与审批（gtm / gtm-result / gtm-share）
   规则（deck p20）：三类模版贵司预置、AI 推荐并说明理由；模版 + 变量填充，
   AI 不直接输出专业内容；六段方案 + 报价单即时重算；折扣超阈值进价格审批，
   销售端不能自批；成本与毛利为占位字段供审批人查看。
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_GTM = {};
  const esc = App.esc;
  const G = () => App.state.gtm;
  // planSections 为函数，JSON 克隆进 state 时会丢失 → 回退到 DATA.initial()
  const planSections = (store, visit) => { const fn = (typeof G().planSections === 'function') ? G().planSections : window.DATA.initial().gtm.planSections; return fn(store, visit || {}); };

  App.css('gtm', `
    .pg-head { padding: 6px 2px 12px; }
    .pg-head .pg-t { font-size: 22px; font-weight: 800; letter-spacing: -.01em; line-height: 1.2; }
    .pg-head .pg-s { font-size: 13px; color: var(--ink-3); margin-top: 4px; line-height: 1.45; }
    .store-card { display: flex; align-items: center; gap: 10px; }
    .store-card .sn { font-size: 16px; font-weight: 700; }
    .store-card .ss { font-size: 12.5px; color: var(--ink-3); margin-top: 2px; line-height: 1.4; }
    .need-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; }
    .need-grid .ni .l { font-size: 11.5px; color: var(--ink-3); }
    .need-grid .ni .v { font-size: 14px; font-weight: 600; margin-top: 2px; line-height: 1.4; }
    .need-grid .ni .l .src { font-size: 10.5px; color: var(--ai); font-weight: 600; margin-left: 2px; }
    .need-grid .ni.wide { grid-column: 1 / -1; }
    .tp-group .card-title { justify-content: space-between; }
    .tp { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; }
    .tp + .tp { border-top: .5px solid var(--line); }
    .tp .cb { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--line-2); display: flex; align-items: center; justify-content: center; flex: none; margin-top: 1px; color: #fff; }
    .tp.on .cb { background: var(--brand); border-color: var(--brand); }
    .tp .tn { font-size: 14.5px; font-weight: 600; line-height: 1.35; }
    .tp .tm { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
    .tp .tr { margin-top: 5px; display: inline-flex; align-items: flex-start; gap: 4px; font-size: 12px; color: var(--ai); background: var(--ai-soft); padding: 4px 8px; border-radius: 8px; line-height: 1.4; }
    .gen-card .gs { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 14px; color: var(--ink-3); }
    .gen-card .gs .ic { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--surface-3); color: var(--ink-4); flex: none; }
    .gen-card .gs.done { color: var(--ink); } .gen-card .gs.done .ic { background: var(--ok-soft); color: var(--ok); }
    .gen-card .gs.run { color: var(--ai); font-weight: 600; } .gen-card .gs.run .ic { background: var(--ai-soft); color: var(--ai); }
    .plan-sec { margin-top: 10px; }
    .plan-sec .pt { font-size: 14px; font-weight: 700; color: var(--brand-3); margin-bottom: 3px; }
    .plan-sec .pp { font-size: 14px; line-height: 1.6; color: var(--ink-2); }
    .plan-more { display: block; width: 100%; text-align: center; color: var(--brand); font-size: 13.5px; font-weight: 600; padding: 10px 0 2px; line-height: 1.4; }
    .plan-foot { font-size: 11.5px; color: var(--ink-4); margin-top: 10px; }
    .quote-wrap { margin: 0 -6px; overflow-x: auto; }
    .quote-table .qn { font-size: 13.5px; font-weight: 500; }
    .quote-table .qty { -moz-appearance: textfield; }
    .quote-table .qty::-webkit-outer-spin-button, .quote-table .qty::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .quote-table .qty:focus { border-color: var(--brand); outline: 0; }
    .q-sum { margin-top: 6px; display: flex; flex-direction: column; gap: 8px; }
    .q-sum .qr { display: flex; align-items: center; justify-content: space-between; font-size: 13.5px; }
    .q-sum .qr .k { color: var(--ink-2); display: flex; align-items: center; gap: 6px; }
    .q-sum .qr .v { font-variant-numeric: tabular-nums; font-weight: 600; }
    .q-sum .qr.total { padding-top: 8px; border-top: .5px solid var(--line-2); }
    .q-sum .qr.total .v { font-size: 20px; font-weight: 800; color: var(--brand-3); }
    .q-sum .qr.total .k { font-size: 14px; font-weight: 700; color: var(--ink); }
    .q-sum .disc { width: 62px; height: 30px; border: 1px solid var(--line-2); border-radius: 8px; text-align: right; padding: 0 8px; font-size: 14px; background: #fff; }
    .q-sum .disc:focus { border-color: var(--brand); outline: 0; }
    .q-sum .disc { -moz-appearance: textfield; } .q-sum .disc::-webkit-outer-spin-button, .q-sum .disc::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .q-sum .disc.over { border-color: var(--warn); color: #b45309; font-weight: 700; }
    .q-sum .qr.locked { background: var(--surface-2); border-radius: 10px; padding: 8px 10px; color: var(--ink-3); font-size: 12.5px; }
    .q-sum .qr.locked .v { font-weight: 500; color: var(--ink-3); font-size: 12px; }
    .att { display: flex; align-items: center; gap: 10px; }
    .att .ai { width: 40px; height: 40px; border-radius: 10px; background: var(--brand-soft); color: var(--brand-3); display: flex; align-items: center; justify-content: center; flex: none; }
    .ref { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 13.5px; }
    .ref + .ref { border-top: .5px solid var(--line); }
    .ref .ri { width: 30px; height: 30px; border-radius: 9px; background: var(--surface-3); color: var(--ink-2); display: flex; align-items: center; justify-content: center; flex: none; }
    .ref .rs { font-size: 11.5px; color: var(--ink-3); }
    .cover { border-radius: 20px; padding: 16px; color: #fff; background: linear-gradient(135deg, #16355f 0%, #0f2444 60%, #0b1a33 100%); box-shadow: 0 10px 24px rgba(15,36,68,.28); margin-bottom: 12px; position: relative; overflow: hidden; }
    .cover .cv-eyebrow { font-size: 11px; opacity: .75; letter-spacing: .06em; font-weight: 600; }
    .cover .cv-title { font-size: 17px; font-weight: 700; margin-top: 4px; line-height: 1.35; }
    .cover .cv-body { margin-top: 10px; display: flex; gap: 12px; align-items: center; }
    .cover .cv-body .photo { width: 84px; aspect-ratio: 3 / 4; flex: none; border-radius: 10px; }
    .cover .cv-kv { font-size: 12.5px; opacity: .9; line-height: 1.7; }
    .cover .cv-kv b { font-weight: 700; opacity: 1; }
    .cover .cv-total { font-size: 24px; font-weight: 800; letter-spacing: -.01em; margin-top: 8px; }
    .cover .cv-total small { display: block; font-size: 12px; font-weight: 500; opacity: .8; margin-top: 2px; letter-spacing: 0; }
    .cover .cv-foot { margin-top: 10px; font-size: 11px; opacity: .7; }
    .share-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .share-tile { background: var(--surface); border-radius: 16px; padding: 14px 8px 12px; text-align: center; box-shadow: var(--shadow-xs); border: 1px solid rgba(17,24,39,.04); }
    .share-tile:active { transform: scale(.98); }
    .share-tile .si { width: 44px; height: 44px; border-radius: 12px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #fff; }
    .share-tile .si.wx { background: #1f9d55; } .share-tile .si.mail { background: var(--brand); } .share-tile .si.pdf { background: #b8433a; }
    .share-tile .st { font-size: 14px; font-weight: 700; } .share-tile .ss { font-size: 11px; color: var(--ink-3); margin-top: 2px; }
    .ap-row { display: grid; grid-template-columns: 76px 1fr; gap: 8px; font-size: 13.5px; padding: 6px 0; }
    .ap-row .k { color: var(--ink-3); }
  `);

  /* ---------- 取数 ---------- */
  function latestVisit(store) {
    if (!store) return null;
    if (store.id === 's_bing') return App.visit('v_bing_new') || null;
    return App.visitsOf(store.id)[0] || null;
  }
  function fieldsOf(store) {
    const v = latestVisit(store);
    if (v && v.fields) return { f: v.fields, v, demo: false };
    if (store && store.id === 's_bing') return { f: window.DATA.demoExtract('good').fields, v: null, demo: true };
    return { f: {}, v: null, demo: true };
  }
  // 需求摘要：来自最近留痕；缺失留空标「待补充」，不编造
  function summary(store) {
    const { f, v, demo } = fieldsOf(store);
    const val = (k) => (f[k] && f[k].v) ? f[k].v : '';
    let need = val('客户需求') || '';
    if (!need && v && v.hotwords) need = v.hotwords.filter((h) => !/店|馆|房|楼|厅/.test(h)).join(' + ');
    if (!need && store.id === 's_bing') need = '蟑螂 + 异味';
    const budget = val('客户预算') || val('预计金额') || (store.id === 's_bing' ? '¥2,000–2,500 / 月' : '');
    const next = val('下一步') || store.lastNext || '';
    const who = (val('客户职位') || store.contact.role || '') + ' ' + (val('客户名字') || store.contact.name || '');
    const date = v ? v.time.slice(0, 10) : (store.id === 's_bing' ? App.TODAY : (store.lastVisit || App.TODAY));
    const visitCount = App.visitsOf(store.id).length || (store.id === 's_bing' ? 1 : 0);
    return { need, budget, next, who: who.trim(), date, visitCount, visitId: v ? v.id : null, demo, score: v && v.score ? v.score.total : null };
  }
  function storeCard(store, sm) {
    const tier = App.ui.tierChip(store.tier, { sm: !!sm });
    return `<div class="card store-card"><div class="grow"><div class="sn">${esc(store.name)}</div><div class="ss">${esc(store.entity || '工商主体待补充')} · ${esc(store.category)} · 依据 ${App.fmt.md(summary(store).date)} 拜访记录</div></div>${tier}</div>`;
  }
  const catOf = (store) => (G().categories.includes(store.category) ? store.category : '连锁餐饮');
  function ensureCat(store) {
    const ui = App.state.ui;
    if (ui.gtmStore !== store.id) { ui.gtmStore = store.id; ui.gtmCategory = catOf(store); ui.gtmPicked = recommended(ui.gtmCategory, store).map((t) => t.id); ui.gtmGen = false; App.save(); }
    return ui.gtmCategory;
  }
  function reasonOf(t, cat, store) {
    if (t.category === cat && t.reason) return t.reason;
    if (t.category === '通用' && t.reason) return cat === '单店餐饮' ? '' : cat === '食品工厂' ? '工厂客户审核（AIB）通常要求附保险' : t.reason;
    if (t.category === cat) return `客户类别为${cat}，与模版适用范围一致`;
    return '';
  }
  const templatesFor = (cat) => G().templates.filter((t) => t.category === cat || t.category === '通用');
  const recommended = (cat, store) => templatesFor(cat).filter((t) => reasonOf(t, cat, store));

  /* ---------- 方案 / 报价数据 ---------- */
  const propId = (storeId) => 'g_' + storeId.replace(/^s_/, '');
  function ensureProposal(store) {
    App.state.proposals = App.state.proposals || [];
    let p = App.state.proposals.find((x) => x.id === propId(store.id));
    if (!p) {
      const jin = store.id === 's_jinpai';
      p = { id: propId(store.id), storeId: store.id, version: jin ? 'v2' : 'v1', createdAt: jin ? '2026-09-06 15:40' : App.TODAY + ' 11:20',
        category: App.state.ui.gtmStore === store.id ? App.state.ui.gtmCategory : catOf(store), picked: App.state.ui.gtmStore === store.id ? App.state.ui.gtmPicked.slice() : recommended(catOf(store), store).map((t) => t.id),
        items: App.clone(G().quoteItems), discount: jin ? 12 : 0, validDays: G().validDays, status: jin ? '审批通过' : 'draft', approver: jin ? '李华' : '', decidedAt: jin ? '2026-09-06 16:02' : '', events: jin ? [{ t: '2026-09-06 15:40', e: '提交价格审批（折扣 12%）' }, { t: '2026-09-06 16:02', e: '主管 李华 审批通过' }] : [] };
      App.state.proposals.push(p); App.save();
    }
    return p;
  }
  const calc = (p) => {
    const raw = p.items.reduce((s, it) => s + (Number(it.qty) || 0) * it.price, 0);
    const disc = Math.round(raw * (Number(p.discount) || 0) / 100);
    return { raw, disc, total: raw - disc, over: (Number(p.discount) || 0) > G().discountThreshold };
  };
  const money = (n) => App.fmt.money(Math.round(n));
  const planTitle = (store, p) => `${store.name.replace(/（.*?）/g, '')} · ${p.category} · 有害生物防治${p.category === '单店餐饮' ? '简约' : p.category === '食品工厂' ? '综合防治（AIB）' : '标准'}方案`;
  const planTpl = (p) => G().templates.find((t) => t.kind === '方案' && p.picked.includes(t.id)) || G().templates.find((t) => t.kind === '方案' && t.category === p.category) || G().templates[0];
  const quoteTpl = (p) => G().templates.find((t) => t.kind === '报价单' && p.picked.includes(t.id)) || G().templates.find((t) => t.kind === '报价单' && t.category === p.category) || G().templates.find((t) => t.kind === '报价单');
  const hasIns = (p) => p.picked.includes('tp_ins');

  /* ---------- 页面：选模版 ---------- */
  S.cat = function (c) { const ui = App.state.ui; ui.gtmCategory = c; ui.gtmPicked = recommended(c, App.store(ui.gtmStore)).map((t) => t.id); App.save(); App.refresh(); };
  S.toggle = function (id) { const ui = App.state.ui; const i = ui.gtmPicked.indexOf(id); if (i >= 0) ui.gtmPicked.splice(i, 1); else ui.gtmPicked.push(id); App.save(); App.refresh(); };
  const STAGES = ['装入本次需求与照片', '填充六段方案变量', '按模版生成报价单', '排版与引用标注'];
  S.generate = function (storeId) {
    const ui = App.state.ui;
    if (!ui.gtmPicked.some((id) => G().templates.find((t) => t.id === id && t.kind === '方案'))) { App.toast('请至少选择一套方案模版', { icon: 'alert' }); return; }
    ui.gtmGen = true; ui.gtmStep = 0; App.save(); App.refresh();
    const store = App.store(storeId);
    const tick = (n) => {
      if (!(App.currentEntry() && App.currentEntry().id === 'gtm')) { ui.gtmGen = false; App.save(); return; }
      ui.gtmStep = n; App.refresh();
      const el = App.currentEntry().el.querySelector('#genCard'); if (el) el.scrollIntoView({ block: 'end' });
      if (n < STAGES.length) setTimeout(() => tick(n + 1), 600);
      else setTimeout(() => {
        ui.gtmGen = false;
        // 重新生成：以当前类别与勾选覆盖草稿（保留已改数量 / 折扣）
        const p = ensureProposal(store); p.category = ui.gtmCategory; p.picked = ui.gtmPicked.slice(); p.generatedAt = App.TODAY + ' 11:20';
        App.save();
        App.replace('gtm-result', { storeId });
      }, 300);
    };
    setTimeout(() => tick(1), 500);
  };
  App.register('gtm', {
    title: 'GTM 助手', tab: 'customers',
    prd: ['deck p20 · GTM 助手 · 选模版'], rules: ['三类模版贵司预置，AI 推荐并说明理由', '模版 + 变量填充，AI 不直接输出专业内容', '输入 = 结构化需求 + 客户类别 + 照片 + 历史沟通'],
    demoActions: [{ label: '恢复 AI 推荐勾选', icon: 'sparkle', run() { const ui = App.state.ui; ui.gtmPicked = recommended(ui.gtmCategory, App.store(ui.gtmStore)).map((t) => t.id); App.save(); App.refresh(); } }],
    render(p) {
      const store = App.store(p.storeId || 's_bing');
      if (!store) return App.ui.empty({ icon: 'store', title: '未指定客户', sub: '请从客户 360 或归档页进入 GTM 助手' });
      const cat = ensureCat(store);
      const sm = summary(store);
      const ui = App.state.ui;
      const head = `<div class="pg-head"><div class="pg-t">GTM 助手</div><div class="pg-s">需求摘要已带入 · 选模版 · AI 填变量生成方案与报价 · 不输出专业内容</div></div>`;
      const cell = (l, v, wide, src) => `<div class="ni ${wide ? 'wide' : ''}"><div class="l">${l}${v && src ? `<span class="src">· ${src}</span>` : ''}</div><div class="v" ${v ? '' : 'style="color:var(--warn)"'}>${v ? esc(v) : '待补充 · 不编造'}</div></div>`;
      const need = `<div class="card"><div class="card-title" style="justify-content:space-between">需求摘要<span class="small muted" style="font-weight:500">来自 ${App.fmt.md(sm.date)} 留痕${sm.score ? ` · 质量分 ${sm.score}` : ''}${sm.demo ? ' · 演示抽取' : ''}</span></div><div class="need-grid">${cell('现场诉求', sm.need, false, 'AI 抽取')}${cell('客户预算', sm.budget, false, '客户口述')}${cell('联系人', sm.who)}${cell('下一步', sm.next)}${cell('历史沟通 · 照片', `${sm.visitCount} 次留痕 · 门头 1 张 · 风险点位 1 张（识虫：德国小蠊 86%）`, true)}</div></div>`;
      const seg = `<div class="card"><div class="card-title" style="justify-content:space-between">客户类别${App.ui.chip('AI 推荐 · ' + catOf(store), 'ai', { sm: true })}</div><div class="seg block">${G().categories.map((c) => `<button class="${c === cat ? 'active' : ''}" onclick="S_GTM.cat('${c}')">${esc(c)}</button>`).join('')}</div><div class="small muted mt8">依据：${esc(cat)} + ${esc(sm.need || '现场诉求待补充')} → 推荐 ${recommended(cat, store).map((t) => t.kind).join(' / ') || '暂无匹配模版'}</div></div>`;
      const groups = ['方案', '报价单', '保险单'].map((kind) => {
        const list = templatesFor(cat).filter((t) => t.kind === kind);
        const all = G().templates.filter((t) => t.kind === kind).length;
        const rows = list.map((t) => { const on = ui.gtmPicked.includes(t.id); const r = reasonOf(t, cat, store); return `<div class="tp ${on ? 'on' : ''}" onclick="S_GTM.toggle('${t.id}')"><div class="cb">${on ? App.icon('check', 14) : ''}</div><div class="grow"><div class="tn">${esc(t.name)}</div><div class="tm">${esc(t.category)} · ${esc(t.version)}${t.sections ? ` · ${t.sections} 段` : kind === '报价单' ? ` · ${G().quoteItems.length} 条目 · 折扣 > ${G().discountThreshold}% 需主管审批（演示值）` : ' · 附件'}</div>${r ? `<div class="tr">${App.icon('sparkle', 12)}<span>AI 推荐：${esc(r)}</span></div>` : ''}</div></div>`; }).join('');
        return `<div class="card tp-group"><div class="card-title">${kind}模版 · ${list.length} 套<span class="small muted" style="font-weight:500">企业预置 ${all} 套 · 销售可选</span></div>${rows || `<div class="small muted">该类别暂无预置模版，可在企业管理后台补充</div>`}</div>`;
      }).join('');
      const note = App.ui.notice('gray', '模版贵司预置 · 变量 AI 填 · AI 不直接输出专业内容；报价模型待样本积累，前期按模版单价（演示值）', 'info');
      let gen = '';
      if (ui.gtmGen) {
        const step = ui.gtmStep || 0;
        gen = `<div class="card gen-card" id="genCard"><div class="row"><div class="kb-av" style="width:30px;height:30px;border-radius:10px;background:var(--ai);color:#fff;display:flex;align-items:center;justify-content:center">${App.icon('sparkle', 16)}</div><div class="grow"><div class="bold">日日新大模型 · 正在生成</div><div class="small muted">模版 ${ui.gtmPicked.length} 套 · 变量来自本次留痕</div></div></div><div class="mt8">${App.ui.progress(Math.round(step / STAGES.length * 100), true)}</div><div class="mt8">${STAGES.map((s, i) => `<div class="gs ${i < step ? 'done' : i === step ? 'run' : ''}"><div class="ic">${i < step ? App.icon('check', 13) : i === step ? App.icon('refresh', 13, 'spin') : `<span style="font-size:11px">${i + 1}</span>`}</div><span>${esc(s)}</span></div>`).join('')}</div></div>`;
      }
      return `${head}${storeCard(store)}${need}${seg}${groups}${note}${gen}`;
    },
    footer(p) {
      const ui = App.state.ui; const n = ui.gtmPicked.length;
      return ui.gtmGen ? App.ui.btn('生成中…', { tone: 'primary', block: true, disabled: true, icon: 'sparkle' }) : App.ui.btn(`生成方案与报价 · 已选 ${n} 套模版`, { tone: 'primary', block: true, icon: 'sparkle', onclick: `S_GTM.generate('${esc(p.storeId || 's_bing')}')` });
    },
  });

  /* ---------- 页面：方案与报价 ---------- */
  S.expand = function () { App.state.ui.gtmExpand = !App.state.ui.gtmExpand; App.save(); App.refresh(); };
  S.qty = function (pid, i, val) {
    const p = App.proposal(pid); if (!p) return;
    const n = Math.max(0, Math.min(999, parseInt(val, 10) || 0)); p.items[i].qty = n; p.status = p.status === '审批通过' ? 'draft' : p.status; App.save(); paint(p);
  };
  S.disc = function (pid, val) {
    const p = App.proposal(pid); if (!p) return;
    const n = Math.max(0, Math.min(60, parseFloat(val) || 0)); p.discount = n;
    if (p.status === '审批通过' && n !== 12) p.status = 'draft';
    if (p.status === '审批中' ) { /* 审批中改折扣 → 需重新提交 */ p.status = 'draft'; App.toast('折扣已变更，需重新提交审批', { icon: 'alert' }); }
    App.save(); paint(p);
  };
  // 局部重绘：保留输入焦点
  function paint(p) {
    const root = App.currentEntry() && App.currentEntry().el; if (!root) return;
    const c = calc(p);
    p.items.forEach((it, i) => { const el = root.querySelector(`#sub_${i}`); if (el) el.textContent = money(it.qty * it.price); });
    const set = (id, v) => { const el = root.querySelector('#' + id); if (el) el.innerHTML = v; };
    set('qRaw', money(c.raw)); set('qDisc', '−' + money(c.disc)); set('qTotal', money(c.total));
    const di = root.querySelector('#discIn'); if (di) di.classList.toggle('over', c.over);
    set('discNotice', discNotice(p)); set('statusChip', statusChip(p));
    const f = root.querySelector('.footer-bar'); if (f) f.innerHTML = footerHtml(p);
  }
  function discNotice(p) {
    const c = calc(p); const th = G().discountThreshold;
    if (p.status === '审批中') return App.ui.notice('info', `折扣 ${p.discount}% 超阈值 ${th}% → 已提交价格审批 · 审批人 李华 · 审批中；审批通过前不能分享正式报价`, 'clock');
    if (p.status === '审批通过') return App.ui.notice('ok', `折扣 ${p.discount}% 超阈值 ${th}% · 主管 李华 已审批通过（${esc(p.decidedAt)}）→ 可分享正式报价`, 'check-circle');
    if (c.over) return App.ui.notice('warn', `折扣 ${p.discount}% 超阈值 ${th}% → 需提交价格审批（销售端不能自批）· 阈值为演示值，由贵司提供`, 'alert');
    return App.ui.notice('ok', `折扣 ${p.discount}% 在规则内（阈值 ${th}%，演示值）→ 可直接分享预览`, 'check-circle');
  }
  function statusChip(p) {
    const c = calc(p);
    if (p.status === '审批中') return App.ui.chip('审批中', 'warn', { sm: true, dot: true });
    if (p.status === '审批通过') return App.ui.chip('审批通过', 'ok', { sm: true, dot: true });
    if (p.status === '已发送') return App.ui.chip('已发送', 'brand', { sm: true, dot: true });
    return c.over ? App.ui.chip('需审批', 'warn', { sm: true, dot: true }) : App.ui.chip('规则内', 'ok', { sm: true, dot: true });
  }
  function footerHtml(p) {
    const c = calc(p); const sid = p.storeId;
    const share = App.ui.btn('分享预览', { tone: c.over && p.status !== '审批通过' ? 'outline' : 'primary', icon: 'send', onclick: `App.go('gtm-share',{storeId:'${sid}'})` });
    if (p.status === '审批中') return `<div class="btn-row">${share}${App.ui.btn('审批中 · 等待 李华', { tone: 'ghost', disabled: true, icon: 'clock' })}</div>`;
    if (c.over && p.status !== '审批通过') return `<div class="btn-row">${share}${App.ui.btn('提交价格审批', { tone: 'primary', icon: 'upload', onclick: `S_GTM.submit('${p.id}')` })}</div>`;
    return `<div class="btn-row">${App.ui.btn('存为草稿', { tone: 'ghost', icon: 'doc', onclick: "App.toast('已存草稿 · 可在 PC 销售工作台精修',{icon:'check'})" })}${share}</div>`;
  }
  S.submit = function (pid) {
    const p = App.proposal(pid); if (!p) return; const store = App.store(p.storeId); const c = calc(p);
    App.prompt('提交价格审批 · 申请理由', `例：客户预算 ${summary(store).budget || '有限'}，竞品报价更低，申请折扣 ${p.discount}%`, (reason) => {
      p.status = '审批中'; p.approver = '李华'; p.submittedAt = App.TODAY + ' 11:32'; p.reason = reason || '（未填写理由）';
      p.events = p.events || []; p.events.push({ t: p.submittedAt, e: `提交价格审批（折扣 ${p.discount}%）` });
      App.state.team.approvals = App.state.team.approvals || [];
      const apId = 'ap_' + p.id;
      if (!App.state.team.approvals.find((a) => a.id === apId)) App.state.team.approvals.unshift({ id: apId, proposalId: p.id, storeId: p.storeId, title: `${store.name} · 报价 ${p.version}`, by: App.me().name, discount: p.discount, amount: `${money(c.total)}（演示）`, reason: p.reason, status: '审批中', submittedAt: App.TODAY });
      if (App.state.team.kpi) App.state.team.kpi.pendingApprovals = App.state.team.approvals.filter((a) => a.status === '审批中').length;
      App.save(); App.refresh();
      App.toast('已提交价格审批 · 审批人 李华 · 结论回推手机', { icon: 'send' });
    }, '提交');
  };
  App.register('gtm-result', {
    title: 'GTM 助手', tab: 'customers',
    prd: ['deck p20 · 生成结果 · 六段方案 + 报价单'], rules: ['改数量 / 折扣即时重算', '折扣 > 10% 需提交价格审批，销售端不能自批', '成本与毛利为占位字段，仅审批人可见', '演示单价，条款与价格口径由贵司提供'],
    demoActions: [
      { label: '折扣设为 12%（超阈值）', icon: 'percent', run() { const p = App.proposal(propId(App.currentEntry().params.storeId || 's_bing')); if (p) { p.discount = 12; p.status = p.status === '审批通过' ? '审批通过' : 'draft'; App.save(); App.refresh(); } } },
      { label: '折扣恢复 0%', icon: 'refresh', run() { const p = App.proposal(propId(App.currentEntry().params.storeId || 's_bing')); if (p) { p.discount = 0; p.status = 'draft'; App.save(); App.refresh(); } } },
    ],
    render(pa) {
      const store = App.store(pa.storeId || 's_bing');
      if (!store) return App.ui.empty({ icon: 'store', title: '未指定客户' });
      const p = ensureProposal(store); const c = calc(p); const sm = summary(store);
      const secs = planSections(store, latestVisit(store));
      const exp = !!App.state.ui.gtmExpand;
      const shown = exp ? secs : secs.slice(0, 2);
      const head = `<div class="pg-head"><div class="pg-t">方案与报价</div><div class="pg-s">六段方案由模版 + 变量填充 · 报价条目改数量 / 折扣即时重算</div></div>`;
      const tpl = planTpl(p); const qtpl = quoteTpl(p);
      const plan = `<div class="card"><div class="row top between"><div class="card-title grow" style="margin:0;line-height:1.35">${esc(planTitle(store, p))}</div>${App.ui.chip(`${tpl.version} · ${secs.length} 段`, 'gray', { sm: true })}</div>${shown.map((s, i) => `<div class="plan-sec"><div class="pt">${i + 1}. ${esc(s.t)}</div><div class="pp">${esc(s.p)}</div></div>`).join('')}<button class="plan-more" onclick="S_GTM.expand()">${exp ? '收起 ▴' : `展开全部 ${secs.length} 段（${secs.slice(2).map((s) => s.t).join(' / ')}）▾`}</button><div class="plan-foot">演示模版，条款与价格口径由贵司提供 · 变量来源：${App.fmt.md(sm.date)} 留痕、识虫结果、客户类别</div></div>`;
      const rows = p.items.map((it, i) => `<tr><td><div class="qn">${esc(it.name)}</div><div class="unit">${esc(it.unit)}</div></td><td><input class="qty" type="number" min="0" value="${it.qty}" oninput="S_GTM.qty('${p.id}',${i},this.value)"></td><td class="r">${money(it.price)}</td><td class="r" id="sub_${i}">${money(it.qty * it.price)}</td></tr>`).join('');
      const quote = `<div class="card"><div class="row between"><div class="card-title" style="margin:0">报价单 · ${esc(qtpl ? qtpl.name.replace(/^.*?· /, '') : '标准报价单')}</div><div class="row gap4">${App.ui.chip('演示单价', 'gray', { sm: true })}<span id="statusChip">${statusChip(p)}</span></div></div><div class="quote-wrap mt8"><table class="quote-table"><thead><tr><th>条目</th><th>数量</th><th class="r">单价</th><th class="r">小计</th></tr></thead><tbody>${rows}</tbody></table></div><div class="q-sum"><div class="qr"><div class="k">小计</div><div class="v" id="qRaw">${money(c.raw)}</div></div><div class="qr"><div class="k">折扣 <input class="disc ${c.over ? 'over' : ''}" id="discIn" type="number" min="0" max="60" value="${p.discount}" oninput="S_GTM.disc('${p.id}',this.value)"> %<span class="tiny muted">阈值 ${G().discountThreshold}%</span></div><div class="v" id="qDisc">−${money(c.disc)}</div></div><div class="qr total"><div class="k">合计</div><div class="v" id="qTotal">${money(c.total)}</div></div><div class="qr"><div class="k">有效期</div><div class="v">${p.validDays} 天 · 至 ${App.fmt.md('2026-10-07')}</div></div><div class="qr locked"><div class="k">${App.icon('lock', 14)}成本与毛利</div><div class="v">占位字段 · 仅审批人可见</div></div></div><div class="mt12" id="discNotice">${discNotice(p)}</div></div>`;
      const ins = hasIns(p) ? `<div class="card att"><div class="ai">${App.icon('shield', 20)}</div><div class="grow"><div class="bold">附件 · 服务责任保险单</div><div class="small muted">v1 · 贵司预置 · 保险主体与保额由贵司提供</div></div>${App.ui.chip('已附', 'brand', { sm: true })}</div>` : '';
      const refs = `<div class="card"><div class="card-title">依据与引用</div><div class="ref" ${sm.visitId ? `onclick="App.go('visit-detail',{id:'${sm.visitId}'})"` : ''}><div class="ri">${App.icon('mic', 15)}</div><div class="grow">拜访记录 · ${App.fmt.md(sm.date)}${sm.score ? ` · 质量分 ${sm.score}` : ''}<div class="rs">${esc(sm.need || '现场诉求待补充')} · ${esc(sm.budget || '预算待补充')}</div></div>${sm.visitId ? App.icon('chevron-right', 16) : ''}</div><div class="ref" onclick="App.go('pest',{storeId:'${store.id}'})"><div class="ri">${App.icon('bug', 15)}</div><div class="grow">识虫结果 · 德国小蠊 86%<div class="rs">预置样本 · 需贵司样本共同验证 · 候选非勘查结论</div></div>${App.icon('chevron-right', 16)}</div><div class="ref" onclick="App.go('kb-article',{id:'k5'})"><div class="ri">${App.icon('doc', 15)}</div><div class="grow">知识库 · k5 德国小蠊处置 / k4 药剂安全<div class="rs">出处：技术部图鉴 v2 · 药剂安全说明 2026</div></div>${App.icon('chevron-right', 16)}</div></div>`;
      const evts = (p.events || []).length ? `<div class="card"><div class="card-title">审批与发送记录</div>${App.ui.timeline(p.events.map((e) => ({ time: e.t, title: esc(e.e) })))}</div>` : '';
      return `${head}${storeCard(store)}${plan}${quote}${ins}${refs}${evts}`;
    },
    footer(pa) { const store = App.store(pa.storeId || 's_bing'); if (!store) return ''; return footerHtml(ensureProposal(store)); },
  });

  /* ---------- 页面：分享与审批 ---------- */
  S.share = function (ch) { App.toast(({ wx: '已生成简版卡片并通过微信分享（演示）', mail: '已发送 PDF 到客户邮箱（演示）', pdf: '已导出 PDF · 可在 PC 精修后再发正式版' })[ch], { icon: 'send' }); };
  S.sent = function (pid) {
    const p = App.proposal(pid); if (!p) return; const c = calc(p);
    if (c.over && p.status !== '审批通过') { App.toast('折扣超阈值，需审批通过后才能标记发送', { icon: 'alert' }); return; }
    p.status = '已发送'; p.sentAt = App.TODAY + ' 11:40'; p.events = p.events || []; p.events.push({ t: p.sentAt, e: `分享预览已发送 · ${App.store(p.storeId).contact.name} · 微信` });
    const opp = App.primaryOpp(p.storeId); if (opp && ['线索', '意向', '方案'].includes(opp.stage)) { opp.stage = '报价'; opp.proposalId = p.id; opp.updatedAt = App.TODAY; }
    App.save();
    App.toast('已标记发送 · 已写入客户 360 方案与报价', { icon: 'check' });
    setTimeout(() => { if (App.screens.customer) { App.tab('customers'); App.go('customer', { id: p.storeId }); } else App.back(); }, 500);
  };
  App.register('gtm-share', {
    title: 'GTM 助手', tab: 'customers',
    prd: ['deck p20 · 分享预览 · 超阈值需提交审批'], rules: ['小程序生成简版并分享 · PC 精修与导出', '超阈值先审批再发正式报价', '审批结论回推手机'],
    render(pa) {
      const store = App.store(pa.storeId || 's_bing'); if (!store) return App.ui.empty({ icon: 'store', title: '未指定客户' });
      const p = ensureProposal(store); const c = calc(p);
      const head = `<div class="pg-head"><div class="pg-t">分享与审批</div><div class="pg-s">小程序生成简版并分享 · PC 精修与导出 · 超阈值先审批再发正式报价</div></div>`;
      const cover = `<div class="cover"><div class="cv-eyebrow">分享卡片预览 · 简版方案</div><div class="cv-title">${esc(planTitle(store, p))}</div><div class="cv-body">${App.ui.scene('doc', '')}<div class="grow"><div class="cv-kv">版本 <b>${esc(p.version)}</b> · 六段方案 + 报价单${hasIns(p) ? ' + 保险单' : ''}<br>发送对象 <b>${esc(store.contact.role)} ${esc(store.contact.name)}</b><br>生成 ${esc(p.generatedAt || p.createdAt)}</div><div class="cv-total">${money(c.total)}<small>含折扣 ${p.discount}% · 演示值 · 有效 ${p.validDays} 天</small></div></div></div><div class="cv-foot">附件：${hasIns(p) ? '服务责任保险单 v1 · ' : ''}商汤 AI 销售管理平台生成 · 演示数据，不代表真实客户</div></div>`;
      const tiles = `${App.ui.section('分享渠道', '简版 · 正式版在 PC 导出')}<div class="share-tiles"><div class="share-tile" onclick="S_GTM.share('wx')"><div class="si wx">${App.icon('message', 22)}</div><div class="st">微信</div><div class="ss">卡片 + 小程序页</div></div><div class="share-tile" onclick="S_GTM.share('mail')"><div class="si mail">${App.icon('send', 22)}</div><div class="st">邮件</div><div class="ss">PDF 附件</div></div><div class="share-tile" onclick="S_GTM.share('pdf')"><div class="si pdf">${App.icon('file', 22)}</div><div class="st">PDF</div><div class="ss">导出简版</div></div></div>`;
      let ap;
      if (!c.over) ap = `${App.ui.notice('ok', `折扣 ${p.discount}% 在规则内（阈值 ${G().discountThreshold}%，演示值）→ 可直接分享`, 'check-circle')}<div class="ap-row"><div class="k">审批规则</div><div>折扣 > ${G().discountThreshold}% 需主管审批 · 规则由贵司提供</div></div><div class="ap-row"><div class="k">状态</div><div>${statusChip(p)}</div></div>`;
      else if (p.status === '审批中') ap = `${App.ui.notice('info', `折扣 ${p.discount}% 超阈值 → 已提交价格审批，结论回推手机`, 'clock')}<div class="ap-row"><div class="k">审批人</div><div class="row">${App.ui.avatar('李华', 'sm')} 李华 · 销售主管</div></div><div class="ap-row"><div class="k">状态</div><div>${statusChip(p)} <span class="small muted">提交于 ${esc(p.submittedAt || '')}</span></div></div><div class="ap-row"><div class="k">申请理由</div><div>${esc(p.reason || '—')}</div></div><div class="ap-row"><div class="k">结论回推</div><div>通过 → 自动生成「发送正式报价」待办；驳回 → 附意见退回修改</div></div>`;
      else if (p.status === '审批通过' || p.status === '已发送') ap = `${App.ui.notice('ok', `折扣 ${p.discount}% 超阈值 · 主管 李华 已审批通过 → 可发送正式报价`, 'check-circle')}<div class="ap-row"><div class="k">审批人</div><div class="row">${App.ui.avatar('李华', 'sm')} 李华 · 销售主管</div></div><div class="ap-row"><div class="k">结论</div><div>通过 · ${esc(p.decidedAt || '')}</div></div><div class="ap-row"><div class="k">状态</div><div>${statusChip(p)}</div></div>`;
      else ap = `${App.ui.notice('warn', `折扣 ${p.discount}% 超阈值 ${G().discountThreshold}% → 需提交价格审批（销售端不能自批）`, 'alert')}<div class="ap-row"><div class="k">审批人</div><div class="row">${App.ui.avatar('李华', 'sm')} 李华 · 销售主管</div></div><div class="ap-row"><div class="k">状态</div><div>${statusChip(p)} <span class="small muted">尚未提交</span></div></div><div class="mt8">${App.ui.btn('返回提交价格审批', { tone: 'secondary', size: 'sm', block: true, icon: 'upload', onclick: 'App.back()' })}</div>`;
      const apCard = `${App.ui.section('审批状态', '')}<div class="card">${ap}</div>`;
      const pc = App.ui.notice('gray', '精修、成本与毛利、正式导出在 PC 销售工作台完成；小程序只发简版', 'info');
      return `${head}${storeCard(store, true)}${cover}${tiles}${apCard}${pc}`;
    },
    footer(pa) {
      const store = App.store(pa.storeId || 's_bing'); if (!store) return ''; const p = ensureProposal(store); const c = calc(p);
      const blocked = c.over && p.status !== '审批通过' && p.status !== '已发送';
      return `<div class="btn-row">${App.ui.btn('返回方案', { tone: 'ghost', onclick: 'App.back()' })}${App.ui.btn(p.status === '已发送' ? '已发送' : blocked ? '审批通过后可发送' : '标记已发送', { tone: 'primary', icon: 'check', disabled: blocked || p.status === '已发送', onclick: `S_GTM.sent('${p.id}')` })}</div>`;
    },
  });
})();
