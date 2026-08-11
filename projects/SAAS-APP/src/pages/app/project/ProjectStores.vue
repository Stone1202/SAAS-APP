<template>
  <!-- 项目门店Tab — "我的门店"（v3.1.31 重构）
       逻辑：绑定门店→显示门店详情卡片（复用StoreDetailContent）
            未绑定门店→显示引导（联系店长邀请加入 + 去商城逛逛） -->
  <div class="my-store-page">
    <!-- 绑定门店 → 显示门店详情 -->
    <StoreDetailContent
      v-if="boundStoreInfo"
      :store-info="boundStoreInfo"
      :project-id="projectId"
      :show-more="true"
      @more-live="goStoreItems('live')"
      @more-product="goStoreItems('product')"
      @live-click="goLiveDetail"
      @product-click="goProductDetail"
    />

    <!-- 未绑定门店 → 引导 -->
    <div v-else class="ms-guide">
      <div class="msg-card">
        <div class="msg-emoji">🏪</div>
        <div class="msg-title">您还未绑定门店</div>
        <div class="msg-desc">
          绑定门店后，您可以查看门店详情、联系店长、参与门店专属直播与商品。
        </div>
        <div class="msg-tips">
          <div class="msg-tip-item">
            <span class="mti-icon">📞</span>
            <span>请联系您所在门店的店长，由店长邀请您加入门店</span>
          </div>
          <div class="msg-tip-item">
            <span class="mti-icon">🛍️</span>
            <span>绑定后可享受门店专属优惠与直播</span>
          </div>
        </div>
        <div class="msg-actions">
          <el-button type="primary" round @click="goMall">去商城逛逛</el-button>
          <el-button round @click="goHome">返回首页</el-button>
        </div>
      </div>
    </div>

    <div class="safe-bottom"></div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-010', '我的门店');
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import { useUserStore } from '../../../stores/user-store';
import StoreDetailContent from '../../../components/app/store/StoreDetailContent.vue';
import type { Store } from '../../../contracts';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const userStore = useUserStore();

const projectId = computed(() => route.params.projectId as string);

// 当前用户在此项目绑定的门店ID（一个项目最多绑定1个门店）
const boundStoreId = computed(() => userStore.boundStoreByProject(projectId.value));

// 绑定的门店信息
const boundStoreInfo = computed<Store | null>(() => {
  if (!boundStoreId.value) return null;
  return projectStore.getStoreById(boundStoreId.value) || null;
});

// 跳转直播详情
function goLiveDetail(liveId: string) {
  if (liveId) router.push(`/app/live/${liveId}`);
}

// 跳转商品详情
function goProductDetail(productId: string) {
  if (productId) router.push(`/app/product/${productId}`);
}

// v3.1.32 跳转门店商品/直播二级页（带from参数，供返回时回到"我的门店"Tab）
function goStoreItems(tab: string) {
  if (!boundStoreId.value) return;
  router.push(`/app/store/${boundStoreId.value}/items?projectId=${projectId.value}&tab=${tab}&from=project-stores`);
}

// 引导：去商城
function goMall() {
  router.push(`/app/project/${projectId.value}/mall`);
}

// 引导：返回首页
function goHome() {
  router.push(`/app/project/${projectId.value}`);
}
</script>

<style scoped>
.my-store-page { background: #f5f5f5; min-height: 100%; }

/* 引导卡片 */
.ms-guide {
  padding: 40px 20px;
}
.msg-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}
.msg-emoji {
  font-size: 64px;
  margin-bottom: 16px;
}
.msg-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}
.msg-desc {
  font-size: 13px;
  color: #999;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 0 12px;
}
.msg-tips {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}
.msg-tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #f8f8f8;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}
.mti-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.msg-actions {
  display: flex;
  gap: 12px;
}

.safe-bottom { height: 60px; }
</style>
