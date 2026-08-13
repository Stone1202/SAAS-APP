import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, List, Result, Tag, Toast } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';
import type { ConsultationOrder } from '@contracts/consultation';

const ConsultationSummaryPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { loadOrderDetail, currentOrder, patientConfirmComplete, init } = useConsultationStore();
  const [order, setOrder] = useState<ConsultationOrder | null>(null);

  useEffect(() => {
    init().then(async () => {
      await loadOrderDetail(orderId || '');
    });
  }, [orderId]);

  useEffect(() => { setOrder(currentOrder); }, [currentOrder]);

  if (!order) {
    return <AppPageFrame title="问诊总结"><div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div></AppPageFrame>;
  }

  const handleConfirm = async () => {
    await patientConfirmComplete(order.id);
    Toast.show({ icon: 'success', content: '已确认·资金已释放' });
    navigate(`/app/consultation/recommend/${order.id}`);
  };

  const handleDispute = () => {
    navigate(`/app/consultation/evaluate/${order.id}?dispute=1`);
  };

  if (order.status === 'RECOMMENDATION_SHOWN') {
    return (
      <AppPageFrame title="问诊总结">
        <Result
          status="success"
          title="问诊已完成"
          description="感谢您的耐心等待，医生已确认本次问诊完成。"
        />
        <div style={{ padding: '0 16px' }}>
          <Button color="primary" block size="large" style={{ borderRadius: 24 }}
            onClick={() => navigate(`/app/consultation/evaluate/${order.id}`)}>
            去评价
          </Button>
        </div>
      </AppPageFrame>
    );
  }

  return (
    <AppPageFrame title="问诊总结">
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📋 问诊总结</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>
            本次问诊已完成，请确认以下内容：
          </div>
        </Card>

        {/* 状态信息 */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#999', lineHeight: 2 }}>
            <div>问诊状态：<Tag color="warning">{useConsultationStore.getState().getStateLabel(order.status)}</Tag></div>
            <div>问诊医生：{order.doctor_id}</div>
            {order.prescription_id && <div>关联处方：已生成</div>}
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Button
            color="danger"
            fill="outline"
            style={{ flex: 1, borderRadius: 24 }}
            onClick={handleDispute}
          >
            有疑问
          </Button>
          <Button
            color="primary"
            style={{ flex: 2, borderRadius: 24 }}
            onClick={handleConfirm}
          >
            确认完成
          </Button>
        </div>
      </div>
    </AppPageFrame>
  );
};

export default ConsultationSummaryPage;
