/**
 * PG-SUG-PC-021 内容审核
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Select } from 'antd';
import { SearchOutlined, AuditOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: '待审核' },
  APPROVED: { color: 'success', label: '已通过' },
  REJECTED: { color: 'error', label: '已驳回' },
};

const TYPE_MAP: Record<string, string> = {
  ARTICLE: '文章', VIDEO: '视频', COMMENT: '评论', POST: '帖子', REVIEW: '评价',
};

const ContentReviewPage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/content-reviews');
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(c => {
    if (search && !c.title?.includes(search) && !c.author?.includes(search)) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    return true;
  });

  const cols = [
    { title: '内容标题', dataIndex: 'title', width: 200, ellipsis: true },
    { title: '类型', dataIndex: 'type', width: 80, render: (t: string) => <Tag>{TYPE_MAP[t] || t}</Tag> },
    { title: '作者', dataIndex: 'author', width: 100 },
    { title: '风险等级', dataIndex: 'risk_level', width: 90, render: (l: string) => <Tag color={l === 'HIGH' ? 'red' : l === 'MEDIUM' ? 'orange' : 'green'}>{l}</Tag> },
    { title: '提交时间', dataIndex: 'submitted_at', width: 110, render: (v: number) => v ? new Date(v * 1000).toLocaleDateString() : '-' },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '操作', width: 120, render: (_: any, r: any) => (
      <Space>
        {r.status === 'PENDING' && (
          <>
            <Button size="small" type="primary" icon={<CheckCircleOutlined />}>通过</Button>
            <Button size="small" danger icon={<CloseCircleOutlined />}>驳回</Button>
          </>
        )}
        <Button size="small" icon={<EyeOutlined />}>查看</Button>
      </Space>
    )},
  ];

  const stats = { total: list.length, pending: list.filter(c => c.status === 'PENDING').length, highRisk: list.filter(c => c.risk_level === 'HIGH' && c.status === 'PENDING').length };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="审核总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="待审核" value={stats.pending} valueStyle={{ color: 'var(--color-warning)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="高风险待审" value={stats.highRisk} valueStyle={{ color: 'var(--color-error)' }} /></Card></Col>
      </Row>
      <Card title="内容审核">
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索标题/作者" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 200 }} />
          <Select placeholder="内容类型" allowClear style={{ width: 120 }} value={typeFilter} onChange={setTypeFilter}
            options={Object.entries(TYPE_MAP).map(([k, v]) => ({ value: k, label: v }))} />
          <Select placeholder="状态" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
        </Space>
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
    </div>
  );
};

export default ContentReviewPage;
