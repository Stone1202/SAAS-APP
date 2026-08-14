# CHANGELOG — SAAS-APP 版本变更记录

> 维护者：PM Agent | 格式：[Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) | 版本号：语义化版本

---

## [v3.1.52] — 2026-08-14 ✅ 手动推荐选择器改编辑模式：总数上限10条+预勾选已有+可取消勾选移除+确认全量同步

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.52

### Changed（选择器弹窗交互重定义）
1. **"最多10条"=手动推荐总数上限**：`SELECTOR_MAX=10` 由"弹窗单次勾选上限"改为"手动推荐总数上限（含已有+本次勾选）"，超出时提示"手动推荐最多 10 条（当前已选 N 条）"并回滚勾选保留前10条
2. **候选列表不再过滤已选项**：`selectorOptions` 删除 `addedIds` 排除逻辑——已选内容在弹窗中正常显示（保留搜索），支持取消勾选（=移除）
3. **打开弹窗预勾选已有**：`openSelector()` 初始化 `selectorSelected` = 当前草稿中已有手动推荐；翻页/搜索变化时 `watch(pagedSelectorOptions)` + `syncSelectorSelection()` 自动对齐勾选态（不清空其它页已选，el-table 加 row-key 保证跨页稳定）
4. **确认 = 全量同步**：`confirmSelector()` 重写——取消勾选的已有推荐从列表移除、新勾选的追加（保留原 sort_order，新增排后面），允许全取消（=清空手动推荐）；"已选N条"为当前总已选数
5. **文案微调**：弹窗标题"选择X（可取消已选 · 最多10条）"，底部提示"当前已选 N 条（最多 10 条）"（0条时橙色提示"确认后将清空手动推荐"），确认按钮"确认添加"→"确认"

### 影响范围
6. 组件单点修改全部5个场景统一生效：首页推荐（直播/商品）+ 商城管理（商城列表/精选商品/精选直播）

### 修改文件清单（1 代码 + 1 用例卡 + 3 文档 = 5 个）
- 代码：`ScenarioPanel.vue`
- 用例卡：`admin-use-cases.ts`（UC-OPS-RECOMMEND-001~009 共9个卡：总数上限+编辑模式验收点5处、"已选项在列表中显示并预勾选"5处、basicFlow添加流程4处）
- 文档：`17-APP端电商域-PRD-v3.1.0.md` + `design-map.json` + `CHANGELOG.md`

### 质量验证
- TypeScript 类型检查：0错误 ✅
- IDE Lint：0错误 ✅

### 同步修改文档
- PRD: v3.1.51 → v3.1.52
- design-map.json: v3.1.58 → v3.1.59

---

## [v3.1.51] — 2026-08-14 ✅ 首页推荐/商城管理场景面板优化：选择器最多10条+去手动推荐与预览分页

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.51

### Changed（选择器弹窗数量上限）
1. **ScenarioPanel.vue 列表选择器弹窗**：新增 `SELECTOR_MAX=10` 上限——勾选超过10条时 `ElMessage.warning("最多选择 10 条")`，通过 clearSelection + toggleRowSelection 回滚勾选状态；底部提示由"已选 X 个{类型}"改为"已选 X 条，最多选择 10 条"；弹窗内分页（每页10条）保留不变

### Changed（手动推荐列表去分页）
2. **ScenarioPanel.vue 手动推荐列表**：删除 el-pagination 分页器，表格 `:data` 由 pagedManualList 改为 manualList 全量展示；isFirstInPage/isLastInPage 排序边界改为全局判断（首条不可上移、末条不可下移）

### Changed（推荐效果预览去分页）
3. **ScenarioPanel.vue 推荐效果预览**：删除 el-pagination 分页器，新增 `PREVIEW_MAX=30` 前30条截断全量展示（visiblePreviewItems），标题改为"推荐效果预览（手动 + 规则叠加排序 · 前30条）"，角标从1连续编号

### 影响范围
4. 组件单点修改全部5个场景统一生效：首页推荐（直播/商品）+ 商城管理（商城列表/精选商品/精选直播）

### 修改文件清单（1 代码 + 1 用例卡 + 3 文档 = 5 个）
- 代码：`ScenarioPanel.vue`
- 用例卡：`admin-use-cases.ts`（UC-OPS-RECOMMEND-001~009 共9个卡同步：选择器上限验收点4处+去分页描述+前30条截断）
- 文档：`17-APP端电商域-PRD-v3.1.0.md` + `design-map.json` + `CHANGELOG.md`

### 质量验证
- TypeScript 类型检查：0错误 ✅
- IDE Lint：0错误 ✅

### 同步修改文档
- PRD: v3.1.50 → v3.1.51
- design-map.json: v3.1.57 → v3.1.58

---

## [v3.1.50] — 2026-08-14 ✅ 首页推荐展示条数去"留空=无上限"文案+规则引擎移除"按项目品类"维度

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.50

### Changed（展示条数文案精简）
1. **ScenarioPanel.vue 展示条数编辑器**：删除 `placeholder="留空=无上限"`，hint 由"（留空=首页展示全部；填6=首页只展示前6条）"改为"（填6=首页只展示前6条）"——实际范围限制为直播 1-10 / 商品 1-100（v3.1.47 已设上限），不允许无上限

### Changed（规则引擎维度清理）
2. **recommend-dimensions.ts 移除"按项目品类"维度**：删除 `DIM_PROJECT_CATEGORY` 定义及 `PROJECT_CATEGORY_OPTIONS` 常量，从 `DIMENSION_REGISTRY` 注册表移除——项目类型规则可用维度为按项目/按行业/按会员数/按门店数（存量规则 rule-project-industry-members 使用 industry+member_count，不含 project_category，不受影响）

### 修改文件清单（2 代码 + 1 用例卡 + 3 文档 = 6 个）
- 代码：`ScenarioPanel.vue` + `recommend-dimensions.ts`
- 用例卡：`admin-use-cases.ts`（UC-OPS-RECOMMEND-001/004 展示条数文案 6 处 + UC-OPS-RECOMMEND-011 规则类型补"项目"+新增"按项目品类已移除"验收点）
- 文档：`17-APP端电商域-PRD-v3.1.0.md` + `design-map.json` + `CHANGELOG.md`

### 质量验证
- TypeScript 类型检查：0错误 ✅（npx vue-tsc --noEmit）
- IDE Lint：0错误 ✅

### 同步修改文档
- PRD: v3.1.49 → v3.1.50
- design-map.json: v3.1.56 → v3.1.57

---

## [v3.1.49] — 2026-08-13 ✅ 直播状态筛选去"已结束"选项+平台首页直播推荐去"N场直播中"文字

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.49

### Changed（直播状态筛选统一去"已结束"选项）
1. **MallPage.vue 精选直播状态筛选**：`liveStatusOptions` 数组移除 `{ value: 'ended', label: '已结束' }`，保留全部状态/直播中/预告/回放四项（与推荐引擎 sortLivesByDefaultRule 排除 ended 的逻辑一致——已结束直播不进入推荐流，筛选项无意义）
2. **ProjectMall.vue 项目商城直播Tab状态筛选**：`statusOptions` 数组移除"已结束"选项（同上逻辑）
3. **StoreItems.vue 门店二级页直播Tab状态筛选**：`liveFilterOptions` 数组移除"已结束"选项（同上逻辑）

### Changed（平台首页直播推荐区精简）
4. **PlatformHome.vue 直播推荐区**：移除"N场直播中"文字标签及相关 `ph-sec-live-text`/`ph-sec-live-dot`/`liveCount` 计算属性和 pulse 动画 CSS——直播状态已由 LiveCard 组件内部状态标签展示，板块标题仅保留"直播推荐"+图标+"更多"入口，不再重复显示直播数量统计

### 修改文件清单（3 代码 + 3 文档 = 6 个）
- 代码：`MallPage.vue` + `ProjectMall.vue` + `StoreItems.vue`（状态筛选去"已结束"）
- 代码：`PlatformHome.vue`（去"N场直播中"文字——已于 v3.1.48 之前完成）
- 文档：`17-APP端电商域-PRD-v3.1.0.md` + `design-map.json` + `CHANGELOG.md`

### 质量验证
- TypeScript 类型检查：0错误 ✅（npx vue-tsc --noEmit）
- IDE Lint：0错误 ✅

### 同步修改文档
- PRD: v3.1.48 → v3.1.49
- design-map.json: v3.1.55 → v3.1.56

---

## [v3.1.48] — 2026-08-13 ✅ 禁用项目会员层权益"允许查看不允许使用"精化（用例卡+BR-SHP-043同步）

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.48

### Changed（用例卡精化 — 允许查看不允许使用）
1. **运营后台项目禁用用例卡（UC-OPS-CONFIG-006）特别说明第十点细化**：原笼统表述"积分/券/余额仍可查看"改为明确的"允许查看、不允许使用"——会员权益内容(积分/优惠券/余额/会员等级/签到)仅只读展示，所有消耗/变更/交易类操作一律拦截：
   - 积分：积分明细可查看；积分商城兑换弹窗拦截"项目已停用，暂不支持兑换"，不允许兑换；积分抵扣因无法下单(④⑤下单支付已拦截)自然不可用
   - 优惠券：券列表/券详情可查看；因无法下单，不存在券抵扣入口
   - 余额：余额及账单明细可查看；申请提现弹窗拦截"项目已停用，暂不支持提现"，不允许提现
   - 签到：签到按钮禁用，不允许签到，不可获取签到奖励
   - 会员等级/权益清单仅展示不可获取；权益的新增/消耗/兑换/提现全部拦截，历史订单售后不受影响
2. **APP端项目首页用例卡（UC-SHP-STORE-001）同步**：特别说明改为"会员权益(积分/券/余额)仅可查看、不允许使用——积分不可兑换/不可抵扣、余额不可提现、签到禁用"；验收标准补充"权益(积分/券/余额)仅可查看不允许使用(兑换/抵扣/提现均弹窗拦截)"验收点

### Changed（PRD 同步）
3. **PRD BR-SHP-043 Layer5 会员层描述精化**：原"签到按钮禁用、下单/券使用/积分兑换禁用，但积分/优惠券/余额数据仍可查看"改为"允许查看、不允许使用"——补充积分兑换/余额提现弹窗拦截文案、签到禁获取奖励、等级权益仅展示等细节，与用例卡保持完全一致

### 修改文件清单（2 用例卡数据源 + 2 文档 = 4 个）
- 用例卡：`admin-use-cases.ts` + `app-use-cases.ts`
- 文档：`17-APP端电商域-PRD-v3.1.0.md` + `design-map.json`

### 质量验证
- TypeScript 类型检查：0错误 ✅（npx vue-tsc --noEmit）
- IDE Lint：0错误 ✅

---

## [v3.1.47] — 2026-08-12 ✅ 功能页面管理只读化+金刚区图标上传+输入框字符限制+展示条数上限调整

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.47

### Changed（功能页面管理改造）
1. **FunctionPageManage.vue 完全改造为只读+启用/禁用模式**：删除"新增功能页面"按钮和新增/编辑弹窗，列表"操作"列改为 el-switch 启用/禁用开关，筛选区增加"筛选"和"重置"按钮（工作副本模式，参考 AdManage.vue 模式）。页面内容不允许修改，只允许启用/禁用。

### Changed（金刚区图标改上传图片+去渐变色）
2. **KingKongManage.vue + ProjectKingKongManage.vue 图标输入框改为 el-upload**：限制图片大小 200KB，FileReader 转 base64 存储，删除"渐变色"输入框及 form.gradient
3. **KingKongGrid.vue 图标渲染优化**：icon 值以 http/data:/开头时显示 `<img>`，否则保留 emoji 兼容旧数据；去掉 gradient 背景应用改为白色 #f5f5f5

### Changed（输入框字符长度限制）
4. **11 个管理页所有新增/编辑表单输入框添加 maxlength + show-word-limit**：
   - 运营平台：AdManage(广告标题30) / KingKongManage(入口名称10) / SearchManage(底纹词15/热搜词15/自定义结果标题30/描述100) / RecommendRuleManage(规则名称20/描述100) / ProjectListManage(项目描述200/禁用原因200)
   - 租户平台：ProjectBannerManage(广告标题30) / ProjectKingKongManage(入口名称10) / MarketingCategoryManage(分类名称10/图标6) / ProjectManage(项目名称20/项目描述200) / ProjectProfileManage(项目描述200) / StoreManage(门店名称20/地址50/营业时间20/联系人10/电话11/邀请人姓名10/手机号11)

### Changed（首页推荐展示条数上限）
5. **ScenarioPanel.vue 新增 displayLimitMax prop**（默认50），两处 el-input-number 的 :max 绑定该 prop
6. **HomeRecommendManage.vue 直播推荐 Tab 传 :display-limit-max="10"，商品推荐 Tab 传 :display-limit-max="100"**
7. **app-config-store.ts updateScenarioDisplayLimit 校验逻辑改为按 scenarioId 动态判断上限**：sc-home-live → 10，sc-home-product → 100，其他 → 50

### Changed（租户后台 Banner 管理改名）
8. **"Banner管理"改名为"广告位管理"**：ProjectBannerManage.vue 标题+描述 / TenantLayout.vue 菜单文字+menuTitleMap+currentTitle / UseCaseDrawer.vue pgNameMap / router/index.ts 路由 meta.description+头部注释 / ProjectHomeConfig.vue 引导跳转按钮文字

### 修改文件清单（13 代码 + 2 用例卡数据源 + 2 文档 = 17 个）
- 运营后台：`FunctionPageManage.vue` + `KingKongManage.vue` + `AdManage.vue` + `SearchManage.vue` + `RecommendRuleManage.vue` + `ProjectListManage.vue` + `HomeRecommendManage.vue`
- 租户后台：`ProjectBannerManage.vue` + `ProjectKingKongManage.vue` + `MarketingCategoryManage.vue` + `ProjectManage.vue` + `ProjectProfileManage.vue` + `StoreManage.vue`
- 公共组件：`ScenarioPanel.vue` + `KingKongGrid.vue` + `TenantLayout.vue` + `UseCaseDrawer.vue`
- 路由：`router/index.ts`
- Store：`app-config-store.ts`
- 页面：`ProjectHomeConfig.vue`
- 用例卡：`admin-use-cases.ts` + `tenant-use-cases.ts`
- 文档：`CHANGELOG.md` + `design-map.json`

### 质量验证
- TypeScript 类型检查：0错误 ✅
- IDE Lint：0错误 ✅

---

## [v3.1.45] — 2026-08-11 ✅ 跳转体系全面修复：link 自动同步+旧 url 数据迁移+composable 统一

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.45

### Fixed（致命缺陷修复 — 跳转全面失效）
1. **B1 运营后台 KingKongManage link 字段被清空**：`link = jump_type === 'url' ? jump_id : ''` 导致 function_page 类型 link 为空字符串，APP 端 fallback 失效。修复：link 字段统一调用 `store.syncLinkFromJump()` 自动计算（function_page → resolveFunctionPageRoute，product/project/live → 拼接路由）
2. **B2 租户后台 ProjectKingKongManage 同 B1 问题**：同样修复为调用 `appConfig.syncLinkFromJump()` 自动计算
3. **B3 租户后台 ProjectBannerManage + 运营后台 AdManage 同 B1 问题**：同样修复 link 自动同步

### Added（基础设施增强）
4. **app-config-store 新增 `syncLinkFromJump(jumpType, jumpId, projectId?)` 函数**：根据 jump_type/jump_id/project_id 计算冗余 link 字段，作为 APP 端 fallback 使用。管理页 save() 统一调用，保证 link 非空
5. **app-config-store 新增 `migrateLegacyJumpType()` 函数**：store 初始化时自动扫描 adBanners/kingKongs/customSearchResults，将旧 `jump_type='url'` 且 link 匹配注册表 app_route 的数据迁移为 `function_page`，实现旧数据自动兼容
6. **useAppNavigation composable 新增 `navigateByJumpType(jumpType, jumpId, projectId?, link?)` 扁平参数入口**：统一封装 5 种跳转类型处理 + link fallback + url 兼容 + :projectId 替换 + query 参数解析
7. **E2E 测试用例 jump-navigation.spec.ts 新增 48 个用例**：6 个 Phase（冒烟 10 + 平台跳转 14 + 项目维度 10 + 运营后台 CRUD 12 + 异常边界 8 + 回归 4）

### Changed（管理页默认值 + 标签 + 验证补全）
8. **6 个管理页默认 jump_type 从 'url' 改为 'function_page'**：KingKongManage/AdManage/SearchManage/ProjectKingKongManage/ProjectBannerManage 新增/编辑默认值统一改为 function_page
9. **6 个管理页编辑旧 url 数据时回退为 function_page**：openEdit 中 `row.jump_type === 'url' ? 'function_page' : ...`，引导用户迁移
10. **6 个管理页 save() 验证逻辑补全 function_page 分支**：原先只验证 product/project/live/url，新增 function_page 必选验证
11. **6 个管理页 jumpTypeTag/jumpTypeLabel 函数补全 function_page 分支**：显示为"功能页面"标签（el-tag type=primary）
12. **6 个管理页筛选器新增"功能页面"选项**：el-select 下拉新增 function_page 选项
13. **契约层 CustomSearchResult 接口 jump_type 联合类型补全 function_page**（A1 修复）

### Changed（APP 端 4 页面统一接入 composable — AR04 修复）
14. **PlatformHome.vue onBannerClick 重构**：从内联 if/else 改为调用 `navigateByJumpType`
15. **KingKongGrid.vue onClick 重构**：从内联 7 分支处理改为调用 `navigateByJumpType`
16. **ProjectHome.vue onBannerClick + onQuickClick 重构**：统一调用 `navigateByJumpType`，保留金刚区名称回退逻辑
17. **SearchPage.vue doSearch csr 跳转重构**：统一调用 `navigateByJumpType`

### 修改文件清单（14 个代码 + 1 个测试 + 2 个文档 = 17 个）
- 契约层：`app-config-store.ts`（接口类型 + syncLinkFromJump + migrateLegacyJumpType）
- Composable：`useAppNavigation.ts`（navigateByJumpType 新增）
- 运营后台：`KingKongManage.vue` + `AdManage.vue` + `SearchManage.vue`
- 租户后台：`ProjectKingKongManage.vue` + `ProjectBannerManage.vue`
- APP 端：`PlatformHome.vue` + `KingKongGrid.vue` + `ProjectHome.vue` + `SearchPage.vue`
- 测试：`tests/jump-navigation.spec.ts`（新，48 用例）
- 文档：`CHANGELOG.md` + `design-map.json`

### 质量验证
- TypeScript 类型检查：0 新增错误（预存在 JumpTargetPicker 类型错误不在本次修改范围）
- IDE Lint：0 错误 ✅

---

## [v3.1.46] — 2026-08-12 ✅ 商品卡去收藏按钮+去门店标签+直播详情页空展位

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.46

### Changed（APP端商品卡精简）
1. **ProductCard.vue 移除收藏按钮**：删除心形收藏图标（`.pc-like`），覆盖所有商品列表展示位置（平台首页/商城页/项目首页/项目商城页/搜索结果/门店商品列表，共 6 处复用全局生效）
2. **ProductCard.vue 移除商品名称下方门店标签**：删除 `.pc-store-line`/`.pc-store-tag` 橙色门店名标签行，同步删除 `storeName` computed 与 `useProjectStore` 依赖（避免未使用变量）

### Changed（直播详情页空展位）
3. **LiveDetail.vue 全部内容移除改为空页展位**：删除封面/直播信息/回放入口/直播商品/所属项目入口等全部模块，保留手机壳容器+顶部状态栏+返回按钮+用例卡，中间仅显示"直播详情页/页面建设中，敬请期待"占位说明；路由 `/app/live/:liveId` 及 LiveCard 等跳转入口保持不变

### 修改文件清单（2 个代码 + 3 个文档）
- 组件：`ProductCard.vue`（去收藏+去门店标签）
- 页面：`LiveDetail.vue`（空展位重写）
- 文档：`CHANGELOG.md` + `design-map.json` + PRD

### 质量验证
- IDE Lint：0 错误 ✅

---

## [v3.1.44] - 2026-08-10

### Added
- 运营后台+租户后台所有列表筛选增加"筛选"/"重置"按钮（10个页面）
- 运营后台ProjectListManage、租户后台ProjectManage/ProjectProfileManage编辑页状态下增加禁用影响说明文字
- 租户后台ProjectBannerManage/ProjectKingKongManage/ProjectManage新增搜索筛选控件

### Changed
- 项目状态用语统一："运营中/停用" → "启用/禁用"（3个页面）
- 筛选机制统一：用户输入→点击"筛选"→同步到工作副本(_*前缀)→filtered computed→重置清空全部

### Fixed
- 用例卡(admin/tenant-use-cases.ts)同步v3.1.44变更：状态用语+筛选重置+禁用说明
- design-map.json version v3.1.43→v3.1.44

---

## [v3.1.41] — 2026-08-10 ✅ 用例卡缺口修复：新增7个UC+2个运营后台页面

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.41

### Added（新增用例卡 + 页面节点）
1. **UC-OPS-RECOMMEND-007 商城列表管理**（新增）：MallManage.vue 商城列表Tab，管理sc-mall-projects场景的项目推荐（规则引用+手动推荐+预览+分页）
2. **UC-OPS-RECOMMEND-008 精选商品管理**（新增）：MallManage.vue 精选商品Tab，管理sc-mall-featured-products场景的商品推荐，展示条数无上限
3. **UC-OPS-RECOMMEND-009 精选直播管理**（新增）：MallManage.vue 精选直播Tab，管理sc-mall-featured-lives场景的直播推荐，展示条数无上限
4. **UC-OPS-RECOMMEND-010 规则引擎列表浏览**（新增）：RecommendRuleManage.vue 规则实体列表+搜索筛选+分页
5. **UC-OPS-RECOMMEND-011 规则实体CRUD**（新增）：RecommendRuleManage.vue 新增/编辑/删除规则+DimensionConfigurator维度配置
6. **UC-OPS-RECOMMEND-012 模板快捷创建规则**（新增）：RecommendRuleManage.vue 直播/商品模板一键生成规则
7. **UC-TNT-TENANT-007 店长/店员管理**（新增）：StoreManage.vue 邀请人Tab，店长/店员CRUD+按门店筛选+分页，关联ENT-PROJECT-010/011

### Added（设计映射更新）
8. **design-map.json 新增 PG-OPS-PC-007/008**：商城管理页(/admin/mall-manage)+规则引擎管理页(/admin/recommend-rule)，运营后台页面 6→8
9. **FN-OPS-PC-008 商城管理**（新增 FN）：3个推荐场景（商城列表/精选商品/精选直播）统一管理
10. **FN-OPS-PC-009 规则引擎管理**（新增 FN）：规则实体CRUD+模板快捷创建+引用计数

### Fixed（阻断+过时修复）
11. **prototype-menu.ts 4处旧UC编号替换**：PG-SHP-APP-002/009A/010/011A 的ucIds替换为功能维度编号
12. **design-map.json PG-OPS-PC-004/005 路由修复**：`/admin/live-recommend`→`/admin/home-recommend`，`/admin/product-recommend`→`/admin/home-recommend`

### Updated（数据更新）
13. **design-map.json**：version v3.1.40→v3.1.41，total_uc 54→61，RECOMMEND uc_count 6→12，TENANT uc_count 6→7
14. **use-cases/index.ts**：总数注释 54→61，新增feature标注
15. **admin-use-cases.ts**：UC数 17→23（新增RECOMMEND 007~012），头部注释更新
16. **tenant-use-cases.ts**：UC数 6→7（新增TENANT-007），头部注释更新
17. **prototype-menu.ts**：ADMIN_MENU新增PG-OPS-PC-007/008节点，PG-TNT-PC-002新增UC-TNT-TENANT-007+ENT-PROJECT-011

## [v3.1.37] — 2026-08-10 ✅ 项目禁用分层拦截+运营平台项目列表+租户后台项目选择器

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.37

### Changed（运营平台项目列表 + 租户后台改造）
1. **运营平台新增"项目管理"菜单分组**：在"运营管理"子菜单上方新增独立的"项目管理"菜单分组（el-menu-item-group），仅含"项目列表"一项，路由 `/admin/projects`，icon: FolderOpened
2. **运营平台项目列表管理页**（ProjectListManage.vue 新建）：从租户后台 ProjectManage.vue 迁移并增强——新增启用/禁用操作按钮（切换 status 字段）、禁用原因输入弹窗、搜索筛选（按名称/ID/状态/租户）、分页（每页10条）、所属租户列、行业列、商城名称展示
3. **租户后台移除"项目列表"入口**：TenantLayout.vue 移除"租户管理"菜单分组（含项目列表入口），移除 `/tenant/projects` 路由；header-bar 右侧新增项目下拉选择器（el-select 绑定 currentProjectId，切换项目跳转 /tenant/projects/:id/profile），未选项目时显示"请在顶部选择项目"提示
4. **路由调整**：router/index.ts 新增 `/admin/projects` 路由 + 懒加载声明 + 头部注释；移除 `/tenant/projects` 路由（ProjectManage 路由声明保留以备复用但不再使用）；新增 `/tenant` 和 `/tenant/projects` 重定向到第一个 active 项目的 profile 页

### Added（项目禁用分层拦截 — BR-SHP-043）
5. **BR-SHP-043 项目禁用分层拦截规则**（新增）：采用"软停用"策略（数据保留+前端隐藏+交易拦截+历史不受影响），5层拦截机制：
   - **Layer1 数据层过滤**：project-store 新增 `activeProjects`/`activeProjectIds` computed + `isProjectActive()` 方法
   - **Layer2 路由层拦截**：ProjectFrame.onMounted 调用 `checkProjectActive` 检查项目状态
   - **Layer3 详情层拦截**：ProductDetail/LiveDetail/StoreDetail 的 onMounted 检查所属项目状态
   - **Layer4 交易层拦截**：前端下单按钮根据 projectActive 禁用（后端二次校验为文档说明）
   - **Layer5 会员层处理**：ProjectMember/ProjectHome 显示停用提示条 + 签到按钮禁用
6. **useProjectStatusFilter composable**（新建）：统一封装 inactive 项目内容过滤逻辑——`filterByActiveProject<T>(items, projectIdField)` 过滤掉 inactive 项目的商品/直播/门店，`filterActiveProjects(projects)` 过滤项目列表本身，`isProjectActive(projectId)` 检查单个项目
7. **useProjectActiveCheck composable**（新建）：项目状态检查 composable——`checkProjectActive(projectId, options)` 弹窗拦截（ElMessageBox.alert 提示"项目已停用" + router.back()），`isProjectActive(projectId)` 同步检查
8. **FN-SHP-ADMIN-007 运营平台项目管理**（新增 FN）：项目列表 CRUD + 启用/禁用操作，3个 UC（UC-OPS-PC-006-01/02/03）
9. **FN-TNT-PC-001 修订**：项目列表移至运营平台，本功能改为项目下拉选择器 + 当前项目管理（status 字段只读）

### Updated（APP端列表/详情/项目内页接入项目状态过滤与拦截）
10. **MallPage.vue**：sortedProjects 数据源改用 filterActiveProjects 过滤；allFeaturedProducts/allFeaturedLives 追加 filterByActiveProject 过滤
11. **PlatformHome.vue**：直播推荐 allItems + 商品推荐 allItems 追加 filterByActiveProject 过滤（在可见范围过滤后、推荐引擎排序前）
12. **SearchResultPage.vue**：productResults/projectResults/liveResults 追加项目状态过滤
13. **ProjectFrame.vue**：onMounted 调用 checkProjectActive 检查项目状态，inactive 弹窗返回
14. **ProductDetail.vue**：onMounted + watch(productId) 检查所属项目状态，inactive 弹窗返回
15. **LiveDetail.vue**：onMounted + watch(liveId) 检查所属项目状态，inactive 弹窗返回
16. **StoreDetail.vue**：onMounted 检查所属项目状态（优先从 route.query.projectId 获取，fallback 到 storeInfo.project_id）
17. **ProjectMember.vue**：新增 projectActive computed + 停用提示条 + 签到按钮 disabled + onSignIn 增加项目停用检查
18. **ProjectHome.vue**：新增 projectActive computed + 停用提示条（项目首页仍允许查看，仅提示不可下单）

### Docs
- PRD: v3.1.36→v3.1.37（新增 BR-SHP-043 + FN-SHP-ADMIN-007 + 修订 FN-TNT-PC-001）
- design-map.json: version v3.1.36→v3.1.37，新增 PG-OPS-PC-006 页面

---

## [v3.1.36] — 2026-08-10 ✅ 推荐引擎脱离+项目维度直播推荐默认规则

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.36

### Changed（推荐引擎脱离 + 项目维度直播推荐默认规则）
1. **平台首页直播推荐脱离规则引擎**（BR-SHP-042）：PlatformHome.vue 直播推荐不再调用 ruleId，改用 `sortLivesByDefaultRule` 工具函数预排序 allItems，保留手动推荐叠加(手动在前+默认规则补足)+展示条数配置
2. **运营后台首页推荐页直播Tab移除规则引用**：ScenarioPanel.vue 新增 `showRuleSelector` prop(默认true)，直播Tab传 false 隐藏规则引用卡片，改为显示"按默认规则读取"说明卡；商品Tab保留规则引用不变
3. **项目维度推荐直播默认规则**（BR-SHP-041）：ProjectHome.vue 热门直播 + StoreDetailContent.vue 门店推荐直播，均改用 `sortLivesByDefaultRule(lives, 4)`，状态排序 live→upcoming→replay + 同状态 started_at 倒序，排除 ended，默认展示前4条
4. **商城精选直播Tab不变**：MallPage.vue 精选直播Tab仍走规则引擎，首页直播推荐"更多"跳转 `/app/mall?tab=featuredLives` 不变

### Added（维度注册表+工具函数+mock数据）
5. 新增 `started_at` 维度到 `recommend-dimensions.ts` 维度注册表（仅直播，连续时间类型）
6. 新增 `sortLivesByDefaultRule<T>(lives, limit?)` 工具函数到 `recommend-dimensions.ts`，封装默认规则排序逻辑
7. 补充 `project-store.ts` 中 `proj-health-02` 的直播mock数据：新增 live-016~020（5条），使该项目的直播总数达到6条（>4条），覆盖 live/upcoming/replay 三种状态

### Updated（用例卡标注）
8. `app-use-cases.ts` 用例卡标注：
   - UC-SHP-APP-001-01（平台首页）：直播推荐区标注"v3.1.36 BR-SHP-042 脱离规则引擎，按默认规则排序"
   - UC-SHP-APP-009-01（项目首页）：直播推荐区标注"v3.1.36 BR-SHP-041 默认规则，默认展示前4条"
   - UC-SHP-APP-011-01（门店详情）：推荐直播标注"v3.1.36 BR-SHP-041 默认规则，默认展示前4条"

### Docs
- PRD: v3.1.34→v3.1.36（补记 v3.1.35 + 新增 v3.1.36 变更记录 + 新增 BR-SHP-041/042）
- design-map.json: version v3.1.35→v3.1.36

## [v3.1.35] — 2026-08-10 ✅ 首页推荐合并+展示条数配置+菜单重组

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.35

### Changed
1. **直播推荐+商品推荐合并为"首页推荐"**：删除 LiveRecommendManage.vue 和 ProductRecommendManage.vue 两个独立页面，新建 HomeRecommendManage.vue 首页推荐页(2Tab：直播推荐/商品推荐)，复用 ScenarioPanel 组件
2. **首页推荐增加"展示条数"配置入口**：Store 层新增 `updateScenarioDisplayLimit` 方法，ScenarioPanel.vue 新增 `showDisplayLimitEditor` prop(默认false)，当为true时显示 el-input-number(1-50，留空=无上限)
3. **菜单分组重组**："APP首页配置"改为"运营管理" el-sub-menu，6个功能统一归到"运营管理"下(首页推荐/商城管理/规则引擎/搜索管理/广告位管理/金刚区管理)

### Deleted
4. 删除 `LiveRecommendManage.vue` + `ProductRecommendManage.vue`（合并为 HomeRecommendManage.vue）

### Docs
- PRD: v3.1.34→v3.1.35
- design-map.json: version v3.1.34→v3.1.35

---

## [v3.1.34] — 2026-08-10 ✅ 推荐引擎职责分离+使用场景独立化+商城管理页3Tab

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.34

### Changed（规则引擎职责分离 + 使用场景独立化）

#### 架构调整
1. **规则引擎职责分离**：
   - 规则引擎只负责获取数据集（排序），不再管理展示条数
   - `RecommendRuleEntity` 移除 `display_limit` 字段
   - `RecommendItem` 移除 `display_limit` 字段
   - `RuleTemplate` 移除 `display_limit` 字段
   - 展示条数职责转移到使用场景 `RecommendScenario`，新增 `display_limit?` 字段
   - 首页推荐区场景 display_limit=6（受条数限制）
   - 商城精选Tab场景 display_limit=undefined（无上限）

2. **使用场景独立化**：
   - 删除 `sc-home-project` 场景（首页无项目推荐区）
   - 新增 `sc-mall-projects` 场景（商城列表Tab管理项目推荐）
   - Store 层新增 `mallProjectsRule` computed，移除 `projectScenarioRule`
   - `useRecommendEngine.buildByScenario` 改为从 `scenario.display_limit` 读取

3. **运营后台菜单重组**：
   - "首页推荐"分组：直播推荐、商品推荐（从原"APP首页配置"分组移出）
   - "商城管理"分组：商城（MallManage，3Tab完整管理）
   - "规则引擎"分组：规则引擎管理
   - "APP首页配置"分组：搜索管理、广告位管理、金刚区管理
   - 移除"项目推荐管理"菜单项

#### 契约层
4. **recommend-engine.ts**（修改）：
   - `RecommendRuleEntity` 移除 `display_limit` 字段
   - `RecommendItem` 移除 `display_limit` 字段
   - `RuleTemplate` 移除 `display_limit` 字段
   - `RecommendScenario` 新增 `display_limit?: number` 字段
   - 注释更新（v3.1.34 职责分离说明）

#### Store 层
5. **app-config-store.ts**（修改）：
   - `DEFAULT_RECOMMEND_RULES` 移除所有 `display_limit`
   - `DEFAULT_RULE_TEMPLATES` 移除所有 `display_limit`
   - `DEFAULT_PROJECT_RECOMMEND_CONFIGS` 移除 `display_limit`
   - `DEFAULT_CONFIG.liveRecommendConfigs`/`productRecommendConfigs` 移除 `display_limit`
   - `DEFAULT_RECOMMEND_SCENARIOS`：删除 `sc-home-project`，新增 `sc-mall-projects`，首页场景增加 `display_limit: 6`
   - 数据迁移代码移除 `display_limit` 赋值
   - 新增 `mallProjectsRule` computed，移除 `projectScenarioRule` computed
   - return 块同步调整

#### Composable 层
6. **useRecommendEngine.ts**（修改）：
   - `ScenarioBuildParams.displayLimit` 注释更新
   - `buildByScenario` 改为从 `scenario.display_limit` 读取展示条数（不再从 `rule.display_limit` 读取）

#### 组件层
7. **DimensionConfigurator.vue**（修改）：
   - `showDisplayLimit` 默认值由 `true` 改为 `false`（规则引擎不再管理展示条数）
   - Props 注释标注 v3.1.34 已废弃

8. **ScenarioPanel.vue**（新增）：
   - 通用场景面板组件，接收 scenarioId / targetType / contentTypeLabel 参数
   - 统一渲染：规则引用 + 手动推荐列表 + 预览
   - 支持三种目标类型：project / product / live
   - 动态适配不同内容类型的标题、副信息、状态标签
   - 供 MallManage.vue 的 3 个 Tab 复用

#### 页面层
9. **MallManage.vue**（新增）：
   - 商城管理页（v3.1.34 新增），路由 `/admin/mall-manage`
   - 3 个 Tab：商城列表（项目，sc-mall-projects）/ 精选商品（商品，sc-mall-featured-products）/ 精选直播（直播，sc-mall-featured-lives）
   - 每个 Tab 内嵌 ScenarioPanel 组件，复用规则引用+手动推荐+预览逻辑

10. **ProjectRecommendManage.vue**（删除）：
    - 移除文件、路由（AdminProjectRecommend）、菜单项
    - 项目推荐改由商城管理页的商城列表 Tab 管理（新场景 sc-mall-projects）

11. **AdminLayout.vue**（修改）：
    - 菜单重组为 4 个分组：首页推荐 / 商城管理 / 规则引擎 / APP首页配置
    - 新增图标导入（Element Plus Icons Vue）
    - menuTitleMap 更新

12. **RecommendRuleManage.vue**（修改）：
    - 移除表格"展示条数"列
    - 移除表单"首页展示条数"项
    - 移除 DimensionConfigurator 的 `display-limit-value` 和 `show-display-limit` 参数
    - reactive `editingRule` 移除 `display_limit` 字段
    - `openCreate` 移除 `display_limit` 初始化
    - `applyTemplateToEditing` 移除 `display_limit` 应用
    - `saveRule` 移除 `display_limit` 保存

13. **LiveRecommendManage.vue**（修改）：
    - 展示条数文案从 `currentRule.display_limit` 改为 `scenario?.display_limit`
    - 预览 `displayLimit` 从 `currentRule.value?.display_limit` 改为 `scenario.value?.display_limit`

14. **ProductRecommendManage.vue**（修改）：
    - 同 LiveRecommendManage 的两处 `display_limit` 调整

15. **PlatformHome.vue**（修改）：
    - 直播推荐 `limit` 从规则实体改从场景读取（`sc-home-live` 场景的 `display_limit`）
    - 商品推荐 `limit` 同理改从 `sc-home-product` 场景读取

16. **MallPage.vue**（修改）：
    - 商城列表 Tab 接入 `sc-mall-projects` 场景规则引擎排序
    - 新增 `sortedProjects` computed（可见范围过滤 + 规则引擎排序）
    - `filteredProjects` 改为基于 `sortedProjects` 做行业筛选

#### 路由层
17. **router/index.ts**（修改）：
    - 移除 `ProjectRecommendManage` 懒加载 import 和 `AdminProjectRecommend` 路由
    - 新增 `MallManage` 懒加载 import 和 `AdminMallManage` 路由（`/admin/mall-manage`）
    - 路由文档注释更新

### 质量验证
- TypeScript 类型检查：0 错误 ✅
- IDE Lint：0 错误 ✅

### 同步修改文档
- PRD: v3.1.33 → v3.1.34
- design-map.json: v3.1.33 → v3.1.34

---

## [v3.1.32] — 2026-08-10 ✅ 门店页推荐数量限制+更多二级页+门店位置缩小+首页推荐走fallback

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.32

### Changed（门店页推荐与位置优化）

#### 组件层
1. **StoreDetailContent.vue**（修改）：
   - 门店位置区域缩小：`.sdl-map` padding 20px→12px，`.sdm-emoji` font-size 32px→24px，整体高度约减半
   - 推荐直播数量限制为4个（与项目首页一致），超过显示"更多"按钮
   - 推荐商品数量限制为50个（与项目首页一致），超过显示"更多"按钮
   - "更多"按钮智能显示：`showMore=true` 且数量超过限制才显示（原为只要 showMore 就显示）
   - 新增 `MAX_LIVE_DISPLAY=4` / `MAX_PRODUCT_DISPLAY=50` 常量
   - 新增 `displayLives` / `displayProducts` computed（截取前N个）
   - 新增 `showMoreLive` / `showMoreProduct` computed（超限判断）

#### 页面层
2. **ProjectStores.vue**（修改）：
   - "我的门店"Tab 的 StoreDetailContent `showMore` 由 `false` 改为 `true`，接入"更多"跳转
   - 新增 `goStoreItems(tab)` 方法，跳转 `/app/store/:storeId/items?projectId=xxx&tab=xxx&from=project-stores`
   - 带 `from=project-stores` 参数标识来源，供二级页返回时回到"我的门店"Tab

3. **StoreItems.vue**（修改）：
   - `goBack()` 方法优化：读取 `route.query.from`，若为 `project-stores` 则返回 `/app/project/:projectId/stores`，否则返回门店详情页
   - 顶部Tab已支持商品/直播双Tab展示（原有功能，本次确认符合需求）

#### 数据层
4. **project-store.ts**（修改）：
   - 清空 `proj-daily-01` / `proj-health-01` 首页配置的 `recommend_products` 和 `live_recommend` 字段（走 fallback 逻辑：全部商品取50/全部直播取4），符合"租户后台不手动管理项目首页推荐"
   - 补充 `proj-daily-01` mock 商品：6→62个（分散到3个门店+项目级，覆盖4个营销类目）
   - 补充 `proj-health-01` mock 商品：5→62个（分散到3个门店+项目级，覆盖4个营销类目）
   - 补充 `proj-daily-01` mock 直播：2→7个（覆盖 live/upcoming/replay/ended 四种状态 + store/headquarters 主播类型）
   - 补充 `proj-health-01` mock 直播：2→7个（覆盖 live/upcoming/replay/ended 四种状态 + headquarters/personal/store/supplier 主播类型）

### 验证效果
- 项目首页：商品推荐显示50个（有更多跳商城），热门直播显示4个（有更多跳商城）
- 门店页：推荐直播显示4个（有更多跳 StoreItems），推荐商品显示50个（有更多跳 StoreItems）
- StoreItems 二级页：全量展示（直播7个/商品62个），顶部Tab切换商品/直播

### 文档同步
- PRD: v3.1.31→v3.1.32
- design-map.json: version v3.1.31→v3.1.32
- CHANGELOG: 新增 [v3.1.32] 记录

---

## [v3.1.31] — 2026-08-10 ✅ 项目门店Tab恢复为"我的门店"+推荐规则引擎独立化

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.31

### Added（规则引擎独立化）

#### 契约层
1. **recommend-engine.ts**（修改）：
   - 新增 `RecommendRuleEntity` 接口（独立的规则实体：rule_id/name/target_type/rule/status/is_builtin等）
   - `RecommendScenario` 新增 `rule_id` 字段（场景1:1引用规则实体）
   - `RuleTemplate` 注释更新：模板改为"新建规则时的快捷预设"，不再"一键覆盖场景规则"

#### Store层
2. **app-config-store.ts**（修改）：
   - 新增 `recommendRules` 状态 + 5个内置规则实体（直播2个/商品2个/项目1个）
   - 新增 `getRuleById` / `rulesByTarget` / `allRulesByTarget` 计算属性
   - 新增 `addRule` / `updateRule` / `deleteRule` / `setScenarioRule` 方法（含内置规则保护+引用检查）
   - 新增 `liveScenarioRule` / `productScenarioRule` / `projectScenarioRule` / `mallFeaturedProductRule` / `mallFeaturedLiveRule` 便捷计算属性（APP端使用）
   - 4个默认场景 + 1个新增场景（sc-home-project）改为引用 `rule_id`
3. **data-service.ts**（修改）：`StoredAppConfig` 新增 `recommendRules` 字段

#### Composable层
4. **useRecommendEngine.ts**（重写）：
   - `buildRecommendResult` 新增 `ruleId` 参数，优先使用规则实体排序
   - 新增 `buildByScenario` / `getItemsByScenario` 方法（按场景ID构建，自动查找rule_id）
   - 新增 `getRuleById` 方法
   - 保留旧版兼容：未传ruleId时仍从recommendConfigs查找默认规则

#### 页面层
5. **RecommendRuleManage.vue**（新增）：规则引擎管理页 — 规则列表CRUD + 维度配置(复用DimensionConfigurator) + 内置规则标记 + 引用场景计数 + 模板快捷创建
6. **LiveRecommendManage.vue**（重构）：移除内联DimensionConfigurator+规则模板区，改为"规则引用下拉 + 手动推荐 + 预览"
7. **ProductRecommendManage.vue**（重构）：同上
8. **ProjectRecommendManage.vue**（重构）：同上

#### 路由&菜单
9. **router/index.ts**（修改）：新增 `/admin/recommend-rule` 路由
10. **AdminLayout.vue**（修改）：菜单新增"规则引擎管理"项（推荐引擎分组）

#### APP端接入
11. **PlatformHome.vue**（修改）：直播/商品推荐接入规则引擎（ruleId + displayLimit从场景规则派生）
12. **MallPage.vue**（修改）：精选商品/直播接入规则引擎（ruleId）

### Changed（项目门店Tab恢复为"我的门店"）

#### 问题1：门店Tab恢复+引导
13. **StoreDetailContent.vue**（新增）：抽取门店详情内容区为可复用子组件（门店信息+位置+推荐直播+推荐商品）
14. **StoreDetail.vue**（重构）：独立详情页改用 `StoreDetailContent` 子组件
15. **ProjectFrame.vue**（修改）：底部Tab从3个恢复为4个（首页/商城/门店/会员），门店Tab icon 🏪
16. **ProjectStores.vue**（重写）：从"门店列表"重写为"我的门店"逻辑
    - 绑定门店：显示门店详情（复用StoreDetailContent）
    - 未绑定门店：显示引导卡片（联系店长邀请加入 + 去商城逛逛 + 返回首页）

### Quality
- TypeScript 类型检查：0 错误 ✅
- IDE Lint：0 错误 ✅

---

## [v3.1.30] — 2026-08-10 ✅ 推荐规则引擎重构+邀请制私域运营+门店Tab移除

**需求流**: STR-SAAS-002 | **阶段**: 开发 | **PRD版本**: v3.1.30

### Added（推荐规则引擎重构 + 邀请制私域运营模型）

#### 契约层（新增2文件 + 修改3文件）
1. **recommend-engine.ts**（新增）：推荐规则引擎核心类型 — RecommendTargetType / DimensionDef / SortDimension / RecommendRule / RecommendItem / RecommendScenario / RuleTemplate / FallbackConfig / VisibilityConfig / TimeBasedRule(预留) / SpreadConfig(预留)
2. **recommend-dimensions.ts**（新增）：全局维度注册表 — 11个维度定义(通用+直播+商品+项目) + getDimensionsByTarget + isValidDimension + 通用 sortByDimensions 函数(替代 sortLiveByDimensions/sortProductByDimensions)
3. **project-schemas.ts**（修改）：
   - ENT-PROJECT-004 LiveRoom 新增 visibility_config（LiveVisibilityConfigSchema：mode + excluded_inviter_ids + included_inviter_ids + excluded_store_ids + excluded_project_ids）
   - ENT-PROJECT-006 ProjectMember 新增 store_id（用户绑定门店）+ inviter_id（邀请人）
   - 新增 ENT-PROJECT-010 Inviter（邀请人/店长/店员：inviter_id/store_id/project_id/name/phone/role/status/invited_count）
   - 新增 ENT-PROJECT-011 UserStoreBinding（用户门店绑定关系：binding_id/user_id/store_id/project_id/inviter_id/bound_at）
4. **app-schemas.ts**（修改）：旧版 RecommendItem 重命名为 LegacyRecommendItem 避免冲突
5. **index.ts**（修改）：导出 recommend-engine + recommend-dimensions

#### Store层（修改4文件）
6. **app-config-store.ts**（修改）：
   - dim_type 由联合类型改为 string（运行时由注册表校验）
   - 新增 projectRecommendConfigs / projectRecommends / projectDefaultRule
   - 新增 recommendScenarios（5个默认场景：首页直播/商品推荐区 + 商城精选商品/直播Tab）
   - 新增 ruleTemplates（5个内置模板：直播状态+人气/直播项目+主播/商品销量/商品类目+销量/项目行业+会员数）
   - 新增 sortRecommendByDimensions 通用排序函数
7. **user-store.ts**（修改）：
   - 新增 userStoreBindings 状态 + mock数据(3条)
   - 新增 boundStoreIds / boundProjectIds / boundStoreByProject / bindingByStore computed
   - 新增 bindStore / unbindStore / isStoreBound 方法
   - ProjectMember mock数据补充 store_id / inviter_id
8. **project-store.ts**（修改）：
   - 新增 inviters 状态 + mock数据(10个邀请人覆盖4个项目)
   - 新增 invitersByProject / invitersByStore / getInviterById / managerByStore computed
   - 新增 addInviter / updateInviter / deleteInviter / getManagerNameByStore 方法
   - LiveRoom mock数据补充 visibility_config + 旧数据迁移逻辑
9. **data-service.ts**（修改）：StoredAppConfig 新增 projectRecommendConfigs/recommendScenarios/ruleTemplates；StoredProjectData 新增 inviters；StoredUserData 新增 userStoreBindings

#### Composables层（新增3文件）
10. **useRecommendEngine.ts**（新增）：场景化推荐引擎 — buildRecommendResult(手动+规则叠加+去重补足) + getRecommendItems + getDimensionsForTarget + getScenarioById
11. **useVisibilityFilter.ts**（新增）：可见范围过滤 — all/bound_projects 双模式 + strict/loose/global 三级兜底策略 + fallback_label 标签
12. **useLiveVisibility.ts**（新增）：直播可见范围权限 — 按 anchor_type 差异化(store=邀请人级/headquarters=门店级/supplier=项目级/personal=最严格) + public/exclude/include 三种权限模式

#### 组件层（新增1文件）
13. **DimensionConfigurator.vue**（新增）：通用维度配置组件 — 维度开关 + 多选拖拽排序优先级 + 连续维度方向选择 + 固定优先级维度 + 叠加排序链顺序调整 + 排序逻辑说明面板 + 首页展示条数控件

#### 页面层（新增1文件 + 重构2文件 + 修改4文件）
14. **ProjectRecommendManage.vue**（新增）：项目推荐管理页面 — 复用 DimensionConfigurator + useRecommendEngine，支持维度配置+规则模板+手动推荐+效果预览
15. **LiveRecommendManage.vue**（重构）：使用 DimensionConfigurator 替代内联维度配置 + useRecommendEngine + 规则模板
16. **ProductRecommendManage.vue**（重构）：同 LiveRecommendManage 结构
17. **PlatformHome.vue**（修改）：推荐数据源接入 useVisibilityFilter + useLiveVisibility + useRecommendEngine
18. **MallPage.vue**（修改）：精选商品/直播接入 useVisibilityFilter + useLiveVisibility + useRecommendEngine
19. **StoreManage.vue**（重写）：新增店长/店员（邀请人）管理Tab — 邀请人CRUD + 按门店筛选 + 角色店长/店员
20. **ProjectFrame.vue**（修改）：底部导航去掉门店Tab（确认点1，暂时不保留入口）
21. **StoreDetail.vue**（修改）：返回逻辑改为返回项目首页（门店列表入口已移除）

#### 路由层
22. **router/index.ts**（修改）：新增 ProjectRecommendManage 路由(/admin/project-recommend) + StoreManage 邀请人路由
23. **AdminLayout.vue**（修改）：侧边栏新增"项目推荐管理"菜单项

### Confirmed Points（3个确认点）
- **确认点1**：门店列表页暂时不保留入口（ProjectFrame 底部导航去掉门店Tab）
- **确认点2**：租户后台门店列表增加店长/店员管理（=邀请人，StoreManage 新增Tab）
- **确认点3**：直播可见范围配置是已有功能（直播列表已有配置），本次仅新增 visibility_config 字段，不处理管理功能

### Synced Docs
- PRD: v3.1.29→v3.1.30
- CHANGELOG: 新增[v3.1.30]记录
- design-map.json: version v3.1.29→v3.1.30

---

## [v3.1.28] — 2026-08-09 ✅ 文档全面审查与用例卡构建

**需求流**: STR-SAAS-002 | **阶段**: 文档审查+用例卡构建 | **PRD版本**: v3.1.28

### Changed（文档三方交叉审查修复 + 用例卡体系构建）

#### 阶段1：文档全面审查（只读）
- BA Agent 审查 PRD §0-§16 全章节
- UX Agent 审查设计文档 §1-§13 全章节 + design-map.json
- PM Agent 交叉校验 + 门禁检查
- 产出问题清单：6个P0 + 8个P1 + 2个UC机制问题

#### 阶段2：PRD修复（v3.1.27→v3.1.28）
1. **UC数量校准**：46→52（新增UC-SHP-APP-011-02/012-02/013-02 APP独立页 + UC-TNT-PC-005-01/006-01/007-01 租户后台）
2. **租户后台FN补全**：新增FN-TNT-PC-005(项目信息管理)/FN-TNT-PC-006(项目Banner管理)/FN-TNT-PC-007(项目金刚区管理)及对应UC
3. **FN-TNT-PC-003标注deprecated**：v3.1.21移除，编号保留不重用，功能拆分为006+007
4. **BR补全**：BR-SHP-036(contact_name)/037(独立门店页)/038(会员卡式)/039(优惠券二级页)/040(Logo上传)
5. **CONFIG-SHP-010标注deprecated**：精选7:3比例已失效，v3.1.9改为独立Tab
6. **ENT补全**：ENT-PROJECT-006A(Coupon) + ENT-PROJECT-006B(SignInState)
7. **§13验收矩阵**：补3个租户FN行+FN-TNT-PC-003标注deprecated
8. **§15多端差异矩阵**：补3行+修订项目首页配置行

#### 阶段3：设计文档修复（v3.1.27→v3.1.28）
9. **design-map.json**：版本升级+租户页面4→7(含deprecated 003标注)+独立页UC独立化(011A/012A/013A)+UC总数52+modals补3弹窗+BR总数40
10. **§8跳转矩阵**：补租户后台3页面跳转+deprecated标注
11. **§9追溯表**：全量重做52个UC映射+deprecated 003-01标注
12. **§10反向匹配**：PRD元素清单重做(FN25/UC52/BR40/ENT19)+BR覆盖检查补036-040

#### 阶段4：用例卡构建
13. **数据源创建**：src/data/use-cases/{app,admin,tenant}-use-cases.ts（52个UC，按研发友好模板v3）
14. **UseCaseDrawer组件扩展**：新增route/component/terminal/entryPaths/apiCalls/stateMachine字段及渲染区块
15. **useUseCaseCard composable**：创建接入组合式函数，页面2行代码即可接入
16. **30个页面接入**：APP端19+运营后台5+租户后台6，每页含HelpButton+UseCaseDrawer
17. **Markdown用例卡清单**：输出52个UC卡片摘要文档供研发查阅

#### 阶段5：质量验收
18. **三方一致性复核**：PRD UC(52) ↔ design-map UC(52) ↔ 用例卡 UC(52) 完全对齐
19. **PM门禁**：G-REQ-17 UC格式完整性 + G-REQ-20 端到端闭环 全部通过
20. **Linter**：0 errors

### Stats
- 修改文件：41个（4文档+6基础设施+30页面+1验收报告）
- 新增UC：6个（011-02/012-02/013-02/005-01/006-01/007-01）
- deprecated：2个（FN-TNT-PC-003/CONFIG-SHP-010）
- 新增BR：5个（036-040）
- 新增ENT：2个（006A/006B）

---

## [v3.1.27] — 2026-08-09 ✅ Tenant Project Manage & Logo Upload

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.27

### Changed（租户后台项目列表去首页配置 + 项目管理logo上传）

#### 项目列表（ProjectManage.vue）
1. **操作列删除"首页配置"按钮**
   - 移除 `goConfig(row)` 函数（原跳转 `/tenant/projects/:id/home-config`，路由表中无此路由，实为404入口清理）
   - 操作列宽度由 240px 收窄为 180px
   - 保留按钮：门店管理 / 编辑 / 删除

#### 项目管理（ProjectProfileManage.vue）
2. **项目LOGO由URL输入框改为图片上传组件**
   - 引入 `el-upload` + `Plus` 图标（@element-plus/icons-vue）
   - 上传区域：80×80px 虚线框，未上传显示 `+` 图标 + "上传LOGO" 文字；已上传显示预览图
   - `onLogoChange`：使用 `FileReader` 转 base64 写入 `form.logo`，大小 ≤ 2MB 校验（超出提示警告）
   - 支持 `image/png,image/jpeg,image/jpg` 格式
   - 移除原 URL 输入框 + 64px 预览图样式
   - 新增提示文案："建议尺寸 200×200px，支持 JPG/PNG，大小 ≤ 2MB"

### Files Changed
- `src/pages/tenant-app/ProjectManage.vue` — 删除"首页配置"按钮+goConfig函数+操作列宽度240→180
- `src/pages/tenant-app/ProjectProfileManage.vue` — LOGO改为el-upload图片上传组件+Plus图标+onLogoChange+新样式

### Docs Changed
- `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` — version v3.1.26→v3.1.27，新增变更记录
- `docs/03-design/v3.1.3/APP端电商域/app/design-map.json` — version v3.1.26→v3.1.27
- `CHANGELOG.md` — 新增 [v3.1.27] 记录

---

## [v3.1.16] — 2026-08-08 ✅ Project Pages Optimization 2

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.16

### Changed（项目维度页面优化2）

#### 项目首页
1. **顶部项目名称和logo信息全部去掉**（ProjectFrame.vue）
   - 导航栏简化为仅返回按钮（删除 nav-title 和 nav-actions）
   - 删除 project-info 卡片（logo+名称+宣传语+门店数+商品数）
   - 删除相关 computed（project/productCount/projectCoverGradient/logoText/formatCount/isHomeTab）和样式
2. **热门直播"更多"跳转商城页直播tab**（ProjectHome.vue）
   - `goLiveDetail` → `router.push(/mall?tab=live)`
3. **为你推荐"更多"跳转商城页商品tab**（ProjectHome.vue）
   - `router.push(/mall)` → `router.push(/mall?tab=product)`

#### 项目商城页
4. **顶部Tab和搜索框置顶不随页面滑动**（ProjectMall.vue）
   - 新增 `.pm-top-fixed` sticky 容器，包裹Tab+搜索框
   - 搜索框样式改为浅灰背景（#f5f5f5）
5. **支持路由query.tab初始化**（ProjectMall.vue）
   - `tab` 初始值从 `route.query.tab` 读取（'live' 或 'product'）

#### 项目门店页
6. **搜索框置顶不随页面滑动**（ProjectStores.vue）
   - 新增 `.sp-top-fixed` sticky 容器
7. **搜索去掉按地址搜索**（ProjectStores.vue）
   - placeholder 改为"搜索门店名称..."，过滤逻辑只匹配 `s.name`
8. **StoreCard去掉顶部大图标封面**（StoreCard.vue）
   - 删除 `.sc-img-box`、`.sc-emoji`、`.sc-product-count`
9. **StoreCard名称旁显示小logo**（StoreCard.vue）
   - 保留 40px `.sc-logo-box`，显示门店名首字
10. **StoreCard去掉门店评分**（StoreCard.vue）
    - 删除 `.sc-rating`、`rating` computed
11. **StoreCard增加联系人+电话+拨打电话按钮**（StoreCard.vue）
    - 新增 `.sc-contact` 区域：联系人(contact_name) + 电话(phone) + 拨打电话按钮(tel:链接)

#### 数据模型
12. **Store实体新增contact_name字段**（ENT-PROJECT-002 更新）
    - `StoreSchema` 新增 `contact_name: z.string().optional()`
    - mock数据10个门店补充 contact_name 值（王经理/李店长/张负责人/赵经理等）

### Files Changed
- `src/components/app/layout/ProjectFrame.vue` — 导航栏简化+删除project-info
- `src/pages/app/project/ProjectHome.vue` — 更多跳转改为带tab参数
- `src/pages/app/project/ProjectMall.vue` — 顶部固定区sticky+query.tab初始化
- `src/pages/app/project/ProjectStores.vue` — 搜索框置顶+只搜门店名称
- `src/components/app/store/StoreCard.vue` — 去大图标+去评分+加联系人电话拨打
- `src/contracts/schemas/project-schemas.ts` — StoreSchema 新增 contact_name
- `src/stores/project-store.ts` — mock数据门店补充 contact_name
- PRD: `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` (v3.1.15→v3.1.16)

---

## [v3.1.15] — 2026-08-08 ✅ Project Pages Optimization

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.15

### Changed（项目维度页面优化）

#### 项目首页（ProjectHome.vue + ProjectFrame.vue）
1. **顶部项目名称居中**：`nav-title` 改为绝对定位 `left:50%` 居中
2. **去掉搜索入口**：删除 `.search-bar` 及搜索结果区、搜索相关 script 和样式
3. **推荐商品区域对齐**：`.product-grid-2col` 去掉灰色背景，padding 统一为 `4px 12px 14px`

#### 项目商城页（ProjectMall.vue 完全重写）
4. **去掉项目信息卡片**：ProjectFrame 的 `.project-info` 仅首页Tab显示（`isHomeTab` computed）
5. **商品/直播双Tab**：顶部 `pm-tabs` 切换商品/直播
6. **商品Tab**：当前页内搜索只搜商品 + 左侧营销分类导航(`pm-cat-sidebar` 88px) + 右侧商品列表(外卖平台风格)
7. **直播Tab**：当前页内搜索只搜直播 + 直播状态筛选(全部/直播中/预告/回放/已结束) + 直播双列网格

#### 项目门店页（ProjectStores.vue 重写 + StoreCard.vue 增强）
8. **去掉项目信息卡片**：同商城页，Frame 的 project-info 仅首页显示
9. **门店搜索**：改为当前页内搜索门店（按名称/地址），不跳转平台搜索页
10. **门店列表推荐直播**：StoreCard 新增 `.sc-lives` 区域，展示该门店前2个直播（标题+状态标签，按状态着色）

#### 租户后台（ProjectHomeConfig.vue 增强）
11. **推荐商品管理**：从手动输入ID改为列表选择器弹窗（搜索+多选+已选不显示）+ 批量删除
12. **直播推荐管理**：同上，列表选择器弹窗 + 批量删除
13. **Banner/金刚区管理**：已有功能保留

#### Store 层
14. **新增 `livesByStore`**：`project-store.ts` 新增计算属性，按 store_id 查询门店下直播

### Files Changed
- `src/components/app/layout/ProjectFrame.vue` — 导航栏标题居中 + project-info 仅首页Tab显示
- `src/pages/app/project/ProjectHome.vue` — 去掉搜索入口 + 推荐商品对齐
- `src/pages/app/project/ProjectMall.vue` — 完全重写：商品/直播双Tab + 分类布局 + 状态筛选
- `src/pages/app/project/ProjectStores.vue` — 重写：当前页内搜索门店
- `src/components/app/store/StoreCard.vue` — 增加推荐直播展示
- `src/stores/project-store.ts` — 新增 `livesByStore` 计算属性
- `src/pages/tenant-app/ProjectHomeConfig.vue` — 推荐商品/直播改为列表选择器弹窗 + 批量删除
- PRD: `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` (v3.1.14→v3.1.15)

---

## [v3.1.14] — 2026-08-08 ✅ Project Home Layout Optimization

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.14

### Changed（项目首页布局优化7项）

1. **顶部导航栏简化**（ProjectFrame.vue）
   - 只保留项目名称，去掉搜索和分享按钮
   - `nav-actions` 清空，保留返回按钮和标题

2. **项目信息区保留**（ProjectFrame.vue）
   - 保持 logo + 名称 + 宣传语 + 门店数 + 商品数 展示

3. **项目Tab导航移到底部固定**（ProjectFrame.vue）
   - 原 `.project-tabs` 顶部 sticky 导航改为 `.project-tabbar` 底部固定导航
   - 每个Tab增加图标（🏠首页/🛍️商城/🏪门店/👤会员）
   - 内容区上移独占中间区域

4. **ProjectHome去掉重复LOGO栏**（ProjectHome.vue）
   - 删除 `.project-logo-bar`（logo+名称已在Frame信息区显示，避免重复）
   - 删除对应样式 `.project-logo-bar` / `.pl-logo` / `.pl-logo-placeholder` / `.pl-name`

5. **搜索框保留不变**（ProjectHome.vue）
   - 当前页内搜索（BR-SHP-029）逻辑和样式不变

6. **金刚区保留**（ProjectHome.vue）
   - `.quick-zone` 从 ProjectHomeConfig.quick_entries 读取，逻辑不变

7. **Banner与金刚区调换位置**（ProjectHome.vue）
   - 原顺序：金刚区 → Banner
   - 新顺序：Banner → 金刚区
   - `.safe-bottom` 高度从 24px 调整为 60px，为底部固定导航留出空间

### Files Changed
- `src/components/app/layout/ProjectFrame.vue` — 导航栏简化 + Tab导航移至底部固定 + 图标
- `src/pages/app/project/ProjectHome.vue` — 去掉重复LOGO栏 + Banner与金刚区调换 + 底部安全区调整
- PRD: `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` (v3.1.13→v3.1.14)

---

## [v3.1.13] — 2026-08-08 ✅ Mall Page Filter Enhancement

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.13

### Changed（商城页三Tab筛选功能增强）

1. **精选商品页增加按商品类目筛选**（FN-SHP-APP-002 增强）
   - 精选商品Tab新增类目筛选条（全部类目 + 各商品类目），从精选商品数据动态提取
   - 筛选后重新计算分页，重置到第1页

2. **精选直播页增加按直播状态筛选**（FN-SHP-APP-002 增强）
   - 精选直播Tab新增状态筛选条（全部状态/直播中/预告/回放/已结束）
   - 筛选后重新计算分页，重置到第1页

3. **项目列表筛选改为按行业筛选**（FN-SHP-APP-002 调整）
   - 原 `filterCategory`（daily/health 品类筛选）替换为 `filterIndustry`（行业筛选）
   - 行业选项从项目数据动态提取，不再硬编码
   - `Project` 实体新增 `industry` 字段（ENT-PROJECT-001）

4. **Project 实体新增 industry 字段**（ENT-PROJECT-001 更新）
   - 枚举：`daily_necessities`(日用品) / `health_products`(保健品) / `food_beverage`(食品饮料) / `home_appliance`(家居家电) / `beauty_care`(美妆个护)
   - `industry` 为 optional 字段，旧数据自动兼容

### Files Changed
- `src/contracts/schemas/project-schemas.ts` — 新增 `ProjectIndustryEnum`；`ProjectSchema` 新增 `industry` 字段
- `src/stores/project-store.ts` — Mock 数据 projects 补充 industry 值
- `src/pages/app/mall/MallPage.vue` — 项目列表改按行业筛选 + 精选商品加类目筛选 + 精选直播加状态筛选 + 分页联动筛选
- PRD: `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` (v3.1.12→v3.1.13)

---

## [v3.1.12] — 2026-08-08 ✅ Pagination + Mall Tab + Live Status Sync

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.12

### Changed

1. **后台管理列表分页统一**（3个页面）
   - `SearchManage.vue` 热搜词管理列表：增加 el-pagination（每页10条）
   - `SearchManage.vue` 自定义搜索结果列表：增加 el-pagination（每页10条）
   - `AdManage.vue` 广告位管理列表：增加 el-pagination（每页10条）

2. **APP商城页Tab导航优化**（FN-SHP-APP-002 调整）
   - 去掉顶部搜索入口（`mp-search-bar`），搜索功能保留在首页
   - Tab导航重点突出：粘性定位（sticky top:0）、字号加大、加粗、下划线指示器加宽
   - 移除未使用的 `goSearch` 函数

3. **直播状态同步修复**（LiveCard 组件）
   - 原问题：LiveCard 组件中 `lc-badge-text` 写死"直播中"
   - 修复：根据 `live.status` 动态显示状态文本（直播中/预告/回放/已结束）
   - 标签颜色按状态区分：live=红色、upcoming=橙色、replay=深灰、ended=浅灰

### Files Changed
- `src/pages/admin-app/SearchManage.vue` — 热搜词列表 + 自定义搜索结果列表分页
- `src/pages/admin-app/AdManage.vue` — 广告位管理列表分页
- `src/pages/app/mall/MallPage.vue` — 去掉搜索栏 + Tab样式优化 + 移除 goSearch
- `src/components/app/live/LiveCard.vue` — 直播状态动态显示（文本+颜色+动画）
- PRD: `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` (v3.1.11→v3.1.12)

---

## [v3.1.11] — 2026-08-08 ✅ Recommend Manage UX Optimization

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.11

### Changed（推荐管理体验优化3项）

1. **手动推荐列表新增多选一键批量删除**（BR-SHP-030 补充）
   - `LiveRecommendManage.vue` / `ProductRecommendManage.vue` 手动推荐表格新增 selection 列
   - 工具栏新增"批量删除"按钮，显示已选数量，点击后二次确认删除

2. **默认推荐规则叠加排序顺序新增排序逻辑说明面板**
   - 在"叠加排序顺序"区域下方新增说明面板，含操作者说明和开发人员说明
   - 解释多维度叠加排序规则（等价 SQL ORDER BY 多级排序）、各维度比较方式、叠加排序示例

3. **验证 APP 端首页 + 精选页面与运营后台配置的实时联动效果**
   - 确认通过 Pinia store + localStorage 持久化 + Vue computed 响应式更新机制
   - 运营后台配置推荐规则/手动推荐后，APP 端首页推荐区和商城页精选商品/直播Tab自动刷新

### Files Changed
- `src/pages/admin-app/LiveRecommendManage.vue` — 手动推荐列表新增多选批量删除 + 排序逻辑说明面板
- `src/pages/admin-app/ProductRecommendManage.vue` — 同上
- PRD: `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` (v3.1.10→v3.1.11)

### Business Rules
- BR-SHP-030 补充修订（手动推荐支持多选一键批量删除）

---

## [v3.1.10] — 2026-08-08 ✅ Recommendation Rule Multi-Dimension Refactor

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.10

### Changed（推荐规则多维度排序链重构）

1. **推荐规则结构重构**（BR-SHP-008/009/030 修订）
   - `RecommendRule` 由单规则重构为多维度排序链 `{ sort_dimensions: SortDimension[] }`
   - `SortDimension`: `{ dim_type, direction, selected_values[] }`，按数组顺序叠加排序（ORDER BY 语义）
   - 维度语义为排序优先级（选中值排前，未选排后，非筛选），多选维度值支持拖拽排序优先级
   - 维度间支持上移/下移调整叠加排序顺序
   - 移除 `limit` 参数，无条数限制，排序所有可见项

2. **直播推荐维度**（BR-SHP-008 修订）
   - 新增维度：按项目（多选）、按主播类型（多选）
   - 保留维度：按直播状态（固定优先级 live>upcoming>replay>ended）、按观看人数（连续升降序）
   - `LiveRoom` 实体新增 `anchor_type` 字段（ENT-PROJECT-004，BR-SHP-035 新增）

3. **商品推荐维度**（BR-SHP-009 修订）
   - 新增维度：按项目（多选）
   - 保留维度：按商品类目（多选）、按销量（连续升降序）、按上架时间（连续升降序）

4. **首页展示条数控制**（BR-SHP-034 新增）
   - `RecommendItem` 新增 `display_limit` 字段（默认6），控制首页推荐区展示条数
   - 精选Tab不受此限制（显示全部可见商品/直播 + 加载更多分页）

5. **数据迁移**
   - 旧版 `rule_type + params` 自动迁移为 `sort_dimensions[]`
   - `liveRooms` 缺 `anchor_type` 字段自动补默认值 `personal`

### Files Changed
- `src/contracts/schemas/project-schemas.ts` — 新增 `AnchorTypeEnum`；`LiveRoomSchema` 新增 `anchor_type` 字段
- `src/stores/app-config-store.ts` — 新增 `SortDimension` 接口；`RecommendRule` 重构；`RecommendItem` 新增 `display_limit`；排序工具函数
- `src/stores/project-store.ts` — Mock `liveRooms` 补充 `anchor_type` 值；旧数据迁移
- `src/pages/admin-app/LiveRecommendManage.vue` — 完全重写（开关式维度启用 + 多选值拖拽排序 + 排序链顺序调整 + 预览逻辑）
- `src/pages/admin-app/ProductRecommendManage.vue` — 完全重写（同上，商品维度）
- `src/pages/app/home/PlatformHome.vue` — 推荐逻辑改用多维度排序链 + `display_limit` 截取
- `src/pages/app/mall/MallPage.vue` — 精选商品/直播改用多维度排序链（无上限）
- PRD: `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` (v3.1.9→v3.1.10)

### Business Rules
- BR-SHP-008 修订（直播推荐规则：单规则→多维度排序链）
- BR-SHP-009 修订（商品推荐规则：单规则→多维度排序链）
- BR-SHP-030 修订（叠加模式：多维度排序链 + 拖拽排序 + 维度链顺序）
- BR-SHP-034 新增（首页推荐区 display_limit 截取，精选Tab不受限）
- BR-SHP-035 新增（主播类型枚举：总部/门店/供应商/个人）

---

## [v3.1.5] — 2026-08-08 ✅ Requirement Adjustments

**需求流**: STR-SAAS-002 | **阶段**: 需求调整 | **PRD版本**: v3.1.5

### Changed（需求调整3项）

1. **个人中心移除平台会员等级**（BR-SHP-028新增）
   - 会员等级仅在项目维度各项目独立存在，平台无独立会员等级体系
   - `PlatformMine.vue` 用户信息卡移除"会员等级: 黄金"展示
   - `PlatformMember.vue` 移除"会员卡"区块，仅保留平台级资产汇总+项目会员入口

2. **个人中心新增"工作台"入口**（BR-SHP-018更新为8模块）
   - `PlatformMine.vue` 菜单列表新增"🛠️ 工作台"入口（首位）

3. **项目首页搜索改为当前页面内搜索**（BR-SHP-029新增）
   - `ProjectHome.vue` 搜索栏由点击跳转平台搜索页改为当前页内搜索
   - 搜索范围限当前项目内的商品和直播

### Files Changed
- PRD: `docs/01-requirements/17-APP端电商域-PRD-v3.1.0.md` (v3.1.4→v3.1.5)
- `src/pages/app/mine/PlatformMine.vue` — 移除会员等级+新增工作台入口
- `src/pages/app/mine/PlatformMember.vue` — 移除会员卡区块
- `src/pages/app/project/ProjectHome.vue` — 搜索改为当前页内搜索

---

## [v3.1.4] — 2026-08-08 ✅ Design Phase Complete

**需求流**: STR-SAAS-002 | **阶段**: 设计阶段 | **design_flow**: V3.5.0 | **产出**: 设计交互文档+design-map.json

### Added（设计阶段产出）
- **设计交互文档**：`docs/03-design/v3.1.3/APP端电商域/app/SAAS-APP-APP端电商域-交互文档-v3.1.3.md`（12章完整结构）
- **设计索引文件**：`docs/03-design/v3.1.3/APP端电商域/app/design-map.json`（全局设计索引）

### 设计流程（9步：7步法 + 联合评审 + 反向匹配）
1. Step1 系统分析；2. Step2 信息结构；3. Step3 设计系统；4. Step4 交互一致性
5. Step5 关键页面布局+草图；6. Step6 逐页面交互说明；7. Step7 输出交互文档+design-map.json
8. Step8 联合评审（3维度全部通过）；9. Step9 设计→需求反向匹配（五维闭环全部PASS）

### PM红线校验（C-D1~C-D10 全部通过 ✅）

| 红线 | 名称 | 结果 |
| C-D1 | 信息结构完整性 | ✅ 通过 |
| C-D2 | 组件树+布局 | ✅ 通过 |
| C-D3 | 交互卡五段 | ✅ 通过 |
| C-D4 | 多端归属显式 | ✅ 通过 |
| C-D5 | Design Tokens完整性 | ✅ 通过 |
| C-D6 | 交互一致性检查清单 | ✅ 通过 |
| C-D7 | 页面草图完整性 | ✅ 通过 |
| C-D8 | UI编号+交互跳转矩阵 | ✅ 通过 |
| C-D9 | 联合评审通过 | ✅ 通过 |
| C-D10 | 设计→需求反向匹配 | ✅ 通过 |
