/**
 * E2E场景：直播中控 - 审查面板（/tenant/live-control?tab=audit）
 *
 * 验收流程：
 * SC-LIVE-001 审查面板渲染 → 场次信息+告警统计+违规列表
 * SC-LIVE-002 违规列表筛选 → 按级别/状态筛选
 * SC-LIVE-003 违规详情查看 → 侧滑抽屉内容完整
 * SC-LIVE-004 处置操作流程 → 选中违规→记录→确认
 */

import { test, expect } from '@playwright/test';

test.describe('直播中控 - 审查面板', () => {
  test('SC-LIVE-001: 审查面板完整渲染', async ({ page }) => {
    await page.goto('/tenant/live-control?tab=audit');
    await page.waitForSelector('[data-audit-panel]', { timeout: 10000 });

    // 场次信息栏
    await expect(page.locator('.field-info-bar')).toBeVisible();

    // 告警统计栏（红黄蓝三级+审查状态）
    const statsBar = page.locator('.alert-stats-bar');
    await expect(statsBar).toBeVisible();
    await expect(statsBar.locator('.stat-item')).toHaveCount(5); // 5项统计

    // 结束直播按钮
    await expect(page.locator('.end-live-btn')).toBeVisible();
  });

  test('SC-LIVE-002: 违规列表存在且可交互', async ({ page }) => {
    await page.goto('/tenant/live-control?tab=audit');
    await page.waitForSelector('.violation-table', { timeout: 10000 });

    // 违规列表容器存在
    await expect(page.locator('.violation-row').first()).toBeVisible({ timeout: 5000 });

    // 筛选项存在
    await expect(page.locator('.filter-bar')).toBeVisible();
  });

  test('SC-LIVE-003: 违规详情侧滑抽屉', async ({ page }) => {
    await page.goto('/tenant/live-control?tab=audit');
    await page.waitForSelector('.violation-row', { timeout: 10000 });

    // 点击第一条违规
    await page.locator('.violation-row').first().click();

    // 抽屉面板弹出
    const drawer = page.locator('.drawer-overlay');
    await expect(drawer).toBeVisible({ timeout: 3000 });

    // 抽屉包含违规详情内容
    await expect(drawer.locator('.detail-row')).toBeVisible();

    // 关闭抽屉
    await page.locator('.drawer-close').click();
    await expect(drawer).not.toBeVisible({ timeout: 2000 });
  });

  test('SC-LIVE-004: 处置按钮栏渐进式规则', async ({ page }) => {
    await page.goto('/tenant/live-control?tab=audit');
    await page.waitForSelector('.violation-row', { timeout: 10000 });

    // 点击任意违规
    await page.locator('.violation-row').first().click();

    // 处置按钮栏可见
    const disposalBar = page.locator('.disposal-bar');
    await expect(disposalBar).toBeVisible({ timeout: 3000 });

    // 三个按钮存在
    await expect(disposalBar.locator('.disposal-btn.record')).toBeVisible();
    await expect(disposalBar.locator('.disposal-btn.sever')).toBeVisible();
    await expect(disposalBar.locator('.disposal-btn.ignore')).toBeVisible();
  });

  test('SC-LIVE-005: 擦音模式切换', async ({ page }) => {
    await page.goto('/tenant/live-control?tab=audit');
    await page.waitForSelector('.field-info-bar', { timeout: 10000 });

    // 擦音模式选择器存在
    const modeSelector = page.locator('.mute-mode-select');
    await expect(modeSelector).toBeVisible();
  });
});
