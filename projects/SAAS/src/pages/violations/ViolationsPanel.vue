<template>
  <!-- PG-AUDIT-PC-004：历史违规列表面板 /tenant/live/:streamId/violations -->
  <div class="violations-panel">
    <!-- 场次信息 -->
    <FieldInfoBar
      :title="`历史违规 - ${streamId}`"
      :anchor="'已结束场次'"
      elapsed="—"
      :viewerCount="0"
      v-model="muteMode"
      fieldStatus="ended"
      :auditEnabled="false"
    />

    <!-- 告警统计 -->
    <AlertStatsBar
      :total="violations.length"
        :pending="violations.filter((v: any) => v.disposal_status === 'pending').length"
        :recorded="violations.filter((v: any) => v.disposal_status === 'recorded').length"
        :ignored="violations.filter((v: any) => v.disposal_status === 'ignored').length"
        :severe="violations.filter((v: any) => v.violation_level === 'L1').length"
    />

    <!-- 违规列表（只读） -->
    <ViolationTable
      :violations="violations"
      :selectedId="selectedId"
      @select="selectViolation"
    />

    <!-- 处置按钮栏（已结束不可处置） -->
    <DisposalBar
      :canAct="false"
      :canSever="false"
      @record="() => {}"
      @sever="() => {}"
      @ignore="() => {}"
    />

    <!-- 详情侧滑 -->
    <ViolationDetailPanel
      :visible="detailVisible"
      :violation="selectedViolation || null"
      @close="detailVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import FieldInfoBar from '../../components/audit/tenant/FieldInfoBar.vue';
import AlertStatsBar from '../../components/audit/tenant/AlertStatsBar.vue';
import ViolationTable from '../../components/audit/tenant/ViolationTable.vue';
import DisposalBar from '../../components/audit/tenant/DisposalBar.vue';
import ViolationDetailPanel from '../../components/audit/tenant/ViolationDetailPanel.vue';
import type { MuteMode } from '../../contracts';

const route = useRoute();
const store = useAuditStore();

const streamId = computed(() => (route.params.streamId as string) || 'UNKNOWN');

const muteMode = ref<MuteMode>('beep');

// 违规列表（仿真：从 store 加载历史数据）
const violations = computed(() => store.violations);

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

onMounted(() => {
  store.setFieldStatus('ended');
  // 仿真：加载一批历史违规记录（生成器不重启，直接从已有 store 取）
  // FD 实际实现时从 API 加载该 streamId 的历史记录
});
</script>

<style scoped>
.violations-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg, #F5F5F5);
  overflow: hidden;
}
</style>
