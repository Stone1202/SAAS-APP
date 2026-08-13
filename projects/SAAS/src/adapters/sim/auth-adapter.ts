/**
 * Sim模式 — 认证适配器（开发模式跳过认证）
 */

export class SimAuthAdapter {
  /** 模拟用户信息 */
  getUser() {
    return {
      id: 'mock-user-001',
      name: '运营人员',
      role: 'operator' as const,
      tenant_id: 'T-001',
      tenant_name: 'XX科技',
    };
  }

  /** 模拟租户信息 */
  getTenant() {
    return {
      tenant_id: 'T-001',
      tenant_name: 'XX科技',
      stream_domain: 'push.example.com',
      industry: '电商',
    };
  }
}

export const simAuth = new SimAuthAdapter();
