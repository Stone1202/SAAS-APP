/**
 * PG-SUG-PC-011 配置中心
 * 系统级业务参数配置
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Modal, Form, InputNumber, Select, Switch, message, Tabs } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const ConfigCenterPage: React.FC = () => {
  const { ad } = useUserStore();
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/configs');
      setConfigs(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setConfigs([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingId) {
      await ad!.put(`/configs/${editingId}`, values);
      message.success('已更新');
    } else {
      await ad!.post('/configs', values);
      message.success('已创建');
    }
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
    load();
  };

  const filtered = configs.filter(c => {
    if (search && !c.key?.includes(search) && !c.description?.includes(search)) return false;
    if (activeTab !== 'all' && c.group !== activeTab) return false;
    return true;
  });

  const groups = ['all', ...new Set(configs.map((c: any) => c.group).filter(Boolean))];

  const cols = [
    { title: '参数Key', dataIndex: 'key', width: 180 },
    { title: '参数值', dataIndex: 'value', width: 200, render: (v: any) => <code>{typeof v === 'boolean' ? v.toString() : v}</code> },
    { title: '分组', dataIndex: 'group', width: 100, render: (g: string) => <Tag>{g}</Tag> },
    { title: '类型', dataIndex: 'type', width: 80, render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
    { title: '修改人', dataIndex: 'updated_by', width: 90 },
    { title: '修改时间', dataIndex: 'updated_at', width: 110, render: (v: number) => v ? new Date(v * 1000).toLocaleDateString() : '-' },
    { title: '操作', width: 80, render: (_: any, r: any) => (
      <Button size="small" icon={<EditOutlined />} onClick={() => {
        setEditingId(r.id);
        form.setFieldsValue(r);
        setModalOpen(true);
      }}>编辑</Button>
    )},
  ];

  return (
    <div>
      <Card title="配置中心" extra={<Space><Button icon={<ReloadOutlined />} onClick={load}>刷新</Button><Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>新增配置</Button></Space>}>
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索参数Key/描述" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220 }} />
        </Space>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'all', label: '全部' },
          ...groups.filter(g => g !== 'all').map(g => ({ key: g, label: g })),
        ]} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 15 }} size="middle" />
      </Card>
      <Modal title={editingId ? '编辑配置' : '新增配置'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditingId(null); }} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="key" label="参数Key" rules={[{ required: true }]}><Input disabled={!!editingId} /></Form.Item>
          <Form.Item name="value" label="参数值" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="group" label="分组" rules={[{ required: true }]}><Select options={groups.filter(g => g !== 'all').map(g => ({ value: g, label: g }))} /></Form.Item>
          <Form.Item name="type" label="类型"><Select options={[{ value: 'STRING', label: '字符串' }, { value: 'NUMBER', label: '数字' }, { value: 'BOOLEAN', label: '开关' }]} /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigCenterPage;
