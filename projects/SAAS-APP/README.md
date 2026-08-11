# SAAS-APP — 配置式装修电商 SaaS 高保真原型

> **项目代号**: SAAS-APP | **立项日期**: 2026-08-07 | **当前版本**: v2.1.0
> **需求流**: STR-SAAS-002（APP端）

---

## 一、项目概述

SAAS-APP 是面向「配置式装修」电商场景的 SaaS 高保真原型，为多租户提供统一的 APP 端电商能力。平台采用**四层层级模型**：

```
平台（SAAS运营后台）
  └─ 租户（概念层，数据隔离）
       └─ 项目（独立销售单元）
            └─ 门店（提货点/销售点）
```

### 核心能力

| 模块 | 入口 | 说明 |
|------|------|------|
| **APP-平台端** | `app.html` | 5 Tab 移动端容器（首页/商城/娱乐/消息/我的） |
| **APP-项目端** | `app.html#/app/project/:id` | 4 Tab 项目容器（首页/门店/直播/会员） |
| **运营后台** | `admin.html` | 搜索/广告/金刚区/直播推荐/商品推荐/楼层 6 个管理页 |
| **租户后台** | `tenant.html` | 项目/门店/项目首页配置 3 个管理页 |

---

## 二、技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 | ^3.4.21 |
| 构建工具 | Vite | ^5.2.6 |
| 状态管理 | Pinia | ^2.1.7 |
| UI 组件库 | Element Plus | ^2.6.3 |
| 路由 | Vue Router（Hash 模式） | ^4.3.0 |
| 类型校验 | TypeScript + Zod | ^5.4.3 / ^3.22.4 |

---

## 三、快速启动

```bash
# 1. 安装依赖
cd pom-workspace/projects/SAAS-APP
npm install

# 2. 启动开发服务器（默认端口 5174）
npm run dev

# 3. 构建生产包
npm run build
```

---

## 四、原型入口

开发服务器启动后，通过以下 URL 访问各端原型：

| 终端 | URL | 默认页 |
|------|-----|--------|
| **APP 端** | http://localhost:5174/app.html | `#/app/home` 平台首页 |
| **运营后台** | http://localhost:5174/admin.html | `#/admin/search` 搜索管理 |
| **租户后台** | http://localhost:5174/tenant.html | `#/tenant/projects` 项目管理 |

> 路由采用 Hash 模式（`createWebHashHistory`），多入口隔离互不干扰。

---

## 五、目录结构（简）

```
SAAS-APP/
├── README.md                  ← 本文件
├── CHANGELOG.md               ← 版本变更记录
├── PROJECT-STRUCTURE.md       ← 详细目录结构说明
├── package.json
├── vite.config.ts
├── app.html / admin.html / tenant.html
└── src/
    ├── contracts/             契约层（Zod Schema）
    ├── stores/                状态层（Pinia + localStorage 持久化）
    ├── services/              服务层（data-service 数据持久化）
    ├── components/            组件层（admin / app）
    ├── pages/                 页面层（admin-app / app / tenant-app）
    ├── router/                路由（单一事实源）
    └── main-*.ts              多入口（app / admin / tenant）
```

详见 [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)。

---

## 六、版本里程碑

| 版本 | 日期 | 范围 | 状态 |
|------|------|------|------|
| **v2.0.0** | 2026-08-07 | APP 端「配置式装修」电商脑暴立项（42 文件） | ✅ Closed |
| **v2.1.0** | 2026-08-07 | 前后端数据同步 + 搜索完善 + APP 首页重构 | ✅ Closed |

详见 [CHANGELOG.md](./CHANGELOG.md)。

---

## 七、数据持久化机制

本项目采用 **localStorage + Pinia watch** 实现前端数据持久化，模拟前后端数据交互：

| Store | localStorage Key | 说明 |
|-------|------------------|------|
| `app-config-store` | `saas:app-config` | 热搜词、自定义搜索结果、广告 Banner、金刚区、推荐配置 |
| `project-store` | `saas:project` | 项目、门店、商品、直播 Mock 数据 |
| `user-store` | `saas:user` | 用户、会员、消息数据 |

- 运营后台/租户后台修改数据 → Pinia store 更新 → `watch(deep)` 自动写入 localStorage
- APP 端读取数据 → 从 localStorage 反序列化 → 注入 store → 页面响应式渲染

支持数据导出/导入/重置（见 `src/services/data-service.ts`）。

---

## 八、关联文档

| 文档 | 路径 |
|------|------|
| 脑暴确认稿 | `docs/00-brainstorm/APP端/confirmed/BR-脑暴文档-APP端-确认稿.md` |
