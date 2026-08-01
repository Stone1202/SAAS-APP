/**
 * PG-SUG-PC 分账配置
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Modal, Form, InputNumber, Select, message, Descriptions } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const SplitConfigPage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/finance/split-configs');
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingId) {
      await ad!.put(`/finance/split-configs/${editingId}`, values);
      message.success('已更新');
    } else {
      await ad!.post('/finance/split-configs', values);
      message.success('已创建');
    }
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await ad!.delete(`/finance/split-configs/${id}`);
    message.success('已删除');
    load();
  };

  const filtered = list.filter(s => !search || s.merchant_name?.includes(search));

  const cols = [
    { title: '商家', dataIndex: 'merchant_name', width: 160 },
    { title: '分账比例', dataIndex: 'split_ratio', width: 100, render: (v: number) => <Tag color="blue">{v}%</Tag> },
    { title: '平台抽成', dataIndex: 'platform_fee', width: 100, render: (v: number) => `${v}%` },
    { title: '结算周期', dataIndex: 'settlement_cycle', width: 100, render: (c: string) => <Tag>{c}</Tag> },
    { title: '生效日期', dataIndex: 'effective_date', width: 110 },
    { title: '状态', dataIndex: 'active', width: 70, render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? '生效中' : '已失效'}</Tag> },
    { title: '操作', width: 120, render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <Card title="分账配置" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>新增配置</Button>}>
      <Input prefix={<SearchOutlined />} placeholder="搜索商家名" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220, marginBottom: 16 }} />
      <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={false} size="middle" />
      <Modal title={editingId ? '编辑分账配置' : '新增分账配置'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditingId(null); }} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="merchant_name" label="商家" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="split_ratio" label="商家分账比例 (%)" rules={[{ required: true }]}><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="platform_fee" label="平台抽成 (%)" rules={[{ required: true }]}><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="settlement_cycle" label="结算周期" rules={[{ required: true }]}><Select options={[{ value: 'T+1', label: 'T+1' }, { value: 'T+7', label: 'T+7' }, { value: 'T+15', label: 'T+15' }, { value: 'T+30', label: 'T+30' }]} /></Form.Item>
          <Form.Item name="effective_date" label="生效日期"><Input placeholder="2026-08-01" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SplitConfigPage;
