/**
 * 路由配置 — PRD §17「三终端路由/入口复用」单一事实源
 *
 * 业务系统×终端路由前缀规则：
 *   /admin/  → PC-运营后台（SAAS运营后台）
 *   /tenant/ → PC-租户后台（SAAS租户后台）
 *   /h5/     → H5-观众端（移动端APP）
 *
 * PRD §17 路由规划表（v1.0.0）：
 *   行1 | /admin/tenant                   | FN-AUDIT-PC-001   | 弹窗
 *   行2 | /tenant/live/:streamId/violations | FN-AUDIT-PC-002   | 历史违规列表（侧滑面板）
 *   行3 | /tenant/live-control?tab=audit    | FN-AUDIT-PC-002/003 | 实时审查入口
 *   行4 | /tenant/live/:streamId/replay     | FN-AUDIT-PC-004   | 回放详情+擦音
 *   行5 | /tenant/live/:streamId/violations | FN-AUDIT-PC-003   | 违规处置+擦音模式
 *   行6 | /h5/live/:roomId                 | FN-AUDIT-APP-001  | 直播模拟+擦音效果
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// ============================================
// 页面组件（懒加载）
// ============================================
const AdminTenantPage = () => import('../pages/audit-switch/AuditSwitchPage.vue');
const TenantDashboardEntry = () => import('../pages/tenant-dashboard/TenantDashboardEntry.vue');
const ViolationsPanel = () => import('../pages/violations/ViolationsPanel.vue');
const LiveControlAuditPanel = () => import('../pages/live-control/LiveControlAuditPanel.vue');
const ReplayDetailAudit = () => import('../pages/replay/ReplayDetailAudit.vue');
const AudienceLiveRoom = () => import('../pages/viewer/AudienceLiveRoom.vue');

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

  // 默认重定向 → 租户后台仿真入口
  { path: '/', redirect: '/tenant/dashboard' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
