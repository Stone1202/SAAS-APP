/**
 * AppLiveRoomPage — APP 端直播模块（列表 + 观众看播）
 *
 * V3.0 布局升级：参考淘宝直播风格
 *   - 底部操作栏改为"说点什么"+图标按钮
 *   - 讲解卡片右下角弹出
 *   - 左下角固定弹幕区
 *   - 顶部信息丰富化
 *   - 优惠券大卡片遮罩弹窗
 *   - 新增评论输入面板（快捷表情）
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Input, Badge, Tag, Typography, Space, Drawer,
  message, Tabs, Tooltip, Modal,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, UserOutlined,
  ShoppingCartOutlined, HeartOutlined, HeartFilled,
  MessageOutlined, CloseOutlined, SendOutlined,
  FireOutlined, GiftOutlined,
  ShareAltOutlined, StarOutlined, AppstoreOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { useLiveStore } from '@/stores/liveStore';
import { restoreLiveState } from '@/stores/syncEngine';
import { DanmakuLayer } from '@/components/live';
import type { DanmakuItem } from '@/components/live';

const { Text, Title } = Typography;

// ==================== 工具函数 ====================
const formatNum = (n: number): string => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
};

// ==================== 手机框架包装 ====================
const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 390, height: 844, margin: '0 auto',
    borderRadius: 36, overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 3px #1a1a2e, 0 0 0 6px #333',
    background: '#0a0a1a',
    position: 'relative',
  }}>
    {/* 状态栏 */}
    <div style={{
      height: 44, background: '#0a0a1a',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '0 24px',
      color: '#fff', fontSize: 12, fontWeight: 600,
    }}>
      <span>9:41</span>
      <Space size={6}>
        <span style={{ fontSize: 10 }}>●●●●○</span>
        <span>WiFi</span>
        <span>🔋</span>
      </Space>
    </div>
    {/* 内容区 */}
    <div style={{ height: 800, overflowY: 'auto', position: 'relative', background: '#0a0a1a' }}>
      {children}
    </div>
    {/* 底部横条 */}
    <div style={{
      height: 20, background: '#0a0a1a',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
    }}>
      <div style={{
        width: 130, height: 4, borderRadius: 2,
        background: 'rgba(255,255,255,0.3)', marginTop: 8,
      }} />
    </div>
  </div>
);

// ==================== AppLiveRoomPage — 直播列表 ====================
const AppLiveRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { liveRooms, initMockData } = useLiveStore();

  useEffect(() => { initMockData(); }, [initMockData]);

  const roomStats = useLiveStore(s => s.liveStats);

  const goToRoom = (roomId: string) => {
    navigate(`/app/service/live/${roomId}`);
  };

  return (
    <MobileFrame>
      {/* ===== 状态栏 + 搜索栏 ===== */}
      <div style={{ padding: '8px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>直播</Title>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            gap: 6, padding: '6px 12px',
            borderRadius: 20, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <SearchOutlined style={{ color: '#888', fontSize: 12 }} />
            <span style={{ color: '#888', fontSize: 12 }}>搜索直播间</span>
          </div>
        </div>

        {/* 顶部轮播（简化） */}
        <div style={{
          height: 140, borderRadius: 12, overflow: 'hidden',
          background: 'linear-gradient(135deg, #ff4d4f, #ff7875, #ffb6c1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 18, fontWeight: 600,
          marginBottom: 16,
        }}>
          <span>🎬 热门直播推荐</span>
        </div>

        {/* 直播列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {liveRooms.map(room => {
            const stat = roomStats[room.id] || { onlineViewers: 0, likes: 0, totalViews: 0 };
            return (
              <div
                key={room.id}
                onClick={() => goToRoom(room.id)}
                style={{
                  display: 'flex', gap: 10, padding: 10,
                  borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 100, height: 70, borderRadius: 8,
                  background: room.coverImage
                    ? 'linear-gradient(135deg, #ff4d4f, #ff7875)'
                    : 'linear-gradient(135deg, #333, #444)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, flexShrink: 0,
                }}>
                  {room.coverImage || '🎬'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {room.roomName}
                    {room.status === 'live' && (
                      <Tag color="red" style={{ fontSize: 9, lineHeight: '14px', margin: 0, padding: '0 4px' }}>
                        直播中
                      </Tag>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                    {room.merchantName || '商家直播间'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                      <EyeOutlined style={{ fontSize: 10 }} /> {formatNum(stat.onlineViewers)}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                      <HeartFilled style={{ fontSize: 10, color: '#ff4d4f' }} /> {formatNum(stat.likes)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileFrame>
  );
};

// ==================== AppLiveWatchPage — 观众看播页 ====================
const AppLiveWatchPage: React.FC = () => {
  const navigate = useNavigate();
  const roomId = window.location.pathname.split('/').pop() || '';

  // ========== 全部数据从 liveStore 消费 ==========
  const {
    liveRooms, liveSessions, comments, addComment,
    liveProducts, liveStats, updateLiveStats,
    controlCommands, explainLock,
    marketingActivities,
    updateMarketingActivity,
    initMockData,
  } = useLiveStore();

  // 当前直播间信息
  const currentRoom = useMemo(
    () => liveRooms.find(r => r.id === roomId),
    [liveRooms, roomId]
  );
  const currentSession = useMemo(
    () => liveSessions.find(s => s.roomId === roomId),
    [liveSessions, roomId]
  );
  const isPaused = currentSession?.status === 'paused';
  const isEnded = currentSession?.status === 'ended' || currentRoom?.status === 'ended';
  // 是否支持购物车/商品讲解（仅直播带货类型，基于关联场次 liveType）
  const showShoppingFeatures = currentSession?.liveType === 'shopping';

  // 已审核弹幕（飘屏用）
  const approvedComments: DanmakuItem[] = useMemo(
    () => comments
      .filter(c => c.status === 'approved' && c.roomId === roomId)
      .slice(-20)
      .map(c => ({ id: c.id, user: c.user || '观众', content: c.content })),
    [comments, roomId]
  );

  // 本房间全部评论（评论面板用）
  const roomComments = useMemo(
    () => comments.filter(c => c.roomId === roomId).slice(-50),
    [comments, roomId]
  );

  // 本房间商品
  const roomProducts = useMemo(
    () => liveProducts.filter(p => p.roomId === roomId),
    [liveProducts, roomId]
  );

  // 当前讲解的商品（explainLock 驱动）
  const explainingProduct = useMemo(() => {
    if (!explainLock) return null;
    const product = liveProducts.find(p => p.id === explainLock.productId);
    if (!product || product.roomId !== roomId) return null;
    return product;
  }, [explainLock, liveProducts, roomId]);

  // 本房间活跃优惠券
  const activeCoupon = useMemo(() => {
    const act = marketingActivities.find(
      a => a.roomId === roomId && a.status === 'active' && a.type === 'coupon'
    );
    if (!act) return null;
    return { activityName: act.activityName || '优惠券', content: act.content || '限时优惠' };
  }, [marketingActivities, roomId]);

  // 本房间全部营销活动（活动面板用）
  const roomActivities = useMemo(
    () => marketingActivities.filter(a => a.roomId === roomId && a.status === 'active'),
    [marketingActivities, roomId]
  );

  // 最近3条审核通过的弹幕（左下角展示用）
  const recentDanmaku = approvedComments.slice(-3);

  // 本房间实时统计（端到端：有真实数据就展示，没有就是 0）
  const roomStats = liveStats[roomId];

  // ========== 本地交互状态 ==========
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showBag, setShowBag] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [couponClaimed, setCouponClaimed] = useState(false);
  const [explainCardVisible, setExplainCardVisible] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

  const commentInputRef = useRef<any>(null);

  // 初始化 mock 数据
  useEffect(() => {
    initMockData();
    // 从 localStorage 恢复 PC 中控台同步的直播状态（同上浏览器/跨标签页兜底）
    const snapshot = restoreLiveState();
    if (snapshot?.liveRooms?.length) {
      useLiveStore.setState({
        liveRooms: snapshot.liveRooms,
        liveSessions: snapshot.liveSessions || [],
        liveProducts: snapshot.liveProducts || [],
        marketingActivities: snapshot.marketingActivities || [],
        interactionConfigs: snapshot.interactionConfigs || [],
        broadcastPlans: snapshot.broadcastPlans || [],
        comments: snapshot.comments || [],
        liveStats: snapshot.liveStats || {},
        explainLock: snapshot.explainLock || null,
        controlCommands: snapshot.controlCommands || [],
      });
    }
  }, []);

  // explainLock 变化时自动弹出/关闭讲解卡片
  useEffect(() => {
    if (explainLock && explainingProduct) {
      setExplainCardVisible(true);
    } else {
      setExplainCardVisible(false);
    }
  }, [explainLock, explainingProduct]);

  // 3s 轮询实时数据 —— 基于本房间真实数据小幅波动
  useEffect(() => {
    if (!roomId) return;
    const ticker = setInterval(() => {
      const store = useLiveStore.getState();
      const current = store.liveStats[roomId];
      if (!current) return; // 房间尚无统计数据，跳过轮询
      store.updateLiveStats(roomId, {
        onlineViewers: Math.max(100, (current.onlineViewers || 0) + Math.floor(Math.random() * 50 - 25)),
        likes: (current.likes || 0) + Math.floor(Math.random() * 5),
        totalViews: (current.totalViews || 0) + Math.floor(Math.random() * 20),
      });
    }, 3000);
    return () => clearInterval(ticker);
  }, [roomId]);

  // explainLock 变化 → 弹出讲解卡
  useEffect(() => {
    if (explainingProduct) {
      setExplainCardVisible(true);
    }
  }, [explainLock?.productId, explainLock?.holder, explainingProduct]);

  // 优惠券变化 → 弹出
  useEffect(() => {
    if (activeCoupon && !couponClaimed) {
      // 自动弹出由条件渲染控制
    }
  }, [activeCoupon, couponClaimed]);

  // ========== 操作回调 ==========
  const handleSendComment = useCallback(() => {
    if (!commentText.trim() || !roomId) return;
    addComment({
      id: `app-comment-${Date.now()}`,
      roomId,
      userId: 'current-user',
      user: '我',
      content: commentText.trim(),
      status: 'pending',
      createTime: new Date().toISOString(),
    });
    // 同步更新评论计数到 liveStats
    const currentComments = roomStats?.comments || 0;
    updateLiveStats(roomId, { comments: currentComments + 1 });
    setCommentText('');
    setShowCommentInput(false);
    message.success('评论已发送，等待主播审核');
  }, [commentText, roomId, addComment, updateLiveStats, roomStats?.comments]);

  const handleAddToCart = useCallback((product: any) => {
    setCartCount(c => c + 1);
    message.success(`已加入购物袋：${product.productName}`);
  }, []);

  const handleBuyNow = useCallback((product: any) => {
    message.success(`正在跳转下单：${product.productName}`);
  }, []);

  const handleClaimCoupon = useCallback((coupon: { activityName: string; content: string }) => {
    if (couponClaimed) return;
    const act = marketingActivities.find(a => a.roomId === roomId && a.status === 'active');
    if (act) {
      updateMarketingActivity(act.id, { status: 'ended' });
      setCouponClaimed(true);
      message.success(`已领取：${coupon.activityName}`);
    }
  }, [roomId, couponClaimed, marketingActivities, updateMarketingActivity]);

  // ========== 底部操作栏图标样式 ==========
  const iconBtnStyle: React.CSSProperties = {
    width: 42, height: 42, borderRadius: '50%',
    background: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', backdropFilter: 'blur(8px)',
  };

  const moreItemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12,
    cursor: 'pointer', padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
  };

  const handleLike = useCallback(() => {
    if (!liked) {
      setLiked(true);
      // 只通过 store 更新点赞数，避免本地 state 与 store 双重计数
      updateLiveStats(roomId, { likes: (roomStats?.likes || 0) + 1 });
    }
  }, [liked, roomId, roomStats?.likes, updateLiveStats]);

  // ========== 已暂停直播间处理 ==========
  if (isPaused) {
    return (
      <MobileFrame>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 32px', color: '#aaa', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏸️</div>
          <Text style={{ color: '#aaa', display: 'block', marginBottom: 8, fontSize: 16, fontWeight: 600 }}>直播暂停中</Text>
          <Text style={{ color: '#666', fontSize: 12 }}>主播正在休息，请稍候…</Text>
          {currentRoom && (
            <div style={{ marginTop: 32, padding: '16px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'left', minWidth: 200 }}>
              <Text style={{ color: '#999', fontSize: 11 }}>{currentRoom?.roomName}</Text>
              <div style={{ color: '#666', fontSize: 10, marginTop: 4 }}>
                {currentSession?.topic || currentSession?.planName}
              </div>
            </div>
          )}
        </div>
      </MobileFrame>
    );
  }

  // ========== 已结束直播间处理 ==========
  if (isEnded) {
    return (
      <MobileFrame>
        <div style={{ textAlign: 'center', padding: '80px 32px', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
          <Text style={{ color: '#aaa', display: 'block', marginBottom: 8 }}>直播已结束</Text>
          <Button type="primary" ghost onClick={() => navigate('/app/live')}>返回列表</Button>
        </div>
      </MobileFrame>
    );
  }

  const displayLikes = roomStats?.likes || 0;
  const displayViewers = Math.max(100, roomStats?.onlineViewers || 0);

  return (
    <MobileFrame>
      {/* ===== 视频画面区（满屏，操作栏浮层叠在上方） ===== */}
      <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
        {/* 模拟直播背景 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'url("https://images.unsplash.com/photo-1536637706722-44f847bf0ede?w=800&h=600&fit=crop") center/cover no-repeat',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(10,10,26,0.3) 0%, rgba(10,10,26,0.05) 30%, rgba(10,10,26,0.05) 60%, rgba(10,10,26,0.6) 100%)',
          }} />
          {/* 动态光效 */}
          <div style={{
            position: 'absolute', top: '30%', left: '20%',
            width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,77,79,0.15) 0%, transparent 70%)',
            animation: 'liveGlowLeft 3s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', top: '40%', right: '15%',
            width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(100,80,255,0.12) 0%, transparent 70%)',
            animation: 'liveGlowRight 4s ease-in-out infinite',
          }} />
        </div>

        {/* 弹幕飘屏 — 来自 liveStore */}
        {controlCommands.danmakuEnabled !== false && (
          <DanmakuLayer
            comments={approvedComments}
            userColor="#ffd700"
            maxItems={15}
          />
        )}

        {/* ===== 商品讲解卡 — 右下角（explainLock 自动驱动） ===== */}
        {explainCardVisible && explainingProduct && (
          <div style={{
            position: 'absolute', bottom: 56, right: 8,
            zIndex: 20, width: 160,
            animation: 'slideInRight 0.3s ease-out',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fff5f0, #fff)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(255,77,79,0.25)',
            }}>
              {/* 顶部标签 */}
              <div style={{
                background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                padding: '4px 10px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                  {explainLock?.holder === 'controller' ? '中控台讲解' : '主播讲解'}
                </span>
                <CloseOutlined
                  style={{ color: '#fff', fontSize: 10, cursor: 'pointer' }}
                  onClick={() => setExplainCardVisible(false)}
                />
              </div>
              {/* 商品信息 */}
              <div style={{ padding: '8px 10px' }}>
                <div style={{
                  width: '100%', height: 70, borderRadius: 8,
                  background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, marginBottom: 6,
                }}>
                  {(explainingProduct as any).productImage || '📦'}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: '#333',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginBottom: 2,
                }}>
                  {explainingProduct.productName}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ color: '#ff4d4f', fontSize: 15, fontWeight: 700 }}>
                    ¥{explainingProduct.livePrice}
                  </span>
                  <span style={{ color: '#999', fontSize: 10, textDecoration: 'line-through' }}>
                    ¥{explainingProduct.normalPrice}
                  </span>
                </div>
                <Button
                  type="primary" danger block size="small"
                  style={{ marginTop: 6, borderRadius: 14, height: 28, fontSize: 12, fontWeight: 600 }}
                  onClick={() => explainingProduct && handleBuyNow(explainingProduct)}
                >
                  抢
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== 优惠券弹窗（升级：更大更精致 + 金色渐变 + 动效） ===== */}
        {activeCoupon && !couponClaimed && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 30, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.25s ease',
          }}>
            <div style={{
              width: 300,
              background: 'linear-gradient(160deg, #1a1a3e 0%, #2d1b3e 50%, #3d1a1a 100%)',
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative',
              border: '2px solid rgba(255,215,0,0.3)',
              boxShadow: '0 8px 40px rgba(255,77,79,0.3), 0 0 80px rgba(255,215,0,0.1)',
              animation: 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
            }}>
              {/* 顶部金色光晕 */}
              <div style={{
                position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
                width: 200, height: 80,
                background: 'radial-gradient(ellipse, rgba(255,215,0,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <CloseOutlined
                onClick={() => setCouponClaimed(true)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  color: 'rgba(255,255,255,0.6)', fontSize: 16,
                  cursor: 'pointer', zIndex: 2,
                }}
              />
              {/* 头部 */}
              <div style={{
                padding: '28px 20px 20px', textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(255,215,0,0.1), transparent)',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,77,79,0.2))',
                  margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, border: '2px solid rgba(255,215,0,0.3)',
                }}>
                  🎁
                </div>
                <div style={{ color: '#ffd700', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  {activeCoupon.activityName}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.5 }}>
                  限时优惠 · 先到先得
                </div>
              </div>
              {/* 金额区 */}
              <div style={{
                margin: '0 20px', padding: '16px 0',
                background: 'linear-gradient(135deg, rgba(255,77,79,0.08), rgba(255,215,0,0.06))',
                borderRadius: 12,
                textAlign: 'center',
                border: '1px dashed rgba(255,215,0,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
                  <span style={{ color: '#ffd700', fontSize: 14, fontWeight: 600 }}>¥</span>
                  <span style={{
                    color: '#ffd700', fontSize: 52, fontWeight: 800, lineHeight: 1,
                    textShadow: '0 2px 12px rgba(255,215,0,0.3)',
                  }}>
                    {activeCoupon.content.match(/\d+/)?.[0] || '10'}
                  </span>
                </div>
                <div style={{
                  marginTop: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13,
                  background: 'rgba(255,215,0,0.1)',
                  padding: '4px 12px', borderRadius: 10,
                  display: 'inline-block',
                }}>
                  满{activeCoupon.content.match(/\d+/g)?.[1] || '99'}可用
                </div>
              </div>
              {/* 按钮 */}
              <div style={{ padding: '18px 20px 22px' }}>
                <Button
                  type="primary" block size="large" shape="round"
                  style={{
                    height: 48, fontWeight: 700, fontSize: 16,
                    background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                    borderColor: 'transparent',
                    color: '#1a1a3e',
                    boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                  }}
                  onClick={() => handleClaimCoupon(activeCoupon)}
                >
                  一键领取
                </Button>
                <div style={{ textAlign: 'center', marginTop: 10, color: 'rgba(255,255,255,0.35)', fontSize: 10, cursor: 'pointer' }}
                  onClick={() => setCouponClaimed(true)}>
                  放弃优惠
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 顶部：主播信息栏 ===== */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          zIndex: 10, padding: '8px 12px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          {/* 左侧：主播信息+热卖 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* 主播信息 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,0,0,0.45)', borderRadius: 24,
              padding: '5px 14px 5px 5px',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 0 0 2px rgba(255,77,79,0.3)',
                animation: 'avatarPulse 2s ease-in-out infinite',
              }}>
                <UserOutlined style={{ color: '#fff' }} />
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                    {currentRoom?.roomName || '直播间'}
                  </span>
                  <span style={{
                    fontSize: 10, color: '#fff', background: '#ff4d4f',
                    padding: '1px 5px', borderRadius: 4, fontWeight: 600,
                  }}>
                    关注
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1 }}>
                  {currentSession?.topic ? `${currentSession.topic} · ` : ''}{formatNum(1280)} 粉丝
                </div>
              </div>
            </div>
            {/* 热卖标签 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(0,0,0,0.35)', borderRadius: 16,
              padding: '3px 10px',
              backdropFilter: 'blur(8px)',
              width: 'fit-content',
            }}>
              <FireOutlined style={{ color: '#ff4d4f', fontSize: 14 }} />
              <span style={{ color: '#ffd700', fontSize: 12, fontWeight: 700 }}>热卖</span>
              <span style={{
                color: '#ff4d4f', fontSize: 12, fontWeight: 700,
                background: 'rgba(255,77,79,0.15)', padding: '1px 5px',
                borderRadius: 8,
              }}>
                x283
              </span>
            </div>
          </div>
          {/* 右侧：观看人数 + 分享 + 关闭 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(0,0,0,0.4)', borderRadius: 14,
              padding: '4px 10px',
              backdropFilter: 'blur(8px)',
            }}>
              <EyeOutlined style={{ color: '#69b1ff', fontSize: 12 }} />
              <span style={{ color: '#69b1ff', fontSize: 12, fontWeight: 600 }}>
                {formatNum(displayViewers)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>观看</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                onClick={() => message.success('分享链接已复制')}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', backdropFilter: 'blur(8px)',
                }}
              >
                <ShareAltOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => navigate('/app/live')}
                style={{
                  color: '#fff', background: 'rgba(0,0,0,0.4)',
                  borderRadius: '50%', width: 28, height: 28,
                  padding: 0, backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              />
            </div>
          </div>
        </div>

        {/* ===== 左下角：弹幕列表 ===== */}
        <div style={{
          position: 'absolute', bottom: 52, left: 8, right: 100,
          zIndex: 10, display: 'flex', flexDirection: 'column',
          gap: 4,
        }}>
          {recentDanmaku.map((c) => (
            <div key={c.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 12,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(4px)',
              fontSize: 11, color: '#fff',
              width: 'fit-content', maxWidth: '100%',
              wordBreak: 'break-all',
            }}>
              <span style={{ color: '#ffd700', fontWeight: 500, flexShrink: 0 }}>{c.user}</span>
              <span style={{ opacity: 0.9 }}>{c.content}</span>
            </div>
          ))}
        </div>

        {/* ===== 底部操作栏（升级：抖音风格） ===== */}
        <div style={{
          position: 'absolute', bottom: 6, left: 12, right: 12,
          zIndex: 10, display: 'flex', alignItems: 'flex-end', gap: 10,
        }}>
          {/* 左侧：评论输入 */}
          <div
            onClick={() => setShowCommentInput(true)}
            style={{
              flex: 1, height: 40, borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 16px',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13, cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 2,
            }}
          >
            <MessageOutlined style={{ fontSize: 15 }} />
            说点什么...
          </div>
          {/* 右侧：操作列（与输入框底部对齐） */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            {/* 九宫格 */}
            <div onClick={() => {
              Modal.info({
                title: '更多功能', icon: null,
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {showShoppingFeatures && (
                    <div onClick={() => { Modal.destroyAll(); setShowBag(true); }} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <ShoppingCartOutlined style={{ fontSize: 20, color: '#ff7875' }} />
                      <span>购物袋</span>
                    </div>
                    )}
                    <div onClick={() => { Modal.destroyAll(); setShowComments(true); }} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <CommentOutlined style={{ fontSize: 20, color: '#69b1ff' }} />
                      <span>评论列表</span>
                    </div>
                    <div onClick={() => { Modal.destroyAll(); setShowActivities(true); }} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0' }}>
                      <GiftOutlined style={{ fontSize: 20, color: '#ffd700' }} />
                      <span>查看活动</span>
                    </div>
                  </div>
                ),
                okButtonProps: { style: { display: 'none' } },
                maskClosable: true,
              });
            }} style={{ ...iconBtnStyle, width: 40, height: 40 }}>
              <AppstoreOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            {/* 爱心 + 计数 */}
            <div onClick={handleLike} style={{ ...iconBtnStyle, flexDirection: 'column', gap: 1, height: 'auto', padding: '5px 0', width: 40 }}>
              {liked ? (
                <HeartFilled style={{ color: '#ff4d4f', fontSize: 22 }} />
              ) : (
                <HeartOutlined style={{ color: '#fff', fontSize: 22 }} />
              )}
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>{formatNum(displayLikes)}</span>
            </div>
            {/* 购物袋 + 计数（仅带货直播） */}
            {showShoppingFeatures && (
            <div onClick={() => setShowBag(true)} style={{ ...iconBtnStyle, flexDirection: 'column', gap: 1, height: 'auto', padding: '5px 0', width: 40 }}>
              <ShoppingCartOutlined style={{ color: '#fff', fontSize: 22 }} />
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>{cartCount}</span>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 评论输入面板（底部弹出） ===== */}
      <Drawer
        title={null}
        placement="bottom"
        height="auto"
        open={showCommentInput}
        onClose={() => setShowCommentInput(false)}
        closable={false}
        styles={{
          body: { padding: '12px 16px', background: '#1a1a2e' },
          header: { display: 'none' },
          wrapper: { maxWidth: 390, left: '50%', transform: 'translateX(-50%)' },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              ref={commentInputRef}
              placeholder="说点什么..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onPressEnter={handleSendComment}
              autoFocus
              style={{
                flex: 1, borderRadius: 20, height: 38,
                background: 'rgba(255,255,255,0.08)',
                border: 'none', color: '#fff',
              }}
            />
            <Button
              type="primary"
              shape="round"
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              style={{ background: '#ff7875', borderColor: '#ff7875', height: 38, padding: '0 20px' }}
            >
              发送
            </Button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['666', '👏', '哈哈', '爱了', '🔥', '❤️', '主播好棒', '想要'].map(emoji => (
              <div
                key={emoji}
                onClick={() => {
                  setCommentText(prev => prev + emoji);
                  commentInputRef.current?.focus();
                }}
                style={{
                  padding: '6px 14px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#aaa', fontSize: 12, cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </Drawer>

      {/* ===== 评论面板（底部Drawer） ===== */}
      <Drawer
        title={null}
        placement="bottom"
        height="50%"
        open={showComments}
        onClose={() => setShowComments(false)}
        closable={false}
        styles={{
          body: { padding: 0, background: '#0d0d1f' },
          header: { display: 'none' },
          wrapper: { maxWidth: 390, left: '50%', transform: 'translateX(-50%)' },
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '10px 16px',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Text style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
              评论 ({roomComments.length})
            </Text>
            <CloseOutlined
              style={{ color: '#999', cursor: 'pointer' }}
              onClick={() => setShowComments(false)}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
            {roomComments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#555', padding: '30px 0', fontSize: 12 }}>
                暂无评论，快来发一条吧
              </div>
            ) : (
              roomComments.map(c => (
                <div key={c.id} style={{
                  display: 'flex', gap: 8, marginBottom: 12,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: c.status === 'approved'
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,200,0,0.05)',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, flexShrink: 0, color: '#fff',
                  }}>
                    {c.user?.[0] || '匿'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ color: '#69b1ff', fontSize: 11, fontWeight: 500 }}>
                        {c.user || '匿名'}
                      </span>
                      {c.status === 'pending' && (
                        <Tag color="gold" style={{ fontSize: 9, lineHeight: '14px', margin: 0, padding: '0 4px' }}>
                          审核中
                        </Tag>
                      )}
                    </div>
                    <div style={{ color: '#ccc', fontSize: 12 }}>{c.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 8,
            background: '#0d0d1f',
          }}>
            <Input
              placeholder="说点什么..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onPressEnter={handleSendComment}
              style={{
                borderRadius: 20, height: 34,
                background: 'rgba(255,255,255,0.06)',
                border: 'none', color: '#fff',
              }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              size="small"
              style={{ background: '#ff7875', borderColor: '#ff7875' }}
            />
          </div>
        </div>
      </Drawer>

      {/* ===== 购物袋 Drawer ===== */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 600 }}>购物袋 ({cartCount})</Text>
            <CloseOutlined onClick={() => setShowBag(false)} style={{ color: '#999', cursor: 'pointer' }} />
          </div>
        }
        placement="bottom"
        height="55%"
        open={showBag}
        onClose={() => setShowBag(false)}
        closable={false}
        styles={{
          body: { padding: '0 16px', background: '#0d0d1f' },
          header: { background: '#0d0d1f', borderBottom: '1px solid rgba(255,255,255,0.06)' },
          wrapper: { maxWidth: 390, left: '50%', transform: 'translateX(-50%)' },
        }}
      >
        {roomProducts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px 0', fontSize: 13 }}>
            购物袋是空的
          </div>
        ) : (
          <div style={{ paddingTop: 8 }}>
            {roomProducts.map(product => (
              <div
                key={product.id}
                style={{
                  display: 'flex', gap: 10, padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: 8,
                  background: 'linear-gradient(135deg, rgba(255,77,79,0.1), rgba(255,120,100,0.05))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, flexShrink: 0,
                }}>
                  {(product as any).productImage || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{product.productName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ color: '#ff7875', fontSize: 14, fontWeight: 600 }}>¥{product.livePrice}</span>
                    {(product as any).normalPrice && (
                      <span style={{ color: '#666', fontSize: 10, textDecoration: 'line-through' }}>
                        ¥{(product as any).normalPrice}
                      </span>
                    )}
                  </div>
                  {(product as any).couponTag && (
                    <div style={{ marginTop: 4 }}>
                      <Tag color="red" style={{ fontSize: 9, lineHeight: '16px', margin: 0, padding: '0 4px', borderRadius: 4 }}>
                        {(product as any).couponTag}
                      </Tag>
                    </div>
                  )}
                </div>
                <Button
                  type="primary"
                  size="small"
                  danger
                  style={{ borderRadius: 14 }}
                  onClick={() => handleBuyNow(product)}
                >
                  抢购
                </Button>
              </div>
            ))}
          </div>
        )}
        {cartCount > 0 && (
          <div style={{
            position: 'sticky', bottom: 0, padding: '12px 0',
            background: '#0d0d1f', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Button
              type="primary"
              danger
              block
              size="large"
              shape="round"
              onClick={() => { setShowBag(false); message.success('前往下单'); }}
              style={{ height: 44, fontWeight: 600 }}
            >
              立即下单 ({cartCount})
            </Button>
          </div>
        )}
      </Drawer>

      {/* ===== 活动面板（底部Drawer） ===== */}
      <Drawer
        title={null}
        placement="bottom"
        height="50%"
        open={showActivities}
        onClose={() => setShowActivities(false)}
        closable={false}
        styles={{
          body: { padding: 0, background: '#0d0d1f' },
          header: { display: 'none' },
          wrapper: { maxWidth: 390, left: '50%', transform: 'translateX(-50%)' },
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '10px 16px',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Text style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
              营销活动 ({roomActivities.length})
            </Text>
            <CloseOutlined
              style={{ color: '#999', cursor: 'pointer' }}
              onClick={() => setShowActivities(false)}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
            {roomActivities.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#555', padding: '30px 0', fontSize: 12 }}>
                暂无营销活动
              </div>
            ) : (
              roomActivities.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 12, padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: a.type === 'coupon'
                      ? 'linear-gradient(135deg, #ff9800, #ff5722)'
                      : a.type === 'flash_sale'
                        ? 'linear-gradient(135deg, #e94560, #c0392b)'
                        : 'linear-gradient(135deg, #f1c40f, #e67e22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {a.type === 'coupon' ? '🎫' : a.type === 'flash_sale' ? '⚡' : '🎁'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
                      {a.activityName}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
                      {a.content}
                    </div>
                  </div>
                  {a.type === 'coupon' && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ background: '#ff9800', borderColor: '#ff9800', borderRadius: 14 }}
                      onClick={() => handleClaimCoupon({ activityName: a.activityName, content: a.content })}
                    >
                      领取
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Drawer>

      {/* ===== 动画定义 ===== */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.7) translateY(20px); }
          60% { transform: scale(1.05) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes liveGlowLeft {
          0%, 100% { opacity: 0.6; transform: translate(0, 0) scale(1); }
          50% { opacity: 1; transform: translate(10px, -5px) scale(1.2); }
        }
        @keyframes liveGlowRight {
          0%, 100% { opacity: 0.4; transform: translate(0, 0) scale(1); }
          50% { opacity: 0.9; transform: translate(-8px, 8px) scale(1.15); }
        }
        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,77,79,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(255,77,79,0); }
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
    </MobileFrame>
  );
};

export default AppLiveRoomPage;
export { AppLiveWatchPage };
