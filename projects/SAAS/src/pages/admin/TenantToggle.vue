<template>
  <div class="tenant-toggle">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>租户内容审查开关</span>
          <el-tag type="info" size="small">V1 — 审核模板/擦音/敏感词由腾讯云配置台配置</el-tag>
        </div>
      </template>
      <el-alert type="info" :closable="false" style="margin-bottom:16px">
        运营为租户开启内容审查后，租户直播中控室显示「内容审查Tab」，推流时腾讯云自动审查+擦音，回调推送到中控室。
      </el-alert>
      <el-table :data="tenants" stripe>
        <el-table-column prop="name" label="租户" width="180" />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column prop="domain" label="推流域名" width="220" />
        <el-table-column label="内容审查" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="(v) => onToggle(row, v)" active-text="开" inactive-text="关" inline-prompt /><InlineHelpMark :uc="buttonUseCases['BTN-005']" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }"><el-tag :type="row.enabled?'success':'info'" size="small">{{ row.enabled ? '已开启' : '未开启' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="今日违规" width="80" align="center">
          <template #default="{ row }"><span :style="{ color: row.violations > 0 ? '#f5222d' : '#999', fontWeight: row.violations > 0 ? 700 : 400 }">{{ row.violations }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }"><el-button size="small" :disabled="!row.enabled" @click="goControl(row)">进入中控</el-button><InlineHelpMark :uc="buttonUseCases['BTN-006']" /></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="confirmVisible" :title="`确认${action}内容审查`" width="420px">
      <p><strong>{{ curRow?.name }}</strong></p>
      <el-alert :type="action==='开启'?'success':'warning'" :closable="false" style="margin:12px 0">
        {{ action==='开启' ? '开启后直播推流自动执行腾讯云审查+擦音，违规回调推送到中控室。' : '关闭后不再执行审查（腾讯云不可降级类仍强制执行）。' }}
      </el-alert>
      <p style="color:#999;font-size:13px">推流域名：{{ curRow?.domain }}</p>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button :type="action==='开启'?'success':'warning'" @click="confirm">确认{{ action }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import InlineHelpMark from '@/components/audit/InlineHelpMark.vue'
import { buttonUseCases } from '@/data/use-case-cards'
const router = useRouter()
const confirmVisible = ref(false)
const curRow = ref<any>(null)
const action = ref('')
const tenants = ref([
  { id: 't1', name: '美妆连锁A', industry: '美妆', domain: 'push.tenant1.saas.com', enabled: true, violations: 3 },
  { id: 't2', name: '大健康B', industry: '大健康', domain: 'push.tenant2.saas.com', enabled: true, violations: 7 },
  { id: 't3', name: '百货C', industry: '百货', domain: 'push.tenant3.saas.com', enabled: false, violations: 0 },
  { id: 't4', name: '训练营D', industry: '教育', domain: 'push.tenant4.saas.com', enabled: false, violations: 0 },
])
function onToggle(row: any, val: boolean) {
  row.enabled = !val
  curRow.value = row
  action.value = val ? '开启' : '关闭'
  confirmVisible.value = true
}
function cancel() { confirmVisible.value = false; curRow.value = null }
function confirm() {
  if (curRow.value) { curRow.value.enabled = action.value === '开启'; ElMessage.success(`${curRow.value.name} 内容审查已${action.value}`) }
  confirmVisible.value = false
}
function goControl(row: any) { router.push('/tenant/control-room') }
</script>
<style scoped>
.tenant-toggle { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
