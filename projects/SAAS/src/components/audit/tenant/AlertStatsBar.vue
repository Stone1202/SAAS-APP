<template>
  <!-- B-AUDIT-012：告警统计区 -->
  <div class="alert-stats-bar">
    <div class="stat-item">
      <span class="stat-num">{{ total }}</span>
      <span class="stat-label">违规总数</span>
    </div>
    <div class="divider" />
    <div class="stat-item pending">
      <span class="stat-num">{{ pending }}</span>
      <span class="stat-label">待处置</span>
    </div>
    <div class="divider" />
    <div class="stat-item">
      <span class="stat-num">{{ recorded + ignored }}</span>
      <span class="stat-label">已处理</span>
    </div>
    <div class="divider" />
    <div class="stat-item severe">
      <span class="stat-num">{{ severe }}</span>
      <span class="stat-label">L1/涉黄涉暴</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  total: number;
  pending: number;
  recorded: number;
  ignored: number;
  severe: number;
}>();
</script>

<style scoped>
.alert-stats-bar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--card-bg, #fff);
  border-bottom: 1px solid var(--color-border, #D9D9D9);
  gap: 0;
}
.stat-item {
  flex: 1;
  text-align: center;
}
.stat-num {
  display: block;
  font-size: var(--font-h2, 20px);
  font-weight: 600;
  color: var(--color-text-primary, #262626);
}
.stat-label {
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
}
.stat-item.pending .stat-num { color: var(--color-warning, #FA8C16); }
.stat-item.severe .stat-num { color: var(--color-danger, #F5222D); }
.divider {
  width: 1px;
  height: 32px;
  background: var(--color-border, #D9D9D9);
}
</style>
