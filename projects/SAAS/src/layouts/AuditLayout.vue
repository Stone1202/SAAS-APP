<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h3>SAAS内容审查</h3>
      </div>
      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/audit/review-center">
          <el-icon><Monitor /></el-icon>
          <span>中控室审查</span>
        </el-menu-item>
        <el-menu-item index="/audit/keywords">
          <el-icon><Key /></el-icon>
          <span>敏感词库</span>
        </el-menu-item>
        <el-menu-item index="/audit/violations">
          <el-icon><Warning /></el-icon>
          <span>违规记录</span>
        </el-menu-item>
        <el-menu-item index="/audit/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计看板</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
      <router-view />
    </el-main>
    <HelpButton />
  </el-container>
</template>

<script setup lang="ts">
import { Monitor, Key, Warning, DataAnalysis } from '@element-plus/icons-vue'
import HelpButton from '@/components/audit/HelpButton.vue'
import { useAuditStore } from '@/stores/audit'
import { onMounted } from 'vue'

const auditStore = useAuditStore()

onMounted(() => {
  auditStore.init()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.sidebar {
  background: #001529;
  color: #fff;
}
.logo {
  padding: 20px;
  text-align: center;
}
.logo h3 {
  color: #fff;
  margin: 0;
  font-size: 16px;
}
.main-content {
  background: #f0f2f5;
  padding: 0;
}
:deep(.el-menu) {
  background: #001529;
  border-right: none;
}
:deep(.el-menu-item) {
  color: #b3c0d1;
}
:deep(.el-menu-item.is-active) {
  background: #1890ff;
  color: #fff;
}
</style>
