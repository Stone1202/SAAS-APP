/**
 * useAppNavigation — APP端跳转解析器（v3.1.44 新增 / v3.1.45 增强）
 *
 * 职责：当用户在 APP 端点击 Banner/金刚区/搜索结果时，
 *       根据 jump_type 和 jump_id 解析出正确的路由并执行跳转。
 *
 * 支持的跳转类型：
 *   - product:       商品详情页 /app/product/:productId
 *   - project:       项目首页 /app/project/:projectId
 *   - live:          直播详情页 /app/live/:liveId
 *   - function_page: 功能页面（从注册表查询 app_route 后跳转）← v3.1.44 新增
 *   - url:           旧数据兼容（直接 router.push 或 window.open）← v3.1.45 回退处理
 *
 * v3.1.45 增强：
 *   - 新增 navigateByJumpType(jumpType, jumpId, projectId, link?) 扁平参数入口
 *   - 支持 link 字段 fallback（function_page 未注册时使用 link 回退）
 *   - 自动处理 :projectId 占位符替换 + query 参数解析
 *   - 兼容旧 url 数据（由 store.migrateLegacyJumpType 自动迁移）
 *
 * 使用方式：
 *   import { useAppNavigation } from '@/composables/useAppNavigation';
 *   const { navigateByJumpType } = useAppNavigation();
 *   navigateByJumpType('function_page', 'fp-mine', '', '');
 */

import { useRouter } from 'vue-router';
import { useAppConfigStore } from '../stores/app-config-store';

export interface JumpTarget {
  jump_type: string;
  jump_id: string;
  project_id?: string;
}

export function useAppNavigation() {
  const router = useRouter();
  const store = useAppConfigStore();

  /**
   * 根据跳转目标执行导航
   *
   * @param target - 跳转目标（包含 jump_type/jump_id/project_id）
   *
   * 支持的跳转类型：
   *   product       → /app/product/:productId
   *   project       → /app/project/:projectId
   *   live          → /app/live/:liveId
   *   function_page → 查询注册表 → 替换 :projectId → router.push
   */
  function navigate(target: JumpTarget): void {
    if (!target.jump_id) {
      router.push('/app/home');
      return;
    }

    switch (target.jump_type) {
      case 'product':
        router.push(`/app/product/${target.jump_id}`);
        break;

      case 'project':
        router.push(`/app/project/${target.jump_id}`);
        break;

      case 'live':
        router.push(`/app/live/${target.jump_id}`);
        break;

      case 'function_page': {
        // v3.1.44 新增：功能页面跳转（从注册表解析路由）
        const fp = store.getFunctionPage(target.jump_id);
        if (!fp) {
          // 功能页面不存在或已禁用 → fallback 首页
          console.warn(`[useAppNavigation] function_page not found or disabled: ${target.jump_id}, fallback to home`);
          router.push('/app/home');
          return;
        }

        let route = fp.app_route;

        // 替换 :projectId 占位符
        // - 优先使用传入的 project_id
        // - 若路由不含 :projectId 则直接使用
        const pid = target.project_id || '';
        if (pid && route.includes(':projectId')) {
          route = route.replace(':projectId', pid);
        } else if (route.includes(':projectId')) {
          // 有占位符但没有 projectId → 仍尝试跳转（路由守卫会处理）
          console.warn(`[useAppNavigation] :projectId placeholder found but no project_id provided for ${target.jump_id}`);
        }

        // 带 query 参数的路由（如 /app/mall?tab=live）
        if (route.includes('?')) {
          const [path, queryStr] = route.split('?');
          const params = new URLSearchParams(queryStr);
          const query: Record<string, string> = {};
          params.forEach((value, key) => {
            query[key] = value;
          });
          router.push({ path, query });
        } else {
          router.push(route);
        }
        break;
      }

      default:
        // 未知类型或旧 url 类型 → fallback 首页
        console.warn(`[useAppNavigation] unknown jump_type: ${target.jump_type}, fallback to home`);
        router.push('/app/home');
    }
  }

  /**
   * v3.1.45 新增：统一跳转入口（扁平参数，替代旧 JumpTarget 对象式调用）
   *
   * @param jumpType  跳转类型：product/project/live/function_page/url
   * @param jumpId    跳转目标 ID（function_page 时为 page_id）
   * @param projectId 项目 ID（用于 :projectId 占位符替换，可选）
   * @param link      旧 link 字段（fallback 用，可选）
   *
   * 处理顺序：
   *   1. product/project/live → 直接拼接路由
   *   2. function_page → 查注册表 + 替换 :projectId + 解析 query
   *   3. url → 直接 router.push（APP 内部路由）或 window.open（外部）
   *   4. 未知类型 + link 非空 → link fallback
   *   5. 都无效 → fallback 到 /app/home
   *
   * 兼容性：同时支持旧 url 数据（由 store.migrateLegacyJumpType 自动迁移）
   */
  function navigateByJumpType(
    jumpType: string,
    jumpId: string,
    projectId?: string,
    link?: string
  ): void {
    // 1. 直接路由类型
    if (jumpType === 'product' && jumpId) {
      router.push(`/app/product/${jumpId}`);
      return;
    }
    if (jumpType === 'project' && jumpId) {
      router.push(`/app/project/${jumpId}`);
      return;
    }
    if (jumpType === 'live' && jumpId) {
      router.push(`/app/live/${jumpId}`);
      return;
    }

    // 2. function_page：查注册表解析
    if (jumpType === 'function_page' && jumpId) {
      const fp = store.getFunctionPage(jumpId);
      if (!fp) {
        console.warn(`[useAppNavigation] function_page not found or disabled: ${jumpId}, fallback to home`);
        // page_id 不在注册表 → 尝试 link 回退
        if (link && link.startsWith('/')) {
          router.push(link);
          return;
        }
        router.push('/app/home');
        return;
      }
      let route = fp.app_route;
      const pid = projectId || '';
      if (pid && route.includes(':projectId')) {
        route = route.replace(':projectId', pid);
      } else if (route.includes(':projectId')) {
        console.warn(`[useAppNavigation] :projectId placeholder found but no project_id provided for ${jumpId}`);
      }
      // 解析 query（如 /app/mall?tab=live）
      if (route.includes('?')) {
        const [path, queryStr] = route.split('?');
        const params = new URLSearchParams(queryStr);
        const query: Record<string, string> = {};
        params.forEach((value, key) => { query[key] = value; });
        router.push({ path, query });
      } else {
        router.push(route);
      }
      return;
    }

    // 3. url 类型（旧数据兼容）
    if (jumpType === 'url' && jumpId) {
      if (jumpId.startsWith('/')) router.push(jumpId);
      else window.open(jumpId, '_blank');
      return;
    }

    // 4. 未知类型 → link 回退
    if (link && link.startsWith('/')) {
      router.push(link);
      return;
    }

    // 5. 兜底
    console.warn(`[useAppNavigation] unknown jump_type: ${jumpType}, no valid link, fallback to home`);
    router.push('/app/home');
  }

  /**
   * 仅解析路由（不执行跳转）
   * 用于需要在跳转前做额外处理的场景
   */
  function resolveRoute(target: JumpTarget): string {
    switch (target.jump_type) {
      case 'product':
        return `/app/product/${target.jump_id}`;
      case 'project':
        return `/app/project/${target.jump_id}`;
      case 'live':
        return `/app/live/${target.jump_id}`;
      case 'function_page': {
        const route = store.resolveFunctionPageRoute(target.jump_id, target.project_id);
        return route;
      }
      default:
        return '/app/home';
    }
  }

  return { navigate, navigateByJumpType, resolveRoute };
}
