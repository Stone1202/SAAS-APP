/**
 * PG-SUG-PC-026 商品分类管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Modal, Form, Select, InputNumber, message, Tree } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const CategoryManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/categories');
      setCategories(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setCategories([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingId) {
      await ad!.put(`/categories/${editingId}`, values);
      message.success('已更新');
    } else {
      await ad!.post('/categories', values);
      message.success('已创建');
    }
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await ad!.delete(`/categories/${id}`);
    message.success('已删除');
    load();
  };

  const cols = [
    { title: '分类名称', dataIndex: 'name', width: 180, render: (n: string, r: any) => <Space><FolderOutlined style={{ color: '#faad14' }} /> {n}</Space> },
    { title: '层级', dataIndex: 'level', width: 70, render: (l: number) => <Tag>{`L${l}`}</Tag> },
    { title: '父分类', dataIndex: 'parent_name', width: 140, render: (n: string) => n || '—' },
    { title: '排序值', dataIndex: 'sort', width: 70 },
    { title: '关联商品数', dataIndex: 'product_count', width: 100, render: (v: number) => v?.toLocaleString() },
    { title: '操作', width: 120, render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <Card title="商品分类管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>新增分类</Button>}>
      <Table rowKey="id" dataSource={categories} columns={cols} loading={loading} pagination={false} size="middle" />
      <Modal title={editingId ? '编辑分类' : '新增分类'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditingId(null); }} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="parent_id" label="父分类"><Select allowClear placeholder="不选则为根分类" options={categories.map(c => ({ value: c.id, label: c.name }))} /></Form.Item>
          <Form.Item name="sort" label="排序值"><InputNumber min={0} max={999} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CategoryManagePage;
