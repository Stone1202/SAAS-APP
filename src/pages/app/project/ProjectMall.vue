<template>
  <!-- 项目商城页 — 商品/直播双Tab（FN-SHP-APP-009A 重构） -->
  <div class="project-mall">
    <!-- 顶部固定区：Tab + 搜索框（置顶，不随页面滑动） -->
    <div class="pm-top-fixed">
      <!-- Tab：商品 / 直播 -->
      <div class="pm-tabs">
        <span :class="['pm-tab', { active: tab === 'product' }]" @click="tab = 'product'">商品</span>
        <span :class="['pm-tab', { active: tab === 'live' }]" @click="tab = 'live'">直播</span>
      </div>

      <!-- 商品搜索框（当前页内搜索，只搜商品） -->
      <div v-if="tab === 'product'" class="pm-search-bar">
        <svg class="pms-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="productKeyword"
          class="pms-input"
          type="text"
          placeholder="搜索本店商品..."
        />
        <span v-if="productKeyword" class="pms-clear" @click="productKeyword = ''">✕</span>
      </div>

      <!-- 直播搜索框（当前页内搜索，只搜直播） -->
      <div v-if="tab === 'live'" class="pm-search-bar">
        <svg class="pms-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="liveKeyword"
          class="pms-input"
          type="text"
          placeholder="搜索本店直播..."
        />
        <span v-if="liveKeyword" class="pms-clear" @click="liveKeyword = ''">✕</span>
      </div>
    </div>

    <!-- ========== 商品Tab ========== -->
    <div v-if="tab === 'product'" class="pm-product-layout">
      <!-- 搜索框已移至顶部固定区 -->

      <!-- 搜索结果模式 -->
      <div v-if="productKeyword.trim()" class="pm-product-main">
        <div class="pm-result-tip">搜索结果 {{ filteredProducts.length }} 件</div>
        <div class="pm-product-grid" v-if="filteredProducts.length">
          <ProductCard
            v-for="p in filteredProducts"
            :key="p.product_id"
            :product="p"
            :project-id="projectId"
            @click="goProductDetail(p.product_id)"
          />
        </div>
        <div v-else class="pm-empty">
          <span class="pme-icon">📦</span>
          <span class="pme-text">未找到相关商品</span>
        </div>
      </div>

      <!-- 分类布局：左分类 + 右商品（外卖平台风格） -->
      <div v-else class="pm-category-layout">
        <!-- 左侧分类导航 -->
        <div class="pm-cat-sidebar">
          <div
            :class="['pmc-side-item', { active: activeCategory === 'all' }]"
            @click="activeCategory = 'all'"
          >全部</div>
          <div
            v-for="cat in categories"
            :key="cat.category_id"
            :class="['pmc-side-item', { active: activeCategory === cat.category_id }]"
            @click="activeCategory = cat.category_id"
          >
            <span class="pmc-side-icon" v-if="cat.icon">{{ cat.icon }}</span>
            <span class="pmc-side-name">{{ cat.name }}</span>
          </div>
          <div v-if="!categories.length" class="pmc-side-empty">暂无分类</div>
        </div>

        <!-- 右侧商品列表 -->
        <div class="pm-cat-content">
          <div class="pm-product-grid" v-if="filteredProducts.length">
            <ProductCard
              v-for="p in filteredProducts"
              :key="p.product_id"
              :product="p"
              :project-id="projectId"
              @click="goProductDetail(p.product_id)"
            />
          </div>
          <div v-else class="pm-empty">
            <span class="pme-icon">📦</span>
            <span class="pme-text">该分类下暂无商品</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 直播Tab ========== -->
    <div v-if="tab === 'live'" class="pm-live-layout">
      <!-- 搜索框已移至顶部固定区 -->

      <!-- 直播状态筛选 -->
      <div class="pm-status-filter">
        <span
          :class="['pmf-item', { active: !filterStatus }]"
          @click="filterStatus = undefined"
        >全部</span>
        <span
          v-for="st in statusOptions"
          :key="st.value"
          :class="['pmf-item', { active: filterStatus === st.value }]"
          @click="filterStatus = st.value"
        >{{ st.label }}</span>
      </div>

      <!-- 直播列表 — 单列横向大卡片 -->
      <div class="pm-live-list" v-if="filteredLives.length">
        <div
          v-for="l in filteredLives"
          :key="l.live_id"
          class="pml-item"
          @click="goLiveDetail(l.live_id)"
        >
          <!-- 封面区 -->
          <div class="pml-cover" :class="`pml-cover--${l.status}`">
            <img v-if="l.cover_image" :src="l.cover_image" class="pml-cover-img" />
            <span v-else class="pml-cover-emoji">{{ liveEmoji(l.title) }}</span>
            <!-- 状态标签 -->
            <div class="pml-badge" :class="`pml-badge--${l.status}`">
              <span class="pml-badge-dot" v-if="l.status === 'live'"></span>
              <span>{{ liveStatusText(l.status) }}</span>
            </div>
            <!-- 观看人数 -->
            <div class="pml-viewers">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {{ viewerText(l.viewer_count) }}
            </div>
          </div>
          <!-- 信息区 -->
          <div class="pml-info">
            <div class="pml-title">{{ l.title }}</div>
            <div class="pml-meta">
              <span class="pml-anchor">
                <span class="pml-anchor-avatar">{{ (l.anchor_name || '主').charAt(0) }}</span>
                {{ l.anchor_name }}
              </span>
              <span class="pml-time" v-if="l.started_at">{{ formatLiveTime(l.started_at, l.status) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="pm-empty">
        <span class="pme-icon">📺</span>
        <span class="pme-text">暂无直播</span>
      </div>
    </div>

    <div class="safe-bottom"></div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
import ProductCard from '../../../components/app/product/ProductCard.vue';
import type { MarketingCategory, Product, LiveRoom } from '../../../contracts';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();

const projectId = computed(() => route.params.projectId as string);

// ========== Tab切换（支持路由query.tab初始化）==========
const tab = ref<'product' | 'live'>(
  route.query.tab === 'live' ? 'live' : 'product'
);

// Tab感知用例卡：传入getActiveTab回调过滤当前Tab对应UC
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-009A', '项目商城页', () => tab.value);

// ========== 商品Tab ==========
const productKeyword = ref('');
const activeCategory = ref<string>('all');

// 营销分类列表 — 项目维度（ENT-PROJECT-009），按sort_order升序
const categories = computed<MarketingCategory[]>(() =>
  store.marketingCategoriesByProject(projectId.value)
);

// 项目下所有商品
const allProducts = computed<Product[]>(() => store.productsByProject(projectId.value));

// 过滤后的商品 — 搜索时按关键词过滤，否则按分类过滤
const filteredProducts = computed<Product[]>(() => {
  const kw = productKeyword.value.trim().toLowerCase();
  if (kw) {
    // 搜索模式：按名称/描述模糊匹配
    return allProducts.value.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      (p.description || '').toLowerCase().includes(kw)
    );
  }
  // 分类模式
  if (activeCategory.value === 'all') return allProducts.value;
  return allProducts.value.filter(p =>
    (p.marketing_category || p.category) === activeCategory.value
  );
});

// ========== 直播Tab ==========
const liveKeyword = ref('');
const filterStatus = ref<string | undefined>(undefined);

const statusOptions = [
  { value: 'live', label: '直播中' },
  { value: 'upcoming', label: '预告' },
  { value: 'replay', label: '回放' },
];

// 项目下所有直播
const allLives = computed<LiveRoom[]>(() => store.livesByProject(projectId.value));

// 过滤后的直播 — 按关键词搜索 + 按状态筛选
const filteredLives = computed<LiveRoom[]>(() => {
  let list = allLives.value;
  const kw = liveKeyword.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(l =>
      l.title.toLowerCase().includes(kw) ||
      (l.anchor_name || '').toLowerCase().includes(kw)
    );
  }
  if (filterStatus.value) {
    list = list.filter(l => l.status === filterStatus.value);
  }
  return list;
});

// ========== 跳转 ==========
function goProductDetail(productId: string) {
  router.push(`/app/product/${productId}`);
}

function goLiveDetail(liveId?: string) {
  if (liveId) router.push(`/app/live/${liveId}`);
}

// ========== 直播列表辅助函数 ==========
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
</script>

<style scoped>
.project-mall {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 12px;
}

/* 顶部固定区：Tab + 搜索框（置顶，不随页面滑动） */
.pm-top-fixed {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
}

/* 顶部Tab */
.pm-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.pm-tab {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  transition: color 0.2s;
}
.pm-tab.active {
  color: #FF6B35;
  font-weight: 700;
  font-size: 16px;
}
.pm-tab.active::after {
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

/* 搜索框（顶部固定区内） */
.pm-search-bar {
  display: flex;
  align-items: center;
  margin: 10px 12px;
  padding: 9px 14px;
  background: #f5f5f5;
  border-radius: 22px;
}
.pms-icon { flex-shrink: 0; }
.pms-input {
  flex: 1;
  margin-left: 8px;
  font-size: 13px;
  color: #333;
  border: none;
  outline: none;
  background: transparent;
}
.pms-input::placeholder { color: #bbb; }
.pms-clear {
  color: #ccc;
  font-size: 14px;
  padding: 0 4px 0 8px;
  cursor: pointer;
}

/* 搜索结果提示 */
.pm-result-tip {
  padding: 8px 16px 4px;
  font-size: 12px;
  color: #999;
}

/* 商品双列网格 */
.pm-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 12px;
}

/* 分类布局：左侧分类 + 右侧商品 */
.pm-category-layout {
  display: flex;
  height: calc(100vh - 200px);
  min-height: 400px;
}
/* 左侧分类 */
.pm-cat-sidebar {
  width: 88px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.pm-cat-sidebar::-webkit-scrollbar { display: none; }
.pmc-side-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s;
  line-height: 1.3;
}
.pmc-side-item.active {
  background: #f5f5f5;
  color: #FF6B35;
  font-weight: 600;
  border-left-color: #FF6B35;
}
.pmc-side-icon { font-size: 14px; flex-shrink: 0; }
.pmc-side-name { flex: 1; }
.pmc-side-empty {
  padding: 20px 8px;
  font-size: 12px;
  color: #ccc;
  text-align: center;
}
/* 右侧商品 */
.pm-cat-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f5f5f5;
}
.pm-cat-content::-webkit-scrollbar { display: none; }

/* 直播状态筛选 */
.pm-status-filter {
  display: flex;
  gap: 8px;
  padding: 0 12px 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.pm-status-filter::-webkit-scrollbar { display: none; }
.pmf-item {
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  background: #fff;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}
.pmf-item.active {
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-weight: 600;
}

/* 直播列表 — 单列横向大卡片 */
.pm-live-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 12px;
}

/* 单个直播卡片 — 横向布局 */
.pml-item {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}
.pml-item:active { transform: scale(0.98); }

/* 封面区 — 左侧固定宽度 */
.pml-cover {
  width: 140px;
  height: 90px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pml-cover--live {
  background: linear-gradient(135deg, #FF6B35 0%, #FF4D4F 50%, #FF8F35 100%);
}
.pml-cover--upcoming {
  background: linear-gradient(135deg, #fa8c35 0%, #ffa940 100%);
}
.pml-cover--replay {
  background: linear-gradient(135deg, #595959 0%, #8c8c8c 100%);
}
.pml-cover--ended {
  background: linear-gradient(135deg, #bfbfbf 0%, #d9d9d9 100%);
}
.pml-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pml-cover-emoji {
  font-size: 36px;
}

/* 状态标签 */
.pml-badge {
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
.pml-badge--live { background: rgba(245,34,45,0.85); }
.pml-badge--upcoming { background: rgba(250,140,22,0.85); }
.pml-badge--replay { background: rgba(0,0,0,0.55); }
.pml-badge--ended { background: rgba(0,0,0,0.45); }
.pml-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  animation: pml-pulse 1.5s infinite;
}
@keyframes pml-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* 观看人数 */
.pml-viewers {
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
.pml-info {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.pml-title {
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
.pml-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
}
.pml-anchor {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #888;
  min-width: 0;
}
.pml-anchor-avatar {
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
.pml-time {
  font-size: 10px;
  color: #bbb;
  flex-shrink: 0;
}

/* 空状态 */
.pm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;
}
.pme-icon { font-size: 48px; opacity: 0.3; }
.pme-text { font-size: 14px; color: #999; }

.safe-bottom { height: 60px; }
</style>
