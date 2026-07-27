#!/usr/bin/env bash
set -e

# ═════════════════════════════════════════════════════
# POM 多项目一键构建脚本
# EdgeOne Pages 自动部署用：npm run build:all
# ═════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE="$(dirname "$SCRIPT_DIR")"
ARTIFACTS="$WORKSPACE/deploy/artifacts"
PORTAL_TEMPLATE="$WORKSPACE/deploy/access-portal/index.html"

echo "=== POM Build All ==="
echo "Workspace: $WORKSPACE"
echo "Artifacts: $ARTIFACTS"

# 清理旧产物
rm -rf "$ARTIFACTS"
mkdir -p "$ARTIFACTS"

# ── 定义成员项目 ──
# 格式: "项目目录名|输出名|成员"
PROJECTS=(
  "AI-SCRM|AI-SCRM|jojo"
  "SAAS|SAAS|jojo"
  "糖尿病智慧健康平台|糖尿病智慧健康平台|jojo"
)

# ── 逐个构建 ──
for entry in "${PROJECTS[@]}"; do
  IFS='|' read -r dir slug member <<< "$entry"
  
  PROJECT_DIR="$WORKSPACE/projects/$dir"
  VERSION_DIR="$ARTIFACTS/$member/$slug/v1.0.0"
  
  echo ""
  echo "--- Building: $slug ($member) ---"
  
  if [ ! -d "$PROJECT_DIR" ]; then
    echo "  SKIP: directory not found: $PROJECT_DIR"
    continue
  fi
  
  # 1. 安装依赖
  echo "  [1/3] npm install..."
  cd "$PROJECT_DIR"
  npm install --prefer-offline --no-audit --no-fund 2>&1 | tail -3
  
  # 2. 构建
  echo "  [2/3] npm run build:sim..."
  npm run build:sim 2>&1 | tail -5
  
  # 3. 复制产物到 artifacts
  if [ -d "$PROJECT_DIR/dist" ]; then
    mkdir -p "$VERSION_DIR"
    cp -r "$PROJECT_DIR/dist"/* "$VERSION_DIR/"
    echo "  [3/3] Copied to: $member/$slug/v1.0.0/"
  else
    echo "  [3/3] ERROR: dist/ not found after build!"
  fi
done

# ── 门户页面 ──
if [ -f "$PORTAL_TEMPLATE" ]; then
  cp "$PORTAL_TEMPLATE" "$ARTIFACTS/index.html"
  echo ""
  echo "=== Portal copied ==="
else
  echo ""
  echo "=== WARNING: Portal template not found ==="
fi

# ── 列出产物结构 ──
echo ""
echo "=== Final artifacts ==="
find "$ARTIFACTS" -type f | sort | head -30
echo "=== Done ==="
