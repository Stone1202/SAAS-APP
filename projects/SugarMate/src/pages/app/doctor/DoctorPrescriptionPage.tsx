import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, TextArea, Input, Stepper, Picker, Card, Toast, Tag } from 'antd-mobile';
import AppPageFrame from '../../../components/AppPageFrame';
import { useConsultationStore } from '../../../stores/consultationStore';
import type { ConsultationOrder } from '@contracts/consultation';

const DoctorPrescriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const orderId = searchParams.get('orderId') || '';

  const { loadOrderDetail, currentOrder, createPrescription, init } = useConsultationStore();
  const [order, setOrder] = useState<ConsultationOrder | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [drugName, setDrugName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [specification, setSpecification] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState('每日1次');
  const [durationDays, setDurationDays] = useState(14);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    init().then(async () => {
      if (orderId) await loadOrderDetail(orderId);
    });
  }, [orderId]);

  useEffect(() => { setOrder(currentOrder); }, [currentOrder]);

  // 快捷处方模板
  const quickTemplates = [
    { drug: '盐酸二甲双胍片', generic: 'metformin_hcl', spec: '0.5g×20片', dosage: '0.5g', freq: '每日3次·随餐' },
    { drug: '格列美脲片', generic: 'glimepiride', spec: '2mg×15片', dosage: '2mg', freq: '每日1次·早餐前' },
    { drug: '阿托伐他汀钙片', generic: 'atorvastatin', spec: '20mg×7片', dosage: '20mg', freq: '每日1次·睡前' },
    { drug: '甘精胰岛素注射液', generic: 'insulin_glargine', spec: '3ml:300单位', dosage: '10U', freq: '每日1次·睡前' },
    { drug: '头孢氨苄胶囊', generic: 'cefalexin', spec: '0.25g×12粒', dosage: '0.5g', freq: '每日2次' },
  ];

  const handleQuickFill = (tmpl: typeof quickTemplates[0]) => {
    setDrugName(tmpl.drug);
    setGenericName(tmpl.generic);
    setSpecification(tmpl.spec);
    setDosage(tmpl.dosage);
    setFrequency(tmpl.freq);
  };

  const handleSubmit = async () => {
    if (!diagnosis || !drugName || !dosage) {
      Toast.show({ icon: 'fail', content: '请完整填写诊断和用药信息' });
      return;
    }
    setSubmitting(true);
    try {
      await createPrescription({
        consultation_order_id: orderId,
        diagnosis,
        generic_name: genericName || drugName.toLowerCase(),
        drug_name: drugName,
        specification,
        dosage,
        quantity,
        frequency,
        duration_days: durationDays,
        notes,
        is_first_visit: false,
      });
      Toast.show({ icon: 'success', content: '处方已开具·已送审核' });
      navigate(-1);
    } catch {
      Toast.show({ icon: 'fail', content: '开具失败' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPageFrame title="开具处方">
      <div style={{ padding: 16, paddingBottom: 100 }}>
        {/* 患者信息 */}
        <Card style={{ borderRadius: 12, marginBottom: 12, background: '#f6ffed' }}>
          <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 4 }}>当前问诊</div>
          <div style={{ fontSize: 13 }}>
            患者：{order?.patient_id} | 状态：
            <Tag color="processing">{order ? useConsultationStore.getState().getStateLabel(order.status) : '—'}</Tag>
          </div>
        </Card>

        {/* 诊断 */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>📋 诊断结果 *</div>
          <TextArea
            placeholder="如：2型糖尿病·血糖控制欠佳"
            rows={2}
            value={diagnosis}
            onChange={setDiagnosis}
            style={{ borderRadius: 10, background: '#fafafa' }}
          />
        </Card>

        {/* 处方详情 */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>💊 处方详情</div>
          <Form layout="vertical" style={{ '--border-top': 'none' } as any}>
            <Form.Item label="药品名称 *" style={{ '--border-bottom': 'none' } as any}>
              <Input placeholder="如：盐酸二甲双胍片" value={drugName} onChange={setDrugName}
                style={{ borderRadius: 10, background: '#fafafa' }} />
            </Form.Item>
            <Form.Item label="通用名" style={{ '--border-bottom': 'none' } as any}>
              <Input placeholder="如：metformin_hcl" value={genericName} onChange={setGenericName}
                style={{ borderRadius: 10, background: '#fafafa' }} />
            </Form.Item>
            <Form.Item label="规格" style={{ '--border-bottom': 'none' } as any}>
              <Input placeholder="如：0.5g×20片" value={specification} onChange={setSpecification}
                style={{ borderRadius: 10, background: '#fafafa' }} />
            </Form.Item>
            <Form.Item label="用法用量 *" style={{ '--border-bottom': 'none' } as any}>
              <Input placeholder="如：0.5g" value={dosage} onChange={setDosage}
                style={{ borderRadius: 10, background: '#fafafa' }} />
            </Form.Item>
            <Form.Item label="频率 *" style={{ '--border-bottom': 'none' } as any}>
              <Input placeholder="如：每日3次·随餐" value={frequency} onChange={setFrequency}
                style={{ borderRadius: 10, background: '#fafafa' }} />
            </Form.Item>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, marginBottom: 4 }}>数量(盒)</div>
                <Stepper value={quantity} onChange={v => setQuantity(v || 1)} min={1} max={10} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, marginBottom: 4 }}>天数</div>
                <Stepper value={durationDays} onChange={v => setDurationDays(v || 7)} min={1} max={90} />
              </div>
            </div>
            <Form.Item label="医嘱备注" style={{ '--border-bottom': 'none', marginTop: 12 } as any}>
              <TextArea placeholder="如：定期监测肾功能..." rows={2} value={notes} onChange={setNotes}
                style={{ borderRadius: 10, background: '#fafafa' }} />
            </Form.Item>
          </Form>
        </Card>

        {/* 快捷模板 */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>⚡ 快捷处方模板</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {quickTemplates.map((tmpl, i) => (
              <Tag key={i} color="primary" fill="outline" style={{ cursor: 'pointer', padding: '4px 10px' }}
                onClick={() => handleQuickFill(tmpl)}>
                {tmpl.drug}
              </Tag>
            ))}
          </div>
        </Card>
      </div>

      {/* 操作栏 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0', boxShadow: '0 -2px 8px rgba(0,0,0,.06)', display: 'flex', gap: 12, maxWidth: 430, margin: '0 auto' }}>
        <Button color="default" fill="outline" style={{ flex: 0.4, borderRadius: 24 }} onClick={() => navigate(-1)}>取消</Button>
        <Button color="primary" style={{ flex: 0.6, borderRadius: 24 }} loading={submitting} onClick={handleSubmit}>开具处方</Button>
      </div>
    </AppPageFrame>
  );
};

export default DoctorPrescriptionPage;
