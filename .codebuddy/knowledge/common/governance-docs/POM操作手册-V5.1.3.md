# POM 操作手册 V5.1.3

> **版本**：V5.1.3 | **更新日期**：2026-07-21
> **适用范围**：AI-SCRM 项目全流程
> **定位**：指令 + 工作流 + Agent + 门禁铁律的完整操作参考

---

## 目录

1. [系统概览](#1-系统概览)
2. [指令速查表](#2-指令速查表)
3. [指令详细说明](#3-指令详细说明)
4. [工作流详解](#4-工作流详解)
5. [Agent 角色清单](#5-agent-角色清单)
6. [8 阶段生命周期](#6-8-阶段生命周期)
7. [流程级别（lite/standard/full）](#7-流程级别)
8. [门禁与铁律体系](#8-门禁与铁律体系)
9. [V5.1.3 新特性](#9-v513-新特性)
10. [典型操作场景](#10-典型操作场景)

---

## 1. 系统概览

POM（Product Operations Methodology）是一套 AI 辅助的产品研发全流程方法论，核心特征：

- **11 个 Agent** 协同（PM/BA/UX/Arch/FD/QA/AC/PO/SM/BS/DOC）
- **16 条指令** 驱动（用户指令 + PM 自动调度指令）
- **16 个工作流** 编排（覆盖脑暴→需求→设计→架构→开发→测试→验收→关闭全链路）
- **8 阶段生命周期**（project-lifecycle 总控）
- **3 级流程** 按项目规模分层（lite 3 步 / standard 5 步 / full 7 步）
- **90 条铁律** + **多阶段门禁** 约束产物质量
- **AI 大脑** 辅助每个 Agent 推理决策（V5.1.0+）

### 核心原则

1. **AI 思考 + 验证 + 学习**：不是硬编码规则执行器，而是理解意图 + 分析 + 验证 + 产出 + 学习
2. **一行运行时验证 > 一百条纸面规则**
3. **配置优先于开发**：可通过后台配置实现的功能不作为代码开发项
4. **目标导向迭代**：每个小版本只需围绕 1-2 个需求目标完成即可

---

## 2. 指令速查表

### 2.1 核心生命周期指令

| 指令 | 用途 | 必填参数 | 触发工作流 |
|------|------|---------|-----------|
| `/brainstorm` | 启动脑暴会议 | `--industry` `--brainstorm-type` `--topic` | brainstorm.yml |
| `/init` | 开启需求流 | `--project` `--type` `--desc` | project-lifecycle.yml |
| `/feedback` | 反馈回流 | `--project` | project-lifecycle.yml |
| `/handoff` | 交付标注回传 | `--project` | handoff.yml |
| `/close` | 结束需求流 | `--project` | knowledge-sedimentation.yml |
| `/change` | 需求变更 | `--project` `--desc` | change-request.yml |
| `/fix` | Bug 修复 | `--project` `--desc` | change-request.yml |

### 2.2 PM 自动调度指令

| 指令 | 用途 | 触发时机 | 触发工作流 |
|------|------|---------|-----------|
| `/plan` | 生成研发排期 | 需求流前置 PM 自动调用 | project-lifecycle.yml |
| `/test` | 执行五层测试 | 开发完成后 PM 自动调度 | test-flow.yml |
| `/accept` | 四人模拟验收 | 测试通过后 PM 自动调度 | acceptance-flow.yml |
| `/report` | 生成报告 | 按需 | — |

### 2.3 特殊入口指令

| 指令 | 用途 | 必填参数 |
|------|------|---------|
| `/learn-project` | 项目学习（产出 PRD） | `--project` `--source` |
| `/learn-domain` | 领域知识学习 | `--source` |
| `/learn-domain-check` | 领域知识巡检 | — |
| `/rebuild` | 重新脑暴已学项目 | `--project` |
| `/migrate` | 迁移知识库 | `--from` `--project` |

### 2.4 全局参数规范

- **命名格式**：统一 `--key=value`（等号赋值），禁止位置参数
- **source 参数格式**：`scheme:value`，支持 10 种 scheme：
  `local-dir` / `file` / `http-url` / `website` / `video` / `audio` / `image` / `api-endpoint` / `paste` / `https`
- **版本号**：永不出现在用户指令中，系统按同 type 上次 close 版本自动 +1
- **需求流单位**：project × type × version

### 2.5 参数冲突检测

1. `/brainstorm` 不能使用 `--type`（已废弃，改用 `--brainstorm-type`）
2. `/report` 不能使用 `--type`（已废弃，改用 `--report-type`）
3. `/init --type=修复` 不能同时指定 `--file`
4. `/learn-domain --incremental` 须与 `--domain` 同时使用
5. `/close` 和 `/handoff` 不能同时执行（handoff 须在 close 之前）

---

## 3. 指令详细说明

### 3.1 `/brainstorm` — 脑暴会议

**用途**：启动结构化脑暴，产出脑暴文档（三流草图 + BO/BG 映射 + 领域知识清单）

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--industry` | 是 | string | 行业（如：电商/SaaS/直播） |
| `--brainstorm-type` | 是 | enum | `strategic`(战略型) / `planning`(规划型) / `regular`(常规型) |
| `--topic` | 是 | string | 议题名（同一项目同一议题允许多次脑暴） |
| `--project` | 否 | string | 项目名（多项目模式必填） |
| `--source` | 否 | multi | 参考资料（10 种 scheme） |
| `--stakeholders` | 否 | string | 利益相关者 |

**分层类型**：

| 类型 | 激活 Agent | 产出 | 适用场景 |
|------|-----------|------|---------|
| strategic | BS + PO(三层) | 脑暴文档 + 战略分析 + 商业分析 | 新项目/重大方向转型 |
| planning | BS + PO(二层) | 脑暴文档 + 产品架构 + 路线图 | 新模块/大版本迭代 |
| regular | BS | 脑暴文档 | 中版本迭代 |

**产出路径**：`projects/{project}/docs/00-brainstorm/{topic}/confirmed/BR-脑暴文档-确认稿.md`

**示例**：
```
/brainstorm --industry=直播SaaS --brainstorm-type=strategic --topic=AI内容审核 --project=SAAS
```

---

### 3.2 `/init` — 开启需求流

**用途**：PM 接管，开启一条需求流，进入需求分析阶段

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--project` | 是 | string | 项目名 |
| `--type` | 是 | enum | `新增` / `迭代` / `变更` / `修复` |
| `--desc` | 是 | string | 需求描述 |
| `--brainstorm-topic` | 否 | string | 关联脑暴议题名（加载脑暴产物作为 BA 背景） |
| `--file` | 否 | string | 参考文件路径（修复类型不可用） |
| `--api` | 否 | string | 外部 API 文档 URL |
| `--source` | 否 | multi | 参考资料（10 种 scheme） |
| `--priority` | 否 | enum | P0/P1/P2/P3 |

**自动行为**：
- 自动检测项目性质（单项目/多项目）
- 自动组装参数路由包传递 BA（含 9 项上下文 + 路由指令 + 版本链）
- 自动加载上一版本沉淀 + 经验库
- 骨架完整性 6 项校验（state.json/pom/project.json/package.json/journal/docs/src）

**示例**：
```
/init --project=SAAS --type=迭代 --desc="Sprint 3：录播擦音管理+违规统计看板+15项Gap修复" --brainstorm-topic=AI内容审核
```

---

### 3.3 `/feedback` — 反馈回流

**用途**：在需求流 close 之前，将测试/验收反馈或用户补充内容路由回需求分析阶段

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--project` | 是 | string | 项目名 |
| `--type` | 否 | enum | 自动绑定当前未 close 流 |
| `--msg` | 否 | string | 反馈内容（省略则交互式输入） |

**反馈规则**（V4.0.0）：
- 反馈在 Review 后进行（不可跳过 Review）
- 反馈按阶段节点依次上传至需求分析（不跳跃）
- 跨版本反馈传递（未闭环反馈自动传递到下一版本 `/init`）

---

### 3.4 `/handoff` — 交付标注与回传闭环

**用途**：AC 通过后 close 之前执行，校验对应性 → 用户编辑交互卡 → 回传 BA 增量重跑

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--project` | 是 | string | 项目名 |
| `--type` | 否 | enum | 自动选当前需求流 |
| `--module` | 否 | string | 指定模块 |

**三步流程**：
1. 校验对应性（PRD 的 FN/UC ↔ 仿真原型页面/操作 ↔ 用例卡片 steps）
2. 编辑交互卡（4 级标注粒度：page/button/metric/field）
3. 回传 BA（编辑后回传 PRD 的 handoff 回传区，BA 增量重跑需求分析）

**循环校验**：直到无变更才可 close

---

### 3.5 `/close` — 结束需求流

**用途**：PM 收尾单条需求流，冻结该流版本

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--project` | 是 | string | 项目名 |
| `--type` | 否 | enum | 自动选当前进行中流 |

**close 前置校验（门禁）**：
1. PBL 全闭环（G-CLOSE-01）
2. 8 阶段 Review 报告全产出（G-CLOSE-02）
3. 追溯链通过（G-CLOSE-03）
4. 版本沉淀完成（G-CLOSE-04）
5. 大脑进化完成（G-CLOSE-05）
6. HTML 需求文档完整性（G-CLOSE-06：含五图 + NFR + 截图 + 状态矩阵）

**close 后自动执行**：
- 版本沉淀学习（8 步→3 步精简）
- 大脑进化（prediction vs actual 对比 + 权重调整）
- PM 询问 PO 下一版本规划（敏捷递归闭环）

---

### 3.6 `/change` — 需求变更

**用途**：需求变更请求，文档先行更新（需求→设计→测试用例→代码）

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--project` | 是 | string | 项目名 |
| `--desc` | 是 | string | 变更描述 |
| `--priority` | 否 | enum | P0~P3，默认 P1 |

**流程**：影响分析先行 → 文档更新 → 代码调整 → 回归验证

---

### 3.7 `/fix` — Bug 修复

**用途**：Bug 修复请求，Bug 分析 → 修复实施 → 回归验证 → 验收关闭

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--project` | 是 | string | 项目名 |
| `--desc` | 是 | string | Bug 描述 |
| `--priority` | 否 | enum | P0~P3，默认 P0 |

---

### 3.8 `/learn-project` — 项目学习

**用途**：从 10 种来源深度抓取项目资料，AI 自动识别业务系统与终端，产出 PRD

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--project` | 是 | string | 项目名 |
| `--source` | 是 | multi | 来源（10 种 scheme，可多值） |
| `--module` | 否 | string | 增量学习指定模块 |
| `--cookie` | 否 | string | 需登录网站的 Cookie |
| `--auth` | 否 | string | 认证信息 |
| `--transcript` | 否 | string | 视频字幕文件 |

**10 种来源**：`local-dir` / `file` / `http-url` / `website` / `video` / `audio` / `image` / `api-endpoint` / `paste` / `https`

**学习策略**：未指定 `--module` = 全量学习（覆盖旧 PRD）；指定 `--module` = 增量学习（追加章节）

---

### 3.9 `/learn-domain` — 领域知识学习

**用途**：场景驱动学习法（SDL），从来源学习领域知识，产出结构化 .yml 供 BA 参考

**参数**：

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--source` | 是 | multi | 来源（10 种 scheme） |
| `--domain` | 否 | string | 领域名 |
| `--category` | 否 | enum | 15 大分类 + thirdparty |
| `--focus` | 否 | string | 聚焦主题 |
| `--deep-params` | 否 | flag | 强制深度提取 API 参数 |
| `--incremental` | 否 | flag | 增量学习（须与 `--domain` 同用） |

**15 大分类**：account/product/ad/payment/trade/aftersale/settlement/supplychain/marketing/member/ai/report/finance/tax/compliance + thirdparty

**产出路径**：`.codebuddy/knowledge/domains/{category}/{domain-name}.yml`

**反爬 7 层容错**：HTTP 容错 / JS 渲染降级 / EMBED 处理 / 速率控制 / URL 推断 / 多源互补 / 质量评估

---

## 4. 工作流详解

### 4.1 工作流总览（16 个）

| # | 工作流 | 版本 | 阶段数 | Owner | 触发 |
|---|--------|------|--------|-------|------|
| 1 | project-lifecycle | v5.1.0 | 8+stage | pm-agent | `/init` |
| 2 | brainstorm | v3.5.1 | 分层 | bs-agent | `/brainstorm` |
| 3 | po-planning-flow | v1.1.0 | 8 阶段 | po-agent | 脑暴后/`/close`后 |
| 4 | requirement-flow | v3.2.1 | 8 步 | ba-agent | stage-2 |
| 5 | design-flow | v3.3.0 | 7 步法 | ux-agent | stage-3 |
| 6 | arch-flow | v3.2.0 | 2 步 | arch-agent | stage-4 |
| 7 | dev-flow | v2.1.0 | — | fd-agent | stage-5 |
| 8 | test-flow | v3.1.0 | 5 层 | qa-agent | stage-6 |
| 9 | acceptance-flow | v2.2.0 | 4 角色模拟 | ac-agent | stage-7 |
| 10 | handoff | v4.1.0 | 3 步 | ux-agent | stage-7.5 |
| 11 | knowledge-sedimentation | v1.1.0 | 3 步精简 | pm-agent | `/close` |
| 12 | change-request | v2.0.0 | — | pm-agent | `/change` `/fix` |
| 13 | defect-reflow | v4.1.0 | 分层回流 | pm-agent | 反馈触发 |
| 14 | learn-project | v7.0.0 | — | ba-agent | `/learn-project` |
| 15 | learn-domain | v4.0.0 | 11 步 | ba-agent | `/learn-domain` |
| 16 | migrate | v2.0.0 | — | pm-agent | `/migrate` |

### 4.2 核心工作流说明

#### project-lifecycle（需求流生命周期总控 v5.1.0）

PM 大脑编排层，管控 8 个核心 stage 的流转、Review、反馈回流。

**PM 6 项职责**：
- R1 何时开始（上一流程 Review 通过且用户确认）
- R2 是否完成（读取主导 Agent 产出 + Review 报告 + 大脑推理输出）
- R3 问题列表（汇总 Bug + Review 问题 + 大脑预警未命中）
- R4 人工确认（先展示 Review 汇总，再请用户确认）
- R5 全程留痕（对话/问题/Review/大脑活动日志到 Journal）
- R6 大脑编排（激活 Agent 大脑 + brain_sync_chain + brain_evolution_trigger）

#### requirement-flow（需求分析流程 v3.2.1）

BA Agent 主导，8 步产出完整 PRD（17 章）。

**关键步骤**：
- §0.0 终端冻结
- §0 项目判定与需求路由（PM 负责）
- §0.5 需求深度分析整合（6 维深度分析 + 8 维影响扫描 + 融合分析）
- §1 用户旅行地图
- §2 需求场景挖掘（5W2H + AI 盲区展开）
- §3-§4 业务场景 + 版本规划
- §5 首版详设（信息流→状态机→原子用例→矩阵→CONFIG→METRIC）
- §6 BR 依赖声明 + 接口契约初稿
- §7 产物体系输出（17 章 PRD）

#### arch-flow（架构评审流程 v3.2.0）

Arch Agent 主导，V3.2.0 新增 NFR 主题识别。

**步骤**：
- step-0 NFR 主题识别（V3.2.0 新增：AI 辅助识别 8 大 NFR 主题）
- step-1 架构评审（技术可行性 + 依赖 + 性能 + 合规 + NFR 实现方案）

**PM 红线**：C-A1~C-A8（8 条，含 C-A8 NFR 清单完整性）

#### po-planning-flow（PO 产品规划流程 v1.1.0）

PO Agent 主导，V1.1.0 新增 AI 辅助多维度规划。

**8 阶段**：
- po-1 输入加载
- po-2 四层价值评估 + 实现方式识别（V1.1.0 新增）
- po-3 产品架构设计（仅战略级）
- po-4 产品路线图 + 版本粒度选择（V1.1.0 新增）
- po-5 Backlog 生成与优先级排序
- po-6 Sprint 拆解（含 strategy_6 小版本快迭代）
- po-7 人确认
- po-8 交接需求探索

---

## 5. Agent 角色清单

### 11 个 Agent

| Agent | 角色 | 版本 | 核心职责 | 铁律数 |
|-------|------|------|---------|--------|
| pm-agent | 项目管理（版本级把关） | V2.2.0 | 8 阶段编排 + Review + 反馈回流 + 版本沉淀 + 大脑编排 | 9 |
| ba-agent | 业务分析师 | V3.3.0 | 需求分析 + 17 章 PRD + 系统类型识别 + 系统常识盲区探测 | 27 |
| ux-agent | 设计师 | V3.1.0 | 7 步设计法 + 8 章交互文档 + Design Tokens + UI 编号 | 9 |
| arch-agent | 架构师 | V3.1.0 | 技术栈基线 + 五维可插拔 + 契约 Zod + NFR 主题识别 | 11 |
| fd-agent | 前端开发 | V2.1.0 | 1:1 还原设计 + 套真实组件库 + sim/real 适配器 | 13 |
| qa-agent | 质量保障 | V3.1.0 | 五层测试（契约+单元+浏览器+白盒+视觉回归） | 6 |
| ac-agent | 验收交付 | V2.2.0 | 四人模拟验收（新用户/VIP/管理员/PO） | 6 |
| po-agent | 产品负责人（项目级把关） | V1.0.0 | 四层价值评估 + Backlog 优先级 + Sprint 拆解 + 商业价值验收 | 7 |
| sm-agent | 敏捷教练（Sprint 级把关） | V1.0.0 | Sprint DoD + Scrum 事件 + 障碍升级 + 增量可演示 | 5 |
| bs-agent | 脑暴主持人 | V3.5.0 | 三流草图 + BO/BG 映射 + 领域知识 + API 分析 | 10 |
| doc-agent | 文档管理 | V1.0.0 | 文档索引 + 模板强制 + 追溯矩阵 | 3 |

### 三级把关机制

| 层级 | 把关人 | 职责 |
|------|--------|------|
| 项目级 | PO Agent | 做对的事（战略对齐 g1~g5） |
| 版本级 | PM Agent | 把事做对（交付闭环 vg1~vg5） |
| Sprint 级 | SM Agent | 做对每个增量（敏捷交付 sg1~sg6） |

---

## 6. 8 阶段生命周期

```
stage-0    项目检测 + 骨架校验 + 上下文加载          PM
stage-0.5  脑暴（前置，PM 不介入）                    BS
stage-0.6  产品架构与规划（PO Agent）                 PO
stage-1    开启需求流                                 PM
stage-2    需求分析                                   BA（PM 监管）
stage-3    设计                                       UX（PM 监管）
stage-4    架构评审                                   Arch（PM 监管）
stage-5    开发                                       FD（PM 监管）
stage-6    测试                                       QA（PM 监管）
stage-7    验收                                       AC（PM 监管）
stage-7.5  交付标注与回传闭环                         UX+FD+BA
stage-8    结束需求流 + 版本沉淀 + 大脑进化            PM
```

### 各阶段产物

| 阶段 | 产物 | 路径 |
|------|------|------|
| stage-0.5 | 脑暴文档 | `docs/00-brainstorm/{topic}/confirmed/` |
| stage-0.6 | 价值评估 + Backlog + Sprint 计划 | `docs/00.5-product/` |
| stage-2 | PRD（17 章） | `docs/01-requirements/REQ-*.md` |
| stage-3 | 交互文档（8 章） | `docs/02-design/DESIGN-*.md` |
| stage-4 | 架构文档 + 契约 + NFR | `docs/03-architecture/ARCH-*.md` |
| stage-5 | 仿真代码 | `src/` |
| stage-6 | 五层测试报告 | `docs/05-test/TR-*.md` |
| stage-7 | 验收报告 | `docs/06-acceptance/ACR-*.md` |
| stage-7.5 | handoff 报告 | `docs/04-dev/handoff/` |
| stage-8 | HTML 需求文档 + 版本沉淀 | `docs/09-versions/v{version}/` |

### 各阶段 PM 红线

| 阶段 | 红线 | 数量 |
|------|------|------|
| stage-3 设计 | C-D1~D9 | 9 条 |
| stage-4 架构 | C-A1~A8 | 8 条 |
| stage-5 开发 | C-F1~F5 | 5 条 |

---

## 7. 流程级别

### 3 级流程按项目规模分层

| 级别 | 适用场景 | 步骤数 | Sprint 数 | 激活 Agent |
|------|---------|--------|-----------|-----------|
| lite | 小型项目/Bug 修复 | 3 步 | 1-2 | BA+FD+QA |
| standard | 中型项目/常规迭代 | 5 步 | 3-5 | BA+UX+FD+QA+AC |
| full | 大型项目/新项目 | 7 步 | 6+ | 全部 11 Agent |

### 版本粒度（V5.1.3 新增）

| 粒度 | 格式 | Sprint 数 | 典型内容 |
|------|------|-----------|---------|
| patch | v2.0.1 | 1-2 | 后台配置项/Bug 修复/参数调优 |
| minor | v2.1.0 | 2-4 | 新功能模块/场景闭环扩展 |
| major | v3.0.0 | 5-10 | 新产品线/重大架构升级 |

---

## 8. 门禁与铁律体系

### 8.1 门禁注册中心（gates-registry.yml V1.6.0）

| 阶段 | 门禁数 | 关键门禁 |
|------|--------|---------|
| brainstorm | 3 | G-BS-01~03（三流草图/BO-BG/领域知识） |
| requirement | 19 | G-REQ-01~19（FN/UC/五图/状态机中文/NFR/UC 六段/...） |
| design | 6 | G-DES-01~06（8 章结构/UI 编号/草图/跳转矩阵/红线/大脑） |
| arch | 6 | G-ARCH-01~06（路由/骨架/sim-real/回溯表/大脑/NFR 识别） |
| dev | 3 | G-DEV-01~03（可启动/合规/大脑） |
| test | 3 | G-TEST-01~03（五层测试/TC 关联 FN/大脑） |
| accept | 3 | G-ACC-01~03（验收报告/覆盖率/大脑） |
| close | 6 | G-CLOSE-01~06（PBL 闭环/Review/追溯/沉淀/大脑进化/HTML 文档） |

### 8.2 铁律注册中心（iron-rules-registry.yml V1.6.0）

**总计 90 条铁律**（86 hard + 4 soft）

| Agent | 铁律数 | 关键铁律 |
|-------|--------|---------|
| BA | 27 | BA-27 UC 六段不可省略 / BA-28 状态机中文命名 |
| FD | 13 | FD-01~13 |
| ARCH | 11 | ARCH-10 大脑推理 / ARCH-11 NFR 主题识别 |
| BS | 10 | BS-01~10 |
| PM | 9 | PM-09 大脑编排 |
| UX | 9 | UX-01~09 |
| FD | 13 | FD-01~13 |
| PO | 7 | PO-06 商业大脑 / PO-07 实现方式识别+小版本迭代 |
| QA | 6 | QA-01~06 |
| AC | 6 | AC-01~06 |
| SM | 5 | SM-01~05 |
| DOC | 3 | DOC-01~03 |
| GLOBAL | 1 | GLOBAL-01 人确认协议 |

---

## 9. V5.1.3 新特性

### 9.1 NFR 非功能需求识别（Arch 参与）

**问题**：PRD 此前只有功能需求，没有非功能需求。

**方案**：Arch Agent 在架构评审前置阶段（step-0），用 AI 辅助识别 8 大 NFR 主题：

| NFR 主题 | 示例 |
|---------|------|
| 高并发 | 多直播间同时审核 |
| 异步处理 | MPS 擦音任务回调 |
| 同步等待 | API 调用超时处理 |
| 数据一致性 | 任务状态 + 录像状态一致 |
| 安全性 | 敏感资源权限校验 |
| 可扩展性 | 多 MPS 模板扩展 |
| 可用性 | 7×24 运行 + 降级策略 |
| 性能 | 看板加载 < 2s |

**链路**：Arch 识别 → NFR 清单 → BA 纳入 PRD §18 → HTML 需求文档展示

### 9.2 状态机中文命名

**规则**：状态机节点和状态过渡操作表必须使用中文状态名，英文 enum 值保留在 ENT 定义中。

**映射示例**：pending→待处理, processing→处理中, completed→已完成, failed→已失败

### 9.3 PO 多维度规划

**问题**：PO 规划只按价值排序，不区分"后台可配置"vs"代码开发"。

**方案**：
- 新增实现方式维度（backend_config / code_development / hybrid）
- 配置优先于开发：backend_config 项拆为独立 patch 小版本快速交付
- 小版本多迭代：每个小版本只需围绕 1-2 个需求目标完成即可
- 优先级算法升级：价值 0.5 + 复杂度 0.2 + 阻塞 0.15 + 实现方式 0.15

### 9.4 HTML 需求文档

**命名规范**：`{项目}-{版本}-{Sprint}.html`（如 `SAAS-v2.0.0-S3.html`）

**内容结构**：
1. 背景与问题陈述（§3）
2. 目标与成功度量（§4）
3. 范围（§5）
4. 用户故事（§8）
5. 五类图（§15：Mermaid.js 渲染——业务流程图/泳道图/状态机/信息流转图/业务时序图/三方接口时序图）
6. 非功能需求（§18：10 条 NFR）
7. FN/UC 用例清单 + 截图 + UC 详细说明
8. 状态操作矩阵
9. 截图索引

**截图策略**：L1 锚点截图（1 张/页）+ L2 增量截图（状态变化）+ L3 特写（按需）

---

## 10. 典型操作场景

### 10.1 新项目全流程

```
# 1. 脑暴
/brainstorm --industry=直播SaaS --brainstorm-type=strategic --topic=AI内容审核 --project=SAAS

# 2. PO 规划（自动触发）
# → PO 产出价值评估 + Backlog + Sprint 计划

# 3. 立项 + 需求分析
/init --project=SAAS --type=新增 --desc="AI内容审核系统" --brainstorm-topic=AI内容审核

# 4. PM 自动编排后续阶段（设计→架构→开发→测试→验收）

# 5. 交付标注
/handoff --project=SAAS

# 6. 关闭
/close --project=SAAS

# 7. PO 下一版本规划（自动触发敏捷递归）
```

### 10.2 迭代版本

```
# /close 后 PM 询问 PO 下一版本
# → PO 产出下一版本 Backlog（含实现方式识别 + 版本粒度选择）

/init --project=SAAS --type=迭代 --desc="Sprint 4：看板导出+多MPS模板配置"
```

### 10.3 小版本快速配置上线

```
# PO 识别到部分功能可通过后台配置实现
# → 拆为 patch 小版本 v2.0.1

/init --project=SAAS --type=迭代 --desc="v2.0.1 多MPS模板配置+审核阈值调优（纯配置项）"
# → BA 标注 implementation_approach=backend_config
# → 跳过设计/架构/开发阶段（配置项无需代码开发）
# → 直接测试配置生效 + 验收 + close
```

### 10.4 Bug 修复

```
/fix --project=SAAS --desc="审核处置页断流后状态未更新" --priority=P0
```

### 10.5 领域知识学习

```
/learn-domain --source=website:https://cloud.tencent.com/document/product/862 --domain=腾讯云MPS --category=thirdparty --deep-params
```

### 10.6 项目学习（从现有文档产出 PRD）

```
/learn-project --project=NEW_PROJECT --source=local-dir:./docs --source=website:https://example.com
```

---

## 附录 A：指令参数速查

### `/init` 参数路由

| type | 必填参数 | 可选参数 | 跳过阶段 |
|------|---------|---------|---------|
| 新增 | --project --type --desc | --brainstorm-topic --file --api --source --priority | 无 |
| 迭代 | --project --type --desc | --brainstorm-topic --source --priority | 无 |
| 变更 | --project --type --desc | --source --priority | stage-0.5/0.6 |
| 修复 | --project --type --desc | --priority | stage-0.5/0.6/2/3/4（直接 QA→AC→close） |

### `/brainstorm` 分层类型

| 类型 | 激活 PO 层级 | 产出 | 后续 |
|------|------------|------|------|
| strategic | 第三层+第二层+第一层 | 脑暴+战略+商业+架构+路线图+Backlog | → PO 规划 → /init |
| planning | 第二层+第一层 | 脑暴+架构+路线图+Backlog | → PO 规划 → /init |
| regular | 第一层 | 脑暴+Backlog | → /init |

---

## 附录 B：产物路径速查

| 产物 | 路径 |
|------|------|
| 脑暴文档 | `projects/{project}/docs/00-brainstorm/{topic}/confirmed/` |
| PO 规划 | `projects/{project}/docs/00.5-product/` |
| PRD | `projects/{project}/docs/01-requirements/REQ-*.md` |
| 设计文档 | `projects/{project}/docs/02-design/DESIGN-*.md` |
| 架构文档 | `projects/{project}/docs/03-architecture/ARCH-*.md` |
| NFR 清单 | `projects/{project}/docs/03-architecture/NFR-*.yml` |
| 开发文档 | `projects/{project}/docs/04-development/DEV-*.md` |
| 测试报告 | `projects/{project}/docs/05-test/TR-*.md` |
| 验收报告 | `projects/{project}/docs/06-acceptance/ACR-*.md` |
| Sprint 守护 | `projects/{project}/docs/06-sprint-guard/` |
| 版本守护 | `projects/{project}/docs/07-version-guard/` |
| 项目守护 | `projects/{project}/docs/08-project-guard/` |
| 版本归档 | `projects/{project}/docs/09-versions/v{version}/` |
| HTML 需求文档 | `projects/{project}/docs/09-versions/v{version}/prd-html/{项目}-{版本}-{Sprint}.html` |
| Journal | `projects/{project}/.codebuddy/journal/` |
| 版本沉淀 | `.codebuddy/knowledge/{project}/版本沉淀/{version}/` |
| 领域知识 | `.codebuddy/knowledge/domains/{category}/` |
| 经验库 | `.codebuddy/knowledge/common/经验库/` |

---

> **维护说明**：本手册随 POM 版本升级同步更新。每次流程版本变更后，在流程版本变更总账追加记录并更新本手册版本号。
