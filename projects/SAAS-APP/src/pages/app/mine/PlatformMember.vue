<template>
  <!-- 平台会员中心 — FN-SHP-APP-006（无平台统一会员卡 BR-SHP-028） -->
  <div class="platform-member">
    <div class="pmh-back" @click="goBack">‹ 返回</div>

    <!-- 平台级资产汇总 — v3.1.2补充，v3.1.5移除平台会员卡 -->
    <div class="pmh-summary">
      <div class="pms-item">
        <span class="pms-val">{{ totalPoints }}</span>
        <span class="pms-label">平台总积分</span>
      </div>
      <div class="pms-divider"></div>
      <div class="pms-item">
        <span class="pms-val">{{ totalCoupons }}</span>
        <span class="pms-label">平台总优惠券</span>
      </div>
      <div class="pms-divider"></div>
      <div class="pms-item">
        <span class="pms-val">¥{{ totalBalance.toFixed(2) }}</span>
        <span class="pms-label">平台总零钱</span>
      </div>
    </div>

    <!-- 已加入项目会员 -->
    <div class="pmh-section">
      <div class="pmh-section-title">已加入项目会员</div>
      <div class="pmh-member-list">
        <div
          v-for="pm in memberRelations"
          :key="pm.member_id"
          class="pmh-member-item"
          @click="goProject(pm.project_id)"
        >
          <div class="pmh-mi-left">
            <div class="pmh-mi-name">{{ projectName(pm.project_id) }}</div>
            <div class="pmh-mi-level">{{ levelIcon(pm.level) }} {{ levelName(pm.level) }}</div>
          </div>
          <div class="pmh-mi-right">
            <div class="pmh-mi-points">{{ pm.points }}积分</div>
            <div class="pmh-mi-spent">累计消费¥{{ pm.total_spent }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="pmh-section">
      <div class="pmh-section-title">积分说明</div>
      <div class="pmh-desc">
        平台积分可在所有项目通用，项目会员积分在各自项目内有效。升级项目会员等级可享受更多专属权益。
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-006', '平台会员中心');
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/user-store';
import { useProjectStore } from '../../../stores/project-store';

const userStore = useUserStore();
const projectStore = useProjectStore();
const router = useRouter();
const placeholder = 'https://picsum.photos/seed/user-placeholder/100/100';

const user = computed(() => userStore.currentUser);
const memberRelations = computed(() =>
  userStore.projectMembers.filter(m => m.user_id === user.value.user_id)
);

// 平台级资产汇总 — 各项目积分/优惠券/零钱的总和
const totalPoints = computed(() =>
  memberRelations.value.reduce((sum, m) => sum + (m.points || 0), 0) + (user.value.platform_points || 0)
);
const totalCoupons = computed(() => {
  const projectCoupons = memberRelations.value.reduce((sum, m) => sum + ((m as any).coupons?.length || 0), 0);
  return projectCoupons + (user.value.coupon_count || 0);
});
const totalBalance = computed(() =>
  memberRelations.value.reduce((sum, m) => sum + ((m as any).balance || 0), 0) + ((user.value as any).balance || 0)
);

function projectName(projectId: string) {
  return projectStore.getProjectById(projectId)?.name || projectId;
}
function levelIcon(level: string) {
  const map: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠' };
  return map[level] || '';
}
function levelName(level: string) {
  const map: Record<string, string> = { bronze: '青铜', silver: '白银', gold: '黄金', platinum: '铂金', diamond: '钻石' };
  return map[level] || level;
}

function goBack() { router.push('/app/mine'); }
function goProject(projectId: string) { router.push(`/app/project/${projectId}/member`); }
</script>

<style scoped>
.platform-member { padding-bottom: 16px; }
.pmh-back { padding: 12px; font-size: 14px; color: #666; cursor: pointer; }
.pmh-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
}
.pmh-avatar { width: 64px; height: 64px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); }
.pmh-name { font-size: 18px; font-weight: 600; margin-top: 8px; }
.pmh-level-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  font-size: 12px;
}

/* 平台级资产汇总 */
.pmh-summary {
  display: flex;
  align-items: center;
  margin: -16px 12px 12px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  position: relative;
  z-index: 1;
}
.pms-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.pms-val { font-size: 20px; font-weight: 700; color: #FF6B35; }
.pms-label { font-size: 11px; color: #999; }
.pms-divider { width: 1px; height: 32px; background: #eee; }

.pmh-section { margin: 12px; }
.pmh-section-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 10px; }
.pmh-member-list { background: #fff; border-radius: 12px; overflow: hidden; }
.pmh-member-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}
.pmh-member-item:last-child { border-bottom: none; }
.pmh-mi-name { font-size: 14px; font-weight: 500; color: #333; }
.pmh-mi-level { font-size: 12px; color: #999; margin-top: 4px; }
.pmh-mi-points { font-size: 14px; color: #FF6B35; font-weight: 600; text-align: right; }
.pmh-mi-spent { font-size: 11px; color: #999; margin-top: 2px; }
.pmh-desc {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}
</style>
