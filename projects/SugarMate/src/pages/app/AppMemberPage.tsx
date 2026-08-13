/**
 * APP会员中心 — 糖友会员中心（忠诚度体系）
 * PRD §2.7.4.1 Tab4: 会员等级展示 + 成长值 + 积分中心 + 签到 + 权益领取 + 优惠券
 * 设计语言：Medical Pro — 蓝金配色，游戏化积分体系
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Progress, Button, Badge } from 'antd';
import {
  CrownOutlined, GiftOutlined, CalendarOutlined, RightOutlined,
  SafetyCertificateOutlined, MedicineBoxOutlined, CustomerServiceOutlined,
  FileTextOutlined, StarFilled, FireOutlined, ThunderboltOutlined,
  TrophyOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import MobileFrame, { APP_PATIENT_TABS } from '@/components/MobileFrame';

/* ========== 模拟数据 ========== */
const MEMBER_DATA = {
  level: 3,              // 1=普通 2=银卡 3=金卡 4=钻石
  levelName: '金卡会员',
  nextLevelName: '钻石会员',
  growthValue: 6850,
  nextLevelGrowth: 10000,
  checkinDays: 28,
  points: 2350,
  couponCount: 3,
};

const BENEFITS = [
  { icon: <MedicineBoxOutlined />, label: '专属医生', desc: '1v1健康管理', color: '#1890ff', bg: '#e6f7ff' },
  { icon: <GiftOutlined />, label: '折扣购药', desc: '最高享8.5折', color: '#52c41a', bg: '#f6ffed' },
  { icon: <CustomerServiceOutlined />, label: '优先客服', desc: '30秒极速响应', color: '#fa8c16', bg: '#fff7e6' },
  { icon: <FileTextOutlined />, label: '健康报告', desc: '月度体检报告', color: '#722ed1', bg: '#f9f0ff' },
];

const COUPONS = [
  { name: '商城满减券', value: '满199减30', expire: '7月31日', status: 'valid' as const },
  { name: '问诊优惠券', value: '满100减15', expire: '8月15日', status: 'valid' as const },
  { name: 'CGM专属券', value: '满499减80', expire: '6月30日', status: 'expired' as const },
];

const POINT_TASKS = [
  { icon: <CalendarOutlined />, label: '每日签到', points: 10, done: true, path: '/app/member/checkin' },
  { icon: <FireOutlined />, label: '分享健康文章', points: 20, done: false, path: '' },
  { icon: <StarFilled />, label: '邀请好友', points: 50, done: false, path: '' },
  { icon: <FileTextOutlined />, label: '发布优质帖子', points: 30, done: false, path: '' },
  { icon: <ThunderboltOutlined />, label: '完成CGM数据上传', points: 15, done: true, path: '' },
];

/* ========== 会员等级卡片 ========== */
const LevelCard: React.FC = () => {
  const { level, levelName, nextLevelName, growthValue, nextLevelGrowth } = MEMBER_DATA;
  const levelProgress = Math.round((growthValue / nextLevelGrowth) * 100);
  const levelColors: Record<number, string> = { 1: '#1890ff', 2: '#a0a0a0', 3: '#faad14', 4: '#722ed1' };
  const color = levelColors[level] || '#1890ff';

  return (
    <Card style={{
      borderRadius: 16, border: 'none', marginBottom: 20, overflow: 'hidden',
      background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }}
      bodyStyle={{ padding: '20px 16px 16px' }}
    >
      {/* 会员等级区 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <CrownOutlined style={{ color, fontSize: 24 }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{levelName}</span>
            <Tag color="gold" style={{ borderRadius: 10, margin: 0 }}>Lv.{level}</Tag>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            升级到{nextLevelName}还需 {nextLevelGrowth - growthValue} 成长值
          </div>
        </div>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <TrophyOutlined style={{ fontSize: 40, color: 'rgba(250,173,20,0.15)' }} />
          <div style={{ position: 'absolute', top: 8, left: 8, right: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#faad14' }}>{growthValue}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>成长值</div>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <Progress
        percent={levelProgress}
        showInfo={false}
        strokeColor={{ from: '#faad14', to: '#ffd666' }}
        trailColor="rgba(255,255,255,0.15)"
        style={{ marginBottom: 0 }}
      />
      <div style={{ textAlign: 'right', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
        {nextLevelGrowth}
      </div>
    </Card>
  );
};

/* ========== 积分签到区 ========== */
const PointsSection: React.FC = () => {
  const nav = useNavigate();
  return (
    <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: 0 }}>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GiftOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
          <div>
            <div style={{ fontSize: 12, color: '#999' }}>我的积分</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>
              {MEMBER_DATA.points}
              <span style={{ fontSize: 11, fontWeight: 400, color: '#999', marginLeft: 2 }}>分</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            size="small"
            style={{
              borderRadius: 16, background: 'linear-gradient(135deg, #fa8c16, #ffa940)',
              border: 'none', fontWeight: 600, fontSize: 12,
            }}
            onClick={() => nav('/app/member/points')}
          >
            积分兑换
          </Button>
          <Button
            size="small"
            style={{
              borderRadius: 16, background: '#e6f7ff', border: 'none',
              color: '#1890ff', fontWeight: 500, fontSize: 12,
            }}
            onClick={() => nav('/app/member/checkin')}
          >
            <CalendarOutlined /> 已连签{MEMBER_DATA.checkinDays}天
          </Button>
        </div>
      </div>
    </Card>
  );
};

/* ========== 权益网格 ========== */
const BenefitsGrid: React.FC = () => (
  <div style={{ marginBottom: 20 }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
        <CrownOutlined style={{ color: '#faad14', marginRight: 4 }} />会员专属权益
      </span>
    </div>
    <Row gutter={8}>
      {BENEFITS.map((item, i) => (
        <Col span={12} key={i} style={{ marginBottom: 8 }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '14px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            border: '1px solid #f0f0f0', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
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
  </div>
);

/* ========== 每日任务 ========== */
const DailyTasks: React.FC = () => {
  const nav = useNavigate();
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
          <ThunderboltOutlined style={{ color: '#fa8c16', marginRight: 4 }} />每日任务
        </span>
        <span style={{ fontSize: 10, color: '#999' }}>完成签到获取更多积分</span>
      </div>
      <Card size="small" style={{ borderRadius: 12, border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '4px 0' }}>
        {POINT_TASKS.map((task, i) => (
          <div key={i} onClick={() => task.path && nav(task.path)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            cursor: task.path ? 'pointer' : 'default',
            borderBottom: i < POINT_TASKS.length - 1 ? '1px solid #f5f5f5' : 'none',
          }}>
            <span style={{ color: task.done ? '#52c41a' : '#d9d9d9', fontSize: 16 }}>
              {task.icon}
            </span>
            <span style={{ flex: 1, fontSize: 12, color: task.done ? '#999' : '#333' }}>
              {task.label}
            </span>
            <span style={{
              fontSize: 11, color: task.done ? '#52c41a' : '#fa8c16', fontWeight: 500,
            }}>
              +{task.points}分
            </span>
            {task.done ? (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
            ) : (
              <Tag style={{ borderRadius: 10, fontSize: 10, margin: 0, cursor: 'pointer' }}>去完成</Tag>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
};

/* ========== 优惠券 ========== */
const CouponSection: React.FC = () => {
  const nav = useNavigate();
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
          <GiftOutlined style={{ color: '#f5222d', marginRight: 4 }} />
          优惠券
          <Badge count={MEMBER_DATA.couponCount} size="small" style={{ marginLeft: 8 }} />
        </span>
        <a onClick={() => nav('/app/member/coupons')} style={{ fontSize: 11 }}>全部 <RightOutlined /></a>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {COUPONS.map((coupon, i) => (
          <div key={i} style={{
            minWidth: 180, borderRadius: 12, overflow: 'hidden',
            border: '1px solid #f0f0f0', flexShrink: 0,
            opacity: coupon.status === 'expired' ? 0.5 : 1,
            background: coupon.status === 'expired' ? '#fafafa' : '#fff',
          }}>
            <div style={{
              padding: '12px 14px',
              background: coupon.status === 'expired' ? '#f5f5f5' : 'linear-gradient(135deg, #fff1f0, #fff)',
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f5222d' }}>
                {coupon.value}
              </div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{coupon.name}</div>
            </div>
            <div style={{
              padding: '6px 14px', fontSize: 10, color: '#999',
              borderTop: '1px dashed #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>有效期至 {coupon.expire}</span>
              <Tag style={{
                borderRadius: 10, margin: 0, fontSize: 10,
                color: coupon.status === 'expired' ? '#999' : '#f5222d',
                background: coupon.status === 'expired' ? '#f5f5f5' : '#fff1f0',
                border: 'none',
              }}>
                {coupon.status === 'expired' ? '已失效' : '去使用'}
              </Tag>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========== 主组件 ========== */
const AppMemberPage: React.FC = () => (
  <MobileFrame title="会员中心" tabs={APP_PATIENT_TABS} basePath="/app">
    <div style={{ padding: '12px 12px 24px', background: '#f7f8fa', minHeight: '100%' }}>
      <LevelCard />
      <PointsSection />
      <BenefitsGrid />
      <DailyTasks />
      <CouponSection />
    </div>
  </MobileFrame>
);

export default AppMemberPage;
