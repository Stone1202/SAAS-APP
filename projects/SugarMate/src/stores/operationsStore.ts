/**
 * SugarMate 运营管理状态（Zustand）
 * 管理：Banner、活动、工单、投诉
 */
import { create } from 'zustand';
import { getAdapters } from '@/adapters/factory';

// === Banner ===
export interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  link_type?: 'H5' | 'MINIPROGRAM' | 'APP_PAGE' | 'LIVE_ROOM';
  platform: ('MP' | 'APP' | 'LIVE' | 'PC')[];
  position: 'HOME_TOP' | 'HOME_MID' | 'MALL_TOP' | 'LIVE_TOP';
  sort_order: number;
  status: 'ON' | 'OFF';
  start_time: number;
  end_time?: number;
  created_at: number;
  updated_at: number;
}

// === 活动 ===
export interface Activity {
  id: string;
  name: string;
  type: 'FULL_REDUCE' | 'DISCOUNT' | 'COUPON' | 'GROUP_BUY' | 'SEC_KILL';
  description: string;
  rules: Record<string, unknown>;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  start_time: number;
  end_time: number;
  products?: string[];
  stats?: {
    participants: number;
    orders: number;
    gmv: number;
  };
  created_at: number;
}

// === 客服工单 ===
export interface Ticket {
  id: string;
  title: string;
  type: 'COMPLAINT' | 'REFUND' | 'CONSULT' | 'BUG';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'PROCESSING' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  customer_id: string;
  customer_name: string;
  assignee_id?: string;
  assignee_name?: string;
  related_order_id?: string;
  description: string;
  attachments?: string[];
  created_at: number;
  updated_at: number;
  resolved_at?: number;
}

// === 投诉 ===
export interface Complaint {
  id: string;
  complainant_id: string;
  complainant_name: string;
  target_type: 'DOCTOR' | 'NUTRITIONIST' | 'MERCHANT' | 'PRODUCT' | 'LIVE_HOST';
  target_id: string;
  target_name: string;
  reason: string;
  evidence?: string[];
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED';
  resolution?: string;
  created_at: number;
  resolved_at?: number;
}

interface OperationsState {
  banners: Banner[];
  activities: Activity[];
  tickets: Ticket[];
  complaints: Complaint[];
  loading: boolean;

  // Banners
  loadBanners: () => Promise<void>;
  toggleBanner: (id: string, status: 'ON' | 'OFF') => Promise<void>;
  createBanner: (banner: Partial<Banner>) => Promise<Banner>;
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;

  // Activities
  loadActivities: () => Promise<void>;
  toggleActivity: (id: string, status: 'ACTIVE' | 'PAUSED') => Promise<void>;

  // Tickets
  loadTickets: () => Promise<void>;
  assignTicket: (ticketId: string, assigneeId: string) => Promise<void>;
  resolveTicket: (ticketId: string) => Promise<void>;

  // Complaints
  loadComplaints: () => Promise<void>;
  resolveComplaint: (id: string, resolution: string, status: 'RESOLVED' | 'DISMISSED') => Promise<void>;
}

export const useOperationsStore = create<OperationsState>((set, get) => ({
  banners: [],
  activities: [],
  tickets: [],
  complaints: [],
  loading: false,

  loadBanners: async () => {
    set({ loading: true });
    try {
      const { data } = await getAdapters();
      const banners = await data.getBannerList();
      set({ banners, loading: false });
    } catch { set({ loading: false }); }
  },

  toggleBanner: async (id, status) => {
    const { data } = await getAdapters();
    await data.patch(`/ops/banners/${id}`, { status });
    set({
      banners: get().banners.map(b => b.id === id ? { ...b, status } : b),
    });
  },

  createBanner: async (banner) => {
    const { data } = await getAdapters();
    return data.post<Banner>('/ops/banners', banner);
  },

  updateBanner: async (id, updates) => {
    const { data } = await getAdapters();
    await data.patch(`/ops/banners/${id}`, updates);
    set({
      banners: get().banners.map(b => b.id === id ? { ...b, ...updates } : b),
    });
  },

  loadActivities: async () => {
    try {
      const { data } = await getAdapters();
      const activities = await data.getActivityList();
      set({ activities });
    } catch { /* ignore */ }
  },

  toggleActivity: async (id, status) => {
    const { data } = await getAdapters();
    await data.patch(`/ops/activities/${id}`, { status });
    set({
      activities: get().activities.map(a => a.id === id ? { ...a, status } : a),
    });
  },

  loadTickets: async () => {
    try {
      const { data } = await getAdapters();
      const tickets = await data.getTicketList();
      set({ tickets });
    } catch { /* ignore */ }
  },

  assignTicket: async (ticketId, assigneeId) => {
    const { data } = await getAdapters();
    await data.patch(`/ops/tickets/${ticketId}/assign`, { assignee_id: assigneeId });
    set({
      tickets: get().tickets.map(t =>
        t.id === ticketId ? { ...t, status: 'PROCESSING' as const } : t
      ),
    });
  },

  resolveTicket: async (ticketId) => {
    const { data } = await getAdapters();
    await data.post(`/ops/tickets/${ticketId}/resolve`);
    set({
      tickets: get().tickets.map(t =>
        t.id === ticketId ? { ...t, status: 'CLOSED' as const, resolved_at: Date.now() } : t
      ),
    });
  },

  loadComplaints: async () => {
    try {
      const { data } = await getAdapters();
      const complaints = await data.getComplaintList();
      set({ complaints });
    } catch { /* ignore */ }
  },

  resolveComplaint: async (id, resolution, status) => {
    const { data } = await getAdapters();
    await data.post(`/ops/complaints/${id}/resolve`, { resolution, status });
    set({
      complaints: get().complaints.map(c =>
        c.id === id ? { ...c, resolution, status, resolved_at: Date.now() } : c
      ),
    });
  },
}));
