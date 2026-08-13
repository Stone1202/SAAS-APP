<template>
  <!-- 项目会员中心 — FN-SHP-APP-013 优化升级：资产卡+锚点导航+签到+等级卡片+积分板块 -->
  <div class="member-page">
    <!-- v3.1.37 BR-SHP-043 Layer5：项目停用提示条 -->
    <div class="project-disabled-bar" v-if="!projectActive">
      <span class="pdb-icon">⚠️</span>
      <span class="pdb-text">该项目已停用，部分功能不可用（签到/下单/券使用已禁用，积分/券/余额仍可查看）</span>
    </div>

    <!-- M0 会员资产卡（固定顶部） -->
    <div class="mp-card" :id="'top'">
      <div class="mp-card-bg"></div>
      <div class="mp-card-inner">
        <div class="mp-header">
          <div class="mp-avatar">{{ userName?.charAt(0) || '用' }}</div>
          <div class="mp-user-info">
            <div class="mp-nick">{{ userName }}</div>
            <div class="mp-level-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>{{ currentLevel?.name || '普通会员' }}</span>
            </div>
          </div>
          <div class="mp-project-name" v-if="projectName">{{ projectName }}</div>
        </div>

        <!-- 3列资产概览 -->
        <div class="mp-stats">
          <div class="mps-item" @click="goPointsDetail">
            <span class="mps-val">{{ member?.points || 0 }}</span>
            <span class="mps-label">积分</span>
          </div>
          <div class="mps-divider"></div>
          <div class="mps-item">
            <span class="mps-val">{{ couponCount }}</span>
            <span class="mps-label">优惠券</span>
          </div>
          <div class="mps-divider"></div>
          <div class="mps-item" @click="scrollTo('wallet')">
            <span class="mps-val">¥{{ balance.toFixed(2) }}</span>
            <span class="mps-label">零钱</span>
          </div>
        </div>

        <!-- 升级进度 -->
        <div class="mp-progress" v-if="member && currentLevel && nextLevel">
          <div class="mpp-text">
            距 {{ nextLevel.name }} 还需 {{ (nextLevel.points_threshold - member.current_level_points) }} 积分
          </div>
          <div class="mpp-bar"><div class="mpp-fill" :style="{ width: `${upgradePercent}%` }"></div></div>
        </div>
      </div>
    </div>

    <!-- 锚点导航 -->
    <div class="anchor-nav" ref="navRef">
      <div
        v-for="a in anchors"
        :key="a.id"
        :class="['anchor-item', { active: activeAnchor === a.id }]"
        @click="scrollTo(a.id)"
      >
        <span class="anchor-icon">{{ a.icon }}</span>
        <span class="anchor-label">{{ a.label }}</span>
      </div>
    </div>

    <!-- M1 签到模块 -->
    <div class="section" id="signin">
      <div class="section-header">
        <span class="sh-title">每日签到</span>
        <span class="sh-sub">本月已签到 {{ signIn?.month_sign_days || 0 }} 天</span>
      </div>
      <div class="signin-week">
        <div
          v-for="(d, i) in weekDays"
          :key="i"
          :class="['sw-day', { signed: d.signed, today: d.isToday }]"
        >
          <div class="swd-label">{{ d.label }}</div>
          <div class="swd-icon">
            <span v-if="d.signed">✓</span>
            <span v-else-if="d.isToday">●</span>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="swd-reward">+{{ signIn?.week_rewards?.[i] || 2 }}</div>
        </div>
      </div>
      <div class="signin-tip" v-if="signIn">
        连续签到7天可额外获得 {{ signIn.continuous_reward || 20 }} 积分
      </div>
      <div class="signin-btn-wrap">
        <button
          :class="['signin-btn', { signed: isSignedToday }]"
          @click="onSignIn"
          :disabled="isSignedToday || !projectActive"
        >
          {{ !projectActive ? '项目已停用' : (isSignedToday ? '今日已签到' : '立即签到') }}
        </button>
      </div>
    </div>

    <!-- M2 会员等级（卡片式设计） -->
    <div class="section level-section" id="level" v-if="levels.length">
      <div class="section-header">
        <span class="sh-title">会员等级</span>
        <span class="sh-sub" v-if="currentLevel">{{ currentLevel.name }} · 享{{ currentLevel.privileges?.length || 0 }}项权益</span>
      </div>

      <!-- 等级卡片横向滚动 -->
      <div class="level-cards-scroll">
        <div class="level-cards">
          <div
            v-for="lv in levels"
            :key="lv.level_id"
            :class="['lvcard', { current: lv.level === member?.level, reached: isReached(lv) }]"
            :style="cardStyle(lv)"
          >
            <!-- 卡片背景装饰 -->
            <div class="lvcard-deco" :style="cardDecoStyle(lv)"></div>
            <div class="lvcard-body">
              <div class="lvcard-badge">
                <span class="lvcard-icon">{{ lv.icon || '⭐' }}</span>
              </div>
              <div class="lvcard-name">{{ lv.name }}</div>
              <div class="lvcard-threshold">{{ lv.points_threshold }}积分</div>
              <div class="lvcard-status">
                <span v-if="lv.level === member?.level" class="lvs-current">当前等级</span>
                <span v-else-if="isReached(lv)" class="lvs-reached">已达成</span>
                <span v-else class="lvs-unreached">未达成</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前等级权益 -->
      <div class="level-privileges" v-if="currentLevel?.privileges?.length">
        <div class="lp-title">
          <span class="lp-icon">🎁</span>
          <span>{{ currentLevel.name }} 专属权益</span>
        </div>
        <div class="lp-tags">
          <div class="lp-tag" v-for="p in currentLevel.privileges" :key="p">
            <span class="lpt-check">✓</span>
            <span>{{ p }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- M3 积分板块（我的积分+积分账单+积分兑换+积分规则） -->
    <div class="section points-section" id="points">
      <!-- 积分余额展示 -->
      <div class="points-balance">
        <div class="pb-left">
          <div class="pb-label">我的积分</div>
          <div class="pb-value">{{ member?.points || 0 }}</div>
        </div>
        <div class="pb-circle">
          <div class="pbc-inner">
            <span class="pbc-icon">★</span>
          </div>
        </div>
      </div>

      <!-- 积分功能入口 -->
      <div class="points-actions">
        <div class="pa-item" @click="goPointsBill">
          <div class="pa-icon pa-icon-bill">📊</div>
          <div class="pa-name">我的积分</div>
        </div>
        <div class="pa-divider"></div>
        <div class="pa-item" @click="goPointsMall">
          <div class="pa-icon pa-icon-exchange">🎁</div>
          <div class="pa-name">积分兑换</div>
        </div>
        <div class="pa-divider"></div>
        <div class="pa-item" @click="goPointsHistory">
          <div class="pa-icon pa-icon-history">📋</div>
          <div class="pa-name">积分明细</div>
        </div>
      </div>

      <!-- 积分规则 -->
      <div class="points-rules">
        <div class="pr-title">积分获取规则</div>
        <div class="rule-list">
          <div class="rule-item" v-for="r in rules" :key="r.key">
            <div class="ri-icon-wrap" :style="{ background: r.bg }">
              <span class="ri-icon">{{ r.icon }}</span>
            </div>
            <span class="ri-action">{{ r.action }}</span>
            <span class="ri-reward">{{ r.reward }}</span>
          </div>
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-013', '项目会员页');
import { computed, ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import { useUserStore } from '../../../stores/user-store';
import { useProjectStatusFilter } from '../../../composables/useProjectStatusFilter';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const userStore = useUserStore();
const { isProjectActive } = useProjectStatusFilter();

const projectId = computed(() => route.params.projectId as string);
const userName = computed(() => userStore.currentUser?.nickname || '用户');
const projectName = computed(() => projectStore.getProjectById(projectId.value)?.name || '');

// v3.1.37 BR-SHP-043 Layer5：项目停用状态
const projectActive = computed(() => isProjectActive(projectId.value));

const member = computed(() => userStore.memberByProject(projectId.value));
const couponCount = computed(() => (member.value as any)?.coupons?.length || 0);
const balance = computed(() => (member.value as any)?.balance || 0);

const levels = computed(() => projectStore.memberLevelsByProject(projectId.value));
const currentLevel = computed(() => levels.value.find(l => l.level === member.value?.level));
const nextLevel = computed(() => {
  if (!levels.value.length || !member.value) return null;
  const idx = levels.value.findIndex(l => l.level === member.value?.level);
  return idx >= 0 && idx < levels.value.length - 1 ? levels.value[idx + 1] : null;
});
const upgradePercent = computed(() => {
  if (!member.value || !nextLevel.value) return 100;
  const cur = member.value.current_level_points || 0;
  const target = nextLevel.value.points_threshold || 0;
  if (target <= 0) return 100;
  return Math.min(100, Math.round((cur / target) * 100));
});

// 签到状态
const signIn = computed(() =>
  projectStore.signInStateByProjectUser(projectId.value, userStore.currentUser.user_id)
);
const isSignedToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return signIn.value?.last_sign_date === today;
});
const weekDays = computed(() => {
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const signed = signIn.value?.week_signed || [];
  return labels.map((label, i) => {
    return {
      label: `周${label}`,
      signed: i < signed.length,
      isToday: i === signed.length && !isSignedToday.value,
    };
  });
});

// 等级相关
const levelGradients: Record<string, string> = {
  bronze: 'linear-gradient(135deg, #C8855B 0%, #A0633A 100%)',
  silver: 'linear-gradient(135deg, #B8C4D0 0%, #8A9BAE 100%)',
  gold: 'linear-gradient(135deg, #F5C451 0%, #D4A020 100%)',
  platinum: 'linear-gradient(135deg, #B4C5D4 0%, #7E94A8 100%)',
  diamond: 'linear-gradient(135deg, #6FD4E8 0%, #4AB8D0 100%)',
};

function levelColor(level: string) {
  const map: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  };
  return map[level] || '#aaa';
}

function isReached(lv: any) {
  if (!member.value) return false;
  return (member.value.points || 0) >= (lv.points_threshold || 0);
}

function cardStyle(lv: any) {
  const grad = levelGradients[lv.level] || levelGradients.bronze;
  if (lv.level === member.value?.level) {
    return { background: grad, boxShadow: `0 8px 24px ${levelColor(lv.level)}66` };
  }
  if (isReached(lv)) {
    return { background: grad, opacity: '0.85' };
  }
  return { background: '#f0f0f0' };
}

function cardDecoStyle(lv: any) {
  if (lv.level === member.value?.level || isReached(lv)) {
    return { background: 'rgba(255,255,255,0.12)' };
  }
  return { background: 'rgba(0,0,0,0.04)' };
}

// 锚点导航 — v3.1.33 "等级"改为"会员"
const anchors = [
  { id: 'signin', label: '签到', icon: '📅' },
  { id: 'level', label: '会员', icon: '🏅' },
  { id: 'points', label: '积分', icon: '★' },
];
// v3.1.33 默认不滚动定位（避免进入页面就跳到"会员"锚点）
const activeAnchor = ref('');

const navRef = ref<HTMLElement | null>(null);

function scrollTo(id: string) {
  activeAnchor.value = id;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// 签到
function onSignIn() {
  if (isSignedToday.value) return;
  // v3.1.37 BR-SHP-043 Layer4：项目停用时禁止签到
  if (!projectActive.value) {
    alert('项目已停用，暂无法签到');
    return;
  }
  const earned = projectStore.doSignIn(projectId.value, userStore.currentUser.user_id);
  if (earned > 0) {
    userStore.addPoints(projectId.value, earned);
    alert(`签到成功！获得 ${earned} 积分`);
  }
}

// 入口跳转
// v3.1.42: 我的积分点击→跳转积分二级页（暂alert）
function goPointsDetail() { alert('我的积分页面开发中'); }
function goCouponList() {
  router.push(`/app/project/${projectId.value}/coupons`);
}
function goPointsMall() { alert('积分兑换页面开发中'); }
function goPointsBill() { alert('积分账单页面开发中'); }
function goPointsHistory() { alert('积分明细页面开发中'); }

// 积分规则
const rules = [
  { key: 'buy', icon: '🛍️', action: '消费1元', reward: '+1积分', bg: 'linear-gradient(135deg, #fff1b8, #ffd666)' },
  { key: 'review', icon: '✍️', action: '发表评价', reward: '+5积分', bg: 'linear-gradient(135deg, #d6e4ff, #adc6ff)' },
  { key: 'share', icon: '📤', action: '分享商品', reward: '+3积分', bg: 'linear-gradient(135deg, #efdbff, #d3adf7)' },
  { key: 'sign', icon: '📅', action: '每日签到', reward: '+2积分', bg: 'linear-gradient(135deg, #d9f7be, #b7eb8f)' },
];

// v3.1.33 query.tab 初始化滚动定位（默认不滚动，仅当有tab参数时才定位到对应锚点）
const initTab = computed(() => (route.query.tab as string) || '');

onMounted(() => {
  // 仅当 URL 携带 tab 参数时才滚动定位，默认进入页面显示最顶部
  if (initTab.value) {
    nextTick(() => {
      scrollTo(initTab.value);
    });
  }
});

watch(initTab, (val) => {
  if (val) scrollTo(val);
});
</script>

<style scoped>
.member-page { background: #f5f5f5; min-height: 100%; }

/* v3.1.37 BR-SHP-043 项目停用提示条 */
.project-disabled-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #fff3e0, #fff8e1);
  border-bottom: 1px solid #ffe0b2;
  font-size: 12px;
  color: #e65100;
}
.pdb-icon { font-size: 16px; }
.pdb-text { flex: 1; line-height: 1.4; }

/* ===== M0 会员资产卡 ===== */
.mp-card {
  margin: 12px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}
.mp-card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #7B8FBB 0%, #5B6E96 40%, #435477 100%);
}
.mp-card-bg::after {
  content: '';
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 120px;
  height: 120px;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}
.mp-card-inner { padding: 20px; position: relative; z-index: 1; }

.mp-header { display: flex; align-items: center; gap: 12px; }
.mp-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}
.mp-user-info { flex: 1; }
.mp-nick { font-size: 17px; font-weight: 700; color: #fff; }
.mp-level-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 2px 8px;
  background: rgba(255,255,255,0.15);
  border-radius: 6px;
  font-size: 11px;
  color: #FFD700;
}
.mp-project-name {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.12);
  padding: 2px 8px;
  border-radius: 6px;
}

.mp-stats {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 14px;
  background: rgba(255,255,255,0.12);
  border-radius: 12px;
}
.mps-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}
.mps-val { font-size: 18px; font-weight: 700; color: #fff; }
.mps-label { font-size: 11px; color: rgba(255,255,255,0.7); }
.mps-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.2); }

.mp-progress { margin-top: 14px; }
.mpp-text { font-size: 11px; color: rgba(255,255,255,0.85); margin-bottom: 6px; }
.mpp-bar {
  height: 6px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  overflow: hidden;
}
.mpp-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  border-radius: 3px;
}

/* ===== 锚点导航 ===== */
.anchor-nav {
  display: flex;
  justify-content: space-around;
  margin: 0 12px 12px;
  padding: 10px 8px;
  background: #fff;
  border-radius: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.anchor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.anchor-item.active { background: rgba(123,143,187,0.1); }
.anchor-icon { font-size: 18px; }
.anchor-label { font-size: 11px; color: #666; }
.anchor-item.active .anchor-label { color: #5B6E96; font-weight: 600; }

/* ===== 通用区块 ===== */
.section {
  margin: 12px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  scroll-margin-top: 64px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 8px;
}
.sh-title { font-size: 16px; font-weight: 700; color: #111; }
.sh-sub { font-size: 12px; color: #999; }
.sh-more { font-size: 12px; color: #5B6E96; cursor: pointer; }

/* ===== M1 签到 ===== */
.signin-week {
  display: flex;
  justify-content: space-between;
  padding: 4px 16px 8px;
}
.sw-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.swd-label { font-size: 10px; color: #999; }
.swd-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: #f5f5f5;
  color: #ccc;
}
.sw-day.signed .swd-icon { background: #52c41a; color: #fff; }
.sw-day.today .swd-icon { background: #1890ff; color: #fff; }
.swd-reward { font-size: 10px; color: #ff7a45; font-weight: 600; }
.signin-tip {
  padding: 8px 16px;
  font-size: 11px;
  color: #ff7a45;
  text-align: center;
}
.signin-btn-wrap { padding: 4px 16px 14px; }
.signin-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #7B8FBB, #5B6E96);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.signin-btn:disabled,
.signin-btn.signed {
  background: #d9d9d9;
  cursor: not-allowed;
}

/* ===== M2 会员等级卡片式 ===== */
.level-section { padding-bottom: 0; }

.level-cards-scroll {
  padding: 8px 16px 14px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.level-cards-scroll::-webkit-scrollbar { display: none; }
.level-cards {
  display: flex;
  gap: 12px;
  min-width: min-content;
}
.lvcard {
  width: 130px;
  min-width: 130px;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s;
}
.lvcard.current { transform: scale(1.05); }
.lvcard-deco {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
}
.lvcard-body {
  position: relative;
  z-index: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.lvcard-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.lvcard.current .lvcard-badge { background: rgba(255,255,255,0.35); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.lvcard-icon { font-size: 26px; }
.lvcard-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.lvcard:not(.current):not(.reached) .lvcard-name { color: #999; text-shadow: none; }
.lvcard-threshold {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
}
.lvcard:not(.current):not(.reached) .lvcard-threshold { color: #bbb; }
.lvcard-status { margin-top: 2px; }
.lvs-current, .lvs-reached, .lvs-unreached {
  font-size: 10px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
}
.lvs-current { background: rgba(255,255,255,0.3); color: #fff; }
.lvs-reached { background: rgba(255,255,255,0.2); color: rgba(255,255,255,0.9); }
.lvs-unreached { background: #e8e8e8; color: #999; }

/* 当前等级权益 */
.level-privileges { padding: 14px 16px; border-top: 1px solid #f5f5f5; }
.lp-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}
.lp-icon { font-size: 16px; }
.lp-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.lp-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f0f4ff, #e6eeff);
  border-radius: 16px;
  font-size: 12px;
  color: #5B6E96;
}
.lpt-check { color: #52c41a; font-size: 11px; font-weight: 700; }

/* ===== M3 积分板块 ===== */
.points-section { padding: 0; }

/* 积分余额展示 */
.points-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background: linear-gradient(135deg, #5B6E96 0%, #435477 100%);
  position: relative;
  overflow: hidden;
}
.points-balance::after {
  content: '';
  position: absolute;
  right: -40px;
  top: -40px;
  width: 120px;
  height: 120px;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}
.pb-left { position: relative; z-index: 1; }
.pb-label { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 6px; }
.pb-value { font-size: 32px; font-weight: 700; color: #fff; line-height: 1; }
.pb-circle { position: relative; z-index: 1; }
.pbc-inner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pbc-icon { font-size: 28px; color: #FFD700; }

/* 积分功能入口 */
.points-actions {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}
.pa-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.pa-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.pa-icon-bill { background: linear-gradient(135deg, #d6e4ff, #adc6ff); }
.pa-icon-exchange { background: linear-gradient(135deg, #fff1b8, #ffd666); }
.pa-icon-history { background: linear-gradient(135deg, #d9f7be, #b7eb8f); }
.pa-name { font-size: 12px; color: #555; font-weight: 500; }
.pa-divider { width: 1px; height: 36px; background: #eee; }

/* 积分规则 */
.points-rules { padding: 14px 16px; }
.pr-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.pr-title::before {
  content: '';
  width: 3px;
  height: 14px;
  background: #5B6E96;
  border-radius: 2px;
}
.rule-list { display: flex; flex-direction: column; gap: 8px; }
.rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fafafa;
}
.ri-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ri-icon { font-size: 18px; }
.ri-action { flex: 1; font-size: 13px; color: #333; }
.ri-reward { font-size: 13px; color: #F5222D; font-weight: 600; }

.safe-bottom { height: 60px; }
</style>
