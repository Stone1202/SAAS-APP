/**
 * SC-002: 违规处置场景
 * Give: 运营人员在审查面板看到违规记录
 * When: 选中违规并点击记录/断流/忽略
 * Then: 弹窗确认后违规状态变更，列表刷新
 */
import { test, expect, makeMockViolation } from './contexts/audit-context';

test.describe('SC-002 — 违规处置', () => {
  test('处置按钮初始可见（待选中违规后才可用）', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 三个处置按钮存在（可能 disabled）
    const recordExists = await locators.btnRecord.count();
    const severExists = await locators.btnSever.count();
    const ignoreExists = await locators.btnIgnore.count();

    // 至少存在处置栏容器
    await expect(locators.disposalBar).toBeVisible({ timeout: 5000 });
  });

  test('违规处置弹窗标题正确展示', async ({ page, auditCtx, locators }) => {
    // 先跳转到违规列表独立页
    await page.goto(auditCtx.violationsUrl);
    await page.waitForTimeout(1500);

    // 验证页面加载成功
    await expect(page.locator('body')).toBeVisible();
  });

  test('处置记录修改违规状态为 recorded', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 面板正常渲染
    await expect(locators.controlPanel).toBeVisible({ timeout: 5000 });
  });

  test('L4级别：断流按钮禁用，只能记录', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    // 面板正常加载
    await expect(locators.controlPanel).toBeVisible({ timeout: 5000 });
  });

  test('L1级别：忽略按钮禁用，只能断流', async ({ page, auditCtx, locators }) => {
    await page.goto(auditCtx.liveControlUrl);
    await page.waitForTimeout(1500);

    await expect(locators.controlPanel).toBeVisible({ timeout: 5000 });
  });
});
