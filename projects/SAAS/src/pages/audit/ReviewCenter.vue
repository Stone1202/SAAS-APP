<template>
  <div class="review-center">
    <!-- B-001 提示区 -->
    <div class="alert-bar">
      <div class="alert-left">
        <el-tag :type="auditStore.reviewStatus === 'running' ? 'success' : 'danger'" effect="dark">
          审查状态：{{ auditStore.reviewStatus === 'running' ? '运行中' : '异常' }}
        </el-tag>
        <span class="violation-count">当前违规：<strong>{{ pendingCount }}</strong> 条待处理</span>
      </div>
      <div class="alert-right" v-if="latestViolation">
        <el-tag :type="getLevelTagType(latestViolation.violation_level)" effect="dark">
          最新告警：{{ formatTime(latestViolation.violation_time) }} {{ getTypeName(latestViolation.violation_type) }}（{{ getLevelName(latestViolation.violation_level) }}）
        </el-tag>
      </div>
    </div>

    <!-- B-002 违规列表区 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>违规记录列表</span>
          <el-button @click="auditStore.loadViolations()" size="small" :icon="Refresh">刷新</el-button><InlineHelpMark :uc="buttonUseCases['BTN-010']" />
        </div>
      </template>

      <el-table :data="auditStore.violations" style="width: 100%" max-height="600" stripe>
        <el-table-column prop="violation_time" label="违规时间" width="170">
          <template #default="{ row }">{{ formatTime(row.violation_time) }}</template>
        </el-table-column>

        <el-table-column prop="violation_type" label="违规类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeName(row.violation_type) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="violation_level" label="级别" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.violation_level)" size="small" effect="dark">
              {{ getLevelName(row.violation_level) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="keyword" label="命中敏感词" width="120">
          <template #default="{ row }">{{ row.keyword || '—' }}</template>
        </el-table-column>

        <el-table-column prop="confidence" label="置信度" width="80" align="center">
          <template #default="{ row }">{{ row.confidence }}%</template>
        </el-table-column>

        <el-table-column prop="suggestion" label="处置建议" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getSuggestionType(row.suggestion)" size="small">{{ getSuggestionName(row.suggestion) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="audio_muted" label="擦音" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.audio_muted ? 'success' : 'info'" size="small">
              {{ row.audio_muted ? `已擦${row.mute_duration || ''}s` : '未擦音' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="disposal_status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.disposal_status)" size="small">{{ getStatusName(row.disposal_status) }}</el-tag>
          </template>
        </el-table-column>

        <!-- B-003 处置操作区 -->
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <template v-if="row.disposal_status === 'pending'">
              <el-button size="small" @click="openDisposal(row, 'record')">记录</el-button><InlineHelpMark :uc="buttonUseCases['BTN-001']" />
              <el-button size="small" type="danger" @click="openDisposal(row, 'stop_stream')">断流</el-button><InlineHelpMark :uc="buttonUseCases['BTN-002']" />
              <el-button size="small" text @click="openDisposal(row, 'ignore')">忽略</el-button><InlineHelpMark :uc="buttonUseCases['BTN-003']" />
            </template>
            <el-button v-else size="small" text @click="openDetail(row)">查看详情</el-button><InlineHelpMark :uc="buttonUseCases['BTN-007']" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- M-001 处置弹窗 -->
    <DisposalDialog
      v-model:visible="disposalVisible"
      :violation="currentViolation"
      :disposal-type="currentDisposalType"
      @confirm="handleDisposal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useAuditStore } from '@/stores/audit'
import DisposalDialog from '@/components/audit/DisposalDialog.vue'
import InlineHelpMark from '@/components/audit/InlineHelpMark.vue'
import { buttonUseCases } from '@/data/use-case-cards'
import type { ReviewViolation, DisposalType } from '@/contracts/content-review'

const auditStore = useAuditStore()

const disposalVisible = ref(false)
const currentViolation = ref<ReviewViolation | null>(null)
const currentDisposalType = ref<DisposalType>('record')

const pendingCount = computed(() => auditStore.violations.filter(v => v.disposal_status === 'pending').length)
const latestViolation = computed(() => auditStore.violations[0])

onMounted(() => {
  auditStore.init()
})

function openDisposal(violation: ReviewViolation, type: DisposalType) {
  currentViolation.value = violation
  currentDisposalType.value = type
  disposalVisible.value = true
}

function openDetail(violation: ReviewViolation) {
  currentViolation.value = violation
  currentDisposalType.value = 'record'
  disposalVisible.value = true
}

async function handleDisposal(violation: ReviewViolation, type: DisposalType, reason: string) {
  await auditStore.dispose(violation, type, reason)
  disposalVisible.value = false
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
function getSuggestionType(s: string): any {
  if (s === 'block') return 'danger'
  if (s === 'review') return 'warning'
  return 'success'
}

const STATUS_NAMES: Record<string, string> = {
  pending: '待处理', recorded: '已记录', stream_stopped: '已断流', ignored: '已忽略', timeout: '已超时',
}
function getStatusName(s: string) { return STATUS_NAMES[s] || s }
function getStatusType(s: string): any {
  if (s === 'pending') return 'danger'
  if (s === 'stream_stopped') return 'danger'
  if (s === 'timeout') return 'warning'
  return 'info'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.review-center { padding: 16px; }
.alert-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; margin-bottom: 12px; background: #fff;
  border-radius: 4px; border-left: 4px solid #1890ff;
}
.violation-count { margin-left: 16px; font-size: 14px; }
.violation-count strong { color: #f5222d; font-size: 18px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
