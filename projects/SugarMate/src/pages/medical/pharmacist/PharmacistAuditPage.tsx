/**
 * 药师审核处方页 — 审核/驳回处方
 * 药师终端：通过 /medical/login 登录后，从工作台进入
 * 也可从 Dashboard 后台 → 药店管理 → 处方审核 直接跳转
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Input, Modal, message, Timeline, Space, Alert, Divider,
  Typography, Table, Result, Spin,
} from 'antd';
import {
  CheckOutlined, CloseOutlined, ArrowLeftOutlined, FileTextOutlined,
  UserOutlined, MedicineBoxOutlined, SafetyOutlined, ClockCircleOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useConsultationStore } from '@/stores/consultationStore';
import { useAppAuthStore } from '@/stores/appAuthStore';
import type { Prescription } from '@contracts/consultation';

const { TextArea } = Input;
const { Text, Title } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  PENDING_AUDIT: { color: 'orange', label: '待审核' },
  AUDIT_REJECTED: { color: 'red', label: '已驳回' },
  AWAITING_PATIENT_CONFIRM: { color: 'blue', label: '待患者确认' },
  PATIENT_AGREED: { color: 'green', label: '患者已同意' },
  ORDER_CREATED: { color: 'cyan', label: '已下单' },
  FLOWING: { color: 'purple', label: '流转中' },
  OUT_OF_STOCK: { color: 'volcano', label: '缺货' },
};

const PharmacistAuditPage: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const medicalUser = useAppAuthStore(s => s.medicalUser);

  const {
    currentPrescription,
    loading,
    loadPrescriptionDetail,
    pharmacistReviewPrescription,
    pharmacistRejectPrescription,
  } = useConsultationStore();

  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prescriptionId) loadPrescriptionDetail(prescriptionId);
  }, [prescriptionId]);

  const handleApprove = useCallback(async () => {
    if (!prescriptionId || !medicalUser?.id) return;
    setSubmitting(true);
    try {
      await pharmacistReviewPrescription(prescriptionId, medicalUser.id, auditNotes || undefined);
      message.success('处方审核通过！已推送患者确认');
      await loadPrescriptionDetail(prescriptionId);
    } catch (e: any) {
      message.error(e?.message || '审核失败');
    } finally {
      setSubmitting(false);
    }
  }, [prescriptionId, medicalUser, auditNotes, pharmacistReviewPrescription, loadPrescriptionDetail]);

  const handleReject = useCallback(async () => {
    if (!prescriptionId || !medicalUser?.id || !rejectReason.trim()) return;
    setSubmitting(true);
    try {
      await pharmacistRejectPrescription(prescriptionId, medicalUser.id, rejectReason.trim());
      message.warning('处方已驳回');
      setRejectModalOpen(false);
      setRejectReason('');
      await loadPrescriptionDetail(prescriptionId);
    } catch (e: any) {
      message.error(e?.message || '驳回失败');
    } finally {
      setSubmitting(false);
    }
  }, [prescriptionId, medicalUser, rejectReason, pharmacistRejectPrescription, loadPrescriptionDetail]);

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>;

  const pres = currentPrescription;
  if (!pres) return <Empty description="处方不存在" />;

  const status = statusMap[pres.status as string] || { color: 'default', label: pres.status as string };
  const canAudit = pres.status === 'PENDING_AUDIT';

  // 处方审核完成后的结果页
  if (pres.status === 'AWAITING_PATIENT_CONFIRM') {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="success"
          title="审核通过"
          subTitle={`处方已审核通过，患者确认截止：${pres.patient_confirm_deadline ? new Date(pres.patient_confirm_deadline).toLocaleString('zh-CN') : '--'}`}
          extra={[
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/medical/pharmacist/workbench')}>返回工作台</Button>,
          ]}
        />
        <PrescriptionInfoCard pres={pres} />
      </div>
    );
  }

  if (pres.status === 'AUDIT_REJECTED') {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="error"
          title="已驳回"
          subTitle={`驳回原因：${pres.review_notes || '未记录'}`}
          extra={[
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/medical/pharmacist/workbench')}>返回工作台</Button>,
          ]}
        />
        <PrescriptionInfoCard pres={pres} />
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/medical/pharmacist/workbench')} />
        <Title level={5} style={{ margin: 0 }}>处方审核</Title>
        <Tag color={status.color}>{status.label}</Tag>
      </div>

      {/* 审核操作区 */}
      {canAudit && (
        <Card size="small" style={{ marginBottom: 12, background: '#fff7e6', borderColor: '#ffd591' }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            <AuditOutlined /> 审核操作
          </Text>
          <TextArea
            placeholder="审核备注（选填）..."
            value={auditNotes}
            onChange={e => setAuditNotes(e.target.value)}
            rows={2}
            style={{ marginBottom: 12 }}
          />
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={submitting}
              onClick={handleApprove}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              审核通过
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              loading={submitting}
              onClick={() => setRejectModalOpen(true)}
            >
              驳回处方
            </Button>
          </Space>
        </Card>
      )}

      {!canAudit && (
        <Alert
          message={`处方当前状态为「${status.label}」，无需审核`}
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          action={
            <Button size="small" onClick={() => navigate('/medical/pharmacist/workbench')}>返回工作台</Button>
          }
        />
      )}

      {/* 处方详情 */}
      <PrescriptionInfoCard pres={pres} />

      {/* 处方明细表格 */}
      {pres.items && pres.items.length > 0 && (
        <Card size="small" title="药品明细" style={{ marginBottom: 12 }}>
          <Table
            size="small"
            pagination={false}
            dataSource={pres.items.map((item, idx) => ({ ...item, key: idx })) as any}
            columns={[
              { title: '药品名称', dataIndex: 'drug_name', key: 'drug_name', width: 140 },
              { title: '规格', dataIndex: 'specification', key: 'specification', width: 80 },
              { title: '用法用量', key: 'dosage', width: 120, render: (_: any, r: any) => `${r.dosage} ${r.frequency}` },
              { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 60 },
              { title: '类型', key: 'type', width: 70, render: (_: any, r: any) => (
                <Tag color={r.product_type === 'RX' ? 'red' : 'green'}>{r.product_type === 'RX' ? '处方药' : 'OTC'}</Tag>
              )},
              { title: '备注', dataIndex: 'notes', key: 'notes' },
            ]}
          />
        </Card>
      )}

      {/* 审核时间线 */}
      {pres.timeline && pres.timeline.length > 0 && (
        <Card size="small" title={<><ClockCircleOutlined /> 流转记录</>} style={{ marginBottom: 12 }}>
          <Timeline
            items={pres.timeline.map((t: any) => ({
              color: t.to === 'PENDING_AUDIT' ? 'orange' :
                     t.to === 'AWAITING_PATIENT_CONFIRM' ? 'green' :
                     t.to === 'AUDIT_REJECTED' ? 'red' : 'blue',
              children: (
                <div>
                  <div style={{ fontSize: 12 }}>
                    <Tag style={{ fontSize: 11 }}>{t.from} → {t.to}</Tag>
                    <span style={{ color: '#8c8c8c', marginLeft: 4 }}>
                      {new Date(t.time).toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#595959' }}>
                    {t.operator && <Tag color="blue" style={{ fontSize: 10 }}>{t.operator}</Tag>}
                    {t.remark}
                  </div>
                </div>
              ),
            }))}
          />
        </Card>
      )}

      {/* 驳回弹窗 */}
      <Modal
        title="驳回处方"
        open={rejectModalOpen}
        onCancel={() => { setRejectModalOpen(false); setRejectReason(''); }}
        onOk={handleReject}
        okText="确认驳回"
        okButtonProps={{ danger: true, loading: submitting, disabled: !rejectReason.trim() }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text type="danger">驳回后处方将退回给医生修改，请填写驳回原因：</Text>
        </div>
        <TextArea
          placeholder="例如：剂量不符合规范、药品与诊断不符、缺少必要检查结果..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
};

/** 处方信息卡（共用） */
const PrescriptionInfoCard: React.FC<{ pres: Prescription }> = ({ pres }) => {
  const status = statusMap[pres.status as string] || { color: 'default', label: pres.status as string };

  return (
    <Card size="small" style={{ marginBottom: 12 }}>
      <Descriptions size="small" column={1} labelStyle={{ width: 70, color: '#8c8c8c', fontSize: 12 }}>
        <Descriptions.Item label={<><FileTextOutlined /> 处方ID</>}>{pres.id}</Descriptions.Item>
        <Descriptions.Item label={<><UserOutlined /> 患者</>}>{pres.patient_id}</Descriptions.Item>
        <Descriptions.Item label={<><SafetyOutlined /> 状态</>}>
          <Tag color={status.color}>{status.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="诊断">{pres.diagnosis || '--'}</Descriptions.Item>
        <Descriptions.Item label={<><MedicineBoxOutlined /> 药品</>}>
          {pres.drug_name || '--'}
          {pres.specification && <span style={{ marginLeft: 8, color: '#8c8c8c' }}>{pres.specification}</span>}
        </Descriptions.Item>
        <Descriptions.Item label="用法用量">
          {pres.dosage && pres.frequency ? `${pres.dosage} ${pres.frequency}·${pres.duration_days || '--'}天` : '--'}
        </Descriptions.Item>
        <Descriptions.Item label="数量">{pres.quantity || '--'}</Descriptions.Item>
        <Descriptions.Item label="CA证书">{pres.ca_certificate_id || '--'}</Descriptions.Item>
        {pres.reviewed_at && (
          <Descriptions.Item label="审核时间">{new Date(pres.reviewed_at).toLocaleString('zh-CN')}</Descriptions.Item>
        )}
        {pres.review_notes && (
          <Descriptions.Item label="审核备注">{pres.review_notes}</Descriptions.Item>
        )}
        {pres.notes && <Descriptions.Item label="医生备注">{pres.notes}</Descriptions.Item>}
      </Descriptions>
    </Card>
  );
};

export default PharmacistAuditPage;
