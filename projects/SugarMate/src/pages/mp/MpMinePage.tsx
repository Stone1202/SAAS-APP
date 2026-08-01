/**
 * 小程序 - 个人中心
 * 增加问诊订单入口，数据来自PC后台
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Avatar, Badge, NavBar, Space, Card } from 'antd-mobile';
import {
  UserOutline, FileWrongOutline, ClockCircleOutline,
  SetOutline, RightOutline, MessageOutline,
} from 'antd-mobile-icons';
import { useConsultationStore } from '@/stores/consultationStore';
import { useAppAuthStore } from '@/stores/appAuthStore';

const MpMinePage: React.FC = () => {
  const navigate = useNavigate();
  const { patientUser } = useAppAuthStore();

  // 获取问诊订单活跃数量（快速显示角标）
  const activeOrderCount = useConsultationStore(s =>
    s.orders.filter(o => ['PENDING_ACCEPT', 'ACCEPTED', 'IN_CONSULT'].includes(o.status)).length
  );

  // 首次加载时拉取订单数据
  React.useEffect(() => {
    const { loadOrders } = useConsultationStore.getState();
    loadOrders(patientUser?.id || 'cus-001');
  }, [patientUser?.id]);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar>我的</NavBar>

      {/* 用户信息卡片 */}
      <Card style={{ margin: '8px 12px', borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ padding: 8 }}>
          <Space align="center">
            <Avatar src="" style={{ '--size': '56px', background: '#fff', color: '#764ba2' } as React.CSSProperties}>
              患
            </Avatar>
            <div>
              <span style={{ color: '#fff', fontSize: 18, fontWeight: 600, display: 'block' }}>{patientUser?.name || '患者'}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>糖尿病患者 · 2型 · 管理中心</span>
            </div>
          </Space>
        </div>
      </Card>

      {/* 我的订单 */}
      <Card style={{ margin: '0 12px 12px', borderRadius: 12 }} title={
        <span  style={{ fontWeight: 600, fontSize: 15 }}>我的服务</span>
      }>
        <List>
          <List.Item
            prefix={<MessageOutline />}
            onClick={() => navigate('/mp/consult/orders')}
            extra={
              <Space>
                {activeOrderCount > 0 && <Badge content={activeOrderCount} />}
                <RightOutline />
              </Space>
            }
          >
            <span style={{ fontSize: 14 }}>在线问诊</span>
            <span style={{ fontSize: 12, color: '#999', display: 'block' }}>查看问诊记录与处方</span>
          </List.Item>
          <List.Item prefix={<ClockCircleOutline />} extra={<RightOutline />}>
            <span style={{ fontSize: 14 }}>我的预约</span>
          </List.Item>
        </List>
      </Card>

      {/* 其他功能 */}
      <Card style={{ margin: '0 12px 12px', borderRadius: 12 }}>
        <List>
          <List.Item prefix={<UserOutline />} extra={<RightOutline />}>
            <span style={{ fontSize: 14 }}>健康档案</span>
          </List.Item>
          <List.Item prefix={<FileWrongOutline />} extra={<RightOutline />}>
            <span style={{ fontSize: 14 }}>我的处方</span>
          </List.Item>
          <List.Item prefix={<SetOutline />} extra={<RightOutline />}>
            <span style={{ fontSize: 14 }}>设置</span>
          </List.Item>
        </List>
      </Card>
    </div>
  );
};

export default MpMinePage;
