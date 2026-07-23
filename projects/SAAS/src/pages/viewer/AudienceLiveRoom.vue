<template>
  <!-- PG-AUDIT-APP-001：观众端直播间 /h5/live/:roomId -->
  <div class="audience-live-room">
    <!-- 顶部连接状态 -->
    <CallbackLostBanner :visible="!callbackReceived" />

    <!-- 视频区域 -->
    <div class="video-area">
      <div class="video-placeholder">
        <span class="video-icon">📺</span>
        <span class="video-text">视频画面区域</span>
      </div>

      <!-- 主播信息栏 -->
      <div class="anchor-bar">
        <div class="anchor-avatar">{{ anchorInfo.name?.charAt(0) || '主' }}</div>
        <div class="anchor-detail">
          <span class="anchor-name">{{ anchorInfo.name || '主播昵称' }}</span>
          <span class="viewer-count">{{ viewerCount.toLocaleString() }} 人观看</span>
        </div>
      </div>

      <!-- 擦音/静音效果覆盖层 -->
      <MuteEffectOverlay :effect="currentEffect" />

      <!-- 断流覆盖层 -->
      <StreamEndedOverlay :visible="streamEnded" />
    </div>

    <!-- 底部信息提示 -->
    <div class="bottom-info">
      <span class="room-id">房间号：{{ roomId }}</span>
      <span v-if="currentEffect" :class="['effect-badge', currentEffect]">
        {{ currentEffect === 'silent' ? '🔇 静音中' : '🔔 擦音中' }}
      </span>
    </div>

    <!-- 调试面板（仿真用） -->
    <div class="debug-panel">
      <div class="debug-title">仿真调试面板</div>
      <div class="debug-controls">
        <button @click="triggerEffect('silent')">触发静音</button>
        <button @click="triggerEffect('beep')">触发擦音</button>
        <button @click="clearEffect">清除效果</button>
        <button @click="triggerEnd">模拟断流</button>
        <button @click="triggerTimeout">模拟回调超时</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import MuteEffectOverlay from '../../components/audit/viewer/MuteEffectOverlay.vue';
import StreamEndedOverlay from '../../components/audit/viewer/StreamEndedOverlay.vue';
import CallbackLostBanner from '../../components/audit/viewer/CallbackLostBanner.vue';
import type { MuteMode } from '../../contracts';

const route = useRoute();
const store = useAuditStore();

const roomId = computed(() => (route.params.roomId as string) || 'ROOM-001');

// 主播信息
const anchorInfo = ref({ name: '主播小A' });
const viewerCount = ref(25600);

// 审查效果状态
const currentEffect = ref<'silent' | 'beep' | null>(null);
const streamEnded = ref(false);
const callbackReceived = ref(false);

// 仿真函数
function triggerEffect(mode: 'silent' | 'beep') {
  currentEffect.value = mode;
  callbackReceived.value = true;
  setTimeout(() => { callbackReceived.value = false; }, 500);
}

function clearEffect() {
  currentEffect.value = null;
  callbackReceived.value = false;
}

function triggerEnd() {
  streamEnded.value = true;
  currentEffect.value = null;
}

function triggerTimeout() {
  streamEnded.value = false;
  currentEffect.value = null;
  callbackReceived.value = false;
}

onMounted(() => {
  store.setFieldStatus('live');
});
</script>

<style scoped>
.audience-live-room {
  position: relative;
  width: 100%;
  max-width: 414px;
  height: 100vh;
  max-height: 896px;
  margin: 0 auto;
  background: #000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
/* 视频区域 */
.video-area {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
}
.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.video-icon { font-size: 48px; opacity: 0.5; }
.video-text { color: rgba(255,255,255,0.3); font-size: 14px; }
/* 主播信息栏 */
.anchor-bar {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  padding: 10px 14px;
  border-radius: 24px;
}
.anchor-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B, #FFD93D);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}
.anchor-detail { display: flex; flex-direction: column; gap: 2px; }
.anchor-name { color: #fff; font-size: 15px; font-weight: 500; }
.viewer-count { color: rgba(255,255,255,0.7); font-size: 12px; }
/* 底部信息 */
.bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #0D0D0D;
}
.room-id { color: rgba(255,255,255,0.4); font-size: 12px; }
.effect-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
}
.effect-badge.silent { background: var(--color-danger, #F5222D); color: #fff; }
.effect-badge.beep { background: var(--color-warning, #FA8C16); color: #fff; }
/* 调试面板 */
.debug-panel {
  position: absolute;
  bottom: 60px;
  left: 16px;
  right: 16px;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(255,255,255,0.1);
  z-index: 200;
}
.debug-title {
  color: rgba(255,255,255,0.6);
  font-size: 11px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.debug-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.debug-controls button {
  padding: 5px 12px;
  font-size: 12px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.debug-controls button:hover {
  background: rgba(255,255,255,0.2);
}
.debug-controls button:active {
  background: rgba(255,255,255,0.3);
}
</style>
