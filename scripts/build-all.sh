#!/bin/bash
# ============================================
# 全量聚合构建脚本 V2.0.0
# V4.1.0升级：goal维度感知——支持按 goal 独立构建 PRD + scope-only 原型，
#             同时从 main 构建聚合原型，版本号从 state.json 动态读取
# ============================================
set -e

# ── 环境变量注入 ──
MEMBER="${MEMBER:-$(git config user.name 2>/dev/null || echo 'unknown')}"
PROJECT="${PROJECT:-}"
GOAL="${GOAL:-}"
BUILD_MODE="${BUILD_MODE:-full}"        # full | prd-only | scope-only | main-only
VITE_BASE_PATH="${VITE_BASE_PATH:-}"
DEPLOY_DIR="${DEPLOY_DIR:-deploy}"
ARTIFACTS_DIR="${ARTIFACTS_DIR:-deploy/artifacts}"

# ── 从 state.json 动态读取版本号 ──
STATE_FILE="projects/${PROJECT}/.codebuddy/state.json"
extract_version() {
  local goal="$1"
  if [ -f "$STATE_FILE" ]; then
    # 查找匹配 goal 的最新 closed stream 版本
    if [ -n "$goal" ]; then
      VERSION=$(node -e "
        const state = require('./${STATE_FILE}');
        const streams = state.streams || [];
        const closed = streams.filter(s => s.stage === 'closed' && s.goal === '${goal}');
        if (closed.length === 0) {
          // 找当前活跃流
          const active = streams.filter(s => s.goal === '${goal}' && s.stage !== 'closed');
          if (active.length > 0) {
            process.stdout.write(active[active.length-1].version);
          } else {
            process.stdout.write('v1.0.0');
          }
        } else {
          process.stdout.write(closed[closed.length-1].version);
        }
      " 2>/dev/null || echo "v1.0.0")
    else
      # 无 goal：取最新 stream 版本（兼容老项目）
      VERSION=$(node -e "
        const state = require('./${STATE_FILE}');
        const streams = state.streams || [];
        if (streams.length === 0) process.stdout.write('v1.0.0');
        else process.stdout.write(streams[streams.length-1].version || 'v1.0.0');
      " 2>/dev/null || echo "v1.0.0")
    fi
  else
    VERSION="v1.0.0"
  fi
  echo "$VERSION"
}

# ── 构建主函数 ──
main() {
  if [ -z "$PROJECT" ]; then
    echo "ERROR: PROJECT is required (e.g., PROJECT=SAAS GOAL=live-audit ./scripts/build-all.sh)"
    exit 1
  fi

  VERSION=$(extract_version "$GOAL")
  echo "BUILD: PROJECT=$PROJECT GOAL=${GOAL:-N/A} VERSION=$VERSION MODE=$BUILD_MODE"

  # 确保产物目录存在
  mkdir -p "$ARTIFACTS_DIR"

  # ── 1. 构建 scope 专属 PRD HTML ──
  if [ "$BUILD_MODE" == "full" ] || [ "$BUILD_MODE" == "prd-only" ]; then
    if [ -n "$GOAL" ]; then
      echo "[1/4] 构建 scope PRD HTML → $ARTIFACTS_DIR/$MEMBER/$PROJECT/$GOAL/$VERSION/prd.html"
      mkdir -p "$ARTIFACTS_DIR/$MEMBER/$PROJECT/$GOAL/$VERSION"

      # 查找 PRD HTML 产物
      PRD_HTML_DIR="projects/${PROJECT}/docs/09-versions/${VERSION}/prd-html"
      if [ -d "$PRD_HTML_DIR" ]; then
        cp -r "$PRD_HTML_DIR/"* "$ARTIFACTS_DIR/$MEMBER/$PROJECT/$GOAL/$VERSION/"
      else
        echo "  ⚠ 未找到 PRD HTML 产物: $PRD_HTML_DIR，跳过"
      fi

      # 2. 构建 scope-only 原型（从 scope 分支构建）
      echo "[2/4] 构建 scope-only 原型 → $ARTIFACTS_DIR/$MEMBER/$PROJECT/$GOAL/$VERSION/"
      SCOPE_BASE_PATH="/$MEMBER/$PROJECT/$GOAL/$VERSION/"
      VITE_BASE_PATH="$SCOPE_BASE_PATH" npm run build:sim --prefix "projects/${PROJECT}" 2>/dev/null || {
        echo "  ⚠ scope-only 原型构建失败，跳过（可能 scope 分支未切换）"
      }
      if [ -d "projects/${PROJECT}/dist" ]; then
        cp -r "projects/${PROJECT}/dist/"* "$ARTIFACTS_DIR/$MEMBER/$PROJECT/$GOAL/$VERSION/"
      fi
    fi
  fi

  # ── 3. 构建 main 聚合原型 ──
  if [ "$BUILD_MODE" == "full" ] || [ "$BUILD_MODE" == "main-only" ]; then
    echo "[3/4] 构建 main 聚合原型 → $ARTIFACTS_DIR/$MEMBER/$PROJECT/main/$VERSION/"

    # V4.1.0：main 聚合版本从 manifests 读取
    MAIN_VERSION=$VERSION
    MAIN_DIR="$ARTIFACTS_DIR/$MEMBER/$PROJECT/main/$MAIN_VERSION"
    mkdir -p "$MAIN_DIR"

    # 切换到 main 分支构建（仅当不在 main 时）
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    if [ "$CURRENT_BRANCH" != "main" ]; then
      echo "  → 切换到 main 分支构建聚合原型..."
      git stash 2>/dev/null || true
      git checkout main 2>/dev/null || {
        echo "  ⚠ 切换 main 失败，使用当前分支构建"
      }
    fi

    MAIN_BASE_PATH="/$MEMBER/$PROJECT/main/$MAIN_VERSION/"
    VITE_BASE_PATH="$MAIN_BASE_PATH" npm run build:sim --prefix "projects/${PROJECT}" 2>/dev/null || {
      echo "  ⚠ main 构建失败，跳过"
    }
    if [ -d "projects/${PROJECT}/dist" ]; then
      cp -r "projects/${PROJECT}/dist/"* "$MAIN_DIR/"
    fi

    # 切回原分支
    if [ "$CURRENT_BRANCH" != "main" ]; then
      git checkout "$CURRENT_BRANCH" 2>/dev/null || true
      git stash pop 2>/dev/null || true
    fi

    # 4. 生成 main PRD 聚合总览页
    echo "[4/4] 生成 main PRD 聚合总览页 → $MAIN_DIR/prd-overview.html"
    mkdir -p "$MAIN_DIR"
    node -e "
      const fs = require('fs');
      const path = require('path');
      const artifacts = '$ARTIFACTS_DIR';

      // 扫描所有 goal 的 PRD 文件
      const goals = [];
      const memberDirs = fs.readdirSync(artifacts, { withFileTypes: true })
        .filter(d => d.isDirectory());

      memberDirs.forEach(memberDir => {
        const projectPath = path.join(artifacts, memberDir.name, '$PROJECT');
        if (!fs.existsSync(projectPath)) return;

        fs.readdirSync(projectPath, { withFileTypes: true })
          .filter(d => d.isDirectory() && d.name !== 'main')
          .forEach(goalDir => {
            const verDirs = fs.readdirSync(path.join(projectPath, goalDir.name), { withFileTypes: true })
              .filter(d => d.isDirectory());
            verDirs.forEach(verDir => {
              const prdPath = path.join(projectPath, goalDir.name, verDir.name, 'index.html');
              if (fs.existsSync(prdPath)) {
                goals.push({
                  goal: goalDir.name,
                  version: verDir.name,
                  url: './' + [memberDir.name, '$PROJECT', goalDir.name, verDir.name, 'index.html'].join('/')
                });
              }
            });
          });
      });

      // 生成总览页
      const html = \`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>$PROJECT — PRD 总览</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; background: #f5f5f5; }
  h1 { color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 12px; }
  .goal-card { background: #fff; border-radius: 8px; padding: 20px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .goal-card h2 { margin: 0 0 8px; font-size: 18px; }
  .goal-card .meta { color: #666; font-size: 14px; }
  .goal-card a { color: #1677ff; text-decoration: none; display: inline-block; margin-top: 8px; }
  .empty { color: #999; text-align: center; padding: 60px 0; }
</style>
</head>
<body>
  <h1>$PROJECT — PRD 文档总览</h1>
  \${goals.length === 0 ? '<div class=\"empty\">暂无 PRD 文档（等待各业务目标 /close 后生成）</div>' :
    goals.map(g => \`<div class=\"goal-card\">
      <h2>\${g.goal}</h2>
      <div class=\"meta\">版本: \${g.version}</div>
      <a href=\"\${g.url}\">查看 PRD 文档 →</a>
    </div>\`).join('')
  }
  <p style=\"margin-top: 24px; text-align: center;\">
    <a href=\"../\" style=\"color: #1677ff;\">← 返回原型入口</a>
  </p>
</body>
</html>\`;
      fs.writeFileSync('$MAIN_DIR/prd-overview.html', html);
      console.log('PRD overview generated with ' + goals.length + ' goal(s)');
    " 2>/dev/null || echo "  ⚠ PRD 总览页生成失败"
  fi

  # 5. 复制门户 manifest.json（覆盖 AI 生成的旧版格式）
  if [ -f "$DEPLOY_DIR/access-portal/manifest.json" ]; then
    echo "[5/4] 复制门户 manifest.json → $ARTIFACTS_DIR/manifest.json"
    node -e "
      const fs = require('fs');
      const path = require('path');
      const src = path.resolve('$DEPLOY_DIR/access-portal/manifest.json');
      const dst = path.resolve('$ARTIFACTS_DIR/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(src, 'utf8'));
      manifest.generated_at = new Date().toISOString();
      fs.writeFileSync(dst, JSON.stringify(manifest, null, 2));
      console.log('manifest.json copied: ' + manifest.members.length + ' member(s)');
    "
  fi

  echo ""
  echo "=== 构建完成 ==="
  echo "Main 聚合原型:  $ARTIFACTS_DIR/$MEMBER/$PROJECT/main/$VERSION/"
  if [ -n "$GOAL" ]; then
    echo "Scope PRD:       $ARTIFACTS_DIR/$MEMBER/$PROJECT/$GOAL/$VERSION/"
    echo "Scope-only 原型: $ARTIFACTS_DIR/$MEMBER/$PROJECT/$GOAL/$VERSION/"
  fi
}

main "$@"
