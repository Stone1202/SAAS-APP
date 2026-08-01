/**
 * DoctorConsultDetailPage - 医生端问诊订单详情子页面 V1.0.0
 *
 * 从「我的」页问诊订单列表点击进入，展示订单全貌：
 *   患者信息 | 订单进度时间线 | 处方信息 | 快捷操作
 * 组件可被复用（mine/workbench/consult 等任意入口）
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Tag,
  Button,
  ImageViewer,
  Steps,
  Divider,
  Toast,
  Space,
  Dialog,
} from 'antd-mobile';
import {
  LeftOutline,
  ChatAddOutline,
  FileOutline,
  HistogramOutline,
  EditSOutline,
  TravelOutline,
} from 'antd-mobile-icons';
import AppPageFrame from '../../../components/AppPageFrame';
import { useConsultationStore } from '../../../stores/consultationStore';
import type { ConsultationOrder, Prescription } from '@contracts/consultation';
import { CONSULTATION_ORDER_STATE_LABEL } from '@contracts/consultation';

/* ---------- helper ---------- */

const SERVICE_TYPE_LABEL: Record<string, string> = {
  TEXT: '图文咨询',
  VIDEO: '视频问诊',
  VOICE: '语音咨询',
};

const SERVICE_TYPE_ICON: Record<string, React.ReactNode> = {
  TEXT: <ChatAddOutline />,
  VIDEO: <TravelOutline />,
  VOICE: <TravelOutline />,
};

/** 将 17 个状态聚合成 5 个 Steps 步骤 */
function resolveStep(stage: string): number {
  if (['CREATED', 'PENDING_ACCEPT'].includes(stage)) return 0;
  if (['ACCEPTED', 'IN_CONSULT'].includes(stage)) return 1;
  if (['PENDING_PRESCRIPTION', 'PRESCRIPTION_SUBMITTED', 'PRESCRIPTION_SIGNED', 'PRESCRIPTION_APPROVED', 'RX_PATIENT_REJECTED'].includes(stage)) return 2;
  if (['PRESCRIPTION_FLOWING', 'COMPLETED'].includes(stage)) return 3;
  if (['EVALUATED', 'TIMEOUT_REFUNDED', 'PARTIAL_REFUNDED', 'CANCELLED', 'REFUNDED'].includes(stage)) return 4;
  return 0;
}

const STEP_LABELS = ['待接诊', '问诊沟通', '诊断处方', '处方流转/完成', '终态'];

function fmtDate(ts: number) {
  const d = new Date(ts * 1000 || ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 从 timeline 中还原关键时间点 */
function keyTimepoints(order: ConsultationOrder) {
  const t: Record<string, string> = {};
  t['created'] = order.created_at ? fmtDate(order.created_at) : '--';
  if (order.doctor_timeline) {
    for (const e of order.doctor_timeline) {
      t[e.from_status] = fmtDate(e.ts || e.timestamp || 0);
    }
  }
  return t;
}

/** 获取订单状态标签颜色 */
function statusColor(s: string): string {
  const map: Record<string, string> = {
    PENDING_ACCEPT: '#ff4d4f',
    IN_CONSULT: '#fa8c16',
    ACCEPTED: '#1677ff',
    PENDING_PRESCRIPTION: '#722ed1',
    PRESCRIPTION_SUBMITTED: '#531dab',
    PRESCRIPTION_SIGNED: '#2f54eb',
    PRESCRIPTION_APPROVED: '#52c41a',
    PRESCRIPTION_FLOWING: '#13c2c2',
    COMPLETED: '#52c41a',
    EVALUATED: '#389e0d',
    CANCELLED: '#8c8c8c',
    REFUNDED: '#8c8c8c',
    TIMEOUT_REFUNDED: '#8c8c8c',
    PARTIAL_REFUNDED: '#8c8c8c',
  };
  return map[s] || '#1677ff';
}

/* ---------- component ---------- */

const DoctorConsultDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentOrder, loadOrderDetail, loadMessages, init } = useConsultationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    init().then(() => {
      loadOrderDetail(orderId).finally(() => setLoading(false));
    });
  }, [orderId]);

  const order = currentOrder as ConsultationOrder | null;
  const times = order ? keyTimepoints(order) : {};
  const stepIdx = order ? resolveStep(order.status) : 0;

  /** 快捷操作 */
  const handleGoChat = () => {
    if (!order) return;
    navigate(`/app/doctor/consult/chat/${order.id}`);
  };

  const handleWritePrescription = () => {
    if (!order) return;
    navigate(`/app/doctor/prescription/${order.id}`); // 处方页
  };

  const handleAccept = async () => {
    if (!order) return;
    const { acceptConsultation } = useConsultationStore.getState();
    try {
      await acceptConsultation(order.id);
      Toast.show({ content: '已接诊' });
      loadOrderDetail(order.id);
    } catch (e: any) {
      Toast.show({ content: e?.message || '接诊失败' });
    }
  };

  /* ---------- loading / not-found ---------- */

  if (loading) {
    return (
      <AppPageFrame title="订单详情" showBack>
        <div style={{ textAlign: 'center', padding: 60, color: '#999', fontSize: 14 }}>加载中…</div>
      </AppPageFrame>
    );
  }

  if (!order) {
    return (
      <AppPageFrame title="订单详情" showBack>
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
          <div style={{ fontSize: 14 }}>订单不存在</div>
          <Button size="small" style={{ marginTop: 12 }} onClick={() => navigate(-1)}>返回</Button>
        </div>
      </AppPageFrame>
    );
  }

  /* ---------- render ---------- */

  return (
    <AppPageFrame
      title="订单详情"
      showBack
      right={
        order.status === 'PENDING_ACCEPT' ? (
          <Button size="small" color="primary" style={{ marginRight: 8 }} onClick={handleAccept}>
            接诊
          </Button>
        ) : null
      }
    >
      <div style={{ padding: 12 }}>
        {/* ========== 订单概览 ========== */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#666' }}>订单编号</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{order.id}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <Tag color={statusColor(order.status)} style={{ fontSize: 13 }}>
              {CONSULTATION_ORDER_STATE_LABEL[order.status as keyof typeof CONSULTATION_ORDER_STATE_LABEL] || order.status}
            </Tag>
            <Tag color="default" style={{ fontSize: 12 }}>{SERVICE_TYPE_LABEL[order.service_type] || order.service_type}</Tag>
            {order.order_recommendation && (
              <Tag color="purple" style={{ fontSize: 12 }}>已推荐</Tag>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#666' }}>支付金额</span>
            <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{(order.paid_amount || 0).toFixed(2)}</span>
          </div>
        </Card>

        {/* ========== 患者信息 ========== */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }} title={<span style={{ fontSize: 14, fontWeight: 600 }}>患者信息</span>}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 22, background: '#1677ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, fontWeight: 600,
            }}>
              {order.patient_name?.[0] || '患'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{order.patient_name || `患者 ${order.patient_id}`}</div>
              <div style={{ fontSize: 12, color: '#999' }}>患者 ID：{order.patient_id}</div>
            </div>
          </div>
          {order.symptom_summary && (
            <div style={{ marginTop: 10, padding: 10, background: '#f6ffed', borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ color: '#52c41a', fontWeight: 600 }}>主诉：</span>
              {order.symptom_summary}
            </div>
          )}
          {order.doctor_advice && (
            <div style={{ marginTop: 8, padding: 10, background: '#e6f7ff', borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ color: '#1677ff', fontWeight: 600 }}>医生建议：</span>
              {order.doctor_advice}
            </div>
          )}
        </Card>

        {/* ========== 订单进度时间线 ========== */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }} title={<span style={{ fontSize: 14, fontWeight: 600 }}>订单进度</span>}>
          <Steps
            direction="vertical"
            current={stepIdx}
            style={{ '--step-text-color': '#999' } as React.CSSProperties}
          >
            {STEP_LABELS.map((label, i) => (
              <Steps.Step
                key={label}
                title={label}
                description={
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {i === 0 && <div>创建时间：{times.created}</div>}
                    {i === 1 && times['ACCEPTED'] && <div>接诊时间：{times['ACCEPTED']}</div>}
                    {i === 1 && !times['ACCEPTED'] && <div>--</div>}
                    {i === 2 && times['PENDING_PRESCRIPTION'] && <div>开方时间：{times['PENDING_PRESCRIPTION']}</div>}
                    {i === 3 && times['PRESCRIPTION_FLOWING'] && <div>流转时间：{times['PRESCRIPTION_FLOWING']}</div>}
                    {i === 4 && times['EVALUATED'] && <div>评价时间：{times['EVALUATED']}</div>}
                    {i === 4 && times['TIMEOUT_REFUNDED'] && <div>超时退款</div>}
                  </div>
                }
              />
            ))}
          </Steps>
        </Card>

        {/* ========== 处方信息（如果有） ========== */}
        {order.prescription_id && (
          <Card
            style={{ borderRadius: 12, marginBottom: 12, borderLeft: '3px solid #722ed1' }}
            title={<span style={{ fontSize: 14, fontWeight: 600, color: '#722ed1' }}>电子处方</span>}
            extra={
              <Button size="mini" fill="none" style={{ color: '#722ed1' }}
                onClick={() => navigate(`/app/doctor/prescription/${order.prescription_id}`)}>
                查看完整处方
              </Button>
            }
          >
            <div style={{ fontSize: 12, color: '#666' }}>处方编号：{order.prescription_id}</div>
          </Card>
        )}

        {/* ========== 患者评价（如果有） ========== */}
        {typeof order.patient_rating === 'number' && (
          <Card style={{ borderRadius: 12, marginBottom: 12 }} title={<span style={{ fontSize: 14, fontWeight: 600 }}>患者评价</span>}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fa8c16' }}>★ {order.patient_rating.toFixed(1)}</div>
            {order.patient_feedback && (
              <div style={{ marginTop: 6, fontSize: 13, color: '#333' }}>{order.patient_feedback}</div>
            )}
          </Card>
        )}

        {/* ========== 快捷操作 ========== */}
        <Divider />
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>快捷操作</div>
        <Space wrap style={{ marginBottom: 24 }}>
          {/* 问诊沟通 */}
          {(order.status === 'ACCEPTED' || order.status === 'IN_CONSULT' || order.status === 'PENDING_PRESCRIPTION') && (
            <Button size="small" color="primary" onClick={handleGoChat}>
              <ChatAddOutline /> 进入问诊
            </Button>
          )}
          {/* 开具处方 */}
          {(order.status === 'IN_CONSULT' || order.status === 'PENDING_PRESCRIPTION') && (
            <Button size="small" color="purple" onClick={handleWritePrescription}>
              <EditSOutline /> 开具处方
            </Button>
          )}
          {/* 查看历史对话 */}
          {(order.status === 'COMPLETED' || order.status === 'EVALUATED' || order.status === 'PRESCRIPTION_FLOWING') && (
            <Button size="small" onClick={handleGoChat}>
              <ChatAddOutline /> 查看聊天记录
            </Button>
          )}
          {/* 返回工作台 */}
          <Button size="small" onClick={() => navigate('/app/doctor/workbench')}>
            返回工作台
          </Button>
        </Space>
      </div>
    </AppPageFrame>
  );
};

export default DoctorConsultDetailPage;
