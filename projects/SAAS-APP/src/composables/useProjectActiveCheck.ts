/**
 * useProjectActiveCheck — 项目状态检查 composable（v3.1.37 新增）
 *
 * 用于在详情页、下单、支付等场景，检查项目是否 active。
 * 若项目 inactive，弹出 ElMessageBox 提示并 router.back() 返回上一页。
 *
 * 设计原则（BR-SHP-043 分层拦截 — Layer 2 路由层/详情层拦截）：
 *   - 查看详情/进入项目时检查所属项目 status
 *   - inactive 弹窗提示"项目已停用，暂无法访问"，点击确定后 router.back()
 *   - 下单/支付等交易行为同样需检查，inactive 拒绝
 */

import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useProjectStore } from '../stores/project-store';

export interface ProjectActiveCheckOptions {
  /** 自定义提示文案 */
  message?: string;
  /** 自定义弹窗标题 */
  title?: string;
  /** 项目不存在时的回调（默认 router.back） */
  onInactive?: () => void;
}

export function useProjectActiveCheck() {
  const projectStore = useProjectStore();
  const router = useRouter();

  /**
   * 检查项目是否 active，inactive 弹窗提示并返回上一页
   * @param projectId 项目ID
   * @param options 配置选项
   * @returns Promise<boolean> true=active（可继续），false=inactive或不存在（已拦截）
   */
  async function checkProjectActive(
    projectId: string,
    options?: ProjectActiveCheckOptions
  ): Promise<boolean> {
    const project = projectStore.getProjectById(projectId);
    if (!project) {
      await ElMessageBox.alert('项目不存在或已删除', options?.title || '提示', {
        type: 'warning',
        confirmButtonText: '返回',
      });
      if (options?.onInactive) {
        options.onInactive();
      } else {
        router.back();
      }
      return false;
    }
    if (project.status === 'inactive') {
      const msg = options?.message || `项目「${project.mall_name || project.name}」已停用，暂无法访问`;
      await ElMessageBox.alert(msg, options?.title || '提示', {
        type: 'warning',
        confirmButtonText: '返回',
      });
      if (options?.onInactive) {
        options.onInactive();
      } else {
        router.back();
      }
      return false;
    }
    return true;
  }

  /**
   * 同步检查项目是否 active（不弹窗），用于按钮禁用状态判断
   * @param projectId 项目ID
   * @returns boolean
   */
  function isProjectActive(projectId: string): boolean {
    return projectStore.isProjectActive(projectId);
  }

  return {
    checkProjectActive,
    isProjectActive,
  };
}
