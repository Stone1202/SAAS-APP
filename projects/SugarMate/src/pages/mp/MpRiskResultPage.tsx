/**
 * MpRiskResultPage — PG-SUG-MP-004 风险评估结果
 */
import React from 'react';
import { Typography, Button, Card, Statistic, Progress, Space } from 'antd';
import { DownloadOutlined, RightOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import MpPageFrame from '../../components/MpPageFrame';

const { Title, Text, Paragraph } = Typography;

const MpRiskResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const score = (location.state as any)?.score ?? 5;
  const maxScore = 10;

  let level: string; let color: string; let desc: string;
  if (score <= 3) { level = '低风险'; color = '#4CAF50'; desc = '您的糖尿病风险较低，请保持健康的生活方式。' }
  else if (score <= 6) { level = '中等风险'; color = '#FF9800'; desc = '您有一定糖尿病风险，建议定期体检并关注血糖变化。' }
  else { level = '高风险'; color = '#F44336'; desc = '您的糖尿病风险较高，强烈建议您尽快就医进行血糖检测。' }

  return (
    <MpPageFrame title="评估结果">
      <div style={{ padding: 16, minHeight: '100%' }}>
        <Card style={{ borderRadius: 12, textAlign: 'center', marginBottom: 12 }}>
          <Title level={5} style={{ marginBottom: 16 }}>您的糖尿病风险评估结果</Title>
          <Progress type="circle" percent={Math.round((score / maxScore) * 100)} format={() => `${score}/${maxScore}`} strokeColor={color} size={120} />
          <Title level={4} style={{ color, marginTop: 12 }}>{level}</Title>
          <Text type="secondary">{desc}</Text>
        </Card>

        <Card title="📋 健康建议" size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <ul style={{ paddingLeft: 20, fontSize: 13 }}>
            <li>均衡饮食，控制糖分和精制碳水摄入</li>
            <li>每周至少进行150分钟中等强度运动</li>
            <li>保持健康体重，BMI控制在24以下</li>
            <li>定期监测空腹血糖和餐后血糖</li>
            <li>40岁以上建议每年做一次糖耐量检测</li>
          </ul>
        </Card>

        <Button type="primary" block size="large" icon={<DownloadOutlined />} style={{ borderRadius: 10, marginBottom: 12 }}>
          下载SugarMate APP，获取专业控糖服务
        </Button>
        <Button block style={{ borderRadius: 10 }} onClick={() => navigate('/mp/nearby')}>
          查看附近药房 <RightOutlined />
        </Button>
      </div>
    </MpPageFrame>
  );
};
export default MpRiskResultPage;
