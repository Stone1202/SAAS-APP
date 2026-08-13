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
          <div class="player-hint">
            回放播放器区域
            <HelpIcon
              @click="openElementHelp('E-AUDIT-003-01')"
              title="查看「回放播放器」用例说明"
            />
          </div>
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
          <div class="player-time-row">
            <span class="player-time">00:15:32 / 01:30:00</span>
            <HelpIcon
              @click="openElementHelp('E-AUDIT-003-03')"
              title="查看「时间轴违规标记」用例说明"
            />
          </div>
        </div>

        <!-- 擦音对比面板 -->
        <div class="compare-panel">
          <div class="compare-title">
            擦音前后对比
            <HelpIcon
              @click="openElementHelp('E-AUDIT-003-10')"
              title="查看「擦音前后对比面板」用例说明"
            />
          </div>
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

        <!-- BR-AUDIT-004/015: 人工核对→发布操作区（仅审核模式） -->
        <div class="publish-action-bar" v-if="isReviewMode">
          <!-- 已发布状态 -->
          <div v-if="store.replayPublishStatus === 'published'" class="publish-done">
            <span class="done-check">✅</span>
            <span>回放已发布，观众可观看</span>
          </div>
          <template v-else>
            <div class="publish-status-row">
              <span class="publish-label">发布状态：</span>
              <el-tag
                :type="publishTagType"
                size="small"
              >{{ publishStatusLabel }}</el-tag>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-003-09')"
                title="查看「发布状态标签」用例说明"
              />
            </div>
            <div class="publish-btn-row" v-if="store.replayTask?.task_status === 'completed' && store.replayPublishStatus === 'pending_review'">
              <el-button type="success" size="small" @click="handlePublish">
                核对通过·发布回放
              </el-button>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-003-07')"
                title="查看「核对通过·发布回放」按钮用例说明"
              />
              <el-button type="danger" size="small" plain @click="handleReject">
                驳回重新擦音
              </el-button>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-003-08')"
                title="查看「驳回重新擦音」按钮用例说明"
              />
            </div>
            <div class="publish-btn-row" v-if="store.replayPublishStatus === 'rejected'">
              <el-button type="warning" size="small" @click="handleRetryMute">
                重新擦音
              </el-button>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-003-06')"
                title="查看「重新擦音」按钮用例说明"
              />
            </div>
            <div
              v-if="store.replayTask?.task_status !== 'completed'"
              class="publish-hint"
            >
              擦音处理中，完成后可进行人工核对
            </div>
          </template>
        </div>

        <!-- 查看模式：已发布标识 -->
        <div class="publish-action-bar" v-if="!isReviewMode">
          <div class="publish-done">
            <span class="done-check">✅</span>
            <span>回放已发布 · 观众可见</span>
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
          <label class="section-label">
            擦音模式
            <HelpIcon
              @click="openElementHelp('E-AUDIT-003-05')"
              title="查看「擦音模式选择」用例说明"
            />
          </label>
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
          <div class="section-label">
            违规记录（{{ violations.length }}）
            <HelpIcon
              @click="openElementHelp('E-AUDIT-003-04')"
              title="查看「违规记录列表」用例说明"
            />
          </div>
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

  <!-- 用例交互卡 -->
  <HelpButton @open="showDrawer = true" />
  <UseCaseDrawer
    :visible="showDrawer"
    title="用例卡 — 回放擦音审查"
    :cards="replayAuditCards as any"
    :highlight-element-id="highlightElementId"
    @close="showDrawer = false; highlightElementId = ''"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import { useReplayService } from '../../services/audit-service';
import ViolationDetailPanel from '../../components/audit/tenant/ViolationDetailPanel.vue';
import HelpButton from '../../components/use-case-card/HelpButton.vue';
import HelpIcon from '../../components/use-case-card/HelpIcon.vue';
import UseCaseDrawer from '../../components/use-case-card/UseCaseDrawer.vue';
import { replayAuditCards } from './useCaseCardData';
import type { MuteMode } from '../../contracts';

const route = useRoute();
const router = useRouter();
const store = useAuditStore();
const showDrawer = ref(false);
const highlightElementId = ref('');

function openElementHelp(elementId: string) {
  highlightElementId.value = elementId;
  showDrawer.value = true;
}
const replayService = useReplayService();

const streamId = computed(() => (route.params.streamId as string) || 'UNKNOWN');
/** 页面模式：review=核对发布模式 / view=查看已发布回放 */
const pageMode = computed(() => (route.query.mode as string) || 'review');
const isReviewMode = computed(() => pageMode.value === 'review');
const muteMode = ref<MuteMode>('beep');

const muteOptions = [
  { label: '静音', value: 'silent' },
  { label: '擦音（滴滴声）', value: 'beep' },
];

// 擦音任务进度（从 Store 动态计算：total=违规总数，completed=progress%推算已处理数）
const muteTasks = computed(() => {
  const total = violations.value.length;
  const progress = store.replayTask?.progress ?? 0;
  const completed = total > 0 ? Math.round((total * progress) / 100) : 0;
  return { total, completed };
});

// 违规列表
const violations = computed(() => store.violations);

const selectedId = ref<string>();
const detailVisible = ref(false);
const selectedViolation = computed(() => {
  if (!selectedId.value) return null;
  return store.violations.find((v: any) => v.violation_id === selectedId.value) || null;
});

// ═══ BR-AUDIT-004/015: 发布状态标签 ═══
const publishStatusLabel = computed(() => {
  const map: Record<string, string> = {
    pending_review: '待核对',
    reviewed: '已核对（待发布）',
    published: '已发布',
    rejected: '已驳回',
  };
  return map[store.replayPublishStatus] || '—';
});

const publishTagType = computed(() => {
  const map: Record<string, string> = {
    pending_review: 'warning',
    reviewed: 'primary',
    published: 'success',
    rejected: 'danger',
  };
  return map[store.replayPublishStatus] || 'info';
});

/** 核对通过 → 发布回放（BR-AUDIT-004），完成后跳回回放管理 */
function handlePublish() {
  store.publishReplay();
  // 发布成功后跳回回放管理列表
  setTimeout(() => {
    router.push('/tenant/dashboard#replay');
  }, 800);
}

/** 驳回 → 重新擦音（BR-AUDIT-015） */
function handleReject() {
  store.rejectReplay();
}

/** 重新触发擦音 */
async function handleRetryMute() {
  await replayService.retryMute(streamId.value);
}

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

onMounted(async () => {
  store.setFieldStatus('replaying', streamId.value);
  // BR-AUDIT-004/015: 审核模式下自动触发擦音任务，完成后即可核对
  if (isReviewMode.value) {
    await replayService.startReplayMute(streamId.value);
  }
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

/* BR-AUDIT-004/015: 发布操作栏 */
.publish-action-bar {
  background: #1A1A1A;
  padding: 12px 16px;
  border-top: 1px solid #333;
}
.publish-status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.publish-label { color: rgba(255,255,255,0.7); font-size: 13px; }
.publish-btn-row { display: flex; gap: 8px; }
.publish-hint { color: rgba(255,255,255,0.35); font-size: 12px; text-align: center; padding: 4px 0; }
.publish-done { display: flex; align-items: center; gap: 8px; color: var(--color-success, #52C41A); font-size: 13px; }
.done-check { font-size: 16px; }

/* 帮助图标与文本内联对齐 */
.player-hint,
.player-time-row,
.compare-title,
.section-label,
.publish-status-row,
.publish-btn-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
