/**
 * 内容审查域 — 状态机定义（三层契约 Layer 3）
 * 来源：PRD §12 BR-AUDIT-008/017 场次状态机 + 违规状态机
 */

// ============================================
// 场次状态机
// ============================================

export type FieldState = 'live' | 'ended' | 'replaying';

export type FieldEvent =
  | { type: 'START_LIVE' }
  | { type: 'END_LIVE' }
  | { type: 'CUT_OFF'; reason: string }
  | { type: 'GENERATE_REPLAY' };

/**
 * 场次状态过渡表
 * ┌──────────┬────────────────┬──────────┬──────────────────────────────┐
 * │ 当前状态  │ 触发事件        │ 目标状态  │ 前置条件/后置动作              │
 * ├──────────┼────────────────┼──────────┼──────────────────────────────┤
 * │ live     │ END_LIVE       │ ended    │ 正常直播结束                 │
 * │ live     │ CUT_OFF        │ ended    │ 违规断流→观众端显示结束提示    │
 * │ ended    │ GENERATE_REPLAY│ replaying│ 回放文件生成→触发擦音任务     │
 * └──────────┴────────────────┴──────────┴──────────────────────────────┘
 */
export const fieldStateMachine = {
  initialState: 'live' as FieldState,

  transitions: {
    live: {
      END_LIVE: 'ended' as FieldState,
      CUT_OFF: 'ended' as FieldState,
    },
    ended: {
      GENERATE_REPLAY: 'replaying' as FieldState,
    },
    replaying: {},
  },

  /** 判断事件是否在当前状态下有效 */
  canTransition(state: FieldState, eventType: FieldEvent['type']): boolean {
    return eventType in this.transitions[state];
  },

  /** 执行状态过渡，返回新状态 */
  transition(state: FieldState, event: FieldEvent): FieldState {
    const target = this.transitions[state]?.[event.type as keyof typeof this.transitions[typeof state]];
    if (!target) {
      throw new Error(`无效的状态过渡: ${state} → ${event.type}`);
    }
    return target;
  },
} as const;

// ============================================
// 违规状态机
// ============================================

export type ViolationState = 'pending' | 'recorded' | 'cut_off' | 'ignored' | 'timeout' | 'archived';

export type ViolationEvent =
  | { type: 'RECORD'; reason: string; operator: string }
  | { type: 'CUT_OFF'; reason: string; operator: string }
  | { type: 'IGNORE'; reason: string; operator: string }
  | { type: 'TIMEOUT' }
  | { type: 'AUTO_ARCHIVE' };

/**
 * 违规状态过渡表
 * ┌──────────┬──────────────┬───────────┬──────────────────────────────┐
 * │ 当前状态  │ 触发事件      │ 目标状态   │ 前置条件/后置动作             │
 * ├──────────┼──────────────┼───────────┼──────────────────────────────┤
 * │ pending  │ RECORD       │ recorded  │ 记录违规不打断直播           │
 * │ pending  │ CUT_OFF      │ cut_off   │ 断流→场次变为已结束          │
 * │ pending  │ IGNORE       │ ignored   │ 标记为非违规                 │
 * │ pending  │ TIMEOUT      │ timeout   │ 30s未处置→自动记录           │
 * │ pending  │ AUTO_ARCHIVE │ archived  │ 审查关闭→待处理归档          │
 * └──────────┴──────────────┴───────────┴──────────────────────────────┘
 */
export const violationStateMachine = {
  initialState: 'pending' as ViolationState,

  transitions: {
    pending: {
      RECORD: 'recorded' as ViolationState,
      CUT_OFF: 'cut_off' as ViolationState,
      IGNORE: 'ignored' as ViolationState,
      TIMEOUT: 'timeout' as ViolationState,
      AUTO_ARCHIVE: 'archived' as ViolationState,
    },
    recorded: {},
    cut_off: {},
    ignored: {},
    timeout: {},
    archived: {},
  },

  canTransition(state: ViolationState, eventType: ViolationEvent['type']): boolean {
    return eventType in this.transitions[state];
  },

  transition(state: ViolationState, event: ViolationEvent): ViolationState {
    const target = this.transitions[state]?.[event.type as keyof typeof this.transitions[typeof state]];
    if (!target) {
      throw new Error(`无效的状态过渡: ${state} → ${event.type}`);
    }
    return target;
  },
} as const;

// ============================================
// 回放擦音任务状态机
// ============================================

export type ReplayTaskState = 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';

export type ReplayTaskEvent =
  | { type: 'START_PROCESSING' }
  | { type: 'COMPLETE'; muted_file_url: string }
  | { type: 'FAIL'; error_msg: string }
  | { type: 'TIMEOUT' }
  | { type: 'RETRY' };

/**
 * 回放擦音任务状态过渡表
 * ┌────────────┬─────────────────┬────────────┬───────────────────────────┐
 * │ 当前状态    │ 触发事件         │ 目标状态    │ 前置条件/后置动作          │
 * ├────────────┼─────────────────┼────────────┼───────────────────────────┤
 * │ pending    │ START_PROCESSING│ processing │ 回放文件生成→触发擦音     │
 * │ processing │ COMPLETE        │ completed  │ 擦音完成→播放器可交互     │
 * │ processing │ FAIL            │ failed     │ 10%概率→展示原片+警告     │
 * │ processing │ TIMEOUT         │ timeout    │ 30s超时→播放器锁定        │
 * │ failed     │ RETRY           │ pending    │ 手动重试                   │
 * │ timeout    │ RETRY           │ pending    │ 手动重试                   │
 * └────────────┴─────────────────┴────────────┴───────────────────────────┘
 */
export const replayTaskStateMachine = {
  initialState: 'pending' as ReplayTaskState,

  transitions: {
    pending: {
      START_PROCESSING: 'processing' as ReplayTaskState,
    },
    processing: {
      COMPLETE: 'completed' as ReplayTaskState,
      FAIL: 'failed' as ReplayTaskState,
      TIMEOUT: 'timeout' as ReplayTaskState,
    },
    completed: {},
    failed: {
      RETRY: 'pending' as ReplayTaskState,
    },
    timeout: {
      RETRY: 'pending' as ReplayTaskState,
    },
  },

  canTransition(state: ReplayTaskState, eventType: ReplayTaskEvent['type']): boolean {
    return eventType in this.transitions[state];
  },

  transition(state: ReplayTaskState, event: ReplayTaskEvent): ReplayTaskState {
    const target = this.transitions[state]?.[event.type as keyof typeof this.transitions[typeof state]];
    if (!target) {
      throw new Error(`无效的状态过渡: ${state} → ${event.type}`);
    }
    return target;
  },
} as const;
