/**
 * PG-SUG-LIVE 回放 V1.0.0
 * 
 * 录制文件回放播放（腾讯云VOD），支持倍速（1.0x/1.5x/2.0x）、
 * 关键节点时间轴打点、精彩片段自动剪辑、回放可分享到社区。
 * 关联FN-SUG-LIVE-014 回放与切片
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Space, Tag, Row, Col,
  Divider, Input, Segmented,
} from 'antd';
import {
  PlayCircleOutlined, PauseCircleOutlined,
  ForwardOutlined, BackwardOutlined,
  ShareAltOutlined, LikeOutlined, MessageOutlined,
  ClockCircleOutlined, ExpandOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;

interface KeyMoment {
  time: string; label: string;
}

const keyMoments: KeyMoment[] = [
  { time: '00:05:30', label: '开场介绍' },
  { time: '00:12:45', label: '血糖监测要点' },
  { time: '00:25:10', label: '饮食搭配原则' },
  { time: '00:38:20', label: '用药注意事项' },
  { time: '00:50:15', label: '观众问答环节' },
];

const comments = [
  { id: '1', user: '糖友小王', content: '讲得非常实用！已收藏', time: '2小时前' },
  { id: '2', user: '健康达人', content: '请问回放可以分享到糖友圈吗？', time: '1小时前' },
];

const Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(156);
  const [liked, setLiked] = useState(false);

  return (
    <MobileFrame title="回放" tabs={[]} basePath="live">
      <div>
        {/* 播放器区域 */}
        <div style={{
          height: 220, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          {playing ? (
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, display: 'block', marginBottom: 8 }}>
                🎬 腾讯云VOD播放中…
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                00:15:32 / 01:02:18
              </Text>
            </div>
          ) : (
            <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setPlaying(true)}>
              <PlayCircleOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'block', marginTop: 8 }}>
                点击播放「糖尿病饮食管理」
              </Text>
            </div>
          )}
        </div>

        {/* 播放控制栏 */}
        <div style={{ padding: '8px 12px', background: '#1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={8}>
            <Button size="small" type="text" icon={<BackwardOutlined />} style={{ color: '#fff' }} />
            <Button
              size="small" type="text"
              icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              style={{ color: '#fff' }}
              onClick={() => setPlaying(!playing)}
            />
            <Button size="small" type="text" icon={<ForwardOutlined />} style={{ color: '#fff' }} />
          </Space>
          <Space size={4}>
            <Segmented
              size="small"
              value={speed}
              onChange={setSpeed}
              options={[
                { label: '1x', value: 1.0 },
                { label: '1.5x', value: 1.5 },
                { label: '2x', value: 2.0 },
              ]}
              style={{ background: '#333' }}
            />
            <Button size="small" type="text" icon={<ExpandOutlined />} style={{ color: '#fff' }} />
          </Space>
        </div>

        {/* 视频信息 */}
        <div style={{ padding: 12 }}>
          <Title level={5} style={{ margin: 0 }}>糖尿病饮食管理</Title>
          <Space size={8} style={{ marginTop: 4 }}>
            <Tag icon={<ClockCircleOutlined />} color="blue">62分钟</Tag>
            <Tag color="green">健康科普</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>12.5K次播放 · 2026-07-28</Text>
          </Space>

          {/* 互动 */}
          <Space size={16} style={{ marginTop: 12 }}>
            <Button
              size="small"
              type={liked ? 'primary' : 'default'}
              icon={<LikeOutlined />}
              shape="round"
              onClick={() => { setLiked(!liked); setLikes(l => liked ? l - 1 : l + 1); }}
            >
              {likes}
            </Button>
            <Button size="small" icon={<MessageOutlined />} shape="round" onClick={() => setShowComments(!showComments)}>
              评论
            </Button>
            <Button size="small" icon={<ShareAltOutlined />} shape="round">分享</Button>
          </Space>

          <Divider style={{ margin: '12px 0' }} />

          {/* 关键节点时间轴 */}
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>关键节点</Text>
          {keyMoments.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', marginBottom: 6,
              padding: '6px 8px', borderRadius: 8, background: '#fafafa',
              cursor: 'pointer',
            }}>
              <Tag color="blue" style={{ fontSize: 11, width: 56, textAlign: 'center' }}>{m.time}</Tag>
              <Text style={{ fontSize: 12, marginLeft: 8 }}>{m.label}</Text>
            </div>
          ))}
        </div>

        <Divider style={{ margin: '0 12px', width: 'auto' }} />

        {/* 评论 */}
        {showComments && (
          <div style={{ padding: 12 }}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>评论</Text>
            {comments.map(c => (
              <Card key={c.id} size="small" style={{ marginBottom: 6, borderRadius: 8 }}>
                <Space>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#f0f0f0', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>👤</div>
                  <div>
                    <Text strong style={{ fontSize: 12 }}>{c.user}</Text>
                    <Text style={{ fontSize: 11, display: 'block' }}>{c.content}</Text>
                    <Text type="secondary" style={{ fontSize: 10 }}>{c.time}</Text>
                  </div>
                </Space>
              </Card>
            ))}
            <Input placeholder="发表评论…" size="small" style={{ marginTop: 8, borderRadius: 16 }} />
          </div>
        )}
      </div>
    </MobileFrame>
  );
};

export default Page;
