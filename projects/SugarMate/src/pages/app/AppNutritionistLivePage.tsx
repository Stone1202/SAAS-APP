/**
 * APP营养师直播页
 */
import React from 'react';
import { Card, Button, Tag } from 'antd';
import { VideoCameraOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
import MobileFrame, { APP_NUTRITIONIST_TABS } from '@/components/MobileFrame';

const AppNutritionistLivePage: React.FC = () => {
  return (
    <MobileFrame title="直播" tabs={APP_NUTRITIONIST_TABS} basePath="/app/nutritionist">
      <div style={{ padding: 12 }}>
        <Card style={{ borderRadius: 12, marginBottom: 12, background: 'linear-gradient(135deg, #f5222d, #ff4d4f)' }}
          bodyStyle={{ padding: 24, textAlign: 'center' }}>
          <VideoCameraOutlined style={{ fontSize: 36, color: '#fff', marginBottom: 8 }} />
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>开始直播</div>
            <div style={{ fontSize: 11, opacity: 0.85, margin: '4px 0 12px' }}>饮食科普直播</div>
          </div>
          <Button type="primary" ghost icon={<PlayCircleOutlined />} style={{ borderRadius: 20 }}>立即开播</Button>
        </Card>
        <Card size="small" style={{ borderRadius: 10 }} title={<span style={{ fontSize: 13 }}>回放</span>}>
          {['低GI饮食实操指南', '糖尿病友好早餐搭配', '控糖零食怎么选'].map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none', fontSize: 12 }}>
              <span>{t}</span>
              <span style={{ color: '#999' }}><EyeOutlined /> {(Math.random() * 2000 + 500 | 0)}次</span>
            </div>
          ))}
        </Card>
      </div>
    </MobileFrame>
  );
};

export default AppNutritionistLivePage;
