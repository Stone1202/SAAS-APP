/**
 * APP医生工作台 — 接诊/患者/数据总览
 */
import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Badge, Button, Row, Col } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MobileFrame, { APP_DOCTOR_TABS } from '@/components/MobileFrame';
import { useConsultationStore } from '@/stores/consultationStore';
import { useMerchantStore } from '@/stores/merchantStore';
import { useAppAuthStore } from '@/stores/appAuthStore';

const SERVICE_TYPE_LABEL: Record<string, string> = {
  TEXT: '图文咨询',
  VIDEO: '视频问诊',
  VOICE: '语音咨询',
};

const AppDoctorWorkbenchPage: React.FC = () => {
  const navigate = useNavigate();
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const merchants = useMerchantStore(s => s.merchants);
  const { orders, loadOrders, acceptConsultation, loadMessages, init } = useConsultationStore();

  const onlineDoctors = React.useMemo(
    () => merchants.filter(m => m.role === 'DOCTOR' && m.lifecycleStatus === 'ONLINE'),
    [merchants]
  );

  // V2.2.1：通过 consultationStore 的 phone→doctor_id 映射解析正确的 consultation doctor ID
  const [consultDoctorId, setConsultDoctorId] = useState<string>('');

  useEffect(() => {
    init().then(() => {
      const resolved = useConsultationStore.getState()
        .resolveDoctorConsultId(medicalUser?.phone, medicalUser?.name);
      if (resolved) {
        setConsultDoctorId(resolved);
        loadOrders(undefined, resolved);
      }
    });
  }, [medicalUser?.phone, medicalUser?.name]);

  const pendingOrders = React.useMemo(
    () => orders.filter(o => o.status === 'PENDING_ACCEPT'),
    [orders]
  );
  const todayOrders = React.useMemo(
    () => orders.filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }),
    [orders]
  );
  const prescriptionCount = React.useMemo(
    () => orders.filter(o =>
      ['PENDING_PRESCRIPTION', 'PRESCRIPTION_SUBMITTED', 'PRESCRIPTION_SIGNED', 'PRESCRIPTION_APPROVED', 'RX_AWAITING_PATIENT', 'RX_PATIENT_ACCEPTED', 'RX_PATIENT_REJECTED', 'PRESCRIPTION_FLOWING'].includes(o.status)
    ).length,
    [orders]
  );

  const handleAccept = async (order: any) => {
    await acceptConsultation(order.id, order.doctor_id);
    await loadMessages(order.id);
    navigate(`/app/doctor/consult/chat/${order.id}`);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return '今天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <MobileFrame title="医生工作台" tabs={APP_DOCTOR_TABS} basePath="/app/doctor">
      <div style={{ padding: 12 }}>
        {/* 今日数据 */}
        <Row gutter={8} style={{ marginBottom: 12 }}>
          {[
            { label: '今日接诊', value: todayOrders.length, color: 'var(--color-primary)' },
            { label: '待接诊', value: pendingOrders.length, color: 'var(--color-error)', urgent: pendingOrders.length > 0 },
            { label: '处方量', value: prescriptionCount, color: 'var(--color-success)' },
          ].map(item => (
            <Col span={8} key={item.label}>
              <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }} bodyStyle={{ padding: '10px 8px' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: item.color }}>
                  {item.urgent && <Badge dot status="error" style={{ marginRight: 4 }} />}
                  {item.value}
                </div>
                <div style={{ fontSize: 10, color: '#999' }}>{item.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 待接诊列表 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<span style={{ fontSize: 13 }}>待接诊 <Tag color="red">{pendingOrders.length}</Tag></span>}
        >
          {pendingOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#999', fontSize: 12 }}>暂无待接诊订单</div>
          ) : (
            pendingOrders.map((order, i) => (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 0', borderBottom: i < pendingOrders.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}>
                <Badge status={order.urgency === 'SOS' ? 'error' : order.urgency === 'URGENT' ? 'warning' : 'default'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{order.patient_name || `患者 ${order.patient_id}`} · {SERVICE_TYPE_LABEL[order.service_type] || order.service_type}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{order.symptom_summary || '暂无症状描述'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#666' }}>{formatTime(order.created_at)}</div>
                  <Button type="primary" size="small" style={{ borderRadius: 10, marginTop: 2 }} onClick={() => handleAccept(order)}>接诊</Button>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* 今日日程 */}
        <Card size="small" style={{ borderRadius: 10 }}
          title={<span style={{ fontSize: 13 }}><ClockCircleOutlined /> 今日日程</span>}>
          <List
            size="small"
            dataSource={todayOrders.length === 0 ? [
              { time: '--:--', event: '今日暂无问诊日程', status: 'done' },
            ] : todayOrders.map(order => ({
              time: new Date(order.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              event: `${SERVICE_TYPE_LABEL[order.service_type] || order.service_type} · ${order.patient_name || `患者 ${order.patient_id}`}`,
              status: order.status === 'COMPLETED' ? 'done' : order.status === 'IN_CONSULT' ? 'doing' : 'pending',
            }))}
            renderItem={item => (
              <List.Item style={{ padding: '6px 0', fontSize: 12 }}>
                <Tag
                  color={item.status === 'done' ? 'default' : item.status === 'doing' ? 'processing' : 'blue'}
                  style={{ fontSize: 10 }}
                >
                  {item.time}
                </Tag>
                <span style={{ marginLeft: 8 }}>{item.event}</span>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </MobileFrame>
  );
};

export default AppDoctorWorkbenchPage;
