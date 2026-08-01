/**
 * PG-SUG-PC-039 角色权限管理
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Modal, Form, Select, Checkbox, message, Tree } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const PERMISSION_TREE = [
  { key: 'dashboard', title: '工作台概览', children: [{ key: 'dashboard.view', title: '查看' }] },
  { key: 'onboarding', title: '入驻管理', children: [
    { key: 'onboarding.applications', title: '入驻审核', children: [{ key: 'onboarding.approve', title: '审批操作' }, { key: 'onboarding.view', title: '查看' }] },
    { key: 'onboarding.merchants', title: '商家管理', children: [{ key: 'onboarding.merchants.view', title: '查看' }, { key: 'onboarding.merchants.edit', title: '编辑' }] },
    { key: 'onboarding.certificates', title: '资质审核', children: [{ key: 'onboarding.certificates.approve', title: '审批' }, { key: 'onboarding.certificates.view', title: '查看' }] },
    { key: 'onboarding.contracts', title: '合同管理', children: [{ key: 'onboarding.contracts.view', title: '查看' }] },
    { key: 'onboarding.config', title: '配置中心', children: [{ key: 'onboarding.config.edit', title: '编辑' }, { key: 'onboarding.config.view', title: '查看' }] },
  ]},
  { key: 'scrm', title: 'SCRM', children: [
    { key: 'scrm.customers', title: '客户管理', children: [{ key: 'scrm.customers.view', title: '查看' }, { key: 'scrm.customers.edit', title: '编辑' }] },
    { key: 'scrm.tags', title: '标签管理', children: [{ key: 'scrm.tags.edit', title: '编辑' }, { key: 'scrm.tags.view', title: '查看' }] },
    { key: 'scrm.sop', title: 'SOP自动化', children: [{ key: 'scrm.sop.edit', title: '编辑' }] },
    { key: 'scrm.campaign', title: '群发管理', children: [{ key: 'scrm.campaign.create', title: '创建' }, { key: 'scrm.campaign.view', title: '查看' }] },
    { key: 'scrm.conversation', title: '会话存档', children: [{ key: 'scrm.conversation.view', title: '查看' }] },
    { key: 'scrm.leads', title: '线索管理', children: [{ key: 'scrm.leads.view', title: '查看' }] },
  ]},
  { key: 'product', title: '商品管理', children: [
    { key: 'product.list', title: '商品列表', children: [{ key: 'product.list.view', title: '查看' }, { key: 'product.list.edit', title: '编辑' }] },
    { key: 'product.otc', title: 'OTC审核', children: [{ key: 'product.otc.approve', title: '审批' }] },
    { key: 'product.category', title: '分类管理', children: [{ key: 'product.category.edit', title: '编辑' }] },
  ]},
  { key: 'order', title: '订单管理', children: [
    { key: 'order.list', title: '订单列表', children: [{ key: 'order.list.view', title: '查看' }] },
    { key: 'order.coldchain', title: '冷链监控', children: [{ key: 'order.coldchain.view', title: '查看' }] },
    { key: 'order.aftersale', title: '售后工单', children: [{ key: 'order.aftersale.process', title: '处理' }, { key: 'order.aftersale.view', title: '查看' }] },
  ]},
  { key: 'finance', title: '财务管理', children: [
    { key: 'finance.settlement', title: '结算管理', children: [{ key: 'finance.settlement.view', title: '查看' }] },
    { key: 'finance.reconciliation', title: '对账报表', children: [{ key: 'finance.reconciliation.view', title: '查看' }] },
    { key: 'finance.split', title: '分账配置', children: [{ key: 'finance.split.edit', title: '编辑' }] },
  ]},
  { key: 'operations', title: '运营管理', children: [
    { key: 'operations.banner', title: 'Banner管理', children: [{ key: 'operations.banner.edit', title: '编辑' }] },
    { key: 'operations.content', title: '内容审核', children: [{ key: 'operations.content.approve', title: '审批' }] },
    { key: 'operations.activity', title: '活动管理', children: [{ key: 'operations.activity.edit', title: '编辑' }] },
    { key: 'operations.ticket', title: '客服工单', children: [{ key: 'operations.ticket.process', title: '处理' }] },
    { key: 'operations.complaint', title: '投诉纠纷', children: [{ key: 'operations.complaint.process', title: '处理' }] },
  ]},
  { key: 'analytics', title: '数据分析', children: [{ key: 'analytics.view', title: '查看' }] },
  { key: 'system', title: '系统设置', children: [{ key: 'system.roles', title: '角色管理' }, { key: 'system.config', title: '系统配置' }] },
];

const RolePermissionPage: React.FC = () => {
  const { ad } = useUserStore();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/roles');
      setRoles(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setRoles([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const values = await form.validateFields();
    const data = { ...values, permissions: checkedKeys };
    if (editingId) {
      await ad!.put(`/roles/${editingId}`, data);
      message.success('已更新');
    } else {
      await ad!.post('/roles', data);
      message.success('已创建');
    }
    setModalOpen(false);
    setEditingId(null);
    setCheckedKeys([]);
    form.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await ad!.delete(`/roles/${id}`);
    message.success('已删除');
    load();
  };

  const filtered = roles.filter(r => !search || r.name?.includes(search));

  const cols = [
    { title: '角色名称', dataIndex: 'name', width: 150 },
    { title: '描述', dataIndex: 'description', width: 240, ellipsis: true },
    { title: '成员数', dataIndex: 'user_count', width: 80, render: (v: number) => v?.toLocaleString() },
    { title: '状态', dataIndex: 'active', width: 70, render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? '启用' : '禁用'}</Tag> },
    { title: '操作', width: 120, render: (_: any, r: any) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setCheckedKeys(r.permissions || []); setModalOpen(true); }}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <div>
      <Card title="角色权限管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setCheckedKeys([]); setModalOpen(true); }}>新增角色</Button>}>
        <Input prefix={<SearchOutlined />} placeholder="搜索角色" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 200, marginBottom: 16 }} />
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={false} size="middle" />
      </Card>
      <Modal title={editingId ? '编辑角色' : '新增角色'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditingId(null); }} width={640} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="权限分配">
            <Tree checkable defaultExpandAll checkedKeys={checkedKeys} onCheck={(keys) => setCheckedKeys(keys as string[])} treeData={PERMISSION_TREE} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolePermissionPage;
