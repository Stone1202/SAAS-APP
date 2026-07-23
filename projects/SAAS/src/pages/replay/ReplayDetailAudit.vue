<template>
  <!-- PG-AUDIT-PC-003：回放详情审查页 /tenant/live/:streamId/replay -->
  <div class="replay-detail-page">
    <div class="replay-layout">
      <!-- 左侧：回放播放器区域 -->
      <div class="replay-player-section">
        <div class="player-header">
          <span class="stream-label">回放 - {{ streamId }}</span>
          <span class="mute-task-badge" v-if="muteTasks.total > 0">
            擦音任务：{{ muteTasks.completed }}/{{ muteTasks.total }}
          </span>
        </div>

        <!-- 播放器占位 -->
        <div class="player-placeholder">
          <div class="player-icon">▶</div>
          <div class="player-hint">回放播放器区域</div>
          <div class="player-timeline">
            <!-- 违规时间标记 -->
            <div
              v-for="v in violations"
              :key="v.violation_id"
              :class="['marker', levelClass(v.violation_level), { active: selectedId === v.violation_id }]"
              :style="{ left: `${getTimelinePercent(v.violation_time)}%` }"
              @click="selectViolation(v.violation_id)"
              :title="`${v.violation_time} - ${v.violation_type}`"
            />
          </div>
          <div class="player-time">00:15:32 / 01:30:00</div>
        </div>

        <!-- 擦音对比面板 -->
        <div class="compare-panel">
          <div class="compare-title">擦音前后对比</div>
          <div class="compare-columns">
            <div class="compare-col before">
              <div class="compare-label">擦音前</div>
              <div class="compare-text">"欢迎大家进入直播间，今天我们带来一款xxx产品..."</div>
            </div>
            <div class="compare-col after">
              <div class="compare-label">擦音后</div>
              <div class="compare-text">"欢迎大家进入直播间，今天我们带来一款***产品..."</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：违规审查面板 -->
      <div class="replay-audit-section">
        <!-- 场次信息 -->
        <div class="replay-field-info">
          <div class="field-title">场次信息</div>
          <div class="field-row">推流ID：{{ streamId }}</div>
          <div class="field-row">开始时间：2026-07-22 14:00:00</div>
          <div class="field-row">结束时间：2026-07-22 15:30:00</div>
          <div class="field-row">峰值观看：12,580人</div>
        </div>

        <!-- 擦音模式 -->
        <div class="mute-mode-section">
          <label class="section-label">擦音模式</label>
          <label
            v-for="opt in muteOptions"
            :key="opt.value"
            :class="['mode-radio', { active: muteMode === opt.value }]"
          >
            <input type="radio" :value="opt.value" v-model="muteMode" />
            <span>{{ opt.label }}</span>
          </label>
        </div>

        <!-- 违规列表 -->
        <div class="replay-vio-list">
          <div class="section-label">违规记录（{{ violations.length }}）</div>
          <div
            v-for="v in violations"
            :key="v.violation_id"
            :class="['replay-vio-row', { selected: selectedId === v.violation_id }]"
            @click="selectViolation(v.violation_id)"
          >
            <div :class="['color-dot', levelClass(v.violation_level)]" />
            <div class="vio-content">
              <span class="vio-time">{{ formatTime(v.violation_time) }}</span>
              <span class="vio-type">{{ v.violation_type }}</span>
              <span class="vio-snippet">{{ truncate(v.violation_content, 30) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 违规详情 -->
    <ViolationDetailPanel
      :visible="detailVisible"
      :violation="selectedViolation || null"
      @close="detailVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import ViolationDetailPanel from '../../components/audit/tenant/ViolationDetailPanel.vue';
import type { MuteMode } from '../../contracts';

const route = useRoute();
const store = useAuditStore();

const streamId = computed(() => (route.params.streamId as string) || 'UNKNOWN');
const muteMode = ref<MuteMode>('beep');

const muteOptions = [
  { label: '静音', value: 'silent' },
  { label: '擦音（滴滴声）', value: 'beep' },
];

// 擦音任务进度
const muteTasks = ref({ total: 8, completed: 5 });

// 违规列表
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

function levelClass(level: string) {
  const m: Record<string, string> = { L1: 'l1', L2: 'l2', L3: 'l3', L4: 'l4' };
  return m[level] || 'l4';
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false });
}

function truncate(text: string, max: number) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

// 时间轴上 marker 位置百分比
function getTimelinePercent(ts: string) {
  const start = new Date('2026-07-22T14:00:00').getTime();
  const end = new Date('2026-07-22T15:30:00').getTime();
  const t = new Date(ts).getTime();
  return Math.max(0, Math.min(100, ((t - start) / (end - start)) * 100));
}

onMounted(() => {
  store.setFieldStatus('replaying');
});
</script>

<style scoped>
.replay-detail-page {
  height: 100vh;
  background: var(--color-bg, #F5F5F5);
  overflow: hidden;
}
.replay-layout {
  display: flex;
  height: 100%;
}
/* 左侧播放器区 */
.replay-player-section {
  flex: 1.5;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #000;
  border-right: 2px solid var(--color-border, #D9D9D9);
}
.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #1A1A1A;
}
.stream-label { color: #fff; font-size: 14px; }
.mute-task-badge { color: var(--color-warning, #FA8C16); font-size: 12px; }
.player-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.player-icon { font-size: 64px; opacity: 0.4; }
.player-hint { color: rgba(255,255,255,0.3); margin-top: 8px; font-size: 14px; }
.player-timeline {
  position: absolute;
  bottom: 40px;
  left: 24px;
  right: 24px;
  height: 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
}
.marker {
  position: absolute;
  top: -4px;
  width: 10px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
  transform: translateX(-5px);
  transition: transform 0.15s, box-shadow 0.15s;
}
.marker:hover, .marker.active { transform: translateX(-5px) scale(1.3); box-shadow: 0 0 8px rgba(255,255,255,0.4); }
.marker.l1 { background: var(--color-danger, #F5222D); }
.marker.l2 { background: var(--color-warning, #FA8C16); }
.marker.l3 { background: var(--color-warning, #FA8C16); }
.marker.l4 { background: var(--color-info, #1890FF); }
.player-time {
  position: absolute;
  bottom: 12px;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
}
.compare-panel {
  background: #1A1A1A;
  padding: 12px 16px;
  border-top: 1px solid #333;
}
.compare-title { color: #fff; font-size: 13px; margin-bottom: 8px; }
.compare-columns { display: flex; gap: 12px; }
.compare-col { flex: 1; }
.compare-label { font-size: 11px; color: var(--color-text-secondary, #8C8C8C); margin-bottom: 4px; }
.compare-text { font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.5; }
.compare-col.before .compare-text { color: var(--color-danger, #F5222D); }
.compare-col.after .compare-text { color: var(--color-success, #52C41A); }
/* 右侧审查面板 */
.replay-audit-section {
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}
.replay-field-info, .mute-mode-section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.field-title { font-size: 14px; font-weight: 500; margin-bottom: 6px; }
.field-row { font-size: 12px; color: var(--color-text-secondary, #8C8C8C); margin-bottom: 2px; }
.section-label { font-size: 12px; color: var(--color-text-secondary, #8C8C8C); display: block; margin-bottom: 6px; }
.mode-radio { display: inline-flex; align-items: center; gap: 3px; margin-right: 16px; font-size: 13px; cursor: pointer; }
.mode-radio.active { color: var(--color-primary, #1890FF); }
.replay-vio-list { flex: 1; overflow-y: auto; padding: 8px 0; }
.replay-vio-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.replay-vio-row:hover { background: var(--color-muted, #F5F5F5); }
.replay-vio-row.selected { background: var(--color-info-bg, #E6F7FF); }
.color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.color-dot.l1 { background: var(--color-danger, #F5222D); }
.color-dot.l2 { background: var(--color-warning, #FA8C16); }
.color-dot.l3 { background: var(--color-warning, #FA8C16); }
.color-dot.l4 { background: var(--color-info, #1890FF); }
.vio-content { min-width: 0; }
.vio-time { font-size: 11px; color: var(--color-text-secondary, #8C8C8C); margin-right: 6px; }
.vio-type { font-size: 12px; font-weight: 500; margin-right: 6px; }
.vio-snippet { font-size: 11px; color: var(--color-text-secondary, #8C8C8C); }
</style>
