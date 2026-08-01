import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Result, Toast } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';

const EmergencySosPage: React.FC = () => {
  const navigate = useNavigate();
  const { doctors, init } = useConsultationStore();
  const [triggered, setTriggered] = useState(false);

  const handleSOS = async () => {
    setTriggered(true);
    await init();
    // 找到在线医生并创建SOS订单
    Toast.show({ icon: 'success', content: 'SOS已触发·紧急广播中' });
    // 模拟3秒后医生接诊
    setTimeout(() => {
      navigate('/app/consultation/waiting/con-006');
    }, 3000);
  };

  return (
    <AppPageFrame title="紧急SOS">
      <div style={{ padding: 24, textAlign: 'center', paddingTop: 60 }}>
        <Result
          status="warning"
          title="SOS 紧急问诊"
          description={
            <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>
              <p>⚠️ 您的CGM数据检测到异常值</p>
              <p>系统将立即触发SOS快速问诊</p>
              <p>所有在线医生将收到紧急通知</p>
            </div>
          }
        />
        {!triggered ? (
          <Button
            color="danger"
            size="large"
            style={{ borderRadius: 24, marginTop: 24, height: 48, fontSize: 16, width: '80%' }}
            onClick={handleSOS}
          >
            🚨 立即求助
          </Button>
        ) : (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1677ff', animation: 'pulse 1.5s infinite' }}>
              正在为您连接医生...
            </div>
          </div>
        )}
        <Button color="default" fill="none" style={{ marginTop: 16 }} onClick={() => navigate('/app/consultation')}>
          返回
        </Button>
      </div>
    </AppPageFrame>
  );
};

export default EmergencySosPage;
