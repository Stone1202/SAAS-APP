<template>
  <!-- 项目卡片 -->
  <div class="project-card" @click="onClick">
    <div class="pjc-banner">
      <img :src="project.logo || placeholder" :alt="project.name" class="pjc-logo" />
      <div class="pjc-tag">{{ categoryText }}</div>
    </div>
    <div class="pjc-info">
      <div class="pjc-name">{{ project.name }}</div>
      <div class="pjc-desc">{{ project.description }}</div>
      <div class="pjc-stats">
        <span>🏪 {{ project.store_count }}家门店</span>
        <span>👥 {{ formatMembers(project.member_count) }}会员</span>
      </div>
    </div>
    <div class="pjc-arrow">›</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Project } from '../../../contracts';

const props = defineProps<{ project: Project }>();
const router = useRouter();
const placeholder = 'https://picsum.photos/seed/project-placeholder/100/100';

const categoryText = computed(() =>
  props.project.category === 'daily' ? '日用百货' : '健康保健'
);

function formatMembers(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toString();
}

function onClick() {
  router.push(`/app/project/${props.project.project_id}`);
}
</script>

<style scoped>
.project-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}
.pjc-banner { position: relative; flex-shrink: 0; }
.pjc-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}
.pjc-tag {
  position: absolute;
  top: -4px;
  right: -4px;
  padding: 2px 6px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 10px;
  border-radius: 8px;
}
.pjc-info { flex: 1; margin-left: 12px; min-width: 0; }
.pjc-name { font-size: 16px; font-weight: 600; color: #333; }
.pjc-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pjc-stats { display: flex; gap: 12px; margin-top: 6px; font-size: 11px; color: #888; }
.pjc-arrow { font-size: 20px; color: #ccc; margin-left: 8px; }
</style>
