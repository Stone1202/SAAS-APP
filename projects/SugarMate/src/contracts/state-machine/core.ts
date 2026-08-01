/**
 * 状态机定义层 — 业务对象生命周期的状态机Schema V2.1.0
 * 
 * V2.1.0 变更（2026-07-30）：
 * - 新增 SM-CON-01 问诊服务订单状态机（18状态·SM-16增强）
 * - 新增 SM-03 处方状态机修正版（8状态·新增 AWAITING_PATIENT_CONFIRM 节点）
 * - 新增 validateConsultationTransition + validatePrescriptionTransition
 * 
 * V2.0.0 变更（2026-07-30）：
 * - 订单状态从9状态扩展至13状态（+RX_CHECKING / COLD_CHAIN_EXCEPTION / PAYING / AWAITING_SHIP）
 * - 新增 ORDER_ITEM_STATES（订单项级10状态）支持混合订单独立追踪
 * - 新增 ORDER_SPLIT_CONFIG（SM-05 商品类型路由矩阵）
 * - 新增 PRODUCT_TYPE_ORDER_ROUTE（6种商品类型→订单子流程路由规则）
 * - 新增 validateOrderTransition（含商品类型上下文的状态流转校验）
 * - 新增 ServiceOrderStates/SERVICE_ORDER_TRANSITIONS（SM-16 服务订单状态机）
 * 
 * 对齐 PRD：SM-05 订单状态机 + SM-16 服务订单状态机 + SM-CON-01 问诊服务订单 + SM-03 处方状态机 + §14.8 冷链配送
 */
import { z } from 'zod';
import type { ProductType } from '../trade';

// ============================================================
// §1 订单状态机（SM-05 完整版·13状态）
// ============================================================

export const ORDER_STATES = [
  'PENDING_PAY',             // 待付款
  'PAYING',                  // 支付中——调用支付网关
  'PAID',                    // 已支付
  'PROCESSING',              // 待处理——系统处理中
  'RX_CHECKING',             // 处方校验中——含处方药的订单在此等待药剂师审核
  'AWAITING_SHIP',           // 待发货——所有校验通过，等待药房发货
  'SHIPPED',                 // 配送中
  'COLD_CHAIN_EXCEPTION',    // 冷链异常——温控断链，等待补发或退款
  'DELIVERED',               // 已签收
  'COMPLETED',               // 已完成
  'CANCELLED',               // 已取消
  'REFUNDING',               // 退款中
  'REFUNDED',                // 已退款
] as const;

export const OrderStateSchema = z.enum(ORDER_STATES);

/**
 * 订单状态流转表（对齐 SM-05）
 * 
 * 标准流程：
 *   PENDING_PAY → PAYING → PAID → PROCESSING → (RX_CHECKING?) → AWAITING_SHIP → SHIPPED → DELIVERED → COMPLETED
 * 
 * 处方药分支：
 *   PROCESSING → RX_CHECKING → AWAITING_SHIP (通过) / REFUNDING (不通过)
 * 
 * 冷链异常分支：
 *   SHIPPED → COLD_CHAIN_EXCEPTION → SHIPPED (补发≤2) / REFUNDING (≥2次失败)
 * 
 * 退款分支：
 *   DELIVERED / COLD_CHAIN_EXCEPTION → REFUNDING → REFUNDED
 */
export const ORDER_TRANSITIONS: Record<string, string[]> = {
  // 下单&支付流程
  'PENDING_PAY':          ['PAYING', 'CANCELLED'],
  'PAYING':               ['PAID', 'CANCELLED'],
  'PAID':                 ['PROCESSING', 'REFUNDING'],

  // 核心流程——商品类型路由分叉点
  'PROCESSING':           ['RX_CHECKING', 'AWAITING_SHIP', 'CANCELLED'],
  //                        ↑含处方药      ↑普通商品      ↑超时取消
  'RX_CHECKING':          ['AWAITING_SHIP', 'REFUNDING'],
  //                        ↑处方校验通过    ↑处方无效
  'AWAITING_SHIP':        ['SHIPPED', 'CANCELLED', 'REFUNDING'],
  //                        ↑药房发货    ↑超时/缺货   ↑用户申请退款

  // 配送&签收
  'SHIPPED':              ['DELIVERED', 'COLD_CHAIN_EXCEPTION'],
  //                        ↑正常签收    ↑冷链断链
  'COLD_CHAIN_EXCEPTION': ['SHIPPED', 'REFUNDING'],
  //                        ↑补发(≤2次) ↑≥2次失败→退款
  'DELIVERED':            ['COMPLETED', 'REFUNDING'],
  //                        ↑确认收货    ↑申请退货

  // 终态
  'COMPLETED':            ['REFUNDING'],  // 完成后仍可申请售后
  'CANCELLED':            [],
  'REFUNDING':            ['REFUNDED'],
  'REFUNDED':             [],
};

// ============================================================
// §2 订单项级状态机（支持混合订单中每个商品独立追踪）
// ============================================================

export const ORDER_ITEM_STATES = [
  'PENDING',            // 待处理
  'RX_CHECKING',        // 处方校验中
  'RX_REJECTED',        // 处方校验不通过→该商品退款
  'AWAITING_SHIP',      // 待发货
  'SHIPPED',            // 已发货
  'COLD_CHAIN_ALERT',   // 冷链异常
  'DELIVERED',          // 已签收
  'REFUNDING',          // 退款中
  'REFUNDED',           // 已退款
  'CANCELLED',          // 已取消
] as const;

export const OrderItemStateSchema = z.enum(ORDER_ITEM_STATES);

export const ORDER_ITEM_TRANSITIONS: Record<string, string[]> = {
  'PENDING':            ['RX_CHECKING', 'AWAITING_SHIP', 'CANCELLED'],
  'RX_CHECKING':        ['RX_REJECTED', 'AWAITING_SHIP'],
  'RX_REJECTED':        ['REFUNDING'],
  'AWAITING_SHIP':      ['SHIPPED', 'CANCELLED', 'REFUNDING'],
  'SHIPPED':            ['DELIVERED', 'COLD_CHAIN_ALERT'],
  'COLD_CHAIN_ALERT':   ['SHIPPED', 'REFUNDING'],
  'DELIVERED':          ['REFUNDING'],
  'REFUNDING':          ['REFUNDED'],
  'REFUNDED':           [],
  'CANCELLED':          [],
};

// ============================================================
// §3 商品类型→订单流程路由规则
// ============================================================

/**
 * 商品类型×订单子流程路由矩阵
 * 
 * 每种商品类型决定订单需要经过哪些特殊处理环节：
 * 
 * | 商品类型    | 常规流程 | 处方校验 | 冷链配送 | 服务流程(SM-16) |
 * |-----------|---------|---------|---------|----------------|
 * | OTC       | ✅      | ❌      | ❌      | ❌              |
 * | RX        | ✅      | ✅      | 可能    | ❌              |
 * | DEVICE    | ✅      | ❌      | 可能    | ❌              |
 * | SUPPLEMENT| ✅      | ❌      | ❌      | ❌              |
 * | FOOD      | ✅      | ❌      | 可能    | ❌              |
 * | DAILY     | ✅      | ❌      | ❌      | ❌              |
 * | SERVICE   | ❌      | ❌      | ❌      | ✅              |
 */
export interface ProductTypeOrderRoute {
  /** 是否走标准实物订单流程（SM-05） */
  use_standard_flow: boolean;
  /** 是否需要处方校验（SM-03） */
  requires_rx_check: boolean;
  /** 是否可能涉及冷链 */
  may_involve_cold_chain: boolean;
  /** 是否走服务订单流程（SM-16） */
  use_service_flow: boolean;
}

export const PRODUCT_TYPE_ORDER_ROUTE: Record<ProductType, ProductTypeOrderRoute> = {
  OTC: {
    use_standard_flow: true,
    requires_rx_check: false,
    may_involve_cold_chain: false,
    use_service_flow: false,
  },
  RX: {
    use_standard_flow: true,
    requires_rx_check: true,          // 必经SM-03处方校验
    may_involve_cold_chain: true,     // 处方药可能含冷链（胰岛素等）
    use_service_flow: false,
  },
  DEVICE: {
    use_standard_flow: true,
    requires_rx_check: false,
    may_involve_cold_chain: true,     // 部分器械需冷链（CGM传感器等）
    use_service_flow: false,
  },
  SUPPLEMENT: {
    use_standard_flow: true,
    requires_rx_check: false,
    may_involve_cold_chain: false,
    use_service_flow: false,
  },
  FOOD: {
    use_standard_flow: true,
    requires_rx_check: false,
    may_involve_cold_chain: true,     // 冷链食品
    use_service_flow: false,
  },
  DAILY: {
    use_standard_flow: true,
    requires_rx_check: false,
    may_involve_cold_chain: false,
    use_service_flow: false,
  },
  SERVICE: {
    use_standard_flow: false,          // 不走SM-05
    requires_rx_check: false,
    may_involve_cold_chain: false,
    use_service_flow: true,           // 走SM-16服务订单流程
  },
};

// ============================================================
// §4 混合订单拆单规则（BR-SUG-114）
// ============================================================

/**
 * 混合订单场景分类
 * 
 * 根据 PRD §14.8.3 订单分流决策矩阵 + BR-SUG-114 混单处理规则：
 */
export type MixedOrderScenario = 
  | 'SINGLE_TYPE'           // 单一商品类型——不拆单
  | 'MIXED_WITH_RX'         // 含处方药+其他——处方药独立子订单（处方校验时效不同）
  | 'MIXED_WITH_COLD_CHAIN' // 含冷链+常温——提示拆单或统一冷链
  | 'MIXED_WITH_SERVICE'    // 含服务+实物——必须拆单（不同状态机）
  | 'COMPLEX_MIXED';        // 处方药+冷链+服务全混合——多重拆单

/**
 * 分析订单商品类型组合，返回混合场景
 */
export function analyzeOrderMixTypes(productTypes: ProductType[]): MixedOrderScenario {
  const unique = [...new Set(productTypes)];
  const hasRx = unique.includes('RX');
  const hasService = unique.includes('SERVICE');
  const hasColdChainCompatible = unique.some(t => 
    ['RX', 'DEVICE', 'FOOD'].includes(t)
  );
  
  if (unique.length === 1) return 'SINGLE_TYPE';
  
  if (hasRx && hasService) return 'COMPLEX_MIXED';
  if (hasRx && hasColdChainCompatible) return 'MIXED_WITH_RX';
  if (hasService) return 'MIXED_WITH_SERVICE';
  if (hasColdChainCompatible || unique.includes('OTC')) return 'MIXED_WITH_COLD_CHAIN';
  
  return 'SINGLE_TYPE';
}

// ============================================================
// §5 服务订单状态机（SM-16）
// ============================================================

export const SERVICE_ORDER_STATES = [
  'PENDING_PAY',       // 待支付
  'PAID',              // 已支付
  'ACTIVE',            // 签约生效（包月制）
  'IN_SERVICE',        // 服务周期中（包月制）/ 待服务（按次制）
  'SERVING',           // 服务中（按次制）
  'AWAITING_CONFIRM',  // 待确认（按次制）
  'PERIOD_EXPIRED',    // 周期到期（包月制）
  'RENEWING',          // 续费中（包月制）
  'USER_CANCEL',       // 用户解约（包月制）
  'ARBITRATION',       // 仲裁中
  'COMPLETED',         // 已完结
  'CANCELLED',         // 已取消
  'REFUNDED',          // 已退款
] as const;

export const ServiceOrderStateSchema = z.enum(SERVICE_ORDER_STATES);

export const SERVICE_ORDER_TRANSITIONS: Record<string, string[]> = {
  'PENDING_PAY':        ['PAID', 'CANCELLED'],
  'PAID':               ['ACTIVE', 'IN_SERVICE', 'REFUNDED'],
  // ↑                  包月制       按次制       用户取消(未接单)
  'ACTIVE':             ['IN_SERVICE'],
  'IN_SERVICE':         ['SERVING', 'PERIOD_EXPIRED', 'USER_CANCEL', 'ARBITRATION'],
  // ↑                   按次接单     包月到期       用户解约       仲裁
  'SERVING':            ['AWAITING_CONFIRM', 'REFUNDED', 'ARBITRATION'],
  // ↑                   提交成果       无法完成       仲裁
  'AWAITING_CONFIRM':   ['COMPLETED', 'SERVING'],
  // ↑                   确认/7天自动   退回修改(≤3次)
  'PERIOD_EXPIRED':     ['COMPLETED', 'RENEWING'],
  'RENEWING':           ['PENDING_PAY'],  // → 续费支付
  'USER_CANCEL':        ['REFUNDED'],     // → 按天退
  'ARBITRATION':        ['COMPLETED', 'REFUNDED'],
  'COMPLETED':          [],
  'CANCELLED':          [],
  'REFUNDED':           [],
};

// ============================================================
// §6 医生状态机
// ============================================================

export const DOCTOR_STATES = [
  'PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED',
] as const;

export const DoctorStateSchema = z.enum(DOCTOR_STATES);

export const DOCTOR_TRANSITIONS: Record<string, string[]> = {
  'PENDING': ['ACTIVE'],
  'ACTIVE': ['INACTIVE', 'SUSPENDED'],
  'INACTIVE': ['ACTIVE', 'SUSPENDED'],
  'SUSPENDED': ['ACTIVE'],
};

// ============================================================
// §7 商品状态机
// ============================================================

export const PRODUCT_STATES = [
  'DRAFT', 'AUDITING', 'AUDIT_REJECTED', 'ON_SHELF', 'OFF_SHELF',
] as const;

export const ProductStateSchema = z.enum(PRODUCT_STATES);

export const PRODUCT_TRANSITIONS: Record<string, string[]> = {
  'DRAFT': ['AUDITING'],
  'AUDITING': ['ON_SHELF', 'AUDIT_REJECTED'],
  'AUDIT_REJECTED': ['AUDITING'],
  'ON_SHELF': ['OFF_SHELF'],
  'OFF_SHELF': ['ON_SHELF'],
};

// ============================================================
// §8 入驻审核状态机
// ⚠️  DEPRECATED: V3.0.0 起入驻状态机以 onboardingStore.ts 中的
//    ONBOARDING_TRANSITIONS（12状态）为唯一事实源。
//    此处保留为文档参考，实际流转校验使用 onboardingStore 中的 canTransitionOnboard()。
//    12状态流转: DRAFT→PENDING→INFO_APPROVED→CERT_APPROVED→NEED_SUPPLEMENT
//               →REJECTED→APPROVED→SIGNING→SIGNED→ONLINE→FROZEN→WITHDRAWN
// ============================================================

/**
 * @deprecated 使用 onboardingStore.ts 中的 OnboardingApplicationStatus 和 ONBOARDING_TRANSITIONS
 */
export const ONBOARDING_STATES = [
  'DRAFT',            // 草稿
  'PENDING',          // 待审核
  'INFO_APPROVED',    // 信息审核通过
  'CERT_APPROVED',    // 资质审核通过
  'NEED_SUPPLEMENT',  // 需补充资料
  'REJECTED',         // 已驳回（终态）
  'APPROVED',         // 审核通过
  'SIGNING',          // 待签约
  'SIGNED',           // 已签约
  'ONLINE',           // 已上线
  'FROZEN',           // 已冻结
  'WITHDRAWN',        // 已退回
] as const;

export const OnboardingStateSchema = z.enum(ONBOARDING_STATES);

// ============================================================
// §9 状态流转验证工具
// ============================================================

/**
 * 通用状态流转校验
 */
export function canTransition<T extends string>(
  currentState: T,
  targetState: T,
  transitions: Record<string, string[]>
): boolean {
  return (transitions[currentState] || []).includes(targetState);
}

/**
 * 订单状态流转校验（含商品类型上下文）
 * 
 * 某些状态流转仅对特定商品类型有效：
 * - PROCESSING → RX_CHECKING：仅当订单含处方药时有效
 * - SHIPPED → COLD_CHAIN_EXCEPTION：仅当订单含冷链商品时有效
 */
export function validateOrderTransition(
  currentStatus: string,
  targetStatus: string,
  context: {
    hasRxItem: boolean;
    hasColdChainItem: boolean;
  }
): { valid: boolean; reason?: string } {
  // 基本流转校验
  if (!canTransition(currentStatus, targetStatus, ORDER_TRANSITIONS)) {
    return { valid: false, reason: `状态流转 [${currentStatus} → ${targetStatus}] 不被允许` };
  }

  // 商品类型上下文校验
  if (currentStatus === 'PROCESSING' && targetStatus === 'RX_CHECKING') {
    if (!context.hasRxItem) {
      return { valid: false, reason: '订单不含处方药，不能进入处方校验' };
    }
  }

  if (currentStatus === 'SHIPPED' && targetStatus === 'COLD_CHAIN_EXCEPTION') {
    if (!context.hasColdChainItem) {
      return { valid: false, reason: '订单不含冷链商品，不能进入冷链异常' };
    }
  }

  return { valid: true };
}

/**
 * 根据商品类型路由决定订单支付后的第一个业务状态
 */
export function getOrderPostPaymentState(hasRx: boolean): string {
  return hasRx ? 'RX_CHECKING' : 'AWAITING_SHIP';
}

// ============================================================
// §10 SM-CON-01 问诊服务订单状态机（18状态·SM-16增强）
// ============================================================

/**
 * SM-CON-01 问诊服务订单完整状态流转
 *
 * 标准流程:
 *   CREATED → PAID → PENDING_ACCEPT → ACCEPTED → IN_CONSULT
 *   → WAITING_PATIENT_CONFIRM → PATIENT_CONFIRMED
 *   → RECOMMENDATION_SHOWN → EVALUATED（终态）
 *
 * 处方分支（从IN_CONSULT分叉）:
 *   IN_CONSULT → PENDING_PRESCRIPTION → PRESCRIPTION_SUBMITTED
 *   → PRESCRIPTION_SIGNED → PRESCRIPTION_APPROVED → RX_AWAITING_PATIENT
 *   → RX_PATIENT_ACCEPTED / RX_PATIENT_REJECTED（→DRAFT回到医生）
 *   → PRESCRIPTION_FLOWING
 *
 * 异常分支:
 *   PENDING_ACCEPT → TIMEOUT_REFUNDED (48h无接诊)
 *   WAITING_PATIENT_CONFIRM → TIMEOUT_REFUNDED (7天无确认)
 *   (任意活跃状态) → DISPUTING → ARBITRATING → PARTIAL_REFUNDED
 *   RX_AWAITING_PATIENT → TIMEOUT_REFUNDED (72h患者未确认处方)
 */
export const CONSULTATION_ORDER_STATES = [
  'CREATED',
  'PAID',
  'PENDING_ACCEPT',
  'ACCEPTED',
  'IN_CONSULT',
  'PENDING_PRESCRIPTION',
  'PRESCRIPTION_SUBMITTED',
  'PRESCRIPTION_SIGNED',
  'PRESCRIPTION_APPROVED',
  'RX_AWAITING_PATIENT',
  'RX_PATIENT_ACCEPTED',
  'RX_PATIENT_REJECTED',
  'PRESCRIPTION_FLOWING',
  'WAITING_PATIENT_CONFIRM',
  'PATIENT_CONFIRMED',
  'RECOMMENDATION_SHOWN',
  'EVALUATED',
  'TIMEOUT_REFUNDED',
  'DISPUTING',
  'ARBITRATING',
  'PARTIAL_REFUNDED',
] as const;

export const ConsultationOrderStateSchema = z.enum(CONSULTATION_ORDER_STATES);
export type ConsultationOrderState = z.infer<typeof ConsultationOrderStateSchema>;

/**
 * SM-CON-01 问诊订单状态流转表
 */
export const CONSULTATION_ORDER_TRANSITIONS: Record<string, string[]> = {
  // 下单&支付
  'CREATED':              ['PAID', 'TIMEOUT_REFUNDED'],
  //                         ↑支付成功  ↑超时未支付（30min）
  'PAID':                 ['PENDING_ACCEPT'],
  //                         ↑资金托管中

  // 接诊
  'PENDING_ACCEPT':       ['ACCEPTED', 'TIMEOUT_REFUNDED'],
  //                         ↑医生接诊   ↑48h超时退款

  // 核心问诊
  'ACCEPTED':             ['IN_CONSULT'],
  //                         ↑双方进入对话
  'IN_CONSULT':           ['PENDING_PRESCRIPTION', 'WAITING_PATIENT_CONFIRM', 'DISPUTING'],
  //                         ↑医生准备开方            ↑医生直接完结            ↑纠纷

  // 处方分支（SM-03联动）
  'PENDING_PRESCRIPTION': ['PRESCRIPTION_SUBMITTED'],
  'PRESCRIPTION_SUBMITTED': ['PRESCRIPTION_SIGNED', 'PENDING_PRESCRIPTION'],
  //                          ↑CA签名完成             ↑医生修改
  'PRESCRIPTION_SIGNED':  ['PRESCRIPTION_APPROVED'],
  'PRESCRIPTION_APPROVED': ['RX_AWAITING_PATIENT'],
  //                          ↑推送给患者确认
  'RX_AWAITING_PATIENT':  ['RX_PATIENT_ACCEPTED', 'RX_PATIENT_REJECTED', 'TIMEOUT_REFUNDED'],
  //                         ↑患者同意                ↑患者拒绝→医生修改      ↑72h超时
  'RX_PATIENT_ACCEPTED':  ['PRESCRIPTION_FLOWING', 'IN_CONSULT'],
  //                         ↑处方流转药房              ↑继续问诊
  'RX_PATIENT_REJECTED':  ['PENDING_PRESCRIPTION', 'IN_CONSULT'],
  //                         ↑医生修改重提              ↑跳过处方继续问诊
  'PRESCRIPTION_FLOWING': ['IN_CONSULT', 'WAITING_PATIENT_CONFIRM'],
  //                         ↑返回问诊    ↑医生完结

  // 完结&确认
  'WAITING_PATIENT_CONFIRM': ['PATIENT_CONFIRMED', 'TIMEOUT_REFUNDED', 'DISPUTING'],
  //                            ↑患者确认              ↑7天自动确认退款     ↑纠纷
  'PATIENT_CONFIRMED':    ['RECOMMENDATION_SHOWN'],
  //                         ↑推荐引擎生成推荐
  'RECOMMENDATION_SHOWN': ['EVALUATED'],
  //                         ↑患者评价

  // 纠纷&仲裁
  'DISPUTING':            ['ARBITRATING', 'PATIENT_CONFIRMED', 'IN_CONSULT'],
  //                         ↑平台介入仲裁  ↑双方和解         ↑恢复问诊
  'ARBITRATING':          ['PARTIAL_REFUNDED', 'PATIENT_CONFIRMED'],
  //                         ↑部分退款           ↑驳回申诉·正常完结

  // 终态
  'EVALUATED':            [],
  'TIMEOUT_REFUNDED':     [],
  'PARTIAL_REFUNDED':     [],
};

/**
 * 问诊状态流转校验（含处方上下文）
 */
export function validateConsultationTransition(
  currentState: ConsultationOrderState,
  targetState: ConsultationOrderState,
  context: {
    hasPrescription: boolean;
    prescriptionState?: string;
  }
): { valid: boolean; reason?: string } {
  const allowed = CONSULTATION_ORDER_TRANSITIONS[currentState];
  if (!allowed || !allowed.includes(targetState)) {
    return { valid: false, reason: `问诊状态流转 [${currentState} → ${targetState}] 不被允许` };
  }

  // 处方分支上下文校验
  if (targetState === 'PENDING_PRESCRIPTION' && context.hasPrescription) {
    // 已有有效处方时不应重复进入
    return { valid: false, reason: '当前问诊已有有效处方，不可重复开具' };
  }

  if (targetState === 'RX_AWAITING_PATIENT' && context.prescriptionState !== 'AWAITING_PATIENT_CONFIRM') {
    return { valid: false, reason: '处方必须先完成审核才能推送给患者确认' };
  }

  return { valid: true };
}

// ============================================================
// §11 SM-03 处方状态机（修正版·8状态）
// ============================================================

/**
 * SM-03 处方状态机（V2.0.0 · 处方→订单全链路）
 *
 * V2.0.0 变更（2026-07-31）：
 *   - 新增 ORDER_CREATED：患者确认并下单后，订单已创建
 *   - 新增 PATIENT_REJECTED：患者拒绝处方（独立节点，≤3次回退）
 *   - 新增 OUT_OF_STOCK：药房接单后发现库存不足
 *   - 新增 PHARMACY_SWITCHING：患者重新选药房
 *   - PATIENT_AGREED → 仅确认暂不下单（7天有效期），后续使用处方下单→ORDER_CREATED
 *   - PATIENT_AGREED → 7天未下单 → EXPIRED
 *
 * 合规依据：《互联网诊疗管理办法》规定处方药流转必须经患者确认
 *
 * 标准流程（路径A·确认并下单）:
 *   DRAFT → SUBMITTED → CA_SIGNED → PENDING_AUDIT
 *   → AWAITING_PATIENT_CONFIRM → ORDER_CREATED → FLOWING → DISPENSED
 *
 * 标准流程（路径B·仅确认暂不下单）:
 *   DRAFT → SUBMITTED → CA_SIGNED → PENDING_AUDIT
 *   → AWAITING_PATIENT_CONFIRM → PATIENT_AGREED → [7天内下单] → ORDER_CREATED → FLOWING
 *   → AWAITING_PATIENT_CONFIRM → PATIENT_AGREED → [7天未下单] → EXPIRED
 *
 * 患者拒绝:
 *   AWAITING_PATIENT_CONFIRM → PATIENT_REJECTED → DRAFT（医生修改重提·<3次）
 *   PATIENT_REJECTED → [3次上限] → REVOKED（强制作废）
 *
 * 超时:
 *   AWAITING_PATIENT_CONFIRM → [timeout_72h] → EXPIRED
 *
 * 药房缺货:
 *   FLOWING → [药房接单缺货] → OUT_OF_STOCK → PHARMACY_SWITCHING → FLOWING（换药房）
 *   OUT_OF_STOCK → DRAFT（退回医生换药）
 */
export const PRESCRIPTION_STATES = [
  'DRAFT',                    // 草稿（医生编辑中）
  'SUBMITTED',               // 已提交
  'CA_SIGNED',               // CA电子签名完成
  'PENDING_AUDIT',           // 待药师审核
  'AWAITING_PATIENT_CONFIRM', // 待患者确认（72h倒计时）
  'PATIENT_AGREED',          // V2.0.0：仅确认·暂不下单（7天有效期）
  'PATIENT_REJECTED',        // V2.0.0：患者拒绝处方（累计次数<3可回退）
  'ORDER_CREATED',           // V2.0.0：订单已创建（确认并下单后）
  'FLOWING',                 // 处方流转中（关联订单流转）
  'OUT_OF_STOCK',            // V2.0.0：药房缺货
  'PHARMACY_SWITCHING',      // V2.0.0：更换药房中
  'DISPENSED',               // 已配药
  'EXPIRED',                 // 已过期
  'REVOKED',                 // 已作废（拒绝≥3次/医生撤回）
] as const;

export const PrescriptionStateSchema = z.enum(PRESCRIPTION_STATES);
export type PrescriptionState = z.infer<typeof PrescriptionStateSchema>;

export const PRESCRIPTION_STATE_LABEL: Record<PrescriptionState, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  CA_SIGNED: 'CA已签名',
  PENDING_AUDIT: '待审核',
  AWAITING_PATIENT_CONFIRM: '待患者确认',
  PATIENT_AGREED: '患者已确认',
  PATIENT_REJECTED: '患者已拒绝',
  ORDER_CREATED: '订单已创建',
  FLOWING: '流转中',
  OUT_OF_STOCK: '药房缺货',
  PHARMACY_SWITCHING: '更换药房中',
  DISPENSED: '已配药',
  EXPIRED: '已过期',
  REVOKED: '已作废',
};

export const PRESCRIPTION_TRANSITIONS: Record<string, string[]> = {
  // 开具
  'DRAFT':              ['SUBMITTED', 'REVOKED'],
  SUBMITTED:            ['CA_SIGNED', 'DRAFT'],

  // CA签名
  'CA_SIGNED':          ['PENDING_AUDIT'],

  // 审核
  'PENDING_AUDIT':      ['AWAITING_PATIENT_CONFIRM', 'DRAFT', 'REVOKED'],

  // 患者确认（V2.0.0增强·双路径）
  'AWAITING_PATIENT_CONFIRM': ['ORDER_CREATED', 'PATIENT_AGREED', 'PATIENT_REJECTED', 'EXPIRED'],
  //                            ↑确认并下单        ↑仅确认暂不下单    ↑拒绝              ↑72h超时

  // 仅确认暂不下单（V2.0.0新增）
  'PATIENT_AGREED':     ['ORDER_CREATED', 'EXPIRED'],
  //                      ↑7天内使用处方下单  ↑7天未下单过期

  // 患者拒绝（V2.0.0新增）
  'PATIENT_REJECTED':   ['DRAFT', 'REVOKED'],
  //                      ↑医生修改重提(<3次)  ↑≥3次强制作废

  // 订单已创建（V2.0.0新增）
  'ORDER_CREATED':      ['FLOWING'],
  //                      ↑订单关联处方流转到药房

  // 流转&异常（V2.0.0增强）
  'FLOWING':            ['DISPENSED', 'OUT_OF_STOCK', 'EXPIRED'],
  //                      ↑配药完成    ↑药房缺货        ↑订单取消/超时
  'OUT_OF_STOCK':       ['PHARMACY_SWITCHING', 'DRAFT'],
  //                      ↑患者换药房                  ↑退回医生换药
  'PHARMACY_SWITCHING': ['FLOWING'],
  //                      ↑新药房接单

  // 终态
  'DISPENSED':          [],
  'EXPIRED':            [],
  'REVOKED':            [],
};

/**
 * 处方状态流转校验
 */
export function validatePrescriptionTransition(
  currentState: PrescriptionState,
  targetState: PrescriptionState,
  context: {
    isFirstVisit: boolean;
  }
): { valid: boolean; reason?: string } {
  const allowed = PRESCRIPTION_TRANSITIONS[currentState];
  if (!allowed || !allowed.includes(targetState)) {
    return { valid: false, reason: `处方状态流转 [${currentState} → ${targetState}] 不被允许` };
  }

  // 首诊禁开方
  if (currentState === 'DRAFT' && targetState === 'SUBMITTED' && context.isFirstVisit) {
    return { valid: false, reason: '首诊患者禁止线上开方（BR-CON-001·互联网诊疗管理办法）' };
  }

  return { valid: true };
}

// ============================================================
// §12 类型导出
// ============================================================

export type OrderState = z.infer<typeof OrderStateSchema>;
export type OrderItemState = z.infer<typeof OrderItemStateSchema>;
export type DoctorState = z.infer<typeof DoctorStateSchema>;
export type ProductState = z.infer<typeof ProductStateSchema>;
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
export type ServiceOrderState = z.infer<typeof ServiceOrderStateSchema>;
