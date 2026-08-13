/**
 * PG-SUG-PC-015 SOP自动化管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Switch, Modal, Form, Select, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const SOPManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/sop-flows');
      setFlows(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setFlows([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string, active: boolean) => {
    await ad!.post(`/sop-flows/${id}/${active ? 'disable' : 'enable'}`);
    message.success(active ? '已停用' : '已启用');
    load();
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    await ad!.post('/sop-flows', values);
    message.success('SOP已创建');
    setModalOpen(false);
    form.resetFields();
    load();
  };

  const filtered = flows.filter(f => !search || f.name?.includes(search) || f.scene?.includes(search));

  const cols = [
    { title: 'SOP名称', dataIndex: 'name', width: 180 },
    { title: '触发场景', dataIndex: 'scene', width: 150 },
    { title: '步骤数', dataIndex: 'step_count', width: 70 },
    { title: '执行次数', dataIndex: 'exec_count', width: 90, render: (v: number) => v?.toLocaleString() },
    { title: '成功率', dataIndex: 'success_rate', width: 80, render: (v: number) => `${(v * 100).toFixed(0)}%` },
    { title: '状态', dataIndex: 'active', width: 80, render: (v: boolean) => v ? <Tag color="success">启用</Tag> : <Tag color="default">停用</Tag> },
    { title: '操作', width: 140, render: (_: any, r: any) => (
      <Space>
        {r.active
          ? <Button size="small" icon={<PauseCircleOutlined />} onClick={() => handleToggle(r.id, r.active)}>停用</Button>
          : <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => handleToggle(r.id, r.active)}>启用</Button>
        }
        <Button size="small" icon={<EditOutlined />}>编辑</Button>
      </Space>
    )},
  ];

  const stats = { total: flows.length, active: flows.filter(f => f.active).length, avgSteps: flows.length > 0 ? Math.round(flows.reduce((s, f) => s + (f.step_count || 0), 0) / flows.length) : 0 };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="SOP总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="启用中" value={stats.active} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均步骤" value={stats.avgSteps} suffix="步" /></Card></Col>
      </Row>
      <Card title="SOP自动化" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>创建SOP</Button>}>
        <Input prefix={<SearchOutlined />} placeholder="搜索SOP名/场景" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 220, marginBottom: 16 }} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
      <Modal title="创建SOP" open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="SOP名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="scene" label="触发场景" rules={[{ required: true }]}><Input placeholder="如：新客注册48h未下单" /></Form.Item>
          <Form.Item name="step_count" label="步骤数"><Input type="number" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SOPManagePage;
