/**
 * 适配器工厂 — 五维可插拔架构入口
 * 根据VITE_MODE创建sim/real适配器
 */

import type { ReviewViolation, KeywordLibrary } from '@/contracts/content-review'

export interface IDataAdapter {
  generateMockCallback(): any
  saveViolation(violation: ReviewViolation): Promise<void>
  queryViolations(params?: any): Promise<ReviewViolation[]>
  getMockKeywords(): KeywordLibrary[]
}

export interface ITransportAdapter {
  emit(event: any): void
  subscribe(handler: (event: any) => void): void
  disconnect(): void
}

function getMode(): 'sim' | 'real' {
  const override = import.meta.env.VITE_MODE_OVERRIDE_AUDIT
  if (override) return override
  return import.meta.env.VITE_MODE || 'sim'
}

export async function createDataAdapter(): Promise<IDataAdapter> {
  const mode = getMode()
  if (mode === 'sim') {
    const { SimDataAdapter } = await import('./sim/audit-data')
    return new SimDataAdapter()
  }
  const { RealDataAdapter } = await import('./real/audit-data')
  return new RealDataAdapter()
}

export async function createTransportAdapter(): Promise<ITransportAdapter> {
  const mode = getMode()
  if (mode === 'sim') {
    const { SimTransportAdapter } = await import('./sim/audit-transport')
    return new SimTransportAdapter()
  }
  const { SSETransportAdapter } = await import('./real/audit-transport')
  return new SSETransportAdapter()
}
