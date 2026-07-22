/**
 * DisposalService — 处置Service
 * 处置操作（记录/断流/忽略）+ 超时自动记录
 */

import type { ITransportAdapter } from '@/adapters/factory'
import type { ReviewViolation, ReviewDisposal, DisposalType } from '@/contracts/content-review'

export class DisposalService {
  private disposals: ReviewDisposal[] = []
  private timeoutTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

  constructor(private transport: ITransportAdapter) {}

  /** 执行处置 */
  async dispose(
    violation: ReviewViolation,
    disposalType: DisposalType,
    reason: string,
    operator: string,
  ): Promise<ReviewDisposal> {
    const disposal: ReviewDisposal = {
      disposal_id: `D-${Date.now()}`,
      violation_id: violation.violation_id,
      disposal_type: disposalType,
      disposal_reason: reason,
      operator,
      operated_at: new Date().toISOString(),
      disposal_result: this.getDisposalResult(disposalType),
    }

    this.disposals.unshift(disposal)

    // 清除超时定时器
    const timer = this.timeoutTimers.get(violation.violation_id)
    if (timer) {
      clearTimeout(timer)
      this.timeoutTimers.delete(violation.violation_id)
    }

    // 推送处置状态更新
    this.transport.emit({
      event_type: 'disposal_update',
      data: {
        violation_id: violation.violation_id,
        disposal_status: this.getStatusFromType(disposalType),
      },
    })

    return disposal
  }

  /** 启动超时自动记录（30秒） */
  startTimeout(violation: ReviewViolation, onTimeout: () => void): void {
    const timer = setTimeout(() => {
      onTimeout()
      this.timeoutTimers.delete(violation.violation_id)
    }, 30000)
    this.timeoutTimers.set(violation.violation_id, timer)
  }

  /** 获取处置记录 */
  getDisposals(violationId?: string): ReviewDisposal[] {
    if (violationId) return this.disposals.filter(d => d.violation_id === violationId)
    return this.disposals
  }

  private getDisposalResult(type: DisposalType): string {
    const map: Record<DisposalType, string> = {
      record: '已记录违规事件，直播继续',
      stop_stream: '已切断推流，直播终止',
      ignore: '已标记为非违规',
      auto_record: '系统自动记录（超时）',
    }
    return map[type]
  }

  private getStatusFromType(type: DisposalType): ReviewViolation['disposal_status'] {
    const map: Record<DisposalType, ReviewViolation['disposal_status']> = {
      record: 'recorded',
      stop_stream: 'stream_stopped',
      ignore: 'ignored',
      auto_record: 'timeout',
    }
    return map[type]
  }
}
