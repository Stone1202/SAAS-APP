<template>
  <!-- 场景面板组件（v3.1.34 新增）— 复用于商城管理页3个Tab
       通用结构：规则引用 + 手动推荐列表 + 预览
       通过 props 接收 scenarioId / targetType，动态适配不同内容类型 -->
  <div class="scenario-panel">
    <!-- ========== 区域一：规则引用 ========== -->
    <!-- v3.1.36：当 showRuleSelector=false 时（首页直播推荐），改为显示"按默认规则读取"说明 -->
    <el-card v-if="showRuleSelector" class="card" :header="`引用规则（从规则引擎选择 — 内容类型：${contentTypeLabel}）`">
      <el-alert type="info" :closable="false" show-icon style="margin-bottom:12px">
        本场景引用规则引擎中的{{ targetTypeText }}排序规则。如需修改规则或新建规则，请前往「规则引擎管理」页面。
      </el-alert>
      <div class="rule-ref-row">
        <span class="rule-ref-label">当前引用规则：</span>
        <el-select
          v-model="currentRuleId"
          placeholder="请选择规则"
          style="width:340px"
          @change="onRuleChange"
        >
          <el-option
            v-for="r in availableRules"
            :key="r.rule_id"
            :label="`${r.name}${r.is_builtin ? '（内置）' : ''}${r.status === 'disabled' ? '（已停用）' : ''}`"
            :value="r.rule_id"
            :disabled="r.status === 'disabled'"
          />
        </el-select>
        <el-button size="small" @click="goRuleManage">前往规则引擎</el-button>
      </div>
      <div class="rule-detail" v-if="currentRule">
        <div class="rd-row">
          <span class="rd-label">排序链：</span>
          <div class="rd-dims">
            <el-tag v-for="(d, i) in currentRule.rule?.sort_dimensions || []" :key="i" size="small" type="info" class="dim-tag">
              {{ i + 1 }}. {{ dimLabel(d.dim_type) }}
              <span v-if="d.direction === 'desc'">↓</span>
              <span v-else-if="d.direction === 'asc'">↑</span>
            </el-tag>
            <span v-if="!currentRule.rule?.sort_dimensions?.length" class="dim-empty">无维度</span>
          </div>
        </div>
        <div class="rd-row" v-if="currentRule.description">
          <span class="rd-label">说明：</span>
          <span class="rd-desc">{{ currentRule.description }}</span>
        </div>
        <div class="rd-row">
          <span class="rd-label">展示条数：</span>
          <template v-if="showDisplayLimitEditor">
            <el-input-number
              v-model="displayLimitValue"
              :min="1"
              :max="displayLimitMax"
              size="small"
              placeholder="留空=无上限"
              @change="onDisplayLimitChange"
            />
            <span class="rd-hint">（留空=首页展示全部；填6=首页只展示前6条）</span>
          </template>
          <span v-else class="rd-desc">{{ displayLimitText }}</span>
        </div>
        <!-- v3.1.38 新增：规则引用生效状态 -->
        <div class="rd-row">
          <span class="rd-label">生效状态：</span>
          <el-tag :type="scenario?.effect_status === 'active' ? 'success' : 'warning'" size="small">
            {{ scenario?.effect_status === 'active' ? '已生效' : '待生效' }}
          </el-tag>
          <span v-if="scenario?.effect_status === 'pending'" class="rd-hint">规则数据同步中...</span>
        </div>
      </div>
      <div v-else class="pv-empty">未选择规则，请先选择一个规则</div>
    </el-card>

    <!-- v3.1.36 新增：默认规则说明卡（showRuleSelector=false 时显示，仅首页直播推荐使用） -->
    <el-card v-else class="card" header="默认规则说明（无需配置规则）">
      <el-alert type="success" :closable="false" show-icon style="margin-bottom:12px">
        本场景按<strong>默认规则</strong>读取推荐内容，不经过规则引擎，无需选择规则。如需调整，请在「规则引擎管理」中修改对应规则后，改为引用模式。
      </el-alert>
      <div class="default-rule-detail">
        <div class="rd-row">
          <span class="rd-label">规则名称：</span>
          <span class="rd-desc">直播默认排序规则（BR-SHP-042）</span>
        </div>
        <div class="rd-row">
          <span class="rd-label">排序规则：</span>
          <div class="rd-dims">
            <el-tag size="small" type="info" class="dim-tag">1. 按直播状态 ↓（live→upcoming→replay）</el-tag>
            <el-tag size="small" type="info" class="dim-tag">2. 按直播开始时间 ↓（最新在前）</el-tag>
          </div>
        </div>
        <div class="rd-row">
          <span class="rd-label">排除状态：</span>
          <span class="rd-desc">已结束（ended）不展示</span>
        </div>
        <div class="rd-row">
          <span class="rd-label">展示条数：</span>
          <template v-if="showDisplayLimitEditor">
            <el-input-number
              v-model="displayLimitValue"
              :min="1"
              :max="displayLimitMax"
              size="small"
              placeholder="留空=无上限"
              @change="onDisplayLimitChange"
            />
            <span class="rd-hint">（留空=首页展示全部；填6=首页只展示前6条）</span>
          </template>
          <span v-else class="rd-desc">{{ displayLimitText }}</span>
        </div>
      </div>
    </el-card>

    <!-- ========== 区域二：手动推荐列表 ========== -->
    <el-card class="card" :header="`手动推荐${contentTypeLabel}（优先级高于规则推荐）`">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="openSelector">+ 添加推荐{{ contentTypeLabel }}</el-button>
        <el-button type="danger" size="small" @click="batchDelete" :disabled="!manualSelected.length">批量删除 ({{ manualSelected.length }})</el-button>
        <span class="toolbar-tip">手动推荐排序优先于规则推荐结果；上移/下移调整展示顺序</span>
      </div>

      <el-table :data="pagedManualList" border stripe size="small" style="margin-top:12px" @selection-change="onManualSelectionChange">
        <el-table-column type="selection" width="45" />
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column :label="`${contentTypeLabel}信息`" min-width="300">
          <template #default="{ row }">
            <div class="item-cell">
              <span class="item-emoji">{{ itemEmoji }}</span>
              <div class="item-meta">
                <div class="item-title">{{ itemTitle(row.target_id) }}</div>
                <div class="item-sub">{{ itemSubInfo(row.target_id) }}</div>
              </div>
              <el-tag v-if="targetType === 'live'" :type="liveStatusTagType(row.target_id)" size="small">{{ liveStatusText(row.target_id) }}</el-tag>
              <el-tag v-else-if="targetType === 'product'" size="small" :type="productStatusTagType(row.target_id)">{{ productStatusText(row.target_id) }}</el-tag>
              <el-tag v-else-if="targetType === 'project'" size="small" type="success">{{ projectIndustryText(row.target_id) }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="120" align="center">
          <template #default="{ row }">
            <el-button size="small" link :disabled="isFirstInPage(row)" @click="moveUp(row)">↑ 上移</el-button>
            <el-button size="small" link :disabled="isLastInPage(row)" @click="moveDown(row)">↓ 下移</el-button>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="disabled" size="small" @change="onItemChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="修改人" width="100" align="center">
          <template #default="{ row }">{{ row.updated_by || '-' }}</template>
        </el-table-column>
        <el-table-column label="修改时间" width="160" align="center">
          <template #default="{ row }">{{ row.updated_at || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button size="small" type="danger" link @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!manualList.length" class="pv-empty">暂无手动推荐，所有推荐将来自规则引擎</div>
      <el-pagination
        v-if="manualList.length > manualPageSize"
        v-model:current-page="manualCurrentPage"
        :page-size="manualPageSize"
        :total="manualList.length"
        layout="total, prev, pager, next"
        small
        style="margin-top:12px; justify-content:flex-end;"
      />
    </el-card>

    <!-- ========== 推荐效果预览 ========== -->
    <el-card class="card" header="推荐效果预览（手动 + 规则叠加排序）">
      <div class="preview-grid">
        <div v-for="(it, i) in pagedPreviewItems" :key="itemKeyId(it)" class="pv-item">
          <span class="pv-index">{{ previewStartIndex + i + 1 }}</span>
          <span class="pv-emoji">{{ itemEmoji }}</span>
          <div class="pv-info">
            <div class="pv-title">{{ itemTitle(itemKeyId(it)) }}</div>
            <div class="pv-meta">{{ itemSubInfo(itemKeyId(it)) }}</div>
          </div>
          <el-tag v-if="targetType === 'live'" :type="liveStatusTagType2(it)" size="small">{{ liveStatusText2(it) }}</el-tag>
          <el-tag v-else-if="targetType === 'product'" size="small" :type="productStatusTagType2(it)">{{ productStatusText2(it) }}</el-tag>
          <el-tag v-else-if="targetType === 'project'" size="small" type="success">{{ projectIndustryText2(it) }}</el-tag>
          <el-tag size="small" :type="(previewStartIndex + i) < manualCount ? 'warning' : 'primary'">
            {{ (previewStartIndex + i) < manualCount ? '手动' : '规则' }}
          </el-tag>
        </div>
        <div v-if="!previewItems.length" class="pv-empty">暂无推荐{{ contentTypeLabel }}</div>
      </div>
      <el-pagination
        v-if="previewItems.length > previewPageSize"
        v-model:current-page="previewCurrentPage"
        :page-size="previewPageSize"
        :total="previewItems.length"
        layout="total, prev, pager, next"
        small
        style="margin-top:12px; justify-content:flex-end;"
      />
    </el-card>

    <!-- ========== 列表选择器弹窗 ========== -->
    <el-dialog v-model="selectorVisible" :title="`选择${contentTypeLabel}（支持搜索+多选）`" width="640px">
      <div class="selector-search">
        <el-input v-model="selectorKeyword" :placeholder="`搜索${selectorPlaceholder}`" size="small" clearable prefix-icon="Search" />
      </div>
      <el-table
        :data="selectorOptions"
        border
        stripe
        size="small"
        max-height="360"
        style="margin-top:10px"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column :prop="idField" label="ID" width="110" />
        <el-table-column :label="`${contentTypeLabel}名称`" min-width="200">
          <template #default="{ row }">{{ itemTitle(row[idField]) }}</template>
        </el-table-column>
        <el-table-column label="附加信息" min-width="160">
          <template #default="{ row }">{{ itemSubInfo(row[idField]) }}</template>
        </el-table-column>
        <el-table-column v-if="targetType === 'live'" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="liveStatusTagType2(row)" size="small">{{ liveStatusText2(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-else-if="targetType === 'product'" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="productStatusTagType2(row)" size="small">{{ productStatusText2(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-else-if="targetType === 'project'" label="行业" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ projectIndustryText2(row) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="selector-footer-tip" v-if="selectorSelected.length">
        已选 {{ selectorSelected.length }} 个{{ contentTypeLabel }}
      </div>
      <template #footer>
        <el-button @click="selectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelector" :disabled="!selectorSelected.length">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAppConfigStore } from '../../stores/app-config-store';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getDimensionsByTarget, anchorTypeText, sortLivesByDefaultRule } from '../../contracts/recommend-dimensions';
import type { RecommendItem, RecommendTargetType } from '../../contracts/recommend-engine';
import { useRecommendEngine } from '../../composables/useRecommendEngine';

const props = withDefaults(defineProps<{
  scenarioId: string;
  targetType: RecommendTargetType;
  contentTypeLabel: string;
  pageSize?: number;
  /** 是否展示"展示条数"编辑器（首页推荐区需要配置条数，商城精选Tab无需配置） */
  showDisplayLimitEditor?: boolean;
  /** v3.1.36 新增：是否展示"规则引用"选择器（默认 true）。
   *  false 时隐藏规则引用区域，改为显示"按默认规则读取"说明卡片，
   *  预览逻辑改用 sortLivesByDefaultRule 排序（仅首页直播推荐使用） */
  showRuleSelector?: boolean;
  /** v3.1.47 调整5&6：展示条数上限（默认50，直播推荐10，商品推荐100） */
  displayLimitMax?: number;
}>(), {
  pageSize: 10,
  showDisplayLimitEditor: false,
  showRuleSelector: true,
  displayLimitMax: 50,
});

const router = useRouter();
const store = useAppConfigStore();
const projectStore = useProjectStore();
const { getRecommendItems } = useRecommendEngine();

// 场景配置
const scenario = computed(() => store.recommendScenarios.find(s => s.scenario_id === props.scenarioId));
const list = computed<RecommendItem[]>(() => scenario.value?.recommend_configs || []);

const CURRENT_OPERATOR = '运营管理员';
function now() { return new Date().toISOString(); }

// 目标类型文本
const targetTypeText = computed(() => {
  switch (props.targetType) {
    case 'live': return '直播';
    case 'product': return '商品';
    case 'project': return '项目';
    default: return '';
  }
});

const idField = computed(() => {
  switch (props.targetType) {
    case 'live': return 'live_id';
    case 'product': return 'product_id';
    case 'project': return 'project_id';
    default: return 'id';
  }
});

const itemEmoji = computed(() => {
  switch (props.targetType) {
    case 'live': return '📺';
    case 'product': return '🛍️';
    case 'project': return '🏢';
    default: return '📦';
  }
});

const selectorPlaceholder = computed(() => {
  switch (props.targetType) {
    case 'live': return '直播标题/主播名称';
    case 'product': return '商品名称';
    case 'project': return '项目名称';
    default: return '名称';
  }
});

// 展示条数文本（v3.1.34：从场景 display_limit 读取）
const displayLimitText = computed(() => {
  const limit = scenario.value?.display_limit;
  return limit ? `${limit} 条` : '无上限（展示全部）';
});

// v3.1.35 新增：展示条数编辑器（首页推荐区使用）
const displayLimitValue = ref<number | undefined>(scenario.value?.display_limit);

// 当场景变化时同步 displayLimitValue（如切换Tab导致scenario变化）
watch(scenario, (sc) => {
  displayLimitValue.value = sc?.display_limit;
});

function onDisplayLimitChange(val: number | undefined) {
  const result = store.updateScenarioDisplayLimit(props.scenarioId, val);
  if (result.success) {
    ElMessage.success(val ? `展示条数已设为 ${val} 条` : '已设为无上限（展示全部）');
  } else {
    ElMessage.error(result.message || '设置失败');
    // 恢复原值
    displayLimitValue.value = scenario.value?.display_limit;
  }
}

// ============================================
// 规则引用
// ============================================
const availableRules = computed(() => store.allRulesByTarget(props.targetType));
const currentRuleId = computed<string>({
  get: () => scenario.value?.rule_id || '',
  set: () => {},
});
const currentRule = computed(() => store.getRuleById(currentRuleId.value));

function onRuleChange(ruleId: string) {
  const result = store.setScenarioRule(props.scenarioId, ruleId);
  if (result.success) {
    ElMessage.success('规则已切换');
  } else {
    ElMessage.error(result.message || '切换失败');
  }
}

function dimLabel(dimType: string): string {
  const dims = getDimensionsByTarget(props.targetType);
  return dims.find(d => d.dim_type === dimType)?.label || dimType;
}

function goRuleManage() {
  router.push('/admin/recommend-rule');
}

// ============================================
// 数据源获取（按目标类型）
// ============================================
const allItems = computed(() => {
  switch (props.targetType) {
    case 'live': return projectStore.liveRooms;
    case 'product': return projectStore.products.filter(p => p.status === 'on_sale');
    case 'project': return projectStore.projects;
    default: return [];
  }
});

function getItemById(id: string): any {
  return allItems.value.find((it: any) => it[idField.value] === id);
}

function itemTitle(id: string): string {
  const it = getItemById(id);
  if (!it) return `（${props.contentTypeLabel}不存在）`;
  return it.title || it.name || it.mall_name || '-';
}

function itemSubInfo(id: string): string {
  const it = getItemById(id);
  if (!it) return `ID: ${id}`;
  switch (props.targetType) {
    case 'live':
      return `ID: ${id} · ${it.anchor_name || '-'} · ${anchorTypeText(it.anchor_type)} · ${it.viewer_count || 0}人观看`;
    case 'product':
      return `ID: ${id} · ¥${it.price || 0} · 销量${it.sales || 0} · ${it.category || '-'}`;
    case 'project':
      return `ID: ${id} · ${it.mall_name || it.name || '-'} · ${projectIndustryText2(it)}`;
    default:
      return `ID: ${id}`;
  }
}

function itemKeyId(it: any): string {
  return it[idField.value];
}

// 直播状态
const LIVE_STATUS_TEXT: Record<string, string> = { live: '直播中', upcoming: '预告', replay: '回放', ended: '已结束' };
const LIVE_STATUS_TAG: Record<string, string> = { live: 'danger', upcoming: 'warning', replay: 'info', ended: 'info' };
function liveStatusText(id: string) { return LIVE_STATUS_TEXT[getItemById(id)?.status || ''] || '-'; }
function liveStatusTagType(id: string) { return LIVE_STATUS_TAG[getItemById(id)?.status || ''] || 'info'; }
function liveStatusText2(lv: any) { return LIVE_STATUS_TEXT[lv?.status] || '-'; }
function liveStatusTagType2(lv: any) { return LIVE_STATUS_TAG[lv?.status] || 'info'; }

// 商品状态
const PRODUCT_STATUS_TEXT: Record<string, string> = { on_sale: '在售', off_shelf: '已下架', draft: '草稿' };
const PRODUCT_STATUS_TAG: Record<string, string> = { on_sale: 'success', off_shelf: 'info', draft: 'warning' };
function productStatusText(id: string) { return PRODUCT_STATUS_TEXT[getItemById(id)?.status || ''] || '-'; }
function productStatusTagType(id: string) { return PRODUCT_STATUS_TAG[getItemById(id)?.status || ''] || 'info'; }
function productStatusText2(p: any) { return PRODUCT_STATUS_TEXT[p?.status] || '-'; }
function productStatusTagType2(p: any) { return PRODUCT_STATUS_TAG[p?.status] || 'info'; }

// 项目行业
const INDUSTRY_LABELS: Record<string, string> = {
  daily_necessities: '日用百货',
  health_products: '健康用品',
  food_beverage: '食品饮料',
  home_appliance: '家居家电',
  beauty_care: '美妆个护',
};
function projectIndustryText(id: string) { return INDUSTRY_LABELS[getItemById(id)?.industry] || '未分类'; }
function projectIndustryText2(p: any) { return INDUSTRY_LABELS[p?.industry] || '未分类'; }

// ============================================
// 手动推荐列表（分页）
// ============================================
const manualPageSize = props.pageSize;
const manualCurrentPage = ref(1);

const manualList = computed(() =>
  list.value
    .filter((r: RecommendItem) => r.rec_type === 'manual')
    .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
);

const pagedManualList = computed(() => {
  const start = (manualCurrentPage.value - 1) * manualPageSize;
  return manualList.value.slice(start, start + manualPageSize);
});

function isFirstInPage(row: any): boolean {
  const pageStart = (manualCurrentPage.value - 1) * manualPageSize;
  return manualList.value.findIndex(r => r.rec_id === row.rec_id) === pageStart;
}
function isLastInPage(row: any): boolean {
  const idx = manualList.value.findIndex(r => r.rec_id === row.rec_id);
  return idx === manualList.value.length - 1;
}

function moveUp(row: any) {
  const sorted = [...manualList.value];
  const idx = sorted.findIndex(r => r.rec_id === row.rec_id);
  if (idx <= 0) return;
  const prev = sorted[idx - 1];
  const tmp = row.sort_order ?? idx;
  row.sort_order = prev.sort_order ?? (idx - 1);
  prev.sort_order = tmp;
  row.updated_by = CURRENT_OPERATOR; row.updated_at = now();
  prev.updated_by = CURRENT_OPERATOR; prev.updated_at = now();
  ElMessage.success('已上移');
}

function moveDown(row: any) {
  const sorted = [...manualList.value];
  const idx = sorted.findIndex(r => r.rec_id === row.rec_id);
  if (idx < 0 || idx >= sorted.length - 1) return;
  const next = sorted[idx + 1];
  const tmp = row.sort_order ?? idx;
  row.sort_order = next.sort_order ?? (idx + 1);
  next.sort_order = tmp;
  row.updated_by = CURRENT_OPERATOR; row.updated_at = now();
  next.updated_by = CURRENT_OPERATOR; next.updated_at = now();
  ElMessage.success('已下移');
}

function onItemChange(row: any) {
  row.updated_by = CURRENT_OPERATOR;
  row.updated_at = now();
}

function del(row: any) {
  ElMessageBox.confirm('确认删除该手动推荐？', '提示', { type: 'warning' }).then(() => {
    const idx = list.value.findIndex((r: any) => r.rec_id === row.rec_id);
    if (idx >= 0) list.value.splice(idx, 1);
    ElMessage.success('已删除');
  }).catch(() => {});
}

const manualSelected = ref<any[]>([]);
function onManualSelectionChange(sel: any[]) { manualSelected.value = sel; }
function batchDelete() {
  if (!manualSelected.value.length) return;
  ElMessageBox.confirm(`确认删除选中的 ${manualSelected.value.length} 条手动推荐？`, '批量删除', { type: 'warning' }).then(() => {
    const ids = new Set(manualSelected.value.map(r => r.rec_id));
    for (let i = list.value.length - 1; i >= 0; i--) {
      if (ids.has(list.value[i].rec_id)) list.value.splice(i, 1);
    }
    ElMessage.success(`已删除 ${manualSelected.value.length} 条`);
    manualSelected.value = [];
  }).catch(() => {});
}

// ============================================
// 列表选择器弹窗
// ============================================
const selectorVisible = ref(false);
const selectorKeyword = ref('');
const selectorSelected = ref<any[]>([]);

const selectorOptions = computed(() => {
  const addedIds = new Set(list.value.filter(r => r.rec_type === 'manual').map(r => r.target_id));
  const kw = selectorKeyword.value.toLowerCase();
  return (allItems.value as any[]).filter(it => {
    const itemId = it[idField.value];
    if (addedIds.has(itemId)) return false;
    if (!kw) return true;
    const title = (it.title || it.name || it.mall_name || '').toLowerCase();
    const sub = (it.anchor_name || '').toLowerCase();
    return title.includes(kw) || sub.includes(kw);
  });
});

function openSelector() {
  selectorKeyword.value = '';
  selectorSelected.value = [];
  selectorVisible.value = true;
}
function onSelectionChange(sel: any[]) { selectorSelected.value = sel; }
function confirmSelector() {
  if (!selectorSelected.value.length) return;
  const maxSort = Math.max(-1, ...list.value.filter(r => r.rec_type === 'manual').map(r => r.sort_order ?? -1));
  selectorSelected.value.forEach((it, i) => {
    list.value.push({
      rec_id: `mr-${Date.now()}-${i}`,
      rec_type: 'manual',
      target_id: it[idField.value],
      status: 'active',
      sort_order: maxSort + i + 1,
      updated_by: CURRENT_OPERATOR,
      updated_at: now(),
    });
  });
  ElMessage.success(`已添加 ${selectorSelected.value.length} 个推荐${props.contentTypeLabel}`);
  selectorVisible.value = false;
}

// ============================================
// 推荐效果预览（手动 + 规则叠加，分页）
// v3.1.34：展示条数从场景 display_limit 读取
// ============================================
const previewPageSize = props.pageSize;
const previewCurrentPage = ref(1);
const previewStartIndex = computed(() => (previewCurrentPage.value - 1) * previewPageSize);

const manualCount = computed(() =>
  manualList.value.filter(r => r.status === 'active').length
);

const previewItems = computed(() => {
  // v3.1.36：showRuleSelector=false 时（首页直播推荐），不传 ruleId，allItems 预先用默认规则排序
  if (!props.showRuleSelector) {
    const sortedByDefault = sortLivesByDefaultRule(allItems.value as any);
    return getRecommendItems<any>({
      targetType: props.targetType,
      recommendConfigs: list.value,
      allItems: sortedByDefault as any,
      idField: idField.value,
      displayLimit: scenario.value?.display_limit,
    });
  }
  if (!currentRuleId.value) {
    // 未引用规则时，仅展示手动推荐
    return manualList.value
      .filter(r => r.status === 'active')
      .map(r => getItemById(r.target_id))
      .filter(Boolean) as any[];
  }
  return getRecommendItems<any>({
    targetType: props.targetType,
    recommendConfigs: list.value,
    allItems: allItems.value as any,
    idField: idField.value,
    ruleId: currentRuleId.value,
    displayLimit: scenario.value?.display_limit, // v3.1.34：从场景读取
  });
});

const pagedPreviewItems = computed(() => {
  const start = previewStartIndex.value;
  return previewItems.value.slice(start, start + previewPageSize);
});
</script>

<style scoped>
.scenario-panel { margin-top: 12px; }
.card { margin-top: 16px; }
.toolbar { display: flex; align-items: center; gap: 12px; }
.toolbar-tip { font-size: 12px; color: #999; }

/* 规则引用 */
.rule-ref-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.rule-ref-label {
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}
.rule-detail {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}
/* v3.1.36 默认规则说明卡 */
.default-rule-detail {
  padding: 12px;
  background: #f0f9eb;
  border-radius: 8px;
}
.rd-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}
.rd-row:last-child { margin-bottom: 0; }
.rd-label {
  color: #999;
  flex-shrink: 0;
  min-width: 70px;
}
.rd-desc {
  color: #666;
}
.rd-hint {
  color: #999;
  font-size: 12px;
}
.rd-dims {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.dim-tag {
  font-size: 11px;
}
.dim-empty {
  font-size: 12px;
  color: #ccc;
}

/* 预览 */
.preview-grid { display: flex; flex-direction: column; gap: 8px; }
.pv-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #fafafa; border-radius: 8px; }
.pv-index { width: 24px; height: 24px; border-radius: 50%; background: #FF6B35; color: #fff; font-size: 12px; line-height: 24px; text-align: center; flex-shrink: 0; }
.pv-emoji { font-size: 24px; }
.pv-info { flex: 1; }
.pv-title { font-size: 14px; font-weight: 600; color: #222; }
.pv-meta { font-size: 12px; color: #999; margin-top: 2px; }
.pv-empty { text-align: center; color: #bbb; padding: 40px 0; }

.item-cell { display: flex; align-items: center; gap: 10px; }
.item-emoji { font-size: 22px; }
.item-meta { flex: 1; }
.item-title { font-size: 13px; font-weight: 600; color: #222; }
.item-sub { font-size: 11px; color: #999; margin-top: 2px; }

.selector-search { margin-bottom: 8px; }
.selector-footer-tip { margin-top: 8px; font-size: 13px; color: #67C23A; text-align: right; }
</style>
