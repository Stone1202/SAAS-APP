/**
 * SugarMate 用户中心契约
 * 对应架构设计：API契约 §3 用户中心 API
 */
import { z } from 'zod';
import { ContactInfoSchema } from './common';

// === 账号 ===
export const AccountSchema = z.object({
  id: z.string(),
  phone: z.string(),
  wx_unionid: z.string().optional(),
  status: z.enum(['ACTIVE', 'FROZEN', 'CLOSED']),
  created_at: z.number(),
});

// === 身份（一个账号→N个身份） ===
export const IdentitySchema = z.object({
  id: z.string(),
  account_id: z.string(),
  role: z.enum(['PATIENT', 'DOCTOR', 'NUTRITIONIST', 'PH', 'OPS']),
  status: z.enum(['ACTIVE', 'PENDING_ONBOARDING', 'REVIEWING', 'REJECTED', 'SUSPENDED']),
  real_name: z.string(),
  avatar: z.string().optional(),
  merchant_id: z.string().optional(), // 关联商家ID（B端角色）
  created_at: z.number(),
});

// === 登录请求 ===
export const LoginRequest = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  sms_code: z.string().length(6).optional(),
  wx_code: z.string().optional(),
  platform: z.enum(['APP', 'MP', 'LIVE', 'PC']),
  device_id: z.string(),
});

// === 登录响应 ===
export const LoginResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(), // 秒
  temp_identities: z.array(
    z.object({
      identity_id: z.string(),
      role: z.string(),
      real_name: z.string(),
      avatar: z.string().optional(),
      status: z.string(),
    })
  ),
});

// === 身份激活请求 ===
export const ActivateIdentityRequest = z.object({
  identity_id: z.string(),
});

// === 身份激活响应 ===
export const ActivateIdentityResponse = z.object({
  identity_role: z.string(),
  view_menu: z.array(z.string()),
  permissions: z.array(z.string()),
  safe_session_token: z.string(),
});

// === 入驻申请 ===
export const OnboardingApplicationSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  merchant_type: z.enum(['PH', 'DR', 'PR', 'NT']),
  business_name: z.string().min(2),
  business_license_no: z.string().optional(),
  qualifications: z.array(
    z.object({
      type: z.string(),
      file_url: z.string(),
      ocr_result: z.record(z.any()).optional(),
      status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).default('PENDING'),
    })
  ),
  contact_info: ContactInfoSchema,
  payment_info: z
    .object({
      bank_account: z.string(),
      bank_name: z.string(),
      settlement_type: z.enum(['T1', 'D1']),
    })
    .optional(),
  status: z.enum(['DRAFT', 'PENDING', 'REVIEWING', 'SUPPLEMENT', 'APPROVED', 'REJECTED']),
  sla_deadline: z.number().optional(),
  reviewer_note: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number(),
});

// === 入驻审核 ===
export const OnboardingReviewRequest = z.object({
  application_id: z.string(),
  result: z.enum(['APPROVED', 'REJECTED', 'SUPPLEMENT']),
  reason: z.string(),
  reviewer: z.string(),
});

// === 健康档案 ===
export const HealthProfileSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  basic_info: z.object({
    gender: z.enum(['MALE', 'FEMALE']),
    birth_date: z.string(),
    height: z.number().optional(),
    weight: z.number().optional(),
    diabetes_type: z.enum(['TYPE1', 'TYPE2', 'GESTATIONAL']),
    diagnosis_date: z.string(),
  }),
  medical_history: z.array(
    z.object({
      condition: z.string(),
      date: z.string(),
      note: z.string().optional(),
    })
  ),
  allergies: z.array(z.string()),
  medications: z.array(
    z.object({
      drug_name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      start_date: z.string(),
      end_date: z.string().optional(),
    })
  ),
  complications: z.array(z.string()),
  updated_at: z.number(),
});

// === 家属绑定 ===
export const FamilyBindingSchema = z.object({
  id: z.string(),
  guardian_id: z.string(),
  patient_id: z.string(),
  relation: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'OTHER']),
  access_level: z.enum(['READ', 'ALERT_ONLY']),
  status: z.enum(['PENDING', 'ACTIVE', 'REJECTED']),
  created_at: z.number(),
});

// === 类型导出 ===
export type Account = z.infer<typeof AccountSchema>;
export type Identity = z.infer<typeof IdentitySchema>;
export type LoginRequest = z.infer<typeof LoginRequest>;
export type LoginResponse = z.infer<typeof LoginResponse>;
export type ActivateIdentityRequest = z.infer<typeof ActivateIdentityRequest>;
export type ActivateIdentityResponse = z.infer<typeof ActivateIdentityResponse>;
export type OnboardingApplication = z.infer<typeof OnboardingApplicationSchema>;
export type OnboardingReviewRequest = z.infer<typeof OnboardingReviewRequest>;
export type HealthProfile = z.infer<typeof HealthProfileSchema>;
export type FamilyBinding = z.infer<typeof FamilyBindingSchema>;
