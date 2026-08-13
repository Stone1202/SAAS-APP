<template>
  <!-- B-AUDIT-010：断流覆盖层（直播已结束） -->
  <div v-if="visible" class="stream-ended-overlay">
    <div class="ended-content">
      <div class="ended-title">直播已结束</div>
      <div class="ended-subtitle">该直播因内容违规已被终止</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>

<style scoped>
.stream-ended-overlay {
  position: absolute;
  inset: 0;
  z-index: 100; /* 最高层，覆盖所有其他层包括主播信息栏 */
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-mask, rgba(0,0,0,0.85));
  animation: fade-in 0.4s ease-out;
}
.ended-content { text-align: center; }
.ended-title {
  font-size: 18px;
  color: #fff;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.ended-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.75);
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
</style>
