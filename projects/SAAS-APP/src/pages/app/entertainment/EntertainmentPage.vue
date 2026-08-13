<template>
  <!-- 娱乐页（占位） -->
  <div class="entertainment-page">
    <div class="ep-placeholder">
      <span class="ep-icon">🎮</span>
      <div class="ep-text">娱乐版块</div>
      <div class="ep-subtext">内容敬请期待</div>
    </div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-003', '娱乐页');
// 占位页
</script>

<style scoped>
.entertainment-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ep-placeholder {
  text-align: center;
  color: #999;
}
.ep-icon { font-size: 64px; display: block; margin-bottom: 16px; }
.ep-text { font-size: 18px; font-weight: 600; color: #666; }
.ep-subtext { font-size: 13px; margin-top: 8px; }
</style>
