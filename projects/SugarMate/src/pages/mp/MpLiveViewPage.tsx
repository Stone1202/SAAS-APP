/**
 * MpLiveViewPage — PG-SUG-MP-007 直播轻观看
 */
import React from 'react';
import { Typography, Button, Input, Tag, Space } from 'antd';
import { HeartOutlined, GiftOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons';
import MpPageFrame from '../../components/MpPageFrame';

const { Text } = Typography;

const MOCK_COMMENTS = [
  { user: '糖友小王', text: '李医生讲得真好！', time: '刚刚' },
  { user: '健康达人', text: '餐后血糖多少算正常？', time: '1分钟前' },
  { user: '新糖人', text: '刚确诊，学到了很多', time: '2分钟前' },
];

const MpLiveViewPage: React.FC = () => (
  <MpPageFrame title="直播间">
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 视频区 */}
      <div style={{ height: 200, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Text style={{ color: '#fff', fontSize: 24 }}>🔴 LIVE</Text>
        <Tag color="red" style={{ position: 'absolute', top: 8, right: 8 }}>1234人在看</Tag>
        <Tag style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none' }}>
          李医生 · 糖尿病饮食管理
        </Tag>
      </div>
      {/* 互动区 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: '#fff' }}>
        {MOCK_COMMENTS.map((c, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 12, color: '#2196F3' }}>{c.user}</Text>
            <Text style={{ fontSize: 12 }}>：{c.text}</Text>
            <Text type="secondary" style={{ fontSize: 10, marginLeft: 6 }}>{c.time}</Text>
          </div>
        ))}
      </div>
      {/* 底部操作 */}
      <div style={{ padding: 8, background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button type="text" icon={<HeartOutlined />} size="small" />
        <Button type="text" icon={<GiftOutlined />} size="small" />
        <Input placeholder="说点什么..." size="small" style={{ borderRadius: 16, flex: 1 }} />
        <Button type="primary" icon={<SendOutlined />} size="small" shape="circle" />
      </div>
    </div>
  </MpPageFrame>
);
export default MpLiveViewPage;
