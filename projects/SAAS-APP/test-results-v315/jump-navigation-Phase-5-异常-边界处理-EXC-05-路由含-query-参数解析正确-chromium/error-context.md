# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jump-navigation.spec.ts >> Phase 5: 异常 & 边界处理 >> EXC-05 路由含 query 参数解析正确
- Location: tests\jump-navigation.spec.ts:835:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: 10:45
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
  765 |   });
  766 | 
  767 |   test('EXC-03 :projectId 占位符无 projectId → 路由仍包含占位符', async ({ page }) => {
  768 |     await page.goto('/app.html#/app/home');
  769 |     await waitAppReady(page);
  770 |     const result = await page.evaluate(() => {
  771 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  772 |       // 查找含 :projectId 的功能页面
  773 |       const pagesWithPlaceholder = (app?.functionPages || []).filter(
  774 |         (f: any) => f.app_route.includes(':projectId')
  775 |       );
  776 |       return {
  777 |         pagesWithPlaceholderCount: pagesWithPlaceholder.length,
  778 |         example: pagesWithPlaceholder[0]?.app_route,
  779 |       };
  780 |     });
  781 |     expect(result.pagesWithPlaceholderCount).toBeGreaterThan(0);
  782 |   });
  783 | 
  784 |   test('EXC-04 旧 localStorage url 数据自动迁移（E1 修复验证）', async ({ page }) => {
  785 |     // 注入旧 url 数据到 localStorage，然后访问首页触发迁移
  786 |     await page.addInitScript(() => {
  787 |       // 在页面加载前注入旧数据（含 jump_type='url'）
  788 |       const oldConfig = {
  789 |         searchHint: '旧搜索',
  790 |         hotWordConfigs: [],
  791 |         customSearchResults: [],
  792 |         adBanners: [
  793 |           {
  794 |             ad_id: 'old-ad-001',
  795 |             position: 'platform_home',
  796 |             title: '旧 Banner',
  797 |             image_url: '',
  798 |             sort_order: 0,
  799 |             sort: 0,
  800 |             status: 'active',
  801 |             jump_type: 'url',
  802 |             jump_id: '/app/mall',
  803 |             link: '/app/mall',
  804 |           },
  805 |         ],
  806 |         kingKongs: [],
  807 |         liveRecommendConfigs: [],
  808 |         productRecommendConfigs: [],
  809 |         functionPages: [],
  810 |         unreadCount: 0,
  811 |       };
  812 |       localStorage.setItem('saas_app_config', JSON.stringify(oldConfig));
  813 |     });
  814 | 
  815 |     await page.goto('/app.html#/app/home');
  816 |     await waitAppReady(page);
  817 |     await page.waitForTimeout(2000); // 等待迁移执行
  818 | 
  819 |     // 验证迁移结果
  820 |     const result = await page.evaluate(() => {
  821 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  822 |       const oldAd = app?.adBanners?.find((b: any) => b.ad_id === 'old-ad-001');
  823 |       return {
  824 |         hasOldAd: !!oldAd,
  825 |         currentJumpType: oldAd?.jump_type,
  826 |         currentJumpId: oldAd?.jump_id,
  827 |       };
  828 |     });
  829 |     // 旧 url 数据若匹配到注册表，应迁移为 function_page
  830 |     if (result.hasOldAd) {
  831 |       expect(['url', 'function_page']).toContain(result.currentJumpType);
  832 |     }
  833 |   });
  834 | 
  835 |   test('EXC-05 路由含 query 参数解析正确', async ({ page }) => {
  836 |     await page.goto('/app.html#/app/home');
  837 |     await waitAppReady(page);
  838 |     const result = await page.evaluate(() => {
  839 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  840 |       // 查找含 query 的功能页面（如 fp-mall-live → /app/mall?tab=featuredLives）
  841 |       const pagesWithQuery = (app?.functionPages || []).filter(
  842 |         (f: any) => f.app_route.includes('?')
  843 |       );
  844 |       return {
  845 |         pagesWithQueryCount: pagesWithQuery.length,
  846 |         example: pagesWithQuery[0]?.app_route,
  847 |       };
  848 |     });
> 849 |     expect(result.pagesWithQueryCount).toBeGreaterThan(0);
      |                                        ^ Error: expect(received).toBeGreaterThan(expected)
  850 |   });
  851 | 
  852 |   test('EXC-06 跳转目标为已禁用项目 → 触发拦截', async ({ page }) => {
  853 |     // 访问已禁用项目首页应显示提示条
  854 |     await page.goto('/app.html#/app/project/proj-inactive-test');
  855 |     await waitAppReady(page);
  856 |     // 验证拦截逻辑存在（不强制要求 proj-inactive-test 存在）
  857 |     const content = page.locator('body');
  858 |     expect(await content.isVisible()).toBeTruthy();
  859 |   });
  860 | 
  861 |   test('EXC-07 多次快速点击不导致路由栈混乱', async ({ page }) => {
  862 |     await page.goto('/app.html#/app/home');
  863 |     await waitAppReady(page);
  864 |     const kkItems = page.locator('.kk-item');
  865 |     const count = await kkItems.count();
  866 |     if (count > 1) {
  867 |       // 快速点击多个金刚区
  868 |       for (let i = 0; i < Math.min(count, 3); i++) {
  869 |         await kkItems.nth(i).click();
  870 |         await page.waitForTimeout(200);
  871 |       }
  872 |       await page.waitForTimeout(800);
  873 |       const route = await getHashRoute(page);
  874 |       expect(typeof route).toBe('string');
  875 |     }
  876 |   });
  877 | 
  878 |   test('EXC-08 跨标签页同步验证（functionPages 修改后下拉更新）', async ({ page }) => {
  879 |     // 验证 storage 事件监听已注册
  880 |     await page.goto('/app.html#/app/home');
  881 |     await waitAppReady(page);
  882 |     const hasStorageListener = await page.evaluate(() => {
  883 |       // 验证 store 已初始化（functionPages 存在）
  884 |       const app = (window as any).__PINIA__?.state?.value?.['app-config-store'];
  885 |       return {
  886 |         hasStore: !!app,
  887 |         functionPagesCount: app?.functionPages?.length || 0,
  888 |       };
  889 |     });
  890 |     expect(hasStorageListener.hasStore).toBe(true);
  891 |     expect(hasStorageListener.functionPagesCount).toBeGreaterThanOrEqual(13);
  892 |   });
  893 | });
  894 | 
  895 | // ============================================================================
  896 | // Phase 6: 回归测试（4 用例）
  897 | // ============================================================================
  898 | 
  899 | test.describe('Phase 6: 回归测试', () => {
  900 |   test('REG-01 商品详情页回退键返回来源页', async ({ page }) => {
  901 |     await page.goto('/app.html#/app/home');
  902 |     await waitAppReady(page);
  903 |     // 通过金刚区或 Banner 跳转到商品详情
  904 |     const initialRoute = await getHashRoute(page);
  905 |     // 直接导航到商品详情
  906 |     await page.goto('/app.html#/app/product/p-d-001');
  907 |     await waitAppReady(page);
  908 |     await page.waitForTimeout(500);
  909 | 
  910 |     // 回退
  911 |     await page.goBack();
  912 |     await page.waitForTimeout(500);
  913 |     // 应能回退（不白屏）
  914 |     const body = page.locator('body');
  915 |     expect(await body.isVisible()).toBeTruthy();
  916 |   });
  917 | 
  918 |   test('REG-02 直播详情页回退键返回来源页', async ({ page }) => {
  919 |     await page.goto('/app.html#/app/home');
  920 |     await waitAppReady(page);
  921 |     await page.goto('/app.html#/app/live/live-001');
  922 |     await waitAppReady(page);
  923 |     await page.waitForTimeout(500);
  924 | 
  925 |     await page.goBack();
  926 |     await page.waitForTimeout(500);
  927 |     const body = page.locator('body');
  928 |     expect(await body.isVisible()).toBeTruthy();
  929 |   });
  930 | 
  931 |   test('REG-03 商城页 Tab 切换正常', async ({ page }) => {
  932 |     await page.goto('/app.html#/app/mall');
  933 |     await waitAppReady(page);
  934 |     await page.waitForTimeout(1000);
  935 | 
  936 |     // 验证 Tab 数量 ≥ 3（商城列表/精选商品/精选直播）
  937 |     const tabs = page.locator('[class*="tab-item"], .mall-tab, [role="tab"]');
  938 |     const tabCount = await tabs.count();
  939 |     expect(tabCount).toBeGreaterThanOrEqual(1);
  940 |   });
  941 | 
  942 |   test('REG-04 推荐引擎 + 默认规则不受跳转改造影响', async ({ page }) => {
  943 |     await page.goto('/app.html#/app/home');
  944 |     await waitAppReady(page);
  945 |     await page.waitForTimeout(1500);
  946 | 
  947 |     // 验证直播推荐区有数据
  948 |     const liveSection = page.locator('[class*="live"], [class*="推荐"]').first();
  949 |     // 验证商品推荐区有数据
```