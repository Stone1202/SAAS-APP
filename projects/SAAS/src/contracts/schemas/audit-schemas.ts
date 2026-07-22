/**
 * 内容审查域 — Zod实体Schema（三层契约 Layer 1）
 * 来源：PRD 16-内容审查域 §12 数据实体 ENT-AUDIT-001~005
 * 用途：运行时数据校验 + TypeScript类型推导 + Mock数据生成参考
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

export const AuditTypeEnum = z.enum(['audio', 'video', 'screenshot']);
export type AuditType = z.infer<typeof AuditTypeEnum>;

export const ViolationTypeEnum = z.enum([
  'porn',        // 涉黄
  'violence',    // 涉暴
  'banned_words',// 违禁词
  'ad_law',      // 广告法
  'politics',    // 涉政
  'abuse',       // 辱骂
  'illegal',     // 违法乱纪
  'public_safety',// 公共安全
  'social_safety',// 社会安全
  'custom',      // 自定义
]);
export type ViolationType = z.infer<typeof ViolationTypeEnum>;

export const ViolationLevelEnum = z.enum(['L1', 'L2', 'L3', 'L4']);
export type ViolationLevel = z.infer<typeof ViolationLevelEnum>;

export const SuggestionEnum = z.enum(['pass', 'review', 'block']);
export type Suggestion = z.infer<typeof SuggestionEnum>;

export const DisposalStatusEnum = z.enum([
  'pending',      // 待处理
  'recorded',     // 已记录
  'cut_off',      // 已断流
  'ignored',      // 已忽略
  'timeout',      // 已超时
  'archived',     // 已归档
]);
export type DisposalStatus = z.infer<typeof DisposalStatusEnum>;

export const DisposalTypeEnum = z.enum([
  'record',       // 记录
  'cut_off',      // 断流
  'ignore',       // 忽略
  'auto_record',  // 自动记录
  'auto_archive', // 自动归档
]);
export type DisposalType = z.infer<typeof DisposalTypeEnum>;

export const MuteModeEnum = z.enum(['silent', 'beep']);
export type MuteMode = z.infer<typeof MuteModeEnum>;

export const FieldStatusEnum = z.enum(['live', 'ended', 'replaying']);
export type FieldStatus = z.infer<typeof FieldStatusEnum>;

export const ReplayTaskStatusEnum = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'timeout',
]);
export type ReplayTaskStatus = z.infer<typeof ReplayTaskStatusEnum>;

// ============================================
// ENT-AUDIT-001: 违规记录
// ============================================

export const ReviewViolationSchema = z.object({
  violation_id: z.string().uuid(),
  stream_id: z.string(),
  audit_type: AuditTypeEnum,
  violation_type: ViolationTypeEnum,
  violation_level: ViolationLevelEnum,
  violation_content: z.string(),
  violation_time: z.string().datetime(),
  suggestion: SuggestionEnum,
  confidence: z.number().int().min(0).max(100),
  keyword: z.string(),
  evidence_url: z.string().url(),
  raw_callback: z.record(z.unknown()),
  audio_muted: z.boolean(),
  mute_duration: z.number().int().min(0),
  disposal_status: DisposalStatusEnum,
  created_at: z.string().datetime(),
});
export type ReviewViolation = z.infer<typeof ReviewViolationSchema>;

// ============================================
// ENT-AUDIT-002: 处置记录
// ============================================

export const ReviewDisposalSchema = z.object({
  disposal_id: z.string().uuid(),
  violation_id: z.string().uuid(),
  disposal_type: DisposalTypeEnum,
  disposal_reason: z.string().min(1, '处置理由不能为空'),
  operator: z.string(),
  operated_at: z.string().datetime(),
});
export type ReviewDisposal = z.infer<typeof ReviewDisposalSchema>;

// ============================================
// ENT-AUDIT-003: 租户审查配置
// ============================================

export const TenantAuditConfigSchema = z.object({
  tenant_id: z.string(),
  tenant_name: z.string(),
  industry: z.string(),
  stream_domain: z.string(),
  audit_enabled: z.boolean(),
  today_violation_count: z.number().int().min(0),
  mute_mode: MuteModeEnum,
});
export type TenantAuditConfig = z.infer<typeof TenantAuditConfigSchema>;

// ============================================
// ENT-AUDIT-004: 回放擦音任务
// ============================================

export const ReplayMuteTaskSchema = z.object({
  task_id: z.string().uuid(),
  stream_id: z.string(),
  replay_file_url: z.string().url(),
  muted_file_url: z.string().url().optional(),
  task_status: ReplayTaskStatusEnum,
  progress: z.number().int().min(0).max(100),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  error_msg: z.string().optional(),
});
export type ReplayMuteTask = z.infer<typeof ReplayMuteTaskSchema>;

// ============================================
// ENT-AUDIT-005: 回放文件
// ============================================

export const ReplayFileSchema = z.object({
  file_id: z.string().uuid(),
  stream_id: z.string(),
  file_name: z.string(),
  duration: z.number().int().min(0),
  file_size: z.number().int().min(0),
  created_at: z.string().datetime(),
  play_url_original: z.string().url(),
  play_url_muted: z.string().url().optional(),
  is_muted: z.boolean(),
  allow_play: z.boolean(),
});
export type ReplayFile = z.infer<typeof ReplayFileSchema>;

// ============================================
// 聚合类型（业务层常用组合）
// ============================================

/** 告警统计（红黄蓝三级） */
export const AlertStatsSchema = z.object({
  l1: z.number().int().min(0),  // L1核心（红）
  l2: z.number().int().min(0),  // L2高危（红）
  l3: z.number().int().min(0),  // L3中危（黄）
  l4: z.number().int().min(0),  // L4低危（蓝）
  total: z.number().int().min(0),
});
export type AlertStats = z.infer<typeof AlertStatsSchema>;

/** 违规筛选条件 */
export const ViolationFilterSchema = z.object({
  level: ViolationLevelEnum.optional(),
  status: DisposalStatusEnum.optional(),
  sort_by: z.enum(['time', 'level', 'status']).default('time'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});
export type ViolationFilter = z.infer<typeof ViolationFilterSchema>;

/** 处置操作请求 */
export const DisposalRequestSchema = z.object({
  violation_id: z.string().uuid(),
  disposal_type: DisposalTypeEnum,
  reason: z.string().min(1, '处置理由不能为空'),
  operator: z.string(),
});
export type DisposalRequest = z.infer<typeof DisposalRequestSchema>;

/** 审查开关请求 */
export const AuditSwitchRequestSchema = z.object({
  tenant_id: z.string(),
  enabled: z.boolean(),
});
export type AuditSwitchRequest = z.infer<typeof AuditSwitchRequestSchema>;
