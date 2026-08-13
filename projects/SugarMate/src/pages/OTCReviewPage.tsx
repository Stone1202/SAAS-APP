/**
 * PG-SUG-PC-025 OTC审核
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, AuditOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: '待审核' },
  APPROVED: { color: 'success', label: '已通过' },
  REJECTED: { color: 'error', label: '已驳回' },
};

const OTCReviewPage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [curItem, setCurItem] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/otc-reviews');
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    await ad!.post(`/otc-reviews/${id}/approve`);
    message.success('审核已通过');
    load();
  };
  const handleReject = async (id: string) => {
    await ad!.post(`/otc-reviews/${id}/reject`);
    message.success('已驳回');
    load();
  };

  const filtered = list.filter(p => !search || p.product_name?.includes(search) || p.merchant_name?.includes(search));

  const cols = [
    { title: '商品名称', dataIndex: 'product_name', width: 180 },
    { title: 'OTC分类', dataIndex: 'otc_category', width: 120, render: (c: string) => <Tag color="blue">{c}</Tag> },
    { title: '批准文号', dataIndex: 'approval_no', width: 150 },
    { title: '商家', dataIndex: 'merchant_name', width: 150 },
    { title: '提交时间', dataIndex: 'submitted_at', width: 110, render: (v: number) => v ? new Date(v * 1000).toLocaleDateString() : '-' },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '操作', width: 140, render: (_: any, r: any) => (
      <Space>
        {r.status === 'PENDING' && (
          <>
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>通过</Button>
            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleReject(r.id)}>驳回</Button>
          </>
        )}
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setCurItem(r); setDetailOpen(true); }}>详情</Button>
      </Space>
    )},
  ];

  const stats = { total: list.length, pending: list.filter(p => p.status === 'PENDING').length, approved: list.filter(p => p.status === 'APPROVED').length };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="OTC审核总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="待审核" value={stats.pending} valueStyle={{ color: 'var(--color-warning)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已通过" value={stats.approved} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
      </Row>
      <Card title="OTC审核">
        <Input prefix={<SearchOutlined />} placeholder="搜索商品/商家" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220, marginBottom: 16 }} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
      <Modal title="OTC商品详情" open={detailOpen} onCancel={() => { setDetailOpen(false); setCurItem(null); }} footer={null} width={560}>
        {curItem && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="商品名称" span={2}>{curItem.product_name}</Descriptions.Item>
            <Descriptions.Item label="OTC分类" span={1}><Tag color="blue">{curItem.otc_category}</Tag></Descriptions.Item>
            <Descriptions.Item label="批准文号" span={1}>{curItem.approval_no}</Descriptions.Item>
            <Descriptions.Item label="生产企业" span={2}>{curItem.manufacturer}</Descriptions.Item>
            <Descriptions.Item label="商家" span={2}>{curItem.merchant_name}</Descriptions.Item>
            <Descriptions.Item label="说明书" span={2}>{curItem.instruction || '暂无'}</Descriptions.Item>
            <Descriptions.Item label="状态" span={1}><Tag color={STATUS_MAP[curItem.status]?.color}>{STATUS_MAP[curItem.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="提交时间" span={1}>{curItem.submitted_at ? new Date(curItem.submitted_at * 1000).toLocaleDateString() : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OTCReviewPage;
