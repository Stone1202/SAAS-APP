<template>
  <!-- 运营后台/租户后台 — 通用 PC 后台布局 -->
  <div class="pc-admin-layout">
    <!-- 左侧菜单 -->
    <aside class="sidebar">
      <div class="logo">
        <el-icon class="logo-icon"><Setting /></el-icon>
        <div class="logo-text">
          <div class="logo-title">SAAS 运营后台</div>
          <div class="logo-sub">追伴 APP 配置</div>
        </div>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="side-menu"
        background-color="#001529"
        text-color="#ccc"
        active-text-color="#FF6B35"
      >
        <el-menu-item-group title="APP首页配置">
          <el-menu-item index="/admin/search" @click="navigate('/admin/search')">
            <el-icon><Search /></el-icon>
            <span>搜索管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/ad" @click="navigate('/admin/ad')">
            <el-icon><PictureRounded /></el-icon>
            <span>广告位管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/kingkong" @click="navigate('/admin/kingkong')">
            <el-icon><Grid /></el-icon>
            <span>金刚区管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/live-recommend" @click="navigate('/admin/live-recommend')">
            <el-icon><VideoCamera /></el-icon>
            <span>直播推荐管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/product-recommend" @click="navigate('/admin/product-recommend')">
            <el-icon><Goods /></el-icon>
            <span>商品推荐管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/floor" @click="navigate('/admin/floor')">
            <el-icon><Files /></el-icon>
            <span>楼层管理</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>

      <div class="sidebar-footer">
        <a href="javascript:void(0)" @click="goToApp" class="footer-link">
          <el-icon><Iphone /></el-icon>
          查看 APP 端
        </a>
      </div>
    </aside>

    <!-- 内容区 -->
    <main class="main-content">
      <header class="header-bar">
        <div class="header-breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/search' }">运营后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <span class="env-badge">PC 运营后台</span>
        </div>
      </header>
      <div class="content-body">
        <router-view :key="route.fullPath" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const activeMenu = computed(() => route.path);

const menuTitleMap: Record<string, string> = {
  '/admin/search': '搜索管理',
  '/admin/ad': '广告位管理',
  '/admin/kingkong': '金刚区管理',
  '/admin/live-recommend': '直播推荐管理',
  '/admin/product-recommend': '商品推荐管理',
  '/admin/floor': '楼层管理',
};

const currentTitle = computed(() => menuTitleMap[route.path] || '运营后台');

function navigate(path: string) {
  router.push(path);
}

function goToApp() {
  window.open('/app.html', '_blank');
}
</script>

<style scoped>
.pc-admin-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background: #f0f2f5;
}

/* 左侧 */
.sidebar {
  width: 240px;
  background: #001529;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  background: #002040;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.logo-icon {
  font-size: 28px;
  color: #FF6B35;
}
.logo-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.logo-sub {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}
.side-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}
.side-menu :deep(.el-menu-item-group__title) {
  font-size: 11px;
  color: #555;
  padding: 12px 20px 6px;
  letter-spacing: 1px;
}
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}
.footer-link:hover { color: #FF6B35; }

/* 右侧 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}
.header-breadcrumb {
  font-size: 13px;
}
.env-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 11px;
  border-radius: 12px;
  font-weight: 600;
}
.content-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
</style>
