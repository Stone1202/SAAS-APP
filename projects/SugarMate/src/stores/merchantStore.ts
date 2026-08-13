/**
 * 统一商家/成员 Store V1.0.0
 * 
 * 职责：
 * 1. 统一所有角色（药房/医生/药师/营养师）的 CRUD
 * 2. 连接入驻申请→审核通过→商家创建→证照沉淀→合同生成→评级初始化
 * 3. 为所有管理页面提供统一数据和操作接口
 * 
 * 数据流：
 *   入驻申请(onboardingStore) ──审核通过──→ merchantStore.merchants
 *   管理页添加(admin_add) ──创建──→ merchantStore.merchants (直接进入PENDING审核)
 *   修改/删除 ──更新──→ merchantStore.merchants
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useOnboardingStore } from './onboardingStore';
import type {
  MerchantRole,
  MerchantLifecycleStatus,
  MerchantEntity,
  Certificate,
  StatusChange,
  ReviewLog,
  ContractData,
  Rating,
} from '@/contracts/merchant';
import {
  normalizeRole,
  canTransition,
  STATUS_LABEL,
  mapCertLabelToEnum,
  STATUS_COLOR,
  ROLE_LABEL,
  ROLE_COLOR,
  getRoleFieldConfig,
  getRequiredCertsForRole,
} from '@/contracts/merchant';

// ==================== 类型 ====================

export interface MerchantRecord {
  id: string;
  role: MerchantRole;
  lifecycleStatus: MerchantLifecycleStatus;
  entityType: 'INSTITUTION' | 'INDIVIDUAL';
  statusHistory: StatusChange[];
  reviewLogs: ReviewLog[];

  // 基本信息
  name: string;
  phone: string;
  email?: string;
  gender?: 'M' | 'F';
  idCard?: string;

  // 机构信息
  company?: string;
  businessScope?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;

  // 专业信息
  department?: string;
  title?: string;
  specialties: string[];

  // 药师特定
  licenseNo?: string;
  affiliatedPharmacyId?: string;
  affiliatedPharmacyName?: string;

  // 绑定药房（Contract 层字段名，与 affiliatedPharmacy 同义）
  boundPharmacyId?: string;
  boundPharmacyName?: string;

  // 证照
  certificates: Certificate[];

  // 合同
  contract?: ContractData;

  // 评级
  rating?: Rating;

  // 运营数据
  totalOrders: number;
  totalRevenue: number;

  // 时间戳
  submittedAt?: number;
  joinedAt?: number;
  createdAt: number;
  updatedAt: number;

  // 来源
  source: 'apply' | 'admin_add';
  applyNo?: string;  // 入驻申请编号
}

// 按角色筛选的管理列表条目
export interface MerchantListItem {
  id: string;
  role: MerchantRole;
  lifecycleStatus: MerchantLifecycleStatus;
  name: string;
  phone: string;
  company?: string;
  department?: string;
  title?: string;
  province?: string;
  city?: string;
  licenseNo?: string;
  totalOrders: number;
  totalRevenue: number;
  joinedAt?: number;
  createdAt: number;
}

// ==================== 角色专用字段映射 ====================
const ROLE_LIST_FIELDS: Record<MerchantRole, { title: string; subtitle: string; extra: string }> = {
  PHARMACY:    { title: 'company', subtitle: 'address', extra: 'licenseNo' },
  DOCTOR:      { title: 'company', subtitle: 'department', extra: 'title' },
  PHARMACIST:  { title: 'company', subtitle: 'licenseNo', extra: 'title' },
  NUTRITIONIST:{ title: 'company', subtitle: 'title', extra: 'specialties' },
  HEALTH_MANAGER: { title: 'company', subtitle: 'title', extra: 'specialties' },
};

export function getRoleDisplayFields(record: MerchantRecord) {
  const mapping = ROLE_LIST_FIELDS[record.role];
  return {
    title: (record as any)[mapping.title] || record.name,
    subtitle: (record as any)[mapping.subtitle] || '',
    extra: mapping.extra === 'specialties' 
      ? record.specialties?.join('、') 
      : (record as any)[mapping.extra] || '',
  };
}

// ==================== 生成唯一 ID ====================
let idCounter = 1000;
// Cross-store sync loop guard (P1-6)
let _lastSyncOpKey = '';
let _lastSyncTs = 0;
function genId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

function genApplyNo(role: MerchantRole): string {
  const prefix = role.substring(0, 2).toUpperCase();
  return `AP-${prefix}-${Date.now().toString(36).toUpperCase()}-${String(++idCounter).padStart(3, '0')}`;
}

/** 去重：保留每个 id 的最新记录 */
function deduplicateMerchants(list: MerchantRecord[]): MerchantRecord[] {
  const map = new Map<string, MerchantRecord>();
  for (const item of list) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

// ==================== 商家 Store ====================

interface MerchantStore {
  /** 所有商家（已通过入驻或管理端添加的） */
  merchants: MerchantRecord[];

  // === 初始化 ===
  initMockData: () => void;

  // === 查询 ===
  getMerchantById: (id: string) => MerchantRecord | undefined;
  getMerchantsByRole: (role: MerchantRole) => MerchantRecord[];
  getMerchantsByStatus: (status: MerchantLifecycleStatus) => MerchantRecord[];
  searchMerchants: (keyword: string, role?: MerchantRole) => MerchantRecord[];
  /** 获取所有已上线的医生（供患者端医生列表使用） */
  getOnlineDoctors: () => MerchantRecord[];

  // === CRUD ===
  /** 管理端手动添加（来源 admin_add，直接进入 PENDING 审核） */
  addMerchant: (data: Omit<Partial<MerchantRecord>, 'id' | 'createdAt' | 'updatedAt'> & { role: MerchantRole; name: string; phone: string }) => MerchantRecord;
  
  /** 编辑商家信息 */
  updateMerchant: (id: string, data: Partial<MerchantRecord>) => void;
  
  /** 删除商家 */
  deleteMerchant: (id: string) => void;

  // === 入驻审批→商家创建联动 ===
  /** 入驻申请审核通过后，创建对应的商家记录并沉淀证照 */
  onboardToMerchant: (
    applyId: string,
    role: string,  // 支持旧编码 PH/DR/PR/NT
    name: string,
    phone: string,
    extra: Record<string, any>,
    certificates: Certificate[],
    reviewer: string,
  ) => MerchantRecord;

  // === 状态变更 ===
  changeStatus: (id: string, to: MerchantLifecycleStatus, operator: string, note?: string) => boolean;

  // === 审核操作 ===
  approveInfo: (id: string, reviewer: string, comment: string) => void;
  approveCerts: (id: string, reviewer: string, comment: string) => void;
  requestSupplement: (id: string, reviewer: string, reason: string) => void;
  rejectMerchant: (id: string, reviewer: string, reason: string) => void;
  approveMerchant: (id: string, reviewer: string, comment: string) => void;

  // === 签约操作 ===
  sendContract: (id: string) => void;
  signContract: (id: string) => void;

  // === 上线/冻结 ===
  setOnline: (id: string, operator: string) => void;
  freezeMerchant: (id: string, operator: string, reason: string) => void;

  // === 证照管理 ===
  addCertificate: (merchantId: string, cert: Certificate) => void;
  updateCertificate: (merchantId: string, certId: string, updates: Partial<Certificate>) => void;

  // === 合同管理 ===
  updateContract: (merchantId: string, contract: Partial<ContractData>) => void;

  // === 评级 ===
  updateRating: (merchantId: string, rating: Rating) => void;
}

// ==================== Mock 数据 ====================
const MOCK_MERCHANTS: MerchantRecord[] = [
  {
    id: 'MR-001',
    role: 'PHARMACY',
    lifecycleStatus: 'ONLINE',
    entityType: 'INSTITUTION',
    statusHistory: [
      { id: 'sh-1', from: 'DRAFT', to: 'PENDING', at: Date.now() - 1209600000, operator: '申请人', note: '提交入驻申请' },
      { id: 'sh-2', from: 'PENDING', to: 'INFO_APPROVED', at: Date.now() - 1123200000, operator: '运营王芳', note: '信息审核通过' },
      { id: 'sh-3', from: 'INFO_APPROVED', to: 'CERT_APPROVED', at: Date.now() - 1036800000, operator: '运营王芳', note: '资质审核通过' },
      { id: 'sh-4', from: 'CERT_APPROVED', to: 'APPROVED', at: Date.now() - 950400000, operator: '运营王芳', note: '审核通过' },
      { id: 'sh-5', from: 'APPROVED', to: 'SIGNING', at: Date.now() - 864000000, operator: '系统', note: '发送电子合同' },
      { id: 'sh-6', from: 'SIGNING', to: 'SIGNED', at: Date.now() - 777600000, operator: '申请人', note: '完成签约' },
      { id: 'sh-7', from: 'SIGNED', to: 'ONLINE', at: Date.now() - 432000000, operator: '运营王芳', note: '正式上线' },
    ],
    reviewLogs: [
      { id: 'rv-1', step: 'info_review', result: 'ok', reviewedBy: '运营王芳', reviewedAt: Date.now() - 1123200000, comment: '信息核对无误' },
      { id: 'rv-2', step: 'cert_review', result: 'ok', reviewedBy: '运营王芳', reviewedAt: Date.now() - 1036800000, comment: '资质齐全有效' },
    ],
    name: '仁心大药房',
    phone: '13800001111',
    company: '仁心大药房有限公司',
    licenseNo: '91440101MA5ABCD123',
    businessScope: '处方药、OTC药品、医疗器械、保健食品、胰岛素冷链',
    province: '广东省',
    city: '广州市',
    district: '越秀区',
    address: '中山路100号',
    certificates: [
      { id: 'cert-1', certNo: 'BL-2025001', type: 'BUSINESS_LICENSE', name: '营业执照正本.jpg', status: 'valid' },
      { id: 'cert-2', certNo: 'ML-2025001', type: 'MEDICAL_LICENSE', name: '药品经营许可证.pdf', status: 'valid', expireAt: Date.now() + 365 * 86400000 },
      { id: 'cert-3', certNo: 'GSP-2025001', type: 'GSP_CERT', name: 'GSP认证证书.pdf', status: 'valid', expireAt: Date.now() + 180 * 86400000 },
    ],
    contract: { contractId: 'CTR-2026-001', contractNo: 'CTR-2026-001234', status: 'signed', signedAt: Date.now() - 777600000 },
    rating: { level: 'A', score: 4.5, serviceScore: 92, qualityScore: 95, fulfillmentRate: 0.98, totalOrders: 2850 },
    specialties: [],
    totalOrders: 2850,
    totalRevenue: 12580000,
    submittedAt: Date.now() - 1209600000,
    joinedAt: Date.now() - 432000000,
    createdAt: Date.now() - 1209600000,
    updatedAt: Date.now() - 432000000,
    source: 'apply',
    applyNo: 'AP-PH-2025001',
  },
  {
    id: 'MR-002',
    role: 'DOCTOR',
    lifecycleStatus: 'ONLINE',
    entityType: 'INDIVIDUAL',
    statusHistory: [
      { id: 'sh-8', from: 'DRAFT', to: 'PENDING', at: Date.now() - 960000000, operator: '申请人', note: '提交入驻申请' },
      { id: 'sh-9', from: 'PENDING', to: 'INFO_APPROVED', at: Date.now() - 864000000, operator: '运营王芳', note: '信息审核通过' },
      { id: 'sh-10', from: 'INFO_APPROVED', to: 'CERT_APPROVED', at: Date.now() - 777600000, operator: '运营王芳', note: '资质审核通过' },
      { id: 'sh-11', from: 'CERT_APPROVED', to: 'APPROVED', at: Date.now() - 691200000, operator: '运营王芳', note: '审核通过' },
      { id: 'sh-12', from: 'APPROVED', to: 'SIGNING', at: Date.now() - 604800000, operator: '系统', note: '发送电子合同' },
      { id: 'sh-13', from: 'SIGNING', to: 'SIGNED', at: Date.now() - 518400000, operator: '申请人', note: '完成签约' },
      { id: 'sh-14', from: 'SIGNED', to: 'ONLINE', at: Date.now() - 432000000, operator: '运营王芳', note: '正式上线' },
    ],
    reviewLogs: [
      { id: 'rv-3', step: 'info_review', result: 'ok', reviewedBy: '运营王芳', reviewedAt: Date.now() - 864000000, comment: '医生资格信息核对无误' },
      { id: 'rv-4', step: 'cert_review', result: 'ok', reviewedBy: '运营王芳', reviewedAt: Date.now() - 777600000, comment: '医师执业证齐全有效' },
    ],
    name: '张明',
    phone: '13800002222',
    gender: 'M',
    idCard: '440101197806152345',
    company: '广州市第一人民医院',
    department: '内分泌科',
    title: '主任医师',
    specialties: ['2型糖尿病', '糖尿病肾病', '妊娠糖尿病'],
    province: '广东省',
    city: '广州市',
    certificates: [
      { id: 'cert-4', certNo: 'DC-2025001', type: 'DOCTOR_CERT', name: '执业医师资格证.pdf', status: 'valid', expireAt: Date.now() + 730 * 86400000 },
    ],
    contract: { contractId: 'CTR-2026-002', contractNo: 'CTR-2026-002345', status: 'signed', signedAt: Date.now() - 518400000 },
    rating: { level: 'S', score: 4.8, serviceScore: 96, qualityScore: 98, fulfillmentRate: 1.0, totalOrders: 4200 },
    totalOrders: 4200,
    totalRevenue: 16800000,
    submittedAt: Date.now() - 960000000,
    joinedAt: Date.now() - 432000000,
    createdAt: Date.now() - 960000000,
    updatedAt: Date.now() - 432000000,
    source: 'apply',
    applyNo: 'AP-DO-2025001',
  },
  {
    id: 'MR-003',
    role: 'PHARMACIST',
    lifecycleStatus: 'ONLINE',
    entityType: 'INDIVIDUAL',
    statusHistory: [
      { id: 'sh-15', from: 'DRAFT', to: 'PENDING', at: Date.now() - 86400000, operator: '管理员', note: '管理端添加，待审核' },
    ],
    reviewLogs: [],
    name: '李芳',
    phone: '13800003333',
    gender: 'F',
    idCard: '440101199005201234',
    licenseNo: 'ZYYS-20251234',
    company: '仁心大药房',
    affiliatedPharmacyId: 'MR-001',
    affiliatedPharmacyName: '仁心大药房',
    province: '广东省',
    city: '广州市',
    certificates: [
      { id: 'cert-5', certNo: 'PC-2025001', type: 'PHARMACIST_CERT', name: '执业药师资格证.pdf', status: 'pending' as any },
    ],
    contract: undefined,
    rating: { level: 'DEFAULT', score: 0, serviceScore: 0, qualityScore: 0, fulfillmentRate: 0, totalOrders: 0 },
    specialties: [],
    totalOrders: 0,
    totalRevenue: 0,
    submittedAt: Date.now() - 86400000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    source: 'admin_add',
  },
  {
    id: 'MR-004',
    role: 'NUTRITIONIST',
    lifecycleStatus: 'ONLINE',
    entityType: 'INDIVIDUAL',
    statusHistory: [],
    reviewLogs: [],
    name: '王营养',
    phone: '13800004444',
    gender: 'F',
    title: '注册营养师',
    specialties: ['糖尿病饮食', '体重管理', '儿童营养'],
    company: '南城营养中心',
    province: '广东省',
    city: '深圳市',
    certificates: [
      { id: 'cert-6', certNo: 'NC-2025001', type: 'NUTRITIONIST_CERT', name: '营养师资格证.pdf', status: 'valid', expireAt: Date.now() + 500 * 86400000 },
    ],
    rating: { level: 'B', score: 3.8, serviceScore: 82, qualityScore: 85, fulfillmentRate: 0.90, totalOrders: 850 },
    totalOrders: 850,
    totalRevenue: 3400000,
    submittedAt: Date.now() - 700000000,
    joinedAt: Date.now() - 600000000,
    createdAt: Date.now() - 700000000,
    updatedAt: Date.now() - 600000000,
    source: 'apply',
    applyNo: 'AP-NU-2025001',
  },
];

// ==================== Store 创建 ====================

export const useMerchantStore = create<MerchantStore>()(
  persist(
    (set, get) => ({
      merchants: [],

      initMockData: () => {
        const state = get();
        // 去重修复（清理可能存在的重复 id）
        const deduped = deduplicateMerchants(state.merchants);
        if (deduped.length !== state.merchants.length) {
          set({ merchants: deduped });
        }
        // 不再在这里 seed MOCK_MERCHANTS —— 种子逻辑已移至 persist.merge，
        // 避免 useEffect 中 initMockData 与 persist rehydration 的竞态条件
      },

      getMerchantById: (id) => get().merchants.find(m => m.id === id),

      getMerchantsByRole: (role) => get().merchants.filter(m => m.role === role),

      getMerchantsByStatus: (status) => get().merchants.filter(m => m.lifecycleStatus === status),

      searchMerchants: (keyword, role) => {
        let list = get().merchants;
        if (role) list = list.filter(m => m.role === role);
        if (keyword) {
          const kw = keyword.toLowerCase();
          list = list.filter(m =>
            m.name?.toLowerCase().includes(kw) ||
            m.phone?.includes(kw) ||
            m.company?.toLowerCase().includes(kw) ||
            m.licenseNo?.toLowerCase().includes(kw)
          );
        }
        return list;
      },

      getOnlineDoctors: () => get().merchants.filter(
        m => m.role === 'DOCTOR' && m.lifecycleStatus === 'ONLINE'
      ),

      // ==================== CRUD ====================

      addMerchant: (data) => {
        const now = Date.now();
        const record: MerchantRecord = {
          id: genId('MR'),
          role: data.role!,
          lifecycleStatus: 'PENDING',
          entityType: (['PHARMACY'] as MerchantRole[]).includes(data.role!) ? 'INSTITUTION' : 'INDIVIDUAL',
          statusHistory: [
            { id: genId('SH'), from: 'DRAFT', to: 'PENDING', at: now, operator: '管理员', note: '管理端添加，进入审核流程' },
          ],
          reviewLogs: [],
          name: data.name || '',
          phone: data.phone || '',
          email: data.email,
          gender: data.gender,
          idCard: data.idCard,
          company: data.company,
          businessScope: data.businessScope,
          province: data.province,
          city: data.city,
          district: data.district,
          address: data.address,
          department: data.department,
          title: data.title,
          specialties: data.specialties || [],
          licenseNo: data.licenseNo,
          affiliatedPharmacyId: data.affiliatedPharmacyId,
          affiliatedPharmacyName: data.affiliatedPharmacyName,
          // 字段名对齐 merchant.ts Contract 层
          boundPharmacyId: data.affiliatedPharmacyId,
          boundPharmacyName: data.affiliatedPharmacyName,
          certificates: data.certificates || [],
          totalOrders: 0,
          totalRevenue: 0,
          submittedAt: now,
          createdAt: now,
          updatedAt: now,
          source: 'admin_add',
          applyNo: genApplyNo(data.role!),
        };
        set(s => ({ merchants: [...s.merchants, record] }));

        // P0-5: 双入口联动 —— 同步写入 onboardingStore
        // 商家通过门户 /status 查询时也能找到运营人员添加的申请记录
        // 修复：MROLE_TO_OROLE 应映射为 onboardingStore 使用的旧编码 (PH/DR/PR/NT/HM)
        const MROLE_TO_OROLE: Record<string, string> = {
          PHARMACY: 'PH', DOCTOR: 'DR',
          PHARMACIST: 'PR', NUTRITIONIST: 'NT',
          HEALTH_MANAGER: 'HM',
        };
        const certs = (data.certificates || []).map(c => ({
          id: c.id || `cert-${Date.now()}-${c.type}`,
          type: c.type,
          name: c.name || `${c.type}.jpg`,
          status: (c.status || 'valid') as 'pending' | 'valid' | 'expired' | 'invalid',
        }));

        useOnboardingStore.getState().createApplication({
          role: MROLE_TO_OROLE[data.role!] || data.role!,
          entityType: record.entityType,
          name: record.name,
          phone: record.phone,
          email: data.email,
          idCard: data.idCard,
          company: data.company,
          businessScope: data.businessScope,
          province: data.province,
          city: data.city,
          district: data.district,
          address: data.address,
          department: data.department,
          title: data.title,
          specialties: data.specialties || [],
          licenseNo: data.licenseNo,
          certificates: certs as any,
        });

        return record;
      },

      updateMerchant: (id, data) => {
        const now = Date.now();
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === id ? { ...m, ...data, updatedAt: now } : m
          ),
        }));
      },

      deleteMerchant: (id) => {
        set(s => ({
          merchants: s.merchants.filter(m => m.id !== id),
        }));
      },

      // ==================== 入驻→商家联动 ====================

      onboardToMerchant: (applyId, role, name, phone, extra, certificates, reviewer) => {
        // 防重复：同一 applyNo 已存在则跳过创建
        const existing = get().merchants.find(m => m.applyNo === applyId);
        if (existing) {
          console.warn('[merchantStore] onboardToMerchant skipped: applyNo already exists', applyId);
          return existing;
        }
        const now = Date.now();
        const normalizedRole = normalizeRole(role);
        const record: MerchantRecord = {
          id: genId('MR'),
          role: normalizedRole,
          lifecycleStatus: 'APPROVED',
          entityType: normalizedRole === 'PHARMACY' ? 'INSTITUTION' : 'INDIVIDUAL',
          statusHistory: [
            { id: genId('SH'), from: 'PENDING', to: 'APPROVED', at: now, operator: reviewer, note: '入驻审核通过，自动创建商家记录' },
          ],
          reviewLogs: [
            { id: genId('RL'), step: 'info_review', result: 'ok', reviewedBy: reviewer, reviewedAt: now, comment: '入驻审核通过' },
            { id: genId('RL'), step: 'cert_review', result: 'ok', reviewedBy: reviewer, reviewedAt: now, comment: '证照已沉淀' },
          ],
          name,
          phone,
          company: extra.company,
          businessScope: Array.isArray(extra.businessScope) ? extra.businessScope.join('、') : extra.businessScope,
          province: extra.province,
          city: extra.city,
          district: extra.district,
          address: extra.address,
          department: extra.department,
          title: extra.title,
          affiliatedPharmacyName: extra.affiliatedPharmacyName,
          specialties: extra.specialties || [],
          licenseNo: extra.licenseNo,
          gender: extra.gender,
          idCard: extra.idCard,
          certificates: certificates.map(c => ({
            ...c,
            type: mapCertLabelToEnum(c.type as string),
            certNo: (c as any).certNo || c.id,
            status: 'valid' as const,
          })),
          // 字段名对齐 merchant.ts Contract 层（同时保留旧名兼容）
          boundPharmacyId: extra.affiliatedPharmacyId,
          boundPharmacyName: extra.affiliatedPharmacyName,
          contract: undefined,
          rating: { level: 'DEFAULT', score: 0, serviceScore: 0, qualityScore: 0, fulfillmentRate: 0, totalOrders: 0 },
          totalOrders: 0,
          totalRevenue: 0,
          submittedAt: now,
          createdAt: now,
          updatedAt: now,
          source: 'apply',
          applyNo: applyId,
        };
        set(s => ({ merchants: [...s.merchants, record] }));
        return record;
      },

      // ==================== 状态变更 ====================

      changeStatus: (id, to, operator, note) => {
        const merchant = get().merchants.find(m => m.id === id);
        if (!merchant) return false;
        if (!canTransition(merchant.lifecycleStatus, to)) return false;

        const now = Date.now();
        const ch: StatusChange = {
          id: genId('SH'),
          from: merchant.lifecycleStatus,
          to,
          at: now,
          operator,
          note,
        };
        const updates: Partial<MerchantRecord> = {
          lifecycleStatus: to,
          statusHistory: [...(merchant.statusHistory || []), ch],
          updatedAt: now,
        };
        if (to === 'ONLINE' && !merchant.joinedAt) {
          updates.joinedAt = now;
        }
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
        // V2.0: 跨 Store 联动 —— 所有状态变更自动同步到 onboardingStore
        // 确保 /status 页面状态与商家管理页面一致
        // 防循环：使用 opKey 去重，同一操作 100ms 内不重复同步（防止 UI 重渲染触发连锁调用）
        const opKey = `${merchant.phone}|${to}`;
        if (_lastSyncOpKey !== opKey || Date.now() - _lastSyncTs > 100) {
          _lastSyncOpKey = opKey;
          _lastSyncTs = Date.now();
          useOnboardingStore.getState().changeAppStatusByPhone(merchant.phone, to);
        }
        return true;
      },

      // ==================== 审核操作 ====================

      approveInfo: (id, reviewer, comment) => {
        const m = get().merchants.find(x => x.id === id);
        if (!m || !canTransition(m.lifecycleStatus, 'INFO_APPROVED')) return;
        const now = Date.now();
        const log: ReviewLog = { id: genId('RL'), step: 'info_review', result: 'ok', reviewedBy: reviewer, reviewedAt: now, comment };
        const success = get().changeStatus(id, 'INFO_APPROVED', reviewer, '信息审核通过');
        if (!success) return;
        // 追加审核日志（changeStatus 只处理状态流转，审核日志需单独追加）
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === id
              ? { ...m, reviewLogs: [...m.reviewLogs, log], updatedAt: now }
              : m
          ),
        }));
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
      },

      approveCerts: (id, reviewer, comment) => {
        const m = get().merchants.find(x => x.id === id);
        if (!m || !canTransition(m.lifecycleStatus, 'CERT_APPROVED')) return;
        const now = Date.now();
        const log: ReviewLog = { id: genId('RL'), step: 'cert_review', result: 'ok', reviewedBy: reviewer, reviewedAt: now, comment };
        const success = get().changeStatus(id, 'CERT_APPROVED', reviewer, '资质审核通过');
        if (!success) return;
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === id
              ? { ...m, reviewLogs: [...m.reviewLogs, log], updatedAt: now }
              : m
          ),
        }));
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
      },

      requestSupplement: (id, reviewer, reason) => {
        const m = get().merchants.find(x => x.id === id);
        if (!m || !canTransition(m.lifecycleStatus, 'NEED_SUPPLEMENT')) return;
        const now = Date.now();
        const log: ReviewLog = { id: genId('RL'), step: 'cert_review', result: 'insufficient', reviewedBy: reviewer, reviewedAt: now, comment: reason };
        const success = get().changeStatus(id, 'NEED_SUPPLEMENT', reviewer, reason);
        if (!success) return;
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === id
              ? { ...m, reviewLogs: [...m.reviewLogs, log], updatedAt: now }
              : m
          ),
        }));
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
      },

      rejectMerchant: (id, reviewer, reason) => {
        const m = get().merchants.find(x => x.id === id);
        if (!m || !canTransition(m.lifecycleStatus, 'REJECTED')) return;
        get().changeStatus(id, 'REJECTED', reviewer, reason);
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
      },

      approveMerchant: (id, reviewer, comment) => {
        const m = get().merchants.find(x => x.id === id);
        if (!m || !canTransition(m.lifecycleStatus, 'APPROVED')) return;
        get().changeStatus(id, 'APPROVED', reviewer, comment || '审核通过');
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
      },

      // ==================== 签约操作 ====================

      sendContract: (id) => {
        const m = get().merchants.find(x => x.id === id);
        if (!m || !canTransition(m.lifecycleStatus, 'SIGNING')) return false;
        const success = get().changeStatus(id, 'SIGNING', '系统', '生成并发送电子合同');
        if (!success) return false;
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === id
              ? { ...m, contract: { contractId: genId('CTR'), status: 'sent' }, updatedAt: Date.now() }
              : m
          ),
        }));
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
        return true;
      },

      signContract: (id) => {
        const m = get().merchants.find(x => x.id === id);
        if (!m) return;
        if (m.lifecycleStatus !== 'SIGNING') {
          throw new Error(`当前状态为 ${m.lifecycleStatus}，无法签约。请先发送电子合同。`);
        }
        if (!m.contract || m.contract.status !== 'sent') {
          throw new Error('未找到已发送的电子合同，无法签约。');
        }
        const success = get().changeStatus(id, 'SIGNED', '商家', '完成电子签约');
        if (!success) return;
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === id
              ? { ...m, contract: { ...m.contract, status: 'signed' as const, signedAt: Date.now() }, updatedAt: Date.now() }
              : m
          ),
        }));
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
      },

      // ==================== 上线/冻结 ====================

      setOnline: (id, operator) => {
        get().changeStatus(id, 'ONLINE', operator, '正式上线');
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
      },

      freezeMerchant: (id, operator, reason) => {
        get().changeStatus(id, 'FROZEN', operator, reason);
        // V2.0: 跨 Store 联动已由 changeStatus 内部完成
      },

      // ==================== 证照管理 ====================

      addCertificate: (merchantId, cert) => {
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === merchantId
              ? { ...m, certificates: [...m.certificates, cert], updatedAt: Date.now() }
              : m
          ),
        }));
      },

      updateCertificate: (merchantId, certId, updates) => {
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === merchantId
              ? {
                  ...m,
                  certificates: m.certificates.map(c =>
                    c.id === certId ? { ...c, ...updates } : c
                  ),
                  updatedAt: Date.now(),
                }
              : m
          ),
        }));
      },

      // ==================== 合同管理 ====================

      updateContract: (merchantId, contract) => {
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === merchantId
              ? { ...m, contract: { ...m.contract, ...contract } as ContractData, updatedAt: Date.now() }
              : m
          ),
        }));
      },

      // ==================== 评级 ====================

      updateRating: (merchantId: string, rating: Rating) => {
        const now = Date.now();
        set(s => ({
          merchants: s.merchants.map(m =>
            m.id === merchantId ? { ...m, rating, updatedAt: now } : m
          ),
        }));
      },
    }),
    {
      name: 'sugarmate-merchant-store',
      // 自定义 merge：保持 Mock 数据与 persist 数据的一致性
      // persist 数据优先 → 空数据时种子 MOCK_MERCHANTS → 自动去重
      // 在 store 创建时同步执行，杜绝 useEffect 竞态覆盖问题
      merge: (persisted: any, current: any) => {
        const merged = { ...current, ...persisted };
        const deduped = deduplicateMerchants(merged.merchants || []);
        if (deduped.length === 0) {
          merged.merchants = MOCK_MERCHANTS;
        } else {
          merged.merchants = deduped;
        }
        return merged;
      },
    }
  )
);

// Re-export common utilities from contracts for convenience
export {
  normalizeRole,
  canTransition,
  STATUS_LABEL,
  STATUS_COLOR,
  ROLE_LABEL,
  ROLE_COLOR,
  CERT_TYPE_LABEL,
  getRoleFieldConfig,
  getRequiredCertsForRole,
};
export type { MerchantRole, MerchantLifecycleStatus, Certificate, StatusChange, ReviewLog, ContractData, Rating };
