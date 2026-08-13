import { create } from 'zustand';
import { SIM_SHARED } from '../adapters/sim';
import { useMerchantStore } from './merchantStore';

// ============================================================
// 患者 & 医管 用户类型
// ============================================================
export interface PatientUser {
  id: string;
  name: string;
  phone: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  diabetes_type?: 'type1' | 'type2' | 'gestational' | 'prediabetes';
  avatar?: string;
  // 客户池同步字段
  age?: number;
  diagnosis_duration?: string;
  tags?: string[];
  member_level?: string;      // 从 tags 推断：VIP→金卡，CGM用户→银卡，其他→普通
  health_score?: number;      // 健康积分（基于客户 ID 确定性生成）
  checkin_days?: number;      // 连续打卡天数（基于客户 ID 确定性生成）
  bg_rate?: number;           // 血糖达标率 %（基于客户 ID 确定性生成）
}

export type MedicalRole = 'DOCTOR' | 'PHARMACIST' | 'NUTRITIONIST' | 'HEALTH_MANAGER';

export interface MedicalUser {
  id: string;
  name: string;
  phone: string;
  role: MedicalRole;
  title?: string;
  avatar?: string;
  department?: string;
  hospital?: string;
  expertise?: string;
}

export type AppAuthState = {
  // ===== 患者端 =====
  patientUser: PatientUser | null;
  patientLogin: (phone: string, code: string) => Promise<PatientUser>;
  patientLogout: () => void;
  /** 患者注册 —— 同时写入 SCRM 客户池 */
  registerPatient: (data: {
    name: string;
    phone: string;
    gender?: 'male' | 'female';
    birthDate?: string;
    diabetes_type?: 'type1' | 'type2' | 'gestational' | 'prediabetes';
  }) => Promise<PatientUser>;

  // ===== 医管端 =====
  medicalUser: MedicalUser | null;
  medicalLogin: (phone: string, code: string) => Promise<MedicalUser>;
  medicalLogout: () => void;

  // ===== 系统 =====
  init: () => void;
};

const PATIENT_SESSION_KEY = 'sm_patient_session';
const MEDICAL_SESSION_KEY = 'sm_medical_session';

/* ========== 工具函数 ========== */
function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 从 SIM_SHARED.customers 查找客户 */
function findCustomerByPhone(phone: string) {
  return SIM_SHARED.customers.find((c: any) => c.phone === phone);
}

function persistPatient(user: PatientUser) {
  try { localStorage.setItem(PATIENT_SESSION_KEY, JSON.stringify(user)); } catch { /* noop */ }
}
function persistMedical(user: MedicalUser) {
  try { localStorage.setItem(MEDICAL_SESSION_KEY, JSON.stringify(user)); } catch { /* noop */ }
}

export const useAppAuthStore = create<AppAuthState>((set, get) => ({
  patientUser: null,
  medicalUser: null,

  // ===== 初始化：恢复持久化会话 =====
  init: () => {
    try {
      const ps = localStorage.getItem(PATIENT_SESSION_KEY);
      if (ps) {
        let user = JSON.parse(ps) as PatientUser;
        // 检查该客户是否仍在客户池中（可能被手动删除），并重新丰富数据
        const exists = findCustomerByPhone(user.phone);
        if (exists) {
          user = enrichPatientUser(user);
          set({ patientUser: user });
        } else {
          localStorage.removeItem(PATIENT_SESSION_KEY);
        }
      }
    } catch { /* noop */ }

    try {
      const ms = localStorage.getItem(MEDICAL_SESSION_KEY);
      if (ms) {
        const user = JSON.parse(ms) as MedicalUser;
        // 医管用户校验：从业务后台 merchantStore 重新核对账号状态
        const merchant = useMerchantStore
          .getState()
          .merchants.find(
            (m) =>
              m.phone === user.phone &&
              (['DOCTOR', 'PHARMACIST', 'NUTRITIONIST', 'HEALTH_MANAGER'] as MedicalRole[]).includes(m.role as MedicalRole)
          );
        if (merchant && merchant.lifecycleStatus === 'ONLINE') {
          set({ medicalUser: user });
        } else {
          localStorage.removeItem(MEDICAL_SESSION_KEY);
        }
      }
    } catch { /* noop */ }
  },

  // ===== 患者登录 =====
  patientLogin: async (phone: string) => {
    const customer = findCustomerByPhone(phone);
    if (!customer) {
      throw new Error('您的手机号尚未在平台注册，请先注册');
    }

    let user: PatientUser = {
      id: customer.id,
      name: customer.name || customer.contact_name || '用户',
      phone: customer.phone,
      gender: normalizeGender(customer.gender),
      birthDate: customer.birthday || customer.birth_date,
      diabetes_type: mapDiabetesType(customer.diabetes_type || customer.healthLabel),
      avatar: customer.avatar,
    };
    user = enrichPatientUser(user);

    persistPatient(user);
    set({ patientUser: user });
    return user;
  },

  patientLogout: () => {
    localStorage.removeItem(PATIENT_SESSION_KEY);
    set({ patientUser: null });
  },

  // ===== 患者注册 =====
  registerPatient: async (data) => {
    // 1. 手机号唯一性校验
    const exists = findCustomerByPhone(data.phone);
    if (exists) {
      throw new Error('该手机号已注册，请直接登录');
    }

    // 2. 辅助：计算年龄
    let age = 30;
    if (data.birthDate) {
      const birth = new Date(data.birthDate);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--;
      }
    }

    // 3. 辅助：糖尿病类型映射
    const diabetesMap: Record<string, string> = {
      type1: '1型糖尿病',
      type2: '2型糖尿病',
      gestational: '妊娠期糖尿病',
      prediabetes: '糖尿病前期',
    };

    // 4. 构建客户记录（字段格式与客户池种子数据保持一致）
    const nowUnix = Math.floor(Date.now() / 1000);
    const newCustomer = {
      id: generateId('cus'),
      name: data.name,
      phone: data.phone,
      age,
      gender: data.gender === 'male' ? 'M' : data.gender === 'female' ? 'F' : 'M',
      diabetes_type: diabetesMap[data.diabetes_type] || data.diabetes_type,
      diagnosis_duration: '未填写',
      tags: ['新用户'],
      last_interaction: '刚刚',
      source: 'APP注册',
      created_at: nowUnix,
    };

    // 5. 写入 SIM 共享内存（PC 后台 SCRM 客户池立即可见）
    const added = SIM_SHARED.addCustomer(newCustomer);
    if (!added) {
      throw new Error('注册失败，请稍后重试');
    }

    // 6. 构建 PatientUser 并从客户池丰富
    let user: PatientUser = {
      id: newCustomer.id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      gender: data.gender,
      birthDate: data.birthDate,
      diabetes_type: data.diabetes_type,
    };
    user = enrichPatientUser(user);

    // 7. 注册即自动登录
    persistPatient(user);
    set({ patientUser: user });
    return user;
  },

  // ===== 医管登录 =====
  // 从业务后台 merchantStore 读取：医生/药师/营养师/健康管理师
  // 只要后台管理数据中的角色状态为 ONLINE，即可用该手机号登录医管端 APP
  medicalLogin: async (phone: string) => {
    const merchant = useMerchantStore
      .getState()
      .merchants.find(
        (m) =>
          m.phone === phone &&
          (['DOCTOR', 'PHARMACIST', 'NUTRITIONIST', 'HEALTH_MANAGER'] as MedicalRole[]).includes(m.role as MedicalRole)
      );

    if (!merchant) {
      throw new Error('未找到此手机号对应的人员');
    }

    if (merchant.lifecycleStatus !== 'ONLINE') {
      const statusMap: Record<string, string> = {
        PENDING: '入驻审核中',
        INFO_APPROVED: '信息审核中',
        CERT_APPROVED: '资质审核中',
        APPROVED: '审核已通过，待签约上线',
        SIGNING: '合同签署中',
        SIGNED: '合同已签署，待运营上线',
        ONLINE: '正常',
        OFFLINE: '您的账号已下线',
        FROZEN: '您的账号已被冻结',
        SUSPENDED: '您的账号已被停用',
        REJECTED: '入驻申请未通过',
      };
      const reason = statusMap[merchant.lifecycleStatus] || '账号状态异常';
      throw new Error(`${reason}，无法登录`);
    }

    const user: MedicalUser = {
      id: merchant.id,
      name: merchant.name,
      phone: merchant.phone,
      role: merchant.role as MedicalRole,
      title: merchant.title,
      department: merchant.department,
      hospital: merchant.company,
      expertise: merchant.specialties?.join('、'),
    };

    persistMedical(user);
    set({ medicalUser: user });
    return user;
  },

  medicalLogout: () => {
    localStorage.removeItem(MEDICAL_SESSION_KEY);
    set({ medicalUser: null });
  },
}));

/** 从客户池数据丰富 PatientUser（年龄/确诊时长/标签/会员等级/模拟指标） */
function enrichPatientUser(user: PatientUser): PatientUser {
  const customer = findCustomerByPhone(user.phone);
  if (!customer) return user;

  // 从客户池提取标签
  const tags: string[] = Array.isArray(customer.tags)
    ? customer.tags.map((t: any) => (typeof t === 'string' ? t : t?.name || '')).filter(Boolean)
    : [];

  // 会员等级推断
  let member_level = '普通会员';
  if (tags.includes('VIP')) member_level = '金卡会员';
  else if (tags.includes('CGM用户')) member_level = '银卡会员';

  // 基于 ID 的确定性伪随机（同一用户每次登录数值一致）
  const seed = user.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const health_score = 1500 + (seed % 2000);          // 1500~3500
  const checkin_days = 7 + (seed % 30);               // 7~36
  const bg_rate = 70 + (seed % 25);                   // 70~94%

  return {
    ...user,
    age: typeof customer.age === 'number' ? customer.age : user.age,
    diagnosis_duration: customer.diagnosis_duration || user.diagnosis_duration,
    tags,
    member_level,
    health_score,
    checkin_days,
    bg_rate,
  };
}

/* ========== 辅助函数 ========== */
function normalizeGender(raw?: string): 'male' | 'female' | undefined {
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  if (lower === 'male' || lower === '男' || lower === 'm') return 'male';
  if (lower === 'female' || lower === '女' || lower === 'f') return 'female';
  return undefined;
}

function mapDiabetesType(raw?: string): 'type1' | 'type2' | 'gestational' | 'prediabetes' | undefined {
  if (!raw) return undefined;
  const map: Record<string, PatientUser['diabetes_type']> = {
    type1: 'type1', '1型': 'type1', '一型': 'type1',
    type2: 'type2', '2型': 'type2', '二型': 'type2',
    gestational: 'gestational', '妊娠': 'gestational', '孕期': 'gestational',
    prediabetes: 'prediabetes', '前期': 'prediabetes', '糖前期': 'prediabetes',
  };
  return map[raw.toLowerCase()] || undefined;
}
