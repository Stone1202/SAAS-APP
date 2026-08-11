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
            <!-- ────── 头部：名字 + 优先级 + 功能分类 ────── -->
            <div class="uc-card-header">
              <div class="uc-card-title-row">
                <span class="uc-priority" :class="priorityClass(card.priority)">
                  {{ priorityLabel(card.priority) }}
                </span>
                <span class="uc-feature-badge" v-if="featureLabel(card.feature)">
                  {{ featureLabel(card.feature) }}
                </span>
              </div>
              <h4 class="uc-card-name">{{ card.ucName }}</h4>
            </div>

            <!-- ═══════════════════════════════════════════ -->
            <!-- 第一层：产品视图（所有人必读）              -->
            <!-- ═══════════════════════════════════════════ -->
            <div class="uc-layer uc-layer--product">

              <!-- 用户故事 -->
              <div v-if="card.userStory" class="uc-user-story">
                <div class="uc-section-label">📖 用户故事</div>
                <p>{{ card.userStory }}</p>
              </div>

              <!-- 使用场景 -->
              <div v-if="card.scenario" class="uc-scenario">
                <div class="uc-section-label">🎬 使用场景</div>
                <p>{{ card.scenario }}</p>
              </div>

              <!-- 特别说明（P0醒目展示） -->
              <div v-if="card.specialNotes && card.specialNotes.length" class="uc-special-notes">
                <div class="uc-section-label">⚠ 特别说明</div>
                <ul>
                  <li v-for="(note, i) in card.specialNotes" :key="i">{{ note }}</li>
                </ul>
              </div>

              <!-- 页面截图 -->
              <div v-if="card.screenshot" class="uc-screenshot">
                <div class="uc-section-label">📱 页面示意</div>
                <img :src="card.screenshot" alt="页面截图" class="uc-screenshot-img" />
              </div>

              <!-- 操作流程（PM语言，自然中文） -->
              <div v-if="(card.userFlow && card.userFlow.length) || (card.basicFlow && card.basicFlow.length)" class="uc-user-flow">
                <div class="uc-section-label">📋 操作流程</div>
                <ol class="uc-flow-steps">
                  <li v-for="(step, i) in (card.userFlow || card.basicFlow || [])" :key="i">{{ step }}</li>
                </ol>
              </div>

              <!-- 验收标准 -->
              <div v-if="card.acceptanceCriteria && card.acceptanceCriteria.length" class="uc-acceptance">
                <div class="uc-section-label">✅ 验收标准</div>
                <div class="uc-ac-list">
                  <div
                    v-for="(ac, i) in card.acceptanceCriteria"
                    :key="i"
                    class="uc-ac-item"
                    :class="{
                      'ac-core': ac.startsWith('【核心】'),
                      'ac-edge': ac.startsWith('【边界】'),
                    }"
                  >
                    <span class="ac-check">☐</span>
                    <span>{{ ac }}</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- ═══════════════════════════════════════════ -->
            <!-- 第二层：业务规则与数据关系（可折叠）       -->
            <!-- ═══════════════════════════════════════════ -->
            <el-collapse v-if="hasLayer2(card)" class="uc-collapse-layer2" v-model="layer2Active">
              <el-collapse-item name="layer2">
                <template #title>
                  <span class="collapse-title">业务规则与数据关系</span>
                </template>

                <!-- 前置 / 后置条件 -->
                <div v-if="card.precondition || card.postcondition" class="uc-conditions">
                  <div v-if="card.precondition" class="uc-cond-item">
                    <span class="uc-cond-label">前置条件：</span>
                    <span>{{ card.precondition }}</span>
                  </div>
                  <div v-if="card.postcondition" class="uc-cond-item">
                    <span class="uc-cond-label">后置条件：</span>
                    <span>{{ card.postcondition }}</span>
                  </div>
                </div>

                <!-- 关联业务规则 -->
                <div v-if="card.businessRules && card.businessRules.length" class="uc-tag-section">
                  <h5>关联业务规则</h5>
                  <div class="uc-tag-list">
                    <span v-for="br in card.businessRules" :key="resolveRef(br).code" class="uc-tag uc-tag--br" :title="resolveRef(br).code">
                      {{ resolveRef(br).name }}
                      <small class="tag-code">({{ resolveRef(br).code }})</small>
                    </span>
                  </div>
                </div>

                <!-- 涉及数据实体 -->
                <div v-if="card.dataEntities && card.dataEntities.length" class="uc-tag-section">
                  <h5>涉及数据实体</h5>
                  <div class="uc-tag-list">
                    <span v-for="ent in card.dataEntities" :key="resolveRef(ent).code" class="uc-tag uc-tag--ent" :title="resolveRef(ent).code">
                      {{ resolveRef(ent).name }}
                      <small class="tag-code">({{ resolveRef(ent).code }})</small>
                    </span>
                  </div>
                </div>

                <!-- 关联页面 -->
                <div v-if="card.relatedPages && card.relatedPages.length" class="uc-tag-section">
                  <h5>关联页面</h5>
                  <div class="uc-tag-list">
                    <span v-for="pg in card.relatedPages" :key="resolveRef(pg).code" class="uc-tag uc-tag--pg" :title="resolveRef(pg).code">
                      {{ resolveRef(pg).name }}
                      <small class="tag-code">({{ resolveRef(pg).code }})</small>
                    </span>
                  </div>
                </div>

                <!-- 入口路径 -->
                <div v-if="card.entryPaths && card.entryPaths.length" class="uc-entry-paths">
                  <h5>入口路径</h5>
                  <div class="uc-entry-list">
                    <div v-for="(ep, i) in card.entryPaths" :key="i" class="uc-entry-item">
                      <span class="uc-entry-idx">{{ ep.no }}</span>
                      <span class="uc-entry-way">{{ ep.entry }}</span>
                      <span class="uc-entry-from">{{ resolvePgName(ep.fromPage) }}</span>
                      <span class="uc-entry-trigger">{{ ep.trigger }}</span>
                    </div>
                  </div>
                </div>

              </el-collapse-item>
            </el-collapse>

            <!-- ═══════════════════════════════════════════ -->
            <!-- 第三层：研发技术信息（默认折叠）           -->
            <!-- ═══════════════════════════════════════════ -->
            <el-collapse class="uc-collapse-layer3" v-model="layer3Active">
              <el-collapse-item name="layer3">
                <template #title>
                  <span class="collapse-title">研发技术信息</span>
                </template>

                <!-- 路由 + 组件 + 终端 -->
                <div v-if="card.route || card.component || card.terminal" class="uc-tech-meta">
                  <div v-if="card.terminal" class="uc-tech-item">
                    <span class="uc-tech-label">终端：</span>
                    <span>{{ card.terminal }}</span>
                  </div>
                  <div v-if="card.route" class="uc-tech-item">
                    <span class="uc-tech-label">页面路径：</span>
                    <code>{{ card.route }}</code>
                  </div>
                  <div v-if="card.component" class="uc-tech-item">
                    <span class="uc-tech-label">代码组件：</span>
                    <code>{{ card.component }}</code>
                  </div>
                </div>

                <!-- 编号信息 -->
                <div v-if="card.fnId || card.pgId || card.ucId" class="uc-id-block">
                  <div v-if="card.fnId" class="uc-id-item">
                    <span class="uc-id-label">功能编号：</span>
                    <code>{{ card.fnId }}</code>
                  </div>
                  <div v-if="card.pgId" class="uc-id-item">
                    <span class="uc-id-label">页面编号：</span>
                    <code>{{ card.pgId }}</code>
                  </div>
                  <div v-if="card.ucId" class="uc-id-item">
                    <span class="uc-id-label">用例编号：</span>
                    <code>{{ card.ucId }}</code>
                  </div>
                </div>

                <!-- 所属系统 / 模块 / 页面 / 参与人 -->
                <div v-if="card.system || card.module || card.page || card.participants" class="uc-tech-meta">
                  <div v-if="card.system" class="uc-tech-item">
                    <span class="uc-tech-label">所属系统：</span>
                    <span>{{ card.system }}</span>
                  </div>
                  <div v-if="card.module" class="uc-tech-item">
                    <span class="uc-tech-label">所属模块：</span>
                    <span>{{ card.module }}</span>
                  </div>
                  <div v-if="card.page" class="uc-tech-item">
                    <span class="uc-tech-label">所属页面：</span>
                    <span>{{ card.page }}</span>
                  </div>
                  <div v-if="card.participants" class="uc-tech-item">
                    <span class="uc-tech-label">使用者：</span>
                    <span>{{ card.participants }}</span>
                  </div>
                </div>

                <!-- 影响数据 -->
                <div v-if="card.affectedData" class="uc-tech-item">
                  <span class="uc-tech-label">影响数据：</span>
                  <code>{{ card.affectedData }}</code>
                </div>

                <!-- 接口标注 -->
                <div v-if="card.apiCalls && card.apiCalls.length" class="uc-api-table">
                  <h5>接口标注</h5>
                  <table class="uc-mini-table">
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

                <!-- 状态机关联 -->
                <div v-if="card.stateMachine" class="uc-state-machine">
                  <h5>状态机关联</h5>
                  <div class="uc-sm-grid">
                    <span><strong>实体：</strong>{{ card.stateMachine.entity }}</span>
                    <span><strong>状态：</strong>{{ card.stateMachine.states }}</span>
                    <span><strong>处理：</strong>{{ card.stateMachine.currentHandling }}</span>
                  </div>
                </div>

                <!-- 元素级帮助 -->
                <div v-if="card.elementHelps && card.elementHelps.length" class="uc-element-helps">
                  <h5>元素级帮助（{{ card.elementHelps.length }}）</h5>
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
                      >定位</button>
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

                <!-- 文档锚点 -->
                <div v-if="card.prdAnchor || card.designDocAnchor" class="uc-doc-anchors">
                  <h5>文档锚点</h5>
                  <div v-if="card.prdAnchor"><span class="uc-anchor-label">PRD：</span><code>{{ card.prdAnchor }}</code></div>
                  <div v-if="card.designDocAnchor"><span class="uc-anchor-label">设计文档：</span><code>{{ card.designDocAnchor }}</code></div>
                </div>

                <!-- 高保真原型 -->
                <div v-if="card.hifiPrototypeUrl" class="uc-hifi-link-wrap">
                  <h5>高保真原型</h5>
                  <a :href="card.hifiPrototypeUrl" target="_blank" class="uc-hifi-link">{{ card.hifiPrototypeUrl }}</a>
                </div>

                <!-- 描述（兜底显示） -->
                <div v-if="card.description" class="uc-description-wrap">
                  <h5>补充说明</h5>
                  <p>{{ card.description }}</p>
                </div>

              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch, nextTick, ref } from 'vue';

// ============ 类型定义 ============
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

/** 结构化引用（业务规则/数据实体/关联页面统一用此结构） */
export interface StructuredRef {
  code: string;  // 编号（如 BR-SHP-005）
  name: string;  // 中文名（如 "Banner 自动轮播 + 手动滑动 + 点击跳转"）
}

export interface UseCaseCard {
  ucId: string;
  ucName: string;
  description?: string;
  userStory?: string;
  priority: string;
  fnId: string;
  pgId?: string;
  feature?: string;
  featureLabel?: string;   // ★中文功能域名（HOME→首页, MALL→商城...）
  tabId?: string;
  status?: string;
  system?: string;
  module?: string;
  page?: string;
  participants?: string;
  affectedData?: string;
  precondition?: string;
  basicFlow?: string[];
  userFlow?: string[];      // ★PM语言操作流程（自然中文，零技术术语）
  altFlow?: string[];
  postcondition?: string;
  scenario?: string;         // ★使用场景叙述（PM语言，自然场景描述）
  specialNotes?: string[];
  screenshot?: string;       // ★页面截图路径
  elementHelps?: ElementHelp[];
  route?: string;
  component?: string;
  terminal?: string;
  entryPaths?: EntryPath[];
  apiCalls?: ApiCall[];
  stateMachine?: StateMachineRef;
  /** 关联业务规则（编号+中文名，兼容旧 string 格式） */
  businessRules?: (StructuredRef | string)[];
  /** 涉及数据实体（编号+中文名，兼容旧 string 格式） */
  dataEntities?: (StructuredRef | string)[];
  /** 关联页面（编号+中文名，兼容旧 string 格式） */
  relatedPages?: (StructuredRef | string)[];
  hifiPrototypeUrl?: string;
  /** 验收标准条目（【核心】/【边界】前缀分级） */
  acceptanceCriteria?: string[];
  designDocAnchor?: string;
  prdAnchor?: string;
}

// ============ Props / Emits ============
const props = withDefaults(defineProps<{
  visible?: boolean;
  title: string;
  cards: UseCaseCard[];
  highlightElementId?: string;
}>(), {
  visible: false,
});

const emit = defineEmits<{ close: []; locate: [elementId: string] }>();

// ============ 折叠状态 ============
const layer2Active = ref<string[]>([]);  // 默认折叠
const layer3Active = ref<string[]>([]);  // 默认折叠

// ============ 高亮闪动 ============
const flashId = ref('');

watch(() => props.highlightElementId, async (id) => {
  if (!id) return;
  flashId.value = id;
  await nextTick();
  const el = document.querySelector(`[data-element-help="${id}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  setTimeout(() => { flashId.value = ''; }, 3200);
}, { immediate: true });

// ============ 辅助函数 ============

/** 优先级中文标签 */
function priorityLabel(priority: string) {
  const p = (priority || '').toLowerCase();
  if (p.includes('p0')) return 'P0 · 核心';
  if (p.includes('p1')) return 'P1 · 重要';
  if (p.includes('p2')) return 'P2 · 一般';
  return priority;
}

/** 优先级样式类 */
function priorityClass(priority: string) {
  const p = (priority || '').toLowerCase();
  if (p.includes('p0') || p.includes('高')) return 'p0';
  if (p.includes('p1') || p.includes('中')) return 'p1';
  return 'p2';
}

/** 功能域中文映射 */
const FEATURE_CN: Record<string, string> = {
  'HOME':        '首页',
  'MALL':        '商城',
  'SEARCH':      '搜索',
  'PRODUCT':     '商品',
  'LIVE':        '直播',
  'STORE':       '门店',
  'MEMBER':      '会员',
  'MINE':        '个人中心',
  'RECOMMEND':   '推荐管理',
  'OPS-CONFIG':  '运营配置',
  'TENANT':      '租户管理',
  'PLACEHOLDER': '占位',
};

function featureLabel(feature?: string): string {
  if (!feature) return '';
  // 优先用 card.featureLabel，其次用映射表
  return FEATURE_CN[feature] || feature;
}

/** 解析结构化引用（兼容旧 string[] 格式） */
function resolveRef(ref: StructuredRef | string): StructuredRef {
  if (typeof ref === 'string') {
    // 尝试解析 "CODE: Name" 格式
    const m = ref.match(/^([\w-]+):\s*(.+)/);
    if (m) return { code: m[1], name: m[2] };
    return { code: ref, name: ref };
  }
  return ref;
}

/** 页面编号→中文名映射 */
const PG_NAMES: Record<string, string> = {
  'PG-SHP-APP-001': '平台首页',
  'PG-SHP-APP-002': '商城页',
  'PG-SHP-APP-003': '娱乐页',
  'PG-SHP-APP-004': '消息页',
  'PG-SHP-APP-005': '个人中心',
  'PG-SHP-APP-005A': '收货地址管理',
  'PG-SHP-APP-006': '平台会员中心',
  'PG-SHP-APP-007': '搜索页',
  'PG-SHP-APP-008': '搜索结果页',
  'PG-SHP-APP-009': '项目首页',
  'PG-SHP-APP-009A': '项目商城页',
  'PG-SHP-APP-010': '项目门店页',
  'PG-SHP-APP-011': '门店详情页',
  'PG-SHP-APP-011A': '门店商品/直播列表',
  'PG-SHP-APP-012': '商品详情页',
  'PG-SHP-APP-012A': '更多商品分类页',
  'PG-SHP-APP-013': '项目会员页',
  'PG-SHP-APP-014': '直播详情页',
  'PG-OPS-PC-001': '搜索管理',
  'PG-OPS-PC-002': '广告位管理',
  'PG-OPS-PC-003': '金刚区管理',
  'PG-OPS-PC-004': '直播推荐管理',
  'PG-OPS-PC-005': '商品推荐管理',
  'PG-OPS-PC-006': '项目列表',
  'PG-OPS-PC-007': '商城管理',
  'PG-OPS-PC-008': '规则引擎管理',
  'PG-OPS-PC-009': '功能页面管理',
  'PG-TNT-PC-001': '项目管理',
  'PG-TNT-PC-002': '门店管理',
  'PG-TNT-PC-004': '营销分类',
  'PG-TNT-PC-005': '项目信息管理',
  'PG-TNT-PC-006': 'Banner管理',
  'PG-TNT-PC-007': '金刚区管理',
  '—': '—',
};

function resolvePgName(pgId: string): string {
  return PG_NAMES[pgId] || pgId;
}

/** 判断是否有第二层内容 */
function hasLayer2(card: UseCaseCard): boolean {
  return !!(
    card.precondition || card.postcondition ||
    (card.businessRules && card.businessRules.length) ||
    (card.dataEntities && card.dataEntities.length) ||
    (card.relatedPages && card.relatedPages.length) ||
    (card.entryPaths && card.entryPaths.length)
  );
}
</script>

<style scoped>
/* ============ 基础布局 ============ */
.use-case-drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
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
  width: 540px;
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
  flex-shrink: 0;
}
.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}
.drawer-close {
  width: 28px; height: 28px;
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

/* ============ 卡片容器 ============ */
.uc-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* ============ 头部 ============ */
.uc-card-header {
  margin-bottom: 14px;
}
.uc-card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.uc-card-name {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}
.uc-priority {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}
.uc-priority.p0 {
  background: #fee2e2; color: #b91c1c;
}
.uc-priority.p1 {
  background: #fef3c7; color: #92400e;
}
.uc-priority.p2 {
  background: #e5e7eb; color: #374151;
}
.uc-feature-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 8px;
  background: #eef2ff;
  color: #4f46e5;
}

/* ============ 第一层：产品视图 ============ */
.uc-layer--product {
  margin-bottom: 4px;
}

.uc-section-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

/* 用户故事 */
.uc-user-story {
  padding: 10px 14px;
  background: #fefce8;
  border-left: 4px solid #facc15;
  border-radius: 0 8px 8px 0;
  margin-bottom: 12px;
}
.uc-user-story p {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
}

/* 使用场景 */
.uc-scenario {
  padding: 10px 14px;
  background: #f0f9ff;
  border-left: 4px solid #38bdf8;
  border-radius: 0 8px 8px 0;
  margin-bottom: 12px;
}
.uc-scenario p {
  font-size: 13px;
  color: #334155;
  line-height: 1.7;
  margin: 0;
}

/* 特别说明 */
.uc-special-notes {
  padding: 10px 14px;
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 0 8px 8px 0;
  margin-bottom: 12px;
}
.uc-special-notes ul {
  margin: 0;
  padding-left: 16px;
  font-size: 13px;
  color: #92400e;
  line-height: 1.7;
}
.uc-special-notes li {
  margin-bottom: 4px;
}

/* 截图 */
.uc-screenshot {
  margin-bottom: 12px;
}
.uc-screenshot-img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  object-fit: contain;
  max-height: 300px;
}

/* 操作流程 */
.uc-user-flow {
  margin-bottom: 12px;
}
.uc-flow-steps {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #374151;
  line-height: 1.8;
}
.uc-flow-steps li {
  margin-bottom: 3px;
}

/* 验收标准 */
.uc-acceptance {
  margin-bottom: 8px;
}
.uc-ac-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.uc-ac-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  padding: 4px 8px;
  border-radius: 6px;
}
.uc-ac-item.ac-core {
  background: #f0fdf4;
}
.uc-ac-item.ac-edge {
  background: #f8fafc;
  color: #64748b;
}
.ac-check {
  color: #9ca3af;
  flex-shrink: 0;
}

/* ============ 折叠面板 ============ */
.uc-collapse-layer2,
.uc-collapse-layer3 {
  margin-top: 8px;
  border: none;
}
.uc-collapse-layer2 :deep(.el-collapse-item__header),
.uc-collapse-layer3 :deep(.el-collapse-item__header) {
  height: 36px;
  line-height: 36px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}
.uc-collapse-layer2 :deep(.el-collapse-item__wrap),
.uc-collapse-layer3 :deep(.el-collapse-item__wrap) {
  border: none;
  background: transparent;
}
.uc-collapse-layer2 :deep(.el-collapse-item__content),
.uc-collapse-layer3 :deep(.el-collapse-item__content) {
  padding: 12px 4px 4px;
}
.collapse-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 第二层：业务规则内部 */
.uc-conditions {
  margin-bottom: 12px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
}
.uc-cond-item {
  margin-bottom: 4px;
}
.uc-cond-label {
  font-weight: 600;
  color: #1f2937;
}

.uc-tag-section {
  margin-bottom: 12px;
}
.uc-tag-section h5 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 6px;
}
.uc-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.uc-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
.uc-tag--br {
  background: #fef2f2; color: #b91c1c;
}
.uc-tag--ent {
  background: #f0fdf4; color: #15803d;
}
.uc-tag--pg {
  background: #eff6ff; color: #1d4ed8;
}
.tag-code {
  font-size: 10px;
  opacity: 0.6;
  font-family: monospace;
}

/* 入口路径 */
.uc-entry-paths {
  margin-bottom: 12px;
}
.uc-entry-paths h5 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 6px;
}
.uc-entry-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.uc-entry-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  padding: 5px 8px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.uc-entry-idx {
  font-weight: 700;
  color: #667eea;
  min-width: 16px;
  text-align: center;
}
.uc-entry-way {
  font-weight: 500;
  color: #1f2937;
  min-width: 80px;
}
.uc-entry-from {
  color: #6b7280;
  font-size: 11px;
}
.uc-entry-trigger {
  color: #9ca3af;
  font-size: 11px;
  margin-left: auto;
}

/* 第三层：研发信息 */
.uc-tech-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}
.uc-tech-item {
  font-size: 12px;
  color: #475569;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.uc-tech-label {
  color: #94a3b8;
  flex-shrink: 0;
  min-width: 72px;
}
.uc-tech-item code {
  font-size: 12px;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  color: #334155;
}

.uc-id-block {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
  padding: 8px 10px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.uc-id-item {
  font-size: 11px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.uc-id-label {
  color: #94a3b8;
}
.uc-id-item code {
  font-size: 11px;
  background: #eef2ff;
  padding: 1px 5px;
  border-radius: 3px;
  color: #4f46e5;
}

/* 接口表格 */
.uc-api-table {
  margin-bottom: 12px;
}
.uc-api-table h5 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 6px;
}
.uc-mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.uc-mini-table th,
.uc-mini-table td {
  border: 1px solid #e5e7eb;
  padding: 5px 8px;
  text-align: left;
  color: #4b5563;
}
.uc-mini-table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #334155;
}
.uc-mini-table td.code {
  font-family: monospace;
  color: #475569;
}

/* 状态机 */
.uc-state-machine {
  margin-bottom: 12px;
}
.uc-state-machine h5 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 6px;
}
.uc-sm-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 6px;
  font-size: 12px;
  color: #4b5563;
}
.uc-sm-grid strong {
  color: #92400e;
}

/* 文档锚点 */
.uc-doc-anchors {
  margin-bottom: 10px;
  font-size: 12px;
  color: #4b5563;
}
.uc-doc-anchors h5 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 4px;
}
.uc-anchor-label {
  color: #64748b;
  font-weight: 500;
}
.uc-doc-anchors code {
  font-size: 11px;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
}

/* 高保真 */
.uc-hifi-link-wrap {
  margin-bottom: 10px;
}
.uc-hifi-link-wrap h5 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 4px;
}
.uc-hifi-link {
  display: inline-block;
  font-size: 12px;
  color: #2563eb;
  word-break: break-all;
  text-decoration: underline;
}

/* 补充说明 */
.uc-description-wrap {
  margin-bottom: 10px;
}
.uc-description-wrap h5 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 4px;
}
.uc-description-wrap p {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

/* 元素帮助 */
.uc-element-helps h5 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 6px;
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
  width: 18px; height: 18px;
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

/* ============ 动画 ============ */
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
