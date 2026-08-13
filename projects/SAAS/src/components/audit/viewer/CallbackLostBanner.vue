<template>
  <!-- B-AUDIT-011：回调丢失提示 -->
  <transition name="slide-down">
    <div v-if="visible" class="callback-lost-banner">
      ⚠ 直播中控尚未收到此违规回调
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>

<style scoped>
.callback-lost-banner {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  background: var(--color-warning-bg, #FFF7E6);
  border: 1px solid var(--color-warning, #FA8C16);
  color: var(--color-warning, #FA8C16);
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  animation: fade-in 0.3s ease-out;
}

.slide-down-enter-active { animation: slide-in 0.3s ease-out, fade-in 0.3s ease-out; }
.slide-down-leave-active { animation: slide-in 0.3s ease-in reverse, fade-out 0.3s ease-in; }
@keyframes slide-in { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { opacity: 1; } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
</style>
