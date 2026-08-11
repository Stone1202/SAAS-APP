<template>
  <!-- 个人中心（平台维度） — 复刻参考UI：浅绿头部+签到+资产卡+VIP卡+订单+常用功能+猜你喜欢 -->
  <div class="platform-mine">
    <!-- 顶部浅绿背景区 -->
    <div class="pm-header">
      <!-- 顶部工具栏 -->
      <div class="pm-top-bar">
        <div class="pm-sign-in" @click="onSignIn">
          <span class="pm-sign-icon">🪙</span>
          <span>签到领好礼</span>
        </div>
        <div class="pm-top-actions">
          <span class="pm-action-icon" @click="onScan">📷</span>
          <span class="pm-action-icon" @click="goSettings">⚙️</span>
        </div>
      </div>

      <!-- 用户信息 -->
      <div class="pm-user-row">
        <img :src="user.avatar || placeholder" class="pm-avatar" />
        <div class="pm-user-info">
          <div class="pm-nickname">{{ maskedNickname }}</div>
          <div class="pm-vip-badge">
            <span class="pm-vip-v">V</span>
            <span>VIP</span>
          </div>
        </div>
      </div>

      <!-- 资产卡 -->
      <div class="pm-asset-card">
        <div class="pm-asset-unit" @click="goCoupons">
          <div class="pm-asset-icon pm-asset-icon--coupon">¥</div>
          <div class="pm-asset-text">
            <div class="pm-asset-label">优惠券</div>
            <div class="pm-asset-val">{{ user.coupon_count || 0 }}张</div>
          </div>
        </div>
        <div class="pm-asset-divider"></div>
        <div class="pm-asset-unit" @click="goPoints">
          <div class="pm-asset-icon pm-asset-icon--points">★</div>
          <div class="pm-asset-text">
            <div class="pm-asset-label">积分</div>
            <div class="pm-asset-val">{{ user.platform_points || 0 }}个</div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIP会员卡 -->
    <div class="pm-vip-card" @click="goMember">
      <div class="pm-vip-left">
        <span class="pm-vip-crown">👑</span>
        <span class="pm-vip-title">VIP</span>
        <span class="pm-vip-line">|</span>
        <span class="pm-vip-desc">已达到最高等级</span>
        <span class="pm-vip-arrow">›</span>
      </div>
      <div class="pm-vip-right">
        <span>查看权益</span>
        <span class="pm-vip-arrow">›</span>
      </div>
    </div>

    <!-- 我的订单 -->
    <div class="pm-panel">
      <div class="pm-panel-head">
        <span class="pm-panel-title">我的订单</span>
        <span class="pm-panel-more" @click="goOrders">
          <span>全部订单</span>
          <span class="pm-panel-arrow">›</span>
        </span>
      </div>
      <div class="pm-order-grid">
        <div class="pm-order-item" v-for="o in orderMenus" :key="o.label" @click="goOrderStatus(o.status)">
          <div class="pm-order-icon" :style="{ background: o.gradient }">{{ o.icon }}</div>
          <div class="pm-order-label">{{ o.label }}</div>
        </div>
      </div>
    </div>

    <!-- 常用功能 -->
    <div class="pm-panel">
      <div class="pm-panel-head">
        <span class="pm-panel-title">常用功能</span>
      </div>
      <div class="pm-func-grid">
        <div class="pm-func-item" v-for="f in funcMenus" :key="f.label" @click="f.onClick">
          <div class="pm-func-icon" :style="{ background: f.gradient }">{{ f.icon }}</div>
          <div class="pm-func-label">{{ f.label }}</div>
        </div>
      </div>
    </div>

    <!-- 猜你喜欢 -->
    <div class="pm-panel pm-guess-panel">
      <div class="pm-panel-head">
        <span class="pm-panel-title">猜你喜欢</span>
      </div>
      <div class="pm-guess-list" v-if="guessProducts.length">
        <div
          v-for="p in guessProducts"
          :key="p.product_id"
          class="pm-guess-item"
          @click="goProductDetail(p.product_id)"
        >
          <div class="pm-guess-img-wrap">
            <img :src="p.cover_image" class="pm-guess-img" />
          </div>
          <div class="pm-guess-name">{{ p.name }}</div>
          <div class="pm-guess-price">¥{{ p.price.toFixed(2) }}</div>
        </div>
      </div>
      <div v-else class="pm-empty">暂无推荐商品</div>
    </div>

    <!-- 项目选择弹窗 -->
    <div class="pm-picker-mask" v-if="pickerVisible" @click.self="closePicker">
      <div class="pm-picker">
        <div class="pm-picker-head">
          <span class="pm-picker-title">请选择项目</span>
          <span class="pm-picker-close" @click="closePicker">✕</span>
        </div>
        <div class="pm-picker-body">
          <div
            v-for="pid in joinedProjectIds"
            :key="pid"
            class="pm-picker-item"
            @click="pickProject(pid)"
          >
            <img :src="projectLogo(pid)" class="pm-picker-logo" v-if="projectLogo(pid)" />
            <div class="pm-picker-info">
              <div class="pm-picker-name">{{ projectName(pid) }}</div>
              <div class="pm-picker-desc">{{ projectStore.getProjectById(pid)?.mall_name || '' }}</div>
            </div>
            <span class="pm-picker-arrow">›</span>
          </div>
          <div class="pm-picker-empty" v-if="!joinedProjectIds.length">暂无已加入的项目</div>
        </div>
      </div>
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-005', '个人中心');
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/user-store';
import { useProjectStore } from '../../../stores/project-store';

const userStore = useUserStore();
const projectStore = useProjectStore();
const router = useRouter();
const placeholder = 'https://picsum.photos/seed/user-placeholder/100/100';

const user = computed(() => userStore.currentUser);

const maskedNickname = computed(() => {
  const n = user.value.nickname || '';
  if (n.length > 10) return n.slice(0, 10) + '...';
  return n;
});

// 猜你喜欢：取前10个在售商品
const guessProducts = computed(() =>
  projectStore.products
    .filter(p => p.status === 'on_sale')
    .slice(0, 10)
);

const orderMenus = [
  { label: '待付款', status: 'pending', icon: '💳', gradient: 'linear-gradient(135deg, #f5c71a, #f4b400)' },
  { label: '待发货', status: 'paid', icon: '📦', gradient: 'linear-gradient(135deg, #ff7aa2, #ff4d6d)' },
  { label: '待收货', status: 'shipped', icon: '🚚', gradient: 'linear-gradient(135deg, #a66cff, #7c3aed)' },
  { label: '待评价', status: 'received', icon: '💬', gradient: 'linear-gradient(135deg, #4facfe, #00c6fb)' },
  { label: '售后退款', status: 'refund', icon: '💰', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
];

const funcMenus = [
  { label: '工作台', icon: '🖥️', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', onClick: goWorkspace },
  { label: '我的零钱', icon: '¥', gradient: 'linear-gradient(135deg, #f5c71a, #f4b400)', onClick: goWallet },
  { label: '直播预约', icon: '📹', gradient: 'linear-gradient(135deg, #ff7aa2, #ff4d6d)', onClick: goLiveBook },
  { label: '收货地址', icon: '📍', gradient: 'linear-gradient(135deg, #4facfe, #00c6fb)', onClick: goAddresses },
];

// 已加入的项目列表
const joinedProjectIds = computed(() => userStore.joinedProjectIds);
const pickerVisible = ref(false);
const pickerTargetTab = ref('');

function projectName(pid: string) { return projectStore.getProjectById(pid)?.name || ''; }
function projectLogo(pid: string) { return projectStore.getProjectById(pid)?.logo || ''; }

// 事件
function onSignIn() {
  openPicker('signin');
}
function onScan() {
  alert('扫一扫功能开发中');
}
function goSettings() {
  alert('设置功能开发中');
}
function goCoupons() {
  openPicker('coupons');
}
function goPoints() {
  openPicker('points');
}
function goMember() {
  openPicker('level');
}
function goOrders() {
  router.push('/app/mine/orders');
}
function goOrderStatus(status: string) {
  router.push(`/app/mine/orders?status=${status}`);
}
function goWorkspace() {
  alert('工作台功能开发中');
}
function goWallet() {
  openPicker('wallet');
}
function goLiveBook() {
  alert('直播预约功能开发中');
}
function goAddresses() {
  router.push('/app/mine/addresses');
}
function goProductDetail(productId: string) {
  router.push(`/app/product/${productId}`);
}

// 项目选择弹窗
function openPicker(tab: string) {
  pickerTargetTab.value = tab;
  pickerVisible.value = true;
}
function closePicker() {
  pickerVisible.value = false;
}
function pickProject(pid: string) {
  const tab = pickerTargetTab.value;
  pickerVisible.value = false;
  router.push(`/app/project/${pid}/member?tab=${tab}`);
}
</script>

<style scoped>
.platform-mine {
  min-height: 100%;
  background: #f6f7f9;
  padding-bottom: 24px;
}

/* ===== 顶部浅绿背景区 ===== */
.pm-header {
  position: relative;
  padding: 12px 16px 24px;
  background: linear-gradient(180deg, #e0f7f1 0%, #d4f3eb 60%, #f6f7f9 100%);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.pm-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pm-sign-in {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  font-size: 12px;
  color: #d4a017;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid rgba(212, 160, 23, 0.15);
}
.pm-sign-icon {
  font-size: 14px;
}
.pm-top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.pm-action-icon {
  font-size: 20px;
  cursor: pointer;
  color: #333;
}

/* 用户信息 */
.pm-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.pm-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  object-fit: cover;
}
.pm-user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pm-nickname {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}
.pm-vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px 2px 2px;
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  width: fit-content;
}
.pm-vip-v {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  color: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
}

/* 资产卡 */
.pm-asset-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 14px 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.pm-asset-unit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}
.pm-asset-divider {
  width: 1px;
  height: 34px;
  background: #eee;
}
.pm-asset-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.pm-asset-icon--coupon {
  background: linear-gradient(135deg, #ff7aa2, #ff4d6d);
}
.pm-asset-icon--points {
  background: linear-gradient(135deg, #f5c71a, #f4b400);
}
.pm-asset-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pm-asset-label {
  font-size: 12px;
  color: #999;
}
.pm-asset-val {
  font-size: 15px;
  font-weight: 700;
  color: #222;
}

/* ===== VIP会员卡 ===== */
.pm-vip-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -8px 16px 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #2c3e50 0%, #4b5d6e 100%);
  border-radius: 14px;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(44, 62, 80, 0.2);
}
.pm-vip-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.pm-vip-crown {
  font-size: 14px;
}
.pm-vip-title {
  font-weight: 800;
  letter-spacing: 1px;
}
.pm-vip-line {
  opacity: 0.5;
  font-weight: 300;
}
.pm-vip-desc {
  opacity: 0.9;
}
.pm-vip-arrow {
  opacity: 0.8;
  font-size: 14px;
}
.pm-vip-right {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  opacity: 0.9;
}

/* ===== 通用面板 ===== */
.pm-panel {
  margin: 12px 16px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}
.pm-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.pm-panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #222;
}
.pm-panel-more {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
}
.pm-panel-arrow {
  font-size: 14px;
}

/* ===== 我的订单 ===== */
.pm-order-grid {
  display: flex;
  justify-content: space-between;
}
.pm-order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.pm-order-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
}
.pm-order-label {
  font-size: 11px;
  color: #555;
}

/* ===== 常用功能 ===== */
.pm-func-grid {
  display: flex;
  gap: 24px;
}
.pm-func-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 60px;
}
.pm-func-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  color: #fff;
  font-weight: 700;
}
.pm-func-label {
  font-size: 11px;
  color: #555;
}

/* ===== 猜你喜欢 ===== */
.pm-guess-panel {
  padding-bottom: 12px;
}
.pm-guess-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  -webkit-overflow-scrolling: touch;
}
.pm-guess-list::-webkit-scrollbar { display: none; }
.pm-guess-item {
  flex-shrink: 0;
  width: 120px;
  cursor: pointer;
}
.pm-guess-img-wrap {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;
  margin-bottom: 8px;
}
.pm-guess-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pm-guess-name {
  font-size: 12px;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}
.pm-guess-price {
  font-size: 13px;
  font-weight: 700;
  color: #ff4d4f;
}
.pm-empty {
  text-align: center;
  font-size: 13px;
  color: #999;
  padding: 20px 0;
}

/* ===== 项目选择弹窗 ===== */
.pm-picker-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.pm-picker {
  width: 100%;
  max-width: 500px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}
.pm-picker-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.pm-picker-title { font-size: 16px; font-weight: 700; color: #222; }
.pm-picker-close { font-size: 18px; color: #999; cursor: pointer; padding: 4px 8px; }
.pm-picker-body { padding: 8px 16px 24px; overflow-y: auto; }
.pm-picker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 8px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}
.pm-picker-item:last-child { border-bottom: none; }
.pm-picker-item:active { background: #f9f9f9; }
.pm-picker-logo { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; }
.pm-picker-info { flex: 1; }
.pm-picker-name { font-size: 14px; font-weight: 600; color: #222; }
.pm-picker-desc { font-size: 11px; color: #999; margin-top: 2px; }
.pm-picker-arrow { font-size: 18px; color: #ccc; }
.pm-picker-empty { text-align: center; font-size: 13px; color: #999; padding: 40px 0; }
</style>
