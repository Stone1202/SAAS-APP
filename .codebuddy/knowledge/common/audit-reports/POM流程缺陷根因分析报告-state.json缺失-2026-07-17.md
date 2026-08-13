# POM 流程缺陷根因分析报告：state.json 缺失 + 项目定位失败

> **报告编号**：AUDIT-2026-07-17-001
> **触发事件**：AI Agent 会话恢复后定位错误项目（查 AI-SCRM 而非 SAAS），暴露 state.json 缺失
> **审查范围**：project-lifecycle.yml / pm-agent.yml / pm-agent.md / ensure-project.sh / brainstorm.yml / config.yml
> **严重级别**：P0（流程级缺陷，影响多项目场景的项目状态追踪）

---

## 一、问题现象

| 现象 | 详情 |
|------|------|
| **直接现象** | 会话恢复后 Agent 默认查 `projects/AI-SCRM/`，未查 `projects/SAAS/`（用户实际在做的项目） |
| **深层现象** | `projects/SAAS/` 下完全没有 `.codebuddy/` 目录和 `state.json`，无法从状态文件恢复项目上下文 |
| **对比** | `projects/AI-SCRM/.codebuddy/state.json` 存在但内容为 `pending_init`（空壳），`projects/SAAS/` 连空壳都没有 |

---

## 二、证据链

### 2.1 SAAS 项目实际产物结构

```
projects/SAAS/
└── docs/                          ← 只有 docs/，没有 .codebuddy/
    ├── 00-brainstorm/             ← 脑暴已完成
    ├── 01-requirements/           ← 需求已完成
    ├── 02-design/                 ← 设计已完成
    ├── 03-architecture/           ← 空
    ├── 04-development/            ← 空
    ├── 05-test/                   ← 空
    └── 06-acceptance/             ← 空
```

**缺失项**：
- ❌ `projects/SAAS/.codebuddy/state.json`（项目状态机）
- ❌ `projects/SAAS/.codebuddy/journal/`（对话流水+问题总账）
- ❌ `projects/SAAS/pom/project.json`（项目元数据）
- ❌ `projects/SAAS/package.json` / `vite.config.ts` / `tsconfig.json`（构建配置）
- ❌ `projects/SAAS/src/`（源码骨架）
- ❌ `projects/SAAS/tests/`（测试骨架）

### 2.2 AI-SCRM 项目对比

```
projects/AI-SCRM/
├── .codebuddy/
│   ├── journal/                   ← 存在
│   └── state.json                 ← 存在但 pending_init（空壳）
├── docs/                          ← 完整
├── pom/project.json               ← 存在
├── package.json                   ← 存在
├── src/                           ← 存在（19950文件）
├── tests/                         ← 存在
└── ...                            ← 完整骨架
```

---

## 三、根因分析

### 根因1：`ensure-project.sh` 从未被 SAAS 项目调用

**证据**：

`ensure-project.sh`（第198-213行）负责创建 `state.json`：
```python
# 第198-213行
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
```

同时它还负责创建 `pom/project.json`、`package.json`、`src/`、`tests/`、`journal/` 等。SAAS 项目全部缺失这些，说明 **ensure-project.sh 从未对 SAAS 项目执行过**。

**根因**：脑暴流程进入 SAAS 时，BS Agent **没有运行 ensure-project.sh**，而是手动创建了 `docs/` 目录结构后直接开始脑暴。

### 根因2：brainstorm.yml 脑暴入口的骨架检测逻辑有漏洞

**证据**：

`brainstorm.yml` 第154-170行定义了存量项目的骨架检测：
```yaml
- step: "check_project_skeleton_and_knowledge"
  sub_steps:
    - order: 1
      name: "检查项目骨架"
      check: "projects/{project}/ 目录是否存在"
      outcomes:
        exists:
          action: "项目骨架已存在，跳过构建"
        not_exists:
          action: "运行 ensure-project.sh {project} 创建标准骨架"
```

**漏洞**：检测条件是 `projects/{project}/ 目录是否存在`。SAAS 项目的 `docs/` 目录可能是由 BS Agent 提前手动创建的（或由脑暴 stage-0b 创建的），导致检测认为"骨架已存在"而跳过了 ensure-project.sh。

**但实际只创建了 `docs/00-brainstorm/{topic}/`，没有创建 `.codebuddy/state.json`、`pom/`、`src/`、`tests/` 等骨架必选项。**

**本质问题**：骨架检测粒度太粗——只检测 `projects/{project}/` 目录存在与否，不检测骨架完整性（state.json / pom / src / tests 等关键文件是否齐全）。

### 根因3：project-lifecycle.yml stage-00 同样有此漏洞

**证据**：

`project-lifecycle.yml` 第168-170行：
```yaml
3. 存量项目：
   a. 检查骨架完整性，补建缺失目录
```

写了"检查骨架完整性"，但**没有定义完整性检查清单**——什么算"完整"？缺了 state.json 算不算不完整？没有可执行的校验项，这条规则形同虚设。

### 根因4：state.json 创建职责只在 ensure-project.sh 中定义，无兜底机制

**证据**：

全局搜索 state.json 的创建逻辑，只有 `ensure-project.sh` 第198-213行。如果 ensure-project.sh 没被执行，state.json 永远不会被创建。

- `pm-agent.yml` 第40行引用了 state.json 路径，但**没有定义"如果 state.json 不存在则创建"的兜底逻辑**
- `project-lifecycle.yml` 第561-592行定义了 state.json 的 schema，但**没有定义创建时机和兜底创建逻辑**
- `/init` 的 stage-1 action（第238行）写"创建需求流 STR-{nnn} 写入 state.json.streams[]"，**前提是 state.json 已存在**——如果不存在，这步会失败或静默跳过

### 根因5：多项目场景下没有全局项目注册表

**证据**：

`config.yml` 第56-57行：
```yaml
projects:
  default_project: "未命名"
```

只有一个 `default_project`，**没有项目注册表（project registry）**。workspace 下有 `AI-SCRM` 和 `SAAS` 两个项目，但系统没有地方记录：
- 有哪些项目存在
- 哪个项目是当前活跃项目
- 每个项目处于什么阶段

导致会话恢复时，Agent 只能靠猜（默认查 config.yml 的 `project.name: "AI-SCRM"`）或全量扫描目录。

### 根因6：config.yml 顶层 project.name 与实际多项目不一致

**证据**：

`config.yml` 第25-28行：
```yaml
project:
  name: "AI-SCRM"
  mode: "new"
  industry: "ecommerce"
```

这里的 `project.name` 硬编码为 `AI-SCRM`，但实际 workspace 是多项目模式（V3.0.0 引入），这个字段是 V1.0 单项目时代的遗留，从未更新。Agent 会话恢复时会读这个字段作为"当前项目"的线索，导致默认查 AI-SCRM。

---

## 四、缺陷汇总

| 编号 | 缺陷描述 | 所在文件 | 严重级 |
|------|----------|----------|--------|
| D-01 | ensure-project.sh 从未被 SAAS 项目调用，state.json/pom/src/tests 全缺 | ensure-project.sh 调用链 | P0 |
| D-02 | brainstorm.yml 骨架检测只查目录存在，不查骨架完整性 | brainstorm.yml 第154-170行 | P0 |
| D-03 | project-lifecycle.yml stage-00 写了"检查骨架完整性"但无检查清单 | project-lifecycle.yml 第168行 | P1 |
| D-04 | state.json 创建职责只在 ensure-project.sh 中，PM Agent 无兜底创建逻辑 | pm-agent.yml / project-lifecycle.yml | P0 |
| D-05 | 多项目场景下无全局项目注册表 | config.yml | P0 |
| D-06 | config.yml 顶层 project.name 硬编码 AI-SCRM，多项目时代遗留 | config.yml 第25-28行 | P1 |

---

## 五、修复方案

### 修复1：brainstorm.yml + project-lifecycle.yml 骨架检测升级为完整性校验

**当前**：`projects/{project}/ 目录是否存在` → 存在则跳过

**改为**：骨架完整性6项校验，任一缺失则补建

```yaml
skeleton_integrity_check:
  required_files:
    - path: "projects/{project}/.codebuddy/state.json"
      description: "项目状态机"
      auto_create: true  # 缺失则补建
    - path: "projects/{project}/pom/project.json"
      description: "项目元数据"
      auto_create: true
    - path: "projects/{project}/package.json"
      description: "构建配置"
      auto_create: true
    - path: "projects/{project}/.codebuddy/journal/"
      description: "Journal目录"
      auto_create: true
    - path: "projects/{project}/docs/"
      description: "文档目录"
      auto_create: true
    - path: "projects/{project}/src/"
      description: "源码目录"
      auto_create: true
  check_logic: "逐项检查，任一缺失则运行 ensure-project.sh {project}（幂等，已存在的跳过）"
```

**涉及文件**：
- `brainstorm.yml`（stage-0a / interactive_inquiry.check_project_skeleton_and_knowledge）
- `project-lifecycle.yml`（stage-00）

### 修复2：PM Agent 增加 state.json 兜底创建逻辑

**当前**：pm-agent.yml 只引用 state.json 路径，不负责创建

**改为**：PM Agent 在 `/init` stage-1 执行前，先校验 state.json 存在性

```yaml
# pm-agent.yml orchestration 节新增
state_guard:
  description: "PM 在任何操作前先确保 state.json 存在"
  check: "projects/{project}/.codebuddy/state.json 是否存在"
  on_missing: |
    1. 运行 ensure-project.sh {project}（幂等补建）
    2. Journal 记录"state.json 缺失，已补建"
    3. 继续后续流程
  on_corrupt: "state.json 存在但解析失败 → 备份后重建"
```

**涉及文件**：
- `pm-agent.yml`（orchestration 节）
- `pm-agent.md`（职责 R1 新增 state.json 存在性校验）
- `project-lifecycle.yml`（stage-00 / stage-1 新增 state_guard）

### 修复3：新增全局项目注册表

**新建文件**：`.codebuddy/knowledge/PROJECT-INDEX.yml`

```yaml
# 全局项目注册表（多项目模式单一事实源）
# 每次会话恢复时 PM Agent 首先读取此文件确定当前活跃项目
version: "1.0.0"
last_updated: "2026-07-17"

projects:
  - name: "AI-SCRM"
    status: "active"
    current_stream:
      id: null
      version: null
      stage: "pending_init"
    last_activity: "2026-07-15"
    description: "九天科技 AI-SCRM 高保真仿真项目"

  - name: "SAAS"
    status: "active"
    current_stream:
      id: "STR-001"
      version: "v1.1.0"
      stage: "design_completed"
      topic: "直播音频审核"
    last_activity: "2026-07-17"
    description: "SAAS 直播音频审核模块"

active_project: "SAAS"  # 当前活跃项目（会话恢复时优先定位）
```

**涉及文件**：
- 新建 `.codebuddy/knowledge/PROJECT-INDEX.yml`
- `config.yml` 新增 `project_index` 引用
- `pm-agent.yml` 新增会话恢复时读取 PROJECT-INDEX.yml 的逻辑
- `project-lifecycle.yml` 新增 `/init` 和 `/close` 时更新 PROJECT-INDEX.yml 的逻辑

### 修复4：config.yml 顶层 project 字段废弃或改为 default_project 引用

**当前**：
```yaml
project:
  name: "AI-SCRM"
  mode: "new"
  industry: "ecommerce"
```

**改为**：
```yaml
project:
  # V3.0.0 多项目模式后此节为兼容保留，实际项目信息见 PROJECT-INDEX.yml
  default_project: "SAAS"  # 从 "未命名" 改为实际活跃项目
  # name/mode/industry 字段废弃（迁移到 PROJECT-INDEX.yml 各项目条目）
```

**涉及文件**：
- `config.yml`（project 节）

### 修复5：ensure-project.sh 新增骨架完整性自检模式

**新增参数**：`--check` 模式，只检查不创建，返回缺失项列表

```bash
# 用法
bash ensure-project.sh SAAS --check
# 输出
# MISSING: .codebuddy/state.json
# MISSING: pom/project.json
# MISSING: package.json
# MISSING: src/
# MISSING: tests/
# RECOMMEND: run ensure-project.sh SAAS (幂等补建)
```

脑暴和 /init 入口调用 `--check` 模式，根据缺失项决定是否触发补建。

**涉及文件**：
- `ensure-project.sh`

---

## 六、修复优先级

| 优先级 | 修复项 | 理由 |
|--------|--------|------|
| P0-立即 | 修复3（全局项目注册表） | 解决会话恢复定位错误的核心问题 |
| P0-立即 | 修复1（骨架完整性校验） | 防止未来新项目再次出现 state.json 缺失 |
| P0-立即 | 修复2（PM Agent state_guard） | 兜底机制，即使修复1漏了也能补建 |
| P1-短期 | 修复4（config.yml project 字段） | 消除硬编码误导 |
| P1-短期 | 修复5（ensure-project.sh --check） | 为修复1提供技术实现基础 |
| P2-中期 | SAAS 项目补建骨架 | 修复流程落地后对存量项目补建 |

---

## 七、影响评估

### 7.1 已造成的影响
- 用户会话恢复后 Agent 定位错误项目，浪费用户时间
- SAAS 项目无 state.json，无法追踪需求流状态（stage/streams/feedbacks）
- SAAS 项目无 Journal，对话流水和问题总账丢失
- 后续 /close 时无法做闭环校验（无 state.json → 无 streams → 无 PBL 追踪）

### 7.2 修复后预期效果
- 会话恢复时 Agent 读取 PROJECT-INDEX.yml，精确定位活跃项目
- 任何项目入口（脑暴/init）都做骨架完整性6项校验，缺失自动补建
- PM Agent 增加 state.json 存在性兜底，确保状态机永不缺失
- 多项目场景下有全局视图，不再靠猜

---

## 八、审查结论

本次问题不是单一 bug，而是**多项目模式（V3.0.0）引入时的设计缺陷**：

1. **骨架检测逻辑停留在单项目时代**——只检测目录存在与否，不检测完整性
2. **state.json 创建职责单一无兜底**——只靠 ensure-project.sh，PM Agent 不兜底
3. **多项目模式缺少项目注册表**——引入了多项目能力但没有多项目导航机制
4. **config.yml 遗留硬编码**——project.name 硬编码 AI-SCRM 从未更新

这4个缺陷叠加，导致 SAAS 项目在脑暴阶段就跳过了骨架构建，后续所有流程都在"裸奔"（无 state.json / 无 Journal / 无 pom），会话恢复时无法定位。

修复需要从流程层（brainstorm/lifecycle 骨架校验升级）+ 组织层（PM Agent state_guard）+ 导航层（PROJECT-INDEX.yml）三个维度同时入手。
