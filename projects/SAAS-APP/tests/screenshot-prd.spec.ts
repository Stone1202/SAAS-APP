/**
 * PRD HTML 系统截图脚本
 *
 * 用途：为 PRD HTML 需求文档生成所有页面的系统截图（L1锚点截图 + L2增量截图）
 * 输出：docs/01-requirements/prd-html/screenshots/PG-*-页面名.png
 *
 * 运行：
 *   npx playwright test tests/screenshot-prd.spec.ts --config=tests/screenshot-prd.config.ts
 *
 * 截图规范（参考 SAAS-v1.0.0-S1.html 输出标准）：
 *   - APP端：390×844 视口（iPhone 14），全页截图
 *   - 运营后台/租户后台：1440×900 桌面视口，全页截图
 *   - 文件命名：PG-XXX-页面名.png（与design-map.json页面编号对齐）
 *   - L1锚点截图：页面默认状态
 *   - L2增量截图：交互后状态（Tab切换/弹窗等）
 */

import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SHOTS_DIR = path.resolve(__dirname, '..', 'docs', '01-requirements', 'prd-html', 'screenshots');

// 确保输出目录存在
if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

/**
 * 截图辅助函数：等待页面稳定后全页截图
 */
async function shoot(page: Page, filename: string, waitMs = 800) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(waitMs);
  const filepath = path.join(SHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  📸 ${filename}`);
}

/**
 * 截取页面中指定元素（用于弹窗L2截图）
 */
async function shootElement(page: Page, selector: string, filename: string, waitMs = 500) {
  await page.waitForTimeout(waitMs);
  const el = page.locator(selector).first();
  await el.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  const filepath = path.join(SHOTS_DIR, filename);
  await el.screenshot({ path: filepath }).catch(async () => {
    // 元素截图失败则整页截图
    await page.screenshot({ path: filepath, fullPage: true });
  });
  console.log(`  📸 ${filename}`);
}

// ============================================
// APP端截图（390×844 视口）
// ============================================

test.describe('APP端页面截图', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('PG-SHP-APP-001 平台首页', async ({ page }) => {
    await page.goto('#/app/home');
    await shoot(page, 'PG-SHP-APP-001-平台首页.png');
  });

  test('PG-SHP-APP-002 商城-项目列表(默认Tab)', async ({ page }) => {
    await page.goto('#/app/mall');
    await shoot(page, 'PG-SHP-APP-002-商城-项目列表.png');
  });

  test('PG-SHP-APP-002 商城-精选商品Tab', async ({ page }) => {
    await page.goto('#/app/mall?tab=featuredProducts');
    await page.waitForTimeout(500);
    // 点击精选商品Tab（确保切换）
    await page.locator('text=精选商品').first().click().catch(() => {});
    await shoot(page, 'PG-SHP-APP-002-商城-精选商品.png');
  });

  test('PG-SHP-APP-002 商城-精选直播Tab', async ({ page }) => {
    await page.goto('#/app/mall?tab=featuredLives');
    await page.waitForTimeout(500);
    await page.locator('text=精选直播').first().click().catch(() => {});
    await shoot(page, 'PG-SHP-APP-002-商城-精选直播.png');
  });

  test('PG-SHP-APP-003 娱乐页占位', async ({ page }) => {
    await page.goto('#/app/entertainment');
    await shoot(page, 'PG-SHP-APP-003-娱乐页.png');
  });

  test('PG-SHP-APP-004 消息页占位', async ({ page }) => {
    await page.goto('#/app/message');
    await shoot(page, 'PG-SHP-APP-004-消息页.png');
  });

  test('PG-SHP-APP-005 个人中心', async ({ page }) => {
    await page.goto('#/app/mine');
    await shoot(page, 'PG-SHP-APP-005-个人中心.png');
  });

  test('PG-SHP-APP-005-M01 收货地址管理', async ({ page }) => {
    await page.goto('#/app/mine/addresses');
    await shoot(page, 'PG-SHP-APP-005-M01-收货地址.png');
  });

  test('PG-SHP-APP-006 平台会员中心', async ({ page }) => {
    await page.goto('#/app/mine/member');
    await shoot(page, 'PG-SHP-APP-006-平台会员中心.png');
  });

  test('PG-SHP-APP-007 搜索页', async ({ page }) => {
    await page.goto('#/app/search');
    await shoot(page, 'PG-SHP-APP-007-搜索页.png');
  });

  test('PG-SHP-APP-008 搜索结果页', async ({ page }) => {
    await page.goto('#/app/search/result');
    await shoot(page, 'PG-SHP-APP-008-搜索结果页.png');
  });

  test('PG-SHP-APP-009 项目首页', async ({ page }) => {
    await page.goto('#/app/project/proj-daily-01');
    await shoot(page, 'PG-SHP-APP-009-项目首页.png');
  });

  test('PG-SHP-APP-009A 项目商城-商品Tab', async ({ page }) => {
    await page.goto('#/app/project/proj-daily-01/mall');
    await shoot(page, 'PG-SHP-APP-009A-项目商城-商品.png');
  });

  test('PG-SHP-APP-009A 项目商城-直播Tab', async ({ page }) => {
    await page.goto('#/app/project/proj-daily-01/mall');
    await page.waitForTimeout(500);
    await page.locator('text=直播').first().click().catch(() => {});
    await shoot(page, 'PG-SHP-APP-009A-项目商城-直播.png');
  });

  test('PG-SHP-APP-010 项目门店页', async ({ page }) => {
    await page.goto('#/app/project/proj-daily-01/stores');
    await shoot(page, 'PG-SHP-APP-010-项目门店.png');
  });

  test('PG-SHP-APP-011 门店详情', async ({ page }) => {
    await page.goto('#/app/store/store-d-001');
    await shoot(page, 'PG-SHP-APP-011-门店详情.png');
  });

  test('PG-SHP-APP-011A 门店商品/直播列表', async ({ page }) => {
    await page.goto('#/app/store/store-d-001/items');
    await shoot(page, 'PG-SHP-APP-011A-门店商品列表.png');
  });

  test('PG-SHP-APP-012 商品详情页', async ({ page }) => {
    await page.goto('#/app/product/prod-d-001');
    await shoot(page, 'PG-SHP-APP-012-商品详情.png');
  });

  test('PG-SHP-APP-012A 更多商品分类页', async ({ page }) => {
    await page.goto('#/app/more-products');
    await shoot(page, 'PG-SHP-APP-012A-更多商品.png');
  });

  test('PG-SHP-APP-013 项目会员页', async ({ page }) => {
    await page.goto('#/app/project/proj-daily-01/member');
    await shoot(page, 'PG-SHP-APP-013-项目会员.png');
  });

  test('PG-SHP-APP-013A 项目优惠券页', async ({ page }) => {
    await page.goto('#/app/project/proj-daily-01/coupons');
    await shoot(page, 'PG-SHP-APP-013A-项目优惠券.png');
  });

  test('PG-SHP-APP-014 直播详情页', async ({ page }) => {
    await page.goto('#/app/live/live-001');
    await shoot(page, 'PG-SHP-APP-014-直播详情.png');
  });
});

// ============================================
// 运营后台截图（1440×900 桌面视口）
// ============================================

test.describe('运营后台页面截图', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('PG-OPS-PC-001 搜索管理-热搜词Tab', async ({ page }) => {
    await page.goto('#/admin/search');
    await shoot(page, 'PG-OPS-PC-001-搜索管理-热搜词.png');
  });

  test('PG-OPS-PC-001 搜索管理-自定义结果Tab', async ({ page }) => {
    await page.goto('#/admin/search');
    await page.waitForTimeout(500);
    await page.locator('text=自定义搜索结果').first().click().catch(() => {});
    await page.waitForTimeout(500);
    await shoot(page, 'PG-OPS-PC-001-搜索管理-自定义结果.png');
  });

  test('PG-OPS-PC-002 广告位管理', async ({ page }) => {
    await page.goto('#/admin/ad');
    await shoot(page, 'PG-OPS-PC-002-广告位管理.png');
  });

  test('PG-OPS-PC-003 金刚区管理', async ({ page }) => {
    await page.goto('#/admin/kingkong');
    await shoot(page, 'PG-OPS-PC-003-金刚区管理.png');
  });

  test('PG-OPS-PC-004/005 首页推荐-直播Tab', async ({ page }) => {
    await page.goto('#/admin/home-recommend');
    await shoot(page, 'PG-OPS-PC-004-首页推荐-直播.png');
  });

  test('PG-OPS-PC-004/005 首页推荐-商品Tab', async ({ page }) => {
    await page.goto('#/admin/home-recommend');
    await page.waitForTimeout(500);
    await page.locator('.el-tabs__item:has-text("商品推荐")').first().click().catch(() => {});
    await page.waitForTimeout(500);
    await shoot(page, 'PG-OPS-PC-005-首页推荐-商品.png');
  });

  test('PG-OPS-PC-006 项目列表管理', async ({ page }) => {
    await page.goto('#/admin/projects');
    await shoot(page, 'PG-OPS-PC-006-项目列表管理.png');
  });

  test('PG-OPS-PC-007 商城管理', async ({ page }) => {
    await page.goto('#/admin/mall-manage');
    await shoot(page, 'PG-OPS-PC-007-商城管理.png');
  });

  test('PG-OPS-PC-008 规则引擎管理', async ({ page }) => {
    await page.goto('#/admin/recommend-rule');
    await shoot(page, 'PG-OPS-PC-008-规则引擎管理.png');
  });

  test('PG-OPS-PC-009 功能页面管理', async ({ page }) => {
    await page.goto('#/admin/function-pages');
    await shoot(page, 'PG-OPS-PC-009-功能页面管理.png');
  });
});

// ============================================
// 租户后台截图（1440×900 桌面视口）
// ============================================

test.describe('租户后台页面截图', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('PG-TNT-PC-005 项目管理', async ({ page }) => {
    await page.goto('#/tenant/projects/proj-daily-01/profile');
    await shoot(page, 'PG-TNT-PC-005-项目管理.png');
  });

  test('PG-TNT-PC-002 门店管理', async ({ page }) => {
    await page.goto('#/tenant/projects/proj-daily-01/stores');
    await shoot(page, 'PG-TNT-PC-002-门店管理.png');
  });

  test('PG-TNT-PC-004 营销分类管理', async ({ page }) => {
    await page.goto('#/tenant/projects/proj-daily-01/marketing-categories');
    await shoot(page, 'PG-TNT-PC-004-营销分类管理.png');
  });

  test('PG-TNT-PC-006 项目Banner管理', async ({ page }) => {
    await page.goto('#/tenant/projects/proj-daily-01/banners');
    await shoot(page, 'PG-TNT-PC-006-项目Banner管理.png');
  });

  test('PG-TNT-PC-007 项目金刚区管理', async ({ page }) => {
    await page.goto('#/tenant/projects/proj-daily-01/kingkong');
    await shoot(page, 'PG-TNT-PC-007-项目金刚区管理.png');
  });
});

// ============================================
// 五类图 Mermaid 渲染为 PNG
// ============================================

test.describe('五类图渲染PNG', () => {
  test.use({ viewport: { width: 1200, height: 800 } });

  test('渲染五类图为PNG', async ({ page }) => {
    const renderHtml = path.resolve(SHOTS_DIR, 'render-mermaid.html');
    const fileUrl = `file:///${renderHtml.replace(/\\/g, '/')}`;
    await page.goto(fileUrl);
    // 等待mermaid渲染完成
    await page.waitForFunction(() => document.body.getAttribute('data-rendered') === 'true', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 逐个截图6张图
    const diagrams = [
      { id: 'd1', file: 'DIAG-01-业务流程图.png' },
      { id: 'd2', file: 'DIAG-02-信息流转图.png' },
      { id: 'd3a', file: 'DIAG-03a-广告位状态机.png' },
      { id: 'd3b', file: 'DIAG-03b-直播状态机.png' },
      { id: 'd3c', file: 'DIAG-03c-推荐配置状态机.png' },
      { id: 'd4', file: 'DIAG-04-业务时序图.png' },
    ];

    for (const d of diagrams) {
      const el = page.locator(`#${d.id}`);
      await el.screenshot({ path: path.join(SHOTS_DIR, d.file) });
      console.log(`  📐 ${d.file}`);
    }
  });
});
