# BR-脑暴文档-确认稿 — SAAS「配置式装修」电商APP端

> **项目**: SAAS | **议题**: APP端（平台APP+项目APP+运营/租户后台配置） | **脑暴类型**: planning | **版本**: v2.1.0
> **日期**: 2026-08-07 | **BS Agent**: 脑暴会议主持
> **领域知识**: 本次Sprint实施：51个文件（4层架构：契约层/Store层/组件层/页面层/服务层）
> **补充资料**: SAAS内容审查域 v1.0.0（三终端复用模式参考）

---

## 版本概要

| 版本 | 日期 | 脑暴类型 | 变更摘要 |
|------|------|----------|----------|
| v2.1.0 | 2026-08-07 | planning | 前后端数据同步（localStorage持久化）+ 搜索功能完善（搜索二级页+热搜词图标标签+自定义结果关联跳转）+ APP首页重构（Logo+追伴名称/直播推荐置顶/移除秒杀/移除首页热搜词）+ 运营后台扩展（搜索管理/直播推荐管理/商品推荐管理替代旧推荐管理） |
| v2.0.0 | 2026-08-07 | planning | 「配置式装修」电商APP端脑暴：平台→租户→项目→门店四层模型，5 Tab APP容器，运营后台4配置页，租户后台3管理页，共42文件（40新增+4修改） |

---

## 一、议题背景与业务构想

### 1.1 业务构想

构建SAAS级「配置式装修」电商平台，为多租户提供统一的APP端电商能力。平台采用**四层层级模型**：

```
平台（SAAS运营后台）
  └─ 租户（概念层，数据隔离）
       └─ 项目（独立销售单元，每个租户可有多个项目）
            └─ 门店（提货点/销售点/两者兼备）
```

消费者通过统一APP入口进入，可在**平台首页**浏览所有项目，也可进入**项目维度**查看门店、直播、会员。平台运营方通过运营后台配置广告/金刚区/推荐/楼层/搜索；租户通过租户后台管理自己的项目/门店/首页。

### 1.2 核心功能（四大模块）

| 模块 | 描述 | 核心价值 |
|------|------|----------|
| **APP-平台端** | 5 Tab移动端容器（首页/商城/娱乐/消息/我的），展示平台级运营内容 | 消费者统一入口，品牌展示+商品发现 |
| **APP-项目端** | 4 Tab项目容器（首页/门店/直播/会员），展示项目级内容+会员体系 | 项目私域运营，会员留存复购 |
| **运营后台配置** | 搜索管理/广告位/金刚区/直播推荐/商品推荐/运营楼层 6个管理页 | 运营人员一站式配置APP展示内容 |
| **租户后台管理** | 项目/门店/首页配置 3个管理页 | 租户自主管理销售单元和门店 |

### 1.3 三源输入

- **自然语言描述**：配置式装修电商平台APP——平台首页5Tab + 项目4Tab + 门店详情 + 运营后台配置 + 租户后台管理 + 搜索体系
- **领域知识**：电商类（日用百货+健康保健）Mock数据，4项目+10门店+17商品+5直播
- **补充资料**：已有SAAS项目架构（五层架构：contracts→stores→adapters→components→pages），三终端入口复用模式（admin/tenant/h5→新增app）

---

## 二、四层层级模型

### 2.1 平台层（SAAS运营后台）

- **入口**: `admin.html` → `/admin/search`, `/admin/ad`, `/admin/kingkong`, `/admin/live-recommend`, `/admin/product-recommend`, `/admin/floor`
- **职责**: 管理全平台APP展示内容（搜索/广告/金刚区/直播推荐/商品推荐/楼层配置）
- **角色**: 平台运营人员
- **v2.1变更**: 新增搜索管理页（热搜词/底纹词/自定义结果）；推荐管理拆分为直播推荐管理和商品推荐管理

### 2.2 租户层（概念层）

- **入口**: `tenant.html` → `/tenant/projects`, `/tenant/projects/:projectId/stores`, `/tenant/projects/:projectId/home-config`
- **职责**: 管理所属项目、门店、项目首页配置
- **角色**: 租户管理员
- **v2.1变更**: 无变更（租户后台不涉及APP首页运营内容）

### 2.3 项目层（独立销售单元）

- **入口**: `app.html` → `/app/project/:projectId`
- **职责**: 项目级首页（Banner+快捷入口+推荐商品+直播推荐+会员入口），4 Tab导航
- **Mock数据**: 4个项目

| 项目ID | 名称 | 品类 | 门店数 | 会员数 |
|--------|------|------|--------|--------|
| proj-daily-01 | 日用百货优选 | 日用百货 | 3 | 12800 |
| proj-daily-02 | 家居清洁馆 | 日用百货 | 2 | 5600 |
| proj-health-01 | 健康补给站 | 健康保健 | 3 | 8200 |
| proj-health-02 | 营养滋补坊 | 健康保健 | 2 | 3400 |

### 2.4 门店层（提货点/销售点）

- **职责**: 门店详情（信息+商品列表+直播入口）
- **Mock数据**: 10个门店，类型覆盖 pickup/sales/both

---

## 三、数据模型（14个实体）

### 3.1 项目域实体（7个）

| 实体编号 | 实体名 | 说明 | Schema文件 |
|----------|--------|------|------------|
| ENT-PROJECT-001 | Project | 项目（名称/logo/品类/描述/门店数/会员数/状态） | project-schemas.ts |
| ENT-PROJECT-002 | Store | 门店（名称/类型/地址/营业时间/电话/经纬度/距离） | project-schemas.ts |
| ENT-PROJECT-003 | Product | 商品（名称/图片/价格/原价/销量/库存/品类/标签/状态） | project-schemas.ts |
| ENT-PROJECT-004 | LiveRoom | 直播间（标题/封面/主播/观看人数/状态/回放URL/关联商品） | project-schemas.ts |
| ENT-PROJECT-005 | MemberLevelConfig | 会员等级配置（等级/名称/积分阈值/折扣/特权/图标） | project-schemas.ts |
| ENT-PROJECT-006 | ProjectMember | 项目会员（等级/积分/累计消费/当前等级积分/下一级积分） | project-schemas.ts |
| ENT-PROJECT-007 | ProjectHomeConfig | 项目首页配置（Banner图/快捷入口/推荐商品/直播推荐/公告） | project-schemas.ts |

### 3.2 APP展示域实体（7个）

| 实体编号 | 实体名 | 说明 | Schema文件 |
|----------|--------|------|------------|
| ENT-APP-001 | AdBanner | 广告位（位置/标题/图片/链接/排序/展示时间/emoji/标签） | app-schemas.ts |
| ENT-APP-002 | KingKongEntry | 金刚区入口（名称/图标/跳转类型/跳转值/排序/渐变背景） | app-schemas.ts |
| ENT-APP-003 | HotWord | 热搜词（关键词/图标标签/权重/固定排序/关联自定义结果ID） | app-config-store.ts |
| ENT-APP-004 | CustomSearchResult | 自定义搜索结果（标题/描述/emoji/跳转类型/跳转目标/关联项目） | app-config-store.ts |
| ENT-APP-005 | RecommendItem | 推荐配置项（类型:手动/规则，目标ID/规则类型/参数/状态） | app-config-store.ts |
| ENT-APP-006 | Floor | 运营楼层（标题/类型/位置/关联商品ID列表/排序） | app-schemas.ts |
| ENT-APP-007 | AppUser | APP用户（昵称/头像/手机/平台积分/优惠券数/订单数） | app-schemas.ts |
| ENT-APP-008 | AppMessage | APP消息（类型:订单/营销/系统/项目/直播，标题/内容/已读） | app-schemas.ts |

### 3.3 推荐规则类型（v2.1新增）

| 规则类型 | 适用域 | 说明 |
|----------|--------|------|
| `status` | 直播推荐 | 按直播状态推荐（直播中优先） |
| `viewer_count` | 直播推荐 | 按观看人数 TOP N |
| `sales` | 商品推荐 | 按销量 TOP N |
| `category` | 商品推荐 | 按商品类目筛选 |
| `created_at` | 商品推荐 | 按上架时间最新 N |
| `fixed` | 商品推荐 | 固定规则（推荐好物） |

### 3.4 热搜词图标标签（v2.1新增）

| 标签值 | 显示 | 颜色 |
|--------|------|------|
| `hot` | 热门 | 红色 |
| `fire` | 火爆 | 橙色 |
| `new` | 最新 | 绿色 |
| `popular` | 人气 | 蓝色 |
| `recommend` | 推荐 | 粉色 |
| `sale` | 热卖 | 深红 |

---

## 四、路由结构

### 4.1 APP端路由（/app/ 前缀）

```
/app
├── /home              → 平台首页（Tab1）        PlatformHome.vue
├── /mall              → 商城页（Tab2）          MallPage.vue
├── /entertainment     → 娱乐页（Tab3 占位）     EntertainmentPage.vue
├── /message           → 消息页（Tab4 占位）     MessagePage.vue
├── /mine              → 我的（Tab5）            PlatformMine.vue
├── /mine/member       → 平台会员中心             PlatformMember.vue
├── /search            → 搜索页（v2.1新增）      SearchPage.vue
├── /search/result     → 搜索结果页（v2.1新增）   SearchResultPage.vue
└── /project/:projectId
    ├── /              → 项目首页（Tab1）        ProjectHome.vue
    ├── /stores        → 门店列表（Tab2）        ProjectStores.vue
    ├── /lives         → 直播列表（Tab3）        ProjectLives.vue
    ├── /member        → 会员中心（Tab4）        ProjectMember.vue
    └── /store/:storeId → 门店详情               StoreDetail.vue
```

### 4.2 运营后台路由（/admin/ 扩展）

```
/admin/search            → 搜索管理（v2.1新增）     SearchManage.vue
/admin/ad                → 广告位管理               AdManage.vue
/admin/kingkong          → 金刚区管理               KingKongManage.vue
/admin/live-recommend    → 直播推荐管理（v2.1新增）  LiveRecommendManage.vue
/admin/product-recommend → 商品推荐管理（v2.1新增）  ProductRecommendManage.vue
/admin/floor             → 楼层管理                 FloorManage.vue
```

> **v2.1变更**: 新增3个管理页（SearchManage/LiveRecommendManage/ProductRecommendManage）；移除旧的 RecommendManage

### 4.3 租户后台路由（/tenant/ 扩展）

```
/tenant/projects                              → 项目管理               ProjectManage.vue
/tenant/projects/:projectId/stores             → 门店管理               StoreManage.vue
/tenant/projects/:projectId/home-config         → 项目首页配置           ProjectHomeConfig.vue
```

---

## 五、组件层级

### 5.1 布局容器组件

| 组件 | 文件 | 职责 |
|------|------|------|
| MobileFrame | `components/app/layout/MobileFrame.vue` | APP容器 + 5 Tab底部导航（首页/商城/娱乐/消息/我的）+ `<router-view>` |
| ProjectFrame | `components/app/layout/ProjectFrame.vue` | 项目容器 + 4 Tab导航（首页/门店/直播/会员）+ 项目头部信息 + `<router-view>` |

### 5.2 首页展示组件

| 组件 | 文件 | 职责 |
|------|------|------|
| BannerCarousel | `components/app/home/BannerCarousel.vue` | 轮播广告，支持自动播放+指示器+点击跳转 |
| KingKongGrid | `components/app/home/KingKongGrid.vue` | 金刚区网格（图标+名称），支持多行排列+渐变背景+点击跳转 |
| OperationFloor | `components/app/home/OperationFloor.vue` | 运营楼层（商品列表型），支持多种展示样式 |

### 5.3 业务卡片组件

| 组件 | 文件 | 职责 |
|------|------|------|
| ProductCard | `components/app/product/ProductCard.vue` | 商品卡片（大图/名称/价格/原价/销量/标签+购物车按钮） |
| LiveCard | `components/app/live/LiveCard.vue` | 直播卡片（封面/标题/主播/观看人数/LIVE动画角标/回放标记） |
| ProjectCard | `components/app/mall/ProjectCard.vue` | 项目卡片（图片/名称/品类标签/门店数/会员数） |
| FeaturedContent | `components/app/mall/FeaturedContent.vue` | 精选内容卡片（大图/标题/副标题） |
| StoreCard | `components/app/store/StoreCard.vue` | 门店卡片（名称/logo/评分/地址/推荐商品预览） |

### 5.4 会员组件

| 组件 | 文件 | 职责 |
|------|------|------|
| MemberLevelCard | `components/app/member/MemberLevelCard.vue` | 会员等级卡（等级图标/名称/折扣/特权列表/升级进度） |
| PointsBar | `components/app/member/PointsBar.vue` | 积分进度条（当前积分/下级所需/进度百分比/动画） |

### 5.5 门店详情组件

| 组件 | 文件 | 职责 |
|------|------|------|
| StoreProductList | `components/app/store/StoreProductList.vue` | 门店商品列表（双列网格布局） |

---

## 六、页面详情

### 6.1 APP-平台首页（PlatformHome.vue）⭐ v2.1重大变更

**组成**: 顶部Logo+追伴名称 + 消息铃铛 + 搜索栏（点击进搜索页） + BannerCarousel + KingKongGrid + 直播推荐（置顶） + 商品推荐 + 推荐好物（固定规则） + 运营楼层

**v2.1变更**:
- 顶部新增「追」Logo + APP名称"追伴"，消息铃铛带未读气泡
- 搜索栏改为点击进二级搜索页（不再直接展示热搜词）
- 移除限时秒杀板块
- 直播推荐和商品推荐调换位置（直播推荐置顶）
- 推荐好物按固定规则（最新上架+销量最高混合取8个）

### 6.2 APP-搜索页（SearchPage.vue）⭐ v2.1新增

**组成**: 搜索输入框 + 搜索历史 + 热搜推荐（带图标标签：热门/火爆/最新/人气等）

**交互**: 
- 点击热搜词 → 检查是否关联自定义结果 → 关联则直接跳转目标页，否则进入搜索结果页
- 搜索历史存储到 localStorage，最多12条

### 6.3 APP-搜索结果页（SearchResultPage.vue）⭐ v2.1新增

**搜索范围**: 商品、项目、直播（v2.1限定，不含门店）

**组成**: 搜索输入框 + 综合/商品/项目/直播 Tab切换 + 自定义结果优先展示 + 引擎匹配结果

**交互**:
- 自定义搜索结果优先：按标题/描述匹配展示
- 引擎结果：商品（名称/描述匹配）、项目（名称/描述匹配）、直播（标题/主播名匹配）
- Tab切换过滤不同类型结果

### 6.4 APP-商城页（MallPage.vue）

**组成**: 顶部切换Tab（精选/项目列表）+ FeaturedContent列表/ProjectCard网格
**数据来源**: app-config-store（推荐位+项目列表）

### 6.5 APP-娱乐页（EntertainmentPage.vue）

**状态**: 占位页面，预留游戏/互动入口

### 6.6 APP-消息页（MessagePage.vue）

**状态**: 占位页面，预留消息列表+消息分类

### 6.7 APP-我的（PlatformMine.vue）

**组成**: 用户头像/昵称/积分/优惠券/订单 + 功能菜单（会员中心/我的订单/优惠券/收藏/设置）

### 6.8 APP-平台会员中心（PlatformMember.vue）

**组成**: 会员卡展示 + 等级特权列表 + 各项目会员入口

### 6.9 APP-项目首页（ProjectHome.vue）⭐ v2.1重大变更

**组成**: 真机状态栏 + 项目导航栏 + 项目信息卡片（渐变背景+Logo+数据统计） + 4 Tab导航 + 搜索栏 + Banner轮播 + 4×2金刚区快捷入口 + 限时秒杀楼层 + 双列推荐商品 + 横向滚动直播

**v2.1变更**: 全面重构为真机风格（414×896px手机屏模拟、状态栏时间信号电量、Banner自动轮播、秒杀倒计时、金刚区渐变图标、购物车按钮）

### 6.10 APP-门店列表（ProjectStores.vue）⭐ v2.1优化

**组成**: 搜索栏 + StoreCard列表（含logo/评分/推荐商品预览）
**v2.1变更**: 真机风格重构

### 6.11 APP-直播列表（ProjectLives.vue）⭐ v2.1优化

**组成**: 全部/直播中/已结束筛选 + 2列LiveCard网格
**v2.1变更**: 真机风格重构，动画"直播中"标签

### 6.12 APP-会员中心（ProjectMember.vue）⭐ v2.1优化

**组成**: 银卡渐变会员卡 + 积分/优惠券/订单统计 + 4级会员进度条 + 积分规则明细
**v2.1变更**: 真机风格重构

### 6.13 APP-门店详情（StoreDetail.vue）⭐ v2.1优化

**组成**: 渐入式门店信息卡片 + 全部商品双列列表 + 关联直播
**v2.1变更**: 真机风格重构

### 6.14 运营后台-搜索管理（SearchManage.vue）⭐ v2.1新增

**组成**: 
- 底纹词设置
- 热搜词管理（表格CRUD + 标签图标选择 + 关联自定义结果 + 固定排序/权重/状态）
- 自定义搜索结果管理（表格CRUD + 跳转类型配置）

**热搜词关联自定义结果流程**:
1. 点击热搜词的「关联自定义结果」
2. 选择一个已有的自定义结果
3. 保存后，用户点击该热搜词 → 直接跳转到关联的目标页（商品/项目/直播）

### 6.15 运营后台-广告位管理（AdManage.vue）⭐ v2.1升级

**组成**: Element Plus表格（ID/标题/位置/跳转链接/展示时间/排序/状态）+ 新增/编辑弹窗

**v2.1变更**: 
- 新增展示时间管理（start_time/end_time 日期选择器）
- 新增跳转链接配置
- 新增emoji/标签/主题色配置

### 6.16 运营后台-金刚区管理（KingKongManage.vue）

**组成**: Element Plus表格（ID/名称/图标/跳转类型/跳转值/排序/状态）+ 编辑弹窗

### 6.17 运营后台-直播推荐管理（LiveRecommendManage.vue）⭐ v2.1新增

**组成**: 推荐规则配置表格 + 手动推荐/规则推荐切换 + 效果预览

**推荐方式**:
- 手动推荐：选择指定直播ID
- 规则推荐：按直播状态（直播中优先）/ 按观看人数（TOP N）

### 6.18 运营后台-商品推荐管理（ProductRecommendManage.vue）⭐ v2.1新增

**组成**: 推荐规则配置表格 + 手动推荐/规则推荐切换 + 效果预览

**推荐方式**:
- 手动推荐：选择指定商品ID + 关联项目
- 规则推荐：按销量/类目/上架时间/固定规则（推荐好物）

### 6.19 运营后台-楼层管理（FloorManage.vue）

**组成**: Element Plus表格（ID/标题/类型/位置/排序/状态）+ 编辑弹窗 + 关联商品

### 6.20 租户后台-项目管理（ProjectManage.vue）

**组成**: Element Plus表格（ID/名称/logo/品类/门店数/会员数/状态）+ 编辑弹窗

### 6.21 租户后台-门店管理（StoreManage.vue）

**组成**: Element Plus表格（ID/名称/类型/地址/电话/营业时间）+ 编辑弹窗

### 6.22 租户后台-项目首页配置（ProjectHomeConfig.vue）

**组成**: 多区块配置表单（Banner图片组/快捷入口组/推荐商品组/直播推荐组/公告文本）

---

## 七、Mock数据设计

### 7.1 项目数据（4个）⭐ v2.1修正

| 项目 | 品类 | 门店 | 特征 |
|------|------|------|------|
| 日用百货优选 | 日用百货 | 3店 | 主打性价比日用品，厨房/清洁/收纳 |
| 家居清洁馆 | 日用百货 | 2店 | 主打家居清洁用品 |
| 健康补给站 | 健康保健 | 3店 | 主打保健食品/维生素/益生菌 |
| 营养滋补坊 | 健康保健 | 2店 | 主打传统滋补品/燕窝/西洋参 |

### 7.2 商品数据（17个）⭐ v2.1扩展

| 品类 | 商品示例 | 价格区间 |
|------|----------|----------|
| 日用百货-纸品 | 竹纤维抽纸、纯棉毛巾 | ¥29.9-39.9 |
| 日用百货-清洁 | 洗洁精、超细纤维洗碗布、垃圾袋、地板清洁剂、玻璃清洁喷雾、马桶清洁剂 | ¥12.9-22.9 |
| 日用百货-杯具 | 不锈钢保温杯 | ¥49.9 |
| 健康保健-维生素 | 复合维生素片、钙+维生素D3 | ¥69-89 |
| 健康保健-鱼油 | 深海鱼油软胶囊 | ¥129 |
| 健康保健-益生菌 | 益生菌粉 | ¥159 |
| 健康保健-蛋白 | 蛋白质粉 | ¥199 |
| 健康保健-滋补 | 燕窝礼盒、西洋参片、枸杞原浆 | ¥138-499 |

### 7.3 直播数据（5场）⭐ v2.1精简

| 直播状态 | 数量 | 示例 |
|----------|------|------|
| 直播中 | 3 | 优选主播小美/清洁达人老张/营养师李博士 |
| 回放 | 1 | 健康主播Anna益生菌专场 |
| 预告 | 1 | 滋补专家王老师滋补养生 |

### 7.4 APP运营配置

| 配置类型 | 数量 | 说明 |
|----------|------|------|
| 广告Banner | 3 | 新品首发/会员专享/限时特惠 |
| 金刚区入口 | 8 | 热卖排行/新品首发/领券中心/直播间/每日签到/试用中心/品牌榜/全部分类 |
| 热搜词 | 10 | 带图标标签（热门/火爆/最新/人气/推荐/热卖）和自定义结果关联 |
| 自定义搜索结果 | 3 | 智能拖把→商品、便携榨汁机→商品、蓝牙耳机→商品 |
| 直播推荐配置 | 3 | 2个手动 + 1个规则（按观看人数TOP4） |
| 商品推荐配置 | 3 | 2个手动 + 1个规则（按销量TOP4） |
| 运营楼层 | 2 | 品质家居/数码好物 |

### 7.5 会员数据

| 等级 | 积分门槛 | 折扣 | 特权 |
|------|----------|------|------|
| 青铜 | 0 | 无折扣 | 基础积分/生日关怀 |
| 白银 | 500 | 98折 | + 专属优惠券 |
| 黄金 | 2000 | 95折 | + 优先客服/双倍积分 |
| 铂金 | 5000 | 9折 | + 营养师咨询/专属客服 |

---

## 八、技术架构

### 8.1 五层代码架构（v2.1新增服务层）

```
服务层 (services/)          ← v2.1新增
  └── data-service.ts       → localStorage持久化读写 + 导出/导入/重置API

契约层 (contracts/schemas/)
  ├── project-schemas.ts  → 项目域Zod Schema + 类型导出
  └── app-schemas.ts      → APP展示域Zod Schema + 类型导出

Store层 (stores/)
  ├── project-store.ts    → 项目/门店/商品/直播/会员 数据 + 持久化
  ├── app-config-store.ts → 搜索/广告/金刚区/推荐/楼层 数据 + 持久化
  └── user-store.ts       → APP用户/会员关系/消息 数据 + 持久化

组件层 (components/app/)
  ├── layout/   → MobileFrame, ProjectFrame
  ├── home/     → BannerCarousel, KingKongGrid, OperationFloor
  ├── product/  → ProductCard
  ├── live/     → LiveCard
  ├── mall/     → ProjectCard, FeaturedContent
  ├── store/    → StoreCard, StoreProductList
  └── member/   → MemberLevelCard, PointsBar

页面层 (pages/)
  ├── app/home/        → PlatformHome
  ├── app/search/      → SearchPage, SearchResultPage    ← v2.1新增
  ├── app/mall/        → MallPage
  ├── app/entertainment/ → EntertainmentPage
  ├── app/message/     → MessagePage
  ├── app/mine/        → PlatformMine, PlatformMember
  ├── app/project/     → ProjectHome, ProjectStores, ProjectLives, ProjectMember
  ├── app/store/       → StoreDetail
  ├── admin-app/       → SearchManage, AdManage, KingKongManage, LiveRecommendManage, ProductRecommendManage, FloorManage
  └── tenant-app/      → ProjectManage, StoreManage, ProjectHomeConfig
```

### 8.2 数据持久化架构（v2.1新增）

```
┌──────────────────────────────────────────────────┐
│                    UI 层                          │
│  APP页面 / 运营后台 / 租户后台                    │
└────────────┬─────────────────────────────────────┘
             │ 读写
┌────────────▼─────────────────────────────────────┐
│                 Pinia Store 层                    │
│  app-config-store / project-store / user-store    │
│  ├─ ref() 初始化 ← dataService.loadXxx()         │
│  └─ watch(deep) → dataService.saveXxx()          │
└────────────┬─────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────┐
│            DataService 持久化层                    │
│  src/services/data-service.ts                     │
│  ├─ localStorage.getItem / setItem               │
│  ├─ JSON 序列化/反序列化                          │
│  └─ 导出/导入/重置 API                            │
└────────────┬─────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────┐
│             localStorage (浏览器)                 │
│  saas:app-config  — 运营配置                      │
│  saas:project     — 项目/门店/商品/直播            │
│  saas:user        — 用户/会员/消息                 │
└──────────────────────────────────────────────────┘
```

### 8.3 搜索体系架构（v2.1新增）

```
搜索流程:
  用户点击搜索栏 → /app/search (搜索页)
  ├─ 搜索历史（localStorage）
  ├─ 热搜推荐（带图标标签）
  └─ 点击热搜词
       ├─ 检查 csr_id 关联
       │   ├─ 有关联 → 直接跳转目标页（商品/项目/直播）
       │   └─ 无关联 → /app/search/result?q=xxx
       │       ├─ 自定义结果优先（按标题/描述匹配）
       │       └─ 引擎结果（商品/项目/直播匹配）

运营后台配置:
  热搜词管理 → 设置 csr_id → 关联自定义搜索结果
  自定义搜索结果 → 设置跳转类型和跳转目标
```

### 8.4 四入口多终端架构

| 入口文件 | TS入口 | 终端 | 路由前缀 | 用途 |
|----------|--------|------|----------|------|
| `admin.html` | `main-admin.ts` | PC运营后台 | `/admin/` | 平台运营配置 |
| `tenant.html` | `main-tenant.ts` | PC租户后台 | `/tenant/` | 租户管理 |
| `h5.html` | `main-h5.ts` | H5观众端 | `/h5/` | 直播观众 |
| `app.html` | `main-app.ts` | 移动端APP | `/app/` | **本次新增**：消费者APP |

### 8.5 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 + Composition API | 框架 |
| TypeScript 5.4 | 类型安全 |
| Pinia 2.1 | 状态管理 |
| Vue Router 4.3 | 路由 |
| Element Plus 2.6 | PC后台UI组件 |
| Vite 5.2 | 构建工具 |
| Zod 3.22 | Schema验证 |
| localStorage | 数据持久化（v2.1新增） |

---

## 九、用户流程

### 9.1 消费者浏览流程

```
打开APP → 平台首页（5Tab）
  ├─ Tab1 首页: Logo+追伴名称 → 搜索栏 → 轮播广告 → 金刚区入口 → 直播推荐 → 商品推荐 → 推荐好物 → 运营楼层
  │   ├─ 点击搜索栏 → /app/search（搜索页）
  │   │   ├─ 搜索历史
  │   │   ├─ 热搜推荐（带图标标签）
  │   │   └─ 点击热搜词 → 关联自定义结果则直接跳转 / 否则进入搜索结果页
  │   └─ 点击金刚区"直播间" → 跳转到直播页面
  ├─ Tab2 商城: 精选内容 / 项目列表
  │   └─ 点击项目卡片 → 进入项目首页
  ├─ Tab3 娱乐: 占位（未来游戏/互动）
  ├─ Tab4 消息: 占位（未来消息中心）
  └─ Tab5 我的: 个人信息/积分/优惠券/订单 → 会员中心

进入项目（/app/project/:id）
  ├─ Tab1 首页: 真机状态栏 → 导航栏 → 项目信息卡片 → 搜索栏 → Banner轮播 → 金刚区 → 秒杀 → 推荐商品 → 热门直播
  ├─ Tab2 门店: 门店列表 → 点击门店 → 门店详情（信息卡片+商品列表+关联直播）
  ├─ Tab3 直播: 筛选切换（全部/直播中/已结束） → 直播卡片网格
  └─ Tab4 会员: 会员卡（银卡渐变） → 积分/优惠券/订单统计 → 等级进度条 → 积分规则
```

### 9.2 运营配置流程（v2.1更新）

```
运营后台(admin.html)
  ├─ /admin/search          → 搜索管理: 底纹词 + 热搜词CRUD(标签图标+关联自定义结果) + 自定义结果CRUD(跳转类型配置)
  ├─ /admin/ad              → 广告位管理: CRUD + 展示时间配置 + 跳转链接 + 排序
  ├─ /admin/kingkong        → 金刚区管理: CRUD + 跳转配置 + 排序
  ├─ /admin/live-recommend  → 直播推荐: 手动推荐(选直播) + 规则推荐(按状态/观看人数) + 效果预览
  ├─ /admin/product-recommend → 商品推荐: 手动推荐(选商品) + 规则推荐(按销量/类目/上架时间/固定规则) + 效果预览
  └─ /admin/floor           → 楼层管理: CRUD + 关联商品 + 排序
```

### 9.3 租户管理流程

```
租户后台(tenant.html)
  ├─ /tenant/projects                         → 项目管理: CRUD
  ├─ /tenant/projects/:projectId/stores        → 门店管理: CRUD + 坐标配置
  └─ /tenant/projects/:projectId/home-config   → 首页配置: Banner/快捷入口/推荐/公告
```

---

## 十、干系人清单

| 角色 | 利益诉求 | 影响级别 | 终端 |
|------|----------|----------|------|
| **消费者** | 浏览商品、搜索好物、发现好物、享受会员折扣、观看直播 | 高 | APP端 |
| **平台运营** | 配置APP展示内容（搜索/广告/金刚区/推荐/楼层）、数据分析 | 高 | 运营后台PC |
| **租户管理员** | 管理项目信息、门店信息、项目首页内容 | 高 | 租户后台PC |
| **主播** | 通过直播展示商品、吸引消费者 | 中 | APP端 |
| **门店人员** | 维护门店信息、管理商品上下架 | 中 | 租户后台PC |

---

## 十一、决策冻结

以下决策已锁定（v2.1.0）：

1. **四层层级模型**：平台→租户（概念层）→项目（独立销售单元）→门店（提货点/销售点）
2. **平台5 Tab导航**：首页/商城/娱乐/消息/我的（预留扩展）
3. **项目4 Tab导航**：首页/门店/直播/会员
4. **四入口多终端**：app.html（新增）加入现有三入口架构
5. **Mock数据策略**：日用百货+健康保健双品类，4项目+10门店+17商品+5直播
6. **会员四级体系**：青铜→白银→黄金→铂金（积分+折扣+特权）
7. **运营后台6配置页**：搜索/广告/金刚区/直播推荐/商品推荐/楼层
8. **租户后台3管理页**：项目/门店/首页配置
9. **门店三种类型**：pickup（提货点）/sales（销售点）/both（两者兼备）
10. **直播四种状态**：live（直播中）/replay（回放）/ended（已结束）/upcoming（预告）
11. **APP首页由运营后台统一管理**：所有内容均通过运营后台配置，租户后台不涉及APP首页
12. **搜索范围限定**：商品、直播、项目（不含门店）
13. **热搜词图标标签体系**：hot/fire/new/popular/recommend/sale 六种标签
14. **热搜词关联自定义结果**：csr_id关联，搜索时直接跳转目标页
15. **推荐引擎双模式**：手动推荐 + 规则推荐（直播:按状态/观看人数，商品:按销量/类目/上架时间/固定规则）
16. **数据持久化**：localStorage自动同步，3个key（saas:app-config / saas:project / saas:user）
17. **真机模拟**：APP端414×896px手机屏 + 状态栏 + 原生级触摸滚动
18. **五层代码架构**：services→contracts→stores→components→pages（v2.1新增服务层）
19. **APP品牌名**: 「追伴」

---

## 十二、后续流程路由

脑暴类型为 **planning（规划型）**，后续流程：

→ 通知 **PO Agent**（规划级激活）
→ PO 产出：路线图 + Backlog + 四层价值评估 + Sprint计划
→ BA 需求分析（继承本脑暴领域知识清单 + 14个数据实体 + 22个页面 + 15个组件）
→ Arch 架构设计（继承五层代码架构 + 数据持久化方案 + 搜索体系）

### 交接清单（G-BS-HO-01~03）

| 门禁ID | 交接物 | 状态 |
|--------|--------|------|
| G-BS-HO-01 | confirmed/BR-脑暴文档-APP端-确认稿.md（含版本概要表） | ✅ 本文档 |
| G-BS-HO-02 | confirmed/domain-knowledge-list.yml | 待生成 |
| G-BS-HO-03 | 实施文件清单（51文件，见附录） | ✅ 发布于项目代码 |

---

## 附录：实施文件清单（51个）

### 新增文件（45个）

**服务层（1个）— v2.1新增**
- `src/services/data-service.ts`

**契约层（2个）**
- `src/contracts/schemas/project-schemas.ts`
- `src/contracts/schemas/app-schemas.ts`

**Store层（3个）**
- `src/stores/project-store.ts`
- `src/stores/app-config-store.ts`
- `src/stores/user-store.ts`

**APP组件-布局（2个）**
- `src/components/app/layout/MobileFrame.vue`
- `src/components/app/layout/ProjectFrame.vue`

**APP组件-首页（3个）**
- `src/components/app/home/BannerCarousel.vue`
- `src/components/app/home/KingKongGrid.vue`
- `src/components/app/home/OperationFloor.vue`

**APP组件-业务卡片（5个）**
- `src/components/app/product/ProductCard.vue`
- `src/components/app/live/LiveCard.vue`
- `src/components/app/mall/ProjectCard.vue`
- `src/components/app/mall/FeaturedContent.vue`
- `src/components/app/store/StoreCard.vue`

**APP组件-门店/会员（3个）**
- `src/components/app/store/StoreProductList.vue`
- `src/components/app/member/MemberLevelCard.vue`
- `src/components/app/member/PointsBar.vue`

**APP页面（13个）— v2.1新增2个**
- `src/pages/app/home/PlatformHome.vue`
- `src/pages/app/search/SearchPage.vue` ← v2.1新增
- `src/pages/app/search/SearchResultPage.vue` ← v2.1新增
- `src/pages/app/mall/MallPage.vue`
- `src/pages/app/entertainment/EntertainmentPage.vue`
- `src/pages/app/message/MessagePage.vue`
- `src/pages/app/mine/PlatformMine.vue`
- `src/pages/app/mine/PlatformMember.vue`
- `src/pages/app/project/ProjectHome.vue`
- `src/pages/app/project/ProjectStores.vue`
- `src/pages/app/project/ProjectLives.vue`
- `src/pages/app/project/ProjectMember.vue`
- `src/pages/app/store/StoreDetail.vue`

**后台管理页面（10个）— v2.1新增3个，移除1个**
- `src/pages/admin-app/SearchManage.vue` ← v2.1新增
- `src/pages/admin-app/AdManage.vue`
- `src/pages/admin-app/KingKongManage.vue`
- `src/pages/admin-app/LiveRecommendManage.vue` ← v2.1新增
- `src/pages/admin-app/ProductRecommendManage.vue` ← v2.1新增
- `src/pages/admin-app/FloorManage.vue`
- `src/pages/admin-app/RecommendManage.vue` ← v2.0已删除
- `src/pages/tenant-app/ProjectManage.vue`
- `src/pages/tenant-app/StoreManage.vue`
- `src/pages/tenant-app/ProjectHomeConfig.vue`

**入口（3个）**
- `app.html`
- `src/main-app.ts`
- `src/main-admin.ts`（v2.1修正重定向目标）
- `src/main-tenant.ts`（v2.1修正重定向目标）

### 修改文件（6个）— v2.1扩展
- `src/contracts/index.ts` — 导出新增 schema
- `src/contracts/schemas/app-schemas.ts` — v2.1扩展字段（emoji/color/tag/gradient/product_ids等）
- `src/router/index.ts` — APP端路由 + 搜索路由 + 运营后台路由（v2.1调整）
- `vite.config.ts` — 加入 app 入口配置
- `package.json` — 无变更（复用现有依赖）
