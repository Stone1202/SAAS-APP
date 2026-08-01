/**
 * PG-SUG-LIVE 收入结算 V1.0.0
 * 
 * 主播收入与结算：打赏分成明细、带货佣金统计（按直播间/商品维度）、
 * 广告收入、结算周期（T+3/T+7/T+15可配）、结算单+银行账户绑定。
 */
import React, { useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Tag, Segmented, Button, Space } from 'antd';
import {
  DollarOutlined, PercentageOutlined, BankOutlined,
  ShoppingCartOutlined, GiftOutlined, ArrowUpOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;

interface SettleItem {
  id: string;
  room: string;
  date: string;
  reward: number;
  commission: number;
  status: 'pending' | 'settled' | 'withdrawn';
}

const mockData: SettleItem[] = [
  { id: '1', room: '糖尿病饮食管理', date: '2026-07-28', reward: 1250.00, commission: 380.50, status: 'settled' },
  { id: '2', room: '血糖控制技巧', date: '2026-07-27', reward: 860.00, commission: 210.00, status: 'settled' },
  { id: '3', room: '胰岛素使用指南', date: '2026-07-25', reward: 2100.00, commission: 520.00, status: 'withdrawn' },
  { id: '4', room: '健康零食选购', date: '2026-07-22', reward: 450.00, commission: 130.00, status: 'pending' },
];

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待结算' },
  settled: { color: 'blue', label: '已结算' },
  withdrawn: { color: 'green', label: '已提现' },
};

const Page: React.FC = () => {
  const [period, setPeriod] = useState('month');
  const totalReward = mockData.reduce((s, i) => s + i.reward, 0);
  const totalCommission = mockData.reduce((s, i) => s + i.commission, 0);
  const withdrawable = mockData.filter(i => i.status === 'settled').reduce((s, i) => s + i.reward + i.commission, 0);

  const cols = [
    { title: '直播间', dataIndex: 'room', ellipsis: true },
    { title: '日期', dataIndex: 'date', width: 90 },
    { title: '打赏', dataIndex: 'reward', width: 80, render: (v: number) => <Text style={{ color: '#fa8c16' }}>¥{v.toFixed(0)}</Text> },
    { title: '佣金', dataIndex: 'commission', width: 80, render: (v: number) => <Text style={{ color: '#52c41a' }}>¥{v.toFixed(0)}</Text> },
    { title: '状态', dataIndex: 'status', width: 70, render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag> },
  ];

  return (
    <MobileFrame title="收入结算" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        {/* 收入概览 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12, background: 'linear-gradient(135deg, #1677ff, #0958d9)' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>本月收入</Text>
          <Title level={3} style={{ color: '#fff', margin: '4px 0' }}>¥{(totalReward + totalCommission).toFixed(2)}</Title>
          <Row gutter={8}>
            <Col span={12}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>打赏收入</Text>
              <Text style={{ color: '#fff', fontSize: 14, display: 'block' }}>¥{totalReward.toFixed(0)}</Text>
            </Col>
            <Col span={12}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>带货佣金</Text>
              <Text style={{ color: '#fff', fontSize: 14, display: 'block' }}>¥{totalCommission.toFixed(0)}</Text>
            </Col>
          </Row>
        </Card>

        {/* 可提现 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Text type="secondary" style={{ fontSize: 11 }}>可提现金额</Text>
              <Text strong style={{ fontSize: 22, display: 'block', color: '#52c41a' }}>¥{withdrawable.toFixed(2)}</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>
                结算周期：T+7 <ArrowUpOutlined style={{ color: '#1677ff' }} />
              </Text>
            </Col>
            <Col>
              <Button type="primary" icon={<BankOutlined />}>提现</Button>
            </Col>
          </Row>
        </Card>

        {/* 分账说明 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12, background: '#f6f8fa' }}>
          <Space>
            <PercentageOutlined style={{ color: '#1677ff' }} />
            <Text style={{ fontSize: 12 }}>分账比例：主播 70% | 平台 20% | 供应商 10%</Text>
          </Space>
        </Card>

        {/* 结算明细 */}
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong style={{ fontSize: 13 }}>结算明细</Text>
          <Segmented
            size="small"
            value={period}
            onChange={setPeriod}
            options={[
              { label: '本周', value: 'week' },
              { label: '本月', value: 'month' },
              { label: '全部', value: 'all' },
            ]}
          />
        </Space>

        <div style={{ overflowX: 'auto' }}>
          <Table
            rowKey="id"
            dataSource={mockData}
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
