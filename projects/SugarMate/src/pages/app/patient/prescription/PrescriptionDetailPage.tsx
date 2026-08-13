/**
 * 患者端处方详情页 V2.3.0
 * 展示三重关联：处方 ↔ 问诊订单 ↔ 交易订单
 * 支持确认/拒绝/流转药房下单
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tag, SpinLoading, Dialog, Toast, Steps } from 'antd-mobile';
import AppPageFrame from '@/components/AppPageFrame';
import { useConsultationStore } from '@/stores/consultationStore';
import { useOrderStore } from '@/stores/orderStore';
import type { Prescription, ConsultationOrder } from '@contracts/consultation';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: '#999' },
  SUBMITTED: { label: '已提交', color: '#1890ff' },
  CA_SIGNED: { label: 'CA已签名', color: '#722ed1' },
  PENDING_AUDIT: { label: '待药师审核', color: '#fa8c16' },
  AUDIT_REJECTED: { label: '审核驳回', color: '#f5222d' },
  AWAITING_PATIENT_CONFIRM: { label: '⏳ 待您确认', color: '#fa8c16' },
  PATIENT_CONFIRMED: { label: '✅ 已确认', color: '#52c41a' },
  PATIENT_REJECTED: { label: '患者已拒绝', color: '#f5222d' },
  PATIENT_AGREED: { label: '✅ 已同意(仅确认)', color: '#52c41a' },
  ORDER_CREATED: { label: '✅ 订单已生成', color: '#13c2c2' },
  FLOWING: { label: '📦 流转中', color: '#1890ff' },
  DISPENSED: { label: '已配药·待取药', color: '#52c41a' },
  REVOKED: { label: '已撤回', color: '#999' },
  EXPIRED: { label: '已过期', color: '#999' },
};

const PrescriptionDetailPage: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const store = useConsultationStore();
  const orderStore = useOrderStore();

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    store.init().then(async () => {
      if (prescriptionId) {
        await store.loadPrescriptionDetail(prescriptionId);
        // 加载关联的问诊订单（使用 getState 获取最新状态）
        const pres = useConsultationStore.getState().currentPrescription;
        if (pres?.consultation_order_id) {
          await store.loadOrderDetail(pres.consultation_order_id);
        }
      }
      setLoading(false);
    });
  }, [prescriptionId]);

  const pres = store.currentPrescription;
  const order = store.currentOrder;

  // 关联的交易订单
  const tradeOrders = useMemo(() => {
    if (!pres?.trade_orders || pres.trade_orders.length === 0) return [];
    return pres.trade_orders.map(ref => {
      const ord = orderStore.orders.find(o => o.id === ref.order_id);
      return { ref, data: ord || null };
    });
  }, [pres?.trade_orders, orderStore.orders]);

  if (loading) {
    return <AppPageFrame title="处方详情"><div style={{ textAlign: 'center', padding: 60 }}><SpinLoading /></div></AppPageFrame>;
  }
  if (!pres) {
    return <AppPageFrame title="处方详情"><div style={{ textAlign: 'center', padding: 60 }}>处方不存在</div></AppPageFrame>;
  }

  const st = STATUS_MAP[pres.status] || { label: pres.status, color: '#999' };
  const isAwaitingConfirm = pres.status === 'AWAITING_PATIENT_CONFIRM';
  const isCompleted = ['PATIENT_CONFIRMED', 'PATIENT_AGREED', 'ORDER_CREATED', 'FLOWING', 'DISPENSED'].includes(pres.status);

  const handleConfirm = async () => {
    await Dialog.confirm({
      title: '确认处方并下单',
      content: `确认使用 ${pres.drug_name} ${pres.dosage} · ${pres.frequency}？\n确认后将自动创建订单并流转药房。`,
      onConfirm: async () => {
        setConfirming(true);
        try {
          const result = await store.patientConfirmPrescriptionAndOrder(pres.id, 'addr-default');
          Toast.show({ icon: 'success', content: '处方已确认·订单已生成' });
          // 刷新详情
          await store.loadPrescriptionDetail(pres.id);
          // 加载最新处方数据用于获取 trade_order
          const updatedPres = useConsultationStore.getState().currentPrescription;
          const tradeId = result.tradeOrder?.id || (updatedPres?.trade_orders?.[updatedPres.trade_orders.length - 1]?.order_id);
          if (tradeId) {
            orderStore.loadOrderDetail(tradeId);
          }
        } catch (err: any) {
          Toast.show({ icon: 'fail', content: err.message || '确认失败' });
        } finally {
          setConfirming(false);
        }
      },
    });
  };

  const handleReject = async () => {
    const reason = await Dialog.prompt({
      title: '拒绝处方原因',
      content: '请告知医生您拒绝的原因：',
    });
    if (reason) {
      await store.patientRejectPrescription(pres.id, reason);
      Toast.show({ content: '已通知医生修改处方' });
      navigate(-1);
    }
  };

  // 生成关联链Steps
  const linkSteps = useMemo(() => {
    const steps: { title: string; description: string; status: 'process' | 'finish' | 'wait' | 'error' }[] = [];

    // 步骤1: 问诊
    steps.push({
      title: '在线问诊',
      description: order ? `#${order.id.slice(0, 8)} · ${order.status}` : '问诊订单',
      status: 'finish',
    });

    // 步骤2: 处方
    const rxStatuses = ['PENDING_AUDIT', 'AWAITING_PATIENT_CONFIRM'];
    const rxDone = ['PATIENT_CONFIRMED', 'PATIENT_AGREED', 'ORDER_CREATED', 'FLOWING', 'DISPENSED'];
    const rxFailed = ['AUDIT_REJECTED', 'PATIENT_REJECTED', 'EXPIRED', 'REVOKED'];
    steps.push({
      title: '电子处方',
      description: `#${pres.id.slice(0, 8)} · ${st.label}`,
      status: rxDone.includes(pres.status) ? 'finish' : rxFailed.includes(pres.status) ? 'error' : 'process',
    });

    // 步骤3: 交易订单
    if (tradeOrders.length > 0) {
      const tOrder = tradeOrders[0];
      steps.push({
        title: '交易订单',
        description: `#${tOrder.ref.order_id.slice(0, 8)} · ${tOrder.ref.status}`,
        status: tOrder.ref.status === 'COMPLETED' ? 'finish' : 'process',
      });
    } else if (isCompleted) {
      steps.push({ title: '交易订单', description: '生成中...', status: 'process' });
    } else {
      steps.push({ title: '交易订单', description: '待确认处方后生成', status: 'wait' });
    }

    return steps;
  }, [pres?.status, order, tradeOrders]);

  return (
    <AppPageFrame title="电子处方">
      <div style={{ padding: '0 12px 100px', background: '#f7f8fa', minHeight: '100%' }}>

        {/* === 关联链可视化 === */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e', marginBottom: 12 }}>📋 业务流水</div>
          <Steps direction="vertical" current={-1} style={{ '--step-text-color': '#333' } as any}>
            {linkSteps.map((step, i) => (
              <Steps.Step
                key={i}
                title={<span style={{ fontSize: 13, fontWeight: 500 }}>{step.title}</span>}
                description={<span style={{ fontSize: 11, color: '#999' }}>{step.description}</span>}
                status={step.status}
              />
            ))}
          </Steps>
        </Card>

        {/* === 处方状态 === */}
        <Card style={{ borderRadius: 12, marginBottom: 12, textAlign: 'center', background: isAwaitingConfirm ? '#fffbe6' : isCompleted ? '#f6ffed' : '#fff' }}>
          <Tag color={isCompleted ? 'success' : isAwaitingConfirm ? 'warning' : '#ccc' as any}
            style={{ fontSize: 13, padding: '4px 12px', whiteSpace: 'normal', lineHeight: 1.6 }}>
            {st.label}
          </Tag>
          {isAwaitingConfirm && (
            <div style={{ fontSize: 11, color: '#ad6800', marginTop: 6 }}>请在72小时内确认，超时将自动过期</div>
          )}
        </Card>

        {/* === 问诊订单信息 === */}
        {order && (
          <Card style={{ borderRadius: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>🩺 关联问诊</span>
              <a onClick={() => navigate(`/app/consultation/detail/${order.id}`)} style={{ fontSize: 11 }}>查看对话</a>
            </div>
            <div style={{ fontSize: 12, lineHeight: 2, color: '#666' }}>
              <div><span style={{ color: '#999' }}>问诊编号：</span>{order.id}</div>
              <div><span style={{ color: '#999' }}>医生：</span>{order.doctor_name || order.doctor_id}</div>
              <div><span style={{ color: '#999' }}>状态：</span>{order.status}</div>
              <div><span style={{ color: '#999' }}>时间：</span>{new Date(order.created_at).toLocaleString('zh-CN')}</div>
            </div>
          </Card>
        )}

        {/* === 处方详情 === */}
        <Card style={{ borderRadius: 12, marginBottom: 12, borderLeft: '3px solid #722ed1' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>💊 处方详情</div>
          <div style={{ fontSize: 13, lineHeight: 2.4, color: '#333' }}>
            <div><span style={{ color: '#999' }}>诊断结果：</span>{pres.diagnosis || '—'}</div>
            <div><span style={{ color: '#999' }}>药品名称：</span><strong>{pres.drug_name}</strong></div>
            {pres.generic_name && <div><span style={{ color: '#999' }}>通用名：</span>{pres.generic_name}</div>}
            <div><span style={{ color: '#999' }}>规格：</span>{pres.specification}</div>
            <div><span style={{ color: '#999' }}>用法用量：</span>{pres.dosage} · {pres.frequency}</div>
            <div><span style={{ color: '#999' }}>数量：</span>{pres.quantity}盒 · {pres.duration_days}天</div>
            {pres.notes && <div><span style={{ color: '#999' }}>医嘱：</span>{pres.notes}</div>}
          </div>

          {/* CA 签名 */}
          {pres.ca_certificate_id && (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: '#f9f0ff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🔐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#531dab' }}>CA电子签名已认证</div>
                <div style={{ fontSize: 10, color: '#999' }}>
                  开具医生：{pres.doctor_name || '—'} · {pres.ca_signed_at ? new Date(pres.ca_signed_at).toLocaleString() : ''}
                </div>
              </div>
              <Tag color="purple" style={{ fontSize: 10 }}>CA</Tag>
            </div>
          )}

          {/* 药师审核信息 */}
          {pres.pharmacist_id && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: '#fff7e6', fontSize: 12 }}>
              <div><span style={{ color: '#999' }}>审核药师：</span>{pres.pharmacist_id}</div>
              <div><span style={{ color: '#999' }}>审核意见：</span>{pres.review_notes || '审核通过'}</div>
              {pres.reviewed_at && <div><span style={{ color: '#999' }}>审核时间：</span>{new Date(pres.reviewed_at).toLocaleString()}</div>}
            </div>
          )}
        </Card>

        {/* === 关联交易订单 === */}
        {tradeOrders.length > 0 && tradeOrders.map(({ ref, data }) => (
          <Card key={ref.order_id} style={{ borderRadius: 12, marginBottom: 12, borderLeft: '3px solid #13c2c2' }}
            onClick={() => orderStore.loadOrder(ref.order_id)}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>📦 关联订单</span>
              <a onClick={(e) => { e.stopPropagation(); navigate(`/app/mine/order/${ref.order_id}`); }} style={{ fontSize: 11 }}>查看详情 →</a>
            </div>
            <div style={{ fontSize: 12, lineHeight: 2, color: '#666' }}>
              <div><span style={{ color: '#999' }}>订单编号：</span>{ref.order_id}</div>
              <div><span style={{ color: '#999' }}>子单号：</span>{ref.sub_order_no}</div>
              <div><span style={{ color: '#999' }}>类型：</span>{ref.order_type === 'RX' ? '处方药' : '非处方'}</div>
              <div><span style={{ color: '#999' }}>状态：</span><Tag color={ref.status === 'COMPLETED' ? 'success' : 'warning'} style={{ fontSize: 10 }}>{ref.status}</Tag></div>
              {data && (
                <div><span style={{ color: '#999' }}>金额：</span><span style={{ color: '#f5222d', fontWeight: 600 }}>¥{(data.pay_amount || 0) / 100}</span></div>
              )}
            </div>
          </Card>
        ))}

        {/* === 底部操作 === */}
        {isAwaitingConfirm && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0', boxShadow: '0 -3px 10px rgba(0,0,0,.08)', display: 'flex', gap: 12, maxWidth: 430, margin: '0 auto', zIndex: 100 }}>
            <Button color="danger" fill="outline" style={{ flex: 1, borderRadius: 24, fontSize: 13 }} onClick={handleReject} loading={confirming}>
              拒绝
            </Button>
            <Button color="primary" style={{ flex: 2, borderRadius: 24, fontSize: 13 }} onClick={handleConfirm} loading={confirming}>
              确认处方并下单
            </Button>
          </div>
        )}
      </div>
    </AppPageFrame>
  );
};

export default PrescriptionDetailPage;
