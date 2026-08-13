/**
 * 内容审查域 — 状态机单元测试
 * 测试范围：三台状态机（场次/违规/回放擦音）的完整过渡表
 */
import { describe, it, expect } from 'vitest';
import {
  fieldStateMachine,
  violationStateMachine,
  replayTaskStateMachine,
} from '../../src/contracts/state-machine/audit-state-machine';

// ============================================
// 场次状态机
// ============================================

describe('场次状态机', () => {
  it('初始状态应为 live', () => {
    expect(fieldStateMachine.initialState).toBe('live');
  });

  it('live → END_LIVE → ended', () => {
    expect(fieldStateMachine.transition('live', { type: 'END_LIVE' })).toBe('ended');
  });

  it('live → CUT_OFF → ended（违规断流）', () => {
    expect(fieldStateMachine.transition('live', { type: 'CUT_OFF', reason: '涉黄' })).toBe('ended');
  });

  it('ended → GENERATE_REPLAY → replaying', () => {
    expect(fieldStateMachine.transition('ended', { type: 'GENERATE_REPLAY' })).toBe('replaying');
  });

  it('ended 状态不可再接收 END_LIVE', () => {
    expect(fieldStateMachine.canTransition('ended', 'END_LIVE')).toBe(false);
  });

  it('replaying 为终态，无有效过渡', () => {
    expect(fieldStateMachine.canTransition('replaying', 'END_LIVE')).toBe(false);
    expect(fieldStateMachine.canTransition('replaying', 'CUT_OFF')).toBe(false);
    expect(fieldStateMachine.canTransition('replaying', 'GENERATE_REPLAY')).toBe(false);
  });

  it('live 不可直接到 replaying', () => {
    expect(fieldStateMachine.canTransition('live', 'GENERATE_REPLAY')).toBe(false);
  });

  it('无效过渡应抛出错误', () => {
    expect(() =>
      fieldStateMachine.transition('ended', { type: 'END_LIVE' })
    ).toThrow('无效的状态过渡');
  });
});

// ============================================
// 违规状态机
// ============================================

describe('违规状态机', () => {
  it('初始状态应为 pending', () => {
    expect(violationStateMachine.initialState).toBe('pending');
  });

  it('pending → RECORD → recorded', () => {
    expect(
      violationStateMachine.transition('pending', {
        type: 'RECORD',
        reason: '违规轻微',
        operator: 'admin',
      })
    ).toBe('recorded');
  });

  it('pending → CUT_OFF → cut_off', () => {
    expect(
      violationStateMachine.transition('pending', {
        type: 'CUT_OFF',
        reason: '严重涉黄',
        operator: 'admin',
      })
    ).toBe('cut_off');
  });

  it('pending → IGNORE → ignored', () => {
    expect(
      violationStateMachine.transition('pending', {
        type: 'IGNORE',
        reason: '误报',
        operator: 'admin',
      })
    ).toBe('ignored');
  });

  it('pending → TIMEOUT → timeout（30s未处置自动记录）', () => {
    expect(violationStateMachine.transition('pending', { type: 'TIMEOUT' })).toBe('timeout');
  });

  it('pending → AUTO_ARCHIVE → archived', () => {
    expect(violationStateMachine.transition('pending', { type: 'AUTO_ARCHIVE' })).toBe('archived');
  });

  it('recorded/cut_off/ignored/timeout/archived 均为终态', () => {
    const finalStates = ['recorded', 'cut_off', 'ignored', 'timeout', 'archived'] as const;
    for (const state of finalStates) {
      expect(violationStateMachine.canTransition(state, 'RECORD')).toBe(false);
      expect(violationStateMachine.canTransition(state, 'CUT_OFF')).toBe(false);
      expect(violationStateMachine.canTransition(state, 'IGNORE')).toBe(false);
      expect(violationStateMachine.canTransition(state, 'TIMEOUT')).toBe(false);
    }
  });

  it('无效过渡应抛出错误', () => {
    expect(() =>
      violationStateMachine.transition('recorded', { type: 'RECORD', reason: '', operator: '' })
    ).toThrow('无效的状态过渡');
  });
});

// ============================================
// 回放擦音任务状态机
// ============================================

describe('回放擦音任务状态机', () => {
  it('初始状态应为 pending', () => {
    expect(replayTaskStateMachine.initialState).toBe('pending');
  });

  it('pending → START_PROCESSING → processing', () => {
    expect(replayTaskStateMachine.transition('pending', { type: 'START_PROCESSING' })).toBe('processing');
  });

  it('processing → COMPLETE → completed', () => {
    expect(
      replayTaskStateMachine.transition('processing', {
        type: 'COMPLETE',
        muted_file_url: 'https://cdn.example.com/replay_muted.mp4',
      })
    ).toBe('completed');
  });

  it('processing → FAIL → failed', () => {
    expect(
      replayTaskStateMachine.transition('processing', {
        type: 'FAIL',
        error_msg: '音频轨损坏',
      })
    ).toBe('failed');
  });

  it('processing → TIMEOUT → timeout', () => {
    expect(replayTaskStateMachine.transition('processing', { type: 'TIMEOUT' })).toBe('timeout');
  });

  it('failed → RETRY → pending（重新排队）', () => {
    expect(replayTaskStateMachine.transition('failed', { type: 'RETRY' })).toBe('pending');
  });

  it('timeout → RETRY → pending（重新排队）', () => {
    expect(replayTaskStateMachine.transition('timeout', { type: 'RETRY' })).toBe('pending');
  });

  it('completed 为终态，不可重试', () => {
    expect(replayTaskStateMachine.canTransition('completed', 'RETRY')).toBe(false);
  });

  it('pending 不可直接 COMPLETE', () => {
    expect(replayTaskStateMachine.canTransition('pending', 'COMPLETE')).toBe(false);
  });

  it('无效过渡应抛出错误', () => {
    expect(() =>
      replayTaskStateMachine.transition('completed', { type: 'RETRY' })
    ).toThrow('无效的状态过渡');
  });
});
