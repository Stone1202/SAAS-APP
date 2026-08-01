/**
 * SugarMate REAL 适配器 —— 生产环境桩
 * 对应架构：五维可插拔，VITE_MODE=real 时加载
 * TODO: 对接真实后端 API 时替换各适配器实现
 */
import type { IDataAdapter, ITransportAdapter, IStreamAdapter, IAssetAdapter, IAuthAdapter, AdapterSet } from '../factory';

class RealDataAdapter implements IDataAdapter {
  private token() { return localStorage.getItem('sugarmate_token'); }
  private headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token() || ''}` }; }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`/api/v1${path}`, {
      method, headers: this.headers(), body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error((err as any).message || `HTTP ${res.status}`); }
    const json = await res.json();
    return json.data ?? json;
  }

  async login(phone: string, code: string, platform: string, deviceId: string) { return this.request('POST', '/auth/login', { phone, sms_code: code, platform, device_id: deviceId }); }
  async getAccount(accountId: string) { return this.request('GET', `/accounts/${accountId}`); }
  async getIdentities(accountId: string) { return this.request('GET', `/accounts/${accountId}/identities`); }
  async activateIdentity(identityId: string) { return this.request('POST', `/identities/${identityId}/activate`); }
  async getOrderList(params: any) { return this.request('GET', `/orders?${new URLSearchParams(params)}`); }
  async getOrderDetail(orderId: string) { return this.request('GET', `/orders/${orderId}`); }

  // === 商品管理（统一商品中心） ===
  async getProductList(params: { page: number; page_size: number; status?: string; keyword?: string }): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/products/list?${new URLSearchParams(params as any)}`);
  }
  async getProductDetail(productId: string): Promise<any> { return this.request('GET', `/products/${productId}`); }
  async getProductCategories(): Promise<any[]> { return this.request('GET', '/products/categories'); }
  async createProduct(product: any): Promise<any> { return this.request('POST', '/products', product); }
  async updateProduct(productId: string, updates: any): Promise<void> { await this.request('PUT', `/products/${productId}`, updates); }
  async toggleProductStatus(productId: string, status: 'ON_SHELF' | 'OFF_SHELF'): Promise<void> { await this.request('PUT', `/products/${productId}/status`, { status }); }
  async batchProducts(ids: string[], action: 'DELETE' | 'ON_SHELF' | 'OFF_SHELF'): Promise<void> { await this.request('POST', '/products/batch', { ids, action }); }

  async get<T>(path: string): Promise<T> { return this.request('GET', path); }
  async post<T, B = unknown>(path: string, body?: B): Promise<T> { return this.request('POST', path, body); }
  async put<T, B = unknown>(path: string, body?: B): Promise<T> { return this.request('PUT', path, body); }
  async patch<T, B = unknown>(path: string, body?: B): Promise<T> { return this.request('PATCH', path, body); }
  async delete<T>(path: string): Promise<T> { return this.request('DELETE', path); }

  // === 财务管理 ===
  async getSettlementList(params: { page: number; page_size: number; merchant_id?: string; status?: string }): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/settlements?${new URLSearchParams(params as any)}`);
  }
  async getReconciliationItems(settlementId: string): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/settlements/${settlementId}/reconciliation`);
  }
  async getSplitRecords(settlementId: string): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/settlements/${settlementId}/splits`);
  }

  // === SCRM ===
  async getCustomerList(params: { page: number; page_size: number; keyword?: string; tag?: string }): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/customers?${new URLSearchParams(params as any)}`);
  }
  async getTagList(): Promise<any[]> { return this.request('GET', '/scrm/tags'); }
  async getSopList(): Promise<any[]> { return this.request('GET', '/scrm/sop'); }
  async getConversations(params: { customer_id?: string; page: number; page_size: number }): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/scrm/conversations?${new URLSearchParams(params as any)}`);
  }

  // === 运营管理 ===
  async getBannerList(): Promise<any[]> { return this.request('GET', '/banners'); }
  async getActivityList(params?: { page: number; page_size: number }): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/activities?${new URLSearchParams(params as any || {})}`);
  }
  async getTicketList(params: { page: number; page_size: number; status?: string }): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/tickets?${new URLSearchParams(params as any)}`);
  }
  async getComplaintList(params: { page: number; page_size: number; status?: string }): Promise<{ list: any[]; total: number }> {
    return this.request('GET', `/complaints?${new URLSearchParams(params as any)}`);
  }
}

class RealTransportAdapter implements ITransportAdapter {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<Function>> = new Map();
  private url = '';

  connect(): void {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${location.host}/ws`;
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (ev) => {
      try { const { event, payload } = JSON.parse(ev.data); this.handlers.get(event)?.forEach(h => h(payload)); } catch { /* ignore */ }
    };
    this.ws.onclose = () => { setTimeout(() => this.connect(), 3000); };
  }

  disconnect(): void { this.ws?.close(); this.ws = null; }
  send(event: string, payload: unknown): void { this.ws?.send(JSON.stringify({ event, payload })); }
  on<T>(event: string, handler: (data: T) => void): void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
  }
  off(event: string): void { this.handlers.delete(event); }
}

class RealStreamAdapter implements IStreamAdapter {
  private hls: any = null;
  startStream(url: string, canvas: HTMLCanvasElement): void { /* TODO: HLS.js 集成 */ }
  stopStream(): void {}
  takeSnapshot(): string | null { return null; }
}

class RealAssetAdapter implements IAssetAdapter {
  getAssetUrl(path: string): string { return path.startsWith('http') ? path : `${import.meta.env.VITE_OSS_BASE || ''}/${path}`; }
  async uploadFile(file: File): Promise<string> { const fd = new FormData(); fd.append('file', file); const res = await fetch('/api/v1/assets/upload', { method: 'POST', body: fd }); const json = await res.json(); return json.data.url; }
  async deleteFile(path: string): Promise<void> { await fetch(`/api/v1/assets?path=${encodeURIComponent(path)}`, { method: 'DELETE' }); }
}

class RealAuthAdapter implements IAuthAdapter {
  getToken(): string | null { return localStorage.getItem('sugarmate_token'); }
  setToken(token: string): void { localStorage.setItem('sugarmate_token', token); }
  clearToken(): void { localStorage.removeItem('sugarmate_token'); }
  isAuthenticated(): boolean { return !!this.getToken(); }
  async refreshToken(): Promise<string> { const res = await fetch('/api/v1/auth/refresh', { method: 'POST', headers: { Authorization: `Bearer ${this.getToken()}` } }); const j = await res.json(); this.setToken(j.data.access_token); return j.data.access_token; }
}

export function createRealAdapters(): AdapterSet {
  return {
    data: new RealDataAdapter(),
    transport: new RealTransportAdapter(),
    stream: new RealStreamAdapter(),
    asset: new RealAssetAdapter(),
    auth: new RealAuthAdapter(),
  };
}
