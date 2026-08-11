/**
 * 路由配置 — 单一事实源
 *
 * 业务系统×终端路由前缀规则：
 *   /admin/  → PC-运营后台（SAAS运营后台）
 *   /tenant/ → PC-租户后台（SAAS租户后台）
 *   /app/    → APP端（移动端APP，平台→项目→门店）
 *
 * APP端路由（v3.1.40 — UC重构为功能维度）：
 *   /app/home          | 平台首页（Tab1）
 *   /app/mall          | 商城页（Tab2，精选+项目列表切换）
 *   /app/entertainment | 娱乐页（Tab3 占位）
 *   /app/message       | 消息页（Tab4 占位）
 *   /app/mine          | 个人中心（Tab5）
 *   /app/mine/member   | 平台会员中心
 *   /app/search        | 搜索页
 *   /app/search/result | 搜索结果页
 *   /app/product/:productId    | 商品详情页（独立全屏，脱离框架，v3.1.33）
 *   /app/live/:liveId          | 直播详情页（独立全屏，脱离框架，v3.1.33）
 *   /app/store/:storeId        | 门店详情（独立页，脱离项目框架）
 *   /app/store/:storeId/items  | 门店商品/直播列表（独立页）
 *   /app/project/:projectId               | 项目首页（项目Tab1）
 *   /app/project/:projectId/mall           | 项目商城页（项目Tab2）
 *   /app/project/:projectId/stores         | 我的门店（项目Tab3，v3.1.31）
 *   /app/project/:projectId/member         | 会员中心（项目Tab4）
 *
 * 后台管理路由（v3.1.0）：
 *   /admin/projects        | 运营后台-项目列表（v3.1.37 新增，从租户后台迁移）
 *   /admin/search          | 运营后台-搜索管理
 *   /admin/ad              | 运营后台-广告位管理
 *   /admin/kingkong        | 运营后台-金刚区管理
 *   /admin/recommend-rule  | 运营后台-规则引擎管理（v3.1.31）
 *   /admin/home-recommend   | 运营后台-首页推荐（v3.1.35，2Tab：直播/商品推荐）
 *   /admin/mall-manage     | 运营后台-商城管理（v3.1.34，3Tab）
 *   /admin/function-pages  | 运营后台-功能页面管理（v3.1.44，白名单注册表）
 *   /tenant/projects/:projectId/stores       | 租户后台-门店管理（v3.1.37：项目列表入口移至运营后台）
 *   /tenant/projects/:projectId/marketing-categories | 租户后台-营销分类管理
 *   /tenant/projects/:projectId/profile        | 租户后台-项目管理
 *   /tenant/projects/:projectId/banners        | 租户后台-Banner管理
 *   /tenant/projects/:projectId/kingkong       | 租户后台-金刚区管理
 */

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

// ============================================
// 页面组件（懒加载）— APP端
// ============================================
const MobileFrame = () => import('../components/app/layout/MobileFrame.vue');
const ProjectFrame = () => import('../components/app/layout/ProjectFrame.vue');
const PlatformHome = () => import('../pages/app/home/PlatformHome.vue');
const MallPage = () => import('../pages/app/mall/MallPage.vue');
const EntertainmentPage = () => import('../pages/app/entertainment/EntertainmentPage.vue');
const MessagePage = () => import('../pages/app/message/MessagePage.vue');
const PlatformMine = () => import('../pages/app/mine/PlatformMine.vue');
const PlatformMember = () => import('../pages/app/mine/PlatformMember.vue');
const ProjectHome = () => import('../pages/app/project/ProjectHome.vue');
const ProjectMall = () => import('../pages/app/project/ProjectMall.vue');
const ProjectStores = () => import('../pages/app/project/ProjectStores.vue');
const ProjectMember = () => import('../pages/app/project/ProjectMember.vue');
const ProjectCoupons = () => import('../pages/app/project/ProjectCoupons.vue');
const StoreDetail = () => import('../pages/app/store/StoreDetail.vue');
const StoreItems = () => import('../pages/app/store/StoreItems.vue');
const StoreMoreProducts = () => import('../pages/app/product/StoreMoreProducts.vue');
const ProductDetail = () => import('../pages/app/product/ProductDetail.vue');
const LiveDetail = () => import('../pages/app/live/LiveDetail.vue');

// ─── 搜索页 ───
const SearchPage = () => import('../pages/app/search/SearchPage.vue');
const SearchResultPage = () => import('../pages/app/search/SearchResultPage.vue');

// ─── 收货地址管理 ───
const ShippingAddressManage = () => import('../pages/app/mine/ShippingAddressManage.vue');

// ============================================
// 页面组件（懒加载）— 运营后台（APP配置）
// ============================================
const AdManage = () => import('../pages/admin-app/AdManage.vue');
const KingKongManage = () => import('../pages/admin-app/KingKongManage.vue');
const SearchManage = () => import('../pages/admin-app/SearchManage.vue');
// v3.1.35：合并直播推荐+商品推荐为首页推荐单页
const HomeRecommendManage = () => import('../pages/admin-app/HomeRecommendManage.vue');
const RecommendRuleManage = () => import('../pages/admin-app/RecommendRuleManage.vue');
const MallManage = () => import('../pages/admin-app/MallManage.vue');
// v3.1.37 新增：运营后台项目列表管理
const ProjectListManage = () => import('../pages/admin-app/ProjectListManage.vue');

// ============================================
// 页面组件（懒加载）— 租户后台（项目/门店管理）
// ============================================
const ProjectManage = () => import('../pages/tenant-app/ProjectManage.vue');
// v3.1.37 注：ProjectManage 路由已移除（项目列表迁移至运营后台 /admin/projects），保留组件文件和声明以备复用
const StoreManage = () => import('../pages/tenant-app/StoreManage.vue');
const MarketingCategoryManage = () => import('../pages/tenant-app/MarketingCategoryManage.vue');
const ProjectProfileManage = () => import('../pages/tenant-app/ProjectProfileManage.vue');
const ProjectBannerManage = () => import('../pages/tenant-app/ProjectBannerManage.vue');
const ProjectKingKongManage = () => import('../pages/tenant-app/ProjectKingKongManage.vue');

// ============================================
// 路由定义
// ============================================
const routes: RouteRecordRaw[] = [
  // ─── APP端（/app/ 前缀，移动端容器5 Tab）───
  {
    path: '/app',
    component: MobileFrame,
    children: [
      // Tab1: 平台首页
      { path: 'home', name: 'AppHome', component: PlatformHome, meta: { terminal: 'app', tab: 'home' } },
      // Tab2: 商城（精选+项目列表切换）
      { path: 'mall', name: 'AppMall', component: MallPage, meta: { terminal: 'app', tab: 'mall' } },
      // Tab3: 娱乐（占位）
      { path: 'entertainment', name: 'AppEntertainment', component: EntertainmentPage, meta: { terminal: 'app', tab: 'entertainment' } },
      // Tab4: 消息（占位）
      { path: 'message', name: 'AppMessage', component: MessagePage, meta: { terminal: 'app', tab: 'message' } },
      // Tab5: 个人中心
      { path: 'mine', name: 'AppMine', component: PlatformMine, meta: { terminal: 'app', tab: 'mine' } },
      // 平台会员中心
      { path: 'mine/member', name: 'AppPlatformMember', component: PlatformMember, meta: { terminal: 'app' } },
      // 收货地址管理
      { path: 'mine/addresses', name: 'AppShippingAddress', component: ShippingAddressManage, meta: { terminal: 'app' } },
      // 搜索页
      { path: 'search', name: 'AppSearch', component: SearchPage, meta: { terminal: 'app' } },
      // 搜索结果页
      { path: 'search/result', name: 'AppSearchResult', component: SearchResultPage, meta: { terminal: 'app' } },
    ],
  },

  // ─── 商品详情页（独立全屏，脱离 MobileFrame 和 ProjectFrame）v3.1.33 ───
  {
    path: '/app/product/:productId',
    name: 'AppProductDetail',
    component: ProductDetail,
    meta: { terminal: 'app' },
  },
  // ─── 直播详情页（独立全屏，脱离 MobileFrame 和 ProjectFrame）v3.1.33 ───
  {
    path: '/app/live/:liveId',
    name: 'AppLiveDetail',
    component: LiveDetail,
    meta: { terminal: 'app' },
  },

  // ─── 项目维度（/app/project/:projectId，项目容器4 Tab）───
  {
    path: '/app/project/:projectId',
    component: ProjectFrame,
    children: [
      // 项目Tab1: 项目首页
      { path: '', name: 'ProjectHome', component: ProjectHome, meta: { terminal: 'app', tab: 'home' } },
      { path: 'home', name: 'ProjectHomeTab', component: ProjectHome, meta: { terminal: 'app', tab: 'home' } },
      // 项目Tab2: 项目商城页
      { path: 'mall', name: 'ProjectMall', component: ProjectMall, meta: { terminal: 'app', tab: 'mall' } },
      // 项目Tab3: 门店列表
      { path: 'stores', name: 'ProjectStores', component: ProjectStores, meta: { terminal: 'app', tab: 'stores' } },
      // 项目Tab4: 会员中心
      { path: 'member', name: 'ProjectMember', component: ProjectMember, meta: { terminal: 'app', tab: 'member' } },
    ],
  },

  // ─── 门店独立页面（脱离项目框架，独立全屏）───
  {
    path: '/app/store/:storeId',
    name: 'StoreDetail',
    component: StoreDetail,
    meta: { terminal: 'app' },
  },
  {
    path: '/app/store/:storeId/items',
    name: 'StoreItems',
    component: StoreItems,
    meta: { terminal: 'app' },
  },

  // ─── 更多商品分类独立页（脱离项目框架，独立全屏）UC-SHP-PRODUCT-002 ───
  {
    path: '/app/more-products',
    name: 'StoreMoreProducts',
    component: StoreMoreProducts,
    meta: { terminal: 'app' },
  },

  // ─── 项目维度-优惠券独立页（脱离项目框架，独立全屏）───
  {
    path: '/app/project/:projectId/coupons',
    name: 'ProjectCoupons',
    component: ProjectCoupons,
    meta: { terminal: 'app' },
  },

  // ─── 运营后台-APP配置（/admin/ 前缀扩展，使用 AdminLayout 包裹）───
  {
    path: '/admin',
    component: () => import('../components/admin/AdminLayout.vue'),
    children: [
      {
        // v3.1.37 新增：运营后台项目列表（从租户后台迁移，增加启用/禁用操作）
        path: 'projects',
        name: 'AdminProjects',
        component: ProjectListManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '项目列表' },
      },
      {
        path: 'search',
        name: 'AdminSearch',
        component: SearchManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '搜索管理' },
      },
      {
        path: 'ad',
        name: 'AdminAd',
        component: AdManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '广告位管理' },
      },
      {
        path: 'kingkong',
        name: 'AdminKingKong',
        component: KingKongManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '金刚区管理' },
      },
      {
        // v3.1.44 新增：功能页面管理（白名单注册表，替代自由输入URL）
        path: 'function-pages',
        name: 'AdminFunctionPages',
        component: () => import('../pages/admin-app/FunctionPageManage.vue'),
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '功能页面管理' },
      },
      {
        // v3.1.35：首页推荐（2Tab — 直播推荐/商品推荐，合并原2个独立页面）
        path: 'home-recommend',
        name: 'AdminHomeRecommend',
        component: HomeRecommendManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '首页推荐' },
      },
      {
        // v3.1.34：商城管理（3Tab — 商城列表/精选商品/精选直播）
        path: 'mall-manage',
        name: 'AdminMallManage',
        component: MallManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '商城管理' },
      },
      {
        path: 'recommend-rule',
        name: 'AdminRecommendRule',
        component: RecommendRuleManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '规则引擎管理' },
      },
    ],
  },

  // ─── 租户后台-项目/门店管理（/tenant/ 前缀扩展，使用 TenantLayout 包裹）───
  {
    path: '/tenant',
    component: () => import('../components/admin/TenantLayout.vue'),
    children: [
      // v3.1.37：项目列表入口移至运营后台(/admin/projects)，租户后台通过顶部下拉选择器切换项目
      {
        path: 'projects/:projectId/stores',
        name: 'TenantProjectStores',
        component: StoreManage,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: '门店管理' },
      },
      {
        path: 'projects/:projectId/stores/:storeId/inviters',
        name: 'TenantStoreInviters',
        component: StoreManage,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: '店长/店员管理' },
      },
      {
        path: 'projects/:projectId/marketing-categories',
        name: 'TenantMarketingCategory',
        component: MarketingCategoryManage,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: '营销分类管理' },
      },
      {
        path: 'projects/:projectId/profile',
        name: 'TenantProjectProfile',
        component: ProjectProfileManage,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: '项目管理' },
      },
      {
        path: 'projects/:projectId/banners',
        name: 'TenantProjectBanners',
        component: ProjectBannerManage,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: 'Banner管理' },
      },
      {
        path: 'projects/:projectId/kingkong',
        name: 'TenantProjectKingKong',
        component: ProjectKingKongManage,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: '金刚区管理' },
      },
    ],
  },

  // v3.1.39：原型总览页（独立访问地址，不包裹任何 Layout，用于开发查看三端页面+用例卡+文档）
  {
    path: '/prototype',
    name: 'PrototypeExplorer',
    component: () => import('../pages/prototype/PrototypePage.vue'),
    meta: { terminal: 'prototype', description: '原型查看工具' },
  },

  // 默认重定向 → APP端首页
  { path: '/', redirect: '/app/home' },
  // v3.1.37：/tenant 直接访问时重定向到第一个 active 项目的 profile 页（租户后台入口）
  { path: '/tenant', redirect: '/tenant/projects/proj-daily-01/profile' },
  { path: '/tenant/projects', redirect: '/tenant/projects/proj-daily-01/profile' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
