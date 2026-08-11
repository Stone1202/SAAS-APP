<template>
  <!-- 项目维度-我的优惠券二级页 — FN-SHP-APP-013A -->
  <div class="coupons-page">
    <!-- 顶部导航 -->
    <div class="cp-nav">
      <span class="cp-back" @click="goBack">‹</span>
      <span class="cp-title">我的优惠券</span>
      <span class="cp-placeholder"></span>
    </div>

    <!-- 筛选Tab -->
    <div class="cp-tabs">
      <div
        v-for="t in tabs"
        :key="t.value"
        :class="['cp-tab', { active: activeTab === t.value }]"
        @click="activeTab = t.value"
      >
        {{ t.label }}({{ countByTab(t.value) }})
      </div>
    </div>

    <!-- 优惠券列表 -->
    <div class="cp-list" v-if="filteredCoupons.length">
      <div
        v-for="c in filteredCoupons"
        :key="c.coupon_id"
        :class="['cp-card', `cc-${c.type}`, { 'cc-disabled': c.status !== 'unused' }]"
      >
        <div class="cp-card-left">
          <div class="cp-amount" v-if="c.type === 'full_reduction'">¥{{ c.amount }}</div>
          <div class="cp-amount" v-else-if="c.type === 'discount'">{{ ((c.discount || 1) * 10).toFixed(0) }}折</div>
          <div class="cp-amount cp-amount-text" v-else>兑换</div>
          <div class="cp-threshold" v-if="c.type === 'full_reduction'">满{{ c.threshold }}可用</div>
          <div class="cp-threshold" v-else-if="c.type === 'discount'">不限门槛</div>
          <div class="cp-threshold" v-else>积分兑换</div>
        </div>
        <div class="cp-card-right">
          <div class="cp-card-title">{{ c.title }}</div>
          <div class="cp-card-desc">{{ c.description || c.tag || '' }}</div>
          <div class="cp-card-valid">有效期至 {{ c.valid_end }}</div>
          <div class="cp-card-status" v-if="c.status === 'used'">已使用</div>
          <div class="cp-card-status" v-else-if="c.status === 'expired'">已过期</div>
          <div class="cp-card-use" v-else>立即使用 ›</div>
        </div>
      </div>
    </div>
    <div class="cp-empty" v-else>
      <div class="cp-empty-icon">🎫</div>
      <div class="cp-empty-text">暂无优惠券</div>
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-013A', '项目优惠券页');
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import { useUserStore } from '../../../stores/user-store';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const userStore = useUserStore();

const projectId = computed(() => route.params.projectId as string);

const tabs = [
  { label: '全部', value: 'all' },
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' },
];

const activeTab = ref('all');

const userCoupons = computed(() =>
  projectStore.couponsByProjectUser(projectId.value, userStore.currentUser.user_id)
);

const filteredCoupons = computed(() => {
  if (activeTab.value === 'all') return userCoupons.value;
  return userCoupons.value.filter(c => c.status === activeTab.value);
});

function countByTab(tab: string) {
  if (tab === 'all') return userCoupons.value.length;
  return userCoupons.value.filter(c => c.status === tab).length;
}

function goBack() {
  router.push(`/app/project/${projectId.value}/member?tab=coupons`);
}
</script>

<style scoped>
.coupons-page { background: #f5f5f5; min-height: 100%; }

.cp-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.cp-back { font-size: 22px; color: #222; cursor: pointer; padding: 4px 8px; }
.cp-title { font-size: 16px; font-weight: 700; color: #222; }
.cp-placeholder { width: 30px; }

.cp-tabs {
  display: flex;
  background: #fff;
  padding: 0 16px 12px;
  gap: 8px;
}
.cp-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  color: #666;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;
}
.cp-tab.active { background: #5B6E96; color: #fff; font-weight: 600; }

.cp-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.cp-card {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px dashed #ddd;
}
.cp-card-left {
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 8px;
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
  color: #ff4d4f;
}
.cp-card.cc-discount .cp-card-left { background: linear-gradient(135deg, #fffbe6, #fff1b8); color: #faad14; }
.cp-card.cc-exchange .cp-card-left { background: linear-gradient(135deg, #f0f5ff, #d6e4ff); color: #2f54eb; }
.cp-card.cc-disabled .cp-card-left { background: #f5f5f5; color: #ccc; }
.cp-amount { font-size: 26px; font-weight: 700; }
.cp-amount-text { font-size: 18px; }
.cp-threshold { font-size: 10px; margin-top: 4px; opacity: 0.8; }

.cp-card-right {
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.cp-card-title { font-size: 15px; font-weight: 600; color: #333; }
.cp-card-desc { font-size: 11px; color: #999; }
.cp-card-valid { font-size: 10px; color: #bbb; }
.cp-card-status { font-size: 12px; color: #bbb; margin-top: 4px; }
.cp-card-use { font-size: 13px; color: #ff4d4f; font-weight: 600; margin-top: 4px; }
.cp-card.cc-disabled .cp-card-use { display: none; }

.cp-empty { padding: 60px 0; text-align: center; }
.cp-empty-icon { font-size: 48px; opacity: 0.3; }
.cp-empty-text { font-size: 14px; color: #999; margin-top: 12px; }

.safe-bottom { height: 24px; }
</style>
