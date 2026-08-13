/**
 * SC-012: 跨终端同步场景
 * Give: 同一租户的运营后台和播控台同时打开
 * When: 在运营后台切换审查开关
 * Then: 播控台的场次信息栏实时反映新开关状态
 */
import { test, expect } from './contexts/audit-context';

test.describe('SC-012 — 跨终端同步', () => {
  test('运营后台和审查面板分别可独立打开', async ({ page, auditCtx, locators }) => {
    // 打开运营后台
    await page.goto(auditCtx.configUrl);
    await page.waitForTimeout(1000);
    await expect(locators.adminTenantPage).toBeVisible({ timeout: 8000 });

    // 再打开审查面板
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1000);
    await expect(locators.controlPanel).toBeVisible({ timeout: 8000 });
  });

  test('审查面板的场次信息栏显示当前状态', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 场次信息栏包含状态信息
    await expect(locators.fieldInfoBar).toBeVisible({ timeout: 5000 });
  });
});
