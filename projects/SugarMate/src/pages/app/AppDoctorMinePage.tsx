/**
 * APP医生我的页 V2.4.0 — 三级导航：入口 → 订单列表 → 订单详情
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Card, Avatar, List, Tag, Badge, Row, Col, Button, Empty } from 'antd';
import { UserOutlined, FileTextOutlined, DollarOutlined, SettingOutlined, LogoutOutlined, TeamOutlined, ClockCircleOutlined, MedicineBoxOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MobileFrame, { APP_DOCTOR_TABS } from '@/components/MobileFrame';
import { useAppAuthStore } from '@/stores/appAuthStore';
import { useConsultationStore } from '@/stores/consultationStore';

/* ========== 组件 ========== */

const AppDoctorMinePage: React.FC = () => {
  const navigate = useNavigate();
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const medicalLogout = useAppAuthStore(s => s.medicalLogout);
  const { orders, loadOrders, init } = useConsultationStore();

  // --- 数据加载 ---
  useEffect(() => {
    init().then(() => {
      const resolved = useConsultationStore.getState()
        .resolveDoctorConsultId(medicalUser?.phone, medicalUser?.name);
      if (resolved) {
        loadOrders(undefined, resolved);
      }
    });
  }, [medicalUser?.phone, medicalUser?.name]);

  // --- 统计数据 ---
  const { totalOrders, todayOrders, pendingCount, prescriptionCount, completedCount } = useMemo(() => {
    const now = new Date();
    const today = orders.filter(o => {
      const d = new Date(o.created_at * 1000 || o.created_at);
      return d.toDateString() === now.toDateString();
    });
    return {
      totalOrders: orders.length,
      todayOrders: today.length,
      pendingCount: orders.filter(o => o.status === 'PENDING_ACCEPT').length,
      prescriptionCount: orders.filter(o =>
        ['PENDING_PRESCRIPTION', 'PRESCRIPTION_SUBMITTED', 'PRESCRIPTION_SIGNED', 'PRESCRIPTION_APPROVED', 'PRESCRIPTION_FLOWING'].includes(o.status)
      ).length,
      completedCount: orders.filter(o => ['COMPLETED', 'EVALUATED'].includes(o.status)).length,
    };
  }, [orders]);

  const doctorRating = useMemo(() => {
    const doctors = useConsultationStore.getState().doctors;
    if (medicalUser?.phone) {
      const found = doctors.find(d => d.phone === medicalUser.phone);
      return found?.rating?.toFixed(1) || '--';
    }
    if (medicalUser?.name) {
      const found = doctors.find(d => d.name === medicalUser.name);
      return found?.rating?.toFixed(1) || '--';
    }
    return '--';
  }, [medicalUser?.phone, medicalUser?.name, orders.length]);

  // --- 个人信息 ---
  const name = medicalUser?.name || '--';
  const title = medicalUser?.title || '';
  const department = medicalUser?.department || '';
  const hospital = medicalUser?.hospital || '';
  const expertise = medicalUser?.expertise || '';
  const subTitle = [department, hospital, title].filter(Boolean).join(' · ');

  /* ========== 渲染 ========== */

  return (
    <MobileFrame title="我的" tabs={APP_DOCTOR_TABS} basePath="/app/doctor">
      <div style={{ padding: 12 }}>
        {/* ======= 医生信息卡片 ======= */}
        <Card
          style={{ borderRadius: 12, background: 'linear-gradient(135deg, var(--color-primary), var(--color-success))', border: 'none', marginBottom: 12 }}
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={50} icon={<UserOutlined />} src={medicalUser?.avatar} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <div style={{ flex: 1, color: '#fff' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{subTitle}</div>
              {expertise && <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>擅长：{expertise}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px' }}>
            <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{totalOrders}</div>
              <div style={{ fontSize: 10 }}>累计接诊</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{doctorRating}</div>
              <div style={{ fontSize: 10 }}>患者评分</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{todayOrders}</div>
              <div style={{ fontSize: 10 }}>今日接诊</div>
            </div>
          </div>
        </Card>

        {/* ======= 快捷统计 ======= */}
        <Row gutter={8} style={{ marginBottom: 12 }}>
          {[
            { icon: <ClockCircleOutlined />, label: '待接诊', value: pendingCount, color: '#ff4d4f', urgent: pendingCount > 0 },
            { icon: <MedicineBoxOutlined />, label: '处方量', value: prescriptionCount, color: '#1677ff' },
            { icon: <TeamOutlined />, label: '已完结', value: completedCount, color: '#52c41a' },
          ].map(item => (
            <Col span={8} key={item.label}>
              <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }} bodyStyle={{ padding: '10px 8px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>
                  {item.urgent && <Badge dot status="error" style={{ marginRight: 4 }} />}
                  {item.value}
                </div>
                <div style={{ fontSize: 10, color: '#999' }}>{item.icon} {item.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ======= 问诊订单入口 ======= */}
        <Card
          size="small"
          style={{ borderRadius: 10, marginBottom: 12, cursor: 'pointer' }}
          bodyStyle={{ padding: 0 }}
          onClick={() => navigate('/app/doctor/consult/list')}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MedicineBoxOutlined style={{ fontSize: 22, color: 'var(--color-primary)' }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>问诊订单</div>
                <div style={{ fontSize: 11, color: '#999' }}>
                  查看全部 {totalOrders > 0 ? `${totalOrders} 条` : ''} 问诊记录
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#bfbfbf' }}>
              {pendingCount > 0 && (
                <Badge count={pendingCount} size="small" style={{ marginRight: 4 }} />
              )}
              <RightOutlined style={{ fontSize: 12 }} />
            </div>
          </div>
        </Card>

        {/* ======= 功能菜单 ======= */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }} bodyStyle={{ padding: 0 }}>
          <List size="small" dataSource={[
            { icon: <FileTextOutlined />, label: '资质证照', extra: <Tag color="green">已认证</Tag> },
            { icon: <DollarOutlined />, label: '收入结算', extra: <Tag color="blue">查看</Tag> },
            { icon: <SettingOutlined />, label: '设置', extra: null },
          ]} renderItem={item => (
            <List.Item style={{ padding: '10px 16px', cursor: 'pointer' }} extra={item.extra}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--color-primary)' }}>{item.icon}</span> {item.label}
              </div>
            </List.Item>
          )} />
        </Card>

        <div style={{ textAlign: 'center', padding: 16 }}>
          <a
            style={{ color: '#999', fontSize: 12 }}
            onClick={() => { medicalLogout(); window.location.href = '/medical/login'; }}
          >
            <LogoutOutlined /> 退出登录
          </a>
        </div>
      </div>
    </MobileFrame>
  );
};

export default AppDoctorMinePage;
