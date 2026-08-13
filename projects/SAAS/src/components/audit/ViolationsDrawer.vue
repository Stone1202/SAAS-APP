<template>
  <!-- M-AUDIT-005：历史违规 400px 侧边抽屉（FN-AUDIT-PC-002） -->
  <el-drawer
    :model-value="visible"
    :title="`历史违规 - ${streamId}`"
    direction="rtl"
    size="400px"
    :close-on-click-modal="true"
    :destroy-on-close="false"
    @close="$emit('close')"
  >
    <template #default>
      <div class="drawer-content">
        <!-- 告警统计 -->
        <AlertStatsBar
          :total="store.violations.length"
          :pending="store.violations.filter((v: any) => v.disposal_status === 'pending').length"
          :recorded="store.violations.filter((v: any) => v.disposal_status === 'recorded').length"
          :ignored="store.violations.filter((v: any) => v.disposal_status === 'ignored').length"
          :severe="store.violations.filter((v: any) => v.violation_level === 'L1').length"
          :redCount="store.violations.filter((v: any) => v.violation_level === 'L1' || v.violation_level === 'L2').length"
          :yellowCount="store.violations.filter((v: any) => v.violation_level === 'L3').length"
          :blueCount="store.violations.filter((v: any) => v.violation_level === 'L4').length"
          auditStatus="stopped"
          :onHelpClick="(id: string) => openElementHelp(id)"
        />

        <!-- 违规列表（只读） -->
        <ViolationTable
          :violations="store.violations"
          :selectedId="selectedId"
          :onHelpClick="(id: string) => openElementHelp(id)"
          @select="selectViolation"
        />

        <!-- 处置按钮栏（只读） -->
        <DisposalBar
          :canAct="false"
          :canSever="false"
          :canIgnore="false"
          :onHelpClick="(id: string) => openElementHelp(id)"
          @record="() => {}"
          @sever="() => {}"
          @ignore="() => {}"
        />
      </div>

      <!-- 违规详情弹窗 -->
      <ViolationDetailPanel
        :visible="detailVisible"
        :violation="selectedViolation || null"
        @close="detailVisible = false"
      />
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuditStore } from '../../stores/audit-store';
import AlertStatsBar from './tenant/AlertStatsBar.vue';
import ViolationTable from './tenant/ViolationTable.vue';
import DisposalBar from './tenant/DisposalBar.vue';
import ViolationDetailPanel from './tenant/ViolationDetailPanel.vue';

defineProps<{
  visible: boolean;
  streamId: string;
  /** 帮助跳转回调 */
  onHelpClick?: (elementId: string) => void;
}>();

defineEmits<{
  close: [];
}>();

const store = useAuditStore();

const selectedId = ref<string>();
const detailVisible = ref(false);
const selectedViolation = computed(() =>
  store.violations.find((v: any) => v.violation_id === selectedId.value) || null
);

function selectViolation(id: string) {
  selectedId.value = id;
  detailVisible.value = true;
}

function openElementHelp(elementId: string) {
  // 由父页面处理（通过 callback 或直接操作父页面的 drawer）
  // 这里暂时以 alert 形式降级
  alert(`元素帮助：${elementId}`);
}
</script>

<style scoped>
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
</style>
