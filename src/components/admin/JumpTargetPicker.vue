<!--
  JumpTargetPicker — 跳转目标选择器（v3.1.44 重构）
  
  变更：移除 "url" 跳转类型（自由输入URL），新增 "function_page" 跳转类型（从注册表选择）
  
  跳转类型（4种）：
    - product:       选择商品 → 运营后台需先选项目→再选商品；租户后台仅当前项目商品
    - project:       选择项目 → 仅运营后台可用（租户后台隐藏）
    - live:          选择直播 → 运营后台需先选项目→再选直播；租户后台仅当前项目直播
    - function_page: 选择功能页面 → 从注册表下拉选择（替代原 url 自由输入）
  
  功能页面选择流程：
    1. 运营人员选择"功能页面"跳转类型
    2. 从分类下拉筛选：全部(默认) / 内置系统页面 / 业务功能页面 / 活动页面
    3. 从注册表下拉选择具体功能页面（仅 active 状态）
    4. 若选中页面路由含 :projectId 占位符：
       - 租户后台（lockProjectId 已设置）→ 自动填充项目ID
       - 运营后台 → 显示项目选择器让运营人员选择项目
    5. 若路由不含 :projectId → 直接保存
  
  Props:
    - jumpType:  当前跳转类型
    - jumpId:    当前跳转目标ID
    - projectId: 当前关联项目ID（仅 function_page 类型且路由含 :projectId 时使用）
    - lockProjectId:  锁定项目ID（租户后台模式，自动填充）
    - hideProjectJump: 是否隐藏"项目主页"跳转类型（租户后台模式，默认false）
  
  安全边界：
    - 不再支持跳转到外部链接（禁止 url 类型）
    - 不再支持运营人员手动输入路由路径（仅能从注册表选择）
    - 旧 jump_type=url 数据将在编辑时自动切换为 function_page
-->
<template>
  <div class="jump-target-picker">
    <el-form-item label="跳转类型">
      <el-select
        :model-value="jumpType"
        @update:model-value="onJumpTypeChange"
        placeholder="请选择跳转类型"
      >
        <el-option label="商品" value="product" />
        <el-option label="项目主页" value="project" v-if="!hideProjectJump" />
        <el-option label="直播" value="live" />
        <!-- v3.1.44: url 类型替换为 function_page -->
        <el-option label="功能页面" value="function_page" />
      </el-select>
    </el-form-item>

    <!-- 商品选择 -->
    <template v-if="jumpType === 'product'">
      <template v-if="!lockProjectId">
        <el-form-item label="所属项目">
          <el-select
            :model-value="currentProjectId"
            @update:model-value="onProjectChange"
            placeholder="请先选择项目"
            filterable
          >
            <el-option
              v-for="p in allProjects"
              :key="p.project_id"
              :label="p.name"
              :value="p.project_id"
            />
          </el-select>
        </el-form-item>
      </template>
      <el-form-item :label="jumpId ? '已选商品' : '选择商品'">
        <el-select
          v-if="currentProjectId || lockProjectId"
          :model-value="jumpId"
          @update:model-value="(v: string) => emit('update:jumpId', v)"
          placeholder="请选择商品"
          filterable
        >
          <el-option
            v-for="p in projectProducts"
            :key="p.product_id"
            :label="`${p.name} (¥${p.price})`"
            :value="p.product_id"
          />
        </el-select>
        <span v-else class="picker-hint">请先选择项目</span>
      </el-form-item>
    </template>

    <!-- 项目主页选择 -->
    <template v-else-if="jumpType === 'project'">
      <el-form-item label="选择项目">
        <el-select
          :model-value="jumpId"
          @update:model-value="(v: string) => emit('update:jumpId', v)"
          placeholder="请选择项目"
          filterable
        >
          <el-option
            v-for="p in allProjects"
            :key="p.project_id"
            :label="p.name"
            :value="p.project_id"
          />
        </el-select>
      </el-form-item>
    </template>

    <!-- 直播选择 -->
    <template v-else-if="jumpType === 'live'">
      <template v-if="!lockProjectId">
        <el-form-item label="所属项目">
          <el-select
            :model-value="currentProjectId"
            @update:model-value="onProjectChange"
            placeholder="请先选择项目"
            filterable
          >
            <el-option
              v-for="p in allProjects"
              :key="p.project_id"
              :label="p.name"
              :value="p.project_id"
            />
          </el-select>
        </el-form-item>
      </template>
      <el-form-item :label="jumpId ? '已选直播' : '选择直播'">
        <el-select
          v-if="currentProjectId || lockProjectId"
          :model-value="jumpId"
          @update:model-value="(v: string) => emit('update:jumpId', v)"
          placeholder="请选择直播"
          filterable
        >
          <el-option
            v-for="l in projectLives"
            :key="l.live_id"
            :label="l.title"
            :value="l.live_id"
          />
        </el-select>
        <span v-else class="picker-hint">请先选择项目</span>
      </el-form-item>
    </template>

    <!-- v3.1.44 新增：功能页面选择（替代原 url 输入） -->
    <template v-else-if="jumpType === 'function_page'">
      <!-- 分类筛选 -->
      <el-form-item label="页面分类">
        <el-select
          :model-value="fpCategoryFilter"
          @update:model-value="onFpCategoryChange"
          placeholder="请选择页面分类"
        >
          <el-option label="全部" value="" />
          <el-option label="内置系统页面" value="builtin" />
          <el-option label="业务功能页面" value="business" />
          <el-option label="活动页面" value="activity" />
        </el-select>
      </el-form-item>

      <!-- 功能页面选择 -->
      <el-form-item :label="jumpId ? '已选页面' : '选择页面'">
        <el-select
          :model-value="jumpId"
          @update:model-value="onFpChange"
          placeholder="请选择功能页面"
          filterable
        >
          <el-option-group
            v-for="group in fpGroupedOptions"
            :key="group.category"
            :label="group.label"
          >
            <el-option
              v-for="fp in group.pages"
              :key="fp.page_id"
              :label="`${fp.name}${fp.description ? ' — ' + fp.description : ''}`"
              :value="fp.page_id"
            />
          </el-option-group>
        </el-select>
        <div class="fp-route-preview" v-if="selectedFpRoute">
          <span class="fp-route-label">实际路由：</span>
          <code>{{ selectedFpRoute }}</code>
        </div>
      </el-form-item>

      <!-- 若功能页面路由含 :projectId，且非租户后台模式，显示项目选择器 -->
      <template v-if="selectedFp && selectedFp.app_route.includes(':projectId') && !lockProjectId">
        <el-form-item label="所属项目">
          <el-select
            :model-value="projectId"
            @update:model-value="(v: string) => emit('update:projectId', v)"
            placeholder="请选择项目"
            filterable
          >
            <el-option
              v-for="p in allProjects"
              :key="p.project_id"
              :label="p.name"
              :value="p.project_id"
            />
          </el-select>
        </el-form-item>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAppConfigStore } from '../../stores/app-config-store';
import { useProjectStore } from '../../stores/project-store';
import type { FunctionPage } from '../../contracts';

const props = defineProps<{
  jumpType: string;
  jumpId: string;
  projectId?: string;
  lockProjectId?: string;
  hideProjectJump?: boolean;
}>();

const emit = defineEmits<{
  'update:jumpType': [value: string];
  'update:jumpId': [value: string];
  'update:projectId': [value: string];
}>();

const appStore = useAppConfigStore();
const projectStore = useProjectStore();

// 当前选中的跳转类型（内部状态，双向绑定与父组件同步）
const jumpType = computed(() => props.jumpType);
const jumpId = computed(() => props.jumpId);

// 当前选中的项目ID（用于商品/直播筛选 + function_page 项目填充）
const currentProjectId = ref(props.projectId || '');
watch(() => props.projectId, (v) => { currentProjectId.value = v || ''; });

// 项目列表
const allProjects = computed(() => projectStore.activeProjects);

// 当前选中项目下的商品/直播（用于 product/live 类型选择器）
const projectProducts = computed(() => {
  const pid = currentProjectId.value || props.lockProjectId;
  if (!pid) return [];
  return projectStore.productsByProject(pid);
});

const projectLives = computed(() => {
  const pid = currentProjectId.value || props.lockProjectId;
  if (!pid) return [];
  return projectStore.livesByProject(pid);
});

// ───── 功能页面相关 ─────

// 分类筛选值
const fpCategoryFilter = ref('');

// 所有启用的功能页面
const activePages = computed(() => appStore.activeFunctionPages);

// 按分类筛选后的功能页面
const filteredFp = computed(() => {
  const pages = activePages.value;
  if (!fpCategoryFilter.value) return pages;
  return pages.filter(fp => fp.category === fpCategoryFilter.value);
});

// 分组后的选项列表（按分类分组）
const fpGroupedOptions = computed(() => {
  const categoryOrder: Record<string, { label: string; order: number }> = {
    builtin: { label: '内置系统页面', order: 1 },
    business: { label: '业务功能页面', order: 2 },
    activity: { label: '活动页面', order: 3 },
  };
  const groups: Record<string, { category: string; label: string; order: number; pages: FunctionPage[] }> = {};
  for (const fp of filteredFp.value) {
    if (!groups[fp.category]) {
      const info = categoryOrder[fp.category] || { label: fp.category, order: 99 };
      groups[fp.category] = { category: fp.category, label: info.label, order: info.order, pages: [] };
    }
    groups[fp.category].pages.push(fp);
  }
  return Object.values(groups).sort((a, b) => a.order - b.order);
});

// 当前选中的功能页面对象
const selectedFp = computed<FunctionPage | undefined>(() => {
  if (!jumpId.value) return undefined;
  return activePages.value.find(fp => fp.page_id === jumpId.value);
});

// 路由预览（替换 :projectId）
const selectedFpRoute = computed(() => {
  if (!selectedFp.value) return '';
  let route = selectedFp.value.app_route;
  const pid = props.lockProjectId || props.projectId;
  if (pid && route.includes(':projectId')) {
    route = route.replace(':projectId', pid);
  }
  return route;
});

// 事件处理
function onJumpTypeChange(val: string) {
  emit('update:jumpType', val);
  emit('update:jumpId', '');
  if (val !== 'function_page') {
    emit('update:projectId', '');
  }
  currentProjectId.value = '';
  fpCategoryFilter.value = '';
}

function onProjectChange(pid: string) {
  currentProjectId.value = pid;
  emit('update:projectId', pid);
  emit('update:jumpId', ''); // 切换项目时清空已选商品/直播
}

function onFpCategoryChange(val: string) {
  fpCategoryFilter.value = val;
}

function onFpChange(pageId: string) {
  emit('update:jumpId', pageId);
  // 如果选中的功能页面需要项目ID且是租户后台模式，自动填充
  const fp = activePages.value.find(f => f.page_id === pageId);
  if (fp && fp.app_route.includes(':projectId')) {
    if (props.lockProjectId) {
      emit('update:projectId', props.lockProjectId);
    }
    // 运营后台模式下，用户会看到项目选择器自行选择
  } else {
    emit('update:projectId', '');
  }
}
</script>

<style scoped>
.jump-target-picker {
  width: 100%;
}

.picker-hint {
  display: block;
  padding: 8px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.fp-route-preview {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.fp-route-label {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.fp-route-preview code {
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  word-break: break-all;
}
</style>
