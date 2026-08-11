<!--
  FunctionPageManage.vue — 功能页面管理页（v3.1.44 新增）
  
  所属功能域：OPS-CONFIG（运营配置）
  用例编号：UC-OPS-OPS-CONFIG-008
  路由路径：/admin/function-pages
  
  ========== 功能概述 ==========
  统一管理 APP 内可跳转的"功能页面白名单（注册表）"。
  替代原有的"自由输入URL"跳转方式，确保跳转安全和一致性。
  
  ========== 角色与职责 ==========
  系统管理员（本页面的操作者）：
    - 维护功能页面注册表（新增/编辑/启用/禁用）
    - builtin 类型不可删除（仅可启用/禁用）
    - business/activity 类型可完整 CRUD
    - 每次操作后，JumpTargetPicker 下拉列表实时更新
  
  运营人员（本功能的消费者）：
    - 在 Banner/金刚区/搜索配置中选择"功能页面"跳转类型
    - 从下拉列表选择已注册的功能页面（无需手动输入路由）
    - 不可新增/编辑注册表条目
  
  APP 用户（最终消费者）：
    - 点击 Banner/金刚区/自定义搜索结果时
    - 系统自动解析 page_id → 查询注册表 → 获得实际路由 → 执行跳转
    
  ========== 完整使用流程 ==========
  场景1：新功能上线（系统管理员注册）
    1) 开发团队上线新功能页面（如"积分商城" /app/mine/member）
    2) 系统管理员打开本页面 → 点击"新增功能页面"
    3) 填写表单：分类(business) + 页面ID(fp-points-mall) + 名称(积分商城) + 路由(/app/mine/member) + 启用
    4) 保存后，注册表新增一条记录
    5) 运营人员在 JumpTargetPicker 中即可看到"积分商城"选项
  
  场景2：运营人员配置跳转（运营人员操作）
    1) 运营人员打开 Banner/金刚区/搜索管理页
    2) 选择跳转类型 → "功能页面"
    3) 从下拉列表按分类筛选 → 选择目标功能页面
    4) 若页面需项目ID（路由含 :projectId），租户后台自动填充 / 运营后台选项目
    5) 保存配置
  
  场景3：APP端跳转解析（用户点击）
    1) 用户点击配置好的 Banner/金刚区/搜索结果
    2) APP端读取 jump_type=function_page, jump_id=fp-xxx
    3) 调用 resolveFunctionPageRoute(fp-xxx, projectId)
    4) 匹配注册表中对应条目，获取 app_route
    5) 替换 :projectId 占位符（如需要）
    6) router.push 执行跳转
  
  ========== 分类说明 ==========
  - builtin:  内置系统页面（13条默认，不可删除，仅可启用/禁用）
  - business: 业务功能页面（运营人员/系统管理员可新增，可完整 CRUD）
  - activity: 活动页面（用于临时活动，可完整 CRUD）
  
  ========== 安全边界 ==========
  - 禁止外部链接（不保留 external 分类）
  - app_route 必须是 APP 内部路由（以 /app/ 开头）
  - 旧 jump_type=url 数据全部废弃，编辑时强制切换
  - builtin 类型条目不可删除（删除按钮不显示）
  - 禁用某个功能页面后，JumpTargetPicker 中将不显示该选项
  
  ========== 路由占位符说明 ==========
  功能页面的 app_route 可包含 :projectId 占位符：
  - 如：/app/project/:projectId/member
  - 运行时由系统自动替换为实际项目ID
    · 租户后台（ProjectBannerManage/ProjectKingKongManage）：自动从 lockProjectId 填充
    · 运营后台（AdManage/KingKongManage/SearchManage）：运营人员选择项目后填充
  - 无需占位符的页面（如 /app/mine）则直接使用
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
        <strong>使用方法</strong>
      </template>
      <div class="explainer-content">
        <p><strong>1. 注册功能页面：</strong>系统管理员在此注册 APP 内的功能页面（如积分商城、个人中心），运营人员在配置跳转时只能选择已注册的页面。</p>
        <p><strong>2. 内置页面不可删除：</strong>标记为"内置系统页面"的条目只能启用/禁用，不能删除。业务功能页面和活动页面可完整增删改。</p>
        <p><strong>3. 路由占位符支持：</strong>若路由中含 <code>:projectId</code>，运行时会自动替换为实际项目 ID（租户后台自动填充，运营后台手动选择）。</p>
        <p><strong>4. 禁用后不可选：</strong>将页面状态设为"禁用"后，运营人员在 JumpTargetPicker 中将看不到该选项。</p>
      </div>
    </el-alert>

    <!-- 搜索筛选区 -->
    <div class="fpm-toolbar">
      <div class="fpm-filters">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索页面名称或路由..."
          clearable
          style="width: 260px"
          @clear="loadPage(1)"
          @keyup.enter="loadPage(1)"
        >
          <template #prefix>
            <span>🔍</span>
          </template>
        </el-input>
        <el-select
          v-model="filterCategory"
          placeholder="分类筛选"
          clearable
          style="width: 160px"
          @change="loadPage(1)"
        >
          <el-option label="全部" value="" />
          <el-option label="内置系统页面" value="builtin" />
          <el-option label="业务功能页面" value="business" />
          <el-option label="活动页面" value="activity" />
        </el-select>
        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          clearable
          style="width: 140px"
          @change="loadPage(1)"
        >
          <el-option label="全部" value="" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </div>
      <el-button type="primary" @click="openAdd">
        + 新增功能页面
      </el-button>
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
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="70" align="center">
        <template #default="{ row }">
          {{ row.sort_order }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="openEdit(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.category !== 'builtin'"
            size="small"
            type="danger"
            link
            @click="handleDelete(row)"
          >
            删除
          </el-button>
          <span v-else class="fpm-builtin-tip" title="内置页面不可删除">-</span>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑功能页面' : '新增功能页面'"
      width="580px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="90px"
      >
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="内置系统页面" value="builtin" />
            <el-option label="业务功能页面" value="business" />
            <el-option label="活动页面" value="activity" />
          </el-select>
          <div class="fpm-form-hint">内置页面不可删除；业务/活动页面可完整增删改</div>
        </el-form-item>

        <el-form-item label="页面ID" prop="page_id">
          <el-input
            v-model="form.page_id"
            placeholder="如: fp-points-mall"
            :disabled="isEdit && editingFp?.category === 'builtin'"
          />
          <div class="fpm-form-hint">
            唯一标识，建议使用 fp- 前缀（如 fp-mine）；内置页面不可修改
          </div>
        </el-form-item>

        <el-form-item label="页面名称" prop="name">
          <el-input v-model="form.name" placeholder="如: 积分商城" />
        </el-form-item>

        <el-form-item label="页面说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="简要说明此页面的功能（运营人员在JumpTargetPicker中可见）"
          />
        </el-form-item>

        <el-form-item label="路由路径" prop="app_route">
          <el-input v-model="form.app_route" placeholder="如: /app/mine/member 或 /app/project/:projectId/member" />
          <div class="fpm-form-hint">
            必须是 /app/ 开头的内部路由；可使用 <code>:projectId</code> 占位符（运行时期自动替换）
          </div>
        </el-form-item>

        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" :max="999" />
          <span class="fpm-form-hint-inline">数字越小越靠前</span>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
          <div class="fpm-form-hint">禁用后运营人员将无法选择此功能页面</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useAppConfigStore } from '../../stores/app-config-store';
import type { FunctionPage } from '../../contracts';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';

const store = useAppConfigStore();
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-OPS-PC-009', '功能页面管理');

// ───── 搜索筛选 ─────
const searchKeyword = ref('');
const filterCategory = ref('');
const filterStatus = ref('');

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

// ───── 弹窗与表单 ─────
const dialogVisible = ref(false);
const isEdit = ref(false);
const editingFp = ref<FunctionPage | null>(null);
const formRef = ref<FormInstance>();

const form = reactive({
  page_id: '',
  category: 'business' as string,
  name: '',
  description: '',
  app_route: '',
  status: 'active' as string,
  sort_order: 0,
});

const formRules: FormRules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  page_id: [
    { required: true, message: '请输入页面ID', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/, message: '页面ID必须以字母开头，仅含字母/数字/下划线/连字符', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入页面名称', trigger: 'blur' }],
  app_route: [
    { required: true, message: '请输入路由路径', trigger: 'blur' },
    { pattern: /^\/app\//, message: '路由路径必须以 /app/ 开头', trigger: 'blur' },
  ],
};

function resetForm() {
  form.page_id = '';
  form.category = 'business';
  form.name = '';
  form.description = '';
  form.app_route = '';
  form.status = 'active';
  form.sort_order = 0;
  editingFp.value = null;
}

function openAdd() {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
}

function openEdit(row: FunctionPage) {
  isEdit.value = true;
  editingFp.value = row;
  form.page_id = row.page_id;
  form.category = row.category;
  form.name = row.name;
  form.description = row.description || '';
  form.app_route = row.app_route;
  form.status = row.status;
  form.sort_order = row.sort_order;
  dialogVisible.value = true;
}

async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  const data: FunctionPage = {
    page_id: form.page_id,
    category: form.category as FunctionPage['category'],
    name: form.name,
    description: form.description || undefined,
    app_route: form.app_route,
    status: form.status as 'active' | 'disabled',
    sort_order: form.sort_order,
    updated_at: new Date().toISOString(),
  };

  if (isEdit.value && editingFp.value) {
    // 编辑：只允许修改非 page_id 字段
    const { page_id: _pid, ...updates } = data;
    store.updateFunctionPage(editingFp.value.page_id, updates);
    ElMessage.success(`功能页面"${data.name}"更新成功`);
  } else {
    // 新增：检查 page_id 是否重复
    if (store.functionPages.find(fp => fp.page_id === data.page_id)) {
      ElMessage.warning(`页面ID "${data.page_id}" 已存在，请换一个`);
      return;
    }
    store.addFunctionPage(data);
    ElMessage.success(`功能页面"${data.name}"新增成功`);
  }

  dialogVisible.value = false;
  loadPage(1);
}

function handleDelete(row: FunctionPage) {
  if (row.category === 'builtin') {
    ElMessage.warning('内置系统页面不可删除，如需移除请将其禁用');
    return;
  }
  ElMessageBox.confirm(
    `确定要删除功能页面"${row.name}"吗？删除后运营人员在 JumpTargetPicker 中将无法选择此页面。`,
    '确认删除',
    { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    store.deleteFunctionPage(row.page_id);
    ElMessage.success(`已删除"${row.name}"`);
    loadPage(1);
  }).catch(() => {});
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

.fpm-builtin-tip {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  cursor: default;
}

/* 分页 */
.fpm-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 表单提示 */
.fpm-form-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.5;
}

.fpm-form-hint code {
  background: var(--el-fill-color);
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 11px;
  color: var(--el-color-primary);
}

.fpm-form-hint-inline {
  margin-left: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
