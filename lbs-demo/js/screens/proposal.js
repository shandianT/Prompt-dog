/* ============================================================
   方案工作台 / 方案详情 — proposal.js
   页面：proposal-new（向导：选模板 → 输入确认 → 照片位置 → 生成 → 预览确认）、proposal（方案详情/版本/事件/反馈）
   依据：PRD 7 页面表（方案工作台）、7.1 典型交互、F06 餐饮单店方案与模板库、R04 / R11
   ============================================================ */
(function () {
  'use strict';
  const P = window.S_PROP = {};
  const esc = (s) => App.esc(s);

  const STEPS = ['选模板', '输入确认', '照片位置', '生成', '预览确认'];
  const GEN_STAGES = ['组装客户信息与现场观察', '填充已确认需求', '服务范围与安排', '客户配合事项', '待确认项', '排版 PDF 草稿'];
  const POS = ['封面', '现场观察', '附录', '不使用'];
  const STATUS = {
    draft: ['草稿', 'gray'], confirmed: ['已确认', 'brand'], exported: ['已导出', 'info'], marked_sent: ['已标记发送', 'ok'],
    superseded: ['已被新版本替代', 'gray'], internal: ['内部草稿 · 待技术复核', 'warn'],
  };
  const EQUIP_PENDING = '待勘查确认（不从照片推定）';
  const FREQ_DEFAULT = '按模板默认 · 可修改';
  // 模板默认内容（来自已审核模板；不含价格、不从照片推定设备数量）
  const TPL = {
    tpl_rest_pest: {
      docTitle: '有害生物防治服务方案', scope: '鼠类 + 蟑螂防治 · 月度 1 次 · 首次强化', equipment: '饵站 / 胶饵点位数量',
      rows: [
        ['鼠类防治', '每月 1 次', '饵站 / 粘鼠板布设，孔洞封堵建议'],
        ['蟑螂防治', '每月 1 次', '胶饵 + 缝隙处理，避开食品加工面'],
        ['首次强化', '首月加做 1 次', '集中处理现场观察到的风险点位'],
        ['服务记录', '每次服务后', '照片 + 记录单，风险点位复核'],
      ],
      coop: ['封堵后厨、仓库的孔洞与门缝（服务人员现场标示）', '作业前清理地面食源、积水与杂物', '作业安排在打烊后或营业前，单店约 40–60 分钟', '指定对接人配合进出、签字与问题反馈'],
    },
    tpl_rest_toilet: {
      docTitle: '卫生间深度清洁服务方案', scope: '卫生间深度清洁 · 月度 1 次', equipment: '卫生间数量与洁具数',
      rows: [['深度清洁', '每月 1 次', '洁具、地面、墙面及通风口除垢消毒'], ['异味处理', '每月 1 次', '地漏与排水口处理'], ['服务记录', '每次服务后', '照片 + 记录单']],
      coop: ['作业时段避开高峰，约 60 分钟', '提供水电接入与门禁配合'],
    },
  };

  let W = null; // 向导状态（模块内，可在向导中途返回后恢复）

  /* ---------- 工具 ---------- */
  const pad = (n) => (n < 10 ? '0' : '') + n;
  const lines = (v) => String(v || '').split('\n').map((s) => s.trim()).filter(Boolean);
  function addMin(t, m) { const d = new Date(t.replace(' ', 'T') + ':00'); d.setMinutes(d.getMinutes() + m); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }
  function nextTime(p) {
    const last = p && p.events && p.events.length ? p.events[p.events.length - 1].t : '';
    const base = last && last.slice(0, 10) >= App.TODAY ? last : `${App.TODAY} 15:19`;
    return addMin(base, 1);
  }
  const fmtT = (t) => (t ? `${App.fmt.md(t).replace('月', '/').replace('日', '')}${App.fmt.hm(t) ? ' ' + App.fmt.hm(t) : ''}` : '');
  const tplOf = (id) => App.by(App.state.templates, 'id', id) || {};
  const tplData = (id) => TPL[id] || TPL.tpl_rest_pest;
  const segmentOf = (store) => (/^餐饮/.test((store && store.type) || '') ? '餐饮单店' : '食品工厂');
  const statusChip = (st, sm) => { const s = STATUS[st] || [st, 'gray']; return App.ui.chip(s[0], s[1], { sm, icon: st === 'confirmed' || st === 'marked_sent' ? 'check' : '' }); };
  const propStatus = (p) => (p.internal && p.status === 'draft' ? 'internal' : p.status);
  const ownerOf = (opp) => Object.values(App.state.users).find((u) => u.id === (opp && opp.ownerId)) || App.me();
  const proposalIdFor = (oppId) => (oppId === 'o_bing' ? 'p_bing' : `p_${String(oppId).replace(/^o_/, '')}_new`);
  const isHere = (id) => { const e = App.currentEntry(); return !!e && e.id === id; };

  function versionsOf(p) {
    if (p.versions) return p.versions;
    const gens = (p.events || []).filter((e) => /生成/.test(e.e));
    if (!gens.length) gens.push({ t: p.createdAt });
    return gens.map((e, i) => { const v = i + 1; const last = v === gens.length; return { v, createdAt: e.t, snapshotAt: p.createdAt, templateVersion: p.templateVersion, status: last ? p.status : 'superseded', confirmedBy: last ? p.confirmedBy : '' }; });
  }
  const ensureVersions = (p) => { if (!p.versions) p.versions = versionsOf(p); return p.versions; };
  const curVer = (p) => versionsOf(p).find((v) => v.v === p.version) || null;
  function eventKind(e) {
    if (e.kind) return e.kind; const s = e.e || '';
    if (/生成/.test(s)) return 'gen'; if (/导出/.test(s)) return 'export'; if (/发送/.test(s)) return 'sent'; if (/复核/.test(s)) return 'review'; if (/反馈/.test(s)) return 'feedback'; if (/确认/.test(s)) return 'confirm'; return 'other';
  }
  const EVENT_TONE = { gen: 'ai', export: 'gray', sent: 'warn', review: 'warn', feedback: '', confirm: '', other: 'gray' };
  const EVENT_TAG = { gen: '生成', export: '导出', sent: '人工标记发送', review: '技术复核', feedback: '客户反馈', confirm: '人工确认', other: '' };

  /* ---------- 输入来源：商机最近一次已确认拜访 ---------- */
  function sourceVisit(opp) {
    if (!opp) return null;
    if (opp.id === 'o_bing') {
      const v = App.visit('v_bing_new');
      if (v) return v;
      return Object.assign(window.DATA.demoVisit(), { confirmedAt: `${App.TODAY} 15:03` });
    }
    if (opp.id === 'o_jinpai') return App.visit('v_jinpai') || null;
    const vs = App.state.visits.filter((v) => v.oppId === opp.id && v.status === 'synced').sort((a, b) => (a.time < b.time ? 1 : -1));
    return vs[0] || App.visitsOf(opp.storeId)[0] || null;
  }
  const obsTag = (t) => (/疑似/.test(t) ? '销售描述 · 非确认虫害' : '');
  function normObs(o) {
    if (typeof o === 'string') return { text: o, tag: obsTag(o), photo: '' };
    return { text: o.text || '', tag: o.tag || obsTag(o.text || ''), photo: o.photo || '' };
  }
  function buildInputs(opp, store, v, tpl) {
    const td = tplData(tpl && tpl.id);
    const c = v && v.contact;
    const sc = (store && store.contacts && store.contacts[0]) || null;
    const contact = c && c.name ? `${c.name} · ${c.role}${c.decision ? `（${c.decision}）` : ''}` : (sc ? `${sc.name} · ${sc.role}${sc.decision ? `（${sc.decision}）` : ''}` : '待补充');
    const dm = v && v.decisionMaker ? `${v.decisionMaker.role} · ${v.decisionMaker.name || v.decisionMaker.status}` : '';
    const snapshotAt = v ? (v.confirmedAt || v.time) : `${App.TODAY} 15:03`;
    return {
      needs: v && v.needs ? v.needs.slice() : [],
      observations: ((v && v.observations) || []).map(normObs),
      contact, decisionMaker: dm, decisionPending: !!(v && v.decisionMaker && !v.decisionMaker.name),
      scope: td.scope, scopeSource: '模板默认', freq: FREQ_DEFAULT, freqSource: '模板默认',
      equipment: EQUIP_PENDING, equipmentPending: true, price: '报价待审批',
      snapshotAt, sourceLabel: v ? `拜访 ${fmtT(snapshotAt)} 已确认` : '无已确认拜访记录', visitId: v ? v.id : null,
    };
  }
  function buildPhotos(v) {
    let hasCover = false;
    return ((v && v.media) || []).map((m) => {
      const label = m.label || '';
      let pos;
      if (!hasCover && (m.kind === 'storefront' || /门头/.test(label))) { hasCover = true; pos = '封面'; }
      else if (/风险点位|后厨|仓库|墙角|门缝|鼠/.test(label) || ['kitchen', 'corner', 'pest', 'pest2'].includes(m.kind)) pos = '现场观察';
      else pos = '附录';
      return { kind: m.kind || 'storefront', label, pos };
    });
  }
  function initW(oppId) {
    const opp = App.opp(oppId); const store = opp ? App.store(opp.storeId) : null; const v = sourceVisit(opp);
    const seg = segmentOf(store);
    const tpls = App.state.templates.filter((t) => t.segment === seg && t.status === '已发布');
    const def = (opp && tpls.find((t) => t.service === opp.service)) || tpls[0] || null;
    W = {
      oppId, step: 0, templateId: def ? def.id : null, pro: false, entryKey: null,
      inputs: buildInputs(opp, store, v, def), photos: buildPhotos(v),
      gen: freshGen(), failNext: false, timer: null, proposalId: App.proposal(proposalIdFor(oppId)) ? proposalIdFor(oppId) : null,
    };
    return W;
  }
  const freshGen = () => ({ running: false, error: false, done: false, progress: 0, stage: -1 });

  /* ---------- 方案对象 → 预览模型 ---------- */
  function modelFromProposal(p) {
    const store = App.store(p.storeId) || {}; const opp = App.opp(p.oppId) || {}; const tpl = tplOf(p.templateId); const td = tplData(p.templateId);
    const snap = p.inputSnapshot || {};
    let photos = p.photos;
    if (!photos) {
      const v = App.state.visits.find((x) => x.oppId === p.oppId && x.media && x.media.length);
      photos = (snap.photos || []).map((l) => { const m = v && v.media.find((mm) => (mm.label || '').indexOf(l) >= 0); return { kind: m ? m.kind : 'kitchen', label: l, pos: '现场观察' }; });
    }
    const cv = curVer(p) || {};
    return {
      p, store, opp, tpl, td, sales: ownerOf(opp), segment: tpl.segment || segmentOf(store),
      version: p.version, templateVersion: p.templateVersion, snapshotAt: snap.snapshotAt || p.createdAt, createdAt: cv.createdAt || p.createdAt,
      needs: snap.needs || [], observations: (snap.observations || []).map(normObs), contact: snap.contact || '',
      decisionMaker: snap.decisionMaker || '', decisionPending: !!snap.decisionPending,
      scope: snap.scope || td.scope, scopeSource: snap.scopeSource || '模板默认', freq: snap.freq || FREQ_DEFAULT, freqSource: snap.freqSource || '模板默认',
      equipment: snap.equipment || EQUIP_PENDING, equipmentPending: snap.equipmentPending !== false, price: '报价待审批',
      photos, status: p.status, internal: !!p.internal, confirmedBy: p.confirmedBy || '', confirmedAt: p.confirmedAt || cv.confirmedAt || '',
      extraRows: p.id === 'p_jinpai' ? [['作业时间', '每次服务', '打烊后夜间作业，不影响营业（v2 补充）']] : [],
    };
  }

  /* ---------- 文档预览（向导第 5 步与方案详情共用） ---------- */
  function paperHtml(m) {
    const s = m.store; const td = m.td;
    const cover = m.photos.find((x) => x.pos === '封面');
    const obs = m.photos.filter((x) => x.pos === '现场观察');
    const appx = m.photos.filter((x) => x.pos === '附录');
    const stamp = m.internal
      ? '<div class="pp-stamp ai">内部草稿 · 待技术复核</div>'
      : (m.status === 'draft' ? '<div class="pp-stamp">草稿 · 未确认</div>' : `<div class="pp-stamp ok">已确认 · ${esc(m.confirmedBy || '')}</div>`);
    const sec = (n, title) => `<div class="pp-sec-title"><span class="n">${n}</span>${esc(title)}</div>`;
    const rows = td.rows.map((r) => [r[0], m.freqSource === '销售确认' && r[1] === '每月 1 次' ? m.freq : r[1], r[2]]).concat(m.extraRows || []);
    const pending = [];
    if (m.equipmentPending) pending.push([`设备数量（${td.equipment}）`, '待勘查确认 · 不从照片推定', 'search']);
    pending.push(['价格', '报价待审批 · 方案不含自动定价', 'lock']);
    if (m.decisionPending) pending.push(['决策人', `${m.decisionMaker} · 姓名与联系方式待核实（不填造）`, 'user']);
    return `<div class="pp-paper">
      <div class="pp-band">
        <div class="row between"><div class="pp-logo">LBS 史维莎 · 服务方案</div><div class="pp-band-chip">${esc(m.segment)} · 模板 ${esc(m.templateVersion)}</div></div>
        <div class="pp-doc-title">${esc(s.name || '')}</div>
        <div class="pp-doc-sub">${esc(td.docTitle)}</div>
        <div class="pp-meta"><span>${App.icon('layers', 11)}版本 v${m.version} · 模板 ${esc(m.templateVersion)}</span><span>${App.icon('clock', 11)}输入快照 ${esc(fmtT(m.snapshotAt))}</span><span>${App.icon('sparkle', 11)}生成 ${esc(fmtT(m.createdAt))}</span></div>
        ${stamp}
      </div>
      <div class="pp-body">
        <div class="pp-sec">${sec(1, '客户信息与现场观察')}
          ${cover ? `<div class="pp-cover">${App.ui.scene(cover.kind, cover.label)}</div>` : ''}
          <dl class="pp-kv"><dt>门店</dt><dd>${esc(s.name || '')}</dd><dt>地址</dt><dd>${esc(s.address || '')}</dd><dt>业态</dt><dd>${esc(s.type || '')}</dd><dt>联系人</dt><dd>${esc(m.contact || '待补充')}</dd></dl>
          <div class="pp-sub">现场观察 <span class="pp-src">销售现场描述 · ${esc(fmtT(m.snapshotAt))}</span></div>
          ${m.observations.length ? `<ul class="pp-list">${m.observations.map((o) => `<li>${esc(o.text)}${o.tag ? `<span class="pp-tag">${esc(o.tag)}</span>` : ''}${o.photo ? `<span class="pp-ref">见照片：${esc(o.photo)}</span>` : ''}</li>`).join('')}</ul>` : '<div class="pp-none">本次拜访无现场观察记录</div>'}
          ${obs.length ? `<div class="pp-photos">${obs.map((x) => App.ui.scene(x.kind, x.label)).join('')}</div>` : ''}
        </div>
        <div class="pp-sec">${sec(2, '已确认需求')}
          ${m.needs.length ? `<ul class="pp-list">${m.needs.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '<div class="pp-none">暂无已确认需求 · 不据照片推测</div>'}
          <div class="pp-src mt4">来源：已确认拜访记录 ${esc(fmtT(m.snapshotAt))}，仅包含客户明确表达的内容</div>
        </div>
        <div class="pp-sec">${sec(3, '服务范围与安排')}
          <div class="pp-scope">${esc(m.freqSource === '销售确认' && m.scopeSource === '模板默认' ? m.scope.replace(/月度 1 次|每月 1 次/, m.freq) : m.scope)}<span class="pp-tag gray">${esc(m.freqSource === '销售确认' && m.scopeSource === '模板默认' ? '模板默认 · 频次销售确认' : m.scopeSource)}</span></div>
          <table class="pp-table"><thead><tr><th style="width:26%">项目</th><th style="width:27%">频次</th><th>说明</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table>
          <div class="pp-src mt4">频次：${m.freqSource === '销售确认' ? `销售确认（${esc(m.freq)}）` : `模板默认（${esc(m.templateVersion)}），可在确认参数后修改`}；设备数量与点位数以勘查结果为准，不从照片推定。</div>
        </div>
        <div class="pp-sec">${sec(4, '客户配合事项')}
          <ul class="pp-list">${td.coop.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        </div>
        <div class="pp-sec">${sec(5, '待确认项')}
          ${pending.map((x) => `<div class="pp-pending">${App.icon(x[2], 14)}<div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div></div>`).join('')}
        </div>
        <div class="pp-sec">${sec(6, '联系方式')}
          <div class="pp-contact">${App.ui.avatar(m.sales.name, 'sm')}<div class="grow"><div class="bold" style="font-size:13px">${esc(m.sales.name)} · ${esc(m.sales.roleName)}</div><div class="tiny muted">${esc(m.sales.org)} · ${esc(m.sales.phone)}</div></div>${App.icon('phone', 16, 'muted')}</div>
        </div>
        ${appx.length ? `<div class="pp-sec">${sec(7, '附录 · 现场照片')}<div class="pp-photos">${appx.map((x) => App.ui.scene(x.kind, x.label)).join('')}</div></div>` : ''}
        <div class="pp-footer"><span>由已审核模板组装 · ${esc(m.tpl.name || '')} ${esc(m.templateVersion)} · 审核：${esc(m.tpl.reviewedBy || '')}</span><span>价格以审批报价为准</span></div>
      </div>
      <div class="pp-page-no">第 1 页 / 共 1 页 · 手机预览 · 固定版式 PDF 草稿</div>
    </div>`;
  }
  function versionStrip(p) {
    const cv = curVer(p) || {};
    const st = propStatus(p);
    return `<div class="row between pp-strip"><div class="chips">${App.ui.chip(`v${p.version} · 模板 ${p.templateVersion} · 输入快照 ${fmtT((p.inputSnapshot && p.inputSnapshot.snapshotAt) || cv.snapshotAt || p.createdAt)}`, 'outline', { sm: true, icon: 'layers' })}</div>${p.confirmedBy && p.status !== 'draft' ? App.ui.chip(`确认人 ${p.confirmedBy}`, 'brand', { sm: true, icon: 'user' }) : App.ui.chip('未人工确认', 'outline', { sm: true })}</div>`;
  }

  /* ---------- 向导：片段 ---------- */
  function headHtml(opp, store, tpl, stepIdx, error) {
    const seg = segmentOf(store);
    return `<div class="card tight pp-head">
      <div class="row"><div class="cell-icon">${App.icon('doc', 20)}</div><div class="grow"><div class="row"><span class="bold ellipsis" style="font-size:15px">${esc(store.name)}</span>${App.ui.chip(seg, 'brand', { sm: true })}</div><div class="tiny muted mt4 ellipsis">${esc(store.address)} · ${esc(opp.service)} · ${esc(opp.kind)}${tpl && tpl.id ? ` · 模板 ${esc(tpl.version)}` : ''}</div></div></div>
      <div class="divider" style="margin:10px 0 2px"></div>
      ${App.ui.stepper(STEPS, stepIdx, { error })}
    </div>`;
  }
  function tplCard(t) {
    const off = t.status !== '已发布'; const sel = W.templateId === t.id;
    return `<div class="pp-tpl ${sel ? 'sel' : ''} ${off ? 'off' : 'pressable'}" onclick="S_PROP.pickTpl('${t.id}')">
      <div class="row top">
        <div class="pp-radio">${sel ? App.icon('check', 13) : ''}</div>
        <div class="grow">
          <div class="row between"><span class="bold ellipsis" style="font-size:14.5px">${esc(t.name)}</span>${App.ui.chip(t.status, off ? 'warn' : 'ok', { sm: true, icon: off ? 'clock' : 'shield' })}</div>
          <div class="tiny muted mt4">版本 ${esc(t.version)} · 审核人 ${esc(t.reviewedBy || '—')}${t.reviewedAt ? ` · ${esc(t.reviewedAt)}` : ''}</div>
          <dl class="pp-tkv mt8"><dt>适用地区</dt><dd>${esc(t.region)} · ${esc(t.segment)}</dd><dt>必填字段</dt><dd>${t.required.length ? t.required.map((r) => `<span class="pp-req">${esc(r)}</span>`).join('') : '—'}</dd><dt>可替换段</dt><dd>${t.replaceable.length ? esc(t.replaceable.join(' / ')) : '—'}</dd><dt>定价</dt><dd>${esc(t.pricing)}</dd></dl>
        </div>
      </div>
    </div>`;
  }
  function stepTemplate(store) {
    const seg = segmentOf(store);
    const list = App.state.templates.filter((t) => t.segment === seg);
    let h = App.ui.section('选择已审核模板', `<span class="muted">${list.filter((t) => t.status === '已发布').length} 个已发布</span>`, '第 1 步');
    if (seg !== '餐饮单店') h += App.ui.p1Banner('食品工厂 / KA 综合方案模板审核中（P1）：首期仅提供餐饮单店模板');
    h += list.length ? list.map(tplCard).join('') : `<div class="card">${App.ui.empty({ icon: 'template', title: '该客群暂无已发布模板', sub: '请联系管理员在配置台发布' })}</div>`;
    h += App.ui.notice('info', '只用已审核发布的模板；模板复用已移除原客户名称、联系方式、现场照片与个别报价，不会串客。', 'shield');
    return h;
  }
  const field = (key, label, valueHtml, opts = {}) => `<div class="pp-field ${opts.pending ? 'pending' : ''} pressable" onclick="S_PROP.edit('${key}')"><div class="pp-fl">${esc(label)}</div><div class="pp-fv">${valueHtml}</div><div class="pp-fe">${App.icon(opts.icon || 'edit', 16)}</div></div>`;
  function stepInputs() {
    const I = W.inputs;
    let h = App.ui.section('输入确认', `${App.ui.factTag('fact')}`, '第 2 步');
    h += `<div class="pp-src-line">${App.icon('history', 12)}来源：${esc(I.sourceLabel)} · 系统预填 · 未提及内容不填造</div>`;
    h += `<div class="list">
      ${field('needs', '已确认需求', I.needs.length ? `<ul class="pp-ul">${I.needs.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '<span class="muted">暂无 · 点击补充</span>')}
      ${field('observations', '现场观察', I.observations.length ? `<ul class="pp-ul">${I.observations.map((o) => `<li>${esc(o.text)}${o.tag ? ` ${App.ui.chip(o.tag, 'warn', { sm: true })}` : ''}</li>`).join('')}</ul>` : '<span class="muted">无</span>')}
      ${field('contact', '联系人', esc(I.contact))}
      ${I.decisionMaker ? field('decisionMaker', '决策人', `${esc(I.decisionMaker)} ${I.decisionPending ? App.ui.factTag('pending') : ''}`) : ''}
      ${field('scope', '服务范围', `${esc(I.scope)} ${App.ui.chip(I.scopeSource, 'outline', { sm: true })}`)}
      ${field('freq', '服务频次', `${esc(I.freq)} ${I.freqSource === '销售确认' ? App.ui.chip('销售确认', 'brand', { sm: true }) : ''}`)}
      ${field('equipment', '设备数量', `${I.equipmentPending ? `${App.ui.factTag('pending')} ` : ''}${esc(I.equipment)}`, { pending: I.equipmentPending })}
      ${field('price', '价格', `${App.ui.chip('报价待审批', 'warn', { sm: true, icon: 'lock' })} <span class="tiny muted">不显示占位假价格</span>`, { icon: 'lock' })}
    </div>`;
    h += `<div class="card pp-pro ${W.pro ? 'on' : ''}"><div class="row" onclick="S_PROP.togglePro()"><div class="grow"><div class="bold" style="font-size:14.5px">存在专业判断项（如虫种确认）</div><div class="tiny muted mt4">开启后仅生成内部草稿并转技术复核，复核前不可对外导出</div></div><div class="pp-switch ${W.pro ? 'on' : ''}" role="switch" aria-checked="${W.pro}"></div></div>${W.pro ? App.ui.notice('warn', '专业项缺失：本次产出将标记为"内部草稿 · 待技术复核"，导出/发送按钮将被替换为"转技术复核"。', 'beaker') : ''}</div>`;
    return h;
  }
  function stepPhotos() {
    const v = W.inputs.visitId ? App.visit(W.inputs.visitId) : null;
    const src = v ? `拜访 ${fmtT(v.time)}` : '本门店拜访记录';
    let h = App.ui.section('照片位置', `<span class="muted">${W.photos.length} 张 · ${esc(src)}</span>`, '第 3 步');
    if (!W.photos.length) h += `<div class="card">${App.ui.empty({ icon: 'image', title: '本次拜访无照片', sub: '可直接生成不含照片的方案；不使用其他门店照片' })}</div>`;
    else h += `<div class="list">${W.photos.map((ph, i) => `<div class="pp-photo-row"><div class="pp-grip" aria-hidden="true"></div>${App.ui.scene(ph.kind, '')}<div class="grow"><div class="pp-plabel">${esc(ph.label)}</div><div class="tiny muted mt4">${ph.pos === '不使用' ? '不进入方案' : `将放入：${esc(ph.pos)}`}</div></div><select class="pp-select" onchange="S_PROP.setPos(${i}, this.value)">${POS.map((p) => `<option value="${p}" ${ph.pos === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>`).join('')}</div>`;
    h += App.ui.notice('ok', '销售确认图片位置后生成，不同门店不会串照片：照片仅来自本门店已确认拜访记录。', 'shield');
    return h;
  }
  function stepGenerate() {
    const g = W.gen; const tpl = tplOf(W.templateId);
    if (g.error) {
      return `<div class="card pp-gen"><div class="pp-gen-icon danger">${App.icon('cloud-off', 32)}</div><div class="pp-gen-title">生成失败</div><div class="pp-gen-sub">输入已保留，可重试或人工选模板</div>
        ${App.ui.notice('danger', '生成失败，输入已保留，可重试或人工选模板。失败环节：' + esc(GEN_STAGES[Math.max(0, g.stage)]) + '（排版服务未响应）', 'alert')}
        <div class="pp-stages">${GEN_STAGES.map((s, i) => `<div class="pp-stage ${i < g.stage ? 'done' : (i === g.stage ? 'fail' : '')}"><span class="dot">${i < g.stage ? App.icon('check', 10) : (i === g.stage ? App.icon('x', 10) : '')}</span>${esc(s)}</div>`).join('')}</div></div>`;
    }
    return `<div class="card pp-gen"><div class="pp-gen-icon">${App.icon('sparkle', 32)}</div><div class="pp-gen-title">正在组装方案草稿</div><div class="pp-gen-sub">按已审核模板 ${esc(tpl.version || '')} 组装 · 不生成价格 · 不从照片推定设备数量</div>
      <div class="mt16" id="ppGenBar">${App.ui.progress(g.progress, true)}</div>
      <div class="row between mt8"><span class="tiny muted" id="ppGenMsg">${esc(g.stage >= 0 ? GEN_STAGES[g.stage] : '准备输入快照…')}</span><span class="tiny muted num" id="ppGenPct">${g.progress}%</span></div>
      <div class="pp-stages" id="ppGenStages">${GEN_STAGES.map((s, i) => `<div class="pp-stage ${i < g.stage ? 'done' : (i === g.stage ? 'cur' : '')}"><span class="dot">${i < g.stage ? App.icon('check', 10) : ''}</span>${esc(s)}</div>`).join('')}</div>
      <div class="tiny muted mt12">${App.icon('sparkle', 11)} AI 仅按模板组装已确认内容，产出为草稿；对外导出前需人工确认</div></div>`;
  }
  function stepPreview() {
    const p = App.proposal(W.proposalId);
    if (!p) return `<div class="card">${App.ui.empty({ icon: 'doc', title: '尚未生成方案', sub: '请返回上一步生成' })}</div>`;
    let h = App.ui.section('预览确认', statusChip(propStatus(p)), '第 5 步');
    h += versionStrip(p);
    h += paperHtml(modelFromProposal(p));
    h += App.ui.notice(p.internal ? 'warn' : 'info', p.internal
      ? '本版本含专业判断项，仅作内部草稿；转技术复核通过前不可对外导出或发送。'
      : '对外导出前由销售人工确认；导出 / 标记发送由人触发，不自动发给客户；导出不等于客户已收到或已接受。仅生成方案不推进商机阶段。', p.internal ? 'beaker' : 'info');
    return h;
  }

  /* ---------- 向导：交互 ---------- */
  P.pickTpl = function (id) {
    const t = tplOf(id); if (!t.id) return;
    if (t.status !== '已发布') { App.toast(`${t.name} ${t.status}，不可用于生成`, { icon: 'lock', duration: 2000 }); return; }
    W.templateId = id;
    if (W.inputs.scopeSource === '模板默认') W.inputs.scope = tplData(id).scope;
    App.refresh();
  };
  P.next = function () {
    if (W.step === 0) { const t = tplOf(W.templateId); if (!t.id || t.status !== '已发布') { App.toast('请选择一个已发布模板', { icon: 'template' }); return; } }
    if (W.step === 2) { W.gen = freshGen(); W.step = 3; App.refresh(); App.scrollTop(); return; }
    W.step = Math.min(4, W.step + 1); App.refresh(); App.scrollTop();
  };
  P.prev = function () { W.step = Math.max(0, W.step - 1); App.refresh(); App.scrollTop(); };
  P.toStep = function (i) { W.step = i; W.gen = freshGen(); App.refresh(); App.scrollTop(); };
  P.togglePro = function () { W.pro = !W.pro; App.refresh(); };
  P.setPos = function (i, val) {
    const ph = W.photos[i]; if (!ph) return;
    if (val === '封面') W.photos.forEach((x, j) => { if (j !== i && x.pos === '封面') x.pos = '现场观察'; });
    ph.pos = val; App.refresh();
  };
  P.edit = function (f) {
    const I = W.inputs;
    if (f === 'price') { App.toast('价格由审批报价给出，方案中只显示"报价待审批"', { icon: 'lock', duration: 2200 }); return; }
    const cfg = {
      needs: ['编辑已确认需求', '每行一条；只填写客户已明确表达的需求', I.needs.join('\n'), (v) => { const l = lines(v); if (l.length) I.needs = l; }],
      observations: ['编辑现场观察', '每行一条；保留"疑似"等原始表述，不写成确认虫害', I.observations.map((o) => o.text).join('\n'), (v) => { const l = lines(v); if (l.length) I.observations = l.map((t) => ({ text: t, tag: obsTag(t), photo: '' })); }],
      contact: ['编辑联系人', '姓名 · 角色（决策关系）', I.contact, (v) => { if (v.trim()) I.contact = v.trim(); }],
      decisionMaker: ['决策人', '仅填写客户已提供的姓名；未提供保持"待核实"', '', (v) => { if (v.trim()) { I.decisionMaker = `老板 · ${v.trim()}`; I.decisionPending = false; } }],
      scope: ['编辑服务范围', '仅限模板适用服务范围内调整', I.scope, (v) => { if (v.trim()) { I.scope = v.trim(); I.scopeSource = '销售修改'; } }],
      freq: ['编辑服务频次', '仅填写客户已确认的频次（如"每月 2 次"）；留空按模板默认', '', (v) => { const t = v.trim(); I.freq = t || FREQ_DEFAULT; I.freqSource = t ? '销售确认' : '模板默认'; }],
      equipment: ['设备数量', '仅填写勘查确认的数量；留空保持"待勘查确认"，不从照片推定', '', (v) => { const t = v.trim(); I.equipment = t || EQUIP_PENDING; I.equipmentPending = !t; }],
    }[f];
    if (!cfg) return;
    App.prompt(cfg[0], cfg[1], (v) => { cfg[3](v || ''); App.refresh(); });
    const ta = App.q('#promptInput'); if (ta && cfg[2]) { ta.value = cfg[2]; App._promptVal = cfg[2]; }
  };
  P.retry = function () { W.gen = freshGen(); App.refresh(); };
  P.regenHere = function () {
    App.sheet({ title: '重新生成会产生新版本，已确认版本保留不被覆盖', items: [
      { label: '修改输入后重新生成', sub: '回到输入确认，保留当前照片位置', icon: 'edit', onSelect: () => { W.step = 1; W.gen = freshGen(); App.refresh(); App.scrollTop(); } },
      { label: '直接重新生成（同一输入快照）', sub: '版本号 +1，事件记录"重新生成"', icon: 'refresh', onSelect: () => { W.step = 3; W.gen = freshGen(); App.refresh(); App.scrollTop(); } },
    ] });
  };
  P.finish = function () { if (W && W.proposalId) App.go('proposal', { id: W.proposalId }); };
  P.reset = function () { if (W) { clearTimeout(W.timer); initW(W.oppId); } App.refresh(); App.toast('向导已重置', { icon: 'refresh' }); };

  function paintGen() {
    const g = W.gen;
    const bar = App.q('#ppGenBar .progress > i'); if (bar) bar.style.width = `${g.progress}%`;
    const pct = App.q('#ppGenPct'); if (pct) pct.textContent = `${g.progress}%`;
    const msg = App.q('#ppGenMsg'); if (msg) msg.textContent = g.stage >= 0 ? GEN_STAGES[g.stage] : '准备输入快照…';
    const st = App.q('#ppGenStages');
    if (st) App.qa('.pp-stage', st).forEach((el, i) => { el.className = `pp-stage ${i < g.stage ? 'done' : (i === g.stage ? 'cur' : '')}`; el.querySelector('.dot').innerHTML = i < g.stage ? App.icon('check', 10) : ''; });
  }
  function startGen() {
    clearTimeout(W.timer);
    W.gen = Object.assign(freshGen(), { running: true });
    const total = GEN_STAGES.length; let i = 0;
    const tick = () => {
      if (!W || !W.gen.running) return;
      if (W.failNext && i === 3) { W.failNext = false; W.gen.running = false; W.gen.error = true; W.gen.stage = i; if (isHere('proposal-new')) App.refresh(); return; }
      W.gen.stage = i; W.gen.progress = Math.round(((i + 0.6) / total) * 100); paintGen();
      i += 1;
      if (i < total) W.timer = setTimeout(tick, 480);
      else W.timer = setTimeout(() => { W.gen.progress = 100; W.gen.stage = total; paintGen(); W.timer = setTimeout(finishGen, 380); }, 420);
    };
    W.timer = setTimeout(tick, 220);
  }
  function finishGen() {
    if (!W) return;
    commitProposal();
    W.gen.running = false; W.gen.done = true; W.step = 4;
    if (isHere('proposal-new')) { App.refresh(); App.scrollTop(); App.toast('草稿已生成 · 请预览并人工确认', { icon: 'sparkle' }); }
  }
  function commitProposal() {
    const id = proposalIdFor(W.oppId);
    const opp = App.opp(W.oppId); const tpl = tplOf(W.templateId); const I = W.inputs;
    let p = App.proposal(id);
    const t = p ? nextTime(p) : (I.snapshotAt && I.snapshotAt.slice(0, 10) === App.TODAY ? addMin(I.snapshotAt, 17) : `${App.TODAY} 15:20`);
    const photos = W.photos.filter((x) => x.pos !== '不使用').map((x) => ({ kind: x.kind, label: x.label, pos: x.pos }));
    const snap = { needs: I.needs.slice(), observations: I.observations.map((o) => ({ text: o.text, tag: o.tag, photo: o.photo })), photos: photos.map((x) => x.label), contact: I.contact, decisionMaker: I.decisionMaker, decisionPending: I.decisionPending, scope: I.scope, scopeSource: I.scopeSource, freq: I.freq, freqSource: I.freqSource, equipment: I.equipment, equipmentPending: I.equipmentPending, price: '报价待审批', snapshotAt: I.snapshotAt, visitId: I.visitId };
    if (!p) {
      p = { id, storeId: opp.storeId, oppId: opp.id, templateId: tpl.id, templateVersion: tpl.version, version: 1, status: 'draft', confirmedBy: '', createdAt: t, internal: W.pro,
        inputSnapshot: snap, photos, events: [{ t, e: '生成 v1', kind: 'gen' }], feedback: null, pendingReview: [], versions: [{ v: 1, createdAt: t, snapshotAt: I.snapshotAt, templateVersion: tpl.version, status: 'draft' }] };
      App.state.proposals.unshift(p);
    } else {
      ensureVersions(p);
      const prev = curVer(p);
      const v = p.version + 1;
      p.version = v; p.status = 'draft'; p.confirmedBy = ''; p.confirmedAt = ''; p.internal = W.pro;
      p.templateId = tpl.id; p.templateVersion = tpl.version; p.inputSnapshot = snap; p.photos = photos;
      p.events.push({ t, e: `重新生成 v${v}${prev && prev.status !== 'draft' ? `（v${prev.v} 已确认版本保留）` : ''}`, kind: 'gen' });
      p.versions.push({ v, createdAt: t, snapshotAt: I.snapshotAt, templateVersion: tpl.version, status: 'draft' });
      if (prev && prev.status === 'draft') prev.status = 'superseded';
    }
    App.state.demo.proposalGenerated = true;
    W.proposalId = id;
    App.save();
  }

  /* ---------- 方案动作（向导第 5 步与方案详情共用） ---------- */
  P.confirm = function (id) {
    const p = App.proposal(id); if (!p) return;
    if (p.internal) { App.toast('内部草稿需技术复核通过后才能确认导出', { icon: 'lock', duration: 2200 }); return; }
    App.confirm('人工确认方案', `确认 v${p.version} 内容无误后方可对外导出。确认人：${esc(App.me().name)}。<div class="tiny muted mt8">确认不推进商机阶段；已确认版本不可被覆盖，重新生成只产生新版本。</div>`, () => {
      ensureVersions(p);
      const t = nextTime(p);
      p.status = 'confirmed'; p.confirmedBy = App.me().name; p.confirmedAt = t;
      const cv = curVer(p); if (cv) { cv.status = 'confirmed'; cv.confirmedBy = p.confirmedBy; cv.confirmedAt = t; }
      p.events.push({ t, e: `人工确认 v${p.version}`, kind: 'confirm' });
      App.save(); App.refresh(); App.toast('已人工确认 · 可导出 PDF / 标记发送', { icon: 'check-circle' });
    });
  };
  P.exportPdf = function (id) {
    const p = App.proposal(id); if (!p) return;
    if (p.status === 'draft') { App.toast('请先人工确认，再导出', { icon: 'lock' }); return; }
    const close = App.loading('正在排版 PDF 草稿…');
    setTimeout(() => {
      close(); ensureVersions(p);
      const t = nextTime(p);
      p.events.push({ t, e: `导出 PDF v${p.version}`, kind: 'export' });
      if (p.status === 'confirmed') { p.status = 'exported'; const cv = curVer(p); if (cv) cv.status = 'exported'; }
      App.save(); App.refresh(); App.toast('已导出 · 导出不等于客户已收到', { icon: 'file', duration: 2400 });
    }, 900);
  };
  P.markSent = function (id) {
    const p = App.proposal(id); if (!p) return;
    if (p.status === 'draft') { App.toast('请先人工确认，再标记发送', { icon: 'lock' }); return; }
    const pick = (ch) => () => {
      ensureVersions(p);
      const t = nextTime(p);
      p.events.push({ t, e: `人工标记已发送（${ch}）v${p.version}`, kind: 'sent' });
      p.status = 'marked_sent'; const cv = curVer(p); if (cv) cv.status = 'marked_sent';
      App.save(); App.refresh(); App.toast('已标记发送 · 无客户反馈前只记"已发送"，不推进阶段', { icon: 'send', duration: 2600 });
    };
    App.sheet({ title: '标记已发送 · 由人触发，系统不自动发给客户', items: [
      { label: '微信', sub: '通过微信发给客户联系人', icon: 'message', onSelect: pick('微信') },
      { label: '邮件', sub: '发送至客户邮箱', icon: 'send', onSelect: pick('邮件') },
      { label: '当面', sub: '打印或现场讲解', icon: 'handshake', onSelect: pick('当面') },
    ] });
  };
  P.toReview = function (id) {
    const p = App.proposal(id); if (!p) return;
    App.confirm('转技术复核', '将以"内部草稿"保存，并向技术部发起复核任务（演示）。复核通过前不可对外导出或发送。', () => {
      ensureVersions(p);
      const t = nextTime(p);
      p.internal = true;
      const obs = (p.inputSnapshot && p.inputSnapshot.observations || []).map(normObs).find((o) => o.tag) || null;
      p.pendingReview.push({ id: App.uid('rv'), item: `虫种确认${obs ? `：${obs.text}` : ''}`, to: '技术部 李工', by: App.me().name, at: t, status: '待技术复核', version: p.version });
      p.events.push({ t, e: `转技术复核（仅内部草稿 v${p.version}）`, kind: 'review' });
      App.save(); App.refresh(); App.toast('已转技术复核 · 已生成复核任务给技术部（演示）', { icon: 'beaker', duration: 2400 });
    }, '转技术复核');
  };
  P.feedback = function (id) {
    const p = App.proposal(id); if (!p) return;
    const pick = (kind) => () => {
      App.prompt(`客户反馈 · ${kind}`, kind === '有异议' ? '记录异议点（如价格、作业时间、效果疑虑）' : (kind === '未回复' ? '记录联系情况（如电话未接、微信未读）' : '记录客户认可的内容与下一步'), (v) => {
        ensureVersions(p);
        const t = nextTime(p);
        p.feedback = { kind, detail: (v || '').trim(), at: t, by: App.me().name };
        p.events.push({ t, e: `记录客户反馈（${kind}）`, kind: 'feedback' });
        App.save(); App.refresh(); App.toast(kind === '未回复' ? '已记录 · 未回复不算反馈，继续回访' : '已记录客户反馈 · 阶段变更需在商机推进卡确认', { icon: 'message', duration: 2600 });
      }, '保存');
    };
    App.sheet({ title: '记录客户反馈 · 获得反馈后才可作为方案沟通阶段退出证据', items: [
      { label: '认可', sub: '客户认可方案内容，可进入报价商务', icon: 'thumbs', onSelect: pick('认可') },
      { label: '有异议', sub: '记录异议点，安排回访处理', icon: 'alert', onSelect: pick('有异议') },
      { label: '未回复', sub: '仍无反馈，只记录联系情况', icon: 'clock', onSelect: pick('未回复') },
    ] });
  };
  P.regen = function (id) {
    const p = App.proposal(id); if (!p) return;
    initW(p.oppId);
    W.templateId = p.templateId; W.pro = !!p.internal; W.proposalId = p.id;
    if (p.photos && p.photos.length) W.photos = p.photos.map((x) => Object.assign({}, x));
    W.step = 3;
    App.go('proposal-new', { oppId: p.oppId, regen: '1' });
  };

  /* ---------- 向导：底部操作 ---------- */
  function wizardFooter(p) {
    const b = App.ui.btn;
    switch (W.step) {
      case 0: { const t = tplOf(W.templateId); return b('下一步：输入确认', { tone: 'primary', block: true, icon: 'arrow-right', disabled: !t.id || t.status !== '已发布', onclick: 'S_PROP.next()' }); }
      case 1: return `<div class="btn-row">${b('上一步', { tone: 'ghost', onclick: 'S_PROP.prev()' })}${b('下一步：照片位置', { tone: 'primary', icon: 'arrow-right', onclick: 'S_PROP.next()' })}</div>`;
      case 2: return `<div class="btn-row">${b('上一步', { tone: 'ghost', onclick: 'S_PROP.prev()' })}${b('确认位置并生成', { tone: 'ai', icon: 'sparkle', onclick: 'S_PROP.next()' })}</div>`;
      case 3: return W.gen.error ? `<div class="btn-row">${b('人工选模板', { tone: 'ghost', icon: 'template', onclick: 'S_PROP.toStep(0)' })}${b('重试', { tone: 'primary', icon: 'refresh', onclick: 'S_PROP.retry()' })}</div>` : '';
      case 4: {
        if (!p) return '';
        if (p.internal) {
          const sent = p.pendingReview && p.pendingReview.some((r) => r.version === p.version);
          return `${sent ? b('已转技术复核 · 等待结果', { tone: 'ghost', block: true, icon: 'beaker', disabled: true }) : b('仅内部草稿 · 转技术复核', { tone: 'primary', block: true, icon: 'beaker', onclick: `S_PROP.toReview('${p.id}')` })}
            <div class="btn-row mt8">${b('重新生成（产生新版本）', { tone: 'ghost', size: 'sm', icon: 'refresh', onclick: 'S_PROP.regenHere()' })}${b('完成', { tone: 'outline', size: 'sm', onclick: 'S_PROP.finish()' })}</div>`;
        }
        if (p.status === 'draft') {
          return `<div class="btn-row">${b('重新生成（产生新版本）', { tone: 'ghost', icon: 'refresh', onclick: 'S_PROP.regenHere()' })}${b('人工确认', { tone: 'primary', icon: 'check', onclick: `S_PROP.confirm('${p.id}')` })}</div>
            <div class="btn-row mt8">${b('导出 PDF', { tone: 'ghost', size: 'sm', icon: 'file', disabled: true })}${b('标记已发送', { tone: 'ghost', size: 'sm', icon: 'send', disabled: true })}${b('完成', { tone: 'outline', size: 'sm', onclick: 'S_PROP.finish()' })}</div>
            <div class="pp-foot-hint">${App.icon('lock', 11)}导出 / 标记发送需先人工确认</div>`;
        }
        return `<div class="btn-row">${b('导出 PDF', { tone: 'secondary', icon: 'file', onclick: `S_PROP.exportPdf('${p.id}')` })}${b('标记已发送', { tone: 'secondary', icon: 'send', onclick: `S_PROP.markSent('${p.id}')` })}</div>
          <div class="btn-row mt8">${b('重新生成（产生新版本）', { tone: 'ghost', size: 'sm', icon: 'refresh', onclick: 'S_PROP.regenHere()' })}${b('完成', { tone: 'primary', size: 'sm', icon: 'check', onclick: 'S_PROP.finish()' })}</div>`;
      }
      default: return '';
    }
  }

  /* ---------- 页面：proposal-new ---------- */
  App.register('proposal-new', {
    tab: 'customers',
    nav() { return { title: W && W.step === 4 ? '方案预览确认' : '方案工作台' }; },
    prd: ['F06 餐饮单店方案与模板库', '7 页面表·方案工作台', '7.1 典型交互示例（丙店方案草稿）', 'R04 定制方案（P0 餐饮单店模板）', 'R11 优质方案模板复用（审核模板库）'],
    rules: ['只用已审核发布模板（版本 / 审核人可见）', '需要价格处显示"报价待审批"，不放假价格', '频次 / 设备数量只读取已确认参数或模板，不从照片推定', '专业项缺失 → 仅内部草稿 + 转技术复核', '重新生成产生新版本，不覆盖已确认版本', '记录 生成 / 导出 / 人工标记发送 三个事件', '仅生成方案不推进阶段；导出≠客户已收到', '不同门店连续生成不串照片 / 名称'],
    demoActions: [
      { label: '模拟生成失败', icon: 'cloud-off', run() {
        if (!W) return;
        if (W.step === 3 && W.gen.running) { clearTimeout(W.timer); W.gen.running = false; W.gen.error = true; App.refresh(); }
        else { W.failNext = true; App.toast('已设置：下一次生成将模拟失败', { icon: 'cloud-off', duration: 2000 }); }
      } },
      { label: '重置向导', icon: 'refresh', run() { P.reset(); } },
    ],
    render(params, ctx) {
      const oppId = params.oppId || 'o_bing';
      const key = ctx.entry.key;
      if (!W || W.oppId !== oppId || (W.entryKey !== key && !params.regen)) initW(oppId);
      W.entryKey = key;
      const opp = App.opp(oppId); const store = opp ? App.store(opp.storeId) : null;
      if (!opp || !store) return `<div class="card">${App.ui.empty({ icon: 'doc', title: '未找到商机', sub: '请从客户详情或商机推进卡发起方案' })}</div>`;
      if (store.perm === 'minimal') return `<div class="card">${App.ui.empty({ icon: 'lock', title: '该门店已有负责人跟进', sub: '无权限发起方案，可申请协作', action: App.ui.btn('申请协作', { tone: 'outline', size: 'sm', onclick: `App.go('collab-request',{storeId:'${store.id}'})` }) })}</div>`;
      const tpl = tplOf(W.templateId);
      let h = headHtml(opp, store, tpl, W.step, W.step === 3 && W.gen.error);
      if (W.step === 0) h += stepTemplate(store);
      else if (W.step === 1) h += stepInputs();
      else if (W.step === 2) h += stepPhotos();
      else if (W.step === 3) h += stepGenerate();
      else h += stepPreview();
      return h;
    },
    footer() {
      if (!W) return '';
      const opp = App.opp(W.oppId); const store = opp ? App.store(opp.storeId) : null;
      if (!opp || !store || store.perm === 'minimal') return '';
      return wizardFooter(W.proposalId ? App.proposal(W.proposalId) : null);
    },
    mount() {
      if (W && W.step === 3 && !W.gen.running && !W.gen.error && !W.gen.done) startGen();
    },
  });

  /* ---------- 页面：proposal（方案详情） ---------- */
  function detailFooter(p) {
    const b = App.ui.btn; const id = p.id;
    if (p.internal && p.status === 'draft') {
      const sent = p.pendingReview && p.pendingReview.some((r) => r.version === p.version);
      return sent ? b('已转技术复核 · 等待结果', { tone: 'ghost', block: true, icon: 'beaker', disabled: true }) : b('仅内部草稿 · 转技术复核', { tone: 'primary', block: true, icon: 'beaker', onclick: `S_PROP.toReview('${id}')` });
    }
    if (p.status === 'draft') return `<div class="btn-row">${b('重新生成（新版本）', { tone: 'ghost', icon: 'refresh', onclick: `S_PROP.regen('${id}')` })}${b('人工确认', { tone: 'primary', icon: 'check', onclick: `S_PROP.confirm('${id}')` })}</div>`;
    if (p.status === 'confirmed') return `<div class="btn-row">${b('导出 PDF', { tone: 'primary', icon: 'file', onclick: `S_PROP.exportPdf('${id}')` })}${b('标记已发送', { tone: 'secondary', icon: 'send', onclick: `S_PROP.markSent('${id}')` })}</div>`;
    if (p.status === 'exported') return `<div class="btn-row">${b('再次导出', { tone: 'ghost', icon: 'file', onclick: `S_PROP.exportPdf('${id}')` })}${b('标记已发送', { tone: 'primary', icon: 'send', onclick: `S_PROP.markSent('${id}')` })}</div>`;
    return `<div class="btn-row">${b('再次导出', { tone: 'ghost', icon: 'file', onclick: `S_PROP.exportPdf('${id}')` })}${b(p.feedback ? '更新客户反馈' : '记录客户反馈', { tone: 'primary', icon: 'message', onclick: `S_PROP.feedback('${id}')` })}</div>`;
  }
  App.register('proposal', {
    tab: 'customers', title: '方案详情',
    prd: ['F06 餐饮单店方案与模板库', '7 页面表·方案工作台（版本 / 事件）', '6.1 三组状态分开：仅生成/发送方案不推进阶段'],
    rules: ['保留输入快照、模板版本、生成版本和确认人', '已确认版本不可被覆盖；重新生成产生新版本', '记录 生成 / 导出 / 人工标记发送 三个事件', '导出≠客户已收到或已接受', '发送无反馈只记"已发送"；获得反馈后才可作为阶段退出证据', '专业项缺失 → 内部草稿 + 待技术复核'],
    demoActions: [{ label: '模拟客户反馈：有异议（演示）', icon: 'message', run() {
      const e = App.currentEntry(); const p = e && App.proposal(e.params.id); if (!p) return;
      ensureVersions(p); const t = nextTime(p);
      p.feedback = { kind: '有异议', detail: '担心夜间作业影响收档；希望明确首次强化时长', at: t, by: App.me().name };
      p.events.push({ t, e: '记录客户反馈（有异议）', kind: 'feedback' });
      App.save(); App.refresh(); App.toast('已记录客户反馈（演示）', { icon: 'message' });
    } }],
    render(params) {
      const p = App.proposal(params.id);
      if (!p) return `<div class="card">${App.ui.empty({ icon: 'doc', title: '未找到方案', sub: '可从商机推进卡或客户详情发起方案', action: App.ui.btn('返回', { tone: 'outline', size: 'sm', onclick: 'App.back()' }) })}</div>`;
      const m = modelFromProposal(p); const s = m.store; const tpl = m.tpl;
      const st = propStatus(p);
      const vers = versionsOf(p).slice().sort((a, b) => b.v - a.v);
      let h = `<div class="card pp-head">
        <div class="row top"><div class="cell-icon">${App.icon('doc', 20)}</div><div class="grow"><div class="bold" style="font-size:16px;line-height:1.3">${esc(s.name || '')}</div><div class="small muted mt4">${esc(tpl.name || m.td.docTitle)} · 模板 ${esc(p.templateVersion)} · 当前 v${p.version} / 共 ${versionsOf(p).length} 版</div></div></div>
        <div class="row wrap mt12 gap6">${statusChip(st)}${p.confirmedBy ? App.ui.chip(`确认人 ${p.confirmedBy}${m.confirmedAt ? ' · ' + fmtT(m.confirmedAt) : ''}`, 'outline', { sm: true, icon: 'user' }) : App.ui.chip('未人工确认', 'outline', { sm: true })}</div>
        <div class="row mt12 gap6 pp-links"><span class="pp-link" onclick="App.go('opportunity',{id:'${p.oppId}'})">${App.icon('trend', 14)}商机推进卡${App.ui.stageChip(m.opp.stage || '')}</span><span class="pp-link" onclick="App.go('customer',{id:'${p.storeId}'})">${App.icon('store', 14)}客户详情${App.icon('chevron-right', 14)}</span></div>
      </div>`;
      if (p.internal && p.status === 'draft') h += App.ui.notice('warn', '本方案含专业判断项，仅为内部草稿；技术复核通过前不可对外导出或发送。', 'beaker');
      h += App.ui.section('方案预览', `<span class="muted">固定版式 PDF 草稿</span>`);
      h += versionStrip(p);
      h += paperHtml(m);
      h += App.ui.section('版本列表', `<span class="muted">${vers.length} 个版本</span>`);
      h += `<div class="list">${vers.map((v) => { const cur = v.v === p.version; const vs = v.status === 'draft' && p.internal && cur ? 'internal' : v.status; const locked = ['confirmed', 'exported', 'marked_sent'].includes(v.status);
        return `<div class="pp-vrow ${cur ? 'cur' : ''}"><div class="pp-vno">v${v.v}</div><div class="grow"><div class="row"><span class="bold" style="font-size:14px">版本 v${v.v}</span>${cur ? App.ui.chip('当前', 'brand', { sm: true }) : ''}${statusChip(vs, true)}</div><div class="tiny muted mt4">输入快照 ${esc(fmtT(v.snapshotAt))} · 模板 ${esc(v.templateVersion)} · 生成 ${esc(fmtT(v.createdAt))}${v.confirmedBy ? ` · 确认人 ${esc(v.confirmedBy)}` : ''}</div>${locked ? `<div class="tiny mt4" style="color:var(--brand-3)">${App.icon('lock', 11)} 已确认版本不可被覆盖${cur ? '' : '，可恢复查看'}</div>` : ''}</div></div>`; }).join('')}</div>`;
      h += App.ui.section('事件记录', `<span class="muted">${p.events.length} 条</span>`);
      h += `<div class="card">${App.ui.timeline(p.events.slice().reverse().map((e) => { const k = eventKind(e); return { time: fmtT(e.t), tag: EVENT_TAG[k], title: esc(e.e), tone: EVENT_TONE[k], body: k === 'export' ? '导出≠客户已收到或已接受' : (k === 'sent' ? '由人触发；无客户反馈前只记"已发送"' : (k === 'gen' ? 'AI 按已审核模板组装，产出为草稿' : '')) }; }))}
        <div class="tiny muted">${App.icon('info', 11)} 记录"生成 / 导出 / 人工标记发送"三个事件；导出不等于客户已收到或已接受。</div></div>`;
      h += App.ui.section('客户反馈', p.feedback ? App.ui.chip(p.feedback.kind, p.feedback.kind === '认可' ? 'ok' : (p.feedback.kind === '有异议' ? 'warn' : 'gray'), { sm: true }) : '');
      if (p.feedback) h += `<div class="card"><div class="row"><div class="cell-icon ${p.feedback.kind === '有异议' ? 'warn' : (p.feedback.kind === '认可' ? '' : 'gray')}">${App.icon(p.feedback.kind === '认可' ? 'thumbs' : (p.feedback.kind === '有异议' ? 'alert' : 'clock'), 20)}</div><div class="grow"><div class="bold" style="font-size:14.5px">${esc(p.feedback.kind)}${p.feedback.detail ? ` · ${esc(p.feedback.detail)}` : ''}</div><div class="tiny muted mt4">${esc(fmtT(p.feedback.at))} · ${esc(p.feedback.by)} 记录</div></div></div>
        ${App.ui.notice(p.feedback.kind === '未回复' ? 'gray' : 'ok', p.feedback.kind === '未回复' ? '未回复不构成反馈，商机仍停留在方案沟通；请继续回访。' : '已获得客户反馈，可作为方案沟通阶段退出证据；阶段变更需在商机推进卡人工确认。', p.feedback.kind === '未回复' ? 'clock' : 'check-circle')}</div>`;
      else h += `<div class="card"><div class="row"><div class="cell-icon gray">${App.icon('message', 20)}</div><div class="grow"><div class="bold" style="font-size:14.5px">暂无客户反馈</div><div class="tiny muted mt4">发送后需回访确认 · 获得反馈后才可作为方案沟通阶段退出证据</div></div></div><div class="mt12">${App.ui.btn('记录客户反馈', { tone: 'outline', size: 'sm', block: true, icon: 'message', onclick: `S_PROP.feedback('${p.id}')` })}</div></div>`;
      if (p.pendingReview && p.pendingReview.length) {
        h += App.ui.section('待技术复核', App.ui.chip(`${p.pendingReview.length} 项`, 'warn', { sm: true }));
        h += `<div class="list">${p.pendingReview.map((r) => App.ui.cell({ title: esc(r.item), sub: `转 ${esc(r.to)} · ${esc(fmtT(r.at))} · ${esc(r.by)} 发起 · v${r.version || p.version}`, icon: 'beaker', iconTone: 'warn', right: App.ui.chip(r.status, 'warn', { sm: true }), arrow: false })).join('')}</div>`;
      }
      h += `<div class="pp-caption">${App.icon('shield', 12)}方案保留输入快照、模板版本、生成版本与确认人；仅生成 / 发送方案不推进商机阶段。</div>`;
      return h;
    },
    footer(params) { const p = App.proposal(params.id); return p ? detailFooter(p) : ''; },
  });
})();
