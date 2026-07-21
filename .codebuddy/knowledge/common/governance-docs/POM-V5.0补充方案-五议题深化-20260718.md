# POM V5.0 补充方案 — 五议题深化设计

> **文档定位**：本文是 `POM-V5.0全面深度整改方案-20260718.md` 的补充深化文档。V5.0主方案聚焦"技术工程维度"（流程重构/运行时验证/AI进化/知识库体系），本补充方案补齐V5.0主方案中**完全缺失或不完整**的五个议题：AI人性化确认机制、脑暴→PO产品规划衔接、四层价值+公司7要素规划原则、Sprint敏捷拆解机制、三位一体交付物体系。
>
> **创建日期**：2026-07-18
> **前置文档**：POM-V5.0全面深度整改方案、POM体系根本性重构、11位专家深度讨论
> **后续动作**：本方案经用户确认后，将拆分为具体的配置文件/Agent规范/知识库文件修改任务

---

## 议题一：AI人性化确认反馈机制

### 1.1 问题诊断

V5.0主方案定义了"AI必须请求人确认"的三类场景（系统拆分/终端选择/边界归属/视觉调性/技术选型/发布决策），但**确认方式是笼统的"人确认"**，缺乏具体的交互协议。当前问题：

1. **单调询问**：AI只能"是否确认？"Y/N二选一，无法表达选项的利弊权衡
2. **缺乏上下文**：AI抛出问题时不附带分析依据、推荐倾向、风险提示
3. **打断式确认**：每遇到一个待确认点就打断，没有"批量确认"机制
4. **无追问能力**：人无法反问AI"为什么这么建议"或"还有别的方案吗"
5. **无置信度**：AI不给置信度，人不知道这是AI的强推荐还是弱建议

### 1.2 设计原则

| 原则 | 含义 |
|------|------|
| **多选项呈现** | 凡需人确认的决策，AI必须提供≥2个选项，每个选项附"利弊分析+适用场景" |
| **AI推荐标记** | AI必须明确标记自己的推荐选项（strong_recommend / weak_recommend / no_recommend） |
| **置信度透明** | AI必须给出推荐的置信度（high / medium / low）+ 置信依据 |
| **上下文附随** | 每个询问必须附带：决策背景、约束条件、影响范围、知识库引用 |
| **批量优先** | 同一阶段的多个待确认点合并为"决策清单"一次性询问，不逐个打断 |
| **追问通道** | 人可对任一选项追问"详细解释" / "还有别的方案吗" / "风险是什么" |
| **可推翻** | 人可选择"以上都不合适，我直接说" — 提供自由输入兜底 |

### 1.3 询问类型分类（7种）

| 类型ID | 类型名 | 触发场景 | 交互形式 | 示例 |
|--------|--------|----------|----------|------|
| Q1 | **方案选择型** | 多方案分歧（如系统拆分方式A vs B vs C） | 列出每个方案 + 利弊 + AI推荐 + 置信度 | "B2C商城拆为3系统还是2系统？方案A(3系统)耦合低但成本高；方案B(2系统)平衡；方案C(单体)快速但难扩展。AI推荐B(置信度high)" |
| Q2 | **边界确认型** | 边界归属模糊（如支付是自营还是第三方） | 列出候选归属 + 各自影响 + AI推荐 | "支付能力归属：① 交易系统自营 ② 对接第三方支付 ③ 混合模式。AI推荐②(置信度medium，依据：领域知识payment域)" |
| Q3 | **优先级排序型** | Backlog优先级需要人决策 | 列出候选排序 + 各排序的商业影响 + AI推荐 | "v1.0 Backlog排序：商品/订单/支付 三者先后？AI推荐 订单→商品→支付(置信度high)" |
| Q4 | **风险确认型** | AI识别到风险但需人决定是否接受 | 列出风险 + 影响 + 缓解措施 + AI建议 | "检测到直播间禁言逻辑涉及审核合规风险。AI建议增加人工复审环节(置信度high)。是否接受？" |
| Q5 | **范围确认型** | Sprint范围需人决策（做多少） | 列出候选范围 + 工作量评估 + 价值评估 | "v1.0 Sprint 1 范围：① 全部5页面 ② 核心3页面 ③ MVP 2页面。AI推荐②(置信度medium)" |
| Q6 | **视觉调性型** | 视觉风格需人定调 | 列出候选风格 + 参考案例 + AI推荐 | "B端运营后台视觉调性：① 简洁专业(参考Linear) ② 数据密集(参考阿里云) ③ 友好亲和(参考飞书)。AI推荐①(置信度medium)" |
| Q7 | **自由兜底型** | 人拒绝所有AI选项 | 自由文本输入 | "以上选项都不合适，请直接描述你的决策" |

### 1.4 询问交互协议（YAML Schema）

```yaml
# 确认询问协议 — 所有AI确认点必须遵循此结构
confirm_request:
  request_id: "CF-{阶段}-{NNN}"
  request_type: "Q1|Q2|Q3|Q4|Q5|Q6|Q7"
  stage: "brainstorm|requirement|design|arch|dev|test|accept"
  title: "一句话标题"
  background: "决策背景（为什么需要确认）"
  constraints: ["约束1", "约束2"]      # 影响决策的约束条件
  impact_scope: "影响范围（哪些产物/阶段受影响）"
  knowledge_refs: ["domains/payment/xxx.yml#L23", "common/tech-standards/xxx.yml#L45"]
  
  options:
    - id: "A"
      label: "方案A"
      description: "方案描述"
      pros: ["优点1", "优点2"]
      cons: ["缺点1", "缺点2"]
      applicable_scenario: "适用场景"
      estimated_effort: "S|M|L|XL"     # 工作量评估（仅Q5）
      business_impact: "商业影响描述"
    
    - id: "B"
      label: "方案B"
      # ... 同上
  
  ai_recommendation:
    recommended_option: "A|B|C|..."
    confidence: "high|medium|low"
    confidence_basis: "置信依据（为什么推荐+为什么这个置信度）"
    reasoning: "推荐理由（引用知识库/历史经验/领域标准）"
  
  followup_channels:                   # 人可用的追问通道
    - "详细解释：请AI展开某选项的细节"
    - "替代方案：请AI提供更多选项"
    - "风险评估：请AI评估某选项的风险"
    - "自由输入：我直接说决策"
  
  deadline: "本次会话内|本次阶段结束前"  # 期望何时得到答复
```

### 1.5 批量决策清单机制

为避免逐个打断，AI在每阶段结束前汇总本阶段所有待确认点为"决策清单"：

```yaml
# 阶段决策清单 — 每阶段Review前一次性呈现
stage_decision_brief:
  stage: "requirement"
  total_items: 5
  items:
    - request_id: "CF-REQ-001"
      request_type: "Q2"
      title: "支付能力归属"
      ai_recommendation: "B"
      confidence: "medium"
    - request_id: "CF-REQ-002"
      request_type: "Q1"
      title: "订单状态机设计方式"
      ai_recommendation: "A"
      confidence: "high"
    # ...
  
  presentation_rule: |
    PM一次性展示所有5个待确认点，每个附带AI推荐+置信度。
    用户可：
      ① 全部采纳AI推荐（快速模式）
      ② 逐个决策（详细模式）
      ③ 批量采纳+个别调整（混合模式）
```

### 1.6 落地改造清单

| 改造项 | 文件 | 改造内容 |
|--------|------|----------|
| 新建确认机制规范 | `common/human-confirm-protocol.yml`（新建V1.0.0） | 定义7种询问类型+YAML Schema+批量清单机制+追问通道 |
| 新建确认技能 | `configs/skills/human-confirm-handler.yml`（新建） | AI处理确认询问的技能：构造询问/接收追问/记录决策/回写产物 |
| PM Agent增强 | `agents/pm-agent.md` + `configs/agents/pm-agent.yml` | PM负责呈现"阶段决策清单"，提供"快速/详细/混合"三种模式 |
| 各Agent铁律补充 | `iron-rules-registry.yml` | 全Agent新增铁律："凡需人确认的决策，必须按human-confirm-protocol.yml构造询问，禁止Y/N二选一" |
| redlines.yml补充 | `redlines.yml` | 新增RL-SUP-03："AI确认询问必须附AI推荐+置信度+知识库引用" |
| config.yml注册 | `config.yml` | 注册human_confirm_protocol引用 |

---

## 议题二：脑暴→PO产品规划→需求探索 全流程衔接

### 2.1 问题诊断

V5.0主方案的流程起点是"Sprint 0: 需求探索"，**完全跳过了脑暴和PO产品规划阶段**。现状问题：

1. **脑暴→PO是隐式交接**：brainstorm.yml stage-7只说"通知PO Agent"，无显式产物交接文件/门禁
2. **PO无独立workflow.yml**：PO Agent内置流程，无标准化的规划workflow
3. **PO→需求探索是断点**：PO产出Backlog后，如何进入Sprint 0需求探索？无衔接机制
4. **战略型/规划型产物归属混乱**：脑暴说产战略分析+商业分析，PO也说产PROD-STRATEGY+PROD-BUSINESS，关系未厘清
5. **V5.0主方案流程图缺失前置阶段**：直接从"Sprint 0需求探索"开始，但实际项目是从"脑暴"开始的

### 2.2 修正后的全流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                    POM V5.0 完整流程（含前置阶段）                    │
└─────────────────────────────────────────────────────────────────────┘

  【前置阶段 - 产品规划层】
  
  Stage -2: 脑暴（/brainstorm --brainstorm-type --topic）
    ├─ strategic型 → 产出: 脑暴文档 + 战略分析 + 商业分析
    ├─ planning型  → 产出: 脑暴文档
    └─ regular型   → 产出: 脑暴文档（跳过PO直接进需求探索）
         │
         │  显式交接：confirmed/BR-脑暴文档-确认稿.md + 产物清单
         ▼
  Stage -1: PO产品规划（PO Agent激活）
    ├─ 战略级激活 → 产出: 产品架构 + 路线图 + Backlog + 四层价值评估
    ├─ 规划级激活 → 产出: 路线图 + Backlog + 四层价值评估
    └─ 常规级     → 跳过PO
         │
         │  显式交接：PROD-BACKLOG-{project}-v{version}.yml + 四层价值评估报告
         ▼
  【Sprint 0 - 需求探索层】（V5.0主方案已有，补充输入）
  
  Stage 0: Sprint 0 需求探索
    ├─ 输入: PO Backlog + 脑暴产物 + 四层价值评估
    ├─ AI辅助: 场景识别 + 系统拆分建议 + 端到端闭环验证
    └─ 人确认: 场景/边界/系统/终端（按议题一的人性化确认机制）
         │
         ▼
  【Sprint 1-N - 增量交付层】（V5.0主方案已有）
  
  Stage 1-N: 每个Sprint
    ├─ 需求分析(BA) → 设计(UX) → 架构(Arch) → 开发(FD) → 测试(QA) → 人确认
    └─ 每Sprint交付1-3个页面 + 运行时验证 + Demo报告
         │
         ▼
  【Final Sprint - 集成验证层】（V5.0主方案已有）
  
  Stage Final: 集成验证 + 验收(AC含PO商业价值验收) + handoff + /close
         │
         ▼
  【敏捷递归】
  
  /close → PM版本沉淀 → PM询问PO下一版本 → PO产出v{n+1} Backlog → /init v{n+1} → 递归
```

### 2.3 脑暴→PO 显式交接规范

```yaml
# 脑暴→PO交接清单（brainstorm.yml stage-7增强）
brainstorm_to_po_handoff:
  trigger: "brainstorm_type in [strategic, planning]"
  handoff_artifacts:
    - path: "projects/{project}/docs/00-brainstorm/{topic}/confirmed/BR-脑暴文档-确认稿.md"
      role: "脑暴结论"
    - path: "projects/{project}/docs/00-brainstorm/{topic}/confirmed/STRATEGY-分析.md"
      role: "战略分析（仅strategic型）"
    - path: "projects/{project}/docs/00-brainstorm/{topic}/confirmed/BUSINESS-分析.md"
      role: "商业分析（仅strategic型）"
    - path: "projects/{project}/docs/00-brainstorm/{topic}/confirmed/domain-knowledge-list.yml"
      role: "领域知识清单"
    - path: "projects/{project}/docs/00-brainstorm/{topic}/confirmed/api-analysis-list.yml"
      role: "API分析清单（如有）"
  
  handoff_gate:
    - id: "G-BS-HO-01"
      check: "脑暴文档确认稿存在且含版本概要表"
    - id: "G-BS-HO-02"
      check: "strategic型必须含战略分析+商业分析"
    - id: "G-BS-HO-03"
      check: "领域知识清单存在（即使为空也要标注'无匹配领域'）"
```

### 2.4 PO产品规划独立workflow（新建）

新建 `configs/workflows/po-planning-flow.yml` V1.0.0：

```yaml
# PO产品规划流程
version: "1.0.0"
name: "po-planning-flow"
trigger: "脑暴完成后(strategic/planning型) | /close后PM询问下一版本"
agent: "po-agent"

stages:
  po-1:
    name: "输入加载"
    inputs:
      - "脑暴确认稿"
      - "战略分析（如有）"
      - "商业分析（如有）"
      - "领域知识清单"
      - "上一版本沉淀（迭代场景）"
      - "上一版本验收结论（迭代场景）"
  
  po-2:
    name: "四层价值评估（见议题三）"
    output: "VALUE-ASSESSMENT-{project}-v{version}.yml"
  
  po-3:
    name: "产品架构设计（仅战略级）"
    output: "PROD-ARCH-{project}.md"
    content: "子系统划分 + 系统边界 + 依赖关系"
  
  po-4:
    name: "产品路线图"
    output: "PROD-ROADMAP-{project}.yml"
    content: "版本里程碑 + 每版本商业目标 + 依赖关系"
  
  po-5:
    name: "Backlog生成与优先级排序（四层价值+公司7要素驱动）"
    output: "PROD-BACKLOG-{project}-v{version}.yml"
    content: "Backlog项含四层价值评分 + 7要素影响标记 + Sprint归属建议"
  
  po-6:
    name: "Sprint拆解（见议题四）"
    output: "SPRINT-PLAN-{project}-v{version}.yml"
    content: "版本→Sprint拆解 + 每Sprint范围 + DoD + 依赖"
  
  po-7:
    name: "人确认（按议题一机制）"
    confirm_items:
      - "产品架构（系统拆分方式）— Q1方案选择型"
      - "版本里程碑顺序 — Q3优先级排序型"
      - "Backlog Must/Should划分 — Q3优先级排序型"
      - "Sprint拆解粒度 — Q5范围确认型"
  
  po-8:
    name: "交接需求探索（Sprint 0）"
    handoff_to: "BA Agent"
    handoff_artifacts:
      - "PROD-BACKLOG（按Sprint组织的Backlog项）"
      - "SPRINT-PLAN（Sprint拆解计划）"
      - "VALUE-ASSESSMENT（四层价值评估）"
      - "PROD-ARCH（产品架构，如有）"

gates:
  - id: "G-PO-01"
    check: "四层价值评估完整（商业+交付+客户+场景闭环）"
  - id: "G-PO-02"
    check: "Backlog每项含四层价值评分"
  - id: "G-PO-03"
    check: "Sprint拆解计划存在且每Sprint有DoD"
  - id: "G-PO-04"
    check: "人确认决策清单已全部决策"
```

### 2.5 产物归属厘清

| 产物 | 产出方 | 消费方 | 路径 |
|------|--------|--------|------|
| 脑暴文档 | BS Agent | PO/BA | `00-brainstorm/{topic}/confirmed/` |
| 战略分析 | BS Agent（strategic型） | PO | `00-brainstorm/{topic}/confirmed/STRATEGY-分析.md` |
| 商业分析 | BS Agent（strategic型） | PO | `00-brainstorm/{topic}/confirmed/BUSINESS-分析.md` |
| 产品架构 | PO Agent（战略级） | BA/Arch | `00.5-product/PROD-ARCH-{project}.md` |
| 产品路线图 | PO Agent | PM/BA | `00.5-product/PROD-ROADMAP-{project}.yml` |
| 四层价值评估 | PO Agent | PM/BA/Arch | `00.5-product/VALUE-ASSESSMENT-{project}-v{version}.yml` |
| Backlog | PO Agent | BA | `00.5-product/PROD-BACKLOG-{project}-v{version}.yml` |
| Sprint拆解计划 | PO Agent | PM/BA/FD | `00.5-product/SPRINT-PLAN-{project}-v{version}.yml` |

**厘清原则**：脑暴产"发散性探索产物"（战略/商业分析的初稿），PO产"决策性规划产物"（基于脑暴结论的产品架构/路线图/Backlog/Sprint计划）。两者不重复。

### 2.6 落地改造清单

| 改造项 | 文件 | 改造内容 |
|--------|------|----------|
| 新建PO规划workflow | `configs/workflows/po-planning-flow.yml`（新建V1.0.0） | 8阶段PO规划流程 |
| brainstorm.yml增强 | `configs/workflows/brainstorm.yml` | stage-7增加显式交接清单+门禁G-BS-HO-01~03 |
| project-lifecycle.yml增强 | `configs/workflows/project-lifecycle.yml` | stage-0.5引用po-planning-flow.yml；流程图前置脑暴+PO阶段 |
| po-agent.md增强 | `agents/po-agent.md` | 引用po-planning-flow.yml；新增四层价值评估+Sprint拆解职责 |
| gates-registry.yml补充 | `knowledge/common/gates-registry.yml` | 新增G-PO-01~04门禁 |
| config.yml注册 | `config.yml` | 注册po_planning_flow引用 |

---

## 议题三：四层价值 + 公司7要素规划原则

### 3.1 问题诊断

当前PO Backlog优先级排序仅用"MoSCoW + value(1-10) + complexity(1-10)"三维度，**完全缺失**：

1. **交付价值**：无"交付此Backlog项对下游团队/系统的价值"维度
2. **客户价值**：PO说"客户代言人"但Backlog无客户价值评分字段
3. **场景闭环**：无"此Backlog项是否参与某个端到端场景闭环"维度
4. **公司7要素**：无"运营/资源/财务/渠道/业务/组织/技术"7要素的影响评估

### 3.2 四层价值评估框架

```yaml
# 四层价值评估 — 每个Backlog项必须评估
value_assessment:
  dimensions:
    
    commercial_value:         # 商业价值 — 这件事能赚多少钱/省多少钱/带来多少增长
      score: 1-10
      reasoning: "评分依据"
      sub_dimensions:
        revenue_impact: "收入影响（直接/间接）"
        cost_reduction: "成本节约"
        growth_contribution: "增长贡献（用户/订单/GMV）"
    
    delivery_value:           # 交付价值 — 这件事对下游团队/系统的价值
      score: 1-10
      reasoning: "评分依据"
      sub_dimensions:
        unblock_others: "是否解锁其他Backlog项（依赖关系）"
        foundation_for_future: "是否为未来版本打基础"
        technical_debt_reduction: "是否减少技术债"
    
    customer_value:           # 客户价值 — 这件事对最终用户的价值
      score: 1-10
      reasoning: "评分依据"
      sub_dimensions:
        pain_point_resolution: "痛点解决程度"
        experience_improvement: "体验提升程度"
        usage_frequency: "使用频率影响"
    
    scenario_closure:         # 场景闭环 — 这件事是否参与端到端场景闭环
      score: 1-10
      reasoning: "评分依据"
      sub_dimensions:
        involved_scenarios: ["SC-001", "SC-003"]  # 参与哪些场景闭环
        closure_criticality: "critical|important|nice_to_have"  # 对闭环的关键性
        is_blocking_closure: true|false            # 是否阻塞闭环完成
  
  composite_score: "加权平均"   # 默认权重 商业0.3 + 交付0.2 + 客户0.3 + 闭环0.2，可调
```

**权重可调原则**：不同项目阶段权重不同。早期项目场景闭环权重高（先跑通再优化），成熟期商业价值权重高（变现优先）。PO在规划时声明本次版本的权重配置，需人确认。

### 3.3 公司7要素影响评估

```yaml
# 公司7要素影响 — 每个Backlog项评估对7要素的影响
company_factors_impact:
  factors:
    
    operations:               # 运营 — 是否影响运营流程/运营人员配置
      impact: "positive|negative|neutral"
      description: "影响描述"
      example: "新增审核流程 → 运营需增加审核人员"
    
    resources:                # 资源 — 是否影响人力/算力/带宽/存储资源
      impact: "positive|negative|neutral"
      description: "影响描述"
      example: "直播间禁言 → 需增加音频识别算力"
    
    finance:                  # 财务 — 是否影响成本结构/收入结构/预算
      impact: "positive|negative|neutral"
      description: "影响描述"
      example: "对接第三方支付 → 增加支付通道成本"
    
    channels:                 # 渠道 — 是否影响获客渠道/分发渠道/转化渠道
      impact: "positive|negative|neutral"
      description: "影响描述"
      example: "APP端直播间 → 新增APP获客渠道"
    
    business:                 # 业务 — 是否影响业务流程/业务规则/业务模式
      impact: "positive|negative|neutral"
      description: "影响描述"
      example: "订阅制 → 业务模式从买断变订阅"
    
    organization:             # 组织 — 是否影响组织架构/团队职责/协作方式
      impact: "positive|negative|neutral"
      description: "影响描述"
      example: "新增客服系统 → 需组建客服团队"
    
    technology:               # 技术 — 是否影响技术栈/架构/基础设施
      impact: "positive|negative|neutral"
      description: "影响描述"
      example: "引入实时音视频 → 技术栈新增WebRTC"
  
  blocking_factors: ["finance"]  # 哪些要素是阻塞项（如财务预算未批则不能做）
```

### 3.4 优先级排序算法（升级）

```
新优先级得分 = 
  四层价值加权得分 × 0.6 
  + (10 - complexity) × 0.2 
  + (1 - blocking_factors_count / 7) × 0.2

排序规则：
  1. blocking_factors = 0 的项优先
  2. 同等blocking下，按新优先级得分降序
  3. 同分时，scenario_closure.closure_criticality = critical 优先
  4. 仍同分时，MoSCoW Must > Should > Could > Won't
```

### 3.5 Backlog项升级后的Schema

```yaml
# PROD-BACKLOG-{project}-v{version}.yml — 升级版
version: "v1.0.0"
project: "{project}"
created_by: "po-agent"
value_weights:                  # 本版本的四层价值权重（可调，需人确认）
  commercial: 0.3
  delivery: 0.2
  customer: 0.3
  scenario_closure: 0.2

items:
  - id: "BL-001"
    name: "商品管理模块"
    moscow: "M"
    
    # 四层价值（新增）
    value_assessment:
      commercial: { score: 9, reasoning: "..." }
      delivery: { score: 8, reasoning: "解锁订单模块" }
      customer: { score: 7, reasoning: "用户可管理商品" }
      scenario_closure: { score: 9, involved_scenarios: ["SC-001"], closure_criticality: "critical", is_blocking_closure: true }
      composite: 8.4
    
    # 公司7要素影响（新增）
    company_factors:
      operations: { impact: "neutral", description: "..." }
      resources: { impact: "neutral", description: "..." }
      finance: { impact: "neutral", description: "..." }
      channels: { impact: "neutral", description: "..." }
      business: { impact: "positive", description: "支撑商品业务" }
      organization: { impact: "neutral", description: "..." }
      technology: { impact: "neutral", description: "..." }
      blocking_factors: []
    
    # 复杂度（保留）
    complexity: 6
    
    # 新优先级得分（算法升级）
    priority_score: 7.6
    
    # Sprint归属（新增，见议题四）
    target_sprint: "S1"
    
    # 依赖（保留）
    dependencies: []
```

### 3.6 落地改造清单

| 改造项 | 文件 | 改造内容 |
|--------|------|----------|
| 新建价值评估规范 | `common/value-assessment-standards.yml`（新建V1.0.0） | 四层价值框架+7要素评估+优先级算法+权重可调 |
| po-agent.md重写第七章 | `agents/po-agent.md` | Backlog排序从三维度升级为四层价值+7要素 |
| Backlog模板升级 | `po-agent.md` + `doc-standards.yml` | Backlog项Schema升级 |
| 新建价值评估Skill | `configs/skills/value-assessor.yml`（新建） | AI辅助PO进行四层价值评估+7要素分析 |
| 人确认点 | `human-confirm-protocol.yml` | 四层价值权重配置需人确认（Q3优先级排序型） |
| gates-registry.yml补充 | `gates-registry.yml` | G-PO-01更新为"四层价值+7要素评估完整" |

---

## 议题四：Sprint敏捷拆解机制

### 4.1 问题诊断

V5.0主方案有Sprint概念（Sprint 0→Sprint 1-N→Final），但**缺乏"版本→Sprint"的具体拆解方法论**：

1. **拆解依据不明**：按业务流程闭环拆？按终端拆？按模块拆？无规则
2. **DoD未定义**：每个Sprint的"完成定义"（Definition of Done）是什么？
3. **Sprint间依赖管理缺失**：Sprint 1的产物被Sprint 2依赖时如何处理？
4. **Sprint Backlog管理缺失**：每Sprint的待办如何管理？燃尽如何跟踪？
5. **敏捷专家视角缺失**：V5.0主方案没有敏捷开发专业专家的输入

### 4.2 敏捷开发专家意见（虚拟引入）

基于Scrum/Kanban行业最佳实践，本方案引入以下敏捷原则：

| 原则 | 含义 | POM落地 |
|------|------|---------|
| **Sprint目标是增量可演示** | 每Sprint结束必须产出可演示的增量（不是半成品） | 每Sprint交付1-3个页面 + 运行时验证通过 + Demo报告 |
| **Sprint长度固定** | Sprint长度一旦确定不改（避免范围蔓延） | 默认1个Sprint = 1次完整 lite/standard/full流程周期 |
| **DoD显式定义** | 每个Sprint的"完成"标准显式化 | 每Sprint的DoD包含：代码可运行+运行时验证通过+测试通过+后置条件实现+人确认 |
| **Sprint Backlog不可变** | Sprint一旦启动，Backlog不可增加（只可减） | Sprint启动后AI不再向Sprint Backlog加项，变更走change-request |
| **每日同步（AI化）** | 每日同步进度（AI自动） | AI每阶段结束自动生成进度报告，无需人工每日站会 |
| **Sprint Review可演示** | Review时演示增量给PO/PM | Sprint结束AI自动Demo（V5.0已有）+ PO商业价值验收 |
| **Retrospective学习** | 回顾改进 | V5.0版本沉淀学习已有，增强为Sprint级学习 |
| **Velocity可预测** | 通过历史Sprint速度预测未来 | AI记录每Sprint实际交付页面数/工时，用于下一版本规划 |

### 4.3 Sprint拆解规则

```yaml
# Sprint拆解规则 — PO在po-6阶段执行
sprint_splitting_rules:
  
  splitting_strategy:          # 拆解策略（按优先级选择）
    - strategy_1: "按业务流程闭环拆"
      description: "一个Sprint完成一个端到端业务流程闭环"
      example: "S1=商品上架→下单→支付闭环；S2=退款→售后闭环"
      when_to_use: "业务流程清晰且闭环独立时"
    
    - strategy_2: "按终端拆"
      description: "一个Sprint完成一个终端的核心功能"
      example: "S1=PC运营后台；S2=APP端；S3=H5端"
      when_to_use: "多终端项目，终端间相对独立时"
    
    - strategy_3: "按模块拆"
      description: "一个Sprint完成一个业务模块"
      example: "S1=商品模块；S2=订单模块；S3=支付模块"
      when_to_use: "模块间耦合低时"
    
    - strategy_4: "MVP优先拆"
      description: "S1做MVP最小可用版本，后续Sprint增量增强"
      example: "S1=商品CRUD；S2=商品分类+搜索；S3=商品批量导入"
      when_to_use: "新项目首版本，需快速验证时"
    
    - strategy_5: "混合拆"
      description: "组合以上策略，PO声明组合方式"
      when_to_use: "复杂项目，单一策略不适用时"
  
  splitting_constraints:
    - "每Sprint页面数 ≤ 5（超过则拆分）"
    - "每Sprint必须包含至少1个场景闭环（SC）"
    - "Sprint间依赖必须显式声明，不允许隐式依赖"
    - "Sprint 1通常做MVP或核心闭环，后续Sprint增量"
    - "跨Sprint的共享组件（如通用弹窗/通用Store）放在依赖它的第一个Sprint"
  
  sprint_size_guidance:
    small_project: "1-2 Sprint（lite流程）"
    medium_project: "3-5 Sprint（standard流程）"
    large_project: "6+ Sprint（full流程）"
```

### 4.4 Sprint计划Schema

```yaml
# SPRINT-PLAN-{project}-v{version}.yml
version: "v1.0.0"
project: "{project}"
target_version: "v1.0.0"
splitting_strategy: "strategy_1"  # 按业务流程闭环拆
splitting_rationale: "本项目业务流程清晰，闭环独立"

sprints:
  - sprint_id: "S1"
    name: "商品交易闭环"
    goal: "完成商品上架→下单→支付端到端闭环，可演示"
    pages: ["商品列表页", "商品详情页", "下单页", "支付页"]
    backlog_items: ["BL-001", "BL-002", "BL-003"]
    scenarios: ["SC-001-商品交易闭环"]
    
    definition_of_done:
      code_runnable: true
      runtime_verification_passed: true
      tests_passed: true
      post_conditions_implemented: true
      human_confirmed: true
      demo_report_generated: true
    
    dependencies: []            # S1无前置依赖
    dependents: ["S2"]          # S2依赖S1
    
    process_tier: "standard"    # lite/standard/full
    
  - sprint_id: "S2"
    name: "售后退款闭环"
    goal: "完成退款申请→审核→退款到账端到端闭环"
    pages: ["退款申请页", "退款审核页", "退款详情页"]
    backlog_items: ["BL-004", "BL-005"]
    scenarios: ["SC-002-售后退款闭环"]
    definition_of_done: { ... }
    dependencies: ["S1"]        # 依赖S1的订单数据
    dependents: []
    process_tier: "standard"

sprint_sequence: ["S1", "S2"]   # 执行顺序
total_sprints: 2
estimated_effort: "S1=5天, S2=3天"
```

### 4.5 Sprint Backlog管理

```yaml
# Sprint Backlog — 每Sprint启动时从PROD-BACKLOG提取该Sprint的项
sprint_backlog:
  sprint_id: "S1"
  status: "in_progress|done|blocked"
  
  items:
    - bl_id: "BL-001"
      status: "done|in_progress|todo|blocked"
      actual_effort: "2天"
      blocker: null
    
    - bl_id: "BL-002"
      status: "in_progress"
      actual_effort: "1天（进行中）"
      blocker: "等待BL-001的Store定义"
  
  burndown:
    planned_pages: 4
    completed_pages: 2
    remaining_pages: 2
    velocity: "2页面/天"        # 实际速度，用于下一版本预测
```

### 4.6 Sprint间依赖管理

```yaml
# 依赖管理规则
dependency_management:
  types:
    - type: "data_dependency"
      description: "S2需要S1的数据结构/Store"
      handling: "S1必须在definition_of_done中包含数据契约定义；S2启动前校验契约存在"
    
    - type: "component_dependency"
      description: "S2需要S1的通用组件"
      handling: "通用组件在S1开发时同步抽取为共享组件；S2启动前校验组件可用"
    
    - type: "scenario_dependency"
      description: "S2的场景闭环依赖S1的场景"
      handling: "S1场景必须跑通且验收通过；S2启动前运行S1场景作为前置验证"
  
  blocking_handling:
    - "若S1未达DoD，S2不得启动"
    - "若S1部分完成，PO重新评估是否拆分S2或调整S2范围"
    - "阻塞超过2天，PM触发defect-reflow流程"
```

### 4.7 与project-lifecycle.yml的衔接

```yaml
# project-lifecycle.yml 增强
stage-0.5:
  name: "PO产品规划"
  workflow_ref: "po-planning-flow.yml"
  outputs:
    - "PROD-BACKLOG + SPRINT-PLAN + VALUE-ASSESSMENT"
  
stage-1_to_N:                    # 新增：Sprint循环
  name: "Sprint 1-N 增量交付"
  loop: true
  loop_count: "from SPRINT-PLAN.total_sprints"
  
  each_sprint:
    sub_stages:
      - "BA需求分析（仅本Sprint范围）"
      - "UX设计（仅本Sprint页面）"
      - "Arch架构（仅本Sprint涉及的契约/适配器）"
      - "FD开发（仅本Sprint页面+后置条件实现）"
      - "QA测试（仅本Sprint页面+运行时验证）"
      - "人确认（按议题一机制）"
      - "Sprint Review（AI Demo + PO商业价值验收）"
      - "Sprint Retrospective（AI学习记录）"
    
    sprint_gate:
      - id: "G-SPRINT-01"
        check: "DoD全部满足"
      - id: "G-SPRINT-02"
        check: "运行时验证通过（build+test+dev启动+页面访问+菜单跳转+数据保存+后置条件+流程跑通）"
      - id: "G-SPRINT-03"
        check: "Demo报告生成且含截图/录屏"
      - id: "G-SPRINT-04"
        check: "下一Sprint的前置依赖校验通过（非最后Sprint）"
```

### 4.8 落地改造清单

| 改造项 | 文件 | 改造内容 |
|--------|------|----------|
| Sprint拆解规范 | `common/sprint-planning-standards.yml`（新建V1.0.0） | 拆解策略+DoD+依赖管理+Sprint Backlog+Velocity |
| po-planning-flow.yml | `configs/workflows/po-planning-flow.yml` | po-6阶段引用sprint-planning-standards.yml |
| project-lifecycle.yml | `configs/workflows/project-lifecycle.yml` | 新增stage-1_to_N Sprint循环结构+sprint_gate |
| gates-registry.yml | `gates-registry.yml` | 新增G-SPRINT-01~04 |
| 新建Sprint规划Skill | `configs/skills/sprint-planner.yml`（新建） | AI辅助PO进行Sprint拆解+依赖分析+DoD生成 |
| 版本沉淀学习增强 | `knowledge-sedimentation.yml` | 沉淀每Sprint的Velocity+阻塞记录+学习经验 |

---

## 议题五：三位一体交付物体系

### 5.1 问题诊断

用户描述的交付物体系：
> **PRD文档（泳道图、流程图、状态机、信息流、用例说明） + 高保真仿真原型 + 可交互用例卡片**

现状问题：

| 交付物 | V5.0主方案现状 | GAP |
|--------|---------------|-----|
| PRD | 提到"结构化需求模型(YAML)"含系统/终端/角色/流程/FN/UC/BR/状态机/后置条件/验收标准 | **未明确"泳道图"和"信息流"作为独立交付物**；YAML格式不便于研发团队阅读 |
| 高保真仿真原型 | 提到"可交互原型(HTML)"定位为"代码初始版本" | **未明确"高保真仿真"概念**；原型定位应为"独立仿真交付物"而非"代码初版" |
| 可交互用例卡片 | **完全缺失** | 需全新设计：每张卡片=一个用例的交互式演示 |

### 5.2 三位一体交付物定义

```
┌─────────────────────────────────────────────────────────────┐
│                 三位一体交付物体系                            │
└─────────────────────────────────────────────────────────────┘

交付给研发团队的是三件套：

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   ① PRD文档      │  │ ② 高保真仿真原型  │  │ ③ 可交互用例卡片  │
│                  │  │                  │  │                  │
│ 看总体说明：      │  │ 看真实操作：      │  │ 看用例演示：      │
│ • 泳道图          │  │ • 可操作的页面    │  │ • 前置条件        │
│ • 流程图          │  │ • 接近真实的数据  │  │ • 操作步骤（可点） │
│ • 状态机          │  │ • 可闭环的流程    │  │ • 后置条件        │
│ • 信息流          │  │ • 多终端模拟      │  │ • 预期结果        │
│ • 用例说明        │  │                  │  │ • 异常分支        │
│                  │  │                  │  │                  │
│ 目的：理解全局    │  │ 目的：体验真实    │  │ 目的：精确定义    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    降低沟通成本的核心
```

### 5.3 ① PRD文档规范（强化泳道图+信息流）

V5.0主方案的"结构化需求模型(YAML)"是AI内部使用的机器可读格式，但**交付给研发团队的PRD必须是人类可读的文档**，强化五图：

```markdown
# PRD-{模块名}-v{version}.md  — 交付给研发团队的PRD

## §1 版本历史
## §2 目录
## §3 背景与问题陈述
## §4 目标与成功度量
## §5 范围（In-Scope / Non-Goals）
## §6 与既有模块关系（复用边界）

## §7 业务目标映射（BO/BG）

## §8 用户故事

## §9 功能需求列表与用例（FN/UC）
### FN-{系统}-{终端}-001 功能名
- 标准用例表（编号/名称/页面/参与者/优先级/关联BG/自动化类型）
- 前置条件
- 基本流程（分步+[手动]/[系统自动]/[事件驱动]标注）
- 备选流程（分支/异常）
- 数据范围（R/W）
- 后置条件
- 关联UC

## §10 业务规则（BR）

## §11 数据实体（ENT）

## §12 验收标准（双层矩阵）

## §13 指标登记

## §14 五图（强化 — 研发团队理解业务的核心）
### §14.1 业务流程图（flowchart）
  [Mermaid flowchart — 单系统内的业务流程]
### §14.2 信息流转图（跨模块flowchart）★ 强化
  [Mermaid flowchart — 跨系统/跨模块的信息流转，标注信息主体+流转方向+触发条件]
### §14.3 状态机（stateDiagram-v2）+ 状态过渡操作表
  [Mermaid stateDiagram + 表格：当前状态|触发操作|目标状态|操作者|前置约束|后置动作]
### §14.4 业务时序图（sequenceDiagram）
  [Mermaid sequenceDiagram — 系统内角色/模块的时序]
### §14.5 三方接口时序图（含接口路径）
  [Mermaid sequenceDiagram — 与第三方系统的时序，标注接口路径]

## §15 外部接口标注

## §16 CONFIG集中配置清单
## §17 METRIC统计指标清单
## §18 需求深度分析摘要
```

**关键强化点**：
- §14.2 信息流转图必须独立呈现（不能合并到流程图），标注"信息主体+流转方向+触发条件"
- §14.3 状态机必须配套"状态过渡操作表"
- 五图全部Mermaid表达，研发团队可直接渲染

### 5.4 ② 高保真仿真原型规范

高保真仿真原型**不是"代码初版"，而是独立的仿真交付物**：

```yaml
# 高保真仿真原型规范
high_fidelity_sim_prototype:
  definition: |
    可操作、可闭环、接近真实系统的原型。
    研发团队可用来模拟真实业务操作，验证业务流程闭环。
    不是代码初版，而是独立交付的仿真系统。
  
  must_have:
    - "可操作的页面（按钮可点、表单可填、数据可存）"
    - "接近真实的业务数据（不是空页面，有模拟数据）"
    - "可闭环的流程（从开始到结束能跑通，不是半截）"
    - "多终端模拟（PC/H5/APP/小程序，按需求覆盖）"
    - "状态机行为正确（操作后状态变化符合PRD状态机）"
    - "后置条件实现（操作后有对应的数据变化/通知/审核记录）"
    - "菜单导航完整（运营后台菜单统一显示，不出现跳转失效）"
    - "数据保存可用（不是只读，增删改查都能用）"
  
  must_not_have:
    - "不需要真实后端（用sim适配器模拟）"
    - "不需要真实第三方接口（用sim适配器模拟）"
    - "不需要生产级性能优化"
    - "不需要真实鉴权（用Mock鉴权）"
  
  delivery_format:
    - "可运行的dev server（npm run dev）"
    - "访问URL清单（每页面一个URL）"
    - "操作指南（如何登录/如何切换角色/如何触发各场景）"
    - "Demo报告（AI自动生成的截图+流程跑通证据）"
  
  verification:
    runtime_check: "build通过 + dev启动通过 + 页面可访问 + 菜单可跳转 + 数据可保存 + 后置条件生效 + 流程跑通"
    ai_demo: "AI自动执行核心流程并生成Demo报告（截图+录屏+通过/失败+问题清单）"
```

### 5.5 ③ 可交互用例卡片规范（全新设计）

可交互用例卡片是**每张卡片=一个用例的交互式演示**，研发团队可点击操作验证用例：

```yaml
# 可交互用例卡片规范
interactive_use_case_card:
  definition: |
    每张卡片对应一个用例(UC)，以可交互的HTML卡片形式呈现。
    研发团队可：看前置条件 → 按步骤操作 → 看后置条件 → 验证预期结果。
    卡片直接嵌入高保真仿真原型中，操作时联动原型页面。
  
  card_structure:
    header:
      uc_id: "UC-{系统}-{终端}-{NNN}"
      uc_name: "用例名称"
      related_fn: "FN-{系统}-{终端}-{NNN}"
      priority: "P0|P1|P2"
      automation_type: "手动|系统自动|事件驱动"
    
    body:
      preconditions:          # 前置条件（可点击跳转到对应页面状态）
        - "用户已登录"
        - "当前在商品列表页"
        - "已存在至少1个商品"
      
      steps:                  # 操作步骤（可点击触发原型页面操作）
        - step: 1
          action: "点击'新增商品'按钮"
          expected: "弹出新增商品弹窗"
          interactive: true   # 可点击触发
        - step: 2
          action: "填写商品名称='测试商品'、价格=99"
          expected: "表单填写完成"
          interactive: true
        - step: 3
          action: "点击'保存'按钮"
          expected: "弹窗关闭，列表新增一条记录"
          interactive: true
      
      postconditions:         # 后置条件（操作后验证）
        - "商品列表新增一条'测试商品'记录"
        - "商品状态=上架中"
        - "操作日志新增一条'新增商品'记录"
      
      alternatives:           # 备选流程（分支）
        - branch: "商品名称为空"
          trigger: "步骤2未填写名称"
          expected: "保存时提示'商品名称不能为空'"
          interactive: true
      
      exceptions:             # 异常流程
        - exception: "网络断开"
          trigger: "步骤3保存时网络断开"
          expected: "提示'网络异常，请重试'"
          interactive: false  # 异常通常不可交互模拟
    
    footer:
      data_scope: "R: 商品列表 / W: 商品新增"
      related_br: ["BR-{系统}-001"]
      related_sc: ["SC-{系统}-001"]
      last_verified: "2026-07-18 AI运行时验证通过"
  
  interaction_modes:
    - mode: "guided"
      description: "引导式：逐步高亮当前步骤，用户点击'下一步'推进"
      use_when: "研发团队首次理解用例时"
    
    - mode: "free"
      description: "自由式：用户自由操作原型页面，卡片显示当前状态匹配的用例步骤"
      use_when: "研发团队已理解用例，自由验证时"
    
    - mode: "auto_play"
      description: "自动播放：AI自动执行所有步骤，用户观看"
      use_when: "快速浏览所有用例时"
  
  generation:
    source: "BA的产物体系（FN/UC/BR/状态机/业务操作矩阵）"
    generator: "instruction-card-generator.yml（升级版）"
    output: "嵌入高保真仿真原型的HTML卡片组件"
```

### 5.6 instruction-card-generator.yml 升级

现有 `instruction-card-generator.yml` V1.0.0 生成的是"页面用例说明卡+操作用例说明卡"（静态），需升级为V2.0.0生成"可交互用例卡片"：

```yaml
# instruction-card-generator.yml V2.0.0 升级
skill:
  id: "instruction-card-generator"
  version: "2.0.0"
  agents: ["ux-agent", "ba-agent", "fd-agent"]   # 新增fd-agent（卡片需嵌入原型）
  
  upgrade_from_v1:
    - "从静态说明卡 → 可交互HTML卡片"
    - "从独立文档 → 嵌入高保真仿真原型"
    - "从只读 → 可点击操作（guided/free/auto_play三模式）"
    - "从UX/BA生成 → UX/BA/FD协作（BA供数据，UX定布局，FD实现交互）"
  
  workflow:
    - name: "读取需求产物（同V1）"
    - name: "生成用例卡片数据模型（YAML）"
      rule: "每个UC生成一个卡片数据模型，含preconditions/steps/postconditions/alternatives/exceptions"
    - name: "生成卡片HTML组件"
      rule: "基于卡片数据模型，生成React组件，嵌入高保真仿真原型"
    - name: "联动原型页面"
      rule: "卡片的interactive步骤可触发原型页面的对应操作（点击按钮/填写表单等）"
    - name: "运行时验证"
      rule: "AI自动执行每张卡片的auto_play模式，验证步骤可触发+预期结果达成+后置条件生效"
  
  outputs:
    - type: "use-case-card-data"
      format: "YAML"
      description: "用例卡片数据模型"
    - type: "use-case-card-component"
      format: "React组件"
      description: "可交互用例卡片组件，嵌入高保真仿真原型"
    - type: "card-verification-report"
      format: "Markdown"
      description: "AI运行时验证报告（每张卡片是否可交互+预期结果是否达成）"
```

### 5.7 三位一体交付物门禁

```yaml
# handoff阶段门禁 — 三位一体完整性检查
handoff_gates:
  - id: "G-HO-DELIVERY-01"
    name: "PRD五图完整性"
    check: "PRD含泳道图+流程图+状态机+信息流+时序图，全部Mermaid可渲染"
  
  - id: "G-HO-DELIVERY-02"
    name: "高保真仿真原型可用性"
    check: "dev server可启动 + 页面可访问 + 菜单可跳转 + 数据可保存 + 流程可跑通"
  
  - id: "G-HO-DELIVERY-03"
    name: "可交互用例卡片完整性"
    check: "所有UC都有对应卡片 + 卡片可交互 + auto_play验证通过"
  
  - id: "G-HO-DELIVERY-04"
    name: "三位一体一致性"
    check: "PRD的FN/UC ↔ 仿真原型的页面/操作 ↔ 用例卡片的steps，三者编号一致且行为一致"
  
  - id: "G-HO-DELIVERY-05"
    name: "Demo报告"
    check: "AI自动Demo报告含截图+流程跑通证据+问题清单"
```

### 5.8 落地改造清单

| 改造项 | 文件 | 改造内容 |
|--------|------|----------|
| PRD规范强化 | `doc-standards.yml` | §14.2信息流转图独立呈现+§14.3状态机配套操作表 |
| 高保真仿真原型规范 | `common/sim-prototype-standards.yml`（新建V1.0.0） | 定义must_have/must_not_have/delivery_format/verification |
| 用例卡片规范 | `common/use-case-card-standards.yml`（新建V1.0.0） | 卡片结构+三模式交互+数据模型 |
| instruction-card-generator升级 | `configs/skills/instruction-card-generator.yml` | V1.0.0→V2.0.0，从静态卡→可交互HTML卡片 |
| handoff.yml增强 | `configs/workflows/handoff.yml` | 新增三位一体交付物门禁G-HO-DELIVERY-01~05 |
| gates-registry.yml | `gates-registry.yml` | 新增G-HO-DELIVERY-01~05 |
| FD Agent增强 | `agents/fd-agent.md` | FD需将用例卡片嵌入高保真仿真原型 |
| 知识库补充 | `common/post-condition-specs/` | 用例卡片的后置条件实现规范 |

---

## 六、总体落地路线图

### 6.1 改造任务汇总

| 议题 | 新建文件 | 修改文件 | 新建Skill | 新建门禁 |
|------|---------|---------|-----------|---------|
| 议题一：AI人性化确认 | human-confirm-protocol.yml, human-confirm-handler.yml | pm-agent.md/yml, iron-rules-registry.yml, redlines.yml, config.yml | human-confirm-handler | RL-SUP-03 |
| 议题二：脑暴→PO衔接 | po-planning-flow.yml | brainstorm.yml, project-lifecycle.yml, po-agent.md, gates-registry.yml, config.yml | — | G-BS-HO-01~03, G-PO-01~04 |
| 议题三：四层价值+7要素 | value-assessment-standards.yml, value-assessor.yml | po-agent.md, doc-standards.yml, gates-registry.yml | value-assessor | G-PO-01更新 |
| 议题四：Sprint拆解 | sprint-planning-standards.yml, sprint-planner.yml | po-planning-flow.yml, project-lifecycle.yml, gates-registry.yml, knowledge-sedimentation.yml | sprint-planner | G-SPRINT-01~04 |
| 议题五：三位一体交付 | sim-prototype-standards.yml, use-case-card-standards.yml | doc-standards.yml, instruction-card-generator.yml, handoff.yml, fd-agent.md, gates-registry.yml | — | G-HO-DELIVERY-01~05 |

**汇总**：新建10个文件，修改15+个文件，新建3个Skill，新增15条门禁，新增1条红线。

### 6.2 实施顺序（依赖关系驱动）

```
Phase 1（基础层 — 无依赖，可并行）：
  ├─ 议题一：human-confirm-protocol.yml + human-confirm-handler.yml
  ├─ 议题三：value-assessment-standards.yml + value-assessor.yml
  └─ 议题五：sim-prototype-standards.yml + use-case-card-standards.yml

Phase 2（流程层 — 依赖Phase 1）：
  ├─ 议题二：po-planning-flow.yml（引用议题三的价值评估+议题一的确认机制）
  └─ 议题四：sprint-planning-standards.yml + sprint-planner.yml（依赖议题二的PO流程）

Phase 3（集成层 — 依赖Phase 2）：
  ├─ project-lifecycle.yml（集成po-planning-flow + Sprint循环 + 确认机制）
  ├─ brainstorm.yml（增强交接清单）
  ├─ handoff.yml（三位一体门禁）
  └─ 各Agent.md（po/bs/pm/ba/ux/fd增强）

Phase 4（注册层）：
  ├─ gates-registry.yml（新增15条门禁）
  ├─ iron-rules-registry.yml（新增确认机制铁律）
  ├─ redlines.yml（新增RL-SUP-03）
  ├─ config.yml（注册全部新引用）
  └─ 流程版本变更总账.md（记录本次变更）
```

### 6.3 与V5.0主方案的关系

| V5.0主方案章节 | 本补充方案的增强 |
|---------------|-----------------|
| 第三章 流程重构 | 补充脑暴→PO→Sprint 0的前置阶段（议题二）；补充Sprint循环结构（议题四） |
| 第四章 AI边界 | 补充"必须人确认"的具体交互机制（议题一） |
| 第五章 AI能力增强 | 补充用例卡片生成能力（议题五）；补充价值评估能力（议题三） |
| 第二章 知识库重构 | 新增6个规范文件（human-confirm/value-assessment/sprint-planning/sim-prototype/use-case-card + 各自standards） |
| 第六章 AI学习进化 | Sprint级学习记录（议题四的Retrospective） |

### 6.4 验收标准

本补充方案落地后，需满足：

1. **脑暴→PO→需求探索全流程可跑通**：从`/brainstorm --brainstorm-type=strategic`开始，经PO规划，进入Sprint 0需求探索，无断点
2. **AI确认有7种询问类型**：所有需人确认的决策点都按human-confirm-protocol构造询问，无Y/N二选一
3. **Backlog含四层价值+7要素**：PO产出的Backlog每项都有完整的价值评估和7要素影响分析
4. **Sprint拆解有DoD**：每Sprint有明确的DoD，Sprint间依赖显式管理
5. **交付三位一体**：handoff时PRD(五图)+高保真仿真原型+可交互用例卡片三件套齐全且一致

---

## 七、待用户确认事项

本方案涉及多个设计决策，需用户确认后才能进入实施：

| 序号 | 确认事项 | AI推荐 | 置信度 |
|------|---------|--------|--------|
| 1 | 议题一的7种询问类型是否完整？是否需要增减？ | 7种足够覆盖 | medium |
| 2 | 议题二的PO规划workflow是否独立为po-planning-flow.yml？ | 独立（与brainstorm.yml平级） | high |
| 3 | 议题三的四层价值权重默认 商业0.3+交付0.2+客户0.3+闭环0.2 是否合理？ | 合理，可调 | medium |
| 4 | 议题三的公司7要素是否就是 运营/资源/财务/渠道/业务/组织/技术 这7个？ | 是 | medium（用户提到的7要素需确认是否还有其他） |
| 5 | 议题四的Sprint拆解5种策略是否足够？ | 足够，混合策略可覆盖复杂场景 | high |
| 6 | 议题四的DoD包含"运行时验证通过"是否过严？ | 不过严，这是V5.0核心原则 | high |
| 7 | 议题五的用例卡片三模式（guided/free/auto_play）是否需要简化？ | 保留三模式，研发团队按需选择 | medium |
| 8 | 议题五的高保真仿真原型"不需要真实后端"是否与用户预期一致？ | 是，用sim适配器模拟 | high |
| 9 | 实施顺序Phase 1-4是否合理？ | 合理，依赖关系驱动 | high |
| 10 | 是否在本方案确认后立即进入实施？ | 是 | high |

---

**文档结束**。等待用户对第七章待确认事项的反馈后，进入实施阶段。
