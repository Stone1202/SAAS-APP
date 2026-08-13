/**
 * L2：浏览器测试 — AI-SCRM 冒烟测试
 */
import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5176';

async function checkPage(path: string): Promise<number> {
  const res = await fetch(`${BASE}${path}`);
  return res.status;
}

describe('L2 浏览器冒烟测试', () => {
  it('开发服务器可访问', async () => {
    const res = await fetch(BASE);
    expect(res.status).toBe(200);
  });

  // 租户后台核心页面
  it('租户工作台 /tenant/workbench', async () => {
    expect(await checkPage('/tenant/workbench')).toBe(200);
  });

  it('客户列表 /tenant/customers', async () => {
    expect(await checkPage('/tenant/customers')).toBe(200);
  });

  it('标签管理 /tenant/tags', async () => {
    expect(await checkPage('/tenant/tags')).toBe(200);
  });

  it('统一沟通 /tenant/communication', async () => {
    expect(await checkPage('/tenant/communication')).toBe(200);
  });

  it('沟通记录 /tenant/communication-records', async () => {
    expect(await checkPage('/tenant/communication-records')).toBe(200);
  });

  it('话术库 /tenant/scripts', async () => {
    expect(await checkPage('/tenant/scripts')).toBe(200);
  });

  it('待办中心 /tenant/todos', async () => {
    expect(await checkPage('/tenant/todos')).toBe(200);
  });

  it('跟近日历 /tenant/calendar', async () => {
    expect(await checkPage('/tenant/calendar')).toBe(200);
  });

  it('客户360 /tenant/customer-360', async () => {
    expect(await checkPage('/tenant/customer-360')).toBe(200);
  });

  it('客户分群 /tenant/segmentation', async () => {
    expect(await checkPage('/tenant/segmentation')).toBe(200);
  });

  it('沟通分析看板 /tenant/analytics', async () => {
    expect(await checkPage('/tenant/analytics')).toBe(200);
  });

  it('转化漏斗 /tenant/funnel', async () => {
    expect(await checkPage('/tenant/funnel')).toBe(200);
  });

  it('系统设置 /tenant/settings', async () => {
    expect(await checkPage('/tenant/settings')).toBe(200);
  });

  // 运营后台
  it('运营工作台 /ops/workbench', async () => {
    expect(await checkPage('/ops/workbench')).toBe(200);
  });

  it('租户管理 /ops/tenants', async () => {
    expect(await checkPage('/ops/tenants')).toBe(200);
  });

  it('版本矩阵 /ops/version-matrix', async () => {
    expect(await checkPage('/ops/version-matrix')).toBe(200);
  });

  it('订阅订单 /ops/subscription-orders', async () => {
    expect(await checkPage('/ops/subscription-orders')).toBe(200);
  });

  it('AI用量 /ops/ai-usage', async () => {
    expect(await checkPage('/ops/ai-usage')).toBe(200);
  });

  it('营收分析 /ops/revenue', async () => {
    expect(await checkPage('/ops/revenue')).toBe(200);
  });
});
