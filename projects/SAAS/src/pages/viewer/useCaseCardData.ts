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

export const audienceLiveRoomCards: Card[] = [
  {
    ucId: 'UC-AUDIT-004',
    ucName: '观众端 - 内容审查效果感知',
    description: '普通观众在直播间或回放中观看内容时，当主播触发违规且运营已处置，观众端可感知到擦音/静音效果、回调丢失提示或直播结束提示。观众端不展示运营操作入口。',
    priority: 'P1',
    fnId: 'FN-AUDIT-APP-001',
    pgId: 'PG-AUDIT-APP-001',
    system: 'SAAS 平台',
    module: '内容审查',
    page: '观众端直播间（H5/APP）',
    participants: '普通观众',
    affectedData: '直播流.擦音模式, 回调丢失事件, 直播流.审查状态（只读）',
    precondition: '当前租户已开启审查；观众正在观看直播/回放。',
    basicFlow: [
      '[事件驱动] 主播发言触发 AI 违规识别。',
      '[事件驱动] 运营处置后，系统向观众端推送擦音/静音指令。',
      '[系统自动] 观众端播放器在违规时间段播放静音或擦音效果。',
      '[事件驱动] 若回调丢失，观众端显示「内容审查同步中」提示。',
      '[事件驱动] 若直播被断流，观众端显示直播结束提示。',
    ],
    altFlow: [
      '异常 A：网络抖动导致擦音指令未到达 → 显示回调丢失提示，恢复后自动补发。',
      '异常 B：直播已结束 → 展示回放入口或结束页。',
    ],
    postcondition: '观众端始终符合合规要求，观感上无敏感内容。',
    elementHelps: [
      {
        id: 'E-AUDIT-006-01',
        target: '播放器区域',
        content: '正常播放直播/回放内容。违规片段会根据 mute_mode 静音或替换为擦音。',
        relatedUC: 'UC-AUDIT-004',
        relatedBR: 'BR-AUDIT-009',
        participants: '普通观众',
        affectedData: '直播流.媒体地址（只读）',
      },
      {
        id: 'E-AUDIT-006-02',
        target: '擦音/静音效果提示',
        content: '违规片段播放时，以图标或 Toast 提示观众「当前内容已做合规处理」。',
        relatedUC: 'UC-AUDIT-004',
        relatedBR: 'BR-AUDIT-009',
        participants: '普通观众',
        affectedData: '直播流.擦音模式（只读）',
      },
      {
        id: 'E-AUDIT-006-03',
        target: '回调丢失提示',
        content: '当审查服务端回调丢失或延迟时，播放器显示轻提示，恢复后自动消失。',
        relatedUC: 'UC-AUDIT-004',
        relatedBR: 'BR-AUDIT-016',
        participants: '普通观众',
        affectedData: '回调丢失事件（只读）',
      },
      {
        id: 'E-AUDIT-006-04',
        target: '直播结束提示',
        content: '当运营对严重违规执行断流后，观众端展示直播结束页，引导离开或查看回放。',
        relatedUC: 'UC-AUDIT-004',
        relatedBR: 'BR-AUDIT-007',
        participants: '普通观众',
        affectedData: '直播流.审查状态 → 已断流（只读）',
      },
    ],
  },
];

export const audienceLiveRoomElementIds = [
  'E-AUDIT-006-01',
  'E-AUDIT-006-02',
  'E-AUDIT-006-03',
  'E-AUDIT-006-04',
];
