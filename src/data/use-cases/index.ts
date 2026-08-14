/**
 * 用例卡数据源 — 统一导出 + 按维度索引
 *
 * v3.1.46: PM-first 三层卡片模型重构
 *   - 新增 StructuredRef 结构化引用 + 自动转换工具
 *   - 新增 featureCNMap 中文映射
 *   - 新增 pgNameMap 页面中文名映射
 *   - 新增 entNameMap 实体中文名映射
 *   - 新增 autoEnrichUseCase 自动填充工具
 * v3.1.44: 新增UC-OPS-OPS-CONFIG-008(功能页面管理)，总数60→61
 * v3.1.42: 全部UC新增userStory字段+BR编号文字化
 * v3.1.40: UC编号体系重构为功能维度（12个功能域），新增feature字段
 *
 * 数据来源于 PRD 文档 + 设计文档
 */
import type { UseCaseCard, StructuredRef } from '@/components/use-case-card/UseCaseDrawer.vue';
import { appUseCases } from './app-use-cases';
import { adminUseCases } from './admin-use-cases';
import { tenantUseCases } from './tenant-use-cases';

// ================================================================
// 映射表
// ================================================================

/** 功能域中文映射 */
export const featureCNMap: Record<string, string> = {
  'HOME':        '首页',
  'MALL':        '商城',
  'SEARCH':      '搜索',
  'PRODUCT':     '商品',
  'LIVE':        '直播',
  'STORE':       '门店',
  'MEMBER':      '会员',
  'MINE':        '个人中心',
  'RECOMMEND':   '推荐管理',
  'OPS-CONFIG':  '运营配置',
  'TENANT':      '租户管理',
  'PLACEHOLDER': '占位',
};

/** 数据实体中文名映射 */
export const entNameMap: Record<string, string> = {
  'ENT-APP-001': '平台用户',
  'ENT-APP-002': '广告位',
  'ENT-APP-003': '平台配置(入口/搜索结果)',
  'ENT-APP-004': '热搜词',
  'ENT-APP-005': '推荐项',
  'ENT-APP-006': '收货地址',
  'ENT-APP-010': '功能页面注册表',
  'ENT-PROJECT-001': '项目',
  'ENT-PROJECT-002': '商品',
  'ENT-PROJECT-003': '门店',
  'ENT-PROJECT-004': '直播间',
  'ENT-PROJECT-005': '项目首页配置',
  'ENT-PROJECT-006': '项目会员',
  'ENT-PROJECT-006A': '优惠券',
  'ENT-PROJECT-006B': '签到状态',
  'ENT-PROJECT-007': '项目推荐配置',
  'ENT-PROJECT-008': '租户',
  'ENT-PROJECT-009': '营销分类',
  'ENT-PROJECT-010': '邀请人(店长/店员)',
  'ENT-PROJECT-011': '用户门店绑定',
};

/** 页面编号 → 中文名 */
export const pgNameMap: Record<string, string> = {
  'PG-SHP-APP-001': '平台首页',
  'PG-SHP-APP-002': '商城页',
  'PG-SHP-APP-003': '娱乐页',
  'PG-SHP-APP-004': '消息页',
  'PG-SHP-APP-005': '个人中心',
  'PG-SHP-APP-005A': '收货地址管理',
  'PG-SHP-APP-006': '平台会员中心',
  'PG-SHP-APP-007': '搜索页',
  'PG-SHP-APP-008': '搜索结果页',
  'PG-SHP-APP-009': '项目首页',
  'PG-SHP-APP-009A': '项目商城页',
  'PG-SHP-APP-010': '项目门店页',
  'PG-SHP-APP-011': '门店详情页',
  'PG-SHP-APP-011A': '门店商品/直播列表',
  'PG-SHP-APP-012': '商品详情页',
  'PG-SHP-APP-012A': '更多商品分类页',
  'PG-SHP-APP-013': '项目会员页',
  'PG-SHP-APP-014': '直播详情页',
  'PG-OPS-PC-001': '搜索管理',
  'PG-OPS-PC-002': 'BANNER管理',
  'PG-OPS-PC-003': '金刚区管理',
  'PG-OPS-PC-004': '直播推荐管理',
  'PG-OPS-PC-005': '商品推荐管理',
  'PG-OPS-PC-006': '项目列表',
  'PG-OPS-PC-007': '商城管理',
  'PG-OPS-PC-008': '规则引擎管理',
  'PG-OPS-PC-009': '功能页面管理',
  'PG-TNT-PC-001': '项目管理',
  'PG-TNT-PC-002': '门店管理',
  'PG-TNT-PC-004': '营销分类',
  'PG-TNT-PC-005': '项目信息管理',
  'PG-TNT-PC-006': 'Banner管理',
  'PG-TNT-PC-007': '金刚区管理',
  '—': '—',
};

// ================================================================
// 自动转换工具
// ================================================================

/**
 * 解析 BR/ENT/PG 字符串 → StructuredRef
 * 兼容格式：
 *   - "BR-SHP-005: Banner轮播自动播放+手动滑动+跳转"
 *   - "ENT-APP-001" (纯编号，由映射表补充)
 *   - StructuredRef 对象 (直通)
 */
function parseRef(
  raw: StructuredRef | string,
  nameMapper?: Record<string, string>
): StructuredRef {
  if (typeof raw !== 'string') return raw;
  // 尝试解析 "CODE: Name" 格式
  const m = raw.match(/^([\w-]+):\s*(.+)/);
  if (m) return { code: m[1], name: m[2] };
  // 纯编号，尝试用映射表补充
  if (nameMapper && nameMapper[raw]) {
    return { code: raw, name: nameMapper[raw] };
  }
  return { code: raw, name: raw };
}

/**
 * 自动丰富用例卡字段
 * - businessRules / dataEntities / relatedPages 从旧格式自动转为 StructuredRef[]
 * - featureLabel 从 feature 自动映射
 */
export function autoEnrichUseCase(card: UseCaseCard): UseCaseCard {
  const enriched = { ...card };

  // featureLabel 自动映射
  if (!enriched.featureLabel && enriched.feature) {
    enriched.featureLabel = featureCNMap[enriched.feature] || enriched.feature;
  }

  // businessRules 转换
  if (enriched.businessRules && enriched.businessRules.length) {
    const first = enriched.businessRules[0];
    if (typeof first === 'string') {
      (enriched as any).businessRules = (enriched.businessRules as string[])
        .map(r => parseRef(r));
    }
  }

  // dataEntities 转换
  if (enriched.dataEntities && enriched.dataEntities.length) {
    const first = enriched.dataEntities[0];
    if (typeof first === 'string') {
      (enriched as any).dataEntities = (enriched.dataEntities as string[])
        .map(e => parseRef(e as string, entNameMap));
    }
  }

  // relatedPages 转换
  if (enriched.relatedPages && enriched.relatedPages.length) {
    const first = enriched.relatedPages[0];
    if (typeof first === 'string') {
      (enriched as any).relatedPages = (enriched.relatedPages as string[])
        .map(p => parseRef(p as string, pgNameMap));
    }
  }

  return enriched;
}

// ================================================================
// 数据汇聚 + 自动丰富
// ================================================================

const _allUseCases: UseCaseCard[] = [
  ...appUseCases,
  ...adminUseCases,
  ...tenantUseCases,
].map(autoEnrichUseCase);

/** 全部已实现用例卡（排除 planned 状态） */
export const allUseCases: UseCaseCard[] = _allUseCases.filter(
  uc => (uc as any).status !== 'planned'
);

/** 按页面编号索引 */
export const useCasesByPgId: Record<string, UseCaseCard[]> = allUseCases.reduce(
  (acc, uc) => {
    if (uc.pgId) {
      if (!acc[uc.pgId]) acc[uc.pgId] = [];
      acc[uc.pgId].push(uc);
    }
    return acc;
  },
  {} as Record<string, UseCaseCard[]>
);

/** 按功能域索引 */
export const useCasesByFeature: Record<string, UseCaseCard[]> = allUseCases.reduce(
  (acc, uc) => {
    if (uc.feature) {
      if (!acc[uc.feature]) acc[uc.feature] = [];
      acc[uc.feature].push(uc);
    }
    return acc;
  },
  {} as Record<string, UseCaseCard[]>
);

/** 按路由前缀模糊匹配 */
export function getUseCasesByRoute(route: string): UseCaseCard[] {
  for (const uc of allUseCases) {
    if (uc.route && (uc.route === route || route.startsWith(uc.route.replace(/:[^/]+/, '').replace(/\/$/, '')))) {
      if (uc.pgId && useCasesByPgId[uc.pgId]) {
        return useCasesByPgId[uc.pgId];
      }
    }
  }
  return [];
}

export { appUseCases, adminUseCases, tenantUseCases };
export type { UseCaseCard, StructuredRef };
