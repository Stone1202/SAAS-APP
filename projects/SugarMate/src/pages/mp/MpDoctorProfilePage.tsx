/**
 * 小程序 - 医生名片页
 * 
 * 改造：对接PC后台的医生信息和服务数据
 * 数据来源：
 *   merchantStore：医生基本信息
 *   consultationServiceStore：该医生的问诊服务列表
 */
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Space, NavBar, Tag, Grid,
  Divider, Image,
} from 'antd-mobile';
import {
  StarFill, ClockCircleOutline, AudioOutline,
  MessageOutline, VideoOutline, RightOutline,
} from 'antd-mobile-icons';
import { useMerchantStore } from '@/stores/merchantStore';
import { useConsultationServiceStore } from '@/stores/consultationServiceStore';

const MODE_ICONS: Record<string, React.ReactNode> = {
  text: <MessageOutline />,
  voice: <AudioOutline />,
  video: <VideoOutline />,
  phone: <AudioOutline />,
};

// ==================== 组件 ====================

const MpDoctorProfilePage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  // 从PC后台获取数据
  const doc = useMerchantStore(s => s.doctors.find(d => d.id === doctorId));
  const { services, loadServices } = useConsultationServiceStore();

  useEffect(() => {
    loadServices();
  }, []);

  const docServices = useMemo(
    () => services.filter(s => s.doctorId === doctorId && s.status === 'published'),
    [services, doctorId]
  );

  if (!doc) {
    return (
      <div>
        <NavBar onBack={() => navigate(-1)}>医生详情</NavBar>
        <Card style={{ textAlign: 'center', padding: 40, margin: 12 }}>
          <span style={{ color: '#999' }}>医生信息加载中...</span>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar onBack={() => navigate(-1)}>医生名片</NavBar>

      {/* 医生信息 */}
      <Card style={{ margin: '8px 12px', borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 600, flexShrink: 0,
            }}
          >
            {doc.name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <Space align="center">
              <span style={{ fontSize: 18, fontWeight: 600 }}>{doc.name}</span>
              {doc.rating && (
                <Space size={2}>
                  <StarFill style={{ color: '#faad14', fontSize: 14 }} />
                  <span style={{ color: '#faad14', fontSize: 14 }}>{doc.rating}</span>
                </Space>
              )}
            </Space>
            <span style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 4 }}>
              {doc.hospital || doc.shopName || ''}
            </span>
            <span style={{ fontSize: 13, color: '#666', display: 'block' }}>
              {doc.department || ''} · {doc.title || ''}
            </span>
            <span style={{ fontSize: 12, color: '#999', display: 'block', marginTop: 4 }}>
              从业{doc.experienceYears || '—'}年
            </span>
          </div>
        </div>

        <Divider />

        {/* 擅长领域 */}
        {doc.specializations && doc.specializations.length > 0 && (
          <>
            <span style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 8 }}>擅长领域</span>
            <Space wrap>
              {doc.specializations.map((spec, i) => (
                <Tag key={i} color="primary" style={{ fontSize: 12 }}>{spec}</Tag>
              ))}
            </Space>
            <Divider />
          </>
        )}

        {/* 简介 */}
        {doc.bio && (
          <>
            <span style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 8 }}>医生简介</span>
            <span style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{doc.bio}</span>
            <Divider />
          </>
        )}

        {/* 问诊服务 - 来自PC后台 */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>在线问诊服务</span>
          <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>（共{docServices.length}项）</span>
        </div>

        {docServices.length === 0 ? (
          <span style={{ color: '#999', fontSize: 13 }}>该医生暂未开放在线问诊服务</span>
        ) : (
          <div>
            {docServices.map((svc) => (
              <Card
                key={svc.id}
                style={{
                  marginBottom: 8,
                  borderRadius: 8,
                  border: '1px solid #e8e8e8',
                }}
                bodyStyle={{ padding: 12 }}
                onClick={() => navigate(`/app/consultation/pre-consult/${doctorId}?serviceId=${svc.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Space align="center">
                      {MODE_ICONS[svc.mode]}
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{svc.title}</span>
                      {svc.orderCount > 100 && (
                        <Tag color="red" style={{ fontSize: 10, padding: '0 4px' }}>热门</Tag>
                      )}
                    </Space>
                    <span style={{ fontSize: 12, color: '#999', display: 'block', marginTop: 4 }}>
                      {svc.desc?.slice(0, 40)}...
                    </span>
                    <Space size={8} style={{ marginTop: 4 }}>
                      {svc.replyWithin && (
                        <span style={{ fontSize: 11, color: '#999' }}>
                          <ClockCircleOutline /> {svc.replyWithin}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#52c41a' }}>
                        满意率 {svc.satisfiedRate}%
                      </span>
                    </Space>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: '#f5222d' }}>
                      ¥{svc.price}
                    </span>
                    {svc.originalPrice && svc.originalPrice > svc.price && (
                      <span style={{ fontSize: 11, color: '#999', textDecoration: 'line-through', display: 'block' }}>
                        ¥{svc.originalPrice}
                      </span>
                    )}
                    <Button
                      size="mini"
                      color="primary"
                      style={{ marginTop: 6, fontSize: 12 }}
                    >
                      立即问诊
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* 底部操作 */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: 12, background: '#fff', borderTop: '1px solid #f0f0f0',
          display: 'flex', gap: 12,
        }}
      >
        <Button block color="primary" size="large"
          onClick={() => {
            const firstService = docServices[0];
            if (firstService) {
              navigate(`/app/consultation/pre-consult/${doctorId}?serviceId=${firstService.id}`);
            }
          }}
        >
          {docServices.length > 0 ? '立即问诊' : '暂无服务'}
        </Button>
      </div>
    </div>
  );
};

export default MpDoctorProfilePage;
