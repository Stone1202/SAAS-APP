/**
 * APP 连接测试工具
 *
 * 单独运行此脚本，验证能否成功连接APP的WebView。
 * 这是跑验收脚本前的第一步——确认 CDP 连接通畅。
 *
 * 用法: npm run connect-app
 */

import { AppCdpContext } from '../contexts/app-cdp.js';

async function main() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  APP CDP 连接测试');
  console.log('═══════════════════════════════════════════════\n');

  const appCdp = new AppCdpContext();

  try {
    console.log('正在连接APP...\n');
    const page = await appCdp.connect();

    console.log('\n─── 连接成功！正在采集APP信息 ───\n');

    // 采集当前页面信息
    const title = await page.title().catch(() => '未知');
    const url = page.url();
    console.log(`  页面标题: ${title}`);
    console.log(`  页面URL: ${url}`);

    // 采集页面上的文字（前500字符，了解当前在哪个页面）
    const bodyText = await page.textContent('body').catch(() => '');
    const preview = bodyText?.slice(0, 200).replace(/\s+/g, ' ').trim();
    console.log(`  页面内容预览: ${preview || '(空)'}`);

    // 列出页面上的可交互元素数量
    const buttonCount = await page.locator('button, [role=button]').count().catch(() => 0);
    const inputCount = await page.locator('input, textarea').count().catch(() => 0);
    const linkCount = await page.locator('a, [role=link]').count().catch(() => 0);
    console.log(`  交互元素: ${buttonCount}按钮 / ${inputCount}输入框 / ${linkCount}链接`);

    // 检测 uni 对象是否存在（确认是 uni-app）
    const hasUni = await page.evaluate(() => typeof (window as any).uni !== 'undefined').catch(() => false);
    console.log(`  uni对象存在: ${hasUni ? '✅ 是uni-app' : '❌ 未检测到'}`);

    console.log('\n✅ CDP连接测试通过！可以运行验收脚本了。');
    console.log('   npm run test:SC-001  # 跨端下单闭环');
    console.log('   npm run test:SC-002  # 扫码绑定门店');

  } catch (e: any) {
    console.error('\n❌ 连接失败:', e.message);
    console.error('\n排查清单:');
    console.error('  1. Android模拟器是否已启动？运行: adb devices');
    console.error('  2. APP是否已安装？运行: adb shell pm list packages');
    console.error('  3. APP是否是debug包？（release包不开启WebView调试）');
    console.error('  4. APP是否已启动？运行: adb shell am start -n <包名>/.MainActivity');
    console.error('  5. 端口转发是否正常？运行: adb forward --list');
    process.exit(1);
  } finally {
    await appCdp.disconnect().catch(() => {});
  }
}

main();
