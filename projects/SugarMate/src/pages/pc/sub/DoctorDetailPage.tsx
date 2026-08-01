/**
 * PC后台 - 医生详情枢纽页
 * 
 * 功能：医生完整信息枢纽——基本信息、问诊服务配置、问诊统计、处方统计
 * 数据：merchantStore(医生基本信息) + consultationServiceStore(服务配置) + consultationStore(订单/处方)
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Descriptions, Tag, Table, Space, Typography, Row, Col,
  Statistic, Spin, message, Tabs, List, Avatar, Switch,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, CheckCircleOutlined,
  CloseCircleOutlined, UserOutlined, MedicineBoxOutlined,
  FileTextOutlined, DollarOutlined, StarOutlined,
  ClockCircleOutlined, PhoneOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMerchantStore } from '@/stores/merchantStore';
import { useConsultationServiceStore, type ConsultationService, type ServiceStatus } from '@/stores/consultationServiceStore';
import { useConsultationStore } from '@/stores/consultationStore';

const { Title, Text, Paragraph } = Typography;

// ==================== 模式图标 ====================

const MODE_ICON: Record<string, React.ReactNode> = {
  text: <FileTextOutlined />,
  voice: <PhoneOutlined />,
  video: <FileTextOutlined />,
  phone: <PhoneOutlined />,
};

const STATUS_TAG: Record<ServiceStatus, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  published: { color: 'green', text: '已发布' },
  paused: { color: 'orange', text: '已暂停' },
};

// ==================== 组件 ====================

const DoctorDetailPage: React.FC = () => {
  const { id: doctorId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // 医生基本信息
  const doc = useMerchantStore(s => s.doctors.find(d => d.id === doctorId));

  // 问诊服务
  const { services: allServices, loadServices, toggleServiceStatus } = useConsultationServiceStore();
  const doctorServices = useMemo(
    () => allServices.filter(s => s.doctorId === doctorId),
    [allServices, doctorId]
  );

  // 问诊订单
  const { orders, loadOrders } = useConsultationStore();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadServices(),
        loadOrders(),
      ]);
      setLoading(false);
    };
    init();
  }, [doctorId]);

  // 此医生的订单统计
  const docOrders = useMemo(
    () => orders.filter(o => o.doctor_id === doctorId),
    [orders, doctorId]
  );

  const orderStats = useMemo(() => ({
    total: docOrders.length,
    pendingAccept: docOrders.filter(o => o.status === 'PENDING_ACCEPT').length,
    inConsult: docOrders.filter(o => o.status === 'IN_CONSULT').length,
    completed: docOrders.filter(o => o.status === 'EVALUATED').length,
    totalRevenue: docOrders.reduce((sum, o) => sum + (o.paid_amount || o.price || 0), 0),
  }), [docOrders]);

  // ==================== 服务表格列 ====================

  const serviceColumns: ColumnsType<ConsultationService> = [
    {
      title: '服务名称',
      dataIndex: 'title',
      render: (text, record) => (
        <Space>
          <Tag icon={MODE_ICON[record.mode]}>{record.mode === 'text' ? '图文' : record.mode === 'voice' ? '语音' : record.mode === 'video' ? '视频' : '电话'}</Tag>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    { title: '价格', dataIndex: 'price', render: (p: number) => <Text style={{ color: '#f5222d' }}>¥{p}</Text> },
    {
      title: '时长', dataIndex: 'duration',
      render: (d: number) => d >= 24 * 60 ? '不限时' : `${d}分钟`,
    },
    { title: '已预约', dataIndex: 'orderCount' },
    {
      title: '满意率', dataIndex: 'satisfiedRate',
      render: (r: number) => <Text style={{ color: r >= 95 ? 'green' : r >= 85 ? '#faad14' : 'red' }}>{r}%</Text>,
    },
    {
      title: '状态', dataIndex: 'status',
      render: (status: ServiceStatus) => {
        const cfg = STATUS_TAG[status];
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Switch
          checkedChildren="已发布"
          unCheckedChildren="已暂停"
          checked={record.status === 'published'}
          onChange={() => toggleServiceStatus(record.id, record.status === 'published' ? 'paused' : 'published')}
        />
      ),
    },
  ];

  // ==================== 订单表格列 ====================

  const orderColumns: ColumnsType<any> = [
    { title: '订单编号', dataIndex: 'id', width: 160, render: (id: string) => <Text style={{ fontSize: 12 }}>{id}</Text> },
    { title: '患者', dataIndex: 'patient_id', width: 80 },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (s: string) => {
        const labels: Record<string, { color: string; label: string }> = {
          PENDING_ACCEPT: { color: 'orange', label: '待接诊' },
          IN_CONSULT: { color: 'blue', label: '问诊中' },
          WAITING_PATIENT_CONFIRM: { color: 'lime', label: '待确认' },
          EVALUATED: { color: 'green', label: '已完成' },
        };
        const cfg = labels[s] || { color: 'default', label: s };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    { title: '金额', dataIndex: 'price', width: 80, render: (p: number) => `¥${p || 0}` },
    {
      title: '时间', dataIndex: 'created_at', width: 160,
      render: (t: number) => new Date(t).toLocaleString('zh-CN'),
    },
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
  }

  if (!doc) {
    return (
      <Card>
        <Title level={4}>医生不存在</Title>
        <Button onClick={() => navigate('/doctors')}>返回医生列表</Button>
      </Card>
    );
  }

  return (
    <div>
      {/* 头部 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Title level={4} style={{ margin: 0 }}>{doc.name} 详情</Title>
        </Space>
        <Button type="primary" icon={<EditOutlined />}>编辑信息</Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Card size="small"><Statistic title="问诊订单" value={orderStats.total} prefix={<FileTextOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="待接诊" value={orderStats.pendingAccept} valueStyle={{ color: '#fa8c16' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="问诊中" value={orderStats.inConsult} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="已完成" value={orderStats.completed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="总收入" value={orderStats.totalRevenue} valueStyle={{ color: '#f5222d' }} prefix="¥" precision={2} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="评价" value={doc.rating || 0} suffix="分" prefix={<StarOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      {/* Tab 内容 */}
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: 'info',
            label: '基本信息',
            children: (
              <Card>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="医生姓名">{doc.name}</Descriptions.Item>
                  <Descriptions.Item label="性别">{doc.gender || '—'}</Descriptions.Item>
                  <Descriptions.Item label="医院/机构">{doc.hospital || doc.shopName || '—'}</Descriptions.Item>
                  <Descriptions.Item label="科室">{doc.department || '—'}</Descriptions.Item>
                  <Descriptions.Item label="职称">{doc.title || '—'}</Descriptions.Item>
                  <Descriptions.Item label="擅长领域">{(doc.specializations || []).join('、') || '—'}</Descriptions.Item>
                  <Descriptions.Item label="从业年限">{doc.experienceYears ? `${doc.experienceYears}年` : '—'}</Descriptions.Item>
                  <Descriptions.Item label="执业证号">{doc.licenseNo || '—'}</Descriptions.Item>
                  <Descriptions.Item label="医生简介" span={2}>
                    {doc.bio || doc.shopDesc || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={doc.status === 'active' || doc.status === 'online' ? 'green' : 'red'}>
                      {doc.status === 'active' || doc.status === 'online' ? '正常' : doc.status || '—'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="入驻时间">{doc.createdAt || '—'}</Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: 'services',
            label: (
              <span>
                <MedicineBoxOutlined /> 问诊服务配置
                <Tag style={{ marginLeft: 8 }}>{doctorServices.length}</Tag>
              </span>
            ),
            children: (
              <Card
                title="已配置的在线问诊服务"
                extra={
                  <Button type="primary" size="small" icon={<EditOutlined />}
                    onClick={() => navigate('/consultation/services')}
                  >
                    前往服务管理
                  </Button>
                }
              >
                {doctorServices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                    <FileTextOutlined style={{ fontSize: 40 }} />
                    <p>该医生尚未配置问诊服务</p>
                    <Button type="primary" onClick={() => navigate('/consultation/services')}>
                      前往配置
                    </Button>
                  </div>
                ) : (
                  <Table
                    columns={serviceColumns}
                    dataSource={doctorServices}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'orders',
            label: (
              <span>
                <FileTextOutlined /> 问诊订单
                <Tag style={{ marginLeft: 8 }}>{docOrders.length}</Tag>
              </span>
            ),
            children: (
              <Card>
                {docOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                    <FileTextOutlined style={{ fontSize: 40 }} />
                    <p>暂无问诊订单</p>
                  </div>
                ) : (
                  <Table
                    columns={orderColumns}
                    dataSource={docOrders}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 20 }}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default DoctorDetailPage;
