import { create } from 'zustand';
import { weChatService } from '../services/tenant-service';
import type { WeChatAccount } from '../contracts/schemas';

interface WeChatState {
  accounts: WeChatAccount[];
  loading: boolean;
  error: string | null;
  loadAccounts: () => Promise<void>;
  authorizeAccount: (data: { corpId: string; corpName: string; corpSecret: string }) => Promise<WeChatAccount>;
  reSyncAccount: (id: string) => Promise<void>;
  revokeAccount: (id: string) => Promise<void>;
}

export const useWeChatStore = create<WeChatState>((set) => ({
  accounts: [],
  loading: false,
  error: null,

  loadAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const accounts = await weChatService.getAll();
      set({ accounts, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  authorizeAccount: async (data) => {
    set({ loading: true, error: null });
    try {
      const account = await weChatService.authorize(data);
      set((s) => ({ accounts: [...s.accounts, account], loading: false }));
      return account;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  reSyncAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await weChatService.reSync(id);
      set((s) => ({
        accounts: s.accounts.map((a) => (a.id === id ? updated : a)),
        loading: false,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  revokeAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await weChatService.revoke(id);
      set((s) => ({
        accounts: s.accounts.map((a) => (a.id === id ? updated : a)),
        loading: false,
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
}));
