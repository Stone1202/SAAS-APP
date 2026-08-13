/**
 * 入驻流程共享 Store — PC后台 + 移动端共用
 * V3.1.0 — 移除培训流程：申请→审核→签约→上线 + 异常流
 *
 * 正常流：DRAFT→PENDING→APPROVED→SIGNING→SIGNED→ONLINE
 * 异常流：
 *   - PENDING→NEED_SUPPLEMENT→PENDING（补充资料重新提交）
 *   - PENDING→REJECTED（审核不通过，不可恢复）
 *   - 任一步骤超时 → SLATimeoutWarning
 *   - DRAFT可随时撤回/作废
 *
 * 角色要求（对齐 PRD §1.3）：
 *   - PH 药店：执照+许可证+GSP+法人ID → 培训考试 → 易宝入网 → 上线
 *   - DR 医生：执业证+ID → 开通问诊配置 → 上线
 *   - PR 药师：执业证+ID+绑定药店 → 药店法人双签 → 上线
 *   - NT：资格证+ID → 上线
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============ 类型 ============

export type OnboardRole = 'PH' | 'DR' | 'PR' | 'NT' | 'HM';

export type OnboardingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'INFO_APPROVED'
  | 'CERT_APPROVED'
  | 'NEED_SUPPLEMENT'
  | 'REJECTED'
  | 'APPROVED'
  | 'SIGNING'
  | 'SIGNED'
  | 'ONLINE'
  | 'FROZEN'
  | 'WITHDRAWN';

export interface StatusChange {
  from: OnboardingStatus;
  to: OnboardingStatus;
  at: number;
  operator: string;
  note: string;
}

export interface Certificate {
  id: string;
  type: string;
  certNo?: string;        // 证照编号（对齐 merchant.ts）
  name: string;
  fileUrl?: string;
  status: 'pending' | 'valid' | 'expired' | 'invalid';
  expiryDate?: string;    // 过期日期字符串（用户输入）
  expireAt?: number;      // 过期时间戳（对齐 merchant.ts）
  issuedAt?: number;      // 颁发时间（对齐 merchant.ts）
  issuer?: string;        // 颁发机构（对齐 merchant.ts）
  notes?: string;
}

export interface ReviewLog {
  id: string;
  step: string;
  result: 'ok' | 'fix' | 'insufficient' | 'N/A';
  reviewedBy: string;
  reviewedAt: number;
  comment: string;
}

export interface ContractInfo {
  contractId: string;
  contractNo?: string;     // 合同编号（对齐 merchant.ts）
  signedAt?: number;
  contractUrl?: string;
  validFrom?: number;      // 合同生效时间（对齐 merchant.ts）
  validTo?: number;        // 合同到期时间（对齐 merchant.ts）
  status: 'pending' | 'sent' | 'signed' | 'expired' | 'terminated';
}

export interface TrainingInfo {
  required: boolean;
  completed: boolean;
  totalModules: number;
  completedModules: number;
  score?: number;
  startedAt?: number;
  completedAt?: number;
  modules: { name: string; passed: boolean; score?: number }[];
}

export interface OnboardingApplication {
  /** 申请 ID */
  id: string;
  /** 角色类型 */
  role: OnboardRole;
  /** 入驻类型 */
  entityType: 'INSTITUTION' | 'INDIVIDUAL';

  // === 基本信息 ===
  name: string;
  phone: string;
  company: string;
  idCard?: string;
  gender?: 'M' | 'F';
  title?: string;
  specialties?: string[];
  address?: string;
  // PH 专有
  legalPerson?: string;
  legalPhone?: string;
  licenseNo?: string;
  bizHours?: string;
  businessScope?: string[];
  // PR 专有
  affiliatedPharmacyId?: string;
  affiliatedPharmacyName?: string;

  // === 状态与流程 ===
  status: OnboardingStatus;
  statusHistory: StatusChange[];
  currentStep: number;     // 当前所在步骤 1-5

  // === 审核 ===
  reviewLogs: ReviewLog[];
  rejectReason?: string;
  supplementItems?: string[];  // 需补充的资料清单

  // === 证照 ===
  certificates: Certificate[];

  // === 签约 ===
  contract?: ContractInfo;

  // === 培训（V3.1.0 已移除，保留字段兼容历史数据） ===
  training?: TrainingInfo;

  // === 时间 ===
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  reviewedAt?: number;
  slaDeadline?: number;   // SLA 审核截止时间（Unix ms）

  // === 上线 ===
  onlineAt?: number;
  serviceEnabled: boolean;
}

// 角色配置
export const ROLE_CONFIG: Record<OnboardRole, {
  label: string;
  icon: string;
  entityType: 'INSTITUTION' | 'INDIVIDUAL';
  requiredCerts: string[];
  requiresTraining: boolean;
  requiresContract: boolean;
  slaDays: number;
}> = {
  PH: {
    label: '药店/药房',
    icon: '🏪',
    entityType: 'INSTITUTION',
    requiredCerts: ['营业执照', '药品经营许可证', 'GSP证书', '食品经营许可证'],
    requiresTraining: false,
    requiresContract: true,
    slaDays: 3,
  },
  DR: {
    label: '医生',
    icon: '👨‍⚕️',
    entityType: 'INDIVIDUAL',
    requiredCerts: ['执业医师资格证', '身份证'],
    requiresTraining: false,
    requiresContract: true,
    slaDays: 2,
  },
  PR: {
    label: '药师',
    icon: '💊',
    entityType: 'INDIVIDUAL',
    requiredCerts: ['执业药师资格证', '身份证'],
    requiresTraining: false,
    requiresContract: true,
    slaDays: 2,
  },
  NT: {
    label: '营养师',
    icon: '🥗',
    entityType: 'INDIVIDUAL',
    requiredCerts: ['营养师资格证', '身份证'],
    requiresTraining: false,
    requiresContract: false,
    slaDays: 1,
  },
  HM: {
    label: '健康管理师',
    icon: '🏥',
    entityType: 'INDIVIDUAL',
    requiredCerts: ['健康管理师资格证', '身份证'],
    requiresTraining: false,
    requiresContract: false,
    slaDays: 1,
  },
};

// 入驻状态转换映射表（对齐 contracts/merchant.ts STATUS_TRANSITIONS 单一事实源）
const ONBOARDING_TRANSITIONS: Record<OnboardingStatus, OnboardingStatus[]> = {
  'DRAFT':           ['PENDING', 'WITHDRAWN'],
  'PENDING':         ['INFO_APPROVED', 'CERT_APPROVED', 'NEED_SUPPLEMENT', 'REJECTED', 'WITHDRAWN'],
  'INFO_APPROVED':   ['CERT_APPROVED', 'NEED_SUPPLEMENT', 'REJECTED'],
  'CERT_APPROVED':   ['APPROVED', 'NEED_SUPPLEMENT', 'REJECTED'],
  'NEED_SUPPLEMENT': ['PENDING'],
  'REJECTED':        [],
  'APPROVED':        ['SIGNING', 'FROZEN'],
  'SIGNING':         ['SIGNED', 'FROZEN', 'REJECTED'],
  'SIGNED':          ['ONLINE', 'FROZEN'],
  'ONLINE':          ['FROZEN'],
  'FROZEN':          ['ONLINE', 'SIGNED', 'APPROVED'],
  'WITHDRAWN':       [],
};

const canTransitionOnboard = (from: OnboardingStatus, to: OnboardingStatus): boolean => {
  return (ONBOARDING_TRANSITIONS[from] || []).includes(to);
};

// 证照类型映射（入驻中文标签 → 统一枚举值）
export const CERT_TYPE_MAP: Record<string, string> = {
  '营业执照': 'BUSINESS_LICENSE',
  '药品经营许可证': 'MEDICAL_LICENSE',
  'GSP证书': 'GSP_CERT',
  '法人身份证': 'ID_CARD',
  '执业医师资格证': 'DOCTOR_CERT',
  '执业药师资格证': 'PHARMACIST_CERT',
  '营养师资格证': 'NUTRITIONIST_CERT',
  '健康管理师资格证': 'HEALTH_MANAGER_CERT',
  '身份证': 'ID_CARD',
  '食品经营许可证': 'FOOD_LICENSE',
  'ICP许可证': 'ICP_LICENSE',
};

// 入驻主流程 4 步骤（V3.1.0 移除培训）
export const ONBOARD_STEPS = [
  { title: '信息提交', description: '基本信息与资质上传' },
  { title: '资质审核', description: '运营审核' },
  { title: '电子签约', description: 'CA数字签名' },
  { title: '配置上线', description: '开通服务' },
];

/** 状态→步骤映射（4 步：信息提交/资质审核/电子签约/配置上线） */
export const STATUS_STEP_MAP: Record<OnboardingStatus, number> = {
  DRAFT: 0,          // 信息提交
  PENDING: 0,        // 信息提交（已提交待审核）
  INFO_APPROVED: 1,  // 资质审核（信息通过）
  CERT_APPROVED: 1,  // 资质审核（资质通过）
  NEED_SUPPLEMENT: 1,// 资质审核（需补充）
  REJECTED: 1,       // 资质审核（已驳回）
  APPROVED: 2,       // 电子签约（审核通过）
  SIGNING: 2,        // 电子签约（签约中）
  SIGNED: 3,         // 配置上线（已签约）
  ONLINE: 3,         // 配置上线
  FROZEN: -1,
  WITHDRAWN: -1,
};

/** 状态中文标签（对齐 merchant.ts STATUS_LABEL） */
export const STATUS_LABEL: Record<OnboardingStatus, string> = {
  DRAFT: '草稿',
  PENDING: '待审核',
  INFO_APPROVED: '信息已审',
  CERT_APPROVED: '资质已审',
  NEED_SUPPLEMENT: '需补充',
  REJECTED: '已驳回',
  APPROVED: '审核通过',
  SIGNING: '签约中',
  SIGNED: '已签约',
  ONLINE: '已上线',
  FROZEN: '已冻结',
  WITHDRAWN: '已撤回',
};

// ============ 模拟数据（3 条 demo 申请） ============
const MOCK_APPS: OnboardingApplication[] = [
  {
    id: 'ONB-001',
    role: 'PH',
    entityType: 'INSTITUTION',
    name: '仁心大药房',
    phone: '13800001111',
    company: '仁心大药房（越秀区）',
    legalPerson: '张伟',
    legalPhone: '13800001112',
    licenseNo: '91440101MA5ABCD123',
    address: '广州市越秀区中山路100号',
    bizHours: '08:00-22:00',
    businessScope: ['处方药', 'OTC药品', '医疗器械', '保健食品', '胰岛素冷链'],
    status: 'PENDING',
    statusHistory: [
      { from: 'DRAFT', to: 'PENDING', at: Date.now() - 86400000, operator: '申请人', note: '提交入驻申请' },
    ],
    currentStep: 1,
    reviewLogs: [],
    certificates: [
      { id: 'cert-1', type: '营业执照', name: '营业执照正本.jpg', status: 'pending' },
      { id: 'cert-2', type: '药品经营许可证', name: '药品经营许可证正本.pdf', status: 'pending' },
      { id: 'cert-3', type: 'GSP证书', name: 'GSP认证证书.pdf', status: 'pending', expiryDate: '2027-06-15' },
      { id: 'cert-4', type: '食品经营许可证', name: '食品经营许可证.pdf', status: 'pending' },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    submittedAt: Date.now() - 86400000,
    slaDeadline: Date.now() + 2 * 86400000,
    serviceEnabled: false,
  },
  {
    id: 'ONB-002',
    role: 'DR',
    entityType: 'INDIVIDUAL',
    name: '李明',
    phone: '13800002222',
    company: '广州市第一人民医院',
    idCard: '440101198506152345',
    gender: 'M',
    title: '副主任医师',
    specialties: ['2型糖尿病', '糖尿病肾病'],
    status: 'NEED_SUPPLEMENT',
    statusHistory: [
      { from: 'DRAFT', to: 'PENDING', at: Date.now() - 172800000, operator: '申请人', note: '提交入驻申请' },
      { from: 'PENDING', to: 'NEED_SUPPLEMENT', at: Date.now() - 7200000, operator: '运营审核', note: '身份证照片模糊，请重新上传' },
    ],
    currentStep: 1,
    reviewLogs: [
      { id: 'rv-1', step: '信息核对', result: 'ok', reviewedBy: '运营王芳', reviewedAt: Date.now() - 7200000, comment: '基本信息核对无误' },
      { id: 'rv-2', step: '资质审核', result: 'insufficient', reviewedBy: '运营王芳', reviewedAt: Date.now() - 7200000, comment: '执业医师证过期，需上传最新证件' },
    ],
    rejectReason: '身份证照片模糊不清，执业医师资格证已过期。请补充：①清晰身份证照片 ②最新有效期内的执业医师证',
    supplementItems: ['身份证正面（人像面）', '身份证反面（国徽面）', '执业医师资格证'],
    certificates: [
      { id: 'cert-5', type: '执业医师资格证', name: '执业医师证.pdf', status: 'expired', expiryDate: '2025-12-31' },
      { id: 'cert-6', type: '身份证', name: '身份证正反面.jpg', status: 'invalid' },
    ],
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
    submittedAt: Date.now() - 172800000,
    reviewedAt: Date.now() - 7200000,
    slaDeadline: Date.now() + 86400000,
    serviceEnabled: false,
  },
  {
    id: 'ONB-003',
    role: 'PH',
    entityType: 'INSTITUTION',
    name: '惠民药房',
    phone: '13900003333',
    company: '惠民药房（天河区）',
    legalPerson: '赵刚',
    legalPhone: '13900003334',
    licenseNo: '91440101MA5WXYZ789',
    address: '广州市天河区体育西路200号',
    bizHours: '09:00-21:00',
    businessScope: ['处方药', 'OTC药品', '医疗器械', '保健品'],
    status: 'ONLINE',
    statusHistory: [
      { from: 'DRAFT', to: 'PENDING', at: Date.now() - 1209600000, operator: '申请人', note: '提交入驻申请' },
      { from: 'PENDING', to: 'INFO_APPROVED', at: Date.now() - 1123200000, operator: '运营审核', note: '基本信息审核通过' },
      { from: 'INFO_APPROVED', to: 'CERT_APPROVED', at: Date.now() - 1036800000, operator: '运营审核', note: '资质审核通过' },
      { from: 'CERT_APPROVED', to: 'APPROVED', at: Date.now() - 950400000, operator: '运营审核', note: '全部审核通过' },
      { from: 'APPROVED', to: 'SIGNING', at: Date.now() - 864000000, operator: '系统', note: '生成电子合同' },
      { from: 'SIGNING', to: 'SIGNED', at: Date.now() - 777600000, operator: '申请人', note: '完成电子签约' },
      { from: 'SIGNED', to: 'ONLINE', at: Date.now() - 432000000, operator: '运营审核', note: '审核通过，正式上线' },
    ],
    currentStep: 3,
    reviewLogs: [
      { id: 'rv-3', step: '信息核对', result: 'ok', reviewedBy: '运营王芳', reviewedAt: Date.now() - 1123200000, comment: '信息核对无误' },
      { id: 'rv-4', step: '资质审核', result: 'ok', reviewedBy: '运营王芳', reviewedAt: Date.now() - 1036800000, comment: '资质齐全有效' },
    ],
    certificates: [
      { id: 'cert-7', type: '营业执照', name: '营业执照正本.jpg', status: 'valid' },
      { id: 'cert-8', type: '药品经营许可证', name: '药品经营许可证正本.pdf', status: 'valid', expiryDate: '2027-08-20' },
      { id: 'cert-9', type: 'GSP证书', name: 'GSP认证证书.pdf', status: 'valid', expiryDate: '2027-03-10' },
      { id: 'cert-10', type: '食品经营许可证', name: '食品经营许可证.pdf', status: 'valid' },
    ],
    contract: {
      contractId: 'CTR-2026-001234',
      signedAt: Date.now() - 777600000,
      status: 'signed',
    },
    // V3.1.0：培训字段保留兼容历史数据，新流程不再使用
    training: {
      required: false,
      completed: false,
      totalModules: 0,
      completedModules: 0,
      modules: [],
    },
    createdAt: Date.now() - 1209600000,
    updatedAt: Date.now() - 432000000,
    submittedAt: Date.now() - 1209600000,
    reviewedAt: Date.now() - 950400000,
    onlineAt: Date.now() - 432000000,
    serviceEnabled: true,
  },
  // PR: 药师 mock 数据
  {
    id: 'ONB-005',
    role: 'PR',
    entityType: 'INDIVIDUAL',
    name: '赵小明',
    phone: '13600005555',
    idCard: '310115198802154321',
    gender: 'M',
    title: '执业药师',
    status: 'PENDING',
    statusHistory: [
      { from: 'DRAFT', to: 'PENDING', at: Date.now() - 86400000, operator: '申请人', note: '提交入驻申请' },
    ],
    currentStep: 1,
    reviewLogs: [],
    certificates: [
      { id: 'cert-13', type: '执业药师资格证', name: '执业药师资格证.pdf', status: 'pending', expiryDate: '2027-03-15' },
      { id: 'cert-14', type: '身份证', name: '身份证正反面.jpg', status: 'pending' },
    ],
    affiliatedPharmacyId: 'MR-001',
    affiliatedPharmacyName: '仁心大药房',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    submittedAt: Date.now() - 86400000,
    slaDeadline: Date.now() + 86400000,
    serviceEnabled: false,
  },
  // NT: 营养师 mock 数据
  {
    id: 'ONB-006',
    role: 'NT',
    entityType: 'INDIVIDUAL',
    name: '孙悦',
    phone: '13600006666',
    idCard: '440106199507086789',
    gender: 'F',
    title: '注册营养师',
    status: 'PENDING',
    statusHistory: [
      { from: 'DRAFT', to: 'PENDING', at: Date.now() - 86400000, operator: '申请人', note: '提交入驻申请' },
    ],
    currentStep: 1,
    reviewLogs: [],
    certificates: [
      { id: 'cert-15', type: '营养师资格证', name: '营养师资格证.pdf', status: 'pending', expiryDate: '2029-01-20' },
      { id: 'cert-16', type: '身份证', name: '身份证正反面.jpg', status: 'pending' },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    submittedAt: Date.now() - 86400000,
    slaDeadline: Date.now() + 2 * 86400000,
    serviceEnabled: false,
  },
];

// ============ Store ============

interface OnboardingStore {
  applications: OnboardingApplication[];
  activeAppId: string | null;

  // 水合完成标志：true 表示已从 localStorage 恢复完毕，可供页面安全读取
  hasHydrated: boolean;

  // 初始化
  initMockData: () => void;

  // 查询
  getAppById: (id: string) => OnboardingApplication | undefined;
  getAppsByStatus: (status: OnboardingStatus) => OnboardingApplication[];
  getAppByOwner: (phone: string) => OnboardingApplication | undefined;

  // 申请端操作
  createApplication: (data: Partial<OnboardingApplication>) => OnboardingApplication;
  submitApplication: (id: string) => void;
  supplementApplication: (id: string, supplements: Partial<OnboardingApplication>) => void;
  withdrawApplication: (id: string) => void;

  // 审核端操作
  approveInfoCheck: (id: string, reviewer: string, comment: string) => void;
  approveCerts: (id: string, reviewer: string, comment: string) => void;
  /** 单证审核：更新指定证件状态（pending/valid/expired/invalid）+ 写入审核日志 */
  updateCertStatus: (id: string, certId: string, certStatus: 'valid' | 'invalid' | 'expired' | 'pending', reviewer: string, note: string) => void;
  requestSupplement: (id: string, reviewer: string, reason: string, items: string[]) => void;
  approveApplication: (id: string, reviewer: string, comment: string) => void;
  rejectApplication: (id: string, reviewer: string, reason: string) => void;

  // 签约操作
  sendContract: (id: string) => boolean;
  signContract: (id: string) => void;

  // P1: 跨 Store 联动 —— 根据手机号更新入驻状态（merchantStore 侧状态变更时回调）
  changeAppStatusByPhone: (phone: string, status: string) => void;

  // 上线
  setOnline: (id: string, reviewer: string, comment: string) => void;
  freezeApplication: (id: string, reviewer: string, reason: string) => void;

  // SLA 检查
  checkSLAStatus: (id: string) => { overtime: boolean; daysLeft: number };
}

const computeNextId = (applications: OnboardingApplication[]): number => {
  if (applications.length === 0) return 4;
  const nums = applications
    .map(a => parseInt(a.id.replace('ONB-', ''), 10))
    .filter(n => !isNaN(n));
  return Math.max(...nums, 0) + 1;
};

/** 生成全局唯一业务编号，防御性循环确保不重复 */
const generateUniqueId = (applications: OnboardingApplication[]): string => {
  let seq = computeNextId(applications);
  let id = `ONB-${String(seq).padStart(3, '0')}`;
  const existingIds = new Set(applications.map(a => a.id));
  while (existingIds.has(id)) {
    seq += 1;
    id = `ONB-${String(seq).padStart(3, '0')}`;
  }
  return id;
};

/** 按 id 去重，保留同一 id 中 createdAt 最新的一条 */
const deduplicateApplications = (apps: OnboardingApplication[]): OnboardingApplication[] => {
  const map = new Map<string, OnboardingApplication>();
  for (const app of apps) {
    const existing = map.get(app.id);
    if (!existing || (app.createdAt || 0) > (existing.createdAt || 0)) {
      map.set(app.id, app);
    }
  }
  return Array.from(map.values()).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      applications: MOCK_APPS,
      activeAppId: null,
      hasHydrated: false,

      initMockData: () => {
        const state = get();
        // 检测并修复已有重复编号（保留最新）
        const deduped = deduplicateApplications(state.applications);
        if (deduped.length !== state.applications.length) {
          set({ applications: deduped });
        }
        // 不再在这里 seed MOCK_APPS —— 种子逻辑已移至 persist.merge，
        // 避免 useEffect 中 initMockData 与 persist rehydration 的竞态条件
        // 导致 localStorage 中审核通过的真实数据被 MOCK_APPS 覆盖
      },

      getAppById: (id) => get().applications.find(a => a.id === id),

      getAppsByStatus: (status) =>
        get().applications.filter(a => a.status === status),

      /**
       * P0 修复：清理孤儿 DRAFT 数据
       * addMerchant 联动创建 application 后，原 MerchantAddDrawer 没用对 ID
       * （createApplication 返回 ONB-XXX，但 drawer 拿的是 AP-XX-XXX-XXX），
       * 导致 DRAFT → PENDING 提交失败，遗留在 store 中被算进 total。
       * 该方法在 store 初始化时自动调用一次，清理已存在的 DRAFT。
       */
      cleanupOrphanDrafts: () => {
        const before = get().applications.length;
        // DRAFT 状态在本系统里没有真实用户来源（createApplication 唯一的调用方是 addMerchant 联动）
        // 任何 DRAFT 都是因 ID 不匹配遗留的孤儿
        const cleaned = get().applications.filter(a => a.status !== 'DRAFT');
        if (cleaned.length !== before) {
          set({ applications: cleaned });
          // 同步写入 persist（如果存在）
          try {
            const raw = localStorage.getItem('sugarmate-onboarding');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.state?.applications) {
                parsed.state.applications = cleaned;
                localStorage.setItem('sugarmate-onboarding', JSON.stringify(parsed));
              }
            }
          } catch (e) {
            // 静默失败，不影响运行时
            console.warn('[onboardingStore] cleanupOrphanDrafts persist 同步失败', e);
          }
          console.info(`[onboardingStore] cleanupOrphanDrafts: ${before} → ${cleaned.length}`);
        }
      },

      getAppByOwner: (phone) => {
        const normalized = (phone || '').trim();
        if (!normalized) return undefined;
        return get().applications.find(a => (a.phone || '').trim() === normalized);
      },

      createApplication: (data) => {
        const state = get();
        const now = Date.now();
        const config = ROLE_CONFIG[data.role!];
        const id = generateUniqueId(state.applications);
        const app: OnboardingApplication = {
          id,
          role: data.role!,
          entityType: config.entityType,
          name: data.name || '',
          phone: data.phone || '',
          company: data.company || '',
          idCard: data.idCard,
          gender: data.gender,
          title: data.title,
          specialties: data.specialties,
          address: data.address,
          legalPerson: data.legalPerson,
          legalPhone: data.legalPhone,
          licenseNo: data.licenseNo,
          bizHours: data.bizHours,
          businessScope: data.businessScope,
          affiliatedPharmacyId: data.affiliatedPharmacyId,
          affiliatedPharmacyName: data.affiliatedPharmacyName,
          status: 'DRAFT',
          statusHistory: [],
          currentStep: 0,
          reviewLogs: [],
          certificates: data.certificates || [],
          createdAt: now,
          updatedAt: now,
          slaDeadline: now + config.slaDays * 86400000,
          serviceEnabled: false,
        };
        set(s => ({
          applications: [...s.applications, app],
          activeAppId: app.id,
        }));
        return app;
      },

      submitApplication: (id) => {
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: 'PENDING' as const,
              currentStep: 1,
              submittedAt: now,
              updatedAt: now,
              slaDeadline: now + ROLE_CONFIG[a.role].slaDays * 86400000,
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'PENDING' as const, at: now, operator: '申请人', note: '提交入驻申请' },
              ],
            };
          }),
        }));
      },

      supplementApplication: (id, supplements) => {
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            // 只重置用户实际重新上传的证照为 pending，不重置所有 invalid 证照
            const updatedCertIds = new Set(
              supplements.certificates?.map((c: Certificate | any) => c.id) || []
            );
            const resetCerts = updatedCertIds.size > 0
              ? a.certificates.map(c =>
                  (c.status === 'invalid' && updatedCertIds.has(c.id))
                    ? { ...c, status: 'pending' as const } : c
                )
              : a.certificates;
            // 合并 supplements.certificates 中的新证照（替换同 ID）
            const mergedCerts = supplements.certificates
              ? resetCerts.map(c => {
                  const repl = (supplements.certificates as Certificate[]).find(x => x.id === c.id);
                  return repl ? { ...c, ...repl, status: 'pending' as const } : c;
                })
              : resetCerts;
            return {
              ...a,
              ...supplements,
              certificates: mergedCerts,
              status: 'PENDING' as const,
              currentStep: 1,
              rejectReason: undefined,
              supplementItems: undefined,
              updatedAt: now,
              slaDeadline: now + ROLE_CONFIG[a.role].slaDays * 86400000,
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'PENDING' as const, at: now, operator: '申请人', note: '补充资料后重新提交' },
              ],
            };
          }),
        }));
      },

      withdrawApplication: (id) => {
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: 'WITHDRAWN' as const,
              updatedAt: now,
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'WITHDRAWN' as const, at: now, operator: '申请人', note: '撤回申请' },
              ],
            };
          }),
        }));
      },

      approveInfoCheck: (id, reviewer, comment) => {
        const app = get().applications.find(a => a.id === id);
        if (!app || !canTransitionOnboard(app.status, 'INFO_APPROVED')) return;
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            const log: ReviewLog = { id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, step: '信息核对', result: 'ok', reviewedBy: reviewer, reviewedAt: now, comment };
            return {
              ...a,
              status: 'INFO_APPROVED' as const,
              currentStep: 1,
              reviewedAt: now,
              updatedAt: now,
              reviewLogs: [...a.reviewLogs, log],
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'INFO_APPROVED' as const, at: now, operator: reviewer, note: '信息审核通过' },
              ],
            };
          }),
        }));
      },

      approveCerts: (id, reviewer, comment) => {
        const app = get().applications.find(a => a.id === id);
        if (!app || !canTransitionOnboard(app.status, 'CERT_APPROVED')) return;
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            const updatedCerts = a.certificates.map(c =>
              c.status === 'pending' ? { ...c, status: 'valid' as const } : c
            );
            const log: ReviewLog = { id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, step: '资质审核', result: 'ok', reviewedBy: reviewer, reviewedAt: now, comment };
            return {
              ...a,
              status: 'CERT_APPROVED' as const,
              certificates: updatedCerts,
              updatedAt: now,
              reviewLogs: [...a.reviewLogs, log],
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'CERT_APPROVED' as const, at: now, operator: reviewer, note: '资质审核通过' },
              ],
            };
          }),
        }));
      },

      updateCertStatus: (id, certId, certStatus, reviewer, note) => {
        const app = get().applications.find(a => a.id === id);
        if (!app) return;
        const cert = app.certificates.find(c => c.id === certId);
        if (!cert) return;
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            const updatedCerts = a.certificates.map(c =>
              c.id === certId ? { ...c, status: certStatus } : c
            );
            const resultMap = { valid: 'ok' as const, pending: 'pending' as const, invalid: 'insufficient' as const, expired: 'insufficient' as const };
            const log: ReviewLog = {
              id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              step: '资质审核',
              result: resultMap[certStatus],
              reviewedBy: reviewer,
              reviewedAt: now,
              comment: `[${cert.type}] ${cert.name} → ${({ valid: '有效', pending: '待审核', invalid: '无效', expired: '已过期' } as const)[certStatus]}。${note}`,
            };
            return {
              ...a,
              certificates: updatedCerts,
              updatedAt: now,
              reviewLogs: [...a.reviewLogs, log],
            };
          }),
        }));
      },

      requestSupplement: (id, reviewer, reason, items) => {
        const app = get().applications.find(a => a.id === id);
        if (!app || !canTransitionOnboard(app.status, 'NEED_SUPPLEMENT')) return;
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            // 只标记 supplementItems 相关的证照为 invalid，不标记全部 pending 证照
            const itemLower = items.map(it => it.toLowerCase());
            const updatedCerts = items.length > 0
              ? a.certificates.map(c =>
                  (c.status === 'pending' && itemLower.some(it =>
                    c.type.toLowerCase().includes(it) || it.includes(c.type.toLowerCase()) || it === '需补充资料'))
                    ? { ...c, status: 'invalid' as const } : c
                )
              : a.certificates;
            const log: ReviewLog = { id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, step: '资质审核', result: 'insufficient', reviewedBy: reviewer, reviewedAt: now, comment: reason };
            return {
              ...a,
              status: 'NEED_SUPPLEMENT' as const,
              rejectReason: reason,
              supplementItems: items,
              certificates: updatedCerts,
              reviewedAt: now,
              updatedAt: now,
              reviewLogs: [...a.reviewLogs, log],
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'NEED_SUPPLEMENT' as const, at: now, operator: reviewer, note: reason },
              ],
            };
          }),
        }));
      },

      approveApplication: (id, reviewer, comment) => {
        const app = get().applications.find(a => a.id === id);
        if (!app || !canTransitionOnboard(app.status, 'APPROVED')) return;
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: 'APPROVED' as const,
              currentStep: 2,
              reviewedAt: now,
              updatedAt: now,
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'APPROVED' as const, at: now, operator: reviewer, note: comment || '审核通过' },
              ],
            };
          }),
        }));
      },

      rejectApplication: (id, reviewer, reason) => {
        const app = get().applications.find(a => a.id === id);
        if (!app || !canTransitionOnboard(app.status, 'REJECTED')) return;
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            const updatedCerts = a.certificates.map(c => ({ ...c, status: 'invalid' as const }));
            return {
              ...a,
              status: 'REJECTED' as const,
              currentStep: 1,
              rejectReason: reason,
              certificates: updatedCerts,
              reviewedAt: now,
              updatedAt: now,
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'REJECTED' as const, at: now, operator: reviewer, note: reason },
              ],
            };
          }),
        }));
      },

      sendContract: (id) => {
        const state = get();
        const application = state.applications.find(a => a.id === id);
        if (!application) return false;

        // P0-1: 状态校验 —— 只有 APPROVED 状态才能发起签约
        if (!canTransitionOnboard(application.status, 'SIGNING')) {
          console.warn(
            `[onboardingStore.sendContract] 非法状态转换: ${application.status} → SIGNING`,
          );
          return false;
        }

        // 角色前缀映射，确保合同编号唯一可辨识
        const ROLE_PREFIX_MAP: Record<string, string> = {
          PHARMACY: 'PX', DOCTOR: 'DR', PHARMACIST: 'PR', NUTRITIONIST: 'NT', HEALTH_MANAGER: 'HM',
          PH: 'PX', DR: 'DR', PR: 'PR', NT: 'NT', HM: 'HM',
        };
        const prefix = ROLE_PREFIX_MAP[application.role] || 'XX';
        // 合同编号使用历史上最大序号 + 1，避免删除记录后序号冲突
        const maxSeq = Math.max(0, ...state.applications
          .filter(a => a.contract?.contractId?.startsWith(`CTR-${prefix}-`))
          .map(a => parseInt(a.contract!.contractId!.split('-')[2], 10) || 0)
        );
        const seq = String(maxSeq + 1).padStart(5, '0');
        const contractId = `CTR-${prefix}-${seq}`;

        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: 'SIGNING' as const,
              currentStep: 2,
              updatedAt: now,
              contract: { contractId, status: 'sent' },
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'SIGNING' as const, at: now, operator: '系统', note: '生成并发送电子合同' },
              ],
            };
          }),
        }));
        return true;
      },

      signContract: (id) => {
        const a = get().applications.find(x => x.id === id);
        if (!a) return;
        if (a.status !== 'SIGNING') {
          throw new Error(`当前状态为 ${a.status}，无法签约。请先发送电子合同。`);
        }
        if (!a.contract || a.contract.status !== 'sent') {
          throw new Error('未找到已发送的电子合同，无法签约。');
        }
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: 'SIGNED' as const,
              currentStep: 3,
              updatedAt: now,
              contract: { ...a.contract, status: 'signed' as const, signedAt: now },
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'SIGNED' as const, at: now, operator: '申请人', note: '完成电子签约' },
              ],
            };
          }),
        }));
      },

      // P1: 跨 Store 联动 —— merchantStore 侧状态变更时同步到入驻状态
      // V2.0: 扩展为支持全部12个入驻状态的双向同步，确保 /status 页双路径入口数据一致
      changeAppStatusByPhone: (phone, status) => {
        // 状态描述映射（用于 statusHistory note）
        const statusNoteMap: Record<string, string> = {
          ONLINE: '正式上线（运营侧同步）',
          FROZEN: '账号冻结（运营侧同步）',
          NEED_SUPPLEMENT: '需补充资料（运营侧同步）',
          REJECTED: '审核驳回（运营侧同步）',
          APPROVED: '审核通过（运营侧同步）',
          INFO_APPROVED: '信息审核通过（运营侧同步）',
          CERT_APPROVED: '资质审核通过（运营侧同步）',
          SIGNING: '待签约（运营侧同步）',
          SIGNED: '已签约（运营侧同步）',
          WITHDRAWN: '已退回（运营侧同步）',
          PENDING: '重新提交审核（运营侧同步）',
          DRAFT: '待提交（运营侧同步）',
        };
        const now = Date.now();
        let matched = false;
        set(s => ({
          applications: s.applications.map(a => {
            if (a.phone !== phone) return a;
            if (a.status === status) return a; // 已经是目标状态，跳过
            matched = true;
            return {
              ...a,
              status: status as any,
              updatedAt: now,
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: status as any, at: now,
                  operator: '系统（运营方）',
                  note: statusNoteMap[status] || `状态变更（运营侧同步）：${status}` },
              ],
            };
          }),
        }));
        if (!matched) {
          console.warn(`[onboardingStore.changeAppStatusByPhone] 未找到匹配入驻记录: phone=${phone}`);
        }
      },

      // V3.1.0：培训流程已移除，签约后直接由运营确认上线
      // startTraining / completeTrainingModule / completeAllTraining 已删除

      setOnline: (id, reviewer, comment) => {
        const app = get().applications.find(a => a.id === id);
        if (!app) return;
        // P1: 状态校验 —— 只有 SIGNED 状态可以上线
        if (!canTransitionOnboard(app.status, 'ONLINE')) {
          console.warn(`[onboardingStore.setOnline] 非法状态转换: ${app.status} → ONLINE`);
          return;
        }
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: 'ONLINE' as const,
              currentStep: 3,
              onlineAt: now,
              updatedAt: now,
              serviceEnabled: true,
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'ONLINE' as const, at: now, operator: reviewer, note: comment || '正式上线' },
              ],
            };
          }),
        }));
      },

      freezeApplication: (id, reviewer, reason) => {
        const app = get().applications.find(a => a.id === id);
        if (!app) return;
        // P1: 状态校验 —— 只有 ONLINE/SIGNED/APPROVED 状态可以冻结
        if (!canTransitionOnboard(app.status, 'FROZEN')) {
          console.warn(`[onboardingStore.freezeApplication] 非法状态转换: ${app.status} → FROZEN`);
          return;
        }
        const now = Date.now();
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: 'FROZEN' as const,
              serviceEnabled: false,
              updatedAt: now,
              statusHistory: [
                ...a.statusHistory,
                { from: a.status, to: 'FROZEN' as const, at: now, operator: reviewer, note: reason },
              ],
            };
          }),
        }));
      },

      checkSLAStatus: (id) => {
        const app = get().applications.find(a => a.id === id);
        if (!app || !app.slaDeadline) return { overtime: false, daysLeft: 0 };
        const now = Date.now();
        const daysLeft = Math.ceil((app.slaDeadline - now) / 86400000);
        return { overtime: daysLeft <= 0, daysLeft };
      },
    }),
    {
      name: 'sugarmate-onboarding',
      // 监听 rehydration 完成：解决页面刷新/新标签页打开时，
      // /status 查询在 localStorage 异步加载完成前就触发导致的"查不到"问题
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (!error) {
            useOnboardingStore.setState({ hasHydrated: true });
          }
        };
      },
      // 自定义 merge：保持 Mock 数据与 persist 数据的一致性
      // persist 数据优先 → 空数据时种子 MOCK_APPS → 去重修复
      // 在 store 创建时同步执行，杜绝 useEffect 竞态覆盖问题
      merge: (persisted: any, current: any) => {
        const merged = { ...current, ...persisted };
        const deduped = deduplicateApplications(merged.applications || []);
        if (deduped.length === 0) {
          merged.applications = MOCK_APPS;
        } else {
          merged.applications = deduped;
        }
        return merged;
      },
    }
  )
);
