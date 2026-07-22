/**
 * SimDataAdapter — 仿真模式数据适配器
 * 模拟腾讯云回调数据 + 内存存储 + 模拟词库
 */

import type { IDataAdapter } from '../factory'
import type { ReviewViolation, KeywordLibrary } from '@/contracts/content-review'
import { NON_DEGRADABLE_CATEGORIES } from '@/contracts/content-review'

const MOCK_KEYWORDS: KeywordLibrary[] = [
  { keyword_id: 'kw-001', keyword: '示例涉黄词A', category: 'pornography', level: 'L1', match_type: 'exact', is_degradable: false, scope: 'platform', status: 'enabled', created_at: '2026-07-22T00:00:00Z', updated_at: '2026-07-22T00:00:00Z' },
  { keyword_id: 'kw-002', keyword: '示例涉黄词B', category: 'pornography', level: 'L1', match_type: 'semantic', is_degradable: false, scope: 'platform', status: 'enabled', created_at: '2026-07-22T00:00:00Z', updated_at: '2026-07-22T00:00:00Z' },
  { keyword_id: 'kw-003', keyword: '示例涉暴词A', category: 'violence', level: 'L2', match_type: 'fuzzy', is_degradable: false, scope: 'platform', status: 'enabled', created_at: '2026-07-22T00:00:00Z', updated_at: '2026-07-22T00:00:00Z' },
  { keyword_id: 'kw-004', keyword: '示例广告法词A', category: 'advertising_law', level: 'L3', match_type: 'exact', is_degradable: false, scope: 'platform', status: 'enabled', created_at: '2026-07-22T00:00:00Z', updated_at: '2026-07-22T00:00:00Z' },
  { keyword_id: 'kw-005', keyword: '示例广告法词B', category: 'advertising_law', level: 'L4', match_type: 'exact', is_degradable: false, scope: 'platform', status: 'enabled', created_at: '2026-07-22T00:00:00Z', updated_at: '2026-07-22T00:00:00Z' },
  { keyword_id: 'kw-006', keyword: '租户自定义词A', category: 'custom', level: 'L3', match_type: 'exact', is_degradable: true, scope: 'tenant', tenant_id: 'tenant-001', status: 'enabled', created_at: '2026-07-22T00:00:00Z', updated_at: '2026-07-22T00:00:00Z' },
]

const VIOLATION_TYPES = ['pornography', 'violence', 'advertising_law', 'prohibited_word'] as const
const VIOLATION_LEVELS = ['L1', 'L2', 'L3', 'L4'] as const
const SUGGESTIONS = ['pass', 'review', 'block'] as const

export class SimDataAdapter implements IDataAdapter {
  private violations: ReviewViolation[] = []
  private counter = 0

  generateMockCallback(): any {
    const type = VIOLATION_TYPES[Math.floor(Math.random() * VIOLATION_TYPES.length)]
    const level = VIOLATION_LEVELS[Math.floor(Math.random() * VIOLATION_LEVELS.length)]
    const suggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]
    const now = Date.now()

    return {
      stream_id: `stream-${Math.floor(Math.random() * 1000)}`,
      domain: 'push.saas.example.com',
      app: 'live',
      timestamp: now,
      audit_type: 'audio',
      violation_type: type,
      violation_level: level,
      violation_content: 'https://example.com/evidence/audio-' + now + '.mp3',
      violation_time: now - Math.floor(Math.random() * 30000),
      suggestion,
      confidence: 60 + Math.floor(Math.random() * 40),
      keyword: `敏感词${this.counter + 1}`,
      keyword_category: type,
      evidence_url: 'https://example.com/evidence/evidence-' + now + '.png',
      audio_muted: Math.random() > 0.3,
      mute_duration: Math.floor(Math.random() * 5) + 1,
      mute_start_time: now - Math.floor(Math.random() * 10000),
    }
  }

  async saveViolation(violation: ReviewViolation): Promise<void> {
    this.violations.unshift(violation)
    if (this.violations.length > 100) this.violations.pop()
  }

  async queryViolations(params?: any): Promise<ReviewViolation[]> {
    let result = [...this.violations]
    if (params?.stream_id) result = result.filter(v => v.stream_id === params.stream_id)
    if (params?.violation_type) result = result.filter(v => v.violation_type === params.violation_type)
    if (params?.disposal_status) result = result.filter(v => v.disposal_status === params.disposal_status)
    return result
  }

  getMockKeywords(): KeywordLibrary[] {
    return MOCK_KEYWORDS
  }

  nextViolationId(): string {
    return `violation-${++this.counter}-${Date.now()}`
  }
}
