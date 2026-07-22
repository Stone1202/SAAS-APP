<template>
  <div class="statistics-dashboard">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>违规统计看板</span>
          <el-select v-model="timeRange" style="width: 140px;" size="small">
            <el-option label="最近7天" value="7d" />
            <el-option label="最近30天" value="30d" />
            <el-option label="全部" value="all" />
          </el-select><InlineHelpMark :uc="buttonUseCases['BTN-019']" />
        </div>
      </template>

      <!-- 指标卡片 -->
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-label">违规总数</div>
            <div class="metric-value">{{ stats.total }}</div>
            <div class="metric-trend up">↑ 12%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-label">已处置数</div>
            <div class="metric-value">{{ stats.disposed }}</div>
            <div class="metric-trend up">↑ 8%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-label">擦音覆盖率</div>
            <div class="metric-value">{{ stats.mutedRate }}%</div>
            <div class="metric-trend">—</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-label">待处理</div>
            <div class="metric-value danger">{{ stats.pending }}</div>
            <div class="metric-trend down">↓ 5%</div>
          </div>
        </el-col>
      </el-row>

      <!-- TOP风险类型 -->
      <el-row :gutter="16" style="margin-top: 16px;">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header><span>TOP风险类型</span></template>
            <div v-for="(count, type) in stats.byType" :key="type" class="bar-item">
              <span class="bar-label">{{ getTypeName(type) }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: getBarWidth(count) + '%', background: getBarColor(type) }"></div>
              </div>
              <span class="bar-count">{{ count }}</span>
            </div>
            <el-empty v-if="Object.keys(stats.byType).length === 0" description="暂无数据" :image-size="60" />
          </el-card>
        </el-col>

        <!-- 处置分布 -->
        <el-col :span="12">
          <el-card shadow="never">
            <template #header><span>处置分布</span></template>
            <div class="disposal-stats">
              <div class="disposal-item">
                <el-tag type="info">已记录</el-tag>
                <span>{{ getDisposalCount('recorded') }}</span>
              </div>
              <div class="disposal-item">
                <el-tag type="danger">已断流</el-tag>
                <span>{{ getDisposalCount('stream_stopped') }}</span>
              </div>
              <div class="disposal-item">
                <el-tag type="info">已忽略</el-tag>
                <span>{{ getDisposalCount('ignored') }}</span>
              </div>
              <div class="disposal-item">
                <el-tag type="warning">已超时</el-tag>
                <span>{{ getDisposalCount('timeout') }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 违规级别分布 -->
      <el-card shadow="never" style="margin-top: 16px;">
        <template #header><span>违规级别分布</span></template>
        <el-row :gutter="16">
          <el-col :span="6" v-for="level in ['L1', 'L2', 'L3', 'L4']" :key="level">
            <div class="level-card" :class="'level-' + level.toLowerCase()">
              <div class="level-label">{{ getLevelName(level) }}（{{ level }}）</div>
              <div class="level-count">{{ stats.byLevel[level] || 0 }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuditStore } from '@/stores/audit'
import InlineHelpMark from '@/components/audit/InlineHelpMark.vue'
import { buttonUseCases } from '@/data/use-case-cards'

const auditStore = useAuditStore()
const timeRange = ref('7d')

const stats = computed(() => auditStore.getStatistics())

onMounted(() => {
  auditStore.init()
})

const TYPE_NAMES: Record<string, string> = { pornography: '涉黄', violence: '涉暴', advertising_law: '广告法', prohibited_word: '违禁词', public_safety: '公共安全', social_safety: '社会安全', illegal: '违法乱纪', custom: '自定义' }
function getTypeName(t: string) { return TYPE_NAMES[t] || t }
const LEVEL_NAMES: Record<string, string> = { L1: '核心', L2: '高危', L3: '中危', L4: '低危' }
function getLevelName(l: string) { return LEVEL_NAMES[l] || l }

const COLORS: Record<string, string> = { pornography: '#f5222d', violence: '#fa541c', advertising_law: '#faad14', prohibited_word: '#1890ff' }
function getBarColor(type: string) { return COLORS[type] || '#8c8c8c' }

function getBarWidth(count: number) {
  const max = Math.max(...Object.values(stats.value.byType), 1)
  return Math.round((count / max) * 100)
}

function getDisposalCount(status: string) {
  return auditStore.violations.filter(v => v.disposal_status === status).length
}
</script>

<style scoped>
.statistics-dashboard { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.metric-card { background: #fff; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #f0f0f0; }
.metric-label { font-size: 14px; color: #8c8c8c; }
.metric-value { font-size: 32px; font-weight: 700; color: #1890ff; margin: 8px 0; }
.metric-value.danger { color: #f5222d; }
.metric-trend { font-size: 12px; color: #8c8c8c; }
.metric-trend.up { color: #f5222d; }
.metric-trend.down { color: #52c41a; }
.bar-item { display: flex; align-items: center; margin-bottom: 12px; gap: 8px; }
.bar-label { width: 80px; font-size: 13px; text-align: right; }
.bar-track { flex: 1; height: 20px; background: #f5f5f5; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.bar-count { width: 30px; font-size: 13px; font-weight: 600; }
.disposal-stats { display: flex; flex-direction: column; gap: 16px; }
.disposal-item { display: flex; align-items: center; gap: 12px; }
.disposal-item span { font-size: 18px; font-weight: 700; }
.level-card { padding: 16px; border-radius: 8px; text-align: center; }
.level-label { font-size: 13px; color: #8c8c8c; }
.level-count { font-size: 28px; font-weight: 700; margin-top: 4px; }
.level-l1 { background: #fff1f0; } .level-l1 .level-count { color: #f5222d; }
.level-l2 { background: #fff7e6; } .level-l2 .level-count { color: #fa8c16; }
.level-l3 { background: #fffbe6; } .level-l3 .level-count { color: #faad14; }
.level-l4 { background: #e6f7ff; } .level-l4 .level-count { color: #1890ff; }
</style>
