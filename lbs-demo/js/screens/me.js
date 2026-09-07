/* ============================================================
   我的 / 同步中心 / 通知设置
   页面：me（Tab 根）· sync-center · settings-notify
   ============================================================ */
(function () {
  'use strict';
  const S = window.S_ME = {};
  const ui = () => App.ui;

  /* ---------- 取数 ---------- */
  const failedUploads = () => (App.state.sync.uploads || []).filter((u) => u.status === 'failed');
  const drafts = () => App.state.sync.drafts || [];
  const mineVisit = (v) => App.isMgr() || v.by === App.me().name;
  const pendingVisits = () => App.state.visits.filter((v) => mineVisit(v) && (v.status === 'saved' || v.status === 'failed'));
  const issueCount = () => failedUploads().length + App.state.visits.filter((v) => mineVisit(v) && v.status === 'failed').length;

  const ROLE_PERMS = {
    dj: {
      can: ['查看本人负责或协作授权门店的客户 / 拜访 / 附件', '确认本人记录的拜访事实（授权协作记录同）', '修改授权商机的正式阶段 / 分层（允许状态内）', '发起客户转交申请', '个人授权范围内的统计与问数'],
      cannot: ['查看成本 / 毛利、批准价格（按 LBS 策略，默认不开放）', '发布方案 / 知识模板（仅可提建议）', '查看无权门店的联系人、合同、附件（仅最小避重提示）'],
    },
    ka: {
      can: ['查看本人负责的集团客户及协作门店', '确认本人记录的拜访事实与被授权的 KA 专业事实', '修改授权商机的正式阶段 / 分层', '发起客户转交申请', '个人授权范围内的统计与问数'],
      cannot: ['查看成本 / 毛利、批准价格（默认不开放审批）', '因集团关系查看其他区域子公司数据（子合同明细按授权汇总）', '发布方案 / 知识模板（仅可提建议）'],
    },
    mgr: {
      can: ['查看授权团队的客户 / 拜访 / 附件', '团队纠错（需填写原因并留痕）', '授权范围内复核正式阶段 / 分层', '审批授权范围内的客户转交', '团队授权范围内的问数'],
      cannot: ['查看成本 / 毛利：仅有明确授权才可（演示账号：已授权报价审批）', '代批非本系统权限的审批', '查看未经授权的跨区数据'],
    },
  };

  /* ---------- 我的（Tab 根） ---------- */
  App.register('me', {
    title: '我的', tab: 'me',
    prd: ['7 页面表·我的', 'F03 上传状态', '10.2 一次录入与同步', '13.1 权限矩阵'],
    rules: ['组织身份来自指定身份系统', '本系统已保存 ≠ CRM 同步成功', '离职账号停止访问', '演示规则仅 Demo 可设'],
    render() {
      const me = App.me();
      const dCount = drafts().length;
      const issues = issueCount();
      const badge = (n, tone) => (n ? ui().chip(String(n), tone, { sm: true }) : '');
      return `
        <div class="card me-profile-card">
          <div class="me-profile">
            <div class="avatar lg" style="background:${me.color}">${App.esc(App.initials(me.name))}</div>
            <div class="grow">
              <div class="row"><span class="me-name">${App.esc(me.name)}</span>${ui().chip(me.roleName, 'brand', { sm: true })}</div>
              <div class="small muted mt4">${App.esc(me.org)}</div>
              <div class="small muted">${App.esc(me.scope)}</div>
            </div>
          </div>
          <div class="me-idnote">${App.icon('shield', 13)}<span>组织身份来自 LBS 指定身份系统（演示）· 实名映射、离职撤权</span></div>
        </div>

        ${ui().section('工作')}
        <div class="list">
          ${ui().cell({ title: '我的草稿', sub: dCount ? '待确认的拜访草稿，中途退出可恢复' : '暂无草稿', icon: 'edit', iconTone: 'warn', right: badge(dCount, 'warn'), onclick: 'S_ME.openDrafts()' })}
          ${ui().cell({ title: '上传任务 / 同步异常', sub: issues ? `${issues} 项失败，可重试` : '上传与 CRM 同步状态', icon: issues ? 'cloud-off' : 'cloud', iconTone: issues ? 'danger' : 'info', right: badge(issues, 'danger'), onclick: "App.go('sync-center')" })}
        </div>

        ${ui().section('设置')}
        <div class="list">
          ${ui().cell({ title: '通知设置', sub: '任务提醒 · 服务风险 · 外部通知', icon: 'bell', onclick: "App.go('settings-notify')" })}
          ${ui().cell({ title: '数据范围与权限', sub: '本角色可看 / 不可看的内容', icon: 'lock', iconTone: 'gray', onclick: 'S_ME.showPerms()' })}
          ${ui().cell({ title: '演示规则说明', sub: '回访周期规则（演示）', icon: 'info', iconTone: 'info', onclick: 'S_ME.showRules()' })}
        </div>

        ${ui().section('演示')}
        <div class="list">
          ${ui().cell({ title: 'P1 预览入口', sub: '报价 · 承诺一致性 · 合同 · 续约 · 虫害识别', icon: 'flag', iconTone: 'warn', right: ui().chip('包 B', 'warn', { sm: true }), onclick: "App.go('p1-hub')" })}
          ${ui().cell({ title: '关于演示', sub: '模拟数据 · 无后端 · 2026-09-07', icon: 'question', iconTone: 'gray', onclick: 'S_ME.showAbout()' })}
        </div>
        <div class="me-hint">${App.icon('users', 13)}<span>演示角色切换请使用左侧导览</span></div>

        <div class="mt16">${ui().btn('退出登录', { tone: 'danger', block: true, icon: 'logout', onclick: 'S_ME.logout()' })}</div>
        <div class="me-foot">离职 / 转岗账号将撤销数据范围、转交任务并停止访问</div>
      `;
    },
  });

  S.openDrafts = function () {
    const list = drafts();
    if (!list.length) { App.toast('暂无草稿', { icon: 'edit' }); return; }
    App.sheet({
      title: '我的草稿 · 点击继续确认',
      items: list.map((d) => ({ label: d.title, sub: `${d.time} · 本地草稿，未成为正式事实`, icon: 'edit', onSelect: () => App.go('visit-confirm', { id: d.visitId }) })),
    });
  };
  S.showRules = function () {
    const r = App.state.settings.revisitRule;
    App.sheet({
      title: '演示规则说明',
      items: [
        { label: r.label, sub: '仅演示可设置的示例周期；页面上标"演示规则"', icon: 'clock' },
        { label: '真实试点默认关闭未配置规则', sub: '回访日期优先级：客户约定 > 已接受任务 > 规则周期', icon: 'shield' },
        { label: '同一商机同一周期规则型任务去重', sub: '改期保留原因；不伪装成完成', icon: 'check-circle' },
      ],
      cancel: '知道了',
    });
  };
  S.showPerms = function () {
    const p = ROLE_PERMS[App.state.role] || ROLE_PERMS.dj;
    const me = App.me();
    const li = (arr, cls) => arr.map((x) => `<li class="${cls}">${App.esc(x)}</li>`).join('');
    App.modal({
      title: '数据范围与权限',
      body: `<div class="small muted" style="text-align:center">${App.esc(me.roleName)} · ${App.esc(me.scope)}</div>
        <div class="me-perm-h ok">${App.icon('check-circle', 14)}可以</div><ul class="me-perm">${li(p.can, '')}</ul>
        <div class="me-perm-h no">${App.icon('eye-off', 14)}不可以</div><ul class="me-perm">${li(p.cannot, '')}</ul>
        <div class="tiny muted mt8">授权在服务端执行，覆盖附件下载、生成文档、知识检索、统计聚合及 AI 上下文（PRD 13.1）</div>`,
    });
  };
  S.showAbout = function () {
    App.modal({
      title: '关于演示',
      body: `${App.ui.kv([
        ['数据', '全部为虚构模拟样本'],
        ['后端', '无后端 · 状态保存在本机浏览器'],
        ['演示日期', '2026-09-07（周一）'],
        ['数据版本', `v${window.DATA.VERSION}`],
        ['AI 内容', '派生数据，不改写正式值'],
      ])}<div class="tiny muted mt8">Demo 数据使用独立环境并明确标志，禁止混入真实统计（PRD 10.2）</div>`,
    });
  };
  S.logout = function () {
    App.confirm('退出登录', '退出后需重新通过组织身份登录。离职 / 转岗账号将被撤销数据范围并停止访问。', () => {
      App.toast('已退出（演示）· 离职账号将停止访问', { icon: 'logout' });
    }, '退出');
  };

  /* ---------- 同步与上传异常中心 ---------- */
  const uploadIcon = (u) => (/录音/.test(u.title) ? 'mic' : /照片|门头/.test(u.title) ? 'image' : 'upload');
  const uploadChip = (u) => ({ done: App.ui.chip('同步成功', 'ok', { icon: 'check' }), failed: App.ui.chip('上传失败', 'danger', { icon: 'alert' }), uploading: App.ui.chip('上传中', 'info', { icon: 'upload' }) }[u.status] || App.ui.chip(u.status, 'gray'));

  App.register('sync-center', {
    title: '上传与同步', tab: 'me',
    prd: ['7 页面表·我的', 'F03 状态机与上传状态', '10.2 一次录入与同步'],
    rules: ['本系统已保存 与 CRM 同步成功 分开显示', '失败显示环节与重试入口', '重试不新增同一拜访', '清理缓存可能丢失未上传内容'],
    render() {
      const ups = App.state.sync.uploads || [];
      const crm = App.state.sync.crm || [];
      const pv = pendingVisits();
      const failed = failedUploads().length + pv.filter((v) => v.status === 'failed').length;
      const waiting = pv.filter((v) => v.status === 'saved').length;
      const okCount = ups.filter((u) => u.status === 'done').length + crm.length;
      return `
        ${ui().kpis([
          { label: '失败可重试', value: failed, tone: failed ? 'danger' : '' },
          { label: '已保存待同步', value: waiting, tone: waiting ? 'info' : '' },
          { label: '同步成功', value: okCount, tone: 'brand' },
        ])}
        <div class="mt12">${ui().notice('warn', '清理设备缓存可能导致未上传内容丢失；页面显示上传状态，请在网络恢复后重试。', 'alert')}</div>

        ${ui().section('上传任务', `<span class="tiny">媒体 / 录音</span>`)}
        <div class="list">
          ${ups.length ? ups.map((u) => `
            <div class="cell me-sync-row">
              <div class="cell-icon ${u.status === 'failed' ? 'danger' : u.status === 'done' ? '' : 'info'}">${App.icon(uploadIcon(u), 20)}</div>
              <div class="cell-body">
                <div class="cell-title ellipsis">${App.esc(u.title)}</div>
                <div class="cell-sub">${App.esc(u.time)} · 环节：${App.esc(u.stage)}${u.error ? ` · <span class="me-err">${App.esc(u.error)}</span>` : ''}</div>
                <div class="row mt8 wrap gap6">${uploadChip(u)}${u.status === 'failed' && u.retryable !== false ? ui().btn('重试', { tone: 'secondary', size: 'xs', icon: 'refresh', onclick: `S_ME.retryUpload('${u.id}')` }) : ''}</div>
              </div>
            </div>`).join('') : ui().empty({ icon: 'cloud', title: '没有上传任务', sub: '拍照 / 录音上传后在这里显示状态' })}
        </div>

        ${ui().section('CRM 同步', `<span class="tiny">拜访 / 商机</span>`)}
        <div class="me-two-level">
          <div class="lv"><span class="chip info sm">本系统已保存</span><span>用户确认与原始证据已写入本系统</span></div>
          <div class="lv"><span class="chip ok sm">CRM 同步成功</span><span>已回写正式源系统，进入正式统计</span></div>
          <div class="tiny muted">待同步记录不冒充已进入正式业绩统计；重试使用同一请求 ID，不新增同一拜访</div>
        </div>
        <div class="list">
          ${pv.map((v) => {
            const st = App.store(v.storeId);
            const isFail = v.status === 'failed';
            return `<div class="cell me-sync-row">
              <div class="cell-icon ${isFail ? 'danger' : 'info'}">${App.icon(isFail ? 'cloud-off' : 'sync', 20)}</div>
              <div class="cell-body">
                <div class="cell-title ellipsis">${App.esc(st ? st.name : v.storeId)} · ${App.esc(v.type)}拜访记录</div>
                <div class="cell-sub">${App.esc(v.time)}${isFail ? ` · 环节：${App.esc(v.syncStage || 'CRM 回写')} · <span class="me-err">${App.esc(v.syncError || '接口超时')}</span>` : ' · 等待回写 CRM'}</div>
                <div class="row mt8 wrap gap6">${ui().chip('本系统已保存', 'info', { icon: 'check' })}${isFail ? ui().chip('CRM 同步失败', 'danger', { icon: 'alert' }) : ui().chip('待同步', 'gray', { icon: 'clock' })}${ui().btn(isFail ? '重试' : '立即同步', { tone: 'secondary', size: 'xs', icon: 'refresh', onclick: `S_ME.retryVisit('${v.id}')` })}</div>
              </div>
            </div>`;
          }).join('')}
          ${crm.map((c) => `<div class="cell me-sync-row">
              <div class="cell-icon">${App.icon('check-circle', 20)}</div>
              <div class="cell-body">
                <div class="cell-title ellipsis">${App.esc(c.title)}</div>
                <div class="cell-sub">${App.esc(c.time)}</div>
                <div class="row mt8 gap6">${ui().chip('本系统已保存', 'info', { sm: true })}${ui().chip('CRM 同步成功', 'ok', { sm: true, icon: 'check' })}</div>
              </div>
            </div>`).join('')}
          ${!pv.length && !crm.length ? ui().empty({ icon: 'sync', title: '暂无同步记录' }) : ''}
        </div>
        <div class="tiny muted" style="padding:0 4px">状态机：本地草稿 → 上传中 → AI 处理中 → 待确认 → 已保存 / 待同步 → 同步成功；失败显示具体环节与重试入口（F03）</div>
      `;
    },
    demoActions: [
      { label: '模拟一条同步失败', icon: 'cloud-off', run() { S.simulateFail(); } },
      { label: '模拟一条上传失败', icon: 'upload', run() { S.simulateUploadFail(); } },
    ],
  });

  S.retryUpload = function (id) {
    const u = (App.state.sync.uploads || []).find((x) => x.id === id); if (!u) return;
    const close = App.loading('重新上传…');
    u.status = 'uploading'; u.stage = '上传中'; App.refresh();
    setTimeout(() => {
      close();
      u.status = 'done'; u.stage = '同步成功'; delete u.error; u.doneAt = '2026-09-07 09:41';
      App.save(); App.refresh();
      App.toast('上传成功 · 已同步', { icon: 'check-circle' });
    }, 900);
  };
  S.retryVisit = function (id) {
    const v = App.visit(id); if (!v) return;
    const close = App.loading('回写 CRM…（同一请求 ID）');
    setTimeout(() => {
      close();
      v.status = 'synced'; delete v.syncError; delete v.syncStage; v.syncedAt = '2026-09-07 09:41';
      App.save(); App.refresh();
      App.toast('CRM 同步成功 · 未新增记录', { icon: 'check-circle' });
    }, 900);
  };
  S.simulateFail = function () {
    const prefer = { dj: 'v_jia', ka: 'v_ka1', mgr: 'v_jinpai' }[App.state.role];
    let v = App.visit(prefer);
    if (!v || v.status !== 'synced') v = App.state.visits.find((x) => x.status === 'synced' && mineVisit(x));
    if (!v) { App.toast('没有可模拟的记录'); return; }
    v.status = 'failed'; v.syncStage = 'CRM 回写'; v.syncError = 'CRM 接口超时（网关 504）';
    App.save();
    if (App.currentEntry().id === 'sync-center') App.refresh(); else App.go('sync-center');
    App.toast('已模拟：本系统已保存，CRM 同步失败', { icon: 'cloud-off' });
  };
  S.simulateUploadFail = function () {
    App.state.sync.uploads.unshift({ id: App.uid('up'), title: '蜀香居川菜馆 · 后厨墙角照片', time: '2026-09-07 09:40', status: 'failed', stage: '上传中', error: '网络中断（弱网）', retryable: true });
    App.save();
    if (App.currentEntry().id === 'sync-center') App.refresh(); else App.go('sync-center');
    App.toast('已模拟：上传失败', { icon: 'upload' });
  };

  /* ---------- 通知设置 ---------- */
  const NOTIFY_ITEMS = [
    { key: 'task', title: '任务提醒', sub: '到期 / 逾期回访、待确认记录', icon: 'bell', tone: '' },
    { key: 'risk', title: '服务风险', sub: '未结客诉、承诺差异、合同到期', icon: 'alert', tone: 'danger' },
    { key: 'external', title: '外部通知（微信服务通知）', sub: '需用户授权与组织模板配置；未授权时仅站内提醒', icon: 'send', tone: 'info' },
  ];
  App.register('settings-notify', {
    title: '通知设置', tab: 'me',
    prd: ['7 页面表·我的', 'F05 回访任务与提醒', '11 消息通道'],
    rules: ['今日工作台始终显示任务', '外部通知失败不导致任务丢失', '未配置不启用升级'],
    render() {
      const n = App.state.settings.notify;
      const sw = (key, on, disabled) => `<div class="me-switch ${on ? 'on' : ''} ${disabled ? 'disabled' : ''}" role="switch" aria-checked="${on}" ${disabled ? '' : `onclick="S_ME.toggle('${key}')"`}></div>`;
      return `
        ${ui().notice('info', '外部通知失败不影响今日工作台任务显示；任务始终在工作台可处理（F05）。', 'info')}
        ${ui().section('提醒内容')}
        <div class="list">
          ${NOTIFY_ITEMS.map((it) => `<div class="cell">
            <div class="cell-icon ${it.tone}">${App.icon(it.icon, 20)}</div>
            <div class="cell-body"><div class="cell-title">${App.esc(it.title)}</div><div class="cell-sub">${App.esc(it.sub)}</div></div>
            <div class="cell-right">${sw(it.key, !!n[it.key])}</div>
          </div>`).join('')}
        </div>
        ${n.external ? ui().notice('warn', '微信服务通知需要用户授权与组织模板配置（演示中视为已配置）；送达失败不会导致任务丢失。', 'info') : ''}

        ${ui().section('提醒渠道')}
        <div class="list">
          <div class="cell">
            <div class="cell-icon">${App.icon('sun', 20)}</div>
            <div class="cell-body"><div class="cell-title">今日工作台（站内）</div><div class="cell-sub">始终显示，不可关闭</div></div>
            <div class="cell-right">${sw('inapp', true, true)}</div>
          </div>
          <div class="cell">
            <div class="cell-icon gray">${App.icon('users', 20)}</div>
            <div class="cell-body"><div class="cell-title">逾期升级主管</div><div class="cell-sub">首次逾期提醒负责人；升级阈值由组织配置，未配置不启用</div></div>
            <div class="cell-right">${ui().chip('未配置', 'gray', { sm: true })}</div>
          </div>
        </div>

        ${ui().section('回访规则')}
        <div class="card">
          <div class="row between"><div class="card-title" style="margin:0">规则型回访周期</div>${ui().chip('演示规则', 'warn', { sm: true })}</div>
          <div class="small mt8">${App.esc(App.state.settings.revisitRule.label)}</div>
          <div class="tiny muted mt4">客户约定日期 &gt; 已接受任务日期 &gt; 规则周期；真实试点默认关闭未配置规则</div>
          <div class="mt12">${ui().btn('查看演示规则说明', { tone: 'ghost', size: 'sm', block: true, onclick: 'S_ME.showRules()' })}</div>
        </div>
      `;
    },
  });
  S.toggle = function (key) {
    const n = App.state.settings.notify;
    n[key] = !n[key];
    App.save(); App.refresh();
    if (key === 'external' && n.external) App.toast('已开启（演示）· 实际需微信授权与组织配置', { icon: 'send' });
    else App.toast(n[key] ? '已开启' : '已关闭', { icon: 'bell' });
  };
})();
