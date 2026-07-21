# learn-project 与 learn-domain 能力融合设计方案

> **版本**：V1.0.0 | **创建日期**：2026-07-17  
> **状态**：待讨论审阅  
> **影响范围**：learn-project.yml / learn-domain.yml / DOMAIN-INDEX.yml / _TEMPLATE.yml / config.yml / command-spec.yml / ba-agent.md

---

## 一、核心设计思想

### 1.1 一句话定位

**学习方法论统一，目的不同**：
- learn-project：给了现有项目所有文档，目的是通过学习方法论**最大可能还原**为PRD
- learn-domain：通过外网链接，目的是通过学习方法论**最大可能学到**行业标准/第三方标准

### 1.2 三层架构

```
第一层：领域分类新增"第三方"
  domains/thirdparty/  ← 新增大类
    ├─ yeepay/          易宝
    ├─ wechat-pay/      微信支付
    ├─ alipay/          支付宝
    └─ ...              按第三方拆子领域

第二层：API学习技能独立化
  api-learner（独立技能，条件触发）
    ├─ 触发条件：来源含接口文档（--api / --source=api-endpoint / 网页含API参数表）
    ├─ Part12 API参数字典
    ├─ Part13 参数流转图
    └─ 接口参数级校验（8项）
  → 仅接口文档来源时触发，非接口文档不触发

第三层：最终目的统一
  所有学习流程最终产出：
    7部分业务产物（泳道/流程/信息流/矩阵/规则/动作/状态机）
    7项业务分析建模（场景/泳道/流程/信息流/状态机/矩阵/时序）
    API映射（如有API学习技能触发）：接口名称×业务场景映射+调用顺序
```

---

## 二、统一学习方法论（7步）

两个流程共享同一套7步方法论，各自增加特有配置：

```
Step1: 来源处理（10种来源统一处理）
Step2: AI智能整理主题
Step3: AI智能整理场景
Step4: 业务产物提取（7部分）          ← 所有流程的最终目的
Step4.5: [条件触发] API学习技能        ← 仅来源含接口文档时触发
Step4.6: 业务分析建模（7项）           ← 所有流程都执行，API映射融入此步
Step5: 接口顺序校验（如有API）
Step6: 专家Review + 用户确认 + 强化深入学习
Step7: 产出输出
```

### 2.1 各步骤详细对比

| 步骤 | learn-project | learn-domain | 统一性 |
|------|--------------|--------------|--------|
| Step1 来源处理 | 10种来源（含Axure HTML深度解析） | 3种来源（https/video/file），可扩展到10种 | **统一10种来源处理**，learn-domain补齐 |
| Step1.5 领域匹配预检 | ❌ 无 | ✅ 4种场景判断 | learn-domain特有保留 |
| Step2 AI智能整理主题 | ❌ 当前无（需补） | ✅ 已有 | **统一**，learn-project补齐 |
| Step3 AI智能整理场景 | ❌ 当前无（需补） | ✅ 已有 | **统一**，learn-project补齐 |
| Step4 业务产物提取（7部分） | ✅ 通过Stage2.5业务分析建模产出 | ✅ 已有 | **统一7部分** |
| Step4.5 API学习技能 | ❌ 当前无（需补） | ✅ 已有Part12/Part13 | **统一为独立技能，条件触发** |
| Step4.6 业务分析建模（7项） | ✅ 已有Stage2.5（7项分析） | ✅ Step4产物已含 | **统一7项** |
| Step5 接口顺序校验 | ❌ 当前无（需补） | ✅ 已有8项参数级校验 | **统一**，learn-project补齐 |
| Step6 专家Review | ✅ 10项（BA8+Arch2） | ✅ 11项（BA8+Arch3） | **统一11项**（含参数完整性） |
| Step6 强化深入学习 | ❌ 当前无（需补） | ✅ 6选项 | **统一7选项**（+g强化页面/模块） |
| Step7 产出输出 | PRD (.md, 17章) | 领域知识 (.yml, 13部分) | 产出格式不同，目的不同 |

---

## 三、第一层：领域分类新增"第三方"

### 3.1 新增分类

```yaml
# learn-domain.yml categories 新增
- { id: "thirdparty", name: "第三方", description: "第三方API文档学习（易宝/微信支付/支付宝/微信小程序/支付宝小程序等），按第三方拆子领域" }
```

### 3.2 DOMAIN-INDEX.yml 新增预定义领域

```yaml
# ============================================
# 第三方（thirdparty）← 新增大类
# ============================================
- { category: "thirdparty", name: "易宝服务商", file: "thirdparty/yeepay-service-provider.yml", version: "v2.1.0", keywords: ["易宝", "yeepay", "fwssfk", "特约商户入网", "RSA密钥", "绑卡", "开户", "聚合支付", "requestNo", "merchantNo"] }
- { category: "thirdparty", name: "微信支付", file: "thirdparty/wechat-pay.yml", version: "", keywords: ["微信支付", "JSAPI", "Native", "APP支付", "mch_id"] }
- { category: "thirdparty", name: "支付宝", file: "thirdparty/alipay.yml", version: "", keywords: ["支付宝", "沙箱", "当面付", "app_id"] }
- { category: "thirdparty", name: "微信小程序", file: "thirdparty/wechat-miniprogram.yml", version: "", keywords: ["微信小程序", "wx.login", "wx.request", "openid"] }
- { category: "thirdparty", name: "支付宝小程序", file: "thirdparty/alipay-miniprogram.yml", version: "", keywords: ["支付宝小程序", "my.getAuthCode", "auth_code"] }
```

### 3.3 已有易宝领域知识迁移

当前 `payment/yeepay-service-provider.yml` 迁移到 `thirdparty/yeepay-service-provider.yml`：
- 物理文件移动：`domains/payment/yeepay-service-provider.yml` → `domains/thirdparty/yeepay-service-provider.yml`
- DOMAIN-INDEX.yml 更新：category 从 `payment` 改为 `thirdparty`
- 历史版本保留在原路径（不删除）

### 3.4 thirdparty分类的特殊性

| 维度 | thirdparty 分类 | 其他15个分类 |
|------|----------------|-------------|
| 来源类型 | 接口文档（API Docs） | 业务流程文档/行业规范 |
| API学习技能 | **必然触发**（来源都是接口文档） | 条件触发（来源含接口文档时） |
| Part12/Part13 | **必有** | 条件有 |
| 学习目的 | 提取API参数+参数流转+调用顺序，映射到业务场景 | 学习行业标准业务流程/规则/状态机 |
| 子领域拆分 | 按第三方公司拆（易宝/微信/支付宝） | 按业务子域拆（退款/退货/分账/结算） |

---

## 四、第二层：API学习技能独立化（公共化）

### 4.1 公共定义文件

API学习技能已抽取为**公共知识文件**，位于 `knowledge/common/api-learner.yml`，同时注册了对应的 skill 文件 `configs/skills/api-learner.yml`。

**文件清单**：

| 文件 | 定位 | 说明 |
|------|------|------|
| `knowledge/common/api-learner.yml` | 公共知识规则定义 | 触发条件+3阶段处理流程+12种语义角色+5种来源类型+8项校验+服务目标+质量指标 |
| `configs/skills/api-learner.yml` | 技能注册 | agents=[ba-agent,arch-agent] / inputs/outputs/dependencies |

**config.yml 注册**：
```yaml
api_learner: ".codebuddy/knowledge/common/api-learner.yml"  # V3.4.0新增
```

### 4.2 触发条件（5种，满足任一即触发）

| # | 条件 | 说明 |
|---|------|------|
| 1 | 来源包含 `--api=外部接口文档.md` | 用户显式提供接口文档文件 |
| 2 | 来源包含 `--source=api-endpoint:https://...` | 用户提供API端点URL |
| 3 | 抓取内容中检测到API参数表 | 页面含请求/响应参数表 / JSON Schema / OpenAPI规范 |
| 4 | `--deep-params` 参数显式指定 | 用户强制开启深度参数提取 |
| 5 | 领域分类=`thirdparty` | 第三方API文档学习必然触发 |

### 4.3 处理流程（3阶段）

**阶段A：API参数深度提取 → Part12 API参数字典**

提取内容：
- 输入参数（13个字段：field/type/required/max_length/description/enum_values/default/source_type/source_api/source_field/encryption/validation/semantic_role）
- 输出参数（7个字段：field/type/description/enum_values/nullable/downstream_usage/semantic_role）
- 异步通知参数（notification_event/params/correlation_field）
- 错误码（code/message/handling）

12种参数语义角色：PRIMARY_KEY / IDEMPOTENT_KEY / AMOUNT / STATUS / SENSITIVE / TIMESTAMP / SIGNATURE / REFERENCE / BUSINESS_PARAM / PAGINATION / QUERY_FILTER / RESPONSE_META

5种参数来源类型：user_input / upstream_api / system_generated / config / computed

**阶段B：参数流转图 → Part13 参数流转图**

分析内容：
- 场景内参数流转（A出参→B入参映射）
- 跨场景参数流转
- 参数来源溯源（关键参数完整来源链）
- 参数依赖矩阵（行=消费者API，列=生产者API）
- 参数×状态机关联
- 参数×业务规则关联
- 参数安全分析（敏感字段/幂等键/金额字段/签名）

**阶段C：参数级校验 → 参数流转校验报告**

8项校验：
1. 参数来源一致性校验（error）
2. 参数类型匹配校验（error）
3. 必填参数可达性校验（error）
4. 幂等键唯一性校验（warning，Arch关注）
5. 敏感字段加密校验（error，Arch关注）
6. 金额字段校验（warning，Arch关注）
7. 参数-状态机一致性校验（error）
8. 参数-业务规则一致性校验（error）

### 4.4 产出服务目标（API学习技能的输出如何服务于业务建模）

API学习技能的输出最终服务于：

**服务于7部分业务产物**：

| 业务产物 | API学习技能如何服务 |
|---------|-------------------|
| 业务泳道图 | API操作映射到角色×阶段×动作 |
| 业务流程 | API调用顺序映射到流程节点（标注接口路径） |
| 信息流 | API入参/出参映射到信息主体的key_fields |
| 业务操作矩阵 | API操作映射到角色×状态×操作单元格 |
| 业务规则 | API参数中的校验规则映射到BR |
| 业务动作 | 每个API调用映射为一个业务动作(ACT) |
| 状态机 | API参数中的STATUS语义角色映射到状态转换 |

**服务于7项业务分析建模**：

| 业务分析建模项 | API学习技能如何服务 |
|---------------|-------------------|
| 场景识别与分类 | API按业务场景分组（场景×API映射表） |
| 场景流程泳道图 | API调用顺序融入泳道图节点（标注调用的API） |
| 业务流程图 | API调用作为流程节点（标注接口路径） |
| 信息流分析 | API出参→下游API入参的参数流转关系 |
| 业务状态机 | API参数中的STATUS语义角色映射到状态转换触发条件 |
| 业务操作矩阵 | API操作映射到角色×状态×操作 |
| 时序流 | API调用顺序直接作为时序图的消息 |

**API映射（核心产出）**：
- 接口名称×业务场景映射表（每个业务场景涉及哪些API）
- 调用顺序图（API调用先后顺序，Mermaid sequenceDiagram）
- 参数流转链（A出参→B入参的完整链路）

### 4.5 调用方引用方式

```yaml
# learn-domain 引用
learn_domain:
  trigger: "Step4.5（条件触发）"
  note: "领域分类=thirdparty时必然触发；其他分类条件触发"
  output_integration: "Part12/Part13写入领域知识.yml的api_param_dictionary和param_flow部分"

# learn-project 引用
learn_project:
  trigger: "Stage2.3（条件触发）"
  note: "项目文档含接口文档时触发"
  output_integration: "Part12/Part13写入PRD的§16外部接口标注章节+§17需求深度分析摘要"
```

### 4.6 质量指标

| 指标 | 公式 | 目标 |
|------|------|------|
| 参数提取覆盖率 | 有参数定义的API数/总API数 | ≥80% |
| 参数流转完整度 | 已建立流转的参数数/应流转参数数 | ≥85% |
| 参数-状态机关联数 | 参数与状态机的关联数量 | — |
| 参数-业务规则关联数 | 参数与业务规则的关联数量 | — |
| 安全风险项数 | 敏感字段未加密/幂等键来源不当/金额缺少校验等 | 0 |

---

## 五、两个流程的能力对齐清单

### 5.1 learn-project 需补齐的能力（从 learn-domain 引入）

| # | 能力 | 来源 | 补齐方式 |
|---|------|------|---------|
| 1 | AI智能整理主题 | learn-domain Step2 | 新增Stage1.8（Step1后Step2前） |
| 2 | AI智能整理场景 | learn-domain Step3 | 新增Stage1.9（Step1.8后Step2前） |
| 3 | API学习技能 | learn-domain Step4.5 | 新增Stage2.3（Step2.5后Stage3前），条件触发 |
| 4 | 接口参数级校验 | learn-domain Step5 | 融入Stage2.3（API学习技能内） |
| 5 | 强化深入学习 | learn-domain Step7 | 新增Stage5.8（Review后交付前），7选项 |
| 6 | 10种来源统一处理 | learn-domain已有3种 | learn-project已有10种，保持不变 |
| 7 | --focus参数 | learn-domain | 新增--focus可选参数 |
| 8 | --deep-params参数 | learn-domain | 新增--deep-params可选参数 |

### 5.2 learn-domain 需补齐的能力（从 learn-project 引入）

| # | 能力 | 来源 | 补齐方式 |
|---|------|------|---------|
| 1 | 10种来源统一处理 | learn-project已有10种 | learn-domain从3种扩展到10种 |
| 2 | Axure HTML深度解析 | learn-project Stage1 | learn-domain Step1新增Axure检测 |
| 3 | 需登录网站支持 | learn-project --cookie/--auth | learn-domain新增--cookie/--auth参数 |
| 4 | PDF/Word/PPT/Excel格式 | learn-project Stage1 | learn-domain Step1扩展格式支持 |
| 5 | 图片AI识别 | learn-project Stage1 | learn-domain已有（V1.4.0） |
| 6 | 音频ASR | learn-project Stage1 | learn-domain新增audio来源 |
| 7 | doc-standards合规检查 | learn-project Stage4 | learn-domain不适用（产出是.yml不是.md），跳过 |
| 8 | 多卷拆分合并 | learn-project Stage3/3.5 | learn-domain不适用（单文件），跳过 |

### 5.3 两者保留的特有能力（不对齐）

| learn-project特有 | learn-domain特有 |
|-------------------|------------------|
| 忠实还原铁律(FR-01~06) | 领域匹配预检(Step1.5) |
| doc-standards合规检查 | 增量学习(--incremental) |
| 多卷拆分合并 | 版本管理(语义化版本) |
| Axure HTML深度解析 | 三库写入(领域+规则+编码) |
| /rebuild回投脑暴 | --focus需求说明 |
| | 领域分类体系(16大类含thirdparty) |

---

## 六、强化深入学习统一（7选项）

### 6.1 统一选项

| 选项 | 说明 | learn-project | learn-domain |
|------|------|---------------|--------------|
| a) 强化主题 | 提供更多URL，深入某主题 | ✅ | ✅ |
| b) 强化场景 | 补充更多API/页面文档 | ✅ | ✅ |
| c) 强化业务规则 | 手动补充业务规则 | ✅ | ✅ |
| d) 强化状态机 | 补充状态转换规则 | ✅ | ✅ |
| e) 修正接口顺序 | 手动修正错误顺序 | ✅（如有API） | ✅ |
| f) 强化API参数 | 补充参数文档URL，深度提取参数 | ✅（如有API） | ✅ |
| g) 强化页面/模块 | 补充更多页面/模块文档 | ✅ | ❌ |

### 6.2 执行规则

- 强化学习不递增版本号（同版本内完善）
- 强化学习完成后重新执行Review + 用户确认
- 循环直到用户确认"通过"
- 选项f)和e)仅在API学习技能已触发时可用

---

## 七、下游与 requirement-flow 关系优化

### 7.1 统一加载时机

```
/init 时统一加载（stage-00 / §0.3 上下文加载）：
  ├─ learn-project 产出（项目PRD）：
  │   用途：作为需求输入基础（存量项目基线）
  │   - 存量项目：PRD作为需求上下文
  │   - requirement-flow §0.5b 影响分析时对比存量PRD（8维影响扫描）
  │   - 新项目：无PRD，跳过
  │
  ├─ learn-domain 产出（领域知识）：
  │   用途：作为行业标准参考
  │   - 所有项目都加载（关键词+AI语义匹配）
  │   - requirement-flow §0.5a 深度分析时引用Part12/Part13
  │   - 脑暴 stage-0c 也加载（继承清单给BA）
  │
  └─ 两者关系：
      learn-project 产出 = "这个项目当前长什么样"（存量基线）
      learn-domain 产出 = "行业标准长什么样"（参考标杆）
      requirement-flow §0.5 = 对比"行业标准×项目存量×新需求"三方对齐
```

### 7.2 加载优先级（优化）

```
/init 上下文加载优先级（9项）：
  1. 项目骨架 projects/{project}/
  2. 已学PRD .codebuddy/knowledge/{project}/需求文档/  ← learn-project产出
  3. 版本沉淀 .codebuddy/knowledge/{project}/版本沉淀/
  4. 经验库 .codebuddy/knowledge/common/经验库/
  5. PO Backlog（如有）
  6. 脑暴确认稿
  7. 领域知识 .codebuddy/knowledge/domains/  ← learn-domain产出（含thirdparty/）
  8. 跨版本反馈
  9. 行业统计指标规则 metrics-standards.yml
```

---

## 八、learn-project 步骤重构

### 8.1 V5.0.0 → V6.0.0 步骤对比

```
V5.0.0（当前）：
Stage1: 多来源深度抓取与资源清单
Stage1.5: 领域知识加载
Stage2: 逐文件忠实提取（doc-splitter全文加载）
Stage2.5: 业务分析与建模（7项分析）
Stage3: 卷间关联与索引构建
Stage3.5: 整卷合并与统一编排
Stage4: doc-standards合规检查
Stage5: 学习报告与问题清单
Stage5.5: 专家Review（10项）
Stage5.7: PM展示Review汇总+用户确认
Stage6: 交付确认

V6.0.0（升级后）：
Stage1: 多来源深度抓取与资源清单（10种来源统一处理）
Stage1.5: 领域知识加载
Stage1.8: AI智能整理主题（V6.0.0新增，从learn-domain引入）
Stage1.9: AI智能整理场景（V6.0.0新增，从learn-domain引入）
Stage2: 逐文件忠实提取（doc-splitter全文加载，忠实还原铁律贯穿）
Stage2.3: [条件触发] API学习技能（V6.0.0新增，来源含接口文档时触发）
  ├─ Part12 API参数字典
  ├─ Part13 参数流转图
  └─ 接口参数级校验（8项）
Stage2.5: 业务分析与建模（7项分析，API映射融入此步）
Stage3: 卷间关联与索引构建
Stage3.5: 整卷合并与统一编排
Stage4: doc-standards合规检查
Stage5: 学习报告与问题清单
Stage5.5: 专家Review（11项，统一含参数完整性）
Stage5.7: PM展示Review汇总+用户确认
Stage5.8: 强化深入学习（V6.0.0新增，7选项循环）
Stage6: 交付确认
```

---

## 九、learn-domain 步骤重构

### 9.1 V2.1.0 → V3.0.0 步骤对比

```
V2.1.0（当前）：
Step1: 获取信息（3种来源）
Step1.5: 领域匹配预检
Step2: AI智能整理主题
Step3: AI智能整理场景
Step4: 业务产物提取（7部分）
Step4.5: API参数深度提取与场景流程融合
Step5: 接口参数级校验
Step6: 专家Review（11项）
Step7: Review汇总+用户确认+强化深入学习（6选项）
Step8: 写入三库+更新索引

V3.0.0（升级后）：
Step1: 来源处理（10种来源统一处理，V3.0.0从3种扩展到10种）
  ├─ 新增：local-dir/file/api-endpoint/paste/audio/image/pdf/website
  ├─ 新增：Axure HTML深度解析
  └─ 新增：需登录网站(--cookie/--auth)
Step1.5: 领域匹配预检（保留，新增thirdparty分类判断）
Step2: AI智能整理主题（保留）
Step3: AI智能整理场景（保留）
Step4: 业务产物提取（7部分）（保留）
Step4.5: API学习技能（V3.0.0从内嵌步骤改为独立技能引用，触发条件统一）
  ├─ 触发条件统一：来源含接口文档 / --deep-params / 分类=thirdparty
  ├─ Part12 API参数字典
  ├─ Part13 参数流转图
  └─ 接口参数级校验（8项）
Step4.6: 业务分析建模（7项）（V3.0.0新增，从learn-project引入，API映射融入）
Step5: 接口顺序校验（保留，如有API）
Step6: 专家Review（11项）（保留）
Step7: Review汇总+用户确认+强化深入学习（7选项，V3.0.0新增g强化页面/模块对领域不适用保持6+1）
Step8: 写入三库+更新索引（保留）
```

---

## 十、影响范围与联动文件

### 10.1 需修改的文件

| # | 文件 | 修改内容 | 版本变化 |
|---|------|---------|---------|
| 1 | `learn-project.yml` | 补AI主题/场景/API学习技能/强化学习+来源统一+Review11项 | V5.0.0→V6.0.0 |
| 2 | `learn-domain.yml` | 来源从3种扩展到10种+API学习技能独立化+业务分析建模7项+thirdparty分类 | V2.1.0→V3.0.0 |
| 3 | `DOMAIN-INDEX.yml` | 新增thirdparty分类+预定义5个第三方领域+易宝迁移 | V1.2.0→V1.3.0 |
| 4 | `_TEMPLATE.yml` | 对齐V3.0.0产物结构（13部分不变，API学习技能条件触发标注） | V1.6.0→V1.7.0 |
| 5 | `config.yml` | 命令描述更新+thirdparty分类注册 | V3.3.0→V3.4.0 |
| 6 | `command-spec.yml` | learn-project新增--focus/--deep-params+learn-domain来源扩展到10种 | V1.1.0→V1.2.0 |
| 7 | `ba-agent.md` | 领域知识加载更新（含thirdparty分类说明） | V3.1.0→V3.2.0 |
| 8 | `~/.codebuddy/commands/learn-project.md` | 命令模板更新 | - |
| 9 | `~/.codebuddy/commands/learn-domain.md` | 命令模板更新 | - |

### 10.2 需迁移的文件

| # | 操作 | 说明 |
|---|------|------|
| 1 | `domains/payment/yeepay-service-provider.yml` → `domains/thirdparty/yeepay-service-provider.yml` | 易宝从payment迁移到thirdparty |

### 10.3 不需修改的文件

| 文件 | 原因 |
|------|------|
| `requirement-flow.yml` | 下游加载关系已在V3.0.0定义，无需改 |
| `project-lifecycle.yml` | 加载时机已在V4.2.0定义，无需改 |
| `metrics-standards.yml` | 不受影响 |

---

## 十一、待确认问题

1. **易宝迁移**：当前 `payment/yeepay-service-provider.yml` 迁移到 `thirdparty/yeepay-service-provider.yml`，是否需要物理移动文件？还是只在 DOMAIN-INDEX.yml 中改 category？

2. **learn-project 引入AI主题/场景提取**：learn-project 的忠实还原铁律约束的是"内容提取不删减/不纠偏/不推测"，AI主题提取是在忠实提取的基础上增加分析视角。你是否认同这个边界？

3. **thirdparty分类的领域匹配预检**：当 `--category=thirdparty` 时，领域匹配预检是否需要特殊处理（如直接跳过匹配，按子领域名称直接学习）？

---

> **API学习技能已公共化**：`knowledge/common/api-learner.yml`（公共定义）+ `configs/skills/api-learner.yml`（技能注册）+ `config.yml`（注册引用）。  
> **请审阅本方案，确认或调整后我再实施落地。**
