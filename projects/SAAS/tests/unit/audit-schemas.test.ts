/**
 * Zod契约层 — Schema单元测试
 * 测试范围：所有实体Schema的校验通过/拒绝边界
 */
import { describe, it, expect } from 'vitest';
import {
  ReviewViolationSchema,
  ReviewDisposalSchema,
  TenantAuditConfigSchema,
  ReplayMuteTaskSchema,
  ReplayFileSchema,
  AlertStatsSchema,
  ViolationFilterSchema,
  DisposalRequestSchema,
  AuditSwitchRequestSchema,
  MuteModeEnum,
} from '../../src/contracts/schemas/audit-schemas';

// ============================================
// 测试数据工厂
// ============================================

const validViolation = {
  violation_id: '550e8400-e29b-41d4-a716-446655440000',
  stream_id: 'stream-001',
  audit_type: 'audio' as const,
  violation_type: 'porn' as const,
  violation_level: 'L1' as const,
  violation_content: '含色情擦边内容',
  violation_time: '2026-07-23T14:30:00.000Z',
  suggestion: 'block' as const,
  confidence: 95,
  keyword: 'xyz',
  evidence_url: 'https://cdn.example.com/evidence/001.wav',
  raw_callback: { hit_flag: 1, score: 95 },
  audio_muted: false,
  mute_duration: 0,
  disposal_status: 'pending' as const,
  created_at: '2026-07-23T14:30:00.000Z',
};

const validDisposal = {
  disposal_id: '660e8400-e29b-41d4-a716-446655440001',
  violation_id: '550e8400-e29b-41d4-a716-446655440000',
  disposal_type: 'cut_off' as const,
  disposal_reason: '涉黄严重，立即断流',
  operator: 'admin',
  operated_at: '2026-07-23T14:30:05.000Z',
};

const validTenantConfig = {
  tenant_id: 'T-001',
  tenant_name: '九天科技',
  industry: '科技',
  stream_domain: 'rtmp://live-push.xxkeji.com/live',
  audit_enabled: true,
  today_violation_count: 0,
  mute_mode: 'beep' as const,
};

// ============================================
// ReviewViolationSchema
// ============================================

describe('ReviewViolationSchema', () => {
  it('合法违规记录通过校验', () => {
    expect(() => ReviewViolationSchema.parse(validViolation)).not.toThrow();
  });

  it('violation_id 必须为UUID格式', () => {
    const data = { ...validViolation, violation_id: 'not-a-uuid' };
    expect(() => ReviewViolationSchema.parse(data)).toThrow();
  });

  it('violation_level 仅接受 L1/L2/L3/L4', () => {
    expect(() => ReviewViolationSchema.parse({ ...validViolation, violation_level: 'L5' })).toThrow();
    expect(() => ReviewViolationSchema.parse({ ...validViolation, violation_level: 'L1' })).not.toThrow();
    expect(() => ReviewViolationSchema.parse({ ...validViolation, violation_level: 'L4' })).not.toThrow();
  });

  it('confidence 必须在0-100之间', () => {
    expect(() => ReviewViolationSchema.parse({ ...validViolation, confidence: 101 })).toThrow();
    expect(() => ReviewViolationSchema.parse({ ...validViolation, confidence: -1 })).toThrow();
    expect(() => ReviewViolationSchema.parse({ ...validViolation, confidence: 0 })).not.toThrow();
    expect(() => ReviewViolationSchema.parse({ ...validViolation, confidence: 100 })).not.toThrow();
  });

  it('disposal_status 仅接受6种状态', () => {
    expect(() => ReviewViolationSchema.parse({ ...validViolation, disposal_status: 'deleted' })).toThrow();
    expect(() => ReviewViolationSchema.parse({ ...validViolation, disposal_status: 'cut_off' })).not.toThrow();
  });

  it('evidence_url 必须为合法URL', () => {
    expect(() => ReviewViolationSchema.parse({ ...validViolation, evidence_url: 'not-a-url' })).toThrow();
  });
});

// ============================================
// ReviewDisposalSchema
// ============================================

describe('ReviewDisposalSchema', () => {
  it('合法处置记录通过校验', () => {
    expect(() => ReviewDisposalSchema.parse(validDisposal)).not.toThrow();
  });

  it('disposal_reason 不能为空', () => {
    expect(() => ReviewDisposalSchema.parse({ ...validDisposal, disposal_reason: '' })).toThrow();
  });

  it('disposal_type 仅接受5种类型', () => {
    expect(() => ReviewDisposalSchema.parse({ ...validDisposal, disposal_type: 'delete' })).toThrow();
    expect(() => ReviewDisposalSchema.parse({ ...validDisposal, disposal_type: 'cut_off' })).not.toThrow();
    expect(() => ReviewDisposalSchema.parse({ ...validDisposal, disposal_type: 'auto_archive' })).not.toThrow();
  });
});

// ============================================
// TenantAuditConfigSchema
// ============================================

describe('TenantAuditConfigSchema', () => {
  it('合法租户配置通过校验', () => {
    expect(() => TenantAuditConfigSchema.parse(validTenantConfig)).not.toThrow();
  });

  it('mute_mode 仅接受 silent/beep', () => {
    expect(() => TenantAuditConfigSchema.parse({ ...validTenantConfig, mute_mode: 'mute' })).toThrow();
    expect(() => MuteModeEnum.parse('silent')).not.toThrow();
    expect(() => MuteModeEnum.parse('beep')).not.toThrow();
  });
});

// ============================================
// AlertStatsSchema
// ============================================

describe('AlertStatsSchema', () => {
  it('合法统计数据通过校验', () => {
    const stats = { l1: 1, l2: 3, l3: 5, l4: 2, total: 11 };
    expect(() => AlertStatsSchema.parse(stats)).not.toThrow();
  });

  it('各字段不能为负数', () => {
    expect(() => AlertStatsSchema.parse({ l1: -1, l2: 0, l3: 0, l4: 0, total: -1 })).toThrow();
  });
});

// ============================================
// ReplayMuteTaskSchema
// ============================================

describe('ReplayMuteTaskSchema', () => {
  const validTask = {
    task_id: '770e8400-e29b-41d4-a716-446655440002',
    stream_id: 'stream-001',
    replay_file_url: 'https://cdn.example.com/replay.mp4',
    task_status: 'pending' as const,
    progress: 0,
  };

  it('合法擦音任务通过校验', () => {
    expect(() => ReplayMuteTaskSchema.parse(validTask)).not.toThrow();
  });

  it('progress 应在0-100之间', () => {
    expect(() => ReplayMuteTaskSchema.parse({ ...validTask, progress: 101 })).toThrow();
    expect(() => ReplayMuteTaskSchema.parse({ ...validTask, progress: -1 })).toThrow();
    expect(() => ReplayMuteTaskSchema.parse({ ...validTask, progress: 50 })).not.toThrow();
  });

  it('completed时应有muted_file_url', () => {
    const completed = { ...validTask, task_status: 'completed' as const, progress: 100, muted_file_url: 'https://cdn.example.com/muted.mp4', completed_at: '2026-07-23T15:00:00.000Z' };
    expect(() => ReplayMuteTaskSchema.parse(completed)).not.toThrow();
  });
});

// ============================================
// DisposalRequestSchema
// ============================================

describe('DisposalRequestSchema', () => {
  it('reason不能为空', () => {
    const req = { violation_id: '550e8400-e29b-41d4-a716-446655440000', disposal_type: 'cut_off' as const, reason: '', operator: 'admin' };
    expect(() => DisposalRequestSchema.parse(req)).toThrow();
  });

  it('合法请求通过校验', () => {
    const req = { violation_id: '550e8400-e29b-41d4-a716-446655440000', disposal_type: 'cut_off' as const, reason: '涉黄断流', operator: 'admin' };
    expect(() => DisposalRequestSchema.parse(req)).not.toThrow();
  });
});

// ============================================
// AuditSwitchRequestSchema
// ============================================

describe('AuditSwitchRequestSchema', () => {
  it('enabled 为布尔值', () => {
    expect(() => AuditSwitchRequestSchema.parse({ tenant_id: 'T-001', enabled: true })).not.toThrow();
    expect(() => AuditSwitchRequestSchema.parse({ tenant_id: 'T-001', enabled: false })).not.toThrow();
    expect(() => AuditSwitchRequestSchema.parse({ tenant_id: 'T-001', enabled: 'yes' })).toThrow();
  });
});

// ============================================
// ReplayFileSchema
// ============================================

describe('ReplayFileSchema', () => {
  const validFile = {
    file_id: '880e8400-e29b-41d4-a716-446655440003',
    stream_id: 'stream-001',
    file_name: '20260723_live_room_001.mp4',
    duration: 3600,
    file_size: 1024 * 1024 * 500,
    created_at: '2026-07-23T16:00:00.000Z',
    play_url_original: 'https://cdn.example.com/replay_original.mp4',
    play_url_muted: 'https://cdn.example.com/replay_muted.mp4',
    is_muted: true,
    allow_play: true,
  };

  it('合法回放文件通过校验', () => {
    expect(() => ReplayFileSchema.parse(validFile)).not.toThrow();
  });

  it('duration 不能为负数', () => {
    expect(() => ReplayFileSchema.parse({ ...validFile, duration: -1 })).toThrow();
  });

  it('file_size 不能为负数', () => {
    expect(() => ReplayFileSchema.parse({ ...validFile, file_size: -1 })).toThrow();
  });
});
