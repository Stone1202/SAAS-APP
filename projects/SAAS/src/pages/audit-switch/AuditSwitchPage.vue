<template>
  <div class="audit-switch-page">
    <!--
      PG-AUDIT-PC-001: 租户管理列表 — 内容审查开关
      对应 FN-AUDIT-PC-001
      复用已有租户管理页面，操作列新增「内容审查开关」链接
    -->
    <h2>租户管理 - 内容审查开关</h2>
    <p>STUB: 运营后台租户列表页，操作列包含「内容审查开关」链接</p>
    <p>FD实现时嵌入 AuditSwitchDialog 弹窗组件</p>
  </div>
</template>

<script setup lang="ts">
// FD: 从已渲染的租户管理页面中提取租户列表
// 点击「内容审查开关」→弹出 AuditSwitchDialog
</script>
