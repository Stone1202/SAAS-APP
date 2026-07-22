<template>
  <div class="tenant-dashboard">
    <!--
      PG-ENTRY-TENANT-001: 租户后台入口 — 模拟直播列表
      为内容审查功能提供「更多」菜单入口（PRD §17 入口复用）
    -->
    <el-card class="dashboard-card">
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
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '直播中' ? 'danger' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewers" label="观看人数" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === '直播中'">
              <el-button
                type="primary"
                size="small"
                link
                @click="goLiveControl(row.id)"
              >
                中控台
              </el-button>
            </template>
            <el-dropdown trigger="click">
              <el-button type="primary" size="small" link>
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goViolations(row.id)">
                    查看历史违规列表
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status !== '直播中'"
                    @click="goReplay(row.id)"
                  >
                    查看回放
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 路由说明面板 -->
    <el-card class="route-info-card">
      <template #header>
        <span>当前路由映射（PRD §17 对齐验证）</span>
      </template>
      <el-table :data="routeMapping" size="small" border>
        <el-table-column prop="route" label="路由" width="280" />
        <el-table-column prop="fn" label="FN" width="200" />
        <el-table-column prop="terminal" label="终端" width="120" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();

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

/** 路由映射说明（PRD §17 严格对齐） */
const routeMapping = ref([
  { route: '/admin/tenant', fn: 'FN-AUDIT-PC-001', terminal: 'PC-运营后台', desc: '租户管理列表 →「内容审查开关」→ 二次确认弹窗（PRD §17 行1）' },
  { route: '/tenant/dashboard', fn: '—（仿真入口）', terminal: 'PC-租户后台', desc: '仿真：模拟直播列表 →「更多」菜单 +「中控台」按钮' },
  { route: '/tenant/live-control?tab=audit', fn: 'FN-AUDIT-PC-002/003', terminal: 'PC-租户后台', desc: '直播中控台 →「内容审查」Tab → 侧滑面板（PRD §17 行3）' },
  { route: '/tenant/live/:streamId/violations', fn: 'FN-AUDIT-PC-002/003', terminal: 'PC-租户后台', desc: '历史违规列表面板 + 处置操作 + 擦音模式（PRD §17 行2+行5）' },
  { route: '/tenant/live/:streamId/replay', fn: 'FN-AUDIT-PC-004', terminal: 'PC-租户后台', desc: '回放详情页 → 擦音处理（PRD §17 行4）' },
  { route: '/h5/live/:roomId', fn: 'FN-AUDIT-APP-001', terminal: 'H5-观众端', desc: '观众直播间 → 审查效果覆盖层（PRD §17 行6）' },
]);

/** 跳转到直播中控 →「内容审查」Tab */
function goLiveControl(id: string) {
  router.push(`/tenant/live-control?tab=audit&streamId=${id}`);
}

/** 跳转到历史违规列表 */
function goViolations(id: string) {
  router.push(`/tenant/live/${id}/violations`);
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

.dashboard-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-info-card {
  opacity: 0.85;
}
</style>
