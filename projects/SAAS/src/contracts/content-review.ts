/**
 * 内容审查域 契约定义 — Zod Schema 活合约
 * 
 * 模块：内容审查域（D16）
 * 版本：V1.0.0
 * 日期：2026-07-22
 * 
 * 关联ENT：ENT-AUDIT-001~006
 * 关联API：API-AUDIT-001~015
 * 
 * 五维可插拔架构：sim/real双环境共享此契约
 */

import { z } from 'zod'

// ============================================
// 枚举定义
// ============================================

/** 审查类型 */
export const AuditTypeEnum = z.enum(['audio', 'video', 'screenshot'])
export type AuditType = z.infer<typeof AuditTypeEnum>

/** 违规类型 */
export const ViolationTypeEnum = z.enum([
  'pornography',      // 涉黄
  'violence',         // 涉暴
  'public_safety',    // 公共安全
  'social_safety',    // 社会安全
  'illegal',          // 违法乱纪
  'advertising_law',  // 广告法
  'prohibited_word',  // 违禁词
  'custom',           // 自定义
])
export type ViolationType = z.infer<typeof ViolationTypeEnum>

/** 违规级别 */
export const ViolationLevelEnum = z.enum(['L1', 'L2', 'L3', 'L4'])
export type ViolationLevel = z.infer<typeof ViolationLevelEnum>

/** 处置建议（腾讯云返回） */
export const SuggestionEnum = z.enum(['pass', 'review', 'block'])
export type Suggestion = z.infer<typeof SuggestionEnum>

/** 处置类型 */
export const DisposalTypeEnum = z.enum([
  'record',       // 记录（不打断直播）
  'stop_stream',  // 断流（切断推流）
  'ignore',       // 忽略（标记非违规）
  'auto_record',  // 系统自动记录（超时）
])
export type DisposalType = z.infer<typeof DisposalTypeEnum>

/** 处置状态 */
export const DisposalStatusEnum = z.enum([
  'pending',       // 待处理
  'recorded',      // 已记录
  'stream_stopped',// 已断流
  'ignored',       // 已忽略
  'timeout',       // 已超时（自动记录）
])
export type DisposalStatus = z.infer<typeof DisposalStatusEnum>

/** 敏感词分类 */
export const KeywordCategoryEnum = z.enum([
  'pornography',      // 涉黄
  'violence',         // 涉暴
  'public_safety',    // 公共安全
  'social_safety',    // 社会安全
  'illegal',          // 违法乱纪
  'advertising_law',  // 广告法
  'custom',           // 自定义
])
export type KeywordCategory = z.infer<typeof KeywordCategoryEnum>

/** 敏感词匹配方式 */
export const MatchTypeEnum = z.enum([
  'exact',    // 精准匹配
  'fuzzy',    // 模糊匹配
  'semantic', // 语义匹配
  'variant',  // 变体词
])
export type MatchType = z.infer<typeof MatchTypeEnum>

/** 敏感词级别 */
export const KeywordLevelEnum = z.enum(['L1', 'L2', 'L3', 'L4'])
export type KeywordLevel = z.infer<typeof KeywordLevelEnum>

/** 词库范围 */
export const KeywordScopeEnum = z.enum(['platform', 'tenant'])
export type KeywordScope = z.infer<typeof KeywordScopeEnum>

/** 降级申请类型 */
export const RequestTypeEnum = z.enum(['downgrade', 'upgrade'])
export type RequestType = z.infer<typeof RequestTypeEnum>

/** 降级申请状态 */
export const RequestStatusEnum = z.enum(['pending', 'approved', 'rejected'])
export type RequestStatus = z.infer<typeof RequestStatusEnum>

/** 审查任务状态 */
export const TaskStatusEnum = z.enum([
  'pending',     // 待执行
  'processing',  // 执行中
  'completed',   // 已完成
  'error',       // 异常
])
export type TaskStatus = z.infer<typeof TaskStatusEnum>

/** 审查类型（实时/回放） */
export const ReviewTypeEnum = z.enum(['realtime', 'replay'])
export type ReviewType = z.infer<typeof ReviewTypeEnum>

// ============================================
// 腾讯云回调契约（API-AUDIT-001 直播审核回调）
// ============================================

/** 腾讯云直播审核回调（全量接收） */
export const TencentReviewCallbackSchema = z.object({
  // 基础信息
  stream_id: z.string().describe('推流ID（关联场次）'),
  domain: z.string().describe('推流域名'),
  app: z.string().describe('应用名'),
  timestamp: z.number().describe('回调时间戳（Unix毫秒）'),

  // 违规信息
  audit_type: AuditTypeEnum.describe('审核类型（音频/视频/截图）'),
  violation_type: ViolationTypeEnum.describe('违规类型'),
  violation_level: ViolationLevelEnum.describe('违规级别'),
  violation_content: z.string().url().describe('违规内容片段URL（音频片段/截图）'),
  violation_time: z.number().describe('违规发生时间（推流中的时间点，毫秒）'),

  // 处置建议
  suggestion: SuggestionEnum.describe('腾讯云处置建议'),
  confidence: z.number().min(0).max(100).describe('置信度（0-100）'),
  keyword: z.string().optional().describe('命中的敏感词'),
  keyword_category: KeywordCategoryEnum.optional().describe('敏感词分类'),

  // 处置依据
  evidence_url: z.string().url().describe('证据文件URL'),

  // 擦音信息
  audio_muted: z.boolean().describe('是否已擦音'),
  mute_duration: z.number().optional().describe('擦音时长（秒）'),
  mute_start_time: z.number().optional().describe('擦音起始时间点（毫秒）'),
})
export type TencentReviewCallback = z.infer<typeof TencentReviewCallbackSchema>

/** AMS擦音回调（API-AUDIT-002） */
export const AMSMuteCallbackSchema = z.object({
  task_id: z.string().describe('擦音任务ID'),
  replay_file_url: z.string().url().describe('原始回放文件URL'),
  muted_file_url: z.string().url().describe('擦音后回放文件URL'),
  mute_count: z.number().describe('擦音次数'),
  mute_segments: z.array(z.object({
    start_time: z.number().describe('擦音起始时间（毫秒）'),
    duration: z.number().describe('擦音时长（秒）'),
    keyword: z.string().describe('命中的敏感词'),
  })).describe('擦音片段列表'),
  status: z.enum(['success', 'failed', 'partial']).describe('擦音状态'),
  error_message: z.string().optional().describe('错误信息'),
})
export type AMSMuteCallback = z.infer<typeof AMSMuteCallbackSchema>

// ============================================
// 业务实体契约
// ============================================

/** ENT-AUDIT-001 内容审查任务 */
export const ContentReviewTaskSchema = z.object({
  task_id: z.string().describe('任务ID'),
  session_id: z.string().describe('关联场次ID'),
  stream_id: z.string().describe('推流ID'),
  review_type: ReviewTypeEnum.describe('实时/回放'),
  status: TaskStatusEnum.describe('任务状态'),
  created_at: z.string().datetime().describe('创建时间'),
  completed_at: z.string().datetime().optional().describe('完成时间'),
  // 回放擦音特有字段
  replay_file_url: z.string().url().optional().describe('回放文件URL'),
  muted_file_url: z.string().url().optional().describe('擦音后回放文件URL'),
})
export type ContentReviewTask = z.infer<typeof ContentReviewTaskSchema>

/** ENT-AUDIT-002 违规记录 */
export const ReviewViolationSchema = z.object({
  violation_id: z.string().describe('违规ID'),
  task_id: z.string().describe('关联审查任务'),
  stream_id: z.string().describe('推流ID'),

  // 违规信息
  audit_type: AuditTypeEnum,
  violation_type: ViolationTypeEnum,
  violation_level: ViolationLevelEnum,
  violation_content: z.string().url().describe('违规内容片段URL'),
  violation_time: z.string().datetime().describe('违规发生时间'),

  // 处置建议
  suggestion: SuggestionEnum,
  confidence: z.number().min(0).max(100),
  keyword: z.string().optional(),
  keyword_category: KeywordCategoryEnum.optional(),

  // 证据
  evidence_url: z.string().url().describe('证据文件URL'),
  raw_callback: z.string().describe('腾讯云回调原始JSON（全量保存）'),

  // 擦音信息
  audio_muted: z.boolean(),
  mute_duration: z.number().optional(),
  mute_start_time: z.string().datetime().optional(),

  // 处置状态
  disposal_status: DisposalStatusEnum.default('pending'),
  created_at: z.string().datetime().describe('记录时间'),
})
export type ReviewViolation = z.infer<typeof ReviewViolationSchema>

/** ENT-AUDIT-003 处置记录 */
export const ReviewDisposalSchema = z.object({
  disposal_id: z.string().describe('处置ID'),
  violation_id: z.string().describe('关联违规ID'),
  disposal_type: DisposalTypeEnum.describe('处置方式'),
  disposal_reason: z.string().describe('处置理由'),
  operator: z.string().describe('处置人'),
  operated_at: z.string().datetime().describe('处置时间'),
  disposal_result: z.string().describe('处置结果'),
})
export type ReviewDisposal = z.infer<typeof ReviewDisposalSchema>

/** ENT-AUDIT-004 敏感词库 */
export const KeywordLibrarySchema = z.object({
  keyword_id: z.string().describe('敏感词ID'),
  keyword: z.string().min(1).describe('敏感词内容'),
  category: KeywordCategoryEnum.describe('敏感词分类'),
  level: KeywordLevelEnum.describe('敏感词级别'),
  match_type: MatchTypeEnum.describe('匹配方式'),
  is_degradable: z.boolean().describe('是否可降级（6类不可降级=false）'),
  scope: KeywordScopeEnum.describe('词库范围（平台/租户）'),
  tenant_id: z.string().optional().describe('租户ID（scope=租户时必填）'),
  status: z.enum(['enabled', 'disabled']).default('enabled'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type KeywordLibrary = z.infer<typeof KeywordLibrarySchema>

/** ENT-AUDIT-005 租户词库配置 */
export const TenantKeywordConfigSchema = z.object({
  config_id: z.string().describe('配置ID'),
  tenant_id: z.string().describe('租户ID'),
  inherited_platform_lib: z.string().describe('继承的平台词库（只读快照JSON）'),
  extended_lib: z.string().describe('租户扩展词库（JSON）'),
  personalized_lib: z.string().describe('租户个性化词库（JSON）'),
  effective_lib: z.string().describe('生效词库（并集JSON）'),
  tencent_config_id: z.string().optional().describe('腾讯云配置ID'),
  last_synced_at: z.string().datetime().optional().describe('最后同步时间'),
})
export type TenantKeywordConfig = z.infer<typeof TenantKeywordConfigSchema>

/** ENT-AUDIT-006 降级申请 */
export const DowngradeRequestSchema = z.object({
  request_id: z.string().describe('申请ID'),
  tenant_id: z.string().describe('租户ID'),
  request_type: RequestTypeEnum.describe('申请类型（降级/升级）'),
  target_category: KeywordCategoryEnum.describe('目标词库类别'),
  target_level: KeywordLevelEnum.describe('目标级别'),
  reason: z.string().min(1).describe('申请理由'),
  status: RequestStatusEnum.default('pending'),
  approver: z.string().optional().describe('审批人'),
  approved_at: z.string().datetime().optional().describe('审批时间'),
  approval_comment: z.string().optional().describe('审批意见'),
  created_at: z.string().datetime(),
})
export type DowngradeRequest = z.infer<typeof DowngradeRequestSchema>

// ============================================
// API请求/响应契约
// ============================================

/** 违规查询参数 */
export const ViolationQueryParamsSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(20),
  stream_id: z.string().optional(),
  violation_type: ViolationTypeEnum.optional(),
  violation_level: ViolationLevelEnum.optional(),
  disposal_status: DisposalStatusEnum.optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
})
export type ViolationQueryParams = z.infer<typeof ViolationQueryParamsSchema>

/** 处置操作请求 */
export const DisposalRequestSchema = z.object({
  violation_id: z.string(),
  disposal_type: DisposalTypeEnum,
  disposal_reason: z.string().min(1),
})
export type DisposalRequest = z.infer<typeof DisposalRequestSchema>

/** 新增敏感词请求 */
export const KeywordCreateSchema = z.object({
  keyword: z.string().min(1),
  category: KeywordCategoryEnum,
  level: KeywordLevelEnum,
  match_type: MatchTypeEnum,
  is_degradable: z.boolean(),
  scope: KeywordScopeEnum,
})
export type KeywordCreate = z.infer<typeof KeywordCreateSchema>

/** 分页结果 */
export const PaginatedResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    page_size: z.number(),
  })

/** 统一响应 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema.optional(),
  })

// ============================================
// 实时事件契约（SSE/BroadcastChannel）
// ============================================

export const AuditEventSchema = z.discriminatedUnion('event_type', [
  z.object({
    event_type: z.literal('violation'),
    data: ReviewViolationSchema,
  }),
  z.object({
    event_type: z.literal('disposal_update'),
    data: z.object({
      violation_id: z.string(),
      disposal_status: DisposalStatusEnum,
    }),
  }),
  z.object({
    event_type: z.literal('mute_complete'),
    data: z.object({
      task_id: z.string(),
      mute_result: z.enum(['success', 'failed', 'partial']),
      muted_file_url: z.string().optional(),
    }),
  }),
  z.object({
    event_type: z.literal('sync_complete'),
    data: z.object({
      tenant_id: z.string().optional(),
      sync_result: z.enum(['success', 'failed']),
      synced_at: z.string().datetime(),
    }),
  }),
])
export type AuditEvent = z.infer<typeof AuditEventSchema>

// ============================================
// 6类不可降级分类（常量）
// ============================================

export const NON_DEGRADABLE_CATEGORIES: KeywordCategory[] = [
  'pornography',      // 涉黄
  'violence',         // 涉暴
  'public_safety',    // 公共安全
  'social_safety',    // 社会安全
  'illegal',          // 违法乱纪
  'advertising_law',  // 广告法
]

/** 检查分类是否不可降级 */
export function isNonDegradable(category: KeywordCategory): boolean {
  return NON_DEGRADABLE_CATEGORIES.includes(category)
}

/** 违规级别→告警颜色映射（CONFIG-AUDIT-003） */
export const VIOLATION_ALERT_COLOR: Record<ViolationLevel, 'red' | 'yellow' | 'blue'> = {
  L1: 'red',
  L2: 'red',
  L3: 'yellow',
  L4: 'blue',
}

/** 违规级别→默认处置策略映射（CONFIG-AUDIT-004） */
export const VIOLATION_DISPOSAL_STRATEGY: Record<ViolationLevel, DisposalType> = {
  L1: 'stop_stream',
  L2: 'stop_stream',
  L3: 'record',
  L4: 'record',
}
