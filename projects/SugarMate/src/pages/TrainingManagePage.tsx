/**
 * PG-SUG-PC-037/038 培训管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Select, Modal, Form, DatePicker, message } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  UPCOMING: { color: 'blue', label: '即将开始' },
  IN_PROGRESS: { color: 'processing', label: '进行中' },
  COMPLETED: { color: 'success', label: '已完成' },
};

const TrainingManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/trainings');
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const values = await form.validateFields();
    await ad!.post('/trainings', values);
    message.success('培训已创建');
    setModalOpen(false);
    form.resetFields();
    load();
  };

  const filtered = list.filter(t => {
    if (search && !t.title?.includes(search) && !t.instructor?.includes(search)) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const cols = [
    { title: '培训标题', dataIndex: 'title', width: 200 },
    { title: '类别', dataIndex: 'category', width: 100 },
    { title: '讲师', dataIndex: 'instructor', width: 100 },
    { title: '培训日期', dataIndex: 'training_date', width: 110 },
    { title: '报名人数', dataIndex: 'enroll_count', width: 90, render: (v: number) => v?.toLocaleString() },
    { title: '完成率', dataIndex: 'completion_rate', width: 80, render: (v: number) => `${(v * 100).toFixed(0)}%` },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '操作', width: 120, render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />}>详情</Button>
        {r.status === 'IN_PROGRESS' && <Button size="small" icon={<PlayCircleOutlined />}>进入</Button>}
      </Space>
    )},
  ];

  const stats = { total: list.length, upcoming: list.filter(t => t.status === 'UPCOMING').length, inProgress: list.filter(t => t.status === 'IN_PROGRESS').length, completed: list.filter(t => t.status === 'COMPLETED').length };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="培训总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="即将开始" value={stats.upcoming} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="进行中" value={stats.inProgress} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
      </Row>
      <Card title="培训管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>创建培训</Button>}>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索标题/讲师" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 200 }} />
          <Select placeholder="状态" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
        </Space>
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
      <Modal title="创建培训" open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="title" label="培训标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true }]}><Input placeholder="如：糖尿病管理" /></Form.Item>
          <Form.Item name="instructor" label="讲师" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="training_date" label="培训日期"><Input placeholder="2026-08-01" /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingManagePage;
