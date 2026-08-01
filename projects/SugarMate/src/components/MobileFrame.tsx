/**
 * MobileFrame — 手机框模拟器
 * 用于 MP/APP/LIVE 端在 PC 原型中以手机框形式展示
 */
import React, { useState } from 'react';
import { Layout, Segmented, theme } from 'antd';
import {
  LeftOutlined,
  HomeOutlined,
  SearchOutlined,
  ShoppingOutlined,
  MessageOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  CrownOutlined,
  UserOutlined,
  EditOutlined,
  ReadOutlined,
  PlayCircleOutlined,
  ScheduleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Content, Footer } = Layout;

export interface MobileTab {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface Props {
  title?: string;
  tabs?: MobileTab[];
  basePath: string;
  children: React.ReactNode;
}

const MobileFrame: React.FC<Props> = ({ title = 'SugarMate', tabs = [], basePath, children }) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = tabs.find(t => location.pathname === t.path || location.pathname.startsWith(t.path + '/'))
    ?.key || tabs[0]?.key;

  const handleTabChange = (val: string | number) => {
    const tab = tabs.find(t => t.key === val);
    if (tab) navigate(tab.path);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: 20,
    }}>
      {/* 手机外框 */}
      <div style={{
        width: 390,
        minHeight: 740,
        maxHeight: 'calc(100vh - 60px)',
        overflow: 'hidden',
        border: `8px solid #333`,
        borderRadius: 40,
        backgroundColor: '#f5f5f5',
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 状态栏 */}
        <div style={{
          height: 36,
          background: token.colorPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          color: '#fff',
          fontSize: 11,
          fontWeight: 500,
        }}>
          <span>9:41</span>
          <span>{title}</span>
          <span>🔋 ▮▮▮▮</span>
        </div>

        {/* 内容区 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: token.colorBgLayout,
        }}>
          {children}
        </div>

        {/* 底部 Tab Bar */}
        {tabs.length > 0 && (
          <Footer style={{
            padding: 0,
            height: 56,
            backgroundColor: '#fff',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Segmented
              block
              value={currentTab}
              onChange={handleTabChange}
              options={tabs.map(t => ({
                value: t.key,
                icon: t.icon,
                label: (
                  <div style={{ fontSize: 10, marginTop: -2 }}>
                    {t.label}
                  </div>
                ),
              }))}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                padding: '4px 8px',
              }}
            />
          </Footer>
        )}
      </div>
    </div>
  );
};

export default MobileFrame;

// ============ 预定义 Tab 集 ============

/** MP 微信小程序 Tabs（PRD v3.1.0: 4 Tab 首页/附近/咨询/我的） */
export const MP_TABS: MobileTab[] = [
  { key: 'home',      label: '首页',     icon: <HomeOutlined />,        path: '/mp/home' },
  { key: 'nearby',    label: '附近',     icon: <EnvironmentOutlined />,  path: '/mp/nearby' },
  { key: 'consult',   label: '咨询',     icon: <MessageOutlined />,     path: '/mp/consult' },
  { key: 'mine',      label: '我的',     icon: <UserOutlined />,        path: '/mp/mine' },
];

/** APP 患者视图 Tabs */
/** APP 患者视图 Tabs（v2.0：移除服务Tab，服务内容整合至首页） */
export const APP_PATIENT_TABS: MobileTab[] = [
  { key: 'home',      label: '首页',     icon: <HomeOutlined />,       path: '/app/home' },
  { key: 'community', label: '社区',     icon: <TeamOutlined />,       path: '/app/community' },
  { key: 'member',    label: '会员',     icon: <CrownOutlined />,      path: '/app/member' },
  { key: 'mine',      label: '我的',     icon: <UserOutlined />,       path: '/app/mine' },
];

/** APP 医生视图 Tabs */
export const APP_DOCTOR_TABS: MobileTab[] = [
  { key: 'workbench', label: '工作台',   icon: <HomeOutlined />,      path: '/app/doctor/workbench' },
  { key: 'consult',   label: '问诊',     icon: <MessageOutlined />,   path: '/app/doctor/consult' },
  { key: 'patients',  label: '患者',     icon: <UserOutlined />,      path: '/app/doctor/patients' },
  { key: 'live',      label: '直播',     icon: <PlayCircleOutlined />,path: '/app/doctor/live' },
  { key: 'mine',      label: '我的',     icon: <UserOutlined />,      path: '/app/doctor/mine' },
];

/** APP 营养师视图 Tabs */
export const APP_NUTRITIONIST_TABS: MobileTab[] = [
  { key: 'workbench', label: '工作台',   icon: <HomeOutlined />,      path: '/app/nutritionist/workbench' },
  { key: 'patients',  label: '患者',     icon: <UserOutlined />,      path: '/app/nutritionist/patients' },
  { key: 'diet',      label: '饮食方案', icon: <EditOutlined />,      path: '/app/nutritionist/diet' },
  { key: 'live',      label: '直播',     icon: <PlayCircleOutlined />,path: '/app/nutritionist/live' },
  { key: 'mine',      label: '我的',     icon: <UserOutlined />,      path: '/app/nutritionist/mine' },
];


/** LIVE 主播端 Tabs（发起直播 / 商品管理 / 互动 / 数据 / 我的） */
export const LIVE_BROADCASTER_TABS: MobileTab[] = [
  { key: 'room',      label: '开播',     icon: <PlayCircleOutlined />,path: '/live/room' },
  { key: 'products',  label: '商品',     icon: <ShoppingOutlined />,   path: '/live/products' },
  { key: 'interact',  label: '互动',     icon: <MessageOutlined />,    path: '/live/interact' },
  { key: 'data',      label: '数据',     icon: <ReadOutlined />,       path: '/live/data' },
  { key: 'mine',      label: '我的',     icon: <UserOutlined />,       path: '/live/mine' },
];

/** APP 健康管理师视图 Tabs */
export const APP_HM_TABS: MobileTab[] = [
  { key: 'workbench', label: '工作台',   icon: <HomeOutlined />,        path: '/app/hm/workbench' },
  { key: 'patients',  label: '患者',     icon: <TeamOutlined />,        path: '/app/hm/patients' },
  { key: 'visit',     label: '家访',     icon: <EnvironmentOutlined />,  path: '/app/hm/visit' },
  { key: 'mine',      label: '我的',     icon: <UserOutlined />,        path: '/app/hm/mine' },
];

/** @deprecated — 旧观众视角 Tabs，保留兼容过渡 */
export const LIVE_TABS: MobileTab[] = [
  { key: 'room',      label: '开播',     icon: <PlayCircleOutlined />,path: '/live/room' },
  { key: 'products',  label: '商品',     icon: <ShoppingOutlined />,   path: '/live/products' },
  { key: 'interact',  label: '互动',     icon: <MessageOutlined />,    path: '/live/interact' },
  { key: 'data',      label: '数据',     icon: <ReadOutlined />,       path: '/live/data' },
  { key: 'mine',      label: '我的',     icon: <UserOutlined />,       path: '/live/mine' },
];
