<template>
  <!-- 门店商品列表 -->
  <div class="spl-wrap">
    <div class="product-grid-2col">
      <ProductCard
        v-for="p in products"
        :key="p.product_id"
        :product="p"
        :project-id="projectId"
        @click="$emit('click', p.product_id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '../../../components/app/product/ProductCard.vue';
import type { Product } from '../../../contracts';

defineProps<{
  products: Product[];
  projectId?: string;
}>();

// v3.1.33 补齐商品点击跳转 emit（ProductCard 的 click 无参数，这里转发 productId）
defineEmits<{
  click: [productId: string];
}>();
</script>

<style scoped>
.spl-wrap { padding: 4px 0; }
.product-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
</style>
