<template>
  <!-- 平台首页 — "追伴" -->
  <div class="platform-home">
    <!-- 顶部区域（搜索框以上全部置顶不随滚动） -->
    <div class="ph-sticky-header">
      <!-- 顶部：Logo + APP名称 -->
      <div class="ph-top-bar">
        <div class="ph-logo">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                <stop stop-color="#FF6B35"/><stop offset="1" stop-color="#FF8F35"/>
              </linearGradient>
            </defs>
            <text x="20" y="27" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">追</text>
          </svg>
          <span class="ph-app-name">追伴</span>
        </div>
        <div class="ph-msg-btn" @click="onScan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
          </svg>
        </div>
      </div>

      <!-- 搜索栏 — 点击进搜索页（搜索范围：商品/直播/项目） -->
      <div class="ph-search-bar" @click="goSearch">
        <div class="ph-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span class="ph-search-hint">搜索商品、直播、项目</span>
          <span class="ph-search-btn">搜索</span>
        </div>
      </div>
    </div>

    <!-- Banner广告轮播 -->
    <div class="ph-section" v-if="banners.length">
      <BannerCarousel :banners="banners" @click="onBannerClick" />
    </div>

    <!-- 金刚区 -->
    <KingKongGrid :entries="kingKongs" />

    <!-- ========== 直播推荐（置顶） ========== -->
    <div class="ph-section" v-if="liveRecommends.length">
      <div class="ph-sec-header">
        <div class="ph-sec-left">
          <span class="ph-sec-icon">📺</span>
          <span class="ph-sec-title">直播推荐</span>
        </div>
        <span class="ph-sec-more" @click="router.push('/app/mall?tab=featuredLives')">更多 ›</span>
      </div>
      <div class="ph-live-scroll">
        <LiveCard
          v-for="lv in liveRecommends"
          :key="lv.live_id"
          :live="lv"
          :project-id="lv.project_id"
          @click="goLiveDetail(lv.live_id)"
        />
      </div>
    </div>

    <!-- ========== 商品推荐 ========== -->
    <div class="ph-section" v-if="productRecommends.length">
      <div class="ph-sec-header">
        <div class="ph-sec-left">
          <span class="ph-sec-icon">🔥</span>
          <span class="ph-sec-title">商品推荐</span>
        </div>
        <span class="ph-sec-more" @click="router.push('/app/mall?tab=featuredProducts')">更多 ›</span>
      </div>
      <div class="ph-product-grid">
        <ProductCard
          v-for="p in productRecommends"
          :key="p.product_id"
          :product="p"
          @click="goProductDetail(p.product_id)"
        />
      </div>
    </div>

    <div class="ph-bottom">— 已经到底啦 —</div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppConfigStore } from '../../../stores/app-config-store';
import { useAppNavigation } from '../../../composables/useAppNavigation';
import { useProjectStore } from '../../../stores/project-store';
import { useUserStore } from '../../../stores/user-store';
import { useRecommendEngine } from '../../../composables/useRecommendEngine';
import { useVisibilityFilter } from '../../../composables/useVisibilityFilter';
import { useLiveVisibility } from '../../../composables/useLiveVisibility';
import { useProjectStatusFilter } from '../../../composables/useProjectStatusFilter';
import { sortLivesByDefaultRule } from '../../../contracts/recommend-dimensions';
import BannerCarousel from '../../../components/app/home/BannerCarousel.vue';
import KingKongGrid from '../../../components/app/home/KingKongGrid.vue';
import ProductCard from '../../../components/app/product/ProductCard.vue';
import LiveCard from '../../../components/app/live/LiveCard.vue';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-001', '平台首页');
import type { AdBanner } from '../../../contracts';

const router = useRouter();
const appConfig = useAppConfigStore();
// v3.1.45: 统一跳转入口
const { navigateByJumpType } = useAppNavigation();
const projectStore = useProjectStore();
const userStore = useUserStore();
const { getRecommendItems } = useRecommendEngine();
const { filterByVisibility } = useVisibilityFilter();
const { filterVisibleLives } = useLiveVisibility();
const { filterByActiveProject } = useProjectStatusFilter();

// 未读消息
const unread = computed(() => appConfig.unreadCount || 0);

// Banner
const banners = computed(() => appConfig.bannersByPosition('platform_home'));

// 金刚区
const kingKongs = computed(() => appConfig.enabledKingKongs);

// ========== 直播推荐（叠加模式 BR-SHP-030 + 默认规则 BR-SHP-042 + 可见范围过滤 v3.1.30）==========
// v3.1.31: 接入规则引擎，通过场景引用的规则实体获取排序维度
// v3.1.34: 展示条数从场景 display_limit 读取（规则实体不再含 display_limit）
// v3.1.36: 脱离规则引擎，改用默认规则（状态排序 live→upcoming→replay + 同状态 started_at 倒序，排除 ended）
//          保留手动推荐叠加（手动在前 + 默认规则补足）+ 展示条数配置
const liveRecommends = computed(() => {
  const limit = appConfig.recommendScenarios.find(s => s.scenario_id === 'sc-home-live')?.display_limit ?? 6;

  // 第一步：按用户可见范围过滤数据源
  const boundProjectIds = userStore.boundProjectIds;
  // 可见范围：bound_projects 模式（仅用户已绑定项目），兜底 loose 模式
  const visibilityResult = filterByVisibility({
    items: projectStore.liveRooms as any,
    boundProjectIds,
    mode: boundProjectIds.length ? 'bound_projects' : 'all',
    fallback: { mode: 'loose', mode_description: '不足时补足平台内容', fallback_label: '平台精选' },
    minCount: limit,
  });

  // v3.1.37 BR-SHP-043 Layer1：过滤掉 inactive 项目的直播
  const activeFiltered = filterByActiveProject(visibilityResult.items as any);

  // 第二步：按直播可见范围权限过滤（邀请制）
  // 获取当前用户在主要绑定项目下的邀请人和门店
  const firstBinding = userStore.userStoreBindings.find(
    b => b.user_id === userStore.currentUser.user_id
  );
  const visibleLives = filterVisibleLives({
    lives: activeFiltered as any,
    userInviterId: firstBinding?.inviter_id,
    userStoreId: firstBinding?.store_id,
    userProjectId: firstBinding?.project_id,
  });

  // 第三步：推荐引擎叠加（手动推荐在前 + 默认规则补足）
  // v3.1.36：不传 ruleId，allItems 预先按默认规则排序，规则补足阶段会按此顺序补足
  const sortedByDefault = sortLivesByDefaultRule(visibleLives as any);
  return getRecommendItems<any>({
    targetType: 'live',
    recommendConfigs: appConfig.liveRecommendConfigs,
    allItems: sortedByDefault as any,
    idField: 'live_id',
    displayLimit: limit,
    // 不传 ruleId —— 走默认规则（sortLivesByDefaultRule 已预排序 allItems）
  });
});

// ========== 商品推荐（叠加模式 BR-SHP-030 + 多维度排序链 + 可见范围过滤 v3.1.30）==========
// v3.1.31: 接入规则引擎
// v3.1.34: 展示条数从场景 display_limit 读取（规则实体不再含 display_limit）
const productRecommends = computed(() => {
  const limit = appConfig.recommendScenarios.find(s => s.scenario_id === 'sc-home-product')?.display_limit ?? 6;

  // 第一步：按用户可见范围过滤数据源
  const boundProjectIds = userStore.boundProjectIds;
  const visibilityResult = filterByVisibility({
    items: projectStore.products.filter(p => p.status === 'on_sale') as any,
    boundProjectIds,
    mode: boundProjectIds.length ? 'bound_projects' : 'all',
    fallback: { mode: 'loose', mode_description: '不足时补足平台内容', fallback_label: '平台精选' },
    minCount: limit,
  });

  // v3.1.37 BR-SHP-043 Layer1：过滤掉 inactive 项目的商品
  const activeFiltered = filterByActiveProject(visibilityResult.items as any);

  // 第二步：推荐引擎排序
  return getRecommendItems<any>({
    targetType: 'product',
    recommendConfigs: appConfig.productRecommendConfigs,
    allItems: activeFiltered as any,
    idField: 'product_id',
    displayLimit: limit,
    ruleId: appConfig.productScenarioRule?.rule_id, // v3.1.31：接入规则引擎
  });
});

// Banner点击跳转 — 支持5种跳转类型(CONFIG-SHP-007, v3.1.44新增function_page, v3.1.45统一接入composable)
function onBannerClick(banner: AdBanner) {
  // v3.1.45: 统一调用 navigateByJumpType（内含 5 种类型处理 + link fallback + url 兼容）
  navigateByJumpType(
    banner.jump_type || '',
    banner.jump_id || '',
    (banner as any).project_id || '',
    banner.link
  );
}

function goProductDetail(productId: string) {
  router.push(`/app/product/${productId}`);
}

function goLiveDetail(liveId: string) {
  router.push(`/app/live/${liveId}`);
}

// 搜索
function goSearch() {
  router.push('/app/search');
}

function onScan() {
  alert('扫一扫功能开发中');
}
</script>

<style scoped>
.platform-home {
  background: #f5f5f5;
}

/* ========== 置顶区域（搜索框以上固定不滚动）========== */
.ph-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding-bottom: 4px;
}

/* ========== 顶部 ========== */
.ph-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
}
.ph-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ph-app-name {
  font-size: 18px;
  font-weight: 700;
  color: #FF6B35;
  letter-spacing: 1px;
}
.ph-msg-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ph-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  background: #F5222D;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  padding: 0 4px;
}

/* ========== 搜索 ========== */
.ph-search-bar {
  padding: 6px 16px 10px;
  background: #fff;
}
.ph-search-box {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 4px 0 14px;
  background: #f5f5f5;
  border-radius: 19px;
  gap: 8px;
  cursor: pointer;
}
.ph-search-hint {
  flex: 1;
  font-size: 13px;
  color: #bbb;
}
.ph-search-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 16px;
}

/* ========== 通用 ========== */
.ph-section { margin: 10px 12px 0; }
.ph-sec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.ph-sec-left { display: flex; align-items: center; gap: 6px; }
.ph-sec-icon { font-size: 18px; }
.ph-sec-title { font-size: 16px; font-weight: 700; color: #111; }
.ph-sec-more { font-size: 12px; color: #999; cursor: pointer; }

/* 商品 */
.ph-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 直播 — 2列网格布局，根据display_limit数量动态显示，全部可见 */
.ph-live-scroll {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.ph-bottom {
  text-align: center;
  color: #ddd;
  font-size: 12px;
  padding: 20px 0 8px;
}
</style>
