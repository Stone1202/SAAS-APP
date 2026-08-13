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
        auditStatus="stopped"
        :onHelpClick="openElementHelp"
    />

    <!-- 违规列表（只读） -->
    <ViolationTable
      :violations="violations"
      :selectedId="selectedId"
      :onHelpClick="openElementHelp"
      @select="selectViolation"
    />

    <!-- 处置按钮栏（已结束不可处置） -->
    <DisposalBar
      :canAct="false"
      :canSever="false"
      :canIgnore="false"
      :onHelpClick="openElementHelp"
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

  <!-- 用例交互卡 -->
  <HelpButton @open="showDrawer = true" />
  <UseCaseDrawer
    :visible="showDrawer"
    title="用例卡 — 历史违规列表"
    :cards="violationsPanelCards as any"
    :highlight-element-id="highlightElementId"
    @close="showDrawer = false; highlightElementId = ''"
  />
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
import HelpButton from '../../components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '../../components/use-case-card/UseCaseDrawer.vue';
import { violationsPanelCards } from './useCaseCardData';
import type { MuteMode } from '../../contracts';

const props = defineProps<{
  /** 可选：Drawer模式传streamId，不传则从路由获取 */
  streamId?: string;
}>();

const route = useRoute();
const store = useAuditStore();
const showDrawer = ref(false);
const highlightElementId = ref('');

function openElementHelp(elementId: string) {
  highlightElementId.value = elementId;
  showDrawer.value = true;
}

const streamId = computed(() =>
  props.streamId || (route.params.streamId as string) || 'UNKNOWN'
);

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
  // 仅在 store 中无数据时加载一批模拟历史违规（直接访问URL或新标签页场景）
  if (store.violations.length === 0) {
    loadMockHistory();
  }
  // 如果是从中控面板跳转过来的（场次仍在直播中），保持 live 状态
  // 否则设为 ended
  if (store.fieldStatus === 'live') {
    store.setFieldStatus('live');
  } else {
    store.setFieldStatus('ended');
  }
});

/**
 * 加载一批模拟历史违规（直接访问历史违规页URL而非从中控跳转时）
 */
function loadMockHistory() {
  const shared: Record<string, unknown> = {
    stream_id: 'stream-sim-001',
    audit_type: 'video',
    confidence: 95,
    keyword: '',
    evidence_url: 'https://cdn.example.com/evidence/default.jpg',
    raw_callback: {},
    audio_muted: false,
    mute_duration: 0,
  };
  const historyViolations = [
    {
      ...shared,
      violation_id: 'viol-history-001',
      violation_level: 'L1' as const,
      violation_type: 'porn' as const,
      violation_content: '检测到涉黄画面，置信度98%',
      suggestion: 'block' as const,
      violation_time: new Date(Date.now() - 1800000).toISOString(),
      segment_start: '01:15:22',
      segment_end: '01:15:25',
      disposal_status: 'cut_off' as const,
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      ...shared,
      violation_id: 'viol-history-002',
      violation_level: 'L2' as const,
      violation_type: 'ad_law' as const,
      violation_content: '检测到未授权广告内容',
      suggestion: 'review' as const,
      violation_time: new Date(Date.now() - 1200000).toISOString(),
      segment_start: '00:45:10',
      segment_end: '00:45:15',
      disposal_status: 'recorded' as const,
      created_at: new Date(Date.now() - 1200000).toISOString(),
      reviewer_id: 'reviewer-001',
      reviewer_name: '审核员A',
      review_time: new Date(Date.now() - 1100000).toISOString(),
    },
    {
      ...shared,
      violation_id: 'viol-history-003',
      violation_level: 'L3' as const,
      violation_type: 'abuse' as const,
      violation_content: '检测到辱骂性言论',
      suggestion: 'review' as const,
      violation_time: new Date(Date.now() - 600000).toISOString(),
      segment_start: '00:58:33',
      segment_end: '00:58:36',
      disposal_status: 'pending' as const,
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
      ...shared,
      violation_id: 'viol-history-004',
      violation_level: 'L2' as const,
      violation_type: 'illegal' as const,
      violation_content: '检测到违禁品画面',
      suggestion: 'block' as const,
      violation_time: new Date(Date.now() - 300000).toISOString(),
      segment_start: '01:05:00',
      segment_end: '01:05:03',
      disposal_status: 'cut_off' as const,
      created_at: new Date(Date.now() - 300000).toISOString(),
    },
    {
      ...shared,
      violation_id: 'viol-history-005',
      violation_level: 'L4' as const,
      violation_type: 'custom' as const,
      violation_content: '检测到画面闪烁异常',
      suggestion: 'pass' as const,
      violation_time: new Date(Date.now() - 60000).toISOString(),
      segment_start: '01:22:45',
      segment_end: '01:22:46',
      disposal_status: 'ignored' as const,
      created_at: new Date(Date.now() - 60000).toISOString(),
      reviewer_id: 'reviewer-001',
      reviewer_name: '审核员A',
      review_time: new Date(Date.now() - 30000).toISOString(),
    },
  ];

  // 历史违规模拟数据，字段已补全，使用 unknown 中转绕过 spread 类型推断限制
  historyViolations.forEach(v => store.appendViolation(v as unknown as import('../../contracts').ReviewViolation));
}
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
