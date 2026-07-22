/**
 * SimTransportAdapter — 仿真模式通信适配器
 * 使用BroadcastChannel跨标签页推送 + 定时器模拟实时回调
 */

import type { ITransportAdapter } from '../factory'

export class SimTransportAdapter implements ITransportAdapter {
  private channel: BroadcastChannel
  private handlers: ((event: any) => void)[] = []
  private timer: ReturnType<typeof setInterval> | null = null

  constructor() {
    this.channel = new BroadcastChannel('audit-events')
    this.channel.onmessage = (e) => {
      this.handlers.forEach(h => h(e.data))
    }
  }

  emit(event: any): void {
    this.channel.postMessage(event)
    this.handlers.forEach(h => h(event))
  }

  subscribe(handler: (event: any) => void): void {
    this.handlers.push(handler)
  }

  /** 启动定时模拟回调（每5-15秒生成一条违规） */
  startMockCallback(generator: () => any, onCallback: (data: any) => void): void {
    this.timer = setInterval(() => {
      const data = generator()
      onCallback(data)
    }, 5000 + Math.random() * 10000)
  }

  stopMockCallback(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  disconnect(): void {
    this.stopMockCallback()
    this.channel.close()
    this.handlers = []
  }
}
