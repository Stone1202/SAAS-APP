<template>
  <!-- B-AUDIT-001：租户信息卡片 -->
  <div class="tenant-info-card">
    <div class="card-header">
      <span class="card-title">租户信息</span>
      <span :class="['audit-status', auditEnabled ? 'enabled' : 'disabled']">
        {{ auditEnabled ? '● 已开启' : '○ 已关闭' }}
      </span>
    </div>
    <div class="card-body">
      <div class="info-row">
        <span class="label">租户名称</span>
        <span class="value">{{ config.tenant_name || '—' }}</span>
      </div>
      <div class="info-row">
        <span class="label">租户ID</span>
        <span class="value mono">{{ config.tenant_id || '—' }}</span>
      </div>
      <div class="info-row">
        <span class="label">行业</span>
        <span class="value">{{ config.industry || '—' }}</span>
      </div>
      <div class="info-row">
        <span class="label">推流域名</span>
        <span class="value mono">{{ config.stream_domain || '—' }}</span>
      </div>
      <div class="info-row">
        <span class="label">今日违规数</span>
        <span :class="['value', 'count', config.today_violation_count > 0 ? 'warn' : '']">
          {{ config.today_violation_count }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TenantAuditConfig } from '../../../contracts';

defineProps<{
  config: TenantAuditConfig;
  auditEnabled: boolean;
}>();
</script>

<style scoped>
.tenant-info-card {
  background: var(--card-bg, #fff);
  border-radius: var(--radius-md, 4px);
  box-shadow: var(--shadow-card, 0 2px 8px rgba(0,0,0,0.08));
  padding: var(--card-padding, 24px);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.card-title {
  font-size: var(--font-h3, 16px);
  font-weight: 500;
  color: var(--color-text-primary, #262626);
}
.audit-status {
  font-size: var(--font-body, 14px);
  font-weight: 500;
}
.audit-status.enabled { color: var(--color-success, #52C41A); }
.audit-status.disabled { color: var(--color-text-secondary, #8C8C8C); }
.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-body, 14px);
}
.label {
  color: var(--color-text-secondary, #8C8C8C);
  min-width: 80px;
}
.value {
  color: var(--color-text-primary, #262626);
  text-align: right;
}
.mono { font-family: 'SF Mono', Consolas, monospace; font-size: 13px; }
.count.warn { color: var(--color-warning, #FA8C16); font-weight: 600; }
</style>
