/**
 * PG-SUG-PC-036 活动管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Card, Row, Col, Statistic, Space, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import type { Activity } from '@/contracts/operations';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  UPCOMING: { color: 'processing', label: '未开始' },
  ACTIVE: { color: 'success', label: '进行中' },
  ENDED: { color: 'default', label: '已结束' },
};
const TYPE_MAP: Record<string, string> = {
  CAMPAIGN: '营销活动', PROMOTION: '促销活动', EVENT: '事件活动',
};

const ActivityManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/activities');
      setData(Array.isArray(res?.list) ? res.list : []);
    } catch { setData([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const cols = [
    { title: '活动名称', dataIndex: 'name', width: 220 },
    { title: '类型', dataIndex: 'type', width: 100, render: (t: string) => TYPE_MAP[t] || t },
    { title: '开始时间', dataIndex: 'start_time', width: 120 },
    { title: '结束时间', dataIndex: 'end_time', width: 120 },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '操作', width: 80, render: () => <Button size="small" icon={<EyeOutlined />}>详情</Button> },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="活动总数" value={data.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="进行中" value={data.filter(a => a.status === 'ACTIVE').length} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="即将开始" value={data.filter(a => a.status === 'UPCOMING').length} valueStyle={{ color: 'var(--color-primary)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已结束" value={data.filter(a => a.status === 'ENDED').length} /></Card></Col>
      </Row>
      <Card>
        <Table rowKey="id" dataSource={data} columns={cols} loading={loading} pagination={false} size="middle" />
      </Card>
    </div>
  );
};

export default ActivityManagePage;
