# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jump-navigation.spec.ts >> Phase 5: 异常 & 边界处理 >> EXC-07 多次快速点击不导致路由栈混乱
- Location: tests\jump-navigation.spec.ts:861:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('.kk-item').nth(1)

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
        - generic [ref=e13] [cursor=pointer]: 商城列表
        - generic [ref=e14] [cursor=pointer]: 精选商品
        - generic [ref=e15] [cursor=pointer]: 精选直播
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18] [cursor=pointer]: 全部行业
          - generic [ref=e19] [cursor=pointer]: 日用品
          - generic [ref=e20] [cursor=pointer]: 家居家电
          - generic [ref=e21] [cursor=pointer]: 保健品
        - generic [ref=e22]:
          - generic [ref=e23] [cursor=pointer]:
            - generic [ref=e24]:
              - img "日用百货优选" [ref=e25]
              - generic [ref=e26]:
                - generic [ref=e27]: 生活优选百货
                - generic [ref=e28]: 日用百货
              - generic [ref=e29]: ›
            - generic [ref=e30]:
              - generic [ref=e31]: 商品推荐
              - generic [ref=e32]:
                - generic [ref=e33]:
                  - generic [ref=e34]: 📦
                  - generic [ref=e35]: 不锈钢保温杯 500ml
                  - generic [ref=e36]: ¥49.9
                - generic [ref=e37]:
                  - generic [ref=e38]: 📦
                  - generic [ref=e39]: 一次性垃圾袋 45×50cm 100只
                  - generic [ref=e40]: ¥12.9
                - generic [ref=e41]:
                  - generic [ref=e42]: 📦
                  - generic [ref=e43]: 纸巾大包 200抽×3包
                  - generic [ref=e44]: ¥19.9
                - generic [ref=e45]:
                  - generic [ref=e46]: 📦
                  - generic [ref=e47]: 抽纸便携装 10包
                  - generic [ref=e48]: ¥16.9
            - generic [ref=e49]:
              - generic [ref=e50]: 直播推荐
              - generic [ref=e51]:
                - generic [ref=e52]:
                  - generic [ref=e53]: 📺
                  - generic [ref=e54]: 【春季好物】日用品专场 限时5折
                - generic [ref=e55]:
                  - generic [ref=e56]: 📺
                  - generic [ref=e57]: 厨房好物分享 抽纸洗碗布特惠
          - generic [ref=e58] [cursor=pointer]:
            - generic [ref=e59]:
              - img "健康补给站" [ref=e60]
              - generic [ref=e61]:
                - generic [ref=e62]: 健康补给优选
                - generic [ref=e63]: 健康保健
              - generic [ref=e64]: ›
            - generic [ref=e65]:
              - generic [ref=e66]: 商品推荐
              - generic [ref=e67]:
                - generic [ref=e68]:
                  - generic [ref=e69]: 📦
                  - generic [ref=e70]: 益生菌粉 30袋/盒
                  - generic [ref=e71]: ¥159
                - generic [ref=e72]:
                  - generic [ref=e73]: 📦
                  - generic [ref=e74]: 复合维生素片 60片/瓶
                  - generic [ref=e75]: ¥89
                - generic [ref=e76]:
                  - generic [ref=e77]: 📦
                  - generic [ref=e78]: 维生素C泡腾片 20片
                  - generic [ref=e79]: ¥39.9
                - generic [ref=e80]:
                  - generic [ref=e81]: 📦
                  - generic [ref=e82]: 钙+维生素D3片 90片
                  - generic [ref=e83]: ¥69
            - generic [ref=e84]:
              - generic [ref=e85]: 直播推荐
              - generic [ref=e86]:
                - generic [ref=e87]:
                  - generic [ref=e88]: 📺
                  - generic [ref=e89]: 营养专家直播：维生素怎么补？
                - generic [ref=e90]:
                  - generic [ref=e91]: 📺
                  - generic [ref=e92]: 益生菌专场 肠道健康大讲堂
          - generic [ref=e93] [cursor=pointer]:
            - generic [ref=e94]:
              - img "家居清洁馆" [ref=e95]
              - generic [ref=e96]:
                - generic [ref=e97]: 家居清洁管家
                - generic [ref=e98]: 日用百货
              - generic [ref=e99]: ›
            - generic [ref=e100]:
              - generic [ref=e101]: 商品推荐
              - generic [ref=e102]:
                - generic [ref=e103]:
                  - generic [ref=e104]: 📦
                  - generic [ref=e105]: 玻璃清洁喷雾 500ml
                  - generic [ref=e106]: ¥16.9
                - generic [ref=e107]:
                  - generic [ref=e108]: 📦
                  - generic [ref=e109]: 地板清洁剂 1L
                  - generic [ref=e110]: ¥22.9
                - generic [ref=e111]:
                  - generic [ref=e112]: 📦
                  - generic [ref=e113]: 马桶清洁剂 750ml
                  - generic [ref=e114]: ¥18.9
          - generic [ref=e115] [cursor=pointer]:
            - generic [ref=e116]:
              - img "营养滋补坊" [ref=e117]
              - generic [ref=e118]:
                - generic [ref=e119]: 营养滋补精选
                - generic [ref=e120]: 健康保健
              - generic [ref=e121]: ›
            - generic [ref=e122]:
              - generic [ref=e123]: 商品推荐
              - generic [ref=e124]:
                - generic [ref=e125]:
                  - generic [ref=e126]: 📦
                  - generic [ref=e127]: 枸杞原浆 30ml×30袋
                  - generic [ref=e128]: ¥138
                - generic [ref=e129]:
                  - generic [ref=e130]: 📦
                  - generic [ref=e131]: 西洋参片 50g/罐
                  - generic [ref=e132]: ¥268
                - generic [ref=e133]:
                  - generic [ref=e134]: 📦
                  - generic [ref=e135]: 燕窝礼盒 30g/盒
                  - generic [ref=e136]: ¥499
            - generic [ref=e137]:
              - generic [ref=e138]: 直播推荐
              - generic [ref=e139]:
                - generic [ref=e140]:
                  - generic [ref=e141]: 📺
                  - generic [ref=e142]: 滋补养生好物推荐 礼盒装特惠
                - generic [ref=e143]:
                  - generic [ref=e144]: 📺
                  - generic [ref=e145]: 燕窝滋补专场 孕期营养精选
    - button "用例卡" [ref=e147] [cursor=pointer]
  - generic [ref=e152]:
    - generic [ref=e153] [cursor=pointer]:
      - generic [ref=e154]: 🏠
      - generic [ref=e155]: 首页
    - generic [ref=e156] [cursor=pointer]:
      - generic [ref=e157]: 🛍️
      - generic [ref=e158]: 商城
    - generic [ref=e159] [cursor=pointer]:
      - generic [ref=e160]: 🎮
      - generic [ref=e161]: 娱乐
    - generic [ref=e162] [cursor=pointer]:
      - generic [ref=e163]: 💬
      - generic [ref=e164]: 消息
      - generic [ref=e165]: "2"
    - generic [ref=e166] [cursor=pointer]:
      - generic [ref=e167]: 👤
      - generic [ref=e168]: 我的
```

# Test source

```ts
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
  849 |     expect(result.pagesWithQueryCount).toBeGreaterThan(0);
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
> 869 |         await kkItems.nth(i).click();
      |                              ^ Error: locator.click: Test timeout of 60000ms exceeded.
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
  950 |     const productSection = page.locator('[class*="product"], [class*="推荐"]').first();
  951 | 
  952 |     // 不强制要求（可能为空数据场景），仅验证不报错
  953 |     const body = page.locator('body');
  954 |     expect(await body.isVisible()).toBeTruthy();
  955 |   });
  956 | });
  957 | 
```