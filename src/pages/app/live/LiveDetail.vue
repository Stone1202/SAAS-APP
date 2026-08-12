<template>
  <!-- 直播详情页 — 空页展位（v3.1.46 需求调整：全部内容移除，仅保留占位说明） -->
  <div class="ld-page">
    <!-- 顶部状态栏 -->
    <div class="ld-status-bar">
      <span class="lsb-time">{{ currentTime }}</span>
      <span class="lsb-icons">📶 🔋</span>
    </div>

    <!-- 主体 -->
    <div class="ld-body">
      <div class="ld-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="ld-placeholder">
        <span class="ldp-icon">📺</span>
        <span class="ldp-title">直播详情页</span>
        <span class="ldp-sub">页面建设中，敬请期待</span>
      </div>
    </div>

    <!-- 用例卡 -->
    <HelpButton @open="ucDrawerVisible = true" />
    <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
  </div>
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-014', '直播详情页');

// 状态栏时间
const currentTime = ref('');
let timer: number | undefined;
function updateTime() {
  const d = new Date();
  currentTime.value = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 30000);
});
onUnmounted(() => { if (timer) clearInterval(timer); });

function goBack() {
  router.back();
}
</script>

<style scoped>
/* 独立全屏容器（手机壳样式） */
.ld-page {
  width: 100%;
  max-width: 414px;
  height: 100vh;
  max-height: 896px;
  margin: 0 auto;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  box-shadow: 0 0 30px rgba(0,0,0,0.15);
}
.ld-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.lsb-icons { font-size: 12px; }

.ld-body {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.ld-back {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}
.ld-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.ldp-icon { font-size: 64px; opacity: 0.5; }
.ldp-title { font-size: 20px; font-weight: 700; color: #333; }
.ldp-sub { font-size: 14px; color: #999; }
</style>
