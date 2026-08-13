import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Descriptions, Tag, Button, Space, Skeleton, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { useCommunicationStore } from '../../stores/useCommunicationStore';
import type { Customer } from '../../contracts/schemas';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, update, remove } = useCustomerStore();
  const { records, loadRecords } = useCommunicationStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      getById(id).then((c) => {
        setCustomer(c || null);
        setLoading(false);
        if (c) form.setFieldsValue(c);
      });
      loadRecords();
    }
  }, [id]);

  if (loading) {
    return <div className="page-container"><Skeleton active paragraph={{ rows: 10 }} /></div>;
  }

  if (!customer) {
    return <div className="page-container"><Card>客户不存在</Card></div>;
  }

  const customerRecords = records.filter(r => r.customerId === id);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const updated = await update(id!, values);
      setCustomer(updated);
      setEditModalOpen(false);
      message.success('客户信息已更新');
    } catch { /* validation error */ }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确定删除该客户？',
      content: `将删除客户「${customer.name}」的全部数据，此操作不可撤销。`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await remove(id!);
        message.success('客户已删除');
        navigate('/tenant/customers');
      },
    });
  };

  const TabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: (
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="姓名">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{customer.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="公司">{customer.company || '-'}</Descriptions.Item>
          <Descriptions.Item label="来源">
            <Tag>{customer.source || '-'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="行业">{customer.industry || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(customer.createdAt).toLocaleDateString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="标签" span={2}>
            <Space size={4} wrap>
              {customer.tags?.map((t) => <Tag key={t} color="blue">{t}</Tag>)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{customer.notes || '-'}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'communication',
      label: '沟通记录',
      children: (
        <>
          {customerRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              暂无沟通记录，点击「发起沟通」开始
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {customerRecords.map((r) => (
                <Card key={r.id} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Space>
                      <Tag color={r.channel === '企微' ? 'green' : r.channel === '电话' ? 'blue' : 'default'}>
                        {r.channel}
                      </Tag>
                      {r.emotion && (
                        <span className={`emotion-dot ${r.emotion}`} />
                      )}
                      {r.intent && <Tag>{r.intent}</Tag>}
                    </Space>
                    <span style={{ color: '#999', fontSize: 12 }}>
                      {new Date(r.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div style={{ color: '#666' }}>{r.content}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    坐席：{r.agentName} | 方向：{r.direction === 'inbound' ? '客户→' : '→客户'}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ),
    },
    {
      key: 'followup',
      label: '跟进记录',
      children: (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          跟进记录功能开发中，敬请期待
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{customer.name}</h1>
          <div className="description">{customer.company} · {customer.phone}</div>
        </div>
        <Space>
          <Button icon={<MessageOutlined />} type="primary" onClick={() => navigate('/tenant/communication')}>
            发起沟通
          </Button>
          <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>编辑</Button>
          <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>删除</Button>
        </Space>
      </div>

      <Tabs items={TabItems} />

      <Modal
        title={`编辑客户 - ${customer.name}`}
        open={editModalOpen}
        onOk={handleUpdate}
        onCancel={() => setEditModalOpen(false)}
        width={560}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号"><Input /></Form.Item>
          <Form.Item name="company" label="公司"><Input /></Form.Item>
          <Form.Item name="source" label="来源">
            <Select options={[
              { label: '线下推广', value: '线下推广' },
              { label: '线上推广', value: '线上推广' },
              { label: '转介绍', value: '转介绍' },
              { label: '其他', value: '其他' },
            ]} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="multiple" options={[
              { label: 'VIP', value: 'VIP' },
              { label: '意向客户', value: '意向客户' },
              { label: '新客户', value: '新客户' },
              { label: '高意向', value: '高意向' },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
