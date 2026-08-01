/**
 * PG-SUG-PC-032 经营看板 + PG-SUG-PC-033 商家看板
 * 数据分析双Tab
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Table, Space, DatePicker, Select, Tabs } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, TeamOutlined, ShoppingCartOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const BizDashboardPage: React.FC = () => {
  const { ad } = useUserStore();
  const [tab, setTab] = useState('platform');
  const [topMerchants, setTopMerchants] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30d');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([
        ad!.get<any>(`/analytics/top-merchants?period=${period}`),
        ad!.get<any>(`/analytics/top-products?period=${period}`),
      ]);
      setTopMerchants(Array.isArray(mRes?.list) ? mRes.list : []);
      setTopProducts(Array.isArray(pRes?.list) ? pRes.list : []);
    } catch { setTopMerchants([]); setTopProducts([]); }
    setLoading(false);
  }, [ad, period]);

  useEffect(() => { load(); }, [load]);

  const mCols = [
    { title: '商家', dataIndex: 'name', width: 180 },
    { title: '订单量', dataIndex: 'order_count', width: 90, render: (v: number) => v?.toLocaleString() },
    { title: '交易额', dataIndex: 'revenue', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '环比', dataIndex: 'growth', width: 90, render: (v: number) => <span style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>{v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(v * 100).toFixed(1)}%</span> },
  ];

  const pCols = [
    { title: '商品名称', dataIndex: 'name', width: 200, ellipsis: true },
    { title: '分类', dataIndex: 'category', width: 100 },
    { title: '销量', dataIndex: 'sold_count', width: 90, render: (v: number) => v?.toLocaleString() },
    { title: '销售额', dataIndex: 'revenue', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="平台GMV" value={2586000} prefix="¥" precision={0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="订单总量" value={12480} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="活跃商家" value={186} prefix={<TeamOutlined />} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="环比增长" value={12.5} suffix="%" prefix={<RiseOutlined />} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="新增用户" value={3250} /></Card></Col>
        <Col span={6}><Card><Statistic title="咨询总量" value={8920} /></Card></Col>
        <Col span={6}><Card><Statistic title="处方总数" value={4560} /></Card></Col>
        <Col span={6}><Card><Statistic title="退款率" value="2.3%" valueStyle={{ color: 'var(--color-warning)' }} /></Card></Col>
      </Row>
      <Card extra={<Space><Select value={period} onChange={setPeriod} options={[{ value: '7d', label: '近7天' }, { value: '30d', label: '近30天' }, { value: '90d', label: '近90天' }]} /><DatePicker.RangePicker /></Space>}>
        <Tabs activeKey={tab} onChange={setTab} items={[
          { key: 'platform', label: '经营看板', children: (
            <>
              <h4 style={{ marginBottom: 12 }}>TOP商家排行</h4>
              <Table rowKey="id" dataSource={topMerchants} columns={mCols} loading={loading} pagination={false} size="middle" />
              <h4 style={{ margin: '20px 0 12px' }}>TOP商品排行</h4>
              <Table rowKey="id" dataSource={topProducts} columns={pCols} loading={loading} pagination={false} size="middle" />
            </>
          )},
          { key: 'merchant', label: '商家看板', children: (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <TeamOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <p>请在上方筛选器中指定商家查看专属看板</p>
              <Select placeholder="选择商家" style={{ width: 200 }} options={topMerchants.map(m => ({ value: m.id, label: m.name }))} />
            </div>
          )},
        ]} />
      </Card>
    </div>
  );
};

export default BizDashboardPage;
