<template>
  <!-- 门店详情内容区（可复用子组件，v3.1.31 抽取）
       用于：门店独立详情页 StoreDetail.vue / 项目维度"我的门店"Tab ProjectStores.vue
       不含状态栏/导航栏/用例卡，仅门店信息+位置+推荐直播+推荐商品 -->
  <div class="store-detail-content" v-if="storeInfo">
    <!-- 门店信息 -->
    <div class="sd-info">
      <div class="sdi-card">
        <div class="sdi-logo" :style="{ background: logoGradient }">
          <span>{{ storeInfo.name?.charAt(0) || '店' }}</span>
        </div>
        <div class="sdi-text">
          <div class="sdi-name">{{ storeInfo.name }}</div>
          <!-- 联系电话 + 拨打按钮 -->
          <div class="sdi-contact" v-if="storeInfo.phone">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span class="sdi-phone-text">{{ storeInfo.phone }}</span>
            <a class="sdi-call-btn" :href="`tel:${storeInfo.phone}`">拨打</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 门店位置 -->
    <div class="sd-location" v-if="storeInfo.address">
      <div class="sdl-header">
        <span class="sdl-icon">📍</span>
        <span class="sdl-title">门店位置</span>
      </div>
      <div class="sdl-address">{{ storeInfo.address }}</div>
      <!-- 地图占位 -->
      <div class="sdl-map" v-if="storeInfo.latitude && storeInfo.longitude" @click="openMap">
        <span class="sdm-emoji">🗺️</span>
        <span class="sdm-text">查看地图导航</span>
      </div>
    </div>

    <!-- 直播推荐 -->
    <div class="section" v-if="allStoreLives.length">
      <div class="section-header">
        <span class="sh-title">直播推荐</span>
        <span class="sh-more" v-if="showMoreLive" @click="$emit('more-live')">更多 ›</span>
      </div>
      <div class="live-grid">
        <LiveCard
          v-for="l in displayLives"
          :key="l.live_id"
          :live="l"
          :project-id="projectId"
          @click="$emit('live-click', l.live_id)"
        />
      </div>
    </div>

    <!-- 商品推荐 -->
    <div class="section" v-if="allStoreProducts.length">
      <div class="section-header">
        <span class="sh-title">商品推荐</span>
        <span class="sh-more" v-if="showMoreProduct" @click="$emit('more-product')">更多 ›</span>
      </div>
      <StoreProductList :products="displayProducts" :project-id="projectId" @click="$emit('product-click', $event)" />
    </div>

    <div class="safe-bottom"></div>
  </div>
  <div v-else class="sdce-empty">门店数据不存在</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStore } from '../../../stores/project-store';
import { sortLivesByDefaultRule } from '../../../contracts/recommend-dimensions';
import StoreProductList from './StoreProductList.vue';
import LiveCard from '../live/LiveCard.vue';
import type { Store } from '../../../contracts';

/**
 * 门店详情内容区（可复用子组件）
 * 用于：门店独立详情页 StoreDetail.vue / 项目维度"我的门店"Tab ProjectStores.vue
 */
const props = withDefaults(defineProps<{
  /** 门店ID（与 storeInfo 二选一，优先使用 storeInfo） */
  storeId?: string;
  /** 门店信息（优先使用，避免重复查询） */
  storeInfo?: Store | null;
  /** 项目ID（查询关联直播需要） */
  projectId: string;
  /** 是否显示"更多"按钮（独立详情页显示，Tab内嵌不显示） */
  showMore?: boolean;
}>(), {
  storeId: '',
  storeInfo: null,
  showMore: false,
});

defineEmits<{
  (e: 'more-live'): void;
  (e: 'more-product'): void;
  (e: 'live-click', liveId: string): void;
  (e: 'product-click', productId: string): void;
}>();

const projectStore = useProjectStore();

// v3.1.32 推荐数量限制（与项目首页一致：直播4个 / 商品50个）
const MAX_LIVE_DISPLAY = 4;
const MAX_PRODUCT_DISPLAY = 50;

// 门店信息（优先使用传入的，否则按 storeId 查询）
const storeInfo = computed<Store | null>(() => {
  if (props.storeInfo) return props.storeInfo;
  if (props.storeId) return projectStore.getStoreById(props.storeId) || null;
  return null;
});

const storeId = computed(() => storeInfo.value?.store_id || props.storeId);

// 门店全量商品（用于判断是否超过限制）
const allStoreProducts = computed(() => {
  if (!storeId.value) return [];
  return projectStore.storeProducts(storeId.value);
});

// 展示商品（截取前50个）
const displayProducts = computed(() => allStoreProducts.value.slice(0, MAX_PRODUCT_DISPLAY));

// 门店全量直播（用于判断是否超过限制）
const allStoreLives = computed(() => {
  if (!props.projectId || !storeId.value) return [];
  const allLives = projectStore.livesByProject(props.projectId);
  return allLives.filter(l => l.store_id === storeId.value);
});

// 展示直播（v3.1.36 BR-SHP-041：默认规则排序 live→upcoming→replay + 同状态 started_at 倒序，排除 ended，截取前4个）
const displayLives = computed(() => sortLivesByDefaultRule(allStoreLives.value, MAX_LIVE_DISPLAY));

// v3.1.33 "更多"按钮逻辑：showMore=true 且有数据即显示（不再要求超过数量限制）
//   —— 用户期望门店页始终能通过"更多"进入二级页查看全部
const showMoreLive = computed(() => props.showMore && allStoreLives.value.length > 0);
const showMoreProduct = computed(() => props.showMore && allStoreProducts.value.length > 0);

// 渐变背景
const logoGradient = computed(() => {
  const n = storeInfo.value?.name || '';
  if (n.includes('家居')) return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
  if (n.includes('厨房')) return 'linear-gradient(135deg, #667eea, #764ba2)';
  if (n.includes('户外')) return 'linear-gradient(135deg, #11998e, #38ef7d)';
  if (n.includes('数码')) return 'linear-gradient(135deg, #0F2027, #203A43)';
  return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
});

// 打开地图（占位）
function openMap() {
  if (storeInfo.value?.latitude && storeInfo.value?.longitude) {
    window.open(`https://map.baidu.com/?latlng=${storeInfo.value.latitude},${storeInfo.value.longitude}`, '_blank');
  }
}
</script>

<style scoped>
.store-detail-content {
  width: 100%;
  background: #f5f5f5;
}

/* 门店信息卡片 */
.sd-info { margin: 12px 12px; }
.sdi-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.sdi-logo {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
}
.sdi-text { flex: 1; min-width: 0; }
.sdi-name { font-size: 17px; font-weight: 700; color: #111; margin-bottom: 4px; }
.sdi-contact {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 13px;
  color: #666;
  flex-wrap: wrap;
}
.sdi-phone-text { color: #333; font-weight: 600; }
.sdi-call-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 10px;
  background: #FF6B35;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  margin-left: auto;
}
.sdi-call-btn:active { opacity: 0.85; }

/* 门店位置 */
.sd-location {
  margin: 0 12px 12px;
  padding: 12px;
  background: #fff;
  border-radius: 14px;
}
.sdl-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.sdl-icon { font-size: 16px; }
.sdl-title { font-size: 15px; font-weight: 700; color: #111; }
.sdl-address { font-size: 13px; color: #666; line-height: 1.5; }
.sdl-map {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  padding: 12px;
  background: #f0f5ff;
  border-radius: 10px;
  cursor: pointer;
}
.sdm-emoji { font-size: 24px; }
.sdm-text { font-size: 14px; color: #4facfe; font-weight: 600; }

/* 段落 */
.section { margin: 0 12px 12px; padding: 12px; background: #fff; border-radius: 14px; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; }
.sh-title { font-size: 15px; font-weight: 700; color: #111; }
.sh-more {
  font-size: 13px;
  color: #FF6B35;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}
.sh-more:active { opacity: 0.7; }
.live-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.safe-bottom { height: 24px; }

.sdce-empty {
  text-align: center;
  color: #bbb;
  padding: 60px 0;
  font-size: 14px;
}
</style>
