/**
 * Real模式 — 传输适配器（WebSocket）
 *
 * V2+对接腾讯云实时回调时使用WebSocket
 * V1阶段：预留接口
 */

import type { AuditEvent, AuditEventHandler, AuditTransportAdapter } from '../../contracts';

export class RealTransportAdapter implements AuditTransportAdapter {
  private ws: WebSocket | null = null;
  private handlers: Set<AuditEventHandler> = new Set();
  private url: string;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/audit';
  }

  subscribe(handler: AuditEventHandler): () => void {
    this.handlers.add(handler);
    this.connect();
    return () => {
      this.handlers.delete(handler);
      if (this.handlers.size === 0) {
        this.disconnect();
      }
    };
  }

  emit(event: AuditEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (evt) => {
      try {
        const event: AuditEvent = JSON.parse(evt.data);
        this.handlers.forEach(handler => handler(event));
      } catch (e) {
        console.error('[RealTransport] 消息解析失败:', e);
      }
    };
    this.ws.onclose = () => {
      // WebSocket断开时自动重连
      setTimeout(() => this.connect(), 3000);
    };
  }

  private disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const realTransport = new RealTransportAdapter();
