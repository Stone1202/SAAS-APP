# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshot-prd.spec.ts >> 五类图渲染PNG >> 渲染五类图为PNG
- Location: tests\screenshot-prd.spec.ts:287:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]: 图1 — 业务流程图
    - generic [ref=e4]: "flowchart TD A[消费者打开APP] --> B[平台首页5Tab] B --> C{Tab选择} C -->|首页| D[APPlogo/搜索框/BANNER/金刚区/直播推荐/商品推荐] C -->|商城| E[项目列表/精选商品/精选直播Tab] C -->|娱乐| E1[娱乐占位页] C -->|消息| E2[消息占位页] C -->|我的| G[个人中心8模块] D --> H{点击元素} H -->|金刚区| I[跳转目标页] H -->|商品| J[商品详情页 FN-012] H -->|直播| K[直播详情页 FN-014] H -->|搜索框| F[搜索页] E --> L[项目卡片:logo/主营类目/推荐商品/推荐直播] L --> M[项目首页4Tab:首页/商城/门店/会员] F --> N[搜索历史/热门搜索词] N --> O{关联自定义结果?} O -->|是| P[直接跳转目标页] O -->|否| Q[搜索结果页] Q --> R[综合/商品/项目/直播Tab] M --> M1{项目Tab选择} M1 -->|首页| M2[项目LOGO/BANNER/直播推荐/商品推荐] M1 -->|商城| M3[项目商城:按营销分类显示商品] M1 -->|门店| M4[门店列表:按距离排序] M1 -->|会员| M5[会员中心:积分/优惠券/等级/零钱] M4 --> T[门店详情:基本信息/位置/推荐直播/商品按分类]"
  - generic [ref=e5]:
    - generic [ref=e6]: 图2 — 信息流转图
    - generic [ref=e7]: flowchart LR subgraph 运营后台 OP1[搜索/广告/金刚区/直播推荐/商品推荐配置] end subgraph 租户后台 TN1[项目/门店/项目首页配置/营销分类管理] end subgraph localStorage LS1[saas:app-config] LS2[saas:project] LS3[saas:user] end subgraph APP端 AP1[平台首页/商城/搜索/项目维度/个人中心] end OP1 -->|watch deep| LS1 TN1 -->|watch deep| LS2 LS1 -->|load| AP1 LS2 -->|load| AP1 AP1 -->|用户数据| LS3
  - generic [ref=e8]:
    - generic [ref=e9]: 图3a — 广告位状态机
    - generic [ref=e10]: "stateDiagram-v2 [*] --> 待上线: 新建 待上线 --> 展示中: 到达start_time 展示中 --> 已下线: 到达end_time 展示中 --> 已下线: 手动下架 待上线 --> 已下线: 手动下架 已下线 --> 待上线: 重新编辑 已下线 --> [*]: 删除"
  - generic [ref=e11]:
    - generic [ref=e12]: 图3b — 直播状态机
    - generic [ref=e13]: "stateDiagram-v2 [*] --> 预告: 创建直播 预告 --> 直播中: 到达开播时间 直播中 --> 已结束: 主播结束 已结束 --> 回放中: 生成回放 回放中 --> [*]: 过期删除"
  - generic [ref=e14]:
    - generic [ref=e15]: 图3c — 推荐配置状态机
    - generic [ref=e16]: "stateDiagram-v2 [*] --> 已启用: 新建/配置 已启用 --> 已禁用: 关闭 已禁用 --> 已启用: 开启 已启用 --> [*]: 删除 已禁用 --> [*]: 删除"
  - generic [ref=e17]:
    - generic [ref=e18]: 图4 — 业务时序图
    - generic [ref=e19]: "sequenceDiagram participant 消费者 participant APP端 participant PiniaStore participant localStorage participant 运营后台 消费者->>APP端: 打开APP首页 APP端->>PiniaStore: 加载app-config PiniaStore->>localStorage: read saas:app-config localStorage-->>PiniaStore: 返回配置JSON PiniaStore-->>APP端: 注入响应式数据 APP端-->>消费者: 渲染首页(Banner/金刚区/推荐) Note over 运营后台,localStorage: 运营修改配置 运营后台->>PiniaStore: 修改广告配置 PiniaStore->>localStorage: watch deep → write saas:app-config Note over 消费者,APP端: 下次打开APP生效"
```

# Test source

```ts
  192 |     await shoot(page, 'PG-OPS-PC-001-搜索管理-热搜词.png');
  193 |   });
  194 | 
  195 |   test('PG-OPS-PC-001 搜索管理-自定义结果Tab', async ({ page }) => {
  196 |     await page.goto('#/admin/search');
  197 |     await page.waitForTimeout(500);
  198 |     await page.locator('text=自定义搜索结果').first().click().catch(() => {});
  199 |     await page.waitForTimeout(500);
  200 |     await shoot(page, 'PG-OPS-PC-001-搜索管理-自定义结果.png');
  201 |   });
  202 | 
  203 |   test('PG-OPS-PC-002 广告位管理', async ({ page }) => {
  204 |     await page.goto('#/admin/ad');
  205 |     await shoot(page, 'PG-OPS-PC-002-广告位管理.png');
  206 |   });
  207 | 
  208 |   test('PG-OPS-PC-003 金刚区管理', async ({ page }) => {
  209 |     await page.goto('#/admin/kingkong');
  210 |     await shoot(page, 'PG-OPS-PC-003-金刚区管理.png');
  211 |   });
  212 | 
  213 |   test('PG-OPS-PC-004/005 首页推荐-直播Tab', async ({ page }) => {
  214 |     await page.goto('#/admin/home-recommend');
  215 |     await shoot(page, 'PG-OPS-PC-004-首页推荐-直播.png');
  216 |   });
  217 | 
  218 |   test('PG-OPS-PC-004/005 首页推荐-商品Tab', async ({ page }) => {
  219 |     await page.goto('#/admin/home-recommend');
  220 |     await page.waitForTimeout(500);
  221 |     await page.locator('.el-tabs__item:has-text("商品推荐")').first().click().catch(() => {});
  222 |     await page.waitForTimeout(500);
  223 |     await shoot(page, 'PG-OPS-PC-005-首页推荐-商品.png');
  224 |   });
  225 | 
  226 |   test('PG-OPS-PC-006 项目列表管理', async ({ page }) => {
  227 |     await page.goto('#/admin/projects');
  228 |     await shoot(page, 'PG-OPS-PC-006-项目列表管理.png');
  229 |   });
  230 | 
  231 |   test('PG-OPS-PC-007 商城管理', async ({ page }) => {
  232 |     await page.goto('#/admin/mall-manage');
  233 |     await shoot(page, 'PG-OPS-PC-007-商城管理.png');
  234 |   });
  235 | 
  236 |   test('PG-OPS-PC-008 规则引擎管理', async ({ page }) => {
  237 |     await page.goto('#/admin/recommend-rule');
  238 |     await shoot(page, 'PG-OPS-PC-008-规则引擎管理.png');
  239 |   });
  240 | 
  241 |   test('PG-OPS-PC-009 功能页面管理', async ({ page }) => {
  242 |     await page.goto('#/admin/function-pages');
  243 |     await shoot(page, 'PG-OPS-PC-009-功能页面管理.png');
  244 |   });
  245 | });
  246 | 
  247 | // ============================================
  248 | // 租户后台截图（1440×900 桌面视口）
  249 | // ============================================
  250 | 
  251 | test.describe('租户后台页面截图', () => {
  252 |   test.use({ viewport: { width: 1440, height: 900 } });
  253 | 
  254 |   test('PG-TNT-PC-005 项目管理', async ({ page }) => {
  255 |     await page.goto('#/tenant/projects/proj-daily-01/profile');
  256 |     await shoot(page, 'PG-TNT-PC-005-项目管理.png');
  257 |   });
  258 | 
  259 |   test('PG-TNT-PC-002 门店管理', async ({ page }) => {
  260 |     await page.goto('#/tenant/projects/proj-daily-01/stores');
  261 |     await shoot(page, 'PG-TNT-PC-002-门店管理.png');
  262 |   });
  263 | 
  264 |   test('PG-TNT-PC-004 营销分类管理', async ({ page }) => {
  265 |     await page.goto('#/tenant/projects/proj-daily-01/marketing-categories');
  266 |     await shoot(page, 'PG-TNT-PC-004-营销分类管理.png');
  267 |   });
  268 | 
  269 |   test('PG-TNT-PC-006 项目Banner管理', async ({ page }) => {
  270 |     await page.goto('#/tenant/projects/proj-daily-01/banners');
  271 |     await shoot(page, 'PG-TNT-PC-006-项目Banner管理.png');
  272 |   });
  273 | 
  274 |   test('PG-TNT-PC-007 项目金刚区管理', async ({ page }) => {
  275 |     await page.goto('#/tenant/projects/proj-daily-01/kingkong');
  276 |     await shoot(page, 'PG-TNT-PC-007-项目金刚区管理.png');
  277 |   });
  278 | });
  279 | 
  280 | // ============================================
  281 | // 五类图 Mermaid 渲染为 PNG
  282 | // ============================================
  283 | 
  284 | test.describe('五类图渲染PNG', () => {
  285 |   test.use({ viewport: { width: 1200, height: 800 } });
  286 | 
  287 |   test('渲染五类图为PNG', async ({ page }) => {
  288 |     const renderHtml = path.resolve(SHOTS_DIR, 'render-mermaid.html');
  289 |     const fileUrl = `file:///${renderHtml.replace(/\\/g, '/')}`;
  290 |     await page.goto(fileUrl);
  291 |     // 等待mermaid渲染完成
> 292 |     await page.waitForFunction(() => document.body.getAttribute('data-rendered') === 'true', { timeout: 15000 });
      |                ^ Error: page.waitForFunction: Test timeout of 60000ms exceeded.
  293 |     await page.waitForTimeout(1000);
  294 | 
  295 |     // 逐个截图6张图
  296 |     const diagrams = [
  297 |       { id: 'd1', file: 'DIAG-01-业务流程图.png' },
  298 |       { id: 'd2', file: 'DIAG-02-信息流转图.png' },
  299 |       { id: 'd3a', file: 'DIAG-03a-广告位状态机.png' },
  300 |       { id: 'd3b', file: 'DIAG-03b-直播状态机.png' },
  301 |       { id: 'd3c', file: 'DIAG-03c-推荐配置状态机.png' },
  302 |       { id: 'd4', file: 'DIAG-04-业务时序图.png' },
  303 |     ];
  304 | 
  305 |     for (const d of diagrams) {
  306 |       const el = page.locator(`#${d.id}`);
  307 |       await el.screenshot({ path: path.join(SHOTS_DIR, d.file) });
  308 |       console.log(`  📐 ${d.file}`);
  309 |     }
  310 |   });
  311 | });
  312 | 
```