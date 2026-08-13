/**
 * APP我的页 — 患者个人中心
 * PRD §2.7.4.1 Tab5: 健康档案 + 处方管理 + 订单列表 + 药房 + 家属 + 隐私 + 设置
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Avatar, List, Tag, Badge, Row, Col } from 'antd';
import {
  UserOutlined, HeartOutlined, FileTextOutlined, BellOutlined,
  SettingOutlined, LogoutOutlined, SafetyCertificateOutlined, GiftOutlined,
  OrderedListOutlined, MedicineBoxOutlined, AlertOutlined, TeamOutlined,
  GlobalOutlined, LockOutlined, EyeOutlined,
  CrownOutlined, CalendarOutlined, RightOutlined, ShopOutlined,
  WalletOutlined, EnvironmentOutlined, MessageOutlined,
} from '@ant-design/icons';
import MobileFrame, { APP_PATIENT_TABS } from '@/components/MobileFrame';
import { useAppAuthStore } from '@/stores/appAuthStore';

/* ========== 主组件 ========== */
const AppMinePage: React.FC = () => {
  const navigate = useNavigate();
  const { patientUser, patientLogout } = useAppAuthStore();

  const userName = patientUser?.name || '未登录';
  const memberLevel = patientUser?.member_level || '普通会员';
  const diabetesLabel = patientUser?.diabetes_type
    ? ({ type1: '1型糖尿病', type2: '2型糖尿病', gestational: '妊娠期糖尿病', prediabetes: '糖尿病前期' }[patientUser.diabetes_type])
    : '未知';
  const diagnosis = patientUser?.diagnosis_duration || '-';
  const userId = patientUser?.id?.slice(-8).toUpperCase() || '--------';
  const healthScore = patientUser?.health_score ?? 0;
  const checkinDays = patientUser?.checkin_days ?? 0;
  const bgRate = patientUser?.bg_rate ?? 0;

  return (
    <MobileFrame title="我的" tabs={APP_PATIENT_TABS} basePath="/app">
      <div style={{ padding: '12px 12px 24px', background: '#f7f8fa', minHeight: '100%' }}>

        {/* === 用户信息卡片 === */}
        <Card
          style={{
            borderRadius: 16, border: 'none', marginBottom: 16, overflow: 'hidden',
            background: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #0f3460 100%)',
          }}
          bodyStyle={{ padding: '16px 14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={52}
              icon={<UserOutlined />}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                cursor: 'pointer', flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.2)',
              }}
              onClick={() => navigate('/app/mine/health-profile')}
            />
            <div style={{ flex: 1, color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{userName}</span>
                <Tag color="gold" style={{ borderRadius: 10, margin: 0, cursor: 'pointer' }} onClick={() => navigate('/app/member')}>
                  <CrownOutlined /> {memberLevel}
                </Tag>
              </div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                {diabetesLabel} · 确诊{diagnosis} · ID: {userId}
              </div>
            </div>
            <SettingOutlined
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer' }}
              onClick={() => navigate('/app/mine/privacy')}
            />
          </div>

          {/* 指标行 */}
          <Row gutter={12} style={{ marginTop: 14 }}>
            {[
              { label: '健康积分', value: healthScore.toLocaleString(), path: '/app/member/points', icon: <GiftOutlined /> },
              { label: '连续打卡', value: `${checkinDays}天`, path: '/app/member/checkin', icon: <CalendarOutlined /> },
              { label: '血糖达标率', value: `${bgRate}%`, path: '/app/mine/health-report', icon: <HeartOutlined /> },
            ].map(item => (
              <Col span={8} key={item.label}>
                <div
                  onClick={() => navigate(item.path)}
                  style={{
                    textAlign: 'center', cursor: 'pointer',
                    color: '#fff', padding: '8px 4px',
                    borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 2 }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{item.value}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* === 健康数据区 === */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} bodyStyle={{ padding: 0 }}
          title={<span style={{ fontSize: 13, fontWeight: 600, padding: '12px 14px 0', display: 'block' }}>
            <HeartOutlined style={{ color: '#f5222d', marginRight: 6 }} />健康数据
          </span>}
        >
          <List size="small" dataSource={[
            { icon: <FileTextOutlined style={{ color: '#1890ff' }} />, label: '健康档案', desc: '基础信息·病史·过敏史', path: '/app/mine/health-profile', badge: null },
            { icon: <EyeOutlined style={{ color: '#52c41a' }} />, label: 'CGM设备管理', desc: '设备已连接·SN: CW-8865', path: '/app/home/cgm/bind', badge: <Tag color="green" style={{ borderRadius: 10 }}>已连接</Tag> },
            { icon: <HeartOutlined style={{ color: '#f5222d' }} />, label: '健康报告', desc: '月度血糖报告·血脂报告', path: '/app/mine/health-report', badge: <Badge status="processing" text="新" /> },
          ]} renderItem={(item: any) => (
            <List.Item style={{ padding: '10px 14px', cursor: 'pointer' }} extra={item.badge} onClick={() => item.path && navigate(item.path)}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
                  {item.icon}
                  {item.label}
                </div>
                <div style={{ fontSize: 10, color: '#999', marginLeft: 26 }}>{item.desc}</div>
              </div>
            </List.Item>
          )} />
        </Card>

        {/* === 交易记录区 === */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} bodyStyle={{ padding: 0 }}
          title={<span style={{ fontSize: 13, fontWeight: 600, padding: '12px 14px 0', display: 'block' }}>
            <OrderedListOutlined style={{ color: '#fa8c16', marginRight: 6 }} />交易记录
          </span>}
        >
          <List size="small" dataSource={[
            { icon: <OrderedListOutlined style={{ color: '#1890ff' }} />, label: '我的订单', desc: '问诊·处方药·非处方药', path: '/app/mine/orders/unified', badge: <Badge count={2} size="small" style={{ marginRight: 8 }} /> },
            { icon: <MessageOutlined style={{ color: '#722ed1' }} />, label: '在线问诊', desc: '查看问诊记录·沟通·处方', path: '/app/mine/consultations', badge: null },
            { icon: <MedicineBoxOutlined style={{ color: '#52c41a' }} />, label: '我的处方', desc: '有效期处方2张', path: '/app/mine/prescriptions', badge: <Badge count={2} size="small" style={{ marginRight: 8 }} /> },
            { icon: <ShopOutlined style={{ color: '#722ed1' }} />, label: '我的药房', desc: '收藏药店3家·常用药品12种', path: '/app/mine/med-reminder', badge: null },
            { icon: <AlertOutlined style={{ color: '#f5222d' }} />, label: '用药提醒', desc: '早餐后·晚餐后·睡前', path: '/app/mine/med-reminder', badge: <Tag color="orange" style={{ borderRadius: 10 }}>3个提醒</Tag> },
          ]} renderItem={(item: any) => (
            <List.Item style={{ padding: '10px 14px', cursor: 'pointer' }} extra={item.badge} onClick={() => item.path && navigate(item.path)}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
                  {item.icon}
                  {item.label}
                </div>
                <div style={{ fontSize: 10, color: '#999', marginLeft: 26 }}>{item.desc}</div>
              </div>
            </List.Item>
          )} />
        </Card>

        {/* === 账号设置区 === */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: 0 }}
          title={<span style={{ fontSize: 13, fontWeight: 600, padding: '12px 14px 0', display: 'block' }}>
            <LockOutlined style={{ color: '#666', marginRight: 6 }} />账号与设置
          </span>}
        >
          <List size="small" dataSource={[
            { icon: <TeamOutlined style={{ color: '#1890ff' }} />, label: '家属管理', desc: '绑定家属2人', path: '/app/mine/family', badge: null },
            { icon: <SafetyCertificateOutlined style={{ color: '#52c41a' }} />, label: '隐私与数据授权', desc: 'CGM数据·健康档案授权', path: '/app/mine/privacy', badge: null },
            { icon: <GlobalOutlined style={{ color: '#722ed1' }} />, label: '多语言设置', desc: '简体中文', path: '/app/mine/language', badge: null },
          ]} renderItem={(item: any) => (
            <List.Item style={{ padding: '10px 14px', cursor: 'pointer' }} onClick={() => item.path && navigate(item.path)}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
                  {item.icon}
                  {item.label}
                </div>
                <div style={{ fontSize: 10, color: '#999', marginLeft: 26 }}>{item.desc}</div>
              </div>
            </List.Item>
          )} />
        </Card>

        {/* === 退出 === */}
        <div style={{ textAlign: 'center', padding: '0 0 16px' }}>
          <a style={{ color: '#999', fontSize: 12, cursor: 'pointer' }} onClick={() => { patientLogout(); }}>
            <LogoutOutlined /> 退出登录
          </a>
          <div style={{ fontSize: 10, color: '#ccc', marginTop: 8 }}>SugarMate APP v3.0 · 九天科技</div>
        </div>
      </div>
    </MobileFrame>
  );
};

export default AppMinePage;
