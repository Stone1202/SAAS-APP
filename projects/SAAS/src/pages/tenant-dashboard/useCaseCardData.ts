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

export const tenantDashboardCards: Card[] = [
  {
    ucId: 'UC-AUDIT-005',
    ucName: '直播/回放管理 - 审查入口路由',
    description: '租户运营人员在「直播管理」与「回放管理」列表中，识别已开启审查的场次，并通过「中控台」「更多-查看历史违规」「更多-查看回放」等入口进入内容审查相关页面。列表中的状态标签、操作按钮与审查开关 5 级联动。',
    priority: 'P0',
    fnId: 'FN-AUDIT-PC-004',
    pgId: 'PG-AUDIT-PC-005',
    system: 'SAAS 平台',
    module: '内容审查',
    page: '直播/回放管理列表（租户后台）',
    participants: '租户运营人员',
    affectedData: '直播流.状态, 直播流.审查开关, 回放.擦音状态, 回放.发布状态, 租户.审查开关',
    precondition: '当前租户已开启内容审查开关；用户已登录租户后台。',
    basicFlow: [
      '[手动] 用户点击「直播管理」或「回放管理」Tab 切换列表。',
      '[系统自动] 列表加载，根据 tenant.audit_enabled 与 live_stream.audit_status 显示审查相关状态标签与操作入口。',
      '[手动] 用户在直播列表点击「中控台」或「更多」进入审查流程。',
      '[手动] 用户在回放列表点击「核对并发布」进入回放审查详情。',
      '[手动] 用户在更多菜单中选择「查看历史违规」打开侧滑面板。',
    ],
    altFlow: [
      '异常 A：租户未开启审查 → 中控台入口隐藏或提示先开启。',
      '异常 B：回放擦音任务进行中 → 核对并发布按钮置灰，显示「擦音处理中…」。',
    ],
    postcondition: '用户进入正确审查页面，列表状态与审查开关保持一致。',
    elementHelps: [
      {
        id: 'E-AUDIT-005-01',
        target: '「直播管理 / 回放管理」Tab',
        content: '切换两个管理列表。直播管理展示进行中/已结束场次；回放管理展示可擦音/已发布回放。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-014',
        participants: '租户运营人员',
        affectedData: '租户.当前标签页（UI 状态）',
      },
      {
        id: 'E-AUDIT-005-02',
        target: '直播状态标签（直播中 / 已结束）',
        content: '展示场次当前直播状态。直播中场次可操作中控台；已结束场次进入回放管理。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-014',
        participants: '租户运营人员',
        affectedData: '直播流.状态（只读）',
      },
      {
        id: 'E-AUDIT-005-03',
        target: '「中控台」按钮',
        content: '直播中场次显示，点击进入直播中控台，默认聚焦「内容审查」Tab。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-002',
        participants: '租户运营人员',
        affectedData: '直播流.场次ID（路由参数）',
      },
      {
        id: 'E-AUDIT-005-04',
        target: '「更多」下拉菜单',
        content: '展开后提供「查看历史违规」「查看回放」等二级入口。菜单项需根据审查开关与场次状态动态显示。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-005',
        participants: '租户运营人员',
        affectedData: '直播流.场次ID（只读）',
      },
      {
        id: 'E-AUDIT-005-05',
        target: '擦音状态标签',
        content: '回放管理列展示：未开始/擦音中/已完成。状态决定「核对并发布」是否可用。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-011',
        participants: '租户运营人员',
        affectedData: '回放.擦音状态（只读）',
      },
      {
        id: 'E-AUDIT-005-06',
        target: '发布状态标签',
        content: '回放管理列展示：待核对/已发布/已驳回。待核对时显示操作按钮。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-004',
        participants: '租户运营人员',
        affectedData: '回放.发布状态（只读）',
      },
      {
        id: 'E-AUDIT-005-07',
        target: '「核对并发布」按钮',
        content: '擦音完成且发布状态为待核对时显示，点击进入回放详情审查页。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-004',
        participants: '审核员',
        affectedData: '回放.场次ID（路由参数）',
      },
      {
        id: 'E-AUDIT-005-08',
        target: '「更多 - 查看历史违规」菜单项',
        content: '从直播/回放管理列表直接打开右侧历史违规抽屉。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-005',
        participants: '租户运营人员',
        affectedData: '违规记录（只读列表）',
      },
      {
        id: 'E-AUDIT-005-09',
        target: '「更多 - 查看回放」菜单项',
        content: '从直播管理列表跳转回放管理或回放详情查看模式。',
        relatedUC: 'UC-AUDIT-005',
        relatedBR: 'BR-AUDIT-010',
        participants: '租户运营人员',
        affectedData: '回放.场次ID（路由参数）',
      },
    ],
  },
];

export const tenantDashboardElementIds = [
  'E-AUDIT-005-01',
  'E-AUDIT-005-02',
  'E-AUDIT-005-03',
  'E-AUDIT-005-04',
  'E-AUDIT-005-05',
  'E-AUDIT-005-06',
  'E-AUDIT-005-07',
  'E-AUDIT-005-08',
  'E-AUDIT-005-09',
];
