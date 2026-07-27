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
  industry: z.string().optional(),
  version: z.enum(['体验版', '基础版', '专业版', '企业版']).optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'TRIAL', 'GRACE', 'SUSPENDED', 'CLOSED']).optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  companySize: z.string().optional(),
  healthScore: z.number().min(0).max(100).default(85).optional(),
  aiUsagePercent: z.number().min(0).max(100).default(0).optional(),
  expireDate: z.string().optional(),
  registeredAt: z.string(),
  enabled: z.boolean().default(true),
});

export type Tenant = z.infer<typeof TenantSchema>;
export type TenantStatus = Tenant['status'];

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

// ============================================
// 消息 (Message) - ENT-TNT-004
// ============================================
export const MessageSchema = z.object({
  id: z.string(),
  commId: z.string(),
  senderType: z.enum(['agent', 'customer']),
  content: z.string(),
  contentType: z.enum(['text', 'image', 'file', 'voice', 'video']).default('text'),
  emotionLabel: z.enum(['positive', 'neutral', 'negative', 'angry']).optional(),
  sentAt: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

// ============================================
// AI总结 (Summary) - ENT-TNT-006
// ============================================
export const SummarySchema = z.object({
  id: z.string(),
  commId: z.string(),
  summaryText: z.string(),
  keyDecisions: z.array(z.string()).default([]),
  emotionSummary: z.string().optional(),
  suggestions: z.array(z.string()).default([]),
  qualityScore: z.number().min(0).max(100).optional(),
  confirmed: z.boolean().default(false),
});

export type Summary = z.infer<typeof SummarySchema>;

// ============================================
// 商品 (Product) - ENT-TNT-008
// ============================================
export const ProductSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string().min(1),
  price: z.number().min(0),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type Product = z.infer<typeof ProductSchema>;

// ============================================
// 客户意向 (Intent) - ENT-TNT-009
// ============================================
export const IntentSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  commId: z.string().optional(),
  intentType: z.enum(['高意向', '比价', '顾虑', '不感兴趣', '待定']),
  confidence: z.number().min(0).max(1),
  detectedAt: z.string(),
});

export type Intent = z.infer<typeof IntentSchema>;

// ============================================
// 质检记录 (QualityCheck) - ENT-TNT-010
// ============================================
export const QualityCheckSchema = z.object({
  id: z.string(),
  commId: z.string(),
  openingScore: z.number().min(0).max(100),
  discoveryScore: z.number().min(0).max(100),
  objectionScore: z.number().min(0).max(100),
  closingScore: z.number().min(0).max(100),
  endingScore: z.number().min(0).max(100),
  totalScore: z.number().min(0).max(100),
  grade: z.enum(['S', 'A', 'B', 'C', 'D']),
  reviewStatus: z.enum(['PENDING', 'REVIEWED']).default('PENDING'),
  createdAt: z.string().optional(),
});

export type QualityCheck = z.infer<typeof QualityCheckSchema>;

// ============================================
// 企微授权 (WeChatAccount) - ENT-TNT-011
// ============================================
export const WeChatAccountSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  corpId: z.string().min(1),
  corpName: z.string().min(1),
  corpSecretEnc: z.string().optional(),
  accessToken: z.string().optional(),
  tokenExpiresAt: z.string().optional(),
  employeeCount: z.number().default(0),
  customerCount: z.number().default(0),
  groupCount: z.number().default(0),
  syncStatus: z.enum(['PENDING', 'SYNCING', 'AUTHORIZED', 'EXPIRED', 'REVOKED']).default('PENDING'),
  status: z.enum(['PENDING', 'SYNCING', 'AUTHORIZED', 'EXPIRED', 'REVOKED']).default('PENDING'),
  createdAt: z.string().optional(),
});

export type WeChatAccount = z.infer<typeof WeChatAccountSchema>;

// ============================================
// 企微客户群 (WeChatGroup) - ENT-TNT-012
// ============================================
export const WeChatGroupSchema = z.object({
  id: z.string(),
  wxAccountId: z.string(),
  groupId: z.string().min(1), // 企微群ID
  groupName: z.string().min(1),
  memberCount: z.number().default(0),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  syncedAt: z.string(),
});

export type WeChatGroup = z.infer<typeof WeChatGroupSchema>;

// ============================================
// 企微好友关系 (WeChatContact) - ENT-TNT-013
// ============================================
export const WeChatContactSchema = z.object({
  id: z.string(),
  wxAccountId: z.string(),
  employeeId: z.string(),
  customerId: z.string(),
  externalUserId: z.string().min(1), // 企微外部联系人ID
  addWay: z.string().optional(),
  addTime: z.string(),
  isFriend: z.boolean().default(true),
  inGroups: z.array(z.string()).default([]),
});

export type WeChatContact = z.infer<typeof WeChatContactSchema>;

// ============================================
// AI用量记录 (AIUsage) - ENT-OPS-004
// ============================================
export const AIUsageSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  agentType: z.string(),
  callCount: z.number().default(0),
  tokenCount: z.number().default(0),
  cost: z.number().default(0),
  periodDate: z.string(),
});

export type AIUsage = z.infer<typeof AIUsageSchema>;
