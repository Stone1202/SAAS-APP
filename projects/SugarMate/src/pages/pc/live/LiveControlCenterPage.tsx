/**
 * 直播中控台 — 从直播间管理进入，单直播间专属控制界面
 * V3.0 对标巨量百应专业中控台
 *
 * 核心新增：
 * 1. 一键弹讲解卡到观众屏幕（productExplainCard）
 * 2. 优惠券/福袋直接发放
 * 3. 讲解状态管理（待讲/讲解中/已讲）
 * 4. 观众画像速览
 * 5. 数据趋势对比
 */
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Card, Button, Tag, Space, Typography, Row, Col, Statistic,
  Switch, Input, message, Badge, Tabs, Divider, Progress, Tooltip,
  Layout, Modal, Slider,
} from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  EyeOutlined, HeartOutlined, MessageOutlined, DollarOutlined,
  ShoppingCartOutlined, SoundOutlined, RiseOutlined,
  ThunderboltOutlined, AimOutlined, PlayCircleOutlined, PauseCircleOutlined,
  QuestionCircleOutlined, GiftOutlined, BarChartOutlined,
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FullscreenOutlined, SettingOutlined, CameraOutlined,
  WarningOutlined, WifiOutlined, AudioOutlined,
  HomeOutlined, SendOutlined, ArrowUpOutlined, ArrowDownOutlined,
  PushpinOutlined, NotificationOutlined, ScheduleOutlined,
  TeamOutlined, ClockCircleOutlined, FundOutlined,
  CustomerServiceOutlined, ControlOutlined, FormOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import { useLiveStore, type CommentItem, type LiveStats, type LiveRoom, type LiveSession, type ExplainLock } from '@/stores/liveStore';

const { Title, Text, Paragraph } = Typography;

// ==================== 常量 ====================

const SIMULATE_STATS_CHANGE = (base: LiveStats): LiveStats => ({
  ...base,
  onlineViewers: Math.max(50, base.onlineViewers + Math.floor(Math.random() * 40) - 20),
  totalViews: base.totalViews + Math.floor(Math.random() * 30),
  likes: base.likes + Math.floor(Math.random() * 80),
  comments: base.comments + Math.floor(Math.random() * 5),
  revenue: base.revenue + Math.floor(Math.random() * 350),
  orders: base.orders + (Math.random() > 0.75 ? 1 : 0),
});

// ==================== 子组件 ====================

/** 硬件状态行 */
const StatusRow: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <Row justify="space-between" style={{ marginBottom: 4 }}>
    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{label}</Text>
    {color ? (
      <Tag color={color} style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>{value}</Tag>
    ) : (
      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{value}</Text>
    )}
  </Row>
);

/** 数据卡片 */
const DataCard: React.FC<{
  title: string; value: number; icon: React.ReactNode; color: string;
  prefix?: string; suffix?: string; format?: boolean; trend?: number;
}> = ({ title, value, icon, color, prefix = '', suffix = '', format, trend }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '12px 10px',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 20, color, marginBottom: 4, opacity: 0.8 }}>{icon}</div>
    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
      {format && value > 9999
        ? `${prefix}${(value / 10000).toFixed(1)}万${suffix}`
        : `${prefix}${value.toLocaleString()}${suffix}`}
    </div>
    {trend !== undefined && (
      <div style={{ fontSize: 10, color: trend > 0 ? '#52c41a' : '#ff4d4f', marginTop: 2 }}>
        {trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

/** 视频画面 */
const VideoFeed: React.FC<{
  label: string; subtitle?: string; isLive?: boolean;
  size?: 'large' | 'normal'; style?: React.CSSProperties;
}> = ({ label, subtitle, isLive = true, size = 'normal', style }) => (
  <div style={{
    position: 'relative',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    borderRadius: 6, overflow: 'hidden',
    ...style,
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: size === 'large' ? '30px 30px' : '20px 20px',
    }} />
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: size === 'large' ? 80 : 50, height: size === 'large' ? 80 : 50,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(24,144,255,0.2) 0%, rgba(24,144,255,0.05) 60%, transparent 70%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CameraOutlined style={{ fontSize: size === 'large' ? 28 : 18, color: 'rgba(255,255,255,0.15)' }} />
    </div>
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '6px 10px',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ color: '#fff', fontSize: size === 'large' ? 13 : 11, fontWeight: 500 }}>{label}</div>
        {subtitle && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>{subtitle}</div>}
      </div>
      {isLive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(255,77,79,0.3)', padding: '1px 8px', borderRadius: 3,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f', animation: 'pulse 1.5s infinite' }} />
          <span style={{ color: '#fff', fontSize: 9 }}>LIVE</span>
        </div>
      )}
    </div>
  </div>
);

/** 视频监控区 */
const VideoMonitorArea: React.FC<{ currentRoom: LiveRoom; layout: string }> = ({ currentRoom, layout }) => {
  if (layout === 'focus') {
    return (
      <div style={{ marginBottom: 10 }}>
        <VideoFeed label={`主画面 · ${currentRoom.roomName}`} subtitle={`${currentRoom.resolution}`} isLive size="large" style={{ height: 320 }} />
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', marginBottom: 10 }}>
      <VideoFeed label={`主画面 · ${currentRoom.roomName}`} subtitle={`${currentRoom.resolution}`} isLive size="large" style={{ height: 280 }} />
      <div style={{ position: 'absolute', bottom: 12, right: 12, width: 200, height: 120, zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)', borderRadius: 6, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.15)' }}>
        <VideoFeed label="商品特写" subtitle="俯拍镜头" isLive style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ position: 'absolute', bottom: 12, left: 12, width: 200, height: 120, zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)', borderRadius: 6, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.15)' }}>
        <VideoFeed label="推流画面" subtitle={currentRoom.resolution} isLive style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

// ==================== 主组件 ====================

const LiveControlCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlRoomId = searchParams.get('roomId') || '';
  const {
    liveRooms, liveSessions, broadcastPlans,
    liveProducts, marketingActivities, interactionConfigs,
    comments, liveStats, activeRoomId, controlCommands,
    setActiveRoom, initMockData,
    updateControlCommand, pinProduct, unpinProduct,
    moderateComment, updateLiveStats, getActiveProductsByRoomId,
    getMarketingByRoomId, getInteractionsByRoomId,
    updateLiveProduct,
    addMarketingActivity, updateMarketingActivity,
    explainLock, acquireExplainLock, releaseExplainLock,
    endLiveSession,
  } = useLiveStore();

  const [selectedRoomId, setSelectedRoomId] = useState<string>(activeRoomId || '');
  const [danmakuInput, setDanmakuInput] = useState('');

  // 兜底：若 selectedRoomId 仍为空但 liveRooms 已加载，默认选中第一个
  useEffect(() => {
    if (!selectedRoomId && liveRooms.length > 0) {
      const first = liveRooms[0].id;
      setSelectedRoomId(first);
      setActiveRoom(first);
    }
  }, [selectedRoomId, liveRooms, setActiveRoom]);
  const [videoLayout, setVideoLayout] = useState<'grid2x2' | 'pip' | 'focus'>('pip');
  const [explainingProductId, setExplainingProductId] = useState<string | null>(null);
  const [explainHistory, setExplainHistory] = useState<string[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponAmount, setCouponAmount] = useState(20);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { initMockData(); }, []);

  // 从直播间管理列表进入时，自动选中对应直播间
  useEffect(() => {
    if (urlRoomId && liveRooms.some(r => r.id === urlRoomId)) {
      setSelectedRoomId(urlRoomId);
      setActiveRoom(urlRoomId);
    }
  }, [urlRoomId, liveRooms]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeRoomId && activeRoomId !== selectedRoomId) setSelectedRoomId(activeRoomId);
  }, [activeRoomId]);

  // 实时数据模拟
  useEffect(() => {
    const room = liveRooms.find(r => r.id === selectedRoomId);
    if (!room || room.status !== 'live' || !isLiveSessionActive) return;
    timerRef.current = setInterval(() => {
      const s = liveStats[selectedRoomId];
      if (s && s.onlineViewers > 0) {
        const next = SIMULATE_STATS_CHANGE(s);
        if (next.onlineViewers < 100) next.onlineViewers = 100;
        updateLiveStats(selectedRoomId, next);
      }
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [selectedRoomId, liveRooms, liveStats]);

  // 数据读取
  const currentRoom = liveRooms.find(r => r.id === selectedRoomId);
  const currentStats = liveStats[selectedRoomId];
  const currentSession = currentRoom ? liveSessions.find(s => s.id === currentRoom.sessionId) : null;
  const currentPlan = currentSession ? broadcastPlans.find(p => p.id === currentSession.planId) : null;
  // 直播间状态（跨端同步）
  const sessionStatus = currentSession?.status || 'pending';
  const isLiveSessionActive = sessionStatus === 'live';
  const isPaused = sessionStatus === 'paused';
  const isEnded = sessionStatus === 'ended';
  const statusLabel: Record<string, string> = { pending: '待开播', ready: '已就绪', live: '直播中', paused: '已暂停', ended: '已结束' };
  const statusColor: Record<string, string> = { pending: 'default', ready: 'blue', live: 'red', paused: 'orange', ended: 'default' };
  // 是否支持商品控制（仅直播带货类型，基于关联场次 liveType）
  const canControlProducts = currentSession?.liveType === 'shopping';
  const roomProducts = useMemo(() => getActiveProductsByRoomId(selectedRoomId), [selectedRoomId, getActiveProductsByRoomId]);
  const roomActivities = useMemo(() => getMarketingByRoomId(selectedRoomId), [selectedRoomId, getMarketingByRoomId]);
  const roomInteractions = useMemo(() => getInteractionsByRoomId(selectedRoomId), [selectedRoomId, getInteractionsByRoomId]);
  const pendingComments = useMemo(() => comments.filter(c => c.status === 'pending'), [comments]);
  const approvedComments = useMemo(() => comments.filter(c => c.status === 'approved'), [comments]);

  // ===== 中控操作 =====
  const handleToggleDanmaku = () => { updateControlCommand('danmakuEnabled', !controlCommands.danmakuEnabled); message.success(controlCommands.danmakuEnabled ? '弹幕已关闭' : '弹幕已开启'); };
  const handleToggleAutoReview = () => { updateControlCommand('autoReview', !controlCommands.autoReview); message.success(controlCommands.autoReview ? '自动审核已关闭' : '自动审核已开启'); };
  const handleToggleCheckIn = () => { updateControlCommand('checkInActive', !controlCommands.checkInActive); message.success(controlCommands.checkInActive ? '签到已关闭' : '签到已开启'); };
  const handleSetCountdown = () => { const sec = parseInt(danmakuInput) || 0; if (sec <= 0) { message.warning('请输入有效秒数'); return; } updateControlCommand('countdown', sec); message.success(`倒计时 ${sec} 秒已启动`); setDanmakuInput(''); };
  const handleApproveComment = (id: string) => { moderateComment(id, 'approved'); message.success('弹幕已通过'); };
  const handleBlockComment = (id: string) => { moderateComment(id, 'blocked'); message.success('弹幕已拦截'); };

  // ★★ 核心新增：一键弹讲解卡 ★★
  const handlePopExplainCard = (productId: string) => {
    // 互斥锁检查：如果主播端已持有讲解锁，中控台不能操作
    if (explainLock && explainLock.holder === 'broadcaster') {
      const product = liveProducts.find(p => p.id === explainLock.productId);
      message.warning(`主播端正在讲解"${product?.productName || '商品'}"，不可操作`);
      return;
    }
    // 尝试获取讲解锁
    const acquired = acquireExplainLock(productId, 'controller');
    if (!acquired) {
      message.warning('讲解锁已被占用，请稍后再试');
      return;
    }

    // 1. 置顶商品
    pinProduct(productId);
    // 2. 标记讲解中
    setExplainingProductId(productId);
    // 3. 记录讲解历史
    setExplainHistory(prev => [...prev, productId]);
    // 4. 中控发送提示弹幕
    const product = liveProducts.find(p => p.id === productId);
    const { addComment } = useLiveStore.getState();
    addComment({
      id: `ctrl-explain-${Date.now()}`,
      roomId: selectedRoomId,
      user: '直播助手',
      content: `📢 主播正在讲解：${product?.productName || '热卖商品'}，点击查看详情~`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'approved',
    });
    message.success(`🎯 讲解卡已推送到观众屏幕：${product?.productName}`);
  };

  // 取消讲解
  const handleStopExplain = () => {
    if (explainingProductId) {
      unpinProduct(explainingProductId);
      releaseExplainLock('controller');
    }
    setExplainingProductId(null);
    message.success('讲解已结束');
  };

  // ★★ 核心新增：一键发优惠券 ★★
  const handleIssueCoupon = () => {
    const { addComment } = useLiveStore.getState();
    const couponId = `coupon-${Date.now()}`;
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    // 1. 写入 marketingActivities（APP 活动面板可见）
    addMarketingActivity({
      id: couponId,
      activityName: `满${couponAmount * 5}减${couponAmount}元优惠券`,
      type: 'coupon',
      roomId: selectedRoomId,
      roomName: currentRoom?.roomName || '',
      content: `满${couponAmount * 5}减${couponAmount}元`,
      startTime: now,
      endTime: '',
      budget: couponAmount,
      status: 'active',
    });
    // 2. 发弹幕到公屏
    addComment({
      id: `ctrl-coupon-${Date.now()}`,
      roomId: selectedRoomId,
      user: '直播助手',
      content: `🎫 优惠券已发放！满${couponAmount * 5}减${couponAmount}元，限时领取！`,
      time: now,
      status: 'approved',
    });
    message.success(`已发放满${couponAmount * 5}减${couponAmount}元优惠券`);
    setShowCouponModal(false);
  };

  // ★★ 核心新增：一键发福袋 ★★
  const handleIssueLuckyBag = () => {
    const { addComment } = useLiveStore.getState();
    const bagId = `bag-${Date.now()}`;
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    // 1. 写入 marketingActivities
    addMarketingActivity({
      id: bagId,
      activityName: '直播间福袋',
      type: 'reservation_gift',
      roomId: selectedRoomId,
      roomName: currentRoom?.roomName || '',
      content: '观看满5分钟即可参与抽奖，3分钟后开奖',
      startTime: now,
      endTime: '',
      status: 'active',
    });
    // 2. 发弹幕到公屏
    addComment({
      id: `ctrl-bag-${Date.now()}`,
      roomId: selectedRoomId,
      user: '直播助手',
      content: '🧧 福袋来啦！观看满5分钟即可参与抽奖，3分钟后开奖！',
      time: now,
      status: 'approved',
    });
    updateControlCommand('countdown', 180);
    message.success('福袋已发放，倒计时3分钟');
  };

  const handleActivateInteraction = (id: string) => {
    const { updateInteractionConfig } = useLiveStore.getState();
    const interaction = roomInteractions.find(i => i.id === id);
    updateInteractionConfig(id, { status: 'active' });
    message.success(`互动「${interaction?.interactionName || id}」已激活`);
  };

  // 无直播间选中
  if (!currentRoom) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#0a0e27' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column' }}>
          <ControlOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.15)', marginBottom: 24 }} />
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginBottom: 8 }}>直播中控台</Text>
          <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, marginBottom: 24 }}>请从直播间管理页面选择直播间进入</Text>
          <Space>
            <Button type="primary" size="large" icon={<HomeOutlined />} onClick={() => navigate('/live-mgmt/rooms')}>前往直播间管理</Button>
            <Button icon={<HomeOutlined />} onClick={() => navigate('/dashboard')}>返回运营后台</Button>
          </Space>
        </div>
      </Layout>
    );
  }

  const productExplainStatuses = roomProducts.map(p => ({
    ...p,
    explainStatus: explainingProductId === p.id ? 'explaining' as const : explainHistory.includes(p.id) ? 'explained' as const : 'pending' as const,
  }));

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0e27' }}>
      {/* ==================== 顶部工具栏 ==================== */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1f3a 0%, #121631 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 56,
      }}>
        <Space size={16}>
          <Button type="text" icon={<HomeOutlined />} style={{ color: 'rgba(255,255,255,0.5)' }} onClick={() => navigate('/dashboard')} />
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
          <Title level={5} style={{ margin: 0, color: '#fff' }}><ThunderboltOutlined /> 直播中控台</Title>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{currentRoom?.roomName}</span>
          <Tag color={statusColor[sessionStatus]} style={{ background: sessionStatus === 'live' ? 'rgba(255,77,79,0.15)' : sessionStatus === 'paused' ? 'rgba(250,173,20,0.15)' : 'rgba(255,255,255,0.05)', border: 'none' }}>
            {sessionStatus === 'live' ? '🔴' : sessionStatus === 'paused' ? '🟡' : '⚪'} {statusLabel[sessionStatus]}
          </Tag>
          {(isLiveSessionActive || isPaused) && (
            <Button size="small" danger type="primary" ghost
              icon={<WarningOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认强制结束直播？',
                  content: '此操作将立即终止当前直播，APP端观众将看到「直播已结束」提示。',
                  okText: '确认结束',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk: () => {
                    if (currentSession) {
                      endLiveSession(currentSession.id);
                      message.success('直播已强制结束');
                    }
                  },
                });
              }}
            >
              强制结束
            </Button>
          )}
        </Space>
        <Space size={10}>
          <Button.Group>
            <Button
              type={controlCommands.danmakuEnabled ? 'primary' : 'default'} size="small"
              icon={<MessageOutlined />} onClick={handleToggleDanmaku}
              style={controlCommands.danmakuEnabled ? {} : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
              弹幕 {controlCommands.danmakuEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button
              type={controlCommands.autoReview ? 'primary' : 'default'} size="small"
              icon={<CheckCircleOutlined />} onClick={handleToggleAutoReview}
              style={controlCommands.autoReview ? {} : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
              自动审核 {controlCommands.autoReview ? 'ON' : 'OFF'}
            </Button>
          </Button.Group>
          <Button.Group>
            <Tooltip title="PIP"><Button size="small" type={videoLayout === 'pip' ? 'primary' : 'default'} onClick={() => setVideoLayout('pip')} style={videoLayout === 'pip' ? {} : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>PIP</Button></Tooltip>
            <Tooltip title="聚焦"><Button size="small" type={videoLayout === 'focus' ? 'primary' : 'default'} onClick={() => setVideoLayout('focus')} style={videoLayout === 'focus' ? {} : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>聚焦</Button></Tooltip>
          </Button.Group>
        </Space>
      </div>

      {/* ==================== 主内容滚动区 ==================== */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 12px' }}>
        {/* ===== 视频监控区 ===== */}
        <VideoMonitorArea currentRoom={currentRoom} layout={videoLayout} />

        {/* ===== 实时数据面板（7卡片 + 趋势） ===== */}
        <Row gutter={10} style={{ marginBottom: 10 }}>
          <Col span={3}>
            <DataCard title="在线观看" value={currentStats?.onlineViewers || 0} icon={<EyeOutlined />} color="#1677ff" suffix=" 人" trend={12} />
          </Col>
          <Col span={3}>
            <DataCard title="累计观看" value={currentStats?.totalViews || 0} icon={<BarChartOutlined />} color="#722ed1" suffix=" 次" />
          </Col>
          <Col span={3}>
            <DataCard title="点赞" value={currentStats?.likes || 0} icon={<HeartOutlined />} color="#ff4d4f" format trend={-3} />
          </Col>
          <Col span={3}>
            <DataCard title="弹幕" value={currentStats?.comments || 0} icon={<MessageOutlined />} color="#fa8c16" suffix=" 条" />
          </Col>
          <Col span={3}>
            <DataCard title="成交额" value={currentStats?.revenue || 0} icon={<DollarOutlined />} color="#52c41a" prefix="¥" format trend={25} />
          </Col>
          <Col span={3}>
            <DataCard title="订单数" value={currentStats?.orders || 0} icon={<ShoppingCartOutlined />} color="#13c2c2" suffix=" 单" trend={8} />
          </Col>
          <Col span={3}>
            <DataCard title="GMV/人" value={currentStats ? Math.round(currentStats.revenue / Math.max(1, currentStats.orders)) : 0} icon={<FundOutlined />} color="#faad14" prefix="¥" />
          </Col>
          <Col span={3}>
            <DataCard title="转化率" value={currentStats ? Math.round(currentStats.orders / Math.max(1, currentStats.onlineViewers + currentStats.totalViews) * 10000) / 100 : 0} icon={<RiseOutlined />} color="#eb2f96" suffix="%" />
          </Col>
        </Row>

        {/* ===== 直播信息条 ===== */}
        <div style={{
          marginBottom: 10, padding: '8px 16px',
          background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Space size={20}>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}><Text style={{ color: 'rgba(255,255,255,0.3)' }}>直播间</Text> {currentRoom.roomName}</span>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}><Text style={{ color: 'rgba(255,255,255,0.3)' }}>场次</Text> {currentSession?.topic || '-'}</span>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}><Text style={{ color: 'rgba(255,255,255,0.3)' }}>已播</Text> {currentStats?.duration || '00:00'}</span>
            {explainingProductId && (
              <Tag color="red" style={{ animation: 'pulse 1s infinite' }}>
                📢 讲解中：{liveProducts.find(p => p.id === explainingProductId)?.productName || '-'}
              </Tag>
            )}
            {explainLock?.holder === 'broadcaster' && (
              <Tag style={{ fontSize: 10, background: 'rgba(250,173,20,0.12)', color: '#faad14', border: 'none' }}>
                🔒 主播端讲解中
              </Tag>
            )}
            {explainLock?.holder === 'controller' && explainingProductId && (
              <Tag style={{ fontSize: 10, background: 'rgba(24,144,255,0.1)', color: '#1890ff', border: 'none' }}>
                🎛 中控讲解中
              </Tag>
            )}
            {controlCommands.countdown > 0 && (
              <Tag color="red" style={{ animation: 'pulse 1s infinite' }}>⏱ 倒计时 {controlCommands.countdown}s</Tag>
            )}
          </Space>
        </div>

        {/* ==================== 三栏操作区 ==================== */}
        <Row gutter={10} style={{ minHeight: 480 }}>
          {/* 左栏：商品操控 + 讲解控制 + 互动 */}
          <Col span={8}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', height: '100%',
            }}>
              <Tabs
                defaultActiveKey={canControlProducts ? 'products' : 'interactions'}
                tabBarStyle={{ padding: '0 12px', margin: 0, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                items={[
                  // ★★ 商品操控 Tab ★★（仅直播带货类型）
                  ...(canControlProducts ? [{
                    key: 'products',
                    label: <span style={{ color: 'rgba(255,255,255,0.65)' }}><ShoppingCartOutlined /> 商品操控</span>,
                    children: (
                      <div style={{ maxHeight: 420, overflowY: 'auto', padding: 8 }}>
                        {productExplainStatuses.length === 0 ? (
                          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: 40, fontSize: 12 }}>暂无商品</div>
                        ) : (
                          productExplainStatuses.map(p => (
                            <div key={p.id} style={{
                              marginBottom: 8, padding: 10, borderRadius: 6,
                              background: p.explainStatus === 'explaining' ? 'rgba(255,77,79,0.12)' :
                                           p.explainStatus === 'explained' ? 'rgba(82,196,26,0.06)' :
                                           'rgba(255,255,255,0.03)',
                              border: p.explainStatus === 'explaining' ? '1.5px solid rgba(255,77,79,0.4)' :
                                      p.explainStatus === 'explained' ? '1px solid rgba(82,196,26,0.2)' :
                                      '1px solid rgba(255,255,255,0.05)',
                              borderLeft: p.explainStatus === 'explaining' ? '3px solid #ff4d4f' :
                                          p.explainStatus === 'explained' ? '3px solid #52c41a' :
                                          '3px solid transparent',
                            }}>
                              <Row align="middle">
                                <Col flex={1}>
                                  <Space size={4}>
                                    {p.explainStatus === 'explaining' && <PushpinOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
                                    {p.explainStatus === 'explained' && <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />}
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{p.productName}</Text>
                                  </Space>
                                  <div style={{ marginTop: 4 }}>
                                    <Text style={{ color: '#ff4d4f', fontSize: 14, fontWeight: 700 }}>¥{p.livePrice}</Text>
                                    <Text delete style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginLeft: 6 }}>¥{p.normalPrice}</Text>
                                    <Tag style={{ fontSize: 9, marginLeft: 6, background: 'rgba(255,255,255,0.06)', color: p.explainStatus === 'explaining' ? '#ff4d4f' : 'rgba(255,255,255,0.45)', border: 'none' }}>
                                      {p.explainStatus === 'explaining' ? '⚡ 讲解中' : p.explainStatus === 'explained' ? '已讲解' : '待讲'}
                                    </Tag>
                                  </div>
                                </Col>
                                <Col>
                                  <Space size={4}>
                                    {p.explainStatus === 'explaining' ? (
                                      <Button size="small" danger onClick={handleStopExplain} style={{ fontSize: 11 }}>
                                        <PauseCircleOutlined /> 结束
                                      </Button>
                                    ) : explainLock?.holder === 'broadcaster' ? (
                                      <Tooltip title={`主播端正在讲解，暂不可操作`}>
                                        <Button size="small" disabled style={{ fontSize: 11, opacity: 0.4 }}>
                                          <SendOutlined /> 弹讲解卡
                                        </Button>
                                      </Tooltip>
                                    ) : (
                                      <Button size="small" type="primary" danger ghost
                                        onClick={() => handlePopExplainCard(p.id)} style={{ fontSize: 11 }}>
                                        <SendOutlined /> 弹讲解卡
                                      </Button>
                                    )}
                                  </Space>
                                </Col>
                              </Row>
                            </div>
                          ))
                        )}
                      </div>
                    ),
                  }] : []),
                  // ★★ 互动控制 Tab ★★
                  {
                    key: 'interactions',
                    label: <span style={{ color: 'rgba(255,255,255,0.65)' }}><GiftOutlined /> 互动控制</span>,
                    children: (
                      <div style={{ maxHeight: 420, overflowY: 'auto', padding: 8 }}>
                        {roomInteractions.map(interaction => (
                          <div key={interaction.id} style={{
                            marginBottom: 6, padding: 10,
                            background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}>
                            <div style={{ marginBottom: 4 }}>
                              <Tag color={{ qa: 'purple', lottery: 'gold', poll: 'blue' }[interaction.type]}>
                                {{ qa: '💬 问答', lottery: '🎰 抽奖', poll: '📊 投票' }[interaction.type]}
                              </Tag>
                              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{interaction.interactionName}</span>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 6 }}>{interaction.description}</div>
                            <Button size="small" type={interaction.status === 'active' ? 'text' : 'primary'} danger={interaction.status === 'active'} block
                              onClick={() => handleActivateInteraction(interaction.id)}
                              style={interaction.status === 'active' ? { color: 'rgba(255,255,255,0.55)' } : {}}>
                              {interaction.status === 'active' ? '进行中' : '激活互动'}
                            </Button>
                          </div>
                        ))}
                        {roomInteractions.length === 0 && (
                          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: 40, fontSize: 12 }}>暂无互动配置</div>
                        )}
                      </div>
                    ),
                  },
                  // ★★ 营销工具 Tab ★★
                  {
                    key: 'marketing',
                    label: <span style={{ color: 'rgba(255,255,255,0.65)' }}><ThunderboltOutlined /> 营销工具</span>,
                    children: (
                      <div style={{ maxHeight: 420, overflowY: 'auto', padding: 8 }}>
                        {/* 发放优惠券 */}
                        <div style={{
                          padding: 14, background: 'rgba(255,152,0,0.06)', borderRadius: 8,
                          border: '1px solid rgba(255,152,0,0.2)', marginBottom: 10,
                        }}>
                          <div style={{ color: '#ff9800', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                            <GiftOutlined /> 发放优惠券
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 10 }}>
                            一键发放优惠券到直播间公屏，观众可直接领取
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>优惠金额</Text>
                            <Slider min={5} max={100} step={5} value={couponAmount}
                              onChange={setCouponAmount}
                              marks={{ 5: '5', 20: '20', 50: '50', 100: '100' }}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                          <Button block type="primary" style={{ background: '#ff9800', borderColor: '#ff9800' }}
                            onClick={handleIssueCoupon}>
                            <SendOutlined /> 发放满{couponAmount * 5}减{couponAmount}元优惠券
                          </Button>
                        </div>

                        {/* 发放福袋 */}
                        <div style={{
                          padding: 14, background: 'rgba(233,69,96,0.06)', borderRadius: 8,
                          border: '1px solid rgba(233,69,96,0.2)', marginBottom: 10,
                        }}>
                          <div style={{ color: '#e94560', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                            <GiftOutlined /> 直播间福袋
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 10 }}>
                            发放倒计时福袋，观众观看满5分钟自动参与
                          </div>
                          <Button block danger onClick={handleIssueLuckyBag}>
                            <ClockCircleOutlined /> 发放3分钟福袋
                          </Button>
                        </div>

                        {/* 已配置活动 */}
                        <div style={{ marginTop: 8 }}>
                          <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>已配置营销活动</Text>
                          {roomActivities.map(a => (
                            <div key={a.id} style={{
                              marginTop: 6, padding: 8, background: 'rgba(255,255,255,0.03)',
                              borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)',
                            }}>
                              <Space size={4}>
                                <Tag color={{ coupon: 'green', flash_sale: 'red', reservation_gift: 'gold' }[a.type]}>
                                  {{ coupon: '优惠券', flash_sale: '秒杀', reservation_gift: '预约礼' }[a.type]}
                                </Tag>
                                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{a.activityName}</Text>
                              </Space>
                            </div>
                          ))}
                          {roomActivities.length === 0 && (
                            <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 4 }}>暂无</div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </Col>

          {/* 中栏：弹幕审核 */}
          <Col span={8}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)', padding: 12, height: '100%',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Space>
                  <MessageOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>弹幕审核</Text>
                  {pendingComments.length > 0 && <Badge count={pendingComments.length} size="small" style={{ backgroundColor: '#faad14' }} />}
                </Space>
                <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>通过 {approvedComments.length} · 待审 {pendingComments.length}</Text>
              </div>

              {/* 待审核 */}
              <div style={{ marginBottom: 8, flex: '0 0 auto' }}>
                {pendingComments.map(c => (
                  <div key={c.id} style={{
                    marginBottom: 4, padding: 8,
                    background: 'rgba(250,173,20,0.08)', borderRadius: 6,
                    borderLeft: '3px solid #faad14',
                  }}>
                    <Row justify="space-between" align="middle">
                      <Col flex={1}>
                        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{c.user} · {c.time}</Text>
                        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, wordBreak: 'break-all', marginTop: 2 }}>{c.content}</div>
                      </Col>
                      <Col>
                        <Space size={4}>
                          <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApproveComment(c.id)}>通过</Button>
                          <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleBlockComment(c.id)}>拦截</Button>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
              <Divider style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* 已通过弹幕 */}
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {approvedComments.slice(-35).map(c => (
                  <div key={c.id} style={{ marginBottom: 4, display: 'flex', gap: 6, alignItems: 'baseline' }}>
                    <Tag color="blue" style={{ fontSize: 10, flexShrink: 0 }}>{c.user}</Tag>
                    <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, wordBreak: 'break-all' }}>{c.content}</Text>
                  </div>
                ))}
              </div>
              <Divider style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* 中控发言 */}
              <Input.Search
                placeholder="中控代发消息…" value={danmakuInput}
                onChange={e => setDanmakuInput(e.target.value)}
                onSearch={(v) => {
                  if (!v.trim()) return;
                  const { addComment } = useLiveStore.getState();
                  addComment({
                    id: `ctrl-${Date.now()}`,
                    roomId: selectedRoomId,
                    user: '直播助手', content: v.trim(),
                    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                    status: 'approved',
                  });
                  setDanmakuInput('');
                }}
                enterButton="发送"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
            </div>
          </Col>

          {/* 右栏：指挥面板 + 观众画像 */}
          <Col span={8}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)', padding: 12, height: '100%', overflowY: 'auto',
            }}>
              <div style={{ marginBottom: 14 }}>
                <Space><AimOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>指挥面板</Text>
                </Space>
              </div>

              {/* ★★ 讲解状态总览 ★★ */}
              <div style={{ marginBottom: 16 }}>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>商品讲解状态</Text>
                <div style={{ marginTop: 6 }}>
                  <Row gutter={6}>
                    <Col span={8}>
                      <div style={{
                        textAlign: 'center', padding: 8,
                        background: 'rgba(255,77,79,0.08)', borderRadius: 6,
                        border: '1px solid rgba(255,77,79,0.15)',
                      }}>
                        <div style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 700 }}>{explainingProductId ? 1 : 0}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>讲解中</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{
                        textAlign: 'center', padding: 8,
                        background: 'rgba(82,196,26,0.08)', borderRadius: 6,
                        border: '1px solid rgba(82,196,26,0.15)',
                      }}>
                        <div style={{ color: '#52c41a', fontSize: 20, fontWeight: 700 }}>{explainHistory.length}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>已讲解</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{
                        textAlign: 'center', padding: 8,
                        background: 'rgba(255,255,255,0.04)', borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, fontWeight: 700 }}>
                          {roomProducts.length - (explainingProductId ? 1 : 0) - explainHistory.filter(id => !roomProducts.find(p => p.id === id && p.id === explainingProductId)).length}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>待讲解</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* ★★ 观众画像速览 ★★ */}
              <div style={{ marginBottom: 16 }}>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}><TeamOutlined /> 观众画像速览</Text>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>男性 42%</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>女性 58%</span>
                  </div>
                  <Progress percent={42} showInfo={false} size="small" strokeColor="#1677ff" trailColor="rgba(255,255,255,0.06)" />
                  <Progress percent={58} showInfo={false} size="small" strokeColor="#eb2f96" trailColor="rgba(255,255,255,0.06)" style={{ marginTop: 2 }} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <Row gutter={[6, 6]}>
                    {[
                      { label: '35-44岁', pct: 32, color: '#ff4d4f' },
                      { label: '45-54岁', pct: 28, color: '#fa8c16' },
                      { label: '55-64岁', pct: 22, color: '#ffd700' },
                      { label: '25-34岁', pct: 12, color: '#52c41a' },
                      { label: '65+岁', pct: 6, color: '#1677ff' },
                    ].map(age => (
                      <Col span={24} key={age.label}>
                        <Row justify="space-between" align="middle">
                          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, width: 50 }}>{age.label}</Text>
                          <Progress percent={age.pct} showInfo={false} size="small" strokeColor={age.color}
                            trailColor="rgba(255,255,255,0.05)" style={{ flex: 1, margin: '0 6px' }} />
                          <Text style={{ color: age.color, fontSize: 10, width: 30, textAlign: 'right' }}>{age.pct}%</Text>
                        </Row>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>

              <Divider style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* 倒计时 */}
              <div style={{ marginBottom: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                  <ClockCircleOutlined /> 倒计时
                </Text>
                <Space style={{ marginTop: 6, width: '100%' }}>
                  <Input placeholder="秒数" size="small" style={{ width: 70, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onChange={e => setDanmakuInput(e.target.value)} />
                  <Button type="primary" size="small" onClick={handleSetCountdown}>启动</Button>
                  {controlCommands.countdown > 0 && (
                    <Button danger size="small" onClick={() => updateControlCommand('countdown', 0)}>取消</Button>
                  )}
                </Space>
                {controlCommands.countdown > 0 && (
                  <Progress percent={100} status="active" showInfo={false} style={{ marginTop: 6 }} size="small" />
                )}
              </div>

              <Divider style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* 置顶商品 */}
              <div style={{ marginBottom: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                  <PushpinOutlined /> 置顶商品
                </Text>
                <div style={{ marginTop: 6 }}>
                  {roomProducts.filter(p => p.isPinned).map(p => (
                    <div key={p.id} style={{
                      padding: 6, marginBottom: 4,
                      background: 'rgba(255,77,79,0.08)', borderRadius: 6,
                      borderLeft: '3px solid #ff4d4f',
                    }}>
                      <Row justify="space-between" align="middle">
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{p.productName}</Text>
                        <Button size="small" danger type="text" onClick={() => unpinProduct(p.id)} style={{ fontSize: 10 }}>取消</Button>
                      </Row>
                    </div>
                  ))}
                  {roomProducts.filter(p => p.isPinned).length === 0 && (
                    <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>暂无</div>
                  )}
                </div>
              </div>

              <Divider style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* 硬件状态 */}
              <div style={{ marginBottom: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                  <WifiOutlined /> 硬件状态
                </Text>
                <div style={{ marginTop: 8 }}>
                  <StatusRow label="推流状态" value="正常" color="green" />
                  <StatusRow label="网络延迟" value="12ms" color="green" />
                  <StatusRow label="帧率" value={`${currentRoom.frameRate}fps`} color="green" />
                  <StatusRow label="码率" value={`${currentRoom.bitrate}Kbps`} />
                  <StatusRow label="音频" value="正常" color="green" />
                  <StatusRow label="美颜" value={currentRoom.beautyEnabled ? 'ON' : 'OFF'} color={currentRoom.beautyEnabled ? 'pink' : undefined} />
                  <StatusRow label="录制备份" value="进行中" color="green" />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
    </Layout>
  );
};

export default LiveControlCenterPage;
