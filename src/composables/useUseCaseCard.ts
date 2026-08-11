/**
 * useUseCaseCard — 用例卡通用 composable
 *
 * v3.1.46: PM-first 三层卡片模型重构
 *   - 支持两种调用模式：旧模式 useUseCaseCard(pgId, title) / 新模式 useUseCaseCard(cards)
 *   - 返回 ucDrawerVisible / ucCards / ucDrawerTitle（兼容旧 API）
 *   - 新增 searchFilter / filteredCards / cardCount 等搜索过滤能力
 *   - 新增 priorityCNLabel / featureCNLabel 工具函数
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { UseCaseCard } from '@/components/use-case-card/UseCaseDrawer.vue';
import { useCasesByPgId, getUseCasesByRoute, autoEnrichUseCase } from '@/data/use-cases';

// ================================================================
// 工具函数
// ================================================================

/** 功能域中文映射表 */
export const FEATURE_CN_MAP: Record<string, string> = {
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

/** 优先级中文标签 */
export function priorityCNLabel(priority: string): string {
  const p = (priority || '').toLowerCase();
  if (p.includes('p0') || p.includes('高')) return 'P0 · 核心';
  if (p.includes('p1') || p.includes('中')) return 'P1 · 重要';
  if (p.includes('p2')) return 'P2 · 一般';
  return priority;
}

/** 功能域中文名 */
export function featureCNLabel(feature?: string): string {
  if (!feature) return '';
  return FEATURE_CN_MAP[feature] || feature;
}

// ================================================================
// Composable（支持两种调用模式）
// ================================================================

// 重载签名（第一个参数可以是 pgId 字符串 或 UseCaseCard 数组）
// 旧模式：useUseCaseCard(pgId, title, tabFilter?)
export function useUseCaseCard(pgIdOrRoute: string, pageTitle?: string, tabFilter?: () => string): UseCaseCardReturn;
export function useUseCaseCard(cards: UseCaseCard[]): UseCaseCardReturn;

export function useUseCaseCard(
  pgIdOrCards: string | UseCaseCard[],
  pageTitle?: string,
  tabFilter?: () => string
): UseCaseCardReturn {
  // ─── 判断调用模式 ───
  const isPgIdMode = typeof pgIdOrCards === 'string';

  // ─── 获取卡片数据 ───
  const rawCards: UseCaseCard[] = isPgIdMode
    ? (useCasesByPgId[pgIdOrCards as string] || getUseCasesByRoute(pgIdOrCards as string))
    : pgIdOrCards;

  const allCards: UseCaseCard[] = rawCards.map(autoEnrichUseCase);

  // ─── Tab 过滤（如果提供了 tabFilter）───
  const tabFilteredCards = computed(() => {
    if (!tabFilter) return allCards;
    const activeTab = tabFilter();
    if (!activeTab) return allCards;
    return allCards.filter(card => !card.tabId || card.tabId === activeTab);
  });

  // ─── 搜索过滤 ───
  const searchFilter = ref('');

  const filteredCards = computed(() => {
    const q = searchFilter.value.trim().toLowerCase();
    const source = tabFilteredCards.value;
    if (!q) return source;

    return source.filter(card => {
      const fields: string[] = [
        card.ucId, card.ucName, card.description, card.userStory,
        card.feature || '', card.featureLabel || '', card.pgId || '',
        card.fnId, card.priority, card.precondition || '', card.scenario || '',
        card.module || '', card.page || '', card.participants || '',
        ...((card as any).featureLabel ? [(card as any).featureLabel] : []),
        ...(card.specialNotes || []),
        ...(card.basicFlow || []),
        ...(card.userFlow || []),
        ...(card.acceptanceCriteria || []),
      ];

      // 搜索结构化引用中的中文名
      if (card.businessRules) {
        card.businessRules.forEach(br => {
          if (typeof br === 'string') fields.push(br);
          else fields.push(br.name, br.code);
        });
      }
      if (card.dataEntities) {
        card.dataEntities.forEach(ent => {
          if (typeof ent === 'string') fields.push(ent);
          else fields.push(ent.name, ent.code);
        });
      }
      if (card.relatedPages) {
        card.relatedPages.forEach(pg => {
          if (typeof pg === 'string') fields.push(pg);
          else fields.push(pg.name, pg.code);
        });
      }

      return fields.some(f => f && f.toLowerCase().includes(q));
    });
  });

  const cardCount = computed(() => filteredCards.value.length);

  // ─── 抽屉状态 ───
  const ucDrawerVisible = ref(false);
  const ucDrawerTitle = computed(() => {
    if (isPgIdMode && pageTitle) return pageTitle;
    if (allCards.length === 0) return '用例卡片';
    return allCards[0].page || allCards[0].ucName || '用例卡片';
  });
  // 兼容旧命名
  const drawerVisible = ucDrawerVisible;

  const ucCards = computed(() => filteredCards.value);

  function openDrawer() { ucDrawerVisible.value = true; }
  function closeDrawer() { ucDrawerVisible.value = false; }

  // ─── 折叠/展开 ───
  const expandAll = ref(false);

  // ─── 定位高亮（传递到 UseCaseDrawer）───
  const highlightElementId = ref('');

  function handleHelpClick(elementId?: string) {
    if (elementId) highlightElementId.value = elementId;
    ucDrawerVisible.value = true;
  }

  return {
    // 旧 API（兼容）
    ucDrawerVisible,
    ucCards,
    ucDrawerTitle,

    // 新 API
    drawerVisible,
    openDrawer,
    closeDrawer,
    searchFilter,
    filteredCards,
    cardCount,
    allCards,
    expandAll,
    highlightElementId,
    handleHelpClick,

    // 工具
    priorityCNLabel,
    featureCNLabel,
  };
}

export interface UseCaseCardReturn {
  // 旧 API
  ucDrawerVisible: Ref<boolean>;
  ucCards: ComputedRef<UseCaseCard[]>;
  ucDrawerTitle: ComputedRef<string>;
  // 新 API
  drawerVisible: Ref<boolean>;
  openDrawer: () => void;
  closeDrawer: () => void;
  searchFilter: Ref<string>;
  filteredCards: ComputedRef<UseCaseCard[]>;
  cardCount: ComputedRef<number>;
  allCards: UseCaseCard[];
  expandAll: Ref<boolean>;
  highlightElementId: Ref<string>;
  handleHelpClick: (elementId?: string) => void;
  // 工具
  priorityCNLabel: typeof priorityCNLabel;
  featureCNLabel: typeof featureCNLabel;
}
