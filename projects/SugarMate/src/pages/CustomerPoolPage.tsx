/**
 * PG-SUG-PC-012 SCRM 客户池管理
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Input, Card, Row, Col, Statistic, Space, Button } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useScrmStore } from '@/stores/scrmStore';

const CustomerPoolPage: React.FC = () => {
  const { customers, loading, loadCustomers } = useScrmStore();
  const [search, setSearch] = useState('');

  useEffect(() => { loadCustomers(); }, []);

  const filtered = customers.filter(c =>
    !search || c.name.includes(search) || c.phone.includes(search)
  );

  // 统计本月新增（基于 created_at unix 时间戳）
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
  const newThisMonth = useMemo(
    () => customers.filter(c => (c as any).created_at >= monthStart).length,
    [customers, monthStart]
  );

  const cols = [
    { title: '姓名', dataIndex: 'name', width: 90 },
    { title: '手机号', dataIndex: 'phone', width: 120 },
    { title: '年龄', dataIndex: 'age', width: 60 },
    { title: '性别', dataIndex: 'gender', width: 60, render: (v: string) => v === 'M' ? '男' : v === 'F' ? '女' : '-' },
    { title: '糖尿病类型', dataIndex: 'diabetes_type', width: 120 },
    { title: '确诊时长', dataIndex: 'diagnosis_duration', width: 90 },
    { title: '标签', dataIndex: 'tags', width: 180, render: (tags: any[]) => (
      <Space size={4} wrap>{(Array.isArray(tags) ? tags : []).map((t: any) => {
        const label = typeof t === 'string' ? t : t?.name || '';
        return <Tag key={label} color={label === 'VIP' ? 'gold' : label.includes('高风险') ? 'red' : 'blue'}>{label}</Tag>;
      })}</Space>
    )},
    { title: '最近互动', dataIndex: 'last_interaction', width: 100 },
    { title: '来源', dataIndex: 'source', width: 90 },
    { title: '操作', width: 80, render: () => <Button size="small" icon={<EyeOutlined />}>详情</Button> },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="客户总数" value={customers.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="VIP客户" value={customers.filter((c: any) => Array.isArray(c.tags) && c.tags.some((t: any) => (typeof t === 'string' ? t : t?.name) === 'VIP')).length} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="高风险" value={customers.filter((c: any) => Array.isArray(c.tags) && c.tags.some((t: any) => (typeof t === 'string' ? t : t?.name)?.includes('风险'))).length} valueStyle={{ color: 'var(--color-error)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="新增(本月)" value={newThisMonth} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
      </Row>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索姓名/手机号" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 200 }} />
        </Space>
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
    </div>
  );
};

export default CustomerPoolPage;
