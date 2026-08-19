<template>
  <!-- 商城页（商城列表 / 精选商品 / 精选直播 切换） — FN-SHP-APP-002 -->
  <div class="mall-page">
    <!-- 顶部切换：商城列表 / 精选商品 / 精选直播（重点突出Tab导航） -->
    <div class="mp-switch">
      <span
        :class="['mp-switch-item', { active: mode === 'projects' }]"
        @click="mode = 'projects'"
      >商城列表</span>
      <span
        :class="['mp-switch-item', { active: mode === 'featuredProducts' }]"
        @click="mode = 'featuredProducts'"
      >精选商品</span>
      <span
        :class="['mp-switch-item', { active: mode === 'featuredLives' }]"
        @click="mode = 'featuredLives'"
      >精选直播</span>
    </div>

    <!-- ========== 项目列表（默认Tab） ========== -->
    <div v-if="mode === 'projects'" class="mp-content">
      <!-- 按行业筛选 -->
      <div class="mp-filter">
        <span
          :class="['mp-filter-item', { active: !filterIndustry }]"
          @click="filterIndustry = undefined"
        >全部行业</span>
        <span
          v-for="ind in industryOptions"
          :key="ind.value"
          :class="['mp-filter-item', { active: filterIndustry === ind.value }]"
          @click="filterIndustry = ind.value"
        >{{ ind.label }}</span>
      </div>

      <div class="mp-project-list">
        <ProjectCardEx
          v-for="project in filteredProjects"
          :key="project.project_id"
          :project="project"
        />
      </div>
    </div>

    <!-- ========== 精选商品（显示后台商品推荐的所有可见商品，按配置规则排序） ========== -->
    <div v-else-if="mode === 'featuredProducts'" class="mp-content">
      <!-- 按商品类目筛选 -->
      <div class="mp-filter">
        <span
          :class="['mp-filter-item', { active: !filterProductCategory }]"
          @click="filterProductCategory = undefined"
        >全部类目</span>
        <span
          v-for="cat in productCategoryOptions"
          :key="cat"
          :class="['mp-filter-item', { active: filterProductCategory === cat }]"
          @click="filterProductCategory = cat"
        >{{ cat }}</span>
      </div>
      <div class="mp-product-grid">
        <ProductCard
          v-for="p in pagedFeaturedProducts"
          :key="p.product_id"
          :product="p"
          @click="goProductDetail(p.product_id)"
        />
      </div>
      <div v-if="!filteredFeaturedProducts.length" class="mp-empty">暂无精选商品</div>
      <!-- 加载更多 -->
      <div
        v-if="productPage < productTotalPages"
        class="mp-load-more"
        @click="productPage++"
      >加载更多 ▼</div>
      <div v-else-if="filteredFeaturedProducts.length" class="mp-bottom">— 已经到底啦 —</div>
    </div>

    <!-- ========== 精选直播（显示后台直播推荐的所有可见直播，按配置规则排序） ========== -->
    <div v-else-if="mode === 'featuredLives'" class="mp-content">
      <!-- 按直播筛选（v3.1.61：直播中/直播预告/观看记录，直播中含直播中+回放中） -->
      <div class="mp-filter">
        <span
          v-for="st in liveStatusOptions"
          :key="st.value"
          :class="['mp-filter-item', { active: filterLiveStatus === st.value }]"
          @click="filterLiveStatus = st.value"
        >{{ st.label }}</span>
      </div>
      <div class="mp-live-list" v-if="filteredFeaturedLives.length">
        <div
          v-for="l in pagedFeaturedLives"
          :key="l.live_id"
          class="mpl-item"
          @click="goLiveDetail(l.live_id)"
        >
          <!-- 封面区 -->
          <div class="mpl-cover" :class="`mpl-cover--${l.status}`">
            <img v-if="l.cover_image" :src="l.cover_image" class="mpl-cover-img" />
            <span v-else class="mpl-cover-emoji">{{ liveEmoji(l.title) }}</span>
            <!-- 状态标签 -->
            <div class="mpl-badge" :class="`mpl-badge--${l.status}`">
              <span class="mpl-badge-dot" v-if="l.status === 'live'"></span>
              <span>{{ liveStatusText(l.status) }}</span>
            </div>
            <!-- 观看人数 -->
            <div class="mpl-viewers">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {{ viewerText(l.viewer_count) }}
            </div>
          </div>
          <!-- 信息区 -->
          <div class="mpl-info">
            <div class="mpl-title">{{ l.title }}</div>
            <div class="mpl-meta">
              <span class="mpl-anchor">
                <span class="mpl-anchor-avatar">{{ (l.anchor_name || '主').charAt(0) }}</span>
                {{ l.anchor_name }}
              </span>
              <span class="mpl-project" v-if="liveProjectName(l.project_id)">{{ liveProjectName(l.project_id) }}</span>
            </div>
            <div class="mpl-time" v-if="l.started_at">{{ formatLiveTime(l.started_at, l.status) }}</div>
            <!-- v3.1.54：直播预告→立即预约/已预约；观看记录中直播中的→观看直播 -->
            <div class="mpl-actions">
              <button
                v-if="l.status === 'upcoming'"
                class="mpl-btn mpl-btn--reserve"
                :class="{ 'is-reserved': isLiveReserved(l.live_id) }"
                @click.stop="toggleLiveReserve(l.live_id)"
              >{{ isLiveReserved(l.live_id) ? '已预约' : '立即预约' }}</button>
              <button
                v-else-if="filterLiveStatus === 'ended' && l.status === 'live'"
                class="mpl-btn mpl-btn--watch"
                @click.stop="goLiveDetail(l.live_id)"
              >观看直播</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!filteredFeaturedLives.length" class="mp-empty">暂无精选直播</div>
      <!-- 加载更多 -->
      <div
        v-if="livePage < liveTotalPages"
        class="mp-load-more"
        @click="livePage++"
      >加载更多 ▼</div>
      <div v-else-if="filteredFeaturedLives.length" class="mp-bottom">— 已经到底啦 —</div>
    </div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppConfigStore } from '../../../stores/app-config-store';
import { useProjectStore } from '../../../stores/project-store';
import { useUserStore } from '../../../stores/user-store';
import { useRecommendEngine } from '../../../composables/useRecommendEngine';
import { useVisibilityFilter } from '../../../composables/useVisibilityFilter';
import { useLiveVisibility } from '../../../composables/useLiveVisibility';
import { useProjectStatusFilter } from '../../../composables/useProjectStatusFilter';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
import ProjectCardEx from '../../../components/app/mall/ProjectCardEx.vue';
import ProductCard from '../../../components/app/product/ProductCard.vue';
import type { Product, LiveRoom } from '../../../contracts';

const router = useRouter();
const route = useRoute();
const appConfigStore = useAppConfigStore();
const projectStore = useProjectStore();
const userStore = useUserStore();
const { getRecommendItems } = useRecommendEngine();
const { filterByVisibility } = useVisibilityFilter();
const { filterVisibleLives } = useLiveVisibility();
const { filterByActiveProject, filterActiveProjects } = useProjectStatusFilter();

// 默认Tab改为"项目列表"（BR-SHP-031）；支持通过query.tab从首页"更多"跳转
type MallMode = 'projects' | 'featuredProducts' | 'featuredLives';
const initialTab = (route.query.tab as string) || 'projects';
const mode = ref<MallMode>(
  initialTab === 'featuredProducts' || initialTab === 'featuredLives' ? initialTab : 'projects'
);

// Tab感知用例卡：传入getActiveTab回调过滤当前Tab对应UC
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-002', '商城页', () => mode.value);
const filterIndustry = ref<string | undefined>(undefined);
const filterProductCategory = ref<string | undefined>(undefined);
// v3.1.61：精选直播筛选项改为「直播中/直播预告/观看记录」，默认选中「直播中」（含直播中+回放中）
const filterLiveStatus = ref<string>('live');

// 行业选项（从项目数据动态提取）
const INDUSTRY_LABELS: Record<string, string> = {
  daily_necessities: '日用品',
  health_products: '保健品',
  food_beverage: '食品饮料',
  home_appliance: '家居家电',
  beauty_care: '美妆个护',
};
const industryOptions = computed(() => {
  const set = new Set<string>();
  projectStore.projects.forEach(p => { if (p.industry) set.add(p.industry); });
  return [...set].map(v => ({ value: v, label: INDUSTRY_LABELS[v] || v }));
});

// 商品类目选项（从精选商品数据动态提取）
const productCategoryOptions = computed(() => {
  const set = new Set<string>();
  allFeaturedProducts.value.forEach(p => { if (p.category) set.add(p.category); });
  return [...set].sort();
});

// 直播筛选选项（v3.1.61：三选项，直播中包含直播中+回放中）
const liveStatusOptions = [
  { value: 'live', label: '直播中' },
  { value: 'upcoming', label: '直播预告' },
  { value: 'ended', label: '观看记录' },
];

// ============================================
// 精选商品 — 全部可见商品，叠加模式排序，无上限（BR-SHP-030 多维度排序链 + 可见范围过滤 v3.1.30）
// ============================================
const allFeaturedProducts = computed<Product[]>(() => {
  // 第一步：按用户可见范围过滤数据源
  const boundProjectIds = userStore.boundProjectIds;
  const visibilityResult = filterByVisibility({
    items: projectStore.products.filter(p => p.status === 'on_sale') as any,
    boundProjectIds,
    mode: boundProjectIds.length ? 'bound_projects' : 'all',
    fallback: { mode: 'loose', mode_description: '不足时补足平台内容', fallback_label: '平台精选' },
  });

  // v3.1.37 BR-SHP-043 Layer1：过滤掉 inactive 项目的商品
  const activeFiltered = filterByActiveProject(visibilityResult.items as any);

  // 第二步：推荐引擎排序（手动推荐 + 默认规则叠加，无上限）
  return getRecommendItems<any>({
    targetType: 'product',
    recommendConfigs: appConfigStore.productRecommendConfigs,
    allItems: activeFiltered as any,
    idField: 'product_id',
    ruleId: appConfigStore.mallFeaturedProductRule?.rule_id, // v3.1.31：接入规则引擎
  }) as Product[];
});

// ============================================
// 精选直播 — 全部可见直播，叠加模式排序，无上限（BR-SHP-030 多维度排序链 + 可见范围过滤 v3.1.30）
// ============================================
const allFeaturedLives = computed<LiveRoom[]>(() => {
  // 第一步：按用户可见范围过滤数据源
  const boundProjectIds = userStore.boundProjectIds;
  const visibilityResult = filterByVisibility({
    items: projectStore.liveRooms as any,
    boundProjectIds,
    mode: boundProjectIds.length ? 'bound_projects' : 'all',
    fallback: { mode: 'loose', mode_description: '不足时补足平台内容', fallback_label: '平台精选' },
  });

  // v3.1.37 BR-SHP-043 Layer1：过滤掉 inactive 项目的直播
  const activeFiltered = filterByActiveProject(visibilityResult.items as any);

  // 第二步：按直播可见范围权限过滤（邀请制）
  const firstBinding = userStore.userStoreBindings.find(
    b => b.user_id === userStore.currentUser.user_id
  );
  const visibleLives = filterVisibleLives({
    lives: activeFiltered as any,
    userInviterId: firstBinding?.inviter_id,
    userStoreId: firstBinding?.store_id,
    userProjectId: firstBinding?.project_id,
  });

  // 第三步：推荐引擎排序（手动推荐 + 默认规则叠加，无上限）
  return getRecommendItems<any>({
    targetType: 'live',
    recommendConfigs: appConfigStore.liveRecommendConfigs,
    allItems: visibleLives as any,
    idField: 'live_id',
    ruleId: appConfigStore.mallFeaturedLiveRule?.rule_id, // v3.1.31：接入规则引擎
  }) as LiveRoom[];
});

// ============================================
// 分页（每页20条，加载更多模式）
// ============================================
const PAGE_SIZE = 20;

// 精选商品分页（基于筛选后的数据）
const productPage = ref(1);
const productTotalPages = computed(() => Math.ceil(filteredFeaturedProducts.value.length / PAGE_SIZE));
const pagedFeaturedProducts = computed(() =>
  filteredFeaturedProducts.value.slice(0, productPage.value * PAGE_SIZE)
);
// 切换Tab或筛选条件时重置分页
watch(mode, (m) => { if (m === 'featuredProducts') productPage.value = 1; });
watch(filterProductCategory, () => { productPage.value = 1; });

// 精选直播分页（基于筛选后的数据）
const livePage = ref(1);
const liveTotalPages = computed(() => Math.ceil(filteredFeaturedLives.value.length / PAGE_SIZE));
const pagedFeaturedLives = computed(() =>
  filteredFeaturedLives.value.slice(0, livePage.value * PAGE_SIZE)
);
watch(mode, (m) => { if (m === 'featuredLives') livePage.value = 1; });
watch(filterLiveStatus, () => { livePage.value = 1; });

// ============================================
// 项目列表 — 接入 sc-mall-projects 场景规则引擎排序，支持按行业筛选
// v3.1.34：项目列表Tab接入规则引擎（sc-mall-projects 场景，无上限）
// ============================================
const sortedProjects = computed(() => {
  // 第一步：按用户可见范围过滤数据源
  // v3.1.38：项目列表按会员关系(joinedProjectIds)过滤，而非门店绑定(boundProjectIds)
  // 这样未绑定门店的项目也能在商城列表中显示，门店Tab会显示"绑定门店指引"引导页
  const joinedProjectIds = userStore.joinedProjectIds;
  const visibilityResult = filterByVisibility({
    items: projectStore.projects as any,
    boundProjectIds: joinedProjectIds,
    mode: joinedProjectIds.length ? 'bound_projects' : 'all',
    fallback: { mode: 'loose', mode_description: '不足时补足平台内容', fallback_label: '平台精选' },
  });

  // v3.1.37 BR-SHP-043 Layer1：过滤掉 inactive 项目
  const activeFiltered = filterActiveProjects(visibilityResult.items as any);

  // 第二步：推荐引擎排序（手动推荐 + 规则叠加，无上限）
  return getRecommendItems<any>({
    targetType: 'project',
    recommendConfigs: appConfigStore.projectRecommendConfigs,
    allItems: activeFiltered as any,
    idField: 'project_id',
    ruleId: appConfigStore.mallProjectsRule?.rule_id, // v3.1.34：接入商城列表场景规则引擎
  });
});

const filteredProjects = computed(() => {
  if (!filterIndustry.value) return sortedProjects.value;
  return sortedProjects.value.filter((p: any) => p.industry === filterIndustry.value);
});

// ============================================
// 精选商品 — 按类目筛选（在排序结果上二次筛选）
// ============================================
const filteredFeaturedProducts = computed(() => {
  if (!filterProductCategory.value) return allFeaturedProducts.value;
  return allFeaturedProducts.value.filter(p => p.category === filterProductCategory.value);
});

// ============================================
// 精选直播 — 按状态筛选（在排序结果上二次筛选）
// ============================================
const filteredFeaturedLives = computed(() => {
  // v3.1.61：「直播中」选项包含 live + replay 两种状态
  if (filterLiveStatus.value === 'live') {
    return allFeaturedLives.value.filter(l => l.status === 'live' || l.status === 'replay');
  }
  // v3.1.54：观看记录 = 已结束 + 直播中（直播中的可点击观看直播）
  if (filterLiveStatus.value === 'ended') {
    return allFeaturedLives.value.filter(l => l.status === 'ended' || l.status === 'live');
  }
  return allFeaturedLives.value.filter(l => l.status === filterLiveStatus.value);
});

// v3.1.54：直播预约状态（localStorage 持久化，key: mall-live-reservations）
const reservedLiveIds = ref<string[]>([]);
try {
  const saved = localStorage.getItem('mall-live-reservations');
  if (saved) reservedLiveIds.value = JSON.parse(saved);
} catch { /* 忽略解析错误 */ }

function isLiveReserved(liveId: string): boolean {
  return reservedLiveIds.value.includes(liveId);
}

function toggleLiveReserve(liveId: string) {
  const idx = reservedLiveIds.value.indexOf(liveId);
  if (idx >= 0) reservedLiveIds.value.splice(idx, 1);
  else reservedLiveIds.value.push(liveId);
  localStorage.setItem('mall-live-reservations', JSON.stringify(reservedLiveIds.value));
}

// ============================================
// 路由查询参数支持已移至顶部初始化（首页"更多"跳转到指定Tab）
// ============================================

function goProductDetail(productId: string) {
  router.push(`/app/product/${productId}`);
}

function goLiveDetail(liveId: string) {
  router.push(`/app/live/${liveId}`);
}

// ========== 精选直播列表辅助函数 ==========
function liveStatusText(status: string): string {
  const map: Record<string, string> = { live: '直播中', upcoming: '预告', replay: '回放', ended: '已结束' };
  return map[status] || '直播中';
}

function liveEmoji(title: string): string {
  if (!title) return '📺';
  if (title.includes('清洁') || title.includes('收纳')) return '🧹';
  if (title.includes('美食') || title.includes('厨房')) return '🍳';
  if (title.includes('健身') || title.includes('运动')) return '💪';
  if (title.includes('数码') || title.includes('新品')) return '🎮';
  if (title.includes('日用')) return '🏠';
  if (title.includes('营养') || title.includes('维生素')) return '💊';
  if (title.includes('滋补') || title.includes('养生')) return '🌿';
  return '📺';
}

function viewerText(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  return String(count || 0);
}

function formatLiveTime(startedAt: string, status: string): string {
  try {
    const d = new Date(startedAt);
    const pad = (n: number) => String(n).padStart(2, '0');
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    if (status === 'upcoming') return `${month}/${day} ${hh}:${mm} 开播`;
    if (status === 'live') return `${month}/${day} ${hh}:${mm} 开播中`;
    if (status === 'replay') return `${month}/${day} ${hh}:${mm} 回放`;
    return `${month}/${day} ${hh}:${mm} 结束`;
  } catch {
    return '';
  }
}

function liveProjectName(projectId: string): string {
  const p = projectStore.getProjectById(projectId);
  return p?.mall_name || p?.name || '';
}
</script>

<style scoped>
.mall-page { padding-bottom: 16px; }
/* Tab导航 — 重点突出，粘性定位 */
.mp-switch {
  display: flex;
  padding: 14px 16px;
  background: #fff;
  gap: 28px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.mp-switch-item {
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding-bottom: 6px;
  position: relative;
  white-space: nowrap;
  transition: color 0.2s;
}
.mp-switch-item:hover { color: #666; }
.mp-switch-item.active {
  color: #222;
  font-weight: 700;
  font-size: 17px;
}
.mp-switch-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: #FF6B35;
  border-radius: 2px;
}
.mp-content { padding: 12px; }
.mp-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
}
.mp-filter::-webkit-scrollbar { display: none; }
.mp-filter-item {
  flex-shrink: 0;
  padding: 4px 14px;
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  border-radius: 14px;
  cursor: pointer;
}
.mp-filter-item.active {
  color: #fff;
  background: #FF6B35;
}
.mp-project-list { display: flex; flex-direction: column; }
.mp-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mp-section-count {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}
.mp-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.mp-live-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 单个直播卡片 — 横向布局 */
.mpl-item {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}
.mpl-item:active { transform: scale(0.98); }

/* 封面区 — 左侧固定宽度 */
.mpl-cover {
  width: 140px;
  height: 90px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mpl-cover--live {
  background: linear-gradient(135deg, #FF6B35 0%, #FF4D4F 50%, #FF8F35 100%);
}
.mpl-cover--upcoming {
  background: linear-gradient(135deg, #fa8c35 0%, #ffa940 100%);
}
.mpl-cover--replay {
  background: linear-gradient(135deg, #595959 0%, #8c8c8c 100%);
}
.mpl-cover--ended {
  background: linear-gradient(135deg, #bfbfbf 0%, #d9d9d9 100%);
}
.mpl-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mpl-cover-emoji {
  font-size: 36px;
}

/* 状态标签 */
.mpl-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  backdrop-filter: blur(4px);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
}
.mpl-badge--live { background: rgba(245,34,45,0.85); }
.mpl-badge--upcoming { background: rgba(250,140,22,0.85); }
.mpl-badge--replay { background: rgba(0,0,0,0.55); }
.mpl-badge--ended { background: rgba(0,0,0,0.45); }
.mpl-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  animation: mpl-pulse 1.5s infinite;
}
@keyframes mpl-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* 观看人数 */
.mpl-viewers {
  position: absolute;
  bottom: 6px;
  left: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
}

/* 信息区 — 右侧自动填充 */
.mpl-info {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}
.mpl-title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.mpl-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.mpl-anchor {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #888;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mpl-anchor-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mpl-project {
  font-size: 10px;
  color: #FF6B35;
  background: rgba(255,107,53,0.08);
  padding: 2px 6px;
  border-radius: 8px;
  flex-shrink: 0;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mpl-time {
  font-size: 10px;
  color: #bbb;
}
/* v3.1.54 操作按钮：预约/观看直播 */
.mpl-actions { margin-top: 2px; }
.mpl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  padding: 0 14px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}
.mpl-btn--reserve {
  color: #FF6B35;
  background: rgba(255,107,53,0.08);
  border-color: rgba(255,107,53,0.5);
}
.mpl-btn--reserve:active { transform: scale(0.96); }
.mpl-btn--reserve.is-reserved {
  color: #999;
  background: #f5f5f5;
  border-color: #e5e5e5;
}
.mpl-btn--watch {
  color: #fff;
  background: linear-gradient(135deg, #FF6B35, #FF4D4F);
}
.mpl-btn--watch:active { transform: scale(0.96); }
.mp-empty { text-align: center; color: #bbb; padding: 40px 0; font-size: 14px; }
.mp-load-more {
  text-align: center;
  color: #FF6B35;
  font-size: 13px;
  padding: 16px 0;
  cursor: pointer;
  font-weight: 600;
}
.mp-bottom {
  text-align: center;
  color: #ddd;
  font-size: 12px;
  padding: 20px 0 8px;
}
</style>
