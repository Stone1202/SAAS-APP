/**
 * 小程序 - 问诊订单列表页
 * 
 * 功能：患者在小程序端查看所有问诊订单，包括待接诊、问诊中、已完成
 * 数据：consultationStore（按患者ID过滤）
 * 闭环：数据来自PC后台管理的问诊订单
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List, Tabs, Tag, Space, Card, Empty, Button,
  Skeleton, Badge, NavBar,
} from 'antd-mobile';
import {
  ClockCircleOutline, CheckCircleOutline, CloseCircleOutline,
  MessageOutline, SearchOutline, RightOutline,
} from 'antd-mobile-icons';
import { useConsultationStore } from '@/stores/consultationStore';
import { useAppAuthStore } from '@/stores/appAuthStore';

// ==================== 状态配置 ====================

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING_ACCEPT: { label: '待接诊', color: 'orange' },
  ACCEPTED: { label: '已接诊', color: 'blue' },
  IN_CONSULT: { label: '问诊中', color: 'processing' },
  PENDING_PRESCRIPTION: { label: '处方审核中', color: 'purple' },
  WAITING_PATIENT_CONFIRM: { label: '待确认', color: 'lime' },
  PATIENT_CONFIRMED: { label: '已确认', color: 'green' },
  EVALUATED: { label: '已完成', color: 'green' },
  REFUNDED: { label: '已退款', color: 'red' },
  CANCELED: { label: '已取消', color: 'default' },
};

// ==================== 组件 ====================

const MpConsultOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loadOrders, loading } = useConsultationStore();
  const { patientUser } = useAppAuthStore();
  const [activeKey, setActiveKey] = useState('all');

  useEffect(() => {
    loadOrders(patientUser?.id || 'cus-001'); // 当前登录患者ID
  }, [patientUser?.id]);

  // 按标签筛选
  const filteredOrders = useMemo(() => {
    if (activeKey === 'all') return orders;
    if (activeKey === 'active') return orders.filter(o => ['PENDING_ACCEPT', 'ACCEPTED', 'IN_CONSULT', 'PENDING_PRESCRIPTION'].includes(o.status));
    if (activeKey === 'completed') return orders.filter(o => ['WAITING_PATIENT_CONFIRM', 'PATIENT_CONFIRMED', 'EVALUATED'].includes(o.status));
    return orders;
  }, [orders, activeKey]);

  // 统计
  const activeCount = useMemo(
    () => orders.filter(o => ['PENDING_ACCEPT', 'ACCEPTED', 'IN_CONSULT'].includes(o.status)).length,
    [orders]
  );

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={5} animated />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar onBack={() => navigate(-1)}>我的问诊</NavBar>

      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        style={{ '--title-font-size': '14px' } as React.CSSProperties}
      >
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab
          title={<Badge content={activeCount > 0 ? activeCount : null} style={{ margin: '-4px -8px 0 0' }}>进行中</Badge>}
          key="active"
        />
        <Tabs.Tab title="已完成" key="completed" />
      </Tabs>

      <div style={{ padding: '8px 12px' }}>
        {filteredOrders.length === 0 ? (
          <Empty
            description="暂无问诊记录"
            style={{ paddingTop: 60 }}
          />
        ) : (
          <List>
            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, color: 'default' };
              return (
                <List.Item
                  key={order.id}
                  clickable
                  onClick={() => navigate(`/mp/consult/chat/${order.id}`)}
                  extra={
                    <Space direction="vertical" align="end">
                      <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                      <span style={{ fontSize: 13, color: '#f5222d' }}>¥{order.price || 0}</span>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <span style={{ fontSize: 12, color: '#999' }}>
                        订单：{order.id}
                      </span>
                      <span style={{ fontSize: 12, color: '#999' }}>
                        医生：{order.doctor_id} · {order.mode === 'text' ? '图文' : order.mode === 'video' ? '视频' : order.mode === 'voice' ? '语音' : '电话'}
                      </span>
                      <span style={{ fontSize: 11, color: '#bbb' }}>
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </Space>
                  }
                >
                  <span  style={{ fontWeight: 600, fontSize: 14 }}>
                    {order.mode === 'text' ? '图文问诊' : order.mode === 'video' ? '视频问诊' : order.mode === 'voice' ? '语音问诊' : '电话问诊'}
                  </span>
                </List.Item>
              );
            })}
          </List>
        )}
      </div>
    </div>
  );
};

export default MpConsultOrderListPage;
