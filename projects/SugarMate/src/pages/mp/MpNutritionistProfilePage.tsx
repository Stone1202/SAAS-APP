/**
 * MpNutritionistProfilePage — PG-SUG-MP-011 营养师名片
 */
import React from 'react';
import { Typography, Button, Tag, Avatar, Card, Rate } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MpPageFrame from '../../components/MpPageFrame';

const { Title, Text } = Typography;

const MpNutritionistProfilePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <MpPageFrame title="营养师名片">
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12, textAlign: 'center', marginBottom: 12 }}>
          <Avatar size={64} style={{ background: '#4CAF50' }}>王</Avatar>
          <Title level={4} style={{ marginTop: 8, marginBottom: 2 }}>王营养师</Title>
          <Text type="secondary">注册营养师 · 糖尿病管理师</Text>
          <div style={{ marginTop: 4 }}><Rate disabled value={4.7} style={{ fontSize: 14 }} /> <Text style={{ fontSize: 12, color: '#999' }}>4.7 (156评价)</Text></div>
          <div style={{ marginTop: 10 }}><Tag color="green">饮食管理</Tag><Tag color="green">运动指导</Tag><Tag color="green">血糖监测</Tag></div>
        </Card>
        <Card title="执业信息" size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 13 }}>🎓 中国注册营养师 · 从业8年</div>
        </Card>
        <Button type="primary" block size="large" icon={<MessageOutlined />} style={{ borderRadius: 10 }} onClick={() => navigate('/mp/consult')}>
          在线咨询
        </Button>
      </div>
    </MpPageFrame>
  );
};
export default MpNutritionistProfilePage;
