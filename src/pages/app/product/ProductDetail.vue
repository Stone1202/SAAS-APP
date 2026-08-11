<template>
  <!-- 商品详情页 — FN-SHP-APP-012（v3.1.33 独立全屏，脱离 MobileFrame 和 ProjectFrame） -->
  <div class="pd-page">
    <!-- 顶部状态栏 -->
    <div class="pd-status-bar">
      <span class="psb-time">{{ currentTime }}</span>
      <span class="psb-icons">📶 🔋</span>
    </div>

  <div class="product-detail" v-if="product">
    <!-- 顶部导航 -->
    <div class="pd-nav">
      <div class="pdn-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="pdn-title">商品详情</div>
      <div class="pdn-actions">
        <span class="pdn-action" @click="$router.push('/app/home')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </span>
      </div>
    </div>

    <!-- 商品主图 -->
    <div class="pd-image-box">
      <span class="pd-emoji">{{ emoji }}</span>
      <div class="pd-tags" v-if="product.tags && product.tags.length">
        <span class="pd-tag" v-for="tag in product.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>

    <!-- 价格信息 -->
    <div class="pd-price-card">
      <div class="pdp-row">
        <span class="pdp-price">
          <span class="pdp-sym">¥</span>{{ product.price }}
        </span>
        <span class="pdp-old" v-if="product.original_price">¥{{ product.original_price }}</span>
        <span class="pdp-discount" v-if="product.original_price">
          {{ discountText }}
        </span>
      </div>
      <div class="pdp-meta">
        <span class="pdp-sold">已售{{ soldText }}</span>
        <span class="pdp-stock" v-if="product.stock">库存{{ product.stock }}件</span>
      </div>
    </div>

    <!-- 商品标题 -->
    <div class="pd-title-card">
      <div class="pdt-name">{{ product.name }}</div>
      <div class="pdt-desc" v-if="product.description">{{ product.description }}</div>
    </div>

    <!-- 所属门店入口 -->
    <div class="pd-entry" v-if="storeInfo" @click="goStore">
      <div class="pde-icon">🏪</div>
      <div class="pde-info">
        <div class="pde-label">所属门店</div>
        <div class="pde-name">{{ storeInfo.name }}</div>
      </div>
      <div class="pde-arrow">›</div>
    </div>

    <!-- 所属项目入口 -->
    <div class="pd-entry" v-if="projectInfo" @click="goProject">
      <div class="pde-icon">📦</div>
      <div class="pde-info">
        <div class="pde-label">所属项目</div>
        <div class="pde-name">{{ projectInfo.name }}</div>
      </div>
      <div class="pde-arrow">›</div>
    </div>

    <div class="safe-bottom"></div>
  </div>

  <!-- 商品不存在 -->
  <div class="pd-not-found" v-else>
    <span class="pnf-icon">🔍</span>
    <span class="pnf-text">商品不可见</span>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
  </div>
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-012', '商品详情页');
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import { useProjectActiveCheck } from '../../../composables/useProjectActiveCheck';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const { checkProjectActive } = useProjectActiveCheck();

// v3.1.33 状态栏时间
const currentTime = ref('');
let timer: number | undefined;
function updateTime() {
  const d = new Date();
  currentTime.value = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 30000);
  // v3.1.37 BR-SHP-043 Layer2：检查所属项目状态，inactive 弹窗提示并返回
  if (product.value) {
    checkProjectActive(product.value.project_id);
  }
});
onUnmounted(() => { if (timer) clearInterval(timer); });

const productId = computed(() => route.params.productId as string);
const product = computed(() => store.getProductById(productId.value));

// 路由参数变化时也检查（动态参数切换商品详情）
watch(productId, (id) => {
  if (id) {
    const p = store.getProductById(id);
    if (p) checkProjectActive(p.project_id);
  }
});

const projectInfo = computed(() =>
  product.value ? store.getProjectById(product.value.project_id) : null
);

const storeInfo = computed(() =>
  product.value?.store_id ? store.getStoreById(product.value.store_id) : null
);

// emoji映射
const emoji = computed(() => {
  const n = product.value?.name || '';
  if (!n) return '📦';
  if (n.includes('纸') || n.includes('抽纸')) return '🧻';
  if (n.includes('清洁') || n.includes('洗洁')) return '🧴';
  if (n.includes('杯')) return '🍶';
  if (n.includes('毛巾')) return '🧖';
  if (n.includes('垃圾')) return '🗑️';
  if (n.includes('维生素')) return '💊';
  if (n.includes('鱼油')) return '🐟';
  if (n.includes('益生菌')) return '🦠';
  if (n.includes('钙')) return '🦴';
  if (n.includes('蛋白')) return '🥛';
  if (n.includes('燕窝') || n.includes('滋补')) return '🍯';
  if (n.includes('西洋参') || n.includes('枸杞')) return '🌿';
  return '📦';
});

// 折扣文字
const discountText = computed(() => {
  if (!product.value?.original_price) return '';
  const d = (product.value.price / product.value.original_price * 10).toFixed(1);
  return `${d}折`;
});

// 销量
const soldText = computed(() => {
  const s = product.value?.sales || 0;
  if (s >= 10000) return `${(s / 10000).toFixed(1)}万`;
  if (s >= 1000) return `${(s / 1000).toFixed(0)}k`;
  return String(s);
});

function goBack() {
  router.back();
}

function goStore() {
  if (product.value?.store_id && projectInfo.value) {
    router.push(`/app/store/${product.value.store_id}?projectId=${projectInfo.value.project_id}`);
  }
}

function goProject() {
  if (projectInfo.value) {
    router.push(`/app/project/${projectInfo.value.project_id}`);
  }
}
</script>

<style scoped>
/* v3.1.33 独立全屏容器（与 StoreItems 一致的手机壳样式） */
.pd-page {
  width: 100%;
  max-width: 414px;
  height: 100vh;
  max-height: 896px;
  margin: 0 auto;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  box-shadow: 0 0 30px rgba(0,0,0,0.15);
}
.pd-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.psb-icons { font-size: 12px; }

.product-detail {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f5f5f5;
}

/* 导航 */
.pd-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 44px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.pdn-back, .pdn-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
}
.pdn-back:active, .pdn-action:active { background: #f0f0f0; }
.pdn-title { font-size: 17px; font-weight: 600; color: #111; }
.pdn-actions { display: flex; }

/* 主图 */
.pd-image-box {
  width: 100%;
  height: 360px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.pd-emoji { font-size: 140px; }
.pd-tags {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  gap: 6px;
}
.pd-tag {
  padding: 3px 10px;
  background: linear-gradient(135deg, #FF6B35, #FF4D4F);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
}

/* 价格卡 */
.pd-price-card {
  margin: -12px 12px 10px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  position: relative;
  z-index: 1;
}
.pdp-row { display: flex; align-items: baseline; gap: 8px; }
.pdp-price {
  font-size: 28px;
  font-weight: 700;
  color: #F5222D;
  line-height: 1;
}
.pdp-sym { font-size: 16px; }
.pdp-old {
  font-size: 14px;
  color: #bbb;
  text-decoration: line-through;
}
.pdp-discount {
  padding: 2px 8px;
  background: rgba(245,34,45,0.1);
  color: #F5222D;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
}
.pdp-meta {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

/* 标题卡 */
.pd-title-card {
  margin: 0 12px 10px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
}
.pdt-name { font-size: 17px; font-weight: 600; color: #111; line-height: 1.5; }
.pdt-desc { font-size: 13px; color: #666; margin-top: 8px; line-height: 1.6; }

/* 入口卡 */
.pd-entry {
  display: flex;
  align-items: center;
  margin: 0 12px 10px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 14px;
  cursor: pointer;
}
.pd-entry:active { background: #fafafa; }
.pde-icon { font-size: 28px; flex-shrink: 0; }
.pde-info { flex: 1; margin-left: 12px; }
.pde-label { font-size: 11px; color: #999; }
.pde-name { font-size: 15px; font-weight: 600; color: #333; margin-top: 2px; }
.pde-arrow { font-size: 22px; color: #ccc; }

/* 不存在 */
.pd-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}
.pnf-icon { font-size: 56px; opacity: 0.3; }
.pnf-text { font-size: 16px; color: #999; }

.safe-bottom { height: 24px; }
</style>
