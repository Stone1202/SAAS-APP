/**
 * 验收环境配置
 *
 * ⚠️ 首次使用前请修改以下配置：
 * 1. ADMIN_WEB_URL  — 租户后台测试环境地址（找研发要）
 * 2. APP_PACKAGE    — APP包名（adb shell pm list packages 查）
 * 3. TEST_ACCOUNTS  — 测试账号（找研发要测试环境账号）
 * 4. API_BASE_URL   — 后端API地址（用于后端直查兜底）
 */

export const config = {
  // ─── 租户后台 Web（Playwright launch 启动浏览器）───
  adminWeb: {
    url: process.env.ADMIN_WEB_URL || 'https://your-test-admin.example.com',
    // 测试账号
    accounts: {
      tenantAdmin: { username: 'admin', password: 'admin123' }, // 租户管理员
    },
  },

  // ─── APP（Playwright connectOverCDP 连接 WebView）───
  app: {
    // APP 包名（uni-app打包后的Android包名，用 adb shell pm list packages 查）
    package: process.env.APP_PACKAGE || 'uni.UNI__F1AD355',
    // APP内部名称（manifest.json里的name）
    appName: '追伴',
    // WebView调试端口（adb forward 转发后的本地端口）
    cdpPort: 9222,
    // CDP连接地址
    cdpEndpoint: `http://localhost:9222`,
    // APP页面路由（从反编译 app-config-service.js 提取，共80页）
    routes: {
      index: 'pages/index/index',                              // 首页
      shop: 'pages/shop/index',                                // 商城
      login: 'pages/auth/login',                               // 登录
      goodsDetail: 'subPackages/Mall/pages/goods-detail/index', // 商品详情
      confirmOrder: 'subPackages/Mall/pages/confirm-order/index',// 确认订单
      payment: 'subPackages/Mall/pages/payment/index',         // 支付
      paymentSuccess: 'subPackages/Mall/pages/payment-success/index', // 支付结果
      orderList: 'subPackages/Mall/pages/sub-order/order-list/index', // 订单列表
      orderDetail: 'subPackages/Mall/pages/sub-order/order-detail/index', // 订单详情
      liveSquare: 'subPackages/LiveBroadcast/pages/live-square/index', // 直播广场
      liveRoom: 'subPackages/JTLive/pages/live-room/index',    // 直播间
    } as Record<string, string>,
  },

  // ─── 后端API（后端直查兜底，拿"系统真相"）───
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://your-test-api.example.com',
    // 从反编译提取的95个接口（按域分组，验收断言用）
    endpoints: {
      // 订单域（18个）— 跨端下单闭环核心
      order: {
        createOrder: '/api/app/finance/order/createOrder',
        preOrder: '/api/app/finance/order/preOrder',
        payOrder: '/api/app/finance/order/payOrder',
        mockPay: '/api/app/finance/order/mockPay',
        cancelOrder: '/api/app/finance/order/cancelOrder',
        detail: '/api/app/finance/order/detail',
        list: '/api/app/finance/order/list',
      },
      // 商品域（5个）
      spu: {
        listOfStore: '/api/app/spu/listOfStore',
        search: '/api/app/spu/search',
        guessYouLike: '/api/app/spu/guess-you-like',
      },
      // 直播域（13个）
      live: {
        squarePage: '/api/app/live/square/page',
        enterRoom: '/api/app/live/enterRoomDetail',
        productList: '/api/app/live/product/list',
        productExplaining: '/api/app/live/product/explaining',
      },
      // 营销卡券域（8个）
      coupon: {
        send: '/api/app/marketingCoupon/send',
        receive: '/api/app/marketingCoupon/receive',
        myList: '/api/app/marketingCoupon/my-list',
      },
      // 邀请/身份域（6个）
      invite: {
        acceptInvite: '/api/app/invite/acceptInvite',
        switchIdentity: '/api/app/invite/switchIdentity',
      },
    },
  },

  // ─── adb 配置 ───
  adb: {
    // WebView调试socket名称（Android标准名称，大多数uni-app通用）
    socketName: 'webview_devtools_remote',
    forwardPort: 9222,
  },

  // ─── 验收超时 ───
  timeout: {
    pageLoad: 30000,    // 页面加载超时
    elementWait: 15000, // 元素等待超时
    apiCall: 10000,     // API调用超时
  },
};

export type AppConfig = typeof config;
