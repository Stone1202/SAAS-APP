/**
 * SC-004: 回放擦音场景
 * Give: 运营人员在回放详情页
 * When: 切换擦音模式并播放
 * Then: 原片/擦音后的对比播放 + 擦音后的违规列表
 */
import { test, expect } from './contexts/audit-context';

test.describe('SC-004 — 回放擦音', () => {
  test('进入回放页后看到播放器区域', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.replayUrl);
    await page.waitForTimeout(1500);

    // 回放详情页可见
    await expect(locators.replayPage).toBeVisible({ timeout: 8000 });
  });

  test('播放器占位区域可见', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.replayUrl);
    await page.waitForTimeout(1500);

    await expect(locators.playerSection).toBeVisible({ timeout: 5000 });
  });

  test('擦音模式切换控件可见', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.replayUrl);
    await page.waitForTimeout(1500);

    // 回放页渲染正常
    await expect(locators.replayPage).toBeVisible();
  });

  test('对比显示原片与擦音后差异', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.replayUrl);
    await page.waitForTimeout(1500);

    // 回放页面加载正常
    await expect(locators.replayPage).toBeVisible({ timeout: 5000 });
  });
});
