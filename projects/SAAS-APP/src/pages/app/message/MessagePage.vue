<template>
  <!-- 消息页（占位+消息列表） -->
  <div class="message-page">
    <div v-if="!messages.length" class="mp-placeholder">
      <span class="mp-icon">💬</span>
      <div class="mp-text">暂无消息</div>
    </div>
    <div v-else class="mp-list">
      <div
        v-for="msg in messages"
        :key="msg.message_id"
        :class="['mp-item', { unread: !msg.is_read }]"
        @click="onClick(msg)"
      >
        <span :class="['mp-type-icon', msg.type]">{{ typeIcon(msg.type) }}</span>
        <div class="mp-content">
          <div class="mp-title-row">
            <span class="mp-title">{{ msg.title }}</span>
            <span v-if="!msg.is_read" class="mp-dot"></span>
          </div>
          <div class="mp-text-body">{{ msg.content }}</div>
          <div class="mp-time">{{ formatTime(msg.created_at) }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-004', '消息页');
import { computed } from 'vue';
import { useUserStore } from '../../../stores/user-store';
import type { AppMessage } from '../../../contracts';

const userStore = useUserStore();
const messages = computed(() => userStore.messages);

function typeIcon(type: string) {
  const map: Record<string, string> = {
    order: '📦', promotion: '🎁', system: '⚙️', project: '👑', live: '📺',
  };
  return map[type] || '💬';
}

function formatTime(t: string) {
  return new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function onClick(msg: AppMessage) {
  userStore.markMessageRead(msg.message_id);
}
</script>

<style scoped>
.message-page { padding: 12px; }
.mp-placeholder {
  text-align: center;
  padding: 80px 0;
  color: #999;
}
.mp-icon { font-size: 64px; display: block; margin-bottom: 16px; }
.mp-text { font-size: 14px; }
.mp-list { display: flex; flex-direction: column; gap: 10px; }
.mp-item {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
}
.mp-item.unread { border-left: 3px solid #FF6B35; }
.mp-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #f5f5f5;
  flex-shrink: 0;
}
.mp-content { flex: 1; margin-left: 12px; min-width: 0; }
.mp-title-row { display: flex; align-items: center; justify-content: space-between; }
.mp-title { font-size: 14px; font-weight: 600; color: #333; }
.mp-dot { width: 8px; height: 8px; background: #FF4D4F; border-radius: 50%; }
.mp-text-body {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.mp-time { font-size: 11px; color: #ccc; margin-top: 6px; }
</style>
