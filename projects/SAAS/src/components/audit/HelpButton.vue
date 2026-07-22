<template>
  <button class="help-btn" @click="drawerVisible = true" title="查看交互用例卡">
    <span class="help-icon">？</span>
    <span class="help-label">用例卡</span>
  </button>
  <UseCaseDrawer :visible="drawerVisible" :card="card" @close="drawerVisible = false" />
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import UseCaseDrawer from './UseCaseDrawer.vue'
import { useCaseCards } from '@/data/use-case-cards'
const route = useRoute()
const drawerVisible = ref(false)
const card = computed(() => useCaseCards[route.path] || null)
</script>
<style scoped>
.help-btn{position:fixed;top:16px;right:16px;z-index:9998;display:flex;align-items:center;gap:6px;padding:8px 16px;background:#1890ff;color:#fff;border:none;border-radius:20px;cursor:pointer;font-size:13px;font-weight:500;box-shadow:0 2px 8px rgba(24,144,255,.4);transition:all .2s}
.help-btn:hover{background:#40a9ff;box-shadow:0 4px 12px rgba(24,144,255,.5);transform:translateY(-1px)}
.help-icon{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700}
.help-label{white-space:nowrap}
</style>
