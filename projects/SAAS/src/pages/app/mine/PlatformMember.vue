<template>
  <!-- 平台会员中心 -->
  <div class="platform-member">
    <div class="pmh-back" @click="goBack">‹ 返回</div>
    <div class="pmh-header">
      <img :src="user.avatar || placeholder" class="pmh-avatar" />
      <div class="pmh-name">{{ user.nickname }}</div>
      <div class="pmh-points">平台积分 {{ user.platform_points }}</div>
    </div>

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
.pmh-points { font-size: 13px; opacity: 0.9; margin-top: 4px; }
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
