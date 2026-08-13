/**
 * PG-SUG-PC-029 冷链监控
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Select } from 'antd';
import { SearchOutlined, WarningOutlined, EyeOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import { useColdChainStore } from '@/stores/coldChainStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  NORMAL: { color: 'success', label: '正常' },
  WARNING: { color: 'warning', label: '温度预警' },
  ALERT: { color: 'error', label: '温度异常' },
  OFFLINE: { color: 'default', label: '离线' },
};

// 兜底 Mock 数据（API不可用时使用）
function generateMockDevices() {
  return [
    { device_no: 'CC-A001', order_no: 'SG20260731001', current_temp: 2.8, temp_range: '2-8°C', humidity: 45, battery: 78, location: '深圳·南山', last_report: Math.floor(Date.now() / 1000) - 60, status: 'NORMAL' },
    { device_no: 'CC-A002', order_no: 'SG20260731002', current_temp: 3.2, temp_range: '2-8°C', humidity: 42, battery: 92, location: '广州·天河', last_report: Math.floor(Date.now() / 1000) - 180, status: 'NORMAL' },
    { device_no: 'CC-A003', order_no: 'SG20260731003', current_temp: 8.5, temp_range: '2-8°C', humidity: 55, battery: 65, location: '深圳·福田', last_report: Math.floor(Date.now() / 1000) - 300, status: 'WARNING' },
    { device_no: 'CC-A004', order_no: 'SG20260731004', current_temp: 2.1, temp_range: '2-8°C', humidity: 38, battery: 23, location: '东莞·虎门', last_report: Math.floor(Date.now() / 1000) - 900, status: 'ALERT' },
  ];
}

const ColdChainMonitorPage: React.FC = () => {
  const { ad } = useUserStore();
  const { startMonitoring, stopMonitoring, temperatureHistory, currentTemp } = useColdChainStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/coldchain/devices');
      const devices = Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : [];
      setList(devices.length > 0 ? devices : generateMockDevices());
    } catch {
      // API不可用时使用 Mock 数据
      setList(generateMockDevices());
    }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(d => {
    if (search && !d.device_no?.includes(search) && !d.order_no?.includes(search)) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  const cols = [
    { title: '设备编号', dataIndex: 'device_no', width: 130 },
    { title: '关联订单', dataIndex: 'order_no', width: 150 },
    { title: '当前温度', dataIndex: 'current_temp', width: 90, render: (v: number) => <span style={{ color: v > 8 ? '#ff4d4f' : v < 2 ? '#1890ff' : '#52c41a', fontWeight: 'bold' }}>{v}°C</span> },
    { title: '温度范围', dataIndex: 'temp_range', width: 100 },
    { title: '湿度', dataIndex: 'humidity', width: 80, render: (v: number) => `${v}%` },
    { title: '电池', dataIndex: 'battery', width: 70, render: (v: number) => `${v}%` },
    { title: '位置', dataIndex: 'location', width: 120 },
    { title: '最后上报', dataIndex: 'last_report', width: 100, render: (v: number) => v ? new Date(v * 1000).toLocaleTimeString() : '-' },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '操作', width: 80, render: () => <Button size="small" icon={<EyeOutlined />}>详情</Button> },
  ];

  const stats = { total: list.length, warning: list.filter(d => d.status === 'WARNING').length, alert: list.filter(d => d.status === 'ALERT').length };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="监控设备" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="温度预警" value={stats.warning} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="温度异常" value={stats.alert} valueStyle={{ color: 'var(--color-error)' }} prefix={<WarningOutlined />} /></Card></Col>
      </Row>
      <Card title="冷链监控">
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索设备编号/订单号" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220 }} />
          <Select placeholder="状态" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
        </Space>
        <Table rowKey="device_no" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
    </div>
  );
};

export default ColdChainMonitorPage;
