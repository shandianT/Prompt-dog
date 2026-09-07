/* ============================================================
   LBS 销售管理小程序 Demo — 核心运行时
   路由 / 状态 / 组件 / 图标 / 浮层 / 演示导览
   纯前端，无后端；数据来自 data.js（模拟数据）
   ============================================================ */
(function () {
  'use strict';

  const TAB_ROOTS = ['today', 'customers', 'assistant', 'me'];
  const TABS = [
    { id: 'today', label: '今日', icon: 'sun' },
    { id: 'customers', label: '客户', icon: 'store' },
    { id: 'assistant', label: '工作助手', icon: 'sparkle' },
    { id: 'me', label: '我的', icon: 'user' },
  ];

  const App = window.App = {
    screens: {},
    stack: [],
    state: null,
    TAB_ROOTS,
    TABS,
    _seq: 0,
    _ignoreHash: false,
  };

  /* ----------------------------------------------------------
     图标（内联 SVG，24 网格，stroke 风格）
     ---------------------------------------------------------- */
  const ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    store: '<path d="M3 9l1.2-4.5A1 1 0 0 1 5.2 4h13.6a1 1 0 0 1 1 .5L21 9"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9z"/><path d="M5 13v7h14v-7"/><path d="M10 20v-4h4v4"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="3"/><path d="M15.5 14.5a5.5 5.5 0 0 1 6 5.5"/>',
    'chevron-left': '<path d="M15 5l-7 7 7 7"/>',
    'chevron-right': '<path d="M9 5l7 7-7 7"/>',
    'chevron-down': '<path d="M5 9l7 7 7-7"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    'map-pin': '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    road: '<path d="M4 21L9 3M20 21L15 3M12 6v3M12 12v3M12 18v3"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/>',
    warning: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
    star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    edit: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13 7l4 4"/>',
    send: '<path d="M21 3L10 14M21 3l-7 18-4-8-8-4z"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
    more: '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.5M3 12h.5M3 18h.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    upload: '<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
    'cloud-off': '<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 17 8.5"/><path d="M19 12.5A4.5 4.5 0 0 1 17.5 18H9"/><path d="M3 3l18 18"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    'eye-off': '<path d="M3 3l18 18M10.5 10.6A2.5 2.5 0 0 0 13.5 13.5"/><path d="M6.6 6.7C4 8.2 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.8 0 3.3-.5 4.6-1.2M9.9 5.7A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.4 3.4"/>',
    message: '<path d="M4 5h16v11H9l-5 4z"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17v.5"/>',
    bug: '<path d="M9 8V6a3 3 0 0 1 6 0v2"/><rect x="7" y="8" width="10" height="12" rx="5"/><path d="M3 13h4M17 13h4M4 19l3-2M20 19l-3-2M5 7l2 2M19 7l-2 2M12 8v12"/>',
    yuan: '<path d="M7 4l5 7 5-7M12 11v9M8 14h8M8 17h8"/>',
    contract: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h4"/><path d="M15 17l1 1 2-2"/>',
    handshake: '<path d="M2 9l4-4 4 3 3-2 4 3 5-4"/><path d="M6 5v7l5 5 3-1-2-2 3-2-2-2 3-2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M4 12h16"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/>',
    flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.5M10 10h.5M14 10h.5M18 10h.5M6 14h12"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    logout: '<path d="M10 4H5v16h5M14 8l5 4-5 4M19 12H9"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/><path d="M12 8v4l3 2"/>',
    coach: '<circle cx="12" cy="7" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M17 3l2 2-2 2"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    receipt: '<path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    compare: '<path d="M9 3v18M15 3v18"/><path d="M3 8h6M15 8h6M3 16h6M15 16h6"/>',
    thumbs: '<path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v4h6a2 2 0 0 1 2 2l-1.5 8a2 2 0 0 1-2 1H7"/>',
    sync: '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4"/>',
    wifi: '<path d="M2 8.5a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
    battery: '<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4"/><rect x="4" y="9" width="13" height="6" rx="1" fill="currentColor" stroke="none"/>',
    signal: '<path d="M2 20h3v-4H2zM7.5 20h3v-8h-3zM13 20h3V8h-3zM18.5 20h3V4h-3z" fill="currentColor" stroke="none"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    inbox: '<path d="M3 13l2.5-8h13L21 13v6H3z"/><path d="M3 13h5l1.5 3h5L16 13h5"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    beaker: '<path d="M9 3h6M10 3v6l-6 9a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-6-9V3"/><path d="M7 15h10"/>',
    hand: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v6M11 12V4a1.5 1.5 0 0 1 3 0v8M14 12V6a1.5 1.5 0 0 1 3 0v8"/><path d="M17 14v-2a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4 15a1.5 1.5 0 0 1 2.5-1.7L8 15"/>',
  };
  App.icon = function (name, size = 20, cls = '') {
    const d = ICONS[name] || ICONS.info;
    return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  };

  /* ----------------------------------------------------------
     工具
     ---------------------------------------------------------- */
  App.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  App.uid = (p = 'id') => p + '_' + (++App._seq) + '_' + Math.random().toString(36).slice(2, 6);
  App.clone = (o) => JSON.parse(JSON.stringify(o));
  App.by = (arr, key, val) => (arr || []).find((x) => x[key] === val);
  App.q = (sel, root) => (root || document).querySelector(sel);
  App.qa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  // 页面级样式注入（每个 id 只注入一次），供各页面文件自带专属样式，避免多处修改 app.css
  App.css = function (id, text) {
    const key = 'css-' + id;
    if (document.getElementById(key)) return;
    const st = document.createElement('style'); st.id = key; st.textContent = text;
    document.head.appendChild(st);
  };

  // 固定演示日期：2026-09-07（周一）
  App.TODAY = '2026-09-07';
  App.dayjs = function (s) { return new Date(s + (s.length === 10 ? 'T00:00:00' : '')); };
  App.fmt = {
    md(s) { if (!s) return ''; const d = App.dayjs(s); return `${d.getMonth() + 1}月${d.getDate()}日`; },
    mdw(s) { if (!s) return ''; const d = App.dayjs(s); return `${d.getMonth() + 1}月${d.getDate()}日 周${'日一二三四五六'[d.getDay()]}`; },
    ymd(s) { return s ? s.slice(0, 10) : ''; },
    hm(s) { return s && s.length >= 16 ? s.slice(11, 16) : ''; },
    days(s) { if (!s) return null; return Math.round((App.dayjs(s.slice(0, 10)) - App.dayjs(App.TODAY)) / 86400000); },
    rel(s) {
      const n = App.fmt.days(s);
      if (n === null) return '';
      if (n === 0) return '今天'; if (n === 1) return '明天'; if (n === -1) return '昨天';
      if (n < 0) return `${-n}天前`; return `${n}天后`;
    },
    dueLabel(s) {
      const n = App.fmt.days(s);
      if (n === null) return '';
      if (n < 0) return `逾期${-n}天`; if (n === 0) return '今天到期'; if (n === 1) return '明天到期'; return `${App.fmt.md(s)} 到期`;
    },
    money(n) { if (n == null) return '—'; return '¥' + Number(n).toLocaleString('zh-CN'); },
    pct(n) { return n == null ? '—' : Math.round(n * 100) + '%'; },
  };
  App.initials = (name) => (name || '?').replace(/[（(].*$/, '').slice(0, 1);

  /* ----------------------------------------------------------
     状态
     ---------------------------------------------------------- */
  const LS_KEY = 'lbs-demo-state-v1';
  App.freshState = () => App.clone(window.DATA.initial());
  App.load = function () {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) { const s = JSON.parse(raw); if (s && s.version === window.DATA.VERSION) return s; }
    } catch (e) { /* ignore */ }
    return App.freshState();
  };
  App.save = function () { try { localStorage.setItem(LS_KEY, JSON.stringify(App.state)); } catch (e) { /* ignore */ } };
  App.reset = function (silent) {
    App.state = App.freshState();
    App.save();
    App.tab('today');
    if (!silent) App.toast('演示数据已重置', { icon: 'refresh' });
  };
  App.me = () => App.state.users[App.state.role];
  App.isMgr = () => App.state.role === 'mgr';
  App.setRole = function (role) {
    if (!App.state.users[role]) return;
    App.state.role = role;
    App.save();
    App.tab('today');
    App.toast(`已切换为 ${App.me().name} · ${App.me().roleName}`, { icon: 'user' });
  };
  // 便捷取数
  App.store = (id) => App.by(App.state.stores, 'id', id);
  App.opp = (id) => App.by(App.state.opportunities, 'id', id);
  App.task = (id) => App.by(App.state.tasks, 'id', id);
  App.visit = (id) => App.by(App.state.visits, 'id', id);
  App.proposal = (id) => App.by(App.state.proposals, 'id', id);
  App.oppsOf = (storeId) => App.state.opportunities.filter((o) => o.storeId === storeId);
  App.visitsOf = (storeId) => App.state.visits.filter((v) => v.storeId === storeId).sort((a, b) => (a.time < b.time ? 1 : -1));
  App.tasksOf = (storeId) => App.state.tasks.filter((t) => t.storeId === storeId);
  App.primaryOpp = (storeId) => { const s = App.store(storeId); return App.opp(s && s.primaryOppId) || App.oppsOf(storeId)[0] || null; };
  App.tierLabel = (t) => ({ unknown: '未知', none: '无当前意向', 20: '20%', 50: '50%', 80: '80%', pending: '待判断' }[t] || String(t));
  App.tierTone = (t) => ({ unknown: 'gray', none: 'gray', 20: 'info', 50: 'warn', 80: 'brand', pending: 'gray' }[t] || 'gray');

  /* ----------------------------------------------------------
     浮层：toast / sheet / modal
     ---------------------------------------------------------- */
  let toastTimer = null;
  App.toast = function (msg, opts = {}) {
    const ov = App.q('#overlay');
    App.qa('.toast', ov).forEach((n) => n.remove());
    const el = document.createElement('div');
    el.className = 'toast' + (opts.bottom ? ' bottom' : '');
    el.innerHTML = (opts.icon ? App.icon(opts.icon, opts.bottom ? 16 : 28) : '') + `<span>${App.esc(msg)}</span>`;
    ov.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), opts.duration || 1600);
  };
  App.loading = function (msg = '处理中…') {
    const ov = App.q('#overlay');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${App.icon('refresh', 28, 'spin')}<span>${App.esc(msg)}</span>`;
    ov.appendChild(el);
    return () => el.remove();
  };
  App.closeOverlay = function () {
    const ov = App.q('#overlay');
    App.qa('.mask, .sheet, .modal', ov).forEach((n) => n.remove());
  };
  App.sheet = function ({ title, items = [], cancel = '取消' }) {
    App.closeOverlay();
    const ov = App.q('#overlay');
    const mask = document.createElement('div'); mask.className = 'mask'; mask.onclick = App.closeOverlay;
    const sh = document.createElement('div'); sh.className = 'sheet';
    sh.innerHTML = `<div class="sheet-handle"></div>${title ? `<div class="sheet-title">${App.esc(title)}</div>` : ''}<div class="sheet-body">${items.map((it, i) => `<div class="sheet-item ${it.danger ? 'danger' : ''}" data-i="${i}">${it.icon ? App.icon(it.icon, 20) : ''}<div class="grow"><div>${App.esc(it.label)}</div>${it.sub ? `<div class="si-sub">${App.esc(it.sub)}</div>` : ''}</div>${it.right ? `<div class="muted small">${App.esc(it.right)}</div>` : ''}</div>`).join('')}</div><div class="sheet-cancel">${App.esc(cancel)}</div>`;
    sh.querySelector('.sheet-cancel').onclick = App.closeOverlay;
    App.qa('.sheet-item', sh).forEach((n) => { n.onclick = () => { App.closeOverlay(); const it = items[+n.dataset.i]; it.onSelect && it.onSelect(); }; });
    ov.appendChild(mask); ov.appendChild(sh);
  };
  App.modal = function ({ title, body, actions }) {
    App.closeOverlay();
    const ov = App.q('#overlay');
    const mask = document.createElement('div'); mask.className = 'mask';
    const m = document.createElement('div'); m.className = 'modal';
    const acts = actions || [{ label: '知道了', tone: 'primary' }];
    m.innerHTML = `<div class="m-title">${App.esc(title)}</div><div class="m-body">${body || ''}</div><div class="m-actions">${acts.map((a, i) => `<button class="btn ${a.tone || 'ghost'}" data-i="${i}">${App.esc(a.label)}</button>`).join('')}</div>`;
    App.qa('button', m).forEach((b) => { b.onclick = () => { App.closeOverlay(); const a = acts[+b.dataset.i]; a.onClick && a.onClick(); }; });
    ov.appendChild(mask); ov.appendChild(m);
  };
  App.confirm = (title, body, onOk, okLabel = '确认') => App.modal({ title, body, actions: [{ label: '取消', tone: 'ghost' }, { label: okLabel, tone: 'primary', onClick: onOk }] });
  App.prompt = function (title, placeholder, onOk, okLabel = '确定') {
    App.modal({
      title, body: `<textarea class="textarea" id="promptInput" placeholder="${App.esc(placeholder || '')}"></textarea>`,
      actions: [{ label: '取消', tone: 'ghost' }, { label: okLabel, tone: 'primary', onClick: () => onOk(App._promptVal || '') }],
    });
    const ta = App.q('#promptInput'); App._promptVal = '';
    if (ta) { ta.oninput = () => { App._promptVal = ta.value; }; setTimeout(() => ta.focus(), 50); }
  };

  /* ----------------------------------------------------------
     UI 片段（返回 HTML 字符串）
     ---------------------------------------------------------- */
  const ui = App.ui = {};
  ui.chip = (text, tone = 'gray', opts = {}) => `<span class="chip ${tone} ${opts.sm ? 'sm' : ''} ${opts.dot ? 'dot' : ''} ${opts.cls || ''}">${opts.icon ? App.icon(opts.icon, 12) : ''}${App.esc(text)}</span>`;
  ui.section = (title, right = '', eyebrow = '') => `<div class="section"><div>${eyebrow ? `<div class="eyebrow">${App.esc(eyebrow)}</div>` : ''}<h3>${App.esc(title)}</h3></div>${right ? `<div class="more">${right}</div>` : ''}</div>`;
  ui.cell = ({ title, sub, right, icon, iconTone = '', onclick, arrow = true, cls = '', badge }) => `<div class="cell ${onclick ? 'pressable' : ''} ${cls}" ${onclick ? `onclick="${onclick}"` : ''}>${icon ? `<div class="cell-icon ${iconTone}">${App.icon(icon, 20)}</div>` : ''}<div class="cell-body"><div class="cell-title row"><span class="ellipsis">${title}</span>${badge || ''}</div>${sub ? `<div class="cell-sub">${sub}</div>` : ''}</div><div class="cell-right">${right || ''}${arrow && onclick ? App.icon('chevron-right', 16) : ''}</div></div>`;
  ui.empty = ({ icon = 'inbox', title, sub, action }) => `<div class="empty"><div class="ico">${App.icon(icon, 30)}</div><div class="t">${App.esc(title)}</div>${sub ? `<div class="s">${App.esc(sub)}</div>` : ''}${action ? `<div class="mt12">${action}</div>` : ''}</div>`;
  ui.kpis = (items, four) => `<div class="kpis ${four ? 'four' : ''}">${items.map((k) => `<div class="kpi ${k.tone || ''}" ${k.onclick ? `onclick="${k.onclick}" style="cursor:pointer"` : ''}><div class="v">${k.value}</div><div class="l">${App.esc(k.label)}</div>${k.sub ? `<div class="s muted">${k.sub}</div>` : ''}</div>`).join('')}</div>`;
  ui.avatar = (name, cls = '') => `<div class="avatar ${cls}">${App.esc(App.initials(name))}</div>`;
  ui.stepper = (steps, current, opts = {}) => `<div class="stepper">${steps.map((s, i) => `<div class="step ${i < current ? 'done' : ''} ${i === current ? (opts.error ? 'error' : 'current') : ''}">${App.esc(s)}</div>`).join('')}</div>`;
  ui.progress = (pct, ai) => `<div class="progress ${ai ? 'ai' : ''}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
  ui.notice = (tone, text, icon) => `<div class="notice ${tone}">${App.icon(icon || ({ warn: 'alert', danger: 'alert', info: 'info', ok: 'check-circle', ai: 'sparkle', gray: 'info' }[tone] || 'info'), 16)}<div>${text}</div></div>`;
  ui.aiCard = ({ title = 'AI 建议', meta = '派生数据 · 不改正式值', body, note }) => `<div class="ai-card"><div class="ai-head"><div class="ai-logo">${App.icon('sparkle', 15)}</div><div class="grow"><div class="t">${App.esc(title)}</div><div class="m">${App.esc(meta)}</div></div></div><div class="ai-body">${body}</div>${note ? `<div class="ai-note">${App.icon('info', 12)}${note}</div>` : ''}</div>`;
  ui.factTag = (kind) => ({ fact: '<span class="fact-tag fact">已确认事实</span>', derived: '<span class="fact-tag derived">AI 派生</span>', pending: '<span class="fact-tag pending">待核实</span>', official: '<span class="fact-tag official">正式值</span>' }[kind] || '');
  ui.btn = (label, { tone = 'primary', onclick = '', block = false, size = '', icon = '', disabled = false, cls = '' } = {}) => `<button class="btn ${tone} ${block ? 'block' : ''} ${size} ${cls}" ${disabled ? 'disabled' : ''} ${onclick ? `onclick="${onclick}"` : ''}>${icon ? App.icon(icon, 18) : ''}${App.esc(label)}</button>`;
  ui.kv = (pairs) => `<dl class="kv">${pairs.map(([k, v]) => `<dt>${App.esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
  ui.bars = (rows, tone = '') => { const max = Math.max(1, ...rows.map((r) => r.value)); return `<div class="bars">${rows.map((r) => `<div class="bar-row"><div class="bl ellipsis">${App.esc(r.label)}</div><div class="bt"><i class="${r.tone || tone}" style="width:${Math.round((r.value / max) * 100)}%"></i></div><div class="bv">${r.display != null ? r.display : r.value}</div></div>`).join('')}</div>`; };
  ui.timeline = (items) => `<div class="timeline">${items.map((it) => `<div class="tl-item ${it.tone || ''}"><div class="tl-time">${App.esc(it.time)}${it.tag ? ` · ${it.tag}` : ''}</div><div class="tl-title">${it.title}</div>${it.body ? `<div class="tl-body">${it.body}</div>` : ''}</div>`).join('')}</div>`;
  ui.p1Banner = (text = '包 B / P1 预览 · 依赖报价规则、合同模板与审批接口，首期不承诺') => `<div class="p1-banner">${App.icon('flag', 14)}<span>${App.esc(text)}</span></div>`;
  // 状态芯片：合作状态 / 客诉 / 商机阶段
  ui.coopChip = (s) => ({ active: ui.chip('服务中', 'brand', { dot: true }), paused: ui.chip('停做', 'danger', { dot: true }), none: ui.chip('未合作', 'gray', { dot: true }) }[s] || '');
  ui.complaintChip = (c) => {
    if (!c) return '';
    if (c.status === 'open') return ui.chip('未结客诉', 'danger', { icon: 'alert' });
    if (c.status === 'not_connected') return ui.chip('客诉未接入', 'gray', { icon: 'cloud-off' });
    if (c.status === 'stale') return ui.chip('数据待更新', 'warn', { icon: 'clock' });
    if (c.status === 'closed') return ui.chip('客诉已结', 'gray');
    return '';
  };
  ui.stageChip = (stage) => ui.chip(stage, ({ 待触达: 'gray', 已触达: 'info', 需求确认: 'info', 方案沟通: 'warn', 报价商务: 'warn', 待签约: 'brand', 已赢单: 'ok', 已丢单: 'danger', 暂停培育: 'gray', 待判断: 'gray' }[stage] || 'gray'));
  ui.tierChip = (t, opts) => ui.chip(App.tierLabel(t), App.tierTone(t), opts);
  ui.taskStatusChip = (st) => ui.chip(({ todo: '待办', doing: '进行中', done: '已完成', rescheduled: '已改期', cancelled: '已取消' }[st] || st), ({ todo: 'info', doing: 'warn', done: 'ok', rescheduled: 'gray', cancelled: 'gray' }[st] || 'gray'));
  ui.visitStatusChip = (st) => ui.chip(({ draft: '本地草稿', uploading: '上传中', ai: 'AI处理中', pending_confirm: '待确认', saved: '已保存/待同步', synced: '同步成功', failed: '同步失败' }[st] || st), ({ draft: 'gray', uploading: 'info', ai: 'ai', pending_confirm: 'warn', saved: 'info', synced: 'ok', failed: 'danger' }[st] || 'gray'));
  // 简单 SVG 场景（门头 / 后厨），用于照片占位
  ui.scene = (kind = 'storefront', label = '') => {
    const scenes = {
      storefront: `<svg class="scene" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#eff6ff"/></linearGradient></defs><rect width="160" height="120" fill="url(#sk)"/><rect x="0" y="86" width="160" height="34" fill="#cbd5e1"/><rect x="14" y="30" width="132" height="60" fill="#f8fafc" stroke="#94a3b8"/><rect x="14" y="30" width="132" height="16" fill="#b91c1c"/><rect x="40" y="35" width="80" height="6" rx="2" fill="#fee2e2"/><rect x="24" y="52" width="36" height="34" fill="#93c5fd"/><rect x="66" y="52" width="28" height="34" fill="#7f1d1d"/><rect x="100" y="52" width="36" height="34" fill="#93c5fd"/><rect x="18" y="46" width="124" height="4" fill="#ef4444"/><circle cx="130" cy="18" r="8" fill="#fde68a"/></svg>`,
      kitchen: `<svg class="scene" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#e7e5e4"/><rect x="0" y="70" width="160" height="50" fill="#a8a29e"/><rect x="10" y="40" width="60" height="34" fill="#d6d3d1" stroke="#78716c"/><rect x="80" y="30" width="70" height="44" fill="#e5e7eb" stroke="#9ca3af"/><rect x="88" y="36" width="54" height="8" fill="#9ca3af"/><rect x="0" y="0" width="160" height="14" fill="#57534e"/><circle cx="34" cy="92" r="5" fill="#44403c"/><path d="M28 96 q6 -6 12 0" stroke="#292524" stroke-width="2" fill="none"/><rect x="118" y="82" width="22" height="24" fill="#78716c"/></svg>`,
      corner: `<svg class="scene" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#d6d3d1"/><path d="M0 0 L80 40 L80 120 L0 120z" fill="#a8a29e"/><path d="M160 0 L80 40 L80 120 L160 120z" fill="#c7c2bd"/><rect x="62" y="84" width="36" height="20" fill="#57534e"/><circle cx="70" cy="110" r="3" fill="#292524"/><circle cx="78" cy="113" r="2" fill="#292524"/><circle cx="86" cy="110" r="2.5" fill="#292524"/></svg>`,
      pest: `<svg class="scene" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#f5f5f4"/><rect x="0" y="80" width="160" height="40" fill="#e7e5e4"/><ellipse cx="80" cy="66" rx="22" ry="12" fill="#3f3f46"/><circle cx="102" cy="62" r="7" fill="#3f3f46"/><path d="M58 66 q-20 8 -34 4" stroke="#3f3f46" stroke-width="2" fill="none"/><path d="M70 76 l-4 8 M90 76 l4 8 M76 56 l-3 -8 M86 56 l3 -8" stroke="#3f3f46" stroke-width="2"/></svg>`,
      pest2: `<svg class="scene" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#fafaf9"/><rect x="0" y="0" width="160" height="120" fill="#e7e5e4" opacity=".5"/><ellipse cx="80" cy="62" rx="9" ry="16" fill="#7c2d12"/><ellipse cx="80" cy="46" rx="6" ry="6" fill="#7c2d12"/><path d="M71 56 l-14 -6 M71 64 l-16 2 M71 72 l-12 8 M89 56 l14 -6 M89 64 l16 2 M89 72 l12 8" stroke="#7c2d12" stroke-width="2"/><path d="M76 40 l-6 -12 M84 40 l6 -12" stroke="#7c2d12" stroke-width="1.5"/></svg>`,
      blur: `<svg class="scene" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><defs><filter id="bl"><feGaussianBlur stdDeviation="6"/></filter></defs><rect width="160" height="120" fill="#e5e7eb"/><g filter="url(#bl)"><rect x="20" y="30" width="60" height="50" fill="#9ca3af"/><circle cx="110" cy="60" r="24" fill="#6b7280"/></g></svg>`,
      doc: `<svg class="scene" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#f1f5f9"/><rect x="30" y="10" width="100" height="120" fill="#fff" stroke="#cbd5e1"/><rect x="42" y="22" width="60" height="6" fill="#0e8f6e"/><rect x="42" y="36" width="76" height="3" fill="#cbd5e1"/><rect x="42" y="44" width="70" height="3" fill="#cbd5e1"/><rect x="42" y="52" width="76" height="3" fill="#cbd5e1"/><rect x="42" y="64" width="34" height="24" fill="#dbeafe"/><rect x="82" y="64" width="34" height="24" fill="#e7e5e4"/><rect x="42" y="96" width="76" height="3" fill="#cbd5e1"/></svg>`,
    };
    return `<div class="photo ${label ? '' : ''}">${scenes[kind] || scenes.storefront}${label ? `<div class="cap">${App.esc(label)}</div>` : ''}</div>`;
  };

  /* ----------------------------------------------------------
     导航
     ---------------------------------------------------------- */
  App.register = function (id, def) { App.screens[id] = Object.assign({ id }, def); };
  App.currentEntry = () => App.stack[App.stack.length - 1];
  App.currentTab = () => (App.stack[0] ? App.stack[0].id : 'today');

  function navbarHtml(entry, def, ctx) {
    const nav = (typeof def.nav === 'function' ? def.nav(entry.params, ctx) : def.nav) || {};
    const title = nav.title != null ? nav.title : (def.title || '');
    const showBack = App.stack.length > 1;
    const left = showBack
      ? `<button onclick="App.back()" aria-label="返回">${App.icon('chevron-left', 24)}</button>${nav.left || ''}`
      : (nav.left || '');
    return `<div class="navbar ${nav.solid ? 'solid' : ''}"><div class="nav-left">${left}</div><div class="nav-title">${App.esc(title)}</div><div class="capsule"><span>${App.icon('more', 18)}</span><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg></span></div></div>`;
  }
  function tabbarHtml(active) {
    const badges = (window.DATA.tabBadges && window.DATA.tabBadges(App.state)) || {};
    return `<div class="tabbar">${TABS.map((t) => `<div class="tab ${t.id === active ? 'active' : ''}" onclick="App.tab('${t.id}')">${App.icon(t.icon, 24)}<span>${t.label}</span>${badges[t.id] ? `<span class="badge">${badges[t.id]}</span>` : ''}</div>`).join('')}</div>`;
  }
  App.renderEntry = function (entry) {
    const def = App.screens[entry.id];
    const ctx = { params: entry.params, state: App.state, entry };
    let body = '';
    try { body = def.render(entry.params, ctx) || ''; } catch (e) { console.error(e); body = `<div class="notice danger">页面渲染失败：${App.esc(e.message)}</div>`; }
    const isTabRoot = TAB_ROOTS.includes(entry.id);
    const footer = typeof def.footer === 'function' ? (def.footer(entry.params, ctx) || '') : '';
    entry.el.innerHTML = `${navbarHtml(entry, def, ctx)}<div class="content ${isTabRoot ? 'has-tab' : ''} ${def.flush ? 'flush' : ''}">${body}</div>${footer ? `<div class="footer-bar">${footer}</div>` : ''}${isTabRoot ? tabbarHtml(entry.id) : ''}`;
    try { def.mount && def.mount(entry.el, entry.params, ctx); } catch (e) { console.error(e); }
  };
  App._mount = function (entry, anim) {
    const stage = App.q('#stage');
    const el = document.createElement('div');
    el.className = 'screen';
    el.dataset.key = entry.key;
    entry.el = el;
    App.renderEntry(entry);
    stage.appendChild(el);
    const prev = App.stack[App.stack.length - 2];
    if (anim === 'push' && prev) {
      el.classList.add('enter');
      // 强制回流后启动过渡
      void el.offsetWidth;
      el.classList.add('enter-active');
      setTimeout(() => { el.classList.remove('enter', 'enter-active'); if (prev.el) prev.el.classList.add('under'); }, 330);
    } else {
      el.classList.add('fade');
      if (prev && prev.el) prev.el.classList.add('under');
    }
    App._syncHash();
    App._updatePresenter();
  };
  App.go = function (id, params = {}) {
    if (!App.screens[id]) { console.warn('unknown screen', id); App.toast('该页面尚未纳入演示'); return; }
    App.closeOverlay();
    const entry = { id, params: params || {}, key: ++App._seq };
    App.stack.push(entry);
    App._mount(entry, 'push');
  };
  App.replace = function (id, params = {}) {
    const top = App.stack.pop();
    if (top && top.el) top.el.remove();
    const entry = { id, params: params || {}, key: ++App._seq };
    App.stack.push(entry);
    App._mount(entry, 'none');
  };
  App.back = function (n = 1) {
    App.closeOverlay();
    if (App.stack.length <= 1) return;
    while (n-- > 1 && App.stack.length > 2) { const mid = App.stack.splice(App.stack.length - 2, 1)[0]; if (mid.el) mid.el.remove(); }
    const top = App.stack.pop();
    const next = App.stack[App.stack.length - 1];
    if (next.el) { next.el.classList.remove('under'); App.renderEntry(next); }
    if (top.el) {
      top.el.classList.add('leave');
      void top.el.offsetWidth;
      top.el.classList.add('leave-active');
      setTimeout(() => top.el && top.el.remove(), 300);
    }
    App._syncHash();
    App._updatePresenter();
  };
  App.popTo = function (id) {
    while (App.stack.length > 1 && App.currentEntry().id !== id) {
      const top = App.stack.pop(); if (top.el) top.el.remove();
    }
    const next = App.currentEntry();
    if (next && next.el) { next.el.classList.remove('under'); App.renderEntry(next); }
    App._syncHash(); App._updatePresenter();
  };
  App.tab = function (tabId) {
    App.closeOverlay();
    App.stack.forEach((e) => e.el && e.el.remove());
    App.stack = [];
    const entry = { id: tabId, params: {}, key: ++App._seq };
    App.stack.push(entry);
    App._mount(entry, 'none');
  };
  // 原地刷新当前页（保留滚动位置）
  App.refresh = function () {
    const top = App.currentEntry();
    if (!top || !top.el) return;
    const c = top.el.querySelector('.content');
    const st = c ? c.scrollTop : 0;
    App.renderEntry(top);
    const c2 = top.el.querySelector('.content');
    if (c2) c2.scrollTop = st;
    App._updatePresenter();
  };
  App.scrollTop = function () { const c = App.currentEntry() && App.currentEntry().el.querySelector('.content'); if (c) c.scrollTop = 0; };

  // hash：#/screen?a=1&b=2
  App._syncHash = function () {
    const top = App.currentEntry();
    if (!top) return;
    const qs = Object.keys(top.params).filter((k) => typeof top.params[k] !== 'object').map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(top.params[k])}`).join('&');
    App._ignoreHash = true;
    location.hash = `/${top.id}${qs ? '?' + qs : ''}`;
    setTimeout(() => { App._ignoreHash = false; }, 0);
  };
  App.openFromHash = function () {
    const h = location.hash.replace(/^#\/?/, '');
    if (!h) { App.tab('today'); return; }
    const [id, qs] = h.split('?');
    const params = {};
    (qs || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    if (params.role && App.state.users[params.role]) { App.state.role = params.role; App.save(); }
    const def = App.screens[id];
    if (!def) { App.tab('today'); return; }
    if (TAB_ROOTS.includes(id)) { App.tab(id); return; }
    App.tab(def.tab || 'today');
    App.go(id, params);
  };

  /* ----------------------------------------------------------
     演示导览面板
     ---------------------------------------------------------- */
  App._updatePresenter = function () {
    const p = App.q('#presenter'); if (!p) return;
    const top = App.currentEntry(); const def = top ? App.screens[top.id] : null;
    const roles = Object.keys(App.state.users);
    const guide = window.DATA.GUIDE || [];
    const curIdx = guide.findIndex((g) => g.screen === (top && top.id) && (!g.match || g.match(top.params)));
    App.q('#p-roles').innerHTML = roles.map((r) => { const u = App.state.users[r]; return `<div class="role ${App.state.role === r ? 'active' : ''}" onclick="App.setRole('${r}')"><div class="r-av" style="background:${u.color}">${App.esc(App.initials(u.name))}</div><div>${App.esc(u.roleName)}</div></div>`; }).join('');
    App.q('#p-steps').innerHTML = guide.map((g, i) => `<div class="step-item ${i === curIdx ? 'active' : ''}" onclick="App.guideGo(${i})"><div class="n">${i + 1}</div><div><div>${App.esc(g.title)}</div>${g.sub ? `<div class="sub">${App.esc(g.sub)}</div>` : ''}</div></div>`).join('');
    const prd = (def && def.prd) || []; const rules = (def && def.rules) || [];
    App.q('#p-cur').innerHTML = def ? `<div class="cur-screen">${App.esc(def.title || def.id)}<small>${App.esc(def.id)}</small></div><div class="prd-chips">${prd.map((x) => `<span class="prd-chip">${App.esc(x)}</span>`).join('')}${rules.map((x) => `<span class="prd-chip rule">${App.esc(x)}</span>`).join('')}</div>` : '';
    const acts = (def && def.demoActions) || [];
    App.q('#p-demo-actions').innerHTML = acts.length ? acts.map((a, i) => `<button class="p-btn" onclick="App.runDemoAction(${i})">${App.icon(a.icon || 'play', 14)}${App.esc(a.label)}</button>`).join('') : '<div class="muted tiny">当前页面无额外演示动作</div>';
  };
  App.guideGo = function (i) {
    const g = (window.DATA.GUIDE || [])[i]; if (!g) return;
    if (g.role && App.state.role !== g.role) { App.state.role = g.role; }
    if (g.prepare) { try { g.prepare(App.state); } catch (e) { console.error(e); } }
    App.save();
    const def = App.screens[g.screen]; if (!def) return;
    if (TAB_ROOTS.includes(g.screen)) App.tab(g.screen); else { App.tab(def.tab || 'today'); if (g.via) g.via.forEach((v) => App.go(v.screen, v.params || {})); App.go(g.screen, g.params || {}); }
    if (g.after) setTimeout(() => g.after(), 350);
    App.togglePresenter(false);
  };
  App.runDemoAction = function (i) {
    const def = App.screens[App.currentEntry().id]; const a = def && def.demoActions && def.demoActions[i];
    if (a) a.run();
  };
  App.togglePresenter = function (force) {
    const p = App.q('#presenter'); if (!p) return;
    const open = force == null ? !p.classList.contains('open') : !!force;
    p.classList.toggle('open', open);
  };

  /* ----------------------------------------------------------
     启动
     ---------------------------------------------------------- */
  App.boot = function () {
    App.state = App.load();
    // 状态栏时间
    const sb = App.q('#statusbar');
    if (sb) sb.innerHTML = `<span>9:41</span><span class="right">${App.icon('signal', 16)}${App.icon('wifi', 16)}${App.icon('battery', 22)}</span>`;
    window.addEventListener('hashchange', () => { if (!App._ignoreHash) App.openFromHash(); });
    App.openFromHash();
  };
})();
