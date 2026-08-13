import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tag, Result, Toast, Dialog } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';
import type { Prescription } from '@contracts/consultation';

const PrescriptionDetailPage: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const {
    loadPrescriptionDetail, currentPrescription,
    patientConfirmPrescription, patientRejectPrescription, init,
    loadPharmacyPrices, pharmacyPrices,
  } = useConsultationStore();
  const [pres, setPres] = useState<Prescription | null>(null);

  useEffect(() => {
    init().then(async () => {
      if (prescriptionId) {
        await loadPrescriptionDetail(prescriptionId);
      }
    });
  }, [prescriptionId]);

  useEffect(() => {
    setPres(currentPrescription);
    if (currentPrescription?.generic_name) {
      loadPharmacyPrices(currentPrescription.generic_name);
    }
  }, [currentPrescription]);

  if (!pres) {
    return <AppPageFrame title="处方详情"><div style={{ textAlign: 'center', padding: 40 }}>加载中...</div></AppPageFrame>;
  }

  const isAwaitingPatient = pres.status === 'AWAITING_PATIENT_CONFIRM';
  const isAgreed = pres.status === 'PATIENT_AGREED';
  const isFlowing = ['FLOWING', 'DISPENSED'].includes(pres.status);

  // 流程步骤：1-医生开方  2-患者确认  3-药房流转
  const getStepStatus = (step: number) => {
    if (isFlowing && step <= 3) return 'done';
    if (isAgreed && step <= 2) return 'done';
    if (!isAwaitingPatient && !isAgreed && !isFlowing && step === 1) return 'done';
    if (isAwaitingPatient) {
      if (step === 1) return 'done';
      if (step === 2) return 'active';
      return 'pending';
    }
    if (isAgreed) {
      if (step <= 2) return 'done';
      if (step === 3) return 'active';
    }
    return 'pending';
  };

  const handleConfirm = async () => {
    const result = await Dialog.confirm({
      title: '确认处方',
      content: `确认使用${pres.drug_name} ${pres.dosage} ${pres.frequency}？\n请确认已阅读用药说明。`,
    });
    if (result) {
      await patientConfirmPrescription(pres.id);
      Toast.show({ icon: 'success', content: '处方已确认·正在流转药房' });
      await loadPrescriptionDetail(pres.id);
      // 场景2A闭环：患者确认处方并下单 → 跳转药师审方/配药进度页
      navigate(`/app/mine/prescription/${pres.id}/review`);
    }
  };

  const handleReject = async () => {
    const result = await Dialog.confirm({
      title: '拒绝处方',
      content: '请告知医生拒绝原因，医生将为您修改处方。',
    });
    if (result) {
      const input = prompt('请简要说明拒绝原因：') || '需要调整用药方案';
      await patientRejectPrescription(pres.id, input);
      Toast.show({ content: '已通知医生修改处方' });
      navigate(-1);
    }
  };

  return (
    <AppPageFrame title="电子处方">
      <div style={{ padding: 16, paddingBottom: 100 }}>
        {/* 流程步骤指示器 */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#333' }}>📌 处方流转进度</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {[
              { step: 1, label: '医生开具处方', icon: '👨‍⚕️' },
              { step: 2, label: '患者确认处方', icon: '✅' },
              { step: 3, label: '流转药房履约', icon: '🏪' },
            ].map((s, i, arr) => {
              const status = getStepStatus(s.step);
              const isDone = status === 'done';
              const isActive = status === 'active';
              return (
                <React.Fragment key={s.step}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    flex: 1, textAlign: 'center',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                      background: isDone ? '#f6ffed' : isActive ? '#e6f7ff' : '#f5f5f5',
                      border: `2px solid ${isDone ? '#52c41a' : isActive ? '#1677ff' : '#d9d9d9'}`,
                    }}>
                      {isDone ? '✓' : s.icon}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: isActive ? 600 : 400,
                      color: isDone ? '#52c41a' : isActive ? '#1677ff' : '#999',
                    }}>
                      {s.label}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{
                      flex: '0 0 30px', height: 2,
                      background: isDone ? '#52c41a' : '#d9d9d9',
                      marginBottom: 16,
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </Card>

        {/* 处方状态 */}
        <Card style={{ borderRadius: 12, marginBottom: 12, textAlign: 'center', background: isAwaitingPatient ? '#fffbe6' : isAgreed ? '#e6ffe6' : '#f6ffed' }}>
          <Tag color={isAwaitingPatient ? 'warning' : 'success'} style={{ fontSize: 13, padding: '4px 12px' }}>
            {{
              'DRAFT': '草稿', 'SUBMITTED': '已提交', 'CA_SIGNED': 'CA已签名',
              'PENDING_AUDIT': '待审核', 'AWAITING_PATIENT_CONFIRM': '待您确认处方', 'PATIENT_AGREED': '已确认处方',
              'FLOWING': '流转中', 'DISPENSED': '已配药', 'EXPIRED': '已过期', 'REVOKED': '已撤回',
            }[pres.status] || pres.status}
          </Tag>
          {isAwaitingPatient && (
            <div style={{ fontSize: 12, color: '#ad6800', marginTop: 6 }}>
              ⚠️ 医生已完成开方，请您在72小时内确认，超时将自动过期
            </div>
          )}
          {isAgreed && (
            <div style={{ fontSize: 12, color: '#52c41a', marginTop: 6 }}>
              ✅ 您已确认处方，正在流转至药房配药中
            </div>
          )}
        </Card>

        {/* 诊断 */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>📋 诊断结果</div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{pres.diagnosis}</div>
        </Card>

        {/* 处方内容 */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>💊 处方详情</div>
          <div style={{ fontSize: 14, lineHeight: 2.2 }}>
            <div><span style={{ color: '#999' }}>药品：</span>{pres.drug_name}</div>
            <div><span style={{ color: '#999' }}>通用名：</span>{pres.generic_name}</div>
            <div><span style={{ color: '#999' }}>规格：</span>{pres.specification}</div>
            <div><span style={{ color: '#999' }}>用法用量：</span>{pres.dosage} · {pres.frequency}</div>
            <div><span style={{ color: '#999' }}>数量：</span>{pres.quantity}盒 · {pres.duration_days}天</div>
            {pres.notes && <div><span style={{ color: '#999' }}>医嘱：</span>{pres.notes}</div>}
          </div>
          {pres.ca_certificate_id && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#52c41a' }}>
              ✅ CA电子签名已认证 · {new Date(pres.ca_signed_at!).toLocaleString()}
            </div>
          )}
        </Card>

        {/* 药房比价 */}
        {pharmacyPrices.length > 0 && (
          <Card style={{ borderRadius: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>🏪 附近药房</div>
            {pharmacyPrices.map(p => (
              <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{p.pharmacy_name}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{p.distance_km}km · {p.estimated_arrival}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#ff4d4f' }}>¥{p.price / 100}</div>
                  <div style={{ fontSize: 10, color: p.stock_available ? '#52c41a' : '#ff4d4f' }}>
                    {p.stock_available ? '有货' : '缺货'}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* 操作按钮（待患者确认状态） */}
        {isAwaitingPatient && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0', boxShadow: '0 -2px 8px rgba(0,0,0,.06)', display: 'flex', gap: 12, maxWidth: 430, margin: '0 auto' }}>
            <Button color="danger" fill="outline" style={{ flex: 1, borderRadius: 24 }} onClick={handleReject}>
              拒绝
            </Button>
            <Button color="primary" style={{ flex: 2, borderRadius: 24 }} onClick={handleConfirm}>
              确认并流转药房
            </Button>
          </div>
        )}
      </div>
    </AppPageFrame>
  );
};

export default PrescriptionDetailPage;
