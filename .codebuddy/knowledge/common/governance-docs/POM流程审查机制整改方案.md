# POM 流程审查机制整改方案

> **文档类型**：流程治理整改方案
> **编制日期**：2026-07-16
> **整改原则**：每一阶段必须有 review 环节，review 由对应阶段的专家执行
> **关联文件**：`project-lifecycle.yml v3.1.0`、`governance-mapping.md`、`redlines.yml`、各阶段 workflow YML

---

## 一、现状诊断：审查机制缺口全景

### 1.1 当前各阶段审查机制覆盖情况

| 阶段 | 负责Agent | 人工卡点 | PM红线 | 专家Review | 自动化检查 | 缺口 |
|------|-----------|----------|--------|-----------|------------|------|
| stage-0 脑暴 | bs-agent | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | **无任何审查** |
| stage-2 需求分析 | ba-agent | ✅ 卡点① | ✅ | ❌ 无专家review | ❌ 无 | **缺BA专家review** |
| stage-3 设计 | ux-agent | ✅ 卡点② | ✅ C-D1~D4 | ❌ 无专家review | ❌ 无 | **缺UX专家review** |
| stage-4 架构 | arch-agent | ✅ 卡点③ | ✅ C-A1~A4 | ✅ 守门员裁决 | ❌ 无 | **缺自动化校验** |
| stage-5 开发 | fd-agent | ❌ 无(自动) | ✅ C-F1~F5 | ❌ 无专家review | ✅ compliance-checker | **缺FD专家review** |
| stage-6 测试 | qa-agent | ✅ 卡点④ | ❌ 无 | ❌ 无专家review | ✅ 五层测试 | **缺QA专家review+缺PM红线** |
| stage-7 验收 | ac-agent | ✅ 卡点⑤ | ❌ 无 | ❌ 无专家review | ✅ requirement-checker | **缺AC专家review+缺PM红线** |
| stage-8 结束 | pm-agent | — | — | ✅ 追溯链校验 | ✅ strict_guard | ✅ 基本完备 |

### 1.2 核心问题

| 问题编号 | 问题 | 影响 | 严重程度 |
|----------|------|------|----------|
| GAP-01 | **脑暴阶段无任何审查** | 脑暴质量不可控，低质方案流入需求阶段 | 🔴 高 |
| GAP-02 | **需求阶段缺BA专家review** | 需求产物质量依赖BA单方面输出，无交叉校验 | 🔴 高 |
| GAP-03 | **设计阶段缺UX专家review** | 设计稿质量无UX专家把关，仅PM红线机械检查 | 🟡 中 |
| GAP-04 | **开发阶段缺FD专家review** | 代码质量仅靠compliance-checker自动检查，无人工专家走查 | 🟡 中 |
| GAP-05 | **测试阶段缺QA专家review+缺PM红线** | 测试用例质量无专家审查，测试覆盖度无红线约束 | 🔴 高 |
| GAP-06 | **验收阶段缺AC专家review+缺PM红线** | 验收结论可信度存疑（已有验收失真先例C2） | 🔴 高 |
| GAP-07 | **2项P1技术债务未实现** | 跨页面数据一致性、状态机一致性无自动检查 | 🟡 中 |
| GAP-08 | **审查问题列表19项问题状态为draft** | 已识别问题未闭环 | 🟡 中 |

### 1.3 已发生的审查失真案例

来自 `审查问题列表.md` 的实际案例：

| 案例 | 问题 | 根因 |
|------|------|------|
| P3 | 大量验收项仅代码/脚本注入式标记PASS，实际人工UI不可走通 | **验收阶段无专家人工review**（GAP-06） |
| C2 | 验收报告V1.0.0(95分通过)与V2.0.0(75分待复验)结论直接矛盾 | **验收阶段无专家交叉校验**（GAP-06） |
| A1 | 缺口文档声称G1~G13全部修复，代码实测仅7/13真修 | **架构阶段缺自动化校验**（GAP-04补充） |
| C1 | PRD定义资源占用/释放，但line.js实现缩水 | **开发阶段缺专家review**（GAP-04） |

---

## 二、整改方案：每阶段专家Review机制

### 2.0 整改原则

1. **每阶段必有Review**：8个阶段（含脑暴）每个阶段完成后、流转下一阶段前，必须有独立Review环节
2. **专家对位**：Review由对应阶段的领域专家执行，而非PM机械检查红线
3. **Review产出**：每阶段Review必须产出《阶段Review报告》，含通过/有条件通过/驳回结论
4. **回流闭环**：Review不通过的项进入problem-ledger，PM路由回流
5. **留痕可追溯**：Review报告写入Journal，纳入/close闭环校验

### 2.1 整改后的流程全景

```
/init
  → [脑暴] → 🆕BS专家Review → 
  → [需求分析] → 🆕BA专家Review → 
  → [设计] → 🆕UX专家Review → 
  → [架构] → ✅Arch守门员Review(已有) → 
  → [开发] → 🆕FD专家Review → 
  → [测试] → 🆕QA专家Review → 
  → [验收] → 🆕AC专家Review → 
  → /close → /handoff
```

### 2.2 各阶段专家Review详细设计

---

#### 🆕 stage-0 脑暴 → BS专家Review

| 属性 | 值 |
|------|-----|
| Review执行者 | bs-agent（脑暴专家） |
| Review时机 | 脑暴四步法完成后、确认前 |
| Review产出 | `projects/{project}/docs/00-brainstorm/reviews/REV-BS-{version}.md` |
| Review结论 | 通过 / 有条件通过 / 驳回 |

**Review检查项**：

| 检查项编号 | 检查内容 | 通过标准 |
|-----------|----------|----------|
| REV-BS-01 | 四步法完整性 | 发散→收敛→连线→定调 四步均有产出 |
| REV-BS-02 | 发散度 | 发散阶段产出的方案数 ≥ 3 |
| REV-BS-03 | 收敛逻辑 | 收敛有明确筛选理由，非随意丢弃 |
| REV-BS-04 | 连线合理性 | 方案间的关联关系有业务依据 |
| REV-BS-05 | 定调明确 | 最终方案有明确的业务目标、范围边界、优先级 |
| REV-BS-06 | 可行性初判 | 方案无明显技术/业务不可行项 |

**整改动作**：
- 在 `brainstorm.yml` 增加 `post_review` 步骤
- 在 `project-lifecycle.yml` stage-0 增加 `checkpoint: true`
- BS Agent 完成脑暴后自检6项，产出Review报告

---

#### 🆕 stage-2 需求分析 → BA专家Review

| 属性 | 值 |
|------|-----|
| Review执行者 | ba-agent（需求分析专家，以第三方视角自检） |
| Review时机 | REQ产物体系输出后、用户确认前 |
| Review产出 | `projects/{project}/docs/01-requirements/reviews/REV-BA-{version}.md` |
| Review结论 | 通过 / 有条件通过 / 驳回 |

**Review检查项**：

| 检查项编号 | 检查内容 | 通过标准 |
|-----------|----------|----------|
| REV-BA-01 | 产物体系完整性 | 场景需求/流程闭环/信息流/状态机/权限矩阵/时序流/ER关系 缺一不可 |
| REV-BA-02 | User Story质量 | 每个 FN 含 Happy Path + ≥2 Ugly Path + ≥1 Corner Case（BA-04） |
| REV-BA-03 | 业务流程覆盖度 | 主干/分支/异常/跨部门/跨角色/跨系统 六类流程全覆盖（BA-05） |
| REV-BA-04 | 状态机完整性 | 每个状态机配套状态过渡操作表（BA-06） |
| REV-BA-05 | BR依赖声明 | 每条BR声明depends_on依赖链（BA-08） |
| REV-BA-06 | 接口契约初稿 | 每个FN有接口路径+入参/出参（BA-09） |
| REV-BA-07 | 版本优先级 | P0~P3优先级排序完整（BA-10） |
| REV-BA-08 | 多端差异矩阵 | 各端差异点标注完整 |
| REV-BA-09 | 全局文档契约附录 | 所有产物交叉引用索引完整（BA-13） |
| REV-BA-10 | 终端冻结一致性 | scope.platforms与后续产物一致 |

**整改动作**：
- 在 `requirement-flow.yml` §7后增加 `ba_self_review` 步骤
- BA Agent 以"审查者"视角对自身产出做10项检查
- Review报告作为checkpoint的必备输入

---

#### 🆕 stage-3 设计 → UX专家Review

| 属性 | 值 |
|------|-----|
| Review执行者 | ux-agent（交互设计专家，以第三方视角自检） |
| Review时机 | 页面/组件/交互说明卡产出后、PM红线检查前 |
| Review产出 | `projects/{project}/docs/03-design/reviews/REV-UX-{version}.md` |
| Review结论 | 通过 / 有条件通过 / 驳回 |

**Review检查项**：

| 检查项编号 | 检查内容 | 通过标准 |
|-----------|----------|----------|
| REV-UX-01 | 需求覆盖度 | 每个FN至少有1个对应页面设计 |
| REV-UX-02 | 状态全覆盖 | 需求状态机的每个状态在设计中都有对应UI表现 |
| REV-UX-03 | 交互卡五段完整性 | 每个交互覆盖：触发→前置→执行→反馈→后置（C-D3） |
| REV-UX-04 | 四态覆盖 | 所有组件覆盖 loading/error/empty/success |
| REV-UX-05 | 多端适配 | 每个页面标注适用端，各端差异点有适配方案 |
| REV-UX-06 | 空状态引导 | 所有空状态有引导操作 |
| REV-UX-07 | Design Token消费 | 禁止硬编码颜色/字号/间距，使用CSS变量 |
| REV-UX-08 | 路由映射完整 | 每个页面声明对应路由路径（C-D1） |
| REV-UX-09 | 组件树完整 | 每个页面有组件树结构和布局描述（C-D2） |
| REV-UX-10 | 交互一致性 | 相似操作的交互方式一致（如所有删除操作统一二次确认） |

**整改动作**：
- 在 `design-flow.yml` 增加 `ux_self_review` 步骤
- UX Agent 以"审查者"视角对自身产出做10项检查

---

#### ✅ stage-4 架构 → Arch守门员Review（已有，补充自动化校验）

| 属性 | 值 |
|------|-----|
| Review执行者 | arch-agent（架构专家，守门员） |
| 现状 | ✅ 已有gatekeeper机制 + C-A1~A4红线 |
| 缺口 | ❌ 缺自动化校验（红线仅人工检查） |

**补充检查项**：

| 检查项编号 | 检查内容 | 通过标准 | 自动化 |
|-----------|----------|----------|--------|
| REV-ARCH-01 | C-A1路由映射机器可解析 | YAML格式可解析 | 🆕自动 |
| REV-ARCH-02 | C-A2运行骨架实际可启动 | `npm run dev` 实际执行成功 | 🆕自动 |
| REV-ARCH-03 | C-A3仿真开关契约完整 | 逐接口核对sim/real实现存在 | 🆕自动 |
| REV-ARCH-04 | C-A4三段回溯表FN级完整 | 逐FN核对三段齐全 | 🆕自动 |
| REV-ARCH-05 | 接口契约Zod Schema校验 | 每个接口有请求/响应Zod Schema | 🆕自动 |
| REV-ARCH-06 | 衰减控制清单完整 | 设计→代码每个映射点无丢失 | 人工 |

**整改动作**：
- 在 `arch-flow.yml` 增加 `automated_validation` 步骤
- 调用 `arch-scaffold-reviewer` skill 自动校验C-A1~A4
- 守门员裁决前先看自动化校验报告

---

#### 🆕 stage-5 开发 → FD专家Review

| 属性 | 值 |
|------|-----|
| Review执行者 | fd-agent（前端开发专家，以第三方视角自检） |
| Review时机 | compliance-checker通过后、自动流转QA前 |
| Review产出 | `projects/{project}/docs/04-arch/reviews/REV-FD-{version}.md` |
| Review结论 | 通过 / 有条件通过 / 驳回 |

**Review检查项**：

| 检查项编号 | 检查内容 | 通过标准 |
|-----------|----------|----------|
| REV-FD-01 | 11条编码铁律全覆盖 | compliance-checker PASS |
| REV-FD-02 | 契约一致性 | 代码实现与架构契约（路由/接口/数据模型）一致（C-F4） |
| REV-FD-03 | 1:1还原度 | 逐页对比UX设计稿，套真实组件库（C-F2） |
| REV-FD-04 | 主链路可走通 | 登录→核心页面→核心操作全链路（C-F3） |
| REV-FD-05 | 视觉回归 | 设计稿→代码截图对比 ≥ 0.95（C-F5） |
| REV-FD-06 | 四态覆盖 | 所有组件覆盖loading/error/empty/success |
| REV-FD-07 | 错误处理完整 | 所有接口调用有错误处理，无静默失败 |
| REV-FD-08 | 状态机实现一致 | 代码中的状态流转与PRD状态机一致（🆕覆盖RL-12技术债务） |
| REV-FD-09 | 跨页面数据一致 | 关键字段在多个页面展示一致（🆕覆盖RL-11技术债务） |
| REV-FD-10 | 无硬编码样式 | Design Token消费校验通过 |

**整改动作**：
- 在 `dev-flow.yml` §2后增加 `fd_self_review` 步骤
- FD Agent以"审查者"视角做10项检查（含2项技术债务补齐）
- Review报告通过后才自动流转QA

---

#### 🆕 stage-6 测试 → QA专家Review

| 属性 | 值 |
|------|-----|
| Review执行者 | qa-agent（测试专家，以第三方视角自检） |
| Review时机 | 五层测试执行后、人工卡点④前 |
| Review产出 | `projects/{project}/docs/04-testing/reviews/REV-QA-{version}.md` |
| Review结论 | 通过 / 有条件通过 / 驳回 |

**Review检查项**：

| 检查项编号 | 检查内容 | 通过标准 |
|-----------|----------|----------|
| REV-QA-01 | 用例来源可追溯 | 每个测试用例可追溯到BA产物（User Story/BR/状态机/权限矩阵） |
| REV-QA-02 | Happy Path覆盖 | 所有User Story的Happy Path 100%覆盖 |
| REV-QA-03 | Ugly Path覆盖 | 每个FN ≥ 2个Ugly Path用例 |
| REV-QA-04 | Corner Case覆盖 | 每个FN ≥ 1个Corner Case用例 |
| REV-QA-05 | 状态机覆盖 | 所有合法/非法状态转换有用例 |
| REV-QA-06 | 权限矩阵覆盖 | 每种角色×操作组合有权限验证用例 |
| REV-QA-07 | 异常分支覆盖 | 并发/超时/网络异常/边界值用例（🆕解决S3/S4审查问题） |
| REV-QA-08 | 五层测试完整性 | 单元100%/浏览器95%/白盒90%/视觉95% |
| REV-QA-09 | 三方一致性矩阵 | 测试报告含三方一致性矩阵（需求/设计/代码） |
| REV-QA-10 | Bug分级合理 | Critical/High/Medium/Low分级合理，无降级 |

**🆕新增PM红线**（测试阶段当前无PM红线）：

| 红线编号 | 名称 | 检查内容 | 失败动作 |
|----------|------|----------|----------|
| C-Q1 | 用例可追溯 | 每个用例关联BA产物编号 | PM驳回，QA补关联 |
| C-Q2 | Happy Path全覆盖 | 所有FN的Happy Path 100% | PM驳回，QA补用例 |
| C-Q3 | 测试报告完整性 | 含三方一致性矩阵+Bug分级 | PM驳回，QA补全 |

**整改动作**：
- 在 `test-flow.yml` §2后增加 `qa_self_review` 步骤
- 在 `project-lifecycle.yml` stage-6 增加 `pm_redlines: [C-Q1, C-Q2, C-Q3]`
- QA Agent以"审查者"视角做10项检查

---

#### 🆕 stage-7 验收 → AC专家Review

| 属性 | 值 |
|------|-----|
| Review执行者 | ac-agent（验收专家，以第三方视角自检） |
| Review时机 | 四人模拟验收后、人工卡点⑤前 |
| Review产出 | `projects/{project}/docs/05-acceptance/reviews/REV-AC-{version}.md` |
| Review结论 | 通过 / 有条件通过 / 驳回 |

**Review检查项**：

| 检查项编号 | 检查内容 | 通过标准 |
|-----------|----------|----------|
| REV-AC-01 | 人工UI走查 | **禁止脚本注入式标记PASS**，必须人工界面走查（🆕解决P3审查问题） |
| REV-AC-02 | User Story逐条覆盖 | 逐条对照，非抽样检查 |
| REV-AC-03 | Happy Path 100% | 所有User Story的Happy Path通过 |
| REV-AC-04 | Ugly Path ≥80% | 剩余记录为已知限制 |
| REV-AC-05 | 四人模拟无阻塞 | 新用户/VIP/管理员/PO无Critical/High Bug |
| REV-AC-06 | 业务流程闭环 | 完整操作链路可走通（正向+逆向+中断恢复） |
| REV-AC-07 | 错误提示可理解 | 0个技术术语 |
| REV-AC-08 | 操作反馈完整 | 加载+成功+失败三态 |
| REV-AC-09 | 验收结论可复现 | 验收结论可被第三方独立复现（🆕解决C2验收矛盾） |
| REV-AC-10 | 跨页面数据一致性 | 抽查≥3个关键字段在≥2个页面一致（🆕覆盖RL-SUP-01） |
| REV-AC-11 | 状态机一致性 | 原型状态流转与PRD状态机一致（🆕覆盖RL-SUP-02） |

**🆕新增PM红线**（验收阶段当前无PM红线）：

| 红线编号 | 名称 | 检查内容 | 失败动作 |
|----------|------|----------|----------|
| C-AC1 | 人工UI走查 | 验收记录含人工走查截图/日志，非脚本注入 | PM驳回，AC重做 |
| C-AC2 | 结论可复现 | 验收结论标注复现步骤 | PM驳回，AC补充 |
| C-AC3 | 跨页面一致性 | 关键字段跨页面一致性检查通过 | PM驳回，AC补查或路由FD修复 |

**整改动作**：
- 在 `acceptance-flow.yml` §4后增加 `ac_self_review` 步骤
- 在 `project-lifecycle.yml` stage-7 增加 `pm_redlines: [C-AC1, C-AC2, C-AC3]`
- AC Agent以"审查者"视角做11项检查
- **强制人工界面走查**，禁止脚本注入式标记

---

## 三、整改实施清单

### 3.1 文件修改清单

| # | 文件 | 修改内容 | 优先级 |
|---|------|----------|--------|
| 1 | `project-lifecycle.yml` | stage-0增加checkpoint；stage-6增加pm_redlines C-Q1~Q3；stage-7增加pm_redlines C-AC1~AC3 | P0 |
| 2 | `brainstorm.yml` | 增加post_review步骤（REV-BS-01~06） | P0 |
| 3 | `requirement-flow.yml` | §7后增加ba_self_review步骤（REV-BA-01~10） | P0 |
| 4 | `design-flow.yml` | 增加ux_self_review步骤（REV-UX-01~10） | P0 |
| 5 | `arch-flow.yml` | 增加automated_validation步骤（REV-ARCH-01~06） | P1 |
| 6 | `dev-flow.yml` | §2后增加fd_self_review步骤（REV-FD-01~10） | P0 |
| 7 | `test-flow.yml` | §2后增加qa_self_review步骤（REV-QA-01~10） | P0 |
| 8 | `acceptance-flow.yml` | §4后增加ac_self_review步骤（REV-AC-01~11） | P0 |
| 9 | `redlines.yml` | 移除RL-SUP-01/02（已被REV-FD-08/09和REV-AC-10/11覆盖） | P1 |
| 10 | `governance-mapping.md` | 更新技术债务状态（RL-11/12已通过专家Review覆盖） | P1 |

### 3.2 新增PM红线清单

| 红线编号 | 阶段 | 名称 | 检查内容 |
|----------|------|------|----------|
| C-BS1 | 脑暴 | 四步法完整 | 发散→收敛→连线→定调四步均有产出 |
| C-Q1 | 测试 | 用例可追溯 | 每个用例关联BA产物编号 |
| C-Q2 | 测试 | Happy Path全覆盖 | 所有FN的Happy Path 100% |
| C-Q3 | 测试 | 测试报告完整性 | 含三方一致性矩阵+Bug分级 |
| C-AC1 | 验收 | 人工UI走查 | 禁止脚本注入式标记PASS |
| C-AC2 | 验收 | 结论可复现 | 验收结论标注复现步骤 |
| C-AC3 | 验收 | 跨页面一致性 | 关键字段跨页面一致性检查 |

### 3.3 技术债务清偿

| 技术债务 | 原状态 | 整改后状态 | 覆盖方式 |
|----------|--------|------------|----------|
| RL-11 跨页面数据一致性 | 无显式检查 | ✅ 已覆盖 | REV-FD-09 + REV-AC-10 |
| RL-12 状态机一致性 | 无显式检查 | ✅ 已覆盖 | REV-FD-08 + REV-AC-11 |

### 3.4 审查问题列表闭环

来自 `审查问题列表.md` 的19项问题，整改后覆盖情况：

| 问题编号 | 问题 | 整改覆盖 |
|----------|------|----------|
| P3 | 验收项脚本注入式PASS | REV-AC-01 + C-AC1 |
| C2 | 验收结论矛盾 | REV-AC-09 + C-AC2 |
| S3 | 并发/超时场景无测试 | REV-QA-07 |
| S4 | 异常/边界场景覆盖薄弱 | REV-QA-07 |
| A1 | 文档与代码矛盾 | REV-FD-02 + REV-ARCH自动化校验 |
| C1 | 需求vs实现冲突 | REV-FD-02 + REV-FD-08 |

---

## 四、整改后审查机制全景

```
┌─────────────────────────────────────────────────────────────────┐
│                    整改后审查机制全景                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /init                                                            │
│    ↓                                                              │
│  [stage-0 脑暴]                                                   │
│    ↓                                                              │
│  🆕 BS专家Review (REV-BS-01~06) + 🆕PM红线 C-BS1                 │
│    ↓ 通过                                                         │
│  [stage-2 需求分析]                                               │
│    ↓                                                              │
│  🆕 BA专家Review (REV-BA-01~10) + ✅PM红线(已有)                 │
│    ↓ 通过                                                         │
│  [stage-3 设计]                                                   │
│    ↓                                                              │
│  🆕 UX专家Review (REV-UX-01~10) + ✅PM红线 C-D1~D4(已有)         │
│    ↓ 通过                                                         │
│  [stage-4 架构]                                                   │
│    ↓                                                              │
│  ✅ Arch守门员Review(已有) + 🆕自动化校验 REV-ARCH-01~06         │
│    ↓ 通过                                                         │
│  [stage-5 开发]                                                   │
│    ↓                                                              │
│  🆕 FD专家Review (REV-FD-01~10) + ✅PM红线 C-F1~F5(已有)         │
│    ↓ 通过                                                         │
│  [stage-6 测试]                                                   │
│    ↓                                                              │
│  🆕 QA专家Review (REV-QA-01~10) + 🆕PM红线 C-Q1~Q3              │
│    ↓ 通过                                                         │
│  [stage-7 验收]                                                   │
│    ↓                                                              │
│  🆕 AC专家Review (REV-AC-01~11) + 🆕PM红线 C-AC1~AC3            │
│    ↓ 通过                                                         │
│  [stage-8 /close]                                                 │
│    ↓ PBL全闭环+追溯链校验+上线基线标记                            │
│  [stage-9 /handoff]                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 整改前后对比

| 维度 | 整改前 | 整改后 |
|------|--------|--------|
| 有Review的阶段数 | 1/8（仅架构） | **8/8（全阶段）** |
| 有PM红线的阶段数 | 4/8 | **7/8（仅结束阶段无需）** |
| 专家Review检查项总数 | ~4（架构C-A1~A4） | **77项**（BS6+BA10+UX10+ARCH6+FD10+QA10+AC11+补充14） |
| 技术债务数 | 4项 | **2项**（RL-11/12已清偿） |
| 自动化校验 | compliance-checker(开发) | compliance-checker + **arch自动化校验** |

---

## 五、实施路线图

| 阶段 | 内容 | 时间 | 优先级 |
|------|------|------|--------|
| Phase 1 | 修改6个workflow YML增加self_review步骤 | 立即 | P0 |
| Phase 2 | 修改project-lifecycle.yml增加PM红线和checkpoint | 立即 | P0 |
| Phase 3 | 清偿技术债务RL-11/12（标记已覆盖） | 1周内 | P1 |
| Phase 4 | 闭环审查问题列表19项问题 | 2周内 | P1 |
| Phase 5 | 补齐arch自动化校验脚本 | 2周内 | P1 |
| Phase 6 | 验证整改效果（下一需求流全流程走查） | 3周内 | P1 |

---

> **整改总结**：通过在8个阶段各增加专家Review环节，审查机制从"1/8阶段有专家审查"提升至"8/8阶段全覆盖"，检查项从4项扩展至77项，2项P1技术债务清偿，6项PM红线新增，从根本上解决"验收失真""需求实现冲突""测试覆盖不足"等已发生问题。
