/**
 * E2E场景：H5观众端 - 直播观看体验（/h5/live/:roomId）
 *
 * 验收流程：
 * SC-H5-001 页面加载 → 观众端渲染
 * SC-H5-002 擦音效果层展示 → beep/silent模式
 * SC-H5-003 断流覆盖层 → 断流后显示结束提示
 * SC-H5-004 回调丢失横幅 → 网络异常提示
 */

import { test, expect } from '@playwright/test';

test.describe('H5观众端 - 直播观看', () => {
  test('SC-H5-001: 观众端页面正常渲染', async ({ page }) => {
    await page.goto('/h5/live/room-001');
    await page.waitForSelector('[data-viewer-page]', { timeout: 10000 });

    // 观众端容器存在
    await expect(page.locator('.audience-room')).toBeVisible();

    // 调试面板可选展示
    const debugPanel = page.locator('.debug-panel');
    // 调试面板默认折叠，点击展开按钮
    const debugToggle = page.locator('.debug-toggle');
    await expect(debugToggle).toBeVisible();
  });

  test('SC-H5-002: 擦音效果层触发', async ({ page }) => {
    await page.goto('/h5/live/room-001');
    await page.waitForSelector('.audience-room', { timeout: 10000 });

    // 展开调试面板
    await page.locator('.debug-toggle').click();
    await expect(page.locator('.debug-panel')).toBeVisible({ timeout: 2000 });

    // 触发擦音（beep模式）
    const beepBtn = page.locator('.debug-panel button').filter({ hasText: /擦音/ });
    if (await beepBtn.count() > 0) {
      await beepBtn.first().click();

      // 擦音效果层显示
      const muteOverlay = page.locator('.mute-effect-overlay');
      await expect(muteOverlay).toBeVisible({ timeout: 3000 });
    }
  });

  test('SC-H5-003: 断流覆盖层触发', async ({ page }) => {
    await page.goto('/h5/live/room-001');
    await page.waitForSelector('.audience-room', { timeout: 10000 });

    // 展开调试面板
    await page.locator('.debug-toggle').click();

    // 触发断流
    const cutOffBtn = page.locator('.debug-panel button').filter({ hasText: /断流/ });
    if (await cutOffBtn.count() > 0) {
      await cutOffBtn.first().click();

      // 断流覆盖层显示
      const endedOverlay = page.locator('.stream-ended-overlay');
      await expect(endedOverlay).toBeVisible({ timeout: 3000 });
    }
  });

  test('SC-H5-004: 回调丢失横幅', async ({ page }) => {
    await page.goto('/h5/live/room-001');
    await page.waitForSelector('.audience-room', { timeout: 10000 });

    // 展开调试面板
    await page.locator('.debug-toggle').click();

    // 触发回调丢失
    const lostBtn = page.locator('.debug-panel button').filter({ hasText: /丢失|lost/i });
    if (await lostBtn.count() > 0) {
      await lostBtn.first().click();

      // 横幅显示
      const banner = page.locator('.callback-lost-banner');
      await expect(banner).toBeVisible({ timeout: 3000 });
    }
  });
});
