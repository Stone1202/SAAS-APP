/**
 * 内容审查 Pinia Store
 * 管理违规列表 + 敏感词库 + 处置记录 + Service实例
 */

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { createDataAdapter, createTransportAdapter } from '@/adapters/factory'
import type { IDataAdapter, ITransportAdapter } from '@/adapters/factory'
import { ContentReviewService } from '@/services/content-review-service'
import { DisposalService } from '@/services/disposal-service'
import type { ReviewViolation, KeywordLibrary, ReviewDisposal } from '@/contracts/content-review'

export const useAuditStore = defineStore('audit', () => {
  const violations = ref<ReviewViolation[]>([])
  const keywords = ref<KeywordLibrary[]>([])
  const disposals = ref<ReviewDisposal[]>([])
  const reviewStatus = ref<'running' | 'error'>('running')
  const initialized = ref(false)

  let dataAdapter: IDataAdapter | null = null
  let transport: ITransportAdapter | null = null
  let reviewService: ContentReviewService | null = null
  let disposalService: DisposalService | null = null

  async function init() {
    if (initialized.value) return

    dataAdapter = await createDataAdapter()
    transport = await createTransportAdapter()
    reviewService = new ContentReviewService(dataAdapter, transport)
    disposalService = new DisposalService(transport)

    keywords.value = dataAdapter.getMockKeywords()

    transport.subscribe((event: any) => {
      if (event.event_type === 'violation') {
        violations.value.unshift(event.data)
        startDisposalTimeout(event.data)
      } else if (event.event_type === 'disposal_update') {
        const v = violations.value.find(v => v.violation_id === event.data.violation_id)
        if (v) v.disposal_status = event.data.disposal_status
      }
    })

    const simTransport = transport as any
    if (simTransport.startMockCallback) {
      simTransport.startMockCallback(
        () => (dataAdapter as any).generateMockCallback(),
        async (callback: any) => {
          await reviewService!.receiveCallback(callback)
        },
      )
    }

    initialized.value = true
  }

  function startDisposalTimeout(violation: ReviewViolation) {
    if (!disposalService) return
    disposalService.startTimeout(violation, async () => {
      await disposalService!.dispose(violation, 'auto_record', '系统自动记录（30秒超时）', 'system')
      const d = disposalService!.getDisposals(violation.violation_id)
      disposals.value.unshift(...d)
    })
  }

  async function dispose(violation: ReviewViolation, type: any, reason: string) {
    if (!disposalService) return
    const disposal = await disposalService.dispose(violation, type, reason, '运营管理员')
    disposals.value.unshift(disposal)
  }

  async function loadViolations() {
    if (!reviewService) return
    violations.value = await reviewService.getViolations()
  }

  function getDisposalsForViolation(violationId: string): ReviewDisposal[] {
    if (!disposalService) return []
    return disposalService.getDisposals(violationId)
  }

  function getStatistics() {
    const total = violations.value.length
    const pending = violations.value.filter(v => v.disposal_status === 'pending').length
    const recorded = violations.value.filter(v => v.disposal_status === 'recorded').length
    const stopped = violations.value.filter(v => v.disposal_status === 'stream_stopped').length
    const ignored = violations.value.filter(v => v.disposal_status === 'ignored').length
    const timeout = violations.value.filter(v => v.disposal_status === 'timeout').length
    const muted = violations.value.filter(v => v.audio_muted).length
    return {
      total,
      pending,
      disposed: recorded + stopped + ignored + timeout,
      mutedRate: total > 0 ? Math.round((muted / total) * 100) : 0,
      byType: groupBy(violations.value, 'violation_type'),
      byLevel: groupBy(violations.value, 'violation_level'),
    }
  }

  function groupBy(arr: any[], key: string): Record<string, number> {
    return arr.reduce((acc, item) => {
      const k = item[key]
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})
  }

  return {
    violations,
    keywords,
    disposals,
    reviewStatus,
    initialized,
    init,
    dispose,
    loadViolations,
    getDisposalsForViolation,
    getStatistics,
  }
})
