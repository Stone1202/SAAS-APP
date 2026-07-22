/**
 * 内容审查域 — API契约定义（三层契约 Layer 2）
 * 定义 Sim 和 Real 模式下的接口签名
 * V1 Sim模式：前端内存模拟，这些接口定义用于约束Adapter实现
 * V2+ Real模式：替换为真实HTTP请求
 */

import type {
  ReviewViolation,
  ReviewDisposal,
  TenantAuditConfig,
  ReplayMuteTask,
  AlertStats,
  DisposalRequest,
  AuditSwitchRequest,
} from '../schemas/audit-schemas';

// ============================================
// 响应封装
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============================================
// 1. 租户审查开关
// ============================================

/** POST /api/audit/switch */
export interface AuditSwitchApi {
  toggleSwitch(req: AuditSwitchRequest): Promise<ApiResponse<TenantAuditConfig>>;
}

// ============================================
// 2. 违规列表查询
// ============================================

export interface ViolationsQueryParams {
  live_id: string;
  level?: string;   // L1/L2/L3/L4
  status?: string;  // pending/recorded/cut_off/ignored/timeout/archived
  sort_by?: 'time' | 'level' | 'status';
  sort_order?: 'asc' | 'desc';
}

export interface ViolationsResponse {
  violations: ReviewViolation[];
  stats: AlertStats;
  field_status: 'live' | 'ended';
  callback_lost: boolean;
}

/** GET /api/audit/violations/:liveId */
export interface ViolationsApi {
  getViolations(params: ViolationsQueryParams): Promise<ApiResponse<ViolationsResponse>>;
}

// ============================================
// 3. 违规处置
// ============================================

/** POST /api/audit/disposal */
export interface DisposalApi {
  dispose(req: DisposalRequest): Promise<ApiResponse<ReviewDisposal>>;
}

// ============================================
// 4. 回放擦音状态
// ============================================

export interface MuteStatusResponse {
  task: ReplayMuteTask | null;
  can_retry: boolean;
}

/** GET /api/audit/replay/:liveId/mute-status */
export interface ReplayMuteApi {
  getMuteStatus(liveId: string): Promise<ApiResponse<MuteStatusResponse>>;
  triggerMute(liveId: string): Promise<ApiResponse<ReplayMuteTask>>;
  retryMute(liveId: string): Promise<ApiResponse<ReplayMuteTask>>;
}

// ============================================
// 聚合接口 — 数据适配器契约
// ============================================

/**
 * 审计数据适配器接口
 * SimAdapter 和 RealAdapter 必须实现此接口
 */
export interface AuditDataAdapter {
  auditSwitch: AuditSwitchApi;
  violations: ViolationsApi;
  disposal: DisposalApi;
  replayMute: ReplayMuteApi;
}

// ============================================
// 传输适配器接口（WebSocket / Store事件）
// ============================================

export interface AuditEvent {
  type: 'violation' | 'disposal' | 'field_status_change' | 'mute_mode_change' | 'callback_lost';
  payload: unknown;
  timestamp: string;
}

export type AuditEventHandler = (event: AuditEvent) => void;

export interface AuditTransportAdapter {
  subscribe(handler: AuditEventHandler): () => void;  // 返回取消订阅函数
  emit(event: AuditEvent): void;
}
