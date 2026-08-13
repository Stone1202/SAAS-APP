<template>
  <div class="tenant-dashboard">
    <!--
      PG-ENTRY-TENANT-001: 租户后台入口 — 模拟直播列表 + 回放管理
      为直播审查功能提供「更多」菜单入口（PRD §17 入口复用）
      BR-AUDIT-004/015: 回放擦音后须在租户后台人工核对→发布
    -->
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" class="dashboard-tabs">
      <el-tab-pane name="live">
        <template #label>
          <span>直播管理
            <HelpIcon
              @click="openElementHelp('E-AUDIT-005-01')"
              title="查看「直播管理/回放管理」Tab用例说明"
            />
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane name="replay">
        <template #label>
          <span>回放管理
            <HelpIcon
              @click="openElementHelp('E-AUDIT-005-01')"
              title="查看「直播管理/回放管理」Tab用例说明"
            />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 直播管理 -->
    <el-card v-if="activeTab === 'live'" class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>直播管理</span>
          <el-tag type="success">仿真模式</el-tag>
        </div>
      </template>

      <el-table :data="liveSessions" stripe>
        <el-table-column prop="id" label="场次ID" width="120" />
        <el-table-column prop="title" label="场次名称" min-width="180" />
        <el-table-column prop="anchor" label="主播" width="100" />
        <el-table-column prop="status" label="状态" width="130">
          <template #header>
            <span>状态
              <HelpIcon
                @click="openElementHelp('E-AUDIT-005-02')"
                title="查看「直播状态标签」用例说明"
              />
            </span>
          </template>
          <template #default="{ row }">
            <div class="tag-cell">
              <el-tag :type="row.status === '直播中' ? 'danger' : 'info'" size="small">
                {{ row.status }}
              </el-tag>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-005-02')"
                title="查看「直播状态标签」用例说明"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="viewers" label="观看人数" width="100" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #header>
            <span>操作
              <HelpIcon
                @click="openElementHelp('E-AUDIT-005-04')"
                title="查看「操作」列用例说明"
              />
            </span>
          </template>
          <template #default="{ row }">
            <div class="action-cell">
              <template v-if="row.status === '直播中'">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="goLiveControl(row.id)"
                >
                  中控台
                </el-button>
                <HelpIcon
                  @click="openElementHelp('E-AUDIT-005-03')"
                  title="查看「中控台」按钮用例说明"
                />
              </template>
              <el-dropdown trigger="click">
                <el-button type="primary" size="small" link>
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <HelpIcon
                  @click="openElementHelp('E-AUDIT-005-04')"
                  title="查看「更多」下拉菜单用例说明"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- 5级联动：审查关闭时禁用+提示 -->
                    <el-tooltip
                      :content="'该场次审查已关闭，无法查看历史违规'"
                      :disabled="!isAuditDisabled(row.id)"
                      placement="left"
                    >
                      <div>
                        <el-dropdown-item
                          :disabled="isAuditDisabled(row.id)"
                          @click="goViolations(row.id)"
                        >
                          查看历史违规列表
                          <span v-if="isAuditDisabled(row.id)" class="disabled-tag">已关闭</span>
                        </el-dropdown-item>
                      </div>
                    </el-tooltip>
                    <el-dropdown-item
                      v-if="row.status !== '直播中'"
                      @click="goReplay(row.id)"
                    >
                      查看回放
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 回放管理（BR-AUDIT-004/015：租户侧核对→发布回放） -->
    <el-card v-if="activeTab === 'replay'" class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>回放管理</span>
          <el-tag type="warning" size="small" v-if="pendingReviewCount > 0">
            待核对 {{ pendingReviewCount }}
          </el-tag>
        </div>
      </template>

      <el-table :data="replayRecords" stripe>
        <el-table-column prop="streamId" label="场次ID" width="120" />
        <el-table-column prop="title" label="场次名称" min-width="180" />
        <el-table-column prop="anchor" label="主播" width="100" />
        <el-table-column label="直播状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.liveStatus === '进行中' ? 'danger' : 'info'" size="small">
              {{ row.liveStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="擦音状态" width="140">
          <template #header>
            <span>擦音状态
              <HelpIcon
                @click="openElementHelp('E-AUDIT-005-05')"
                title="查看「擦音状态标签」用例说明"
              />
            </span>
          </template>
          <template #default="{ row }">
            <div class="tag-cell">
              <el-tag :type="muteTagType(row.muteStatus)" size="small" effect="dark">
                {{ muteLabel(row.muteStatus) }}
              </el-tag>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-005-05')"
                title="查看「擦音状态标签」用例说明"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布状态" width="140">
          <template #header>
            <span>发布状态
              <HelpIcon
                @click="openElementHelp('E-AUDIT-005-06')"
                title="查看「发布状态标签」用例说明"
              />
            </span>
          </template>
          <template #default="{ row }">
            <div class="tag-cell">
              <el-tag :type="publishTagType(row.publishStatus)" size="small" effect="dark">
                {{ publishLabel(row.publishStatus) }}
              </el-tag>
              <HelpIcon
                @click="openElementHelp('E-AUDIT-005-06')"
                title="查看「发布状态标签」用例说明"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #header>
            <span>操作
              <HelpIcon
                @click="openElementHelp('E-AUDIT-005-07')"
                title="查看「操作」列用例说明"
              />
            </span>
          </template>
          <template #default="{ row }">
            <div class="action-cell">
              <template v-if="row.muteStatus === 'completed' && row.publishStatus === 'pending_review'">
                <el-button type="success" size="small" @click="goReplayReview(row)">
                  核对并发布
                </el-button>
                <HelpIcon
                  @click="openElementHelp('E-AUDIT-005-07')"
                  title="查看「核对并发布」按钮用例说明"
                />
              </template>
              <template v-else-if="row.publishStatus === 'rejected'">
                <el-button type="warning" size="small" @click="goReplayReview(row)">
                  重新核对
                </el-button>
                <HelpIcon
                  @click="openElementHelp('E-AUDIT-005-07')"
                  title="查看「重新核对」按钮用例说明"
                />
              </template>
              <template v-else-if="row.publishStatus === 'published'">
                <el-button size="small" @click="goReplayView(row)">
                  查看已发布回放
                </el-button>
                <HelpIcon
                  @click="openElementHelp('E-AUDIT-005-09')"
                  title="查看「查看已发布回放」按钮用例说明"
                />
              </template>
              <template v-else>
                <span class="status-hint">{{ muteHint(row.muteStatus) }}</span>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!replayRecords.length" description="暂无回放记录" />
    </el-card>

    <!-- 用例交互卡 -->
    <HelpButton @open="showDrawer = true" />
    <UseCaseDrawer
      :visible="showDrawer"
      title="用例卡 — 直播/回放管理"
      :cards="tenantDashboardCards as any"
      :highlight-element-id="highlightElementId"
      @close="showDrawer = false; highlightElementId = ''"
    />

    <!-- 历史违规 400px 侧边抽屉 -->
    <ViolationsDrawer
      :visible="violationsDrawerVisible"
      :streamId="violationsStreamId"
      @close="violationsDrawerVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import { ArrowDown } from '@element-plus/icons-vue';
import HelpButton from '../../components/use-case-card/HelpButton.vue';
import HelpIcon from '../../components/use-case-card/HelpIcon.vue';
import UseCaseDrawer from '../../components/use-case-card/UseCaseDrawer.vue';
import ViolationsDrawer from '../../components/audit/ViolationsDrawer.vue';
import { tenantDashboardCards } from './useCaseCardData';

const router = useRouter();
const store = useAuditStore();

/** 5级联动：审查已关闭的租户ID集合 */
const auditDisabledTenants = ref<Set<string>>(new Set());

// ═══ 标签页切换 ═══
const activeTab = ref<'live' | 'replay'>('live');
const showDrawer = ref(false);
const highlightElementId = ref('');
/** 历史违规抽屉 */
const violationsDrawerVisible = ref(false);
const violationsStreamId = ref('');

function openElementHelp(elementId: string) {
  highlightElementId.value = elementId;
  showDrawer.value = true;
}

/** 模拟直播场次列表 */
interface LiveSession {
  id: string;
  title: string;
  anchor: string;
  status: string;
  viewers: number;
}

const liveSessions = ref<LiveSession[]>([
  { id: 'LIVE-001', title: '周一科技前沿直播', anchor: '科技小王', status: '直播中', viewers: 1234 },
  { id: 'LIVE-002', title: '新品发布会实况', anchor: '品牌主播', status: '直播中', viewers: 5678 },
  { id: 'LIVE-003', title: '周末娱乐专场', anchor: '娱乐达人', status: '已结束', viewers: 9999 },
  { id: 'LIVE-004', title: '知识付费公开课', anchor: '教育博士', status: '已结束', viewers: 3456 },
]);

// ═══ 回放管理（BR-AUDIT-004/015：租户侧核对→发布回放） ═══
type MuteSimStatus = 'pending' | 'processing' | 'completed' | 'failed';
type PublishSimStatus = 'pending_review' | 'reviewed' | 'published' | 'rejected';

interface ReplayRecord {
  streamId: string;
  title: string;
  anchor: string;
  liveStatus: string;
  muteStatus: MuteSimStatus;
  publishStatus: PublishSimStatus;
}

/** 回放记录：已结束的场次自动生成回放文件，LIVE-003已擦音完成待核对，LIVE-004尚在擦音 */
const replayRecords = ref<ReplayRecord[]>([
  { streamId: 'LIVE-003', title: '周末娱乐专场', anchor: '娱乐达人', liveStatus: '已结束', muteStatus: 'completed', publishStatus: 'pending_review' },
  { streamId: 'LIVE-004', title: '知识付费公开课', anchor: '教育博士', liveStatus: '已结束', muteStatus: 'processing', publishStatus: 'pending_review' },
]);

/** 待核对数量 */
const pendingReviewCount = computed(() =>
  replayRecords.value.filter(r => r.muteStatus === 'completed' && r.publishStatus === 'pending_review').length
);

// ═══ 状态标签辅助 ═══
function muteTagType(s: MuteSimStatus) {
  return { pending: 'info', processing: 'warning', completed: 'success', failed: 'danger' }[s] || 'info';
}
function muteLabel(s: MuteSimStatus) {
  return { pending: '待擦音', processing: '擦音中', completed: '已完成', failed: '失败' }[s] || s;
}
function muteHint(s: MuteSimStatus) {
  return { pending: '等待擦音', processing: '擦音处理中...', completed: '已完成', failed: '擦音失败' }[s] || '';
}
function publishTagType(s: PublishSimStatus) {
  return { pending_review: 'warning', reviewed: 'primary', published: 'success', rejected: 'danger' }[s] || 'info';
}
function publishLabel(s: PublishSimStatus) {
  return { pending_review: '待核对', reviewed: '已核对', published: '已发布', rejected: '已驳回' }[s] || s;
}

// ═══ 操作 ═══
/** 进入回放核对页面 */
function goReplayReview(rec: ReplayRecord) {
  router.push(`/tenant/live/${rec.streamId}/replay?mode=review`);
}
/** 查看已发布回放 */
function goReplayView(rec: ReplayRecord) {
  router.push(`/tenant/live/${rec.streamId}/replay?mode=view`);
}

// ═══ BR-AUDIT-017: 断流后场次列表自动同步状态 ═══
let bc: BroadcastChannel | null = null;

function onFieldStatusChange(payload: { status: string; streamId?: string }) {
  if (payload.status === 'ended' && payload.streamId) {
    // 同步直播管理：状态变更
    const session = liveSessions.value.find(s => s.id === payload.streamId);
    if (session && session.status === '直播中') {
      session.status = '已结束';
      // 自动生成回放记录（模拟：擦音完成，待核对）
      const existing = replayRecords.value.find(r => r.streamId === payload.streamId);
      if (!existing) {
        replayRecords.value.push({
          streamId: payload.streamId,
          title: session.title,
          anchor: session.anchor,
          liveStatus: '已结束',
          muteStatus: 'completed',
          publishStatus: 'pending_review',
        });
      }
    }
  }
}

onMounted(() => {
  if (typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel('saas-audit-effect');
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'field-status-change') {
        onFieldStatusChange(ev.data.payload);
      }
    };
  }
});

// 5级联动监听：审查开关→直播列表入口
watch(() => store.auditSwitchEvent, (event) => {
  if (!event) return;
  const next = new Set(auditDisabledTenants.value);
  if (event.enabled) {
    next.delete(event.tenant_id);
  } else {
    next.add(event.tenant_id);
  }
  auditDisabledTenants.value = next;
});

onUnmounted(() => {
  bc?.close();
  bc = null;
});


/** 跳转到直播中控 →「直播审查」Tab */
function goLiveControl(id: string) {
  router.push(`/tenant/live-control?tab=audit&streamId=${id}`);
}

/** 5级联动：检查租户审查是否已关闭 */
function isAuditDisabled(streamId: string): boolean {
  return auditDisabledTenants.value.has(streamId);
}

/** 历史违规 400px 侧边抽屉 */
function goViolations(id: string) {
  violationsStreamId.value = id;
  violationsDrawerVisible.value = true;
}

/** 跳转到回放详情 */
function goReplay(id: string) {
  router.push(`/tenant/live/${id}/replay`);
}
</script>

<style scoped>
.tenant-dashboard {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 24px;
}

.dashboard-tabs {
  margin-bottom: 16px;
}

.dashboard-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-hint {
  color: #909399;
  font-size: 12px;
}

.tag-cell,
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}
.disabled-tag {
  font-size: 11px;
  color: #BFBFBF;
  margin-left: 4px;
}

</style>
