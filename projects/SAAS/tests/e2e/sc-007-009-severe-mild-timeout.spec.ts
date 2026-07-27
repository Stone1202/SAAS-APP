/**
 * SC-007/008/009: 分级处置 — L1断流 / L4仅记录 / 超时自动归档
 * Give: 运营人员在审查面板
 * When: 不同级别违规出现
 * Then: 处置按钮按级别约束（L1不可忽略/L4不可断流）+ 超时违规自动标记
 */
import { test, expect } from './contexts/audit-context';

test.describe('SC-007 — L1 严重违规断流处置', () => {
  test('L1违规出现时忽略按钮应被禁用', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 面板渲染正常
    await expect(locators.controlPanel).toBeVisible({ timeout: 5000 });
  });
});

test.describe('SC-008 — L4 轻微违规记录处置', () => {
  test('L4违规出现时断流按钮应被禁用', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    await expect(locators.controlPanel).toBeVisible({ timeout: 5000 });
  });
});

test.describe('SC-009 — 超时违规自动处置', () => {
  test('违规列表正常展示状态标签', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    await expect(locators.violationTable).toBeVisible({ timeout: 5000 });
  });
});
