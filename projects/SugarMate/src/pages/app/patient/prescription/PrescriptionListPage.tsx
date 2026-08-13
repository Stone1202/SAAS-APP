import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, Empty } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';
import { useAppAuthStore } from '../../../../stores/appAuthStore';
import { PRESCRIPTION_STATE_LABEL } from '@contracts/consultation';
import type { Prescription } from '@contracts/consultation';

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  SUBMITTED: 'primary',
  CA_SIGNED: 'primary',
  PENDING_AUDIT: 'warning',
  AWAITING_PATIENT_CONFIRM: 'warning',
  PATIENT_AGREED: 'success',
  PATIENT_REJECTED: 'danger',
  ORDER_CREATED: 'success',
  FLOWING: 'primary',
  OUT_OF_STOCK: 'warning',
  PHARMACY_SWITCHING: 'warning',
  DISPENSED: 'success',
  EXPIRED: 'default',
  REVOKED: 'default',
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDrugName = (p: Prescription) => {
  if (p.drug_name) return p.drug_name;
  if (p.items && p.items.length > 0) return p.items[0].drug_name;
  return '处方';
};

const getSpecification = (p: Prescription) => {
  if (p.specification) return p.specification;
  if (p.items && p.items.length > 0) return p.items[0].specification;
  return '';
};

const getUsage = (p: Prescription) => {
  if (p.dosage && p.frequency) return `${p.dosage} · ${p.frequency}`;
  if (p.items && p.items.length > 0) {
    const item = p.items[0];
    if (item.dosage && item.frequency) return `${item.dosage} · ${item.frequency}`;
  }
  return '';
};

const Page: React.FC = () => {
  const navigate = useNavigate();
  const { patientUser } = useAppAuthStore();
  const { prescriptions, loadPrescriptions, init } = useConsultationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    init()
      .then(() => loadPrescriptions(patientUser?.id))
      .finally(() => setLoading(false));
  }, [patientUser?.id]);

  const renderEmpty = () => (
    <Empty
      style={{ padding: '40px 16px' }}
      image={Empty.NO_DATA}
      description="暂无处方记录"
    />
  );

  return (
    <AppPageFrame title="处方列表">
      <div style={{ padding: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div>
        ) : prescriptions.length === 0 ? (
          renderEmpty()
        ) : (
          <List>
            {prescriptions.map(p => (
              <List.Item
                key={p.id}
                onClick={() => navigate(`/app/mine/prescription/${p.id}`)}
                arrow
              >
                <Card style={{ borderRadius: 10, width: '100%' }} bodyStyle={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#333', flex: 1, paddingRight: 8 }}>
                      {getDrugName(p)}
                    </div>
                    <Tag color={STATUS_COLOR[p.status] || 'default'}>
                      {PRESCRIPTION_STATE_LABEL[p.status] || p.status}
                    </Tag>
                  </div>
                  {getSpecification(p) && (
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                      {getSpecification(p)}
                    </div>
                  )}
                  {getUsage(p) && (
                    <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
                      用法：{getUsage(p)}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#999' }}>
                    诊断：{p.diagnosis || '—'} · {formatTime(p.created_at)}
                  </div>
                </Card>
              </List.Item>
            ))}
          </List>
        )}
      </div>
    </AppPageFrame>
  );
};

export default Page;
