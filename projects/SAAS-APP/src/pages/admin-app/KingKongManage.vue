<template>
  <!-- 运营后台-金刚区管理 /admin/kingkong -->
  <div class="kingkong-manage">
    <div class="page-header-bar">
      <h2 class="page-title">金刚区管理</h2>
      <span class="page-desc">配置APP平台首页金刚区快捷入口</span>
    </div>

    <div class="toolbar">
      <el-input v-model="kkFilterKeyword" placeholder="搜索入口名称" clearable size="small" style="width:200px" @keyup.enter="applyKkFilters" />
      <el-select v-model="kkFilterJumpType" placeholder="跳转类型" clearable size="small" style="width:120px">
        <el-option label="全部类型" value="" />
        <el-option label="商品" value="product" />
        <el-option label="项目" value="project" />
        <el-option label="直播" value="live" />
        <el-option label="功能页面" value="function_page" />
        <el-option label="URL(旧)" value="url" />
      </el-select>
      <el-select v-model="kkFilterStatus" placeholder="状态筛选" clearable size="small" style="width:120px">
        <el-option label="全部状态" value="" />
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" size="small" @click="applyKkFilters">筛选</el-button>
      <el-button size="small" @click="resetKkFilters">重置</el-button>
      <el-button type="primary" @click="openAdd">+ 新增入口</el-button>
    </div>

    <el-table :data="pagedEntries" border stripe style="width: 100%">
      <template #empty>
        <el-empty description="暂无匹配的金刚区入口" :image-size="60" />
      </template>
      <el-table-column prop="entry_id" label="入口ID" width="120" />
      <el-table-column label="图标" width="80" align="center">
        <template #default="{ row }">
          <span style="font-size: 24px">{{ row.icon }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="入口名称" width="140" />
      <el-table-column label="跳转类型" width="100">
        <template #default="{ row }">
          <el-tag :type="jumpTypeTag(row.jump_type)" size="small">{{ jumpTypeLabel(row.jump_type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="jump_id" label="跳转目标" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          {{ formatJumpTarget(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-value="active" inactive-value="disabled" size="small" @change="onStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="updated_by" label="修改人" width="100" show-overflow-tooltip />
      <el-table-column label="修改时间" width="160">
        <template #default="{ row }">
          <span style="font-size:11px">{{ formatDateTime(row.updated_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- v3.1.42: 分页 -->
    <el-pagination
      v-if="filteredKkEntries.length > kkPageSize"
      v-model:current-page="kkCurrentPage"
      :page-size="kkPageSize"
      :total="filteredKkEntries.length"
      layout="total, prev, pager, next"
      small
      style="margin-top:12px; justify-content:flex-end;"
    />

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑入口' : '新增入口'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="入口名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="emoji或图片URL" />
        </el-form-item>
        <el-form-item label="渐变色">
          <el-input v-model="form.gradient" placeholder="如: linear-gradient(135deg, #FF6B6B, #EE5A24)" />
        </el-form-item>
        <JumpTargetPicker
          v-model:jump-type="form.jump_type"
          v-model:jump-id="form.jump_id"
          v-model:project-id="form.project_id"
        />
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

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-OPS-PC-003', '金刚区管理');
import { ref, computed, reactive } from 'vue';
import { useAppConfigStore } from '../../stores/app-config-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import JumpTargetPicker from '../../components/admin/JumpTargetPicker.vue';

const store = useAppConfigStore();
const entries = computed(() => store.kingKongs);

// v3.1.42: 金刚区筛选
const kkFilterKeyword = ref('');
const kkFilterJumpType = ref('');
const kkFilterStatus = ref('');
// v3.1.44: 筛选工作副本
const _kkKeyword = ref('');
const _kkJumpType = ref('');
const _kkStatus = ref('');
const filteredKkEntries = computed(() => {
  let result = entries.value;
  if (_kkKeyword.value) {
    const kw = _kkKeyword.value.toLowerCase();
    result = result.filter(r => (r.name || '').toLowerCase().includes(kw));
  }
  if (_kkJumpType.value) result = result.filter(r => r.jump_type === _kkJumpType.value);
  if (_kkStatus.value) result = result.filter(r => r.status === _kkStatus.value);
  return result;
});

// v3.1.44: 筛选/重置
function applyKkFilters() {
  _kkKeyword.value = kkFilterKeyword.value;
  _kkJumpType.value = kkFilterJumpType.value;
  _kkStatus.value = kkFilterStatus.value;
  kkCurrentPage.value = 1;
}
function resetKkFilters() {
  kkFilterKeyword.value = '';
  kkFilterJumpType.value = '';
  kkFilterStatus.value = '';
  _kkKeyword.value = '';
  _kkJumpType.value = '';
  _kkStatus.value = '';
  kkCurrentPage.value = 1;
}

// v3.1.42: 分页
const kkCurrentPage = ref(1);
const kkPageSize = 10;
const pagedEntries = computed(() => {
  const start = (kkCurrentPage.value - 1) * kkPageSize;
  return filteredKkEntries.value.slice(start, start + kkPageSize);
});

// 当前操作人（mock）
const CURRENT_OPERATOR = '运营管理员';

/** 格式化日期时间显示 */
function formatDateTime(dt?: string): string {
  if (!dt) return '-';
  if (dt.includes('T')) {
    return dt.replace('T', ' ').replace(/\.\d+Z?$/, '');
  }
  return dt;
}

/** 获取当前时间字符串 */
function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const dialogVisible = ref(false);
const editing = ref(false);

const form = reactive({
  entry_id: '',
  name: '',
  icon: '',
  gradient: '',
  // v3.1.45: 默认从 'url' 改为 'function_page'（url 已废弃）
  jump_type: 'function_page' as string,
  jump_id: '',
  project_id: '',
  sort: 0,
});

function jumpTypeTag(t: string) {
  // v3.1.45: 新增 function_page 分支
  if (t === 'function_page') return 'primary';
  return t === 'product' ? 'warning' : t === 'project' ? 'success' : t === 'live' ? 'danger' : 'info';
}
function jumpTypeLabel(t: string) {
  // v3.1.45: 新增 function_page 分支
  if (t === 'function_page') return '功能页面';
  return t === 'product' ? '商品' : t === 'project' ? '项目' : t === 'live' ? '直播' : 'URL';
}

/** 格式化跳转目标显示 */
function formatJumpTarget(row: any): string {
  if (!row.jump_id) return '-';
  if (row.jump_type === 'url') return row.jump_id;
  return row.jump_id;
}

function openAdd() {
  editing.value = false;
  // v3.1.45: 默认 jump_type 从 'url' 改为 'function_page'
  Object.assign(form, { entry_id: '', name: '', icon: '', gradient: '', jump_type: 'function_page', jump_id: '', project_id: '', sort: 0 });
  dialogVisible.value = true;
}

function openEdit(row: any) {
  editing.value = true;
  Object.assign(form, {
    entry_id: row.entry_id,
    name: row.name || '',
    icon: row.icon || '',
    gradient: row.gradient || '',
    // v3.1.45: 旧 url 数据回退为 function_page（url 已废弃）
    jump_type: row.jump_type === 'url' ? 'function_page' : (row.jump_type || 'function_page'),
    jump_id: row.jump_id || '',
    project_id: row.project_id || '',
    sort: row.sort || 0,
  });
  dialogVisible.value = true;
}

function save() {
  if (!form.name) { ElMessage.warning('请输入入口名称'); return; }
  if (!form.icon) { ElMessage.warning('请输入图标'); return; }
  if (form.jump_type === 'product' && !form.jump_id) { ElMessage.warning('请选择商品'); return; }
  if (form.jump_type === 'project' && !form.jump_id) { ElMessage.warning('请选择项目'); return; }
  if (form.jump_type === 'live' && !form.jump_id) { ElMessage.warning('请选择直播'); return; }
  // v3.1.45: 补全 function_page 验证
  if (form.jump_type === 'function_page' && !form.jump_id) { ElMessage.warning('请选择功能页面'); return; }
  if (form.jump_type === 'url' && !form.jump_id) { ElMessage.warning('请填写URL路径'); return; }

  // v3.1.45: link 字段自动计算（修复 B1：link 不再被清空为空字符串）
  const link = store.syncLinkFromJump(form.jump_type, form.jump_id, form.project_id);

  if (editing.value && form.entry_id) {
    const idx = store.kingKongs.findIndex(k => k.entry_id === form.entry_id);
    if (idx >= 0) {
      Object.assign(store.kingKongs[idx], {
        name: form.name,
        icon: form.icon,
        gradient: form.gradient,
        jump_type: form.jump_type,
        jump_id: form.jump_id,
        project_id: form.project_id,
        sort: form.sort,
        sort_order: form.sort,
        // 兼容旧字段
        link_type: form.jump_type === 'url' ? 'page' : (form.jump_type === 'project' ? 'project' : 'page'),
        link_value: form.jump_id,
        // v3.1.45 修复 B1：link 自动同步（function_page 时为解析后路由，保证非空）
        link,
        updated_by: CURRENT_OPERATOR,
        updated_at: now(),
      });
      ElMessage.success('修改成功');
    }
  } else {
    store.kingKongs.push({
      entry_id: `kk-${Date.now()}`,
      name: form.name,
      icon: form.icon,
      gradient: form.gradient,
      jump_type: form.jump_type as any,
      jump_id: form.jump_id,
      project_id: form.project_id,
      sort: form.sort,
      sort_order: form.sort,
      status: 'active',
      link_type: form.jump_type === 'url' ? 'page' : (form.jump_type === 'project' ? 'project' : 'page'),
      link_value: form.jump_id,
      // v3.1.45 修复 B1：link 自动同步
      link,
      updated_by: CURRENT_OPERATOR,
      updated_at: now(),
    } as any);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
}

/** 状态切换时记录修改人/修改时间 */
function onStatusChange(row: any) {
  row.updated_by = CURRENT_OPERATOR;
  row.updated_at = now();
}

function remove(row: any) {
  ElMessageBox.confirm(`确定删除入口「${row.name}」吗？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = store.kingKongs.findIndex(k => k.entry_id === row.entry_id);
      if (idx >= 0) store.kingKongs.splice(idx, 1);
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
