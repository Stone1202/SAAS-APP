/**
 * ContentReviewService — 内容审查Service
 * 回调接收 + 违规存储 + 违规查询 + 回放擦音
 */

import type { IDataAdapter, ITransportAdapter } from '@/adapters/factory'
import type { ReviewViolation, TencentReviewCallback } from '@/contracts/content-review'

export class ContentReviewService {
  constructor(
    private dataAdapter: IDataAdapter,
    private transport: ITransportAdapter,
  ) {}

  /** 接收腾讯云回调 → 创建违规记录 → 推送中控室 */
  async receiveCallback(callback: TencentReviewCallback): Promise<ReviewViolation> {
    const violation: ReviewViolation = {
      violation_id: `V-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      task_id: `T-${callback.stream_id}`,
      stream_id: callback.stream_id,
      audit_type: callback.audit_type,
      violation_type: callback.violation_type,
      violation_level: callback.violation_level,
      violation_content: callback.violation_content,
      violation_time: new Date(callback.violation_time).toISOString(),
      suggestion: callback.suggestion,
      confidence: callback.confidence,
      keyword: callback.keyword,
      keyword_category: callback.keyword_category,
      evidence_url: callback.evidence_url,
      raw_callback: JSON.stringify(callback),
      audio_muted: callback.audio_muted,
      mute_duration: callback.mute_duration,
      mute_start_time: callback.mute_start_time ? new Date(callback.mute_start_time).toISOString() : undefined,
      disposal_status: 'pending',
      created_at: new Date().toISOString(),
    }

    await this.dataAdapter.saveViolation(violation)

    this.transport.emit({
      event_type: 'violation',
      data: violation,
    })

    return violation
  }

  /** 查询违规列表 */
  async getViolations(params?: any): Promise<ReviewViolation[]> {
    return this.dataAdapter.queryViolations(params)
  }

  /** 获取违规详情 */
  async getViolationDetail(id: string, all: ReviewViolation[]): Promise<ReviewViolation | undefined> {
    return all.find(v => v.violation_id === id)
  }
}
