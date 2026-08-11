<template>
  <!-- 租户后台 — 通用 PC 后台布局 -->
  <div class="pc-admin-layout">
    <!-- 左侧菜单 -->
    <aside class="sidebar">
      <div class="logo">
        <el-icon class="logo-icon"><OfficeBuilding /></el-icon>
        <div class="logo-text">
          <div class="logo-title">SAAS 租户后台</div>
          <div class="logo-sub">追伴 APP 管理</div>
        </div>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="side-menu"
        background-color="#001529"
        text-color="#ccc"
        active-text-color="#FF6B35"
      >
        <!-- v3.1.37：项目列表入口移至运营后台，这里仅保留当前项目菜单 -->
        <el-menu-item-group v-if="currentProjectId" :title="'当前项目：' + currentProjectName">
          <el-menu-item :index="profilePath" @click="navigate(profilePath)">
            <el-icon><Setting /></el-icon>
            <span>项目管理</span>
          </el-menu-item>
          <el-menu-item :index="storesPath" @click="navigate(storesPath)">
            <el-icon><Shop /></el-icon>
            <span>门店管理（忽略）</span>
          </el-menu-item>
          <el-menu-item :index="bannersPath" @click="navigate(bannersPath)">
            <el-icon><Picture /></el-icon>
            <span>Banner管理</span>
          </el-menu-item>
          <el-menu-item :index="kingkongPath" @click="navigate(kingkongPath)">
            <el-icon><Grid /></el-icon>
            <span>金刚区管理</span>
          </el-menu-item>
          <el-menu-item :index="marketingPath" @click="navigate(marketingPath)">
            <el-icon><Collection /></el-icon>
            <span>营销分类（忽略）</span>
          </el-menu-item>
        </el-menu-item-group>

        <!-- 未选择项目时的提示 -->
        <el-menu-item-group v-else title="未选择项目">
          <el-menu-item disabled>
            <el-icon><InfoFilled /></el-icon>
            <span>请在顶部选择项目</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>

      <div class="sidebar-footer">
        <a href="javascript:void(0)" @click="goToApp" class="footer-link">
          <el-icon><Iphone /></el-icon>
          查看 APP 端
        </a>
        <a href="javascript:void(0)" @click="goToPrototype" class="footer-link">
          <el-icon><View /></el-icon>
          原型总览
        </a>
      </div>
    </aside>

    <!-- 内容区 -->
    <main class="main-content">
      <header class="header-bar">
        <div class="header-breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>租户后台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentProjectId">{{ currentProjectName }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- v3.1.37：项目下拉选择器（移除项目列表入口后，用户通过此切换项目） -->
          <el-select
            v-model="selectedProjectId"
            placeholder="请选择项目"
            @change="onProjectChange"
            style="width: 220px"
            :empty-values="[]"
          >
            <el-option
              v-for="p in projectStore.projects"
              :key="p.project_id"
              :label="(p.mall_name || p.name) + (p.status === 'inactive' ? '（已停用）' : '')"
              :value="p.project_id"
            />
          </el-select>
          <span class="env-badge">PC 租户后台</span>
        </div>
      </header>
      <div class="content-body">
        <router-view :key="route.fullPath" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { InfoFilled, View } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const projectStore = useProjectStore();

// 从路由中提取当前项目ID
const currentProjectId = computed(() => {
  const pid = route.params.projectId;
  return pid ? String(pid) : '';
});

const currentProjectName = computed(() => {
  if (!currentProjectId.value) return '';
  const p = store.getProjectById(currentProjectId.value);
  return p?.mall_name || p?.name || '';
});

// v3.1.37 项目下拉选择器
const selectedProjectId = ref(currentProjectId.value || '');
watch(currentProjectId, (v) => { selectedProjectId.value = v || ''; });

function onProjectChange(projectId: string) {
  if (projectId) {
    router.push(`/tenant/projects/${projectId}/profile`);
  }
}

// 项目级路由路径
const profilePath = computed(() => `/tenant/projects/${currentProjectId.value}/profile`);
const storesPath = computed(() => `/tenant/projects/${currentProjectId.value}/stores`);
const bannersPath = computed(() => `/tenant/projects/${currentProjectId.value}/banners`);
const kingkongPath = computed(() => `/tenant/projects/${currentProjectId.value}/kingkong`);
const marketingPath = computed(() => `/tenant/projects/${currentProjectId.value}/marketing-categories`);

// 菜单高亮匹配
const activeMenu = computed(() => {
  const path = route.path;
  // 精确匹配项目级路由
  const keyMap: Record<string, string> = {
    profile: `/tenant/projects/${currentProjectId.value}/profile`,
    stores: `/tenant/projects/${currentProjectId.value}/stores`,
    banners: `/tenant/projects/${currentProjectId.value}/banners`,
    kingkong: `/tenant/projects/${currentProjectId.value}/kingkong`,
    'marketing-categories': `/tenant/projects/${currentProjectId.value}/marketing-categories`,
  };
  for (const [, menuPath] of Object.entries(keyMap)) {
    if (path === menuPath) return menuPath;
  }
  return route.path;
});

const menuTitleMap: Record<string, string> = {
  profile: '项目管理',
  stores: '门店管理（忽略）',
  banners: 'Banner管理',
  kingkong: '金刚区管理',
  'marketing-categories': '营销分类（忽略）',
};

const currentTitle = computed(() => {
  const path = route.path;
  // 动态匹配面包屑
  if (path.includes('/profile') || route.name === 'TenantProjectProfile') return '项目管理';
  if (path.includes('/banners') || route.name === 'TenantProjectBanners') return 'Banner管理';
  if (path.includes('/kingkong') || route.name === 'TenantProjectKingKong') return '金刚区管理';
  if (path.includes('/stores') || route.name === 'TenantProjectStores') return '门店管理（忽略）';
  if (path.includes('/marketing-categories') || route.name === 'TenantMarketingCategory') return '营销分类（忽略）';
  return '租户后台';
});
function navigate(path: string) {
  router.push(path);
}

function goToApp() {
  window.open('/app.html', '_blank');
}

function goToPrototype() {
  window.open('/#/prototype', '_blank');
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
  background: linear-gradient(135deg, #667eea, #764ba2);
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