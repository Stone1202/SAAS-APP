/**
 * SugarMate PC 后台 运营管理 契约模型
 */
import { z } from 'zod';

export const BannerStatusEnum = z.enum(['ACTIVE', 'SCHEDULED', 'OFFLINE']);
export const BannerSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  schedule: z.string(),
  status: BannerStatusEnum,
  clicks: z.number(),
  sort: z.number(),
  jump_url: z.string().optional(),
  created_at: z.number(),
});
export const TicketPriorityEnum = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export const TicketStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export const TicketSchema = z.object({
  id: z.string(),
  ticket_no: z.string(),
  user_name: z.string(),
  category: z.string(),
  title: z.string(),
  priority: TicketPriorityEnum,
  status: TicketStatusEnum,
  assignee: z.string().optional(),
  created_at: z.number(),
});
export const ActivitySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['CAMPAIGN', 'PROMOTION', 'EVENT']),
  start_time: z.string(),
  end_time: z.string(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'ENDED']),
  created_at: z.number(),
});

export type Banner = z.infer<typeof BannerSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
