/**
 * AppLayout — 多终端独立布局
 * 每个终端通过 URL 路径独立访问，可同时开 4 个标签页
 * /dashboard ...  → PC 后台（侧边栏 + 内容区）
 * /mp/*           → 微信小程序（头部 + 内容区，页面自带 MobileFrame）
 * /app/*          → APP 移动端（头部 + 内容区，页面自带 MobileFrame）
 * /live/*         → 直播端（头部 + 内容区，页面自带 MobileFrame）
 */
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge, Typography, theme } from 'antd';
import {
  DashboardOutlined, AuditOutlined, TeamOutlined, ShoppingOutlined, OrderedListOutlined,
  DollarOutlined, ThunderboltOutlined, BarChartOutlined, SettingOutlined,
  UserOutlined, LogoutOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  MedicineBoxOutlined, HomeOutlined, CalendarOutlined, PlayCircleOutlined,
  VideoCameraOutlined, TagOutlined, MessageOutlined, ShopOutlined,
  SafetyCertificateOutlined, ExperimentOutlined, CoffeeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import ErrorBoundary from '@/components/ErrorBoundary';

const { Sider, Content, Header } = Layout;

type TerminalId = 'pc' | 'mp' | 'app' | 'live';

const LOGO_INFO: Record<TerminalId, { label: string; sub: string }> = {
  pc: { label: 'SugarMate 后台', sub: 'PC业务管理中心' },
  mp: { label: 'SugarMate 小程序', sub: 'C端微信小程序' },
  app: { label: 'SugarMate APP', sub: '多角色移动端' },
  live: { label: 'SugarMate 直播', sub: '直播推流/带货' },
};

/** 根据当前 URL 推导终端类型 */
function detectTerminal(pathname: string): TerminalId {
  if (pathname.startsWith('/mp')) return 'mp';
  if (pathname.startsWith('/app')) return 'app';
  // /live-mgmt/* 是 PC 后台的直播管理模块，不是独立直播端
  if (pathname.startsWith('/live-mgmt')) return 'pc';
  if (pathname.startsWith('/live')) return 'live';
  return 'pc';
}

const MENU_ITEMS = [
  { key: 'workspace', label: '工作台', icon: <DashboardOutlined />,
    children: [{ key: '/dashboard', label: '首页概览' }] },
  { key: 'onboarding', label: '入驻管理', icon: <AuditOutlined />,
    children: [
      { key: '/onboarding', label: '入驻审核工作台' },
    ] },
  { key: 'personnel', label: '商家与人员', icon: <TeamOutlined />,
    children: [
      { key: '/merchants', label: '药房管理' },
      { key: '/doctors', label: '医生管理' },
      { key: '/pharmacists', label: '药师管理' },
      { key: '/nutritionists', label: '营养师管理' },
    ] },
  { key: 'compliance', label: '合规运营', icon: <MedicineBoxOutlined />,
    children: [
      { key: '/certificates', label: '资质证照中心' },
      { key: '/contracts', label: '合同管理' },
      { key: '/ratings', label: '商家评级' },
      { key: '/config-center', label: '商家配置' },
    ] },
  { key: 'scrm', label: 'SCRM', icon: <MessageOutlined />,
    children: [
      { key: '/scrm/customers', label: '客户池' },
      { key: '/scrm/tags', label: '标签分组' },
      { key: '/scrm/sop', label: 'SOP自动化' },
      { key: '/scrm/campaign', label: '群发管理' },
      { key: '/scrm/conversion', label: '转化分析' },
      { key: '/scrm/conversations', label: '会话存档' },
      { key: '/scrm/leads', label: '线索管理' },
    ] },
  { key: 'pharmacy', label: '药店管理', icon: <ShopOutlined />,
    children: [
      { key: '/pharmacy/rx', label: '处方药管理' },
      { key: '/pharmacy/otc', label: '非处方药管理' },
      { key: '/pharmacy/devices', label: '医疗器械' },
      { key: '/pharmacy/supplements', label: '保健品' },
      { key: '/pharmacy/prescriptions', label: '处方管理' },
      { key: '/pharmacy/orders', label: '订单管理' },
      { key: '/pharmacy/coldchain', label: '冷链监控' },
      { key: '/pharmacy/aftersale', label: '售后工单' },
    ] },
  { key: 'product-review', label: '商品审核', icon: <SafetyCertificateOutlined />,
    children: [
      { key: '/products-review', label: '商品审核' },
      { key: '/otc-review', label: 'OTC审核' },
      { key: '/categories', label: '商品分类' },
    ] },
  { key: 'finance', label: '财务管理', icon: <DollarOutlined />,
    children: [
      { key: '/finance/settlements', label: '结算管理' },
      { key: '/finance/reconciliation', label: '对账报表' },
      { key: '/finance/split-config', label: '分账配置' },
    ] },
  { key: 'operations', label: '运营管理', icon: <ThunderboltOutlined />,
    children: [
      { key: '/ops/banners', label: 'Banner管理' },
      { key: '/ops/content-review', label: '内容审核' },
      { key: '/ops/activities', label: '活动管理' },
      { key: '/ops/tickets', label: '客服工单' },
      { key: '/ops/complaints', label: '投诉纠纷' },
    ] },
  { key: 'consultation', label: '问诊管理', icon: <MedicineBoxOutlined />,
    children: [
      { key: '/consultation/monitor', label: '问诊监控' },
      { key: '/consultation/services', label: '服务管理' },
      { key: '/consultation/orders', label: '订单管理' },
    ] },
  { key: 'live-mgmt', label: '直播管理', icon: <VideoCameraOutlined />,
    children: [
      { key: '/live-mgmt/plans', label: '开播计划管理' },
      { key: '/live-mgmt/sessions', label: '场次管理' },
      { key: '/live-mgmt/rooms', label: '直播间管理' },
      { key: '/live-mgmt/products', label: '直播商品配置' },
      { key: '/live-mgmt/marketing', label: '营销活动' },
      { key: '/live-mgmt/interaction', label: '互动管理' },
    ] },
  { key: 'analytics', label: '数据分析', icon: <BarChartOutlined />,
    children: [{ key: '/data/dashboard', label: '经营看板' }] },
  { key: 'system', label: '系统设置', icon: <SettingOutlined />,
    children: [
      { key: '/system/roles', label: '角色权限' },
      { key: '/system/config', label: '系统配置' },
    ] },
];

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isLoggedIn } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const terminal = detectTerminal(location.pathname);
  const isPC = terminal === 'pc';
  const info = LOGO_INFO[terminal];

  // 直播中控台/推流端：沉浸式全屏页面，Content 区域去掉白边卡片样式
  const isLiveFullScreen =
    location.pathname === '/live-mgmt/control' ||
    location.pathname === '/live-mgmt/stream';

  // PC 侧边栏菜单打开状态（受控模式 — 修复 defaultOpenKeys 仅首次生效的 BUG）
  const [openKeys, setOpenKeys] = useState<string[]>(() =>
    MENU_ITEMS
      .filter(group => group.children?.some(child => location.pathname.startsWith(child.key)))
      .map(group => group.key)
  );

  // 路由变化时自动展开对应菜单组（不影响已手动词展开的组）
  useEffect(() => {
    const routeOpenKeys = MENU_ITEMS
      .filter(group => group.children?.some(child => location.pathname.startsWith(child.key)))
      .map(group => group.key);
    setOpenKeys(prev => [...new Set([...prev, ...routeOpenKeys])]);
  }, [location.pathname]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleOpenChange = (keys: string[]) => setOpenKeys(keys);

  // 登录守卫：未登录→重定向到门户（仅 PC 后台需要登录；MP/APP/LIVE/直播全屏页 免登录浏览原型）
  useEffect(() => {
    if (!isLoggedIn && isPC && !isLiveFullScreen) {
      navigate('/portal', { replace: true });
    }
  }, [isLoggedIn, isPC, isLiveFullScreen, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/portal'); // 退出后跳转到门户网站
  };

  const userMenuItems = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: handleLogout },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ====== PC 端侧边栏 ====== */}
      {isPC && !isLiveFullScreen && (
        <Sider
          trigger={null} collapsible collapsed={collapsed}
          width={220}
          style={{
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div style={{
            height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: `1px solid ${token.colorBorderSecondary}`, padding: '0 16px',
          }}>
            {!collapsed ? (
              <Space>
                <MedicineBoxOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
                <Typography.Title level={5} style={{ margin: 0, whiteSpace: 'nowrap' }}>
                  {info.label}
                </Typography.Title>
              </Space>
            ) : (
              <MedicineBoxOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            )}
          </div>
          <div style={{ height: 'calc(100vh - 64px)', overflowY: 'auto', overflowX: 'hidden' }}>
            <Menu
              mode="inline" selectedKeys={[location.pathname]}
              openKeys={openKeys} onOpenChange={handleOpenChange}
              onClick={handleMenuClick}
              items={MENU_ITEMS} style={{ border: 'none', marginTop: 8, paddingBottom: 24 }}
            />
          </div>
        </Sider>
      )}

      <Layout>
        {/* ====== 统一头部（无切换器，各终端独立标识） ====== */}
        {!isLiveFullScreen && (
          <Header style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            height: 64,
          }}>
            {/* 左侧：折叠按钮 + 返回首页 */}
            <Space size={12}>
              {/* 返回首页链接（所有终端都有） */}
              <Button
                type="text"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                style={{ fontSize: 16 }}
                title="返回终端首页"
              />

              {isPC && (
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ fontSize: 18, width: 40, height: 40 }}
                />
              )}

              {/* 终端标识 */}
              {!isPC && (
                <Space size={8}>
                  <MedicineBoxOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                  <Typography.Text strong>{info.label}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {info.sub}
                  </Typography.Text>
                </Space>
              )}
            </Space>

            {/* 右侧：用户信息 */}
            <Space size={20}>
              <Badge count={5} size="small">
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
              </Badge>
              <Dropdown menu={userMenuItems} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
                  <span>{user?.name || '管理员'}</span>
                </Space>
              </Dropdown>
            </Space>
          </Header>
        )}

        {/* ====== 内容区 ====== */}
        {isPC ? (
          <Content style={isLiveFullScreen ? {
            minHeight: '100vh',
            padding: 0,
            margin: 0,
            background: 'transparent',
          } : {
            margin: 24, padding: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            minHeight: 280,
          }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Content>
        ) : (
          <Content style={{
            background: '#f0f2f5',
            minHeight: isLiveFullScreen ? '100vh' : 'calc(100vh - 64px)',
          }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Content>
        )}
      </Layout>
    </Layout>
  );
};

export default AppLayout;
