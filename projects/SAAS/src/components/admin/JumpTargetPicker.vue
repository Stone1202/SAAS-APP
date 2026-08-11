<template>
  <!-- 跳转目标选择器 — 通用组件 -->
  <!-- 供广告位管理、搜索管理、金刚区管理等共同使用 -->
  <!-- 用法：<JumpTargetPicker v-model:jump-type="form.type" v-model:jump-id="form.jump_id" v-model:project-id="form.project_id" /> -->

  <div class="jtp-wrap">
    <el-form-item label="跳转类型">
      <el-select :model-value="jumpType" style="width:100%" @update:model-value="onTypeChange">
        <el-option label="商品" value="product" />
        <el-option label="项目主页" value="project" />
        <el-option label="直播" value="live" />
        <el-option label="URL" value="url" />
      </el-select>
    </el-form-item>

    <!-- 商品：先选项目，再选商品 -->
    <template v-if="jumpType === 'product'">
      <el-form-item label="选择项目">
        <el-select :model-value="projectId" style="width:100%" placeholder="请选择项目" filterable clearable @update:model-value="onProjectChange">
          <el-option v-for="p in projectStore.projects" :key="p.project_id" :label="`${p.project_id} | ${p.name}`" :value="p.project_id" />
        </el-select>
      </el-form-item>
      <el-form-item label="选择商品">
        <el-select :model-value="jumpId" style="width:100%" placeholder="请先选择项目" :disabled="!projectId" filterable clearable @update:model-value="emit('update:jump-id', $event)">
          <el-option v-for="p in filteredProducts" :key="p.product_id" :label="`${p.product_id} | ${p.name}`" :value="p.product_id" />
        </el-select>
      </el-form-item>
    </template>

    <!-- 项目主页：只选项目 -->
    <template v-else-if="jumpType === 'project'">
      <el-form-item label="选择项目">
        <el-select :model-value="jumpId" style="width:100%" placeholder="请选择项目" filterable clearable @update:model-value="emit('update:jump-id', $event); emit('update:project-id', $event)">
          <el-option v-for="p in projectStore.projects" :key="p.project_id" :label="`${p.project_id} | ${p.name}`" :value="p.project_id" />
        </el-select>
      </el-form-item>
    </template>

    <!-- 直播：先选项目，再选直播 -->
    <template v-else-if="jumpType === 'live'">
      <el-form-item label="选择项目">
        <el-select :model-value="projectId" style="width:100%" placeholder="请选择项目" filterable clearable @update:model-value="onLiveProjectChange">
          <el-option v-for="p in projectStore.projects" :key="p.project_id" :label="`${p.project_id} | ${p.name}`" :value="p.project_id" />
        </el-select>
      </el-form-item>
      <el-form-item label="选择直播">
        <el-select :model-value="jumpId" style="width:100%" placeholder="请先选择项目" :disabled="!projectId" filterable clearable @update:model-value="emit('update:jump-id', $event)">
          <el-option v-for="l in filteredLives" :key="l.live_id" :label="`${l.live_id} | ${l.title}`" :value="l.live_id" />
        </el-select>
      </el-form-item>
    </template>

    <!-- URL：填写路径 -->
    <template v-else-if="jumpType === 'url'">
      <el-form-item label="URL路径">
        <el-input :model-value="jumpId" placeholder="如: /app/mall" @update:model-value="emit('update:jump-id', $event)" />
      </el-form-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStore } from '../../stores/project-store';

const projectStore = useProjectStore();

const props = defineProps<{
  jumpType: string;
  jumpId: string;
  projectId: string;
}>();

const emit = defineEmits<{
  'update:jump-type': [value: string];
  'update:jump-id': [value: string];
  'update:project-id': [value: string];
}>();

// 商品：取当前选中项目下的商品
const filteredProducts = computed(() => {
  if (!props.projectId) return [];
  return projectStore.productsByProject(props.projectId);
});

// 直播：取当前选中项目下的直播
const filteredLives = computed(() => {
  if (!props.projectId) return [];
  return projectStore.livesByProject(props.projectId);
});

// 切换类型时重置所有
function onTypeChange(type: string) {
  emit('update:jump-type', type);
  emit('update:jump-id', '');
  emit('update:project-id', '');
}

// 切换项目时清空商品
function onProjectChange(projectId: string) {
  emit('update:project-id', projectId);
  emit('update:jump-id', '');
}

// 切换项目时清空直播
function onLiveProjectChange(projectId: string) {
  emit('update:project-id', projectId);
  emit('update:jump-id', '');
}
</script>

<style scoped>
.jtp-wrap {
  /* 无额外样式，使用父容器布局 */
}
</style>
