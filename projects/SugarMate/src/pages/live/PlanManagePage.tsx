/**
 * 开播计划管理 — LIVE 直播端（开播人视角）
 * 展示 PC 后台分配给当前开播人的计划 → 查看场次 → 开播
 * V2.0 — 接入共享 Store，与 PC 后台联动
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Button, Tag, Space, Typography, Row, Col,
  Steps, Tabs, Empty, Badge, List,
} from 'antd';
import {
  PlayCircleOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, VideoCameraOutlined, CrownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLiveStore, type BroadcastPlan, type LiveSession } from '@/stores/liveStore';

const { Title, Text } = Typography;

// 当前登录开播人（模拟）
const CURRENT_BROADCASTER = '李芳芳';

const PlanManagePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    broadcastPlans, liveSessions, liveRooms,
    initMockData,
  } = useLiveStore();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'history'>('active');

  useEffect(() => { initMockData(); }, []);

  // 筛选当前开播人的计划
  const myPlans = useMemo(() => {
    return broadcastPlans
      .filter(p => p.broadcasterName === CURRENT_BROADCASTER)
      .sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
      });
  }, [broadcastPlans]);

  const activePlans = myPlans.filter(p => p.status !== 'finished');
  const historyPlans = myPlans.filter(p => p.status === 'finished');

  const displayPlans = tab === 'active' ? activePlans : historyPlans;

  const selectedPlan = myPlans.find(p => p.id === selectedPlanId);

  // 选中计划的场次
  const planSessions = useMemo(() => {
    if (!selectedPlanId) return [];
    return liveSessions
      .filter(s => s.planId === selectedPlanId)
      .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());
  }, [liveSessions, selectedPlanId]);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending': return <Tag color="blue">待开播</Tag>;
      case 'active': return <Tag color="green">进行中</Tag>;
      case 'finished': return <Tag color="default">已结束</Tag>;
      default: return null;
    }
  };

  const getSessionStatusTag = (status: string) => {
    const m: Record<string, { color: string; label: string }> = {
      pending: { color: 'default', label: '待排期' },
      ready: { color: 'blue', label: '已就绪' },
      live: { color: 'red', label: '直播中' },
      ended: { color: 'default', label: '已结束' },
    };
    return <Tag color={m[status]?.color}>{m[status]?.label}</Tag>;
  };

  const handleEnterRoom = (session: LiveSession) => {
    if (session.roomId) {
      const room = liveRooms.find(r => r.sessionId === session.id);
      if (room && room.status === 'ready') {
        // 开播：更新直播间状态为live，更新场次状态
        const { updateLiveRoom, updateLiveSession } = useLiveStore.getState();
        updateLiveRoom(room.id, { status: 'live' });
        updateLiveSession(session.id, { status: 'live' });
      }
    }
    if (session.liveType === 'shopping') {
      navigate(`/live/shopping/${session.id}`);
    } else {
      navigate(`/live/knowledge/${session.id}`);
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
        {/* 开播人信息 */}
        <Card style={{ marginBottom: 16, borderRadius: 12 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <CrownOutlined style={{ color: '#faad14', fontSize: 20, marginRight: 8 }} />
              <Text strong style={{ fontSize: 18 }}>{CURRENT_BROADCASTER}</Text>
              <Tag color="orange" style={{ marginLeft: 8 }}>营养师</Tag>
            </Col>
            <Col>
              <Tag color="blue">糖尿病营养</Tag>
              <Tag>直播场次：{myPlans.reduce((sum, p) => sum + p.sessionCount, 0)}</Tag>
            </Col>
          </Row>
        </Card>

        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as any)}
          items={[
            { key: 'active', label: '进行中 / 即将开播' },
            { key: 'history', label: '历史计划' },
          ]}
        />

        {displayPlans.length === 0 ? (
          <Empty description="暂无计划" style={{ marginTop: 60 }} />
        ) : (
          displayPlans.map(plan => (
            <Card
              key={plan.id}
              style={{
                marginBottom: 12, borderRadius: 12,
                borderLeft: plan.status === 'active' ? '4px solid #1677ff' : undefined,
              }}
            >
              <Row justify="space-between" align="middle">
                <Col flex={1}>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>{plan.name}</Text>
                    {getStatusTag(plan.status)}
                    <Tag color={plan.broadcasterType === 'doctor' ? 'blue' : 'orange'}>
                      {plan.broadcasterType === 'doctor' ? '医生' : '营养师'}
                    </Tag>
                  </Space>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
                    <CalendarOutlined /> {plan.period[0]} ~ {plan.period[1]} ·
                    共 <Text strong>{plan.sessionCount}</Text> 场 ·
                    {plan.description}
                  </div>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<RightOutlined />}
                    onClick={() => setSelectedPlanId(plan.id === selectedPlanId ? null : plan.id)}
                  >
                    {selectedPlanId === plan.id ? '收起' : '查看场次'}
                  </Button>
                </Col>
              </Row>

              {/* 场次详情 */}
              {selectedPlanId === plan.id && (
                <div style={{ marginTop: 16, padding: '12px', background: '#fafafa', borderRadius: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                    共 {planSessions.length} 场
                  </Text>
                  {planSessions.map((session, index) => {
                    const room = session.roomId ? liveRooms.find(r => r.id === session.roomId) : null;
                    return (
                      <Card key={session.id} size="small" style={{ marginBottom: 8, borderRadius: 8 }}>
                        <Row justify="space-between" align="middle">
                          <Col flex={1}>
                            <Space size={4}>
                              <Tag>{index + 1}</Tag>
                              <Text strong style={{ fontSize: 13 }}>{session.topic}</Text>
                            </Space>
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                              <ClockCircleOutlined /> {dayjs(session.startTime).format('MM/DD HH:mm')} ~ {dayjs(session.endTime).format('HH:mm')} ·
                              {getSessionStatusTag(session.status)}
                              {room && <Tag color="green" style={{ marginLeft: 4 }}><VideoCameraOutlined /> {room.roomName}</Tag>}
                            </div>
                          </Col>
                          <Col>
                            {session.status === 'ready' && (
                              <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                size="small"
                                shape="round"
                                onClick={() => handleEnterRoom(session)}
                              >
                                开始直播
                              </Button>
                            )}
                            {session.status === 'live' && (
                              <Button
                                type="primary"
                                danger
                                icon={<PlayCircleOutlined />}
                                size="small"
                                shape="round"
                                onClick={() => handleEnterRoom(session)}
                              >
                                进入直播
                              </Button>
                            )}
                            {session.status === 'ended' && (
                              <Button size="small" shape="round" disabled>已结束</Button>
                            )}
                            {session.status === 'pending' && (
                              <Button size="small" shape="round" disabled>待排期</Button>
                            )}
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PlanManagePage;
