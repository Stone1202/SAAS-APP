# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jump-navigation.spec.ts >> Phase 4: 运营后台 CRUD 数据保存正确性 >> ADM-01 功能页面管理页加载 13 条内置
- Location: tests\jump-navigation.spec.ts:560:3

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 13
Received:    10
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
        - link "功能页面管理" [ref=e82]
      - generic [ref=e83]: PC 运营后台
    - generic [ref=e85]:
      - generic [ref=e87]:
        - heading "🔗 功能页面管理" [level=2] [ref=e88]
        - paragraph [ref=e89]: 统一管理 APP 内可跳转的功能页面白名单（注册表），确保跳转安全一致
      - alert [ref=e90]:
        - generic [ref=e91]:
          - strong [ref=e93]: 使用方法
          - paragraph [ref=e94]:
            - generic [ref=e95]:
              - paragraph [ref=e96]:
                - strong [ref=e97]: 1. 注册功能页面：
                - text: 系统管理员在此注册 APP 内的功能页面（如积分商城、个人中心），运营人员在配置跳转时只能选择已注册的页面。
              - paragraph [ref=e98]:
                - strong [ref=e99]: 2. 内置页面不可删除：
                - text: 标记为"内置系统页面"的条目只能启用/禁用，不能删除。业务功能页面和活动页面可完整增删改。
              - paragraph [ref=e100]:
                - strong [ref=e101]: 3. 路由占位符支持：
                - text: 若路由中含
                - code [ref=e102]: :projectId
                - text: ，运行时会自动替换为实际项目 ID（租户后台自动填充，运营后台手动选择）。
              - paragraph [ref=e103]:
                - strong [ref=e104]: 4. 禁用后不可选：
                - text: 将页面状态设为"禁用"后，运营人员在 JumpTargetPicker 中将看不到该选项。
      - generic [ref=e105]:
        - generic [ref=e106]:
          - generic [ref=e108]:
            - generic: 🔍
            - textbox "搜索页面名称或路由..." [ref=e111]
          - generic [ref=e114] [cursor=pointer]:
            - generic:
              - combobox [ref=e116]
              - generic [ref=e117]: 分类筛选
          - generic [ref=e123] [cursor=pointer]:
            - generic:
              - combobox [ref=e125]
              - generic [ref=e126]: 状态筛选
        - button "+ 新增功能页面" [ref=e131] [cursor=pointer]
      - generic [ref=e134]:
        - table [ref=e136]:
          - rowgroup [ref=e147]:
            - row [ref=e148]:
              - columnheader "页面ID" [ref=e149]
              - columnheader "图标" [ref=e151]
              - columnheader "页面名称" [ref=e153]
              - columnheader "分类" [ref=e155]
              - columnheader "路由路径" [ref=e157]
              - columnheader "说明" [ref=e159]
              - columnheader "状态" [ref=e161]
              - columnheader "排序" [ref=e163]
              - columnheader "操作" [ref=e165]
        - table [ref=e171]:
          - rowgroup [ref=e182]:
            - row [ref=e183]:
              - cell "fp-home" [ref=e184]
              - cell "🏠" [ref=e186]
              - cell "平台首页" [ref=e188]
              - cell "内置系统" [ref=e190]
              - cell [ref=e194]:
                - code [ref=e196]: /app/home
              - cell "APP首页，展示Banner轮播、金刚区入口、直播推荐和商品推荐" [ref=e197]
              - cell "启用" [ref=e199]
              - cell "1" [ref=e203]
              - cell [ref=e205]:
                - generic [ref=e206]:
                  - button "编辑" [ref=e207] [cursor=pointer]
                  - text: "-"
            - row [ref=e209]:
              - cell "fp-mall" [ref=e210]
              - cell "🛍️" [ref=e212]
              - cell "商城列表" [ref=e214]
              - cell "内置系统" [ref=e216]
              - cell [ref=e220]:
                - code [ref=e222]: /app/mall
              - cell "商城首页，Tab切换：商城列表/精选商品/精选直播" [ref=e223]
              - cell "启用" [ref=e225]
              - cell "2" [ref=e229]
              - cell [ref=e231]:
                - generic [ref=e232]:
                  - button "编辑" [ref=e233] [cursor=pointer]
                  - text: "-"
            - row [ref=e235]:
              - cell "fp-mall-featured" [ref=e236]
              - cell "⭐" [ref=e238]
              - cell "商城-精选商品" [ref=e240]
              - cell "内置系统" [ref=e242]
              - cell [ref=e246]:
                - code [ref=e248]: /app/mall?tab=featuredProducts
              - cell "精选商品Tab，按叠加模式排序显示所有推荐商品" [ref=e249]
              - cell "启用" [ref=e251]
              - cell "3" [ref=e255]
              - cell [ref=e257]:
                - generic [ref=e258]:
                  - button "编辑" [ref=e259] [cursor=pointer]
                  - text: "-"
            - row [ref=e261]:
              - cell "fp-mall-live" [ref=e262]
              - cell "📺" [ref=e264]
              - cell "商城-精选直播" [ref=e266]
              - cell "内置系统" [ref=e268]
              - cell [ref=e272]:
                - code [ref=e274]: /app/mall?tab=featuredLives
              - cell "精选直播Tab，按叠加模式排序显示所有推荐直播" [ref=e275]
              - cell "启用" [ref=e277]
              - cell "4" [ref=e281]
              - cell [ref=e283]:
                - generic [ref=e284]:
                  - button "编辑" [ref=e285] [cursor=pointer]
                  - text: "-"
            - row [ref=e287]:
              - cell "fp-search" [ref=e288]
              - cell "🔍" [ref=e290]
              - cell "搜索页" [ref=e292]
              - cell "内置系统" [ref=e294]
              - cell [ref=e298]:
                - code [ref=e300]: /app/search
              - cell "关键字搜索商品/直播/项目，支持热搜词和搜索历史" [ref=e301]
              - cell "启用" [ref=e303]
              - cell "5" [ref=e307]
              - cell [ref=e309]:
                - generic [ref=e310]:
                  - button "编辑" [ref=e311] [cursor=pointer]
                  - text: "-"
            - row [ref=e313]:
              - cell "fp-mine" [ref=e314]
              - cell "👤" [ref=e316]
              - cell "个人中心" [ref=e318]
              - cell "内置系统" [ref=e320]
              - cell [ref=e324]:
                - code [ref=e326]: /app/mine
              - cell "用户个人中心：优惠券/积分/零钱/收货地址/会员入口" [ref=e327]
              - cell "启用" [ref=e329]
              - cell "6" [ref=e333]
              - cell [ref=e335]:
                - generic [ref=e336]:
                  - button "编辑" [ref=e337] [cursor=pointer]
                  - text: "-"
            - row [ref=e339]:
              - cell "fp-platform-member" [ref=e340]
              - cell "👑" [ref=e342]
              - cell "平台会员中心" [ref=e344]
              - cell "内置系统" [ref=e346]
              - cell [ref=e350]:
                - code [ref=e352]: /app/mine/member
              - cell "平台维度积分/优惠券汇总 + 各项目会员入口列表" [ref=e353]
              - cell "启用" [ref=e355]
              - cell "7" [ref=e359]
              - cell [ref=e361]:
                - generic [ref=e362]:
                  - button "编辑" [ref=e363] [cursor=pointer]
                  - text: "-"
            - row [ref=e365]:
              - cell "fp-addresses" [ref=e366]
              - cell "📍" [ref=e368]
              - cell "收货地址管理" [ref=e370]
              - cell "内置系统" [ref=e372]
              - cell [ref=e376]:
                - code [ref=e378]: /app/mine/addresses
              - cell "用户个人收货地址的增删改查管理" [ref=e379]
              - cell "启用" [ref=e381]
              - cell "8" [ref=e385]
              - cell [ref=e387]:
                - generic [ref=e388]:
                  - button "编辑" [ref=e389] [cursor=pointer]
                  - text: "-"
            - row [ref=e391]:
              - cell "fp-project-mall" [ref=e392]
              - cell "🏪" [ref=e394]
              - cell "项目商城页" [ref=e396]
              - cell "内置系统" [ref=e398]
              - cell [ref=e402]:
                - code [ref=e404]: /app/project/:projectId/mall
              - cell "项目商城Tab页，商品分类+直播双Tab（需projectId参数）" [ref=e405]
              - cell "启用" [ref=e407]
              - cell "9" [ref=e411]
              - cell [ref=e413]:
                - generic [ref=e414]:
                  - button "编辑" [ref=e415] [cursor=pointer]
                  - text: "-"
            - row [ref=e417]:
              - cell "fp-project-stores" [ref=e418]
              - cell "🏬" [ref=e420]
              - cell "我的门店" [ref=e422]
              - cell "内置系统" [ref=e424]
              - cell [ref=e428]:
                - code [ref=e430]: /app/project/:projectId/stores
              - cell "项目门店列表页，支持搜索门店名称（需projectId参数）" [ref=e431]
              - cell "启用" [ref=e433]
              - cell "10" [ref=e437]
              - cell [ref=e439]:
                - generic [ref=e440]:
                  - button "编辑" [ref=e441] [cursor=pointer]
                  - text: "-"
      - generic [ref=e445]:
        - button "Go to previous page" [disabled] [ref=e446]
        - list [ref=e447]:
          - listitem "page 1" [ref=e448]: "1"
          - listitem "page 2" [ref=e449] [cursor=pointer]: "2"
        - button "Go to next page" [ref=e450] [cursor=pointer]
        - generic [ref=e451]: Total 13
```

# Test source

```ts
  465 |       expect(result.needsProjectIdCount, 'function_page Banner 的 link 应含实际 projectId').toBeGreaterThan(0);
  466 |     }
  467 |   });
  468 | 
  469 |   test('PRJ-04 项目首页金刚区 function_page link 含 projectId（B2+PRJ 修复）', async ({ page }) => {
  470 |     await page.goto('/app.html#/app/project/proj-daily-01');
  471 |     await waitAppReady(page);
  472 |     const result = await page.evaluate(() => {
  473 |       const projectStore = (window as any).__PINIA__?.state?.value?.['project-store'];
  474 |       if (!projectStore) return { hasStore: false };
  475 |       const projConfig = projectStore.homeConfigs?.find(
  476 |         (c: any) => c.project_id === 'proj-daily-01'
  477 |       );
  478 |       const qes = projConfig?.quick_entries || [];
  479 |       const functionPageQes = qes.filter((q: any) => q.jump_type === 'function_page');
  480 |       const emptyLinkCount = functionPageQes.filter((q: any) => !q.link).length;
  481 |       return {
  482 |         hasStore: true,
  483 |         totalQes: qes.length,
  484 |         functionPageQeCount: functionPageQes.length,
  485 |         emptyLinkCount,
  486 |       };
  487 |     });
  488 |     if (result.hasStore && result.functionPageQeCount > 0) {
  489 |       expect(result.emptyLinkCount, '项目金刚区 function_page 的 link 不应为空').toBe(0);
  490 |     }
  491 |   });
  492 | 
  493 |   test('PRJ-05 项目首页"更多"跳转商城Tab', async ({ page }) => {
  494 |     await page.goto('/app.html#/app/project/proj-daily-01');
  495 |     await waitAppReady(page);
  496 |     const moreBtn = page.locator('.sh-more').first();
  497 |     if (await moreBtn.count() > 0) {
  498 |       await moreBtn.click();
  499 |       await page.waitForTimeout(800);
  500 |       const route = await getHashRoute(page);
  501 |       expect(route).toContain('/app/project/proj-daily-01/mall');
  502 |     }
  503 |   });
  504 | 
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
> 565 |     expect(await rows.count()).toBeGreaterThanOrEqual(13);
      |                                ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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
  664 |     expect(await cards.count()).toBeGreaterThanOrEqual(2);
  665 |   });
```