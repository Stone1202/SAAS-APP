<template>
  <!-- PG-AUDIT-PC-001：运营后台-租户审查开关页 /admin/tenant -->
  <div class="admin-tenant-page">
    <div class="page-header-bar">
      <h2 class="page-title">租户管理</h2>
      <span class="page-desc">管理租户的内容审查开关</span>
    </div>

    <!-- 租户列表 -->
    <div class="tenant-list">
      <div v-for="t in tenants" :key="t.tenant_id" class="tenant-card-wrapper">
        <!-- 信息卡片 -->
        <TenantInfoCard :config="t" :auditEnabled="t.audit_enabled" />

        <!-- 审查开关控制 -->
        <AuditSwitchControl
          :enabled="t.audit_enabled"
          :lastOperation="getLastOp(t.tenant_id)"
          @toggle="openSwitchModal(t)"
        />
      </div>
    </div>

    <!-- 开关二次确认弹窗 -->
    <AuditSwitchModal
      :visible="modalVisible"
      :enabling="!selectedTenant?.audit_enabled"
      :config="selectedTenant || {} as any"
      :liveCount="getLiveCount(selectedTenant?.tenant_id || '')"
      @confirm="confirmToggle"
      @cancel="modalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TenantInfoCard from '../../components/audit/operator/TenantInfoCard.vue';
import AuditSwitchControl from '../../components/audit/operator/AuditSwitchControl.vue';
import AuditSwitchModal from '../../components/audit/operator/AuditSwitchModal.vue';
import type { TenantAuditConfig } from '../../contracts';

// 模拟租户列表（仿真数据）
const tenants = ref<TenantAuditConfig[]>([
  {
    tenant_id: 'T-001',
    tenant_name: 'XX科技',
    industry: '游戏',
    audit_enabled: true,
    stream_domain: 'rtmp://live-push.xxkeji.com/live',
    today_violation_count: 12,
    mute_mode: 'beep' as const,
  },
  {
    tenant_id: 'T-002',
    tenant_name: '达人传媒',
    industry: '传媒',
    audit_enabled: false,
    stream_domain: 'rtmp://push.darenmedia.cn/stream',
    today_violation_count: 45,
    mute_mode: 'silent' as const,
  },
  {
    tenant_id: 'T-003',
    tenant_name: '娱乐互娱',
    industry: '娱乐',
    audit_enabled: true,
    stream_domain: 'rtmp://ylhy.push.live.com/app',
    today_violation_count: 3,
    mute_mode: 'beep' as const,
  },
  {
    tenant_id: 'T-004',
    tenant_name: '教育在线',
    industry: '教育',
    audit_enabled: true,
    stream_domain: 'rtmp://live.edu-online.com/push',
    today_violation_count: 0,
    mute_mode: 'silent' as const,
  },
]);

// 最后操作记录
const lastOps = ref<Record<string, string>>({});

function getLastOp(tid: string) {
  return lastOps.value[tid] || '';
}

const modalVisible = ref(false);
const selectedTenant = ref<TenantAuditConfig | null>(null);

function openSwitchModal(t: TenantAuditConfig) {
  selectedTenant.value = t;
  modalVisible.value = true;
}

function getLiveCount(tid: string) {
  // 仿真：每个租户随机 0~5 场直播
  return (tid.charCodeAt(tid.length - 1) || 0) % 5;
}

function confirmToggle() {
  const t = selectedTenant.value;
  if (!t) return;
  const idx = tenants.value.findIndex(v => v.tenant_id === t.tenant_id);
  if (idx !== -1) {
    const newEnabled = !t.audit_enabled;
    tenants.value[idx] = { ...t, audit_enabled: newEnabled };
    lastOps.value[t.tenant_id] = newEnabled ? '已开启内容审查' : '已关闭内容审查';
  }
  modalVisible.value = false;
  selectedTenant.value = null;
}
</script>

<style scoped>
.admin-tenant-page {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--page-padding, 24px);
  min-height: 100vh;
  background: var(--color-bg, #F5F5F5);
}
.page-header-bar {
  margin-bottom: 24px;
}
.page-title {
  font-size: var(--font-h1, 22px);
  font-weight: 600;
  color: var(--color-text-primary, #262626);
  margin: 0 0 4px;
}
.page-desc {
  font-size: var(--font-body, 14px);
  color: var(--color-text-secondary, #8C8C8C);
}
.tenant-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.tenant-card-wrapper {
  background: var(--card-bg, #fff);
  border-radius: var(--radius-md, 4px);
  box-shadow: var(--shadow-card, 0 2px 8px rgba(0,0,0,0.08));
  overflow: hidden;
}
</style>
