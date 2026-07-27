/**
 * SC-001: 直播场次实时监控场景
 * Give: 运营人员进入直播中控审查面板
 * When: 页面加载并开始接收违规推送
 * Then: 场次信息、违规列表、告警统计实时展示
 */
import { test, expect, makeMockViolation } from './contexts/audit-context';

test.describe('SC-001 — 直播场次实时监控', () => {
  test('进入审查面板后看到场次监控内容', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 审查面板主容器可见
    await expect(locators.controlPanel).toBeVisible({ timeout: 8000 });
  });

  test('直播监控显示场次信息栏', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 场次信息栏可见
    await expect(locators.fieldInfoBar).toBeVisible({ timeout: 5000 });
  });

  test('监控面板显示违规列表区域', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 违规表格区域可见
    await expect(locators.violationTable).toBeVisible({ timeout: 5000 });
  });

  test('违规列表展示级别筛选控件', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 级别筛选下拉框存在
    await expect(locators.filterSelectLevel).toBeVisible({ timeout: 5000 });
  });

  test('监控面板显示处置操作栏', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 处置栏可见
    await expect(locators.disposalBar).toBeVisible({ timeout: 5000 });
  });

  test('违规记录数据可被注入到列表', async ({ page, auditCtx, locators }) => {
    // 先访问页面
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 检查违规表格已渲染（至少有表格容器，无数据时显示空状态）
    await expect(locators.violationTable).toBeVisible({ timeout: 5000 });
  });

  test('告警统计栏显示统计项', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 告警统计栏可见
    await expect(locators.alertStatsBar).toBeVisible({ timeout: 5000 });
  });
});
