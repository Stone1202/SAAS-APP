<template>
  <!-- 租户后台-门店管理 /tenant/projects/:projectId/stores
       v3.1.30 新增：店长/店员（邀请人）管理Tab -->
  <div class="store-manage">
    <div class="page-header-bar">
      <h2 class="page-title">门店管理</h2>
      <span class="page-desc">管理项目「{{ project?.name }}」下的所有门店（提货点/销售点）</span>
      <el-button link type="primary" @click="goBack">‹ 返回项目列表</el-button>
    </div>

    <!-- Tab切换：门店列表 / 店长店员管理 -->
    <el-tabs v-model="activeTab" class="manage-tabs">
      <el-tab-pane label="门店列表" name="stores">
        <div class="toolbar">
          <el-input v-model="storeFilterKeyword" placeholder="搜索门店名称" clearable size="small" style="width:200px" @keyup.enter="applyStoreFilters" />
          <el-select v-model="storeFilterType" placeholder="门店类型" clearable size="small" style="width:120px">
            <el-option label="全部类型" value="" />
            <el-option label="提货点" value="pickup" />
            <el-option label="销售点" value="sales" />
            <el-option label="提货+销售" value="both" />
          </el-select>
          <el-button type="primary" size="small" @click="applyStoreFilters">筛选</el-button>
          <el-button size="small" @click="resetStoreFilters">重置</el-button>
          <el-button type="primary" @click="openAdd">+ 新增门店</el-button>
        </div>

        <el-table :data="filteredStores" border stripe style="width: 100%">
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
          <el-table-column prop="contact_name" label="联系人" width="100" />
          <el-table-column prop="phone" label="电话" width="120" />
          <el-table-column prop="distance" label="距离(km)" width="100" />
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="店长/店员管理（邀请人）" name="inviters">
        <el-alert type="info" :closable="false" show-icon style="margin-bottom:12px">
          店长/店员即邀请人，用户通过邀请人加入门店所属项目。一个邀请人绑定一个门店，用户在该项目下只能绑定1个门店。
        </el-alert>

        <div class="toolbar">
          <el-select v-model="inviterStoreFilter" placeholder="筛选门店" clearable size="default" style="width:200px; margin-right:12px">
            <el-option v-for="s in stores" :key="s.store_id" :label="s.name" :value="s.store_id" />
          </el-select>
          <el-button type="primary" size="small" style="margin-right:8px" @click="applyInviterFilters">筛选</el-button>
          <el-button size="small" style="margin-right:8px" @click="resetInviterFilters">重置</el-button>
          <el-button type="primary" @click="openAddInviter" :disabled="!stores.length">+ 新增邀请人</el-button>
        </div>

        <el-table :data="filteredInviters" border stripe style="width: 100%">
          <el-table-column prop="inviter_id" label="邀请人ID" width="120" />
          <el-table-column label="姓名" width="120">
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="所属门店" min-width="140">
            <template #default="{ row }">{{ storeName(row.store_id) }}</template>
          </el-table-column>
          <el-table-column label="角色" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="row.role === 'manager' ? 'danger' : 'info'">
                {{ row.role === 'manager' ? '店长' : '店员' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="invited_count" label="已邀请用户" width="110" align="center" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEditInviter(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="removeInviter(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 门店编辑弹窗 -->
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
        <el-form-item label="联系人">
          <el-input v-model="form.contact_name" />
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

    <!-- 邀请人编辑弹窗 -->
    <el-dialog v-model="inviterDialogVisible" :title="inviterEditing ? '编辑邀请人' : '新增邀请人'" width="480px">
      <el-form :model="inviterForm" label-width="90px">
        <el-form-item label="所属门店" required>
          <el-select v-model="inviterForm.store_id" style="width: 100%" placeholder="选择门店">
            <el-option v-for="s in stores" :key="s.store_id" :label="s.name" :value="s.store_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="inviterForm.name" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="inviterForm.role" style="width: 100%">
            <el-option label="店长" value="manager" />
            <el-option label="店员" value="staff" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="inviterForm.phone" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="inviterForm.status" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInviter">保存</el-button>
      </template>
    </el-dialog>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Store, Inviter } from '../../contracts';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

// 用例卡（Tab感知：门店列表Tab + 店长/店员Tab 两个UC都展示）
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-TNT-PC-002', '门店管理', () => activeTab.value);

const projectId = computed(() => route.params.projectId as string);
const project = computed(() => projectStore.getProjectById(projectId.value));
const stores = computed(() => projectStore.storesByProject(projectId.value));

// Tab切换
const activeTab = ref('stores');

// ============================================
// 门店管理
// ============================================
const dialogVisible = ref(false);
const editing = ref(false);
const form = ref<Partial<Store>>({});

// v3.1.44: 门店列表筛选
const storeFilterKeyword = ref('');
const storeFilterType = ref('');
const _storeKeyword = ref('');
const _storeType = ref('');
const filteredStores = computed(() => {
  let list = stores.value;
  if (_storeKeyword.value) {
    const kw = _storeKeyword.value.toLowerCase();
    list = list.filter(s => s.name.toLowerCase().includes(kw) || (s.address || '').toLowerCase().includes(kw));
  }
  if (_storeType.value) list = list.filter(s => s.type === _storeType.value);
  return list;
});

function applyStoreFilters() {
  _storeKeyword.value = storeFilterKeyword.value;
  _storeType.value = storeFilterType.value;
}
function resetStoreFilters() {
  storeFilterKeyword.value = '';
  storeFilterType.value = '';
  _storeKeyword.value = '';
  _storeType.value = '';
}

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
      contact_name: form.value.contact_name,
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

// ============================================
// 店长/店员管理（邀请人）v3.1.30 新增
// ============================================
const inviterStoreFilter = ref<string>('');
// v3.1.44: 邀请人筛选工作副本
const _inviterStore = ref<string>('');
const inviters = computed(() => projectStore.invitersByProject(projectId.value));
const filteredInviters = computed(() => {
  if (!_inviterStore.value) return inviters.value;
  return inviters.value.filter(i => i.store_id === _inviterStore.value);
});

// v3.1.44: 邀请人筛选/重置
function applyInviterFilters() {
  _inviterStore.value = inviterStoreFilter.value;
}
function resetInviterFilters() {
  inviterStoreFilter.value = '';
  _inviterStore.value = '';
}

const inviterDialogVisible = ref(false);
const inviterEditing = ref(false);
const inviterForm = ref<Partial<Inviter>>({});

function storeName(storeId: string) {
  return projectStore.getStoreById(storeId)?.name || '（门店不存在）';
}

function openAddInviter() {
  inviterEditing.value = false;
  inviterForm.value = {
    project_id: projectId.value,
    store_id: stores.value[0]?.store_id,
    role: 'staff',
    status: 'active',
    invited_count: 0,
  };
  inviterDialogVisible.value = true;
}

function openEditInviter(row: Inviter) {
  inviterEditing.value = true;
  inviterForm.value = { ...row };
  inviterDialogVisible.value = true;
}

function saveInviter() {
  if (!inviterForm.value.store_id) {
    ElMessage.warning('请选择所属门店');
    return;
  }
  if (!inviterForm.value.name) {
    ElMessage.warning('请输入姓名');
    return;
  }
  const nowIso = new Date().toISOString();
  if (inviterEditing.value && inviterForm.value.inviter_id) {
    projectStore.updateInviter(inviterForm.value.inviter_id, {
      ...inviterForm.value,
      updated_by: '租户管理员',
      updated_at: nowIso,
    });
    ElMessage.success('修改成功');
  } else {
    projectStore.addInviter({
      inviter_id: `inv-${Date.now()}`,
      store_id: inviterForm.value.store_id,
      project_id: projectId.value,
      name: inviterForm.value.name,
      phone: inviterForm.value.phone,
      role: (inviterForm.value.role as any) || 'staff',
      status: (inviterForm.value.status as any) || 'active',
      invited_count: 0,
      created_at: nowIso,
      updated_by: '租户管理员',
      updated_at: nowIso,
    });
    ElMessage.success('新增成功');
  }
  inviterDialogVisible.value = false;
}

function removeInviter(row: Inviter) {
  ElMessageBox.confirm(`确定删除邀请人「${row.name}」吗？已绑定该邀请人的用户不受影响。`, '提示', { type: 'warning' })
    .then(() => {
      projectStore.deleteInviter(row.inviter_id);
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
.manage-tabs { margin-top: 8px; }
.toolbar { margin-bottom: 16px; display: flex; align-items: center; }
.store-thumb { width: 56px; height: 40px; object-fit: cover; border-radius: 4px; }
</style>
