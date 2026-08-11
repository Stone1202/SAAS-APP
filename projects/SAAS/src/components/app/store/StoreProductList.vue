<template>
  <!-- 门店商品列表 -->
  <div class="spl-wrap">
    <div class="product-grid-2col">
      <ProductCard
        v-for="p in products"
        :key="p.product_id"
        :product="p"
        :project-id="projectId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProductCard from '../../../components/app/product/ProductCard.vue';
import type { Product } from '../../../contracts';

const props = defineProps<{
  products: Product[];
  projectId?: string;
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
