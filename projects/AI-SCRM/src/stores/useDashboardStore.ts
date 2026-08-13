import { create } from 'zustand';
import { dashboardService } from '../services/tenant-service';
import { opsDashboardService } from '../services/ops-service';
import type { DashboardStats, OpsDashboardStats } from '../contracts/schemas';

interface DashboardState {
  tenantStats: DashboardStats | null;
  opsStats: OpsDashboardStats | null;
  loading: boolean;
  loadTenantStats: () => Promise<void>;
  loadOpsStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  tenantStats: null,
  opsStats: null,
  loading: false,

  loadTenantStats: async () => {
    set({ loading: true });
    try {
      const stats = await dashboardService.getTenantStats();
      set({ tenantStats: stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadOpsStats: async () => {
    set({ loading: true });
    try {
      const stats = await opsDashboardService.getStats();
      set({ opsStats: stats, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
