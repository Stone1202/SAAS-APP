/**
 * 主播推流端 / 直播操作台
 * V1.0 — 新标签页独立打开
 *
 * 对标：抖音直播伴侣 + 淘宝主播端
 *
 * 核心功能：
 * 1. 推流设置（摄像头/麦克风/美颜/场景）
 * 2. 商品讲解控制（讲解/下一件/已讲列表）
 * 3. 实时反馈（点赞/弹幕/礼物浮动提示）
 * 4. 中控消息接收（中控发来的文本指令）
 *
 * 布局：
 * ┌─────────────┬─────────────┬──────────────────┐
 * │ 推流画面预览  │ 商品讲解控制 │  实时反馈 + 弹幕   │
 * │ (全屏镜像)   │  ├ 当前讲解  │  ├ 点赞飘心       │
 * │             │  ├ 讲解列表  │  ├ 弹幕滚动       │
 * │             │  ├ 下一件    │  ├ 礼物通知       │
 * ├─────────────┴─────────────┴──────────────────┤
 * │ 底部工具栏：开启/关闭 · 暂停 · 结束直播       │
 * └───────────────────────────────────────────────┘
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Button, Tag, Space, Typography, Row, Col, Badge,
  message, Select, Switch, Slider, Card, Divider, Input, Tooltip,
} from 'antd';
import {
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined,
  CameraOutlined, AudioOutlined, AudioMutedOutlined,
  SettingOutlined, EyeOutlined, HeartOutlined,
  MessageOutlined, ShoppingCartOutlined, GiftOutlined,
  ThunderboltOutlined, PushpinOutlined, CheckCircleOutlined,
  CloseCircleOutlined, RightOutlined, LeftOutlined,
  CrownOutlined, ScheduleOutlined, InfoCircleOutlined,
  SoundOutlined, BulbOutlined, FullscreenOutlined,
  ApiOutlined, ControlOutlined, NotificationOutlined,
  WifiOutlined, TeamOutlined, HomeOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveStore, type LiveRoom, type CommentItem, type ExplainLock } from '@/stores/liveStore';

const { Text, Title } = Typography;

// ==================== 子组件 ====================

/** 飘心动画 */
const FloatingHeart: React.FC<{ id: number; x: number }> = ({ id, x }) => (
  <div style={{
    position: 'absolute', left: x,
    bottom: 10,
    animation: `floatUp_${id} ${2.5 + Math.random() * 2}s ease-out forwards`,
    zIndex: 30, pointerEvents: 'none',
    fontSize: 18 + Math.random() * 10,
    opacity: 0.9,
  }}>
    {['❤️', '💗', '💕', '♥️', '💖'][id % 5]}
  </div>
);

/** 礼物通知 */
const GiftNotification: React.FC<{
  gifter: string; giftName: string; onDone: () => void;
}> = ({ gifter, giftName, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, rgba(255,215,0,0.95), rgba(255,152,0,0.95))',
      borderRadius: 12, padding: '10px 20px', zIndex: 30,
      boxShadow: '0 4px 20px rgba(255,152,0,0.4)',
      animation: 'giftSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }}>
      <Row align="middle" gutter={8}>
        <GiftOutlined style={{ color: '#fff', fontSize: 20 }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{gifter}</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>送出 {giftName}</div>
        </div>
      </Row>
    </div>
  );
};

/** 推流画面预览 */
const StreamPreview: React.FC<{
  resolution: string; isStreaming: boolean; beautyEnabled: boolean;
  onToggleBeauty: () => void;
}> = ({ resolution, isStreaming, beautyEnabled, onToggleBeauty }) => (
  <div style={{
    width: '100%', height: 0, paddingBottom: '56.25%', position: 'relative',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    borderRadius: 8, overflow: 'hidden',
  }}>
    {/* 画面 */}
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.2,
        background: `
          radial-gradient(circle at 50% 40%, rgba(233,69,96,0.5) 0%, transparent 50%),
          radial-gradient(circle at 30% 60%, rgba(24,144,255,0.4) 0%, transparent 40%)
        `,
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.3) 0%, 
          ${beautyEnabled ? 'rgba(255,182,193,0.3)' : 'rgba(233,69,96,0.4)'} 50%, 
          rgba(15,52,96,0.6) 100%)`,
        border: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 0 80px rgba(233,69,96,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 50,
      }}>
        📷
      </div>
    </div>

    {/* 底部 Status */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '6px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <Space size={10}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{resolution}</span>
        <Space size={6}>
          <Tooltip title="美颜">
            <div style={{
              padding: '2px 8px', borderRadius: 10, cursor: 'pointer',
              background: beautyEnabled ? 'rgba(255,182,193,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${beautyEnabled ? 'rgba(255,182,193,0.5)' : 'rgba(255,255,255,0.1)'}`,
            }} onClick={onToggleBeauty}>
              <span style={{ color: beautyEnabled ? '#ffb6c1' : 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                {beautyEnabled ? '✨ 美颜' : '美颜'}
              </span>
            </div>
          </Tooltip>
        </Space>
      </Space>
      {isStreaming && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4f', animation: 'pulse 1.5s infinite' }} />
          <span style={{ color: '#fff', fontSize: 10 }}>推流中</span>
        </div>
      )}
    </div>

    <style>{`@keyframes pulse {0%,100%{opacity:1} 50%{opacity:0.5}}`}</style>
  </div>
);

// ==================== 主组件 ====================

const BroadcasterStreamPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlRoomId = searchParams.get('roomId') || '';
  const {
    liveRooms, liveSessions, liveProducts, comments, liveStats,
    activeRoomId, controlCommands, explainLock,
    setActiveRoom, initMockData, addComment, updateLiveStats,
    pinProduct, unpinProduct,
    acquireExplainLock, releaseExplainLock,
    startLiveSession, pauseLiveSession, resumeLiveSession, endLiveSession,
  } = useLiveStore();

  // Stream states — 从 Store 驱动（跨端同步）
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [beautyEnabled, setBeautyEnabled] = useState(true);
  const [beautyLevel, setBeautyLevel] = useState(70);
  const [resolution, setResolution] = useState('1080P');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(activeRoomId || '');

  // 从直播间管理列表进入时，自动选中对应直播间
  useEffect(() => {
    if (urlRoomId && liveRooms.some(r => r.id === urlRoomId)) {
      setSelectedRoomId(urlRoomId);
      setActiveRoom(urlRoomId);
    }
  }, [urlRoomId, liveRooms]); // eslint-disable-line react-hooks/exhaustive-deps

  // Explaining states
  const [explainingProductId, setExplainingProductId] = useState<string | null>(null);
  const [explainHistory, setExplainHistory] = useState<string[]>([]);

  // UI states
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [gifts, setGifts] = useState<{ id: number; gifter: string; giftName: string }[]>([]);
  const heartCounter = useRef(0);
  const giftCounter = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { initMockData(); }, []);

  useEffect(() => {
    if (activeRoomId && activeRoomId !== selectedRoomId) setSelectedRoomId(activeRoomId);
  }, [activeRoomId]);

  const currentRoom = liveRooms.find(r => r.id === selectedRoomId);
  const currentSession = useMemo(() => liveSessions.find(s => s.roomId === selectedRoomId), [liveSessions, selectedRoomId]);
  // 从 Store 派生流状态（跨端同步）
  const isStreaming = currentSession?.status === 'live';
  const isPaused = currentSession?.status === 'paused';
  const currentStats = liveStats[selectedRoomId];
  const roomProducts = useMemo(() => liveProducts.filter(p => p.roomId === selectedRoomId && p.status === 'active'), [liveProducts, selectedRoomId]);
  const approvedComments = useMemo(() => comments.filter(c => c.status === 'approved').slice(-15), [comments]);

  // Product explain status
  const productStatuses = roomProducts.map(p => ({
    ...p,
    explainStatus: explainingProductId === p.id ? 'explaining' as const :
                   explainHistory.includes(p.id) ? 'explained' as const :
                   'pending' as const,
  }));

  // 模拟实时反馈
  useEffect(() => {
    if (!isStreaming || isPaused) return;
    timerRef.current = setInterval(() => {
      // Random hearts
      if (Math.random() > 0.5) {
        const h = { id: heartCounter.current++, x: 30 + Math.random() * 60 };
        setHearts(prev => [...prev.slice(-8), h]);
      }
      // Random gifts (less frequent)
      if (Math.random() > 0.92) {
        const gifters = ['糖友小李', '健康达人', '糖妈', '老张'];
        const giftTypes = ['小心心', '荧光棒', '糖豆', '急救包'];
        setGifts(prev => [...prev.slice(-2), {
          id: giftCounter.current++,
          gifter: gifters[Math.floor(Math.random() * gifters.length)],
          giftName: giftTypes[Math.floor(Math.random() * giftTypes.length)],
        }]);
      }
      // Stats update
      if (selectedRoomId && currentStats) {
        updateLiveStats(selectedRoomId, {
          ...currentStats,
          likes: currentStats.likes + Math.floor(Math.random() * 20),
          comments: currentStats.comments + (Math.random() > 0.7 ? 1 : 0),
        });
      }
    }, 2000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStreaming, currentStats, selectedRoomId]);

  // ===== 操作 =====
  const handleRoomSelect = (roomId: string) => { setSelectedRoomId(roomId); setActiveRoom(roomId); };
  const handleStartStream = () => {
    if (!selectedRoomId) { message.warning('请先选择直播间'); return; }
    if (!currentSession) { message.warning('未找到对应场次'); return; }
    startLiveSession(currentSession.id);
    message.success('推流已开启');
  };

  const handlePause = () => {
    if (!currentSession) return;
    pauseLiveSession(currentSession.id);
    message.info('推流已暂停');
  };

  const handleResume = () => {
    if (!currentSession) return;
    resumeLiveSession(currentSession.id);
    message.success('推流已恢复');
  };

  const handleStopStream = () => {
    if (!currentSession) {
      message.warning('未找到对应场次');
      return;
    }
    endLiveSession(currentSession.id);
    releaseExplainLock('broadcaster');
    setExplainingProductId(null);
    message.success('推流已停止');
  };
  const handleToggleMic = () => { setMicEnabled(!micEnabled); message.success(micEnabled ? '麦克风已关闭' : '麦克风已开启'); };
  const handleToggleCamera = () => { setCameraEnabled(!cameraEnabled); message.success(cameraEnabled ? '摄像头已关闭' : '摄像头已开启'); };
  const handleToggleBeauty = () => { setBeautyEnabled(!beautyEnabled); };

  const handleStartExplain = (productId: string) => {
    // 如果锁定者是中控台，主播端不能操作
    if (explainLock && explainLock.holder === 'controller') {
      message.warning(`中控台正在讲解"${liveProducts.find(p => p.id === explainLock.productId)?.name || '商品'}"，暂不可操作`);
      return;
    }
    // 尝试获取锁
    const acquired = acquireExplainLock(productId, 'broadcaster');
    if (!acquired) {
      message.warning('讲解锁已被占用，请稍后再试');
      return;
    }

    // Pin product to top of list in viewers' pages
    pinProduct(productId);
    setExplainingProductId(productId);
    setExplainHistory(prev => [...prev.filter(id => id !== productId), productId]);

    const product = liveProducts.find(p => p.id === productId);
    addComment({
      id: `host-${Date.now()}`,
      user: '直播助手', content: `📢 主播正在讲解：${product?.productName || '热卖商品'}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'approved',
    });
  };

  const handleStopExplain = () => {
    if (explainingProductId) {
      unpinProduct(explainingProductId);
      releaseExplainLock('broadcaster');
    }
    setExplainingProductId(null);
  };

  const handleNextProduct = () => {
    const explainable = productStatuses.filter(p => p.explainStatus === 'pending');
    if (explainable.length > 0) {
      handleStartExplain(explainable[0].id);
    } else {
      message.info('所有商品已讲解完毕');
    }
  };

  const roomOptions = liveRooms
    .filter(r => r.status === 'ready' || r.status === 'live')
    .map(r => ({ label: r.roomName, value: r.id }));

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    }}>
      {/* ==================== 顶部工具栏 ==================== */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1f35 0%, #0d1117 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Space size={16}>
          <Button type="text" icon={<HomeOutlined />} style={{ color: 'rgba(255,255,255,0.5)' }} onClick={() => navigate('/dashboard')} />
          <Title level={5} style={{ margin: 0, color: '#fff' }}><ThunderboltOutlined /> 主播推流端</Title>
          {urlRoomId ? (
            <span style={{ color: '#fff', fontWeight: 500, fontSize: 14, padding: '4px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}>
              {liveRooms.find(r => r.id === selectedRoomId)?.roomName || selectedRoomId}
            </span>
          ) : (
            <Select value={selectedRoomId} onChange={handleRoomSelect}
              placeholder="选择直播间" style={{ minWidth: 180 }}
              options={roomOptions} />
          )}
          {isPaused && <Tag color="orange" style={{ background: 'rgba(250,173,20,0.15)', border: 'none' }}>🟡 已暂停</Tag>}
          {isStreaming && <Tag color="red" style={{ background: 'rgba(255,77,79,0.15)', border: 'none' }}>🔴 推流中</Tag>}
          {!isStreaming && !isPaused && <Tag color="default" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>⚪ 未开播</Tag>}
        </Space>

        {isStreaming && selectedRoomId && (
          <Space size={6}>
            <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>中控指令:</Text>
            <Tag style={{ fontSize: 10, background: controlCommands.danmakuEnabled ? 'rgba(82,196,26,0.1)' : 'rgba(255,77,79,0.1)', color: controlCommands.danmakuEnabled ? '#52c41a' : '#ff4d4f', border: 'none' }}>
              {controlCommands.danmakuEnabled ? '💬 弹幕开' : '🔇 弹幕关'}
            </Tag>
            <Tag style={{ fontSize: 10, background: controlCommands.autoReview ? 'rgba(24,144,255,0.1)' : 'rgba(255,255,255,0.04)', color: controlCommands.autoReview ? '#1890ff' : 'rgba(255,255,255,0.3)', border: 'none' }}>
              {controlCommands.autoReview ? '🤖 自动审' : '👤 手动审'}
            </Tag>
            {controlCommands.checkInActive && (
              <Tag style={{ fontSize: 10, background: 'rgba(114,46,209,0.12)', color: '#b37feb', border: 'none' }}>
                📋 签到
              </Tag>
            )}
            {controlCommands.countdown > 0 && (
              <Tag style={{ fontSize: 10, background: 'rgba(250,173,20,0.12)', color: '#faad14', border: 'none', fontWeight: 700 }}>
                ⏱ {controlCommands.countdown}s
              </Tag>
            )}
          </Space>
        )}

        <Space size={10}>
          <Button icon={micEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
            danger={!micEnabled}
            onClick={handleToggleMic}
            type={micEnabled ? 'default' : 'text'}
            style={micEnabled ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' } : {}}>
            {micEnabled ? '麦克风' : '已静音'}
          </Button>
          <Button icon={<CameraOutlined />}
            danger={!cameraEnabled}
            onClick={handleToggleCamera}
            type={cameraEnabled ? 'default' : 'text'}
            style={cameraEnabled ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' } : {}}>
            {cameraEnabled ? '摄像头' : '已关闭'}
          </Button>
          <Select value={resolution} onChange={setResolution}
            style={{ width: 100 }}
            options={[
              { label: '1080P 高清', value: '1080P' },
              { label: '720P 标清', value: '720P' },
              { label: '4K 超清', value: '4K' },
            ]} />
          <Button icon={<SettingOutlined />}
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
            高级设置
          </Button>
        </Space>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <Row gutter={14}>
          {/* ==================== 左：推流画面 ==================== */}
          <Col span={10}>
            <Card
              title={<Space><CameraOutlined /> 推流画面预览</Space>}
              style={{ background: '#161b22', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}
              headStyle={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              bodyStyle={{ padding: 12 }}
            >
              <StreamPreview
                resolution={resolution}
                isStreaming={isStreaming}
                beautyEnabled={beautyEnabled}
                onToggleBeauty={handleToggleBeauty}
              />

              <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* 美颜设置 */}
              <div style={{ marginBottom: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>美颜</Text>
                <Row align="middle" gutter={10} style={{ marginTop: 4 }}>
                  <Col>
                    <Switch checked={beautyEnabled} onChange={setBeautyEnabled} size="small" />
                  </Col>
                  <Col flex={1}>
                    <Slider min={0} max={100} value={beautyLevel} onChange={setBeautyLevel}
                      disabled={!beautyEnabled}
                      styles={{ track: { height: 4 }, rail: { height: 4 } }} />
                  </Col>
                </Row>
              </div>

              {/* 核心按钮 */}
              <Row gutter={10}>
                {isPaused ? (
                  // 暂停状态：恢复 + 停止
                  <>
                    <Col span={12}>
                      <Button icon={<PlayCircleOutlined />} type="primary" block size="large"
                        onClick={handleResume} style={{ height: 44, fontWeight: 600, background: '#52c41a', borderColor: '#52c41a' }}>
                        恢复推流
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button icon={<StopOutlined />} danger block size="large"
                        onClick={handleStopStream} style={{ height: 44, fontWeight: 600 }}>
                        结束直播
                      </Button>
                    </Col>
                  </>
                ) : isStreaming ? (
                  // 直播中：暂停 + 停止
                  <>
                    <Col span={12}>
                      <Button icon={<PauseCircleOutlined />} block size="large"
                        onClick={handlePause} style={{ height: 44, fontWeight: 600, background: 'rgba(250,173,20,0.15)', color: '#faad14', border: '1px solid rgba(250,173,20,0.3)' }}>
                        暂停
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button icon={<StopOutlined />} type="primary" danger block size="large"
                        onClick={handleStopStream} style={{ height: 44, fontWeight: 600 }}>
                        停止推流
                      </Button>
                    </Col>
                  </>
                ) : (
                  // 未开播：开始推流
                  <>
                    <Col span={12}>
                      <Button icon={<PlayCircleOutlined />} type="primary" block size="large"
                        onClick={handleStartStream}
                        disabled={!selectedRoomId}
                        style={{ height: 44, fontWeight: 600, background: '#ff4d4f', borderColor: '#ff4d4f' }}>
                        开始推流
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button icon={<PauseCircleOutlined />} block size="large" disabled
                        style={{ height: 44, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        暂停
                      </Button>
                    </Col>
                  </>
                )}
              </Row>

              {/* 数据概览 */}
              <Row gutter={6} style={{ marginTop: 14 }}>
                <Col span={6}>
                  <div style={{ textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <EyeOutlined style={{ color: '#1677ff', marginBottom: 4 }} />
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{currentStats?.onlineViewers || 0}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>在线</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <HeartOutlined style={{ color: '#ff4d4f', marginBottom: 4 }} />
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{Math.floor((currentStats?.likes || 0) / 1000)}k</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>点赞</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <MessageOutlined style={{ color: '#fa8c16', marginBottom: 4 }} />
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{currentStats?.comments || 0}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>弹幕</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <ShoppingCartOutlined style={{ color: '#52c41a', marginBottom: 4 }} />
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>¥{Math.floor((currentStats?.revenue || 0) / 100) / 10}k</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>成交</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* ==================== 中：商品讲解控制（仅直播带货） ==================== */}
          {currentSession?.liveType === 'shopping' && (
          <Col span={7}>
            <Card
              title={<Space><ShoppingCartOutlined /> 商品讲解控制</Space>}
              style={{ background: '#161b22', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}
              headStyle={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              bodyStyle={{ padding: 12, maxHeight: 520, overflowY: 'auto' }}
            >
              {/* 当前讲解 */}
              {explainingProductId && (
                <div style={{
                  padding: 10, marginBottom: 12,
                  background: 'rgba(255,77,79,0.1)', borderRadius: 8,
                  border: '1px solid rgba(255,77,79,0.25)',
                }}>
                  <div style={{ color: '#ff4d4f', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                    🔴 当前讲解
                  </div>
                  <Row align="middle" justify="space-between">
                    <Col>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
                        {liveProducts.find(p => p.id === explainingProductId)?.productName || '-'}
                      </div>
                      <div style={{ color: '#ff4d4f', fontSize: 16, fontWeight: 700 }}>
                        ¥{liveProducts.find(p => p.id === explainingProductId)?.livePrice || '-'}
                      </div>
                    </Col>
                    <Col>
                      <Button danger onClick={handleStopExplain}>
                        <StopOutlined /> 结束讲解
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}

              {/* 待讲解列表 */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                    讲解进度
                  </Text>
                  {explainLock?.holder === 'controller' && (
                    <Tag style={{ fontSize: 10, background: 'rgba(250,173,20,0.12)', color: '#faad14', border: 'none' }}>
                      🔒 中控台讲解中
                    </Tag>
                  )}
                </div>
                <Row gutter={6}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: 6, background: 'rgba(255,77,79,0.08)', borderRadius: 6, border: '1px solid rgba(255,77,79,0.15)' }}>
                      <div style={{ color: '#ff4d4f', fontSize: 16, fontWeight: 700 }}>{explainingProductId ? 1 : 0}</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>讲解中</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: 6, background: 'rgba(82,196,26,0.08)', borderRadius: 6, border: '1px solid rgba(82,196,26,0.15)' }}>
                      <div style={{ color: '#52c41a', fontSize: 16, fontWeight: 700 }}>{explainHistory.length}</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>已讲解</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', padding: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700 }}>
                        {roomProducts.length - (explainingProductId ? 1 : 0) - explainHistory.filter(id => roomProducts.find(p => p.id === id)).length}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>待讲解</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* 商品列表 */}
              <div style={{ marginBottom: 12 }}>
                {productStatuses.map(p => (
                  <div key={p.id} style={{
                    marginBottom: 6, padding: 8, borderRadius: 6,
                    background: p.explainStatus === 'explaining' ? 'rgba(255,77,79,0.08)' :
                                 p.explainStatus === 'explained' ? 'rgba(82,196,26,0.04)' :
                                 'rgba(255,255,255,0.03)',
                    border: p.explainStatus === 'explaining' ? '1px solid rgba(255,77,79,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Space size={4}>
                          {p.explainStatus === 'explaining' && <PushpinOutlined style={{ color: '#ff4d4f' }} />}
                          {p.explainStatus === 'explained' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{p.productName}</span>
                        </Space>
                        <div>
                          <span style={{ color: '#ff4d4f', fontSize: 14, fontWeight: 700 }}>¥{p.livePrice}</span>
                          <Tag style={{
                            marginLeft: 6, fontSize: 9, background: 'transparent',
                            color: p.explainStatus === 'explaining' ? '#ff4d4f' :
                                   p.explainStatus === 'explained' ? '#52c41a' : 'rgba(255,255,255,0.3)',
                            border: 'none',
                          }}>
                            {p.explainStatus === 'explaining' ? '讲解中' : p.explainStatus === 'explained' ? '已讲解' : '待讲解'}
                          </Tag>
                        </div>
                      </Col>
                      <Col>
                        {p.explainStatus === 'explaining' ? (
                          <Button size="small" danger onClick={handleStopExplain}>结束</Button>
                        ) : explainLock?.holder === 'controller' ? (
                          <Tooltip title={`中控台正在讲解，暂不可操作`}>
                            <Button size="small" disabled style={{ opacity: 0.4 }}>
                              开始讲解
                            </Button>
                          </Tooltip>
                        ) : (
                          <Button size="small" type="primary" ghost danger
                            onClick={() => handleStartExplain(p.id)}>
                            开始讲解
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
                {roomProducts.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: 20, fontSize: 11 }}>
                    暂无商品，请在中控台「商品操控」中添加商品
                  </div>
                )}
              </div>

              {/* 下一件 */}
              <Button block icon={<RightOutlined />} onClick={handleNextProduct}
                disabled={!productStatuses.some(p => p.explainStatus === 'pending')}
                style={{
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                下一件商品
              </Button>
            </Card>
          </Col>
          )}

          {/* ==================== 右：实时反馈 + 弹幕 ==================== */}
          <Col span={currentSession?.liveType === 'shopping' ? 7 : 17}>
            <Card
              title={<Space><MessageOutlined /> 实时反馈</Space>}
              style={{ background: '#161b22', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}
              headStyle={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              bodyStyle={{ padding: 12, position: 'relative', overflow: 'hidden', maxHeight: 520 }}
            >
              {/* 飘心 */}
              {hearts.map(h => <FloatingHeart key={h.id} id={h.id} x={h.x} />)}
              {/* 礼物通知 */}
              {gifts.slice(-1).map(g => (
                <GiftNotification key={g.id} gifter={g.gifter} giftName={g.giftName}
                  onDone={() => setGifts(prev => prev.filter(x => x.id !== g.id))} />
              ))}

              {/* 弹幕滚动 */}
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {approvedComments.map(c => (
                  <div key={c.id} style={{
                    marginBottom: 4, padding: '4px 8px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: 4,
                  }}>
                    <Space size={4}>
                      <Tag color="blue" style={{ fontSize: 9, lineHeight: '14px', margin: 0 }}>{c.user}</Tag>
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{c.content}</span>
                    </Space>
                  </div>
                ))}
              </div>

              {/* 动画 keyframes */}
              {hearts.map(h => (
                <style key={h.id}>{`
                  @keyframes floatUp_${h.id} {
                    0% { transform: translateY(0) scale(0.5); opacity: 1; }
                    50% { transform: translateY(-180px) scale(1.2); opacity: 0.8; }
                    100% { transform: translateY(-350px) scale(0.7); opacity: 0; }
                  }
                `}</style>
              ))}
              <style>{`
                @keyframes giftSlideIn {
                  0% { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.8); }
                  100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                }
              `}</style>
            </Card>
          </Col>
        </Row>

        {/* ==================== 底部状态栏 ==================== */}
        <div style={{
          marginTop: 16, padding: '12px 20px',
          background: 'rgba(255,255,255,0.03)', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Space size={16}>
            <Space size={4}>
              <WifiOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>网络延迟 12ms</span>
            </Space>
            <Space size={4}>
              <ApiOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>码率 4500Kbps</span>
            </Space>
            <Space size={4}>
              <CameraOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>帧率 {30}fps</span>
            </Space>
          </Space>
          <Space size={10}>
            <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>
              {currentStats?.duration || '00:00'} · 推流时长
            </Text>
            {explainingProductId && (
              <Tag color="red" style={{ animation: 'pulse 1.5s infinite' }}>
                讲解中 · {liveProducts.find(p => p.id === explainingProductId)?.productName}
              </Tag>
            )}
          </Space>
        </div>
      </div>

      <style>{`@keyframes pulse {0%,100%{opacity:1} 50%{opacity:0.6}}`}</style>
    </div>
  );
};

export default BroadcasterStreamPage;
