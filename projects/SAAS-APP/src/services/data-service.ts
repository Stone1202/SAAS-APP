/**
 * 数据持久化服务层
 *
 * 使用 localStorage 实现前后端数据同步。
 * 所有 Store 的数据变更自动持久化，页面刷新后自动恢复。
 *
 * 架构：
 *   Store 层 → DataService 层 → localStorage
 *       ↑ 业务逻辑          ↑ 持久化/初始化
 *
 * localStorage Key 命名：
 *   saas:app-config  — 运营配置（搜索/Banner/金刚区/推荐）
 *   saas:project     — 项目域数据（项目/门店/商品/直播/会员）
 *   saas:user        — 用户域数据（用户/会员关系/消息）
 */

// ============================================
// 类型
// ============================================

export interface StoredAppConfig {
  searchHint: string;
  hotWordConfigs: any[];
  customSearchResults: any[];
  adBanners: any[];
  kingKongs: any[];
  liveRecommendConfigs: any[];
  productRecommendConfigs: any[];
  /** v3.1.30 新增：项目推荐配置 */
  projectRecommendConfigs?: any[];
  /** v3.1.30 新增：推荐场景配置 */
  recommendScenarios?: any[];
  /** v3.1.30 新增：规则模板 */
  ruleTemplates?: any[];
  /** v3.1.31 新增：推荐规则实体（独立化规则定义） */
  recommendRules?: any[];
  /** v3.1.44 新增：功能页面注册表（白名单） */
  functionPages?: any[];
  unreadCount: number;
}

export interface StoredProjectData {
  tenants: any[];
  projects: any[];
  stores: any[];
  products: any[];
  liveRooms: any[];
  memberLevelConfigs: any[];
  projectHomeConfigs: any[];
  marketingCategories?: any[];
  coupons?: any[];
  signInStates?: any[];
  /** v3.1.30 新增：邀请人/店长/店员 */
  inviters?: any[];
}

export interface StoredUserData {
  currentUser: any;
  projectMembers: any[];
  messages: any[];
  shippingAddresses?: any[];
  /** v3.1.30 新增：用户门店绑定关系 */
  userStoreBindings?: any[];
}

// ============================================
// 常量：所有 localStorage key
// ============================================

export const STORAGE_KEYS = {
  APP_CONFIG: 'saas:app-config',
  PROJECT: 'saas:project',
  USER: 'saas:user',
} as const;

// ============================================
// 通用工具
// ============================================

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[DataService] 读取 ${key} 失败，使用默认值`);
    return fallback;
  }
}

function safeSet(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[DataService] 写入 ${key} 失败:`, e);
  }
}

// ============================================
// 导出：持久化读写 API
// ============================================

export const dataService = {
  // ── AppConfig ──
  loadAppConfig(fallback: StoredAppConfig): StoredAppConfig {
    return safeGet(STORAGE_KEYS.APP_CONFIG, fallback);
  },
  saveAppConfig(data: StoredAppConfig): void {
    safeSet(STORAGE_KEYS.APP_CONFIG, data);
  },
  resetAppConfig(fallback: StoredAppConfig): StoredAppConfig {
    localStorage.removeItem(STORAGE_KEYS.APP_CONFIG);
    return fallback;
  },

  // ── Project ──
  loadProjectData(fallback: StoredProjectData): StoredProjectData {
    return safeGet(STORAGE_KEYS.PROJECT, fallback);
  },
  saveProjectData(data: StoredProjectData): void {
    safeSet(STORAGE_KEYS.PROJECT, data);
  },
  resetProjectData(fallback: StoredProjectData): StoredProjectData {
    localStorage.removeItem(STORAGE_KEYS.PROJECT);
    return fallback;
  },

  // ── User ──
  loadUserData(fallback: StoredUserData): StoredUserData {
    return safeGet(STORAGE_KEYS.USER, fallback);
  },
  saveUserData(data: StoredUserData): void {
    safeSet(STORAGE_KEYS.USER, data);
  },
  resetUserData(fallback: StoredUserData): StoredUserData {
    localStorage.removeItem(STORAGE_KEYS.USER);
    return fallback;
  },

  // ── 全部重置 ──
  resetAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  // ── 导出/导入（用于备份） ──
  exportAll(): Record<string, any> {
    const result: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const raw = localStorage.getItem(key);
      if (raw) result[name] = JSON.parse(raw);
    });
    return result;
  },
  importAll(data: Record<string, any>): void {
    Object.entries(data).forEach(([name, value]) => {
      const key = (STORAGE_KEYS as any)[name];
      if (key) safeSet(key, value);
    });
  },
};
