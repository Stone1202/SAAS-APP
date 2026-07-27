<template>
  <transition name="drawer-slide">
    <div v-if="visible" class="use-case-drawer" @click.self="emit('close')">
      <div class="drawer-mask" />
      <div class="drawer-panel">
        <div class="drawer-header">
          <h3 class="drawer-title">{{ title }}</h3>
          <button class="drawer-close" type="button" @click="emit('close')">✕</button>
        </div>

        <div class="drawer-body">
          <div
            v-for="(card, idx) in cards"
            :key="card.ucId || idx"
            class="uc-card"
          >
            <div class="uc-card-header">
              <div class="uc-card-title-row">
                <span class="uc-card-id">{{ card.ucId }}</span>
                <span class="uc-priority" :class="priorityClass(card.priority)">
                  {{ card.priority }}
                </span>
              </div>
              <h4 class="uc-card-name">{{ card.ucName }}</h4>
            </div>

            <!-- 元数据：系统/模块/页面/参与人/影响数据 -->
            <div class="uc-meta-grid">
              <div class="uc-meta-item" v-if="card.system">
                <span class="uc-meta-label">所属系统</span>
                <span class="uc-meta-value">{{ card.system }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.module">
                <span class="uc-meta-label">所属模块</span>
                <span class="uc-meta-value">{{ card.module }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.page">
                <span class="uc-meta-label">所属页面</span>
                <span class="uc-meta-value">{{ card.page }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.participants">
                <span class="uc-meta-label">参与人</span>
                <span class="uc-meta-value">{{ card.participants }}</span>
              </div>
              <div class="uc-meta-item full" v-if="card.affectedData">
                <span class="uc-meta-label">影响数据</span>
                <span class="uc-meta-value code">{{ card.affectedData }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.fnId">
                <span class="uc-meta-label">功能编号</span>
                <span class="uc-meta-value code">{{ card.fnId }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.pgId">
                <span class="uc-meta-label">页面编号</span>
                <span class="uc-meta-value code">{{ card.pgId }}</span>
              </div>
            </div>

            <p v-if="card.description" class="uc-description">
              {{ card.description }}
            </p>

            <div class="uc-card-section" v-if="card.precondition">
              <h4>前置条件</h4>
              <p>{{ card.precondition }}</p>
            </div>

            <div class="uc-card-section" v-if="card.basicFlow && card.basicFlow.length">
              <h4>基本流程</h4>
              <ol>
                <li v-for="(step, i) in card.basicFlow" :key="i">{{ step }}</li>
              </ol>
            </div>

            <div class="uc-card-section" v-if="card.altFlow && card.altFlow.length">
              <h4>备选流程</h4>
              <ul>
                <li v-for="(step, i) in card.altFlow" :key="i">{{ step }}</li>
              </ul>
            </div>

            <div class="uc-card-section" v-if="card.postcondition">
              <h4>后置条件</h4>
              <p>{{ card.postcondition }}</p>
            </div>

            <div class="uc-card-section" v-if="card.elementHelps && card.elementHelps.length">
              <h4>
                元素级帮助
                <span class="element-help-count">（{{ card.elementHelps.length }}）</span>
              </h4>
              <div
                v-for="(eh, ei) in card.elementHelps"
                :key="ei"
                class="element-help-item"
                :data-element-help="eh.id"
                :class="{ flash: flashId === eh.id }"
              >
                <div class="element-help-target">
                  <span class="help-dot">?</span>
                  <strong>{{ eh.target }}</strong>
                  <button
                    v-if="eh.id"
                    class="locate-btn"
                    type="button"
                    @click="emit('locate', eh.id)"
                    title="定位到页面元素"
                  >
                    定位
                  </button>
                </div>
                <p>{{ eh.content }}</p>
                <div class="element-help-meta">
                  <span>关联：{{ eh.relatedUC }}</span>
                  <span v-if="eh.relatedBR">规则：{{ eh.relatedBR }}</span>
                  <span v-if="eh.participants">参与：{{ eh.participants }}</span>
                  <span v-if="eh.affectedData" class="code">数据：{{ eh.affectedData }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch, nextTick, ref } from 'vue';

export interface ElementHelp {
  id: string;
  target: string;
  content: string;
  relatedUC: string;
  relatedBR?: string;
  participants?: string;
  affectedData?: string;
}

export interface UseCaseCard {
  ucId: string;
  ucName: string;
  description?: string;
  priority: string;
  fnId: string;
  pgId?: string;
  system?: string;
  module?: string;
  page?: string;
  participants?: string;
  affectedData?: string;
  precondition?: string;
  basicFlow?: string[];
  altFlow?: string[];
  postcondition?: string;
  elementHelps?: ElementHelp[];
}

const props = defineProps<{
  visible: boolean;
  title: string;
  cards: UseCaseCard[];
  highlightElementId?: string;
}>();

const emit = defineEmits<{ close: []; locate: [elementId: string] }>();

const flashId = ref('');

watch(() => props.highlightElementId, async (id) => {
  if (!id) return;
  flashId.value = id;
  await nextTick();
  const el = document.querySelector(`[data-element-help="${id}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  setTimeout(() => {
    flashId.value = '';
  }, 3200);
}, { immediate: true });

function priorityClass(priority: string) {
  const p = (priority || '').toLowerCase();
  if (p.includes('p0') || p.includes('高')) return 'p0';
  if (p.includes('p1') || p.includes('中')) return 'p1';
  return 'p2';
}
</script>

<style scoped>
.use-case-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}
.drawer-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}
.drawer-panel {
  position: relative;
  width: 520px;
  max-width: 90vw;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}
.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}
.drawer-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}
.drawer-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 40px;
  background: #f3f4f6;
}
.uc-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.uc-card-header {
  margin-bottom: 12px;
}
.uc-card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.uc-card-id {
  font-family: monospace;
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}
.uc-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}
.uc-priority {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
}
.uc-priority.p0 {
  background: #fee2e2;
  color: #b91c1c;
}
.uc-priority.p1 {
  background: #fef3c7;
  color: #92400e;
}
.uc-priority.p2 {
  background: #e5e7eb;
  color: #374151;
}
.uc-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.uc-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.uc-meta-item.full {
  grid-column: 1 / -1;
}
.uc-meta-label {
  font-size: 11px;
  color: #94a3b8;
}
.uc-meta-value {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
}
.uc-meta-value.code {
  font-family: monospace;
  color: #475569;
  word-break: break-word;
}
.uc-description {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  margin: 0 0 12px;
  padding: 10px 12px;
  background: #f0f9ff;
  border-left: 3px solid #38bdf8;
  border-radius: 0 8px 8px 0;
}
.uc-card-section {
  margin-top: 12px;
}
.uc-card-section h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.uc-card-section p {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}
.uc-card-section ol,
.uc-card-section ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
}
.uc-card-section li {
  margin-bottom: 4px;
}
.element-help-count {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
}
.element-help-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  scroll-margin-top: 100px;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.element-help-item.flash {
  animation: flash-pulse 1.6s ease-in-out 2;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.18);
}
@keyframes flash-pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.18); }
  50% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0.06); }
}
.element-help-target {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #1f2937;
}
.help-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.locate-btn {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #4f46e5;
  cursor: pointer;
}
.locate-btn:hover {
  background: #c7d2fe;
}
.element-help-item p {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
}
.element-help-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}
.element-help-meta .code {
  color: #64748b;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.drawer-slide-enter-from .drawer-mask,
.drawer-slide-leave-to .drawer-mask {
  opacity: 0;
}
.drawer-mask {
  transition: opacity 0.25s ease;
}
</style>
