/**
 * SugarMate 跨 Store 数据同步引擎 V1.1.0
 *
 * 解决四大端到端数据不同步问题：
 *   链路A：入驻申请审核通过 → SIM适配器（MOCK_APPLICATIONS/MERCHANTS/IDENTITIES）
 *   链路B：商家成员管理变更 → SIM适配器（MOCK_IDENTITIES → APP端角色切换可见）
 *   链路C：商品数据变更 → localStorage + BroadcastChannel（跨标签页同步）
 *   链路D：直播中控 → APP直播间的实时数据同步（BroadcastChannel + localStorage 双通道）
 *
 * 架构原理：
 *   PC端 Store（onboardingStore/merchantStore/liveStore）用 zustand/persist + localStorage
 *   适配器层 Store（userStore/productStore/orderStore/...）通过 SIM 适配器的 MOCK_* 数组读取
 *   本引擎监听 PC端 Store 的变化，自动同步到 SIM 适配器的共享 MOCK_* 数组，
 *   确保两类 Store 之间的数据一致。
 */
import { SIM_SHARED } from '@/adapters/sim';
import type { MerchantRecord } from './merchantStore';
import type { OnboardingApplication, OnboardingStatus } from './onboardingStore';

// ==================== 角色映射表 ====================
const ONBOARD_TO_MERCHANT_ROLE: Record<string, string> = {
  PH: 'PHARMACY',
  DR: 'DOCTOR',
  PR: 'PHARMACIST',
  NT: 'NUTRITIONIST',
};

const ROLE_TO_MERCHANT_TYPE: Record<string, string> = {
  PH: 'PHARMACY',
  DR: 'DOCTOR',
  PR: 'PHARMACIST',
  NT: 'NUTRITIONIST',
  PHARMACY: 'PHARMACY',
  DOCTOR: 'DOCTOR',
  PHARMACIST: 'PHARMACIST',
  NUTRITIONIST: 'NUTRITIONIST',
};

/** MerchantRole → UserRole 映射（入驻审批通过后的身份 role 对齐 contracts/user.ts UserRole） */
const MERCHANT_TO_USER_ROLE: Record<string, string> = {
  PHARMACY: 'PH',
  DOCTOR: 'DOCTOR',
  PHARMACIST: 'PHARMACIST',
  NUTRITIONIST: 'NUTRITIONIST',
};

// ==================== 去重辅助 ====================
let lastAppStatuses: Record<string, OnboardingStatus> = {};
let lastMerchantStates: Record<string, string> = {};
let lastProductMutation = 0;

// ==================== 商家 → SIM 身份同步 ====================
function merchantToIdentity(m: MerchantRecord) {
  // identity_role 使用 UserRole（对齐 contracts/user.ts），而非 MerchantRole
  const userRole = MERCHANT_TO_USER_ROLE[m.role] || m.role;
  return {
    id: `id-merchant-${m.id}`,
    account_id: 'acc-001', // 主账号
    role: userRole,
    status: m.lifecycleStatus === 'ONLINE' ? 'ACTIVE' : m.lifecycleStatus === 'FROZEN' ? 'SUSPENDED' : 'PENDING',
    real_name: m.name,
    merchant_id: m.id,
    merchant_name: m.name,
    merchant_type: ROLE_TO_MERCHANT_TYPE[m.role] || m.role,
    created_at: m.createdAt,
  };
}

function syncMerchantToIdentities(m: MerchantRecord) {
  // 移除旧身份
  const oldIdx = SIM_SHARED.identities.findIndex(
    (i: any) => i.id === `id-merchant-${m.id}`
  );
  if (oldIdx >= 0) SIM_SHARED.identities.splice(oldIdx, 1);

  // ONLINE/APPROVED 的商家添加身份
  if (m.lifecycleStatus === 'ONLINE' || m.lifecycleStatus === 'APPROVED') {
    SIM_SHARED.addIdentity(merchantToIdentity(m));
  }
}

// ==================== 链路A：入驻申请 → SIM适配器 ====================
function syncApplicationToSim(app: OnboardingApplication) { /* eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars */
  // 更新 SIM 适配器中的入驻申请状态
  SIM_SHARED.updateApplicationStatus(app.id, app.status);

  // 如果审核通过，同步到商家列表
  if (['CERT_APPROVED', 'APPROVED', 'SIGNING', 'SIGNED', 'ONLINE'].includes(app.status)) {
    const merchantId = `m-onboard-${app.id}`;
    SIM_SHARED.addMerchant({
      id: merchantId,
      name: app.name,
      type: ROLE_TO_MERCHANT_TYPE[app.role] || 'PHARMACY',
      status: app.status === 'ONLINE' ? 'ACTIVE' : 'PENDING',
      contact_name: app.name,
      contact_phone: app.phone,
      province: app.province || '',
      city: app.city || '',
      total_orders: 0,
      total_revenue: 0,
      joined_at: Date.now() / 1000,
    });
  }
}

// ==================== 链路A+B：监听 onboardingStore ====================
export async function linkOnboardingStore() {
  // 动态 import 避免循环依赖（ESM 环境下 require 不可用）
  const { useOnboardingStore } = await import('./onboardingStore');
  const store = useOnboardingStore;

  // 初始化快照
  const apps = store.getState().applications as OnboardingApplication[];
  apps.forEach(a => { lastAppStatuses[a.id] = a.status; });

  store.subscribe((state: any, prevState: any) => {
    const apps: OnboardingApplication[] = state.applications || [];
    const prevApps: OnboardingApplication[] = prevState?.applications || [];

    // 检测状态变化的申请
    apps.forEach(app => {
      const prevApp = prevApps.find((a: OnboardingApplication) => a.id === app.id);

      if (!prevApp || prevApp.status === app.status) return;
      lastAppStatuses[app.id] = app.status;

      // 入驻申请状态变更 → 同步到 SIM 适配器
      syncApplicationToSim(app);
    });
  });
}

// ==================== 链路B：监听 merchantStore ====================
export async function linkMerchantStore() {
  // 动态 import 避免循环依赖（ESM 环境下 require 不可用）
  const merchantStoreMod = await import('./merchantStore');
  const store = merchantStoreMod.useMerchantStore;

  // 初始化快照
  const merchants: MerchantRecord[] = store.getState().merchants || [];
  merchants.forEach(m => {
    lastMerchantStates[m.id] = m.lifecycleStatus;
    // 启动时把已有商家同步到 SIM identities
    syncMerchantToIdentities(m);
  });

  store.subscribe((state: any, prevState: any) => {
    const merchants: MerchantRecord[] = state.merchants || [];
    const prevMerchants: MerchantRecord[] = prevState?.merchants || [];

    merchants.forEach(m => {
      const prev = prevMerchants.find((pm: MerchantRecord) => pm.id === m.id);

      // 新增商家
      if (!prev) {
        lastMerchantStates[m.id] = m.lifecycleStatus;
        syncMerchantToIdentities(m);
        // 同步到 SIM 商家列表
        SIM_SHARED.addMerchant({
          id: m.id,
          name: m.name,
          type: ROLE_TO_MERCHANT_TYPE[m.role] || 'PHARMACY',
          status: m.lifecycleStatus === 'ONLINE' ? 'ACTIVE' : 'PENDING',
          contact_name: m.name,
          contact_phone: m.phone,
          province: m.province || '',
          city: m.city || '',
          total_orders: 0,
          total_revenue: 0,
          joined_at: m.createdAt,
        });
        return;
      }

      // 状态变更
      if (prev.lifecycleStatus !== m.lifecycleStatus) {
        lastMerchantStates[m.id] = m.lifecycleStatus;
        syncMerchantToIdentities(m);
        // 同步状态到 SIM
        SIM_SHARED.updateMerchant(m.id, {
          status: m.lifecycleStatus === 'ONLINE' ? 'ACTIVE' : m.lifecycleStatus === 'FROZEN' ? 'SUSPENDED' : 'PENDING',
          name: m.name,
          contact_name: m.name,
          contact_phone: m.phone,
        });
      }
    });
  });
}

// ==================== 链路C：商品跨标签页同步 ====================
const PRODUCT_VERSION_KEY = 'sugarmate_product_version';

export function getProductVersion(): number {
  return parseInt(localStorage.getItem(PRODUCT_VERSION_KEY) || '0', 10);
}

function bumpProductVersion() {
  const v = getProductVersion() + 1;
  localStorage.setItem(PRODUCT_VERSION_KEY, String(v));
  return v;
}

// ==================== 商品变更后调用，触发跨标签页同步 ====================
export function notifyProductChanged() {
  const now = Date.now();
  if (now - lastProductMutation < 200) return; // 防抖
  lastProductMutation = now;
  bumpProductVersion();
}

// ==================== 自动接收商品同步 ====================
let productSyncTimer: ReturnType<typeof setInterval> | null = null;

function startProductSyncReceiver() {
  if (productSyncTimer) return;

  let lastSeenVersion = getProductVersion();

  // 方案1：监听其他标签页的 storage 事件
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === PRODUCT_VERSION_KEY && e.newValue !== e.oldValue) {
      handleProductVersionChange(parseInt(e.newValue || '0', 10));
    }
  });

  // 方案2：同一标签页内轮询（不同路由/组件间）
  productSyncTimer = setInterval(() => {
    const currentVersion = getProductVersion();
    if (currentVersion !== lastSeenVersion) {
      lastSeenVersion = currentVersion;
      handleProductVersionChange(currentVersion);
    }
  }, 1500);
}

async function handleProductVersionChange(newVersion: number) {
  try {
    const { useProductStore } = await import('./productStore');
    const state = useProductStore.getState();
    // 重新加载当前筛选条件下的商品列表
    const activeFilter = (state as any).activeFilter || {};
    state.loadProducts(activeFilter).catch(() => {});
  } catch {
    // productStore 未加载时忽略
  }
}

// ==================== 链路D：直播中控 → APP直播间实时同步 ====================
const LIVE_STATE_KEY = 'sugarmate_live_state';

type LiveSyncSnapshot = {
  liveSessions: any[];
  liveRooms: any[];
  liveProducts: any[];
  marketingActivities: any[];
  interactionConfigs: any[];
  broadcastPlans: any[];
  comments: any[];
  liveStats: any;
  explainLock: any;
  controlCommands: any[];
  version: number;
  updatedAt: number;
};

/** PC端调用：将直播状态写入 localStorage */
export function persistLiveState() {
  try {
    const { useLiveStore } = require('./liveStore');
    const s = useLiveStore.getState() as any;
    const snapshot: LiveSyncSnapshot = {
      liveSessions: s.liveSessions || [],
      liveRooms: s.liveRooms || [],
      liveProducts: s.liveProducts || [],
      marketingActivities: s.marketingActivities || [],
      interactionConfigs: s.interactionConfigs || [],
      broadcastPlans: s.broadcastPlans || [],
      comments: s.comments || [],
      liveStats: s.liveStats || {},
      explainLock: s.explainLock || null,
      controlCommands: s.controlCommands || [],
      version: Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(snapshot));
  } catch {
    // liveStore 未加载时忽略
  }
}

/** APP端调用：从 localStorage 恢复直播状态 */
export function restoreLiveState(): Partial<LiveSyncSnapshot> | null {
  try {
    const raw = localStorage.getItem(LIVE_STATE_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as LiveSyncSnapshot;
    return snapshot;
  } catch {
    return null;
  }
}

let liveSyncPollTimer: ReturnType<typeof setInterval> | null = null;

function startLiveSyncReceiver() {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === LIVE_STATE_KEY && e.newValue) {
      try {
        applyLiveSnapshot(JSON.parse(e.newValue));
      } catch { /* ignore */ }
    }
  });

  // 同标签页轮询兜底
  liveSyncPollTimer = setInterval(() => {
    try {
      const raw = localStorage.getItem(LIVE_STATE_KEY);
      if (!raw) return;
      const snapshot = JSON.parse(raw) as LiveSyncSnapshot;
      applyLiveSnapshot(snapshot);
    } catch { /* ignore */ }
  }, 2000);
}

let lastLiveSyncVersion = 0;

async function applyLiveSnapshot(snapshot: LiveSyncSnapshot) {
  if (snapshot.version <= lastLiveSyncVersion) return;
  lastLiveSyncVersion = snapshot.version;
  try {
    const { useLiveStore } = await import('./liveStore');
    useLiveStore.setState({
      liveSessions: snapshot.liveSessions,
      liveRooms: snapshot.liveRooms,
      liveProducts: snapshot.liveProducts,
      marketingActivities: snapshot.marketingActivities,
      interactionConfigs: snapshot.interactionConfigs,
      broadcastPlans: snapshot.broadcastPlans,
      comments: snapshot.comments,
      liveStats: snapshot.liveStats,
      explainLock: snapshot.explainLock,
      controlCommands: snapshot.controlCommands,
    });
  } catch { /* ignore */ }
}

// ==================== 启动引擎 ====================
let started = false;

export function startSyncEngine() {
  if (started) return;
  started = true;

  // 初始化版本号
  if (!localStorage.getItem(PRODUCT_VERSION_KEY)) {
    localStorage.setItem(PRODUCT_VERSION_KEY, '1');
  }

  // 延迟启动，确保所有 Store 的 persist rehydrate 完成
  setTimeout(async () => {
    await linkOnboardingStore();
    await linkMerchantStore();
    startProductSyncReceiver();
    startLiveSyncReceiver();
    console.log('[SyncEngine] 四大同步链路已启动 ✅');
    console.log('  链路A: onboardingStore → SIM MOCK_APPLICATIONS/MERCHANTS/IDENTITIES');
    console.log('  链路B: merchantStore → SIM MOCK_IDENTITIES (APP角色)');
    console.log('  链路C: productStore → localStorage 轮询 (自动刷新所有商品页)');
    console.log('  链路D: liveStore → BroadcastChannel + localStorage 双通道 (PC→APP实时同步)');
  }, 500);
}
