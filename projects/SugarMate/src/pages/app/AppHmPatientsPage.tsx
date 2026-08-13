/**
 * APP-HM患者管理页
 */
import React from 'react';
import { Card, Input, Tag, Progress } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import MobileFrame, { APP_HM_TABS } from '@/components/MobileFrame';

const AppHmPatientsPage: React.FC = () => {
  return (
    <MobileFrame title="患者管理" tabs={APP_HM_TABS} basePath="/app/hm">
      <div style={{ padding: 12 }}>
        <Input prefix={<SearchOutlined />} placeholder="搜索患者..." style={{ borderRadius: 20, marginBottom: 10 }} />
        {[
          { name: '张先生', age: 45, cgm: '5.8', tir: 72, status: '正常', avatar: '👦' },
          { name: '李女士', age: 52, cgm: '7.2', tir: 58, status: '偏高', avatar: '👩' },
          { name: '王大爷', age: 68, cgm: '6.1', tir: 65, status: '正常', avatar: '👴' },
          { name: '赵女士', age: 38, cgm: '5.2', tir: 88, status: '优秀', avatar: '👩‍🦰' },
        ].map((p, i) => (
          <Card key={i} size="small" style={{ borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {p.avatar} {p.name} · {p.age}岁
              </div>
              <Tag color={p.status === '优秀' ? 'success' : p.status === '偏高' ? 'warning' : 'processing'} style={{ fontSize: 10 }}>{p.status}</Tag>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: parseFloat(p.cgm) > 7 ? '#f5222d' : '#52c41a' }}>
                {p.cgm} <span style={{ fontSize: 10, color: '#999' }}>mmol/L</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999' }}>
                  <span>TIR</span><span>{p.tir}%</span>
                </div>
                <Progress percent={p.tir} size="small" strokeColor={p.tir > 70 ? 'var(--color-success)' : 'var(--color-warning)'} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MobileFrame>
  );
};

export default AppHmPatientsPage;
