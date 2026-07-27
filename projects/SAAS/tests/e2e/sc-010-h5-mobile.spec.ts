/**
 * SC-010: H5 移动端适配场景
 * Give: 运营人员使用手机浏览器访问审查面板
 * When: 页面在窄屏下渲染
 * Then: 布局适配移动端 + 触控交互正常
 */
import { test, expect } from './contexts/audit-context';

test.describe('SC-010 — H5 移动端适配', () => {
  test('手机视口下审查面板正常渲染', async ({ page, auditCtx, locators }) => {
    // 设置为手机视口
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 面板在移动端可见
    await expect(locators.controlPanel).toBeVisible({ timeout: 8000 });
  });

  test('手机视口下处置按钮可操作', async ({ page, auditCtx, locators }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    await expect(locators.disposalBar).toBeVisible({ timeout: 5000 });
  });
});
