/**
 * SugarMate PC 后台 SCRM 客户管理 契约模型
 */
import { z } from 'zod';

export const CustomerTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  age: z.number().optional(),
  gender: z.enum(['M', 'F']).optional(),
  diabetes_type: z.string().optional(),
  diagnosis_duration: z.string().optional(),
  tags: z.array(z.string()),
  last_interaction: z.string(),
  source: z.string(),
  created_at: z.number(),
});

export const SopActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger_type: z.enum(['TIMING', 'EVENT']),
  trigger_config: z.record(z.unknown()),
  action_type: z.enum(['SEND_MSG', 'SEND_COUPON', 'ASSIGN_TAG']),
  action_config: z.record(z.unknown()),
});

export type CustomerTag = z.infer<typeof CustomerTagSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type SopAction = z.infer<typeof SopActionSchema>;
