/**
 * E2E 测试 — SAAS 直播质检页面辅助
 * 真实 DOM 选择器映射，基于项目实际 Vue 组件结构
 */
import { test as base, expect, type Page } from '@playwright/test';

// ============================================
// 类型
// ============================================
export interface AuditTestContext {
  /** 直播中控审查面板 */
  liveControlUrl: string;
  /** 历史违规列表 */
  violationsUrl: string;
  /** 运营后台审查开关 */
  configUrl: string;
  /** 回放详情审查 */
  replayUrl: string;
  /** 租户后台总览 */
  dashboardUrl: string;
}

// ============================================
// 定位器工厂（真实 DOM class / 文本 / aria）
// ============================================
export function createLocators(page: Page) {
  return {
    // ── 直播场次监控 (LiveControlAuditPanel) ──
    controlPanel: page.locator('.live-control-panel'),
    monitorSection: page.locator('.monitor-section'),
    monitorView: page.locator('.monitor-view'),
    videoPlaceholder: page.locator('.video-placeholder'),
    videoIcon: page.locator('.video-icon'),
    videoLabel: page.locator('.video-label'),
    noStream: page.locator('.no-stream'),
    // 场次信息栏
    fieldInfoBar: page.locator('.field-info-bar'),
    statusBadge: page.locator('.status-badge'),
    statusBadgeLive: page.locator('.status-badge.live'),
    statusBadgeEnded: page.locator('.status-badge.ended'),

    // ── 违规列表 (ViolationTable) ──
    violationTable: page.locator('.violation-table-wrapper'),
    violationRow: page.locator('.violation-row'),
    violationRowSelected: page.locator('.violation-row.selected'),
    violationRowFirst: page.locator('.violation-row').first(),
    filterSelectLevel: page.locator('.filter-select').nth(0),
    filterSelectStatus: page.locator('.filter-select').nth(1),
    levelBadgeL1: page.locator('.level-badge.l1'),
    levelBadgeL2: page.locator('.level-badge.l2'),
    statusTagPending: page.locator('.status-tag.pending'),
    statusTagRecorded: page.locator('.status-tag.recorded'),
    statusTagCutOff: page.locator('.status-tag.cut_off'),
    statusTagIgnored: page.locator('.status-tag.ignored'),
    rowSnippet: page.locator('.row-snippet'),

    // ── 处置栏 (DisposalBar) ──
    disposalBar: page.locator('.disposal-bar'),
    btnRecord: page.locator('.disposal-btn.record'),
    btnSever: page.locator('.disposal-btn.sever'),
    btnIgnore: page.locator('.disposal-btn.ignore'),
    btnSeverDisabled: page.locator('.disposal-btn.sever:has(.tooltip)'),
    btnIgnoreDisabled: page.locator('.disposal-btn.ignore:has(.tooltip)'),

    // ── 违规详情抽屉 (ViolationDetailPanel) ──
    drawerOverlay: page.locator('.drawer-overlay'),
    drawerPanel: page.locator('.drawer-panel'),
    drawerHeader: page.locator('.drawer-header'),
    closeBtn: page.locator('.close-btn'),
    detailRows: page.locator('.detail-row'),
    asrBlock: page.locator('.asr-block'),
    disposalRecord: page.locator('.disposal-record'),

    // ── 处置确认弹窗 (DisposalModal) ──
    modalOverlay: page.locator('.modal-overlay'),
    disposeModal: page.locator('.modal'),
    noteInput: page.locator('.note-input'),
    btnCancel: page.locator('.modal-footer .btn.btn-default'),
    btnConfirm: page.locator('.modal-footer .btn-primary, .modal-footer .btn-danger-filled'),

    // ── 告警统计栏 (AlertStatsBar) ──
    alertStatsBar: page.locator('.alert-stats-bar'),
    statItems: page.locator('.stat-item'),

    // ── 审核开关页 (AuditSwitchPage) ──
    adminTenantPage: page.locator('.admin-tenant-page'),
    tenantList: page.locator('.tenant-list'),
    tenantCard: page.locator('.tenant-card-wrapper'),
    toggleSwitch: page.locator('.toggle-switch'),
    toggleSwitchOn: page.locator('.toggle-switch.on'),
    toggleSwitchOff: page.locator('.toggle-switch.off'),
    // 开关确认弹窗
    switchModal: page.locator('.modal-overlay .modal'),
    switchBtnConfirm: page.locator('.modal-footer .btn-primary, .modal-footer .btn-danger'),

    // ── 回放页 (ReplayDetailAudit) ──
    replayPage: page.locator('.replay-detail-page'),
    playerSection: page.locator('.replay-player-section'),
    playerPlaceholder: page.locator('.player-placeholder'),
    playerIcon: page.locator('.player-icon'),
    comparePanel: page.locator('.compare-panel'),
    replayVioRow: page.locator('.replay-vio-row'),
    modeRadio: page.locator('.mode-radio'),
    muteTaskBadge: page.locator('.mute-task-badge'),

    // ── 违规覆盖层 (ViolationAlertOverlay) ──
    // 由 ViolationAlertOverlay 组件渲染，选择器取决于其内部实现
    alertOverlay: page.locator('[class*="alert-overlay"]'),

    // ── 通用 ──
    emptyState: page.locator('.empty'),
  };
}

// ============================================
// 扩展 Fixture
// ============================================
type AuditFixture = {
  auditCtx: AuditTestContext;
  locators: ReturnType<typeof createLocators>;
};

export const test = base.extend<AuditFixture>({
  auditCtx: async ({}, use) => {
    await use({
      // 直播中控审查面板（需 query 参数）
      liveControlUrl: '/tenant/live-control?tab=audit&streamId=stream-001',
      // 历史违规列表
      violationsUrl: '/tenant/live/stream-001/violations',
      // 运营后台审查开关
      configUrl: '/admin/tenant',
      // 回放详情审查
      replayUrl: '/tenant/live/stream-001/replay',
      // 租户后台总览
      dashboardUrl: '/tenant/dashboard',
    });
  },

  locators: async ({ page }, use) => {
    await use(createLocators(page));
  },
});

export { expect };

// ============================================
// 测试数据工厂
// ============================================
let _idSeq = 0;
export function makeMockViolation(overrides: Record<string, unknown> = {}) {
  _idSeq++;
  return {
    violation_id: `e2e-viol-${Date.now()}-${_idSeq}`,
    stream_id: 'stream-001',
    audit_type: 'audio',
    violation_type: 'porn',
    violation_level: 'L2',
    violation_content: '测试违规内容',
    violation_time: new Date().toISOString(),
    suggestion: 'block',
    confidence: 85,
    keyword: 'test',
    evidence_url: 'https://cdn.example.com/evidence.wav',
    raw_callback: { hit_flag: 1, score: 90, label: 'Porn' },
    audio_muted: false,
    mute_duration: 0,
    disposal_status: 'pending',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
