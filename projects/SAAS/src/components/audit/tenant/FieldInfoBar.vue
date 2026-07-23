<template>
  <!-- B-AUDIT-003：场次信息区 -->
  <div class="field-info-bar">
    <div class="info-line">
      <span class="title">{{ title || '直播标题' }}</span>
      <span :class="['status-badge', status]">
        {{ statusLabel }}
      </span>
    </div>
    <div class="info-line secondary">
      <span>主播：{{ anchor || '—' }}</span>
      <span class="divider-dot">|</span>
      <span>已播 {{ elapsed }}</span>
    </div>
    <div class="info-line secondary">
      <span>{{ (viewerCount ?? 0).toLocaleString() }} 人观看</span>
    </div>

    <!-- 擦音模式（仿真需要） -->
    <div class="mute-mode-row">
      <span class="label">擦音模式：</span>
      <label
        v-for="opt in muteOptions"
        :key="opt.value"
        :class="['radio-option', { active: modelValue === opt.value }]"
      >
        <input
          type="radio"
          :value="opt.value"
          :checked="modelValue === opt.value"
          @change="$emit('update:modelValue', opt.value)"
          :disabled="fieldStatus !== 'live'"
        />
        <span>{{ opt.label }}</span>
      </label>
    </div>

    <!-- 状态横幅 -->
    <div v-if="fieldStatus === 'ended'" class="banner ended">
      ⚠ 本场次已结束（结束时间：15:30）<br />
      <small>违规列表已切换为只读，处置不可用</small>
    </div>
    <div v-if="!auditEnabled && fieldStatus === 'live'" class="banner audit-off">
      ⚠ 内容审查已关闭<br />
      <small>已产生违规保留，不再接收新违规</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MuteMode, FieldStatus } from '../../../contracts';

const props = defineProps<{
  title?: string;
  anchor?: string;
  elapsed?: string;
  viewerCount?: number;
  modelValue: MuteMode;
  fieldStatus: FieldStatus;
  auditEnabled: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: MuteMode];
}>();

const muteOptions: { label: string; value: MuteMode }[] = [
  { label: '静音', value: 'silent' },
  { label: '擦音', value: 'beep' },
];

const statusLabel = computed(() => {
  const map: Record<string, string> = { live: '● 直播中', ended: '● 已结束', replaying: '● 回放中' };
  return map[props.fieldStatus] || '● 未知';
});

const status = computed(() => props.fieldStatus);
</script>

<style scoped>
.field-info-bar {
  padding: 12px 16px;
  background: var(--card-bg, #fff);
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.info-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.title {
  font-size: var(--font-h3, 16px);
  font-weight: 500;
  color: var(--color-text-primary, #262626);
}
.status-badge {
  font-size: var(--font-small, 12px);
  padding: 2px 8px;
  border-radius: var(--radius-sm, 2px);
}
.status-badge.live { color: var(--color-success, #52C41A); background: var(--color-success-bg, #F6FFED); }
.status-badge.ended { color: var(--color-text-secondary, #8C8C8C); background: var(--color-muted, #F5F5F5); }
.status-badge.replaying { color: var(--color-info, #1890FF); background: var(--color-info-bg, #E6F7FF); }
.secondary {
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
  gap: 6px;
}
.divider-dot { margin: 0 4px; }
.mute-mode-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border, #D9D9D9);
  font-size: var(--font-small, 12px);
}
.mute-mode-row .label {
  color: var(--color-text-secondary, #8C8C8C);
  min-width: auto;
}
.radio-option {
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  color: var(--color-text-primary, #262626);
}
.radio-option.active { color: var(--color-primary, #1890FF); font-weight: 500; }
.radio-option input[type="radio"]:disabled + span { color: var(--color-text-secondary, #8C8C8C); cursor: not-allowed; }
.banner {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm, 2px);
  font-size: var(--font-small, 12px);
  line-height: 1.5;
}
.banner.ended {
  background: var(--color-warning-bg, #FFF7E6);
  border: 1px solid var(--color-warning, #FA8C16);
  color: var(--color-warning, #FA8C16);
}
.banner.audit-off {
  background: var(--color-muted, #F5F5F5);
  border: 1px solid var(--color-border, #D9D9D9);
  color: var(--color-text-secondary, #8C8C8C);
}
</style>
