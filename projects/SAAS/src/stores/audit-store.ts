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
    industry: '',
    stream_domain: '',
    audit_enabled: false,
    today_violation_count: 0,
    mute_mode: 'silent',
  });

  /** 擦音模式 */
  const muteMode = ref<MuteMode>('silent');

  /** 场次状态 */
  const fieldStatus = ref<FieldStatus>('live');

  /** 当前是否有回调丢失事件 */
  const callbackLost = ref(false);

  /** 模拟数据生成器是否正在运行 */
  const mockRunning = ref(false);

  /** 回放擦音任务 */
  const replayTask = ref<ReplayMuteTask | null>(null);

  // ============================================
  // 计算属性
  // ============================================

  /** 告警统计（红黄蓝三级） */
  const alertStats = computed<AlertStats>(() => {
    const stats = { l1: 0, l2: 0, l3: 0, l4: 0, total: violations.value.length };
    for (const v of violations.value) {
      if (v.violation_level in stats) {
        stats[v.violation_level as keyof Pick<AlertStats, 'l1' | 'l2' | 'l3' | 'l4'>]++;
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

  /** 设置擦音模式 */
  function setMuteMode(mode: MuteMode) {
    muteMode.value = mode;
    tenantConfig.value.mute_mode = mode;
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

  /** 设置审查开关 */
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
  }

  /** 更新场次状态 */
  function setFieldStatus(status: FieldStatus) {
    fieldStatus.value = status;
  }

  /** 设置回调丢失状态 */
  function setCallbackLost(lost: boolean) {
    callbackLost.value = lost;
  }

  /** 设置回放擦音任务 */
  function setReplayTask(task: ReplayMuteTask | null) {
    replayTask.value = task;
  }

  /** 更新租户配置 */
  function setTenantConfig(config: Partial<TenantAuditConfig>) {
    Object.assign(tenantConfig.value, config);
  }

  /** 今日违规数+1 */
  function incrementTodayViolation() {
    tenantConfig.value.today_violation_count++;
  }

  /** 重置Store（页面卸载时调用） */
  function reset() {
    violations.value = [];
    disposals.value = [];
    callbackLost.value = false;
    replayTask.value = null;
  }

  return {
    // 状态
    violations,
    disposals,
    tenantConfig,
    muteMode,
    fieldStatus,
    callbackLost,
    mockRunning,
    replayTask,

    // 计算属性
    alertStats,
    pendingViolations,
    filteredViolations,

    // 操作
    appendViolation,
    appendDisposal,
    setMuteMode,
    disposeViolation,
    setAuditEnabled,
    setFieldStatus,
    setCallbackLost,
    setReplayTask,
    setTenantConfig,
    incrementTodayViolation,
    reset,
  };
});
