/**
 * APP医生患者管理页
 */
import React from 'react';
import { Card, Avatar, Tag, Input, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import MobileFrame, { APP_DOCTOR_TABS } from '@/components/MobileFrame';

const PATIENTS = [
  { name: '张先生', age: 45, type: '2型', lastConsult: '07-28', cgm: 5.8, status: '关注中', tags: ['视频问诊'], avatar: '👦' },
  { name: '李女士', age: 52, type: '2型', lastConsult: '07-27', cgm: 7.2, status: '偏高', tags: ['图文咨询'], avatar: '👩' },
  { name: '王大爷', age: 68, type: '2型', lastConsult: '07-25', cgm: 6.1, status: '稳定', tags: [], avatar: '👴' },
  { name: '赵女士', age: 38, type: '1型', lastConsult: '07-26', cgm: 5.2, status: '稳定', tags: ['视频问诊'], avatar: '👩‍🦰' },
  { name: '孙先生', age: 55, type: '2型', lastConsult: '07-24', cgm: 8.5, status: '偏高', tags: [], avatar: '👨' },
];

const AppDoctorPatientsPage: React.FC = () => {
  return (
    <MobileFrame title="患者管理" tabs={APP_DOCTOR_TABS} basePath="/app/doctor">
      <div style={{ padding: 12 }}>
        <Input
          prefix={<SearchOutlined />} placeholder="搜索患者..."
          style={{ borderRadius: 20, marginBottom: 10 }}
        />
        <Card size="small" style={{ borderRadius: 10 }} bodyStyle={{ padding: 0 }}>
          <List
            size="small"
            dataSource={PATIENTS}
            renderItem={item => (
              <List.Item style={{ padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <Avatar size={36}>{item.avatar}</Avatar>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {item.name} · {item.age}岁
                      {item.tags.map(t => <Tag key={t} color="blue" style={{ fontSize: 9, marginLeft: 4 }}>{t}</Tag>)}
                    </div>
                    <div style={{ fontSize: 10, color: '#999' }}>
                      {item.type} · 末次就诊 {item.lastConsult}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      color: item.cgm > 7 ? '#f5222d' : '#52c41a',
                    }}>
                      {item.cgm}
                    </div>
                    <Tag
                      color={item.status === '偏高' ? 'orange' : item.status === '稳定' ? 'green' : 'blue'}
                      style={{ fontSize: 9 }}
                    >
                      {item.status}
                    </Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </MobileFrame>
  );
};

export default AppDoctorPatientsPage;
