/**
 * PG-SUG-PC-036 对账报表
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Row, Col, Statistic, DatePicker, Select } from 'antd';
import { DownloadOutlined, EyeOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  MATCHED: { color: 'success', label: '对账一致' },
  MISMATCHED: { color: 'error', label: '差异' },
  PENDING: { color: 'processing', label: '对账中' },
};

const ReconciliationPage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('2026-07');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>(`/finance/reconciliation?period=${period}`);
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad, period]);

  useEffect(() => { load(); }, [load]);

  const cols = [
    { title: '对账批次', dataIndex: 'batch_no', width: 140 },
    { title: '商家', dataIndex: 'merchant_name', width: 160 },
    { title: '平台交易额', dataIndex: 'platform_amount', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '商家上报额', dataIndex: 'merchant_amount', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '差异额', dataIndex: 'diff_amount', width: 110, render: (v: number) => <span style={{ color: v !== 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>¥{v.toLocaleString()}</span> },
    { title: '订单数', dataIndex: 'order_count', width: 80, render: (v: number) => v?.toLocaleString() },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={STATUS_MAP[s]?.color} icon={s === 'MATCHED' ? <CheckCircleOutlined /> : s === 'MISMATCHED' ? <ExclamationCircleOutlined /> : undefined}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '对账日期', dataIndex: 'recon_date', width: 110 },
    { title: '操作', width: 100, render: () => (
      <Space>
        <Button size="small" icon={<EyeOutlined />}>详情</Button>
        <Button size="small" icon={<DownloadOutlined />}>导出</Button>
      </Space>
    )},
  ];

  const totalPlatform = list.reduce((s, r) => s + (r.platform_amount || 0), 0);
  const totalDiff = list.reduce((s, r) => s + (r.diff_amount || 0), 0);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="平台交易总额" value={totalPlatform} prefix="¥" precision={0} /></Card></Col>
        <Col span={6}><Card><Statistic title="差异总额" value={totalDiff} prefix="¥" valueStyle={{ color: totalDiff !== 0 ? '#ff4d4f' : '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="对账一致" value={list.filter(r => r.status === 'MATCHED').length} valueStyle={{ color: 'var(--color-success)' }} suffix="批" /></Card></Col>
        <Col span={6}><Card><Statistic title="存在差异" value={list.filter(r => r.status === 'MISMATCHED').length} valueStyle={{ color: 'var(--color-error)' }} suffix="批" /></Card></Col>
      </Row>
      <Card title="对账报表" extra={<Space><DatePicker picker="month" onChange={(_, d) => d && setPeriod(d)} /><Button icon={<DownloadOutlined />}>导出报表</Button></Space>}>
        <Table rowKey="batch_no" dataSource={list} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
    </div>
  );
};

export default ReconciliationPage;
