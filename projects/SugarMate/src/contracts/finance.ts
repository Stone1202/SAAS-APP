/**
 * SugarMate PC 后台 财务管理 契约模型
 */
import { z } from 'zod';

export const SettlementStatusEnum = z.enum(['PENDING', 'APPROVED', 'SETTLED', 'DISPUTED']);
export const SettlementSchema = z.object({
  id: z.string(),
  settle_no: z.string(),
  merchant_name: z.string(),
  merchant_id: z.string(),
  period: z.string(),
  order_count: z.number(),
  total_amount: z.number(),
  fee_amount: z.number(),
  settle_amount: z.number(),
  status: SettlementStatusEnum,
  settled_at: z.number().optional(),
  created_at: z.number(),
});
export type Settlement = z.infer<typeof SettlementSchema>;
