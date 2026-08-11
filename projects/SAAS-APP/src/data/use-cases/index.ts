/**
 * 用例卡数据源 — 统一导出 + 按 pgId 索引
 *
 * v3.1.44: 新增UC-OPS-OPS-CONFIG-008(功能页面管理)，总数60→61
 * v3.1.42: 删除UC-SHP-MEMBER-004(优惠券二级页)，总数61→60；全部UC新增userStory字段+BR编号文字化
 * v3.1.41: 新增7个UC（OPS-RECOMMEND-007~012 + TNT-TENANT-007），总数54→61
 * v3.1.40: UC编号体系重构为功能维度（12个功能域），新增feature字段，新增feature索引
 * 数据来源于 PRD v3.1.44 §8 功能需求列表与用例（FN/UC）
 */
import type { UseCaseCard } from '@/components/use-case-card/UseCaseDrawer.vue';
import { appUseCases } from './app-use-cases';
import { adminUseCases } from './admin-use-cases';
import { tenantUseCases } from './tenant-use-cases';

// v3.1.44: 新增UC-OPS-OPS-CONFIG-008(功能页面管理)，总数60→61
const _allUseCases: UseCaseCard[] = [
  ...appUseCases,
  ...adminUseCases,
  ...tenantUseCases,
];

export const allUseCases: UseCaseCard[] = _allUseCases.filter(
  uc => (uc as any).status !== 'planned'
);

// 按 pgId 索引（一个页面可能有多个 UC）
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

// v3.1.40: 按功能域(feature)索引，支持功能维度分组和筛选
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

// 按路由前缀索引（用于模糊匹配页面路由）
export function getUseCasesByRoute(route: string): UseCaseCard[] {
  // 精确匹配 pgId 对应的 route
  for (const uc of allUseCases) {
    if (uc.route && (uc.route === route || route.startsWith(uc.route.replace(/:[^/]+/, '').replace(/\/$/, '')))) {
      // 找到匹配的 pgId 组
      if (uc.pgId && useCasesByPgId[uc.pgId]) {
        return useCasesByPgId[uc.pgId];
      }
    }
  }
  return [];
}

export { appUseCases, adminUseCases, tenantUseCases };
export type { UseCaseCard };
