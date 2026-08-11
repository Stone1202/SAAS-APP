<template>
  <!-- 租户后台-门店管理 /tenant/projects/:projectId/stores -->
  <div class="store-manage">
    <div class="page-header-bar">
      <h2 class="page-title">门店管理</h2>
      <span class="page-desc">管理项目「{{ project?.name }}」下的所有门店（提货点/销售点）</span>
      <el-button link type="primary" @click="goBack">‹ 返回项目列表</el-button>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="openAdd">+ 新增门店</el-button>
    </div>

    <el-table :data="stores" border stripe style="width: 100%">
      <el-table-column prop="store_id" label="门店ID" width="140" />
      <el-table-column label="封面" width="80">
        <template #default="{ row }">
          <img :src="row.cover_image" class="store-thumb" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="门店名称" min-width="140" />
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="row.type === 'pickup' ? 'info' : row.type === 'sales' ? 'warning' : 'success'">
            {{ typeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" min-width="200" />
      <el-table-column prop="business_hours" label="营业时间" width="140" />
      <el-table-column prop="distance" label="距离(km)" width="100" />
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑门店' : '新增门店'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="门店名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="门店类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="提货点" value="pickup" />
            <el-option label="销售点" value="sales" />
            <el-option label="提货+销售" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item label="门店地址">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="form.business_hours" placeholder="如 09:00-21:00" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="封面图URL">
          <el-input v-model="form.cover_image" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input-number v-model="form.longitude" :precision="4" :step="0.01" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input-number v-model="form.latitude" :precision="4" :step="0.01" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
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
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Store } from '../../contracts';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const projectId = computed(() => route.params.projectId as string);
const project = computed(() => projectStore.getProjectById(projectId.value));
const stores = computed(() => projectStore.storesByProject(projectId.value));

const dialogVisible = ref(false);
const editing = ref(false);
const form = ref<Partial<Store>>({});

function typeText(type: string) {
  const map: Record<string, string> = { pickup: '提货点', sales: '销售点', both: '提货+销售' };
  return map[type] || type;
}

function openAdd() {
  editing.value = false;
  form.value = { project_id: projectId.value, type: 'pickup', sort: 0, status: 'active' };
  dialogVisible.value = true;
}

function openEdit(row: Store) {
  editing.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
}

function save() {
  if (editing.value && form.value.store_id) {
    projectStore.updateStore(form.value.store_id, form.value);
    ElMessage.success('修改成功');
  } else {
    projectStore.addStore({
      store_id: `store-${Date.now()}`,
      project_id: projectId.value,
      name: form.value.name || '',
      type: form.value.type as any || 'pickup',
      address: form.value.address || '',
      business_hours: form.value.business_hours || '',
      phone: form.value.phone,
      longitude: form.value.longitude,
      latitude: form.value.latitude,
      cover_image: form.value.cover_image,
      distance: form.value.distance,
      sort: form.value.sort || 0,
      status: 'active',
      created_at: new Date().toISOString(),
    });
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
}

function remove(row: Store) {
  ElMessageBox.confirm(`确定删除门店「${row.name}」吗？`, '提示', { type: 'warning' })
    .then(() => {
      projectStore.deleteStore(row.store_id);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
}

function goBack() {
  router.push('/tenant/projects');
}
</script>

<style scoped>
.store-manage { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; margin-right: 12px; }
.toolbar { margin-bottom: 16px; }
.store-thumb { width: 56px; height: 40px; object-fit: cover; border-radius: 4px; }
</style>
