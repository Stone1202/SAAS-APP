/**
 * PG-SUG-PC-028 售后工单管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Input, Card, Row, Col, Statistic, Space, Button } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  APPLYING: { color: 'orange', label: '待处理' },
  WAIT_RETURN: { color: 'processing', label: '待退货' },
  COMPLETED: { color: 'success', label: '已完成' },
  REJECTED: { color: 'error', label: '已拒绝' },
};

const TYPE_MAP: Record<string, string> = { REFUND: '仅退款', RETURN: '退货退款', EXCHANGE: '换货' };

const AftersaleManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/aftersales');
      setRecords(Array.isArray(res?.list) ? res.list : []);
    } catch { setRecords([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r: any) =>
    !search || r.aftersale_no?.includes(search) || r.order_no?.includes(search) || r.buyer_name?.includes(search)
  );

  const cols = [
    { title: '售后单号', dataIndex: 'aftersale_no', width: 160 },
    { title: '关联订单', dataIndex: 'order_no', width: 160 },
    { title: '买家', dataIndex: 'buyer_name', width: 80 },
    { title: '商家', dataIndex: 'merchant_name', width: 120 },
    { title: '类型', dataIndex: 'type', width: 90, render: (t: string) => TYPE_MAP[t] || t },
    { title: '原因', dataIndex: 'reason', width: 120, ellipsis: true },
    { title: '金额', dataIndex: 'amount', width: 100, render: (v: number) => `¥${v}` },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '操作', width: 80, render: () => <Button size="small" icon={<EyeOutlined />}>处理</Button> },
  ];

  const stats = {
    total: records.length,
    pending: records.filter((r: any) => r.status === 'APPLYING').length,
    completed: records.filter((r: any) => r.status === 'COMPLETED').length,
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="售后总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="待处理" value={stats.pending} valueStyle={{ color: 'var(--color-warning)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
      </Row>
      <Card>
        <Input prefix={<SearchOutlined />} placeholder="搜索售后单号/订单号/买家" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280, marginBottom: 16 }} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
    </div>
  );
};

export default AftersaleManagePage;
