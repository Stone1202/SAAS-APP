<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="sidebar">
      <div class="logo"><h3>SAAS运营后台</h3><p class="sub">平台级管控</p></div>
      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/admin/tenants"><el-icon><Setting /></el-icon><span>租户审查开关</span></el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content"><router-view /></el-main>
    <HelpButton />
  </el-container>
</template>
<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import HelpButton from '@/components/audit/HelpButton.vue'
import { useAuditStore } from '@/stores/audit'
import { onMounted } from 'vue'
const auditStore = useAuditStore()
onMounted(() => { auditStore.init() })
</script>
<style scoped>
.admin-layout { height: 100vh; }
.sidebar { background: #001529; }
.logo { padding: 20px; text-align: center; }
.logo h3 { color: #fff; margin: 0; font-size: 16px; }
.logo .sub { color: #8c8c8c; font-size: 12px; margin: 4px 0 0; }
.main-content { background: #f0f2f5; padding: 0; }
:deep(.el-menu) { background: #001529; border-right: none; }
:deep(.el-menu-item) { color: #b3c0d1; }
:deep(.el-menu-item.is-active) { background: #1890ff; color: #fff; }
</style>
