# POM 治理规范 → 可执行系统 映射索引

> **定位**：方法论宪章（POM V4.0.0）与可执行治理引擎（project-lifecycle.yml v4.1.0）之间的**双向索引桥梁**。
> **原则**：单一事实源——project-lifecycle.yml 是唯一权威，本文档是只读索引，不重复定义。
> **更新规则**：修改 project-lifecycle.yml 时同步更新本文档；反之，本文档标记的「技术债务」被修复后，必须同步更新此处状态。
> **V4.1.0同步**：技术债务已从4项减至2项（RL-11/12已通过Review机制清偿）；阶段编号对齐stage-0~9

---

## 一、阶段映射（V4.1.0 新增 PO Agent + 分层流程）

| POM 阶段 | 现有实现 | 吸收方式 | 状态 |
|:--|:--|:--|:--:|
| **阶段1 头脑风暴** | `stage-0 brainstorm` + `bs-agent` + `brainstorm.yml` v3.3.0 | YML驱动+BS Agent执行，四步法+分层类型(strategic/planning/regular)+领域知识加载+条件输出战略商业 | ✅ 完全覆盖 |
| **阶段1.5 产品架构与规划** | `stage-0.5 product` + `po-agent`（V4.1.0新增） | PO Agent三层能力金字塔分层激活：战略级→战略+商业+架构+路线图+Backlog；规划级→架构+路线图+Backlog | ✅ V4.1.0新增 |
| **阶段2 需求规划** | `stage-2 requirement` + `ba-agent` + `requirement-flow.yml` | BA Agent 按 requirement-flow.yml 执行：五流五图 + 15章 PRD 结构 + 编号体系 + **基于PO Backlog优先级(V4.1.0)** | ✅ 完全覆盖 |
| **阶段3 交互设计** | `stage-3 design` + `ux-agent` + `design-flow.yml` | UX Agent 按 design-flow.yml 执行：交互原则 + 设计系统 + 页面交互说明卡 | ✅ 完全覆盖 |
| **阶段4 原型开发** | `stage-5 dev` + `fd-agent` + `dev-flow.yml` | FD Agent 按 dev-flow.yml + 11条编码铁律执行 | ✅ 完全覆盖 |
| **阶段5 综合测试** | `stage-6 test` + `qa-agent` + `test-flow.yml` | QA Agent 五层测试（unit/browser/whitebox/visual/contract）| ✅ 完全覆盖 |
| **阶段7 产品优化** | 回流闭环（`feedback_routing_table`） | 测试/验收问题 → PM 路由 BA（需求分析）重评，生成 type=修复 重走闭环 | ✅ 通过回流机制覆盖 |
| **阶段8 原型完善** | 回流闭环 + `dev-flow`（修复子流） | 缺陷修复 → 重走 dev→test→accept 闭环 | ✅ 通过回流机制覆盖 |
| **阶段9 验收审核** | `stage-7 accept` + `ac-agent` + `acceptance-flow.yml` v2.1.0 | AC Agent 四人模拟验收（新用户/VIP/管理员/**PO Agent**），需求覆盖率检查 | ✅ 完全覆盖 |
| **交付标注** | `stage-9 handoff` + `handoff.yml` | UX Agent + FD Agent 联合执行页面级+按钮级交互用例标注 | ✅ 完全覆盖 |
| **敏捷递归** | `/close后PM询问PO`（V4.1.0新增） | 版本沉淀→PM询问PO下一版本→PO产出Backlog→/init v2→递归 | ✅ V4.1.0新增 |

---

## 二、POM 红线退役清单

> 以下 POM 13 条红线中，已有 11 条被 `project-lifecycle.yml` 各阶段 `pm_redlines` 完整吸收。以下仅记录**退役项**——即 POM 仍有但实际已被更高层级机制取代的红线。

| POM 红线 | 退役原因 | 替代机制 |
|:--|:--|:--|
| **RL-01** POM 四件套任一缺失 | POM 四件套（JS 文件：helpDetail/helpData/helpArch/helpMetrics）已被 Zod+IndexedDB+仿真仓库 架构替代 | `dev-flow.yml` 11条编码铁律 + `compliance-checker` |
| **RL-02** 五图缺一（PRD 14章） | 已在 `requirement-flow.yml` 强制要求，且 `pm_redlines` 阶段检查 | `stage-2 pm_redlines` |
| **RL-03** 原型变更未同步用例 | 用例同步机制已内建在 `dev-flow` 合规检查 + `compliance-checker` 中 | `stage-5 pm_redlines` C-F4（不偏离上游） |
| **RL-04** 指标未在 helpMetrics 登记 | 指标登记已迁移至 `doc-standards.yml`，不再依赖单一 JS 文件 | 文档标准化规范 |
| **RL-05** 测试报告未含三方一致性矩阵 | 测试报告结构已由 `test-flow.yml` 强约束 | `stage-6 completion_criteria` |
| **RL-06** P0 缺陷未闭环 | 已内建在 `/close` 流程：`problem_ledger` 全闭环校验 | `stage-8 actions` |
| **RL-07** 交付物版本非最新 | `state.json` 版本链 + `stream.version` 强约束 | `stage-8 actions`（冻结版本） |
| **RL-08** 验收阶段 FN 主流程阻断 | 对应验收部 RL-01，已被 `stage-7` 覆盖 | `stage-7 completion_criteria` |
| **RL-09** 无版本记录表的需求文档 | `doc-standards.yml` 已强制全部交付物版本记录 | 文档标准化规范 |
| **RL-10** 无头脑风暴会议记录的 PRD | `stage-0` 输出路径已约束，`stage-2` 复用脑暴 confirmed/ 作为输入 | `stage-0 → stage-2` 输入链 |

---

## 三、技术债务（V4.0.0已大幅清偿）

> V4.0.0 通过8阶段专家Review机制已覆盖 RL-11/12。剩余2项为低优先级。

| POM 概念 | 当前状态 | 影响 | 优先级 | 建议实现方式 |
|:--|:--|:--|:--:|:--|
| ~~**RL-11** 关键数据字段跨页面一致性~~ | ~~无显式自动检查~~ | ~~中~~ | ~~P1~~ | **V4.0.0已清偿：通过REV-FD-08/09+REV-AC-10/11覆盖** |
| ~~**RL-12** 状态流转与 PRD 状态机不一致~~ | ~~无显式自动检查~~ | ~~中~~ | ~~P1~~ | **V4.0.0已清偿：通过REV-FD-08/09+REV-AC-10/11覆盖** |
| **6维测试权重** | `test-flow.yml` 未按 POM 六维度权重分配用例 | 低 | **P3** | 在 `test-flow.yml` 补充维度权重配置 |
| **部门角色矩阵（10部门）** | 现有 Agent 体系使用 Skill Agent 分工，非部门制 | 低 | **P3** | PM Agent 已通过 workflow owner 实现等效分工，暂不需要部门制映射 |

---

## 四、结构化差异说明

| POM 概念 | 现有体系对应 | 差异说明 |
|:--|:--|:--|
| **POM 四件套（JS 文件）** | Zod Schema + IndexedDB Repository + 仿真仓库 | 从文件级治理升级为**数据模型级治理**，POM 的 `helpDetail.js` 等 JS 文件已被更精确的 Zod 校验器 + 仿真数据仓库替代 |
| **POM 8 个 Skill** | 50+ 现有 Skill（按领域拆分） | 现有 Skill 粒度过细是优势（单一职责），POM 的 8 个粗粒度 Skill 概念已被拆分为更专业的子 Skill |
| **POM 编号体系（FN/UC/BR/ENT）** | 现有 PRD 编号体系（SC/MD/PG/FN/UC） | 编号层级不同但不冲突：现有体系继承自 `doc-standards.yml`，POM 编号在它设计的上下文内有效，但不应作为全局编号强制 |
| **POM 13 条红线** | `pm_redlines`（按阶段分散管理） | POM 集中管理 → 现有按阶段管理。按阶段管理的优势是上下文相关、精准触发，不构成缺陷 |
| **POM .pom/config.yaml** | `.codebuddy/config.yml` + 各 workflow YML | POM 的通用化配置思路已被吸收，配置文件位置不同但功能等效 |

---

## 五、维护契约

1. **本文档是只读索引**，不定义新的治理规则
2. **修改 project-lifecycle.yml 的红线/阶段/流程时**，必须同步更新本文档的映射表和退役清单
3. **技术债务被修复后**，必须从 §三 移除并归档到变更日志
4. **POM 原文新增内容**，先审查是否已被现有系统覆盖，再决定是加入退役清单还是技术债务
5. **冲突裁决**：project-lifecycle.yml 优先级高于 POM 原文，高于本文档

---

> **最后更新**：2026-07-17 | **关联文件**：`project-lifecycle.yml v4.1.0`（位于 `../../configs/workflows/`）、`POM方法论与宪章-V4.0.0.md`（位于本目录）、`redlines.yml`（位于 `../`）
