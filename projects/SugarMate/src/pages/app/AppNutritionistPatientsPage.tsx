/**
 * APP营养师患者页
 */
import React from 'react';
import { Card, Input, Tag, List, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import MobileFrame, { APP_NUTRITIONIST_TABS } from '@/components/MobileFrame';

const PATIENTS = [
  { name: '张先生', age: 45, plan: '低碳水饮食方案', status: '执行中', cgm: 5.8, days: 28 },
  { name: '李女士', age: 52, plan: '地中海饮食方案', status: '调整中', cgm: 7.2, days: 45 },
  { name: '王大爷', age: 68, plan: '低盐低糖方案', status: '稳定', cgm: 6.1, days: 90 },
];

const AppNutritionistPatientsPage: React.FC = () => {
  return (
    <MobileFrame title="患者管理" tabs={APP_NUTRITIONIST_TABS} basePath="/app/nutritionist">
      <div style={{ padding: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="搜索患者..." style={{ borderRadius: 20, marginBottom: 10 }} />
        {PATIENTS.map((p, i) => (
          <Card key={i} size="small" style={{ borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {p.name} · {p.age}岁
                  <Tag color={p.status === '稳定' ? 'green' : p.status === '执行中' ? 'processing' : 'warning'} style={{ fontSize: 10, marginLeft: 6 }}>{p.status}</Tag>
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{p.plan} · 跟踪{p.days}天</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: p.cgm > 7 ? '#f5222d' : '#52c41a' }}>{p.cgm}</div>
                <div style={{ fontSize: 9, color: '#999' }}>mmol/L</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MobileFrame>
  );
};

export default AppNutritionistPatientsPage;
