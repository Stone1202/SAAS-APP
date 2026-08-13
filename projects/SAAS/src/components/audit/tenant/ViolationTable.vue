<template>
  <!-- B-AUDIT-005：违规列表（含筛选） -->
  <div class="violation-table-wrapper">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <select v-model="filterLevel" class="filter-select">
        <option value="">全部级别</option>
        <option value="L1">L1-涉黄/涉暴</option>
        <option value="L2">L2-违规</option>
        <option value="L3">L3-辱骂</option>
        <option value="L4">L4-其他</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="">全部状态</option>
        <option value="pending">待处理</option>
        <option value="recorded">已记录</option>
        <option value="cut_off">已断流</option>
        <option value="ignored">已忽略</option>
        <option value="archived">已归档</option>
      </select>
      <select v-model="sortBy" class="filter-select">
        <option value="time-desc">时间↓</option>
        <option value="time-asc">时间↑</option>
        <option value="severity">严重度</option>
      </select>
      <HelpIcon
        v-if="onHelpClick"
        @click="onHelpClick('E-AUDIT-002-04')"
      />
    </div>

    <!-- 列表区 -->
    <div class="list-scroll">
      <div v-if="filteredViolations.length === 0" class="empty">暂无违规记录</div>
      <div
        v-for="v in filteredViolations"
        :key="v.violation_id"
        :class="['violation-row', { selected: selectedId === v.violation_id, readonly: disabled }]"
        @click="handleRowClick(v.violation_id)"
      >
        <!-- 色条 -->
        <div :class="['color-bar', levelClass(v.violation_level)]" />

        <!-- 内容 -->
        <div class="row-content">
          <div class="row-top">
            <span class="row-time">{{ formatTime(v.violation_time) }}</span>
            <span :class="['level-badge', levelClass(v.violation_level)]">{{ v.violation_level }}</span>
            <span :class="['status-tag', v.disposal_status]">{{ statusText(v.disposal_status) }}</span>
          </div>
          <div class="row-type">{{ (v.raw_callback as any)?.sub_label || typeLabel(v.violation_type) }}</div>
          <div class="row-snippet">{{ truncate(v.violation_content, 40) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import HelpIcon from '../../use-case-card/HelpIcon.vue';
import type { ReviewViolation, ViolationType } from '../../../contracts';

const props = defineProps<{
  violations: ReviewViolation[];
  selectedId?: string;
  disabled?: boolean;
  onHelpClick?: (elementId: string) => void;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();

/** 点击行时：只读模式禁止选中 */
function handleRowClick(id: string) {
  if (props.disabled) return;
  emit('select', id);
}

// 筛选/排序
const filterLevel = ref('');
const filterStatus = ref('');
const sortBy = ref('time-desc');

const filteredViolations = computed(() => {
  let list = [...props.violations];
  if (filterLevel.value) list = list.filter(v => v.violation_level === filterLevel.value);
  if (filterStatus.value) list = list.filter(v => v.disposal_status === filterStatus.value);

  if (sortBy.value === 'time-asc') list.sort((a, b) => new Date(a.violation_time).getTime() - new Date(b.violation_time).getTime());
  else if (sortBy.value === 'severity') {
    const sv: Record<string, number> = { L1: 4, L2: 3, L3: 2, L4: 1 };
    list.sort((a, b) => (sv[b.violation_level] || 0) - (sv[a.violation_level] || 0));
  } else list.sort((a, b) => new Date(b.violation_time).getTime() - new Date(a.violation_time).getTime());
  return list;
});

function levelClass(level: string) {
  const m: Record<string, string> = { L1: 'l1', L2: 'l2', L3: 'l3', L4: 'l4' };
  return m[level] || 'l4';
}

function statusText(status: string) {
  const m: Record<string, string> = {
    pending: '待处理', recorded: '已记录', cut_off: '已断流',
    ignored: '已忽略', timeout: '已超时', archived: '已归档',
  };
  return m[status] || status;
}

const VIOLATION_TYPE_LABELS: Record<ViolationType, string> = {
  porn: '涉黄', violence: '涉暴', banned_words: '违禁词',
  ad_law: '广告法', politics: '涉政', abuse: '辱骂',
  illegal: '违法乱纪', public_safety: '公共安全', social_safety: '社会安全',
  custom: '自定义',
};

function typeLabel(t: ViolationType) { return VIOLATION_TYPE_LABELS[t] || t; }

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false });
}

function truncate(text: string, max: number) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '...' : text;
}
</script>

<style scoped>
.violation-table-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.filter-bar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: var(--card-bg, #fff);
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.filter-select {
  padding: 4px 8px;
  font-size: var(--font-small, 12px);
  border: 1px solid var(--color-border, #D9D9D9);
  border-radius: var(--radius-sm, 2px);
  background: #fff;
  color: var(--color-text-primary, #262626);
  outline: none;
}
.list-scroll {
  flex: 1;
  overflow-y: auto;
  background: var(--card-bg, #fff);
}
.empty {
  padding: 40px 0;
  text-align: center;
  font-size: var(--font-body, 14px);
  color: var(--color-text-secondary, #8C8C8C);
}
.violation-row {
  display: flex;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
  transition: background 0.15s;
}
.violation-row:hover { background: var(--color-muted, #F5F5F5); }
.violation-row.selected { background: var(--color-info-bg, #E6F7FF); }
.violation-row.readonly { cursor: default; opacity: 0.7; }
.violation-row.readonly:hover { background: transparent; }
.color-bar {
  width: 4px;
  min-height: 54px;
  flex-shrink: 0;
}
.color-bar.l1 { background: var(--color-danger, #F5222D); }
.color-bar.l2 { background: var(--color-warning, #FA8C16); }
.color-bar.l3 { background: var(--color-warning, #FA8C16); }
.color-bar.l4 { background: var(--color-info, #1890FF); }
.row-content {
  flex: 1;
  padding: 8px 12px;
  min-width: 0;
}
.row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.row-time {
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
}
.level-badge {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: var(--radius-sm, 2px);
  color: #fff;
  font-weight: 500;
}
.level-badge.l1 { background: var(--color-danger, #F5222D); }
.level-badge.l2 { background: var(--color-warning, #FA8C16); }
.level-badge.l3 { background: var(--color-warning, #FA8C16); }
.level-badge.l4 { background: var(--color-info, #1890FF); }
.status-tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: var(--radius-sm, 2px);
}
.status-tag.pending { color: var(--color-warning, #FA8C16); background: var(--color-warning-bg, #FFF7E6); }
.status-tag.recorded { color: var(--color-success, #52C41A); background: var(--color-success-bg, #F6FFED); }
.status-tag.cut_off { color: var(--color-danger, #F5222D); background: var(--color-danger-bg, #FFF2F0); }
.status-tag.ignored { color: var(--color-text-secondary, #8C8C8C); background: var(--color-muted, #F5F5F5); }
.row-type {
  font-size: var(--font-small, 12px);
  color: var(--color-text-primary, #262626);
  margin-bottom: 2px;
}
.row-snippet {
  font-size: 11px;
  color: var(--color-text-secondary, #8C8C8C);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
