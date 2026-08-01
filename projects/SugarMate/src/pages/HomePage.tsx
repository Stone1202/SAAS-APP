/**
 * SugarMate 首页 — 4 终端入口
 * 每个终端独立 URL，可同时打开 4 个标签页
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, theme, Card } from 'antd';
import {
  DesktopOutlined, MobileOutlined, AppleOutlined,
  PlayCircleOutlined, MedicineBoxOutlined, FormOutlined,
} from '@ant-design/icons';

interface TerminalEntry {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgGradient: string;
}

const TERMINALS: TerminalEntry[] = [
  {
    id: 'pc',
    title: 'PC 业务后台',
    subtitle: '入驻管理 · SCRM · 商品 · 订单 · 财务 · 运营 · 数据',
    icon: <DesktopOutlined style={{ fontSize: 48 }} />,
    path: '/dashboard',
    color: 'var(--color-primary)',
    bgGradient: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)',
  },
  {
    id: 'patient',
    title: '患者端 APP',
    subtitle: '客户池账号登录 · 问诊 · 处方 · 商城 · 社区',
    icon: <AppleOutlined style={{ fontSize: 48 }} />,
    path: '/patient',
    color: '#722ed1',
    bgGradient: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
  },
  {
    id: 'medical',
    title: '医管端 APP',
    subtitle: '医生 · 药师 · 营养师 · 仅已上线人员可登录',
    icon: <MedicineBoxOutlined style={{ fontSize: 48 }} />,
    path: '/medical',
    color: '#0f4c81',
    bgGradient: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
  },
  {
    id: 'mp',
    title: '微信小程序',
    subtitle: 'C端糖友 · 血糖记录 · 科普 · 问诊',
    icon: <MobileOutlined style={{ fontSize: 48 }} />,
    path: '/mp/home',
    color: 'var(--color-success)',
    bgGradient: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
  },
  {
    id: 'live',
    title: '直播端',
    subtitle: '直播推流 · 带货 · 预约',
    icon: <PlayCircleOutlined style={{ fontSize: 48 }} />,
    path: '/live/room',
    color: '#fa541c',
    bgGradient: 'linear-gradient(135deg, #fff2e8 0%, #ffd8bf 100%)',
  },
  {
    id: 'apply',
    title: '服务商入驻',
    subtitle: '医生 · 营养师 · 药师 · 药店申请入驻',
    icon: <FormOutlined style={{ fontSize: 48 }} />,
    path: '/apply',
    color: '#13c2c2',
    bgGradient: 'linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%)',
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: 48,
    }}>
      {/* Logo &标题 */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          width: 88, height: 88, borderRadius: 22,
          background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20',
          boxShadow: '0 8px 24px rgba(22,119,255,0.3)',
        }}>
          <MedicineBoxOutlined style={{ fontSize: 44, color: '#fff' }} />
        </div>
        <Typography.Title level={1} style={{ margin: 0, fontWeight: 700 }}>
          SugarMate
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 16 }}>
          糖尿病全病程管理平台 · 四终端联合原型
        </Typography.Text>
      </div>

      {/* 4 终端入口卡片 */}
      <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 1100, width: '100%' }}>
        {TERMINALS.map((t) => (
          <Col xs={24} sm={12} lg={6} key={t.id}>
            <Card
              hoverable
              onClick={() => navigate(t.path)}
              style={{
                height: 220,
                borderRadius: 16,
                borderColor: t.color,
                borderWidth: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
              }}
              styles={{
                body: {
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: t.bgGradient,
                  padding: 32,
                  gap: 16,
                },
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${t.color}33`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ color: t.color }}>{t.icon}</div>
              <Typography.Title level={3} style={{ margin: 0, color: t.color }}>
                {t.title}
              </Typography.Title>
              <Typography.Text
                type="secondary"
                style={{ textAlign: 'center', fontSize: 12, lineHeight: 1.6 }}
              >
                {t.subtitle}
              </Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 提示 */}
      <Typography.Text type="secondary" style={{ marginTop: 48, fontSize: 13 }}>
        提示：四个终端使用独立 URL，可同时打开多个浏览器标签页
      </Typography.Text>
    </div>
  );
};

export default HomePage;
