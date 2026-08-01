# ============================================
# SugarMate 模块边界定义 v1.0.0
# DDD限界上下文 + 依赖方向图
# ============================================
version: "1.0.0"
project: "SugarMate"
date: "2026-07-29"
owner: "Arch Agent"
reference: "PRD §14.12 微服务模块拆分方案"

---

## 一、模块总览

| # | 模块 | 缩写 | 核心职责 | 独立DB | 关联终端 |
|:-:|------|:----:|----------|:-----:|:------:|
| 1 | 用户中心 | user | 注册/登录/实名/档案/家属/会员/入驻身份 | user_db | ALL |
| 2 | 商品中心 | product | 商品管理/分类/库存/冷链/处方药/审批 | product_db | APP/MP/PC |
| 3 | 交易中心 | trade | 订单/购物车/支付/退款/售后/分账触发 | trade_db | APP/MP/PC |
| 4 | 处方中心 | prescription | 处方开具/CA签名/审核/流转/配药/GSP追溯 | rx_db | APP/PC |
| 5 | 营销中心 | marketing | 签到/积分/等级/权益/优惠券/活动 | mkt_db | APP/MP/PC |
| 6 | 内容中心 | content | 科普/直播/社区/评价/审核/回放 | cms_db | ALL |
| 7 | 运营中心 | operation | 入驻审核/商家管理/客服/风控/数据分析/易宝入网 | ops_db | PC |
| 8 | 通信中心 | communication | IM/消息推送/通知/企微集成 | msg_db | ALL |
| 9 | 冷链中心 | coldchain | 温度监控/异常告警/设备管理/轨迹追踪 | cold_db | APP/PC/IoT |
| 10 | 网关层 | gateway | API路由/鉴权/限流/日志/监控/统一推送 | 无状态 | ALL |

---

## 二、DDD限界上下文详细定义

### 2.1 用户中心（user_context）

**核心职责**：平台所有参与者的身份认证、账号管理、档案管理、角色绑定

**聚合根**：
- `Account`（账号——一个手机号→一个账号→N个身份）
- `Identity`（身份——患者/医生/营养师/HM/药剂师/药店管理员/平台运营）
- `HealthProfile`（健康档案——血糖记录/用药方案/过敏史/并发症）
- `FamilyBinding`（家属绑定——被监护人关系）
- `OnboardingApplication`（入驻申请——商家资质提交聚合）

**实体**：
- `DoctorProfile`（医生执业信息）
- `PharmacistProfile`（药剂师执业信息）
- `NutritionistProfile`（营养师资质信息）
- `HMProfile`（健康管理师资质信息）
- `PharmacyProfile`（药店经营信息）
- `AccountSession`（登录会话）

**值对象**：
- `Qualification`（资质证照·OCR识别结果）
- `CertificationStatus`（认证状态·待提交/审核中/已通过/已驳回/已过期）
- `Address`（地址信息）
- `ContactInfo`（联系方式）

**领域服务**：
- `IdentityRoutingService`（身份路由——根据当前活跃身份决定视图/权限/菜单）
- `OnboardingWorkflowService`（入驻流程编排——SM-01状态机）
- `CertificationVerificationService`（资质校验——OCR+第三方API验证）
- `FamilyAccessControlService`（家属访问控制）

**仓储接口**：
- `AccountRepository`（账号CRUD）
- `IdentityRepository`（身份CRUD·含角色切换）
- `HealthProfileRepository`（健康档案·含CGM历史数据引用）
- `OnboardingRepository`（入驻申请·含状态机流转）

**外部依赖**：
- 微信开放平台（UnionID·OAuth登录）
- OCR服务（资质证照识别）
- 药监局API（执业资格验证）
- 易宝支付（入网认证·§14.9）

**边界规则**：
- 禁止跨聚合根直查：Account不直接修改HealthProfile
- 身份切换通过领域事件`IdentitySwitched`通知其他模块
- 入驻状态变更通过事件`OnboardingStatusChanged`广播

---

### 2.2 商品中心（product_context）

**核心职责**：商品全生命周期管理——从商家上架到前端展示

**聚合根**：
- `Product`（商品·含SPU/SKU体系）
- `Category`（商品分类·树形结构）
- `Inventory`（库存·含冷链商品特有属性）

**实体**：
- `ProductReview`（商品审核记录）
- `ColdChainConfig`（冷链配置——温度范围/设备绑定）
- `ProductImage`（商品图片/视频）

**值对象**：
- `PriceRange`（价格区间）
- `ColdChainRequirement`（冷链要求——温度/湿度/时效）
- `DrugSpecification`（药品规格——处方药标记/批准文号/GSP编码）

**领域服务**：
- `ProductAuditService`（商品审核——SM-14状态机）
- `InventoryLockService`（库存预占——乐观锁+超时释放）
- `ColdChainEligibilityService`（冷链能力判定——药店能否配送冷链商品）

**仓储接口**：
- `ProductRepository`（商品CRUD·含多条件搜索）
- `InventoryRepository`（库存CRUD·含预占/释放）
- `CategoryRepository`（分类管理）

**外部依赖**：
- 药物相互作用引擎（处方药关联检查）
- OSS/CDN（商品图片存储）
- 冷链中心（冷链商品出库时触发温度追踪）

**边界规则**：
- 商品下架不影响已有订单——订单快照存储商品信息副本
- 冷链商品必须关联ColdChainConfig才能上架
- 处方药必须关联批准文号+GSP编码

---

### 2.3 交易中心（trade_context）

**核心职责**：订单生命周期管理——从下单到完成/退款

**聚合根**：
- `Order`（订单——主订单+子订单体系）
- `Cart`（购物车）
- `Refund`（退款/售后单）
- `Settlement`（结算单——T+N周期生成）

**实体**：
- `OrderItem`（订单子项）
- `PaymentRecord`（支付记录——含易宝/微信双通道）
- `ShipmentRecord`（物流记录——含冷链轨迹引用）
- `Dispute`（争议工单·§14.10.4）

**值对象**：
- `ShippingAddress`（收货地址）
- `PrescriptionReference`（处方引用——处方药订单必须关联处方）
- `ColdChainTrackingRef`（冷链追踪引用）
- `RevenueSharingRule`（分账规则——引用CONFIG配置）
- `OrderSnapshot`（订单快照——商品/价格/促销的创建时副本）

**领域服务**：
- `OrderStateMachineService`（订单状态流转——SM-05/06/07/15）
- `RevenueSharingService`（分账计算·引用CONFIG费率模板）
- `ShippingService`（物流调度——普通物流+冷链物流）
- `DisputeResolutionService`（争议处理·SLA计时+三级升级）

**仓储接口**：
- `OrderRepository`（订单CRUD·含多维度查询）
- `CartRepository`（购物车·含过期清理）
- `PaymentRepository`（支付记录）
- `RefundRepository`（退款/售后）
- `SettlementRepository`（结算单）

**外部依赖**：
- 易宝支付（收单+分账+退款+入网·§14.9）
- 微信支付（小程序备用通道）
- 处方中心（处方药订单必须验证处方有效性）
- 冷链中心（冷链订单必须绑定冷链追踪）
- 营销中心（积分发放/权益扣减/优惠券核销）
- 通信中心（订单状态变更通知）
- 运营中心（客服介入·争议处理）

**边界规则**：
- 支付双轨：易宝主通道+微信支付备用·通过配置切换
- 分账必须按CONFIG模板执行·禁止硬编码比例
- 冷链订单无有效ColdChainTrackingRef不可发货
- 处方药订单无有效PrescriptionReference不可支付
- 订单快照不可变——即使商品信息变更

---

### 2.4 处方中心（prescription_context）

**核心职责**：电子处方全生命周期——从开具到调配·符合GSP监管

**聚合根**：
- `Prescription`（电子处方——医生开具）
- `PrescriptionReview`（处方审核——药房审方）
- `PrescriptionDispensing`（处方调配——配药记录）

**实体**：
- `CASignature`（CA数字签名记录）
- `PrescriptionDrug`（处方药物明细·含剂量/用法/疗程）
- `DispensingRecord`（调配记录·GSP追溯）

**值对象**：
- `Diagnosis`（诊断信息·ICD-10编码）
- `DrugInteractionResult`（药物相互作用检查结果）
- `PrescriptionValidityPeriod`（处方有效期）

**领域服务**：
- `SignatureService`（CA签名——手写签名+数字证书）
- `DrugInteractionCheckService`（药物相互作用检查）
- `PrescriptionAuditService`（处方审核——药房端）
- `GSPTraceabilityService`（GSP追溯链·含温控记录）

**仓储接口**：
- `PrescriptionRepository`（处方CRUD·含状态流转）
- `ReviewRepository`（审核记录）
- `DispensingRepository`（调配记录）
- `SignatureRepository`（CA签名记录）

**外部依赖**：
- CA签名服务（数字签名合规）
- 药物相互作用引擎（实时检查）
- 国家药监局·ADR不良反应上报系统（安全合规）
- 交易中心（处方药订单必须关联处方）
- 冷链中心（处方调配的冷链追踪）

**边界规则**：
- 处方有效期过后自动失效·不可用于购药
- 处方必须有完整CA签名链才可流转到药房
- 调配记录必须保留≥5年（GSP要求）
- 药物相互作用检查为硬门禁·未通过不可开方

---

### 2.5 营销中心（marketing_context）

**核心职责**：用户运营——积分/等级/权益/优惠券/活动

**聚合根**：
- `MemberAccount`（会员账户——积分余额+等级）
- `Coupon`（优惠券·含领取/使用/过期）
- `Campaign`（营销活动）

**实体**：
- `PointTransaction`（积分流水·FIFO批次管理）
- `LevelHistory`（等级变更历史）
- `BenefitUsage`（权益使用记录）

**值对象**：
- `PointBatch`（积分批次·含过期时间·FIFO消费）
- `LevelThreshold`（等级门槛值）
- `CouponRule`（优惠券规则——满减/折扣/品牌/时间）

**领域服务**：
- `PointFIFOEngine`（积分FIFO消费引擎——Event Sourcing模式）
- `LevelEvaluationService`（等级评定——定时/事件触发）
- `CouponDispatchService`（优惠券发放——手动/自动/活动）

**仓储接口**：
- `MemberAccountRepository`
- `PointTransactionRepository`
- `CouponRepository`
- `CampaignRepository`

**外部依赖**：
- 交易中心（订单完成→积分发放+权益发放·事件驱动）
- 通信中心（权益到期提醒/活动推送）

**边界规则**：
- 积分FIFO消费严格按批次过期时间顺序
- 退款时已使用积分的回退策略（积分退还+批次恢复）
- 优惠券不可跨平台使用（仅APP/MP适用）

---

### 2.6 内容中心（content_context）

**核心职责**：内容生态——科普/社区/直播/评价

**聚合根**：
- `Article`（科普文章/视频）
- `Post`（社区帖子）
- `LiveSession`（直播场次）
- `Review`（评价/评分）

**实体**：
- `Comment`（评论/回复）
- `LiveReplay`（直播回放）
- `ContentAuditRecord`（内容审核记录）
- `Collection`（收藏夹）

**值对象**：
- `ContentTag`（内容标签——糖尿病饮食/运动/用药/并发症/心理/新技术）
- `AuditResult`（审核结果——通过/驳回·含原因）
- `LiveStatus`（直播状态——预约/进行/结束/违规下播）

**领域服务**：
- `ContentAuditPipeline`（内容审核流水线——编辑初审→医学审核→发布）
- `LiveSessionService`（直播管理——创建/推流/录制/回放）
- `RecommendationService`（内容推荐——个性化/热门/相关）

**仓储接口**：
- `ArticleRepository`
- `PostRepository`
- `LiveSessionRepository`
- `ReviewRepository`

**外部依赖**：
- 腾讯云直播（推拉流+IM弹幕+录制·§14.1）
- 通信中心（直播开播提醒推送）
- 运营中心（内容审核·风控拦截）

**边界规则**：
- 内容审核三级流水线：编辑初审(≤4h)→医学审核(≤8h)→发布
- 直播内容AI审核召回率≥95%
- 直播回放自动生成·保留≥30天
- 审核驳回必须附带具体原因和改进建议

---

### 2.7 运营中心（operation_context）

**核心职责**：平台运营管理——入驻审核/客服/风控/数据分析

**聚合根**：
- `OnboardingReview`（入驻审核——SM-02状态机）
- `Complaint`（投诉/纠纷工单）
- `RiskCase`（风控案例）

**实体**：
- `CSConversation`（客服会话——IM+工单）
- `DashboardMetric`（看板指标·预计算）
- `SystemConfig`（系统配置·全局参数/CONFIG）

**值对象**：
- `ReviewDecision`（审核决定——通过/驳回/补充·含原因）
- `RiskScore`（风控评分——多维度加权）
- `SLATimer`（SLA计时——入驻审核/售后/争议）

**领域服务**：
- `OnboardingReviewService`（入驻审核·三级审核+仲裁机制）
- `CSWorkflowService`（客服工单·分配/流转/SLA）
- `RiskDetectionService`（风控检测——刷单/虚假评价/资质造假）
- `AnalyticsService`（数据分析——看板/报表/导出）

**仓储接口**：
- `OnboardingReviewRepository`
- `ComplaintRepository`
- `RiskCaseRepository`
- `DashboardRepository`

**外部依赖**：
- 通信中心（审核结果通知·入驻SLA提醒）
- 易宝支付（入网认证回调）
- OCR服务（资质二次校验）
- 药监局API（资质验证）

**边界规则**：
- 入驻审核SLA：AI机审≤30s→人工4工作小时内→超时自动升级
- 审核被拒后支持申诉→独立复审→仲裁三级救济
- 风控标记的商家自动进入人工审核队列
- 看板数据按商家权限隔离·导出需二次验证

---

### 2.8 通信中心（communication_context）

**核心职责**：全域消息中枢——IM/推送/通知/邮件/短信

**聚合根**：
- `Conversation`（会话——问诊IM/客服IM）
- `Notification`（通知·多端已读同步）
- `MessageTemplate`（消息模板）

**实体**：
- `Message`（消息·含文本/图片/处方卡片/直播卡片）
- `PushRecord`（推送记录·APNs/FCM/微信订阅）
- `NotificationReadStatus`（通知已读状态·跨终端同步）

**值对象**：
- `PushTarget`（推送目标——设备token+平台）
- `TemplateVariables`（模板变量）

**领域服务**：
- `IMService`（IM消息路由——问诊/客服/直播弹幕）
- `NotificationRouter`（通知路由——终端选择+通道选择+降级策略）
- `PushDeliveryService`（推送投递——APNs/FCM/微信订阅+失败重试）
- `ReadStatusSyncService`（跨端已读同步）

**仓储接口**：
- `ConversationRepository`
- `MessageRepository`
- `NotificationRepository`
- `PushRecordRepository`

**外部依赖**：
- 腾讯云IM（WebSocket消息通道）
- APNs/FCM（APP推送）
- 微信订阅消息（小程序推送）
- 短信网关（验证码/紧急通知）

**边界规则**：
- 通知已读状态多端同步·30s内生效
- 推送失败3次重试→降级短信
- IM消息至少投递一次（at-least-once）
- 消息内容不可被通信中心解析（仅透传元数据）

---

### 2.9 冷链中心（coldchain_context）

**核心职责**：冷链药品温度监控+轨迹追踪·GSP合规

**聚合根**：
- `ColdChainShipment`（冷链包裹——关联订单+设备）
- `TemperatureLog`（温度日志——IoT设备上报）
- `ColdChainDevice`（冷链设备——温控箱/传感器）

**实体**：
- `TemperatureAlert`（温度异常告警）
- `ShipmentReplacement`（补发记录——最多2次）

**值对象**：
- `TemperatureReading`（温度读数·含时间戳+位置）
- `AlertThreshold`（告警阈值——高温/低温/湿度）
- `ColdChainRoute`（冷链路由——从出库到签收全轨迹）

**领域服务**：
- `TemperatureMonitorService`（温度监控——IoT数据流处理）
- `AlertEscalationService`（告警升级——超温→通知→补发→强制退款）
- `ColdChainTrackingService`（轨迹追踪——全程可视）

**仓储接口**：
- `ColdChainShipmentRepository`
- `TemperatureLogRepository`
- `ColdChainDeviceRepository`

**外部依赖**：
- 冷链IoT设备（MQTT温度上报）
- 腾讯地图（配送轨迹可视化）
- 通信中心（温度超限告警推送）
- 交易中心（补发触发/强制退款）

**边界规则**：
- 温度日志保留≥2年（GSP要求）
- 超温→15min内告警→药房30min内响应→超时自动补发
- 补发上限2次→超限强制退款+标记药房
- MQTT QoS=2（精确一次）

---

### 2.10 网关层（gateway_context）

**核心职责**：API统一入口——路由/鉴权/限流/日志/监控/推送

**无状态服务**：
- `APIRouter`（路由——按base path分发到各模块）
- `AuthGuard`（鉴权——JWT验证+角色权限[RBAC]）
- `RateLimiter`（限流——令牌桶/滑动窗口）
- `RequestLogger`（请求日志——审计追踪）
- `UnifiedPushGateway`（统一推送网关——协议适配·消息路由·离线存储·通道选择）
- `HealthChecker`（健康检查——各模块+外部依赖存活检测）

**路由规则**：
| Base Path | 路由到 | 鉴权要求 |
|-----------|:----:|--------|
| `/api/v1/user/*` | 用户中心 | Token + 用户角色 |
| `/api/v1/product/*` | 商品中心 | Token + 商家/平台角色 |
| `/api/v1/trade/*` | 交易中心 | Token + 多角色 |
| `/api/v1/rx/*` | 处方中心 | Token + 医生/药房/患者 |
| `/api/v1/mkt/*` | 营销中心 | Token + 平台/用户 |
| `/api/v1/cms/*` | 内容中心 | Token + 多角色 |
| `/api/v1/ops/*` | 运营中心 | Token + 平台管理员 |
| `/api/v1/comm/*` | 通信中心 | Token + 多角色 |
| `/api/v1/coldchain/*` | 冷链中心 | Token + 药房/平台 |
| `/ws/chat` | IM WebSocket | Token + 问诊/客服角色 |
| `/ws/cgm` | CGM WebSocket | Token + 患者/HM |
| `/ws/live` | 直播WebSocket | Token |

**边界规则**：
- 所有请求必须经过AuthGuard·无例外
- API调用必须记录审计日志·保留≥1年
- 敏感操作（资金/处方/入驻审核）追加二次验证
- WebSocket连接需token认证·断线自动重连

---

## 三、模块间依赖拓扑图

```
                    ┌─────────────────┐
                    │    gateway      │
                    │  (API统一入口)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
  │    user      │◄───┤   trade     │───►│   marketing  │
  │  (用户中心)  │    │  (交易中心)  │    │  (营销中心)  │
  └──────┬───────┘    └──┬────┬────┘    └─────────────┘
         │               │    │
         │          ┌─────┘    └─────┐
  ┌──────▼──────┐   │               │
  │ prescription│◄──┘               │
  │  (处方中心)  │                   │
  └──────┬───────┘                   │
         │                           │
  ┌──────▼──────┐             ┌──────▼──────┐
  │   product   │             │  coldchain   │
  │  (商品中心)  │             │  (冷链中心)  │
  └──────┬──────┘             └─────────────┘
         │
  ┌──────▼──────┐    ┌──────────────┐    ┌──────────────┐
  │   content   │    │  operation   │    │ communication│
  │  (内容中心)  │    │  (运营中心)  │    │  (通信中心)  │
  └─────────────┘    └──────────────┘    └──────────────┘
```

**依赖规则**：
1. **单向依赖**——模块间依赖必须单向·禁止循环依赖
2. **事件解耦**——跨模块通信优先使用领域事件（通过通信中心广播）
3. **契约隔离**——模块间只能通过公开API契约交互·禁止直查对方DB
4. **核心链路保护**——用户中心/交易中心为Tier 1·其他模块不得阻塞其可用性

---

## 四、模块间通信矩阵

| 生产者→消费者 | 通信方式 | 可靠性 | 关键事件 |
|:----------|:------:|:----:|----------|
| user→trade | 同步+事件 | 强 | 用户身份信息查询 / IdentityCreated |
| user→operation | 事件 | at-least-once | OnboardingSubmitted（入驻提交） |
| user→content | 事件 | at-least-once | IdentityCreated（创作者身份） |
| trade→marketing | 事件 | at-least-once | OrderPaid（积分发放）/ OrderCompleted（权益） |
| trade→coldchain | 事件 | at-least-once | ColdChainOrderCreated（冷链追踪启动） |
| trade→prescription | 同步 | 强 | 处方有效性验证（下单前） |
| trade→communication | 事件 | at-least-once | OrderStatusChanged（订单状态通知） |
| prescription→trade | 事件 | at-least-once | PrescriptionSigned（签名完成→处方订单） |
| prescription→communication | 事件 | at-least-once | PrescriptionReady（处方待审核通知） |
| product→trade | 同步 | 强 | 库存查询+预占/释放 |
| content→communication | 事件 | at-least-once | LiveStarted（直播开播提醒） |
| operation→communication | 事件 | at-least-once | OnboardingApproved（入驻通过通知） |
| operation→user | 同步 | 强 | 入驻状态回写 |
| coldchain→trade | 事件 | at-least-once | TemperatureAlert→补发/退款 |
| coldchain→communication | 事件 | at-least-once | TemperatureAlert（温度告警推送） |

---

## 五、循环依赖检测结果

✅ **当前设计无循环依赖**（所有依赖均为单向）

**特别注意防止的未来反模式**：
- ❌ user→trade→prescription→user（循环）
- ❌ content→trade→marketing→content（循环）
- ❌ operation→user→content→operation（循环）
