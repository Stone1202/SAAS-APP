<template>
  <!-- 场景面板组件（v3.1.34 新增）— 复用于商城管理页3个Tab
       通用结构：规则引用 + 手动推荐列表 + 预览
       通过 props 接收 scenarioId / targetType，动态适配不同内容类型
       v3.1.55：草稿模式重构——所有改动先存本地草稿，点击底部保存栏「保存配置」才写回 Store 生效；
                弹窗字段标准化；列表信息列按 targetType 专用渲染；分页始终渲染；去掉首页直播推荐默认规则说明卡的 el-alert
       v3.1.58：选择器弹窗限制最多选择10条；手动推荐列表去掉分页全量展示；推荐效果预览去掉分页改前30条截断
       v3.1.59：选择器改为编辑模式——候选列表不再过滤已选项（打开弹窗预勾选已有手动推荐）；
                翻页/搜索自动同步勾选；确认=全量同步（取消勾选=移除，勾选=新增，允许全取消清空）；
                "最多10条"指手动推荐总数上限（含已有+本次勾选），"已选N条"为当前总已选数量 -->
  <div class="scenario-panel">
    <!-- ========== 区域一：规则引用 ========== -->
    <el-card v-if="showRuleSelector" class="card" :header="`引用规则（从规则引擎选择 — 内容类型：${contentTypeLabel}）`">
      <div class="rule-ref-row">
        <span class="rule-ref-label">当前引用规则：</span>
        <el-select
          v-model="draftRuleId"
          placeholder="请选择规则"
          style="width:340px"
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
              v-model="draftDisplayLimit"
              :min="1"
              :max="displayLimitMax"
              size="small"
            />
            <span class="rd-hint">（填6=首页只展示前6条）</span>
          </template>
          <span v-else class="rd-desc">{{ displayLimitText }}</span>
        </div>
        <!-- 规则引用生效状态 -->
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

    <!-- 默认规则说明卡（showRuleSelector=false 时显示，仅首页直播推荐使用）
         v3.1.55：按需求去掉 el-alert 那句"本场景按默认规则读取..."说明 -->
    <el-card v-else class="card" header="默认规则说明（无需配置规则）">
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
              v-model="draftDisplayLimit"
              :min="1"
              :max="displayLimitMax"
              size="small"
            />
            <span class="rd-hint">（填6=首页只展示前6条）</span>
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

      <el-table :data="manualList" border stripe size="small" style="margin-top:12px" @selection-change="onManualSelectionChange">
        <el-table-column type="selection" width="45" />
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <!-- 信息列：按 targetType 专用渲染（v3.1.55 字段精简） -->
        <el-table-column :label="`${contentTypeLabel}信息`" min-width="320">
          <template #default="{ row }">
            <!-- 直播：直播图 + 直播间名称 + 直播编号 + 主播名称 + 主播类型 -->
            <div v-if="targetType === 'live'" class="item-cell">
              <img :src="liveCover(row.target_id)" class="item-thumb" v-if="liveCover(row.target_id)" />
              <span v-else class="item-emoji">{{ itemEmoji }}</span>
              <div class="item-meta">
                <div class="item-title">{{ liveTitle(row.target_id) }}</div>
                <div class="item-sub">编号：{{ row.target_id }} · 主播：{{ liveAnchorName(row.target_id) }} · {{ anchorTypeText(liveAnchorType(row.target_id)) }}</div>
              </div>
            </div>
            <!-- 商品：商品图 + 商品名称 + 商品编号 + 商品价格 + 商品类目 -->
            <div v-else-if="targetType === 'product'" class="item-cell">
              <img :src="productCover(row.target_id)" class="item-thumb" v-if="productCover(row.target_id)" />
              <span v-else class="item-emoji">{{ itemEmoji }}</span>
              <div class="item-meta">
                <div class="item-title">{{ productName(row.target_id) }}</div>
                <div class="item-sub">编号：{{ row.target_id }} · ¥{{ productPrice(row.target_id) }} · 类目：{{ productCategory(row.target_id) }}</div>
              </div>
            </div>
            <!-- 项目：项目名称 + 项目编号 + 所属行业 -->
            <div v-else-if="targetType === 'project'" class="item-cell">
              <span class="item-emoji">{{ itemEmoji }}</span>
              <div class="item-meta">
                <div class="item-title">{{ projectName(row.target_id) }}</div>
                <div class="item-sub">编号：{{ row.target_id }} · 行业：{{ projectIndustryText(row.target_id) }}</div>
              </div>
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
      <!-- v3.1.58：去掉手动推荐列表分页（手动推荐数量有限，全量展示） -->

    </el-card>

    <!-- ========== 推荐效果预览 ========== -->
    <el-card class="card" header="推荐效果预览（手动 + 规则叠加排序 · 前30条）">
      <div class="preview-grid">
        <div v-for="(it, i) in visiblePreviewItems" :key="itemKeyId(it)" class="pv-item">
          <span class="pv-index">{{ i + 1 }}</span>
          <!-- 预览信息区：按 targetType 专用渲染（v3.1.55 字段精简） -->
          <img v-if="targetType === 'live' && liveCover(itemKeyId(it))" :src="liveCover(itemKeyId(it))" class="pv-thumb" />
          <img v-else-if="targetType === 'product' && productCover(itemKeyId(it))" :src="productCover(itemKeyId(it))" class="pv-thumb" />
          <span v-else class="pv-emoji">{{ itemEmoji }}</span>
          <div class="pv-info">
            <!-- 直播：直播间名称 + 直播编号 + 主播名称 + 主播类型 -->
            <template v-if="targetType === 'live'">
              <div class="pv-title">{{ liveTitle(itemKeyId(it)) }}</div>
              <div class="pv-meta">编号：{{ itemKeyId(it) }} · 主播：{{ liveAnchorName(itemKeyId(it)) }} · {{ anchorTypeText(liveAnchorType(itemKeyId(it))) }}</div>
            </template>
            <!-- 商品：商品名称 + 商品编号 + 商品价格 + 商品类目 -->
            <template v-else-if="targetType === 'product'">
              <div class="pv-title">{{ productName(itemKeyId(it)) }}</div>
              <div class="pv-meta">编号：{{ itemKeyId(it) }} · ¥{{ productPrice(itemKeyId(it)) }} · 类目：{{ productCategory(itemKeyId(it)) }}</div>
            </template>
            <!-- 项目：项目名称 + 项目编号 + 所属行业 -->
            <template v-else-if="targetType === 'project'">
              <div class="pv-title">{{ projectName(itemKeyId(it)) }}</div>
              <div class="pv-meta">编号：{{ itemKeyId(it) }} · 行业：{{ projectIndustryText(itemKeyId(it)) }}</div>
            </template>
          </div>
          <el-tag size="small" :type="i < manualCount ? 'warning' : 'primary'">
            {{ i < manualCount ? '手动' : '规则' }}
          </el-tag>
        </div>
        <div v-if="!previewItems.length" class="pv-empty">暂无推荐{{ contentTypeLabel }}</div>
      </div>
      <!-- v3.1.58：去掉预览分页（前30条全量展示） -->
    </el-card>

    <!-- ========== 列表选择器弹窗（v3.1.59：编辑模式——预勾选已有+可取消勾选+总数上限10条） ========== -->
    <el-dialog v-model="selectorVisible" :title="`选择${contentTypeLabel}（可取消已选 · 最多${SELECTOR_MAX}条）`" width="880px">
      <div class="selector-search">
        <el-input
          v-model="selectorKeyword"
          :placeholder="selectorSearchPlaceholder"
          size="small"
          clearable
          prefix-icon="Search"
          @input="onSelectorKeywordChange"
        />
      </div>
      <el-table
        ref="selectorTableRef"
        :data="pagedSelectorOptions"
        :row-key="idField"
        border
        stripe
        size="small"
        max-height="360"
        style="margin-top:10px"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <!-- 直播弹窗列：直播编号 / 直播名称 / 主播名称 / 主播类型 / 直播状态 / 所属项目（v3.1.57新增所属项目列） -->
        <template v-if="targetType === 'live'">
          <el-table-column prop="live_id" label="直播编号" width="140" />
          <el-table-column label="直播名称" min-width="180">
            <template #default="{ row }">{{ row.title }}</template>
          </el-table-column>
          <el-table-column label="主播名称" width="120">
            <template #default="{ row }">{{ row.anchor_name }}</template>
          </el-table-column>
          <el-table-column label="主播类型" width="100">
            <template #default="{ row }">{{ anchorTypeText(row.anchor_type) }}</template>
          </el-table-column>
          <el-table-column label="直播状态" width="90">
            <template #default="{ row }">
              <el-tag :type="liveStatusTagType2(row)" size="small">{{ liveStatusText2(row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="所属项目" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ rowProjectName(row.project_id) }}</template>
          </el-table-column>
        </template>
        <!-- 商品弹窗列：商品编号 / 商品名称 / 商品价格 / 商品状态 / 所属项目（v3.1.57新增所属项目列） -->
        <template v-else-if="targetType === 'product'">
          <el-table-column prop="product_id" label="商品编号" width="140" />
          <el-table-column label="商品名称" min-width="200">
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="商品价格" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column label="商品状态" width="90">
            <template #default="{ row }">
              <el-tag :type="productStatusTagType2(row)" size="small">{{ productStatusText2(row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="所属项目" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ rowProjectName(row.project_id) }}</template>
          </el-table-column>
        </template>
        <!-- 项目弹窗列：项目编号 / 项目名称 / 租户编号 / 所属行业 -->
        <template v-else-if="targetType === 'project'">
          <el-table-column prop="project_id" label="项目编号" width="140" />
          <el-table-column label="项目名称" min-width="180">
            <template #default="{ row }">{{ row.mall_name || row.name }}</template>
          </el-table-column>
          <el-table-column prop="tenant_id" label="租户编号" width="140" />
          <el-table-column label="所属行业" width="110">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ projectIndustryText2(row) }}</el-tag>
            </template>
          </el-table-column>
        </template>
      </el-table>
      <!-- 弹窗分页（每页10条，搜索后重置第1页） -->
      <el-pagination
        v-model:current-page="selectorCurrentPage"
        :page-size="selectorPageSize"
        :total="selectorOptions.length"
        layout="total, prev, pager, next"
        small
        style="margin-top:10px; justify-content:flex-end;"
      />
      <div class="selector-footer-tip" v-if="selectorSelected.length">
        已选 {{ selectorSelected.length }} 条，最多选择 {{ SELECTOR_MAX }} 条
      </div>
      <template #footer>
        <el-button @click="selectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelector" :disabled="!selectorSelected.length">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- ========== 底部固定保存栏（v3.1.55 草稿模式） ========== -->
    <div class="save-bar" :class="{ 'has-changes': unsavedCount > 0 }">
      <span class="save-status" v-if="unsavedCount === 0">✓ 配置已保存</span>
      <span class="save-status warning" v-else>⚠ 有 {{ unsavedCount }} 处未保存改动</span>
      <el-button type="primary" :disabled="unsavedCount === 0" @click="saveAll">保存配置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
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
  /** 是否展示"规则引用"选择器（默认 true）。
   *  false 时隐藏规则引用区域，改为显示"按默认规则读取"说明卡片，
   *  预览逻辑改用 sortLivesByDefaultRule 排序（仅首页直播推荐使用） */
  showRuleSelector?: boolean;
  /** 展示条数上限（默认50，直播推荐10，商品推荐100） */
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

// 弹窗搜索框 placeholder（v3.1.55：按编号+名称双字段搜索）
const selectorSearchPlaceholder = computed(() => {
  switch (props.targetType) {
    case 'live': return '搜索直播名称 / 直播编号';
    case 'product': return '搜索商品名称 / 商品编号';
    case 'project': return '搜索项目名称 / 项目编号';
    default: return '搜索名称 / 编号';
  }
});

// 展示条数文本（只读模式下显示）
const displayLimitText = computed(() => {
  const limit = scenario.value?.display_limit;
  return limit ? `${limit} 条` : '无上限（展示全部）';
});

// ============================================
// v3.1.55 草稿模式状态（本地草稿，不直接写 Store）
// ============================================
const draftConfigs = ref<RecommendItem[]>([]);
const draftRuleId = ref<string>('');
const draftDisplayLimit = ref<number | undefined>(undefined);

// 初始化/同步草稿：从 store 深拷贝
function syncDraftFromStore() {
  const sc = scenario.value;
  if (!sc) {
    draftConfigs.value = [];
    draftRuleId.value = '';
    draftDisplayLimit.value = undefined;
    return;
  }
  draftConfigs.value = JSON.parse(JSON.stringify(sc.recommend_configs || []));
  draftRuleId.value = sc.rule_id || '';
  draftDisplayLimit.value = sc.display_limit;
}

// 场景变化时同步草稿（含初始化）
watch(scenario, () => syncDraftFromStore(), { immediate: true });

// 差异检测
const unsavedCount = computed(() => {
  const sc = scenario.value;
  if (!sc) return 0;
  let count = 0;
  // configs 差异（深比较）
  const storeConfigs = sc.recommend_configs || [];
  if (JSON.stringify(draftConfigs.value) !== JSON.stringify(storeConfigs)) count++;
  // ruleId 差异
  if (draftRuleId.value !== (sc.rule_id || '')) count++;
  // displayLimit 差异
  if (draftDisplayLimit.value !== sc.display_limit) count++;
  return count;
});

// 保存：写回 store
function saveAll() {
  const sc = scenario.value;
  if (!sc) return;
  // 规则
  if (draftRuleId.value !== sc.rule_id) {
    const r = store.setScenarioRule(props.scenarioId, draftRuleId.value);
    if (!r.success) { ElMessage.error(r.message || '规则切换失败'); return; }
  }
  // 展示条数
  if (draftDisplayLimit.value !== sc.display_limit) {
    const r = store.updateScenarioDisplayLimit(props.scenarioId, draftDisplayLimit.value);
    if (!r.success) { ElMessage.error(r.message || '展示条数设置失败'); return; }
  }
  // 手动推荐列表
  if (JSON.stringify(draftConfigs.value) !== JSON.stringify(sc.recommend_configs || [])) {
    sc.recommend_configs = JSON.parse(JSON.stringify(draftConfigs.value));
  }
  ElMessage.success('配置已保存并生效');
}

// 暴露给父组件检测未保存改动
defineExpose({
  hasUnsavedChanges: () => unsavedCount.value > 0,
  getUnsavedCount: () => unsavedCount.value,
});

// ============================================
// 规则引用
// ============================================
const availableRules = computed(() => store.allRulesByTarget(props.targetType));
const currentRule = computed(() => store.getRuleById(draftRuleId.value));

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

function itemKeyId(it: any): string {
  return it[idField.value];
}

// === 直播字段访问器（v3.1.55） ===
function liveCover(id: string): string { return getItemById(id)?.cover_image || ''; }
function liveTitle(id: string): string { return getItemById(id)?.title || `（${props.contentTypeLabel}不存在）`; }
function liveAnchorName(id: string): string { return getItemById(id)?.anchor_name || '-'; }
function liveAnchorType(id: string): string { return getItemById(id)?.anchor_type || ''; }

// === 商品字段访问器（v3.1.55） ===
function productCover(id: string): string { return getItemById(id)?.cover_image || ''; }
function productName(id: string): string { return getItemById(id)?.name || `（${props.contentTypeLabel}不存在）`; }
function productPrice(id: string): string | number { return getItemById(id)?.price ?? 0; }
function productCategory(id: string): string { return getItemById(id)?.category || '-'; }

// === 项目字段访问器（v3.1.55） ===
function projectName(id: string): string { const it = getItemById(id); return it?.mall_name || it?.name || `（${props.contentTypeLabel}不存在）`; }

// v3.1.57 新增：根据 project_id 获取所属项目名称（用于直播/商品弹窗的"所属项目"列）
function rowProjectName(projectId: string): string {
  if (!projectId) return '-';
  const p = projectStore.getProjectById(projectId);
  return p?.mall_name || p?.name || projectId;
}

// 直播状态
const LIVE_STATUS_TEXT: Record<string, string> = { live: '直播中', upcoming: '预告', replay: '回放', ended: '已结束' };
const LIVE_STATUS_TAG: Record<string, string> = { live: 'danger', upcoming: 'warning', replay: 'info', ended: 'info' };
function liveStatusText2(lv: any) { return LIVE_STATUS_TEXT[lv?.status] || '-'; }
function liveStatusTagType2(lv: any) { return LIVE_STATUS_TAG[lv?.status] || 'info'; }

// 商品状态（v3.1.55：统一为 schema 定义的 on_sale/sold_out/pre_sale）
const PRODUCT_STATUS_TEXT: Record<string, string> = { on_sale: '在售', sold_out: '已售罄', pre_sale: '预售' };
const PRODUCT_STATUS_TAG: Record<string, string> = { on_sale: 'success', sold_out: 'info', pre_sale: 'warning' };
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
// 手动推荐列表（基于草稿 draftConfigs，分页）
// ============================================
const manualList = computed(() =>
  draftConfigs.value
    .filter((r: RecommendItem) => r.rec_type === 'manual')
    .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
);

// v3.1.58：去掉分页后排序边界为全局判断（首条不可上移、末条不可下移）
function isFirstInPage(row: any): boolean {
  return manualList.value.findIndex(r => r.rec_id === row.rec_id) === 0;
}
function isLastInPage(row: any): boolean {
  return manualList.value.findIndex(r => r.rec_id === row.rec_id) === manualList.value.length - 1;
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
  ElMessage.success('已上移（需保存后生效）');
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
  ElMessage.success('已下移（需保存后生效）');
}

function onItemChange(row: any) {
  row.updated_by = CURRENT_OPERATOR;
  row.updated_at = now();
}

function del(row: any) {
  ElMessageBox.confirm('确认删除该手动推荐？', '提示', { type: 'warning' }).then(() => {
    const idx = draftConfigs.value.findIndex((r: any) => r.rec_id === row.rec_id);
    if (idx >= 0) draftConfigs.value.splice(idx, 1);
    ElMessage.success('已删除（需保存后生效）');
  }).catch(() => {});
}

const manualSelected = ref<any[]>([]);
function onManualSelectionChange(sel: any[]) { manualSelected.value = sel; }
function batchDelete() {
  if (!manualSelected.value.length) return;
  ElMessageBox.confirm(`确认删除选中的 ${manualSelected.value.length} 条手动推荐？`, '批量删除', { type: 'warning' }).then(() => {
    const ids = new Set(manualSelected.value.map(r => r.rec_id));
    for (let i = draftConfigs.value.length - 1; i >= 0; i--) {
      if (ids.has(draftConfigs.value[i].rec_id)) draftConfigs.value.splice(i, 1);
    }
    ElMessage.success(`已删除 ${manualSelected.value.length} 条（需保存后生效）`);
    manualSelected.value = [];
  }).catch(() => {});
}

// ============================================
// 列表选择器弹窗（v3.1.59：编辑模式——预勾选已有+可取消勾选+总数上限10条）
// ============================================
const selectorVisible = ref(false);
const selectorKeyword = ref('');
/** v3.1.59：弹窗全量已选（含已有手动推荐，跨页保留），是勾选状态的唯一真源 */
const selectorSelected = ref<any[]>([]);
const selectorPageSize = 10;
const selectorCurrentPage = ref(1);
/** v3.1.59：手动推荐总数上限10条（含已有+本次勾选），不是单次勾选上限 */
const SELECTOR_MAX = 10;
const selectorTableRef = ref<any>(null);

const selectorOptions = computed(() => {
  // v3.1.59：候选列表不再过滤已选项——已选内容正常显示，支持取消勾选（编辑模式）
  const kw = selectorKeyword.value.toLowerCase().trim();
  return (allItems.value as any[]).filter(it => {
    if (!kw) return true;
    // 按编号 + 名称搜索
    const itemId = it[idField.value];
    const id = (itemId || '').toLowerCase();
    const name = (it.title || it.name || it.mall_name || '').toLowerCase();
    return name.includes(kw) || id.includes(kw);
  });
});

const pagedSelectorOptions = computed(() => {
  const start = (selectorCurrentPage.value - 1) * selectorPageSize;
  return selectorOptions.value.slice(start, start + selectorPageSize);
});

function onSelectorKeywordChange() {
  selectorCurrentPage.value = 1;
}

/** v3.1.59：将当前页的行勾选状态与 selectorSelected 对齐（不清空其它页已选） */
function syncSelectorSelection() {
  const table = selectorTableRef.value;
  if (!table) return;
  const selectedIds = new Set(selectorSelected.value.map((it: any) => it[idField.value]));
  pagedSelectorOptions.value.forEach((row: any) => {
    table.toggleRowSelection(row, selectedIds.has(row[idField.value]));
  });
}

/** v3.1.59：翻页/搜索变化后自动同步勾选，保证任何一页看到的已选项都是勾选态 */
watch(pagedSelectorOptions, () => {
  nextTick(syncSelectorSelection);
});

function openSelector() {
  selectorKeyword.value = '';
  selectorCurrentPage.value = 1;
  // v3.1.59：预勾选当前草稿中已有的手动推荐（编辑模式，可在弹窗中取消勾选移除）
  const addedIds = new Set(
    draftConfigs.value.filter(r => r.rec_type === 'manual').map(r => r.target_id)
  );
  selectorSelected.value = (allItems.value as any[]).filter(it => addedIds.has(it[idField.value]));
  selectorVisible.value = true;
  // 弹窗打开、表格渲染完成后同步勾选状态
  nextTick(syncSelectorSelection);
}
function onSelectionChange(sel: any[]) {
  // v3.1.59："已选N条"=当前总已选（含已有+本次勾选），超过10条时回滚保留前10条
  if (sel.length > SELECTOR_MAX) {
    ElMessage.warning(`手动推荐最多 ${SELECTOR_MAX} 条（当前已选 ${sel.length} 条）`);
    const keep = sel.slice(0, SELECTOR_MAX);
    // 回滚表格勾选状态：清空后重新勾选保留的条目
    nextTick(() => {
      const table = selectorTableRef.value;
      if (!table) return;
      table.clearSelection();
      keep.forEach((row: any) => table.toggleRowSelection(row, true));
    });
    selectorSelected.value = keep;
    return;
  }
  selectorSelected.value = sel;
}
/** v3.1.59：确认 = 全量同步——取消勾选的已有推荐被移除，新勾选的追加（保留原 sort_order，新增排后面）；允许全取消（=清空手动推荐） */
function confirmSelector() {
  const finalIds = new Set(selectorSelected.value.map((it: any) => it[idField.value]));
  const existedIds = new Set(
    draftConfigs.value.filter(r => r.rec_type === 'manual').map(r => r.target_id)
  );
  // 1. 移除被取消勾选的已有推荐
  const removedCount = draftConfigs.value.filter(
    r => r.rec_type === 'manual' && !finalIds.has(r.target_id)
  ).length;
  for (let i = draftConfigs.value.length - 1; i >= 0; i--) {
    const r = draftConfigs.value[i];
    if (r.rec_type === 'manual' && !finalIds.has(r.target_id)) draftConfigs.value.splice(i, 1);
  }
  // 2. 追加新勾选的推荐
  const maxSort = Math.max(-1, ...draftConfigs.value.filter(r => r.rec_type === 'manual').map(r => r.sort_order ?? -1));
  let addedCount = 0;
  selectorSelected.value.forEach((it: any) => {
    const id = it[idField.value];
    if (!existedIds.has(id)) {
      draftConfigs.value.push({
        rec_id: `mr-${Date.now()}-${addedCount}`,
        rec_type: 'manual',
        target_id: id,
        status: 'active',
        sort_order: maxSort + addedCount + 1,
        updated_by: CURRENT_OPERATOR,
        updated_at: now(),
      });
      addedCount++;
    }
  });
  if (addedCount || removedCount) {
    ElMessage.success(`已确认手动推荐（新增 ${addedCount} 条，移除 ${removedCount} 条，需保存后生效）`);
  }
  selectorVisible.value = false;
}

// ============================================
// 推荐效果预览（基于草稿计算：手动 + 规则叠加）
// ============================================

const manualCount = computed(() =>
  manualList.value.filter(r => r.status === 'active').length
);

const previewItems = computed(() => {
  // showRuleSelector=false 时（首页直播推荐），不传 ruleId，allItems 预先用默认规则排序
  if (!props.showRuleSelector) {
    const sortedByDefault = sortLivesByDefaultRule(allItems.value as any);
    return getRecommendItems<any>({
      targetType: props.targetType,
      recommendConfigs: draftConfigs.value,
      allItems: sortedByDefault as any,
      idField: idField.value,
      displayLimit: draftDisplayLimit.value,
    });
  }
  if (!draftRuleId.value) {
    // 未引用规则时，仅展示手动推荐
    return manualList.value
      .filter(r => r.status === 'active')
      .map(r => getItemById(r.target_id))
      .filter(Boolean) as any[];
  }
  return getRecommendItems<any>({
    targetType: props.targetType,
    recommendConfigs: draftConfigs.value,
    allItems: allItems.value as any,
    idField: idField.value,
    ruleId: draftRuleId.value,
    displayLimit: draftDisplayLimit.value,
  });
});

// v3.1.58：去掉预览分页，前30条截断全量展示
const PREVIEW_MAX = 30;
const visiblePreviewItems = computed(() => previewItems.value.slice(0, PREVIEW_MAX));
</script>

<style scoped>
.scenario-panel { margin-top: 12px; padding-bottom: 60px; }
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
.rd-desc { color: #666; }
.rd-hint { color: #999; font-size: 12px; }
.rd-dims { display: flex; flex-wrap: wrap; gap: 4px; }
.dim-tag { font-size: 11px; }
.dim-empty { font-size: 12px; color: #ccc; }

/* 预览 */
.preview-grid { display: flex; flex-direction: column; gap: 8px; }
.pv-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #fafafa; border-radius: 8px; }
.pv-index { width: 24px; height: 24px; border-radius: 50%; background: #FF6B35; color: #fff; font-size: 12px; line-height: 24px; text-align: center; flex-shrink: 0; }
.pv-emoji { font-size: 24px; flex-shrink: 0; }
.pv-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.pv-info { flex: 1; min-width: 0; }
.pv-title { font-size: 14px; font-weight: 600; color: #222; }
.pv-meta { font-size: 12px; color: #999; margin-top: 2px; }
.pv-empty { text-align: center; color: #bbb; padding: 40px 0; }

/* 手动推荐列表信息列 */
.item-cell { display: flex; align-items: center; gap: 10px; }
.item-emoji { font-size: 22px; flex-shrink: 0; }
.item-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.item-meta { flex: 1; min-width: 0; }
.item-title { font-size: 13px; font-weight: 600; color: #222; }
.item-sub { font-size: 11px; color: #999; margin-top: 2px; }

.selector-search { margin-bottom: 8px; }
.selector-footer-tip { margin-top: 8px; font-size: 13px; color: #67C23A; text-align: right; }
.selector-footer-tip-empty { color: #E6A23C; }

/* v3.1.55 底部固定保存栏 */
.save-bar {
  position: fixed;
  bottom: 0;
  left: 240px;
  right: 0;
  height: 48px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 0 24px;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s;
}
.save-bar.has-changes {
  background: #fffbe6;
  border-top-color: #ffc53d;
}
.save-status { font-size: 13px; color: #52c41a; }
.save-status.warning { color: #faad14; font-weight: 600; }
</style>
