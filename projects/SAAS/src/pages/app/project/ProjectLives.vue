<template>
  <!-- 直播Tab — 真机风格 -->
  <div class="lives-page">
    <!-- 筛选 -->
    <div class="lp-filter">
      <span
        v-for="f in filters"
        :key="f.key"
        :class="['lp-btn', { active: activeFilter === f.key }]"
        @click="activeFilter = f.key"
      >{{ f.label }}</span>
    </div>

    <!-- 直播网格 -->
    <div class="lp-grid" v-if="lives.length">
      <LiveCard
        v-for="l in filteredLives"
        :key="l.live_id"
        :live="l"
        :project-id="projectId"
      />
    </div>

    <div class="lp-empty" v-else>
      <span class="lpe-emoji">📺</span>
      <span class="lpe-text">暂无直播</span>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import LiveCard from '../../../components/app/live/LiveCard.vue';

const route = useRoute();
const store = useProjectStore();
const projectId = computed(() => route.params.projectId as string);
const lives = computed(() => store.livesByProject(projectId.value));

const activeFilter = ref('all');
const filters = [
  { key: 'all', label: '全部' },
  { key: 'live', label: '直播中' },
  { key: 'end', label: '已结束' },
];

const filteredLives = computed(() => {
  if (activeFilter.value === 'all') return lives.value;
  return lives.value.filter(l => l.status === activeFilter.value);
});
</script>

<style scoped>
.lives-page { padding: 12px; background: #f5f5f5; min-height: 100%; }

.lp-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.lp-btn {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.lp-btn.active {
  color: #FF6B35;
  background: rgba(255,107,53,0.08);
  border-color: #FF6B35;
  font-weight: 600;
}

.lp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.lp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 10px;
}
.lpe-emoji { font-size: 48px; }
.lpe-text { font-size: 14px; color: #bbb; }

.safe-bottom { height: 24px; }
</style>
