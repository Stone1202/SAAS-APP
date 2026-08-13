<template>
  <!-- 通用维度配置组件（v3.1.30 抽离自 LiveRecommendManage.vue）
       支持直播/商品/项目三类推荐目标的维度配置 -->
  <div class="dim-configurator">
    <!-- 维度开关列表 -->
    <div class="dim-list">
      <div v-for="(dim, idx) in dimensions" :key="dim.dim_type" class="dim-row">
        <div class="dim-row-head">
          <span class="dim-index">{{ idx + 1 }}</span>
          <span class="dim-label">{{ dim.label }}</span>
          <el-switch v-model="enabledDims[dim.dim_type]" size="small" @change="onDimToggle(dim.dim_type)" />
        </div>
        <div class="dim-config" v-if="enabledDims[dim.dim_type]">
          <!-- 多选离散维度 -->
          <template v-if="dim.value_type === 'discrete_multi'">
            <div class="multi-config">
              <el-select
                v-model="selectedValues[dim.dim_type]"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :placeholder="dim.placeholder || '请选择'"
                style="width:360px"
                size="small"
                @change="onDimConfigChange"
              >
                <el-option v-for="opt in dim.options" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
              <!-- 优先级拖拽排序列表 -->
              <div class="priority-list" v-if="selectedValues[dim.dim_type]?.length">
                <div class="priority-tip">优先级顺序（拖拽调整，越靠前越优先）：</div>
                <div class="priority-items">
                  <div
                    v-for="(val, vi) in selectedValues[dim.dim_type]"
                    :key="val"
                    class="priority-item"
                    draggable="true"
                    @dragstart="onDragStart($event, vi)"
                    @dragover.prevent="onDragOver($event, vi)"
                    @drop="onDrop($event, vi, dim.dim_type)"
                    @dragend="onDragEnd"
                    :class="{ 'drag-over': dragOverIndex === vi, 'dragging': dragIndex === vi }"
                  >
                    <span class="priority-no">{{ vi + 1 }}</span>
                    <span class="priority-name">{{ dimLabel(dim.dim_type, val) }}</span>
                    <span class="priority-ops">
                      <el-button size="small" link :disabled="vi === 0" @click="movePriority(dim.dim_type, vi, -1)">↑</el-button>
                      <el-button size="small" link :disabled="vi === (selectedValues[dim.dim_type]?.length || 0) - 1" @click="movePriority(dim.dim_type, vi, 1)">↓</el-button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 连续维度：方向选择 -->
          <template v-else-if="dim.value_type === 'continuous'">
            <div class="continuous-config">
              <span class="dim-field-label">排序方向：</span>
              <el-radio-group v-model="dimDirections[dim.dim_type]" size="small" @change="onDimConfigChange">
                <el-radio-button label="desc">降序（高→低）</el-radio-button>
                <el-radio-button label="asc">升序（低→高）</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <!-- 固定优先级维度 -->
          <template v-else-if="dim.value_type === 'discrete_fixed'">
            <div class="fixed-config">
              <el-tag type="info" size="small">{{ fixedPriorityText(dim) }}</el-tag>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 已启用维度的叠加排序顺序 -->
    <div class="dim-chain" v-if="activeDimTypes.length">
      <div class="dim-chain-label">叠加排序顺序（上→下为优先级从高到低）：</div>
      <div class="dim-chain-items">
        <div v-for="(dt, i) in activeDimTypes" :key="dt" class="chain-item">
          <span class="chain-no">{{ i + 1 }}</span>
          <span class="chain-name">{{ dimDefLabel(dt) }}</span>
          <span class="chain-ops" v-if="activeDimTypes.length > 1">
            <el-button size="small" link :disabled="i === 0" @click="moveChain(i, -1)">↑</el-button>
            <el-button size="small" link :disabled="i === activeDimTypes.length - 1" @click="moveChain(i, 1)">↓</el-button>
          </span>
        </div>
      </div>
      <!-- 排序逻辑说明 -->
      <div class="sort-logic-desc">
        <div class="sort-logic-title">📋 排序逻辑说明</div>
        <div class="sort-logic-body">
          <p><b>最终排序结果 = 手动推荐（固定在前） + 默认规则排序结果（去重补足在后）</b></p>
          <p><b>默认规则排序逻辑（等价于 SQL ORDER BY 多级排序）：</b></p>
          <p>系统会按照上方维度的排列顺序，依次对每一条数据排序。排在前面的维度优先级最高，只有当高优先级维度无法区分时（值相同），才会使用下一个维度继续比较。</p>
          <p><b>各维度比较规则：</b></p>
          <ul>
            <li><b>多选维度</b>：被选中的值按你设置的优先级顺序排在前，未选中的值排在后面。</li>
            <li><b>固定优先级维度</b>：按预设优先级排序，无需配置。</li>
            <li><b>连续维度</b>：按数值大小排序，降序=大的在前，升序=小的在前。</li>
          </ul>
          <p><b>叠加排序示例：</b>若顺序为「①按项目 → ②按状态 → ③按观看人数」，则先按项目分组，同项目内再按状态排序，同状态内再按观看人数降序。</p>
          <p class="sort-logic-dev"><b>开发说明：</b>底层实现为稳定排序，从最后一个维度开始逐级排序，保证高优先级维度的排序结果不被低优先级维度破坏。</p>
        </div>
      </div>
    </div>

    <!-- 首页展示条数 -->
    <el-form label-width="120px" size="small" style="margin-top:16px" v-if="showDisplayLimit">
      <el-form-item label="首页展示条数">
        <el-input-number v-model="displayLimit" :min="1" :max="20" @change="onDisplayLimitChange" />
        <span class="dim-tip">仅首页推荐区生效，精选Tab不受限制（显示全部）</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { SortDimension, DimensionDef, RecommendTargetType } from '../../contracts/recommend-engine';

// ============================================
// Props & Emits
// ============================================
const props = withDefaults(defineProps<{
  /** 可用维度列表 */
  dimensions: DimensionDef[];
  /** 当前规则数据（sort_dimensions） */
  modelValue: SortDimension[];
  /** 首页展示条数（v3.1.34 已废弃，展示条数转移到场景配置） */
  displayLimitValue?: number;
  /** 是否显示首页展示条数控件（v3.1.34 默认 false） */
  showDisplayLimit?: boolean;
  /** 目标类型（用于排序说明文案） */
  targetType?: RecommendTargetType;
}>(), {
  showDisplayLimit: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: SortDimension[]): void;
  (e: 'update:displayLimitValue', value: number): void;
}>();

// ============================================
// 状态
// ============================================
const enabledDims = reactive<Record<string, boolean>>({});
const selectedValues = reactive<Record<string, string[]>>({});
const dimDirections = reactive<Record<string, 'desc' | 'asc'>>({});
const dimChainOrder = ref<string[]>([]);
const displayLimit = ref(props.displayLimitValue ?? 6);

// ============================================
// 初始化
// ============================================
function initFromModel() {
  Object.keys(enabledDims).forEach(k => delete enabledDims[k]);
  Object.keys(selectedValues).forEach(k => delete selectedValues[k]);
  Object.keys(dimDirections).forEach(k => delete dimDirections[k]);
  dimChainOrder.value = [];

  const dims = props.modelValue || [];
  dims.forEach(d => {
    enabledDims[d.dim_type] = true;
    selectedValues[d.dim_type] = [...(d.selected_values || [])];
    dimDirections[d.dim_type] = d.direction || 'desc';
    dimChainOrder.value.push(d.dim_type);
  });

  // 未启用的维度初始化默认值
  props.dimensions.forEach(def => {
    if (enabledDims[def.dim_type] === undefined) enabledDims[def.dim_type] = false;
    if (def.value_type === 'continuous' && !dimDirections[def.dim_type]) dimDirections[def.dim_type] = 'desc';
    if (def.value_type === 'discrete_multi' && !selectedValues[def.dim_type]) selectedValues[def.dim_type] = [];
  });
}

watch(() => props.modelValue, initFromModel, { immediate: true });
watch(() => props.displayLimitValue, (v) => { if (v !== undefined) displayLimit.value = v; });

// ============================================
// Computed
// ============================================
const activeDimTypes = computed(() => dimChainOrder.value.filter(dt => enabledDims[dt]));

// ============================================
// 构建排序维度数组
// ============================================
function buildSortDimensions(): SortDimension[] {
  return activeDimTypes.value.map(dt => ({
    dim_type: dt,
    direction: dimDirections[dt] || 'desc',
    selected_values: selectedValues[dt] || [],
  }));
}

function saveRule() {
  emit('update:modelValue', buildSortDimensions());
  emit('update:displayLimitValue', displayLimit.value);
}

// ============================================
// 事件处理
// ============================================
function onDimToggle(dimType: string) {
  if (enabledDims[dimType]) {
    if (!dimChainOrder.value.includes(dimType)) dimChainOrder.value.push(dimType);
  } else {
    dimChainOrder.value = dimChainOrder.value.filter(d => d !== dimType);
    selectedValues[dimType] = [];
  }
  saveRule();
  ElMessage.success(enabledDims[dimType] ? `已启用维度：${dimDefLabel(dimType)}` : `已禁用维度：${dimDefLabel(dimType)}`);
}

function onDimConfigChange() {
  saveRule();
  ElMessage.success('维度配置已更新');
}

function onDisplayLimitChange() {
  saveRule();
}

function moveChain(index: number, delta: number) {
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex >= activeDimTypes.value.length) return;
  const arr = [...dimChainOrder.value];
  const realFrom = dimChainOrder.value.indexOf(activeDimTypes.value[index]);
  const realTo = dimChainOrder.value.indexOf(activeDimTypes.value[newIndex]);
  [arr[realFrom], arr[realTo]] = [arr[realTo], arr[realFrom]];
  dimChainOrder.value = arr;
  saveRule();
}

// ============================================
// 拖拽排序
// ============================================
const dragIndex = ref(-1);
const dragOverIndex = ref(-1);

function onDragStart(_e: DragEvent, index: number) { dragIndex.value = index; }
function onDragOver(_e: DragEvent, index: number) { dragOverIndex.value = index; }
function onDrop(_e: DragEvent, index: number, dimType: string) {
  if (dragIndex.value === -1 || dragIndex.value === index) return;
  const arr = [...(selectedValues[dimType] || [])];
  const [moved] = arr.splice(dragIndex.value, 1);
  arr.splice(index, 0, moved);
  selectedValues[dimType] = arr;
  dragIndex.value = -1;
  dragOverIndex.value = -1;
  saveRule();
  ElMessage.success('优先级已调整');
}
function onDragEnd() { dragIndex.value = -1; dragOverIndex.value = -1; }

function movePriority(dimType: string, index: number, delta: number) {
  const newIndex = index + delta;
  const arr = selectedValues[dimType] || [];
  if (newIndex < 0 || newIndex >= arr.length) return;
  [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
  selectedValues[dimType] = [...arr];
  saveRule();
}

// ============================================
// 辅助函数
// ============================================
function dimDefLabel(dt: string): string {
  return props.dimensions.find(d => d.dim_type === dt)?.label || dt;
}

function dimLabel(dimType: string, val: string): string {
  const def = props.dimensions.find(d => d.dim_type === dimType);
  return def?.options?.find(o => o.value === val)?.label || val;
}

function fixedPriorityText(dim: DimensionDef): string {
  if (dim.dim_type === 'status') return '固定优先级：直播中 > 预告 > 回放 > 已结束';
  return '固定优先级排序';
}
</script>

<style scoped>
.dim-list { display: flex; flex-direction: column; gap: 12px; }
.dim-row { border: 1px solid #ebeef5; border-radius: 8px; padding: 12px; }
.dim-row-head { display: flex; align-items: center; gap: 10px; }
.dim-index { width: 22px; height: 22px; border-radius: 50%; background: #FF6B35; color: #fff; font-size: 12px; line-height: 22px; text-align: center; flex-shrink: 0; }
.dim-label { font-size: 14px; font-weight: 600; color: #222; flex: 1; }
.dim-config { margin-top: 10px; padding-left: 32px; }
.dim-tip { font-size: 12px; color: #999; margin-left: 10px; }

.multi-config { display: flex; flex-direction: column; gap: 10px; }
.priority-list { margin-top: 6px; }
.priority-tip { font-size: 12px; color: #666; margin-bottom: 6px; }
.priority-items { display: flex; flex-direction: column; gap: 4px; }
.priority-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; background: #f5f7fa; border-radius: 6px;
  cursor: grab; border: 1px solid transparent;
  transition: all 0.15s;
}
.priority-item:hover { border-color: #c0c4cc; }
.priority-item.drag-over { border-color: #FF6B35; background: #fff7f0; }
.priority-item.dragging { opacity: 0.5; }
.priority-no { width: 20px; height: 20px; border-radius: 50%; background: #FF6B35; color: #fff; font-size: 11px; line-height: 20px; text-align: center; flex-shrink: 0; }
.priority-name { flex: 1; font-size: 13px; color: #333; }
.priority-ops { display: flex; gap: 2px; }

.continuous-config { display: flex; align-items: center; gap: 10px; }
.dim-field-label { font-size: 13px; color: #666; }
.fixed-config { padding: 4px 0; }

.dim-chain { margin-top: 16px; padding: 12px; background: #f5f7fa; border-radius: 8px; }
.dim-chain-label { font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 600; }
.dim-chain-items { display: flex; flex-wrap: wrap; gap: 8px; }
.chain-item {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; background: #fff; border: 1px solid #dcdfe6; border-radius: 16px;
}
.chain-no { width: 18px; height: 18px; border-radius: 50%; background: #FF6B35; color: #fff; font-size: 10px; line-height: 18px; text-align: center; }
.chain-name { font-size: 13px; color: #333; }
.chain-ops { display: flex; gap: 2px; }

.sort-logic-desc { margin-top: 12px; padding: 12px; background: #fff; border: 1px solid #e4e7ed; border-radius: 8px; }
.sort-logic-title { font-size: 13px; font-weight: 700; color: #409eff; margin-bottom: 8px; }
.sort-logic-body { font-size: 12px; color: #606266; line-height: 1.8; }
.sort-logic-body p { margin: 4px 0; }
.sort-logic-body ul { margin: 4px 0 4px 18px; padding: 0; }
.sort-logic-body li { margin: 2px 0; }
.sort-logic-dev { color: #909399; border-top: 1px dashed #e4e7ed; padding-top: 6px; margin-top: 6px; }
</style>
