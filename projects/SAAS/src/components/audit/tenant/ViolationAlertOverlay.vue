<template>
  <!-- B-AUDIT-013：监控画面违规强提示覆盖层（FN-AUDIT-PC-002 备选流程） -->
  <div v-if="pendingViolations.length > 0" class="alert-overlay-root">
    <!-- 堆叠卡片区：仅当前卡片完整展开，其余向下层叠露出边缘 -->
    <div class="alert-stack" :class="{ expanded: isExpanded }">
      <div
        v-for="(alert, index) in visibleAlerts"
        :key="alert.violation_id"
        :class="['alert-card', levelClass(alert.violation_level), { active: index === currentIndex }]"
        :style="cardStyle(index)"
        @click="index === currentIndex ? undefined : switchTo(index)"
      >
        <!-- 违规级别标签 + 类型 -->
        <div class="alert-header">
          <span :class="['level-badge', levelClass(alert.violation_level)]">
            {{ alert.violation_level }}
          </span>
          <span class="alert-type">{{ typeLabel(alert.violation_type) }}</span>
          <span class="alert-time">{{ formatTime(alert.violation_time) }}</span>
        </div>

        <!-- 违规内容摘要 -->
        <div class="alert-content">
          {{ alert.violation_content.length > 40
            ? alert.violation_content.slice(0, 40) + '...'
            : alert.violation_content }}
        </div>

        <!-- 快捷操作入口：断流 / 记录 / 忽略（仅当前激活卡片可交互） -->
        <div v-if="index === currentIndex" class="alert-actions">
          <button
            :class="['action-btn', 'sever']"
            :disabled="alert.violation_level === 'L4'"
            @click.stop="$emit('quick-sever', alert.violation_id)"
            :title="alert.violation_level === 'L4' ? 'L4仅可记录' : '断流直播'"
          >
            断流
          </button>
          <button
            class="action-btn record"
            @click.stop="$emit('quick-record', alert.violation_id)"
          >
            记录
          </button>
          <button
            :class="['action-btn', 'ignore']"
            :disabled="alert.violation_level === 'L1'"
            @click.stop="$emit('quick-ignore', alert.violation_id)"
            :title="alert.violation_level === 'L1' ? 'L1不可忽略' : '忽略该违规'"
          >
            忽略
          </button>
        </div>
      </div>
    </div>

    <!-- 堆叠控制栏：切换 / 展开 / 计数 -->
    <div class="stack-controls">
      <button
        class="ctrl-btn"
        :disabled="currentIndex <= 0"
        @click="prev"
        title="上一条"
      >
        ‹
      </button>

      <span class="stack-counter" @click="toggleExpand">
        {{ currentIndex + 1 }} / {{ visibleAlerts.length }}
        <span v-if="hiddenCount > 0" class="hidden-hint">+{{ hiddenCount }} 条待处理</span>
        <span class="expand-hint">{{ isExpanded ? '收起' : '展开' }}</span>
      </span>

      <button
        class="ctrl-btn"
        :disabled="currentIndex >= visibleAlerts.length - 1"
        @click="next"
        title="下一条"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * B-AUDIT-013：监控画面违规强提示覆盖层
 *
 * 交互规则：
 * 1. 收到任何违规立即显示
 * 2. 不可手动关闭，必须完成操作（断流/记录/忽略）
 * 3. 多违规时采用「堆叠」而非「依次展开」，避免遮挡监控画面
 * 4. 默认仅当前卡片完整显示，其余卡片向下层叠露出边缘
 * 5. 可点击切换或展开查看全部
 * 6. 呼吸动画持续提醒当前卡片
 * 7. 级别样式：L1红 / L2橙 / L3黄 / L4蓝
 *
 * BR-AUDIT-003 处置渐进式规则：
 *   L1(红) → 断流+记录
 *   L2(橙) → 断流+记录+忽略
 *   L3(黄) → 断流+记录+忽略
 *   L4(蓝) → 仅记录
 */
import { computed, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import type { ReviewViolation } from '../../../contracts';

const props = defineProps<{
  /** 待处理的违规列表（按时间倒序，最新在前） */
  pendingViolations: ReviewViolation[];
  /** 最大可视卡片数 */
  maxVisible?: number;
}>();

defineEmits<{
  'quick-record': [violationId: string];
  'quick-sever': [violationId: string];
  'quick-ignore': [violationId: string];
}>();

const maxVisible = computed(() => props.maxVisible ?? 3);
const isExpanded = ref(false);
const currentIndex = ref(0);

/** 当前可视范围内的违规卡片（用于堆叠） */
const visibleAlerts = computed(() =>
  props.pendingViolations.slice(0, maxVisible.value)
);

/** 超出最大可视的待处理违规数 */
const hiddenCount = computed(() =>
  Math.max(0, props.pendingViolations.length - maxVisible.value)
);

/** 列表变化时重置到最新一条 */
watch(
  () => props.pendingViolations.length,
  () => { currentIndex.value = 0; }
);

function prev() {
  if (currentIndex.value > 0) currentIndex.value--;
}

function next() {
  if (currentIndex.value < visibleAlerts.value.length - 1) currentIndex.value++;
}

function switchTo(index: number) {
  currentIndex.value = index;
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

/** 堆叠卡片样式：非当前卡片向下偏移、缩小、半透明 */
function cardStyle(index: number): CSSProperties {
  if (isExpanded.value) {
    return {
      position: 'relative',
      transform: 'translateY(0) scale(1)',
      opacity: 1,
      zIndex: visibleAlerts.value.length - index,
      marginBottom: '6px',
    };
  }
  const offset = (index - currentIndex.value) * 8;
  const scale = index === currentIndex.value ? 1 : Math.max(0.86, 1 - Math.abs(index - currentIndex.value) * 0.06);
  const opacity = index === currentIndex.value ? 1 : Math.max(0.35, 1 - Math.abs(index - currentIndex.value) * 0.25);
  const zIndex = visibleAlerts.value.length - Math.abs(index - currentIndex.value);
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transform: `translateY(${offset}px) scale(${scale})`,
    opacity,
    zIndex,
    pointerEvents: index === currentIndex.value ? 'auto' : 'none',
  };
}

/** 违规级别样式类 */
function levelClass(level: string): string {
  const map: Record<string, string> = {
    L1: 'level-l1', // 红
    L2: 'level-l2', // 橙
    L3: 'level-l3', // 黄
    L4: 'level-l4', // 蓝
  };
  return map[level] || 'level-l4';
}

/** 违规类型中文标签 */
function typeLabel(type: string): string {
  const map: Record<string, string> = {
    porn: '涉黄', violence: '涉暴', politics: '涉政',
    abuse: '辱骂', ad_law: '广告法', banned_words: '违禁词',
    illegal: '违法', public_safety: '公共安全',
    social_safety: '社会安全', custom: '自定义',
  };
  return map[type] || type;
}

/** 格式化时间 */
function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('zh-CN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return '--:--:--';
  }
}
</script>

<style scoped>
.alert-overlay-root {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
  max-width: 90%;
  width: 380px;
}

.alert-stack {
  position: relative;
  width: 100%;
  min-height: 116px; /* 单张卡片高度约 110px + 偏移 */
  transition: min-height 0.25s ease;
}

.alert-stack.expanded {
  min-height: auto;
}

/* ── 卡片 ── */
.alert-card {
  background: rgba(255, 77, 79, 0.95);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  box-shadow: 0 4px 20px rgba(255, 77, 79, 0.45);
  backdrop-filter: blur(6px);
  transition: transform 0.25s ease, opacity 0.25s ease;
  cursor: default;
}

.alert-card:not(.active) {
  cursor: pointer;
}

.alert-card.active {
  animation: breathe 2s ease-in-out infinite;
}

/* L2 橙色 */
.alert-card.level-l2 {
  background: rgba(250, 140, 22, 0.95);
  box-shadow: 0 4px 20px rgba(250, 140, 22, 0.45);
}
/* L3 黄色 */
.alert-card.level-l3 {
  background: rgba(250, 200, 0, 0.95);
  box-shadow: 0 4px 20px rgba(250, 200, 0, 0.4);
}
.alert-card.level-l3,
.alert-card.level-l3 .alert-type,
.alert-card.level-l3 .alert-content {
  color: #3d2e00;
}
/* L4 蓝色 */
.alert-card.level-l4 {
  background: rgba(24, 144, 255, 0.9);
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.4);
}

@keyframes breathe {
  0%, 100% { box-shadow: 0 4px 20px rgba(255, 77, 79, 0.35); }
  50%      { box-shadow: 0 4px 28px rgba(255, 77, 79, 0.7), 0 0 0 4px rgba(255, 77, 79, 0.15); }
}

.alert-card.level-l2.active { animation-name: breathe-l2; }
@keyframes breathe-l2 {
  0%, 100% { box-shadow: 0 4px 20px rgba(250, 140, 22, 0.35); }
  50%      { box-shadow: 0 4px 28px rgba(250, 140, 22, 0.7), 0 0 0 4px rgba(250, 140, 22, 0.15); }
}

.alert-card.level-l3.active { animation-name: breathe-l3; }
@keyframes breathe-l3 {
  0%, 100% { box-shadow: 0 4px 20px rgba(250, 200, 0, 0.3); }
  50%      { box-shadow: 0 4px 28px rgba(250, 200, 0, 0.6), 0 0 0 4px rgba(250, 200, 0, 0.1); }
}

.alert-card.level-l4.active { animation-name: breathe-l4; }
@keyframes breathe-l4 {
  0%, 100% { box-shadow: 0 4px 20px rgba(24, 144, 255, 0.3); }
  50%      { box-shadow: 0 4px 28px rgba(24, 144, 255, 0.6), 0 0 0 4px rgba(24, 144, 255, 0.1); }
}

/* ── 卡片内部 ── */
.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
}

.alert-type {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
}

.alert-time {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.6;
}

.alert-content {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.85;
  margin-bottom: 8px;
  word-break: break-all;
}

.alert-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  flex: 1;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.15s;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.action-btn.sever:hover:not(:disabled) {
  background: rgba(255, 0, 0, 0.5);
  border-color: #fff;
}

.action-btn.ignore:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.alert-card.level-l3 .action-btn,
.alert-card.level-l3 .action-btn:hover:not(:disabled) {
  color: #3d2e00;
  border-color: rgba(61, 46, 0, 0.5);
}

/* ── 堆叠控制栏 ── */
.stack-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

.ctrl-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s;
}

.ctrl-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.ctrl-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.stack-counter {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.hidden-hint {
  color: #ffd666;
}

.expand-hint {
  opacity: 0.65;
  text-decoration: underline;
}
</style>
