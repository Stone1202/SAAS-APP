/**
 * PG-SUG-PC-016 群发管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Modal, Form, Select, DatePicker, message } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  SCHEDULED: { color: 'processing', label: '已排期' },
  SENDING: { color: 'processing', label: '发送中' },
  COMPLETED: { color: 'success', label: '已完成' },
  CANCELLED: { color: 'error', label: '已取消' },
};

const CampaignManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/campaigns');
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const values = await form.validateFields();
    await ad!.post('/campaigns', values);
    message.success('群发任务已创建');
    setModalOpen(false);
    form.resetFields();
    load();
  };

  const filtered = list.filter(c => !search || c.title?.includes(search) || c.target_group?.includes(search));

  const cols = [
    { title: '任务标题', dataIndex: 'title', width: 180 },
    { title: '目标分组', dataIndex: 'target_group', width: 120 },
    { title: '渠道', dataIndex: 'channel', width: 90, render: (c: string) => <Tag>{c}</Tag> },
    { title: '计划发送', dataIndex: 'target_count', width: 90, render: (v: number) => v?.toLocaleString() },
    { title: '已发送', dataIndex: 'sent_count', width: 80, render: (v: number) => v?.toLocaleString() },
    { title: '触达率', dataIndex: 'reach_rate', width: 80, render: (v: number) => `${(v * 100).toFixed(0)}%` },
    { title: '计划时间', dataIndex: 'scheduled_at', width: 110 },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '操作', width: 100, render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />}>详情</Button>
        {(r.status === 'SCHEDULED' || r.status === 'SENDING') && <Button size="small" danger icon={<StopOutlined />}>取消</Button>}
      </Space>
    )},
  ];

  const stats = { total: list.length, sending: list.filter(c => c.status === 'SENDING').length, completed: list.filter(c => c.status === 'COMPLETED').length };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="任务总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="发送中" value={stats.sending} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
      </Row>
      <Card title="群发管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>创建群发</Button>}>
        <Input prefix={<SearchOutlined />} placeholder="搜索标题/分组" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220, marginBottom: 16 }} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
      <Modal title="创建群发任务" open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="title" label="任务标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="target_group" label="目标分组" rules={[{ required: true }]}><Input placeholder="如：高血糖用户" /></Form.Item>
          <Form.Item name="channel" label="渠道" rules={[{ required: true }]}><Select options={[{ value: '短信', label: '短信' }, { value: 'APP推送', label: 'APP推送' }, { value: '小程序订阅', label: '小程序订阅' }]} /></Form.Item>
          <Form.Item name="scheduled_at" label="计划发送时间"><Input placeholder="2026-08-01 10:00" /></Form.Item>
          <Form.Item name="content" label="消息内容"><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CampaignManagePage;
