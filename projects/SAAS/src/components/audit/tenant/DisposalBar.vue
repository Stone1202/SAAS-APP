<template>
  <!-- B-AUDIT-005：处置按钮栏 -->
  <div class="disposal-bar">
    <button class="disposal-btn record" @click="$emit('record')" :disabled="!canAct">
      记录
    </button>
    <button class="disposal-btn sever" @click="$emit('sever')" :disabled="!canAct || !canSever">
      断流
    </button>
    <button class="disposal-btn ignore" @click="$emit('ignore')" :disabled="!canAct">
      忽略
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canAct: boolean;
  canSever: boolean;
}>();

defineEmits<{
  record: [];
  sever: [];
  ignore: [];
}>();
</script>

<style scoped>
.disposal-bar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: var(--card-bg, #fff);
  border-top: 1px solid var(--color-border, #D9D9D9);
  justify-content: center;
}
.disposal-btn {
  padding: 6px 20px;
  border-radius: var(--radius-md, 4px);
  font-size: var(--font-body, 14px);
  border: 1px solid var(--color-border, #D9D9D9);
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  color: var(--color-text-primary, #262626);
}
.disposal-btn:hover:not(:disabled) { border-color: var(--color-primary, #1890FF); color: var(--color-primary, #1890FF); }
.disposal-btn:disabled {
  background: var(--color-muted, #F5F5F5);
  color: var(--color-text-secondary, #8C8C8C);
  cursor: not-allowed;
  border-color: var(--color-border, #D9D9D9);
}
.disposal-btn.sever:hover:not(:disabled) {
  border-color: var(--color-danger, #F5222D);
  color: var(--color-danger, #F5222D);
}
</style>
