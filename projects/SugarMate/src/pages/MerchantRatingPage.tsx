/**
 * PG-SUG-PC-010 商家评级 V2.0.0
 * 
 * V2.0.0 改造：
 * - 使用统一 MerchantStore 替代 API 调用
 * - 评级数据来自商家记录的 rating 字段
 * - 支持按角色/等级筛选 + 搜索
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Button, Card, Space, Input, Select, Statistic, Row, Col, Typography, Rate, Progress } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMerchantStore } from '@/stores/merchantStore';
import type { MerchantRecord, MerchantRole } from '@/stores/merchantStore';
import { ROLE_LABEL, RATING_LABEL, RATING_COLOR } from '@/contracts/merchant';

const { Text } = Typography;
const { Option } = Select;

const LEVEL_COLOR: Record<string, string> = {
  S: 'purple', A: 'blue', B: 'green', C: 'orange', D: 'red', DEFAULT: 'default',
};

const MerchantRatingPage: React.FC = () => {
  const { merchants, initMockData } = useMerchantStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<MerchantRole | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => { initMockData(); }, [initMockData]);

  // 只显示已上线的商家（只有已上线才能参与评级）
  const ratedList = useMemo(() => {
    let list = merchants.filter(m => m.lifecycleStatus === 'ONLINE');
    if (roleFilter !== 'all') list = list.filter(m => m.role === roleFilter);
    if (levelFilter !== 'all') list = list.filter(m => m.rating?.level === levelFilter);
    if (search) {
      list = list.filter(m =>
        m.name?.includes(search) || m.company?.includes(search)
      );
    }
    return list.sort((a, b) => (b.rating?.score || 0) - (a.rating?.score || 0));
  }, [merchants, roleFilter, levelFilter, search]);

  const stats = useMemo(() => {
    const rated = merchants.filter(m => m.lifecycleStatus === 'ONLINE');
    return {
      total: rated.length,
      s: rated.filter(m => m.rating?.level === 'S').length,
      a: rated.filter(m => m.rating?.level === 'A').length,
      b: rated.filter(m => m.rating?.level === 'B').length,
      avgScore: rated.length > 0
        ? (rated.reduce((sum, m) => sum + (m.rating?.score || 0), 0) / rated.length).toFixed(1)
        : 0,
    };
  }, [merchants]);

  const columns = [
    { title: '排名', key: 'rank', width: 60,
      render: (_: any, __: any, idx: number) => <Text strong>#{idx + 1}</Text> },
    { title: '商家名称', dataIndex: 'name', width: 180, ellipsis: true },
    { title: '角色', dataIndex: 'role', width: 80,
      render: (v: MerchantRole) => <Tag>{ROLE_LABEL[v]}</Tag> },
    { title: '评级', key: 'level', width: 100,
      render: (_: any, r: MerchantRecord) => {
        const level = r.rating?.level || 'DEFAULT';
        return <Tag color={LEVEL_COLOR[level]}>{RATING_LABEL[level]}</Tag>;
      }},
    { title: '综合评分', key: 'score', width: 160,
      render: (_: any, r: MerchantRecord) => (
        <Space direction="vertical" size={0}>
          <Rate disabled allowHalf value={r.rating?.score || 0} style={{ fontSize: 14 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>{(r.rating?.score || 0).toFixed(1)} 分</Text>
        </Space>
      )},
    { title: '服务质量', key: 'service', width: 100,
      render: (_: any, r: MerchantRecord) => (
        <Progress percent={r.rating?.serviceScore || 0} size="small" strokeColor={r.rating?.serviceScore! >= 90 ? '#52c41a' : r.rating?.serviceScore! >= 70 ? '#fa8c16' : '#ff4d4f'} format={v => `${v}分`} />
      )},
    { title: '商品质量', key: 'quality', width: 100,
      render: (_: any, r: MerchantRecord) => (
        <Progress percent={r.rating?.qualityScore || 0} size="small" strokeColor={r.rating?.qualityScore! >= 90 ? '#52c41a' : r.rating?.qualityScore! >= 70 ? '#fa8c16' : '#ff4d4f'} format={v => `${v}分`} />
      )},
    { title: '履约率', key: 'fulfillment', width: 100,
      render: (_: any, r: MerchantRecord) => (
        <Progress percent={Math.round((r.rating?.fulfillmentRate || 0) * 100)} size="small" format={v => `${v}%`} />
      )},
    { title: '总服务量', dataIndex: 'totalOrders', width: 100,
      render: (v: number) => v?.toLocaleString() || 0 },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}><Card size="small"><Statistic title="已评定商家" value={stats.total} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="平均评分" value={stats.avgScore} suffix="分" valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="S级/优秀" value={stats.s} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="A级/良好" value={stats.a} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="B级/一般" value={stats.b} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Card title="商家评级">
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索商家名称"
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Select value={roleFilter} onChange={v => setRoleFilter(v)} style={{ width: 110 }}>
            <Option value="all">全部角色</Option>
            <Option value="PHARMACY">药房</Option>
            <Option value="DOCTOR">医生</Option>
            <Option value="PHARMACIST">药师</Option>
            <Option value="NUTRITIONIST">营养师</Option>
          </Select>
          <Select value={levelFilter} onChange={v => setLevelFilter(v)} style={{ width: 100 }}>
            <Option value="all">全部等级</Option>
            <Option value="S">S级</Option>
            <Option value="A">A级</Option>
            <Option value="B">B级</Option>
            <Option value="C">C级</Option>
            <Option value="D">D级</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setRoleFilter('all'); setLevelFilter('all'); }}>
            重置
          </Button>
        </Space>

        <Table rowKey="id" dataSource={ratedList} columns={columns} pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }} size="middle" />
      </Card>
    </div>
  );
};

export default MerchantRatingPage;
