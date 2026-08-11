/**
 * APP展示域 — Zod实体Schema（三层契约 Layer 1）
 *
 * 用途：APP平台首页广告/金刚区/推荐/楼层等展示内容配置（配置式装修）
 * 后台：运营后台配置广告/金刚区/推荐/楼层，租户后台配置项目首页
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

/** 楼层类型 */
export const FloorTypeEnum = z.enum(['banner', 'grid', 'product_list', 'live_list', 'rich_text', 'image']);
export type FloorType = z.infer<typeof FloorTypeEnum>;

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
  link_type: KingKongLinkTypeEnum.optional(),
  link_value: z.string().optional(),
  link: z.string().optional(),
  gradient: z.string().optional(),
  sort: z.number().int().default(0),
  sort_order: z.number().int().default(0),
  status: z.enum(['enabled', 'disabled', 'active']).default('active'),
  created_at: z.string().datetime().optional(),
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
export type RecommendItem = z.infer<typeof RecommendItemSchema>;

// ============================================
// ENT-APP-004: 运营楼层
// ============================================

export const FloorSchema = z.object({
  floor_id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  type: FloorTypeEnum,
  position: z.string().default('platform_home'),
  product_ids: z.array(z.string()).default([]),
  items: z.array(z.object({
    id: z.string(),
    image: z.string().url().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    link: z.string().optional(),
    target_id: z.string().optional(),
    sort: z.number().int().default(0),
  })).default([]),
  sort: z.number().int().default(0),
  sort_order: z.number().int().default(0),
  status: z.enum(['enabled', 'disabled', 'active']).default('active'),
  created_at: z.string().datetime().optional(),
});
export type Floor = z.infer<typeof FloorSchema>;

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
// ENT-APP-006: APP用户（平台维度）
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
  created_at: z.string().datetime(),
});
export type AppUser = z.infer<typeof AppUserSchema>;

// ============================================
// ENT-APP-007: 消息通知
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
