/**
 * useUseCaseCard — 用例卡接入组合式函数
 *
 * v3.1.28 新增：各页面调用此 composable 即可自动接入用例卡抽屉+帮助按钮
 * v3.1.28+ Tab感知：传入 getActiveTab 回调可过滤特定Tab的UC（如商城页三Tab/项目商城双Tab）
 *
 * 用法（在页面 <script setup> 中）：
 *   // 非Tab页面
 *   const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-001', '平台首页')
 *   // Tab页面
 *   const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-002', '商城页', () => mode.value)
 * 在模板中：
 *   <HelpButton @open="ucDrawerVisible = true" />
 *   <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
 */
import { ref, computed } from 'vue';
import { useCasesByPgId } from '@/data/use-cases';
import type { UseCaseCard } from '@/components/use-case-card/UseCaseDrawer.vue';

// v4 字段默认值（v3.1.39）：确保旧版数据源在无新字段时也能正常渲染
const v4Defaults: Partial<UseCaseCard> = {
  feature: '',
  businessRules: [],
  dataEntities: [],
  relatedPages: [],
  hifiPrototypeUrl: '',
  acceptanceCriteria: [],
  designDocAnchor: '',
  prdAnchor: '',
};

function normalizeUseCase(uc: UseCaseCard): UseCaseCard {
  return {
    ...v4Defaults,
    ...uc,
    businessRules: uc.businessRules ?? [],
    dataEntities: uc.dataEntities ?? [],
    relatedPages: uc.relatedPages ?? [],
    acceptanceCriteria: uc.acceptanceCriteria ?? [],
  };
}

export function useUseCaseCard(pgId: string, pageTitle: string, getActiveTab?: () => string | undefined) {
  const ucDrawerVisible = ref(false);

  // Tab感知过滤 (v3.1.28+):
  // - getActiveTab 未传（非Tab页面）：返回该pgId的所有UC
  // - getActiveTab 已传（Tab页面）：只返回 tabId匹配 + tabId未定义的UC（始终展示的UC）
  const ucCards = computed<UseCaseCard[]>(() => {
    const all = (useCasesByPgId[pgId] || []).map(normalizeUseCase);
    if (!getActiveTab) return all;

    const activeTab = getActiveTab();
    if (activeTab === undefined) return all;

    return all.filter(uc => {
      // UC未定义tabId → 始终展示（适用于所有Tab的通用UC）
      if (!(uc as any).tabId) return true;
      // UC定义了tabId → 仅匹配当前activeTab
      return (uc as any).tabId === activeTab;
    });
  });

  const ucDrawerTitle = computed(() => `${pageTitle} — 用例卡（${ucCards.value.length}个UC）`);

  return {
    ucDrawerVisible,
    ucCards,
    ucDrawerTitle,
  };
}
