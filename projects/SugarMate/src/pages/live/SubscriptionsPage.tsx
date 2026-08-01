/**
 * PG-SUG-LIVE 关注订阅 V1.0.0
 * 
 * 关注主播列表、开播提醒管理、我的关注管理、
 * 预约直播列表、主播动态查看。
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Space, Tag, Row, Col,
  List, Segmented, Badge, Empty, Switch,
} from 'antd';
import {
  BellOutlined, ClockCircleOutlined, UserOutlined,
  BellFilled, CalendarOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;

interface Host {
  id: string; name: string; title: string; avatar: string;
  followers: number; isLive: boolean; nextLive?: string;
  subscribed: boolean; notify: boolean;
}

const hosts: Host[] = [
  { id: '1', name: '张医生', title: '内分泌科 主任医师', avatar: '👨‍⚕️', followers: 12800, isLive: false, nextLive: '明晚 19:30', subscribed: true, notify: true },
  { id: '2', name: '赵营养师', title: '国家注册营养师', avatar: '👩‍⚕️', followers: 8900, isLive: true, subscribed: true, notify: true },
  { id: '3', name: '王药师', title: '临床药学专家', avatar: '👨‍🔬', followers: 6600, isLive: false, nextLive: '周四 20:00', subscribed: true, notify: false },
  { id: '4', name: '李康复师', title: '运动康复指导师', avatar: '🏃', followers: 4200, isLive: false, subscribed: true, notify: false },
];

const Page: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'live'>('all');
  const [hostList, setHostList] = useState(hosts);

  const toggleNotify = (id: string) => {
    setHostList(prev => prev.map(h => h.id === id ? { ...h, notify: !h.notify } : h));
  };

  const filtered = filter === 'live'
    ? hostList.filter(h => h.isLive)
    : hostList;

  return (
    <MobileFrame title="关注订阅" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        <Segmented
          block
          size="small"
          value={filter}
          onChange={(v) => setFilter(v as 'all' | 'live')}
          options={[
            { label: '全部关注', value: 'all' },
            { label: '正在直播', value: 'live', icon: <Badge status="error" /> },
          ]}
          style={{ marginBottom: 12 }}
        />

        {filtered.length === 0 ? (
          <Empty description={filter === 'live' ? '当前无主播在直播' : '暂无关注的播主'} />
        ) : (
          filtered.map(h => (
            <Card key={h.id} size="small" style={{ marginBottom: 8, borderRadius: 10 }}>
              <Row align="middle">
                <Col>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{h.avatar}</div>
                </Col>
                <Col flex={1} style={{ paddingLeft: 10 }}>
                  <Space size={4}>
                    <Text strong style={{ fontSize: 13 }}>{h.name}</Text>
                    {h.isLive && <Badge status="error" text={<span style={{ fontSize: 10, color: '#ff4d4f' }}>直播中</span>} />}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                    {h.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    <UserOutlined /> {(h.followers / 10000).toFixed(1)}万粉丝
                  </Text>
                  {h.nextLive && !h.isLive && (
                    <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                      <CalendarOutlined /> {h.nextLive}
                    </Text>
                  )}
                </Col>
                <Col>
                  <Space direction="vertical" size={4} style={{ textAlign: 'center' }}>
                    <Switch
                      size="small"
                      checked={h.notify}
                      checkedChildren={<BellFilled />}
                      unCheckedChildren={<BellOutlined />}
                      onChange={() => toggleNotify(h.id)}
                    />
                    {h.isLive ? (
                      <Button size="small" type="primary" shape="round" style={{ fontSize: 11 }}>
                        进入直播
                      </Button>
                    ) : (
                      <Button size="small" shape="round" style={{ fontSize: 11 }}>
                        查看
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          ))
        )}

        <Card size="small" style={{ borderRadius: 10, marginTop: 12, background: '#f6f8fa' }}>
          <Space>
            <BellOutlined style={{ color: '#1677ff' }} />
            <Text style={{ fontSize: 12 }}>
              已开启 {hostList.filter(h => h.notify).length}/{hostList.length} 位主播的开播提醒
            </Text>
          </Space>
        </Card>
      </div>
    </MobileFrame>
  );
};

export default Page;
