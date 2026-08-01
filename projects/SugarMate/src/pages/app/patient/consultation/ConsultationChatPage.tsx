import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Card, Tag, Toast, Dialog } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';
import type { ConsultationOrder, ConsultationMessage } from '@contracts/consultation';

// 模拟医生多轮回复脚本
const DOCTOR_REPLY_SEQUENCE = [
  '您好，我已收到您的问诊请求。请详细描述一下您目前的症状和持续时间。',
  '了解了。我查看了您的健康档案，结合您描述的血糖波动情况，需要关注餐后血糖峰值。您最近的饮食和运动情况怎么样？',
  '好的，根据您提供的信息和CGM数据，我初步判断存在胰岛素敏感性下降的趋势。我为您开具一个短期监控处方，调整用药方案如下。',
];
const PRESCRIPTION_TRIGGER = 2; // 第几次回复后开处方

const ConsultationChatPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    loadOrderDetail, currentOrder, loadMessages, messages,
    sendTextMessage, sendPrescriptionMessage, shareCgmData,
    acceptConsultation, readyConsult, finishConsultation, init,
  } = useConsultationStore();

  const [input, setInput] = useState('');
  const [order, setOrder] = useState<ConsultationOrder | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const welcomeSentRef = useRef(false);

  useEffect(() => {
    init().then(async () => {
      if (orderId) {
        await loadOrderDetail(orderId);
        await loadMessages(orderId);
      }
    });
  }, [orderId]);

  // 从消息中跟踪医生回复次数（用于触发自动开处方流程，非患者操作）

  useEffect(() => {
    setOrder(currentOrder);
    if (!currentOrder || !orderId) return;

    // 情况A：PENDING_ACCEPT → 自动接诊并发送欢迎语
    if (currentOrder.status === 'PENDING_ACCEPT') {
      const timer = setTimeout(async () => {
        await acceptConsultation(currentOrder.id, currentOrder.doctor_id);
        await readyConsult(currentOrder.id);
        await sendTextMessage(currentOrder.id, DOCTOR_REPLY_SEQUENCE[0], 'DOCTOR');
        await loadMessages(orderId);
        await loadOrderDetail(orderId);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 情况B：已接诊/问诊中但还没有医生文字消息（从WaitingPage直接跳转来的常见情况）
    const chatStarted = ['ACCEPTED', 'IN_CONSULT'].includes(currentOrder.status);
    const hasDoctorText = messages.some(m => m.sender === 'DOCTOR' && m.type === 'TEXT');
    if (chatStarted && !hasDoctorText && !welcomeSentRef.current) {
      welcomeSentRef.current = true;
      sendTextMessage(orderId, DOCTOR_REPLY_SEQUENCE[0], 'DOCTOR').then(async () => {
        await loadMessages(orderId);
      });
    }
  }, [currentOrder, messages]);

  // 自动滚底
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const canChat = order && ['IN_CONSULT', 'ACCEPTED'].includes(order.status);

  const handleSend = async () => {
    if (!input.trim() || !orderId) return;
    await sendTextMessage(orderId, input, 'PATIENT');
    setInput('');
    // 仿真：2秒后医生多轮回复
    setTimeout(async () => {
      const existingReplies = messages.filter(m => m.sender === 'DOCTOR' && m.type === 'TEXT').length;
      const nextIdx = existingReplies + 1;
      if (nextIdx < DOCTOR_REPLY_SEQUENCE.length) {
        await sendTextMessage(orderId, DOCTOR_REPLY_SEQUENCE[nextIdx], 'DOCTOR');
      }
      // 第3轮对话后，医生根据问诊情况决定开具处方（模拟医生行为）
      if (nextIdx === PRESCRIPTION_TRIGGER) {
        setTimeout(async () => {
          try {
            await sendPrescriptionMessage(orderId, 'metformin-500mg');
            Toast.show({ icon: 'success', content: '医生已开具电子处方，请在消息中查看并确认' });
          } catch (e) {
            console.error('开处方失败:', e);
          }
        }, 1500);
      }
    }, 2000);
  };

  const handleFinishConsult = () => {
    if (!orderId || !order) return;
    Dialog.confirm({
      title: '确认结束问诊',
      content: '结束问诊后将生成问诊总结，确认？',
      onConfirm: async () => {
        await finishConsultation(orderId, '本次问诊已圆满完成，请查看问诊总结');
        await loadOrderDetail(orderId);
        navigate(`/app/consultation/summary/${orderId}`);
      },
    });
  };

  return (
    <AppPageFrame title={order ? '在线问诊' : '加载中...'} onBack={() => navigate('/app/consultation')}>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 44px)', background: '#f5f5f5' }}>
        {/* 状态栏 */}
        {order && (
          <div style={{ padding: '8px 16px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
            <Tag color={order.status === 'IN_CONSULT' ? 'success' : order.status === 'PENDING_ACCEPT' ? 'warning' : 'default'}>
              {useConsultationStore.getState().getStateLabel(order.status)}
            </Tag>
            <span style={{ color: '#999' }}>
              {order.status === 'PENDING_ACCEPT' ? '等待医生接诊...' : '对话中'}
            </span>
          </div>
        )}

        {/* 消息列表 */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'PATIENT' ? 'flex-end' : msg.sender === 'DOCTOR' ? 'flex-start' : 'center',
                marginBottom: 12,
              }}
            >
              {msg.type === 'SYSTEM_NOTIFY' ? (
                <div style={{
                  background: '#e8f4fd', borderRadius: 8, padding: '6px 12px',
                  fontSize: 12, color: '#1677ff', maxWidth: '80%', textAlign: 'center',
                }}>
                  {msg.content}
                </div>
              ) : msg.type === 'PRESCRIPTION_CARD' ? (
                <Card style={{ borderRadius: 12, padding: 8, minWidth: 220, borderColor: '#1677ff', background: '#f0f7ff' }}>
                  <div style={{ fontSize: 12, color: '#1677ff', fontWeight: 600, marginBottom: 4 }}>
                    📋 医生已开具电子处方
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>{msg.content}</div>
                  {/* 流程步骤指示 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: '#999' }}>
                    <span style={{ color: '#52c41a' }}>医生开方 ✅</span>
                    <span>→</span>
                    <span style={{ color: '#1677ff', fontWeight: 600 }}>患者确认 ⏳</span>
                    <span>→</span>
                    <span>药房流转</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#fa8c16', marginTop: 4, fontWeight: 500 }}>
                    💡 点击下方按钮查看详情并确认处方
                  </div>
                  {msg.prescription_ref && (
                    <Button
                      color="primary" size="small" fill="solid"
                      style={{ marginTop: 8, borderRadius: 6 }}
                      onClick={() => navigate(`/app/consultation/prescription/${msg.prescription_ref}`)}
                    >
                      查看处方并确认
                    </Button>
                  )}
                </Card>
              ) : (
                <div style={{
                  background: msg.sender === 'PATIENT' ? '#1677ff' : '#fff',
                  color: msg.sender === 'PATIENT' ? '#fff' : '#333',
                  borderRadius: msg.sender === 'PATIENT' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '10px 14px',
                  maxWidth: '75%',
                  fontSize: 14,
                  lineHeight: 1.6,
                  boxShadow: msg.sender === 'PATIENT' ? 'none' : '0 1px 3px rgba(0,0,0,.08)',
                }}>
                  {msg.type === 'IMAGE' && msg.image_url && (
                    <img src={msg.image_url} alt="" style={{ maxWidth: 200, borderRadius: 8, marginBottom: 4 }} />
                  )}
                  {msg.type === 'CGM_SHARE' && msg.cgm_data && (
                    <div style={{ marginBottom: 6 }}>
                      <Tag color="warning">🩸 血糖 {msg.cgm_data.glucose_level} mmol/L</Tag>
                      <Tag color="default">{msg.cgm_data.trend === 'DOWN' ? '↓' : msg.cgm_data.trend === 'UP' ? '↑' : '→'} {msg.cgm_data.time_range}</Tag>
                    </div>
                  )}
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', paddingTop: 60 }}>暂无消息</div>
          )}
        </div>

        {/* 操作栏 */}
        {canChat && (
          <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button size="small" fill="none" style={{ padding: '0 8px', fontSize: 20 }} onClick={() => { shareCgmData(orderId!); Toast.show({ content: 'CGM数据已分享' }); }}>
              🩸
            </Button>
            <Input
              placeholder="输入消息..."
              value={input}
              onChange={setInput}
              onEnterPress={handleSend}
              style={{ '--border-radius': '20px', background: '#f5f5f5', flex: 1, minWidth: 100 } as any}
            />
            <Button color="primary" size="small" onClick={handleSend} style={{ borderRadius: 18 }}>
              发送
            </Button>
            <Button color="danger" size="small" fill="outline" onClick={handleFinishConsult} style={{ borderRadius: 18 }}>
              完结
            </Button>
          </div>
        )}
      </div>
    </AppPageFrame>
  );
};

export default ConsultationChatPage;
