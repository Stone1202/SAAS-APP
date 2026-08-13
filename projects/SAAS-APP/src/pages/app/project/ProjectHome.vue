<template>
  <!-- 项目首页 — 真机风格 -->
  <div class="project-home">
    <!-- v3.1.37 BR-SHP-043 Layer2：项目停用提示条 -->
    <div class="project-disabled-bar" v-if="!projectActive">
      <span class="pdb-icon">⚠️</span>
      <span class="pdb-text">该项目已停用，浏览和查看仍可使用，但无法下单或参与互动</span>
    </div>

    <!-- Banner轮播 — 与金刚区调换位置，Banner在前 -->
    <div class="banner-section" v-if="configBanners.length">
      <div class="banner-swiper">
        <div class="banner-track" :style="{ transform: `translateX(-${bannerIdx * 100}%)` }">
          <div
            v-for="(b, i) in configBanners"
            :key="b.id"
            class="banner-slide"
            :style="{ background: bannerGradient(i) }"
            @click="onBannerClick(b)"
          >
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <span class="banner-emoji">🖼️</span>
              <div class="banner-text">
                <div class="banner-title">{{ project?.name || '项目活动' }}</div>
                <div class="banner-subtitle">点击查看详情</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="banner-dots" v-if="configBanners.length > 1">
        <span
          v-for="(_, i) in configBanners"
          :key="i"
          :class="['bd-dot', { active: i === bannerIdx }]"
          @click="bannerIdx = i"
        ></span>
      </div>
    </div>

    <!-- 金刚区 — 与Banner调换位置，金刚区在后 -->
    <div class="quick-zone" v-if="quickEntries.length">
      <div
        v-for="entry in quickEntries"
        :key="entry.id"
        class="qz-item"
        @click="onQuickClick(entry)"
      >
        <div class="qz-icon-box" :style="{ background: entryGradient(entry.sort) }">
          <span class="qz-icon">{{ entry.icon }}</span>
        </div>
        <span class="qz-label">{{ entry.name }}</span>
      </div>
    </div>

    <!-- 直播推荐 — 从ProjectHomeConfig.live_recommend读取 -->
    <div class="section" v-if="topLives.length">
      <div class="section-header">
        <div class="sh-left">
          <span class="sh-icon">📺</span>
          <span class="sh-title">直播推荐</span>
        </div>
        <div class="sh-more" @click="router.push(`/app/project/${projectId}/mall?tab=live`)">
          更多 <span class="sh-arrow">›</span>
        </div>
      </div>
      <div class="live-grid-2col">
        <LiveCard
          v-for="l in topLives"
          :key="l.live_id"
          :live="l"
          :project-id="projectId"
          @click="goLiveDetail(l.live_id)"
        />
      </div>
    </div>

    <!-- 精选商品 — 从ProjectHomeConfig.recommend_products读取 -->
    <div class="section" v-if="recommendProducts.length">
      <div class="section-header">
        <div class="sh-left">
          <span class="sh-icon">🔥</span>
          <span class="sh-title">商品推荐</span>
        </div>
        <div class="sh-more" @click="router.push(`/app/project/${projectId}/mall?tab=product`)">
          更多 <span class="sh-arrow">›</span>
        </div>
      </div>
      <div class="product-grid-2col">
        <ProductCard
          v-for="p in recommendProducts"
          :key="p.product_id"
          :product="p"
          :project-id="projectId"
          @click="goProductDetail(p.product_id)"
        />
      </div>
    </div>

    <!-- 底部安全区 — 为底部导航留出空间 -->
    <div class="safe-bottom"></div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-009', '项目首页');
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import { useAppConfigStore } from '../../../stores/app-config-store';
import { useAppNavigation } from '../../../composables/useAppNavigation';
import { useProjectStatusFilter } from '../../../composables/useProjectStatusFilter';
import { sortLivesByDefaultRule } from '../../../contracts/recommend-dimensions';
import ProductCard from '../../../components/app/product/ProductCard.vue';
import LiveCard from '../../../components/app/live/LiveCard.vue';
import type { Product, LiveRoom } from '../../../contracts';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const appConfig = useAppConfigStore();
// v3.1.45: 统一跳转入口
const { navigateByJumpType } = useAppNavigation();
const { isProjectActive } = useProjectStatusFilter();

const projectId = computed(() => route.params.projectId as string);
const project = computed(() => store.getProjectById(projectId.value));

// v3.1.37 BR-SHP-043 Layer2：项目停用状态（项目首页仍允许查看，但显示提示条）
const projectActive = computed(() => isProjectActive(projectId.value));

// 项目首页配置（从租户后台配置读取）
const homeConfig = computed(() => store.homeConfigByProject(projectId.value));

// Banner — 从ProjectHomeConfig.banner_images读取，按sort升序
const configBanners = computed(() =>
  [...(homeConfig.value?.banner_images || [])].sort((a, b) => a.sort - b.sort)
);
const bannerIdx = ref(0);
let bannerTimer: number | undefined;

function bannerGradient(i: number) {
  const colors = ['#FF6B35', '#667eea', '#11998e', '#0F2027', '#fa709a'];
  const c = colors[i % colors.length];
  return `linear-gradient(135deg, ${c}, ${c}dd)`;
}

function startBannerLoop() {
  if (bannerTimer) clearInterval(bannerTimer);
  if (configBanners.value.length <= 1) return;
  bannerTimer = window.setInterval(() => {
    bannerIdx.value = (bannerIdx.value + 1) % configBanners.value.length;
  }, 3500);
}
onMounted(() => startBannerLoop());
onUnmounted(() => { if (bannerTimer) clearInterval(bannerTimer); });

// 金刚区 — 从ProjectHomeConfig.quick_entries读取，按sort升序
const quickEntries = computed(() =>
  [...(homeConfig.value?.quick_entries || [])].sort((a, b) => a.sort - b.sort)
);

function entryGradient(sort: number) {
  const gradients = [
    'linear-gradient(135deg, #FF6B6B, #EE5A24)',
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #f5af19, #f12711)',
  ];
  return gradients[sort % gradients.length];
}

// 商品推荐 — 按上架时间降序（最新在前），最多50个
const recommendProducts = computed<Product[]>(() => {
  const ids = homeConfig.value?.recommend_products || [];
  const products = ids.map(id => store.getProductById(id)).filter(Boolean) as Product[];
  const source = products.length ? products : store.productsByProject(projectId.value);
  // 按上架时间降序（最新在前）
  return [...source]
    .sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 50);
});

// 直播推荐 — v3.1.36 BR-SHP-041 默认规则（状态排序 live→upcoming→replay + 同状态 started_at 倒序，排除 ended）+ 默认展示前4条
const topLives = computed<LiveRoom[]>(() => {
  const ids = homeConfig.value?.live_recommend || [];
  const lives = ids.map(id => store.getLiveById(id)).filter(Boolean) as LiveRoom[];
  const source = lives.length ? lives : store.livesByProject(projectId.value);
  // 使用默认规则排序 + 截取前4条
  return sortLivesByDefaultRule(source, 4);
});

// 事件 — Banner点击跳转（v3.1.45 统一接入 composable）
function onBannerClick(b: any) {
  navigateByJumpType(
    b.jump_type || '',
    b.jump_id || '',
    projectId.value,
    b.link
  );
}

// 事件 — 金刚区点击跳转（v3.1.45 统一接入 composable + 名称回退）
function onQuickClick(entry: any) {
  // 优先走 jump_type/jump_id 体系（含 link 回退）
  if (entry.jump_type && entry.jump_id) {
    navigateByJumpType(
      entry.jump_type,
      entry.jump_id,
      projectId.value,
      entry.link
    );
    return;
  }
  // 名称回退（兼容极旧数据）
  if (entry.name?.includes('商品') || entry.name?.includes('分类')) {
    router.push(`/app/project/${projectId.value}/mall`);
  } else if (entry.name?.includes('门店')) {
    router.push(`/app/project/${projectId.value}/stores`);
  } else if (entry.name?.includes('会员')) {
    router.push(`/app/project/${projectId.value}/member`);
  } else if (entry.link && entry.link.startsWith('/')) {
    // 兼容旧数据
    router.push(entry.link);
  }
}

function goProductDetail(productId: string) {
  router.push(`/app/product/${productId}`);
}

function goLiveDetail(liveId?: string) {
  if (liveId) router.push(`/app/live/${liveId}`);
}
</script>

<style scoped>
.project-home {
  padding: 0;
  background: #f5f5f5;
}

/* v3.1.37 BR-SHP-043 项目停用提示条 */
.project-disabled-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #fff3e0, #fff8e1);
  border-bottom: 1px solid #ffe0b2;
  font-size: 12px;
  color: #e65100;
}
.pdb-icon { font-size: 16px; }
.pdb-text { flex: 1; line-height: 1.4; }

/* 搜索结果区样式已移除（搜索入口已去掉） */

/* Banner */
.banner-section {
  margin: 0 16px 12px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
.banner-swiper {
  overflow: hidden;
  border-radius: 12px;
}
.banner-track {
  display: flex;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.banner-slide {
  min-width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: relative;
  cursor: pointer;
}
.banner-overlay {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 100px;
  height: 100px;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}
.banner-content {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}
.banner-emoji { font-size: 42px; flex-shrink: 0; }
.banner-text { color: #fff; }
.banner-title { font-size: 18px; font-weight: 700; letter-spacing: 1px; }
.banner-subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; }
.banner-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px 0 0;
}
.bd-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  transition: all 0.3s;
  cursor: pointer;
}
.bd-dot.active {
  width: 18px;
  background: #FF6B35;
}

/* 金刚区 */
.quick-zone {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 4px;
  padding: 12px 16px;
  margin: 0 12px 12px;
  background: #fff;
  border-radius: 14px;
}
.qz-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}
.qz-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qz-icon { font-size: 22px; }
.qz-label { font-size: 11px; color: #555; font-weight: 500; }

/* 段落通用 */
.section {
  margin: 10px 12px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 10px;
}
.sh-left { display: flex; align-items: center; gap: 6px; }
.sh-icon { font-size: 18px; }
.sh-title { font-size: 16px; font-weight: 700; color: #111; }
.sh-more {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.sh-arrow { font-size: 16px; margin-left: 2px; }

/* 商品双列网格 — 对齐 */
.product-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 4px 12px 14px;
}

/* 直播双列网格 — 一行两个，4个分两行 */
.live-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 12px 14px;
}

/* 底部 — 为底部固定导航留出空间 */
.safe-bottom { height: 60px; }
</style>
