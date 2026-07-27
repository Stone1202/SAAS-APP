# UI 元素 ↔ UC 映射表 — 内容审查模块（AUDIT）

> **产物类型**：UX 设计输出  
> **维护者**：UX Agent / 交互设计师  
> **关联 PRD**：`docs/01-requirements/16-内容审查域-PRD-v1.0.0.md`  
> **版本**：v1.0.0  
> **生成时间**：2026-07-27  
> **作用**：列出内容审查模块所有可交互元素，明确每个元素对应的 UC、BR、参与人、影响数据，作为 FD 注入 `HelpIcon` 和 QA 验收的唯一依据。

---

## 1. 编号约定

| 字段 | 格式 | 示例 |
|---|---|---|
| Element ID | `E-{模块}-{UC序号}-{元素序号}` | `E-AUDIT-002-06-01` |
| UC 编号 | `UC-AUDIT-{NNN}` | `UC-AUDIT-002` |
| PG 编号 | `PG-AUDIT-{终端}-{NNN}` | `PG-AUDIT-PC-001` |
| FN 编号 | `FN-AUDIT-PC-{NNN}` | `FN-AUDIT-PC-002` |
| BR 编号 | `BR-AUDIT-{NNN}` | `BR-AUDIT-003` |

---

## 2. 页面清单与 UC 覆盖

| 页面 | PG 编号 | 对应 UC | 文件路径 |
|---|---|---|---|
| 运营后台-租户管理列表 | PG-AUDIT-PC-001 | UC-AUDIT-001 | `src/pages/audit-switch/AuditSwitchPage.vue` |
| 租户后台-直播中控内容审查 Tab | PG-AUDIT-PC-002 | UC-AUDIT-002 | `src/pages/live-control/LiveControlAuditPanel.vue` |
| 租户后台-回放详情审查页 | PG-AUDIT-PC-003 | UC-AUDIT-003 | `src/pages/replay/ReplayDetailAudit.vue` |
| 租户后台-历史违规列表面板（侧滑 drawer） | PG-AUDIT-PC-004 | UC-AUDIT-002 | `src/pages/violations/ViolationsPanel.vue` |
| 租户后台-直播/回放管理列表 | PG-AUDIT-PC-005 | UC-AUDIT-005 | `src/pages/tenant-dashboard/TenantDashboardEntry.vue` |
| 观众端-H5/APP 直播间 | PG-AUDIT-APP-001 | UC-AUDIT-004 | `src/pages/viewer/AudienceLiveRoom.vue` |

---

## 3. 元素映射表

### 3.1 PG-AUDIT-PC-001 运营后台-租户管理列表

| 元素 ID | 元素名称 | 位置 | 对应 UC | 对应 BR | 参与人 | 影响数据 | 已注入 `?` | 备注 |
|---|---|---|---|---|---|---|---|---|
| E-AUDIT-001-01 | 是否启用列 | 列表表头/单元格 | UC-AUDIT-001 | BR-AUDIT-001 | 平台运营人员 | tenant.audit_enabled（只读） | ✅ | 展示租户审查开关状态 |
| E-AUDIT-001-02 | 操作列 / 直播审查开关 | 列表操作列 | UC-AUDIT-001 | BR-AUDIT-001 | 平台运营人员 | tenant.audit_enabled（写）、tenant_audit_log（写） | ✅ | 当前为 Switch，需改为链接+弹窗（P0-4） |
| E-AUDIT-001-03 | 二次确认弹窗 | 点击操作列后弹出 | UC-AUDIT-001 | BR-AUDIT-001 | 平台运营人员 | tenant_audit_log（写） | ⚠️ 弹窗组件存在，需按 PRD 文案补全 | 展示 5 级联动影响说明 |

### 3.2 PG-AUDIT-PC-002 直播中控内容审查 Tab

| 元素 ID | 元素名称 | 位置 | 对应 UC | 对应 BR | 参与人 | 影响数据 | 已注入 `?` | 备注 |
|---|---|---|---|---|---|---|---|---|
| E-AUDIT-002-01 | 「内容审查」Tab | 右侧 Tab 栏 | UC-AUDIT-002 | BR-AUDIT-002 | 主播/运营人员 | live_stream.audit_status（只读） | ✅ | 当前显示为「审查」，需改为「内容审查」（P0-7） |
| E-AUDIT-002-02 | 顶部告警统计区 | 审查面板顶部 | UC-AUDIT-002 | BR-AUDIT-003 | 主播/运营人员 | violation_record（聚合） | ✅ | 红/黄/蓝/总数/待处理等 |
| E-AUDIT-002-03 | 查看历史违规记录按钮 | 审查面板底部 | UC-AUDIT-002 | BR-AUDIT-005 | 主播/运营人员 | violation_record（只读列表） | ✅ | 应打开右侧侧滑抽屉，现为独立页（P0-5） |
| E-AUDIT-002-04 | 违规列表筛选器 | 列表上方 | UC-AUDIT-002 | BR-AUDIT-003 | 主播/运营人员 | violation_record（查询条件） | ✅ | 级别/状态/排序 |
| E-AUDIT-002-05 | 违规列表项 | 列表行 | UC-AUDIT-002 | BR-AUDIT-003 | 主播/运营人员 | violation_record（只读） | ✅ | 点击后打开详情面板 |
| E-AUDIT-002-06-01 | 「记录」按钮 | 详情面板/操作栏 | UC-AUDIT-002 | BR-AUDIT-006 | 主播/运营人员 | violation_record.disposal_status → recorded | ✅ | 本轮新增独立元素帮助 |
| E-AUDIT-002-06-02 | 「断流」按钮 | 详情面板/操作栏 | UC-AUDIT-002 | BR-AUDIT-007 | 主播/运营人员 | live_stream.audit_status → stopped | ✅ | L1 可用，L4 置灰 |
| E-AUDIT-002-06-03 | 「忽略」按钮 | 详情面板/操作栏 | UC-AUDIT-002 | BR-AUDIT-008 | 主播/运营人员 | violation_record.disposal_status → ignored | ✅ | L1 不可忽略 |
| E-AUDIT-002-07 | 擦音模式切换 | 审查面板中部 | UC-AUDIT-002 | BR-AUDIT-009 | 主播/运营人员 | live_stream.mute_mode（写） | ✅ | 静音/擦音 |

### 3.3 PG-AUDIT-PC-003 回放详情审查页

| 元素 ID | 元素名称 | 位置 | 对应 UC | 对应 BR | 参与人 | 影响数据 | 已注入 `?` | 备注 |
|---|---|---|---|---|---|---|---|---|
| E-AUDIT-003-01 | 回放播放器 | 页面上部 | UC-AUDIT-003 | BR-AUDIT-010 | 审核员 | replay.media_url（只读） | ✅ | 展示已擦音回放 |
| E-AUDIT-003-02 | 擦音任务进度条 | 播放器下方 | UC-AUDIT-003 | BR-AUDIT-011 | 审核员 | replay.mute_task_status（只读） | ⚠️ 待补充 | 任务完成前操作区置灰 |
| E-AUDIT-003-03 | 时间轴违规标记 | 播放器进度条 | UC-AUDIT-003 | BR-AUDIT-012 | 审核员 | violation_record.violation_time（只读） | ✅ | 按级别颜色标记 |
| E-AUDIT-003-04 | 违规记录列表 | 播放器右侧 | UC-AUDIT-003 | BR-AUDIT-012 | 审核员 | violation_record（只读） | ✅ | 列出本场次违规 |
| E-AUDIT-003-05 | 擦音模式选择 | 操作区 | UC-AUDIT-003 | BR-AUDIT-009 | 审核员 | replay.mute_mode（写） | ✅ | 影响观众端效果 |
| E-AUDIT-003-06 | 「重新擦音」按钮 | 发布状态=已驳回时 | UC-AUDIT-003 | BR-AUDIT-015 | 审核员 | replay.mute_task_status → in_progress | ✅ | 驳回后触发重新擦音 |
| E-AUDIT-003-07 | 「核对通过·发布回放」按钮 | 发布状态=待核对时 | UC-AUDIT-003 | BR-AUDIT-004 | 审核员 | replay.publish_status → published | ✅ | 本轮新增 |
| E-AUDIT-003-08 | 「驳回重新擦音」按钮 | 发布状态=待核对时 | UC-AUDIT-003 | BR-AUDIT-015 | 审核员 | replay.publish_status → rejected | ✅ | 本轮新增 |
| E-AUDIT-003-09 | 发布状态标签 | 操作区上方 | UC-AUDIT-003 | BR-AUDIT-004 | 审核员 | replay.publish_status（只读） | ✅ | 待核对/已发布/已驳回 |
| E-AUDIT-003-10 | 擦音前后对比面板 | 页面中部 | UC-AUDIT-003 | BR-AUDIT-013 | 审核员 | replay.mute_segments（只读） | ✅ | 文本对比 |

### 3.4 PG-AUDIT-PC-004 历史违规列表面板

| 元素 ID | 元素名称 | 位置 | 对应 UC | 对应 BR | 参与人 | 影响数据 | 已注入 `?` | 备注 |
|---|---|---|---|---|---|---|---|---|
| E-AUDIT-004-01 | 历史违规入口 | 直播中控/回放管理 | UC-AUDIT-002 | BR-AUDIT-005 | 主播/运营人员 | violation_record（只读列表） | ✅ | 打开侧滑 drawer |
| E-AUDIT-004-02 | 顶部告警统计区 | 面板顶部 | UC-AUDIT-002 | BR-AUDIT-003 | 主播/运营人员 | violation_record（聚合） | ✅ | 与直播中控一致 |
| E-AUDIT-004-03 | 筛选器 | 列表上方 | UC-AUDIT-002 | BR-AUDIT-003 | 主播/运营人员 | violation_record（查询条件） | ✅ | 级别/状态/排序 |
| E-AUDIT-004-04 | 违规列表项 | 列表行 | UC-AUDIT-002 | BR-AUDIT-003 | 主播/运营人员 | violation_record（只读） | ✅ | |
| E-AUDIT-004-05 | 「记录」按钮 | 操作栏 | UC-AUDIT-002 | BR-AUDIT-006 | 主播/运营人员 | violation_record.disposal_status → recorded | ✅ | 复用 DisposalBar |
| E-AUDIT-004-06 | 「断流」按钮 | 操作栏 | UC-AUDIT-002 | BR-AUDIT-007 | 主播/运营人员 | live_stream.audit_status → stopped | ✅ | 复用 DisposalBar |
| E-AUDIT-004-07 | 「忽略」按钮 | 操作栏 | UC-AUDIT-002 | BR-AUDIT-008 | 主播/运营人员 | violation_record.disposal_status → ignored | ✅ | 复用 DisposalBar |

### 3.5 PG-AUDIT-PC-005 直播/回放管理列表

| 元素 ID | 元素名称 | 位置 | 对应 UC | 对应 BR | 参与人 | 影响数据 | 已注入 `?` | 备注 |
|---|---|---|---|---|---|---|---|---|
| E-AUDIT-005-01 | 直播管理 / 回放管理 Tab | 页面顶部 | UC-AUDIT-005 | BR-AUDIT-014 | 租户运营人员 | tenant.active_tab（UI 状态） | ✅ | 切换两个列表 |
| E-AUDIT-005-02 | 直播状态标签 | 直播列表 | UC-AUDIT-005 | BR-AUDIT-014 | 租户运营人员 | live_stream.status（只读） | ✅ | 直播中/已结束 |
| E-AUDIT-005-03 | 「中控台」按钮 | 直播列表操作列 | UC-AUDIT-005 | BR-AUDIT-002 | 租户运营人员 | live_stream.stream_id（路由参数） | ✅ | 仅直播中显示 |
| E-AUDIT-005-04 | 「更多」下拉菜单 | 直播/回放列表操作列 | UC-AUDIT-005 | BR-AUDIT-005 | 租户运营人员 | live_stream.stream_id（只读） | ✅ | 含查看历史违规/查看回放 |
| E-AUDIT-005-05 | 擦音状态标签 | 回放列表 | UC-AUDIT-005 | BR-AUDIT-011 | 租户运营人员 | replay.mute_status（只读） | ✅ | 未开始/擦音中/已完成 |
| E-AUDIT-005-06 | 发布状态标签 | 回放列表 | UC-AUDIT-005 | BR-AUDIT-004 | 租户运营人员 | replay.publish_status（只读） | ✅ | 待核对/已发布/已驳回 |
| E-AUDIT-005-07 | 「核对并发布」按钮 | 回放列表操作列 | UC-AUDIT-005 | BR-AUDIT-004 | 审核员 | replay.stream_id（路由参数） | ✅ | 擦音完成且待核对时显示 |
| E-AUDIT-005-08 | 更多 - 查看历史违规 | 下拉菜单项 | UC-AUDIT-005 | BR-AUDIT-005 | 租户运营人员 | violation_record（只读列表） | ⚠️ 菜单项内未单独加图标，依赖菜单整体 | 打开侧滑抽屉 |
| E-AUDIT-005-09 | 更多 - 查看回放 | 下拉菜单项 | UC-AUDIT-005 | BR-AUDIT-010 | 租户运营人员 | replay.stream_id（路由参数） | ⚠️ 菜单项内未单独加图标 | 跳转回放详情 |

### 3.6 PG-AUDIT-APP-001 观众端直播间

| 元素 ID | 元素名称 | 位置 | 对应 UC | 对应 BR | 参与人 | 影响数据 | 已注入 `?` | 备注 |
|---|---|---|---|---|---|---|---|---|
| E-AUDIT-006-01 | 播放器区域 | 页面中央 | UC-AUDIT-004 | BR-AUDIT-009 | 普通观众 | live_stream.media_url（只读） | ✅ | 观众无操作入口 |
| E-AUDIT-006-02 | 擦音/静音效果提示 | 播放器内/下方 | UC-AUDIT-004 | BR-AUDIT-009 | 普通观众 | live_stream.mute_mode（只读） | ✅ | 提示合规处理 |
| E-AUDIT-006-03 | 回调丢失提示 | 播放器内 | UC-AUDIT-004 | BR-AUDIT-016 | 普通观众 | callback_lost_event（只读） | ✅ | 网络/服务延迟 |
| E-AUDIT-006-04 | 直播结束提示 | 播放器内 | UC-AUDIT-004 | BR-AUDIT-007 | 普通观众 | live_stream.audit_status → stopped（只读） | ✅ | 断流后展示 |

---

## 4. 跨页面联动规则（5 级联动）

当 `tenant.audit_enabled` 变更时，以下元素/入口需联动：

| 联动项 | 关联元素 ID | 联动逻辑 | 对应数据 |
|---|---|---|---|
| 1. 直播中控 Tab 显示/隐藏 | E-AUDIT-002-01 | 关闭后 Tab 置灰/隐藏，面板只读 | live_stream.audit_status |
| 2. 直播列表更多入口显示/隐藏 | E-AUDIT-005-04 | 关闭后「查看历史违规」等入口隐藏 | tenant.audit_enabled |
| 3. 回放擦音任务触发/跳过 | E-AUDIT-005-05 | 关闭后回放不生成擦音任务 | replay.mute_status |
| 4. 观众端效果展示/跳过 | E-AUDIT-006-01/02 | 关闭后观众端不展示擦音/静音效果 | live_stream.mute_mode |
| 5. 历史违规入口显示/隐藏 | E-AUDIT-004-01 | 关闭后历史违规入口隐藏，但已有记录可查看 | tenant.audit_enabled |

---

## 5. 与用例卡片数据源一致性

| 用例卡片文件 | 覆盖元素 ID | 一致性检查 |
|---|---|---|
| `src/pages/audit-switch/useCaseCardData.ts` | E-AUDIT-001-01/02/03 | ✅ 与本表一致 |
| `src/pages/live-control/useCaseCardData.ts` | E-AUDIT-002-01~07 及 06-01/02/03 | ✅ 与本表一致 |
| `src/pages/replay/useCaseCardData.ts` | E-AUDIT-003-01~10 | ✅ 与本表一致 |
| `src/pages/violations/useCaseCardData.ts` | E-AUDIT-004-01~07 | ✅ 与本表一致 |
| `src/pages/tenant-dashboard/useCaseCardData.ts` | E-AUDIT-005-01~09 | ✅ 与本表一致 |
| `src/pages/viewer/useCaseCardData.ts` | E-AUDIT-006-01~04 | ✅ 与本表一致 |

---

## 6. 下游使用说明

### 6.1 FD 开发规范

1. 每个可交互元素（按钮、链接、开关、Tab、下拉菜单、表格列、状态标签）必须按本表 `元素 ID` 注入 `HelpIcon`；
2. `HelpIcon` 的 `@click` 必须调用 `openElementHelp('元素 ID')`；
3. 禁止凭感觉新增 `?` 或遗漏本表列出的元素；
4. 新增元素时必须先更新本映射表，再更新 `useCaseCardData.ts` 和代码。

### 6.2 BA 校验规范

1. 在 `/handoff` 前，BA 必须校验本表与 PRD 第 9 章 UC 的一一对应；
2. 若发现 UC 未覆盖元素，或元素未对应 UC，需在 PRD §19 回传；
3. 用例卡片中的 `system`、`module`、`page`、`participants`、`affectedData` 必须与本表一致。

### 6.3 QA 验收规范

1. 按本表逐元素检查是否存在 `?`；
2. 点击每个 `?` 后，抽屉应迅速闪烁高亮到对应条目；
3. 检查 `元素 ID` 在代码、`useCaseCardData.ts`、本表三处一致。

---

## 7. 门禁

| 门禁 | 说明 | 状态 |
|---|---|---|
| G-UX-DELIVERY-01 | UI 元素 ↔ UC 映射产物必须存在且通过 BA 一致性校验 | 已建立，待执行校验 |
| G-HO-DELIVERY-04 | 每个可交互元素必须有用例说明入口（`?`） | 已大部分注入，待 QA 验收 |
| G-REQ-17 | UC 六段格式完整 | 待 BA 补充 PRD 第 9 章 |

---

## 8. 变更记录

| 版本 | 日期 | 变更内容 | 变更人 |
|---|---|---|---|---|
| v1.0.0 | 2026-07-27 | 初始建立：覆盖 6 个页面、30+ 元素、5 级联动、与 useCaseCardData 一致性 | `/handoff` 流程 |
