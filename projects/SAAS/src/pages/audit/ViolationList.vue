<template>
  <div class="violation-list">
    <el-card shadow="never">
      <template #header>
        <span>违规记录管理</span>
      </template>

      <!-- 查询条件 -->
      <div class="filter-bar">
        <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
        <el-select v-model="filterType" placeholder="违规类型" clearable style="width: 140px;">
          <el-option label="涉黄" value="pornography" />
          <el-option label="涉暴" value="violence" />
          <el-option label="广告法" value="advertising_law" />
          <el-option label="违禁词" value="prohibited_word" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="处置状态" clearable style="width: 120px;">
          <el-option label="待处理" value="pending" />
          <el-option label="已记录" value="recorded" />
          <el-option label="已断流" value="stream_stopped" />
          <el-option label="已忽略" value="ignored" />
          <el-option label="已超时" value="timeout" />
        </el-select>
        <el-button type="primary" @click="loadData">查询</el-button><InlineHelpMark :uc="buttonUseCases['BTN-016']" /><el-button @click="resetFilter">重置</el-button><InlineHelpMark :uc="buttonUseCases['BTN-017']" />
      </div>

      <!-- 违规记录表格 -->
      <el-table :data="filteredViolations" stripe max-height="600">
        <el-table-column prop="violation_time" label="违规时间" width="170">
          <template #default="{ row }">{{ formatTime(row.violation_time) }}</template>
        </el-table-column>
        <el-table-column prop="stream_id" label="推流ID" width="140" />
        <el-table-column prop="violation_type" label="类型" width="100">
          <template #default="{ row }">{{ getTypeName(row.violation_type) }}</template>
        </el-table-column>
        <el-table-column prop="violation_level" label="级别" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.violation_level)" size="small">{{ getLevelName(row.violation_level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="keyword" label="敏感词" width="120" />
        <el-table-column prop="confidence" label="置信度" width="80" align="center">
          <template #default="{ row }">{{ row.confidence }}%</template>
        </el-table-column>
        <el-table-column prop="audio_muted" label="擦音" width="70" align="center">
          <template #default="{ row }">{{ row.audio_muted ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column prop="disposal_status" label="处置状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.disposal_status)" size="small">{{ getStatusName(row.disposal_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text @click="showDetail(row)">详情</el-button><InlineHelpMark :uc="buttonUseCases['BTN-018']" />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :total="filteredViolations.length" :page-size="20" />
      </div>
    </el-card>

    <!-- 违规详情弹窗 -->
    <el-dialog v-model="detailVisible" title="违规详情" width="640px">
      <template v-if="currentViolation">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="违规ID">{{ currentViolation.violation_id }}</el-descriptions-item>
          <el-descriptions-item label="推流ID">{{ currentViolation.stream_id }}</el-descriptions-item>
          <el-descriptions-item label="违规时间">{{ formatTime(currentViolation.violation_time) }}</el-descriptions-item>
          <el-descriptions-item label="违规类型">{{ getTypeName(currentViolation.violation_type) }}</el-descriptions-item>
          <el-descriptions-item label="违规级别">{{ getLevelName(currentViolation.violation_level) }}</el-descriptions-item>
          <el-descriptions-item label="命中敏感词">{{ currentViolation.keyword || '—' }}</el-descriptions-item>
          <el-descriptions-item label="置信度">{{ currentViolation.confidence }}%</el-descriptions-item>
          <el-descriptions-item label="处置建议">{{ getSuggestionName(currentViolation.suggestion) }}</el-descriptions-item>
          <el-descriptions-item label="是否擦音">{{ currentViolation.audio_muted ? `是（${currentViolation.mute_duration || 0}秒）` : '否' }}</el-descriptions-item>
          <el-descriptions-item label="处置状态">{{ getStatusName(currentViolation.disposal_status) }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />
        <h4>证据</h4>
        <el-link type="primary" :href="currentViolation.evidence_url" target="_blank">查看证据文件</el-link>
        <el-link type="primary" :href="currentViolation.violation_content" target="_blank" style="margin-left: 24px;">查看音频片段</el-link>

        <el-divider />
        <h4>处置记录</h4>
        <el-table :data="disposals" size="small">
          <el-table-column prop="disposal_type" label="处置方式" width="100" />
          <el-table-column prop="operator" label="处置人" width="120" />
          <el-table-column prop="operated_at" label="处置时间" width="170">
            <template #default="{ row }">{{ formatTime(row.operated_at) }}</template>
          </el-table-column>
          <el-table-column prop="disposal_reason" label="处置理由" />
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuditStore } from '@/stores/audit'
import type { ReviewViolation } from '@/contracts/content-review'
import InlineHelpMark from '@/components/audit/InlineHelpMark.vue'
import { buttonUseCases } from '@/data/use-case-cards'

const auditStore = useAuditStore()
const dateRange = ref<[Date, Date] | null>(null)
const filterType = ref('')
const filterStatus = ref('')
const detailVisible = ref(false)
const currentViolation = ref<ReviewViolation | null>(null)

const filteredViolations = computed(() => {
  let result = auditStore.violations
  if (filterType.value) result = result.filter(v => v.violation_type === filterType.value)
  if (filterStatus.value) result = result.filter(v => v.disposal_status === filterStatus.value)
  return result
})

const disposals = computed(() => {
  if (!currentViolation.value) return []
  return auditStore.getDisposalsForViolation(currentViolation.value.violation_id)
})

onMounted(() => {
  auditStore.init()
  auditStore.loadViolations()
})

function loadData() { auditStore.loadViolations() }
function resetFilter() { filterType.value = ''; filterStatus.value = ''; dateRange.value = null }
function showDetail(v: ReviewViolation) { currentViolation.value = v; detailVisible.value = true }

const TYPE_NAMES: Record<string, string> = { pornography: '涉黄', violence: '涉暴', advertising_law: '广告法', prohibited_word: '违禁词', public_safety: '公共安全', social_safety: '社会安全', illegal: '违法乱纪', custom: '自定义' }
function getTypeName(t: string) { return TYPE_NAMES[t] || t }
const LEVEL_NAMES: Record<string, string> = { L1: '高', L2: '高', L3: '中', L4: '低' }
function getLevelName(l: string) { return LEVEL_NAMES[l] || l }
function getLevelTagType(l: string): any { return l === 'L1' || l === 'L2' ? 'danger' : l === 'L3' ? 'warning' : 'info' }
const STATUS_NAMES: Record<string, string> = { pending: '待处理', recorded: '已记录', stream_stopped: '已断流', ignored: '已忽略', timeout: '已超时' }
function getStatusName(s: string) { return STATUS_NAMES[s] || s }
function getStatusType(s: string): any { return s === 'pending' || s === 'stream_stopped' ? 'danger' : s === 'timeout' ? 'warning' : 'info' }
const SUGGESTION_NAMES: Record<string, string> = { pass: '通过', review: '复核', block: '阻断' }
function getSuggestionName(s: string) { return SUGGESTION_NAMES[s] || s }
function formatTime(t: string) { return new Date(t).toLocaleString('zh-CN', { hour12: false }) }
</script>

<style scoped>
.violation-list { padding: 16px; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
