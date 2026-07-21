/**
 * L1：单元测试 — sim Repository 层
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { getDB, seedInitialData } from '../../src/adapters/sim/db';
import type { IDBPDatabase } from 'idb';

describe('SimAdapter — IndexedDB', () => {
  let db: IDBPDatabase;

  beforeAll(async () => {
    db = await getDB();
    await seedInitialData();
  });

  describe('Customer Repository', () => {
    it('应返回全部种子客户（≥8个）', async () => {
      const customers = await db.getAll('customers');
      expect(customers.length).toBeGreaterThanOrEqual(8);
    });

    it('应能按标签筛选客户', async () => {
      const all: any[] = await db.getAll('customers');
      const tagged = all.filter(c => c.tags?.includes('VIP'));
      expect(tagged.length).toBeGreaterThanOrEqual(1);
    });

    it('应能按名称搜索', async () => {
      const all: any[] = await db.getAll('customers');
      const found = all.filter(c => c.name?.includes('张'));
      expect(found.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Communication Repository', () => {
    it('应返回种子沟通记录（≥4条）', async () => {
      const records = await db.getAll('communicationRecords');
      expect(records.length).toBeGreaterThanOrEqual(4);
    });

    it('每条沟通记录应有关联客户', async () => {
      const records: any[] = await db.getAll('communicationRecords');
      records.forEach(r => {
        expect(r.customerId).toBeTruthy();
        expect(r.customerName).toBeTruthy();
      });
    });
  });

  describe('Todo Repository', () => {
    it('应返回种子待办任务（≥5条）', async () => {
      const todos = await db.getAll('todos');
      expect(todos.length).toBeGreaterThanOrEqual(5);
    });

    it('应包含不同优先级的待办', async () => {
      const todos: any[] = await db.getAll('todos');
      const priorities = new Set(todos.map(t => t.priority));
      expect(priorities.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Tenant Repository', () => {
    it('应返回种子租户（≥4个）', async () => {
      const tenants = await db.getAll('tenants');
      expect(tenants.length).toBeGreaterThanOrEqual(4);
    });

    it('应包含不同状态的租户', async () => {
      const tenants: any[] = await db.getAll('tenants');
      const statuses = new Set(tenants.map(t => t.status));
      expect(statuses.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Subscription Repository', () => {
    it('应返回种子订单（≥3条）', async () => {
      const orders = await db.getAll('subscriptionOrders');
      expect(orders.length).toBeGreaterThanOrEqual(3);
    });
  });
});
