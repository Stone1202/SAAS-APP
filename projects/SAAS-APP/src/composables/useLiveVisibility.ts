/**
 * useLiveVisibility — 直播可见范围权限 composable（v3.1.30）
 *
 * 设计目标：按 anchor_type 差异化过滤直播可见范围（邀请制私域运营）。
 *
 * 四种主播类型的默认权限策略：
 *   - store        门店主播：默认该邀请人绑定的用户可见，可排除指定邀请人
 *   - headquarters 总部主播：默认所有门店用户可见，可排除指定门店
 *   - supplier    供应商主播：默认所有项目用户可见，可排除指定项目
 *   - personal    个人主播：默认不对外，需主动指定可见邀请人（include 模式）
 *
 * 权限模式：
 *   - public  ：默认全可见（store/headquarters/supplier 默认）
 *   - exclude ：排除指定ID后全可见
 *   - include ：仅指定ID可见（personal 默认）
 *
 * 判断流程：
 *   1. 根据直播的 anchor_type 获取该用户对应的"身份ID"
 *      - store       → 用户的 inviter_id（通过哪个邀请人进来的）
 *      - headquarters → 用户绑定的 store_id
 *      - supplier    → 用户绑定的 project_id
 *      - personal    → 用户的 inviter_id
 *   2. 根据 visibility_config.mode 判断该身份ID是否在可见范围
 *
 * 使用示例：
 *   const { filterVisibleLives, isLiveVisible } = useLiveVisibility();
 *   const visibleLives = filterVisibleLives({
 *     lives: projectStore.liveRooms,
 *     userInviterId: 'inv-001',
 *     userStoreId: 'store-d-001',
 *     userProjectId: 'proj-daily-01',
 *   });
 */

import type { LiveRoom } from '../contracts';
import type { LiveVisibilityConfig, LiveVisibilityMode } from '../contracts/recommend-engine';

/** 直播可见范围过滤参数 */
export interface LiveVisibilityParams {
  /** 直播列表 */
  lives: LiveRoom[];
  /** 当前用户的邀请人ID（在当前项目下的邀请人） */
  userInviterId?: string;
  /** 当前用户绑定的门店ID */
  userStoreId?: string;
  /** 当前用户绑定的项目ID */
  userProjectId?: string;
}

/**
 * 直播可见范围权限 composable
 */
export function useLiveVisibility() {
  /**
   * 判断单条直播是否对用户可见
   */
  function isLiveVisible(live: LiveRoom, params: Omit<LiveVisibilityParams, 'lives'>): boolean {
    const config: LiveVisibilityConfig | undefined = live.visibility_config as any;
    // 无配置默认可见
    if (!config) return true;

    const mode: LiveVisibilityMode = config.mode || 'public';
    // public 模式：全可见
    if (mode === 'public') return true;

    // 根据 anchor_type 获取用户身份ID和排除列表
    const { checkIdentity, identityValue, excludeList, includeList } = resolveIdentity(live, params, config);

    // include 模式：仅指定ID可见
    if (mode === 'include') {
      if (!includeList || includeList.length === 0) return false;
      return includeList.includes(identityValue);
    }

    // exclude 模式：排除指定ID后全可见
    if (mode === 'exclude') {
      if (!excludeList || excludeList.length === 0) return true;
      return !excludeList.includes(identityValue);
    }

    return true;
  }

  /**
   * 过滤直播列表，仅返回对用户可见的直播
   */
  function filterVisibleLives(params: LiveVisibilityParams): LiveRoom[] {
    const { lives, ...rest } = params;
    return lives.filter(live => isLiveVisible(live, rest));
  }

  /**
   * 根据 anchor_type 解析用户身份ID和对应的排除/包含列表
   */
  function resolveIdentity(
    live: LiveRoom,
    params: Omit<LiveVisibilityParams, 'lives'>,
    config: LiveVisibilityConfig,
  ): {
    checkIdentity: string;
    identityValue: string;
    excludeList: string[];
    includeList: string[];
  } {
    const anchorType = live.anchor_type;
    let identityValue = '';
    let excludeList: string[] = [];
    let includeList: string[] = [];

    switch (anchorType) {
      case 'store':
        // 门店主播：按邀请人ID判断
        identityValue = params.userInviterId || '';
        excludeList = config.excluded_inviter_ids || [];
        includeList = config.included_inviter_ids || [];
        break;
      case 'headquarters':
        // 总部主播：按门店ID判断
        identityValue = params.userStoreId || '';
        excludeList = config.excluded_store_ids || [];
        includeList = []; // headquarters 不使用 include
        break;
      case 'supplier':
        // 供应商主播：按项目ID判断
        identityValue = params.userProjectId || '';
        excludeList = config.excluded_project_ids || [];
        includeList = []; // supplier 不使用 include
        break;
      case 'personal':
        // 个人主播：按邀请人ID判断（默认 include 模式）
        identityValue = params.userInviterId || '';
        excludeList = config.excluded_inviter_ids || [];
        includeList = config.included_inviter_ids || [];
        break;
      default:
        identityValue = '';
        break;
    }

    return {
      checkIdentity: anchorType,
      identityValue,
      excludeList,
      includeList,
    };
  }

  return {
    isLiveVisible,
    filterVisibleLives,
  };
}
