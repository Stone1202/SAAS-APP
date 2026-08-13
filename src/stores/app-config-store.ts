/**
 * APP 运营配置 Store（接入持久化服务）
 *
 * 管理 APP 首页所有运营后台配置的数据，包括：
 * - 搜索管理：热搜词、底纹词、自定义搜索结果
 * - Banner 广告管理
 * - 金刚区管理
 * - 直播推荐管理（手动推荐 + 规则推荐）
 * - 商品推荐管理（手动推荐 + 规则推荐）
 *
 * 数据持久化：
 *   所有 ref 变更通过 watch 自动同步到 localStorage，
 *   页面刷新后从 localStorage 恢复。
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { dataService, STORAGE_KEYS, type StoredAppConfig } from '../services/data-service';
import type { AdBanner, KingKongEntry, FunctionPage } from '../contracts';
import type {
  RecommendItem as EngineRecommendItem,
  SortDimension as EngineSortDimension,
  RecommendRule as EngineRecommendRule,
  RecommendScenario,
  RuleTemplate,
  RecommendTargetType,
  RecommendRuleEntity,
  RuleEffectStatus,
} from '../contracts/recommend-engine';
import { sortByDimensions } from '../contracts/recommend-dimensions';

// ============================================
// 功能页面注册表 — 默认内置数据（ENT-APP-010）
// v3.1.44 新增
//
// 角色分工：
//   - 系统管理员：维护注册表（CRUD）
//   - 运营人员：在 JumpTargetPicker 中选择已注册的功能页面
//   - APP用户：点击后解析 page_id → 查询注册表 → 获得实际路由 → 跳转
//
// 分类说明：
//   - builtin(内置): 不可删除，仅可启用/禁用（13条默认）
//   - business(业务): 可完整 CRUD
//   - activity(活动): 可完整 CRUD
//
// 安全边界：
//   - 禁止外部链接，不保留 external 分类
//   - app_route 只能为 APP 内部路由
//   - 旧 jump_type=url 数据全部废弃
//
// 使用流程（详见 UC-OPS-OPS-CONFIG-008 用例卡）：
//   1. 系统管理员: 功能页面管理页 → 新增/编辑/禁用功能页面到注册表
//   2. 运营人员: Banner/金刚区/搜索配置 → JumpTargetPicker → 选择"功能页面"→ 下拉选对应页面
//   3. APP端: 点击跳转时解析 page_id → 替换 :projectId 占位符 → router.push
// ============================================
const DEFAULT_FUNCTION_PAGES: FunctionPage[] = [
  // ─── 平台 APP 页面（无需 projectId） ───
  { page_id: 'fp-home',              category: 'builtin', name: '平台首页',         description: 'APP首页，展示Banner轮播、金刚区入口、直播推荐和商品推荐',  app_route: '/app/home',                   status: 'active', sort_order: 1 },
  { page_id: 'fp-mall',              category: 'builtin', name: '商城列表',         description: '商城首页，Tab切换：商城列表/精选商品/精选直播',                app_route: '/app/mall',                   status: 'active', sort_order: 2 },
  { page_id: 'fp-mall-featured',     category: 'builtin', name: '商城-精选商品',    description: '精选商品Tab，按叠加模式排序显示所有推荐商品',                    app_route: '/app/mall?tab=featuredProducts', status: 'active', sort_order: 3 },
  { page_id: 'fp-mall-live',         category: 'builtin', name: '商城-精选直播',    description: '精选直播Tab，按叠加模式排序显示所有推荐直播',                    app_route: '/app/mall?tab=featuredLives',    status: 'active', sort_order: 4 },
  { page_id: 'fp-search',            category: 'builtin', name: '搜索页',           description: '关键字搜索商品/直播/项目，支持热搜词和搜索历史',                  app_route: '/app/search',                 status: 'active', sort_order: 5 },
  { page_id: 'fp-mine',              category: 'builtin', name: '个人中心',         description: '用户个人中心：优惠券/积分/零钱/收货地址/会员入口',               app_route: '/app/mine',                   status: 'active', sort_order: 6 },
  { page_id: 'fp-platform-member',   category: 'builtin', name: '平台会员中心',     description: '平台维度积分/优惠券汇总 + 各项目会员入口列表',                    app_route: '/app/mine/member',            status: 'active', sort_order: 7 },
  { page_id: 'fp-addresses',         category: 'builtin', name: '收货地址管理',     description: '用户个人收货地址的增删改查管理',                                  app_route: '/app/mine/addresses',         status: 'active', sort_order: 8 },
  // ─── 项目维度页面（含 :projectId 占位符，运行时动态替换） ───
  { page_id: 'fp-project-mall',      category: 'builtin', name: '项目商城页',       description: '项目商城Tab页，商品分类+直播双Tab（需projectId参数）',           app_route: '/app/project/:projectId/mall',   status: 'active', sort_order: 9 },
  { page_id: 'fp-project-stores',    category: 'builtin', name: '我的门店',         description: '项目门店列表页，支持搜索门店名称（需projectId参数）',            app_route: '/app/project/:projectId/stores', status: 'active', sort_order: 10 },
  { page_id: 'fp-project-member',    category: 'builtin', name: '项目会员中心',     description: '项目会员页：签到/等级/优惠券/积分/规则（需projectId参数）',       app_route: '/app/project/:projectId/member', status: 'active', sort_order: 11 },
  { page_id: 'fp-project-coupons',   category: 'builtin', name: '项目优惠券列表',   description: '该项目用户未使用的优惠券列表（需projectId参数）',                 app_route: '/app/project/:projectId/coupons',status: 'active', sort_order: 12 },
  { page_id: 'fp-more-products',     category: 'builtin', name: '更多商品',         description: '全部商品二级列表页',                                              app_route: '/app/more-products',          status: 'active', sort_order: 13 },
];

// ============================================
// 类型定义
// ============================================

/** 热搜词 */
export interface HotWord {
  word: string;
  weight: number;
  status: 'active' | 'disabled';
  badge?: 'hot' | 'fire' | 'new' | 'popular' | 'recommend' | 'sale';
  csr_id?: string;
  /** 最后修改人 */
  updated_by?: string;
  /** 最后修改时间（ISO 8601） */
  updated_at?: string;
}

/** 自定义搜索结果项 — jump_type对齐PRD CONFIG-SHP-006（v3.1.45 新增 function_page） */
export interface CustomSearchResult {
  item_id: string;
  title: string;
  description: string;
  icon?: string;
  gradient?: string;
  /** 跳转类型：product=商品详情 / project=项目首页 / live=直播详情 / function_page=功能页面（v3.1.45新增，url废弃保留兼容） */
  jump_type: 'product' | 'project' | 'live' | 'url' | 'function_page';
  jump_id: string;
  project_id?: string;
  store_id?: string;
  status: 'active' | 'disabled';
  /** 最后修改人 */
  updated_by?: string;
  /** 最后修改时间（ISO 8601） */
  updated_at?: string;
}

/** 推荐配置项（直播/商品/项目通用） — 已迁移至契约层 recommend-engine.ts，此处通过类型别名重新导出 */
// export interface RecommendItem { ... } — 已移除，使用上方 `export type RecommendItem = EngineRecommendItem`

/** 单个排序维度（多维度排序链的一个节点，v3.1.30 dim_type 改为 string） */
export interface SortDimension {
  /** 维度类型（由 DimensionDef.dim_type 定义，字符串类型，运行时由注册表校验） */
  dim_type: string;
  /** 排序方向（仅连续维度有效：viewer_count/sales/created_at），默认 desc */
  direction: 'desc' | 'asc';
  /** 多选值（仅离散多选维度有效：project/anchor_type/category），数组顺序即优先级顺序（越靠前优先级越高） */
  selected_values: string[];
}

/** 推荐规则（新版：多维度排序链，按 sort_dimensions 数组顺序依次叠加排序） */
export interface RecommendRule {
  /** 排序维度链，按数组顺序依次排序（叠加排序，等价 SQL ORDER BY dim1, dim2, ...） */
  sort_dimensions: SortDimension[];
}

// 兼容类型导出（指向契约层引擎类型）
export type RecommendItem = EngineRecommendItem;
export type RecommendTargetTypeAlias = RecommendTargetType;
export type RecommendRuleEntityAlias = RecommendRuleEntity;

// ============================================
// 推荐排序工具函数（BR-SHP-030 多维度叠加排序）
// v3.1.30: 通用排序逻辑已迁移至 contracts/recommend-dimensions.ts 的 sortByDimensions
// 此处保留 sortLiveByDimensions / sortProductByDimensions 作为向后兼容包装
// ============================================

/**
 * 直播多维度叠加排序（向后兼容，内部委托通用 sortByDimensions）
 * @deprecated 推荐直接使用 `sortByDimensions` from '@/contracts/recommend-dimensions'
 */
export function sortLiveByDimensions<T extends any>(lives: T[], dimensions: SortDimension[]): T[] {
  return sortByDimensions(lives, dimensions as EngineSortDimension[]) as T[];
}

/**
 * 商品多维度叠加排序（向后兼容，内部委托通用 sortByDimensions）
 * @deprecated 推荐直接使用 `sortByDimensions` from '@/contracts/recommend-dimensions'
 */
export function sortProductByDimensions<T extends any>(products: T[], dimensions: SortDimension[]): T[] {
  return sortByDimensions(products, dimensions as EngineSortDimension[]) as T[];
}

/**
 * 通用多维度叠加排序（v3.1.30 新增，支持商品/直播/项目任意目标）
 * 直接透传契约层 sortByDimensions
 */
export function sortRecommendByDimensions<T extends any>(items: T[], dimensions: SortDimension[]): T[] {
  return sortByDimensions(items, dimensions as EngineSortDimension[]) as T[];
}

// ============================================
// 默认值（首次使用时初始化）
// ============================================

// ── v3.1.30 新增：项目推荐默认配置 ──
const DEFAULT_PROJECT_RECOMMEND_CONFIGS: RecommendItem[] = [
  // 默认规则（固定一条，不可删除）— 按行业 + 会员数排序
  {
    rec_id: 'prj-default', rec_type: 'rule', target_id: '', status: 'active', is_default: true,
    rule: {
      sort_dimensions: [
        { dim_type: 'industry', direction: 'asc', selected_values: [] },
        { dim_type: 'member_count', direction: 'desc', selected_values: [] },
      ],
    },
    updated_by: '运营管理员', updated_at: '2026-08-10T10:00:00',
  },
  // 手动推荐
  { rec_id: 'prj-001', rec_type: 'manual', target_id: 'proj-daily-01', status: 'active', sort_order: 0, updated_by: '运营管理员', updated_at: '2026-08-10T10:00:00' },
  { rec_id: 'prj-002', rec_type: 'manual', target_id: 'proj-health-01', status: 'active', sort_order: 1, updated_by: '运营管理员', updated_at: '2026-08-10T10:00:00' },
];

// ── v3.1.31 新增：推荐规则实体默认配置（独立的规则，可被多个场景引用） ──
// v3.1.34：规则实体移除 display_limit，展示条数由使用场景 RecommendScenario 控制
const DEFAULT_RECOMMEND_RULES: RecommendRuleEntity[] = [
  // 直播规则1：状态优先+人气排序（内置）
  {
    rule_id: 'rule-live-status-viewers',
    name: '直播：状态优先+人气排序',
    target_type: 'live',
    rule: {
      sort_dimensions: [
        { dim_type: 'status', direction: 'asc', selected_values: [] },
        { dim_type: 'viewer_count', direction: 'desc', selected_values: [] },
      ],
    },
    description: '直播中优先，同状态按观看人数降序',
    status: 'active',
    is_builtin: true,
    updated_by: '运营管理员', updated_at: '2026-08-10T10:00:00',
  },
  // 直播规则2：项目分组+主播类型（内置）
  {
    rule_id: 'rule-live-project-anchor',
    name: '直播：项目分组+主播类型',
    target_type: 'live',
    rule: {
      sort_dimensions: [
        { dim_type: 'project', direction: 'asc', selected_values: [] },
        { dim_type: 'anchor_type', direction: 'asc', selected_values: [] },
        { dim_type: 'status', direction: 'asc', selected_values: [] },
      ],
    },
    description: '按项目分组，同项目按主播类型，同主播类型按状态',
    status: 'active',
    is_builtin: true,
    updated_by: '运营管理员', updated_at: '2026-08-10T10:00:00',
  },
  // 商品规则1：销量优先（内置）
  {
    rule_id: 'rule-product-sales',
    name: '商品：销量优先',
    target_type: 'product',
    rule: {
      sort_dimensions: [
        { dim_type: 'sales', direction: 'desc', selected_values: [] },
      ],
    },
    description: '按销量降序，热销商品排前',
    status: 'active',
    is_builtin: true,
    updated_by: '运营管理员', updated_at: '2026-08-10T10:00:00',
  },
  // 商品规则2：类目分组+销量（内置）
  {
    rule_id: 'rule-product-category-sales',
    name: '商品：类目分组+销量',
    target_type: 'product',
    rule: {
      sort_dimensions: [
        { dim_type: 'category', direction: 'asc', selected_values: [] },
        { dim_type: 'sales', direction: 'desc', selected_values: [] },
      ],
    },
    description: '按类目分组，同类目按销量降序',
    status: 'active',
    is_builtin: true,
    updated_by: '运营管理员', updated_at: '2026-08-10T10:00:00',
  },
  // 项目规则1：行业分组+会员数（内置）
  {
    rule_id: 'rule-project-industry-members',
    name: '项目：行业分组+会员数',
    target_type: 'project',
    rule: {
      sort_dimensions: [
        { dim_type: 'industry', direction: 'asc', selected_values: [] },
        { dim_type: 'member_count', direction: 'desc', selected_values: [] },
      ],
    },
    description: '按行业分组，同行业按会员数降序',
    status: 'active',
    is_builtin: true,
    updated_by: '运营管理员', updated_at: '2026-08-10T10:00:00',
  },
];

// ── v3.1.31 重构：推荐场景默认配置（引用规则实体 rule_id） ──
// v3.1.34：场景新增 display_limit 字段控制展示条数；删除 sc-home-project，新增 sc-mall-projects
const DEFAULT_RECOMMEND_SCENARIOS: RecommendScenario[] = [
  {
    scenario_id: 'sc-home-live',
    name: '首页直播推荐区',
    target_type: 'live',
    rule_id: 'rule-live-status-viewers', // v3.1.31：引用规则实体
    description: '平台APP首页直播推荐展示区，手动推荐+规则叠加，展示6条',
    recommend_configs: [],
    display_limit: 6, // v3.1.34：首页推荐区展示6条
    effect_status: 'active', // v3.1.38 新增：默认已生效
  },
  {
    scenario_id: 'sc-home-product',
    name: '首页商品推荐区',
    target_type: 'product',
    rule_id: 'rule-product-sales', // v3.1.31：引用规则实体
    description: '平台APP首页商品推荐展示区，手动推荐+规则叠加，展示6条',
    recommend_configs: [],
    display_limit: 6, // v3.1.34：首页推荐区展示6条
    effect_status: 'active', // v3.1.38 新增：默认已生效
  },
  {
    scenario_id: 'sc-mall-featured-products',
    name: '商城精选商品Tab',
    target_type: 'product',
    rule_id: 'rule-product-category-sales', // v3.1.31：引用规则实体
    description: '商城页精选商品Tab，无上限展示全部可见商品',
    recommend_configs: [],
    // display_limit 留空 = 无上限
    effect_status: 'active', // v3.1.38 新增：默认已生效
  },
  {
    scenario_id: 'sc-mall-featured-lives',
    name: '商城精选直播Tab',
    target_type: 'live',
    rule_id: 'rule-live-project-anchor', // v3.1.31：引用规则实体
    description: '商城页精选直播Tab，无上限展示全部可见直播',
    recommend_configs: [],
    // display_limit 留空 = 无上限
    effect_status: 'active', // v3.1.38 新增：默认已生效
  },
  {
    scenario_id: 'sc-mall-projects',
    name: '商城商城列表Tab',
    target_type: 'project',
    rule_id: 'rule-project-industry-members', // v3.1.34：引用项目规则实体
    description: '商城页商城列表Tab（项目列表），无上限展示全部可见项目',
    recommend_configs: [],
    // display_limit 留空 = 无上限
    effect_status: 'active', // v3.1.38 新增：默认已生效
  },
];

// ── v3.1.30 新增：规则模板默认配置 ──
// v3.1.34：模板移除 display_limit，展示条数由使用场景控制
const DEFAULT_RULE_TEMPLATES: RuleTemplate[] = [
  {
    template_id: 'tpl-live-status-viewers',
    name: '直播：状态优先+人气排序',
    target_type: 'live',
    rule: {
      sort_dimensions: [
        { dim_type: 'status', direction: 'asc', selected_values: [] },
        { dim_type: 'viewer_count', direction: 'desc', selected_values: [] },
      ],
    },
    description: '直播中优先，同状态按观看人数降序',
    is_builtin: true,
  },
  {
    template_id: 'tpl-live-project-anchor',
    name: '直播：项目分组+主播类型',
    target_type: 'live',
    rule: {
      sort_dimensions: [
        { dim_type: 'project', direction: 'asc', selected_values: [] },
        { dim_type: 'anchor_type', direction: 'asc', selected_values: [] },
        { dim_type: 'status', direction: 'asc', selected_values: [] },
      ],
    },
    description: '按项目分组，同项目按主播类型，同主播类型按状态',
    is_builtin: true,
  },
  {
    template_id: 'tpl-product-sales',
    name: '商品：销量优先',
    target_type: 'product',
    rule: {
      sort_dimensions: [
        { dim_type: 'sales', direction: 'desc', selected_values: [] },
      ],
    },
    description: '按销量降序，热销商品排前',
    is_builtin: true,
  },
  {
    template_id: 'tpl-product-category-sales',
    name: '商品：类目分组+销量',
    target_type: 'product',
    rule: {
      sort_dimensions: [
        { dim_type: 'category', direction: 'asc', selected_values: [] },
        { dim_type: 'sales', direction: 'desc', selected_values: [] },
      ],
    },
    description: '按类目分组，同类目按销量降序',
    is_builtin: true,
  },
  {
    template_id: 'tpl-project-industry-members',
    name: '项目：行业分组+会员数',
    target_type: 'project',
    rule: {
      sort_dimensions: [
        { dim_type: 'industry', direction: 'asc', selected_values: [] },
        { dim_type: 'member_count', direction: 'desc', selected_values: [] },
      ],
    },
    description: '按行业分组，同行业按会员数降序',
    is_builtin: true,
  },
];

const DEFAULT_CONFIG: StoredAppConfig = {
  searchHint: '搜索商品、直播、项目',
  hotWordConfigs: [
    { word: '智能拖把', weight: 100, status: 'active', badge: 'hot', csr_id: 'csr-001', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '便携榨汁机', weight: 95, status: 'active', badge: 'fire', csr_id: 'csr-002', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '蓝牙耳机', weight: 90, status: 'active', badge: 'new', csr_id: 'csr-003', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '瑜伽垫', weight: 85, status: 'active', badge: 'popular', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '围炉煮茶器具', weight: 80, status: 'active', badge: 'recommend', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '保温壶', weight: 75, status: 'active', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '收纳盒', weight: 70, status: 'active', badge: 'sale', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '洗衣凝珠', weight: 65, status: 'active', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '便当盒', weight: 60, status: 'active', badge: 'new', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { word: '跑鞋', weight: 55, status: 'active', badge: 'hot', updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
  ],
  customSearchResults: [
    {
      item_id: 'csr-001', title: '🔥 热卖爆款 — 竹纤维抽纸',
      description: '天然竹纤维，柔软亲肤，环保健康 ¥29.9',
      icon: '🧹', gradient: 'linear-gradient(135deg, #FF6B35, #FF8F35)',
      jump_type: 'product', jump_id: 'prod-d-001',
      project_id: 'proj-daily-01', store_id: 'store-d-001', status: 'active',
      updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00',
    },
    {
      item_id: 'csr-002', title: '✨ 网红同款 — 复合维生素片',
      description: '每日1片，补充21种维生素矿物质 ¥89',
      icon: '💊', gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      jump_type: 'product', jump_id: 'prod-h-001',
      project_id: 'proj-health-01', store_id: 'store-h-001', status: 'active',
      updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00',
    },
    {
      item_id: 'csr-003', title: '🎧 营养专家直播 — 维生素怎么补？',
      description: '营养师李博士在线解答，正在直播',
      icon: '📺', gradient: 'linear-gradient(135deg, #0F2027, #203A43)',
      jump_type: 'live', jump_id: 'live-003',
      project_id: 'proj-health-01', store_id: 'store-h-001', status: 'active',
      updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00',
    },
  ],
  adBanners: [
    {
      ad_id: 'ad-001', title: '新品首发 — 全场低至5折',
      image_url: '', position: 'platform_home',
      sort_order: 0, status: 'active', start_time: '2026-01-01 00:00:00', end_time: '2026-12-31 23:59:59',
      jump_type: 'project', jump_id: 'proj-daily-01', project_id: 'proj-daily-01',
      updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00',
    },
    {
      ad_id: 'ad-002', title: '会员专享 — 积分兑换好礼',
      image_url: '', position: 'platform_home',
      sort_order: 1, status: 'active', start_time: '2026-01-01 00:00:00', end_time: '2026-12-31 23:59:59',
      jump_type: 'function_page', jump_id: 'fp-platform-member', project_id: '',
      link: '/app/mine/member',
      updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00',
    },
    {
      ad_id: 'ad-003', title: '营养专家直播 — 限时义诊进行中',
      image_url: '', position: 'platform_home',
      sort_order: 2, status: 'active', start_time: '2026-01-01 00:00:00', end_time: '2026-12-31 23:59:59',
      jump_type: 'live', jump_id: 'live-003', project_id: 'proj-health-01',
      updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00',
    },
  ],
  kingKongs: [
    { entry_id: 'kk-001', name: '热卖排行', icon: '🔥', jump_type: 'function_page', jump_id: 'fp-mall', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #FF6B6B, #EE5A24)', sort_order: 0, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { entry_id: 'kk-002', name: '新品首发', icon: '✨', jump_type: 'function_page', jump_id: 'fp-mall-featured', link: '/app/mall?tab=featuredProducts', status: 'active', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', sort_order: 1, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { entry_id: 'kk-003', name: '领券中心', icon: '🎟️', jump_type: 'function_page', jump_id: 'fp-mine', link: '/app/mine', status: 'active', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', sort_order: 2, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { entry_id: 'kk-004', name: '直播间', icon: '📺', jump_type: 'live', jump_id: 'live-001', project_id: 'proj-daily-01', link: '/app/live/live-001', status: 'active', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', sort_order: 3, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { entry_id: 'kk-005', name: '每日签到', icon: '📅', jump_type: 'function_page', jump_id: 'fp-mine', link: '/app/mine', status: 'active', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', sort_order: 4, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { entry_id: 'kk-006', name: '试用中心', icon: '🎁', jump_type: 'function_page', jump_id: 'fp-mall-featured', link: '/app/mall?tab=featuredProducts', status: 'active', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', sort_order: 5, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { entry_id: 'kk-007', name: '品牌榜', icon: '🏆', jump_type: 'function_page', jump_id: 'fp-mall', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', sort_order: 6, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { entry_id: 'kk-008', name: '全部分类', icon: '📋', jump_type: 'function_page', jump_id: 'fp-mall', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #f5af19, #f12711)', sort_order: 7, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
  ],
  liveRecommendConfigs: [
    // 默认规则（固定一条，不可删除）— 多维度排序链（BR-SHP-008/030）
    { rec_id: 'lr-default', rec_type: 'rule', target_id: '', status: 'active', is_default: true,
      rule: {
        sort_dimensions: [
          { dim_type: 'status', direction: 'asc', selected_values: [] },
          { dim_type: 'viewer_count', direction: 'desc', selected_values: [] },
        ],
      },
      updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    // 手动推荐（按 sort_order 升序，排在前面的优先级高于默认规则结果）
    { rec_id: 'lr-001', rec_type: 'manual', target_id: 'live-001', status: 'active', sort_order: 0, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { rec_id: 'lr-002', rec_type: 'manual', target_id: 'live-002', status: 'active', sort_order: 1, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
  ],
  productRecommendConfigs: [
    // 默认规则（固定一条，不可删除）— 多维度排序链（BR-SHP-009/030）
    { rec_id: 'pr-default', rec_type: 'rule', target_id: '', status: 'active', is_default: true,
      rule: {
        sort_dimensions: [
          { dim_type: 'sales', direction: 'desc', selected_values: [] },
        ],
      },
      updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    // 手动推荐（按 sort_order 升序，排在前面的优先级高于默认规则结果）
    { rec_id: 'pr-001', rec_type: 'manual', target_id: 'prod-d-001', status: 'active', sort_order: 0, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { rec_id: 'pr-002', rec_type: 'manual', target_id: 'prod-h-001', status: 'active', sort_order: 1, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { rec_id: 'pr-003', rec_type: 'manual', target_id: 'prod-d-004', status: 'active', sort_order: 2, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
    { rec_id: 'pr-004', rec_type: 'manual', target_id: 'prod-h-003', status: 'active', sort_order: 3, updated_by: '运营管理员', updated_at: '2026-01-01T10:00:00' },
  ],
  // v3.1.30 新增：项目推荐 / 场景 / 模板（引用上方定义的常量）
  projectRecommendConfigs: DEFAULT_PROJECT_RECOMMEND_CONFIGS as any,
  recommendScenarios: DEFAULT_RECOMMEND_SCENARIOS as any,
  ruleTemplates: DEFAULT_RULE_TEMPLATES as any,
  // v3.1.31 新增：推荐规则实体（独立化规则定义）
  recommendRules: DEFAULT_RECOMMEND_RULES as any,
  // v3.1.44 新增：功能页面注册表（白名单）
  functionPages: DEFAULT_FUNCTION_PAGES as any,
  unreadCount: 2,
};

// ============================================
// Store
// ============================================

export const useAppConfigStore = defineStore('app-config', () => {
  // ── 从 localStorage 加载初始数据 ──
  const saved = dataService.loadAppConfig(DEFAULT_CONFIG);

  // ── 数据迁移：旧版 jump_type 值转换为新标准 ──
  // 旧值: project_home / live_page / fixed_url → 新值: project / live / url
  const JUMP_TYPE_MIGRATION: Record<string, string> = {
    project_home: 'project',
    live_page: 'live',
    fixed_url: 'url',
  };
  function migrateJumpType(jt: string): string {
    return JUMP_TYPE_MIGRATION[jt] || jt;
  }
  saved.customSearchResults = (saved.customSearchResults || []).map(c => ({
    ...c,
    jump_type: migrateJumpType(c.jump_type) as any,
  }));
  saved.adBanners = (saved.adBanners || []).map(b => ({
    ...b,
    jump_type: migrateJumpType(b.jump_type) as any,
  }));

  // ============================================
  // 搜索管理
  // ============================================

  const searchHint = ref(saved.searchHint);
  const hotWordConfigs = ref<HotWord[]>(saved.hotWordConfigs);
  const customSearchResults = ref<CustomSearchResult[]>(saved.customSearchResults);

  /** 热搜词列表（从 hotWordConfigs 派生） */
  const hotWords = ref<string[]>(
    saved.hotWordConfigs
      .filter(h => h.status === 'active')
      .sort((a, b) => b.weight - a.weight)
      .map(h => h.word)
  );

  // ============================================
  // Banner 广告管理
  // ============================================

  const adBanners = ref<AdBanner[]>(saved.adBanners as any);

  const bannersByPosition = computed(() => (position: string) =>
    adBanners.value
      .filter(b => b.position === position && b.status === 'active')
      .sort((a, b) => a.sort_order - b.sort_order)
  );

  // ============================================
  // 金刚区管理
  // ============================================

  const kingKongs = ref<KingKongEntry[]>(saved.kingKongs as any);

  const enabledKingKongs = computed(() =>
    kingKongs.value
      .filter(k => k.status === 'active')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );

  // ============================================
  // 功能页面管理（v3.1.44 新增 — ENT-APP-010）
  //
  // 使用流程：
  //   1) 系统管理员在「功能页面管理」页维护注册表（新增/编辑/禁用）
  //   2) 运营人员在 JumpTargetPicker 中选择"功能页面"类型→从注册表下拉选择
  //   3) APP端点击跳转时查询注册表，替换 :projectId 后执行 router.push
  //
  // 分类约束：
  //   builtin — 不可删除（仅可启用/禁用，撤销操作提示不可删除）
  //   business / activity — 可完整 CRUD
  // ============================================

  const functionPages = ref<FunctionPage[]>(saved.functionPages as any || DEFAULT_FUNCTION_PAGES);

  /** 启用的功能页面（供 JumpTargetPicker 下拉选择） */
  const activeFunctionPages = computed(() =>
    functionPages.value
      .filter(fp => fp.status === 'active')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );

  /** 按分类获取功能页面 */
  const functionPagesByCategory = computed(() => (category: string) =>
    functionPages.value
      .filter(fp => fp.category === category)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );

  /** 根据 page_id 查询功能页面（APP端跳转解析用） */
  function getFunctionPage(pageId: string): FunctionPage | undefined {
    return functionPages.value.find(fp => fp.page_id === pageId && fp.status === 'active');
  }

  /** 新增功能页面 */
  function addFunctionPage(fp: FunctionPage) {
    functionPages.value.push({
      ...fp,
      updated_at: new Date().toISOString(),
    });
  }

  /** 更新功能页面 */
  function updateFunctionPage(pageId: string, updates: Partial<FunctionPage>) {
    const idx = functionPages.value.findIndex(fp => fp.page_id === pageId);
    if (idx !== -1) {
      functionPages.value[idx] = {
        ...functionPages.value[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
    }
  }

  /** 删除功能页面（仅 business/activity 可删） */
  function deleteFunctionPage(pageId: string): boolean {
    const fp = functionPages.value.find(f => f.page_id === pageId);
    if (!fp || fp.category === 'builtin') return false;
    functionPages.value = functionPages.value.filter(f => f.page_id !== pageId);
    return true;
  }

  /** 解析功能页面路由（替换 :projectId 占位符） */
  function resolveFunctionPageRoute(pageId: string, projectId?: string): string {
    const fp = getFunctionPage(pageId);
    if (!fp) return '/app/home'; // fallback：无效 page_id 回到首页
    let route = fp.app_route;
    if (projectId && route.includes(':projectId')) {
      route = route.replace(':projectId', projectId);
    }
    return route;
  }

  /** v3.1.45 新增：根据 jump_type/jump_id/project_id 计算 link 字段（冗余同步，作为fallback）
   *  - function_page：调用 resolveFunctionPageRoute 计算实际路由
   *  - product/project/live：拼接 /app/{type}/{id}
   *  - url：直接用 jump_id
   *  - 其他：空字符串
   *  用途：管理页 save() 调用，保证 link 字段非空，APP端 fallback 链路不失效 */
  function syncLinkFromJump(
    jumpType: string,
    jumpId: string,
    projectId?: string
  ): string {
    if (!jumpId) return '';
    switch (jumpType) {
      case 'function_page':
        return resolveFunctionPageRoute(jumpId, projectId);
      case 'product':
        return `/app/product/${jumpId}`;
      case 'project':
        return `/app/project/${jumpId}`;
      case 'live':
        return `/app/live/${jumpId}`;
      case 'url':
        return jumpId;
      default:
        return '';
    }
  }

  /** v3.1.45 新增：旧 jump_type='url' 数据自动迁移为 function_page
   *  - 在 store 初始化后对 adBanners/kingKongs/customSearchResults 三类数据扫描
   *  - 若 jump_type === 'url' 且 link 值匹配注册表中某个 function page 的 app_route，
   *    则迁移为 function_page，jump_id 设为该 page_id
   *  - 若不匹配注册表但 link 是 APP 内部路由（/app/开头），保留 url 类型但 link 字段确保非空
   *  - 若 link 为空，无法迁移，保持原状（兼容最老数据）
   *  迁移只在初始化时执行一次，不会循环触发 */
  function migrateLegacyJumpType() {
    const allPages = functionPages.value;
    const tryMigrate = (item: any): boolean => {
      if (!item || item.jump_type !== 'url' || !item.link) return false;
      // 优先按 app_route 精确匹配（含 :projectId 占位符的需要先正则化）
      const link = item.link as string;
      let migrated = false;
      for (const fp of allPages) {
        if (fp.status !== 'active') continue;
        // 精确匹配（无占位符的路由）
        if (fp.app_route === link) {
          item.jump_type = 'function_page';
          item.jump_id = fp.page_id;
          migrated = true;
          break;
        }
        // 占位符路由匹配：将 :projectId 替换为实际值后比较
        if (fp.app_route.includes(':projectId') && item.project_id) {
          const filled = fp.app_route.replace(':projectId', item.project_id);
          if (filled === link) {
            item.jump_type = 'function_page';
            item.jump_id = fp.page_id;
            migrated = true;
            break;
          }
        }
        // query 路由匹配（如 /app/mall?tab=live）
        if (fp.app_route.includes('?') && link.includes('?')) {
          const [fpPath] = fp.app_route.split('?');
          const [linkPath] = link.split('?');
          if (fpPath === linkPath) {
            item.jump_type = 'function_page';
            item.jump_id = fp.page_id;
            migrated = true;
            break;
          }
        }
      }
      return migrated;
    };

    // 扫描三类数据
    let changed = false;
    (adBanners.value as any[]).forEach(item => {
      if (tryMigrate(item)) changed = true;
    });
    (kingKongs.value as any[]).forEach(item => {
      if (tryMigrate(item)) changed = true;
    });
    (customSearchResults.value as any[]).forEach(item => {
      if (tryMigrate(item)) changed = true;
    });
    if (changed) {
      console.info('[migrateLegacyJumpType] 已将部分旧 url 类型数据迁移为 function_page');
    }
  }

  // v3.1.45：store 初始化后执行一次旧数据迁移
  migrateLegacyJumpType();

  // ============================================
  // 直播推荐管理
  // ============================================

  const liveRecommendConfigs = ref<RecommendItem[]>(saved.liveRecommendConfigs);
  // 数据迁移：旧版 rule 结构（rule_type+params）→ 新版 sort_dimensions[]
  liveRecommendConfigs.value.forEach(r => {
    if (r.rec_type === 'rule' && r.rule && !(r.rule as any).sort_dimensions) {
      const oldRule = r.rule as any;
      const dims: SortDimension[] = [];
      if (oldRule.rule_type === 'status') {
        dims.push({ dim_type: 'status', direction: 'asc', selected_values: [] });
        dims.push({ dim_type: 'viewer_count', direction: 'desc', selected_values: [] });
      } else if (oldRule.rule_type === 'viewer_count') {
        dims.push({ dim_type: 'viewer_count', direction: 'desc', selected_values: [] });
      }
      r.rule = { sort_dimensions: dims };
    }
    // v3.1.34：display_limit 移除，旧数据多余字段忽略不处理
  });

  /** 手动推荐直播（按 sort_order 升序，缺失值排末尾） */
  const liveRecommends = computed(() =>
    liveRecommendConfigs.value
      .filter(r => r.rec_type === 'manual' && r.status === 'active')
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
  );

  /** 默认推荐规则（直播，固定一条，不可删除） */
  const liveDefaultRule = computed(() =>
    liveRecommendConfigs.value.find(r => r.rec_type === 'rule' && r.is_default === true) ||
    liveRecommendConfigs.value.find(r => r.rec_type === 'rule')
  );

  // ============================================
  // 商品推荐管理
  // ============================================

  const productRecommendConfigs = ref<RecommendItem[]>(saved.productRecommendConfigs);
  // 数据迁移：旧版 rule 结构（rule_type+params）→ 新版 sort_dimensions[]
  productRecommendConfigs.value.forEach(r => {
    if (r.rec_type === 'rule' && r.rule && !(r.rule as any).sort_dimensions) {
      const oldRule = r.rule as any;
      const dims: SortDimension[] = [];
      if (oldRule.rule_type === 'sales') {
        dims.push({ dim_type: 'sales', direction: 'desc', selected_values: [] });
      } else if (oldRule.rule_type === 'created_at') {
        dims.push({ dim_type: 'created_at', direction: 'desc', selected_values: [] });
      } else if (oldRule.rule_type === 'category') {
        const cat = oldRule.params?.category || '';
        dims.push({ dim_type: 'category', direction: 'asc', selected_values: cat ? [cat] : [] });
        dims.push({ dim_type: 'sales', direction: 'desc', selected_values: [] });
      } else {
        dims.push({ dim_type: 'sales', direction: 'desc', selected_values: [] });
      }
      r.rule = { sort_dimensions: dims };
    }
    // v3.1.34：display_limit 移除，旧数据多余字段忽略不处理
  });

  /** 手动推荐商品（按 sort_order 升序，缺失值排末尾） */
  const productRecommends = computed(() =>
    productRecommendConfigs.value
      .filter(r => r.rec_type === 'manual' && r.status === 'active')
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
  );

  /** 默认推荐规则（商品，固定一条，不可删除） */
  const productDefaultRule = computed(() =>
    productRecommendConfigs.value.find(r => r.rec_type === 'rule' && r.is_default === true) ||
    productRecommendConfigs.value.find(r => r.rec_type === 'rule')
  );

  // ============================================
  // 项目推荐管理（v3.1.30 新增）
  // ============================================

  const projectRecommendConfigs = ref<RecommendItem[]>(
    (saved as any).projectRecommendConfigs || DEFAULT_PROJECT_RECOMMEND_CONFIGS
  );
  // 数据迁移：旧版 rule 结构兼容
  projectRecommendConfigs.value.forEach(r => {
    if (r.rec_type === 'rule' && r.rule && !(r.rule as any).sort_dimensions) {
      r.rule = { sort_dimensions: [{ dim_type: 'industry', direction: 'asc', selected_values: [] }] } as any;
    }
    // v3.1.34：display_limit 移除，旧数据多余字段忽略不处理
  });

  /** 手动推荐项目（按 sort_order 升序） */
  const projectRecommends = computed(() =>
    projectRecommendConfigs.value
      .filter(r => r.rec_type === 'manual' && r.status === 'active')
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
  );

  /** 默认推荐规则（项目，固定一条，不可删除） */
  const projectDefaultRule = computed(() =>
    projectRecommendConfigs.value.find(r => r.rec_type === 'rule' && r.is_default === true) ||
    projectRecommendConfigs.value.find(r => r.rec_type === 'rule')
  );

  // ============================================
  // 推荐场景配置（v3.1.30 新增）
  // ============================================

  // v3.1.38 修复：从 localStorage 加载旧数据时，可能缺失新增的默认场景（如 sc-mall-projects）
  // 合并策略：遍历默认场景，若已加载数据中不存在则并入
  const savedScenarios: any[] | undefined = (saved as any).recommendScenarios;
  const loadedScenarios = savedScenarios || DEFAULT_RECOMMEND_SCENARIOS;
  if (savedScenarios && savedScenarios !== DEFAULT_RECOMMEND_SCENARIOS) {
    const loadedIds = new Set(savedScenarios.map((s: any) => s.scenario_id));
    for (const ds of DEFAULT_RECOMMEND_SCENARIOS) {
      if (!loadedIds.has(ds.scenario_id)) {
        savedScenarios.push({ ...ds });
      }
    }
    // v3.1.38 迁移：确保所有场景都有 effect_status 字段
    savedScenarios.forEach((s: any) => {
      if (s.effect_status === undefined) {
        s.effect_status = 'active';
      }
    });
  }
  const recommendScenarios = ref<RecommendScenario[]>(loadedScenarios);

  /** 按目标类型获取场景 */
  const scenariosByTarget = computed(() => (targetType: RecommendTargetType) =>
    recommendScenarios.value.filter(s => s.target_type === targetType)
  );

  /** 场景异步同步状态记录（v3.1.38 新增）：true=该场景正在异步同步中 */
  const syncingScenarios = ref<Record<string, boolean>>({});

  // ============================================
  // 规则模板（v3.1.30 新增）
  // ============================================

  const ruleTemplates = ref<RuleTemplate[]>(
    (saved as any).ruleTemplates || DEFAULT_RULE_TEMPLATES
  );

  /** 按目标类型获取模板 */
  const templatesByTarget = computed(() => (targetType: RecommendTargetType) =>
    ruleTemplates.value.filter(t => t.target_type === targetType)
  );

  // ============================================
  // 推荐规则实体（v3.1.31 新增 — 独立化规则定义）
  // ============================================

  const recommendRules = ref<RecommendRuleEntity[]>(
    (saved as any).recommendRules || DEFAULT_RECOMMEND_RULES
  );

  /** 按ID获取规则实体 */
  const getRuleById = computed(() => (ruleId: string) =>
    recommendRules.value.find(r => r.rule_id === ruleId)
  );

  /** 按目标类型获取启用的规则实体 */
  const rulesByTarget = computed(() => (targetType: RecommendTargetType) =>
    recommendRules.value.filter(r => r.target_type === targetType && r.status === 'active')
  );

  /** 按目标类型获取全部规则实体（含停用，管理页使用） */
  const allRulesByTarget = computed(() => (targetType: RecommendTargetType) =>
    recommendRules.value.filter(r => r.target_type === targetType)
  );

  /** 新增规则 */
  function addRule(rule: RecommendRuleEntity) {
    recommendRules.value.push(rule);
  }

  /** 更新规则 */
  function updateRule(ruleId: string, data: Partial<RecommendRuleEntity>) {
    const idx = recommendRules.value.findIndex(r => r.rule_id === ruleId);
    if (idx >= 0) {
      Object.assign(recommendRules.value[idx], data, {
        updated_at: new Date().toISOString(),
      });
    }
  }

  /** 删除规则（内置规则不可删除） */
  function deleteRule(ruleId: string): { success: boolean; message?: string } {
    const rule = recommendRules.value.find(r => r.rule_id === ruleId);
    if (!rule) return { success: false, message: '规则不存在' };
    if (rule.is_builtin) return { success: false, message: '内置规则不可删除' };
    // 检查是否被场景引用
    const usedBy = recommendScenarios.value.filter(s => s.rule_id === ruleId);
    if (usedBy.length) {
      return { success: false, message: `规则被 ${usedBy.length} 个场景引用，请先解除引用` };
    }
    const idx = recommendRules.value.findIndex(r => r.rule_id === ruleId);
    if (idx >= 0) recommendRules.value.splice(idx, 1);
    return { success: true };
  }

  /** 场景切换引用的规则 */
  function setScenarioRule(scenarioId: string, ruleId: string): { success: boolean; message?: string } {
    const scenario = recommendScenarios.value.find(s => s.scenario_id === scenarioId);
    if (!scenario) return { success: false, message: '场景不存在' };
    const rule = recommendRules.value.find(r => r.rule_id === ruleId);
    if (!rule) return { success: false, message: '规则不存在' };
    if (rule.target_type !== scenario.target_type) {
      return { success: false, message: '规则类型与场景不匹配' };
    }
    scenario.rule_id = ruleId;
    scenario.updated_by = '运营管理员';
    scenario.updated_at = new Date().toISOString();
    // v3.1.38 新增：触发异步数据同步/缓存预热
    scenario.effect_status = 'pending';
    syncingScenarios.value[scenarioId] = true;
    setTimeout(() => {
      scenario.effect_status = 'active';
      syncingScenarios.value[scenarioId] = false;
    }, 2000);
    return { success: true };
  }

  /** 手动设置场景生效状态（v3.1.38 新增，预留后端回调接口） */
  function setScenarioEffectStatus(scenarioId: string, status: RuleEffectStatus): void {
    const scenario = recommendScenarios.value.find(s => s.scenario_id === scenarioId);
    if (scenario) scenario.effect_status = status;
  }

  /** 更新场景的展示条数（display_limit）— v3.1.35 新增
   *  limit 传 undefined 表示无上限（展示全部）
   *  v3.1.47 调整5&6：根据 scenarioId 动态校验上限（直播推荐10、商品推荐100、其他50） */
  function updateScenarioDisplayLimit(
    scenarioId: string,
    limit: number | undefined
  ): { success: boolean; message?: string } {
    const scenario = recommendScenarios.value.find(s => s.scenario_id === scenarioId);
    if (!scenario) return { success: false, message: '场景不存在' };
    if (limit !== undefined) {
      if (limit < 1) return { success: false, message: '展示条数需≥1' };
      // v3.1.47 调整5&6：按场景动态判断上限
      const maxLimit = scenarioId === 'sc-home-live' ? 10
        : scenarioId === 'sc-home-product' ? 100
        : 50;
      if (limit > maxLimit) {
        const label = scenarioId === 'sc-home-live' ? '直播推荐' : scenarioId === 'sc-home-product' ? '商品推荐' : '当前场景';
        return { success: false, message: `${label}展示条数不能超过 ${maxLimit} 条` };
      }
    }
    scenario.display_limit = limit;
    scenario.updated_by = '运营管理员';
    scenario.updated_at = new Date().toISOString();
    return { success: true };
  }

  // ============================================
  // 场景化规则引用便捷计算属性（v3.1.31 新增 — APP端页面使用）
  // v3.1.34：新增 mallProjectsRule（商城列表Tab引用项目规则），移除 projectScenarioRule
  // ============================================

  /** 首页直播推荐场景（sc-home-live）引用的规则实体 */
  const liveScenarioRule = computed<RecommendRuleEntity | undefined>(() => {
    const sc = recommendScenarios.value.find(s => s.scenario_id === 'sc-home-live');
    if (!sc || !sc.rule_id) return undefined;
    return recommendRules.value.find(r => r.rule_id === sc.rule_id);
  });

  /** 首页商品推荐场景（sc-home-product）引用的规则实体 */
  const productScenarioRule = computed<RecommendRuleEntity | undefined>(() => {
    const sc = recommendScenarios.value.find(s => s.scenario_id === 'sc-home-product');
    if (!sc || !sc.rule_id) return undefined;
    return recommendRules.value.find(r => r.rule_id === sc.rule_id);
  });

  /** 商城商城列表场景（sc-mall-projects）引用的规则实体 */
  const mallProjectsRule = computed<RecommendRuleEntity | undefined>(() => {
    const sc = recommendScenarios.value.find(s => s.scenario_id === 'sc-mall-projects');
    if (!sc || !sc.rule_id) return undefined;
    return recommendRules.value.find(r => r.rule_id === sc.rule_id);
  });

  /** 商城精选商品场景（sc-mall-featured-products）引用的规则实体 */
  const mallFeaturedProductRule = computed<RecommendRuleEntity | undefined>(() => {
    const sc = recommendScenarios.value.find(s => s.scenario_id === 'sc-mall-featured-products');
    if (!sc || !sc.rule_id) return undefined;
    return recommendRules.value.find(r => r.rule_id === sc.rule_id);
  });

  /** 商城精选直播场景（sc-mall-featured-lives）引用的规则实体 */
  const mallFeaturedLiveRule = computed<RecommendRuleEntity | undefined>(() => {
    const sc = recommendScenarios.value.find(s => s.scenario_id === 'sc-mall-featured-lives');
    if (!sc || !sc.rule_id) return undefined;
    return recommendRules.value.find(r => r.rule_id === sc.rule_id);
  });

  // ============================================
  // 通用
  // ============================================

  const unreadCount = ref(saved.unreadCount);

  // ============================================
  // 持久化：watch 自动保存
  // ============================================

  /** 构建完整快照 */
  function snapshot(): StoredAppConfig {
    return {
      searchHint: searchHint.value,
      hotWordConfigs: JSON.parse(JSON.stringify(hotWordConfigs.value)),
      customSearchResults: JSON.parse(JSON.stringify(customSearchResults.value)),
      adBanners: JSON.parse(JSON.stringify(adBanners.value)),
      kingKongs: JSON.parse(JSON.stringify(kingKongs.value)),
      liveRecommendConfigs: JSON.parse(JSON.stringify(liveRecommendConfigs.value)),
      productRecommendConfigs: JSON.parse(JSON.stringify(productRecommendConfigs.value)),
      projectRecommendConfigs: JSON.parse(JSON.stringify(projectRecommendConfigs.value)),
      recommendScenarios: JSON.parse(JSON.stringify(recommendScenarios.value)),
      ruleTemplates: JSON.parse(JSON.stringify(ruleTemplates.value)),
      // v3.1.31 新增
      recommendRules: JSON.parse(JSON.stringify(recommendRules.value)),
      // v3.1.44 新增
      functionPages: JSON.parse(JSON.stringify(functionPages.value)),
      unreadCount: unreadCount.value,
    };
  }

  // 监听所有状态变更，自动保存到 localStorage
  watch(
    [searchHint, hotWordConfigs, customSearchResults, adBanners, kingKongs,
     liveRecommendConfigs, productRecommendConfigs, projectRecommendConfigs,
     recommendScenarios, ruleTemplates, recommendRules, functionPages, unreadCount],
    () => dataService.saveAppConfig(snapshot()),
    { deep: true }
  );

  // ============================================
  // 跨标签页同步：监听 localStorage storage 事件
  // ============================================

  /** 是否正在从其他标签页恢复数据（避免循环触发 watch） */
  let _restoring = false;

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key !== STORAGE_KEYS.APP_CONFIG || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue) as StoredAppConfig;
        _restoring = true;
        searchHint.value = data.searchHint;
        hotWordConfigs.value = data.hotWordConfigs;
        customSearchResults.value = data.customSearchResults;
        adBanners.value = data.adBanners;
        kingKongs.value = data.kingKongs;
        liveRecommendConfigs.value = data.liveRecommendConfigs;
        productRecommendConfigs.value = data.productRecommendConfigs;
        projectRecommendConfigs.value = (data as any).projectRecommendConfigs || DEFAULT_PROJECT_RECOMMEND_CONFIGS;
        recommendScenarios.value = (data as any).recommendScenarios || DEFAULT_RECOMMEND_SCENARIOS;
        ruleTemplates.value = (data as any).ruleTemplates || DEFAULT_RULE_TEMPLATES;
        // v3.1.31 新增
        recommendRules.value = (data as any).recommendRules || DEFAULT_RECOMMEND_RULES;
        // v3.1.44 新增
        functionPages.value = (data as any).functionPages || DEFAULT_FUNCTION_PAGES;
        unreadCount.value = data.unreadCount;
        // 重新派生 hotWords
        hotWords.value = data.hotWordConfigs
          .filter(h => h.status === 'active')
          .sort((a, b) => b.weight - a.weight)
          .map(h => h.word);
        _restoring = false;
      } catch {
        // 忽略解析错误
      }
    });
  }

  // ============================================
  // 辅助方法
  // ============================================

  /** 同步 hotWords（从 hotWordConfigs 派生） */
  function syncHotWords() {
    hotWords.value = hotWordConfigs.value
      .filter(h => h.status === 'active')
      .sort((a, b) => b.weight - a.weight)
      .map(h => h.word);
  }

  return {
    // 搜索管理
    searchHint,
    hotWords,
    hotWordConfigs,
    customSearchResults,
    syncHotWords,
    // Banner
    adBanners,
    bannersByPosition,
    // 金刚区
    kingKongs,
    enabledKingKongs,
    // 功能页面管理（v3.1.44 新增）
    functionPages,
    activeFunctionPages,
    functionPagesByCategory,
    getFunctionPage,
    addFunctionPage,
    updateFunctionPage,
    deleteFunctionPage,
    resolveFunctionPageRoute,
    syncLinkFromJump,        // v3.1.45 新增：管理页保存时自动计算 link
    migrateLegacyJumpType,    // v3.1.45 新增：旧 url 数据迁移
    // 直播推荐
    liveRecommendConfigs,
    liveRecommends,
    liveDefaultRule,
    // 商品推荐
    productRecommendConfigs,
    productRecommends,
    productDefaultRule,
    // 项目推荐（v3.1.30）
    projectRecommendConfigs,
    projectRecommends,
    projectDefaultRule,
    // 推荐场景（v3.1.30）
    recommendScenarios,
    scenariosByTarget,
    syncingScenarios,        // v3.1.38 新增：异步同步状态
    setScenarioEffectStatus, // v3.1.38 新增：手动设置生效状态
    // 规则模板（v3.1.30）
    ruleTemplates,
    templatesByTarget,
    // 推荐规则实体（v3.1.31 新增 — 独立化规则定义）
    recommendRules,
    getRuleById,
    rulesByTarget,
    allRulesByTarget,
    addRule,
    updateRule,
    deleteRule,
    setScenarioRule,
    updateScenarioDisplayLimit,
    // 场景化规则引用便捷计算属性（v3.1.31 — APP端使用）
    // v3.1.34：移除 projectScenarioRule，新增 mallProjectsRule
    liveScenarioRule,
    productScenarioRule,
    mallProjectsRule,
    mallFeaturedProductRule,
    mallFeaturedLiveRule,
    // 排序工具函数
    sortLiveByDimensions,
    sortProductByDimensions,
    sortRecommendByDimensions,
    // 通用
    unreadCount,
  };
});
