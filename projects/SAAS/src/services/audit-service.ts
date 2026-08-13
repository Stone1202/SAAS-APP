/**
 * 审计服务层（业务逻辑编排）
 *
 * 职责：
 * 1. 违规事件处理——接收Mock数据，完成业务校验和状态更新
 * 2. 处置操作——记录/断流/忽略的业务逻辑
 * 3. 回放擦音——异步模拟擦音任务
 * 4. BR规则执行——处置渐进式规则、超时规则、归档规则
 */

import { useAuditStore } from '../stores/audit-store';
import {
  violationStateMachine,
  fieldStateMachine,
  replayTaskStateMachine,
} from '../contracts/state-machine/audit-state-machine';
import type {
  ReviewViolation,
  ReviewDisposal,
  DisposalType,
  ReplayMuteTask,
} from '../contracts';

// ============================================
// 违规处置服务
// ============================================

export function useAuditService() {
  const store = useAuditStore();

  /** 处置违规 */
  function disposeViolation(
    violationId: string,
    disposalType: DisposalType,
    reason: string,
    operator: string = '运营人员'
  ): ReviewDisposal {
    const violation = store.violations.find(v => v.violation_id === violationId);
    if (!violation) {
      throw new Error(`违规记录不存在: ${violationId}`);
    }

    // BR-AUDIT-003: 处置渐进式规则校验
    validateDisposalLevel(violation, disposalType);

    // 状态机校验
    if (!violationStateMachine.canTransition(violation.disposal_status as any, mapDisposalType(disposalType))) {
      throw new Error(`违规 ${violationId} 当前状态 ${violation.disposal_status} 不允许 ${disposalType} 操作`);
    }

    // 执行状态过渡
    const newState = violationStateMachine.transition(
      violation.disposal_status as any,
      { type: mapDisposalType(disposalType), reason, operator } as any
    );

    const disposal: ReviewDisposal = {
      disposal_id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      violation_id: violationId,
      disposal_type: disposalType,
      disposal_reason: reason,
      operator,
      operated_at: new Date().toISOString(),
    };

    // 更新Store（状态过渡 + 处置记录）
    store.disposeViolation(violationId, disposal);

    // 断流 → 场次状态变为已结束，停止接受新违规通知
    if (disposalType === 'cut_off') {
      store.setFieldStatus('ended', violation.stream_id);
      store.mockRunning = false;
    }

    return disposal;
  }

  /** 处置超时自动记录 */
  function autoRecordOnTimeout(violationId: string): ReviewDisposal {
    const violation = store.violations.find(v => v.violation_id === violationId);
    if (!violation || violation.disposal_status !== 'pending') {
      throw new Error(`违规 ${violationId} 不满足自动记录条件`);
    }

    return disposeViolation(violationId, 'auto_record', '系统自动记录：处置超时（30秒）', '系统');
  }

  /** 审查关闭时归档所有待处理违规 */
  function archiveAllPending() {
    store.violations.forEach(v => {
      if (v.disposal_status === 'pending') {
        v.disposal_status = 'archived';
      }
    });
  }

  return {
    disposeViolation,
    autoRecordOnTimeout,
    archiveAllPending,
  };
}

// ============================================
// 回放擦音服务
// ============================================

export function useReplayService() {
  const store = useAuditStore();

  /** 启动回放擦音任务（模拟） */
  async function startReplayMute(streamId: string): Promise<ReplayMuteTask> {
    const task: ReplayMuteTask = {
      task_id: `rmt-${Date.now()}`,
      stream_id: streamId,
      replay_file_url: `https://mock-cos.example.com/replay/${streamId}/original.mp4`,
      task_status: 'processing',
      /** BR-AUDIT-004/015: 擦音完成后默认待核对 */
      publish_status: 'pending_review',
      progress: 0,
      started_at: new Date().toISOString(),
    };

    store.setReplayTask(task);

    // 模拟异步擦音处理
    return simulateMuteProgress(task);
  }

  /** 模拟擦音进度 */
  async function simulateMuteProgress(task: ReplayMuteTask): Promise<ReplayMuteTask> {
    const TIMEOUT_MS = 30000; // CONFIG-AUDIT-008: 30秒超时
    const FAILURE_RATE = 0.10; // 10%失败概率

    return new Promise((resolve) => {
      const startTime = Date.now();
      let currentProgress = 0;

      const updateInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // 超时检测
        if (elapsed >= TIMEOUT_MS) {
          clearInterval(updateInterval);
          const timeoutTask: ReplayMuteTask = {
            ...task,
            task_status: 'timeout',
            publish_status: 'pending_review',
            progress: currentProgress,
            completed_at: new Date().toISOString(),
            error_msg: '擦音处理超时（30秒），请手动重试',
          };
          store.setReplayTask(timeoutTask);
          resolve(timeoutTask);
          return;
        }

        // 失败检测（10%概率，在进度到达80%后判断）
        if (currentProgress >= 80 && Math.random() < FAILURE_RATE) {
          clearInterval(updateInterval);
          const failTask: ReplayMuteTask = {
            ...task,
            task_status: 'failed',
            publish_status: 'pending_review',
            progress: currentProgress,
            completed_at: new Date().toISOString(),
            error_msg: '擦音处理失败：模拟音频解码错误',
          };
          store.setReplayTask(failTask);
          resolve(failTask);
          return;
        }

        // 进度更新（5-10s快速模拟完成）
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress >= 100) {
          clearInterval(updateInterval);
          const completeTask: ReplayMuteTask = {
            ...task,
            task_status: 'completed',
            publish_status: 'pending_review',
            progress: 100,
            muted_file_url: `https://mock-cos.example.com/replay/${task.stream_id}/muted.mp4`,
            completed_at: new Date().toISOString(),
          };
          store.setReplayTask(completeTask);
          resolve(completeTask);
          return;
        }

        // 更新Store中的进度
        store.setReplayTask({ ...task, progress: Math.min(currentProgress, 100) });
      }, 800); // 每800ms更新一次进度
    });
  }

  /** 重新擦音（BR-AUDIT-015: 驳回后重试，重置发布状态） */
  async function retryMute(streamId: string): Promise<ReplayMuteTask> {
    store.setReplayTask(null);
    // 重置回放发布状态为待核对
    store.replayPublishStatus = 'pending_review';
    return startReplayMute(streamId);
  }

  return {
    startReplayMute,
    retryMute,
  };
}

// ============================================
// 辅助函数
// ============================================

/** BR-AUDIT-003: 处置渐进式规则校验 */
function validateDisposalLevel(violation: ReviewViolation, disposalType: DisposalType) {
  const level = violation.violation_level;

  if (level === 'L1') {
    // L1核心：仅可断流
    if (disposalType !== 'cut_off' && disposalType !== 'auto_record') {
      throw new Error('L1严重违规仅可断流处置，不可记录或忽略');
    }
  } else if (level === 'L4') {
    // L4低危：仅可记录
    if (disposalType !== 'record' && disposalType !== 'auto_record') {
      throw new Error('L4一般违规仅可记录，不可断流或忽略');
    }
  }
  // L2高危/L3中危：全可用（无额外限制）
}

/** 处置类型映射到状态机事件类型 */
function mapDisposalType(type: DisposalType): 'RECORD' | 'CUT_OFF' | 'IGNORE' | 'TIMEOUT' | 'AUTO_ARCHIVE' {
  switch (type) {
    case 'record': return 'RECORD';
    case 'cut_off': return 'CUT_OFF';
    case 'ignore': return 'IGNORE';
    case 'auto_record': return 'TIMEOUT';
    case 'auto_archive': return 'AUTO_ARCHIVE';
  }
}
