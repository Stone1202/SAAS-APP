<template>
  <!-- 运营后台 — 直播推荐管理 -->
  <div class="page-admin">
    <el-breadcrumb separator="/"><el-breadcrumb-item>运营后台</el-breadcrumb-item><el-breadcrumb-item>直播推荐管理</el-breadcrumb-item></el-breadcrumb>

    <el-card class="card" header="推荐规则配置">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="openAdd('manual')">+ 手动推荐直播</el-button>
        <el-button type="success" size="small" @click="openAdd('rule')">+ 添加推荐规则</el-button>
      </div>

      <el-table :data="list" border stripe size="small" style="margin-top:12px">
        <el-table-column prop="rec_id" label="ID" width="100" />
        <el-table-column label="推荐方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.rec_type === 'manual' ? 'warning' : 'primary'" size="small">
              {{ row.rec_type === 'manual' ? '手动推荐' : '规则推荐' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标/规则" min-width="220">
          <template #default="{ row }">
            <template v-if="row.rec_type === 'manual'">
              <el-tag size="small">直播ID: {{ row.target_id }}</el-tag>
            </template>
            <template v-else>
              <el-tag v-if="row.rule?.rule_type === 'status'" size="small" type="success">按直播状态</el-tag>
              <el-tag v-else-if="row.rule?.rule_type === 'viewer_count'" size="small" type="danger">按观看人数 — TOP {{ row.rule?.params?.limit || 4 }}</el-tag>
              <el-tag v-else size="small">{{ row.rule?.rule_type }}</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="disabled" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 预览 -->
    <el-card class="card" header="推荐效果预览">
      <div class="preview-grid">
        <div v-for="lv in previewLives" :key="lv.live_id" class="pv-item">
          <span class="pv-emoji">📺</span>
          <div class="pv-info">
            <div class="pv-title">{{ lv.title }}</div>
            <div class="pv-meta">{{ lv.anchor_name }} · {{ lv.viewer_count }}人观看</div>
          </div>
          <el-tag :type="lv.status === 'live' ? 'danger' : 'info'" size="small">{{ lv.status === 'live' ? '直播中' : '已结束' }}</el-tag>
        </div>
        <div v-if="!previewLives.length" class="pv-empty">暂无推荐直播</div>
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑推荐' : '新增推荐'" width="500px">
      <el-form :model="form" label-width="90px" size="small">
        <el-form-item label="推荐方式">
          <el-radio-group v-model="form.rec_type" :disabled="!!editingId">
            <el-radio value="manual">手动推荐</el-radio>
            <el-radio value="rule">规则推荐</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.rec_type === 'manual'">
          <el-form-item label="直播ID"><el-input v-model="form.target_id" placeholder="输入直播ID" /></el-form-item>
        </template>

        <template v-else>
          <el-form-item label="规则类型">
            <el-select v-model="form.rule.rule_type" style="width:100%">
              <el-option label="按直播状态（直播中优先）" value="status" />
              <el-option label="按观看人数（TOP N）" value="viewer_count" />
            </el-select>
          </el-form-item>
          <el-form-item label="取前N条" v-if="form.rule.rule_type === 'viewer_count'">
            <el-input-number v-model="form.rule.params.limit" :min="1" :max="20" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAppConfigStore } from '../../stores/app-config-store';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage, ElMessageBox } from 'element-plus';

const store = useAppConfigStore();
const projectStore = useProjectStore();
const list = computed(() => store.liveRecommendConfigs);

const dialogVisible = ref(false);
const editingId = ref('');
const form = reactive({
  rec_id: '', rec_type: 'manual' as string, target_id: '',
  rule: { rule_type: 'status', params: { limit: 4 } },
});

// 预览
const previewLives = computed(() => {
  const manual = store.liveRecommends;
  if (manual.length) return manual.map(r => projectStore.getLiveById(r.target_id)).filter(Boolean).slice(0, 8);
  return projectStore.liveRooms.filter(l => l.status === 'live').sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0)).slice(0, 8);
});

function openAdd(type: string) {
  editingId.value = '';
  form.rec_id = ''; form.rec_type = type; form.target_id = '';
  form.rule = { rule_type: 'status', params: { limit: 4 } };
  dialogVisible.value = true;
}

function openEdit(row: any) {
  editingId.value = row.rec_id;
  Object.assign(form, JSON.parse(JSON.stringify(row)));
  if (!form.rule) form.rule = { rule_type: 'status', params: { limit: 4 } };
  if (!form.rule.params) form.rule.params = { limit: 4 };
  dialogVisible.value = true;
}

function save() {
  if (form.rec_type === 'manual' && !form.target_id) { ElMessage.warning('请输入直播ID'); return; }
  if (editingId.value) {
    const idx = list.value.findIndex((r: any) => r.rec_id === editingId.value);
    if (idx >= 0) Object.assign(list.value[idx], JSON.parse(JSON.stringify(form)), { rec_id: editingId.value });
  } else {
    form.rec_id = `lr-${Date.now()}`;
    list.value.push({ ...JSON.parse(JSON.stringify(form)), status: 'active' });
  }
  dialogVisible.value = false; ElMessage.success('保存成功');
}

function del(row: any) {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' }).then(() => {
    const idx = list.value.findIndex((r: any) => r.rec_id === row.rec_id);
    if (idx >= 0) list.value.splice(idx, 1);
    ElMessage.success('已删除');
  }).catch(() => {});
}
</script>

<style scoped>
.page-admin { padding: 20px; }
.card { margin-top: 16px; }
.toolbar { display: flex; gap: 8px; }
.preview-grid { display: flex; flex-direction: column; gap: 8px; }
.pv-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: #fafafa; border-radius: 8px; }
.pv-emoji { font-size: 28px; }
.pv-info { flex: 1; }
.pv-title { font-size: 14px; font-weight: 600; color: #222; }
.pv-meta { font-size: 12px; color: #999; margin-top: 2px; }
.pv-empty { text-align: center; color: #bbb; padding: 40px 0; }
</style>
