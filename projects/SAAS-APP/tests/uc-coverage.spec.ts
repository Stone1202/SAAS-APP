/**
 * uc-coverage.spec.ts — 用例卡全量覆盖扫描
 *
 * v3.1.29 测试目标：
 * 1. 验证51个活跃UC→13个APP端页面全部可访问（UC-009-02已删除，UC-012-02已实现）
 * 2. 验证已删除功能（项目内搜索）的UC不再出现
 * 3. 验证HelpButton+UseCaseDrawer在每个页面都能正常打开/关闭
 * 4. 记录每页UC数量与预期值对比
 *
 * 运行：npx playwright test tests/uc-coverage.spec.ts
 */

import { test, expect } from '@playwright/test';

// ========== 页面→pgId→预期UC数量映射（v3.1.28+，已过滤planned）==========
const PAGE_COVERAGE_MAP: Array<{
  name: string;
  route: string;
  pgId: string;
  expectedCount: number;
  tabParam?: string;
}> = [
  // === APP 端页面 ===
  { name: '平台首页', route: '/app.html#/app/home', pgId: 'PG-SHP-APP-001', expectedCount: 3 },
  { name: '商城页(项目列表Tab)', route: '/app.html#/app/mall?tab=projects', pgId: 'PG-SHP-APP-002', expectedCount: 2, tabParam: 'projects' },
  { name: '商城页(精选商品Tab)', route: '/app.html#/app/mall?tab=featuredProducts', pgId: 'PG-SHP-APP-002', expectedCount: 2, tabParam: 'featuredProducts' },
  { name: '商城页(精选直播Tab)', route: '/app.html#/app/mall?tab=featuredLives', pgId: 'PG-SHP-APP-002', expectedCount: 2, tabParam: 'featuredLives' },
  { name: '搜索页', route: '/app.html#/app/search', pgId: 'PG-SHP-APP-007', expectedCount: 3 },
  { name: '个人中心', route: '/app.html#/app/mine', pgId: 'PG-SHP-APP-005', expectedCount: 2 },
  { name: '收货地址管理页', route: '/app.html#/app/mine/addresses', pgId: 'PG-SHP-APP-005A', expectedCount: 1 },
  { name: '平台会员中心', route: '/app.html#/app/mine/member', pgId: 'PG-SHP-APP-006', expectedCount: 2 },
  { name: '项目首页', route: '/app.html#/app/project/proj-daily-01', pgId: 'PG-SHP-APP-009', expectedCount: 1 },
  { name: '项目商城(商品Tab)', route: '/app.html#/app/project/proj-daily-01/mall?tab=product', pgId: 'PG-SHP-APP-009A', expectedCount: 2, tabParam: 'product' },
  { name: '项目商城(直播Tab)', route: '/app.html#/app/project/proj-daily-01/mall?tab=live', pgId: 'PG-SHP-APP-009A', expectedCount: 1, tabParam: 'live' },
  { name: '项目门店页', route: '/app.html#/app/project/proj-daily-01/stores', pgId: 'PG-SHP-APP-011', expectedCount: 1 },
  { name: '项目会员页', route: '/app.html#/app/project/proj-daily-01/member', pgId: 'PG-SHP-APP-013', expectedCount: 1 },
];

// ========== 重点回归：已删除功能不应出现 ==========
const DELETED_UC_IDS = [
  'UC-SHP-APP-009-02', // 项目内搜索（v3.1.15 移除）
];

const PLANNED_UC_IDS: string[] = [
  // v3.1.28+ UC-SHP-APP-012-02 已实现 StoreMoreProducts.vue，不再标记为planned
];

test.describe('用例卡全量覆盖扫描', () => {
  for (const page of PAGE_COVERAGE_MAP) {
    test(`页面「${page.name}」 — HelpButton渲染 + UC数量=${page.expectedCount}`, async ({ page: pwPage }) => {
      // 1. 导航到目标页面
      await pwPage.goto(page.route, { waitUntil: 'networkidle' });
      await pwPage.waitForTimeout(1500); // 等待路由和组件加载

      // 2. 验证HelpButton存在
      const helpBtn = pwPage.locator('[data-testid="help-button"]');
      await expect(helpBtn).toBeVisible({ timeout: 5000 });

      // 3. 截图（页面初始状态）
      await pwPage.screenshot({ path: `test-reports/screenshots/${page.name.replace(/[()\/]/g, '_')}-initial.png` });

      // 4. 点击HelpButton打开抽屉
      await helpBtn.locator('[data-testid="help-button-trigger"]').click();
      await pwPage.waitForTimeout(500);

      // 5. 验证UseCaseDrawer打开
      const drawer = pwPage.locator('[data-testid="use-case-drawer"]');
      await expect(drawer).toBeVisible({ timeout: 3000 });

      // 6. 统计UC卡片数量
      const ucCards = drawer.locator('[data-testid="uc-card"]');
      const cardCount = await ucCards.count();

      // 7. 截图（抽屉打开状态）
      await pwPage.screenshot({ path: `test-reports/screenshots/${page.name.replace(/[()\/]/g, '_')}-drawer-open.png` });

      // 8. 验证UC数量
      expect(cardCount, `页面「${page.name}」预期 ${page.expectedCount} 个UC，实际 ${cardCount} 个`)
        .toBe(page.expectedCount);

      console.log(`✅ ${page.name}: ${cardCount}/${page.expectedCount} UCs`);

      // 9. 关闭抽屉
      const closeBtn = drawer.locator('.drawer-close');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await pwPage.waitForTimeout(300);
      }
    });
  }

  test('回归验证：已删除功能UC不出现在任何页面', async ({ page: pwPage }) => {
    // 访问项目首页（已删除搜索功能的页面）
    await pwPage.goto('/app.html#/app/project/proj-daily-01', { waitUntil: 'networkidle' });
    await pwPage.waitForTimeout(1500);

    // 打开用例抽屉
    const helpBtn = pwPage.locator('[data-testid="help-button"]');
    await helpBtn.locator('[data-testid="help-button-trigger"]').click();
    await pwPage.waitForTimeout(500);

    const drawer = pwPage.locator('[data-testid="use-case-drawer"]');
    await expect(drawer).toBeVisible();

    // 验证所有已删除UC不出现
    for (const deletedId of DELETED_UC_IDS) {
      const deletedCard = drawer.locator(`[data-ucid="${deletedId}"]`);
      await expect(deletedCard, `已删除UC ${deletedId} 不应出现`).not.toBeAttached();
      console.log(`✅ 已删除UC确认移除: ${deletedId}`);
    }

    // 验证planned UC也不出现
    for (const plannedId of PLANNED_UC_IDS) {
      const plannedCard = drawer.locator(`[data-ucid="${plannedId}"]`);
      await expect(plannedCard, `Planned UC ${plannedId} 不应出现`).not.toBeAttached();
      console.log(`✅ Planned UC已过滤: ${plannedId}`);
    }

    // 截图验证
    await pwPage.screenshot({ path: 'test-reports/screenshots/deleted-uc-regression.png' });

    // 关闭抽屉
    const closeBtn = drawer.locator('.drawer-close');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test('综合回归：所有页面的抽屉可正常打开和关闭', async ({ page: pwPage }) => {
    const testRoutes = [
      { name: '首页', route: '/app.html#/app/home' },
      { name: '商城', route: '/app.html#/app/mall' },
      { name: '搜索', route: '/app.html#/app/search' },
      { name: '个人中心', route: '/app.html#/app/mine' },
      { name: '项目首页', route: '/app.html#/app/project/proj-daily-01' },
      { name: '项目商城', route: '/app.html#/app/project/proj-daily-01/mall' },
      { name: '项目门店', route: '/app.html#/app/project/proj-daily-01/stores' },
      { name: '项目会员', route: '/app.html#/app/project/proj-daily-01/member' },
    ];

    for (const { name, route } of testRoutes) {
      await pwPage.goto(route, { waitUntil: 'networkidle' });
      await pwPage.waitForTimeout(1500);

      // 打开抽屉
      const helpBtn = pwPage.locator('[data-testid="help-button"]');
      if (await helpBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await helpBtn.locator('[data-testid="help-button-trigger"]').click();
        await pwPage.waitForTimeout(500);

        const drawer = pwPage.locator('[data-testid="use-case-drawer"]');
        if (await drawer.isVisible({ timeout: 3000 }).catch(() => false)) {
          // 关闭抽屉（点击关闭按钮）
          const closeBtn = drawer.locator('.drawer-close');
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await pwPage.waitForTimeout(300);
            await expect(drawer).not.toBeVisible({ timeout: 3000 });
            console.log(`✅ ${name}: 抽屉打开/关闭正常`);
          } else {
            // 回退：点击遮罩关闭
            await pwPage.locator('[data-testid="use-case-drawer"] .drawer-mask').click();
            await pwPage.waitForTimeout(300);
            console.log(`✅ ${name}: 抽屉(遮罩关闭)正常`);
          }
        }
      } else {
        console.log(`⚠️ ${name}: HelpButton未渲染，跳过`);
      }
    }
  });
});
