<template>
  <transition name="drawer-slide">
    <div v-if="visible" class="uc-drawer">
      <div class="uc-header">
        <span class="uc-title">{{ card?.title }}</span>
        <el-tag size="small" type="info">{{ card?.fn }}</el-tag>
        <el-tag size="small" type="success">{{ card?.uc }}</el-tag>
        <button class="uc-close" @click="$emit('close')">×</button>
      </div>
      <div class="uc-body">
        <div class="uc-section"><div class="uc-label">📝 描述</div><div class="uc-text">{{ card?.description }}</div></div>
        <div class="uc-section"><div class="uc-label">✅ 前置条件</div><div class="uc-text">{{ card?.precondition }}</div></div>
        <div class="uc-section"><div class="uc-label">📋 基本流程</div><ol class="uc-flow">
          <li v-for="(step, i) in card?.flow" :key="i">
            <el-tag size="small" :type="step.includes('[手动]')?'warning':step.includes('[事件]')?'danger':'success'">{{ step.includes('[手动]')?'手动':step.includes('[事件]')?'事件':'系统' }}</el-tag>
            <span class="step-text">{{ step.replace(/^\[手动\]|\[系统自动\]|\[事件驱动\]/,'') }}</span>
          </li>
        </ol></div>
        <div class="uc-section" v-if="card?.altFlow.length"><div class="uc-label">🔀 备选流程</div><ul class="uc-alt"><li v-for="(alt,i) in card?.altFlow" :key="i">{{ alt }}</li></ul></div>
        <div class="uc-section"><div class="uc-label">💾 数据范围</div><div class="uc-text">{{ card?.dataRange }}</div></div>
        <div class="uc-section"><div class="uc-label">🏁 后置条件</div><div class="uc-text">{{ card?.postcondition }}</div></div>
        <div class="uc-section" v-if="card?.buttons.length"><div class="uc-label">🔘 按钮标注</div>
          <div class="uc-buttons"><div v-for="btn in card?.buttons" :key="btn.id" class="uc-btn-item">
            <el-tag size="small">{{ btn.id }}</el-tag><span class="btn-name">{{ btn.name }}</span><span class="btn-action">{{ btn.action }}</span>
          </div></div>
        </div>
        <div class="uc-section"><div class="uc-label">🔗 关联UC</div><div class="uc-text">{{ card?.relatedUc }}</div></div>
      </div>
    </div>
  </transition>
</template>
<script setup lang="ts">
import type { UseCaseCard } from '@/data/use-case-cards'
defineProps<{ visible: boolean; card: UseCaseCard | null }>()
defineEmits<{ close: [] }>()
</script>
<style scoped>
.uc-drawer{position:fixed;top:0;right:0;width:440px;height:100vh;background:#fff;box-shadow:-4px 0 16px rgba(0,0,0,.12);z-index:9999;display:flex;flex-direction:column;overflow:hidden}
.uc-header{display:flex;align-items:center;gap:8px;padding:16px 20px;background:#001529;color:#fff;flex-shrink:0}
.uc-title{font-size:15px;font-weight:600;flex:1}
.uc-close{background:none;border:none;color:#fff;font-size:24px;cursor:pointer;line-height:1;padding:0 4px}
.uc-body{flex:1;overflow-y:auto;padding:16px 20px}
.uc-section{margin-bottom:20px}
.uc-label{font-size:13px;font-weight:600;color:#1890ff;margin-bottom:8px}
.uc-text{font-size:13px;color:#303133;line-height:1.6}
.uc-flow{margin:0;padding-left:0;list-style:none}
.uc-flow li{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:13px}
.step-text{flex:1;line-height:1.5;color:#303133}
.uc-alt{margin:0;padding-left:16px;font-size:13px;color:#606266;line-height:1.6}
.uc-alt li{margin-bottom:4px}
.uc-buttons{display:flex;flex-direction:column;gap:8px}
.uc-btn-item{display:flex;align-items:center;gap:8px;font-size:13px}
.btn-name{font-weight:600;color:#303133}
.btn-action{color:#8c8c8c}
.drawer-slide-enter-active,.drawer-slide-leave-active{transition:transform .3s}
.drawer-slide-enter-from,.drawer-slide-leave-to{transform:translateX(100%)}
</style>
