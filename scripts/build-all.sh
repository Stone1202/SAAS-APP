#!/usr/bin/env bash
set -eo pipefail

# ═════════════════════════════════════════════════════
# POM 多项目一键构建脚本（EdgeOne Pages 自动部署）
#
# 新增项目只需在 PROJECTS 数组中加一行，无需改 404 模板。
# 详细说明：deploy/DEPLOY-GUIDE.md
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
# 新增项目只需在此数组加一行，无需改 404 模板或其他配置。
# 详见：deploy/DEPLOY-GUIDE.md §4
# 成员-项目矩阵（来源：PROJECT-INDEX.yml）
# 格式: "项目目录名|输出名|成员"
# 新增成员/项目只需在此数组加一行
PROJECTS=(
  # --- Jojo (admin) ---
  "AI-SCRM|AI-SCRM|jojo"
  "SAAS|SAAS|jojo"
  "SugarMate|SugarMate|jojo"
  # --- 李政 (Eltonliz) ---
  "AI-SCRM|AI-SCRM|Eltonliz"
  "SAAS|SAAS|Eltonliz"
  # --- 林金梅 (linjinmei) ---
  "SAAS|SAAS|linjinmei"
  # --- 付永健 (fuyongjian) ---
  "AI-SCRM|AI-SCRM|fuyongjian"
  "SAAS|SAAS|fuyongjian"
  "SugarMate|SugarMate|fuyongjian"
  # --- 江如彬 (jiangrubin) ---
  "AI-SCRM|AI-SCRM|jiangrubin"
  "SAAS|SAAS|jiangrubin"
  "SugarMate|SugarMate|jiangrubin"
  # --- 庄景翔 (zhuangjingxiang) ---
  "SAAS|SAAS|zhuangjingxiang"
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
    echo "  [3/4] Copied Vite build: $member/$slug/v1.0.0/ ($(find "$VERSION_DIR" -type f | wc -l) files)"
    
    # 3.5 复制 PRD HTML 文档（如果存在）
    PRD_HTML_SRC="$PROJECT_DIR/docs/09-versions/v1.0.0/prd-html"
    PRD_HTML_DST="$VERSION_DIR/prd"
    if [ -d "$PRD_HTML_SRC" ]; then
      mkdir -p "$PRD_HTML_DST"
      cp -r "$PRD_HTML_SRC"/* "$PRD_HTML_DST/"
      echo "  [3.5/4] Copied PRD HTML docs: $member/$slug/v1.0.0/prd/ ($(find "$PRD_HTML_DST" -type f | wc -l) files)"
    else
      echo "  [3.5/4] No PRD HTML docs found, skipping"
    fi
    echo "  [4/4] Done: $member/$slug/v1.0.0/"
  else
    echo "  [3/4] ERROR: dist/ not found after build, skipping..."
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
# 
# 方案说明：EdgeOne Pages 子目录 SPA 深层路由不自动回退 → 根级 404.html
# 通过 JS fetch + document.write 动态加载对应子项目的 index.html
#
# ❌ 禁止：使用 edgeone.json rewrites（会破坏静态资源）
# ❌ 禁止：在子目录放 edgeone.json 或 404.html（EdgeOne Pages 不识别）
# ✅ 正确：仅此一段代码，构建时自动生成 deploy/artifacts/404.html
#
# 详见：deploy/DEPLOY-GUIDE.md §3
ROOT_404_TEMPLATE="$WORKSPACE/deploy/404-template.html"
if [ -f "$ROOT_404_TEMPLATE" ]; then
  cp "$ROOT_404_TEMPLATE" "$ARTIFACTS/404.html"
  echo "=== Root 404 fallback created ==="
else
  echo "=== WARNING: Root 404 template not found ==="
fi

# ── 生成 manifest.json（门户加载数据源） ──
# 扫描 artifacts 目录结构自动生成，确保门户始终与实际产物一致
echo ""
echo "=== Generating manifest.json ==="
MANIFEST="$ARTIFACTS/manifest.json"
python3 -c "
import json, os, sys
from collections import defaultdict

artifacts = '$ARTIFACTS'
manifest = {'generated_at': '', 'members': []}

# 扫描成员目录
if os.path.isdir(artifacts):
    for member_id in sorted(os.listdir(artifacts)):
        member_path = os.path.join(artifacts, member_id)
        if not os.path.isdir(member_path) or member_id.startswith('.'):
            continue
        member = {'id': member_id, 'projects': []}
        for proj_slug in sorted(os.listdir(member_path)):
            proj_path = os.path.join(member_path, proj_slug)
            if not os.path.isdir(proj_path):
                continue
            versions = sorted([v for v in os.listdir(proj_path) if os.path.isdir(os.path.join(proj_path, v))])
            member['projects'].append({'slug': proj_slug, 'versions': versions})
        if member['projects']:
            manifest['members'].append(member)

from datetime import datetime, timezone, timedelta
t = datetime.now(timezone(timedelta(hours=8)))
manifest['generated_at'] = t.strftime('%Y-%m-%dT%H:%M:%S+08:00')

with open('$MANIFEST', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print(f'  manifest.json written ({len(manifest[\"members\"])} members)')
"
echo "=== Manifest generated ==="

# ── 列出产物结构 ──
echo ""
echo "=== Final artifacts ==="
find "$ARTIFACTS" -type f | sort | head -30
echo "=== Done ==="
