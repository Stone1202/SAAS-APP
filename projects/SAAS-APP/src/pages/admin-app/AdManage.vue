<template>
  <!-- 运营后台 — 广告位管理 -->
  <div class="page-admin">
    <div class="toolbar">
      <el-input v-model="adFilterKeyword" placeholder="搜索广告标题" clearable size="small" style="width:200px" @keyup.enter="applyAdFilters" />
      <el-select v-model="adFilterJumpType" placeholder="跳转类型" clearable size="small" style="width:120px">
        <el-option label="全部类型" value="" />
        <el-option label="商品" value="product" />
        <el-option label="项目主页" value="project" />
        <el-option label="直播" value="live" />
        <el-option label="功能页面" value="function_page" />
        <el-option label="URL(旧)" value="url" />
      </el-select>
      <el-select v-model="adFilterStatus" placeholder="状态筛选" clearable size="small" style="width:120px">
        <el-option label="全部状态" value="" />
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" size="small" @click="applyAdFilters">筛选</el-button>
      <el-button size="small" @click="resetAdFilters">重置</el-button>
      <el-button type="primary" size="small" @click="openAdd">+ 新增广告</el-button>
    </div>

    <el-table :data="pagedList" border stripe size="small" style="margin-top:12px">
      <template #empty>
        <el-empty description="暂无匹配的广告" :image-size="60" />
      </template>
      <el-table-column prop="ad_id" label="ID" width="80" />
      <el-table-column label="预览" width="100">
        <template #default="{ row }">
          <div class="ad-thumb">
            <img v-if="row.image_url" :src="row.image_url" />
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
      <el-pagination
      v-if="filteredAdList.length > pageSize"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredAdList.length"
      layout="total, prev, pager, next"
      small
      style="margin-top:12px; justify-content:flex-end;"
      />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑广告' : '新增广告'" width="600px">
      <el-form :model="form" label-width="90px" size="small">
        <el-form-item label="广告标题"><el-input v-model="form.title" placeholder="如: 新品首发 — 全场低至5折" /></el-form-item>

        <el-form-item label="广告图片">
          <el-upload class="ad-uploader" action="#" :auto-upload="false" :show-file-list="false" :on-change="onImageChange">
            <div class="ad-upload-box" v-if="!form.image_url">
              <el-icon class="ad-upload-icon"><Plus /></el-icon>
              <span class="ad-upload-text">上传图片</span>
            </div>
            <img v-else :src="form.image_url" class="ad-upload-preview" />
          </el-upload>
          <span style="margin-left:8px;font-size:10px;color:#999">建议尺寸: 750×300px，未上传图片时使用默认标题卡片</span>
        </el-form-item>

        <el-divider content-position="left">跳转配置</el-divider>
        <JumpTargetPicker
          v-model:jump-type="form.jump_type"
          v-model:jump-id="form.jump_id"
          v-model:project-id="form.project_id"
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-OPS-PC-002', '广告位管理');
import { ref, reactive, computed } from 'vue';
import { useAppConfigStore } from '../../stores/app-config-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import JumpTargetPicker from '../../components/admin/JumpTargetPicker.vue';

const store = useAppConfigStore();
const list = computed(() => store.adBanners);

// v3.1.42: 广告位筛选
const adFilterKeyword = ref('');
const adFilterJumpType = ref('');
const adFilterStatus = ref('');
// v3.1.44: 筛选工作副本
const _adKeyword = ref('');
const _adJumpType = ref('');
const _adStatus = ref('');
const filteredAdList = computed(() => {
  let result = list.value;
  if (_adKeyword.value) {
    const kw = _adKeyword.value.toLowerCase();
    result = result.filter(r => r.title.toLowerCase().includes(kw));
  }
  if (_adJumpType.value) result = result.filter(r => r.jump_type === _adJumpType.value);
  if (_adStatus.value) result = result.filter(r => r.status === _adStatus.value);
  return result;
});

// v3.1.44: 筛选/重置
function applyAdFilters() {
  _adKeyword.value = adFilterKeyword.value;
  _adJumpType.value = adFilterJumpType.value;
  _adStatus.value = adFilterStatus.value;
  currentPage.value = 1;
}
function resetAdFilters() {
  adFilterKeyword.value = '';
  adFilterJumpType.value = '';
  adFilterStatus.value = '';
  _adKeyword.value = '';
  _adJumpType.value = '';
  _adStatus.value = '';
  currentPage.value = 1;
}

const pageSize = 10;
const currentPage = ref(1);
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredAdList.value.slice(start, start + pageSize);
});

const dialogVisible = ref(false);
const editingId = ref('');

// 当前操作人（mock）
const CURRENT_OPERATOR = '运营管理员';

/** 格式化日期时间显示 */
function formatDateTime(dt?: string): string {
  if (!dt) return '-';
  // 统一显示为 YYYY-MM-DD HH:mm:ss
  if (dt.includes('T')) {
    return dt.replace('T', ' ').replace(/\.\d+Z?$/, '');
  }
  return dt;
}

/** 获取当前时间 ISO 字符串 */
function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const form = reactive({
  ad_id: '', title: '', image_url: '',
  start_time: '', end_time: '', sort_order: 0,
  // v3.1.45: 默认从 'project' 改为 'function_page'（推荐使用功能页面）
  jump_type: 'function_page' as string, jump_id: '', project_id: '',
});

function onImageChange(file: any) {
  const raw = file.raw;
  if (!raw) return;
  const reader = new FileReader();
  reader.onload = (e) => { form.image_url = e.target?.result as string; };
  reader.readAsDataURL(raw);
}

function openAdd() {
  editingId.value = '';
  form.ad_id = ''; form.title = ''; form.image_url = '';
  form.start_time = ''; form.end_time = ''; form.sort_order = 0;
  // v3.1.45: 默认 function_page
  form.jump_type = 'function_page'; form.jump_id = ''; form.project_id = '';
  dialogVisible.value = true;
}

function openEdit(row: any) {
  editingId.value = row.ad_id;
  form.ad_id = row.ad_id; form.title = row.title || ''; form.image_url = row.image_url || '';
  form.start_time = row.start_time || ''; form.end_time = row.end_time || '';
  form.sort_order = row.sort_order || 0;
  // v3.1.45: 旧 url 数据回退为 function_page
  form.jump_type = row.jump_type === 'url' ? 'function_page' : (row.jump_type || 'function_page');
  form.jump_id = row.jump_id || ''; form.project_id = row.project_id || '';
  dialogVisible.value = true;
}

function save() {
  if (!form.title) { ElMessage.warning('请输入广告标题'); return; }
  if (form.jump_type !== 'url' && !form.jump_id) { ElMessage.warning('请选择跳转目标'); return; }
  if (form.jump_type === 'url' && !form.jump_id) { ElMessage.warning('请填写URL路径'); return; }

  // v3.1.45: link 字段自动计算（修复 B3：link 不再被清空为空字符串）
  const link = store.syncLinkFromJump(form.jump_type, form.jump_id, form.project_id);

  const data = {
    ad_id: editingId.value || `ad-${Date.now()}`,
    title: form.title, image_url: form.image_url, position: 'platform_home' as const,
    start_time: form.start_time, end_time: form.end_time, sort_order: form.sort_order,
    sort: form.sort_order || 0,
    jump_type: form.jump_type, jump_id: form.jump_id, project_id: form.project_id,
    // v3.1.45 修复 B3：link 自动同步（function_page 时为解析后路由，保证非空）
    link,
    updated_by: CURRENT_OPERATOR, updated_at: now(),
  };

  if (editingId.value) {
    const idx = list.value.findIndex((a: any) => a.ad_id === editingId.value);
    if (idx >= 0) Object.assign(list.value[idx], data);
  } else {
    list.value.push({ ...data, status: 'active' });
  }
  dialogVisible.value = false; ElMessage.success('保存成功');
}

function del(row: any) {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' }).then(() => {
    const idx = list.value.findIndex((a: any) => a.ad_id === row.ad_id);
    if (idx >= 0) list.value.splice(idx, 1);
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
}
</script>

<style scoped>
.page-admin { padding: 20px; }
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