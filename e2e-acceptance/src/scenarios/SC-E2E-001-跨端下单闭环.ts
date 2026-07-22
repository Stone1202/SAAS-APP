/**
 * SC-E2E-001 跨端下单闭环
 *
 * 场景: 租户后台发布商品 → APP 看到商品 → APP 下单 → 后台看到订单
 *
 * 这就是用户提出的核心跨端验收场景。
 * 一个测试用例内，同时操控后台Web和APP，用共享数据传递ID。
 *
 * 来源: APK反编译学习报告 §8 SC-E2E-001
 * 接口: spu/listOfStore + createOrder + order/list
 */

import { AdminWebContext } from '../contexts/admin-web.js';
import { AppCdpContext } from '../contexts/app-cdp.js';
import { sharedData } from '../contexts/shared-data.js';
import { config } from '../config.js';
import { execSync } from 'child_process';

// ═══════════════════════════════════════════════
// 测试结果记录
// ═══════════════════════════════════════════════
interface TestStep {
  step: number;
  name: string;
  status: 'pass' | 'fail' | 'skip';
  detail?: string;
}

const results: TestStep[] = [];

function record(step: number, name: string, status: TestStep['status'], detail?: string) {
  results.push({ step, name, status, detail });
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  console.log(`${icon} Step ${step}: ${name} ${detail ? '— ' + detail : ''}`);
}

// ═══════════════════════════════════════════════
// 后端直查兜底（拿"系统真相"）
// ═══════════════════════════════════════════════
async function backendVerify(endpoint: string, params: Record<string, string>): Promise<any> {
  const url = new URL(config.api.baseUrl + endpoint);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const result = execSync(
      `curl -s "${url.toString()}"`,
      { encoding: 'utf-8', timeout: config.timeout.apiCall }
    );
    return JSON.parse(result);
  } catch (e) {
    console.log(`  ⚠️ 后端直查失败: ${endpoint}`);
    return null;
  }
}

// ═══════════════════════════════════════════════
// 主流程
// ═══════════════════════════════════════════════
async function main() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  SC-E2E-001 跨端下单闭环验收');
  console.log('  后台发商品 → APP看到商品 → APP下单 → 后台看订单');
  console.log('═══════════════════════════════════════════════\n');

  const testName = `测试商品-${Date.now()}`;
  const adminWeb = new AdminWebContext();
  const appCdp = new AppCdpContext();

  try {
    // ─── Step 1: 后台发布商品 ───
    console.log('\n─── Step 1: 租户后台发布商品 ───');
    try {
      await adminWeb.connect();
      await adminWeb.login();
      const productId = await adminWeb.publishProduct(testName);
      sharedData.set('productId', productId);
      sharedData.set('productName', testName);
      record(1, '后台发布商品', 'pass', `商品ID: ${productId}`);
    } catch (e: any) {
      record(1, '后台发布商品', 'fail', e.message);
      // 如果后台连不上，跳过后续（可能是环境没配好）
      throw e;
    }

    // ─── Step 2: APP 看到商品（跨端可见性验证）───
    console.log('\n─── Step 2: APP 刷新商品列表，验证商品可见 ───');
    try {
      await appCdp.connect();
      // 跳转到商城首页
      await appCdp.navigateTo('shop');
      // 刷新并查找商品
      const productId = sharedData.get('productId');
      const productName = sharedData.get('productName');
      const found = await appCdp.findProduct(productId, productName);
      if (found) {
        record(2, 'APP看到商品（跨端可见）', 'pass', `商品: ${productName}`);
      } else {
        record(2, 'APP看到商品（跨端可见）', 'fail', '商品未在APP出现');
        throw new Error('跨端可见性验证失败');
      }
    } catch (e: any) {
      record(2, 'APP看到商品', 'fail', e.message);
      throw e;
    }

    // ─── Step 3: APP 下单 ───
    console.log('\n─── Step 3: APP 下单 ───');
    try {
      const productId = sharedData.get('productId');
      const productName = sharedData.get('productName');
      const orderId = await appCdp.placeOrder(productId, productName);
      sharedData.set('orderId', orderId);
      record(3, 'APP下单', 'pass', `订单号: ${orderId}`);
    } catch (e: any) {
      record(3, 'APP下单', 'fail', e.message);
      throw e;
    }

    // ─── Step 4: 后台看到订单（跨端回流验证）───
    console.log('\n─── Step 4: 租户后台验证订单回流 ───');
    try {
      const orderId = sharedData.get('orderId');
      const exists = await adminWeb.verifyOrderExists(orderId);
      if (exists) {
        record(4, '后台看到订单（跨端回流）', 'pass', `订单: ${orderId}`);
      } else {
        record(4, '后台看到订单（跨端回流）', 'fail', '订单未在后台出现');
      }
    } catch (e: any) {
      record(4, '后台看到订单', 'fail', e.message);
    }

    // ─── Step 5: 后端直查兜底（系统真相）───
    console.log('\n─── Step 5: 后端直查验证（系统真相）───');
    try {
      const orderId = sharedData.get('orderId');
      const orderData = await backendVerify(config.api.endpoints.order.detail, { orderNo: orderId });
      if (orderData && orderData.code === 0) {
        record(5, '后端直查订单落库', 'pass', `订单状态: ${orderData.data?.status || 'unknown'}`);
      } else {
        record(5, '后端直查订单落库', 'fail', '后端未查到订单或接口不可用');
      }
    } catch (e: any) {
      record(5, '后端直查', 'fail', e.message);
    }

  } finally {
    // ─── 清理 ───
    console.log('\n─── 清理环境 ───');
    await appCdp.close().catch(() => {});
    await adminWeb.close().catch(() => {});

    // ─── 测试报告 ───
    console.log('\n═══════════════════════════════════════════════');
    console.log('  验收报告');
    console.log('═══════════════════════════════════════════════');
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const skipped = results.filter(r => r.status === 'skip').length;
    results.forEach(r => {
      const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
      console.log(`  ${icon} Step ${r.step}: ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
    });
    console.log('───────────────────────────────────────────────');
    console.log(`  总计: ${results.length} | 通过: ${passed} | 失败: ${failed} | 跳过: ${skipped}`);
    console.log(`  结论: ${failed === 0 ? '🟢 全部通过' : '🔴 存在失败项'}`);
    console.log('═══════════════════════════════════════════════\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

main().catch(e => {
  console.error('\n💥 验收脚本异常退出:', e.message);
  process.exit(1);
});
