<!--
  @deprecated v3.1.21移除，编号保留不重用
  原功能"项目首页配置(ProjectHomeConfig)"已从租户后台移除（路由表无 /tenant/projects/:id/home-config），
  首页Banner和金刚区改由独立的 FN-TNT-PC-006(项目Banner管理 ProjectBannerManage) 和
  FN-TNT-PC-007(项目金刚区管理 ProjectKingKongManage) 承担。
  本文件保留仅作历史记录参考，不应被路由引用。
-->
<template>
  <!-- 租户后台-项目首页配置（配置式装修） /tenant/projects/:projectId/home-config  ⚠️ DEPRECATED -->
  <div class="project-home-config">
    <div class="page-header-bar">
      <h2 class="page-title">项目首页配置</h2>
      <span class="page-desc">配置项目「{{ project?.name }}」的首页展示内容（配置式装修）</span>
      <el-button link type="primary" @click="goBack">‹ 返回项目列表</el-button>
    </div>

    <div v-if="!config" class="empty-tip">
      <el-empty description="暂无首页配置，请创建" />
      <el-button type="primary" @click="initConfig">创建首页配置</el-button>
    </div>

    <div v-else class="config-panels">
      <!-- 公告配置 -->
      <el-card class="config-card">
        <template #header>📢 公告栏</template>
        <el-input v-model="config.notice" type="textarea" :rows="2" placeholder="项目首页滚动公告" />
      </el-card>

      <!-- Banner/金刚区提示：已迁移到独立管理页 -->
      <el-card class="config-card">
        <template #header>🖼️ Banner & 金刚区</template>
        <div class="migrate-tip">
          <p>Banner轮播和金刚区快捷入口已迁移到独立管理页面，功能更完善。</p>
          <el-button type="primary" size="small" @click="router.push(`/tenant/projects/${projectId}/banners`)">前往广告位管理</el-button>
          <el-button type="primary" size="small" style="margin-left:8px" @click="router.push(`/tenant/projects/${projectId}/kingkong`)">前往 金刚区管理</el-button>
        </div>
      </el-card>

      <!-- 推荐商品配置 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>📦 推荐商品</span>
            <div>
              <el-button size="small" type="danger" plain @click="batchDelProduct" :disabled="!productSelected.length">批量删除 ({{ productSelected.length }})</el-button>
              <el-button size="small" type="primary" @click="openProductSelector">+ 添加推荐商品</el-button>
            </div>
          </div>
        </template>
        <el-table :data="config.recommend_products.map(id => getProductInfo(id))" border stripe size="small" @selection-change="onProductSelectionChange">
          <el-table-column type="selection" width="45" />
          <el-table-column label="商品ID" prop="product_id" width="140" />
          <el-table-column label="商品名称" prop="name" min-width="160" />
          <el-table-column label="价格" prop="price" width="100" />
          <el-table-column label="销量" prop="sales" width="80" />
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button size="small" type="danger" link @click="config!.recommend_products.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!config.recommend_products.length" class="row-empty">暂无推荐商品</div>
      </el-card>

      <!-- 直播推荐配置 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>📺 直播推荐</span>
            <div>
              <el-button size="small" type="danger" plain @click="batchDelLive" :disabled="!liveSelected.length">批量删除 ({{ liveSelected.length }})</el-button>
              <el-button size="small" type="primary" @click="openLiveSelector">+ 添加推荐直播</el-button>
            </div>
          </div>
        </template>
        <el-table :data="config.live_recommend.map(id => getLiveInfo(id))" border stripe size="small" @selection-change="onLiveSelectionChange">
          <el-table-column type="selection" width="45" />
          <el-table-column label="直播ID" prop="live_id" width="120" />
          <el-table-column label="直播标题" prop="title" min-width="160" />
          <el-table-column label="主播" prop="anchor_name" width="100" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button size="small" type="danger" link @click="config!.live_recommend.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!config.live_recommend.length" class="row-empty">暂无直播推荐</div>
      </el-card>

      <div class="save-bar">
        <el-button type="primary" size="large" @click="save">保存配置</el-button>
      </div>
    </div>

    <!-- 商品选择器弹窗 -->
    <el-dialog v-model="productSelectorVisible" title="选择推荐商品" width="640px" append-to-body>
      <div class="selector-toolbar">
        <el-input v-model="productSearchKw" placeholder="搜索商品名称..." size="small" clearable style="width:240px" />
        <span class="selector-tip">已选 {{ productSelectorSelected.length }} 项（已选不在列表中显示）</span>
      </div>
      <el-table :data="productSelectorList" border stripe size="small" height="360" @selection-change="onProductSelectorChange">
        <el-table-column type="selection" width="45" />
        <el-table-column label="商品ID" prop="product_id" width="120" />
        <el-table-column label="名称" prop="name" min-width="140" />
        <el-table-column label="价格" prop="price" width="80" />
        <el-table-column label="销量" prop="sales" width="80" />
      </el-table>
      <template #footer>
        <el-button @click="productSelectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmProductSelector">确认添加 ({{ productSelectorSelected.length }})</el-button>
      </template>
    </el-dialog>

    <!-- 直播选择器弹窗 -->
    <el-dialog v-model="liveSelectorVisible" title="选择推荐直播" width="640px" append-to-body>
      <div class="selector-toolbar">
        <el-input v-model="liveSearchKw" placeholder="搜索直播标题..." size="small" clearable style="width:240px" />
        <span class="selector-tip">已选 {{ liveSelectorSelected.length }} 项（已选不在列表中显示）</span>
      </div>
      <el-table :data="liveSelectorList" border stripe size="small" height="360" @selection-change="onLiveSelectorChange">
        <el-table-column type="selection" width="45" />
        <el-table-column label="直播ID" prop="live_id" width="120" />
        <el-table-column label="标题" prop="title" min-width="140" />
        <el-table-column label="主播" prop="anchor_name" width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="liveSelectorVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmLiveSelector">确认添加 ({{ liveSelectorSelected.length }})</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ProjectHomeConfig } from '../../contracts';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const projectId = computed(() => route.params.projectId as string);
const project = computed(() => projectStore.getProjectById(projectId.value));
const config = computed(() => projectStore.homeConfigByProject(projectId.value));

// 项目下所有商品/直播
const allProducts = computed(() => projectStore.productsByProject(projectId.value));
const allLives = computed(() => projectStore.livesByProject(projectId.value));

// 获取商品信息（用于表格展示）
function getProductInfo(id: string) {
  const p = allProducts.value.find(x => x.product_id === id);
  return p || { product_id: id, name: '(商品不存在)', price: '-', sales: '-' };
}
// 获取直播信息
function getLiveInfo(id: string) {
  const l = allLives.value.find(x => x.live_id === id);
  return l || { live_id: id, title: '(直播不存在)', anchor_name: '-', status: 'ended' };
}
// 直播状态文本
function statusText(status: string): string {
  const map: Record<string, string> = { live: '直播中', upcoming: '预告', replay: '回放', ended: '已结束' };
  return map[status] || '直播中';
}
// 直播状态标签类型
function statusTagType(status: string): 'danger' | 'warning' | 'info' | 'success' {
  const map: Record<string, 'danger' | 'warning' | 'info' | 'success'> = { live: 'danger', upcoming: 'warning', replay: 'info', ended: 'info' };
  return map[status] || 'info';
}

function initConfig() {
  projectStore.projectHomeConfigs.push({
    config_id: `cfg-${Date.now()}`,
    project_id: projectId.value,
    banner_images: [],
    quick_entries: [],
    recommend_products: [],
    live_recommend: [],
    notice: '',
    updated_at: new Date().toISOString(),
  });
}

// ========== 推荐商品：批量删除 + 列表选择器弹窗 ==========
const productSelected = ref<any[]>([]);
function onProductSelectionChange(sel: any[]) {
  productSelected.value = sel;
}
function batchDelProduct() {
  if (!productSelected.value.length) return;
  ElMessageBox.confirm(`确认删除选中的 ${productSelected.value.length} 条推荐商品？`, '批量删除', { type: 'warning' }).then(() => {
    const ids = new Set(productSelected.value.map(r => r.product_id));
    const newList = config.value!.recommend_products.filter(id => !ids.has(id));
    config.value!.recommend_products.splice(0, config.value!.recommend_products.length, ...newList);
    ElMessage.success(`已删除 ${productSelected.value.length} 条`);
    productSelected.value = [];
  }).catch(() => {});
}

const productSelectorVisible = ref(false);
const productSearchKw = ref('');
const productSelectorSelected = ref<any[]>([]);
// 选择器列表：排除已选的商品
const productSelectorList = computed(() => {
  const existing = new Set(config.value?.recommend_products || []);
  let list = allProducts.value.filter(p => !existing.has(p.product_id));
  const kw = productSearchKw.value.trim().toLowerCase();
  if (kw) list = list.filter(p => p.name.toLowerCase().includes(kw));
  return list;
});
function onProductSelectorChange(sel: any[]) {
  productSelectorSelected.value = sel;
}
function openProductSelector() {
  productSearchKw.value = '';
  productSelectorSelected.value = [];
  productSelectorVisible.value = true;
}
function confirmProductSelector() {
  if (!productSelectorSelected.value.length) {
    ElMessage.warning('请选择商品');
    return;
  }
  const ids = productSelectorSelected.value.map(p => p.product_id);
  config.value!.recommend_products.push(...ids);
  ElMessage.success(`已添加 ${ids.length} 个推荐商品`);
  productSelectorVisible.value = false;
}

// ========== 推荐直播：批量删除 + 列表选择器弹窗 ==========
const liveSelected = ref<any[]>([]);
function onLiveSelectionChange(sel: any[]) {
  liveSelected.value = sel;
}
function batchDelLive() {
  if (!liveSelected.value.length) return;
  ElMessageBox.confirm(`确认删除选中的 ${liveSelected.value.length} 条推荐直播？`, '批量删除', { type: 'warning' }).then(() => {
    const ids = new Set(liveSelected.value.map(r => r.live_id));
    const newList = config.value!.live_recommend.filter(id => !ids.has(id));
    config.value!.live_recommend.splice(0, config.value!.live_recommend.length, ...newList);
    ElMessage.success(`已删除 ${liveSelected.value.length} 条`);
    liveSelected.value = [];
  }).catch(() => {});
}

const liveSelectorVisible = ref(false);
const liveSearchKw = ref('');
const liveSelectorSelected = ref<any[]>([]);
const liveSelectorList = computed(() => {
  const existing = new Set(config.value?.live_recommend || []);
  let list = allLives.value.filter(l => !existing.has(l.live_id));
  const kw = liveSearchKw.value.trim().toLowerCase();
  if (kw) list = list.filter(l => l.title.toLowerCase().includes(kw) || (l.anchor_name || '').toLowerCase().includes(kw));
  return list;
});
function onLiveSelectorChange(sel: any[]) {
  liveSelectorSelected.value = sel;
}
function openLiveSelector() {
  liveSearchKw.value = '';
  liveSelectorSelected.value = [];
  liveSelectorVisible.value = true;
}
function confirmLiveSelector() {
  if (!liveSelectorSelected.value.length) {
    ElMessage.warning('请选择直播');
    return;
  }
  const ids = liveSelectorSelected.value.map(l => l.live_id);
  config.value!.live_recommend.push(...ids);
  ElMessage.success(`已添加 ${ids.length} 个推荐直播`);
  liveSelectorVisible.value = false;
}

function save() {
  if (!config.value) return;
  projectStore.updateHomeConfig(projectId.value, config.value);
  ElMessage.success('保存成功');
}

function goBack() {
  router.push('/tenant/projects');
}
</script>

<style scoped>
.project-home-config { padding: 20px; }
.page-header-bar { margin-bottom: 20px; }
.page-title { font-size: 20px; margin: 0 0 4px; color: #333; }
.page-desc { font-size: 13px; color: #999; margin-right: 12px; }
.empty-tip { text-align: center; padding: 40px 0; }
.config-card { margin-bottom: 16px; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.config-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.row-input { flex: 1; min-width: 160px; }
.row-empty { color: #ccc; font-size: 13px; text-align: center; padding: 16px; }
.migrate-tip { font-size: 13px; color: #666; }
.migrate-tip p { margin: 0 0 8px; }
.save-bar { text-align: center; padding: 20px 0; }

/* 选择器弹窗 */
.selector-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.selector-tip {
  font-size: 12px;
  color: #999;
}
</style>
