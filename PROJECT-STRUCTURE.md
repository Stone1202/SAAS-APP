# SAAS-APP 项目目录结构文档

> **项目**: SAAS-APP | **更新日期**: 2026-08-07 | **版本**: v2.1.0

---

## 项目根目录

```
SAAS-APP/
├── README.md                  ← 项目总览（入口文档）
├── CHANGELOG.md               ← 版本变更记录
├── PROJECT-STRUCTURE.md       ← 本文件（目录结构说明）
├── package.json               ← 项目依赖与脚本（dev/build）
├── package-lock.json
├── vite.config.ts             ← Vite 配置（多入口构建：admin/tenant/app）
├── tsconfig.json              ← TypeScript 配置
├── tsconfig.node.json
├── env.d.ts                   ← 环境类型声明
├── app.html                   ← APP 端入口 HTML
├── admin.html                 ← 运营后台入口 HTML
├── tenant.html                ← 租户后台入口 HTML
├── index.html                 ← 默认入口（重定向）
│
├── src/                       ← 源码
├── docs/                      ← 项目文档
├── public/                    ← 静态资源
├── scripts/                   ← 构建辅助脚本
└── screenshots/               ← 验收截图
```

---

## 源码结构：`src/`

采用**四层架构**（契约 → 状态 → 服务 → 组件 → 页面）：

```
src/
├── App.vue                     ← 根组件
├── main.ts                     ← 默认入口（index.html）
├── main-app.ts                 ← APP 端入口（app.html，Hash→#/app/home）
├── main-admin.ts               ← 运营后台入口（admin.html，Hash→#/admin/search）
├── main-tenant.ts              ← 租户后台入口（tenant.html，Hash→#/tenant/projects）
├── env.d.ts                    ← Vite 环境类型
│
├── router/
│   └── index.ts                ← 路由配置（单一事实源，Hash 模式）
│
├── contracts/                  ← 契约层（Zod Schema）
│   ├── index.ts                ← 契约导出汇总
│   └── schemas/
│       ├── app-schemas.ts      ← APP 端 Schema（AdBanner/HotWord/CustomSearchResult 等）
│       └── project-schemas.ts  ← 项目/门店/商品/直播 Schema
│
├── stores/                     ← 状态层（Pinia + localStorage 持久化）
│   ├── app-config-store.ts     ← APP 配置 → localStorage[saas:app-config]
│   ├── project-store.ts        ← 项目/门店/商品/直播 → localStorage[saas:project]
│   └── user-store.ts           ← 用户/会员/消息 → localStorage[saas:user]
│
├── services/                   ← 服务层
│   └── data-service.ts         ← localStorage CRUD（序列化/反序列化/导出/导入/重置）
│
├── components/                  ← 组件层
│   ├── admin/                  ← 后台通用组件
│   │   ├── AdminLayout.vue         ← 运营后台布局（左侧菜单 6 项 + router-view :key）
│   │   ├── TenantLayout.vue        ← 租户后台布局（左侧菜单 3 项，紫色主题）
│   │   └── JumpTargetPicker.vue    ← 跳转目标选择器（通用：商品/项目/直播/URL）
│   │
│   ├── app/                    ← APP 端组件
│   │   ├── layout/
│   │   │   ├── MobileFrame.vue     ← 平台 5 Tab 容器
│   │   │   └── ProjectFrame.vue   ← 项目 4 Tab 容器
│   │   ├── home/
│   │   │   ├── BannerCarousel.vue  ← Banner 轮播（图片优先 + 底部标签）
│   │   │   ├── KingKongGrid.vue    ← 金刚区网格
│   │   │   └── OperationFloor.vue  ← 运营楼层
│   │   ├── mall/               ← 商城组件
│   │   ├── live/               ← 直播组件
│   │   ├── member/             ← 会员组件
│   │   ├── product/            ← 商品组件
│   │   └── store/              ← 门店组件
│   │
│   └── use-case-card/          ← 用例卡片组件
│
└── pages/                      ← 页面层
    ├── admin-app/              ← 运营后台管理页
    │   ├── AdManage.vue            ← 广告位管理（图片上传 + JumpTargetPicker）
    │   ├── KingKongManage.vue      ← 金刚区管理
    │   ├── SearchManage.vue        ← 搜索管理（热搜词/自定义结果）
    │   ├── LiveRecommendManage.vue    ← 直播推荐管理
    │   ├── ProductRecommendManage.vue ← 商品推荐管理
    │   ├── FloorManage.vue         ← 楼层管理
    │   └── RecommendManage.vue     ← [已废弃] 旧推荐管理
    │
    ├── tenant-app/            ← 租户后台管理页
    │   ├── ProjectManage.vue      ← 项目管理
    │   ├── StoreManage.vue        ← 门店管理
    │   └── ProjectHomeConfig.vue  ← 项目首页配置（Banner 管理）
    │
    └── app/                   ← APP 端页面
        ├── home/PlatformHome.vue      ← 平台首页
        ├── mall/MallPage.vue          ← 商城页
        ├── entertainment/             ← 娱乐页（占位）
        ├── message/                  ← 消息页（占位）
        ├── mine/                      ← 个人中心 + 会员中心
        ├── project/                  ← 项目首页/门店/直播/会员
        ├── store/StoreDetail.vue      ← 门店详情
        └── search/                   ← 搜索页 + 搜索结果页
```

---

## 文档结构：`docs/`

```
docs/
└── 00-brainstorm/            ← 脑暴文档
    └── APP端/confirmed/      ← BR-脑暴文档-APP端-确认稿.md（v2.1.0）
```

---

## 路由总表

### APP 端（`/app/`，`MobileFrame` 包裹）

| 路由 | 组件 | Tab |
|------|------|-----|
| `/app/home` | `PlatformHome` | Tab1 首页 |
| `/app/mall` | `MallPage` | Tab2 商城 |
| `/app/entertainment` | `EntertainmentPage` | Tab3 娱乐 |
| `/app/message` | `MessagePage` | Tab4 消息 |
| `/app/mine` | `PlatformMine` | Tab5 我的 |
| `/app/mine/member` | `PlatformMember` | 会员中心 |
| `/app/search` | `SearchPage` | 搜索页 |
| `/app/search/result` | `SearchResultPage` | 搜索结果 |

### 项目维度（`/app/project/:projectId`，`ProjectFrame` 包裹）

| 路由 | 组件 | Tab |
|------|------|-----|
| `/app/project/:id` | `ProjectHome` | Tab1 首页 |
| `/app/project/:id/stores` | `ProjectStores` | Tab2 门店 |
| `/app/project/:id/lives` | `ProjectLives` | Tab3 直播 |
| `/app/project/:id/member` | `ProjectMember` | Tab4 会员 |
| `/app/project/:id/store/:storeId` | `StoreDetail` | 门店详情 |

### 运营后台（`/admin/`，`AdminLayout` 包裹）

| 路由 | 组件 | 说明 |
|------|------|------|
| `/admin/search` | `SearchManage` | 搜索管理 |
| `/admin/ad` | `AdManage` | 广告位管理 |
| `/admin/kingkong` | `KingKongManage` | 金刚区管理 |
| `/admin/live-recommend` | `LiveRecommendManage` | 直播推荐 |
| `/admin/product-recommend` | `ProductRecommendManage` | 商品推荐 |
| `/admin/floor` | `FloorManage` | 楼层管理 |

### 租户后台（`/tenant/`，`TenantLayout` 包裹）

| 路由 | 组件 | 说明 |
|------|------|------|
| `/tenant/projects` | `ProjectManage` | 项目管理 |
| `/tenant/projects/:id/stores` | `StoreManage` | 门店管理 |
| `/tenant/projects/:id/home-config` | `ProjectHomeConfig` | 项目首页配置 |

### 默认重定向

| 路由 | 重定向到 |
|------|----------|
| `/` | `/app/home` |

---

## 数据持久化映射

| Store | localStorage Key | 持久化方式 |
|-------|------------------|------------|
| `app-config-store` | `saas:app-config` | `watch(deep)` 自动同步 |
| `project-store` | `saas:project` | `watch(deep)` 自动同步 |
| `user-store` | `saas:user` | `watch(deep)` 自动同步 |

数据流向：后台修改 → Pinia → `watch` → `data-service.save()` → localStorage → APP 端读取 → 反序列化 → store → 响应式渲染