<template>
  <!-- 搜索页 — 搜索历史 + 热搜推荐（带图标标签） -->
  <div class="search-page">
    <!-- 搜索框 -->
    <div class="sp-input-row">
      <div class="sp-input-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref="inputRef"
          v-model="keyword"
          class="sp-input"
          placeholder="搜索商品、直播、项目"
          @keyup.enter="doSearch(keyword)"
        />
        <span v-if="keyword" class="sp-clear" @click="keyword=''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ccc" stroke="#ccc" stroke-width="1">
            <circle cx="12" cy="12" r="10" fill="#ddd"/>
            <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2"/>
            <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2"/>
          </svg>
        </span>
      </div>
      <span class="sp-cancel" @click="$router.back()">取消</span>
    </div>

    <!-- 搜索历史 -->
    <div class="sp-block" v-if="history.length">
      <div class="spb-header">
        <span class="spb-title">搜索历史</span>
        <span class="spb-del" @click="clearHistory">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </span>
      </div>
      <div class="spb-tags">
        <span
          v-for="(h, i) in history"
          :key="i"
          class="spb-tag"
          @click="doSearch(h)"
        >{{ h }}</span>
      </div>
    </div>

    <!-- 热搜推荐 — 带图标标签 -->
    <div class="sp-block">
      <div class="spb-header">
        <span class="spb-title">🔥 热搜推荐</span>
      </div>
      <div class="spb-tags">
        <span
          v-for="(hw, i) in appConfig.hotWordConfigs.filter(h => h.status === 'active').sort((a, b) => b.weight - a.weight)"
          :key="i"
          :class="['spb-tag', { 'spb-tag-hot': i < 3 }]"
          @click="doSearch(hw.word)"
        >
          <span v-if="i < 3" class="spb-rank">{{ i + 1 }}</span>
          {{ hw.word }}
          <span class="spb-badge" v-if="hw.badge" :class="`badge-${hw.badge}`">{{ badgeLabel(hw.badge) }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppConfigStore } from '../../../stores/app-config-store';

const router = useRouter();
const route = useRoute();
const appConfig = useAppConfigStore();

const keyword = ref((route.query.q as string) || '');
const inputRef = ref<HTMLInputElement>();
const history = ref<string[]>(JSON.parse(localStorage.getItem('search_history') || '[]').slice(0, 12));

// 标签文案映射
const badgeLabelMap: Record<string, string> = {
  hot: '热门', fire: '火爆', new: '最新', popular: '人气', recommend: '推荐', sale: '热卖',
};
function badgeLabel(badge: string) { return badgeLabelMap[badge] || badge; }

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus();
    if (keyword.value) {
      inputRef.value?.setSelectionRange(0, keyword.value.length);
    }
  });
});

function doSearch(q: string) {
  if (!q.trim()) return;
  // 存历史
  const h = history.value.filter(w => w !== q);
  h.unshift(q);
  history.value = h.slice(0, 12);
  localStorage.setItem('search_history', JSON.stringify(history.value));
  // 检查热搜词是否关联了自定义结果（直接跳转）
  const hw = appConfig.hotWordConfigs.find(h => h.word === q && h.status === 'active' && h.csr_id);
  if (hw) {
    const csr = appConfig.customSearchResults.find(c => c.item_id === hw.csr_id);
    if (csr && csr.status === 'active') {
      // 直接跳转到自定义结果的目标页
      if (csr.jump_type === 'project') {
        router.push(`/app/project/${csr.jump_id}`);
      } else if (csr.jump_type === 'product') {
        router.push(`/app/project/${csr.project_id}/store/${csr.store_id}`);
      } else if (csr.jump_type === 'live') {
        router.push(`/app/project/${csr.project_id}/lives`);
      } else {
        router.push(`/app/search/result?q=${encodeURIComponent(q)}`);
      }
      return;
    }
  }
  router.push(`/app/search/result?q=${encodeURIComponent(q)}`);
}

function clearHistory() {
  history.value = [];
  localStorage.removeItem('search_history');
}
</script>

<style scoped>
.search-page {
  background: #fff;
  min-height: 100vh;
  padding: 0 0 20px;
}

/* 搜索输入行 */
.sp-input-row {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 10px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.sp-input-box {
  flex: 1;
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 4px 0 14px;
  background: #f5f5f5;
  border-radius: 19px;
  gap: 8px;
}
.sp-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #222;
  outline: none;
}
.sp-input::placeholder { color: #bbb; }
.sp-clear { cursor: pointer; display: flex; align-items: center; }
.sp-cancel {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  flex-shrink: 0;
}

/* 区块 */
.sp-block { padding: 14px 16px 4px; }
.spb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.spb-title { font-size: 14px; font-weight: 700; color: #111; }
.spb-del { cursor: pointer; display: flex; }

.spb-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.spb-tag {
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
}
.spb-tag:active { background: #eee; }
.spb-tag-hot { color: #FF6B35; font-weight: 600; }
.spb-rank {
  display: inline-block;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-radius: 4px;
  background: linear-gradient(135deg, #FF6B35, #FF8F35);
  color: #fff;
  font-size: 10px;
  margin-right: 2px;
  flex-shrink: 0;
}

/* 热搜词图标标签 */
.spb-badge {
  display: inline-block;
  padding: 0 5px;
  height: 16px;
  line-height: 16px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 2px;
}
.badge-hot { background: #FFF1F0; color: #F5222D; }
.badge-fire { background: #FFF7E6; color: #FA8C16; }
.badge-new { background: #F6FFED; color: #52C41A; }
.badge-popular { background: #E6F7FF; color: #1890FF; }
.badge-recommend { background: #FFF0F6; color: #EB2F96; }
.badge-sale { background: #FFF1F0; color: #FF4D4F; }
</style>
