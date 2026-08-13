/**
 * PC后台 - 问诊服务管理
 * 
 * 功能：管理所有医生可发布的问诊服务SKU（图文/语音/视频问诊）
 * 数据流向：admin CRUD → consultationServiceStore → MP/APP消费
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, InputNumber,
  Select, Switch, Popconfirm, message, Typography, Row, Col, Statistic, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  VideoCameraOutlined, PhoneOutlined, AudioOutlined, FileTextOutlined,
  ReloadOutlined, PauseCircleOutlined, PlayCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useConsultationServiceStore, type ConsultationService, type ConsultMode, type ServiceStatus } from '@/stores/consultationServiceStore';
import { useMerchantStore } from '@/stores/merchantStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ==================== 模式配置 ====================

const MODE_CONFIG: Record<ConsultMode, { label: string; icon: React.ReactNode; color: string }> = {
  text: { label: '图文问诊', icon: <FileTextOutlined />, color: 'blue' },
  voice: { label: '语音问诊', icon: <AudioOutlined />, color: 'green' },
  video: { label: '视频问诊', icon: <VideoCameraOutlined />, color: 'purple' },
  phone: { label: '电话问诊', icon: <PhoneOutlined />, color: 'orange' },
};

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'green' },
  paused: { label: '已暂停', color: 'orange' },
};

// ==================== 组件 ====================

const ConsultationServiceManagePage: React.FC = () => {
  const {
    services, loading, loadServices,
    createService, updateService, deleteService, toggleServiceStatus,
  } = useConsultationServiceStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // 加载医生列表，用于选择关联医生（从业务后台 merchantStore 读取已上线的医生）
  const [doctorOptions, setDoctorOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const store = useMerchantStore.getState();
    const docs = store.getOnlineDoctors();
    setDoctorOptions(docs.map(d => ({ value: d.id, label: `[${d.title}] ${d.name}` })));
  }, []);

  useEffect(() => {
    loadServices();
  }, []);

  // ==================== 统计 ====================

  const stats = useMemo(() => ({
    total: services.length,
    published: services.filter(s => s.status === 'published').length,
    paused: services.filter(s => s.status === 'paused').length,
    draft: services.filter(s => s.status === 'draft').length,
    totalOrders: services.reduce((sum, s) => sum + s.orderCount, 0),
  }), [services]);

  // ==================== CRUD 操作 ====================

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ mode: 'text', status: 'draft', duration: 30, price: 0 });
    setModalOpen(true);
  };

  const handleEdit = (record: ConsultationService) => {
    setEditingId(record.id);
    form.setFieldsValue({
      doctorId: record.doctorId,
      mode: record.mode,
      title: record.title,
      desc: record.desc,
      price: record.price,
      originalPrice: record.originalPrice,
      duration: record.duration,
      replyWithin: record.replyWithin,
      tags: record.tags?.join(', '),
      schedule: record.schedule?.join('\n'),
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const doctorName = doctorOptions.find(d => d.value === values.doctorId)?.label || '';
      const data = {
        doctorId: values.doctorId,
        doctorName,
        mode: values.mode,
        title: values.title,
        desc: values.desc || '',
        price: values.price,
        originalPrice: values.originalPrice,
        duration: values.duration,
        replyWithin: values.replyWithin || '',
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        schedule: values.schedule ? values.schedule.split('\n').filter(Boolean) : [],
        status: values.status as ServiceStatus,
      };

      if (editingId) {
        await updateService(editingId, data);
        message.success('服务已更新');
      } else {
        await createService(data);
        message.success('服务已创建');
      }
      setModalOpen(false);
    } catch (e) {
      // validation error
    }
  };

  const handleDelete = async (id: string) => {
    await deleteService(id);
    message.success('服务已删除');
  };

  const handleToggleStatus = async (id: string, currentStatus: ServiceStatus) => {
    const newStatus = currentStatus === 'published' ? 'paused' : 'published';
    await toggleServiceStatus(id, newStatus);
    message.success(`服务已${newStatus === 'published' ? '发布' : '暂停'}`);
  };

  // ==================== 表格列定义 ====================

  const columns: ColumnsType<ConsultationService> = [
    {
      title: '服务名称',
      dataIndex: 'title',
      width: 180,
      render: (text, record) => (
        <Space>
          <Tag icon={MODE_CONFIG[record.mode]?.icon} color={MODE_CONFIG[record.mode]?.color}>
            {MODE_CONFIG[record.mode]?.label}
          </Tag>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '关联医生',
      dataIndex: 'doctorName',
      width: 100,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '价格（元）',
      dataIndex: 'price',
      width: 110,
      sorter: (a, b) => a.price - b.price,
      render: (price, record) => (
        <Space>
          <Text strong style={{ color: '#f5222d' }}>¥{price}</Text>
          {record.originalPrice && record.originalPrice > price && (
            <Text delete type="secondary" style={{ fontSize: 12 }}>¥{record.originalPrice}</Text>
          )}
        </Space>
      ),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      width: 80,
      render: (d) => d >= 24 * 60 ? '不限时' : `${d}分钟`,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <Space wrap size={[0, 4]}>
          {tags?.slice(0, 3).map(t => <Tag key={t} color="cyan">{t}</Tag>)}
          {tags?.length > 3 && <Tag>+{tags.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: '已预约',
      dataIndex: 'orderCount',
      width: 80,
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
    {
      title: '满意率',
      dataIndex: 'satisfiedRate',
      width: 80,
      sorter: (a, b) => a.satisfiedRate - b.satisfiedRate,
      render: (rate: number) => (
        <Text style={{ color: rate >= 95 ? '#52c41a' : rate >= 85 ? '#faad14' : '#ff4d4f' }}>
          {rate}%
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      filters: [
        { text: '已发布', value: 'published' },
        { text: '已暂停', value: 'paused' },
        { text: '草稿', value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ServiceStatus) => (
        <Tag color={STATUS_CONFIG[status].color}>{STATUS_CONFIG[status].label}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title={record.status === 'published' ? '暂停' : '发布'}>
            <Button
              size="small"
              icon={record.status === 'published' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleStatus(record.id, record.status)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此服务？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除" cancelText="取消"
          >
            <Tooltip title="删除">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="服务总数" value={stats.total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已发布" value={stats.published} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已暂停" value={stats.paused} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="草稿" value={stats.draft} valueStyle={{ color: '#8c8c8c' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="累计预约" value={stats.totalOrders} valueStyle={{ color: '#1890ff' }} suffix="次" />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>问诊服务列表</Title>}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadServices} loading={loading}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增服务</Button>
          </Space>
        }
        style={{ borderRadius: 10, marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingId ? '编辑问诊服务' : '新增问诊服务'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="doctorId" label="关联医生" rules={[{ required: true, message: '请选择医生' }]}>
            <Select
              placeholder="选择医生"
              options={doctorOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="mode" label="问诊模式" rules={[{ required: true }]}>
            <Select
              options={Object.entries(MODE_CONFIG).map(([value, cfg]) => ({
                value, label: <Space>{cfg.icon}{cfg.label}</Space>,
              }))}
            />
          </Form.Item>

          <Form.Item name="title" label="服务名称" rules={[{ required: true, message: '请输入服务名称' }]}>
            <Input placeholder="如：图文急诊、专家视频会诊" />
          </Form.Item>

          <Form.Item name="desc" label="服务描述">
            <TextArea rows={3} placeholder="描述服务内容、适用人群等" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="price" label="价格（元）" rules={[{ required: true }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="originalPrice" label="原价（元）">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="duration" label="时长（分钟，0=不限时）" rules={[{ required: true, message: '请输入时长' }]}>
                <InputNumber min={0} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="replyWithin" label="响应承诺">
            <Input placeholder="如：平均5分钟、预约时段准时接通" />
          </Form.Item>

          <Form.Item name="tags" label="标签（逗号分隔）" tooltip="如：复诊,慢病管理,血糖解读">
            <Input placeholder="复诊, 慢病管理" />
          </Form.Item>

          <Form.Item name="schedule" label="排班（每行一条）" tooltip="如：周一 9:00-12:00">
            <TextArea rows={3} placeholder="周一 9:00-12:00&#10;周三 14:00-17:00" />
          </Form.Item>

          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
                value, label: cfg.label,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConsultationServiceManagePage;
