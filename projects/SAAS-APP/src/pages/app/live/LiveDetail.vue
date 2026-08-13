<template>
  <!-- 直播详情页 — FN-SHP-APP-014（v3.1.33 独立全屏，脱离 MobileFrame 和 ProjectFrame） -->
  <div class="ld-page">
    <!-- 顶部状态栏 -->
    <div class="ld-status-bar">
      <span class="lsb-time">{{ currentTime }}</span>
      <span class="lsb-icons">📶 🔋</span>
    </div>

  <div class="live-detail" v-if="live">
    <!-- 顶部封面 -->
    <div class="ld-cover" :class="`ld-cover--${live.status}`">
      <div class="ldc-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
      <span class="ldc-emoji">{{ emoji }}</span>
      <!-- 状态标签 -->
      <div class="ldc-status">
        <span :class="['lds-badge', `lds-badge--${live.status}`]">
          <span class="lds-dot" v-if="live.status === 'live'"></span>
          {{ statusText }}
        </span>
      </div>
      <!-- 观看数 -->
      <div class="ldc-viewers" v-if="live.status === 'live'">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        {{ viewerText }}
      </div>
    </div>

    <!-- 直播信息 -->
    <div class="ld-info">
      <div class="ldi-title">{{ live.title }}</div>
      <div class="ldi-anchor">
        <span class="ldi-avatar">{{ live.anchor_name?.charAt(0) || '主' }}</span>
        <span class="ldi-name">{{ live.anchor_name }}</span>
        <span class="ldi-time" v-if="live.started_at">{{ formatTime(live.started_at) }}</span>
      </div>
    </div>

    <!-- 回放入口 -->
    <div class="ld-replay" v-if="live.status === 'replay' && live.replay_url">
      <div class="ldr-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="none">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <span>观看回放</span>
      </div>
    </div>

    <!-- 直播商品 -->
    <div class="ld-products" v-if="liveProducts.length">
      <div class="ldp-header">
        <span class="ldp-title">直播商品</span>
        <span class="ldp-count">共{{ liveProducts.length }}件</span>
      </div>
      <div class="ldp-scroll">
        <div
          v-for="product in liveProducts"
          :key="product.product_id"
          class="ldp-item"
          @click="goProduct(product.product_id)"
        >
          <span class="ldp-emoji">📦</span>
          <span class="ldp-name">{{ product.name }}</span>
          <span class="ldp-price">¥{{ product.price }}</span>
        </div>
      </div>
    </div>

    <!-- 所属项目入口 -->
    <div class="ld-project" v-if="projectInfo" @click="goProject">
      <div class="ldpr-icon">📦</div>
      <div class="ldpr-info">
        <div class="ldpr-label">所属项目</div>
        <div class="ldpr-name">{{ projectInfo.name }}</div>
      </div>
      <div class="ldpr-arrow">›</div>
    </div>

    <div class="safe-bottom"></div>
  </div>

  <!-- 直播不存在 -->
  <div class="ld-not-found" v-else>
    <span class="lnf-icon">📺</span>
    <span class="lnf-text">直播不可见</span>
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-014', '直播详情页');
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
  if (live.value) {
    checkProjectActive(live.value.project_id);
  }
});
onUnmounted(() => { if (timer) clearInterval(timer); });

const liveId = computed(() => route.params.liveId as string);
const live = computed(() => store.getLiveById(liveId.value));

// 路由参数变化时也检查（动态参数切换直播详情）
watch(liveId, (id) => {
  if (id) {
    const l = store.getLiveById(id);
    if (l) checkProjectActive(l.project_id);
  }
});

const projectInfo = computed(() =>
  live.value ? store.getProjectById(live.value.project_id) : null
);

const liveProducts = computed(() => {
  if (!live.value?.product_ids?.length) return [];
  return live.value.product_ids
    .map(id => store.getProductById(id))
    .filter(Boolean) as any[];
});

// emoji
const emoji = computed(() => {
  const t = live.value?.title || '';
  if (t.includes('清洁') || t.includes('收纳')) return '🧹';
  if (t.includes('美食') || t.includes('厨房')) return '🍳';
  if (t.includes('健身') || t.includes('运动')) return '💪';
  if (t.includes('数码') || t.includes('新品')) return '🎮';
  if (t.includes('日用')) return '🏠';
  if (t.includes('营养') || t.includes('维生素')) return '💊';
  if (t.includes('滋补')) return '🍯';
  return '📺';
});

// 状态文字
const statusText = computed(() => {
  const map: Record<string, string> = {
    live: '直播进行中',
    replay: '回放可观看',
    ended: '直播已结束',
    upcoming: '直播未开始',
  };
  return map[live.value?.status || ''] || '';
});

// 观看数
const viewerText = computed(() => {
  const v = live.value?.viewer_count || 0;
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return String(v);
});

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function goBack() {
  router.back();
}

function goProduct(productId: string) {
  router.push(`/app/product/${productId}`);
}

function goProject() {
  if (projectInfo.value) {
    router.push(`/app/project/${projectInfo.value.project_id}`);
  }
}
</script>

<style scoped>
/* v3.1.33 独立全屏容器（与 StoreItems 一致的手机壳样式） */
.ld-page {
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
.ld-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.lsb-icons { font-size: 12px; }

.live-detail {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f5f5f5;
}

/* 封面 */
.ld-cover {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.ld-cover--live {
  background: linear-gradient(135deg, #FF6B35 0%, #FF4D4F 50%, #FF8F35 100%);
}
.ld-cover--replay {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.ld-cover--ended {
  background: linear-gradient(135deg, #8e9eab, #eef2f3);
}
.ld-cover--upcoming {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}
.ldc-back {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ldc-emoji { font-size: 80px; }

/* 状态标签 */
.ldc-status {
  position: absolute;
  bottom: 12px;
  left: 12px;
}
.lds-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.lds-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F5222D;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* 观看数 */
.ldc-viewers {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}

/* 直播信息 */
.ld-info {
  margin: -20px 12px 10px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  position: relative;
  z-index: 1;
}
.ldi-title { font-size: 17px; font-weight: 600; color: #111; line-height: 1.5; }
.ldi-anchor { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
.ldi-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ldi-name { font-size: 14px; font-weight: 600; color: #333; }
.ldi-time { font-size: 12px; color: #999; margin-left: auto; }

/* 回放按钮 */
.ld-replay { margin: 0 12px 10px; }
.ldr-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

/* 直播商品 */
.ld-products {
  margin: 0 12px 10px;
  padding: 12px;
  background: #fff;
  border-radius: 14px;
}
.ldp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
}
.ldp-title { font-size: 15px; font-weight: 700; color: #111; }
.ldp-count { font-size: 12px; color: #999; }
.ldp-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.ldp-scroll::-webkit-scrollbar { display: none; }
.ldp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 100px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 10px;
  cursor: pointer;
}
.ldp-emoji { font-size: 28px; }
.ldp-name {
  font-size: 12px;
  color: #333;
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ldp-price { font-size: 14px; font-weight: 700; color: #F5222D; }

/* 项目入口 */
.ld-project {
  display: flex;
  align-items: center;
  margin: 0 12px 10px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 14px;
  cursor: pointer;
}
.ldpr-icon { font-size: 28px; flex-shrink: 0; }
.ldpr-info { flex: 1; margin-left: 12px; }
.ldpr-label { font-size: 11px; color: #999; }
.ldpr-name { font-size: 15px; font-weight: 600; color: #333; margin-top: 2px; }
.ldpr-arrow { font-size: 22px; color: #ccc; }

/* 不存在 */
.ld-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}
.lnf-icon { font-size: 56px; opacity: 0.3; }
.lnf-text { font-size: 16px; color: #999; }

.safe-bottom { height: 24px; }
</style>
