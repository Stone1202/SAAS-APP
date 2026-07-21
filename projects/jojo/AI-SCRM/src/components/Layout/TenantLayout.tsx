import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Badge, Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  MessageOutlined,
  RobotOutlined,
  ScheduleOutlined,
  DashboardOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/tenant/workbench',
    icon: <HomeOutlined />,
    label: '工作台',
  },
  {
    key: 'customers',
    icon: <TeamOutlined />,
    label: '客户管理',
    children: [
      { key: '/tenant/customers', label: '客户列表' },
      { key: '/tenant/tags', label: '标签管理' },
    ],
  },
  {
    key: 'communication',
    icon: <MessageOutlined />,
    label: '沟通中心',
    children: [
      { key: '/tenant/communication', label: '发起沟通' },
      { key: '/tenant/communication/records', label: '沟通记录' },
      { key: '/tenant/scripts', label: '话术库' },
    ],
  },
  {
    key: 'ai',
    icon: <RobotOutlined />,
    label: 'AI辅助',
    children: [
      { key: '/tenant/communication', label: '话术推荐' },
      { key: '/tenant/analytics/communication', label: '情绪监控看板' },
    ],
  },
  {
    key: 'followup',
    icon: <ScheduleOutlined />,
    label: '跟进管理',
    children: [
      { key: '/tenant/todos', label: '待办中心' },
      { key: '/tenant/calendar', label: '跟近日历' },
      { key: '/tenant/customer-360', label: '客户360视图' },
      { key: '/tenant/segmentation', label: '客户分群' },
    ],
  },
  {
    key: 'analytics',
    icon: <DashboardOutlined />,
    label: '数据看板',
    children: [
      { key: '/tenant/analytics/communication', label: '沟通分析' },
      { key: '/tenant/analytics/conversion', label: '转化漏斗' },
    ],
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '系统设置',
    children: [
      { key: '/tenant/settings', label: '团队管理' },
    ],
  },
];

export default function TenantLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    setSelectedKeys([location.pathname]);
  }, [location.pathname]);

  const onMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', label: '个人中心' },
    { key: 'logout', label: '退出登录', danger: true },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 600,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {collapsed ? 'AI' : 'AI-SCRM'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={['customers', 'communication', 'followup', 'analytics']}
          items={menuItems}
          onClick={onMenuClick}
        />
      </Sider>
      <Layout className={collapsed ? 'main-content-with-sider collapsed' : 'main-content-with-sider'}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F0F0F0',
          height: 64,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size={32} icon={<UserOutlined />} />
                <span style={{ fontSize: 14 }}>张经理</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
