<template>
  <transition name="drawer-slide">
    <div v-if="visible" class="use-case-drawer" @click.self="emit('close')" data-testid="use-case-drawer">
      <div class="drawer-mask" />
      <div class="drawer-panel">
        <div class="drawer-header">
          <h3 class="drawer-title">{{ title }}</h3>
          <button class="drawer-close" type="button" @click="emit('close')">✕</button>
        </div>

        <div class="drawer-body">
          <div
            v-for="(card, idx) in cards"
            :key="card.ucId || idx"
            class="uc-card"
            :data-testid="'uc-card'"
            :data-ucid="card.ucId"
          >
            <div class="uc-card-header">
              <div class="uc-card-title-row">
                <span class="uc-card-id">{{ card.ucId }}</span>
                <span class="uc-priority" :class="priorityClass(card.priority)">
                  {{ card.priority }}
                </span>
              </div>
              <h4 class="uc-card-name">{{ card.ucName }}</h4>
            </div>

            <!-- 元数据：系统/模块/页面/参与人/影响数据 -->
            <div class="uc-meta-grid">
              <div class="uc-meta-item" v-if="card.system">
                <span class="uc-meta-label">所属系统</span>
                <span class="uc-meta-value">{{ card.system }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.module">
                <span class="uc-meta-label">所属模块</span>
                <span class="uc-meta-value">{{ card.module }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.page">
                <span class="uc-meta-label">所属页面</span>
                <span class="uc-meta-value">{{ card.page }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.participants">
                <span class="uc-meta-label">参与人</span>
                <span class="uc-meta-value">{{ card.participants }}</span>
              </div>
              <div class="uc-meta-item full" v-if="card.affectedData">
                <span class="uc-meta-label">影响数据</span>
                <span class="uc-meta-value code">{{ card.affectedData }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.feature">
                <span class="uc-meta-label">功能域</span>
                <span class="uc-meta-value">{{ card.feature }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.fnId">
                <span class="uc-meta-label">功能编号</span>
                <span class="uc-meta-value code">{{ card.fnId }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.pgId">
                <span class="uc-meta-label">页面编号</span>
                <span class="uc-meta-value code">{{ card.pgId }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.terminal">
                <span class="uc-meta-label">终端</span>
                <span class="uc-meta-value">{{ card.terminal }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.route">
                <span class="uc-meta-label">页面路由</span>
                <span class="uc-meta-value code">{{ card.route }}</span>
              </div>
              <div class="uc-meta-item" v-if="card.component">
                <span class="uc-meta-label">组件名</span>
                <span class="uc-meta-value code">{{ card.component }}</span>
              </div>
            </div>

            <!-- v3.1.42: 用户故事展示 -->
            <p v-if="card.userStory" class="uc-user-story">
              <span class="uc-user-story-label">用户故事</span>
              {{ card.userStory }}
            </p>

            <p v-if="card.description" class="uc-description">
              {{ card.description }}
            </p>

            <div class="uc-card-section" v-if="card.precondition">
              <h4>前置条件</h4>
              <p>{{ card.precondition }}</p>
            </div>

            <div class="uc-card-section" v-if="card.basicFlow && card.basicFlow.length">
              <h4>基本流程</h4>
              <ol>
                <li v-for="(step, i) in card.basicFlow" :key="i">{{ step }}</li>
              </ol>
            </div>

            <div class="uc-card-section" v-if="card.altFlow && card.altFlow.length">
              <h4>备选流程</h4>
              <ul>
                <li v-for="(step, i) in card.altFlow" :key="i">{{ step }}</li>
              </ul>
            </div>

            <div class="uc-card-section" v-if="card.postcondition">
              <h4>后置条件</h4>
              <p>{{ card.postcondition }}</p>
            </div>

            <div class="uc-card-section" v-if="card.entryPaths && card.entryPaths.length">
              <h4>入口路径</h4>
              <table class="uc-entry-table">
                <thead>
                  <tr><th>#</th><th>入口</th><th>来源页面</th><th>触发操作</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(ep, i) in card.entryPaths" :key="i">
                    <td>{{ ep.no }}</td>
                    <td>{{ ep.entry }}</td>
                    <td>{{ ep.fromPage }}</td>
                    <td>{{ ep.trigger }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="uc-card-section" v-if="card.apiCalls && card.apiCalls.length">
              <h4>接口标注</h4>
              <table class="uc-entry-table">
                <thead>
                  <tr><th>步骤</th><th>接口</th><th>说明</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(ac, i) in card.apiCalls" :key="i">
                    <td>{{ ac.step }}</td>
                    <td class="code">{{ ac.api }}</td>
                    <td>{{ ac.desc }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="uc-card-section" v-if="card.stateMachine">
              <h4>状态机关联</h4>
              <div class="uc-state-machine">
                <span class="uc-sm-item"><strong>实体：</strong>{{ card.stateMachine.entity }}</span>
                <span class="uc-sm-item"><strong>状态：</strong>{{ card.stateMachine.states }}</span>
                <span class="uc-sm-item"><strong>当前处理：</strong>{{ card.stateMachine.currentHandling }}</span>
              </div>
            </div>

            <!-- v4 字段展示 -->
            <div class="uc-card-section" v-if="card.businessRules && card.businessRules.length">
              <h4>关联业务规则</h4>
              <div class="uc-tag-list">
                <span v-for="br in card.businessRules" :key="br" class="uc-tag uc-tag--br">{{ br }}</span>
              </div>
            </div>

            <div class="uc-card-section" v-if="card.dataEntities && card.dataEntities.length">
              <h4>涉及数据实体</h4>
              <div class="uc-tag-list">
                <span v-for="ent in card.dataEntities" :key="ent" class="uc-tag uc-tag--ent">{{ ent }}</span>
              </div>
            </div>

            <div class="uc-card-section" v-if="card.relatedPages && card.relatedPages.length">
              <h4>关联页面</h4>
              <div class="uc-tag-list">
                <span v-for="pg in card.relatedPages" :key="pg" class="uc-tag uc-tag--pg">{{ pg }}</span>
              </div>
            </div>

            <div class="uc-card-section" v-if="card.acceptanceCriteria && card.acceptanceCriteria.length">
              <h4>验收标准</h4>
              <ol>
                <li v-for="(ac, i) in card.acceptanceCriteria" :key="i">{{ ac }}</li>
              </ol>
            </div>

            <div class="uc-card-section uc-card-section--special" v-if="card.specialNotes && card.specialNotes.length">
              <h4>特别说明</h4>
              <ul>
                <li v-for="(note, i) in card.specialNotes" :key="i">{{ note }}</li>
              </ul>
            </div>

            <div class="uc-card-section" v-if="card.prdAnchor || card.designDocAnchor">
              <h4>文档锚点</h4>
              <div class="uc-anchor-list">
                <div v-if="card.prdAnchor" class="uc-anchor-item">
                  <span class="uc-anchor-label">PRD：</span>
                  <code>{{ card.prdAnchor }}</code>
                </div>
                <div v-if="card.designDocAnchor" class="uc-anchor-item">
                  <span class="uc-anchor-label">设计文档：</span>
                  <code>{{ card.designDocAnchor }}</code>
                </div>
              </div>
            </div>

            <div class="uc-card-section" v-if="card.hifiPrototypeUrl">
              <h4>高保真原型</h4>
              <a :href="card.hifiPrototypeUrl" target="_blank" class="uc-hifi-link">{{ card.hifiPrototypeUrl }}</a>
            </div>

            <div class="uc-card-section" v-if="card.elementHelps && card.elementHelps.length">
              <h4>
                元素级帮助
                <span class="element-help-count">（{{ card.elementHelps.length }}）</span>
              </h4>
              <div
                v-for="(eh, ei) in card.elementHelps"
                :key="ei"
                class="element-help-item"
                :data-element-help="eh.id"
                :class="{ flash: flashId === eh.id }"
              >
                <div class="element-help-target">
                  <span class="help-dot">?</span>
                  <strong>{{ eh.target }}</strong>
                  <button
                    v-if="eh.id"
                    class="locate-btn"
                    type="button"
                    @click="emit('locate', eh.id)"
                    title="定位到页面元素"
                  >
                    定位
                  </button>
                </div>
                <p>{{ eh.content }}</p>
                <div class="element-help-meta">
                  <span>关联：{{ eh.relatedUC }}</span>
                  <span v-if="eh.relatedBR">规则：{{ eh.relatedBR }}</span>
                  <span v-if="eh.participants">参与：{{ eh.participants }}</span>
                  <span v-if="eh.affectedData" class="code">数据：{{ eh.affectedData }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch, nextTick, ref } from 'vue';

export interface ElementHelp {
  id: string;
  target: string;
  content: string;
  relatedUC: string;
  relatedBR?: string;
  participants?: string;
  affectedData?: string;
}

export interface EntryPath {
  no: number;
  entry: string;
  fromPage: string;
  trigger: string;
}

export interface ApiCall {
  step: number;
  api: string;
  desc: string;
}

export interface StateMachineRef {
  entity: string;
  states: string;
  currentHandling: string;
}

export interface UseCaseCard {
  ucId: string;
  ucName: string;
  description?: string;
  userStory?: string;  // v3.1.42+: 用户故事文本（"作为...，我想...，以便..."）
  priority: string;
  fnId: string;
  pgId?: string;
  feature?: string;  // v3.1.40+: 功能域（HOME/MALL/SEARCH/PRODUCT/LIVE/STORE/MEMBER/MINE/RECOMMEND/OPS-CONFIG/TENANT/PLACEHOLDER），用于功能维度分组
  tabId?: string;   // v3.1.28+: Tab感知字段，匹配activeTab时展示（undefined=始终展示）
  status?: string;  // v3.1.28+: UC状态标记，planned=尚未开发（由index.ts过滤）
  system?: string;
  module?: string;
  page?: string;
  participants?: string;
  affectedData?: string;
  precondition?: string;
  basicFlow?: string[];
  altFlow?: string[];
  postcondition?: string;
  elementHelps?: ElementHelp[];
  // v3 研发友好字段（v3.1.28新增）
  route?: string;
  component?: string;
  terminal?: string;
  entryPaths?: EntryPath[];
  apiCalls?: ApiCall[];
  stateMachine?: StateMachineRef;
  // v4 字段（v3.1.39新增）：用于原型总览页和三方一致性校验
  businessRules?: string[];        // 关联业务规则编号 BR-XXX
  dataEntities?: string[];         // 涉及数据实体编号 ENT-XXX
  relatedPages?: string[];         // 关联页面 pgId 列表
  hifiPrototypeUrl?: string;       // 高保真原型完整 URL
  acceptanceCriteria?: string[];   // 验收标准条目
  designDocAnchor?: string;        // 设计文档锚点
  prdAnchor?: string;              // PRD 章节锚点
  // v3.1.45+: 特别说明（架构/缓存/状态同步等非功能需求备注）
  specialNotes?: string[];         // 特别说明条目
}

const props = defineProps<{
  visible: boolean;
  title: string;
  cards: UseCaseCard[];
  highlightElementId?: string;
}>();

const emit = defineEmits<{ close: []; locate: [elementId: string] }>();

const flashId = ref('');

watch(() => props.highlightElementId, async (id) => {
  if (!id) return;
  flashId.value = id;
  await nextTick();
  const el = document.querySelector(`[data-element-help="${id}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  setTimeout(() => {
    flashId.value = '';
  }, 3200);
}, { immediate: true });

function priorityClass(priority: string) {
  const p = (priority || '').toLowerCase();
  if (p.includes('p0') || p.includes('高')) return 'p0';
  if (p.includes('p1') || p.includes('中')) return 'p1';
  return 'p2';
}
</script>

<style scoped>
.use-case-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}
.drawer-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}
.drawer-panel {
  position: relative;
  width: 520px;
  max-width: 90vw;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}
.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}
.drawer-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}
.drawer-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 40px;
  background: #f3f4f6;
}
.uc-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.uc-card-header {
  margin-bottom: 12px;
}
.uc-card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.uc-card-id {
  font-family: monospace;
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}
.uc-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}
.uc-priority {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
}
.uc-priority.p0 {
  background: #fee2e2;
  color: #b91c1c;
}
.uc-priority.p1 {
  background: #fef3c7;
  color: #92400e;
}
.uc-priority.p2 {
  background: #e5e7eb;
  color: #374151;
}
.uc-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.uc-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.uc-meta-item.full {
  grid-column: 1 / -1;
}
.uc-meta-label {
  font-size: 11px;
  color: #94a3b8;
}
.uc-meta-value {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
}
.uc-meta-value.code {
  font-family: monospace;
  color: #475569;
  word-break: break-word;
}
.uc-description {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  margin: 0 0 12px;
  padding: 10px 12px;
  background: #f0f9ff;
  border-left: 3px solid #38bdf8;
  border-radius: 0 8px 8px 0;
}
/* v3.1.42: 用户故事样式 */
.uc-user-story {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin: 0 0 12px;
  padding: 10px 12px;
  background: #fefce8;
  border-left: 3px solid #facc15;
  border-radius: 0 8px 8px 0;
}
.uc-user-story-label {
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
  display: block;
  margin-bottom: 4px;
}
.uc-card-section {
  margin-top: 12px;
}
.uc-card-section h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.uc-card-section p {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}
.uc-card-section ol,
.uc-card-section ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
}
.uc-card-section li {
  margin-bottom: 4px;
}
.uc-card-section--special {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  border-radius: 0 6px 6px 0;
  padding: 10px 14px;
  margin-top: 16px;
}
.uc-card-section--special ul {
  margin: 0;
  padding-left: 16px;
}
.element-help-count {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
}
.element-help-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  scroll-margin-top: 100px;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.element-help-item.flash {
  animation: flash-pulse 1.6s ease-in-out 2;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.18);
}
@keyframes flash-pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.18); }
  50% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0.06); }
}
.element-help-target {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #1f2937;
}
.help-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.locate-btn {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #4f46e5;
  cursor: pointer;
}
.locate-btn:hover {
  background: #c7d2fe;
}
.element-help-item p {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
}
.element-help-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}
.element-help-meta .code {
  color: #64748b;
}

.uc-entry-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 4px;
}
.uc-entry-table th,
.uc-entry-table td {
  border: 1px solid #e5e7eb;
  padding: 6px 8px;
  text-align: left;
  color: #4b5563;
}
.uc-entry-table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #334155;
  font-size: 11px;
}
.uc-entry-table td.code {
  font-family: monospace;
  color: #475569;
  word-break: break-word;
}
.uc-state-machine {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 8px;
  font-size: 12px;
  color: #4b5563;
}
.uc-sm-item strong {
  color: #92400e;
  margin-right: 4px;
}

/* v4 字段样式 */
.uc-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.uc-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  font-family: monospace;
}
.uc-tag--br {
  background: #fef2f2;
  color: #b91c1c;
}
.uc-tag--ent {
  background: #f0fdf4;
  color: #15803d;
}
.uc-tag--pg {
  background: #eff6ff;
  color: #1d4ed8;
}
.uc-anchor-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #4b5563;
}
.uc-anchor-label {
  color: #64748b;
  font-weight: 500;
}
.uc-hifi-link {
  display: inline-block;
  font-size: 12px;
  color: #2563eb;
  word-break: break-all;
  text-decoration: underline;
}
.uc-hifi-link:hover {
  color: #1d4ed8;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.drawer-slide-enter-from .drawer-mask,
.drawer-slide-leave-to .drawer-mask {
  opacity: 0;
}
.drawer-mask {
  transition: opacity 0.25s ease;
}
</style>
