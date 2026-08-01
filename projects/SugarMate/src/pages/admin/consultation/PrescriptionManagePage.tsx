/**
 * PC后台 - 处方管理
 * 
 * 功能：管理所有问诊中开具的处方，包括查看、审核、流转状态跟踪
 * 数据来源：consultationStore prescriptions（IndexedDB sim）
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Card, Table, Button, Tag, Space, Input, Select, Typography,
  Row, Col, Statistic, Drawer, Descriptions, message, Tabs, Tooltip,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, EyeOutlined, AuditOutlined,
  CheckCircleOutlined, CloseCircleOutlined, MedicineBoxOutlined,
  FileTextOutlined, SyncOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useConsultationStore } from '@/stores/consultationStore';
import { useAppAuthStore } from '@/stores/appAuthStore';
import type { Prescription } from '@contracts/consultation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// ==================== 处方状态配置 ====================

type RxStatusKey = string;

const PRESCRIPTION_STATUS_CONFIG: Record<RxStatusKey, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  SUBMITTED: { label: '已提交', color: 'blue' },
  CA_SIGNED: { label: 'CA已签', color: 'blue' },
  PENDING_AUDIT: { label: '待审核', color: 'orange' },
  REVIEWING: { label: '审核中', color: 'processing' },
  AUDIT_REJECTED: { label: '已驳回', color: 'red' },
  APPROVED: { label: '已通过', color: 'green' },
  REJECTED: { label: '已驳回', color: 'red' },
  AWAITING_PATIENT_CONFIRM: { label: '待患者确认', color: 'blue' },
  PATIENT_REJECTED: { label: '患者已驳回', color: 'red' },
  PATIENT_AGREED: { label: '患者已同意', color: 'green' },
  ORDER_CREATED: { label: '已下单', color: 'cyan' },
  FLOWING: { label: '流转中', color: 'purple' },
  OUT_OF_STOCK: { label: '缺货', color: 'volcano' },
  PHARMACY_SWITCHING: { label: '换药房中', color: 'gold' },
  DISPENSING: { label: '调配中', color: 'cyan' },
  SHIPPED: { label: '已配送', color: 'purple' },
  COMPLETED: { label: '已完成', color: 'green' },
  CANCELED: { label: '已取消', color: 'default' },
};

// ==================== 组件 ====================

const PrescriptionManagePage: React.FC = () => {
  const {
    prescriptions, loadPrescriptions, loadPrescriptionDetail, currentPrescription,
    pharmacistReviewPrescription, pharmacistRejectPrescription,
  } = useConsultationStore();
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadPrescriptions().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await loadPrescriptions();
    setLoading(false);
    message.success('数据已刷新');
  };

  const handleViewDetail = async (prescriptionId: string) => {
    await loadPrescriptionDetail(prescriptionId);
    setAuditNotes('');
    setRejectReason('');
    setDrawerOpen(true);
  };

  const handleApprove = async () => {
    if (!currentPrescription) return;
    setSubmitting(true);
    try {
      await pharmacistReviewPrescription(currentPrescription.id, medicalUser?.id || 'admin-pharmacist', auditNotes || undefined);
      message.success('审核通过！');
      await loadPrescriptionDetail(currentPrescription.id);
      await loadPrescriptions();
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!currentPrescription || !rejectReason.trim()) return;
    setSubmitting(true);
    try {
      await pharmacistRejectPrescription(currentPrescription.id, medicalUser?.id || 'admin-pharmacist', rejectReason.trim());
      message.warning('处方已驳回');
      setRejectReason('');
      await loadPrescriptionDetail(currentPrescription.id);
      await loadPrescriptions();
    } catch (e: any) {
      message.error(e?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== 统计 ====================

  const stats = useMemo(() => ({
    total: prescriptions.length,
    reviewing: prescriptions.filter(p => p.status === 'PENDING_AUDIT' || p.status === 'SUBMITTED').length,
    approved: prescriptions.filter(p => p.status === 'AWAITING_PATIENT_CONFIRM' || p.status === 'PATIENT_AGREED' || p.status === 'APPROVED').length,
    rejected: prescriptions.filter(p => p.status === 'AUDIT_REJECTED' || p.status === 'REJECTED').length,
    dispatching: prescriptions.filter(p => p.status === 'ORDER_CREATED' || p.status === 'FLOWING' || p.status === 'PHARMACY_SWITCHING' || p.status === 'DISPENSING' || p.status === 'SHIPPED').length,
    completed: prescriptions.filter(p => p.status === 'COMPLETED').length,
  }), [prescriptions]);

  // ==================== 筛选 ====================

  const filteredPrescriptions = useMemo(() => {
    let list = prescriptions;
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    if (searchText) {
      const kw = searchText.toLowerCase();
      list = list.filter(p =>
        p.id.toLowerCase().includes(kw) ||
        p.consultation_order_id.toLowerCase().includes(kw) ||
        p.patient_id.toLowerCase().includes(kw) ||
        (p.diagnosis || '').toLowerCase().includes(kw)
      );
    }
    return list;
  }, [prescriptions, statusFilter, searchText]);

  // ==================== 表格列 ====================

  const columns: ColumnsType<Prescription> = [
    {
      title: '处方编号',
      dataIndex: 'id',
      width: 160,
      render: (id: string) => <Text copyable={{ text: id }} style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</Text>,
    },
    {
      title: '关联订单',
      dataIndex: 'consultation_order_id',
      width: 140,
      render: (text: string) => <Text style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: '患者',
      dataIndex: 'patient_id',
      width: 80,
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      width: 160,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}><Text>{text || '—'}</Text></Tooltip>
      ),
    },
    {
      title: '药品',
      dataIndex: 'drug_name',
      width: 140,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}><Text>{text || '—'}</Text></Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      filters: Object.entries(PRESCRIPTION_STATUS_CONFIG).map(([value, cfg]) => ({
        text: cfg.label, value,
      })),
      onFilter: (value, record) => record.status === value,
      render: (status: RxStatusKey) => {
        const cfg = PRESCRIPTION_STATUS_CONFIG[status] || { label: status, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 160,
      sorter: (a, b) => (a.created_at || 0) - (b.created_at || 0),
      render: (t: number) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '—',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="查看详情">
            <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} />
          </Tooltip>
          {record.status === 'PENDING_AUDIT' && (
            <Tooltip title="审核处方">
              <Button size="small" type="link" icon={<AuditOutlined />} onClick={() => handleViewDetail(record.id)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="处方总数" value={stats.total} prefix={<MedicineBoxOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="待审核" value={stats.reviewing} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已通过" value={stats.approved} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已驳回" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="配送中" value={stats.dispatching} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* 表格 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>处方列表</Title>}
        extra={
          <Space>
            <Input
              placeholder="搜索处方号/订单/诊断"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 130 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(PRESCRIPTION_STATUS_CONFIG).map(([value, cfg]) => ({
                value, label: cfg.label,
              }))}
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>刷新</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredPrescriptions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      {/* 处方详情抽屉 */}
      <Drawer
        title="处方详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
      >
        {currentPrescription && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 审核操作区 */}
            {currentPrescription.status === 'PENDING_AUDIT' && (
              <Card
                size="small"
                style={{ background: '#fff7e6', borderColor: '#ffd591' }}
                title={<><AuditOutlined /> 审核操作</>}
              >
                <Input.TextArea
                  placeholder="审核通过备注（选填）"
                  value={auditNotes}
                  onChange={e => setAuditNotes(e.target.value)}
                  rows={2}
                  style={{ marginBottom: 12 }}
                />
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={submitting}
                    onClick={handleApprove}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    审核通过
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    loading={submitting}
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                  >
                    驳回
                  </Button>
                </Space>
                <Input.TextArea
                  placeholder="驳回原因（驳回时必填）"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={2}
                  style={{ marginTop: 12 }}
                />
              </Card>
            )}

            <Card size="small" title="处方信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="处方编号">
                  <Text copyable>{currentPrescription.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="关联订单">{currentPrescription.consultation_order_id || '—'}</Descriptions.Item>
                <Descriptions.Item label="患者ID">{currentPrescription.patient_id}</Descriptions.Item>
                <Descriptions.Item label="诊断">{currentPrescription.diagnosis || '—'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  {(() => {
                    const cfg = PRESCRIPTION_STATUS_CONFIG[currentPrescription.status] || { label: currentPrescription.status, color: 'default' };
                    return <Tag color={cfg.color}>{cfg.label}</Tag>;
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {currentPrescription.created_at ? dayjs(currentPrescription.created_at).format('YYYY-MM-DD HH:mm:ss') : '—'}
                </Descriptions.Item>
                {currentPrescription.reviewed_at && (
                  <Descriptions.Item label="审核时间">
                    {dayjs(currentPrescription.reviewed_at).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                )}
                {currentPrescription.review_notes && (
                  <Descriptions.Item label="审核备注">{currentPrescription.review_notes}</Descriptions.Item>
                )}
                {currentPrescription.pharmacist_id && (
                  <Descriptions.Item label="审核药师">{currentPrescription.pharmacist_id}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card size="small" title="药品明细">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="药品名称">{currentPrescription.drug_name || '—'}</Descriptions.Item>
                <Descriptions.Item label="通用名">{currentPrescription.generic_name || '—'}</Descriptions.Item>
                <Descriptions.Item label="规格">{currentPrescription.specification || '—'}</Descriptions.Item>
                <Descriptions.Item label="用法用量">{currentPrescription.dosage || '—'}</Descriptions.Item>
                <Descriptions.Item label="用药频次">{currentPrescription.frequency || '—'}</Descriptions.Item>
                <Descriptions.Item label="用药天数">{currentPrescription.duration_days || '—'} 天</Descriptions.Item>
                <Descriptions.Item label="数量">{currentPrescription.quantity || '—'}</Descriptions.Item>
                {currentPrescription.notes && (
                  <Descriptions.Item label="医嘱备注">{currentPrescription.notes}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default PrescriptionManagePage;
