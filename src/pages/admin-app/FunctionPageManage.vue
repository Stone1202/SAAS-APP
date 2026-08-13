<!--
  FunctionPageManage.vue — 功能页面管理页（v3.1.47 调整1 改造）

  所属功能域：OPS-CONFIG（运营配置）
  用例编号：UC-OPS-OPS-CONFIG-008
  路由路径：/admin/function-pages

  ========== v3.1.47 调整1：只读 + 启用/禁用 ==========
  本页面为系统维护，运营人员仅可启用/禁用已有功能页面。
  - 删除"新增功能页面"按钮和新增/编辑弹窗
  - 列表"操作"列改为启用/禁用开关（el-switch）
  - 筛选区增加"筛选"和"重置"按钮（工作副本模式）
  - 页面内容不允许修改，只允许启用/禁用
  
  ========== 角色与职责 ==========
  系统维护（开发团队）：通过代码维护功能页面注册表
  运营人员（本页面的操作者）：
    - 仅可启用/禁用已有功能页面
    - 不可新增/编辑/删除功能页面
    - 每次操作后，JumpTargetPicker 下拉列表实时更新
-->
<template>
  <div class="function-page-manage">
    <!-- 页面头部说明 -->
    <div class="fpm-header">
      <div class="fpm-header-left">
        <h2 class="fpm-title">🔗 功能页面管理</h2>
        <p class="fpm-subtitle">统一管理 APP 内可跳转的功能页面白名单（注册表），确保跳转安全一致</p>
      </div>
    </div>

    <!-- 功能说明卡片 -->
    <el-alert
      type="info"
      :closable="false"
      class="fpm-explainer"
    >
      <template #title>
        <strong>使用说明</strong>
      </template>
      <div class="explainer-content">
        <p><strong>1. 系统维护：</strong>功能页面注册表由系统维护，运营人员仅可对已有功能页面进行启用/禁用操作。</p>
        <p><strong>2. 启用/禁用：</strong>切换开关即可启用或禁用对应功能页面，禁用后运营人员在 JumpTargetPicker 中将看不到该选项。</p>
        <p><strong>3. 路由占位符支持：</strong>若路由中含 <code>:projectId</code>，运行时会自动替换为实际项目 ID（租户后台自动填充，运营后台手动选择）。</p>
        <p><strong>4. 内置页面说明：</strong>内置系统页面、业务功能页面、活动页面均可启用/禁用。</p>
      </div>
    </el-alert>

    <!-- 搜索筛选区 -->
    <div class="fpm-toolbar">
      <div class="fpm-filters">
        <el-input
          v-model="searchKeywordInput"
          placeholder="搜索页面名称或路由..."
          clearable
          style="width: 260px"
        >
          <template #prefix>
            <span>🔍</span>
          </template>
        </el-input>
        <el-select
          v-model="filterCategoryInput"
          placeholder="分类筛选"
          clearable
          style="width: 160px"
        >
          <el-option label="全部" value="" />
          <el-option label="内置系统页面" value="builtin" />
          <el-option label="业务功能页面" value="business" />
          <el-option label="活动页面" value="activity" />
        </el-select>
        <el-select
          v-model="filterStatusInput"
          placeholder="状态筛选"
          clearable
          style="width: 140px"
        >
          <el-option label="全部" value="" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" @click="applyFilters">筛选</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <!-- 列表 -->
    <el-table
      :data="pagedData"
      stripe
      border
      class="fpm-table"
    >
      <el-table-column prop="page_id" label="页面ID" width="180" />
      <el-table-column prop="name" label="页面名称" min-width="150" />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          <el-tag
            :type="categoryTagType(row.category)"
            size="small"
          >
            {{ categoryLabel(row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="路由路径" min-width="220">
        <template #default="{ row }">
          <code class="fpm-route-code">{{ row.app_route }}</code>
        </template>
      </el-table-column>
      <el-table-column label="说明" min-width="150">
        <template #default="{ row }">
          <span class="fpm-desc">{{ row.description || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="70" align="center">
        <template #default="{ row }">
          {{ row.sort_order }}
        </template>
      </el-table-column>
      <el-table-column label="启用/禁用" width="110" align="center" fixed="right">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === 'active'"
            @change="(val: boolean) => toggleStatus(row, val)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="fpm-pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        background
        @current-change="loadPage"
      />
    </div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAppConfigStore } from '../../stores/app-config-store';
import type { FunctionPage } from '../../contracts';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';

const store = useAppConfigStore();
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-OPS-PC-009', '功能页面管理');

// ───── 搜索筛选（工作副本模式） ─────
// 输入副本（用户编辑后需点击"筛选"按钮才生效）
const searchKeywordInput = ref('');
const filterCategoryInput = ref('');
const filterStatusInput = ref('');
// 应用后的值（用于 computed 计算）
const searchKeyword = ref('');
const filterCategory = ref('');
const filterStatus = ref('');

function applyFilters() {
  searchKeyword.value = searchKeywordInput.value;
  filterCategory.value = filterCategoryInput.value;
  filterStatus.value = filterStatusInput.value;
  loadPage(1);
}

function resetFilters() {
  searchKeywordInput.value = '';
  filterCategoryInput.value = '';
  filterStatusInput.value = '';
  searchKeyword.value = '';
  filterCategory.value = '';
  filterStatus.value = '';
  loadPage(1);
}

// ───── 分页 ─────
const pageSize = 10;
const currentPage = ref(1);

// 筛选后的全部数据
const filteredAll = computed(() => {
  let list = [...store.functionPages];
  if (filterCategory.value) {
    list = list.filter(fp => fp.category === filterCategory.value);
  }
  if (filterStatus.value) {
    list = list.filter(fp => fp.status === filterStatus.value);
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase();
    list = list.filter(fp =>
      fp.name.toLowerCase().includes(kw) ||
      fp.page_id.toLowerCase().includes(kw) ||
      fp.app_route.toLowerCase().includes(kw) ||
      (fp.description && fp.description.toLowerCase().includes(kw))
    );
  }
  return list;
});

const total = computed(() => filteredAll.value.length);

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredAll.value.slice(start, start + pageSize);
});

function loadPage(page: number) {
  currentPage.value = page;
}

onMounted(() => {
  loadPage(1);
});

// ───── 分类标签 ─────
function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    builtin: '内置系统',
    business: '业务功能',
    activity: '活动页面',
  };
  return map[cat] || cat;
}

function categoryTagType(cat: string): string {
  const map: Record<string, string> = {
    builtin: '',
    business: 'success',
    activity: 'warning',
  };
  return map[cat] || 'info';
}

// ───── 启用/禁用切换 ─────
function toggleStatus(row: FunctionPage, enabled: boolean) {
  const newStatus = enabled ? 'active' : 'disabled';
  store.updateFunctionPage(row.page_id, { status: newStatus });
  ElMessage.success(`功能页面"${row.name}"已${enabled ? '启用' : '禁用'}`);
}
</script>

<style scoped>
.function-page-manage {
  padding: 20px;
}

.fpm-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.fpm-header-left {
  flex: 1;
}

.fpm-title {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.fpm-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 说明卡片 */
.fpm-explainer {
  margin-bottom: 16px;
}

.explainer-content p {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.explainer-content code {
  background: var(--el-fill-color);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
  color: var(--el-color-primary);
}

/* 工具栏 */
.fpm-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.fpm-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

/* 表格 */
.fpm-table {
  margin-top: 0;
}

.fpm-route-code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--el-color-primary);
  word-break: break-all;
}

.fpm-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 分页 */
.fpm-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
