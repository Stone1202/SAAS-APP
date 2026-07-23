/**
 * 内容审查域 — Pinia Store单元测试
 * 测试范围：状态变更、处置操作、边界条件
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuditStore } from '../../src/stores/audit-store';
import type { ReviewViolation, ReviewDisposal } from '../../src/contracts';

// ============================================
// 测试数据工厂
// ============================================

function makeViolation(overrides: Partial<ReviewViolation> = {}): ReviewViolation {
  return {
    violation_id: `550e8400-e29b-41d4-a716-44665544000${Math.floor(Math.random() * 9)}`,
    stream_id: 'stream-001',
    audit_type: 'audio',
    violation_type: 'porn',
    violation_level: 'L1',
    violation_content: '测试违规内容',
    violation_time: new Date().toISOString(),
    suggestion: 'block',
    confidence: 95,
    keyword: 'test',
    evidence_url: 'https://cdn.example.com/evidence.wav',
    raw_callback: {},
    audio_muted: false,
    mute_duration: 0,
    disposal_status: 'pending',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeDisposal(overrides: Partial<ReviewDisposal> = {}): ReviewDisposal {
  return {
    disposal_id: `660e8400-e29b-41d4-a716-44665544000${Math.floor(Math.random() * 9)}`,
    violation_id: '550e8400-e29b-41d4-a716-446655440000',
    disposal_type: 'record',
    disposal_reason: '测试处置',
    operator: 'admin',
    operated_at: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================
// 测试
// ============================================

describe('audit-store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('初始化时 violations/disposals 为空数组', () => {
    const store = useAuditStore();
    expect(store.violations).toEqual([]);
    expect(store.disposals).toEqual([]);
  });

  it('初始化 muteMode 为 silent', () => {
    const store = useAuditStore();
    expect(store.muteMode).toBe('silent');
  });

  it('初始化 fieldStatus 为 live', () => {
    const store = useAuditStore();
    expect(store.fieldStatus).toBe('live');
  });

  // --- appendViolation ---

  it('appendViolation 将新违规插入列表头部', () => {
    const store = useAuditStore();
    const v1 = makeViolation({ violation_id: 'id-1' });
    const v2 = makeViolation({ violation_id: 'id-2' });

    store.appendViolation(v1);
    store.appendViolation(v2);

    expect(store.violations).toHaveLength(2);
    expect(store.violations[0].violation_id).toBe('id-2'); // 新记录在前
    expect(store.violations[1].violation_id).toBe('id-1');
  });

  // --- setMuteMode ---

  it('setMuteMode 更新 muteMode 和 tenantConfig.mute_mode', () => {
    const store = useAuditStore();
    store.setMuteMode('beep');
    expect(store.muteMode).toBe('beep');
    expect(store.tenantConfig.mute_mode).toBe('beep');
  });

  // --- disposeViolation ---

  it('disposeViolation(record) 将状态更新为 recorded', () => {
    const store = useAuditStore();
    const v = makeViolation({ violation_id: 'v-001', disposal_status: 'pending' });
    store.appendViolation(v);

    store.disposeViolation('v-001', makeDisposal({
      violation_id: 'v-001',
      disposal_type: 'record',
    }));

    const updated = store.violations.find(v => v.violation_id === 'v-001');
    expect(updated!.disposal_status).toBe('recorded');
    expect(store.disposals).toHaveLength(1);
  });

  it('disposeViolation(cut_off) 将状态更新为 cut_off', () => {
    const store = useAuditStore();
    const v = makeViolation({ violation_id: 'v-002', disposal_status: 'pending' });
    store.appendViolation(v);

    store.disposeViolation('v-002', makeDisposal({
      violation_id: 'v-002',
      disposal_type: 'cut_off',
    }));

    const updated = store.violations.find(v => v.violation_id === 'v-002');
    expect(updated!.disposal_status).toBe('cut_off');
  });

  it('disposeViolation(ignore) 将状态更新为 ignored', () => {
    const store = useAuditStore();
    const v = makeViolation({ violation_id: 'v-003', disposal_status: 'pending' });
    store.appendViolation(v);

    store.disposeViolation('v-003', makeDisposal({
      violation_id: 'v-003',
      disposal_type: 'ignore',
    }));

    const updated = store.violations.find(v => v.violation_id === 'v-003');
    expect(updated!.disposal_status).toBe('ignored');
  });

  // --- setAuditEnabled ---

  it('setAuditEnabled(false) 将所有pending归档', () => {
    const store = useAuditStore();
    store.appendViolation(makeViolation({ violation_id: 'v-1', disposal_status: 'pending' }));
    store.appendViolation(makeViolation({ violation_id: 'v-2', disposal_status: 'recorded' }));
    store.appendViolation(makeViolation({ violation_id: 'v-3', disposal_status: 'pending' }));

    store.setAuditEnabled(false);

    expect(store.violations.find(v => v.violation_id === 'v-1')!.disposal_status).toBe('archived');
    expect(store.violations.find(v => v.violation_id === 'v-2')!.disposal_status).toBe('recorded'); // 已处理不变
    expect(store.violations.find(v => v.violation_id === 'v-3')!.disposal_status).toBe('archived');
  });

  it('setAuditEnabled(true) 不影响现有状态', () => {
    const store = useAuditStore();
    store.appendViolation(makeViolation({ violation_id: 'v-1', disposal_status: 'pending' }));

    store.setAuditEnabled(true);

    expect(store.violations.find(v => v.violation_id === 'v-1')!.disposal_status).toBe('pending');
  });

  // --- alertStats ---

  it('alertStats 正确统计红黄蓝级别', () => {
    const store = useAuditStore();
    store.appendViolation(makeViolation({ violation_id: 'v-1', violation_level: 'L1' }));
    store.appendViolation(makeViolation({ violation_id: 'v-2', violation_level: 'L1' }));
    store.appendViolation(makeViolation({ violation_id: 'v-3', violation_level: 'L2' }));
    store.appendViolation(makeViolation({ violation_id: 'v-4', violation_level: 'L3' }));
    store.appendViolation(makeViolation({ violation_id: 'v-5', violation_level: 'L4' }));

    expect(store.alertStats).toEqual({ l1: 2, l2: 1, l3: 1, l4: 1, total: 5 });
  });

  // --- filteredViolations ---

  it('filteredViolations 按时间倒序排列', () => {
    const store = useAuditStore();
    const v1 = makeViolation({ violation_id: 'v-old', violation_time: '2026-07-23T10:00:00.000Z' });
    const v2 = makeViolation({ violation_id: 'v-new', violation_time: '2026-07-23T12:00:00.000Z' });

    store.appendViolation(v1);
    store.appendViolation(v2);

    const ids = store.filteredViolations.map(v => v.violation_id);
    expect(ids[0]).toBe('v-new');  // 最新在前
    expect(ids[1]).toBe('v-old');
  });

  // --- pendingViolations ---

  it('pendingViolations 仅返回待处理记录', () => {
    const store = useAuditStore();
    store.appendViolation(makeViolation({ violation_id: 'v-pending', disposal_status: 'pending' }));
    store.appendViolation(makeViolation({ violation_id: 'v-done', disposal_status: 'recorded' }));

    expect(store.pendingViolations).toHaveLength(1);
    expect(store.pendingViolations[0].violation_id).toBe('v-pending');
  });

  // --- incrementTodayViolation ---

  it('incrementTodayViolation 将 today_violation_count +1', () => {
    const store = useAuditStore();
    store.setTenantConfig({ today_violation_count: 5 });
    store.incrementTodayViolation();
    expect(store.tenantConfig.today_violation_count).toBe(6);
  });

  // --- reset ---

  it('reset 清空 violations 和 disposals，重置 callbackLost', () => {
    const store = useAuditStore();
    store.appendViolation(makeViolation());
    store.appendDisposal(makeDisposal());
    store.setCallbackLost(true);

    store.reset();

    expect(store.violations).toEqual([]);
    expect(store.disposals).toEqual([]);
    expect(store.callbackLost).toBe(false);
  });
});
