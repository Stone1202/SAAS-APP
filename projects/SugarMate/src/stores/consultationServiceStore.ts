/**
 * 问诊服务 Store（管理医生可发布的问诊服务SKU）
 * 
 * 数据角色：
 * - PC后台：CRUD问诊服务（图文/语音/视频问诊），关联医生
 * - MP/APP：读取服务列表，展示给患者
 * 
 * 闭环：admin CRUD → IndexedDB → MP/APP 消费
 */
import { create } from 'zustand';

// ==================== 类型定义 ====================

/** 问诊模式 */
export type ConsultMode = 'text' | 'voice' | 'video' | 'phone';

/** 问诊服务状态 */
export type ServiceStatus = 'draft' | 'published' | 'paused';

/** 问诊服务 */
export interface ConsultationService {
  id: string;
  doctorId: string;           // 关联医生
  doctorName: string;         // 医生姓名（冗余）
  mode: ConsultMode;          // 问诊模式
  title: string;              // 服务名称，如"图文急诊"
  desc: string;               // 服务描述
  price: number;              // 价格（元）
  originalPrice?: number;     // 原价
  duration: number;           // 时长（分钟），图文不限时可填0
  replyWithin: string;        // 响应承诺，如"5分钟内"
  tags: string[];             // 标签，如["急诊","复诊"]
  schedule: string[];         // 排班，如["周一 9:00-12:00","周三 14:00-17:00"]
  icon?: string;              // 服务图标URL
  orderCount: number;         // 已预约数
  satisfiedRate: number;      // 满意率 0-100
  status: ServiceStatus;      // 状态
  createdAt: string;          // 创建时间
  updatedAt: string;          // 更新时间
}

// ==================== Sim 数据 ====================

// 种子服务数据：关联真实业务后台 merchantStore 中的医生 ID
// 张明 MR-002：主任医师·广州市第一人民医院·内分泌科
const SIM_SERVICES: ConsultationService[] = [
  {
    id: 'svc-001',
    doctorId: 'MR-002',
    doctorName: '张明',
    mode: 'text',
    title: '图文问诊',
    desc: '通过图文方式与张明主任进行在线交流，适合初次咨询、复诊随访，支持上传检查报告和血糖数据。张明主任擅长2型糖尿病、糖尿病肾病、妊娠糖尿病。',
    price: 29.9,
    originalPrice: 59.9,
    duration: 24 * 60,
    replyWithin: '平均5分钟',
    tags: ['复诊', '慢病管理', '血糖解读'],
    schedule: ['周一至周五 9:00-18:00', '周六 9:00-12:00'],
    orderCount: 1280,
    satisfiedRate: 98,
    status: 'published',
    createdAt: '2026-01-15',
    updatedAt: '2026-07-28',
  },
  {
    id: 'svc-002',
    doctorId: 'MR-002',
    doctorName: '张明',
    mode: 'video',
    title: '视频问诊',
    desc: '15分钟高清视频与张明主任面对面问诊，适用于复杂病情咨询、胰岛素剂量调整指导。',
    price: 99,
    originalPrice: 199,
    duration: 15,
    replyWithin: '预约时段准时接通',
    tags: ['初诊', '胰岛素调整', '个性化方案'],
    schedule: ['周一 14:00-17:00', '周三 14:00-17:00', '周五 14:00-17:00'],
    orderCount: 560,
    satisfiedRate: 99,
    status: 'published',
    createdAt: '2026-01-15',
    updatedAt: '2026-07-28',
  },
  {
    id: 'svc-003',
    doctorId: 'MR-002',
    doctorName: '张明',
    mode: 'voice',
    title: '语音通话问诊',
    desc: '10分钟语音通话，方便快捷地解答您的糖尿病相关疑问，适合不方便视频的场合。',
    price: 49,
    originalPrice: 89,
    duration: 10,
    replyWithin: '预约后15分钟内接通',
    tags: ['便捷问诊', '用药咨询'],
    schedule: ['周二 10:00-12:00', '周四 15:00-17:00'],
    orderCount: 320,
    satisfiedRate: 97,
    status: 'published',
    createdAt: '2026-03-10',
    updatedAt: '2026-07-20',
  },
  {
    id: 'svc-004',
    doctorId: 'MR-002',
    doctorName: '张明',
    mode: 'phone',
    title: '电话问诊',
    desc: '15分钟电话问诊，方便快捷，适合用药指导、检查结果解读等简单问题。',
    price: 39,
    originalPrice: 69,
    duration: 15,
    replyWithin: '预约后30分钟内接通',
    tags: ['快速咨询', '用药指导', '结果解读'],
    schedule: ['周一至周五 9:00-12:00', '周一至周五 14:00-17:00'],
    orderCount: 210,
    satisfiedRate: 96,
    status: 'published',
    createdAt: '2026-04-01',
    updatedAt: '2026-07-20',
  },
];

// ==================== Store ====================

interface ConsultationServiceState {
  // 状态
  services: ConsultationService[];
  loading: boolean;

  // 操作
  loadServices: () => Promise<void>;
  
  /** 按医生ID获取服务列表（MP/APP调用） */
  getServicesByDoctor: (doctorId: string) => ConsultationService[];
  
  /** 获取所有开放的服务（MP/APP调用） */
  getPublishedServices: () => ConsultationService[];
  
  // Admin CRUD
  createService: (data: Omit<ConsultationService, 'id' | 'orderCount' | 'satisfiedRate' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateService: (id: string, data: Partial<ConsultationService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleServiceStatus: (id: string, status: ServiceStatus) => Promise<void>;
}

export const useConsultationServiceStore = create<ConsultationServiceState>((set, get) => ({
  services: [],
  loading: false,

  loadServices: async () => {
    set({ loading: true });
    // Sim: 内存加载
    await new Promise(r => setTimeout(r, 200));
    set({ services: [...SIM_SERVICES], loading: false });
  },

  getServicesByDoctor: (doctorId: string) => {
    return get().services.filter(s => s.doctorId === doctorId);
  },

  getPublishedServices: () => {
    return get().services.filter(s => s.status === 'published');
  },

  createService: async (data) => {
    const now = new Date().toISOString().slice(0, 10);
    const newService: ConsultationService = {
      ...data,
      id: `svc-${Date.now()}`,
      orderCount: 0,
      satisfiedRate: 100,
      createdAt: now,
      updatedAt: now,
    };
    set(state => ({ services: [...state.services, newService] }));
  },

  updateService: async (id, data) => {
    set(state => ({
      services: state.services.map(s =>
        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : s
      ),
    }));
  },

  deleteService: async (id) => {
    set(state => ({ services: state.services.filter(s => s.id !== id) }));
  },

  toggleServiceStatus: async (id, status) => {
    set(state => ({
      services: state.services.map(s =>
        s.id === id ? { ...s, status, updatedAt: new Date().toISOString().slice(0, 10) } : s
      ),
    }));
  },
}));
