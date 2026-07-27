/**
 * Mermaid 高清图渲染：HTML→Playwright→PNG
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../docs/09-versions/v1.0.0/prd-html/screenshots');
const RENDER_URL = 'file://' + path.join(OUT_DIR, 'render-mermaid.html');

const diagrams = [
  { id: 'd1', name: 'DIAG-01-业务流程图' },
  { id: 'd2', name: 'DIAG-02-信息流转图' },
  { id: 'd3', name: 'DIAG-03-违规处置状态机' },
  { id: 'd4', name: 'DIAG-04-回放发布状态机' },
  { id: 'd5', name: 'DIAG-05-业务时序图' },
  { id: 'd6', name: 'DIAG-06-三方接口时序图' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('📐 加载 Mermaid 渲染页面...');
  await page.goto(RENDER_URL, { waitUntil: 'load', timeout: 30000 });

  // 等待 Mermaid 渲染完成
  await page.waitForFunction(
    () => document.body.getAttribute('data-rendered') === 'true',
    { timeout: 20000 }
  );
  await page.waitForTimeout(2000);

  const svgCount = await page.evaluate(() => document.querySelectorAll('.mermaid svg').length);
  console.log(`   SVG 渲染数: ${svgCount}\n`);

  for (const { id, name } of diagrams) {
    console.log(`🖼  ${name}`);
    try {
      const el = page.locator(`#${id}`);
      await el.waitFor({ timeout: 3000 });

      const box = await el.boundingBox();
      if (!box) { console.log('   ⚠️  无法获取元素尺寸'); continue; }

      await page.setViewportSize({
        width: Math.ceil(Math.max(box.width, 800) + 80),
        height: Math.ceil(Math.max(box.height, 400) + 80),
      });

      await page.waitForTimeout(300);
      const filePath = path.join(OUT_DIR, `${name}.png`);
      await el.screenshot({ path: filePath });
      console.log(`   ✅ ${name}.png (${Math.round(box.width)}×${Math.round(box.height)})`);
    } catch (e) {
      console.log(`   ❌ ${e.message}`);
    }
  }

  await browser.close();
  console.log('\n🎉 全部完成！');
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
