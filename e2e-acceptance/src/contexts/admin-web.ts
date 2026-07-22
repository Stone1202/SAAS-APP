/**
 * 后台 Web Context
 *
 * 用 Playwright.launch 启动浏览器，操控租户后台网页。
 * 这是你已经熟悉的模式。
 */

import { chromium, type Browser, type Page } from 'playwright';
import { config } from '../config.js';

export class AdminWebContext {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /** 启动浏览器并打开后台登录页 */
  async connect(): Promise<Page> {
    this.browser = await chromium.launch({ headless: false }); // 有头模式，方便观察
    this.page = await this.browser.newPage();
    await this.page.goto(config.adminWeb.url);
    console.log(`✅ [后台Web] 浏览器已启动，打开: ${config.adminWeb.url}`);
    return this.page;
  }

  /** 获取当前页面 */
  get page(): Page {
    if (!this.page) throw new Error('后台Web未连接，请先调用 connect()');
    return this.page;
  }

  /** 登录租户后台 */
  async login(): Promise<void> {
    const { username, password } = config.adminWeb.accounts.tenantAdmin;
    const p = this.page;
    // ⚠️ 以下选择器需根据真实后台页面调整
    await p.fill('[placeholder*="账号"], input[type=text]', username);
    await p.fill('[placeholder*="密码"], input[type=password]', password);
    await p.click('button:has-text("登录"), button[type=submit]');
    await p.waitForLoadState('networkidle');
    console.log('✅ [后台Web] 已登录租户后台');
  }

  /**
   * 发布商品（SC-E2E-001 Step1）
   * @returns 商品ID（写入共享数据，APP端用这个ID验证可见性）
   */
  async publishProduct(productName: string): Promise<string> {
    const p = this.page;
    // ⚠️ 以下操作路径需根据真实后台菜单调整
    // 导航到商品管理
    await p.click('text=商品管理');
    await p.click('text=新建商品, text=发布商品, button:has-text("新增")');
    // 填写商品信息
    await p.fill('[placeholder*="商品名称"], input[name=name]', productName);
    await p.fill('[placeholder*="价格"], input[name=price]', '99.00');
    // ... 其他必填项
    await p.click('button:has-text("保存"), button:has-text("发布")');
    await p.waitForLoadState('networkidle');

    // 从页面/网络请求中提取商品ID
    // 方法1: 从URL提取  方法2: 从接口响应提取  方法3: 从列表页提取
    const productId = await this.extractProductId(productName);
    console.log(`✅ [后台Web] 已发布商品: ${productName} → ID: ${productId}`);
    return productId;
  }

  /** 从商品列表提取商品ID */
  private async extractProductId(productName: string): Promise<string> {
    const p = this.page;
    // ⚠️ 根据真实页面调整，这里给出思路
    // 方法A: 拦截接口响应
    // 方法B: 从列表DOM提取 data-id 属性
    // 方法C: 从详情页URL提取
    await p.click('text=商品管理');
    const item = p.locator(`tr:has-text("${productName}")`).first();
    await item.waitFor({ timeout: config.timeout.elementWait });
    // 尝试从 data 属性或链接提取ID
    const id = await item.getAttribute('data-id')
      || await item.locator('a').first().getAttribute('href').then(h => h?.match(/(\d+)/)?.[1] || '')
      || `product-${Date.now()}`; // 兜底
    return id;
  }

  /**
   * 查看订单列表，验证指定订单是否存在（SC-E2E-001 Step4）
   */
  async verifyOrderExists(orderId: string): Promise<boolean> {
    const p = this.page;
    await p.click('text=订单管理');
    await p.waitForLoadState('networkidle');
    // 搜索订单
    await p.fill('[placeholder*="订单号"], input[name=orderNo]', orderId);
    await p.press('[placeholder*="订单号"]', 'Enter');
    await p.waitForLoadState('networkidle');
    const exists = await p.locator(`text=${orderId}`).first().isVisible()
      .catch(() => false);
    console.log(`✅ [后台Web] 订单 ${orderId} 存在性: ${exists ? '✅ 已找到' : '❌ 未找到'}`);
    return exists;
  }

  /** 关闭浏览器 */
  async close(): Promise<void> {
    await this.browser?.close();
    console.log('✅ [后台Web] 浏览器已关闭');
  }
}
