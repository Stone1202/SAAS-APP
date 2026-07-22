/**
 * 用例卡数据 — handoff注入（全量扫描7个页面+26个按钮）
 */
export interface UseCaseButton { id: string; name: string; action: string }
export interface UseCaseCard {
  pageId: string; pageName: string; fn: string; uc: string; title: string;
  description: string; precondition: string; flow: string[]; altFlow: string[];
  dataRange: string; postcondition: string; relatedUc: string; buttons: UseCaseButton[];
}

/** 按钮级UC数据（每个操作按钮的用例说明） */
export interface ButtonUC {
  btnId: string; ucId: string; name: string; action: string;
  precondition: string; flow: string[]; postcondition: string; altFlow: string[];
}

export const buttonUseCases: Record<string, ButtonUC> = {
  // ===== 运营后台按钮 =====
  'BTN-005': { btnId:'BTN-005', ucId:'UC-AUDIT-001', name:'审查开关', action:'开启/关闭租户内容审查', precondition:'运营已登录+腾讯云审核模板已配置', flow:['点击租户行的审查开关','弹出确认弹窗（展示推流域名+影响说明）','点击确认'], postcondition:'开关状态更新，中控室Tab显示/隐藏', altFlow:['关闭时提示"不可降级类仍强制执行"'] },
  'BTN-006': { btnId:'BTN-006', ucId:'UC-AUDIT-001', name:'进入中控', action:'跳转到租户直播中控室', precondition:'该租户内容审查已开启', flow:['点击"进入中控"按钮'], postcondition:'跳转到/tenant/control-room', altFlow:[] },

  // ===== 中控室/审查Tab按钮 =====
  'BTN-001': { btnId:'BTN-001', ucId:'UC-AUDIT-002', name:'记录', action:'记录违规事件，不打断直播', precondition:'存在待处理违规记录', flow:['点击违规行的"记录"按钮','弹出处置弹窗（展示违规依据）','选择"记录"','填写处置理由','点击确认处置'], postcondition:'违规状态变为"已记录"，直播继续', altFlow:[] },
  'BTN-002': { btnId:'BTN-002', ucId:'UC-AUDIT-002', name:'断流', action:'切断推流，终止直播', precondition:'存在待处理违规记录', flow:['点击违规行的"断流"按钮','弹出处置弹窗','选择"断流"','填写处置理由','点击"确认断流"','二次确认弹窗"确定要切断推流吗？"','点击"确定断流"'], postcondition:'推流切断，直播终止，违规状态变为"已断流"', altFlow:['断流不可撤回','断流失败→提示错误+记录日志'] },
  'BTN-003': { btnId:'BTN-003', ucId:'UC-AUDIT-002', name:'忽略', action:'标记为非违规', precondition:'存在待处理违规记录', flow:['点击违规行的"忽略"按钮','弹出处置弹窗','选择"忽略"','填写忽略理由','点击确认'], postcondition:'违规状态变为"已忽略"', altFlow:[] },
  'BTN-004': { btnId:'BTN-004', ucId:'UC-AUDIT-002', name:'擦音模式切换', action:'切换静音/擦音模式', precondition:'场次直播中+内容审查已开启', flow:['在场次信息栏点击"静音"或"擦音"按钮','模式保存到localStorage','观众APP下次擦音生效'], postcondition:'擦音模式更新，影响观众APP效果', altFlow:['静音模式：音频直接静音（无声音）','擦音模式：敏感词用嘀声替换'] },
  'BTN-007': { btnId:'BTN-007', ucId:'UC-AUDIT-002', name:'查看详情', action:'打开违规详情弹窗', precondition:'存在违规记录', flow:['点击违规行的"查看详情"或点击行','弹出详情弹窗','展示完整违规信息+证据+处置记录'], postcondition:'查看违规详情', altFlow:[] },
  'BTN-008': { btnId:'BTN-008', ucId:'UC-AUDIT-002', name:'查看回调JSON', action:'展开/折叠腾讯云回调原始数据', precondition:'已打开处置弹窗或详情弹窗', flow:['点击"查看回调原始数据"链接','展开JSON文本','再次点击折叠'], postcondition:'查看回调原始数据', altFlow:[] },
  'BTN-010': { btnId:'BTN-010', ucId:'UC-AUDIT-002', name:'刷新', action:'重新加载违规列表', precondition:'已进入内容审查Tab', flow:['点击刷新按钮','重新从store获取违规列表'], postcondition:'违规列表更新', altFlow:[] },

  // ===== 敏感词库管理按钮 =====
  'BTN-011': { btnId:'BTN-011', ucId:'UC-AUDIT-006', name:'新增', action:'新增敏感词', precondition:'V2已部署+已进入敏感词库管理', flow:['点击"新增"按钮','弹出新增弹窗','填写关键词/分类/级别/匹配方式/可降级','点击确认'], postcondition:'敏感词新增成功，列表更新', altFlow:['不可降级类自动设为不可降级'] },
  'BTN-012': { btnId:'BTN-012', ucId:'UC-AUDIT-006', name:'编辑', action:'编辑敏感词', precondition:'存在敏感词记录', flow:['点击敏感词行的"编辑"按钮','弹出编辑弹窗','修改信息','点击确认'], postcondition:'敏感词更新成功', altFlow:['不可降级类的分类不可修改'] },
  'BTN-013': { btnId:'BTN-013', ucId:'UC-AUDIT-006', name:'禁用', action:'停用敏感词', precondition:'存在启用的敏感词', flow:['点击敏感词行的"禁用"按钮','确认禁用'], postcondition:'敏感词状态变为"禁用"', altFlow:[] },
  'BTN-014': { btnId:'BTN-014', ucId:'UC-AUDIT-006', name:'手动同步', action:'强制同步词库到腾讯云', precondition:'词库有变更', flow:['点击"手动同步"按钮','调用腾讯云API更新敏感词库','等待同步完成'], postcondition:'词库同步到腾讯云，同步状态更新', altFlow:['同步失败→重试3次→通知运营'] },
  'BTN-015': { btnId:'BTN-015', ucId:'UC-AUDIT-006', name:'查询', action:'按分类/关键词筛选敏感词', precondition:'已进入敏感词库管理', flow:['选择分类或输入关键词','点击查询或自动筛选'], postcondition:'列表按条件筛选', altFlow:[] },

  // ===== 违规记录管理按钮 =====
  'BTN-016': { btnId:'BTN-016', ucId:'UC-AUDIT-003', name:'查询', action:'按条件筛选违规记录', precondition:'已进入违规记录管理', flow:['设置查询条件（时间范围/违规类型/处置状态）','点击"查询"按钮'], postcondition:'列表按条件筛选', altFlow:[] },
  'BTN-017': { btnId:'BTN-017', ucId:'UC-AUDIT-003', name:'重置', action:'清空查询条件', precondition:'已设置查询条件', flow:['点击"重置"按钮'], postcondition:'查询条件清空，列表恢复全量', altFlow:[] },
  'BTN-018': { btnId:'BTN-018', ucId:'UC-AUDIT-003', name:'详情', action:'打开违规详情弹窗', precondition:'存在违规记录', flow:['点击违规行的"详情"按钮','弹出详情弹窗','展示完整违规信息+证据链接+处置记录列表'], postcondition:'查看违规详情', altFlow:[] },

  // ===== 统计看板按钮 =====
  'BTN-019': { btnId:'BTN-019', ucId:'UC-AUDIT-009', name:'时间范围', action:'选择统计时间范围', precondition:'已进入统计看板', flow:['点击时间范围下拉','选择最近7天/30天/全部'], postcondition:'统计数据按时间范围更新', altFlow:[] },
  'BTN-020': { btnId:'BTN-020', ucId:'UC-AUDIT-009', name:'租户筛选', action:'按租户筛选统计数据', precondition:'已进入统计看板', flow:['点击租户下拉','选择特定租户或全部'], postcondition:'统计数据按租户筛选', altFlow:[] },
  'BTN-021': { btnId:'BTN-021', ucId:'UC-AUDIT-009', name:'下钻', action:'点击指标卡/图表查看详情', precondition:'已进入统计看板+有数据', flow:['点击指标卡或图表区域','跳转到违规记录管理（带筛选条件）'], postcondition:'查看下钻详情', altFlow:[] },

  // ===== 观众APP按钮 =====
  'BTN-009': { btnId:'BTN-009', ucId:'UC-AUDIT-005', name:'切换擦音模式', action:'在信息面板切换静音/擦音', precondition:'已进入观众APP直播间', flow:['点击右侧信息面板的"切换模式"按钮','模式在静音/擦音间切换','保存到localStorage'], postcondition:'下次擦音按新模式执行', altFlow:['与中控室通过localStorage同步'] },
}

export const useCaseCards: Record<string, UseCaseCard> = {
  '/admin/tenants': {
    pageId: 'PG-AUDIT-PC-001', pageName: '运营后台-租户审查开关', fn: 'FN-AUDIT-PC-001', uc: 'UC-AUDIT-001',
    title: '租户内容审查开关管理',
    description: '运营为租户开启/关闭内容审查。审核模板/擦音/敏感词由腾讯云配置台配置，系统只做开关管理。',
    precondition: '平台运营已登录 + 腾讯云审核模板已配置',
    flow: ['[手动]进入租户审查开关页','[系统自动]展示租户列表','[手动]点击开关→弹出确认弹窗','[手动]确认→开关状态更新→中控室Tab显示/隐藏','[手动]可点击"进入中控"跳转'],
    altFlow: ['关闭审查时提示"不可降级类仍强制执行"'],
    dataRange: 'R:租户列表 W:审查开关状态', postcondition: '租户审查开关生效', relatedUc: 'UC-AUDIT-002',
    buttons: [{id:'BTN-005',name:'审查开关',action:'开启/关闭内容审查'},{id:'BTN-006',name:'进入中控',action:'跳转租户中控室'}],
  },
  '/audit/review-center': {
    pageId: 'PG-AUDIT-PC-003', pageName: '中控室-内容审查Tab', fn: 'FN-AUDIT-PC-002+003', uc: 'UC-AUDIT-002',
    title: '中控室内容审查Tab — 实时违规告警+处置',
    description: '实时接收腾讯云违规回调全量存储+展示。处置（记录/断流/忽略）+依据完整。30秒超时自动记录。',
    precondition: '场次"直播中" + 内容审查已开启 + 存在违规记录',
    flow: ['[系统自动]加载内容审查Tab','[系统自动]提示区展示告警(红/黄/蓝)+违规数+审查状态','[系统自动]违规列表(时间/类型/级别/敏感词/置信度/建议/擦音/状态/操作)','[手动]点击违规行查看详情','[手动]处置:记录/断流(二次确认)/忽略','[系统自动]更新状态+记录日志','[手动]可刷新列表'],
    altFlow: ['30秒未处置→自动记录+告警升级','断流需二次确认'],
    dataRange: 'R:违规记录 W:处置记录', postcondition: '违规处置完成', relatedUc: 'UC-AUDIT-001,005',
    buttons: [{id:'BTN-001',name:'记录',action:'记录违规不打断直播'},{id:'BTN-002',name:'断流',action:'切断推流(二次确认)'},{id:'BTN-003',name:'忽略',action:'标记非违规'},{id:'BTN-007',name:'查看详情',action:'违规详情弹窗'},{id:'BTN-010',name:'刷新',action:'重新加载列表'}],
  },
  '/audit/keywords': {
    pageId: 'PG-AUDIT-PC-004', pageName: '敏感词库管理', fn: 'FN-AUDIT-PC-006', uc: 'UC-AUDIT-006',
    title: '敏感词库管理 — 平台不可降级6类+租户扩展',
    description: '管理6类不可降级词库+平台基础词库+租户扩展词库。词库变更同步到腾讯云。V2功能。',
    precondition: 'V2风控引擎已部署 + 腾讯云API已对接',
    flow: ['[手动]进入敏感词库管理','[系统自动]展示平台不可降级词库Tab(6类)','[手动]按分类筛选/关键词搜索','[手动]点击新增→弹窗(关键词/分类/级别/匹配方式/可降级)','[手动]确认新增','[手动]可编辑/禁用敏感词','[手动]切换租户扩展词库Tab','[系统自动]底部展示腾讯云同步状态','[手动]可手动同步'],
    altFlow: ['减少不可降级类→禁止','同步失败→重试3次'],
    dataRange: 'R:平台词库 W:租户词库+腾讯云配置', postcondition: '生效词库同步腾讯云', relatedUc: 'UC-AUDIT-007',
    buttons: [{id:'BTN-011',name:'新增',action:'新增敏感词弹窗'},{id:'BTN-012',name:'编辑',action:'编辑敏感词'},{id:'BTN-013',name:'禁用',action:'停用敏感词'},{id:'BTN-014',name:'手动同步',action:'同步到腾讯云'},{id:'BTN-015',name:'查询',action:'按分类/关键词筛选'}],
  },
  '/audit/violations': {
    pageId: 'PG-AUDIT-PC-005', pageName: '违规记录管理', fn: 'FN-AUDIT-PC-010', uc: 'UC-AUDIT-003',
    title: '违规记录管理 — 多条件查询+详情+处置记录',
    description: '查看违规记录，支持按时间/类型/状态筛选，查看详情(完整数据+证据+处置记录)。V2功能。',
    precondition: '违规记录已存在 + V2已部署',
    flow: ['[手动]进入违规记录管理','[手动]设置查询条件(时间/类型/状态)','[手动]点击查询','[系统自动]展示违规列表(时间/推流ID/类型/级别/敏感词/置信度/擦音/状态)','[手动]点击详情→弹窗(完整信息+证据+处置记录)','[手动]可重置查询条件'],
    altFlow: ['无数据显示空状态'],
    dataRange: 'R:违规记录+处置记录', postcondition: '违规记录可追溯', relatedUc: 'UC-AUDIT-002',
    buttons: [{id:'BTN-016',name:'查询',action:'按条件筛选'},{id:'BTN-017',name:'重置',action:'清空查询条件'},{id:'BTN-018',name:'详情',action:'违规详情弹窗'}],
  },
  '/audit/statistics': {
    pageId: 'PG-AUDIT-PC-006', pageName: '违规统计看板', fn: 'FN-AUDIT-PC-011', uc: 'UC-AUDIT-009',
    title: '违规统计看板 — 4指标卡+TOP风险+处置分布+级别分布',
    description: '实时展示:违规总数/已处置/擦音覆盖率/待处理+TOP风险类型+处置分布+级别分布。V3功能。',
    precondition: 'V3已部署 + 违规数据已积累',
    flow: ['[系统自动]看板加载实时数据','[系统自动]4指标卡(违规总数/已处置/擦音覆盖率/待处理)','[系统自动]TOP风险类型条形图','[系统自动]处置分布统计(记录/断流/忽略/超时)','[系统自动]违规级别分布(L1/L2/L3/L4)','[手动]选择时间范围(7天/30天/全部)','[手动]按租户/主播筛选','[手动]点击指标卡下钻'],
    altFlow: ['无数据显示空状态'],
    dataRange: 'R:违规记录+处置记录(聚合)', postcondition: '运营掌握违规趋势', relatedUc: 'UC-AUDIT-002',
    buttons: [{id:'BTN-019',name:'时间范围',action:'7天/30天/全部'},{id:'BTN-020',name:'租户筛选',action:'按租户筛选'},{id:'BTN-021',name:'下钻',action:'查看详情'}],
  },
  '/tenant/control-room': {
    pageId: 'PG-AUDIT-PC-002', pageName: '租户后台-直播中控室', fn: 'FN-AUDIT-PC-003', uc: 'UC-AUDIT-002',
    title: '租户直播中控室 — 商品/营销/聊天/内容审查Tab',
    description: '直播中控室含4Tab(商品/营销/聊天/内容审查)。内容审查Tab展示实时违规告警+处置+擦音模式切换(静音/擦音)。',
    precondition: '场次"直播中" + 内容审查已开启 + 存在违规记录',
    flow: ['[系统自动]加载中控室,默认激活内容审查Tab','[系统自动]提示区展示告警+违规数+审查状态','[系统自动]违规列表(9列)','[手动]点击违规行查看详情','[手动]处置:记录/断流(二次确认)/忽略','[系统自动]更新状态+记录日志','[手动]切换擦音模式(静音/擦音)→影响观众APP','[手动]可切换商品/营销/聊天Tab'],
    altFlow: ['30秒未处置→自动记录','静音:音频直接静音','擦音:敏感词用嘀声替换','全部禁言(应急管控)'],
    dataRange: 'R:违规记录 W:处置记录', postcondition: '违规处置完成+擦音模式生效', relatedUc: 'UC-AUDIT-001,005',
    buttons: [{id:'BTN-001',name:'记录',action:'记录违规不打断直播'},{id:'BTN-002',name:'断流',action:'切断推流(二次确认)'},{id:'BTN-003',name:'忽略',action:'标记非违规'},{id:'BTN-004',name:'擦音模式切换',action:'静音/擦音'},{id:'BTN-007',name:'查看详情',action:'违规详情弹窗'},{id:'BTN-008',name:'回调JSON',action:'展开原始JSON'}],
  },
  '/app/live': {
    pageId: 'PG-AUDIT-APP-001', pageName: '观众APP-直播间', fn: 'FN-AUDIT-APP-001', uc: 'UC-AUDIT-005',
    title: '观众直播间内容审查感知',
    description: '观众感知擦音效果(静音/擦音)+弹幕过滤+违规断流。30%概率模拟中控无数据。擦音模式由中控室配置。',
    precondition: '观众已进入直播间 + 主播直播中 + 内容审查已开启',
    flow: ['[系统自动]展示直播画面+弹幕+操作栏','[事件驱动]腾讯云检测违规并擦音','[系统自动]感知效果:静音(🔇+进度条)/擦音(🎧+嘀声)','[系统自动]弹幕展示违规过滤标记','[事件驱动]30%概率"中控未收到回调"提示','[事件驱动]断流时显示"直播已结束"'],
    altFlow: ['擦音模式由中控室配置通过localStorage同步','中控无数据时橙色警告'],
    dataRange: 'R:擦音模式(localStorage) W:无', postcondition: '观众感知擦音+弹幕过滤+断流提示', relatedUc: 'UC-AUDIT-002',
    buttons: [{id:'BTN-009',name:'切换擦音模式',action:'信息面板切换静音/擦音'}],
  },
}
