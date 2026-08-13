<template>
  <div class="prototype-page">
    <!-- 顶部导航栏 -->
    <header class="proto-header">
      <div class="proto-brand">
        <span class="proto-logo">P</span>
        <div>
          <h1>SAAS-APP 原型查看工具</h1>
          <p class="proto-version">v3.1.39 · 独立访问地址 /prototype</p>
        </div>
      </div>
      <div class="proto-actions">
        <el-radio-group v-model="activeTerminal" size="small">
          <el-radio-button label="APP端" />
          <el-radio-button label="PC运营后台" />
          <el-radio-button label="PC租户后台" />
        </el-radio-group>
        <el-button
          v-if="selectedNode?.hifiUrl"
          type="primary"
          size="small"
          :icon="Link"
          @click="openHifi"
        >
          在新窗口查看高保真原型
        </el-button>
      </div>
    </header>

    <!-- 三栏主体 -->
    <div class="proto-body">
      <!-- 左侧功能树 -->
      <aside class="proto-sidebar">
        <div class="sidebar-title">功能树</div>
        <el-tree
          :data="filteredTree"
          :props="{ label: 'name', children: 'children' }"
          :highlight-current="true"
          :default-expand-all="true"
          node-key="id"
          @node-click="onNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-node" :class="{ deprecated: data.status === 'deprecated', modal: data.type === 'modal' }">
              <span class="tree-icon">{{ treeIcon(data) }}</span>
              <span class="tree-label" :title="data.id">{{ node.label }}</span>
              <span v-if="data.type === 'modal'" class="tree-badge">弹</span>
            </span>
          </template>
        </el-tree>
      </aside>

      <!-- 中间高保真预览 -->
      <main class="proto-preview">
        <div v-if="selectedNode?.hifiUrl" class="device-frame" :class="deviceClass">
          <div class="device-notch">
            <span>{{ selectedNode.name }}</span>
            <a :href="selectedNode.hifiUrl" target="_blank" class="device-open" title="新窗口打开">
              <el-icon><Link /></el-icon>
            </a>
          </div>
          <iframe
            ref="previewFrame"
            :src="selectedNode.hifiUrl"
            frameborder="0"
            class="device-screen"
          />
        </div>
        <div v-else class="preview-empty">
          <el-empty description="请在左侧选择页面预览高保真原型">
            <template #image>
              <div class="empty-icon">📱</div>
            </template>
          </el-empty>
          <p class="empty-tip">弹窗/deprecated 页面暂不支持独立预览</p>
        </div>
      </main>

      <!-- 右侧用例卡+资源面板 -->
      <aside class="proto-detail">
        <div class="detail-header">
          <div class="detail-title">需求流程 · 用例卡</div>
          <div v-if="selectedNode" class="detail-subtitle">{{ selectedNode.id }} {{ selectedNode.name }}</div>
        </div>

        <el-scrollbar class="detail-scroll">
          <!-- 页面信息卡片 -->
          <div v-if="selectedNode" class="detail-card">
            <h4>页面信息</h4>
            <div class="info-grid">
              <div><label>PG编号</label><code>{{ selectedNode.id }}</code></div>
              <div><label>FN编号</label><code>{{ selectedNode.fnId || '-' }}</code></div>
              <div><label>页面名称</label><span>{{ selectedNode.name }}</span></div>
              <div><label>终端</label><span>{{ selectedNode.terminal }}</span></div>
              <div><label>路由</label><code>{{ selectedNode.route || '-' }}</code></div>
              <div><label>组件</label><code>{{ selectedNode.component || '-' }}</code></div>
              <div v-if="selectedNode.note"><label>备注</label><span>{{ selectedNode.note }}</span></div>
            </div>
          </div>

          <!-- 文档链接 -->
          <div v-if="selectedNode?.docLinks?.length" class="detail-card">
            <h4>文档中心</h4>
            <ul class="doc-list">
              <li v-for="doc in selectedNode.docLinks" :key="doc.label">
                <span class="doc-type">{{ doc.docType.toUpperCase() }}</span>
                <a :href="doc.href" target="_blank" class="doc-link">{{ doc.label }}</a>
                <span v-if="doc.anchor" class="doc-anchor">#{{ doc.anchor }}</span>
              </li>
            </ul>
          </div>

          <!-- 业务规则 -->
          <div v-if="selectedNode?.brIds?.length" class="detail-card">
            <h4>业务规则</h4>
            <div class="tag-list">
              <el-tag v-for="br in selectedNode.brIds" :key="br" type="danger" size="small">{{ br }}</el-tag>
            </div>
          </div>

          <!-- 数据实体 -->
          <div v-if="selectedNode?.entIds?.length" class="detail-card">
            <h4>数据实体</h4>
            <div class="tag-list">
              <el-tag v-for="ent in selectedNode.entIds" :key="ent" type="success" size="small">{{ ent }}</el-tag>
            </div>
          </div>

          <!-- 流程图 -->
          <div v-if="selectedNode?.flowcharts?.length" class="detail-card">
            <h4>流程图</h4>
            <div v-for="(fc, idx) in selectedNode.flowcharts" :key="`fc-${idx}`" class="mermaid-wrap">
              <div v-html="renderedMermaid[`flow-${selectedNode.id}-${idx}`] || ''" />
            </div>
          </div>

          <!-- 状态机 -->
          <div v-if="selectedNode?.stateMachines?.length" class="detail-card">
            <h4>状态机</h4>
            <div v-for="(sm, idx) in selectedNode.stateMachines" :key="`sm-${idx}`" class="mermaid-wrap">
              <div v-html="renderedMermaid[`sm-${selectedNode.id}-${idx}`] || ''" />
            </div>
          </div>

          <!-- 用例卡列表 -->
          <div v-if="detailCards.length" class="detail-card uc-list-card">
            <h4>用例卡（{{ detailCards.length }}个）</h4>
            <div v-for="card in detailCards" :key="card.ucId" class="uc-mini-card">
              <div class="uc-mini-header">
                <span class="uc-id">{{ card.ucId }}</span>
                <span class="uc-priority" :class="`p-${card.priority.toLowerCase()}`">{{ card.priority }}</span>
              </div>
              <div class="uc-name">{{ card.ucName }}</div>
              <div class="uc-desc">{{ card.description }}</div>
              <div v-if="card.businessRules?.length" class="uc-mini-tags">
                <el-tag v-for="br in card.businessRules" :key="br" type="danger" size="small">{{ br }}</el-tag>
              </div>
              <div v-if="card.dataEntities?.length" class="uc-mini-tags">
                <el-tag v-for="ent in card.dataEntities" :key="ent" type="success" size="small">{{ ent }}</el-tag>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Link } from '@element-plus/icons-vue';
import { PROTOTYPE_MENU_TREE, findPrototypeNodeById, type PrototypeMenuNode, type TerminalType } from '@/data/prototype-menu';
import { useCasesByPgId } from '@/data/use-cases';
import type { UseCaseCard } from '@/components/use-case-card/UseCaseDrawer.vue';
import { usePrototypeMermaid } from '@/composables/usePrototypeMermaid';

const activeTerminal = ref<TerminalType>('APP端');
const selectedNodeId = ref<string>('');
const { rendered: renderedMermaid, renderAll } = usePrototypeMermaid();

const filteredTree = computed(() => {
  const root = PROTOTYPE_MENU_TREE.find(t => t.name === activeTerminal.value);
  return root ? [root] : [];
});

const selectedNode = computed<PrototypeMenuNode | undefined>(() =>
  selectedNodeId.value ? findPrototypeNodeById(selectedNodeId.value) : undefined
);

const detailCards = computed<UseCaseCard[]>(() => {
  const node = selectedNode.value;
  if (!node) return [];
  return (useCasesByPgId[node.id] || []).map(uc => ({
    ...uc,
    hifiPrototypeUrl: uc.hifiPrototypeUrl || node.hifiUrl || '',
    prdAnchor: uc.prdAnchor || '',
    designDocAnchor: uc.designDocAnchor || '',
  }));
});

const deviceClass = computed(() => {
  if (activeTerminal.value === 'APP端') return 'device-mobile';
  return 'device-pc';
});

function treeIcon(data: PrototypeMenuNode) {
  if (data.type === 'modal') return '📌';
  if (data.status === 'deprecated') return '🚫';
  if (data.terminal === 'APP端') return '📱';
  if (data.terminal === 'PC运营后台') return '🖥️';
  return '🏢';
}

function onNodeClick(data: PrototypeMenuNode) {
  if (!data.children?.length) {
    selectedNodeId.value = data.id;
  }
}

function openHifi() {
  if (selectedNode.value?.hifiUrl) {
    window.open(selectedNode.value.hifiUrl, '_blank');
  }
}

watch(
  () => selectedNode.value,
  async (node) => {
    if (!node) return;
    const sources: { key: string; code: string; type: 'flowchart' | 'stateDiagram' }[] = [];
    node.flowcharts?.forEach((code, idx) => sources.push({ key: `flow-${node.id}-${idx}`, code, type: 'flowchart' }));
    node.stateMachines?.forEach((code, idx) => sources.push({ key: `sm-${node.id}-${idx}`, code, type: 'stateDiagram' }));
    if (sources.length) await renderAll(sources);
  },
  { immediate: true }
);
</script>

<style scoped>
.prototype-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f3f4f6;
}

.proto-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.proto-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.proto-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}
.proto-brand h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}
.proto-version {
  margin: 0;
  font-size: 11px;
  opacity: 0.9;
}

.proto-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.proto-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧功能树 */
.proto-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-title {
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #f3f4f6;
}
.tree-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.tree-icon {
  font-size: 14px;
}
.tree-label {
  color: #374151;
}
.tree-node.modal .tree-label {
  color: #6b7280;
}
.tree-node.deprecated .tree-label {
  text-decoration: line-through;
  color: #9ca3af;
}
.tree-badge {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 4px;
  background: #e5e7eb;
  color: #6b7280;
}

/* 中间预览区 */
.proto-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: auto;
  background: #f3f4f6;
}

.device-frame {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.device-mobile {
  width: 414px;
  height: 800px;
  border: 8px solid #1f2937;
}
.device-pc {
  width: 960px;
  height: 720px;
  border: 8px solid #1f2937;
}
.device-notch {
  height: 32px;
  background: #1f2937;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font-size: 12px;
  flex-shrink: 0;
}
.device-open {
  color: #fff;
  opacity: 0.8;
  cursor: pointer;
}
.device-open:hover {
  opacity: 1;
}
.device-screen {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
}

.preview-empty {
  text-align: center;
}
.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
}
.empty-tip {
  color: #9ca3af;
  font-size: 13px;
  margin-top: 12px;
}

/* 右侧详情 */
.proto-detail {
  width: 380px;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.detail-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}
.detail-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.detail-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}
.detail-scroll {
  flex: 1;
  padding: 12px 16px 24px;
}
.detail-card {
  margin-bottom: 16px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
}
.detail-card h4 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}
.info-grid {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 8px 10px;
  font-size: 12px;
}
.info-grid label {
  color: #6b7280;
}
.info-grid code {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #374151;
  word-break: break-all;
}
.doc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.doc-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}
.doc-type {
  padding: 2px 6px;
  border-radius: 4px;
  background: #dbeafe;
  color: #1e40af;
  font-size: 10px;
  font-weight: 600;
}
.doc-link {
  color: #2563eb;
  text-decoration: none;
}
.doc-link:hover {
  text-decoration: underline;
}
.doc-anchor {
  color: #9ca3af;
  font-family: monospace;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mermaid-wrap {
  overflow-x: auto;
  margin-bottom: 10px;
}
.mermaid-wrap :deep(svg) {
  max-width: 100%;
}

.uc-mini-card {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 10px;
}
.uc-mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.uc-id {
  font-family: monospace;
  font-size: 11px;
  color: #6b7280;
}
.uc-priority {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.uc-priority.p-p0 { background: #fee2e2; color: #991b1b; }
.uc-priority.p-p1 { background: #ffedd5; color: #9a3412; }
.uc-priority.p-p2 { background: #fef9c3; color: #854d0e; }
.uc-priority.p-p3 { background: #f3f4f6; color: #374151; }
.uc-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
}
.uc-desc {
  font-size: 12px;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 8px;
}
.uc-mini-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

:deep(.el-tree-node__content) {
  height: 34px;
}
</style>
