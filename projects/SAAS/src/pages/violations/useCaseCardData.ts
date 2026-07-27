interface ElementHelp {
  id: string;
  target: string;
  content: string;
  relatedUC: string;
  relatedBR?: string;
  participants?: string;
  affectedData?: string;
}

interface Card {
  ucId: string;
  ucName: string;
  description?: string;
  priority: string;
  fnId: string;
  pgId?: string;
  system?: string;
  module?: string;
  page?: string;
  participants?: string;
  affectedData?: string;
  precondition?: string;
  basicFlow?: string[];
  altFlow?: string[];
  postcondition?: string;
  elementHelps?: ElementHelp[];
}

export const violationsPanelCards: Card[] = [
  {
    ucId: 'UC-AUDIT-002',
    ucName: '历史违规列表查看',
    description: '从直播中控台或回放管理进入历史违规列表，查看所有已处置/待处置的违规记录，支持按级别、状态、时间筛选。该列表应为右侧 400px 侧滑抽屉，覆盖在当前页面上方。',
    priority: 'P1',
    fnId: 'FN-AUDIT-PC-002',
    pgId: 'PG-AUDIT-PC-004',
    system: 'SAAS 平台',
    module: '内容审查',
    page: '历史违规列表面板（租户后台）',
    participants: '主播/运营人员/审核员',
    affectedData: '违规记录（只读列表）, 处置日志（只读）',
    precondition: '当前租户已开启审查；存在违规记录。',
    basicFlow: [
      '[手动] 用户点击「查看历史违规记录」入口。',
      '[系统自动] 右侧滑出 400px 历史违规抽屉，加载最近 50 条记录。',
      '[手动] 用户使用筛选器组合条件检索。',
      '[手动] 用户点击记录查看详情或再次处置。',
    ],
    altFlow: [
      '异常 A：无记录 → 展示空状态。',
      '异常 B：抽屉关闭 → 返回原页面，不刷新直播中控。',
    ],
    postcondition: '用户可查看/检索历史违规，不影响当前直播操作。',
    elementHelps: [
      {
        id: 'E-AUDIT-004-01',
        target: '历史违规入口',
        content: '从直播中控台或回放管理触发，打开右侧 400px 侧滑面板。目前原型为独立页面，需改为抽屉。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-005',
        participants: '主播/运营人员',
        affectedData: '违规记录（只读列表）',
      },
      {
        id: 'E-AUDIT-004-02',
        target: '顶部告警统计区',
        content: '与直播中控实时面板一致，展示违规总数与级别分布。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-003',
        participants: '主播/运营人员',
        affectedData: '违规记录（聚合统计）',
      },
      {
        id: 'E-AUDIT-004-03',
        target: '筛选器',
        content: '支持级别、状态、时间排序过滤。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-003',
        participants: '主播/运营人员',
        affectedData: '违规记录（查询条件）',
      },
      {
        id: 'E-AUDIT-004-04',
        target: '违规列表项',
        content: '展示时间、级别、类型、摘要、处置状态。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-003',
        participants: '主播/运营人员',
        affectedData: '违规记录（只读）',
      },
      {
        id: 'E-AUDIT-004-05',
        target: '「记录」按钮',
        content: '对历史未处置记录标记为已记录。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-006',
        participants: '主播/运营人员',
        affectedData: '违规记录.处置状态 → 已记录',
      },
      {
        id: 'E-AUDIT-004-06',
        target: '「断流」按钮',
        content: '对历史 L1 记录执行断流（仅当直播仍在进行中时生效）。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-007',
        participants: '主播/运营人员',
        affectedData: '直播流.审查状态 → 已断流, 违规记录.处置状态 → 已记录',
      },
      {
        id: 'E-AUDIT-004-07',
        target: '「忽略」按钮',
        content: '对非 L1 记录标记为忽略。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-008',
        participants: '主播/运营人员',
        affectedData: '违规记录.处置状态 → 已忽略',
      },
    ],
  },
];

export const violationsPanelElementIds = [
  'E-AUDIT-004-01',
  'E-AUDIT-004-02',
  'E-AUDIT-004-03',
  'E-AUDIT-004-04',
  'E-AUDIT-004-05',
  'E-AUDIT-004-06',
  'E-AUDIT-004-07',
];
