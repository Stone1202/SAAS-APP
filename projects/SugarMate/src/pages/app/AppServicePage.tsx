/**
 * APP服务页 — 服务聚合Hub
 * PRD §2.7.4.1 Tab2：在线问诊 + 商城购药 + 1v1签约 + 健康保险 + 直播看播入口
 */
import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Input, Avatar, Badge } from 'antd';
import {
  SearchOutlined, MessageOutlined, PhoneOutlined, VideoCameraOutlined,
  ShoppingCartOutlined, MedicineBoxOutlined, SafetyCertificateOutlined,
  CrownOutlined, PlayCircleOutlined, FireOutlined, StarFilled,
  RightOutlined, TeamOutlined, GiftOutlined,
} from '@ant-design/icons';
import MobileFrame, { APP_PATIENT_TABS } from '@/components/MobileFrame';
import { useLiveStore } from '@/stores/liveStore';
import { useMerchantStore } from '@/stores/merchantStore';

/* ========== 模拟数据 ========== */

const MALL_CATEGORIES = [
  { name: '血糖监测', icon: '📟', count: 23 },
  { name: '食品营养', icon: '🥗', count: 56 },
  { name: '运动健康', icon: '🏃', count: 18 },
  { name: '护理用品', icon: '💊', count: 34 },
  { name: '处方药',   icon: '🏥', count: 12 },
];

const MALL_PRODUCTS = [
  { name: 'CGM动态血糖仪', price: 299, original: 399, img: '📟', sold: '1.2万', tag: '爆款' },
  { name: '血糖试纸50条', price: 49, original: 69, img: '📋', sold: '8.6k', tag: '热卖' },
  { name: '无糖燕麦饼干', price: 39, original: 49, img: '🍪', sold: '3.2k', tag: '新品' },
];

/* ========== 医生卡片 ========== */
interface DoctorCardProps {
  name: string;
  title: string;
  hospital: string;
  rating: number;
  avatar: string;
  online: boolean;
  specialty: string;
}
const DoctorCard: React.FC<{ doctor: DoctorCardProps }> = ({ doctor }) => {
  const nav = useNavigate();
  return (
    <div
      onClick={() => nav('/app/service/doctors')}
      style={{
        background: '#fff', borderRadius: 10, padding: 12,
        display: 'flex', gap: 10, alignItems: 'center',
        cursor: 'pointer', border: '1px solid #f0f0f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, position: 'relative',
      }}>
        {doctor.avatar}
        {doctor.online && (
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
            borderRadius: '50%', background: '#52c41a', border: '2px solid #fff',
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
          {doctor.name}
          <Tag color="red" style={{ marginLeft: 6, fontSize: 9, lineHeight: '16px', borderRadius: 4 }}>{doctor.specialty}</Tag>
        </div>
        <div style={{ fontSize: 10, color: '#999' }}>{doctor.hospital}</div>
        <div style={{ fontSize: 10, marginTop: 2 }}>
          <StarFilled style={{ color: '#faad14', marginRight: 2, fontSize: 10 }} />
          <span style={{ color: '#333', fontWeight: 500 }}>{doctor.rating}</span>
          <span style={{ color: '#bbb', marginLeft: 4 }}>{doctor.title}</span>
        </div>
      </div>
      <div style={{
        background: '#e6f7ff', borderRadius: 14, color: '#1890ff',
        fontSize: 10, padding: '4px 10px', fontWeight: 500, whiteSpace: 'nowrap',
      }}>
        问诊
      </div>
    </div>
  );
};

/* ========== 正在直播 ========== */
const LiveSection: React.FC = () => {
  const nav = useNavigate();
  const { liveSessions, liveRooms, liveStats, broadcastPlans, initMockData } = useLiveStore();

  useEffect(() => {
    initMockData();
  }, [initMockData]);

  const liveList = useMemo(() => {
    return liveSessions
      .filter(s => s.status === 'live')
      .map(session => {
        const plan = broadcastPlans.find(p => p.id === session.planId);
        const room = session.roomId ? liveRooms.find(r => r.id === session.roomId) : null;
        const stats = room ? liveStats[room.id] : null;
        return {
          id: session.id,
          title: session.topic || session.planName,
          anchor: plan?.broadcasterName || '未知主播',
          viewers: stats?.onlineViewers || 0,
          roomId: session.roomId,
        };
      });
  }, [liveSessions, liveRooms, liveStats, broadcastPlans]);

  if (liveList.length === 0) return null;

  return (
    <Card
      size="small"
      title={
        <span style={{ fontSize: 13 }}>
          <PlayCircleOutlined style={{ color: '#e94560', marginRight: 6 }} />
          正在直播
          <Badge count={liveList.length} size="small" style={{ marginLeft: 8, backgroundColor: '#e94560' }} />
        </span>
      }
      extra={<a onClick={() => nav('/app/service/live')} style={{ fontSize: 11 }}>全部 <RightOutlined /></a>}
      style={{ borderRadius: 12, marginBottom: 16, borderLeft: '3px solid #e94560' }}
      bodyStyle={{ padding: '4px 0' }}
    >
      {liveList.map((live, i) => (
        <div key={live.id} onClick={() => nav(`/app/service/live/${live.roomId || live.id}`)} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer',
          borderBottom: i === 0 && liveList.length > 1 ? '1px solid #f5f5f5' : 'none',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #1a1a2e, #e94560)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, position: 'relative',
          }}>
            👨‍⚕️
            <div style={{
              position: 'absolute', top: 2, right: 2, width: 8, height: 8,
              borderRadius: '50%', background: '#ff4d4f', boxShadow: '0 0 6px rgba(255,77,79,0.6)',
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {live.title}
            </div>
            <div style={{ fontSize: 10, color: '#999' }}>
              <FireOutlined style={{ color: '#fa8c16', marginRight: 3 }} />{live.anchor} · {live.viewers}人观看
            </div>
          </div>
          <Tag color="red" style={{ margin: 0, fontSize: 10, borderRadius: 10 }}>LIVE</Tag>
        </div>
      ))}
    </Card>
  );
};

/* ========== 主组件 ========== */
const AppServicePage: React.FC = () => {
  const nav = useNavigate();
  const merchants = useMerchantStore(s => s.merchants);

  const doctors = useMemo(() => {
    return merchants
      .filter(m => m.role === 'DOCTOR')
      .map(m => ({
        name: m.name,
        title: `${m.department ?? ''}${m.title ?? '医生'}`,
        hospital: m.company ?? '未知医院',
        rating: m.rating?.score ?? 4.5,
        avatar: m.gender === 'F' ? '👩‍⚕️' : '👨‍⚕️',
        online: m.lifecycleStatus === 'ONLINE',
        specialty: m.specialties?.[0] ?? m.department ?? '综合',
      }));
  }, [merchants]);

  return (
    <MobileFrame title="服务" tabs={APP_PATIENT_TABS} basePath="/app">
      <div style={{ padding: '12px 12px 24px', background: '#f7f8fa', minHeight: '100%' }}>

        {/* === 搜索栏 === */}
        <div
          onClick={() => nav('/app/mall/search')}
          style={{
            background: '#fff', borderRadius: 20, padding: '10px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #f0f0f0', cursor: 'pointer',
          }}
        >
          <SearchOutlined style={{ color: '#bbb' }} />
          <span style={{ fontSize: 12, color: '#bbb' }}>搜索药品、医生、服务...</span>
        </div>

        {/* === 主入口卡片层 === */}
        <Row gutter={8} style={{ marginBottom: 16 }}>
          {[
            { icon: <MessageOutlined />, label: '在线问诊', desc: '图文/视频/电话', color: '#1890ff', bg: '#e6f7ff', path: '/app/service/doctors' },
            { icon: <ShoppingCartOutlined />, label: '健康商城', desc: '血糖仪/药品/食品', color: '#52c41a', bg: '#f6ffed', path: '/app/mall' },
            { icon: <CrownOutlined />, label: '1v1签约', desc: '专属医生管理', color: '#722ed1', bg: '#f9f0ff', path: '/app/service/vip' },
            { icon: <SafetyCertificateOutlined />, label: '健康保险', desc: '控糖保障计划', color: '#fa8c16', bg: '#fff7e6', path: '/app/service' },
          ].map((item, i) => (
            <Col span={12} key={i} style={{ marginBottom: 8 }}>
              <div
                onClick={() => nav(item.path)}
                style={{
                  background: '#fff', borderRadius: 12, padding: '14px 12px', border: '1px solid #f0f0f0',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: item.bg, color: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>{item.desc}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* === 正在直播 === */}
        <LiveSection />

        {/* === 推荐医生 === */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
              <MedicineBoxOutlined style={{ color: '#1890ff', marginRight: 4 }} />推荐医生
            </span>
            <a onClick={() => nav('/app/service/doctors')} style={{ fontSize: 11 }}>更多 <RightOutlined /></a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doctors.map((doc, i) => <DoctorCard key={doc.name + i} doctor={doc} />)}
          </div>
        </div>

        {/* === 商城推荐 === */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
              <ShoppingCartOutlined style={{ color: '#52c41a', marginRight: 4 }} />商城推荐
            </span>
            <a onClick={() => nav('/app/mall')} style={{ fontSize: 11 }}>更多 <RightOutlined /></a>
          </div>
          {/* 分类 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto' }}>
            {MALL_CATEGORIES.map((cat, i) => (
              <div key={i} onClick={() => nav('/app/mall')} style={{
                background: '#fff', borderRadius: 16, padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                border: '1px solid #f0f0f0', flexShrink: 0, fontSize: 11,
              }}>
                <span>{cat.icon}</span>
                <span style={{ color: '#666' }}>{cat.name}</span>
              </div>
            ))}
          </div>
          {/* 商品 */}
          <Row gutter={8}>
            {MALL_PRODUCTS.map((p, i) => (
              <Col span={8} key={i}>
                <div onClick={() => nav(`/app/mall/product/${i + 1}`)} style={{
                  background: '#fff', borderRadius: 10, overflow: 'hidden',
                  cursor: 'pointer', border: '1px solid #f0f0f0',
                }}>
                  <div style={{
                    height: 72, background: 'linear-gradient(135deg, #f0f5ff, #e6f7ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, position: 'relative',
                  }}>
                    {p.img}
                    <span style={{
                      position: 'absolute', top: 4, left: 4, background: '#f5222d',
                      color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 4,
                    }}>
                      {p.tag}
                    </span>
                  </div>
                  <div style={{ padding: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f5222d' }}>¥{p.price}</span>
                      <span style={{ fontSize: 9, color: '#999', textDecoration: 'line-through' }}>¥{p.original}</span>
                    </div>
                    <div style={{ fontSize: 9, color: '#bbb', marginTop: 2 }}>已售{p.sold}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </MobileFrame>
  );
};

export default AppServicePage;
