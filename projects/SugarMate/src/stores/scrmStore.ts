/**
 * SugarMate SCRM客户关系管理状态（Zustand）
 */
import { create } from 'zustand';
import { getAdapters } from '@/adapters/factory';

// === 客户 ===
export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  gender: 'MALE' | 'FEMALE';
  birth_date: string;
  diabetes_type: string;
  tags: Tag[];
  owner_id: string;
  owner_name: string;
  source: 'MP' | 'APP' | 'LIVE' | 'IMPORT';
  stage: 'NEW' | 'IN_CONTACT' | 'ACTIVE' | 'DORMANT' | 'LOST';
  last_interaction?: number;
  created_at: number;
}

// === 客户标签 ===
export interface Tag {
  id: string;
  name: string;
  color: string;
  group: string;
  customer_count: number;
}

// === SOP流程 ===
export interface SopTemplate {
  id: string;
  name: string;
  description?: string;
  target_customer_stages: string[];
  steps: SopStep[];
  is_active: boolean;
  created_at: number;
}

export interface SopStep {
  order: number;
  action_type: 'MESSAGE' | 'TASK' | 'REMINDER' | 'TAG_CHANGE';
  delay_hours: number;
  content?: string;
  config?: Record<string, unknown>;
}

// === 会话记录 ===
export interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  staff_id: string;
  staff_name: string;
  channel: 'MP_CHAT' | 'APP_CHAT' | 'PHONE' | 'LIVE_CHAT';
  messages: ChatMessage[];
  satisfaction?: number;
  tags_mentioned?: string[];
  started_at: number;
  ended_at?: number;
}

export interface ChatMessage {
  id: string;
  sender_type: 'CUSTOMER' | 'STAFF';
  content: string;
  msg_type: 'TEXT' | 'IMAGE' | 'FILE' | 'MINIPROGRAM';
  sent_at: number;
}

interface ScrmState {
  customers: Customer[];
  customerTotal: number;
  tags: Tag[];
  sopTemplates: SopTemplate[];
  conversations: Conversation[];
  loading: boolean;

  loadCustomers: (params?: { page?: number; page_size?: number; stage?: string }) => Promise<void>;
  loadTags: () => Promise<void>;
  loadSopTemplates: () => Promise<void>;
  loadConversations: (customerId?: string) => Promise<void>;
  createTag: (tag: Partial<Tag>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  toggleSopTemplate: (templateId: string, active: boolean) => Promise<void>;
}

export const useScrmStore = create<ScrmState>((set, get) => ({
  customers: [],
  customerTotal: 0,
  tags: [],
  sopTemplates: [],
  conversations: [],
  loading: false,

  loadCustomers: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await getAdapters();
      const res = await data.getCustomerList({
        page: params.page || 1,
        page_size: params.page_size || 20,
        stage: params.stage,
      });
      set({ customers: res.list, customerTotal: res.total, loading: false });
    } catch { set({ loading: false }); }
  },

  loadTags: async () => {
    try {
      const { data } = await getAdapters();
      const tags = await data.getTagList();
      set({ tags });
    } catch { /* ignore */ }
  },

  loadSopTemplates: async () => {
    try {
      const { data } = await getAdapters();
      const templates = await data.getSopList();
      set({ sopTemplates: templates });
    } catch { /* ignore */ }
  },

  loadConversations: async (customerId) => {
    try {
      const { data } = await getAdapters();
      const conversations = await data.getConversations({ customer_id: customerId });
      set({ conversations });
    } catch { /* ignore */ }
  },

  createTag: async (tag) => {
    const { data } = await getAdapters();
    const newTag = await data.post<Tag>('/scrm/tags', tag);
    set({ tags: [...get().tags, newTag] });
  },

  deleteTag: async (tagId) => {
    const { data } = await getAdapters();
    await data.delete(`/scrm/tags/${tagId}`);
    set({ tags: get().tags.filter(t => t.id !== tagId) });
  },

  toggleSopTemplate: async (templateId, active) => {
    const { data } = await getAdapters();
    await data.patch(`/scrm/sop/${templateId}`, { is_active: active });
    set({
      sopTemplates: get().sopTemplates.map(t =>
        t.id === templateId ? { ...t, is_active: active } : t
      ),
    });
  },
}));
