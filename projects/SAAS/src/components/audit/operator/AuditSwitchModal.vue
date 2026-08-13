<template>
  <!-- M-AUDIT-001：内容审查开关弹窗（UC-AUDIT-001 step3-5） -->
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal">
        <div class="modal-header">
          <h3>内容审查开关配置</h3>
        </div>

        <div class="modal-body">
          <!-- 租户信息 -->
          <div class="tenant-info-grid">
            <div class="info-item">
              <span class="info-label">租户名称</span>
              <span class="info-value">{{ config?.tenant_name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">租户编号</span>
              <span class="info-value">{{ config?.tenant_id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">推流域名</span>
              <span class="info-value">{{ config?.stream_domain || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">今日违规数</span>
              <span class="info-value danger">{{ config?.today_violation_count ?? 0 }}</span>
            </div>
          </div>

          <div class="divider" />

          <!-- 开关操作区 -->
          <div class="toggle-section">
            <div class="toggle-row">
              <span class="toggle-label">内容审查</span>
              <el-switch
                :model-value="internalEnabled"
                size="large"
                @change="onToggleChange"
              />
              <span :class="['toggle-status', internalEnabled ? 'on' : 'off']">
                {{ internalEnabled ? '已开启' : '已关闭' }}
              </span>
            </div>
          </div>

          <div class="divider" />

          <!-- 5级联动影响说明 -->
          <div class="linkage-section" v-if="showLinkage">
            <p class="linkage-title">操作影响范围（5级联动）</p>
            <div class="linkage-chain">
              <!-- Level 1: 审查开关本身 -->
              <div class="chain-node root">
                <span class="chain-icon">①</span>
                <span class="chain-text">直播审查开关</span>
                <span :class="['chain-state', internalEnabled ? 'on' : 'off']">
                  {{ internalEnabled ? 'ON' : 'OFF' }}
                </span>
              </div>
              <div class="chain-arrow">→</div>
              <!-- Level 2: 直播中控Tab -->
              <div class="chain-node">
                <span class="chain-icon">②</span>
                <span class="chain-text">直播中控Tab</span>
                <span :class="['chain-state', internalEnabled ? 'on' : 'off']">
                  {{ internalEnabled ? '显示' : '隐藏' }}
                </span>
              </div>
              <div class="chain-arrow">→</div>
              <!-- Level 3: 直播列表入口 -->
              <div class="chain-node">
                <span class="chain-icon">③</span>
                <span class="chain-text">直播列表入口</span>
                <span :class="['chain-state', internalEnabled ? 'on' : 'off']">
                  {{ internalEnabled ? '可操作' : '不可操作' }}
                </span>
              </div>
              <div class="chain-arrow">→</div>
              <!-- Level 4: 回放擦音 -->
              <div class="chain-node">
                <span class="chain-icon">④</span>
                <span class="chain-text">回放擦音任务</span>
                <span :class="['chain-state', internalEnabled ? 'on' : 'off']">
                  {{ internalEnabled ? '自动创建' : '跳过' }}
                </span>
              </div>
              <div class="chain-arrow">→</div>
              <!-- Level 5: 观众端效果 -->
              <div class="chain-node leaf">
                <span class="chain-icon">⑤</span>
                <span class="chain-text">观众端效果</span>
                <span :class="['chain-state', internalEnabled ? 'on' : 'off']">
                  {{ internalEnabled ? '生效' : '不生效' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-default" @click="$emit('cancel')">取消</button>
          <button
            :class="['btn', hasChanged ? 'btn-primary' : 'btn-primary']"
            :disabled="!hasChanged"
            @click="handleConfirm"
          >
            确认{{ internalEnabled ? '开启' : '关闭' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { TenantAuditConfig } from '../../../contracts';

const props = defineProps<{
  visible: boolean;
  config: TenantAuditConfig | null;
}>();

const emit = defineEmits<{
  confirm: [enabled: boolean];
  cancel: [];
}>();

/** 弹窗内部的开关状态 */
const internalEnabled = ref(false);

/** 弹窗打开时，同步当前租户的开关状态 */
watch(() => props.visible, (visible) => {
  if (visible && props.config) {
    internalEnabled.value = props.config.audit_enabled;
  }
});

/** 开关是否发生变化 */
const hasChanged = computed(() => {
  return props.config ? internalEnabled.value !== props.config.audit_enabled : false;
});

/** 切换开关后才显示联动影响 */
const showLinkage = ref(false);

/** step4: 运营人员在弹窗内切换开关状态 */
function onToggleChange(val: boolean) {
  internalEnabled.value = val;
  showLinkage.value = true;
}

/** step5: 确认是否开启/关闭 */
function handleConfirm() {
  emit('confirm', internalEnabled.value);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.2s ease-out;
}
.modal {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 520px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
}
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #D9D9D9;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}
.modal-body {
  padding: 20px 24px;
}
.tenant-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-label {
  font-size: 12px;
  color: #8C8C8C;
}
.info-value {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}
.info-value.danger {
  color: #F5222D;
}
.divider {
  height: 1px;
  background: #F0F0F0;
  margin: 16px 0;
}
.toggle-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}
.toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.toggle-label {
  font-size: 15px;
  font-weight: 500;
  color: #262626;
  min-width: 80px;
  text-align: right;
}
.toggle-status {
  font-size: 14px;
  font-weight: 500;
  min-width: 56px;
}
.toggle-status.on {
  color: #52C41A;
}
.toggle-status.off {
  color: #FF4D4F;
}

/* 5级联动 */
.linkage-section {
  background: #FAFAFA;
  border: 1px solid #F0F0F0;
  border-radius: 6px;
  padding: 14px 16px;
  margin-top: 4px;
}
.linkage-title {
  font-size: 13px;
  color: #8C8C8C;
  margin: 0 0 12px;
}
.linkage-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
}
.chain-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 4px;
  white-space: nowrap;
}
.chain-node.root {
  border-color: #1890FF;
}
.chain-node.leaf {
  border-color: #722ED1;
}
.chain-icon {
  font-size: 11px;
  font-weight: 600;
  color: #8C8C8C;
}
.chain-text {
  font-size: 12px;
  color: #595959;
}
.chain-state {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 2px;
}
.chain-state.on {
  color: #52C41A;
  background: #F6FFED;
}
.chain-state.off {
  color: #BFBFBF;
  background: #FAFAFA;
}
.chain-arrow {
  font-size: 12px;
  color: #D9D9D9;
  margin: 0 2px;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 24px 16px;
  border-top: 1px solid #F0F0F0;
}
.btn {
  padding: 6px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #D9D9D9;
  transition: all 0.2s;
}
.btn-default {
  background: #fff;
  color: #262626;
}
.btn-default:hover {
  border-color: #1890FF;
  color: #1890FF;
}
.btn-primary {
  background: #1890FF;
  color: #fff;
  border-color: #1890FF;
}
.btn-primary:hover {
  background: #40A9FF;
}
.btn-primary:disabled {
  background: #D9D9D9;
  border-color: #D9D9D9;
  color: #fff;
  cursor: not-allowed;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
