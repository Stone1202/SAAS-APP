/**
 * SugarMate PC 后台 入驻管理 契约模型
 *
 * ⚠️  DEPRECATED V3.0.0:
 * 入驻状态机和商家状态机已迁移至各自 Store：
 *   - 入驻 → onboardingStore.ts (12状态 ONBOARDING_TRANSITIONS)
 *   - 商家 → merchantStore.ts (12状态 STATUS_TRANSITIONS)
 * 本文件保留仅为结构参考，未被任何代码引用。
 */
import { z } from 'zod';

// V3.0.0: 对齐到实际12状态入驻机
export const ApplicationStatusEnum = z.enum([
  'DRAFT', 'PENDING', 'INFO_APPROVED', 'CERT_APPROVED',
  'NEED_SUPPLEMENT', 'REJECTED', 'APPROVED',
  'SIGNING', 'SIGNED', 'ONLINE', 'FROZEN', 'WITHDRAWN',
]);
export const MerchantTypeEnum = z.enum(['PHARMACY', 'DOCTOR', 'NUTRITIONIST', 'PHARMACIST']);
// V3.0.0: 对齐到实际12状态商家生命周期
export const MerchantStatusEnum = z.enum([
  'DRAFT', 'PENDING', 'INFO_APPROVED', 'CERT_APPROVED',
  'NEED_SUPPLEMENT', 'REJECTED', 'APPROVED',
  'SIGNING', 'SIGNED', 'ONLINE', 'FROZEN', 'WITHDRAWN',
]);

export const ApplicationSchema = z.object({
  id: z.string(),
  apply_no: z.string(),
  merchant_name: z.string(),
  type: MerchantTypeEnum,
  contact_name: z.string(),
  contact_phone: z.string(),
  status: ApplicationStatusEnum,
  submitted_at: z.number(),
  province: z.string().optional(),
  city: z.string().optional(),
  license_no: z.string().optional(),
  certificate_no: z.string().optional(),
  practice_no: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  business_scope: z.string().optional(),
  attachments_count: z.number(),
  approved_at: z.number().optional(),
  rejected_at: z.number().optional(),
  reject_reason: z.string().optional(),
  reviewer: z.string().optional(),
});

export const MerchantSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: MerchantTypeEnum,
  status: MerchantStatusEnum,
  contact_name: z.string(),
  contact_phone: z.string(),
  province: z.string(),
  city: z.string(),
  total_orders: z.number(),
  total_revenue: z.number(),
  joined_at: z.number(),
});

export type Application = z.infer<typeof ApplicationSchema>;
export type Merchant = z.infer<typeof MerchantSchema>;
