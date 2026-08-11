<template>
  <!-- 平台首页 — "追伴" -->
  <div class="platform-home">
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
      <div class="ph-msg-btn" @click="$router.push('/app/message')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="ph-badge" v-if="unread">2</span>
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

    <!-- Banner广告轮播 -->
    <div class="ph-section" v-if="banners.length">
      <BannerCarousel :banners="banners" />
    </div>

    <!-- 金刚区 -->
    <KingKongGrid :entries="kingKongs" />

    <!-- ========== 直播推荐（置顶） ========== -->
    <div class="ph-section" v-if="liveRecommends.length">
      <div class="ph-sec-header">
        <div class="ph-sec-left">
          <span class="ph-sec-icon">📺</span>
          <span class="ph-sec-title">直播推荐</span>
          <span class="ph-sec-live-dot"></span>
          <span class="ph-sec-live-text">{{ liveCount }}场直播中</span>
        </div>
        <span class="ph-sec-more" @click="$router.push('/app/mall')">更多 ›</span>
      </div>
      <div class="ph-live-scroll">
        <LiveCard
          v-for="lv in liveRecommends"
          :key="lv.live_id"
          :live="lv"
          :project-id="lv.project_id"
        />
      </div>
    </div>

    <!-- ========== 商品推荐 ========== -->
    <div class="ph-section" v-if="productRecommends.length">
      <div class="ph-sec-header">
        <div class="ph-sec-left">
          <span class="ph-sec-icon">🔥</span>
          <span class="ph-sec-title">为你推荐</span>
        </div>
        <span class="ph-sec-more" @click="$router.push('/app/mall')">更多 ›</span>
      </div>
      <div class="ph-product-grid">
        <ProductCard
          v-for="p in productRecommends"
          :key="p.product_id"
          :product="p"
        />
      </div>
    </div>

    <!-- ========== 推荐好物（固定规则） ========== -->
    <div class="ph-section" v-if="goodGoods.length">
      <div class="ph-sec-header">
        <div class="ph-sec-left">
          <span class="ph-sec-icon">✨</span>
          <span class="ph-sec-title">推荐好物</span>
        </div>
      </div>
      <div class="ph-product-grid">
        <ProductCard
          v-for="p in goodGoods"
          :key="p.product_id"
          :product="p"
        />
      </div>
    </div>

    <!-- 运营楼层 -->
    <div v-for="floor in floors" :key="floor.floor_id" class="ph-section">
      <OperationFloor :floor="floor" />
    </div>

    <div class="ph-bottom">— 已经到底啦 —</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppConfigStore } from '../../../stores/app-config-store';
import { useProjectStore } from '../../../stores/project-store';
import BannerCarousel from '../../../components/app/home/BannerCarousel.vue';
import KingKongGrid from '../../../components/app/home/KingKongGrid.vue';
import OperationFloor from '../../../components/app/home/OperationFloor.vue';
import ProductCard from '../../../components/app/product/ProductCard.vue';
import LiveCard from '../../../components/app/live/LiveCard.vue';

const router = useRouter();
const appConfig = useAppConfigStore();
const projectStore = useProjectStore();

// 未读消息
const unread = computed(() => appConfig.unreadCount || 0);

// Banner
const banners = computed(() => appConfig.bannersByPosition('platform_home'));

// 金刚区
const kingKongs = computed(() => appConfig.enabledKingKongs);

// 楼层
const floors = computed(() => appConfig.floorsByPosition('platform_home'));

// ========== 直播推荐 ==========
// 优先手动推荐，否则按规则（直播中按人数排序）
const liveRecommends = computed(() => {
  const manual = appConfig.liveRecommends;
  if (manual.length) {
    return manual.map(r => projectStore.getLiveById(r.target_id)).filter(Boolean) as any[];
  }
  // 规则推荐：全部直播中，按人数降序，取前6个
  const allLives = projectStore.liveRooms
    .filter(l => l.status === 'live')
    .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
    .slice(0, 6);
  return allLives;
});

const liveCount = computed(() => projectStore.liveRooms.filter(l => l.status === 'live').length);

// ========== 商品推荐 ==========
// 优先手动推荐，否则按规则（按销量降序，取前6个）
const productRecommends = computed(() => {
  const manual = appConfig.productRecommends;
  if (manual.length) {
    return manual.map(r => projectStore.getProductById(r.target_id)).filter(Boolean) as any[];
  }
  // 规则推荐：全部在售商品按销量降序
  return projectStore.products
    .filter(p => p.status === 'on_sale')
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 6);
});

// ========== 推荐好物（固定规则：上架时间最新 + 销量最高混合） ==========
const goodGoods = computed(() => {
  const onSale = projectStore.products.filter(p => p.status === 'on_sale');
  // 取最新上架的4个 + 销量最高的4个，去重
  const byNew = [...onSale].sort((a, b) =>
    new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  ).slice(0, 4);
  const bySales = [...onSale].sort((a, b) => (b.sales || 0) - (a.sales || 0));
  const merged = new Map<string, any>();
  byNew.forEach(p => merged.set(p.product_id, p));
  bySales.forEach(p => { if (!merged.has(p.product_id)) merged.set(p.product_id, p); });
  return Array.from(merged.values()).slice(0, 8);
});

// 搜索
function goSearch() {
  router.push('/app/search');
}
</script>

<style scoped>
.platform-home {
  background: #f5f5f5;
  padding-bottom: 16px;
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
.ph-sec-live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #F5222D;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
.ph-sec-live-text { font-size: 11px; color: #F5222D; font-weight: 600; }
.ph-sec-more { font-size: 12px; color: #999; cursor: pointer; }

/* 商品 */
.ph-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 直播 */
.ph-live-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.ph-live-scroll::-webkit-scrollbar { display: none; }

.ph-bottom {
  text-align: center;
  color: #ddd;
  font-size: 12px;
  padding: 20px 0 8px;
}
</style>
