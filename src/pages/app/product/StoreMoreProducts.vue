<template>
  <!-- 更多商品分类页 — 独立全屏，脱离项目框架 (UC-SHP-PRODUCT-002) -->
  <div class="more-products-page">
    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="sb-time">{{ currentTime }}</div>
      <div class="sb-icons">
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>

    <!-- 导航栏 — 返回 + 项目名称居中 -->
    <div class="nav-bar">
      <div class="nav-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="nav-title">{{ project?.name || '全部商品' }}</div>
      <div class="nav-spacer"></div>
    </div>

    <!-- 搜索栏 -->
    <div class="mp-search-bar">
      <svg class="mps-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="keyword"
        class="mps-input"
        type="text"
        placeholder="搜索商品..."
      />
      <span v-if="keyword" class="mps-clear" @click="keyword = ''">✕</span>
    </div>

    <!-- 左侧营销分类导航 + 右侧商品列表（外卖平台风格） -->
    <div class="mp-body">
      <!-- 空状态 -->
      <div class="mp-empty" v-if="!projectProducts.length">
        <span class="mpe-icon">📦</span>
        <span class="mpe-text">暂无商品</span>
      </div>

      <!-- 有搜索结果：全宽网格 -->
      <div v-else-if="keyword.trim()" class="mp-product-grid">
        <StoreProductList :products="filteredProducts" :project-id="projectId" />
        <div class="mp-empty" v-if="!filteredProducts.length">
          <span class="mpe-icon">🔍</span>
          <span class="mpe-text">未找到相关商品</span>
        </div>
      </div>

      <!-- 无搜索：左右分类布局 -->
      <div v-else class="mp-cat-layout">
        <!-- 左侧营销分类导航 -->
        <div class="mp-cat-sidebar">
          <div
            v-for="cat in categoryOptions"
            :key="cat.value"
            :class="['mp-cat-item', { active: activeCategory === cat.value }]"
            @click="activeCategory = cat.value"
          >{{ cat.label }}</div>
        </div>
        <!-- 右侧商品列表 -->
        <div class="mp-cat-content">
          <StoreProductList :products="categoryProducts" :project-id="projectId" />
          <div class="mp-empty" v-if="!categoryProducts.length">
            <span class="mpe-icon">📦</span>
            <span class="mpe-text">该分类暂无商品</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
/**
 * StoreMoreProducts — 更多商品分类页
 * UC-SHP-PRODUCT-002 | PG-SHP-APP-012A | /app/more-products
 * 独立全屏页面，脱离 ProjectFrame，展示项目下全部商品按营销分类浏览
 */
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-012A', '更多商品分类页');
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import StoreProductList from '../../../components/app/store/StoreProductList.vue';

const route = useRoute();
const const_router = useRouter();
const store = useProjectStore();

// projectId 从 query 获取（独立页面）
const projectId = computed(() => (route.query.projectId as string) || '');
const project = computed(() => store.getProjectById(projectId.value));

// 项目下全部商品
const projectProducts = computed(() => store.productsByProject(projectId.value));

// 营销分类列表（从 marketingCategoriesByProject 获取，第一项为"全部"）
const categoryOptions = computed(() => {
  const cats = store.marketingCategoriesByProject(projectId.value);
  return [
    { label: '全部', value: '' },
    ...cats.map(c => ({ label: c.name, value: c.category_id })),
  ];
});

// 当前选中分类（默认"全部"）
const activeCategory = ref('');

// 当前分类下的商品
const categoryProducts = computed(() => {
  if (!activeCategory.value) return projectProducts.value;
  return projectProducts.value.filter(p => p.marketing_category === activeCategory.value);
});

// 搜索
const keyword = ref('');
const filteredProducts = computed(() => {
  if (!projectProducts.value.length) return [];
  if (!keyword.value.trim()) return projectProducts.value;
  const kw = keyword.value.trim().toLowerCase();
  return projectProducts.value.filter(p =>
    p.name.toLowerCase().includes(kw) ||
    p.category.toLowerCase().includes(kw)
  );
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

// 返回上一页
function goBack() {
  if (window.history.length > 1) {
    const_router.back();
  } else {
    const_router.push(`/app/project/${projectId.value}/mall`);
  }
}
</script>

<style scoped>
.more-products-page {
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

/* 搜索栏 */
.mp-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 12px;
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 20px;
  flex-shrink: 0;
}
.mps-icon { flex-shrink: 0; }
.mps-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}
.mps-input::placeholder { color: #bbb; }
.mps-clear {
  color: #bbb;
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
}

/* 内容区 */
.mp-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.mp-body::-webkit-scrollbar { display: none; }

/* 左侧分类 + 右侧商品布局 */
.mp-cat-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: 100%;
}
.mp-cat-sidebar {
  width: 88px;
  flex-shrink: 0;
  background: #f5f5f5;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.mp-cat-item {
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
.mp-cat-item.active {
  color: #FF6B35;
  font-weight: 700;
  background: #fff;
  border-left-color: #FF6B35;
}
.mp-cat-content {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 8px 0;
}

/* 商品网格（搜索模式全宽） */
.mp-product-grid {
  padding: 0 12px;
}

/* 空状态 */
.mp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}
.mpe-icon { font-size: 48px; margin-bottom: 12px; }
.mpe-text { font-size: 14px; color: #999; }
</style>
