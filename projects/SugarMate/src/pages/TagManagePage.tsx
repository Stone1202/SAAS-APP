/**
 * PG-SUG-PC-014 标签分组管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Modal, Form, Select, InputNumber, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const TagManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/tags');
      setTags(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setTags([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingId) {
      await ad!.put(`/tags/${editingId}`, values);
      message.success('已更新');
    } else {
      await ad!.post('/tags', values);
      message.success('已创建');
    }
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await ad!.delete(`/tags/${id}`);
    message.success('已删除');
    load();
  };

  const filtered = tags.filter(t => !search || t.name?.includes(search) || t.group?.includes(search));

  const cols = [
    { title: '标签名', dataIndex: 'name', width: 150, render: (n: string) => <Tag color="blue">{n}</Tag> },
    { title: '分组', dataIndex: 'group', width: 120 },
    { title: '类型', dataIndex: 'type', width: 100, render: (t: string) => <Tag>{t}</Tag> },
    { title: '关联客户数', dataIndex: 'customer_count', width: 110, render: (v: number) => v?.toLocaleString() },
    { title: '创建时间', dataIndex: 'created_at', width: 110, render: (v: number) => v ? new Date(v * 1000).toLocaleDateString() : '-' },
    { title: '操作', width: 120, render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="标签总数" value={tags.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="标签分组" value={new Set(tags.map((t: any) => t.group)).size} /></Card></Col>
      </Row>
      <Card title="标签分组管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>新增标签</Button>}>
        <Input prefix={<SearchOutlined />} placeholder="搜索标签名/分组" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220, marginBottom: 16 }} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
      <Modal title={editingId ? '编辑标签' : '新增标签'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditingId(null); }} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="标签名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="group" label="分组" rules={[{ required: true }]}><Input placeholder="如：健康状况" /></Form.Item>
          <Form.Item name="type" label="类型"><Select options={[{ value: 'STATIC', label: '静态' }, { value: 'DYNAMIC', label: '动态规则' }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagManagePage;
