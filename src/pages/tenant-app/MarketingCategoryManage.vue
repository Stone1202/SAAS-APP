<template>
  <!-- 营销分类管理 — FN-TNT-PC-004 -->
  <div class="category-manage">
    <div class="cm-header">
      <h2>营销分类管理</h2>
      <p class="cm-desc">管理当前项目的商品营销分类，用于项目商城页的分类展示</p>
      <button class="cm-add-btn" @click="startAdd">+ 新增分类</button>
    </div>

    <div class="cm-list">
      <table class="cm-table">
        <thead>
          <tr>
            <th>排序</th>
            <th>分类名称</th>
            <th>图标</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in sortedCategories" :key="cat.category_id">
            <td>{{ cat.sort_order }}</td>
            <td>{{ cat.name }}</td>
            <td>{{ cat.icon || '-' }}</td>
            <td>
              <span :class="['cm-status', cat.status]">{{ cat.status === 'active' ? '启用' : '禁用' }}</span>
            </td>
            <td>
              <button class="cm-btn cm-edit" @click="startEdit(cat)">编辑</button>
              <button class="cm-btn cm-del" @click="deleteCategory(cat.category_id)">删除</button>
            </td>
          </tr>
          <tr v-if="!sortedCategories.length">
            <td colspan="5" class="cm-empty-row">暂无分类，请点击「新增分类」</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 弹窗 -->
    <div class="cm-modal" v-if="showForm">
      <div class="cmm-mask" @click="closeForm"></div>
      <div class="cmm-dialog">
        <h3>{{ editingId ? '编辑分类' : '新增分类' }}</h3>
        <div class="cmm-field">
          <label>分类名称</label>
          <input v-model="form.name" maxlength="10" placeholder="如：限时秒杀/新品首发" />
        </div>
        <div class="cmm-field">
          <label>图标（Emoji）</label>
          <input v-model="form.icon" maxlength="6" placeholder="如：⚡🆕🔥" />
        </div>
        <div class="cmm-field">
          <label>排序（数字越小越靠前）</label>
          <input v-model.number="form.sort_order" type="number" />
        </div>
        <div class="cmm-field">
          <label>状态</label>
          <select v-model="form.status">
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>
        </div>
        <div class="cmm-actions">
          <button class="cm-btn cm-cancel" @click="closeForm">取消</button>
          <button class="cm-btn cm-save" @click="saveCategory">保存</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-TNT-PC-004', '营销分类管理');
import { ref, reactive, computed } from 'vue';
import type { MarketingCategory } from '@/contracts';

// Mock数据 — 实际应从store读取并按project_id过滤
const categories = ref<MarketingCategory[]>([
  {
    category_id: 'cat-001',
    project_id: 'proj-daily-01',
    name: '限时秒杀',
    icon: '⚡',
    sort_order: 1,
    status: 'active',
    created_at: '2024-05-01T00:00:00Z',
  },
  {
    category_id: 'cat-002',
    project_id: 'proj-daily-01',
    name: '新品首发',
    icon: '🆕',
    sort_order: 2,
    status: 'active',
    created_at: '2024-05-01T00:00:00Z',
  },
  {
    category_id: 'cat-003',
    project_id: 'proj-daily-01',
    name: '热卖排行',
    icon: '🔥',
    sort_order: 3,
    status: 'active',
    created_at: '2024-05-01T00:00:00Z',
  },
]);

const sortedCategories = computed(() =>
  [...categories.value].sort((a, b) => a.sort_order - b.sort_order)
);

const showForm = ref(false);
const editingId = ref('');
const form = reactive({
  name: '',
  icon: '',
  sort_order: 0,
  status: 'active' as 'active' | 'inactive',
});

function startAdd() {
  editingId.value = '';
  form.name = '';
  form.icon = '';
  form.sort_order = categories.value.length + 1;
  form.status = 'active';
  showForm.value = true;
}

function startEdit(cat: MarketingCategory) {
  editingId.value = cat.category_id;
  form.name = cat.name;
  form.icon = cat.icon || '';
  form.sort_order = cat.sort_order;
  form.status = cat.status;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

function saveCategory() {
  if (!form.name.trim()) {
    alert('请输入分类名称');
    return;
  }
  const now = new Date().toISOString();
  if (editingId.value) {
    const idx = categories.value.findIndex((c: MarketingCategory) => c.category_id === editingId.value);
    if (idx >= 0) {
      Object.assign(categories.value[idx], {
        name: form.name,
        icon: form.icon,
        sort_order: form.sort_order,
        status: form.status,
      });
    }
  } else {
    categories.value.push({
      category_id: `cat-${Date.now()}`,
      project_id: 'proj-daily-01',
      name: form.name,
      icon: form.icon,
      sort_order: form.sort_order,
      status: form.status,
      created_at: now,
    });
  }
  showForm.value = false;
}

function deleteCategory(id: string) {
  if (confirm('确定删除该分类？删除后相关商品将归入未分类')) {
    categories.value = categories.value.filter((c: MarketingCategory) => c.category_id !== id);
  }
}
</script>

<style scoped>
.category-manage {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.cm-header {
  margin-bottom: 20px;
}
.cm-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1a1a1a;
}
.cm-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #666;
}
.cm-add-btn {
  padding: 8px 20px;
  background: #FF6B35;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.cm-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.cm-table th {
  padding: 12px 16px;
  background: #fafafa;
  font-size: 13px;
  color: #666;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}
.cm-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
}
.cm-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.cm-status.active {
  background: #f0fff0;
  color: #52c41a;
}
.cm-status.inactive {
  background: #fff0f0;
  color: #f5222d;
}
.cm-btn {
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  margin-right: 6px;
}
.cm-btn:hover { border-color: #FF6B35; color: #FF6B35; }
.cm-empty-row {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

/* 弹窗 */
.cm-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cmm-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
}
.cmm-dialog {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 420px;
  max-width: 90vw;
  z-index: 1;
}
.cmm-dialog h3 {
  margin: 0 0 20px;
  font-size: 18px;
}
.cmm-field {
  margin-bottom: 16px;
}
.cmm-field label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}
.cmm-field input, .cmm-field select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}
.cmm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.cm-cancel { border-color: #ddd; }
.cm-save {
  background: #FF6B35;
  color: #fff;
  border-color: #FF6B35;
}
</style>
