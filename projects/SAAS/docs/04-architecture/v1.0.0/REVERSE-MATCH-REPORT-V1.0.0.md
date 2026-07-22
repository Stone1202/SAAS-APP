# 架构反向三文档一致性检查报告 V1.0.0

> **检查时间**：2026-07-22
> **检查人**：PM（基于 C-A13 铁律 + design-prd-reverse-match.yml V2.0.0）
> **检查范围**：SAAS 内容审查域 V1.0.0
> **检查方法**：5维度×5大反模式可执行扫描

---

## 检查结论

**⚠️ 有条件通过** — 架构整体质量良好，遗留1项MAJOR问题需决策，其余已修复。

| 维度 | 状态 | 通过项/总项 |
|------|------|------------|
| D1 路由三重一致性 | ⚠️ MAJOR | 5/6 |
| D2 业务系统边界隔离 | ✅ PASS | 4/4 |
| D3 FN/ENT/PG 全覆盖 | ✅ PASS | 3/3 |
| D4 DIR树与源码一致性 | ✅ PASS | 11/11 |
| D5 版本引用一致性 | ✅ 已修复 | 3/3 |

---

## 维度1：路由三重一致性（PRD §17 → 架构 §2.3 → router.ts）

### 通过项

| 检查项 | 结果 |
|--------|------|
| 路由前缀 `/admin/` `/tenant/` `/h5/` | ✅ 三终端前缀正确 |
| router.ts meta.terminal 声明 | ✅ 每条路由都有 terminal 标签 |
| router.ts meta.fn 声明覆盖率 | ✅ 除入口页外全部声明 |
| FN 全覆盖验证表 | ✅ 架构 §2.3 提供完整映射 |
| 页面入口功能对齐 | ✅ 每个 FN 可路由可达 |

### ⚠️ D1-01：3条路由与PRD §17路径不完全一致

| FN | PRD §17 | 架构实际 |
|----|---------|----------|
| FN-AUDIT-PC-001 | `/admin/tenant`（弹窗） | `/admin/audit-switch`（独立页） |
| FN-AUDIT-PC-002/003 | `/tenant/live/:streamId/violations` + `/tenant/live-control?tab=audit` | `/tenant/live-control/:streamId` |
| FN-AUDIT-PC-004 | `/tenant/live/:streamId/replay` | `/tenant/replay/:streamId` |

**评估**：差异源于架构合理化（弹窗→独立页、多入口合并、路径简化），功能语义一致。**建议**：更新 PRD §17 反映架构决策，或架构调整为严格对齐。不阻塞开发，但需在 close 前解决。

**反模式匹配**：AP-01「路由前缀混用」→ 未命中（前缀正确，仅路径结构精简）

### D2-FN 覆盖详情

| FN | 路由 | PG | 状态 |
|----|------|----|------|
| FN-AUDIT-INFRA-001 | 无独立路由（嵌入 SimAdapter） | 共享基础设施 | ✅ |
| FN-AUDIT-PC-001 | `/admin/audit-switch` | PG-AUDIT-PC-001 | ✅ |
| FN-AUDIT-PC-002 | `/tenant/live-control/:streamId` | PG-AUDIT-PC-002（嵌入） | ✅ |
| FN-AUDIT-PC-003 | `/tenant/live-control/:streamId` | PG-AUDIT-PC-002（嵌入） | ✅ |
| FN-AUDIT-PC-004 | `/tenant/replay/:streamId` | PG-AUDIT-PC-003 | ✅ |
| FN-AUDIT-APP-001 | `/h5/live/:roomId` | PG-AUDIT-APP-001 | ✅ |

---

## 维度2：业务系统边界隔离

| 检查项 | 结果 |
|--------|------|
| components/audit/operator/ | ✅ PC-运营后台专属（`/admin/`） |
| components/audit/tenant/ | ✅ PC-租户后台专属（`/tenant/`） |
| components/audit/viewer/ | ✅ H5-观众端专属（`/h5/`） |
| router.ts meta.terminal → 归属声明 | ✅ 全部正确 |
| 跨系统混放检查 | ✅ 无 |

> 注：组件目录当前仅含 README.md，实际组件待 FD 阶段实现。

**反模式匹配**：AP-02「业务系统组件混放」→ 未命中

---

## 维度3：FN / ENT / PG 全覆盖

### ENT 实体覆盖

| ENT | Zod Schema | 状态 |
|-----|-----------|------|
| ENT-AUDIT-001 (ReviewViolation) | ReviewViolationSchema | ✅ |
| ENT-AUDIT-002 (ReviewDisposal) | ReviewDisposalSchema | ✅ |
| ENT-AUDIT-003 (TenantAuditConfig) | TenantAuditConfigSchema | ✅ |
| ENT-AUDIT-004 (ReplayMuteTask) | ReplayMuteTaskSchema | ✅ |
| ENT-AUDIT-005 (ReplayFile) | ReplayFileSchema | ✅ |

### PG 页面覆盖

| PG | 页面文件 | 状态 |
|----|---------|------|
| PG-AUDIT-PC-001 | AuditSwitchPage.vue | ✅ |
| PG-AUDIT-PC-002 | LiveControlAuditPanel.vue | ✅ |
| PG-AUDIT-PC-003 | ReplayDetailAudit.vue | ✅ |
| PG-AUDIT-APP-001 | AudienceLiveRoom.vue | ✅ |
| PG-ENTRY-TENANT-001 | TenantDashboardEntry.vue | ✅ |

**反模式匹配**：AP-03「FN覆盖遗漏」→ 未命中 / AP-04「ENT缺失」→ 未命中

---

## 维度4：DIR树与源码一致性

| 架构DIR声明的文件 | 实际存在 |
|-------------------|----------|
| contracts/schemas/audit-schemas.ts | ✅ |
| contracts/api/audit-api.ts | ✅ |
| contracts/state-machine/audit-state-machine.ts | ✅ |
| contracts/index.ts | ✅（已补充到DIR树） |
| stores/audit-store.ts | ✅ |
| services/audit-service.ts | ✅ |
| adapters/sim/ 三文件 | ✅ |
| adapters/real/ 三文件 | ✅ |
| pages/ 五页面 | ✅ |
| router/index.ts | ✅ |
| main.ts | ✅ |

**判定**：✅ 全部11项一致

---

## 维度5：版本引用一致性

| 检查项 | 结果 |
|--------|------|
| state.json design_path → 实际文件名 | ✅ 已修复（v1.0.1→v1.0.0） |
| 架构文档关联设计 → 实际设计文档 | ✅ v1.0.0 一致 |
| 架构文档下一步红线版本 | ✅ 已修复（C-A1~C-A10→C-A1~C-A13） |
| 设计文档内部标题版本 | ⚠️ 内容标题 V1.0.1 vs 文件名 v1.0.0（非阻断） |

**反模式匹配**：AP-05「版本引用不一致」→ state.json 已修复，设计文档标题为遗留

---

## 红线逐条验证

| 红线 | 名称 | 状态 |
|------|------|------|
| C-A1 | route-contract 路由映射 | ✅ |
| C-A2 | npm run dev 可启动骨架 | ❓ 待实测 |
| C-A3 | sim/real 切换契约 | ✅ |
| C-A4 | 三段回溯表（FN→PG→路由） | ✅ |
| C-A5 | 契约 Zod 完整性 | ✅ |
| C-A6 | 五维可插拔 | ✅ |
| C-A7 | 单元测试架构 | ❓ tests/ 为空 |
| C-A8 | NFR清单完整性 | ✅ |
| C-A9 | Mock后端完整性 | ✅ |
| C-A10 | 跨端验收脚手架 | ❓ 待确认 |
| C-A11 | 路由对齐PRD §17 | ⚠️ 见D1-01 |
| C-A12 | 业务系统隔离 | ✅ |
| C-A13 | 反向三文档一致性检查 | ✅ 本报告 |

---

## 问题清单

| ID | 严重度 | 问题 | 状态 |
|----|--------|------|------|
| D5-01 | 🔴 BLOCKER | state.json 设计版本 v1.0.1→v1.0.0 | ✅ 已修复 |
| D5-02 | 🟢 MINOR | 架构文档 C-A1~C-A10→C-A1~C-A13 | ✅ 已修复 |
| D4-01 | 🟢 MINOR | DIR树补 contracts/index.ts | ✅ 已修复 |
| D1-01 | 🟡 MAJOR | 路由与PRD §17路径不完全一致 | 📋 待决策 |

---

## 后续行动

| 行动 | 负责人 | 时机 |
|------|--------|------|
| D1-01 决策：更新PRD或调整路由 | PM + Arch | close前 |
| C-A2/A7/A10 实测验证 | FD | stage-5 启动前 |
| 设计文档内部标题统一为 V1.0.0 | UX | 下一迭代 |

---

> **生成时间**：2026-07-22 | **检查标准**：design-prd-reverse-match.yml V2.0.0 | **状态**：✅ 检查完成，可流转
