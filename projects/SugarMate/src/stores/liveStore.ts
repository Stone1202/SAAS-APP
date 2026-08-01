/**
 * 直播共享 Store — PC运营后台 ↔ LIVE直播端 联动核心
 * 
 * Zustand + localStorage 持久化，同一 SPA 内 PC 写入、LIVE 读取、中控台双向同步
 *
 * 数据流：
 *   PC 开播计划 → LIVE 开播人看到自己的计划
 *   PC 商品配置 → LIVE 直播间/商城展示商品
 *   PC 营销活动 → LIVE 用户看到优惠券/秒杀
 *   PC 互动配置 → LIVE 问答/抽奖/投票
 *   LIVE 实时数据 → PC 中控台监控
 *   PC 中控操作 → LIVE 响应（弹幕开关/商品置顶等）
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== 实体类型 ====================

export interface BroadcastPlan {
  id: string;
  name: string;
  broadcasterId: string;
  broadcasterName: string;
  broadcasterType: 'doctor' | 'nutritionist';
  period: [string, string];
  sessionCount: number;
  coverUrl: string;
  description: string;
  status: 'pending' | 'active' | 'finished';
  createdAt: string;
}

export interface LiveSession {
  id: string;
  planId: string;
  planName: string;
  topic: string;
  liveType: 'knowledge' | 'lecture' | 'shopping';
  startTime: string;
  endTime: string;
  coverUrl: string;
  status: 'pending' | 'ready' | 'live' | 'paused' | 'ended';
  roomId?: string;
}

export interface LiveRoom {
  id: string;
  sessionId: string;
  sessionTopic: string;
  roomName: string;
  category: 'knowledge' | 'lecture' | 'shopping' | 'qa';
  pushUrl: string;
  pullUrl: string;
  resolution: '720p' | '1080p';
  bitrate: number;
  frameRate: number;
  beautyEnabled: boolean;
  recordingStrategy: 'auto' | 'manual' | 'none';
  status: 'offline' | 'ready' | 'live';
}

export interface LiveProduct {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  roomId: string;
  roomName: string;
  normalPrice: number;
  livePrice: number;
  allocatedStock: number;
  sortOrder: number;
  isPinned: boolean;
  status: 'active' | 'paused';
}

export interface MarketingActivity {
  id: string;
  activityName: string;
  type: 'coupon' | 'flash_sale' | 'reservation_gift';
  roomId: string;
  roomName: string;
  content: string;
  startTime: string;
  endTime: string;
  budget?: number;
  status: 'draft' | 'active' | 'ended';
}

export interface QaPreset {
  question: string;
  answer: string;
}

export interface LotteryRule {
  drawTime: string;
  prizes: { name: string; count: number }[];
}

export interface PollOption {
  option: string;
  votes?: number;
}

export interface InteractionConfig {
  id: string;
  interactionName: string;
  type: 'qa' | 'lottery' | 'poll';
  roomId: string;
  roomName: string;
  description: string;
  qaPresets?: QaPreset[];
  lotteryRule?: LotteryRule;
  pollOptions?: PollOption[];
  status: 'inactive' | 'active' | 'finished';
}

// ==================== 实时同步类型 ====================

export interface CommentItem {
  id: string;
  roomId: string;
  user: string;
  content: string;
  time: string;
  status: 'approved' | 'pending' | 'blocked';
}

export interface LiveStats {
  roomId: string;
  onlineViewers: number;
  totalViews: number;
  likes: number;
  comments: number;
  revenue: number;
  orders: number;
  duration: string; // "0:45:32"
}

export interface ControlCommands {
  danmakuEnabled: boolean;
  autoReview: boolean;
  checkInActive: boolean;
  countdown: number; // seconds, 0=off
  pinnedProductIds: string[];
}

/** 讲解互斥锁：确保同一时间只有一个角色能控制商品讲解 */
export interface ExplainLock {
  productId: string;
  holder: 'broadcaster' | 'controller';
  holderLabel: string; // e.g. "主播端" / "中控台"
  startedAt: number; // Date.now()
}

// ==================== 开播人 ====================

export interface Broadcaster {
  id: string;
  name: string;
  type: 'doctor' | 'nutritionist';
  dept: string;
}

// ==================== Store 状态 ====================

interface LiveStoreState {
  // ---- 实体数据 ----
  broadcastPlans: BroadcastPlan[];
  liveSessions: LiveSession[];
  liveRooms: LiveRoom[];
  liveProducts: LiveProduct[];
  marketingActivities: MarketingActivity[];
  interactionConfigs: InteractionConfig[];

  // ---- 实时直播上下文 ----
  activeRoomId: string | null;
  controlCommands: ControlCommands;
  liveStats: Record<string, LiveStats>; // roomId → stats
  comments: CommentItem[];
  explainLock: ExplainLock | null;

  // ---- 设备类型 ----
  deviceType: 'PC' | 'LIVE' | null; // 当前所在终端

  // ======== 实体 CRUD ========
  setBroadcastPlans: (plans: BroadcastPlan[]) => void;
  addBroadcastPlan: (plan: BroadcastPlan) => void;
  updateBroadcastPlan: (id: string, updates: Partial<BroadcastPlan>) => void;
  removeBroadcastPlan: (id: string) => void;

  setLiveRooms: (rooms: LiveRoom[]) => void;
  addLiveRoom: (room: LiveRoom) => void;
  updateLiveRoom: (id: string, updates: Partial<LiveRoom>) => void;
  removeLiveRoom: (id: string) => void;

  setLiveSessions: (sessions: LiveSession[]) => void;
  addLiveSession: (session: LiveSession) => void;
  updateLiveSession: (id: string, updates: Partial<LiveSession>) => void;
  removeLiveSession: (id: string) => void;

  setLiveProducts: (products: LiveProduct[]) => void;
  addLiveProducts: (products: LiveProduct[]) => void;
  updateLiveProduct: (id: string, updates: Partial<LiveProduct>) => void;
  removeLiveProduct: (id: string) => void;

  setMarketingActivities: (activities: MarketingActivity[]) => void;
  addMarketingActivity: (activity: MarketingActivity) => void;
  updateMarketingActivity: (id: string, updates: Partial<MarketingActivity>) => void;
  removeMarketingActivity: (id: string) => void;

  setInteractionConfigs: (configs: InteractionConfig[]) => void;
  addInteractionConfig: (config: InteractionConfig) => void;
  updateInteractionConfig: (id: string, updates: Partial<InteractionConfig>) => void;
  removeInteractionConfig: (id: string) => void;

  // ======== 跨实体联动查询 ========
  getSessionsByPlanId: (planId: string) => LiveSession[];
  getRoomBySessionId: (sessionId: string) => LiveRoom | undefined;
  getProductsByRoomId: (roomId: string) => LiveProduct[];
  getActiveProductsByRoomId: (roomId: string) => LiveProduct[];
  getMarketingByRoomId: (roomId: string) => MarketingActivity[];
  getInteractionsByRoomId: (roomId: string) => InteractionConfig[];
  getPlansByBroadcaster: (broadcasterName: string) => BroadcastPlan[];

  // ======== 实时直播控制 ========
  setActiveRoom: (roomId: string | null) => void;
  setDeviceType: (type: 'PC' | 'LIVE' | null) => void;

  // PC中控 → LIVE直播端
  updateControlCommand: <K extends keyof ControlCommands>(key: K, value: ControlCommands[K]) => void;
  pinProduct: (productId: string) => void;
  unpinProduct: (productId: string) => void;

  // LIVE直播端 → PC中控
  updateLiveStats: (roomId: string, stats: Partial<LiveStats>) => void;
  addComment: (comment: CommentItem) => void;
  moderateComment: (id: string, status: CommentItem['status']) => void;

  // ======== 讲解互斥锁 ========
  acquireExplainLock: (productId: string, holder: ExplainLock['holder']) => boolean;
  releaseExplainLock: (holder: ExplainLock['holder']) => void;

  // ======== 直播间状态控制（跨端同步） ========
  startLiveSession: (sessionId: string) => void;
  pauseLiveSession: (sessionId: string) => void;
  resumeLiveSession: (sessionId: string) => void;
  endLiveSession: (sessionId: string) => void;

  // ======== 初始化模拟数据 ========
  initMockData: () => void;
}

// ==================== 模拟数据 ====================

const MOCK_PLANS: BroadcastPlan[] = [
  {
    id: 'BP-001', name: '6月糖尿病科普系列',
    broadcasterId: 'doc-1', broadcasterName: '张伟明', broadcasterType: 'doctor',
    period: ['2026-06-01', '2026-06-30'], sessionCount: 4,
    coverUrl: '', description: '围绕糖尿病的饮食、运动、用药、监测四大主题开展系列科普直播',
    status: 'finished', createdAt: '2026-05-20',
  },
  {
    id: 'BP-002', name: '夏日降糖饮食指南',
    broadcasterId: 'nut-1', broadcasterName: '张医生', broadcasterType: 'doctor',
    period: ['2026-07-01', '2026-07-31'], sessionCount: 2,
    coverUrl: '', description: '夏季糖尿病患者的饮食调理指南，适合糖友家属共同参与',
    status: 'active', createdAt: '2026-06-25',
  },
  {
    id: 'BP-003', name: '糖尿病并发症预防月',
    broadcasterId: 'doc-2', broadcasterName: '王建平', broadcasterType: 'doctor',
    period: ['2026-08-01', '2026-08-31'], sessionCount: 0,
    coverUrl: '', description: '聚焦糖尿病眼病、肾病、足病等并发症的早期预防与筛查',
    status: 'pending', createdAt: '2026-07-20',
  },
  {
    id: 'BP-004', name: '糖友运动康复计划',
    broadcasterId: 'nut-2', broadcasterName: '营养师小王', broadcasterType: 'nutritionist',
    period: ['2026-07-15', '2026-08-15'], sessionCount: 1,
    coverUrl: '', description: '适合糖尿病患者的运动计划，从低强度逐步增加',
    status: 'active', createdAt: '2026-07-10',
  },
];

const MOCK_SESSIONS: LiveSession[] = [
  { id: 'SS-001', planId: 'BP-001', planName: '6月糖尿病科普系列', topic: '糖尿病饮食指南——糖友怎么吃', liveType: 'knowledge', startTime: '2026-06-05 19:00', endTime: '2026-06-05 20:30', coverUrl: '', status: 'ended', roomId: 'RM-001' },
  { id: 'SS-002', planId: 'BP-001', planName: '6月糖尿病科普系列', topic: '运动降糖的科学方法', liveType: 'lecture', startTime: '2026-06-12 19:00', endTime: '2026-06-12 20:30', coverUrl: '', status: 'ended', roomId: 'RM-002' },
  { id: 'SS-003', planId: 'BP-001', planName: '6月糖尿病科普系列', topic: '降糖药使用常见误区', liveType: 'knowledge', startTime: '2026-06-19 19:00', endTime: '2026-06-19 20:00', coverUrl: '', status: 'ended' },
  { id: 'SS-004', planId: 'BP-001', planName: '6月糖尿病科普系列', topic: '血糖监测的正确姿势', liveType: 'knowledge', startTime: '2026-06-26 19:00', endTime: '2026-06-26 20:00', coverUrl: '', status: 'ended' },
  { id: 'SS-005', planId: 'BP-002', planName: '夏日降糖饮食指南', topic: '糖尿病饮食指南：吃对不升糖', liveType: 'knowledge', startTime: '2026-07-10 19:30', endTime: '2026-07-10 21:00', coverUrl: '', status: 'live', roomId: 'RM-003' },
  { id: 'SS-006', planId: 'BP-002', planName: '夏日降糖饮食指南', topic: '水果怎么吃血糖不飙升', liveType: 'knowledge', startTime: '2026-07-24 19:30', endTime: '2026-07-24 21:00', coverUrl: '', status: 'pending' },
  { id: 'SS-007', planId: 'BP-004', planName: '糖友运动康复计划', topic: '糖友居家运动入门', liveType: 'shopping', startTime: '2026-07-20 19:00', endTime: '2026-07-20 20:00', coverUrl: '', status: 'live', roomId: 'RM-004' },
];

const MOCK_ROOMS: LiveRoom[] = [
  { id: 'RM-001', sessionId: 'SS-001', sessionTopic: '糖尿病饮食指南——糖友怎么吃', roomName: '科普1号间', category: 'knowledge', pushUrl: 'rtmp://push.sugarmate.com/live/rm001?key=xxxxx', pullUrl: 'https://pull.sugarmate.com/live/rm001.m3u8', resolution: '1080p', bitrate: 4000, frameRate: 30, beautyEnabled: true, recordingStrategy: 'auto', status: 'offline' },
  { id: 'RM-002', sessionId: 'SS-002', sessionTopic: '运动降糖的科学方法', roomName: '讲堂专厅A', category: 'lecture', pushUrl: 'rtmp://push.sugarmate.com/live/rm002?key=yyyyy', pullUrl: 'https://pull.sugarmate.com/live/rm002.m3u8', resolution: '1080p', bitrate: 4000, frameRate: 30, beautyEnabled: true, recordingStrategy: 'auto', status: 'offline' },
  { id: 'RM-003', sessionId: 'SS-005', sessionTopic: '糖尿病饮食指南：吃对不升糖', roomName: '美食直播间', category: 'knowledge', pushUrl: 'rtmp://push.sugarmate.com/live/rm003?key=zzzzz', pullUrl: 'https://pull.sugarmate.com/live/rm003.m3u8', resolution: '720p', bitrate: 2500, frameRate: 25, beautyEnabled: false, recordingStrategy: 'manual', status: 'live' },
  { id: 'RM-004', sessionId: 'SS-007', sessionTopic: '糖友居家运动入门', roomName: '运动直播间', category: 'shopping', pushUrl: 'rtmp://push.sugarmate.com/live/rm004?key=aaaaa', pullUrl: 'https://pull.sugarmate.com/live/rm004.m3u8', resolution: '1080p', bitrate: 4000, frameRate: 30, beautyEnabled: false, recordingStrategy: 'auto', status: 'live' },
];

const MOCK_PRODUCTS: LiveProduct[] = [
  { id: 'LP-001', productId: 'p-001', productName: '雅培瞬感血糖仪', productImage: '📟', roomId: 'RM-003', roomName: '美食直播间', normalPrice: 328, livePrice: 268, allocatedStock: 200, sortOrder: 1, isPinned: true, status: 'active' },
  { id: 'LP-002', productId: 'p-002', productName: '血糖试纸50片装', productImage: '📏', roomId: 'RM-003', roomName: '美食直播间', normalPrice: 128, livePrice: 99, allocatedStock: 500, sortOrder: 2, isPinned: false, status: 'active' },
  { id: 'LP-003', productId: 'p-003', productName: '胰岛素笔注射器', productImage: '💉', roomId: 'RM-003', roomName: '美食直播间', normalPrice: 218, livePrice: 168, allocatedStock: 100, sortOrder: 3, isPinned: false, status: 'active' },
  { id: 'LP-004', productId: 'p-004', productName: '二甲双胍缓释片', productImage: '💊', roomId: 'RM-003', roomName: '美食直播间', normalPrice: 35, livePrice: 28, allocatedStock: 300, sortOrder: 4, isPinned: false, status: 'paused' },
  { id: 'LP-005', productId: 'p-005', productName: '格列美脲片', productImage: '💊', roomId: 'RM-004', roomName: '运动直播间', normalPrice: 28, livePrice: 22, allocatedStock: 200, sortOrder: 1, isPinned: true, status: 'active' },
  { id: 'LP-006', productId: 'p-003', productName: '胰岛素笔注射器', productImage: '💉', roomId: 'RM-004', roomName: '运动直播间', normalPrice: 218, livePrice: 188, allocatedStock: 150, sortOrder: 2, isPinned: false, status: 'active' },
];

const MOCK_MARKETING: MarketingActivity[] = [
  { id: 'MA-001', activityName: '新人专享优惠券', type: 'coupon', roomId: 'RM-003', roomName: '美食直播间', content: '满99减20元优惠券，限量500张', startTime: '2026-07-10 19:00', endTime: '2026-07-10 21:30', budget: 10000, status: 'active' },
  { id: 'MA-002', activityName: '限时秒杀-血糖仪', type: 'flash_sale', roomId: 'RM-003', roomName: '美食直播间', content: '雅培瞬感血糖仪秒杀价 ¥299，限量50台', startTime: '2026-07-10 20:00', endTime: '2026-07-10 20:15', status: 'active' },
  { id: 'MA-003', activityName: '预约有礼', type: 'reservation_gift', roomId: 'RM-003', roomName: '美食直播间', content: '预约直播送10元无门槛券 + 控糖食谱PDF', startTime: '2026-07-01', endTime: '2026-07-10 19:00', budget: 5000, status: 'active' },
  { id: 'MA-004', activityName: '直播间专属8折券', type: 'coupon', roomId: 'RM-004', roomName: '运动直播间', content: '直播间全店8折优惠，最高减50元', startTime: '2026-07-20 19:00', endTime: '2026-07-20 20:30', budget: 8000, status: 'draft' },
  { id: 'MA-005', activityName: '打卡签到礼', type: 'reservation_gift', roomId: 'RM-004', roomName: '运动直播间', content: '观看满15分钟即可领取运动毛巾', startTime: '2026-07-20 19:00', endTime: '2026-07-20 20:00', budget: 3000, status: 'draft' },
];

const MOCK_INTERACTIONS: InteractionConfig[] = [
  {
    id: 'INT-001', interactionName: '糖尿病问答互动', type: 'qa',
    roomId: 'RM-003', roomName: '美食直播间',
    description: '预设常见糖尿病饮食问题，直播时一键推送到弹幕区',
    qaPresets: [
      { question: '糖尿病患者能吃水果吗？', answer: '可以，建议选择低GI水果，如苹果、梨、草莓，每次100-150g' },
      { question: '餐前血糖多少算正常？', answer: '餐前血糖理想范围为3.9-7.2mmol/L' },
      { question: '什么主食适合糖尿病患者？', answer: '推荐全谷物、杂豆类、薯类作为主食，如燕麦、荞麦、糙米' },
    ],
    status: 'active',
  },
  {
    id: 'INT-002', interactionName: '直播间抽奖', type: 'lottery',
    roomId: 'RM-003', roomName: '美食直播间',
    description: '每15分钟抽一波奖品',
    lotteryRule: {
      drawTime: '每15分钟',
      prizes: [{ name: '血糖仪免费试用', count: 3 }, { name: '10元优惠券', count: 20 }, { name: 'DGI杂粮米试吃装', count: 50 }],
    },
    status: 'active',
  },
  {
    id: 'INT-003', interactionName: '观众投票', type: 'poll',
    roomId: 'RM-003', roomName: '美食直播间',
    description: '投票选出最想了解的糖尿病饮食话题',
    pollOptions: [
      { option: '如何计算每日碳水摄入量', votes: 245 },
      { option: '外食怎么控制血糖', votes: 189 },
      { option: '代糖到底能不能吃', votes: 312 },
      { option: '保健品对血糖有影响吗', votes: 156 },
    ],
    status: 'active',
  },
  {
    id: 'INT-004', interactionName: '运动答疑', type: 'qa',
    roomId: 'RM-004', roomName: '运动直播间',
    description: '运动相关Q&A预设',
    qaPresets: [
      { question: '糖尿病患者适合什么运动？', answer: '推荐有氧运动+抗阻训练结合，如快走、游泳、弹力带训练' },
      { question: '什么时候运动最好？', answer: '建议餐后1-2小时运动，避免空腹运动导致低血糖' },
    ],
    status: 'inactive',
  },
  {
    id: 'INT-005', interactionName: '运动打卡抽奖', type: 'lottery',
    roomId: 'RM-004', roomName: '运动直播间',
    description: '直播间跟随运动满10分钟可参与抽奖',
    lotteryRule: {
      drawTime: '开播后30分钟',
      prizes: [{ name: '弹力带套装', count: 10 }, { name: '运动毛巾', count: 30 }],
    },
    status: 'inactive',
  },
];

const MOCK_COMMENTS: CommentItem[] = [
  { id: 'c1', roomId: 'RM-004', user: '糖友小王', content: '老师讲得太好了！我每天餐后走30分钟血糖确实稳多了', time: '19:05', status: 'approved' },
  { id: 'c2', roomId: 'RM-004', user: '平安是福', content: '请问胰岛素注射后多久可以运动？', time: '19:06', status: 'approved' },
  { id: 'c3', roomId: 'RM-004', user: '健康每一天', content: '加微信xxx，买降糖神药', time: '19:07', status: 'pending' },
  { id: 'c4', roomId: 'RM-004', user: '李阿姨', content: '弹力带买哪一种比较好？家里没器械', time: '19:08', status: 'approved' },
  { id: 'c5', roomId: 'RM-004', user: '小明妈妈', content: '小孩子可以用这个吗？我儿子10岁刚确诊', time: '19:09', status: 'approved' },
  { id: 'c6', roomId: 'RM-004', user: '春风十里', content: '这个直播间福利真多！已经下单血糖仪了', time: '19:10', status: 'approved' },
  { id: 'c7', roomId: 'RM-004', user: 'xx客服888', content: '招聘兼职，日结300，联系QQxxxxx', time: '19:11', status: 'pending' },
  { id: 'c8', roomId: 'RM-004', user: '糖友老张', content: '昨天的运动直播回放在哪里看？', time: '19:12', status: 'approved' },
];

const MOCK_STATS: Record<string, LiveStats> = {
  'RM-004': { roomId: 'RM-004', onlineViewers: 156, totalViews: 12580, likes: 38420, comments: 1567, revenue: 23450, orders: 315, duration: '0:45:32' },
  'RM-003': { roomId: 'RM-003', onlineViewers: 328, totalViews: 5680, likes: 12420, comments: 567, revenue: 8450, orders: 115, duration: '0:32:15' },
};

const DEFAULT_CONTROL: ControlCommands = {
  danmakuEnabled: true,
  autoReview: false,
  checkInActive: false,
  countdown: 0,
  pinnedProductIds: ['LP-005'],
};

// ==================== Store 创建 ====================

export const useLiveStore = create<LiveStoreState>()(
  persist(
    (set, get) => {
      // ---- 初始化模拟数据 ----
      const initMockData = () => {
        const state = get();
        const isFirstInit = state.broadcastPlans.length === 0;
        if (isFirstInit) {
          set({
            broadcastPlans: MOCK_PLANS,
            liveSessions: MOCK_SESSIONS,
            liveRooms: MOCK_ROOMS,
            liveProducts: MOCK_PRODUCTS,
            marketingActivities: MOCK_MARKETING,
            interactionConfigs: MOCK_INTERACTIONS,
            comments: MOCK_COMMENTS,
            liveStats: MOCK_STATS,
            activeRoomId: 'RM-004',
            controlCommands: DEFAULT_CONTROL,
          });
        } else if (Object.keys(state.liveStats).length === 0 || state.comments.length === 0) {
          // 已有持久化基础数据，但实时数据被清空（如 partialize 排除的字段）
          set({
            comments: MOCK_COMMENTS,
            liveStats: { ...state.liveStats, ...MOCK_STATS },
            activeRoomId: state.activeRoomId || 'RM-004',
          });
        }
      };

      return {
        // ---- 实体数据 ----
        broadcastPlans: [],
        liveSessions: [],
        liveRooms: [],
        liveProducts: [],
        marketingActivities: [],
        interactionConfigs: [],

        // ---- 实时上下文 ----
        activeRoomId: null,
        controlCommands: DEFAULT_CONTROL,
        liveStats: {},
        comments: [],
        deviceType: null,
        explainLock: null,

        // ---- 初始化 ----
        initMockData,

        // ======== BroadcastPlan ========
        setBroadcastPlans: (plans) => set({ broadcastPlans: plans }),
        addBroadcastPlan: (plan) => {
          set((s) => ({ broadcastPlans: [plan, ...s.broadcastPlans] }));
          broadcastLiveState();
        },
        updateBroadcastPlan: (id, updates) => {
          set((s) => ({
            broadcastPlans: s.broadcastPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          }));
          broadcastLiveState();
        },
        removeBroadcastPlan: (id) => {
          set((s) => ({
            broadcastPlans: s.broadcastPlans.filter((p) => p.id !== id),
          }));
          broadcastLiveState();
        },

        // ======== LiveRoom CRUD ========
        setLiveRooms: (rooms) => set({ liveRooms: rooms }),
        addLiveRoom: (room) => {
          set((s) => ({ liveRooms: [room, ...s.liveRooms] }));
          broadcastLiveState();
        },
        updateLiveRoom: (id, updates) => {
          set((s) => ({
            liveRooms: s.liveRooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          }));
          broadcastLiveState();
        },
        removeLiveRoom: (id) => {
          set((s) => ({
            liveRooms: s.liveRooms.filter((r) => r.id !== id),
          }));
          broadcastLiveState();
        },

        // ======== LiveSession ========
        setLiveSessions: (sessions) => set({ liveSessions: sessions }),
        addLiveSession: (session) => {
          set((s) => ({ liveSessions: [session, ...s.liveSessions] }));
          broadcastLiveState();
        },
        updateLiveSession: (id, updates) => {
          set((s) => {
            const updatedSessions = s.liveSessions.map((ss) =>
              ss.id === id ? { ...ss, ...updates } : ss,
            );
            // 若 liveType 变更，同步关联直播间 category
            let updatedRooms = s.liveRooms;
            if (updates.liveType) {
              const session = updatedSessions.find((ss) => ss.id === id);
              if (session?.roomId) {
                updatedRooms = s.liveRooms.map((r) =>
                  r.id === session.roomId ? { ...r, category: updates.liveType! as LiveRoom['category'] } : r,
                );
              }
            }
            return { liveSessions: updatedSessions, liveRooms: updatedRooms };
          });
          broadcastLiveState();
        },
        removeLiveSession: (id) => {
          set((s) => ({
            liveSessions: s.liveSessions.filter((ss) => ss.id !== id),
          }));
          broadcastLiveState();
        },

        // ======== LiveProduct ========
        setLiveProducts: (products) => set({ liveProducts: products }),
        addLiveProducts: (products) => {
          set((s) => ({ liveProducts: [...s.liveProducts, ...products] }));
          broadcastLiveState();
        },
        updateLiveProduct: (id, updates) => {
          set((s) => ({
            liveProducts: s.liveProducts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          }));
          broadcastLiveState();
        },
        removeLiveProduct: (id) => {
          set((s) => ({
            liveProducts: s.liveProducts.filter((p) => p.id !== id),
          }));
          broadcastLiveState();
        },

        // ======== MarketingActivity ========
        setMarketingActivities: (activities) => set({ marketingActivities: activities }),
        addMarketingActivity: (activity) => {
          set((s) => ({ marketingActivities: [activity, ...s.marketingActivities] }));
          broadcastLiveState();
        },
        updateMarketingActivity: (id, updates) => {
          set((s) => ({
            marketingActivities: s.marketingActivities.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          }));
          broadcastLiveState();
        },
        removeMarketingActivity: (id) => {
          set((s) => ({
            marketingActivities: s.marketingActivities.filter((a) => a.id !== id),
          }));
          broadcastLiveState();
        },

        // ======== InteractionConfig ========
        setInteractionConfigs: (configs) => set({ interactionConfigs: configs }),
        addInteractionConfig: (config) => {
          set((s) => ({ interactionConfigs: [config, ...s.interactionConfigs] }));
          broadcastLiveState();
        },
        updateInteractionConfig: (id, updates) => {
          set((s) => ({
            interactionConfigs: s.interactionConfigs.map((i) => (i.id === id ? { ...i, ...updates } : i)),
          }));
          broadcastLiveState();
        },
        removeInteractionConfig: (id) => {
          set((s) => ({
            interactionConfigs: s.interactionConfigs.filter((i) => i.id !== id),
          }));
          broadcastLiveState();
        },

        // ======== 跨实体联动查询 ========
        getSessionsByPlanId: (planId) => get().liveSessions.filter((s) => s.planId === planId),
        getRoomBySessionId: (sessionId) => get().liveRooms.find((r) => r.sessionId === sessionId),
        getProductsByRoomId: (roomId) => get().liveProducts.filter((p) => p.roomId === roomId).sort((a, b) => a.sortOrder - b.sortOrder),
        getActiveProductsByRoomId: (roomId) => get().liveProducts.filter((p) => p.roomId === roomId && p.status === 'active').sort((a, b) => a.sortOrder - b.sortOrder),
        getMarketingByRoomId: (roomId) => get().marketingActivities.filter((a) => a.roomId === roomId),
        getInteractionsByRoomId: (roomId) => get().interactionConfigs.filter((i) => i.roomId === roomId),
        getPlansByBroadcaster: (name) => get().broadcastPlans.filter((p) => p.broadcasterName === name),

        // ======== 实时控制 ========
        setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
        setDeviceType: (type) => set({ deviceType: type }),

        updateControlCommand: (key, value) => {
          set((s) => ({
            controlCommands: { ...s.controlCommands, [key]: value },
          }));
          broadcastLiveState();
        },

        pinProduct: (productId) => {
          set((s) => ({
            liveProducts: s.liveProducts.map((p) =>
              p.id === productId ? { ...p, isPinned: true } : p,
            ),
            controlCommands: {
              ...s.controlCommands,
              pinnedProductIds: [...s.controlCommands.pinnedProductIds, productId],
            },
          }));
          broadcastLiveState();
        },

        unpinProduct: (productId) => {
          set((s) => ({
            liveProducts: s.liveProducts.map((p) =>
              p.id === productId ? { ...p, isPinned: false } : p,
            ),
            controlCommands: {
              ...s.controlCommands,
              pinnedProductIds: s.controlCommands.pinnedProductIds.filter((id) => id !== productId),
            },
          }));
          broadcastLiveState();
        },

        // LIVE → PC 数据上报
        updateLiveStats: (roomId, stats) => {
          set((s) => ({
            liveStats: {
              ...s.liveStats,
              [roomId]: { ...s.liveStats[roomId], ...stats, roomId },
            },
          }));
          broadcastLiveState();
        },

        addComment: (comment) => {
          set((s) => ({
            comments: [...s.comments, comment],
          }));
          broadcastLiveState();
        },

        moderateComment: (id, status) => {
          set((s) => ({
            comments: s.comments.map((c) => (c.id === id ? { ...c, status } : c)),
          }));
          broadcastLiveState();
        },

        // ======== 讲解互斥锁 ========
        acquireExplainLock: (productId, holder) => {
          const currentLock = get().explainLock;
          // 如果当前锁不存在 → 直接获取
          if (!currentLock) {
            set({
              explainLock: {
                productId,
                holder,
                holderLabel: holder === 'broadcaster' ? '主播端' : '中控台',
                startedAt: Date.now(),
              },
            });
            broadcastLiveState();
            return true;
          }
          // 锁已存在 → 返回 false，调用方应展示锁定态
          return false;
        },

        releaseExplainLock: (holder) => {
          const currentLock = get().explainLock;
          // 只有锁持有者可以释放
          if (currentLock && currentLock.holder === holder) {
            set({ explainLock: null });
            broadcastLiveState();
          }
        },

        // ======== 直播间状态控制（跨端同步） ========
        startLiveSession: (sessionId) => {
          set((s) => ({
            liveSessions: s.liveSessions.map((ss) =>
              ss.id === sessionId ? { ...ss, status: 'live' as const } : ss,
            ),
            liveRooms: s.liveRooms.map((r) =>
              r.sessionId === sessionId ? { ...r, status: 'live' as const } : r,
            ),
          }));
          broadcastLiveState();
        },

        pauseLiveSession: (sessionId) => {
          set((s) => ({
            liveSessions: s.liveSessions.map((ss) =>
              ss.id === sessionId ? { ...ss, status: 'paused' as const } : ss,
            ),
          }));
          broadcastLiveState();
        },

        resumeLiveSession: (sessionId) => {
          set((s) => ({
            liveSessions: s.liveSessions.map((ss) =>
              ss.id === sessionId ? { ...ss, status: 'live' as const } : ss,
            ),
          }));
          broadcastLiveState();
        },

        endLiveSession: (sessionId) => {
          set((s) => ({
            liveSessions: s.liveSessions.map((ss) =>
              ss.id === sessionId ? { ...ss, status: 'ended' as const } : ss,
            ),
            liveRooms: s.liveRooms.map((r) =>
              r.sessionId === sessionId ? { ...r, status: 'offline' as const } : r,
            ),
          }));
          broadcastLiveState();
        },
      };
    },
    {
      name: 'sugarmate-live-store',
      // 不持久化实时数据（每次都重新初始化）
      partialize: (state) => ({
        broadcastPlans: state.broadcastPlans,
        liveSessions: state.liveSessions,
        liveRooms: state.liveRooms,
        liveProducts: state.liveProducts,
        marketingActivities: state.marketingActivities,
        interactionConfigs: state.interactionConfigs,
        controlCommands: state.controlCommands,
        // NB: explainLock 不持久化——每次开播讲解锁重置
      }),
    },
  ),
);

// ==================== 跨标签页实时同步 ====================
// 利用 BroadcastChannel API 实现 PC中控台 ↔ APP观看端 的实时数据同步
// 只在关键 action 中手动广播，避免 initMockData 反向覆盖已审核的评论

const liveSyncChannel = new BroadcastChannel('sugarmate-live-sync');
let isRemoteSync = false;

liveSyncChannel.onmessage = (event) => {
  const { type, payload } = event.data || {};
  if (type !== 'LIVE_SYNC') return;

  isRemoteSync = true;
  useLiveStore.setState({
    comments: payload.comments,
    liveStats: payload.liveStats,
    controlCommands: payload.controlCommands,
    explainLock: payload.explainLock,
    liveProducts: payload.liveProducts,
    liveSessions: payload.liveSessions,
    liveRooms: payload.liveRooms,
    marketingActivities: payload.marketingActivities,
    interactionConfigs: payload.interactionConfigs,
    broadcastPlans: payload.broadcastPlans,
  });
  isRemoteSync = false;
};

/** 广播实时状态到其他标签页 */
function broadcastLiveState() {
  if (isRemoteSync) return;
  const state = useLiveStore.getState();
  liveSyncChannel.postMessage({
    type: 'LIVE_SYNC',
    payload: {
      comments: state.comments,
      liveStats: state.liveStats,
      controlCommands: state.controlCommands,
      explainLock: state.explainLock,
      liveProducts: state.liveProducts,
      liveSessions: state.liveSessions,
      liveRooms: state.liveRooms,
      marketingActivities: state.marketingActivities,
      interactionConfigs: state.interactionConfigs,
      broadcastPlans: state.broadcastPlans,
    },
  });
  // 双通道兜底：同时写入 localStorage，syncEngine 链路D 轮询兜底
  try {
    const { persistLiveState } = require('./syncEngine');
    persistLiveState();
  } catch { /* ignore */ }
}
