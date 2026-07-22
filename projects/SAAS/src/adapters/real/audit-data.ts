/**
 * RealDataAdapter — 真实模式数据适配器（stub）
 * 接收真实腾讯云回调 + API请求
 */

import type { IDataAdapter } from '../factory'
import type { ReviewViolation, KeywordLibrary } from '@/contracts/content-review'

export class RealDataAdapter implements IDataAdapter {
  async generateMockCallback(): Promise<any> {
    throw new Error('RealDataAdapter does not support mock generation')
  }

  async saveViolation(violation: ReviewViolation): Promise<void> {
    const res = await fetch('/api/audit/violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(violation),
    })
    if (!res.ok) throw new Error(`Failed to save violation: ${res.statusText}`)
  }

  async queryViolations(params?: any): Promise<ReviewViolation[]> {
    const query = new URLSearchParams(params || {}).toString()
    const res = await fetch(`/api/audit/violations?${query}`)
    if (!res.ok) throw new Error(`Failed to query violations: ${res.statusText}`)
    const data = await res.json()
    return data.items || []
  }

  getMockKeywords(): KeywordLibrary[] {
    throw new Error('RealDataAdapter should fetch from API')
  }
}
