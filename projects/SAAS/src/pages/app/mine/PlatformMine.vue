<template>
  <!-- 个人中心（平台维度） -->
  <div class="platform-mine">
    <!-- 用户信息卡 -->
    <div class="pm-user-card">
      <img :src="user.avatar || placeholder" class="pm-avatar" />
      <div class="pm-user-info">
        <div class="pm-nickname">{{ user.nickname }}</div>
        <div class="pm-phone">{{ user.phone || '未绑定手机' }}</div>
      </div>
      <div class="pm-edit">✏️</div>
    </div>

    <!-- 资产概览 -->
    <div class="pm-assets">
      <div class="pm-asset-item">
        <div class="pm-asset-val">{{ user.platform_points }}</div>
        <div class="pm-asset-label">积分</div>
      </div>
      <div class="pm-asset-item">
        <div class="pm-asset-val">{{ user.coupon_count }}</div>
        <div class="pm-asset-label">优惠券</div>
      </div>
      <div class="pm-asset-item">
        <div class="pm-asset-val">{{ user.order_count }}</div>
        <div class="pm-asset-label">订单</div>
      </div>
    </div>

    <!-- 已加入项目 -->
    <div class="pm-section">
      <div class="pm-section-title">我的项目</div>
      <div class="pm-project-list">
        <div
          v-for="pm in memberRelations"
          :key="pm.member_id"
          class="pm-project-item"
          @click="goProject(pm.project_id)"
        >
          <div class="pm-proj-info">
            <div class="pm-proj-name">{{ projectName(pm.project_id) }}</div>
            <div class="pm-proj-level">{{ levelIcon(pm.level) }} {{ levelName(pm.level) }}</div>
          </div>
          <div class="pm-proj-points">{{ pm.points }}积分</div>
        </div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="pm-section">
      <div class="pm-menu">
        <div class="pm-menu-item" @click="goMember">
          <span class="pm-menu-icon">👑</span>
          <span>平台会员中心</span>
          <span class="pm-menu-arrow">›</span>
        </div>
        <div class="pm-menu-item">
          <span class="pm-menu-icon">📦</span>
          <span>我的订单</span>
          <span class="pm-menu-arrow">›</span>
        </div>
        <div class="pm-menu-item">
          <span class="pm-menu-icon">🎫</span>
          <span>优惠券</span>
          <span class="pm-menu-arrow">›</span>
        </div>
        <div class="pm-menu-item">
          <span class="pm-menu-icon">📍</span>
          <span>收货地址</span>
          <span class="pm-menu-arrow">›</span>
        </div>
        <div class="pm-menu-item">
          <span class="pm-menu-icon">⚙️</span>
          <span>设置</span>
          <span class="pm-menu-arrow">›</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

function projectName(projectId: string) {
  return projectStore.getProjectById(projectId)?.name || projectId;
}
function levelIcon(level: string) {
  const map: Record<string, string> = {
    bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠',
  };
  return map[level] || '';
}
function levelName(level: string) {
  const map: Record<string, string> = {
    bronze: '青铜会员', silver: '白银会员', gold: '黄金会员', platinum: '铂金会员', diamond: '钻石会员',
  };
  return map[level] || level;
}

function goProject(projectId: string) {
  router.push(`/app/project/${projectId}/member`);
}
function goMember() {
  router.push('/app/mine/member');
}
</script>

<style scoped>
.platform-mine { padding-bottom: 16px; }
.pm-user-card {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
}
.pm-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
}
.pm-user-info { flex: 1; margin-left: 12px; }
.pm-nickname { font-size: 18px; font-weight: 600; }
.pm-phone { font-size: 13px; opacity: 0.9; margin-top: 4px; }
.pm-edit { font-size: 18px; }
.pm-assets {
  display: flex;
  background: #fff;
  padding: 16px 0;
  margin: 12px;
  border-radius: 12px;
}
.pm-asset-item {
  flex: 1;
  text-align: center;
  position: relative;
}
.pm-asset-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: #eee;
}
.pm-asset-val { font-size: 20px; font-weight: 700; color: #FF6B35; }
.pm-asset-label { font-size: 12px; color: #999; margin-top: 4px; }
.pm-section { margin: 12px; }
.pm-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}
.pm-project-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}
.pm-project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}
.pm-project-item:last-child { border-bottom: none; }
.pm-proj-name { font-size: 14px; color: #333; font-weight: 500; }
.pm-proj-level { font-size: 12px; color: #999; margin-top: 4px; }
.pm-proj-points { font-size: 13px; color: #FF6B35; }
.pm-menu {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}
.pm-menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
.pm-menu-item:last-child { border-bottom: none; }
.pm-menu-icon { font-size: 18px; margin-right: 12px; }
.pm-menu-arrow { margin-left: auto; color: #ccc; font-size: 18px; }
</style>
