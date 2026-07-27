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

export const liveControlAuditCards: Card[] = [
  {
    ucId: 'UC-AUDIT-002',
    ucName: '直播中控内容审查 Tab + 违规处置',
    description: '主播或运营进入直播中控台，切换到「内容审查」Tab，查看实时告警统计、违规列表，并对 AI 识别的违规进行记录、断流或忽略处置。处置结果会写入 violation_record，严重违规（L1）不可忽略。',
    priority: 'P0',
    fnId: 'FN-AUDIT-PC-002',
    pgId: 'PG-AUDIT-PC-002',
    system: 'SAAS 平台',
    module: '内容审查',
    page: '直播中控内容审查 Tab（租户后台）',
    participants: '主播/运营人员',
    affectedData: '违规记录, 直播流.审查状态, 回调丢失事件, 处置日志',
    precondition: '当前租户已开启内容审查开关；直播正在进行中；用户已登录直播中控。',
    basicFlow: [
      '[手动] 用户进入直播中控台，点击右侧「内容审查」Tab。',
      '[事件驱动] 系统接收 AI 审查回调，刷新告警统计区与违规列表。',
      '[手动] 用户在筛选器中组合条件（级别/状态/排序）查看目标违规。',
      '[手动] 用户点击某条违规记录，查看详情面板。',
      '[手动] 用户根据违规级别选择「记录」「断流」「忽略」操作。',
      '[系统自动] 系统写入 disposal_log，更新 live_stream.audit_status，必要时触发断流。',
    ],
    altFlow: [
      '异常 A：回调丢失 → 顶部显示「回调丢失」提示，可手动刷新。',
      '异常 B：L1 严重违规点击「忽略」→ 按钮置灰，提示「L1 不可忽略」。',
      '异常 C：网络断开 → 列表显示骨架屏，重连后自动刷新。',
    ],
    postcondition: '违规处置完成，历史违规列表可查询，直播状态按需更新。',
    elementHelps: [
      {
        id: 'E-AUDIT-002-01',
        target: '「内容审查」Tab',
        content: '直播中控台右侧 Tab，切换后展示实时审查面板。目前原型标签为「审查」，需改为「内容审查」。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-002',
        participants: '主播/运营人员',
        affectedData: '直播流.审查状态（只读）',
      },
      {
        id: 'E-AUDIT-002-02',
        target: '顶部告警统计区',
        content: '展示当前违规总数、待处理数、已记录数、已忽略数、严重违规数，以及红/黄/蓝级别分布。帮助用户快速感知风险。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-003',
        participants: '主播/运营人员',
        affectedData: '违规记录（聚合统计）',
      },
      {
        id: 'E-AUDIT-002-03',
        target: '「查看历史违规记录」按钮',
        content: '点击后应从右侧滑出 400px 历史违规列表面板（drawer），而非跳转独立页面。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-005',
        participants: '主播/运营人员',
        affectedData: '违规记录（只读列表）',
      },
      {
        id: 'E-AUDIT-002-04',
        target: '违规列表筛选器',
        content: '支持按违规级别（全部/L1/L2/L3/L4）、处置状态（全部/待处理/已记录/已忽略）、时间排序进行过滤。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-003',
        participants: '主播/运营人员',
        affectedData: '违规记录（查询条件）',
      },
      {
        id: 'E-AUDIT-002-05',
        target: '违规列表项',
        content: '每条记录展示时间、级别、类型、摘要；点击后打开右侧详情面板，可进行处置。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-003',
        participants: '主播/运营人员',
        affectedData: '违规记录（只读）',
      },
      {
        id: 'E-AUDIT-002-06-01',
        target: '「记录」按钮',
        content: '将当前违规标记为已记录，不触发断流，常用于 L2/L3/L4 违规备案。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-006',
        participants: '主播/运营人员',
        affectedData: '违规记录.处置状态 → 已记录, 处置日志',
      },
      {
        id: 'E-AUDIT-002-06-02',
        target: '「断流」按钮',
        content: '对严重违规（L1）执行立即断流，终止直播并记录处置日志。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-007',
        participants: '主播/运营人员',
        affectedData: '直播流.审查状态 → 已断流, 违规记录.处置状态 → 已记录, 处置日志',
      },
      {
        id: 'E-AUDIT-002-06-03',
        target: '「忽略」按钮',
        content: '将非严重违规标记为忽略。L1 严重违规不可忽略，按钮置灰并提示原因。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-008',
        participants: '主播/运营人员',
        affectedData: '违规记录.处置状态 → 已忽略, 处置日志',
      },
      {
        id: 'E-AUDIT-002-07',
        target: '擦音模式切换',
        content: '在观众端对违规音频进行静音或擦音（滴滴声）处理。仅对开启审查的租户生效。',
        relatedUC: 'UC-AUDIT-002',
        relatedBR: 'BR-AUDIT-009',
        participants: '主播/运营人员',
        affectedData: '直播流.擦音模式（写）',
      },
    ],
  },
];

export const liveControlAuditElementIds = [
  'E-AUDIT-002-01',
  'E-AUDIT-002-02',
  'E-AUDIT-002-03',
  'E-AUDIT-002-04',
  'E-AUDIT-002-05',
  'E-AUDIT-002-06-01',
  'E-AUDIT-002-06-02',
  'E-AUDIT-002-06-03',
  'E-AUDIT-002-07',
];
