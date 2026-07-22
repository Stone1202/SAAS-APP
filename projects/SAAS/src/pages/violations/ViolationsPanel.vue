<template>
  <div class="violations-panel">
    <!--
      PG-AUDIT-PC-004: 历史违规列表面板
      对应 FN-AUDIT-PC-002/003
      PRD §17 行2+行5：/tenant/live/:streamId/violations
      功能：历史违规列表 + 违规处置操作 + 擦音模式切换
    -->
    <h2>直播场次 - 历史违规列表</h2>
    <p>STUB: 右侧侧滑面板，含场次信息 + 告警统计 + 违规列表 + 处置操作（标记已处置/忽略）+ 擦音模式切换</p>
    <p>FD实现时使用 SlidePanel + ViolationList + AlertStats + DisposalBar 组件</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import { onMounted, onUnmounted } from 'vue';

const route = useRoute();
const store = useAuditStore();

const streamId = route.params.streamId as string;

onMounted(() => {
  // FD: 根据 streamId 加载历史违规数据
  store.setFieldStatus('ended');  // 回看已结束场次
});

onUnmounted(() => {
  store.reset();
});
</script>
