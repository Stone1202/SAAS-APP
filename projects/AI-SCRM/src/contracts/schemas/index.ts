import { z } from 'zod';

// ============================================
// 客户 (Customer)
// ============================================
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(['线下推广', '线上推广', '转介绍', '其他']).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  avatar: z.string().optional(),
  industry: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateCustomerSchema = CustomerSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>;

// ============================================
// 标签 (Tag)
// ============================================
export const TagSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  groupId: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string(),
});

export const TagGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;
export type TagGroup = z.infer<typeof TagGroupSchema>;

// ============================================
// 沟通记录 (Communication Record)
// ============================================
export const CommunicationRecordSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  channel: z.enum(['企微', '电话', '短信', '邮件']),
  content: z.string(),
  direction: z.enum(['inbound', 'outbound']),
  duration: z.number().optional(), // 通话时长(秒)
  emotion: z.enum(['positive', 'neutral', 'negative']).optional(),
  intent: z.enum(['高意向', '比价', '顾虑', '不感兴趣', '待定']).optional(),
  agentName: z.string(),
  createdAt: z.string(),
});

export type CommunicationRecord = z.infer<typeof CommunicationRecordSchema>;

// ============================================
// 话术 (Script)
// ============================================
export const ScriptSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  usageCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Script = z.infer<typeof ScriptSchema>;

// ============================================
// 待办 (Todo)
// ============================================
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: z.enum(['跟进任务', '回访', '催款', '其他']),
  priority: z.enum(['P0', 'P1', 'P2']),
  status: z.enum(['pending', 'completed', 'cancelled']),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  source: z.enum(['AI', '手动']),
  dueDate: z.string(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export type Todo = z.infer<typeof TodoSchema>;

// ============================================
// 客户分群 (Segment)
// ============================================
export const SegmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'gt', 'lt', 'in']),
    value: z.any(),
  })),
  customerCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Segment = z.infer<typeof SegmentSchema>;

// ============================================
// 租户 (Tenant - 运营后台)
// ============================================
export const TenantSchema = z.object({
  id: z.string(),
  companyName: z.string().min(1),
  industry: z.string(),
  version: z.enum(['体验版', '基础版', '专业版', '企业版']),
  status: z.enum(['ACTIVE', 'PENDING', 'TRIAL', 'GRACE', 'SUSPENDED', 'CLOSED']),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  companySize: z.string().optional(),
  healthScore: z.number().min(0).max(100).default(85),
  aiUsagePercent: z.number().min(0).max(100).default(0),
  expireDate: z.string(),
  registeredAt: z.string(),
});

export type Tenant = z.infer<typeof TenantSchema>;

// ============================================
// 版本功能矩阵 (Version Feature Matrix)
// ============================================
export const VersionFeatureSchema = z.object({
  feature: z.string(),
  versions: z.record(z.string(), z.string()), // version -> value
});

export type VersionFeature = z.infer<typeof VersionFeatureSchema>;

// ============================================
// 订阅订单 (Subscription Order)
// ============================================
export const SubscriptionOrderSchema = z.object({
  id: z.string(),
  orderNo: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  version: z.string(),
  amount: z.number(),
  paymentMethod: z.string(),
  status: z.enum(['paid', 'refunding', 'refunded', 'cancelled']),
  refundAmount: z.number().optional(),
  refundReason: z.string().optional(),
  createdAt: z.string(),
  paidAt: z.string().optional(),
});

export type SubscriptionOrder = z.infer<typeof SubscriptionOrderSchema>;

// ============================================
// AI推荐话术
// ============================================
export const AiScriptSuggestionSchema = z.object({
  id: z.string(),
  content: z.string(),
  context: z.string().optional(),
  adopted: z.boolean().default(false),
  createdAt: z.string(),
});

export type AiScriptSuggestion = z.infer<typeof AiScriptSuggestionSchema>;

// ============================================
// 统计指标
// ============================================
export const DashboardStatsSchema = z.object({
  todayTodos: z.number(),
  todayCommunications: z.number(),
  newCustomersThisWeek: z.number(),
  followUpCompletionRate: z.number(),
  totalCommunications: z.number(),
  aiAssistPercent: z.number(),
  avgSatisfaction: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const OpsDashboardStatsSchema = z.object({
  totalTenants: z.number(),
  activeTenants: z.number(),
  trialTenants: z.number(),
  newTenantsThisMonth: z.number(),
  mrr: z.number(),
  arr: z.number(),
  arpu: z.number(),
  renewalRate: z.number(),
  pendingApprovals: z.object({
    tenantReviews: z.number(),
    refundApprovals: z.number(),
    thresholdAlerts: z.number(),
  }),
});

export type OpsDashboardStats = z.infer<typeof OpsDashboardStatsSchema>;
