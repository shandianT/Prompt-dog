/* ============================================================
   销售智助 · 小程序原型 · LBS Demo — 模拟数据（全部虚构）
   对齐《商汤 AI 销售管理平台 · LBS 一线销售智能留痕方案与 Demo 原型》v1.0
   演示日期固定：2026-09-07（周一）。门店、人名、金额均为演示数据。
   ============================================================ */
(function () {
  'use strict';
  const D = window.DATA = { VERSION: 20 };

  /* ---------- 演示账号（均虚构） ---------- */
  const users = {
    dj: { id: 'u_dj', name: '王小明', roleName: '地推销售', org: '地推一队', scope: '本人客户 · 一马路 / 二马路 / 张江工业园', color: '#1e5bd8', phone: '138****2211' },
    ka: { id: 'u_ka', name: '陈奕辰', roleName: 'KA 销售', org: 'KA 部 · 华东', scope: '本人负责的集团客户及协作门店', color: '#0b7d93', phone: '139****8807' },
    mgr: { id: 'u_mgr', name: '李华', roleName: '销售主管', org: '地推一队 · 直属 7 人', scope: '本人与直属团队', color: '#0f2444', phone: '137****0192' },
  };

  /* ---------- 街道 ---------- */
  const streets = [
    { id: 'st_1', name: '一马路', district: '浦东新区', city: '上海', planned: 10 },
    { id: 'st_2', name: '二马路', district: '浦东新区', city: '上海', planned: 8 },
    { id: 'st_3', name: '张江工业园', district: '浦东新区', city: '上海', planned: 4 },
  ];

  /* ---------- 门店 / 客户 ----------
     tier: A 主攻 / B 培育 / C 维护 / D 观察 / pending 待判定（由分层规则计算，不可手改）
     coop: active 合作中 / paused 停做 / none 未合作
     trace(今日留痕状态): done 已留痕 / running 进行中 / pending 已打点未留痕 / todo 未去
  ------------------------------ */
  const stores = [
    // ===== 一马路（今日路线 01–10）=====
    { id: 's_jinpai', name: '金牌烤鸭店', entity: '上海金牌餐饮管理有限公司', category: '连锁餐饮', street: '一马路', address: '一马路 166 号', coop: 'none', tier: 'A', ownerId: 'u_dj', ownerName: '王小明', stage: '方案',
      contact: { name: '李经理', role: '店经理' }, route: { order: 1, time: '08:10', trace: 'done' }, lastVisit: '2026-09-07', lastNext: '约了下周三下午两点带方案再去', nextDue: '2026-09-16', updatedAt: '2026-09-07 08:31' },
    { id: 's_cuihua', name: '翠华茶餐厅（一马路店）', entity: '翠华餐饮（上海）有限公司', category: '连锁餐饮', street: '一马路', address: '一马路 45 号', coop: 'active', tier: 'A', ownerId: 'u_dj', ownerName: '王小明', stage: '意向',
      contact: { name: '何店长', role: '店长' }, route: { order: 2, time: '08:40', trace: 'done' }, lastVisit: '2026-09-07', lastNext: '下周二上午带续约方案和报价过去', nextDue: '2026-09-15', since: '2026-01-10', contractEnd: '2027-01-09', services: ['有害生物防治（月度）'], updatedAt: '2026-09-07 09:02' },
    { id: 's_maixiang', name: '麦香园面包房', entity: '麦香园食品（上海）有限公司', category: '单店餐饮', street: '一马路', address: '一马路 60 号', coop: 'none', tier: 'C', ownerId: 'u_dj', ownerName: '王小明', stage: '线索',
      contact: { name: '钱姐', role: '前厅经理' }, route: { order: 3, time: '09:10', trace: 'done' }, lastVisit: '2026-09-07', lastNext: '', updatedAt: '2026-09-07 09:25' },
    { id: 's_chuan', name: '小巷串串', entity: '', category: '单店餐饮', street: '一马路', address: '一马路 33 号', coop: 'none', tier: 'D', ownerId: 'u_dj', ownerName: '王小明', stage: '线索',
      contact: { name: '赵老板', role: '老板' }, route: { order: 4, time: '09:40', trace: 'done' }, lastVisit: '2026-09-07', lastNext: '周四下午带方案过去', nextDue: '2026-09-10', updatedAt: '2026-09-07 09:52' },
    { id: 's_jia', name: '满堂红火锅（一马路店）', alias: '甲店', entity: '满堂红餐饮（上海）有限公司', category: '连锁餐饮', street: '一马路', address: '一马路 128 号 1F', coop: 'active', tier: 'B', ownerId: 'u_dj', ownerName: '王小明', stage: '意向',
      contact: { name: '罗建平', role: '店长' }, route: { order: 5, time: '09:58', trace: 'pending', checkin: '09:58', checkout: '10:15' }, lastVisit: '2026-08-28', lastNext: '跟进客诉处理结果', nextDue: '2026-09-06',
      since: '2025-12-05', contractEnd: '2026-11-30', services: ['有害生物防治（月度）'], complaint: { status: 'open', summary: '9/3 客户反馈后厨仍见蟑螂活动，服务部已派单复处理', date: '2026-09-03' }, updatedAt: '2026-09-07 10:15' },
    { id: 's_yi', name: '阿婆烧腊饭堂', alias: '乙店', entity: '', category: '单店餐饮', street: '一马路', address: '一马路 96 号', coop: 'none', tier: 'D', ownerId: 'u_dj', ownerName: '王小明', stage: '线索',
      contact: { name: '梁老板娘', role: '老板娘' }, route: { order: 6, time: '10:20', trace: 'running', checkin: '10:21' }, lastVisit: '2026-09-05', lastNext: '10 月再看', nextDue: '2026-10-08', updatedAt: '2026-09-07 10:21' },
    { id: 's_bing', name: '蜀香居川菜馆', alias: '丙店', entity: '上海蜀香居餐饮管理有限公司', category: '连锁餐饮', street: '一马路', address: '一马路 156 号', coop: 'none', tier: 'pending', ownerId: 'u_dj', ownerName: '王小明', stage: '线索',
      contact: { name: '王女士', role: '店长' }, route: { order: 7, time: '10:45', trace: 'todo', appointment: '10:45 约访 · 店长王女士' }, lastVisit: '2026-09-02', lastNext: '9/7 到店介绍方案（电话约定）', nextDue: '2026-09-07', isNew: true, newSince: '2026-09-02', updatedAt: '2026-09-02 16:40' },
    { id: 's_lanwan', name: '蓝湾咖啡（一马路店）', entity: '蓝湾咖啡（上海）有限公司', category: '连锁餐饮', street: '一马路', address: '一马路 88 号', coop: 'none', tier: 'D', ownerId: 'u_other', ownerName: '张伟', stage: '线索',
      contact: { name: '', role: '' }, route: { order: 8, time: '11:10', trace: 'todo' }, lastVisit: null, isNew: true, newSince: '2026-09-01', dupSuspect: true, updatedAt: '2026-09-01 10:00' },
    { id: 's_taotao', name: '陶陶居茶楼', entity: '陶陶居饮食（上海）有限公司', category: '连锁餐饮', street: '一马路', address: '一马路 200 号 2F', coop: 'active', tier: 'C', ownerId: 'u_dj', ownerName: '王小明', stage: '意向',
      contact: { name: '周经理', role: '运营经理' }, route: { order: 9, time: '11:30', trace: 'todo' }, lastVisit: '2026-08-20', lastNext: '询问卫生间清洁', nextDue: '2026-09-19', since: '2026-03-01', contractEnd: '2027-02-28', services: ['有害生物防治（月度）'], updatedAt: '2026-08-20 18:00' },
    { id: 's_xiyue', name: '喜悦烘焙', entity: '', category: '单店餐饮', street: '一马路', address: '一马路 12 号', coop: 'none', tier: 'D', ownerId: 'u_dj', ownerName: '王小明', stage: '线索',
      contact: { name: '', role: '' }, route: { order: 10, time: '11:50', trace: 'todo' }, lastVisit: null, isNew: true, newSince: '2026-09-02', updatedAt: '2026-09-03 10:20' },
    // ===== 二马路（11–18）=====
    { id: 's_yujia', name: '渔家灯火海鲜酒楼', entity: '渔家灯火餐饮有限公司', category: '连锁餐饮', street: '二马路', address: '二马路 188 号', coop: 'active', tier: 'B', ownerId: 'u_dj', ownerName: '王小明', stage: '意向', contact: { name: '吴总', role: '老板' }, route: { order: 11, time: '13:30', trace: 'todo' }, lastVisit: '2026-08-30', lastNext: '核实换供应商原因', nextDue: '2026-09-07', since: '2025-10-15', contractEnd: '2026-10-14', services: ['有害生物防治（月度）', '油烟机清洗（季度）'], updatedAt: '2026-08-30 17:00' },
    { id: 's_chuanyu', name: '川渝人家', entity: '', category: '单店餐饮', street: '二马路', address: '二马路 102 号', coop: 'none', tier: 'D', ownerId: 'u_dj', ownerName: '王小明', stage: '线索', contact: { name: '', role: '' }, route: { order: 12, time: '13:50', trace: 'todo' }, lastVisit: null, updatedAt: '2026-08-15 10:00' },
    { id: 's_shiguang', name: '拾光咖啡', entity: '', category: '单店餐饮', street: '二马路', address: '二马路 8 号', coop: 'none', tier: 'D', ownerId: 'u_other', ownerName: '赵敏', stage: '线索', contact: { name: '', role: '' }, route: { order: 13, time: '14:10', trace: 'todo' }, lastVisit: null, updatedAt: '2026-08-01 10:00' },
    { id: 's_laozhang', name: '老张牛肉面', entity: '', category: '单店餐饮', street: '二马路', address: '二马路 72 号', coop: 'paused', tier: 'C', ownerId: 'u_dj', ownerName: '王小明', stage: '意向', contact: { name: '张老板', role: '老板' }, route: { order: 14, time: '14:30', trace: 'todo' }, lastVisit: '2026-06-18', lastNext: '续约谈判，客户要求降价', pausedAt: '2026-06-30', pausedReason: '合同到期未续，客户认为价格偏高', updatedAt: '2026-06-30 12:00' },
    { id: 's_laomatou', name: '老码头火锅（二马路店）', entity: '老码头餐饮管理有限公司', category: '连锁餐饮', street: '二马路', address: '二马路 300 号', coop: 'none', tier: 'B', ownerId: 'u_dj', ownerName: '王小明', stage: '意向', contact: { name: '孙店长', role: '店长' }, route: { order: 15, time: '14:50', trace: 'todo' }, lastVisit: '2026-09-02', lastNext: '9/5 前送样品', nextDue: '2026-09-05', updatedAt: '2026-09-02 15:00' },
    { id: 's_xiangyu', name: '湘遇小馆', entity: '', category: '单店餐饮', street: '二马路', address: '二马路 77 号', coop: 'none', tier: 'D', ownerId: 'u_dj', ownerName: '王小明', stage: '线索', contact: { name: '', role: '' }, route: { order: 16, time: '15:10', trace: 'todo' }, lastVisit: '2026-08-26', lastNext: '店长不在，留资料', updatedAt: '2026-08-26 15:00' },
    { id: 's_bianli', name: '好邻居便利店', entity: '', category: '单店零售', street: '二马路', address: '二马路 21 号', coop: 'active', tier: 'C', ownerId: 'u_dj', ownerName: '王小明', stage: '意向', contact: { name: '刘店长', role: '店长' }, route: { order: 17, time: '15:30', trace: 'todo' }, lastVisit: '2026-08-03', lastNext: '', nextDue: '2026-09-02', since: '2026-02-01', services: ['有害生物防治（月度）'], updatedAt: '2026-08-03 12:00' },
    { id: 's_yaofang', name: '康宁药房', entity: '', category: '单店零售', street: '二马路', address: '二马路 130 号', coop: 'none', tier: 'D', ownerId: 'u_dj', ownerName: '王小明', stage: '线索', contact: { name: '', role: '' }, route: { order: 18, time: '15:50', trace: 'todo' }, lastVisit: '2026-07-06', nextDue: '2026-09-05', updatedAt: '2026-07-06 12:00' },
    // ===== 张江工业园（19–22）=====
    { id: 's_ka1', name: '华信食品 · 张江工厂', entity: '华信食品（上海）有限公司', category: '食品工厂', street: '张江工业园', address: '张江路 1200 号', coop: 'none', tier: 'A', ownerId: 'u_ka', ownerName: '陈奕辰', stage: '报价', group: { name: '华信食品集团', sites: 3 },
      contact: { name: '钱经理', role: '品控经理' }, route: { order: 19, time: '16:30', trace: 'todo' }, lastVisit: '2026-09-01', lastNext: '出方案与报价', nextDue: '2026-09-08', updatedAt: '2026-09-05 18:30' },
    { id: 's_ka2', name: '华信食品 · 中央厨房', entity: '华信食品（上海）有限公司', category: '食品工厂', street: '张江工业园', address: '张江路 1300 号', coop: 'active', tier: 'B', ownerId: 'u_ka', ownerName: '陈奕辰', stage: '意向', group: { name: '华信食品集团', sites: 3 },
      contact: { name: '钱经理', role: '品控经理' }, route: { order: 20, time: '16:50', trace: 'todo' }, lastVisit: '2026-08-27', lastNext: '9/10 现场勘查', nextDue: '2026-09-10', since: '2026-02-01', services: ['有害生物防治（月度）'], updatedAt: '2026-08-27 17:00' },
    { id: 's_kafei', name: '园区咖啡厅', entity: '', category: '单店餐饮', street: '张江工业园', address: '张江路 1100 号 1F', coop: 'none', tier: 'D', ownerId: 'u_dj', ownerName: '王小明', stage: '线索', contact: { name: '', role: '' }, route: { order: 21, time: '17:10', trace: 'todo' }, lastVisit: null, updatedAt: '2026-08-20 12:00' },
    { id: 's_shitang', name: '园区员工食堂', entity: '张江园区后勤服务有限公司', category: '团餐', street: '张江工业园', address: '张江路 1000 号', coop: 'none', tier: 'C', ownerId: 'u_dj', ownerName: '王小明', stage: '线索', contact: { name: '徐主任', role: '后勤主任' }, route: { order: 22, time: '17:30', trace: 'todo' }, lastVisit: '2026-08-12', lastNext: '', updatedAt: '2026-08-12 12:00' },
  ];

  /* ---------- 留痕记录（拜访） ----------
     score: 五维 逻辑结构 20 / 事实细节 25 / 客户原声与证据 20 / 沟通结论 20 / 表达清晰度 15；门槛 60
     fields: 16 项基础（自动带出 5 + AI 抽取 11）+ 首次拜访追加 4
     每项 { v, src: 'auto'|'ai'|'manual', conf, quote(原文定位) }
  ------------------------------ */
  const visits = [
    { id: 'v_jinpai_0907', storeId: 's_jinpai', time: '2026-09-07 08:10', end: '08:31', by: '王小明', mode: '语音', type: '再次拜访', status: 'archived', score: { total: 78, dims: { 逻辑结构: 16, 事实细节: 20, '客户原声/证据': 16, 沟通结论: 15, 表达清晰度: 11 } },
      transcript: '刚从金牌烤鸭店出来，见了李经理，后厨和仓库还是有老鼠活动，仓库墙角有鼠洞。预算他说一年一万以内能接受。约了下周三下午两点带方案再去一趟。', hotwords: ['金牌烤鸭店', '老鼠'],
      fields: { 客户名称: { v: '金牌烤鸭店', src: 'ai', conf: .97 }, 客户名字: { v: '李经理', src: 'ai', conf: .95 }, 客户职位: { v: '店经理', src: 'ai', conf: .9 }, 商机名称: { v: '有害生物防治 · 年度', src: 'ai', conf: .86 }, 预计金额: { v: '¥10,000 / 年以内（客户口述）', src: 'ai', conf: .8 }, 下一步: { v: '9月16日 14:00 带方案到店', src: 'ai', conf: .93 } }, oppAction: '更新已有商机' },
    { id: 'v_cuihua_0907', storeId: 's_cuihua', time: '2026-09-07 08:40', end: '09:02', by: '王小明', mode: '语音', type: '再次拜访', status: 'archived', score: { total: 74, dims: { 逻辑结构: 15, 事实细节: 19, '客户原声/证据': 15, 沟通结论: 14, 表达清晰度: 11 } }, transcript: '翠华何店长说合同年底到期，想看看续约方案，另外问了油烟机清洗能不能一起做。下周二上午带续约方案和报价过去。', hotwords: ['翠华', '油烟机'], fields: { 下一步: { v: '9月15日 上午 带续约方案与报价', src: 'ai', conf: .9 } }, oppAction: '更新已有商机' },
    { id: 'v_maixiang_0907', storeId: 's_maixiang', time: '2026-09-07 09:10', end: '09:25', by: '王小明', mode: '语音', type: '首次拜访', status: 'archived', score: { total: 63, dims: { 逻辑结构: 13, 事实细节: 15, '客户原声/证据': 13, 沟通结论: 12, 表达清晰度: 10 } }, transcript: '麦香园钱姐说目前没什么虫害问题，先留了资料，以后有需要联系。', hotwords: ['麦香园'], fields: { 下一步: { v: '—', src: 'ai', conf: .4 } }, oppAction: '不建商机' },
    { id: 'v_chuan_0907', storeId: 's_chuan', time: '2026-09-07 09:40', end: '09:52', by: '王小明', mode: '语音', type: '首次拜访', status: 'archived', score: { total: 66, dims: { 逻辑结构: 14, 事实细节: 16, '客户原声/证据': 14, 沟通结论: 12, 表达清晰度: 10 } }, transcript: '小巷串串赵老板说夏天蟑螂多，想先了解一下价格，周四下午带方案过去。', hotwords: ['蟑螂'], fields: { 下一步: { v: '9月10日 下午 带方案到店', src: 'ai', conf: .88 } }, oppAction: '新建商机' },
    { id: 'v_jia_0828', storeId: 's_jia', time: '2026-08-28 15:10', end: '15:40', by: '王小明', mode: '语音', type: '回访', status: 'archived', score: { total: 71, dims: { 逻辑结构: 15, 事实细节: 18, '客户原声/证据': 15, 沟通结论: 13, 表达清晰度: 10 } }, transcript: '满堂红罗店长反映吧台下面蟑螂又出现了，对效果有疑虑，我说协调服务部复处理，下周跟进结果。', hotwords: ['满堂红', '蟑螂'], fields: { 下一步: { v: '9月6日 前 跟进客诉处理结果', src: 'ai', conf: .85 } }, oppAction: '更新已有商机' },
    { id: 'v_ka1_0901', storeId: 's_ka1', time: '2026-09-01 10:00', end: '11:20', by: '陈奕辰', mode: '语音', type: '勘查', status: 'archived', score: { total: 82, dims: { 逻辑结构: 17, 事实细节: 22, '客户原声/证据': 17, 沟通结论: 15, 表达清晰度: 11 } }, transcript: '华信张江工厂钱经理，11 月前要过 AIB 审核，仓库 3 处鼠迹，生产区门缝没封。我答应了一年做两次风险勘查，月度服务加 24 个诱饵站。9 月 3 日前出方案与报价。', hotwords: ['AIB', '鼠迹', '诱饵站'], fields: { 下一步: { v: '9月3日 前 出方案与报价', src: 'ai', conf: .92 } }, oppAction: '更新已有商机' },
  ];

  /* ---------- 商机 ---------- */
  const opportunities = [
    { id: 'o_jinpai', storeId: 's_jinpai', name: '金牌烤鸭店 · 有害生物防治 · 年度', stage: '方案', amount: '¥10,000 / 年（客户口述）', ownerName: '王小明', updatedAt: '2026-09-07', proposalId: 'g_jinpai' },
    { id: 'o_cuihua', storeId: 's_cuihua', name: '翠华一马路店 · 续约 + 油烟机清洗', stage: '意向', amount: '待报价', ownerName: '王小明', updatedAt: '2026-09-07' },
    { id: 'o_chuan', storeId: 's_chuan', name: '小巷串串 · 有害生物防治', stage: '线索', amount: '待报价', ownerName: '王小明', updatedAt: '2026-09-07' },
    { id: 'o_jia', storeId: 's_jia', name: '满堂红一马路店 · 续约', stage: '意向', amount: '待报价', ownerName: '王小明', updatedAt: '2026-08-28' },
    { id: 'o_yujia', storeId: 's_yujia', name: '渔家灯火 · 续约', stage: '意向', amount: '待报价', ownerName: '王小明', updatedAt: '2026-08-30' },
    { id: 'o_laomatou', storeId: 's_laomatou', name: '老码头二马路店 · 有害生物防治', stage: '意向', amount: '待报价', ownerName: '王小明', updatedAt: '2026-09-02' },
    { id: 'o_ka1', storeId: 's_ka1', name: '华信张江工厂 · 有害生物防治（AIB）', stage: '报价', amount: '¥86,400 / 年（演示）', ownerName: '陈奕辰', updatedAt: '2026-09-05', approval: '审批中' },
    { id: 'o_ka2', storeId: 's_ka2', name: '华信中央厨房 · 卫生间深度清洁', stage: '意向', amount: '待报价', ownerName: '陈奕辰', updatedAt: '2026-08-27' },
  ];

  /* ---------- 回访提醒与待办 ----------
     reminders: source 分层规则 / 上次下一步约定 / 主管任务；status todo/done/deferred
     tasks: kind 催办/辅导/报价/下发；status 待接受/执行中/已完成/已拒绝
  ------------------------------ */
  const reminders = [
    { id: 'r_bianli', storeId: 's_bianli', source: '分层规则', tier: 'C', cycle: 30, due: '2026-09-02', status: 'todo' },
    { id: 'r_yaofang', storeId: 's_yaofang', source: '分层规则', tier: 'D', cycle: 60, due: '2026-09-05', status: 'todo' },
    { id: 'r_laomatou', storeId: 's_laomatou', source: '上次下一步约定', note: '9/5 前送样品', due: '2026-09-05', status: 'todo' },
    { id: 'r_jia', storeId: 's_jia', source: '上次下一步约定', note: '跟进客诉处理结果', due: '2026-09-06', status: 'todo' },
    { id: 'r_yujia', storeId: 's_yujia', source: '上次下一步约定', note: '核实换供应商原因', due: '2026-09-07', status: 'todo', deferred: { from: '2026-09-04', reason: '客户老板出差，延至今天' } },
    { id: 'r_bing', storeId: 's_bing', source: '上次下一步约定', note: '9/7 到店介绍方案（电话约定）', due: '2026-09-07', status: 'todo' },
    { id: 'r_chuan', storeId: 's_chuan', source: '上次下一步约定', note: '周四下午带方案过去', due: '2026-09-10', status: 'todo' },
    { id: 'r_cuihua', storeId: 's_cuihua', source: '上次下一步约定', note: '下周二上午带续约方案和报价', due: '2026-09-15', status: 'todo' },
    { id: 'r_jinpai', storeId: 's_jinpai', source: '上次下一步约定', note: '下周三下午两点带方案再去', due: '2026-09-16', status: 'todo' },
    { id: 'r_taotao', storeId: 's_taotao', source: '分层规则', tier: 'C', cycle: 30, due: '2026-09-19', status: 'todo' },
  ];
  const tasks = [
    { id: 't_cuiban', kind: '催办', title: '催办：满堂红火锅今日已打点未留痕', from: '李华（主管）', fromRole: 'mgr', toId: 'u_dj', due: '2026-09-07', status: '待接受', source: '主管催办', body: '09:58 打点、10:15 离店，尚未留痕；请今天内补录。', history: [{ t: '2026-09-07 10:20', e: '主管 李华 发起催办' }] },
    { id: 't_fudao', kind: '辅导', title: '辅导：预算与下一步的记录方法', from: '李华（主管）', fromRole: 'mgr', toId: 'u_dj', due: '2026-09-09', status: '待接受', source: '来自记录复盘', body: '近 7 天有 3 条记录低于门槛，集中在缺预算与下一步模糊；周三例会前对一次记录。', history: [{ t: '2026-09-06 18:10', e: '主管 李华 从记录复盘发起' }] },
    { id: 't_baojia', kind: '报价', title: '发送正式报价 · 金牌烤鸭店（审批已通过）', from: '价格审批', fromRole: 'sys', toId: 'u_dj', due: '2026-09-08', status: '执行中', source: '审批通过自动生成', body: '折扣 12% 超阈值，主管审批已通过，请发送正式报价单 v2。', history: [{ t: '2026-09-06 16:02', e: '主管 李华 审批通过（折扣 12%）' }, { t: '2026-09-06 16:02', e: '系统生成待办' }] },
    { id: 't_xiafa', kind: '下发', title: '下发客户：喜悦烘焙（新开）', from: '李华（主管）', fromRole: 'mgr', toId: 'u_dj', due: '2026-09-09', status: '执行中', source: '主管下发客户', body: '新开店 7 天内首次触达。', history: [{ t: '2026-09-04 09:30', e: '主管 李华 下发' }, { t: '2026-09-04 09:41', e: '王小明 接受' }] },
    { id: 't_ka_quote', kind: '报价', title: '跟进报价 v2 审批 · 华信张江工厂', from: '本人', fromRole: 'ka', toId: 'u_ka', due: '2026-09-08', status: '执行中', source: '本人创建', body: '9/5 提交审批；承诺"一年两次风险勘查"需核对是否计入。', history: [] },
    { id: 't_mgr_1', kind: '辅导', title: '与王小明复盘金牌烤鸭方案反馈', from: '本人', fromRole: 'mgr', toId: 'u_mgr', due: '2026-09-09', status: '执行中', source: '本人创建', body: '', history: [] },
  ];

  /* ---------- 知识库 / FAQ ---------- */
  const kb = [
    { id: 'k1', q: '后厨发现鼠迹，多久能见效？', kind: 'FAQ', answer: '首次服务后通常 1–2 周内活动明显减少；完整控制一般需要 1–2 个月，并需要门店配合封堵孔洞、清理食源。每次服务后提供记录，让客户看到变化。', sources: [{ title: '技术部《鼠类防治作业标准（2026）》', loc: '第 4 节 · 见效周期' }, { title: '销售话术库 · 效果类问题', loc: 'FAQ-012' }], scope: ['有害生物防治', '餐饮'], role: '销售可见', hits: 37, keywords: ['鼠', '老鼠', '见效', '多久'] },
    { id: 'k2', q: '你们和现在的供应商有什么区别？', kind: '异议处理', answer: '每次服务都有可查的记录与照片，风险点位有专人复核；出现问题 24 小时内响应。可以先看一份同类门店的服务记录样例。', sources: [{ title: '销售部《常见异议处理卡》v2', loc: '第 3 条' }, { title: '成功案例 · 连锁餐饮 A 客户', loc: '案例-07' }], scope: ['通用', '餐饮'], role: '销售可见', hits: 52, keywords: ['供应商', '区别', '为什么', '换'] },
    { id: 'k3', q: '服务时会不会影响营业？', kind: 'FAQ', answer: '常规作业安排在打烊后或营业前，单店通常 40–60 分钟；药剂投放点位避开食品加工区，作业后可正常营业。', sources: [{ title: '技术部《作业时间与现场规范》', loc: '2.1' }, { title: 'FAQ 库', loc: 'FAQ-021' }], scope: ['有害生物防治', '餐饮'], role: '销售可见', hits: 29, keywords: ['营业', '影响', '时间', '打烊'] },
    { id: 'k4', q: '药剂对食品安全有没有影响？', kind: 'FAQ', answer: '使用的药剂均为合规登记产品，投放采用饵站 / 胶饵等封闭形式，不在食品与操作台面直接施药；每次作业提供药剂清单与安全说明。', sources: [{ title: '技术部《药剂安全说明》2026 版', loc: '第 1 节' }, { title: '政策流程 · 药剂登记证清单', loc: '附录 A' }], scope: ['有害生物防治', '全国'], role: '销售可见', hits: 41, keywords: ['药剂', '食品安全', '安全', '药'] },
    { id: 'k5', q: '德国小蠊怎么处置？', kind: '虫害知识', answer: '德国小蠊喜温暖潮湿，夜间活动，常见于灶台缝隙、下水道与冰箱压缩机后。处置以胶饵为主、配合缝隙封堵与卫生整改；首次强化处理后按月巡检。', sources: [{ title: '技术部《常见有害生物图鉴》v2', loc: '蜚蠊目 · 德国小蠊' }, { title: '《蟑螂防治作业标准》', loc: '第 2 节' }], scope: ['有害生物防治', '全国'], role: '销售可见', hits: 18, keywords: ['德国小蠊', '蟑螂', '处置', '小蠊'] },
    { id: 'k6', q: '保险条款：服务期间造成损失如何赔付？', kind: '保险条款', answer: '服务责任险覆盖作业期间因我方原因造成的直接财产损失，按保单约定赔付；索赔需在 48 小时内报备并提供现场记录。', sources: [{ title: '《服务责任保险条款》2026', loc: '第 5 条' }], scope: ['通用'], role: '主管可见', hits: 6, keywords: ['保险', '赔付', '损失'] },
  ];
  const kbMissLog = [{ q: '你们能保证一年不再有老鼠吗？', at: '2026-09-07 10:12', status: '已回流管理员' }];
  const pestSamples = [
    { id: 'ps1', label: '后厨墙角 · 清晰', kind: 'pest', species: '德国小蠊（蟑螂）', conf: .86, alt: [{ name: '美洲大蠊', conf: .09 }], habits: '喜温暖潮湿，夜间活动，常见于灶台缝隙、下水道', harm: '污染食品、传播病原', handling: '胶饵为主，配合缝隙封堵与卫生整改；首次强化后月度巡检', source: '技术部《常见有害生物图鉴》v2', note: '识别为预置样本，需贵司样本共同验证' },
    { id: 'ps2', label: '仓库 · 模糊', kind: 'blur', species: null, conf: 0, unknown: true, note: '无法识别：请补拍（靠近、打光）或申请人工协助；不强制给出唯一答案' },
  ];

  /* ---------- GTM 助手：三类模版 & 生成结果 ---------- */
  const gtm = {
    categories: ['单店餐饮', '连锁餐饮', '食品工厂'],
    templates: [
      { id: 'tp_plan_chain', kind: '方案', name: '连锁餐饮 · 有害生物防治标准方案', version: 'v3', sections: 6, category: '连锁餐饮', reason: '客户类别为连锁餐饮，现场问题为蟑螂 + 异味' },
      { id: 'tp_plan_single', kind: '方案', name: '单店餐饮 · 有害生物防治简约方案', version: 'v2', sections: 4, category: '单店餐饮', reason: '' },
      { id: 'tp_plan_factory', kind: '方案', name: '食品工厂 · 综合防治（AIB）方案', version: 'v1', sections: 8, category: '食品工厂', reason: '' },
      { id: 'tp_quote_chain', kind: '报价单', name: '连锁餐饮 · 标准报价单', version: 'v2', category: '连锁餐饮', reason: '与方案模版配套' },
      { id: 'tp_quote_single', kind: '报价单', name: '单店餐饮 · 简约报价单', version: 'v2', category: '单店餐饮', reason: '' },
      { id: 'tp_ins', kind: '保险单', name: '服务责任保险单（附件）', version: 'v1', category: '通用', reason: '连锁客户通常要求附保险' },
    ],
    quoteItems: [
      { name: '首次勘察与处置', unit: '次', qty: 1, price: 1200 },
      { name: '月度常规服务', unit: '月', qty: 12, price: 900 },
      { name: '诱饵站（含安装）', unit: '个', qty: 24, price: 60 },
      { name: '应急上门', unit: '次', qty: 2, price: 300 },
    ],
    discountThreshold: 10, // 折扣 > 10% 触发价格审批
    validDays: 30,
    planSections: (store, visit) => [
      { t: '客户背景', p: `${store.entity || store.name}（以下简称「${store.name.replace(/（.*?）/g, '')}」）位于${store.address}，属${store.category}门店。本方案依据 9月7日现场沟通（对接人：${store.contact.role} ${store.contact.name}）整理。` },
      { t: '现场问题', p: '现场反馈的主要问题：蟑螂、异味。拍照识虫结果：德国小蠊（蟑螂）（置信度 86%，需贵司样本共同验证）。后厨与下水区域是高风险点位，需优先处置并建立周期巡检。' },
      { t: '服务方案与频率', p: '首次强化处置 1 次（勘察 + 胶饵 + 缝隙封堵建议），随后按月度常规服务 12 次；每次服务留存记录与照片，风险点位专人复核。' },
      { t: '设备配置', p: '诱饵站 24 个（后厨、仓库、下水道沿线），粘捕板按点位配置；设备清单与位置图随首次服务交付。' },
      { t: '服务承诺与保障', p: '问题反馈 24 小时内响应；服务期间投保服务责任险（见附件）；月度服务报告与季度回顾。' },
      { t: '报价', p: '见报价单；条款与价格口径由贵司提供，本方案为演示模版。' },
    ],
  };

  /* ---------- 今日回顾 / 主管数据（演示样本） ---------- */
  const review = {
    numbers: { checked: 6, traced: 4, pending: 1, intents: 2 },
    summary: ['今天打点 6 家、留痕 4 家，留痕率 67%。', '2 家有意向：金牌烤鸭（下周三带方案）、小巷串串（周四带方案）。', '1 家已打点未留痕：满堂红火锅，建议今天补录。'],
    tomorrow: ['一马路 03 家未去：蜀香居（约访）、蓝湾咖啡、陶陶居', '逾期回访 2 家优先：好邻居便利店、康宁药房'],
  };
  const team = {
    kpi: { traceRate: .85, traced: 44, avgScore: 72, pendingApprovals: 1, lowScore7d: 6, overdue: 2 },
    summary: ['团队近 7 天已留痕 44 条，留痕率 85%。', '低于门槛的记录 6 条，集中在缺预算与下一步模糊。', '待审批报价 1 条，超期未回访客户 2 家。'],
    members: [
      { id: 'u_dj', name: '王小明', role: '地推', checked: 7, traced: 5, avg: 70, low: 3, pending: 1, color: '#1e5bd8' },
      { id: 'u_wanglei', name: '张伟', role: '地推', checked: 6, traced: 6, avg: 76, low: 1, pending: 0, color: '#b9770e' },
      { id: 'u_zhaomin', name: '赵敏', role: '地推', checked: 5, traced: 4, avg: 68, low: 2, pending: 0, color: '#db2777' },
      { id: 'u_lina', name: '李娜', role: '地推', checked: 4, traced: 4, avg: 74, low: 0, pending: 0, color: '#0b7d93' },
      { id: 'u_ka', name: '陈奕辰', role: 'KA', checked: 1, traced: 1, avg: 82, low: 0, pending: 0, color: '#0f2444' },
    ],
    pendingTrace: [{ memberId: 'u_dj', name: '王小明', storeId: 's_jia', checkin: '09:58' }],
    approvals: [{ id: 'ap1', title: '华信张江工厂 · 报价 v2', by: '陈奕辰', discount: 8, amount: '¥86,400 / 年（演示）', reason: '账期 60 天 + 一年两次风险勘查', status: '审批中', submittedAt: '2026-09-05' }],
    lowRecords: [{ visitId: 'v_maixiang_0907', store: '麦香园面包房', by: '王小明', score: 63, issue: '缺预算、下一步为空' }, { store: '园区咖啡厅', by: '赵敏', score: 55, issue: '沟通结论缺失' }, { store: '康宁药房', by: '张伟', score: 58, issue: '下一步模糊' }],
    ask: [
      { q: '按街道看本周拜访数', kind: 'bars', period: '2026-09-01 – 2026-09-07', scope: '地推一队', definition: '已归档留痕记录数（同店多次算多次）', rows: [{ label: '一马路', value: 18 }, { label: '二马路', value: 12 }, { label: '张江工业园', value: 6 }, { label: '建设路', value: 8 }], sample: 44, updatedAt: '2026-09-07 10:30' },
      { q: '按门店类型看转化率', kind: 'bars', period: '2026-08-08 – 2026-09-07', scope: '地推一队', definition: '留痕后进入 GTM 方案与审批的比例（方案转化率）', rows: [{ label: '连锁餐饮', value: 0.36, display: '36%（9/25）' }, { label: '单店餐饮', value: 0.18, display: '18%（6/33）' }, { label: '食品工厂', value: 0.5, display: '50%（1/2）' }, { label: '单店零售', value: 0, display: '暂无数据（0/4）' }], sample: 64, updatedAt: '2026-09-07 10:30' },
      { q: '本周每天的拜访数', kind: 'bars', period: '2026-09-01 – 2026-09-07', scope: '地推一队', definition: '已归档留痕记录数', rows: [{ label: '周一', value: 9 }, { label: '周二', value: 8 }, { label: '周三', value: 10 }, { label: '周四', value: 7 }, { label: '周五', value: 6 }, { label: '周六', value: 4 }], sample: 44, updatedAt: '2026-09-07 10:30' },
      { q: '团队留痕率是多少', kind: 'stat', period: '2026-09-01 – 2026-09-07', scope: '地推一队', definition: '已归档 ÷ 已打点', value: '85%', sub: '44 / 52', sample: 52, updatedAt: '2026-09-07 10:30' },
    ],
  };

  /* ---------- 演示留痕：丙店 蜀香居（口述样例，两个版本） ---------- */
  D.demoTranscripts = {
    good: '刚从蜀香居川菜馆出来，见了店长王女士，后厨说最近晚上蟑螂多，下水道那边有异味，客人投诉过一次。预算一个月两千到两千五能接受，她要看方案，约了下周三下午两点带方案再去一趟。',
    weak: '刚从蜀香居川菜馆出来，见了店长王女士，后厨说最近晚上蟑螂多，下水道那边有异味。她要看方案，让我近期再联系，保持跟进。',
  };
  D.hotwords = ['蜀香居川菜馆', '蟑螂', '异味', '德国小蠊', '诱饵站'];
  // 结构化结果（依据口述版本）
  D.demoExtract = function (version) {
    const weak = version === 'weak';
    const f = {
      // 自动带出（灰色不可改）
      记录人: { v: '王小明', src: 'auto' }, 拜访日期: { v: '2026-09-07', src: 'auto' }, 地点: { v: '一马路 156 号（打点）', src: 'auto' }, 时长: { v: '18 分钟（10:45–11:03）', src: 'auto' }, 沟通方式: { v: '语音', src: 'auto' },
      // AI 抽取（带置信度与原文定位）
      客户名称: { v: '蜀香居川菜馆', src: 'ai', conf: .97, quote: '蜀香居川菜馆' }, 客户名字: { v: '王女士', src: 'ai', conf: .95, quote: '店长王女士' }, 客户职位: { v: '店长', src: 'ai', conf: .94, quote: '店长王女士' },
      拜访对象类别: { v: '门店负责人', src: 'ai', conf: .8 }, 商机名称: { v: '蜀香居 · 有害生物防治（蟑螂 + 异味）', src: 'ai', conf: .86, quote: '蟑螂多，下水道那边有异味' },
      预计金额: weak ? { v: '', src: 'ai', conf: 0, missing: true } : { v: '¥2,000–2,500 / 月（客户口述）', src: 'ai', conf: .82, quote: '预算一个月两千到两千五能接受' },
      线索来源: { v: '扫街 · 一马路', src: 'ai', conf: .7 }, 合作伙伴: { v: '', src: 'ai', conf: 0, missing: true },
      是否达成预期: { v: '是 · 客户要看方案', src: 'ai', conf: .78, quote: '她要看方案' },
      跟进记录: { v: '后厨晚上蟑螂多、下水道异味，客人投诉过一次；客户要看方案', src: 'ai', conf: .9, quote: '后厨说最近晚上蟑螂多' },
      下一步: weak ? { v: '让我近期再联系，保持跟进', src: 'ai', conf: .6, quote: '近期再联系', invalid: true } : { v: '9月16日 14:00 带方案到店', src: 'ai', conf: .93, quote: '约了下周三下午两点带方案再去一趟' },
      // 首次拜访追加 4 项（勾选时出现）
      客户主营业务: { v: '川菜 · 连锁餐饮', src: 'ai', conf: .75, first: true }, 客户需求: { v: '虫害（蟑螂）+ 异味', src: 'ai', conf: .9, first: true, quote: '蟑螂多，下水道那边有异味' },
      客户预算: weak ? { v: '', src: 'ai', conf: 0, missing: true, first: true } : { v: '¥2,000–2,500 / 月', src: 'ai', conf: .82, first: true }, 联系人角色: { v: '决策人（店长）', src: 'ai', conf: .7, first: true },
    };
    const score = weak
      ? { total: 58, dims: { 逻辑结构: 13, 事实细节: 12, '客户原声/证据': 16, 沟通结论: 4, 表达清晰度: 13 }, advice: ['补充客户预算或价格预期', '补充问题发生的具体位置', '补充带明确时间与动作的下一步'] }
      : { total: 71, dims: { 逻辑结构: 15, 事实细节: 18, '客户原声/证据': 16, 沟通结论: 12, 表达清晰度: 10 }, advice: ['可补充问题发生的具体位置与频次', '可补充现供应商情况'] };
    const gate2 = weak ? { pass: false, raw: '让我近期再联系，保持跟进', time: '未解析到明确时间', action: '联系', hint: '「近期」不算明确时间；也缺少明确动作。例：「9月12日前送方案与报价」' } : { pass: true, raw: '约了下周三下午两点带方案再去一趟', time: '2026-09-16 14:00（相对时间已解析）', action: '带方案到店', hint: '' };
    return { fields: f, score, gate2, threshold: 60 };
  };
  // OCR / 工商匹配
  D.demoOCR = {
    text: '蜀香居川菜馆', conf: .96, extra: [{ k: '门店名', v: '蜀香居川菜馆', conf: .96 }, { k: '地址（招牌）', v: '一马路 156 号', conf: .81 }, { k: '电话（招牌）', v: '021-5***-**76', conf: .62 }],
    candidates: [
      { id: 'c1', name: '上海蜀香居餐饮管理有限公司', code: '91310115DEMO0001X（演示编号）', addr: '一马路 156 号', status: '存续', match: .92 },
      { id: 'c2', name: '蜀香居（浦东）餐饮有限公司 一马路分店', code: '91310115DEMO0041X（演示编号）', addr: '一马路 156 号 1F', status: '存续', match: .75 },
    ],
    dup: { storeId: 's_bing', name: '蜀香居川菜馆', owner: '王小明（我）', stage: '线索', street: '一马路', sim: 1 },
  };
  // 归档写入（丙店）
  D.archiveDemoVisit = function (s, version, oppAction) {
    const ex = D.demoExtract(version || 'good');
    const v = { id: 'v_bing_new', storeId: 's_bing', time: '2026-09-07 10:45', end: '11:03', by: '王小明', mode: '语音', type: '首次拜访', status: 'archived', score: ex.score, transcript: D.demoTranscripts[version || 'good'], hotwords: ['蜀香居川菜馆', '蟑螂', '异味'], fields: ex.fields, oppAction: oppAction || '新建商机', archivedAt: '2026-09-07 11:06' };
    const i = s.visits.findIndex((x) => x.id === 'v_bing_new'); if (i >= 0) s.visits[i] = v; else s.visits.unshift(v);
    const st = s.stores.find((x) => x.id === 's_bing');
    if (st) { st.route.trace = 'done'; st.route.checkin = '10:45'; st.route.checkout = '11:03'; st.lastVisit = '2026-09-07'; st.lastNext = '9月16日 14:00 带方案到店'; st.nextDue = '2026-09-16'; st.tier = 'A'; st.stage = '意向'; st.updatedAt = '2026-09-07 11:06'; }
    if (oppAction !== '不建商机' && !s.opportunities.find((o) => o.id === 'o_bing')) s.opportunities.unshift({ id: 'o_bing', storeId: 's_bing', name: '蜀香居 · 有害生物防治（蟑螂 + 异味）', stage: '意向', amount: '¥2,000–2,500 / 月（客户口述）', ownerName: '王小明', updatedAt: '2026-09-07' });
    const r = s.reminders.find((x) => x.id === 'r_bing'); if (r) r.status = 'done';
    if (!s.reminders.find((x) => x.id === 'r_bing_next')) s.reminders.push({ id: 'r_bing_next', storeId: 's_bing', source: '上次下一步约定', note: '9月16日 14:00 带方案到店', due: '2026-09-16', status: 'todo' });
    if (!s.reminders.find((x) => x.id === 'r_bing_tier')) s.reminders.push({ id: 'r_bing_tier', storeId: 's_bing', source: '分层规则', tier: 'A', cycle: 7, due: '2026-09-14', status: 'todo', dedupNote: '与「上次下一步约定」同店同周期，提醒合并展示' });
    s.review.numbers = { checked: 7, traced: 5, pending: 1, intents: 3 };
    s.review.summary = ['今天打点 7 家、留痕 5 家，留痕率 71%。', '3 家有意向：金牌烤鸭（下周三带方案）、小巷串串（周四带方案）、蜀香居（下周三带方案，预算 2–2.5k/月）。', '1 家已打点未留痕：满堂红火锅，建议今天补录。'];
    s.demo.archived = true; s.demo.version = version || 'good';
  };

  /* ---------- 初始状态 ---------- */
  D.initial = function () {
    return {
      version: D.VERSION, role: 'dj', users, streets, stores, visits, opportunities, reminders, tasks, kb, kbMissLog, pestSamples, gtm, review, team,
      perms: { mic: false, geo: false, cam: false }, // 首次进入授权页
      settings: { threshold: 60, weights: { 逻辑结构: 20, 事实细节: 25, '客户原声/证据': 20, 沟通结论: 20, 表达清晰度: 15 }, tierRule: 'v3 · 阈值为演示值，由贵司提供', streetDisplay: '地推部 · 配置 v2 · 不开放个人自定义', weakNet: false, firstVisit: true, demoVoice: true },
      ui: { authDone: false, street: '一马路', routeFilter: 'all', kbTab: 'ask', chat: [], gtmCategory: '连锁餐饮', gtmPicked: ['tp_plan_chain', 'tp_quote_chain', 'tp_ins'], teamMode: 'team' },
      chat: [], proposals: [],
      demo: { archived: false, version: null, checkedIn: false },
    };
  };

  /* ---------- Tab 角标 ---------- */
  D.tabBadges = function (state) {
    const pendingTrace = state.stores.filter((s) => s.route && s.route.trace === 'pending' && s.ownerId === state.users[state.role].id).length;
    const todo = state.tasks.filter((t) => t.toId === state.users[state.role].id && t.status === '待接受').length;
    return { home: pendingTrace + todo || 0 };
  };

  /* ---------- 黄金演示路径（十分钟八步） ---------- */
  D.GUIDE = [
    { title: '① 授权与出发', sub: '授权明示 · 今日路线 · 回访提醒 · 待办一屏', screen: 'auth', role: 'dj', prepare: (s) => { s.ui.authDone = false; s.perms = { mic: false, geo: false, cam: false }; } },
    { title: '② 进入街道 · 扫街辅助', sub: '一马路：新开 / 合作 / 待回访三组分列', screen: 'street', params: { name: '一马路' }, role: 'dj', prepare: (s) => { s.ui.authDone = true; s.perms = { mic: true, geo: true, cam: true }; } },
    { title: '③ 到店 · 打点与拍门头建档', sub: '定位与时间戳 · OCR 置信度 · 工商匹配与去重', screen: 'visit-start', params: { storeId: 's_bing' }, role: 'dj', prepare: (s) => { s.ui.authDone = true; s.perms = { mic: true, geo: true, cam: true }; } },
    { title: '④ 拜访后 · 说一句留痕', sub: '实时转写 · 热词高亮 · 识别中断不丢内容 · 弱网缓存', screen: 'record', params: { storeId: 's_bing' }, role: 'dj', prepare: (s) => { s.ui.authDone = true; s.demo.checkedIn = true; } },
    { title: '⑤ 只改错的字段 · 两道闸门', sub: '16 + 4 字段 · 评分 58 / 60 → 改下一步 → 71 通过 · 归档后选商机', screen: 'confirm', params: { storeId: 's_bing', version: 'weak' }, role: 'dj', prepare: (s) => { s.ui.authDone = true; s.demo.checkedIn = true; } },
    { title: '⑥ 分层与回访提醒', sub: '按贵司分层标准四象限 · 回访周期 · 延期原因必填', screen: 'reminders', role: 'dj', prepare: (s) => { s.ui.authDone = true; if (!s.demo.archived) D.archiveDemoVisit(s, 'good', '新建商机'); } },
    { title: '⑦ 现场答疑 · 识虫与知识库', sub: '答案带出处 · 未命中不编答案回流 · 拍照识虫', screen: 'kb', role: 'dj', prepare: (s) => { s.ui.authDone = true; } },
    { title: '⑧ 有意向 · GTM 助手', sub: '三类模版 · 六段方案 + 报价单 · 分享 · 超阈值进审批', screen: 'gtm', params: { storeId: 's_bing' }, role: 'dj', prepare: (s) => { s.ui.authDone = true; if (!s.demo.archived) D.archiveDemoVisit(s, 'good', '新建商机'); } },
    { title: '⑨ 晚上收工 · 今日回顾', sub: '四个数字 + AI 即时总结 · 已打点未留痕点名 · 明日路线', screen: 'review', role: 'dj', prepare: (s) => { s.ui.authDone = true; if (!s.demo.archived) D.archiveDemoVisit(s, 'good', '新建商机'); } },
    { title: '⑩ 主管手机端', sub: '留痕率 · 未留痕点名 · 待审批 · 催办 / 辅导 / 下发 · 数据咨询', screen: 'home', role: 'mgr', prepare: (s) => { s.ui.authDone = true; s.ui.teamMode = 'team'; } },
    { title: '⑪ 任务闭环', sub: '接受 / 拒绝附意见 · 标记完成 · 延期原因必填', screen: 'task', params: { id: 't_fudao' }, role: 'dj', prepare: (s) => { s.ui.authDone = true; } },
    { title: '⑫ 客户 360（手机端）', sub: '基本信息 · 拜访时间线 · 商机 · 方案与报价 · 回访与待办', screen: 'customer', params: { id: 's_bing' }, role: 'dj', prepare: (s) => { s.ui.authDone = true; if (!s.demo.archived) D.archiveDemoVisit(s, 'good', '新建商机'); } },
  ];
})();
