/**
 * SugarMate PC 后台 商品管理 契约模型 V2.1.0
 * 扩充字段以匹配完整商品数据模型，支撑后台增删改查 + APP展示
 */
import { z } from 'zod';
import { ProductTypeEnum, ColdChainConfigSchema } from './trade';
import type { ProductType, ColdChainConfig } from './trade';

export { ProductTypeEnum, ColdChainConfigSchema };
export type { ProductType, ColdChainConfig };

// ============================================================
// 商品状态枚举（V2.2.0 新增 PENDING_REVIEW）
// ============================================================
export const ProductStatusEnum = z.enum([
  'DRAFT',            // 草稿
  'PENDING_REVIEW',   // 待审核（药店发布后、平台审核前）
  'ON_SHELF',         // 已上架（审核通过）
  'OFF_SHELF',        // 已下架
  'BANNED',           // 已封禁
]);

export type ProductStatus = z.infer<typeof ProductStatusEnum>;

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: '草稿',
  PENDING_REVIEW: '待审核',
  ON_SHELF: '已上架',
  OFF_SHELF: '已下架',
  BANNED: '已封禁',
};

export const PRODUCT_STATUS_COLOR: Record<ProductStatus, string> = {
  DRAFT: 'default',
  PENDING_REVIEW: 'orange',
  ON_SHELF: 'success',
  OFF_SHELF: 'default',
  BANNED: 'error',
};

export const ProductSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  price_override: z.number().optional(),
  stock: z.number().default(0),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  parent_id: z.string().nullable(),
  sort: z.number(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(), // category_id（兼容旧字段名）
  category_id: z.string(),
  category_name: z.string(),
  product_type: ProductTypeEnum,
  merchant_name: z.string(),
  merchant_id: z.string(),
  price: z.number(),
  market_price: z.number().default(0),
  stock: z.number(),
  rating: z.number().min(0).max(5).optional(),
  status: ProductStatusEnum,
  images: z.array(z.string()).default([]),
  image_url: z.string().optional(),
  description: z.string().optional(),
  is_otc: z.boolean().default(false),
  otc_license_no: z.string().optional(),
  specifications: z.array(ProductSpecSchema).default([]),
  cold_chain_config: ColdChainConfigSchema.optional(),
  sales_count: z.number().default(0),
  created_at: z.number(),
  updated_at: z.number(),
});
export type Product = z.infer<typeof ProductSchema>;
export type ProductSpec = z.infer<typeof ProductSpecSchema>;
export type Category = z.infer<typeof CategorySchema>;
