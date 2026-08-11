<template>
  <!-- 精选内容（商城顶部切换） -->
  <div class="featured-content">
    <!-- 切换Tab -->
    <div class="fc-tabs">
      <span class="fc-tab-label">精选</span>
      <div
        v-for="(item, idx) in contents"
        :key="item.featured_id"
        :class="['fc-tab', { active: idx === activeIdx }]"
        @click="activeIdx = idx"
      >{{ item.title }}</div>
    </div>

    <!-- 内容展示 -->
    <div class="fc-body">
      <div class="fc-img-wrap" @click="onClick(activeContent)">
        <img :src="activeContent.image" :alt="activeContent.title" class="fc-img" />
        <div class="fc-overlay">
          <div class="fc-title">{{ activeContent.title }}</div>
          <div v-if="activeContent.subtitle" class="fc-subtitle">{{ activeContent.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { FeaturedContent } from '../../../contracts';

const props = defineProps<{ contents: FeaturedContent[] }>();
const router = useRouter();

const activeIdx = ref(0);
const activeContent = computed(() => props.contents[activeIdx.value] || props.contents[0]);

function onClick(content: FeaturedContent) {
  if (content.link) router.push(content.link);
}
</script>

<style scoped>
.featured-content {
  margin-bottom: 12px;
}
.fc-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.fc-tabs::-webkit-scrollbar { display: none; }
.fc-tab-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}
.fc-tab {
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.fc-tab.active {
  color: #fff;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
}
.fc-img-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}
.fc-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}
.fc-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
}
.fc-title { color: #fff; font-size: 16px; font-weight: 600; }
.fc-subtitle { color: rgba(255,255,255,0.9); font-size: 12px; margin-top: 4px; }
</style>
