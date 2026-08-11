/**
 * useProjectStatusFilter — 项目状态过滤 composable（v3.1.37 新增）
 *
 * 用于在商城列表/推荐/搜索结果等场景，过滤掉 status=inactive 项目的商品/直播/门店等内容。
 * 统一封装过滤逻辑，避免各页面重复实现。
 *
 * 设计原则（BR-SHP-043 分层拦截 — Layer 1 数据层过滤）：
 *   - 项目禁用 = 软停用，数据保留，前端隐藏
 *   - inactive 项目的商品/直播/门店不出现在任何列表/推荐/搜索结果中
 *   - Pinia 响应式 + computed 自动重算，无需手动清理缓存
 */

import { useProjectStore } from '../stores/project-store';

export function useProjectStatusFilter() {
  const projectStore = useProjectStore();

  /**
   * 过滤掉 inactive 项目的内容
   * @param items 待过滤的列表（商品/直播/门店等）
   * @param projectIdField 项目ID字段名（默认 'project_id'）
   * @returns 过滤后的列表（仅包含 active 项目的内容）
   */
  function filterByActiveProject<T extends Record<string, any>>(
    items: T[],
    projectIdField = 'project_id'
  ): T[] {
    const activeIds = projectStore.activeProjectIds;
    return items.filter(it => activeIds.has(it[projectIdField]));
  }

  /**
   * 检查单个项目是否 active
   * @param projectId 项目ID
   * @returns true=active，false=inactive或不存在
   */
  function isProjectActive(projectId: string): boolean {
    return projectStore.isProjectActive(projectId);
  }

  /**
   * 过滤项目列表本身（仅返回 active 项目）
   * @param projects 项目列表
   * @returns 仅 status=active 的项目
   */
  function filterActiveProjects<T extends { status?: string }>(projects: T[]): T[] {
    return projects.filter(p => p.status === 'active');
  }

  return {
    filterByActiveProject,
    isProjectActive,
    filterActiveProjects,
  };
}
