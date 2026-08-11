<template>
  <div class="help-button-wrapper" data-testid="help-button">
    <button class="help-btn" @click="$emit('open')" title="查看用例说明" data-testid="help-button-trigger">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span class="help-label">用例卡</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ open: [] }>();
</script>

<style scoped>
.help-button-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
}
.help-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}
.help-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
.help-label {
  font-weight: 500;
}
</style>
