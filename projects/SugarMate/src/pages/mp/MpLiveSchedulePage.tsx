/**
 * PG-SUG-MP-008 直播预告 V1.0.0
 * 
 * 直播预告与轻观看（引流至直播APP）：3种卡片形态（即将开播/正在直播/回放）、
 * 轻观看页（仅播放+弹幕+点赞，无购物车/打赏/连麦）、预约提醒、
 * 回放倍速播放+关键节点、底部引导下载APP。
 * 关联UC-SUG-MP-008 直播预告与轻观看
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Space, Tag, Row, Col,
  Badge, Segmented, Empty, Input,
} from 'antd';
import {
  PlayCircleOutlined, ClockCircleOutlined,
  BellOutlined, UserOutlined, FireOutlined,
  DownloadOutlined, CaretRightOutlined,
  PauseCircleOutlined, ForwardOutlined,
  LikeOutlined, MessageOutlined,
} from '@ant-design/icons';
import MpPageFrame from '../../components/MpPageFrame';

const { Text, Title } = Typography;

interface LiveEvent {
  id: string;
  title: string;
  host: string;
  hostTitle: string;
  avatar: string;
  status: 'upcoming' | 'live' | 'replay';
  time?: string;
  viewers?: number;
  products?: string[];
  duration?: number;
}

const events: LiveEvent[] = [
  { id: '1', title: '糖尿病患者夏季饮食指南', host: '张医生', hostTitle: '内分泌科主任医师', avatar: '👨‍⚕️', status: 'upcoming', time: '7月29日 19:30', duration: 60, products: ['血糖仪', '代餐饼干'] },
  { id: '2', title: '低GI零食直播专场', host: '赵营养师', hostTitle: '国家注册营养师', avatar: '👩‍⚕️', status: 'live', viewers: 856, duration: 28 },
  { id: '3', title: '胰岛素注射技巧详解', host: '王药师', hostTitle: '临床药学专家', avatar: '👨‍🔬', status: 'replay', duration: 55 },
  { id: '4', title: '糖友运动康复指导', host: '李康复师', hostTitle: '运动医学指导师', avatar: '🏃', status: 'upcoming', time: '8月1日 19:00', duration: 60 },
];

const Page: React.FC = () => {
  const [watchingId, setWatchingId] = useState<string | null>(null);

  const watching = events.find(e => e.id === watchingId);

  if (watching && watching.status === 'live') {
    // 轻观看页
    return (
      <MpPageFrame title="正在直播" onBack={() => setWatchingId(null)}>
        <div>
          {/* 播放器 */}
          <div style={{
            height: 220, background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', color: '#fff',
          }}>
            <CaretRightOutlined style={{ fontSize: 40, opacity: 0.6 }} />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 }}>
              轻观看模式：仅播放画面+弹幕
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 4 }}>
              👁 {watching.viewers} 在线观看
            </Text>
          </div>

          <div style={{ padding: 12 }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Space>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#f0f5ff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>{watching.avatar}</div>
                  <div>
                    <Text strong style={{ fontSize: 13 }}>{watching.host}</Text>
                    <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>{watching.hostTitle}</Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Badge status="error" text="直播中" />
              </Col>
            </Row>
            <Title level={5} style={{ margin: '8px 0 4px' }}>{watching.title}</Title>

            <Space size={16} style={{ marginTop: 8 }}>
              <Button size="small" icon={<LikeOutlined />} shape="round">点赞</Button>
              <Button size="small" icon={<MessageOutlined />} shape="round">弹幕</Button>
            </Space>
          </div>

          {/* 底部引导下载APP */}
          <div style={{
            margin: '0 12px', borderRadius: 12,
            background: 'linear-gradient(135deg, #1677ff, #0958d9)',
            padding: 12,
          }}>
            <Text style={{ color: '#fff', fontSize: 13, display: 'block' }}>
              打开APP参与互动、购买商品、领取优惠
            </Text>
            <Button
              type="primary" block size="large"
              icon={<DownloadOutlined />}
              style={{ marginTop: 8, background: '#fff', color: '#1677ff', borderRadius: 20 }}
            >
              打开SugarMate APP
            </Button>
          </div>
        </div>
      </MpPageFrame>
    );
  }

  return (
    <MpPageFrame title="直播预告">
      <div style={{ padding: 12 }}>
        {/* 即将开播高亮 */}
        {events.filter(e => e.status === 'upcoming').slice(0, 1).map(e => (
          <Card
            key={e.id}
            style={{
              borderRadius: 12, marginBottom: 12,
              borderLeft: '4px solid #fa8c16',
              background: '#fffbf0',
            }}
          >
            <Row align="middle">
              <Col flex={1}>
                <Tag color="orange" icon={<ClockCircleOutlined />} style={{ marginBottom: 4 }}>
                  即将开播
                </Tag>
                <Text strong style={{ fontSize: 14, display: 'block' }}>{e.title}</Text>
                <Space size={4} style={{ marginTop: 4 }}>
                  <Tag icon={<UserOutlined />} color="blue" style={{ fontSize: 10 }}>{e.host}</Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>{e.time}</Text>
                </Space>
                {e.products && (
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 10 }}>预告商品：</Text>
                    {e.products.map(p => <Tag key={p} style={{ fontSize: 9 }}>{p}</Tag>)}
                  </div>
                )}
              </Col>
              <Col>
                <Button size="small" type="primary" shape="round" icon={<BellOutlined />}>
                  预约
                </Button>
              </Col>
            </Row>
          </Card>
        ))}

        {/* 正在直播 */}
        {events.filter(e => e.status === 'live').map(e => (
          <Card
            key={e.id}
            style={{
              borderRadius: 12, marginBottom: 10,
              background: '#fff1f0',
            }}
            onClick={() => setWatchingId(e.id)}
          >
            <Row align="middle">
              <Col>
                <div style={{
                  width: 80, height: 56, borderRadius: 8,
                  background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PlayCircleOutlined style={{ fontSize: 24, color: '#fff' }} />
                </div>
              </Col>
              <Col flex={1} style={{ paddingLeft: 12 }}>
                <Space size={4} style={{ marginBottom: 2 }}>
                  <Badge status="error" />
                  <Text style={{ fontSize: 10, color: '#ff4d4f' }}>直播中</Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    👁 {e.viewers}观看 · 已播{e.duration}分钟
                  </Text>
                </Space>
                <Text strong style={{ fontSize: 13, display: 'block' }}>{e.title}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{e.host} · {e.hostTitle}</Text>
              </Col>
              <Col>
                <Button size="small" type="primary" shape="round">观看</Button>
              </Col>
            </Row>
          </Card>
        ))}

        {/* 回放 */}
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8, marginTop: 16 }}>
          精彩回放
        </Text>
        {events.filter(e => e.status === 'replay').map(e => (
          <Card key={e.id} size="small" style={{ marginBottom: 8, borderRadius: 10 }}>
            <Row align="middle">
              <Col>
                <div style={{
                  width: 64, height: 48, borderRadius: 8,
                  background: '#f5f5f5', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <PlayCircleOutlined style={{ fontSize: 20, color: '#666' }} />
                </div>
              </Col>
              <Col flex={1} style={{ paddingLeft: 10 }}>
                <Text strong style={{ fontSize: 12 }}>{e.title}</Text>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                  {e.host} · {e.duration}分钟
                </Text>
              </Col>
              <Col>
                <Tag color="blue">回放</Tag>
              </Col>
            </Row>
          </Card>
        ))}

        {/* 底部引导 */}
        <Card style={{
          borderRadius: 12, marginTop: 12,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
        }} bodyStyle={{ padding: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ color: '#fff', fontSize: 14, display: 'block' }}>
              更多精彩直播
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginTop: 4 }}>
              下载APP参与互动、购物、打赏等完整直播体验
            </Text>
            <Button
              type="primary" shape="round"
              icon={<DownloadOutlined />}
              style={{ marginTop: 12, background: '#fff', color: '#667eea', border: 'none' }}
            >
              打开APP
            </Button>
          </div>
        </Card>
      </div>
    </MpPageFrame>
  );
};

export default Page;
