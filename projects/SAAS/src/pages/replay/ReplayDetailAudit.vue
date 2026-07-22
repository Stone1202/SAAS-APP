<template>
  <div class="replay-detail-audit">
    <!--
      PG-AUDIT-PC-003: 回放详情 — 擦音效果
      对应 FN-AUDIT-PC-004
    -->
    <h2>回放详情 - 内容审查</h2>
    <p>STUB: 回放播放器 + 擦音进度条 + 擦音前后对比面板</p>
    <p>FD实现时使用 ReplayMutePanel 组件</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const liveId = route.params.liveId as string;

// FD: 根据 liveId 加载回放文件和擦音任务状态
// 使用 useReplayService().startReplayMute(liveId)
</script>
