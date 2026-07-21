import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Badge, Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  BankOutlined,
  AppstoreOutlined,
  DollarOutlined,
  RobotOutlined,
  DashboardOutlined,
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/ops/workbench',
    icon: <HomeOutlined />,
    label: '运营工作台',
  },
  {
    key: 'tenants',
    icon: <BankOutlined />,
    label: '租户管理',
    children: [
      { key: '/ops/tenants', label: '租户列表' },
    ],
  },
  {
    key: 'products',
    icon: <AppstoreOutlined />,
    label: '产品管理',
    children: [
      { key: '/ops/version-matrix', label: '版本矩阵配置' },
    ],
  },
  {
    key: 'transactions',
    icon: <DollarOutlined />,
    label: '交易管理',
    children: [
      { key: '/ops/subscriptions', label: '订阅与订单' },
    ],
  },
  {
    key: '/ops/ai-usage',
    icon: <RobotOutlined />,
    label: 'AI用量管理',
  },
  {
    key: '/ops/revenue',
    icon: <DashboardOutlined />,
    label: '营收分析',
  },
];

export default function OpsLayout() {
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
    { key: 'switch', label: '切换至租户后台' },
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
          {collapsed ? 'OPS' : 'AI-SCRM 运营'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={['tenants', 'products', 'transactions']}
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
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size={32} icon={<UserOutlined />} />
                <span style={{ fontSize: 14 }}>运营管理员</span>
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
