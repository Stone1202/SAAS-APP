<template>
  <!-- 搜索结果页 — 搜索引擎 + 自定义结果 -->
  <div class="sr-page">
    <!-- 搜索框 -->
    <div class="sr-input-row">
      <div class="sr-input-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref="inputRef"
          v-model="keyword"
          class="sr-input"
          :placeholder="appConfig.searchHint || '搜索商品、项目、直播'"
          @keyup.enter="doSearch(keyword)"
        />
        <span v-if="keyword" class="sr-clear" @click="keyword='';search()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ccc" stroke="#ccc" stroke-width="1">
            <circle cx="12" cy="12" r="10" fill="#ddd"/>
            <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2"/>
            <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2"/>
          </svg>
        </span>
      </div>
      <span class="sr-cancel" @click="goBack">取消</span>
    </div>

    <!-- Tab切换 -->
    <div class="sr-tabs" v-if="hasResults">
      <span
        v-for="t in tabs"
        :key="t.key"
        :class="['sr-tab', { active: activeTab === t.key }]"
        @click="activeTab = t.key"
      >
        {{ t.label }}
        <span class="sr-tab-count" v-if="tabCount(t.key)">{{ tabCount(t.key) }}</span>
      </span>
    </div>

    <!-- ========== 搜索引擎结果 ========== -->
    <div class="sr-results" v-if="allResults.length">
      <!-- 商品 -->
      <div v-if="productResults.length && (activeTab === 'all' || activeTab === 'product')" class="sr-block">
        <div class="srb-title">商品</div>
        <div class="srb-grid">
          <ProductCard
            v-for="p in productResults"
            :key="p.product_id"
            :product="p"
            :project-id="p.project_id"
            @click="goProductDetail(p.product_id)"
          />
        </div>
      </div>

      <!-- 项目 -->
      <div v-if="projectResults.length && (activeTab === 'all' || activeTab === 'project')" class="sr-block">
        <div class="srb-title">项目</div>
        <div class="srb-list">
          <div
            v-for="p in projectResults"
            :key="p.project_id"
            class="srbl-item"
            @click="$router.push(`/app/project/${p.project_id}`)"
          >
            <div class="srbl-logo" :style="{ background: projectGradient(p) }">
              <span>{{ p.name?.charAt(0) || '项' }}</span>
            </div>
            <div class="srbl-info">
              <div class="srbl-name">{{ p.name }}</div>
              <div class="srbl-desc">{{ p.description }}</div>
              <div class="srbl-meta">{{ p.store_count || 0 }}家门店 · {{ productCountByProject(p) }}件商品</div>
            </div>
            <span class="srbl-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 直播 -->
      <div v-if="liveResults.length && (activeTab === 'all' || activeTab === 'live')" class="sr-block">
        <div class="srb-title">直播</div>
        <div class="srb-live-row">
          <LiveCard
            v-for="l in liveResults"
            :key="l.live_id"
            :live="l"
            :project-id="l.project_id"
            @click="goLiveDetail(l.live_id)"
          />
        </div>
      </div>
    </div>

    <!-- 无结果 -->
    <div class="sr-empty" v-if="!hasResults && searched">
      <span class="sre-emoji">🔍</span>
      <span class="sre-title">未找到相关内容</span>
      <span class="sre-hint">试试其他关键词吧</span>
    </div>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-SHP-APP-008', '搜索结果页');
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppConfigStore } from '../../../stores/app-config-store';
import { useProjectStore } from '../../../stores/project-store';
import { useProjectStatusFilter } from '../../../composables/useProjectStatusFilter';
import ProductCard from '../../../components/app/product/ProductCard.vue';
import LiveCard from '../../../components/app/live/LiveCard.vue';

const route = useRoute();
const router = useRouter();
const appConfig = useAppConfigStore();
const projectStore = useProjectStore();
const { filterByActiveProject, filterActiveProjects } = useProjectStatusFilter();

const keyword = ref((route.query.q as string) || '');
const searched = ref(false);
const inputRef = ref<HTMLInputElement>();

const tabs = [
  { key: 'all', label: '综合' },
  { key: 'product', label: '商品' },
  { key: 'project', label: '项目' },
  { key: 'live', label: '直播' },
];
const activeTab = ref('all');

// ========== 搜索引擎结果 ==========
const productResults = computed(() => {
  if (!keyword.value) return [];
  const q = keyword.value.toLowerCase();
  const filtered = projectStore.products.filter(p =>
    p.status === 'on_sale' &&
    (p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  );
  // v3.1.37 BR-SHP-043 Layer1：过滤掉 inactive 项目的商品
  return filterByActiveProject(filtered).slice(0, 8);
});

const projectResults = computed(() => {
  if (!keyword.value) return [];
  const q = keyword.value.toLowerCase();
  const matched = projectStore.projects.filter(p =>
    (p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  );
  // v3.1.37 BR-SHP-043 Layer1：过滤掉 inactive 项目
  return filterActiveProjects(matched).slice(0, 4);
});

const liveResults = computed(() => {
  if (!keyword.value) return [];
  const q = keyword.value.toLowerCase();
  const filtered = projectStore.liveRooms.filter(l =>
    l.title?.toLowerCase().includes(q) || l.anchor_name?.toLowerCase().includes(q)
  );
  // v3.1.37 BR-SHP-043 Layer1：过滤掉 inactive 项目的直播
  return filterByActiveProject(filtered).slice(0, 4);
});

const allResults = computed(() => [...productResults.value, ...projectResults.value, ...liveResults.value]);
const hasResults = computed(() => allResults.value.length > 0);

function tabCount(key: string) {
  if (key === 'all') return allResults.value.length;
  if (key === 'product') return productResults.value.length;
  if (key === 'project') return projectResults.value.length;
  if (key === 'live') return liveResults.value.length;
  return 0;
}

function projectGradient(p: any) {
  if (p.name?.includes('日用')) return 'linear-gradient(135deg,#FF6B35,#FF8F35)';
  if (p.name?.includes('厨房')) return 'linear-gradient(135deg,#667eea,#764ba2)';
  if (p.name?.includes('运动')) return 'linear-gradient(135deg,#11998e,#38ef7d)';
  if (p.name?.includes('数码')) return 'linear-gradient(135deg,#0F2027,#203A43)';
  return 'linear-gradient(135deg,#FF6B35,#FF8F35)';
}

function productCountByProject(p: any) {
  return projectStore.productsByProject(p.project_id).length;
}

// 取消按钮：如果有上一页则返回，否则回首页
function goBack() {
  if (window.history.length > 1 && document.referrer) {
    router.back();
  } else {
    router.push('/app/home');
  }
}

function goProductDetail(id: string) {
  router.push(`/app/product/${id}`);
}

function goLiveDetail(id: string) {
  router.push(`/app/live/${id}`);
}

function doSearch(q: string) {
  if (!q.trim()) return;
  keyword.value = q;
  search();
}

function search() {
  searched.value = true;
  router.replace({ query: { q: keyword.value || undefined } });
}

// URL参数变化
watch(() => route.query.q, (q) => {
  if (q) { keyword.value = q as string; searched.value = true; }
});

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus();
    if (keyword.value) {
      searched.value = true;
      inputRef.value?.setSelectionRange(0, keyword.value.length);
    }
  });
});
</script>

<style scoped>
.sr-page { background: #fff; min-height: 100vh; }

/* 搜索输入行 */
.sr-input-row {
  display: flex; align-items: center; padding: 8px 16px; gap: 10px;
  background: #fff; position: sticky; top: 0; z-index: 10;
}
.sr-input-box {
  flex: 1; display: flex; align-items: center; height: 38px;
  padding: 0 4px 0 14px; background: #f5f5f5; border-radius: 19px; gap: 8px;
}
.sr-input { flex: 1; border: none; background: transparent; font-size: 14px; color: #222; outline: none; }
.sr-input::placeholder { color: #bbb; }
.sr-clear { cursor: pointer; display: flex; align-items: center; }
.sr-cancel { font-size: 14px; color: #666; cursor: pointer; flex-shrink: 0; }

/* Tab */
.sr-tabs {
  display: flex; gap: 0; padding: 0 16px;
  border-bottom: 1px solid #f0f0f0; position: sticky; top: 56px; z-index: 9; background: #fff;
}
.sr-tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 3px;
  padding: 10px 0; font-size: 13px; color: #888; cursor: pointer; position: relative;
}
.sr-tab.active { color: #FF6B35; font-weight: 600; }
.sr-tab.active::after {
  content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 20px; height: 3px; background: #FF6B35; border-radius: 2px;
}
.sr-tab-count { font-size: 10px; color: #aaa; }

/* 搜索结果 */
.sr-results { padding: 4px 16px 20px; }
.sr-block { margin-top: 16px; }
.srb-title { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 10px; }
.srb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

.srb-list { display: flex; flex-direction: column; gap: 8px; }
.srbl-item {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  background: #fafafa; border-radius: 10px; cursor: pointer;
}
.srbl-item:active { background: #f0f0f0; }
.srbl-logo {
  width: 42px; height: 42px; border-radius: 10px; display: flex;
  align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 700; flex-shrink: 0;
}
.srbl-info { flex: 1; min-width: 0; }
.srbl-name { font-size: 14px; font-weight: 600; color: #222; }
.srbl-desc { font-size: 11px; color: #999; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.srbl-meta { font-size: 10px; color: #bbb; margin-top: 2px; }
.srbl-arrow { font-size: 18px; color: #ccc; }

.srb-live-row { display: flex; gap: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.srb-live-row::-webkit-scrollbar { display: none; }

/* 空状态 */
.sr-empty { display: flex; flex-direction: column; align-items: center; padding: 80px 0; gap: 8px; }
.sre-emoji { font-size: 48px; }
.sre-title { font-size: 15px; color: #666; font-weight: 600; }
.sre-hint { font-size: 13px; color: #bbb; }
</style>
