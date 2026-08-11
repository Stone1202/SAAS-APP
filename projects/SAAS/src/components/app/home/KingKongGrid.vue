<template>
  <!-- 金刚区（快捷入口） -->
  <div class="kingkong-grid">
    <div
      v-for="entry in entries"
      :key="entry.entry_id"
      class="kk-item"
      @click="onClick(entry)"
    >
      <div class="kk-icon">{{ entry.icon }}</div>
      <div class="kk-name">{{ entry.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { KingKongEntry } from '../../../contracts';
import { useProjectStore } from '../../../stores/project-store';

const props = defineProps<{ entries: KingKongEntry[] }>();
const router = useRouter();
const projectStore = useProjectStore();

function onClick(entry: KingKongEntry) {
  if (entry.link_type === 'project' && entry.link_value) {
    router.push(`/app/project/${entry.link_value}`);
  } else if (entry.link_type === 'page' && entry.link_value) {
    router.push(entry.link_value);
  } else if (entry.link_type === 'category' && entry.link_value === 'live') {
    // 跳转第一个有直播的项目
    const firstLive = projectStore.liveRooms[0];
    if (firstLive) router.push(`/app/project/${firstLive.project_id}/lives`);
  }
}
</script>

<style scoped>
.kingkong-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 0;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
}
.kk-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.kk-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFF5E6, #FFE5C7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.kk-name {
  margin-top: 6px;
  font-size: 12px;
  color: #333;
}
</style>
