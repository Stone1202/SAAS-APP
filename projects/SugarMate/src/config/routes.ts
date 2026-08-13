/**
 * SugarMate 全端路由配置（单一事实源）
 * 
 * 基于：PRD-SugarMate-v3.1.0 + UX交互文档v3.1.1 + BA+UX联合排查报告
 * 终端：MP / APP(患者/医生/营养师) / PC / LIVE
 * 
 * 页码编号对齐：PG-SUG-{终端缩写}-{NNN}
 */

// ======================== 终端路径前缀 ========================
export const TERMINAL_PREFIX = {
  PC: '',
  MP: '/mp',
  APP: '/app',
  LIVE: '/live',
} as const;

// ======================== APP 角色视图路径 ========================
export const APP_ROLE = {
  PATIENT: '/app',
  DOCTOR: '/app/doctor',
  NUTRITIONIST: '/app/nutritionist',
} as const;

// ======================== MP 小程序路由（PRD: 4 Tab 首页/附近/咨询/我的） ========================
export const MP_ROUTES = {
  // Tab 层
  HOME: '/mp/home',           // PG-SUG-MP-001 首页（科普流+直播入口+风险评估入口）
  NEARBY: '/mp/nearby',       // PG-SUG-MP-009 附近药房列表（LBS）
  CONSULT: '/mp/consult',     // PG-SUG-MP-006 IM对话·咨询
  CONSULT_ORDERS: '/mp/consult/orders', // PG-SUG-MP-007 问诊订单列表
  MINE: '/mp/mine',           // PG-SUG-MP-014 我的
  
  // 子页面
  ARTICLE_DETAIL: '/mp/article/:id',     // PG-SUG-MP-002 科普内容详情
  RISK_ASSESSMENT: '/mp/assessment',     // PG-SUG-MP-003 风险评估问卷
  RISK_RESULT: '/mp/assessment/result',  // PG-SUG-MP-004 风险评估结果
  PRODUCT_DETAIL: '/mp/product/:id',     // PG-SUG-MP-005 商品详情
  LIVESTREAM: '/mp/live/:id',            // PG-SUG-MP-007 直播轻观看
  LIVE_SCHEDULE: '/mp/live/schedule',    // PG-SUG-MP-008 直播预告详情
  DOCTOR_PROFILE: '/mp/doctor/:id',      // PG-SUG-MP-010 医生名片
  NUTRITIONIST_PROFILE: '/mp/nutritionist/:id', // PG-SUG-MP-011 营养师名片
  COMMUNITY: '/mp/community',            // PG-SUG-MP-012 糖友圈社区
  INVITE: '/mp/invite',                  // PG-SUG-MP-013 邀请有礼
  PHARMACY_DETAIL: '/mp/pharmacy/:id',   // 附近药房详情
} as const;

// ======================== APP 患者端路由（PRD: 5 Tab 首页/服务/社区/会员/我的） ========================
export const APP_PATIENT_ROUTES = {
  // Tab 层
  HOME: '/app/home',           // PG-SUG-APP-009 患者首页（血糖仪表盘）
  SERVICE: '/app/service',     // PG-SUG-APP-016 服务聚合页
  COMMUNITY: '/app/community', // PG-SUG-APP-072 社区首页
  MEMBER: '/app/member',       // PG-SUG-APP-082 会员中心
  MINE: '/app/mine',           // PG-SUG-APP-001 我的
  
  // ---- 账号与健康档案域 (PG-SUG-APP-001~015) ----
  ACCOUNT_SECURITY: '/app/mine/security',           // PG-SUG-APP-002 账号安全中心
  ROLE_SWITCH: '/app/mine/role-switch',             // PG-SUG-APP-003 角色选择/切换
  HEALTH_PROFILE: '/app/mine/health-profile',       // PG-SUG-APP-004 健康档案
  PRIVACY_SETTINGS: '/app/mine/privacy',            // PG-SUG-APP-005 隐私与数据授权
  FAMILY_MANAGE: '/app/mine/family',                // PG-SUG-APP-006 家属管理
  REMOTE_MONITOR: '/app/mine/remote-monitor',       // PG-SUG-APP-007 远程监护
  LANGUAGE_SETTINGS: '/app/mine/language',          // PG-SUG-APP-008 多语言设置
  
  // ---- 问诊域 (PG-SUG-APP-016~030) ----
  DOCTOR_SEARCH: '/app/service/doctors',            // PG-SUG-APP-017 医生搜索/列表
  DOCTOR_PROFILE: '/app/service/doctor/:id',        // PG-SUG-APP-018 医生主页
  CONSULTATION_CHAT: '/app/service/consult/:id',    // PG-SUG-APP-019 问诊对话·图文+视频
  FOLLOWUP_LIST: '/app/service/followup',           // PG-SUG-APP-020 复诊记录列表
  DOCTOR_REVIEW: '/app/service/review/:id',         // PG-SUG-APP-021 医生评价
  EMR_VIEW: '/app/service/emr/:id',                 // PG-SUG-APP-022 电子病历查看
  VIP_SERVICE: '/app/service/vip',                  // PG-SUG-APP-023 1v1签约服务列表
  VIP_DETAIL: '/app/service/vip/:id',               // PG-SUG-APP-024 签约详情
  EMERGENCY_SOS: '/app/service/sos',                // PG-SUG-APP-025 紧急SOS
  
  // ---- 处方与商城域 (PG-SUG-APP-031~060) ----
  PRESCRIPTION_LIST: '/app/mine/prescriptions',     // PG-SUG-APP-031 处方列表
  PRESCRIPTION_DETAIL: '/app/mine/prescription/:id',// PG-SUG-APP-032 处方详情(CA签名)
  PHARMACIST_REVIEW: '/app/mine/prescription/:id/review', // PG-SUG-APP-033 药师审核状态
  REFILL_REQUEST: '/app/mine/prescription/:id/refill',    // PG-SUG-APP-034 续方申请
  DRUG_INTERACTION: '/app/mine/drug-interaction',   // PG-SUG-APP-035 药物相互作用提醒
  MED_REMINDER: '/app/mine/med-reminder',           // PG-SUG-APP-036 用药提醒设置
  RX_PRICE_COMPARE: '/app/mine/prescription/:id/compare', // PG-SUG-APP-037 处方流转比价
  MALL_HOME: '/app/mall',                           // PG-SUG-APP-038 商城首页（当前Tab4即会员页复用）
  MALL_SEARCH: '/app/mall/search',                  // PG-SUG-APP-039 商品搜索/结果
  PRODUCT_DETAIL: '/app/mall/product/:productId',          // PG-SUG-APP-040 商品详情
  CART: '/app/mall/cart',                           // PG-SUG-APP-041 购物车（PG-SUG-APP-044）
  ORDER_CONFIRM: '/app/mall/checkout',              // PG-SUG-APP-042 下单确认（PG-SUG-APP-045）
  PAYMENT: '/app/mall/payment/:orderId',            // PG-SUG-APP-043 支付页
  RX_ZONE: '/app/mall/rx',                          // PG-SUG-APP-044 处方药专区
  PRODUCT_REVIEW: '/app/mall/review/:orderId',      // PG-SUG-APP-045 商品评价
  ORDER_LIST: '/app/mine/orders',                   // PG-SUG-APP-046 订单列表
  CONSULTATION_ORDER_LIST: '/app/mine/consultations', // PG-SUG-APP-046b 问诊订单列表
  UNIFIED_ORDER_LIST: '/app/mine/orders/unified',    // V2.0.0 统一订单中心
  ORDER_DETAIL: '/app/mine/order/:id',              // PG-SUG-APP-047 订单详情
  COLDCHAIN_TRACK: '/app/mine/order/:id/track',     // PG-SUG-APP-048 冷链配送追踪
  AFTERSALE: '/app/mine/order/:id/aftersale',       // PG-SUG-APP-049 退款/售后
  ADR_REPORT: '/app/mine/adr-report',               // PG-SUG-APP-050 ADR不良反应上报
  
  // ---- 慢病管理域 (PG-SUG-APP-061~095) ----
  CGM_BINDING: '/app/home/cgm/bind',                // PG-SUG-APP-061 CGM设备绑定
  GLUCOSE_MANUAL: '/app/home/glucose/entry',        // PG-SUG-APP-062 手动血糖录入
  GLUCOSE_TREND: '/app/home/glucose/trend',         // PG-SUG-APP-063 血糖趋势分析
  TIR_ANALYSIS: '/app/home/glucose/tir',            // PG-SUG-APP-064 TIR达标分析
  ALERT_DETAIL: '/app/home/alert/:id',              // PG-SUG-APP-065 预警详情
  HBA1C_PREDICT: '/app/home/glucose/hba1c',         // PG-SUG-APP-066 HbA1c预测
  DIET_RECORD: '/app/home/diet',                    // PG-SUG-APP-067 饮食记录
  DIET_PLAN: '/app/home/diet/plan',                 // PG-SUG-APP-068 饮食方案展示
  EXERCISE_RECORD: '/app/home/exercise',            // PG-SUG-APP-069 运动记录
  HM_SERVICE: '/app/home/hm-service',               // PG-SUG-APP-070 HM 1v1服务
  HEALTH_REPORT: '/app/mine/health-report',         // PG-SUG-APP-071 健康报告
  
  // ---- 社区域 (PG-SUG-APP-072~081) ----
  POST_DETAIL: '/app/community/post/:id',           // PG-SUG-APP-073 帖子详情
  POST_CREATE: '/app/community/create',             // PG-SUG-APP-074 发布页
  TOPIC_SQUARE: '/app/community/topics',            // PG-SUG-APP-075 话题广场
  TOPIC_DETAIL: '/app/community/topic/:id',         // PG-SUG-APP-076 话题详情
  FOLLOW_LIST: '/app/community/follows',            // PG-SUG-APP-077 关注/粉丝列表
  CREATOR_PROFILE: '/app/community/creator/:id',    // PG-SUG-APP-078 达人主页
  FEATURED: '/app/community/featured',              // PG-SUG-APP-079 精华推荐
  OFFICIAL_PROFILE: '/app/community/official/:id',  // PG-SUG-APP-080 官方账号主页
  CIRCLE_DETAIL: '/app/community/circle/:id',       // PG-SUG-APP-081 糖友圈社群
  
  // ---- 会员域 (PG-SUG-APP-082~095) ----
  POINTS_CENTER: '/app/member/points',              // PG-SUG-APP-083 积分中心
  CHECKIN: '/app/member/checkin',                   // PG-SUG-APP-084 签到
  COUPON_CENTER: '/app/member/coupons',             // PG-SUG-APP-085 优惠券中心
} as const;

// ======================== APP 医生端路由（PRD: 5 Tab 工作台/问诊/患者/直播/我的） ========================
export const APP_DOCTOR_ROUTES = {
  // Tab 层
  WORKBENCH: '/app/doctor/workbench',   // PG-SUG-APP-101 医生工作台
  CONSULT: '/app/doctor/consult',       // PG-SUG-APP-102 问诊列表
  PATIENTS: '/app/doctor/patients',     // PG-SUG-APP-103 患者管理
  LIVE: '/app/doctor/live',             // 直播
  MINE: '/app/doctor/mine',             // 我的
  
  // 子页面
  PATIENT_DETAIL: '/app/doctor/patient/:id',        // PG-SUG-APP-103 患者详情(健康档案只读)
  DIAGNOSIS_WRITE: '/app/doctor/diagnosis/:id',     // PG-SUG-APP-104 诊断书写
  E_PRESCRIPTION: '/app/doctor/prescription',   // PG-SUG-APP-105 电子处方(CA签名)
  CONSULTATION_CHAT: '/app/doctor/consult/chat/:orderId', // PG-SUG-APP-106 医生端问诊对话
  INCOME_DETAIL: '/app/doctor/mine/income',         // PG-SUG-APP-107 收入明细
  REVIEW_MANAGE: '/app/doctor/mine/reviews',        // PG-SUG-APP-108 评价管理
  PROFILE_EDIT: '/app/doctor/mine/profile',         // PG-SUG-APP-109 我的主页编辑
  CREDENTIALS: '/app/doctor/mine/credentials',      // PG-SUG-APP-110 执业信息(只读)
} as const;

// ======================== APP 营养师端路由（PRD: 5 Tab 工作台/患者/饮食方案/直播/我的） ========================
export const APP_NUTRITIONIST_ROUTES = {
  // Tab 层
  WORKBENCH: '/app/nutritionist/workbench',       // PG-SUG-APP-121 工作台
  PATIENTS: '/app/nutritionist/patients',         // PG-SUG-APP-122 患者管理
  DIET: '/app/nutritionist/diet',                 // PG-SUG-APP-123 饮食方案
  LIVE: '/app/nutritionist/live',                 // 直播
  MINE: '/app/nutritionist/mine',                 // 我的
  
  // 子页面
  DIET_TEMPLATES: '/app/nutritionist/diet/templates',   // PG-SUG-APP-124 方案模板库
  DIET_TRACKING: '/app/nutritionist/diet/tracking/:id', // PG-SUG-APP-125 方案执行追踪
  INCOME_DETAIL: '/app/nutritionist/mine/income',       // PG-SUG-APP-127 收入明细
} as const;

// ======================== PC 后台路由 ========================
export const PC_ROUTES = {
  // 现有路由
  DASHBOARD: '/dashboard',
  ONBOARDING: '/onboarding',
  MERCHANTS: '/merchants',
  DOCTORS: '/doctors',
  PHARMACISTS: '/pharmacists',
  NUTRITIONISTS: '/nutritionists',
  CERTIFICATES: '/certificates',
  CONTRACTS: '/contracts',
  RATINGS: '/ratings',
  // TRAININGS: '/trainings', // 培训流程已移除
  CONFIG_CENTER: '/config-center',
  SCRM_CUSTOMERS: '/scrm/customers',
  SCRM_TAGS: '/scrm/tags',
  SCRM_SOP: '/scrm/sop',
  SCRM_CAMPAIGN: '/scrm/campaign',
  SCRM_CONVERSION: '/scrm/conversion',
  SCRM_CONVERSATIONS: '/scrm/conversations',
  SCRM_LEADS: '/scrm/leads',
  PRODUCTS_MGMT: '/products-mgmt',
  PRODUCTS_REVIEW: '/products-review',   // V2.2.0 商品审核中心
  OTC_REVIEW: '/otc-review',
  CATEGORIES: '/categories',
  // V2.2.0 药店管理
  PHARMACY_RX: '/pharmacy/rx',
  PHARMACY_OTC: '/pharmacy/otc',
  PHARMACY_DEVICES: '/pharmacy/devices',
  PHARMACY_SUPPLEMENTS: '/pharmacy/supplements',
  PHARMACY_ORDERS: '/pharmacy/orders',
  PHARMACY_PRESCRIPTIONS: '/pharmacy/prescriptions', // V2.2.1 处方管理→药店管理
  PHARMACY_COLDCHAIN: '/pharmacy/coldchain',
  PHARMACY_AFTERSALE: '/pharmacy/aftersale',
  // 旧路由保留（内部链接兼容）
  ORDERS: '/orders',
  COLDCHAIN: '/coldchain',
  AFTERSALE_MGMT: '/aftersale-mgmt',
  FINANCE_SETTLEMENTS: '/finance/settlements',
  FINANCE_RECONCILIATION: '/finance/reconciliation',
  FINANCE_SPLIT_CONFIG: '/finance/split-config',
  OPS_BANNERS: '/ops/banners',
  OPS_CONTENT_REVIEW: '/ops/content-review',
  OPS_ACTIVITIES: '/ops/activities',
  OPS_TICKETS: '/ops/tickets',
  OPS_COMPLAINTS: '/ops/complaints',
  CONSULTATION_MONITOR: '/consultation/monitor', // 问诊监控
  CONSULTATION_SERVICES: '/consultation/services', // 问诊服务管理
  CONSULTATION_ORDERS: '/consultation/orders', // 问诊订单管理
  CONSULTATION_PRESCRIPTIONS: '/consultation/prescriptions', // 处方管理
  DATA_DASHBOARD: '/data/dashboard',
  SYSTEM_ROLES: '/system/roles',
  SYSTEM_CONFIG: '/system/config',
  
  // ---- 直播管理（PC后台运营） ----
  LIVE_PLANS: '/live-mgmt/plans',             // 开播计划管理
  LIVE_SESSIONS: '/live-mgmt/sessions',        // 场次管理
  LIVE_ROOMS: '/live-mgmt/rooms',              // 直播间管理
  LIVE_PRODUCTS: '/live-mgmt/products',        // 商品配置
  LIVE_MARKETING: '/live-mgmt/marketing',      // 营销活动
  LIVE_INTERACTION: '/live-mgmt/interaction',  // 互动管理
  LIVE_CONTROL: '/live-mgmt/control',          // 直播中控台
  
  // ---- 详情/编辑子路由 (BA+UX 报告 P1 缺失项) ----
  MERCHANT_DETAIL: '/merchants/:id',           // PG-SUG-PC-003 药房详情
  DOCTOR_DETAIL: '/doctors/:id',               // PG-SUG-PC-005 医生详情
  CUSTOMER_DETAIL: '/scrm/customers/:id',      // PG-SUG-PC-013 客户详情(含画像)
  TAG_DETAIL: '/scrm/tags/:id',                // 标签详情/编辑
  SOP_CREATE: '/scrm/sop/create',              // 新建SOP规则
  PRODUCT_CREATE: '/products-mgmt/create',     // PG-SUG-PC-024 商品上架
  PRODUCT_EDIT: '/products-mgmt/:id/edit',     // 商品编辑
  BANNER_CREATE: '/ops/banners/create',        // PG-SUG-PC-021 Banner创建
  BANNER_EDIT: '/ops/banners/:id/edit',        // Banner编辑
  ACTIVITY_CREATE: '/ops/activities/create',   // 创建活动
  SETTLEMENT_DETAIL: '/finance/settlements/:id', // PG-SUG-PC-030 结算单详情
  ORDER_DETAIL_PC: '/orders/:orderId',         // 已存在
  // TRAINING_COURSE: '/trainings/courses',       // PG-SUG-PC-037 培训课程（已移除）
  // TRAINING_EXAM: '/trainings/exam',            // PG-SUG-PC-038 考试管理（已移除）
} as const;

// ======================== LIVE 直播端路由 ========================
export const LIVE_ROUTES = {
  // Tab 层
  ROOM: '/live/room',             // 直播间
  SCHEDULE: '/live/schedule',     // 排期
  MALL: '/live/mall',             // 商城
  MINE: '/live/mine',             // 我的
  
  // 子页面
  CREATE_ROOM: '/live/room/create',           // 创建直播间
  PUSH_CONFIG: '/live/room/push-config',      // 推流配置
  BEAUTY_FILTER: '/live/room/beauty',         // 美颜设置
  DANMAKU: '/live/room/danmaku',              // 弹幕管理
  RECORDING: '/live/room/recording',          // 录制管理
  REPLAY: '/live/replay/:id',                 // 回放
  LIVE_STATS: '/live/room/stats',             // 直播数据统计
  AUDIT_CENTER: '/live/audit',                // 安全审核
  KNOWLEDGE_LIVE: '/live/room/knowledge',     // 科普直播
  LECTURE_LIVE: '/live/room/lecture',         // 讲堂直播
  SHOPPING_LIVE: '/live/room/shopping',       // 直播带货
  QA_SESSION: '/live/room/qa',                // 互动问答
  SCHEDULE_CREATE: '/live/schedule/create',   // 创建排期
  SUBSCRIPTIONS: '/live/mine/subscriptions',  // 关注订阅
  PLAN_MANAGE: '/live/plan',                  // 计划管理
  QUALIFICATION: '/live/mine/qualification',  // 资质管理
  LIVE_PRODUCT: '/live/mall/product',         // 直播商品管理
  LIVE_PRODUCT_DETAIL: '/live/product-detail',  // 直播商品详情
  RISK_CONTROL: '/live/mine/risk-control',    // 风控
  INCOME_SETTLE: '/live/mine/income',         // 收入结算
} as const;

// ======================== 首页 & 登录 & 门户 ========================
export const SHARED_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PORTAL: '/portal',
} as const;

// ======================== MP Tab 定义（PRD 4 Tab：首页/附近/咨询/我的） ========================
export const MP_TAB_CONFIG = [
  { key: 'home',    label: '首页', path: '/mp/home' },
  { key: 'nearby',  label: '附近', path: '/mp/nearby' },
  { key: 'consult', label: '咨询', path: '/mp/consult' },
  { key: 'mine',    label: '我的', path: '/mp/mine' },
] as const;

// ======================== APP 患者端 Tab 定义 ========================
export const APP_PATIENT_TAB_CONFIG = [
  { key: 'home',      label: '首页', path: APP_PATIENT_ROUTES.HOME },
  { key: 'service',   label: '服务', path: APP_PATIENT_ROUTES.SERVICE },
  { key: 'community', label: '社区', path: APP_PATIENT_ROUTES.COMMUNITY },
  { key: 'member',    label: '会员', path: APP_PATIENT_ROUTES.MEMBER },
  { key: 'mine',      label: '我的', path: APP_PATIENT_ROUTES.MINE },
] as const;

// ======================== APP 角色 Tab ========================
export const APP_DOCTOR_TAB_CONFIG = [
  { key: 'workbench', label: '工作台', path: APP_DOCTOR_ROUTES.WORKBENCH },
  { key: 'consult',   label: '问诊',   path: APP_DOCTOR_ROUTES.CONSULT },
  { key: 'patients',  label: '患者',   path: APP_DOCTOR_ROUTES.PATIENTS },
  { key: 'live',      label: '直播',   path: APP_DOCTOR_ROUTES.LIVE },
  { key: 'mine',      label: '我的',   path: APP_DOCTOR_ROUTES.MINE },
] as const;

export const APP_NUTRITIONIST_TAB_CONFIG = [
  { key: 'workbench', label: '工作台',   path: APP_NUTRITIONIST_ROUTES.WORKBENCH },
  { key: 'patients',  label: '患者',     path: APP_NUTRITIONIST_ROUTES.PATIENTS },
  { key: 'diet',      label: '饮食方案', path: APP_NUTRITIONIST_ROUTES.DIET },
  { key: 'live',      label: '直播',     path: APP_NUTRITIONIST_ROUTES.LIVE },
  { key: 'mine',      label: '我的',     path: APP_NUTRITIONIST_ROUTES.MINE },
] as const;

export const LIVE_TAB_CONFIG = [
  { key: 'room',      label: '直播间', path: LIVE_ROUTES.ROOM },
  { key: 'schedule',  label: '排期',   path: LIVE_ROUTES.SCHEDULE },
  { key: 'mall',      label: '商城',   path: LIVE_ROUTES.MALL },
  { key: 'mine',      label: '我的',   path: LIVE_ROUTES.MINE },
] as const;
