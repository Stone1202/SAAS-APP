/**
 * Schema层 — 可复用Schema片段
 * 抽离 contracts/ 中重复定义的基础类型
 */
import { z } from 'zod';

// 手机号
export const PhoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号');

// 身份证号
export const IDCardSchema = z.string().regex(/^\d{17}[\dXx]$/, '请输入有效的身份证号');

// 金额（分）→ 元转换
export const MoneySchema = z.number().min(0, '金额不能为负');

// 百分比 (0~100)
export const PercentSchema = z.number().min(0).max(100);

// 正向整数
export const PositiveIntSchema = z.number().int().positive();

// 邮箱
export const EmailSchema = z.string().email('请输入有效的邮箱地址');

// 时间戳（秒）
export const TimestampSchema = z.number().int().positive();

// 排序参数
export const SortParams = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type SortParams = z.infer<typeof SortParams>;
