<template>
  <!-- PG-AUDIT-PC-001：运营后台-租户管理列表 /admin/tenant -->
  <div class="admin-tenant-page">
    <div class="page-header-bar">
      <h2 class="page-title">租户管理</h2>
      <span class="page-desc">管理所有租户及其直播审查开关</span>
    </div>

    <!-- 租户列表表格 -->
    <div class="table-container">
      <el-table :data="tenants" border stripe style="width: 100%">
        <el-table-column prop="tenant_id" label="租户编号" width="140" />
        <el-table-column prop="tenant_name" label="租户名称" min-width="140" />
        <el-table-column prop="contact_phone" label="租户联系电话" width="160" />
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.registered_at) }}
          </template>
        </el-table-column>
        <el-table-column label="是否启用" width="120" align="center">
          <template #header>
            <span>是否启用
              <HelpIcon
                @click="openElementHelp('E-AUDIT-001-01')"
                title="查看「是否启用」列用例说明"
              />
            </span>
          </template>
          <template #default="{ row }">
            <div class="audit-tag-cell">
              <el-tag :type="row.audit_enabled ? 'success' : 'danger'" size="small">
                {{ row.audit_enabled ? '已启用' : '已停用' }}
              </el-tag>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-001-01')"
                title="查看「是否启用」列用例说明"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #header>
            <span>操作
              <HelpIcon
                @click="openElementHelp('E-AUDIT-001-02')"
                title="查看「操作」列用例说明"
              />
            </span>
          </template>
          <template #default="{ row }">
            <div class="audit-switch-cell">
              <el-button
                link
                type="primary"
                size="small"
                @click="openSwitchLink(row)"
                class="audit-link-btn"
              >
                <span>内容审查开关</span>
                <span v-if="row.audit_enabled" class="link-badge on">已开启</span>
                <span v-else class="link-badge off">已关闭</span>
              </el-button>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-001-02')"
                title="查看「操作」列用例说明"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 内容审查开关弹窗 -->
    <AuditSwitchModal
      :visible="modalVisible"
      :config="selectedTenant!"
      @confirm="confirmToggle"
      @cancel="modalVisible = false"
    />

    <!-- 用例交互卡 -->
    <HelpButton @open="showDrawer = true" />
    <UseCaseDrawer
      :visible="showDrawer"
      title="用例卡 — 租户管理"
      :cards="auditSwitchPageCards as any"
      :highlight-element-id="highlightElementId"
      @close="showDrawer = false; highlightElementId = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import AuditSwitchModal from '../../components/audit/operator/AuditSwitchModal.vue';
import HelpButton from '../../components/use-case-card/HelpButton.vue';
import HelpIcon from '../../components/use-case-card/HelpIcon.vue';
import UseCaseDrawer from '../../components/use-case-card/UseCaseDrawer.vue';
import { auditSwitchPageCards } from './useCaseCardData';
import type { TenantAuditConfig } from '../../contracts';

// 模拟租户列表（仿真数据）
const tenants = ref<TenantAuditConfig[]>([
  {
    tenant_id: 'T-001',
    tenant_name: 'XX科技',
    contact_phone: '13800001001',
    registered_at: '2024-03-15',
    is_enabled: true,
    industry: '游戏',
    audit_enabled: true,
    stream_domain: 'rtmp://live-push.xxkeji.com/live',
    today_violation_count: 12,
    mute_mode: 'beep' as const,
  },
  {
    tenant_id: 'T-002',
    tenant_name: '达人传媒',
    contact_phone: '13800002002',
    registered_at: '2024-06-20',
    is_enabled: true,
    industry: '传媒',
    audit_enabled: false,
    stream_domain: 'rtmp://push.darenmedia.cn/stream',
    today_violation_count: 45,
    mute_mode: 'silent' as const,
  },
  {
    tenant_id: 'T-003',
    tenant_name: '娱乐互娱',
    contact_phone: '13800003003',
    registered_at: '2024-08-01',
    is_enabled: false,
    industry: '娱乐',
    audit_enabled: false,
    stream_domain: 'rtmp://ylhy.push.live.com/app',
    today_violation_count: 3,
    mute_mode: 'beep' as const,
  },
  {
    tenant_id: 'T-004',
    tenant_name: '教育在线',
    contact_phone: '13800004004',
    registered_at: '2024-11-10',
    is_enabled: true,
    industry: '教育',
    audit_enabled: true,
    stream_domain: 'rtmp://live.edu-online.com/push',
    today_violation_count: 0,
    mute_mode: 'silent' as const,
  },
]);

const modalVisible = ref(false);
const selectedTenant = ref<TenantAuditConfig | null>(null);
const showDrawer = ref(false);
const highlightElementId = ref('');

function openElementHelp(elementId: string) {
  highlightElementId.value = elementId;
  showDrawer.value = true;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** UC-AUDIT-001 step2: 点击「内容审查开关」链接→弹出弹窗 */
function openSwitchLink(tenant: TenantAuditConfig) {
  selectedTenant.value = tenant;
  modalVisible.value = true;
}

/** UC-AUDIT-001 step5: 确认是否开启/关闭 */
function confirmToggle(enabled: boolean) {
  const t = selectedTenant.value;
  if (!t) return;
  const idx = tenants.value.findIndex(v => v.tenant_id === t.tenant_id);
  if (idx !== -1) {
    tenants.value[idx] = { ...t, audit_enabled: enabled };
    ElMessage.success(`${t.tenant_name} 直播审查已${enabled ? '开启' : '关闭'}`);
  }
  modalVisible.value = false;
  selectedTenant.value = null;
}
</script>

<style scoped>
.admin-tenant-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: var(--color-bg, #F5F5F5);
}
.page-header-bar {
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary, #262626);
  margin: 0 0 4px;
}
.page-desc {
  font-size: 14px;
  color: var(--color-text-secondary, #8C8C8C);
}
.table-container {
  background: #fff;
  border-radius: 4px;
  padding: 0;
}
.audit-switch-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.audit-tag-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.audit-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.link-badge {
  display: inline-block;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}
.link-badge.on {
  background: #E6F7E6;
  color: #52C41A;
}
.link-badge.off {
  background: #FFF1F0;
  color: #FF4D4F;
}
</style>
