<template>
  <!-- 金刚区（快捷入口） -->
  <div class="kingkong-grid">
    <div
      v-for="entry in entries"
      :key="entry.entry_id"
      class="kk-item"
      @click="onClick(entry)"
    >
      <div class="kk-icon" :style="{ background: entry.gradient || 'linear-gradient(135deg, #FFF5E6, #FFE5C7)' }">{{ entry.icon }}</div>
      <div class="kk-name">{{ entry.name || entry.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { KingKongEntry } from '../../../contracts';
import { useAppNavigation } from '../../../composables/useAppNavigation';

const props = defineProps<{ entries: KingKongEntry[] }>();
const router = useRouter();
// v3.1.45: 统一接入 useAppNavigation composable
const { navigateByJumpType } = useAppNavigation();

function onClick(entry: KingKongEntry) {
  const projectId = (entry as any).project_id || '';
  // v3.1.45: 统一调用 navigateByJumpType（内含 5 种类型处理 + link fallback + url 兼容）
  navigateByJumpType(
    entry.jump_type || '',
    entry.jump_id || '',
    projectId,
    entry.link
  );
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
