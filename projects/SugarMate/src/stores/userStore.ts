/**
 * SugarMate 用户状态管理（Zustand）
 * 管理：登录态、账号、身份切换、入驻状态
 */
import { create } from 'zustand';
import { getAdapters } from '@/adapters/factory';
import type { Account, Identity, LoginResponse, ActivateIdentityResponse } from '@contracts/user';

interface UserState {
  // 登录态
  isLoggedIn: boolean;
  loginLoading: boolean;

  // 账号
  account: Account | null;

  // 身份
  identities: Identity[];
  activeIdentity: { identity_role: string; view_menu: string[]; permissions: string[] } | null;

  // 动作
  login: (phone: string, code: string, platform: string, deviceId: string) => Promise<void>;
  loadAccount: () => Promise<void>;
  loadIdentities: () => Promise<void>;
  activateIdentity: (identityId: string) => Promise<ActivateIdentityResponse>;
  switchRole: (identityId: string) => Promise<void>;
  logout: () => void;
  init: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  isLoggedIn: false,
  loginLoading: false,
  account: null,
  identities: [],
  activeIdentity: null,

  login: async (phone, code, platform, deviceId) => {
    set({ loginLoading: true });
    try {
      const { data, auth } = await getAdapters();
      const res = await data.login(phone, code, platform, deviceId);
      auth.setToken(res.access_token);
      set({ isLoggedIn: true, loginLoading: false });
      // 登录后加载账号信息
      await get().loadAccount();
      await get().loadIdentities();
      // 如果只有一个身份，自动激活
      if (res.temp_identities.length === 1) {
        await get().activateIdentity(res.temp_identities[0].identity_id);
      }
    } catch (e) {
      set({ loginLoading: false });
      throw e;
    }
  },

  loadAccount: async () => {
    try {
      const { data } = await getAdapters();
      // 从 token 解析 account_id（sim 模式下用固定值）
      const { auth } = await getAdapters();
      const token = auth.getToken();
      if (!token) return;
      // SIM模式下从本地存储恢复
      const storedAccountId = localStorage.getItem('sugarmate_account_id') || 'acc-001';
      const account = await data.getAccount(storedAccountId);
      set({ account });
    } catch { /* ignore */ }
  },

  loadIdentities: async () => {
    try {
      const { data, auth } = await getAdapters();
      const token = auth.getToken();
      if (!token) return;
      const storedAccountId = localStorage.getItem('sugarmate_account_id') || 'acc-001';
      const identities = await data.getIdentities(storedAccountId);
      set({ identities });
    } catch { /* ignore */ }
  },

  activateIdentity: async (identityId) => {
    const { data, auth } = await getAdapters();
    const res = await data.activateIdentity(identityId);
    // 保存当前激活身份
    localStorage.setItem('sugarmate_active_identity', JSON.stringify(res));
    auth.setToken(res.safe_session_token || auth.getToken()!);
    set({ activeIdentity: res });
    return res;
  },

  switchRole: async (identityId) => {
    await get().activateIdentity(identityId);
  },

  logout: () => {
    localStorage.removeItem('sugarmate_sim_token');
    localStorage.removeItem('sugarmate_token');
    localStorage.removeItem('sugarmate_active_identity');
    localStorage.removeItem('sugarmate_account_id');
    set({ isLoggedIn: false, account: null, identities: [], activeIdentity: null });
  },

  init: async () => {
    const { auth } = await getAdapters();
    // SIM模式下自动创建mock token，无需手动登录即可访问管理端
    if (!auth.isAuthenticated() && import.meta.env.VITE_MODE === 'sim') {
      auth.setToken('sim_dev_token');
    }
    if (auth.isAuthenticated()) {
      set({ isLoggedIn: true });
      await get().loadAccount();
      await get().loadIdentities();
      // 恢复激活身份
      const saved = localStorage.getItem('sugarmate_active_identity');
      if (saved) {
        try { set({ activeIdentity: JSON.parse(saved) }); } catch { /* ignore */ }
      }
    }
  },
}));
