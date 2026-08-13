<template>
  <!-- 运营后台-金刚区管理 /admin/kingkong -->
  <div class="kingkong-manage">
    <div class="page-header-bar">
      <h2 class="page-title">金刚区管理</h2>
      <span class="page-desc">配置APP平台首页金刚区快捷入口</span>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="openAdd">+ 新增入口</el-button>
    </div>

    <el-table :data="entries" border stripe style="width: 100%">
      <el-table-column prop="entry_id" label="入口ID" width="120" />
      <el-table-column label="图标" width="80" align="center">
        <template #default="{ row }">
          <span style="font-size: 24px">{{ row.icon }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="入口名称" width="140" />
      <el-table-column label="跳转类型" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ linkTypeText(row.link_type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="link_value" label="跳转目标" min-width="140" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑入口' : '新增入口'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="入口名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="emoji或图片URL" />
        </el-form-item>
        <el-form-item label="跳转类型">
          <el-select v-model="form.link_type" style="width: 100%">
            <el-option label="项目" value="project" />
            <el-option label="门店" value="store" />
            <el-option label="页面" value="page" />
            <el-option label="URL" value="url" />
            <el-option label="分类" value="category" />
          </el-select>
        </el-form-item>
        <el-form-item label="跳转目标">
          <el-input v-model="form.link_value" placeholder="如项目ID或页面路径" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
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
import { useAppConfigStore } from '../../stores/app-config-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { KingKongEntry } from '../../contracts';

const appConfigStore = useAppConfigStore();
const entries = computed(() => appConfigStore.kingKongEntries);

const dialogVisible = ref(false);
const editing = ref(false);
const form = ref<Partial<KingKongEntry>>({});

function linkTypeText(type: string) {
  const map: Record<string, string> = { project: '项目', store: '门店', page: '页面', url: 'URL', category: '分类' };
  return map[type] || type;
}

function openAdd() {
  editing.value = false;
  form.value = { link_type: 'page', sort: 0, status: 'enabled' };
  dialogVisible.value = true;
}

function openEdit(row: KingKongEntry) {
  editing.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
}

function save() {
  if (editing.value && form.value.entry_id) {
    appConfigStore.updateKingKong(form.value.entry_id, form.value);
    ElMessage.success('修改成功');
  } else {
    appConfigStore.addKingKong({
      entry_id: `kk-${Date.now()}`,
      name: form.value.name || '',
      icon: form.value.icon || '',
      link_type: form.value.link_type as any || 'page',
      link_value: form.value.link_value || '',
      sort: form.value.sort || 0,
      status: form.value.status as any || 'enabled',
      created_at: new Date().toISOString(),
    });
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
}

function remove(row: KingKongEntry) {
  ElMessageBox.confirm(`确定删除入口「${row.name}」吗？`, '提示', { type: 'warning' })
    .then(() => {
      appConfigStore.deleteKingKong(row.entry_id);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
}
</script>

<style scoped>
.kingkong-manage { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; }
.toolbar { margin-bottom: 16px; }
</style>
