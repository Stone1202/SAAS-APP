/**
 * PG-SUG-LIVE 录制管理 V1.0.0
 * 
 * 云端录制开关、多码率转码（HLS/FLV/RTMP）、
 * 录制文件管理（关联腾讯云VOD）、转码状态查看。
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Space, Tag, Switch,
  Table, Row, Col, Statistic, Segmented, Empty,
} from 'antd';
import {
  VideoCameraOutlined, CloudOutlined,
  PlayCircleOutlined, DownloadOutlined,
  DeleteOutlined, CheckCircleOutlined, SyncOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;

interface Recording {
  id: string; name: string; duration: number; size: string;
  format: string; resolution: string; date: string; status: 'done' | 'transcoding';
}

const recordings: Recording[] = [
  { id: '1', name: '糖尿病饮食管理', duration: 62, size: '1.2 GB', format: 'HLS', resolution: '1080p', date: '07-28', status: 'done' },
  { id: '2', name: '血糖控制技巧', duration: 48, size: '890 MB', format: 'MP4', resolution: '720p', date: '07-27', status: 'done' },
  { id: '3', name: '胰岛素使用指南', duration: 55, size: '1.0 GB', format: 'HLS', resolution: '1080p', date: '07-25', status: 'done' },
  { id: '4', name: '糖友运动课堂', duration: 45, size: '正在转码…', format: 'HLS', resolution: '720p', date: '07-24', status: 'transcoding' },
];

const Page: React.FC = () => {
  const [autoRecord, setAutoRecord] = useState(true);
  const [view, setView] = useState<'all' | 'done' | 'transcoding'>('all');

  const filtered = recordings.filter(r => {
    if (view === 'done') return r.status === 'done';
    if (view === 'transcoding') return r.status === 'transcoding';
    return true;
  });

  const totalSize = '3.2 GB';
  const totalCount = recordings.length;

  const cols = [
    { title: '名称', dataIndex: 'name', ellipsis: true },
    { title: '时长', dataIndex: 'duration', width: 55, render: (v: number) => `${v}分` },
    { title: '大小', dataIndex: 'size', width: 80 },
    { title: '格式', dataIndex: 'format', width: 50, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '分辨率', dataIndex: 'resolution', width: 55, render: (v: string) => <Tag>{v}</Tag> },
    { title: '日期', dataIndex: 'date', width: 55 },
    {
      title: '', width: 80, render: (_: any, r: Recording) => (
        r.status === 'done' ? (
          <Space size={2}>
            <Button size="small" type="link" icon={<PlayCircleOutlined />}>预览</Button>
            <Button size="small" type="link" danger icon={<DeleteOutlined />} />
          </Space>
        ) : (
          <Space size={4}>
            <SyncOutlined spin style={{ color: '#fa8c16', fontSize: 12 }} />
            <Text style={{ fontSize: 10, color: '#fa8c16' }}>转码中</Text>
          </Space>
        )
      ),
    },
  ];

  return (
    <MobileFrame title="录制管理" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        {/* 自动录制开关 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <CloudOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                <div>
                  <Text strong style={{ fontSize: 13 }}>自动云端录制</Text>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                    开播自动录制至腾讯云VOD
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Switch checked={autoRecord} onChange={setAutoRecord} />
            </Col>
          </Row>
        </Card>

        {/* 统计 */}
        <Row gutter={8} style={{ marginBottom: 12 }}>
          <Col span={8}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <Statistic title={<Text style={{ fontSize: 10 }}>录制文件</Text>} value={totalCount} valueStyle={{ fontSize: 20, color: '#1677ff' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <Statistic title={<Text style={{ fontSize: 10 }}>总存储</Text>} value={totalSize} valueStyle={{ fontSize: 20, color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <Statistic title={<Text style={{ fontSize: 10 }}>转码中</Text>} value={recordings.filter(r => r.status === 'transcoding').length} valueStyle={{ fontSize: 20, color: '#fa8c16' }} />
            </Card>
          </Col>
        </Row>

        {/* 转码配置 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12, background: '#f6f8fa' }}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>多码率转码</Text>
          <Space wrap size={4}>
            <Tag color="blue">HLS (自适应)</Tag>
            <Tag color="green">MP4 (1080p)</Tag>
            <Tag color="orange">MP4 (720p)</Tag>
            <Tag color="default">FLV (480p)</Tag>
            <Tag color="default">RTMP</Tag>
          </Space>
        </Card>

        {/* 录制文件 */}
        <Segmented
          block
          size="small"
          value={view}
          onChange={(v) => setView(v as 'all' | 'done' | 'transcoding')}
          options={[
            { label: '全部', value: 'all' },
            { label: '已完成', value: 'done' },
            { label: '转码中', value: 'transcoding' },
          ]}
          style={{ marginBottom: 10 }}
        />

        <div style={{ overflowX: 'auto' }}>
          <Table
            rowKey="id"
            dataSource={filtered}
            columns={cols}
            pagination={false}
            size="small"
          />
        </div>
      </div>
    </MobileFrame>
  );
};

export default Page;
