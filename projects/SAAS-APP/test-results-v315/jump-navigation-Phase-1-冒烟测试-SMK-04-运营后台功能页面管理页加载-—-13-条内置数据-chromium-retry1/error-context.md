# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jump-navigation.spec.ts >> Phase 1: 冒烟测试 >> SMK-04 运营后台功能页面管理页加载 — 13 条内置数据
- Location: tests\jump-navigation.spec.ts:90:3

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
  1   | /**
  2   |  * jump-navigation.spec.ts — APP 端跳转体系全量覆盖测试
  3   |  *
  4   |  * v3.1.45 测试目标：
  5   |  *   验证修复后跳转体系（5 种 jump_type + link fallback + url 兼容 + :projectId 替换 + query 解析）
  6   |  *   覆盖 6 个 Phase 共 48 个用例：
  7   |  *     Phase 1: 冒烟测试 (10)
  8   |  *     Phase 2: 平台 APP 跳转 (14)
  9   |  *     Phase 3: 项目维度跳转 (10)
  10  |  *     Phase 4: 运营后台 CRUD (12)
  11  |  *     Phase 5: 异常 & 边界 (8)
  12  |  *     Phase 6: 回归测试 (4)
  13  |  *
  14  |  * 修复对应：
  15  |  *   B1/B2/B3 (link 被清空) → Phase 2/3 + Phase 4 ADM-06~12
  16  |  *   A1 (CustomSearchResult 类型) → Phase 2 FNC-14
  17  |  *   A2/A3 (默认 jump_type) → Phase 4
  18  |  *   D1/D2 (验证逻辑) → Phase 4
  19  |  *   C1-C4 (标签函数) → Phase 4
  20  |  *   E1 (localStorage 迁移) → Phase 5 EXC-04
  21  |  *   AR04 (composable 统一) → Phase 2/3
  22  |  *
  23  |  * 运行：npx playwright test tests/jump-navigation.spec.ts
  24  |  */
  25  | 
  26  | import { test, expect } from '@playwright/test';
  27  | 
  28  | // ========== 辅助：等待页面加载完成 ==========
  29  | async function waitAppReady(pwPage: import('@playwright/test').Page) {
  30  |   await pwPage.waitForLoadState('networkidle');
  31  |   await pwPage.waitForTimeout(1000);
  32  | }
  33  | 
  34  | // ========== 辅助：获取当前 hash 路由 ==========
  35  | async function getHashRoute(pwPage: import('@playwright/test').Page): Promise<string> {
  36  |   return await pwPage.evaluate(() => window.location.hash);
  37  | }
  38  | 
  39  | // ============================================================================
  40  | // Phase 1: 冒烟测试（10 用例）— 验证核心路径不崩
  41  | // ============================================================================
  42  | 
  43  | test.describe('Phase 1: 冒烟测试', () => {
  44  |   test('SMK-01 平台首页加载 — Banner+金刚区渲染+无控制台错误', async ({ page }) => {
  45  |     const errors: string[] = [];
  46  |     page.on('pageerror', (e) => errors.push(e.message));
  47  |     await page.goto('/app.html#/app/home');
  48  |     await waitAppReady(page);
  49  |     await page.waitForTimeout(1500);
  50  | 
  51  |     // Banner 至少 1 条
  52  |     const banners = page.locator('.banner-slide, [class*="banner"]');
  53  |     await expect(banners.first()).toBeVisible({ timeout: 5000 });
  54  | 
  55  |     // 金刚区至少 4 个入口
  56  |     const kkItems = page.locator('.kk-item, [class*="kingkong"] > div');
  57  |     expect(await kkItems.count()).toBeGreaterThanOrEqual(4);
  58  | 
  59  |     // 无 JS 错误
  60  |     expect(errors).toEqual([]);
  61  |   });
  62  | 
  63  |   test('SMK-02 平台首页 Banner 点击 — 不报错且发生路由变化', async ({ page }) => {
  64  |     await page.goto('/app.html#/app/home');
  65  |     await waitAppReady(page);
  66  |     const initialRoute = await getHashRoute(page);
  67  | 
  68  |     const firstBanner = page.locator('.banner-slide, [class*="banner-slide"]').first();
  69  |     if (await firstBanner.count() > 0) {
  70  |       await firstBanner.click();
  71  |       await page.waitForTimeout(800);
  72  |       const newRoute = await getHashRoute(page);
  73  |       // 路由应改变或保持（点击事件触发）
  74  |       expect(typeof newRoute).toBe('string');
  75  |     }
  76  |   });
  77  | 
  78  |   test('SMK-03 平台首页金刚区第一项可点击', async ({ page }) => {
  79  |     await page.goto('/app.html#/app/home');
  80  |     await waitAppReady(page);
  81  |     const firstKk = page.locator('.kk-item').first();
  82  |     if (await firstKk.count() > 0) {
  83  |       await firstKk.click();
  84  |       await page.waitForTimeout(500);
  85  |       const route = await getHashRoute(page);
  86  |       expect(route).toContain('/app/');
  87  |     }
  88  |   });
  89  | 
  90  |   test('SMK-04 运营后台功能页面管理页加载 — 13 条内置数据', async ({ page }) => {
  91  |     await page.goto('/admin.html#/admin/function-pages');
  92  |     await waitAppReady(page);
  93  |     await page.waitForTimeout(1500);
  94  | 
  95  |     // 表格行数 ≥ 13
  96  |     const rows = page.locator('.el-table__row');
> 97  |     expect(await rows.count()).toBeGreaterThanOrEqual(13);
      |                                ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  98  |   });
  99  | 
  100 |   test('SMK-05 项目首页加载 — Banner+金刚区渲染', async ({ page }) => {
  101 |     await page.goto('/app.html#/app/project/proj-daily-01');
  102 |     await waitAppReady(page);
  103 |     await page.waitForTimeout(1500);
  104 | 
  105 |     // 项目首页应有 Banner 或金刚区
  106 |     const hasContent = await page.locator('.banner-slide, .qz-item, [class*="quick"]').first().isVisible();
  107 |     expect(hasContent).toBeTruthy();
  108 |   });
  109 | 
  110 |   test('SMK-06 搜索页加载无错误', async ({ page }) => {
  111 |     const errors: string[] = [];
  112 |     page.on('pageerror', (e) => errors.push(e.message));
  113 |     await page.goto('/app.html#/app/search');
  114 |     await waitAppReady(page);
  115 |     expect(errors).toEqual([]);
  116 |   });
  117 | 
  118 |   test('SMK-07 商城页加载 — Tab 切换', async ({ page }) => {
  119 |     await page.goto('/app.html#/app/mall');
  120 |     await waitAppReady(page);
  121 |     // 至少存在 Tab 容器
  122 |     const tabs = page.locator('[class*="tab"], .mall-tab, [role="tab"]');
  123 |     expect(await tabs.count()).toBeGreaterThan(0);
  124 |   });
  125 | 
  126 |   test('SMK-08 直播详情独立路由加载', async ({ page }) => {
  127 |     await page.goto('/app.html#/app/live/live-001');
  128 |     await waitAppReady(page);
  129 |     // 应跳转到直播详情页（不在 MobileFrame 框架内）
  130 |     const content = page.locator('body');
  131 |     expect(await content.isVisible()).toBeTruthy();
  132 |   });
  133 | 
  134 |   test('SMK-09 商品详情独立路由加载', async ({ page }) => {
  135 |     await page.goto('/app.html#/app/product/p-d-001');
  136 |     await waitAppReady(page);
  137 |     const content = page.locator('body');
  138 |     expect(await content.isVisible()).toBeTruthy();
  139 |   });
  140 | 
  141 |   test('SMK-10 全站路由切换无 404', async ({ page }) => {
  142 |     const routes = [
  143 |       '/app.html#/app/home',
  144 |       '/app.html#/app/mall',
  145 |       '/app.html#/app/search',
  146 |       '/app.html#/app/mine',
  147 |       '/app.html#/app/project/proj-daily-01',
  148 |     ];
  149 |     for (const r of routes) {
  150 |       await page.goto(r);
  151 |       await waitAppReady(page);
  152 |       const body = page.locator('body');
  153 |       expect(await body.isVisible()).toBeTruthy();
  154 |     }
  155 |   });
  156 | });
  157 | 
  158 | // ============================================================================
  159 | // Phase 2: 平台 APP 跳转（14 用例）— 每个触点全覆盖
  160 | // ============================================================================
  161 | 
  162 | test.describe('Phase 2: 平台 APP 跳转触点全覆盖', () => {
  163 |   test('FNC-01 Banner product 类型 → /app/product/:id', async ({ page }) => {
  164 |     // mock 数据中 ad-001 为 product 类型
  165 |     await page.goto('/app.html#/app/home');
  166 |     await waitAppReady(page);
  167 |     // 直接验证 useAppNavigation 解析逻辑（通过 evaluate 调用 store）
  168 |     const result = await page.evaluate(() => {
  169 |       // 通过 window 访问 pinia store 验证数据
  170 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  171 |       if (!app) return { hasStore: false };
  172 |       const ad = app.adBanners?.find((b: any) => b.jump_type === 'product');
  173 |       return { hasStore: true, hasProductAd: !!ad, adId: ad?.ad_id, jumpId: ad?.jump_id };
  174 |     });
  175 |     expect(result.hasStore).toBe(true);
  176 |     // 若有 product 类型 Banner，验证点击跳转
  177 |     if (result.hasProductAd) {
  178 |       await page.goto('/app.html#/app/home');
  179 |       await waitAppReady(page);
  180 |       await page.waitForTimeout(1000);
  181 |     }
  182 |   });
  183 | 
  184 |   test('FNC-02 Banner function_page 类型 → 解析为内部路由', async ({ page }) => {
  185 |     await page.goto('/app.html#/app/home');
  186 |     await waitAppReady(page);
  187 |     const result = await page.evaluate(() => {
  188 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  189 |       if (!app) return { hasStore: false };
  190 |       const ad = app.adBanners?.find((b: any) => b.jump_type === 'function_page');
  191 |       const fp = ad ? app.functionPages?.find((f: any) => f.page_id === ad.jump_id) : null;
  192 |       return {
  193 |         hasStore: true,
  194 |         hasFunctionPageAd: !!ad,
  195 |         adId: ad?.ad_id,
  196 |         pageId: ad?.jump_id,
  197 |         appRoute: fp?.app_route,
```