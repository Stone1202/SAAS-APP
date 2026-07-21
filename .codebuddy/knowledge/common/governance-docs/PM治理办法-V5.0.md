# PM治理办法 V5.0

> **版本**：V5.0.0 | **发布日期**：2026-07-18
> **取代**：`_archive/V4.0.0-snapshot/POM方法论与宪章-V4.0.0.md`中PM相关章节 + `_archive/V4.0.0-snapshot/POM流程运作过程说明书-V4.0.0.md`
> **关联**：`agents/pm-agent.md` / `configs/workflows/project-lifecycle.yml` / `common/version-timeline-standards.yml`

---

## 一、PM角色定位

### 1.1 核心定义

PM Agent是**互联网项目管理专家**，在POM V5.0三级把关机制中担任**版本级总体把关人**。

| 层级 | 把关人 | 职责 |
|------|--------|------|
| 项目级 | PO Agent | 做对的事（战略对齐） |
| **版本级** | **PM Agent** | **把事做对（交付闭环）** |
| Sprint级 | SM Agent | 做对每个增量（敏捷交付） |

### 1.2 角色演变（V4.0→V5.0）

| 维度 | V4.0 | V5.0 |
|------|------|------|
| 把关层级 | 全层级（项目+版本+Sprint） | **专注版本级**（Sprint级交给SM） |
| 核心职责 | 6项（R1~R6） | 6项（R1~R6不变，但Sprint日常把控交给SM） |
| 编排范围 | 8阶段流水线全程 | 版本级编排（Sprint内部由SM编排） |

### 1.3 不再负责的事项（移交SM）

- Sprint DoD校验 → SM
- 增量可演示验证 → SM
- Sprint间依赖管理 → SM
- 阶段Review协调 → SM
- Scrum事件保障 → SM
- 障碍移除 → SM

---

## 二、版本级总体把关（5维）

### 2.1 把关维度

| 维度 | 检查内容 | 门禁 |
|------|---------|------|
| vg1 版本范围完整性 | Backlog Must项100%交付，Should项≥80% | G-VER-GUARD-01（block） |
| vg2 版本质量达标 | 运行时验证+五层测试+验收 全通过 | G-VER-GUARD-02（block） |
| vg3 三位一体交付物一致性 | PRD↔仿真原型↔用例卡片 编号一致且行为一致 | G-VER-GUARD-03（block） |
| vg4 版本沉淀学习完成 | 沉淀8步完成+质量评分≥60 | G-VER-GUARD-04（block） |
| vg5 Sprint汇总 | 所有Sprint的DoD满足+依赖解锁 | 基于SM的Sprint把关报告 |

### 2.2 把关产出

- 版本把关报告（`docs/07-version-guard/VERSION-GUARD-{project}-v{version}.md`）
- /close前置校验结论（通过/不通过+原因）

### 2.3 把关升级机制

```
版本级问题 → PO（项目把关人）介入 → 决定调整路线图或重新规划
```

---

## 三、PM核心职责（6项）

### R1：何时开始（When to Start）
- 上一阶段Review通过且用户确认后启动下一阶段
- 版本自动链：上一版close→自动调度下一版
- state_guard兜底：校验state.json存在性
- 骨架完整性校验：stage-00运行ensure-project.sh --check

### R2：是否完成（Is Complete）
- 读取主导Agent产出+state.json判定
- 确认该阶段专家Review已通过

### R3：问题列表（Problem List）
- 汇总Bug/异常/不通过项+专家Review问题
- 分配PBL编号

### R4：人工确认+额外输入（Human Confirm）
- 展示专家Review汇总（不是直接给选项）
- 按human-confirm-protocol.yml呈现决策清单（fast/detailed/hybrid三模式）

### R5：全程留痕（Full Trace）
- Journal实时记录（conversation-log.md + problem-ledger.md）
- Review报告写入Journal

### R6：版本沉淀学习（Version Sedimentation）
- /close后执行版本沉淀学习（knowledge-sedimentation.yml）
- 需求沉淀→Review沉淀→经验提炼→追溯链快照→版本索引→质量校验

---

## 四、版本生命周期编排

### 4.1 V5.0完整流程

```
【前置阶段 - 产品规划层】
Stage -2: 脑暴（BS Agent）→ 产出脑暴文档
Stage -1: PO产品规划（PO Agent，po-planning-flow.yml）→ 产出Backlog+Sprint计划

【Sprint 0 - 需求探索层】
Stage 0: PM /init → BA需求分析（§0.5深度分析整合）

【Sprint 1-N - 增量交付层】（SM守护）
每Sprint: BA→UX→Arch→FD→QA→人确认→Sprint Review→Sprint Retrospective

【Final Sprint - 集成验证层】
Stage 7: AC验收（四人：AC+QA+UX+PO商业价值）
Stage 7.5: handoff（三位一体交付物门禁G-HO-DELIVERY-01~05）

【版本关闭】
Stage 8: /close → 版本把关(G-VER-GUARD) → 项目把关(G-PROJ-GUARD) → 版本快照 → 差异报告 → 版本沉淀
```

### 4.2 PM在各阶段的角色

| 阶段 | PM角色 |
|------|--------|
| 脑暴 | 不参与（BS负责） |
| PO规划 | 不参与（PO负责），但接收PO产物 |
| /init | **主导**（组装参数路由包传递BA） |
| 需求分析 | **supervisor**（监督BA） |
| 设计 | **supervisor**（监督UX） |
| 架构 | **supervisor**（监督Arch） |
| 开发 | **supervisor**（监督FD） |
| 测试 | **supervisor**（监督QA） |
| 验收 | **supervisor**（监督AC+PO商业价值验收） |
| handoff | **supervisor**（三位一体门禁） |
| /close | **主导**（版本把关+快照+差异+沉淀） |

---

## 五、三位一体交付物

### 5.1 交付物体系

| 交付物 | 说明 | 目的 |
|--------|------|------|
| PRD文档 | 泳道图+流程图+状态机+信息流+用例说明 | 理解全局 |
| 高保真仿真原型 | 可操作+可闭环+接近真实系统 | 体验真实 |
| 可交互用例卡片 | 每张卡片=一个UC的交互式演示（3模式） | 精确定义 |

### 5.2 三位一体门禁（G-HO-DELIVERY-01~05）

| 门禁 | 检查内容 |
|------|---------|
| G-HO-DELIVERY-01 | PRD五图完整性（泳道+流程+状态机+信息流+时序） |
| G-HO-DELIVERY-02 | 高保真仿真原型可用性（dev启动+页面访问+菜单跳转+数据保存+流程跑通） |
| G-HO-DELIVERY-03 | 可交互用例卡片完整性（所有UC有卡片+可交互+auto_play通过） |
| G-HO-DELIVERY-04 | 三位一体一致性（PRD↔原型↔卡片 编号一致且行为一致） |
| G-HO-DELIVERY-05 | Demo报告（AI自动Demo含截图+流程跑通证据+问题清单） |

---

## 六、版本快照与差异管理

### 6.1 版本快照（/close时执行）

| 动作 | 说明 |
|------|------|
| Git Tag冻结 | `git tag -a v{version} -m '版本冻结'` |
| 构建产物归档 | `npm run build:sim` → `docs/09-versions/v{version}/build/` |
| PRD+卡片+Demo归档 | 复制到 `docs/09-versions/v{version}/` |
| SNAPSHOT.yml生成 | 快照元数据 |
| VERSION-TIMELINE.yml更新 | 全局版本时间线 |

### 6.2 版本差异报告（AI+人工）

| 章节 | 产出方 | 内容 |
|------|--------|------|
| 一~五章（AI自动） | AI对比SNAPSHOT | 变更摘要+页面变更+用例变更+数据变更+差异可视化 |
| 六 商业价值变更 | PO人工补充 | 新增商业价值/达成度变化/路线图偏离 |
| 七 风险变更 | PM人工补充 | 新增风险/已关闭风险/风险等级变化 |
| 八 关键决策记录 | PO+PM联合补充 | 范围调整/技术选型/风险接受决策 |

### 6.3 版本切换器（3模式）

| 模式 | 说明 | 使用场景 |
|------|------|---------|
| single | 单版本查看 | 研发团队首次理解某版本 |
| diff_highlight | 差异高亮（新增绿色/修改黄色） | 快速理解版本间差异 |
| side_by_side | 并排对比（左右iframe同步路由） | 深度对比两版本 |

---

## 七、PM铁律

引用`iron-rules-registry.yml`的PM-01~08（V4.0已有，V5.0不变）：

| 铁律 | 描述 |
|------|------|
| PM-01~08 | 8条项目管理铁律（详见iron-rules-registry.yml） |
| GLOBAL-01 | 凡需人确认必须按human-confirm-protocol构造询问（V5.0新增全局铁律） |

---

## 八、人确认场景

PM在以下场景需请求人确认（按`human-confirm-protocol.yml`）：

| 场景 | 询问类型 |
|------|---------|
| 阶段Review后确认/补充/回流 | 展示Review汇总后人确认 |
| 版本范围调整 | Q5范围确认型 |
| /close前置校验不通过 | Q4风险确认型 |
| 版本快照后差异报告人工补充 | 自由输入 |
