<template>
  <div class="approval-page">
    <el-card shadow="never">
      <template #header><span>降级/升级申请审批</span></template>
      <el-table :data="requests" stripe>
        <el-table-column prop="tenant" label="租户" width="160" />
        <el-table-column prop="type" label="申请类型" width="80">
          <template #default="{row}"><el-tag :type="row.type==='降级'?'warning':'success'" size="small">{{row.type}}</el-tag></template>
        </el-table-column>
        <el-table-column prop="category" label="词库类别" width="120" />
        <el-table-column prop="current_level" label="当前级别" width="90" />
        <el-table-column prop="target_level" label="目标级别" width="90" />
        <el-table-column prop="reason" label="申请理由" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{row}"><el-tag :type="row.status==='待审批'?'danger':row.status==='通过'?'success':'info'" size="small">{{row.status}}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{row}">
            <template v-if="row.status==='待审批'">
              <el-button size="small" type="success" @click="approve(row)">通过</el-button>
              <el-button size="small" type="danger" text @click="reject(row)">驳回</el-button>
            </template>
            <span v-else style="color:#999">已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="rejectVisible" title="驳回申请" width="420px">
      <p><strong>{{ currentRow?.tenant }}</strong> 申请{{ currentRow?.type }} {{ currentRow?.category }} → {{ currentRow?.target_level }}</p>
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="驳回理由（必填）" style="margin-top:12px" />
      <template #footer>
        <el-button @click="rejectVisible=false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const rejectVisible = ref(false)
const rejectReason = ref('')
const currentRow = ref<any>(null)
const requests = ref([
  { tenant: '租户A-美妆连锁', type: '降级', category: '平台基础词库', current_level: 'L3', target_level: 'L4', reason: '业务以美妆产品为主，部分词库过于严格影响正常直播', status: '待审批' },
  { tenant: '租户B-大健康', type: '升级', category: '自定义词库', current_level: 'L4', target_level: 'L2', reason: '医疗健康行业需要更严格的审查', status: '待审批' },
  { tenant: '租户C-百货', type: '降级', category: '平台基础词库', current_level: 'L2', target_level: 'L3', reason: '百货零售场景管控力度可适当降低', status: '待审批' },
  { tenant: '租户D-训练营', type: '升级', category: '广告法', current_level: 'L3', target_level: 'L1', reason: '需加强广告法合规管控', status: '通过' },
])
function approve(row: any) { row.status = '通过'; ElMessage.success(`${row.tenant} 申请已通过`) }
function reject(row: any) { currentRow.value = row; rejectReason.value = ''; rejectVisible.value = true }
function confirmReject() { if (currentRow.value) { currentRow.value.status = '驳回'; rejectVisible.value = false; ElMessage.info(`${currentRow.value.tenant} 申请已驳回`) } }
</script>
<style scoped>
.approval-page { padding: 16px; }
</style>
