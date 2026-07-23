<template>
  <!-- M-AUDIT-005：违规详情抽屉 -->
  <teleport to="body">
    <transition name="drawer-slide">
      <div v-if="visible" class="drawer-overlay" @click.self="$emit('close')">
        <div class="drawer-panel">
          <div class="drawer-header">
            <span class="drawer-title">违规详情</span>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>
          <div class="drawer-body" v-if="violation">
            <div class="detail-row">
              <span class="label">违规时间</span>
              <span class="value">{{ formatTime(violation.violation_time) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">违规级别</span>
              <span :class="['level-badge', levelClass(violation.violation_level)]">[{{ violation.violation_level }}] {{ levelLabel(violation.violation_level) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">违规类型</span>
              <span class="value">{{ violation.violation_type }}</span>
            </div>
            <div class="detail-row">
              <span class="label">子标签</span>
              <span class="value">{{ (violation.raw_callback as any)?.sub_label || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">置信度</span>
              <span class="value">{{ violation.confidence }}%</span>
            </div>
            <!-- 擦音模式字段 -->
            <div class="detail-row" v-if="muteMode">
              <span class="label">擦音模式</span>
              <span class="value">{{ muteMode === 'silent' ? '静音' : muteMode === 'beep' ? '擦音' : muteMode }}</span>
            </div>
            <div class="detail-row">
              <span class="label">推流ID</span>
              <span class="value mono">{{ violation.stream_id || '—' }}</span>
            </div>

            <div class="section-title">ASR文本</div>
            <div class="asr-block">「{{ violation.violation_content }}」</div>

            <div class="section-title">回调JSON</div>
            <pre class="json-block">{{ formatCallback(violation) }}</pre>

            <div class="section-title" v-if="violation.disposal_status !== 'pending'">处置记录</div>
            <div class="disposal-record" v-if="violation.disposal_status !== 'pending'">
              <div class="record-time">{{ formatTime(violation.created_at) }}</div>
              <div class="record-note">状态：{{ statusText(violation.disposal_status) }}</div>
            </div>
          </div>
          <div v-else class="drawer-body">
            <div class="empty">请选择一条违规记录查看详情</div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import type { ReviewViolation, MuteMode } from '../../../contracts';

defineProps<{
  visible: boolean;
  violation: ReviewViolation | null;
  muteMode?: MuteMode;
}>();

defineEmits<{
  close: [];
}>();

function levelClass(level: string) {
  const m: Record<string, string> = { L1: 'l1', L2: 'l2', L3: 'l3', L4: 'l4' };
  return m[level] || 'l4';
}

function levelLabel(level: string) {
  const m: Record<string, string> = { L1: '红-L1', L2: '橙-L2', L3: '黄-L3', L4: '蓝-L4' };
  return m[level] || level;
}

function formatTime(ts?: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function formatCallback(v: ReviewViolation) {
  return JSON.stringify({
    hit_flag: v.disposal_status === 'pending' ? 1 : 0,
    score: v.confidence || 0,
    label: v.violation_type,
    sub_label: (v.raw_callback as any)?.sub_label || '',
    suggestion: v.disposal_status === 'cut_off' ? 'Block' : 'Review',
    asr_text: v.violation_content,
    seq: v.violation_id,
    stream_id: v.stream_id,
  }, null, 2);
}

function statusText(status: string) {
  const m: Record<string, string> = {
    pending: '待处理', recorded: '已记录', cut_off: '已断流',
    ignored: '已忽略', timeout: '已超时', archived: '已归档',
  };
  return m[status] || status;
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-mask, rgba(0,0,0,0.45));
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  animation: fade-in 0.2s ease-out;
}
.drawer-panel {
  width: 420px;
  max-width: 90vw;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.drawer-title {
  font-size: var(--font-h3, 16px);
  font-weight: 500;
}
.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-secondary, #8C8C8C);
  padding: 4px;
}
.close-btn:hover { color: var(--color-text-primary, #262626); }
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.empty { padding: 40px 0; text-align: center; color: var(--color-text-secondary, #8C8C8C); }
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: var(--font-body, 14px);
}
.detail-row .label { color: var(--color-text-secondary, #8C8C8C); min-width: 70px; }
.detail-row .value { color: var(--color-text-primary, #262626); text-align: right; }
.mono { font-family: 'SF Mono', Consolas, monospace; font-size: 12px; }
.level-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--radius-sm, 2px);
  font-weight: 500;
}
.level-badge.l1 { background: var(--color-danger, #F5222D); color: #fff; }
.level-badge.l2 { background: var(--color-warning, #FA8C16); color: #fff; }
.level-badge.l3 { background: var(--color-warning, #FA8C16); color: #fff; }
.level-badge.l4 { background: var(--color-info, #1890FF); color: #fff; }
.section-title {
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
  margin: 16px 0 6px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-border, #D9D9D9);
}
.asr-block {
  font-size: var(--font-body, 14px);
  color: var(--color-text-primary, #262626);
  background: var(--color-muted, #F5F5F5);
  padding: 10px 12px;
  border-radius: var(--radius-sm, 2px);
  line-height: 1.6;
}
.json-block {
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 11px;
  background: #1E1E1E;
  color: #D4D4D4;
  padding: 10px 12px;
  border-radius: var(--radius-sm, 2px);
  overflow-x: auto;
  line-height: 1.5;
  margin: 0;
}
.disposal-record {
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
  line-height: 1.6;
}
.record-time { color: var(--color-text-secondary, #8C8C8C); margin-bottom: 2px; }

.drawer-slide-enter-active { animation: slide-in 0.2s ease-out; }
.drawer-slide-leave-active { animation: slide-in 0.15s ease-in reverse; }
@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
</style>
