<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="处置确认"
    width="640px"
    :close-on-click-modal="false"
  >
    <template v-if="violation">
      <!-- 违规头部 -->
      <div class="violation-header">
        <el-tag :type="getLevelTagType(violation.violation_level)" effect="dark">
          {{ getLevelName(violation.violation_level) }}
        </el-tag>
        <span class="violation-type">{{ getTypeName(violation.violation_type) }}</span>
        <el-tag v-if="violation.audio_muted" type="success" size="small">已擦音 {{ violation.mute_duration || 0 }}s</el-tag>
      </div>

      <el-divider />

      <!-- 违规依据区 -->
      <div class="evidence-section">
        <h4>违规依据</h4>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="违规时间">{{ formatTime(violation.violation_time) }}</el-descriptions-item>
          <el-descriptions-item label="违规类型">{{ getTypeName(violation.violation_type) }}</el-descriptions-item>
          <el-descriptions-item label="违规级别">{{ getLevelName(violation.violation_level) }}</el-descriptions-item>
          <el-descriptions-item label="命中敏感词">{{ violation.keyword || '—' }}</el-descriptions-item>
          <el-descriptions-item label="置信度">{{ violation.confidence }}%</el-descriptions-item>
          <el-descriptions-item label="腾讯云建议">{{ getSuggestionName(violation.suggestion) }}</el-descriptions-item>
          <el-descriptions-item label="是否已擦音">{{ violation.audio_muted ? `是（${violation.mute_duration || 0}秒）` : '否' }}</el-descriptions-item>
          <el-descriptions-item label="擦音起始">{{ violation.mute_start_time ? formatTime(violation.mute_start_time) : '—' }}</el-descriptions-item>
        </el-descriptions>

        <div class="evidence-links">
          <el-link type="primary" :href="violation.violation_content" target="_blank">
            <el-icon><Headset /></el-icon> 查看音频片段
          </el-link>
          <el-link type="primary" :href="violation.evidence_url" target="_blank">
            <el-icon><Picture /></el-icon> 查看证据截图
          </el-link>
          <el-link type="info" @click="showRawCallback = !showRawCallback">
            <el-icon><Document /></el-icon> {{ showRawCallback ? '隐藏' : '查看' }}回调原始数据
          </el-link>
        </div>

        <el-collapse-transition>
          <pre v-if="showRawCallback" class="raw-callback">{{ formatRawCallback(violation.raw_callback) }}</pre>
        </el-collapse-transition>
      </div>

      <el-divider />

      <!-- 处置方式选择 -->
      <div class="disposal-section">
        <h4>处置方式</h4>
        <el-radio-group v-model="selectedType">
          <el-radio value="record">记录（不打断直播）</el-radio>
          <el-radio value="stop_stream">断流（切断推流，终止直播）</el-radio>
          <el-radio value="ignore">忽略（标记为非违规）</el-radio>
        </el-radio-group>

        <div style="margin-top: 12px;">
          <span style="margin-right: 8px;">处置理由：</span>
          <el-input
            v-model="reason"
            type="textarea"
            :rows="3"
            placeholder="请填写处置理由（必填）"
            style="margin-top: 4px;"
          />
        </div>

        <el-alert
          v-if="selectedType === 'stop_stream'"
          title="⚠ 断流将终止直播，此操作不可撤回"
          type="warning"
          :closable="false"
          style="margin-top: 12px;"
        />
      </div>
    </template>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button
        type="primary"
        :type="selectedType === 'stop_stream' ? 'danger' : 'primary'"
        @click="handleConfirm"
        :disabled="!reason.trim()"
      >
        {{ selectedType === 'stop_stream' ? '确认断流' : '确认处置' }}
      </el-button>
    </template>
  </el-dialog>

  <!-- 断流二次确认 -->
  <el-dialog
    v-model="confirmStopStream"
    title="二次确认"
    width="360px"
    append-to-body
  >
    <p style="text-align: center; font-size: 16px;">
      ⚠ 确定要切断推流吗？<br />此操作将终止直播且不可撤回。
    </p>
    <template #footer>
      <el-button @click="confirmStopStream = false">取消</el-button>
      <el-button type="danger" @click="confirmStop">确定断流</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Headset, Picture, Document } from '@element-plus/icons-vue'
import type { ReviewViolation, DisposalType } from '@/contracts/content-review'

const props = defineProps<{
  visible: boolean
  violation: ReviewViolation | null
  disposalType: DisposalType
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [violation: ReviewViolation, type: DisposalType, reason: string]
}>()

const selectedType = ref<DisposalType>('record')
const reason = ref('')
const showRawCallback = ref(false)
const confirmStopStream = ref(false)

watch(() => props.disposalType, (val) => {
  selectedType.value = val
  reason.value = ''
})

function handleConfirm() {
  if (selectedType.value === 'stop_stream') {
    confirmStopStream.value = true
    return
  }
  doConfirm()
}

function confirmStop() {
  confirmStopStream.value = false
  doConfirm()
}

function doConfirm() {
  if (props.violation) {
    emit('confirm', props.violation, selectedType.value, reason.value)
  }
}

const TYPE_NAMES: Record<string, string> = {
  pornography: '涉黄', violence: '涉暴', public_safety: '公共安全', social_safety: '社会安全',
  illegal: '违法乱纪', advertising_law: '广告法', prohibited_word: '违禁词', custom: '自定义',
}
function getTypeName(type: string) { return TYPE_NAMES[type] || type }

const LEVEL_NAMES: Record<string, string> = { L1: '高', L2: '高', L3: '中', L4: '低' }
function getLevelName(level: string) { return LEVEL_NAMES[level] || level }
function getLevelTagType(level: string): any {
  if (level === 'L1' || level === 'L2') return 'danger'
  if (level === 'L3') return 'warning'
  return 'info'
}

const SUGGESTION_NAMES: Record<string, string> = { pass: '通过', review: '复核', block: '阻断' }
function getSuggestionName(s: string) { return SUGGESTION_NAMES[s] || s }

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN', { hour12: false })
}

function formatRawCallback(raw: string) {
  try { return JSON.stringify(JSON.parse(raw), null, 2) } catch { return raw }
}
</script>

<style scoped>
.violation-header { display: flex; align-items: center; gap: 12px; }
.violation-type { font-size: 16px; font-weight: 600; }
.evidence-section h4, .disposal-section h4 { margin: 0 0 12px 0; color: #303133; }
.evidence-links { margin-top: 12px; display: flex; gap: 24px; }
.raw-callback {
  margin-top: 12px; padding: 12px; background: #f5f7fa;
  border-radius: 4px; font-size: 12px; max-height: 200px;
  overflow: auto; white-space: pre-wrap;
}
</style>
