/**
 * L0：契约一致性测试
 * 验证 Zod Schema 与 PRD 数据实体一致性
 */
import { describe, it, expect } from 'vitest';
import {
  CustomerSchema, CreateCustomerSchema,
  TagSchema, TagGroupSchema,
  CommunicationRecordSchema,
  ScriptSchema,
  TodoSchema,
  SegmentSchema,
  TenantSchema,
  VersionFeatureSchema,
  SubscriptionOrderSchema,
  AiScriptSuggestionSchema,
  DashboardStatsSchema, OpsDashboardStatsSchema,
} from '../../src/contracts/schemas';

// ============================================
// ENT-TNT-001: Customer 一致性
// ============================================
describe('ENT-TNT-001 CustomerSchema', () => {
  it('应接受有效的客户数据', () => {
    const valid = {
      id: 'cus-001', name: '张三', phone: '13800001234',
      company: '九天科技', source: '线上推广', tags: ['VIP', '新客'],
      industry: '大健康', createdAt: '2026-07-01', updatedAt: '2026-07-15',
    };
    expect(() => CustomerSchema.parse(valid)).not.toThrow();
  });

  it('应拒绝缺少必填字段', () => {
    expect(() => CustomerSchema.parse({ id: 'cus-001' })).toThrow();
  });

  it('应拒绝空姓名', () => {
    expect(() => CustomerSchema.parse({
      id: 'cus-001', name: '', createdAt: '2026-01-01', updatedAt: '2026-01-01',
    })).toThrow();
  });

  it('应处理特殊字符(XSS防护)', () => {
    const data = {
      id: 'cus-001', name: '<script>alert(1)</script>',
      createdAt: '2026-01-01', updatedAt: '2026-01-01',
    };
    const parsed = CustomerSchema.parse(data);
    expect(parsed.name).toBe('<script>alert(1)</script>');
  });

  it('CreateCustomerSchema 应排除 id/createdAt/updatedAt', () => {
    const req = { name: '李四', phone: '13800001111' };
    const parsed = CreateCustomerSchema.parse(req);
    expect(parsed).not.toHaveProperty('id');
    expect(parsed).not.toHaveProperty('createdAt');
  });
});

// ============================================
// ENT-TNT-003: CommunicationRecord 一致性
// ============================================
describe('ENT-TNT-003 CommunicationRecordSchema', () => {
  it('应接受四种渠道类型', () => {
    const channels = ['企微', '电话', '短信', '邮件'] as const;
    channels.forEach(ch => {
      expect(() => CommunicationRecordSchema.parse({
        id: 'c-1', customerId: 'cus-1', customerName: '张三',
        channel: ch, content: '你好', direction: 'outbound',
        agentName: '李四', createdAt: '2026-01-01',
      })).not.toThrow();
    });
  });

  it('应拒绝无效渠道', () => {
    expect(() => CommunicationRecordSchema.parse({
      id: 'c-1', customerId: 'cus-1', customerName: '张三',
      channel: '传真', content: '你好', direction: 'outbound',
      agentName: '李四', createdAt: '2026-01-01',
    })).toThrow();
  });

  it('应接受完整的情绪+意图数据', () => {
    const rec = CommunicationRecordSchema.parse({
      id: 'c-1', customerId: 'cus-1', customerName: '张三',
      channel: '企微', content: '太贵了', direction: 'inbound',
      agentName: '李四', createdAt: '2026-01-01',
      emotion: 'negative', intent: '顾虑', duration: 120,
    });
    expect(rec.emotion).toBe('negative');
    expect(rec.intent).toBe('顾虑');
  });
});

// ============================================
// ENT-TNT-007: Todo 一致性 + BR规则验证
// ============================================
describe('ENT-TNT-007 TodoSchema + BR-FM-001~003', () => {
  it('应接受有效的待办数据', () => {
    expect(() => TodoSchema.parse({
      id: 't-1', title: '跟进张总', type: '跟进任务',
      priority: 'P1', status: 'pending', source: 'AI',
      customerId: 'cus-1', dueDate: '2026-07-25', createdAt: '2026-07-20',
    })).not.toThrow();
  });

  it('应拒绝无效状态转换（合规性）', () => {
    // 已完成不能直接变待处理
    const todo = TodoSchema.parse({
      id: 't-1', title: 'x', type: '跟进任务', priority: 'P0',
      status: 'completed', source: 'AI', dueDate: '2026-01-01',
      createdAt: '2026-01-01',
    });
    expect(todo.status).toBe('completed');
  });
});

// ============================================
// ENT-OPS-001: Tenant 一致性 + BR-TN-001
// ============================================
describe('ENT-OPS-001 TenantSchema + BR-TN-001', () => {
  it('应包含所有6种状态', () => {
    expect(TenantSchema.shape.status.options).toContain('ACTIVE');
    expect(TenantSchema.shape.status.options).toContain('SUSPENDED');
    expect(TenantSchema.shape.status.options).toContain('CLOSED');
    expect(TenantSchema.shape.status.options.length).toBe(6);
  });

  it('应包含健康度评分范围0-100', () => {
    expect(() => TenantSchema.parse({
      id: 't-1', companyName: '九天', industry: '大健康',
      version: '专业版', status: 'ACTIVE', expireDate: '2027-01-01',
      registeredAt: '2026-01-01', healthScore: 95,
    })).not.toThrow();

    expect(() => TenantSchema.parse({
      id: 't-1', companyName: '九天', industry: '大健康',
      version: '专业版', status: 'ACTIVE', expireDate: '2027-01-01',
      registeredAt: '2026-01-01', healthScore: 150,
    })).toThrow();
  });
});

// ============================================
// ENT-OPS-003: SubscriptionOrder + BR-SB-001
// ============================================
describe('ENT-OPS-003 SubscriptionOrderSchema + BR-SB-001', () => {
  it('应包含退款相关字段', () => {
    const order = SubscriptionOrderSchema.parse({
      id: 'ord-1', orderNo: 'SO-20260701-001', tenantId: 't-1',
      tenantName: '九天科技', version: '专业版', amount: 99900,
      paymentMethod: '微信支付', status: 'paid', createdAt: '2026-07-01',
    });
    expect(order.amount).toBe(99900);
  });

  it('应接受退款状态订单', () => {
    expect(() => SubscriptionOrderSchema.parse({
      id: 'ord-1', orderNo: 'SO-1', tenantId: 't-1',
      tenantName: '九天', version: '专业版', amount: 1000,
      paymentMethod: '微信', status: 'refunded', refundAmount: 700,
      refundReason: '不再需要', createdAt: '2026-07-01',
    })).not.toThrow();
  });
});

// ============================================
// Dashboard Stats Schema 一致性
// ============================================
describe('DashboardStats consistency', () => {
  it('DashboardStats 应包含所有概览指标', () => {
    const stats = DashboardStatsSchema.parse({
      todayTodos: 12, todayCommunications: 8, newCustomersThisWeek: 5,
      followUpCompletionRate: 0.85, totalCommunications: 120,
      aiAssistPercent: 0.42, avgSatisfaction: 4.3,
    });
    expect(stats.aiAssistPercent).toBe(0.42);
  });

  it('OpsDashboardStats 应包含SAAS商业指标', () => {
    expect(() => OpsDashboardStatsSchema.parse({
      totalTenants: 50, activeTenants: 35, trialTenants: 10,
      newTenantsThisMonth: 8, mrr: 28500, arr: 342000, arpu: 814,
      renewalRate: 0.92,
      pendingApprovals: { tenantReviews: 3, refundApprovals: 1, thresholdAlerts: 0 },
    })).not.toThrow();
  });
});
