import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTagSegmentStore } from '../../stores/useTagSegmentStore';

export default function CustomerSegmentation() {
  const { segments, loading, loadAll, createSegment } = useTagSegmentStore();
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { loadAll(); }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createSegment({
        ...values,
        conditions: [{ field: values.field, operator: values.operator, value: values.value }],
      });
      message.success('分群创建成功');
      setShowModal(false);
      form.resetFields();
    } catch { /* validation */ }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>客户分群管理</h1>
        <div className="description">按条件规则创建客户分群，用于精准营销和差异化服务</div>
      </div>

      <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>新建分群</Button>}>
        {segments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无分群，点击「新建分群」创建第一个客户分群
          </div>
        ) : (
          <Table
            dataSource={segments}
            rowKey="id"
            loading={loading}
            columns={[
              { title: '分群名称', dataIndex: 'name', key: 'name' },
              { title: '描述', dataIndex: 'description', key: 'description', render: (v: string) => v || '-' },
              {
                title: '条件数',
                dataIndex: 'conditions',
                key: 'conditions',
                width: 80,
                render: (c: any[]) => c?.length || 0,
              },
              { title: '客户数', dataIndex: 'customerCount', key: 'customerCount', width: 80 },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                width: 120,
                render: (v: string) => new Date(v).toLocaleDateString('zh-CN'),
              },
            ]}
            pagination={false}
          />
        )}
      </Card>

      <Modal title="新建分群" open={showModal} onOk={handleCreate} onCancel={() => setShowModal(false)} width={600}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="分群名称" rules={[{ required: true }]}>
            <Input placeholder="如：高价值客户" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="描述分群的目的和规则" />
          </Form.Item>
          <Form.Item label="筛选条件">
            <Space>
              <Form.Item name="field" noStyle initialValue="tags">
                <Select style={{ width: 120 }} options={[
                  { label: '标签', value: 'tags' },
                  { label: '来源', value: 'source' },
                  { label: '行业', value: 'industry' },
                ]} />
              </Form.Item>
              <Form.Item name="operator" noStyle initialValue="contains">
                <Select style={{ width: 100 }} options={[
                  { label: '包含', value: 'contains' },
                  { label: '等于', value: 'equals' },
                ]} />
              </Form.Item>
              <Form.Item name="value" noStyle>
                <Input placeholder="条件值" style={{ width: 200 }} />
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
