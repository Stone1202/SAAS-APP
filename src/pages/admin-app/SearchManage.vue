<template>
  <!-- 运营后台 — 搜索管理 -->
  <div class="page-admin">
    <el-breadcrumb separator="/"><el-breadcrumb-item>运营后台</el-breadcrumb-item><el-breadcrumb-item>搜索管理</el-breadcrumb-item></el-breadcrumb>

    <!-- 底纹词 -->
    <el-card class="card" header="搜索底纹词">
      <el-form :inline="true" size="small">
        <el-form-item label="底纹词">
          <el-input v-model="store.searchHint" placeholder="搜索框提示文字" maxlength="15" show-word-limit style="width:300px" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="saveHint">保存</el-button></el-form-item>
      </el-form>
    </el-card>

    <!-- 热搜词管理 -->
    <el-card class="card" header="热搜词管理">
      <div class="toolbar">
        <el-input v-model="hotFilterKeyword" placeholder="搜索热搜词" clearable size="small" style="width:200px" @keyup.enter="applyHotFilters" />
        <el-select v-model="hotFilterStatus" placeholder="状态筛选" clearable size="small" style="width:120px">
          <el-option label="全部状态" value="" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" size="small" @click="applyHotFilters">筛选</el-button>
        <el-button size="small" @click="resetHotFilters">重置</el-button>
        <el-button type="primary" size="small" @click="openHotWordAdd">+ 添加热搜词</el-button>
      </div>
      <el-table :data="pagedHotWordList" border stripe size="small" style="margin-top:12px">
        <template #empty>
          <el-empty description="暂无匹配的热搜词" :image-size="60" />
        </template>
        <el-table-column prop="word" label="热搜词" min-width="120" />
        <el-table-column label="标签图标" width="90" align="center">
          <template #default="{ row }">
            <span :class="['hw-badge-preview', `badge-${row.badge || ''}`]" v-if="row.badge">{{ badgeLabel(row.badge) }}</span>
            <span v-else style="color:#ccc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="关联自定义结果" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <template v-if="row.csr_id">
              <el-tag type="success" size="small">{{ csrTitle(row.csr_id) }}</el-tag>
              <el-button type="danger" size="small" link @click="row.csr_id = ''; syncWords()">解除</el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="small" link @click="openCSRLink(row)">关联自定义结果</el-button>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="权重" width="60" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="disabled" size="small" @change="onHotStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="updated_by" label="修改人" width="100" show-overflow-tooltip />
        <el-table-column label="修改时间" width="160">
          <template #default="{ row }">
            <span style="font-size:11px">{{ formatDateTime(row.updated_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openHotWordEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="delHotWord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- v3.1.56：去掉v-if条件，分页始终渲染（≤1页时翻页按钮自动禁用） -->
      <el-pagination
        v-model:current-page="hotCurrentPage"
        :page-size="hotPageSize"
        :total="filteredHotWordList.length"
        layout="total, prev, pager, next"
        small
        style="margin-top:12px; justify-content:flex-end;"
      />
    </el-card>

    <!-- 自定义搜索结果 -->
    <el-card class="card" header="自定义搜索结果">
      <div class="toolbar">
        <el-input v-model="csrFilterKeyword" placeholder="搜索标题" clearable size="small" style="width:200px" @keyup.enter="applyCsrFilters" />
        <el-select v-model="csrFilterJumpType" placeholder="跳转类型" clearable size="small" style="width:120px">
          <el-option label="全部类型" value="" />
          <el-option label="商品" value="product" />
          <el-option label="项目主页" value="project" />
          <el-option label="直播" value="live" />
          <el-option label="功能页面" value="function_page" />
          <el-option label="URL(旧)" value="url" />
        </el-select>
        <el-select v-model="csrFilterStatus" placeholder="状态筛选" clearable size="small" style="width:120px">
          <el-option label="全部状态" value="" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" size="small" @click="applyCsrFilters">筛选</el-button>
        <el-button size="small" @click="resetCsrFilters">重置</el-button>
        <el-button type="primary" size="small" @click="openCSRAdd">+ 添加自定义结果</el-button>
      </div>
      <el-table :data="pagedCsrList" border stripe size="small" style="margin-top:12px">
        <template #empty>
          <el-empty description="暂无匹配的自定义结果" :image-size="60" />
        </template>
        <el-table-column prop="item_id" label="ID" width="80" />
        <el-table-column prop="title" label="展示标题" min-width="160" show-overflow-tooltip />
        <el-table-column label="跳转类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="jumpTypeTag(row.jump_type)" size="small">{{ jumpTypeLabel(row.jump_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="disabled" size="small" @change="onCSRStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="updated_by" label="修改人" width="100" show-overflow-tooltip />
        <el-table-column label="修改时间" width="160">
          <template #default="{ row }">
            <span style="font-size:11px">{{ formatDateTime(row.updated_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openCSREdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="delCSR(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- v3.1.56：去掉v-if条件，分页始终渲染（≤1页时翻页按钮自动禁用） -->
      <el-pagination
        v-model:current-page="csrCurrentPage"
        :page-size="csrPageSize"
        :total="filteredCsrList.length"
        layout="total, prev, pager, next"
        small
        style="margin-top:12px; justify-content:flex-end;"
      />
    </el-card>

    <!-- 热搜词弹窗 -->
    <el-dialog v-model="hotDialog" :title="hotEditingIdx >= 0 ? '编辑热搜词' : '新增热搜词'" width="500px">
      <el-form :model="hotForm" label-width="100px" size="small">
        <el-form-item label="热搜词"><el-input v-model="hotForm.word" maxlength="15" show-word-limit /></el-form-item>
        <el-form-item label="标签图标">
          <el-select v-model="hotForm.badge" style="width:100%" clearable placeholder="不设置图标">
            <el-option v-for="b in badgeOptions" :key="b.value" :label="b.label" :value="b.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="权重"><el-input-number v-model="hotForm.weight" :min="0" :max="999" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="hotDialog = false">取消</el-button>
        <el-button type="primary" @click="saveHotWord">保存</el-button>
      </template>
    </el-dialog>

    <!-- 关联自定义结果弹窗 -->
    <el-dialog v-model="csrLinkDialog" title="选择关联的自定义结果" width="500px">
      <el-radio-group v-model="linkCSRId" style="width:100%">
        <el-table :data="activeCSRs" border size="small" highlight-current-row @row-click="(r: any) => linkCSRId = r.item_id">
          <el-table-column width="40" align="center">
            <template #default="{ row }">
              <el-radio :value="row.item_id" :model-value="linkCSRId">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
          <el-table-column label="跳转类型" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="jumpTypeTag(row.jump_type)" size="small">{{ jumpTypeLabel(row.jump_type) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-radio-group>
      <template #footer>
        <el-button @click="csrLinkDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCSRLink">确认关联</el-button>
      </template>
    </el-dialog>

    <!-- 自定义结果弹窗 -->
    <el-dialog v-model="csrDialog" :title="csrEditingId ? '编辑自定义结果' : '新增自定义结果'" width="600px">
      <el-form :model="csrForm" label-width="90px" size="small">
        <el-form-item label="展示标题"><el-input v-model="csrForm.title" maxlength="30" show-word-limit /></el-form-item>
        <el-form-item label="描述"><el-input v-model="csrForm.description" type="textarea" :rows="2" maxlength="100" show-word-limit /></el-form-item>

        <el-divider content-position="left">跳转配置</el-divider>
        <JumpTargetPicker
          v-model:jump-type="csrForm.jump_type"
          v-model:jump-id="csrForm.jump_id"
          v-model:project-id="csrForm.project_id"
        />
      </el-form>
      <template #footer>
        <el-button @click="csrDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCSR">保存</el-button>
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
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-OPS-PC-001', '搜索管理');
import { ref, reactive, computed } from 'vue';
import { useAppConfigStore } from '../../stores/app-config-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import JumpTargetPicker from '../../components/admin/JumpTargetPicker.vue';

const store = useAppConfigStore();

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

// 标签图标选项
const badgeOptions = [
  { label: '🔥 热门', value: 'hot' },
  { label: '💥 火爆', value: 'fire' },
  { label: '🆕 最新', value: 'new' },
  { label: '👥 人气', value: 'popular' },
  { label: '⭐ 推荐', value: 'recommend' },
  { label: '💸 热卖', value: 'sale' },
];
const badgeLabelMap: Record<string, string> = { hot: '热门', fire: '火爆', new: '最新', popular: '人气', recommend: '推荐', sale: '热卖' };
function badgeLabel(b: string) { return badgeLabelMap[b] || b; }

// 底纹词
function saveHint() {
  // searchHint 是 v-model 绑定 store.searchHint，已自动更新 store
  // 这里只需提示，watch 会自动持久化
  ElMessage.success('底纹词已保存');
}

// 同步 hotWords 数组
function syncWords() {
  store.syncHotWords();
}

// 热搜词
const hotWordList = computed(() => store.hotWordConfigs);

// v3.1.42: 热搜词筛选
const hotFilterKeyword = ref('');
const hotFilterStatus = ref('');
const _hotKeyword = ref('');
const _hotStatus = ref('');
const filteredHotWordList = computed(() => {
  let list = hotWordList.value;
  if (_hotKeyword.value) {
    const kw = _hotKeyword.value.toLowerCase();
    list = list.filter(r => r.word.toLowerCase().includes(kw));
  }
  if (_hotStatus.value) list = list.filter(r => r.status === _hotStatus.value);
  return list;
});

// v3.1.44: 热搜词筛选/重置按钮
function applyHotFilters() {
  _hotKeyword.value = hotFilterKeyword.value;
  _hotStatus.value = hotFilterStatus.value;
  hotCurrentPage.value = 1;
}
function resetHotFilters() {
  hotFilterKeyword.value = '';
  hotFilterStatus.value = '';
  _hotKeyword.value = '';
  _hotStatus.value = '';
  hotCurrentPage.value = 1;
}

const hotPageSize = 10;
const hotCurrentPage = ref(1);
const pagedHotWordList = computed(() => {
  const start = (hotCurrentPage.value - 1) * hotPageSize;
  return filteredHotWordList.value.slice(start, start + hotPageSize);
});
const hotDialog = ref(false);
const hotEditingIdx = ref(-1);
const hotForm = reactive({ word: '', weight: 50, badge: '' as string, csr_id: '' });

function openHotWordAdd() {
  hotEditingIdx.value = -1;
  Object.assign(hotForm, { word: '', weight: 50, badge: '', csr_id: '' });
  hotDialog.value = true;
}
function openHotWordEdit(row: any) {
  hotEditingIdx.value = store.hotWordConfigs.indexOf(row);
  Object.assign(hotForm, { word: row.word, weight: row.weight, badge: row.badge || '', csr_id: row.csr_id || '' });
  hotDialog.value = true;
}
function saveHotWord() {
  if (!hotForm.word) { ElMessage.warning('请输入热搜词'); return; }
  if (hotEditingIdx.value >= 0) {
    Object.assign(store.hotWordConfigs[hotEditingIdx.value], { ...hotForm, updated_by: CURRENT_OPERATOR, updated_at: now() });
  } else {
    store.hotWordConfigs.push({ ...hotForm, badge: hotForm.badge as any, status: 'active', updated_by: CURRENT_OPERATOR, updated_at: now() });
  }
  syncWords();
  hotDialog.value = false; ElMessage.success('保存成功');
}
function delHotWord(row: any) {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' }).then(() => {
    const idx = store.hotWordConfigs.indexOf(row);
    if (idx >= 0) store.hotWordConfigs.splice(idx, 1);
    syncWords();
    ElMessage.success('已删除');
  }).catch(() => {});
}

// 关联自定义结果
const csrLinkDialog = ref(false);
const linkCSRId = ref('');
const linkHWIndex = ref(-1);
const activeCSRs = computed(() => store.customSearchResults.filter(c => c.status === 'active'));

function csrTitle(id: string) {
  const r = store.customSearchResults.find(c => c.item_id === id);
  return r ? `${r.title}` : id;
}

function openCSRLink(row: any) {
  linkHWIndex.value = store.hotWordConfigs.indexOf(row);
  linkCSRId.value = '';
  csrLinkDialog.value = true;
}
function confirmCSRLink() {
  if (!linkCSRId.value) { ElMessage.warning('请选择一个自定义结果'); return; }
  if (linkHWIndex.value >= 0) {
    store.hotWordConfigs[linkHWIndex.value].csr_id = linkCSRId.value;
    store.hotWordConfigs[linkHWIndex.value].updated_by = CURRENT_OPERATOR;
    store.hotWordConfigs[linkHWIndex.value].updated_at = now();
  }
  syncWords();
  csrLinkDialog.value = false; ElMessage.success('关联成功');
}

// 自定义搜索结果
const csrList = computed(() => store.customSearchResults);

// v3.1.42: 自定义结果筛选
const csrFilterKeyword = ref('');
const csrFilterJumpType = ref('');
const csrFilterStatus = ref('');
const _csrKeyword = ref('');
const _csrJumpType = ref('');
const _csrStatus = ref('');
const filteredCsrList = computed(() => {
  let list = csrList.value;
  if (_csrKeyword.value) {
    const kw = _csrKeyword.value.toLowerCase();
    list = list.filter(r => r.title.toLowerCase().includes(kw));
  }
  if (_csrJumpType.value) list = list.filter(r => r.jump_type === _csrJumpType.value);
  if (_csrStatus.value) list = list.filter(r => r.status === _csrStatus.value);
  return list;
});

// v3.1.44: 自定义结果筛选/重置按钮
function applyCsrFilters() {
  _csrKeyword.value = csrFilterKeyword.value;
  _csrJumpType.value = csrFilterJumpType.value;
  _csrStatus.value = csrFilterStatus.value;
  csrCurrentPage.value = 1;
}
function resetCsrFilters() {
  csrFilterKeyword.value = '';
  csrFilterJumpType.value = '';
  csrFilterStatus.value = '';
  _csrKeyword.value = '';
  _csrJumpType.value = '';
  _csrStatus.value = '';
  csrCurrentPage.value = 1;
}

const csrPageSize = 10;
const csrCurrentPage = ref(1);
const pagedCsrList = computed(() => {
  const start = (csrCurrentPage.value - 1) * csrPageSize;
  return filteredCsrList.value.slice(start, start + csrPageSize);
});
const csrDialog = ref(false);
const csrEditingId = ref('');
const csrForm = reactive({
  item_id: '', title: '', description: '',
  // v3.1.45: 默认从 'product' 改为 'function_page'
  jump_type: 'function_page' as string, jump_id: '', project_id: '', store_id: '',
});

function openCSRAdd() {
  csrEditingId.value = '';
  // 直接覆盖设值，避免 v-model 的 @change 触发重置
  csrForm.item_id = '';
  csrForm.title = '';
  csrForm.description = '';
  // v3.1.45: 默认 function_page
  csrForm.jump_type = 'function_page';
  csrForm.jump_id = '';
  csrForm.project_id = '';
  csrForm.store_id = '';
  csrDialog.value = true;
}
function openCSREdit(row: any) {
  csrEditingId.value = row.item_id;
  csrForm.item_id = row.item_id;
  csrForm.title = row.title;
  csrForm.description = row.description;
  // v3.1.45: 旧 url 数据回退为 function_page
  csrForm.jump_type = row.jump_type === 'url' ? 'function_page' : (row.jump_type || 'function_page');
  csrForm.jump_id = row.jump_id;
  csrForm.project_id = row.project_id || '';
  csrForm.store_id = row.store_id || '';
  csrDialog.value = true;
}
function saveCSR() {
  if (!csrForm.title) { ElMessage.warning('请填写标题'); return; }
  if (csrForm.jump_type === 'product' && !csrForm.jump_id) { ElMessage.warning('请选择商品'); return; }
  if (csrForm.jump_type === 'project' && !csrForm.jump_id) { ElMessage.warning('请选择项目'); return; }
  if (csrForm.jump_type === 'live' && !csrForm.jump_id) { ElMessage.warning('请选择直播'); return; }
  // v3.1.45: 补全 function_page 验证
  if (csrForm.jump_type === 'function_page' && !csrForm.jump_id) { ElMessage.warning('请选择功能页面'); return; }
  if (csrForm.jump_type === 'url' && !csrForm.jump_id) { ElMessage.warning('请填写URL路径'); return; }

  // v3.1.45: 计算 link 字段（写入 customSearchResults，供 APP 端 fallback 使用）
  // 注意：CustomSearchResult 接口本身没有 link 字段，这里不写入 link，
  // 跳转依赖 jump_type/jump_id，APP 端通过 useAppNavigation.navigateByJumpType 解析

  if (csrEditingId.value) {
    const idx = store.customSearchResults.findIndex((r: any) => r.item_id === csrEditingId.value);
    if (idx >= 0) Object.assign(store.customSearchResults[idx], { ...csrForm, item_id: csrEditingId.value, updated_by: CURRENT_OPERATOR, updated_at: now() });
  } else {
    csrForm.item_id = `csr-${Date.now()}`;
    store.customSearchResults.push({ ...csrForm, jump_type: csrForm.jump_type as any, status: 'active', updated_by: CURRENT_OPERATOR, updated_at: now() });
  }
  csrDialog.value = false; ElMessage.success('保存成功');
}
function delCSR(row: any) {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' }).then(() => {
    const idx = store.customSearchResults.findIndex((r: any) => r.item_id === row.item_id);
    if (idx >= 0) {
      // 清除已关联的热搜词
      store.hotWordConfigs.forEach(h => { if (h.csr_id === row.item_id) h.csr_id = ''; });
      store.customSearchResults.splice(idx, 1);
    }
    ElMessage.success('已删除');
  }).catch(() => {});
}

function jumpTypeTag(t: string) {
  // v3.1.45: 新增 function_page 分支
  if (t === 'function_page') return 'primary';
  return t === 'product' ? 'warning' : t === 'project' ? 'success' : t === 'live' ? 'danger' : 'info';
}
function jumpTypeLabel(t: string) {
  // v3.1.45: 新增 function_page 分支
  if (t === 'function_page') return '功能页面';
  return t === 'product' ? '商品' : t === 'project' ? '项目主页' : t === 'live' ? '直播' : 'URL';
}

/** 热搜词状态切换时记录修改人/修改时间 */
function onHotStatusChange(row: any) {
  row.updated_by = CURRENT_OPERATOR;
  row.updated_at = now();
  syncWords();
}

/** 自定义搜索结果状态切换时记录修改人/修改时间 */
function onCSRStatusChange(row: any) {
  row.updated_by = CURRENT_OPERATOR;
  row.updated_at = now();
}
</script>

<style scoped>
.page-admin { padding: 20px; }
.card { margin-top: 16px; }
.toolbar { display: flex; gap: 8px; }

.hw-badge-preview {
  display: inline-block;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}
.badge-hot { background: #FFF1F0; color: #F5222D; }
.badge-fire { background: #FFF7E6; color: #FA8C16; }
.badge-new { background: #F6FFED; color: #52C41A; }
.badge-popular { background: #E6F7FF; color: #1890FF; }
.badge-recommend { background: #FFF0F6; color: #EB2F96; }
.badge-sale { background: #FFF1F0; color: #FF4D4F; }
</style>
