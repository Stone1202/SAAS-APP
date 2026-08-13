/**
 * SugarMate 订单状态管理 V2.0.0（Zustand + 商品类型路由）
 * 
 * V2.0.0 变更（2026-07-30）：
 * - 集成 order-router 服务，加载订单后自动分析商品类型路由
 * - 新增 orderAnalysis 字段：实时反映订单的流程类型和拆单策略
 * - 新增 canCancelOrder / canRefundOrder 基于状态机的操作权限判断
 */
import { create } from 'zustand';
import { getAdapters } from '@/adapters/factory';
import type { Order, CreateOrderRequest, CreatePrescriptionOrderRequest, RefundRequest, RefundResponse } from '@contracts/trade';
import {
  analyzeOrderRoute,
  canDirectOrder,
  getOrderNextActionHint,
  type OrderTypeAnalysis,
} from '@/services/order-router';
import {
  validateOrderTransition,
} from '@contracts/state-machine/core';

interface OrderState {
  orders: Order[];
  total: number;
  loading: boolean;
  currentOrder: Order | null;
  /** V2.0.0 新增：当前订单的商品类型路由分析 */
  orderAnalysis: OrderTypeAnalysis | null;

  loadOrders: (params?: { status?: string; role?: string; page?: number; page_size?: number; product_type?: string }) => Promise<void>;
  loadOrderDetail: (orderId: string) => Promise<void>;
  createOrder: (req: CreateOrderRequest) => Promise<{ order: Order; analysis: OrderTypeAnalysis }>;
  /** V2.0.0 新增：处方→订单创建·含自动拆单 */
  createPrescriptionOrder: (req: CreatePrescriptionOrderRequest) => Promise<{ order: Order; analysis: OrderTypeAnalysis }>;
  refund: (req: RefundRequest) => Promise<RefundResponse>;

  /** V2.2.1 新增：药店履约操作 */
  fulfillOrder: (orderId: string) => Promise<void>;
  shipOrder: (orderId: string) => Promise<void>;

  /** V2.0.0 新增：状态操作 */
  canCancelOrder: (order: Order) => { allowed: boolean; reason?: string };
  canRefundOrder: (order: Order) => { allowed: boolean; reason?: string };
  /** V2.2.2 新增：履约/发货前审方校验 */
  canFulfillOrder: (order: Order) => { allowed: boolean; reason?: string };
  canShipOrder: (order: Order) => { allowed: boolean; reason?: string };
  getOrderHint: (order: Order) => string;

  setOrderAnalysis: (analysis: OrderTypeAnalysis | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  total: 0,
  loading: false,
  currentOrder: null,
  orderAnalysis: null,

  loadOrders: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await getAdapters();
      const res = await data.getOrderList({
        page: params.page || 1,
        page_size: params.page_size || 20,
        status: params.status,
        role: params.role,
        product_type: params.product_type,
      });
      set({ orders: res.list, total: res.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadOrderDetail: async (orderId) => {
    set({ loading: true });
    try {
      const { data } = await getAdapters();
      const order = await data.getOrderDetail(orderId);
      // 自动分析商品类型路由
      const analysis = order.items?.length
        ? analyzeOrderRoute(order.items)
        : null;
      set({ currentOrder: order, orderAnalysis: analysis, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createOrder: async (req) => {
    const { data } = await getAdapters();
    const analysis = analyzeOrderRoute(req.items);
    const order = await data.post<Order>('/orders', req);
    return { order, analysis };
  },

  /** V2.0.0：处方→订单创建·含混合处方自动拆单 */
  createPrescriptionOrder: async (req) => {
    const { data } = await getAdapters();
    const now = Date.now();
    const orderId = `ord-${now}-${Math.random().toString(36).slice(2, 7)}`;

    // 分析商品类型路由
    const analysis = analyzeOrderRoute(req.items);

    // 构建子订单（混合处方拆单）
    const subOrders: any[] = [];
    if (req.sub_orders && req.sub_orders.length > 0) {
      for (const sub of req.sub_orders) {
        subOrders.push({
          sub_order_no: `sub-${orderId}-${Math.random().toString(36).slice(2, 5)}`,
          items: sub.items,
          order_type: 'NON_RX' as const,
          status: 'PENDING_PAY' as const,
        });
      }
    }

    // RX子订单
    const rxSubOrder = {
      sub_order_no: `sub-${orderId}-rx`,
      items: req.items.filter(i => i.product_type === 'RX'),
      order_type: 'RX' as const,
      status: 'RX_CHECKING' as const,
    };

    const order: Order = {
      id: orderId,
      items: req.items,
      sub_orders: [...(subOrders.length > 0 ? subOrders : []), rxSubOrder],
      status: analysis.has_rx ? 'RX_CHECKING' : 'PENDING_PAY',
      pay_amount: req.items.reduce((sum, i) => sum + (i.unit_price || 0) * i.quantity, 0),
      total_amount: req.items.reduce((sum, i) => sum + (i.unit_price || 0) * i.quantity, 0),
      buyer_id: '',
      seller_id: req.seller_id,
      address_id: req.address_id,
      source: 'PRESCRIPTION' as any,
      source_ref: req.source_ref,
      has_rx_item: analysis.has_rx,
      // 处方确认时已完成药师审方 → 自动标记审方通过
      rx_check_result: analysis.has_rx ? { passed: true, checked_at: now } : undefined,
      timeline: [{ time: now, from: 'CREATED', to: 'PENDING_PAY', operator: 'SYSTEM', remark: '处方订单·自动生成' }],
      created_at: now,
      updated_at: now,
    } as Order;

    await data.post<Order>('/orders', order as any);
    return { order, analysis };
  },

  refund: async (req) => {
    const { data } = await getAdapters();
    return data.post<RefundResponse>('/orders/refund', req);
  },

  // === V2.2.1 药店履约操作 ===

  fulfillOrder: async (orderId) => {
    const { orders, canFulfillOrder } = get();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const check = canFulfillOrder(order);
      if (!check.allowed) throw new Error(check.reason);
    }
    const { data } = await getAdapters();
    await data.post('/orders/fulfill', { order_id: orderId });
    await get().loadOrders();
  },

  shipOrder: async (orderId) => {
    const { orders, canShipOrder } = get();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const check = canShipOrder(order);
      if (!check.allowed) throw new Error(check.reason);
    }
    const { data } = await getAdapters();
    await data.post('/orders/ship', { order_id: orderId });
    await get().loadOrders();
  },

  // === 状态操作权限 ===

  canCancelOrder: (order: Order) => {
    if (!order.items?.length) return { allowed: false, reason: '订单数据不完整' };
    const analysis = analyzeOrderRoute(order.items);
    const validation = validateOrderTransition(
      order.status, 'CANCELLED',
      { hasRxItem: analysis.has_rx, hasColdChainItem: analysis.has_cold_chain }
    );
    if (!validation.valid) return { allowed: false, reason: validation.reason };
    return { allowed: true };
  },

  canRefundOrder: (order: Order) => {
    if (!order.items?.length) return { allowed: false, reason: '订单数据不完整' };
    const analysis = analyzeOrderRoute(order.items);
    const validation = validateOrderTransition(
      order.status, 'REFUNDING',
      { hasRxItem: analysis.has_rx, hasColdChainItem: analysis.has_cold_chain }
    );
    if (!validation.valid) return { allowed: false, reason: validation.reason };
    return { allowed: true };
  },

  /** V2.2.2 校验处方药订单是否已通过药师审方 */
  canFulfillOrder: (order: Order) => {
    // 无处方药商品 → 直接允许
    if (!(order as any).has_rx_item) return { allowed: true };
    // 有处方药商品，必须已经药师审方通过
    const rxResult = (order as any).rx_check_result;
    if (!rxResult) {
      return { allowed: false, reason: '该订单含处方药，需等待药师审方通过后方可履约' };
    }
    if (!rxResult.passed) {
      return { allowed: false, reason: `药师审方未通过${rxResult.reject_reason ? `：${rxResult.reject_reason}` : ''}` };
    }
    return { allowed: true };
  },

  /** V2.2.2 校验处方药订单是否已通过药师审方+履约已完成 */
  canShipOrder: (order: Order) => {
    // 先校验审方
    const rxCheck = get().canFulfillOrder(order);
    if (!rxCheck.allowed) return rxCheck;
    // 再校验履约状态：必须是 FULFILLED 才能发货
    const stage = (order as any).fulfillment_stage;
    if (stage !== 'FULFILLED') {
      return { allowed: false, reason: '订单履约尚未完成，请先完成履约再发货' };
    }
    return { allowed: true };
  },

  getOrderHint: (order: Order) => {
    if (!order.items?.length) return '';
    const analysis = analyzeOrderRoute(order.items);
    return getOrderNextActionHint(order.status, analysis.has_rx, analysis.has_cold_chain);
  },

  setOrderAnalysis: (analysis) => set({ orderAnalysis: analysis }),
}));
