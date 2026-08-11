<template>
  <!-- 运营后台 — 首页推荐（v3.1.35 新增，合并原直播推荐+商品推荐）
       2个Tab：直播推荐 / 商品推荐
       直播推荐Tab（v3.1.36）：脱离规则引擎，按默认规则读取（BR-SHP-042：状态排序 live→upcoming→replay + 同状态 started_at 倒序，排除 ended）
       商品推荐Tab：含规则引用 + 展示条数配置 + 手动推荐列表 + 预览
       后续如有更多首页推荐内容类型，在此页新增 Tab 即可 -->
  <div class="page-admin">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>运营后台</el-breadcrumb-item>
      <el-breadcrumb-item>首页推荐</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 顶部Tab切换 -->
    <el-tabs v-model="activeTab" class="hrm-tabs" @tab-change="onTabChange">
      <el-tab-pane label="直播推荐" name="live">
        <!-- v3.1.36：直播推荐脱离规则引擎，按默认规则读取（BR-SHP-042） -->
        <ScenarioPanel
          scenario-id="sc-home-live"
          target-type="live"
          content-type-label="直播"
          :page-size="10"
          :show-display-limit-editor="true"
          :show-rule-selector="false"
        />
      </el-tab-pane>
      <el-tab-pane label="商品推荐" name="product">
        <ScenarioPanel
          scenario-id="sc-home-product"
          target-type="product"
          content-type-label="商品"
          :page-size="10"
          :show-display-limit-editor="true"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- v3.1.42: 用例卡 -->
    <HelpButton @open="ucDrawerVisible = true" />
    <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ScenarioPanel from '../../components/admin/ScenarioPanel.vue';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';

// 默认Tab：直播推荐
const activeTab = ref<'live' | 'product'>('live');

// v3.1.42: 双Tab各对应不同 pgId，按 activeTab 切换用例卡
const { ucCards: liveCards, ucDrawerTitle: liveTitle } = useUseCaseCard('PG-OPS-PC-004', '首页推荐-直播推荐');
const { ucCards: productCards, ucDrawerTitle: productTitle } = useUseCaseCard('PG-OPS-PC-005', '首页推荐-商品推荐');
const ucDrawerVisible = ref(false);
const ucCards = computed(() => activeTab.value === 'live' ? liveCards.value : productCards.value);
const ucDrawerTitle = computed(() => activeTab.value === 'live' ? liveTitle.value : productTitle.value);

function onTabChange(_name: any) {
  // Tab切换无需额外逻辑，ScenarioPanel内部自管理状态
}
</script>

<style scoped>
.page-admin { padding: 20px; }
.hrm-tabs { margin-top: 12px; }
</style>
