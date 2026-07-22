<template>
  <div class="keyword-library">
    <el-card shadow="never">
      <template #header>
        <span>敏感词库管理</span>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 平台不可降级词库 -->
        <el-tab-pane label="平台不可降级词库（6类）" name="non-degradable">
          <el-alert type="warning" :closable="false" style="margin-bottom: 16px;">
            ⚠ 以下6类为法律法规底线，租户绝对不可降级
          </el-alert>

          <div class="filter-bar">
            <el-select v-model="filterCategory" placeholder="分类" clearable style="width: 160px;">
              <el-option v-for="cat in NON_DEGRADABLE_CATEGORIES" :key="cat" :label="getTypeName(cat)" :value="cat" />
            </el-select>
            <el-input v-model="filterKeyword" placeholder="关键词" clearable style="width: 200px;" />
            <el-button type="primary" @click="addKeywordVisible = true">新增</el-button><InlineHelpMark :uc="buttonUseCases['BTN-011']" />
          </div>

          <el-table :data="filteredKeywords" stripe>
            <el-table-column prop="keyword" label="敏感词" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="{ row }">{{ getTypeName(row.category) }}</template>
            </el-table-column>
            <el-table-column prop="level" label="级别" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="getLevelTagType(row.level)" size="small">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="match_type" label="匹配方式" width="100" />
            <el-table-column prop="is_degradable" label="可降级" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.is_degradable ? 'success' : 'danger'" size="small">{{ row.is_degradable ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" text>编辑</el-button><InlineHelpMark :uc="buttonUseCases['BTN-012']" /><el-button size="small" text type="danger">禁用</el-button><InlineHelpMark :uc="buttonUseCases['BTN-013']" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 租户扩展词库 -->
        <el-tab-pane label="租户扩展词库" name="tenant-extended">
          <el-alert type="info" :closable="false" style="margin-bottom: 16px;">
            🟡 在平台基础上增加的词库（不可减少不可降级类）
          </el-alert>
          <el-button type="primary" @click="addKeywordVisible = true">新增扩展词</el-button>
          <el-table :data="tenantKeywords" stripe style="margin-top: 12px;">
            <el-table-column prop="keyword" label="敏感词" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="{ row }">{{ getTypeName(row.category) }}</template>
            </el-table-column>
            <el-table-column prop="level" label="级别" width="70" align="center" />
            <el-table-column prop="match_type" label="匹配方式" width="100" />
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 同步状态 -->
      <div class="sync-status">
        <el-tag type="success">✅ 已同步到腾讯云</el-tag>
        <span class="sync-time">最后同步: 2026-07-22 14:00</span>
        <el-button size="small" type="primary" plain>手动同步</el-button><InlineHelpMark :uc="buttonUseCases['BTN-014']" />
      </div>
    </el-card>

    <!-- 新增敏感词弹窗 -->
    <el-dialog v-model="addKeywordVisible" title="新增敏感词" width="480px">
      <el-form label-width="100px">
        <el-form-item label="敏感词" required>
          <el-input v-model="newKeyword.keyword" placeholder="请输入敏感词" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="newKeyword.category" style="width: 100%;">
            <el-option v-for="cat in allCategories" :key="cat" :label="getTypeName(cat)" :value="cat" />
          </el-select>
        </el-form-item>
        <el-form-item label="级别" required>
          <el-select v-model="newKeyword.level" style="width: 100%;">
            <el-option label="L1 核心" value="L1" />
            <el-option label="L2 高危" value="L2" />
            <el-option label="L3 中危" value="L3" />
            <el-option label="L4 低危" value="L4" />
          </el-select>
        </el-form-item>
        <el-form-item label="匹配方式" required>
          <el-select v-model="newKeyword.match_type" style="width: 100%;">
            <el-option label="精准匹配" value="exact" />
            <el-option label="模糊匹配" value="fuzzy" />
            <el-option label="语义匹配" value="semantic" />
            <el-option label="变体词" value="variant" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addKeywordVisible = false">取消</el-button>
        <el-button type="primary" @click="addKeywordVisible = false">确认新增</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuditStore } from '@/stores/audit'
import { NON_DEGRADABLE_CATEGORIES } from '@/contracts/content-review'
import InlineHelpMark from '@/components/audit/InlineHelpMark.vue'
import { buttonUseCases } from '@/data/use-case-cards'

const auditStore = useAuditStore()
const activeTab = ref('non-degradable')
const filterCategory = ref('')
const filterKeyword = ref('')
const addKeywordVisible = ref(false)
const newKeyword = ref({ keyword: '', category: 'pornography', level: 'L1', match_type: 'exact' })

const allCategories = ['pornography', 'violence', 'public_safety', 'social_safety', 'illegal', 'advertising_law', 'custom']

const platformKeywords = computed(() => auditStore.keywords.filter(k => k.scope === 'platform'))
const tenantKeywords = computed(() => auditStore.keywords.filter(k => k.scope === 'tenant'))

const filteredKeywords = computed(() => {
  let result = platformKeywords.value.filter(k => !k.is_degradable)
  if (filterCategory.value) result = result.filter(k => k.category === filterCategory.value)
  if (filterKeyword.value) result = result.filter(k => k.keyword.includes(filterKeyword.value))
  return result
})

const TYPE_NAMES: Record<string, string> = {
  pornography: '涉黄', violence: '涉暴', public_safety: '公共安全', social_safety: '社会安全',
  illegal: '违法乱纪', advertising_law: '广告法', custom: '自定义',
}
function getTypeName(type: string) { return TYPE_NAMES[type] || type }
function getLevelTagType(level: string): any {
  if (level === 'L1' || level === 'L2') return 'danger'
  if (level === 'L3') return 'warning'
  return 'info'
}
</script>

<style scoped>
.keyword-library { padding: 16px; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.sync-status { margin-top: 16px; padding: 12px; background: #f6ffed; border-radius: 4px; display: flex; align-items: center; gap: 12px; }
.sync-time { color: #999; font-size: 13px; }
</style>
