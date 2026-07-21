import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Modal, Form, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { useTodoStore } from '../../stores/useTodoStore';
import type { Todo } from '../../contracts/schemas';

const priorityColor: Record<string, string> = { P0: 'red', P1: 'orange', P2: 'default' };
const typeLabel: Record<string, string> = { '跟进任务': '跟进', '回访': '回访', '催款': '催款', '其他': '其他' };

export default function TodoCenter() {
  const { todos, loading, loadAll, complete, create } = useTodoStore();
  const [activeType, setActiveType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAll({ status: statusFilter === 'all' ? undefined : statusFilter });
  }, [statusFilter]);

  const columns: ColumnsType<Todo> = [
    {
      title: '待办内容',
      dataIndex: 'title',
      key: 'title',
      render: (v: string, r: Todo) => (
        <Space>
          <span className={`priority-dot ${r.priority.toLowerCase()}`} />
          {v}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (v: string) => <Tag>{typeLabel[v] || v}</Tag>,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 100,
      render: (v: string) => v || '-',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (v: string) => <Tag color={priorityColor[v]}>{v}</Tag>,
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (v: string) => new Date(v).toLocaleDateString('zh-CN'),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 70,
      render: (v: string) => <Tag color={v === 'AI' ? 'purple' : 'default'}>{v}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, r) => (
        <a onClick={() => {
          complete(r.id);
          message.success('待办已标记完成');
        }}>完成</a>
      ),
    },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await create(values);
      message.success('待办创建成功');
      setShowCreateModal(false);
      form.resetFields();
    } catch { /* validation */ }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>统一待办中心</h1>
        <div className="description">管理所有待办任务，支持按类型、优先级筛选和批量操作</div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              options={[
                { label: '全部', value: 'all' },
                { label: '待处理', value: 'pending' },
                { label: '已完成', value: 'completed' },
              ]}
            />
            <Select
              value={activeType}
              onChange={setActiveType}
              style={{ width: 120 }}
              options={[
                { label: '全部类型', value: 'all' },
                { label: '跟进任务', value: '跟进任务' },
                { label: '回访', value: '回访' },
                { label: '催款', value: '催款' },
                { label: '其他', value: '其他' },
              ]}
            />
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>新增待办</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={todos.filter(t => activeType === 'all' || t.type === activeType)}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
        />
      </Card>

      <Modal title="新增待办" open={showCreateModal} onOk={handleCreate} onCancel={() => setShowCreateModal(false)}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="待办内容" rules={[{ required: true }]}>
            <Input placeholder="请输入待办内容" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]} initialValue="跟进任务">
            <Select options={[
              { label: '跟进任务', value: '跟进任务' },
              { label: '回访', value: '回访' },
              { label: '催款', value: '催款' },
              { label: '其他', value: '其他' },
            ]} />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]} initialValue="P1">
            <Select options={[
              { label: 'P0 紧急', value: 'P0' },
              { label: 'P1 重要', value: 'P1' },
              { label: 'P2 普通', value: 'P2' },
            ]} />
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="source" label="来源" initialValue="手动">
            <Select options={[
              { label: '手动创建', value: '手动' },
              { label: 'AI生成', value: 'AI' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
