/**
 * APP医生直播页 — 直播推流入口
 */
import React from 'react';
import { Card, Tag, Button } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined, VideoCameraOutlined, EyeOutlined } from '@ant-design/icons';
import MobileFrame, { APP_DOCTOR_TABS } from '@/components/MobileFrame';

const AppDoctorLivePage: React.FC = () => {
  return (
    <MobileFrame title="直播" tabs={APP_DOCTOR_TABS} basePath="/app/doctor">
      <div style={{ padding: 12 }}>
        {/* 开始直播按钮 */}
        <Card
          style={{
            borderRadius: 12, marginBottom: 12,
            background: 'linear-gradient(135deg, #f5222d, #ff4d4f)',
          }}
          bodyStyle={{ padding: 24, textAlign: 'center' }}
        >
          <VideoCameraOutlined style={{ fontSize: 36, color: '#fff', marginBottom: 8 }} />
          <div style={{ color: '#fff', marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>开始直播</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>推流到 SugarMate 直播平台</div>
          </div>
          <Button type="primary" ghost icon={<PlayCircleOutlined />} style={{ borderRadius: 20 }}>
            立即开播
          </Button>
        </Card>

        {/* 直播记录 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<span style={{ fontSize: 13 }}>我的直播</span>}>
          {[
            { title: '糖尿病患者夏季饮食指南', date: '07-28 19:30', views: '1.2k', status: '回放' },
            { title: '胰岛素使用注意事项', date: '07-25 20:00', views: '980', status: '回放' },
            { title: '血糖监测的正确方法', date: '07-22 19:00', views: '1.5k', status: '回放' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: '#999' }}>{item.date} · <EyeOutlined /> {item.views}</div>
              </div>
              <Tag color="default">{item.status}</Tag>
            </div>
          ))}
        </Card>

        {/* 直播预约 */}
        <Card size="small" style={{ borderRadius: 10 }}
          title={<span style={{ fontSize: 13 }}>待开播</span>}>
          {[
            { title: '糖友运动指南', date: '07-30 19:30', status: '预约中', booked: 56 },
            { title: '糖尿病与心理健康', date: '08-02 20:00', status: '预约中', booked: 32 },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: i < 1 ? '1px solid #f0f0f0' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: '#999' }}><ClockCircleOutlined /> {item.date}</div>
              </div>
              <Tag color="blue">{item.status} {item.booked}人</Tag>
            </div>
          ))}
        </Card>
      </div>
    </MobileFrame>
  );
};

export default AppDoctorLivePage;
