import {
  tenantRepository,
  versionFeatureRepository,
  subscriptionOrderRepository,
  getOpsDashboardStats,
} from '../adapters/factory';

// ============================================
// Tenant Service (运营后台)
// ============================================
export const tenantService = {
  getAll: tenantRepository.getAll,
  getById: tenantRepository.getById,
  approve: tenantRepository.approve,
  reject: tenantRepository.reject,
  async setEnabled(id: string, enabled: boolean) {
    const existing = await tenantRepository.getById(id);
    if (!existing) throw new Error('Tenant not found');
    return tenantRepository.update(id, { enabled, status: enabled ? 'ACTIVE' : 'SUSPENDED' });
  },
  async toggleEnabled(id: string) {
    return tenantRepository.toggleEnabled(id);
  },
};

// ============================================
// Version Feature Service
// ============================================
export const versionFeatureService = {
  getAll: versionFeatureRepository.getAll,
  update: versionFeatureRepository.update,
};

// ============================================
// Subscription Order Service
// ============================================
export const subscriptionOrderService = {
  getAll: subscriptionOrderRepository.getAll,
  getById: subscriptionOrderRepository.getById,
  approveRefund: subscriptionOrderRepository.approveRefund,
  rejectRefund: subscriptionOrderRepository.rejectRefund,
};

// ============================================
// Ops Dashboard Service
// ============================================
export const opsDashboardService = {
  getStats: getOpsDashboardStats,
};
