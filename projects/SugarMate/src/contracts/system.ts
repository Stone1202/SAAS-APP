/**
 * SugarMate 系统设置模块契约
 * 对应 PRD §13 系统设置 和 架构 API契约 §12
 */
import { z } from 'zod';
import { PaginationParams } from './common';

// === 角色定义 ===
export const RoleSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  is_system: z.boolean().default(false), // 系统内置角色不可删除
  user_count: z.number().default(0),
  created_at: z.number(),
  updated_at: z.number(),
});

// === 权限节点 ===
export const PermissionNodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  parent_code: z.string().optional(),
  module: z.string(),
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'REVIEW', 'APPROVE']),
  sort_order: z.number().default(0),
});

// === 创建/更新角色 ===
export const UpsertRoleRequest = z.object({
  id: z.string().optional(), // 更新时传
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(32),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

// === 系统配置项 ===
export const SystemConfigItemSchema = z.object({
  id: z.string(),
  config_key: z.string(), // 如 'order.timeout_hours', 'refund.max_days'
  config_value: z.string(),
  value_type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ENUM']),
  category: z.enum([
    'ORDER', 'REFUND', 'PAYMENT', 'NOTIFICATION',
    'CGM', 'CONSULTATION', 'SETTLEMENT', 'SECURITY', 'GENERAL',
  ]),
  description: z.string().optional(),
  enum_options: z.array(z.string()).optional(), // ENUM类型的可选项
  is_editable: z.boolean().default(true),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
  changed_by: z.string().optional(),
  changed_at: z.number().optional(),
  created_at: z.number(),
  updated_at: z.number(),
});

// === 更新配置 ===
export const UpdateConfigRequest = z.object({
  items: z.array(
    z.object({
      config_key: z.string(),
      config_value: z.string(),
    })
  ),
  reason: z.string().optional(),
});

// === 配置变更日志 ===
export const ConfigChangeLog = z.object({
  id: z.string(),
  config_key: z.string(),
  old_value: z.string(),
  new_value: z.string(),
  changed_by: z.string(),
  changed_at: z.number(),
  reason: z.string().optional(),
});

// === 类型导出 ===
export type Role = z.infer<typeof RoleSchema>;
export type PermissionNode = z.infer<typeof PermissionNodeSchema>;
export type UpsertRoleRequest = z.infer<typeof UpsertRoleRequest>;
export type SystemConfigItem = z.infer<typeof SystemConfigItemSchema>;
export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequest>;
export type ConfigChangeLog = z.infer<typeof ConfigChangeLog>;
