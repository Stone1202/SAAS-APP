/**
 * SC-E2E-002 扫码绑定门店
 *
 * 场景: APP 扫码 → 解析二维码 → 绑定门店
 *
 * 关键技术: 不模拟摄像头扫码，而是 hook uni.scanCode 直接注入扫码结果。
 * 这是混合APP验收"原生能力"的标准做法——注入语义结果，不模拟物理动作。
 *
 * 来源: APK反编译学习报告 §8 SC-E2E-002
 * 接口: invite/acceptInvite
 */

import { AppCdpContext } from '../contexts/app-cdp.js';
import { sharedData } from '../contexts/shared-data.js';
import { config } from '../config.js';

const results: { step: number; name: string; status: string; detail?: string }[] = [];
function record(step: number, name: string, status: string, detail?: string) {
  results.push({ step, name, status, detail });
  const icon = status === 'pass' ? '✅' : '❌';
  console.log(`${icon} Step ${step}: ${name} ${detail ? '— ' + detail : ''}`);
}

async function main() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  SC-E2E-002 扫码绑定门店验收');
  console.log('  APP扫码(注入) → 解析 → 绑定门店');
  console.log('═══════════════════════════════════════════════\n');

  const appCdp = new AppCdpContext();

  try {
    console.log('─── Step 1: 连接APP ───');
    try {
      await appCdp.connect();
      record(1, '连接APP', 'pass', 'CDP连接成功');
    } catch (e: any) {
      record(1, '连接APP', 'fail', e.message);
      throw e;
    }

    console.log('\n─── Step 2: 模拟扫码（注入结果）───');
    const inviteCode = 'TEST' + Date.now().toString().slice(-6);
    const scanResult = `${config.adminWeb.url}/invite?code=${inviteCode}`;
    sharedData.set('inviteCode', inviteCode);

    try {
      await appCdp.simulateScanCode(scanResult);
      record(2, '注入扫码结果', 'pass', `邀请码: ${inviteCode}`);
    } catch (e: any) {
      record(2, '注入扫码结果', 'fail', e.message);
      throw e;
    }

    console.log('\n─── Step 3: 验证扫码后跳转到绑定页 ───');
    try {
      const p = appCdp.page;
      await p.waitForTimeout(2000);
      const currentUrl = p.url();
      const hasInvitePage = currentUrl.includes('invite-member') || currentUrl.includes('invite');
      if (hasInvitePage) {
        record(3, '扫码跳转绑定页', 'pass', `当前: ${currentUrl}`);
      } else {
        record(3, '扫码跳转绑定页', 'fail', `未跳转到绑定页，当前: ${currentUrl}`);
      }
    } catch (e: any) {
      record(3, '扫码跳转绑定页', 'fail', e.message);
    }

    console.log('\n─── Step 4: 确认绑定门店 ───');
    try {
      const p = appCdp.page;
      await p.click('button:has-text("确认绑定"), button:has-text("确定")').catch(() => {});
      await p.waitForTimeout(2000);
      const bodyText = await p.textContent('body').catch(() => '');
      const success = bodyText?.includes('绑定成功') || bodyText?.includes('成功');
      if (success) {
        record(4, '绑定门店', 'pass', `邀请码: ${inviteCode}`);
      } else {
        record(4, '绑定门店', 'fail', '未检测到绑定成功提示');
      }
    } catch (e: any) {
      record(4, '绑定门店', 'fail', e.message);
    }

  } finally {
    await appCdp.close().catch(() => {});
    console.log('\n═══════════════════════════════════════════════');
    console.log('  验收报告');
    console.log('═══════════════════════════════════════════════');
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    results.forEach(r => {
      const icon = r.status === 'pass' ? '✅' : '❌';
      console.log(`  ${icon} Step ${r.step}: ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
    });
    console.log(`  总计: ${results.length} | 通过: ${passed} | 失败: ${failed}`);
    console.log(`  结论: ${failed === 0 ? '🟢 全部通过' : '🔴 存在失败项'}`);
    console.log('═══════════════════════════════════════════════\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

main().catch(e => {
  console.error('\n💥 验收脚本异常退出:', e.message);
  process.exit(1);
});
