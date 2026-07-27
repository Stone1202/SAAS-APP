<template>
  <!-- B-AUDIT-002：审查开关控制区（V1仅开关Toggle，审查级别由腾讯云配置层管理） -->
  <div class="audit-switch-control">
    <div class="control-row">
      <span class="control-label">直播审查</span>
      <button
        :class="['toggle-switch', enabled ? 'on' : 'off']"
        @click="$emit('toggle')"
        :aria-label="enabled ? '关闭直播审查' : '开启直播审查'"
      >
        <span class="toggle-knob" />
      </button>
    </div>

    <div class="audit-note">
      审查策略由腾讯云审核模板统一配置，系统侧仅控制开关
    </div>

    <div v-if="lastOperation" class="last-op">
      最后操作：<strong>{{ lastOperation }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  enabled: boolean;
  lastOperation?: string;
}>();

defineEmits<{
  toggle: [];
}>();
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
.audit-note {
  margin-top: 12px;
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
  line-height: 1.5;
}
.last-op {
  margin-top: 8px;
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
}
</style>
