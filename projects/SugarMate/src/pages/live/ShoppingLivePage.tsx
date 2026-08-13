/**
 * 带货直播页 — LIVE端观众视图
 * V3.0 完全对标抖音直播带货体验
 *
 * 布局（从外到内）：
 * ┌────────────────────────────────────────────┐
 * │           视频播放区（全屏背景）              │
 * │   ← 弹幕从右到左飘过                         │
 * │   ★ 商品讲解卡弹出（右上角/居中 大卡片）      │
 * │   ★ 优惠券/福袋 弹出                         │
 * ├────────────────────────────────────────────┤
 * │ 左上：主播信息头像+名字+关注按钮              │
 * │ 右上：在线人数+分享                          │
 * │ 右侧竖栏：❤点赞 → 🛜关注 → 🛒购物袋 → 📤分享 │
 * ├────────────────────────────────────────────┤
 * │ 底部抽屉：商品列表 / 评论 / 活动 Tabs        │
 * │  + 底部常驻输入栏                            │
 * └────────────────────────────────────────────┘
 */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Button, Tag, Typography, Space, Badge, Tabs, Input,
  message, Row, Col, Drawer, Progress, Tooltip,
} from 'antd';
import {
  HeartOutlined, HeartFilled, ShoppingCartOutlined,
  ShareAltOutlined, CloseOutlined, EyeOutlined,
  GiftOutlined, ThunderboltOutlined, MessageOutlined,
  StarOutlined, SendOutlined, CrownOutlined,
  PlusOutlined, MinusOutlined, PlayCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveStore } from '@/stores/liveStore';
import { DanmakuLayer, ProductExplainCard, CouponPopup } from '@/components/live';

const { Text, Title } = Typography;

// ==================== 主组件 ====================

const ShoppingLivePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    liveSessions, liveRooms, liveProducts, marketingActivities,
    interactionConfigs, comments, liveStats, controlCommands,
    initMockData, setActiveRoom, getActiveProductsByRoomId,
    getMarketingByRoomId, getInteractionsByRoomId,
    addComment, updateLiveStats, updateLiveProduct,
  } = useLiveStore();

  // 状态
  const [activeTab, setActiveTab] = useState('products');
  const [myComment, setMyComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [explainingProductId, setExplainingProductId] = useState<string | null>(null);
  const [popupCouponId, setPopupCouponId] = useState<string | null>(null);
  const [showDanmakuInput, setShowDanmakuInput] = useState(false);
  const commentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { initMockData(); }, []);

  // 数据读取
  const session = liveSessions.find(s => s.id === sessionId);
  const room = session?.roomId ? liveRooms.find(r => r.id === session.roomId) : null;
  const isPaused = session?.status === 'paused';
  const isEnded = session?.status === 'ended';
  const products = room ? getActiveProductsByRoomId(room.id) : [];
  const activities = room ? getMarketingByRoomId(room.id) : [];
  const interactions = room ? getInteractionsByRoomId(room.id) : [];
  const currentStats = room ? liveStats[room.id] : null;
  const approvedComments = useMemo(() => comments.filter(c => c.status === 'approved'), [comments]);
  const pinnedProducts = products.filter(p => p.isPinned);
  const normalProducts = products.filter(p => !p.isPinned);
  const explainingProduct = explainingProductId ? liveProducts.find(p => p.id === explainingProductId) : null;

  // 实时数据模拟
  useEffect(() => {
    if (!room) return;
    setActiveRoom(room.id);
    const t = setInterval(() => {
      const base = liveStats[room.id] || { roomId: room.id, onlineViewers: 3280, totalViews: 15680, likes: 58420, comments: 2567, revenue: 42350, orders: 815, duration: '1:12:35' };
      updateLiveStats(room.id, {
        onlineViewers: base.onlineViewers + Math.floor(Math.random() * 50) - 25,
        likes: base.likes + Math.floor(Math.random() * 120),
        comments: base.comments + (Math.random() > 0.8 ? 1 : 0),
        revenue: base.revenue + Math.floor(Math.random() * 500),
        orders: base.orders + (Math.random() > 0.85 ? 1 : 0),
      });
    }, 3000);
    return () => clearInterval(t);
  }, [room?.id]);

  // ===== 操作处理 =====
  const handleLike = () => {
    if (room) {
      const s = liveStats[room.id] || { roomId: room.id, onlineViewers: 3280, totalViews: 15680, likes: 58420, comments: 2567, revenue: 42350, orders: 815, duration: '1:12:35' };
      updateLiveStats(room.id, { likes: s.likes + 1 });
    }
    setLiked(!liked);
  };

  const handleSendComment = () => {
    if (!myComment.trim()) return;
    addComment({
      id: `shop-${Date.now()}`,
      user: '我', content: myComment.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'approved',
    });
    setMyComment('');
  };

  const handleAddToCart = (p: typeof liveProducts[0]) => {
    const existing = cartItems.find(c => c.id === p.id);
    if (existing) {
      setCartItems(cartItems.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCartItems([...cartItems, { id: p.id, name: p.productName, price: p.livePrice, qty: 1 }]);
    }
    message.success(`已加入购物袋：${p.productName}`);
    // 模拟：加入购物袋时弹出讲解卡
    setExplainingProductId(p.id);
  };

  const handleBuyNow = (p: typeof liveProducts[0]) => {
    message.success(`正在跳转结算：${p.productName} × ¥${p.livePrice}`);
  };

  const handleStartExplain = (productId: string) => {
    setExplainingProductId(productId);
  };

  const handleClaimCoupon = (a: typeof activities[0]) => {
    message.success(`优惠券已领取：${a.activityName}`);
    setPopupCouponId(null);
  };

  // 自动弹优惠券
  useEffect(() => {
    const activeCoupons = activities.filter(a => a.type === 'coupon' && a.status === 'active');
    if (activeCoupons.length > 0 && !popupCouponId) {
      const t = setTimeout(() => setPopupCouponId(activeCoupons[0].id), 5000);
      return () => clearTimeout(t);
    }
  }, [activities, popupCouponId]);

  const popupCoupon = activities.find(a => a.id === popupCouponId);

  if (!session || !room) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#999', background: '#0a0e27', minHeight: '100vh' }}>
        <PlayCircleOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', marginBottom: 16 }} />
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>该直播场次还未配置直播间</div>
        <Button type="link" onClick={() => navigate('/live')} style={{ color: '#1677ff' }}>返回直播间列表</Button>
      </div>
    );
  }

  // ========== 已暂停 ==========
  if (isPaused) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏸️</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>直播暂停中</div>
        <div style={{ fontSize: 12, color: '#666' }}>主播正在休息，请稍候…</div>
      </div>
    );
  }

  // ========== 已结束 ==========
  if (isEnded) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>直播已结束</div>
        <div style={{ fontSize: 12, color: '#666' }}>回放生成中，敬请期待</div>
        <Button type="link" onClick={() => navigate('/live')} style={{ color: '#1677ff', marginTop: 16 }}>返回直播间列表</Button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto',
      background: '#0a0a0a', minHeight: '100vh',
      position: 'relative', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif',
    }}>
      {/* ==================== 视频播放区 ==================== */}
      <div style={{
        position: 'relative', width: '100%', height: '65vh',
        background: 'linear-gradient(180deg, #1a1030 0%, #0f1a2e 30%, #162030 60%, #0a0a0a 100%)',
        overflow: 'hidden',
      }}>
        {/* 模拟视频背景 */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.3,
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(233,69,96,0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 60%, rgba(24,144,255,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.15) 0%, transparent 40%)
          `,
        }} />

        {/* 模拟主播画面 */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 140, height: 140, borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.2) 0%, rgba(233,69,96,0.2) 50%, rgba(15,52,96,0.3) 100%)',
          border: '2px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 100px rgba(233,69,96,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 60,
        }}>
          🎙
        </div>

        {/* 弹幕飘屏 */}
        {controlCommands.danmakuEnabled && (
          <DanmakuLayer comments={approvedComments.slice(-12)} />
        )}

        {/* 商品讲解卡 */}
        <ProductExplainCard
          product={explainingProduct ? {
            productName: explainingProduct.productName,
            livePrice: explainingProduct.livePrice,
            normalPrice: explainingProduct.normalPrice,
            productImage: explainingProduct.productImage,
            allocatedStock: explainingProduct.allocatedStock,
          } : null}
          onClose={() => setExplainingProductId(null)}
          onBuyNow={() => explainingProduct && handleBuyNow(explainingProduct)}
        />

        {/* 优惠券弹出 */}
        <CouponPopup
          coupon={popupCoupon ? { activityName: popupCoupon.activityName, content: popupCoupon.content } : null}
          onClaim={() => popupCoupon && handleClaimCoupon(popupCoupon)}
          onClose={() => setPopupCouponId(null)}
        />

        {/* ===== 左上：主播信息 ===== */}
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, border: '2px solid rgba(255,255,255,0.3)',
          }}>
            {sessionId?.includes('003') ? '👨‍⚕️' : '👩‍🍳'}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
              {sessionId?.includes('003') ? '张伟明医生' : '李芳芳营养师'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
              内分泌科 · 主任医师
            </div>
          </div>
          <Button
            type={followed ? 'default' : 'primary'}
            size="small" shape="round"
            onClick={() => { setFollowed(!followed); message.success(followed ? '已取消关注' : '已关注'); }}
            icon={followed ? <CrownOutlined /> : <PlusOutlined />}
            style={followed ? {
              background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)',
              height: 28, fontSize: 11,
            } : {
              background: '#ff4d4f', borderColor: '#ff4d4f', height: 28, fontSize: 11,
            }}
          >
            {followed ? '已关注' : '关注'}
          </Button>
        </div>

        {/* ===== 右上：在线人数 + 分享 ===== */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          display: 'flex', gap: 8,
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.45)', borderRadius: 12,
            padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <EyeOutlined style={{ color: '#fff', fontSize: 11 }} />
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>
              {currentStats ? (currentStats.onlineViewers / 10000).toFixed(1) + '万' : '-'}
            </span>
          </div>
          <Tooltip title="分享直播间">
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <ShareAltOutlined style={{ color: '#fff', fontSize: 14 }} />
            </div>
          </Tooltip>
        </div>

        {/* ===== 右侧操作栏 ===== */}
        <div style={{
          position: 'absolute', bottom: 80, right: 8, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          {/* 点赞 */}
          <div onClick={handleLike} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            cursor: 'pointer',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: liked ? 'rgba(233,69,96,0.3)' : 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {liked ? (
                <HeartFilled style={{ color: '#e94560', fontSize: 20 }} />
              ) : (
                <HeartOutlined style={{ color: '#fff', fontSize: 20 }} />
              )}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 }}>
              {currentStats ? Math.floor(currentStats.likes / 10000) + '.' + Math.floor((currentStats.likes % 10000) / 1000) + '万' : '-'}
            </span>
          </div>

          {/* 关注 */}
          <div onClick={() => { setFollowed(!followed); message.success(followed ? '已取消关注' : '已关注'); }} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: followed ? 'rgba(255,215,0,0.3)' : 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PlusOutlined style={{ color: followed ? '#ffd700' : '#fff', fontSize: 20 }} />
            </div>
          </div>

          {/* 购物袋 */}
          <Badge count={cartItems.reduce((s, c) => s + c.qty, 0)} size="small" styles={{ indicator: { backgroundColor: '#ff4d4f' } }}>
            <div onClick={() => setShowCart(true)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShoppingCartOutlined style={{ color: '#ffd700', fontSize: 20 }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 }}>购物袋</span>
            </div>
          </Badge>

          {/* 分享 */}
          <div onClick={() => message.success('链接已复制')} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShareAltOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 底部面板 ==================== */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '35vh', background: '#fff', borderRadius: '16px 16px 0 0',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          tabBarStyle={{ padding: '0 16px', margin: 0 }}
          items={[
            // ===== 商品 Tab =====
            {
              key: 'products',
              label: <span><ShoppingCartOutlined /> 商品 {products.length}件</span>,
              children: (
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(35vh - 86px)', padding: '0 12px' }}>
                  {/* 讲解中商品置顶 */}
                  {explainingProduct && (
                    <div style={{
                      background: 'linear-gradient(135deg, #fff0ed, #fff)',
                      borderRadius: 10,
                      border: '1.5px solid #ff4d4f',
                      padding: 12, marginBottom: 8,
                      position: 'relative',
                    }}>
                      <Tag color="red" style={{ position: 'absolute', top: -1, left: -1, borderRadius: '0 0 8px 0', fontSize: 10 }}>
                        🔴 讲解中
                      </Tag>
                      <Row align="middle" justify="space-between" style={{ marginTop: 4 }}>
                        <Col>
                          <Space size={8}>
                            <span style={{ fontSize: 28 }}>{explainingProduct.productImage || '📦'}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{explainingProduct.productName}</div>
                              <Space size={6}>
                                <Text style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 18 }}>¥{explainingProduct.livePrice}</Text>
                                <Text delete style={{ fontSize: 11, color: '#999' }}>¥{explainingProduct.normalPrice}</Text>
                                <Tag color="red" style={{ fontSize: 10, lineHeight: '16px', margin: 0 }}>
                                  -{Math.round((1 - explainingProduct.livePrice / explainingProduct.normalPrice) * 100)}%
                                </Tag>
                              </Space>
                            </div>
                          </Space>
                        </Col>
                        <Button type="primary" danger shape="round" size="small"
                          onClick={() => handleBuyNow(explainingProduct)}>抢购</Button>
                      </Row>
                    </div>
                  )}

                  {/* 置顶商品（主播推荐） */}
                  {pinnedProducts.filter(p => p.id !== explainingProductId).map(p => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 0', borderBottom: '1px solid #f5f5f5',
                    }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: 8,
                        background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, flexShrink: 0,
                      }}>
                        {p.productImage || '📦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Space size={4}>
                          <Tag color="red" style={{ fontSize: 9, lineHeight: '14px', margin: 0 }}>推荐</Tag>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{p.productName}</span>
                        </Space>
                        <div>
                          <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 14 }}>¥{p.livePrice}</span>
                          <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 10, marginLeft: 4 }}>¥{p.normalPrice}</span>
                        </div>
                      </div>
                      <Button type="primary" size="small" shape="round" danger
                        onClick={() => { handleAddToCart(p); handleStartExplain(p.id); }}>
                        讲解
                      </Button>
                    </div>
                  ))}

                  {/* 普通商品 */}
                  {normalProducts.filter(p => p.id !== explainingProductId).map(p => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 0', borderBottom: '1px solid #f5f5f5',
                    }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: 8,
                        background: '#f5f5f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, flexShrink: 0,
                      }}>
                        {p.productImage || '📦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{p.productName}</div>
                        <Space size={4}>
                          <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 14 }}>¥{p.livePrice}</span>
                          <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 10 }}>¥{p.normalPrice}</span>
                        </Space>
                        <Progress
                          percent={Math.max(10, 100 - Math.round(p.allocatedStock / 3))}
                          size="small" showInfo={false}
                          strokeColor={{ from: '#ff4d4f', to: '#ff7875' }}
                          style={{ marginTop: 2 }}
                        />
                      </div>
                      <Button type="primary" size="small" ghost shape="round" danger
                        onClick={() => handleAddToCart(p)}>
                        加入购物袋
                      </Button>
                    </div>
                  ))}
                </div>
              ),
            },
            // ===== 评论 Tab =====
            {
              key: 'comments',
              label: <span><MessageOutlined /> 评论 ({approvedComments.length})</span>,
              children: (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: 'calc(35vh - 86px)', padding: '0 12px' }}>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
                    {approvedComments.slice(-40).map(c => (
                      <div key={c.id} style={{ marginBottom: 6, display: 'flex', gap: 6 }}>
                        <span style={{ color: '#ffd700', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{c.user}</span>
                        <Text style={{ fontSize: 12, color: '#333' }}>{c.content}</Text>
                      </div>
                    ))}
                    <div ref={commentEndRef} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                    <Input
                      size="small"
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                      onPressEnter={handleSendComment}
                      placeholder="说点什么..."
                      style={{ flex: 1, borderRadius: 16 }}
                    />
                    <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSendComment} />
                  </div>
                </div>
              ),
            },
            // ===== 活动 Tab =====
            {
              key: 'activities',
              label: <span><GiftOutlined /> 活动 ({activities.length})</span>,
              children: (
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(35vh - 86px)', padding: '0 12px' }}>
                  {activities.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>暂无活动</div>
                  ) : (
                    activities.map(a => (
                      <div key={a.id} style={{
                        marginBottom: 10, borderRadius: 10, overflow: 'hidden',
                        border: '1px solid #f0f0f0',
                      }}>
                        <div style={{
                          background: a.type === 'coupon' ? '#ff9800' : a.type === 'flash_sale' ? '#e94560' : '#ffd700',
                          padding: '8px 12px',
                          color: '#fff', fontSize: 12, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <GiftOutlined /> {a.activityName}
                        </div>
                        <div style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{a.content}</div>
                          {a.type === 'coupon' && (
                            <Button size="small" type="primary" shape="round" block
                              onClick={() => handleClaimCoupon(a)}>立即领取</Button>
                          )}
                          {a.type === 'flash_sale' && (
                            <Button size="small" danger shape="round" block>即将秒杀</Button>
                          )}
                          {a.type === 'reservation_gift' && (
                            <Button size="small" shape="round" block style={{ borderColor: '#ffd700', color: '#fa8c16' }}>
                              参与活动
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* ==================== 购物袋浮层 ==================== */}
      <Drawer
        title={<span><ShoppingCartOutlined /> 购物袋（{cartItems.reduce((s, c) => s + c.qty, 0)}件）</span>}
        open={showCart}
        onClose={() => setShowCart(false)}
        placement="bottom"
        height="50%"
        styles={{ body: { padding: '12px 16px' } }}
      >
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
            <ShoppingCartOutlined style={{ fontSize: 48, color: '#ddd', marginBottom: 12 }} />
            <div>购物袋是空的</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>去挑选心仪的商品吧~</div>
          </div>
        ) : (
          <>
            {cartItems.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0', borderBottom: '1px solid #f0f0f0',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <span style={{ color: '#ff4d4f', fontWeight: 700 }}>¥{item.price}</span>
                </div>
                <Space>
                  <Button size="small" shape="circle" icon={<MinusOutlined />}
                    onClick={() => {
                      if (item.qty <= 1) setCartItems(cartItems.filter(c => c.id !== item.id));
                      else setCartItems(cartItems.map(c => c.id === item.id ? { ...c, qty: c.qty - 1 } : c));
                    }} />
                  <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <Button size="small" shape="circle" icon={<PlusOutlined />}
                    onClick={() => setCartItems(cartItems.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))} />
                </Space>
              </div>
            ))}
            <div style={{
              position: 'sticky', bottom: 0, background: '#fff', padding: '12px 0',
              borderTop: '1px solid #f0f0f0',
            }}>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text>合计：</Text>
                <Text style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 700 }}>
                  ¥{cartItems.reduce((s, c) => s + c.price * c.qty, 0)}
                </Text>
              </Row>
              <Button type="primary" danger block size="large" shape="round" style={{ fontWeight: 600 }}>
                立即结算 ({cartItems.reduce((s, c) => s + c.qty, 0)})
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ShoppingLivePage;
