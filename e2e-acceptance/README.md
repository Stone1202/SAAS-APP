# SAAS 跨端端到端验收框架

> Playwright + uni-app CDP 方案 —— 用同一套 Playwright API 同时操控租户后台 Web 和 APP

## 这是什么

一个跨端验收框架，解决"后台发商品→APP下单→后台看订单"这类跨端联动场景的自动化验收。

```
租户后台 Web ──Playwright launch──→ 操控浏览器
                                        ↓ 共享数据(ID传递)
APP ────Playwright connectOverCDP──→ 连接APP的WebView，同一套API操控
```

## 目录结构

```
e2e-acceptance/
├─ src/
│  ├─ config.ts                    # 环境配置（改这里！）
│  ├─ contexts/
│  │  ├─ shared-data.ts            # 共享数据上下文（跨端ID传递）
│  │  ├─ admin-web.ts              # 后台Web操控（Playwright launch）
│  │  └─ app-cdp.ts                # APP操控（Playwright connectOverCDP）
│  ├─ utils/
│  │  ├─ adb-helper.ts             # adb工具（设备/端口/启停）
│  │  └─ connect-app.ts            # 连接测试工具
│  └─ scenarios/
│     ├─ SC-E2E-001-跨端下单闭环.ts  # 后台发商品→APP下单→后台看订单
│     └─ SC-E2E-002-扫码绑定门店.ts  # APP扫码绑定门店（注入式）
├─ scripts/
│  └─ check-env.sh                 # 环境检查
├─ package.json
└─ tsconfig.json
```

## 快速开始

### 1. 检查环境

```bash
cd e2e-acceptance
npm run check-env
```

### 2. 配置环境

编辑 `src/config.ts`，修改以下配置：

```ts
adminWeb: {
  url: 'https://你的测试环境后台地址',      // ← 改这里
  accounts: {
    tenantAdmin: { username: '实际账号', password: '实际密码' },  // ← 改这里
  },
},
app: {
  package: 'uni.UNI__F1AD355',              // ← APP包名，用 adb shell pm list packages 查
},
api: {
  baseUrl: 'https://你的测试环境API地址',    // ← 改这里
},
```

### 3. 准备 Android 环境

```bash
# 启动Android模拟器（Android Studio → AVD Manager）
# 或用USB连接真机，开启USB调试

# 安装debug测试包（必须是debug包！release包不开启WebView调试）
adb install app-debug.apk

# 启动APP
adb shell monkey -p uni.UNI__F1AD355 -c android.intent.category.LAUNCHER 1

# 端口转发（建立电脑↔APP WebView的调试通道）
adb forward tcp:9222 localabstract:webview_devtools_remote
```

### 4. 测试连接

```bash
npm run connect-app
```

看到 `✅ CDP连接测试通过` 说明可以操控 APP 了。

### 5. 运行验收

```bash
npm run test:SC-001   # 跨端下单闭环
npm run test:SC-002   # 扫码绑定门店
```

## 核心原理

### 后台 Web vs APP 的连接方式

```ts
// 后台Web：自己启动浏览器（你已熟悉）
const adminBrowser = await chromium.launch();
const adminPage = await adminBrowser.newPage();
await adminPage.goto('https://后台地址');

// APP：连接APP的WebView（核心创新）
const appBrowser = await chromium.connectOverCDP('http://localhost:9222');
const appPage = appBrowser.contexts()[0].pages()[0];

// 之后操作完全一样！
adminPage.click('button');   // 操控后台
appPage.click('button');     // 操控APP  ← 同一套API
```

### 跨端数据传递

```ts
// 后台发布商品，拿到ID
const productId = await adminWeb.publishProduct('测试商品');
sharedData.set('productId', productId);   // 写入共享

// APP用这个ID验证可见性
const id = sharedData.get('productId');
const found = await appCdp.findProduct(id, '测试商品');  // 读取共享
```

### 原生能力验收（注入式）

不模拟摄像头扫码，直接 hook `uni.scanCode` 注入结果：

```ts
await appCdp.simulateScanCode('https://xxx/invite?code=ABC123');
// APP 内部 uni.scanCode 被替换，直接返回这个结果
```

## 当前状态

| 检查项 | 状态 |
|--------|------|
| Playwright | ✅ 已安装 |
| adb | ✅ 已安装 |
| Android 模拟器 | ⬜ 需启动 |
| debug 测试包 | ⬜ 需安装 |
| 后台测试环境地址 | ⬜ 需配置 |
| 测试账号 | ⬜ 需配置 |

## 脚本中的 ⚠️ 标记

代码中所有 `⚠️` 标注的地方，表示选择器/操作路径需要根据**真实系统页面**调整。
反编译只能拿到页面路由和API，无法拿到具体DOM结构，这些需要连上真实系统后微调。
