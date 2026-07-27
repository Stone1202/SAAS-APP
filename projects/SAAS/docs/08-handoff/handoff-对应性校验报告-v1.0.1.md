# Handoff 对应性校验报告 — SAAS / 直播审查 / 迭代

| 字段 | 值 |
|---|---|
| 命令 | `/handoff --project=SAAS --module=直播审查 --type=迭代` |
| 报告版本 | v1.0.1 |
| 日期 | 2026-07-27 |
| PRD | `docs/01-requirements/16-内容审查域-PRD-v1.0.0.md` |
| 迭代类型 | 迭代 |

---

## 1. 执行摘要

本次 `/handoff` 在 v1.0.0 报告基础上，根据用户 Stage 3 反馈进行全面升级：

1. **新增元素级【?】帮助入口**：从原来只有页面级浮窗用例卡，升级为每个关键 UI 元素旁都有 HelpIcon，点击后抽屉自动高亮到对应用例说明。
2. **扩展用例卡覆盖范围**：新增直播管理列表（TenantDashboardEntry）和观众端直播间（AudienceLiveRoom）的用例卡。
3. **回传 BA**：在 PRD §19 记录全部偏差和待办，触发 BA 补充完整 UC 章节、细化 UC 颗粒度、校验编号逻辑性。

**综合评分：30/100**（目标 ≥80）。主要阻塞仍为 PRD 级和原型级实现偏差，本次升级先解决「用例说明入口覆盖度」问题。

---

## 2. 本轮新增交付物

| 类型 | 文件路径 | 说明 |
|---|---|---|
| 组件 | `src/components/use-case-card/HelpButton.vue` | 页面级用例卡入口（右下角浮动按钮） |
| 组件 | `src/components/use-case-card/HelpIcon.vue` | 元素级【?】帮助入口 |
| 组件 | `src/components/use-case-card/UseCaseDrawer.vue` | 用例抽屉，支持元素高亮 |
| 数据 | `src/pages/audit-switch/useCaseCardData.ts` | 租户管理页面用例 + 元素帮助 |
| 数据 | `src/pages/live-control/useCaseCardData.ts` | 直播中控审查用例 + 元素帮助 |
| 数据 | `src/pages/replay/useCaseCardData.ts` | 回放擦音用例 + 元素帮助 |
| 数据 | `src/pages/violations/useCaseCardData.ts` | 历史违规列表面用例 + 元素帮助 |
| 数据 | `src/pages/tenant-dashboard/useCaseCardData.ts` | 直播/回放管理列表用例 + 元素帮助 |
| 数据 | `src/pages/viewer/useCaseCardData.ts` | 观众端直播间用例 + 元素帮助 |
| PRD 更新 | `docs/01-requirements/16-内容审查域-PRD-v1.0.0.md` §19 | Handoff 回传区 |

---

## 3. 元素级帮助入口清单

### 已注入

| 页面/组件 | 元素 | ElementHelp ID |
|---|---|---|
| `AlertStatsBar.vue` | 顶部告警统计区 | E-AUDIT-002-02 / E-AUDIT-004-02 |
| `ViolationTable.vue` | 筛选器（级别/状态/时间） | E-AUDIT-002-04 |
| `DisposalBar.vue` | 记录/断流/忽略按钮 | E-AUDIT-002-06 / E-AUDIT-004-04 |
| `LiveControlAuditPanel.vue` | 「内容审查」Tab | E-AUDIT-002-01 |
| `LiveControlAuditPanel.vue` | 「查看历史违规记录」按钮 | E-AUDIT-002-03 |
| `LiveControlAuditPanel.vue` | 擦音模式切换 | E-AUDIT-002-07 |

### 待补充（P1）

| 页面 | 元素 | ElementHelp ID |
|---|---|---|
| `AuditSwitchPage.vue` | 是否启用标签 / 直播审查开关 / 操作列 | E-AUDIT-001-01 ~ 04 |
| `ReplayDetailAudit.vue` | 进度条 / 发布状态 / 对比按钮 / 重新擦音 / 确认发布 | E-AUDIT-003-03 ~ 08 |
| `ViolationsPanel.vue` | 面板标题 / 违规列表项 / 回调丢失提示 | E-AUDIT-004-01 / 03 / 06 |
| `TenantDashboardEntry.vue` | Tab / 状态标签 / 更多菜单 / 各入口 | E-AUDIT-005-01 ~ 06 |
| `AudienceLiveRoom.vue` | 审查标识 / 播放器 / 断流提示 | E-AUDIT-007-01 ~ 04 |
| `ViolationTable.vue` | 单条违规记录行 | 待新增 |

---

## 4. 阻塞问题（与 v1.0.0 一致）

| # | 级别 | 问题 | 影响 | 责任人 |
|---|---|---|---|---|
| 1 | P0 | PRD 缺少独立 UC 章节，只有 FN 表格 | G-REQ-17 未通过 | BA |
| 2 | P0 | UC 颗粒度不足，按钮/状态/异常分支未独立成 UC | 用户明确要求「细腻」 | BA |
| 3 | P0 | 用例编号 / 页面 / 模块 / 系统逻辑性需校验 | 编号体系一致性 | BA |
| 4 | P0 | 审查开关应为链接+弹窗，现为 Switch 直接生效 | PRD ↔ 原型偏差 | FD |
| 5 | P0 | 违规历史应为 400px 侧滑面板，现为独立页面 | PRD ↔ 原型偏差 | FD |
| 6 | P0 | 5 级联动链未实现 | 开关状态无法联动各端 | FD |
| 7 | P0 | 「审查」Tab 标题应为「内容审查」 | 文案偏差 | FD |

---

## 5. 用户反馈记录

> 1：需要触发 Stage 4 回传 BA 进行需求/原型修正  
> 2：目前看只有页面用例，所有按钮旁边都没有【？】交互用例说明帮助入口；红框处都没有用例说明，非常糟糕；以上仅仅是其中一个页面，其他页面需要非常全面和细致  
> 3：直播管理和回放管理都没有  
> 注意回传给 BA 后需要进一步详细处理，UC 颗粒度一定要细腻，同时需要检查用例编号所属页面所属模块所属系统的逻辑性，其次标注交互用例时需要准确位置

---

## 6. 下一步行动

1. **BA Agent**：处理 PRD §19.4 P0-1~P0-3，补充完整 UC 章节并细化颗粒度。
2. **FD Agent**：处理 PRD §19.4 P0-4~P0-7 和 P1-1~P1-5，修复原型并实现剩余元素级 HelpIcon。
3. **UX Agent**：确认元素帮助位置不破坏视觉布局。
4. **QA Agent**：验证每个 HelpIcon 点击后抽屉正确高亮到对应条目。

---

## 7. 关联门禁状态

| 门禁 | 状态 |
|---|---|
| G-HO-DELIVERY-01 三位一体机对应性 | ❌ 未通过 |
| G-HO-DELIVERY-04 交互用例卡一致性 | ⚠️ 部分通过 |
| G-REQ-17 UC 六段格式完整性 | ❌ 未通过 |

---

**报告结束**
