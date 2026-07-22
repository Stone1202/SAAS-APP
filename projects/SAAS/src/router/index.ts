import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/admin/tenants' },

    // 运营后台
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      children: [
        { path: 'tenants', name: 'TenantToggle', component: () => import('@/pages/admin/TenantToggle.vue'), meta: { title: '租户审查开关' } },
      ],
    },

    // 内容审查管理（独立页面）
    {
      path: '/audit',
      component: () => import('@/layouts/AuditLayout.vue'),
      children: [
        { path: 'review-center', name: 'ReviewCenter', component: () => import('@/pages/audit/ReviewCenter.vue'), meta: { title: '中控室-内容审查' } },
        { path: 'keywords', name: 'KeywordLibrary', component: () => import('@/pages/audit/KeywordLibrary.vue'), meta: { title: '敏感词库管理' } },
        { path: 'violations', name: 'ViolationList', component: () => import('@/pages/audit/ViolationList.vue'), meta: { title: '违规记录管理' } },
        { path: 'statistics', name: 'StatisticsDashboard', component: () => import('@/pages/audit/StatisticsDashboard.vue'), meta: { title: '违规统计看板' } },
      ],
    },

    // 租户后台 — 独立布局
    {
      path: '/tenant',
      component: () => import('@/layouts/TenantLayout.vue'),
      children: [
        { path: 'control-room', name: 'TenantControlRoom', component: () => import('@/pages/tenant/ControlRoom.vue'), meta: { title: '租户直播中控室' } },
      ],
    },

    // 观众APP — 直播间
    {
      path: '/app',
      children: [
        { path: 'live', name: 'AppLiveRoom', component: () => import('@/pages/app/LiveRoom.vue'), meta: { title: '观众直播间' } },
      ],
    },
  ],
})

export default router
