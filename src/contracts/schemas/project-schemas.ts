/**
 * 项目域 — Zod实体Schema（三层契约 Layer 1）
 *
 * 层级模型：平台 → 租户（概念层）→ 项目（独立销售单元）→ 门店（提货点/独立销售点）
 * 用途：运行时数据校验 + TypeScript类型推导 + Mock数据生成参考
 *
 * Mock数据范围：电商类（日用百货 + 常规保健品），禁止慢病类数据
 *
 * v3.1.30 更新：
 * - ENT-PROJECT-004 LiveRoom 新增 visibility_config（直播可见范围权限）
 * - ENT-PROJECT-006 ProjectMember 新增 store_id（用户绑定的门店）/ inviter_id（邀请人）
 * - 新增 ENT-PROJECT-010 Inviter（邀请人/店长/店员）
 * - 新增 ENT-PROJECT-011 UserStoreBinding（用户门店绑定关系）
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 项目品类：日用百货 / 常规保健品 */
export const ProjectCategoryEnum = z.enum(['daily', 'health']);
export type ProjectCategory = z.infer<typeof ProjectCategoryEnum>;

/** 项目行业（用于商城页项目列表按行业筛选）：日用品 / 保健品 / 食品饮料 / 家居家电 / 美妆个护 */
export const ProjectIndustryEnum = z.enum(['daily_necessities', 'health_products', 'food_beverage', 'home_appliance', 'beauty_care']);
export type ProjectIndustry = z.infer<typeof ProjectIndustryEnum>;

/** 门店类型：提货点 / 独立销售点 / 两者兼备 */
export const StoreTypeEnum = z.enum(['pickup', 'sales', 'both']);
export type StoreType = z.infer<typeof StoreTypeEnum>;

/** 会员等级 */
export const MemberLevelEnum = z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']);
export type MemberLevel = z.infer<typeof MemberLevelEnum>;

/** 直播状态 */
export const LiveStatusEnum = z.enum(['live', 'replay', 'ended', 'upcoming']);
export type LiveStatus = z.infer<typeof LiveStatusEnum>;

/** 主播类型（BR-SHP-035）：总部主播 / 门店主播 / 供应商主播 / 个人主播 */
export const AnchorTypeEnum = z.enum(['headquarters', 'store', 'supplier', 'personal']);
export type AnchorType = z.infer<typeof AnchorTypeEnum>;

/** 商品状态 */
export const ProductStatusEnum = z.enum(['on_sale', 'sold_out', 'pre_sale']);
export type ProductStatus = z.infer<typeof ProductStatusEnum>;

/** 优惠券类型：满减 / 折扣 / 兑换 */
export const CouponTypeEnum = z.enum(['full_reduction', 'discount', 'exchange']);
export type CouponType = z.infer<typeof CouponTypeEnum>;

/** 优惠券状态：未使用 / 已使用 / 已过期 */
export const CouponStatusEnum = z.enum(['unused', 'used', 'expired']);
export type CouponStatus = z.infer<typeof CouponStatusEnum>;

// ============================================
// ENT-PROJECT-001: 项目（独立销售单元）
// ============================================

export const ProjectSchema = z.object({
  project_id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  logo: z.string().url().optional(),
  mall_name: z.string().optional(),
  category: ProjectCategoryEnum,
  industry: ProjectIndustryEnum.optional(),
  description: z.string(),
  store_count: z.number().int().min(0),
  member_count: z.number().int().min(0),
  sort: z.number().int().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
  created_at: z.string().datetime(),
});
export type Project = z.infer<typeof ProjectSchema>;

// ============================================
// ENT-PROJECT-002: 门店（提货点/独立销售点）
// ============================================

export const StoreSchema = z.object({
  store_id: z.string(),
  project_id: z.string(),
  name: z.string(),
  type: StoreTypeEnum,
  address: z.string(),
  business_hours: z.string(),
  phone: z.string().optional(),
  contact_name: z.string().optional(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  cover_image: z.string().url().optional(),
  distance: z.number().optional(),
  sort: z.number().int().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
  created_at: z.string().datetime(),
});
export type Store = z.infer<typeof StoreSchema>;

// ============================================
// ENT-PROJECT-003: 商品
// ============================================

export const ProductSchema = z.object({
  product_id: z.string(),
  project_id: z.string(),
  store_id: z.string().optional(),
  name: z.string(),
  cover_image: z.string().url().optional(),
  price: z.number().nonnegative(),
  original_price: z.number().nonnegative().optional(),
  sales: z.number().int().min(0).default(0),
  stock: z.number().int().min(0).default(0),
  category: z.string(),
  marketing_category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: ProductStatusEnum.default('on_sale'),
  description: z.string().optional(),
  created_at: z.string().datetime(),
});
export type Product = z.infer<typeof ProductSchema>;

// ============================================
// 直播可见范围配置（ENT-PROJECT-004 子结构，v3.1.30 新增）
// ============================================

/** 直播可见范围权限模式 */
export const LiveVisibilityModeEnum = z.enum(['public', 'exclude', 'include']);
export type LiveVisibilityMode = z.infer<typeof LiveVisibilityModeEnum>;

/** 直播可见范围配置 Schema */
export const LiveVisibilityConfigSchema = z.object({
  /** 权限模式：public=公开（默认全可见）/ exclude=排除指定ID / include=仅指定ID可见 */
  mode: LiveVisibilityModeEnum.default('public'),
  /** 排除的邀请人ID列表（mode=exclude 时有效，按 anchor_type 分发） */
  excluded_inviter_ids: z.array(z.string()).default([]),
  /** 指定可见的邀请人ID列表（mode=include 时有效，仅 personal 类型需要主动指定） */
  included_inviter_ids: z.array(z.string()).default([]),
  /** 排除的门店ID列表（headquarters 类型按门店排除） */
  excluded_store_ids: z.array(z.string()).default([]),
  /** 排除的项目ID列表（supplier 类型按项目排除） */
  excluded_project_ids: z.array(z.string()).default([]),
});
export type LiveVisibilityConfig = z.infer<typeof LiveVisibilityConfigSchema>;

// ============================================
// ENT-PROJECT-004: 直播（v3.1.30 新增 visibility_config）
// ============================================

export const LiveRoomSchema = z.object({
  live_id: z.string(),
  project_id: z.string(),
  store_id: z.string().optional(),
  title: z.string(),
  cover_image: z.string().url().optional(),
  anchor_name: z.string(),
  anchor_type: AnchorTypeEnum.default('personal'),
  viewer_count: z.number().int().min(0).default(0),
  status: LiveStatusEnum,
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  replay_url: z.string().url().optional(),
  product_ids: z.array(z.string()).default([]),
  /**
   * 直播可见范围配置（v3.1.30 新增）
   * 按 anchor_type 差异化默认行为：
   * - store 门店直播：默认该邀请人绑定的用户可见，可排除
   * - headquarters 总部直播：默认所有门店用户可见，可排除
   * - supplier 供应商直播：默认所有项目用户可见，可排除
   * - personal 个人直播：默认不对外，需主动指定可见范围
   * 注意：本期仅新增字段，配置管理功能在直播列表已有，本期不处理
   */
  visibility_config: LiveVisibilityConfigSchema.optional(),
});
export type LiveRoom = z.infer<typeof LiveRoomSchema>;

// ============================================
// ENT-PROJECT-005: 会员等级配置（项目维度）
// ============================================

export const MemberLevelConfigSchema = z.object({
  level_id: z.string(),
  project_id: z.string(),
  level: MemberLevelEnum,
  name: z.string(),
  points_threshold: z.number().int().min(0),
  discount: z.number().min(0).max(1).default(1),
  privileges: z.array(z.string()).default([]),
  icon: z.string().optional(),
  sort: z.number().int().default(0),
});
export type MemberLevelConfig = z.infer<typeof MemberLevelConfigSchema>;

// ============================================
// ENT-PROJECT-006: 用户会员关系（项目维度，v3.1.30 新增 store_id/inviter_id）
// ============================================

export const ProjectMemberSchema = z.object({
  member_id: z.string(),
  project_id: z.string(),
  user_id: z.string(),
  level: MemberLevelEnum,
  points: z.number().int().min(0).default(0),
  total_spent: z.number().min(0).default(0),
  joined_at: z.string().datetime(),
  current_level_points: z.number().int().min(0).default(0),
  next_level_points: z.number().int().min(0).optional(),
  coupons: z.array(z.string()).default([]),
  balance: z.number().min(0).default(0),
  /**
   * 用户在该项目绑定的门店ID（v3.1.30 新增，邀请制私域运营）
   * 一个项目下只能绑定1个门店
   */
  store_id: z.string().optional(),
  /**
   * 邀请人ID（v3.1.30 新增，指向 Inviter.inviter_id）
   * 用户由哪个店长/店员邀请加入该项目
   */
  inviter_id: z.string().optional(),
});
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

// ============================================
// ENT-PROJECT-006A: 优惠券（项目维度）
// ============================================

export const CouponSchema = z.object({
  coupon_id: z.string(),
  project_id: z.string(),
  user_id: z.string(),
  title: z.string(),
  type: CouponTypeEnum,
  status: CouponStatusEnum.default('unused'),
  amount: z.number().min(0).default(0),
  threshold: z.number().min(0).default(0),
  discount: z.number().min(0).max(1).optional(),
  valid_end: z.string(),
  tag: z.string().optional(),
  description: z.string().optional(),
});
export type Coupon = z.infer<typeof CouponSchema>;

// ============================================
// ENT-PROJECT-006B: 签到状态（项目维度）
// ============================================

export const SignInStateSchema = z.object({
  project_id: z.string(),
  user_id: z.string(),
  month_sign_days: z.number().int().min(0).default(0),
  week_signed: z.array(z.string()).default([]),
  last_sign_date: z.string().optional(),
  total_sign_days: z.number().int().min(0).default(0),
  week_start_date: z.string().optional(),
  week_rewards: z.array(z.number().int().min(0)).default([2, 2, 2, 5, 2, 5, 10]),
  continuous_reward: z.number().int().min(0).default(20),
});
export type SignInState = z.infer<typeof SignInStateSchema>;

// ============================================
// ENT-PROJECT-007: 项目首页配置（配置式装修）
// ============================================

export const ProjectHomeConfigSchema = z.object({
  config_id: z.string(),
  project_id: z.string(),
  banner_images: z.array(z.object({
    id: z.string(),
    image: z.string().url(),
    title: z.string().optional(),
    jump_type: z.string().optional(),
    jump_id: z.string().optional(),
    jump_target: z.string().optional(),
    project_id_ref: z.string().optional(),
    link: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    sort: z.number().int().default(0),
    sort_order: z.number().int().default(0),
    enabled: z.boolean().default(true),
    status: z.enum(['active', 'disabled']).optional(),
    updated_by: z.string().optional(),
    updated_at: z.string().optional(),
  })).default([]),
  quick_entries: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    jump_type: z.string().optional(),
    jump_id: z.string().optional(),
    jump_target: z.string().optional(),
    project_id_ref: z.string().optional(),
    link: z.string().optional(),
    sort: z.number().int().default(0),
    sort_order: z.number().int().default(0),
    enabled: z.boolean().default(true),
    status: z.enum(['active', 'disabled']).optional(),
    updated_by: z.string().optional(),
    updated_at: z.string().optional(),
  })).default([]),
  recommend_products: z.array(z.string()).default([]),
  live_recommend: z.array(z.string()).default([]),
  notice: z.string().optional(),
  updated_at: z.string().datetime(),
});
export type ProjectHomeConfig = z.infer<typeof ProjectHomeConfigSchema>;

// ============================================
// ENT-PROJECT-008: 租户（概念层）
// ============================================

export const TenantSchema = z.object({
  tenant_id: z.string(),
  name: z.string(),
  contact_phone: z.string().optional(),
  registered_at: z.string().datetime(),
  status: z.enum(['active', 'inactive']).default('active'),
});
export type Tenant = z.infer<typeof TenantSchema>;

// ============================================
// ENT-PROJECT-009: 营销分类（项目维度）
// ============================================

export const MarketingCategorySchema = z.object({
  category_id: z.string(),
  project_id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  sort_order: z.number().int().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
  created_at: z.string().datetime(),
});
export type MarketingCategory = z.infer<typeof MarketingCategorySchema>;

// ============================================
// 聚合类型
// ============================================

/** 项目详情（含门店列表） */
export const ProjectDetailSchema = ProjectSchema.extend({
  stores: z.array(StoreSchema).default([]),
  home_config: ProjectHomeConfigSchema.optional(),
});
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;

/** 门店详情（含商品列表） */
export const StoreDetailSchema = StoreSchema.extend({
  products: z.array(ProductSchema).default([]),
  live_rooms: z.array(LiveRoomSchema).default([]),
});
export type StoreDetail = z.infer<typeof StoreDetailSchema>;

// ============================================
// ENT-PROJECT-010: 邀请人/店长/店员（v3.1.30 新增）
// ============================================

/** 邀请人角色 */
export const InviterRoleEnum = z.enum(['manager', 'staff']);
export type InviterRole = z.infer<typeof InviterRoleEnum>;

/** 邀请人状态 */
export const InviterStatusEnum = z.enum(['active', 'inactive']);
export type InviterStatus = z.infer<typeof InviterStatusEnum>;

/**
 * 邀请人（店长/店员）
 * 邀请制私域运营核心实体：用户 → 邀请人 → 门店 → 项目
 * 一个邀请人绑定一个门店，用户通过邀请人加入门店所属项目
 */
export const InviterSchema = z.object({
  /** 邀请人ID */
  inviter_id: z.string(),
  /** 门店ID（邀请人所属门店，一个邀请人绑定一个门店） */
  store_id: z.string(),
  /** 项目ID（冗余字段，由 store_id 派生，方便查询） */
  project_id: z.string(),
  /** 邀请人姓名 */
  name: z.string(),
  /** 手机号 */
  phone: z.string().optional(),
  /** 角色：manager=店长 / staff=店员 */
  role: InviterRoleEnum.default('staff'),
  /** 状态 */
  status: InviterStatusEnum.default('active'),
  /** 已邀请用户数（冗余统计字段） */
  invited_count: z.number().int().min(0).default(0),
  /** 最后修改人 */
  updated_by: z.string().optional(),
  /** 最后修改时间（ISO 8601） */
  updated_at: z.string().optional(),
  /** 创建时间（ISO 8601） */
  created_at: z.string().datetime(),
});
export type Inviter = z.infer<typeof InviterSchema>;

// ============================================
// ENT-PROJECT-011: 用户门店绑定关系（v3.1.30 新增）
// ============================================

/**
 * 用户门店绑定关系
 * 记录用户通过哪个邀请人绑定了哪个门店
 * 一个用户在一个项目下只能绑定1个门店（通过 ProjectMember.store_id 体现）
 * 本表为独立关系表，便于按门店反查用户、按用户反查门店
 */
export const UserStoreBindingSchema = z.object({
  /** 绑定ID */
  binding_id: z.string(),
  /** 用户ID */
  user_id: z.string(),
  /** 门店ID */
  store_id: z.string(),
  /** 项目ID（冗余字段，由 store_id 派生） */
  project_id: z.string(),
  /** 邀请人ID（通过谁邀请绑定的） */
  inviter_id: z.string(),
  /** 绑定时间 */
  bound_at: z.string().datetime(),
});
export type UserStoreBinding = z.infer<typeof UserStoreBindingSchema>;
