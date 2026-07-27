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

export const replayAuditCards: Card[] = [
  {
    ucId: 'UC-AUDIT-003',
    ucName: '回放擦音效果模拟 + 人工核对发布',
    description: '直播结束后，系统对回放进行 AI 擦音处理。运营人员在回放详情页查看擦音前后对比、进度条标记、人工核对发布状态，并执行「核对通过·发布回放」或「驳回重新擦音」。仅当任务完成且发布状态为待核对时才可操作。',
    priority: 'P0',
    fnId: 'FN-AUDIT-PC-003',
    pgId: 'PG-AUDIT-PC-003',
    system: 'SAAS 平台',
    module: '内容审查',
    page: '回放详情审查页（租户后台）',
    participants: '运营人员/审核员',
    affectedData: '回放.擦音任务状态, 回放.发布状态, 回放.擦音片段, 违规记录, 回放.审查日志',
    precondition: '直播已结束；回放擦音任务已创建；当前租户已开启审查。',
    basicFlow: [
      '[系统自动] 回放详情页加载时，系统启动擦音任务并展示进度。',
      '[事件驱动] 擦音任务完成后，进度条标记违规时间点，发布状态变为「待核对」。',
      '[手动] 审核员查看擦音前后对比、违规列表、时间轴标记。',
      '[手动] 审核员选择「核对通过·发布回放」或「驳回重新擦音」。',
      '[系统自动] 若通过 → publish_status 更新为 published，观众端可见；若驳回 → 重新触发擦音任务。',
    ],
    altFlow: [
      '异常 A：擦音任务失败 → 提示「擦音处理中，完成后可进行人工核对」。',
      '异常 B：任务进行中点击发布按钮 → 按钮置灰，提示等待完成。',
      '异常 C：发布审核不通过 → 生成重新擦音任务，publish_status 回退到 pending_mute。',
    ],
    postcondition: '回放发布状态为 published 或 rejected/待重新擦音，历史记录可查询。',
    elementHelps: [
      {
        id: 'E-AUDIT-003-01',
        target: '回放播放器',
        content: '展示已擦音回放的视频/音频内容。播放器下方有时间轴与违规标记。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-010',
        participants: '审核员',
        affectedData: '回放.媒体地址（只读）',
      },
      {
        id: 'E-AUDIT-003-02',
        target: '擦音任务进度条',
        content: '展示擦音任务完成进度（已完成/总数）。任务完成前发布操作区置灰。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-011',
        participants: '审核员',
        affectedData: '回放.擦音任务状态（只读）',
      },
      {
        id: 'E-AUDIT-003-03',
        target: '时间轴违规标记',
        content: '在时间轴上以颜色（L1红/L2橙/L3黄/L4蓝）标记违规发生位置，点击可定位到对应违规详情。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-012',
        participants: '审核员',
        affectedData: '违规记录.违规时间（只读）',
      },
      {
        id: 'E-AUDIT-003-04',
        target: '违规记录列表',
        content: '列出当前回放的所有 AI 识别违规，支持点击查看详情面板。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-012',
        participants: '审核员',
        affectedData: '违规记录（只读）',
      },
      {
        id: 'E-AUDIT-003-05',
        target: '擦音模式选择',
        content: '切换该回放使用的擦音模式（静音/滴滴声）。影响观众端播放效果。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-009',
        participants: '审核员',
        affectedData: '回放.擦音模式（写）',
      },
      {
        id: 'E-AUDIT-003-06',
        target: '「重新擦音」按钮',
        content: '发布状态为「已驳回」时显示，点击后重新触发擦音任务。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-015',
        participants: '审核员',
        affectedData: '回放.擦音任务状态 → 处理中, 回放.发布状态 → 待擦音',
      },
      {
        id: 'E-AUDIT-003-07',
        target: '「核对通过·发布回放」按钮',
        content: '擦音任务完成且发布状态为「待核对」时显示。点击后发布回放，观众端可见。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-004',
        participants: '审核员',
        affectedData: '回放.发布状态 → 已发布, 回放.审查日志',
      },
      {
        id: 'E-AUDIT-003-08',
        target: '「驳回重新擦音」按钮',
        content: '擦音任务完成且发布状态为「待核对」时显示。点击后标记驳回，回到重新擦音流程。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-015',
        participants: '审核员',
        affectedData: '回放.发布状态 → 已驳回, 回放.审查日志',
      },
      {
        id: 'E-AUDIT-003-09',
        target: '发布状态标签',
        content: '展示当前回放发布状态：待核对/已核对/已发布/已驳回。状态标签样式与颜色需区分。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-004',
        participants: '审核员',
        affectedData: '回放.发布状态（只读）',
      },
      {
        id: 'E-AUDIT-003-10',
        target: '擦音前后对比面板',
        content: '并排展示擦音前与擦音后的文本/音频片段，帮助审核员判断擦音效果。',
        relatedUC: 'UC-AUDIT-003',
        relatedBR: 'BR-AUDIT-013',
        participants: '审核员',
        affectedData: '回放.擦音片段（只读）',
      },
    ],
  },
];

export const replayAuditElementIds = [
  'E-AUDIT-003-01',
  'E-AUDIT-003-02',
  'E-AUDIT-003-03',
  'E-AUDIT-003-04',
  'E-AUDIT-003-05',
  'E-AUDIT-003-06',
  'E-AUDIT-003-07',
  'E-AUDIT-003-08',
  'E-AUDIT-003-09',
  'E-AUDIT-003-10',
];
