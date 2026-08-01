/**
 * SugarMate 订单流程路由服务 V1.0.0
 * 
 * 核心职责：根据订单中商品类型组合，决定订单走的子流程 + 混合订单拆单策略。
 * 
 * 对齐 PRD：
 * - SM-05 订单状态机（§7）
 * - SM-16 服务订单状态机（§7）
 * - BR-SUG-114 混合订单拆单规则（§11）
 * - §14.8.3 订单分流决策矩阵
 * 
 * 6 种商品类型 → 3 种订单流程：
 * ┌──────────────┬─────────────────────────────────────────────┐
 * │ 商品类型      │ 订单流程                                      │
 * ├──────────────┼─────────────────────────────────────────────┤
 * │ OTC/SUPPLE…  │ 标准实物流程：支付→处理→发货→签收→完成          │
 * │ DEVICE       │ 标准实物流程 + 注册证校验提示                    │
 * │ RX           │ 处方药流程：支付→处理→处方校验→发货→签收→完成    │
 * │ FOOD/DAILY   │ 标准实物流程                                   │
 * │ SERVICE      │ 服务流程(SM-16)：支付→签约/接单→服务→确认→完结   │
 * │ +cold_chain  │ 叠加冷链监控：配送中嵌入温控检查+异常分流         │
 * └──────────────┴─────────────────────────────────────────────┘
 */
import type {
  ProductType,
  OrderItem,
  OrderSplitStrategy,
  ColdChainConfig,
} from '@/contracts/trade';
import {
  isColdChainProduct,
  REQUIRES_RX_CHECK,
  PRODUCT_TYPE_LABEL,
} from '@/contracts/trade';
import {
  analyzeOrderMixTypes,
  getOrderPostPaymentState,
  PRODUCT_TYPE_ORDER_ROUTE,
  type MixedOrderScenario,
  type ProductTypeOrderRoute,
} from '@/contracts/state-machine/core';

// ============================================================
// §1 订单类型归类
// ============================================================

/** 订单的流程种类——决定走哪个状态机 */
export type OrderFlowType =
  | 'STANDARD'           // 标准实物订单（SM-05）——OTC/DEVICE/SUPPLEMENT/FOOD/DAILY
  | 'RX'                 // 处方药订单（SM-05 + SM-03处方校验分支）
  | 'SERVICE'            // 服务订单（SM-16）
  | 'MIXED_RX'           // 混合订单-含处方药（需拆单）
  | 'MIXED_SERVICE'      // 混合订单-含服务（必须拆单，不同状态机）
  | 'MIXED_COLD_CHAIN';  // 混合订单-含冷链+常温（提示拆单或统一冷链）

/** 订单聚合分析 */
export interface OrderTypeAnalysis {
  /** 订单流程类型 */
  flow_type: OrderFlowType;
  /** 包含的商品类型（去重） */
  product_types: ProductType[];
  /** 是否含处方药 */
  has_rx: boolean;
  /** 是否含冷链商品 */
  has_cold_chain: boolean;
  /** 是否含服务 */
  has_service: boolean;
  /** 支付后第一个业务状态 */
  post_payment_state: string;
  /** 是否需要拆单 */
  requires_split: boolean;
  /** 推荐的拆单策略 */
  recommended_split_strategy: OrderSplitStrategy;
  /** 拆单后子订单分组 */
  split_groups?: Array<{
    flow_type: 'STANDARD' | 'RX';
    items_indexes: number[];  // 原 items 数组索引
    label: string;
  }>;
}

// ============================================================
// §2 订单路由引擎
// ============================================================

/**
 * 分析订单商品，输出路由决策
 */
export function analyzeOrderRoute(items: OrderItem[]): OrderTypeAnalysis {
  const productTypes = items.map(i => i.product_type);
  const uniqueTypes = [...new Set(productTypes)];
  const hasRx = uniqueTypes.includes('RX');
  const hasService = uniqueTypes.includes('SERVICE');
  const hasColdChain = items.some(i => isColdChainProduct(i.cold_chain_config));

  // 场景判定
  const scenario = analyzeOrderMixTypes(productTypes);

  let flowType: OrderFlowType;
  let requiresSplit = false;
  let recommendedSplit: OrderSplitStrategy = 'NO_SPLIT';
  let splitGroups: OrderTypeAnalysis['split_groups'];

  switch (scenario) {
    case 'SINGLE_TYPE': {
      // 单一类型
      if (hasService) {
        flowType = 'SERVICE';
      } else if (hasRx) {
        flowType = 'RX';
      } else {
        flowType = 'STANDARD';
      }
      break;
    }
    case 'MIXED_WITH_RX': {
      // 处方药+其他——建议处方药独立子订单
      flowType = 'MIXED_RX';
      requiresSplit = true;
      recommendedSplit = 'SPLIT_BY_TYPE';
      splitGroups = buildSplitGroups(items, 'rx');
      break;
    }
    case 'MIXED_WITH_COLD_CHAIN': {
      // 冷链+常温——建议拆单或统一冷链
      flowType = 'MIXED_COLD_CHAIN';
      requiresSplit = true;
      recommendedSplit = splitGroups = undefined as any // 用户自选
        ? 'SPLIT_BY_TYPE'
        : 'UNIFIED_COLD_CHAIN';
      splitGroups = buildSplitGroups(items, 'cold_chain');
      break;
    }
    case 'MIXED_WITH_SERVICE': {
      // 服务+实物——必须拆单
      flowType = 'MIXED_SERVICE';
      requiresSplit = true;
      recommendedSplit = 'SPLIT_BY_TYPE';
      splitGroups = buildSplitGroups(items, 'service');
      break;
    }
    case 'COMPLEX_MIXED': {
      // 处方药+冷链+服务——多重拆单
      flowType = 'MIXED_RX'; // 先按处方药处理
      requiresSplit = true;
      recommendedSplit = 'SPLIT_BY_TYPE';
      splitGroups = buildSplitGroups(items, 'all');
      break;
    }
    default:
      flowType = 'STANDARD';
  }

  return {
    flow_type: flowType,
    product_types: uniqueTypes,
    has_rx: hasRx,
    has_cold_chain: hasColdChain,
    has_service: hasService,
    post_payment_state: getOrderPostPaymentState(hasRx),
    requires_split: requiresSplit,
    recommended_split_strategy: recommendedSplit,
    split_groups: splitGroups,
  };
}

// ============================================================
// §3 拆单分组算法（BR-SUG-114）
// ============================================================

/**
 * 根据拆单模式生成分组
 */
function buildSplitGroups(
  items: OrderItem[],
  mode: 'rx' | 'cold_chain' | 'service' | 'all'
): Array<{ flow_type: 'STANDARD' | 'RX'; items_indexes: number[]; label: string }> {
  const groups: Map<string, number[]> = new Map();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let key: string;

    switch (mode) {
      case 'rx':
        key = item.product_type === 'RX' ? '处方药' : '普通商品';
        break;
      case 'cold_chain':
        key = isColdChainProduct(item.cold_chain_config) ? '冷链商品' : '常温商品';
        break;
      case 'service':
        key = item.product_type === 'SERVICE' ? '服务' : '实物商品';
        break;
      case 'all':
        // 最细粒度：按类型各自拆
        key = PRODUCT_TYPE_LABEL[item.product_type] || item.product_type;
        break;
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(i);
  }

  return Array.from(groups.entries()).map(([label, indexes]) => {
    const hasRx = indexes.some(i => items[i].product_type === 'RX');
    return {
      flow_type: hasRx ? 'RX' : 'STANDARD',
      items_indexes: indexes,
      label,
    };
  });
}

// ============================================================
// §4 商品类型路由查询（单商品）
// ============================================================

/**
 * 查询单个商品类型的订单路由
 */
export function getProductTypeRoute(productType: ProductType): ProductTypeOrderRoute {
  return PRODUCT_TYPE_ORDER_ROUTE[productType];
}

/**
 * 判断商品是否可以在APP端直接下单
 * 处方药在APP端仅展示名称，需处方审核通过后下单
 */
export function canDirectOrder(productType: ProductType): boolean {
  return productType !== 'RX';
}

/**
 * 商品类型是否即服务（走SM-16）
 */
export function isServiceProduct(productType: ProductType): boolean {
  return productType === 'SERVICE';
}

/**
 * 订单状态下一阶段的用户提示文本
 */
export function getOrderNextActionHint(
  status: string,
  hasRx: boolean,
  hasColdChain: boolean,
): string {
  const hints: Record<string, string> = {
    PENDING_PAY: '请尽快完成支付，订单将在30分钟后自动取消',
    PAYING: '支付处理中，请勿关闭页面',
    PAID: '支付成功，订单处理中',
    PROCESSING: hasRx ? '订单含处方药，即将进入处方校验' : '药房正在处理您的订单',
    RX_CHECKING: '药剂师正在审核您的处方，预计1小时内完成',
    AWAITING_SHIP: '药房已接单，正在备货中',
    SHIPPED: hasColdChain ? '冷链配送中，请留意温度监控' : '商品配送中',
    COLD_CHAIN_EXCEPTION: '温控异常，我们正在为您安排补发',
    DELIVERED: '商品已签收，请确认收货',
    COMPLETED: '交易已完成',
    CANCELLED: '订单已取消',
    REFUNDING: '退款处理中',
    REFUNDED: '已退款',
  };
  return hints[status] || '';
}

// ============================================================
// §5 统计数据：每种商品类型在订单中的占比
// ============================================================

export interface ProductTypeStats {
  type: ProductType;
  label: string;
  count: number;
  percentage: number;
}

/**
 * 统计订单列表中各商品类型的分布
 */
export function calcProductTypeDistribution(items: OrderItem[]): ProductTypeStats[] {
  const typeCounts = new Map<ProductType, number>();
  let total = 0;

  for (const item of items) {
    const current = typeCounts.get(item.product_type) || 0;
    typeCounts.set(item.product_type, current + item.quantity);
    total += item.quantity;
  }

  return Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      label: PRODUCT_TYPE_LABEL[type],
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
