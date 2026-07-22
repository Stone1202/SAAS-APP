<template>
  <div class="control-room">
    <div class="session-bar">
      <div class="session-info">
        <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        <div>
          <div class="session-title">2026夏季新品发布会直播</div>
          <div class="session-meta">主播：小美 · <el-tag type="danger" size="small" effect="dark">直播中</el-tag> · 14:00开始 · 观看：1,256</div>
        </div>
      </div>
      <div class="session-actions">
        <span class="mute-mode-label">擦音模式：</span>
        <el-radio-group v-model="muteMode" size="small" @change="onMuteModeChange">
          <el-radio-button value="mute">静音（直接消音）</el-radio-button>
          <el-radio-button value="beep">擦音（嘀声替换）</el-radio-button>
        </el-radio-group><InlineHelpMark :uc="buttonUseCases['BTN-004']" />
        <el-button type="danger" size="small">终止直播</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="cr-tabs">
      <el-tab-pane label="商品" name="goods">
        <el-table :data="goodsList" size="small">
          <el-table-column prop="name" label="商品" />
          <el-table-column prop="price" label="价格" width="100" />
          <el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag size="small" :type="row.status==='讲解中'?'success':'info'">{{row.status}}</el-tag></template></el-table-column>
          <el-table-column label="操作" width="160"><template #default><el-button size="small">上链接</el-button><el-button size="small" text>下链接</el-button></template></el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="营销" name="marketing">
        <el-button type="primary" size="small">发红包</el-button>
        <el-button type="warning" size="small">发福袋</el-button>
        <el-button size="small">发优惠券</el-button>
        <el-divider />
        <el-alert type="warning" :closable="false">全部禁言（应急管控）<el-button size="small" type="danger" plain style="margin-left:12px">执行全部禁言</el-button></el-alert>
      </el-tab-pane>

      <el-tab-pane label="聊天" name="chat">
        <div v-for="msg in chatMsgs" :key="msg.id" class="chat-item"><span class="chat-user">{{msg.user}}：</span><span>{{msg.text}}</span></div>
      </el-tab-pane>

      <el-tab-pane name="audit">
        <template #label><el-badge :value="pendingCount" :hidden="pendingCount===0" type="danger"><span style="font-weight:600">内容审查</span></el-badge></template>
        <div class="audit-tab">
          <div class="alert-bar">
            <el-tag :type="auditStore.reviewStatus==='running'?'success':'danger'" effect="dark">审查状态：{{auditStore.reviewStatus==='running'?'运行中':'异常'}}</el-tag>
            <span>当前违规：<strong style="color:#f5222d;font-size:18px">{{pendingCount}}</strong> 条待处理</span>
            <el-button size="small" @click="auditStore.loadViolations()" :icon="Refresh">刷新</el-button>
          </div>
          <el-table :data="auditStore.violations" max-height="500" stripe size="small">
            <el-table-column prop="violation_time" label="时间" width="160"><template #default="{row}">{{new Date(row.violation_time).toLocaleString('zh-CN',{hour12:false})}}</template></el-table-column>
            <el-table-column prop="violation_type" label="类型" width="80"><template #default="{row}"><el-tag size="small">{{TN[row.violation_type]||row.violation_type}}</el-tag></template></el-table-column>
            <el-table-column prop="violation_level" label="级别" width="60" align="center"><template #default="{row}"><el-tag :type="lvlTag(row.violation_level)" size="small" effect="dark">{{LN[row.violation_level]}}</el-tag></template></el-table-column>
            <el-table-column prop="keyword" label="敏感词" width="100" />
            <el-table-column prop="suggestion" label="建议" width="70" align="center"><template #default="{row}"><el-tag :type="sugType(row.suggestion)" size="small">{{SN[row.suggestion]}}</el-tag></template></el-table-column>
            <el-table-column prop="audio_muted" label="擦音" width="60" align="center"><template #default="{row}"><el-tag :type="row.audio_muted?'success':'info'" size="small">{{row.audio_muted?'是':'否'}}</el-tag></template></el-table-column>
            <el-table-column prop="disposal_status" label="状态" width="70" align="center"><template #default="{row}"><el-tag :type="stType(row.disposal_status)" size="small">{{STN[row.disposal_status]}}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="200" fixed="right"><template #default="{row}"><template v-if="row.disposal_status==='pending'"><el-button size="small" @click="openDisposal(row,'record')">记录</el-button><InlineHelpMark :uc="buttonUseCases['BTN-001']" /><el-button size="small" type="danger" @click="openDisposal(row,'stop_stream')">断流</el-button><InlineHelpMark :uc="buttonUseCases['BTN-002']" /><el-button size="small" text @click="openDisposal(row,'ignore')">忽略</el-button><InlineHelpMark :uc="buttonUseCases['BTN-003']" /></template><span v-else style="color:#999;font-size:12px">已处理</span></template></el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <DisposalDialog v-model:visible="disposalVisible" :violation="curViolation" :disposal-type="curType" @confirm="handleDisposal" />
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
const activeTab = ref('audit')
const muteMode = ref<'mute' | 'beep'>('mute')
const disposalVisible = ref(false)
const curViolation = ref<ReviewViolation | null>(null)
const curType = ref<DisposalType>('record')
const pendingCount = computed(() => auditStore.violations.filter(v => v.disposal_status === 'pending').length)

const goodsList = ref([
  { name: '夏季防晒霜SPF50+', price: '¥89', status: '讲解中' },
  { name: '玻尿酸保湿面膜10片装', price: '¥129', status: '未上架' },
  { name: '维C亮肤精华液30ml', price: '¥199', status: '已售罄' },
])
const chatMsgs = ref([
  { id: 1, user: '用户A', text: '这个防晒霜防水吗？' },
  { id: 2, user: '用户B', text: '已经下单了！期待发货' },
  { id: 3, user: '用户C', text: '主播皮肤好好啊' },
])

onMounted(() => { auditStore.init(); const saved = localStorage.getItem('muteMode'); if (saved === 'beep' || saved === 'mute') muteMode.value = saved })
function onMuteModeChange(val: string) { localStorage.setItem('muteMode', val) }
function openDisposal(v: ReviewViolation, t: DisposalType) { curViolation.value = v; curType.value = t; disposalVisible.value = true }
async function handleDisposal(v: ReviewViolation, t: DisposalType, r: string) { await auditStore.dispose(v, t, r); disposalVisible.value = false }

const TN: Record<string,string> = {pornography:'涉黄',violence:'涉暴',advertising_law:'广告法',prohibited_word:'违禁词',public_safety:'公共安全',social_safety:'社会安全',illegal:'违法乱纪',custom:'自定义'}
const LN: Record<string,string> = {L1:'高',L2:'高',L3:'中',L4:'低'}
const lvlTag = (l:string):any=>l==='L1'||l==='L2'?'danger':l==='L3'?'warning':'info'
const SN: Record<string,string> = {pass:'通过',review:'复核',block:'阻断'}
const sugType = (s:string):any=>s==='block'?'danger':s==='review'?'warning':'success'
const STN: Record<string,string> = {pending:'待处理',recorded:'已记录',stream_stopped:'已断流',ignored:'已忽略',timeout:'已超时'}
const stType = (s:string):any=>s==='pending'||s==='stream_stopped'?'danger':s==='timeout'?'warning':'info'
</script>

<style scoped>
.control-room { padding: 16px; }
.session-bar { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#fff; border-radius:4px; margin-bottom:12px; }
.session-info { display:flex; align-items:center; gap:12px; }
.session-title { font-size:16px; font-weight:600; }
.session-meta { font-size:13px; color:#8c8c8c; margin-top:4px; }
.session-actions { display:flex; align-items:center; gap:8px; }
.mute-mode-label { font-size:13px; color:#606266; }
.audit-tab { }
.alert-bar { display:flex; align-items:center; gap:16px; padding:12px; background:#fff; border-radius:4px; border-left:4px solid #1890ff; margin-bottom:12px; }
.chat-item { padding:8px 0; border-bottom:1px solid #f0f0f0; }
.chat-user { color:#1890ff; font-weight:500; }
</style>
