<template>
  <!-- B-AUDIT-005：处置按钮栏（BR-AUDIT-003 处置渐进式规则驱动） -->
  <div class="disposal-bar">
    <!-- 记录按钮 — 所有级别可用 -->
    <div class="btn-wrapper">
      <button class="disposal-btn record" @click="$emit('record')" :disabled="!canAct" title="记录违规">
        记录
      </button>
      <HelpIcon
        v-if="onHelpClick"
        @click="onHelpClick('E-AUDIT-002-06-01')"
        title="查看「记录」按钮用例说明"
      />
    </div>
    <!-- 断流按钮 -->
    <div class="btn-wrapper" v-if="canAct && canSever">
      <button class="disposal-btn sever" @click="$emit('sever')" title="断流直播">
        断流
      </button>
      <HelpIcon
        v-if="onHelpClick"
        @click="onHelpClick('E-AUDIT-002-06-02')"
        title="查看「断流」按钮用例说明"
      />
    </div>
    <div class="btn-wrapper" v-else-if="!canAct">
      <!-- 未选中违规 → 所有按钮禁用，通用提示 -->
      <button class="disposal-btn sever" disabled title="请先选择一条违规记录">
        断流
      </button>
      <HelpIcon
        v-if="onHelpClick"
        @click="onHelpClick('E-AUDIT-002-06-02')"
        title="查看「断流」按钮用例说明"
      />
    </div>
    <div class="btn-wrapper" v-else>
      <!-- 已选中但该级别不可断流（L4） -->
      <button class="disposal-btn sever" disabled title="该级别（L4）仅可记录，不可断流">
        断流
      </button>
      <span class="tooltip">L4仅可记录</span>
      <HelpIcon
        v-if="onHelpClick"
        @click="onHelpClick('E-AUDIT-002-06-02')"
        title="查看「断流」按钮用例说明"
      />
    </div>
    <!-- 忽略按钮 -->
    <div class="btn-wrapper" v-if="canAct && canIgnore">
      <button class="disposal-btn ignore" @click="$emit('ignore')" title="忽略该违规">
        忽略
      </button>
      <HelpIcon
        v-if="onHelpClick"
        @click="onHelpClick('E-AUDIT-002-06-03')"
        title="查看「忽略」按钮用例说明"
      />
    </div>
    <div class="btn-wrapper" v-else-if="!canAct">
      <!-- 未选中违规 → 所有按钮禁用，通用提示 -->
      <button class="disposal-btn ignore" disabled title="请先选择一条违规记录">
        忽略
      </button>
      <HelpIcon
        v-if="onHelpClick"
        @click="onHelpClick('E-AUDIT-002-06-03')"
        title="查看「忽略」按钮用例说明"
      />
    </div>
    <div class="btn-wrapper" v-else>
      <!-- 已选中但该级别不可忽略（L1） -->
      <button class="disposal-btn ignore" disabled title="该级别（L1）为严重违规，不可忽略">
        忽略
      </button>
      <span class="tooltip">L1不可忽略</span>
      <HelpIcon
        v-if="onHelpClick"
        @click="onHelpClick('E-AUDIT-002-06-03')"
        title="查看「忽略」按钮用例说明"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * BR-AUDIT-003 处置渐进式规则：
 *   L4(蓝) → 仅可记录
 *   L3(黄) → 可记录、可忽略、可断流
 *   L2(橙) → 可记录、可忽略、可断流
 *   L1(红) → 可记录、可断流（不可忽略）
 *
 * Props:
 *   canAct    — 是否有选中违规
 *   canSever  — 是否可断流（false = L4级别）
 *   canIgnore — 是否可忽略（false = L1级别）
 */
defineProps<{
  canAct: boolean;
  canSever: boolean;
  canIgnore: boolean;
  onHelpClick?: (elementId: string) => void;
}>();

defineEmits<{
  record: [];
  sever: [];
  ignore: [];
}>();
</script>

<style scoped>
.disposal-bar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: var(--card-bg, #fff);
  border-top: 1px solid var(--color-border, #D9D9D9);
  justify-content: center;
}
.btn-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tooltip {
  position: absolute;
  bottom: -22px;
  white-space: nowrap;
  font-size: 11px;
  color: var(--color-text-secondary, #8C8C8C);
  background: var(--color-muted, #F5F5F5);
  padding: 1px 6px;
  border-radius: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}
.btn-wrapper:hover .tooltip { opacity: 1; }
.disposal-btn {
  padding: 6px 20px;
  border-radius: var(--radius-md, 4px);
  font-size: var(--font-body, 14px);
  border: 1px solid var(--color-border, #D9D9D9);
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  color: var(--color-text-primary, #262626);
}
.disposal-btn:hover:not(:disabled) { border-color: var(--color-primary, #1890FF); color: var(--color-primary, #1890FF); }
.disposal-btn:disabled {
  background: var(--color-muted, #F5F5F5);
  color: var(--color-text-secondary, #8C8C8C);
  cursor: not-allowed;
  border-color: var(--color-border, #D9D9D9);
}
.disposal-btn.sever:hover:not(:disabled) {
  border-color: var(--color-danger, #F5222D);
  color: var(--color-danger, #F5222D);
}
</style>
