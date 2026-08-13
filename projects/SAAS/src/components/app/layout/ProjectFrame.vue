<template>
  <!-- 项目维度容器 — 真机模拟 -->
  <div class="project-frame">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <span class="sb-time">{{ timeText }}</span>
      <span class="sb-notch"></span>
      <span class="sb-icons">📶 WiFi 🔋 87%</span>
    </div>

    <!-- 项目导航栏 -->
    <div class="nav-bar">
      <div class="nav-back" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="nav-title">{{ project?.name || '项目' }}</div>
      <div class="nav-actions">
        <span class="nav-action-btn" @click="$router.push('/app/message')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <span class="nav-action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </span>
      </div>
    </div>

    <!-- 项目信息卡片 -->
    <div class="project-info" v-if="project">
      <div class="pi-cover" :style="{ background: projectCoverGradient }">
        <div class="pi-logo-frame">
          <span class="pi-logo-text">{{ logoText }}</span>
        </div>
        <div class="pi-text">
          <div class="pi-name">{{ project.name }}</div>
          <div class="pi-desc">{{ project.description || '品质生活，尽在这里' }}</div>
          <div class="pi-stats">
            <span>{{ formatCount(project.store_count || 0) }} 家门店</span>
            <span class="pi-dot">·</span>
            <span>{{ formatCount(productCount) }} 件商品</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目Tab导航 -->
    <div class="project-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        :class="['pt-item', { active: isActive(tab) }]"
        @click="switchTab(tab)"
      >
        <span class="pt-label">{{ tab.label }}</span>
        <span v-if="tab.badge" class="pt-badge">{{ tab.badge }}</span>
        <div v-if="isActive(tab)" class="pt-indicator"></div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();

// 时间
const timeText = ref('');
let timer: number | undefined;
function updateTime() {
  const d = new Date();
  timeText.value = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
onMounted(() => { updateTime(); timer = window.setInterval(updateTime, 30000); });
onUnmounted(() => { if (timer) clearInterval(timer); });

// 当前项目
const projectId = computed(() => route.params.projectId as string);
const project = computed(() => store.getProjectById(projectId.value));

// 商品数量
const productCount = computed(() => store.productsByProject(projectId.value).length);

// 封面渐变
const projectCoverGradient = computed(() => {
  const id = projectId.value;
  if (id.includes('daily')) return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
  if (id.includes('kitchen')) return 'linear-gradient(135deg, #667eea, #764ba2)';
  if (id.includes('sports')) return 'linear-gradient(135deg, #11998e, #38ef7d)';
  if (id.includes('digital')) return 'linear-gradient(135deg, #0F2027, #203A43)';
  return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
});

// Logo首字
const logoText = computed(() => (project.value?.name || '项').charAt(0));

// 格式化数量
function formatCount(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Tab定义
interface TabItem {
  path: string;
  label: string;
  badge?: number;
}

const tabs = computed<TabItem[]>(() => [
  { path: `/app/project/${projectId.value}` },
  { path: `/app/project/${projectId.value}/stores` },
  { path: `/app/project/${projectId.value}/lives` },
  { path: `/app/project/${projectId.value}/member` },
]);

// 激活判断
function isActive(tab: TabItem) {
  return route.path === tab.path;
}

// Tab切换
function switchTab(tab: TabItem) {
  // 设置label
  const labelMap: Record<number, string> = { 0: '首页', 1: '门店', 2: '直播', 3: '会员' };
  const idx = tabs.value.indexOf(tab);
  if (idx !== 1) {
    tabs.value[1].label = '门店';
  }
  tabs.value[idx].label = labelMap[idx] || tab.label;
  router.push(tab.path);
}

// 初始化Tab名称
onMounted(() => {
  if (!tabs.value[0].label) {
    tabs.value.forEach((t, i) => {
      const labelMap: Record<number, string> = { 0: '首页', 1: '门店', 2: '直播', 3: '会员' };
      t.label = labelMap[i] || t.label;
    });
  }
});

// 返回APP首页
function goBack() {
  router.push('/app/home');
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

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 44px;
  background: #fff;
  flex-shrink: 0;
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
  transition: background 0.15s;
}
.nav-back:active { background: #f0f0f0; }
.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #111;
}
.nav-actions {
  display: flex;
  gap: 12px;
}
.nav-action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #555;
  transition: background 0.15s;
}
.nav-action-btn:active { background: #f0f0f0; }

/* 项目信息卡片 */
.project-info {
  flex-shrink: 0;
  padding: 10px 16px 4px;
  background: #fff;
}
.pi-cover {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 14px;
  gap: 14px;
  position: relative;
  overflow: hidden;
}
.pi-cover::after {
  content: '';
  position: absolute;
  right: -10px;
  top: -10px;
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}
.pi-logo-frame {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}
.pi-logo-text {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}
.pi-text { flex: 1; min-width: 0; position: relative; z-index: 1; }
.pi-name {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}
.pi-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  margin-top: 4px;
}
.pi-stats {
  display: flex;
  align-items: center;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255,255,255,0.75);
}
.pi-dot { margin: 0 6px; color: rgba(255,255,255,0.5); }

/* 项目Tab */
.project-tabs {
  display: flex;
  background: #fff;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0 8px;
  border-bottom: 1px solid #f0f0f0;
}
.pt-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  position: relative;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: color 0.2s;
}
.pt-item.active {
  color: #FF6B35;
  font-weight: 600;
}
.pt-badge {
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  background: #F5222D;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  margin-left: 4px;
}
.pt-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: #FF6B35;
  border-radius: 2px;
}

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
