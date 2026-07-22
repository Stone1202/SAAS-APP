<template>
  <div class="audience-live-room">
    <!--
      PG-AUDIT-APP-001: 观众端H5直播间（375px）
      对应 FN-AUDIT-APP-001
      布局：顶部主播信息栏 + 中间视频画面区 + 右侧互动浮标 + 左下弹幕区 + 底部操作栏
      审查效果层叠加在视频画面区中央（z-index: 15）
    -->
    <h2>观众端直播间</h2>
    <p>STUB: H5 375px 移动端直播间，含擦音/静音效果叠加层</p>
    <p>FD实现时使用 AudienceMuteOverlay 覆盖层组件</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import { onMounted, watch } from 'vue';

const route = useRoute();
const store = useAuditStore();
const liveId = route.params.liveId as string;

onMounted(() => {
  // FD: 观众进入直播间，订阅Store变化
  // 收到违规事件 → 渲染擦音/静音效果
  // 收到断流事件 → 显示"直播已结束"覆盖层
});

// FD: 监听 callbackLost → 显示"⚠直播中控尚未收到此违规回调"
watch(() => store.callbackLost, (lost) => {
  if (lost) {
    // 显示橙色警告浮层，3秒后自动消失
  }
});
</script>
