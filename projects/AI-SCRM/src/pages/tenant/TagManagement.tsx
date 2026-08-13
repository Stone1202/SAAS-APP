import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Input, Form, Tag, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTagSegmentStore } from '../../stores/useTagSegmentStore';

export default function TagManagement() {
  const { tagGroups, tags, loading, loadAll, createGroup, createTag, deleteTag } = useTagSegmentStore();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [groupForm] = Form.useForm();
  const [tagForm] = Form.useForm();

  useEffect(() => { loadAll(); }, []);

  const handleCreateGroup = async () => {
    try {
      const values = await groupForm.validateFields();
      await createGroup(values);
      message.success('标签组创建成功');
      setShowGroupModal(false);
      groupForm.resetFields();
    } catch { /* validation error */ }
  };

  const handleCreateTag = async () => {
    try {
      const values = await tagForm.validateFields();
      await createTag(values);
      message.success('标签创建成功');
      setShowTagModal(false);
      tagForm.resetFields();
    } catch { /* validation error */ }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>标签管理</h1>
        <div className="description">管理客户标签体系，支持标签组和标签的增删改查</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* 标签组 */}
        <Card
          title="标签组"
          extra={<Button type="link" icon={<PlusOutlined />} onClick={() => setShowGroupModal(true)}>新建</Button>}
        >
          {tagGroups.map((g) => (
            <Card key={g.id} size="small" style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>{g.name}</div>
              <Space size={4} wrap>
                {g.tags?.map((tid) => {
                  const tag = tags.find(t => t.id === tid);
                  return tag ? (
                    <Tag
                      key={tag.id}
                      color={tag.color}
                      closable
                      onClose={() => deleteTag(tag.id)}
                    >
                      {tag.name}
                    </Tag>
                  ) : null;
                })}
              </Space>
            </Card>
          ))}
        </Card>

        {/* 所有标签 */}
        <Card
          title="全部标签"
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setShowTagModal(true)}>新建标签</Button>}
        >
          <Table
            dataSource={tags}
            rowKey="id"
            loading={loading}
            columns={[
              { title: '标签名称', dataIndex: 'name', key: 'name' },
              {
                title: '颜色',
                dataIndex: 'color',
                key: 'color',
                width: 80,
                render: (c: string) => <Tag color={c}>●</Tag>,
              },
              { title: '所属分组', dataIndex: 'groupId', key: 'groupId', render: (gid: string) => tagGroups.find(g => g.id === gid)?.name || '-' },
              {
                title: '操作',
                key: 'action',
                width: 80,
                render: (_, r) => (
                  <a style={{ color: '#FF4D4F' }} onClick={() => { deleteTag(r.id); message.success('标签已删除'); }}>
                    删除
                  </a>
                ),
              },
            ]}
            pagination={false}
            size="small"
          />
        </Card>
      </div>

      <Modal title="新建标签组" open={showGroupModal} onOk={handleCreateGroup} onCancel={() => setShowGroupModal(false)}>
        <Form form={groupForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="组名称" rules={[{ required: true }]}>
            <Input placeholder="如：客户等级" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="新建标签" open={showTagModal} onOk={handleCreateTag} onCancel={() => setShowTagModal(false)}>
        <Form form={tagForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="标签名称" rules={[{ required: true }]}>
            <Input placeholder="如：VIP客户" />
          </Form.Item>
          <Form.Item name="groupId" label="所属标签组">
            <Select placeholder="选择标签组" options={tagGroups.map(g => ({ label: g.name, value: g.id }))} />
          </Form.Item>
          <Form.Item name="color" label="颜色" initialValue="blue">
            <Select options={[
              { label: '红色', value: '#FF4D4F' },
              { label: '橙色', value: '#FA8C16' },
              { label: '黄色', value: '#FAAD14' },
              { label: '绿色', value: '#52C41A' },
              { label: '蓝色', value: '#1677FF' },
              { label: '紫色', value: '#722ED1' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
