/**
 * PC后台 - 问诊监控大屏（增强版）
 * 
 * 功能：实时概览所有问诊活动——服务状态、订单统计、处方流转、医生活跃度
 * 数据：consultationServiceStore + consultationStore
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Space, Typography,
  Spin, List, Progress, Tooltip, Button,
} from 'antd';
import {
  MedicineBoxOutlined, FileTextOutlined, DollarOutlined,
  UserOutlined, ClockCircleOutlined, CheckCircleOutlined,
  SyncOutlined, CloseCircleOutlined, AudioOutlined,
  VideoCameraOutlined, PhoneOutlined, MessageOutlined,
  EyeOutlined, ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useConsultationServiceStore } from '@/stores/consultationServiceStore';
import { useConsultationStore } from '@/stores/consultationStore';

const { Title, Text } = Typography;

const ConsultationMonitor: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { services, loadServices } = useConsultationServiceStore();
  const { orders, loadOrders, prescriptions, loadPrescriptions } = useConsultationStore();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadServices(), loadOrders(), loadPrescriptions()]);
      setLoading(false);
    };
    init();
  }, []);

  // ==================== 综合统计 ====================

  const stats = useMemo(() => ({
    totalServices: services.filter(s => s.status === 'published').length,
    totalOrders: orders.length,
    pendingAccept: orders.filter(o => o.status === 'PENDING_ACCEPT').length,
    inConsult: orders.filter(o => o.status === 'IN_CONSULT').length,
    todayOrders: orders.filter(o => {
      const today = new Date();
      const d = new Date(o.created_at);
      return d.toDateString() === today.toDateString();
    }).length,
    totalRx: prescriptions.length,
    rxApproved: prescriptions.filter(p => p.status === 'APPROVED').length,
    totalAmount: orders.reduce((sum, o) => sum + (o.paid_amount || o.price || 0), 0),
    avgRating: services.filter(s => s.status === 'published').reduce((sum, s, _, arr) => sum + s.satisfiedRate / (arr.length || 1), 0),
  }), [services, orders, prescriptions]);

  // ==================== 医生服务排行 ====================

  const serviceRanking = useMemo(() => {
    const map = new Map<string, { doctorName: string; count: number; orders: number; rate: number }>();
    services.filter(s => s.status === 'published').forEach(s => {
      const existing = map.get(s.doctorId) || { doctorName: s.doctorName, count: 0, orders: 0, rate: 0 };
      existing.count++;
      existing.orders += s.orderCount;
      existing.rate = Math.max(existing.rate, s.satisfiedRate);
      map.set(s.doctorId, existing);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].orders - a[1].orders)
      .slice(0, 10);
  }, [services]);

  // ==================== 最近订单 ====================

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => (b.updated_at || b.created_at) - (a.updated_at || a.created_at)).slice(0, 10),
    [orders]
  );

  // ==================== 活跃服务模式分布 ====================

  const modeDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    services.filter(s => s.status === 'published').forEach(s => {
      map[s.mode] = (map[s.mode] || 0) + 1;
    });
    return map;
  }, [services]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>
          <MedicineBoxOutlined style={{ marginRight: 8 }} />
          在线问诊监控中心
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => {
            setLoading(true);
            Promise.all([loadServices(), loadOrders(), loadPrescriptions()]).finally(() => setLoading(false));
          }}>刷新数据</Button>
          <Button icon={<EyeOutlined />} onClick={() => navigate('/consultation/orders')}>订单管理</Button>
          <Button icon={<MedicineBoxOutlined />} onClick={() => navigate('/consultation/services')}>服务管理</Button>
        </Space>
      </div>

      {/* 统计网格 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/consultation/services')}>
            <Statistic
              title="活跃服务数"
              value={stats.totalServices}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/consultation/orders')}>
            <Statistic
              title="订单总数"
              value={stats.totalOrders}
              prefix={<FileTextOutlined />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日新增订单"
              value={stats.todayOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="单"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="交易总额"
              value={stats.totalAmount}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#f5222d' }}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      {/* 第二行统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/consultation/orders')}>
            <Statistic
              title="待接诊"
              value={stats.pendingAccept}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/consultation/orders')}>
            <Statistic
              title="问诊中"
              value={stats.inConsult}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable onClick={() => navigate('/consultation/prescriptions')}>
            <Statistic
              title="处方总数"
              value={stats.totalRx}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均满意度"
              value={stats.avgRating}
              precision={1}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 主内容区域 */}
      <Row gutter={16}>
        {/* 服务排行榜 */}
        <Col span={14}>
          <Card
            title={<><DollarOutlined /> 医生服务排行榜</>}
            extra={<Button size="small" type="link" onClick={() => navigate('/consultation/services')}>全部服务</Button>}
          >
            <Table
              dataSource={serviceRanking}
              rowKey={(record) => record[0]}
              size="small"
              pagination={false}
              columns={[
                {
                  title: '排名', key: 'rank', width: 60,
                  render: (_, __, index) => {
                    const colors = ['#f5222d', '#fa8c16', '#faad14'];
                    return <Tag color={index < 3 ? colors[index] : undefined}>{index + 1}</Tag>;
                  },
                },
                { title: '医生', dataIndex: 0, render: (_, record) => record[1].doctorName },
                { title: '服务数', dataIndex: 0, render: (_, record) => record[1].count },
                {
                  title: '累计预约', dataIndex: 0,
                  sorter: (a: any, b: any) => a[1].orders - b[1].orders,
                  render: (_, record) => <Text strong style={{ color: '#1890ff' }}>{record[1].orders}</Text>,
                },
                {
                  title: '满意度', dataIndex: 0,
                  render: (_, record) => (
                    <Text style={{ color: record[1].rate >= 95 ? '#52c41a' : '#faad14' }}>
                      {record[1].rate}%
                    </Text>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 服务模式分布 + 最近订单 */}
        <Col span={10}>
          <Card title="服务模式分布" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text><FileTextOutlined /> 图文问诊</Text>
                <Text strong>{modeDistribution.text || 0}</Text>
              </Row>
              <Progress percent={((modeDistribution.text || 0) / Math.max(stats.totalServices, 1)) * 100} showInfo={false} strokeColor="#1890ff" />
              <Row justify="space-between">
                <Text><PhoneOutlined /> 语音问诊</Text>
                <Text strong>{modeDistribution.voice || 0}</Text>
              </Row>
              <Progress percent={((modeDistribution.voice || 0) / Math.max(stats.totalServices, 1)) * 100} showInfo={false} strokeColor="#52c41a" />
              <Row justify="space-between">
                <Text><VideoCameraOutlined /> 视频问诊</Text>
                <Text strong>{modeDistribution.video || 0}</Text>
              </Row>
              <Progress percent={((modeDistribution.video || 0) / Math.max(stats.totalServices, 1)) * 100} showInfo={false} strokeColor="#722ed1" />
              <Row justify="space-between">
                <Text><PhoneOutlined /> 电话问诊</Text>
                <Text strong>{modeDistribution.phone || 0}</Text>
              </Row>
              <Progress percent={((modeDistribution.phone || 0) / Math.max(stats.totalServices, 1)) * 100} showInfo={false} strokeColor="#fa8c16" />
            </Space>
          </Card>

          <Card title="最近订单" size="small" bodyStyle={{ maxHeight: 300, overflow: 'auto' }}>
            <List
              dataSource={recentOrders}
              renderItem={(order) => {
                const statusMap: Record<string, { color: string; label: string }> = {
                  PENDING_ACCEPT: { color: 'orange', label: '待接诊' },
                  IN_CONSULT: { color: 'blue', label: '问诊中' },
                  WAITING_PATIENT_CONFIRM: { color: 'lime', label: '待确认' },
                  EVALUATED: { color: 'green', label: '已完成' },
                };
                const st = statusMap[order.status] || { color: 'default', label: order.status };
                return (
                  <List.Item
                    extra={<Tag color={st.color}>{st.label}</Tag>}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/consultation/orders')}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{order.id}</Text>
                        </Space>
                      }
                      description={
                        <Space split="|" size="small">
                          <Text style={{ fontSize: 12 }}>医生: {order.doctor_id}</Text>
                          <Text style={{ fontSize: 12 }}>患者: {order.patient_id}</Text>
                          <Text style={{ fontSize: 12 }}>¥{order.price || 0}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ConsultationMonitor;
