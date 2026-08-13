# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jump-navigation.spec.ts >> Phase 2: 平台 APP 跳转触点全覆盖 >> FNC-05 金刚区 function_page link 字段非空验证（B1 核心修复）
- Location: tests\jump-navigation.spec.ts:253:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: 10:39
    - generic [ref=e6]:
      - generic [ref=e7]: 📶
      - generic [ref=e8]: 📡
      - generic [ref=e9]: 🔋
  - generic [ref=e10]:
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]:
            - img [ref=e15]:
              - generic [ref=e17]: 追
            - generic [ref=e18]: 追伴
          - generic [ref=e19] [cursor=pointer]
        - generic [ref=e26] [cursor=pointer]:
          - generic [ref=e30]: 搜索商品、直播、项目
          - generic [ref=e31]: 搜索
      - generic [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35] [cursor=pointer]: 新品首发 — 全场低至5折
          - generic [ref=e38] [cursor=pointer]: 会员专享 — 积分兑换好礼
          - generic [ref=e41] [cursor=pointer]: 营养专家直播 — 限时义诊进行中
        - generic [ref=e44]:
          - generic [ref=e45] [cursor=pointer]
          - generic [ref=e46] [cursor=pointer]
          - generic [ref=e47] [cursor=pointer]
      - generic [ref=e48]:
        - generic [ref=e49] [cursor=pointer]:
          - generic [ref=e50]: 🔥
          - generic [ref=e51]: 热卖排行
        - generic [ref=e52] [cursor=pointer]:
          - generic [ref=e53]: ✨
          - generic [ref=e54]: 新品首发
        - generic [ref=e55] [cursor=pointer]:
          - generic [ref=e56]: 🎟️
          - generic [ref=e57]: 领券中心
        - generic [ref=e58] [cursor=pointer]:
          - generic [ref=e59]: 📺
          - generic [ref=e60]: 直播间
        - generic [ref=e61] [cursor=pointer]:
          - generic [ref=e62]: 📅
          - generic [ref=e63]: 每日签到
        - generic [ref=e64] [cursor=pointer]:
          - generic [ref=e65]: 🎁
          - generic [ref=e66]: 试用中心
        - generic [ref=e67] [cursor=pointer]:
          - generic [ref=e68]: 🏆
          - generic [ref=e69]: 品牌榜
        - generic [ref=e70] [cursor=pointer]:
          - generic [ref=e71]: 📋
          - generic [ref=e72]: 全部分类
      - generic [ref=e73]:
        - generic [ref=e74]:
          - generic [ref=e75]:
            - generic [ref=e76]: 📺
            - generic [ref=e77]: 直播推荐
            - generic [ref=e79]: 8场直播中
          - generic [ref=e80] [cursor=pointer]: 更多 ›
        - generic [ref=e81]:
          - generic [ref=e82] [cursor=pointer]:
            - generic [ref=e83]:
              - generic [ref=e84]: 🏠
              - generic [ref=e85]: 直播中
              - generic [ref=e88]: 1.3万
            - generic [ref=e92]:
              - generic [ref=e93]: 【春季好物】日用品专场 限时5折
              - generic [ref=e94]:
                - generic [ref=e95]: 优
                - generic [ref=e96]: 优选主播小美
          - generic [ref=e97] [cursor=pointer]:
            - generic [ref=e98]:
              - generic [ref=e99]: 🍳
              - generic [ref=e100]: 直播中
              - generic [ref=e103]: "8600"
            - generic [ref=e107]:
              - generic [ref=e108]: 厨房好物分享 抽纸洗碗布特惠
              - generic [ref=e109]:
                - generic [ref=e110]: 清
                - generic [ref=e111]: 清洁达人老张
          - generic [ref=e112] [cursor=pointer]:
            - generic [ref=e113]:
              - generic [ref=e114]: 📺
              - generic [ref=e115]: 直播中
              - generic [ref=e118]: 1.5万
            - generic [ref=e122]:
              - generic [ref=e123]: 营养专家直播：维生素怎么补？
              - generic [ref=e124]:
                - generic [ref=e125]: 营
                - generic [ref=e126]: 营养师李博士
          - generic [ref=e127] [cursor=pointer]:
            - generic [ref=e128]:
              - generic [ref=e129]: 📺
              - generic [ref=e130]: 直播中
              - generic [ref=e133]: 1.1万
            - generic [ref=e137]:
              - generic [ref=e138]: 维生素专场 每日营养补充指南
              - generic [ref=e139]:
                - generic [ref=e140]: 营
                - generic [ref=e141]: 营养师李博士
          - generic [ref=e142] [cursor=pointer]:
            - generic [ref=e143]:
              - generic [ref=e144]: 📺
              - generic [ref=e145]: 直播中
              - generic [ref=e148]: "5800"
            - generic [ref=e152]:
              - generic [ref=e153]: 【限时特惠】纸品囤货专场 满99减20
              - generic [ref=e154]:
                - generic [ref=e155]: 优
                - generic [ref=e156]: 优选主播小美
          - generic [ref=e157] [cursor=pointer]:
            - generic [ref=e158]:
              - generic [ref=e159]: 📺
              - generic [ref=e160]: 直播中
              - generic [ref=e163]: "5400"
            - generic [ref=e167]:
              - generic [ref=e168]: 鱼油专场 深海Omega-3科普
              - generic [ref=e169]:
                - generic [ref=e170]: 健
                - generic [ref=e171]: 健康主播Anna
      - generic [ref=e172]:
        - generic [ref=e173]:
          - generic [ref=e174]:
            - generic [ref=e175]: 🔥
            - generic [ref=e176]: 商品推荐
          - generic [ref=e177] [cursor=pointer]: 更多 ›
        - generic [ref=e178]:
          - generic [ref=e179] [cursor=pointer]:
            - generic [ref=e180]: 📦
            - generic [ref=e182]:
              - generic [ref=e183]: 竹纤维抽纸 3层120抽 10包/提
              - generic [ref=e185]: 日用品优选·朝阳店
              - generic [ref=e186]:
                - generic [ref=e187]: ¥29.9
                - generic [ref=e188]: ¥39.9
              - generic [ref=e189]: 已售9k
          - generic [ref=e194] [cursor=pointer]:
            - generic [ref=e195]: 📦
            - generic [ref=e197]:
              - generic [ref=e198]: 复合维生素片 60片/瓶
              - generic [ref=e200]: 健康补给·国贸店
              - generic [ref=e201]:
                - generic [ref=e202]: ¥89
                - generic [ref=e203]: ¥128
              - generic [ref=e204]: 已售7k
          - generic [ref=e209] [cursor=pointer]:
            - generic [ref=e210]: 📦
            - generic [ref=e212]:
              - generic [ref=e213]: 不锈钢保温杯 500ml
              - generic [ref=e215]: 日用品优选·海淀店
              - generic [ref=e216]:
                - generic [ref=e217]: ¥49.9
                - generic [ref=e218]: ¥69.9
              - generic [ref=e219]: 已售1.3万
          - generic [ref=e224] [cursor=pointer]:
            - generic [ref=e225]: 📦
            - generic [ref=e227]:
              - generic [ref=e228]: 益生菌粉 30袋/盒
              - generic [ref=e230]: 健康补给·望京店
              - generic [ref=e231]:
                - generic [ref=e232]: ¥159
                - generic [ref=e233]: ¥199
              - generic [ref=e234]: 已售10k
          - generic [ref=e239] [cursor=pointer]:
            - generic [ref=e240]: 📦
            - generic [ref=e242]:
              - generic [ref=e243]: 一次性垃圾袋 45×50cm 100只
              - generic [ref=e245]: 日用品优选·丰台提货点
              - generic [ref=e246]: ¥12.9
              - generic [ref=e248]: 已售10k
          - generic [ref=e253] [cursor=pointer]:
            - generic [ref=e254]: 📦
            - generic [ref=e256]:
              - generic [ref=e257]: 纸巾大包 200抽×3包
              - generic [ref=e259]: 日用品优选·丰台提货点
              - generic [ref=e260]:
                - generic [ref=e261]: ¥19.9
                - generic [ref=e262]: ¥27.9
              - generic [ref=e263]: 已售9k
      - generic [ref=e268]: — 已经到底啦 —
    - button "用例卡" [ref=e270] [cursor=pointer]
  - generic [ref=e275]:
    - generic [ref=e276] [cursor=pointer]:
      - generic [ref=e277]: 🏠
      - generic [ref=e278]: 首页
    - generic [ref=e279] [cursor=pointer]:
      - generic [ref=e280]: 🛍️
      - generic [ref=e281]: 商城
    - generic [ref=e282] [cursor=pointer]:
      - generic [ref=e283]: 🎮
      - generic [ref=e284]: 娱乐
    - generic [ref=e285] [cursor=pointer]:
      - generic [ref=e286]: 💬
      - generic [ref=e287]: 消息
      - generic [ref=e288]: "2"
    - generic [ref=e289] [cursor=pointer]:
      - generic [ref=e290]: 👤
      - generic [ref=e291]: 我的
```

# Test source

```ts
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
  198 |         link: ad?.link,
  199 |       };
  200 |     });
  201 |     expect(result.hasStore).toBe(true);
  202 |     if (result.hasFunctionPageAd) {
  203 |       // link 字段应非空（B3 修复验证）
  204 |       expect(result.link, `Banner ${result.adId} 的 link 字段不应为空`).toBeTruthy();
  205 |       expect(result.appRoute).toBeTruthy();
  206 |     }
  207 |   });
  208 | 
  209 |   test('FNC-03 Banner function_page link 字段非空验证（B3 核心修复）', async ({ page }) => {
  210 |     await page.goto('/app.html#/app/home');
  211 |     await waitAppReady(page);
  212 |     const result = await page.evaluate(() => {
  213 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  214 |       if (!app) return { hasStore: false };
  215 |       const functionPageAds = (app.adBanners || []).filter((b: any) => b.jump_type === 'function_page');
  216 |       // 所有 function_page 类型 Banner 的 link 都应非空（B3 修复后）
  217 |       const emptyLinkCount = functionPageAds.filter((b: any) => !b.link).length;
  218 |       return {
  219 |         hasStore: true,
  220 |         totalFunctionPageAds: functionPageAds.length,
  221 |         emptyLinkCount,
  222 |       };
  223 |     });
  224 |     expect(result.hasStore).toBe(true);
  225 |     if (result.totalFunctionPageAds > 0) {
  226 |       expect(result.emptyLinkCount, 'function_page 类型 Banner 的 link 字段不应为空').toBe(0);
  227 |     }
  228 |   });
  229 | 
  230 |   test('FNC-04 金刚区 function_page 类型 → 解析路由', async ({ page }) => {
  231 |     await page.goto('/app.html#/app/home');
  232 |     await waitAppReady(page);
  233 |     const result = await page.evaluate(() => {
  234 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  235 |       if (!app) return { hasStore: false };
  236 |       const kk = app.kingKongs?.find((k: any) => k.jump_type === 'function_page');
  237 |       const fp = kk ? app.functionPages?.find((f: any) => f.page_id === kk.jump_id) : null;
  238 |       return {
  239 |         hasStore: true,
  240 |         hasFunctionPageKk: !!kk,
  241 |         entryId: kk?.entry_id,
  242 |         pageId: kk?.jump_id,
  243 |         appRoute: fp?.app_route,
  244 |         link: kk?.link,
  245 |       };
  246 |     });
  247 |     expect(result.hasStore).toBe(true);
  248 |     if (result.hasFunctionPageKk) {
  249 |       expect(result.appRoute).toBeTruthy();
  250 |     }
  251 |   });
  252 | 
  253 |   test('FNC-05 金刚区 function_page link 字段非空验证（B1 核心修复）', async ({ page }) => {
  254 |     await page.goto('/app.html#/app/home');
  255 |     await waitAppReady(page);
  256 |     const result = await page.evaluate(() => {
  257 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  258 |       if (!app) return { hasStore: false };
  259 |       const functionPageKks = (app.kingKongs || []).filter((k: any) => k.jump_type === 'function_page');
  260 |       const emptyLinkCount = functionPageKks.filter((k: any) => !k.link).length;
  261 |       return {
  262 |         hasStore: true,
  263 |         totalFunctionPageKks: functionPageKks.length,
  264 |         emptyLinkCount,
  265 |       };
  266 |     });
> 267 |     expect(result.hasStore).toBe(true);
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  268 |     if (result.totalFunctionPageKks > 0) {
  269 |       expect(result.emptyLinkCount, 'function_page 类型金刚区 link 字段不应为空').toBe(0);
  270 |     }
  271 |   });
  272 | 
  273 |   test('FNC-06 金刚区 live 类型 → /app/live/:id', async ({ page }) => {
  274 |     await page.goto('/app.html#/app/home');
  275 |     await waitAppReady(page);
  276 |     const result = await page.evaluate(() => {
  277 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  278 |       const kk = app?.kingKongs?.find((k: any) => k.jump_type === 'live');
  279 |       return { hasLiveKk: !!kk, jumpId: kk?.jump_id };
  280 |     });
  281 |     if (result.hasLiveKk) {
  282 |       expect(result.jumpId).toBeTruthy();
  283 |     }
  284 |   });
  285 | 
  286 |   test('FNC-07 金刚区 product 类型验证', async ({ page }) => {
  287 |     await page.goto('/app.html#/app/home');
  288 |     await waitAppReady(page);
  289 |     const result = await page.evaluate(() => {
  290 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  291 |       const kk = app?.kingKongs?.find((k: any) => k.jump_type === 'product');
  292 |       return { hasProductKk: !!kk, jumpId: kk?.jump_id };
  293 |     });
  294 |     if (result.hasProductKk) {
  295 |       expect(result.jumpId).toBeTruthy();
  296 |     }
  297 |   });
  298 | 
  299 |   test('FNC-08 全部金刚区入口至少有 jump_type 或 link', async ({ page }) => {
  300 |     await page.goto('/app.html#/app/home');
  301 |     await waitAppReady(page);
  302 |     const result = await page.evaluate(() => {
  303 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  304 |       if (!app) return { hasStore: false };
  305 |       const enabledKks = (app.kingKongs || []).filter((k: any) => k.status === 'active');
  306 |       // 每个启用的金刚区应有 jump_type+jump_id 或 link
  307 |       const invalidKks = enabledKks.filter((k: any) =>
  308 |         !((k.jump_type && k.jump_id) || k.link)
  309 |       );
  310 |       return {
  311 |         hasStore: true,
  312 |         totalEnabled: enabledKks.length,
  313 |         invalidCount: invalidKks.length,
  314 |       };
  315 |     });
  316 |     expect(result.hasStore).toBe(true);
  317 |     expect(result.invalidCount, '启用的金刚区不应既无 jump_type+id 又无 link').toBe(0);
  318 |   });
  319 | 
  320 |   test('FNC-09 金刚区点击触发路由变化', async ({ page }) => {
  321 |     await page.goto('/app.html#/app/home');
  322 |     await waitAppReady(page);
  323 |     const initialRoute = await getHashRoute(page);
  324 |     const firstKk = page.locator('.kk-item').first();
  325 |     if (await firstKk.count() > 0) {
  326 |       await firstKk.click();
  327 |       await page.waitForTimeout(800);
  328 |       const newRoute = await getHashRoute(page);
  329 |       // 点击后路由应变化或保持（点击成功执行）
  330 |       expect(typeof newRoute).toBe('string');
  331 |     }
  332 |   });
  333 | 
  334 |   test('FNC-10 Banner 轮播正常切换', async ({ page }) => {
  335 |     await page.goto('/app.html#/app/home');
  336 |     await waitAppReady(page);
  337 |     // 多 Banner 时应自动轮播（3.5s 间隔）
  338 |     await page.waitForTimeout(4000);
  339 |     const banners = page.locator('.banner-slide');
  340 |     if (await banners.count() > 1) {
  341 |       // 验证轮播动画存在（transform 变化）
  342 |       const transform = await banners.first().evaluate((el) => {
  343 |         const parent = el.parentElement;
  344 |         return parent ? getComputedStyle(parent).transform : '';
  345 |       });
  346 |       expect(typeof transform).toBe('string');
  347 |     }
  348 |   });
  349 | 
  350 |   test('FNC-11 搜索页热搜词点击触发搜索或跳转', async ({ page }) => {
  351 |     await page.goto('/app.html#/app/search');
  352 |     await waitAppReady(page);
  353 |     const hotWord = page.locator('.spb-tag').first();
  354 |     if (await hotWord.count() > 0) {
  355 |       await hotWord.click();
  356 |       await page.waitForTimeout(800);
  357 |       const route = await getHashRoute(page);
  358 |       // 应跳转到搜索结果或自定义结果页
  359 |       expect(route.includes('/app/search') || route.includes('/app/')).toBeTruthy();
  360 |     }
  361 |   });
  362 | 
  363 |   test('FNC-12 搜索页自定义结果 function_page 跳转验证', async ({ page }) => {
  364 |     await page.goto('/app.html#/app/search');
  365 |     await waitAppReady(page);
  366 |     const result = await page.evaluate(() => {
  367 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
```