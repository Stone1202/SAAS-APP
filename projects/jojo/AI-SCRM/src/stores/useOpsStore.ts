import { create } from 'zustand';
import { tenantService, versionFeatureService, subscriptionOrderService } from '../services/ops-service';
import type { Tenant, VersionFeature, SubscriptionOrder } from '../contracts/schemas';

interface OpsState {
  tenants: Tenant[];
  versionFeatures: VersionFeature[];
  orders: SubscriptionOrder[];
  loading: boolean;
  error: string | null;
  loadTenants: (filters?: any) => Promise<void>;
  loadVersionFeatures: () => Promise<void>;
  loadOrders: () => Promise<void>;
  approveTenant: (id: string, data: any) => Promise<void>;
  rejectTenant: (id: string, reason: string) => Promise<void>;
  approveRefund: (id: string, amount?: number) => Promise<void>;
  rejectRefund: (id: string) => Promise<void>;
  updateVersionFeature: (feature: string, versions: any) => Promise<void>;
}

export const useOpsStore = create<OpsState>((set) => ({
  tenants: [],
  versionFeatures: [],
  orders: [],
  loading: false,
  error: null,

  loadTenants: async (filters) => {
    set({ loading: true, error: null });
    try {
      const tenants = await tenantService.getAll(filters);
      set({ tenants, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  loadVersionFeatures: async () => {
    try {
      const versionFeatures = await versionFeatureService.getAll();
      set({ versionFeatures });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  loadOrders: async () => {
    try {
      const orders = await subscriptionOrderService.getAll();
      set({ orders });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  approveTenant: async (id, data) => {
    const updated = await tenantService.approve(id, data);
    set((s) => ({ tenants: s.tenants.map((t) => (t.id === id ? updated : t)) }));
  },

  rejectTenant: async (id, reason) => {
    const updated = await tenantService.reject(id, reason);
    set((s) => ({ tenants: s.tenants.map((t) => (t.id === id ? updated : t)) }));
  },

  approveRefund: async (id, amount?) => {
    const updated = await subscriptionOrderService.approveRefund(id, amount);
    set((s) => ({ orders: s.orders.map((o) => (o.id === id ? updated : o)) }));
  },

  rejectRefund: async (id) => {
    const updated = await subscriptionOrderService.rejectRefund(id);
    set((s) => ({ orders: s.orders.map((o) => (o.id === id ? updated : o)) }));
  },

  updateVersionFeature: async (feature, versions) => {
    await versionFeatureService.update(feature, versions);
  },
}));
