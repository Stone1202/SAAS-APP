<template>
  <!-- 门店商品/直播列表 — 独立全屏，脱离项目框架 -->
  <div class="store-items-page">
    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="sb-time">{{ currentTime }}</div>
      <div class="sb-icons">
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>

    <!-- 导航栏 — 返回 + 门店名称居中 -->
    <div class="nav-bar">
      <div class="nav-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="nav-title">{{ storeName }}</div>
      <div class="nav-spacer"></div>
    </div>

    <!-- 双Tab -->
    <div class="si-tabs">
      <div
        :class="['si-tab', { active: activeTab === 'product' }]"
        @click="switchTab('product')"
      >商品</div>
      <div
        :class="['si-tab', { active: activeTab === 'live' }]"
        @click="switchTab('live')"
      >直播</div>
    </div>

    <!-- ===== 商品Tab ===== -->
    <template v-if="activeTab === 'product'">
      <!-- 搜索栏 -->
      <div class="si-search-bar">
        <svg class="sis-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="keyword"
          class="sis-input"
          type="text"
          placeholder="搜索本店商品..."
        />
        <span v-if="keyword" class="sis-clear" @click="keyword = ''">✕</span>
      </div>

      <!-- 内容区 -->
      <div class="si-body">
        <!-- 空状态 -->
        <div class="si-empty" v-if="!storeProducts.length">
          <span class="sie-icon">📦</span>
          <span class="sie-text">暂无商品</span>
        </div>

        <!-- 有搜索结果：全宽网格 -->
        <div v-else-if="keyword.trim()" class="si-product-grid">
          <StoreProductList :products="filteredProducts" :project-id="projectId" />
          <div class="si-empty" v-if="!filteredProducts.length">
            <span class="sie-icon">🔍</span>
            <span class="sie-text">未找到相关商品</span>
          </div>
        </div>

        <!-- 无搜索：左右分类布局（外卖平台风格） -->
        <div v-else class="si-cat-layout">
          <!-- 左侧分类导航 -->
          <div class="si-cat-sidebar">
            <div
              v-for="cat in productCategories"
              :key="cat"
              :class="['si-cat-item', { active: activeCategory === cat }]"
              @click="activeCategory = cat"
            >{{ cat }}</div>
          </div>
          <!-- 右侧商品列表 -->
          <div class="si-cat-content">
            <StoreProductList :products="categoryProducts" :project-id="projectId" />
            <div class="si-empty" v-if="!categoryProducts.length">
              <span class="sie-icon">📦</span>
              <span class="sie-text">该分类暂无商品</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== 直播Tab ===== -->
    <template v-if="activeTab === 'live'">
      <!-- 搜索栏 -->
      <div class="si-search-bar">
        <svg class="sis-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="keyword"
          class="sis-input"
          type="text"
          placeholder="搜索本店直播..."
        />
        <span v-if="keyword" class="sis-clear" @click="keyword = ''">✕</span>
      </div>

      <!-- 直播状态筛选 -->
      <div class="si-live-filter">
        <div
          v-for="opt in liveFilterOptions"
          :key="opt.value"
          :class="['silf-item', { active: liveFilter === opt.value }]"
          @click="liveFilter = opt.value"
        >{{ opt.label }}</div>
      </div>

      <!-- 直播内容区 -->
      <div class="si-body">
        <div class="si-empty" v-if="!filteredLives.length">
          <span class="sie-icon">📡</span>
          <span class="sie-text">暂无直播</span>
        </div>
        <div v-else class="si-live-grid">
          <LiveCard
            v-for="l in filteredLives"
            :key="l.live_id"
            :live="l"
            :project-id="projectId"
            @click="goLiveDetail(l.live_id)"
          />
        </div>
      </div>
    </template>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-011A', '门店商品/直播列表');
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import StoreProductList from '../../../components/app/store/StoreProductList.vue';
import LiveCard from '../../../components/app/live/LiveCard.vue';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();

// projectId 从 query 获取（独立页面）
const projectId = computed(() => route.query.projectId as string);
const storeId = computed(() => route.params.storeId as string);

const storeInfo = computed(() => store.getStoreById(storeId.value));
const storeName = computed(() => storeInfo.value?.name || '门店');
const storeProducts = computed(() => store.storeProducts(storeId.value));

// 商品分类列表（供左侧分类导航使用，第一项为"全部"）
const productCategories = computed(() => {
  const cats = new Set<string>();
  storeProducts.value.forEach(p => cats.add(p.category));
  return ['全部', ...Array.from(cats)];
});

// 当前选中分类（默认"全部"）
const activeCategory = ref('全部');

// 当前分类下的商品
const categoryProducts = computed(() => {
  if (!activeCategory.value || activeCategory.value === '全部') return storeProducts.value;
  return storeProducts.value.filter(p => p.category === activeCategory.value);
});

// Tab
const activeTab = ref<'product' | 'live'>('product');

// 从 query 初始化 Tab
const initTab = (route.query.tab as string) || 'product';
if (initTab === 'live' || initTab === 'product') {
  activeTab.value = initTab;
}

function switchTab(tab: string) {
  activeTab.value = tab as 'product' | 'live';
  keyword.value = '';
}

// 搜索
const keyword = ref('');

const filteredProducts = computed(() => {
  if (!storeProducts.value.length) return [];
  if (!keyword.value.trim()) return storeProducts.value;
  const kw = keyword.value.trim().toLowerCase();
  return storeProducts.value.filter(p =>
    p.name.toLowerCase().includes(kw) ||
    p.category.toLowerCase().includes(kw)
  );
});

// 直播
const storeLives = computed(() => {
  const allLives = store.livesByProject(projectId.value);
  return allLives.filter(l => l.store_id === storeId.value);
});

const liveFilter = ref('all');
const liveFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '直播中', value: 'live' },
  { label: '预告', value: 'upcoming' },
  { label: '回放', value: 'replay' },
  { label: '已结束', value: 'ended' },
];

const filteredLives = computed(() => {
  let list = storeLives.value;
  // 状态筛选
  if (liveFilter.value !== 'all') {
    list = list.filter(l => l.status === liveFilter.value);
  }
  // 关键词搜索
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase();
    list = list.filter(l => l.title.toLowerCase().includes(kw));
  }
  return list;
});

// 切换Tab时重置搜索
watch(activeTab, () => {
  keyword.value = '';
});

// 状态栏时间
const currentTime = ref('');
let timeInterval: ReturnType<typeof setInterval> | null = null;
function updateTime() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${h}:${m}`;
}
onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 60000);
});
onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});

// v3.1.32 返回逻辑：来自"我的门店"Tab则返回项目门店Tab，否则返回门店详情页
function goBack() {
  const fromSource = route.query.from as string;
  if (fromSource === 'project-stores' && projectId.value) {
    router.push(`/app/project/${projectId.value}/stores`);
  } else {
    router.push(`/app/store/${storeId.value}?projectId=${projectId.value}`);
  }
}

function goLiveDetail(liveId?: string) {
  if (liveId) router.push(`/app/live/${liveId}`);
}
</script>

<style scoped>
.store-items-page {
  width: 100%;
  max-width: 414px;
  height: 100vh;
  max-height: 896px;
  margin: 0 auto;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', sans-serif;
  box-shadow: 0 0 30px rgba(0,0,0,0.15);
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px 4px;
  background: #fff;
  flex-shrink: 0;
}
.sb-time {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}
.sb-icons {
  display: flex;
  gap: 6px;
  font-size: 12px;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 44px;
  background: #fff;
  position: relative;
  flex-shrink: 0;
}
.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}
.nav-back:active {
  background: #f0f0f0;
}
.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 17px;
  font-weight: 600;
  color: #333;
  max-width: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-spacer {
  width: 36px;
  flex-shrink: 0;
}

/* Tab */
.si-tabs {
  display: flex;
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.si-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  position: relative;
  user-select: none;
}
.si-tab.active {
  color: #FF6B35;
  font-weight: 700;
}
.si-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 3px;
  background: #FF6B35;
  border-radius: 2px;
}

/* 搜索栏 */
.si-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 12px;
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 20px;
  flex-shrink: 0;
}
.sis-icon { flex-shrink: 0; }
.sis-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}
.sis-input::placeholder { color: #bbb; }
.sis-clear {
  color: #bbb;
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
}

/* 内容区 */
.si-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.si-body::-webkit-scrollbar { display: none; }

/* 左侧分类 + 右侧商品布局（外卖平台风格）*/
.si-cat-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.si-cat-sidebar {
  width: 88px;
  flex-shrink: 0;
  background: #f5f5f5;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.si-cat-item {
  padding: 14px 6px;
  font-size: 13px;
  color: #666;
  text-align: center;
  cursor: pointer;
  position: relative;
  user-select: none;
  line-height: 1.4;
  border-left: 3px solid transparent;
}
.si-cat-item.active {
  color: #FF6B35;
  font-weight: 700;
  background: #fff;
  border-left-color: #FF6B35;
}
.si-cat-content {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 8px 0;
}

/* 商品网格（搜索模式全宽） */
.si-product-grid {
  padding: 0 12px;
}

/* 直播状态筛选 */
.si-live-filter {
  display: flex;
  gap: 6px;
  padding: 4px 12px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
}
.si-live-filter::-webkit-scrollbar { display: none; }
.silf-item {
  flex-shrink: 0;
  padding: 5px 14px;
  font-size: 13px;
  color: #666;
  background: #fff;
  border-radius: 14px;
  cursor: pointer;
  user-select: none;
}
.silf-item.active {
  color: #fff;
  background: #FF6B35;
}

/* 直播网格 */
.si-live-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 12px;
}

/* 空状态 */
.si-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}
.sie-icon { font-size: 48px; margin-bottom: 12px; }
.sie-text { font-size: 14px; color: #999; }
</style>
