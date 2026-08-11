/**
 * APP展示域 — Zod实体Schema（三层契约 Layer 1）
 *
 * 用途：APP平台首页广告/金刚区/推荐等展示内容配置（配置式装修）
 * 后台：运营后台配置广告/金刚区/推荐，租户后台配置项目首页
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 广告位位置 */
export const AdPositionEnum = z.enum(['platform_home', 'mall_top', 'project_home']);
export type AdPosition = z.infer<typeof AdPositionEnum>;

/** 金刚区图标类型 */
export const KingKongLinkTypeEnum = z.enum(['project', 'store', 'page', 'url', 'category']);
export type KingKongLinkType = z.infer<typeof KingKongLinkTypeEnum>;

/** 推荐内容类型 */
export const RecommendTypeEnum = z.enum(['product', 'project', 'store', 'live', 'custom']);
export type RecommendType = z.infer<typeof RecommendTypeEnum>;

// ============================================
// ENT-APP-001: 广告轮播
// ============================================

export const AdBannerSchema = z.object({
  ad_id: z.string(),
  position: AdPositionEnum,
  title: z.string(),
  subtitle: z.string().optional(),
  image_url: z.string().default(''),
  image: z.string().url().optional(),
  link: z.string().optional(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  tag: z.string().optional(),
  sort_order: z.number().int().default(0),
  sort: z.number().int().default(0),
  status: z.enum(['enabled', 'disabled', 'active']).default('active'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  jump_type: z.string().optional(),
  jump_id: z.string().optional(),
  project_id: z.string().optional(),
  store_id: z.string().optional(),
  created_at: z.string().datetime().optional(),
  /** 最后修改人 */
  updated_by: z.string().optional(),
  /** 最后修改时间（ISO 8601） */
  updated_at: z.string().optional(),
});
export type AdBanner = z.infer<typeof AdBannerSchema>;

// ============================================
// ENT-APP-002: 金刚区（快捷入口）
// ============================================

export const KingKongEntrySchema = z.object({
  entry_id: z.string(),
  name: z.string().optional(),
  label: z.string().optional(),
  icon: z.string(),
  /** 跳转类型：product/project/live/function_page（v3.1.44: url废弃/function_page替代） */
  jump_type: z.enum(['product', 'project', 'live', 'url', 'function_page']).optional(),
  /** 跳转目标ID */
  jump_id: z.string().optional(),
  /** 兼容旧字段：link_type / link_value */
  link_type: KingKongLinkTypeEnum.optional(),
  link_value: z.string().optional(),
  link: z.string().optional(),
  project_id: z.string().optional(),
  gradient: z.string().optional(),
  sort: z.number().int().default(0),
  sort_order: z.number().int().default(0),
  status: z.enum(['enabled', 'disabled', 'active']).default('active'),
  created_at: z.string().datetime().optional(),
  /** 最后修改人 */
  updated_by: z.string().optional(),
  /** 最后修改时间（ISO 8601） */
  updated_at: z.string().optional(),
});
export type KingKongEntry = z.infer<typeof KingKongEntrySchema>;

// ============================================
// ENT-APP-003: 推荐内容
// ============================================

export const RecommendItemSchema = z.object({
  recommend_id: z.string(),
  type: RecommendTypeEnum,
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string().url().optional(),
  target_id: z.string(),
  sort: z.number().int().default(0),
  status: z.enum(['enabled', 'disabled']).default('enabled'),
  created_at: z.string().datetime(),
});
/**
 * 旧版推荐项类型（ENT-APP-003），已被 recommend-engine.ts 中的新版 RecommendItem 取代。
 * 保留 Schema 定义用于历史数据兼容，类型别名重命名为 LegacyRecommendItem 避免冲突。
 */
export type LegacyRecommendItem = z.infer<typeof RecommendItemSchema>;

// ============================================
// ENT-APP-004: ~~运营楼层~~（已移除，编号保留不重用）
// 楼层管理功能下线，v3.1.0移除
// ============================================

// ============================================
// ENT-APP-005: 精选内容（商城顶部切换）
// ============================================

export const FeaturedContentSchema = z.object({
  featured_id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string().url(),
  link: z.string().optional(),
  sort: z.number().int().default(0),
  status: z.enum(['enabled', 'disabled']).default('enabled'),
  created_at: z.string().datetime(),
});
export type FeaturedContent = z.infer<typeof FeaturedContentSchema>;

// ============================================
// ENT-APP-006: ~~FloorConfig~~（已移除，编号保留不重用）
// 楼层管理功能下线
// ============================================

// ============================================
// ENT-APP-007: APP用户（平台维度）
// ============================================

export const AppUserSchema = z.object({
  user_id: z.string(),
  nickname: z.string(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).default('unknown'),
  birthday: z.string().optional(),
  platform_points: z.number().int().min(0).default(0),
  coupon_count: z.number().int().min(0).default(0),
  order_count: z.number().int().min(0).default(0),
  balance: z.number().min(0).default(0),
  qualification_info: z.object({
    real_name_verified: z.boolean().default(false),
    id_card_verified: z.boolean().default(false),
    qualification_images: z.array(z.string().url()).default([]),
    qualification_status: z.enum(['none', 'pending', 'approved', 'rejected']).default('none'),
  }).optional(),
  created_at: z.string().datetime(),
});
export type AppUser = z.infer<typeof AppUserSchema>;

// ============================================
// ENT-APP-008: 消息通知
// ============================================

export const AppMessageSchema = z.object({
  message_id: z.string(),
  user_id: z.string(),
  type: z.enum(['order', 'promotion', 'system', 'project', 'live']),
  title: z.string(),
  content: z.string(),
  is_read: z.boolean().default(false),
  link: z.string().optional(),
  created_at: z.string().datetime(),
});
export type AppMessage = z.infer<typeof AppMessageSchema>;

// ============================================
// ENT-APP-010: 功能页面注册表（白名单）
// v3.1.44 新增
//
// 用途：系统管理员统一管理APP内可跳转的功能页面白名单，
//       替代原有的"自由输入URL"方式，确保跳转安全和一致性。
//
// 角色分工：
//   - 系统管理员：维护注册表（新增/编辑/禁用功能页面）
//   - 运营人员：在 Banner/金刚区/搜索配置中选择已注册的功能页面（无需输入路由）
//   - APP 用户点击后解析 page_id → 查询注册表 → 获得实际路由 → 执行跳转
//
// 分类说明：
//   - builtin:  内置系统页面（不可删除，仅可启用/禁用）
//   - business: 业务功能页面（可完整 CRUD）
//   - activity: 活动页面（可完整 CRUD）
//
// 安全边界：
//   - 不保留 external 分类（禁止外部链接跳转）
//   - app_route 必须为 APP 内部合法路由路径
//   - 旧 jump_type=url 数据全部废弃，不再支持
//
// 使用流程：
//   1. 系统管理员新增功能页面到注册表
//   2. 运营人员在 JumpTargetPicker 中选择"功能页面"→下拉选择对应页面
//   3. 含 :projectId 占位符的路由在运行时期根据上下文自动填充
//      - 租户后台：自动从 lockProjectId 填充
//      - 运营后台：通过项目选择器填写
// ============================================

/** 功能页面分类 */
export const FunctionPageCategoryEnum = z.enum([
  'builtin',    // 内置系统页面 — 不可删除，仅可启用/禁用
  'business',   // 业务功能页面 — 可完整 CRUD
  'activity',   // 活动页面 — 可完整 CRUD
]);
export type FunctionPageCategory = z.infer<typeof FunctionPageCategoryEnum>;

export const FunctionPageSchema = z.object({
  /** 唯一标识，如 "fp-mine" */
  page_id: z.string(),
  /** 分类：builtin(内置) / business(业务功能) / activity(活动页面) */
  category: FunctionPageCategoryEnum,
  /** 显示名称，如 "个人中心" */
  name: z.string(),
  /** 说明描述，如 "用户管理收货地址页面" */
  description: z.string().optional(),
  /** APP内路由路径，支持 query 参数，如 "/app/mall?tab=live" */
  /** 支持 :projectId 占位符（运行时动态替换），如 "/app/project/:projectId/member" */
  app_route: z.string(),
  /** 状态：active(启用) / disabled(禁用) */
  status: z.enum(['active', 'disabled']).default('active'),
  /** 排序值，数字越小越靠前 */
  sort_order: z.number().int().default(0),
  /** 最后修改人 */
  updated_by: z.string().optional(),
  /** 最后修改时间（ISO 8601） */
  updated_at: z.string().optional(),
});
export type FunctionPage = z.infer<typeof FunctionPageSchema>;

// ============================================
// ENT-APP-009: 收货地址（平台维度，跨项目共用）
// ============================================

export const ShippingAddressSchema = z.object({
  address_id: z.string(),
  user_id: z.string(),
  recipient_name: z.string(),
  phone: z.string(),
  province: z.string(),
  city: z.string(),
  district: z.string(),
  detail_address: z.string(),
  is_default: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
