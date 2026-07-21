# 场景驱动学习法（Scenario-Driven Learning）V1.0.0

## 一、核心理念

传统领域学习是「文档翻译式」——将官方API文档逐条翻译为YAML，AI不思考场景、不推理需求、不衔接上下流。
**场景驱动学习法**则模拟人类学习新系统的真实过程：

```
人类学习路径：先理解"它能解决什么问题" → 再看"怎么做" → 最后查"API怎么调"
传统学习路径：先罗列所有API → 再看参数定义 → 用户自己拼场景
```

### 北极星原则

> **不罗列能力，而是从问题出发，找到场景，串联能力。**

---

## 二、与传统学习法的对比

| 维度 | 传统文档翻译式 | 场景驱动学习法 |
|:--|:--|:--|
| 入口 | API列表 → 参数定义 | 业务问题 → 场景 → API能力 |
| AI角色 | 信息搬运工 | 场景推理者 + 能力匹配者 |
| 产物结构 | 按API组织 | 按场景×问题组织 |
| 跨域衔接 | 无（孤立领域） | 内置跨域连接点 |
| 下游可用性 | 需要自己拼凑 | 脑暴/规划/需求/架构直接引用 |

---

## 三、六步学习流程

### Step 1: 问题发散（Problem Discovery）
AI基于产品描述，发散推理该三方服务能解决的**核心业务问题**。
- 提示词框架：「这个服务能帮企业解决什么问题？如果不做这件事，企业损失了什么？」
- 输出：业务问题清单（按价值排序）

### Step 2: 场景构建（Scenario Construction）
对每个问题，构建完整的业务场景闭环：
- 触发条件 → 执行流程 → 结果处理 → 后续动作
- 标注每个节点的角色、信息输入输出
- 输出：场景图谱（Scenario Graph）

### Step 3: API能力匹配（API Capability Matching）
对每个场景节点，匹配需要的API能力，标注：
- 确切需要哪个API（从官方文档匹配）
- API调用顺序（先后依赖关系）
- 参数来源（从场景上游哪个节点产出）
- 输出：场景×API映射矩阵 + API时序图

### Step 4: 跨域衔接（Cross-Domain Bridging）
识别该三方服务与已有领域知识的连接点：
- 与已学习的第三方（企业微信、支付等）的交互点
- 与SCRM业务域（客户管理、标签、跟进）的融合点
- 数据闭环设计（从哪里来、到哪里去）
- 输出：跨域衔接图谱

### Step 5: 角色视角提炼（Role-View Extraction）
为不同下游角色提炼专属视角：
- **脑暴视角**：该服务打开的可能性空间（「有了X能力，我们可以做Y」）
- **产品规划（PO）视角**：商业价值评估、优先级、资源预估
- **需求分析（BA）视角**：功能清单、用例候选、约束条件
- **架构（Arch）视角**：技术选型、鉴权方案、数据流、性能边界
- 输出：角色决策支持卡

### Step 6: API文档补全（API Reference）
在场景和问题都明确之后，才进行标准API文档补全：
- Part12 参数字典
- Part13 参数流转图
- 与传统模板的 Part1~5（泳道/流程/信息流/操作矩阵/方案）对齐

---

## 四、产物结构（扩展模板）

```yaml
domain:
  name: ""
  learning_method: "scenario_driven"  # 标记使用场景驱动法
  
  # === 新增：核心业务问题（Step1） ===
  business_problems:
    - id: "BP-001"
      problem: ""           # 企业面临的业务问题
      pain_point: ""        # 痛点描述
      value: ""             # 解决后的价值
      
  # === 新增：场景驱动地图（Step2+3） ===
  scenario_maps:
    - scene_id: "SC-001"
      scene_name: ""        # 场景名称
      problem_ref: ""       # 关联业务问题
      trigger: ""           # 触发条件
      participant_roles: [] # 参与角色
      # API能力链：按执行顺序排列
      api_chain:
        - seq: 1
          api_name: ""
          purpose: ""       # 业务目的（非技术描述）
          inputs_from: ""   # 输入来源（上游API/用户/系统）
          outputs_to: ""    # 输出去向（下游API/系统）
      # 异常与边界
      exceptions: []
      boundaries: []        # 系统边界（什么不归它管）
      # 场景衔接
      pre_scene: ""         # 上游场景
      post_scene: ""        # 下游场景
      mermaid: ""           # 场景时序图

  # === 新增：跨域衔接设计（Step4） ===
  cross_domain_bridge:
    connections:
      - target_domain: ""   # 对接领域
        connection_type: "" # data_flow / event_trigger / api_call / identity_bridge
        scenario_refs: []   # 关联场景
        integration_point: "" # 具体对接点
        mermaid: ""         # 跨域数据流
    dependency_matrix: []   # 领域间依赖矩阵

  # === 新增：角色决策支持卡（Step5） ===
  role_views:
    brainstorm:
      possibilities: []     # 该服务打开的可能性空间
    product_planning:
      business_value: ""    # 商业价值评估
      priority: ""          # 建议优先级
      resource_estimate: "" # 资源预估
    requirements:
      feature_candidates: [] # 备选功能清单
      constraints: []       # 约束条件
    architecture:
      auth_scheme: ""       # 鉴权方案
      data_boundaries: {}   # 数据边界
      performance: {}       # 性能特征
      tech_stack: []        # 建议技术栈

  # === 标准API文档（Step6，复用现有模板） ===
  swimlane: ...            
  flow: ...
  info_flow: ...
  operation_matrix: ...
  solution: ...
  api_integration: ...
  api_param_dictionary: ...
  param_flow: ...
```

---

## 五、AI推理增强规则

1. **主动发散**：不仅记录文档写明的能力，还要推理暗示的能力
   - 例：文档说「支持回调通知」→ AI推理「可以构建实时状态同步」「可以做外呼结果自动触发后续动作」
   
2. **场景闭环**：每个场景必须讲完整故事——触发→执行→结果→后续
   - 不允许出现「调用API创建任务」这种断头描述

3. **合理性约束**：发散必须有据可依，不能天马行空
   - 每个推演标注依据来源（文档明确 / 行业惯例 / AI推理）

4. **跨域优先**：优先思考与已有知识库的连接点
   - 加载当前 projects/{project} 已使用的所有第三方服务
   - 对每个连接点做深度推理

5. **角色ROI**：每个角色只看到自己关心的内容
   - 脑暴看可能性，不看API参数
   - 架构看技术边界，不看话术设计

---

## 六、与传统模板的兼容性

场景驱动学习产物与 `_TEMPLATE.yml` V1.6.0 **向下兼容**：
- 新增的 `business_problems` / `scenario_maps` / `cross_domain_bridge` / `role_views` 四个区块为扩展区
- 传统的 `swimlane` / `flow` / `info_flow` / `operation_matrix` / `solution` / `api_integration` / `api_param_dictionary` / `param_flow` 全部保留
- 下游读取时优先使用新增区块（提供高层视图），传统区块作为API参考后备

---

## 七、适用场景

| 适用 | 不适用 |
|:--|:--|
| 第三方API服务（特别是需要集成到产品中的） | 纯业务领域（如「电商退款流」，不需要API视角） |
| 多领域交叉学习 | 纯理论/概念性知识 |
| 为脑暴/产品规划提供输入 | 已有成熟方案无需创新 |

---

*版本：V1.0.0 | 创建日期：2026-07-20 | 设计者：AI-SCRM团队*
