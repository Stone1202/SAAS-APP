<template>
  <!-- M-AUDIT-002/003/004：处置确认弹窗（记录/断流/忽略三合一） -->
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('cancel')">
      <div :class="['modal', type]">
        <div class="modal-header">
          <h3>
            <span v-if="type === 'sever'">⚠ 确认断流终止直播</span>
            <span v-else-if="type === 'ignore'">确认忽略该违规</span>
            <span v-else>确认记录违规</span>
          </h3>
        </div>

        <div class="modal-body">
          <div class="info-row">
            <span>违规时间：{{ formatTime(violation?.violation_time) }}</span>
          </div>
          <div class="info-row">
            <span>违规类型：{{ violation?.violation_level }} - {{ violation?.violation_type }}</span>
          </div>
          <div class="info-row">
            <span>内容片段：「{{ truncate(violation?.violation_content, 30) }}」</span>
          </div>

          <!-- 断流专用警告 -->
          <div v-if="type === 'sever'" class="sever-warning">
            🔴 断流后直播将立即终止，观众端显示结束提示，此操作不可撤销！
          </div>

          <div class="input-section">
            <label class="input-label">
              {{ type === 'record' ? '📝 处置备注（必填）' : type === 'sever' ? '📝 处置理由（必填）' : '📝 忽略理由（必填）' }}
            </label>
            <textarea
              v-model="note"
              class="note-input"
              :placeholder="inputPlaceholder"
              maxlength="500"
              rows="3"
            />
            <div class="char-count">
              <span :class="{ 'invalid': note.length < minLen }">{{ note.length }}/500</span>
              <span v-if="note.length < minLen" class="hint">请输入至少{{ minLen }}字说明</span>
            </div>
          </div>

          <!-- 忽略说明 -->
          <div v-if="type === 'ignore'" class="action-desc">
            忽略后违规状态标记为「已忽略」，不计入处置统计。
          </div>
          <!-- 记录说明 -->
          <div v-if="type === 'record'" class="action-desc">
            记录后不打断直播，违规记录将存档备查。
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-default" @click="$emit('cancel')">取消</button>
          <button
            :class="confirmBtnClass"
            :disabled="note.length < minLen"
            @click="handleConfirm"
          >
            {{ type === 'sever' ? '确认断流' : type === 'ignore' ? '确认忽略' : '确认记录' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { ReviewViolation } from '../../../contracts';

const props = defineProps<{
  visible: boolean;
  type: 'record' | 'sever' | 'ignore';
  violation: ReviewViolation | null;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  confirm: [note: string];
  cancel: [];
}>();

const note = ref('');
const minLen = 10;

watch(() => props.visible, (v) => {
  if (!v) note.value = '';
});

function handleConfirm() {
  if (note.value.length >= minLen) {
    emit('confirm', note.value);
    note.value = '';
  }
}

const inputPlaceholder = computed(() => {
  if (props.type === 'sever') return '请输入断流理由（至少10字）…';
  if (props.type === 'ignore') return '请输入忽略理由（至少10字）…';
  return '请输入处置备注（至少10字）…';
});

const confirmBtnClass = computed(() => ({
  btn: true,
  'btn-primary': true,
  'btn-danger-filled': props.type === 'sever',
  'btn-disabled': note.value.length < minLen,
}));

function formatTime(ts?: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false });
}

function truncate(text?: string, max = 30) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '...' : text;
}
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
  width: 460px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}
.modal.sever { border: 2px solid var(--color-danger, #F5222D); }
.modal.sever .modal-header { background: var(--color-danger-bg, #FFF2F0); }
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 500; }
.modal-header h3:has(span) { color: var(--color-text-primary, #262626); }
.modal-body { padding: 20px 24px; }
.info-row {
  font-size: 14px;
  color: var(--color-text-primary, #262626);
  margin-bottom: 6px;
}
.sever-warning {
  background: var(--color-danger-bg, #FFF2F0);
  border: 1px solid var(--color-danger, #F5222D);
  border-radius: 4px;
  padding: 10px 14px;
  margin: 12px 0;
  font-size: 13px;
  color: var(--color-danger, #F5222D);
  line-height: 1.6;
}
.input-section { margin-top: 16px; }
.input-label {
  display: block;
  font-size: 13px;
  color: var(--color-text-secondary, #8C8C8C);
  margin-bottom: 6px;
}
.note-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border, #D9D9D9);
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  color: var(--color-text-primary, #262626);
  box-sizing: border-box;
}
.note-input:focus { border-color: var(--color-primary, #1890FF); outline: none; box-shadow: 0 0 0 2px rgba(24,144,255,0.15); }
.char-count {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-secondary, #8C8C8C);
  margin-top: 4px;
}
.char-count .invalid { color: var(--color-danger, #F5222D); }
.hint { color: var(--color-danger, #F5222D); }
.action-desc {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-secondary, #8C8C8C);
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
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--color-border, #D9D9D9);
  transition: all 0.2s;
}
.btn-default { background: #fff; color: var(--color-text-primary, #262626); }
.btn-default:hover { border-color: var(--color-primary, #1890FF); color: var(--color-primary, #1890FF); }
.btn-primary { background: var(--color-primary, #1890FF); color: #fff; border-color: var(--color-primary, #1890FF); }
.btn-primary:hover { background: var(--color-primary-hover, #40A9FF); }
.btn-danger-filled { background: var(--color-danger, #F5222D); color: #fff; border-color: var(--color-danger, #F5222D); }
.btn-danger-filled:hover { background: #FF4D4F; }
.btn-disabled { opacity: 0.5; cursor: not-allowed; }
.btn-disabled:hover { background: inherit; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
</style>
