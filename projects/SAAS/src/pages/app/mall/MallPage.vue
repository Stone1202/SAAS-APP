<template>
  <!-- 商城页（精选内容 + 项目列表 切换） -->
  <div class="mall-page">
    <!-- 搜索栏 -->
    <div class="mp-search-bar">
      <div class="mp-search-input">
        <span class="mp-search-icon">🔍</span>
        <span class="mp-search-text">搜索项目/门店</span>
      </div>
    </div>

    <!-- 顶部切换：精选 / 项目列表 -->
    <div class="mp-switch">
      <span
        :class="['mp-switch-item', { active: mode === 'featured' }]"
        @click="mode = 'featured'"
      >精选</span>
      <span
        :class="['mp-switch-item', { active: mode === 'projects' }]"
        @click="mode = 'projects'"
      >项目列表</span>
    </div>

    <!-- 精选内容 -->
    <div v-if="mode === 'featured'" class="mp-content">
      <FeaturedContent :contents="featuredContents" />
      <div class="mp-featured-products">
        <div class="mp-section-title">精选好物</div>
        <div class="mp-product-grid">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.product_id"
            :product="product"
          />
        </div>
      </div>
    </div>

    <!-- 项目列表 -->
    <div v-else class="mp-content">
      <!-- 品类筛选 -->
      <div class="mp-filter">
        <span
          :class="['mp-filter-item', { active: !filterCategory }]"
          @click="filterCategory = undefined"
        >全部</span>
        <span
          :class="['mp-filter-item', { active: filterCategory === 'daily' }]"
          @click="filterCategory = 'daily'"
        >日用百货</span>
        <span
          :class="['mp-filter-item', { active: filterCategory === 'health' }]"
          @click="filterCategory = 'health'"
        >健康保健</span>
      </div>

      <div class="mp-project-list">
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.project_id"
          :project="project"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppConfigStore } from '../../../stores/app-config-store';
import { useProjectStore } from '../../../stores/project-store';
import FeaturedContent from '../../../components/app/mall/FeaturedContent.vue';
import ProjectCard from '../../../components/app/mall/ProjectCard.vue';
import ProductCard from '../../../components/app/product/ProductCard.vue';

const appConfigStore = useAppConfigStore();
const projectStore = useProjectStore();

const mode = ref<'featured' | 'projects'>('featured');
const filterCategory = ref<'daily' | 'health' | undefined>(undefined);

const featuredContents = computed(() => appConfigStore.enabledFeatured);

const featuredProducts = computed(() => {
  const recommends = appConfigStore.enabledRecommends.filter(r => r.type === 'product');
  return recommends
    .map(r => projectStore.getProductById(r.target_id))
    .filter(Boolean) as any[];
});

const filteredProjects = computed(() =>
  projectStore.projectsByCategory(filterCategory.value)
);
</script>

<style scoped>
.mall-page { padding-bottom: 16px; }
.mp-search-bar { padding: 8px 12px; background: #fff; }
.mp-search-input {
  display: flex;
  align-items: center;
  height: 36px;
  background: #f5f5f5;
  border-radius: 18px;
  padding: 0 14px;
}
.mp-search-icon { font-size: 14px; margin-right: 6px; }
.mp-search-text { font-size: 13px; color: #999; }
.mp-switch {
  display: flex;
  padding: 0 12px 12px;
  background: #fff;
  gap: 24px;
}
.mp-switch-item {
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding-bottom: 4px;
  position: relative;
}
.mp-switch-item.active {
  color: #333;
  font-weight: 600;
}
.mp-switch-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
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
.mp-featured-products { margin-top: 4px; }
.mp-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}
.mp-product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
</style>
