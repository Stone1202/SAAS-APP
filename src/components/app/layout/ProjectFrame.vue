<template>
  <!-- 项目维度容器 — 真机模拟 -->
  <div class="project-frame">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <span class="sb-time">{{ timeText }}</span>
      <span class="sb-notch"></span>
      <span class="sb-icons">📶 WiFi 🔋 87%</span>
    </div>

    <!-- 项目导航栏 — 返回按钮 + 项目名称 + 右侧操作区 -->
    <div class="nav-bar">
      <div class="nav-back" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="nav-title">{{ projectName }}</div>
      <div class="nav-actions"></div>
    </div>

    <!-- 内容区（导航移至底部，内容区独占中间） -->
    <div class="content-area">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>

    <!-- 项目底部导航 — 固定底部（首页/商城/门店/会员） -->
    <div class="project-tabbar">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        :class="['tb-item', { active: isActive(tab) }]"
        @click="switchTab(tab)"
      >
        <span class="tb-icon">{{ tab.icon }}</span>
        <span class="tb-label">{{ tab.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import { useProjectActiveCheck } from '../../../composables/useProjectActiveCheck';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const { checkProjectActive } = useProjectActiveCheck();

// 时间
const timeText = ref('');
let timer: number | undefined;
function updateTime() {
  const d = new Date();
  timeText.value = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 30000);
  // v3.1.37 BR-SHP-043 Layer2：进入项目时检查项目状态，inactive 弹窗提示并返回
  checkProjectActive(projectId.value);
});
onUnmounted(() => { if (timer) clearInterval(timer); });

// 当前项目
const projectId = computed(() => route.params.projectId as string);

// 项目名称（优先使用商城名称 mall_name）
const projectName = computed(() => {
  const proj = store.getProjectById(projectId.value);
  return proj?.mall_name || proj?.name || '项目';
});

// Tab定义 — 首页/商城/门店/会员（v3.1.31：门店Tab恢复为"我的门店"，显示绑定门店详情或未绑定引导）
interface TabItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

const tabs = computed<TabItem[]>(() => [
  { path: `/app/project/${projectId.value}`, label: '首页', icon: '🏠' },
  { path: `/app/project/${projectId.value}/mall`, label: '商城', icon: '🛍️' },
  { path: `/app/project/${projectId.value}/stores`, label: '门店', icon: '🏪' },
  { path: `/app/project/${projectId.value}/member`, label: '会员', icon: '👤' },
]);

// 激活判断 — 支持子路由高亮（如门店详情/store/:storeId激活"门店"Tab）
function isActive(tab: TabItem) {
  // 首页Tab精确匹配，其他Tab支持前缀匹配子路由
  if (tab.path === `/app/project/${projectId.value}`) {
    return route.path === tab.path || route.path === `${tab.path}/home`;
  }
  return route.path === tab.path || route.path.startsWith(`${tab.path}/`);
}

// Tab切换
function switchTab(tab: TabItem) {
  router.push(tab.path);
}

// 返回逻辑：非首页Tab → 返回项目首页；首页Tab → 返回平台商城页
function goBack() {
  const homePath = `/app/project/${projectId.value}`;
  const currentPath = route.path;
  // 当前已在项目首页Tab → 返回平台商城页
  if (currentPath === homePath || currentPath === `${homePath}/home`) {
    router.push('/app/mall');
  } else {
    // 从其他Tab（商城/门店/会员）返回 → 回到项目首页
    router.push(homePath);
  }
}
</script>

<style scoped>
.project-frame {
  width: 100%;
  max-width: 414px;
  height: 100vh;
  max-height: 896px;
  margin: 0 auto;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', sans-serif;
  box-shadow: 0 0 30px rgba(0,0,0,0.15);
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px 4px;
  background: #fff;
  font-size: 11px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}
.sb-notch { width: 60px; }
.sb-icons { color: #666; font-size: 10px; }

/* 导航栏 — 简洁，返回按钮 + 居中项目名称 */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 44px;
  background: #fff;
  flex-shrink: 0;
  position: relative;
}
.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #333;
  flex-shrink: 0;
  transition: background 0.15s;
}
.nav-back:active { background: #f0f0f0; }
.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 17px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
}

/* 项目Tab — 底部固定导航 */
.project-tabbar {
  display: flex;
  background: #fff;
  flex-shrink: 0;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -1px 8px rgba(0,0,0,0.04);
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.tb-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  gap: 2px;
}
.tb-item.active {
  color: #FF6B35;
}
.tb-icon {
  font-size: 20px;
  line-height: 1;
}
.tb-label {
  font-size: 11px;
  font-weight: 500;
}
.tb-item.active .tb-label { font-weight: 600; }

/* 内容区 */
.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: #f5f5f5;
}
.content-area::-webkit-scrollbar { display: none; }
</style>
