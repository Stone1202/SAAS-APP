<template>
  <!-- 金刚区（快捷入口） -->
  <div class="kingkong-grid">
    <div
      v-for="entry in entries"
      :key="entry.entry_id"
      class="kk-item"
      @click="onClick(entry)"
    >
      <div class="kk-icon">
        <img v-if="isImageUrl(entry.icon)" :src="entry.icon" class="kk-icon-img" />
        <span v-else>{{ entry.icon }}</span>
      </div>
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

// v3.1.47 调整4: 判断icon是否为图片URL（http/data:开头），用于区分图片和emoji
function isImageUrl(icon: string): boolean {
  if (!icon) return false;
  return icon.startsWith('http') || icon.startsWith('data:') || icon.startsWith('/');
}

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
/* v3.1.47 调整4: 去掉渐变背景，改为白色背景 */
.kk-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  overflow: hidden;
}
.kk-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}
.kk-name {
  margin-top: 6px;
  font-size: 12px;
  color: #333;
}
</style>
