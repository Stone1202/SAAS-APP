<template>
  <!-- B-AUDIT-012：告警统计区（红黄蓝三级+违规总数+审查状态） -->
  <div class="alert-stats-bar">
    <!-- 违规总数 -->
    <div class="stat-item">
      <span class="stat-num">{{ total }}</span>
      <span class="stat-label">违规总数</span>
    </div>
    <div class="divider" />
    <!-- 红级 L1+L2 -->
    <div class="stat-item red">
      <span class="stat-num">{{ redCount }}</span>
      <span class="stat-label">红（L1+L2）</span>
    </div>
    <div class="divider" />
    <!-- 黄级 L3 -->
    <div class="stat-item yellow">
      <span class="stat-num">{{ yellowCount }}</span>
      <span class="stat-label">黄（L3）</span>
    </div>
    <div class="divider" />
    <!-- 蓝级 L4 -->
    <div class="stat-item blue">
      <span class="stat-num">{{ blueCount }}</span>
      <span class="stat-label">蓝（L4）</span>
    </div>
    <div class="divider" />
    <!-- 审查状态 -->
    <div class="stat-item" :class="auditStatusClass">
      <span class="stat-dot" />
      <span class="stat-label">{{ auditStatusLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  total: number;
  pending: number;
  recorded: number;
  ignored: number;
  severe: number;
  redCount: number;
  yellowCount: number;
  blueCount: number;
  auditStatus: 'reviewing' | 'idle' | 'stopped';
}>();

const auditStatusLabel = computed(() => {
  const m = { reviewing: '审查中', idle: '待审查', stopped: '已停用' };
  return m[props.auditStatus] || '未知';
});

const auditStatusClass = computed(() => props.auditStatus);
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
.stat-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 6px auto 2px;
}
.stat-item.red .stat-num { color: var(--color-danger, #F5222D); }
.stat-item.yellow .stat-num { color: var(--color-warning, #FA8C16); }
.stat-item.blue .stat-num { color: var(--color-info, #1890FF); }
.stat-item.reviewing .stat-dot { background: var(--color-success, #52C41A); }
.stat-item.idle .stat-dot { background: var(--color-warning, #FA8C16); }
.stat-item.stopped .stat-dot { background: var(--color-border, #D9D9D9); }
.divider {
  width: 1px;
  height: 32px;
  background: var(--color-border, #D9D9D9);
}
</style>
