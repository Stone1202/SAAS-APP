<template>
  <div class="template-config">
    <el-card shadow="never">
      <template #header><span>审核模板配置 — 腾讯云直播审核</span></template>
      <el-alert type="info" :closable="false" style="margin-bottom:16px">
        配置腾讯云直播审核模板，关联推流域名后，推流过程中自动执行审查+擦音。V1配置优先策略。
      </el-alert>
      <el-form label-width="140px" style="max-width:700px">
        <el-divider content-position="left">审核维度</el-divider>
        <el-form-item label="音频审核">
          <el-switch v-model="config.audio_audit" active-text="开启（敏感词消音）" />
        </el-form-item>
        <el-form-item label="视频审核">
          <el-switch v-model="config.video_audit" active-text="开启（截图审核）" />
        </el-form-item>
        <el-form-item label="截图频率">
          <el-input-number v-model="config.screenshot_interval" :min="1" :max="60" /> 秒/张
        </el-form-item>

        <el-divider content-position="left">擦音配置</el-divider>
        <el-form-item label="擦音模式">
          <el-radio-group v-model="config.mute_mode">
            <el-radio value="auto">自动擦音（腾讯云音画擦除）</el-radio>
            <el-radio value="manual">仅告警不擦音（人工处置）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="自定义敏感词库">
          <el-select v-model="config.keyword_libs" multiple style="width:100%">
            <el-option label="涉黄（不可降级）" value="pornography" disabled />
            <el-option label="涉暴（不可降级）" value="violence" disabled />
            <el-option label="公共安全（不可降级）" value="public_safety" disabled />
            <el-option label="社会安全（不可降级）" value="social_safety" disabled />
            <el-option label="违法乱纪（不可降级）" value="illegal" disabled />
            <el-option label="广告法（不可降级）" value="advertising_law" disabled />
            <el-option label="平台基础词库" value="platform_basic" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">回调配置</el-divider>
        <el-form-item label="回调地址">
          <el-input v-model="config.callback_url" placeholder="https://api.saas.com/api/audit/callback/review" />
        </el-form-item>
        <el-form-item label="回调数据">
          <el-tag type="success">全量接收（含原始JSON+证据URL+擦音信息）</el-tag>
        </el-form-item>

        <el-divider content-position="left">推流域名关联</el-divider>
        <el-form-item label="关联域名">
          <el-checkbox-group v-model="config.domains">
            <el-checkbox value="push.tenant1.saas.com">push.tenant1.saas.com（租户1）</el-checkbox>
            <el-checkbox value="push.tenant2.saas.com">push.tenant2.saas.com（租户2）</el-checkbox>
            <el-checkbox value="push.tenant3.saas.com">push.tenant3.saas.com（租户3）</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveVisible = true">保存并同步到腾讯云</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="saveVisible" title="确认同步" width="400px">
      <p>配置将同步到腾讯云直播审核服务，关联的推流域名将立即生效。</p>
      <p style="color:#999;font-size:13px">关联域名：{{ config.domains.join(', ') || '未选择' }}</p>
      <template #footer>
        <el-button @click="saveVisible = false">取消</el-button>
        <el-button type="primary" @click="saveVisible = false; ElMessage.success('配置已同步到腾讯云')">确认同步</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const saveVisible = ref(false)
const config = ref({
  audio_audit: true, video_audit: true, screenshot_interval: 5,
  mute_mode: 'auto',
  keyword_libs: ['pornography', 'violence', 'public_safety', 'social_safety', 'illegal', 'advertising_law', 'platform_basic'],
  callback_url: 'https://api.saas.com/api/audit/callback/review',
  domains: ['push.tenant1.saas.com', 'push.tenant2.saas.com'],
})
</script>
<style scoped>
.template-config { padding: 16px; }
</style>
