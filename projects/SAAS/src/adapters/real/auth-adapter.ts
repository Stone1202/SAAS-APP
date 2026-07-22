/**
 * Real模式 — 认证适配器（JWT）
 *
 * V1阶段：预留接口，默认返回mock用户
 * V2+：对接真实JWT认证
 */

export class RealAuthAdapter {
  async login(username: string, _password: string) {
    // V1阶段返回mock token
    return { token: `mock-jwt-${username}-${Date.now()}`, username };
  }

  async getCurrentUser() {
    return {
      id: 'user-001',
      name: '运营人员',
      role: 'operator' as const,
    };
  }

  isAuthenticated(): boolean {
    return true; // V1阶段默认已登录
  }
}

export const realAuth = new RealAuthAdapter();
