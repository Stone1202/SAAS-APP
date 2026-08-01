/**
 * SugarMate 在线问诊 Store V2.0.0（Zustand + IndexedDB 持久化）
 *
 * V2.0.0 变更（2026-07-31）：
 * - patientConfirmPrescription → 双路径（确认并下单 / 仅确认暂不下单）
 * - patientRejectPrescription → 拒绝次数追踪（≥3强制作废）
 * - 新增：patientConfirmPrescriptionAndOrder / patientConfirmPrescriptionOnly
 * - 新增：usePrescriptionToOrder（仅确认后7天内下单）
 * - 新增：handlePrescriptionStockout / switchPrescriptionPharmacy
 * - createPrescription → 支持 items[] 处方明细
 *
 * 管理问诊全链路状态：医生搜索 → 下单 → 等待 → 对话 → 处方 → 订单 → 完结 → 推荐 → 评价
 * 三终端共享：APP患者端、APP医生端、PC后台 读写同一数据源
 */
import { create } from 'zustand';
import {
  initConsultationSimDB,
  CONSULTATION_SIM_STORES,
} from '@/adapters/sim/consultation-data';
import type {
  DoctorProfile,
  ConsultationOrder,
  ConsultationMessage,
  Prescription,
  PrescriptionItem,
  TradeOrderRef,
  PatientHealthArchive,
  ArchiveAuthorization,
  PostConsultRecommend,
  PharmacyPrice,
  Evaluation,
  PreConsultForm,
  CreateConsultOrderRequest,
  IssuePrescriptionRequest,
  OrderScenario,
} from '@contracts/consultation';
import type { ConsultationOrderState } from '@contracts/state-machine/core';
import { CONSULTATION_ORDER_TRANSITIONS, PRESCRIPTION_TRANSITIONS } from '@contracts/state-machine/core';
import { useConsultationServiceStore } from './consultationServiceStore';
import { useAppAuthStore } from './appAuthStore';
import { useMerchantStore } from './merchantStore';
import { useOrderStore } from './orderStore';
import type { CreatePrescriptionOrderRequest } from '@contracts/trade';
import { analyzeOrderMixTypes } from '@contracts/state-machine/core';

// ============================================================
// §1 IndexedDB 辅助
// ============================================================

let dbReady = false;

async function ensureDB() {
  if (!dbReady) {
    await initConsultationSimDB();
    dbReady = true;
  }
}

async function getStore<T>(storeName: string): Promise<T[]> {
  await ensureDB();
  const { openDB } = await import('idb');
  const db = await openDB('consultation-sim', 2);
  return db.getAll(storeName);
}

async function getById<T extends { id: string }>(storeName: string, id: string): Promise<T | undefined> {
  await ensureDB();
  const { openDB } = await import('idb');
  const db = await openDB('consultation-sim', 2);
  return db.get(storeName, id);
}

async function putItem(storeName: string, item: any): Promise<void> {
  await ensureDB();
  const { openDB } = await import('idb');
  const db = await openDB('consultation-sim', 2);
  await db.put(storeName, item);
  // 问诊数据变更后广播，使患者端/医生端跨标签页实时同步
  bumpConsultationVersion();
}

// ============================================================
// §2 Store 接口
// ============================================================

interface ConsultationState {
  // --- 数据 ---
  doctors: DoctorProfile[];
  orders: ConsultationOrder[];
  currentOrder: ConsultationOrder | null;
  messages: ConsultationMessage[];
  prescriptions: Prescription[];
  currentPrescription: Prescription | null;
  archives: PatientHealthArchive[];
  currentArchive: PatientHealthArchive | null;
  recommends: PostConsultRecommend[];
  pharmacyPrices: PharmacyPrice[];
  evaluations: Evaluation[];

  // --- 加载状态 ---
  loading: boolean;
  initialized: boolean;

  /** V2.3.0：记录上次 loadOrders 的过滤上下文，用于跨标签同步时重新加载 */
  _lastLoadFilter: { patientId?: string; doctorId?: string } | null;

  // --- 操作 ---
  /** 初始化仿真数据 */
  init: () => Promise<void>;

  // 医生
  searchDoctors: (filters?: { department?: string; keyword?: string; minRating?: number }) => Promise<DoctorProfile[]>;
  getDoctorDetail: (doctorId: string) => Promise<DoctorProfile | undefined>;

  // 问诊订单
  loadOrders: (patientId?: string, doctorId?: string) => Promise<void>;
  loadOrderDetail: (orderId: string) => Promise<void>;
  createOrder: (req: CreateConsultOrderRequest) => Promise<ConsultationOrder>;
  acceptConsultation: (orderId: string, doctorId: string) => Promise<void>;
  readyConsult: (orderId: string) => Promise<void>;
  finishConsultation: (orderId: string, summary: string) => Promise<void>;
  patientConfirmComplete: (orderId: string) => Promise<void>;
  submitEvaluation: (orderId: string, rating: number, content: string, tags: string[]) => Promise<void>;
  requestRefund: (orderId: string, reason: string) => Promise<void>;

  // 消息
  loadMessages: (orderId: string) => Promise<void>;
  sendTextMessage: (orderId: string, content: string, sender: 'PATIENT' | 'DOCTOR') => Promise<void>;
  sendImageMessage: (orderId: string, imageUrl: string, sender: 'PATIENT' | 'DOCTOR') => Promise<void>;
  sendPrescriptionMessage: (orderId: string, drugKey: string) => Promise<void>;
  shareCgmData: (orderId: string) => Promise<void>;

  // 处方
  loadPrescriptions: (patientId?: string) => Promise<void>;
  loadPrescriptionDetail: (prescriptionId: string) => Promise<void>;
  createPrescription: (req: IssuePrescriptionRequest) => Promise<Prescription>;
  /** V2.0.0 双路径：患者确认处方并下单（路径A） */
  patientConfirmPrescriptionAndOrder: (prescriptionId: string, addressId: string) => Promise<void>;
  /** V2.0.0 双路径：患者仅确认处方·暂不下单（路径B） */
  patientConfirmPrescriptionOnly: (prescriptionId: string) => Promise<void>;
  /** V2.0.0：仅确认后7天内使用处方下单 */
  usePrescriptionToOrder: (prescriptionId: string, addressId: string) => Promise<void>;
  /** @deprecated 请使用 patientConfirmPrescriptionAndOrder 或 patientConfirmPrescriptionOnly */
  patientConfirmPrescription: (prescriptionId: string) => Promise<void>;
  /** V2.0.0 增强：拒绝次数追踪 */
  patientRejectPrescription: (prescriptionId: string, reason: string) => Promise<void>;
  resubmitPrescription: (prescriptionId: string, updates: Partial<IssuePrescriptionRequest>) => Promise<void>;
  /** 药师审核处方——通过 */
  pharmacistReviewPrescription: (prescriptionId: string, pharmacistId: string, notes?: string) => Promise<void>;
  /** 药师审核处方——驳回 */
  pharmacistRejectPrescription: (prescriptionId: string, pharmacistId: string, reason: string) => Promise<void>;
  /** V2.0.0 新增：药房缺货处理 */
  handlePrescriptionStockout: (prescriptionId: string) => Promise<void>;
  /** V2.0.0 新增：更换药房 */
  switchPrescriptionPharmacy: (prescriptionId: string, pharmacyId: string, pharmacyName: string) => Promise<void>;

  // 档案
  loadArchive: (patientId: string) => Promise<void>;
  updateArchive: (patientId: string, updates: Partial<PatientHealthArchive>) => Promise<void>;
  authorizeArchive: (patientId: string, doctorId: string, orderId: string) => Promise<void>;

  // 药房比价
  loadPharmacyPrices: (genericName: string) => Promise<PharmacyPrice[]>;

  // 推荐
  loadRecommends: (orderId: string) => Promise<void>;
  clickRecommendItem: (orderId: string, skuId: string) => Promise<void>;

  // 状态判断
  getStateLabel: (state: string) => string;
  getAllowedActions: (order: ConsultationOrder, role: 'PATIENT' | 'DOCTOR' | 'ADMIN') => string[];

  /** V2.2.1：通过phone/name解析问诊医生ID（merchantStore ID → consultation doctor ID 映射） */
  resolveDoctorConsultId: (phone?: string, name?: string) => string | null;
}

// ============================================================
// §3 Store 实现
// ============================================================

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================
// §3.1 跨标签页问诊数据同步（医生端 ↔ 患者端）
// ============================================================
const CONSULTATION_VERSION_KEY = 'sugarmate_consultation_version';
let consultationSyncTimer: ReturnType<typeof setInterval> | null = null;
let lastSeenConsultationVersion = 0;
let lastSentConsultationVersion = 0;

function getConsultationVersion(): number {
  return parseInt(localStorage.getItem(CONSULTATION_VERSION_KEY) || '0', 10);
}

function bumpConsultationVersion() {
  const v = getConsultationVersion() + 1;
  localStorage.setItem(CONSULTATION_VERSION_KEY, String(v));
  lastSentConsultationVersion = v;
  lastSeenConsultationVersion = v;
}

function startConsultationSyncReceiver(getState: () => ConsultationState) {
  if (consultationSyncTimer) return;
  lastSeenConsultationVersion = getConsultationVersion();

  // 方案1：监听其他标签页的 storage 事件
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === CONSULTATION_VERSION_KEY && e.newValue !== e.oldValue) {
      handleConsultationVersionChange(getState, parseInt(e.newValue || '0', 10));
    }
  });

  // 方案2：同一标签页内轮询兜底（不同路由/组件间）
  consultationSyncTimer = setInterval(() => {
    const currentVersion = getConsultationVersion();
    if (currentVersion !== lastSeenConsultationVersion) {
      lastSeenConsultationVersion = currentVersion;
      handleConsultationVersionChange(getState, currentVersion);
    }
  }, 2000);
}

async function handleConsultationVersionChange(
  getState: () => ConsultationState,
  version: number
) {
  if (version === lastSentConsultationVersion) return; // 自己发的，忽略
  const state = getState();
  const orderId = state.currentOrder?.id;
  if (orderId) {
    await state.loadOrderDetail(orderId);
    await state.loadMessages(orderId);
  }
  // V2.3.0：跨标签同步——重新加载订单列表（使用上次的过滤上下文）
  const filter = state._lastLoadFilter;
  if (filter) {
    await state.loadOrders(filter.patientId, filter.doctorId);
  }
}

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  doctors: [],
  orders: [],
  currentOrder: null,
  messages: [],
  prescriptions: [],
  currentPrescription: null,
  archives: [],
  currentArchive: null,
  recommends: [],
  pharmacyPrices: [],
  evaluations: [],
  loading: false,
  initialized: false,
  _lastLoadFilter: null,

  // ========== 初始化 ==========

  init: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      await ensureDB();
      const doctors = await getStore<DoctorProfile>(CONSULTATION_SIM_STORES.doctors);
      startConsultationSyncReceiver(get);
      set({ doctors, initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  // ========== 医生搜索 ==========

  searchDoctors: async (filters) => {
    await get().init();
    let doctors = await getStore<DoctorProfile>(CONSULTATION_SIM_STORES.doctors);
    if (filters) {
      if (filters.department) {
        doctors = doctors.filter(d => d.department === filters.department);
      }
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        doctors = doctors.filter(d =>
          d.name.includes(kw) ||
          d.hospital.includes(kw) ||
          d.specializations.some(s => s.includes(kw)) ||
          d.services.some(s => s.title.includes(kw) || s.tags.some(t => t.includes(kw)))
        );
      }
      if (filters.minRating) {
        doctors = doctors.filter(d => d.rating >= filters.minRating!);
      }
    }
    set({ doctors });
    return doctors;
  },

  getDoctorDetail: async (doctorId) => {
    return getById<DoctorProfile>(CONSULTATION_SIM_STORES.doctors, doctorId);
  },

  // ========== 问诊订单 ==========

  loadOrders: async (patientId, doctorId) => {
    set({ loading: true, _lastLoadFilter: { patientId, doctorId } });
    let allOrders = await getStore<ConsultationOrder>(CONSULTATION_SIM_STORES.orders);
    if (patientId) allOrders = allOrders.filter(o => o.patient_id === patientId);
    if (doctorId) allOrders = allOrders.filter(o => o.doctor_id === doctorId);
    set({ orders: allOrders.sort((a, b) => b.created_at - a.created_at), loading: false });
  },

  loadOrderDetail: async (orderId) => {
    set({ loading: true });
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, orderId);
    set({ currentOrder: order || null, loading: false });
  },

  createOrder: async (req) => {
    const now = Date.now();
    const orderId = generateId('con');
    // V2.2.4：确保 consultation store 初始化，否则 doctors 为空，映射失效
    await get().init();
    // 从业务后台 consultationServiceStore 获取服务（不再依赖旧的 doctors 数组）
    const service = useConsultationServiceStore.getState().services.find(s => s.id === req.sku_id);
    const patientUser = useAppAuthStore.getState().patientUser;

    // V2.2.2：将 merchantStore 医生ID (MR-XXX) 映射到 consultation 医生ID (doc-XXX)
    // 根因：患者端传入的是 merchantStore ID，但 loadOrders 过滤用的是 consultation doctor ID
    let doctorId = req.doctor_id;
    const merchantDoctor = useMerchantStore.getState().merchants.find(m => m.id === req.doctor_id);
    if (merchantDoctor) {
      const mappedId = get().resolveDoctorConsultId(merchantDoctor.phone, merchantDoctor.name);
      if (mappedId) {
        doctorId = mappedId;
      } else {
        // V2.3.0：映射失败时自动注册医生到 consultation DB，确保双向查找一致性
        const autoRegId = `doc-auto-${req.doctor_id.replace('MR-', '')}`;
        const newDoctor: DoctorProfile = {
          id: autoRegId,
          name: merchantDoctor.name || '医生',
          phone: merchantDoctor.phone || '',
          title: merchantDoctor.title || '',
          department: merchantDoctor.department || '全科',
          hospital: merchantDoctor.company || '',
          rating: 4.5,
          serviceCount: 0,
          avatar: '',
          bio: '',
          specializations: [],
          services: [],
        };
        await putItem(CONSULTATION_SIM_STORES.doctors, newDoctor);
        set(s => ({ doctors: [...s.doctors, newDoctor] }));
        console.log('[CONSULT] 自动注册问诊医生:', autoRegId, '← MR映射', req.doctor_id);
        doctorId = autoRegId;
      }
    }

    const order: ConsultationOrder = {
      id: orderId,
      service_order_id: generateId('srv'),
      doctor_id: doctorId,
      patient_id: patientUser?.id || 'cus-001',
      patient_name: patientUser?.name || '患者',
      sku_id: req.sku_id,
      status: 'CREATED' as ConsultationOrderState,
      mode: req.mode,
      urgency: req.urgency,
      urgency_surcharge: 0,
      price: service?.price || 0,
      paid_amount: req.use_subscription ? 0 : (service?.price || 0),
      recommend_ids: [],
      timeline: [],
      created_at: now,
      updated_at: now,
    };

    // 签约用户：免支付，CREATED → PAID → PENDING_ACCEPT（一步直达）
    // 非签约用户：模拟支付成功，CREATED → PAID → PENDING_ACCEPT
    order.timeline.push({ time: now, from: 'CREATED', to: 'PAID', operator: 'SYSTEM', remark: req.use_subscription ? '签约用户免支付·权益次数-1' : '模拟支付成功' });
    order.status = 'PAID' as ConsultationOrderState;
    order.timeline.push({ time: now + 1, from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM', remark: '等待医生接诊' });
    order.status = 'PENDING_ACCEPT' as ConsultationOrderState;

    await putItem(CONSULTATION_SIM_STORES.orders, order);
    const orders = [...get().orders, order];
    set({ orders, currentOrder: order });
    return order;
  },

  acceptConsultation: async (orderId, doctorId) => {
    const now = Date.now();
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, orderId);
    if (!order) return;
    const newStatus = 'ACCEPTED' as ConsultationOrderState;
    order.status = newStatus;
    order.timeline.push({ time: now, from: 'PENDING_ACCEPT', to: newStatus, operator: 'DOCTOR', remark: '医生接诊' });
    order.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.orders, order);

    // 系统通知消息持久化到 messages store
    const systemMsg: ConsultationMessage = {
      id: generateId('msg'), order_id: orderId, sender: 'SYSTEM', type: 'SYSTEM_NOTIFY',
      content: '医生已接诊，问诊开始', idempotent_key: generateId('ik'), delivered: true,
      created_at: now,
    };
    await putItem(CONSULTATION_SIM_STORES.messages, systemMsg);

    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? order : o),
      currentOrder: s.currentOrder?.id === orderId ? order : s.currentOrder,
      messages: [...s.messages, systemMsg],
    }));
  },

  readyConsult: async (orderId) => {
    const now = Date.now();
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, orderId);
    if (!order) return;
    order.status = 'IN_CONSULT' as ConsultationOrderState;
    order.timeline.push({ time: now, from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM', remark: '开始问诊对话' });
    order.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.orders, order);
    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? order : o),
      currentOrder: s.currentOrder?.id === orderId ? order : s.currentOrder,
    }));
  },

  finishConsultation: async (orderId, summary) => {
    const now = Date.now();
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, orderId);
    if (!order) return;
    order.status = 'WAITING_PATIENT_CONFIRM' as ConsultationOrderState;
    order.confirm_deadline = now + 7 * 86400000;
    order.timeline.push({ time: now, from: 'IN_CONSULT', to: 'WAITING_PATIENT_CONFIRM', operator: 'DOCTOR', remark: summary });
    order.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.orders, order);
    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? order : o),
      currentOrder: s.currentOrder?.id === orderId ? order : s.currentOrder,
      messages: [
        ...s.messages,
        {
          id: generateId('msg'), order_id: orderId, sender: 'SYSTEM', type: 'SYSTEM_NOTIFY',
          content: `问诊已完结：${summary}`, idempotent_key: generateId('ik'), delivered: true,
          created_at: now,
        },
      ],
    }));
  },

  patientConfirmComplete: async (orderId) => {
    const now = Date.now();
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, orderId);
    if (!order) return;
    order.status = 'PATIENT_CONFIRMED' as ConsultationOrderState;
    order.timeline.push({ time: now, from: 'WAITING_PATIENT_CONFIRM', to: 'PATIENT_CONFIRMED', operator: 'PATIENT', remark: '患者确认完结' });
    order.updated_at = now;
    // 模拟推荐引擎
    order.recommend_ids = [generateId('rec')];
    order.status = 'RECOMMENDATION_SHOWN' as ConsultationOrderState;
    order.timeline.push({ time: now + 500, from: 'PATIENT_CONFIRMED', to: 'RECOMMENDATION_SHOWN', operator: 'SYSTEM', remark: '推荐引擎自动生成' });
    await putItem(CONSULTATION_SIM_STORES.orders, order);
    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? order : o),
      currentOrder: s.currentOrder?.id === orderId ? order : s.currentOrder,
    }));
  },

  submitEvaluation: async (orderId, rating, content, tags) => {
    const now = Date.now();
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, orderId);
    if (!order) return;
    order.status = 'EVALUATED' as ConsultationOrderState;
    order.timeline.push({ time: now, from: 'RECOMMENDATION_SHOWN', to: 'EVALUATED', operator: 'PATIENT', remark: `${rating}星好评` });
    order.updated_at = now;
    const evalId = generateId('eval');
    order.evaluation_id = evalId;
    await putItem(CONSULTATION_SIM_STORES.orders, order);
    await putItem(CONSULTATION_SIM_STORES.evaluations, {
      id: evalId, order_id: orderId, patient_id: order.patient_id,
      doctor_id: order.doctor_id, rating, content, tags, created_at: now,
    });
    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? order : o),
      currentOrder: s.currentOrder?.id === orderId ? order : s.currentOrder,
      evaluations: [...s.evaluations, { id: evalId, order_id: orderId, patient_id: order.patient_id, doctor_id: order.doctor_id, rating, content, tags, created_at: now }],
    }));
  },

  requestRefund: async (orderId, reason) => {
    const now = Date.now();
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, orderId);
    if (!order) return;
    order.status = 'DISPUTING' as ConsultationOrderState;
    order.timeline.push({ time: now, from: order.status, to: 'DISPUTING', operator: 'PATIENT', remark: reason });
    order.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.orders, order);
    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? order : o),
      currentOrder: s.currentOrder?.id === orderId ? order : s.currentOrder,
    }));
  },

  // ========== 消息 ==========

  loadMessages: async (orderId) => {
    const all = await getStore<ConsultationMessage>(CONSULTATION_SIM_STORES.messages);
    const msgs = all.filter(m => m.order_id === orderId).sort((a, b) => a.created_at - b.created_at);
    set({ messages: msgs });
  },

  sendTextMessage: async (orderId, content, sender) => {
    const now = Date.now();
    const msg: ConsultationMessage = {
      id: generateId('msg'), order_id: orderId, sender, type: 'TEXT', content,
      idempotent_key: generateId('ik'), delivered: true, created_at: now,
    };
    await putItem(CONSULTATION_SIM_STORES.messages, msg);
    set(s => ({ messages: [...s.messages, msg] }));
  },

  sendImageMessage: async (orderId, imageUrl, sender) => {
    const now = Date.now();
    const msg: ConsultationMessage = {
      id: generateId('msg'), order_id: orderId, sender, type: 'IMAGE',
      content: '[图片]', image_url: imageUrl, idempotent_key: generateId('ik'),
      delivered: true, created_at: now,
    };
    await putItem(CONSULTATION_SIM_STORES.messages, msg);
    set(s => ({ messages: [...s.messages, msg] }));
  },

  shareCgmData: async (orderId) => {
    const now = Date.now();
    const msg: ConsultationMessage = {
      id: generateId('msg'), order_id: orderId, sender: 'PATIENT', type: 'CGM_SHARE',
      content: '分享了CGM血糖数据', idempotent_key: generateId('ik'),
      cgm_data: { glucose_level: 6.8, trend: 'STABLE', time_range: '近24小时', chart_url: '/cgm/share-latest.png' },
      delivered: true, created_at: now,
    };
    await putItem(CONSULTATION_SIM_STORES.messages, msg);
    set(s => ({ messages: [...s.messages, msg] }));
  },

  // 问诊中模拟医生开处方（生成处方+卡片消息）
  sendPrescriptionMessage: async (orderId, drugKey) => {
    const now = Date.now();
    const state = get();
    const order = state.currentOrder || state.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    // 生成处方
    const presId = generateId('pres');
    const drugPresets: Record<string, { name: string; generic: string; dosage: string; frequency: string; duration: string }> = {
      'metformin-500mg': { name: '盐酸二甲双胍片 500mg', generic: 'metformin', dosage: '500mg', frequency: '每日2次', duration: '30天' },
      'insulin-glargine': { name: '甘精胰岛素注射液', generic: 'insulin_glargine', dosage: '10IU', frequency: '每日1次(睡前)', duration: '30天' },
      'acarbose-50mg': { name: '阿卡波糖片 50mg', generic: 'acarbose', dosage: '50mg', frequency: '每日3次(随餐)', duration: '30天' },
    };
    const drug = drugPresets[drugKey] || drugPresets['metformin-500mg'];
    const quantity = drug.duration === '30天' ? 60 : 30;
    const durationDays = drug.duration === '30天' ? 30 : 14;
    const prescription: Prescription = {
      id: presId,
      consultation_order_id: orderId,
      patient_id: order.patient_id,
      doctor_id: order.doctor_id,
      status: 'AWAITING_PATIENT_CONFIRM' as any,
      diagnosis: '2型糖尿病·血糖控制欠佳',
      drug_name: drug.name,
      generic_name: drug.generic,
      specification: drug.dosage,
      dosage: drug.dosage,
      frequency: drug.frequency,
      quantity,
      duration_days: durationDays,
      notes: '请在医生指导下使用，如有不适立即停药就医',
      items: [{
        product_id: drugKey,
        sku_id: `${drugKey}-sku`,
        product_type: 'RX',
        drug_name: drug.name,
        generic_name: drug.generic,
        specification: drug.dosage,
        dosage: drug.dosage,
        frequency: drug.frequency,
        quantity,
        duration_days: durationDays,
        notes: '请在医生指导下使用，如有不适立即停药就医',
      }],
      mapped_skus: [],
      is_first_visit: false,
      data_retention_expire: now + 15 * 365 * 86400000,
      patient_confirm_deadline: now + 72 * 3600000,
      timeline: [{
        time: now,
        from: (order as any).status || 'IN_CONSULT',
        to: 'AWAITING_PATIENT_CONFIRM',
        operator: 'DOCTOR',
        remark: `开具处方：${drug.name}`,
      }],
      created_at: now,
      updated_at: now,
    };

    // 存储处方
    await putItem(CONSULTATION_SIM_STORES.prescriptions, prescription);

    // 发处方卡片消息
    const msg: ConsultationMessage = {
      id: generateId('msg'),
      order_id: orderId,
      sender: 'DOCTOR',
      type: 'PRESCRIPTION_CARD',
      content: `[处方卡片] ${drug.name} ${drug.dosage} ${drug.frequency}·${drug.duration}`,
      prescription_ref: presId,
      idempotent_key: generateId('ik'),
      delivered: true,
      created_at: now,
    };
    await putItem(CONSULTATION_SIM_STORES.messages, msg);
    set(s => ({ messages: [...s.messages, msg] }));

    // 状态机：进入处方确认等待
    const timelineEntry = {
      time: now,
      from: (order as any).status || 'IN_CONSULT',
      to: 'PENDING_PRESCRIPTION',
      operator: 'DOCTOR',
      remark: `开具处方：${drug.name}`,
    };
    const existingTimeline = order.timeline || [];
    await putItem(CONSULTATION_SIM_STORES.orders, {
      ...order,
      prescription_id: presId,
      status: 'PENDING_PRESCRIPTION',
      timeline: [...(existingTimeline as any[]), timelineEntry],
      updated_at: now,
    } as any);

    // 更新本地状态
    set(s => ({
      currentOrder: s.currentOrder?.id === orderId
        ? { ...s.currentOrder, prescription_id: presId, status: 'PENDING_PRESCRIPTION', updated_at: now } as any
        : s.currentOrder,
    }));
  },

  // ========== 处方 ==========

  loadPrescriptions: async (patientId) => {
    let all = await getStore<Prescription>(CONSULTATION_SIM_STORES.prescriptions);
    if (patientId) all = all.filter(p => p.patient_id === patientId);
    set({ prescriptions: all.sort((a, b) => b.created_at - a.created_at) });
  },

  loadPrescriptionDetail: async (prescriptionId) => {
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    set({ currentPrescription: pres || null });
  },

  createPrescription: async (req) => {
    const now = Date.now();
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, req.consultation_order_id);
    if (!order) throw new Error('问诊订单不存在');

    const presId = generateId('rx');
    const prescription: Prescription = {
      id: presId, consultation_order_id: req.consultation_order_id,
      doctor_id: order.doctor_id, patient_id: order.patient_id,
      status: 'DRAFT' as any,
      diagnosis: req.diagnosis, generic_name: req.generic_name, drug_name: req.drug_name,
      specification: req.specification, dosage: req.dosage, quantity: req.quantity,
      frequency: req.frequency, duration_days: req.duration_days, notes: req.notes,
      is_first_visit: req.is_first_visit,
      data_retention_expire: now + 15 * 365 * 86400000,
      timeline: [{ time: now, from: 'DRAFT', to: 'DRAFT', operator: 'DOCTOR', remark: '创建处方草稿' }],
      mapped_skus: [],
      created_at: now, updated_at: now,
    };

    // 自动流转：DRAFT → SUBMITTED → CA_SIGNED → PENDING_AUDIT（停在药师审核）
    // 药师需要通过 Medical App 或 Dashboard 手动审核后才能继续
    prescription.status = 'SUBMITTED' as any;
    prescription.timeline.push({ time: now + 100, from: 'DRAFT', to: 'SUBMITTED', operator: 'DOCTOR' });
    prescription.timeline.push({ time: now + 200, from: 'SUBMITTED', to: 'CA_SIGNED', operator: 'CA_SYSTEM', remark: 'Sim模式自动签名' });
    prescription.ca_certificate_id = 'sim-ca-auto';
    prescription.ca_signed_at = now + 200;
    prescription.status = 'CA_SIGNED' as any;
    prescription.timeline.push({ time: now + 300, from: 'CA_SIGNED', to: 'PENDING_AUDIT', operator: 'SYSTEM', remark: '待药师审核' });
    prescription.status = 'PENDING_AUDIT' as any;
    prescription.reviewed_at = undefined as any;
    prescription.pharmacist_id = undefined as any;
    prescription.review_notes = undefined as any;

    await putItem(CONSULTATION_SIM_STORES.prescriptions, prescription);

    // Sim模式：自动药师审核通过 → 流转至患者确认
    prescription.status = 'PHARMACIST_APPROVED' as any;
    prescription.pharmacist_id = 'pharmacist-auto';
    prescription.pharmacist_name = 'Sim自动审核';
    prescription.reviewed_at = now + 400;
    prescription.review_notes = 'Sim自动审核通过';
    prescription.timeline.push({ time: now + 400, from: 'PENDING_AUDIT', to: 'PHARMACIST_APPROVED', operator: 'PHARMACIST', remark: 'Sim自动审核通过' });
    prescription.status = 'AWAITING_PATIENT_CONFIRM' as any;
    prescription.timeline.push({ time: now + 500, from: 'PHARMACIST_APPROVED', to: 'AWAITING_PATIENT_CONFIRM', operator: 'SYSTEM', remark: '等待患者确认处方' });
    await putItem(CONSULTATION_SIM_STORES.prescriptions, prescription);

    // 更新关联问诊订单状态 → 等待患者确认处方
    order.status = 'RX_AWAITING_PATIENT' as ConsultationOrderState;
    order.prescription_id = presId;
    order.timeline.push({ time: now + 500, from: 'PRESCRIPTION_APPROVED', to: 'RX_AWAITING_PATIENT', operator: 'SYSTEM', remark: '审方通过·待患者确认处方' });
    order.updated_at = now + 500;
    await putItem(CONSULTATION_SIM_STORES.orders, order);

    // 发送处方卡片消息（医生端开方 → 自动审方 → 待患者确认）
    const msg: ConsultationMessage = {
      id: generateId('msg'), order_id: order.id, sender: 'SYSTEM', type: 'PRESCRIPTION_CARD',
      content: `医生已为您开具处方：${req.drug_name} ${req.specification} ${req.dosage} ${req.frequency}，请查看并确认`,
      prescription_ref: presId, idempotent_key: generateId('ik'), delivered: true, created_at: now + 500,
    };
    await putItem(CONSULTATION_SIM_STORES.messages, msg);

    set(s => ({
      prescriptions: [prescription, ...s.prescriptions],
      currentPrescription: prescription,
      currentOrder: s.currentOrder?.id === order.id ? { ...order } : s.currentOrder,
      orders: s.orders.map(o => o.id === order.id ? { ...order } : o),
      messages: [...s.messages, msg],
    }));
    return prescription;
  },

  /** @deprecated V2.0.0 保留兼容，默认走路径A（确认并下单） */
  patientConfirmPrescription: async (prescriptionId) => {
    return (get() as any).patientConfirmPrescriptionOnly(prescriptionId);
  },

  /** V2.0.0 路径A：患者确认处方并下单 */
  patientConfirmPrescriptionAndOrder: async (prescriptionId, addressId) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');
    if (pres.status !== 'AWAITING_PATIENT_CONFIRM') throw new Error('处方状态不可确认');

    // 1. 分析处方内商品类型
    const productTypes = (pres.items || []).map(i => i.product_type);
    if (productTypes.length === 0) throw new Error('处方无药品明细');

    const scenario = analyzeOrderMixTypes(productTypes);
    console.log('[V2.0.0] 处方→订单 商品类型分析:', { productTypes, scenario });

    // 2. 通过 BroadcastChannel 通知 orderStore 创建订单
    // 处方状态先变为 ORDER_CREATED
    pres.status = 'ORDER_CREATED' as any;
    pres.patient_confirmed_at = now;
    pres.order_scenario = scenario as any;
    pres.timeline.push({ time: now, from: 'AWAITING_PATIENT_CONFIRM', to: 'ORDER_CREATED', operator: 'PATIENT', remark: '确认处方并下单' });
    pres.updated_at = now;
    // 记录关联信息：将在 orderStore 回调后填写 trade_orders
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    // 更新问诊订单状态
    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, pres.consultation_order_id);
    if (order) {
      order.status = 'RX_PATIENT_ACCEPTED' as ConsultationOrderState;
      order.timeline.push({ time: now, from: 'RX_AWAITING_PATIENT', to: 'RX_PATIENT_ACCEPTED', operator: 'PATIENT', remark: '患者确认处方并下单' });
      order.updated_at = now;
      await putItem(CONSULTATION_SIM_STORES.orders, order);
      set(s => ({
        orders: s.orders.map(o => o.id === order.id ? { ...order } : o),
        currentOrder: s.currentOrder?.id === order.id ? { ...order } : s.currentOrder,
      }));
    }

    // 3. 广播处方→订单事件（orderStore 订阅消费）
    // 通过 custom event 或 postMessage 通知
    const orderReq: CreatePrescriptionOrderRequest = {
      prescription_id: pres.id,
      items: pres.items.map(item => ({
        product_id: item.product_id,
        sku_id: item.sku_id,
        product_name: item.drug_name,
        product_type: item.product_type as any,
        quantity: item.quantity,
        unit_price: item.unit_price || 0,
        item_status: item.product_type === 'RX' ? 'RX_CHECKING' : 'PENDING',
        cold_chain_config: item.cold_chain_config,
        prescription_ref: pres.id,
      })),
      address_id: addressId,
      seller_id: pres.pharmacy_id || 'pharmacy-default',
      source: 'PRESCRIPTION',
      source_ref: pres.id,
      order_scenario: scenario as any,
    };

    // 如果混合处方，拆出非RX子订单
    if (scenario === 'MIXED_WITH_RX') {
      const nonRxItems = pres.items.filter(i => i.product_type !== 'RX');
      if (nonRxItems.length > 0) {
        orderReq.sub_orders = [{
          items: nonRxItems.map(item => ({
            product_id: item.product_id,
            sku_id: item.sku_id,
            product_name: item.drug_name,
            product_type: item.product_type as any,
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
            item_status: 'PENDING',
          })),
        }];
      }
    }

    // 写回当前处方
    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));

    // 处方流转（推送到药房）
    pres.status = 'FLOWING' as any;
    pres.timeline.push({ time: now + 300, from: 'ORDER_CREATED', to: 'FLOWING', operator: 'SYSTEM', remark: '订单已创建·处方流转给药房' });
    pres.updated_at = now + 300;
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    if (order) {
      order.status = 'PRESCRIPTION_FLOWING' as ConsultationOrderState;
      order.timeline.push({ time: now + 300, from: 'RX_PATIENT_ACCEPTED', to: 'PRESCRIPTION_FLOWING', operator: 'SYSTEM', remark: '处方流转·推送给药房' });
      order.updated_at = now + 300;
      await putItem(CONSULTATION_SIM_STORES.orders, order);
      set(s => ({
        orders: s.orders.map(o => o.id === order.id ? { ...order } : o),
        currentOrder: s.currentOrder?.id === order.id ? { ...order } : s.currentOrder,
      }));
    }

    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));

    // V2.2.3：实际调用 orderStore 创建交易订单（原为 comment "调用方负责" 但无人调用）
    let tradeOrderResult: { order: { id: string }; analysis: any } | null = null;
    try {
      tradeOrderResult = await useOrderStore.getState().createPrescriptionOrder(orderReq);
    } catch (err) {
      console.error('[V2.2.3] 处方→订单创建失败:', err);
    }

    // 回写 trade_order_id 到问诊订单
    if (tradeOrderResult?.order?.id && order) {
      order.trade_order_id = tradeOrderResult.order.id;
      order.updated_at = now + 600;
      await putItem(CONSULTATION_SIM_STORES.orders, order);

      // 回写 trade_orders 到处方
      const tradeRef: TradeOrderRef = {
        order_id: tradeOrderResult.order.id,
        sub_order_no: `${tradeOrderResult.order.id}-rx`,
        order_type: 'RX' as const,
        status: 'RX_CHECKING' as const,
        created_at: now + 600,
      };
      pres.trade_orders = [...(pres.trade_orders || []), tradeRef];
      pres.updated_at = now + 600;
      await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

      set(s => ({
        orders: s.orders.map(o => o.id === order!.id ? { ...order! } : o),
        currentOrder: s.currentOrder?.id === order!.id ? { ...order! } : s.currentOrder,
        prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
        currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
      }));
    }

    // 跨标签同步
    bumpConsultationVersion();

    // 返回完整关联数据
    return { prescription: pres, orderRequest: orderReq, tradeOrder: tradeOrderResult?.order || null };
  },

  /** V2.0.0 路径B：患者仅确认处方·暂不下单 */
  patientConfirmPrescriptionOnly: async (prescriptionId) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');
    if (pres.status !== 'AWAITING_PATIENT_CONFIRM') throw new Error('处方状态不可确认');

    pres.status = 'PATIENT_AGREED' as any;
    pres.patient_confirmed_at = now;
    pres.patient_agree_deadline = now + 7 * 86400000; // 7天下单有效期
    pres.timeline.push({ time: now, from: 'AWAITING_PATIENT_CONFIRM', to: 'PATIENT_AGREED', operator: 'PATIENT', remark: '仅确认处方·暂不下单·7天有效' });
    pres.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, pres.consultation_order_id);
    if (order) {
      order.status = 'RX_PATIENT_ACCEPTED' as ConsultationOrderState;
      order.timeline.push({ time: now, from: 'RX_AWAITING_PATIENT', to: 'RX_PATIENT_ACCEPTED', operator: 'PATIENT', remark: '患者仅确认处方·保留7天下单权' });
      order.updated_at = now;
      await putItem(CONSULTATION_SIM_STORES.orders, order);
      set(s => ({
        orders: s.orders.map(o => o.id === order.id ? { ...order } : o),
        currentOrder: s.currentOrder?.id === order.id ? { ...order } : s.currentOrder,
      }));
    }

    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));

    bumpConsultationVersion();
    return pres;
  },

  /** V2.0.0：仅确认后7天内使用处方下单 */
  usePrescriptionToOrder: async (prescriptionId, addressId) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');
    if (pres.status !== 'PATIENT_AGREED') throw new Error('处方未确认');
    if (pres.patient_agree_deadline && now > pres.patient_agree_deadline) {
      // 已过期
      pres.status = 'EXPIRED' as any;
      pres.timeline.push({ time: now, from: 'PATIENT_AGREED', to: 'EXPIRED', operator: 'SYSTEM', remark: '7天未下单·处方过期' });
      pres.updated_at = now;
      await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);
      set(s => ({
        prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
        currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
      }));
      throw new Error('处方已过期，请重新问诊开具');
    }

    // 调用路径A逻辑生成订单
    return (get() as any).patientConfirmPrescriptionAndOrder(prescriptionId, addressId);
  },

  /** V2.0.0 增强：患者拒绝处方·含次数追踪（≥3次强制作废） */
  patientRejectPrescription: async (prescriptionId, reason) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');

    const newRejectCount = (pres.reject_count || 0) + 1;
    pres.reject_count = newRejectCount;
    pres.patient_reject_reason = reason;

    if (newRejectCount >= 3) {
      // ≥3次强制作废
      pres.status = 'REVOKED' as any;
      pres.timeline.push({ time: now, from: 'AWAITING_PATIENT_CONFIRM', to: 'REVOKED', operator: 'SYSTEM', remark: `拒绝${newRejectCount}次·强制作废·原因: ${reason}` });
    } else {
      // <3次回退到草稿
      pres.status = 'PATIENT_REJECTED' as any;
      pres.timeline.push({ time: now, from: 'AWAITING_PATIENT_CONFIRM', to: 'PATIENT_REJECTED', operator: 'PATIENT', remark: `第${newRejectCount}次拒绝·原因: ${reason}` });
    }
    pres.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, pres.consultation_order_id);
    if (order) {
      if (newRejectCount >= 3) {
        order.status = 'RX_PATIENT_REJECTED' as ConsultationOrderState;
        order.timeline.push({ time: now, from: 'RX_AWAITING_PATIENT', to: 'RX_PATIENT_REJECTED', operator: 'SYSTEM', remark: `处方拒绝${newRejectCount}次·强制作废` });
      } else {
        order.status = 'RX_PATIENT_REJECTED' as ConsultationOrderState;
        order.timeline.push({ time: now, from: 'RX_AWAITING_PATIENT', to: 'RX_PATIENT_REJECTED', operator: 'PATIENT', remark: `第${newRejectCount}次拒绝·医生可修改` });
      }
      order.updated_at = now;
      await putItem(CONSULTATION_SIM_STORES.orders, order);
      set(s => ({
        orders: s.orders.map(o => o.id === order.id ? { ...order } : o),
        currentOrder: s.currentOrder?.id === order.id ? { ...order } : s.currentOrder,
      }));
    }

    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));

    bumpConsultationVersion();
  },

  /** V2.0.0：医生修改处方后重新提交（从 PATIENT_REJECTED / DRAFT / OUT_OF_STOCK） */
  resubmitPrescription: async (prescriptionId, updates) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');
    Object.assign(pres, updates);
    // 重置审核状态
    pres.reviewed_at = undefined as any;
    pres.pharmacist_id = undefined as any;
    pres.review_notes = undefined as any;
    pres.status = 'SUBMITTED' as any;
    pres.timeline.push({ time: now, from: 'DRAFT', to: 'SUBMITTED', operator: 'DOCTOR', remark: '修改后重新提交' });
    // 重新走CA+审核（停在PENDING_AUDIT）
    pres.status = 'CA_SIGNED' as any;
    pres.ca_certificate_id = 'sim-ca-auto';
    pres.ca_signed_at = now + 100;
    pres.timeline.push({ time: now + 100, from: 'SUBMITTED', to: 'CA_SIGNED', operator: 'CA_SYSTEM' });
    pres.status = 'PENDING_AUDIT' as any;
    pres.timeline.push({ time: now + 200, from: 'CA_SIGNED', to: 'PENDING_AUDIT', operator: 'SYSTEM', remark: '修改后重新推送药师审核' });
    pres.patient_reject_reason = undefined;
    pres.updated_at = now + 200;
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, pres.consultation_order_id);
    if (order) {
      order.status = 'PRESCRIPTION_APPROVED' as ConsultationOrderState;
      order.timeline.push({ time: now + 200, from: 'RX_PATIENT_REJECTED', to: 'PRESCRIPTION_APPROVED', operator: 'SYSTEM', remark: '处方已修改·重新推送药师审核' });
      order.updated_at = now + 200;
      await putItem(CONSULTATION_SIM_STORES.orders, order);
      set(s => ({
        orders: s.orders.map(o => o.id === order.id ? { ...order } : o),
        currentOrder: s.currentOrder?.id === order.id ? { ...order } : s.currentOrder,
      }));
    }

    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));
  },

  /** 药师审核通过处方：PENDING_AUDIT → AWAITING_PATIENT_CONFIRM */
  pharmacistReviewPrescription: async (prescriptionId, pharmacistId, notes?) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');
    if (pres.status !== 'PENDING_AUDIT' && pres.status !== ('PENDING_AUDIT' as any)) {
      throw new Error('处方状态不是待审核');
    }

    pres.status = 'AWAITING_PATIENT_CONFIRM' as any;
    pres.pharmacist_id = pharmacistId;
    pres.reviewed_at = now;
    pres.review_notes = notes || '审核通过';
    pres.patient_confirm_deadline = now + 72 * 3600000;
    pres.timeline.push({
      time: now, from: 'PENDING_AUDIT', to: 'AWAITING_PATIENT_CONFIRM',
      operator: 'PHARMACIST', remark: notes || '药师审核通过·推送患者确认·72h倒计时',
    });
    pres.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, pres.consultation_order_id);
    if (order) {
      order.status = 'RX_AWAITING_PATIENT' as ConsultationOrderState;
      // V2.2.3：关联处方ID到问诊订单，实现问诊↔处方双向关联
      order.prescription_id = prescriptionId;
      order.timeline.push({
        time: now, from: 'PRESCRIPTION_APPROVED', to: 'RX_AWAITING_PATIENT',
        operator: 'PHARMACIST', remark: '药师审核通过·处方待患者确认',
      });
      order.updated_at = now;
      await putItem(CONSULTATION_SIM_STORES.orders, order);
      set(s => ({
        orders: s.orders.map(o => o.id === order.id ? { ...order } : o),
        currentOrder: s.currentOrder?.id === order.id ? { ...order } : s.currentOrder,
      }));
    }

    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));
    bumpConsultationVersion();
  },

  /** 药师驳回处方：PENDING_AUDIT → REJECTED（医生需修改后重新提交） */
  pharmacistRejectPrescription: async (prescriptionId, pharmacistId, reason) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');
    if (pres.status !== 'PENDING_AUDIT' && pres.status !== ('PENDING_AUDIT' as any)) {
      throw new Error('处方状态不是待审核');
    }

    pres.status = 'AUDIT_REJECTED' as any;
    pres.pharmacist_id = pharmacistId;
    pres.reviewed_at = now;
    pres.review_notes = reason;
    pres.timeline.push({
      time: now, from: 'PENDING_AUDIT', to: 'AUDIT_REJECTED',
      operator: 'PHARMACIST', remark: `驳回原因：${reason}`,
    });
    pres.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    const order = await getById<ConsultationOrder>(CONSULTATION_SIM_STORES.orders, pres.consultation_order_id);
    if (order) {
      order.status = 'PENDING_PRESCRIPTION' as ConsultationOrderState;
      order.timeline.push({
        time: now, from: 'PRESCRIPTION_APPROVED', to: 'PENDING_PRESCRIPTION',
        operator: 'PHARMACIST', remark: `药师驳回处方：${reason}`,
      });
      order.updated_at = now;
      await putItem(CONSULTATION_SIM_STORES.orders, order);
      set(s => ({
        orders: s.orders.map(o => o.id === order.id ? { ...order } : o),
        currentOrder: s.currentOrder?.id === order.id ? { ...order } : s.currentOrder,
      }));
    }

    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));
    bumpConsultationVersion();
  },

  /** V2.0.0：药房缺货处理 */
  handlePrescriptionStockout: async (prescriptionId) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');
    if (pres.status !== 'FLOWING') throw new Error('处方状态不是流转中');

    pres.status = 'OUT_OF_STOCK' as any;
    pres.timeline.push({ time: now, from: 'FLOWING', to: 'OUT_OF_STOCK', operator: 'SYSTEM', remark: '药房库存不足' });
    pres.updated_at = now;
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));
    bumpConsultationVersion();
  },

  /** V2.0.0：更换药房 */
  switchPrescriptionPharmacy: async (prescriptionId, pharmacyId, pharmacyName) => {
    const now = Date.now();
    const pres = await getById<Prescription>(CONSULTATION_SIM_STORES.prescriptions, prescriptionId);
    if (!pres) throw new Error('处方不存在');
    if (pres.status !== 'OUT_OF_STOCK') throw new Error('处方状态不是缺货');

    pres.status = 'PHARMACY_SWITCHING' as any;
    pres.pharmacy_id = pharmacyId;
    pres.timeline.push({ time: now, from: 'OUT_OF_STOCK', to: 'PHARMACY_SWITCHING', operator: 'PATIENT', remark: `更换药房: ${pharmacyName}` });
    pres.updated_at = now;

    // 自动完成换药房 → 流转中
    pres.status = 'FLOWING' as any;
    pres.timeline.push({ time: now + 100, from: 'PHARMACY_SWITCHING', to: 'FLOWING', operator: 'SYSTEM', remark: `新药房接单: ${pharmacyName}` });
    pres.updated_at = now + 100;
    await putItem(CONSULTATION_SIM_STORES.prescriptions, pres);

    set(s => ({
      prescriptions: s.prescriptions.map(p => p.id === prescriptionId ? { ...pres } : p),
      currentPrescription: s.currentPrescription?.id === prescriptionId ? { ...pres } : s.currentPrescription,
    }));
    bumpConsultationVersion();
  },

  // ========== 档案 ==========

  loadArchive: async (patientId) => {
    const archives = await getStore<PatientHealthArchive>(CONSULTATION_SIM_STORES.archives);
    const archive = archives.find(a => a.patient_id === patientId);
    set({ currentArchive: archive || null });
  },

  updateArchive: async (patientId, updates) => {
    const archive = await getById<PatientHealthArchive>(CONSULTATION_SIM_STORES.archives, patientId);
    if (!archive) return;
    Object.assign(archive, updates, { updated_at: Date.now() });
    await putItem(CONSULTATION_SIM_STORES.archives, archive);
    set(s => ({
      currentArchive: s.currentArchive?.patient_id === patientId ? { ...archive } : s.currentArchive,
      archives: s.archives.map(a => a.patient_id === patientId ? { ...archive } : a),
    }));
  },

  authorizeArchive: async (patientId, doctorId, orderId) => {
    const now = Date.now();
    const auth: ArchiveAuthorization = {
      id: generateId('auth'), patient_id: patientId, doctor_id: doctorId,
      consultation_order_id: orderId, scope: 'SINGLE_CONSULTATION',
      fields_granted: ['name', 'current_medications', 'medical_history', 'allergies', 'height_cm', 'weight_kg'],
      granted_at: now,
    };
    await putItem(CONSULTATION_SIM_STORES.authorizations, auth);
  },

  // ========== 药房比价 ==========

  loadPharmacyPrices: async (_genericName) => {
    const prices = await getStore<PharmacyPrice>(CONSULTATION_SIM_STORES.pharmacyPrices);
    set({ pharmacyPrices: prices });
    return prices;
  },

  // ========== 推荐 ==========

  loadRecommends: async (orderId) => {
    const all = await getStore<PostConsultRecommend>(CONSULTATION_SIM_STORES.recommends);
    const recs = all.filter(r => r.consultation_order_id === orderId);
    set({ recommends: recs });
  },

  clickRecommendItem: async (orderId, skuId) => {
    const recs = get().recommends;
    const rec = recs.find(r => r.consultation_order_id === orderId);
    if (rec && !rec.items_clicked.includes(skuId)) {
      rec.items_clicked = [...rec.items_clicked, skuId];
      await putItem(CONSULTATION_SIM_STORES.recommends, rec);
      set({ recommends: recs.map(r => r.id === rec.id ? { ...rec } : r) });
    }
  },

  // ========== 状态辅助 ==========

  getStateLabel: (state: string) => {
    const labels: Record<string, string> = {
      CREATED: '已创建', PAID: '已支付', PENDING_ACCEPT: '等待接诊', ACCEPTED: '已接诊',
      IN_CONSULT: '问诊中', PENDING_PRESCRIPTION: '待开方', PRESCRIPTION_SUBMITTED: '处方已开具',
      PRESCRIPTION_SIGNED: 'CA已签名', PRESCRIPTION_APPROVED: '处方已审核', RX_AWAITING_PATIENT: '待确认处方',
      RX_PATIENT_ACCEPTED: '已同意处方', RX_PATIENT_REJECTED: '已拒绝处方', PRESCRIPTION_FLOWING: '处方流转中',
      WAITING_PATIENT_CONFIRM: '待确认', PATIENT_CONFIRMED: '已确认', RECOMMENDATION_SHOWN: '已推荐',
      EVALUATED: '已评价', TIMEOUT_REFUNDED: '超时退款', DISPUTING: '纠纷中', ARBITRATING: '仲裁中',
      PARTIAL_REFUNDED: '部分退款',
    };
    return labels[state] || state;
  },

  getAllowedActions: (order, role) => {
    const nextStates = CONSULTATION_ORDER_TRANSITIONS[order.status] || [];
    const actions: string[] = [];

    if (role === 'PATIENT') {
      if (nextStates.includes('PAID')) actions.push('pay');
      if (nextStates.includes('PATIENT_CONFIRMED')) actions.push('confirmComplete');
      if (nextStates.includes('RX_PATIENT_ACCEPTED')) actions.push('acceptPrescription');
      if (nextStates.includes('RX_PATIENT_REJECTED')) actions.push('rejectPrescription');
      if (nextStates.includes('EVALUATED')) actions.push('evaluate');
      if (nextStates.includes('DISPUTING')) actions.push('refund');
    }

    if (role === 'DOCTOR') {
      if (nextStates.includes('ACCEPTED')) actions.push('accept');
      if (nextStates.includes('IN_CONSULT')) actions.push('startConsult');
      if (nextStates.includes('PENDING_PRESCRIPTION')) actions.push('prescribe');
      if (nextStates.includes('WAITING_PATIENT_CONFIRM')) actions.push('finishConsult');
      if (nextStates.includes('PRESCRIPTION_SUBMITTED')) actions.push('resubmitPrescription');
    }

    if (role === 'ADMIN') {
      if (nextStates.includes('ARBITRATING')) actions.push('arbitrate');
      if (nextStates.includes('PARTIAL_REFUNDED')) actions.push('partialRefund');
    }

    return actions;
  },

  /** V2.3.0：通过phone/name解析问诊医生ID（merchantStore ID → consultation doctor ID 映射）
   *  增加多层兜底：
   *  1. phone 精确匹配
   *  2. name 精确匹配
   *  3. 自动注册ID模式匹配（doc-auto-XXX，由 createOrder 自动创建）
   *  若全部失败返回 null，调用方应使用全量加载+客户端过滤兜底
   */
  resolveDoctorConsultId: (phone?: string, name?: string) => {
    const doctors = get().doctors;
    if (phone) {
      const byPhone = doctors.find(d => d.phone === phone);
      if (byPhone) return byPhone.id;
    }
    if (name) {
      const byName = doctors.find(d => d.name === name);
      if (byName) return byName.id;
    }
    // 兜底：自动注册ID模式（createOrder 自动创建）
    if (phone) {
      const autoMatch = doctors.find(d => d.id.startsWith('doc-auto-') && d.phone === phone);
      if (autoMatch) return autoMatch.id;
    }
    return null;
  },
}));
