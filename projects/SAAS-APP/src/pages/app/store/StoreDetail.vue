<template>
  <!-- 门店详情页 — 独立全屏，脱离项目框架（v3.1.31：内容区改用 StoreDetailContent 子组件） -->
  <div class="store-detail" v-if="storeInfo">
    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="sb-time">{{ currentTime }}</div>
      <div class="sb-icons">
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>

    <!-- 导航栏 — 返回 + 门店名称居中 -->
    <div class="nav-bar">
      <div class="nav-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <div class="nav-title">{{ storeInfo.name }}</div>
      <div class="nav-spacer"></div>
    </div>

    <!-- 可滚动内容区（复用子组件） -->
    <div class="sd-content">
      <StoreDetailContent
        :store-id="storeId"
        :project-id="projectId"
        :show-more="true"
        @more-live="goItemsPage('live')"
        @more-product="goItemsPage('product')"
        @live-click="goLiveDetail"
        @product-click="goProductDetail"
      />
    </div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-011', '门店详情');
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import { useProjectActiveCheck } from '../../../composables/useProjectActiveCheck';
import StoreDetailContent from '../../../components/app/store/StoreDetailContent.vue';

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const { checkProjectActive } = useProjectActiveCheck();

// projectId 从 query 获取（独立页面，不在项目框架内）
const projectId = computed(() => route.query.projectId as string);
const storeId = computed(() => route.params.storeId as string);

const storeInfo = computed(() => store.getStoreById(storeId.value));

// 状态栏时间
const currentTime = ref('');
let timeInterval: ReturnType<typeof setInterval> | null = null;
function updateTime() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${h}:${m}`;
}
onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 60000);
  // v3.1.37 BR-SHP-043 Layer2：检查所属项目状态，inactive 弹窗提示并返回
  if (projectId.value) {
    checkProjectActive(projectId.value);
  } else if (storeInfo.value) {
    checkProjectActive(storeInfo.value.project_id);
  }
});
onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});

// 返回项目首页（v3.1.30：门店列表入口暂时移除，返回项目首页）
function goBack() {
  if (projectId.value) {
    router.push(`/app/project/${projectId.value}`);
  } else {
    router.back();
  }
}

function goLiveDetail(liveId?: string) {
  if (liveId) router.push(`/app/live/${liveId}`);
}

function goProductDetail(productId: string) {
  if (productId) router.push(`/app/product/${productId}`);
}

// 跳转门店商品/直播列表页
function goItemsPage(tab: string) {
  router.push(`/app/store/${storeId.value}/items?projectId=${projectId.value}&tab=${tab}`);
}
</script>

<style scoped>
.store-detail {
  width: 100%;
  max-width: 414px;
  height: 100vh;
  max-height: 896px;
  margin: 0 auto;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', sans-serif;
  box-shadow: 0 0 30px rgba(0,0,0,0.15);
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px 4px;
  background: #fff;
  flex-shrink: 0;
}
.sb-time {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}
.sb-icons {
  display: flex;
  gap: 6px;
  font-size: 12px;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 44px;
  background: #fff;
  position: relative;
  flex-shrink: 0;
}
.nav-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}
.nav-back:active {
  background: #f0f0f0;
}
.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 17px;
  font-weight: 600;
  color: #111;
  max-width: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-spacer {
  width: 36px;
  flex-shrink: 0;
}

/* 可滚动内容区 */
.sd-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.sd-content::-webkit-scrollbar { display: none; }
</style>
