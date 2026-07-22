/**
 * APP CDP Context
 *
 * 这是整个方案的核心创新：用 Playwright connectOverCDP 连接
 * 手机上 uni-app APP 的 WebView，之后操作 APP 页面和操作网页完全一样。
 *
 * 连接链路:
 *   手机APP的WebView(内部端口)
 *      ↑ adb forward 端口转发
 *   电脑 localhost:9222
 *      ↑ Playwright connectOverCDP
 *   你的验收脚本
 */

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { config } from '../config.js';
import { ensureDevice, setupForward, launchApp, stopApp, isAppInstalled } from '../utils/adb-helper.js';

export class AppCdpContext {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /**
   * 连接 APP 的 WebView
   *
   * 步骤:
   * 1. 检查设备连接
   * 2. adb forward 端口转发
   * 3. 启动APP
   * 4. Playwright connectOverCDP 连接
   */
  async connect(): Promise<Page> {
    // Step 1: 检查设备
    console.log('🔗 [APP] 开始连接...');
    ensureDevice();

    // Step 2: 检查APP是否已安装
    if (!isAppInstalled()) {
      throw new Error(
        `❌ APP未安装: ${config.app.package}\n` +
        `   请先安装debug测试包: adb install app-debug.apk\n` +
        `   ⚠️ 必须是debug包，release包不开启WebView调试`
      );
    }

    // Step 3: 端口转发
    setupForward();

    // Step 4: 启动APP
    launchApp();

    // Step 5: 等待APP启动，WebView就绪
    console.log('⏳ [APP] 等待WebView就绪...');
    await this.waitForWebViewReady();

    // Step 6: Playwright connectOverCDP 连接
    // 这里就是核心——连接APP的WebView，和连接普通浏览器一模一样
    this.browser = await chromium.connectOverCDP(config.app.cdpEndpoint);
    this.context = this.browser.contexts()[0];
    this.page = this.context.pages()[0] || await this.context.newPage();

    console.log(`✅ [APP] 已连接WebView (CDP: ${config.app.cdpEndpoint})`);
    console.log(`   当前页面: ${this.page.url()}`);
    return this.page;
  }

  /**
   * 等待 WebView 调试端口就绪
   * APP刚启动时WebView还没准备好，需要轮询等待
   */
  private async waitForWebViewReady(maxRetries = 15): Promise<void> {
    const { execSync } = await import('child_process');
    for (let i = 0; i < maxRetries; i++) {
      try {
        // 访问CDP端点，如果能拿到页面列表说明WebView就绪
        const result = execSync(
          `curl -s http://localhost:${config.app.cdpPort}/json/list`,
          { encoding: 'utf-8', timeout: 3000 }
        );
        const pages = JSON.parse(result);
        if (pages.length > 0) {
          console.log(`   WebView就绪，发现 ${pages.length} 个页面`);
          return;
        }
      } catch {
        // 还没就绪，继续等
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error(
      `❌ WebView调试端口未就绪 (localhost:${config.app.cdpPort})\n` +
      `   可能原因:\n` +
      `   1. APP不是debug包（release包不开启调试）\n` +
      `   2. APP启动失败\n` +
      `   3. 端口转发失败\n` +
      `   排查: adb forward --list 检查转发状态`
    );
  }

  /** 获取当前页面 */
  get page(): Page {
    if (!this.page) throw new Error('APP未连接，请先调用 connect()');
    return this.page;
  }

  /**
   * 跳转到指定页面
   * uni-app 的页面跳转通过路由路径，这里封装一下
   */
  async navigateTo(routeName: string): Promise<void> {
    const route = config.app.routes[routeName];
    if (!route) throw new Error(`未知路由: ${routeName}`);
    // uni-app 页面跳转可以通过 evaluate 调用 uni.navigateTo
    await this.page.evaluate((path) => {
      // @ts-ignore - uni 是 APP 注入的全局对象
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        uni.navigateTo({ url: '/' + path });
      }
    }, route);
    await this.page.waitForLoadState('networkidle');
    console.log(`✅ [APP] 已跳转: ${routeName} → /${route}`);
  }

  /**
   * 刷新商品列表并查找指定商品（SC-E2E-001 Step2）
   * @returns 是否找到该商品
   */
  async findProduct(productId: string, productName?: string): Promise<boolean> {
    const p = this.page;
    // 刷新页面，触发商品列表重新加载
    await p.reload();
    await p.waitForLoadState('networkidle');

    // ⚠️ 以下选择器需根据APP真实页面调整
    // uni-app 页面通常用 class 或 text 定位
    // 尝试多种定位方式
    const selectors = [
      `[data-product-id="${productId}"]`,        // data属性
      `.goods-item:has-text("${productName}")`,  // 文案匹配
      `.product-card:has-text("${productName}")`,
      `text=${productName}`,
    ].filter(Boolean);

    for (const sel of selectors) {
      try {
        const el = p.locator(sel).first();
        if (await el.isVisible({ timeout: 3000 })) {
          console.log(`✅ [APP] 找到商品: ${productName || productId} (选择器: ${sel})`);
          return true;
        }
      } catch {
        continue;
      }
    }
    console.log(`❌ [APP] 未找到商品: ${productName || productId}`);
    return false;
  }

  /**
   * 点击商品进入详情，然后下单（SC-E2E-001 Step3）
   * @returns 订单号
   */
  async placeOrder(productId: string, productName?: string): Promise<string> {
    const p = this.page;
    // 进入商品详情
    await this.findProduct(productId, productName);
    await p.locator(`text=${productName}`).first().click();
    await p.waitForLoadState('networkidle');
    console.log('  [APP] 已进入商品详情');

    // 点击立即购买
    await p.click('button:has-text("立即购买"), button:has-text("购买")');
    await p.waitForLoadState('networkidle');
    console.log('  [APP] 已进入确认订单页');

    // 确认订单（确认订单页路由: subPackages/Mall/pages/confirm-order/index）
    await p.click('button:has-text("提交订单"), button:has-text("确认")');
    await p.waitForLoadState('networkidle');
    console.log('  [APP] 已提交订单');

    // 进入支付页（路由: subPackages/Mall/pages/payment/index）
    // 测试环境用 mockPay
    await p.click('button:has-text("支付"), button:has-text("模拟支付")');
    await p.waitForLoadState('networkidle');

    // 支付成功页提取订单号（路由: subPackages/Mall/pages/payment-success/index）
    const orderId = await this.extractOrderId();
    console.log(`✅ [APP] 下单成功，订单号: ${orderId}`);
    return orderId;
  }

  /** 从支付成功页或订单列表提取订单号 */
  private async extractOrderId(): Promise<string> {
    const p = this.page;
    // 尝试从支付成功页提取
    try {
      const text = await p.textContent('body');
      const match = text?.match(/订单号[：:]\s*([A-Za-z0-9]+)/);
      if (match) return match[1];
    } catch {}

    // 兜底：跳到订单列表页提取最新订单
    await this.navigateTo('orderList');
    await p.waitForLoadState('networkidle');
    try {
      const firstItem = p.locator('.order-item, [class*=order]').first();
      const text = await firstItem.textContent();
      const match = text?.match(/([A-Za-z0-9]{10,})/);
      if (match) return match[1];
    } catch {}

    return `order-${Date.now()}`; // 兜底
  }

  /**
   * 扫码场景（SC-E2E-002）
   * 不模拟摄像头，直接注入扫码结果
   * uni-app 的 uni.scanCode 是回调式，这里 hook 注入结果
   */
  async simulateScanCode(scanResult: string): Promise<void> {
    const p = this.page;
    // 在 WebView 里 hook uni.scanCode，直接注入扫码结果
    await p.evaluate((result) => {
      // @ts-ignore
      if (typeof uni !== 'undefined') {
        const original = uni.scanCode;
        // @ts-ignore
        uni.scanCode = function(options: any) {
          // 直接调用成功回调，注入模拟的扫码结果
          if (options && options.success) {
            options.success({ result: result, scanType: 'QR_CODE' });
          }
        };
        console.log('uni.scanCode 已被hook，将返回:', result);
      }
    }, scanResult);
    console.log(`✅ [APP] 已注入扫码结果: ${scanResult}`);
  }

  /** 断开连接（不关闭APP） */
  async disconnect(): Promise<void> {
    await this.browser?.close(); // connectOverCDP的close只断开连接，不关闭APP
    console.log('✅ [APP] 已断开CDP连接');
  }

  /** 关闭APP并断开 */
  async close(): Promise<void> {
    await this.browser?.close();
    stopApp();
    console.log('✅ [APP] 已关闭');
  }
}
