/* ============================================================
   LBS 销售管理小程序 Demo — 模拟数据（全部虚构）
   演示日期固定：2026-09-07（周一）
   对齐 PRD 7.1 示例：一马路 · 甲店(服务中+未结客诉) · 乙店(两天前已拜访) · 丙店(今日约访)
   ============================================================ */
(function () {
  'use strict';
  const D = window.DATA = { VERSION: 9 };

  /* ---------- 用户 / 角色 ---------- */
  const users = {
    dj: { id: 'u_dj', name: '刘晓芸', roleName: '地推销售', org: '华东一区 · 地推组', scope: '本人负责客户 · 一马路 / 二马路 / 建设路', color: '#0e8f6e', phone: '138****2211' },
    ka: { id: 'u_ka', name: '陈奕辰', roleName: 'KA 销售', org: '华东 KA 组', scope: '本人负责的集团客户及协作门店', color: '#2563eb', phone: '139****8807' },
    mgr: { id: 'u_mgr', name: '周明远', roleName: '销售主管', org: '华东一区', scope: '华东一区全部地推 / KA 团队', color: '#7c3aed', phone: '137****0192' },
  };

  /* ---------- 街道 ---------- */
  const streets = [
    { id: 'st_1', name: '一马路', district: '浦东新区', city: '上海' },
    { id: 'st_2', name: '二马路', district: '浦东新区', city: '上海' },
    { id: 'st_3', name: '建设路', district: '浦东新区', city: '上海' },
    { id: 'st_4', name: '张江路', district: '浦东新区', city: '上海' },
  ];

  /* ---------- 门店 ----------
     coop: active 服务中 / paused 停做 / none 未合作
     complaint.status: open 未结 / closed 已结 / none 无 / not_connected 未接入 / stale 数据待更新
     perm: full 可查看 / minimal 仅最小避重提示
  ------------------------------ */
  const stores = [
    { id: 's_jia', name: '满堂红火锅（一马路店）', alias: '甲店', type: '餐饮 · 火锅', street: '一马路', district: '浦东新区', address: '一马路 128 号 1F', coop: 'active', ownerId: 'u_dj', perm: 'full',
      group: null, since: '2025-12-05', contractEnd: '2026-11-30', primaryOppId: 'o_jia_renew',
      complaint: { status: 'open', summary: '9/3 客户反馈后厨仍见蟑螂活动，服务部已派单复处理', date: '2026-09-03', source: '服务系统 · 9/7 08:30 同步' },
      lastVisit: { date: '2026-08-28', type: '回访', result: '客户反映蟑螂问题反复，已转服务部', by: '刘晓芸' },
      contacts: [
        { name: '罗建平', role: '店长', decision: '对接人', phone: '186****3301', source: 'CRM', verified: true },
        { name: '黄老板', role: '老板', decision: '决策人', phone: '—', source: '拜访口述', verified: false },
      ],
      services: ['有害生物防治（月度）'], updatedAt: '2026-09-07 08:30' },
    { id: 's_yi', name: '阿婆烧腊饭堂', alias: '乙店', type: '餐饮 · 快餐', street: '一马路', district: '浦东新区', address: '一马路 96 号', coop: 'none', ownerId: 'u_dj', perm: 'full',
      primaryOppId: 'o_yi',
      complaint: { status: 'none' },
      lastVisit: { date: '2026-09-05', type: '陌拜', result: '见到老板娘，暂无需求，10 月再看', by: '刘晓芸' },
      contacts: [{ name: '梁老板娘', role: '老板娘', decision: '决策人', phone: '—', source: '拜访口述', verified: false }],
      services: [], updatedAt: '2026-09-05 17:10' },
    { id: 's_bing', name: '蜀香居川菜馆', alias: '丙店', type: '餐饮 · 中餐', street: '一马路', district: '浦东新区', address: '一马路 156 号', coop: 'none', ownerId: 'u_dj', perm: 'full',
      primaryOppId: 'o_bing',
      complaint: { status: 'none' },
      lastVisit: { date: '2026-09-02', type: '电话', result: '店长王女士反馈后厨偶见虫，约今天 14:30 到店', by: '刘晓芸' },
      appointment: { date: '2026-09-07', time: '14:30', with: '店长 王女士' },
      contacts: [{ name: '王女士', role: '店长', decision: '对接人', phone: '159****7723', source: '电话触达', verified: true }],
      services: [], updatedAt: '2026-09-02 16:40' },
    { id: 's_lanwan', name: '蓝湾咖啡（一马路店）', type: '餐饮 · 咖啡', street: '一马路', district: '浦东新区', address: '一马路 88 号', coop: 'none', ownerId: 'u_dj', perm: 'full',
      isNewEntry: true, enteredAt: '2026-09-01', primaryOppId: 'o_lanwan',
      complaint: { status: 'none' },
      lastVisit: null,
      contacts: [], services: [], updatedAt: '2026-09-06 15:20' },
    { id: 's_laozhang', name: '老张牛肉面', type: '餐饮 · 面馆', street: '一马路', district: '浦东新区', address: '一马路 72 号', coop: 'paused', ownerId: 'u_dj', perm: 'full',
      pausedAt: '2026-06-30', pausedReason: '合同到期未续，客户认为价格偏高', primaryOppId: null,
      complaint: { status: 'closed' },
      lastVisit: { date: '2026-06-18', type: '回访', result: '续约谈判，客户要求降价 20%', by: '刘晓芸' },
      contacts: [{ name: '张老板', role: '老板', decision: '决策人', phone: '138****5510', source: 'CRM', verified: true }],
      services: ['有害生物防治（已停）'], updatedAt: '2026-06-30 12:00' },
    { id: 's_taotao', name: '陶陶居茶楼', type: '餐饮 · 茶楼', street: '一马路', district: '浦东新区', address: '一马路 200 号 2F', coop: 'active', ownerId: 'u_ka', perm: 'full',
      since: '2026-03-01', contractEnd: '2027-02-28', primaryOppId: null,
      complaint: { status: 'not_connected' },
      lastVisit: { date: '2026-08-20', type: '回访', result: '服务满意，询问卫生间清洁', by: '陈奕辰' },
      contacts: [{ name: '周经理', role: '运营经理', decision: '对接人', phone: '135****6620', source: 'CRM', verified: true }],
      services: ['有害生物防治（月度）'], updatedAt: '2026-08-20 18:00' },
    { id: 's_maixiang', name: '麦香园面包房', type: '餐饮 · 烘焙', street: '一马路', district: '浦东新区', address: '一马路 60 号', coop: 'none', ownerId: 'u_wanglei', ownerName: '王磊', perm: 'minimal',
      recentTouch: '近 7 天有触达', primaryOppId: null, complaint: { status: 'none' }, lastVisit: null, contacts: [], services: [], updatedAt: '2026-09-04 11:00' },
    { id: 's_yujia', name: '渔家灯火海鲜酒楼', type: '餐饮 · 海鲜', street: '一马路', district: '浦东新区', address: '一马路 188 号', coop: 'active', ownerId: 'u_dj', perm: 'full',
      since: '2025-10-15', contractEnd: '2026-10-14', primaryOppId: 'o_yujia_renew',
      complaint: { status: 'stale', summary: '客诉数据最近同步于 9/1，可能不是最新', date: '2026-09-01' },
      lastVisit: { date: '2026-08-30', type: '回访', result: '客户提到考虑换供应商，需核实原因', by: '刘晓芸' },
      contacts: [{ name: '吴总', role: '老板', decision: '决策人', phone: '137****9981', source: 'CRM', verified: true }, { name: '小林', role: '后厨主管', decision: '使用方', phone: '—', source: '拜访口述', verified: false }],
      services: ['有害生物防治（月度）', '油烟机清洗（季度）'], updatedAt: '2026-09-01 09:00' },
    { id: 's_xiyue', name: '喜悦烘焙（新开）', type: '餐饮 · 烘焙', street: '一马路', district: '浦东新区', address: '一马路 12 号', coop: 'none', ownerId: 'u_dj', perm: 'full',
      isNewOpen: true, openedAt: '2026-09-02', openEvidence: '开业照片 + 销售 9/3 录入', primaryOppId: 'o_xiyue',
      complaint: { status: 'none' }, lastVisit: null, contacts: [], services: [], updatedAt: '2026-09-03 10:20' },
    { id: 's_chuan', name: '小巷串串', type: '餐饮 · 串串', street: '一马路', district: '浦东新区', address: '一马路 33 号', coop: 'none', ownerId: 'u_dj', perm: 'full',
      primaryOppId: 'o_chuan', complaint: { status: 'none' },
      lastVisit: { date: '2026-09-03', type: '陌拜', result: '老板明确表示已有长期供应商，暂不考虑', by: '刘晓芸' },
      contacts: [{ name: '陈老板', role: '老板', decision: '决策人', phone: '—', source: '拜访口述', verified: false }], services: [], updatedAt: '2026-09-03 19:00' },
    { id: 's_jinpai', name: '金牌烤鸭店', type: '餐饮 · 中餐', street: '一马路', district: '浦东新区', address: '一马路 166 号', coop: 'none', ownerId: 'u_dj', perm: 'full',
      primaryOppId: 'o_jinpai', complaint: { status: 'none' },
      lastVisit: { date: '2026-09-04', type: '约访', result: '当面讲解方案，客户表示周二前回复', by: '刘晓芸' },
      contacts: [{ name: '李经理', role: '店经理', decision: '对接人', phone: '150****4471', source: 'CRM', verified: true }, { name: '孙老板', role: '老板', decision: '决策人', phone: '—', source: '客户口述', verified: false }],
      services: [], updatedAt: '2026-09-04 20:10' },
    // 二马路
    { id: 's_cuihua', name: '翠华茶餐厅（二马路店）', type: '餐饮 · 茶餐厅', street: '二马路', district: '浦东新区', address: '二马路 45 号', coop: 'active', ownerId: 'u_dj', perm: 'full',
      since: '2026-01-10', contractEnd: '2027-01-09', primaryOppId: 'o_cuihua_add', complaint: { status: 'none' },
      lastVisit: { date: '2026-08-30', type: '回访', result: '询问油烟机清洗，需要报价', by: '刘晓芸' },
      contacts: [{ name: '何店长', role: '店长', decision: '对接人', phone: '136****2098', source: 'CRM', verified: true }], services: ['有害生物防治（月度）'], updatedAt: '2026-08-30 16:00' },
    { id: 's_chuanyu', name: '川渝人家', type: '餐饮 · 中餐', street: '二马路', district: '浦东新区', address: '二马路 102 号', coop: 'none', ownerId: 'u_dj', perm: 'full',
      primaryOppId: 'o_chuanyu', complaint: { status: 'none' }, lastVisit: null, contacts: [], services: [], updatedAt: '2026-08-15 10:00' },
    { id: 's_shiguang', name: '拾光咖啡', type: '餐饮 · 咖啡', street: '二马路', district: '浦东新区', address: '二马路 8 号', coop: 'none', ownerId: 'u_zhaomin', ownerName: '赵敏', perm: 'minimal', recentTouch: '近 30 天无触达', primaryOppId: null, complaint: { status: 'none' }, lastVisit: null, contacts: [], services: [], updatedAt: '2026-08-01 10:00' },
    // 建设路
    { id: 's_laomatou', name: '老码头火锅（建设路店）', type: '餐饮 · 火锅', street: '建设路', district: '浦东新区', address: '建设路 300 号', coop: 'none', ownerId: 'u_wanglei', ownerName: '王磊', perm: 'minimal', recentTouch: '近 7 天有触达', primaryOppId: null, complaint: { status: 'none' }, lastVisit: null, contacts: [], services: [], updatedAt: '2026-09-04 10:00' },
    { id: 's_xiangyu', name: '湘遇小馆', type: '餐饮 · 湘菜', street: '建设路', district: '浦东新区', address: '建设路 77 号', coop: 'none', ownerId: 'u_dj', perm: 'full', primaryOppId: 'o_xiangyu', complaint: { status: 'none' },
      lastVisit: { date: '2026-08-26', type: '陌拜', result: '店长不在，留资料', by: '刘晓芸' }, contacts: [], services: [], updatedAt: '2026-08-26 15:00' },
    // 待补地址
    { id: 's_yunding', name: '云顶餐厅', type: '餐饮 · 中餐', street: null, district: '浦东新区', address: '张江附近（地址待补）', coop: 'none', ownerId: 'u_dj', perm: 'full', primaryOppId: null, complaint: { status: 'none' }, lastVisit: null, contacts: [], services: [], updatedAt: '2026-08-29 10:00', needsAddress: true },
    { id: 's_hehe', name: '和合小厨', type: '餐饮 · 快餐', street: null, district: '浦东新区', address: '（原始地址：金科路地铁站旁）', coop: 'none', ownerId: 'u_dj', perm: 'full', primaryOppId: null, complaint: { status: 'none' }, lastVisit: null, contacts: [], services: [], updatedAt: '2026-08-29 10:00', needsAddress: true },
    // KA
    { id: 's_ka1', name: '华信食品 · 张江工厂', type: '食品工厂', street: '张江路', district: '浦东新区', address: '张江路 1200 号', coop: 'none', ownerId: 'u_ka', perm: 'full',
      group: { name: '华信食品集团', entity: '华信食品（上海）有限公司', sites: 3 }, primaryOppId: 'o_ka1', complaint: { status: 'none' },
      lastVisit: { date: '2026-09-01', type: '勘查', result: '完成现场勘查，AIB 审核要求明确，进入报价', by: '陈奕辰' },
      contacts: [
        { name: '孙主任', role: '车间主任', decision: '使用方', phone: '139****1108', source: 'CRM', verified: true },
        { name: '钱经理', role: '品控经理', decision: '决策人', phone: '138****2260', source: 'CRM', verified: true },
        { name: '郑采购', role: '采购专员', decision: '采购方', phone: '—', source: '客户介绍', verified: false },
      ], services: [], updatedAt: '2026-09-05 18:30' },
    { id: 's_ka2', name: '华信食品 · 南翔中央厨房', type: '中央厨房', street: '张江路', district: '嘉定区', address: '南翔工业园 6 号', coop: 'active', ownerId: 'u_ka', perm: 'full',
      group: { name: '华信食品集团', entity: '华信食品（上海）有限公司', sites: 3 }, since: '2026-02-01', contractEnd: '2027-01-31', primaryOppId: 'o_ka2', complaint: { status: 'none' },
      lastVisit: { date: '2026-08-27', type: '回访', result: '服务稳定，提出卫生间深度清洁需求', by: '陈奕辰' },
      contacts: [{ name: '钱经理', role: '品控经理', decision: '决策人', phone: '138****2260', source: 'CRM', verified: true }], services: ['有害生物防治（月度）'], updatedAt: '2026-08-27 17:00' },
  ];

  /* ---------- 商机 ----------
     stage: 待触达/已触达/需求确认/方案沟通/报价商务/待签约/已赢单/已丢单/暂停培育
     tier: 'unknown' | 'none' | 20 | 50 | 80 | 'pending'(待判断，CRM 无值)
  ------------------------------ */
  const opportunities = [
    { id: 'o_bing', storeId: 's_bing', service: '有害生物防治', kind: '新购', stage: '已触达', tier: 20, tierSource: 'CRM · 9/2', ownerId: 'u_dj', ownerName: '刘晓芸',
      done: ['电话触达（9/2）', '约定到店时间'], missing: ['对接人角色与决策人', '需求与风险点确认', '现场勘查/照片', '下一次沟通时间'], stallReason: null, ai: null, updatedAt: '2026-09-02' },
    { id: 'o_yi', storeId: 's_yi', service: '有害生物防治', kind: '新购', stage: '已触达', tier: 'none', tierSource: '确认 · 9/5', ownerId: 'u_dj', ownerName: '刘晓芸',
      done: ['陌拜（9/5）'], missing: [], reconnect: '10 月复访（客户口头约定）', ai: { tier: 'none', stage: '已触达', confidence: '高', basis: ['决策人明确表示暂无需求（9/5 拜访）', '客户口头约定 10 月再看'], missing: [], next: ['10/6 前后复访，尊重不再联系要求'] }, updatedAt: '2026-09-05' },
    { id: 'o_lanwan', storeId: 's_lanwan', service: '有害生物防治', kind: '新购', stage: '待触达', tier: 'pending', tierSource: 'CRM 无值', ownerId: 'u_dj', ownerName: '刘晓芸', done: [], missing: ['门店存在、地址核对', '真实接触结果'], ai: null, updatedAt: '2026-09-01' },
    { id: 'o_jia_renew', storeId: 's_jia', service: '有害生物防治', kind: '续约', stage: '已触达', tier: 50, tierSource: 'CRM · 8/28', ownerId: 'u_dj', ownerName: '刘晓芸',
      done: ['回访（8/28）', '续约意向沟通'], missing: ['客诉处理结果', '续约条件与价格口径'], stallReason: '未结客诉，续约推进暂缓',
      ai: { tier: 50, stage: '已触达', confidence: '中', basis: ['服务中客户，合同 11/30 到期', '客户续约意愿存在但受客诉影响'], missing: ['客诉 9/3 复处理结果'], next: ['先了解/协调服务问题，再谈续约（未结客诉优先）'], note: '未结客诉期间不建立额外收费商机' }, updatedAt: '2026-09-03' },
    { id: 'o_yujia_renew', storeId: 's_yujia', service: '有害生物防治', kind: '续约', stage: '需求确认', tier: 50, tierSource: 'CRM · 8/30', ownerId: 'u_dj', ownerName: '刘晓芸',
      done: ['回访（8/30）'], missing: ['换供应商原因核实'], stallReason: '客户提及考虑换供应商',
      ai: { tier: 20, stage: '需求确认', confidence: '中', basis: ['8/30 回访客户提到考虑换供应商，与此前"服务满意"事实冲突'], missing: ['冲突原因', '决策人态度'], next: ['与吴总当面核实换供应商原因'], conflict: '客户反馈否定先前事实，建议降层 50%→20%，已进入主管复核', reviewStatus: '待复核' }, updatedAt: '2026-09-01' },
    { id: 'o_xiyue', storeId: 's_xiyue', service: '有害生物防治', kind: '新购', stage: '待触达', tier: 'pending', tierSource: 'CRM 无值', ownerId: 'u_dj', ownerName: '刘晓芸', done: ['新开店录入（9/3）'], missing: ['真实接触结果'], ai: null, updatedAt: '2026-09-03' },
    { id: 'o_chuan', storeId: 's_chuan', service: '有害生物防治', kind: '新购', stage: '已触达', tier: 'none', tierSource: '确认 · 9/3', ownerId: 'u_dj', ownerName: '刘晓芸', done: ['陌拜（9/3）'], missing: [], reconnect: '半年后或供应商更换时', ai: null, updatedAt: '2026-09-03' },
    { id: 'o_jinpai', storeId: 's_jinpai', service: '有害生物防治', kind: '新购', stage: '方案沟通', tier: 50, tierSource: 'CRM · 9/4', ownerId: 'u_dj', ownerName: '刘晓芸',
      done: ['陌拜（8/22）', '需求确认（8/29）', '方案生成并当面讲解（9/4）'], missing: ['客户方案反馈', '决策人孙老板态度', '预算口径'], proposalId: 'p_jinpai',
      ai: { tier: 50, stage: '方案沟通', confidence: '中', basis: ['方案已当面讲解（9/4 拜访事实）', '客户承诺周二前回复'], missing: ['方案反馈', '决策人意见'], next: ['9/8 回访确认方案反馈与异议'], note: '仅生成/发送方案不推进阶段，需客户反馈证据' }, updatedAt: '2026-09-04' },
    { id: 'o_cuihua_add', storeId: 's_cuihua', service: '油烟机清洗', kind: '增购', stage: '需求确认', tier: 20, tierSource: 'CRM · 8/30', ownerId: 'u_dj', ownerName: '刘晓芸', done: ['回访提出需求（8/30）'], missing: ['清洗频次', '设备数量', '预算'], ai: { tier: 20, stage: '需求确认', confidence: '中', basis: ['服务中客户主动提出油烟机清洗需求'], missing: ['频次、设备数量等参数'], next: ['回访确认参数后再生成方案'] }, updatedAt: '2026-08-30' },
    { id: 'o_chuanyu', storeId: 's_chuanyu', service: '有害生物防治', kind: '新购', stage: '待触达', tier: 'pending', tierSource: 'CRM 无值', ownerId: 'u_dj', ownerName: '刘晓芸', done: [], missing: ['真实接触结果'], ai: null, updatedAt: '2026-08-15' },
    { id: 'o_xiangyu', storeId: 's_xiangyu', service: '有害生物防治', kind: '新购', stage: '待触达', tier: 'unknown', tierSource: 'CRM · 8/26', ownerId: 'u_dj', ownerName: '刘晓芸', done: ['陌拜未见到关键人（8/26）'], missing: ['对接人', '真实接触结果'], ai: { tier: 'unknown', stage: '待触达', confidence: '高', basis: ['8/26 陌拜店长不在，仅留资料，不构成有效接触'], missing: ['对接人角色', '需求'], next: ['再次到店或电话约访'], note: '无人接待保留待触达，不默认 20%' }, updatedAt: '2026-08-26' },
    // KA
    { id: 'o_ka1', storeId: 's_ka1', service: '有害生物防治', kind: '新购', stage: '报价商务', tier: 80, tierSource: 'CRM · 9/5', ownerId: 'u_ka', ownerName: '陈奕辰',
      done: ['线索触达（8/12）', '需求确认 · AIB 审核要求（8/20）', '现场勘查 + 承诺记录（9/1）', '方案沟通（9/3）', '报价 v2 提交审批（9/5）'], missing: ['报价审批结果', '承诺与报价/合同一致性核对', '账期确认'],
      ka: { auditReq: 'AIB 审核（2026-11 前）', surveyResult: '仓库与生产区共 3 处鼠迹，需增设诱饵站 24 个', serviceBoundary: '生产区、仓库、办公区；不含厂区外围绿化', costing: '成本核算表 v2 已填', paymentTerms: '客户要求 60 天账期（待审批）', nonStandard: '一年两次风险勘查（口头承诺）', handover: '未开始' },
      ai: { tier: 80, stage: '报价商务', confidence: '高', basis: ['方案已获品控经理认可（9/3）', '报价 v2 已提交审批', '客户要求 11 月前完成 AIB 审核，签约时间明确'], missing: ['承诺"一年两次风险勘查"未计入报价 v2'], next: ['推动审批；核对承诺与合同差异，不重复推销'] }, updatedAt: '2026-09-05' },
    { id: 'o_ka2', storeId: 's_ka2', service: '卫生间深度清洁', kind: '增购', stage: '需求确认', tier: 50, tierSource: 'CRM · 8/27', ownerId: 'u_ka', ownerName: '陈奕辰', done: ['回访提出需求（8/27）', '约定 9/10 现场勘查'], missing: ['勘查结论', '频次与范围'], ai: { tier: 50, stage: '需求确认', confidence: '中', basis: ['服务中客户主动提出需求，已约勘查'], missing: ['勘查结论'], next: ['9/10 勘查后生成方案'] }, updatedAt: '2026-08-27' },
  ];

  /* ---------- 拜访事实 ----------
     status: draft / uploading / ai / pending_confirm / saved / synced / failed
  ------------------------------ */
  const visits = [
    { id: 'v_bing_call', storeId: 's_bing', oppId: 'o_bing', time: '2026-09-02 16:20', type: '电话', by: '刘晓芸', contact: { name: '王女士', role: '店长' },
      needs: ['后厨偶见虫，想了解服务'], observations: [], commitments: { customer: [], sales: ['9/7 14:30 到店介绍'] }, result: '约定到店', next: '到店拜访', planDate: '2026-09-07', status: 'synced', media: [] },
    { id: 'v_yi', storeId: 's_yi', oppId: 'o_yi', time: '2026-09-05 16:40', type: '陌拜', by: '刘晓芸', contact: { name: '梁老板娘', role: '老板娘' },
      needs: [], objections: ['暂无需求，生意淡季'], observations: ['门店约 60㎡，后厨整洁'], commitments: { customer: ['10 月可以再聊'], sales: [] }, result: '无当前意向', next: '10 月复访', planDate: '2026-10-08', status: 'synced', media: [{ kind: 'storefront', label: '门头' }] },
    { id: 'v_jinpai', storeId: 's_jinpai', oppId: 'o_jinpai', time: '2026-09-04 19:30', type: '约访', by: '刘晓芸', contact: { name: '李经理', role: '店经理' },
      needs: ['后厨与仓库鼠患', '月度服务'], objections: ['担心影响营业时间'], observations: ['仓库墙角有鼠洞', '后厨排水沟未封'], commitments: { customer: ['周二前给方案反馈'], sales: ['方案中说明夜间作业安排'] }, result: '方案已讲解', next: '回访确认反馈', planDate: '2026-09-08', status: 'synced', media: [{ kind: 'kitchen', label: '后厨排水沟' }, { kind: 'corner', label: '仓库墙角' }] },
    { id: 'v_jia', storeId: 's_jia', oppId: 'o_jia_renew', time: '2026-08-28 15:10', type: '回访', by: '刘晓芸', contact: { name: '罗建平', role: '店长' },
      needs: ['蟑螂问题反复'], objections: ['对效果有疑虑'], observations: ['吧台下方有蟑螂活动痕迹'], commitments: { customer: [], sales: ['协调服务部复处理'] }, result: '转服务部处理', next: '跟进客诉处理结果', planDate: '2026-09-06', status: 'synced', media: [] },
    { id: 'v_ka1', storeId: 's_ka1', oppId: 'o_ka1', time: '2026-09-01 10:00', type: '勘查', by: '陈奕辰', contact: { name: '钱经理', role: '品控经理' },
      needs: ['AIB 审核', '仓库鼠患控制'], observations: ['仓库 3 处鼠迹', '生产区门缝未封'], commitments: { customer: ['11 月前完成审核准备'], sales: ['一年两次风险勘查', '月度服务 + 24 个诱饵站'] }, result: '需求明确，进入方案', next: '出方案与报价', planDate: '2026-09-03', status: 'synced', media: [{ kind: 'corner', label: '仓库鼠迹' }] },
    { id: 'v_lanwan_draft', storeId: 's_lanwan', oppId: 'o_lanwan', time: '2026-09-06 15:20', type: '陌拜', by: '刘晓芸', contact: { name: '', role: '店员' },
      needs: [], observations: ['门店装修中'], commitments: { customer: [], sales: [] }, result: '未见到关键人', next: '开业后再访', planDate: '', status: 'pending_confirm', aiMissing: ['计划日期', '对接人姓名（可不填）'], media: [{ kind: 'storefront', label: '门头' }] },
    { id: 'v_chuan', storeId: 's_chuan', oppId: 'o_chuan', time: '2026-09-03 18:40', type: '陌拜', by: '刘晓芸', contact: { name: '陈老板', role: '老板' }, needs: [], objections: ['已有长期供应商'], observations: [], commitments: { customer: [], sales: [] }, result: '无当前意向', next: '半年后再联系', planDate: '2027-03-03', status: 'synced', media: [] },
  ];

  /* ---------- 任务 ----------
     status: todo / doing / done / rescheduled / cancelled
     source: 客户约定 / 规则型 / AI建议 / 主管分配 / 服务风险 / 本人创建
  ------------------------------ */
  const tasks = [
    { id: 't_bing_today', storeId: 's_bing', oppId: 'o_bing', title: '到店约访：介绍月度服务方案', type: '约访', ownerId: 'u_dj', ownerName: '刘晓芸', due: '2026-09-07', time: '14:30', status: 'todo', source: '客户约定', reason: '9/2 电话中店长王女士约定', evidence: ['拜访记录 9/2 电话'], expected: '确认需求、关键人与下一步' },
    { id: 't_jinpai', storeId: 's_jinpai', oppId: 'o_jinpai', title: '回访确认方案反馈与异议', type: '回访', ownerId: 'u_dj', ownerName: '刘晓芸', due: '2026-09-08', status: 'todo', source: '客户约定', reason: '客户承诺周二前回复（优先于规则周期）', evidence: ['拜访记录 9/4'], expected: '获得方案反馈；如有异议记录原因' },
    { id: 't_jia_complaint', storeId: 's_jia', oppId: 'o_jia_renew', title: '了解/协调客诉处理结果，再谈续约', type: '客诉跟进', ownerId: 'u_dj', ownerName: '刘晓芸', due: '2026-09-06', status: 'todo', source: '服务风险', reason: '未结客诉优先；续约推进暂缓', evidence: ['客诉 9/3 · 服务系统'], expected: '确认复处理结果与客户态度', overdue: true },
    { id: 't_cuihua', storeId: 's_cuihua', oppId: 'o_cuihua_add', title: '回访确认油烟机清洗参数（频次/设备数）', type: '回访', ownerId: 'u_dj', ownerName: '刘晓芸', due: '2026-09-06', status: 'todo', source: '规则型', reason: '20% 分层 · 7 天周期（演示规则）', evidence: ['商机分层 20% · 8/30'], expected: '拿到参数后生成方案', overdue: true },
    { id: 't_xiyue', storeId: 's_xiyue', oppId: 'o_xiyue', title: '新开店首次触达', type: '陌拜', ownerId: 'u_dj', ownerName: '刘晓芸', due: '2026-09-09', status: 'todo', source: '主管分配', reason: '主管周明远 9/4 分配：新开店 7 天内触达', evidence: ['开业照片 9/2'], expected: '确认对接人与需求' },
    { id: 't_yi_oct', storeId: 's_yi', oppId: 'o_yi', title: '10 月复访（客户约定）', type: '回访', ownerId: 'u_dj', ownerName: '刘晓芸', due: '2026-10-08', status: 'todo', source: '客户约定', reason: '客户口头约定 10 月再看', evidence: ['拜访记录 9/5'], expected: '重新确认需求' },
    { id: 't_chuan_done', storeId: 's_chuan', oppId: 'o_chuan', title: '陌拜：小巷串串', type: '陌拜', ownerId: 'u_dj', ownerName: '刘晓芸', due: '2026-09-03', status: 'done', doneAt: '2026-09-03 18:40', source: '本人创建', reason: '', evidence: ['拜访记录 9/3'], expected: '' },
    { id: 't_ka_quote', storeId: 's_ka1', oppId: 'o_ka1', title: '跟进报价 v2 审批结果', type: '商务', ownerId: 'u_ka', ownerName: '陈奕辰', due: '2026-09-08', status: 'todo', source: '本人创建', reason: '报价 9/5 提交审批', evidence: ['报价 v2'], expected: '拿到审批结论' },
    { id: 't_ka_survey', storeId: 's_ka2', oppId: 'o_ka2', title: '南翔中央厨房现场勘查（卫生间深度清洁）', type: '勘查', ownerId: 'u_ka', ownerName: '陈奕辰', due: '2026-09-10', time: '10:00', status: 'todo', source: '客户约定', reason: '8/27 回访约定', evidence: ['拜访记录 8/27'], expected: '勘查结论、范围与频次' },
    { id: 't_ka_commit', storeId: 's_ka1', oppId: 'o_ka1', title: '核对"一年两次风险勘查"承诺是否进入报价与合同', type: '承诺核对', ownerId: 'u_ka', ownerName: '陈奕辰', due: '2026-09-07', status: 'todo', source: 'AI建议', reason: 'AI 发现承诺未计入报价 v2（待人确认）', evidence: ['拜访记录 9/1 · 承诺条目'], expected: '补入报价或授权例外' },
    { id: 't_mgr_coach', storeId: 's_jinpai', oppId: 'o_jinpai', title: '与刘晓芸复盘金牌烤鸭方案反馈', type: '辅导', ownerId: 'u_mgr', ownerName: '周明远', due: '2026-09-09', status: 'todo', source: '本人创建', reason: '方案发送 3 天无反馈', evidence: ['商机推进卡'], expected: '明确异议处理策略' },
    { id: 't_wanglei_overdue', storeId: 's_laomatou', oppId: null, title: '回访：老码头火锅', type: '回访', ownerId: 'u_wanglei', ownerName: '王磊', due: '2026-09-04', status: 'todo', source: '规则型', reason: '50% 分层 · 3 天周期', evidence: [], expected: '', overdue: true },
  ];

  /* ---------- 方案模板 & 方案 ---------- */
  const templates = [
    { id: 'tpl_rest_pest', name: '餐饮单店 · 有害生物防治', version: 'v3.2', segment: '餐饮单店', service: '有害生物防治', region: '华东', reviewedBy: '技术部 李工 / 地推负责人', reviewedAt: '2026-08-20', status: '已发布',
      required: ['门店名称与现场观察', '已确认需求', '服务范围与安排'], replaceable: ['客户配合事项', '联系方式'], pricing: '报价待审批（不含自动定价）', approver: '技术部' },
    { id: 'tpl_rest_toilet', name: '餐饮单店 · 卫生间深度清洁', version: 'v1.4', segment: '餐饮单店', service: '卫生间深度清洁', region: '华东', reviewedBy: '技术部 李工', reviewedAt: '2026-07-30', status: '已发布', required: ['门店名称', '卫生间数量', '已确认需求'], replaceable: ['客户配合事项'], pricing: '报价待审批', approver: '技术部' },
    { id: 'tpl_factory', name: '食品工厂 · 综合防治（AIB）', version: 'v0.9', segment: '食品工厂', service: '有害生物防治', region: '华东', reviewedBy: '—', reviewedAt: '', status: '审核中（P1）', required: [], replaceable: [], pricing: '报价待审批', approver: '技术部' },
  ];
  const proposals = [
    { id: 'p_jinpai', storeId: 's_jinpai', oppId: 'o_jinpai', templateId: 'tpl_rest_pest', templateVersion: 'v3.2', version: 2, status: 'marked_sent', confirmedBy: '刘晓芸', createdAt: '2026-09-04 18:20',
      inputSnapshot: { needs: ['后厨与仓库鼠患', '月度服务'], observations: ['仓库墙角有鼠洞', '后厨排水沟未封'], photos: ['后厨排水沟', '仓库墙角'], contact: '李经理（店经理）' },
      events: [{ t: '2026-09-04 18:20', e: '生成 v1' }, { t: '2026-09-04 18:35', e: '重新生成 v2（补充夜间作业说明）' }, { t: '2026-09-04 18:40', e: '人工确认 v2' }, { t: '2026-09-04 18:41', e: '导出 PDF' }, { t: '2026-09-04 19:30', e: '人工标记已发送（当面讲解）' }],
      feedback: null, pendingReview: [] },
  ];

  /* ---------- 知识（FAQ / 异议处理卡） ---------- */
  const faq = [
    { id: 'k1', q: '后厨发现鼠迹，多久能见效？', kind: 'FAQ', service: '有害生物防治', segment: '餐饮', region: '华东', source: '技术部《鼠类防治作业标准（2026）》第 4 节', reviewer: '技术部 李工', version: 'v3', validUntil: '2027-06-30', status: '已发布',
      answer: '首次服务后通常 1–2 周内活动明显减少；完整控制一般需要 1–2 个月，并需要门店配合封堵孔洞、清理食源。我们会在每次服务后提供记录，让您看到变化。', limits: '不承诺"根除"或具体天数；实际周期取决于现场封堵与卫生配合。', internal: '若客户追问"保证"，转技术协助；不得口头承诺无鼠。', keywords: ['鼠', '老鼠', '见效', '多久'] },
    { id: 'k2', q: '你们和现在的供应商有什么区别？', kind: '异议处理', service: '有害生物防治', segment: '餐饮', region: '华东', source: '销售部《常见异议处理卡》v2', reviewer: '地推负责人', version: 'v2', validUntil: '2027-03-31', status: '已发布',
      answer: '我们每次服务都有可查的记录与照片，风险点位有专人复核；出现问题 24 小时内响应。可以先看一份您同类门店的服务记录样例。', limits: '不贬低竞品；不承诺价格对比。', internal: '内部提示：了解现供应商到期时间与不满点，再谈方案。', keywords: ['供应商', '区别', '为什么', '换'] },
    { id: 'k3', q: '服务时会不会影响营业？', kind: 'FAQ', service: '有害生物防治', segment: '餐饮', region: '华东', source: '技术部《作业时间与现场规范》', reviewer: '技术部 李工', version: 'v1', validUntil: '2027-06-30', status: '已发布',
      answer: '常规作业可安排在打烊后或营业前，单店通常 40–60 分钟；药剂投放点位避开食品加工区，作业后可正常营业。', limits: '具体时长以现场勘查为准。', internal: '', keywords: ['营业', '影响', '时间', '打烊'] },
    { id: 'k4', q: '药剂对食品安全有没有影响？', kind: 'FAQ', service: '有害生物防治', segment: '餐饮', region: '全国', source: '技术部《药剂安全说明》2026 版', reviewer: '技术部 李工', version: 'v4', validUntil: '2027-12-31', status: '已发布',
      answer: '使用的药剂均为合规登记产品，投放采用饵站/胶饵等封闭形式，不在食品与操作台面直接施药；每次作业提供药剂清单与安全说明。', limits: '不承诺"零风险"，按规范使用。', internal: '可向客户提供药剂登记证号（技术部提供）。', keywords: ['药剂', '食品安全', '安全', '药'] },
    { id: 'k5', q: '能不能先免费试一次？', kind: '异议处理', service: '通用', segment: '餐饮', region: '华东', source: '销售部《常见异议处理卡》v2', reviewer: '地推负责人', version: 'v2', validUntil: '2027-03-31', status: '已发布',
      answer: '我们可以先做一次免费现场勘查，出具风险点位记录；正式服务需要签约后安排。', limits: '不承诺免费服务；勘查不等于试服务。', internal: '涉及优惠/减免需主管审批，不在现场承诺。', keywords: ['免费', '试', '试用'] },
    { id: 'k6', q: '2025 年秋季促销政策是什么？', kind: 'FAQ', service: '通用', segment: '餐饮', region: '华东', source: '销售部 2025 促销通知', reviewer: '地推负责人', version: 'v1', validUntil: '2025-12-31', status: '已失效', answer: '（已失效，不再参与检索）', limits: '', internal: '', keywords: ['促销', '优惠', '政策'] },
  ];

  /* ---------- 主管问数：固定问题模板 ---------- */
  const askTemplates = [
    { id: 'a1', q: '本周哪些客户逾期？', variants: ['这周有哪些回访逾期了', '逾期的客户有哪些'],
      answer: { kind: 'list', period: '2026-09-01 – 2026-09-07', definition: '到期未完成且未改期的回访/跟进任务', sample: 3, updatedAt: '2026-09-07 09:30',
        rows: [{ store: '满堂红火锅（一马路店）', task: '客诉跟进', owner: '刘晓芸', days: 1, storeId: 's_jia' }, { store: '翠华茶餐厅（二马路店）', task: '回访', owner: '刘晓芸', days: 1, storeId: 's_cuihua' }, { store: '老码头火锅（建设路店）', task: '回访', owner: '王磊', days: 3, storeId: 's_laomatou' }],
        explain: '共 3 项逾期，其中 1 项为未结客诉跟进，建议优先。' } },
    { id: 'a2', q: '哪个区域近 30 天签约金额高？', variants: ['哪条街产出高', '近一个月哪个区域签约多'],
      answer: { kind: 'unavailable', period: '2026-08-08 – 2026-09-07', definition: '"产出"默认口径 = 权威签署事件对应的有效合同金额', sample: 0, updatedAt: '2026-09-07 09:30',
        reason: '签约/合同签署数据尚未接入（P1 接口），无法计算签约金额，不用商机预估额替代。',
        alt: { title: '可展示替代指标：近 30 天有效触达门店数', rows: [{ label: '一马路', value: 18 }, { label: '二马路', value: 9 }, { label: '建设路', value: 6 }, { label: '张江路', value: 2 }], note: '同店多次只算一次；纯拍照不算有效触达' },
        alt2: { title: '方案反馈率（近 30 天）', rows: [{ label: '一马路', value: 0.5, display: '50%（2/4）' }, { label: '二马路', value: 0, display: '0%（0/1）' }, { label: '建设路', value: null, display: '暂无数据' }] } } },
    { id: 'a3', q: '本月新触达门店后续转化如何？', variants: ['9 月新触达的门店推进到哪了', '新触达转化'],
      answer: { kind: 'funnel', period: '2026-09-01 – 2026-09-07（队列：首次有效触达）', definition: '同一首次有效触达队列内各阶段去重门店数；赢单观察窗 30 天', sample: 14, updatedAt: '2026-09-07 09:30',
        rows: [{ label: '首次有效触达', value: 14 }, { label: '需求确认', value: 5 }, { label: '方案沟通', value: 2 }, { label: '报价商务', value: 0 }, { label: '赢单', value: 0, display: '观察中' }],
        explain: '队列未满 30 天观察窗，转化率标记"观察中"，不以本周成交除以本周拜访。' } },
    { id: 'a4', q: '团队本周有效拜访分布？', variants: ['每个人这周拜访了多少'],
      answer: { kind: 'bars', period: '2026-09-01 – 2026-09-07', definition: '符合已发布有效拜访规则且已生效的活动数（地推/KA 分开）', sample: 47, updatedAt: '2026-09-07 09:30',
        rows: [{ label: '刘晓芸', value: 19, tone: '' }, { label: '王磊', value: 15 }, { label: '赵敏', value: 9 }, { label: '陈奕辰（KA）', value: 4, tone: 'info' }],
        explain: 'KA 不采用地推次数口径；本结果不构成个人绩效结论。' } },
  ];

  /* ---------- 团队（主管视角） ---------- */
  const team = {
    members: [
      { id: 'u_dj', name: '刘晓芸', role: '地推', coverage: 21, effective: 19, overdue: 2, pendingConfirm: 1, proposalsSent: 4, feedback: 2, stages: { 待触达: 5, 已触达: 6, 需求确认: 3, 方案沟通: 1, 报价商务: 0 }, color: '#0e8f6e' },
      { id: 'u_wanglei', name: '王磊', role: '地推', coverage: 17, effective: 15, overdue: 1, pendingConfirm: 0, proposalsSent: 2, feedback: 1, stages: { 待触达: 7, 已触达: 4, 需求确认: 2, 方案沟通: 1, 报价商务: 0 }, color: '#d97706' },
      { id: 'u_zhaomin', name: '赵敏', role: '地推', coverage: 11, effective: 9, overdue: 0, pendingConfirm: 2, proposalsSent: 1, feedback: 0, stages: { 待触达: 6, 已触达: 3, 需求确认: 1, 方案沟通: 0, 报价商务: 0 }, color: '#db2777' },
      { id: 'u_ka', name: '陈奕辰', role: 'KA', coverage: 3, effective: 4, overdue: 0, pendingConfirm: 0, proposalsSent: 1, feedback: 1, stages: { 需求确认: 1, 方案沟通: 0, 报价商务: 1, 待签约: 0 }, color: '#2563eb' },
    ],
    blockers: [
      { id: 'b1', title: '金牌烤鸭 · 方案已发送 3 天无反馈', owner: '刘晓芸', storeId: 's_jinpai', oppId: 'o_jinpai', kind: '停滞', evidence: '9/4 人工标记已发送，无客户反馈事件', suggest: '9/8 回访确认反馈；辅导异议处理' },
      { id: 'b2', title: '满堂红火锅 · 未结客诉影响续约', owner: '刘晓芸', storeId: 's_jia', oppId: 'o_jia_renew', kind: '服务风险', evidence: '客诉 9/3 · 跟进任务逾期 1 天', suggest: '先协调服务部复处理结果' },
      { id: 'b3', title: '华信张江工厂 · 承诺未进入报价', owner: '陈奕辰', storeId: 's_ka1', oppId: 'o_ka1', kind: '承诺差异', evidence: '拜访 9/1 承诺"一年两次风险勘查"，报价 v2 未计入', suggest: '补入报价或授权例外后再提交' },
      { id: 'b4', title: '老码头火锅 · 回访逾期 3 天', owner: '王磊', storeId: 's_laomatou', oppId: null, kind: '逾期', evidence: '规则型任务 9/4 到期，未完成未改期', suggest: '提醒负责人；超过阈值升级' },
    ],
    reviews: [
      { id: 'r1', title: '渔家灯火 · AI 建议降层 50%→20%', owner: '刘晓芸', storeId: 's_yujia', oppId: 'o_yujia_renew', reason: '客户反馈"考虑换供应商"与此前"服务满意"冲突', status: '待复核' },
    ],
    unfollowed: [
      { storeId: 's_xiangyu', days: 12, owner: '刘晓芸' }, { storeId: 's_chuanyu', days: 23, owner: '刘晓芸' }, { storeId: 's_taotao', days: 18, owner: '陈奕辰' },
    ],
    trend: { weeks: ['8/17', '8/24', '8/31', '9/7'], coverage: [36, 42, 40, 49], effective: [34, 38, 33, 43], proposals: [3, 5, 4, 7] },
  };

  /* ---------- P1 预览数据 ---------- */
  const p1 = {
    quote: { oppId: 'o_jinpai', category: '餐饮单店', rule: '单店标准报价规则 v1（成本核算表口径）', status: '草稿',
      params: [
        { k: '服务项', v: '有害生物防治（鼠 + 蟑）', ok: true }, { k: '门店面积', v: '约 180㎡（现场观察）', ok: true }, { k: '服务频次', v: '每月 1 次 + 首次强化', ok: true },
        { k: '诱饵站数量', v: '待勘查确认', ok: false }, { k: '人工/交通', v: '按区域标准', ok: true }, { k: '服务周期', v: '12 个月', ok: true }, { k: '税口径', v: '待财务确认', ok: false },
      ],
      note: '缺失必需参数（诱饵站数量、税口径）时不输出正式价格；金额由规则程序计算，AI 仅解释。' },
    kaQuote: { oppId: 'o_ka1', category: '食品工厂', rule: 'KA 成本核算表 v2', status: '待审批', version: 'v2', submittedAt: '2026-09-05',
      lines: [{ k: '成本（同口径）', v: '仅审批人可见', locked: true }, { k: '毛利率', v: '仅审批人可见', locked: true }, { k: '建议售价', v: '¥ 86,400 / 年（未税）', locked: false }, { k: '客户预期', v: '¥ 80,000 左右（口述）', locked: false }],
      approvals: [{ who: '区域经理 周明远', status: '已批准', at: '2026-09-06' }, { who: '财务 审批', status: '审批中', at: '' }] },
    commitments: { oppId: 'o_ka1', items: [
      { id: 'c1', who: '陈奕辰', when: '2026-09-01', to: '钱经理（品控）', what: '一年两次风险勘查', qty: '2 次 / 年', paid: '免费', evidence: '拜访记录 9/1', proposal: '已包含', quote: '未计入', contract: '未包含', status: '待处理', level: '重要' },
      { id: 'c2', who: '陈奕辰', when: '2026-09-01', to: '钱经理（品控）', what: '月度服务 + 24 个诱饵站', qty: '12 次 / 年', paid: '收费', evidence: '拜访记录 9/1', proposal: '已包含', quote: '已计入', contract: '已包含', status: '一致', level: '重要' },
      { id: 'c3', who: '钱经理', when: '2026-09-03', to: '陈奕辰', what: '账期 60 天', qty: '—', paid: '—', evidence: '方案沟通记录 9/3', proposal: '—', quote: '30 天', contract: '30 天', status: '待处理', level: '重要' },
      { id: 'c4', who: '陈奕辰', when: '2026-09-03', to: '孙主任', what: '生产区门缝封堵建议', qty: '—', paid: '—', evidence: '方案 v1', proposal: '已包含', quote: '无法判定', contract: '无法判定', status: '无法判定', level: '一般' },
    ] },
    contract: { oppId: 'o_ka1', template: '标准服务合同（有害生物防治）v2026.1', entity: '华信食品（上海）有限公司', status: '差异待处理', steps: ['草稿', '差异待处理', '可提交', '审批中', '已批准', '待签署', '已签署'], current: 1, requestId: 'REQ-20260907-0031',
      fields: [{ k: '合同主体', v: '华信食品（上海）有限公司', src: 'CRM' }, { k: '服务门店', v: '张江工厂', src: 'CRM' }, { k: '方案版本', v: 'v1（9/3 确认）', src: '方案域' }, { k: '报价版本', v: 'v2（审批中）', src: '报价域' }, { k: '账期', v: '30 天（与承诺 60 天不一致）', src: '差异' }] },
    service: { storeId: 's_jia', items: [
      { k: '首服交接', v: '已完成 · 2025-12-05', tone: 'ok' }, { k: '服务状态', v: '常规服务中（月度）', tone: 'ok' }, { k: '未结客诉', v: '1 项 · 9/3 复处理中', tone: 'danger' },
      { k: '合同结束日', v: '2026-11-30（84 天后，进入续约窗口）', tone: 'warn' }, { k: '回款状态', v: 'Q3 已开票，未回款', tone: 'warn' }, { k: '数据时间', v: '服务系统 9/7 08:30 · 财务系统 9/5', tone: '' },
    ] },
    pest: { samples: [
      { id: 'ps1', kind: 'pest', label: '后厨墙角 · 清晰', candidates: [{ name: '德国小蠊', conf: 0.92 }, { name: '美洲大蠊', conf: 0.06 }], basis: '体长约 1.5cm、前胸背板两条纵纹', quality: '清晰', knowledge: { habits: '喜温暖潮湿，夜间活动，常见于灶台缝隙、下水道', source: '技术部《常见有害生物图鉴》v2', harm: '污染食品、传播病原', advice: '建议补充：发现点位数量与时间；专业处置由技术人员复核' } },
      { id: 'ps2', kind: 'blur', label: '仓库 · 模糊', candidates: [], basis: '', quality: '模糊/过暗', knowledge: null, unknown: true, advice: '无法识别：请补拍（靠近、打光）或申请人工协助；不强制给出唯一答案' },
    ] },
  };

  /* ---------- 同步 / 上传 / 草稿（我的） ---------- */
  const sync = {
    uploads: [
      { id: 'up1', title: '阿婆烧腊饭堂 · 门头照片', time: '2026-09-05 16:42', status: 'failed', stage: '上传中', error: '网络中断（弱网）', retryable: true },
      { id: 'up2', title: '蓝湾咖啡 · 拜访录音（32s）', time: '2026-09-06 15:22', status: 'done', stage: '同步成功' },
    ],
    crm: [
      { id: 'cs1', title: '小巷串串 · 拜访记录', time: '2026-09-03 18:45', status: 'synced' },
      { id: 'cs2', title: '金牌烤鸭店 · 商机阶段 → 方案沟通', time: '2026-09-04 20:12', status: 'synced' },
    ],
    drafts: [{ id: 'd1', title: '蓝湾咖啡 · 拜访草稿（待确认）', visitId: 'v_lanwan_draft', time: '2026-09-06 15:20' }],
  };

  const notifications = [
    { id: 'n1', kind: 'risk', title: '服务风险：满堂红火锅 未结客诉', body: '9/3 客户反馈蟑螂复发，服务部复处理中；续约推进前先了解服务问题', storeId: 's_jia', time: '今天 08:30' },
    { id: 'n2', kind: 'confirm', title: '待确认记录：蓝湾咖啡 9/6 拜访', body: 'AI 草稿已生成，缺少计划日期', visitId: 'v_lanwan_draft', time: '昨天 15:22' },
    { id: 'n3', kind: 'sync', title: '上传失败：阿婆烧腊 门头照片', body: '弱网导致上传中断，可重试', time: '9/5 16:42' },
  ];

  /* ---------- 演示拜访（丙店）预置内容：拍照口述 → AI 草稿 ---------- */
  D.demoTranscript = '店长王女士，下周老板到店，后厨发现疑似鼠迹，希望先看每月服务方案。';
  D.demoVisit = function () {
    return {
      id: 'v_bing_new', storeId: 's_bing', oppId: 'o_bing', time: '2026-09-07 14:52', type: '约访', by: '刘晓芸',
      transcript: D.demoTranscript,
      contact: { name: '王女士', role: '店长', decision: '对接人', source: 'AI 抽取 · 口述' },
      decisionMaker: { name: '', role: '老板', status: '待核实', note: '口述提到"老板"，未提供姓名；系统不填造' },
      needs: ['希望先看每月服务方案'], objections: [],
      observations: [{ text: '后厨疑似鼠迹', tag: '销售描述的疑似鼠迹（非确认虫害）', photo: '后厨墙角' }],
      commitments: { customer: [{ text: '下周老板到店，可进一步沟通', key: true }], sales: [{ text: '先提供每月服务方案', key: true }] },
      budget: { value: '', status: '未提及（陌拜/首访不强填）' },
      result: '需求初步确认，等待决策人沟通', next: '下周老板到店时带方案沟通', planDate: '2026-09-15',
      media: [{ kind: 'storefront', label: '门头 · OCR：蜀香居川菜馆' }, { kind: 'kitchen', label: '后厨墙角 · 风险点位 1' }, { kind: 'corner', label: '仓库门缝 · 风险点位 2' }],
      ocr: { text: '蜀香居川菜馆', matched: 's_bing', candidates: [{ id: 's_bing', name: '蜀香居川菜馆', addr: '一马路 156 号', score: 0.96 }, { id: 'x', name: '蜀香居（二马路店）', addr: '二马路 210 号（其他区域）', score: 0.41 }] },
      aiMissing: ['决策人（老板）姓名与联系方式', '预算口径（首访不强填）', '现供应商情况'],
      status: 'pending_confirm',
    };
  };
  // 丙店确认后的 AI 建议（商机推进卡）
  D.demoOppSuggestion = function () {
    return { tier: 50, stage: '需求确认', confidence: '中', ruleVersion: '258 规则 v0.1-demo',
      basis: ['有效接触：店长王女士（对接人）到店沟通 · 9/7', '需求较清楚：后厨疑似鼠迹，希望先看每月服务方案', '时间有证据：下周老板到店'],
      missing: ['决策人（老板）尚未直接接触', '预算口径未提及', '现供应商情况未知'],
      next: [{ text: '下周老板到店时带方案当面沟通', date: '2026-09-15', type: '约访' }, { text: '生成餐饮单店方案草稿（含门头与风险点位照片）', type: '方案' }],
      note: '建议不改正式值；确认后阶段/分层/任务草稿一次写入。' };
  };

  /* ---------- 初始状态 ---------- */
  D.initial = function () {
    return {
      version: D.VERSION, role: 'dj', users, streets, stores, opportunities, visits, tasks, templates, proposals, faq, askTemplates, team, p1, sync, notifications,
      ui: { street: '一马路', todayMode: 'my', customerTab: '概览', teamSeg: '地推' }, // 页面级 UI 状态
      chat: [], // 工作助手会话
      settings: { notify: { task: true, risk: true, external: false }, revisitRule: { 20: 7, 50: 3, 80: 1, enabled: true, label: '演示规则：20%=7天 · 50%=3天 · 80%=1天' } },
      demo: { visitConfirmed: false, oppConfirmed: false, proposalGenerated: false },
    };
  };

  /* ---------- Tab 角标 ---------- */
  D.tabBadges = function (state) {
    const me = state.users[state.role];
    const overdue = state.tasks.filter((t) => t.ownerId === me.id && t.status === 'todo' && t.due < '2026-09-07').length;
    const pending = state.visits.filter((v) => v.status === 'pending_confirm' && v.by === me.name).length;
    return { today: overdue + pending || 0 };
  };

  /* ---------- 黄金演示路径 ---------- */
  D.GUIDE = [
    { title: '今日工作台', sub: '今日约访 · 超期回访 · 待确认记录 · 服务风险', screen: 'today', role: 'dj' },
    { title: '街道模式：一马路', sub: '甲店服务中+客诉 · 乙店两天前已访 · 丙店今日约访', screen: 'customers', role: 'dj', prepare: (s) => { s.ui = s.ui || {}; s.ui.street = '一马路'; } },
    { title: '丙店客户详情', sub: '门店 · 联系人 · 商机 · 时间线 · 承诺', screen: 'customer', params: { id: 's_bing' }, role: 'dj' },
    { title: '拍门头 + 口述拜访', sub: 'OCR 候选 · 风险点位照片 · 录音转写', screen: 'visit-capture', params: { storeId: 's_bing' }, role: 'dj', via: [{ screen: 'customer', params: { id: 's_bing' } }] },
    { title: '确认结构化事实', sub: '不填造老板姓名 · 疑似不改确定 · 承诺单独确认', screen: 'visit-confirm', params: { id: 'v_bing_new' }, role: 'dj', prepare: (s) => D.ensureDemoVisit(s), via: [{ screen: 'customer', params: { id: 's_bing' } }] },
    { title: '商机推进卡 · 258 建议', sub: 'AI 建议 20%→50% · 依据 · 缺失项 · 一次确认', screen: 'opportunity', params: { id: 'o_bing' }, role: 'dj', prepare: (s) => D.ensureDemoVisit(s, true), via: [{ screen: 'customer', params: { id: 's_bing' } }] },
    { title: '生成餐饮单店方案', sub: '审核模板 v3.2 · 照片位置 · 报价待审批 · 版本', screen: 'proposal-new', params: { oppId: 'o_bing' }, role: 'dj', prepare: (s) => D.ensureDemoVisit(s, true), via: [{ screen: 'customer', params: { id: 's_bing' } }] },
    { title: '回访任务与提醒', sub: '客户约定日期优先于规则周期 · 去重', screen: 'task', params: { id: 't_bing_next' }, role: 'dj', prepare: (s) => D.ensureDemoVisit(s, true, true), via: [{ screen: 'customer', params: { id: 's_bing' } }] },
    { title: '工作助手 · 销售问答', sub: '审核 FAQ 引用来源 · 未收录不编造 · 转技术协助', screen: 'assistant', role: 'dj' },
    { title: '主管：团队工作台', sub: '卡点 · 未跟进 · 待复核 · 下钻证据', screen: 'today', role: 'mgr', prepare: (s) => { s.ui = s.ui || {}; s.ui.todayMode = 'team'; } },
    { title: '主管：问数', sub: '固定问题 · 口径与样本量 · 金额未接入不推算', screen: 'ask', role: 'mgr' },
    { title: 'P1 预览：报价 / 承诺核对 / 合同 / 续约 / 虫害识别', sub: '包 B 能力边界演示', screen: 'p1-hub', role: 'ka' },
  ];

  /* ---------- 演示状态推进（供导览直接跳转时使用） ---------- */
  D.ensureDemoVisit = function (s, confirmed, withTask) {
    let v = s.visits.find((x) => x.id === 'v_bing_new');
    if (!v) { v = D.demoVisit(); s.visits.unshift(v); }
    if (confirmed && v.status !== 'synced') D.confirmDemoVisit(s);
    if (withTask && !s.tasks.find((t) => t.id === 't_bing_next')) D.confirmDemoOpp(s);
  };
  D.confirmDemoVisit = function (s) {
    const v = s.visits.find((x) => x.id === 'v_bing_new'); if (!v) return;
    v.status = 'synced'; v.confirmedAt = '2026-09-07 15:03';
    const st = s.stores.find((x) => x.id === 's_bing');
    if (st) {
      st.lastVisit = { date: '2026-09-07', type: '约访', result: '店长王女士：后厨疑似鼠迹，希望先看每月方案；下周老板到店', by: '刘晓芸' };
      if (!st.contacts.find((c) => c.role === '老板')) st.contacts.push({ name: '（待核实）', role: '老板', decision: '决策人', phone: '—', source: '拜访口述', verified: false });
      st.updatedAt = '2026-09-07 15:03';
    }
    const o = s.opportunities.find((x) => x.id === 'o_bing');
    if (o) { o.ai = D.demoOppSuggestion(); o.done = ['电话触达（9/2）', '约定到店时间', '到店拜访 · 店长沟通（9/7）', '现场照片 · 风险点位 2 处']; o.missing = ['决策人（老板）直接沟通', '方案反馈', '预算口径']; o.updatedAt = '2026-09-07'; }
    const t = s.tasks.find((x) => x.id === 't_bing_today'); if (t) { t.status = 'done'; t.doneAt = '2026-09-07 15:03'; t.evidence = ['拜访记录 9/7 · 已确认']; }
    s.demo.visitConfirmed = true;
  };
  D.confirmDemoOpp = function (s) {
    const o = s.opportunities.find((x) => x.id === 'o_bing'); if (!o) return;
    o.stage = '需求确认'; o.tier = 50; o.tierSource = '确认 · 9/7（依据 AI 建议）'; o.updatedAt = '2026-09-07';
    if (!s.tasks.find((t) => t.id === 't_bing_next')) {
      s.tasks.unshift({ id: 't_bing_next', storeId: 's_bing', oppId: 'o_bing', title: '老板到店时带方案当面沟通', type: '约访', ownerId: 'u_dj', ownerName: '刘晓芸', due: '2026-09-15', time: '', status: 'todo', source: '客户约定', reason: '客户约定"下周老板到店"，优先于 50% 规则周期（3 天）', evidence: ['拜访记录 9/7 · 客户承诺'], expected: '决策人确认需求与方案反馈', dedup: '同一商机同一周期已存在客户约定任务，规则型提醒不再重复生成' });
    }
    s.demo.oppConfirmed = true;
  };
})();
