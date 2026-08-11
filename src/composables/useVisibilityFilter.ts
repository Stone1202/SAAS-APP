/**
 * useVisibilityFilter — 可见范围过滤 composable（v3.1.30）
 *
 * 设计目标：根据用户已绑定项目，过滤推荐内容的数据源范围。
 *
 * 两种模式：
 *   - all          ：平台全量（不按用户绑定项目过滤）
 *   - bound_projects：仅用户已绑定项目的内容，不足时按兜底策略补足
 *
 * 兜底策略：
 *   - strict  ：仅展示绑定项目内容，不补足（内容少就少）
 *   - loose   ：不足时补足平台内容，并标记 is_fallback + fallback_label
 *   - global  ：直接展示平台全量（等同 all 模式）
 *
 * 使用示例：
 *   const { filterByVisibility } = useVisibilityFilter();
 *   const visibleLives = filterByVisibility({
 *     items: projectStore.liveRooms,
 *     boundProjectIds: userStore.boundProjectIds,
 *     mode: 'bound_projects',
 *     fallback: { mode: 'loose', mode_description: '不足补足', fallback_label: '平台精选' },
 *   });
 */

import type {
  VisibilityMode,
  FallbackConfig,
  VisibilityConfig,
} from '../contracts/recommend-engine';

/** 可见范围过滤参数 */
export interface VisibilityFilterParams<T = any> {
  /** 全量数据 */
  items: T[];
  /** 用户已绑定的项目ID列表 */
  boundProjectIds: string[];
  /** 可见范围模式 */
  mode: VisibilityMode;
  /** 兜底策略（mode=bound_projects 时有效） */
  fallback?: FallbackConfig;
  /** 最少展示条数（兜底触发阈值，默认 0 表示不强制补足） */
  minCount?: number;
  /** 项目ID字段名（默认 'project_id'） */
  projectIdField?: string;
}

/** 可见范围过滤结果项 */
export interface VisibilityFilterResult<T = any> {
  /** 过滤后的数据 */
  items: T[];
  /** 每条数据的来源标记 */
  tags: Array<{
    item: T;
    /** 来源：bound=绑定项目 / fallback=兜底补足 / all=全量 */
    source: 'bound' | 'fallback' | 'all';
    /** 兜底标签（仅 fallback 时有值） */
    fallback_label?: string;
  }>;
  /** 是否触发了兜底 */
  has_fallback: boolean;
}

/**
 * 可见范围过滤 composable
 */
export function useVisibilityFilter() {
  /**
   * 按可见范围过滤数据
   */
  function filterByVisibility<T = any>(params: VisibilityFilterParams<T>): VisibilityFilterResult<T> {
    const {
      items,
      boundProjectIds,
      mode,
      fallback,
      minCount = 0,
      projectIdField = 'project_id',
    } = params;

    // all 模式：全量返回
    if (mode === 'all') {
      return {
        items,
        tags: items.map(item => ({ item, source: 'all' as const })),
        has_fallback: false,
      };
    }

    // bound_projects 模式
    const boundSet = new Set(boundProjectIds);
    const boundItems = items.filter(it => boundSet.has((it as any)[projectIdField]));
    const tags: VisibilityFilterResult<T>['tags'] = boundItems.map(item => ({
      item,
      source: 'bound' as const,
    }));

    // 无兜底配置或 strict 模式：仅返回绑定内容
    if (!fallback || fallback.mode === 'strict') {
      return { items: boundItems, tags, has_fallback: false };
    }

    // global 模式：直接全量
    if (fallback.mode === 'global') {
      return {
        items,
        tags: items.map(item => ({ item, source: 'all' as const })),
        has_fallback: false,
      };
    }

    // loose 模式：不足时补足
    if (boundItems.length < minCount) {
      const boundIds = new Set(boundItems.map(it => it));
      const fallbackItems = items.filter(it => !boundIds.has(it) && !boundSet.has((it as any)[projectIdField]));
      const need = minCount - boundItems.length;
      const supplement = fallbackItems.slice(0, need);
      return {
        items: [...boundItems, ...supplement],
        tags: [
          ...tags,
          ...supplement.map(item => ({
            item,
            source: 'fallback' as const,
            fallback_label: fallback.fallback_label || '平台精选',
          })),
        ],
        has_fallback: supplement.length > 0,
      };
    }

    return { items: boundItems, tags, has_fallback: false };
  }

  /**
   * 构建默认可见范围配置
   */
  function buildVisibilityConfig(mode: VisibilityMode, fallbackMode?: 'strict' | 'loose' | 'global'): VisibilityConfig {
    return {
      mode,
      fallback: {
        mode: fallbackMode || 'loose',
        mode_description: fallbackMode === 'strict' ? '仅展示绑定项目内容' :
                          fallbackMode === 'global' ? '展示平台全量' :
                          '不足时补足平台内容',
        fallback_label: '平台精选',
      },
    };
  }

  return {
    filterByVisibility,
    buildVisibilityConfig,
  };
}
