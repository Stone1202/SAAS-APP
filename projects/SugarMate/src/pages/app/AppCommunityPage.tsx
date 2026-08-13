/**
 * APP社区页 — 糖友社交信息流
 * PRD §2.7.4.1 Tab3: 帖子信息流 + 话题广场 + 直播回放入口 + 专家专栏 + 运动打卡
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Avatar, Badge, Button } from 'antd';
import {
  FireOutlined, AppstoreOutlined, StarOutlined, LikeOutlined,
  MessageOutlined, ShareAltOutlined, EditOutlined, PlaySquareOutlined,
  ClockCircleOutlined, EyeOutlined, TeamOutlined, PlusOutlined,
  UserOutlined, LoadingOutlined,
} from '@ant-design/icons';
import MobileFrame, { APP_PATIENT_TABS } from '@/components/MobileFrame';

/* ========== 模拟数据 ========== */
const FEED_TABS = [
  { key: 'hot', label: '推荐' },
  { key: 'follow', label: '关注' },
  { key: 'new', label: '最新' },
];

const POSTS = [
  {
    id: 1, user: { name: '糖友小陈', avatar: '🧑', tag: '2型·3年' },
    content: '今天早餐吃了全麦面包+鸡蛋+牛奶，餐后2小时血糖6.2，感觉不错！坚持低GI饮食真的有效果💪',
    likes: 128, comments: 32, time: '2小时前', images: [],
    topic: '饮食分享',
  },
  {
    id: 2, user: { name: '张医生', avatar: '👨‍⚕️', tag: '内分泌科主任', isVerified: true },
    content: '夏季糖友运动指南：避免高温时段（10:00-16:00），选择清晨或傍晚运动。推荐运动：快走、游泳、太极。运动前测血糖，低于5.6需加餐。',
    likes: 356, comments: 89, time: '5小时前', images: [],
    topic: '专家专栏',
  },
  {
    id: 3, user: { name: '控糖达人李姐', avatar: '👩‍🦰', tag: '1型·5年' },
    content: '分享我的CGM使用心得：佩戴在大臂外侧最舒适，洗澡完全没问题，误差一般不超过0.3mmol/L。用了半年，HbA1c从8.5降到了6.8！',
    likes: 265, comments: 56, time: '昨天', images: [],
    topic: '经验分享',
  },
];

const REPLAYS = [
  { title: 'CGM动态血糖仪使用教程', anchor: '张医生', duration: '45:22', views: 1280, date: '7月28日' },
  { title: '糖友互助交流会 第12期', anchor: '李主任', duration: '1:02:15', views: 896, date: '7月27日' },
];

const TOPICS = ['饮食分享', '运动打卡', '经验分享', '专家专栏', 'CGM专题', '药物讨论'];

/* ========== 帖子卡片 ========== */
const PostCard: React.FC<{ post: typeof POSTS[0] }> = ({ post }) => (
  <Card size="small" style={{ borderRadius: 12, marginBottom: 10, border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '12px 14px' }}>
    {/* 用户信息 */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <Avatar size={36} style={{ background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)', fontSize: 18, flexShrink: 0 }}>{post.user.avatar}</Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{post.user.name}</span>
          {post.user.isVerified && <Tag color="blue" style={{ fontSize: 9, lineHeight: '16px', borderRadius: 4, padding: '0 4px' }}>V</Tag>}
        </div>
        <div style={{ fontSize: 10, color: '#bbb', marginTop: 1 }}>
          {post.user.tag} · {post.time}
        </div>
      </div>
      <Tag style={{ borderRadius: 8, fontSize: 10 }}>{post.topic}</Tag>
    </div>

    {/* 正文 */}
    <div style={{ fontSize: 12, color: '#333', lineHeight: 1.7, marginBottom: 10 }}>
      {post.content}
    </div>

    {/* 互动栏 */}
    <div style={{ display: 'flex', gap: 24, borderTop: '1px solid #f5f5f5', paddingTop: 8 }}>
      <span style={{ fontSize: 11, color: '#999', cursor: 'pointer' }}>
        <LikeOutlined style={{ marginRight: 3 }} />{post.likes}
      </span>
      <span style={{ fontSize: 11, color: '#999', cursor: 'pointer' }}>
        <MessageOutlined style={{ marginRight: 3 }} />{post.comments}
      </span>
      <span style={{ fontSize: 11, color: '#999', cursor: 'pointer' }}>
        <ShareAltOutlined style={{ marginRight: 3 }} />分享
      </span>
    </div>
  </Card>
);

/* ========== 主组件 ========== */
const AppCommunityPage: React.FC = () => {
  const nav = useNavigate();
  const [feedTab, setFeedTab] = useState('hot');

  return (
    <MobileFrame title="社区" tabs={APP_PATIENT_TABS} basePath="/app">
      <div style={{ padding: '12px 12px 24px', background: '#f7f8fa', minHeight: '100%' }}>

        {/* === 快捷入口 === */}
        <Row gutter={8} style={{ marginBottom: 12 }}>
          {[
            { icon: <FireOutlined />, label: '精华推荐', path: '/app/community/featured' },
            { icon: <AppstoreOutlined />, label: '话题广场', path: '/app/community/topics' },
            { icon: <StarOutlined />, label: '糖友圈', path: '/app/community/circle/1' },
          ].map(item => (
            <Col span={8} key={item.label}>
              <div onClick={() => nav(item.path)} style={{
                background: '#fff', borderRadius: 8, padding: '8px 4px', textAlign: 'center',
                cursor: 'pointer', border: '1px solid #f0f0f0',
              }}>
                <div style={{ fontSize: 18, color: '#1890ff' }}>{item.icon}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{item.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* === 精彩回放横幅 === */}
        <Card
          size="small"
          title={
            <span style={{ fontSize: 13 }}>
              <PlaySquareOutlined style={{ color: '#722ed1', marginRight: 6 }} />
              精彩回放
              <Badge count={REPLAYS.length} size="small" style={{ marginLeft: 8 }} />
            </span>
          }
          extra={<a onClick={() => nav('/app/community/replays')} style={{ fontSize: 11 }}>全部 &gt;</a>}
          style={{ borderRadius: 12, marginBottom: 14, borderLeft: '3px solid #722ed1' }}
          bodyStyle={{ padding: '8px 12px' }}
        >
          <Row gutter={8}>
            {REPLAYS.map((replay, i) => (
              <Col span={12} key={i}>
                <div onClick={() => nav(`/app/community/replay/${i + 1}`)} style={{
                  background: '#fff', borderRadius: 8, overflow: 'hidden',
                  cursor: 'pointer', border: '1px solid #f0f0f0',
                }}>
                  <div style={{
                    height: 60, background: 'linear-gradient(135deg, #f9f0ff, #efdbff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, position: 'relative',
                  }}>
                    📺
                    <span style={{
                      position: 'absolute', bottom: 4, right: 6,
                      background: 'rgba(0,0,0,0.65)', borderRadius: 4,
                      padding: '1px 6px', color: '#fff', fontSize: 9,
                    }}>
                      {replay.duration}
                    </span>
                  </div>
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {replay.title}
                    </div>
                    <div style={{ fontSize: 9, color: '#999' }}>
                      <EyeOutlined /> {replay.views} · {replay.date}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* === 话题标签 === */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {TOPICS.map((topic, i) => (
            <Tag key={i} style={{
              borderRadius: 16, cursor: 'pointer', padding: '4px 12px',
              fontSize: 11, margin: 0, whiteSpace: 'nowrap',
              background: i === 0 ? '#1890ff' : '#fff', color: i === 0 ? '#fff' : '#666',
              border: i === 0 ? 'none' : '1px solid #f0f0f0',
            }}>
              {i === 0 && <FireOutlined style={{ marginRight: 3 }} />}
              {topic}
            </Tag>
          ))}
        </div>

        {/* === 信息流头部Tab === */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 12,
          background: '#fff', borderRadius: 10, padding: 2,
          border: '1px solid #f0f0f0',
        }}>
          {FEED_TABS.map(tab => (
            <div
              key={tab.key}
              onClick={() => setFeedTab(tab.key)}
              style={{
                flex: 1, textAlign: 'center', padding: '8px 0', cursor: 'pointer',
                fontSize: 12, fontWeight: feedTab === tab.key ? 600 : 400,
                borderRadius: 8, transition: 'all 0.2s',
                background: feedTab === tab.key ? '#e6f7ff' : 'transparent',
                color: feedTab === tab.key ? '#1890ff' : '#999',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* === 帖子信息流 === */}
        {POSTS.map(post => <PostCard key={post.id} post={post} />)}

        {/* === 浮动发布按钮 === */}
        <div style={{
          position: 'fixed', bottom: 80, right: 'calc((100vw - 375px) / 2 + 20px)',
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1890ff, #096dd9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 20, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(24,144,255,0.4)', zIndex: 50,
        }}
          onClick={() => nav('/app/community/post')}
        >
          <PlusOutlined />
        </div>

      </div>
    </MobileFrame>
  );
};

export default AppCommunityPage;
