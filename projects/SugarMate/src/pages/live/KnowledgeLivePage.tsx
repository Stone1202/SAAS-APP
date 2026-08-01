/**
 * 知识直播页 — LIVE端观众视图（健康科普版）
 * V2.0 对标医学科普直播体验
 *
 * 布局：
 * ┌────────────────────────────────────────────┐
 * │           视频播放区（医生讲解画面）          │
 * │   ← 弹幕飘过                               │
 * │   ★ 知识卡片弹出（关键知识点）               │
 * ├────────────────────────────────────────────┤
 * │ 左上：医生信息+科室+关注                     │
 * │ 右上：在线人数+预约下期                      │
 * │ 右侧：❤点赞 · 💬提问 · 📤分享               │
 * ├────────────────────────────────────────────┤
 * │ 底部面板：知识点PPT / 评论 / 问答 Tabs       │
 * │  + 底部输入栏（可提问）                     │
 * └────────────────────────────────────────────┘
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Button, Tag, Typography, Space, Badge, Tabs, Input, Row, Col,
  message, Drawer, Divider, Tooltip, Collapse, Card,
} from 'antd';
import {
  HeartOutlined, HeartFilled, ShareAltOutlined,
  CloseOutlined, EyeOutlined, MessageOutlined,
  SendOutlined, PlusOutlined, CrownOutlined,
  QuestionCircleOutlined, SoundOutlined,
  ClockCircleOutlined, BellOutlined,
  FileTextOutlined, TeamOutlined, LikeOutlined,
  StarOutlined, RightOutlined, PlayCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveStore } from '@/stores/liveStore';
import { DanmakuLayer, KnowledgeCardPopup } from '@/components/live';
import type { KnowledgeCard } from '@/components/live';

const { Text, Title, Paragraph } = Typography;

// ==================== 主组件 ====================

const KnowledgeLivePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    liveSessions, liveRooms, comments, liveStats, interactionConfigs,
    initMockData, setActiveRoom, addComment, updateLiveStats,
  } = useLiveStore();

  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState('knowledge');
  const [myComment, setMyComment] = useState('');
  const [currentKnowledgeIndex, setCurrentKnowledgeIndex] = useState(0);
  const [showKnowledgeCard, setShowKnowledgeCard] = useState(true);
  const commentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { initMockData(); }, []);

  const session = liveSessions.find(s => s.id === sessionId);
  const room = session?.roomId ? liveRooms.find(r => r.id === session.roomId) : null;
  const currentStats = room ? liveStats[room.id] : null;
  const approvedComments = useMemo(() => comments.filter(c => c.status === 'approved'), [comments]);
  const roomInteractions = room ? interactionConfigs.filter(i => i.roomId === room.id) : [];

  useEffect(() => {
    if (!room) return;
    setActiveRoom(room.id);
    const t = setInterval(() => {
      const base = liveStats[room.id] || { roomId: room.id, onlineViewers: 1520, totalViews: 8900, likes: 23400, comments: 1203, revenue: 0, orders: 0, duration: '0:45:20' };
      updateLiveStats(room.id, {
        onlineViewers: Math.max(100, base.onlineViewers + Math.floor(Math.random() * 30) - 15),
        likes: base.likes + Math.floor(Math.random() * 60),
        comments: base.comments + (Math.random() > 0.75 ? 1 : 0),
      });
    }, 3000);
    return () => clearInterval(t);
  }, [room?.id]);

  // 知识点轮播
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentKnowledgeIndex(i => (i + 1) % knowledgeCards.length);
      setShowKnowledgeCard(true);
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const handleLike = () => {
    if (room) {
      const s = liveStats[room.id] || { roomId: room.id, onlineViewers: 1520, totalViews: 8900, likes: 23400, comments: 1203, revenue: 0, orders: 0, duration: '0:45:20' };
      updateLiveStats(room.id, { likes: s.likes + 1 });
    }
    setLiked(!liked);
  };

  const handleSend = () => {
    if (!myComment.trim()) return;
    addComment({
      id: `k-${Date.now()}`,
      user: '我', content: myComment.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'approved',
    });
    setMyComment('');
  };

  // 知识卡片数据
  const knowledgeCards: KnowledgeCard[] = [
    { id: 'kc-1', order: 1, title: '血糖控制目标值', points: ['空腹血糖：4.4 - 7.0 mmol/L', '餐后2小时血糖：< 10.0 mmol/L', '糖化血红蛋白HbA1c：< 7.0%'] },
    { id: 'kc-2', order: 2, title: '糖尿病饮食原则', points: ['三餐定时定量，避免暴饮暴食', '主食粗细搭配，全谷物占1/3以上', '每日蔬菜摄入不少于500克'] },
    { id: 'kc-3', order: 3, title: '运动降糖的科学方法', points: ['每餐后30分钟运动效果最佳', '建议快步走、游泳、骑行', '每次持续30-45分钟'] },
    { id: 'kc-4', order: 4, title: '低血糖识别与急救', points: ['症状：心慌、出汗、手抖、头晕', '立即进食15g快糖（果汁/糖块）', '15分钟后复测，不缓解立即就医'] },
  ];

  if (!session || !room) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#999', background: '#0d1b2a', minHeight: '100vh' }}>
        <PlayCircleOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', marginBottom: 16 }} />
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>该直播场次还未配置直播间</div>
        <Button type="link" onClick={() => navigate('/live')} style={{ color: '#1677ff' }}>返回直播间列表</Button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto',
      background: '#0d1b2a', minHeight: '100vh',
      position: 'relative', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif',
    }}>
      {/* ==================== 视频播放区 ==================== */}
      <div style={{
        position: 'relative', width: '100%', height: '58vh',
        background: 'linear-gradient(180deg, #0d2240 0%, #163050 40%, #0d1b2a 100%)',
        overflow: 'hidden',
      }}>
        {/* 背景 */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.25,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(22,119,255,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(105,177,255,0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 80%, rgba(64,150,255,0.2) 0%, transparent 40%)
          `,
        }} />

        {/* 医生画面 */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 140, height: 140, borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.15) 0%, rgba(22,119,255,0.15) 50%, rgba(13,34,64,0.3) 100%)',
          border: '2px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 120px rgba(22,119,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 60,
        }}>
          👨‍⚕️
        </div>

        {/* 连线嘉宾 PIP */}
        <div style={{
          position: 'absolute', top: 100, right: 8,
          width: 100, height: 80, borderRadius: 8,
          background: 'linear-gradient(135deg, #1a3350, #0d2240)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30,
        }}>
          👩‍💼
        </div>
        <div style={{
          position: 'absolute', top: 102, right: 10,
          fontSize: 9, color: 'rgba(255,255,255,0.4)',
        }}>
          连麦：王护士
        </div>

        {/* 弹幕 */}
        <DanmakuLayer comments={approvedComments.slice(-10)} userColor="#69b1ff" bgOpacity={0.5} />

        {/* 知识卡片 */}
        <KnowledgeCardPopup
          card={showKnowledgeCard ? knowledgeCards[currentKnowledgeIndex] : null}
          onDismiss={() => setShowKnowledgeCard(false)}
        />

        {/* ===== 左上：医生信息 ===== */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
          <Row align="middle" gutter={8}>
            <Col>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, border: '2px solid rgba(255,255,255,0.4)',
              }}>
                👨‍⚕️
              </div>
            </Col>
            <Col>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>张伟明 主任医师</div>
              <Space size={4}>
                <Tag color="blue" style={{ fontSize: 9, lineHeight: '16px', margin: 0, background: 'rgba(22,119,255,0.3)', border: 'none' }}>内分泌科</Tag>
                <Tag color="green" style={{ fontSize: 9, lineHeight: '16px', margin: 0, background: 'rgba(82,196,26,0.3)', border: 'none' }}>3200+已关注</Tag>
              </Space>
            </Col>
            <Col>
              <Button
                type={followed ? 'default' : 'primary'}
                size="small" shape="round"
                onClick={() => { setFollowed(!followed); message.success(followed ? '已取消关注' : '已关注'); }}
                icon={followed ? <CrownOutlined /> : <PlusOutlined />}
                style={followed ? {
                  background: 'rgba(255,255,255,0.12)', color: '#fff',
                  borderColor: 'rgba(255,255,255,0.2)', height: 30,
                } : {
                  background: '#1677ff', borderColor: '#1677ff', height: 30,
                }}
              >
                {followed ? '已关注' : '关注'}
              </Button>
            </Col>
          </Row>
        </div>

        {/* ===== 右上：在线 + 预告 ===== */}
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          display: 'flex', gap: 8,
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.4)', borderRadius: 12,
            padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <EyeOutlined style={{ color: '#fff', fontSize: 11 }} />
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>
              {currentStats ? (currentStats.onlineViewers / 10000).toFixed(1) + '万' : '-'}
            </span>
          </div>
          <Tooltip title="预约下期直播">
            <div style={{
              background: 'rgba(22,119,255,0.3)', borderRadius: 12,
              padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4,
              cursor: 'pointer',
            }}>
              <BellOutlined style={{ color: '#69b1ff', fontSize: 11 }} />
              <span style={{ color: '#69b1ff', fontSize: 10 }}>预约</span>
            </div>
          </Tooltip>
        </div>

        {/* ===== 右侧操作栏 ===== */}
        <div style={{
          position: 'absolute', bottom: 70, right: 10, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          {/* 点赞 */}
          <div onClick={handleLike} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: liked ? 'rgba(22,119,255,0.3)' : 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              {liked ? (
                <HeartFilled style={{ color: '#1677ff', fontSize: 19 }} />
              ) : (
                <HeartOutlined style={{ color: '#fff', fontSize: 19 }} />
              )}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 }}>
              {currentStats ? Math.floor(currentStats.likes / 1000) + 'k' : '-'}
            </span>
          </div>

          {/* 提问 */}
          <div onClick={() => { setActiveTab('qa'); }} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <QuestionCircleOutlined style={{ color: '#ffd700', fontSize: 19 }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 }}>提问</span>
          </div>

          {/* 分享 */}
          <div onClick={() => message.success('链接已复制')} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShareAltOutlined style={{ color: '#fff', fontSize: 19 }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 }}>分享</span>
          </div>
        </div>
      </div>

      {/* ==================== 底部面板 ==================== */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '42vh', background: '#fff', borderRadius: '16px 16px 0 0',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ padding: '0 16px', margin: 0 }}
          items={[
            // ===== 知识点 Tab =====
            {
              key: 'knowledge',
              label: <span><FileTextOutlined /> 知识点</span>,
              children: (
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(42vh - 86px)', padding: '0 12px' }}>
                  {knowledgeCards.map((card, idx) => (
                    <div key={card.id} style={{
                      marginBottom: 10, borderRadius: 10,
                      background: idx === currentKnowledgeIndex && showKnowledgeCard
                        ? 'linear-gradient(135deg, #e6f4ff, #fff)'
                        : '#fff',
                      border: idx === currentKnowledgeIndex && showKnowledgeCard
                        ? '2px solid #1677ff'
                        : '1px solid #f0f0f0',
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                    }}>
                      <div style={{
                        padding: '8px 12px',
                        background: idx === currentKnowledgeIndex && showKnowledgeCard
                          ? 'linear-gradient(135deg, #1677ff, #4096ff)'
                          : '#fafafa',
                        color: idx === currentKnowledgeIndex && showKnowledgeCard ? '#fff' : '#333',
                        fontWeight: 600, fontSize: 13,
                        display: 'flex', justifyContent: 'space-between',
                      }}>
                        <span>📍 {card.title}</span>
                        {idx === currentKnowledgeIndex && showKnowledgeCard && (
                          <Tag color="white" style={{ fontSize: 10 }}>讲解中</Tag>
                        )}
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        {card.points.map((p, pi) => (
                          <div key={pi} style={{
                            fontSize: 12, color: '#555', lineHeight: 1.8,
                            padding: '3px 0', borderBottom: '1px solid #f5f5f5',
                          }}>
                            <span style={{ color: '#1677ff', fontWeight: 600, marginRight: 6 }}>{pi + 1}.</span>
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            // ===== 评论 Tab =====
            {
              key: 'comments',
              label: <span><MessageOutlined /> 评论</span>,
              children: (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: 'calc(42vh - 86px)', padding: '0 12px' }}>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
                    {approvedComments.slice(-30).map(c => (
                      <div key={c.id} style={{ marginBottom: 6, display: 'flex', gap: 6 }}>
                        <span style={{ color: '#1677ff', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{c.user}</span>
                        <span style={{ fontSize: 12, color: '#333' }}>{c.content}</span>
                      </div>
                    ))}
                    <div ref={commentEndRef} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                    <Input
                      size="small"
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                      onPressEnter={handleSend}
                      placeholder="发表评论..."
                      style={{ flex: 1, borderRadius: 16 }}
                    />
                    <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} />
                  </div>
                </div>
              ),
            },
            // ===== 问答 Tab =====
            {
              key: 'qa',
              label: <span><QuestionCircleOutlined /> 问答</span>,
              children: (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: 'calc(42vh - 86px)', padding: '0 12px' }}>
                  {/* 互动问答列表 */}
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
                    {roomInteractions.filter(i => i.type === 'qa').map(qa => (
                      <Card key={qa.id} size="small" style={{ marginBottom: 8, borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{qa.interactionName}</div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{qa.description}</div>
                      </Card>
                    ))}
                    {/* 模拟 QA */}
                    {[
                      { q: '空腹血糖7.5算高吗？', a: '根据标准，空腹血糖7.5已超过7.0的正常上限，属于偏高范围。建议调整饮食和运动，必要时就医调整用药方案。', time: '15:22' },
                      { q: '糖友能吃西瓜吗？', a: '西瓜升糖指数较高，不建议大量食用。如果血糖控制良好，可以吃1-2小块（约100g），建议在两餐之间食用，并监测血糖变化。', time: '15:18' },
                      { q: '二甲双胍什么时候吃最好？', a: '建议餐中或餐后立即服用，可以减少胃肠道不适。普通片一般随餐服用，缓释片一般晚餐后服用。', time: '15:10' },
                    ].map((item, i) => (
                      <div key={i} style={{
                        marginBottom: 8, padding: 10,
                        background: '#f8faff', borderRadius: 8,
                        borderLeft: '3px solid #1677ff',
                      }}>
                        <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                          <QuestionCircleOutlined style={{ marginRight: 4 }} /> {item.time}
                        </div>
                        <div style={{ fontSize: 12, color: '#333', fontWeight: 500, marginBottom: 6 }}>
                          Q: {item.q}
                        </div>
                        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>
                          <span style={{ color: '#1677ff', fontWeight: 600 }}>A: </span>{item.a}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* 提问输入栏 */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                    <Input
                      size="small"
                      placeholder="向张医生提问..."
                      style={{ flex: 1, borderRadius: 16 }}
                      onPressEnter={(e: any) => { if (e.target.value.trim()) { message.success('问题已提交，等待医生回答'); e.target.value = ''; } }}
                    />
                    <Button type="primary" shape="circle" icon={<SendOutlined />} />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default KnowledgeLivePage;
