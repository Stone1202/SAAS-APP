<template>
  <!-- 租户后台 — 项目金刚区管理（严格照搬运营后台 KingKongManage.vue 逻辑） -->
  <div class="kingkong-manage">
    <div class="page-header-bar">
      <h2 class="page-title">金刚区管理</h2>
      <span class="page-desc">配置项目首页金刚区快捷入口（仅限当前项目）</span>
    </div>

    <div class="toolbar">
      <el-input v-model="kkFilterKeyword" placeholder="搜索入口名称" clearable size="small" style="width:200px" @keyup.enter="applyKkFilters" />
      <el-select v-model="kkFilterJumpType" placeholder="跳转类型" clearable size="small" style="width:120px">
        <el-option label="全部类型" value="" />
        <el-option label="商品" value="product" />
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

    <!-- v3.1.56：el-table 绑定改为分页后的数据 pagedEntries（原 filteredEntries） -->
    <el-table :data="pagedEntries" border stripe style="width: 100%">
      <el-table-column prop="id" label="入口ID" width="120" show-overflow-tooltip />
      <el-table-column label="图标" width="80" align="center">
        <template #default="{ row }">
          <img v-if="isImageUrl(row.icon)" :src="row.icon" class="kk-thumb" />
          <span v-else style="font-size: 24px">{{ row.icon }}</span>
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
      <el-table-column prop="sort_order" label="排序" width="80" />
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

    <!-- v3.1.56 新增：分页（始终渲染，≤1页时翻页按钮自动禁用，每页10条） -->
    <el-pagination
      v-model:current-page="kkCurrentPage"
      :page-size="kkPageSize"
      :total="filteredEntries.length"
      layout="total, prev, pager, next"
      small
      style="margin-top:12px; justify-content:flex-end;"
    />

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑入口' : '新增入口'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="入口名称">
          <el-input v-model="form.name" maxlength="10" show-word-limit />
        </el-form-item>
        <el-form-item label="图标">
          <el-upload
            class="kk-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onIconChange"
            :before-upload="() => false"
          >
            <div class="kk-upload-box" v-if="!form.icon">
              <el-icon class="kk-upload-icon"><Plus /></el-icon>
              <span class="kk-upload-text">上传图标</span>
            </div>
            <img v-else :src="form.icon" class="kk-upload-preview" />
          </el-upload>
          <span class="kk-upload-tip">建议尺寸 48×48px，大小不超过 200KB</span>
        </el-form-item>
        <el-divider content-position="left">跳转配置</el-divider>
        <JumpTargetPicker
          v-model:jump-type="form.jump_type"
          v-model:jump-id="form.jump_id"
          v-model:project-id="form.project_id"
          :lock-project-id="projectId"
          :hide-project-jump="true"
        />
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-TNT-PC-007', '项目金刚区管理');
import { ref, computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { useAppConfigStore } from '../../stores/app-config-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import JumpTargetPicker from '../../components/admin/JumpTargetPicker.vue';

const route = useRoute();
const store = useProjectStore();
// v3.1.45: 引入 appConfigStore 用于 syncLinkFromJump
const appConfig = useAppConfigStore();

const projectId = computed(() => String(route.params.projectId));

// 确保项目首页配置存在（不存在则自动创建）
const homeConfig = computed(() => store.ensureHomeConfig(projectId.value));
const entries = computed(() => homeConfig.value?.quick_entries || []);

// v3.1.44: 金刚区列表筛选
const kkFilterKeyword = ref('');
const kkFilterJumpType = ref('');
const kkFilterStatus = ref('');
const _kkKeyword = ref('');
const _kkJumpType = ref('');
const _kkStatus = ref('');
const filteredEntries = computed(() => {
  let result = entries.value;
  if (_kkKeyword.value) {
    const kw = _kkKeyword.value.toLowerCase();
    result = result.filter(r => (r.name || '').toLowerCase().includes(kw));
  }
  if (_kkJumpType.value) result = result.filter(r => r.jump_type === _kkJumpType.value);
  if (_kkStatus.value) result = result.filter(r => r.status === _kkStatus.value);
  return result;
});

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

// v3.1.56 新增：分页（每页10条，始终渲染）
const kkCurrentPage = ref(1);
const kkPageSize = 10;
const pagedEntries = computed(() => {
  const start = (kkCurrentPage.value - 1) * kkPageSize;
  return filteredEntries.value.slice(start, start + kkPageSize);
});

// 当前操作人（mock）
const CURRENT_OPERATOR = '租户管理员';

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
  id: '',
  name: '',
  icon: '',
  // v3.1.45: 默认从 'url' 改为 'function_page'
  jump_type: 'function_page' as string,
  jump_id: '',
  project_id: '',
  sort_order: 0,
});

// v3.1.47 调整4: 图标改为上传图片，限制大小200KB
function onIconChange(file: any) {
  const raw = file.raw;
  if (!raw) return;
  // 校验图片大小（200KB）
  const MAX_SIZE = 200 * 1024;
  if (raw.size > MAX_SIZE) {
    ElMessage.warning('图标图片大小不能超过 200KB');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => { form.icon = e.target?.result as string; };
  reader.readAsDataURL(raw);
}

/** 判断icon值是否为图片URL（http/data:开头） */
function isImageUrl(icon: string): boolean {
  if (!icon) return false;
  return icon.startsWith('http') || icon.startsWith('data:') || icon.startsWith('/');
}

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
  // v3.1.45: 默认 function_page
  Object.assign(form, { id: '', name: '', icon: '', jump_type: 'function_page', jump_id: '', project_id: projectId.value, sort_order: 0 });
  dialogVisible.value = true;
}

function openEdit(row: any) {
  editing.value = true;
  Object.assign(form, {
    id: row.id,
    name: row.name || '',
    icon: row.icon || '',
    // v3.1.45: 旧 url 数据回退为 function_page
    jump_type: row.jump_type === 'url' ? 'function_page' : (row.jump_type || 'function_page'),
    jump_id: row.jump_id || '',
    project_id: row.project_id_ref || projectId.value,
    sort_order: row.sort_order || 0,
  });
  dialogVisible.value = true;
}

function save() {
  if (!form.name) { ElMessage.warning('请输入入口名称'); return; }
  if (!form.icon) { ElMessage.warning('请输入图标'); return; }
  if (form.jump_type === 'product' && !form.jump_id) { ElMessage.warning('请选择商品'); return; }
  if (form.jump_type === 'live' && !form.jump_id) { ElMessage.warning('请选择直播'); return; }
  // v3.1.45: 补全 function_page 验证
  if (form.jump_type === 'function_page' && !form.jump_id) { ElMessage.warning('请选择功能页面'); return; }
  // v3.1.45: 补全 project 验证
  if (form.jump_type === 'project' && !form.jump_id) { ElMessage.warning('请选择项目'); return; }
  if (form.jump_type === 'url' && !form.jump_id) { ElMessage.warning('请填写URL路径'); return; }

  const cfg = store.ensureHomeConfig(projectId.value);

  // v3.1.45 修复 B2: link 字段自动计算（function_page 时为解析后路由，保证非空）
  const link = appConfig.syncLinkFromJump(form.jump_type, form.jump_id, projectId.value);

  if (editing.value && form.id) {
    const idx = entries.value.findIndex((k: any) => k.id === form.id);
    if (idx >= 0) {
      Object.assign(entries.value[idx], {
        name: form.name,
        icon: form.icon,
        jump_type: form.jump_type,
        jump_id: form.jump_id,
        jump_target: form.jump_id,
        project_id_ref: projectId.value,
        sort: form.sort_order,
        sort_order: form.sort_order,
        // v3.1.45 修复 B2: link 自动同步（不再被清空为空字符串）
        link,
        enabled: entries.value[idx].enabled !== false,
        status: entries.value[idx].status || 'active',
        updated_by: CURRENT_OPERATOR,
        updated_at: now(),
      });
      ElMessage.success('修改成功');
    }
  } else {
    entries.value.push({
      id: `qe-${Date.now()}`,
      name: form.name,
      icon: form.icon,
      jump_type: form.jump_type,
      jump_id: form.jump_id,
      jump_target: form.jump_id,
      project_id_ref: projectId.value,
      sort: form.sort_order,
      sort_order: form.sort_order,
      enabled: true,
      status: 'active',
      // v3.1.45 修复 B2: link 自动同步
      link,
      updated_by: CURRENT_OPERATOR,
      updated_at: now(),
    } as any);
    ElMessage.success('新增成功');
  }
  // 触发响应式
  (cfg as any).quick_entries = [...entries.value];
  dialogVisible.value = false;
}

/** 状态切换时记录修改人/修改时间 */
function onStatusChange(row: any) {
  row.updated_by = CURRENT_OPERATOR;
  row.updated_at = now();
  // 同步 enabled 与 status
  row.enabled = row.status === 'active';
  const cfg = store.ensureHomeConfig(projectId.value);
  (cfg as any).quick_entries = [...entries.value];
}

function remove(row: any) {
  ElMessageBox.confirm(`确定删除入口「${row.name}」吗？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = entries.value.findIndex((k: any) => k.id === row.id);
      if (idx >= 0) entries.value.splice(idx, 1);
      const cfg = store.ensureHomeConfig(projectId.value);
      (cfg as any).quick_entries = [...entries.value];
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
/* v3.1.47 调整4: 金刚区图标上传样式 */
.kk-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 8px; }
.kk-uploader { display: inline-block; }
.kk-upload-box { width: 48px; height: 48px; border: 1px dashed #d9d9d9; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
.kk-upload-box:hover { border-color: #FF6B35; }
.kk-upload-icon { font-size: 18px; color: #bbb; }
.kk-upload-text { font-size: 9px; color: #bbb; margin-top: 2px; }
.kk-upload-preview { width: 48px; height: 48px; object-fit: cover; border-radius: 8px; }
.kk-upload-tip { margin-left: 8px; font-size: 10px; color: #999; }
</style>
