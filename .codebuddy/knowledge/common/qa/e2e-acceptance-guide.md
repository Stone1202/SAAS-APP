# 真实系统端到端验收技术方案

> **版本**：V1.0.0 | **日期**：2026-07-22
> **适用场景**：已发布真实系统（非高保真原型）的跨端端到端验收
> **验证项目**：SAAS追伴/悦享界（后台Web + uni-app APP）
> **经验性质**：实战验证通过的技术方案，非理论设计

---

## 1. 背景与适用范围

### 1.1 为什么需要这个方案

研发部门按高保真原型开发出真实系统并发布测试环境后，需要验证跨端联动场景（如"后台发商品→APP下单→后台看订单"）。传统单端自动化（只跑后台Web或只跑APP）无法验证跨端数据流转。

### 1.2 适用条件

| 条件 | 要求 |
|------|------|
| 后台Web | 已部署测试环境，可通过URL访问 |
| APP | uni-app打包的混合APP（WebView渲染），有APK安装包 |
| 后端API | 测试环境可调通，用于后端直查兜底 |
| Android环境 | 模拟器或真机，adb可连接 |

### 1.3 不适用场景

- 纯原生APP（非WebView渲染，CDP无法连接页面）
- 高保真原型sim模式（单端自洽，无跨端数据流转，详见§7）
- 无APK的H5应用（不需要CDP，直接用Playwright设备模拟）

---

## 2. 技术方案总览

```
租户后台 Web ──Playwright launch──→ 启动浏览器操控网页
                                        ↓ 共享数据上下文(ID传递)
APP ────原生WebSocket+CDP协议──→ 连接APP的WebView操控页面
                                        ↓
后端 API ───curl/API直查────────→ 兜底验证(系统真相)
```

### 2.1 为什么不用 Playwright connectOverCDP

Playwright 的 `connectOverCDP` 连接 Android WebView 时报错 `Browser context management is not supported`——Android WebView 的 CDP 实现不完整，browser 级 CDP 不支持上下文管理。

### 2.2 为什么不用 chrome-remote-interface

`chrome-remote-interface` 库连接页面时报 `socket hang up`——该库内部有额外的 HTTP 请求逻辑，与 Android WebView 的 CDP 实现不兼容。

### 2.3 最终方案：原生 WebSocket + CDP 协议

直接用 `ws` 库连接页面级 WebSocket，手动实现 CDP 协议（JSON 命令/响应）。最轻量、最可控、兼容性最好。

---

## 3. 环境搭建

### 3.1 必需工具

```bash
# Node.js + npm
node -v   # v26+

# Playwright（后台Web操控）
npm install playwright

# ws 库（APP端CDP连接）
npm install ws

# adb（Android设备连接）
brew install android-platform-tools

# Android Studio（模拟器）
brew install --cask android-studio
```

### 3.2 关键步骤

```bash
# 1. 启动模拟器
~/Library/Android/sdk/emulator/emulator -avd Pixel_7

# 2. 安装APK
adb install app.apk

# 3. 强制开启WebView调试（核心突破！）
adb root
adb shell setprop debug.webview.dev true

# 4. 启动APP
adb shell monkey -p <包名> -c android.intent.category.LAUNCHER 1

# 5. 等待APP启动后，查找socket（带PID）
adb shell cat /proc/net/unix | grep webview_devtools_remote

# 6. 端口转发
adb forward tcp:9222 localabstract:webview_devtools_remote_<PID>

# 7. 验证CDP连接
curl -s http://localhost:9222/json/list
```

---

## 4. 核心技术突破

### 4.1 adb root + setprop 强制开启 WebView 调试

**问题**：release 包默认不开启 WebView 调试（`WebView.setWebContentsDebuggingEnabled(false)`），CDP 无法连接。

**突破**：在 root 模拟器上，设置全局属性 `debug.webview.dev=true`，APP 启动时 WebView 会读取此属性自动开启调试。

```bash
adb root                                    # 获取root权限
adb shell setprop debug.webview.dev true    # 设置全局WebView调试标志
# 然后重启APP，socket就会出现
```

**前提**：模拟器必须支持 root（Android Studio 模拟器默认支持）。

### 4.2 动态查找带 PID 的 socket 名称

**问题**：WebView 调试 socket 名称带进程 PID（`webview_devtools_remote_10451`），每次启动 PID 变化。

**方案**：动态查找，不用固定名称。

```ts
function findWebViewSocket(): string {
  const sockets = adb('shell cat /proc/net/unix');
  const match = sockets.match(/@?(webview_devtools_remote_\d+)/);
  return match ? match[1] : 'webview_devtools_remote';
}
```

### 4.3 等待业务页面出现

**问题**：APP 刚启动时只有 View 层页面（`title=View`），业务页面（`title=pages/index/index`）还没加载。

**方案**：轮询等待 `pages/` 页面出现。

```ts
for (let attempt = 0; attempt < 10; attempt++) {
  const pages = await getPages();
  const target = pages.find(p => p.title.includes('pages/'));
  if (target) break;
  await sleep(2000);
}
```

### 4.4 element.click() 触发 Vue @click

**问题**：CDP 的 `Input.dispatchMouseEvent`（坐标点击）不触发 uni-app Vue 的 `@click` 事件。

**方案**：用 `Runtime.evaluate` 执行 `element.click()` 直接触发 DOM click 事件，Vue 的 `@click` 会响应。

```ts
// 不用坐标点击，用JS直接click
await cdp.evaluate(`document.querySelector('...').click()`);
```

---

## 5. 代码结构

```
e2e-acceptance/
├─ src/
│  ├─ config.ts                    # 环境配置(后台URL/APP包名/API地址/80页路由/95个API)
│  ├─ contexts/
│  │  ├─ shared-data.ts            # 跨端共享数据上下文(ID传递)
│  │  ├─ admin-web.ts              # 后台Web操控(Playwright launch)
│  │  └─ app-cdp.ts                # APP操控(CdpClient连接WebView)
│  ├─ utils/
│  │  ├─ cdp-client.ts             # CDP客户端(原生WebSocket+CDP协议)
│  │  ├─ adb-helper.ts             # adb工具(设备/端口/启停/root)
│  │  └─ connect-app-raw.ts        # 连接测试工具
│  └─ scenarios/
│     ├─ SC-E2E-001-跨端下单闭环.ts  # 后台发商品→APP下单→后台看订单
│     └─ SC-E2E-002-扫码绑定门店.ts  # APP扫码绑定(注入式)
└─ package.json
```

### 5.1 CdpClient 高层 API

| API | 说明 | 对标 Playwright |
|-----|------|----------------|
| `evaluate(expr)` | 执行JS | `page.evaluate()` |
| `clickText(text)` | 按文字点击 | `page.click('text=xxx')` |
| `clickNearbyText(anchor, target)` | 锚点附近点击 | 无（独创） |
| `fill(selector, value)` | 输入文本 | `page.fill()` |
| `hasText(text)` | 检查文字存在 | `page.locator().isVisible()` |
| `waitForSelector(sel)` | 等待元素 | `page.waitForSelector()` |
| `waitForText(text)` | 等待文字 | 无 |
| `screenshot(path)` | 截图 | `page.screenshot()` |

### 5.2 跨端数据传递

```ts
// 后台获取商品名 → 写入共享
sharedData.set('productName', '橡皮擦444');

// APP用商品名验证可见性 → 读取共享
const name = sharedData.get('productName');
const found = await appCdp.findProduct(name, name);
```

---

## 6. 踩坑清单

| # | 坑 | 现象 | 解决方案 |
|---|-----|------|---------|
| 1 | Playwright connectOverCDP | `Browser context management is not supported` | 改用原生WebSocket+CDP |
| 2 | chrome-remote-interface | `socket hang up` | 改用ws库直连 |
| 3 | release包无调试socket | `webview_devtools_remote` 不存在 | `adb root` + `setprop debug.webview.dev true` |
| 4 | socket名带PID | 端口转发到错误socket | 动态查找 `grep webview_devtools_remote` |
| 5 | 连到View层而非业务页 | `hasText` 返回false | 轮询等待 `pages/` 页面出现 |
| 6 | 坐标点击不触发Vue事件 | 点击了但页面没跳转 | 用 `element.click()` 代替 `Input.dispatchMouseEvent` |
| 7 | setupForward在launchApp前 | socket不存在 | 调整顺序：setprop→启动APP→等待→查找socket→转发 |
| 8 | 后台drawer遮挡菜单 | 点击"交易"超时 | 先按ESC关闭drawer再操作 |
| 9 | 商城Tab无目标商品 | 切到shop后找不到"橡皮擦444" | 不切Tab，首页"猜您喜欢"有商品 |
| 10 | CDP evaluate返回值路径 | 返回undefined | `result.result.value`（双层result） |

---

## 7. 与高保真原型验收的关系

### 7.1 两个层次的验收

| 层次 | 验收对象 | 技术方案 | 跨端能力 |
|------|---------|---------|---------|
| 原型验收 | 高保真原型(sim模式) | Playwright跑Web原型 | ❌ 单端自洽 |
| 真实系统验收 | 已发布真实系统 | Playwright + CDP + 后端直查 | ✅ 跨端联动 |

### 7.2 经验复用矩阵

| 经验内容 | 原型验收 | 真实系统验收 |
|---------|---------|------------|
| Playwright操控Web | ✅ | ✅ |
| CDP连接APP WebView | ❌（原型无APK） | ✅ |
| 跨端数据传递 | ❌（单端自洽） | ✅ |
| 验收场景设计(SC-E2E) | ✅（场景逻辑复用） | ✅ |
| CdpClient框架 | ❌ | ✅ |
| adb root+setprop | ❌ | ✅ |
| 后端直查兜底 | ❌（无真实后端） | ✅ |
| element.click()触发Vue | ✅（原型也是Vue/React） | ✅ |

### 7.3 原型验收的建议方案

高保真原型（Web应用）的验收用 Playwright 直接跑：
- 后台Web原型：Playwright launch 操控
- APP原型（H5版）：Playwright 设备模拟（devices['iPhone 14']）
- 跨端场景：原型sim模式无法验证跨端，但可以验证交互流程和页面流转
- 真实系统验收时复用原型的验收场景（SC-E2E）和断言逻辑

---

## 8. 验证结果

### 8.1 已验证通过

| 验证项 | 结果 |
|--------|------|
| APP CDP连接（adb root+setprop） | ✅ |
| 后台Web登录（手机号+验证码+协议） | ✅ |
| 后台选项目（教育行业→九天教育） | ✅ |
| 跨端商品可见性（后台"橡皮擦444"=APP"橡皮擦444"） | ✅ |
| APP页面操控（evaluate/clickText/hasText/screenshot） | ✅ |

### 8.2 待完善

| 验证项 | 状态 | 说明 |
|--------|------|------|
| APP下单全流程 | ⚠️ 微调中 | 商品详情→确认订单→支付→订单号提取 |
| 后台订单回流验证 | ⚠️ 微调中 | drawer关闭+交易菜单导航 |
| 后端直查兜底 | ⬜ 待联调 | 需配置API认证 |

---

## 9. 关键认知

1. **一行运行时验证 > 一百条纸面规则**：真实系统验收的价值在于跨端数据流转验证，不是文档检查
2. **uni-app混合APP的CDP方案可行**：通过adb root+setprop强制开启调试，绕过release包限制
3. **原生WebSocket > Playwright connectOverCDP**：对Android WebView兼容性更好
4. **element.click() > 坐标点击**：Vue @click 需要DOM click事件，不是mouse事件
5. **跨端验收的核心是数据一致性**：不是"每端操作能跑通"，而是"同一数据实体在不同端的呈现一致"
