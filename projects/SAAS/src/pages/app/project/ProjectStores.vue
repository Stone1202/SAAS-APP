<template>
  <!-- 门店Tab — 真机风格 -->
  <div class="stores-page">
    <!-- 搜索 -->
    <div class="sp-search" @click="onSearchClick">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span class="sp-placeholder">搜索门店...</span>
    </div>

    <!-- 门店列表 -->
    <div class="sp-list">
      <StoreCard
        v-for="s in stores"
        :key="s.store_id"
        :store="s"
        :project-id="projectId"
        @click="router.push(`/app/project/${projectId}/store/${s.store_id}`)"
      />
    </div>

    <div class="sp-empty" v-if="!stores.length">
      <span class="spe-emoji">🏪</span>
      <span class="spe-text">暂无门店</span>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import StoreCard from '../../../components/app/store/StoreCard.vue';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();

const projectId = computed(() => route.params.projectId as string);
const stores = computed(() => store.storesByProject(projectId.value));

function onSearchClick() { /* 搜索 */ }
</script>

<style scoped>
.stores-page { padding: 12px 12px 0; background: #f5f5f5; min-height: 100%; }

.sp-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fff;
  border-radius: 22px;
  margin-bottom: 12px;
  cursor: pointer;
}
.sp-placeholder { font-size: 13px; color: #bbb; }

.sp-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 10px;
}
.spe-emoji { font-size: 48px; }
.spe-text { font-size: 14px; color: #bbb; }

.safe-bottom { height: 24px; }
</style>
