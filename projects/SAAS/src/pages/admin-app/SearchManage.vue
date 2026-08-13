<template>
  <!-- 运营后台 — 搜索管理 -->
  <div class="page-admin">
    <el-breadcrumb separator="/"><el-breadcrumb-item>运营后台</el-breadcrumb-item><el-breadcrumb-item>搜索管理</el-breadcrumb-item></el-breadcrumb>

    <!-- 底纹词 -->
    <el-card class="card" header="搜索底纹词">
      <el-form :inline="true" size="small">
        <el-form-item label="底纹词">
          <el-input v-model="store.searchHint" placeholder="搜索框提示文字" style="width:300px" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="saveHint">保存</el-button></el-form-item>
      </el-form>
    </el-card>

    <!-- 热搜词管理 -->
    <el-card class="card" header="热搜词管理">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="openHotWordAdd">+ 添加热搜词</el-button>
      </div>
      <el-table :data="hotWordList" border stripe size="small" style="margin-top:12px">
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
        <el-table-column label="固定排序" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.fixed ? 'warning' : 'info'" size="small">{{ row.fixed ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="权重" width="60" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="disabled" size="small" @change="syncWords" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openHotWordEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="delHotWord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 自定义搜索结果 -->
    <el-card class="card" header="自定义搜索结果">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="openCSRAdd">+ 添加自定义结果</el-button>
      </div>
      <el-table :data="csrList" border stripe size="small" style="margin-top:12px">
        <el-table-column prop="item_id" label="ID" width="80" />
        <el-table-column prop="title" label="展示标题" min-width="160" show-overflow-tooltip />
        <el-table-column label="跳转类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="jumpTypeTag(row.jump_type)" size="small">{{ jumpTypeLabel(row.jump_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="disabled" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openCSREdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="delCSR(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 热搜词弹窗 -->
    <el-dialog v-model="hotDialog" :title="hotEditingIdx >= 0 ? '编辑热搜词' : '新增热搜词'" width="500px">
      <el-form :model="hotForm" label-width="100px" size="small">
        <el-form-item label="热搜词"><el-input v-model="hotForm.word" /></el-form-item>
        <el-form-item label="标签图标">
          <el-select v-model="hotForm.badge" style="width:100%" clearable placeholder="不设置图标">
            <el-option v-for="b in badgeOptions" :key="b.value" :label="b.label" :value="b.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="固定排序"><el-switch v-model="hotForm.fixed" /></el-form-item>
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
        <el-form-item label="展示标题"><el-input v-model="csrForm.title" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="csrForm.description" type="textarea" :rows="2" /></el-form-item>

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
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAppConfigStore } from '../../stores/app-config-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import JumpTargetPicker from '../../components/admin/JumpTargetPicker.vue';

const store = useAppConfigStore();

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
function saveHint() { ElMessage.success('底纹词已保存'); }

// 同步 hotWords 数组
function syncWords() {
  store.syncHotWords();
}

// 热搜词
const hotWordList = computed(() => store.hotWordConfigs);
const hotDialog = ref(false);
const hotEditingIdx = ref(-1);
const hotForm = reactive({ word: '', fixed: false, weight: 50, badge: '' as string, csr_id: '' });

function openHotWordAdd() {
  hotEditingIdx.value = -1;
  Object.assign(hotForm, { word: '', fixed: false, weight: 50, badge: '', csr_id: '' });
  hotDialog.value = true;
}
function openHotWordEdit(row: any) {
  hotEditingIdx.value = hotWordList.value.indexOf(row);
  Object.assign(hotForm, row);
  hotDialog.value = true;
}
function saveHotWord() {
  if (!hotForm.word) { ElMessage.warning('请输入热搜词'); return; }
  if (hotEditingIdx.value >= 0) Object.assign(hotWordList.value[hotEditingIdx.value], hotForm);
  else hotWordList.value.push({ ...hotForm, status: 'active' });
  syncWords();
  hotDialog.value = false; ElMessage.success('保存成功');
}
function delHotWord(row: any) {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' }).then(() => {
    const idx = hotWordList.value.indexOf(row);
    if (idx >= 0) hotWordList.value.splice(idx, 1);
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
  linkHWIndex.value = hotWordList.value.indexOf(row);
  linkCSRId.value = '';
  csrLinkDialog.value = true;
}
function confirmCSRLink() {
  if (!linkCSRId.value) { ElMessage.warning('请选择一个自定义结果'); return; }
  if (linkHWIndex.value >= 0) {
    hotWordList.value[linkHWIndex.value].csr_id = linkCSRId.value;
  }
  syncWords();
  csrLinkDialog.value = false; ElMessage.success('关联成功');
}

// 自定义搜索结果
const csrList = computed(() => store.customSearchResults);
const csrDialog = ref(false);
const csrEditingId = ref('');
const csrForm = reactive({
  item_id: '', title: '', description: '',
  jump_type: 'product' as string, jump_id: '', project_id: '', store_id: '',
});

function openCSRAdd() {
  csrEditingId.value = '';
  // 直接覆盖设值，避免 v-model 的 @change 触发重置
  csrForm.item_id = '';
  csrForm.title = '';
  csrForm.description = '';
  csrForm.jump_type = 'product';
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
  csrForm.jump_type = row.jump_type;
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
  if (csrForm.jump_type === 'url' && !csrForm.jump_id) { ElMessage.warning('请填写URL路径'); return; }
  if (csrEditingId.value) {
    const idx = csrList.value.findIndex((r: any) => r.item_id === csrEditingId.value);
    if (idx >= 0) Object.assign(csrList.value[idx], { ...csrForm, item_id: csrEditingId.value });
  } else {
    csrForm.item_id = `csr-${Date.now()}`;
    csrList.value.push({ ...csrForm, status: 'active' });
  }
  csrDialog.value = false; ElMessage.success('保存成功');
}
function delCSR(row: any) {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' }).then(() => {
    const idx = csrList.value.findIndex((r: any) => r.item_id === row.item_id);
    if (idx >= 0) {
      // 清除已关联的热搜词
      store.hotWordConfigs.forEach(h => { if (h.csr_id === row.item_id) h.csr_id = ''; });
      csrList.value.splice(idx, 1);
    }
    ElMessage.success('已删除');
  }).catch(() => {});
}

function jumpTypeTag(t: string) { return t === 'product' ? 'warning' : t === 'project' ? 'success' : t === 'live' ? 'danger' : 'info'; }
function jumpTypeLabel(t: string) { return t === 'product' ? '商品' : t === 'project' ? '项目主页' : t === 'live' ? '直播' : 'URL'; }
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
