<template>
  <!-- 项目会员中心 — 真机风格 -->
  <div class="member-page">
    <!-- 会员卡片 -->
    <div class="mp-card">
      <div class="mp-card-bg"></div>
      <div class="mp-card-inner">
        <!-- 顶部 -->
        <div class="mp-header">
          <div class="mp-avatar">{{ userName?.charAt(0) || '用' }}</div>
          <div class="mp-user-info">
            <div class="mp-nick">{{ userName }}</div>
            <div class="mp-level-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>{{ currentLevel?.name || '普通会员' }}</span>
            </div>
          </div>
          <div class="mp-upgrade" @click="onUpgrade">升级 ›</div>
        </div>

        <!-- 数据 -->
        <div class="mp-stats">
          <div class="mps-item">
            <span class="mps-val">{{ points }}</span>
            <span class="mps-label">积分</span>
          </div>
          <div class="mps-divider"></div>
          <div class="mps-item">
            <span class="mps-val">{{ coupons }}</span>
            <span class="mps-label">优惠券</span>
          </div>
          <div class="mps-divider"></div>
          <div class="mps-item">
            <span class="mps-val">{{ orders }}</span>
            <span class="mps-label">订单</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 会员等级 -->
    <div class="section">
      <div class="section-header">
        <span class="sh-title">会员等级</span>
      </div>
      <div class="level-list">
        <div
          v-for="(lv, i) in levels"
          :key="lv.level"
          :class="['level-card', { current: i === 1 }]"
        >
          <div class="lc-icon" :style="{ background: levelColors[i] }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
              <circle cx="12" cy="8" r="5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>
            </svg>
          </div>
          <div class="lc-text">
            <div class="lc-name">{{ lv.name }}</div>
            <div class="lc-req">{{ lv.requirement }}</div>
          </div>
          <div class="lc-badge" :style="{ background: levelColors[i] }" v-if="i <= 1">当前</div>
          <div class="lc-progress" v-else>
            <div class="lcp-bar"><div class="lcp-fill" :style="{ width: `${30 + i * 15}%` }"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分规则 -->
    <div class="section">
      <div class="section-header">
        <span class="sh-title">积分规则</span>
        <span class="sh-more" @click="onMoreRules">查看全部 ›</span>
      </div>
      <div class="rule-list">
        <div class="rule-item" v-for="r in rules" :key="r.key">
          <span class="ri-icon">{{ r.icon }}</span>
          <span class="ri-action">{{ r.action }}</span>
          <span class="ri-reward">{{ r.reward }}</span>
        </div>
      </div>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '../../../stores/project-store';
import { useUserStore } from '../../../stores/user-store';

const route = useRoute();
const projectStore = useProjectStore();
const userStore = useUserStore();

const projectId = computed(() => route.params.projectId as string);
const userName = computed(() => userStore.currentUser?.nickname || '用户138');
const points = ref(2580);
const coupons = ref(3);
const orders = ref(12);

// 等级
const levels = [
  { level: 1, name: '普通会员', requirement: '注册即享' },
  { level: 2, name: '银卡会员', requirement: '累计消费 ¥500' },
  { level: 3, name: '金卡会员', requirement: '累计消费 ¥2000' },
  { level: 4, name: '钻石会员', requirement: '累计消费 ¥5000' },
];
const currentLevel = computed(() => levels[1]); // 银卡
const levelColors = ['#aaa', '#7B8FBB', '#D4A843', '#5CACEE'];

// 积分规则
const rules = [
  { key: 'buy', icon: '🛍️', action: '消费1元', reward: '+1积分' },
  { key: 'review', icon: '✍️', action: '发表评价', reward: '+5积分' },
  { key: 'share', icon: '📤', action: '分享商品', reward: '+3积分' },
  { key: 'sign', icon: '📅', action: '每日签到', reward: '+2积分' },
];

function onUpgrade() {}
function onMoreRules() {}
</script>

<style scoped>
.member-page { background: #f5f5f5; min-height: 100%; }

/* 会员卡 */
.mp-card {
  margin: 12px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}
.mp-card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #7B8FBB 0%, #5B6E96 40%, #435477 100%);
}
.mp-card-bg::after {
  content: '';
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 120px;
  height: 120px;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}
.mp-card-inner { padding: 20px; position: relative; z-index: 1; }

.mp-header { display: flex; align-items: center; gap: 12px; }
.mp-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}
.mp-user-info { flex: 1; }
.mp-nick { font-size: 17px; font-weight: 700; color: #fff; }
.mp-level-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 2px 8px;
  background: rgba(255,255,255,0.15);
  border-radius: 6px;
  font-size: 11px;
  color: #fff;
  color: #FFD700;
}
.mp-upgrade {
  padding: 6px 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 14px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
}

/* 数据统计 */
.mp-stats {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 14px;
  background: rgba(255,255,255,0.12);
  border-radius: 12px;
}
.mps-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.mps-val { font-size: 20px; font-weight: 700; color: #fff; }
.mps-label { font-size: 11px; color: rgba(255,255,255,0.7); }
.mps-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.2); }

/* 区块 */
.section { margin: 12px; background: #fff; border-radius: 14px; overflow: hidden; }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px 8px; }
.sh-title { font-size: 16px; font-weight: 700; color: #111; }
.sh-more { font-size: 12px; color: #999; cursor: pointer; }

/* 等级列表 */
.level-list { padding: 4px 16px 14px; display: flex; flex-direction: column; gap: 8px; }
.level-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: #fafafa;
}
.level-card.current { background: rgba(123,143,187,0.06); border: 1px solid rgba(123,143,187,0.2); }
.lc-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lc-text { flex: 1; }
.lc-name { font-size: 14px; font-weight: 600; color: #222; }
.lc-req { font-size: 11px; color: #999; margin-top: 2px; }
.lc-badge {
  font-size: 10px;
  color: #fff;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}
.lc-progress { width: 60px; }
.lcp-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}
.lcp-fill {
  height: 100%;
  background: linear-gradient(90deg, #7B8FBB, #5B6E96);
  border-radius: 2px;
}

/* 规则列表 */
.rule-list { padding: 4px 16px 14px; }
.rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.rule-item:last-child { border-bottom: none; }
.ri-icon { font-size: 20px; }
.ri-action { flex: 1; font-size: 13px; color: #333; }
.ri-reward { font-size: 13px; color: #F5222D; font-weight: 600; }

.safe-bottom { height: 24px; }
</style>
