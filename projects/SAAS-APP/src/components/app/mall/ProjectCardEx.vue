<template>
  <!-- 项目卡片扩展 — logo名称+主营类目+商品推荐+直播推荐 -->
  <div class="project-card-ex" @click="onClick">
    <!-- 项目头部 -->
    <div class="pce-header">
      <img :src="project.logo || placeholder" :alt="project.name" class="pce-logo" />
      <div class="pce-info">
        <div class="pce-name">{{ project.mall_name || project.name }}</div>
        <div class="pce-category">{{ categoryText }}</div>
      </div>
      <div class="pce-arrow">›</div>
    </div>

    <!-- 商品推荐 -->
    <div class="pce-products" v-if="recommendProducts.length">
      <div class="pce-section-label">商品推荐</div>
      <div class="pce-product-scroll">
        <div
          v-for="product in recommendProducts"
          :key="product.product_id"
          class="pce-product-item"
          @click.stop="goProduct(product.product_id)"
        >
          <span class="pce-product-emoji">📦</span>
          <span class="pce-product-name">{{ product.name }}</span>
          <span class="pce-product-price">¥{{ product.price }}</span>
        </div>
      </div>
    </div>

    <!-- 直播推荐 -->
    <div class="pce-lives" v-if="recommendLives.length">
      <div class="pce-section-label">直播推荐</div>
      <div class="pce-live-scroll">
        <div
          v-for="live in recommendLives"
          :key="live.live_id"
          class="pce-live-item"
          @click.stop="goLive(live.live_id)"
        >
          <span class="pce-live-emoji">📺</span>
          <span class="pce-live-title">{{ live.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import type { Project, Product, LiveRoom } from '../../../contracts';

const props = defineProps<{ project: Project }>();
const router = useRouter();
const projectStore = useProjectStore();
const placeholder = 'https://picsum.photos/seed/project-placeholder/100/100';

const categoryText = computed(() =>
  props.project.category === 'daily' ? '日用百货' : '健康保健'
);

// 商品推荐 — 从ProjectHomeConfig.recommend_products读取，取前4
const recommendProducts = computed<Product[]>(() => {
  const config = projectStore.homeConfigByProject(props.project.project_id);
  if (config?.recommend_products?.length) {
    return config.recommend_products
      .slice(0, 4)
      .map(id => projectStore.getProductById(id))
      .filter(Boolean) as Product[];
  }
  // 降级：按销量降序取前4
  return projectStore.productsByProject(props.project.project_id)
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 4);
});

// 直播推荐 — 从ProjectHomeConfig.live_recommend读取，取前2
const recommendLives = computed<LiveRoom[]>(() => {
  const config = projectStore.homeConfigByProject(props.project.project_id);
  if (config?.live_recommend?.length) {
    return config.live_recommend
      .slice(0, 2)
      .map(id => projectStore.getLiveById(id))
      .filter(Boolean) as LiveRoom[];
  }
  // 降级：取项目直播前2
  return projectStore.livesByProject(props.project.project_id).slice(0, 2);
});

function onClick() {
  router.push(`/app/project/${props.project.project_id}`);
}

function goProduct(productId: string) {
  router.push(`/app/product/${productId}`);
}

function goLive(liveId: string) {
  router.push(`/app/live/${liveId}`);
}
</script>

<style scoped>
.project-card-ex {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
}

/* 头部 */
.pce-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pce-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}
.pce-info { flex: 1; min-width: 0; }
.pce-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.pce-category {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.pce-arrow { font-size: 20px; color: #ccc; }

/* 推荐商品 */
.pce-products { margin-top: 12px; }
.pce-section-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}
.pce-product-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.pce-product-scroll::-webkit-scrollbar { display: none; }
.pce-product-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
.pce-product-emoji { font-size: 24px; }
.pce-product-name {
  font-size: 11px;
  color: #333;
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pce-product-price {
  font-size: 13px;
  font-weight: 700;
  color: #F5222D;
}

/* 推荐直播 */
.pce-lives { margin-top: 10px; }
.pce-live-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.pce-live-scroll::-webkit-scrollbar { display: none; }
.pce-live-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 140px;
  padding: 8px 10px;
  background: #f0f5ff;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
.pce-live-emoji { font-size: 18px; }
.pce-live-title {
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
