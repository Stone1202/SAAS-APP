<template>
  <!-- 租户后台 — 项目广告位管理（v3.1.47 调整3：Banner管理改名为广告位管理） -->
  <div class="page-admin">
    <div class="page-header-bar">
      <h2 class="page-title">广告位管理</h2>
      <span class="page-desc">配置项目首页广告位轮播图（仅限当前项目）</span>
    </div>

    <div class="toolbar">
      <el-input v-model="bnrFilterKeyword" placeholder="搜索Banner标题" clearable size="small" style="width:200px" @keyup.enter="applyBnrFilters" />
      <el-select v-model="bnrFilterJumpType" placeholder="跳转类型" clearable size="small" style="width:120px">
        <el-option label="全部类型" value="" />
        <el-option label="商品" value="product" />
        <el-option label="直播" value="live" />
        <el-option label="功能页面" value="function_page" />
        <el-option label="URL(旧)" value="url" />
      </el-select>
      <el-select v-model="bnrFilterStatus" placeholder="状态筛选" clearable size="small" style="width:120px">
        <el-option label="全部状态" value="" />
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" size="small" @click="applyBnrFilters">筛选</el-button>
      <el-button size="small" @click="resetBnrFilters">重置</el-button>
      <el-button type="primary" size="small" @click="openAdd">+ 新增广告</el-button>
    </div>

    <el-table :data="pagedList" border stripe size="small" style="margin-top:12px">
      <el-table-column prop="id" label="ID" width="120" show-overflow-tooltip />
      <el-table-column label="预览" width="100">
        <template #default="{ row }">
          <div class="ad-thumb">
            <img v-if="row.image" :src="row.image" />
            <div v-else class="ad-thumb-empty">📷 暂无图</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
      <el-table-column label="跳转" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="jtTag(row.jump_type)" size="small">{{ jtLabel(row.jump_type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="展示时间" min-width="200">
        <template #default="{ row }">
          <span style="font-size:11px">{{ formatDateTime(row.start_time) }} ~ {{ formatDateTime(row.end_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="60" align="center" />
      <el-table-column label="状态" width="70" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.status" active-value="active" inactive-value="disabled" size="small" @change="onStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="updated_by" label="修改人" width="100" show-overflow-tooltip />
      <el-table-column label="修改时间" width="160">
        <template #default="{ row }">
          <span style="font-size:11px">{{ formatDateTime(row.updated_at) || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" link @click="del(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- v3.1.56：去掉v-if条件，分页始终渲染（≤1页时翻页按钮自动禁用） -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredList.length"
      layout="total, prev, pager, next"
      small
      style="margin-top:12px; justify-content:flex-end;"
    />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑广告' : '新增广告'" width="600px">
      <el-form :model="form" label-width="90px" size="small">
        <el-form-item label="广告标题"><el-input v-model="form.title" maxlength="30" show-word-limit placeholder="如: 新品首发 — 全场低至5折" /></el-form-item>

        <el-form-item label="广告图片">
          <el-upload class="ad-uploader" action="#" :auto-upload="false" :show-file-list="false" :on-change="onImageChange">
            <div class="ad-upload-box" v-if="!form.image">
              <el-icon class="ad-upload-icon"><Plus /></el-icon>
              <span class="ad-upload-text">上传图片</span>
            </div>
            <img v-else :src="form.image" class="ad-upload-preview" />
          </el-upload>
          <span style="margin-left:8px;font-size:10px;color:#999">建议尺寸: 750×300px，未上传图片时使用默认标题卡片</span>
        </el-form-item>

        <el-divider content-position="left">跳转配置</el-divider>
        <JumpTargetPicker
          v-model:jump-type="form.jump_type"
          v-model:jump-id="form.jump_id"
          v-model:project-id="form.project_id"
          :lock-project-id="projectId"
          :hide-project-jump="true"
        />

        <el-divider content-position="left">展示设置</el-divider>
        <el-form-item label="展示开始">
          <el-date-picker v-model="form.start_time" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择开始时间" style="width:100%" />
        </el-form-item>
        <el-form-item label="展示结束">
          <el-date-picker v-model="form.end_time" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择结束时间" style="width:100%" />
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort_order" :min="0" :max="99" /></el-form-item>
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-TNT-PC-006', '项目广告位管理');
import { ref, reactive, computed } from 'vue';
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

// Banner列表（与 AdManage 一致，从 store 的 list 获取）
const list = computed(() => homeConfig.value?.banner_images || []);

// v3.1.44: Banner列表筛选
const bnrFilterKeyword = ref('');
const bnrFilterJumpType = ref('');
const bnrFilterStatus = ref('');
const _bnrKeyword = ref('');
const _bnrJumpType = ref('');
const _bnrStatus = ref('');
const filteredList = computed(() => {
  let result = list.value;
  if (_bnrKeyword.value) {
    const kw = _bnrKeyword.value.toLowerCase();
    result = result.filter(r => (r.title || '').toLowerCase().includes(kw));
  }
  if (_bnrJumpType.value) result = result.filter(r => r.jump_type === _bnrJumpType.value);
  if (_bnrStatus.value) result = result.filter(r => r.status === _bnrStatus.value);
  return result;
});

function applyBnrFilters() {
  _bnrKeyword.value = bnrFilterKeyword.value;
  _bnrJumpType.value = bnrFilterJumpType.value;
  _bnrStatus.value = bnrFilterStatus.value;
  currentPage.value = 1;
}
function resetBnrFilters() {
  bnrFilterKeyword.value = '';
  bnrFilterJumpType.value = '';
  bnrFilterStatus.value = '';
  _bnrKeyword.value = '';
  _bnrJumpType.value = '';
  _bnrStatus.value = '';
  currentPage.value = 1;
}

const pageSize = 10;
const currentPage = ref(1);
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredList.value.slice(start, start + pageSize);
});

const dialogVisible = ref(false);
const editingId = ref('');

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

const form = reactive({
  id: '', title: '', image: '',
  start_time: '', end_time: '', sort_order: 0,
  // v3.1.45: 默认从 'product' 改为 'function_page'
  jump_type: 'function_page' as string, jump_id: '', project_id: '',
});

function onImageChange(file: any) {
  const raw = file.raw;
  if (!raw) return;
  const reader = new FileReader();
  reader.onload = (e) => { form.image = e.target?.result as string; };
  reader.readAsDataURL(raw);
}

function openAdd() {
  editingId.value = '';
  form.id = ''; form.title = ''; form.image = '';
  form.start_time = ''; form.end_time = ''; form.sort_order = 0;
  // v3.1.45: 默认 function_page
  form.jump_type = 'function_page'; form.jump_id = ''; form.project_id = projectId.value;
  dialogVisible.value = true;
}

function openEdit(row: any) {
  editingId.value = row.id;
  form.id = row.id; form.title = row.title || ''; form.image = row.image || '';
  form.start_time = row.start_time || ''; form.end_time = row.end_time || '';
  form.sort_order = row.sort_order || 0;
  // v3.1.45: 旧 url 数据回退为 function_page
  form.jump_type = row.jump_type === 'url' ? 'function_page' : (row.jump_type || 'function_page');
  form.jump_id = row.jump_id || ''; form.project_id = row.project_id_ref || projectId.value;
  dialogVisible.value = true;
}

function save() {
  if (!form.title) { ElMessage.warning('请输入广告标题'); return; }
  if (form.jump_type !== 'url' && !form.jump_id) { ElMessage.warning('请选择跳转目标'); return; }
  if (form.jump_type === 'url' && !form.jump_id) { ElMessage.warning('请填写URL路径'); return; }

  // v3.1.45 修复 B3: link 字段自动计算（function_page 时为解析后路由，保证非空）
  const link = appConfig.syncLinkFromJump(form.jump_type, form.jump_id, projectId.value);

  const data: any = {
    id: editingId.value || `bnr-${Date.now()}`,
    image: form.image,
    title: form.title,
    start_time: form.start_time, end_time: form.end_time,
    sort_order: form.sort_order,
    sort: form.sort_order || 0,
    jump_type: form.jump_type, jump_id: form.jump_id,
    jump_target: form.jump_id,
    project_id_ref: projectId.value,
    // v3.1.45 修复 B3: link 自动同步（不再被清空为空字符串）
    link,
    enabled: true,
    status: 'active',
    updated_by: CURRENT_OPERATOR, updated_at: now(),
  };

  const cfg = store.ensureHomeConfig(projectId.value);

  if (editingId.value) {
    const idx = list.value.findIndex((a: any) => a.id === editingId.value);
    if (idx >= 0) Object.assign(list.value[idx], data);
  } else {
    list.value.push(data);
  }
  // 触发响应式
  (cfg as any).banner_images = [...list.value];
  dialogVisible.value = false; ElMessage.success('保存成功');
}

function del(row: any) {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' }).then(() => {
    const idx = list.value.findIndex((a: any) => a.id === row.id);
    if (idx >= 0) list.value.splice(idx, 1);
    const cfg = store.ensureHomeConfig(projectId.value);
    (cfg as any).banner_images = [...list.value];
    ElMessage.success('已删除');
  }).catch(() => {});
}

function jtTag(t: string) {
  // v3.1.45: 新增 function_page 分支
  if (t === 'function_page') return 'primary';
  return t === 'product' ? 'warning' : t === 'project' ? 'success' : t === 'live' ? 'danger' : 'info';
}
function jtLabel(t: string) {
  // v3.1.45: 新增 function_page 分支
  if (t === 'function_page') return '功能页面';
  return t === 'product' ? '商品' : t === 'project' ? '项目' : t === 'live' ? '直播' : 'URL';
}

/** 状态切换时记录修改人/修改时间 */
function onStatusChange(row: any) {
  row.updated_by = CURRENT_OPERATOR;
  row.updated_at = now();
  // 同步 enabled 与 status
  row.enabled = row.status === 'active';
  const cfg = store.ensureHomeConfig(projectId.value);
  (cfg as any).banner_images = [...list.value];
}
</script>

<style scoped>
.page-admin { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.ad-thumb { width: 70px; height: 30px; border-radius: 4px; overflow: hidden; }
.ad-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ad-thumb-empty { width: 100%; height: 100%; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #bbb; }
.ad-uploader { display: inline-block; }
.ad-upload-box { width: 120px; height: 60px; border: 1px dashed #d9d9d9; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; }
.ad-upload-box:hover { border-color: #FF6B35; }
.ad-upload-icon { font-size: 20px; color: #bbb; }
.ad-upload-text { font-size: 10px; color: #bbb; margin-top: 2px; }
.ad-upload-preview { width: 120px; height: 60px; object-fit: cover; border-radius: 8px; }
</style>
