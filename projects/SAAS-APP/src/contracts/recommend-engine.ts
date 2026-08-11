/**
 * 推荐规则引擎 — 契约层核心类型
 *
 * 设计目标：将「商品推荐/直播推荐/项目推荐」抽象为统一的规则引擎，
 * 通过 DimensionDef 注册表统一管理排序维度，通过 RecommendScenario 场景配置复用规则。
 *
 * 核心概念：
 *   RecommendTargetType — 推荐目标类型（product/live/project）
 *   DimensionDef        — 排序维度定义（注册表条目）
 *   SortDimension       — 排序维度实例（一个已启用的维度）
 *   RecommendRule       — 推荐规则（含多维度排序链）
 *   RecommendScenario   — 推荐场景（首页推荐/精选Tab等，引用规则 + 展示条数）
 *   RuleTemplate        — 规则模板（可复用的规则预设）
 *   TimeBasedRule       — 时段规则（预留，本期不实现）
 *
 * 版本：v3.1.30 引入
 * v3.1.34 调整：规则引擎只负责获取数据集（排序），展示条数 display_limit
 *              从 RecommendRuleEntity/RecommendItem/RuleTemplate 移除，
 *              转移到 RecommendScenario，由使用场景控制展示条数。
 */

// ============================================
// 推荐目标类型
// ============================================

/** 推荐目标类型（替代原硬编码的 dim_type 联合类型） */
export type RecommendTargetType = 'product' | 'live' | 'project';

// ============================================
// 排序维度
// ============================================

/**
 * 单个排序维度（多维度排序链的一个节点）
 * dim_type 由联合类型改为 string，由 DIMENSION_REGISTRY 运行时校验
 */
export interface SortDimension {
  /** 维度类型（由 DimensionDef.dim_type 定义，如 'project'/'anchor_type'/'status'/'viewer_count' 等） */
  dim_type: string;
  /** 排序方向（仅连续维度有效：viewer_count/sales/created_at），默认 desc */
  direction: 'desc' | 'asc';
  /** 多选值（仅离散多选维度有效：project/anchor_type/category），数组顺序即优先级顺序 */
  selected_values: string[];
}

// ============================================
// 排序维度定义（注册表条目）
// ============================================

/** 维度值类型 */
export type DimensionValueType = 'discrete_multi' | 'discrete_fixed' | 'continuous';

/** 维度值选项（离散多选维度的可选值） */
export interface DimensionOption {
  value: string;
  label: string;
}

/**
 * 排序维度定义（注册表条目）
 * 每个维度对应一种排序逻辑，由 DIMENSION_REGISTRY 统一管理
 */
export interface DimensionDef {
  /** 维度类型（唯一标识） */
  dim_type: string;
  /** 维度显示名称 */
  label: string;
  /** 值类型 */
  value_type: DimensionValueType;
  /** 适用的推荐目标类型 */
  target_types: RecommendTargetType[];
  /** 可选值列表（仅 discrete_multi 有效，可为动态函数） */
  options?: DimensionOption[];
  /** 占位提示文案 */
  placeholder?: string;
  /** 维度值提取器：从目标对象中获取该维度的值 */
  getValue: (item: any) => any;
  /** 维度比较器：返回负数(a前)/0(相等)/正数(b前) */
  compare: (va: any, vb: any, dim: SortDimension) => number;
  /** 固定优先级映射（仅 discrete_fixed 有效，如直播状态） */
  fixedPriority?: Record<string, number>;
}

// ============================================
// 推荐规则
// ============================================

/** 推荐规则（新版：多维度排序链） */
export interface RecommendRule {
  /** 排序维度链，按数组顺序依次排序（叠加排序，等价 SQL ORDER BY dim1, dim2, ...） */
  sort_dimensions: SortDimension[];
}

// ============================================
// 推荐配置项
// ============================================

/** 推荐配置项（商品/直播/项目通用） */
export interface RecommendItem {
  rec_id: string;
  /** 推荐类型：手动 / 规则 */
  rec_type: 'manual' | 'rule';
  /** 目标ID（手动推荐时为商品/直播/项目ID，规则推荐时为空） */
  target_id: string;
  /** 推荐规则（仅规则推荐时有效） */
  rule?: RecommendRule;
  /** 状态 */
  status: 'active' | 'disabled';
  /** 手动推荐排序值（仅 manual 类型有效，数字越小越靠前） */
  sort_order?: number;
  /** 是否为默认规则（规则推荐中唯一默认规则，不可删除，不可新增其他规则） */
  is_default?: boolean;
  /** 最后修改人 */
  updated_by?: string;
  /** 最后修改时间（ISO 8601） */
  updated_at?: string;
}

// ============================================
// 推荐规则实体（v3.1.31 独立化）
// ============================================

/**
 * 推荐规则实体（独立的规则定义，可被多个场景引用）
 *
 * v3.1.31 重构：将"规则定义"与"规则使用"分离
 *   - 规则引擎管理页：统一创建/管理规则实体（CRUD）
 *   - 推荐场景：引用规则实体（rule_id） + 管理手动推荐
 *
 * 一个场景引用一个规则（1:1），同一 target_type 的多个场景可引用不同规则
 * 例如：首页直播推荐用"热度优先"规则，商城精选直播用"项目分组"规则
 */
export interface RecommendRuleEntity {
  /** 规则ID（唯一） */
  rule_id: string;
  /** 规则名称（如"直播热度优先"、"商品销量优先"） */
  name: string;
  /** 适用推荐目标类型 */
  target_type: RecommendTargetType;
  /** 排序维度链 */
  rule: RecommendRule;
  /** 规则描述 */
  description?: string;
  /** 状态：active=启用 / disabled=停用 */
  status: 'active' | 'disabled';
  /** 是否内置规则（内置规则不可删除，可修改） */
  is_builtin?: boolean;
  /** 最后修改人 */
  updated_by?: string;
  /** 最后修改时间（ISO 8601） */
  updated_at?: string;
}

// ============================================
// 推荐场景
// ============================================

/**
 * 推荐场景配置
 * 一个场景 = 一个落地页面区域（首页推荐区 / 精选商品Tab / 精选直播Tab 等）
 *
 * v3.1.31 重构：场景改为引用独立的规则实体（rule_id），不再内联 DimensionConfigurator
 * 一个场景只能引用一个规则（1:1）
 * v3.1.34 调整：规则引擎只负责获取数据集（排序），展示条数 display_limit
 *              从 RecommendRuleEntity 移除转移到此处，由使用场景控制展示条数。
 *              - 首页推荐区：display_limit=6（受条数限制）
 *              - 商城精选Tab：display_limit 留空（undefined=无上限）
 */
/** 规则引用生效状态（v3.1.38 新增：pending=规则数据异步同步中 / active=已生效） */
export type RuleEffectStatus = 'pending' | 'active';

export interface RecommendScenario {
  /** 场景ID（唯一） */
  scenario_id: string;
  /** 场景名称 */
  name: string;
  /** 推荐目标类型 */
  target_type: RecommendTargetType;
  /** 引用的规则ID（v3.1.31：1:1 引用 RecommendRuleEntity.rule_id） */
  rule_id: string;
  /** 关联的推荐配置列表（仅手动推荐，规则推荐由 rule_id 决定） */
  recommend_configs: RecommendItem[];
  /** 展示条数（undefined=无上限；首页推荐区=6；精选Tab=undefined） */
  display_limit?: number;
  /** 规则引用生效状态（v3.1.38 新增）：pending=规则数据异步同步中 / active=已生效。仅作展示，不影响规则执行 */
  effect_status: RuleEffectStatus;
  /** 场景描述 */
  description?: string;
  /** 最后修改人 */
  updated_by?: string;
  /** 最后修改时间（ISO 8601） */
  updated_at?: string;
}

// ============================================
// 规则模板
// ============================================

/**
 * 规则模板（可复用的规则预设）
 *
 * v3.1.31 重构：规则模板从"一键应用到默认规则"改为"新建规则时的快捷预设"
 *   - 在规则引擎管理页创建规则时，可选择基于模板创建（复制模板的 sort_dimensions）
 *   - 模板不再直接覆盖某个场景的规则，而是作为新规则的起点
 */
export interface RuleTemplate {
  /** 模板ID */
  template_id: string;
  /** 模板名称 */
  name: string;
  /** 适用推荐目标类型 */
  target_type: RecommendTargetType;
  /** 模板规则（含预置的排序维度链） */
  rule: RecommendRule;
  /** 模板描述 */
  description?: string;
  /** 是否内置模板（内置模板不可删除） */
  is_builtin?: boolean;
}

// ============================================
// 打散配置（预留，本期不实现）
// ============================================

/** 打散算法配置（防止同维度值扎堆，预留字段） */
export interface SpreadConfig {
  /** 是否启用打散 */
  enabled: boolean;
  /** 打散窗口大小（前N条内不允许同维度值重复） */
  window_size: number;
  /** 打散维度（按哪个维度的值打散，如 project/category） */
  spread_by: string;
}

// ============================================
// 时段规则（预留，本期不实现）
// ============================================

/** 时段规则（按时间段切换不同推荐规则，预留字段） */
export interface TimeBasedRule {
  /** 规则ID */
  rule_id: string;
  /** 适用星期（0=周日,1=周一...6=周六，空数组=全部） */
  weekdays: number[];
  /** 时间段（如 "09:00-12:00"） */
  time_range?: string;
  /** 日期范围（开始） */
  date_start?: string;
  /** 日期范围（结束） */
  date_end?: string;
  /** 该时段使用的推荐规则 */
  rule: RecommendRule;
  /** 优先级（数字越大越优先匹配） */
  priority: number;
}

// ============================================
// 兜底策略
// ============================================

/** 兜底策略模式 */
export type FallbackMode = 'strict' | 'loose' | 'global';

/** 兜底策略配置（当用户绑定项目内容不足时的补足策略） */
export interface FallbackConfig {
  /** 兜底模式 */
  mode: FallbackMode;
  /** strict: 仅展示用户已绑定项目的内容，不补足；loose: 不足时补足平台内容并标记；global: 直接展示平台全量 */
  mode_description: string;
  /** 补足内容的标签文案（如"平台精选"） */
  fallback_label?: string;
}

// ============================================
// 可见范围过滤
// ============================================

/** 可见范围模式 */
export type VisibilityMode = 'all' | 'bound_projects';

/** 可见范围配置（控制推荐内容的数据源范围） */
export interface VisibilityConfig {
  /** 模式：all=平台全量，bound_projects=仅用户已绑定项目 */
  mode: VisibilityMode;
  /** 兜底策略 */
  fallback: FallbackConfig;
}

// ============================================
// 直播可见范围权限（邀请制私域运营）
// ============================================
// 注意：LiveVisibilityMode / LiveVisibilityConfig 的 Zod Schema 定义在 schemas/project-schemas.ts
// 此处从 schemas 重新导出，避免类型重复定义导致冲突

export type { LiveVisibilityMode, LiveVisibilityConfig } from './schemas/project-schemas';
