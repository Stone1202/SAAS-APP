/**
 * 五类图 Mermaid 渲染为 PNG（独立脚本，不依赖Playwright config）
 *
 * 运行：npx playwright test tests/screenshot-diagrams.spec.ts --config=tests/screenshot-prd.config.ts --output=prd-diagram-out
 */
import { test } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SHOTS_DIR = path.resolve(__dirname, '..', 'docs', '01-requirements', 'prd-html', 'screenshots');

test.use({ viewport: { width: 1200, height: 800 } });

test('render diagrams to png', async ({ page }) => {
  const renderHtml = path.resolve(SHOTS_DIR, 'render-mermaid.html');
  const fileUrl = `file:///${renderHtml.replace(/\\/g, '/')}`;
  await page.goto(fileUrl);
  // 等待mermaid渲染完成（增加超时到30秒）
  await page.waitForFunction(() => document.body.getAttribute('data-rendered') === 'true', { timeout: 30000 });
  await page.waitForTimeout(1500);

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
    console.log(`  diagram: ${d.file}`);
  }
});
