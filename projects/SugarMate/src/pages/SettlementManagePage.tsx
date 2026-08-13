/**
 * PG-SUG-PC-029 结算管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Input, Card, Row, Col, Statistic, Button } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import type { Settlement } from '@/contracts/finance';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: '待结算' },
  APPROVED: { color: 'processing', label: '已审核' },
  SETTLED: { color: 'success', label: '已结算' },
  DISPUTED: { color: 'error', label: '争议' },
};

const SettlementManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [data, setData] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/settlements');
      setData(Array.isArray(res?.list) ? res.list : []);
    } catch { setData([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((s: Settlement) =>
    !search || s.settle_no?.includes(search) || s.merchant_name?.includes(search)
  );

  const cols = [
    { title: '结算单号', dataIndex: 'settle_no', width: 150 },
    { title: '商家', dataIndex: 'merchant_name', width: 150 },
    { title: '结算周期', dataIndex: 'period', width: 200 },
    { title: '订单数', dataIndex: 'order_count', width: 80 },
    { title: '交易金额', dataIndex: 'total_amount', width: 110, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '手续费', dataIndex: 'fee_amount', width: 100, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '结算金额', dataIndex: 'settle_amount', width: 120, render: (v: number) => <strong>¥{v.toLocaleString()}</strong> },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '操作', width: 80, render: () => <Button size="small" icon={<EyeOutlined />}>详情</Button> },
  ];

  const totalSettled = data.filter((s: Settlement) => s.status === 'SETTLED').reduce((sum: number, s: Settlement) => sum + s.settle_amount, 0);
  const totalPending = data.filter((s: Settlement) => s.status === 'PENDING').reduce((sum: number, s: Settlement) => sum + s.settle_amount, 0);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="已结算总额" value={totalSettled} prefix="¥" precision={0} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待结算总额" value={totalPending} prefix="¥" precision={0} valueStyle={{ color: 'var(--color-warning)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="结算单数" value={data.length} /></Card></Col>
      </Row>
      <Card>
        <Input prefix={<SearchOutlined />} placeholder="搜索结算单号/商家" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 260, marginBottom: 16 }} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
    </div>
  );
};

export default SettlementManagePage;
