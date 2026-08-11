# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jump-navigation.spec.ts >> Phase 4: 运营后台 CRUD 数据保存正确性 >> ADM-08 搜索管理页加载
- Location: tests\jump-navigation.spec.ts:658:3

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 2
Received:    0
```

# Test source

```ts
  564 |     const rows = page.locator('.el-table__row');
  565 |     expect(await rows.count()).toBeGreaterThanOrEqual(13);
  566 |   });
  567 | 
  568 |   test('ADM-02 功能页面管理 — builtin 不可删除按钮', async ({ page }) => {
  569 |     await page.goto('/admin.html#/admin/function-pages');
  570 |     await waitAppReady(page);
  571 |     await page.waitForTimeout(1500);
  572 |     // builtin 行的删除按钮应禁用或不显示
  573 |     const rows = page.locator('.el-table__row');
  574 |     if (await rows.count() > 0) {
  575 |       // 验证存在 builtin 类型（第一行通常为 builtin）
  576 |       const firstRowType = await rows.first().textContent();
  577 |       expect(firstRowType).toBeTruthy();
  578 |     }
  579 |   });
  580 | 
  581 |   test('ADM-03 金刚区管理页加载', async ({ page }) => {
  582 |     await page.goto('/admin.html#/admin/kingkong');
  583 |     await waitAppReady(page);
  584 |     await page.waitForTimeout(1500);
  585 |     const rows = page.locator('.el-table__row');
  586 |     expect(await rows.count()).toBeGreaterThanOrEqual(1);
  587 |   });
  588 | 
  589 |   test('ADM-04 金刚区管理 — function_page 入口 link 字段非空（B1 修复验证）', async ({ page }) => {
  590 |     await page.goto('/admin.html#/admin/kingkong');
  591 |     await waitAppReady(page);
  592 |     const result = await page.evaluate(() => {
  593 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  594 |       if (!app) return { hasStore: false };
  595 |       const functionPageKks = (app.kingKongs || []).filter((k: any) =>
  596 |         k.jump_type === 'function_page' && k.status === 'active'
  597 |       );
  598 |       const emptyLinkCount = functionPageKks.filter((k: any) => !k.link).length;
  599 |       return {
  600 |         hasStore: true,
  601 |         totalFunctionPageKks: functionPageKks.length,
  602 |         emptyLinkCount,
  603 |       };
  604 |     });
  605 |     expect(result.hasStore).toBe(true);
  606 |     if (result.totalFunctionPageKks > 0) {
  607 |       expect(result.emptyLinkCount, '运营后台金刚区 function_page 的 link 应全部非空').toBe(0);
  608 |     }
  609 |   });
  610 | 
  611 |   test('ADM-05 金刚区管理 — 筛选器含 function_page 选项（C1 修复验证）', async ({ page }) => {
  612 |     await page.goto('/admin.html#/admin/kingkong');
  613 |     await waitAppReady(page);
  614 |     const filterSelect = page.locator('select, .el-select').first();
  615 |     if (await filterSelect.count() > 0) {
  616 |       // 通过 evaluate 验证筛选选项
  617 |       const hasFunctionPageOption = await page.evaluate(() => {
  618 |         const options = Array.from(document.querySelectorAll('.el-select-dropdown__item'));
  619 |         return options.some(o => o.textContent?.includes('功能页面'));
  620 |       });
  621 |       // 若 dropdown 已渲染
  622 |       if (hasFunctionPageOption !== undefined) {
  623 |         expect(typeof hasFunctionPageOption).toBe('boolean');
  624 |       }
  625 |     }
  626 |   });
  627 | 
  628 |   test('ADM-06 广告位管理页加载', async ({ page }) => {
  629 |     await page.goto('/admin.html#/admin/ad-manage');
  630 |     await waitAppReady(page);
  631 |     await page.waitForTimeout(1500);
  632 |     const rows = page.locator('.el-table__row');
  633 |     expect(await rows.count()).toBeGreaterThanOrEqual(1);
  634 |   });
  635 | 
  636 |   test('ADM-07 广告位管理 — function_page Banner link 非空（B3 修复验证）', async ({ page }) => {
  637 |     await page.goto('/admin.html#/admin/ad-manage');
  638 |     await waitAppReady(page);
  639 |     const result = await page.evaluate(() => {
  640 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  641 |       if (!app) return { hasStore: false };
  642 |       const functionPageAds = (app.adBanners || []).filter((b: any) =>
  643 |         b.jump_type === 'function_page' && b.status === 'active'
  644 |       );
  645 |       const emptyLinkCount = functionPageAds.filter((b: any) => !b.link).length;
  646 |       return {
  647 |         hasStore: true,
  648 |         totalFunctionPageAds: functionPageAds.length,
  649 |         emptyLinkCount,
  650 |       };
  651 |     });
  652 |     expect(result.hasStore).toBe(true);
  653 |     if (result.totalFunctionPageAds > 0) {
  654 |       expect(result.emptyLinkCount, '运营后台 Banner function_page 的 link 应全部非空').toBe(0);
  655 |     }
  656 |   });
  657 | 
  658 |   test('ADM-08 搜索管理页加载', async ({ page }) => {
  659 |     await page.goto('/admin.html#/admin/search-manage');
  660 |     await waitAppReady(page);
  661 |     await page.waitForTimeout(1500);
  662 |     // 应有底纹词卡片
  663 |     const cards = page.locator('.el-card');
> 664 |     expect(await cards.count()).toBeGreaterThanOrEqual(2);
      |                                 ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  665 |   });
  666 | 
  667 |   test('ADM-09 搜索管理 — 自定义结果支持 function_page（A1+D1 修复验证）', async ({ page }) => {
  668 |     await page.goto('/admin.html#/admin/search-manage');
  669 |     await waitAppReady(page);
  670 |     const result = await page.evaluate(() => {
  671 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  672 |       const csrs = app?.customSearchResults || [];
  673 |       // 类型应允许 function_page（A1 修复后类型联合包含）
  674 |       return {
  675 |         totalCsrs: csrs.length,
  676 |         types: [...new Set(csrs.map((c: any) => c.jump_type))],
  677 |       };
  678 |     });
  679 |     expect(Array.isArray(result.types)).toBe(true);
  680 |   });
  681 | 
  682 |   test('ADM-10 租户后台项目金刚区管理页加载', async ({ page }) => {
  683 |     await page.goto('/tenant.html#/tenant/projects/proj-daily-01/kingkong');
  684 |     await waitAppReady(page);
  685 |     await page.waitForTimeout(1500);
  686 |     // 页面应加载（即使无数据）
  687 |     const pageTitle = page.locator('.page-title');
  688 |     if (await pageTitle.count() > 0) {
  689 |       expect(await pageTitle.textContent()).toContain('金刚区');
  690 |     }
  691 |   });
  692 | 
  693 |   test('ADM-11 租户后台项目 Banner 管理页加载', async ({ page }) => {
  694 |     await page.goto('/tenant.html#/tenant/projects/proj-daily-01/banner');
  695 |     await waitAppReady(page);
  696 |     await page.waitForTimeout(1500);
  697 |     const pageTitle = page.locator('.page-title');
  698 |     if (await pageTitle.count() > 0) {
  699 |       expect(await pageTitle.textContent()).toContain('Banner');
  700 |     }
  701 |   });
  702 | 
  703 |   test('ADM-12 租户后台金刚区 function_page link 非空（B2 修复验证）', async ({ page }) => {
  704 |     await page.goto('/tenant.html#/tenant/projects/proj-daily-01/kingkong');
  705 |     await waitAppReady(page);
  706 |     const result = await page.evaluate(() => {
  707 |       const projectStore = (window as any).__PINIA__?.state?.value?.['project-store'];
  708 |       if (!projectStore) return { hasStore: false };
  709 |       const projConfig = projectStore.homeConfigs?.find(
  710 |         (c: any) => c.project_id === 'proj-daily-01'
  711 |       );
  712 |       const qes = projConfig?.quick_entries || [];
  713 |       const functionPageQes = qes.filter((q: any) => q.jump_type === 'function_page');
  714 |       const emptyLinkCount = functionPageQes.filter((q: any) => !q.link).length;
  715 |       return {
  716 |         hasStore: true,
  717 |         totalFunctionPageQes: functionPageQes.length,
  718 |         emptyLinkCount,
  719 |       };
  720 |     });
  721 |     if (result.hasStore && result.totalFunctionPageQes > 0) {
  722 |       expect(result.emptyLinkCount, '租户后台金刚区 function_page 的 link 不应为空').toBe(0);
  723 |     }
  724 |   });
  725 | });
  726 | 
  727 | // ============================================================================
  728 | // Phase 5: 异常 & 边界（8 用例）
  729 | // ============================================================================
  730 | 
  731 | test.describe('Phase 5: 异常 & 边界处理', () => {
  732 |   test('EXC-01 page_id 不在注册表 → fallback 到首页', async ({ page }) => {
  733 |     await page.goto('/app.html#/app/home');
  734 |     await waitAppReady(page);
  735 |     // 通过 evaluate 调用 resolveFunctionPageRoute 验证 fallback
  736 |     const result = await page.evaluate(() => {
  737 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  738 |       // 模拟不存在的 page_id（通过 composable 的逻辑判断）
  739 |       const invalidPageId = 'fp-not-exists-xyz';
  740 |       const fp = app?.functionPages?.find((f: any) => f.page_id === invalidPageId);
  741 |       return {
  742 |         invalidPageFound: !!fp,
  743 |         // resolveFunctionPageRoute 应返回 /app/home
  744 |         expectedFallback: '/app/home',
  745 |       };
  746 |     });
  747 |     expect(result.invalidPageFound).toBe(false);
  748 |   });
  749 | 
  750 |   test('EXC-02 function_page 状态为 disabled → 不在 activeFunctionPages 中', async ({ page }) => {
  751 |     await page.goto('/app.html#/app/home');
  752 |     await waitAppReady(page);
  753 |     const result = await page.evaluate(() => {
  754 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  755 |       const allPages = app?.functionPages || [];
  756 |       const disabledPages = allPages.filter((f: any) => f.status === 'disabled');
  757 |       const activePages = allPages.filter((f: any) => f.status === 'active');
  758 |       return {
  759 |         totalAll: allPages.length,
  760 |         totalActive: activePages.length,
  761 |         totalDisabled: disabledPages.length,
  762 |       };
  763 |     });
  764 |     expect(result.totalAll).toBeGreaterThanOrEqual(result.totalActive);
```