/**
 * 项目域 — Pinia Store（接入持久化服务）
 *
 * 层级模型：平台 → 租户（概念层）→ 项目（独立销售单元）→ 门店
 *
 * 数据持久化：
 *   所有 ref 变更通过 watch 自动同步到 localStorage，
 *   页面刷新后自动恢复。
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { dataService, type StoredProjectData } from '../services/data-service';
import type {
  Project,
  Store,
  Product,
  LiveRoom,
  MemberLevelConfig,
  ProjectHomeConfig,
  MarketingCategory,
  Tenant,
  Coupon,
  SignInState,
  Inviter,
} from '../contracts';

// ============================================
// 默认值
// ============================================

const DEFAULT_DATA: StoredProjectData = {
  tenants: [
    { tenant_id: 'tenant-001', name: '优选生活集团', contact_phone: '400-xxx-1234', registered_at: '2024-01-15T00:00:00Z', status: 'active' },
    { tenant_id: 'tenant-002', name: '健康伴侣集团', contact_phone: '400-xxx-5678', registered_at: '2024-03-20T00:00:00Z', status: 'active' },
  ],
  projects: [
    { project_id: 'proj-daily-01', tenant_id: 'tenant-001', name: '日用百货优选', mall_name: '生活优选百货', logo: 'https://picsum.photos/seed/proj-daily-01/100/100', category: 'daily', industry: 'daily_necessities', description: '精选日用百货好物，品质生活每一天', store_count: 6, member_count: 12800, sort: 1, status: 'active', created_at: '2024-02-01T00:00:00Z' },
    { project_id: 'proj-daily-02', tenant_id: 'tenant-001', name: '家居清洁馆', mall_name: '家居清洁管家', logo: 'https://picsum.photos/seed/proj-daily-02/100/100', category: 'daily', industry: 'home_appliance', description: '家居清洁用品一站式采购', store_count: 4, member_count: 5600, sort: 2, status: 'active', created_at: '2024-02-10T00:00:00Z' },
    { project_id: 'proj-health-01', tenant_id: 'tenant-002', name: '健康补给站', mall_name: '健康补给优选', logo: 'https://picsum.photos/seed/proj-health-01/100/100', category: 'health', industry: 'health_products', description: '常规保健品精选，关爱全家健康', store_count: 5, member_count: 8200, sort: 3, status: 'active', created_at: '2024-03-01T00:00:00Z' },
    { project_id: 'proj-health-02', tenant_id: 'tenant-002', name: '营养滋补坊', mall_name: '营养滋补精选', logo: 'https://picsum.photos/seed/proj-health-02/100/100', category: 'health', industry: 'health_products', description: '营养滋补类保健品专业甄选', store_count: 3, member_count: 3400, sort: 4, status: 'active', created_at: '2024-04-05T00:00:00Z' },
  ],
  stores: [
    { store_id: 'store-d-001', project_id: 'proj-daily-01', name: '日用品优选·朝阳店', type: 'both', address: '北京市朝阳区建国路88号', business_hours: '09:00-21:00', phone: '010-88880001', contact_name: '王经理', longitude: 116.48, latitude: 39.92, cover_image: 'https://picsum.photos/seed/store-d-001/400/300', distance: 1.2, sort: 1, status: 'active', created_at: '2024-02-05T00:00:00Z' },
    { store_id: 'store-d-002', project_id: 'proj-daily-01', name: '日用品优选·海淀店', type: 'pickup', address: '北京市海淀区中关村大街15号', business_hours: '08:30-20:30', phone: '010-88880002', contact_name: '李店长', longitude: 116.31, latitude: 39.98, cover_image: 'https://picsum.photos/seed/store-d-002/400/300', distance: 3.5, sort: 2, status: 'active', created_at: '2024-02-06T00:00:00Z' },
    { store_id: 'store-d-003', project_id: 'proj-daily-01', name: '日用品优选·丰台提货点', type: 'pickup', address: '北京市丰台区南三环西路6号', business_hours: '10:00-19:00', phone: '010-88880003', contact_name: '张负责人', longitude: 116.29, latitude: 39.85, cover_image: 'https://picsum.photos/seed/store-d-003/400/300', distance: 5.8, sort: 3, status: 'active', created_at: '2024-02-07T00:00:00Z' },
    { store_id: 'store-d-101', project_id: 'proj-daily-02', name: '家居清洁·西城店', type: 'sales', address: '北京市西城区西直门内大街32号', business_hours: '09:00-20:00', phone: '010-88881001', contact_name: '赵经理', longitude: 116.36, latitude: 39.94, cover_image: 'https://picsum.photos/seed/store-d-101/400/300', distance: 2.1, sort: 1, status: 'active', created_at: '2024-02-12T00:00:00Z' },
    { store_id: 'store-d-102', project_id: 'proj-daily-02', name: '家居清洁·东城提货点', type: 'pickup', address: '北京市东城区东直门外大街42号', business_hours: '10:00-18:00', phone: '010-88881002', contact_name: '孙店长', longitude: 116.43, latitude: 39.95, cover_image: 'https://picsum.photos/seed/store-d-102/400/300', distance: 4.2, sort: 2, status: 'active', created_at: '2024-02-13T00:00:00Z' },
    { store_id: 'store-h-001', project_id: 'proj-health-01', name: '健康补给·国贸店', type: 'sales', address: '北京市朝阳区国贸CBD中心A座', business_hours: '09:30-21:30', phone: '010-88882001', contact_name: '周经理', longitude: 116.46, latitude: 39.91, cover_image: 'https://picsum.photos/seed/store-h-001/400/300', distance: 1.8, sort: 1, status: 'active', created_at: '2024-03-05T00:00:00Z' },
    { store_id: 'store-h-002', project_id: 'proj-health-01', name: '健康补给·望京店', type: 'both', address: '北京市朝阳区望京SOHO T1', business_hours: '09:00-20:00', phone: '010-88882002', contact_name: '吴店长', longitude: 116.47, latitude: 39.99, cover_image: 'https://picsum.photos/seed/store-h-002/400/300', distance: 6.3, sort: 2, status: 'active', created_at: '2024-03-06T00:00:00Z' },
    { store_id: 'store-h-003', project_id: 'proj-health-01', name: '健康补给·亚运村提货点', type: 'pickup', address: '北京市朝阳区亚运村北辰东路8号', business_hours: '10:00-18:30', phone: '010-88882003', contact_name: '郑负责人', longitude: 116.39, latitude: 40.01, cover_image: 'https://picsum.photos/seed/store-h-003/400/300', distance: 7.5, sort: 3, status: 'active', created_at: '2024-03-07T00:00:00Z' },
    { store_id: 'store-h-101', project_id: 'proj-health-02', name: '营养滋补·三里屯店', type: 'sales', address: '北京市朝阳区三里屯太古里', business_hours: '10:00-22:00', phone: '010-88883001', contact_name: '钱经理', longitude: 116.45, latitude: 39.93, cover_image: 'https://picsum.photos/seed/store-h-101/400/300', distance: 2.8, sort: 1, status: 'active', created_at: '2024-04-08T00:00:00Z' },
    { store_id: 'store-h-102', project_id: 'proj-health-02', name: '营养滋补·双井提货点', type: 'pickup', address: '北京市朝阳区双井桥东', business_hours: '09:00-19:00', phone: '010-88883002', contact_name: '冯店长', longitude: 116.47, latitude: 39.90, cover_image: 'https://picsum.photos/seed/store-h-102/400/300', distance: 4.1, sort: 2, status: 'active', created_at: '2024-04-09T00:00:00Z' },
  ],
  products: [
    { product_id: 'prod-d-001', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '竹纤维抽纸 3层120抽 10包/提', cover_image: 'https://picsum.photos/seed/prod-d-001/300/300', price: 29.9, original_price: 39.9, sales: 8520, stock: 1200, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['热销', '环保'], status: 'on_sale', description: '天然竹纤维，柔软亲肤，环保健康', created_at: '2024-02-08T00:00:00Z' },
    { product_id: 'prod-d-002', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '洗洁精柠檬味 2kg瓶装', cover_image: 'https://picsum.photos/seed/prod-d-002/300/300', price: 19.9, original_price: 25.9, sales: 6320, stock: 800, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['去油强'], status: 'on_sale', created_at: '2024-02-08T00:00:00Z' },
    { product_id: 'prod-d-003', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '超细纤维洗碗布 3条装', cover_image: 'https://picsum.photos/seed/prod-d-003/300/300', price: 15.9, sales: 4100, stock: 600, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['吸水强'], status: 'on_sale', created_at: '2024-02-09T00:00:00Z' },
    { product_id: 'prod-d-004', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '不锈钢保温杯 500ml', cover_image: 'https://picsum.photos/seed/prod-d-004/300/300', price: 49.9, original_price: 69.9, sales: 12500, stock: 350, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['热销', '316不锈钢'], status: 'on_sale', created_at: '2024-02-09T00:00:00Z' },
    { product_id: 'prod-d-005', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '一次性垃圾袋 45×50cm 100只', cover_image: 'https://picsum.photos/seed/prod-d-005/300/300', price: 12.9, sales: 9800, stock: 2000, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['加厚'], status: 'on_sale', created_at: '2024-02-10T00:00:00Z' },
    { product_id: 'prod-d-006', project_id: 'proj-daily-01', name: '纯棉毛巾 34×76cm 2条装', cover_image: 'https://picsum.photos/seed/prod-d-006/300/300', price: 39.9, original_price: 59.9, sales: 5600, stock: 480, category: '家纺', marketing_category: 'mc-d-004', tags: ['纯棉', '吸水'], status: 'on_sale', created_at: '2024-02-10T00:00:00Z' },
    // v3.1.32 补充 mock 商品（proj-daily-01，分散到3个门店，验证"最多50个"限制）
    { product_id: 'prod-d-007', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '厨房纸巾 加厚吸水 80抽×6包', cover_image: 'https://picsum.photos/seed/prod-d-007/300/300', price: 24.9, original_price: 34.9, sales: 4200, stock: 900, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['加厚'], status: 'on_sale', created_at: '2024-02-11T00:00:00Z' },
    { product_id: 'prod-d-008', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '湿厕纸 80片便携装', cover_image: 'https://picsum.photos/seed/prod-d-008/300/300', price: 15.9, sales: 3600, stock: 1100, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['清洁'], status: 'on_sale', created_at: '2024-02-11T00:00:00Z' },
    { product_id: 'prod-d-009', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '衣物柔顺剂 2L', cover_image: 'https://picsum.photos/seed/prod-d-009/300/300', price: 29.9, original_price: 39.9, sales: 2800, stock: 600, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['柔顺'], status: 'on_sale', created_at: '2024-02-12T00:00:00Z' },
    { product_id: 'prod-d-010', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '洗衣液薰衣香 3kg', cover_image: 'https://picsum.photos/seed/prod-d-010/300/300', price: 45.9, sales: 7200, stock: 500, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['热销', '薰衣香'], status: 'on_sale', created_at: '2024-02-12T00:00:00Z' },
    { product_id: 'prod-d-011', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '玻璃水杯 350ml 耐热', cover_image: 'https://picsum.photos/seed/prod-d-011/300/300', price: 22.9, original_price: 32.9, sales: 3400, stock: 700, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['耐热'], status: 'on_sale', created_at: '2024-02-13T00:00:00Z' },
    { product_id: 'prod-d-012', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '陶瓷碗 4.5英寸 6只装', cover_image: 'https://picsum.photos/seed/prod-d-012/300/300', price: 39.9, sales: 4100, stock: 400, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['家用'], status: 'on_sale', created_at: '2024-02-13T00:00:00Z' },
    { product_id: 'prod-d-013', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '压缩毛巾 20片装', cover_image: 'https://picsum.photos/seed/prod-d-013/300/300', price: 12.9, sales: 3800, stock: 1200, category: '家纺', marketing_category: 'mc-d-004', tags: ['便携'], status: 'on_sale', created_at: '2024-02-14T00:00:00Z' },
    { product_id: 'prod-d-014', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '浴巾纯棉 70×140cm', cover_image: 'https://picsum.photos/seed/prod-d-014/300/300', price: 59.9, original_price: 89.9, sales: 2900, stock: 350, category: '家纺', marketing_category: 'mc-d-004', tags: ['纯棉'], status: 'on_sale', created_at: '2024-02-14T00:00:00Z' },
    { product_id: 'prod-d-015', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '洗衣皂 透明皂 200g×3块', cover_image: 'https://picsum.photos/seed/prod-d-015/300/300', price: 14.9, sales: 4500, stock: 1000, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['去污'], status: 'on_sale', created_at: '2024-02-15T00:00:00Z' },
    { product_id: 'prod-d-016', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '抽纸便携装 10包', cover_image: 'https://picsum.photos/seed/prod-d-016/300/300', price: 16.9, original_price: 22.9, sales: 8800, stock: 1500, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['热销'], status: 'on_sale', created_at: '2024-02-15T00:00:00Z' },
    { product_id: 'prod-d-017', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '抹布厨房专用 5条装', cover_image: 'https://picsum.photos/seed/prod-d-017/300/300', price: 9.9, sales: 5200, stock: 1800, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['吸水'], status: 'on_sale', created_at: '2024-02-16T00:00:00Z' },
    { product_id: 'prod-d-018', project_id: 'proj-daily-01', store_id: 'store-d-001', name: '收纳箱塑料 35L带盖', cover_image: 'https://picsum.photos/seed/prod-d-018/300/300', price: 35.9, original_price: 49.9, sales: 3600, stock: 450, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['收纳'], status: 'on_sale', created_at: '2024-02-16T00:00:00Z' },
    { product_id: 'prod-d-019', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '抽纸原木 3层120抽 8包', cover_image: 'https://picsum.photos/seed/prod-d-019/300/300', price: 32.9, sales: 6300, stock: 800, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['热销'], status: 'on_sale', created_at: '2024-02-17T00:00:00Z' },
    { product_id: 'prod-d-020', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '消毒湿巾 80片大包', cover_image: 'https://picsum.photos/seed/prod-d-020/300/300', price: 18.9, original_price: 25.9, sales: 4700, stock: 1000, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['消毒'], status: 'on_sale', created_at: '2024-02-17T00:00:00Z' },
    { product_id: 'prod-d-021', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '油污清洁剂 500ml', cover_image: 'https://picsum.photos/seed/prod-d-021/300/300', price: 19.9, sales: 3200, stock: 650, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['去油'], status: 'on_sale', created_at: '2024-02-18T00:00:00Z' },
    { product_id: 'prod-d-022', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '餐具洗洁精 1L柠檬', cover_image: 'https://picsum.photos/seed/prod-d-022/300/300', price: 14.9, sales: 5100, stock: 1200, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['柠檬'], status: 'on_sale', created_at: '2024-02-18T00:00:00Z' },
    { product_id: 'prod-d-023', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '保温壶 1.5L家用', cover_image: 'https://picsum.photos/seed/prod-d-023/300/300', price: 69.9, original_price: 99.9, sales: 2800, stock: 300, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['保温'], status: 'on_sale', created_at: '2024-02-19T00:00:00Z' },
    { product_id: 'prod-d-024', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '马克杯陶瓷 350ml', cover_image: 'https://picsum.photos/seed/prod-d-024/300/300', price: 25.9, sales: 3400, stock: 550, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['家用'], status: 'on_sale', created_at: '2024-02-19T00:00:00Z' },
    { product_id: 'prod-d-025', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '床单纯棉 1.8m床', cover_image: 'https://picsum.photos/seed/prod-d-025/300/300', price: 89.9, original_price: 129.9, sales: 2400, stock: 280, category: '家纺', marketing_category: 'mc-d-004', tags: ['纯棉'], status: 'on_sale', created_at: '2024-02-20T00:00:00Z' },
    { product_id: 'prod-d-026', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '枕芯记忆棉 1只装', cover_image: 'https://picsum.photos/seed/prod-d-026/300/300', price: 49.9, sales: 3100, stock: 400, category: '家纺', marketing_category: 'mc-d-004', tags: ['记忆棉'], status: 'on_sale', created_at: '2024-02-20T00:00:00Z' },
    { product_id: 'prod-d-027', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '垃圾袋分类 100只', cover_image: 'https://picsum.photos/seed/prod-d-027/300/300', price: 11.9, sales: 6800, stock: 2000, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['加厚'], status: 'on_sale', created_at: '2024-02-21T00:00:00Z' },
    { product_id: 'prod-d-028', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '收纳盒桌面 3格', cover_image: 'https://picsum.photos/seed/prod-d-028/300/300', price: 19.9, original_price: 29.9, sales: 2800, stock: 500, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['收纳'], status: 'on_sale', created_at: '2024-02-21T00:00:00Z' },
    { product_id: 'prod-d-029', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '面巾纸便携 10包', cover_image: 'https://picsum.photos/seed/prod-d-029/300/300', price: 13.9, sales: 7400, stock: 1300, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['便携'], status: 'on_sale', created_at: '2024-02-22T00:00:00Z' },
    { product_id: 'prod-d-030', project_id: 'proj-daily-01', store_id: 'store-d-002', name: '柔顺剂衣物 1L', cover_image: 'https://picsum.photos/seed/prod-d-030/300/300', price: 16.9, sales: 3900, stock: 800, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['柔顺'], status: 'on_sale', created_at: '2024-02-22T00:00:00Z' },
    { product_id: 'prod-d-031', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '垃圾袋加厚 55×70cm 50只', cover_image: 'https://picsum.photos/seed/prod-d-031/300/300', price: 14.9, sales: 8200, stock: 1800, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['加厚', '热销'], status: 'on_sale', created_at: '2024-02-23T00:00:00Z' },
    { product_id: 'prod-d-032', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '纸巾大包 200抽×3包', cover_image: 'https://picsum.photos/seed/prod-d-032/300/300', price: 19.9, original_price: 27.9, sales: 9100, stock: 1200, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['热销', '大包'], status: 'on_sale', created_at: '2024-02-23T00:00:00Z' },
    { product_id: 'prod-d-033', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '抹布超细纤维 3条', cover_image: 'https://picsum.photos/seed/prod-d-033/300/300', price: 9.9, sales: 4600, stock: 1500, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['吸水'], status: 'on_sale', created_at: '2024-02-24T00:00:00Z' },
    { product_id: 'prod-d-034', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '洗衣凝珠 20颗盒装', cover_image: 'https://picsum.photos/seed/prod-d-034/300/300', price: 24.9, original_price: 34.9, sales: 5300, stock: 700, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['热销'], status: 'on_sale', created_at: '2024-02-24T00:00:00Z' },
    { product_id: 'prod-d-035', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '保温杯便携 500ml', cover_image: 'https://picsum.photos/seed/prod-d-035/300/300', price: 45.9, sales: 3700, stock: 500, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['便携', '保温'], status: 'on_sale', created_at: '2024-02-25T00:00:00Z' },
    { product_id: 'prod-d-036', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '不锈钢筷子 5双装', cover_image: 'https://picsum.photos/seed/prod-d-036/300/300', price: 19.9, sales: 3200, stock: 800, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['不锈钢'], status: 'on_sale', created_at: '2024-02-25T00:00:00Z' },
    { product_id: 'prod-d-037', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '毛浴巾套装 2件', cover_image: 'https://picsum.photos/seed/prod-d-037/300/300', price: 49.9, original_price: 69.9, sales: 2600, stock: 400, category: '家纺', marketing_category: 'mc-d-004', tags: ['套装'], status: 'on_sale', created_at: '2024-02-26T00:00:00Z' },
    { product_id: 'prod-d-038', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '浴球沐浴球 3只装', cover_image: 'https://picsum.photos/seed/prod-d-038/300/300', price: 9.9, sales: 4100, stock: 1100, category: '家纺', marketing_category: 'mc-d-004', tags: ['清洁'], status: 'on_sale', created_at: '2024-02-26T00:00:00Z' },
    { product_id: 'prod-d-039', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '收纳箱折叠 40L', cover_image: 'https://picsum.photos/seed/prod-d-039/300/300', price: 39.9, sales: 3400, stock: 450, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['折叠'], status: 'on_sale', created_at: '2024-02-27T00:00:00Z' },
    { product_id: 'prod-d-040', project_id: 'proj-daily-01', store_id: 'store-d-003', name: '厨房纸大卷 160g×4卷', cover_image: 'https://picsum.photos/seed/prod-d-040/300/300', price: 22.9, original_price: 29.9, sales: 5800, stock: 900, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['大卷'], status: 'on_sale', created_at: '2024-02-27T00:00:00Z' },
    // 以下为项目级商品（无 store_id，归项目）
    { product_id: 'prod-d-041', project_id: 'proj-daily-01', name: '生活大礼包 家用套装', cover_image: 'https://picsum.photos/seed/prod-d-041/300/300', price: 99.9, original_price: 159.9, sales: 2200, stock: 300, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['礼包'], status: 'on_sale', created_at: '2024-02-28T00:00:00Z' },
    { product_id: 'prod-d-042', project_id: 'proj-daily-01', name: '家居礼包 清洁套装', cover_image: 'https://picsum.photos/seed/prod-d-042/300/300', price: 79.9, sales: 3100, stock: 400, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['套装'], status: 'on_sale', created_at: '2024-02-28T00:00:00Z' },
    { product_id: 'prod-d-043', project_id: 'proj-daily-01', name: '纸品礼包 抽纸大包', cover_image: 'https://picsum.photos/seed/prod-d-043/300/300', price: 49.9, original_price: 69.9, sales: 4500, stock: 700, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['礼包'], status: 'on_sale', created_at: '2024-03-01T00:00:00Z' },
    { product_id: 'prod-d-044', project_id: 'proj-daily-01', name: '家纺礼包 毛巾浴巾套装', cover_image: 'https://picsum.photos/seed/prod-d-044/300/300', price: 89.9, sales: 2800, stock: 350, category: '家纺', marketing_category: 'mc-d-004', tags: ['套装'], status: 'on_sale', created_at: '2024-03-01T00:00:00Z' },
    { product_id: 'prod-d-045', project_id: 'proj-daily-01', name: '餐厨礼包 碗杯套装', cover_image: 'https://picsum.photos/seed/prod-d-045/300/300', price: 109.9, original_price: 149.9, sales: 1900, stock: 250, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['套装'], status: 'on_sale', created_at: '2024-03-02T00:00:00Z' },
    { product_id: 'prod-d-046', project_id: 'proj-daily-01', name: '清洁礼包 洗衣凝珠+柔顺剂', cover_image: 'https://picsum.photos/seed/prod-d-046/300/300', price: 59.9, sales: 3600, stock: 500, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['礼包'], status: 'on_sale', created_at: '2024-03-02T00:00:00Z' },
    { product_id: 'prod-d-047', project_id: 'proj-daily-01', name: '湿巾礼包 大包便携', cover_image: 'https://picsum.photos/seed/prod-d-047/300/300', price: 29.9, original_price: 39.9, sales: 5200, stock: 900, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['礼包'], status: 'on_sale', created_at: '2024-03-03T00:00:00Z' },
    { product_id: 'prod-d-048', project_id: 'proj-daily-01', name: '收纳礼包 收纳箱3件套', cover_image: 'https://picsum.photos/seed/prod-d-048/300/300', price: 79.9, sales: 2400, stock: 380, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['套装'], status: 'on_sale', created_at: '2024-03-03T00:00:00Z' },
    { product_id: 'prod-d-049', project_id: 'proj-daily-01', name: '厨房礼包 清洁剂套装', cover_image: 'https://picsum.photos/seed/prod-d-049/300/300', price: 69.9, original_price: 99.9, sales: 2100, stock: 420, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['套装'], status: 'on_sale', created_at: '2024-03-04T00:00:00Z' },
    { product_id: 'prod-d-050', project_id: 'proj-daily-01', name: '家居礼包 毛巾6件套', cover_image: 'https://picsum.photos/seed/prod-d-050/300/300', price: 99.9, sales: 2700, stock: 300, category: '家纺', marketing_category: 'mc-d-004', tags: ['套装'], status: 'on_sale', created_at: '2024-03-04T00:00:00Z' },
    { product_id: 'prod-d-051', project_id: 'proj-daily-01', name: '日用礼包 清洁15件', cover_image: 'https://picsum.photos/seed/prod-d-051/300/300', price: 129.9, original_price: 189.9, sales: 1800, stock: 250, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['热销'], status: 'on_sale', created_at: '2024-03-05T00:00:00Z' },
    { product_id: 'prod-d-052', project_id: 'proj-daily-01', name: '餐厨礼包 碗筷杯套装', cover_image: 'https://picsum.photos/seed/prod-d-052/300/300', price: 119.9, sales: 1600, stock: 280, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['套装'], status: 'on_sale', created_at: '2024-03-05T00:00:00Z' },
    { product_id: 'prod-d-053', project_id: 'proj-daily-01', name: '纸品礼包 厨房纸+抽纸', cover_image: 'https://picsum.photos/seed/prod-d-053/300/300', price: 39.9, original_price: 54.9, sales: 4800, stock: 600, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['热销'], status: 'on_sale', created_at: '2024-03-06T00:00:00Z' },
    { product_id: 'prod-d-054', project_id: 'proj-daily-01', name: '清洁礼包 洗衣大礼包', cover_image: 'https://picsum.photos/seed/prod-d-054/300/300', price: 89.9, sales: 3200, stock: 400, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['礼包'], status: 'on_sale', created_at: '2024-03-06T00:00:00Z' },
    { product_id: 'prod-d-055', project_id: 'proj-daily-01', name: '家纺礼包 浴巾枕芯套装', cover_image: 'https://picsum.photos/seed/prod-d-055/300/300', price: 149.9, original_price: 199.9, sales: 1700, stock: 220, category: '家纺', marketing_category: 'mc-d-004', tags: ['套装'], status: 'on_sale', created_at: '2024-03-07T00:00:00Z' },
    { product_id: 'prod-d-056', project_id: 'proj-daily-01', name: '收纳礼包 桌面整理3件', cover_image: 'https://picsum.photos/seed/prod-d-056/300/300', price: 45.9, sales: 2900, stock: 480, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['收纳'], status: 'on_sale', created_at: '2024-03-07T00:00:00Z' },
    { product_id: 'prod-d-057', project_id: 'proj-daily-01', name: '日用礼包 洗护6件套', cover_image: 'https://picsum.photos/seed/prod-d-057/300/300', price: 79.9, original_price: 109.9, sales: 2300, stock: 350, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['套装'], status: 'on_sale', created_at: '2024-03-08T00:00:00Z' },
    { product_id: 'prod-d-058', project_id: 'proj-daily-01', name: '餐厨礼包 不锈钢5件套', cover_image: 'https://picsum.photos/seed/prod-d-058/300/300', price: 99.9, sales: 1900, stock: 300, category: '水杯餐具', marketing_category: 'mc-d-003', tags: ['不锈钢'], status: 'on_sale', created_at: '2024-03-08T00:00:00Z' },
    { product_id: 'prod-d-059', project_id: 'proj-daily-01', name: '纸品礼包 卫纸10卷装', cover_image: 'https://picsum.photos/seed/prod-d-059/300/300', price: 34.9, original_price: 45.9, sales: 6200, stock: 1000, category: '纸品湿巾', marketing_category: 'mc-d-001', tags: ['热销'], status: 'on_sale', created_at: '2024-03-09T00:00:00Z' },
    { product_id: 'prod-d-060', project_id: 'proj-daily-01', name: '家居礼包 床品4件套', cover_image: 'https://picsum.photos/seed/prod-d-060/300/300', price: 159.9, original_price: 219.9, sales: 1500, stock: 200, category: '家纺', marketing_category: 'mc-d-004', tags: ['热销'], status: 'on_sale', created_at: '2024-03-09T00:00:00Z' },
    { product_id: 'prod-d-061', project_id: 'proj-daily-01', name: '收纳礼包 衣柜整理4件', cover_image: 'https://picsum.photos/seed/prod-d-061/300/300', price: 59.9, sales: 2500, stock: 380, category: '收纳清洁', marketing_category: 'mc-d-002', tags: ['收纳'], status: 'on_sale', created_at: '2024-03-10T00:00:00Z' },
    { product_id: 'prod-d-062', project_id: 'proj-daily-01', name: '清洁礼包 厨房5件套', cover_image: 'https://picsum.photos/seed/prod-d-062/300/300', price: 69.9, original_price: 99.9, sales: 2700, stock: 420, category: '清洁用品', marketing_category: 'mc-d-002', tags: ['套装'], status: 'on_sale', created_at: '2024-03-10T00:00:00Z' },
    { product_id: 'prod-d-101', project_id: 'proj-daily-02', store_id: 'store-d-101', name: '地板清洁剂 1L', cover_image: 'https://picsum.photos/seed/prod-d-101/300/300', price: 22.9, original_price: 32.9, sales: 3200, stock: 700, category: '清洁剂', marketing_category: 'mc-d-101', tags: ['亮光'], status: 'on_sale', created_at: '2024-02-15T00:00:00Z' },
    { product_id: 'prod-d-102', project_id: 'proj-daily-02', store_id: 'store-d-101', name: '玻璃清洁喷雾 500ml', cover_image: 'https://picsum.photos/seed/prod-d-102/300/300', price: 16.9, sales: 4500, stock: 900, category: '清洁剂', marketing_category: 'mc-d-101', tags: ['无痕'], status: 'on_sale', created_at: '2024-02-15T00:00:00Z' },
    { product_id: 'prod-d-103', project_id: 'proj-daily-02', store_id: 'store-d-102', name: '马桶清洁剂 750ml', cover_image: 'https://picsum.photos/seed/prod-d-103/300/300', price: 18.9, sales: 2800, stock: 500, category: '清洁剂', marketing_category: 'mc-d-101', tags: ['除菌'], status: 'on_sale', created_at: '2024-02-16T00:00:00Z' },
    { product_id: 'prod-h-001', project_id: 'proj-health-01', store_id: 'store-h-001', name: '复合维生素片 60片/瓶', cover_image: 'https://picsum.photos/seed/prod-h-001/300/300', price: 89.0, original_price: 128.0, sales: 7200, stock: 320, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['每日营养', '热销'], status: 'on_sale', description: '每日1片，补充21种维生素矿物质', created_at: '2024-03-08T00:00:00Z' },
    { product_id: 'prod-h-002', project_id: 'proj-health-01', store_id: 'store-h-001', name: '深海鱼油软胶囊 100粒', cover_image: 'https://picsum.photos/seed/prod-h-002/300/300', price: 129.0, original_price: 169.0, sales: 5400, stock: 280, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['高纯度', '调节血脂'], status: 'on_sale', created_at: '2024-03-08T00:00:00Z' },
    { product_id: 'prod-h-003', project_id: 'proj-health-01', store_id: 'store-h-002', name: '益生菌粉 30袋/盒', cover_image: 'https://picsum.photos/seed/prod-h-003/300/300', price: 159.0, original_price: 199.0, sales: 9800, stock: 150, category: '益生菌', marketing_category: 'mc-h-003', tags: ['热销', '肠道健康'], status: 'on_sale', created_at: '2024-03-09T00:00:00Z' },
    { product_id: 'prod-h-004', project_id: 'proj-health-01', store_id: 'store-h-002', name: '钙+维生素D3片 90片', cover_image: 'https://picsum.photos/seed/prod-h-004/300/300', price: 69.0, sales: 6300, stock: 410, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['补钙'], status: 'on_sale', created_at: '2024-03-09T00:00:00Z' },
    { product_id: 'prod-h-005', project_id: 'proj-health-01', store_id: 'store-h-003', name: '蛋白质粉 450g罐装', cover_image: 'https://picsum.photos/seed/prod-h-005/300/300', price: 199.0, original_price: 259.0, sales: 4100, stock: 200, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['优质蛋白'], status: 'on_sale', created_at: '2024-03-10T00:00:00Z' },
    // v3.1.32 补充 mock 商品（proj-health-01，分散到3个门店，验证"最多50个"限制）
    { product_id: 'prod-h-006', project_id: 'proj-health-01', store_id: 'store-h-001', name: '维生素C含片 100片/瓶', cover_image: 'https://picsum.photos/seed/prod-h-006/300/300', price: 59.0, original_price: 79.0, sales: 6300, stock: 500, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['热销', '维C'], status: 'on_sale', created_at: '2024-03-11T00:00:00Z' },
    { product_id: 'prod-h-007', project_id: 'proj-health-01', store_id: 'store-h-001', name: '复合维生素B片 60片', cover_image: 'https://picsum.photos/seed/prod-h-007/300/300', price: 49.0, sales: 4100, stock: 450, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['B族'], status: 'on_sale', created_at: '2024-03-11T00:00:00Z' },
    { product_id: 'prod-h-008', project_id: 'proj-health-01', store_id: 'store-h-001', name: '深海鱼油儿童装 60粒', cover_image: 'https://picsum.photos/seed/prod-h-008/300/300', price: 89.0, original_price: 119.0, sales: 3800, stock: 320, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['儿童'], status: 'on_sale', created_at: '2024-03-12T00:00:00Z' },
    { product_id: 'prod-h-009', project_id: 'proj-health-01', store_id: 'store-h-001', name: '鱼油软胶囊高纯 120粒', cover_image: 'https://picsum.photos/seed/prod-h-009/300/300', price: 159.0, original_price: 199.0, sales: 3200, stock: 280, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['高纯'], status: 'on_sale', created_at: '2024-03-12T00:00:00Z' },
    { product_id: 'prod-h-010', project_id: 'proj-health-01', store_id: 'store-h-001', name: '维生素D3滴剂 15ml', cover_image: 'https://picsum.photos/seed/prod-h-010/300/300', price: 79.0, sales: 4400, stock: 360, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['D3'], status: 'on_sale', created_at: '2024-03-13T00:00:00Z' },
    { product_id: 'prod-h-011', project_id: 'proj-health-01', store_id: 'store-h-001', name: '铁元补血片 90片', cover_image: 'https://picsum.photos/seed/prod-h-011/300/300', price: 89.0, original_price: 119.0, sales: 2900, stock: 400, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['补血'], status: 'on_sale', created_at: '2024-03-13T00:00:00Z' },
    { product_id: 'prod-h-012', project_id: 'proj-health-01', store_id: 'store-h-001', name: '叶酸片 400μg×90片', cover_image: 'https://picsum.photos/seed/prod-h-012/300/300', price: 39.9, sales: 5100, stock: 600, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['孕妇'], status: 'on_sale', created_at: '2024-03-14T00:00:00Z' },
    { product_id: 'prod-h-013', project_id: 'proj-health-01', store_id: 'store-h-001', name: '锌片 100片/瓶', cover_image: 'https://picsum.photos/seed/prod-h-013/300/300', price: 49.0, original_price: 69.0, sales: 3400, stock: 420, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['补锌'], status: 'on_sale', created_at: '2024-03-14T00:00:00Z' },
    { product_id: 'prod-h-014', project_id: 'proj-health-01', store_id: 'store-h-001', name: '卵磷脂胶囊 1200mg×100粒', cover_image: 'https://picsum.photos/seed/prod-h-014/300/300', price: 99.0, sales: 2600, stock: 350, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['热销'], status: 'on_sale', created_at: '2024-03-15T00:00:00Z' },
    { product_id: 'prod-h-015', project_id: 'proj-health-01', store_id: 'store-h-001', name: '辅酶Q10胶囊 60粒', cover_image: 'https://picsum.photos/seed/prod-h-015/300/300', price: 189.0, original_price: 249.0, sales: 2100, stock: 200, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['心血管'], status: 'on_sale', created_at: '2024-03-15T00:00:00Z' },
    { product_id: 'prod-h-016', project_id: 'proj-health-01', store_id: 'store-h-001', name: '蛋白粉香草味 400g', cover_image: 'https://picsum.photos/seed/prod-h-016/300/300', price: 159.0, sales: 3700, stock: 300, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['香草'], status: 'on_sale', created_at: '2024-03-16T00:00:00Z' },
    { product_id: 'prod-h-017', project_id: 'proj-health-01', store_id: 'store-h-001', name: '益生菌粉儿童 20袋/盒', cover_image: 'https://picsum.photos/seed/prod-h-017/300/300', price: 129.0, original_price: 169.0, sales: 4500, stock: 380, category: '益生菌', marketing_category: 'mc-h-003', tags: ['儿童'], status: 'on_sale', created_at: '2024-03-16T00:00:00Z' },
    { product_id: 'prod-h-018', project_id: 'proj-health-01', store_id: 'store-h-002', name: '复合维生素男士 60片', cover_image: 'https://picsum.photos/seed/prod-h-018/300/300', price: 99.0, sales: 4200, stock: 450, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['男士'], status: 'on_sale', created_at: '2024-03-17T00:00:00Z' },
    { product_id: 'prod-h-019', project_id: 'proj-health-01', store_id: 'store-h-002', name: '复合维生素女士 60片', cover_image: 'https://picsum.photos/seed/prod-h-019/300/300', price: 99.0, original_price: 139.0, sales: 4800, stock: 450, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['女士', '热销'], status: 'on_sale', created_at: '2024-03-17T00:00:00Z' },
    { product_id: 'prod-h-020', project_id: 'proj-health-01', store_id: 'store-h-002', name: '深海鱼油软胶囊 200粒', cover_image: 'https://picsum.photos/seed/prod-h-020/300/300', price: 199.0, original_price: 269.0, sales: 3500, stock: 250, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['大瓶'], status: 'on_sale', created_at: '2024-03-18T00:00:00Z' },
    { product_id: 'prod-h-021', project_id: 'proj-health-01', store_id: 'store-h-002', name: '益生菌胶囊 60粒', cover_image: 'https://picsum.photos/seed/prod-h-021/300/300', price: 149.0, sales: 4100, stock: 320, category: '益生菌', marketing_category: 'mc-h-003', tags: ['肠道'], status: 'on_sale', created_at: '2024-03-18T00:00:00Z' },
    { product_id: 'prod-h-022', project_id: 'proj-health-01', store_id: 'store-h-002', name: '膳食纤维粉 300g', cover_image: 'https://picsum.photos/seed/prod-h-022/300/300', price: 89.0, original_price: 119.0, sales: 2800, stock: 400, category: '益生菌', marketing_category: 'mc-h-003', tags: ['纤维'], status: 'on_sale', created_at: '2024-03-19T00:00:00Z' },
    { product_id: 'prod-h-023', project_id: 'proj-health-01', store_id: 'store-h-002', name: '钙片中老年 90片', cover_image: 'https://picsum.photos/seed/prod-h-023/300/300', price: 79.0, sales: 5200, stock: 500, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['中老年', '热销'], status: 'on_sale', created_at: '2024-03-19T00:00:00Z' },
    { product_id: 'prod-h-024', project_id: 'proj-health-01', store_id: 'store-h-002', name: '维生素E软胶囊 100粒', cover_image: 'https://picsum.photos/seed/prod-h-024/300/300', price: 59.0, original_price: 79.0, sales: 3600, stock: 380, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['维E'], status: 'on_sale', created_at: '2024-03-20T00:00:00Z' },
    { product_id: 'prod-h-025', project_id: 'proj-health-01', store_id: 'store-h-002', name: '胶原蛋白肽粉 150g', cover_image: 'https://picsum.photos/seed/prod-h-025/300/300', price: 199.0, original_price: 269.0, sales: 3100, stock: 280, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['美容'], status: 'on_sale', created_at: '2024-03-20T00:00:00Z' },
    { product_id: 'prod-h-026', project_id: 'proj-health-01', store_id: 'store-h-002', name: '蛋白粉巧克力味 400g', cover_image: 'https://picsum.photos/seed/prod-h-026/300/300', price: 159.0, sales: 3400, stock: 300, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['巧克力'], status: 'on_sale', created_at: '2024-03-21T00:00:00Z' },
    { product_id: 'prod-h-027', project_id: 'proj-health-01', store_id: 'store-h-002', name: '益生菌固体饮料 30袋', cover_image: 'https://picsum.photos/seed/prod-h-027/300/300', price: 139.0, original_price: 179.0, sales: 3800, stock: 350, category: '益生菌', marketing_category: 'mc-h-003', tags: ['热销'], status: 'on_sale', created_at: '2024-03-21T00:00:00Z' },
    { product_id: 'prod-h-028', project_id: 'proj-health-01', store_id: 'store-h-002', name: '维生素AD滴剂 25ml', cover_image: 'https://picsum.photos/seed/prod-h-028/300/300', price: 69.0, sales: 4300, stock: 420, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['儿童'], status: 'on_sale', created_at: '2024-03-22T00:00:00Z' },
    { product_id: 'prod-h-029', project_id: 'proj-health-01', store_id: 'store-h-002', name: '鱼油Omega-3 180粒', cover_image: 'https://picsum.photos/seed/prod-h-029/300/300', price: 179.0, original_price: 229.0, sales: 2900, stock: 260, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['Omega-3'], status: 'on_sale', created_at: '2024-03-22T00:00:00Z' },
    { product_id: 'prod-h-030', project_id: 'proj-health-01', store_id: 'store-h-003', name: '高钙蛋白粉 500g', cover_image: 'https://picsum.photos/seed/prod-h-030/300/300', price: 169.0, sales: 4200, stock: 320, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['高钙', '热销'], status: 'on_sale', created_at: '2024-03-23T00:00:00Z' },
    { product_id: 'prod-h-031', project_id: 'proj-health-01', store_id: 'store-h-003', name: '多维元素片 100片', cover_image: 'https://picsum.photos/seed/prod-h-031/300/300', price: 89.0, original_price: 119.0, sales: 3500, stock: 380, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['多维'], status: 'on_sale', created_at: '2024-03-23T00:00:00Z' },
    { product_id: 'prod-h-032', project_id: 'proj-health-01', store_id: 'store-h-003', name: '益生菌粉孕妇 20袋/盒', cover_image: 'https://picsum.photos/seed/prod-h-032/300/300', price: 159.0, sales: 2600, stock: 300, category: '益生菌', marketing_category: 'mc-h-003', tags: ['孕妇'], status: 'on_sale', created_at: '2024-03-24T00:00:00Z' },
    { product_id: 'prod-h-033', project_id: 'proj-health-01', store_id: 'store-h-003', name: '鱼油儿童DHA 90粒', cover_image: 'https://picsum.photos/seed/prod-h-033/300/300', price: 129.0, original_price: 169.0, sales: 3100, stock: 350, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['DHA', '儿童'], status: 'on_sale', created_at: '2024-03-24T00:00:00Z' },
    { product_id: 'prod-h-034', project_id: 'proj-health-01', store_id: 'store-h-003', name: '维生素C泡腾片 20片', cover_image: 'https://picsum.photos/seed/prod-h-034/300/300', price: 39.9, sales: 6800, stock: 800, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['热销', '泡腾'], status: 'on_sale', created_at: '2024-03-25T00:00:00Z' },
    { product_id: 'prod-h-035', project_id: 'proj-health-01', store_id: 'store-h-003', name: '钙镁锌片 100片', cover_image: 'https://picsum.photos/seed/prod-h-035/300/300', price: 89.0, original_price: 119.0, sales: 3300, stock: 400, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['钙镁锌'], status: 'on_sale', created_at: '2024-03-25T00:00:00Z' },
    { product_id: 'prod-h-036', project_id: 'proj-health-01', store_id: 'store-h-003', name: '蛋白粉无糖 450g', cover_image: 'https://picsum.photos/seed/prod-h-036/300/300', price: 189.0, sales: 2800, stock: 250, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['无糖'], status: 'on_sale', created_at: '2024-03-26T00:00:00Z' },
    // 以下为项目级商品（无 store_id，归项目）
    { product_id: 'prod-h-037', project_id: 'proj-health-01', name: '健康礼包 维生素组合', cover_image: 'https://picsum.photos/seed/prod-h-037/300/300', price: 199.0, original_price: 279.0, sales: 2200, stock: 280, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['礼包'], status: 'on_sale', created_at: '2024-03-27T00:00:00Z' },
    { product_id: 'prod-h-038', project_id: 'proj-health-01', name: '营养礼包 鱼油套装', cover_image: 'https://picsum.photos/seed/prod-h-038/300/300', price: 259.0, sales: 1800, stock: 220, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['套装'], status: 'on_sale', created_at: '2024-03-27T00:00:00Z' },
    { product_id: 'prod-h-039', project_id: 'proj-health-01', name: '肠道礼包 益生菌3件', cover_image: 'https://picsum.photos/seed/prod-h-039/300/300', price: 299.0, original_price: 399.0, sales: 1500, stock: 200, category: '益生菌', marketing_category: 'mc-h-003', tags: ['礼包'], status: 'on_sale', created_at: '2024-03-28T00:00:00Z' },
    { product_id: 'prod-h-040', project_id: 'proj-health-01', name: '蛋白礼包 蛋白粉2罐', cover_image: 'https://picsum.photos/seed/prod-h-040/300/300', price: 319.0, sales: 1700, stock: 240, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['礼包'], status: 'on_sale', created_at: '2024-03-28T00:00:00Z' },
    { product_id: 'prod-h-041', project_id: 'proj-health-01', name: '维生素礼包 维C+维D', cover_image: 'https://picsum.photos/seed/prod-h-041/300/300', price: 119.0, original_price: 159.0, sales: 3400, stock: 400, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['热销'], status: 'on_sale', created_at: '2024-03-29T00:00:00Z' },
    { product_id: 'prod-h-042', project_id: 'proj-health-01', name: '鱼油礼包 3瓶组合', cover_image: 'https://picsum.photos/seed/prod-h-042/300/300', price: 399.0, original_price: 519.0, sales: 1900, stock: 200, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['套装'], status: 'on_sale', created_at: '2024-03-29T00:00:00Z' },
    { product_id: 'prod-h-043', project_id: 'proj-health-01', name: '益生菌礼包 4盒装', cover_image: 'https://picsum.photos/seed/prod-h-043/300/300', price: 499.0, sales: 1300, stock: 180, category: '益生菌', marketing_category: 'mc-h-003', tags: ['套装'], status: 'on_sale', created_at: '2024-03-30T00:00:00Z' },
    { product_id: 'prod-h-044', project_id: 'proj-health-01', name: '补钙礼包 钙片3瓶', cover_image: 'https://picsum.photos/seed/prod-h-044/300/300', price: 219.0, original_price: 289.0, sales: 2400, stock: 300, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['礼包'], status: 'on_sale', created_at: '2024-03-30T00:00:00Z' },
    { product_id: 'prod-h-045', project_id: 'proj-health-01', name: '营养礼包 综合维生素', cover_image: 'https://picsum.photos/seed/prod-h-045/300/300', price: 149.0, sales: 2900, stock: 380, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['综合'], status: 'on_sale', created_at: '2024-03-31T00:00:00Z' },
    { product_id: 'prod-h-046', project_id: 'proj-health-01', name: '美容礼包 胶原蛋白+维E', cover_image: 'https://picsum.photos/seed/prod-h-046/300/300', price: 299.0, original_price: 399.0, sales: 2100, stock: 250, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['美容'], status: 'on_sale', created_at: '2024-03-31T00:00:00Z' },
    { product_id: 'prod-h-047', project_id: 'proj-health-01', name: '儿童礼包 维生素AD+C', cover_image: 'https://picsum.photos/seed/prod-h-047/300/300', price: 159.0, sales: 2600, stock: 320, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['儿童'], status: 'on_sale', created_at: '2024-04-01T00:00:00Z' },
    { product_id: 'prod-h-048', project_id: 'proj-health-01', name: '中老年礼包 钙+鱼油', cover_image: 'https://picsum.photos/seed/prod-h-048/300/300', price: 349.0, original_price: 459.0, sales: 1800, stock: 220, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['中老年'], status: 'on_sale', created_at: '2024-04-01T00:00:00Z' },
    { product_id: 'prod-h-049', project_id: 'proj-health-01', name: '女士礼包 铁+叶酸+维C', cover_image: 'https://picsum.photos/seed/prod-h-049/300/300', price: 229.0, sales: 2300, stock: 280, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['女士'], status: 'on_sale', created_at: '2024-04-02T00:00:00Z' },
    { product_id: 'prod-h-050', project_id: 'proj-health-01', name: '孕期礼包 叶酸+益生菌', cover_image: 'https://picsum.photos/seed/prod-h-050/300/300', price: 269.0, original_price: 349.0, sales: 1500, stock: 200, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['孕妇'], status: 'on_sale', created_at: '2024-04-02T00:00:00Z' },
    { product_id: 'prod-h-051', project_id: 'proj-health-01', name: '综合健康礼包 5件套', cover_image: 'https://picsum.photos/seed/prod-h-051/300/300', price: 499.0, sales: 1100, stock: 150, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['套装'], status: 'on_sale', created_at: '2024-04-03T00:00:00Z' },
    { product_id: 'prod-h-052', project_id: 'proj-health-01', name: '心血管健康礼包 鱼油+辅酶', cover_image: 'https://picsum.photos/seed/prod-h-052/300/300', price: 399.0, original_price: 529.0, sales: 1700, stock: 220, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['心血管'], status: 'on_sale', created_at: '2024-04-03T00:00:00Z' },
    { product_id: 'prod-h-053', project_id: 'proj-health-01', name: '骨骼健康礼包 钙+维D', cover_image: 'https://picsum.photos/seed/prod-h-053/300/300', price: 179.0, sales: 2500, stock: 320, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['骨骼'], status: 'on_sale', created_at: '2024-04-04T00:00:00Z' },
    { product_id: 'prod-h-054', project_id: 'proj-health-01', name: '免疫健康礼包 维C+锌', cover_image: 'https://picsum.photos/seed/prod-h-054/300/300', price: 129.0, original_price: 169.0, sales: 3100, stock: 380, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['免疫'], status: 'on_sale', created_at: '2024-04-04T00:00:00Z' },
    { product_id: 'prod-h-055', project_id: 'proj-health-01', name: '能量礼包 维B+铁', cover_image: 'https://picsum.photos/seed/prod-h-055/300/300', price: 139.0, sales: 2000, stock: 260, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['能量'], status: 'on_sale', created_at: '2024-04-05T00:00:00Z' },
    { product_id: 'prod-h-056', project_id: 'proj-health-01', name: '健康礼盒 8件尊享装', cover_image: 'https://picsum.photos/seed/prod-h-056/300/300', price: 699.0, original_price: 899.0, sales: 800, stock: 120, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['热销', '礼品'], status: 'on_sale', created_at: '2024-04-05T00:00:00Z' },
    { product_id: 'prod-h-057', project_id: 'proj-health-01', name: '全家营养礼包 6件套', cover_image: 'https://picsum.photos/seed/prod-h-057/300/300', price: 599.0, sales: 1000, stock: 150, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['全家'], status: 'on_sale', created_at: '2024-04-06T00:00:00Z' },
    { product_id: 'prod-h-058', project_id: 'proj-health-01', name: '日常保健礼包 4件套', cover_image: 'https://picsum.photos/seed/prod-h-058/300/300', price: 299.0, original_price: 399.0, sales: 1600, stock: 240, category: '维生素矿物质', marketing_category: 'mc-h-001', tags: ['日常'], status: 'on_sale', created_at: '2024-04-06T00:00:00Z' },
    { product_id: 'prod-h-059', project_id: 'proj-health-01', name: '活力礼包 蛋白+维B', cover_image: 'https://picsum.photos/seed/prod-h-059/300/300', price: 259.0, sales: 1900, stock: 280, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['活力'], status: 'on_sale', created_at: '2024-04-07T00:00:00Z' },
    { product_id: 'prod-h-060', project_id: 'proj-health-01', name: '健康尊享礼包 10件套', cover_image: 'https://picsum.photos/seed/prod-h-060/300/300', price: 999.0, original_price: 1299.0, sales: 600, stock: 100, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['热销'], status: 'on_sale', created_at: '2024-04-07T00:00:00Z' },
    { product_id: 'prod-h-061', project_id: 'proj-health-01', name: '调节三高礼包 鱼油+卵磷脂', cover_image: 'https://picsum.photos/seed/prod-h-061/300/300', price: 459.0, sales: 1400, stock: 200, category: '鱼油EPA', marketing_category: 'mc-h-002', tags: ['三高'], status: 'on_sale', created_at: '2024-04-08T00:00:00Z' },
    { product_id: 'prod-h-062', project_id: 'proj-health-01', name: '美容养颜礼包 胶原+维E', cover_image: 'https://picsum.photos/seed/prod-h-062/300/300', price: 399.0, original_price: 529.0, sales: 1700, stock: 230, category: '蛋白营养', marketing_category: 'mc-h-004', tags: ['美容'], status: 'on_sale', created_at: '2024-04-08T00:00:00Z' },
    { product_id: 'prod-h-101', project_id: 'proj-health-02', store_id: 'store-h-101', name: '燕窝礼盒 30g/盒', cover_image: 'https://picsum.photos/seed/prod-h-101/300/300', price: 499.0, original_price: 699.0, sales: 1800, stock: 80, category: '滋补养生', marketing_category: 'mc-h-101', tags: ['礼品', '热销'], status: 'on_sale', created_at: '2024-04-10T00:00:00Z' },
    { product_id: 'prod-h-102', project_id: 'proj-health-02', store_id: 'store-h-101', name: '西洋参片 50g/罐', cover_image: 'https://picsum.photos/seed/prod-h-102/300/300', price: 268.0, sales: 2400, stock: 120, category: '滋补养生', marketing_category: 'mc-h-101', tags: ['提神'], status: 'on_sale', created_at: '2024-04-10T00:00:00Z' },
    { product_id: 'prod-h-103', project_id: 'proj-health-02', store_id: 'store-h-102', name: '枸杞原浆 30ml×30袋', cover_image: 'https://picsum.photos/seed/prod-h-103/300/300', price: 138.0, original_price: 188.0, sales: 5200, stock: 300, category: '滋补养生', marketing_category: 'mc-h-101', tags: ['热销', '原浆'], status: 'on_sale', created_at: '2024-04-11T00:00:00Z' },
  ],
  liveRooms: [
    { live_id: 'live-001', project_id: 'proj-daily-01', store_id: 'store-d-001', title: '【春季好物】日用品专场 限时5折', cover_image: 'https://picsum.photos/seed/live-001/400/300', anchor_name: '优选主播小美', anchor_type: 'store', viewer_count: 12500, status: 'live', started_at: '2025-08-07T14:00:00Z', product_ids: ['prod-d-001', 'prod-d-002', 'prod-d-004'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-002', project_id: 'proj-daily-01', store_id: 'store-d-002', title: '厨房好物分享 抽纸洗碗布特惠', cover_image: 'https://picsum.photos/seed/live-002/400/300', anchor_name: '清洁达人老张', anchor_type: 'store', viewer_count: 8600, status: 'live', started_at: '2025-08-07T15:30:00Z', product_ids: ['prod-d-003', 'prod-d-005'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    // v3.1.32 补充 mock 直播（proj-daily-01，验证"最多4个"限制，覆盖各种状态/主播类型）
    { live_id: 'live-006', project_id: 'proj-daily-01', store_id: 'store-d-001', title: '【限时特惠】纸品囤货专场 满99减20', cover_image: 'https://picsum.photos/seed/live-006/400/300', anchor_name: '优选主播小美', anchor_type: 'store', viewer_count: 5800, status: 'live', started_at: '2025-08-08T10:00:00Z', product_ids: ['prod-d-001', 'prod-d-007', 'prod-d-016'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-007', project_id: 'proj-daily-01', store_id: 'store-d-002', title: '清洁大作战 洗衣液+柔顺剂专场', cover_image: 'https://picsum.photos/seed/live-007/400/300', anchor_name: '清洁达人老张', anchor_type: 'store', viewer_count: 3200, status: 'upcoming', started_at: '2025-08-09T14:00:00Z', product_ids: ['prod-d-010', 'prod-d-030'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-008', project_id: 'proj-daily-01', store_id: 'store-d-003', title: '收纳达人分享 家居整理好物', cover_image: 'https://picsum.photos/seed/live-008/400/300', anchor_name: '收纳专家小林', anchor_type: 'store', viewer_count: 4100, status: 'replay', started_at: '2025-08-06T16:00:00Z', ended_at: '2025-08-06T17:30:00Z', replay_url: 'https://picsum.photos/seed/live-replay-008/400/300', product_ids: ['prod-d-031', 'prod-d-039'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-009', project_id: 'proj-daily-01', store_id: 'store-d-001', title: '【总部直供】日用百货专场 精选好物', cover_image: 'https://picsum.photos/seed/live-009/400/300', anchor_name: '总部主播小王', anchor_type: 'headquarters', viewer_count: 9200, status: 'replay', started_at: '2025-08-05T19:00:00Z', ended_at: '2025-08-05T21:00:00Z', replay_url: 'https://picsum.photos/seed/live-replay-009/400/300', product_ids: ['prod-d-002', 'prod-d-009'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-010', project_id: 'proj-daily-01', store_id: 'store-d-002', title: '保温杯水杯专场 好物推荐', cover_image: 'https://picsum.photos/seed/live-010/400/300', anchor_name: '生活达人小李', anchor_type: 'store', viewer_count: 2800, status: 'ended', started_at: '2025-08-04T14:00:00Z', ended_at: '2025-08-04T15:30:00Z', product_ids: ['prod-d-004', 'prod-d-023'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-003', project_id: 'proj-health-01', store_id: 'store-h-001', title: '营养专家直播：维生素怎么补？', cover_image: 'https://picsum.photos/seed/live-003/400/300', anchor_name: '营养师李博士', anchor_type: 'headquarters', viewer_count: 15300, status: 'live', started_at: '2025-08-07T13:00:00Z', product_ids: ['prod-h-001', 'prod-h-002', 'prod-h-004'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-004', project_id: 'proj-health-01', store_id: 'store-h-002', title: '益生菌专场 肠道健康大讲堂', cover_image: 'https://picsum.photos/seed/live-004/400/300', anchor_name: '健康主播Anna', anchor_type: 'personal', viewer_count: 6800, status: 'replay', started_at: '2025-08-06T19:00:00Z', ended_at: '2025-08-06T21:00:00Z', replay_url: 'https://picsum.photos/seed/live-replay-004/400/300', product_ids: ['prod-h-003', 'prod-h-005'], visibility_config: { mode: 'include', excluded_inviter_ids: [], included_inviter_ids: ['inv-006', 'inv-007'], excluded_store_ids: [], excluded_project_ids: [] } },
    // v3.1.32 补充 mock 直播（proj-health-01，验证"最多4个"限制，覆盖各种状态/主播类型）
    { live_id: 'live-011', project_id: 'proj-health-01', store_id: 'store-h-001', title: '维生素专场 每日营养补充指南', cover_image: 'https://picsum.photos/seed/live-011/400/300', anchor_name: '营养师李博士', anchor_type: 'headquarters', viewer_count: 11200, status: 'live', started_at: '2025-08-08T09:30:00Z', product_ids: ['prod-h-006', 'prod-h-007', 'prod-h-010'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-012', project_id: 'proj-health-01', store_id: 'store-h-002', title: '鱼油专场 深海Omega-3科普', cover_image: 'https://picsum.photos/seed/live-012/400/300', anchor_name: '健康主播Anna', anchor_type: 'personal', viewer_count: 5400, status: 'live', started_at: '2025-08-08T11:00:00Z', product_ids: ['prod-h-008', 'prod-h-009', 'prod-h-020'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-013', project_id: 'proj-health-01', store_id: 'store-h-003', title: '蛋白粉专场 健身增肌营养课', cover_image: 'https://picsum.photos/seed/live-013/400/300', anchor_name: '健身教练大刘', anchor_type: 'store', viewer_count: 7600, status: 'upcoming', started_at: '2025-08-09T19:00:00Z', product_ids: ['prod-h-016', 'prod-h-026', 'prod-h-030'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-014', project_id: 'proj-health-01', store_id: 'store-h-001', title: '中老年补钙专场 骨骼健康讲座', cover_image: 'https://picsum.photos/seed/live-014/400/300', anchor_name: '骨科专家陈教授', anchor_type: 'supplier', viewer_count: 4300, status: 'replay', started_at: '2025-08-05T15:00:00Z', ended_at: '2025-08-05T16:30:00Z', replay_url: 'https://picsum.photos/seed/live-replay-014/400/300', product_ids: ['prod-h-004', 'prod-h-023', 'prod-h-035'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-015', project_id: 'proj-health-01', store_id: 'store-h-002', title: '美容营养专场 胶原蛋白+维生素E', cover_image: 'https://picsum.photos/seed/live-015/400/300', anchor_name: '美容营养师Cici', anchor_type: 'personal', viewer_count: 6100, status: 'ended', started_at: '2025-08-04T20:00:00Z', ended_at: '2025-08-04T21:30:00Z', product_ids: ['prod-h-025', 'prod-h-046'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-005', project_id: 'proj-health-02', store_id: 'store-h-101', title: '滋补养生好物推荐 礼盒装特惠', cover_image: 'https://picsum.photos/seed/live-005/400/300', anchor_name: '滋补专家王老师', anchor_type: 'supplier', viewer_count: 4200, status: 'upcoming', started_at: '2025-08-07T20:00:00Z', product_ids: ['prod-h-101', 'prod-h-102'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    // v3.1.36 补充 mock 直播（proj-health-02，验证 BR-SHP-041 默认规则排序 + 前4条限制，覆盖各种状态）
    { live_id: 'live-016', project_id: 'proj-health-02', store_id: 'store-h-101', title: '燕窝滋补专场 孕期营养精选', cover_image: 'https://picsum.photos/seed/live-016/400/300', anchor_name: '滋补专家王老师', anchor_type: 'supplier', viewer_count: 3800, status: 'live', started_at: '2025-08-08T10:00:00Z', product_ids: ['prod-h-101', 'prod-h-103'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-017', project_id: 'proj-health-02', store_id: 'store-h-102', title: '人参鹿茸专场 高端滋补品鉴', cover_image: 'https://picsum.photos/seed/live-017/400/300', anchor_name: '滋补顾问刘老师', anchor_type: 'store', viewer_count: 2500, status: 'live', started_at: '2025-08-08T14:30:00Z', product_ids: ['prod-h-102', 'prod-h-104'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-018', project_id: 'proj-health-02', store_id: 'store-h-101', title: '阿胶糕制作专场 补血养颜', cover_image: 'https://picsum.photos/seed/live-018/400/300', anchor_name: '滋补专家王老师', anchor_type: 'supplier', viewer_count: 5100, status: 'replay', started_at: '2025-08-06T15:00:00Z', ended_at: '2025-08-06T16:30:00Z', replay_url: 'https://picsum.photos/seed/live-replay-018/400/300', product_ids: ['prod-h-103', 'prod-h-105'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-019', project_id: 'proj-health-02', store_id: 'store-h-102', title: '虫草精华专场 免疫力提升', cover_image: 'https://picsum.photos/seed/live-019/400/300', anchor_name: '滋补顾问刘老师', anchor_type: 'store', viewer_count: 3200, status: 'upcoming', started_at: '2025-08-09T19:00:00Z', product_ids: ['prod-h-104', 'prod-h-105'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
    { live_id: 'live-020', project_id: 'proj-health-02', store_id: 'store-h-101', title: '灵芝孢子粉专场 养生安神', cover_image: 'https://picsum.photos/seed/live-020/400/300', anchor_name: '滋补专家王老师', anchor_type: 'supplier', viewer_count: 4600, status: 'replay', started_at: '2025-08-05T19:00:00Z', ended_at: '2025-08-05T20:30:00Z', replay_url: 'https://picsum.photos/seed/live-replay-020/400/300', product_ids: ['prod-h-101', 'prod-h-105'], visibility_config: { mode: 'public', excluded_inviter_ids: [], included_inviter_ids: [], excluded_store_ids: [], excluded_project_ids: [] } },
  ],
  memberLevelConfigs: [
    { level_id: 'lvl-d-01-1', project_id: 'proj-daily-01', level: 'bronze', name: '青铜会员', points_threshold: 0, discount: 1, privileges: ['基础积分', '生日关怀'], icon: '🥉', sort: 1 },
    { level_id: 'lvl-d-01-2', project_id: 'proj-daily-01', level: 'silver', name: '白银会员', points_threshold: 500, discount: 0.98, privileges: ['基础积分', '生日关怀', '专属优惠券'], icon: '🥈', sort: 2 },
    { level_id: 'lvl-d-01-3', project_id: 'proj-daily-01', level: 'gold', name: '黄金会员', points_threshold: 2000, discount: 0.95, privileges: ['双倍积分', '生日关怀', '专属优惠券', '优先客服'], icon: '🥇', sort: 3 },
    { level_id: 'lvl-h-01-1', project_id: 'proj-health-01', level: 'bronze', name: '健康青铜', points_threshold: 0, discount: 1, privileges: ['基础积分', '健康咨询'], icon: '🥉', sort: 1 },
    { level_id: 'lvl-h-01-2', project_id: 'proj-health-01', level: 'gold', name: '健康黄金', points_threshold: 1000, discount: 0.95, privileges: ['1.5倍积分', '健康咨询', '营养师咨询1次/月'], icon: '🥇', sort: 2 },
    { level_id: 'lvl-h-01-3', project_id: 'proj-health-01', level: 'platinum', name: '健康铂金', points_threshold: 5000, discount: 0.9, privileges: ['2倍积分', '健康咨询', '营养师咨询4次/月', '专属客服'], icon: '💎', sort: 3 },
  ],
  projectHomeConfigs: [
    {
      config_id: 'cfg-d-01', project_id: 'proj-daily-01',
      banner_images: [
        { id: 'b1', image: 'https://picsum.photos/seed/banner-d-01-1/750/300', title: '门店好物', jump_type: 'function_page', jump_id: 'fp-project-stores', jump_target: '/app/project/proj-daily-01/stores', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/stores', sort: 1, sort_order: 1, enabled: true, status: 'active' },
        { id: 'b2', image: 'https://picsum.photos/seed/banner-d-01-2/750/300', title: '每日精选', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-daily-01/mall', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/mall', sort: 2, sort_order: 2, enabled: true, status: 'active' },
        { id: 'b3', image: 'https://picsum.photos/seed/banner-d-01-3/750/300', title: '热卖推荐', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-daily-01/mall', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/mall', sort: 3, sort_order: 3, enabled: true, status: 'active' },
      ],
      quick_entries: [
        { id: 'q1', name: '全部商品', icon: '📦', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-daily-01/mall', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/mall', sort: 1, sort_order: 1, enabled: true, status: 'active' },
        { id: 'q2', name: '优惠券', icon: '🎫', jump_type: 'function_page', jump_id: 'fp-project-coupons', jump_target: '/app/project/proj-daily-01/coupons', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/coupons', sort: 2, sort_order: 2, enabled: true, status: 'active' },
        { id: 'q3', name: '会员中心', icon: '👑', jump_type: 'function_page', jump_id: 'fp-project-member', jump_target: '/app/project/proj-daily-01/member', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/member', sort: 3, sort_order: 3, enabled: true, status: 'active' },
        { id: 'q4', name: '附近门店', icon: '📍', jump_type: 'function_page', jump_id: 'fp-project-stores', jump_target: '/app/project/proj-daily-01/stores', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/stores', sort: 4, sort_order: 4, enabled: true, status: 'active' },
        { id: 'q5', name: '热卖排行', icon: '🔥', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-daily-01/mall', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/mall', sort: 5, sort_order: 5, enabled: true, status: 'active' },
        { id: 'q6', name: '新品首发', icon: '✨', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-daily-01/mall', project_id_ref: 'proj-daily-01', link: '/app/project/proj-daily-01/mall', sort: 6, sort_order: 6, enabled: true, status: 'active' },
      ],
      recommend_products: [],
      live_recommend: [],
      notice: '欢迎光临日用百货优选，新人首单立减10元！',
      updated_at: '2025-08-01T00:00:00Z',
    },
    {
      config_id: 'cfg-h-01', project_id: 'proj-health-01',
      banner_images: [
        { id: 'b1', image: 'https://picsum.photos/seed/banner-h-01-1/750/300', title: '健康好物', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-health-01/mall', project_id_ref: 'proj-health-01', link: '/app/project/proj-health-01/mall', sort: 1, sort_order: 1, enabled: true, status: 'active' },
        { id: 'b2', image: 'https://picsum.photos/seed/banner-h-01-2/750/300', title: '营养推荐', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-health-01/mall', project_id_ref: 'proj-health-01', link: '/app/project/proj-health-01/mall', sort: 2, sort_order: 2, enabled: true, status: 'active' },
      ],
      quick_entries: [
        { id: 'q1', name: '维生素', icon: '💊', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-health-01/mall', project_id_ref: 'proj-health-01', link: '/app/project/proj-health-01/mall', sort: 1, sort_order: 1, enabled: true, status: 'active' },
        { id: 'q2', name: '益生菌', icon: '🦠', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-health-01/mall', project_id_ref: 'proj-health-01', link: '/app/project/proj-health-01/mall', sort: 2, sort_order: 2, enabled: true, status: 'active' },
        { id: 'q3', name: '鱼油', icon: '🐟', jump_type: 'function_page', jump_id: 'fp-project-mall', jump_target: '/app/project/proj-health-01/mall', project_id_ref: 'proj-health-01', link: '/app/project/proj-health-01/mall', sort: 3, sort_order: 3, enabled: true, status: 'active' },
        { id: 'q4', name: '会员中心', icon: '👑', jump_type: 'function_page', jump_id: 'fp-project-member', jump_target: '/app/project/proj-health-01/member', project_id_ref: 'proj-health-01', link: '/app/project/proj-health-01/member', sort: 4, sort_order: 4, enabled: true, status: 'active' },
        { id: 'q5', name: '附近门店', icon: '📍', jump_type: 'function_page', jump_id: 'fp-project-stores', jump_target: '/app/project/proj-health-01/stores', project_id_ref: 'proj-health-01', link: '/app/project/proj-health-01/stores', sort: 5, sort_order: 5, enabled: true, status: 'active' },
        { id: 'q6', name: '营养直播', icon: '📺', jump_type: 'live', jump_id: 'live-003', jump_target: 'live-003', project_id_ref: 'proj-health-01', link: '/app/live/live-003', sort: 6, sort_order: 6, enabled: true, status: 'active' },
      ],
      recommend_products: [],
      live_recommend: [],
      notice: '健康补给站，专业营养师在线直播解答',
      updated_at: '2025-08-02T00:00:00Z',
    },
  ],
  marketingCategories: [
    { category_id: 'mc-d-001', project_id: 'proj-daily-01', name: '纸品湿巾', icon: '🧻', sort_order: 0, status: 'active', created_at: '2024-02-01T00:00:00Z' },
    { category_id: 'mc-d-002', project_id: 'proj-daily-01', name: '清洁用品', icon: '🧴', sort_order: 1, status: 'active', created_at: '2024-02-01T00:00:00Z' },
    { category_id: 'mc-d-003', project_id: 'proj-daily-01', name: '水杯餐具', icon: '🥤', sort_order: 2, status: 'active', created_at: '2024-02-01T00:00:00Z' },
    { category_id: 'mc-d-004', project_id: 'proj-daily-01', name: '家纺', icon: '🧺', sort_order: 3, status: 'active', created_at: '2024-02-01T00:00:00Z' },
    { category_id: 'mc-d-101', project_id: 'proj-daily-02', name: '清洁剂', icon: '🧹', sort_order: 0, status: 'active', created_at: '2024-02-10T00:00:00Z' },
    { category_id: 'mc-h-001', project_id: 'proj-health-01', name: '维生素矿物质', icon: '💊', sort_order: 0, status: 'active', created_at: '2024-03-01T00:00:00Z' },
    { category_id: 'mc-h-002', project_id: 'proj-health-01', name: '鱼油EPA', icon: '🐟', sort_order: 1, status: 'active', created_at: '2024-03-01T00:00:00Z' },
    { category_id: 'mc-h-003', project_id: 'proj-health-01', name: '益生菌', icon: '🦠', sort_order: 2, status: 'active', created_at: '2024-03-01T00:00:00Z' },
    { category_id: 'mc-h-004', project_id: 'proj-health-01', name: '蛋白营养', icon: '🥛', sort_order: 3, status: 'active', created_at: '2024-03-01T00:00:00Z' },
    { category_id: 'mc-h-101', project_id: 'proj-health-02', name: '滋补养生', icon: '🍯', sort_order: 0, status: 'active', created_at: '2024-04-05T00:00:00Z' },
  ],
  coupons: [
    { coupon_id: 'coupon-d-001', project_id: 'proj-daily-01', user_id: 'user-001', title: '满200减10', type: 'full_reduction', status: 'unused', amount: 10, threshold: 200, valid_end: '2025-12-31', tag: '通用券', description: '全场满200元可用' },
    { coupon_id: 'coupon-d-002', project_id: 'proj-daily-01', user_id: 'user-001', title: '9折优惠券', type: 'discount', status: 'unused', amount: 0, threshold: 0, discount: 0.9, valid_end: '2025-12-31', tag: '会员专享', description: '订单享9折' },
    { coupon_id: 'coupon-d-003', project_id: 'proj-daily-01', user_id: 'user-001', title: '满99减5', type: 'full_reduction', status: 'expired', amount: 5, threshold: 99, valid_end: '2025-07-31', tag: '新人券', description: '新人首单可用' },
    { coupon_id: 'coupon-h-001', project_id: 'proj-health-01', user_id: 'user-001', title: '满300减30', type: 'full_reduction', status: 'unused', amount: 30, threshold: 300, valid_end: '2025-12-31', tag: '健康券', description: '保健品专享' },
    { coupon_id: 'coupon-h-002', project_id: 'proj-health-01', user_id: 'user-001', title: '维生素兑换券', type: 'exchange', status: 'unused', amount: 0, threshold: 0, valid_end: '2025-10-31', tag: '积分兑换', description: '可兑换指定维生素1瓶' },
  ],
  signInStates: [
    { project_id: 'proj-daily-01', user_id: 'user-001', month_sign_days: 5, week_signed: ['2025-08-04', '2025-08-05', '2025-08-06', '2025-08-07'], last_sign_date: '2025-08-07', total_sign_days: 28, week_start_date: '2025-08-04', week_rewards: [2, 2, 2, 5, 2, 5, 10], continuous_reward: 20 },
    { project_id: 'proj-health-01', user_id: 'user-001', month_sign_days: 3, week_signed: ['2025-08-06', '2025-08-07'], last_sign_date: '2025-08-07', total_sign_days: 15, week_start_date: '2025-08-04', week_rewards: [2, 2, 2, 5, 2, 5, 10], continuous_reward: 20 },
    { project_id: 'proj-health-02', user_id: 'user-001', month_sign_days: 0, week_signed: [], total_sign_days: 0, week_start_date: '2025-08-04', week_rewards: [2, 2, 2, 5, 2, 5, 10], continuous_reward: 20 },
  ],
  // v3.1.30 新增：邀请人/店长/店员 mock数据
  inviters: [
    { inviter_id: 'inv-001', store_id: 'store-d-001', project_id: 'proj-daily-01', name: '王经理', phone: '010-88880001', role: 'manager', status: 'active', invited_count: 36, created_at: '2024-02-05T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-02-05T00:00:00Z' },
    { inviter_id: 'inv-002', store_id: 'store-d-002', project_id: 'proj-daily-01', name: '李店长', phone: '010-88880002', role: 'manager', status: 'active', invited_count: 24, created_at: '2024-02-06T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-02-06T00:00:00Z' },
    { inviter_id: 'inv-003', store_id: 'store-d-003', project_id: 'proj-daily-01', name: '张负责人', phone: '010-88880003', role: 'staff', status: 'active', invited_count: 12, created_at: '2024-02-07T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-02-07T00:00:00Z' },
    { inviter_id: 'inv-004', store_id: 'store-d-101', project_id: 'proj-daily-02', name: '赵经理', phone: '010-88881001', role: 'manager', status: 'active', invited_count: 18, created_at: '2024-02-12T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-02-12T00:00:00Z' },
    { inviter_id: 'inv-005', store_id: 'store-d-102', project_id: 'proj-daily-02', name: '孙店长', phone: '010-88881002', role: 'manager', status: 'active', invited_count: 8, created_at: '2024-02-13T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-02-13T00:00:00Z' },
    { inviter_id: 'inv-006', store_id: 'store-h-001', project_id: 'proj-health-01', name: '周经理', phone: '010-88882001', role: 'manager', status: 'active', invited_count: 42, created_at: '2024-03-05T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-03-05T00:00:00Z' },
    { inviter_id: 'inv-007', store_id: 'store-h-002', project_id: 'proj-health-01', name: '吴店长', phone: '010-88882002', role: 'manager', status: 'active', invited_count: 30, created_at: '2024-03-06T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-03-06T00:00:00Z' },
    { inviter_id: 'inv-008', store_id: 'store-h-003', project_id: 'proj-health-01', name: '郑负责人', phone: '010-88882003', role: 'staff', status: 'active', invited_count: 6, created_at: '2024-03-07T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-03-07T00:00:00Z' },
    { inviter_id: 'inv-009', store_id: 'store-h-101', project_id: 'proj-health-02', name: '钱经理', phone: '010-88883001', role: 'manager', status: 'active', invited_count: 15, created_at: '2024-04-08T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-04-08T00:00:00Z' },
    { inviter_id: 'inv-010', store_id: 'store-h-102', project_id: 'proj-health-02', name: '冯店长', phone: '010-88883002', role: 'manager', status: 'active', invited_count: 10, created_at: '2024-04-09T00:00:00Z', updated_by: '租户管理员', updated_at: '2024-04-09T00:00:00Z' },
  ],
};

// ============================================
// Store
// ============================================

export const useProjectStore = defineStore('project', () => {
  const saved = dataService.loadProjectData(DEFAULT_DATA);

  // ============================================
  // 状态
  // ============================================

  const tenants = ref<Tenant[]>(saved.tenants as any);
  const projects = ref<Project[]>(saved.projects as any);
  const stores = ref<Store[]>(saved.stores as any);
  const products = ref<Product[]>(saved.products as any);
  const liveRooms = ref<LiveRoom[]>(saved.liveRooms as any);
  // 数据迁移：旧版 liveRooms 可能缺少 anchor_type 字段，补充默认值 personal
  (liveRooms.value as any[]).forEach(l => {
    if (!l.anchor_type) l.anchor_type = 'personal';
    // v3.1.30 新增：旧版 liveRooms 可能缺少 visibility_config 字段，补充默认 public
    if (!l.visibility_config) {
      l.visibility_config = {
        mode: 'public',
        excluded_inviter_ids: [],
        included_inviter_ids: [],
        excluded_store_ids: [],
        excluded_project_ids: [],
      };
    }
  });
  const memberLevelConfigs = ref<MemberLevelConfig[]>(saved.memberLevelConfigs as any);
  const projectHomeConfigs = ref<ProjectHomeConfig[]>(saved.projectHomeConfigs as any);
  const marketingCategories = ref<MarketingCategory[]>(saved.marketingCategories || (DEFAULT_DATA.marketingCategories as any) || []);
  const coupons = ref<Coupon[]>((saved as any).coupons || (DEFAULT_DATA.coupons as any) || []);
  const signInStates = ref<SignInState[]>((saved as any).signInStates || (DEFAULT_DATA.signInStates as any) || []);
  // v3.1.30 新增：邀请人/店长/店员
  const inviters = ref<Inviter[]>((saved as any).inviters || (DEFAULT_DATA.inviters as any) || []);

  // ============================================
  // 计算属性
  // ============================================

  // v3.1.37 新增：项目状态过滤 — 仅返回 status=active 的项目
  const activeProjects = computed(() => projects.value.filter(p => p.status === 'active'));
  // active 项目 ID 集合（Set，O(1) 查找）
  const activeProjectIds = computed(() => new Set(activeProjects.value.map(p => p.project_id)));
  // 检查单个项目是否 active
  function isProjectActive(projectId: string): boolean {
    return activeProjectIds.value.has(projectId);
  }

  const projectsByCategory = computed(() => (category?: 'daily' | 'health') => {
    if (!category) return projects.value;
    return projects.value.filter(p => p.category === category);
  });

  const storesByProject = computed(() => (projectId: string) =>
    stores.value.filter(s => s.project_id === projectId)
  );

  const productsByProject = computed(() => (projectId: string) =>
    products.value.filter(p => p.project_id === projectId)
  );

  const storeProducts = computed(() => (storeId: string) =>
    products.value.filter(p => p.store_id === storeId)
  );

  const livesByProject = computed(() => (projectId: string) =>
    liveRooms.value.filter(l => l.project_id === projectId)
  );

  // 某门店下的直播（用于门店卡片推荐直播展示）
  const livesByStore = computed(() => (storeId: string) =>
    liveRooms.value.filter(l => l.store_id === storeId)
  );

  const memberLevelsByProject = computed(() => (projectId: string) =>
    memberLevelConfigs.value.filter(l => l.project_id === projectId).sort((a, b) => a.sort - b.sort)
  );

  const homeConfigByProject = computed(() => (projectId: string) =>
    projectHomeConfigs.value.find(c => c.project_id === projectId)
  );

  const getProjectById = computed(() => (projectId: string) =>
    projects.value.find(p => p.project_id === projectId)
  );

  const getStoreById = computed(() => (storeId: string) =>
    stores.value.find(s => s.store_id === storeId)
  );

  const getProductById = computed(() => (productId: string) =>
    products.value.find(p => p.product_id === productId)
  );

  const getLiveById = computed(() => (liveId: string) =>
    liveRooms.value.find(l => l.live_id === liveId)
  );

  const marketingCategoriesByProject = computed(() => (projectId: string) =>
    marketingCategories.value
      .filter(c => c.project_id === projectId && c.status === 'active')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );

  const couponsByProject = computed(() => (projectId: string) =>
    coupons.value.filter(c => c.project_id === projectId)
  );

  const couponsByProjectUser = computed(() => (projectId: string, userId: string) =>
    coupons.value.filter(c => c.project_id === projectId && c.user_id === userId)
  );

  const signInStateByProjectUser = computed(() => (projectId: string, userId: string) =>
    signInStates.value.find(s => s.project_id === projectId && s.user_id === userId)
  );

  // v3.1.30 新增：邀请人相关计算属性
  /** 按项目查询邀请人列表 */
  const invitersByProject = computed(() => (projectId: string) =>
    inviters.value.filter(i => i.project_id === projectId)
  );

  /** 按门店查询邀请人列表 */
  const invitersByStore = computed(() => (storeId: string) =>
    inviters.value.filter(i => i.store_id === storeId)
  );

  /** 按邀请人ID查询 */
  const getInviterById = computed(() => (inviterId: string) =>
    inviters.value.find(i => i.inviter_id === inviterId)
  );

  /** 按门店查询店长 */
  const managerByStore = computed(() => (storeId: string) =>
    inviters.value.find(i => i.store_id === storeId && i.role === 'manager' && i.status === 'active')
  );

  // ============================================
  // 操作
  // ============================================

  function addProject(project: Project) { projects.value.push(project); }
  function updateProject(projectId: string, data: Partial<Project>) {
    const idx = projects.value.findIndex(p => p.project_id === projectId);
    if (idx >= 0) Object.assign(projects.value[idx], data);
  }
  function deleteProject(projectId: string) {
    const idx = projects.value.findIndex(p => p.project_id === projectId);
    if (idx >= 0) projects.value.splice(idx, 1);
  }

  function addStore(store: Store) { stores.value.push(store); }
  function updateStore(storeId: string, data: Partial<Store>) {
    const idx = stores.value.findIndex(s => s.store_id === storeId);
    if (idx >= 0) Object.assign(stores.value[idx], data);
  }
  function deleteStore(storeId: string) {
    const idx = stores.value.findIndex(s => s.store_id === storeId);
    if (idx >= 0) stores.value.splice(idx, 1);
  }

  function addProduct(product: Product) { products.value.push(product); }
  function updateProduct(productId: string, data: Partial<Product>) {
    const idx = products.value.findIndex(p => p.product_id === productId);
    if (idx >= 0) Object.assign(products.value[idx], data);
  }

  function updateHomeConfig(projectId: string, config: Partial<ProjectHomeConfig>) {
    const idx = projectHomeConfigs.value.findIndex(c => c.project_id === projectId);
    if (idx >= 0) Object.assign(projectHomeConfigs.value[idx], config, { updated_at: new Date().toISOString() });
  }

  /** 确保项目首页配置存在（不存在则创建空配置），返回当前配置 */
  function ensureHomeConfig(projectId: string): ProjectHomeConfig {
    let cfg = projectHomeConfigs.value.find(c => c.project_id === projectId);
    if (!cfg) {
      cfg = {
        config_id: `cfg-${Date.now()}`,
        project_id: projectId,
        banner_images: [],
        quick_entries: [],
        recommend_products: [],
        live_recommend: [],
        notice: '',
        updated_at: new Date().toISOString(),
      };
      projectHomeConfigs.value.push(cfg);
    }
    return cfg;
  }

  function addMemberLevel(level: MemberLevelConfig) { memberLevelConfigs.value.push(level); }

  function addMarketingCategory(cat: MarketingCategory) { marketingCategories.value.push(cat); }
  function updateMarketingCategory(categoryId: string, data: Partial<MarketingCategory>) {
    const idx = marketingCategories.value.findIndex(c => c.category_id === categoryId);
    if (idx >= 0) Object.assign(marketingCategories.value[idx], data);
  }
  function deleteMarketingCategory(categoryId: string) {
    const idx = marketingCategories.value.findIndex(c => c.category_id === categoryId);
    if (idx >= 0) marketingCategories.value.splice(idx, 1);
  }

  // v3.1.30 新增：邀请人/店长/店员 CRUD
  function addInviter(inviter: Inviter) { inviters.value.push(inviter); }
  function updateInviter(inviterId: string, data: Partial<Inviter>) {
    const idx = inviters.value.findIndex(i => i.inviter_id === inviterId);
    if (idx >= 0) Object.assign(inviters.value[idx], data);
  }
  function deleteInviter(inviterId: string) {
    const idx = inviters.value.findIndex(i => i.inviter_id === inviterId);
    if (idx >= 0) inviters.value.splice(idx, 1);
  }
  /** 获取门店的店长姓名（用于门店卡片显示） */
  function getManagerNameByStore(storeId: string): string {
    return managerByStore.value(storeId)?.name || '';
  }

  /** 签到：更新签到状态并返回获得的积分 */
  function doSignIn(projectId: string, userId: string): number {
    let state = signInStates.value.find(s => s.project_id === projectId && s.user_id === userId);
    const today = new Date().toISOString().slice(0, 10);
    if (!state) {
      state = {
        project_id: projectId,
        user_id: userId,
        month_sign_days: 0,
        week_signed: [],
        total_sign_days: 0,
        week_start_date: today,
        week_rewards: [2, 2, 2, 5, 2, 5, 10],
        continuous_reward: 20,
      };
      signInStates.value.push(state);
    }
    if (state.last_sign_date === today) return 0; // 今日已签
    const rewards = state.week_rewards || [2, 2, 2, 5, 2, 5, 10];
    const dayIndex = state.week_signed.length % 7;
    const earned = rewards[dayIndex] || 2;
    state.week_signed.push(today);
    state.last_sign_date = today;
    state.month_sign_days += 1;
    state.total_sign_days += 1;
    // 满一周重置
    if (state.week_signed.length >= 7) {
      state.week_signed = [];
      state.week_start_date = today;
    }
    return earned;
  }

  // ============================================
  // 持久化：watch 自动保存
  // ============================================

  function snapshot(): StoredProjectData {
    return {
      tenants: JSON.parse(JSON.stringify(tenants.value)),
      projects: JSON.parse(JSON.stringify(projects.value)),
      stores: JSON.parse(JSON.stringify(stores.value)),
      products: JSON.parse(JSON.stringify(products.value)),
      liveRooms: JSON.parse(JSON.stringify(liveRooms.value)),
      memberLevelConfigs: JSON.parse(JSON.stringify(memberLevelConfigs.value)),
      projectHomeConfigs: JSON.parse(JSON.stringify(projectHomeConfigs.value)),
      marketingCategories: JSON.parse(JSON.stringify(marketingCategories.value)),
      coupons: JSON.parse(JSON.stringify(coupons.value)),
      signInStates: JSON.parse(JSON.stringify(signInStates.value)),
      inviters: JSON.parse(JSON.stringify(inviters.value)),
    } as StoredProjectData;
  }

  watch(
    [tenants, projects, stores, products, liveRooms, memberLevelConfigs, projectHomeConfigs, marketingCategories, coupons, signInStates, inviters],
    () => dataService.saveProjectData(snapshot()),
    { deep: true }
  );

  return {
    tenants, projects, stores, products, liveRooms, memberLevelConfigs, projectHomeConfigs, marketingCategories, coupons, signInStates, inviters,
    // v3.1.37 新增：项目状态过滤
    activeProjects, activeProjectIds, isProjectActive,
    projectsByCategory, storesByProject, productsByProject, storeProducts,
    livesByProject, livesByStore, memberLevelsByProject, homeConfigByProject,
    marketingCategoriesByProject,
    couponsByProject, couponsByProjectUser, signInStateByProjectUser,
    // v3.1.30 新增
    invitersByProject, invitersByStore, getInviterById, managerByStore,
    getProjectById, getStoreById, getProductById, getLiveById,
    addProject, updateProject, deleteProject,
    addStore, updateStore, deleteStore,
    addProduct, updateProduct, updateHomeConfig, ensureHomeConfig, addMemberLevel,
    addMarketingCategory, updateMarketingCategory, deleteMarketingCategory,
    // v3.1.30 新增
    addInviter, updateInviter, deleteInviter, getManagerNameByStore,
    doSignIn,
  };
});
