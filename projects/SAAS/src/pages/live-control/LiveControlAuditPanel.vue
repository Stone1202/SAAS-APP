<template>
  <!-- PG-AUDIT-PC-002：直播中控→内容审查Tab /tenant/live-control?tab=audit&streamId=xxx -->
  <div class="live-control-panel">
    <!-- 无 streamId 时提示 -->
    <div v-if="!streamId" class="no-stream">
      请在直播列表中点击「中控台」进入
    </div>

    <template v-else>
      <!-- 场次信息 -->
      <FieldInfoBar
        :title="fieldInfo?.title || '直播标题'"
        :anchor="fieldInfo?.anchor || '主播昵称'"
        :elapsed="fieldInfo?.elapsed || '00:15:30'"
        :viewerCount="fieldInfo?.viewerCount || 25600"
        v-model="muteMode"
        :fieldStatus="fieldStatus"
        :auditEnabled="auditEnabled"
      />

      <!-- 告警统计（红黄蓝三级+审查状态） -->
      <AlertStatsBar
        :total="violations.length"
        :pending="violations.filter((v: any) => v.disposal_status === 'pending').length"
        :recorded="violations.filter((v: any) => v.disposal_status === 'recorded').length"
        :ignored="violations.filter((v: any) => v.disposal_status === 'ignored').length"
        :severe="violations.filter((v: any) => v.violation_level === 'L1').length"
        :redCount="violations.filter((v: any) => v.violation_level === 'L1' || v.violation_level === 'L2').length"
        :yellowCount="violations.filter((v: any) => v.violation_level === 'L3').length"
        :blueCount="violations.filter((v: any) => v.violation_level === 'L4').length"
        auditStatus="reviewing"
      />

      <!-- 违规列表 -->
      <ViolationTable
        :violations="violations"
        :selectedId="selectedId"
        @select="selectViolation"
      />

      <!-- 处置按钮栏（BR-AUDIT-003 渐进式规则） -->
      <DisposalBar
        :canAct="!!selectedViolation && selectedViolation.disposal_status === 'pending'"
        :canSever="!!selectedViolation && selectedViolation.violation_level !== 'L4'"
        :canIgnore="!!selectedViolation && selectedViolation.violation_level !== 'L1'"
        @record="openDisposal('record')"
        @sever="openDisposal('sever')"
        @ignore="openDisposal('ignore')"
      />
    </template>

    <!-- 违规详情侧滑面板 -->
    <ViolationDetailPanel
      :visible="detailVisible"
      :violation="selectedViolation || null"
      :muteMode="muteMode"
      @close="detailVisible = false"
    />

    <!-- 处置确认弹窗（记录/断流/忽略三合一） -->
    <DisposalModal
      :visible="disposalVisible"
      :type="disposalType"
      :violation="selectedViolation || null"
      @confirm="handleDispose"
      @cancel="disposalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import FieldInfoBar from '../../components/audit/tenant/FieldInfoBar.vue';
import AlertStatsBar from '../../components/audit/tenant/AlertStatsBar.vue';
import ViolationTable from '../../components/audit/tenant/ViolationTable.vue';
import DisposalBar from '../../components/audit/tenant/DisposalBar.vue';
import ViolationDetailPanel from '../../components/audit/tenant/ViolationDetailPanel.vue';
import DisposalModal from '../../components/audit/tenant/DisposalModal.vue';
import { mockViolationGenerator } from '../../adapters/sim/data-adapter';
import type { MuteMode, FieldStatus } from '../../contracts';

const route = useRoute();
const store = useAuditStore();

// 路由参数
const streamId = computed(() => (route.query.streamId as string) || (route.params.streamId as string) || 'stream-001');

// 场次信息（仿真）
const fieldInfo = ref({
  title: `直播-${streamId.value || '001'}`,
  anchor: '主播小A',
  elapsed: '01:23:45',
  viewerCount: 25600,
});

// 审查状态
const auditEnabled = ref(true);
const fieldStatus = ref<FieldStatus>('live');
const muteMode = ref<MuteMode>('beep');

// 违规列表
const violations = computed(() => store.violations);

// 选中/详情
const selectedId = ref<string>();
const detailVisible = ref(false);
const selectedViolation = computed(() => {
  if (!selectedId.value) return null;
  return store.violations.find((v: any) => v.violation_id === selectedId.value) || null;
});

function selectViolation(id: string) {
  selectedId.value = id;
  detailVisible.value = true;
}

// 处置弹窗
const disposalVisible = ref(false);
const disposalType = ref<'record' | 'sever' | 'ignore'>('record');

function openDisposal(type: 'record' | 'sever' | 'ignore') {
  if (!selectedViolation.value || selectedViolation.value.disposal_status !== 'pending') return;
  disposalType.value = type;
  disposalVisible.value = true;
}

function handleDispose(note: string) {
  if (!selectedId.value) return;
  const disposeMap: Record<string, 'record' | 'cut_off' | 'ignore'> = {
    record: 'record', sever: 'cut_off', ignore: 'ignore',
  };
  const disposalTypeVal = disposeMap[disposalType.value];
  // 构造 ReviewDisposal 对象
  store.disposeViolation(selectedId.value, {
    disposal_id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    violation_id: selectedId.value,
    disposal_type: disposalTypeVal,
    disposal_reason: note,
    operator: 'operator',
    operated_at: new Date().toISOString(),
  });
  // 断流：更新场次状态
  if (disposalType.value === 'sever') {
    fieldStatus.value = 'ended';
  }
  disposalVisible.value = false;
}

// 生命周期
onMounted(() => {
  store.setFieldStatus('live');
  store.setTenantConfig({
    tenant_id: 'T-001',
    tenant_name: 'XX科技',
    audit_enabled: true,
  });
  mockViolationGenerator.start();
});

onUnmounted(() => {
  mockViolationGenerator.stop();
  store.reset();
});
</script>

<style scoped>
.live-control-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg, #F5F5F5);
  overflow: hidden;
}
.no-stream {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: var(--font-body, 14px);
  color: var(--color-text-secondary, #8C8C8C);
}
</style>
