/**
 * APP首页 — 血糖健康仪表盘 v2.0
 * 整合原服务页内容：直播 → 推荐医生 → 推荐商品
 * 布局：血糖监控 → 快捷入口 → 直播(正在/即将) → 推荐医生 → 推荐商品 → 健康科普
 */
import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Badge, Progress } from 'antd';
import {
  MedicineBoxOutlined, CalendarOutlined, ShoppingCartOutlined,
  PlayCircleOutlined, RightOutlined, RiseOutlined, FallOutlined,
  AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, FireOutlined,
  ThunderboltOutlined, StarFilled, ScheduleOutlined,
} from '@ant-design/icons';
import MobileFrame, { APP_PATIENT_TABS } from '@/components/MobileFrame';
import { useLiveStore } from '@/stores/liveStore';
import { useMerchantStore } from '@/stores/merchantStore';

/* ========== 模拟数据 ========== */
const CGM_DATA = {
  currentGlucose: 5.8,
  trend: 'stable' as 'up' | 'down' | 'stable',
  timestamp: '10:32',
  tir: 78,
  last24h: [6.2, 5.8, 5.5, 5.1, 4.9, 5.2, 5.8, 6.5, 7.1, 6.8, 6.2, 5.8, 5.4, 5.0, 4.7, 5.1, 5.6, 6.0, 5.9, 5.7, 5.8, 6.1, 6.3, 5.9],
  hba1c: 6.2,
  status: 'normal' as 'low' | 'normal' | 'high',
  alerts: [] as Array<{ type: string; msg: string; time: string }>,
};

const QUICK_ACTIONS = [
  { icon: <MedicineBoxOutlined />, label: '在线问诊', color: '#1890ff', bg: '#e6f7ff', path: '/app/service/doctors' },
  { icon: <ShoppingCartOutlined />, label: '健康商城', color: '#52c41a', bg: '#f6ffed', path: '/app/mall' },
  { icon: <PlayCircleOutlined />, label: '看直播',     color: '#e94560', bg: '#fff1f0', path: '/app/service/live' },
  { icon: <CalendarOutlined />,  label: '用药提醒',   color: '#fa8c16', bg: '#fff7e6', path: '/app/mine/med-reminder', badge: 1 },
];

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

const HEALTH_TIPS = [
  { tag: '饮食', title: '糖友夏季水果怎么选？记住这3点', read: '1.2k' },
  { tag: '运动', title: '饭后半小时散步，血糖下降15%', read: '980' },
  { tag: '科普', title: 'CGM传感器佩戴注意事项', read: '2.1k' },
];

/* ========== 血糖仪表盘头部 ========== */
const GlucoseHero: React.FC = () => {
  const { currentGlucose, trend, timestamp, tir, hba1c, status } = CGM_DATA;
  const trendIcon = trend === 'up' ? <RiseOutlined /> : trend === 'down' ? <FallOutlined /> : null;
  const trendLabel = trend === 'up' ? '上升中' : trend === 'down' ? '下降中' : '平稳';
  const trendColor = trend === 'up' ? '#fa8c16' : trend === 'down' ? '#52c41a' : '#1890ff';
  const statusColor = status === 'low' ? '#f5222d' : status === 'high' ? '#fa8c16' : '#52c41a';
  const statusBg = status === 'low' ? '#fff1f0' : status === 'high' ? '#fff7e6' : '#f6ffed';
  const statusLabel = status === 'low' ? '血糖偏低' : status === 'high' ? '血糖偏高' : '血糖正常';

  return (
    <Card
      style={{
        borderRadius: 16, border: 'none',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #0d1b2a 100%)',
        marginBottom: 16, overflow: 'hidden', position: 'relative',
      }}
      bodyStyle={{ padding: '20px 16px 16px' }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,144,255,0.2) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: 200, height: 60, background: 'radial-gradient(ellipse, rgba(82,196,26,0.08) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />实时血糖 · {timestamp}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: '#fff', lineHeight: 1, fontFamily: 'SF Pro Display, sans-serif' }}>
                {currentGlucose}
              </span>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>mmol/L</span>
              {trendIcon && <span style={{ fontSize: 20, color: trendColor, marginLeft: 4 }}>{trendIcon}</span>}
            </div>
            <div style={{ fontSize: 12, color: trendColor, marginTop: 2, fontWeight: 500 }}>{trendLabel}</div>
          </div>
          <div style={{ background: statusBg, borderRadius: 20, padding: '4px 12px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, display: 'flex', alignItems: 'center', gap: 4 }}>
              {status === 'normal' ? <CheckCircleOutlined /> : <AlertOutlined />}
              {statusLabel}
            </span>
          </div>
        </div>

        {/* 24h血糖曲线 */}
        <div style={{ marginTop: 16, marginBottom: 16, position: 'relative' }}>
          <svg viewBox="0 0 300 60" style={{ width: '100%', height: 60 }}>
            <rect x="0" y="8" width="300" height="28" fill="rgba(82,196,26,0.08)" rx="4" />
            <path
              d={(() => {
                const pts = CGM_DATA.last24h;
                const maxG = 10, minG = 3.5, h = 52, pad = 4;
                const xScale = (300 - 16) / (pts.length - 1);
                let d = '';
                pts.forEach((v, i) => { const x = 8 + i * xScale; const y = pad + ((maxG - v) / (maxG - minG)) * (h - pad * 2); d += i === 0 ? `M${x},${y}` : `L${x},${y}`; });
                return d;
              })()}
              fill="none" stroke="rgba(24,144,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d={(() => {
                const pts = CGM_DATA.last24h;
                const maxG = 10, minG = 3.5, h = 52, pad = 4;
                const xScale = (300 - 16) / (pts.length - 1);
                let d = '';
                pts.forEach((v, i) => { const x = 8 + i * xScale; const y = pad + ((maxG - v) / (maxG - minG)) * (h - pad * 2); d += i === 0 ? `M${x},${y}` : `L${x},${y}`; });
                const lastX = 8 + (pts.length - 1) * xScale;
                const lastY = pad + ((maxG - pts[pts.length - 1]) / (maxG - minG)) * (h - pad * 2);
                return d + `L${lastX},${h - pad} L8,${h - pad} Z`;
              })()}
              fill="url(#glucoseGrad)" opacity="0.25"
            />
            <defs><linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1890ff" stopOpacity="0.4" /><stop offset="100%" stopColor="#1890ff" stopOpacity="0" /></linearGradient></defs>
          </svg>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThunderboltOutlined style={{ color: '#1890ff', fontSize: 16 }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, flex: 1 }}>当前血糖平稳，继续保持健康的饮食和运动习惯</span>
        </div>
      </div>

      <Row gutter={12} style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
        <Col span={8}>
          <div style={{ textAlign: 'center' }}>
            <Progress type="circle" percent={CGM_DATA.tir} size={52} strokeColor="#52c41a" trailColor="rgba(255,255,255,0.1)"
              format={() => <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{CGM_DATA.tir}%</span>}
            />
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 }}>TIR达标率</div>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{hba1c}<span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>%</span></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 }}>预估HbA1c</div>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>0</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 }}>今日预警</div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

/* ========== 快捷操作 2x2 ========== */
const QuickActions: React.FC<{ liveCount: number }> = ({ liveCount }) => {
  const nav = useNavigate();
  const actions = useMemo(() => QUICK_ACTIONS.map(a =>
    a.label === '看直播' ? { ...a, badge: liveCount > 0 ? liveCount : undefined } : a
  ), [liveCount]);
  return (
    <Row gutter={8} style={{ marginBottom: 16 }}>
      {actions.map((action, i) => (
        <Col span={12} key={i} style={{ marginBottom: 8 }}>
          <div onClick={() => nav(action.path)} style={{
            background: '#fff', borderRadius: 12, padding: '14px 12px',
            cursor: 'pointer', border: '1px solid #f0f0f0',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: action.color, flexShrink: 0 }}>
              {action.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                {action.label}
                {action.badge ? <Badge count={action.badge} size="small" style={{ marginLeft: 4, backgroundColor: '#e94560' }} /> : null}
              </div>
            </div>
            <RightOutlined style={{ color: '#ccc', fontSize: 12 }} />
          </div>
        </Col>
      ))}
    </Row>
  );
};

/* ========== 直播区域（正在直播 + 即将开播） ========== */
const LiveArea: React.FC = () => {
  const nav = useNavigate();
  const { liveSessions, liveRooms, liveStats, broadcastPlans, initMockData } = useLiveStore();

  useEffect(() => { initMockData(); }, [initMockData]);

  const liveList = useMemo(() => {
    return liveSessions.filter(s => s.status === 'live').map(session => {
      const plan = broadcastPlans.find(p => p.id === session.planId);
      const room = session.roomId ? liveRooms.find(r => r.id === session.roomId) : null;
      const stats = room ? liveStats[room.id] : null;
      return { id: session.id, title: session.topic || session.planName, anchor: plan?.broadcasterName || '未知主播', viewers: stats?.onlineViewers || 0, roomId: session.roomId };
    });
  }, [liveSessions, liveRooms, liveStats, broadcastPlans]);

  const upcomingList = useMemo(() => {
    return liveSessions.filter(s => s.status === 'pending' || s.status === 'ready').map(session => {
      const plan = broadcastPlans.find(p => p.id === session.planId);
      return { id: session.id, title: session.topic || session.planName, anchor: plan?.broadcasterName || '未知主播', startTime: session.startTime, roomId: session.roomId };
    });
  }, [liveSessions, liveRooms, broadcastPlans]);

  if (liveList.length === 0 && upcomingList.length === 0) return null;

  return (
    <>
      {/* 正在直播 */}
      {liveList.length > 0 && (
        <Card size="small"
          title={<span style={{ fontSize: 13 }}><PlayCircleOutlined style={{ color: '#e94560', marginRight: 6 }} />正在直播<Badge count={liveList.length} size="small" style={{ marginLeft: 8, backgroundColor: '#e94560' }} /></span>}
          extra={<a onClick={() => nav('/app/service/live')} style={{ fontSize: 11, cursor: 'pointer' }}>全部 <RightOutlined /></a>}
          style={{ borderRadius: 12, marginBottom: 12, borderLeft: '3px solid #e94560' }}
          bodyStyle={{ padding: '4px 0' }}
        >
          {liveList.map((live, i) => (
            <div key={live.id} onClick={() => nav(`/app/service/live/${live.roomId || live.id}`)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer',
              borderBottom: i < liveList.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #1a1a2e, #e94560)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative' }}>
                👨‍⚕️
                <div style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f', boxShadow: '0 0 6px rgba(255,77,79,0.6)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{live.title}</div>
                <div style={{ fontSize: 10, color: '#999' }}><FireOutlined style={{ color: '#fa8c16', marginRight: 3 }} />{live.anchor} · {live.viewers}人观看</div>
              </div>
              <Tag color="red" style={{ margin: 0, fontSize: 10, borderRadius: 10 }}>LIVE</Tag>
            </div>
          ))}
        </Card>
      )}

      {/* 即将开播 */}
      {upcomingList.length > 0 && (
        <Card size="small"
          title={<span style={{ fontSize: 13 }}><ScheduleOutlined style={{ color: '#1890ff', marginRight: 6 }} />即将开播<Badge count={upcomingList.length} size="small" style={{ marginLeft: 8, backgroundColor: '#1890ff' }} /></span>}
          extra={<a onClick={() => nav('/app/service/live')} style={{ fontSize: 11, cursor: 'pointer' }}>全部 <RightOutlined /></a>}
          style={{ borderRadius: 12, marginBottom: 16, borderLeft: '3px solid #1890ff' }}
          bodyStyle={{ padding: '4px 0' }}
        >
          {upcomingList.map((live, i) => (
            <div key={live.id} onClick={() => nav(`/app/service/live/${live.roomId || live.id}`)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer',
              borderBottom: i < upcomingList.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                🩺
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{live.title}</div>
                <div style={{ fontSize: 10, color: '#999' }}><ClockCircleOutlined style={{ marginRight: 3 }} />{live.anchor} · {live.startTime}</div>
              </div>
              <Tag color="blue" style={{ margin: 0, fontSize: 10, borderRadius: 10 }}>预告</Tag>
            </div>
          ))}
        </Card>
      )}
    </>
  );
};

/* ========== 推荐医生 ========== */
const RecommendedDoctors: React.FC = () => {
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

  if (doctors.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
          <MedicineBoxOutlined style={{ color: '#1890ff', marginRight: 4 }} />推荐医生
        </span>
        <a onClick={() => nav('/app/service/doctors')} style={{ fontSize: 11, cursor: 'pointer' }}>更多 <RightOutlined /></a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {doctors.slice(0, 3).map((doc, i) => (
          <div key={doc.name + i} onClick={() => nav('/app/service/doctors')} style={{
            background: '#fff', borderRadius: 10, padding: 12,
            display: 'flex', gap: 10, alignItems: 'center',
            cursor: 'pointer', border: '1px solid #f0f0f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative' }}>
              {doc.avatar}
              {doc.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#52c41a', border: '2px solid #fff' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                {doc.name}
                <Tag color="red" style={{ marginLeft: 6, fontSize: 9, lineHeight: '16px', borderRadius: 4 }}>{doc.specialty}</Tag>
              </div>
              <div style={{ fontSize: 10, color: '#999' }}>{doc.hospital}</div>
              <div style={{ fontSize: 10, marginTop: 2 }}>
                <StarFilled style={{ color: '#faad14', marginRight: 2, fontSize: 10 }} />
                <span style={{ color: '#333', fontWeight: 500 }}>{doc.rating}</span>
                <span style={{ color: '#bbb', marginLeft: 4 }}>{doc.title}</span>
              </div>
            </div>
            <div style={{ background: '#e6f7ff', borderRadius: 14, color: '#1890ff', fontSize: 10, padding: '4px 10px', fontWeight: 500, whiteSpace: 'nowrap' }}>问诊</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========== 推荐商品 ========== */
const RecommendedProducts: React.FC = () => {
  const nav = useNavigate();

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
          <ShoppingCartOutlined style={{ color: '#52c41a', marginRight: 4 }} />商城推荐
        </span>
        <a onClick={() => nav('/app/mall')} style={{ fontSize: 11, cursor: 'pointer' }}>更多 <RightOutlined /></a>
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
              <div style={{ height: 72, background: 'linear-gradient(135deg, #f0f5ff, #e6f7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, position: 'relative' }}>
                {p.img}
                <span style={{ position: 'absolute', top: 4, left: 4, background: '#f5222d', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 4 }}>{p.tag}</span>
              </div>
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{p.name}</div>
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
  );
};

/* ========== 健康科普推荐 ========== */
const HealthTips: React.FC = () => {
  const nav = useNavigate();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
          <ThunderboltOutlined style={{ color: '#fa8c16', marginRight: 4 }} />健康科普
        </span>
        <a onClick={() => nav('/app/health/knowledge')} style={{ fontSize: 11, cursor: 'pointer' }}>更多 <RightOutlined /></a>
      </div>
      {HEALTH_TIPS.map((tip, i) => (
        <div key={i} onClick={() => nav('/app/health/knowledge')} style={{
          background: '#fff', borderRadius: 10, padding: '12px 14px',
          marginBottom: 8, cursor: 'pointer', border: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}>
          <Tag style={{ borderRadius: 8, margin: 0 }}>{tip.tag}</Tag>
          <span style={{ flex: 1, fontSize: 12, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tip.title}</span>
          <span style={{ fontSize: 10, color: '#bbb', flexShrink: 0 }}>{tip.read}阅读</span>
        </div>
      ))}
    </div>
  );
};

/* ========== 主组件 ========== */
const AppHomePage: React.FC = () => {
  const { liveSessions } = useLiveStore();
  const liveCount = useMemo(() => liveSessions.filter(s => s.status === 'live').length, [liveSessions]);

  return (
    <MobileFrame title="SugarMate" tabs={APP_PATIENT_TABS} basePath="/app">
      <div style={{ padding: '12px 12px 24px', background: '#f7f8fa', minHeight: '100%' }}>
        <GlucoseHero />
        <QuickActions liveCount={liveCount} />
        <LiveArea />
        <RecommendedDoctors />
        <RecommendedProducts />
        <HealthTips />
      </div>
    </MobileFrame>
  );
};

export default AppHomePage;
