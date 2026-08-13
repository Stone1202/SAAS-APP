/**
 * PG-SUG-PC-020 Banner 管理列表
 * 创建/编辑/上线/下线
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import type { Banner } from '@/contracts/operations';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'success', label: '生效中' },
  SCHEDULED: { color: 'processing', label: '已排期' },
  OFFLINE: { color: 'default', label: '已下线' },
};

const BannerManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/banners');
      setBanners(Array.isArray(res?.list) ? res.list : []);
    } catch { setBanners([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string, status: string) => {
    const action = status === 'ACTIVE' ? 'offline' : 'online';
    await ad!.post(`/banners/${id}/${action}`);
    message.success(status === 'ACTIVE' ? '已下线' : '已上线');
    load();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingId) {
      await ad!.put('/banners', { id: editingId, ...values });
    } else {
      await ad!.post('/banners', values);
    }
    message.success(editingId ? '已更新' : '已创建');
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
    load();
  };

  const cols = [
    { title: '排序', dataIndex: 'sort', width: 60 },
    { title: 'Banner名称', dataIndex: 'name', width: 180 },
    { title: '投放位置', dataIndex: 'position', width: 130 },
    { title: '排期', dataIndex: 'schedule', width: 160 },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag> },
    { title: '点击量', dataIndex: 'clicks', width: 90, render: (v: number) => v.toLocaleString() },
    { title: '操作', width: 200, render: (_: any, r: Banner) => (
      <Space>
        {r.status === 'ACTIVE' ? (
          <Button size="small" icon={<StopOutlined />} onClick={() => handleToggle(r.id, r.status)}>下线</Button>
        ) : r.status === 'OFFLINE' ? (
          <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleToggle(r.id, r.status)}>上线</Button>
        ) : null}
        <Button size="small" icon={<EditOutlined />} onClick={() => {
          setEditingId(r.id);
          form.setFieldsValue(r);
          setModalOpen(true);
        }}>编辑</Button>
      </Space>
    )},
  ];

  return (
    <Card title="Banner 管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>新建 Banner</Button>}>
      <Table rowKey="id" dataSource={banners} columns={cols} loading={loading} pagination={false} size="middle" />
      <Modal title={editingId ? '编辑 Banner' : '新建 Banner'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditingId(null); }} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="Banner名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
          <Form.Item name="position" label="投放位置" rules={[{ required: true }]}><Input placeholder="如：首页顶部" /></Form.Item>
          <Form.Item name="jump_url" label="跳转链接"><Input placeholder="/live/xxx" /></Form.Item>
          <Form.Item name="sort" label="排序值" rules={[{ required: true }]}><InputNumber min={0} max={999} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="schedule" label="排期"><Input placeholder="如：08/01-08/07" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BannerManagePage;
