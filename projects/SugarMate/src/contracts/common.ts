/**
 * SugarMate 通用契约定义
 * 对应架构设计：API契约 §2 通用请求/响应Schema
 */
import { z } from 'zod';

// === 通用请求头 ===
export const CommonRequestHeaders = z.object({
  Authorization: z.string().optional(),
  'X-Request-Id': z.string(),
  'X-Timestamp': z.string(),
  'X-Nonce': z.string(),
  'X-Platform': z.enum(['APP', 'MP', 'LIVE', 'PC']),
  'X-Role-View': z.enum(['PATIENT', 'DOCTOR', 'NUTRITIONIST', 'PH', 'OPS']),
  'X-Device-Id': z.string(),
});

// === 分页参数 ===
export const PaginationParams = z.object({
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
});

export const PaginationMeta = z.object({
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  total_pages: z.number(),
});

// === 通用响应体 ===
export const CommonResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema.nullable(),
    request_id: z.string(),
    timestamp: z.number(),
    pagination: PaginationMeta.optional(),
  });

// === 业务状态码 ===
export const BizCode = {
  SUCCESS: 0,
  // 参数校验 (1000-1999)
  PARAM_INVALID: 1000,
  PARAM_MISSING: 1001,
  // 鉴权授权 (2000-2999)
  UNAUTHORIZED: 2000,
  TOKEN_EXPIRED: 2001,
  FORBIDDEN: 2003,
  // 业务逻辑 (3000-3999)
  ORDER_NOT_FOUND: 3000,
  PRESCRIPTION_EXPIRED: 3001,
  INSUFFICIENT_INVENTORY: 3002,
  REFUND_EXCEED_AMOUNT: 3003,
  ONBOARDING_DUPLICATE: 3100,
  ONBOARDING_STATUS_ERROR: 3101,
  // 外部服务 (4000-4999)
  YEEPAY_ERROR: 4000,
  OCR_ERROR: 4001,
  WECHAT_ERROR: 4002,
  CA_SIGN_ERROR: 4003,
  // 系统内部 (5000-5999)
  INTERNAL_ERROR: 5000,
  DB_ERROR: 5001,
} as const;

// === 通用类型 ===
export type PaginationParams = z.infer<typeof PaginationParams>;
export type PaginationMeta = z.infer<typeof PaginationMeta>;

// === 联系方式 ===
export const ContactInfoSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  email: z.string().email().optional(),
});

// === 地址 ===
export const AddressSchema = z.object({
  id: z.string().optional(),
  province: z.string(),
  city: z.string(),
  district: z.string(),
  detail: z.string(),
  contact_name: z.string(),
  contact_phone: z.string(),
  is_default: z.boolean().default(false),
});
