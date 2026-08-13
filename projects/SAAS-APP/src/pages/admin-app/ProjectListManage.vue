<template>
  <!-- 运营后台-项目列表管理 /admin/projects（v3.1.46 精简+新增商城名称列+去掉品类/门店数/会员数+logo上传+核心字段只读 | v3.1.50 回退v3.1.49错误变更：恢复项目名称/所属租户/行业 disabled | v3.1.51 商城名称校验：全局唯一+不超过20汉字） -->
  <div class="project-list-manage">
    <div class="page-header-bar">
      <h2 class="page-title">项目列表</h2>
      <span class="page-desc">管理平台下所有项目（独立销售单元），支持查看/编辑/启用/禁用</span>
    </div>

    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索项目名称/ID"
        style="width: 240px"
        clearable
        :prefix-icon="Search"
        @keyup.enter="applyProjectFilters"
      />
      <el-select v-model="filterStatus" placeholder="全部状态" style="width: 140px" clearable>
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="inactive" />
      </el-select>
      <el-select v-model="filterTenant" placeholder="全部租户" style="width: 160px" clearable>
        <el-option
          v-for="t in projectStore.tenants"
          :key="t.tenant_id"
          :label="t.name"
          :value="t.tenant_id"
        />
      </el-select>
      <el-button type="primary" size="small" @click="applyProjectFilters">筛选</el-button>
      <el-button size="small" @click="resetProjectFilters">重置</el-button>
    </div>

    <el-table :data="pagedProjects" border stripe style="width: 100%">
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
      <el-table-column label="所属租户" width="140">
        <template #default="{ row }">
          {{ getTenantName(row.tenant_id) }}
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
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'active'"
            link type="warning" size="small"
            @click="toggleStatus(row, 'inactive')"
          >禁用</el-button>
          <el-button
            v-else
            link type="success" size="small"
            @click="toggleStatus(row, 'active')"
          >启用</el-button>
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredProjects.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        background
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑项目" width="560px">
      <el-form :model="form" label-width="90px" ref="formRef" :rules="formRules">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" disabled />
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
          <el-select v-model="form.industry" style="width: 100%" disabled>
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

    <!-- 禁用原因弹窗 -->
    <el-dialog v-model="disableDialogVisible" title="禁用项目" width="460px">
      <el-form label-width="80px">
        <el-form-item label="项目名称">
          <span>{{ disableTarget?.name }}</span>
        </el-form-item>
        <el-form-item label="禁用原因">
          <el-input
            v-model="disableReason"
            type="textarea"
            :rows="3"
            placeholder="请输入禁用原因（可选，将记录到项目信息中）"
          />
        </el-form-item>
      </el-form>
      <div class="disable-tip">
        <el-alert type="warning" :closable="false" show-icon>
          <template #title>
            项目禁用后，该项目下的所有商品/直播将从平台商城/推荐/搜索结果中隐藏，用户无法进入项目、查看详情或下单，但历史订单的售后权利不受影响。
          </template>
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="disableDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmDisable">确认禁用</el-button>
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-OPS-PC-006', '项目列表');
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import type { Project } from '../../contracts';

const projectStore = useProjectStore();
const router = useRouter();

// 行业标签映射
const INDUSTRY_LABELS: Record<string, string> = {
  daily_necessities: '日用品',
  health_products: '保健品',
  food_beverage: '食品饮料',
  home_appliance: '家居家电',
  beauty_care: '美妆个护',
};

// 搜索与筛选
const searchKeyword = ref('');
const filterStatus = ref<string | undefined>(undefined);
const filterTenant = ref<string | undefined>(undefined);
// v3.1.44: 筛选工作副本
const _keyword = ref('');
const _status = ref<string | undefined>(undefined);
const _tenant = ref<string | undefined>(undefined);

const filteredProjects = computed(() => {
  let list = projectStore.projects;
  if (_keyword.value) {
    const q = _keyword.value.toLowerCase();
    list = list.filter(p =>
      p.name?.toLowerCase().includes(q) || p.project_id.toLowerCase().includes(q)
    );
  }
  if (_status.value) {
    list = list.filter(p => p.status === _status.value);
  }
  if (_tenant.value) {
    list = list.filter(p => p.tenant_id === _tenant.value);
  }
  return list;
});

// v3.1.44: 筛选/重置
function applyProjectFilters() {
  _keyword.value = searchKeyword.value;
  _status.value = filterStatus.value;
  _tenant.value = filterTenant.value;
  currentPage.value = 1;
}
function resetProjectFilters() {
  searchKeyword.value = '';
  filterStatus.value = undefined;
  filterTenant.value = undefined;
  _keyword.value = '';
  _status.value = undefined;
  _tenant.value = undefined;
  currentPage.value = 1;
}

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const pagedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredProjects.value.slice(start, start + pageSize.value);
});

// 获取租户名称
function getTenantName(tenantId: string): string {
  return projectStore.tenants.find(t => t.tenant_id === tenantId)?.name || tenantId;
}

// 编辑弹窗
const dialogVisible = ref(false);
const formRef = ref();
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

function openEdit(row: Project) {
  form.value = { ...row };
  dialogVisible.value = true;
  // 打开弹窗时清除上一次校验状态
  setTimeout(() => formRef.value?.clearValidate(), 0);
}

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
  if (form.value.project_id) {
    // 保存时去除 mall_name 首尾空格
    if (form.value.mall_name) form.value.mall_name = form.value.mall_name.trim();
    projectStore.updateProject(form.value.project_id, form.value);
    ElMessage.success('修改成功');
  }
  dialogVisible.value = false;
}

// 禁用/启用切换
const disableDialogVisible = ref(false);
const disableTarget = ref<Project | null>(null);
const disableReason = ref('');

function toggleStatus(row: Project, newStatus: 'active' | 'inactive') {
  if (newStatus === 'inactive') {
    // 禁用前确认原因
    disableTarget.value = row;
    disableReason.value = '';
    disableDialogVisible.value = true;
  } else {
    // 启用直接切换
    projectStore.updateProject(row.project_id, { status: 'active' });
    ElMessage.success(`项目「${row.name}」已启用`);
  }
}

function confirmDisable() {
  if (!disableTarget.value) return;
  projectStore.updateProject(disableTarget.value.project_id, {
    status: 'inactive',
    description: disableReason.value
      ? `${disableTarget.value.description || ''} [禁用原因：${disableReason.value}]`.trim()
      : disableTarget.value.description,
  });
  ElMessage.success(`项目「${disableTarget.value.name}」已停用，该项目的商品/直播将从平台隐藏`);
  disableDialogVisible.value = false;
  disableTarget.value = null;
  disableReason.value = '';
}

</script>

<style scoped>
.project-list-manage { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; }
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}
.proj-logo { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
.proj-logo-placeholder { font-size: 28px; }
.proj-name-cell { display: flex; flex-direction: column; gap: 2px; }
.proj-name { font-weight: 600; color: #333; }
.proj-mall-name { color: #666; }
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.disable-tip { margin-top: 12px; }
.status-warning-text { margin-top: 8px; font-size: 12px; color: #999; line-height: 1.6; }
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
