<template>
  <!-- 运营后台-楼层管理 /admin/floor -->
  <div class="floor-manage">
    <div class="page-header-bar">
      <h2 class="page-title">楼层管理</h2>
      <span class="page-desc">配置APP平台首页运营楼层（秒杀/推荐/直播等）</span>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="openAdd">+ 新增楼层</el-button>
    </div>

    <el-table :data="floors" border stripe style="width: 100%">
      <el-table-column prop="floor_id" label="楼层ID" width="120" />
      <el-table-column prop="title" label="楼层标题" min-width="140" />
      <el-table-column prop="subtitle" label="副标题" min-width="140" />
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ floorTypeText(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="位置" width="120">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ positionText(row.position) }}</el-tag>
        </template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑楼层' : '新增楼层'" width="640px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="楼层标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="form.subtitle" />
        </el-form-item>
        <el-form-item label="楼层类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="Banner" value="banner" />
            <el-option label="网格" value="grid" />
            <el-option label="商品列表" value="product_list" />
            <el-option label="直播列表" value="live_list" />
            <el-option label="富文本" value="rich_text" />
            <el-option label="图片" value="image" />
          </el-select>
        </el-form-item>
        <el-form-item label="投放位置">
          <el-select v-model="form.position" style="width: 100%">
            <el-option label="平台首页" value="platform_home" />
            <el-option label="商城顶部" value="mall_top" />
            <el-option label="项目首页" value="project_home" />
          </el-select>
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
import type { Floor, AdPosition } from '../../contracts';

const appConfigStore = useAppConfigStore();
const floors = computed(() => appConfigStore.floors);

const dialogVisible = ref(false);
const editing = ref(false);
const form = ref<Partial<Floor>>({});

function floorTypeText(type: string) {
  const map: Record<string, string> = { banner: 'Banner', grid: '网格', product_list: '商品列表', live_list: '直播列表', rich_text: '富文本', image: '图片' };
  return map[type] || type;
}
function positionText(pos: AdPosition) {
  const map: Record<string, string> = { platform_home: '平台首页', mall_top: '商城顶部', project_home: '项目首页' };
  return map[pos] || pos;
}

function openAdd() {
  editing.value = false;
  form.value = { type: 'product_list', position: 'platform_home', sort: 0, status: 'enabled' };
  dialogVisible.value = true;
}

function openEdit(row: Floor) {
  editing.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
}

function save() {
  if (editing.value && form.value.floor_id) {
    appConfigStore.updateFloor(form.value.floor_id, form.value);
    ElMessage.success('修改成功');
  } else {
    appConfigStore.addFloor({
      floor_id: `floor-${Date.now()}`,
      title: form.value.title || '',
      subtitle: form.value.subtitle,
      type: form.value.type as any || 'product_list',
      position: form.value.position as AdPosition || 'platform_home',
      items: [],
      sort: form.value.sort || 0,
      status: form.value.status as any || 'enabled',
      created_at: new Date().toISOString(),
    });
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
}

function remove(row: Floor) {
  ElMessageBox.confirm(`确定删除楼层「${row.title}」吗？`, '提示', { type: 'warning' })
    .then(() => {
      appConfigStore.deleteFloor(row.floor_id);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
}
</script>

<style scoped>
.floor-manage { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; }
.toolbar { margin-bottom: 16px; }
</style>
