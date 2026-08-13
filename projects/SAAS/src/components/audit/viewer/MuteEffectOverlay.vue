<template>
  <!-- B-AUDIT-010：擦音效果叠加层 -->
  <transition name="fade">
    <div v-if="effect === 'silent'" class="mute-effect-overlay">
      <div class="mute-icon">🔇</div>
      <div class="mute-text">静音中...</div>
    </div>
    <div v-else-if="effect === 'beep'" class="beep-effect-overlay">
      <div class="beep-icon">🔔</div>
      <div class="beep-text">嘀~</div>
      <div class="wave-animation">
        <span class="wave-bar" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.1}s` }" />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  effect: 'silent' | 'beep' | null;
}>();
</script>

<style scoped>
.mute-effect-overlay, .beep-effect-overlay {
  position: absolute;
  inset: 0;
  z-index: 15; /* 设计走查P0修复：z:15，位于弹幕(z:8)上方 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-mask, rgba(0,0,0,0.45));
}
.mute-icon, .beep-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
.mute-text, .beep-text {
  font-size: 18px;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}
.wave-animation {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
}
.wave-bar {
  width: 4px;
  height: 20px;
  background: var(--color-warning, #FA8C16);
  border-radius: 2px;
  animation: wave 0.6s ease-in-out infinite alternate;
}
@keyframes wave { to { height: 36px; } }

.fade-enter-active { animation: fade-in 0.3s ease-out; }
.fade-leave-active { animation: fade-out 0.5s ease-in; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
</style>
