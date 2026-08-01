/**
 * PC后台 - 问诊订单管理
 * 
 * 功能：管理所有问诊订单，包括查看、筛选、状态流转、异常处理
 * 数据来源：consultationStore（IndexedDB sim），admin视角查看全量订单
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Card, Table, Button, Tag, Space, Input, Select, DatePicker, Tooltip,
  Typography, Row, Col, Statistic, Drawer, Timeline, Descriptions, message, Tabs,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  UserOutlined, MedicineBoxOutlined, SyncOutlined, ExclamationCircleOutlined,
  FileTextOutlined, MessageOutlined, DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useConsultationStore } from '@/stores/consultationStore';
import type { ConsultationOrder } from '@contracts/consultation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ==================== 状态配置 ====================

type OrderStatusKey = string;

const STATUS_CONFIG: Record<OrderStatusKey, { label: string; color: string; icon?: React.ReactNode }> = {
  CREATED: { label: '待支付', color: 'default', icon: <ClockCircleOutlined /> },
  PAID: { label: '已支付', color: 'cyan', icon: <DollarOutlined /> },
  PENDING_ACCEPT: { label: '待接诊', color: 'orange', icon: <ClockCircleOutlined /> },
  ACCEPTED: { label: '已接诊', color: 'blue', icon: <CheckCircleOutlined /> },
  IN_CONSULT: { label: '问诊中', color: 'processing', icon: <MessageOutlined /> },
  PENDING_PRESCRIPTION: { label: '待开处方', color: 'purple', icon: <MedicineBoxOutlined /> },
  PRESCRIPTION_SUBMITTED: { label: '处方已提交', color: 'geekblue', icon: <MedicineBoxOutlined /> },
  WAITING_PATIENT_CONFIRM: { label: '待患者确认', color: 'lime', icon: <ClockCircleOutlined /> },
  PATIENT_CONFIRMED: { label: '患者已确认', color: 'green', icon: <CheckCircleOutlined /> },
  RECOMMENDATION_SHOWN: { label: '已推荐', color: 'blue', icon: <CheckCircleOutlined /> },
  EVALUATED: { label: '已评价', color: 'green', icon: <CheckCircleOutlined /> },
  REFUNDED: { label: '已退款', color: 'red', icon: <CloseCircleOutlined /> },
  CANCELED: { label: '已取消', color: 'default', icon: <CloseCircleOutlined /> },
};

// ==================== 组件 ====================

const ConsultationOrderManagePage: React.FC = () => {
  const { orders, doctors, loadOrders, loadOrderDetail, currentOrder, init, searchDoctors } = useConsultationStore();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 加载全量订单（无患者/医生过滤 = admin视图）
  useEffect(() => {
    setLoading(true);
    Promise.all([loadOrders(), init()]).finally(() => setLoading(false));
  }, []);

  // 医生 ID→名称 映射
  const doctorNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    doctors.forEach(d => { map[d.id] = d.name; });
    return map;
  }, [doctors]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await loadOrders();
    setLoading(false);
    message.success('数据已刷新');
  }, [loadOrders]);

  const handleViewDetail = useCallback(async (orderId: string) => {
    await loadOrderDetail(orderId);
    setDrawerOpen(true);
  }, [loadOrderDetail]);

  // ==================== 统计 ====================

  const stats = useMemo(() => ({
    total: orders.length,
    pendingAccept: orders.filter(o => o.status === 'PENDING_ACCEPT').length,
    inConsult: orders.filter(o => o.status === 'IN_CONSULT').length,
    waitingConfirm: orders.filter(o => o.status === 'WAITING_PATIENT_CONFIRM').length,
    completed: orders.filter(o => o.status === 'EVALUATED').length,
    today: orders.filter(o => dayjs(o.created_at).isSame(dayjs(), 'day')).length,
  }), [orders]);

  // ==================== 筛选 ====================

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter) {
      list = list.filter(o => o.status === statusFilter);
    }
    if (searchText) {
      const kw = searchText.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(kw) ||
        o.patient_id.toLowerCase().includes(kw) ||
        o.doctor_id.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [orders, statusFilter, searchText]);

  // ==================== 表格列 ====================

  const columns: ColumnsType<ConsultationOrder> = [
    {
      title: '订单编号',
      dataIndex: 'id',
      width: 170,
      render: (id: string) => <Text copyable={{ text: id }} style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</Text>,
    },
    {
      title: '患者',
      dataIndex: 'patient_id',
      width: 100,
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: '医生',
      dataIndex: 'doctor_id',
      width: 100,
      render: (id: string) => <Tag>{doctorNameMap[id] || id}</Tag>,
    },
    {
      title: '服务',
      dataIndex: 'mode',
      width: 80,
      render: (mode: string) => {
        const labels: Record<string, string> = { text: '图文', voice: '语音', video: '视频', phone: '电话' };
        return labels[mode] || mode;
      },
    },
    {
      title: '金额',
      dataIndex: 'price',
      width: 80,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price: number) => <Text style={{ color: '#f5222d' }}>¥{price || 0}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      filters: Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
        text: cfg.label, value,
      })),
      onFilter: (value, record) => record.status === value,
      render: (status: OrderStatusKey) => {
        const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 170,
      sorter: (a, b) => a.created_at - b.created_at,
      render: (t: number) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="查看详情">
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="今日新增" value={stats.today} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="待接诊" value={stats.pendingAccept} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="问诊中" value={stats.inConsult} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="待确认" value={stats.waitingConfirm} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="总计" value={stats.total} />
          </Card>
        </Col>
      </Row>

      {/* 数据表格 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>问诊订单列表</Title>}
        extra={
          <Space>
            <Input
              placeholder="搜索订单号/患者/医生"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 130 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
                value, label: cfg.label,
              }))}
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>刷新</Button>
          </Space>
        }
        style={{ borderRadius: 10, marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      {/* 订单详情抽屉 */}
      <Drawer
        title="订单详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
      >
        {currentOrder && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card size="small" title="基本信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="订单编号">
                  <Text copyable>{currentOrder.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="服务订单号">{currentOrder.service_order_id}</Descriptions.Item>
                <Descriptions.Item label="患者ID">{currentOrder.patient_id}</Descriptions.Item>
                <Descriptions.Item label="医生">{doctorNameMap[currentOrder.doctor_id] || currentOrder.doctor_id}</Descriptions.Item>
                <Descriptions.Item label="问诊模式">{currentOrder.mode}</Descriptions.Item>
                <Descriptions.Item label="金额">¥{currentOrder.price || 0}</Descriptions.Item>
                <Descriptions.Item label="实付">¥{currentOrder.paid_amount || 0}</Descriptions.Item>
                <Descriptions.Item label="紧急程度">{currentOrder.urgency || 'NORMAL'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  {(() => {
                    const cfg = STATUS_CONFIG[currentOrder.status] || { label: currentOrder.status, color: 'default' };
                    return <Tag color={cfg.color}>{cfg.label}</Tag>;
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {dayjs(currentOrder.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {dayjs(currentOrder.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card size="small" title="状态流转时间线">
              <Timeline
                items={currentOrder.timeline?.map((t: any) => ({
                  color: t.operator === 'SYSTEM' ? 'blue' : t.operator === 'DOCTOR' ? 'green' : 'orange',
                  children: (
                    <div>
                      <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {dayjs(t.time).format('MM-DD HH:mm:ss')}
                      </Text>
                      <br />
                      <Text>
                        {t.from} → {t.to}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        [{t.operator}] {t.remark || ''}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default ConsultationOrderManagePage;
