<template>
  <!-- 商品卡片 — 真机电商风格 -->
  <div class="product-card" @click="$emit('click')">
    <!-- 图片区 -->
    <div class="pc-img-box">
      <span class="pc-emoji">{{ emoji }}</span>
      <div class="pc-tag" v-if="product.tag">{{ product.tag }}</div>
      <div class="pc-cart-btn" @click.stop="onAddCart" title="加入购物车">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </div>
    </div>

    <!-- 信息区 -->
    <div class="pc-info">
      <div class="pc-name">
        <span class="pc-name-text">{{ product.name }}</span>
      </div>
      <div class="pc-store-line" v-if="storeName">
        <span class="pc-store-tag">{{ storeName }}</span>
      </div>
      <div class="pc-price-row">
        <span class="pc-price">
          <span class="pc-price-sym">¥</span>{{ product.price }}
        </span>
        <span class="pc-price-old" v-if="product.original_price">¥{{ product.original_price }}</span>
      </div>
      <div class="pc-meta">
        <span class="pc-sold">已售{{ soldText }}</span>
        <span class="pc-like">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStore } from '../../../stores/project-store';
import type { Product } from '../../../contracts';

const props = defineProps<{
  product: Product;
  projectId?: string;
}>();

defineEmits<{
  click: [];
}>();

const store = useProjectStore();

// 门店名称
const storeName = computed(() => {
  const s = store.getStoreById(props.product.store_id);
  return s?.name || '';
});

// 商品emoji
const emoji = computed(() => {
  const n = props.product.name;
  if (!n) return '📦';
  if (n.includes('拖把')) return '🧹';
  if (n.includes('保温壶')) return '🍶';
  if (n.includes('收纳')) return '📦';
  if (n.includes('洗衣')) return '🧴';
  if (n.includes('榨汁')) return '🧃';
  if (n.includes('便当')) return '🍱';
  if (n.includes('瑜伽')) return '🧘';
  if (n.includes('围炉')) return '🔥';
  if (n.includes('跑鞋')) return '👟';
  if (n.includes('蓝牙')) return '🎧';
  if (n.includes('平板')) return '📱';
  if (n.includes('pro') || n.includes('Pro')) return '💻';
  return '📦';
});

// 销量
const soldText = computed(() => {
  const s = props.product.sales || Math.floor(Math.random() * 5000 + 500);
  if (s >= 10000) return `${(s / 10000).toFixed(1)}万`;
  if (s >= 1000) return `${(s / 1000).toFixed(0)}k`;
  return String(s);
});

function onAddCart() {
  // 原型中仅视觉反馈
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s;
}
.product-card:active { transform: scale(0.98); }

/* 图片区 */
.pc-img-box {
  width: 100%;
  padding-top: 100%;
  position: relative;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pc-emoji {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
}
.pc-tag {
  position: absolute;
  top: 0;
  left: 0;
  padding: 2px 8px;
  background: linear-gradient(135deg, #FF6B35, #FF4D4F);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 0 0 8px 0;
}
.pc-cart-btn {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF4D4F);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.product-card:hover .pc-cart-btn,
.pc-cart-btn:active { opacity: 1; }

/* 信息区 */
.pc-info { padding: 8px 10px 10px; }
.pc-name { margin-bottom: 4px; }
.pc-name-text {
  font-size: 13px;
  line-height: 1.4;
  color: #222;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}
.pc-store-line {
  margin-bottom: 4px;
}
.pc-store-tag {
  font-size: 10px;
  color: #FF6B35;
  background: rgba(255,107,53,0.08);
  padding: 1px 6px;
  border-radius: 3px;
}
.pc-price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.pc-price {
  font-size: 18px;
  font-weight: 700;
  color: #F5222D;
  line-height: 1;
}
.pc-price-sym { font-size: 12px; }
.pc-price-old {
  font-size: 10px;
  color: #bbb;
  text-decoration: line-through;
}
.pc-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}
.pc-sold { font-size: 10px; color: #bbb; }
.pc-like { display: flex; align-items: center; }
</style>
