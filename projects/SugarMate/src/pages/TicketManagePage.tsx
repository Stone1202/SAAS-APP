/**
 * PG-SUG-PC-034 客服工单管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Input, Card, Row, Col, Statistic, Space, Button } from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import type { Ticket } from '@/contracts/operations';

const PRIORITY_MAP: Record<string, { color: string; label: string }> = {
  HIGH: { color: 'red', label: '紧急' },
  MEDIUM: { color: 'orange', label: '普通' },
  LOW: { color: 'default', label: '低优' },
};
const STATUS_MAP: Record<string, { color: string; label: string }> = {
  OPEN: { color: 'error', label: '待处理' },
  IN_PROGRESS: { color: 'processing', label: '处理中' },
  RESOLVED: { color: 'success', label: '已解决' },
  CLOSED: { color: 'default', label: '已关闭' },
};

const TicketManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/tickets');
      setTickets(Array.isArray(res?.list) ? res.list : []);
    } catch { setTickets([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets.filter(t =>
    !search || t.ticket_no?.includes(search) || t.title?.includes(search) || t.user_name?.includes(search)
  );

  const cols = [
    { title: '工单编号', dataIndex: 'ticket_no', width: 150 },
    { title: '用户', dataIndex: 'user_name', width: 80 },
    { title: '分类', dataIndex: 'category', width: 100 },
    { title: '标题', dataIndex: 'title', width: 200, ellipsis: true },
    { title: '优先级', dataIndex: 'priority', width: 80, render: (p: string) => <Tag color={PRIORITY_MAP[p]?.color}>{PRIORITY_MAP[p]?.label}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '处理人', dataIndex: 'assignee', width: 100 },
    { title: '操作', width: 80, render: () => <Button size="small" icon={<CheckCircleOutlined />}>处理</Button> },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="工单总数" value={tickets.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="待处理" value={tickets.filter(t => t.status === 'OPEN').length} valueStyle={{ color: 'var(--color-error)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="处理中" value={tickets.filter(t => t.status === 'IN_PROGRESS').length} valueStyle={{ color: 'var(--color-primary)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已解决" value={tickets.filter(t => t.status === 'RESOLVED').length} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
      </Row>
      <Card>
        <Input prefix={<SearchOutlined />} placeholder="搜索工单号/标题/用户" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280, marginBottom: 16 }} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
    </div>
  );
};

export default TicketManagePage;
