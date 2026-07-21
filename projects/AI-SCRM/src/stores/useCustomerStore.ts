import { create } from 'zustand';
import { customerService } from '../services/tenant-service';
import type { Customer } from '../contracts/schemas';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  loadAll: (filters?: { search?: string; tags?: string[] }) => Promise<void>;
  getById: (id: string) => Promise<Customer | undefined>;
  create: (data: any) => Promise<Customer>;
  update: (id: string, data: any) => Promise<Customer>;
  remove: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loading: false,
  error: null,

  loadAll: async (filters) => {
    set({ loading: true, error: null });
    try {
      const customers = await customerService.getAll(filters);
      set({ customers, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  getById: async (id) => {
    try {
      return await customerService.getById(id);
    } catch (e: any) {
      set({ error: e.message });
      return undefined;
    }
  },

  create: async (data) => {
    const customer = await customerService.create(data);
    set((s) => ({ customers: [customer, ...s.customers] }));
    return customer;
  },

  update: async (id, data) => {
    const updated = await customerService.update(id, data);
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  remove: async (id) => {
    await customerService.delete(id);
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
  },
}));
