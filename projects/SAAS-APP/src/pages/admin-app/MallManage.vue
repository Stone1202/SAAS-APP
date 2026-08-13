<template>
  <!-- 运营后台 — 商城管理（v3.1.34 新增）
       3个Tab：商城列表(项目) / 精选商品(商品) / 精选直播(直播)
       每个 Tab 含：规则引用 + 手动推荐列表 + 预览
       规则定义在「规则引擎管理」统一管理，本页仅引用规则和管理手动推荐 -->
  <div class="page-admin">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>运营后台</el-breadcrumb-item>
      <el-breadcrumb-item>商城管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 顶部Tab切换 -->
    <el-tabs v-model="activeTab" class="mm-tabs" @tab-change="onTabChange">
      <el-tab-pane label="商城列表" name="projects">
        <ScenarioPanel
          scenario-id="sc-mall-projects"
          target-type="project"
          content-type-label="项目"
          :page-size="10"
        />
      </el-tab-pane>
      <el-tab-pane label="精选商品" name="featuredProducts">
        <ScenarioPanel
          scenario-id="sc-mall-featured-products"
          target-type="product"
          content-type-label="商品"
          :page-size="10"
        />
      </el-tab-pane>
      <el-tab-pane label="精选直播" name="featuredLives">
        <ScenarioPanel
          scenario-id="sc-mall-featured-lives"
          target-type="live"
          content-type-label="直播"
          :page-size="10"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- v3.1.42: 用例卡 -->
    <HelpButton @open="ucDrawerVisible = true" />
    <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ScenarioPanel from '../../components/admin/ScenarioPanel.vue';
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';

// 默认Tab：商城列表
const activeTab = ref<'projects' | 'featuredProducts' | 'featuredLives'>('projects');

// v3.1.42: 用例卡 Tab感知，按 activeTab 过滤
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-OPS-PC-007', '商城管理', () => activeTab.value);

function onTabChange(_name: any) {
  // Tab切换无需额外逻辑，ScenarioPanel内部自管理状态
}
</script>

<style scoped>
.page-admin { padding: 20px; }
.mm-tabs { margin-top: 12px; }
</style>
