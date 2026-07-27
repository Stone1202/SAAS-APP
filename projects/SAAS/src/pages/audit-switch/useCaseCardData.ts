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

export const auditSwitchPageCards: Card[] = [
  {
    ucId: 'UC-AUDIT-001',
    ucName: '租户内容审查开关管理',
    description: '平台运营人员在租户管理列表中，查看每个租户是否启用直播内容审查功能，并可通过开关开启/关闭该租户的内容审查能力。开关变更会触发 5 级联动：中控 Tab、直播列表入口、回放擦音任务、观众端效果、历史违规入口。',
    priority: 'P0',
    fnId: 'FN-AUDIT-PC-001',
    pgId: 'PG-AUDIT-PC-001',
    system: 'SAAS 平台',
    module: '内容审查',
    page: '租户管理列表（运营后台）',
    participants: '平台运营人员',
    affectedData: '租户.审查开关, 租户.擦音模式, 租户审查日志, 审查开关事件',
    precondition: '运营人员已登录 SAAS 平台，并进入「租户管理」页面。',
    basicFlow: [
      '[手动] 运营人员在列表中查看「是否启用」列，确认当前租户审查开关状态。',
      '[手动] 运营人员点击「操作」列中的「直播审查开关」或当前状态文字。',
      '[手动] 系统弹出二次确认弹窗，展示开关变更影响（5 级联动说明）。',
      '[手动] 运营人员点击「确认」后，[系统自动] 保存 tenant.audit_enabled 状态。',
      '[事件驱动] 系统广播 audit_switch_event，下游页面（直播中控、直播列表、回放任务、观众端、历史违规）实时联动。',
    ],
    altFlow: [
      '异常 A：二次确认弹窗中点击「取消」→ 不保存，返回列表。',
      '异常 B：保存失败 → 系统提示错误并保留原状态。',
    ],
    postcondition: 'tenant.audit_enabled 更新，所有关联页面的审查能力即时生效。',
    elementHelps: [
      {
        id: 'E-AUDIT-001-01',
        target: '「是否启用」列',
        content: '展示当前租户是否已启用直播内容审查。已启用=绿色，已停用=红色。该列直接对应 UC-AUDIT-001 的查看与触发入口。',
        relatedUC: 'UC-AUDIT-001',
        relatedBR: 'BR-AUDIT-001',
        participants: '平台运营人员',
        affectedData: '租户.审查开关（只读）',
      },
      {
        id: 'E-AUDIT-001-02',
        target: '「操作」列 / 直播审查开关',
        content: '点击后应弹出二次确认弹窗，说明 5 级联动影响；目前原型为 Switch 直接生效，需按 PRD 改为链接+弹窗。',
        relatedUC: 'UC-AUDIT-001',
        relatedBR: 'BR-AUDIT-001',
        participants: '平台运营人员',
        affectedData: '租户.审查开关（写）, 租户审查日志（写）',
      },
      {
        id: 'E-AUDIT-001-03',
        target: '二次确认弹窗',
        content: '弹窗需展示：变更租户、当前状态、目标状态、5 级联动影响清单、确认/取消按钮。',
        relatedUC: 'UC-AUDIT-001',
        relatedBR: 'BR-AUDIT-001',
        participants: '平台运营人员',
        affectedData: '租户审查日志（写）',
      },
    ],
  },
];

export const auditSwitchPageElementIds = ['E-AUDIT-001-01', 'E-AUDIT-001-02', 'E-AUDIT-001-03'];
