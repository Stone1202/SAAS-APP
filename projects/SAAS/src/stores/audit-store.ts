/**
 * 内容审查域 — Pinia共享Store（核心状态中心）
 *
 * 职责：
 * 1. 违规数据共享——PC直播中控 + H5观众端通过此Store实时同步
 * 2. 擦音模式管理——静音/擦音模式切换
 * 3. 处置操作——记录/断流/忽略
 * 4. 场次状态追踪
 *
 * 数据流：
 *   MockGenerator → auditStore.violations[] → PC中控列表 + H5观众端效果
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  ReviewViolation,
  ReviewDisposal,
  TenantAuditConfig,
  ReplayMuteTask,
  AlertStats,
  ViolationFilter,
  MuteMode,
  FieldStatus,
  PublishStatus,
} from '../contracts';

export const useAuditStore = defineStore('audit', () => {
  // ============================================
  // 状态
  // ============================================

  /** 违规列表 */
  const violations = ref<ReviewViolation[]>([]);

  /** 处置记录列表 */
  const disposals = ref<ReviewDisposal[]>([]);

  /** 租户审查配置 */
  const tenantConfig = ref<TenantAuditConfig>({
    tenant_id: '',
    tenant_name: '',
    contact_phone: '',
    registered_at: '',
    is_enabled: true,
    industry: '',
    stream_domain: '',
    audit_enabled: false,
    today_violation_count: 0,
    mute_mode: 'silent',
  });

  /** 擦音模式 */
  const muteMode = ref<MuteMode>('silent');

  /** 当前生效的直播效果（中控 → H5 联动） */
  const liveEffect = ref<MuteMode | null>(null);

  /** 当前管理的直播流ID（用于跨页签状态同步） */
  const currentStreamId = ref<string>('');

  /** 场次状态 */
  const fieldStatus = ref<FieldStatus>('live');

  /** 当前是否有回调丢失事件 */
  const callbackLost = ref(false);

  /** 模拟数据生成器是否正在运行 */
  const mockRunning = ref(false);

  /** 回放擦音任务 */
  const replayTask = ref<ReplayMuteTask | null>(null);

  /** BR-AUDIT-004/015: 回放发布状态（擦音完成后须人工核对→发布） */
  const replayPublishStatus = ref<PublishStatus>('pending_review');

  // BroadcastChannel：跨页签同步 liveEffect + callbackLost（中控 ↔ H5）
  const bc = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('saas-audit-effect')
    : null;
  if (bc) {
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'live-effect') {
        liveEffect.value = ev.data.payload as MuteMode | null;
      }
      if (ev.data?.type === 'callback-lost') {
        callbackLost.value = ev.data.payload as boolean;
      }
      if (ev.data?.type === 'field-status-change') {
        const payload = ev.data.payload;
        if (typeof payload === 'object' && payload !== null) {
          currentStreamId.value = payload.streamId || '';
          fieldStatus.value = payload.status as FieldStatus;
        } else {
          fieldStatus.value = payload as FieldStatus;
        }
      }
    };
  }

  function broadcastLiveEffect(effect: MuteMode | null) {
    bc?.postMessage({ type: 'live-effect', payload: effect });
  }

  function broadcastCallbackLost(lost: boolean) {
    bc?.postMessage({ type: 'callback-lost', payload: lost });
  }

  function broadcastFieldStatus(status: FieldStatus, streamId?: string) {
    bc?.postMessage({
      type: 'field-status-change',
      payload: { status, streamId: streamId || currentStreamId.value },
    });
  }

  // ═══ 审查开关广播（5级联动：开关→Tab→列表→任务→效果） ═══
  /** 最近一次审查开关变更事件 */
  const auditSwitchEvent = ref<{ tenant_id: string; enabled: boolean; timestamp: number } | null>(null);

  const bcSwitch = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('saas-audit-switch')
    : null;
  if (bcSwitch) {
    bcSwitch.onmessage = (ev) => {
      if (ev.data?.type === 'audit-switch') {
        auditSwitchEvent.value = ev.data.payload;
        tenantConfig.value.audit_enabled = ev.data.payload.enabled;
      }
    };
  }

  function broadcastAuditSwitch(tenantId: string, enabled: boolean) {
    const event = { tenant_id: tenantId, enabled, timestamp: Date.now() };
    auditSwitchEvent.value = event;
    bcSwitch?.postMessage({ type: 'audit-switch', payload: event });
  }

  // ============================================
  // 计算属性
  // ============================================

  /** 告警统计（红黄蓝三级） */
  const alertStats = computed<AlertStats>(() => {
    const stats: AlertStats = { l1: 0, l2: 0, l3: 0, l4: 0, total: violations.value.length };
    for (const v of violations.value) {
      // violation_level 是大写（L1/L2/L3/L4），映射到 stat 小写键
      const key = v.violation_level.toLowerCase() as keyof Omit<AlertStats, 'total'>;
      if (key in stats) {
        stats[key]++;
      }
    }
    return stats;
  });

  /** 待处理违规 */
  const pendingViolations = computed(() =>
    violations.value.filter(v => v.disposal_status === 'pending')
  );

  /** 按筛选条件过滤 */
  const filteredViolations = computed(() => {
    let result = [...violations.value];

    // 按时间倒序（最新在上）
    result.sort((a, b) => new Date(b.violation_time).getTime() - new Date(a.violation_time).getTime());

    return result;
  });

  // ============================================
  // 操作
  // ============================================

  /** 追加违规记录（由MockGenerator或RealAdapter调用） */
  function appendViolation(violation: ReviewViolation) {
    violations.value.unshift(violation); // 新记录置顶
  }

  /** 追加处置记录 */
  function appendDisposal(disposal: ReviewDisposal) {
    disposals.value.unshift(disposal);
  }

  /** 设置擦音模式（中控切换时同步驱动 H5 效果） */
  function setMuteMode(mode: MuteMode) {
    muteMode.value = mode;
    tenantConfig.value.mute_mode = mode;
    setLiveEffect(mode);
  }

  /** 设置当前生效的直播效果 */
  function setLiveEffect(effect: MuteMode | null) {
    liveEffect.value = effect;
    broadcastLiveEffect(effect);
  }

  /** 清除当前直播效果 */
  function clearLiveEffect() {
    liveEffect.value = null;
    broadcastLiveEffect(null);
  }

  /** 处置违规 */
  function disposeViolation(violationId: string, disposal: ReviewDisposal) {
    const violation = violations.value.find(v => v.violation_id === violationId);
    if (violation) {
      violation.disposal_status =
        disposal.disposal_type === 'cut_off' ? 'cut_off' :
        disposal.disposal_type === 'ignore' ? 'ignored' : 'recorded';
    }
    appendDisposal(disposal);
  }

  /** 设置审查开关（触发5级联动广播） */
  function setAuditEnabled(enabled: boolean) {
    tenantConfig.value.audit_enabled = enabled;
    if (!enabled) {
      // 审查关闭 → 所有待处理归档
      violations.value.forEach(v => {
        if (v.disposal_status === 'pending') {
          v.disposal_status = 'archived';
        }
      });
    }
    // 广播5级联动事件
    broadcastAuditSwitch(tenantConfig.value.tenant_id, enabled);
  }

  /** 更新场次状态 */
  function setFieldStatus(status: FieldStatus, streamId?: string) {
    if (streamId) currentStreamId.value = streamId;
    if (fieldStatus.value === status) return;
    fieldStatus.value = status;
    broadcastFieldStatus(status, streamId);
  }

  /** 设置回调丢失状态（同步广播到 H5 观众端） */
  function setCallbackLost(lost: boolean) {
    callbackLost.value = lost;
    broadcastCallbackLost(lost);
  }

  /** 设置回放擦音任务 */
  function setReplayTask(task: ReplayMuteTask | null) {
    replayTask.value = task;
    // 同步publish_status
    if (task?.publish_status !== undefined) {
      replayPublishStatus.value = task.publish_status;
    }
  }

  /** BR-AUDIT-004/015: 人工核对通过后发布回放（观众可观看） */
  function publishReplay() {
    if (!replayTask.value) return;
    replayTask.value.publish_status = 'published';
    replayPublishStatus.value = 'published';
  }

  /** BR-AUDIT-004/015: 核对驳回，需重新擦音 */
  function rejectReplay() {
    if (!replayTask.value) return;
    replayTask.value.publish_status = 'rejected';
    replayPublishStatus.value = 'rejected';
  }

  /** 更新租户配置 */
  function setTenantConfig(config: Partial<TenantAuditConfig>) {
    Object.assign(tenantConfig.value, config);
  }

  /** 今日违规数+1 */
  function incrementTodayViolation() {
    tenantConfig.value.today_violation_count++;
  }

  /** 清空违规与处置记录（进入新场次时调用） */
  function clearViolations() {
    violations.value = [];
    disposals.value = [];
  }

  /** 重置Store暂态（页面卸载时调用，保留违规历史数据） */
  function reset() {
    callbackLost.value = false;
    replayTask.value = null;
    replayPublishStatus.value = 'pending_review';
    liveEffect.value = null;
    broadcastLiveEffect(null);
  }

  return {
    // 状态
    violations,
    disposals,
    tenantConfig,
    muteMode,
    liveEffect,
    fieldStatus,
    currentStreamId,
    callbackLost,
    mockRunning,
    replayTask,
    replayPublishStatus,
    auditSwitchEvent,

    // 计算属性
    alertStats,
    pendingViolations,
    filteredViolations,

    // 操作
    appendViolation,
    appendDisposal,
    setMuteMode,
    setLiveEffect,
    clearLiveEffect,
    disposeViolation,
    setAuditEnabled,
    setFieldStatus,
    setCallbackLost,
    setReplayTask,
    setTenantConfig,
    incrementTodayViolation,
    clearViolations,
    publishReplay,
    rejectReplay,
    reset,
  };
});
