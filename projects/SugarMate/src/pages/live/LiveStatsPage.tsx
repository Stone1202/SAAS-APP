/**
 * PG-SUG-LIVE 直播数据统计 V1.0.0
 * 
 * 直播数据仪表盘：观看人数(UV)/峰值在线/平均观看时长、
 * 互动量(弹幕/点赞/分享)、礼物收入/带货转化。
 * 数据回传至PC后台数据看板。
 */
import React, { useState } from 'react';
import {
  Typography, Card, Row, Col, Statistic, Table, Segmented,
  Space, Select, Empty,
} from 'antd';
import {
  UserOutlined, RiseOutlined, ClockCircleOutlined,
  MessageOutlined, LikeOutlined, ShareAltOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;

interface RoomStat {
  id: string;
  room: string;
  date: string;
  uv: number;
  peakOnline: number;
  avgDuration: number;
  danmaku: number;
  likes: number;
  revenue: number;
}

const mockStats: RoomStat[] = [
  { id: '1', room: '糖尿病饮食管理', date: '07-28', uv: 3240, peakOnline: 1258, avgDuration: 18.5, danmaku: 456, likes: 1234, revenue: 1250 },
  { id: '2', room: '血糖控制技巧', date: '07-27', uv: 2150, peakOnline: 856, avgDuration: 14.2, danmaku: 312, likes: 890, revenue: 860 },
  { id: '3', room: '胰岛素使用指南', date: '07-25', uv: 4520, peakOnline: 1820, avgDuration: 22.3, danmaku: 678, likes: 2100, revenue: 2100 },
];

const Page: React.FC = () => {
  const [period, setPeriod] = useState('week');

  const totalUV = mockStats.reduce((s, r) => s + r.uv, 0);
  const totalRevenue = mockStats.reduce((s, r) => s + r.revenue, 0);
  const avgDuration = Math.round(mockStats.reduce((s, r) => s + r.avgDuration, 0) / mockStats.length * 10) / 10;

  const cols = [
    { title: '直播间', dataIndex: 'room', ellipsis: true },
    { title: '日期', dataIndex: 'date', width: 60 },
    { title: 'UV', dataIndex: 'uv', width: 60, render: (v: number) => v.toLocaleString() },
    { title: '峰值', dataIndex: 'peakOnline', width: 60 },
    { title: '时长', dataIndex: 'avgDuration', width: 60, render: (v: number) => `${v}分` },
    { title: '弹幕', dataIndex: 'danmaku', width: 50 },
    { title: '收入', dataIndex: 'revenue', width: 65, render: (v: number) => `¥${v}` },
  ];

  return (
    <MobileFrame title="直播数据统计" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        <Segmented
          block
          size="small"
          value={period}
          onChange={setPeriod}
          options={[
            { label: '本周', value: 'week' },
            { label: '本月', value: 'month' },
            { label: '全部', value: 'all' },
          ]}
          style={{ marginBottom: 12 }}
        />

        {/* KPI卡片 */}
        <Row gutter={8} style={{ marginBottom: 12 }}>
          <Col span={8}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <Statistic title={<Text style={{ fontSize: 10 }}>累计观看</Text>} value={totalUV} valueStyle={{ fontSize: 18, color: '#1677ff' }} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <Statistic title={<Text style={{ fontSize: 10 }}>平均时长</Text>} value={avgDuration} suffix="分" valueStyle={{ fontSize: 18, color: '#52c41a' }} prefix={<ClockCircleOutlined />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <Statistic title={<Text style={{ fontSize: 10 }}>收入</Text>} value={totalRevenue} prefix="¥" valueStyle={{ fontSize: 18, color: '#fa8c16' }} prefix={<RiseOutlined />} />
            </Card>
          </Col>
        </Row>

        {/* 互动统计 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>互动数据</Text>
          <Row gutter={12}>
            <Col span={8} style={{ textAlign: 'center' }}>
              <MessageOutlined style={{ fontSize: 20, color: '#1677ff' }} />
              <Text style={{ display: 'block', fontSize: 16, fontWeight: 'bold' }}>1,446</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>弹幕数</Text>
            </Col>
            <Col span={8} style={{ textAlign: 'center' }}>
              <LikeOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
              <Text style={{ display: 'block', fontSize: 16, fontWeight: 'bold' }}>4,224</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>点赞数</Text>
            </Col>
            <Col span={8} style={{ textAlign: 'center' }}>
              <ShareAltOutlined style={{ fontSize: 20, color: '#52c41a' }} />
              <Text style={{ display: 'block', fontSize: 16, fontWeight: 'bold' }}>256</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>分享数</Text>
            </Col>
          </Row>
        </Card>

        {/* 明细 */}
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong style={{ fontSize: 13 }}>场次明细</Text>
          <Select
            size="small"
            defaultValue="all"
            style={{ width: 100 }}
            options={[
              { label: '全部类型', value: 'all' },
              { label: '科普直播', value: 'knowledge' },
              { label: '讲堂直播', value: 'lecture' },
            ]}
          />
        </Space>

        <div style={{ overflowX: 'auto' }}>
          <Table
            rowKey="id"
            dataSource={mockStats}
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
