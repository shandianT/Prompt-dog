/* ============================================================
   P1 预览（包 B）：报价 / 承诺一致性 / 合同 / 履约续约 / KA 经营卡 / 虫害识别
   页面：p1-hub · p1-quote · p1-commitments · p1-contract · p1-service · p1-ka-card · p1-pest
   所有页面带 App.ui.p1Banner()：依赖接口与规则，首期不承诺
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_P1 = {};
  const ui = () => App.ui;
  const P = () => App.state.p1;
  const isApprover = () => App.state.role === 'mgr';
  const NOW = '2026-09-07 09:41';
  const money = (n) => '¥ ' + Number(n).toLocaleString('zh-CN');

  /* 运行时字段补齐（data.js 只读；演示交互状态挂在 App.state.p1 上） */
  function ensure() {
    const p = P();
    const q = p.quote;
    if (q.version == null) q.version = 1;
    if (q.filled === undefined) q.filled = null;
    if (!q.history) q.history = [{ t: '2026-09-06 17:20', title: 'v1 草稿创建', body: '规则：单店标准报价规则 v1 · 缺失参数 2 项' }];
    const c = p.contract;
    if (!c.log) c.log = [{ t: '2026-09-07 09:10', title: '合同草稿创建', body: '模板 v2026.1 · 合同主体来自 CRM · 账期差异待处理', tone: 'gray' }];
    if (c.approvalApi == null) c.approvalApi = true;
    if (p.pest.result === undefined) p.pest.result = null;
    if (!p.service.flags) p.service.flags = { handoverMissing: false };
  }

  const srcTone = (s) => ({ CRM: 'info', 方案域: 'brand', 报价域: 'warn', 差异: 'danger' }[s] || 'gray');

  /* ============================================================
     p1-hub
     ============================================================ */
  const HUB = [
    { id: 'p1-quote', icon: 'yuan', tone: 'brand', title: '按类别报价', f: 'F09', sub: '规则计算 · 缺参数不出价 · 成本 / 毛利分权', need: 'LBS 成本核算逻辑、单店标准报价规则、审批权限配置' },
    { id: 'p1-commitments', icon: 'compare', tone: 'danger', title: '承诺—方案—报价—合同一致性', f: 'F10', sub: '逐项比对 · 差异状态 · 重要差异阻断提交', need: '承诺条目字段、文档抽取接口、授权例外流程' },
    { id: 'p1-contract', icon: 'contract', tone: 'info', title: '合同一键生成与审批接入', f: 'F11', sub: '一键生成 · 一键发起审批 · 请求 ID 去重', need: '标准合同模板、CRM 合同主体、审批发起 / 状态接口' },
    { id: 'p1-service', icon: 'truck', tone: 'warn', title: '履约 / 回款 / 续约摘要', f: 'F12', sub: '首服交接 · 服务状态 · 到期窗口 · 续约商机', need: '服务系统 / 财务系统摘要接口、到期窗口配置' },
    { id: 'p1-ka-card', icon: 'building', tone: 'violet', title: 'KA 客户经营卡', f: 'F12 / 6.5', sub: '关系覆盖 · 服务线空间 · 交付质量 · 续约风险（定性）', need: '集团—门店关系、服务线目录、客诉与合同数据' },
    { id: 'p1-pest', icon: 'bug', tone: 'ai', title: '虫害拍照辅助识别', f: 'F13', sub: '候选 / 未知 / 补拍 / 人工协助 · 不推定处置', need: '技术团队样本与审核知识、准确性验收阈值' },
  ];
  App.register('p1-hub', {
    title: 'P1 预览', tab: 'me',
    prd: ['5.2 交付包 B', '9 P1 详细功能需求', '11 系统集成与上线门槛', '16 实施顺序'],
    rules: ['P1 依赖接口 / 规则，首期不承诺', '每项能力单独设上线门槛', '未通过验收只开放人工辅助入口'],
    render() {
      return `
        ${ui().p1Banner()}
        <div class="hero dark">
          <div class="h-eyebrow">包 B / P1 · 预览</div>
          <div class="h-title">报价合同闭环 + KA 经营 + 专业辅助</div>
          <div class="h-sub">依赖接口与规则，单独设上线门槛；本页各项均为能力边界演示</div>
          <div class="h-metrics"><div class="m"><div class="v">6</div><div class="l">能力项</div></div><div class="m"><div class="v">3</div><div class="l">外部接口依赖</div></div><div class="m"><div class="v">0</div><div class="l">首期承诺</div></div></div>
        </div>
        ${ui().section('能力清单', `<span class="tiny">点击进入演示</span>`)}
        <div class="list">
          ${HUB.map((h) => `<div class="cell pressable p1-hubcell" onclick="App.go('${h.id}')">
            <div class="cell-icon ${h.tone}">${App.icon(h.icon, 20)}</div>
            <div class="cell-body">
              <div class="cell-title row"><span class="ellipsis">${App.esc(h.title)}</span>${ui().chip(h.f, 'outline', { sm: true })}</div>
              <div class="cell-sub">${App.esc(h.sub)}</div>
              <div class="p1-need">${App.icon('link', 11)}<span>需要：${App.esc(h.need)}</span></div>
            </div>
            <div class="cell-right">${App.icon('chevron-right', 16)}</div>
          </div>`).join('')}
        </div>
        ${ui().notice('gray', '上线门槛：每项 P1 能力分别评估接口、规则与验收阈值；只有状态查询而无发起接口的方案，不满足"不再切系统"的完整验收（PRD 11 / F11）。', 'shield')}
      `;
    },
  });

  /* ============================================================
     p1-quote  按类别报价
     ============================================================ */
  S._cat = null;
  function quoteCalc(q) {
    const bait = q.filled ? q.filled.bait : 0;
    const base = 12 * 260, first = 480, baitAmt = bait * 60, travel = 360;
    const total = base + first + baitAmt + travel;
    const taxIncl = q.filled && /含/.test(q.filled.tax);
    const shown = taxIncl ? Math.round(total * 1.06) : total;
    const cost = 12 * 195 + 360 + bait * 45 + 270;
    const margin = total > 0 ? (total - cost) / total : null;
    return { lines: [['月度服务费', '12 次 × ¥260', base], ['首次强化', '1 次', first], ['诱饵站', `${bait} 个 × ¥60`, baitAmt], ['人工 / 交通', '区域标准', travel]], total, shown, taxIncl, cost, margin };
  }
  const quoteStepIdx = (st) => ({ 草稿: 0, 待审批: 1, 已批准: 2, 已驳回: 2, 已失效: 3 }[st] ?? 0);
  const quoteChip = (st) => ui().chip(st, ({ 草稿: 'gray', 待审批: 'warn', 已批准: 'ok', 已驳回: 'danger', 已失效: 'gray' }[st] || 'gray'));

  App.register('p1-quote', {
    title: '按类别报价', tab: 'me',
    prd: ['F09 按类别报价', 'U11 修改已批准报价', '13.1 看成本 / 毛利'],
    rules: ['缺必需参数不出正式价格', '金额由规则计算，AI 仅解释', '成本 / 毛利仅审批角色可见', '关键参数修改产生新版本并重新审批', '未批准报价不能标成正式对客报价'],
    render(params) {
      ensure();
      const cat = S._cat || (params.oppId === 'o_ka1' ? 'factory' : 'single');
      const seg = `<div class="seg block mb12">${[['single', '单店'], ['chain', '连锁'], ['factory', '工厂']].map(([k, l]) => `<button class="${cat === k ? 'active' : ''}" onclick="S_P1.setCat('${k}')">${l}</button>`).join('')}</div>`;
      let body = '';
      if (cat === 'single') body = renderSingleQuote();
      else if (cat === 'chain') body = ui().empty({ icon: 'layers', title: '连锁规则待接入', sub: '先承接 LBS 单店标准报价，后扩展连锁规则（F09）；未接入前不出价' });
      else body = renderFactoryQuote();
      return `${ui().p1Banner()}${seg}${body}`;
    },
  });
  S.setCat = function (k) { S._cat = k; App.refresh(); };

  function renderSingleQuote() {
    const q = P().quote;
    const opp = App.opp(q.oppId); const st = opp && App.store(opp.storeId);
    const missing = q.params.filter((p) => !p.ok).map((p) => p.k);
    const complete = !missing.length && q.filled;
    const calc = complete ? quoteCalc(q) : null;
    const approved = q.status === '已批准';
    let result;
    if (!complete) {
      result = `<div class="card">
        <div class="card-title">报价结果</div>
        ${ui().notice('warn', `<b>未出正式价格</b> · 缺失：${App.esc(missing.join('、'))}`, 'alert')}
        <div class="small muted">金额由规则程序计算；AI 只负责解释与模板表达。缺失必需参数时不输出任何价格数字。</div>
        <div class="mt12">${ui().btn('补充参数', { block: true, icon: 'edit', onclick: 'S_P1.fillParams()' })}</div>
      </div>`;
    } else {
      result = `<div class="card">
        <div class="row between"><div class="card-title" style="margin:0">建议售价（规则计算）</div>${approved ? ui().chip('正式对客报价', 'brand', { sm: true, icon: 'check' }) : ui().chip('内部草稿 · 不可对客', 'gray', { sm: true })}</div>
        <div class="p1-price">${money(calc.shown)}<span class="u">/ 年（${calc.taxIncl ? '含税' : '未税'}）</span></div>
        <div class="tiny muted">${q.status === '草稿' ? '待提交审批' : q.status} · 规则：${App.esc(q.rule)} · v${q.version}${calc.taxIncl ? ' · 含税 = 未税 × 1.06（演示口径，须财务确认）' : ''}</div>
        <div class="divider"></div>
        <table class="table"><thead><tr><th>项目</th><th>口径</th><th class="r">金额</th></tr></thead><tbody>
          ${calc.lines.map(([k, d, v]) => `<tr><td>${App.esc(k)}</td><td class="muted">${App.esc(d)}</td><td class="r">${money(v)}</td></tr>`).join('')}
          <tr><td class="bold">合计（未税）</td><td></td><td class="r bold">${money(calc.total)}</td></tr>
        </tbody></table>
        <div class="mt12">${isApprover()
          ? `<div class="p1-margin"><div class="row between"><span class="bold">成本 / 毛利</span>${ui().chip('演示口径', 'warn', { sm: true })}</div>
              <div class="small mt4">同口径成本 <b>${money(calc.cost)}</b> · 毛利率 <b>${App.fmt.pct(calc.margin)}</b></div>
              <div class="tiny muted mt4">毛利率 =（同口径售价 ${money(calc.total)} − 同口径成本 ${money(calc.cost)}）÷ 同口径售价 ${money(calc.total)}；含税 / 未税、周期及成本项须财务确认；售价为 0 或不可比时不计算</div></div>`
          : `<div class="p1-lock">${App.icon('lock', 16)}<span>成本 / 毛利：仅审批角色可见</span></div>`}</div>
      </div>`;
    }
    const actions = [];
    if (q.status === '草稿') actions.push(ui().btn('提交审批', { block: true, icon: 'send', disabled: !complete, onclick: 'S_P1.submitQuote()' }));
    if (q.status === '待审批') {
      if (isApprover()) actions.push(`<div class="btn-row">${ui().btn('驳回', { tone: 'danger', onclick: 'S_P1.approveQuote(false)' })}${ui().btn('批准', { onclick: 'S_P1.approveQuote(true)' })}</div>`);
      actions.push(ui().btn('修改关键参数（产生新版本）', { tone: 'ghost', block: true, size: 'sm', icon: 'edit', onclick: 'S_P1.reviseQuote()' }));
    }
    if (q.status === '已批准') actions.push(ui().btn('修改关键参数（新版本重新审批）', { tone: 'ghost', block: true, size: 'sm', icon: 'edit', onclick: 'S_P1.reviseQuote()' }));
    if (q.status === '已驳回') actions.push(ui().btn('修改参数并重新提交', { tone: 'secondary', block: true, icon: 'edit', onclick: 'S_P1.reviseQuote()' }));
    return `
      <div class="card">
        <div class="row between"><div><div class="card-title" style="margin:0">${App.esc(st ? st.name : '')}</div><div class="card-sub">${App.esc(opp ? opp.service + ' · ' + opp.kind : '')} · ${App.esc(q.category)}</div></div>${opp ? ui().stageChip(opp.stage) : ''}</div>
        <div class="row mt8 gap6 wrap">${ui().chip(q.rule, 'outline', { sm: true, icon: 'template' })}${ui().chip('v' + q.version, 'gray', { sm: true })}</div>
      </div>
      ${ui().section('输入参数', `<span class="tiny">${q.params.filter((p) => p.ok).length}/${q.params.length} 已确认</span>`)}
      <div class="list">${q.params.map((p) => `<div class="form-item required ${p.ok ? '' : 'missing'}"><label>${App.esc(p.k)}</label><div class="fv ${p.ok ? '' : 'muted'}">${App.esc(p.v)}</div>${p.ok ? App.icon('check', 16, 'p1-okico') : ui().chip('缺参数', 'warn', { sm: true })}</div>`).join('')}</div>
      <div class="tiny muted mb12" style="padding:0 4px">${App.esc(q.note)}</div>
      ${result}
      <div class="card">
        <div class="row between"><div class="card-title" style="margin:0">报价状态</div>${quoteChip(q.status)}</div>
        ${ui().stepper(['草稿', '待审批', '已批准 / 已驳回', '已失效'], quoteStepIdx(q.status), { error: q.status === '已驳回' })}
        ${q.status === '已驳回' ? ui().notice('danger', `驳回原因：${App.esc(q.rejectReason || '未填写')} · 修改后重新走审批`, 'alert') : ''}
        ${actions.length ? `<div class="mt12 col gap6">${actions.join('')}</div>` : ''}
        <div class="tiny muted mt8">关键参数修改将产生新版本并重新审批，不能沿用原批准；未批准报价不能标成正式对客报价。</div>
      </div>
      ${q.history.length ? `${ui().section('版本记录')}<div class="card">${ui().timeline(q.history.map((h) => ({ time: h.t, title: App.esc(h.title), body: App.esc(h.body), tone: h.tone || '' })))}</div>` : ''}
      <div class="list">${ui().cell({ title: 'KA 报价示例 · 华信食品张江工厂', sub: '成本核算表 v2 · 待审批 · 成本行按权限锁定', icon: 'building', iconTone: 'violet', onclick: "S_P1.setCat('factory')" })}</div>
    `;
  }
  function renderFactoryQuote() {
    const k = P().kaQuote;
    const opp = App.opp(k.oppId); const st = opp && App.store(opp.storeId);
    const approver = isApprover();
    const cost = 61200, price = 86400;
    return `
      ${ui().notice('warn', '工厂 / 连锁规则待接入：先承接 LBS 现有成本核算逻辑及单店标准报价，后扩展连锁、工厂规则（F09）。以下为 KA 报价审批示例。', 'alert')}
      <div class="card">
        <div class="row between"><div><div class="card-title" style="margin:0">${App.esc(st ? st.name : '')}</div><div class="card-sub">${App.esc(k.category)} · ${App.esc(opp ? opp.service : '')} · 提交 ${App.esc(k.submittedAt)}</div></div>${quoteChip(k.status)}</div>
        <div class="row mt8 gap6 wrap">${ui().chip(k.rule, 'outline', { sm: true, icon: 'template' })}${ui().chip(k.version, 'gray', { sm: true })}</div>
        <div class="divider"></div>
        ${k.lines.map((l) => l.locked
          ? (approver
            ? `<div class="p1-line"><span class="k">${App.esc(l.k)}</span><span class="v">${l.k.includes('毛利') ? `${App.fmt.pct((price - cost) / price)} <span class="tiny muted">=（${money(price)} − ${money(cost)}）÷ ${money(price)}</span>` : money(cost)} ${ui().chip('演示口径', 'warn', { sm: true })}</span></div>`
            : `<div class="p1-line"><span class="k">${App.esc(l.k)}</span><span class="v muted">${App.icon('lock', 14)} 仅审批人可见</span></div>`)
          : `<div class="p1-line"><span class="k">${App.esc(l.k)}</span><span class="v">${App.esc(l.v)}</span></div>`).join('')}
        <div class="tiny muted mt8">不预置 LBS 未提供的成本或毛利线；成本核算表口径由 LBS 提供，演示数值仅占位。</div>
      </div>
      ${ui().section('审批进度')}
      <div class="card">
        ${ui().timeline(k.approvals.map((a) => ({ time: a.at || '进行中', title: `${App.esc(a.who)} ${ui().chip(a.status, a.status === '已批准' ? 'ok' : 'warn', { sm: true })}`, tone: a.status === '已批准' ? '' : 'warn' })))}
        <div class="tiny muted">按额度 / 服务 / 组织授权的审批人在小程序内审批；非本系统权限的审批人不可代批。</div>
      </div>
      <div class="list">${ui().cell({ title: '查看商机推进卡', sub: '华信张江工厂 · 报价商务 · 80%', icon: 'trend', onclick: `App.go('opportunity',{id:'${k.oppId}'})` })}${ui().cell({ title: '承诺一致性核对', sub: '一年两次风险勘查未计入报价 v2', icon: 'compare', iconTone: 'danger', onclick: "App.go('p1-commitments',{oppId:'o_ka1'})" })}</div>
    `;
  }
  S.fillParams = function () {
    App.prompt('诱饵站数量（勘查确认）', '例如：12（个）', (v1) => {
      const n = parseInt(v1, 10);
      const bait = n > 0 ? n : 12;
      App.prompt('税口径（财务确认）', '未税 / 含税（默认未税）', (v2) => {
        const tax = /含/.test(v2 || '') ? '含税' : '未税';
        const q = P().quote;
        q.filled = { bait, tax };
        q.params = q.params.map((p) => (p.k === '诱饵站数量' ? Object.assign({}, p, { v: `${bait} 个（勘查确认）`, ok: true }) : p.k === '税口径' ? Object.assign({}, p, { v: `${tax}（财务确认）`, ok: true }) : p));
        q.history.unshift({ t: NOW, title: `v${q.version} 参数补齐`, body: `诱饵站 ${bait} 个 · ${tax} · 规则计算建议售价` });
        App.save(); App.refresh();
        App.toast('参数已补齐 · 规则已计算建议售价', { icon: 'check-circle' });
      });
    });
  };
  S.submitQuote = function () {
    const q = P().quote;
    if (!q.filled) { App.toast('缺失必需参数，不能提交'); return; }
    const calc = quoteCalc(q);
    q.status = '待审批'; q.submittedAt = NOW;
    q.history.unshift({ t: NOW, title: `v${q.version} 提交审批`, body: `建议售价 ${money(calc.shown)} / 年 · 审批人：区域经理` });
    App.save(); App.refresh();
    App.toast('已提交审批 · 关键参数修改将产生新版本并重新审批', { icon: 'send', duration: 2400 });
  };
  S.approveQuote = function (ok) {
    if (!isApprover()) { App.toast('仅审批角色可批准 / 驳回'); return; }
    const q = P().quote;
    if (ok) {
      q.status = '已批准'; q.approvedAt = NOW;
      q.history.unshift({ t: NOW, title: `v${q.version} 已批准`, body: '审批人：周明远 · 可标为正式对客报价' });
      App.save(); App.refresh(); App.toast('已批准 · 现为正式对客报价', { icon: 'check-circle' });
    } else {
      App.prompt('驳回原因', '例如：诱饵站单价与核算表不一致', (r) => {
        q.status = '已驳回'; q.rejectReason = r || '未填写';
        q.history.unshift({ t: NOW, title: `v${q.version} 已驳回`, body: q.rejectReason, tone: 'warn' });
        App.save(); App.refresh(); App.toast('已驳回 · 修改后重新走流程', { icon: 'x' });
      });
    }
  };
  S.reviseQuote = function () {
    const q = P().quote;
    App.prompt('修改关键参数：诱饵站数量', `当前 ${q.filled ? q.filled.bait : '—'} 个，例如：16`, (v) => {
      const n = parseInt(v, 10);
      const bait = n > 0 ? n : (q.filled ? q.filled.bait : 12);
      const prev = q.version;
      q.history.unshift({ t: NOW, title: `v${prev} 已失效`, body: `关键参数修改（诱饵站 ${q.filled ? q.filled.bait : '—'} → ${bait}）· 不能沿用原${q.status === '已批准' ? '批准' : '审批'}`, tone: 'gray' });
      q.version = prev + 1; q.status = '草稿'; delete q.rejectReason;
      q.filled = Object.assign({}, q.filled || { tax: '未税' }, { bait });
      q.params = q.params.map((p) => (p.k === '诱饵站数量' ? Object.assign({}, p, { v: `${bait} 个（勘查确认）`, ok: true }) : p));
      App.save(); App.refresh();
      App.toast(`已生成 v${q.version} 草稿 · 需重新审批`, { icon: 'refresh' });
    });
  };

  /* ============================================================
     p1-commitments  承诺—方案—报价—合同一致性
     ============================================================ */
  const cmpTone = (v) => (v === '已包含' || v === '已计入' || /（人工）$/.test(v) ? 'ok' : v === '未计入' || v === '未包含' ? 'danger' : v === '无法判定' ? 'gray' : v === '—' ? 'outline' : 'warn');
  const stTone = (s) => ({ 待处理: 'danger', 一致: 'ok', 无法判定: 'gray', 已修改消除: 'ok', 有理由例外批准: 'info' }[s] || 'gray');
  const blocking = () => P().commitments.items.filter((i) => i.level === '重要' && (i.status === '待处理' || i.status === '无法判定'));
  S.blocking = blocking;

  App.register('p1-commitments', {
    title: '承诺一致性', tab: 'me',
    prd: ['F10 承诺—方案—报价—合同一致性', 'U10 一年两次勘查未写入合同', '6.3 KA 非标承诺与审批'],
    rules: ['逐项比对，模糊处标"无法判定"', '重要差异未解决阻断"确认正式版本 / 提交审批"', '例外须授权人批准并记录理由', '仅能控制接入的流程，外部旁路须 IT 共同治理'],
    render(params) {
      ensure();
      const c = P().commitments;
      const opp = App.opp(params.oppId || c.oppId); const st = opp && App.store(opp.storeId);
      const items = c.items;
      const cnt = (s) => items.filter((i) => i.status === s).length;
      const c1 = items.find((i) => i.id === 'c1');
      const b = blocking();
      const grid = (i) => `<div class="p1-cmp">${[['方案', i.proposal], ['报价', i.quote], ['合同', i.contract]].map(([l, v]) => `<div class="c"><div class="l">${l}</div>${ui().chip(v, cmpTone(v), { sm: true })}</div>`).join('')}</div>`;
      const actions = (i) => {
        const a = [];
        if (i.status === '待处理') {
          a.push(ui().btn('补入报价 / 合同', { tone: 'secondary', size: 'xs', icon: 'edit', onclick: `S_P1.fixCommit('${i.id}')` }));
          a.push(ui().btn('授权例外', { tone: 'ghost', size: 'xs', icon: 'shield', onclick: `S_P1.exceptCommit('${i.id}')` }));
        }
        if (i.status === '无法判定') a.push(ui().btn('人工核对', { tone: 'secondary', size: 'xs', icon: 'eye-off', onclick: `S_P1.manualCheck('${i.id}')` }));
        return a.length ? `<div class="row gap6 mt8 wrap">${a.join('')}</div>` : '';
      };
      return `
        ${ui().p1Banner()}
        <div class="card">
          <div class="row between"><div><div class="card-title" style="margin:0">${App.esc(st ? st.name : '')}</div><div class="card-sub">${App.esc(opp ? opp.service + ' · ' + opp.kind : '')} · 方案 v1 · 报价 v2（待审批）· 合同草稿</div></div>${opp ? ui().stageChip(opp.stage) : ''}</div>
          <div class="mt12">${ui().kpis([
            { label: '待处理', value: cnt('待处理'), tone: cnt('待处理') ? 'danger' : '' },
            { label: '一致 / 已消除', value: cnt('一致') + cnt('已修改消除') + cnt('有理由例外批准'), tone: 'brand' },
            { label: '无法判定', value: cnt('无法判定'), tone: cnt('无法判定') ? 'warn' : '' },
          ])}</div>
        </div>
        ${c1 && c1.status === '待处理'
          ? ui().notice('danger', `<b>拜访承诺"一年两次风险勘查"：报价未计入、合同未包含</b><br>→ 重要差异未解决，阻断"确认正式版本 / 提交审批"。三处证据：拜访记录 9/1 · 报价 v2 · 合同草稿；受影响版本：报价 v2、合同草稿。`, 'alert')
          : (b.length ? ui().notice('warn', `仍有 ${b.length} 项重要差异待处理 / 待人工核对，提交仍被阻断。`, 'alert') : ui().notice('ok', '重要差异已解决或已获授权例外，可以提交审批；提交后再修改会使本差异报告失效。', 'check-circle'))}
        ${ui().section('承诺条目', `<span class="tiny">${items.length} 项 · 来源：拜访 / 方案沟通记录</span>`)}
        ${items.map((i) => `<div class="card p1-cmt ${i.id === 'c1' && i.status === '待处理' ? 'p1-hl' : ''}">
          <div class="row between top">
            <div class="grow"><div class="bold">${App.esc(i.what)}</div><div class="tiny muted mt4">${App.esc(i.who)} → ${App.esc(i.to)} · ${App.esc(App.fmt.md(i.when))} · ${App.esc(i.qty)}${i.paid !== '—' ? ' · ' + App.esc(i.paid) : ''}</div></div>
            <div class="col" style="align-items:flex-end">${ui().chip(i.status, stTone(i.status), { sm: true })}${ui().chip(i.level, i.level === '重要' ? 'warn' : 'gray', { sm: true })}</div>
          </div>
          <div class="p1-evid">${App.icon('doc', 12)}<span>证据：${App.esc(i.evidence)}</span></div>
          ${grid(i)}
          ${i.note ? `<div class="tiny mt8 ${i.status === '有理由例外批准' ? 'p1-note-info' : 'p1-note-ok'}">${App.esc(i.note)}</div>` : ''}
          ${actions(i)}
        </div>`).join('')}
        <div class="tiny muted" style="padding:0 4px 8px">差异状态：待处理 / 已修改消除 / 有理由例外批准 / 无法判定待人工核对。不存在证据不代表没有差异。仅能控制接入的流程；外部系统旁路须 IT 共同治理，不宣称全局阻断。</div>
      `;
    },
    footer() {
      const b = blocking();
      const submitted = P().commitments.submitted;
      return `<div class="p1-foot-note ${b.length ? 'bad' : 'ok'}">${App.icon(b.length ? 'alert' : 'check-circle', 13)}<span>${b.length ? `${b.length} 项重要差异未解决或待核对 · 阻断提交（U10）` : (submitted ? '已提交审批 · 内容再修改将使差异报告失效' : '重要差异已解决 / 已授权例外 · 可提交')}</span></div>${ui().btn(submitted ? '已提交审批' : '提交审批', { block: true, icon: 'send', disabled: !!b.length || !!submitted, onclick: 'S_P1.submitCommitments()' })}`;
    },
    demoActions: [{ label: '重置差异状态', icon: 'refresh', run() { P().commitments = App.clone(window.DATA.initial().p1.commitments); App.save(); App.refresh(); App.toast('差异状态已重置'); } }],
  });
  const commit = (id) => P().commitments.items.find((i) => i.id === id);
  S.fixCommit = function (id) {
    const i = commit(id); if (!i) return;
    if (id === 'c3') { i.quote = '60 天'; i.contract = '60 天'; i.note = '已修改消除：报价 v3 / 合同草稿账期改为 60 天（非标账期转指定审核）'; }
    else { i.quote = '已计入'; i.contract = '已包含'; i.note = '已修改消除：补入报价 v3 与合同草稿 · 产生新版本，需重新审批'; }
    i.status = '已修改消除';
    App.save(); App.refresh();
    App.toast('已补入 · 产生新版本，需重新审批', { icon: 'check-circle' });
  };
  S.exceptCommit = function (id) {
    if (!isApprover()) { App.toast('需授权人（主管 / 审批角色）操作', { icon: 'lock' }); return; }
    const i = commit(id); if (!i) return;
    App.prompt('例外理由（授权人）', '例如：勘查为免费增值服务，成本已在合同外承担', (r) => {
      i.status = '有理由例外批准'; i.note = `有理由例外批准：${r || '未填写理由'} · 周明远 ${App.fmt.md(App.TODAY)}`;
      App.save(); App.refresh(); App.toast('已记录例外批准与理由', { icon: 'shield' });
    });
  };
  S.manualCheck = function (id) {
    const i = commit(id); if (!i) return;
    App.sheet({
      title: '人工核对结果 · ' + i.what,
      items: [
        { label: '已包含 · 一致', sub: '人工确认报价与合同已含该项', icon: 'check-circle', onSelect() { i.status = '一致'; i.quote = '已包含（人工）'; i.contract = '已包含（人工）'; i.note = `人工核对 ${App.fmt.md(App.TODAY)}：一致（${App.me().name}）`; App.save(); App.refresh(); App.toast('已记录人工核对结果'); } },
        { label: '存在差异 · 转待处理', sub: '报价 / 合同未包含该项', icon: 'alert', danger: true, onSelect() { i.status = '待处理'; i.quote = '未计入'; i.contract = '未包含'; i.note = ''; App.save(); App.refresh(); App.toast('已转为待处理'); } },
      ],
    });
  };
  S.submitCommitments = function () {
    if (blocking().length) { App.toast('存在未解决的重要差异，不能提交', { icon: 'lock' }); return; }
    P().commitments.submitted = true;
    App.save(); App.refresh();
    App.toast('已提交审批（演示）· 差异报告随版本冻结', { icon: 'send' });
  };

  /* ============================================================
     p1-contract  合同一键生成与审批接入
     ============================================================ */
  function contractSync() {
    const c = P().contract;
    if (c.current <= 2) { c.current = blocking().length ? 1 : 2; c.status = c.rejected ? '已驳回' : c.steps[c.current]; }
  }
  const contractChip = (c) => ui().chip(c.status, ({ 草稿: 'gray', 差异待处理: 'danger', 可提交: 'info', 审批中: 'warn', 已批准: 'ok', 已驳回: 'danger', 待签署: 'brand', 已签署: 'ok', 已撤回: 'gray' }[c.status] || 'gray'));

  App.register('p1-contract', {
    title: '合同生成与审批', tab: 'me',
    prd: ['F11 合同生成与审批接入', 'U11 重复发起不重复审批', '10.2 稳定请求 ID 去重'],
    rules: ['一键审批 = 一键发起指定审批，不是自动通过', '无审批接口只能"待人工提交"', '同一请求标识不重复发起', '已批准 ≠ 已签署，签署由权威系统事件更新', '非标条款转指定审核，AI 不改写'],
    render() {
      ensure(); contractSync();
      const c = P().contract;
      const canSubmit = c.current === 2 && c.approvalApi;
      const btns = [];
      if (c.current <= 2) btns.push(ui().btn(c.generated ? '重新生成草稿' : '一键生成草稿', { tone: 'secondary', icon: 'template', onclick: 'S_P1.genContract()' }));
      if (c.current <= 2) btns.push(c.approvalApi ? ui().btn('提交审批', { icon: 'send', onclick: 'S_P1.submitContract()' }) : ui().btn('待人工提交', { tone: 'ghost', icon: 'hand', disabled: true }));
      if (c.current === 3) { btns.push(ui().btn('撤回', { tone: 'ghost', icon: 'x', onclick: 'S_P1.withdrawContract()' })); btns.push(ui().btn('提交审批', { icon: 'send', onclick: 'S_P1.submitContract()' })); }
      const mgrBtns = c.current === 3 && isApprover() ? `<div class="btn-row mt8">${ui().btn('驳回', { tone: 'danger', size: 'sm', onclick: 'S_P1.approveContract(false)' })}${ui().btn('批准（审批角色）', { size: 'sm', onclick: 'S_P1.approveContract(true)' })}</div>` : '';
      return `
        ${ui().p1Banner()}
        <div class="card">
          <div class="row between"><div class="card-title" style="margin:0">合同草稿</div>${contractChip(c)}</div>
          ${ui().kv([
            ['模板', `${App.esc(c.template)} ${ui().chip('已批准模板', 'brand', { sm: true })}`],
            ['合同主体', App.esc(c.entity)],
            ['请求标识', `<span class="num" style="font-family:var(--mono);font-size:12.5px">${App.esc(c.requestId)}</span>`],
            ['审批接口', c.approvalApi ? ui().chip('已接入（发起 + 状态）', 'ok', { sm: true }) : ui().chip('待人工提交', 'warn', { sm: true, icon: 'hand' })],
          ])}
        </div>
        <div class="card">
          <div class="card-title">状态机</div>
          ${ui().stepper(c.steps, c.current, { error: c.status === '已驳回' })}
          ${c.current === 1 ? ui().notice('danger', `差异待处理：${blocking().map((i) => App.esc(i.what)).join('、')} · 处理或授权例外后才可提交 <a class="link" onclick="App.go('p1-commitments')">去处理</a>`, 'alert') : ''}
          ${c.status === '已驳回' ? ui().notice('danger', `已驳回：${App.esc(c.rejectReason || '未填写')} · 修改后重新走流程`, 'alert') : ''}
          ${c.current === 4 ? ui().notice('ok', '已批准 ≠ 已签署；签署结果由权威系统事件更新，签约不等于回款。', 'check-circle') : ''}
          <div class="btn-row mt12">${btns.join('')}</div>${mgrBtns}
          <div class="tiny muted mt8">"一键审批"= 一键发起指定审批，不是自动通过；多次点击使用同一请求标识，不产生重复审批。${c.approvalApi ? '' : '当前无审批发起接口，只能标为"待人工提交"，不得显示已提交。'}</div>
        </div>
        ${ui().section('可变内容与来源')}
        <div class="card">
          ${c.fields.map((f) => `<div class="p1-line"><span class="k">${App.esc(f.k)}</span><span class="v"><span class="${f.src === '差异' ? 'me-err' : ''}">${App.esc(f.v)}</span> ${ui().chip(f.src, srcTone(f.src), { sm: true })}</span></div>`).join('')}
          <div class="divider"></div>
          <div class="p1-line"><span class="k">非标条款</span><span class="v">客户要求 60 天账期 ${ui().chip('转指定审核', 'warn', { sm: true })}</span></div>
          <div class="tiny muted mt8">按模板填充可变内容；非标条款进入指定审核流程，不由 AI 擅自改写。合同引用最新批准的报价版本。</div>
        </div>
        ${ui().section('状态变更记录')}
        <div class="card">${ui().timeline(c.log.map((l) => ({ time: l.t, title: App.esc(l.title), body: App.esc(l.body || ''), tone: l.tone || '' })))}</div>
        ${ui().notice('gray', '审批结果与签署结果分别由权威系统事件更新；回调重复和乱序不误改状态；非本系统权限的审批人不可在小程序代批。', 'shield')}
      `;
    },
    demoActions: [
      { label: '切换：有 / 无审批接口', icon: 'link', run() { const c = P().contract; c.approvalApi = !c.approvalApi; App.save(); App.refresh(); App.toast(c.approvalApi ? '已接入审批发起接口' : '无审批接口：只能待人工提交', { icon: 'link' }); } },
      { label: '模拟权威签署事件', icon: 'contract', run() { S.signEvent(); } },
      { label: '模拟重复 / 乱序回调', icon: 'refresh', run() { const c = P().contract; c.log.unshift({ t: NOW, title: '收到重复回调（已忽略）', body: `请求 ID ${c.requestId} · 旧序号不改状态`, tone: 'gray' }); App.save(); App.refresh(); App.toast('重复 / 乱序回调已忽略，状态不变', { icon: 'shield' }); } },
    ],
  });
  S.genContract = function () {
    const close = App.loading('按模板生成…');
    setTimeout(() => {
      close();
      const c = P().contract; c.generated = true;
      c.log.unshift({ t: NOW, title: '一键生成草稿', body: '按模板 v2026.1 填充可变内容；非标条款（60 天账期）转指定审核' });
      App.save(); App.refresh();
      App.toast('已按模板填充可变内容；非标条款转指定审核', { icon: 'template', duration: 2200 });
    }, 800);
  };
  S.submitContract = function () {
    const c = P().contract; contractSync();
    if (!c.approvalApi) { App.toast('无审批接口：只能标为待人工提交', { icon: 'hand' }); return; }
    if (c.current === 1) {
      App.modal({ title: '无法提交', body: '存在未解决的重要差异（承诺一致性），本系统阻断"确认正式版本 / 提交审批"。', actions: [{ label: '关闭' }, { label: '去处理差异', tone: 'primary', onClick: () => App.go('p1-commitments') }] });
      return;
    }
    if (c.current >= 3) { App.toast('同一请求标识，不重复发起', { icon: 'shield' }); return; }
    c.current = 3; c.status = '审批中'; c.rejected = false;
    c.log.unshift({ t: NOW, title: '发起指定审批', body: `请求 ID ${c.requestId} · 审批人：区域经理 → 财务 · 非自动通过` });
    App.save(); App.refresh();
    App.toast('已发起指定审批（不是自动通过）', { icon: 'send' });
  };
  S.withdrawContract = function () {
    App.confirm('撤回审批', '撤回后回到"可提交"，再次提交将使用新的请求标识。', () => {
      const c = P().contract; c.current = 2; c.status = '已撤回';
      c.requestId = 'REQ-20260907-00' + (32 + c.log.length);
      c.log.unshift({ t: NOW, title: '已撤回', body: '回到可提交；新的请求标识 ' + c.requestId, tone: 'gray' });
      App.save(); App.refresh(); App.toast('已撤回');
    }, '撤回');
  };
  S.approveContract = function (ok) {
    if (!isApprover()) { App.toast('仅审批角色可操作'); return; }
    const c = P().contract;
    if (ok) {
      c.current = 4; c.status = '已批准';
      c.log.unshift({ t: NOW, title: '审批通过（审批系统回调）', body: '已批准 ≠ 已签署；等待权威签署事件' });
      App.save(); App.refresh(); App.toast('已批准 · 等待签署事件', { icon: 'check-circle' });
    } else {
      App.prompt('驳回原因', '例如：账期需财务批准', (r) => {
        c.current = 2; c.status = '已驳回'; c.rejected = true; c.rejectReason = r || '未填写';
        c.log.unshift({ t: NOW, title: '审批驳回', body: c.rejectReason + ' · 修改后重新走流程', tone: 'warn' });
        App.save(); App.refresh(); App.toast('已驳回');
      });
    }
  };
  S.signEvent = function () {
    const c = P().contract;
    if (c.current === 4) { c.current = 5; c.status = '待签署'; c.log.unshift({ t: NOW, title: '已发出签署（权威系统事件）', body: '等待客户签署回执' }); }
    else if (c.current === 5) { c.current = 6; c.status = '已签署'; c.log.unshift({ t: NOW, title: '签署完成（权威签约事件）', body: '商机赢单由该事件驱动，不由按钮设置；签约 ≠ 回款' }); }
    else { App.toast('需先到"已批准"状态（审批角色批准）', { icon: 'info' }); return; }
    App.save(); App.refresh(); App.toast(c.status, { icon: 'contract' });
  };

  /* ============================================================
     p1-service  履约 / 回款 / 续约摘要
     ============================================================ */
  const SERVICE_HISTORY = {
    s_jia: [
      { time: '2026-09-05', tag: '财务', title: 'Q3 服务费已开票，未回款', body: '财务系统 9/5 · 签约 / 开票不等于回款', tone: 'warn' },
      { time: '2026-09-03', tag: '客诉', title: '客户反馈后厨仍见蟑螂活动', body: '服务部已派单复处理 · 服务系统 9/7 08:30', tone: 'warn' },
      { time: '2026-08-28', tag: '回访', title: '客户反映蟑螂问题反复，已转服务部', body: '拜访记录 8/28 · 刘晓芸' },
      { time: '2026-06 – 08', tag: '服务', title: '月度服务按计划执行（3/3 次）', body: '服务系统记录 · 客户签收' },
      { time: '2025-12-05', tag: '交接', title: '首服交接完成，技术已接收', body: '交接包：合同 / 承诺清单 / 服务范围 / 联系人' },
    ],
  };
  const HANDOVER_FIELDS = ['合同', '承诺清单', '服务范围', '联系人'];
  function addDays(s, n) { const d = App.dayjs(s); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  const coopLabel = (c) => ({ active: '服务中', paused: '停做', none: '未合作' }[c] || c);

  App.register('p1-service', {
    title: '履约 / 回款 / 续约', tab: 'me',
    prd: ['F12 履约、回款、续约及 KA 经营', 'U12 服务中客户续约', '6.1 三组状态分开'],
    rules: ['只接入销售需要的服务摘要，源系统执行动作', '字段缺失不能标交接完成', '续约与增购分开立项', '签约不等于回款', '服务异常有来源与更新时间'],
    render(params) {
      ensure();
      const sid = params.storeId || P().service.storeId;
      const st = App.store(sid);
      if (!st) return ui().empty({ icon: 'store', title: '未找到门店' });
      const isDemo = sid === P().service.storeId;
      const days = st.contractEnd ? App.fmt.days(st.contractEnd) : null;
      const items = isDemo ? P().service.items : [
        { k: '首服交接', v: st.coop === 'active' ? `已完成 · ${st.since}` : '未开始', tone: st.coop === 'active' ? 'ok' : '' },
        { k: '服务状态', v: coopLabel(st.coop) + (st.services.length ? ' · ' + st.services.join('、') : ''), tone: st.coop === 'active' ? 'ok' : st.coop === 'paused' ? 'danger' : '' },
        { k: '未结客诉', v: { open: '有未结客诉', none: '近 90 天无未结客诉', closed: '客诉已结', not_connected: '客诉未接入', stale: '数据待更新' }[st.complaint.status] || '—', tone: { open: 'danger', stale: 'warn', not_connected: '' }[st.complaint.status] || 'ok' },
        { k: '合同结束日', v: st.contractEnd ? `${st.contractEnd}（${days} 天后${days <= 90 ? '，进入续约窗口' : ''}）` : '无合同', tone: days != null && days <= 90 ? 'warn' : '' },
        { k: '回款状态', v: '未接入（财务系统）', tone: '' },
        { k: '数据时间', v: `服务系统 ${App.esc(st.updatedAt)}`, tone: '' },
      ];
      const renewOpp = App.oppsOf(sid).find((o) => o.kind === '续约');
      const addOpps = App.oppsOf(sid).filter((o) => o.kind === '增购');
      const taskDate = st.contractEnd ? addDays(st.contractEnd, -90) : null;
      const missingHandover = P().service.flags.handoverMissing || st.coop !== 'active';
      const handoverMissing = missingHandover ? (st.coop === 'active' ? ['联系人'] : ['承诺清单', '服务范围', '联系人']) : [];
      const history = SERVICE_HISTORY[sid] || [
        st.lastVisit ? { time: st.lastVisit.date, tag: st.lastVisit.type, title: App.esc(st.lastVisit.result), body: App.esc(st.lastVisit.by) } : null,
        st.complaint.summary ? { time: st.complaint.date, tag: '客诉', title: App.esc(st.complaint.summary), tone: 'warn' } : null,
      ].filter(Boolean);
      return `
        ${ui().p1Banner()}
        <div class="card">
          <div class="row between top"><div class="grow"><div class="card-title" style="margin:0">${App.esc(st.name)}</div><div class="card-sub">${App.esc(st.type)} · ${App.esc(st.address)}</div></div>${ui().coopChip(st.coop)}</div>
          <div class="chips mt8">${ui().complaintChip(st.complaint)}${st.contractEnd ? ui().chip(`合同至 ${App.fmt.md(st.contractEnd)}`, days <= 90 ? 'warn' : 'gray', { icon: 'calendar' }) : ''}</div>
        </div>
        ${st.complaint.status === 'open' ? ui().notice('danger', '未结客诉优先：先了解 / 协调服务问题，再谈续约；AI 不建立额外收费商机。', 'alert') : ''}
        ${ui().section('服务摘要', `<span class="tiny">源系统执行派单 / 服务 / 财务</span>`)}
        <div class="card">${items.map((it) => `<div class="p1-line"><span class="k">${App.esc(it.k)}</span><span class="v"><i class="p1-dot ${it.tone || 'gray'}"></i>${App.esc(it.v)}</span></div>`).join('')}
          <div class="tiny muted mt8">摘要按字段映射接入，仅显示销售需要的内容；服务异常带来源与更新时间。</div></div>

        ${ui().section('续约窗口')}
        <div class="card">
          ${st.contractEnd ? `${ui().kv([
            ['合同到期', `${App.esc(st.contractEnd)} ${ui().chip(`${days} 天后`, days <= 90 ? 'warn' : 'gray', { sm: true })}`],
            ['续约任务', `建议 ${App.esc(App.fmt.md(taskDate))} 创建（到期前 90 天窗口，经确认）`],
            ['续约商机', renewOpp ? `${ui().stageChip(renewOpp.stage)} ${ui().tierChip(renewOpp.tier, { sm: true })} <span class="tiny muted">${App.esc(renewOpp.service)}</span>` : ui().chip('未立项', 'gray', { sm: true })],
            ['增购商机', addOpps.length ? addOpps.map((o) => `${App.esc(o.service)} ${ui().stageChip(o.stage)}`).join('<br>') : '<span class="muted">无（与续约分开立项）</span>'],
          ])}
          <div class="mt12">${renewOpp
            ? ui().btn('查看续约商机', { tone: 'secondary', block: true, icon: 'trend', onclick: `App.go('opportunity',{id:'${renewOpp.id}'})` })
            : ui().btn('新建续约商机', { block: true, icon: 'plus', onclick: `S_P1.createRenewal('${sid}')` })}</div>
          <div class="tiny muted mt8">续约与增购分开立项，避免把续约金额同时记为新增；服务中客户不会因新增商机丢单变成停做。</div>` : ui().empty({ icon: 'calendar', title: '无生效合同', sub: '续约窗口仅对服务中客户显示' })}
        </div>

        ${ui().section('首服交接包')}
        <div class="card">
          <div class="row between"><span class="small muted">销售从合同和承诺清单形成交接包</span>${handoverMissing.length ? ui().chip('待补齐', 'warn', { sm: true }) : ui().chip('已接收 · 技术 李工', 'ok', { sm: true, icon: 'check' })}</div>
          <div class="p1-hand mt8">${HANDOVER_FIELDS.map((f) => { const miss = handoverMissing.includes(f); return `<div class="h ${miss ? 'miss' : ''}">${App.icon(miss ? 'alert' : 'check-circle', 14)}<span>${f}</span><small>${miss ? '缺失' : '已提供'}</small></div>`; }).join('')}</div>
          ${handoverMissing.length ? `${ui().notice('warn', `字段缺失（${handoverMissing.join('、')}）不能标"交接完成"；补齐后由技术 / 服务确认接收。`, 'alert')}<div class="btn-row">${ui().btn('补充字段', { tone: 'secondary', size: 'sm', onclick: `S_P1.fillHandover('${sid}')` })}${ui().btn('标记交接完成', { size: 'sm', disabled: true })}</div>`
            : `<div class="tiny muted mt8">${isDemo ? '2025-12-05 技术确认接收；' : ''}交接完成需技术 / 服务确认，字段缺失不能标完成。</div>`}
        </div>

        ${ui().section('历史服务与客户反馈')}
        <div class="card">
          ${history.length ? ui().timeline(history) : ui().empty({ icon: 'history', title: '暂无服务记录' })}
          <div class="p1-line"><span class="k">价格变化</span><span class="v muted">${ui().chip('未接入', 'gray', { sm: true, icon: 'cloud-off' })} 成本 / 价格变化证据待财务接口</span></div>
        </div>
      `;
    },
    demoActions: [{ label: '切换：交接包缺字段', icon: 'alert', run() { const f = P().service.flags; f.handoverMissing = !f.handoverMissing; App.save(); App.refresh(); App.toast(f.handoverMissing ? '已模拟：联系人字段缺失' : '交接包字段已补齐'); } }],
  });
  S.createRenewal = function (sid) {
    const st = App.store(sid); if (!st) return;
    if (App.oppsOf(sid).some((o) => o.kind === '续约')) { App.toast('已有续约商机，不重复创建'); App.refresh(); return; }
    const me = App.me();
    const svc = (st.services[0] || '有害生物防治').replace(/（.*$/, '');
    const o = { id: App.uid('o_renew'), storeId: sid, service: svc, kind: '续约', stage: '待触达', tier: 'unknown', tierSource: `新建 · ${App.fmt.md(App.TODAY)}`, ownerId: me.id, ownerName: me.name, done: [], missing: ['续约条件与价格口径', '客户续约意向', '历史服务反馈'], ai: null, updatedAt: App.TODAY, source: '续约窗口（到期前 90 天）' };
    App.state.opportunities.push(o);
    if (!st.primaryOppId) st.primaryOppId = o.id;
    App.save(); App.refresh();
    App.toast('已新建续约商机 · 与增购分开立项', { icon: 'plus' });
  };
  S.fillHandover = function () {
    App.prompt('补充联系人（客户方对接人）', '例如：罗建平 店长 186****3301', (v) => {
      if (!v) { App.toast('未填写，字段仍缺失'); return; }
      P().service.flags.handoverMissing = false; App.save(); App.refresh(); App.toast('字段已补齐 · 待技术确认接收', { icon: 'check-circle' });
    });
  };

  /* ============================================================
     p1-ka-card  KA 客户经营卡（定性）
     ============================================================ */
  const KA_SITES = [{ id: 's_ka1', name: '张江工厂', region: '浦东' }, { id: 's_ka2', name: '南翔中央厨房', region: '嘉定' }, { id: null, name: '青浦冷链仓', region: '青浦', note: '未建档' }];
  const KA_LINES = ['有害生物防治', '卫生间深度清洁', '油烟 / 通风清洁'];
  const KA_ROLES = ['使用方', '决策人', '采购方', '财务 / 高层'];
  function lineState(siteId, line) {
    if (!siteId) return { k: 'blank' };
    const st = App.store(siteId); if (!st) return { k: 'blank' };
    const key = line.split(' ')[0];
    if (st.services.some((s) => s.startsWith(key))) return { k: 'active' };
    const o = App.oppsOf(siteId).find((x) => x.service.startsWith(key));
    if (o) return { k: 'opp', opp: o };
    return { k: 'blank' };
  }
  App.register('p1-ka-card', {
    title: 'KA 客户经营卡', tab: 'me',
    prd: ['6.5 从拜访数量到经营动作', 'F12 KA 经营', '6.3 KA Playbook 增补'],
    rules: ['四块内容均为定性呈现', '潜力不用收入替代，关系深度不用拜访次数替代', '服务线空白只是可能机会，须确认需求后立商机', '子合同明细按授权汇总，不因集团关系开放所有区域'],
    render(params) {
      ensure();
      const st = App.store(params.storeId || 's_ka1') || App.store('s_ka1');
      const group = st.group || { name: st.name, entity: st.name, sites: 1 };
      const sites = st.group ? KA_SITES : [{ id: st.id, name: st.name, region: st.district }];
      const contacts = [];
      sites.forEach((s) => { if (!s.id) return; const x = App.store(s.id); (x.contacts || []).forEach((c) => { if (!contacts.some((y) => y.name === c.name)) contacts.push(Object.assign({ site: s.name }, c)); }); });
      const byRole = (r) => contacts.filter((c) => c.decision === r);
      const opps = sites.flatMap((s) => (s.id ? App.oppsOf(s.id) : []));
      const blockingCnt = st.group ? blocking().length : 0;
      const ka2 = App.store('s_ka2');
      const ends = sites.map((s) => s.id && App.store(s.id)).filter((x) => x && x.contractEnd).map((x) => x.contractEnd).sort();
      const nextEnd = ends[0];
      const cellHtml = (s, line) => {
        const r = lineState(s.id, line);
        if (r.k === 'active') return `<td>${ui().chip('服务中', 'brand', { sm: true, dot: true })}</td>`;
        if (r.k === 'opp') return `<td onclick="App.go('opportunity',{id:'${r.opp.id}'})" class="pressable">${ui().chip('商机中', 'info', { sm: true })}<div class="tiny muted mt4">${App.esc(r.opp.stage)}</div></td>`;
        return `<td class="pressable" onclick="S_P1.blankTap('${App.esc(s.name)}','${App.esc(line)}')">${ui().chip('空白', 'outline', { sm: true })}</td>`;
      };
      return `
        ${ui().p1Banner()}
        <div class="card">
          <div class="row between top"><div class="grow"><div class="card-title" style="margin:0">${App.esc(group.name)}</div><div class="card-sub">${App.esc(group.entity)} · ${group.sites} 个可服务场所</div></div>${ui().chip('定性经营卡', 'violet', { sm: true })}</div>
          <div class="chips mt8">${ui().chip(`${contacts.length} 位关键人`, 'gray', { sm: true, icon: 'users' })}${ui().chip(`${opps.length} 个商机`, 'info', { sm: true, icon: 'trend' })}${blockingCnt ? ui().chip(`${blockingCnt} 项承诺差异`, 'danger', { sm: true, icon: 'alert' }) : ''}</div>
        </div>

        ${ui().section('关系覆盖', `<span class="tiny">按决策角色</span>`)}
        <div class="card">${KA_ROLES.map((r) => { const cs = byRole(r); return `<div class="p1-line"><span class="k">${r}</span><span class="v">${cs.length ? cs.map((c) => `<span class="p1-person">${App.esc(c.name)} <small>${App.esc(c.role)} · ${App.esc(c.site)}</small> ${c.verified ? ui().chip('已核实', 'ok', { sm: true }) : ui().chip('待核实', 'warn', { sm: true })}</span>`).join('') : ui().chip('未覆盖', 'danger', { sm: true })}</span></div>`; }).join('')}
          <div class="tiny muted mt8">关系深度不用拜访次数替代；待核实联系人来自客户介绍或口述，不填造。</div></div>

        ${ui().section('可服务门店及服务线空间')}
        <div class="card flush" style="padding:10px 6px">
          <table class="table p1-matrix"><thead><tr><th>场所</th>${KA_LINES.map((l) => `<th>${App.esc(l)}</th>`).join('')}</tr></thead><tbody>
            ${sites.map((s) => `<tr><td><div class="bold">${App.esc(s.name)}</div><div class="tiny muted">${App.esc(s.region)}${s.note ? ' · ' + App.esc(s.note) : ''}</div></td>${KA_LINES.map((l) => cellHtml(s, l)).join('')}</tr>`).join('')}
          </tbody></table>
          <div class="tiny muted" style="padding:6px 8px 2px">空白 = 可能机会，需确认需求后立商机；不据此自动创建商机。潜力不用现有收入替代。</div>
        </div>

        ${ui().section('实际交付质量')}
        <div class="card">
          ${ka2 && st.group ? `${ui().kv([
            ['南翔中央厨房', `${ui().chip('服务中', 'brand', { sm: true, dot: true })} 月度服务按计划 8/8 次`],
            ['客诉', `${ui().complaintChip(ka2.complaint) || ui().chip('近 90 天无未结客诉', 'ok', { sm: true })} <span class="tiny muted">服务系统 9/7 08:30</span>`],
            ['客户反馈', `${App.esc(ka2.lastVisit.date.slice(5))} 回访：${App.esc(ka2.lastVisit.result)}`],
            ['张江工厂', `${ui().chip('未合作', 'gray', { sm: true, dot: true })} 9/1 勘查完成：仓库 3 处鼠迹，AIB 审核要求明确`],
          ])}` : ui().kv([['服务状态', coopLabel(st.coop)], ['客诉', ui().complaintChip(st.complaint) || '—'], ['客户反馈', st.lastVisit ? App.esc(st.lastVisit.result) : '—']])}
          <div class="tiny muted mt8">来源：服务系统 / 拜访记录；服务 / 客诉摘要不替代源系统。</div>
        </div>

        ${ui().section('续约风险', `<span class="tiny">定性</span>`)}
        <div class="card">
          ${[
            nextEnd ? { k: '合同到期', v: `${nextEnd}（${App.fmt.days(nextEnd)} 天后）`, tone: App.fmt.days(nextEnd) <= 90 ? 'warn' : 'gray' } : null,
            { k: '客诉', v: ka2 && ka2.complaint.status === 'none' ? '无未结客诉（服务系统 9/7）' : '见交付质量', tone: 'ok' },
            { k: '承诺差异', v: blockingCnt ? `${blockingCnt} 项重要差异待处理（张江报价 v2 / 合同草稿）` : '无待处理差异', tone: blockingCnt ? 'danger' : 'ok', go: 'p1-commitments' },
            { k: '时间压力', v: 'AIB 审核 2026-11 前（客户要求）', tone: 'warn' },
          ].filter(Boolean).map((r) => `<div class="p1-line ${r.go ? 'pressable' : ''}" ${r.go ? `onclick="App.go('${r.go}')"` : ''}><span class="k">${r.k}</span><span class="v"><i class="p1-dot ${r.tone}"></i>${App.esc(r.v)}${r.go ? App.icon('chevron-right', 14, 'muted') : ''}</span></div>`).join('')}
          <div class="tiny muted mt8">四象限量化待样本验证，当前只做定性呈现，不输出评分或排名。</div>
        </div>
        ${ui().notice('gray', '子合同明细按授权汇总，不因集团关系开放所有区域数据：华南子公司（非授权范围）不展示。', 'lock')}
      `;
    },
  });
  S.blankTap = function (site, line) {
    App.sheet({
      title: `${site} · ${line} · 服务线空白`,
      items: [
        { label: '记录待确认需求', sub: '不立商机；下次拜访确认需求后再立项', icon: 'edit', onSelect: () => App.toast('已记录待确认需求（不立商机）', { icon: 'edit' }) },
        { label: '确认需求后新建商机', sub: '需有客户确认的需求证据', icon: 'plus', onSelect: () => App.toast('请先在拜访记录中确认需求', { icon: 'info' }) },
      ],
    });
  };

  /* ============================================================
     p1-pest  虫害拍照辅助识别
     ============================================================ */
  App.register('p1-pest', {
    title: '虫害辅助识别', tab: 'me',
    prd: ['F13 虫害拍照辅助识别', 'U13 模糊 / 未支持虫害照片'],
    rules: ['返回候选、依据、图片质量、知识来源', '无法识别明确返回未知，不强制唯一答案', '习性 / 来源 / 危害仅引用审核知识库', '照片不推定侵害程度、服务频次或报价', '候选不自动写成已确认勘查结论'],
    render() {
      ensure();
      const pest = P().pest;
      const cur = pest.result ? pest.samples.find((s) => s.id === pest.result) : null;
      const tiles = pest.samples.map((s) => `<div class="p1-sample pressable ${cur && cur.id === s.id ? 'sel' : ''}" onclick="S_P1.identify('${s.id}')">${ui().scene(s.kind, s.label)}<div class="p1-sample-foot"><span>${cur && cur.id === s.id ? '已识别' : '点击识别'}</span>${App.icon(cur && cur.id === s.id ? 'check-circle' : 'scan', 14)}</div></div>`).join('');
      let result = '';
      if (cur && !cur.unknown) {
        result = `
          <div class="ai-card">
            <div class="ai-head"><div class="ai-logo">${App.icon('sparkle', 15)}</div><div class="grow"><div class="t">候选识别结果</div><div class="m">派生数据 · 不写入勘查结论 · ${App.esc(cur.label)}</div></div>${ui().chip('候选', 'ai', { sm: true })}</div>
            <div class="ai-body">
              ${cur.candidates.map((c) => `<div class="p1-conf"><span class="n">${App.esc(c.name)}</span><div class="b"><i style="width:${Math.round(c.conf * 100)}%"></i></div><span class="p">${Math.round(c.conf * 100)}%</span></div>`).join('')}
              ${ui().kv([['判断依据', App.esc(cur.basis)], ['图片质量', ui().chip(cur.quality, 'ok', { sm: true })], ['建议补充', App.esc(cur.knowledge.advice)]])}
            </div>
            <div class="ai-note">${App.icon('info', 12)}候选识别 · 非勘查结论 · 专业处置由技术复核</div>
          </div>
          <div class="card">
            <div class="row between"><div class="card-title" style="margin:0">审核知识引用</div>${ui().chip('已发布', 'brand', { sm: true })}</div>
            ${ui().kv([['习性', App.esc(cur.knowledge.habits)], ['危害', App.esc(cur.knowledge.harm)], ['来源', `${App.icon('doc', 12)} ${App.esc(cur.knowledge.source)}`]])}
            <div class="tiny muted mt8">仅引用审核知识库；不据此推定侵害程度、服务频次或报价。</div>
          </div>
          <div class="btn-row">${ui().btn('加入拜访记录（作为候选）', { tone: 'secondary', size: 'sm', icon: 'plus', onclick: 'S_P1.addCandidate()' })}${ui().btn('申请技术复核', { size: 'sm', icon: 'coach', onclick: 'S_P1.techReview()' })}</div>`;
      } else if (cur && cur.unknown) {
        result = `
          <div class="card p1-unknown">
            <div class="row between"><div class="card-title" style="margin:0">无法识别（未知）</div>${ui().chip('未知', 'gray', { sm: true, icon: 'question' })}</div>
            ${ui().kv([['图片质量', ui().chip(cur.quality, 'warn', { sm: true })], ['候选', '<span class="muted">不强制给出唯一答案</span>']])}
            ${ui().notice('gray', App.esc(cur.advice), 'camera')}
            <div class="btn-row">${ui().btn('补拍', { tone: 'secondary', size: 'sm', icon: 'camera', onclick: 'S_P1.retake()' })}${ui().btn('人工协助', { size: 'sm', icon: 'hand', onclick: 'S_P1.humanHelp()' })}</div>
          </div>`;
      }
      return `
        ${ui().p1Banner('包 B / P1 预览 · 受控试点：技术团队提供样本与审核知识，验收未通过只开放人工辅助入口')}
        <div class="card">
          <div class="row between"><div class="card-title" style="margin:0">拍照识别（受控试点）</div>${ui().chip('人工辅助', 'ai', { sm: true, icon: 'sparkle' })}</div>
          <div class="small muted">候选识别 · 非勘查结论 · 专业处置由技术复核</div>
          <div class="p1-ctx mt8">${App.icon('store', 13)}<span>关联客户：金牌烤鸭店 · 方案沟通（共享客户上下文，不自动写入勘查结论）</span></div>
        </div>
        ${ui().section('样本照片', `<span class="tiny">点击运行识别</span>`)}
        <div class="grid2 mb12">${tiles}</div>
        ${result || ui().empty({ icon: 'bug', title: '选择一张样本照片', sub: '识别只返回候选与依据；无法识别时明确返回未知' })}
        ${ui().notice('warn', '照片不推定现场侵害程度、服务频次或报价；候选识别不自动写成已确认勘查结论。', 'alert')}
      `;
    },
    demoActions: [{ label: '清除识别结果', icon: 'refresh', run() { P().pest.result = null; App.save(); App.refresh(); } }],
  });
  S.identify = function (id) {
    const close = App.loading('识别中…');
    setTimeout(() => { close(); P().pest.result = id; App.save(); App.refresh(); }, 1000);
  };
  S.addCandidate = function () { App.toast('已作为候选写入拜访草稿 · 不是已确认勘查结论', { icon: 'edit', duration: 2200 }); };
  S.techReview = function () {
    const cur = P().pest.samples.find((s) => s.id === P().pest.result);
    const top = cur && cur.candidates[0];
    App.go('tech-request', { q: `虫害候选识别复核：${top ? top.name + ' ' + Math.round(top.conf * 100) + '%' : ''}（${cur ? cur.label : ''}）` });
  };
  S.retake = function () { App.toast('请靠近目标、打光后补拍（演示）', { icon: 'camera' }); };
  S.humanHelp = function () { App.go('tech-request', { q: '虫害照片无法识别（仓库 · 模糊），申请人工协助' }); };
})();
