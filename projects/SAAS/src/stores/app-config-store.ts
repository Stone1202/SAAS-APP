/**
 * APP 运营配置 Store（接入持久化服务）
 *
 * 管理 APP 首页所有运营后台配置的数据，包括：
 * - 搜索管理：热搜词、底纹词、自定义搜索结果
 * - Banner 广告管理
 * - 金刚区管理
 * - 直播推荐管理（手动推荐 + 规则推荐）
 * - 商品推荐管理（手动推荐 + 规则推荐）
 * - 运营楼层管理
 *
 * 数据持久化：
 *   所有 ref 变更通过 watch 自动同步到 localStorage，
 *   页面刷新后从 localStorage 恢复。
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { dataService, type StoredAppConfig } from '../services/data-service';
import type { AdBanner, KingKongEntry, Floor } from '../contracts';

// ============================================
// 类型定义
// ============================================

/** 热搜词 */
export interface HotWord {
  word: string;
  fixed?: boolean;
  weight: number;
  status: 'active' | 'disabled';
  badge?: 'hot' | 'fire' | 'new' | 'popular' | 'recommend' | 'sale';
  csr_id?: string;
}

/** 自定义搜索结果项 */
export interface CustomSearchResult {
  item_id: string;
  title: string;
  description: string;
  icon?: string;
  gradient?: string;
  jump_type: 'product' | 'project' | 'live' | 'url';
  jump_id: string;
  project_id?: string;
  store_id?: string;
  status: 'active' | 'disabled';
}

/** 推荐配置项（直播/商品通用） */
export interface RecommendItem {
  rec_id: string;
  rec_type: 'manual' | 'rule';
  target_id: string;
  rule?: RecommendRule;
  status: 'active' | 'disabled';
}

/** 推荐规则 */
export interface RecommendRule {
  rule_type: 'status' | 'viewer_count' | 'sales' | 'category' | 'created_at' | 'fixed';
  params?: Record<string, any>;
}

// ============================================
// 默认值（首次使用时初始化）
// ============================================

const DEFAULT_CONFIG: StoredAppConfig = {
  searchHint: '搜索商品、直播、项目',
  hotWordConfigs: [
    { word: '智能拖把', fixed: true, weight: 100, status: 'active', badge: 'hot', csr_id: 'csr-001' },
    { word: '便携榨汁机', fixed: true, weight: 95, status: 'active', badge: 'fire', csr_id: 'csr-002' },
    { word: '蓝牙耳机', fixed: false, weight: 90, status: 'active', badge: 'new', csr_id: 'csr-003' },
    { word: '瑜伽垫', fixed: false, weight: 85, status: 'active', badge: 'popular' },
    { word: '围炉煮茶器具', fixed: false, weight: 80, status: 'active', badge: 'recommend' },
    { word: '保温壶', fixed: false, weight: 75, status: 'active' },
    { word: '收纳盒', fixed: false, weight: 70, status: 'active', badge: 'sale' },
    { word: '洗衣凝珠', fixed: false, weight: 65, status: 'active' },
    { word: '便当盒', fixed: false, weight: 60, status: 'active', badge: 'new' },
    { word: '跑鞋', fixed: false, weight: 55, status: 'active', badge: 'hot' },
  ],
  customSearchResults: [
    {
      item_id: 'csr-001', title: '🔥 热卖爆款 — 智能蒸汽拖把',
      description: '高温杀菌，深度清洁，限时特价 ¥299',
      icon: '🧹', gradient: 'linear-gradient(135deg, #FF6B35, #FF8F35)',
      jump_type: 'product', jump_id: 'prod-001',
      project_id: 'proj-daily-01', store_id: 'store-daily-01', status: 'active',
    },
    {
      item_id: 'csr-002', title: '✨ 网红同款 — 便携榨汁杯',
      description: '无线充电，一键榨汁，夏日必备',
      icon: '🧃', gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      jump_type: 'product', jump_id: 'prod-006',
      project_id: 'proj-kitchen-02', store_id: 'store-kitchen-02', status: 'active',
    },
    {
      item_id: 'csr-003', title: '🎧 品质之选 — 降噪蓝牙耳机',
      description: '主动降噪，30小时续航，沉浸式体验',
      icon: '🎧', gradient: 'linear-gradient(135deg, #0F2027, #203A43)',
      jump_type: 'product', jump_id: 'prod-010',
      project_id: 'proj-digital-04', store_id: 'store-digital-02', status: 'active',
    },
  ],
  adBanners: [
    {
      ad_id: 'ad-001', title: '新品首发 — 全场低至5折',
      image_url: '', position: 'platform_home',
      sort_order: 0, status: 'active', start_time: '2026-01-01', end_time: '2026-12-31',
      jump_type: 'project', jump_id: 'proj-daily-01', project_id: 'proj-daily-01',
    },
    {
      ad_id: 'ad-002', title: '会员专享 — 积分兑换好礼',
      image_url: '', position: 'platform_home',
      sort_order: 1, status: 'active', start_time: '2026-01-01', end_time: '2026-12-31',
      jump_type: 'url', jump_id: '/app/mine/member', project_id: '',
    },
    {
      ad_id: 'ad-003', title: '限时特惠 — 每日秒杀进行中',
      image_url: '', position: 'platform_home',
      sort_order: 2, status: 'active', start_time: '2026-01-01', end_time: '2026-12-31',
      jump_type: 'project', jump_id: 'proj-health-01', project_id: 'proj-health-01',
    },
  ],
  kingKongs: [
    { entry_id: 'kk-001', icon: '🔥', label: '热卖排行', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #FF6B6B, #EE5A24)', sort_order: 0 },
    { entry_id: 'kk-002', icon: '✨', label: '新品首发', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', sort_order: 1 },
    { entry_id: 'kk-003', icon: '🎟️', label: '领券中心', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', sort_order: 2 },
    { entry_id: 'kk-004', icon: '📺', label: '直播间', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', sort_order: 3 },
    { entry_id: 'kk-005', icon: '📅', label: '每日签到', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', sort_order: 4 },
    { entry_id: 'kk-006', icon: '🎁', label: '试用中心', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', sort_order: 5 },
    { entry_id: 'kk-007', icon: '🏆', label: '品牌榜', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', sort_order: 6 },
    { entry_id: 'kk-008', icon: '📋', label: '全部分类', link: '/app/mall', status: 'active', gradient: 'linear-gradient(135deg, #f5af19, #f12711)', sort_order: 7 },
  ],
  liveRecommendConfigs: [
    { rec_id: 'lr-001', rec_type: 'manual', target_id: 'live-001', status: 'active' },
    { rec_id: 'lr-002', rec_type: 'manual', target_id: 'live-002', status: 'active' },
    { rec_id: 'lr-003', rec_type: 'rule', target_id: '', rule: { rule_type: 'viewer_count', params: { limit: 4 } }, status: 'active' },
  ],
  productRecommendConfigs: [
    { rec_id: 'pr-001', rec_type: 'manual', target_id: 'prod-001', status: 'active' },
    { rec_id: 'pr-002', rec_type: 'manual', target_id: 'prod-005', status: 'active' },
    { rec_id: 'pr-003', rec_type: 'rule', target_id: '', rule: { rule_type: 'sales', params: { limit: 4 } }, status: 'active' },
  ],
  floors: [
    { floor_id: 'floor-001', title: '品质家居', type: 'product', product_ids: ['prod-001', 'prod-002', 'prod-003', 'prod-004'], position: 'platform_home', sort_order: 0, status: 'active' },
    { floor_id: 'floor-002', title: '数码好物', type: 'product', product_ids: ['prod-009', 'prod-010', 'prod-011', 'prod-012'], position: 'platform_home', sort_order: 1, status: 'active' },
  ],
  unreadCount: 2,
};

// ============================================
// Store
// ============================================

export const useAppConfigStore = defineStore('app-config', () => {
  // ── 从 localStorage 加载初始数据 ──
  const saved = dataService.loadAppConfig(DEFAULT_CONFIG);

  // ============================================
  // 搜索管理
  // ============================================

  const searchHint = ref(saved.searchHint);
  const hotWordConfigs = ref<HotWord[]>(saved.hotWordConfigs);
  const customSearchResults = ref<CustomSearchResult[]>(saved.customSearchResults);

  /** 热搜词列表（从 hotWordConfigs 派生） */
  const hotWords = ref<string[]>(
    saved.hotWordConfigs
      .filter(h => h.status === 'active')
      .sort((a, b) => b.weight - a.weight)
      .map(h => h.word)
  );

  // ============================================
  // Banner 广告管理
  // ============================================

  const adBanners = ref<AdBanner[]>(saved.adBanners as any);

  const bannersByPosition = computed(() => (position: string) =>
    adBanners.value
      .filter(b => b.position === position && b.status === 'active')
      .sort((a, b) => a.sort_order - b.sort_order)
  );

  // ============================================
  // 金刚区管理
  // ============================================

  const kingKongs = ref<KingKongEntry[]>(saved.kingKongs as any);

  const enabledKingKongs = computed(() =>
    kingKongs.value
      .filter(k => k.status === 'active')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );

  // ============================================
  // 直播推荐管理
  // ============================================

  const liveRecommendConfigs = ref<RecommendItem[]>(saved.liveRecommendConfigs);

  const liveRecommends = computed(() =>
    liveRecommendConfigs.value.filter(r => r.rec_type === 'manual' && r.status === 'active')
  );

  // ============================================
  // 商品推荐管理
  // ============================================

  const productRecommendConfigs = ref<RecommendItem[]>(saved.productRecommendConfigs);

  const productRecommends = computed(() =>
    productRecommendConfigs.value.filter(r => r.rec_type === 'manual' && r.status === 'active')
  );

  // ============================================
  // 运营楼层管理
  // ============================================

  const floors = ref<Floor[]>(saved.floors as any);

  const floorsByPosition = computed(() => (position: string) =>
    floors.value
      .filter(f => f.position === position && f.status === 'active')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );

  // ============================================
  // 通用
  // ============================================

  const unreadCount = ref(saved.unreadCount);

  // ============================================
  // 持久化：watch 自动保存
  // ============================================

  /** 构建完整快照 */
  function snapshot(): StoredAppConfig {
    return {
      searchHint: searchHint.value,
      hotWordConfigs: JSON.parse(JSON.stringify(hotWordConfigs.value)),
      customSearchResults: JSON.parse(JSON.stringify(customSearchResults.value)),
      adBanners: JSON.parse(JSON.stringify(adBanners.value)),
      kingKongs: JSON.parse(JSON.stringify(kingKongs.value)),
      liveRecommendConfigs: JSON.parse(JSON.stringify(liveRecommendConfigs.value)),
      productRecommendConfigs: JSON.parse(JSON.stringify(productRecommendConfigs.value)),
      floors: JSON.parse(JSON.stringify(floors.value)),
      unreadCount: unreadCount.value,
    };
  }

  // 监听所有状态变更，自动保存到 localStorage
  watch(
    [searchHint, hotWordConfigs, customSearchResults, adBanners, kingKongs, liveRecommendConfigs, productRecommendConfigs, floors, unreadCount],
    () => dataService.saveAppConfig(snapshot()),
    { deep: true }
  );

  // ============================================
  // 辅助方法
  // ============================================

  /** 同步 hotWords（从 hotWordConfigs 派生） */
  function syncHotWords() {
    hotWords.value = hotWordConfigs.value
      .filter(h => h.status === 'active')
      .sort((a, b) => b.weight - a.weight)
      .map(h => h.word);
  }

  return {
    // 搜索管理
    searchHint,
    hotWords,
    hotWordConfigs,
    customSearchResults,
    syncHotWords,
    // Banner
    adBanners,
    bannersByPosition,
    // 金刚区
    kingKongs,
    enabledKingKongs,
    // 直播推荐
    liveRecommendConfigs,
    liveRecommends,
    // 商品推荐
    productRecommendConfigs,
    productRecommends,
    // 楼层
    floors,
    floorsByPosition,
    // 通用
    unreadCount,
  };
});
