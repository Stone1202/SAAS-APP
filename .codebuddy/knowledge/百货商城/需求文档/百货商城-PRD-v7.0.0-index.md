# 百货商城 PRD v7.0.0 — 版本索引

> **版本链概览**：本索引覆盖百货商城全部历史版本
> **当前版本**：v7.0.0（场景深度还原引擎 + 双态标注）
> **生成日期**：2026-07-21

---

## 当前交付物（v7.0.0）

| 类型 | 文件名 | 说明 |
|------|--------|------|
| ⭐ 最终交付物 | [百货商城-超级需求文档-PRD-v7.0.0.md](./百货商城-超级需求文档-PRD-v7.0.0.md) | V7.0.0 场景深度还原引擎生成 |
| 学习报告 | [../学习报告/百货商城-学习报告-v7.0.0.md](../学习报告/百货商城-学习报告-v7.0.0.md) | 含场景深度还原报告+依据链审计 |

---

## 历史版本归档

| 版本 | 日期 | 文件名 | 还原模式 | 说明 |
|------|------|--------|---------|------|
| v1.0 | 2026-07-15 | [百货商城-PRD-v1.0-vol1-商城管理.md](./百货商城-PRD-v1.0-vol1-商城管理.md) | 忠实还原 v4.0.0 | Vol1 商城管理（6模块/6页面/23UC） |
| v1.0 | 2026-07-15 | [百货商城-PRD-v1.0-vol2-商城配置.md](./百货商城-PRD-v1.0-vol2-商城配置.md) | 忠实还原 v4.0.0 | Vol2 商城配置（4模块/4页面/10UC） |
| v1.0 | 2026-07-15 | [百货商城-PRD-v1.0-vol3-门店进销存.md](./百货商城-PRD-v1.0-vol3-门店进销存.md) | 忠实还原 v4.0.0 | Vol3 门店进销存（5模块/6页面/15UC/1状态机） |
| v1.0 | 2026-07-15 | [百货商城-PRD-v1.0-vol4-小程序端.md](./百货商城-PRD-v1.0-vol4-小程序端.md) | 忠实还原 v4.0.0 | Vol4 小程序端（9模块/9页面/12UC） |
| v1.0 | 2026-07-15 | [百货商城-PRD-v1.0-index.md](./百货商城-PRD-v1.0-index.md) | 索引 | v1.0 4卷索引 |
| v1.6.1 | 2026-07-15 | [百货商城-PRD-v1.6.1.md](./百货商城-PRD-v1.6.1.md) | 忠实还原 v4.0.0 | 整卷合并（29FN/7BR/6ENT/5SC/5MET/7图） |

---

## 版本演进链

```
百货商城 PRD 版本演进
├── v1.0.0 (2026-07-15) — learn-project v4.0.0 忠实还原 4卷分册
│   ├── vol1-商城管理
│   ├── vol2-商城配置
│   ├── vol3-门店进销存
│   └── vol4-小程序端
├── v1.6.1 (2026-07-15) — learn-project v4.0.0 整卷合并+BO/BG/MET/五图
└── v7.0.0 (2026-07-21) — learn-project V7.0.0 场景深度还原引擎 ⭐ 当前
    ├── 双源整合（v1.0+v1.6.1）
    ├── 双态标注（📗显式照录 + 🟡隐式挖掘还原）
    ├── 场景深度还原引擎8项能力
    ├── 追溯链对齐方案B扩展
    └── CONFIG/METRIC/NFR 补全
```

---

## V7.0.0 全局追溯链

### UC → PG 映射表

| 用例编号 (UC) | 名称 | 所属页面 (PG) | 所属 FN |
|---------------|------|--------------|---------|
| UC-MALL-PC-001 | 商品分类管理 | PG-MALL-PC-001 | FN-MALL-PC-001 |
| UC-MALL-PC-002 | 商品新建/编辑 | PG-MALL-PC-001 | FN-MALL-PC-002 |
| UC-MALL-PC-003 | 商品上架/下架 | PG-MALL-PC-001 | FN-MALL-PC-003 |
| UC-MALL-PC-004 | 提审商品销售场景设置 | PG-MALL-PC-001 | FN-MALL-PC-004 |
| UC-MALL-PC-005 | 订单列表查询 | PG-MALL-PC-002 | FN-MALL-PC-005 |
| UC-MALL-PC-006 | 订单详情查看 | PG-MALL-PC-002 | FN-MALL-PC-006 |
| UC-MALL-PC-007 | 发货管理 | PG-MALL-PC-003 | FN-MALL-PC-007 |
| UC-MALL-PC-008 | 多快递单号支持 | PG-MALL-PC-003 | FN-MALL-PC-008 |
| UC-MALL-PC-009 | 物流轨迹多包裹展示 | PG-MALL-PC-003 | FN-MALL-PC-009 |
| UC-MALL-PC-010 | 订单导出优化 | PG-MALL-PC-002 | FN-MALL-PC-010 |
| UC-MALL-PC-011 | 收货管理（后台） | PG-MALL-PC-005 | FN-MALL-PC-011 |
| UC-MALL-PC-012 | 交易流水查询 | PG-MALL-PC-006 | FN-MALL-PC-012 |
| UC-MALL-PC-013 | 实时库存 | PG-MALL-PC-007 | FN-MALL-PC-013 |
| UC-MALL-PC-014 | 库存流水 | PG-MALL-PC-008 | FN-MALL-PC-014 |
| UC-MALL-PC-015 | 售后订单列表 | PG-MALL-PC-009 | FN-MALL-PC-015 |
| UC-MALL-PC-016 | 退款审核退货地址回显 | PG-MALL-PC-009 | FN-MALL-PC-016 |
| UC-MALL-PC-017 | 售后订单状态流转 | PG-MALL-PC-009 | FN-MALL-PC-017 |
| UC-MALL-PC-018 | 门店退货物流状态Tab与列表 | PG-MALL-PC-010 | FN-MALL-PC-018 |
| UC-MALL-PC-019 | 门店退货物流查看详情 | PG-MALL-PC-010 | FN-MALL-PC-019 |
| UC-MALL-SP-001 | 供应商确认收货 | PG-MALL-PC-010 | FN-MALL-SP-001 |
| UC-MALL-PC-020 | 门店退货物流导出 | PG-MALL-PC-010 | FN-MALL-PC-020 |
| UC-MALL-PC-021 | 退货返厂 | PG-MALL-MP-009 | FN-MALL-PC-021 |
| UC-MALL-PC-022 | 调拨管理库存校验 | PG-MALL-MP-005 | FN-MALL-PC-022 |
| UC-MALL-PC-023 | 退货商品统计 | PG-MALL-PC-011 | FN-MALL-PC-023 |
| UC-MALL-MP-001 | 退款审核退货地址回显 | PG-MALL-MP-001 | FN-MALL-MP-001 |
| UC-MALL-MP-002 | 退款/售后详情退货地址回显 | PG-MALL-MP-002 | FN-MALL-MP-002 |
| UC-MALL-MP-003 | 填写物流单号显隐控制 | PG-MALL-MP-002 | FN-MALL-MP-003 |
| UC-MALL-MP-004 | 收货管理多包裹物流查看 | PG-MALL-MP-003 | FN-MALL-MP-004 |
| UC-MALL-MP-005 | 我的订单多包裹物流 | PG-MALL-MP-004 | FN-MALL-MP-005 |
| UC-MALL-MP-006 | 待收货入口显隐控制 | PG-MALL-MP-011 | FN-MALL-MP-006 |
| UC-MALL-MP-007 | 更多模块功能入口显隐 | PG-MALL-MP-006 | FN-MALL-MP-007 |
| UC-MALL-MP-008 | 福利券领取记录 | PG-MALL-MP-007 | FN-MALL-MP-008 |
| UC-MALL-MP-009 | 游客模式未登录展示商品 | PG-MALL-MP-008 | FN-MALL-MP-009 |
| UC-MALL-MP-010 | 登录未绑定用户展示商品 | PG-MALL-MP-008 | FN-MALL-MP-010 |
| UC-MALL-MP-011 | 小程序库存管理返厂锁定统计 | PG-MALL-MP-010 | FN-MALL-MP-011 |
| UC-MALL-PC-024 | 地址配置列表 | PG-MALL-PC-012 | FN-MALL-PC-024 |
| UC-MALL-PC-025 | 地址配置新增/编辑 | PG-MALL-PC-012 | FN-MALL-PC-025 |
| UC-MALL-PC-026 | 地址配置删除确认 | PG-MALL-PC-012 | FN-MALL-PC-026 |
| UC-MALL-PC-027 | 地址配置设置默认地址 | PG-MALL-PC-012 | FN-MALL-PC-027 |
| UC-MALL-PC-028 | 操作员角色地址配置权限 | PG-MALL-PC-013 | FN-MALL-PC-028 |
| UC-MALL-PC-029 | 操作员角色供应商管理确认收货权限 | PG-MALL-PC-013 | FN-MALL-PC-029 |
| UC-MALL-PC-030 | 审核提醒 | PG-MALL-PC-014 | FN-MALL-PC-030 |
| UC-MALL-PC-031 | 业务流程辅助页 | PG-MALL-PC-015 | FN-MALL-PC-031 |

### FN → BR 映射表

| FN | 关联 BR |
|----|---------|
| FN-MALL-PC-004 | BR-MALL-008 |
| FN-MALL-PC-008 | BR-MALL-009, BR-MALL-010 |
| FN-MALL-PC-009 | BR-MALL-005, BR-MALL-010 |
| FN-MALL-PC-013 | BR-MALL-011, BR-MALL-012, BR-MALL-013 |
| FN-MALL-PC-016 | BR-MALL-001 |
| FN-MALL-PC-018 | BR-MALL-015, BR-MALL-016 |
| FN-MALL-PC-022 | BR-MALL-017, BR-MALL-018 |
| FN-MALL-PC-023 | BR-MALL-019 |
| FN-MALL-PC-025 | BR-MALL-021 |
| FN-MALL-PC-026 | BR-MALL-022 |
| FN-MALL-PC-027 | BR-MALL-023 |
| FN-MALL-PC-030 | BR-MALL-024 |
| FN-MALL-SP-001 | BR-MALL-013, BR-MALL-015 |
| FN-MALL-MP-001 | BR-MALL-001 |
| FN-MALL-MP-002 | BR-MALL-001 |
| FN-MALL-MP-003 | BR-MALL-002 |
| FN-MALL-MP-004 | BR-MALL-005, BR-MALL-020 |
| FN-MALL-MP-005 | BR-MALL-005 |
| FN-MALL-MP-006 | BR-MALL-003 |
| FN-MALL-MP-007 | BR-MALL-004 |
| FN-MALL-MP-008 | BR-MALL-007 |
| FN-MALL-MP-009 | BR-MALL-006 |
| FN-MALL-MP-010 | BR-MALL-006 |
| FN-MALL-MP-011 | BR-MALL-012, BR-MALL-013 |

### BR → CONFIG 映射表

| BR | depends_on CONFIG |
|----|-------------------|
| BR-MALL-001 | CONFIG-MALL-001（自提订单退货地址是否默认为门店地址） |
| BR-MALL-002 | CONFIG-MALL-002（自提订单退货是否需要填写物流信息） |
| BR-MALL-003 | CONFIG-MALL-003（是否显示待收货订单状态） |
| BR-MALL-004 | CONFIG-MALL-004（小程序更多模块功能权限） |

### 实体 → 页面 映射表

| 实体 (ENT) | 关联页面 |
|------------|---------|
| ENT-MALL-01 商品 | PG-MALL-PC-001, PG-MALL-PC-002, PG-MALL-MP-008 |
| ENT-MALL-02 订单 | PG-MALL-PC-002, PG-MALL-MP-004 |
| ENT-MALL-03 售后订单 | PG-MALL-PC-009, PG-MALL-MP-002 |
| ENT-MALL-04 门店退货物流 | PG-MALL-PC-010 |
| ENT-MALL-05 退货返厂 | PG-MALL-MP-009 |
| ENT-MALL-06 福利券 | PG-MALL-MP-007 |
| ENT-MALL-07 库存 | PG-MALL-PC-007, PG-MALL-PC-008, PG-MALL-MP-010, PG-MALL-MP-005 |
| ENT-MALL-08 库存流水 | PG-MALL-PC-008 |
| ENT-MALL-09 地址 | PG-MALL-PC-012 |
| ENT-MALL-10 交易相关配置项 | PG-MALL-PC-006 |

### SC → PG 映射表

| SC | 关联 PG |
|----|---------|
| SC-MALL-001 用户完整购物流程 | PG-MALL-MP-004, PG-MALL-PC-002, PG-MALL-PC-003 |
| SC-MALL-002 用户退货退款流程 | PG-MALL-MP-002, PG-MALL-PC-009 |
| SC-MALL-003 游客浏览商品流程 | PG-MALL-MP-008 |
| SC-MALL-004 门店退货返厂流程 | PG-MALL-MP-009 |
| SC-MALL-005 门店退货物流流程 | PG-MALL-PC-010 |
| SC-MALL-006 多快递单号发货 | PG-MALL-PC-003 |
| SC-MALL-007 调拨库存校验 | PG-MALL-MP-005 |
| SC-MALL-008 审核提醒弹窗 | PG-MALL-PC-014 |
| SC-MALL-009 退货商品数据报表 | PG-MALL-PC-011 |
| SC-MALL-010 待收货入口配置联动 | PG-MALL-MP-011, PG-MALL-MP-004 |

### 状态机节点 → FN 映射表

| 状态机 | 节点 | 触发 FN |
|--------|------|---------|
| 售后订单 | 待审核 | FN-MALL-PC-015（提交） |
| 售后订单 | 审核通过 | FN-MALL-PC-017（店长同意） |
| 售后订单 | 审核不通过 | FN-MALL-PC-017（店长拒绝） |
| 售后订单 | 待退货 | FN-MALL-MP-003（用户填写物流） |
| 售后订单 | 已退货 | FN-MALL-PC-017（店长确认收货） |
| 售后订单 | 已完成 | 系统自动退款 |
| 门店退货物流 | 待审核 | 售后审核通过触发 |
| 门店退货物流 | 审核通过 | FN-MALL-PC-018（供应商审核） |
| 门店退货物流 | 审核不通过 | FN-MALL-PC-018（供应商审核） |
| 门店退货物流 | 待收货 | 门店寄出商品 |
| 门店退货物流 | 已收货 | FN-MALL-SP-001（供应商确认收货） |
| 退货返厂 | 待返厂 | FN-MALL-PC-021（提交返厂申请） |
| 退货返厂 | 审核中 | FN-MALL-PC-021（确定返厂） |
| 退货返厂 | 审核通过 | 平台审核 |
| 退货返厂 | 审核不通过 | 平台审核 |
| 退货返厂 | 已完成 | FN-MALL-PC-021（填写物流） |

---

> **当前版本**：v7.0.0（场景深度还原引擎）
> **学习报告**：[../学习报告/百货商城-学习报告-v7.0.0.md](../学习报告/百货商城-学习报告-v7.0.0.md)
