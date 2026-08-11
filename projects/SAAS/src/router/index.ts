/**
 * 路由配置 — 单一事实源
 *
 * 业务系统×终端路由前缀规则：
 *   /admin/  → PC-运营后台（SAAS运营后台）
 *   /tenant/ → PC-租户后台（SAAS租户后台）
 *   /h5/     → H5-观众端（移动端APP）
 *   /app/    → APP端（移动端APP，平台→项目→门店）
 *
 * PRD §17 路由规划表（v1.0.0）：
 *   行1 | /admin/tenant                   | FN-AUDIT-PC-001   | 弹窗
 *   行2 | /tenant/live/:streamId/violations | FN-AUDIT-PC-002   | 历史违规列表（侧滑面板）
 *   行3 | /tenant/live-control?tab=audit    | FN-AUDIT-PC-002/003 | 实时审查入口
 *   行4 | /tenant/live/:streamId/replay     | FN-AUDIT-PC-004   | 回放详情+擦音
 *   行5 | /tenant/live/:streamId/violations | FN-AUDIT-PC-003   | 违规处置+擦音模式
 *   行6 | /h5/live/:roomId                 | FN-AUDIT-APP-001  | 直播模拟+擦音效果
 *
 * APP端路由（v2.0.0）：
 *   /app/home          | 平台首页（Tab1）
 *   /app/mall          | 商城页（Tab2，精选+项目列表切换）
 *   /app/entertainment | 娱乐页（Tab3 占位）
 *   /app/message       | 消息页（Tab4 占位）
 *   /app/mine          | 个人中心（Tab5）
 *   /app/mine/member   | 平台会员中心
 *   /app/project/:projectId               | 项目首页（项目Tab1）
 *   /app/project/:projectId/stores         | 门店列表（项目Tab2）
 *   /app/project/:projectId/lives          | 直播列表（项目Tab3）
 *   /app/project/:projectId/member         | 会员中心（项目Tab4）
 *   /app/project/:projectId/store/:storeId | 门店详情
 *
 * 后台管理路由（v2.0.0）：
 *   /admin/ad          | 运营后台-广告位管理
 *   /admin/kingkong    | 运营后台-金刚区管理
 *   /admin/recommend   | 运营后台-推荐管理
 *   /admin/floor       | 运营后台-楼层管理
 *   /tenant/projects                         | 租户后台-项目管理
 *   /tenant/projects/:projectId/stores       | 租户后台-门店管理
 *   /tenant/projects/:projectId/home-config   | 租户后台-项目首页配置
 */

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

// ============================================
// 页面组件（懒加载）— 内容审查域
// ============================================
const AdminTenantPage = () => import('../pages/audit-switch/AuditSwitchPage.vue');
const TenantDashboardEntry = () => import('../pages/tenant-dashboard/TenantDashboardEntry.vue');
const ViolationsPanel = () => import('../pages/violations/ViolationsPanel.vue');
const LiveControlAuditPanel = () => import('../pages/live-control/LiveControlAuditPanel.vue');
const ReplayDetailAudit = () => import('../pages/replay/ReplayDetailAudit.vue');
const AudienceLiveRoom = () => import('../pages/viewer/AudienceLiveRoom.vue');

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
const ProjectStores = () => import('../pages/app/project/ProjectStores.vue');
const ProjectLives = () => import('../pages/app/project/ProjectLives.vue');
const ProjectMember = () => import('../pages/app/project/ProjectMember.vue');
const StoreDetail = () => import('../pages/app/store/StoreDetail.vue');

// ─── 搜索页 ───
const SearchPage = () => import('../pages/app/search/SearchPage.vue');
const SearchResultPage = () => import('../pages/app/search/SearchResultPage.vue');

// ============================================
// 页面组件（懒加载）— 运营后台（APP配置）
// ============================================
const AdManage = () => import('../pages/admin-app/AdManage.vue');
const KingKongManage = () => import('../pages/admin-app/KingKongManage.vue');
const SearchManage = () => import('../pages/admin-app/SearchManage.vue');
const LiveRecommendManage = () => import('../pages/admin-app/LiveRecommendManage.vue');
const ProductRecommendManage = () => import('../pages/admin-app/ProductRecommendManage.vue');
const FloorManage = () => import('../pages/admin-app/FloorManage.vue');

// ============================================
// 页面组件（懒加载）— 租户后台（项目/门店管理）
// ============================================
const ProjectManage = () => import('../pages/tenant-app/ProjectManage.vue');
const StoreManage = () => import('../pages/tenant-app/StoreManage.vue');
const ProjectHomeConfig = () => import('../pages/tenant-app/ProjectHomeConfig.vue');

// ============================================
// 路由定义（严格对齐 PRD §17 逐行映射）
// ============================================
const routes: RouteRecordRaw[] = [
  // ─── PC-运营后台（/admin/ 前缀）───
  // PRD §17 行1：/admin/tenant → 租户管理列表 → 操作列「直播审查开关」→ 二次确认弹窗
  {
    path: '/admin/tenant',
    name: 'AdminTenant',
    component: AdminTenantPage,
    meta: {
      terminal: 'pc-operator',       // PC-运营后台
      system: 'SAAS运营后台',
      fn: ['FN-AUDIT-PC-001'],       // PRD §17 行1
      page: 'PG-AUDIT-PC-001',
      description: '租户管理列表 → 操作列「直播审查开关」→ 二次确认弹窗',
    },
  },

  // ─── PC-租户后台（/tenant/ 前缀）───
  // 仿真入口模拟页（非PRD路由，仿真需要）：模拟直播列表 →「更多」菜单入口
  {
    path: '/tenant/dashboard',
    name: 'TenantDashboard',
    component: TenantDashboardEntry,
    meta: {
      terminal: 'pc-tenant',         // PC-租户后台
      system: 'SAAS租户后台',
      fn: [],                         // 仿真入口页（非PRD路由）
      page: 'PG-ENTRY-TENANT-001',
      description: '仿真入口：模拟直播列表 →「更多」下拉菜单（查看历史违规列表 / 查看回放）+「中控台」按钮',
    },
  },
  // PRD §17 行3：/tenant/live-control?tab=audit → 直播中控台「直播审查」Tab
  {
    path: '/tenant/live-control',
    name: 'LiveControlAudit',
    component: LiveControlAuditPanel,
    meta: {
      terminal: 'pc-tenant',         // PC-租户后台
      system: 'SAAS租户后台',
      fn: ['FN-AUDIT-PC-002', 'FN-AUDIT-PC-003'],  // PRD §17 行3
      page: 'PG-AUDIT-PC-002',
      description: '直播中控台 → 右侧「直播审查」Tab（?tab=audit&streamId=xxx）→ 侧滑面板（违规列表+告警统计+处置操作）',
    },
  },
  // PRD §17 行2+行5：/tenant/live/:streamId/violations → 历史违规列表 + 处置操作 + 擦音模式
  {
    path: '/tenant/live/:streamId/violations',
    name: 'ViolationsPanel',
    component: ViolationsPanel,
    meta: {
      terminal: 'pc-tenant',         // PC-租户后台
      system: 'SAAS租户后台',
      fn: ['FN-AUDIT-PC-002', 'FN-AUDIT-PC-003'],  // PRD §17 行2+行5
      page: 'PG-AUDIT-PC-004',
      description: '直播列表 → 操作列「更多」→「查看历史违规列表」→ 侧滑面板（违规列表+处置操作+擦音模式切换）',
    },
  },
  // PRD §17 行4：/tenant/live/:streamId/replay → 回放详情页 + 擦音处理
  {
    path: '/tenant/live/:streamId/replay',
    name: 'ReplayDetailAudit',
    component: ReplayDetailAudit,
    meta: {
      terminal: 'pc-tenant',         // PC-租户后台
      system: 'SAAS租户后台',
      fn: ['FN-AUDIT-PC-004'],       // PRD §17 行4
      page: 'PG-AUDIT-PC-003',
      description: '直播列表 → 操作列「更多」→「查看回放」→ 回放详情页+擦音处理',
    },
  },

  // ─── H5-观众端（/h5/ 前缀）───
  // PRD §17 行6：/h5/live/:roomId → 直播间 → 审查效果叠加层
  {
    path: '/h5/live/:roomId',
    name: 'AudienceLiveRoom',
    component: AudienceLiveRoom,
    meta: {
      terminal: 'h5-app',            // H5-观众端（移动端APP）
      system: 'H5观众端',
      fn: ['FN-AUDIT-APP-001'],      // PRD §17 行6
      page: 'PG-AUDIT-APP-001',
      description: '观众直播间页面 → 视频画面区中央叠加审查效果层',
    },
  },

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
      // 搜索页
      { path: 'search', name: 'AppSearch', component: SearchPage, meta: { terminal: 'app' } },
      // 搜索结果页
      { path: 'search/result', name: 'AppSearchResult', component: SearchResultPage, meta: { terminal: 'app' } },
    ],
  },

  // ─── 项目维度（/app/project/:projectId，项目容器4 Tab）───
  {
    path: '/app/project/:projectId',
    component: ProjectFrame,
    children: [
      // 项目Tab1: 项目首页
      { path: '', name: 'ProjectHome', component: ProjectHome, meta: { terminal: 'app', tab: 'home' } },
      { path: 'home', name: 'ProjectHomeTab', component: ProjectHome, meta: { terminal: 'app', tab: 'home' } },
      // 项目Tab2: 门店列表
      { path: 'stores', name: 'ProjectStores', component: ProjectStores, meta: { terminal: 'app', tab: 'stores' } },
      // 项目Tab3: 直播列表
      { path: 'lives', name: 'ProjectLives', component: ProjectLives, meta: { terminal: 'app', tab: 'lives' } },
      // 项目Tab4: 会员中心
      { path: 'member', name: 'ProjectMember', component: ProjectMember, meta: { terminal: 'app', tab: 'member' } },
      // 门店详情（子页面）
      { path: 'store/:storeId', name: 'StoreDetail', component: StoreDetail, meta: { terminal: 'app' } },
    ],
  },

  // ─── 运营后台-APP配置（/admin/ 前缀扩展，使用 AdminLayout 包裹）───
  {
    path: '/admin',
    component: () => import('../components/admin/AdminLayout.vue'),
    children: [
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
        path: 'live-recommend',
        name: 'AdminLiveRecommend',
        component: LiveRecommendManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '直播推荐管理' },
      },
      {
        path: 'product-recommend',
        name: 'AdminProductRecommend',
        component: ProductRecommendManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '商品推荐管理' },
      },
      {
        path: 'floor',
        name: 'AdminFloor',
        component: FloorManage,
        meta: { terminal: 'pc-operator', system: 'SAAS运营后台', description: '楼层管理' },
      },
    ],
  },

  // ─── 租户后台-项目/门店管理（/tenant/ 前缀扩展，使用 TenantLayout 包裹）───
  {
    path: '/tenant',
    component: () => import('../components/admin/TenantLayout.vue'),
    children: [
      {
        path: 'projects',
        name: 'TenantProjects',
        component: ProjectManage,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: '项目管理' },
      },
      {
        path: 'projects/:projectId/stores',
        name: 'TenantProjectStores',
        component: StoreManage,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: '门店管理' },
      },
      {
        path: 'projects/:projectId/home-config',
        name: 'TenantProjectHomeConfig',
        component: ProjectHomeConfig,
        meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', description: '项目首页配置' },
      },
    ],
  },

  // 默认重定向 → 租户后台仿真入口
  { path: '/', redirect: '/tenant/dashboard' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
