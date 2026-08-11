<template>
  <!-- 会员等级卡 -->
  <div :class="['member-level-card', member.level]">
    <div class="mlc-header">
      <span class="mlc-icon">{{ levelConfig?.icon || '🥉' }}</span>
      <div class="mlc-level-info">
        <div class="mlc-level-name">{{ levelConfig?.name || member.level }}</div>
        <div class="mlc-project">{{ projectName }}</div>
      </div>
    </div>
    <div class="mlc-points">
      <div class="mlc-points-val">{{ member.points }}</div>
      <div class="mlc-points-label">累计积分</div>
    </div>
    <slot name="progress" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectMember, MemberLevelConfig } from '../../../contracts';

const props = defineProps<{
  member: ProjectMember;
  levelConfig?: MemberLevelConfig;
  projectName?: string;
}>();
</script>

<style scoped>
.member-level-card {
  margin: 12px;
  padding: 20px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
  color: #fff;
  position: relative;
  overflow: hidden;
}
.member-level-card.bronze { background: linear-gradient(135deg, #CD7F32, #B87333); }
.member-level-card.silver { background: linear-gradient(135deg, #C0C0C0, #A8A8A8); }
.member-level-card.gold { background: linear-gradient(135deg, #FFD700, #FFA500); }
.member-level-card.platinum { background: linear-gradient(135deg, #E5E4E2, #B5B5B5); }
.member-level-card.diamond { background: linear-gradient(135deg, #B9F2FF, #66D9EF); }
.mlc-header { display: flex; align-items: center; }
.mlc-icon { font-size: 36px; }
.mlc-level-info { margin-left: 12px; }
.mlc-level-name { font-size: 18px; font-weight: 600; }
.mlc-project { font-size: 12px; opacity: 0.9; margin-top: 2px; }
.mlc-points { margin-top: 16px; }
.mlc-points-val { font-size: 28px; font-weight: 700; }
.mlc-points-label { font-size: 12px; opacity: 0.8; }
</style>
