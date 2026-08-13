/**
 * 五维可插拔适配器工厂
 * 通过环境变量控制 sim/real 切换
 */
import { getDB, seedInitialData } from './sim/db';

const MODE = (import.meta.env.VITE_MODE || 'sim') as 'sim' | 'real';

// 模块级覆盖
function getModeOverride(module: string): 'sim' | 'real' | null {
  const override = (import.meta.env as any)[`VITE_MODE_OVERRIDE_${module.toUpperCase()}`];
  return override || null;
}

export function getMode(module: string): 'sim' | 'real' {
  return getModeOverride(module) || MODE;
}

let initialized = false;

export async function initializeSim() {
  if (initialized) return;
  await seedInitialData();
  initialized = true;
}

// ============================================
// 通用 CRUD 辅助
// ============================================
function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================
// Customer Repository
// ============================================
export const customerRepository = {
  async getAll(filters?: { search?: string; tags?: string[] }) {
    await initializeSim();
    const db = await getDB();
    let customers = await db.getAll('customers');

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.phone?.toLowerCase().includes(s) ||
        c.company?.toLowerCase().includes(s)
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      customers = customers.filter(c =>
        filters.tags!.some(t => c.tags?.includes(t))
      );
    }

    return customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string) {
    await initializeSim();
    const db = await getDB();
    return db.get('customers', id);
  },

  async create(data: any) {
    await initializeSim();
    const db = await getDB();
    const now = new Date().toISOString();
    const customer = { ...data, id: genId(), createdAt: now, updatedAt: now };
    await db.put('customers', customer);
    return customer;
  },

  async update(id: string, data: any) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('customers', id);
    if (!existing) throw new Error('Customer not found');
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await db.put('customers', updated);
    return updated;
  },

  async delete(id: string) {
    await initializeSim();
    const db = await getDB();
    await db.delete('customers', id);
  },
};

// ============================================
// Tag Repository
// ============================================
export const tagRepository = {
  async getAllGroups() {
    await initializeSim();
    const db = await getDB();
    return db.getAll('tagGroups');
  },

  async getAllTags() {
    await initializeSim();
    const db = await getDB();
    return db.getAll('tags');
  },

  async createGroup(data: any) {
    await initializeSim();
    const db = await getDB();
    const group = { ...data, id: genId(), createdAt: new Date().toISOString() };
    await db.put('tagGroups', group);
    return group;
  },

  async createTag(data: any) {
    await initializeSim();
    const db = await getDB();
    const tag = { ...data, id: genId(), createdAt: new Date().toISOString() };
    await db.put('tags', tag);
    return tag;
  },

  async deleteTag(id: string) {
    await initializeSim();
    const db = await getDB();
    await db.delete('tags', id);
  },
};

// ============================================
// Communication Repository
// ============================================
export const communicationRepository = {
  async getAll() {
    await initializeSim();
    const db = await getDB();
    const records = await db.getAll('communicationRecords');
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getByCustomerId(customerId: string) {
    await initializeSim();
    const db = await getDB();
    const index = db.transaction('communicationRecords').store.index('customerId');
    const records = await index.getAll(customerId);
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string) {
    await initializeSim();
    const db = await getDB();
    return db.get('communicationRecords', id);
  },

  async create(data: any) {
    await initializeSim();
    const db = await getDB();
    const record = { ...data, id: genId() };
    await db.put('communicationRecords', record);
    return record;
  },
};

// ============================================
// Script Repository
// ============================================
export const scriptRepository = {
  async getAll() {
    await initializeSim();
    const db = await getDB();
    return db.getAll('scripts');
  },

  async create(data: any) {
    await initializeSim();
    const db = await getDB();
    const now = new Date().toISOString();
    const script = { ...data, id: genId(), usageCount: 0, createdAt: now, updatedAt: now };
    await db.put('scripts', script);
    return script;
  },

  async update(id: string, data: any) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('scripts', id);
    if (!existing) throw new Error('Script not found');
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await db.put('scripts', updated);
    return updated;
  },

  async incrementUsage(id: string) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('scripts', id);
    if (!existing) throw new Error('Script not found');
    existing.usageCount = (existing.usageCount || 0) + 1;
    await db.put('scripts', existing);
    return existing;
  },
};

// ============================================
// Todo Repository
// ============================================
export const todoRepository = {
  async getAll(filters?: { status?: string; type?: string }) {
    await initializeSim();
    const db = await getDB();
    let todos = await db.getAll('todos');

    if (filters?.status) {
      todos = todos.filter(t => t.status === filters.status);
    }
    if (filters?.type) {
      todos = todos.filter(t => t.type === filters.type);
    }

    // 按优先级排序：P0 > P1 > P2，同优先级按截止日期
    const priorityOrder = { P0: 0, P1: 1, P2: 2 };
    return todos.sort((a, b) => {
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99;
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  },

  async complete(id: string) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('todos', id);
    if (!existing) throw new Error('Todo not found');
    existing.status = 'completed';
    await db.put('todos', existing);
    return existing;
  },

  async create(data: any) {
    await initializeSim();
    const db = await getDB();
    const todo = { ...data, id: genId(), createdAt: new Date().toISOString() };
    await db.put('todos', todo);
    return todo;
  },
};

// ============================================
// Segment Repository
// ============================================
export const segmentRepository = {
  async getAll() {
    await initializeSim();
    const db = await getDB();
    return db.getAll('segments');
  },

  async create(data: any) {
    await initializeSim();
    const db = await getDB();
    const now = new Date().toISOString();
    const segment = { ...data, id: genId(), createdAt: now, updatedAt: now };
    await db.put('segments', segment);
    return segment;
  },
};

// ============================================
// Tenant Repository (运营后台)
// ============================================
function normalizeTenant(t: any) {
  // 兼容旧数据：未设置 enabled 时根据状态推断，默认启用
  if (typeof t.enabled !== 'boolean') {
    t.enabled = t.status === 'ACTIVE' || t.status === 'TRIAL' || t.status === 'GRACE';
  }
  return t;
}

export const tenantRepository = {
  async getAll(filters?: { status?: string; version?: string; industry?: string; enabled?: boolean; search?: string; searchField?: string }) {
    await initializeSim();
    const db = await getDB();
    let tenants = (await db.getAll('tenants')).map(normalizeTenant);

    if (filters?.status) tenants = tenants.filter(t => t.status === filters.status);
    if (filters?.version) tenants = tenants.filter(t => t.version === filters.version);
    if (filters?.industry) tenants = tenants.filter(t => t.industry === filters.industry);
    if (typeof filters?.enabled === 'boolean') tenants = tenants.filter(t => t.enabled === filters.enabled);

    if (filters?.search) {
      const s = filters.search.trim().toLowerCase();
      const field = filters.searchField || 'all';
      tenants = tenants.filter(t => {
        if (field === 'id' || field === 'all') {
          if (t.id?.toLowerCase().includes(s)) return true;
        }
        if (field === 'companyName' || field === 'all') {
          if (t.companyName?.toLowerCase().includes(s)) return true;
        }
        if (field === 'contactPhone' || field === 'all') {
          if (t.contactPhone?.toLowerCase().includes(s)) return true;
        }
        return false;
      });
    }

    return tenants.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  },

  async getById(id: string) {
    await initializeSim();
    const db = await getDB();
    const t = await db.get('tenants', id);
    return t ? normalizeTenant(t) : undefined;
  },

  async update(id: string, data: Partial<any>) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('tenants', id);
    if (!existing) throw new Error('Tenant not found');
    const updated = { ...normalizeTenant(existing), ...data, updatedAt: new Date().toISOString() };
    await db.put('tenants', updated);
    return updated;
  },

  async toggleEnabled(id: string) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('tenants', id);
    if (!existing) throw new Error('Tenant not found');
    const next = !normalizeTenant(existing).enabled;
    const updated = { ...existing, enabled: next, status: next ? 'ACTIVE' : 'SUSPENDED', updatedAt: new Date().toISOString() };
    await db.put('tenants', updated);
    return updated;
  },

  async approve(id: string, data: { version: string; trialDays: number; notes?: string }) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('tenants', id);
    if (!existing) throw new Error('Tenant not found');
    existing.status = 'TRIAL';
    existing.version = data.version;
    existing.enabled = true;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + data.trialDays);
    existing.expireDate = trialEnd.toISOString().slice(0, 10);
    await db.put('tenants', existing);
    return existing;
  },

  async reject(id: string, reason: string) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('tenants', id);
    if (!existing) throw new Error('Tenant not found');
    existing.status = 'CLOSED';
    existing.enabled = false;
    await db.put('tenants', existing);
    return existing;
  },
};

// ============================================
// Version Feature Repository
// ============================================
export const versionFeatureRepository = {
  async getAll() {
    await initializeSim();
    const db = await getDB();
    return db.getAll('versionFeatures');
  },

  async update(feature: string, versions: Record<string, string>) {
    await initializeSim();
    const db = await getDB();
    await db.put('versionFeatures', { feature, versions });
  },
};

// ============================================
// Subscription Order Repository
// ============================================
export const subscriptionOrderRepository = {
  async getAll() {
    await initializeSim();
    const db = await getDB();
    const orders = await db.getAll('subscriptionOrders');
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string) {
    await initializeSim();
    const db = await getDB();
    return db.get('subscriptionOrders', id);
  },

  async approveRefund(id: string, adjustedAmount?: number) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('subscriptionOrders', id);
    if (!existing) throw new Error('Order not found');
    existing.status = 'refunded';
    if (adjustedAmount !== undefined) existing.refundAmount = adjustedAmount;
    await db.put('subscriptionOrders', existing);
    return existing;
  },

  async rejectRefund(id: string) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('subscriptionOrders', id);
    if (!existing) throw new Error('Order not found');
    existing.status = 'paid';
    await db.put('subscriptionOrders', existing);
    return existing;
  },
};

// ============================================
// WeChat Account Repository
// ============================================
export const weChatRepository = {
  async getAll() {
    await initializeSim();
    const db = await getDB();
    return db.getAll('wechatAccounts');
  },

  async authorize(data: { corpId: string; corpName: string; corpSecret: string }) {
    await initializeSim();
    const db = await getDB();
    const now = new Date().toISOString();
    const account = {
      id: genId(),
      corpId: data.corpId,
      corpName: data.corpName,
      corpSecretEnc: '[encrypted]',
      employeeCount: Math.floor(Math.random() * 50) + 5,
      customerCount: Math.floor(Math.random() * 500),
      groupCount: Math.floor(Math.random() * 20),
      syncStatus: 'AUTHORIZED' as const,
      syncAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await db.put('wechatAccounts', account);
    return account;
  },

  async reSync(id: string) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('wechatAccounts', id);
    if (!existing) throw new Error('WeChat account not found');
    const now = new Date().toISOString();
    existing.syncStatus = 'SYNCING';
    await db.put('wechatAccounts', existing);
    await new Promise((r) => setTimeout(r, 500));
    existing.syncStatus = 'AUTHORIZED';
    existing.syncAt = now;
    existing.updatedAt = now;
    existing.employeeCount = Math.floor(Math.random() * 50) + 5;
    existing.customerCount = Math.floor(Math.random() * 500);
    existing.groupCount = Math.floor(Math.random() * 20);
    await db.put('wechatAccounts', existing);
    return existing;
  },

  async revoke(id: string) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('wechatAccounts', id);
    if (!existing) throw new Error('WeChat account not found');
    existing.syncStatus = 'REVOKED';
    existing.updatedAt = new Date().toISOString();
    await db.put('wechatAccounts', existing);
    return existing;
  },
};

// ============================================
// AI Script Suggestion Repository
// ============================================
export const aiScriptSuggestionRepository = {
  async getAll() {
    await initializeSim();
    const db = await getDB();
    return db.getAll('aiScriptSuggestions');
  },

  async adopt(id: string) {
    await initializeSim();
    const db = await getDB();
    const existing = await db.get('aiScriptSuggestions', id);
    if (!existing) throw new Error('Suggestion not found');
    existing.adopted = true;
    await db.put('aiScriptSuggestions', existing);
    return existing;
  },
};

// ============================================
// Dashboard Stats
// ============================================
export async function getTenantDashboardStats() {
  await initializeSim();
  const db = await getDB();
  const customers = await db.count('customers');
  const allTodos = await db.getAll('todos');
  const allRecords = await db.getAll('communicationRecords');

  const today = new Date().toISOString().slice(0, 10);

  return {
    todayTodos: allTodos.filter(t => t.status === 'pending' && t.dueDate?.startsWith(today)).length,
    todayCommunications: allRecords.filter(r => r.createdAt.startsWith(today)).length,
    newCustomersThisWeek: 3,
    followUpCompletionRate: 80,
    totalCommunications: allRecords.length,
    aiAssistPercent: 42,
    avgSatisfaction: 4.2,
  };
}

export async function getOpsDashboardStats() {
  await initializeSim();
  const db = await getDB();
  const tenants = await db.getAll('tenants');
  const orders = await db.getAll('subscriptionOrders');

  return {
    totalTenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === 'ACTIVE').length,
    trialTenants: tenants.filter(t => t.status === 'TRIAL').length,
    newTenantsThisMonth: 23,
    mrr: 128000,
    arr: 1500000,
    arpu: 358,
    renewalRate: 92,
    pendingApprovals: {
      tenantReviews: tenants.filter(t => t.status === 'PENDING').length,
      refundApprovals: orders.filter(o => o.status === 'refunding').length,
      thresholdAlerts: 1,
    },
  };
}
