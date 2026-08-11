<template>
  <!-- APP容器 — 移动端框架（5 Tab） -->
  <div class="mobile-frame">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <span class="time">{{ timeText }}</span>
      <span class="icons">
        <span>📶</span><span>📡</span><span>🔋</span>
      </span>
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>

    <!-- 底部 Tab Bar -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        :class="['tab-item', { active: isActive(tab) }]"
        @click="goTab(tab)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/user-store';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const timeText = ref('');
let timer: number | undefined;

function updateTime() {
  const d = new Date();
  timeText.value = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
onMounted(() => { updateTime(); timer = window.setInterval(updateTime, 30000); });
onUnmounted(() => { if (timer) clearInterval(timer); });

interface Tab {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

const tabs = computed<Tab[]>(() => [
  { path: '/app/home', label: '首页', icon: '🏠' },
  { path: '/app/mall', label: '商城', icon: '🛍️' },
  { path: '/app/entertainment', label: '娱乐', icon: '🎮' },
  { path: '/app/message', label: '消息', icon: '💬', badge: userStore.unreadCount || undefined },
  { path: '/app/mine', label: '我的', icon: '👤' },
]);

function isActive(tab: Tab) {
  return route.path === tab.path || route.path.startsWith(tab.path + '/');
}

function goTab(tab: Tab) {
  router.push(tab.path);
}
</script>

<style scoped>
.mobile-frame {
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.status-bar .icons { display: flex; gap: 4px; font-size: 12px; }
.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.content-area::-webkit-scrollbar { display: none; }
.tab-bar {
  display: flex;
  background: #fff;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0 6px;
  position: relative;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}
.tab-item.active { color: #FF6B35; }
.tab-icon { font-size: 22px; line-height: 1; }
.tab-label { font-size: 10px; margin-top: 2px; }
.tab-badge {
  position: absolute;
  top: 2px;
  right: 50%;
  margin-right: -22px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #F5222D;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
}
</style>
