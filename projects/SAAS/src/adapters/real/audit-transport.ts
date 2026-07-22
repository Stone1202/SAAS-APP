/**
 * SSETransportAdapter — 真实模式通信适配器（stub）
 * 使用Server-Sent Events接收实时推送
 */

import type { ITransportAdapter } from '../factory'

export class SSETransportAdapter implements ITransportAdapter {
  private source: EventSource | null = null
  private handlers: ((event: any) => void)[] = []

  connect(streamId?: string): void {
    const url = streamId ? `/api/audit/events?stream_id=${streamId}` : '/api/audit/events'
    this.source = new EventSource(url)
    this.source.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        this.handlers.forEach(h => h(event))
      } catch (err) {
        console.error('Failed to parse SSE event:', err)
      }
    }
  }

  emit(event: any): void {
    // Real mode: events are received from server, not emitted
    console.warn('SSETransportAdapter is read-only, cannot emit')
  }

  subscribe(handler: (event: any) => void): void {
    this.handlers.push(handler)
    if (!this.source) this.connect()
  }

  disconnect(): void {
    if (this.source) {
      this.source.close()
      this.source = null
    }
    this.handlers = []
  }
}
