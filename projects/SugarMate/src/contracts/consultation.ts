/**
 * SugarMate 在线问诊契约 V1.0.0
 *
 * 对应 PRD: 06-在线问诊-PRD-v1.0.0.md
 * 对应状态机: SM-CON-01（问诊服务订单·18状态）+ SM-03修正版（处方·8状态）
 *
 * V1.0.0 实体:
 *   §1 ConsultationOrder (问诊订单·关联SM-05+SM-CON-01双重状态)
 *   §2 ConsultationMessage (问诊消息·图文+系统通知+CGM分享)
 *   §3 Prescription (电子处方·SM-03修正版)
 *   §4 PatientHealthArchive (患者健康档案·字段级授权)
 *   §5 ArchiveAuthorization (档案授权记录)
 *   §6 PostConsultRecommend (问诊后推荐)
 *   §7 辅助类型: ConsultationServiceSku/DoctorProfile/PharmacyPrice/PreConsultForm
 */
import { z } from 'zod';

// ============================================================
// §1 问诊类型与支付方式枚举
// ============================================================

/** 问诊方式 */
export const ConsultationModeEnum = z.enum([
  'TEXT_IMAGE', // 图文问诊
  'VOICE',      // 语音问诊（v1.1.0）
  'VIDEO',      // 视频问诊（v1.1.0）
]);
export type ConsultationMode = z.infer<typeof ConsultationModeEnum>;

/** 问诊紧急程度 */
export const ConsultationUrgencyEnum = z.enum([
  'NORMAL', // 普通
  'URGENT', // 紧急（加价）
  'SOS',    // SOS快速问诊（CGM危急值触发）
]);
export type ConsultationUrgency = z.infer<typeof ConsultationUrgencyEnum>;

// ============================================================
// §2 问诊服务SKU（医生创建的问诊服务商品）
// ============================================================

export const ConsultationServiceStatusEnum = z.enum([
  'AUDITING',       // 审核中
  'APPROVED',       // 已上架
  'REJECTED',       // 审核驳回
  'SUSPENDED',      // 已下架
]);
export type ConsultationServiceStatus = z.infer<typeof ConsultationServiceStatusEnum>;

export const ConsultationServiceSkuSchema = z.object({
  id: z.string(),
  doctor_id: z.string(),
  doctor_name: z.string(),
  title: z.string(),                        // 服务标题，如「糖尿病管理图文问诊」
  description: z.string(),
  mode: ConsultationModeEnum,              // 问诊方式
  price: z.number().min(0),                // 问诊价格（分）
  urgency_surcharge: z.number().default(0), // 紧急加价（分）
  response_time_minutes: z.number(),        // 承诺响应时间（分钟）
  department: z.string(),                   // 科室，如「内分泌科」
  tags: z.array(z.string()).default([]),    // 标签：糖尿病/甲亢/妊娠糖尿病...
  status: ConsultationServiceStatusEnum,
  rating: z.number().min(0).max(5).default(0),
  order_count: z.number().int().default(0), // 累计接诊量
  created_at: z.number(),
  updated_at: z.number(),
});
export type ConsultationServiceSku = z.infer<typeof ConsultationServiceSkuSchema>;

// ============================================================
// §3 问诊订单（关联SM-05 + SM-CON-01双重状态）
// ============================================================

/**
 * SM-CON-01 问诊服务订单状态（18状态）
 *
 * 标准流程:
 *   CREATED → PAID → PENDING_ACCEPT → ACCEPTED → IN_CONSULT
 *   → WAITING_PATIENT_CONFIRM → PATIENT_CONFIRMED
 *   → RECOMMENDATION_SHOWN → EVALUATED
 *
 * 处方分支:
 *   IN_CONSULT → PENDING_PRESCRIPTION → PRESCRIPTION_SUBMITTED
 *   → RX_AWAITING_PATIENT → RX_PATIENT_ACCEPTED / RX_PATIENT_REJECTED(→DRAFT)
 *   → PRESCRIPTION_FLOWING
 *
 * 异常分支:
 *   PENDING_ACCEPT → TIMEOUT_REFUNDED (48h无人接诊)
 *   WAITING_PATIENT_CONFIRM → TIMEOUT_CONFIRMED (7天自动确认)
 *   (任意活跃状态) → DISPUTING → ARBITRATING → PARTIAL_REFUNDED
 */
export const CONSULTATION_ORDER_STATES = [
  'CREATED',               // 订单已创建
  'PAID',                  // 已支付（资金托管中）
  'PENDING_ACCEPT',        // 待医生接诊（48h倒计时）
  'ACCEPTED',              // 医生已接诊
  'IN_CONSULT',            // 问诊对话中
  'PENDING_PRESCRIPTION',  // 待开处方（医生操作中）
  'PRESCRIPTION_SUBMITTED', // 处方已开具（待CA签名）
  'PRESCRIPTION_SIGNED',   // CA签名完成（待审核）
  'PRESCRIPTION_APPROVED', // 处方审核通过（待患者确认）
  'RX_AWAITING_PATIENT',   // 处方待患者确认
  'RX_PATIENT_ACCEPTED',   // 患者同意处方
  'RX_PATIENT_REJECTED',   // 患者拒绝处方（医生可修改重提）
  'PRESCRIPTION_FLOWING',  // 处方流转中（推送给药房）
  'WAITING_PATIENT_CONFIRM', // 等待患者确认问诊完结
  'PATIENT_CONFIRMED',      // 患者确认完结（资金释放）
  'RECOMMENDATION_SHOWN',   // 推荐商品已展示
  'EVALUATED',              // 已评价（终态）
  // 异常分支
  'TIMEOUT_REFUNDED',       // 超时退款
  'DISPUTING',              // 纠纷中
  'ARBITRATING',            // 平台仲裁中
  'PARTIAL_REFUNDED',       // 部分退款
] as const;

export const ConsultationOrderStateSchema = z.enum(CONSULTATION_ORDER_STATES);
export type ConsultationOrderState = z.infer<typeof ConsultationOrderStateSchema>;

/** 问诊订单状态中文标签 */
export const CONSULTATION_ORDER_STATE_LABEL: Record<ConsultationOrderState, string> = {
  CREATED: '已创建',
  PAID: '已支付',
  PENDING_ACCEPT: '等待接诊',
  ACCEPTED: '已接诊',
  IN_CONSULT: '问诊中',
  PENDING_PRESCRIPTION: '待开方',
  PRESCRIPTION_SUBMITTED: '处方已开具',
  PRESCRIPTION_SIGNED: 'CA已签名',
  PRESCRIPTION_APPROVED: '处方已审核',
  RX_AWAITING_PATIENT: '待患者确认处方',
  RX_PATIENT_ACCEPTED: '患者已同意处方',
  RX_PATIENT_REJECTED: '患者已拒绝处方',
  PRESCRIPTION_FLOWING: '处方流转中',
  WAITING_PATIENT_CONFIRM: '待患者确认',
  PATIENT_CONFIRMED: '患者已确认',
  RECOMMENDATION_SHOWN: '已推荐',
  EVALUATED: '已评价',
  TIMEOUT_REFUNDED: '超时退款',
  DISPUTING: '纠纷中',
  ARBITRATING: '仲裁中',
  PARTIAL_REFUNDED: '部分退款',
};

/** 是否为问诊终态 */
export function isConsultationFinal(state: ConsultationOrderState): boolean {
  return ['EVALUATED', 'TIMEOUT_REFUNDED', 'PARTIAL_REFUNDED'].includes(state);
}

/** 患者是否可操作 */
export function isPatientActionable(state: ConsultationOrderState): boolean {
  return [
    'CREATED', 'PENDING_ACCEPT', 'IN_CONSULT',
    'RX_AWAITING_PATIENT', 'WAITING_PATIENT_CONFIRM', 'RECOMMENDATION_SHOWN',
    'PATIENT_CONFIRMED',
  ].includes(state);
}

/** 医生是否可操作 */
export function isDoctorActionable(state: ConsultationOrderState): boolean {
  return [
    'PENDING_ACCEPT', 'ACCEPTED', 'IN_CONSULT',
    'PENDING_PRESCRIPTION', 'RX_PATIENT_REJECTED',
    'PRESCRIPTION_FLOWING',
  ].includes(state);
}

// ============================================================
// §4 问诊订单实体
// ============================================================

export const ConsultationOrderSchema = z.object({
  id: z.string(),
  /** 关联SM-16服务订单ID（共享状态机） */
  service_order_id: z.string(),
  /** 关联SM-05实物订单ID（处方流转后创建的RX订单） */
  trade_order_id: z.string().optional(),
  doctor_id: z.string(),
  patient_id: z.string(),
  patient_name: z.string(),
  sku_id: z.string(),
  /** SM-CON-01核心状态 */
  status: ConsultationOrderStateSchema,
  /** 问诊方式 */
  mode: ConsultationModeEnum,
  urgency: ConsultationUrgencyEnum.default('NORMAL'),
  /** 金额（分） */
  price: z.number().min(0),
  urgency_surcharge: z.number().default(0),
  paid_amount: z.number().min(0).default(0),
  /** 定时器 */
  accept_deadline: z.number().optional(),   // 48h接诊截止
  confirm_deadline: z.number().optional(),  // 7天确认截止
  /** 关联数据 */
  prescription_id: z.string().optional(),   // 关联处方
  recommend_ids: z.array(z.string()).default([]),
  evaluation_id: z.string().optional(),
  /** 状态时间线 */
  timeline: z.array(z.object({
    time: z.number(),
    from: z.string(),
    to: z.string(),
    operator: z.enum(['PATIENT', 'DOCTOR', 'SYSTEM', 'ADMIN', 'CA_SYSTEM', 'PHARMACIST']),
    remark: z.string().optional(),
  })).default([]),
  created_at: z.number(),
  updated_at: z.number(),
});
export type ConsultationOrder = z.infer<typeof ConsultationOrderSchema>;

// ============================================================
// §5 问诊消息
// ============================================================

export const MessageTypeEnum = z.enum([
  'TEXT',          // 文本
  'IMAGE',         // 图片
  'CGM_SHARE',     // CGM数据分享
  'SYSTEM_NOTIFY', // 系统通知（接诊/超时/处方状态等）
  'PRESCRIPTION_CARD', // 处方卡片消息
  'RECOMMEND_CARD',    // 推荐卡片消息
]);
export type MessageType = z.infer<typeof MessageTypeEnum>;

export const MessageSenderEnum = z.enum([
  'PATIENT', 'DOCTOR', 'SYSTEM',
]);
export type MessageSender = z.infer<typeof MessageSenderEnum>;

export const ConsultationMessageSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  sender: MessageSenderEnum,
  type: MessageTypeEnum,
  content: z.string(),
  /** 图片消息 */
  image_url: z.string().optional(),
  image_thumb: z.string().optional(),
  /** CGM分享 */
  cgm_data: z.object({
    glucose_level: z.number(),
    trend: z.enum(['UP', 'DOWN', 'STABLE']),
    time_range: z.string(),
    chart_url: z.string().optional(),
  }).optional(),
  /** 处方卡片 */
  prescription_ref: z.string().optional(),
  /** 推荐卡片 */
  recommend_ref: z.string().optional(),
  /** 幂等键 */
  idempotent_key: z.string(),
  /** 消息状态 */
  delivered: z.boolean().default(false),
  read_at: z.number().optional(),
  created_at: z.number(),
});
export type ConsultationMessage = z.infer<typeof ConsultationMessageSchema>;

// ============================================================
// §6 电子处方（SM-03修正版·8状态）
// ============================================================

/**
 * SM-03 处方状态机（修正版·8状态 → V2.0.0·14状态）
 *
 * V2.0.0 新增: ORDER_CREATED, PATIENT_REJECTED, OUT_OF_STOCK, PHARMACY_SWITCHING
 *
 * 标准流程（路径A·确认并下单）:
 *   DRAFT → SUBMITTED → CA_SIGNED → PENDING_AUDIT
 *   → AWAITING_PATIENT_CONFIRM → ORDER_CREATED → FLOWING → DISPENSED
 *
 * 标准流程（路径B·仅确认暂不下单）:
 *   → AWAITING_PATIENT_CONFIRM → PATIENT_AGREED → [7天内下单] → ORDER_CREATED
 */
export const PRESCRIPTION_STATES = [
  'DRAFT',                    // 草稿（医生编辑中）
  'SUBMITTED',               // 已提交
  'CA_SIGNED',               // CA电子签名完成
  'PENDING_AUDIT',           // 待药师审核
  'AWAITING_PATIENT_CONFIRM', // 待患者确认
  'PATIENT_AGREED',          // 仅确认·暂不下单
  'PATIENT_REJECTED',        // V2.0.0：患者拒绝处方
  'ORDER_CREATED',           // V2.0.0：订单已创建
  'FLOWING',                 // 处方流转中（推送给药房）
  'OUT_OF_STOCK',            // V2.0.0：药房缺货
  'PHARMACY_SWITCHING',      // V2.0.0：更换药房中
  'DISPENSED',               // 已配药
  // 终结态
  'EXPIRED',                 // 处方过期（72h未确认/7天未使用）
  'REVOKED',                 // 医生撤回 / 拒绝≥3次强制作废
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

// ============================================================
// §6.1 处方明细（V2.0.0）
// ============================================================

export const PrescriptionItemSchema = z.object({
  product_id: z.string(),
  sku_id: z.string(),
  product_type: z.enum(['RX', 'OTC', 'DEVICE', 'FOOD', 'DAILY', 'SERVICE']),
  drug_name: z.string(),
  generic_name: z.string(),
  specification: z.string(),
  strength: z.string().optional(),
  dosage: z.string(),
  frequency: z.string(),
  quantity: z.number().int().min(1),
  duration_days: z.number().int(),
  unit_price: z.number().min(0).optional(),
  cold_chain_config: z.object({
    required: z.boolean(),
    temp_min: z.number().optional(),
    temp_max: z.number().optional(),
    break_action: z.enum(['HOLD', 'RESEND', 'REFUND']).optional(),
  }).optional(),
  notes: z.string().default(''),
});
export type PrescriptionItem = z.infer<typeof PrescriptionItemSchema>;

/**
 * 处方关联的实物交易订单引用（V2.0.0）
 * 混合处方拆单后，一个处方可能关联多个子订单
 */
export const TradeOrderRefSchema = z.object({
  trade_order_id: z.string(),
  sub_order_no: z.string().optional(),
  order_type: z.enum(['RX', 'NON_RX']),
  items: z.array(z.string()), // PrescriptionItem.product_id[]
});
export type TradeOrderRef = z.infer<typeof TradeOrderRefSchema>;

/** V2.0.0 处方拆单场景 */
export const OrderScenarioEnum = z.enum([
  'SINGLE_TYPE',      // 单一类型（纯RX或纯非RX）
  'MIXED_WITH_RX',    // 混合含RX→需拆单
  'MIXED_NO_RX',      // 混合无RX→不拆单
  'CONTAINS_SERVICE', // 含服务类型
]);
export type OrderScenario = z.infer<typeof OrderScenarioEnum>;

export const PrescriptionSchema = z.object({
  id: z.string(),
  consultation_order_id: z.string(),
  doctor_id: z.string(),
  patient_id: z.string(),
  status: PrescriptionStateSchema,
  /** V2.0.0：处方内容（items[]替代旧版单一字段） */
  diagnosis: z.string(),
  /** @deprecated V2.0.0：拆分为 items[].drug_name，保留兼容 */
  generic_name: z.string().optional(),
  drug_name: z.string().optional(),
  specification: z.string().optional(),
  dosage: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  frequency: z.string().optional(),
  duration_days: z.number().int().optional(),
  notes: z.string().default(''),
  /** V2.0.0：处方明细（替代旧版单一字段） */
  items: z.array(PrescriptionItemSchema).default([]),
  /** CA签名信息 */
  ca_certificate_id: z.string().optional(),
  ca_signed_at: z.number().optional(),
  /** 审核信息 */
  pharmacist_id: z.string().optional(),
  reviewed_at: z.number().optional(),
  review_notes: z.string().optional(),
  /** 患者确认 */
  patient_confirmed_at: z.number().optional(),
  patient_reject_reason: z.string().optional(),
  reject_count: z.number().int().min(0).default(0), // V2.0.0：拒绝次数（≥3强制作废）
  patient_confirm_deadline: z.number().optional(), // 72h
  patient_agree_deadline: z.number().optional(),   // V2.0.0：仅确认·7天下单有效期
  /** 流转信息 */
  pharmacy_id: z.string().optional(),        // 选中药房
  pharmacy_price_quote_id: z.string().optional(),
  /** V2.0.0：关联实物订单 */
  trade_orders: z.array(TradeOrderRefSchema).default([]),
  order_scenario: OrderScenarioEnum.optional(),
  /** 合规字段 */
  is_first_visit: z.boolean(),               // 是否首诊
  data_retention_expire: z.number(),         // 数据保存到期+15年
  /** 商品管理联动 */
  mapped_skus: z.array(z.string()).default([]),
  /** 时间线 */
  timeline: z.array(z.object({
    time: z.number(),
    from: z.string(),
    to: z.string(),
    operator: z.enum(['DOCTOR', 'PHARMACIST', 'PATIENT', 'CA_SYSTEM', 'SYSTEM']),
    remark: z.string().optional(),
  })).default([]),
  created_at: z.number(),
  updated_at: z.number(),
});
export type Prescription = z.infer<typeof PrescriptionSchema>;

// ============================================================
// §7 患者健康档案
// ============================================================

export const PatientHealthArchiveSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  /** 基础信息 */
  name: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).default('UNKNOWN'),
  age: z.number().int().optional(),
  height_cm: z.number().optional(),
  weight_kg: z.number().optional(),
  /** 糖尿病专项 */
  diabetes_type: z.enum(['TYPE1', 'TYPE2', 'GESTATIONAL', 'PREDIABETES', 'OTHER']).optional(),
  diagnosed_at: z.number().optional(),        // 确诊年份
  comorbidities: z.array(z.string()).default([]), // 并发症：肾病/视网膜病变/神经病变...
  current_medications: z.array(z.object({
    drug_name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    started_at: z.number().optional(),
  })).default([]),
  /** CGM关联 */
  cgm_device_id: z.string().optional(),
  last_cgm_sync: z.number().optional(),
  glucose_summary_7d: z.object({
    avg: z.number(),
    max: z.number(),
    min: z.number(),
    in_range_percent: z.number(),  // TIR (Time in Range) %
    data_points: z.number(),
  }).optional(),
  /** 过敏信息 */
  allergies: z.array(z.string()).default([]),
  /** 补充信息 */
  lifestyle: z.object({
    smoking: z.boolean().default(false),
    alcohol: z.boolean().default(false),
    exercise_frequency: z.enum(['NEVER', 'OCCASIONAL', 'REGULAR', 'DAILY']).default('OCCASIONAL'),
  }).optional(),
  /** 既往病史 */
  medical_history: z.array(z.object({
    condition: z.string(),
    diagnosed_at: z.number().optional(),
  })).default([]),
  /** 字段级访问控制 */
  access_control: z.object({
    public_fields: z.array(z.string()),     // 脱敏摘要：年龄/糖尿病类型/血糖摘要
    restricted_fields: z.array(z.string()), // 授权后可见：全名/用药清单/病史
    last_updated: z.number(),
  }).optional(),
  created_at: z.number(),
  updated_at: z.number(),
});
export type PatientHealthArchive = z.infer<typeof PatientHealthArchiveSchema>;

// ============================================================
// §8 档案授权记录
// ============================================================

export const AuthorizationScopeEnum = z.enum([
  'SINGLE_CONSULTATION', // 单次问诊
  'DAYS_30',            // 30天
  'PERMANENT',          // 永久
]);
export type AuthorizationScope = z.infer<typeof AuthorizationScopeEnum>;

export const ArchiveAuthorizationSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  doctor_id: z.string(),
  consultation_order_id: z.string(),
  scope: AuthorizationScopeEnum,
  fields_granted: z.array(z.string()),       // 授权字段列表
  granted_at: z.number(),
  expires_at: z.number().optional(),
  revoked_at: z.number().optional(),
});
export type ArchiveAuthorization = z.infer<typeof ArchiveAuthorizationSchema>;

// ============================================================
// §9 问诊后推荐
// ============================================================

export const RecommendSourceEnum = z.enum([
  'RX_BASED',       // 基于处方（处方药+关联商品）
  'SYMPTOM_BASED',  // 基于症状（OTC+器械+服务）
  'BEHAVIOR_BASED', // 基于行为（协同过滤）
]);
export type RecommendSource = z.infer<typeof RecommendSourceEnum>;

export const PostConsultRecommendSchema = z.object({
  id: z.string(),
  consultation_order_id: z.string(),
  source: RecommendSourceEnum,
  /** 推荐商品 */
  items: z.array(z.object({
    product_id: z.string(),
    sku_id: z.string(),
    product_name: z.string(),
    product_image: z.string().optional(),
    product_type: z.string(),              // OTC/RX/DEVICE/SUPPLEMENT/FOOD/DAILY/SERVICE
    price: z.number(),
    reason: z.string(),                    // 推荐理由
    require_prescription: z.boolean(),     // 是否需处方
    prescription_ref: z.string().optional(),
  })).max(8),                              // CONFIG-CON-014 单次≤8
  generated_at: z.number(),
  patient_viewed: z.boolean().default(false),
  items_clicked: z.array(z.string()).default([]),
  items_ordered: z.array(z.string()).default([]),
});
export type PostConsultRecommend = z.infer<typeof PostConsultRecommendSchema>;

// ============================================================
// §10 前端展示类型（从医师实体中提取页面需要字段）
// ============================================================

export const DoctorProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  title: z.string(),                     // 职称：主任医师/副主任医师...
  hospital: z.string(),
  department: z.string(),
  specializations: z.array(z.string()),   // 专长领域
  rating: z.number().min(0).max(5),
  order_count: z.number().int(),         // 接诊量
  response_time_avg: z.number(),         // 平均响应时间（分钟）
  bio: z.string(),
  services: z.array(ConsultationServiceSkuSchema), // 该医生提供的问诊服务
  /** V2.0.0：入驻时强制关联的药店 */
  affiliated_pharmacy_id: z.string().optional(),
  affiliated_pharmacy_name: z.string().optional(),
  /** V2.2.1：医生手机号（关联merchantStore，用于医生端ID映射） */
  phone: z.string().optional(),
});
export type DoctorProfile = z.infer<typeof DoctorProfileSchema>;

// ============================================================
// §11 药房比价
// ============================================================

export const PharmacyPriceSchema = z.object({
  id: z.string(),
  pharmacy_id: z.string(),
  pharmacy_name: z.string(),
  distance_km: z.number(),                // 距离
  price: z.number(),                      // 该药房的价格
  stock_available: z.boolean(),
  estimated_arrival: z.string(),          // 预计送达
  delivery_fee: z.number().default(0),
  rating: z.number().min(0).max(5),
});
export type PharmacyPrice = z.infer<typeof PharmacyPriceSchema>;

// ============================================================
// §12 预问诊表单
// ============================================================

export const PreConsultFormSchema = z.object({
  chief_complaint: z.string().min(1, '请描述您的病情'),
  duration: z.string(),                   // 症状持续时间
  current_medications: z.string().default(''),
  cgm_recent_readings: z.string().default(''),
  allergies: z.string().default(''),
  images: z.array(z.string()).default([]), // 上传图片
  /** 签约用户免下单 */
  is_subscriber: z.boolean().default(false),
  subscription_id: z.string().optional(),
});
export type PreConsultForm = z.infer<typeof PreConsultFormSchema>;

// ============================================================
// §13 操作请求/响应类型
// ============================================================

/** 创建问诊订单 */
export const CreateConsultOrderRequest = z.object({
  doctor_id: z.string(),
  sku_id: z.string(),
  mode: ConsultationModeEnum,
  urgency: ConsultationUrgencyEnum.default('NORMAL'),
  pre_consult_form: PreConsultFormSchema,
  /** 签约用户免下单 */
  use_subscription: z.boolean().default(false),
  coupon_code: z.string().optional(),
});

/** 处方开具请求 */
export const IssuePrescriptionRequest = z.object({
  consultation_order_id: z.string(),
  diagnosis: z.string(),
  generic_name: z.string(),
  drug_name: z.string(),
  specification: z.string(),
  dosage: z.string(),
  quantity: z.number().int().min(1),
  frequency: z.string(),
  duration_days: z.number().int(),
  notes: z.string().default(''),
  is_first_visit: z.boolean(),
});

/** 问诊评价 */
export const EvaluationSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  patient_id: z.string(),
  doctor_id: z.string(),
  rating: z.number().min(1).max(5),
  content: z.string().default(''),
  tags: z.array(z.string()).default([]),   // 评价标签：专业/耐心/回复快...
  created_at: z.number(),
});
export type Evaluation = z.infer<typeof EvaluationSchema>;

// ============================================================
// §14 类型导出
// ============================================================

export type CreateConsultOrderRequest = z.infer<typeof CreateConsultOrderRequest>;
export type IssuePrescriptionRequest = z.infer<typeof IssuePrescriptionRequest>;
