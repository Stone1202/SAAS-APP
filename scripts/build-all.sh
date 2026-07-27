#!/usr/bin/env bash
set -eo pipefail

# ═════════════════════════════════════════════════════
# POM 多项目一键构建脚本
# EdgeOne Pages 自动部署用：npm run build:all
# ═════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE="$(dirname "$SCRIPT_DIR")"
ARTIFACTS="$WORKSPACE/deploy/artifacts"
PORTAL_TEMPLATE="$WORKSPACE/deploy/access-portal/index.html"
EDGEONE_CONFIG="$WORKSPACE/deploy/edgeone-pages.json"

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
  "SugarMate|SugarMate|jojo"
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
  npm install --no-audit --no-fund
  
  # 2. 构建（设置 base 路径，让资源引用指向正确的子目录）
  export VITE_BASE_PATH="/$member/$slug/v1.0.0/"
  echo "  [2/3] npm run build:sim (base=$VITE_BASE_PATH)..."
  npm run build:sim || { echo "  [2/3] BUILD FAILED for $slug, skipping..."; continue; }
  
  # 3. 复制产物到 artifacts
  if [ -d "$PROJECT_DIR/dist" ]; then
    mkdir -p "$VERSION_DIR"
    cp -r "$PROJECT_DIR/dist"/* "$VERSION_DIR/"
    # 删除项目级 edgeone.json，避免覆盖根级 rewrite 配置
    rm -f "$VERSION_DIR/edgeone.json"
    echo "  [3/3] Copied to: $member/$slug/v1.0.0/ ($(find "$VERSION_DIR" -type f | wc -l) files)"
  else
    echo "  [3/3] ERROR: dist/ not found after build, skipping..."
    continue
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

# ── EdgeOne Pages SPA fallback 配置 ──
# EdgeOne Pages 只识别根级 404.html。当访问子项目 SPA 的深层路由时，
# 用根级 404.html 中的 JS 动态拉取对应 SPA 的 index.html 并替换文档，
# 这样 URL 保持不变，Vue/React Router 能按深层路由正确渲染。
ROOT_404_TEMPLATE="$WORKSPACE/deploy/404-template.html"
if [ -f "$ROOT_404_TEMPLATE" ]; then
  cp "$ROOT_404_TEMPLATE" "$ARTIFACTS/404.html"
  echo "=== Root 404 fallback created ==="
else
  echo "=== WARNING: Root 404 template not found ==="
fi

# ── 列出产物结构 ──
echo ""
echo "=== Final artifacts ==="
find "$ARTIFACTS" -type f | sort | head -30
echo "=== Done ==="
