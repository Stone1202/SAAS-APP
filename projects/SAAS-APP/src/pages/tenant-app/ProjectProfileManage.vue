<template>
  <div class="project-profile-manage">
    <div class="ppm-header">
      <h2>项目管理</h2>
      <p class="ppm-desc">管理当前项目的基本信息，修改后APP端立即生效</p>
    </div>

    <el-card class="ppm-card" v-loading="!project">
      <template #header><span>基本信息</span></template>
      <el-form v-if="project" ref="formRef" :model="form" :rules="formRules" label-width="100px" label-position="right">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" disabled />
        </el-form-item>
        <el-form-item label="商城名称" prop="mall_name">
          <el-input v-model="form.mall_name" placeholder="商城展示名称（可选，全局唯一，不超过20汉字）" maxlength="20" show-word-limit />
          <div class="ppm-hint">此名称将显示在APP项目首页导航栏、商城页等位置</div>
        </el-form-item>
        <el-form-item label="所属租户">
          <el-select v-model="form.tenant_id" style="width: 100%" disabled>
            <el-option
              v-for="t in store.tenants"
              :key="t.tenant_id"
              :label="t.name"
              :value="t.tenant_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="行业">
          <el-select v-model="form.industry" style="width: 100%" disabled>
            <el-option label="日用品" value="daily_necessities" />
            <el-option label="保健品" value="health_products" />
            <el-option label="食品饮料" value="food_beverage" />
            <el-option label="家居家电" value="home_appliance" />
            <el-option label="美妆个护" value="beauty_care" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目LOGO">
          <el-upload
            class="ppm-logo-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onLogoChange"
            accept="image/png,image/jpeg,image/jpg"
          >
            <div class="ppm-logo-upload-box" v-if="!form.logo">
              <el-icon class="ppm-logo-upload-icon"><Plus /></el-icon>
              <span class="ppm-logo-upload-text">上传LOGO</span>
            </div>
            <img v-else :src="form.logo" class="ppm-logo-upload-preview" />
          </el-upload>
          <div class="ppm-hint">建议尺寸 200×200px，支持 JPG/PNG，大小 ≤ 2MB</div>
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="项目描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-text="启用"
            inactive-text="禁用"
            :active-value="'active'"
            :inactive-value="'inactive'"
          />
          <div class="ppm-status-warning">项目禁用后，该项目下的所有商品/直播将从平台商城/推荐/搜索结果中隐藏，用户无法进入项目、查看详情或下单，但历史订单的售后权利不受影响。</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSave" :loading="saving">保存修改</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>

  <!-- 用例卡 -->
  <HelpButton @open="ucDrawerVisible = true" />
  <UseCaseDrawer :visible="ucDrawerVisible" :title="ucDrawerTitle" :cards="ucCards" @close="ucDrawerVisible = false" />
</template>

<script setup lang="ts">
import HelpButton from '@/components/use-case-card/HelpButton.vue';
import UseCaseDrawer from '@/components/use-case-card/UseCaseDrawer.vue';
import { useUseCaseCard } from '@/composables/useUseCaseCard';
const { ucDrawerVisible, ucCards, ucDrawerTitle } = useUseCaseCard('PG-TNT-PC-005', '项目信息管理');
import { reactive, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useProjectStore } from '../../stores/project-store';

const route = useRoute();
const store = useProjectStore();

const projectId = computed(() => String(route.params.projectId));

const project = computed(() => store.getProjectById(projectId.value));

const form = reactive({
  name: '',
  logo: '',
  mall_name: '',
  tenant_id: '',
  industry: '',
  description: '',
  sort: 0,
  status: 'active' as string,
});

const saving = ref(false);
const formRef = ref();

// v3.1.52: 商城名称校验——全局唯一 + 不超过20汉字（与运营后台一致）
const formRules = computed(() => ({
  mall_name: [
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (!value || value.trim() === '') return callback(); // 可选字段
        if (value.length > 20) return callback(new Error('商城名称不能超过20个汉字'));
        const dup = store.projects.find(
          p => p.mall_name === value.trim() && p.project_id !== projectId.value
        );
        if (dup) return callback(new Error(`商城名称「${value.trim()}」已被项目「${dup.name}」使用，请更换`));
        callback();
      },
      trigger: 'blur',
    },
  ],
}));

// 初始化表单
watch(() => project.value, (p) => {
  if (p) {
    form.name = p.name;
    form.logo = p.logo || '';
    form.mall_name = p.mall_name || '';
    form.tenant_id = p.tenant_id || '';
    form.industry = p.industry || '';
    form.description = p.description;
    form.sort = p.sort ?? 0;
    form.status = p.status;
    // 加载时清除校验状态
    setTimeout(() => formRef.value?.clearValidate(), 0);
  }
}, { immediate: true });

async function onSave() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  saving.value = true;
  store.updateProject(projectId.value, {
    name: form.name,
    logo: form.logo || undefined,
    mall_name: form.mall_name.trim() || undefined,
    description: form.description,
    sort: form.sort,
    status: form.status as 'active' | 'inactive',
  });
  saving.value = false;
  ElMessage.success('项目信息已更新');
}

function onReset() {
  const p = project.value;
  if (p) {
    form.name = p.name;
    form.logo = p.logo || '';
    form.mall_name = p.mall_name || '';
    form.tenant_id = p.tenant_id || '';
    form.industry = p.industry || '';
    form.description = p.description;
    form.sort = p.sort ?? 0;
    form.status = p.status;
    formRef.value?.clearValidate();
  }
}

function onLogoChange(file: any) {
  const raw = file.raw;
  if (!raw) return;
  if (raw.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 2MB');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => { form.logo = e.target?.result as string; };
  reader.readAsDataURL(raw);
}
</script>

<style scoped>
.project-profile-manage { padding: 20px; max-width: 720px; }
.ppm-header { margin-bottom: 20px; }
.ppm-header h2 { margin: 0 0 6px; font-size: 20px; font-weight: 700; color: #111; }
.ppm-desc { margin: 0; font-size: 13px; color: #888; }
.ppm-card { border-radius: 8px; }
.ppm-logo-uploader { display: inline-block; }
.ppm-logo-upload-box {
  width: 80px; height: 80px;
  border: 1px dashed #d9d9d9; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer;
}
.ppm-logo-upload-box:hover { border-color: #FF6B35; }
.ppm-logo-upload-icon { font-size: 22px; color: #bbb; }
.ppm-logo-upload-text { font-size: 11px; color: #bbb; margin-top: 4px; }
.ppm-logo-upload-preview { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; }
.ppm-hint { margin-top: 4px; font-size: 12px; color: #999; }
.ppm-status-warning { margin-top: 8px; font-size: 12px; color: #999; line-height: 1.6; }
</style>
