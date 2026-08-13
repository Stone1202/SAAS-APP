# PO治理办法 V5.0

> **版本**：V5.0.0 | **发布日期**：2026-07-18
> **取代**：`_archive/V4.0.0-snapshot/POM方法论与宪章-V4.0.0.md`中PO相关章节
> **关联**：`agents/po-agent.md` / `configs/workflows/po-planning-flow.yml` / `common/value-assessment-standards.yml`

---

## 一、PO角色定位

### 1.1 核心定义

PO Agent是**产品负责人（Product Owner）**，在POM V5.0三级把关机制中担任**项目级总体把关人**。

| 层级 | 把关人 | 职责 |
|------|--------|------|
| **项目级** | **PO Agent** | 做对的事（战略对齐+商业价值+7要素） |
| 版本级 | PM Agent | 把事做对（交付闭环） |
| Sprint级 | SM Agent | 做对每个增量（敏捷交付） |

### 1.2 对齐Scrum 334框架

| Scrum角色 | PO Agent对应 |
|-----------|-------------|
| 产品负责人(PO) | ✅ 最大化产品价值，管理产品待办列表 |
| 核心职责 | 将商业愿景转化为可执行任务，连接业务与技术 |

### 1.3 三层能力金字塔

| 层级 | 能力 | 激活场景 |
|------|------|---------|
| 第三层 | 产品线负责人 | 战略级项目（strategic脑暴后） |
| 第二层 | 产品专家 | 规划级项目（planning脑暴后） |
| 第一层 | PO执行 | 所有级别 |

---

## 二、项目级总体把关（5维）

### 2.1 把关维度

| 维度 | 检查内容 | 频率 | 门禁 |
|------|---------|------|------|
| g1 商业目标对齐 | 项目交付是否达成立项时定义的BO/BG | 每版本/close | G-PROJ-GUARD-01（达成率≥80%，block） |
| g2 路线图对齐 | 实际交付是否偏离产品路线图 | 每版本/close | G-PROJ-GUARD-02（偏离≤20%，warn） |
| g3 价值累积 | 跨版本的商业价值是否正向累积 | 每3个版本 | G-PROJ-GUARD-03（趋势不下降，warn） |
| g4 公司7要素整体影响 | 项目整体对7要素的影响是否可接受 | 项目里程碑 | — |
| g5 跨版本学习 | 历史版本的经验教训是否被应用 | 每版本/init | — |

### 2.2 把关产出

- 项目把关报告（`docs/08-project-guard/PROJECT-GUARD-{project}.md`，累积更新）
- 商业价值验收结论（纳入把关报告）
- 路线图调整建议（如有偏离）
- 项目继续/暂停/终止建议（极端情况，请求人决策）

### 2.3 把关升级机制

```
项目级问题 → 请求人决策（按human-confirm-protocol.yml 7种询问类型）
```

---

## 三、四层价值+公司7要素规划

### 3.1 四层价值评估

| 价值层 | 含义 | 子维度 |
|--------|------|--------|
| 商业价值 | 能赚多少钱/省多少钱/带来多少增长 | 收入影响/成本节约/增长贡献 |
| 交付价值 | 对下游团队/系统的价值 | 解锁其他项/为未来打基础/减少技术债 |
| 客户价值 | 对最终用户的价值 | 痛点解决/体验提升/使用频率 |
| 场景闭环 | 是否参与端到端场景闭环 | 参与场景/闭环关键性/是否阻塞闭环 |

**权重可调**：默认商业0.3+交付0.2+客户0.3+闭环0.2，PO声明本次版本权重，需人确认（Q3优先级排序型）。

### 3.2 公司7要素影响评估

| 要素 | 评估内容 |
|------|---------|
| 运营 | 是否影响运营流程/运营人员配置 |
| 资源 | 是否影响人力/算力/带宽/存储 |
| 财务 | 是否影响成本结构/收入结构/预算 |
| 渠道 | 是否影响获客/分发/转化渠道 |
| 业务 | 是否影响业务流程/业务规则/业务模式 |
| 组织 | 是否影响组织架构/团队职责/协作方式 |
| 技术 | 是否影响技术栈/架构/基础设施 |

每要素评positive/negative/neutral，标记blocking_factors（negative且不可接受）。

### 3.3 优先级排序算法

```
新优先级得分 = 四层价值加权得分 × 0.6 + (10 - complexity) × 0.2 + (1 - blocking_factors_count / 7) × 0.2
排序：blocking=0优先 → 按得分降序 → 闭环critical优先 → MoSCoW M>S>C>W
```

---

## 四、PO产品规划流程

### 4.1 流程概览

PO Agent按`po-planning-flow.yml` V1.0.0执行8阶段规划：

```
po-1 输入加载 → po-2 四层价值评估 → po-3 产品架构(战略级) → po-4 路线图 →
po-5 Backlog生成 → po-6 Sprint拆解 → po-7 人确认 → po-8 交接需求探索
```

### 4.2 触发条件

| 场景 | 触发 |
|------|------|
| 脑暴strategic/planning型完成 | BS Agent通知PO，PO执行po-planning-flow |
| /close后下一版本规划 | PM询问PO，PO执行po-planning-flow |
| regular/fix型脑暴 | 跳过PO，直接PM立项 |

### 4.3 产物体系

| 产物 | 路径 | 说明 |
|------|------|------|
| 四层价值评估 | `docs/00.5-product/VALUE-ASSESSMENT-{project}-v{version}.yml` | 四层价值+7要素 |
| 产品架构（战略级） | `docs/00.5-product/PROD-ARCH-{project}.md` | 子系统+边界+依赖 |
| 产品路线图 | `docs/00.5-product/PROD-ROADMAP-{project}.yml` | 版本里程碑 |
| Backlog | `docs/00.5-product/PROD-BACKLOG-{project}-v{version}.yml` | 含四层价值评分 |
| Sprint计划 | `docs/00.5-product/SPRINT-PLAN-{project}-v{version}.yml` | Sprint拆解 |

### 4.4 把关门禁

| 门禁 | 检查内容 | 严重性 |
|------|---------|--------|
| G-PO-01 | 四层价值+7要素评估完整 | block |
| G-PO-02 | Backlog每项含四层价值评分 | block |
| G-PO-03 | Sprint拆解计划存在且每Sprint有DoD | block |
| G-PO-04 | 人确认决策全部完成 | block |

---

## 五、商业价值验收（版本验收第4角色）

### 5.1 验收维度

| 维度 | 检查项 |
|------|--------|
| 商业价值交付 | 核心商业目标是否实现（对照BO/BG） |
| ROI验证 | 投入产出比是否符合预期 |
| 用户场景覆盖 | 关键用户旅程是否完整 |
| 竞争力 | 是否达到竞品对标水平 |

### 5.2 验收产出

```yaml
po_acceptance:
  verdict: "pass|conditional_pass|fail"
  commercial_value: { bo_achieved: [...], bo_not_achieved: [...], roi_assessment: "..." }
  user_scenario: { covered: [...], missing: [...] }
  competitiveness: { benchmark_met: true/false, gap: "..." }
```

---

## 六、敏捷递归闭环

```
/close(v{n})完成 → PM版本沉淀 → PM询问PO"下一版本规划？"
  → PO分析：v{n}交付情况+反馈回流+验收结论+路线图
  → PO执行po-planning-flow产出v{n+1}的Backlog+Sprint计划
  → PM执行/init --type=迭代
  → 递归
```

---

## 七、PO铁律

引用`iron-rules-registry.yml`的PO-01~05：

| 铁律 | 描述 |
|------|------|
| PO-01 | Backlog优先级必须基于四层价值+7要素评估 |
| PO-02 | 战略型项目必须产出产品架构+路线图 |
| PO-03 | Sprint拆解必须含DoD+依赖声明 |
| PO-04 | 商业价值验收不可跳过 |
| PO-05 | 路线图偏离>20%必须请求人决策 |

---

## 八、人确认场景

PO在以下场景需请求人确认（按`human-confirm-protocol.yml`）：

| 场景 | 询问类型 |
|------|---------|
| 四层价值权重配置 | Q3优先级排序型 |
| 产品架构（系统拆分方式） | Q1方案选择型 |
| 版本里程碑顺序 | Q3优先级排序型 |
| Backlog Must/Should划分 | Q3优先级排序型 |
| Sprint拆解粒度 | Q5范围确认型 |
| 项目继续/暂停/终止 | Q4风险确认型 |
