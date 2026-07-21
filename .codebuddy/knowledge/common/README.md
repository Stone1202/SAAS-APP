# 全局共享知识库（.codebuddy/knowledge/common/）

> **版本**：V1.1.0 | **最后更新**：2026-07-18  
> **定位**：跨项目共享的知识库规范、治理文档、审计报告的统一管理入口

---

## 目录结构

```
.codebuddy/knowledge/common/
│
├── README.md                          ← 本文件（目录索引）
│
├── ── 流程规范文件（YML，被workflow引用）──
├── brainstorm-standards.yml            脑暴流程规范 v1.2.0（铁律B-01~B-10）
├── command-spec.yml                    命令规范与参数标准 v1.0.0（14命令完整定义）
├── doc-standards.yml                   需求文档规范 v3.2.0（编号体系方案B扩展+17章结构+五图铁律）
├── handoff-spec.yml                    handoff标注规范 v2.1.0（4级标注+回传机制+集中触发约束）
├── iron-rules-registry.yml            铁律注册中心 v1.0.0（10 Agents 72条铁律统一管理）
├── gates-registry.yml                  门禁注册中心 v1.0.0（8阶段门禁统一管理）
├── redlines.yml                        PM红线补充清单 v1.0.0（RL-SUP-01/02 已清偿）
├── incidents.yml                       全局报错复盘档案
├── use-case-card-standards.yml         可交互用例卡片规范 v2.0.0（7种页面类型+8种操作类型）
├── sim-prototype-standards.yml         高保真仿真原型规范
├── sprint-planning-standards.yml       Sprint拆解标准
├── version-timeline-standards.yml      版本时间线标准
├── value-assessment-standards.yml      价值评估标准
├── metrics-standards.yml               统计指标行业标准 v1.0.0
├── governance-audit.yml                全局深度检查机制 v2.0.0（12维度+10项AI检查+8专家视角+26项历史防复发）
├── human-confirm-protocol.yml          AI人性化确认协议
│
├── ── 流程规范子目录 ──
├── flow-standards/
│   ├── uc-taxonomy.yml                 用例分类体系 v1.0.0（7种页面类型×8种操作类型映射）
│
├── ── 领域知识子目录（YML，按专业域分类）──
├── arch/                               架构知识库
│   ├── tech-stack.yml                  技术栈基线 v3.0.0（五维可插拔架构）
│   ├── api-specs.yml                   服务契约总表
│   └── db-schema.yml                   IndexedDB 设计规范 v1
├── ux/                                 UX知识库
│   ├── design-system.yml               设计系统 v3.0.0（DTO+色彩+字体+栅格+8点网格）
│   ├── ui-components.yml               UI组件变体定义 v3.0.0（10类组件）
│   ├── ux-guidelines.yml               UX交互规范 v3.0.0（尼尔森+HIG+ISO/GB）
│   ├── design-output-standards.yml     设计文档输出规范 v2.0.0（9章强制结构+UC追溯+UI编号）
│   └── design-review-criteria.yml      设计交互评审准则 v1.0.0（3维度评估）
├── ba/                                 BA知识库（TODO待配置）
│   ├── business-domain.yml
│   ├── business-rules.yml
│   └── coding-standards.yml
├── qa/                                 QA知识库（TODO待配置）
│   ├── performance.yml
│   ├── security-policies.yml
│   └── test-strategy.yml
├── ops/                                运维知识库（TODO待配置）
│   ├── compliance.yml
│   ├── deployment.yml
│   └── integrations.yml
│
├── ── 治理文档（MD，方法论与设计文档）──
├── governance-docs/
│   ├── POM操作手册-V5.1.3.md             POM流程完整操作手册
│   ├── 成员操作手册-V1.2.0.md             成员操作指南（项目隔离+V5.3.0）
│   ├── 管理员操作手册-V1.1.0.md           管理员七大职责+流程改进审核
│   ├── POM-V5.0统一整改方案-最终合并版.md  V5.0最终统一方案
│   ├── POM流程审查机制整改方案.md          审查机制整改方案
│   ├── 知识库三层结构规范-V1.0.0.md        三层知识结构+加载优先级+经验提升闭环
│   ├── 流程版本变更总账.md                 所有流程版本变更记录
│   └── governance-mapping.md              治理映射索引
│
├── ── 审计报告（MD，全局审查输出）──
└── audit-reports/
    ├── 治理框架全面审计报告.md           治理框架全面审计（24项检查+7问题修复）
    └── 高保真仿真架构全面诊断与联动整改方案.md 架构诊断与整改方案
```

---

## 文件分类说明

### 1. 流程规范文件（根目录 .yml）

这些文件是**被workflow.yml通过 `standard` 字段引用的机器可读规范**，是流程执行的单一事实源。

| 文件 | 版本 | 引用方 | 说明 |
|------|------|--------|------|
| brainstorm-standards.yml | v1.2.0 | brainstorm.yml | 脑暴铁律B-01~B-10（九部门矩阵+四步法+三流草图+领域知识+分层类型） |
| command-spec.yml | v1.0.0 | config.yml | 14命令完整定义（参数+类型+默认值+智能提示+冲突检测） |
| doc-standards.yml | v3.2.0 | requirement-flow.yml, learn-project.yml, handoff.yml | 需求文档规范（编号体系方案B扩展+17章结构+五图铁律+业务操作矩阵） |
| handoff-spec.yml | v2.1.0 | handoff.yml | handoff标注规范（4级标注+回传机制+对应性校验+集中触发约束，引用uc-taxonomy） |
| use-case-card-standards.yml | v2.0.0 | instruction-card-generator.yml | 可交互用例卡片规范（7种页面类型+8种操作类型，引用uc-taxonomy） |
| uc-taxonomy.yml | v1.0.0 | design-flow.yml, handoff.yml, instruction-card-generator.yml | 用例分类体系（页面类型→操作UC映射+AI自动识别规则） |
| redlines.yml | v1.0.0 | project-lifecycle.yml | PM红线补充（RL-SUP-01/02 已标记清偿） |
| incidents.yml | - | - | 全局报错复盘档案 |

### 2. 领域知识子目录

按专业域分类的知识库，供对应Agent加载参考。

| 子目录 | 内容 | 状态 | 引用方 |
|--------|------|------|--------|
| arch/ | 技术栈基线+服务契约+DB Schema | ✅ 有内容 | arch-flow.yml → tech-stack.yml |
| ux/ | 设计系统+组件变体+UX规范 | ✅ 有内容 | design-flow.yml → 三个文件 |
| ba/ | 业务域+业务规则+编码规范 | 🟡 TODO待配置 | - |
| qa/ | 性能+安全+测试策略 | 🟡 TODO待配置 | - |
| ops/ | 合规+部署+集成 | 🟡 TODO待配置 | - |

### 3. 治理文档（governance-docs/）

POM方法论文档和治理设计文档，是**治理来源（非执行依赖）**，描述方法论设计思路和治理体系架构。

| 文件 | 说明 |
|------|------|
| POM操作手册-V5.1.3.md | POM流程完整操作手册 |
| 成员操作手册-V1.2.0.md | 成员操作指南（项目隔离+V5.3.0优化+自动Git） |
| 管理员操作手册-V1.1.0.md | 管理员七大职责+一条命令注册+流程改进审核 |
| POM-V5.0统一整改方案-最终合并版-20260718.md | V5.0最终统一方案 |
| POM流程审查机制整改方案.md | 审查机制整改方案 |
| 知识库三层结构规范-V1.0.0.md | 三层知识结构+加载优先级+经验提升闭环 |
| governance-mapping.md | 治理映射索引 |

### 4. 审计报告（audit-reports/）

全局审查机制产出的审计报告，记录治理框架的全面审计结果和架构诊断。

| 文件 | 说明 |
|------|------|
| 治理框架全面审计报告.md | 治理框架全面审计（24项检查+7问题修复） |
| 高保真仿真架构全面诊断与联动整改方案.md | 高保真仿真架构诊断与整改方案 |

---

## 维护规则

1. **流程规范文件（.yml）**：修改时须同步更新引用它的 workflow.yml 的 standard 字段版本号
2. **治理文档（governance-docs/）**：方法论文档升级时（如V4.0.0→V4.1.0），须同步更新 governance-mapping.md
3. **审计报告（audit-reports/）**：每次全局审计后新增审计报告，保留历史版本
4. **领域知识子目录**：TODO占位符文件逐步填充，填充后须在对应Agent的.md文档中声明引用
5. **本README.md**：文件增删时同步更新目录结构和分类说明
