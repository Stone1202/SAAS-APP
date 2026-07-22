<template>
  <el-container class="tenant-layout">
    <el-aside width="220px" class="sidebar">
      <div class="logo"><h3>租户后台</h3><p class="sub">直播运营管控</p></div>
      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/tenant/control-room"><el-icon><Monitor /></el-icon><span>直播中控室</span></el-menu-item>
        <el-menu-item index="/audit/violations"><el-icon><Warning /></el-icon><span>违规记录</span></el-menu-item>
        <el-menu-item index="/audit/keywords"><el-icon><Key /></el-icon><span>敏感词库</span></el-menu-item>
        <el-menu-item index="/audit/statistics"><el-icon><DataAnalysis /></el-icon><span>统计看板</span></el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content"><router-view /></el-main>
    <HelpButton />
  </el-container>
</template>
<script setup lang="ts">
import { Monitor, Warning, Key, DataAnalysis } from '@element-plus/icons-vue'
import HelpButton from '@/components/audit/HelpButton.vue'
import { useAuditStore } from '@/stores/audit'
import { onMounted } from 'vue'
const auditStore = useAuditStore()
onMounted(() => { auditStore.init() })
</script>
<style scoped>
.tenant-layout { height: 100vh; }
.sidebar { background: #002140; }
.logo { padding: 20px; text-align: center; }
.logo h3 { color: #fff; margin: 0; font-size: 16px; }
.logo .sub { color: #8c8c8c; font-size: 12px; margin: 4px 0 0; }
.main-content { background: #f0f2f5; padding: 0; }
:deep(.el-menu) { background: #002140; border-right: none; }
:deep(.el-menu-item) { color: #b3c0d1; }
:deep(.el-menu-item.is-active) { background: #1890ff; color: #fff; }
</style>
