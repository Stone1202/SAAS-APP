<template>
  <!-- 运营后台-推荐管理 /admin/recommend -->
  <div class="recommend-manage">
    <div class="page-header-bar">
      <h2 class="page-title">推荐管理</h2>
      <span class="page-desc">配置APP平台首页推荐内容（项目/商品/直播）</span>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="openAdd">+ 新增推荐</el-button>
    </div>

    <el-table :data="items" border stripe style="width: 100%">
      <el-table-column prop="recommend_id" label="推荐ID" width="120" />
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <img v-if="row.image" :src="row.image" class="rec-thumb" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="140" />
      <el-table-column prop="subtitle" label="副标题" min-width="140" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ typeText(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="target_id" label="目标ID" width="140" />
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑推荐' : '新增推荐'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="商品" value="product" />
            <el-option label="项目" value="project" />
            <el-option label="门店" value="store" />
            <el-option label="直播" value="live" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="form.subtitle" />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="form.image" />
        </el-form-item>
        <el-form-item label="目标ID">
          <el-input v-model="form.target_id" placeholder="如商品ID/项目ID/直播ID" />
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
import type { RecommendItem } from '../../contracts';

const appConfigStore = useAppConfigStore();
const items = computed(() => appConfigStore.recommendItems);

const dialogVisible = ref(false);
const editing = ref(false);
const form = ref<Partial<RecommendItem>>({});

function typeText(type: string) {
  const map: Record<string, string> = { product: '商品', project: '项目', store: '门店', live: '直播', custom: '自定义' };
  return map[type] || type;
}

function openAdd() {
  editing.value = false;
  form.value = { type: 'product', sort: 0, status: 'enabled' };
  dialogVisible.value = true;
}

function openEdit(row: RecommendItem) {
  editing.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
}

function save() {
  if (editing.value && form.value.recommend_id) {
    appConfigStore.updateRecommend(form.value.recommend_id, form.value);
    ElMessage.success('修改成功');
  } else {
    appConfigStore.addRecommend({
      recommend_id: `rec-${Date.now()}`,
      type: form.value.type as any || 'product',
      title: form.value.title || '',
      subtitle: form.value.subtitle,
      image: form.value.image,
      target_id: form.value.target_id || '',
      sort: form.value.sort || 0,
      status: form.value.status as any || 'enabled',
      created_at: new Date().toISOString(),
    });
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
}

function remove(row: RecommendItem) {
  ElMessageBox.confirm(`确定删除推荐「${row.title}」吗？`, '提示', { type: 'warning' })
    .then(() => {
      appConfigStore.deleteRecommend(row.recommend_id);
      ElMessage.success('删除成功');
    })
    .catch(() => {});
}
</script>

<style scoped>
.recommend-manage { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; }
.toolbar { margin-bottom: 16px; }
.rec-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
</style>
