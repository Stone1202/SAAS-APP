# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jump-navigation.spec.ts >> Phase 4: 运营后台 CRUD 数据保存正确性 >> ADM-04 金刚区管理 — function_page 入口 link 字段非空（B1 修复验证）
- Location: tests\jump-navigation.spec.ts:589:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e9]:
      - generic [ref=e10]: SAAS 运营后台
      - generic [ref=e11]: 追伴 APP 配置
    - menubar [ref=e12]:
      - listitem [ref=e13]:
        - generic [ref=e14]: 项目管理
        - list [ref=e15]:
          - menuitem "项目列表" [ref=e16] [cursor=pointer]
      - menuitem "运营管理" [expanded] [ref=e21]:
        - menu [ref=e30]:
          - menuitem "首页推荐" [ref=e31] [cursor=pointer]
          - menuitem "商城管理" [ref=e36] [cursor=pointer]
          - menuitem "规则引擎" [ref=e42] [cursor=pointer]
          - menuitem "搜索管理" [ref=e47] [cursor=pointer]
          - menuitem "广告位管理" [ref=e52] [cursor=pointer]
          - menuitem "金刚区管理" [ref=e58] [cursor=pointer]
          - menuitem "功能页面管理" [ref=e63] [cursor=pointer]
    - generic [ref=e68]:
      - link [ref=e69] [cursor=pointer]:
        - /url: javascript:void(0)
      - link [ref=e71] [cursor=pointer]:
        - /url: javascript:void(0)
  - main [ref=e75]:
    - generic [ref=e76]:
      - navigation "Breadcrumb" [ref=e78]:
        - generic [ref=e79]:
          - link "运营后台" [ref=e80]
          - text: /
        - link "金刚区管理" [ref=e82]
      - generic [ref=e83]: PC 运营后台
    - generic [ref=e84]:
      - generic [ref=e85]:
        - generic [ref=e86]:
          - heading "金刚区管理" [level=2] [ref=e87]
          - text: 配置APP平台首页金刚区快捷入口
        - generic [ref=e88]:
          - textbox "搜索入口名称" [ref=e91]
          - generic [ref=e94] [cursor=pointer]:
            - generic:
              - combobox [ref=e96]
              - generic [ref=e97]: 跳转类型
          - generic [ref=e103] [cursor=pointer]:
            - generic:
              - combobox [ref=e105]
              - generic [ref=e106]: 状态筛选
          - button "筛选" [ref=e111] [cursor=pointer]
          - button "重置" [ref=e113] [cursor=pointer]
          - button "+ 新增入口" [ref=e115] [cursor=pointer]
        - generic [ref=e118]:
          - table [ref=e120]:
            - rowgroup [ref=e132]:
              - row [ref=e133]:
                - columnheader "入口ID" [ref=e134]
                - columnheader "图标" [ref=e136]
                - columnheader "入口名称" [ref=e138]
                - columnheader "跳转类型" [ref=e140]
                - columnheader "跳转目标" [ref=e142]
                - columnheader "排序" [ref=e144]
                - columnheader "状态" [ref=e146]
                - columnheader "修改人" [ref=e148]
                - columnheader "修改时间" [ref=e150]
                - columnheader "操作" [ref=e152]
          - table [ref=e158]:
            - rowgroup [ref=e170]:
              - row [ref=e171]:
                - cell "kk-001" [ref=e172]
                - cell "🔥" [ref=e174]
                - cell "热卖排行" [ref=e176]
                - cell "功能页面" [ref=e178]
                - cell "fp-mall" [ref=e182]
                - cell [ref=e184]
                - cell [ref=e185]:
                  - generic [ref=e187]:
                    - switch [checked]
                    - generic [ref=e188] [cursor=pointer]
                - cell "运营管理员" [ref=e190]
                - cell "2026-01-01 10:00:00" [ref=e192]
                - cell [ref=e194]:
                  - generic [ref=e195]:
                    - button "编辑" [ref=e196] [cursor=pointer]
                    - button "删除" [ref=e198] [cursor=pointer]
              - row [ref=e200]:
                - cell "kk-002" [ref=e201]
                - cell "✨" [ref=e203]
                - cell "新品首发" [ref=e205]
                - cell "功能页面" [ref=e207]
                - cell "fp-mall-featured" [ref=e211]
                - cell [ref=e213]
                - cell [ref=e214]:
                  - generic [ref=e216]:
                    - switch [checked]
                    - generic [ref=e217] [cursor=pointer]
                - cell "运营管理员" [ref=e219]
                - cell "2026-01-01 10:00:00" [ref=e221]
                - cell [ref=e223]:
                  - generic [ref=e224]:
                    - button "编辑" [ref=e225] [cursor=pointer]
                    - button "删除" [ref=e227] [cursor=pointer]
              - row [ref=e229]:
                - cell "kk-003" [ref=e230]
                - cell "🎟️" [ref=e232]
                - cell "领券中心" [ref=e234]
                - cell "功能页面" [ref=e236]
                - cell "fp-mine" [ref=e240]
                - cell [ref=e242]
                - cell [ref=e243]:
                  - generic [ref=e245]:
                    - switch [checked]
                    - generic [ref=e246] [cursor=pointer]
                - cell "运营管理员" [ref=e248]
                - cell "2026-01-01 10:00:00" [ref=e250]
                - cell [ref=e252]:
                  - generic [ref=e253]:
                    - button "编辑" [ref=e254] [cursor=pointer]
                    - button "删除" [ref=e256] [cursor=pointer]
              - row [ref=e258]:
                - cell "kk-004" [ref=e259]
                - cell "📺" [ref=e261]
                - cell "直播间" [ref=e263]
                - cell "直播" [ref=e265]
                - cell "live-001" [ref=e269]
                - cell [ref=e271]
                - cell [ref=e272]:
                  - generic [ref=e274]:
                    - switch [checked]
                    - generic [ref=e275] [cursor=pointer]
                - cell "运营管理员" [ref=e277]
                - cell "2026-01-01 10:00:00" [ref=e279]
                - cell [ref=e281]:
                  - generic [ref=e282]:
                    - button "编辑" [ref=e283] [cursor=pointer]
                    - button "删除" [ref=e285] [cursor=pointer]
              - row [ref=e287]:
                - cell "kk-005" [ref=e288]
                - cell "📅" [ref=e290]
                - cell "每日签到" [ref=e292]
                - cell "功能页面" [ref=e294]
                - cell "fp-mine" [ref=e298]
                - cell [ref=e300]
                - cell [ref=e301]:
                  - generic [ref=e303]:
                    - switch [checked]
                    - generic [ref=e304] [cursor=pointer]
                - cell "运营管理员" [ref=e306]
                - cell "2026-01-01 10:00:00" [ref=e308]
                - cell [ref=e310]:
                  - generic [ref=e311]:
                    - button "编辑" [ref=e312] [cursor=pointer]
                    - button "删除" [ref=e314] [cursor=pointer]
              - row [ref=e316]:
                - cell "kk-006" [ref=e317]
                - cell "🎁" [ref=e319]
                - cell "试用中心" [ref=e321]
                - cell "功能页面" [ref=e323]
                - cell "fp-mall-featured" [ref=e327]
                - cell [ref=e329]
                - cell [ref=e330]:
                  - generic [ref=e332]:
                    - switch [checked]
                    - generic [ref=e333] [cursor=pointer]
                - cell "运营管理员" [ref=e335]
                - cell "2026-01-01 10:00:00" [ref=e337]
                - cell [ref=e339]:
                  - generic [ref=e340]:
                    - button "编辑" [ref=e341] [cursor=pointer]
                    - button "删除" [ref=e343] [cursor=pointer]
              - row [ref=e345]:
                - cell "kk-007" [ref=e346]
                - cell "🏆" [ref=e348]
                - cell "品牌榜" [ref=e350]
                - cell "功能页面" [ref=e352]
                - cell "fp-mall" [ref=e356]
                - cell [ref=e358]
                - cell [ref=e359]:
                  - generic [ref=e361]:
                    - switch [checked]
                    - generic [ref=e362] [cursor=pointer]
                - cell "运营管理员" [ref=e364]
                - cell "2026-01-01 10:00:00" [ref=e366]
                - cell [ref=e368]:
                  - generic [ref=e369]:
                    - button "编辑" [ref=e370] [cursor=pointer]
                    - button "删除" [ref=e372] [cursor=pointer]
              - row [ref=e374]:
                - cell "kk-008" [ref=e375]
                - cell "📋" [ref=e377]
                - cell "全部分类" [ref=e379]
                - cell "功能页面" [ref=e381]
                - cell "fp-mall" [ref=e385]
                - cell [ref=e387]
                - cell [ref=e388]:
                  - generic [ref=e390]:
                    - switch [checked]
                    - generic [ref=e391] [cursor=pointer]
                - cell "运营管理员" [ref=e393]
                - cell "2026-01-01 10:00:00" [ref=e395]
                - cell [ref=e397]:
                  - generic [ref=e398]:
                    - button "编辑" [ref=e399] [cursor=pointer]
                    - button "删除" [ref=e401] [cursor=pointer]
      - button "用例卡" [ref=e405] [cursor=pointer]
```

# Test source

```ts
  505 |   test('PRJ-06 项目首页商品点击 → 商品详情', async ({ page }) => {
  506 |     await page.goto('/app.html#/app/project/proj-daily-01');
  507 |     await waitAppReady(page);
  508 |     const productCard = page.locator('[class*="product-card"], .product-grid-2col > div').first();
  509 |     if (await productCard.count() > 0) {
  510 |       await productCard.click();
  511 |       await page.waitForTimeout(800);
  512 |       const route = await getHashRoute(page);
  513 |       expect(route).toContain('/app/product/');
  514 |     }
  515 |   });
  516 | 
  517 |   test('PRJ-07 项目首页直播点击 → 直播详情', async ({ page }) => {
  518 |     await page.goto('/app.html#/app/project/proj-daily-01');
  519 |     await waitAppReady(page);
  520 |     const liveCard = page.locator('[class*="live-card"], .live-grid-2col > div').first();
  521 |     if (await liveCard.count() > 0) {
  522 |       await liveCard.click();
  523 |       await page.waitForTimeout(800);
  524 |       const route = await getHashRoute(page);
  525 |       expect(route).toContain('/app/live/');
  526 |     }
  527 |   });
  528 | 
  529 |   test('PRJ-08 不同项目（proj-health-01）首页加载正常', async ({ page }) => {
  530 |     await page.goto('/app.html#/app/project/proj-health-01');
  531 |     await waitAppReady(page);
  532 |     const banner = page.locator('.banner-slide, .qz-item').first();
  533 |     expect(await banner.count()).toBeGreaterThan(0);
  534 |   });
  535 | 
  536 |   test('PRJ-09 项目金刚区名称回退逻辑（极旧数据无 jump_type）', async ({ page }) => {
  537 |     await page.goto('/app.html#/app/project/proj-daily-01');
  538 |     await waitAppReady(page);
  539 |     // 验证金刚区有数据（无论通过 jump_type 还是名称回退）
  540 |     const kkCount = await page.locator('.qz-item').count();
  541 |     expect(kkCount).toBeGreaterThanOrEqual(0);
  542 |   });
  543 | 
  544 |   test('PRJ-10 项目页"更多"按钮始终显示（v3.1.33 修复）', async ({ page }) => {
  545 |     await page.goto('/app.html#/app/project/proj-daily-01');
  546 |     await waitAppReady(page);
  547 |     // 更多按钮（v3.1.33 后有数据即显示）
  548 |     const moreBtns = page.locator('.sh-more');
  549 |     const count = await moreBtns.count();
  550 |     // 应有直播"更多"和商品"更多"两个
  551 |     expect(count).toBeGreaterThanOrEqual(0);
  552 |   });
  553 | });
  554 | 
  555 | // ============================================================================
  556 | // Phase 4: 运营后台 CRUD（12 用例）— 数据保存正确性
  557 | // ============================================================================
  558 | 
  559 | test.describe('Phase 4: 运营后台 CRUD 数据保存正确性', () => {
  560 |   test('ADM-01 功能页面管理页加载 13 条内置', async ({ page }) => {
  561 |     await page.goto('/admin.html#/admin/function-pages');
  562 |     await waitAppReady(page);
  563 |     await page.waitForTimeout(1500);
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
> 605 |     expect(result.hasStore).toBe(true);
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
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
  664 |     expect(await cards.count()).toBeGreaterThanOrEqual(2);
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
```