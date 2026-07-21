import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Input, Form, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { useCommunicationStore } from '../../stores/useCommunicationStore';
import type { Script } from '../../contracts/schemas';

export default function ScriptLibrary() {
  const { scripts, loading, loadScripts, createScript } = useCommunicationStore();
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { loadScripts(); }, []);

  const columns: ColumnsType<Script> = [
    { title: '标题', dataIndex: 'title', key: 'title', width: 180 },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (v: string) => <span style={{ color: '#666' }}>{v.slice(0, 60)}...</span>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (tags: string[]) => (
        <Space size={4} wrap>
          {tags?.map((t) => <Tag key={t}>{t}</Tag>)}
        </Space>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, r) => <a>编辑</a>,
    },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createScript(values);
      message.success('话术创建成功');
      setShowModal(false);
      form.resetFields();
    } catch { /* validation error */ }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>话术库管理</h1>
        <div className="description">管理销售话术模板，支持分类、标签和使用统计</div>
      </div>

      <Card
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>新增话术</Button>}
      >
        <Table
          columns={columns}
          dataSource={scripts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Modal title="新增话术" open={showModal} onOk={handleCreate} onCancel={() => setShowModal(false)} width={600}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="如：产品优势介绍" />
          </Form.Item>
          <Form.Item name="content" label="话术内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="输入话术正文" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select placeholder="选择分类" options={[
              { label: '产品介绍', value: '产品介绍' },
              { label: '异议处理', value: '异议处理' },
              { label: '跟进', value: '跟进' },
              { label: '订单通知', value: '订单通知' },
            ]} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签名回车添加" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
