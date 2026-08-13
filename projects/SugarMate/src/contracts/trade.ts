/**
 * SugarMate 交易中心契约 V2.0.0
 * 
 * V2.0.0 变更（2026-07-30）：
 * - 新增 ProductType 商品类型枚举（OTC/RX/DEVICE/SUPPLEMENT/FOOD/DAILY/SERVICE）
 * - 新增 ColdChainConfig 冷链配置（对齐PRD §14.8.1）
 * - OrderItemSchema 增强：product_type + cold_chain_config + item_status（订单项级子状态）
 * - OrderStatus 从10状态扩展至12状态（新增 RX_CHECKING / COLD_CHAIN_EXCEPTION）
 * - 新增 OrderSplitConfig / OrderRoutingResult（商品类型路由+混合订单拆单）
 * - 新增 ServiceOrderType（SM-16 服务订单：包月制/按次制）
 * 
 * 对应架构设计：API契约 §4 交易中心 API
 * 对应 PRD：SM-05 订单状态机 + §14.8 冷链配送 + SM-16 服务订单状态机
 */
import { z } from 'zod';

// ============================================================
// §1 商品类型体系（对齐PRD UC-SUG-PC-012 + BR-SUG-076~079）
// ============================================================

/** 商品大类——决定订单流程路由的核心维度 */
export const ProductTypeEnum = z.enum([
  'OTC',          // OTC药品（甲类/乙类）——走常规订单流程
  'RX',           // 处方药——需SM-03处方校验子流程
  'DEVICE',       // 医疗器械（I/II/III类）——走常规流程+注册证校验
  'SUPPLEMENT',   // 保健品——走常规流程+批准文号校验
  'FOOD',         // 食品（含代餐/低GI等）——走常规流程
  'DAILY',        // 日用——走常规流程
  'SERVICE',      // 服务（问诊/营养师按次/营养师包月）——走SM-16服务订单流程
]);

export type ProductType = z.infer<typeof ProductTypeEnum>;

/** 商品类型的中文显示名 */
export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  OTC: 'OTC药品',
  RX: '处方药',
  DEVICE: '医疗器械',
  SUPPLEMENT: '保健品',
  FOOD: '食品',
  DAILY: '日用品',
  SERVICE: '服务',
};

/** 商品类型是否需要处方校验 */
export const REQUIRES_RX_CHECK: Record<ProductType, boolean> = {
  OTC: false,
  RX: true,       // 仅处方药需要
  DEVICE: false,
  SUPPLEMENT: false,
  FOOD: false,
  DAILY: false,
  SERVICE: false,
};

// ============================================================
// §2 冷链配置（对齐PRD §14.8.1 商品级冷链标记体系）
// ============================================================

export const ColdChainTypeEnum = z.enum([
  'COLD',     // 冷藏 2~8°C
  'FROZEN',   // 冷冻 -25~-15°C
  'NONE',     // 非冷链
]);

export const ColdChainPackageEnum = z.enum([
  'INSULATED_BOX',         // 保温箱+冰排
  'REFRIGERATED_VEHICLE',  // 冷藏车
  'NONE',                  // 无特殊包装
]);

export const ColdChainBreakActionEnum = z.enum([
  'DESTROY_ON_BREAK',      // 断链即销毁（胰岛素等）
  'REASSESS_ON_BREAK',     // 断链后评估（部分器械）
  'VISUAL_ONLY',           // 仅目视检查
]);

/** 商品冷链属性 */
export const ColdChainConfigSchema = z.object({
  required: z.boolean(),                              // 是否需要冷链
  type: ColdChainTypeEnum,                            // 冷链类型
  storage_spec: z.string(),                           // 存储温区规范，如「2~8°C避光」
  transport_duration_max: z.number().int().min(0),    // 最大运输时长（分钟），如2880=48h
  package_type: ColdChainPackageEnum,                  // 包装方式
  break_action: ColdChainBreakActionEnum,              // 断链处理方式
  max_resend_count: z.number().int().min(0).default(2), // 最大补发次数
});

export type ColdChainType = z.infer<typeof ColdChainTypeEnum>;
export type ColdChainConfig = z.infer<typeof ColdChainConfigSchema>;

/** 判断是否为冷链商品 */
export function isColdChainProduct(config?: ColdChainConfig | null): boolean {
  return config?.required === true && config.type !== 'NONE';
}

// ============================================================
// §3 订单项级子状态（支持混合订单中每个商品独立跟踪）
// ============================================================

/** 订单项级状态——每个OrderItem在订单流转过程中独立的状态 */
export const OrderItemStateEnum = z.enum([
  'PENDING',            // 待处理（下单后默认）
  'RX_CHECKING',        // 处方校验中（仅RX商品）
  'RX_REJECTED',        // 处方校验不通过（触发该商品退款）
  'AWAITING_SHIP',      // 待发货
  'SHIPPED',            // 已发货
  'COLD_CHAIN_ALERT',   // 冷链异常
  'DELIVERED',          // 已签收
  'REFUNDING',          // 退款中
  'REFUNDED',           // 已退款
  'CANCELLED',          // 已取消
]);

export type OrderItemState = z.infer<typeof OrderItemStateEnum>;

/** 订单项级状态的中文标签 */
export const ORDER_ITEM_STATE_LABEL: Record<OrderItemState, string> = {
  PENDING: '待处理',
  RX_CHECKING: '处方校验中',
  RX_REJECTED: '处方未通过',
  AWAITING_SHIP: '待发货',
  SHIPPED: '已发货',
  COLD_CHAIN_ALERT: '温控异常',
  DELIVERED: '已签收',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
  CANCELLED: '已取消',
};

// ============================================================
// §4 订单项（增强版 V2.0.0）
// ============================================================

export const OrderItemSchema = z.object({
  product_id: z.string(),
  sku_id: z.string(),
  product_name: z.string(),
  product_image: z.string().optional(),
  /** V2.0.0 新增：商品类型——决定订单路由 */
  product_type: ProductTypeEnum,
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  /** V2.0.0 新增：处方引用——处方药必填 */
  prescription_ref: z.string().optional(),
  /** V2.0.0 新增：冷链配置——冷链商品必填 */
  cold_chain_config: ColdChainConfigSchema.optional().nullable(),
  /** V2.0.0 新增：订单项级子状态——支持混合订单独立追踪 */
  item_status: OrderItemStateEnum.default('PENDING'),
  /** V2.0.0 新增：子订单号——混合订单拆单后每个子包的独立编号 */
  sub_order_no: z.string().optional(),
  /** V2.0.0 新增：关联主订单号 */
  parent_order_no: z.string().optional(),
});

// ============================================================
// §5 下单请求（增强版 V2.0.0）
// ============================================================

/** 混合订单拆单策略——用户在下单时的选择 */
export const OrderSplitStrategyEnum = z.enum([
  'UNIFIED_COLD_CHAIN',   // 统一冷链——所有商品按冷链标准配送
  'SPLIT_BY_TYPE',        // 按商品类型拆单——冷链独立+常温独立
  'NO_SPLIT',             // 不拆单——仅含单一类型商品时使用
]);

export type OrderSplitStrategy = z.infer<typeof OrderSplitStrategyEnum>;

export const CreateOrderRequest = z.object({
  items: z.array(OrderItemSchema).min(1),
  address_id: z.string(),
  coupon_code: z.string().optional(),
  use_point: z.number().int().min(0).optional(),
  remark: z.string().optional(),
  client_order_id: z.string(), // 幂等键
  /** V2.0.0 新增：混合订单拆单策略——冷链+常温混单时必选 */
  split_strategy: OrderSplitStrategyEnum.optional(),
});

/** V2.0.0 处方→订单请求 */
export const CreatePrescriptionOrderRequest = z.object({
  prescription_id: z.string(),
  items: z.array(OrderItemSchema).min(1),
  address_id: z.string(),
  seller_id: z.string(),           // 医生所属药店ID
  /** 混合处方拆单：非处方子订单 */
  sub_orders: z.array(z.object({
    items: z.array(OrderItemSchema),
  })).optional(),
  source: z.literal('PRESCRIPTION'),
  source_ref: z.string(),          // prescription_id
  order_scenario: z.enum(['SINGLE_TYPE', 'MIXED_WITH_RX', 'MIXED_NO_RX', 'CONTAINS_SERVICE']),
});

// ============================================================
// §6 订单状态枚举（SM-05 完整12状态）
// ============================================================

/** 
 * 订单状态（对齐PRD SM-05 订单状态机）
 * 
 * 标准流程：PENDING_PAY → PAID → PROCESSING → (RX_CHECKING?) → AWAITING_SHIP → SHIPPED → DELIVERED → COMPLETED
 * 冷链异常：SHIPPED → COLD_CHAIN_EXCEPTION → SHIPPED(补发≤2) / REFUNDING(≥2次失败)
 * 退款流程：DELIVERED/COLD_CHAIN_EXCEPTION → REFUNDING → REFUNDED
 */
export const OrderStatusEnum = z.enum([
  'PENDING_PAY',             // 待付款
  'PAYING',                  // 支付中（调用支付网关）
  'PAID',                    // 已支付
  'PROCESSING',              // 待处理（支付完成→系统处理中）
  'RX_CHECKING',             // V2.0.0新增：处方校验中（含处方药的订单必经）
  'AWAITING_SHIP',           // 待发货（所有校验通过，等待药房发货）
  'SHIPPED',                 // 已发货（配送中）
  'COLD_CHAIN_EXCEPTION',    // V2.0.0新增：冷链异常（含冷链商品的订单温控断链）
  'DELIVERED',               // 已签收
  'COMPLETED',               // 已完成
  'CANCELLED',               // 已取消
  'REFUNDING',               // 退款中
  'REFUNDED',                // 已退款
]);

export type OrderStatus = z.infer<typeof OrderStatusEnum>;

/** 订单状态中文标签 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAY: '待付款',
  PAYING: '支付中',
  PAID: '已支付',
  PROCESSING: '待处理',
  RX_CHECKING: '处方校验中',
  AWAITING_SHIP: '待发货',
  SHIPPED: '配送中',
  COLD_CHAIN_EXCEPTION: '温控异常',
  DELIVERED: '已签收',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
};

/** 订单状态是否属于终态 */
export function isOrderFinalStatus(status: OrderStatus): boolean {
  return ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(status);
}

/** 订单状态是否属于可操作状态（用户/商家可触发下一步） */
export function isOrderActionableStatus(status: OrderStatus): boolean {
  return !isOrderFinalStatus(status);
}

// ============================================================
// §7 订单主模型（增强版 V2.0.0）
// ============================================================

export const OrderSchema = z.object({
  id: z.string(),
  order_no: z.string(),
  buyer_id: z.string(),
  seller_id: z.string(),
  items: z.array(OrderItemSchema),
  total_amount: z.number(),
  discount_amount: z.number().default(0),
  pay_amount: z.number(),
  status: OrderStatusEnum,
  pay_channel: z.enum(['YEEPAY', 'WECHAT']).optional(),
  transaction_id: z.string().optional(),
  address: z.record(z.any()).optional(),
  logistics: z.record(z.any()).optional(),
  created_at: z.number(),
  updated_at: z.number(),
  
  // V2.0.0 新增字段
  /** 订单包含的商品类型列表（去重）——用于前端快速判断路由 */
  product_types: z.array(ProductTypeEnum).optional(),
  /** 是否含处方药——前端快速判断是否需要展示处方校验进度 */
  has_rx_item: z.boolean().default(false),
  /** 是否含冷链商品——前端快速判断是否需要展示温控信息 */
  has_cold_chain_item: z.boolean().default(false),
  /** 订单拆分后的子订单列表 */
  sub_orders: z.array(z.object({
    sub_order_no: z.string(),
    items: z.array(z.string()),  // item product_ids
    status: OrderStatusEnum,
  })).optional(),
  /** 冷链补发计数 */
  cold_chain_resend_count: z.number().int().default(0),
  /** 处方校验结果 */
  rx_check_result: z.object({
    passed: z.boolean(),
    checked_at: z.number().optional(),
    pharmacist_id: z.string().optional(),
    reject_reason: z.string().optional(),
  }).optional(),
  /** 订单时间线 */
  timeline: z.array(z.object({
    time: z.number(),
    event: z.string(),
    operator: z.string().optional(),
    status: OrderStatusEnum,
  })).optional(),
});

// ============================================================
// §8 支付相关（保持兼容）
// ============================================================

export const PaymentRequest = z.object({
  order_id: z.string(),
  channel: z.enum(['YEEPAY', 'WECHAT']),
  return_url: z.string(),
});

export const PaymentResponse = z.object({
  pay_url: z.string().optional(),
  wechat_pay_params: z.record(z.any()).optional(),
  transaction_id: z.string(),
  expires_in: z.number(),
});

// ============================================================
// §9 退款相关（增强版 V2.0.0）
// ============================================================

export const RefundRequest = z.object({
  order_id: z.string(),
  reason: z.string().min(1),
  images: z.array(z.string()).optional(),
  refund_amount: z.number().min(0),
  /** V2.0.0 新增：部分退款时指定退货商品列表 */
  refund_items: z.array(z.string()).optional(), // product_ids to refund
  /** V2.0.0 新增：售后类型 */
  refund_type: z.enum([
    'REFUND_ONLY',        // 仅退款
    'RETURN_REFUND',      // 退货退款
    'EXCHANGE',           // 换货
    'ADR_REPORT',         // 药品不良反应上报
    'DRUG_RECALL',        // 药品召回
  ]).default('REFUND_ONLY'),
});

export const RefundResponse = z.object({
  refund_id: z.string(),
  status: z.enum(['PROCESSING', 'NEED_APPROVAL', 'APPROVED', 'REJECTED']),
  need_approval: z.boolean(),
});

// ============================================================
// §10 查询相关
// ============================================================

export const OrderListQuery = z.object({
  status: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER']).optional(),
  /** V2.0.0 新增：按商品类型筛选 */
  product_type: ProductTypeEnum.optional(),
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(50).default(20),
});

// ============================================================
// §11 服务订单类型（SM-16）
// ============================================================

export const ServiceOrderTypeEnum = z.enum([
  'SUBSCRIPTION',   // 包月制——签约→服务周期→续费/解约
  'PER_SESSION',    // 按次制——接单→服务→确认→完结
]);

export type ServiceOrderType = z.infer<typeof ServiceOrderTypeEnum>;

/** 服务订单的额外字段 */
export const ServiceOrderExtrasSchema = z.object({
  service_type: ServiceOrderTypeEnum,
  /** 包月制相关 */
  subscription_start: z.number().optional(),   // 签约生效时间
  subscription_end: z.number().optional(),     // 服务周期结束时间
  auto_renew: z.boolean().default(false),      // 是否自动续费
  daily_refund_ratio: z.number().optional(),   // 按天退款比例
  /** 按次制相关 */
  service_deadline: z.number().optional(),     // 48h接单截止时间
  confirm_deadline: z.number().optional(),     // 7天确认截止时间
  max_revision: z.number().int().default(3),   // 最大退回修改次数
  revision_count: z.number().int().default(0), // 当前退回次数
});

// ============================================================
// §12 类型导出
// ============================================================

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequest>;
export type CreatePrescriptionOrderRequest = z.infer<typeof CreatePrescriptionOrderRequest>;
export type Order = z.infer<typeof OrderSchema>;
export type PaymentRequest = z.infer<typeof PaymentRequest>;
export type PaymentResponse = z.infer<typeof PaymentResponse>;
export type RefundRequest = z.infer<typeof RefundRequest>;
export type RefundResponse = z.infer<typeof RefundResponse>;
export type OrderListQuery = z.infer<typeof OrderListQuery>;
export type ServiceOrderExtras = z.infer<typeof ServiceOrderExtrasSchema>;
