#!/usr/bin/env bash
# ============================================
# ensure-project.sh — 项目维度自动构建 V5.0.0
# V1.2.0变更：按项目隔离（不按owner），成员可访问多个项目
# 用法：
#   构建/补建：bash .codebuddy/scripts/ensure-project.sh [ProjectName]
#   仅检查：  bash .codebuddy/scripts/ensure-project.sh [ProjectName] --check
# 依据 .codebuddy/config.yml 的 projects.layout 创建标准骨架；
# 逐项增量构建：已存在的目录/文件跳过，仅创建缺失项（幂等安全）。
# V5.0.0 变更（按项目隔离）：
#   1. 路径从 projects/{owner}/{project}/ 改为 projects/{project}/
#   2. 知识库从 knowledge/projects/{owner}/{project}/ 改为 knowledge/projects/{project}/
#   3. 参数从 [OwnerName] [ProjectName] 改为 [ProjectName]
#   4. state.json 去掉 owner 字段
#   5. 端口池 reserved 格式从 {owner,project,port} 改为 {project,port}
#   6. VITE_PROJECT_ID 从 {owner}-{project} 改为 {project}
# ============================================
set -euo pipefail

# 参数解析
if [ "$#" -ge 1 ] && [ "$1" != "--check" ]; then
  PROJ="${1:-未命名}"
  CHECK_ONLY="${2:-}"
else
  PROJ="未命名"
  CHECK_ONLY="--check"
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CFG="$ROOT/.codebuddy/config.yml"

python3 - "$PROJ" "$ROOT" "$CHECK_ONLY" <<'PYEOF'
import sys, re, os, json, socket
proj, root, check_only = sys.argv[1], sys.argv[2], sys.argv[3]
cfg = open(os.path.join(root, ".codebuddy/config.yml")).read()

# V5.0.0: 按项目隔离（不按owner）
project_id = proj.lower().replace("_", "-")   # VITE_PROJECT_ID
proj_dir = os.path.join(root, f"projects/{proj}")
created = []

# ============================================
# 端口池分配
# ============================================
def allocate_port():
    """从端口池分配空闲端口"""
    if proj.lower() == "ai-scrm":
        return 3333
    m = re.search(r'port_pool:\s*\n\s*range:\s*\[(\d+),\s*(\d+)\]', cfg)
    if m:
        port_min, port_max = int(m.group(1)), int(m.group(2))
    else:
        port_min, port_max = 4000, 4099
    reserved = set()
    # V5.0.0: 格式为 { project: "xxx", port: N }
    for rm in re.finditer(r'\{ project:\s*"(\w+)",\s*port:\s*(\d+)\s*\}', cfg):
        reserved.add(int(rm.group(2)))
    for port in range(port_min, port_max + 1):
        if port in reserved:
            continue
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.1)
        result = sock.connect_ex(("127.0.0.1", port))
        sock.close()
        if result != 0:
            # V5.0.0: 自动更新 config.yml（格式无owner）
            reserved_line = f'      - {{ project: "{proj}", port: {port} }}'
            cfg_path = os.path.join(root, ".codebuddy/config.yml")
            with open(cfg_path, "r") as f:
                cfg_content = f.read()
            if reserved_line not in cfg_content:
                cfg_content = cfg_content.replace(
                    '    reserved:                    # 已分配端口（ensure-project.sh 自动维护）',
                    '    reserved:                    # 已分配端口（ensure-project.sh 自动维护）\n' + reserved_line
                )
                with open(cfg_path, "w") as f:
                    f.write(cfg_content)
            return port
    return port_min

assigned_port = allocate_port()

# ============================================
# --check 自检模式
# ============================================
CHECK_ITEMS = [
    (".codebuddy/state.json", "项目状态机"),
    ("pom/project.json", "项目元数据"),
    ("package.json", "构建配置"),
    (".codebuddy/journal/", "Journal目录"),
    ("docs/", "文档目录"),
    ("src/", "源码目录"),
]

if check_only == "--check":
    missing = []
    print(f"\n{'='*60}")
    print(f"骨架完整性检查: projects/{proj}/")
    print(f"{'='*60}")
    for rel, desc in CHECK_ITEMS:
        full = os.path.join(proj_dir, rel)
        exists = os.path.exists(full)
        status = "✅" if exists else "❌ MISSING"
        print(f"  {status}  {rel}  ({desc})")
        if not exists:
            missing.append(rel)
    print(f"\n检查结果: {'全部完整 ✅' if not missing else f'{len(missing)}项缺失'}")
    if missing:
        print(f"建议运行: bash .codebuddy/scripts/ensure-project.sh {proj}")
    sys.exit(0 if not missing else 1)

# ============================================
# 正常构建模式
# ============================================

def ensure_dir(rel_path):
    full = os.path.join(root, rel_path)
    if not os.path.exists(full):
        os.makedirs(full, exist_ok=True)
        created.append(rel_path)

def ensure_file(rel_path, content):
    full = os.path.join(root, rel_path)
    if not os.path.exists(full):
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w") as f:
            f.write(content)
        created.append(rel_path)

# ============================================
# 1. 创建分层目录
# ============================================
base = f"projects/{proj}"
for d in ["docs", "pom", "src", "src/adapters/sim", "src/adapters/real", "src/stores",
          "src/components", "src/pages", "src/contracts", "src/services",
          "tests", "tests/contract-consistency", "tests/unit",
          "backend-examples", "backend-examples/fastapi",
          "docs/06-sprint-guard", "docs/07-version-guard", "docs/08-project-guard",
          "docs/09-versions", ".codebuddy/journal", ".codebuddy/journal/reviews"]:
    ensure_dir(f"{base}/{d}")

# VERSION-TIMELINE.yml
ensure_file(f"{base}/docs/09-versions/VERSION-TIMELINE.yml",
    f"# 版本时间线\nproject: \"{proj}\"\nlast_updated: \"\"\nversions: []\n")

# ============================================
# 2. 创建构建配置文件
# ============================================
ensure_file(f"{base}/package.json", json.dumps({
    "name": proj.lower().replace("-", "_"), "version": "0.1.0", "private": True, "type": "module",
    "scripts": {
        "dev": "vite --mode development", "dev:real": "vite --mode real",
        "build": "vite build --mode production", "build:sim": "vite build --mode sim",
        "preview": "vite preview", "test": "vitest", "test:run": "vitest run",
        "test:contract": "vitest run tests/contract-consistency/", "test:unit": "vitest run tests/unit/",
        "typecheck": "tsc --noEmit"
    },
    "dependencies": {"react": "^18.3.0", "react-dom": "^18.3.0", "react-router-dom": "^6.26.0",
                     "zustand": "^4.5.0", "antd": "^5.20.0", "zod": "^3.23.0", "idb": "^8.0.0"},
    "devDependencies": {"@types/react": "^18.3.0", "@types/react-dom": "^18.3.0",
                        "@vitejs/plugin-react": "^4.3.0", "typescript": "^5.5.0",
                        "vite": "^5.4.0", "vitest": "^2.0.0",
                        "@testing-library/react": "^16.0.0", "@testing-library/jest-dom": "^6.4.0",
                        "jsdom": "^24.0.0", "fake-indexeddb": "^6.0.0"},
    "engines": {"node": ">=18.0.0"}
}, indent=2))

# V5.0.0: .env 文件 VITE_PROJECT_ID 不含 owner
ensure_file(f"{base}/.env.development",
    f"VITE_MODE=sim\nVITE_API_BASE=/api/v1\nVITE_WS_URL=ws://localhost:8000/ws\n"
    f"VITE_AUTH_MODE=mock\nVITE_PROJECT_ID={project_id}\nVITE_DEV_PORT={assigned_port}\n")
ensure_file(f"{base}/.env.production",
    f"VITE_MODE=real\nVITE_API_BASE=https://api.example.com/api/v1\n"
    f"VITE_WS_URL=wss://api.example.com/ws\nVITE_AUTH_MODE=jwt\nVITE_PROJECT_ID={project_id}\n")
ensure_file(f"{base}/.env.sim", f"VITE_MODE=sim\nVITE_PROJECT_ID={project_id}\n")
ensure_file(f"{base}/.env.example",
    f"# 复制为 .env.development\nVITE_MODE=sim\nVITE_API_BASE=/api/v1\n"
    f"VITE_WS_URL=ws://localhost:8000/ws\nVITE_AUTH_MODE=mock\n"
    f"VITE_PROJECT_ID={project_id}\nVITE_DEV_PORT={assigned_port}\n")

ensure_file(f"{base}/tsconfig.json", json.dumps({
    "compilerOptions": {"target": "ES2020", "useDefineForClassFields": True,
        "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "skipLibCheck": True,
        "moduleResolution": "bundler", "allowImportingTsExtensions": True,
        "resolveJsonModule": True, "isolatedModules": True, "noEmit": True, "jsx": "react-jsx",
        "strict": True, "baseUrl": ".",
        "paths": {"@/*": ["src/*"], "@contracts/*": ["src/contracts/*"], "@adapters/*": ["src/adapters/*"],
                  "@services/*": ["src/services/*"]},
        "types": ["vitest/globals", "@testing-library/jest-dom"]},
    "include": ["src", "tests"]
}, indent=2))

ensure_file(f"{base}/vite.config.ts",
    'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n'
    'import path from "node:path";\n\n'
    'export default defineConfig(({ mode }) => ({\n'
    '  plugins: [react()],\n'
    '  resolve: { alias: { "@": path.resolve(__dirname, "src"),\n'
    '    "@contracts": path.resolve(__dirname, "src/contracts"),\n'
    '    "@adapters": path.resolve(__dirname, "src/adapters"),\n'
    '    "@services": path.resolve(__dirname, "src/services") } },\n'
    '  server: { port: parseInt(process.env.VITE_DEV_PORT || "3333"), host: true },\n'
    '}));\n')

ensure_file(f"{base}/vitest.config.ts",
    'import { defineConfig } from "vitest/config";\nimport react from "@vitejs/plugin-react";\n'
    'import path from "node:path";\n\n'
    'export default defineConfig({\n  plugins: [react()],\n'
    '  resolve: { alias: { "@": path.resolve(__dirname, "src") } },\n'
    '  test: { globals: true, environment: "jsdom",\n'
    '    setupFiles: ["./tests/setup.ts"], include: ["tests/**/*.test.{ts,tsx}"] },\n});\n')

ensure_file(f"{base}/tests/setup.ts", 'import "@testing-library/jest-dom";\nimport "fake-indexeddb/auto";\n')

# ============================================
# 3. pom/project.json
# ============================================
pom_dir = os.path.join(proj_dir, "pom")
pj = os.path.join(pom_dir, "project.json")
if not os.path.exists(pj):
    os.makedirs(pom_dir, exist_ok=True)
    open(pj, "w").write(
        '{\n  "name": "%s",\n  "version": "0.1.0",\n'
        '  "project": {"type": "high-fidelity-simulation"},\n'
        '  "techStack": {}, "contracts": {}, "db": {}, "modules": []\n}\n' % proj)
    created.append(f"projects/{proj}/pom/project.json")

# ============================================
# 4. state.json（V5.0.0: 无owner字段）
# ============================================
state_dir = os.path.join(proj_dir, ".codebuddy")
state_file = os.path.join(state_dir, "state.json")
if not os.path.exists(state_file):
    os.makedirs(state_dir, exist_ok=True)
    state = {
        "project": proj, "industry": "", "platforms": [],
        "status": "pending_init", "released_baseline": "",
        "auto_mode": False, "streams": []
    }
    with open(state_file, "w") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    created.append(f"projects/{proj}/.codebuddy/state.json")

# ============================================
# 5. journal
# ============================================
journal_dir = os.path.join(state_dir, "journal")
reviews_dir = os.path.join(journal_dir, "reviews")
if not os.path.exists(reviews_dir):
    os.makedirs(reviews_dir, exist_ok=True)
    created.append(f"projects/{proj}/.codebuddy/journal/reviews/")
conv_file = os.path.join(journal_dir, "conversation-log.md")
if not os.path.exists(conv_file):
    os.makedirs(journal_dir, exist_ok=True)
    open(conv_file, "w").write(
        f"# 对话流水 — {proj}\n\n> PM 全程留痕。\n\n"
        "| 时间 | 角色 | 指令 | 阶段 | 关联流 | 内容摘要 | 衍生问题 |\n"
        "|------|------|------|------|--------|----------|----------|\n")
    created.append(f"projects/{proj}/.codebuddy/journal/conversation-log.md")
pbl_file = os.path.join(journal_dir, "problem-ledger.md")
if not os.path.exists(pbl_file):
    open(pbl_file, "w").write(
        f"# 问题总账 — {proj}\n\n> PBL-{proj}-NNN 连续编号。\n\n"
        "## 汇总索引\n\n| 编号 | 发现时间 | 来源 | 阶段 | 归属流 | 严重级 | 状态 |\n"
        "|------|----------|------|------|--------|--------|------|\n")
    created.append(f"projects/{proj}/.codebuddy/journal/problem-ledger.md")

# ============================================
# 6. 知识库（V5.0.0: 按项目隔离，无owner）
# ============================================
know_dir = os.path.join(root, f".codebuddy/knowledge/projects/{proj}")
topo_file = os.path.join(know_dir, "business-topology.json")
if not os.path.exists(topo_file):
    os.makedirs(know_dir, exist_ok=True)
    with open(topo_file, "w") as f:
        json.dump({"platforms": [], "processes": [], "modules": [], "functions": []}, f, ensure_ascii=False, indent=2)
    created.append(f".codebuddy/knowledge/projects/{proj}/business-topology.json")

# ============================================
# 输出
# ============================================
print(f"\n{'='*60}")
print(f"项目骨架构建完成: projects/{proj}/")
print(f"{'='*60}")
if created:
    print(f"新增 {len(created)} 项:")
    for c in created:
        print(f"  + {c}")
else:
    print("（项目已存在，跳过构建）")
print(f"\n配置:")
print(f"  Project ID:    {project_id}")
print(f"  Dev Port:      {assigned_port}")
print(f"  DB Name:       {project_id}-sim")
print(f"\n下一步:")
print(f"  cd projects/{proj} && npm install && npm run dev")
PYEOF
