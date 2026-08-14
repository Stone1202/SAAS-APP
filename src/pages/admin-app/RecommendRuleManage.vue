<template>
  <!-- 运营后台 — 规则引擎管理（v3.1.31 新增）
       独立的规则定义管理页：创建/编辑/删除规则实体，配置多维度排序链
       规则创建后可被各推荐场景引用（1:1） -->
  <div class="page-admin">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>运营后台</el-breadcrumb-item>
      <el-breadcrumb-item>规则引擎管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 说明面板 -->
    <el-alert
      type="info"
      :closable="false"
      show-icon
      style="margin-top:16px"
    >
      <template #title>规则引擎说明</template>
      <div class="rule-intro">
        <p>· 规则引擎是独立的推荐排序规则定义中心，可被各推荐场景（首页推荐、精选Tab等）引用</p>
        <p>· 一个场景只能引用一个规则（1:1），同一类型的规则可创建多个</p>
        <p>· 规则由"多维度排序链"组成，启用的维度按从上到下顺序依次排序（等价 SQL ORDER BY dim1, dim2, ...）</p>
        <p>· 内置规则（{{ builtinCount }}个）不可删除，可修改；自定义规则可自由编辑和删除</p>
      </div>
    </el-alert>

    <!-- 工具栏 -->
    <div class="toolbar" style="margin-top:16px">
      <el-input v-model="filterKeyword" placeholder="搜索规则名称" clearable size="small" style="width:200px" @keyup.enter="applyRuleFilters" />
      <el-select v-model="filterTargetType" placeholder="按类型筛选" size="small" clearable style="width:140px">
        <el-option label="全部类型" value="" />
        <el-option label="直播" value="live" />
        <el-option label="商品" value="product" />
        <el-option label="项目" value="project" />
      </el-select>
      <el-select v-model="filterRuleStatus" placeholder="状态筛选" size="small" clearable style="width:120px">
        <el-option label="全部状态" value="" />
        <el-option label="启用" value="active" />
        <el-option label="停用" value="disabled" />
      </el-select>
      <el-button type="primary" size="small" @click="applyRuleFilters">筛选</el-button>
      <el-button size="small" @click="resetRuleFilters">重置</el-button>
      <el-button type="primary" size="small" @click="openCreate">+ 新建规则</el-button>
      <span class="toolbar-tip">共 {{ filteredRules.length }} 条规则（含 {{ builtinCount }} 个内置、{{ customCount }} 个自定义）</span>
    </div>

    <!-- 规则列表 -->
    <el-table :data="pagedRules" border stripe size="small" style="margin-top:12px">
      <template #empty>
        <el-empty description="暂无匹配的规则" :image-size="60" />
      </template>
      <el-table-column label="规则名称" min-width="200">
        <template #default="{ row }">
          <div class="rule-name-cell">
            <span class="rule-name">{{ row.name }}</span>
            <el-tag v-if="row.is_builtin" type="warning" size="small">内置</el-tag>
            <el-tag v-if="row.status === 'disabled'" type="info" size="small">已停用</el-tag>
          </div>
          <div class="rule-desc" v-if="row.description">{{ row.description }}</div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="80" align="center">
        <template #default="{ row }">{{ targetTypeText(row.target_type) }}</template>
      </el-table-column>
      <el-table-column label="排序链" min-width="280">
        <template #default="{ row }">
          <div class="dim-chain-preview">
            <el-tag
              v-for="(d, i) in row.rule?.sort_dimensions || []"
              :key="i"
              size="small"
              type="info"
              class="dim-tag"
            >
              {{ i + 1 }}. {{ dimLabel(row.target_type, d.dim_type) }}
              <span v-if="d.direction === 'desc'">↓</span>
              <span v-else-if="d.direction === 'asc'">↑</span>
            </el-tag>
            <span v-if="!row.rule?.sort_dimensions?.length" class="dim-empty">无维度</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="引用场景" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getRuleUsageCount(row.rule_id) > 0 ? 'success' : 'info'">
            {{ getRuleUsageCount(row.rule_id) }} 个场景
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button
            v-if="row.status === 'active'"
            size="small" link @click="toggleStatus(row)"
          >停用</el-button>
          <el-button
            v-else
            size="small" link type="success" @click="toggleStatus(row)"
          >启用</el-button>
          <el-button
            size="small"
            link
            type="danger"
            :disabled="row.is_builtin || getRuleUsageCount(row.rule_id) > 0"
            @click="delRule(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- v3.1.42: 分页（v3.1.56：去掉v-if条件，始终渲染，≤1页时翻页按钮自动禁用） -->
    <el-pagination
      v-model:current-page="ruleCurrentPage"
      :page-size="rulePageSize"
      :total="filteredRules.length"
      layout="total, prev, pager, next"
      small
      style="margin-top:12px; justify-content:flex-end;"
    />

    <!-- 新建/编辑规则弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingRule.rule_id ? '编辑规则' : '新建规则'"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="editingRule" label-width="100px" size="small">
        <el-form-item label="规则名称" required>
          <el-input v-model="editingRule.name" maxlength="20" show-word-limit placeholder="如：直播热度优先" style="width:360px" />
        </el-form-item>
        <el-form-item label="适用类型" required>
          <el-radio-group v-model="editingRule.target_type" @change="onTargetTypeChange">
            <el-radio-button label="live">直播</el-radio-button>
            <el-radio-button label="product">商品</el-radio-button>
            <el-radio-button label="project">项目</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="规则描述">
          <el-input
            v-model="editingRule.description"
            type="textarea"
            :rows="2"
            maxlength="100"
            show-word-limit
            placeholder="规则用途说明"
            style="width:480px"
          />
        </el-form-item>
        <el-form-item label="排序维度链">
          <div class="dim-config-wrap">
            <DimensionConfigurator
              :dimensions="currentDimensions"
              :model-value="editingRule.rule?.sort_dimensions || []"
              :target-type="editingRule.target_type"
              @update:modelValue="onDimsUpdate"
            />
          </div>
        </el-form-item>
        <el-form-item label="基于模板创建" v-if="!editingRule.rule_id">
          <el-select
            v-model="selectedTemplateId"
            placeholder="选择模板快速创建（可选）"
            clearable
            style="width:320px"
            @change="applyTemplateToEditing"
          >
            <el-option
              v-for="tpl in templatesForCurrentType"
              :key="tpl.template_id"
              :label="tpl.name"
              :value="tpl.template_id"
            />
          </el-select>
          <span class="form-tip"> 选择模板后将自动填充排序维度配置</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule" :disabled="!editingRule.name">保存规则</el-button>
      </template>
    </el-dialog>

    <!-- v3.1.42: 用例卡 -->
    <HelpButton @open="ucDrawerVisible = true" />
    <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useAppConfigStore } from '../../stores/app-config-store';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import DimensionConfigurator from '../../components/admin/DimensionConfigurator.vue';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
import { getDimensionsByTarget } from '../../contracts/recommend-dimensions';
import type { RecommendRuleEntity, RecommendTargetType, SortDimension, RuleTemplate } from '../../contracts/recommend-engine';

// v3.1.42: 用例卡
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-OPS-PC-008', '规则引擎管理');

const store = useAppConfigStore();
const projectStore = useProjectStore();

const CURRENT_OPERATOR = '运营管理员';
function now() { return new Date().toISOString(); }

// ============================================
// 列表筛选 + v3.1.42 分页 + v3.1.44 筛选/重置
// ============================================
const filterTargetType = ref<RecommendTargetType | ''>('');
const filterKeyword = ref('');
const filterRuleStatus = ref('');
// v3.1.44: 筛选工作副本
const _ruleTargetType = ref<RecommendTargetType | ''>('');
const _ruleKeyword = ref('');
const _ruleStatus = ref('');

const filteredRules = computed(() => {
  let list = store.recommendRules;
  if (_ruleTargetType.value) list = list.filter(r => r.target_type === _ruleTargetType.value);
  if (_ruleKeyword.value) {
    const kw = _ruleKeyword.value.toLowerCase();
    list = list.filter(r => r.name.toLowerCase().includes(kw) || (r.description || '').toLowerCase().includes(kw));
  }
  if (_ruleStatus.value) list = list.filter(r => r.status === _ruleStatus.value);
  return list;
});

// v3.1.44: 筛选/重置
function applyRuleFilters() {
  _ruleTargetType.value = filterTargetType.value;
  _ruleKeyword.value = filterKeyword.value;
  _ruleStatus.value = filterRuleStatus.value;
  ruleCurrentPage.value = 1;
}
function resetRuleFilters() {
  filterTargetType.value = '';
  filterKeyword.value = '';
  filterRuleStatus.value = '';
  _ruleTargetType.value = '';
  _ruleKeyword.value = '';
  _ruleStatus.value = '';
  ruleCurrentPage.value = 1;
}

// v3.1.42: 分页
const ruleCurrentPage = ref(1);
const rulePageSize = 10;
const pagedRules = computed(() => {
  const start = (ruleCurrentPage.value - 1) * rulePageSize;
  return filteredRules.value.slice(start, start + rulePageSize);
});

const builtinCount = computed(() => store.recommendRules.filter(r => r.is_builtin).length);
const customCount = computed(() => store.recommendRules.filter(r => !r.is_builtin).length);

// 规则被场景引用次数
function getRuleUsageCount(ruleId: string): number {
  return store.recommendScenarios.filter(s => s.rule_id === ruleId).length;
}

// ============================================
// 工具函数
// ============================================
function targetTypeText(t: RecommendTargetType): string {
  return t === 'live' ? '直播' : t === 'product' ? '商品' : '项目';
}

function dimLabel(targetType: RecommendTargetType, dimType: string): string {
  const dims = getDimensionsByTarget(targetType);
  return dims.find(d => d.dim_type === dimType)?.label || dimType;
}

// 当前编辑类型对应的维度列表（动态填充options）
const currentDimensions = computed(() => {
  const dims = getDimensionsByTarget(editingRule.target_type);
  return dims.map(d => {
    if (d.dim_type === 'project' && d.value_type === 'discrete_multi') {
      return {
        ...d,
        options: projectStore.projects.map(p => ({ value: p.project_id, label: p.name })),
      };
    }
    if (d.dim_type === 'category' && d.value_type === 'discrete_multi') {
      const cats = new Set<string>();
      projectStore.products.forEach(p => { if (p.category) cats.add(p.category); });
      return {
        ...d,
        options: [...cats].sort().map(c => ({ value: c, label: c })),
      };
    }
    return d;
  });
});

// ============================================
// 新建/编辑
// ============================================
const dialogVisible = ref(false);
const editingRule = reactive<RecommendRuleEntity>({
  rule_id: '',
  name: '',
  target_type: 'live',
  rule: { sort_dimensions: [] },
  description: '',
  status: 'active',
  is_builtin: false,
  updated_by: '',
  updated_at: '',
});
const selectedTemplateId = ref('');

const templatesForCurrentType = computed(() =>
  store.templatesByTarget(editingRule.target_type)
);

function openCreate() {
  Object.assign(editingRule, {
    rule_id: '',
    name: '',
    target_type: filterTargetType.value || 'live',
    rule: { sort_dimensions: [] },
    description: '',
    status: 'active',
    is_builtin: false,
    updated_by: '',
    updated_at: '',
  });
  selectedTemplateId.value = '';
  dialogVisible.value = true;
}

function openEdit(row: RecommendRuleEntity) {
  Object.assign(editingRule, JSON.parse(JSON.stringify(row)));
  selectedTemplateId.value = '';
  dialogVisible.value = true;
}

function onTargetTypeChange() {
  // 切换类型时清空不匹配的维度
  const validDims = getDimensionsByTarget(editingRule.target_type).map(d => d.dim_type);
  if (editingRule.rule?.sort_dimensions) {
    editingRule.rule.sort_dimensions = editingRule.rule.sort_dimensions.filter(
      d => validDims.includes(d.dim_type)
    );
  }
}

function onDimsUpdate(dims: SortDimension[]) {
  editingRule.rule = { sort_dimensions: dims };
}

function applyTemplateToEditing(tplId: string) {
  if (!tplId) return;
  const tpl = store.ruleTemplates.find(t => t.template_id === tplId) as RuleTemplate | undefined;
  if (!tpl) return;
  if (tpl.target_type !== editingRule.target_type) {
    ElMessage.warning('模板类型与规则类型不匹配');
    selectedTemplateId.value = '';
    return;
  }
  editingRule.rule = JSON.parse(JSON.stringify(tpl.rule));
  if (tpl.description && !editingRule.description) editingRule.description = tpl.description;
  ElMessage.success('已应用模板配置');
}

function saveRule() {
  if (!editingRule.name?.trim()) {
    ElMessage.warning('请输入规则名称');
    return;
  }
  if (!editingRule.rule?.sort_dimensions?.length) {
    ElMessage.warning('请至少启用一个排序维度');
    return;
  }

  if (editingRule.rule_id) {
    // 编辑
    store.updateRule(editingRule.rule_id, {
      name: editingRule.name,
      target_type: editingRule.target_type,
      rule: JSON.parse(JSON.stringify(editingRule.rule)),
      description: editingRule.description,
      status: editingRule.status,
      updated_by: CURRENT_OPERATOR,
    });
    ElMessage.success('规则已更新');
  } else {
    // 新建
    const newRule: RecommendRuleEntity = {
      rule_id: `rule-${Date.now()}`,
      name: editingRule.name,
      target_type: editingRule.target_type,
      rule: JSON.parse(JSON.stringify(editingRule.rule)),
      description: editingRule.description,
      status: 'active',
      is_builtin: false,
      updated_by: CURRENT_OPERATOR,
      updated_at: now(),
    };
    store.addRule(newRule);
    ElMessage.success('规则已创建');
  }
  dialogVisible.value = false;
}

function toggleStatus(row: RecommendRuleEntity) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active';
  store.updateRule(row.rule_id, { status: newStatus, updated_by: CURRENT_OPERATOR });
  ElMessage.success(newStatus === 'active' ? '已启用' : '已停用');
}

function delRule(row: RecommendRuleEntity) {
  if (row.is_builtin) {
    ElMessage.warning('内置规则不可删除');
    return;
  }
  const usage = getRuleUsageCount(row.rule_id);
  if (usage > 0) {
    ElMessage.warning(`规则被 ${usage} 个场景引用，请先解除引用`);
    return;
  }
  ElMessageBox.confirm(`确认删除规则「${row.name}」？`, '提示', { type: 'warning' }).then(() => {
    const result = store.deleteRule(row.rule_id);
    if (result.success) {
      ElMessage.success('规则已删除');
    } else {
      ElMessage.error(result.message || '删除失败');
    }
  }).catch(() => {});
}
</script>

<style scoped>
.page-admin { padding: 20px; }

.rule-intro {
  font-size: 12px;
  color: #666;
  line-height: 1.8;
}
.rule-intro p { margin: 0; }

.toolbar { display: flex; align-items: center; gap: 12px; }
.toolbar-tip { font-size: 12px; color: #999; }

.rule-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.rule-name { font-size: 13px; font-weight: 600; color: #222; }
.rule-desc { font-size: 11px; color: #999; margin-top: 4px; }

.dim-chain-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.dim-tag {
  font-size: 11px;
}
.dim-empty {
  font-size: 12px;
  color: #ccc;
}

.dim-config-wrap {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
}

.form-tip {
  font-size: 11px;
  color: #999;
  margin-left: 8px;
}
</style>
