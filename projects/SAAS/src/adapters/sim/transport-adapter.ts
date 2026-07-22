/**
 * Sim模式 — 传输适配器（Pinia Store事件总线）
 *
 * 职责：通过Pinia Store的$subscribe实现事件驱动架构
 * 直播中控 + 观众端通过此适配器订阅审计事件
 */

import type { AuditEvent, AuditEventHandler, AuditTransportAdapter } from '../../contracts';

export class SimTransportAdapter implements AuditTransportAdapter {
  private handlers: Set<AuditEventHandler> = new Set();
  private eventHistory: AuditEvent[] = [];

  subscribe(handler: AuditEventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  emit(event: AuditEvent): void {
    this.eventHistory.push(event);
    // 保留最近100条历史
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100);
    }
    this.handlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('[SimTransport] 事件处理异常:', e);
      }
    });
  }

  /** 获取事件历史（调试用） */
  getHistory(): AuditEvent[] {
    return [...this.eventHistory];
  }

  /** 清空历史 */
  clearHistory() {
    this.eventHistory = [];
  }
}

export const simTransport = new SimTransportAdapter();
