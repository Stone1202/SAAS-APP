/**
 * DoctorConsultationChatPage - 医生端问诊对话页 V1.0.0
 *
 * 承接 DoctorConsultPanel 的接诊动作，医生在此与患者图文对话、开处方、查看CGM。
 * 与患者端 ConsultationChatPage 共用 consultationStore，实现端到端闭环。
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextArea,
  Button,
  Tag,
  Toast,
  Space,
  Modal,
  ImageViewer,
} from 'antd-mobile';
import {
  PictureOutline,
  FileOutline,
  HistogramOutline,
  SoundOutline,
  SendOutline,
} from 'antd-mobile-icons';
import AppPageFrame from '../../../components/AppPageFrame';
import { useConsultationStore } from '../../../stores/consultationStore';
import type { ConsultationMessage } from '@contracts/consultation';
import './DoctorConsultationChatPage.css';

const DoctorConsultationChatPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    currentOrder,
    messages,
    loadOrderDetail,
    loadMessages,
    sendTextMessage,
    sendImageMessage,
    shareCgmData,
    finishConsultation,
    getStateLabel,
  } = useConsultationStore();

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) return;
    loadOrderDetail(orderId);
    loadMessages(orderId);
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async () => {
    if (!orderId || !inputText.trim()) return;
    setSending(true);
    try {
      await sendTextMessage(orderId, inputText.trim(), 'DOCTOR');
      setInputText('');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async () => {
    if (!orderId) return;
    // sim 模式：模拟上传图片，生成固定测试图 URL
    const mockImageUrl = `https://picsum.photos/seed/${Date.now()}/400/300`;
    await sendImageMessage(orderId, mockImageUrl, 'DOCTOR');
    Toast.show({ icon: 'success', content: '图片已发送' });
  };

  const handleShareCgm = async () => {
    if (!orderId) return;
    await shareCgmData(orderId);
    Toast.show({ icon: 'success', content: 'CGM数据已推送' });
  };

  const handlePrescription = () => {
    if (!orderId) return;
    navigate(`/app/doctor/prescription?orderId=${orderId}`);
  };

  const handleFinish = () => {
    if (!orderId) return;
    Modal.confirm({
      content: '确认结束本次问诊？结束后将通知患者确认完结。',
      onConfirm: async () => {
        await finishConsultation(orderId, '医生结束问诊');
        Toast.show({ icon: 'success', content: '已结束问诊' });
        navigate('/app/doctor/consult');
      },
    });
  };

  const renderMessage = (msg: ConsultationMessage) => {
    const isDoctor = msg.sender === 'DOCTOR';
    const isSystem = msg.sender === 'SYSTEM';

    if (isSystem) {
      return (
        <div key={msg.id} className="dc-system-message">
          <span>{msg.content}</span>
        </div>
      );
    }

    return (
      <div key={msg.id} className={`dc-message-row ${isDoctor ? 'dc-right' : 'dc-left'}`}>
        <div className="dc-avatar">{isDoctor ? '医' : '患'}</div>
        <div className="dc-bubble-wrap">
          <div className="dc-bubble">
            {msg.type === 'IMAGE' && msg.image_url ? (
              <img
                src={msg.image_url}
                alt="图片"
                className="dc-image-message"
                onClick={() => setImagePreview(msg.image_url!)}
              />
            ) : msg.type === 'CGM_SHARE' ? (
              <div className="dc-cgm-card">
                <HistogramOutline />
                <span>CGM 数据分享</span>
              </div>
            ) : msg.type === 'PRESCRIPTION_CARD' ? (
              <div className="dc-prescription-card">
                <div className="dc-prescription-header">
                  <FileOutline />
                  <span>电子处方</span>
                </div>
                <div className="dc-prescription-body">{msg.content}</div>
                {msg.prescription_ref && (
                  <Button
                    size="small"
                    fill="outline"
                    color="primary"
                    className="dc-prescription-btn"
                    onClick={() => navigate(`/app/consultation/prescription/${msg.prescription_ref}`)}
                  >
                    查看处方详情
                  </Button>
                )}
              </div>
            ) : (
              <div>{msg.content}</div>
            )}
          </div>
          <div className="dc-time">
            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  if (!currentOrder) {
    return (
      <AppPageFrame title="问诊对话">
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>加载问诊信息中...</div>
      </AppPageFrame>
    );
  }

  const canChat = ['ACCEPTED', 'IN_CONSULT', 'PENDING_PRESCRIPTION',
    'RX_PATIENT_REJECTED', 'PRESCRIPTION_FLOWING'].includes(currentOrder.status);

  return (
    <AppPageFrame title="问诊中">
      <div className="dc-chat-container">
        {/* 患者病情摘要卡 */}
        <div className="dc-patient-card">
          <div className="dc-patient-name">
            {currentOrder.patient_name || `患者 ${currentOrder.patient_id}`}
            <span className="dc-patient-meta">
              · {currentOrder.mode === 'VIDEO' ? '视频问诊' : currentOrder.mode === 'VOICE' ? '语音问诊' : '图文问诊'}
            </span>
          </div>
          <div className="dc-patient-tags">
            <Tag color="primary" fill="outline">
              {currentOrder.urgency === 'SOS' ? 'SOS' : currentOrder.urgency === 'URGENT' ? '紧急' : '普通'}
            </Tag>
            <Tag color={currentOrder.status === 'IN_CONSULT' ? 'success' : 'default'} fill="outline">
              {getStateLabel(currentOrder.status)}
            </Tag>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="dc-message-list">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="dc-footer">
        <div className="dc-action-bar">
          <Space wrap>
            <Button
              size="small"
              fill="outline"
              onClick={handleImageUpload}
              disabled={!canChat}
            >
              <PictureOutline /> 相册
            </Button>
            <Button
              size="small"
              color="primary"
              fill="outline"
              onClick={handlePrescription}
              disabled={!['ACCEPTED', 'IN_CONSULT', 'PENDING_PRESCRIPTION', 'RX_PATIENT_REJECTED'].includes(currentOrder.status)}
            >
              <FileOutline /> 开处方
            </Button>
            <Button
              size="small"
              fill="outline"
              onClick={handleShareCgm}
              disabled={!canChat}
            >
              <HistogramOutline /> 查看CGM
            </Button>
            <Button
              size="small"
              fill="outline"
              disabled={!canChat}
            >
              <SoundOutline /> 转语音
            </Button>
          </Space>
        </div>

        <div className="dc-input-row">
          <TextArea
            className="dc-input"
            placeholder={canChat ? '输入回复...' : '当前状态不可发送消息'}
            value={inputText}
            onChange={setInputText}
            disabled={!canChat}
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          <Button
            color="primary"
            className="dc-send-btn"
            loading={sending}
            disabled={!inputText.trim() || !canChat}
            onClick={handleSendText}
          >
            <SendOutline />
          </Button>
        </div>

        {currentOrder.status === 'IN_CONSULT' && (
          <div className="dc-finish-row">
            <Button block color="success" onClick={handleFinish}>
              结束问诊
            </Button>
          </div>
        )}
      </div>

      {imagePreview && (
        <ImageViewer
          image={imagePreview}
          visible={!!imagePreview}
          onClose={() => setImagePreview(null)}
        />
      )}
    </AppPageFrame>
  );
};

export default DoctorConsultationChatPage;
