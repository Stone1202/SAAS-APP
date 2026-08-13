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
  ShippingAddress,
  UserStoreBinding,
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
    balance: 68.50,
    qualification_info: {
      real_name_verified: true,
      id_card_verified: false,
      qualification_images: [],
      qualification_status: 'approved',
    },
    created_at: '2024-06-15T00:00:00Z',
  },
  projectMembers: [
    { member_id: 'pm-001', project_id: 'proj-daily-01', user_id: 'user-001', level: 'gold', points: 2380, total_spent: 5680, joined_at: '2024-06-20T00:00:00Z', current_level_points: 380, next_level_points: 2000, coupons: ['coupon-d-001', 'coupon-d-002', 'coupon-d-003'], balance: 26.80, store_id: 'store-d-001', inviter_id: 'inv-001' },
    { member_id: 'pm-002', project_id: 'proj-health-01', user_id: 'user-001', level: 'platinum', points: 5200, total_spent: 12300, joined_at: '2024-07-01T00:00:00Z', current_level_points: 200, next_level_points: 5000, coupons: ['coupon-h-001', 'coupon-h-002'], balance: 128.50, store_id: 'store-h-001', inviter_id: 'inv-002' },
    { member_id: 'pm-003', project_id: 'proj-health-02', user_id: 'user-001', level: 'bronze', points: 120, total_spent: 280, joined_at: '2025-01-10T00:00:00Z', current_level_points: 120, next_level_points: 500, coupons: [], balance: 0, store_id: 'store-h-101', inviter_id: 'inv-003' },
    // v3.1.38: proj-daily-02（家居清洁馆）未绑定门店，用于展示「绑定门店指引」
    { member_id: 'pm-004', project_id: 'proj-daily-02', user_id: 'user-001', level: 'bronze', points: 0, total_spent: 0, joined_at: '2025-08-01T00:00:00Z', current_level_points: 0, next_level_points: 500, coupons: [], balance: 0 },
  ],
  messages: [
    { message_id: 'msg-001', user_id: 'user-001', type: 'order', title: '订单已发货', content: '您的订单（竹纤维抽纸×2）已发货，预计2天内送达', is_read: false, created_at: '2025-08-07T10:30:00Z' },
    { message_id: 'msg-002', user_id: 'user-001', type: 'promotion', title: '优惠券到账', content: '您获得一张满99减30优惠券，有效期7天', is_read: false, created_at: '2025-08-07T09:00:00Z' },
    { message_id: 'msg-003', user_id: 'user-001', type: 'live', title: '直播开播提醒', content: '您关注的主播「营养师李博士」正在直播', is_read: true, created_at: '2025-08-07T13:00:00Z' },
    { message_id: 'msg-004', user_id: 'user-001', type: 'project', title: '会员等级升级', content: '恭喜！您在「健康补给站」的会员等级已升级至铂金', is_read: true, created_at: '2025-08-05T16:00:00Z' },
    { message_id: 'msg-005', user_id: 'user-001', type: 'system', title: '系统维护通知', content: '平台将于今晚23:00-24:00进行系统维护，请提前安排', is_read: true, created_at: '2025-08-04T18:00:00Z' },
  ],
  shippingAddresses: [
    {
      address_id: 'addr-001',
      user_id: 'user-001',
      recipient_name: '张三',
      phone: '13888888001',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail_address: '建国路88号SOHO现代城A座1208室',
      is_default: true,
      created_at: '2024-05-01T00:00:00Z',
      updated_at: '2024-05-01T00:00:00Z',
    },
    {
      address_id: 'addr-002',
      user_id: 'user-001',
      recipient_name: '李四',
      phone: '13999999002',
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      detail_address: '中关村大街15号理想国际大厦5层',
      is_default: false,
      created_at: '2024-06-15T00:00:00Z',
      updated_at: '2024-06-15T00:00:00Z',
    },
  ],
  // v3.1.30 新增：用户门店绑定关系（邀请制私域运营）
  userStoreBindings: [
    { binding_id: 'usb-001', user_id: 'user-001', store_id: 'store-d-001', project_id: 'proj-daily-01', inviter_id: 'inv-001', bound_at: '2024-06-20T00:00:00Z' },
    { binding_id: 'usb-002', user_id: 'user-001', store_id: 'store-h-001', project_id: 'proj-health-01', inviter_id: 'inv-002', bound_at: '2024-07-01T00:00:00Z' },
    { binding_id: 'usb-003', user_id: 'user-001', store_id: 'store-h-101', project_id: 'proj-health-02', inviter_id: 'inv-003', bound_at: '2025-01-10T00:00:00Z' },
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
  const shippingAddresses = ref<ShippingAddress[]>(saved.shippingAddresses || (DEFAULT_DATA.shippingAddresses as any));
  // v3.1.30 新增：用户门店绑定关系
  const userStoreBindings = ref<UserStoreBinding[]>(saved.userStoreBindings || (DEFAULT_DATA.userStoreBindings as any) || []);

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

  const defaultAddress = computed(() => shippingAddresses.value.find(a => a.is_default) || shippingAddresses.value[0]);

  // v3.1.30 新增：用户门店绑定相关计算属性
  /** 当前用户已绑定的门店ID列表 */
  const boundStoreIds = computed(() =>
    userStoreBindings.value
      .filter(b => b.user_id === currentUser.value.user_id)
      .map(b => b.store_id)
  );

  /** 当前用户已绑定的项目ID列表（由门店绑定关系派生） */
  const boundProjectIds = computed(() => {
    const set = new Set<string>();
    userStoreBindings.value
      .filter(b => b.user_id === currentUser.value.user_id)
      .forEach(b => set.add(b.project_id));
    return [...set];
  });

  /** 按项目ID查询用户绑定的门店 */
  const boundStoreByProject = computed(() => (projectId: string) => {
    const binding = userStoreBindings.value.find(
      b => b.user_id === currentUser.value.user_id && b.project_id === projectId
    );
    return binding?.store_id;
  });

  /** 按门店ID查询绑定关系 */
  const bindingByStore = computed(() => (storeId: string) =>
    userStoreBindings.value.find(
      b => b.user_id === currentUser.value.user_id && b.store_id === storeId
    )
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
      coupons: [],
      balance: 0,
      // v3.1.30 新增：注册时可由调用方传入 store_id/inviter_id（邀请制）
      store_id: undefined,
      inviter_id: undefined,
    });
  }

  // v3.1.30 新增：门店绑定操作（邀请制私域运营）
  /** 用户绑定门店（一个项目下只能绑1个门店） */
  function bindStore(storeId: string, projectId: string, inviterId: string) {
    // 检查该项目下是否已绑定门店
    const existing = userStoreBindings.value.find(
      b => b.user_id === currentUser.value.user_id && b.project_id === projectId
    );
    if (existing) {
      // 已绑定则更新
      existing.store_id = storeId;
      existing.inviter_id = inviterId;
      existing.bound_at = new Date().toISOString();
    } else {
      userStoreBindings.value.push({
        binding_id: `usb-${Date.now()}`,
        user_id: currentUser.value.user_id,
        store_id: storeId,
        project_id: projectId,
        inviter_id: inviterId,
        bound_at: new Date().toISOString(),
      });
    }
    // 同步更新 ProjectMember.store_id/inviter_id
    const member = projectMembers.value.find(
      m => m.project_id === projectId && m.user_id === currentUser.value.user_id
    );
    if (member) {
      member.store_id = storeId;
      member.inviter_id = inviterId;
    }
  }

  /** 用户解绑门店 */
  function unbindStore(storeId: string) {
    const idx = userStoreBindings.value.findIndex(
      b => b.user_id === currentUser.value.user_id && b.store_id === storeId
    );
    if (idx >= 0) {
      const binding = userStoreBindings.value[idx];
      // 同步清除 ProjectMember.store_id/inviter_id
      const member = projectMembers.value.find(
        m => m.project_id === binding.project_id && m.user_id === currentUser.value.user_id
      );
      if (member) {
        member.store_id = undefined;
        member.inviter_id = undefined;
      }
      userStoreBindings.value.splice(idx, 1);
    }
  }

  /** 检查用户是否已绑定某门店 */
  function isStoreBound(storeId: string): boolean {
    return userStoreBindings.value.some(
      b => b.user_id === currentUser.value.user_id && b.store_id === storeId
    );
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

  // ── 收货地址管理（ENT-APP-009）──
  function addAddress(addr: Omit<ShippingAddress, 'address_id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString();
    const newAddr: ShippingAddress = {
      ...addr,
      address_id: `addr-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    if (newAddr.is_default) {
      shippingAddresses.value.forEach(a => { a.is_default = false; });
    }
    shippingAddresses.value.push(newAddr);
  }

  function updateAddress(addressId: string, data: Partial<ShippingAddress>) {
    const idx = shippingAddresses.value.findIndex(a => a.address_id === addressId);
    if (idx >= 0) {
      Object.assign(shippingAddresses.value[idx], data, { updated_at: new Date().toISOString() });
      if (data.is_default) {
        shippingAddresses.value.forEach((a, i) => {
          if (i !== idx) a.is_default = false;
        });
      }
    }
  }

  function deleteAddress(addressId: string) {
    const idx = shippingAddresses.value.findIndex(a => a.address_id === addressId);
    if (idx >= 0) shippingAddresses.value.splice(idx, 1);
  }

  // ============================================
  // 持久化：watch 自动保存
  // ============================================

  function snapshot(): StoredUserData {
    return {
      currentUser: JSON.parse(JSON.stringify(currentUser.value)),
      projectMembers: JSON.parse(JSON.stringify(projectMembers.value)),
      messages: JSON.parse(JSON.stringify(messages.value)),
      shippingAddresses: JSON.parse(JSON.stringify(shippingAddresses.value)),
      userStoreBindings: JSON.parse(JSON.stringify(userStoreBindings.value)),
    };
  }

  watch(
    [currentUser, projectMembers, messages, shippingAddresses, userStoreBindings],
    () => dataService.saveUserData(snapshot()),
    { deep: true }
  );

  return {
    currentUser, projectMembers, messages, shippingAddresses, userStoreBindings,
    unreadCount, memberByProject, joinedProjectIds, defaultAddress,
    // v3.1.30 新增
    boundStoreIds, boundProjectIds, boundStoreByProject, bindingByStore,
    updateUser, joinProject, addPoints, markMessageRead, markAllRead,
    addAddress, updateAddress, deleteAddress,
    // v3.1.30 新增
    bindStore, unbindStore, isStoreBound,
  };
});
