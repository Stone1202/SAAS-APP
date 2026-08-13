<template>
  <!-- 运营楼层 -->
  <div class="operation-floor">
    <div class="floor-header">
      <span class="floor-title">{{ floor.title }}</span>
      <span v-if="floor.subtitle" class="floor-subtitle">{{ floor.subtitle }}</span>
      <span class="floor-more">更多 ›</span>
    </div>
    <div :class="['floor-body', floor.type]">
      <!-- 商品列表型楼层 -->
      <template v-if="floor.type === 'product_list'">
        <div class="product-scroll">
          <div
            v-for="item in floor.items"
            :key="item.id"
            class="floor-product-card"
            @click="onClick(item)"
          >
            <img :src="item.image" :alt="item.title" class="fp-img" />
            <div class="fp-title">{{ item.title }}</div>
            <div class="fp-price">{{ item.subtitle }}</div>
          </div>
        </div>
      </template>
      <!-- 直播列表型楼层 -->
      <template v-else-if="floor.type === 'live_list'">
        <div class="product-scroll">
          <div
            v-for="item in floor.items"
            :key="item.id"
            class="floor-live-card"
            @click="onClickLive(item)"
          >
            <img :src="item.image" :alt="item.title" class="fl-img" />
            <div class="fl-info">
              <div class="fl-title">{{ item.title }}</div>
              <div class="fl-viewers">{{ item.subtitle }}</div>
            </div>
          </div>
        </div>
      </template>
      <!-- Banner型楼层 -->
      <template v-else-if="floor.type === 'banner'">
        <img
          v-for="item in floor.items"
          :key="item.id"
          :src="item.image"
          class="floor-banner-img"
          @click="onClick(item)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Floor } from '../../../contracts';
import { useProjectStore } from '../../../stores/project-store';

const props = defineProps<{ floor: Floor }>();
const router = useRouter();
const projectStore = useProjectStore();

function onClick(item: any) {
  if (item.target_id) {
    const product = projectStore.getProductById(item.target_id);
    if (product) router.push(`/app/project/${product.project_id}`);
  }
}
function onClickLive(item: any) {
  if (item.target_id) {
    const live = projectStore.getLiveById(item.target_id);
    if (live) router.push(`/app/project/${live.project_id}/lives`);
  }
}
</script>

<style scoped>
.operation-floor {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}
.floor-header {
  display: flex;
  align-items: center;
  padding: 12px;
}
.floor-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.floor-subtitle {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}
.floor-more {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}
.floor-body { padding: 0 12px 12px; }
.product-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.product-scroll::-webkit-scrollbar { display: none; }
.floor-product-card {
  flex-shrink: 0;
  width: 90px;
  cursor: pointer;
}
.fp-img {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f5f5;
}
.fp-title {
  font-size: 12px;
  margin-top: 4px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fp-price {
  font-size: 13px;
  color: #FF4D4F;
  font-weight: 600;
}
.floor-live-card {
  flex-shrink: 0;
  width: 160px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}
.fl-img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  background: #f5f5f5;
}
.fl-info { padding: 4px 0; }
.fl-title { font-size: 12px; color: #333; }
.fl-viewers { font-size: 11px; color: #999; }
.floor-banner-img {
  width: 100%;
  border-radius: 8px;
  display: block;
  margin-bottom: 8px;
}
</style>
