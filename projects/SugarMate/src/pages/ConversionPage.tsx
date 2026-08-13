/**
 * PG-SUG-PC-017 转化分析
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Row, Col, Statistic, Select, Space, DatePicker } from 'antd';
import { useUserStore } from '@/stores/userStore';

const ConversionPage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30d');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>(`/analytics/conversion?period=${period}`);
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad, period]);

  useEffect(() => { load(); }, [load]);

  const cols = [
    { title: '阶段', dataIndex: 'stage', width: 120 },
    { title: '进入人数', dataIndex: 'enter_count', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: '转化人数', dataIndex: 'convert_count', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: '转化率', dataIndex: 'rate', width: 90, render: (v: number) => `${(v * 100).toFixed(1)}%` },
    { title: '平均时长', dataIndex: 'avg_duration', width: 100 },
    { title: '流失原因TOP1', dataIndex: 'top_loss_reason', width: 160, ellipsis: true },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="总访问数" value={12850} /></Card></Col>
        <Col span={6}><Card><Statistic title="注册转化率" value="23.5%" valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="下单转化率" value="8.2%" valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="复购率" value="35.1%" valueStyle={{ color: 'var(--color-warning)' }} /></Card></Col>
      </Row>
      <Card title="转化分析" extra={<Space><Select value={period} onChange={setPeriod} options={[{ value: '7d', label: '近7天' }, { value: '30d', label: '近30天' }, { value: '90d', label: '近90天' }]} /><DatePicker.RangePicker /></Space>}>
        <Table rowKey="stage" dataSource={list} columns={cols} loading={loading} pagination={false} size="middle" />
      </Card>
    </div>
  );
};

export default ConversionPage;
