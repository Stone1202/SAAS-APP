/**
 * SugarMate 全端路由注册模块 (Arch + Dev 联合校准版)
 * 
 * 基于 BA+UX 联合排查报告 + PRD v3.1.0 + UX交互文档 v3.1.1
 * 每个终端路由模块独立管理，App.tsx 统一注册
 */

export { MP_ROUTES, MP_TAB_CONFIG } from './routes';
export { APP_PATIENT_ROUTES, APP_PATIENT_TAB_CONFIG } from './routes';
export { APP_DOCTOR_ROUTES, APP_DOCTOR_TAB_CONFIG } from './routes';
export { APP_NUTRITIONIST_ROUTES, APP_NUTRITIONIST_TAB_CONFIG } from './routes';
export { PC_ROUTES } from './routes';
export { LIVE_ROUTES, LIVE_TAB_CONFIG } from './routes';

// ============ 跨端跳转映射（deeplink-routes-v1.0.0 基准） ============
export const DEEPLINK_MAP: Record<string, string> = {
  // MP → APP 跳转
  'mp:risk-result': '/app/home',
  'mp:download': '/app/home',
  'mp:doctor-profile': '/app/service/doctor/:id',
  
  // APP → MP 分享链接
  'app:share-article': '/mp/article/:id',
  'app:share-invite': '/mp/invite',
  
  // PC → APP 定向跳转
  'pc:doctor-detail': '/app/service/doctor/:id',
  'pc:product-detail': '/app/mall/product/:id',
};

// ============ 导航链接生成器 ============
export const navigateTo = {
  // APP 患者端
  app: {
    doctorProfile: (id: string) => `/app/service/doctor/${id}`,
    consultationChat: (id: string) => `/app/service/consult/${id}`,
    productDetail: (id: string) => `/app/mall/product/${id}`,
    postDetail: (id: string) => `/app/community/post/${id}`,
    prescriptionDetail: (id: string) => `/app/mine/prescription/${id}`,
    orderDetail: (id: string) => `/app/mine/order/${id}`,
    cgmBinding: () => '/app/home/cgm/bind',
    glucoseManual: () => '/app/home/glucose/entry',
    glucoseTrend: () => '/app/home/glucose/trend',
    tirAnalysis: () => '/app/home/glucose/tir',
    hba1cPredict: () => '/app/home/glucose/hba1c',
    dietRecord: () => '/app/home/diet',
    emrView: (id: string) => `/app/service/emr/${id}`,
    vipDetail: (id: string) => `/app/service/vip/${id}`,
    emergencySos: () => '/app/service/sos',
  },
  // APP 医生端
  doctor: {
    patientDetail: (id: string) => `/app/doctor/patient/${id}`,
    diagnosisWrite: (id: string) => `/app/doctor/diagnosis/${id}`,
    ePrescription: (orderId: string) => `/app/doctor/prescription?orderId=${orderId}`,
    incomeDetail: () => '/app/doctor/mine/income',
    reviewManage: () => '/app/doctor/mine/reviews',
    profileEdit: () => '/app/doctor/mine/profile',
    credentials: () => '/app/doctor/mine/credentials',
  },
  // APP 营养师端
  nutritionist: {
    dietTemplates: () => '/app/nutritionist/diet/templates',
    dietTracking: (id: string) => `/app/nutritionist/diet/tracking/${id}`,
    incomeDetail: () => '/app/nutritionist/mine/income',
  },
  // MP 小程序
  mp: {
    articleDetail: (id: string) => `/mp/article/${id}`,
    riskAssessment: () => '/mp/assessment',
    riskResult: () => '/mp/assessment/result',
    productDetail: (id: string) => `/mp/product/${id}`,
    liveView: (id: string) => `/mp/live/${id}`,
    doctorProfile: (id: string) => `/mp/doctor/${id}`,
    nutritionistProfile: (id: string) => `/mp/nutritionist/${id}`,
    pharmacyDetail: (id: string) => `/mp/pharmacy/${id}`,
    community: () => '/mp/community',
    invite: () => '/mp/invite',
  },
  // PC 后台
  pc: {
    merchantDetail: (id: string) => `/merchants/${id}`,
    doctorDetail: (id: string) => `/doctors/${id}`,
    customerDetail: (id: string) => `/scrm/customers/${id}`,
    tagDetail: (id: string) => `/scrm/tags/${id}`,
    sopCreate: () => '/scrm/sop/create',
    productCreate: () => '/products-mgmt/create',
    productEdit: (id: string) => `/products-mgmt/${id}/edit`,
    bannerCreate: () => '/ops/banners/create',
    bannerEdit: (id: string) => `/ops/banners/${id}/edit`,
    activityCreate: () => '/ops/activities/create',
    settlementDetail: (id: string) => `/finance/settlements/${id}`,
    orderDetail: (orderId: string) => `/orders/${orderId}`,
    trainingCourse: () => '/trainings/courses',
    trainingExam: () => '/trainings/exam',
  },
  // LIVE 直播端
  live: {
    createRoom: () => '/live/room/create',
    pushConfig: () => '/live/room/push-config',
    beautyFilter: () => '/live/room/beauty',
    danmaku: () => '/live/room/danmaku',
    recording: () => '/live/room/recording',
    replay: (id: string) => `/live/replay/${id}`,
    stats: () => '/live/room/stats',
    audit: () => '/live/audit',
    knowledgeLive: () => '/live/room/knowledge',
    lectureLive: () => '/live/room/lecture',
    shoppingLive: () => '/live/room/shopping',
    qa: () => '/live/room/qa',
    subscriptions: () => '/live/mine/subscriptions',
    plan: () => '/live/plan',
    qualification: () => '/live/mine/qualification',
    product: () => '/live/mall/product',
    riskControl: () => '/live/mine/risk-control',
    income: () => '/live/mine/income',
  },
};

export default navigateTo;
