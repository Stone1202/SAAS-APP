<template>
  <!-- 门店卡片 — 精简版（去大图标，名称旁小logo，去评分，加联系人电话+拨打电话） -->
  <div class="store-card" @click="$emit('click')">
    <div class="sc-info">
      <div class="sc-base">
        <!-- 名称旁小logo -->
        <div class="sc-logo-box" :style="{ background: logoGradient }">
          <span class="sc-logo-text">{{ store.name?.charAt(0) || '店' }}</span>
        </div>
        <div class="sc-text">
          <div class="sc-name">{{ store.name }}</div>
          <div class="sc-desc" v-if="store.business_hours">🕒 {{ store.business_hours }}</div>
          <div class="sc-desc" v-if="store.address">📍 {{ store.address }}</div>
          <!-- 联系人+电话（与地址对齐） -->
          <div class="sc-desc sc-contact-row" v-if="store.contact_name || store.phone">
            <span v-if="store.contact_name">👤 {{ store.contact_name }}</span>
            <span v-if="store.phone">　📞 {{ store.phone }}</span>
            <a
              v-if="store.phone"
              :href="`tel:${store.phone}`"
              class="sc-call-link"
              @click.stop
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              拨打
            </a>
          </div>
        </div>
      </div>

      <!-- 推荐商品预览（含商品名称+价格） -->
      <div class="sc-products" v-if="topProducts.length">
        <div class="sc-products-title">🛒 商品推荐</div>
        <div class="sc-products-list">
          <div
            v-for="p in topProducts"
            :key="p.product_id"
            class="scp-item"
          >
            <span class="scp-emoji">{{ productEmoji(p) }}</span>
            <span class="scp-name">{{ p.name }}</span>
            <span class="scp-price">{{ p.price }}</span>
          </div>
        </div>
      </div>

      <!-- 推荐直播预览 -->
      <div class="sc-lives" v-if="topLives.length">
        <div class="sc-lives-title">📺 直播推荐</div>
        <div class="sc-lives-list">
          <div
            v-for="l in topLives"
            :key="l.live_id"
            class="scl-item"
            :class="`scl-status--${l.status}`"
          >
            <span class="scl-title">{{ l.title }}</span>
            <span class="scl-status">{{ liveStatusText(l.status) }}</span>
          </div>
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

const projectStore = useProjectStore();

// 渐变背景（用于小logo）
const logoGradient = computed(() => {
  const n = props.store.name;
  if (n?.includes('家居')) return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
  if (n?.includes('厨房')) return 'linear-gradient(135deg, #667eea, #764ba2)';
  if (n?.includes('户外')) return 'linear-gradient(135deg, #11998e, #38ef7d)';
  if (n?.includes('数码')) return 'linear-gradient(135deg, #0F2027, #203A43)';
  return 'linear-gradient(135deg, #FF6B35, #FF8F35)';
});

// 该门店商品数
const productCount = computed(() => {
  return projectStore.storeProducts(props.store.store_id).length;
});

// 推荐商品（前3个）
const topProducts = computed(() => {
  return projectStore.storeProducts(props.store.store_id).slice(0, 3);
});

// 该门店直播（前2个）
const topLives = computed(() => {
  return projectStore.livesByStore(props.store.store_id).slice(0, 2);
});

function liveStatusText(status: string): string {
  const map: Record<string, string> = { live: '直播中', upcoming: '预告', replay: '回放', ended: '已结束' };
  return map[status] || '直播中';
}

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
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 联系人+电话行（与地址对齐，行内显示） */
.sc-contact-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 4px;
  overflow: visible;
  white-space: normal;
  text-overflow: clip;
}
.sc-call-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
  padding: 2px 8px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.sc-call-link:active { opacity: 0.85; }

/* 推荐商品 */
.sc-products {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}
.sc-products-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}
.sc-products-list {
  display: flex;
  gap: 8px;
}
.scp-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px;
  background: #fafafa;
  border-radius: 8px;
}
.scp-emoji { font-size: 22px; }
.scp-name {
  font-size: 11px;
  color: #333;
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.scp-price {
  font-size: 12px;
  font-weight: 700;
  color: #F5222D;
}
.scp-price::before { content: '¥'; font-size: 10px; }

/* 推荐直播 */
.sc-lives {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}
.sc-lives-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}
.sc-lives-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scl-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid #ddd;
}
.scl-item.scl-status--live { border-left-color: #F5222D; }
.scl-item.scl-status--upcoming { border-left-color: #FA8C16; }
.scl-item.scl-status--replay { border-left-color: #999; }
.scl-item.scl-status--ended { border-left-color: #ccc; }
.scl-title {
  font-size: 12px;
  color: #333;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}
.scl-status {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}
.scl-status--live .scl-status { background: rgba(245,34,45,0.1); color: #F5222D; }
.scl-status--upcoming .scl-status { background: rgba(250,140,22,0.1); color: #FA8C16; }
.scl-status--replay .scl-status { background: rgba(0,0,0,0.06); color: #666; }
.scl-status--ended .scl-status { background: rgba(0,0,0,0.04); color: #999; }
</style>
