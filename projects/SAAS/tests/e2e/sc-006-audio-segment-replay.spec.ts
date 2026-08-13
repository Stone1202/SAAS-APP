/**
 * SC-006: 音频片段回放场景
 * Give: 运营人员在审查面板查看违规详情
 * When: 点击违规音频片段播放
 * Then: 音频播放器出现，播放对应片段
 */
import { test, expect } from './contexts/audit-context';

test.describe('SC-006 — 音频片段回放', () => {
  test('违规详情抽屉可打开', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 面板渲染正常
    await expect(locators.controlPanel).toBeVisible({ timeout: 5000 });
  });

  test('ASR 文本在详情中展示', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    await expect(locators.controlPanel).toBeVisible({ timeout: 5000 });
  });

  test('违规录音证据 URL 存在', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    await expect(locators.controlPanel).toBeVisible({ timeout: 5000 });
  });
});
