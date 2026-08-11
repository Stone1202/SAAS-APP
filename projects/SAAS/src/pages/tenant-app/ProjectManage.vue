<template>
  <!-- 租户后台-项目管理 /tenant/projects -->
  <div class="project-manage">
    <div class="page-header-bar">
      <h2 class="page-title">项目管理</h2>
      <span class="page-desc">管理租户下的所有项目（独立销售单元）及其门店</span>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="openAdd">+ 新增项目</el-button>
    </div>

    <el-table :data="projects" border stripe style="width: 100%">
      <el-table-column prop="project_id" label="项目ID" width="140" />
      <el-table-column label="项目Logo" width="80" align="center">
        <template #default="{ row }">
          <img :src="row.logo" class="proj-logo" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="项目名称" min-width="140" />
      <el-table-column label="品类" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="row.category === 'daily' ? '' : 'success'">
            {{ row.category === 'daily' ? '日用百货' : '健康保健' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="store_count" label="门店数" width="80" />
      <el-table-column prop="member_count" label="会员数" width="100" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '运营中' : '已停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="goStores(row)">门店管理</el-button>
          <el-button link type="primary" size="small" @click="goConfig(row)">首页配置</el-button>
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑项目' : '新增项目'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="项目品类">
          <el-select v-model="form.category" style="width: 100%">
            <el-option label="日用百货" value="daily" />
            <el-option label="健康保健" value="health" />
          </el-select>
        </el-form-item>
        <el-form-item label="Logo URL">
          <el-input v-model="form.logo" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">运营中</el-radio>
            <el-radio value="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Project } from '../../contracts';

const projectStore = useProjectStore();
const router = useRouter();
const projects = computed(() => projectStore.projects);

const dialogVisible = ref(false);
const editing = ref(false);
const form = ref<Partial<Project>>({});

function openAdd() {
  editing.value = false;
  form.value = { category: 'daily', sort: 0, status: 'active', tenant_id: 'tenant-001', store_count: 0, member_count: 0 };
  dialogVisible.value = true;
}

function openEdit(row: Project) {
  editing.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
}

function save() {
  if (editing.value && form.value.project_id) {
    projectStore.updateProject(form.value.project_id, form.value);
    ElMessage.success('修改成功');
  } else {
    projectStore.addProject({
      project_id: `proj-${Date.now()}`,
      tenant_id: form.value.tenant_id || 'tenant-001',
      name: form.value.name || '',
      logo: form.value.logo,
      category: form.value.category as any || 'daily',
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
function goConfig(row: Project) {
  router.push(`/tenant/projects/${row.project_id}/home-config`);
}
</script>

<style scoped>
.project-manage { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; }
.toolbar { margin-bottom: 16px; }
.proj-logo { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
</style>
