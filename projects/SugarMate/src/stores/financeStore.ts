/**
 * SugarMate 财务结算状态（Zustand）
 * 管理：结算、对账、分账
 */
import { create } from 'zustand';
import { getAdapters } from '@/adapters/factory';

// === 结算单 ===
export interface Settlement {
  id: string;
  settlement_no: string;
  merchant_id: string;
  merchant_name: string;
  period_start: number;
  period_end: number;
  total_amount: number;
  platform_fee: number;
  settle_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SETTLED' | 'DISPUTED';
  settlement_type: 'T1' | 'D1';
  bank_account: string;
  bank_name: string;
  confirmed_at?: number;
  settled_at?: number;
  created_at: number;
}

// === 对账明细 ===
export interface ReconciliationItem {
  id: string;
  settlement_id: string;
  order_id: string;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  match_status: 'MATCHED' | 'MISMATCHED' | 'MISSING';
  difference?: number;
  difference_reason?: string;
}

// === 分账记录 ===
export interface SplitRecord {
  id: string;
  settlement_id: string;
  merchant_id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  payment_channel: string;
  transaction_id?: string;
  processed_at?: number;
  created_at: number;
}

interface FinanceState {
  settlements: Settlement[];
  total: number;
  reconciliationItems: ReconciliationItem[];
  splitRecords: SplitRecord[];
  loading: boolean;

  loadSettlements: (params?: { page?: number; page_size?: number; status?: string; merchant_id?: string }) => Promise<void>;
  loadReconciliation: (settlementId: string) => Promise<void>;
  loadSplitRecords: (settlementId: string) => Promise<void>;
  confirmSettlement: (settlementId: string) => Promise<void>;
  executeSplit: (settlementId: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  settlements: [],
  total: 0,
  reconciliationItems: [],
  splitRecords: [],
  loading: false,

  loadSettlements: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await getAdapters();
      const res = await data.getSettlementList({
        page: params.page || 1,
        page_size: params.page_size || 20,
        status: params.status,
        merchant_id: params.merchant_id,
      });
      set({ settlements: res.list, total: res.total, loading: false });
    } catch { set({ loading: false }); }
  },

  loadReconciliation: async (settlementId) => {
    set({ loading: true });
    try {
      const { data } = await getAdapters();
      const items = await data.getReconciliationItems(settlementId);
      set({ reconciliationItems: items, loading: false });
    } catch { set({ loading: false }); }
  },

  loadSplitRecords: async (settlementId) => {
    try {
      const { data } = await getAdapters();
      const records = await data.getSplitRecords(settlementId);
      set({ splitRecords: records });
    } catch { /* ignore */ }
  },

  confirmSettlement: async (settlementId) => {
    const { data } = await getAdapters();
    await data.post(`/finance/settlements/${settlementId}/confirm`);
    set({
      settlements: get().settlements.map(s =>
        s.id === settlementId
          ? { ...s, status: 'CONFIRMED' as const, confirmed_at: Date.now() }
          : s
      ),
    });
  },

  executeSplit: async (settlementId) => {
    const { data } = await getAdapters();
    await data.post(`/finance/settlements/${settlementId}/split`);
    set({
      settlements: get().settlements.map(s =>
        s.id === settlementId
          ? { ...s, status: 'SETTLED' as const, settled_at: Date.now() }
          : s
      ),
    });
  },
}));
