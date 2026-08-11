/**
 * 用户域 — Pinia Store（接入持久化服务）
 *
 * 用户为平台维度，会员关系为项目维度
 *
 * 数据持久化：
 *   所有 ref 变更通过 watch 自动同步到 localStorage，
 *   页面刷新后自动恢复。
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { dataService, type StoredUserData } from '../services/data-service';
import type {
  AppUser,
  AppMessage,
  ProjectMember,
} from '../contracts';

// ============================================
// 默认值
// ============================================

const DEFAULT_DATA: StoredUserData = {
  currentUser: {
    user_id: 'user-001',
    nickname: '微信用户8866',
    avatar: 'https://picsum.photos/seed/user-avatar-001/100/100',
    phone: '138****8888',
    gender: 'unknown',
    birthday: '',
    platform_points: 1280,
    coupon_count: 5,
    order_count: 36,
    created_at: '2024-06-15T00:00:00Z',
  },
  projectMembers: [
    { member_id: 'pm-001', project_id: 'proj-daily-01', user_id: 'user-001', level: 'gold', points: 2380, total_spent: 5680, joined_at: '2024-06-20T00:00:00Z', current_level_points: 380, next_level_points: 2000 },
    { member_id: 'pm-002', project_id: 'proj-health-01', user_id: 'user-001', level: 'platinum', points: 5200, total_spent: 12300, joined_at: '2024-07-01T00:00:00Z', current_level_points: 200, next_level_points: 5000 },
    { member_id: 'pm-003', project_id: 'proj-health-02', user_id: 'user-001', level: 'bronze', points: 120, total_spent: 280, joined_at: '2025-01-10T00:00:00Z', current_level_points: 120, next_level_points: 500 },
  ],
  messages: [
    { message_id: 'msg-001', user_id: 'user-001', type: 'order', title: '订单已发货', content: '您的订单（竹纤维抽纸×2）已发货，预计2天内送达', is_read: false, created_at: '2025-08-07T10:30:00Z' },
    { message_id: 'msg-002', user_id: 'user-001', type: 'promotion', title: '优惠券到账', content: '您获得一张满99减30优惠券，有效期7天', is_read: false, created_at: '2025-08-07T09:00:00Z' },
    { message_id: 'msg-003', user_id: 'user-001', type: 'live', title: '直播开播提醒', content: '您关注的主播「营养师李博士」正在直播', is_read: true, created_at: '2025-08-07T13:00:00Z' },
    { message_id: 'msg-004', user_id: 'user-001', type: 'project', title: '会员等级升级', content: '恭喜！您在「健康补给站」的会员等级已升级至铂金', is_read: true, created_at: '2025-08-05T16:00:00Z' },
    { message_id: 'msg-005', user_id: 'user-001', type: 'system', title: '系统维护通知', content: '平台将于今晚23:00-24:00进行系统维护，请提前安排', is_read: true, created_at: '2025-08-04T18:00:00Z' },
  ],
};

// ============================================
// Store
// ============================================

export const useUserStore = defineStore('appUser', () => {
  const saved = dataService.loadUserData(DEFAULT_DATA);

  // ============================================
  // 状态
  // ============================================

  const currentUser = ref<AppUser>(saved.currentUser as any);
  const projectMembers = ref<ProjectMember[]>(saved.projectMembers as any);
  const messages = ref<AppMessage[]>(saved.messages as any);

  // ============================================
  // 计算属性
  // ============================================

  const unreadCount = computed(() => messages.value.filter(m => !m.is_read).length);

  const memberByProject = computed(() => (projectId: string) =>
    projectMembers.value.find(m => m.project_id === projectId && m.user_id === currentUser.value.user_id)
  );

  const joinedProjectIds = computed(() =>
    projectMembers.value
      .filter(m => m.user_id === currentUser.value.user_id)
      .map(m => m.project_id)
  );

  // ============================================
  // 操作
  // ============================================

  function updateUser(data: Partial<AppUser>) {
    Object.assign(currentUser.value, data);
  }

  function joinProject(projectId: string, level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze') {
    const existing = projectMembers.value.find(
      m => m.project_id === projectId && m.user_id === currentUser.value.user_id
    );
    if (existing) return;
    projectMembers.value.push({
      member_id: `pm-${Date.now()}`,
      project_id: projectId,
      user_id: currentUser.value.user_id,
      level,
      points: 0,
      total_spent: 0,
      joined_at: new Date().toISOString(),
      current_level_points: 0,
      next_level_points: 500,
    });
  }

  function addPoints(projectId: string, points: number) {
    const member = projectMembers.value.find(
      m => m.project_id === projectId && m.user_id === currentUser.value.user_id
    );
    if (member) {
      member.points += points;
      member.current_level_points += points;
    }
  }

  function markMessageRead(messageId: string) {
    const msg = messages.value.find(m => m.message_id === messageId);
    if (msg) msg.is_read = true;
  }

  function markAllRead() {
    messages.value.forEach(m => { m.is_read = true; });
  }

  // ============================================
  // 持久化：watch 自动保存
  // ============================================

  function snapshot(): StoredUserData {
    return {
      currentUser: JSON.parse(JSON.stringify(currentUser.value)),
      projectMembers: JSON.parse(JSON.stringify(projectMembers.value)),
      messages: JSON.parse(JSON.stringify(messages.value)),
    };
  }

  watch(
    [currentUser, projectMembers, messages],
    () => dataService.saveUserData(snapshot()),
    { deep: true }
  );

  return {
    currentUser, projectMembers, messages,
    unreadCount, memberByProject, joinedProjectIds,
    updateUser, joinProject, addPoints, markMessageRead, markAllRead,
  };
});
