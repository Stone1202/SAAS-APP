# POM V5.0 统一整改方案（最终合并版）

> **文档定位**：本文是POM V5.0的**最终统一方案**，合并了三份文档：
> - `POM-V5.0全面深度整改方案-20260718.md`（主方案：知识库重构+流程重构+AI边界+AI能力+AI学习）
> - `POM-V5.0补充方案-五议题深化-20260718.md`（议题一~五：AI确认机制/脑暴PO衔接/四层价值7要素/Sprint拆解/三位一体交付）
> - `POM-V5.0补充方案二-三级把关与版本差异-20260718.md`（议题六~七：三级把关/版本差异）
>
> 并融合了用户的6项确认反馈 + 敏捷实践经验（Scrum 334框架）。
>
> **创建日期**：2026-07-18
> **状态**：待用户最终审阅 → 确认后进入实施

---

## 第一部分：用户6项确认反馈处理

| 序号 | 用户反馈 | 处理结果 |
|------|---------|---------|
| 1 | Sprint专心交给**敏捷教练Agent**，PM关注整个版本 | ✅ 采纳。新增**SM Agent（敏捷教练/Scrum Master）**作为第11个Agent，专职Sprint级把关；PM从Sprint级抽身，专注版本级把关 |
| 2 | 不需要轮值主导Agent机制。Spring敏捷教练Agent主要是把控整个【BA/UX/FD/QA】看本次Spring是否符合敏捷交付条件 | ✅ 采纳。删除轮值机制。SM Agent作为Sprint守护人，把控BA/UX/FD/QA的交付是否符合敏捷交付条件（DoD+增量可演示+流程闭环） |
| 3 | 版本快照用Git Tag + 产物归档 是否足够？ | ✅ 用户未明确否定，保持Git Tag + 产物归档方案（轻量可回溯） |
| 4 | 版本切换器4模式只需要 single/diff_highlight/side_by_side 三种 | ✅ 采纳。删除timeline模式，保留single/diff_highlight/side_by_side三种 |
| 5 | 只做版本级差异，不需要Sprint级差异 | ✅ 采纳。删除Sprint级差异显示，只保留版本级差异报告 |
| 6 | 差异报告AI自动生成，需要人工补充 | ✅ 采纳。AI自动生成DIFF.md后，PO/PM可人工补充"商业价值变更说明/风险变更说明"等AI无法判断的内容 |

---

## 第二部分：敏捷实践经验融合

### 2.1 Scrum 334框架对齐

基于用户提供的敏捷实践文章（《回顾｜敏捷实践之路中汲取的一些经验》），POM V5.0对齐Scrum 334框架：

| Scrum要素 | 传统Scrum | POM V5.0对应 |
|-----------|----------|-------------|
| **3角色** | | |
| 产品负责人(PO) | 最大化产品价值，管理产品待办列表 | **PO Agent**（项目级把关人 + Backlog管理 + 商业价值验收） |
| 敏捷教练(SM) | 帮助团队理解Scrum，保障Scrum事件，移除障碍 | **SM Agent（新增）**（Sprint级守护人，把控BA/UX/FD/QA交付符合敏捷条件） |
| 开发团队 | 跨职能，将需求转为可交付增量 | **BA/UX/Arch/FD/QA Agent团队**（跨职能协作交付增量） |
| **3工件** | | |
| 产品待办列表 | PO全权负责，持续动态更新 | **PROD-BACKLOG-{project}-v{version}.yml**（PO管理） |
| Sprint待办列表 | 团队全权负责，从产品待办列表选取 | **SPRINT-BACKLOG-{project}-v{version}-S{n}.yml**（SM+团队管理） |
| 产品增量 | 每Sprint完成的所有待办项总和，必须可用 | **每Sprint交付的1-3个页面 + 运行时验证通过 + Demo报告**（必须可演示） |
| **4事件** | | |
| Sprint计划会 | Sprint第一天，PO讲解用户故事，团队拆解任务 | **Sprint启动会**（SM主持，PO讲解Backlog项，BA/UX/FD/QA认领并拆解） |
| 每日立会 | 每天15分钟，昨天/今天/障碍 | **AI每日进度报告**（SM每阶段自动生成，无需人工每日站会） |
| Sprint评审会 | Sprint最后一天，演示完成功能 | **Sprint Review**（SM主持，AI Demo + PO商业价值审视） |
| Sprint回顾会 | Sprint最后一天，回顾改进 | **Sprint Retrospective**（SM主持，AI学习记录 + 经验提炼） |

### 2.2 敏捷核心原则对齐

文章提炼的敏捷原则在POM V5.0的体现：

| 敏捷原则 | 文章要点 | POM V5.0体现 |
|---------|---------|-------------|
| 拥抱变化≠随意变更 | 需求调整需与研发团队商讨确认 | 议题一：AI人性化确认机制，变更需人确认 |
| 轻文档≠零文档 | 重沟通轻文档，文档传递信息+记录留存 | 议题五：三位一体交付物（PRD+仿真原型+用例卡片），文档精简但完整 |
| 增量必须可用 | 无论PO是否决定发布，增量都必须可用 | 议题四：Sprint DoD含"运行时验证通过+可演示" |
| 2周一个Sprint最佳 | 作者实战经验认为2周最佳 | POM默认1 Sprint = 1次完整流程周期（AI加速下可更短） |
| 敏捷是思想文化 | 以人为本，自我迭代更新 | V5.0核心：AI思考+验证+学习，不是规则执行 |
| 团队无头衔之分 | 跨职能团队所有人平等 | BA/UX/Arch/FD/QA协作无层级，SM是 facilitator 不是 manager |

---

## 第三部分：三级把关机制（修订版 — 新增SM Agent）

### 3.1 修订后的三级把关

```
┌─────────────────────────────────────────────────────────────┐
│              三级总体把关机制（修订版 — 新增SM Agent）         │
└─────────────────────────────────────────────────────────────┘

  【项目级把关】— 做对的事（战略对齐）
  ┌─────────────────────────────────────────┐
  │ 把关人：PO Agent（产品线负责人层级）     │
  │ 职责：                                  │
  │   • 项目商业目标是否达成                 │
  │   • 产品路线图是否偏离                   │
  │   • 跨版本价值累积是否正向               │
  │   • 公司7要素整体影响是否可接受          │
  │ 把关节点：                              │
  │   • 项目立项时（脑暴strategic后）        │
  │   • 每版本/close时（商业价值验收）       │
  │   • 项目里程碑评审时                     │
  └─────────────────────────────────────────┘
                    │
                    ▼
  【版本级把关】— 把事做对（交付闭环）
  ┌─────────────────────────────────────────┐
  │ 把关人：PM Agent（版本守护人角色）       │
  │ 职责：                                  │
  │   • 版本范围是否完整交付（Backlog覆盖）  │
  │   • 版本质量是否达标（运行时验证+测试）  │
  │   • 版本一致性是否通过（三位一体交付物） │
  │   • 版本沉淀学习是否完成                 │
  │   • 所有Sprint汇总是否完成               │
  │ 把关节点：                              │
  │   • 版本规划确认时（Sprint拆解后）       │
  │   • 版本Final集成验证时                 │
  │   • /close时（版本闭环校验）            │
  │ 注：PM不再介入Sprint级日常把控           │
  └─────────────────────────────────────────┘
                    │
                    ▼
  【Sprint级把关】— 做对每个增量（敏捷交付）
  ┌─────────────────────────────────────────┐
  │ 把关人：SM Agent（敏捷教练，新增）       │
  │ 职责：                                  │
  │   • 把控BA/UX/FD/QA的交付符合敏捷条件   │
  │   • Sprint DoD是否全部满足              │
  │   • 增量是否可演示（AI Demo通过）       │
  │   • Sprint间依赖是否解锁                │
  │   • 运行时验证是否通过                  │
  │   • 移除Sprint进展中的障碍              │
  │   • 保障Scrum事件执行（计划/立会/评审/回顾）│
  │ 把关节点：                              │
  │   • Sprint启动会（计划会）              │
  │   • 每阶段Review时（AI每日立会替代）    │
  │   • Sprint评审会（Review）              │
  │   • Sprint回顾会（Retrospective）       │
  │   • 下一Sprint启动前置依赖校验时        │
  └─────────────────────────────────────────┘
```

### 3.2 SM Agent（敏捷教练）详细设计

#### 3.2.1 角色定义

```yaml
# sm-agent.md — 敏捷教练Agent（新增，第11个Agent）
agent:
  id: "sm-agent"
  name: "Scrum Master Agent"
  version: "1.0.0"
  role: "敏捷教练（Scrum Master）"
  
  definition: |
    你是敏捷教练（Scrum Master），是Sprint级的总体把关人。
    你的核心职责是把控BA/UX/FD/QA在本次Sprint的交付是否符合敏捷交付条件，
    保障Scrum事件按时执行，移除Sprint进展中的障碍。
    你不做需求分析、不做设计、不做开发、不做测试——你守护Sprint流程和团队。
  
  alignment_with_scrum:
    role: "敏捷教练（Scrum Master）"
    responsibilities:
      - "帮助团队理解Scrum理论和实践"
      - "保障Scrum事件按时完成（Sprint计划会/每日立会/Sprint评审会/Sprint回顾会）"
      - "帮助团队移除工作进展中的障碍"
      - "把控本次Sprint是否符合敏捷交付条件（DoD+增量可演示）"
  
  not_responsible_for:
    - "不做项目级战略决策（PO负责）"
    - "不做版本级范围管理（PM负责）"
    - "不做需求分析（BA负责）"
    - "不做设计（UX负责）"
    - "不做开发（FD负责）"
    - "不做测试（QA负责）"
```

#### 3.2.2 SM Agent核心职责（5项）

```yaml
sm_agent_responsibilities:
  
  sm1_sprint_guardian:          # Sprint守护人
    description: "把控本次Sprint的BA/UX/FD/QA交付是否符合敏捷交付条件"
    checks:
      - "Sprint DoD是否全部满足"
      - "增量是否可演示（AI Demo通过，截图+流程跑通+无P0问题）"
      - "运行时验证是否通过（build+test+dev启动+页面访问+菜单跳转+数据保存+后置条件+流程跑通）"
      - "Sprint间依赖是否解锁（非最后Sprint）"
      - "阶段Review是否全部通过"
  
  sm2_scrum_events:             # Scrum事件保障
    description: "保障4个Scrum事件按时执行"
    events:
      sprint_planning:
        name: "Sprint启动会（计划会）"
        timing: "Sprint第一天"
        participants: ["SM(主持)", "PO(讲解Backlog)", "BA/UX/FD/QA(认领拆解)"]
        output: "SPRINT-BACKLOG-{project}-v{version}-S{n}.yml"
      
      daily_standup:
        name: "AI每日立会"
        timing: "每阶段开始时自动生成"
        implementation: "SM每阶段自动生成进度报告（昨天做了什么/今天做什么/遇到什么障碍），无需人工每日站会"
        output: "Sprint进度报告（嵌入Journal）"
      
      sprint_review:
        name: "Sprint评审会"
        timing: "Sprint最后一天"
        participants: ["SM(主持)", "PO(商业价值审视)", "BA/UX/FD/QA(演示)"]
        output: "Sprint Review报告（含AI Demo截图+流程跑通证据+问题清单）"
      
      sprint_retrospective:
        name: "Sprint回顾会"
        timing: "Sprint评审会后"
        participants: ["SM(主持)", "BA/UX/FD/QA(回顾)"]
        output: "Sprint Retrospective报告（问题+改进+经验提炼）"
  
  sm3_impediment_removal:       # 障碍移除
    description: "识别并移除Sprint进展中的障碍"
    impediment_types:
      - "技术障碍：FD遇到无法解决的技术问题 → 升级到Arch"
      - "需求障碍：BA需求不明确 → 升级到PO确认"
      - "设计障碍：UX设计有分歧 → 升级到PM协调"
      - "依赖障碍：Sprint间依赖未就绪 → 升级到PM调整Sprint顺序"
      - "工具障碍：构建/测试环境问题 → SM直接处理"
    escalation_rule: "障碍超过1天未解决 → 升级到PM（版本守护人）"
  
  sm4_team_facilitation:        # 团队协作促进
    description: "促进BA/UX/FD/QA跨职能协作"
    facilitation:
      - "Sprint启动会引导团队认领和拆解任务"
      - "阶段交接时确保上游产物完整传递给下游"
      - "Review时协调各Agent站在专业角度审视"
      - "冲突时按 业务价值>技术可行性>实现成本 排序仲裁"
  
  sm5_sprint_learning:          # Sprint学习记录
    description: "记录Sprint经验，供版本沉淀和跨Sprint复用"
    outputs:
      - "Sprint Retrospective报告"
      - "经验提炼追加到lessons-learned"
      - "Sprint速度（Velocity）记录，用于下一版本规划"
```

#### 3.2.3 SM Agent把关门禁

| 门禁ID | 名称 | 检查内容 | 严重性 |
|--------|------|---------|--------|
| G-SM-01 | Sprint DoD满足 | DoD 6项全部true | block |
| G-SM-02 | 增量可演示 | AI Demo通过 + 无P0问题 | block |
| G-SM-03 | 下一Sprint依赖解锁 | 下一Sprint的所有dependencies已就绪 | block（非最后Sprint） |
| G-SM-04 | 运行时验证通过 | build+test+dev+页面+菜单+数据+后置条件+流程 全通过 | block |
| G-SM-05 | 阶段Review通过 | 本Sprint所有阶段Review通过 | block |
| G-SM-06 | Scrum事件完成 | 4个Scrum事件全部执行 | block |

#### 3.2.4 SM Agent产物体系

| 产物 | 说明 | 存储位置 |
|------|------|---------|
| Sprint Backlog | 本Sprint的待办项清单（从PO Backlog选取） | `docs/06-sprint/SPRINT-BACKLOG-{project}-v{version}-S{n}.yml` |
| Sprint进度报告 | AI每日立会替代（每阶段自动生成） | `Journal/sprint-progress/` |
| Sprint Review报告 | Sprint评审会产出（含AI Demo） | `docs/06-sprint/SPRINT-REVIEW-{project}-v{version}-S{n}.md` |
| Sprint Retrospective报告 | Sprint回顾会产出（问题+改进+经验） | `docs/06-sprint/SPRINT-RETRO-{project}-v{version}-S{n}.md` |
| Sprint把关报告 | Sprint级总体把关结论 | `docs/06-sprint-guard/SPRINT-GUARD-{project}-v{version}-S{n}.md` |

#### 3.2.5 SM Agent与其他Agent的协作边界

| 协作场景 | SM Agent | 对方Agent |
|---------|----------|-----------|
| Sprint启动会 | 主持，引导认领拆解 | PO讲解Backlog，BA/UX/FD/QA认领 |
| 阶段Review | 旁观+记录+障碍识别 | 各Agent站在专业角度审视 |
| 障碍升级 | 识别+升级到PM | PM（版本守护人）决定调整 |
| Sprint评审会 | 主持，组织演示 | PO商业价值审视，团队演示 |
| Sprint回顾会 | 主持，引导回顾 | 团队回顾+经验提炼 |
| /close时 | 不参与（Sprint已结束） | PM执行版本沉淀，PO商业价值验收 |

### 3.3 修订后的三级把关职责矩阵

| 把关维度 | 项目级（PO） | 版本级（PM） | Sprint级（SM） |
|---------|-------------|-------------|--------------|
| **战略对齐** | ✅ 主导 | 审视 | — |
| **商业价值** | ✅ 主导 | 审视 | — |
| **公司7要素整体影响** | ✅ 主导 | — | — |
| **版本范围完整性** | 审视 | ✅ 主导 | — |
| **版本质量达标** | — | ✅ 主导 | 审视 |
| **三位一体交付物一致性** | — | ✅ 主导 | 审视 |
| **版本沉淀学习** | 审视 | ✅ 主导 | — |
| **Sprint汇总** | — | ✅ 主导 | 提供Sprint报告 |
| **Sprint DoD满足** | — | — | ✅ 主导 |
| **增量可演示** | — | — | ✅ 主导 |
| **Sprint间依赖解锁** | — | 审视 | ✅ 主导 |
| **运行时验证通过** | — | 审视 | ✅ 主导 |
| **阶段Review通过** | — | — | ✅ 主导 |
| **Scrum事件执行** | — | — | ✅ 主导 |
| **障碍移除** | — | 升级接收 | ✅ 主导 |

### 3.4 把关升级机制

```yaml
escalation_rules:
  
  sprint_to_version:            # Sprint级问题升级到版本级
    trigger:
      - "Sprint DoD 3次未达标"
      - "运行时验证连续2次失败"
      - "Sprint间依赖阻塞超过2天"
      - "AI Demo报告含P0问题"
      - "障碍超过1天未解决（SM升级）"
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

### 3.5 三级把关报告体系

| 报告 | 产出方 | 频率 | 路径 |
|------|--------|------|------|
| Sprint把关报告 | SM Agent | 每Sprint结束 | `docs/06-sprint-guard/SPRINT-GUARD-{project}-v{version}-S{n}.md` |
| 版本把关报告 | PM Agent | 每版本/close前 | `docs/07-version-guard/VERSION-GUARD-{project}-v{version}.md` |
| 项目把关报告 | PO Agent | 每版本/close时 + 里程碑 | `docs/08-project-guard/PROJECT-GUARD-{project}.md`（累积更新） |

---

## 第四部分：七议题统一方案总览

### 4.1 七议题与Agent的关系

| 议题 | 内容 | 涉及Agent |
|------|------|-----------|
| 议题一 | AI人性化确认反馈机制（7种询问类型） | 全Agent |
| 议题二 | 脑暴→PO产品规划→需求探索全流程衔接 | BS/PO/BA |
| 议题三 | 四层价值+公司7要素规划原则 | PO |
| 议题四 | Sprint敏捷拆解机制 | PO/SM/BA/UX/FD/QA |
| 议题五 | 三位一体交付物体系（PRD+仿真原型+用例卡片） | BA/UX/FD |
| 议题六 | 三级把关机制（项目PO+版本PM+Sprint SM） | PO/PM/SM |
| 议题七 | 版本差异可视化（Git Tag+差异报告+版本切换器） | PM/FD |

### 4.2 SM Agent对议题四的影响

议题四（Sprint拆解）原设计由PM作为Sprint守护人，现修订为**SM Agent作为Sprint守护人**：

| 议题四内容 | 原设计（PM守护） | 修订后（SM守护） |
|-----------|----------------|-----------------|
| Sprint DoD校验 | PM执行 | SM执行 |
| 增量可演示验证 | PM执行 | SM执行 |
| Sprint间依赖管理 | PM执行 | SM执行 |
| 阶段Review协调 | PM执行 | SM执行 |
| Scrum事件执行 | 未定义 | SM保障（4事件） |
| 障碍移除 | 未定义 | SM负责 |
| Sprint学习记录 | PM版本沉淀的一部分 | SM独立产出Retrospective |

### 4.3 SM Agent对project-lifecycle.yml的影响

```yaml
# project-lifecycle.yml 修订 — 新增SM Agent参与Sprint循环
stage-1_to_N:                    # Sprint循环
  name: "Sprint 1-N 增量交付"
  loop: true
  loop_count: "from SPRINT-PLAN.total_sprints"
  
  sprint_guardian: "sm-agent"    # 修订：Sprint守护人从pm-agent改为sm-agent
  
  each_sprint:
    scrum_events:                # 新增：SM保障的4个Scrum事件
      - "Sprint启动会（计划会）— SM主持，PO讲解，团队认领"
      - "AI每日立会 — SM每阶段自动生成进度报告"
      - "Sprint评审会 — SM主持，AI Demo + PO审视"
      - "Sprint回顾会 — SM主持，经验提炼"
    
    sub_stages:
      - "BA需求分析（仅本Sprint范围）— SM旁观+障碍识别"
      - "UX设计（仅本Sprint页面）— SM旁观+障碍识别"
      - "Arch架构（仅本Sprint契约/适配器）— SM旁观+障碍识别"
      - "FD开发（仅本Sprint页面+后置条件）— SM旁观+障碍识别"
      - "QA测试（仅本Sprint页面+运行时验证）— SM旁观+障碍识别"
      - "人确认（按议题一机制）"
      - "Sprint Review（SM主持，AI Demo + PO商业价值审视）"
      - "Sprint Retrospective（SM主持，AI学习记录）"
    
    sprint_gate:                 # 修订：门禁从G-SPRINT改为G-SM
      - id: "G-SM-01"
        check: "DoD全部满足"
        by: "sm-agent"
      - id: "G-SM-02"
        check: "运行时验证通过"
        by: "sm-agent"
      - id: "G-SM-03"
        check: "AI Demo报告生成且含截图"
        by: "sm-agent"
      - id: "G-SM-04"
        check: "Scrum事件4个全部执行"
        by: "sm-agent"
      - id: "G-SM-05"
        check: "下一Sprint前置依赖校验通过（非最后Sprint）"
        by: "sm-agent"
```

### 4.4 Agent体系更新（10个→11个）

| Agent | 角色定位 | 把关层级 | V5.0变化 |
|-------|---------|---------|---------|
| BS Agent | 脑暴主持人 | — | 议题二：增强交接 |
| PO Agent | 产品负责人 | **项目级** | 议题二/三/六：项目把关人+四层价值+7要素 |
| BA Agent | 业务分析师 | — | 议题五：三位一体PRD |
| PM Agent | 项目管理专家 | **版本级** | 议题六：专注版本守护，Sprint级交给SM |
| **SM Agent（新增）** | **敏捷教练** | **Sprint级** | **议题六：新增第11个Agent** |
| UX Agent | 设计师 | — | 议题五：三位一体仿真原型+用例卡片 |
| Arch Agent | 架构师 | — | — |
| FD Agent | 前端开发 | — | 议题五/七：用例卡片嵌入+版本切换器 |
| QA Agent | 质量保障 | — | — |
| AC Agent | 验收交付 | — | — |
| Doc Agent | 文档管理 | — | 议题七：差异报告 |

---

## 第五部分：版本差异可视化（修订版）

### 5.1 修订内容（基于用户反馈）

| 原设计 | 修订后 |
|--------|--------|
| 版本切换器4模式（single/diff_highlight/side_by_side/timeline） | **3模式**（single/diff_highlight/side_by_side），删除timeline |
| Sprint级差异显示 | **删除**，只保留版本级差异 |
| 差异报告AI全自动 | AI自动生成 + **PO/PM人工补充** |

### 5.2 修订后的版本差异三层架构

```
┌─────────────────────────────────────────────────────────────┐
│              版本差异显示三层架构（修订版）                    │
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
  │ AI自动生成版本间差异 + 人工补充           │
  │ 方式：AI对比v{n}和v{n-1}的SNAPSHOT →     │
  │       PO/PM人工补充商业价值/风险变更      │
  │ 路径：docs/09-versions/v{version}/DIFF.md│
  │ 内容：                                   │
  │   AI部分：页面增删改+用例增删改+数据变更  │
  │   人工部分：商业价值变更+风险变更+决策记录│
  └─────────────────────────────────────────┘
  
  【第三层：在线版本切换器（Version Switcher）】
  ┌─────────────────────────────────────────┐
  │ 仿真原型内置版本切换器UI（3模式）         │
  │ 模式：                                   │
  │   • single：单版本查看                    │
  │   • diff_highlight：差异高亮              │
  │   • side_by_side：并排对比               │
  │ （删除timeline模式）                      │
  └─────────────────────────────────────────┘
```

### 5.3 差异报告的人工补充机制

```yaml
# DIFF.md 结构 — AI自动 + 人工补充
diff_report:
  
  ai_generated:                  # AI自动生成部分
    - section: "一、变更摘要"
      auto: true
    - section: "二、页面变更（新增/修改/删除）"
      auto: true
    - section: "三、用例变更（新增/修改/删除）"
      auto: true
    - section: "四、数据变更（契约/适配器）"
      auto: true
    - section: "五、差异可视化（Mermaid图）"
      auto: true
  
  human_supplemented:            # 人工补充部分
    - section: "六、商业价值变更（PO补充）"
      auto: false
      by: "po-agent"
      content: |
        PO从商业价值角度补充：
        - v1.1.0相比v1.0.0新增的商业价值（对照BO/BG）
        - 价值达成度的变化
        - 路线图偏离的商业影响
      trigger: "/close时PO执行商业价值验收后补充"
    
    - section: "七、风险变更（PM补充）"
      auto: false
      by: "pm-agent"
      content: |
        PM从项目管理角度补充：
        - v1.1.0新增的风险
        - 已关闭的风险
        - 风险等级变化
      trigger: "/close时PM执行版本把关后补充"
    
    - section: "八、关键决策记录（PO/PM补充）"
      auto: false
      by: "po-agent + pm-agent"
      content: |
        本版本过程中的关键决策记录：
        - 范围调整决策（为什么加/减了某些Backlog项）
        - 技术选型决策（为什么选了方案A不选B）
        - 风险接受决策（为什么接受了某个风险）
      trigger: "/close时PO+PM联合补充"
```

### 5.4 版本切换器3模式

```yaml
version_switcher:
  modes:
    
    - mode: "single"             # 单版本查看
      description: "切换到选中版本的原型"
      implementation: "dev server根据?version=参数加载对应build产物"
      use_case: "研发团队首次理解某版本时"
    
    - mode: "diff_highlight"     # 差异高亮
      description: "在当前版本上高亮显示与上一版本的差异"
      implementation: "读取DIFF.md，新增页面绿色边框/修改页面黄色边框"
      use_case: "研发团队快速理解版本间差异时"
    
    - mode: "side_by_side"       # 并排对比
      description: "左右两版本并排显示"
      implementation: "iframe左=v{version-1}，iframe右=v{version}，同步路由"
      use_case: "深度对比两版本差异时"
    
    # 删除 mode: "timeline"
```

---

## 第六部分：完整落地改造清单

### 6.1 新建文件清单（15个）

| 序号 | 文件路径 | 类型 | 说明 |
|------|---------|------|------|
| 1 | `common/human-confirm-protocol.yml` | 知识库规范 | 议题一：AI人性化确认机制（7种询问类型） |
| 2 | `common/value-assessment-standards.yml` | 知识库规范 | 议题三：四层价值+7要素评估框架 |
| 3 | `common/sprint-planning-standards.yml` | 知识库规范 | 议题四：Sprint拆解规则+DoD+依赖管理 |
| 4 | `common/sim-prototype-standards.yml` | 知识库规范 | 议题五：高保真仿真原型规范 |
| 5 | `common/use-case-card-standards.yml` | 知识库规范 | 议题五：可交互用例卡片规范 |
| 6 | `common/guard-report-templates.yml` | 知识库规范 | 议题六：三级把关报告模板 |
| 7 | `common/version-timeline-standards.yml` | 知识库规范 | 议题七：版本时间线规范 |
| 8 | `configs/workflows/po-planning-flow.yml` | 流程配置 | 议题二：PO产品规划workflow（8阶段） |
| 9 | `agents/sm-agent.md` | Agent规范 | 议题六：敏捷教练Agent（新增第11个） |
| 10 | `configs/agents/sm-agent.yml` | Agent配置 | 议题六：SM Agent配置 |
| 11 | `configs/skills/human-confirm-handler.yml` | Skill | 议题一：AI确认询问处理技能 |
| 12 | `configs/skills/value-assessor.yml` | Skill | 议题三：四层价值评估技能 |
| 13 | `configs/skills/sprint-planner.yml` | Skill | 议题四：Sprint拆解技能 |
| 14 | `configs/skills/version-snapshotter.yml` | Skill | 议题七：版本快照技能 |
| 15 | `configs/skills/version-diff-reporter.yml` | Skill | 议题七：差异报告生成技能 |

### 6.2 修改文件清单（18个）

| 序号 | 文件路径 | 修改内容 |
|------|---------|---------|
| 1 | `agents/pm-agent.md` | 专注版本守护人角色，Sprint级交给SM；引用human-confirm-protocol |
| 2 | `agents/po-agent.md` | 新增项目级把关人角色（g1~g5）+ 四层价值+7要素 + 引用po-planning-flow |
| 3 | `agents/bs-agent.md` | 增强脑暴→PO显式交接清单 |
| 4 | `agents/ba-agent.md` | 三位一体PRD强化（泳道图+信息流独立） |
| 5 | `agents/ux-agent.md` | 三位一体仿真原型+用例卡片 |
| 6 | `agents/fd-agent.md` | 用例卡片嵌入仿真原型 + 版本切换器组件实现 |
| 7 | `configs/workflows/project-lifecycle.yml` | 新增stage-1_to_N Sprint循环（SM守护）+ stage-8快照+差异报告 + 三级把关 |
| 8 | `configs/workflows/brainstorm.yml` | stage-7增加显式交接清单+门禁 |
| 9 | `configs/workflows/handoff.yml` | 新增三位一体交付物门禁G-HO-DELIVERY-01~05 |
| 10 | `configs/workflows/knowledge-sedimentation.yml` | 增强Sprint级学习记录（SM产出Retrospective） |
| 11 | `configs/skills/instruction-card-generator.yml` | V1→V2，从静态卡→可交互HTML卡片 |
| 12 | `configs/agents/pm-agent.yml` | 新增版本守护相关配置 |
| 13 | `configs/agents/po-agent.yml` | 新增项目把关+四层价值相关配置 |
| 14 | `knowledge/common/gates-registry.yml` | 新增全部新门禁 |
| 15 | `knowledge/common/iron-rules-registry.yml` | 新增SM Agent铁律SM-01~05 + 全Agent确认机制铁律 |
| 16 | `knowledge/common/redlines.yml` | 新增RL-SUP-03 |
| 17 | `config.yml` | 注册sm-agent + po_planning_flow + 全部新引用 + 4个新目录 |
| 18 | `scripts/ensure-project.sh` | 新增4个guard目录 + 09-versions目录创建 |

### 6.3 新增门禁清单（25条）

| 门禁ID | 名称 | 所属议题 |
|--------|------|---------|
| G-BS-HO-01~03 | 脑暴→PO交接门禁 | 议题二 |
| G-PO-01~04 | PO规划门禁 | 议题二/三 |
| G-SM-01~06 | Sprint守护门禁 | 议题四/六 |
| G-VER-GUARD-01~04 | 版本守护门禁 | 议题六 |
| G-PROJ-GUARD-01~03 | 项目守护门禁 | 议题六 |
| G-HO-DELIVERY-01~05 | 三位一体交付门禁 | 议题五 |
| G-SNAPSHOT-01 | 版本快照完整性 | 议题七 |
| G-DIFF-01 | 差异报告生成 | 议题七 |

### 6.4 新增铁律清单（6条）

| 铁律ID | 名称 | 所属Agent |
|--------|------|----------|
| SM-01 | Sprint DoD不可降级 | SM Agent |
| SM-02 | Scrum事件不可跳过 | SM Agent |
| SM-03 | 障碍1天未解必须升级 | SM Agent |
| SM-04 | 增量必须可演示 | SM Agent |
| SM-05 | Sprint学习必须记录 | SM Agent |
| 全局 | 凡需人确认必须按human-confirm-protocol构造询问 | 全Agent |

---

## 第七部分：实施路线图

### 7.1 实施顺序（4 Phase）

```
Phase 1（基础层 — 无依赖，可并行）：
  ├─ 议题一：human-confirm-protocol.yml + human-confirm-handler.yml
  ├─ 议题三：value-assessment-standards.yml + value-assessor.yml
  ├─ 议题五：sim-prototype-standards.yml + use-case-card-standards.yml
  └─ 议题六：sm-agent.md + sm-agent.yml（新增SM Agent基础定义）

Phase 2（流程层 — 依赖Phase 1）：
  ├─ 议题二：po-planning-flow.yml（引用议题三价值评估+议题一确认机制）
  ├─ 议题四：sprint-planning-standards.yml + sprint-planner.yml（依赖议题二+SM Agent）
  └─ 议题七：version-timeline-standards.yml + version-snapshotter.yml + version-diff-reporter.yml

Phase 3（集成层 — 依赖Phase 2）：
  ├─ project-lifecycle.yml（集成po-planning-flow + Sprint循环[SM守护] + 快照+差异 + 三级把关）
  ├─ brainstorm.yml（增强交接清单）
  ├─ handoff.yml（三位一体门禁）
  └─ 各Agent.md（po/bs/pm/ba/ux/fd增强 + sm完整定义）

Phase 4（注册层）：
  ├─ gates-registry.yml（新增25条门禁）
  ├─ iron-rules-registry.yml（新增6条铁律）
  ├─ redlines.yml（新增RL-SUP-03）
  ├─ config.yml（注册sm-agent + po_planning_flow + 全部新引用 + 4个新目录）
  ├─ ensure-project.sh（新增4个guard目录 + 09-versions目录）
  └─ 流程版本变更总账.md（记录本次变更）
```

### 7.2 改造规模汇总

| 维度 | 数量 |
|------|------|
| 新建文件 | 15个 |
| 修改文件 | 18个 |
| 新增Agent | 1个（SM Agent） |
| 新增Skill | 5个 |
| 新增门禁 | 25条 |
| 新增铁律 | 6条 |
| 新增红线 | 1条 |

---

## 第八部分：待用户最终审阅

本统一方案已融合：
- ✅ V5.0主方案（知识库重构+流程重构+AI边界+AI能力+AI学习）
- ✅ 五议题补充方案（AI确认/脑暴PO衔接/四层价值7要素/Sprint拆解/三位一体交付）
- ✅ 两议题补充方案（三级把关/版本差异）
- ✅ 用户6项确认反馈
- ✅ 敏捷实践Scrum 334框架经验

**请用户审阅以下关键设计决策是否正确理解：**

| 序号 | 关键设计决策 | 确认点 |
|------|-------------|--------|
| 1 | 新增SM Agent（敏捷教练）作为第11个Agent，专职Sprint级把关 | SM定位为Scrum Master，不做需求/设计/开发/测试，只守护Sprint流程+移除障碍+保障Scrum事件 |
| 2 | PM Agent从Sprint级抽身，专注版本级把关 | PM不再介入Sprint日常把控，Sprint级全部交给SM |
| 3 | PO Agent作为项目级把关人 | PO除了已有的商业价值验收，新增项目级5维把关（g1~g5） |
| 4 | 版本切换器3模式（single/diff_highlight/side_by_side） | 删除timeline模式 |
| 5 | 只做版本级差异，不做Sprint级差异 | 删除Sprint级差异显示 |
| 6 | 差异报告AI自动生成+PO/PM人工补充 | AI生成技术差异（页面/用例/数据），PO/PM补充商业价值/风险/决策 |
| 7 | SM Agent的5项核心职责 | Sprint守护+Scrum事件保障+障碍移除+团队协作促进+Sprint学习记录 |
| 8 | Scrum 334框架对齐 | 3角色（PO/SM/团队）+3工件（产品Backlog/Sprint Backlog/增量）+4事件（计划会/立会/评审会/回顾会） |
| 9 | 实施顺序4 Phase | 基础层→流程层→集成层→注册层 |
| 10 | 确认后进入实施 | 按Phase 1-4顺序执行 |

**待用户审阅确认后，进入实施阶段。**

---

**文档结束**
