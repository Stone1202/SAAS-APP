<template>
  <button
    type="button"
    class="help-icon"
    :class="[{ inline }, size]"
    @click.stop="$emit('click')"
    title="查看用例说明"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  inline?: boolean;
  size?: 'sm' | 'md';
}>(), {
  inline: true,
  size: 'sm',
});
defineEmits<{ click: [] }>();
</script>

<style scoped>
.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
  border-radius: 50%;
  cursor: pointer;
  vertical-align: middle;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.help-icon:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}
.help-icon.inline {
  margin-left: 4px;
}
.help-icon.sm {
  width: 18px;
  height: 18px;
}
.help-icon.md {
  width: 22px;
  height: 22px;
}
.help-icon.sm svg {
  width: 12px;
  height: 12px;
}
.help-icon.md svg {
  width: 14px;
  height: 14px;
}
</style>
