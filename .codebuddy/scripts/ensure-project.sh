#!/usr/bin/env bash
# ============================================
# ensure-project.sh — 项目维度自动构建 V4.0.0
# 多人多项目 + owner维度 + 端口池 + VITE_PROJECT_ID
# 用法：
#   构建/补建：bash .codebuddy/scripts/ensure-project.sh [OwnerName] [ProjectName]
#   仅检查：  bash .codebuddy/scripts/ensure-project.sh [OwnerName] [ProjectName] --check
#   兼容旧用法（单参数）：bash .codebuddy/scripts/ensure-project.sh [ProjectName]  → owner=admin
# 依据 .codebuddy/config.yml 的 projects.layout 创建标准骨架；
# 逐项增量构建：已存在的目录/文件跳过，仅创建缺失项（幂等安全）。
# V4.0.0 新增：
#   1. owner 维度：projects/{owner}/{project}/
#   2. 端口池自动分配（4000-4099，admin 保留 3333）
#   3. VITE_PROJECT_ID 环境变量注入（IndexedDB 数据隔离）
#   4. .env 文件新增 VITE_PROJECT_ID + VITE_DEV_PORT
#   5. vite.config.ts 端口读环境变量
# V3.0.0 保留：
#   1. 根级构建配置（package.json/vite.config/tsconfig/.env/vitest.config）
#   2. 五维可插拔分层目录（contracts/adapters/sim+real/services）
#   3. 后端示例目录（backend-examples/）
#   4. 测试架构目录（tests/contract-consistency/ + tests/unit/）
# V3.0.1 保留：
#   1. --check 自检模式：只检查不创建，输出缺失项列表
#   2. 骨架完整性6项必选校验（state.json/pom/project.json/package.json/journal/docs）
# ============================================
set -euo pipefail

# 参数解析：兼容旧用法（单参数=项目名，owner默认admin）
if [ "$#" -ge 2 ] && [ "$2" != "--check" ]; then
  OWNER="${1:-admin}"
  PROJ="${2:-未命名}"
  CHECK_ONLY="${3:-}"
elif [ "$#" -ge 1 ] && [ "$1" != "--check" ]; then
  OWNER="admin"
  PROJ="${1:-未命名}"
  CHECK_ONLY="${2:-}"
else
  OWNER="admin"
  PROJ="未命名"
  CHECK_ONLY="--check"
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CFG="$ROOT/.codebuddy/config.yml"

python3 - "$OWNER" "$PROJ" "$ROOT" "$CHECK_ONLY" <<'PYEOF'
import sys, re, os, json, socket
owner, proj, root, check_only = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
cfg = open(os.path.join(root, ".codebuddy/config.yml")).read()

# V4.0.0: owner 维度
owner_proj = f"{owner}/{proj}"                             # 路径中的 owner/project
project_id = f"{owner}-{proj}".lower().replace("_", "-")   # VITE_PROJECT_ID（IndexedDB数据库名前缀）
proj_dir = os.path.join(root, f"projects/{owner_proj}")
created = []

# ============================================
# V4.0.0: 端口池分配
# ============================================
def allocate_port():
    """从端口池分配空闲端口，admin 保留 3333"""
    if owner == "admin":
        return 3333
    # 从 config.yml 解析端口池范围
    m = re.search(r'port_pool:\s*\n\s*range:\s*\[(\d+),\s*(\d+)\]', cfg)
    if m:
        port_min, port_max = int(m.group(1)), int(m.group(2))
    else:
        port_min, port_max = 4000, 4099
    # 解析已占用端口
    reserved = set()
    for rm in re.finditer(r'\{ owner:\s*"(\w+)",\s*project:\s*"(\w+)",\s*port:\s*(\d+)\s*\}', cfg):
        reserved.add(int(rm.group(3)))
    # 找空闲端口
    for port in range(port_min, port_max + 1):
        if port in reserved:
            continue
        # 检测端口是否被系统占用
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.1)
        result = sock.connect_ex(("127.0.0.1", port))
        sock.close()
        if result != 0:  # 端口空闲
            # V4.0.1: 自动更新 config.yml 的 port_pool.reserved
            reserved_line = f'    - {{ owner: "{owner}", project: "{proj}", port: {port} }}'
            cfg_path = os.path.join(root, ".codebuddy/config.yml")
            with open(cfg_path, "r") as f:
                cfg_content = f.read()
            if reserved_line not in cfg_content:
                # 在 port_pool.reserved 的最后一条后追加
                cfg_content = cfg_content.replace(
                    '    reserved:                    # 已分配端口（ensure-project.sh 自动维护）',
                    '    reserved:                    # 已分配端口（ensure-project.sh 自动维护）\n' + reserved_line
                )
                with open(cfg_path, "w") as f:
                    f.write(cfg_content)
            return port
    return port_min  # 兜底

assigned_port = allocate_port()

# ============================================
# 0. --check 自检模式：只检查不创建，输出缺失项列表
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
    print(f"骨架完整性检查: projects/{owner_proj}/")
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
        print(f"建议运行: bash .codebuddy/scripts/ensure-project.sh {owner} {proj}")
        for m in missing:
            print(f"  MISSING: {m}")
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
# 1. 创建分层目录（从 config.yml layout 提取）
# V4.0.0: {project} 替换为 {owner}/{project}（向后兼容策略）
# ============================================
m = re.search(r"projects:\s*\n\s*default_project.*?\n\s*layout:[^\n]*\n(.*?)reports:[^\n]*\n", cfg, re.S)
if not m:
    print("解析 projects.layout 失败", file=sys.stderr); sys.exit(2)
block = m.group(1)
dir_keys = ["docs", "pom", "src", "contracts", "adapters_sim", "adapters_real", "services", "backend_examples", "tests", "journal"]
for line in block.splitlines():
    mm = re.match(r'\s*(\w+):\s*"([^"]*)"', line)
    if not mm:
        continue
    key, tmpl = mm.group(1), mm.group(2)
    if key in dir_keys:
        path = tmpl.replace("{project}", owner_proj)  # V4.0.0: {project} → {owner}/{project}
        ensure_dir(path)

# 额外分层目录（五维可插拔架构）
base = f"projects/{owner_proj}"
ensure_dir(f"{base}/src/adapters/sim/transport")
ensure_dir(f"{base}/src/adapters/sim/stream")
ensure_dir(f"{base}/src/adapters/sim/asset")
ensure_dir(f"{base}/src/adapters/sim/auth")
ensure_dir(f"{base}/src/adapters/real/transport")
ensure_dir(f"{base}/src/adapters/real/stream")
ensure_dir(f"{base}/src/adapters/real/asset")
ensure_dir(f"{base}/src/adapters/real/auth")
ensure_dir(f"{base}/src/stores")
ensure_dir(f"{base}/src/components")
ensure_dir(f"{base}/src/pages")
ensure_dir(f"{base}/src/design")
ensure_dir(f"{base}/tests/contract-consistency")
ensure_dir(f"{base}/tests/unit")
ensure_dir(f"{base}/backend-examples/fastapi")

# V5.0新增：三级把关 + 版本差异目录
ensure_dir(f"{base}/docs/06-sprint-guard")
ensure_dir(f"{base}/docs/07-version-guard")
ensure_dir(f"{base}/docs/08-project-guard")
ensure_dir(f"{base}/docs/09-versions")
ensure_dir(f"{base}/docs/06-sprint")
ensure_dir(f"{base}/.codebuddy/journal/sprint-progress")
ensure_dir(f"{base}/.codebuddy/journal/decisions")

# V5.0新增：初始化VERSION-TIMELINE.yml
ensure_file(f"{base}/docs/09-versions/VERSION-TIMELINE.yml",
    "# 版本时间线\n"
    f"project: \"{proj}\"\n"
    "last_updated: \"\"\n"
    "versions: []\n")

# ============================================
# 2. 创建根级构建配置文件（V3.0.0 + V4.0.0升级）
# ============================================
ensure_file(f"{base}/package.json", json.dumps({
    "name": proj.lower().replace("-", "_"),
    "version": "0.1.0",
    "private": True,
    "type": "module",
    "scripts": {
        "dev": "vite --mode development",
        "dev:real": "vite --mode real",
        "build": "vite build --mode production",
        "build:sim": "vite build --mode sim",
        "preview": "vite preview",
        "test": "vitest",
        "test:run": "vitest run",
        "test:contract": "vitest run tests/contract-consistency/",
        "test:unit": "vitest run tests/unit/",
        "typecheck": "tsc --noEmit"
    },
    "dependencies": {
        "react": "^18.3.0", "react-dom": "^18.3.0", "react-router-dom": "^6.26.0",
        "zustand": "^4.5.0", "antd": "^5.20.0", "zod": "^3.23.0", "idb": "^8.0.0"
    },
    "devDependencies": {
        "@types/react": "^18.3.0", "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.0", "typescript": "^5.5.0",
        "vite": "^5.4.0", "vitest": "^2.0.0",
        "@testing-library/react": "^16.0.0", "@testing-library/jest-dom": "^6.4.0",
        "jsdom": "^24.0.0", "fake-indexeddb": "^6.0.0"
    },
    "engines": {"node": ">=18.0.0"}
}, indent=2))

# V4.0.0: .env 文件新增 VITE_PROJECT_ID + VITE_DEV_PORT
ensure_file(f"{base}/.env.development",
    f"VITE_MODE=sim\n"
    f"VITE_API_BASE=/api/v1\n"
    f"VITE_WS_URL=ws://localhost:8000/ws\n"
    f"VITE_AUTH_MODE=mock\n"
    f"VITE_PROJECT_ID={project_id}\n"           # V4.0.0新增：IndexedDB数据隔离
    f"VITE_DEV_PORT={assigned_port}\n")          # V4.0.0新增：开发态端口

ensure_file(f"{base}/.env.production",
    f"VITE_MODE=real\n"
    f"VITE_API_BASE=https://api.example.com/api/v1\n"
    f"VITE_WS_URL=wss://api.example.com/ws\n"
    f"VITE_AUTH_MODE=jwt\n"
    f"VITE_PROJECT_ID={project_id}\n")           # V4.0.0新增：部署态也注入

ensure_file(f"{base}/.env.example",
    f"# 复制为 .env.development 或 .env.production\n"
    f"VITE_MODE=sim\n"
    f"VITE_API_BASE=/api/v1\n"
    f"VITE_WS_URL=ws://localhost:8000/ws\n"
    f"VITE_AUTH_MODE=mock\n"
    f"VITE_PROJECT_ID={project_id}\n"
    f"VITE_DEV_PORT={assigned_port}\n")

# V4.0.0: .env.sim 文件（build:sim 专用）
ensure_file(f"{base}/.env.sim",
    f"VITE_MODE=sim\n"
    f"VITE_PROJECT_ID={project_id}\n")

# tsconfig.json
ensure_file(f"{base}/tsconfig.json", json.dumps({
    "compilerOptions": {
        "target": "ES2020", "useDefineForClassFields": True,
        "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "skipLibCheck": True,
        "moduleResolution": "bundler", "allowImportingTsExtensions": True,
        "resolveJsonModule": True, "isolatedModules": True, "noEmit": True, "jsx": "react-jsx",
        "strict": True, "baseUrl": ".",
        "paths": {"@/*": ["src/*"], "@contracts/*": ["src/contracts/*"], "@adapters/*": ["src/adapters/*"],
                  "@services/*": ["src/services/*"], "@stores/*": ["src/stores/*"],
                  "@components/*": ["src/components/*"], "@pages/*": ["src/pages/*"]},
        "types": ["vitest/globals", "@testing-library/jest-dom"]
    },
    "include": ["src", "tests"]
}, indent=2))

# V4.0.0: vite.config.ts 端口读环境变量
ensure_file(f"{base}/vite.config.ts",
    'import { defineConfig } from "vite";\n'
    'import react from "@vitejs/plugin-react";\n'
    'import path from "node:path";\n\n'
    'export default defineConfig(({ mode }) => ({\n'
    '  plugins: [react()],\n'
    '  resolve: {\n'
    '    alias: {\n'
    '      "@": path.resolve(__dirname, "src"),\n'
    '      "@contracts": path.resolve(__dirname, "src/contracts"),\n'
    '      "@adapters": path.resolve(__dirname, "src/adapters"),\n'
    '      "@services": path.resolve(__dirname, "src/services"),\n'
    '    },\n'
    '  },\n'
    '  server: { port: parseInt(process.env.VITE_DEV_PORT || "3333"), host: true },\n'
    '}));\n')

# vitest.config.ts
ensure_file(f"{base}/vitest.config.ts",
    'import { defineConfig } from "vitest/config";\n'
    'import react from "@vitejs/plugin-react";\n'
    'import path from "node:path";\n\n'
    'export default defineConfig({\n'
    '  plugins: [react()],\n'
    '  resolve: { alias: { "@": path.resolve(__dirname, "src") } },\n'
    '  test: {\n'
    '    globals: true, environment: "jsdom",\n'
    '    setupFiles: ["./tests/setup.ts"],\n'
    '    include: ["tests/**/*.test.{ts,tsx}"],\n'
    '  },\n'
    '});\n')

# tests/setup.ts
ensure_file(f"{base}/tests/setup.ts",
    'import "@testing-library/jest-dom";\n'
    'import "fake-indexeddb/auto";\n')

# ============================================
# 3. 初始化 pom/project.json（若不存在）
# ============================================
pom_dir = os.path.join(proj_dir, "pom")
pj = os.path.join(pom_dir, "project.json")
if not os.path.exists(pj):
    os.makedirs(pom_dir, exist_ok=True)
    open(pj, "w").write(
        '{\n  "name": "%s",\n  "version": "0.1.0",\n'
        '  "project": {"type": "high-fidelity-simulation"},\n'
        '  "techStack": {}, "contracts": {}, "db": {}, "modules": []\n}\n' % proj
    )
    created.append(f"projects/{owner_proj}/pom/project.json")

# ============================================
# 4. 初始化 state.json（PM 生命周期状态机）
# ============================================
ver_m = re.search(r'init:\s*"((?:v[\d.]+))"', cfg)
init_ver = ver_m.group(1) if ver_m else "v1.0.0"
state_dir = os.path.join(proj_dir, ".codebuddy")
state_file = os.path.join(state_dir, "state.json")
if not os.path.exists(state_file):
    os.makedirs(state_dir, exist_ok=True)
    state = {
        "project": proj, "owner": owner,
        "industry": "", "platforms": [],
        "status": "pending_init", "released_baseline": "",
        "auto_mode": False, "streams": []
    }
    with open(state_file, "w") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    created.append(f"projects/{owner_proj}/.codebuddy/state.json")

# ============================================
# 5. 初始化 journal（对话流水 + 问题总账）
# ============================================
journal_dir = os.path.join(state_dir, "journal")
conv_file = os.path.join(journal_dir, "conversation-log.md")
pbl_file = os.path.join(journal_dir, "problem-ledger.md")
reviews_dir = os.path.join(journal_dir, "reviews")
if not os.path.exists(reviews_dir):
    os.makedirs(reviews_dir, exist_ok=True)
    created.append(f"projects/{owner_proj}/.codebuddy/journal/reviews/")
if not os.path.exists(conv_file):
    os.makedirs(journal_dir, exist_ok=True)
    open(conv_file, "w").write(
        f"# 对话流水 — {proj}\n\n> PM 全程留痕。\n\n"
        "| 时间 | 角色 | 指令 | 阶段 | 关联流 | 内容摘要 | 衍生问题 |\n"
        "|------|------|------|------|--------|----------|----------|\n"
    )
    created.append(f"projects/{owner_proj}/.codebuddy/journal/conversation-log.md")
if not os.path.exists(pbl_file):
    open(pbl_file, "w").write(
        f"# 问题总账 — {proj}\n\n> PBL-{proj}-NNN 连续编号。\n\n"
        "## 汇总索引\n\n| 编号 | 发现时间 | 来源 | 阶段 | 归属流 | 严重级 | 状态 |\n"
        "|------|----------|------|------|--------|--------|------|\n"
    )
    created.append(f"projects/{owner_proj}/.codebuddy/journal/problem-ledger.md")

# ============================================
# 6. 初始化 business-topology.json
# V4.0.0: 知识库路径改为 knowledge/projects/{owner}/{proj}/
# ============================================
know_dir = os.path.join(root, f".codebuddy/knowledge/projects/{owner_proj}")
topo_file = os.path.join(know_dir, "business-topology.json")
if not os.path.exists(topo_file):
    os.makedirs(know_dir, exist_ok=True)
    with open(topo_file, "w") as f:
        json.dump({"platforms": [], "processes": [], "modules": [], "functions": []}, f, ensure_ascii=False, indent=2)
    created.append(f".codebuddy/knowledge/projects/{owner_proj}/business-topology.json")

# ============================================
# 输出
# ============================================
print(f"\n{'='*60}")
print(f"项目骨架构建完成: projects/{owner_proj}/")
print(f"{'='*60}")
if created:
    print(f"新增 {len(created)} 项:")
    for c in created:
        print(f"  + {c}")
else:
    print("（项目已存在，跳过构建）")
print(f"\nV4.0.0 配置:")
print(f"  Owner:         {owner}")
print(f"  Project ID:    {project_id}")
print(f"  Dev Port:      {assigned_port}")
print(f"  DB Name:       {project_id}-sim")
print(f"\n下一步:")
print(f"  cd projects/{owner_proj} && npm install && npm run dev")
PYEOF
