<template>
  <!-- M-AUDIT-001：审查开关确认弹窗 -->
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('cancel')">
      <div :class="['modal', enabling ? 'enable' : 'disable']">
        <div class="modal-header">
          <h3>{{ enabling ? '确认开启内容审查' : '确认关闭内容审查' }}</h3>
        </div>

        <div class="modal-body">
          <div class="summary-row">
            <span>租户：{{ config.tenant_name }}（{{ config.tenant_id }}）</span>
          </div>
          <div class="summary-row">
            <span>推流域名：{{ config.stream_domain || '—' }}</span>
          </div>
          <div class="summary-row">
            <span>今日违规数：{{ config.today_violation_count }}</span>
          </div>

          <div class="divider" />

          <p v-if="enabling" class="desc">
            开启后该租户所有直播将触发内容审查，直播中控将显示内容审查Tab，运营可实时监控和处置违规内容。
          </p>
          <template v-else>
            <p class="desc">
              关闭后该租户所有直播不再触发内容审查：
            </p>
            <ul class="effect-list">
              <li>直播列表不再显示审查入口</li>
              <li>直播中控无内容审查Tab</li>
              <li>观众端无擦音效果</li>
              <li>回放不再自动擦音</li>
            </ul>
            <div class="warning-box">
              ⚠ 平台不可降级类（涉黄/涉暴/公共安全/社会安全/违法乱纪/广告法）仍由腾讯云配置层强制执行
            </div>
          </template>

          <div v-if="!enabling" class="level-row">
            <span>审查级别：</span>
            <span class="level-value">{{ levelLabel }}</span>
          </div>

          <div v-if="!enabling && liveCount > 0" class="live-warning">
            ⚠ 当前有 <strong>{{ liveCount }}</strong> 场直播正在进行中<br />
            关闭后直播中控内容审查Tab将立即消失，已产生的违规记录保留但不再接收新违规
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-default" @click="$emit('cancel')">取消</button>
          <button
            :class="['btn', enabling ? 'btn-primary' : 'btn-danger']"
            @click="$emit('confirm')"
          >
            {{ enabling ? '确认开启' : '确认关闭' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TenantAuditConfig } from '../../../contracts';

const props = defineProps<{
  visible: boolean;
  enabling: boolean;
  config: TenantAuditConfig;
  liveCount: number;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();

const levelOptions: Record<string, string> = {
  all: '全部',
  sensitive_only: '仅涉黄涉暴',
  custom: '自定义',
};

const levelLabel = computed(() => levelOptions['all'] || '全部');
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-mask, rgba(0,0,0,0.45));
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.2s ease-out;
}
.modal {
  background: #fff;
  border-radius: var(--radius-lg, 8px);
  box-shadow: var(--shadow-modal, 0 4px 20px rgba(0,0,0,0.15));
  width: 480px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}
.modal.disable { border: 2px solid var(--color-danger, #F5222D); }
.modal.enable { border: 2px solid transparent; }
.modal.disable .modal-header { background: var(--color-danger-bg, #FFF2F0); }
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.modal-header h3 {
  margin: 0;
  font-size: var(--font-h3, 16px);
  font-weight: 500;
}
.modal-body {
  padding: 20px 24px;
  max-height: 50vh;
  overflow-y: auto;
}
.summary-row {
  font-size: var(--font-body, 14px);
  color: var(--color-text-primary, #262626);
  margin-bottom: 6px;
}
.divider {
  height: 1px;
  background: var(--color-border, #D9D9D9);
  margin: 12px 0;
}
.desc {
  font-size: var(--font-body, 14px);
  color: var(--color-text-secondary, #8C8C8C);
  margin: 8px 0;
}
.effect-list {
  margin: 4px 0 8px;
  padding-left: 20px;
  font-size: var(--font-body, 14px);
  color: var(--color-text-secondary, #8C8C8C);
}
.effect-list li { margin-bottom: 2px; }
.warning-box {
  background: var(--color-warning-bg, #FFF7E6);
  border: 1px solid var(--color-warning, #FA8C16);
  border-radius: var(--radius-sm, 2px);
  padding: 8px 12px;
  font-size: var(--font-small, 12px);
  color: var(--color-warning, #FA8C16);
  margin-top: 12px;
}
.level-row {
  margin-top: 8px;
  font-size: var(--font-body, 14px);
  color: var(--color-text-secondary, #8C8C8C);
}
.level-value { color: var(--color-text-primary, #262626); font-weight: 500; }
.live-warning {
  background: var(--color-warning-bg, #FFF7E6);
  border: 1px solid var(--color-warning, #FA8C16);
  border-radius: var(--radius-sm, 2px);
  padding: 10px 14px;
  margin-top: 12px;
  font-size: var(--font-small, 12px);
  color: var(--color-warning, #FA8C16);
  line-height: 1.6;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 24px 16px;
  border-top: 1px solid var(--color-border, #D9D9D9);
}
.btn {
  padding: 6px 20px;
  border-radius: var(--radius-md, 4px);
  font-size: var(--font-body, 14px);
  cursor: pointer;
  border: 1px solid var(--color-border, #D9D9D9);
  transition: all 0.2s;
}
.btn-default { background: #fff; color: var(--color-text-primary, #262626); }
.btn-default:hover { border-color: var(--color-primary, #1890FF); color: var(--color-primary, #1890FF); }
.btn-primary { background: var(--color-primary, #1890FF); color: #fff; border-color: var(--color-primary, #1890FF); }
.btn-primary:hover { background: var(--color-primary-hover, #40A9FF); }
.btn-danger { background: var(--color-danger, #F5222D); color: #fff; border-color: var(--color-danger, #F5222D); }
.btn-danger:hover { background: #FF4D4F; }

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
</style>
