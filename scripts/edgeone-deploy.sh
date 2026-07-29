#!/bin/bash
# ============================================
# EdgeOne 部署脚本 — 仅复制已构建产物，不做 npm build
# dist 已由本地环境构建好并通过 Git 提交
# ============================================
set -e

ARTIFACTS_DIR="deploy/artifacts"

echo "=== EdgeOne Deploy: 复制已构建产物 ==="

# 确保产物目录存在
mkdir -p "$ARTIFACTS_DIR"

# ── 0. 门户入口页 ──
echo "[0/3] 复制门户文件"
cp deploy/access-portal/index.html "$ARTIFACTS_DIR/index.html"
cp deploy/access-portal/manifest.json "$ARTIFACTS_DIR/manifest.json"
echo "  ✓ index.html + manifest.json"

# ── 1. 复制 SAAS 项目 dist ──
echo "[1/3] 复制 SAAS 项目"
if [ -d "projects/SAAS/dist" ] && [ -n "$(ls -A projects/SAAS/dist 2>/dev/null)" ]; then
  MEMBERS="jojo Eltonliz fuyongjian jiangrubin linjinmei zhuangjingxiang"
  for member in $MEMBERS; do
    TARGET="$ARTIFACTS_DIR/$member/SAAS/v1.0.0"
    mkdir -p "$TARGET"
    cp -R projects/SAAS/dist/* "$TARGET/"
    echo "  ✓ $member/SAAS/v1.0.0/"
  done
else
  echo "  ⚠ SAAS dist 目录为空，跳过"
fi

# ── 2. 复制 AI-SCRM 项目 dist ──
echo "[2/3] 复制 AI-SCRM 项目"
if [ -d "projects/AI-SCRM/dist" ] && [ -n "$(ls -A projects/AI-SCRM/dist 2>/dev/null)" ]; then
  MEMBERS="jojo Eltonliz fuyongjian jiangrubin linjinmei zhuangjingxiang"
  for member in $MEMBERS; do
    TARGET="$ARTIFACTS_DIR/$member/AI-SCRM/v1.0.0"
    mkdir -p "$TARGET"
    cp -R projects/AI-SCRM/dist/* "$TARGET/"
    echo "  ✓ $member/AI-SCRM/v1.0.0/"
  done
else
  echo "  ⚠ AI-SCRM dist 目录为空，跳过"
fi

echo ""
echo "=== EdgeOne 部署准备完成 ==="
echo "产物目录: $ARTIFACTS_DIR/"
ls -d "$ARTIFACTS_DIR"/*/
