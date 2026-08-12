<template>
  <!-- 商品卡片 — 真机电商风格 -->
  <div class="product-card" @click="$emit('click')">
    <!-- 图片区 -->
    <div class="pc-img-box">
      <span class="pc-emoji">{{ emoji }}</span>
    </div>

    <!-- 信息区 -->
    <div class="pc-info">
      <div class="pc-name">
        <span class="pc-name-text">{{ product.name }}</span>
      </div>
      <div class="pc-price-row">
        <span class="pc-price">
          <span class="pc-price-sym">¥</span>{{ product.price }}
        </span>
        <span class="pc-price-old" v-if="product.original_price">¥{{ product.original_price }}</span>
      </div>
      <div class="pc-meta">
        <span class="pc-sold">已售{{ soldText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '../../../contracts';

const props = defineProps<{
  product: Product;
  projectId?: string;
}>();

defineEmits<{
  click: [];
}>();

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
</style>
