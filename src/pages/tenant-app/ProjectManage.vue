<template>
  <!-- 租户后台-项目管理 /tenant/projects（v3.1.48 表格列+编辑弹窗字段与运营后台项目列表编辑功能对齐 | v3.1.50 编辑弹窗新增所属租户字段+字段disabled与运营后台保持一致 | v3.1.51 商城名称校验：全局唯一+不超过20汉字） -->
  <div class="project-manage">
    <div class="page-header-bar">
      <h2 class="page-title">项目管理</h2>
      <span class="page-desc">管理租户下的所有项目（独立销售单元）及其门店</span>
    </div>

    <div class="toolbar">
      <el-input v-model="searchKeyword" placeholder="搜索项目名称/ID" clearable size="small" style="width:220px" @keyup.enter="applyFilters" />
      <el-select v-model="filterStatus" placeholder="全部状态" clearable size="small" style="width:120px">
        <el-option label="全部状态" value="" />
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="inactive" />
      </el-select>
      <el-button type="primary" size="small" @click="applyFilters">筛选</el-button>
      <el-button size="small" @click="resetFilters">重置</el-button>
      <el-button type="primary" @click="openAdd">+ 新增项目</el-button>
    </div>

    <el-table :data="filteredProjects" border stripe style="width: 100%">
      <el-table-column prop="project_id" label="项目ID" width="140" />
      <el-table-column label="项目Logo" width="80" align="center">
        <template #default="{ row }">
          <img :src="row.logo" class="proj-logo" v-if="row.logo" />
          <span v-else class="proj-logo-placeholder">📦</span>
        </template>
      </el-table-column>
      <el-table-column label="项目名称" min-width="140">
        <template #default="{ row }">
          <span class="proj-name">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商城名称" min-width="140">
        <template #default="{ row }">
          <span class="proj-mall-name">{{ row.mall_name || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="行业" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ INDUSTRY_LABELS[row.industry] || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="goStores(row)">门店管理</el-button>
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑项目' : '新增项目'" width="560px">
      <el-form :model="form" label-width="90px" ref="formRef" :rules="formRules">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" :disabled="editing" />
        </el-form-item>
        <el-form-item label="商城名称" prop="mall_name">
          <el-input v-model="form.mall_name" placeholder="商城展示名称（可选，全局唯一，不超过20汉字）" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="所属租户">
          <el-select v-model="form.tenant_id" style="width: 100%" disabled>
            <el-option
              v-for="t in projectStore.tenants"
              :key="t.tenant_id"
              :label="t.name"
              :value="t.tenant_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="行业">
          <el-select v-model="form.industry" style="width: 100%" :disabled="editing">
            <el-option label="日用品" value="daily_necessities" />
            <el-option label="保健品" value="health_products" />
            <el-option label="食品饮料" value="food_beverage" />
            <el-option label="家居家电" value="home_appliance" />
            <el-option label="美妆个护" value="beauty_care" />
          </el-select>
        </el-form-item>
        <el-form-item label="Logo">
          <div class="logo-upload-area">
            <img v-if="form.logo" :src="form.logo" class="logo-preview" />
            <div v-else class="logo-placeholder">📦</div>
            <el-upload
              class="logo-uploader"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="handleLogoChange"
            >
              <el-button type="primary" size="small">上传图片</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
          <div class="status-warning-text">项目禁用后，该项目下的所有商品/直播将从平台商城/推荐/搜索结果中隐藏，用户无法进入项目、查看详情或下单，但历史订单的售后权利不受影响。</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-TNT-PC-001', '项目管理');
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Project } from '../../contracts';

const projectStore = useProjectStore();
const router = useRouter();
const projects = computed(() => projectStore.projects);

// v3.1.48: 行业标签映射（与运营后台 ProjectListManage 一致）
const INDUSTRY_LABELS: Record<string, string> = {
  daily_necessities: '日用品',
  health_products: '保健品',
  food_beverage: '食品饮料',
  home_appliance: '家居家电',
  beauty_care: '美妆个护',
};

// v3.1.44: 项目列表筛选
const searchKeyword = ref('');
const filterStatus = ref('');
const _keyword = ref('');
const _status = ref('');
const filteredProjects = computed(() => {
  let list = projects.value;
  if (_keyword.value) {
    const q = _keyword.value.toLowerCase();
    list = list.filter(p =>
      p.name?.toLowerCase().includes(q) || p.project_id.toLowerCase().includes(q)
    );
  }
  if (_status.value) {
    list = list.filter(p => p.status === _status.value);
  }
  return list;
});

// v3.1.44: 筛选/重置
function applyFilters() {
  _keyword.value = searchKeyword.value;
  _status.value = filterStatus.value;
}
function resetFilters() {
  searchKeyword.value = '';
  filterStatus.value = '';
  _keyword.value = '';
  _status.value = '';
}

const dialogVisible = ref(false);
const formRef = ref();
const editing = ref(false);
const form = ref<Partial<Project>>({});

// v3.1.51: 商城名称校验规则——全局唯一 + 不超过20汉字
const formRules = computed(() => ({
  mall_name: [
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (!value || value.trim() === '') return callback(); // 可选字段
        if (value.length > 20) return callback(new Error('商城名称不能超过20个汉字'));
        const dup = projectStore.projects.find(
          p => p.mall_name === value.trim() && p.project_id !== form.value.project_id
        );
        if (dup) return callback(new Error(`商城名称「${value.trim()}」已被项目「${dup.name}」使用，请更换`));
        callback();
      },
      trigger: 'blur',
    },
  ],
}));

function openAdd() {
  editing.value = false;
  form.value = { sort: 0, status: 'active', tenant_id: 'tenant-001', store_count: 0, member_count: 0 };
  dialogVisible.value = true;
  setTimeout(() => formRef.value?.clearValidate(), 0);
}

function openEdit(row: Project) {
  editing.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
  setTimeout(() => formRef.value?.clearValidate(), 0);
}

// v3.1.48: Logo 图片上传（与运营后台一致）
function handleLogoChange(file: any) {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (form.value && e.target?.result) {
      form.value.logo = e.target.result as string;
    }
  };
  reader.readAsDataURL(file.raw);
}

async function save() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  // 保存时去除 mall_name 首尾空格
  if (form.value.mall_name) form.value.mall_name = form.value.mall_name.trim();
  if (editing.value && form.value.project_id) {
    projectStore.updateProject(form.value.project_id, form.value);
    ElMessage.success('修改成功');
  } else {
    projectStore.addProject({
      project_id: `proj-${Date.now()}`,
      tenant_id: form.value.tenant_id || 'tenant-001',
      name: form.value.name || '',
      logo: form.value.logo,
      mall_name: form.value.mall_name || '',
      category: form.value.category as any || 'daily',
      industry: form.value.industry as any,
      description: form.value.description || '',
      store_count: 0,
      member_count: 0,
      sort: form.value.sort || 0,
      status: form.value.status as any || 'active',
      created_at: new Date().toISOString(),
    });
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
}

function remove(row: Project) {
  ElMessageBox.confirm(`确定删除项目「${row.name}」吗？`, '提示', { type: 'warning' })
    .then(() => {
      projectStore.deleteProject(row.project_id);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
}

function goStores(row: Project) {
  router.push(`/tenant/projects/${row.project_id}/stores`);
}
</script>

<style scoped>
.project-manage { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; }
.toolbar { margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.proj-logo { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
.proj-logo-placeholder { font-size: 28px; }
.proj-name { font-weight: 600; color: #333; }
.proj-mall-name { color: #666; }
.status-warning-text { margin-top: 8px; font-size: 12px; color: #999; line-height: 1.6; }
/* v3.1.48: Logo 上传区域（与运营后台一致） */
.logo-upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e8e8e8;
}
.logo-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #ccc;
}
</style>
