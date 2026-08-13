import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Select, Space, Modal, Form, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ImportOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { useCustomerStore } from '../../stores/useCustomerStore';
import type { Customer } from '../../contracts/schemas';

export default function CustomerList() {
  const navigate = useNavigate();
  const { customers, loading, loadAll, create, remove } = useCustomerStore();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAll({ search: search || undefined, tags: tagFilter.length > 0 ? tagFilter : undefined });
  }, [search, tagFilter]);

  const columns: ColumnsType<Customer> = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 140 },
    { title: '公司', dataIndex: 'company', key: 'company', width: 180 },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <Space size={4} wrap>
          {tags?.map((t) => (
            <Tag key={t} color="blue">{t}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v: string) => new Date(v).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <a onClick={() => navigate(`/tenant/customers/${record.id}`)}>详情</a>
          <a style={{ color: '#FF4D4F' }} onClick={() => {
            Modal.confirm({
              title: '确定删除该客户？',
              content: `将删除客户「${record.name}」的全部数据`,
              okText: '确定删除',
              okType: 'danger',
              cancelText: '取消',
              onOk: async () => {
                await remove(record.id);
                message.success('客户已删除');
              },
            });
          }}>删除</a>
        </Space>
      ),
    },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await create(values);
      message.success('客户创建成功');
      setShowCreateModal(false);
      form.resetFields();
    } catch {
      // validation error
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>客户列表</h1>
        <div className="description">管理所有客户信息，支持搜索、筛选和批量操作</div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="搜索姓名/手机/公司"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
            <Select
              mode="multiple"
              placeholder="标签筛选"
              style={{ width: 200 }}
              value={tagFilter}
              onChange={setTagFilter}
              options={[
                { label: 'VIP', value: 'VIP' },
                { label: '意向客户', value: '意向客户' },
                { label: '新客户', value: '新客户' },
                { label: '高意向', value: '高意向' },
              ]}
              allowClear
            />
          </Space>
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setShowCreateModal(true)}>
              新增客户
            </Button>
            <Button icon={<ImportOutlined />}>批量导入</Button>
            <Button icon={<ExportOutlined />}>导出</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          onRow={(r) => ({
            onClick: () => navigate(`/tenant/customers/${r.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            total: customers.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 新增客户弹窗 */}
      <Modal
        title="新增客户"
        open={showCreateModal}
        onOk={handleCreate}
        onCancel={() => {
          form.resetFields();
          setShowCreateModal(false);
        }}
        width={560}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item name="company" label="公司">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Select placeholder="请选择" options={[
              { label: '线下推广', value: '线下推广' },
              { label: '线上推广', value: '线上推广' },
              { label: '转介绍', value: '转介绍' },
              { label: '其他', value: '其他' },
            ]} />
          </Form.Item>
          <Form.Item name="tags" label="初始标签">
            <Select mode="multiple" placeholder="选择标签" options={[
              { label: 'VIP', value: 'VIP' },
              { label: '意向客户', value: '意向客户' },
              { label: '新客户', value: '新客户' },
              { label: '高意向', value: '高意向' },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
