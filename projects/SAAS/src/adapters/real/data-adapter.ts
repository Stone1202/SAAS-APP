/**
 * Real模式 — 数据适配器（对接Mock后端API）
 *
 * V2+对接真实腾讯云API时的替换实现
 * V1阶段：对接FastAPI Mock后端
 */

import type {
  ApiResponse,
  AuditDataAdapter,
  AuditSwitchApi,
  ViolationsApi,
  DisposalApi,
  ReplayMuteApi,
  AuditSwitchRequest,
  ViolationsQueryParams,
  ViolationsResponse,
  DisposalRequest,
  MuteStatusResponse,
  TenantAuditConfig,
  ReviewDisposal,
  ReplayMuteTask,
} from '../../contracts';

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/audit';

class RealAuditSwitchApi implements AuditSwitchApi {
  async toggleSwitch(req: AuditSwitchRequest): Promise<ApiResponse<TenantAuditConfig>> {
    const res = await fetch(`${BASE_URL}/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return res.json();
  }
}

class RealViolationsApi implements ViolationsApi {
  async getViolations(params: ViolationsQueryParams): Promise<ApiResponse<ViolationsResponse>> {
    const query = new URLSearchParams(params as unknown as Record<string, string>);
    const res = await fetch(`${BASE_URL}/violations/${params.live_id}?${query}`);
    return res.json();
  }
}

class RealDisposalApi implements DisposalApi {
  async dispose(req: DisposalRequest): Promise<ApiResponse<ReviewDisposal>> {
    const res = await fetch(`${BASE_URL}/disposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return res.json();
  }
}

class RealReplayMuteApi implements ReplayMuteApi {
  async getMuteStatus(liveId: string): Promise<ApiResponse<MuteStatusResponse>> {
    const res = await fetch(`${BASE_URL}/replay/${liveId}/mute-status`);
    return res.json();
  }
  async triggerMute(liveId: string): Promise<ApiResponse<ReplayMuteTask>> {
    const res = await fetch(`${BASE_URL}/replay/${liveId}/mute`, { method: 'POST' });
    return res.json();
  }
  async retryMute(liveId: string): Promise<ApiResponse<ReplayMuteTask>> {
    const res = await fetch(`${BASE_URL}/replay/${liveId}/mute/retry`, { method: 'POST' });
    return res.json();
  }
}

export const realAuditDataAdapter: AuditDataAdapter = {
  auditSwitch: new RealAuditSwitchApi(),
  violations: new RealViolationsApi(),
  disposal: new RealDisposalApi(),
  replayMute: new RealReplayMuteApi(),
};
