/**
 * 登录页 —— 支持手机号验证码登录，按角色分发跳转
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const { Title, Text } = Typography;

/** 角色 → 默认跳转路径 */
const ROLE_ROUTE_MAP: Record<string, string> = {
  PATIENT: '/app/home',
  DOCTOR: '/app/doctor/workbench',
  NUTRITIONIST: '/app/nutritionist/workbench',
  PHARMACIST: '/app/pharmacy/workbench',
  ADMIN: '/dashboard',
  PH: '/dashboard',
  CUSTOMER: '/dashboard',
  OPS: '/dashboard',
};

/** 根据当前激活身份获取跳转路径 */
function getRoleRoute(): string {
  const { activeIdentity } = useUserStore.getState();
  if (activeIdentity?.identity_role) {
    return ROLE_ROUTE_MAP[activeIdentity.identity_role] || '/portal';
  }
  // 无激活身份 → 门户选择身份
  return '/portal';
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, loginLoading } = useUserStore();
  const [countdown, setCountdown] = useState(0);

  const sendCode = () => {
    const phone = form.getFieldValue('phone');
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入正确的手机号');
      return;
    }
    message.success('验证码已发送（模拟环境：输入任意6位数字）');
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (values: { phone: string; code: string }) => {
    try {
      await login(values.phone, values.code, 'APP', 'browser_' + Date.now());
      message.success('登录成功');
      // 按角色分发跳转
      const route = getRoleRoute();
      navigate(route, { replace: true });
    } catch (e: any) {
      message.error(e.message || '登录失败');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--color-primary) 0%, #90CAF9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 4 }}>糖伴 SugarMate</Title>
          <Text type="secondary">糖尿病智慧健康管理平台</Text>
        </div>

        <Form form={form} onFinish={handleLogin} size="large">
          <Form.Item name="phone" rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="手机号" maxLength={11} />
          </Form.Item>

          <Form.Item name="code" rules={[{ required: true, len: 6, message: '请输入6位验证码' }]}>
            <Space.Compact style={{ width: '100%' }}>
              <Input prefix={<SafetyOutlined />} placeholder="验证码" maxLength={6} style={{ flex: 1 }} />
              <Button type="primary" ghost onClick={sendCode} disabled={countdown > 0}>
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loginLoading} block>
              登录 / 注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            致谢提示：新用户自动注册 · 模拟环境输入任意6位验证码即可
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
