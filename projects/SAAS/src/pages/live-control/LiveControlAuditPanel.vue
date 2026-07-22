<template>
  <div class="live-control-audit-panel">
    <!--
      PG-AUDIT-PC-002: 直播中控内容审查Tab + 侧滑面板
      对应 FN-AUDIT-PC-002/003
      复用已有直播中控台三栏布局，右侧新增「内容审查」Tab
    -->
    <h2>直播中控 - 内容审查</h2>
    <p>STUB: 右侧 400px 侧滑面板，含场次信息+告警统计+违规列表+处置操作</p>
    <p>FD实现时使用 SlidePanel + ViolationList + AlertStats + DisposalBar 组件</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import { mockViolationGenerator } from '../../adapters/sim/data-adapter';
import { onMounted, onUnmounted } from 'vue';

const route = useRoute();
const store = useAuditStore();
const streamId = (route.query.streamId as string) || 'LIVE-001';

onMounted(() => {
  // FD: 页面加载时启动模拟数据生成器
  store.setFieldStatus('live');
  store.setTenantConfig({
    tenant_id: 'T-001',
    tenant_name: 'XX科技',
    audit_enabled: true,
  });
  mockViolationGenerator.start();
});

onUnmounted(() => {
  // FD: 页面卸载时停止模拟数据生成器
  mockViolationGenerator.stop();
  store.reset();
});
</script>
