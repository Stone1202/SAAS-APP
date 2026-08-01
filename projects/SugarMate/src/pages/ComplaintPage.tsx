/**
 * PG-SUG-PC-035 投诉纠纷管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Select, Modal, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined, AuditOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: '待处理' },
  IN_PROGRESS: { color: 'processing', label: '处理中' },
  RESOLVED: { color: 'success', label: '已解决' },
  CLOSED: { color: 'default', label: '已关闭' },
};

const LEVEL_MAP: Record<string, { color: string; label: string }> = {
  HIGH: { color: 'red', label: '高' },
  MEDIUM: { color: 'orange', label: '中' },
  LOW: { color: 'green', label: '低' },
};

const TYPE_MAP: Record<string, string> = {
  SERVICE: '服务质量', QUALITY: '商品质量', DELIVERY: '配送问题', REFUND: '退款纠纷', OTHER: '其他',
};

const ComplaintPage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [curItem, setCurItem] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/complaints');
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(c => {
    if (search && !c.complainant?.includes(search) && !c.merchant_name?.includes(search) && !c.title?.includes(search)) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const cols = [
    { title: '投诉编号', dataIndex: 'complaint_no', width: 130 },
    { title: '投诉标题', dataIndex: 'title', width: 180, ellipsis: true },
    { title: '投诉人', dataIndex: 'complainant', width: 90 },
    { title: '被投诉方', dataIndex: 'merchant_name', width: 140 },
    { title: '类型', dataIndex: 'type', width: 100, render: (t: string) => <Tag>{TYPE_MAP[t] || t}</Tag> },
    { title: '紧急程度', dataIndex: 'urgency', width: 80, render: (u: string) => <Tag color={LEVEL_MAP[u]?.color}>{LEVEL_MAP[u]?.label || u}</Tag> },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', width: 110, render: (v: number) => v ? new Date(v * 1000).toLocaleDateString() : '-' },
    { title: '操作', width: 80, render: (_: any, r: any) => (
      <Button size="small" icon={<EyeOutlined />} onClick={() => { setCurItem(r); setDetailOpen(true); }}>处理</Button>
    )},
  ];

  const stats = { total: list.length, pending: list.filter(c => c.status === 'PENDING').length, inProgress: list.filter(c => c.status === 'IN_PROGRESS').length };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="投诉总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="待处理" value={stats.pending} valueStyle={{ color: 'var(--color-warning)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="处理中" value={stats.inProgress} valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>
      <Card title="投诉纠纷">
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索投诉人/商家/标题" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220 }} />
          <Select placeholder="状态" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
        </Space>
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
      <Modal title="投诉详情" open={detailOpen} onCancel={() => { setDetailOpen(false); setCurItem(null); }} footer={null} width={600}>
        {curItem && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="投诉编号" span={2}>{curItem.complaint_no}</Descriptions.Item>
            <Descriptions.Item label="标题" span={2}>{curItem.title}</Descriptions.Item>
            <Descriptions.Item label="投诉人" span={1}>{curItem.complainant}</Descriptions.Item>
            <Descriptions.Item label="被投诉方" span={1}>{curItem.merchant_name}</Descriptions.Item>
            <Descriptions.Item label="类型" span={1}><Tag>{TYPE_MAP[curItem.type] || curItem.type}</Tag></Descriptions.Item>
            <Descriptions.Item label="紧急程度" span={1}><Tag color={LEVEL_MAP[curItem.urgency]?.color}>{LEVEL_MAP[curItem.urgency]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="状态" span={1}><Tag color={STATUS_MAP[curItem.status]?.color}>{STATUS_MAP[curItem.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="创建时间" span={1}>{curItem.created_at ? new Date(curItem.created_at * 1000).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="投诉内容" span={2}>{curItem.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintPage;
