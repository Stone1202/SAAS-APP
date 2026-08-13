<template>
  <!-- 积分进度条 -->
  <div class="points-bar">
    <div class="pb-label-row">
      <span class="pb-label">{{ currentLabel }}</span>
      <span class="pb-next">{{ nextLabel }}</span>
    </div>
    <div class="pb-track">
      <div class="pb-fill" :style="{ width: percentage + '%' }">
        <span class="pb-fill-text">{{ member.current_level_points }}</span>
      </div>
    </div>
    <div class="pb-bottom">
      <span>距{{ nextLevelName }}还差{{ (member.next_level_points || 0) - member.current_level_points }}积分</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectMember, MemberLevelConfig } from '../../../contracts';

const props = defineProps<{
  member: ProjectMember;
  currentLevel?: MemberLevelConfig;
  nextLevel?: MemberLevelConfig;
}>();

const percentage = computed(() => {
  if (!props.member.next_level_points) return 100;
  return Math.min(100, Math.round((props.member.current_level_points / props.member.next_level_points) * 100));
});

const currentLabel = computed(() => props.currentLevel?.name || props.member.level);
const nextLevelName = computed(() => props.nextLevel?.name || '下一级');
const nextLabel = computed(() => `${nextLevelName.value}(${props.member.next_level_points || 0}积分)`);
</script>

<style scoped>
.points-bar {
  margin: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}
.pb-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.pb-label { font-size: 14px; color: #333; font-weight: 600; }
.pb-next { font-size: 12px; color: #999; }
.pb-track {
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}
.pb-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35, #FF8F35);
  border-radius: 10px;
  transition: width 0.3s;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  min-width: 28px;
}
.pb-fill-text { color: #fff; font-size: 11px; font-weight: 600; }
.pb-bottom {
  margin-top: 8px;
  font-size: 12px;
  color: #888;
  text-align: center;
}
</style>
