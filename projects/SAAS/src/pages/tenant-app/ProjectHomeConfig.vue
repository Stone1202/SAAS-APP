<template>
  <!-- 租户后台-项目首页配置（配置式装修） /tenant/projects/:projectId/home-config -->
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

      <!-- Banner轮播配置 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>🖼️ Banner轮播</span>
            <el-button size="small" type="primary" @click="addBanner">+ 添加</el-button>
          </div>
        </template>
        <div v-for="(b, idx) in config.banner_images" :key="b.id" class="config-row">
          <el-input v-model="b.image" placeholder="图片URL" class="row-input" />
          <el-input v-model="b.link" placeholder="跳转链接（选填）" class="row-input" />
          <el-input-number v-model="b.sort" :min="0" size="small" />
          <el-button link type="danger" @click="removeBanner(idx)">删除</el-button>
        </div>
        <div v-if="!config.banner_images.length" class="row-empty">暂无Banner</div>
      </el-card>

      <!-- 快捷入口配置 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>⚡ 快捷入口（金刚区）</span>
            <el-button size="small" type="primary" @click="addEntry">+ 添加</el-button>
          </div>
        </template>
        <div v-for="(e, idx) in config.quick_entries" :key="e.id" class="config-row">
          <el-input v-model="e.icon" placeholder="图标" style="width: 80px" />
          <el-input v-model="e.name" placeholder="名称" class="row-input" />
          <el-input v-model="e.link" placeholder="跳转链接（选填）" class="row-input" />
          <el-input-number v-model="e.sort" :min="0" size="small" />
          <el-button link type="danger" @click="removeEntry(idx)">删除</el-button>
        </div>
        <div v-if="!config.quick_entries.length" class="row-empty">暂无快捷入口</div>
      </el-card>

      <!-- 推荐商品配置 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>📦 推荐商品</span>
            <el-button size="small" type="primary" @click="addProduct">+ 添加商品ID</el-button>
          </div>
        </template>
        <div class="config-row" v-for="(id, idx) in config.recommend_products" :key="idx">
          <el-input :model-value="id" @update:model-value="v => config!.recommend_products[idx] = v" placeholder="商品ID" class="row-input" />
          <el-button link type="danger" @click="config!.recommend_products.splice(idx, 1)">删除</el-button>
        </div>
        <div v-if="!config.recommend_products.length" class="row-empty">暂无推荐商品</div>
      </el-card>

      <!-- 直播推荐配置 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>📺 直播推荐</span>
            <el-button size="small" type="primary" @click="addLive">+ 添加直播ID</el-button>
          </div>
        </template>
        <div class="config-row" v-for="(id, idx) in config.live_recommend" :key="idx">
          <el-input :model-value="id" @update:model-value="v => config!.live_recommend[idx] = v" placeholder="直播ID" class="row-input" />
          <el-button link type="danger" @click="config!.live_recommend.splice(idx, 1)">删除</el-button>
        </div>
        <div v-if="!config.live_recommend.length" class="row-empty">暂无直播推荐</div>
      </el-card>

      <div class="save-bar">
        <el-button type="primary" size="large" @click="save">保存配置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project-store';
import { ElMessage } from 'element-plus';
import type { ProjectHomeConfig } from '../../contracts';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const projectId = computed(() => route.params.projectId as string);
const project = computed(() => projectStore.getProjectById(projectId.value));
const config = computed(() => projectStore.homeConfigByProject(projectId.value));

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

function addBanner() {
  config.value?.banner_images.push({ id: `b-${Date.now()}`, image: '', sort: config.value!.banner_images.length + 1 });
}
function removeBanner(idx: number) {
  config.value?.banner_images.splice(idx, 1);
}
function addEntry() {
  config.value?.quick_entries.push({ id: `q-${Date.now()}`, name: '', icon: '', link: '', sort: config.value!.quick_entries.length + 1 });
}
function removeEntry(idx: number) {
  config.value?.quick_entries.splice(idx, 1);
}
function addProduct() {
  config.value?.recommend_products.push('');
}
function addLive() {
  config.value?.live_recommend.push('');
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
.save-bar { text-align: center; padding: 20px 0; }
</style>
