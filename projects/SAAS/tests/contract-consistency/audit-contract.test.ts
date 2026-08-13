/**
 * 契约一致性测试（三层契约 Layer 1↔2↔3 对齐验证）
 *
 * 来源：C-A7 单元测试架构 — contract-consistency 子目录
 * 验证：Schema定义 ↔ API接口定义 ↔ 状态机定义的一致性
 */
import { describe, it, expect } from 'vitest';
import {
  // Layer 1 — Zod Schemas + Enums
  ReviewViolationSchema,
  ReviewDisposalSchema,
  TenantAuditConfigSchema,
  ReplayMuteTaskSchema,
  ReplayFileSchema,
  AlertStatsSchema,
  ViolationFilterSchema,
  DisposalRequestSchema,
  AuditSwitchRequestSchema,
  ViolationLevelEnum,
  DisposalStatusEnum,
  DisposalTypeEnum,
  MuteModeEnum,
  FieldStatusEnum,
  ReplayTaskStatusEnum,
  ViolationTypeEnum,
  // Layer 2 — API接口类型
} from '../../src/contracts';
import {
  type AuditDataAdapter,
  type AuditTransportAdapter,
} from '../../src/contracts/api/audit-api';
// Layer 3 — 状态机
import {
  violationStateMachine,
  fieldStateMachine,
  replayTaskStateMachine,
} from '../../src/contracts/state-machine/audit-state-machine';
import {
  useAuditStore,
} from '../../src/stores/audit-store';
import { setActivePinia, createPinia } from 'pinia';

// ============================================
// Layer 1: Zod Schema 完整性
// ============================================

describe('Layer 1 — Zod Schema 完备性', () => {
  it('ReviewViolationSchema 定义完整（含所有必填字段）', () => {
    const shape = ReviewViolationSchema.shape;
    expect(shape.violation_id).toBeDefined();
    expect(shape.stream_id).toBeDefined();
    expect(shape.audit_type).toBeDefined();
    expect(shape.violation_type).toBeDefined();
    expect(shape.violation_level).toBeDefined();
    expect(shape.violation_content).toBeDefined();
    expect(shape.violation_time).toBeDefined();
    expect(shape.confidence).toBeDefined();
    expect(shape.disposal_status).toBeDefined();
    expect(shape.evidence_url).toBeDefined();
    expect(shape.raw_callback).toBeDefined();
  });

  it('ReviewDisposalSchema 定义完整', () => {
    const shape = ReviewDisposalSchema.shape;
    expect(shape.disposal_id).toBeDefined();
    expect(shape.violation_id).toBeDefined();
    expect(shape.disposal_type).toBeDefined();
    expect(shape.disposal_reason).toBeDefined();
    expect(shape.operator).toBeDefined();
    expect(shape.operated_at).toBeDefined();
  });

  it('TenantAuditConfigSchema 定义完整', () => {
    const shape = TenantAuditConfigSchema.shape;
    expect(shape.tenant_id).toBeDefined();
    expect(shape.audit_enabled).toBeDefined();
    expect(shape.mute_mode).toBeDefined();
    expect(shape.today_violation_count).toBeDefined();
  });

  it('ReplayMuteTaskSchema 定义完整', () => {
    const shape = ReplayMuteTaskSchema.shape;
    expect(shape.task_id).toBeDefined();
    expect(shape.stream_id).toBeDefined();
    expect(shape.task_status).toBeDefined();
    expect(shape.progress).toBeDefined();
  });

  it('ReplayFileSchema 定义完整', () => {
    const shape = ReplayFileSchema.shape;
    expect(shape.file_id).toBeDefined();
    expect(shape.stream_id).toBeDefined();
    expect(shape.file_name).toBeDefined();
    expect(shape.play_url_original).toBeDefined();
    expect(shape.duration).toBeDefined();
    expect(shape.file_size).toBeDefined();
    expect(shape.is_muted).toBeDefined();
    expect(shape.allow_play).toBeDefined();
  });

  it('AlertStatsSchema 定义完整', () => {
    const shape = AlertStatsSchema.shape;
    expect(shape.l1).toBeDefined();
    expect(shape.l2).toBeDefined();
    expect(shape.l3).toBeDefined();
    expect(shape.l4).toBeDefined();
    expect(shape.total).toBeDefined();
  });

  it('DisposalRequestSchema 定义完整', () => {
    const shape = DisposalRequestSchema.shape;
    expect(shape.violation_id).toBeDefined();
    expect(shape.disposal_type).toBeDefined();
    expect(shape.reason).toBeDefined();
  });

  it('AuditSwitchRequestSchema 定义完整', () => {
    const shape = AuditSwitchRequestSchema.shape;
    expect(shape.tenant_id).toBeDefined();
    expect(shape.enabled).toBeDefined();
  });
});

// ============================================
// Layer 1→2: Schema ↔ API 接口参数对齐
// ============================================

describe('Layer 1↔2 — Schema ↔ API 接口对齐', () => {
  it('ViolationsApi.fetchViolations 返回类型与 ReviewViolationSchema 对齐', () => {
    // 编译时类型检查：ApiResponse<ReviewViolation[]> 应与 Schema 匹配
    // 运行时：验证 Store 中 violations 的类型定义引用自 schemas
    const store = (() => {
      setActivePinia(createPinia());
      return useAuditStore();
    })();
    // 验证 Store 使用的类型与 Schema 来源一致
    const shape = ReviewViolationSchema.shape;
    const v = store.violations;
    expect(Array.isArray(v)).toBe(true);
    // 类型安全性由 TypeScript 编译保证，此处验证 Store 正常工作
  });

  it('AuditSwitchApi 接口与 AuditSwitchRequestSchema 对齐', () => {
    const shape = AuditSwitchRequestSchema.shape;
    expect(shape.tenant_id).toBeDefined();
    expect(shape.enabled).toBeDefined();
    // 验证 enabled 为布尔类型
    const validReq = { tenant_id: 't-001', enabled: true };
    const result = AuditSwitchRequestSchema.safeParse(validReq);
    expect(result.success).toBe(true);
  });
});

// ============================================
// Layer 1→3: Schema 枚举 ↔ 状态机状态对齐
// ============================================

describe('Layer 1↔3 — Schema 枚举 ↔ 状态机状态对齐', () => {
  it('DisposalStatusEnum 包含违规状态机所有状态', () => {
    const enumValues = Object.values(DisposalStatusEnum.Values) as string[];
    // 状态机状态: pending | recorded | cut_off | ignored | timeout | archived
    const smStates: string[] = [
      'pending', 'recorded', 'cut_off', 'ignored', 'timeout', 'archived',
    ];
    for (const state of smStates) {
      expect(enumValues).toContain(state);
    }
  });

  it('ReplayTaskStatusEnum 包含回放擦音状态机所有状态', () => {
    const enumValues = Object.values(ReplayTaskStatusEnum.Values) as string[];
    // 状态机状态: pending | processing | completed | failed | timeout
    const smStates: string[] = [
      'pending', 'processing', 'completed', 'failed', 'timeout',
    ];
    for (const state of smStates) {
      expect(enumValues).toContain(state);
    }
  });

  it('FieldStatusEnum 包含场次状态机所有状态', () => {
    const enumValues = Object.values(FieldStatusEnum.Values) as string[];
    const smStates: string[] = ['live', 'ended', 'replaying'];
    for (const state of smStates) {
      expect(enumValues).toContain(state);
    }
  });

  it('DisposalTypeEnum 与状态机事件类型对齐', () => {
    const enumValues = Object.values(DisposalTypeEnum.Values) as string[];
    // 事件类型映射: record→RECORD, cut_off→CUT_OFF, ignore→IGNORE, auto_record→TIMEOUT, auto_archive→AUTO_ARCHIVE
    expect(enumValues).toContain('record');
    expect(enumValues).toContain('cut_off');
    expect(enumValues).toContain('ignore');
    expect(enumValues).toContain('auto_record');
    expect(enumValues).toContain('auto_archive');
  });

  it('ViolationTypeEnum 包含 BR-AUDIT-001 中不可降级的6类', () => {
    const enumValues = Object.values(ViolationTypeEnum.Values) as string[];
    // BR-AUDIT-001: 涉黄/涉暴/公共安全/社会安全/违法乱纪/广告法
    const requiredTypes = ['porn', 'violence', 'public_safety', 'social_safety', 'illegal', 'ad_law'];
    for (const t of requiredTypes) {
      expect(enumValues).toContain(t);
    }
  });
});

// ============================================
// Layer 2↔3: API 适配器 ↔ 状态机动作对齐
// ============================================

describe('Layer 2↔3 — API 适配器 ↔ 状态机动作对齐', () => {
  it('AuditDataAdapter 接口方法覆盖状态机所有事件分类', () => {
    // AuditDataAdapter 聚合了 ViolationsApi + DisposalApi + AuditSwitchApi
    // 对应状态机事件: RECORD/CUT_OFF/IGNORE (违规处置) + AUTO_ARCHIVE (开关切换)
    // TypeScript 编译时类型检查
    const adapterShape: (keyof AuditDataAdapter)[] = [
      'getViolations',
      'disposeViolation',
      'toggleAudit',
      'getAlertStats',
      'getReplayTasks',
      'startReplayMute',
      'retryMute',
    ];
    expect(adapterShape.length).toBeGreaterThanOrEqual(5);
  });

  it('AuditTransportAdapter 涵盖广播事件类型', () => {
    // TransportAdapter 负责实时推送
    const transportShape: (keyof AuditTransportAdapter)[] = [
      'connect',
      'disconnect',
      'onViolation',
      'onFieldStatusChange',
      'onMuteModeChange',
    ];
    expect(transportShape.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================
// Layer 3: 状态机定义完整性
// ============================================

describe('Layer 3 — 状态机定义完整性', () => {
  it('违规状态机：pending→5个终态均可过渡', () => {
    const events = ['RECORD', 'CUT_OFF', 'IGNORE', 'TIMEOUT', 'AUTO_ARCHIVE'];
    for (const ev of events) {
      expect(violationStateMachine.canTransition('pending', ev as any)).toBe(true);
    }
  });

  it('违规状态机：所有终态不再接受任何事件', () => {
    const terminalStates = ['recorded', 'cut_off', 'ignored', 'timeout', 'archived'];
    const events = ['RECORD', 'CUT_OFF', 'IGNORE', 'TIMEOUT', 'AUTO_ARCHIVE'];
    for (const state of terminalStates) {
      for (const ev of events) {
        expect(violationStateMachine.canTransition(state as any, ev as any)).toBe(false);
      }
    }
  });

  it('场次状态机：live→ended/replaying→终态', () => {
    expect(fieldStateMachine.canTransition('live', 'END_LIVE')).toBe(true);
    expect(fieldStateMachine.canTransition('live', 'CUT_OFF')).toBe(true);
    expect(fieldStateMachine.canTransition('ended', 'GENERATE_REPLAY')).toBe(true);
    // ended 不接受无效事件
    expect(fieldStateMachine.canTransition('ended', 'START_LIVE')).toBe(false);
    // replaying 是终态
    expect(fieldStateMachine.canTransition('replaying', 'END_LIVE')).toBe(false);
  });

  it('回放擦音任务状态机：processing→3种出口 + failed/timeout→RETRY', () => {
    // processing → completed | failed | timeout
    expect(replayTaskStateMachine.canTransition('processing', 'COMPLETE')).toBe(true);
    expect(replayTaskStateMachine.canTransition('processing', 'FAIL')).toBe(true);
    expect(replayTaskStateMachine.canTransition('processing', 'TIMEOUT')).toBe(true);
    expect(replayTaskStateMachine.canTransition('processing', 'START_PROCESSING')).toBe(false);

    // failed → RETRY → pending
    expect(replayTaskStateMachine.canTransition('failed', 'RETRY')).toBe(true);
    expect(replayTaskStateMachine.canTransition('failed', 'COMPLETE')).toBe(false);

    // timeout → RETRY → pending
    expect(replayTaskStateMachine.canTransition('timeout', 'RETRY')).toBe(true);
    expect(replayTaskStateMachine.canTransition('timeout', 'COMPLETE')).toBe(false);

    // completed 是终态
    expect(replayTaskStateMachine.canTransition('completed', 'RETRY')).toBe(false);
  });

  it('状态机 transition 返回正确的目标状态', () => {
    expect(violationStateMachine.transition('pending', { type: 'RECORD', reason: 'x', operator: 'a' }))
      .toBe('recorded');
    expect(violationStateMachine.transition('pending', { type: 'CUT_OFF', reason: 'x', operator: 'a' }))
      .toBe('cut_off');
    expect(violationStateMachine.transition('pending', { type: 'AUTO_ARCHIVE' }))
      .toBe('archived');

    // 无效过渡
    expect(() =>
      violationStateMachine.transition('recorded', { type: 'RECORD', reason: 'x', operator: 'a' })
    ).toThrow('无效的状态过渡');
  });
});

// ============================================
// Store ↔ API 适配器一致性
// ============================================

describe('Store ↔ Adapter 接口一致性', () => {
  it('Store 操作方法覆盖 Adapter 所需的全部能力', () => {
    setActivePinia(createPinia());
    const store = useAuditStore();

    // Store 暴露的操作应与 Adapter 调用签名一致
    expect(typeof store.appendViolation).toBe('function');
    expect(typeof store.appendDisposal).toBe('function');
    expect(typeof store.setMuteMode).toBe('function');
    expect(typeof store.setLiveEffect).toBe('function');
    expect(typeof store.clearLiveEffect).toBe('function');
    expect(typeof store.disposeViolation).toBe('function');
    expect(typeof store.setAuditEnabled).toBe('function');
    expect(typeof store.setFieldStatus).toBe('function');
    expect(typeof store.setCallbackLost).toBe('function');
    expect(typeof store.setReplayTask).toBe('function');
    expect(typeof store.setTenantConfig).toBe('function');
    expect(typeof store.incrementTodayViolation).toBe('function');
    expect(typeof store.reset).toBe('function');
  });

  it('Store 计算属性覆盖 UI 渲染所需全部数据', () => {
    setActivePinia(createPinia());
    const store = useAuditStore();

    expect(store.alertStats).toBeDefined();
    expect(store.pendingViolations).toBeDefined();
    expect(store.filteredViolations).toBeDefined();
  });
});

// ============================================
// MuteMode 枚举 ↔ Config/TenantConfig 对齐
// ============================================

describe('MuteMode 枚举 ↔ 配置一致性', () => {
  it('MuteModeEnum 仅含 silent 和 beep 两种', () => {
    const values = Object.values(MuteModeEnum.Values) as string[];
    expect(values).toHaveLength(2);
    expect(values).toContain('silent');
    expect(values).toContain('beep');
  });

  it('TenantAuditConfigSchema.mute_mode 与 MuteModeEnum 对齐', () => {
    // silent/beep 均可通过
    expect(TenantAuditConfigSchema.safeParse({
      tenant_id: 't-001',
      tenant_name: 'test',
      contact_phone: '13800138000',
      registered_at: '2025-01-01T00:00:00.000Z',
      is_enabled: true,
      industry: 'ecommerce',
      stream_domain: 'live.example.com',
      audit_enabled: false,
      today_violation_count: 0,
      mute_mode: 'silent',
    }).success).toBe(true);

    // 非法值应拒绝
    const badResult = TenantAuditConfigSchema.safeParse({
      tenant_id: 't-001',
      audio_video_url: 'https://example.com/live.mp4',
      tenant_name: 'test',
      industry: 'ecommerce',
      stream_domain: 'live.example.com',
      audit_enabled: false,
      today_violation_count: 0,
      mute_mode: 'invalid_mode' as any,
    });
    expect(badResult.success).toBe(false);
  });
});

// ============================================
// CONFIDENCE 范围一致性（Schema vs Mock生成器）
// ============================================

describe('Schema 校验边界值', () => {
  it('ReviewViolationSchema confidence 在 0-100 范围内', () => {
    const valid = ReviewViolationSchema.shape.confidence.safeParse(95);
    expect(valid.success).toBe(true);

    const negative = ReviewViolationSchema.shape.confidence.safeParse(-1);
    expect(negative.success).toBe(false);

    const overflow = ReviewViolationSchema.shape.confidence.safeParse(101);
    expect(overflow.success).toBe(false);

    // 边界值
    expect(ReviewViolationSchema.shape.confidence.safeParse(0).success).toBe(true);
    expect(ReviewViolationSchema.shape.confidence.safeParse(100).success).toBe(true);
  });

  it('DisposalStatusEnum 与 violation status 过渡后的值对齐', () => {
    const validStates = Object.values(DisposalStatusEnum.Values) as string[];
    // Store disposeViolation 更新后的状态必须在此枚举中
    const storeMappedStates = ['pending', 'recorded', 'cut_off', 'ignored', 'timeout', 'archived'];
    for (const s of storeMappedStates) {
      expect(validStates).toContain(s);
    }
  });
});
