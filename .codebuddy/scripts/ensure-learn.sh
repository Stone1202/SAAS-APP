#!/usr/bin/env bash
# ============================================
# ensure-learn.sh — 学习流程知识骨架自动构建
# 版本：v3.0.0
# 用法：bash .codebuddy/scripts/ensure-learn.sh <ProjectName>
# 依据 learn-project.yml（忠实还原模式）在 knowledge/{project}/ 下建标准骨架：
#   需求文档/（多卷 PRD）+ 学习报告/（含问题清单）+ 外部连接资产/。
#   不再构建六视角子目录 / topology.json / TRACEABILITY_MATRIX.md / summary.json。
# 若已存在则跳过。
# ============================================
set -euo pipefail

PROJ="${1:-}"
if [ -z "$PROJ" ]; then
  echo "用法: ensure-learn.sh <ProjectName>" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BASE="$ROOT/.codebuddy/knowledge/$PROJ"

if [ -d "$BASE" ]; then
  echo "已构建学习知识骨架：.codebuddy/knowledge/$PROJ（已存在，跳过）"
  exit 0
fi

# 忠实还原模式产出目录
mkdir -p "$BASE/需求文档"
mkdir -p "$BASE/学习报告"
mkdir -p "$BASE/外部连接资产"

# 入口 README（忠实还原模式说明）
cat > "$BASE/README.md" <<'EOF'
# 项目学习知识库 — {PROJ}

> 由 /learn-project 流程（忠实还原模式 v3.0.0）生成。
> 核心原则：原型有什么就还原什么，不做删减/纠偏/推测补充；
> 所有发现的问题仅记录在学习报告中，不修改 PRD 正文。

## 目录结构
| 产出 | 目录 | 说明 |
|------|------|------|
| 需求文档（多卷 PRD） | 需求文档/ | 忠实还原的 PRD，支持多卷拆分 + 版本链索引 |
| 学习报告 | 学习报告/ | 含原型问题清单（缺失/矛盾/模糊/不一致/逻辑漏洞） |
| 外部连接资产 | 外部连接资产/ | 原型的第三方链接、API 端点登记 |

## 多卷 PRD 说明
- 卷索引文件：`{项目}-PRD-v{version}-index.md`（含完整版本链 + 交叉引用）
- 各卷文件：`{项目}-PRD-v{version}-vol{N}-{模块名}.md`
- 每卷首尾有上下文链接（上一卷/下一卷/卷索引），不丢失关联
EOF
# 用 sed 替换模板中的 {PROJ}
sed -i '' "s/{PROJ}/$PROJ/g" "$BASE/README.md"

echo "已构建学习知识骨架：.codebuddy/knowledge/$PROJ"
echo "  + 需求文档/ （多卷 PRD + 卷索引）"
echo "  + 学习报告/ （含原型问题清单）"
echo "  + 外部连接资产/"
echo "  + README.md"
