/**
 * E2E场景：运营后台 - 审查开关管理（/admin/tenant）
 *
 * 验收流程：
 * SC-ADM-001 租户列表浏览 → 查看各租户审查状态
 * SC-ADM-002 审查开关切换 → 开→关→开，验证State变更
 * SC-ADM-003 开关弹窗二次确认 → 含推流域名+今日违规数展示
 */

import { test, expect } from '@playwright/test';

test.describe('运营后台 - 审查开关管理', () => {
  test('SC-ADM-001: 页面正常渲染，可见4个租户卡片', async ({ page }) => {
    await page.goto('/admin/tenant');
    await page.waitForSelector('.page-title', { timeout: 10000 });

    // 页面标题
    await expect(page.locator('.page-title')).toContainText('审查开关');

    // 4个租户卡片
    const cards = page.locator('.tenant-card');
    await expect(cards).toHaveCount(4);
  });

  test('SC-ADM-002: 审查开关切换可交互', async ({ page }) => {
    await page.goto('/admin/tenant');
    await page.waitForSelector('.tenant-card', { timeout: 10000 });

    // 点击第一个租户的开关 → 弹出二次确认弹窗
    const firstToggle = page.locator('.audit-switch-control .toggle-switch').first();
    await firstToggle.click();

    // 弹窗出现
    const modal = page.locator('.switch-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('SC-ADM-003: 开关弹窗包含PRD要求的字段', async ({ page }) => {
    await page.goto('/admin/tenant');
    await page.waitForSelector('.tenant-card', { timeout: 10000 });

    // 点击开关
    await page.locator('.audit-switch-control .toggle-switch').first().click();
    const modal = page.locator('.switch-modal');

    // 验证弹窗标题
    await expect(modal.locator('.modal-title')).toBeVisible();

    // 验证推流域名字段
    await expect(modal.locator('.field-domain .field-value')).toBeVisible();

    // 验证今日违规数字段
    await expect(modal.locator('.field-vio .field-value')).toBeVisible();

    // 降级不可选提醒（如果该租户是beep模式，应显示beep/mute不可降级）
    // 确认和取消按钮
    await expect(modal.locator('.modal-actions .btn-cancel')).toBeVisible();
    await expect(modal.locator('.modal-actions .btn-confirm')).toBeVisible();
  });
});
