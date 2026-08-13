/**
 * PG-SUG-LIVE 安全审核中心 V1.0.0
 * 
 * AI实时审核直播画面+音频+弹幕内容，支持敏感词过滤、违规画面检测、
 * 延时播出机制，管理员复核+违规处罚记录+风险词库管理。
 * 关联UC-SUG-LIVE-004 直播风控
 */
import React, { useState } from 'react';
import {
  Typography, Card, Table, Tag, Space, Button, Input,
  Row, Col, Statistic, Tabs, Segmented, List, Empty,
} from 'antd';
import {
  SafetyCertificateOutlined, SearchOutlined, SoundOutlined,
  WarningOutlined, AudioOutlined, PictureOutlined, EyeOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;
const { Search } = Input;

type ReviewTab = 'realtime' | 'records' | 'lexicon';

interface AuditLog {
  id: string;
  room: string;
  host: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  severity: 'safe' | 'suspicious' | 'danger';
  action: 'pass' | 'block' | 'warn';
  time: string;
}

const mockLogs: AuditLog[] = [
  { id: '1', room: '糖尿病饮食管理', host: '张医生', type: 'text', content: '扫码加微信咨询', severity: 'danger', action: 'block', time: '14:32' },
  { id: '2', room: '血糖控制技巧', host: '李药师', type: 'image', content: '药品包装特写', severity: 'suspicious', action: 'warn', time: '14:28' },
  { id: '3', room: '胰岛素使用指南', host: '王医生', type: 'audio', content: '用药指导话术', severity: 'safe', action: 'pass', time: '14:15' },
  { id: '4', room: '糖友运动课堂', host: '赵营养师', type: 'text', content: '下载APP送礼品', severity: 'danger', action: 'block', time: '14:10' },
];

const severityMap: Record<string, { color: string; label: string }> = {
  safe: { color: 'green', label: '安全' },
  suspicious: { color: 'orange', label: '可疑' },
  danger: { color: 'red', label: '违规' },
};

const typeIcon: Record<string, React.ReactNode> = {
  text: <AudioOutlined />, image: <PictureOutlined />, audio: <SoundOutlined />,
};

const Page: React.FC = () => {
  const [tab, setTab] = useState<ReviewTab>('realtime');
  const [logFilter, setLogFilter] = useState('all');

  const filteredLogs = mockLogs.filter(
    l => logFilter === 'all' || l.severity === logFilter
  );

  return (
    <MobileFrame title="安全审核" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        <Card size="small" style={{ marginBottom: 12, borderRadius: 10 }}>
          <Row gutter={8}>
            <Col span={8}>
              <Statistic title="在线房间" value={3} valueStyle={{ fontSize: 20, color: '#1677ff' }} />
            </Col>
            <Col span={8}>
              <Statistic title="今日处置" value={127} valueStyle={{ fontSize: 20, color: '#fa8c16' }} />
            </Col>
            <Col span={8}>
              <Statistic title="风险拦截" value={9} valueStyle={{ fontSize: 20, color: '#ff4d4f' }} />
            </Col>
          </Row>
        </Card>

        <Segmented
          block
          size="small"
          value={tab}
          onChange={(v) => setTab(v as ReviewTab)}
          options={[
            { label: '实时审核', value: 'realtime' },
            { label: '违规记录', value: 'records' },
            { label: '风险词库', value: 'lexicon' },
          ]}
          style={{ marginBottom: 12 }}
        />

        {tab === 'realtime' && (
          <div>
            <Card size="small" style={{ marginBottom: 10, borderRadius: 10, borderLeft: '3px solid #1677ff' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <EyeOutlined style={{ color: '#1677ff' }} />
                  <Text strong>糖尿病饮食管理</Text>
                </Space>
                <Tag color="green">在播中</Tag>
              </Space>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                主播：张医生 | 观看：1.2K | 检测中…
              </Text>
              <Space style={{ marginTop: 8 }}>
                <Button size="small" type="primary" ghost>进入审核</Button>
                <Button size="small" danger ghost>中断推流</Button>
              </Space>
            </Card>
            <Card size="small" style={{ marginBottom: 10, borderRadius: 10, borderLeft: '3px solid #fa8c16' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <EyeOutlined style={{ color: '#fa8c16' }} />
                  <Text strong>血糖控制技巧</Text>
                </Space>
                <Tag color="warning">延时播出</Tag>
              </Space>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                主播：李药师 | 观看：856 | 可疑内容待审
              </Text>
              <Space style={{ marginTop: 8 }}>
                <Button size="small">进入审核</Button>
              </Space>
            </Card>
            <Empty description="更多房间等待开播…" style={{ marginTop: 20 }} />
          </div>
        )}

        {tab === 'records' && (
          <div>
            <Segmented
              size="small"
              value={logFilter}
              onChange={setLogFilter}
              options={[
                { label: '全部', value: 'all' },
                { label: '违规', value: 'danger' },
                { label: '可疑', value: 'suspicious' },
              ]}
              style={{ marginBottom: 10 }}
            />
            <Search
              placeholder="搜索直播间或主播"
              prefix={<SearchOutlined />}
              size="small"
              allowClear
              style={{ marginBottom: 10 }}
            />
            {filteredLogs.map(log => (
              <Card
                key={log.id}
                size="small"
                style={{ marginBottom: 8, borderRadius: 10 }}
              >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size={4}>
                    <Tag color={severityMap[log.severity].color}>
                      {severityMap[log.severity].label}
                    </Tag>
                    <Tag>{typeIcon[log.type]} {log.type === 'text' ? '弹幕' : log.type === 'image' ? '画面' : '音频'}</Tag>
                  </Space>
                  <Text style={{ fontSize: 11 }} type="secondary">{log.time}</Text>
                </Space>
                <Text style={{ display: 'block', marginTop: 4, fontSize: 13 }}>{log.content}</Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                  {log.room} · {log.host}
                </Text>
                <Tag color={log.action === 'block' ? 'red' : log.action === 'warn' ? 'orange' : 'green'} style={{ marginTop: 4 }}>
                  {log.action === 'block' ? '已屏蔽' : log.action === 'warn' ? '已警告' : '已放行'}
                </Tag>
              </Card>
            ))}
          </div>
        )}

        {tab === 'lexicon' && (
          <Card size="small" style={{ borderRadius: 10 }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text strong>风险词库</Text>
              <Button size="small" type="primary">添加</Button>
            </Space>
            <div style={{ marginTop: 10 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>高风险词</Text>
              <Space wrap style={{ marginTop: 4 }}>
                {['微信号', '手机号', '加V', '私聊', '转账'].map(w => (
                  <Tag key={w} color="red">{w}</Tag>
                ))}
              </Space>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 12 }}>药品合规词</Text>
              <Space wrap style={{ marginTop: 4 }}>
                {['根治', '特效', '祖传', '包好', '万能'].map(w => (
                  <Tag key={w} color="orange">{w}</Tag>
                ))}
              </Space>
            </div>
          </Card>
        )}
      </div>
    </MobileFrame>
  );
};

export default Page;
