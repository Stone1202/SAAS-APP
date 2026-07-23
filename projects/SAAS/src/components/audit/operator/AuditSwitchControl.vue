<template>
  <!-- B-AUDIT-002：审查开关控制区 -->
  <div class="audit-switch-control">
    <div class="control-row">
      <span class="control-label">内容审查</span>
      <button
        :class="['toggle-switch', enabled ? 'on' : 'off']"
        @click="$emit('toggle')"
        :aria-label="enabled ? '关闭内容审查' : '开启内容审查'"
      >
        <span class="toggle-knob" />
      </button>
    </div>

    <div class="divider" />

    <div class="level-row">
      <span class="control-label">审查级别</span>
      <div class="radio-group">
        <label
          v-for="opt in levelOptions"
          :key="opt.value"
          :class="['radio-item', { active: level === opt.value, disabled: !enabled }]"
        >
          <input
            type="radio"
            :value="opt.value"
            :checked="level === opt.value"
            :disabled="!enabled"
            @change="$emit('update:level', opt.value)"
          />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div v-if="lastOperation" class="last-op">
      最后操作：<strong>{{ lastOperation }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
type AuditLevel = 'all' | 'sensitive_only' | 'custom';

defineProps<{
  enabled: boolean;
  level: AuditLevel;
  lastOperation?: string;
}>();

defineEmits<{
  toggle: [];
  'update:level': [value: AuditLevel];
}>();

const levelOptions: { label: string; value: AuditLevel }[] = [
  { label: '全部', value: 'all' },
  { label: '仅涉黄涉暴', value: 'sensitive_only' },
  { label: '自定义', value: 'custom' },
];
</script>

<style scoped>
.audit-switch-control {
  background: var(--card-bg, #fff);
  border-radius: var(--radius-md, 4px);
  box-shadow: var(--shadow-card, 0 2px 8px rgba(0,0,0,0.08));
  padding: var(--card-padding, 24px);
}
.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.control-label {
  font-size: var(--font-h3, 16px);
  font-weight: 500;
  color: var(--color-text-primary, #262626);
}
.toggle-switch {
  position: relative;
  width: 44px;
  height: 22px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  padding: 0;
}
.toggle-switch.on { background: var(--color-primary, #1890FF); }
.toggle-switch.off { background: var(--color-border, #D9D9D9); }
.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-switch.on .toggle-knob { left: 24px; }
.divider {
  height: 1px;
  background: var(--color-border, #D9D9D9);
  margin: 16px 0;
}
.level-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.radio-group {
  display: flex;
  gap: 16px;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-body, 14px);
  color: var(--color-text-primary, #262626);
  cursor: pointer;
}
.radio-item.disabled {
  color: var(--color-text-secondary, #8C8C8C);
  cursor: not-allowed;
}
.radio-item input[type="radio"] { accent-color: var(--color-primary, #1890FF); }
.last-op {
  margin-top: 12px;
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
}
</style>
