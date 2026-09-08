/* ============================================================
   字段确认 / 归档选商机 / 留痕记录详情（deck p16–17：16＋4 字段 · 两道闸门 · 归档后选商机）
   页面：confirm(storeId, version?) · archive(storeId, version?) · visit-detail(id)
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_CONFIRM = {};
  const D = window.DATA;
  const esc = (s) => App.esc(s);
  const ui = () => App.ui;
  const DIMS = ['逻辑结构', '事实细节', '客户原声/证据', '沟通结论', '表达清晰度'];
  const PHASES = ['录音', '结构化', '确认', '归档'];
  const th = () => (App.state.settings && App.state.settings.threshold) || 60;
  const weights = () => (App.state.settings && App.state.settings.weights) || { 逻辑结构: 20, 事实细节: 25, '客户原声/证据': 20, 沟通结论: 20, 表达清晰度: 15 };

  App.css('confirm', `
    .cf-store{display:flex;align-items:center;gap:10px}
    .cf-store .n{font-size:17px;font-weight:700} .cf-store-m{font-size:12.5px;color:var(--ink-3);margin-top:3px}
    .cf-score{display:flex;gap:14px;align-items:center}
    .cf-dims{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px}
    .cf-dim{display:grid;grid-template-columns:82px 1fr 42px;gap:8px;align-items:center;font-size:12.5px}
    .cf-dim .l{text-align:right;color:var(--ink-2);white-space:nowrap} .cf-dim .b{height:12px;border-radius:6px;background:var(--surface-3);overflow:hidden}
    .cf-dim .b i{display:block;height:100%;border-radius:6px;transition:width .3s ease} .cf-dim .b i.ok{background:var(--ok)} .cf-dim .b i.warn{background:var(--warn)} .cf-dim .b i.bad{background:var(--danger)}
    .cf-dim .v{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2)}
    .cf-advice{background:var(--surface-3);border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.55;margin-top:12px;color:var(--ink-2)} .cf-advice b{color:var(--ink)}
    .cf-fix{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
    .cf-fix button{height:32px;padding:0 12px;border-radius:999px;font-size:12.5px;font-weight:600;background:var(--ai-soft);color:var(--ai);display:inline-flex;align-items:center;gap:4px}
    .cf-fix button.done{background:var(--ok-soft);color:#15803d}
    .cf-gate{border-left:4px solid transparent} .cf-gate.fail{border-left-color:var(--warn)}
    .cf-kv{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:.5px solid var(--line);font-size:14px}
    .cf-kv:last-of-type{border-bottom:0} .cf-kv .k{color:var(--ink-2);flex:none} .cf-kv .v{text-align:right;min-width:0} .cf-kv .v.bad{color:var(--danger)} .cf-kv .v.good{color:var(--ok);font-weight:600}
    .cf-kv .k.b{font-weight:600;color:var(--ink)}
    .cf-hint{background:var(--danger-soft);color:#991b1b;border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.55;margin-top:10px}
    .cf-group{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 14px 8px;background:var(--surface);font-size:14.5px;font-weight:700}
    .cf-group .g-sub{font-size:11px;color:var(--ink-3);font-weight:400;margin-left:4px}
    .cf-legend{font-size:10.5px;color:var(--ink-3);font-weight:400;display:flex;gap:8px;align-items:center;white-space:nowrap}
    .cf-legend i{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:3px;vertical-align:middle;background:var(--brand)} .cf-legend i.auto{background:var(--ink-4)} .cf-legend i.miss{background:var(--warn)} .cf-legend i.manual{background:var(--ok)}
    .field-row.tap:active{background:var(--surface-2)} .field-row .fl .req{color:var(--danger);margin-left:2px}
    .field-row .src .dot.miss{background:var(--warn)} .field-row .fv .ed{display:inline-block;margin-left:6px;font-size:10px;color:#15803d;background:var(--ok-soft);border-radius:4px;padding:0 4px;vertical-align:middle}
    .cf-status{font-size:12.5px;margin-bottom:8px;display:flex;align-items:center;gap:6px} .cf-status.bad{color:var(--danger)} .cf-status.warn{color:var(--warn)} .cf-status.ok{color:var(--ok)}
    .cf-foot{display:flex;gap:8px} .cf-foot .btn{flex:none;padding:0 14px} .cf-foot .btn.primary{flex:1}
    .cf-quote{background:var(--surface-3);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.75;text-align:left;margin-top:8px;color:var(--ink-2)}
    .cf-quote .hw.q{background:#fde68a;color:#78350f}
    .cf-cur{display:flex;justify-content:space-between;gap:10px;font-size:13.5px;margin-top:10px;text-align:left} .cf-cur .k{color:var(--ink-3);flex:none}
    .cf-modal-ta{width:100%;min-height:76px;margin-top:10px;font-size:14px;line-height:1.5;padding:10px 12px;border-radius:10px;border:1px solid var(--line-2);background:var(--surface);resize:none;font-family:inherit}
    .cf-modal-ta:focus{outline:none;border-color:var(--brand)}
    .cf-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;text-align:left}
    .cf-chips span{font-size:12px;padding:4px 10px;border-radius:999px;background:var(--brand-soft);color:var(--brand-3);cursor:pointer}
    /* 归档页 */
    .ar-head{padding:8px 2px 12px} .ar-head .t{font-size:22px;font-weight:700;letter-spacing:-.01em;display:flex;align-items:center;gap:8px} .ar-head .s{font-size:13px;color:var(--ink-3);margin-top:4px}
    .ar-ok{width:30px;height:30px;border-radius:50%;background:var(--ok-soft);color:var(--ok);display:inline-flex;align-items:center;justify-content:center;flex:none}
    .ar-opt{position:relative} .ar-opt.rec{border:1.5px solid var(--brand);box-shadow:0 6px 18px rgba(30,91,216,.10)}
    .ar-opt .rec-tag{position:absolute;top:-1px;right:14px;background:var(--brand);color:#fff;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:0 0 8px 8px}
    .ar-form{display:flex;flex-direction:column;gap:0;margin-top:6px}
    .ar-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:.5px solid var(--line);font-size:14px} .ar-row:last-child{border-bottom:0}
    .ar-row label{width:88px;flex:none;color:var(--ink-2);font-size:13.5px}
    .ar-row input{flex:1;min-width:0;height:38px;border:1px solid var(--line-2);border-radius:10px;padding:0 10px;font-size:14px;background:var(--surface);font-family:inherit}
    .ar-row input:focus{outline:none;border-color:var(--brand)} .ar-row .ro{flex:1;color:var(--ink-2)}
    .ar-opp{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:.5px solid var(--line);cursor:pointer} .ar-opp:active{opacity:.7}
    .ar-opp .rd{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--line-2);flex:none} .ar-opp .n{font-size:14px;font-weight:600} .ar-opp .m{font-size:12px;color:var(--ink-3);margin-top:2px}
    .ar-result .cell-title{font-weight:600}
    .ar-list{margin-top:6px} .ar-item{display:flex;gap:10px;padding:8px 0;border-top:.5px solid var(--line);font-size:13px;align-items:flex-start} .ar-item:first-child{border-top:0}
    .ar-item .ic{width:26px;height:26px;border-radius:8px;background:var(--brand-soft);color:var(--brand);display:flex;align-items:center;justify-content:center;flex:none}
    .ar-item .ic.ai{background:var(--ai-soft);color:var(--ai)} .ar-item .m{color:var(--ink-3);font-size:12px;margin-top:1px}
    .ar-merge{background:var(--surface-3);border-radius:10px;padding:8px 10px;font-size:12px;color:var(--ink-2);margin-top:8px;display:flex;gap:6px;align-items:flex-start}
    /* 详情页 */
    .vd-audio{display:flex;align-items:center;gap:12px} .vd-play{width:40px;height:40px;border-radius:50%;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;flex:none;box-shadow:0 4px 12px rgba(30,91,216,.3)}
    .vd-wave{display:flex;align-items:center;gap:2px;height:30px;flex:1;min-width:0;overflow:hidden} .vd-wave i{width:3px;border-radius:2px;background:var(--brand);opacity:.75;flex:none}
    .vd-wave i.dim{opacity:.3} .vd-dur{font-size:12.5px;color:var(--ink-3);font-variant-numeric:tabular-nums;flex:none}
    .vd-text{font-size:14px;line-height:1.8;color:var(--ink-2)}
  `);

  /* ----------------------------------------------------------
     工具：热词高亮 / 原文定位高亮 / 下一步解析
     ---------------------------------------------------------- */
  function hl(text, words, cls) {
    let out = esc(text || '');
    const list = (words || []).filter(Boolean).map((w) => esc(w)).sort((a, b) => b.length - a.length);
    list.forEach((w) => { out = out.split(w).join(`<span class="hw ${cls || ''}">${w}</span>`); });
    return out;
  }
  function highlightQuote(text, quote, hot) {
    if (!quote || text.indexOf(quote) < 0) return hl(text, hot);
    const i = text.indexOf(quote);
    return hl(text.slice(0, i), hot) + `<span class="hw q">${esc(quote)}</span>` + hl(text.slice(i + quote.length), hot);
  }
  const WD = '日一二三四五六';
  function iso(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function cn2n(s) { const m = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }; if (/^\d+$/.test(s)) return +s; if (s === '十') return 10; if (s.length === 2 && s[0] === '十') return 10 + m[s[1]]; if (s.length === 2 && s[1] === '十') return m[s[0]] * 10; if (s.length === 3) return m[s[0]] * 10 + m[s[2]]; return m[s] || 0; }
  // 下一步硬校验：须同时有明确时间与明确动作；相对时间解析成日期回显
  S.parseNext = function (raw) {
    const text = String(raw || '').trim();
    const today = App.dayjs(App.TODAY);
    let date = null, matched = '', before = false;
    let m;
    if ((m = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日?/))) { date = new Date(2026, +m[1] - 1, +m[2]); matched = m[0]; }
    else if ((m = text.match(/(\d{1,2})[\/.](\d{1,2})/))) { date = new Date(2026, +m[1] - 1, +m[2]); matched = m[0]; }
    else if ((m = text.match(/下下?周([一二三四五六日天])/))) { const wd = m[1] === '天' ? 0 : WD.indexOf(m[1]); const base = new Date(today); base.setDate(base.getDate() + (m[0].startsWith('下下') ? 14 : 7) - base.getDay() + (wd === 0 ? 7 : wd)); date = base; matched = m[0]; }
    else if ((m = text.match(/(本周|这周|周|星期)([一二三四五六日天])/))) { const wd = m[2] === '天' ? 0 : WD.indexOf(m[2]); const base = new Date(today); let diff = (wd === 0 ? 7 : wd) - base.getDay(); if (diff <= 0) diff += 7; base.setDate(base.getDate() + diff); date = base; matched = m[0]; }
    else if ((m = text.match(/明天|后天|大后天/))) { const n = { 明天: 1, 后天: 2, 大后天: 3 }[m[0]]; const base = new Date(today); base.setDate(base.getDate() + n); date = base; matched = m[0]; }
    else if ((m = text.match(/今天|今晚|今日/))) { date = new Date(today); matched = m[0]; }
    if (date && text.slice(text.indexOf(matched) + matched.length).match(/^\s*(前|之前|以前)/)) before = true;
    // 时间点
    let hm = '', tm;
    if ((tm = text.match(/(\d{1,2})[:：](\d{2})/))) hm = `${String(tm[1]).padStart(2, '0')}:${tm[2]}`;
    else if ((tm = text.match(/(上午|下午|晚上|早上)?\s*([一二两三四五六七八九十\d]{1,2})\s*点(半)?/))) { let h = cn2n(tm[2]); if ((tm[1] === '下午' || tm[1] === '晚上') && h < 12) h += 12; hm = `${String(h).padStart(2, '0')}:${tm[3] ? '30' : '00'}`; }
    // 动作：去掉时间词与填充词后的剩余
    let action = matched ? text.replace(matched, ' ') : text;
    action = action.replace(/(上午|下午|晚上|早上)?\s*[一二两三四五六七八九十\d]{1,2}\s*点半?/g, ' ').replace(/\d{1,2}[:：]\d{2}/g, ' ');
    ['约了', '让我', '我会', '我来', '计划', '打算', '准备', '之前', '以前', '再去', '过去', '一趟', '然后'].forEach((w) => { action = action.split(w).join(' '); });
    action = action.replace(/[，,。、；;！!\s]+/g, ' ').trim().replace(/^前\s*|\s*前$/g, '').replace(/^(再|去)\s*/, '').trim();
    const concrete = /(送|带|发|出|上门|到店|勘查|勘察|签|提交|报价|方案|电话|拜访|安排|复处理|演示|培训|试|谈|见|会议|开会|样品|资料)/;
    const vague = /^(再?联系|保持?跟进|再?跟进|沟通|看看|再说|回访|再聊|保持联系|近期跟进|近期再联系)$/;
    const hasAction = !!action && !vague.test(action) && (concrete.test(action) || action.length >= 3);
    const reasons = [];
    if (!date) reasons.push(matched ? '时间不明确' : (/(近期|尽快|有空|回头|改天|过几天|下次)/.test(text) ? '「' + text.match(/(近期|尽快|有空|回头|改天|过几天|下次)/)[1] + '」不算明确时间' : '未解析到明确时间'));
    if (!hasAction) reasons.push(action ? '「' + action + '」不算明确动作' : '缺少明确动作');
    const pass = !!date && hasAction;
    const dateText = date ? `${App.fmt.md(iso(date))} 周${WD[date.getDay()]}${hm ? ' ' + hm : ''}${before ? ' 前' : ''}` : '';
    return {
      pass, raw: text, date: date ? iso(date) : '', before, hm,
      time: date ? `${iso(date)}${hm ? ' ' + hm : ''}${before ? ' 前' : ''}（相对时间已解析）` : '未解析到明确时间',
      action: hasAction ? action : (action || '未识别到明确动作'),
      normalized: date ? `${App.fmt.md(iso(date))}${hm ? ' ' + hm : ''}${before ? ' 前' : ''} · ${hasAction ? action : ''}`.trim() : text,
      dateText,
      hint: pass ? '' : reasons.join('；') + '。例：「9月12日前送方案与报价」',
    };
  };

  /* ----------------------------------------------------------
     模块状态：当前抽取结果 + 编辑
     ---------------------------------------------------------- */
  S.init = function (storeId, version) {
    S.key = storeId + '|' + version;
    S.storeId = storeId; S.version = version;
    S.budgetAdded = false; S.nextGate = null; S.nextText = ''; S.edits = {}; S.stale = false; S.transcriptExtra = '';
    S.rebuild();
    S.score = S.evalScore();
  };
  S.ensure = function (p) {
    const storeId = p.storeId || 's_bing'; const version = p.version === 'weak' ? 'weak' : 'good';
    if (S.key !== storeId + '|' + version) S.init(storeId, version);
  };
  S.transcript = () => (D.demoTranscripts[S.version] || '') + (S.transcriptExtra || '');
  S.nextFixed = () => !!(S.nextGate && S.nextGate.pass);
  S.rebuild = function () {
    const base = D.demoExtract(S.budgetAdded ? 'good' : S.version);
    const weak = D.demoExtract('weak');
    S.fields = App.clone(base.fields);
    if (S.nextGate) {
      S.fields.下一步 = { v: S.nextGate.pass ? S.nextGate.normalized : S.nextGate.raw, src: 'manual', conf: 1, quote: S.nextGate.raw, invalid: !S.nextGate.pass };
      S.gate2 = S.nextGate;
    } else if (S.version === 'weak') { S.fields.下一步 = App.clone(weak.fields.下一步); S.gate2 = App.clone(weak.gate2); }
    else S.gate2 = App.clone(base.gate2);
    Object.keys(S.edits).forEach((k) => { const f = S.fields[k] || {}; S.fields[k] = Object.assign({}, f, { v: S.edits[k], src: 'manual', conf: 1, missing: !S.edits[k] }); });
    if (S.budgetAdded && S.fields.预计金额) S.fields.预计金额.quote = '预算一个月两千到两千五能接受';
  };
  // 评分（演示：弱样例 58；修下一步 + 补预算原话 → 71）
  S.evalScore = function () {
    const good = D.demoExtract('good').score, weak = D.demoExtract('weak').score;
    if (S.version !== 'weak') return App.clone(good);
    const n = S.nextFixed(), b = S.budgetAdded;
    if (n && b) return App.clone(good);
    if (n) return { total: 65, dims: { 逻辑结构: 14, 事实细节: 13, '客户原声/证据': 16, 沟通结论: 12, 表达清晰度: 10 }, advice: ['补充客户预算或价格预期', '补充问题发生的具体位置'] };
    if (b) return { total: 63, dims: { 逻辑结构: 13, 事实细节: 17, '客户原声/证据': 16, 沟通结论: 4, 表达清晰度: 13 }, advice: ['补充问题发生的具体位置', '补充带明确时间与动作的下一步'] };
    return App.clone(weak);
  };
  S.gate1 = () => S.score.total >= th();
  S.gateOk = () => S.gate1() && !!S.gate2.pass;
  S.blockers = function () {
    const p = [];
    if (!S.gate1()) p.push(`评分 ${S.score.total} < ${th()}`);
    if (!S.gate2.pass) p.push('下一步未通过');
    return p;
  };
  S.groups = function () {
    const auto = [], ai = [], first = [];
    Object.keys(S.fields).forEach((k) => { const f = S.fields[k]; if (f.first) first.push(k); else if (f.src === 'auto') auto.push(k); else ai.push(k); });
    return { auto, ai, first };
  };
  S.missingCount = () => Object.keys(S.fields).filter((k) => S.fields[k].missing && (!S.fields[k].first || App.state.settings.firstVisit)).length;

  /* ----------------------------------------------------------
     片段
     ---------------------------------------------------------- */
  function storeCard(store, chip, sub) {
    return `<div class="card"><div class="cf-store"><div class="n grow ellipsis">${esc(store.name)}</div>${chip}</div><div class="cf-store-m">${esc(sub)}</div></div>`;
  }
  function dimBars(score) {
    const W = weights();
    return `<div class="cf-dims">${DIMS.map((k) => { const v = score.dims[k] || 0, w = W[k] || 20, r = v / w; const tone = r < .5 ? 'bad' : (r < .75 ? 'warn' : 'ok'); return `<div class="cf-dim"><span class="l">${esc(k)}</span><span class="b"><i class="${tone}" style="width:${Math.round(r * 100)}%"></i></span><span class="v">${v}/${w}</span></div>`; }).join('')}</div>`;
  }
  function scoreCard(score, opts = {}) {
    const t = th(); const total = score.total;
    const band = total >= t ? (total >= 85 ? '优秀' : '通过') : '需重写';
    const chipTone = total >= t ? 'ok' : 'danger';
    return `<div class="card">
      <div class="row between mb8"><div class="card-title" style="margin:0">质量评分 · ${band}${opts.stale ? ui().chip('已修改 · 待重评', 'warn', { sm: true }) : ''}</div>${ui().chip(`门槛 ${t} 分`, chipTone)}</div>
      <div class="cf-score">${ui().scoreRing(total, t, 96)}${dimBars(score)}</div>
      ${score.advice && score.advice.length ? `<div class="cf-advice"><b>AI 建议：</b>${score.advice.map(esc).join('；')}</div>` : ''}
      ${opts.actions || ''}
    </div>`;
  }
  function fieldRow(k, f, opts = {}) {
    const auto = f.src === 'auto', manual = f.src === 'manual';
    const missing = !!f.missing || f.v === '';
    const val = missing ? '待补充' : esc(f.v);
    const src = auto ? '<span class="src"><i class="dot auto"></i>自动</span>'
      : manual ? '<span class="src"><i class="dot manual"></i>已人工校正</span>'
        : missing ? '<span class="src"><i class="dot miss"></i>待补充</span>'
          : `<span class="src"><i class="dot"></i>AI ${Math.round((f.conf || 0) * 100)}%</span>`;
    const req = (k === '客户名称' || k === '下一步') ? '<span class="req">*</span>' : '';
    const click = opts.readonly ? '' : (auto ? `onclick="S_CONFIRM.tapAuto()"` : `onclick="S_CONFIRM.openField('${esc(k)}')"`);
    return `<div class="field-row ${opts.readonly ? '' : 'tap'}" ${click}><span class="fl">${esc(k)}${req}</span><span class="fv ${auto ? 'auto' : ''} ${missing ? 'missing' : ''} ${f.invalid ? 'missing' : ''}">${val}</span>${src}</div>`;
  }
  function fieldGroups(fields, opts = {}) {
    const auto = [], ai = [], first = [];
    Object.keys(fields).forEach((k) => { const f = fields[k]; if (f.first) first.push(k); else if (f.src === 'auto') auto.push(k); else ai.push(k); });
    const legend = `<span class="cf-legend"><span><i class="auto"></i>自动</span><span><i></i>AI</span><span><i class="manual"></i>已校正</span><span><i class="miss"></i>待补充</span></span>`;
    let html = `<div class="list">
      <div class="cf-group"><span>16 项基础字段</span>${legend}</div>
      <div class="cf-group" style="padding-top:2px;font-size:12.5px;color:var(--ink-3);font-weight:600">自动带出 · ${auto.length} 项<span class="g-sub">由登录账号与打点带出，灰色不可改</span></div>
      ${auto.map((k) => fieldRow(k, fields[k], opts)).join('')}
      <div class="cf-group" style="font-size:12.5px;color:var(--ink-3);font-weight:600">AI 抽取 · ${ai.length} 项<span class="g-sub">${opts.readonly ? '带置信度与原文定位' : '带置信度与原文定位，点行可看原文 / 修改'}</span></div>
      ${ai.map((k) => fieldRow(k, fields[k], opts)).join('')}
    </div>`;
    if (first.length && (opts.readonly || App.state.settings.firstVisit)) {
      html += `<div class="list"><div class="cf-group"><span>首次拜访追加 · ${first.length} 项</span>${ui().chip('需人工审核', 'warn', { sm: true })}</div>${first.map((k) => fieldRow(k, fields[k], opts)).join('')}</div>`;
    }
    return html;
  }
  function gateCard(g2, opts = {}) {
    const pass = !!g2.pass;
    return `<div class="card cf-gate ${pass ? '' : 'fail'}">
      <div class="row between mb8"><div class="card-title" style="margin:0">下一步硬校验</div>${pass ? ui().chip('通过', 'ok', { icon: 'check' }) : ui().chip('未通过', 'danger')}</div>
      <div class="cf-kv" ${opts.readonly ? '' : `onclick="S_CONFIRM.editNext()"`}><span class="k">原文</span><span class="v ${pass ? '' : 'bad'}">${esc(g2.raw || '（空）')}</span></div>
      <div class="cf-kv"><span class="k b">时间解析</span><span class="v ${g2.time && !/未解析/.test(g2.time) ? 'good' : 'bad'}">${esc(String(g2.time || '').split('（')[0])}${/（/.test(g2.time || '') ? `<div class="tiny muted" style="font-weight:400">${esc(g2.time.split('（')[1].replace('）', ''))}</div>` : ''}</span></div>
      <div class="cf-kv"><span class="k b">动作</span><span class="v ${pass ? 'good' : 'bad'}">${esc(g2.action || '未识别到明确动作')}</span></div>
      ${pass ? '' : `<div class="cf-hint">${esc(g2.hint || '须同时有明确时间与明确动作。例：「9月12日前送方案与报价」')}</div>`}
      ${pass && !opts.readonly ? `<div class="tiny muted mt8">通过后归档即自动生成待办与回访提醒 · 规则：须同时有明确时间与动作（后台可配）</div>` : ''}
    </div>`;
  }

  /* ----------------------------------------------------------
     confirm：字段确认
     ---------------------------------------------------------- */
  App.register('confirm', {
    title: '字段确认', tab: 'route',
    prd: ['deck p16 · 只改错的字段', 'deck p17 · 两道闸门', '16 + 4 字段'],
    rules: ['缺失留空标「待补充」，不编造', '评分低于门槛（60 分，后台可调）归档禁用', '下一步须同时有明确时间与动作', '自动带出 5 项灰色不可改'],
    demoActions: [
      { label: '切换到弱样例（58 分）', icon: 'refresh', run() { App.replace('confirm', { storeId: S.storeId || 's_bing', version: 'weak' }); } },
      { label: '切换到标准样例（71 分）', icon: 'refresh', run() { App.replace('confirm', { storeId: S.storeId || 's_bing', version: 'good' }); } },
      { label: '门槛拖到 85（演示后台配置生效）', icon: 'settings', run() { App.state.settings.threshold = 85; App.save(); App.refresh(); App.toast('后台门槛已改为 85 分 · 页面即时生效', { icon: 'settings' }); } },
      { label: '门槛恢复 60', icon: 'settings', run() { App.state.settings.threshold = 60; App.save(); App.refresh(); App.toast('门槛恢复 60 分', { icon: 'settings' }); } },
    ],
    render(p) {
      S.ensure(p);
      const store = App.store(S.storeId) || { name: '未知门店' };
      const ok = S.gateOk();
      const sub = `2026-09-07 10:45 · 语音 · ${App.state.settings.firstVisit ? '首次拜访' : '再次拜访'} · ${App.me().name}`;
      const failed = !S.gate1() || !S.gate2.pass;
      const actions = failed ? `<div class="cf-fix">
          <button class="${S.budgetAdded ? 'done' : ''}" onclick="S_CONFIRM.addBudget()">${App.icon(S.budgetAdded ? 'check' : 'mic', 14)}补一句客户原话（预算）</button>
          <button class="${S.nextFixed() ? 'done' : ''}" onclick="S_CONFIRM.editNext()">${App.icon(S.nextFixed() ? 'check' : 'edit', 14)}修改下一步</button>
        </div>` : '';
      return `${ui().phaseBar(PHASES, 2)}
        ${storeCard(store, ok ? ui().chip('可归档', 'ok') : ui().chip('闸门未过', 'danger'), sub)}
        ${scoreCard(S.score, { stale: S.stale, actions })}
        ${gateCard(S.gate2)}
        ${fieldGroups(S.fields)}
        <div class="tiny muted" style="text-align:center;padding:2px 0 8px">只改错的字段 · 每个字段带置信度与原文定位 · 缺失字段不编造 · 门槛 ${th()} 分为会议纪要口径</div>`;
    },
    footer() {
      const bl = S.blockers();
      let status = '';
      if (bl.length) status = `<div class="cf-status bad">${App.icon('alert', 14)}<span>${esc(bl.join('，'))}，归档已禁用${S.stale ? ' · 字段已修改，请再次 AI 审核' : ''}</span></div>`;
      else if (S.stale) status = `<div class="cf-status warn">${App.icon('info', 14)}<span>字段已修改，建议再次 AI 审核后归档</span></div>`;
      else status = `<div class="cf-status ok">${App.icon('check-circle', 14)}<span>两道闸门通过 · 归档后自动生成回访提醒与待办</span></div>`;
      return `${status}<div class="cf-foot">
        ${ui().btn('保存草稿', { tone: 'outline', onclick: 'S_CONFIRM.draft()' })}
        ${ui().btn('再次 AI 审核', { tone: 'secondary', onclick: 'S_CONFIRM.review()' })}
        ${ui().btn('确认归档', { tone: 'primary', onclick: 'S_CONFIRM.archive()', disabled: bl.length > 0 })}
      </div>`;
    },
  });

  S.tapAuto = function () { App.toast('自动带出字段由登录账号与打点带入，不可改', { icon: 'lock' }); };
  // 带预填值的输入弹层（App.prompt 不支持预填）
  function promptPrefilled({ title, value, placeholder, chips, onOk, okLabel = '保存' }) {
    let val = value || '';
    App.modal({
      title,
      body: `<textarea class="cf-modal-ta" id="cfInput" placeholder="${esc(placeholder || '')}">${esc(val)}</textarea>${chips && chips.length ? `<div class="cf-chips">${chips.map((c) => `<span onclick="S_CONFIRM._fill(this)">${esc(c)}</span>`).join('')}</div>` : ''}`,
      actions: [{ label: '取消', tone: 'ghost' }, { label: okLabel, tone: 'primary', onClick: () => onOk(val.trim()) }],
    });
    const ta = App.q('#cfInput');
    if (ta) { ta.oninput = () => { val = ta.value; }; S._setVal = (v) => { ta.value = v; val = v; }; setTimeout(() => ta.focus(), 50); }
  }
  S._fill = function (el) { S._setVal && S._setVal(el.textContent); };

  S.openField = function (k) {
    const f = S.fields[k]; if (!f) return;
    const missing = !!f.missing || f.v === '';
    const text = S.transcript();
    const quoteHtml = f.quote ? highlightQuote(text, f.quote, D.hotwords) : hl(text, D.hotwords);
    const body = `<div style="text-align:center">${missing ? ui().chip('待补充 · 原文未提及，不编造', 'warn', { sm: true }) : f.src === 'manual' ? ui().chip('已人工校正', 'ok', { sm: true }) : ui().chip(`AI 抽取 · 置信度 ${Math.round((f.conf || 0) * 100)}%`, 'ai', { sm: true })}</div>
      <div class="cf-cur"><span class="k">当前值</span><span class="${missing ? 'missing' : ''}" style="${missing ? 'color:var(--warn);font-weight:600' : ''}">${missing ? '待补充' : esc(f.v)}</span></div>
      <div class="tiny muted mt8" style="text-align:left">原文定位${f.quote ? '（黄色为该字段依据）' : '（原文未直接提及）'}</div>
      <div class="cf-quote">${quoteHtml}</div>`;
    App.modal({ title: k, body, actions: [{ label: '关闭', tone: 'ghost' }, { label: '修改', tone: 'primary', onClick: () => S.editField(k) }] });
  };
  S.editField = function (k) {
    if (k === '下一步') return S.editNext();
    const f = S.fields[k] || {};
    const chips = k === '预计金额' || k === '客户预算' ? ['¥2,000–2,500 / 月（客户口述）'] : k === '合作伙伴' ? ['无', '物业代理'] : [];
    promptPrefilled({
      title: `修改「${k}」`, value: f.missing ? '' : f.v, placeholder: '请输入；留空表示待补充，不编造', chips,
      onOk: (v) => {
        S.edits[k] = v; S.stale = true; S.rebuild(); App.save(); App.refresh();
        App.toast(v ? `「${k}」已人工校正` : `「${k}」保持待补充`, { icon: 'check' });
      },
    });
  };
  S.editNext = function () {
    promptPrefilled({
      title: '修改下一步', value: S.nextGate ? S.nextGate.raw : '9月12日前送方案与报价', placeholder: '须同时有明确时间与动作，例：9月12日前送方案与报价',
      chips: ['9月12日前送方案与报价', '下周三下午两点带方案到店'],
      okLabel: '保存并校验',
      onOk: (v) => {
        if (!v) return;
        S.nextGate = S.parseNext(v); S.stale = true; S.rebuild(); App.save(); App.refresh();
        App.toast(S.nextGate.pass ? `下一步通过硬校验 · ${S.nextGate.dateText}` : '下一步仍未通过：' + S.nextGate.hint.split('。')[0], { icon: S.nextGate.pass ? 'check-circle' : 'alert' });
      },
    });
  };
  S.addBudget = function () {
    if (S.budgetAdded) { App.toast('已补充预算原话'); return; }
    const close = App.loading('追加录音 · 转写中…');
    setTimeout(() => {
      close();
      S.budgetAdded = true; S.transcriptExtra = '预算一个月两千到两千五能接受。'; S.stale = true; S.rebuild(); App.save(); App.refresh();
      App.toast('已追加客户原话：预算一个月两千到两千五能接受', { icon: 'mic' });
    }, 600);
  };
  S.review = function () {
    const close = App.loading('日日新大模型重新审核中…');
    setTimeout(() => {
      close();
      S.score = S.evalScore(); S.stale = false; App.refresh();
      const bl = S.blockers();
      App.toast(`审核完成：${S.score.total} 分 · ${bl.length ? bl.join('；') : '两道闸门通过，可归档'}`, { icon: bl.length ? 'alert' : 'check-circle', duration: 2200 });
    }, 700);
  };
  S.draft = function () {
    App.toast('草稿已保存 · 可稍后继续，未归档不计入留痕', { icon: 'file' });
    setTimeout(() => App.back(), 500);
  };
  S.archive = function () {
    const bl = S.blockers();
    if (bl.length) { App.toast('归档被拦截：' + bl.join('；'), { icon: 'alert' }); return; }
    App.go('archive', { storeId: S.storeId, version: S.version });
  };

  /* ----------------------------------------------------------
     archive：归档完成 · 选择商机
     ---------------------------------------------------------- */
  const A = S.arch = { choice: null, key: null, oppName: '', oppAmt: '' };
  App.register('archive', {
    title: '归档 · 选择商机', tab: 'route',
    prd: ['deck p16 · 归档后选商机', '归档即生成回访提醒与待办'],
    rules: ['不自动建商机，由销售判断新建 / 更新 / 不建', '同一客户跑三次不建三条商机', '同店同周期提醒合并展示'],
    demoActions: [{ label: '重置本页选择', icon: 'refresh', run() { A.choice = null; App.refresh(); } }],
    render(p) {
      const storeId = p.storeId || 's_bing'; const version = p.version === 'weak' ? 'weak' : 'good';
      if (A.key !== storeId + '|' + version) { A.key = storeId + '|' + version; A.choice = null; }
      const store = App.store(storeId) || { name: '未知门店' };
      const ex = (S.key === storeId + '|' + version && S.fields) ? { fields: S.fields } : D.demoExtract(version);
      const f = ex.fields;
      const name = (f.商机名称 && f.商机名称.v) || `${store.name.replace(/（.*?）/g, '')} · 综合服务`;
      const amt = (f.预计金额 && f.预计金额.v) || '';
      const opps = App.oppsOf(storeId);
      const recNew = !opps.length;
      const sub = `2026-09-07 10:45 · 语音 · ${App.state.settings.firstVisit ? '首次拜访' : '再次拜访'} · ${App.me().name}`;
      let html = `${ui().phaseBar(PHASES, 3)}
        <div class="ar-head"><div class="t"><span class="ar-ok">${App.icon('check', 18)}</span>归档完成 · 选择商机</div><div class="s">不自动建商机，由你判断：新建、更新已有，或暂不 · 避免同一客户跑三次建出三条商机</div></div>
        ${storeCard(store, ui().chip('已留痕', 'ok'), sub)}`;
      if (!A.choice) {
        html += `<div class="card ar-opt ${recNew ? 'rec' : ''}">${recNew ? '<span class="rec-tag">AI 推荐</span>' : ''}
            <div class="card-title">新建商机</div>
            <div class="tiny muted">${recNew ? '该客户暂无进行中的商机，本次沟通已有明确需求与预算' : '该客户已有进行中的商机，仅在需求确属另一单时新建'}</div>
            <div class="ar-form">
              <div class="ar-row"><label>名称</label><input id="arName" value="${esc(name)}" oninput="S_CONFIRM.arch.oppName=this.value"></div>
              <div class="ar-row"><label>预计金额</label><input id="arAmt" value="${esc(amt)}" placeholder="待补充（不编造）" oninput="S_CONFIRM.arch.oppAmt=this.value"></div>
              <div class="ar-row"><label>阶段</label><span class="ro">意向${ui().chip('由规则计算', 'gray', { sm: true, cls: 'ml6' })}</span></div>
            </div>
            <div class="mt12">${ui().btn('新建商机', { tone: 'primary', block: true, onclick: "S_CONFIRM.choose('新建商机')" })}</div>
          </div>
          <div class="card ar-opt ${recNew ? '' : 'rec'}">${recNew ? '' : '<span class="rec-tag">AI 推荐</span>'}
            <div class="card-title">更新已有商机</div>
            ${opps.length ? '<div class="tiny muted">同一客户多次拜访归到同一条商机，避免重复建单</div>' : ''}
            ${opps.length ? opps.map((o) => `<div class="ar-opp" onclick="S_CONFIRM.choose('更新已有商机','${o.id}')"><span class="rd"></span><div class="grow"><div class="row between"><span class="n ellipsis">${esc(o.name)}</span>${ui().stageChip(o.stage)}</div><div class="m">预计 ${esc(o.amount)} · 负责人 ${esc(o.ownerName)} · 更新 ${esc(App.fmt.md(o.updatedAt))}</div></div></div>`).join('')
            : `<div class="tiny muted" style="padding:6px 0 2px">该客户暂无商机 · 若有进行中的商机，本次留痕将关联到它，而不是再建一条</div>`}
          </div>
          <div class="card ar-opt" style="padding:6px 8px">${ui().btn('不建商机', { tone: 'ghost', block: true, onclick: "S_CONFIRM.choose('不建商机')" })}</div>
          <div class="tiny muted" style="text-align:center;padding:0 0 10px">选择后写入：拜访记录（16 + 4 字段）· 路线状态 · 回访提醒与待办 · CRM 同步队列</div>`;
      } else {
        const opp = App.primaryOpp(storeId);
        const rems = App.state.reminders.filter((r) => r.storeId === storeId && r.status === 'todo');
        const merged = rems.find((r) => r.dedupNote);
        html += `${ui().notice('ok', `已归档 2026-09-07 11:06 · <b>${esc(A.choice)}</b>${opp && A.choice !== '不建商机' ? `：${esc(opp.name)}` : ''} · 本系统已归档，CRM 已加入同步队列`, 'check-circle')}
          <div class="card ar-result">
            <div class="row between"><div class="card-title" style="margin:0">回访提醒与待办已生成</div>${ui().chip('归档即生成', 'ai', { sm: true })}</div>
            <div class="ar-list">
              ${rems.length ? rems.map((r) => `<div class="ar-item"><span class="ic ${r.source === '分层规则' ? 'ai' : ''}">${App.icon(r.source === '分层规则' ? 'layers' : 'calendar', 14)}</span><div class="grow"><div>${esc(r.note || `${App.tierLabel(r.tier)} · 每 ${r.cycle} 天回访`)}</div><div class="m">来源：${esc(r.source)} · ${esc(App.fmt.mdw(r.due))} · ${esc(App.fmt.dueLabel(r.due))}</div></div></div>`).join('')
              : `<div class="tiny muted">本次未生成新的提醒</div>`}
            </div>
            ${merged ? `<div class="ar-merge">${App.icon('info', 14)}<span>${esc(merged.dedupNote)}</span></div>` : ''}
            <div class="mt12">${ui().btn('查看回访提醒与待办', { tone: 'secondary', block: true, size: 'sm', onclick: "App.go('reminders')" })}</div>
          </div>
          <div class="card ar-result pressable" onclick="App.go('gtm',{storeId:'${storeId}'})">
            <div class="row between"><div><div class="card-title" style="margin:0">有意向？生成方案与报价</div><div class="tiny muted mt4">本次诉求、预算、联系人已带入 GTM 助手，选模版即可生成六段方案 + 报价单</div></div><span class="cell-icon ai" style="width:36px;height:36px;border-radius:10px;background:var(--ai-soft);color:var(--ai);display:flex;align-items:center;justify-content:center;flex:none">${App.icon('sparkle', 20)}</span></div>
          </div>
          <div class="list">
            ${ui().cell({ title: '查看客户 360', sub: `${esc(store.name)} · 分层 ${esc(App.tierLabel(store.tier))} · 拜访时间线已更新`, icon: 'user', onclick: `App.go('customer',{id:'${storeId}'})` })}
            ${ui().cell({ title: '返回今日路线', sub: '该店状态已更新为「已留痕」', icon: 'road', iconTone: 'gray', onclick: "App.tab('route')" })}
          </div>`;
      }
      return html;
    },
  });
  S.choose = function (choice, oppId) {
    const [storeId, version] = (A.key || 's_bing|good').split('|');
    const st = App.state;
    if (storeId === 's_bing') {
      D.archiveDemoVisit(st, version, choice);
      // 以确认页最终字段 / 评分 / 原文覆盖归档记录（data.js 只按样例版本重建）
      const v = App.visit('v_bing_new');
      if (v && S.key === storeId + '|' + version && S.fields) {
        v.fields = App.clone(S.fields); v.score = App.clone(S.score); v.transcript = S.transcript(); v.type = st.settings.firstVisit ? '首次拜访' : '再次拜访';
        const store = App.store('s_bing'); const g2 = S.gate2;
        if (g2 && g2.pass && g2.date && store) {
          const note = `${App.fmt.md(g2.date)}${g2.hm ? ' ' + g2.hm : ''}${g2.before ? ' 前' : ''} ${g2.action}`;
          store.lastNext = note; store.nextDue = g2.date;
          const r = st.reminders.find((x) => x.id === 'r_bing_next'); if (r) { r.note = note; r.due = g2.date; }
        }
      }
      const o = App.opp('o_bing');
      if (o && choice === '新建商机') { if (A.oppName && A.oppName.trim()) o.name = A.oppName.trim(); if (A.oppAmt && A.oppAmt.trim()) o.amount = A.oppAmt.trim(); }
    } else {
      // 通用门店：写入拜访记录、路线状态、回访提醒
      const store = App.store(storeId);
      const ex = D.demoExtract(version);
      const vid = 'v_' + storeId + '_new';
      const v = { id: vid, storeId, time: '2026-09-07 10:45', end: '11:03', by: App.me().name, mode: '语音', type: st.settings.firstVisit ? '首次拜访' : '再次拜访', status: 'archived', score: ex.score, transcript: D.demoTranscripts[version], hotwords: D.hotwords, fields: ex.fields, oppAction: choice, archivedAt: '2026-09-07 11:06' };
      const i = st.visits.findIndex((x) => x.id === vid); if (i >= 0) st.visits[i] = v; else st.visits.unshift(v);
      if (store) { store.route.trace = 'done'; store.route.checkin = store.route.checkin || '10:45'; store.route.checkout = '11:03'; store.lastVisit = '2026-09-07'; store.lastNext = '9月16日 14:00 带方案到店'; store.nextDue = '2026-09-16'; store.updatedAt = '2026-09-07 11:06'; }
      const oid = 'o_' + storeId + '_new';
      if (choice === '新建商机' && !App.opp(oid)) st.opportunities.unshift({ id: oid, storeId, name: (A.oppName || (ex.fields.商机名称 && ex.fields.商机名称.v) || (store ? store.name + ' · 综合服务' : '新商机')), stage: '意向', amount: A.oppAmt || (ex.fields.预计金额 && ex.fields.预计金额.v) || '待报价', ownerName: App.me().name, updatedAt: '2026-09-07' });
      if (choice === '更新已有商机' && oppId) { const o = App.opp(oppId); if (o) o.updatedAt = '2026-09-07'; }
      const rid = 'r_' + storeId + '_next';
      if (!st.reminders.find((r) => r.id === rid)) st.reminders.push({ id: rid, storeId, source: '上次下一步约定', note: '9月16日 14:00 带方案到店', due: '2026-09-16', status: 'todo' });
    }
    App.save();
    A.choice = choice;
    App.refresh();
    App.scrollTop();
    App.toast(choice === '不建商机' ? '已归档，未建商机' : (choice === '新建商机' ? '商机已新建' : '已关联到已有商机'), { icon: 'check-circle' });
  };

  /* ----------------------------------------------------------
     visit-detail：留痕记录详情（只读）
     ---------------------------------------------------------- */
  App.register('visit-detail', {
    title: '留痕记录', tab: 'customers',
    prd: ['deck p15–16 · 原音 + 原文 + 结构化字段', '五维评分 · 归档 / 同步状态'],
    rules: ['已归档记录只读，修改走复盘流程', '证据永远是销售原话'],
    render(p) {
      const v = App.visit(p.id);
      if (!v) return ui().empty({ icon: 'file', title: '记录不存在', sub: `未找到留痕记录 ${p.id || ''}`, action: ui().btn('返回', { tone: 'ghost', size: 'sm', onclick: 'App.back()' }) });
      const store = App.store(v.storeId) || { name: '未知门店', tier: 'pending' };
      const sc = v.score || { total: 0, dims: {} };
      const t = th();
      const dur = v.end ? (() => { const a = v.time.slice(11, 16).split(':'), b = v.end.split(':'); const m = (+b[0] * 60 + +b[1]) - (+a[0] * 60 + +a[1]); return m > 0 ? `${m} 分钟` : ''; })() : '';
      const fields = App.clone(v.fields || {});
      // 记录里只存了部分字段时，补上自动带出 5 项以保持结构完整
      if (!fields.记录人) Object.assign(fields, { 记录人: { v: v.by, src: 'auto' }, 拜访日期: { v: v.time.slice(0, 10), src: 'auto' }, 地点: { v: (store.address || '') + '（打点）', src: 'auto' }, 时长: { v: dur ? `${dur}（${v.time.slice(11, 16)}–${v.end}）` : '—', src: 'auto' }, 沟通方式: { v: v.mode || '语音', src: 'auto' } }, fields);
      const manual = Object.keys(fields).some((k) => fields[k].src === 'manual');
      const bars = Array.from({ length: 46 }, (_, i) => { const h = 6 + Math.round(Math.abs(Math.sin(i * 1.7) * 14 + Math.cos(i * .9) * 8)); return `<i class="${i > 30 ? 'dim' : ''}" style="height:${h}px"></i>`; }).join('');
      const opp = App.primaryOpp(v.storeId);
      return `
        ${storeCard(store, ui().chip(`${sc.total} 分`, sc.total >= t ? 'ok' : 'danger'), `${v.time} · ${v.mode || '语音'} · ${v.type || '拜访'} · ${v.by}`)}
        <div class="card"><div class="row between mb8"><div class="card-title" style="margin:0">原音</div>${ui().chip('原音与原文都留下', 'gray', { sm: true })}</div>
          <div class="vd-audio"><span class="vd-play" onclick="App.toast('演示：原音播放为占位')">${App.icon('play', 18)}</span><div class="vd-wave">${bars}</div><span class="vd-dur">00:32</span></div></div>
        <div class="card"><div class="row between mb8"><div class="card-title" style="margin:0">原文</div><span class="row" style="gap:6px">${manual ? ui().chip('已人工校正', 'ok', { sm: true }) : ''}${ui().chip(`热词命中 ${(v.hotwords || []).length}`, 'brand', { sm: true })}</span></div>
          <div class="vd-text">${hl(v.transcript, v.hotwords || D.hotwords)}</div></div>
        ${fieldGroups(fields, { readonly: true })}
        <div class="card"><div class="row between mb8"><div class="card-title" style="margin:0">五维评分</div>${ui().chip(`门槛 ${t} 分`, sc.total >= t ? 'ok' : 'danger')}</div>
          <div class="cf-score">${ui().scoreRing(sc.total, t, 88)}${dimBars(sc)}</div></div>
        <div class="card"><div class="card-title">归档 / 同步状态</div>
          <div class="chips">${ui().chip(v.status === 'archived' ? '本系统已归档' : '草稿', v.status === 'archived' ? 'ok' : 'gray', { icon: 'check' })}${ui().chip('CRM 已同步', 'info', { icon: 'sync' })}${v.oppAction ? ui().chip(`商机：${v.oppAction}`, 'brand') : ''}</div>
          <div class="tiny muted mt8">归档时间 ${esc(v.archivedAt || (v.time.slice(0, 11) + v.end))} · 已归档记录只读，修改请走复盘流程</div></div>
        <div class="list">
          ${ui().cell({ title: '客户 360', sub: `${esc(store.name)} · ${esc(App.tierLabel(store.tier))}`, icon: 'user', onclick: `App.go('customer',{id:'${v.storeId}'})` })}
          ${opp ? ui().cell({ title: '关联商机', sub: `${esc(opp.name)} · ${esc(opp.stage)}`, icon: 'briefcase', iconTone: 'ai', onclick: `App.go('customer',{id:'${v.storeId}'})` }) : ''}
        </div>`;
    },
  });
})();
