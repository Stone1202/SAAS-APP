/**
 * PG-SUG-LIVE 弹幕管理 V1.0.0
 * 
 * 实时弹幕展示与管理：腾讯云IM SDK集成，支持弹幕/消息/表情/点赞，
 * 敏感词过滤+自动屏蔽，弹幕显示密度/速度/屏蔽词配置。
 */
import React, { useState } from 'react';
import {
  Typography, Card, Input, Space, Tag, Switch, Segmented,
  Slider, List, Badge, Button, Empty,
} from 'antd';
import {
  MessageOutlined, SettingOutlined, ClearOutlined,
  LikeOutlined, HeartOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;
const { Search } = Input;

interface DanmakuMsg {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  type: 'normal' | 'super' | 'gift';
}

const mockMsgs: DanmakuMsg[] = [
  { id: '1', user: '糖友小王', avatar: '🧑', content: '讲得真好！', time: '14:30:12', type: 'normal' },
  { id: '2', user: '健康达人', avatar: '👩', content: '每天测几次血糖合适？', time: '14:30:15', type: 'super' },
  { id: '3', user: '新糖友', avatar: '👨', content: '扫码加微信咨询', time: '14:30:18', type: 'normal' },
  { id: '4', user: '养生哥', avatar: '🧔', content: '🎁 送出小心心', time: '14:30:20', type: 'gift' },
];

const Page: React.FC = () => {
  const [tab, setTab] = useState<'list' | 'setting'>('list');
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [density, setDensity] = useState(50);
  const [speed, setSpeed] = useState(60);

  const blocked = mockMsgs.filter(m => m.content.includes('加微信'));
  const shown = onlyBlocked ? blocked : mockMsgs;

  return (
    <MobileFrame title="弹幕管理" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        <Segmented
          block
          size="small"
          value={tab}
          onChange={(v) => setTab(v as 'list' | 'setting')}
          options={[
            { label: '弹幕列表', value: 'list' },
            { label: '设置', value: 'setting' },
          ]}
          style={{ marginBottom: 12 }}
        />

        {tab === 'list' && (
          <div>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
              <Space size={4}>
                <Tag color="blue">{mockMsgs.length} 条</Tag>
                <Button size="small" danger={onlyBlocked} type={onlyBlocked ? 'primary' : 'default'}
                  onClick={() => setOnlyBlocked(!onlyBlocked)}>
                  仅看拦截
                </Button>
              </Space>
              <Button size="small" icon={<ClearOutlined />}>清空</Button>
            </Space>

            {shown.map(msg => (
              <Card
                key={msg.id}
                size="small"
                style={{
                  marginBottom: 6, borderRadius: 8,
                  borderLeft: msg.type === 'super' ? '3px solid #722ed1' : msg.type === 'gift' ? '3px solid #fa8c16' : undefined,
                  background: msg.content.includes('加微信') ? '#fff7e6' : '#fff',
                }}
              >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size={6}>
                    <span>{msg.avatar}</span>
                    <Text strong style={{ fontSize: 12 }}>{msg.user}</Text>
                    {msg.type === 'super' && <Tag color="purple" style={{ fontSize: 10 }}>超级弹幕</Tag>}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 10 }}>{msg.time}</Text>
                </Space>
                <Text style={{ display: 'block', marginTop: 3, fontSize: 13 }}>{msg.content}</Text>
                {msg.content.includes('加微信') && (
                  <Space style={{ marginTop: 4 }}>
                    <Tag color="red" style={{ fontSize: 10 }}>已拦截</Tag>
                    <Button size="small" type="link" style={{ padding: 0, fontSize: 11 }}>放行</Button>
                  </Space>
                )}
              </Card>
            ))}
          </div>
        )}

        {tab === 'setting' && (
          <div>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
              <Text strong style={{ fontSize: 13 }}>弹幕显示</Text>
              <div style={{ marginTop: 12 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12 }}>显示密度</Text>
                  <Text style={{ fontSize: 12, color: '#1677ff' }}>{density}%</Text>
                </Space>
                <Slider value={density} onChange={setDensity} />
              </div>
              <div style={{ marginTop: 8 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12 }}>滚动速度</Text>
                  <Text style={{ fontSize: 12, color: '#1677ff' }}>{speed}%</Text>
                </Space>
                <Slider value={speed} onChange={setSpeed} />
              </div>
            </Card>

            <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 13 }}>敏感词过滤</Text>
                <Switch defaultChecked size="small" />
              </Space>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>屏蔽词列表</Text>
                <Space wrap style={{ marginTop: 4 }}>
                  {['微信', '扫码', '加V', '私聊', '电话'].map(w => (
                    <Tag key={w} closable color="orange" style={{ fontSize: 11 }}>{w}</Tag>
                  ))}
                </Space>
                <Input
                  size="small"
                  placeholder="添加新屏蔽词"
                  style={{ marginTop: 6 }}
                />
              </div>
            </Card>

            <Card size="small" style={{ borderRadius: 10 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 13 }}>弹幕类型</Text>
              </Space>
              <div style={{ marginTop: 8 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space><MessageOutlined /><Text style={{ fontSize: 12 }}>普通弹幕</Text></Space>
                  <Switch defaultChecked size="small" />
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space><HeartOutlined /><Text style={{ fontSize: 12 }}>点赞弹幕</Text></Space>
                  <Switch defaultChecked size="small" />
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space><Badge color="purple" /><Text style={{ fontSize: 12 }}>超级弹幕</Text></Space>
                  <Switch defaultChecked size="small" />
                </Space>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MobileFrame>
  );
};

export default Page;
