/**
 * 项目域 — Zod实体Schema（三层契约 Layer 1）
 *
 * 层级模型：平台 → 租户（概念层）→ 项目（独立销售单元）→ 门店（提货点/独立销售点）
 * 用途：运行时数据校验 + TypeScript类型推导 + Mock数据生成参考
 *
 * Mock数据范围：电商类（日用百货 + 常规保健品），禁止慢病类数据
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 项目品类：日用百货 / 常规保健品 */
export const ProjectCategoryEnum = z.enum(['daily', 'health']);
export type ProjectCategory = z.infer<typeof ProjectCategoryEnum>;

/** 门店类型：提货点 / 独立销售点 / 两者兼备 */
export const StoreTypeEnum = z.enum(['pickup', 'sales', 'both']);
export type StoreType = z.infer<typeof StoreTypeEnum>;

/** 会员等级 */
export const MemberLevelEnum = z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']);
export type MemberLevel = z.infer<typeof MemberLevelEnum>;

/** 直播状态 */
export const LiveStatusEnum = z.enum(['live', 'replay', 'ended', 'upcoming']);
export type LiveStatus = z.infer<typeof LiveStatusEnum>;

/** 商品状态 */
export const ProductStatusEnum = z.enum(['on_sale', 'sold_out', 'pre_sale']);
export type ProductStatus = z.infer<typeof ProductStatusEnum>;

// ============================================
// ENT-PROJECT-001: 项目（独立销售单元）
// ============================================

export const ProjectSchema = z.object({
  project_id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  logo: z.string().url().optional(),
  category: ProjectCategoryEnum,
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
  tags: z.array(z.string()).default([]),
  status: ProductStatusEnum.default('on_sale'),
  description: z.string().optional(),
  created_at: z.string().datetime(),
});
export type Product = z.infer<typeof ProductSchema>;

// ============================================
// ENT-PROJECT-004: 直播
// ============================================

export const LiveRoomSchema = z.object({
  live_id: z.string(),
  project_id: z.string(),
  store_id: z.string().optional(),
  title: z.string(),
  cover_image: z.string().url().optional(),
  anchor_name: z.string(),
  viewer_count: z.number().int().min(0).default(0),
  status: LiveStatusEnum,
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  replay_url: z.string().url().optional(),
  product_ids: z.array(z.string()).default([]),
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
// ENT-PROJECT-006: 用户会员关系（项目维度）
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
});
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

// ============================================
// ENT-PROJECT-007: 项目首页配置（配置式装修）
// ============================================

export const ProjectHomeConfigSchema = z.object({
  config_id: z.string(),
  project_id: z.string(),
  banner_images: z.array(z.object({
    id: z.string(),
    image: z.string().url(),
    link: z.string().optional(),
    sort: z.number().int().default(0),
  })).default([]),
  quick_entries: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    link: z.string().optional(),
    sort: z.number().int().default(0),
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
