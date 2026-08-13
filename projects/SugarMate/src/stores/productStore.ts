/**
 * SugarMate 商品管理状态（Zustand）
 */
import { create } from 'zustand';
import { getAdapters } from '@/adapters/factory';
import { notifyProductChanged } from './syncEngine';

// === 商品 ===
export interface Product {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  images: string[];
  description: string;
  specifications: ProductSpec[];
  price: number;
  market_price: number;
  stock: number;
  /** V2.1.0 新增：商品类型 */
  product_type: 'DEVICE' | 'OTC' | 'RX' | 'FOOD' | 'DAILY' | 'SERVICE';
  is_otc: boolean;
  otc_license_no?: string;
  /** V2.1.0 新增：冷链配置 */
  cold_chain_config?: {
    required: boolean;
    type: 'COLD' | 'FROZEN' | 'NONE';
    storage_spec?: string;
    transport_duration_max?: number;
    package_type?: 'INSULATED_BOX' | 'REFRIGERATED_VEHICLE' | 'NONE';
    break_action?: 'DESTROY_ON_BREAK' | 'REASSESS_ON_BREAK' | 'VISUAL_ONLY';
    max_resend_count?: number;
  };
  merchant_id: string;
  merchant_name: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ON_SHELF' | 'OFF_SHELF' | 'BANNED';
  sales_count: number;
  /** V2.1.0 新增：商品评分 */
  rating?: number;
  created_at: number;
  updated_at: number;
}

export interface ProductSpec {
  id: string;
  name: string;
  value: string;
  price_override?: number;
  stock: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  parent_id?: string;
  icon?: string;
  sort_order: number;
  product_count: number;
}

interface ProductState {
  products: Product[];
  total: number;
  categories: ProductCategory[];
  currentProduct: Product | null;
  loading: boolean;
  activeFilter: Record<string, any>; // 当前筛选条件（供同步引擎重新加载）

  loadProducts: (params?: { page?: number; page_size?: number; status?: string; keyword?: string }) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadProductDetail: (productId: string) => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  toggleProductStatus: (productId: string, status: 'DRAFT' | 'PENDING_REVIEW' | 'ON_SHELF' | 'OFF_SHELF' | 'BANNED') => Promise<void>;
  batchOperation: (ids: string[], action: 'DELETE' | 'ON_SHELF' | 'OFF_SHELF') => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  total: 0,
  categories: [],
  currentProduct: null,
  loading: false,
  activeFilter: {},

  loadProducts: async (params = {}) => {
    set({ loading: true, activeFilter: params }); // 保存筛选条件供同步引擎使用
    try {
      const { data } = await getAdapters();
      const res = await data.getProductList({
        page: params.page || 1,
        page_size: params.page_size || 20,
        status: params.status,
        keyword: params.keyword,
      });
      set({ products: res.list, total: res.total, loading: false });
    } catch { set({ loading: false }); }
  },

  loadCategories: async () => {
    try {
      const { data } = await getAdapters();
      const cats = await data.getProductCategories();
      set({ categories: cats });
    } catch { /* ignore */ }
  },

  loadProductDetail: async (productId) => {
    set({ loading: true });
    try {
      const { data } = await getAdapters();
      const product = await data.getProductDetail(productId);
      set({ currentProduct: product, loading: false });
    } catch { set({ loading: false }); }
  },

  createProduct: async (product) => {
    const { data } = await getAdapters();
    const newProduct = await data.createProduct(product);
    set({ products: [newProduct, ...get().products] });
    notifyProductChanged(); // 链路C：触发跨标签页商品同步
    return newProduct;
  },

  updateProduct: async (productId, updates) => {
    const { data } = await getAdapters();
    await data.updateProduct(productId, updates);
    set({
      products: get().products.map(p =>
        p.id === productId ? { ...p, ...updates, updated_at: Date.now() / 1000 } : p
      ),
    });
    notifyProductChanged(); // 链路C：触发跨标签页商品同步
  },

  toggleProductStatus: async (productId, status) => {
    const { data } = await getAdapters();
    await data.toggleProductStatus(productId, status);
    set({
      products: get().products.map(p =>
        p.id === productId ? { ...p, status } : p
      ),
    });
    notifyProductChanged(); // 链路C：触发跨标签页商品同步
  },

  batchOperation: async (ids, action) => {
    const { data } = await getAdapters();
    await data.batchProducts(ids, action);
    if (action === 'DELETE') {
      set({ products: get().products.filter(p => !ids.includes(p.id)) });
    } else {
      const targetStatus = action === 'ON_SHELF' ? 'ON_SHELF' : 'OFF_SHELF';
      set({
        products: get().products.map(p =>
          ids.includes(p.id) ? { ...p, status: targetStatus as Product['status'] } : p
        ),
      });
    }
    notifyProductChanged(); // 链路C：触发跨标签页商品同步
  },
}));
