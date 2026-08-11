<template>
  <!-- 门店卡片 — 真机风格 -->
  <div class="store-card" @click="$emit('click')">
    <div class="sc-img-box" :style="{ background: coverGradient }">
      <span class="sc-emoji">{{ emoji }}</span>
      <div class="sc-product-count" v-if="productCount">
        <span>{{ productCount }}件商品</span>
      </div>
    </div>
    <div class="sc-info">
      <div class="sc-base">
        <div class="sc-logo-box" :style="{ background: logoGradient }">
          <span class="sc-logo-text">{{ store.name?.charAt(0) || '店' }}</span>
        </div>
        <div class="sc-text">
          <div class="sc-name">{{ store.name }}</div>
          <div class="sc-desc" v-if="store.description">{{ store.description }}</div>
          <div class="sc-meta">
            <span class="sc-rating">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF9500" stroke="#FF9500" stroke-width="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {{ rating }}
            </span>
            <span class="sc-distance" v-if="store.address">{{ store.address }}</span>
          </div>
        </div>
      </div>
      <!-- 推荐商品预览 -->
      <div class="sc-products" v-if="topProducts.length">
        <div
          v-for="p in topProducts"
          :key="p.product_id"
          class="scp-item"
        >
          <span class="scp-emoji">{{ productEmoji(p) }}</span>
          <span class="scp-price">{{ p.price }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStore } from '../../../stores/project-store';
import type { Store } from '../../../contracts';

const props = defineProps<{
  store: Store;
  projectId?: string;
}>();

defineEmits<{
  click: [];
}>();

const store = useProjectStore();

// 门店emoji
const emoji = computed(() => {
  const n = props.store.name;
  if (!n) return '🏪';
  if (n.includes('家居')) return '🛋️';
  if (n.includes('厨房')) return '🍳';
  if (n.includes('户外')) return '🏕️';
  if (n.includes('数码')) return '💻';
  return '🏪';
});

// 渐变背景
const coverGradient = computed(() => {
  const n = props.store.name;
  if (n?.includes('家居')) return 'linear-gradient(135deg, #ffe8d6, #ffecd2)';
  if (n?.includes('厨房')) return 'linear-gradient(135deg, #e8eaf6, #c5cae9)';
  if (n?.includes('户外')) return 'linear-gradient(135deg, #e8f5e9, #c8e6c9)';
  if (n?.includes('数码')) return 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
  return 'linear-gradient(135deg, #f5f5f5, #eee)';
});

const logoGradient = computed(() => {
  const n = props.store.name;
  if (n?.includes('家居')) return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
  if (n?.includes('厨房')) return 'linear-gradient(135deg, #667eea, #764ba2)';
  if (n?.includes('户外')) return 'linear-gradient(135deg, #11998e, #38ef7d)';
  if (n?.includes('数码')) return 'linear-gradient(135deg, #0F2027, #203A43)';
  return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
});

// 评分
const rating = computed(() => {
  const r = (props.store as any).rating || (4 + Math.random() * 1);
  return r.toFixed(1);
});

// 该门店商品数
const productCount = computed(() => {
  return store.storeProducts(props.store.store_id).length;
});

// 推荐商品（前3个）
const topProducts = computed(() => {
  return store.storeProducts(props.store.store_id).slice(0, 3);
});

function productEmoji(p: any) {
  if (p.name?.includes('拖把')) return '🧹';
  if (p.name?.includes('保温')) return '🍶';
  if (p.name?.includes('洗衣')) return '🧴';
  if (p.name?.includes('榨汁')) return '🧃';
  if (p.name?.includes('便当')) return '🍱';
  return '📦';
}
</script>

<style scoped>
.store-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}
.store-card:active { transform: scale(0.98); }

/* 封面 */
.sc-img-box {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.sc-emoji { font-size: 42px; }
.sc-product-count {
  position: absolute;
  right: 10px;
  bottom: 8px;
  padding: 2px 8px;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  font-size: 10px;
  color: #fff;
  font-weight: 500;
}

/* 信息 */
.sc-info { padding: 12px; }
.sc-base {
  display: flex;
  gap: 10px;
}
.sc-logo-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sc-logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}
.sc-text { flex: 1; min-width: 0; }
.sc-name {
  font-size: 15px;
  font-weight: 600;
  color: #111;
}
.sc-desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sc-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.sc-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #FF9500;
}
.sc-distance {
  font-size: 11px;
  color: #bbb;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 推荐商品 */
.sc-products {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}
.scp-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  background: #fafafa;
  border-radius: 8px;
}
.scp-emoji { font-size: 24px; }
.scp-price {
  font-size: 12px;
  font-weight: 700;
  color: #F5222D;
}
.scp-price::before { content: '¥'; font-size: 10px; }
</style>
