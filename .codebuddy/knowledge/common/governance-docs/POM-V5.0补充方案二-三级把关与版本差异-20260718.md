# POM V5.0 补充方案二 — 三级把关 + 版本差异可视化

> **文档定位**：本文是 `POM-V5.0补充方案-五议题深化-20260718.md` 的延续，补齐用户提出的两个新议题：① 三级总体把关机制（项目/版本/Sprint）；② 项目骨架中版本与迭代的高保真原型差异显示。
>
> **创建日期**：2026-07-18
> **前置文档**：POM-V5.0全面深度整改方案、POM-V5.0补充方案-五议题深化

---

## 议题六：三级总体把关机制（项目/版本/Sprint）

### 6.1 问题诊断

用户问题：**项目的总体把关是谁？版本的总体把关是谁？Sprint总体把关是谁？**

现状扫描发现：

| 层级 | 现状把关方 | 问题 |
|------|-----------|------|
| 项目级 | PM Agent（"全流程审查编排者"） | **PM同时管项目+版本+Sprint，职责过载**；PM是"编排者"不是"把关者"，缺乏独立的"守护人"角色 |
| 版本级 | PM Agent（R6版本沉淀）+ PO Agent（商业价值验收） | **PM和PO都管版本但边界模糊**；PM管"流程完成度"，PO管"商业价值"，但"版本总体质量谁把关"未明确 |
| Sprint级 | PM Agent（stage-1~7 supervisor） | **Sprint级无独立把关人**；PM作为每阶段的supervisor，但Sprint级的"增量可演示"目标达成谁负责？ |

**核心问题**：当前只有PM一个"编排者"，没有分层把关机制。PM既管宏观（项目战略对齐）又管中观（版本交付闭环）又管微观（Sprint增量可演示），**职责过载导致每层都管不深**。

### 6.2 三级把关设计原则

借鉴大型互联网公司的"项目-版本-迭代"三级管理实践：

| 原则 | 含义 |
|------|------|
| **分级把关** | 项目级、版本级、Sprint级各有独立把关人，职责不重叠 |
| **价值递进** | 项目级管"做对的事"，版本级管"把事做对"，Sprint级管"做对每个增量" |
| **向上汇报** | Sprint把关人→版本把关人→项目把关人，问题逐级升级 |
| **独立守护** | 把关人不是执行者，是独立审视者，避免"既当运动员又当裁判" |
| **AI辅助+人决策** | AI辅助把关（数据收集/一致性校验/风险识别），人做最终决策 |

### 6.3 三级把关人定义

```
┌─────────────────────────────────────────────────────────────┐
│                    三级总体把关机制                           │
└─────────────────────────────────────────────────────────────┘

  【项目级把关】— 做对的事（战略对齐）
  ┌─────────────────────────────────────────┐
  │ 把关人：PO Agent（产品线负责人层级）     │
  │ 把关维度：                              │
  │   • 项目商业目标是否达成                 │
  │   • 产品路线图是否偏离                   │
  │   • 跨版本价值累积是否正向               │
  │   • 公司7要素整体影响是否可接受          │
  │ 把关节点：                              │
  │   • 项目立项时（脑暴strategic后）        │
  │   • 每版本/close时（商业价值验收）       │
  │   • 项目里程碑评审时                     │
  └─────────────────────────────────────────┘
                    │ 向上汇报
                    ▼
  【版本级把关】— 把事做对（交付闭环）
  ┌─────────────────────────────────────────┐
  │ 把关人：PM Agent（版本守护人角色）       │
  │ 把关维度：                              │
  │   • 版本范围是否完整交付（Backlog覆盖）  │
  │   • 版本质量是否达标（运行时验证+测试）  │
  │   • 版本一致性是否通过（三位一体交付物） │
  │   • 版本沉淀学习是否完成                 │
  │ 把关节点：                              │
  │   • 版本规划确认时（Sprint拆解后）       │
  │   • 每Sprint Review时（增量验收）       │
  │   • 版本Final集成验证时                 │
  │   • /close时（版本闭环校验）            │
  └─────────────────────────────────────────┘
                    │ 向上汇报
                    ▼
  【Sprint级把关】— 做对每个增量（可演示）
  ┌─────────────────────────────────────────┐
  │ 把关人：PM Agent（Sprint守护人角色）     │
  │         + 当前Sprint的主导Agent轮值     │
  │ 把关维度：                              │
  │   • Sprint DoD是否全部满足              │
  │   • 增量是否可演示（AI Demo通过）       │
  │   • Sprint间依赖是否解锁                │
  │   • 运行时验证是否通过                  │
  │ 把关节点：                              │
  │   • 每阶段Review时                      │
  │   • Sprint结束DoD校验时                 │
  │   • 下一Sprint启动前置依赖校验时        │
  └─────────────────────────────────────────┘
```

### 6.4 三级把关职责矩阵

| 把关维度 | 项目级（PO） | 版本级（PM） | Sprint级（PM+轮值Agent） |
|---------|-------------|-------------|------------------------|
| **战略对齐** | ✅ 主导 | 审视 | — |
| **商业价值** | ✅ 主导 | 审视 | — |
| **公司7要素整体影响** | ✅ 主导 | — | — |
| **版本范围完整性** | 审视 | ✅ 主导 | — |
| **版本质量达标** | — | ✅ 主导 | 审视 |
| **三位一体交付物一致性** | — | ✅ 主导 | 审视 |
| **版本沉淀学习** | 审视 | ✅ 主导 | — |
| **Sprint DoD满足** | — | 审视 | ✅ 主导 |
| **增量可演示** | — | 审视 | ✅ 主导 |
| **Sprint间依赖解锁** | — | 审视 | ✅ 主导 |
| **运行时验证通过** | — | 审视 | ✅ 主导 |
| **阶段Review通过** | — | 审视 | ✅ 主导 |

**注**：✅主导=最终决策权；审视=发现问题可升级但不做最终决策

### 6.5 把关升级机制（问题逐级上报）

```yaml
# 三级把关升级机制
escalation_rules:
  
  sprint_to_version:            # Sprint级问题升级到版本级
    trigger:
      - "Sprint DoD 3次未达标"
      - "运行时验证连续2次失败"
      - "Sprint间依赖阻塞超过2天"
      - "AI Demo报告含P0问题"
    action: "PM（版本守护人）介入，决定是否调整Sprint范围或触发defect-reflow"
  
  version_to_project:           # 版本级问题升级到项目级
    trigger:
      - "版本范围3次调整仍未完成"
      - "版本商业价值验收不通过"
      - "三位一体交付物一致性校验3次失败"
      - "版本沉淀学习评分<60分"
    action: "PO（项目把关人）介入，决定是否调整产品路线图或重新规划"
  
  project_to_human:             # 项目级问题升级到人
    trigger:
      - "项目商业目标明确无法达成"
      - "公司7要素出现不可接受的negative影响"
      - "产品路线图需要重大调整"
      - "项目是否继续需要重新评估"
    action: "PO请求人决策（按议题一的人性化确认机制）"
```

### 6.6 PO Agent 项目级把关增强

PO Agent当前职责聚焦"产品规划"和"商业价值验收"，需增强为"**项目级总体把关人**"：

```yaml
# po-agent.md 增强 — 项目级把关人角色
po_agent_guardian_role:
  level: "项目级"
  role_name: "项目总体把关人（Project Guardian）"
  
  guard_dimensions:
    
    g1_commercial_goal:        # 商业目标对齐
      check: "项目交付是否达成立项时定义的商业目标（BO/BG）"
      frequency: "每版本/close时"
      evidence: "商业价值验收报告 + BO/BG达成度矩阵"
    
    g2_roadmap_alignment:      # 路线图对齐
      check: "实际交付是否偏离产品路线图"
      frequency: "每版本/close时"
      evidence: "路线图 vs 实际交付对比表"
    
    g3_value_accumulation:     # 价值累积
      check: "跨版本的商业价值是否正向累积"
      frequency: "每3个版本一次"
      evidence: "版本价值累积趋势图（v1→v2→v3的BO达成率）"
    
    g4_company_factors:        # 公司7要素整体影响
      check: "项目整体对公司7要素的影响是否可接受"
      frequency: "项目里程碑时"
      evidence: "7要素影响累积评估表"
    
    g5_cross_version_learning: # 跨版本学习
      check: "历史版本的经验教训是否被应用"
      frequency: "每版本/init时"
      evidence: "经验库引用记录 + lessons-learned应用追踪"
  
  guard_outputs:
    - "项目把关报告（PROJECT-GUARD-REPORT-{project}.md）"
    - "商业价值验收结论（已有，纳入把关报告）"
    - "路线图调整建议（如有偏离）"
    - "项目继续/暂停/终止建议（极端情况）"
  
  guard_gates:
    - id: "G-PROJ-GUARD-01"
      name: "项目商业目标对齐"
      check: "当前版本交付的BO/BG达成率 ≥ 80%"
      severity: "block"    # 不通过则版本不能/close
    
    - id: "G-PROJ-GUARD-02"
      name: "路线图偏离度"
      check: "实际交付 vs 路线图偏离 ≤ 20%（新增范围需PO确认）"
      severity: "warn"     # 警告但不阻断
    
    - id: "G-PROJ-GUARD-03"
      name: "价值累积正向"
      check: "跨版本BO达成率趋势不下降"
      severity: "warn"
```

### 6.7 PM Agent 双角色明确（版本守护 + Sprint守护）

PM Agent当前职责过载，需明确拆分为两个守护角色：

```yaml
# pm-agent.md 增强 — 双守护角色
pm_agent_dual_guardian:
  
  role_1_version_guardian:      # 版本级守护人
    level: "版本级"
    role_name: "版本总体把关人（Version Guardian）"
    
    guard_dimensions:
      
      vg1_scope_completeness:   # 版本范围完整性
        check: "PO Backlog的所有Must项是否全部交付"
        evidence: "Backlog覆盖矩阵（BL项 × 交付状态）"
      
      vg2_quality_qualified:    # 版本质量达标
        check: "运行时验证通过 + 五层测试通过 + 验收通过"
        evidence: "运行时验证报告 + 测试报告 + 验收报告"
      
      vg3_delivery_consistency: # 三位一体交付物一致性
        check: "PRD ↔ 高保真仿真原型 ↔ 可交互用例卡片 三者编号一致且行为一致"
        evidence: "三位一体一致性校验报告"
      
      vg4_sedimentation_done:   # 版本沉淀学习完成
        check: "版本沉淀学习8步全部完成 + 质量评分≥60"
        evidence: "版本沉淀报告 + 质量评分"
      
      vg5_sprint_summation:     # Sprint汇总
        check: "所有Sprint的DoD全部满足 + Sprint间依赖全部解锁"
        evidence: "Sprint DoD汇总表 + 依赖解锁记录"
    
    guard_outputs:
      - "版本把关报告（VERSION-GUARD-REPORT-{project}-v{version}.md）"
      - "版本/close前置校验结论（通过/不通过+原因）"
    
    guard_gates:
      - id: "G-VER-GUARD-01"
        name: "版本范围完整性"
        check: "Backlog Must项100%交付，Should项≥80%交付"
        severity: "block"
      
      - id: "G-VER-GUARD-02"
        name: "版本质量达标"
        check: "运行时验证通过 + 五层测试通过 + 验收通过"
        severity: "block"
      
      - id: "G-VER-GUARD-03"
        name: "三位一体交付物一致性"
        check: "G-HO-DELIVERY-01~05全部通过"
        severity: "block"
      
      - id: "G-VER-GUARD-04"
        name: "版本沉淀学习完成"
        check: "沉淀8步完成 + 质量评分≥60"
        severity: "block"
  
  role_2_sprint_guardian:       # Sprint级守护人
    level: "Sprint级"
    role_name: "Sprint总体把关人（Sprint Guardian）"
    collab: "与当前Sprint的主导Agent轮值协作"
    
    guard_dimensions:
      
      sg1_dod_satisfied:        # DoD满足
        check: "当前Sprint的DoD全部满足"
        evidence: "DoD校验清单（6项逐条）"
      
      sg2_demo_passable:        # 增量可演示
        check: "AI Demo报告通过（截图+流程跑通+无P0问题）"
        evidence: "AI Demo报告"
      
      sg3_dependency_unlocked:  # 依赖解锁
        check: "下一Sprint的前置依赖已就绪（非最后Sprint）"
        evidence: "依赖校验报告"
      
      sg4_runtime_verified:     # 运行时验证
        check: "build+test+dev启动+页面访问+菜单跳转+数据保存+后置条件+流程跑通 全通过"
        evidence: "运行时验证报告"
      
      sg5_stage_reviews:        # 阶段Review
        check: "本Sprint的所有阶段Review通过"
        evidence: "Review报告汇总"
    
    guard_outputs:
      - "Sprint把关报告（SPRINT-GUARD-REPORT-{project}-v{version}-S{n}.md）"
      - "下一Sprint启动前置校验结论"
    
    guard_gates:
      - id: "G-SPRINT-GUARD-01"
        name: "Sprint DoD满足"
        check: "DoD 6项全部true"
        severity: "block"
      
      - id: "G-SPRINT-GUARD-02"
        name: "增量可演示"
        check: "AI Demo通过 + 无P0问题"
        severity: "block"
      
      - id: "G-SPRINT-GUARD-03"
        name: "下一Sprint依赖解锁"
        check: "下一Sprint的所有dependencies已就绪"
        severity: "block"    # 非最后Sprint时
```

### 6.8 轮值主导Agent机制（Sprint级协作把关）

Sprint级把关需要PM与当前Sprint的主导Agent协作。因为不同Sprint的重点不同（有的重需求、有的重开发），引入"轮值主导Agent"：

```yaml
# Sprint轮值主导Agent机制
sprint_rotation:
  rule: "每个Sprint根据其核心内容，确定一个主导Agent与PM协作把关"
  
  rotation_matrix:
    - sprint_focus: "需求为主（新模块首Sprint）"
      lead_agent: "ba-agent"
      collab_guard: "BA负责需求完整性把关，PM负责流程把关"
    
    - sprint_focus: "设计为主（重交互的Sprint）"
      lead_agent: "ux-agent"
      collab_guard: "UX负责设计完整性把关，PM负责流程把关"
    
    - sprint_focus: "开发为主（常规Sprint）"
      lead_agent: "fd-agent"
      collab_guard: "FD负责代码可运行把关，PM负责流程把关"
    
    - sprint_focus: "集成为主（Final Sprint）"
      lead_agent: "qa-agent"
      collab_guard: "QA负责集成测试把关，PM负责流程把关"
  
  decision_rule: "PM根据SPRINT-PLAN的sprint goal判断本Sprint的focus，确定轮值主导Agent"
```

### 6.9 把关报告体系

| 报告 | 产出方 | 频率 | 路径 |
|------|--------|------|------|
| Sprint把关报告 | PM+轮值Agent | 每Sprint结束 | `docs/06-sprint-guard/SPRINT-GUARD-{project}-v{version}-S{n}.md` |
| 版本把关报告 | PM | 每版本/close前 | `docs/07-version-guard/VERSION-GUARD-{project}-v{version}.md` |
| 项目把关报告 | PO | 每版本/close时 + 里程碑 | `docs/08-project-guard/PROJECT-GUARD-{project}.md`（累积更新） |

### 6.10 落地改造清单

| 改造项 | 文件 | 改造内容 |
|--------|------|----------|
| po-agent.md增强 | `agents/po-agent.md` | 新增"项目级总体把关人"角色 + g1~g5把关维度 + G-PROJ-GUARD-01~03 |
| pm-agent.md增强 | `agents/pm-agent.md` | 明确双角色：版本守护人（vg1~vg5）+ Sprint守护人（sg1~sg5）+ 轮值机制 |
| project-lifecycle.yml增强 | `configs/workflows/project-lifecycle.yml` | stage-7.5/close前增加版本把关校验；每Sprint结束增加Sprint把关校验 |
| gates-registry.yml补充 | `gates-registry.yml` | 新增G-PROJ-GUARD-01~03 + G-VER-GUARD-01~04 + G-SPRINT-GUARD-01~03 |
| config.yml骨架补充 | `config.yml` | layout新增 `06-sprint-guard` / `07-version-guard` / `08-project-guard` 目录 |
| ensure-project.sh增强 | `scripts/ensure-project.sh` | 新增三个guard目录的创建 |
| 新建把关报告模板 | `common/guard-report-templates.yml`（新建） | 三级把关报告模板 |

---

## 议题七：版本与迭代的高保真原型差异显示

### 7.1 问题诊断

用户问题：**在项目骨架中需要能够体现版本、迭代对应的高保真原型的差异，如何进行差异性显示呢？**

现状扫描发现：

1. **项目骨架无版本维度**：`projects/{project}/src/` 是扁平结构，所有版本的代码混在一起，无法区分v1.0.0和v1.1.0的原型差异
2. **无版本快照机制**：/close时只做文档冻结（VERSION-INDEX），不做代码快照，下一个版本的开发会覆盖上一个版本的代码
3. **无Sprint维度**：Sprint 1和Sprint 2的代码增量无法区分
4. **无差异可视化**：研发团队/PO/PM无法直观看到"v1.1.0相比v1.0.0原型多了什么/改了什么"
5. **无版本回溯能力**：想看v1.0.0的原型时，代码已经被v1.1.0覆盖

### 7.2 设计目标

| 目标 | 含义 |
|------|------|
| **版本可回溯** | 任意版本的仿真原型都可独立访问和运行 |
| **Sprint可回溯** | 任意Sprint的增量都可独立访问和运行 |
| **差异可可视化** | 版本间/Sprint间的原型差异能直观呈现 |
| **空间可控** | 不是每个版本/Sprint都全量复制代码（太占空间） |
| **切换便捷** | 研发团队/PO/PM能一键切换到任意版本/Sprint查看原型 |

### 7.3 方案：三层差异显示架构

```
┌─────────────────────────────────────────────────────────────┐
│              版本/Sprint 差异显示三层架构                     │
└─────────────────────────────────────────────────────────────┘

  【第一层：版本快照（Version Snapshot）】
  ┌─────────────────────────────────────────┐
  │ /close时冻结当前版本的完整仿真原型        │
  │ 方式：Git Tag + 产物归档                  │
  │ 路径：docs/09-versions/v{version}/       │
  │ 内容：原型构建产物 + PRD + 用例卡片       │
  └─────────────────────────────────────────┘
  
  【第二层：版本差异报告（Version Diff Report）】
  ┌─────────────────────────────────────────┐
  │ AI自动生成版本间的差异报告                │
  │ 方式：对比v{n}和v{n-1}的产物              │
  │ 路径：docs/09-versions/v{version}/DIFF.md│
  │ 内容：页面增删改 + 用例增删改 + 数据变更  │
  └─────────────────────────────────────────┘
  
  【第三层：在线版本切换器（Version Switcher）】
  ┌─────────────────────────────────────────┐
  │ 仿真原型内置版本切换器UI                  │
  │ 方式：dev server支持 ?version=v1.0.0     │
  │ 功能：切换版本查看 + 差异高亮 + 并排对比   │
  └─────────────────────────────────────────┘
```

### 7.4 第一层：版本快照机制

#### 7.4.1 Git Tag + 产物归档

```yaml
# 版本快照机制
version_snapshot:
  trigger: "/close 时执行"
  
  snapshot_actions:
    
    - action: "Git Tag"
      command: "git tag -a v{version} -m '版本{version}冻结'"
      purpose: "代码版本标记，可随时 git checkout v{version} 回溯"
    
    - action: "构建产物归档"
      command: "npm run build:sim → 产物复制到 docs/09-versions/v{version}/build/"
      purpose: "无需重新构建即可访问历史版本原型"
    
    - action: "PRD快照"
      command: "复制当前版本的所有PRD到 docs/09-versions/v{version}/prd/"
      purpose: "文档与原型对应"
    
    - action: "用例卡片快照"
      command: "复制当前版本的所有用例卡片到 docs/09-versions/v{version}/cards/"
      purpose: "卡片与原型对应"
    
    - action: "Demo报告归档"
      command: "复制AI Demo报告到 docs/09-versions/v{version}/demo/"
      purpose: "运行时验证证据保留"
  
  snapshot_structure:
    docs/09-versions/
      v1.0.0/
        build/              # 构建产物（可直接部署访问）
        prd/                # PRD快照
        cards/              # 用例卡片快照
        demo/               # Demo报告
        SNAPSHOT.yml        # 快照元数据
        DIFF.md             # 与上一版本的差异报告
      v1.1.0/
        ...
      VERSION-TIMELINE.yml  # 版本时间线（全局）
```

#### 7.4.2 快照元数据

```yaml
# docs/09-versions/v{version}/SNAPSHOT.yml
version: "v1.1.0"
project: "{project}"
snapshot_date: "2026-07-18"
snapshot_by: "pm-agent"

version_info:
  previous_version: "v1.0.0"
  sprint_count: 3
  sprints: ["S1", "S2", "S3"]
  
build_info:
  build_command: "npm run build:sim"
  build_hash: "abc123..."
  dev_server_url: "http://localhost:3333"
  pages_count: 15
  routes_count: 15

artifacts:
  prd_files: ["REQ-直播音频审核-v1.1.0.md", ...]
  card_files: ["UC-LIVE-APP-001.card.yml", ...]
  demo_report: "DEMO-v1.1.0-20260718.md"
  
guard_reports:
  sprint_guard: ["SPRINT-GUARD-{project}-v1.1.0-S1.md", ...]
  version_guard: "VERSION-GUARD-{project}-v1.1.0.md"
  project_guard: "PROJECT-GUARD-{project}.md（v1.1.0条目）"

metrics:
  total_pages: 15
  total_use_cases: 45
  total_fns: 38
  runtime_verification: "passed"
  test_coverage: "87%"
  po_acceptance: "pass"
```

### 7.5 第二层：版本差异报告（AI自动生成）

#### 7.5.1 差异报告内容

```markdown
# 版本差异报告：v1.1.0 → v1.0.0

> 生成时间：2026-07-18
> 生成方：AI自动对比

## 一、变更摘要

| 维度 | v1.0.0 | v1.1.0 | 变化 |
|------|--------|--------|------|
| 页面数 | 12 | 15 | +3 |
| 用例数 | 38 | 45 | +7 |
| FN数 | 32 | 38 | +6 |
| Sprint数 | 2 | 3 | +1 |

## 二、页面变更

### 新增页面（3个）
| 页面 | 路由 | 所属Sprint | FN |
|------|------|-----------|-----|
| 直播间观看页(APP) | /app/live-room | S2 | FN-LIVE-APP-001~005 |
| 禁言审核页(PC) | /pc/mute-audit | S3 | FN-LIVE-PC-001~003 |
| 审核详情页(PC) | /pc/mute-audit/detail | S3 | FN-LIVE-PC-004~005 |

### 修改页面（2个）
| 页面 | 变更内容 | 影响FN |
|------|---------|--------|
| 商品列表页 | 新增"直播商品"筛选 | FN-SHP-PC-002 |
| 订单详情页 | 新增"直播来源"字段 | FN-ODR-PC-005 |

### 删除页面（0个）
无

## 三、用例变更

### 新增用例（7个）
| UC编号 | 用例名 | 所属FN | 交互卡片 |
|--------|--------|--------|---------|
| UC-LIVE-APP-001 | 进入直播间 | FN-LIVE-APP-001 | ✅ 已生成 |
| UC-LIVE-APP-002 | 主播开播触发音频审核 | FN-LIVE-APP-002 | ✅ 已生成 |
| ... | ... | ... | ... |

### 修改用例（2个）
| UC编号 | 变更内容 |
|--------|---------|
| UC-SHP-PC-002 | 新增"直播商品"筛选步骤 |
| UC-ODR-PC-005 | 新增"直播来源"字段验证步骤 |

## 四、数据变更

### 新增契约（2个）
| 契约 | 字段数 | 说明 |
|------|--------|------|
| LiveRoomSchema | 12 | 直播间数据 |
| MuteEventSchema | 8 | 禁言事件 |

### 修改契约（1个）
| 契约 | 变更内容 |
|------|---------|
| OrderSchema | 新增 live_source 字段 |

### 新增sim适配器（3个）
| 适配器 | 说明 |
|--------|------|
| LiveSimRepository | 直播间数据模拟 |
| MuteSimRepository | 禁言事件模拟 |
| AudioStreamSimAdapter | 音频流模拟（含滴声屏蔽） |

## 五、Sprint维度差异

### Sprint 1（v1.0.0已交付，v1.1.0无变化）
- 页面：商品列表/详情/下单/支付（4个）
- 状态：已冻结

### Sprint 2（v1.1.0新增）
- 页面：直播间观看页/禁言审核页（2个）
- 状态：新增

### Sprint 3（v1.1.0新增）
- 页面：审核详情页 + 修改2个已有页面
- 状态：新增

## 六、差异可视化

### 页面级差异图
[Mermaid graph：v1.0.0页面 → v1.1.0页面，新增绿色/修改黄色/删除红色]

### 用例级差异图
[Mermaid graph：v1.0.0用例 → v1.1.0用例，新增绿色/修改黄色]

### 数据流差异图
[Mermaid flowchart：v1.0.0数据流 → v1.1.0数据流，新增路径高亮]
```

#### 7.5.2 差异报告生成机制

```yaml
# AI自动生成差异报告
diff_report_generation:
  trigger: "/close 时，在版本快照之后执行"
  agent: "pm-agent + doc-agent协作"
  
  generation_steps:
    - step: 1
      action: "读取v{version}和v{version-1}的SNAPSHOT.yml"
    
    - step: 2
      action: "对比页面清单（路由级）"
      output: "新增/修改/删除页面列表"
    
    - step: 3
      action: "对比用例清单（UC编号级）"
      output: "新增/修改/删除用例列表"
    
    - step: 4
      action: "对比FN清单"
      output: "新增/修改/删除FN列表"
    
    - step: 5
      action: "对比契约Schema（字段级diff）"
      output: "Schema变更详情"
    
    - step: 6
      action: "对比sim适配器清单"
      output: "适配器变更列表"
    
    - step: 7
      action: "对比Sprint计划"
      output: "Sprint维度差异"
    
    - step: 8
      action: "生成Mermaid差异图（页面级/用例级/数据流级）"
      output: "可视化差异图"
    
    - step: 9
      action: "汇总为DIFF.md"
      output: "docs/09-versions/v{version}/DIFF.md"
```

### 7.6 第三层：在线版本切换器

#### 7.6.1 版本切换器UI

在仿真原型中内置版本切换器，研发团队/PO/PM可一键切换版本查看：

```yaml
# 版本切换器设计
version_switcher:
  location: "仿真原型右上角悬浮组件"
  default_hidden: true          # 默认隐藏，点击展开
  trigger: "点击右上角版本号徽章"
  
  ui_structure:
    - "当前版本：v1.1.0（徽章显示）"
    - "点击展开 → 版本列表"
    - "每个版本可点击 → 切换到该版本原型"
    - "支持'并排对比'模式 → 左右两版本同时显示"
  
  switch_modes:
    
    - mode: "single"            # 单版本查看
      description: "切换到选中版本的原型"
      implementation: "dev server根据?version=参数加载对应build产物"
    
    - mode: "diff_highlight"    # 差异高亮
      description: "在当前版本上高亮显示与上一版本的差异"
      implementation: "读取DIFF.md，新增页面绿色边框/修改页面黄色边框/删除页面红色边框"
    
    - mode: "side_by_side"      # 并排对比
      description: "左右两版本并排显示"
      implementation: "iframe左=v{version-1}，iframe右=v{version}，同步路由"
    
    - mode: "timeline"          # 时间线
      description: "展示所有版本的时间线，可滑动查看"
      implementation: "读取VERSION-TIMELINE.yml，渲染时间线组件"
```

#### 7.6.2 版本切换器技术实现

```yaml
# 版本切换器技术方案
version_switcher_impl:
  
  build_strategy:
    description: "每版本构建为独立静态产物，部署到不同子路径"
    example:
      - "v1.0.0 → /versions/v1.0.0/index.html"
      - "v1.1.0 → /versions/v1.1.0/index.html"
      - "latest → /index.html（始终指向最新版本）"
  
  route_strategy:
    description: "dev server和preview server支持版本路由"
    routes:
      - "http://localhost:3333/ → 最新版本"
      - "http://localhost:3333/?version=v1.0.0 → v1.0.0版本"
      - "http://localhost:3333/versions/v1.1.0/ → v1.1.0版本（直接访问）"
  
  diff_highlight_impl:
    description: "差异高亮的实现"
    method: "读取DIFF.md的页面变更列表，在当前版本原型中给对应页面加边框"
    example:
      - "新增页面 → 页面容器加绿色边框 + 角标'NEW'"
      - "修改页面 → 页面容器加黄色边框 + 角标'MODIFIED'"
      - "删除页面 → 在版本切换器中红色标注，点击查看上一版本的该页面"
  
  side_by_side_impl:
    description: "并排对比的实现"
    method: "左右两个iframe，分别加载v{version-1}和v{version}，路由同步"
    sync: "左侧iframe路由变化时，右侧iframe同步到相同路由（如该路由在另一版本不存在则提示）"
```

### 7.7 版本时间线（VERSION-TIMELINE.yml）

```yaml
# docs/09-versions/VERSION-TIMELINE.yml — 全局版本时间线
project: "{project}"
last_updated: "2026-07-18"

versions:
  - version: "v1.0.0"
    date: "2026-07-10"
    sprints: ["S1", "S2"]
    theme: "商品交易MVP"
    pages: 12
    use_cases: 38
    po_acceptance: "pass"
    snapshot_path: "docs/09-versions/v1.0.0/"
    diff_to_previous: null    # 首版本无差异
    key_changes: ["商品CRUD", "订单交易闭环", "支付对接"]
  
  - version: "v1.1.0"
    date: "2026-07-18"
    sprints: ["S1", "S2", "S3"]
    theme: "直播音频审核"
    pages: 15
    use_cases: 45
    po_acceptance: "pass"
    snapshot_path: "docs/09-versions/v1.1.0/"
    diff_to_previous: "docs/09-versions/v1.1.0/DIFF.md"
    key_changes: ["直播间模拟", "音频审核流程", "禁言屏蔽"]
  
  - version: "v1.2.0"          # 规划中
    status: "planning"
    planned_date: "2026-07-25"
    theme: "会员体系"
    planned_pages: 18
```

### 7.8 Sprint级差异显示

除了版本级差异，还需支持Sprint级差异显示（同一版本内Sprint间的增量）：

```yaml
# Sprint级差异显示
sprint_diff:
  trigger: "每Sprint结束后生成"
  path: "docs/06-sprint-guard/SPRINT-DIFF-{project}-v{version}-S{n}.md"
  
  content:
    - "本Sprint新增的页面（vs上一Sprint）"
    - "本Sprint新增的用例（vs上一Sprint）"
    - "本Sprint新增的FN（vs上一Sprint）"
    - "本Sprint修改的页面（vs上一Sprint）"
    - "本Sprint的数据变更（vs上一Sprint）"
  
  visualization: "Sprint切换器（类似版本切换器，但粒度为Sprint）"
  
  switcher:
    location: "版本切换器内嵌Sprint切换"
    ui: "选中某版本后，可进一步选择该版本内的Sprint查看增量"
    example: "v1.1.0 → S1(基础) → S2(直播) → S3(审核) 逐Sprint查看增量"
```

### 7.9 差异显示的三个使用场景

| 场景 | 使用者 | 使用方式 | 价值 |
|------|--------|---------|------|
| **研发团队交接** | 研发团队 | 查看版本切换器 → 理解v1.1.0相比v1.0.0多了什么 | 快速理解新版本范围，降低沟通成本 |
| **PO商业价值验收** | PO | 查看版本差异报告 → 验证v1.1.0交付了哪些商业价值 | 对照BO/BG验证价值交付 |
| **PM版本规划** | PM | 查看版本时间线 → 规划v1.2.0 | 基于历史版本趋势规划未来版本 |

### 7.10 项目骨架增强

```yaml
# config.yml layout增强 — 新增版本差异相关目录
projects:
  layout:
    # ... 现有目录 ...
    
    # V5.0新增：版本差异显示
    versions: "projects/{project}/docs/09-versions/"           # 版本快照+差异报告
    sprint_guard: "projects/{project}/docs/06-sprint-guard/"   # Sprint把关+Sprint差异
    version_guard: "projects/{project}/docs/07-version-guard/" # 版本把关报告
    project_guard: "projects/{project}/docs/08-project-guard/" # 项目把关报告
```

### 7.11 ensure-project.sh增强

```bash
# ensure-project.sh 新增目录创建
ensure_dir(f"projects/{proj}/docs/09-versions")
ensure_dir(f"projects/{proj}/docs/06-sprint-guard")
ensure_dir(f"projects/{proj}/docs/07-version-guard")
ensure_dir(f"projects/{proj}/docs/08-project-guard")

# 初始化VERSION-TIMELINE.yml
ensure_file(f"projects/{proj}/docs/09-versions/VERSION-TIMELINE.yml",
    "# 版本时间线\n"
    f"project: \"{proj}\"\n"
    "last_updated: \"\"\n"
    "versions: []\n")
```

### 7.12 /close流程增强（版本快照+差异报告）

```yaml
# project-lifecycle.yml stage-8 /close增强
stage-8:
  name: "版本关闭 + 快照 + 差异报告"
  actions:
    
    - action: "版本把关校验（G-VER-GUARD-01~04）"
      by: "pm-agent"
      check: "版本守护人4项把关全部通过"
    
    - action: "项目把关校验（G-PROJ-GUARD-01~03）"
      by: "po-agent"
      check: "项目把关人3项把关全部通过"
    
    - action: "Git Tag冻结"
      command: "git tag -a v{version} -m '版本{version}冻结'"
    
    - action: "构建产物归档"
      command: "npm run build:sim → 复制到 docs/09-versions/v{version}/build/"
    
    - action: "PRD + 用例卡片 + Demo报告归档"
      by: "pm-agent"
      to: "docs/09-versions/v{version}/"
    
    - action: "生成SNAPSHOT.yml"
      by: "pm-agent"
    
    - action: "生成DIFF.md（AI自动对比上一版本）"
      by: "pm-agent + doc-agent"
    
    - action: "更新VERSION-TIMELINE.yml"
      by: "pm-agent"
    
    - action: "版本沉淀学习（已有R6）"
      by: "pm-agent"
    
    - action: "PM询问PO下一版本规划（已有敏捷递归）"
      by: "pm-agent → po-agent"
```

### 7.13 落地改造清单

| 改造项 | 文件 | 改造内容 |
|--------|------|----------|
| config.yml骨架增强 | `config.yml` | layout新增4个目录（09-versions/06-sprint-guard/07-version-guard/08-project-guard） |
| ensure-project.sh增强 | `scripts/ensure-project.sh` | 新增4个目录创建 + VERSION-TIMELINE.yml初始化 |
| project-lifecycle.yml增强 | `configs/workflows/project-lifecycle.yml` | stage-8 /close增加版本快照+差异报告+把关校验 |
| 新建版本快照Skill | `configs/skills/version-snapshotter.yml`（新建） | AI执行版本快照（Git Tag+产物归档+SNAPSHOT生成） |
| 新建差异报告Skill | `configs/skills/version-diff-reporter.yml`（新建） | AI自动对比两版本生成DIFF.md |
| 新建版本切换器组件 | `src/components/VersionSwitcher.tsx`（FD实现） | 仿真原型内置版本切换器UI（4模式） |
| FD Agent增强 | `agents/fd-agent.md` | FD需在仿真原型中实现版本切换器组件 |
| gates-registry.yml | `gates-registry.yml` | 新增G-SNAPSHOT-01（版本快照完整性）+ G-DIFF-01（差异报告生成） |
| 版本时间线规范 | `common/version-timeline-standards.yml`（新建） | VERSION-TIMELINE.yml格式规范 |

---

## 八、两议题与五议题方案的关系

| 议题 | 与五议题方案的关系 |
|------|------------------|
| 议题六：三级把关 | 补强议题二（脑暴→PO→需求探索）的PO角色 + 补强议题四（Sprint拆解）的Sprint把关 + 补强议题五（三位一体交付）的版本一致性把关 |
| 议题七：版本差异显示 | 补强议题五（三位一体交付）的交付物可回溯性 + 新增版本/Sprint维度的差异可视化 |

## 九、待用户确认事项

| 序号 | 确认事项 | AI推荐 | 置信度 |
|------|---------|--------|--------|
| 1 | 议题六的三级把关：项目级PO + 版本级PM + Sprint级PM+轮值Agent，是否合理？ | 合理，分级把关避免职责过载 | high |
| 2 | 议题六的轮值主导Agent机制（按Sprint focus轮值BA/UX/FD/QA）是否需要？ | 需要，不同Sprint重点不同 | medium |
| 3 | 议题七的版本快照用Git Tag + 产物归档，是否足够？是否需要更重的方案（如独立分支）？ | Git Tag足够，轻量且可回溯 | high |
| 4 | 议题七的版本切换器4模式（single/diff_highlight/side_by_side/timeline）是否都需要？ | 都需要，覆盖不同使用场景 | medium |
| 5 | 议题七的Sprint级差异显示是否需要？还是只做版本级差异？ | 需要，Sprint级差异帮助研发团队理解增量 | high |
| 6 | 议题七的差异报告用AI自动生成（对比SNAPSHOT.yml），是否需要人工补充？ | AI自动生成为主，PO/PM可人工补充 | high |

---

**文档结束**。等待用户对第九章待确认事项的反馈后，与五议题方案合并进入实施阶段。
