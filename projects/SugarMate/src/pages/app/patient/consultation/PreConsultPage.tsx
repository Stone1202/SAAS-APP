import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Form, TextArea, ImageUploader, Card, Tag, Checkbox, Toast } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useMerchantStore } from '../../../../stores/merchantStore';
import { useConsultationServiceStore } from '../../../../stores/consultationServiceStore';
import { useConsultationStore } from '../../../../stores/consultationStore';

const PreConsultPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const skuId = searchParams.get('sku') || '';

  // 从业务后台获取医生信息
  const doctor = useMerchantStore(s => s.merchants.find(m => m.id === doctorId));
  // 从问诊服务管理获取服务列表
  const services = useConsultationServiceStore(s => s.services);
  const loadServices = useConsultationServiceStore(s => s.loadServices);
  // 下单仍用 consultationStore
  const { createOrder, init } = useConsultationStore();

  const sku = useMemo(() => services.find(s => s.id === skuId), [services, skuId]);

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [duration, setDuration] = useState('');
  const [currentMeds, setCurrentMeds] = useState('');
  const [allergies, setAllergies] = useState('');
  const [cgmData, setCgmData] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [subscribe, setSubscribe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    init();
    loadServices();
  }, []);

  const handleSubmit = async () => {
    if (!chiefComplaint.trim()) {
      Toast.show({ icon: 'fail', content: '请描述您的主要症状' });
      return;
    }
    setSubmitting(true);
    try {
      if (subscribe) {
        // 签约用户免下单 → 直达问诊
        const order = await createOrder({
          doctor_id: doctorId!,
          sku_id: skuId,
          mode: 'TEXT_IMAGE',
          urgency: 'NORMAL',
          pre_consult_form: {
            chief_complaint: chiefComplaint,
            duration: duration || '最近开始',
            current_medications: currentMeds,
            cgm_recent_readings: cgmData,
            allergies,
            images,
            is_subscriber: true,
            subscription_id: 'sub-default',
          },
          use_subscription: true,
        });
        navigate(`/app/consultation/waiting/${order.id}`, { state: { order } });
      } else {
        const order = await createOrder({
          doctor_id: doctorId!,
          sku_id: skuId,
          mode: 'TEXT_IMAGE',
          urgency: 'NORMAL',
          pre_consult_form: {
            chief_complaint: chiefComplaint,
            duration: duration || '最近开始',
            current_medications: currentMeds,
            cgm_recent_readings: cgmData,
            allergies,
            images,
            is_subscriber: false,
          },
          use_subscription: false,
        });
        Toast.show({ icon: 'success', content: '支付成功' });
        setTimeout(() => {
          navigate(`/app/consultation/waiting/${order.id}`, { state: { order } });
        }, 500);
      }
    } catch (e) {
      Toast.show({ icon: 'fail', content: '提交失败' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor || !sku) {
    return <AppPageFrame title="预问诊"><div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div></AppPageFrame>;
  }

  return (
    <AppPageFrame title="填写问诊信息">
      <div style={{ padding: '12px 16px', paddingBottom: 100 }}>
        {/* 医生 & 服务信息 */}
        <Card style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: '#e8f4fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#1677ff' }}>
              {doctor.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{doctor.name} <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>{doctor.title}</span></div>
              <div style={{ fontSize: 13, color: '#666' }}>{doctor.company}</div>
              <Tag color="primary" fill="outline" style={{ marginTop: 4, fontSize: 11 }}>{sku.title}</Tag>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ff4d4f', whiteSpace: 'nowrap' }}>
              {subscribe ? '¥0' : `¥${sku.price}`}
            </div>
          </div>
        </Card>

        {/* 预问诊表单 */}
        <Form layout="vertical" style={{ '--border-top': 'none' } as any}>
          <Form.Item label="主要症状描述 *" style={{ '--border-bottom': 'none' } as any}>
            <TextArea
              placeholder="请详细描述您的主要症状，如：血糖波动、头晕、手麻等"
              rows={4}
              value={chiefComplaint}
              onChange={setChiefComplaint}
              style={{ borderRadius: 10, background: '#fafafa' }}
            />
          </Form.Item>

          <Form.Item label="症状持续时间" style={{ '--border-bottom': 'none' } as any}>
            <TextArea
              placeholder="如：最近一周 / 3天前开始"
              rows={2}
              value={duration}
              onChange={setDuration}
              style={{ borderRadius: 10, background: '#fafafa' }}
            />
          </Form.Item>

          <Form.Item label="当前用药" style={{ '--border-bottom': 'none' } as any}>
            <TextArea
              placeholder="如：二甲双胍 0.5g tid、诺和锐 6U 餐前"
              rows={2}
              value={currentMeds}
              onChange={setCurrentMeds}
              style={{ borderRadius: 10, background: '#fafafa' }}
            />
          </Form.Item>

          <Form.Item label="近期血糖值（如有CGM）" style={{ '--border-bottom': 'none' } as any}>
            <TextArea
              placeholder="空腹/餐后/睡前血糖值"
              rows={2}
              value={cgmData}
              onChange={setCgmData}
              style={{ borderRadius: 10, background: '#fafafa' }}
            />
          </Form.Item>

          <Form.Item label="过敏史" style={{ '--border-bottom': 'none' } as any}>
            <TextArea
              placeholder="如：青霉素过敏、无"
              rows={1}
              value={allergies}
              onChange={setAllergies}
              style={{ borderRadius: 10, background: '#fafafa' }}
            />
          </Form.Item>

          <Form.Item label="上传检查报告/照片（可选）" style={{ '--border-bottom': 'none' } as any}>
            <ImageUploader
              value={images.map(url => ({ url }))}
              onChange={(files) => {
                const urls = files.map(f => (f as any).url || '');
                setImages(urls);
              }}
              maxCount={5}
              upload={() => Promise.resolve({ url: `/temp/${Date.now()}.png` })}
            />
          </Form.Item>
        </Form>

        {/* 签约权益 */}
        <Card style={{ borderRadius: 12, marginTop: 8, background: '#fffbe6' }}>
          <Checkbox checked={subscribe} onChange={setSubscribe}>
            <span style={{ fontWeight: 600, color: '#ad6800' }}>使用包月签约权益</span>
            <span style={{ fontSize: 12, color: '#ad6800', marginLeft: 4 }}>（免支付·消耗1次问诊权益）</span>
          </Checkbox>
        </Card>

        {/* 温馨提示 */}
        <Card style={{ borderRadius: 12, marginTop: 12, background: '#f6ffed' }}>
          <div style={{ fontSize: 12, color: '#52c41a', lineHeight: 1.7 }}>
            💡 温馨提示：<br />
            • 详细描述有助于医生准确诊断<br />
            • 上传检查报告可提高问诊效率<br />
            • 签约用户免支付，问诊次数从套餐中扣除<br />
            • 72小时内可与医生持续对话
          </div>
        </Card>
      </div>

      {/* 底部按钮 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0', boxShadow: '0 -2px 8px rgba(0,0,0,.06)', maxWidth: 430, margin: '0 auto' }}>
        <Button
          color="primary"
          size="large"
          block
          loading={submitting}
          onClick={handleSubmit}
          style={{ borderRadius: 24, height: 48, fontSize: 16 }}
        >
          {subscribe ? '免费问诊' : `支付 ¥${sku.price} 并提交`}
        </Button>
      </div>
    </AppPageFrame>
  );
};

export default PreConsultPage;
