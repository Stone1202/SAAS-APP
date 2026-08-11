<template>
  <!-- 门店详情页 — 真机风格 -->
  <div class="store-detail" v-if="storeInfo">
    <div class="sd-header" :style="{ background: coverGradient }">
      <div class="sdh-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
    </div>

    <!-- 门店信息 -->
    <div class="sd-info">
      <div class="sdi-card">
        <div class="sdi-logo" :style="{ background: logoGradient }">
          <span>{{ storeInfo.name?.charAt(0) || '店' }}</span>
        </div>
        <div class="sdi-text">
          <div class="sdi-name">{{ storeInfo.name }}</div>
          <div class="sdi-meta">
            <span class="sdi-rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF9500" stroke="#FF9500" stroke-width="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {{ rating }}
            </span>
            <span class="sdi-dot">·</span>
            <span>{{ productCount }} 件商品</span>
            <span class="sdi-dot">·</span>
            <span v-if="storeInfo.address">{{ storeInfo.address }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="sd-products" v-if="storeProducts.length">
      <div class="sdp-header">
        <span class="sdp-title">全部商品</span>
        <span class="sdp-count">共 {{ storeProducts.length }} 件</span>
      </div>
      <StoreProductList :products="storeProducts" :project-id="projectId" />
    </div>

    <!-- 关联直播 -->
    <div class="section" v-if="storeLives.length">
      <div class="section-header">
        <span class="sh-title">正在直播</span>
      </div>
      <div class="live-scroll">
        <LiveCard
          v-for="l in storeLives"
          :key="l.live_id"
          :live="l"
          :project-id="projectId"
        />
      </div>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import StoreProductList from '../../../components/app/store/StoreProductList.vue';
import LiveCard from '../../../components/app/live/LiveCard.vue';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();

const projectId = computed(() => route.params.projectId as string);
const storeId = computed(() => route.params.storeId as string);

const storeInfo = computed(() => store.getStoreById(storeId.value));
const storeProducts = computed(() => store.storeProducts(storeId.value));

// 关联直播
const storeLives = computed(() => {
  const allLives = store.livesByProject(projectId.value);
  return allLives.filter(l => l.status === 'live' && l.store_id === storeId.value);
});

// 评分
const rating = computed(() => ((storeInfo.value as any)?.rating || 4.5).toFixed(1));

// 商品数量
const productCount = computed(() => storeProducts.value.length);

// 渐变
const coverGradient = computed(() => {
  const n = storeInfo.value?.name || '';
  if (n.includes('家居')) return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
  if (n.includes('厨房')) return 'linear-gradient(135deg, #667eea, #764ba2)';
  if (n.includes('户外')) return 'linear-gradient(135deg, #11998e, #38ef7d)';
  if (n.includes('数码')) return 'linear-gradient(135deg, #0F2027, #203A43)';
  return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
});
const logoGradient = computed(() => coverGradient.value);

function goBack() {
  router.back();
}
</script>

<style scoped>
.store-detail {
  background: #f5f5f5;
  min-height: 100%;
  padding-bottom: 12px;
}

/* 顶部背景 */
.sd-header {
  height: 80px;
  padding: 14px 16px 0;
  position: relative;
}
.sdh-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 门店信息卡片 */
.sd-info {
  margin: -30px 12px 12px;
  position: relative;
  z-index: 1;
}
.sdi-card {
  display: flex;
  align-items: center;
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
.sdi-name { font-size: 17px; font-weight: 700; color: #111; }
.sdi-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: #999;
}
.sdi-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #FF9500;
  font-weight: 600;
}
.sdi-dot { margin: 0 4px; color: #ddd; }

/* 商品列表 */
.sd-products {
  margin: 0 12px 12px;
  padding: 12px 12px 4px;
  background: #fff;
  border-radius: 14px;
}
.sdp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px 12px;
}
.sdp-title { font-size: 15px; font-weight: 700; color: #111; }
.sdp-count { font-size: 12px; color: #999; }

/* 段落 */
.section { margin: 0 12px 12px; padding: 12px; background: #fff; border-radius: 14px; }
.section-header { display: flex; align-items: center; padding-bottom: 10px; }
.sh-title { font-size: 15px; font-weight: 700; color: #111; }
.live-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.live-scroll::-webkit-scrollbar { display: none; }

.safe-bottom { height: 24px; }
</style>
