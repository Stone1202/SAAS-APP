<template>
  <!-- PG-AUDIT-APP-001：观众端直播间 /h5/live/:roomId -->
  <div class="audience-live-room" @click="ensureAudioContext">
    <!-- 顶部连接状态：仅在中控显式标记回调丢失时显示 -->
    <CallbackLostBanner :visible="store.callbackLost" />

    <!-- 直播已结束覆盖层：通过 BroadcastChannel 接收中控断流事件 -->
    <StreamEndedOverlay :visible="isStreamEnded" />

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

      <!-- 擦音/静音效果覆盖层（由中控擦音模式驱动） -->
      <MuteEffectOverlay :effect="store.liveEffect" />
    </div>

    <!-- 底部信息提示 -->
    <div class="bottom-info">
      <span class="room-id">房间号：{{ roomId }}</span>
      <span v-if="store.liveEffect" :class="['effect-badge', store.liveEffect]">
        {{ store.liveEffect === 'silent' ? '🔇 静音中' : '🔔 擦音中' }}
      </span>
    </div>

    <!-- 音频提示：首次点击画面以启用声音 -->
    <div v-if="audioHintVisible" class="audio-hint" @click.stop="ensureAudioContext">
      点击画面以启用声音效果
    </div>

    <!-- 用例交互卡 -->
    <HelpButton @open="showDrawer = true" />
    <UseCaseDrawer
      :visible="showDrawer"
      title="用例卡 — 观众端直播间"
      :cards="audienceLiveRoomCards as any"
      @close="showDrawer = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import HelpButton from '../../components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '../../components/use-case-card/UseCaseDrawer.vue';
import { audienceLiveRoomCards } from './useCaseCardData';
import MuteEffectOverlay from '../../components/audit/viewer/MuteEffectOverlay.vue';
import CallbackLostBanner from '../../components/audit/viewer/CallbackLostBanner.vue';
import StreamEndedOverlay from '../../components/audit/viewer/StreamEndedOverlay.vue';

const route = useRoute();
const store = useAuditStore();

const roomId = computed(() => (route.params.roomId as string) || 'ROOM-001');

// 主播信息
const anchorInfo = ref({ name: '主播小A' });
const viewerCount = ref(25600);
const showDrawer = ref(false);

// V3.0修复：通过 BroadcastChannel 监听中控断流，H5感知直播已结束
const isStreamEnded = computed(() => store.fieldStatus === 'ended');

// Web Audio API：擦音模式持续播放提示音
let audioCtx: AudioContext | null = null;
let beepOsc: OscillatorNode | null = null;
let beepGain: GainNode | null = null;
const audioHintVisible = ref(true);

function ensureAudioContext() {
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) {
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      audioHintVisible.value = false;
    });
  } else {
    audioHintVisible.value = false;
  }
  return audioCtx;
}

function startBeepLoop() {
  stopBeepLoop();
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1000, ctx.currentTime);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  beepOsc = osc;
  beepGain = gain;
}

function stopBeepLoop() {
  if (beepOsc) {
    try { beepOsc.stop(); } catch {}
    beepOsc.disconnect();
    beepOsc = null;
  }
  if (beepGain) {
    beepGain.disconnect();
    beepGain = null;
  }
}

// 监听中控下发的直播效果：静音=停止声音，擦音=播放提示音
watch(() => store.liveEffect, (effect) => {
  if (effect === 'beep') {
    startBeepLoop();
  } else {
    stopBeepLoop();
  }
}, { immediate: true });

// V3.0修复：直播结束（断流）时停止音频
watch(() => store.fieldStatus, (status) => {
  if (status === 'ended') {
    stopBeepLoop();
  }
});

onMounted(() => {
  store.setFieldStatus('live');
});

onUnmounted(() => {
  stopBeepLoop();
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close().catch(() => {});
  }
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
/* 音频启用提示 */
.audio-hint {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 8px 16px;
  background: rgba(0,0,0,0.7);
  color: rgba(255,255,255,0.9);
  font-size: 12px;
  border-radius: 16px;
  pointer-events: auto;
}
</style>
