/**
 * 模拟回调数据生成器（Sim Adapter - Data）
 *
 * 对应：FN-AUDIT-INFRA-001 模拟回调数据生成器
 * 职责：
 * 1. 定时生成模拟违规事件（5-15s随机间隔）
 * 2. 事件分发——通过auditStore广播到直播中控+观众端
 * 3. 30%概率标记回调丢失
 *
 * 架构：Sim模式下前端内存运行，不依赖后端API
 */

import { useAuditStore } from '../../stores/audit-store';
import type { ReviewViolation, ViolationType, ViolationLevel, Suggestion } from '../../contracts';

// ============================================
// Mock数据生成
// ============================================

const MOCK_KEYWORDS: Record<string, { content: string; type: ViolationType; level: ViolationLevel }> = {
  '涉黄-核心': { content: '违规涉黄内容片段——模拟ASR语音识别文本', type: 'porn', level: 'L1' },
  '涉政-核心': { content: '违规涉政言论片段——模拟ASR语音识别文本', type: 'politics', level: 'L1' },
  '涉暴-高危': { content: '违规暴力威胁内容——模拟ASR语音识别文本', type: 'violence', level: 'L2' },
  '广告法-中危': { content: '违规广告宣传用语——加微信xxx免费领取', type: 'ad_law', level: 'L3' },
  '辱骂-中危': { content: '违规人身攻击辱骂内容——模拟弹幕文本', type: 'abuse', level: 'L3' },
  '违禁词-低危': { content: '群号xxx进群领福利——模拟弹幕文本', type: 'banned_words', level: 'L4' },
};

const MOCK_LABELS: Record<ViolationType, string> = {
  porn: 'Porn',
  violence: 'Abuse',
  banned_words: 'Custom',
  ad_law: 'Ad',
  politics: 'Custom',
  abuse: 'Abuse',
  illegal: 'Custom',
  public_safety: 'Custom',
  social_safety: 'Custom',
  custom: 'Custom',
};

const MOCK_SUGGESTIONS: Record<ViolationLevel, Suggestion> = {
  L1: 'block',
  L2: 'block',
  L3: 'review',
  L4: 'pass',
};

function generateId(): string {
  return `viol-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createMockViolation(): ReviewViolation {
  // 随机选一个违规类型
  const entries = Object.entries(MOCK_KEYWORDS);
  const [label, mock] = entries[Math.floor(Math.random() * entries.length)];

  const now = new Date().toISOString();
  const streamId = `stream_mock_${Math.floor(Math.random() * 10000)}`;

  return {
    violation_id: generateId(),
    stream_id: streamId,
    audit_type: 'audio',
    violation_type: mock.type,
    violation_level: mock.level,
    violation_content: `[${label}] ${mock.content}`,
    violation_time: now,
    suggestion: MOCK_SUGGESTIONS[mock.level],
    confidence: Math.floor(Math.random() * 40) + 60, // 60-100
    keyword: label.split('-')[0],
    evidence_url: `https://mock-cos.example.com/evidence/${streamId}/${Date.now()}.wav`,
    raw_callback: {
      hit_flag: 1,
      score: Math.floor(Math.random() * 100),
      label: MOCK_LABELS[mock.type],
      sub_label: label,
      suggestion: MOCK_SUGGESTIONS[mock.level],
      asr_text: mock.content,
      duration: Math.floor(Math.random() * 10) + 1,
      seq: Math.floor(Math.random() * 1000),
      stream_id: streamId,
      audio_muted: false,
      mute_duration: 0,
      evidence_url: `https://mock-cos.example.com/evidence/${streamId}/${Date.now()}.wav`,
    },
    audio_muted: false,
    mute_duration: 0,
    disposal_status: 'pending',
    created_at: now,
  };
}

// ============================================
// 模拟数据生成器
// ============================================

class MockViolationGenerator {
  private timer: ReturnType<typeof setInterval> | null = null;
  private store: ReturnType<typeof useAuditStore> | null = null;

  /** 启动模拟数据生成 */
  start() {
    if (this.timer) return; // 已运行

    this.store = useAuditStore();
    this.store.mockRunning = true;

    // 初始延迟 2s，避免页面刚加载就出数据
    const initialDelay = 2000;

    const loop = () => {
      // BR-AUDIT-017: 场次结束后停止接收新违规通知
      if (!this.store || this.store.fieldStatus !== 'live' || !this.store.mockRunning) {
        this.timer = null;
        return;
      }

      // 30%概率标记回调丢失
      const isCallbackLost = Math.random() < 0.3;
      this.store.setCallbackLost(isCallbackLost);

      if (!isCallbackLost) {
        // 正常场景：生成违规记录并追加到中控
        const violation = createMockViolation();
        this.store!.appendViolation(violation);
        this.store!.incrementTodayViolation();
      }
      // 回调丢失场景：只标记callbackLost=true，不追加违规记录
      // 观众端通过订阅callbackLost状态显示橙色警告

      // 设置下次间隔（5-15秒随机）
      const nextInterval = Math.floor(Math.random() * 10000) + 5000; // 5000-15000ms
      this.timer = setTimeout(loop, nextInterval);
    };

    this.timer = setTimeout(loop, initialDelay);
  }

  /** 停止模拟数据生成 */
  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.store) {
      this.store.mockRunning = false;
    }
  }

  /** 判断是否正在运行 */
  get isRunning(): boolean {
    return this.timer !== null;
  }
}

export const mockViolationGenerator = new MockViolationGenerator();
