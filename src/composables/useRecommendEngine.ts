/**
 * useRecommendEngine — 场景化推荐引擎 composable（v3.1.31 重构）
 *
 * 设计目标：将推荐逻辑从页面（PlatformHome/MallPage）中抽离，
 * 统一封装"手动推荐 + 规则叠加排序 + 可见范围过滤"的标准流程。
 *
 * v3.1.31 重构：支持两种调用方式
 *   方式一（推荐）：通过 scenarioId 查找场景配置，再按场景的 rule_id 查找规则实体
 *   方式二（兼容）：直接传入 recommendConfigs（旧版接口，保留向后兼容）
 *
 * 核心能力：
 * 1. buildRecommendResult — 构建推荐结果（手动在前 + 规则补足）
 * 2. buildByScenario — 按场景ID构建推荐结果（v3.1.31 新增）
 * 3. getScenarioById — 按场景ID获取场景配置
 * 4. getRuleById — 按规则ID获取规则实体（v3.1.31 新增）
 * 5. getDimensionsForTarget — 按推荐目标类型获取可用维度
 */

import { computed } from 'vue';
import { sortByDimensions, getDimensionsByTarget } from '../contracts/recommend-dimensions';
import type {
  RecommendTargetType,
  RecommendItem,
  SortDimension,
  DimensionDef,
  RecommendRuleEntity,
} from '../contracts/recommend-engine';
import { useAppConfigStore } from '../stores/app-config-store';

/** 推荐引擎输入参数（兼容旧版） */
export interface RecommendEngineParams<T = any> {
  /** 推荐目标类型 */
  targetType: RecommendTargetType;
  /** 推荐配置列表（含手动推荐 + 默认规则，旧版兼容） */
  recommendConfigs: RecommendItem[];
  /** 全量数据源（直播/商品/项目列表） */
  allItems: T[];
  /** 目标ID字段名（默认 'live_id' / 'product_id' / 'project_id'） */
  idField?: string;
  /** 首页展示条数上限（精选Tab传 undefined 表示无上限） */
  displayLimit?: number;
  /** 数据过滤条件（如商品 status='on_sale'） */
  filter?: (item: T) => boolean;
  /** 是否排除已隐藏的（默认 false，由 useVisibilityFilter 处理） */
  visibleIds?: Set<string>;
  /**
   * v3.1.31 新增：规则ID
   * 传入此参数时，将忽略 recommendConfigs 中的规则推荐项，改用此规则实体
   */
  ruleId?: string;
}

/** 推荐结果项 */
export interface RecommendResultItem<T = any> {
  /** 推荐内容 */
  item: T;
  /** 来源：手动推荐 / 默认规则 */
  source: 'manual' | 'rule';
  /** 是否为兜底内容（loose 模式补足的平台内容） */
  is_fallback?: boolean;
}

/** 按场景构建的参数（v3.1.31 新增） */
export interface ScenarioBuildParams<T = any> {
  /** 场景ID */
  scenarioId: string;
  /** 全量数据源 */
  allItems: T[];
  /** 目标ID字段名（可选，自动推断） */
  idField?: string;
  /** 首页展示条数上限（精选Tab传 undefined 表示无上限，v3.1.34 默认从场景 display_limit 读取） */
  displayLimit?: number;
  /** 数据过滤条件 */
  filter?: (item: T) => boolean;
}

/**
 * 推荐引擎 composable
 */
export function useRecommendEngine() {
  const appConfig = useAppConfigStore();

  /**
   * 构建推荐结果（手动推荐 + 规则叠加排序 + 去重补足）
   *
   * v3.1.31 重构：
   *   - 优先使用 params.ruleId 查找规则实体
   *   - 兼容旧版：从 recommendConfigs 中查找 is_default 的规则项
   *
   * @param params 推荐引擎参数
   * @returns 推荐结果列表
   */
  function buildRecommendResult<T = any>(params: RecommendEngineParams<T>): RecommendResultItem<T>[] {
    const {
      targetType,
      recommendConfigs,
      allItems,
      displayLimit,
      filter,
      ruleId,
    } = params;

    const idField = params.idField || getDefaultIdField(targetType);
    const seen = new Set<string>();
    const result: RecommendResultItem<T>[] = [];
    const limit = displayLimit;

    // ── 第一步：手动推荐（按 sort_order 升序） ──
    const manualConfigs = recommendConfigs
      .filter(r => r.rec_type === 'manual' && r.status === 'active')
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    for (const r of manualConfigs) {
      if (limit !== undefined && result.length >= limit) break;
      if (!r.target_id || seen.has(r.target_id)) continue;
      const item = allItems.find(it => (it as any)[idField] === r.target_id);
      if (item && (!filter || filter(item))) {
        result.push({ item, source: 'manual' });
        seen.add(r.target_id);
      }
    }

    // ── 第二步：规则补足（多维度排序链） ──
    if (limit === undefined || result.length < limit) {
      // v3.1.31：优先使用 ruleId 查找规则实体
      let dims: SortDimension[] = [];
      if (ruleId) {
        const ruleEntity = appConfig.getRuleById(ruleId);
        if (ruleEntity && ruleEntity.status === 'active') {
          dims = (ruleEntity.rule?.sort_dimensions || []) as SortDimension[];
        }
      } else {
        // 兼容旧版：从 recommendConfigs 中查找默认规则
        const ruleConfig = recommendConfigs.find(r => r.rec_type === 'rule' && r.is_default === true) ||
                           recommendConfigs.find(r => r.rec_type === 'rule');
        dims = (ruleConfig?.rule?.sort_dimensions || []) as SortDimension[];
      }

      const candidatesSource = allItems.filter(it => {
        const id = (it as any)[idField];
        if (seen.has(id)) return false;
        if (filter && !filter(it)) return false;
        return true;
      });
      // 通用排序（委托维度注册表）
      const sortedCandidates = dims.length
        ? sortByDimensions(candidatesSource, dims)
        : candidatesSource;

      for (const item of sortedCandidates) {
        if (limit !== undefined && result.length >= limit) break;
        const id = (item as any)[idField];
        if (seen.has(id)) continue;
        result.push({ item, source: 'rule' });
        seen.add(id);
      }
    }

    return result;
  }

  /**
   * 按场景ID构建推荐结果（v3.1.31 新增）
   *
   * 场景的 recommend_configs 包含手动推荐，rule_id 引用规则实体
   * 此方法封装了"按场景查找配置 + 按rule_id查找规则"的标准流程
   *
   * v3.1.34 调整：展示条数 display_limit 改为从场景读取（scenario.display_limit）
   *              规则实体不再含 display_limit。首页推荐区场景 display_limit=6，
   *              商城精选Tab场景 display_limit=undefined（无上限）。
   *
   * @param params 场景构建参数
   * @returns 推荐结果列表
   */
  function buildByScenario<T = any>(params: ScenarioBuildParams<T>): RecommendResultItem<T>[] {
    const scenario = appConfig.recommendScenarios.find(s => s.scenario_id === params.scenarioId);
    if (!scenario) {
      console.warn(`[useRecommendEngine] 场景不存在: ${params.scenarioId}`);
      return [];
    }

    // v3.1.34：优先使用显式传入的 displayLimit，其次从场景 display_limit 读取
    // 规则实体不再含 display_limit 字段
    const effectiveLimit = params.displayLimit !== undefined
      ? params.displayLimit
      : scenario.display_limit;

    return buildRecommendResult<T>({
      targetType: scenario.target_type,
      recommendConfigs: scenario.recommend_configs || [],
      allItems: params.allItems,
      idField: params.idField,
      displayLimit: effectiveLimit,
      filter: params.filter,
      ruleId: scenario.rule_id, // v3.1.31：传入规则ID
    });
  }

  /** 获取推荐结果（简化版，仅返回 item 数组） */
  function getRecommendItems<T = any>(params: RecommendEngineParams<T>): T[] {
    return buildRecommendResult<T>(params).map(r => r.item);
  }

  /** 按场景获取推荐结果（简化版，v3.1.31） */
  function getItemsByScenario<T = any>(params: ScenarioBuildParams<T>): T[] {
    return buildByScenario<T>(params).map(r => r.item);
  }

  /** 按推荐目标类型获取可用维度列表 */
  function getDimensionsForTarget(targetType: RecommendTargetType): DimensionDef[] {
    return getDimensionsByTarget(targetType);
  }

  /** 按场景ID获取场景配置 */
  function getScenarioById(scenarioId: string) {
    return appConfig.recommendScenarios.find(s => s.scenario_id === scenarioId);
  }

  /** 按规则ID获取规则实体（v3.1.31 新增） */
  function getRuleById(ruleId: string): RecommendRuleEntity | undefined {
    return appConfig.getRuleById(ruleId);
  }

  return {
    buildRecommendResult,
    buildByScenario,
    getRecommendItems,
    getItemsByScenario,
    getDimensionsForTarget,
    getScenarioById,
    getRuleById,
  };
}

/** 根据推荐目标类型获取默认ID字段名 */
function getDefaultIdField(targetType: RecommendTargetType): string {
  switch (targetType) {
    case 'live': return 'live_id';
    case 'product': return 'product_id';
    case 'project': return 'project_id';
    default: return 'id';
  }
}
