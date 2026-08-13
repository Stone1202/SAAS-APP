<template>
  <!-- 直播卡片 — 真机风格 -->
  <div class="live-card" @click="$emit('click')">
    <div class="lc-cover" :class="`lc-cover--${statusClass}`">
      <span class="lc-emoji">{{ emoji }}</span>
      <div class="lc-live-badge" :class="`lc-badge--${live.status}`">
        <span class="lc-badge-dot" v-if="live.status === 'live'"></span>
        <span class="lc-badge-text">{{ statusText }}</span>
      </div>
      <div class="lc-viewers">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        {{ viewerText }}
      </div>
    </div>
    <div class="lc-info">
      <div class="lc-title">{{ live.title }}</div>
      <div class="lc-anchor">
        <span class="lc-anchor-avatar">{{ live.anchor_name?.charAt(0) || '主' }}</span>
        <span class="lc-anchor-name">{{ live.anchor_name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LiveRoom } from '../../../contracts';

const props = defineProps<{
  live: LiveRoom;
  projectId?: string;
}>();

defineEmits<{
  click: [];
}>();

// emoji
const emoji = computed(() => {
  const t = props.live.title;
  if (!t) return '📺';
  if (t.includes('清洁') || t.includes('收纳')) return '🧹';
  if (t.includes('美食') || t.includes('厨房')) return '🍳';
  if (t.includes('健身') || t.includes('运动')) return '💪';
  if (t.includes('数码') || t.includes('新品')) return '🎮';
  if (t.includes('日用')) return '🏠';
  return '📺';
});

// 状态
const statusClass = computed(() => props.live.status === 'live' ? 'live' : 'off');
const statusText = computed(() => {
  const map: Record<string, string> = { live: '直播中', upcoming: '预告', replay: '回放', ended: '已结束' };
  return map[props.live.status] || '直播中';
});

// 人数
const viewerText = computed(() => {
  const v = props.live.viewer_count || 0;
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return String(v);
});
</script>

<style scoped>
.live-card {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
  background: #fff;
}
.live-card:active { transform: scale(0.97); }

/* 封面 */
.lc-cover {
  width: 100%;
  aspect-ratio: 16 / 11;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.lc-cover--live {
  background: linear-gradient(135deg, #FF6B35 0%, #FF4D4F 50%, #FF8F35 100%);
}
.lc-cover--off {
  background: linear-gradient(135deg, #8e9eab, #eef2f3);
}
.lc-emoji { font-size: 40px; }

/* 直播状态标签 — 同步直播真实状态（live/upcoming/replay/ended） */
.lc-live-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  backdrop-filter: blur(4px);
  border-radius: 10px;
}
.lc-badge--live { background: rgba(245,34,45,0.85); }
.lc-badge--upcoming { background: rgba(250,140,22,0.85); }
.lc-badge--replay { background: rgba(0,0,0,0.55); }
.lc-badge--ended { background: rgba(0,0,0,0.45); }
.lc-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.lc-badge-text {
  font-size: 10px;
  font-weight: 600;
  color: #fff;
}

/* 观众数 */
.lc-viewers {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
}

/* 信息 */
.lc-info { padding: 8px 10px; }
.lc-title {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lc-anchor {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}
.lc-anchor-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lc-anchor-name {
  font-size: 11px;
  color: #999;
}
</style>
