/**
 * SugarMate 数据分析模块契约
 * 对应 PRD §10 数据分析 和 架构 API契约 §10
 */
import { z } from 'zod';
import { PaginationParams, PaginationMeta } from './common';

// === 经营看板指标 ===
export const BizMetricSchema = z.object({
  id: z.string(),
  metric_key: z.enum([
    'DAILY_GMV', 'DAILY_ORDERS', 'DAILY_USERS',
    'CONVERSION_RATE', 'AVG_ORDER_VALUE', 'REPURCHASE_RATE',
    'ACTIVE_MERCHANTS', 'NEW_PATIENTS', 'CGM_BINDING_RATE',
  ]),
  value: z.number(),
  unit: z.enum(['CNY', 'COUNT', 'PERCENT', 'RATIO']),
  compare_prev_period: z.number(), // 环比变化率 -1.0~+1.0
  compare_target: z.number(), // 与目标差异率
  trend: z.enum(['UP', 'DOWN', 'STABLE']),
  period: z.enum(['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'CUSTOM']),
  updated_at: z.number(),
});

// === 看板数据查询参数 ===
export const DashboardQueryParams = PaginationParams.extend({
  period: z.enum(['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'CUSTOM']).default('TODAY'),
  start_date: z.number().optional(),
  end_date: z.number().optional(),
  merchant_id: z.string().optional(),
  terminal: z.enum(['MP', 'APP', 'LIVE', 'PC', 'ALL']).default('ALL'),
});

// === 看板数据响应 ===
export const DashboardResponse = z.object({
  metrics: z.array(BizMetricSchema),
  summary: z.object({
    total_gmv: z.number(),
    total_orders: z.number(),
    active_users: z.number(),
    conversion: z.number(),
  }),
  period_label: z.string(),
  pagination: PaginationMeta.optional(),
});

// === 图表数据点 ===
export const ChartDataPoint = z.object({
  timestamp: z.number(),
  label: z.string(),
  value: z.number(),
  dimension: z.string().optional(),
});

// === 趋势图查询 ===
export const TrendQueryParams = z.object({
  metric_key: z.string(),
  period: z.enum(['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_QUARTER', 'THIS_YEAR']),
  granularity: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']).default('DAY'),
  merchant_id: z.string().optional(),
});

// === 趋势图响应 ===
export const TrendResponse = z.object({
  metric_key: z.string(),
  metric_label: z.string(),
  unit: z.string(),
  data_points: z.array(ChartDataPoint),
  granularity: z.string(),
});

// === 类型导出 ===
export type BizMetric = z.infer<typeof BizMetricSchema>;
export type DashboardQueryParams = z.infer<typeof DashboardQueryParams>;
export type DashboardResponse = z.infer<typeof DashboardResponse>;
export type ChartDataPoint = z.infer<typeof ChartDataPoint>;
export type TrendQueryParams = z.infer<typeof TrendQueryParams>;
export type TrendResponse = z.infer<typeof TrendResponse>;
