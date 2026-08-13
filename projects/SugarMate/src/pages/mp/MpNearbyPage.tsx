/**
 * MpNearbyPage — PG-SUG-MP-009 附近药房列表
 */
import React from 'react';
import { Card, Tag, Rate, Typography } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MobileFrame, { MP_TABS } from '../../components/MobileFrame';

const { Text } = Typography;

const MOCK_PHARMACIES = [
  { id: 1, name: '国大药房（新华路店）', distance: '0.3km', rating: 4.8, address: '新华路128号一层', phone: '021-6283-1122', hours: '08:00-22:00', tags: ['医保定点', '24H送药', '糖尿病专区'] },
  { id: 2, name: '老百姓大药房（南京西路店）', distance: '0.8km', rating: 4.6, address: '南京西路1588号', phone: '021-5288-3366', hours: '08:30-21:30', tags: ['医保定点', '线上处方'] },
  { id: 3, name: '益丰大药房（长寿路店）', distance: '1.2km', rating: 4.7, address: '长寿路401号', phone: '021-6227-8899', hours: '07:30-23:00', tags: ['24H营业', '医保定点', '免费测血糖'] },
  { id: 4, name: '华氏大药房（静安寺店）', distance: '1.5km', rating: 4.5, address: '万航渡路838号', phone: '021-6218-7755', hours: '08:00-21:00', tags: ['医保定点', '糖尿病专科'] },
  { id: 5, name: '海王星辰（曹家渡店）', distance: '2.0km', rating: 4.4, address: '曹家渡路320号', phone: '021-6233-1100', hours: '09:00-22:00', tags: ['线上医保', '送药到家'] },
];

const MpNearbyPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <MobileFrame title="附近" tabs={MP_TABS} basePath="/mp">
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#333' }}>
          <EnvironmentOutlined style={{ marginRight: 4, color: '#2196F3' }} />附近药房
        </div>
        {MOCK_PHARMACIES.map(p => (
          <Card key={p.id} size="small" style={{ borderRadius: 10, marginBottom: 10, cursor: 'pointer' }}
            onClick={() => navigate(`/mp/pharmacy/${p.id}`)} bodyStyle={{ padding: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🏪</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 14 }}>{p.name}</Text>
                  <Tag color="blue" style={{ fontSize: 11 }}>{p.distance}</Tag>
                </div>
                <Rate disabled value={p.rating} style={{ fontSize: 12, marginTop: 2 }} />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  <EnvironmentOutlined /> {p.address}<br/>
                  <PhoneOutlined /> {p.phone} · <ClockCircleOutlined /> {p.hours}
                </div>
                <div style={{ marginTop: 6 }}>{p.tags.map(t => <Tag key={t} style={{ fontSize: 10, marginBottom: 2 }}>{t}</Tag>)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MobileFrame>
  );
};
export default MpNearbyPage;
