import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tag, Space, Toast } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useMerchantStore } from '../../../../stores/merchantStore';
import { useConsultationServiceStore } from '../../../../stores/consultationServiceStore';

// 问诊模式中文映射
const MODE_LABELS: Record<string, string> = {
  text: '图文问诊',
  video: '视频问诊',
  voice: '语音通话问诊',
  phone: '电话问诊',
};

const MODE_COLORS: Record<string, string> = {
  text: '#1677ff',
  video: '#52c41a',
  voice: '#722ed1',
  phone: '#ff7a45',
};

const DoctorProfilePage: React.FC = () => {
  const params = useParams<{ id?: string; doctorId?: string }>();
  // 兼容两套路由：/app/service/doctor/:id 与 /app/consultation/doctor/:doctorId
  const doctorId = params.id || params.doctorId || '';
  const navigate = useNavigate();
  const merchant = useMerchantStore(s => s.merchants.find(m => m.id === doctorId));
  const { services, loadServices } = useConsultationServiceStore();

  useEffect(() => {
    loadServices();
  }, []);

  const doctorServices = useMemo(
    () => services.filter(s => s.doctorId === doctorId && s.status === 'published'),
    [services, doctorId]
  );

  if (!merchant) {
    return (
      <AppPageFrame title="医生详情">
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>医生不存在或已下线</div>
      </AppPageFrame>
    );
  }

  const handleCreateOrder = (serviceId: string) => {
    // 跳转到预问诊页面
    navigate(`/app/consultation/pre-consult/${doctorId}?sku=${serviceId}`);
  };

  return (
    <AppPageFrame title="医生详情">
      {/* 医生信息区 */}
      <div style={{ padding: 16, background: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, overflow: 'hidden', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', flexShrink: 0 }}>
            {merchant.name[0]}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 20 }}>{merchant.name}</span>
              <span style={{ fontSize: 13, background: '#1677ff', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>
                {merchant.title}
              </span>
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{merchant.company}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
              {merchant.department}
              {merchant.licenseNo && <span> · 执业证号: {merchant.licenseNo}</span>}
            </div>
            {merchant.applyNo && (
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                入驻编号: {merchant.applyNo}
              </div>
            )}
          </div>
        </div>

        {/* 擅长领域 */}
        {merchant.specialties && merchant.specialties.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>擅长领域：</div>
            <Space wrap>
              {merchant.specialties.map((s, i) => (
                <Tag key={i} color="primary" fill="outline" style={{ fontSize: 12, borderRadius: 12 }}>{s}</Tag>
              ))}
            </Space>
          </div>
        )}
      </div>

      {/* 服务列表 */}
      <div style={{ padding: '0 12px' }}>
        <div style={{ fontSize: 16, fontWeight: 600, margin: '16px 0 8px' }}>问诊服务</div>
        {doctorServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#999', background: '#fafafa', borderRadius: 12 }}>
            该医生暂无可用服务
          </div>
        ) : (
          doctorServices.map((svc) => (
            <Card
              key={svc.id}
              style={{ marginBottom: 10, borderRadius: 12 }}
              onClick={() => handleCreateOrder(svc.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        background: MODE_COLORS[svc.mode] || '#1677ff',
                      }}
                    >
                      {MODE_LABELS[svc.mode] || svc.mode}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{svc.title}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#666', marginTop: 6, lineHeight: 1.5 }}>
                    {svc.desc}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {svc.tags.map((t, i) => (
                      <Tag key={i} color="warning" fill="outline" style={{ fontSize: 11, borderRadius: 10 }}>{t}</Tag>
                    ))}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#999' }}>
                    {typeof svc.duration === 'number' && svc.duration >= 60
                      ? `${Math.floor(svc.duration / 60)}小时`
                      : typeof svc.duration === 'number' && svc.duration > 0
                        ? `${svc.duration}分钟`
                        : ''}
                    {svc.replyWithin ? ` · ${svc.replyWithin}` : ''}
                    {svc.orderCount > 0 ? ` · 已服务${svc.orderCount}次` : ''}
                    {svc.satisfiedRate ? ` · 好评率${svc.satisfiedRate}%` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#ff4d4f' }}>
                    ¥{svc.price}
                  </div>
                  {svc.originalPrice && svc.originalPrice > svc.price && (
                    <div style={{ fontSize: 12, color: '#ccc', textDecoration: 'line-through' }}>
                      ¥{svc.originalPrice}
                    </div>
                  )}
                  <Button
                    size="small"
                    color="primary"
                    style={{ marginTop: 8, borderRadius: 16 }}
                  >
                    立即问诊
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 出诊时间 */}
      {doctorServices.length > 0 && doctorServices[0].schedule.length > 0 && (
        <div style={{ padding: '0 12px', marginTop: 16, paddingBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>出诊时间</div>
          <div style={{ background: '#fafafa', borderRadius: 12, padding: 12 }}>
            {doctorServices[0].schedule.map((s, i) => (
              <div key={i} style={{ fontSize: 13, color: '#666', padding: '4px 0' }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppPageFrame>
  );
};

export default DoctorProfilePage;
