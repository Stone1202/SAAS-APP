<template>
  <!-- 项目首页 — 真机风格 -->
  <div class="project-home">
    <!-- 搜索栏 -->
    <div class="search-bar" @click="onSearchClick">
      <svg class="sb-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span class="sb-placeholder">搜索商品、直播、门店...</span>
      <span class="sb-btn">搜索</span>
    </div>

    <!-- Banner轮播 -->
    <div class="banner-section">
      <div class="banner-swiper" ref="bannerRef">
        <div class="banner-track" :style="{ transform: `translateX(-${bannerIdx * 100}%)` }">
          <div
            v-for="(b, i) in banners"
            :key="i"
            class="banner-slide"
            :style="bannerStyle(i)"
            @click="onBannerClick(b)"
          >
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <span class="banner-emoji">{{ b.emoji }}</span>
              <div class="banner-text">
                <div class="banner-title">{{ b.title }}</div>
                <div class="banner-subtitle">{{ b.subtitle }}</div>
              </div>
              <div class="banner-tag" v-if="b.tag">{{ b.tag }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="banner-dots">
        <span
          v-for="(_, i) in banners"
          :key="i"
          :class="['bd-dot', { active: i === bannerIdx }]"
          @click="bannerIdx = i"
        ></span>
      </div>
    </div>

    <!-- 金刚区 — 快速入口 -->
    <div class="quick-zone">
      <div
        v-for="entry in quickEntries"
        :key="entry.key"
        class="qz-item"
        @click="onQuickClick(entry)"
      >
        <div class="qz-icon-box" :style="{ background: entry.gradient }">
          <span class="qz-icon">{{ entry.icon }}</span>
        </div>
        <span class="qz-label">{{ entry.label }}</span>
      </div>
    </div>

    <!-- 限时活动楼层 -->
    <div class="section" v-if="flashProducts.length">
      <div class="section-header">
        <div class="sh-left">
          <span class="sh-icon">⚡</span>
          <span class="sh-title">限时秒杀</span>
          <span class="sh-countdown">
            <span class="ct-block">{{ timer.hours }}</span>:<span class="ct-block">{{ timer.minutes }}</span>:<span class="ct-block">{{ timer.seconds }}</span>
          </span>
        </div>
        <div class="sh-more" @click="router.push(`/app/project/${projectId}/stores`)">
          更多 <span class="sh-arrow">›</span>
        </div>
      </div>
      <div class="flash-list">
        <div
          v-for="p in flashProducts"
          :key="p.id"
          class="flash-item"
        >
          <div class="flash-img-box">
            <span class="flash-emoji">{{ productEmoji(p) }}</span>
            <div class="flash-discount">-{{ p.discount || 30 }}%</div>
          </div>
          <div class="flash-price-row">
            <span class="flash-price">¥{{ p.price }}</span>
            <span class="flash-original">¥{{ Math.round(p.price * 1.5) }}</span>
          </div>
          <div class="flash-progress">
            <div class="fp-bar"><div class="fp-fill" :style="{ width: `${Math.random() * 50 + 30}%` }"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 精选商品 -->
    <div class="section">
      <div class="section-header">
        <div class="sh-left">
          <span class="sh-icon">🔥</span>
          <span class="sh-title">为你推荐</span>
        </div>
        <div class="sh-more" @click="router.push(`/app/project/${projectId}/stores`)">
          更多 <span class="sh-arrow">›</span>
        </div>
      </div>
      <div class="product-grid-2col">
        <ProductCard
          v-for="p in recommendProducts"
          :key="p.id"
          :product="p"
          :project-id="projectId"
        />
      </div>
    </div>

    <!-- 热门直播 -->
    <div class="section">
      <div class="section-header">
        <div class="sh-left">
          <span class="sh-icon">📺</span>
          <span class="sh-title">热门直播</span>
        </div>
        <div class="sh-more" @click="router.push(`/app/project/${projectId}/lives`)">
          更多 <span class="sh-arrow">›</span>
        </div>
      </div>
      <div class="live-scroll">
        <LiveCard
          v-for="l in topLives"
          :key="l.id"
          :live="l"
          :project-id="projectId"
        />
      </div>
    </div>

    <!-- 底部安全区 -->
    <div class="safe-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import ProductCard from '../../../components/app/product/ProductCard.vue';
import LiveCard from '../../../components/app/live/LiveCard.vue';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();

const projectId = computed(() => route.params.projectId as string);

// Banner
interface BannerItem { emoji: string; title: string; subtitle: string; tag?: string; color: string; }
const banners: BannerItem[] = [
  { emoji: '🎉', title: '新品首发', subtitle: '全场低至5折', tag: '首发', color: '#FF6B35' },
  { emoji: '🎁', title: '会员专享', subtitle: '积分兑换好礼', tag: '会员', color: '#667eea' },
  { emoji: '🏷️', title: '限时特惠', subtitle: '每日秒杀进行中', tag: '促销', color: '#11998e' },
];
const bannerIdx = ref(0);
let bannerTimer: number | undefined;
function bannerStyle(i: number) {
  const colors = banners.map(b => b.color);
  return { background: `linear-gradient(135deg, ${colors[i]}, ${colors[i]}dd)` };
}

function startBannerLoop() {
  bannerTimer = window.setInterval(() => {
    bannerIdx.value = (bannerIdx.value + 1) % banners.length;
  }, 3500);
}
onMounted(() => startBannerLoop());
onUnmounted(() => { if (bannerTimer) clearInterval(bannerTimer); });

// 秒杀倒计时
const timer = reactiveCountdown();

function reactiveCountdown() {
  const now = Date.now();
  const end = now + (22 * 3600 + 15 * 60 + 38) * 1000;
  const s = ref({ hours: '22', minutes: '15', seconds: '38' });
  let t: number;
  function tick() {
    const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
    s.value.hours = String(Math.floor(diff / 3600)).padStart(2, '0');
    s.value.minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    s.value.seconds = String(diff % 60).padStart(2, '0');
    if (diff <= 0) return;
  }
  onMounted(() => { tick(); t = window.setInterval(tick, 1000); });
  onUnmounted(() => { if (t) clearInterval(t); });
  return s;
}

// 金刚区
interface QuickEntry { key: string; icon: string; label: string; gradient: string; }
const quickEntries: QuickEntry[] = [
  { key: 'hot', icon: '🔥', label: '热卖排行', gradient: 'linear-gradient(135deg, #FF6B6B, #EE5A24)' },
  { key: 'new', icon: '✨', label: '新品首发', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { key: 'coupon', icon: '🎟️', label: '领券中心', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { key: 'live', icon: '📺', label: '直播间', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { key: 'sign', icon: '📅', label: '每日签到', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { key: 'free', icon: '🎁', label: '试用中心', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { key: 'rank', icon: '🏆', label: '品牌榜', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { key: 'more', icon: '📋', label: '全部分类', gradient: 'linear-gradient(135deg, #f5af19, #f12711)' },
];

// 商品数据
const allProducts = computed(() => store.productsByProject(projectId.value));

const flashProducts = computed(() => allProducts.value.slice(0, 4));
const recommendProducts = computed(() => allProducts.value.slice(0, 8));

// 直播数据
const allLives = computed(() => store.livesByProject(projectId.value));
const topLives = computed(() => allLives.value.slice(0, 3));

// 商品emoji
function productEmoji(p: any) {
  if (p.name?.includes('拖把')) return '🧹';
  if (p.name?.includes('保温壶')) return '🍶';
  if (p.name?.includes('收纳')) return '📦';
  if (p.name?.includes('洗衣')) return '🧴';
  if (p.name?.includes('榨汁')) return '🧃';
  if (p.name?.includes('便当')) return '🍱';
  if (p.name?.includes('瑜伽')) return '🧘';
  if (p.name?.includes('围炉')) return '🔥';
  if (p.name?.includes('跑鞋')) return '👟';
  if (p.name?.includes('蓝牙')) return '🎧';
  if (p.name?.includes('平板')) return '📱';
  return '📦';
}

// 事件
function onSearchClick() { /* 搜索 */ }
function onBannerClick(b: BannerItem) { /* Banner点击 */ }
function onQuickClick(entry: QuickEntry) {
  if (entry.key === 'live') router.push(`/app/project/${projectId.value}/lives`);
  else if (entry.key === 'more') router.push(`/app/project/${projectId.value}/stores`);
}
</script>

<style scoped>
.project-home {
  padding: 0;
  background: #f5f5f5;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  margin: 10px 16px;
  padding: 10px 14px;
  background: #fff;
  border-radius: 22px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.sb-search-icon { flex-shrink: 0; }
.sb-placeholder {
  flex: 1;
  margin-left: 8px;
  font-size: 13px;
  color: #bbb;
}
.sb-btn {
  padding: 4px 16px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 14px;
}

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
.banner-tag {
  position: absolute;
  top: -30px;
  right: -20px;
  padding: 2px 10px;
  background: rgba(255,255,255,0.3);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
}
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
.sh-countdown {
  display: flex;
  align-items: center;
  gap: 1px;
  margin-left: 10px;
  font-size: 13px;
  color: #FF6B35;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.ct-block {
  min-width: 22px;
  padding: 1px 4px;
  background: #333;
  color: #fff;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
}
.sh-more {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.sh-arrow { font-size: 16px; margin-left: 2px; }

/* 秒杀 */
.flash-list {
  display: flex;
  gap: 8px;
  padding: 0 16px 14px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.flash-list::-webkit-scrollbar { display: none; }
.flash-item {
  min-width: 92px;
  flex-shrink: 0;
  cursor: pointer;
}
.flash-img-box {
  width: 92px;
  height: 92px;
  border-radius: 10px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.flash-emoji { font-size: 40px; }
.flash-discount {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px 6px;
  background: linear-gradient(135deg, #F5222D, #FF4D4F);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 0 10px 0 8px;
}
.flash-price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 6px;
}
.flash-price { font-size: 16px; font-weight: 700; color: #F5222D; }
.flash-original { font-size: 10px; color: #bbb; text-decoration: line-through; }
.flash-progress { margin-top: 4px; }
.fp-bar {
  height: 4px;
  background: #ffe0e0;
  border-radius: 2px;
  overflow: hidden;
}
.fp-fill {
  height: 100%;
  background: linear-gradient(90deg, #F5222D, #FF4D4F);
  border-radius: 2px;
}

/* 商品双列网格 */
.product-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 4px 16px 16px;
  background: #f5f5f5;
}

/* 直播横向滚动 */
.live-scroll {
  display: flex;
  gap: 10px;
  padding: 0 16px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.live-scroll::-webkit-scrollbar { display: none; }

/* 底部 */
.safe-bottom { height: 24px; }
</style>
