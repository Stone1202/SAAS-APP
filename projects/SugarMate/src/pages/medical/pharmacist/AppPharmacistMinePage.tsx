/**
 * APP药师我的页 V1.0.0 — 药师审核统计与个人中心
 * 用于 MedicalApp 内部渲染（无 MobileFrame 包裹，使用 MedicalApp 自身的手机壳）
 */
import React, { useEffect, useMemo } from 'react';
import { Card, Avatar, List, Tag, Row, Col } from 'antd';
import {
  UserOutlined,
  AuditOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useAppAuthStore } from '@/stores/appAuthStore';
import { useConsultationStore } from '@/stores/consultationStore';

const AppPharmacistMinePage: React.FC = () => {
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const medicalLogout = useAppAuthStore(s => s.medicalLogout);
  const { prescriptions, loadPrescriptions, init } = useConsultationStore();

  // 加载全部处方数据
  useEffect(() => {
    init().then(() => {
      loadPrescriptions(undefined as any);
    });
  }, []);

  // 审核统计数据
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;

    const pending = prescriptions.filter(p => p.status === 'PENDING_AUDIT').length;
    const reviewed = prescriptions.filter(p =>
      ['AWAITING_PATIENT_CONFIRM', 'PATIENT_AGREED', 'COMPLETED', 'PRESCRIPTION_FLOWING'].includes(p.status)
    ).length;
    const rejected = prescriptions.filter(p => p.status === 'AUDIT_REJECTED').length;
    const todayReviewed = prescriptions.filter(p =>
      p.reviewed_at && p.reviewed_at >= todayStart &&
      ['AWAITING_PATIENT_CONFIRM', 'PATIENT_AGREED', 'COMPLETED'].includes(p.status)
    ).length;

    return {
      total: prescriptions.length,
      pending,
      reviewed,
      rejected,
      todayReviewed,
    };
  }, [prescriptions]);

  const name = medicalUser?.name || '药师';
  const phone = medicalUser?.phone || '';

  return (
    <div style={{ padding: 12 }}>
      {/* ======= 药师信息卡片 ======= */}
      <Card
        style={{
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0d9488, #10b981)',
          border: 'none',
          marginBottom: 12,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={50} icon={<UserOutlined />} src={medicalUser?.avatar} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <div style={{ flex: 1, color: '#fff' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>执业药师</div>
            {phone && <div style={{ fontSize: 10, opacity: 0.65, marginTop: 2 }}>{phone}</div>}
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 8, marginTop: 12,
          background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px',
        }}>
          <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{stats.pending}</div>
            <div style={{ fontSize: 10 }}>待审核</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{stats.reviewed}</div>
            <div style={{ fontSize: 10 }}>已审核通过</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{stats.todayReviewed}</div>
            <div style={{ fontSize: 10 }}>今日审核</div>
          </div>
        </div>
      </Card>

      {/* ======= 快捷统计 ======= */}
      <Row gutter={8} style={{ marginBottom: 12 }}>
        {[
          { icon: <AuditOutlined />, label: '待审核处方', value: stats.pending, color: '#fa8c16', urgent: stats.pending > 0 },
          { icon: <CheckCircleOutlined />, label: '审核通过', value: stats.reviewed, color: '#52c41a' },
          { icon: <CloseCircleOutlined />, label: '已驳回', value: stats.rejected, color: '#ff4d4f' },
        ].map(item => (
          <Col span={8} key={item.label}>
            <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }} bodyStyle={{ padding: '10px 8px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>
                {item.value}
              </div>
              <div style={{ fontSize: 10, color: '#999' }}>{item.icon} {item.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ======= 审核票据入口 ======= */}
      <Card
        size="small"
        style={{ borderRadius: 10, marginBottom: 12 }}
        bodyStyle={{ padding: 0 }}
      >
        <List size="small" dataSource={[
          {
            icon: <AuditOutlined />,
            label: '待审核处方',
            desc: stats.pending > 0 ? `${stats.pending} 张处方待审核` : '暂无待审核处方',
            badge: stats.pending > 0 ? <Tag color="orange">{stats.pending}</Tag> : null,
          },
          {
            icon: <CheckCircleOutlined />,
            label: '今日已审核',
            desc: stats.todayReviewed > 0 ? `今日已审核 ${stats.todayReviewed} 张` : '今日暂无审核记录',
          },
          {
            icon: <CloseCircleOutlined />,
            label: '驳回记录',
            desc: stats.rejected > 0 ? `${stats.rejected} 张处方已驳回` : '暂无驳回记录',
          },
        ]} renderItem={item => (
          <List.Item style={{ padding: '12px 16px' }} extra={item.badge}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--color-primary)', fontSize: 18 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{item.desc}</div>
              </div>
            </div>
          </List.Item>
        )} />
      </Card>

      {/* ======= 功能菜单 ======= */}
      <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }} bodyStyle={{ padding: 0 }}>
        <List size="small" dataSource={[
          { icon: <FileTextOutlined />, label: '资质证照', extra: <Tag color="green">已认证</Tag> },
          { icon: <SettingOutlined />, label: '设置', extra: null },
        ]} renderItem={item => (
          <List.Item style={{ padding: '10px 16px' }} extra={item.extra}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--color-primary)' }}>{item.icon}</span> {item.label}
            </div>
          </List.Item>
        )} />
      </Card>

      <div style={{ textAlign: 'center', padding: 8 }}>
        <a
          style={{ color: '#999', fontSize: 12 }}
          onClick={() => { medicalLogout(); window.location.href = '/medical/login'; }}
        >
          <LogoutOutlined /> 退出登录
        </a>
      </div>
    </div>
  );
};

export default AppPharmacistMinePage;
