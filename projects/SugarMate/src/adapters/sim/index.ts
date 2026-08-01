/**
 * SugarMate PC 业务后台 SIM 适配器
 * 内存数据驱动，支持原型全链路演示
 */
import type { IDataAdapter, ITransportAdapter, IStreamAdapter, IAssetAdapter, IAuthAdapter, AdapterSet, ProductData, ProductCategoryData } from '../factory';
import type { ProductType } from '../../contracts/trade';

// ============================================================
// 模拟数据
// ============================================================
const MOCK_ACCOUNTS: Record<string, any> = {
  'acc-admin': { id: 'acc-admin', phone: '13800000000', status: 'ACTIVE', created_at: 1700000000 },
  'acc-ops': { id: 'acc-ops', phone: '13800000001', status: 'ACTIVE', created_at: 1700000000 },
};

const MOCK_IDENTITIES: any[] = [
  { id: 'id-admin', account_id: 'acc-admin', role: 'ADMIN', status: 'ACTIVE', real_name: '超级管理员', merchant_id: null, created_at: 1700000000 },
  { id: 'id-ops', account_id: 'acc-ops', role: 'OPS', status: 'ACTIVE', real_name: '运营审核员', merchant_id: null, created_at: 1700000000 },
];

// 入驻申请
const MOCK_APPLICATIONS: any[] = [
  { id: 'app-001', apply_no: 'SQ20260728001', merchant_name: 'XX大药房（连锁）', type: 'PHARMACY', contact_name: '李经理', contact_phone: '13900000001', status: 'PENDING', submitted_at: 1722096000, province: '浙江省', city: '杭州市', license_no: '浙AA123456', business_scope: '药品零售', attachments_count: 5 },
  { id: 'app-002', apply_no: 'SQ20260728002', merchant_name: '张医生诊所', type: 'DOCTOR', contact_name: '张明', contact_phone: '13900000002', status: 'PENDING', submitted_at: 1722097000, province: '浙江省', city: '宁波市', practice_no: 'ZJ20240001', department: '内分泌科', title: '主任医师', attachments_count: 3 },
  { id: 'app-003', apply_no: 'SQ20260727001', merchant_name: '王营养师工作室', type: 'NUTRITIONIST', contact_name: '王芳', contact_phone: '13900000003', status: 'IN_REVIEW', submitted_at: 1722010000, province: '上海市', city: '浦东新区', cert_no: 'SH20240005', attachments_count: 2 },
  { id: 'app-004', apply_no: 'SQ20260726001', merchant_name: '赵药师药房', type: 'PHARMACIST', contact_name: '赵强', contact_phone: '13900000004', status: 'APPROVED', submitted_at: 1721923000, approved_at: 1722009600, province: '江苏省', city: '苏州市', cert_no: 'JS20240008', attachments_count: 3 },
  { id: 'app-005', apply_no: 'SQ20260726002', merchant_name: '晨光医疗器械', type: 'PHARMACY', contact_name: '陈总', contact_phone: '13900000005', status: 'REJECTED', submitted_at: 1721923000, reviewed_at: 1721952000, reject_reason: '证照模糊不清晰，请重新上传高清扫描件', province: '浙江省', city: '温州市', attachments_count: 2 },
  { id: 'app-006', apply_no: 'SQ20260725001', merchant_name: '刘医生糖尿病中心', type: 'DOCTOR', contact_name: '刘伟', contact_phone: '13900000006', status: 'PENDING', submitted_at: 1721836000, province: '广东省', city: '深圳市', practice_no: 'GD20240012', department: '内分泌科', title: '副主任医师', attachments_count: 4 },
  { id: 'app-007', apply_no: 'SQ20260725002', merchant_name: '便民大药房', type: 'PHARMACY', contact_name: '周老板', contact_phone: '13900000007', status: 'PENDING', submitted_at: 1721836000, province: '北京市', city: '朝阳区', license_no: '京AA789012', business_scope: '药品零售+医疗器械', attachments_count: 6 },
  { id: 'app-008', apply_no: 'SQ20260724001', merchant_name: '孙营养工作室', type: 'NUTRITIONIST', contact_name: '孙悦', contact_phone: '13900000008', status: 'IN_REVIEW', submitted_at: 1721750000, province: '四川省', city: '成都市', cert_no: 'SC20240003', attachments_count: 2 },
];

// 药房/商家
const MOCK_MERCHANTS: any[] = [
  { id: 'm-001', name: 'XX大药房（连锁）', type: 'PHARMACY', status: 'ACTIVE', contact_name: '李经理', contact_phone: '13900000001', province: '浙江省', city: '杭州市', total_orders: 12580, total_revenue: 258000, joined_at: 1667000000 },
  { id: 'm-002', name: '赵药师药房', type: 'PHARMACIST', status: 'ACTIVE', contact_name: '赵强', contact_phone: '13900000004', province: '江苏省', city: '苏州市', total_orders: 4320, total_revenue: 86000, joined_at: 1670000000 },
  { id: 'm-003', name: '张医生诊所', type: 'DOCTOR', status: 'ACTIVE', contact_name: '张明', contact_phone: '13900000002', province: '浙江省', city: '宁波市', total_orders: 2100, total_revenue: 63000, joined_at: 1680000000 },
  { id: 'm-004', name: '晨光医疗器械', type: 'PHARMACY', status: 'SUSPENDED', contact_name: '陈总', contact_phone: '13900000005', province: '浙江省', city: '温州市', total_orders: 0, total_revenue: 0, joined_at: 1690000000 },
  { id: 'm-005', name: '王营养师工作室', type: 'NUTRITIONIST', status: 'ACTIVE', contact_name: '王芳', contact_phone: '13900000003', province: '上海市', city: '浦东新区', total_orders: 356, total_revenue: 89000, joined_at: 1700000000 },
];

// 订单（V2.0.0 增强：含商品类型、冷链、处方校验信息）
const MOCK_ORDERS: any[] = [
  { 
    id: 'ord-001', order_no: 'SG202607290001', buyer_name: '张患者', buyer_phone: '13800000001', 
    merchant_name: 'XX大药房', merchant_id: 'm-001', 
    product_types: ['OTC'], has_rx_item: false, has_cold_chain_item: false,
    items_count: 2, total_amount: 256, pay_amount: 256, status: 'PAID', pay_channel: 'WECHAT', created_at: 1722211200 
  },
  { 
    id: 'ord-002', order_no: 'SG202607290002', buyer_name: '李患者', buyer_phone: '13800000002',
    merchant_name: '赵药师药房', merchant_id: 'm-002',
    product_types: ['RX'], has_rx_item: true, has_cold_chain_item: true,
    items_count: 1, total_amount: 218, pay_amount: 218, status: 'RX_CHECKING', pay_channel: 'WECHAT',
    rx_check_result: { passed: false },
    created_at: 1722170000,
  },
  { 
    id: 'ord-003', order_no: 'SG202607280001', buyer_name: '王患者', buyer_phone: '13800000003', 
    merchant_name: '张医生诊所', merchant_id: 'm-003',
    product_types: ['DEVICE'], has_rx_item: false, has_cold_chain_item: false,
    items_count: 1, total_amount: 328, pay_amount: 328, status: 'SHIPPED',
    logistics: { company: '顺丰速运', tracking_no: 'SF1234567890' }, 
    created_at: 1722124800,
  },
  { 
    id: 'ord-004', order_no: 'SG202607270001', buyer_name: '赵患者', buyer_phone: '13800000004',
    merchant_name: 'XX大药房', merchant_id: 'm-001',
    product_types: ['SUPPLEMENT'], has_rx_item: false, has_cold_chain_item: false,
    items_count: 2, total_amount: 580, pay_amount: 560, status: 'COMPLETED', pay_channel: 'YEEPAY', 
    created_at: 1722038400,
  },
  { 
    id: 'ord-005', order_no: 'SG202607260001', buyer_name: '孙患者', buyer_phone: '13800000005', 
    merchant_name: 'XX大药房', merchant_id: 'm-001',
    product_types: ['OTC'], has_rx_item: false, has_cold_chain_item: true,
    items_count: 1, total_amount: 218, pay_amount: 218, status: 'SHIPPED',
    cold_chain_resend_count: 0,
    logistics: { company: '冷链专送', tracking_no: 'CLD20260726001', temperature: { current: '3.2°C', range: '2-8°C' } },
    created_at: 1721952000,
  },
  { 
    id: 'ord-006', order_no: 'SG202607250001', buyer_name: '刘患者', buyer_phone: '13800000006',
    merchant_name: '王营养师工作室', merchant_id: 'm-005',
    product_types: ['SERVICE'], has_rx_item: false, has_cold_chain_item: false,
    items_count: 1, total_amount: 299, pay_amount: 299, status: 'PAID',
    service_type: 'PER_SESSION',
    created_at: 1721865000,
  },
  { 
    id: 'ord-007', order_no: 'SG202607240001', buyer_name: '陈患者', buyer_phone: '13800000007', 
    merchant_name: 'XX大药房', merchant_id: 'm-001',
    product_types: ['RX', 'OTC'], has_rx_item: true, has_cold_chain_item: false,
    items_count: 3, total_amount: 586, pay_amount: 586, status: 'PROCESSING',
    // 混合订单：处方药+OTC，待拆单
    sub_orders: [
      { sub_order_no: 'SG202607240001-RX', items: ['p-rx-001'], status: 'RX_CHECKING' },
      { sub_order_no: 'SG202607240001-NOR', items: ['p-004', 'p-005'], status: 'AWAITING_SHIP' },
    ],
    created_at: 1721778000,
  },
  { 
    id: 'ord-008', order_no: 'SG202607230001', buyer_name: '周患者', buyer_phone: '13800000008', 
    merchant_name: 'XX大药房', merchant_id: 'm-001',
    product_types: ['RX'], has_rx_item: true, has_cold_chain_item: true,
    items_count: 1, total_amount: 328, pay_amount: 328, status: 'SHIPPED',
    cold_chain_resend_count: 0,
    rx_check_result: { passed: true },
    logistics: { company: '冷链专送', tracking_no: 'CLD20260723001', temperature: { current: '4.1°C', range: '2-8°C' } },
    created_at: 1721692000,
  },
  // ---- V2.2.1 药店履约订单（含完整履约流程）----
  {
    id: 'ord-ful-001', order_no: 'SG202607310001', buyer_name: '张患者', patient_name: '张患者', patient_phone: '13800000001',
    merchant_name: 'XX大药房', merchant_id: 'm-001',
    items: [
      { name: '盐酸二甲双胍片', qty: 2, price: 28.5 },
      { name: '恩格列净片', qty: 1, price: 89 },
    ],
    product_types: ['RX'], has_rx_item: true, has_cold_chain_item: false,
    items_count: 3, total_amount: 146, pay_amount: 146,
    status: 'PAID', pay_channel: 'WECHAT',
    fulfillment_stage: 'PENDING_FULFILLMENT',
    rx_check_result: { passed: true, checked_at: Date.now() / 1000 - 18000, pharmacist_id: 'pharmacist-lifang' },
    cold_chain: false,
    prescription_id: 'pr-001',
    created_at: Date.now() / 1000 - 14400, updated_at: Date.now() / 1000 - 14400,
  },
  {
    id: 'ord-ful-002', order_no: 'SG202607310002', buyer_name: '李患者', patient_name: '李患者', patient_phone: '13800000002',
    merchant_name: 'YY大药房', merchant_id: 'm-002',
    items: [
      { name: '格列齐特缓释片', qty: 1, price: 42.5 },
      { name: '鱼跃血糖试纸', qty: 2, price: 89 },
    ],
    product_types: ['RX', 'OTC'], has_rx_item: true, has_cold_chain_item: false,
    items_count: 3, total_amount: 220.5, pay_amount: 220.5,
    status: 'PAID', pay_channel: 'YEEPAY',
    fulfillment_stage: 'FULFILLING',
    rx_check_result: { passed: true, checked_at: Date.now() / 1000 - 45000, pharmacist_id: 'pharmacist-lifang' },
    cold_chain: false,
    prescription_id: 'pr-002',
    created_at: Date.now() / 1000 - 43200, updated_at: Date.now() / 1000 - 21600,
  },
  {
    id: 'ord-ful-003', order_no: 'SG202607310003', buyer_name: '王患者', patient_name: '王患者', patient_phone: '13800000003',
    merchant_name: 'XX大药房', merchant_id: 'm-001',
    items: [
      { name: '胰岛素注射液（冷链）', qty: 2, price: 198 },
      { name: '一次性胰岛素针头', qty: 1, price: 15 },
    ],
    product_types: ['RX'], has_rx_item: true, has_cold_chain_item: true,
    items_count: 3, total_amount: 411, pay_amount: 411,
    status: 'PAID', pay_channel: 'WECHAT',
    fulfillment_stage: 'FULFILLED',
    rx_check_result: { passed: true, checked_at: Date.now() / 1000 - 87000, pharmacist_id: 'pharmacist-lifang' },
    cold_chain: true,
    cold_chain_resend_count: 0,
    prescription_id: 'pr-003',
    created_at: Date.now() / 1000 - 86400, updated_at: Date.now() / 1000 - 3600,
  },
  {
    id: 'ord-ful-004', order_no: 'SG202607290004', buyer_name: '赵患者', patient_name: '赵患者', patient_phone: '13800000004',
    merchant_name: 'ZZ大药房', merchant_id: 'm-003',
    items: [
      { name: '欧姆龙电子血压计', qty: 1, price: 299 },
    ],
    product_types: ['DEVICE'], has_rx_item: false, has_cold_chain_item: false,
    items_count: 1, total_amount: 299, pay_amount: 299,
    status: 'SHIPPED', pay_channel: 'WECHAT',
    fulfillment_stage: 'SHIPPED',
    cold_chain: false,
    logistics: { company: '顺丰速运', tracking_no: 'SF9876543210' },
    created_at: Date.now() / 1000 - 172800, updated_at: Date.now() / 1000 - 86400,
  },
  {
    id: 'ord-ful-005', order_no: 'SG202607280005', buyer_name: '孙患者', patient_name: '孙患者', patient_phone: '13800000005',
    merchant_name: 'XX大药房', merchant_id: 'm-001',
    items: [
      { name: '善存多维元素片', qty: 1, price: 128 },
      { name: '深海鱼油软胶囊', qty: 1, price: 198 },
    ],
    product_types: ['FOOD'], has_rx_item: false, has_cold_chain_item: false,
    items_count: 2, total_amount: 326, pay_amount: 326,
    status: 'COMPLETED', pay_channel: 'YEEPAY',
    fulfillment_stage: 'COMPLETED',
    cold_chain: false,
    created_at: Date.now() / 1000 - 259200, updated_at: Date.now() / 1000 - 86400,
  },
  // V2.2.2 测试用例：含处方药但未审方的订单（用于验证审方守卫）
  {
    id: 'ord-ful-006', order_no: 'SG202607310006', buyer_name: '周患者', patient_name: '周患者', patient_phone: '13800000006',
    merchant_name: 'XX大药房', merchant_id: 'm-001',
    items: [
      { name: '阿卡波糖片', qty: 2, price: 45 },
      { name: '血糖试纸', qty: 1, price: 89 },
    ],
    product_types: ['RX', 'DEVICE'], has_rx_item: true, has_cold_chain_item: false,
    items_count: 3, total_amount: 179, pay_amount: 179,
    status: 'PAID', pay_channel: 'WECHAT',
    fulfillment_stage: 'PENDING_FULFILLMENT',
    // ⚠️ 故意缺少 rx_check_result → 履约/发货应被阻断
    cold_chain: false,
    prescription_id: 'pr-test-no-audit',
    created_at: Date.now() / 1000 - 3600, updated_at: Date.now() / 1000 - 3600,
  },
];

// Banner
const MOCK_BANNERS: any[] = [
  { id: 'bnr-001', name: '血糖科普直播', position: '首页顶部', schedule: '07/28-08/03', status: 'ACTIVE', clicks: 12340, sort: 100, jump_url: '/live/glucose', created_at: 1722096000 },
  { id: 'bnr-002', name: 'APP下载引导', position: '首页第2帧', schedule: '07/28-08/03', status: 'ACTIVE', clicks: 8920, sort: 90, jump_url: '/download', created_at: 1722097000 },
  { id: 'bnr-003', name: '糖尿病饮食日', position: '社区页顶部', schedule: '08/01-08/07', status: 'SCHEDULED', clicks: 0, sort: 85, jump_url: '/community/diet', created_at: 1722010000 },
  { id: 'bnr-004', name: '旧版首页Banner', position: '首页第3帧', schedule: '已结束', status: 'OFFLINE', clicks: 45230, sort: 50, jump_url: '/old', created_at: 1721000000 },
  { id: 'bnr-005', name: '慢病管理服务推广', position: '服务页顶部', schedule: '07/28-08/10', status: 'ACTIVE', clicks: 5678, sort: 80, created_at: 1722098000 },
];

// 售后工单
const MOCK_AFTERSALES: any[] = [
  { id: 'as-001', aftersale_no: 'AS20260729001', order_no: 'SG202607290001', buyer_name: '张患者', merchant_name: 'XX大药房', type: 'REFUND', reason: '商品破损', status: 'APPLYING', amount: 328, created_at: 1722211200 },
  { id: 'as-002', aftersale_no: 'AS20260728001', order_no: 'SG202607210001', buyer_name: '赵患者', merchant_name: '赵药师药房', type: 'RETURN', reason: '买错了', status: 'WAIT_RETURN', amount: 218, created_at: 1722124800 },
  { id: 'as-003', aftersale_no: 'AS20260727001', order_no: 'SG202607150001', buyer_name: '王患者', merchant_name: '张医生诊所', type: 'EXCHANGE', reason: '规格不符', status: 'COMPLETED', amount: 580, created_at: 1722038400 },
];

// 结算
const MOCK_SETTLEMENTS: any[] = [
  { id: 'stl-001', settle_no: 'STL202607001', merchant_name: 'XX大药房', period: '2026-07-01~2026-07-31', order_count: 358, total_amount: 85600, fee_amount: 4280, settle_amount: 81320, status: 'PENDING', created_at: 1722211200 },
  { id: 'stl-002', settle_no: 'STL202606001', merchant_name: 'XX大药房', period: '2026-06-01~2026-06-30', order_count: 412, total_amount: 98500, fee_amount: 4925, settle_amount: 93575, status: 'SETTLED', settled_at: 1719705600, created_at: 1719622800 },
  { id: 'stl-003', settle_no: 'STL202607002', merchant_name: '赵药师药房', period: '2026-07-01~2026-07-31', order_count: 156, total_amount: 32800, fee_amount: 1640, settle_amount: 31160, status: 'PENDING', created_at: 1722211300 },
];

// 客户池 (SCRM)
const SEED_CUSTOMERS: any[] = [
  { id: 'cust-001', name: '张患者', phone: '13800000001', age: 45, gender: 'M', diabetes_type: '2型糖尿病', diagnosis_duration: '5年', tags: ['VIP', '高风险'], last_interaction: '2小时前', source: 'APP注册', created_at: 1690000000 },
  { id: 'cust-002', name: '李患者', phone: '13800000002', age: 52, gender: 'F', diabetes_type: '2型糖尿病', diagnosis_duration: '3年', tags: ['新用户', '需回访'], last_interaction: '1天前', source: '小程序', created_at: 1695000000 },
  { id: 'cust-003', name: '王患者', phone: '13800000003', age: 38, gender: 'M', diabetes_type: '1型糖尿病', diagnosis_duration: '10年', tags: ['VIP', 'CGM用户'], last_interaction: '30分钟前', source: '转介绍', created_at: 1680000000 },
  { id: 'cust-004', name: '刘患者', phone: '13800000004', age: 62, gender: 'F', diabetes_type: '2型糖尿病', diagnosis_duration: '12年', tags: ['低血糖风险', '高龄'], last_interaction: '3天前', source: '线下推广', created_at: 1670000000 },
  { id: 'cust-005', name: '陈患者', phone: '13800000005', age: 28, gender: 'M', diabetes_type: '糖耐量异常', diagnosis_duration: '6个月', tags: ['预防期', '运动活跃'], last_interaction: '5天前', source: 'APP注册', created_at: 1700000000 },
];

const CUSTOMERS_CACHE_KEY = 'sugarmate_customers';

function loadCustomers(): any[] {
  try {
    const cached = localStorage.getItem(CUSTOMERS_CACHE_KEY);
    if (cached) {
      const persisted = JSON.parse(cached) as any[];
      // 合并：已持久化的在前，种子数据去重补充（按手机号去重）
      const phones = new Set(persisted.map((c: any) => c.phone));
      const merged = [...persisted];
      for (const seed of SEED_CUSTOMERS) {
        if (!phones.has(seed.phone)) merged.push(seed);
      }
      return merged;
    }
  } catch {}
  return [...SEED_CUSTOMERS];
}

function saveCustomers(customers: any[]) {
  try {
    localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(customers));
  } catch {}
}

const MOCK_CUSTOMERS: any[] = loadCustomers();

// 商品分类
const MOCK_CATEGORIES: ProductCategoryData[] = [
  { id: 'cat-001', name: '血糖监测', icon: '📊', sort_order: 1, product_count: 2 },
  { id: 'cat-002', name: '胰岛素注射', icon: '💉', sort_order: 2, product_count: 1 },
  { id: 'cat-003', name: 'OTC药品', icon: '💊', sort_order: 3, product_count: 2 },
  { id: 'cat-004', name: '健康食品', icon: '🍬', sort_order: 4, product_count: 0 },
  { id: 'cat-005', name: '医疗辅具', icon: '🩹', sort_order: 5, product_count: 0 },
  { id: 'cat-006', name: '服务', icon: '🎯', sort_order: 6, product_count: 0 },
];

// 商品（统一商品中心——所有商城、直播间共用） V2.0.0 增强
const MOCK_PRODUCTS: ProductData[] = [
  {
    id: 'p-001', name: '雅培瞬感血糖仪', category_id: 'cat-001', category_name: '血糖监测',
    images: [], description: '雅培 FreeStyle Libre 动态血糖监测系统，14天连续监测，无需指尖采血校准，IP67防水，手机App实时查看。',
    specifications: [
      { id: 'spec-001', name: '套装', value: '传感器+扫描仪套装', price_override: undefined, stock: 200 },
      { id: 'spec-002', name: '套装', value: '传感器单只装', price_override: 350, stock: 500 },
    ],
    price: 328, market_price: 450, stock: 700,
    product_type: 'DEVICE' as ProductType, is_otc: false,
    otc_license_no: '国械注进20223071111',
    merchant_id: 'm-001', merchant_name: 'XX大药房', status: 'ON_SHELF', sales_count: 12340,
    rating: 4.8,
    created_at: 1690000000, updated_at: Date.now() / 1000,
  },
  {
    id: 'p-002', name: '血糖试纸50片装', category_id: 'cat-001', category_name: '血糖监测',
    images: [], description: '三诺 GA-3 型血糖仪专用试纸，7秒快速测量，微量采血，适用于三诺全系列血糖仪。',
    specifications: [
      { id: 'spec-003', name: '规格', value: '50片×2盒(100片)', price_override: undefined, stock: 1000 },
      { id: 'spec-004', name: '规格', value: '50片×1盒(50片)', price_override: 69, stock: 800 },
    ],
    price: 128, market_price: 168, stock: 1800,
    product_type: 'DEVICE' as ProductType, is_otc: true,
    merchant_id: 'm-001', merchant_name: 'XX大药房', status: 'ON_SHELF', sales_count: 45000,
    rating: 4.5,
    created_at: 1690000000, updated_at: Date.now() / 1000,
  },
  {
    id: 'p-003', name: '胰岛素笔注射器（需冷链）', category_id: 'cat-002', category_name: '胰岛素注射',
    images: [], description: 'Novo Nordisk 诺和锐 FlexPen 胰岛素注射笔，预填充式，剂量精准0.5单位步进。**本商品为处方药，需冷链配送**。',
    specifications: [
      { id: 'spec-005', name: '规格', value: '3ml预填充×5支', price_override: undefined, stock: 150 },
      { id: 'spec-006', name: '规格', value: '笔身(不含药剂)', price_override: 198, stock: 300 },
    ],
    price: 218, market_price: 298, stock: 450,
    product_type: 'RX' as ProductType, is_otc: false,
    cold_chain_config: {
      required: true,
      type: 'COLD',
      storage_spec: '2~8°C避光保存',
      transport_duration_max: 2880,
      package_type: 'INSULATED_BOX',
      break_action: 'DESTROY_ON_BREAK',
      max_resend_count: 2,
    },
    merchant_id: 'm-002', merchant_name: '赵药师药房', status: 'ON_SHELF', sales_count: 8560,
    rating: 4.9,
    created_at: 1695000000, updated_at: Date.now() / 1000,
  },
  {
    id: 'p-004', name: '二甲双胍缓释片', category_id: 'cat-003', category_name: 'OTC药品',
    images: [], description: '盐酸二甲双胍缓释片 0.5g×60片，用于2型糖尿病，每日1-2次，餐后服用。',
    specifications: [],
    price: 35, market_price: 48, stock: 5000,
    product_type: 'OTC' as ProductType, is_otc: true,
    merchant_id: 'm-001', merchant_name: 'XX大药房', status: 'ON_SHELF', sales_count: 12000,
    rating: 4.7,
    created_at: 1700000000, updated_at: Date.now() / 1000,
  },
  {
    id: 'p-005', name: '格列美脲片', category_id: 'cat-003', category_name: 'OTC药品',
    images: [], description: '格列美脲片 2mg×30片，适用于饮食控制不佳的2型糖尿病患者。',
    specifications: [],
    price: 28, market_price: 38, stock: 3000,
    product_type: 'OTC' as ProductType, is_otc: true,
    merchant_id: 'm-003', merchant_name: '张医生诊所', status: 'ON_SHELF', sales_count: 8500,
    rating: 4.6,
    created_at: 1700000000, updated_at: Date.now() / 1000,
  },
  {
    id: 'p-006', name: '糖控代餐粉', category_id: 'cat-004', category_name: '健康食品',
    images: [], description: '低GI配方代餐粉，含膳食纤维<10g/餐，蛋白质≥20g/餐，适合糖尿病人体重管理。',
    specifications: [
      { id: 'spec-007', name: '规格', value: '500g罐装', price_override: 89, stock: 2000 },
    ],
    price: 89, market_price: 128, stock: 2000,
    product_type: 'FOOD' as ProductType, is_otc: false,
    merchant_id: 'm-001', merchant_name: 'XX大药房', status: 'ON_SHELF', sales_count: 3200,
    rating: 4.3,
    created_at: 1705000000, updated_at: Date.now() / 1000,
  },
  {
    id: 'p-007', name: '糖尿病专用鞋垫', category_id: 'cat-005', category_name: '医疗辅具',
    images: [], description: '糖尿病足保护鞋垫，抗菌透气，减压分配，预防糖尿病足溃疡。',
    specifications: [
      { id: 'spec-008', name: '尺码', value: '38-45码可选', price_override: undefined, stock: 500 },
    ],
    price: 68, market_price: 98, stock: 500,
    product_type: 'DAILY' as ProductType, is_otc: false,
    merchant_id: 'm-001', merchant_name: 'XX大药房', status: 'ON_SHELF', sales_count: 1800,
    rating: 4.4,
    created_at: 1710000000, updated_at: Date.now() / 1000,
  },
  {
    id: 'p-008', name: '营养师1对1咨询（按次）', category_id: 'cat-006', category_name: '服务',
    images: [], description: '注册营养师1对1在线咨询，每次45分钟，含个性化饮食方案制定。',
    specifications: [],
    price: 299, market_price: 399, stock: 9999,
    product_type: 'SERVICE' as ProductType, is_otc: false,
    merchant_id: 'm-005', merchant_name: '王营养师工作室', status: 'ON_SHELF', sales_count: 560,
    rating: 4.8,
    created_at: 1715000000, updated_at: Date.now() / 1000,
  },

  // ---- V2.2.0 待审核商品（药店新发布的需经过商品审核）----
  {
    id: 'prod-pending-001', name: '格列齐特缓释片',
    images: [], description: '磺脲类降糖药，需医生处方使用。每盒30片，30mg规格。',
    specifications: [{ name: '规格', value: '30mg×30片' }],
    price: 42.5, market_price: 58, stock: 500,
    product_type: 'RX' as ProductType, is_otc: false,
    merchant_id: 'm-001', merchant_name: 'XX大药房', status: 'PENDING_REVIEW',
    sales_count: 0, rating: 0,
    category_name: '降糖药', otc_license_no: '国药准字H20241001',
    cold_chain_config: { required: false },
    created_at: Date.now() / 1000 - 86400, updated_at: Date.now() / 1000 - 86400,
  },
  {
    id: 'prod-pending-002', name: '罗格列酮片',
    images: [], description: '噻唑烷二酮类胰岛素增敏剂，用于2型糖尿病。',
    specifications: [{ name: '规格', value: '4mg×14片' }],
    price: 78, market_price: 95, stock: 300,
    product_type: 'RX' as ProductType, is_otc: false,
    merchant_id: 'm-002', merchant_name: 'YY大药房', status: 'PENDING_REVIEW',
    sales_count: 0, rating: 0,
    category_name: '降糖药', otc_license_no: '国药准字H20241202',
    cold_chain_config: { required: false },
    created_at: Date.now() / 1000 - 72000, updated_at: Date.now() / 1000 - 72000,
  },
  {
    id: 'prod-pending-003', name: '鱼跃血糖试纸',
    images: [], description: '血糖试纸套装，含50条试纸+50根针，适用于鱼跃系列血糖仪。',
    specifications: [{ name: '规格', value: '50条/盒' }],
    price: 89, market_price: 110, stock: 800,
    product_type: 'OTC' as ProductType, is_otc: true,
    merchant_id: 'm-003', merchant_name: 'ZZ大药房', status: 'PENDING_REVIEW',
    sales_count: 0, rating: 0,
    category_name: '血糖监测', otc_license_no: '国械注准2025203001',
    cold_chain_config: { required: false },
    created_at: Date.now() / 1000 - 43200, updated_at: Date.now() / 1000 - 43200,
  },
  {
    id: 'prod-pending-004', name: '欧姆龙电子血压计',
    images: [], description: '上臂式全自动血压计，可记忆60组数据，适合家庭使用。',
    specifications: [{ name: '型号', value: 'HEM-7124' }],
    price: 299, market_price: 399, stock: 200,
    product_type: 'DEVICE' as ProductType, is_otc: true,
    merchant_id: 'm-004', merchant_name: 'AA医疗器械', status: 'PENDING_REVIEW',
    sales_count: 0, rating: 0,
    category_name: '家用监测', otc_license_no: '国械注进2025201006',
    cold_chain_config: { required: false },
    created_at: Date.now() / 1000 - 28800, updated_at: Date.now() / 1000 - 28800,
  },
  {
    id: 'prod-pending-005', name: '善存多维元素片',
    images: [], description: '30种维矿补充剂，每天1片，满足成人每日营养需求。',
    specifications: [{ name: '规格', value: '100片/瓶' }],
    price: 128, market_price: 168, stock: 1000,
    product_type: 'FOOD' as ProductType, is_otc: false,
    merchant_id: 'm-005', merchant_name: '王营养师工作室', status: 'PENDING_REVIEW',
    sales_count: 0, rating: 0,
    category_name: '膳食补充', otc_license_no: '',
    cold_chain_config: { required: false },
    created_at: Date.now() / 1000 - 14400, updated_at: Date.now() / 1000 - 14400,
  },
];

// 客服工单
const MOCK_TICKETS: any[] = [
  { id: 'tkt-001', ticket_no: 'TK20260729001', user_name: '张患者', category: '订单问题', title: '订单未收到', priority: 'HIGH', status: 'OPEN', assignee: '客服-小王', created_at: 1722211200 },
  { id: 'tkt-002', ticket_no: 'TK20260728001', user_name: '李患者', category: '退款咨询', title: '退款何时到账', priority: 'MEDIUM', status: 'IN_PROGRESS', assignee: '客服-小李', created_at: 1722124800 },
  { id: 'tkt-003', ticket_no: 'TK20260727001', user_name: '陈患者', category: '功能咨询', title: '如何绑定血糖仪', priority: 'LOW', status: 'RESOLVED', assignee: '客服-小王', created_at: 1722038400 },
];

// 活动
const MOCK_ACTIVITIES: any[] = [
  { id: 'act-001', name: '糖尿病关怀日·义诊活动', type: 'CAMPAIGN', start_time: '2026-08-01', end_time: '2026-08-07', status: 'UPCOMING', created_at: 1722096000 },
  { id: 'act-002', name: '血糖仪以旧换新', type: 'PROMOTION', start_time: '2026-07-20', end_time: '2026-08-20', status: 'ACTIVE', created_at: 1721396000 },
  { id: 'act-003', name: '7月新人专享优惠', type: 'PROMOTION', start_time: '2026-07-01', end_time: '2026-07-31', status: 'ENDED', created_at: 1719705600 },
];

function simDelay(ms = 300): Promise<void> {
  return new Promise(r => setTimeout(r, ms + Math.random() * 200));
}

/** V2.0.0 辅助：根据订单类型生成模拟订单项 */
function getOrderItemsForType(order: any) {
  switch (order.product_types?.[0]) {
    case 'OTC':
      return [
        { product_id: 'p-004', product_name: '二甲双胍缓释片', product_type: 'OTC', quantity: 2, unit_price: 35, subtotal: 70, item_status: order.status === 'PAID' ? 'AWAITING_SHIP' : 'DELIVERED' },
        { product_id: 'p-005', product_name: '格列美脲片', product_type: 'OTC', quantity: 1, unit_price: 28, subtotal: 28, item_status: order.status === 'PAID' ? 'AWAITING_SHIP' : 'DELIVERED' },
      ];
    case 'RX':
      return [
        { product_id: 'p-003', product_name: '胰岛素笔注射器', product_type: 'RX', quantity: 1, unit_price: 218, subtotal: 218, prescription_ref: 'RX202607001', item_status: order.status === 'RX_CHECKING' ? 'RX_CHECKING' : order.status === 'SHIPPED' ? 'SHIPPED' : 'AWAITING_SHIP' },
      ];
    case 'DEVICE':
      return [
        { product_id: 'p-001', product_name: '雅培瞬感血糖仪', product_type: 'DEVICE', quantity: 1, unit_price: 328, subtotal: 328, item_status: 'SHIPPED' },
      ];
    case 'SUPPLEMENT':
      return [
        { product_id: 'p-006', product_name: '糖控代餐粉', product_type: 'FOOD', quantity: 2, unit_price: 89, subtotal: 178, item_status: 'DELIVERED' },
      ];
    case 'SERVICE':
      return [
        { product_id: 'p-008', product_name: '营养师1对1咨询', product_type: 'SERVICE', quantity: 1, unit_price: 299, subtotal: 299, item_status: 'PENDING', service_type: 'PER_SESSION' as const },
      ];
    default:
      return [
        { product_id: 'p-004', product_name: '二甲双胍缓释片', product_type: 'OTC', quantity: 1, unit_price: 35, subtotal: 35, item_status: 'AWAITING_SHIP' },
      ];
  }
}

/** V2.0.0 辅助：根据订单状态生成时间线 */
function getOrderTimeline(order: any) {
  const baseTime = order.created_at;
  const day = 86400;
  const baseTL = [
    { time: baseTime, event: '订单已创建', operator: order.buyer_name, status: 'PENDING_PAY' },
    { time: baseTime + 300, event: '支付成功', operator: '微信支付', status: 'PAID' },
  ];

  if (order.has_rx_item) {
    baseTL.push(
      { time: baseTime + 600, event: '进入处方校验', operator: '系统', status: 'RX_CHECKING' },
      { time: baseTime + 3600, event: order.rx_check_result?.passed ? '处方校验通过' : '等待药剂师审核处方', operator: order.rx_check_result?.pharmacist_id || '系统', status: order.rx_check_result?.passed ? 'AWAITING_SHIP' : 'RX_CHECKING' },
    );
  }

  if (order.cold_chain_resend_count !== undefined) {
    baseTL.push(
      { time: baseTime + day, event: '已发货·冷链配送', operator: order.merchant_name, status: 'SHIPPED' },
      { time: baseTime + day + 7200, event: '温控正常·3.2°C/2-8°C', operator: '冷链监控系统', status: 'SHIPPED' },
    );
  }

  if (order.status === 'SHIPPED' && !order.cold_chain_resend_count) {
    baseTL.push({ time: baseTime + day, event: '已发货', operator: order.merchant_name, status: 'SHIPPED' });
  }

  if (order.status === 'COMPLETED') {
    baseTL.push(
      { time: baseTime + 2 * day, event: '已签收', operator: order.buyer_name, status: 'DELIVERED' },
      { time: baseTime + 10 * day, event: '交易完成', operator: '系统', status: 'COMPLETED' },
    );
  }

  if (order.status === 'PROCESSING' && order.has_rx_item) {
    baseTL.push({ time: baseTime + 600, event: '混合订单待拆单·处方药+OTC', operator: '系统', status: 'PROCESSING' });
  }

  return baseTL;
}

// ============================================================
// AUTH 适配器
// ============================================================
class SimAuthAdapter implements IAuthAdapter {
  private key = 'sugarmate_sim_token';
  getToken(): string | null { return localStorage.getItem(this.key); }
  setToken(token: string): void { localStorage.setItem(this.key, token); }
  clearToken(): void { localStorage.removeItem(this.key); }
  isAuthenticated(): boolean { return !!this.getToken(); }
  async refreshToken(): Promise<string> {
    const t = `sim_refresh_${Date.now()}`; this.setToken(t); return t;
  }
}

// ============================================================
// SIM 路由表（PC后台纯后台管理路由）
// ============================================================
interface SimRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  pattern: string | RegExp;
  handler: (path: string, body?: any) => Promise<any>;
}

const routes: SimRoute[] = [
  // ---- Auth ----
  { method: 'POST', pattern: '/auth/login', handler: async (_, body) => {
    await simDelay(800);
    const acc = Object.values(MOCK_ACCOUNTS).find((a: any) => a.phone === body?.phone);
    const account = acc || MOCK_ACCOUNTS['acc-admin'];
    return {
      access_token: `sim_token_${account.id}_${Date.now()}`,
      refresh_token: `sim_refresh_${account.id}`,
      expires_in: 7200,
      temp_identities: MOCK_IDENTITIES.filter((i: any) => i.account_id === account.id).map((i: any) => ({
        identity_id: i.id, role: i.role, real_name: i.real_name, status: i.status,
      })),
    };
  }},
  { method: 'GET', pattern: '/auth/account', handler: async () => ({ ...MOCK_ACCOUNTS['acc-admin'] }) },
  { method: 'GET', pattern: '/auth/identities', handler: async () => [...MOCK_IDENTITIES] },
  { method: 'POST', pattern: '/auth/activate', handler: async (_, body) => {
    await simDelay(500);
    const identity = MOCK_IDENTITIES.find((i: any) => i.id === body?.identity_id);
    if (!identity) throw new Error('IDENTITY_NOT_FOUND');
    return {
      identity_role: identity.role,
      view_menu: ['工作台','入驻管理','SCRM','商品管理','订单管理','财务管理','运营管理','数据分析','系统设置'],
      permissions: ['*'],
      safe_session_token: `safe_${Date.now()}`,
    };
  }},

  // ---- 入驻审核管理 ----
  { method: 'GET', pattern: '/applications', handler: async () => ({ list: [...MOCK_APPLICATIONS], total: MOCK_APPLICATIONS.length }) },
  { method: 'GET', pattern: /^\/applications\/(app-\d+)$/, handler: async (path) => {
    const id = path.split('/').pop();
    return MOCK_APPLICATIONS.find((a: any) => a.id === id) || null;
  }},
  { method: 'POST', pattern: /^\/applications\/(app-\d+)\/approve$/, handler: async (path) => {
    const id = path.split('/')[1];
    const app = MOCK_APPLICATIONS.find((a: any) => a.id === id);
    if (app) { app.status = 'APPROVED'; app.approved_at = Date.now() / 1000; }
    return app;
  }},
  { method: 'POST', pattern: /^\/applications\/(app-\d+)\/reject$/, handler: async (path, body) => {
    const id = path.split('/')[1];
    const app = MOCK_APPLICATIONS.find((a: any) => a.id === id);
    if (app) { app.status = 'REJECTED'; app.reject_reason = body?.reason || ''; app.reviewed_at = Date.now() / 1000; }
    return app;
  }},

  // ---- 药房/商家管理 ----
  { method: 'GET', pattern: '/merchants', handler: async () => ({ list: [...MOCK_MERCHANTS], total: MOCK_MERCHANTS.length }) },
  { method: 'GET', pattern: /^\/merchants\/(m-\d+)$/, handler: async (path) => {
    const id = path.split('/').pop();
    return MOCK_MERCHANTS.find((m: any) => m.id === id) || null;
  }},

  // ---- 订单管理 ----
  { method: 'GET', pattern: '/orders', handler: async () => ({ list: [...MOCK_ORDERS], total: MOCK_ORDERS.length }) },
  { method: 'GET', pattern: /^\/orders\/(ord-\d+)$/, handler: async (path) => {
    const id = path.split('/').pop();
    const order = MOCK_ORDERS.find((o: any) => o.id === id);
    if (!order) throw new Error('ORDER_NOT_FOUND');
    // V2.0.0：根据订单类型返回不同详情
    const baseDetail: any = {
      ...order,
      items: getOrderItemsForType(order),
      address: { province: '浙江省', city: '杭州市', district: '西湖区', detail: '文三路138号', contact_name: order.buyer_name, contact_phone: order.buyer_phone },
      logistics: order.logistics || null,
      timeline: getOrderTimeline(order),
    };
    return baseDetail;
  }},
  { method: 'POST', pattern: '/orders', handler: async (_, body) => {
    const orderNo = `SG${Date.now().toString(36).toUpperCase()}`;
    const newOrder = {
      id: orderNo, order_no: orderNo,
      status: 'PENDING_PAYMENT', pay_amount: (body as any).pay_amount || 0,
      buyer_name: (body as any).buyer_name || '新用户',
      buyer_phone: (body as any).buyer_phone || '',
      merchant_name: (body as any).merchant_name || '',
      items: (body as any).items || [],
      created_at: Date.now() / 1000, updated_at: Date.now() / 1000,
      ...(body as any),
    };
    MOCK_ORDERS.push(newOrder);
    return newOrder;
  }},
  { method: 'POST', pattern: '/orders/refund', handler: async (_, body) => ({
    refund_id: `RF${Date.now().toString(36).toUpperCase()}`,
    status: 'PROCESSING', ...(body as any) || {}, created_at: Date.now() / 1000,
  })},
  // V2.2.1 药店履约
  { method: 'POST', pattern: '/orders/fulfill', handler: async (_, body) => {
    const order = MOCK_ORDERS.find((o: any) => o.id === body?.order_id);
    if (!order) throw new Error('订单不存在');
    // RX 审方守卫：含处方药的订单必须先经过药师审方通过
    if (order.has_rx_item && (!order.rx_check_result || !order.rx_check_result.passed)) {
      throw new Error('该订单含处方药，需药师审方通过后方可履约');
    }
    // 待履约 → 履约中 → 已履约
    if (order.fulfillment_stage === 'PENDING_FULFILLMENT') {
      order.fulfillment_stage = 'FULFILLING';
      order.status = 'PROCESSING';
    } else if (order.fulfillment_stage === 'FULFILLING') {
      order.fulfillment_stage = 'FULFILLED';
      order.status = 'AWAITING_SHIP';
    }
    order.updated_at = Date.now() / 1000;
    return order;
  }},
  { method: 'POST', pattern: '/orders/ship', handler: async (_, body) => {
    const order = MOCK_ORDERS.find((o: any) => o.id === body?.order_id);
    if (!order) throw new Error('订单不存在');
    // RX 审方守卫：含处方药的订单必须先经过药师审方通过
    if (order.has_rx_item && (!order.rx_check_result || !order.rx_check_result.passed)) {
      throw new Error('该订单含处方药，需药师审方通过后方可发货');
    }
    order.fulfillment_stage = 'SHIPPED';
    order.status = 'SHIPPED';
    order.logistics = { company: '顺丰速运', tracking_no: `SF${Date.now().toString(36).toUpperCase()}` };
    order.updated_at = Date.now() / 1000;
    return order;
  }},

  // ---- 运营管理·Banner ----
  { method: 'GET', pattern: '/banners', handler: async () => ({ list: [...MOCK_BANNERS], total: MOCK_BANNERS.length }) },
  { method: 'POST', pattern: '/banners', handler: async (_, body) => {
    const b = { id: `bnr-${Date.now()}`, clicks: 0, ...body, created_at: Date.now() / 1000 };
    MOCK_BANNERS.push(b); return b;
  }},
  { method: 'PUT', pattern: '/banners', handler: async (_, body) => {
    const idx = MOCK_BANNERS.findIndex((b: any) => b.id === body?.id);
    if (idx >= 0) Object.assign(MOCK_BANNERS[idx], body);
    return MOCK_BANNERS[idx];
  }},
  { method: 'POST', pattern: /^\/banners\/(bnr-\d+)\/(offline|online)$/, handler: async (path) => {
    const [,, id, action] = path.split('/');
    const bn = MOCK_BANNERS.find((b: any) => b.id === id);
    if (bn) bn.status = action === 'offline' ? 'OFFLINE' : 'ACTIVE';
    return bn;
  }},

  // ---- 售后工单 ----
  { method: 'GET', pattern: '/aftersales', handler: async () => ({ list: [...MOCK_AFTERSALES], total: MOCK_AFTERSALES.length }) },
  { method: 'GET', pattern: /^\/aftersales\/(as-\d+)$/, handler: async (path) => {
    return MOCK_AFTERSALES.find((a: any) => a.id === path.split('/').pop()) || null;
  }},

  // ---- 财务·结算 ----
  { method: 'GET', pattern: '/settlements', handler: async () => ({ list: [...MOCK_SETTLEMENTS], total: MOCK_SETTLEMENTS.length }) },
  { method: 'GET', pattern: /^\/settlements\/(stl-\d+)$/, handler: async (path) => {
    return MOCK_SETTLEMENTS.find((s: any) => s.id === path.split('/').pop()) || null;
  }},

  // ---- SCRM·客户池 ----
  { method: 'GET', pattern: '/customers', handler: async () => ({ list: [...MOCK_CUSTOMERS], total: MOCK_CUSTOMERS.length }) },
  { method: 'GET', pattern: /^\/customers\/(cust-\d+)$/, handler: async (path) => {
    return MOCK_CUSTOMERS.find((c: any) => c.id === path.split('/').pop()) || null;
  }},

  // ---- 商品管理（统一商品中心） ----
  { method: 'GET', pattern: '/products/list', handler: async (_path, _body, query?: Record<string, string>) => {
    let list = [...MOCK_PRODUCTS];
    if (query?.status && query.status !== 'ALL') list = list.filter((p: any) => p.status === query.status);
    if (query?.keyword) {
      const kw = query.keyword.toLowerCase();
      list = list.filter((p: any) => p.name.toLowerCase().includes(kw) || p.category_name.toLowerCase().includes(kw));
    }
    const page = parseInt(query?.page || '1'), pageSize = parseInt(query?.page_size || '10');
    const total = list.length;
    const start = (page - 1) * pageSize;
    return { list: list.slice(start, start + pageSize), total };
  }},
  { method: 'POST', pattern: '/products/list', handler: async (_path, body) => {
    // POST 方式也支持（某些 client 习惯）
    let list = [...MOCK_PRODUCTS];
    if (body?.status && body.status !== 'ALL') list = list.filter((p: any) => p.status === body.status);
    if (body?.keyword) {
      const kw = body.keyword.toLowerCase();
      list = list.filter((p: any) => p.name.toLowerCase().includes(kw) || p.category_name.toLowerCase().includes(kw));
    }
    const page = body?.page || 1, pageSize = body?.page_size || 10;
    const total = list.length;
    const start = (page - 1) * pageSize;
    return { list: list.slice(start, start + pageSize), total };
  }},
  { method: 'GET', pattern: '/products/categories', handler: async () => ({ list: [...MOCK_CATEGORIES], total: MOCK_CATEGORIES.length }) },
  // 匹配 /products/p-xxx 但非 /products/list /products/categories
  { method: 'GET', pattern: /^\/products\/(p-\d+)$/, handler: async (path) => {
    const id = path.split('/').pop();
    const product = MOCK_PRODUCTS.find((p: any) => p.id === id);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    return product;
  }},
  // 创建商品
  { method: 'POST', pattern: '/products', handler: async (_path, body) => {
    const newProduct: ProductData = {
      id: `p-${Date.now()}`,
      ...body,
      sales_count: 0,
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
      specifications: body?.specifications || [],
      images: body?.images || [],
    };
    MOCK_PRODUCTS.unshift(newProduct);
    // 更新分类 product_count
    const cat = MOCK_CATEGORIES.find(c => c.id === newProduct.category_id);
    if (cat) cat.product_count += 1;
    return newProduct;
  }},
  // 更新商品
  { method: 'PUT', pattern: /^\/products\/(p-\d+)$/, handler: async (path, body) => {
    const id = path.split('/').pop();
    const idx = MOCK_PRODUCTS.findIndex((p: any) => p.id === id);
    if (idx === -1) throw new Error('PRODUCT_NOT_FOUND');
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...body, updated_at: Date.now() / 1000 };
    return MOCK_PRODUCTS[idx];
  }},
  // 切换上下架
  { method: 'PUT', pattern: /^\/products\/(p-\d+)\/status$/, handler: async (path, body) => {
    const id = path.split('/')[1];
    const idx = MOCK_PRODUCTS.findIndex((p: any) => p.id === id);
    if (idx === -1) throw new Error('PRODUCT_NOT_FOUND');
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], status: body?.status, updated_at: Date.now() / 1000 };
    return MOCK_PRODUCTS[idx];
  }},

  // ---- 客服工单 ----
  { method: 'GET', pattern: '/tickets', handler: async () => ({ list: [...MOCK_TICKETS], total: MOCK_TICKETS.length }) },

  // ---- 活动管理 ----
  { method: 'GET', pattern: '/activities', handler: async () => ({ list: [...MOCK_ACTIVITIES], total: MOCK_ACTIVITIES.length }) },

  // ---- Dashboard ----
  { method: 'GET', pattern: '/dashboard/stats', handler: async () => ({
    today_applications: MOCK_APPLICATIONS.filter((a: any) => a.status === 'PENDING').length,
    total_orders: MOCK_ORDERS.length,
    total_revenue: MOCK_ORDERS.reduce((s: number, o: any) => s + o.pay_amount, 0),
    active_merchants: MOCK_MERCHANTS.filter((m: any) => m.status === 'ACTIVE').length,
    pending_tickets: MOCK_TICKETS.filter((t: any) => t.status === 'OPEN').length,
    application_trend: [
      { date: '07-23', count: 3 }, { date: '07-24', count: 5 }, { date: '07-25', count: 8 },
      { date: '07-26', count: 4 }, { date: '07-27', count: 6 }, { date: '07-28', count: 7 }, { date: '07-29', count: 5 },
    ],
    revenue_trend: [
      { date: '07-23', amount: 1200 }, { date: '07-24', amount: 980 }, { date: '07-25', amount: 2340 },
      { date: '07-26', amount: 1560 }, { date: '07-27', amount: 3100 }, { date: '07-28', amount: 2780 }, { date: '07-29', amount: 1850 },
    ],
  })},

  // ---- 财务·对账明细 ----
  { method: 'GET', pattern: /^\/settlements\/(stl-\d+)\/reconciliation$/, handler: async (path) => {
    const settlementId = path.split('/')[1];
    return {
      list: [
        { id: 'rec-001', settle_id: settlementId, order_no: 'SG202607290001', order_amount: 256, fee_rate: 0.05, fee_amount: 12.8, settle_amount: 243.2, status: 'PENDING', created_at: 1722211200 },
        { id: 'rec-002', settle_id: settlementId, order_no: 'SG202607280001', order_amount: 328, fee_rate: 0.05, fee_amount: 16.4, settle_amount: 311.6, status: 'PENDING', created_at: 1722124800 },
        { id: 'rec-003', settle_id: settlementId, order_no: 'SG202607270001', order_amount: 580, fee_rate: 0.05, fee_amount: 29.0, settle_amount: 551.0, status: 'SETTLED', created_at: 1722038400 },
      ],
      total: 3,
    };
  }},

  // ---- 财务·分账记录 ----
  { method: 'GET', pattern: /^\/settlements\/(stl-\d+)\/splits$/, handler: async (path) => {
    const settlementId = path.split('/')[1];
    return {
      list: [
        { id: 'spl-001', settle_id: settlementId, payee_type: 'PLATFORM', payee_name: 'SugarMate平台', ratio: 0.05, amount: 4280, status: 'PENDING' },
        { id: 'spl-002', settle_id: settlementId, payee_type: 'MERCHANT', payee_name: 'XX大药房', ratio: 0.95, amount: 81320, status: 'PENDING' },
      ],
      total: 2,
    };
  }},

  // ---- SCRM·标签 ----
  { method: 'GET', pattern: '/scrm/tags', handler: async () => [
    { id: 'tag-001', name: 'VIP', color: '#FFD700', customer_count: 2 },
    { id: 'tag-002', name: '高风险', color: '#FF4444', customer_count: 1 },
    { id: 'tag-003', name: '新用户', color: '#4CAF50', customer_count: 1 },
    { id: 'tag-004', name: '需回访', color: '#FF9800', customer_count: 1 },
    { id: 'tag-005', name: 'CGM用户', color: '#2196F3', customer_count: 1 },
    { id: 'tag-006', name: '低血糖风险', color: '#9C27B0', customer_count: 1 },
    { id: 'tag-007', name: '高龄', color: '#607D8B', customer_count: 1 },
    { id: 'tag-008', name: '预防期', color: '#8BC34A', customer_count: 1 },
    { id: 'tag-009', name: '运动活跃', color: '#00BCD4', customer_count: 1 },
  ]},
  { method: 'POST', pattern: '/scrm/tags', handler: async (_, body) => {
    const tag = { id: `tag-${Date.now()}`, customer_count: 0, ...body };
    return tag;
  }},
  { method: 'DELETE', pattern: /^\/scrm\/tags\/(tag-\d+)$/, handler: async () => ({ success: true })},

  // ---- SCRM·SOP模板 ----
  { method: 'GET', pattern: '/scrm/sop', handler: async () => [
    { id: 'sop-001', name: '新用户首日欢迎', target_tag: '新用户', steps: 3, active: true, created_at: 1722000000 },
    { id: 'sop-002', name: '高风险患者回访', target_tag: '高风险', steps: 5, active: true, created_at: 1721900000 },
    { id: 'sop-003', name: 'CGM用户定期关怀', target_tag: 'CGM用户', steps: 4, active: true, created_at: 1721800000 },
  ]},

  // ---- SCRM·会话记录 ----
  { method: 'GET', pattern: '/scrm/conversations', handler: async () => ({
    list: [
      { id: 'conv-001', customer_name: '张患者', staff_name: '客服-小王', channel: 'WECHAT', last_message: '我的血糖仪读数不太稳定...', unread: 2, updated_at: Date.now() / 1000 - 7200, status: 'ACTIVE' },
      { id: 'conv-002', customer_name: '李患者', staff_name: '客服-小李', channel: 'WECHAT', last_message: '好的，谢谢医生', unread: 0, updated_at: Date.now() / 1000 - 86400, status: 'ACTIVE' },
      { id: 'conv-003', customer_name: '王患者', staff_name: '客服-小王', channel: 'APP_CHAT', last_message: '我的订单怎么还没发货？', unread: 1, updated_at: Date.now() / 1000 - 1800, status: 'ACTIVE' },
      { id: 'conv-004', customer_name: '刘患者', staff_name: '客服-小李', channel: 'PHONE', last_message: '[通话记录·5分23秒]', unread: 0, updated_at: Date.now() / 1000 - 172800, status: 'CLOSED' },
    ],
    total: 4,
  })},

  // ---- 运营·客诉 ----
  { method: 'GET', pattern: '/complaints', handler: async () => ({
    list: [
      { id: 'comp-001', complaint_no: 'CP20260729001', complainant: '陈患者', target_type: 'PRODUCT', target_name: '二甲双胍缓释片', reason: '药品质量', severity: 'HIGH', status: 'PENDING', created_at: 1722211200 },
      { id: 'comp-002', complaint_no: 'CP20260728001', complainant: '周患者', target_type: 'MERCHANT', target_name: 'XX大药房', reason: '配送超时', severity: 'MEDIUM', status: 'IN_PROGRESS', created_at: 1722124800 },
      { id: 'comp-003', complaint_no: 'CP20260725001', complainant: '赵患者', target_type: 'ORDER', target_name: 'SG202607270001', reason: '商品破损', severity: 'LOW', status: 'RESOLVED', created_at: 1721865600 },
    ],
    total: 3,
  })},

  // ---- 运营·创建活动 ----
  { method: 'POST', pattern: '/activities', handler: async (_, body) => {
    const act = { id: `act-${Date.now()}`, ...body, created_at: Date.now() / 1000 };
    MOCK_ACTIVITIES.push(act);
    return act;
  }},
];

// ============================================================
// DATA 适配器
// ============================================================
class SimDataAdapter implements IDataAdapter {
  async login(phone: string, _code: string, _platform: string, _deviceId: string) {
    return this.post('/auth/login', { phone });
  }
  async getAccount(accountId: string) {
    await simDelay();
    const acc = MOCK_ACCOUNTS[accountId];
    if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
    return { ...acc };
  }
  async getIdentities(accountId: string) {
    await simDelay();
    return MOCK_IDENTITIES.filter((i: any) => i.account_id === accountId);
  }
  async activateIdentity(identityId: string) {
    return this.post('/auth/activate', { identity_id: identityId });
  }

  // 订单（保留旧接口兼容）
  async getOrderList(params: { status?: string; page: number; page_size: number }) {
    await simDelay();
    let list = [...MOCK_ORDERS];
    if (params.status) list = list.filter((o: any) => o.status === params.status);
    const total = list.length;
    const start = (params.page - 1) * params.page_size;
    return { list: list.slice(start, start + params.page_size), total };
  }
  async getOrderDetail(orderId: string) {
    return this.get(`/orders/${orderId}`);
  }

  // === 商品管理（统一商品中心） ===
  async getProductList(params: { page: number; page_size: number; status?: string; keyword?: string }) {
    await simDelay();
    let list = [...MOCK_PRODUCTS];
    if (params.status && params.status !== 'ALL') list = list.filter((p: any) => p.status === params.status);
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter((p: any) => p.name.toLowerCase().includes(kw) || p.category_name?.toLowerCase().includes(kw));
    }
    const total = list.length;
    const start = (params.page - 1) * params.page_size;
    return { list: list.slice(start, start + params.page_size), total };
  }
  async getProductDetail(productId: string) {
    await simDelay();
    const product = MOCK_PRODUCTS.find((p: any) => p.id === productId);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    return { ...product };
  }
  async getProductCategories() {
    await simDelay();
    return [...MOCK_CATEGORIES];
  }
  async createProduct(product: Partial<ProductData>) {
    await simDelay(500);
    const catId = product.category_id || 'cat-001';
    const cat = MOCK_CATEGORIES.find(c => c.id === catId);
    const newProduct: ProductData = {
      id: `p-${Date.now()}`,
      name: product.name || '',
      category_id: catId,
      category_name: cat?.name || '',
      images: product.images || [],
      description: product.description || '',
      specifications: product.specifications || [],
      price: product.price || 0,
      market_price: product.market_price || 0,
      stock: product.stock || 0,
      product_type: product.product_type || ('OTC' as ProductType),
      is_otc: product.is_otc ?? (product.product_type === 'OTC'),
      otc_license_no: product.otc_license_no,
      cold_chain_config: product.cold_chain_config,
      merchant_id: product.merchant_id || 'm-001',
      merchant_name: MOCK_MERCHANTS.find(m => m.id === (product.merchant_id || 'm-001'))?.name || '',
      status: product.status || 'ON_SHELF',
      sales_count: 0,
      rating: product.rating ?? 4.5,
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
    };
    MOCK_PRODUCTS.unshift(newProduct);
    // 更新分类 product_count
    if (cat) cat.product_count += 1;
    return newProduct;
  }
  async updateProduct(productId: string, updates: Partial<ProductData>) {
    await simDelay(300);
    const idx = MOCK_PRODUCTS.findIndex((p: any) => p.id === productId);
    if (idx === -1) throw new Error('PRODUCT_NOT_FOUND');
    // 如果改了分类，同步更新 category_name
    if (updates.category_id) {
      updates.category_name = MOCK_CATEGORIES.find(c => c.id === updates.category_id)?.name || '';
    }
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...updates, updated_at: Date.now() / 1000 };
  }
  async toggleProductStatus(productId: string, status: 'ON_SHELF' | 'OFF_SHELF') {
    await simDelay(200);
    const idx = MOCK_PRODUCTS.findIndex((p: any) => p.id === productId);
    if (idx === -1) throw new Error('PRODUCT_NOT_FOUND');
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], status, updated_at: Date.now() / 1000 };
  }
  async batchProducts(ids: string[], action: 'DELETE' | 'ON_SHELF' | 'OFF_SHELF') {
    await simDelay(400);
    for (const id of ids) {
      const idx = MOCK_PRODUCTS.findIndex((p: any) => p.id === id);
      if (idx === -1) continue;
      if (action === 'DELETE') {
        MOCK_PRODUCTS.splice(idx, 1);
      } else {
        MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], status: action, updated_at: Date.now() / 1000 };
      }
    }
  }

  // === 财务管理 ===
  async getSettlementList(params: { page: number; page_size: number; merchant_id?: string; status?: string }) {
    await simDelay();
    let list = [...MOCK_SETTLEMENTS];
    if (params.status) list = list.filter((s: any) => s.status === params.status);
    if (params.merchant_id) list = list.filter((s: any) => s.merchant_id === params.merchant_id || MOCK_MERCHANTS.find(m => m.id === params.merchant_id && m.name === s.merchant_name));
    const total = list.length;
    const start = (params.page - 1) * params.page_size;
    return { list: list.slice(start, start + params.page_size), total };
  }
  async getReconciliationItems(settlementId: string): Promise<{ list: any[]; total: number }> {
    return this.get(`/settlements/${settlementId}/reconciliation`);
  }
  async getSplitRecords(settlementId: string): Promise<{ list: any[]; total: number }> {
    return this.get(`/settlements/${settlementId}/splits`);
  }

  // === SCRM ===
  async getCustomerList(params: { page: number; page_size: number; keyword?: string; tag?: string }): Promise<{ list: any[]; total: number }> {
    await simDelay();
    let list = [...MOCK_CUSTOMERS];
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter((c: any) => c.name.toLowerCase().includes(kw) || c.phone.includes(kw));
    }
    if (params.tag) {
      list = list.filter((c: any) => c.tags?.includes(params.tag));
    }
    const total = list.length;
    const start = (params.page - 1) * params.page_size;
    return { list: list.slice(start, start + params.page_size), total };
  }
  async getTagList(): Promise<any[]> {
    return this.get('/scrm/tags');
  }
  async getSopList(): Promise<any[]> {
    return this.get('/scrm/sop');
  }
  async getConversations(params: { customer_id?: string; page: number; page_size: number }): Promise<{ list: any[]; total: number }> {
    await simDelay();
    return this.get('/scrm/conversations');
  }

  // === 运营管理 ===
  async getBannerList(): Promise<any[]> {
    await simDelay();
    return [...MOCK_BANNERS];
  }
  async getActivityList(params?: { page: number; page_size: number }): Promise<{ list: any[]; total: number }> {
    await simDelay();
    return { list: [...MOCK_ACTIVITIES], total: MOCK_ACTIVITIES.length };
  }
  async getTicketList(params: { page: number; page_size: number; status?: string }): Promise<{ list: any[]; total: number }> {
    await simDelay();
    let list = [...MOCK_TICKETS];
    if (params.status) list = list.filter((t: any) => t.status === params.status);
    const total = list.length;
    const start = (params.page - 1) * params.page_size;
    return { list: list.slice(start, start + params.page_size), total };
  }
  async getComplaintList(params: { page: number; page_size: number; status?: string }): Promise<{ list: any[]; total: number }> {
    return this.get('/complaints');
  }

  async get<T>(path: string): Promise<T> {
    await simDelay();
    const route = routes.find(r => {
      if (r.method !== 'GET') return false;
      if (typeof r.pattern === 'string') return path === r.pattern || path.startsWith(r.pattern + '?');
      return r.pattern.test(path);
    });
    if (route) return route.handler(path) as Promise<T>;
    console.warn(`[SIM] GET ${path} - no route matched`);
    return {} as T;
  }

  async post<T, B = unknown>(path: string, body?: B): Promise<T> {
    await simDelay(500);
    const route = routes.find(r => {
      if (r.method !== 'POST') return false;
      if (typeof r.pattern === 'string') return path === r.pattern;
      return r.pattern.test(path);
    });
    if (route) return route.handler(path, body) as Promise<T>;
    console.warn(`[SIM] POST ${path} - no route matched`);
    return {} as T;
  }

  async put<T, B = unknown>(path: string, body?: B): Promise<T> {
    await simDelay();
    const route = routes.find(r => {
      if (r.method !== 'PUT') return false;
      if (typeof r.pattern === 'string') return path === r.pattern;
      return r.pattern.test(path);
    });
    if (route) return route.handler(path, body) as Promise<T>;
    console.warn(`[SIM] PUT ${path} - no route matched`);
    return {} as T;
  }

  async patch<T, B = unknown>(path: string, body?: B): Promise<T> {
    await simDelay();
    // PATCH 复用 PUT 路由（语义相近）
    const route = routes.find(r => {
      if (r.method !== 'PUT') return false;
      if (typeof r.pattern === 'string') return path === r.pattern;
      return r.pattern.test(path);
    });
    if (route) return route.handler(path, body) as Promise<T>;
    console.warn(`[SIM] PATCH ${path} - no route matched`);
    return {} as T;
  }

  async delete<T>(path: string): Promise<T> {
    await simDelay();
    const route = routes.find(r => {
      if (r.method !== 'DELETE') return false;
      if (typeof r.pattern === 'string') return path === r.pattern;
      return r.pattern.test(path);
    });
    if (route) return route.handler(path) as Promise<T>;
    return {} as T;
  }
}

// ============================================================
// TRANSPORT / STREAM / ASSET
// ============================================================
class SimTransportAdapter implements ITransportAdapter {
  private channel: BroadcastChannel | null = null;
  private handlers: Map<string, Set<Function>> = new Map();
  connect(): void {
    this.channel = new BroadcastChannel('sugarmate_sim');
    this.channel.onmessage = (ev) => {
      const { event, payload } = ev.data;
      this.handlers.get(event)?.forEach(h => h(payload));
    };
  }
  disconnect(): void { this.channel?.close(); this.channel = null; }
  send(event: string, payload: unknown): void { this.channel?.postMessage({ event, payload }); }
  on<T>(event: string, handler: (data: T) => void): void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
  }
  off(event: string): void { this.handlers.delete(event); }
}

class SimStreamAdapter implements IStreamAdapter {
  startStream(_url: string, _canvas: HTMLCanvasElement): void {}
  stopStream(): void {}
  takeSnapshot(): string | null { return null; }
}

class SimAssetAdapter implements IAssetAdapter {
  getAssetUrl(path: string): string { return path.startsWith('http') ? path : `/assets/${path}`; }
  async uploadFile(_file: File): Promise<string> { await simDelay(500); return URL.createObjectURL(_file); }
  async deleteFile(_path: string): Promise<void> { await simDelay(200); }
}

// ============================================================
// 共享数据引用（供 syncEngine 跨 Store 同步）
// ============================================================
export const SIM_SHARED = {
  get identities(): any[] { return MOCK_IDENTITIES; },
  get applications(): any[] { return MOCK_APPLICATIONS; },
  get merchants(): any[] { return MOCK_MERCHANTS; },
  get products(): ProductData[] { return MOCK_PRODUCTS; },
  /** 客户池（供 APP 端认证和注册同步） */
  get customers(): any[] { return MOCK_CUSTOMERS; },
  /** 添加商家 */
  addMerchant(m: any) {
    if (!MOCK_MERCHANTS.find(ex => ex.id === m.id)) {
      MOCK_MERCHANTS.push(m);
    }
  },
  /** 添加身份（APP 端角色切换用） */
  addIdentity(id: any) {
    if (!MOCK_IDENTITIES.find(ex => ex.id === id.id)) {
      MOCK_IDENTITIES.push(id);
    }
  },
  /** 添加客户（患者APP注册 → SCRM客户池同步） */
  addCustomer(c: any) {
    if (!MOCK_CUSTOMERS.find(ex => ex.phone === c.phone || ex.id === c.id)) {
      MOCK_CUSTOMERS.push(c);
      saveCustomers(MOCK_CUSTOMERS); // 持久化，刷新不丢
      return true;
    }
    return false;
  },
  /** 更新入驻申请状态 */
  updateApplicationStatus(appId: string, status: string) {
    const app = MOCK_APPLICATIONS.find((a: any) => a.id === appId);
    if (app) app.status = status;
  },
  /** 更新商家信息 */
  updateMerchant(merchantId: string, updates: Record<string, any>) {
    const idx = MOCK_MERCHANTS.findIndex((m: any) => m.id === merchantId);
    if (idx >= 0) Object.assign(MOCK_MERCHANTS[idx], updates);
  },
};

// ============================================================
// 工厂
// ============================================================
export function createSimAdapters(): AdapterSet {
  return {
    data: new SimDataAdapter(),
    transport: new SimTransportAdapter(),
    stream: new SimStreamAdapter(),
    asset: new SimAssetAdapter(),
    auth: new SimAuthAdapter(),
  };
}
