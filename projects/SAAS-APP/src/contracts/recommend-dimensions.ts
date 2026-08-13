/**
 * 推荐维度注册表 — 全局维度定义
 *
 * 设计目标：将直播/商品/项目的所有排序维度统一注册，
 * 替代原分散在 LiveRecommendManage.vue / ProductRecommendManage.vue 中的 LIVE_DIM_DEFS / PRODUCT_DIM_DEFS。
 *
 * 维度类型 dim_type 由联合类型改为 string，运行时由注册表校验合法性。
 *
 * 版本：v3.1.30 引入
 */

import type {
  DimensionDef,
  DimensionOption,
  SortDimension,
  RecommendTargetType,
} from './recommend-engine';

// ============================================
// 工具函数
// ============================================

/** 直播状态固定优先级（数字越小越靠前） */
const LIVE_STATUS_PRIORITY: Record<string, number> = {
  live: 0,
  upcoming: 1,
  replay: 2,
  ended: 3,
};

/** 离散多选维度比较：选中值按 selected_values 顺序排前，未选中排后 */
function compareDiscreteMulti(va: string, vb: string, selected: string[]): number {
  const ia = selected.indexOf(va);
  const ib = selected.indexOf(vb);
  if (ia === -1 && ib === -1) return 0;
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

/** 固定优先级维度比较 */
function compareFixedPriority(va: string, vb: string, priorityMap: Record<string, number>): number {
  return (priorityMap[va] ?? 99) - (priorityMap[vb] ?? 99);
}

/** 连续数值维度比较 */
function compareContinuous(va: number, vb: number, dim: SortDimension): number {
  return dim.direction === 'desc' ? (vb || 0) - (va || 0) : (va || 0) - (vb || 0);
}

/** 连续时间维度比较 */
function compareTime(va: string, vb: string, dim: SortDimension): number {
  const ta = new Date(va || 0).getTime();
  const tb = new Date(vb || 0).getTime();
  return dim.direction === 'desc' ? tb - ta : ta - tb;
}

// ============================================
// 维度定义
// ============================================

/** 按项目维度（商品/直播/项目通用，多选） */
const DIM_PROJECT: DimensionDef = {
  dim_type: 'project',
  label: '按项目',
  value_type: 'discrete_multi',
  target_types: ['product', 'live', 'project'],
  placeholder: '选择项目（可多选）',
  options: [], // 运行时由 projectStore.projects 动态填充
  getValue: (item: any) => item.project_id,
  compare: (va, vb, dim) => compareDiscreteMulti(va || '', vb || '', dim.selected_values),
};

/** 按主播类型维度（仅直播，多选） */
const ANCHOR_TYPE_OPTIONS: DimensionOption[] = [
  { value: 'headquarters', label: '总部主播' },
  { value: 'store', label: '门店主播' },
  { value: 'supplier', label: '供应商主播' },
  { value: 'personal', label: '个人主播' },
];

const DIM_ANCHOR_TYPE: DimensionDef = {
  dim_type: 'anchor_type',
  label: '按主播类型',
  value_type: 'discrete_multi',
  target_types: ['live'],
  options: ANCHOR_TYPE_OPTIONS,
  placeholder: '选择主播类型（可多选）',
  getValue: (item: any) => item.anchor_type,
  compare: (va, vb, dim) => compareDiscreteMulti(va || '', vb || '', dim.selected_values),
};

/** 按直播状态维度（仅直播，固定优先级） */
const DIM_LIVE_STATUS: DimensionDef = {
  dim_type: 'status',
  label: '按直播状态',
  value_type: 'discrete_fixed',
  target_types: ['live'],
  fixedPriority: LIVE_STATUS_PRIORITY,
  getValue: (item: any) => item.status,
  compare: (va, vb, _dim) => compareFixedPriority(va, vb, LIVE_STATUS_PRIORITY),
};

/** 按观看人数维度（仅直播，连续） */
const DIM_VIEWER_COUNT: DimensionDef = {
  dim_type: 'viewer_count',
  label: '按观看人数',
  value_type: 'continuous',
  target_types: ['live'],
  getValue: (item: any) => item.viewer_count,
  compare: (va, vb, dim) => compareContinuous(Number(va), Number(vb), dim),
};

/**
 * 按直播开始时间维度（仅直播，连续时间）
 * v3.1.36 新增：供规则引擎和默认规则使用
 */
const DIM_LIVE_STARTED_AT: DimensionDef = {
  dim_type: 'started_at',
  label: '按直播开始时间',
  value_type: 'continuous',
  target_types: ['live'],
  getValue: (item: any) => item.started_at,
  compare: (va, vb, dim) => compareTime(va, vb, dim),
};

/** 按商品类目维度（仅商品，多选） */
const DIM_CATEGORY: DimensionDef = {
  dim_type: 'category',
  label: '按商品类目',
  value_type: 'discrete_multi',
  target_types: ['product'],
  options: [], // 运行时由商品数据动态提取
  placeholder: '选择类目（可多选）',
  getValue: (item: any) => item.category,
  compare: (va, vb, dim) => compareDiscreteMulti(va || '', vb || '', dim.selected_values),
};

/** 按销量维度（仅商品，连续） */
const DIM_SALES: DimensionDef = {
  dim_type: 'sales',
  label: '按销量',
  value_type: 'continuous',
  target_types: ['product'],
  getValue: (item: any) => item.sales,
  compare: (va, vb, dim) => compareContinuous(Number(va), Number(vb), dim),
};

/** 按上架时间维度（仅商品，连续） */
const DIM_CREATED_AT: DimensionDef = {
  dim_type: 'created_at',
  label: '按上架时间',
  value_type: 'continuous',
  target_types: ['product'],
  getValue: (item: any) => item.created_at,
  compare: (va, vb, dim) => compareTime(va, vb, dim),
};

/** 按行业维度（仅项目推荐，多选） */
const INDUSTRY_OPTIONS: DimensionOption[] = [
  { value: 'daily_necessities', label: '日用品' },
  { value: 'health_products', label: '保健品' },
  { value: 'food_beverage', label: '食品饮料' },
  { value: 'home_appliance', label: '家居家电' },
  { value: 'beauty_care', label: '美妆个护' },
];

const DIM_INDUSTRY: DimensionDef = {
  dim_type: 'industry',
  label: '按行业',
  value_type: 'discrete_multi',
  target_types: ['project'],
  options: INDUSTRY_OPTIONS,
  placeholder: '选择行业（可多选）',
  getValue: (item: any) => item.industry,
  compare: (va, vb, dim) => compareDiscreteMulti(va || '', vb || '', dim.selected_values),
};

/** 按项目品类维度（仅项目推荐，多选） */
const PROJECT_CATEGORY_OPTIONS: DimensionOption[] = [
  { value: 'daily', label: '日用百货' },
  { value: 'health', label: '常规保健品' },
];

const DIM_PROJECT_CATEGORY: DimensionDef = {
  dim_type: 'project_category',
  label: '按项目品类',
  value_type: 'discrete_multi',
  target_types: ['project'],
  options: PROJECT_CATEGORY_OPTIONS,
  placeholder: '选择品类（可多选）',
  getValue: (item: any) => item.category,
  compare: (va, vb, dim) => compareDiscreteMulti(va || '', vb || '', dim.selected_values),
};

/** 按会员数维度（仅项目推荐，连续） */
const DIM_MEMBER_COUNT: DimensionDef = {
  dim_type: 'member_count',
  label: '按会员数',
  value_type: 'continuous',
  target_types: ['project'],
  getValue: (item: any) => item.member_count,
  compare: (va, vb, dim) => compareContinuous(Number(va), Number(vb), dim),
};

/** 按门店数维度（仅项目推荐，连续） */
const DIM_STORE_COUNT: DimensionDef = {
  dim_type: 'store_count',
  label: '按门店数',
  value_type: 'continuous',
  target_types: ['project'],
  getValue: (item: any) => item.store_count,
  compare: (va, vb, dim) => compareContinuous(Number(va), Number(vb), dim),
};

// ============================================
// 维度注册表
// ============================================

/** 全局维度注册表 */
export const DIMENSION_REGISTRY: DimensionDef[] = [
  DIM_PROJECT,
  DIM_ANCHOR_TYPE,
  DIM_LIVE_STATUS,
  DIM_VIEWER_COUNT,
  DIM_LIVE_STARTED_AT,
  DIM_CATEGORY,
  DIM_SALES,
  DIM_CREATED_AT,
  DIM_INDUSTRY,
  DIM_PROJECT_CATEGORY,
  DIM_MEMBER_COUNT,
  DIM_STORE_COUNT,
];

/** 按推荐目标类型获取可用维度 */
export function getDimensionsByTarget(targetType: RecommendTargetType): DimensionDef[] {
  return DIMENSION_REGISTRY.filter(d => d.target_types.includes(targetType));
}

/** 获取维度定义 */
export function getDimensionDef(dimType: string): DimensionDef | undefined {
  return DIMENSION_REGISTRY.find(d => d.dim_type === dimType);
}

/** 校验维度类型是否合法 */
export function isValidDimension(dimType: string, targetType?: RecommendTargetType): boolean {
  const def = getDimensionDef(dimType);
  if (!def) return false;
  if (targetType && !def.target_types.includes(targetType)) return false;
  return true;
}

// ============================================
// 通用排序函数（替代 sortLiveByDimensions / sortProductByDimensions）
// ============================================

/**
 * 多维度叠加排序（通用版）
 * 按 dimensions 数组顺序，依次作为 ORDER BY 的各级排序键
 * 使用稳定排序：从最后一个维度开始排，保证前面的维度优先级更高
 *
 * @param items 待排序数据
 * @param dimensions 排序维度链
 * @returns 排序后的新数组（不修改原数组）
 */
export function sortByDimensions<T extends any>(items: T[], dimensions: SortDimension[]): T[] {
  if (!dimensions?.length) return items;
  const sorted = [...items];
  for (let i = dimensions.length - 1; i >= 0; i--) {
    const dim = dimensions[i];
    const def = getDimensionDef(dim.dim_type);
    if (!def) continue;
    sorted.sort((a, b) => {
      const va = def.getValue(a);
      const vb = def.getValue(b);
      return def.compare(va, vb, dim);
    });
  }
  return sorted;
}

/**
 * 直播默认排序规则（v3.1.36 新增，BR-SHP-041/042）
 *
 * 规则定义：
 *   1. 按直播状态排序：live（直播中）→ upcoming（预告）→ replay（回放）
 *   2. 同状态下按直播开始时间 started_at 倒序（最新的在前）
 *   3. 排除 ended（已结束）状态的直播
 *
 * 适用场景：
 *   - 平台APP首页直播推荐（BR-SHP-042，不走规则引擎，写死此规则）
 *   - 项目首页推荐直播（BR-SHP-041，默认展示前4条）
 *   - 门店首页推荐直播（BR-SHP-041，默认展示前4条）
 *
 * 注意：此函数为"默认规则"的硬编码实现，不经过规则引擎。
 *       商城精选直播Tab仍走规则引擎（useRecommendEngine），不受此函数影响。
 *
 * @param lives 待排序的直播列表
 * @param limit 返回条数上限（可选，不传则返回全部排序结果）
 * @returns 排序后的新数组（不修改原数组）
 */
export function sortLivesByDefaultRule<T extends any>(lives: T[], limit?: number): T[] {
  // 第一步：过滤掉 ended 状态
  const filtered = lives.filter((l: any) => l.status !== 'ended');

  // 第二步：按状态优先级排序 + 同状态按 started_at 倒序
  const sorted = [...filtered].sort((a: any, b: any) => {
    // 状态优先级：live(0) → upcoming(1) → replay(2)
    const pa = LIVE_STATUS_PRIORITY[a.status] ?? 99;
    const pb = LIVE_STATUS_PRIORITY[b.status] ?? 99;
    if (pa !== pb) return pa - pb;

    // 同状态下按 started_at 倒序（最新的在前）
    const ta = a.started_at ? new Date(a.started_at).getTime() : 0;
    const tb = b.started_at ? new Date(b.started_at).getTime() : 0;
    return tb - ta;
  });

  // 第三步：截取前 limit 条
  return limit !== undefined ? sorted.slice(0, limit) : sorted;
}

/** 主播类型文本 */
export function anchorTypeText(type?: string): string {
  return ANCHOR_TYPE_OPTIONS.find(o => o.value === type)?.label || '个人主播';
}
