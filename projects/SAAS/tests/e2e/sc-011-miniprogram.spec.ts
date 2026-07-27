/**
 * SC-011: 小程序端适配场景
 * Give: 运营人员通过小程序访问审查面板
 * When: 页面在小程序 WebView 中渲染
 * Then: 页面基础功能可用、尺寸适配
 *
 * 注意：小程序 WebView 环境下 Playwright 无法直接模拟
 * 此测试验证基础页面在窄视口（375px）下的可用性作为代理验证
 */
import { test, expect } from './contexts/audit-context';

test.describe('SC-011 — 小程序端适配', () => {
  test('小程序视口下审查面板加载正常', async ({ page, auditCtx, locators }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 面板在窄视口可见
    await expect(locators.controlPanel).toBeVisible({ timeout: 8000 });
  });

  test('小程序视口下租户后台正常加载', async ({ page, auditCtx, locators }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(auditCtx.configUrl);
    await page.waitForTimeout(1500);

    await expect(locators.adminTenantPage).toBeVisible({ timeout: 8000 });
  });
});
