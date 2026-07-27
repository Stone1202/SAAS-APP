<template>
  <!-- PG-AUDIT-PC-002：直播中控→直播审查Tab /tenant/live-control?tab=audit&streamId=xxx -->
  <div class="live-control-panel">
    <!-- 无 streamId 时提示 -->
    <div v-if="!streamId" class="no-stream">
      请在直播列表中点击「中控台」进入
    </div>

    <template v-else>
      <!-- 顶部 Tab 导航 -->
      <nav class="control-nav">
        <button
          v-for="tab in navTabs"
          :key="tab.key"
          :class="['nav-tab', { active: activeNav === tab.key }]"
          @click="activeNav = tab.key"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <!-- 三栏中控主体 -->
      <div class="control-body">
        <!-- 左侧：聊天室 -->
        <aside class="left-panel chat-panel">
          <div class="panel-header">
            <span class="panel-title">聊天室</span>
            <select v-model="chatFilter" class="chat-filter">
              <option value="all">全部</option>
              <option value="fan">粉丝</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="chat-messages" ref="chatScroll">
            <div
              v-for="(msg, idx) in chatMessages"
              :key="idx"
              :class="['chat-msg', msg.role]"
            >
              <span class="msg-user">{{ msg.user }}</span>
              <span class="msg-text">{{ msg.text }}</span>
            </div>
          </div>
          <div class="chat-input-bar">
            <label class="pin-check">
              <input type="checkbox" v-model="pinMessage" />
              置顶消息
            </label>
            <div class="input-row">
              <input
                v-model="chatInput"
                class="chat-input"
                placeholder="请输入消息..."
                @keyup.enter="sendChat"
              />
              <button class="send-btn" @click="sendChat">发送</button>
            </div>
          </div>
        </aside>

        <!-- 中间：直播画面 + 违规强提示 -->
        <main class="center-panel">
          <div class="monitor-view">
            <!-- 场次信息浮层 -->
            <div class="field-info-float field-info-bar">
              <div class="field-title-row">
                <span class="field-title">{{ fieldInfo?.title || '直播标题' }}</span>
                <span :class="['field-status', store.fieldStatus]">
                  {{ fieldStatusLabel }}
                </span>
              </div>
              <div class="field-meta-row">
                <span>主播：{{ fieldInfo?.anchor || '主播小A' }}</span>
                <span>已播 {{ fieldInfo?.elapsed || '01:23:45' }}</span>
                <span>{{ (fieldInfo?.viewerCount ?? 25600).toLocaleString() }} 人观看</span>
              </div>
            </div>

            <!-- 模拟视频画面 -->
            <div class="video-frame">
              <div class="video-placeholder">
                <span class="video-icon">📹</span>
                <span class="video-label">直播画面 — {{ streamId }}</span>
              </div>
              <!-- 音频波形模拟 -->
              <div class="waveform-bar">
                <span v-for="i in 12" :key="i" class="wave-dot" :style="{ animationDelay: `${i * 0.12}s` }" />
              </div>
            </div>

            <!-- 违规强提示覆盖层 (B-AUDIT-013) -->
            <ViolationAlertOverlay
              :pendingViolations="pendingViolations"
              :maxVisible="3"
              @quick-record="handleQuickAction('record', $event)"
              @quick-sever="handleQuickAction('sever', $event)"
              @quick-ignore="handleQuickAction('ignore', $event)"
            />
          </div>

          <!-- 擦音模式控制条 -->
          <div class="mute-control-bar">
            <span class="label">擦音模式：</span>
            <label
              v-for="opt in muteOptions"
              :key="opt.value"
              :class="['radio-option', { active: muteMode === opt.value }]"
            >
              <input
                type="radio"
                :value="opt.value"
                :checked="muteMode === opt.value"
                @change="muteMode = opt.value"
                :disabled="store.fieldStatus !== 'live'"
              />
              <span>{{ opt.label }}</span>
            </label>
            <HelpIcon @click="openElementHelp('E-AUDIT-002-07')" />
          </div>
        </main>

        <!-- 右侧：工具/审查面板 -->
        <aside class="right-panel">
          <!-- 右侧 Tab -->
          <div class="right-tabs">
            <button
              v-for="tab in rightTabs"
              :key="tab.key"
              :class="['right-tab', { active: activeRight === tab.key }]"
              @click="activeRight = tab.key"
            >
              {{ tab.label }}
            </button>
            <HelpIcon
              v-if="activeRight === 'audit'"
              @click="openElementHelp('E-AUDIT-002-01')"
            />
          </div>

          <!-- 互动工具 -->
          <div v-if="activeRight === 'tools'" class="right-content tools-content">
            <div class="tool-section">
              <h4 class="tool-title">优惠券</h4>
              <div class="coupon-row">
                <button class="tool-card primary">优惠券</button>
                <button class="tool-card">观看奖励</button>
              </div>
              <div class="tool-summary">共 0 条优惠券</div>
            </div>
            <div class="tool-section">
              <h4 class="tool-title">工具栏</h4>
              <div class="toolbar-grid">
                <div class="tool-item">
                  <span class="tool-icon">🎫</span>
                  <span>配置卡券</span>
                </div>
                <div class="tool-item">
                  <span class="tool-icon">🎁</span>
                  <span>创建观看奖励</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 商品卡片 -->
          <div v-else-if="activeRight === 'goods'" class="right-content goods-content">
            <div class="empty-block">暂无商品卡片</div>
          </div>

          <!-- 直播订单 -->
          <div v-else-if="activeRight === 'orders'" class="right-content orders-content">
            <div class="empty-block">暂无直播订单</div>
          </div>

          <!-- 审查面板 -->
          <div v-else-if="activeRight === 'audit'" class="right-content audit-content">
            <!-- 审查已关闭提示（5级联动 L1→L2） -->
            <div v-if="auditDisabled" class="audit-disabled-notice">
              <span class="notice-icon">⛔</span>
              <span>该租户的内容审查已关闭，暂停审查功能</span>
            </div>
            <AlertStatsBar
              :total="violations.length"
              :pending="violations.filter((v: any) => v.disposal_status === 'pending').length"
              :recorded="violations.filter((v: any) => v.disposal_status === 'recorded').length"
              :ignored="violations.filter((v: any) => v.disposal_status === 'ignored').length"
              :severe="violations.filter((v: any) => v.violation_level === 'L1').length"
              :redCount="violations.filter((v: any) => v.violation_level === 'L1' || v.violation_level === 'L2').length"
              :yellowCount="violations.filter((v: any) => v.violation_level === 'L3').length"
              :blueCount="violations.filter((v: any) => v.violation_level === 'L4').length"
              auditStatus="reviewing"
              :onHelpClick="openElementHelp"
            />
            <ViolationTable
              :violations="violations"
              :selectedId="selectedId"
              :disabled="store.fieldStatus !== 'live'"
              :onHelpClick="openElementHelp"
              @select="selectViolation"
            />
            <!-- BR-AUDIT-017: 场次已结束后隐藏处置栏，违规列表切换为只读模式 -->
            <div v-if="store.fieldStatus !== 'live'" class="stream-ended-notice">
              🛑 直播已结束/断流，违规列表仅供查看
            </div>
            <DisposalBar
              v-else
              :canAct="!!selectedViolation && selectedViolation.disposal_status === 'pending'"
              :canSever="!!selectedViolation && selectedViolation.violation_level !== 'L4'"
              :canIgnore="!!selectedViolation && selectedViolation.violation_level !== 'L1'"
              :onHelpClick="openElementHelp"
              @record="openDisposal('record')"
              @sever="openDisposal('sever')"
              @ignore="openDisposal('ignore')"
            />
          </div>
        </aside>
      </div>
    </template>

    <!-- 违规详情侧滑面板 -->
    <ViolationDetailPanel
      :visible="detailVisible"
      :violation="selectedViolation || null"
      :muteMode="muteMode"
      @close="detailVisible = false"
    />

    <!-- 处置确认弹窗（记录/断流/忽略三合一） -->
    <DisposalModal
      :visible="disposalVisible"
      :type="disposalType"
      :violation="selectedViolation || null"
      @confirm="handleDispose"
      @cancel="disposalVisible = false"
    />

  </div>

  <!-- 用例交互卡 -->
  <HelpButton @open="showDrawer = true" />
  <UseCaseDrawer
    :visible="showDrawer"
    title="用例卡 — 直播中控审查"
    :cards="liveControlAuditCards as any"
    :highlight-element-id="highlightElementId"
    @close="showDrawer = false; highlightElementId = ''"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import { useAuditService } from '../../services/audit-service';
import AlertStatsBar from '../../components/audit/tenant/AlertStatsBar.vue';
import ViolationTable from '../../components/audit/tenant/ViolationTable.vue';
import ViolationAlertOverlay from '../../components/audit/tenant/ViolationAlertOverlay.vue';
import DisposalBar from '../../components/audit/tenant/DisposalBar.vue';
import ViolationDetailPanel from '../../components/audit/tenant/ViolationDetailPanel.vue';
import DisposalModal from '../../components/audit/tenant/DisposalModal.vue';
import HelpButton from '../../components/use-case-card/HelpButton.vue';
import HelpIcon from '../../components/use-case-card/HelpIcon.vue';
import UseCaseDrawer from '../../components/use-case-card/UseCaseDrawer.vue';
import { liveControlAuditCards } from './useCaseCardData';
import { mockViolationGenerator } from '../../adapters/sim/data-adapter';
import type { DisposalType, FieldStatus, MuteMode } from '../../contracts';

const route = useRoute();
const store = useAuditStore();
const auditService = useAuditService();

// 路由参数
const streamId = computed(() => (route.query.streamId as string) || (route.params.streamId as string) || 'stream-001');

/** 5级联动：审查开关状态（关闭时禁用审查功能） */
const auditDisabled = ref(false);

// 顶部导航
const activeNav = ref('chat');
const navTabs = [
  { key: 'chat', label: '聊天室', icon: '💬' },
  { key: 'tools', label: '互动工具', icon: '🎁' },
  { key: 'goods', label: '商品卡片', icon: '🛒' },
  { key: 'orders', label: '直播订单', icon: '📋' },
];

// 右侧 Tab
const activeRight = ref('audit');
const rightTabs = [
  { key: 'tools', label: '互动工具' },
  { key: 'goods', label: '商品卡片' },
  { key: 'orders', label: '直播订单' },
  { key: 'audit', label: '内容审查' },
];

// 场次信息（仿真）
const fieldInfo = ref({
  title: `直播-${streamId.value || '001'}`,
  anchor: '主播小A',
  elapsed: '01:23:45',
  viewerCount: 25600,
});

// 审查状态
const auditEnabled = ref(true);

// 场次状态由 store 统一管理（V3.0修复：共享状态支持 BroadcastChannel 跨tab同步）
const fieldStatusLabel = computed(() => {
  const map: Record<string, string> = { live: '直播中', ended: '已结束', replaying: '回放中' };
  return map[store.fieldStatus] || '未知';
});
const muteMode = computed<MuteMode>({
  get: () => store.muteMode,
  set: (val) => store.setMuteMode(val),
});

const muteOptions: { label: string; value: MuteMode }[] = [
  { label: '静音', value: 'silent' },
  { label: '擦音', value: 'beep' },
];

// 违规列表
const violations = computed(() => store.violations);

// 待处理违规（按时间倒序，最新在前 → 覆盖层使用）
const pendingViolations = computed(() =>
  store.pendingViolations.slice().sort(
    (a: any, b: any) => new Date(b.violation_time).getTime() - new Date(a.violation_time).getTime()
  )
);

// 选中/详情
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

// 处置弹窗
const disposalVisible = ref(false);
const showDrawer = ref(false);
const highlightElementId = ref('');

function openElementHelp(elementId: string) {
  highlightElementId.value = elementId;
  showDrawer.value = true;
}
const disposalType = ref<'record' | 'sever' | 'ignore'>('record');

function openDisposal(type: 'record' | 'sever' | 'ignore') {
  if (!selectedViolation.value || selectedViolation.value.disposal_status !== 'pending') return;
  disposalType.value = type;
  disposalVisible.value = true;
}

function handleDispose(note: string) {
  if (!selectedId.value) return;
  const disposeMap: Record<string, DisposalType> = {
    record: 'record', sever: 'cut_off', ignore: 'ignore',
  };
  // V3.0修复：使用 service 层，cut_off 时自动调用 store.setFieldStatus('ended') + broadcastFieldStatus
  auditService.disposeViolation(selectedId.value, disposeMap[disposalType.value], note);
  disposalVisible.value = false;
}

/**
 * B-AUDIT-013 覆盖层快捷操作（无需选中，直接对指定违规执行处置）
 */
function handleQuickAction(action: 'record' | 'sever' | 'ignore', violationId: string) {
  const disposeMap: Record<string, DisposalType> = {
    record: 'record', sever: 'cut_off', ignore: 'ignore',
  };
  // V3.0修复：使用 service 层，cut_off 时自动调用 store.setFieldStatus('ended') + broadcastFieldStatus
  auditService.disposeViolation(violationId, disposeMap[action], `快捷操作-${action}`);
}

// 聊天室模拟
const chatFilter = ref('all');
const chatInput = ref('');
const pinMessage = ref(false);
const chatScroll = ref<HTMLElement>();
const chatMessages = ref([
  { user: '用户A', text: '主播好！', role: 'fan' },
  { user: '用户B', text: '这个福利怎么领？', role: 'fan' },
  { user: '管理员', text: '请大家遵守直播间秩序', role: 'admin' },
  { user: '粉丝C', text: '已下单～', role: 'fan' },
]);

function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatMessages.value.push({
    user: '我',
    text: pinMessage.value ? `【置顶】${text}` : text,
    role: 'admin',
  });
  chatInput.value = '';
  nextTick(() => {
    if (chatScroll.value) chatScroll.value.scrollTop = chatScroll.value.scrollHeight;
  });
}

// 生命周期
onMounted(() => {
  // BR-AUDIT-017: 违规数据不可清空——处理后仅变更状态，须保留在列表中可追溯
  store.setFieldStatus('live');
  store.setTenantConfig({
    tenant_id: 'T-001',
    tenant_name: 'XX科技',
    audit_enabled: true,
  });
  auditDisabled.value = !store.tenantConfig.audit_enabled;
  mockViolationGenerator.start();
});

// 5级联动监听：审查开关→直播中控Tab
watch(() => store.auditSwitchEvent, (event) => {
  if (!event) return;
  auditDisabled.value = !event.enabled;
});

onUnmounted(() => {
  mockViolationGenerator.stop();
  // 不 reset：违规数据保留在 Store 中，供历史违规页查看
});
</script>

<style scoped>
.live-control-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg, #F5F5F5);
  overflow: hidden;
}

/* ── 顶部导航 ── */
.control-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
  flex-shrink: 0;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: var(--radius-md, 4px);
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #8C8C8C);
  font-size: var(--font-body, 14px);
  cursor: pointer;
  transition: all 0.15s;
}

.nav-tab:hover {
  background: var(--color-muted, #F5F5F5);
  color: var(--color-text-primary, #262626);
}

.nav-tab.active {
  background: var(--color-primary-bg, #E6F7FF);
  color: var(--color-primary, #1890FF);
  font-weight: 500;
}

.nav-icon {
  font-size: 14px;
}

/* ── 三栏主体 ── */
.control-body {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 8px;
  padding: 8px;
}

/* 左侧面板 */
.left-panel {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--radius-md, 4px);
  border: 1px solid var(--color-border, #D9D9D9);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}

.panel-title {
  font-weight: 500;
  color: var(--color-text-primary, #262626);
}

.chat-filter {
  padding: 4px 8px;
  font-size: var(--font-small, 12px);
  border: 1px solid var(--color-border, #D9D9D9);
  border-radius: var(--radius-sm, 2px);
  outline: none;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-msg {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--font-small, 12px);
}

.chat-msg .msg-user {
  color: var(--color-text-secondary, #8C8C8C);
}

.chat-msg .msg-text {
  color: var(--color-text-primary, #262626);
  word-break: break-all;
  line-height: 1.5;
}

.chat-msg.admin .msg-user {
  color: var(--color-primary, #1890FF);
  font-weight: 500;
}

.chat-input-bar {
  padding: 12px;
  border-top: 1px solid var(--color-border, #D9D9D9);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pin-check {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
  cursor: pointer;
}

.input-row {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--color-border, #D9D9D9);
  border-radius: var(--radius-sm, 2px);
  font-size: var(--font-small, 12px);
  outline: none;
}

.send-btn {
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius-sm, 2px);
  background: var(--color-primary, #1890FF);
  color: #fff;
  font-size: var(--font-small, 12px);
  cursor: pointer;
}

.send-btn:hover {
  background: #40a9ff;
}

/* 中间面板 */
.center-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.monitor-view {
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: var(--radius-md, 4px);
  overflow: hidden;
  background: linear-gradient(135deg, #16213e 0%, #0f3460 50%, #1a1a2e 100%);
}

.field-info-float {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 10px 14px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0));
  color: #fff;
  pointer-events: none;
}

.field-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.field-title {
  font-size: var(--font-h3, 16px);
  font-weight: 500;
}

.field-status {
  font-size: var(--font-small, 12px);
  padding: 2px 8px;
  border-radius: var(--radius-sm, 2px);
  background: rgba(255, 255, 255, 0.15);
}

.field-status.live {
  color: #95f675;
  background: rgba(82, 196, 26, 0.2);
}

.field-status.ended {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
}

.field-meta-row {
  display: flex;
  gap: 12px;
  font-size: var(--font-small, 12px);
  opacity: 0.85;
}

.video-frame {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.3);
}

.video-icon {
  font-size: 48px;
  filter: grayscale(0.5);
}

.video-label {
  font-size: 14px;
}

.waveform-bar {
  position: absolute;
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 3px;
  height: 20px;
}

.wave-dot {
  width: 3px;
  background: rgba(24, 144, 255, 0.5);
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite alternate;
}

@keyframes wave {
  0%   { height: 4px;  opacity: 0.4; }
  100% { height: 20px; opacity: 1; }
}

.mute-control-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #fff;
  border-radius: var(--radius-md, 4px);
  border: 1px solid var(--color-border, #D9D9D9);
  font-size: var(--font-small, 12px);
  flex-shrink: 0;
}

.mute-control-bar .label {
  color: var(--color-text-secondary, #8C8C8C);
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  color: var(--color-text-primary, #262626);
}

.radio-option.active {
  color: var(--color-primary, #1890FF);
  font-weight: 500;
}

.radio-option input[type="radio"]:disabled + span {
  color: var(--color-text-secondary, #8C8C8C);
  cursor: not-allowed;
}

/* 右侧面板 */
.right-panel {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--radius-md, 4px);
  border: 1px solid var(--color-border, #D9D9D9);
  overflow: hidden;
}

.right-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
  flex-shrink: 0;
}

.right-tab {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #8C8C8C);
  font-size: var(--font-small, 12px);
  cursor: pointer;
  transition: all 0.15s;
}

.right-tab:hover {
  color: var(--color-text-primary, #262626);
  background: var(--color-muted, #F5F5F5);
}

.right-tab.active {
  color: var(--color-primary, #1890FF);
  font-weight: 500;
  border-bottom: 2px solid var(--color-primary, #1890FF);
}

.right-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.tools-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-title {
  margin: 0;
  font-size: var(--font-body, 14px);
  font-weight: 500;
  color: var(--color-text-primary, #262626);
}

.coupon-row {
  display: flex;
  gap: 8px;
}

.tool-card {
  flex: 1;
  padding: 10px 0;
  border: 1px solid var(--color-border, #D9D9D9);
  border-radius: var(--radius-md, 4px);
  background: #fff;
  color: var(--color-text-primary, #262626);
  font-size: var(--font-small, 12px);
  cursor: pointer;
  transition: all 0.15s;
}

.tool-card.primary {
  background: var(--color-primary, #1890FF);
  color: #fff;
  border-color: var(--color-primary, #1890FF);
}

.tool-summary {
  font-size: var(--font-small, 12px);
  color: var(--color-text-secondary, #8C8C8C);
}

.toolbar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border: 1px solid var(--color-border, #D9D9D9);
  border-radius: var(--radius-md, 4px);
  font-size: var(--font-small, 12px);
  color: var(--color-text-primary, #262626);
  cursor: pointer;
  transition: all 0.15s;
}

.tool-item:hover {
  background: var(--color-muted, #F5F5F5);
}

.tool-icon {
  font-size: 24px;
}

.goods-content,
.orders-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-block {
  color: var(--color-text-secondary, #8C8C8C);
  font-size: var(--font-body, 14px);
}

.audit-content {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 审查关闭提示（5级联动） */
.audit-disabled-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #FFF7E6;
  border: 1px solid #FFD591;
  border-radius: 4px;
  font-size: 13px;
  color: #D46B08;
  margin-bottom: 8px;
}
.notice-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.no-stream {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: var(--font-body, 14px);
  color: var(--color-text-secondary, #8C8C8C);
}

.stream-ended-notice {
  padding: 12px 16px;
  background: var(--color-error-bg, #FFF1F0);
  border: 1px solid var(--color-error-border, #FFCCC7);
  border-radius: var(--radius-md, 4px);
  color: var(--color-text-secondary, #8C8C8C);
  font-size: var(--font-small, 12px);
  text-align: center;
}
</style>
