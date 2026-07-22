#!/bin/bash
# ============================================
# 环境检查脚本
# 检查运行跨端验收脚本所需的所有依赖
# ============================================

echo ""
echo "═══════════════════════════════════════════════"
echo "  跨端验收环境检查"
echo "═══════════════════════════════════════════════"
echo ""

PASS=0
FAIL=0
WARN=0

check() {
  local name="$1"
  local cmd="$2"
  local required="$3"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "  ✅ $name"
    PASS=$((PASS+1))
  else
    if [ "$required" = "required" ]; then
      echo "  ❌ $name (必需)"
      FAIL=$((FAIL+1))
    else
      echo "  ⚠️  $name (可选)"
      WARN=$((WARN+1))
    fi
  fi
}

echo "─── 基础环境 ───"
check "Node.js" "node -v" "required"
check "npm" "npm -v" "required"
check "TypeScript" "npx tsc --version" "required"
check "Playwright" "npx playwright --version" "required"

echo ""
echo "─── Android 环境 ───"
check "adb (Android Platform Tools)" "adb version" "required"

echo ""
echo "─── Android 设备/模拟器 ───"
DEVICES=$(adb devices 2>/dev/null | tail -n +2 | grep -v "^$" | wc -l | tr -d ' ')
if [ "$DEVICES" -gt 0 ]; then
  echo "  ✅ 检测到 $DEVICES 台设备:"
  adb devices 2>/dev/null | tail -n +2 | grep -v "^$" | while read line; do
    echo "     - $line"
  done
  PASS=$((PASS+1))
else
  echo "  ❌ 未检测到Android设备/模拟器"
  echo "     请启动Android模拟器 (Android Studio → AVD Manager)"
  echo "     或用USB连接真机并开启USB调试"
  FAIL=$((FAIL+1))
fi

echo ""
echo "─── APP 安装检查 ───"
# 从 config.ts 读取包名（简化处理，实际可解析ts）
APP_PKG="UNI__F1AD355"
if adb shell pm list packages 2>/dev/null | grep -qi "$APP_PKG"; then
  echo "  ✅ APP已安装 ($APP_PKG)"
  PASS=$((PASS+1))
else
  echo "  ⚠️  APP未安装 ($APP_PKG)"
  echo "     请安装debug测试包: adb install app-debug.apk"
  echo "     ⚠️ 必须是debug包，release包不开启WebView调试"
  WARN=$((WARN+1))
fi

echo ""
echo "─── 端口转发检查 ───"
if adb forward --list 2>/dev/null | grep -q "9222"; then
  echo "  ✅ 端口转发已配置 (localhost:9222)"
  PASS=$((PASS+1))
else
  echo "  ⚠️  端口转发未配置"
  echo "     运行: adb forward tcp:9222 localabstract:webview_devtools_remote"
  WARN=$((WARN+1))
fi

echo ""
echo "─── WebView 调试端口检查 ───"
if curl -s http://localhost:9222/json/list 2>/dev/null | grep -q "webSocketDebuggerUrl"; then
  echo "  ✅ WebView调试端口可访问"
  PASS=$((PASS+1))
else
  echo "  ⚠️  WebView调试端口不可访问"
  echo "     可能APP未启动或不是debug包"
  WARN=$((WARN+1))
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  检查结果: ✅$PASS 通过  ❌$FAIL 缺失  ⚠️$WARN 警告"
echo "═══════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "❌ 存在必需项缺失，请先解决后再运行验收脚本"
  echo ""
  echo "快速启动指南:"
  echo "  1. 安装Android模拟器: 打开Android Studio → AVD Manager → 创建模拟器"
  echo "  2. 安装debug包: adb install <debug.apk路径>"
  echo "  3. 启动APP: adb shell monkey -p <包名> -c android.intent.category.LAUNCHER 1"
  echo "  4. 端口转发: adb forward tcp:9222 localabstract:webview_devtools_remote"
  echo "  5. 验证连接: npm run connect-app"
  echo "  6. 运行验收: npm run test:SC-001"
  exit 1
else
  echo ""
  echo "✅ 环境就绪！可以运行验收脚本"
  echo "  连接测试: npm run connect-app"
  echo "  跨端下单: npm run test:SC-001"
  echo "  扫码绑定: npm run test:SC-002"
  exit 0
fi
