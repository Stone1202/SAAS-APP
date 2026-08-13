/**
 * RequireAuth — 角色路由守卫
 * 基于用户Store中的身份信息检查页面访问权限
 * 
 * 使用方式:
 *   <Route path="/dashboard" element={<RequireAuth allowedRoles={['OPS','PH']}><Dashboard /></RequireAuth>} />
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button, Space, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

/** 系统角色类型（对齐 IdentitySchema role） */
export type UserRole = 'PATIENT' | 'DOCTOR' | 'NUTRITIONIST' | 'PH' | 'OPS';

interface RequireAuthProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

/**
 * 路由级权限守卫 — 未登录跳登录，无权限显示403
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles, children }) => {
  const { isLoggedIn, activeIdentity } = useUserStore();
  const location = useLocation();
  const currentRole = activeIdentity?.identity_role as UserRole | undefined;

  // 未登录 → 跳转登录页
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 无需权限检查或用户角色在允许列表中 → 放行
  if (!allowedRoles || allowedRoles.length === 0 || (currentRole && allowedRoles.includes(currentRole))) {
    return <>{children}</>;
  }

  return (
    <Result
      status="403"
      icon={<LockOutlined style={{ fontSize: 72 }} />}
      title="暂无访问权限"
      subTitle={
        <Space direction="vertical" size={4}>
          <span>当前角色 <Typography.Text strong>{currentRole || '未激活'}</Typography.Text> 无权访问此页面</span>
          {allowedRoles && <span>需要角色: {allowedRoles.join(', ')}</span>}
        </Space>
      }
      extra={
        <Button onClick={() => window.history.back()}>返回上一页</Button>
      }
    />
  );
};

/**
 * Hook — 在组件内手动检查角色权限
 */
export function useRoleGuard(allowedRoles?: UserRole[]) {
  const { isLoggedIn, activeIdentity } = useUserStore();
  const currentRole = activeIdentity?.identity_role as UserRole | undefined;
  const hasRole = !allowedRoles || allowedRoles.length === 0 || (!!currentRole && allowedRoles.includes(currentRole));
  return { hasRole, isLoggedIn, currentRole };
}

export default RequireAuth;
