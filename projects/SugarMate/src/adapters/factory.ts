/**
 * SugarMate 可插拔适配器层
 * 对应架构设计：五维可插拔架构（data/transport/stream/asset/auth）
 * VITE_MODE=sim → SimAdapters | VITE_MODE=real → RealAdapters
 */

import type { Account, Identity, LoginResponse } from '../contracts/user';
import type { Order, ProductType, ColdChainConfig } from '../contracts/trade';

// === 商品类型 ===
/**
 * ProductData V2.0.0（2026-07-30）
 * - product_type: 商品大类（替代旧字段 is_otc），决定订单流程路由
 * - cold_chain_config: 冷链属性配置（对齐PRD §14.8.1）
 * - is_otc: [弃用] 保留兼容，新代码请用 product_type
 */
export interface ProductData {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  images: string[];
  description: string;
  specifications: { id: string; name: string; value: string; price_override?: number; stock: number }[];
  price: number;
  market_price: number;
  stock: number;
  /** V2.0.0 新增：商品类型——决定订单流程路由 */
  product_type: ProductType;
  /** [弃用] 保留兼容，代码优先使用 product_type */
  is_otc: boolean;
  otc_license_no?: string;
  /** V2.0.0 新增：冷链配置——仅product_type=RX|DEVICE|FOOD时有效 */
  cold_chain_config?: ColdChainConfig | null;
  merchant_id: string;
  merchant_name: string;
  status: 'DRAFT' | 'ON_SHELF' | 'OFF_SHELF' | 'BANNED';
  sales_count: number;
  /** V2.0.0 新增：商品评分 1.0~5.0，APP端展示用 */
  rating?: number;
  created_at: number;
  updated_at: number;
}

export interface ProductCategoryData {
  id: string;
  name: string;
  parent_id?: string;
  icon?: string;
  sort_order: number;
  product_count: number;
}

// === 五维适配器接口 ===

/** 数据适配器：Restful API / IndexedDB */
export interface IDataAdapter {
  // User
  login(phone: string, code: string, platform: string, deviceId: string): Promise<LoginResponse>;
  getAccount(accountId: string): Promise<Account>;
  getIdentities(accountId: string): Promise<Identity[]>;
  activateIdentity(identityId: string): Promise<{ identity_role: string; view_menu: string[]; permissions: string[] }>;

  // Trade
  getOrderList(params: { status?: string; role?: string; page: number; page_size: number }): Promise<{ list: Order[]; total: number }>;
  getOrderDetail(orderId: string): Promise<Order>;

  // Product (商品管理——统一商品中心)
  getProductList(params: { page: number; page_size: number; status?: string; keyword?: string }): Promise<{ list: ProductData[]; total: number }>;
  getProductDetail(productId: string): Promise<ProductData>;
  getProductCategories(): Promise<ProductCategoryData[]>;
  createProduct(product: Partial<ProductData>): Promise<ProductData>;
  updateProduct(productId: string, updates: Partial<ProductData>): Promise<void>;
  toggleProductStatus(productId: string, status: 'ON_SHELF' | 'OFF_SHELF'): Promise<void>;
  batchProducts(ids: string[], action: 'DELETE' | 'ON_SHELF' | 'OFF_SHELF'): Promise<void>;

  // Finance (财务结算)
  getSettlementList(params: { page: number; page_size: number; merchant_id?: string; status?: string }): Promise<{ list: any[]; total: number }>;
  getReconciliationItems(settlementId: string): Promise<{ list: any[]; total: number }>;
  getSplitRecords(settlementId: string): Promise<{ list: any[]; total: number }>;

  // SCRM (客户运营)
  getCustomerList(params: { page: number; page_size: number; keyword?: string; tag?: string }): Promise<{ list: any[]; total: number }>;
  getTagList(): Promise<any[]>;
  getSopList(): Promise<any[]>;
  getConversations(params: { customer_id?: string; page: number; page_size: number }): Promise<{ list: any[]; total: number }>;

  // Operations (运营管理)
  getBannerList(): Promise<any[]>;
  getActivityList(params?: { page: number; page_size: number }): Promise<{ list: any[]; total: number }>;
  getTicketList(params: { page: number; page_size: number; status?: string }): Promise<{ list: any[]; total: number }>;
  getComplaintList(params: { page: number; page_size: number; status?: string }): Promise<{ list: any[]; total: number }>;

  // Generic
  get<T>(path: string): Promise<T>;
  post<T, B = unknown>(path: string, body?: B): Promise<T>;
  put<T, B = unknown>(path: string, body?: B): Promise<T>;
  patch<T, B = unknown>(path: string, body?: B): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

/** 传输适配器：WebSocket / BroadCastChannel */
export interface ITransportAdapter {
  connect(): void;
  disconnect(): void;
  send(event: string, payload: unknown): void;
  on<T>(event: string, handler: (data: T) => void): void;
  off(event: string): void;
}

/** 流媒体适配器：HLS / Canvas */
export interface IStreamAdapter {
  startStream(url: string, canvas: HTMLCanvasElement): void;
  stopStream(): void;
  takeSnapshot(): string | null;
}

/** 素材适配器：OSS / Local */
export interface IAssetAdapter {
  getAssetUrl(path: string): string;
  uploadFile(file: File): Promise<string>;
  deleteFile(path: string): Promise<void>;
}

/** 认证适配器：JWT / Mock */
export interface IAuthAdapter {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  isAuthenticated(): boolean;
  refreshToken(): Promise<string>;
}

// === 适配器工厂 ===

export interface AdapterSet {
  data: IDataAdapter;
  transport: ITransportAdapter;
  stream: IStreamAdapter;
  asset: IAssetAdapter;
  auth: IAuthAdapter;
}

let adapters: AdapterSet | null = null;

export async function getAdapters(): Promise<AdapterSet> {
  if (adapters) return adapters;

  const mode = import.meta.env.VITE_MODE || 'sim';
  const moduleOverride = import.meta.env.VITE_MODE_OVERRIDE as string | undefined;

  if (mode === 'sim' || moduleOverride) {
    const { createSimAdapters } = await import('./sim');
    adapters = createSimAdapters();
  } else {
    const { createRealAdapters } = await import('./real');
    adapters = createRealAdapters();
  }

  return adapters!;
}

export function resetAdapters(): void {
  adapters = null;
}
