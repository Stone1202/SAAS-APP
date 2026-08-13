/**
 * PG-SUG-PC-019 线索管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Select } from 'antd';
import { SearchOutlined, EyeOutlined, AuditOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  NEW: { color: 'blue', label: '新线索' },
  CONTACTED: { color: 'processing', label: '已联系' },
  QUALIFIED: { color: 'success', label: '已转化' },
  LOST: { color: 'default', label: '已流失' },
};

const SOURCE_MAP: Record<string, string> = {
  MINIPROGRAM: '小程序', APP: 'APP', WEB: '网页', REFERRAL: '推荐', OFFLINE: '线下活动',
};

const LeadsManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/leads');
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(l => {
    if (search && !l.name?.includes(search) && !l.phone?.includes(search)) return false;
    if (statusFilter && l.status !== statusFilter) return false;
    return true;
  });

  const cols = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '来源', dataIndex: 'source', width: 100, render: (s: string) => <Tag>{SOURCE_MAP[s] || s}</Tag> },
    { title: '意向服务', dataIndex: 'interest', width: 120 },
    { title: '血糖类型', dataIndex: 'glucose_type', width: 100 },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', width: 110, render: (v: number) => v ? new Date(v * 1000).toLocaleDateString() : '-' },
    { title: '操作', width: 80, render: () => <Button size="small" icon={<EyeOutlined />}>详情</Button> },
  ];

  const stats = { total: list.length, newLeads: list.filter(l => l.status === 'NEW').length, qualified: list.filter(l => l.status === 'QUALIFIED').length };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="线索总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="新线索" value={stats.newLeads} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已转化" value={stats.qualified} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
      </Row>
      <Card title="线索管理">
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索姓名/手机号" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220 }} />
          <Select placeholder="状态" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
        </Space>
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
    </div>
  );
};

export default LeadsManagePage;
