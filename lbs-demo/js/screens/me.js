/* ============================================================
   我的模块：me（Tab 根）
   命名空间 window.S_ME；页面专属样式通过 App.css('me') 注入
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_ME = {};
  const esc = App.esc;

  App.css('me', `
  .me-acc { border-radius: 20px; padding: 18px 16px 16px; color: #fff; margin-bottom: 14px; position: relative; overflow: hidden;
    background: linear-gradient(135deg, #16355f 0%, #0f2444 60%, #0b1a33 100%); box-shadow: 0 10px 24px rgba(15,36,68,.28); }
  .me-acc::after { content: ""; position: absolute; right: -40px; top: -60px; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,.08); }
  .me-acc > * { position: relative; z-index: 1; }
  .me-acc .top { display: flex; align-items: center; gap: 14px; }
  .me-acc .avatar.lg { width: 60px; height: 60px; font-size: 24px; background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.35); box-shadow: 0 6px 16px rgba(0,0,0,.2); }
  .me-acc .nm { font-size: 21px; font-weight: 800; letter-spacing: -.01em; display: flex; align-items: center; gap: 8px; }
  .me-acc .nm .fic { font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.22); letter-spacing: .04em; }
  .me-acc .rl { font-size: 13px; opacity: .85; margin-top: 4px; line-height: 1.4; }
  .me-acc .top .grow { min-width: 0; }
  .me-acc .sw { height: 30px; padding: 0 12px; border-radius: 999px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.28); color: #fff; font-size: 12.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; flex: none; }
  .me-acc .stats { display: flex; gap: 8px; margin-top: 14px; }
  .me-acc .stats .m { flex: 1; background: rgba(255,255,255,.1); border-radius: 12px; padding: 9px 10px; }
  .me-acc .stats .m .v { font-size: 18px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .me-acc .stats .m .l { font-size: 11px; opacity: .8; margin-top: 3px; white-space: nowrap; }
  .me-grp { font-size: 11.5px; font-weight: 600; color: var(--ink-3); letter-spacing: .06em; margin: 14px 4px 6px; }
  .me-switch { position: relative; width: 50px; height: 30px; border-radius: 15px; background: #d9dfe8; transition: background .2s ease; flex: none; cursor: pointer; }
  .me-switch::after { content: ""; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.18); transition: transform .2s cubic-bezier(.2,.8,.2,1); }
  .me-switch.on { background: var(--brand); }
  .me-switch.on::after { transform: translateX(20px); }
  .me-perm { display: flex; align-items: center; gap: 12px; padding: 11px 14px; background: var(--surface); }
  .me-perm + .me-perm { border-top: .5px solid var(--line); }
  .me-perm .pi { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex: none; }
  .me-perm .pi.rose { background: #fbe4e2; color: #b8433a; }
  .me-perm .pi.brand { background: var(--brand-soft); color: var(--brand); }
  .me-perm .pi.navy { background: #e4e9f3; color: #0f2444; }
  .me-perm .pt { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
  .me-perm .ps { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
  .me-note { padding: 8px 14px 10px; font-size: 12px; color: var(--ink-3); background: var(--surface); border-top: .5px solid var(--line); display: flex; gap: 6px; align-items: flex-start; line-height: 1.45; }
  .me-note svg { flex: none; margin-top: 2px; }
  .me-ver { text-align: center; font-size: 11px; color: var(--ink-4); padding: 6px 12px 4px; line-height: 1.6; }
  .me-modal-list { display: flex; flex-direction: column; gap: 8px; text-align: left; }
  .me-modal-list .it { display: flex; gap: 8px; align-items: flex-start; font-size: 13.5px; line-height: 1.5; }
  .me-modal-list .it b { flex: none; min-width: 52px; color: var(--ink); }
  .me-modal-list .it.sm { font-size: 12.5px; color: var(--ink-3); }
  .me-rule { display: flex; gap: 8px; align-items: flex-start; font-size: 13.5px; line-height: 1.5; padding: 6px 0; border-bottom: .5px solid var(--line); text-align: left; }
  .me-rule:last-child { border-bottom: 0; }
  .me-rule .n { width: 20px; height: 20px; border-radius: 6px; background: var(--brand-soft); color: var(--brand-3); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; margin-top: 1px; }
  .me-about { text-align: center; }
  .me-about .logo { width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 10px; background: linear-gradient(135deg, #16355f, #0f2444); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; }
  .me-about .t { font-size: 16px; font-weight: 700; color: var(--ink); }
  .me-about .s { font-size: 12.5px; color: var(--ink-3); margin-top: 4px; line-height: 1.6; }
  `);

  const PERMS = [
    { key: 'mic', title: '录音', sub: '语音留痕 · 仅在点击「开始」后录制', icon: 'mic', tone: 'rose' },
    { key: 'geo', title: '定位', sub: '到店打点与扫街辅助 · 只在拜访期间打点', icon: 'map-pin', tone: 'brand' },
    { key: 'cam', title: '相机', sub: '拍门头 / 名片 / 营业执照 · 拍照识虫', icon: 'camera', tone: 'navy' },
  ];
  const ACCOUNTS = [
    { role: 'dj', sub: '地推一队 · 本人客户 · 一马路 / 二马路 / 张江工业园' },
    { role: 'ka', sub: 'KA 部 · 华东 · 集团客户及协作门店' },
    { role: 'mgr', sub: '地推一队 · 直属 7 人 · 本人与直属团队' },
  ];

  S.togglePerm = function (key) {
    const p = App.state.perms; p[key] = !p[key]; App.save(); App.refresh();
    const t = PERMS.find((x) => x.key === key).title;
    App.toast(`${t}已${p[key] ? '开启' : '关闭'}${!p[key] && key === 'geo' ? ' · 打点改为手动选址' : ''}${!p[key] && key === 'mic' ? ' · 留痕改为文字' : ''}`, { bottom: true, icon: p[key] ? 'check-circle' : 'x' });
  };
  S.notif = function () {
    const n = App.state.ui.notif || (App.state.ui.notif = { brief: true, remind: true, task: true });
    const open = () => App.sheet({ title: '消息与晨报 · 推送设置（演示）', items: [
      { label: `晨报 07:30 推送 · ${n.brief ? '已开启' : '已关闭'}`, sub: '今日路线 / 回访提醒 / 待办一屏', icon: 'sun', right: n.brief ? '关闭' : '开启', onSelect: () => { n.brief = !n.brief; App.save(); App.toast(`晨报推送已${n.brief ? '开启' : '关闭'}`, { bottom: true }); } },
      { label: `回访提醒 · ${n.remind ? '已开启' : '已关闭'}`, sub: '按分层周期与上次约定到期提醒', icon: 'bell', right: n.remind ? '关闭' : '开启', onSelect: () => { n.remind = !n.remind; App.save(); App.toast(`回访提醒已${n.remind ? '开启' : '关闭'}`, { bottom: true }); } },
      { label: `任务通知 · ${n.task ? '已开启' : '已关闭'}`, sub: '主管催办 / 辅导 / 下发 / 审批结果', icon: 'message', right: n.task ? '关闭' : '开启', onSelect: () => { n.task = !n.task; App.save(); App.toast(`任务通知已${n.task ? '开启' : '关闭'}`, { bottom: true }); } },
    ] });
    open();
  };
  S.scope = function () {
    App.modal({ title: '数据范围', body: `<div class="me-modal-list">
      <div class="it"><b>销售</b><span>只看本人负责的客户、拜访记录与待办。</span></div>
      <div class="it"><b>主管</b><span>看本人与直属团队（地推一队 7 人）的留痕、审批与低分记录。</span></div>
      <div class="it"><b>KA</b><span>协同客户按分配可见；集团多站点门店按分配授权。</span></div>
      <div class="it"><b>区域</b><span>区域负责人看本区域（本演示未包含）。</span></div>
      <div class="it sm"><span>当前账号：${esc(App.me().name)} · ${esc(App.me().roleName)} · ${esc(App.me().scope)}。数据范围按组织与角色判定，由企业管理后台配置并写入审计（deck p31）。</span></div></div>` });
  };
  S.switchAccount = function () {
    const cur = App.state.role;
    App.sheet({ title: '切换演示账号（均虚构）', items: ACCOUNTS.map((a) => { const u = App.state.users[a.role]; return { label: `${u.roleName} · ${u.name}`, sub: a.sub, icon: a.role === 'mgr' ? 'users' : a.role === 'ka' ? 'briefcase' : 'user', right: cur === a.role ? '当前' : '', onSelect: () => { if (cur !== a.role) App.setRole(a.role); } }; }) });
  };
  S.admin = function () {
    App.modal({ title: '管理员请使用企业管理后台', body: `<div class="muted small" style="text-align:center">管理员的配置界面在 PC 端「企业管理后台」，小程序不提供配置入口。后台可配：</div>
      <div class="chips mt12" style="justify-content:center">${['字段（16 + 4）', '评分门槛 60 分', '分层规则（带版本）', '扫街展示项（按部门）', '三类模版', '知识库', '热词', 'CRM 对接'].map((x) => App.ui.chip(x, 'outline')).join('')}</div>
      <div class="muted tiny mt12" style="text-align:center">配置变更记录操作人、时间与前后值，写入审计日志</div>`, actions: [{ label: '知道了', tone: 'primary' }] });
  };
  S.rules = function () {
    const rules = ['门槛 60 分为会议纪要口径；低于门槛归档禁用并给分项理由与 AI 建议。', '五维权重（逻辑结构 20 / 事实细节 25 / 客户原声与证据 20 / 沟通结论 20 / 表达清晰度 15）为产品默认值，可在后台调整。', '分层四象限阈值为演示值，由贵司提供；规则带版本，销售端不可手改。', '热词只提升识别准确率，不作承诺；识虫为预置样本，需贵司样本共同验证。', '30 秒留痕为设计目标；语音、识别、抽取、问答与生成由日日新大模型能力承担（原型为规则模拟）。'];
    App.modal({ title: '演示规则说明', body: `<div>${rules.map((r, i) => `<div class="me-rule"><div class="n">${i + 1}</div><div>${esc(r)}</div></div>`).join('')}</div>` });
  };
  S.help = function () { App.toast('已提交反馈，管理员在后台可见（演示）', { icon: 'message' }); };
  S.about = function () {
    App.modal({ title: '关于', body: `<div class="me-about"><div class="logo">销</div><div class="t">商汤 AI 销售管理平台</div><div class="s">销售智助（暂用名）· v1.0 演示<br>演示日期 2026-09-07 · 演示数据均为虚构<br>商汤科技 · 大模型生态渠道部</div></div>` });
  };
  S.logout = function () {
    App.confirm('退出登录？', '演示环境退出后会回到首页；本地演示数据不会清除。', () => { App.toast('已退出登录（演示）', { icon: 'logout' }); App.tab('home'); }, '退出');
  };
  S.resetData = function () { App.confirm('重置演示数据？', '恢复到演示初始状态（授权页、丙店未归档、任务未处理）。', () => App.reset(), '重置'); };

  S.myStats = function () {
    const st = App.state, me = App.me();
    if (App.isMgr()) { const k = st.team.kpi; return [{ v: `${Math.round(k.traceRate * 100)}%`, l: '团队留痕率' }, { v: k.traced, l: '已留痕 · 7 天' }, { v: k.avgScore, l: '平均分' }, { v: k.pendingApprovals, l: '待审批' }]; }
    const mine = st.stores.filter((s) => s.ownerId === me.id);
    const checked = mine.filter((s) => s.route && ['done', 'running', 'pending'].includes(s.route.trace)).length;
    const traced = mine.filter((s) => s.route && s.route.trace === 'done').length;
    const vs = st.visits.filter((v) => v.by === me.name);
    const avg = vs.length ? Math.round(vs.reduce((a, v) => a + v.score.total, 0) / vs.length) : 0;
    return [{ v: mine.length, l: '我的客户' }, { v: `${traced}/${checked}`, l: '今日留痕 / 打点' }, { v: avg || '—', l: '平均分' }, { v: st.tasks.filter((t) => t.toId === me.id && t.status !== '已完成').length, l: '待办' }];
  };

  App.register('me', {
    title: '我的', tab: 'me',
    prd: ['deck p12 · 授权明示', 'deck p31 · 数据范围'],
    rules: ['录音 / 定位 / 相机可关可看状态，只在拜访期间打点', '销售看本人客户；主管看直属团队；KA 协同客户按分配可见', '管理员配置在企业管理后台'],
    render() {
      const st = App.state, me = App.me(), p = st.perms;
      const n = st.ui.notif || { brief: true, remind: true, task: true };
      const stats = S.myStats();
      const acc = `<div class="me-acc"><div class="top">${App.ui.avatar(me.name, 'lg')}<div class="grow"><div class="nm"><span>${esc(me.name)}</span><span class="fic">虚构</span></div><div class="rl">${esc(me.roleName)} · ${esc(me.org)}</div><div class="rl" style="opacity:.7;font-size:12px">${esc(me.phone || '')}</div></div><button class="sw" onclick="S_ME.switchAccount()">${App.icon('refresh', 13)}切换账号</button></div>
        <div class="stats">${stats.map((x) => `<div class="m"><div class="v">${esc(x.v)}</div><div class="l">${esc(x.l)}</div></div>`).join('')}</div></div>`;
      const permRows = PERMS.map((x) => `<div class="me-perm"><div class="pi ${x.tone}">${App.icon(x.icon, 18)}</div><div class="grow"><div class="pt">${esc(x.title)}${p[x.key] ? App.ui.chip('已授权', 'ok', { sm: true, dot: true }) : App.ui.chip('未授权', 'gray', { sm: true, dot: true })}</div><div class="ps">${esc(x.sub)}</div></div><div class="me-switch ${p[x.key] ? 'on' : ''}" role="switch" aria-checked="${!!p[x.key]}" onclick="S_ME.togglePerm('${x.key}')"></div></div>`).join('');
      const perms = `<div class="me-grp">授权状态</div><div class="list">${permRows}<div class="me-note">${App.icon('shield', 13)}<span>只在拜访期间打点，结束即停止；录音原文与音频保存在贵司租户内。用途说明见 <a class="link" onclick="App.go('auth')">授权页 ›</a></span></div></div>`;
      const cells1 = `<div class="me-grp">账号与范围</div><div class="list">
        ${App.ui.cell({ title: '数据范围', sub: esc(me.scope), icon: 'shield', iconTone: 'info', onclick: 'S_ME.scope()' })}
        ${App.ui.cell({ title: '消息与晨报', sub: `晨报 07:30 ${n.brief ? '开' : '关'} · 回访提醒 ${n.remind ? '开' : '关'} · 任务通知 ${n.task ? '开' : '关'}`, icon: 'bell', iconTone: 'warn', onclick: 'S_ME.notif()' })}
        ${App.ui.cell({ title: '切换演示账号', sub: '地推销售 王小明 / KA 销售 陈奕辰 / 销售主管 李华（均虚构）', icon: 'users', iconTone: '', onclick: 'S_ME.switchAccount()', badge: App.ui.chip(me.roleName, 'brand', { sm: true }) })}
        ${App.ui.cell({ title: '管理员请使用企业管理后台', sub: '字段 · 门槛 · 分层规则 · 模版 · 知识库 · 热词 · CRM 对接', icon: 'settings', iconTone: 'gray', onclick: 'S_ME.admin()' })}
      </div>`;
      const cells2 = `<div class="me-grp">帮助</div><div class="list">
        ${App.ui.cell({ title: '演示规则说明', sub: '门槛 60 分 · 五维权重 · 分层阈值为演示值 · 热词', icon: 'doc', iconTone: 'ai', onclick: 'S_ME.rules()' })}
        ${App.ui.cell({ title: '帮助与反馈', sub: '常见问题 · 反馈给管理员', icon: 'question', iconTone: 'info', onclick: 'S_ME.help()' })}
        ${App.ui.cell({ title: '关于', sub: '销售智助（暂用名）· v1.0 演示', icon: 'info', iconTone: 'gray', onclick: 'S_ME.about()' })}
        ${App.ui.cell({ title: '重置演示数据', sub: '恢复到演示初始状态', icon: 'refresh', iconTone: 'warn', onclick: 'S_ME.resetData()' })}
      </div>`;
      const logout = `<div class="list">${App.ui.cell({ title: '<span style="color:var(--danger);font-weight:600">退出登录</span>', icon: 'logout', iconTone: 'danger', onclick: 'S_ME.logout()', arrow: false })}</div>`;
      const ver = `<div class="me-ver">销售智助 v1.0 演示 · 商汤 AI 销售管理平台 · 商汤科技 · 大模型生态渠道部<br>语音、识别、抽取、问答与生成由日日新大模型能力承担（原型为规则模拟）</div>`;
      return acc + perms + cells1 + cells2 + logout + ver;
    },
    demoActions: [
      { label: '一键开启三项授权', icon: 'shield', run() { App.state.perms = { mic: true, geo: true, cam: true }; App.save(); App.refresh(); App.toast('三项授权已开启', { icon: 'shield' }); } },
      { label: '切到主管账号', icon: 'users', run() { App.setRole('mgr'); App.tab('me'); } },
    ],
  });
})();
