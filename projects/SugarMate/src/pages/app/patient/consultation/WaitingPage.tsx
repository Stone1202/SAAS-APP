import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Toast } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';
import type { ConsultationOrder } from '@contracts/consultation';

const WaitingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { loadOrderDetail, currentOrder, init } = useConsultationStore();
  const [order, setOrder] = useState<ConsultationOrder | null>(null);
  const [simulated, setSimulated] = useState(false);

  useEffect(() => {
    init().then(async () => {
      await loadOrderDetail(orderId || '');
    });
  }, [orderId]);

  useEffect(() => {
    setOrder(currentOrder);
  }, [currentOrder]);

  // 医生真实接诊后自动跳转到聊天页（跨标签页同步回调）
  useEffect(() => {
    if (!order) return;
    if (['ACCEPTED', 'IN_CONSULT'].includes(order.status)) {
      Toast.show({ icon: 'success', content: '医生已接诊' });
      navigate(`/app/consultation/chat/${order.id}`, { replace: true });
    }
  }, [order?.status, order?.id, navigate]);

  // 兜底轮询：每3秒重新加载订单状态（防止storage事件延迟/丢失）
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      const co = useConsultationStore.getState().currentOrder;
      // 仅当状态还未进入对话阶段时才轮询刷新
      if (!co || !['ACCEPTED', 'IN_CONSULT', 'COMPLETED', 'REJECTED'].includes(co.status)) {
        await useConsultationStore.getState().loadOrderDetail(orderId);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  // 仿真：自动接诊（支持 CREATED/PAID/PENDING_ACCEPT 状态）
  useEffect(() => {
    if (simulated || !order) return;
    // 允许的状态：CREATED（刚创建）/ PAID（已支付）/ PENDING_ACCEPT（等待接诊）
    const validStates = ['CREATED', 'PAID', 'PENDING_ACCEPT'];
    if (!validStates.includes(order.status)) return;

    const timer = setTimeout(async () => {
      const { acceptConsultation, readyConsult, loadOrderDetail: reload } = useConsultationStore.getState();
      // 如果状态还没到PENDING_ACCEPT，先推进到接诊环节
      if (order.status === 'CREATED' || order.status === 'PAID') {
        Toast.show({ icon: 'loading', content: '问诊提交中...' });
        await acceptConsultation(order.id, order.doctor_id);
      } else {
        await acceptConsultation(order.id, order.doctor_id);
      }
      await readyConsult(order.id);
      Toast.show({ icon: 'success', content: '医生已接诊' });
      setSimulated(true);
      setTimeout(() => {
        navigate(`/app/consultation/chat/${order.id}`);
      }, 800);
    }, 3000);
    return () => clearTimeout(timer);
  }, [order, simulated]);

  if (!order) {
    return <AppPageFrame title="等待接诊"><div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div></AppPageFrame>;
  }

  return (
    <AppPageFrame title="等待接诊">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, padding: '0 24px' }}>
        {/* 动画图标 */}
        <div style={{
          width: 100, height: 100, borderRadius: 50, background: 'linear-gradient(135deg, #e8f4fd 0%, #bae0ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          animation: 'pulse 2s infinite',
        }}>
          <div style={{ fontSize: 40 }}>🏥</div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          {order.urgency === 'SOS' ? '🚨 紧急呼叫中' : '等待医生接诊中'}
        </div>
        <div style={{ fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 1.6 }}>
          {order.urgency === 'SOS'
            ? '您的血糖危急值已触发SOS快速问诊\n系统正在广播给所有在线医生'
            : '问诊请求已发送\n请耐心等待医生接诊'}
        </div>

        {/* 倒计时 */}
        {order.accept_deadline && (
          <Card style={{ borderRadius: 12, marginTop: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>预计等待</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1677ff' }}>
              {Math.max(0, Math.floor((order.accept_deadline - Date.now()) / 3600000))}:
              {String(Math.max(0, Math.floor(((order.accept_deadline - Date.now()) % 3600000) / 60000))).padStart(2, '0')}:
              {String(Math.max(0, Math.floor(((order.accept_deadline - Date.now()) % 60000) / 1000))).padStart(2, '0')}
            </div>
          </Card>
        )}

        {!order.accept_deadline && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#999' }}>医生平均响应时间：3分钟</div>
          </div>
        )}

        <Button
          color="primary"
          fill="none"
          style={{ marginTop: 40 }}
          onClick={() => {
            Toast.show({ content: '已取消问诊' });
            navigate('/app/consultation', { replace: true });
          }}
        >
          取消问诊
        </Button>
      </div>
    </AppPageFrame>
  );
};

export default WaitingPage;
