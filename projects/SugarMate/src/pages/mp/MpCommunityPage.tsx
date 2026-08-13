/**
 * PG-SUG-MP-012 糖友圈社区 V1.0.0
 * 
 * 小程序轻量社区浏览体验（4 Tab：首页/附近/咨询/我的）。
 * 仅浏览+点赞，发帖/评论/关注/私信等互动引导下载APP。
 * 关联UC-SUG-MP-015
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Segmented, Space, Tag,
  List, Input, Divider, Badge, Empty,
} from 'antd';
import {
  LikeOutlined, EyeOutlined, FireOutlined,
  ClockCircleOutlined, CommentOutlined,
  DownloadOutlined, WechatOutlined,
} from '@ant-design/icons';
import MpPageFrame from '../../components/MpPageFrame';

const { Text, Title } = Typography;

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  views: number;
  time: string;
  tags: string[];
  pinned?: boolean;
}

const hotPosts: Post[] = [
  {
    id: '1', author: '糖友小王', avatar: '🧑',
    title: '分享一个控糖小妙招！',
    content: '我每天饭后散步30分钟，配合二甲双胍，血糖控制得越来越好了。分享一下我的饮食日记：早餐全麦面包+鸡蛋，午餐糙米饭+清蒸鱼，晚餐清淡蔬菜汤…',
    likes: 128, comments: 45, views: 2800, time: '2小时前',
    tags: ['血糖控制', '饮食分享'], pinned: true,
  },
  {
    id: '2', author: '健康达人', avatar: '👩',
    title: '新入手了这个血糖仪，好用推荐！',
    content: '用了半个月了，采血量少、读数快、APP自动同步数据。分享给还在纠结买哪款血糖仪的糖友们～',
    likes: 89, comments: 32, views: 1560, time: '5小时前',
    tags: ['好物推荐', '血糖仪'],
  },
  {
    id: '3', author: '控糖老司机', avatar: '👨',
    title: '十年糖友的健康管理经验总结',
    content: '确诊10年了，从一开始的恐慌到现在的从容面对。几个关键点：1)按时测血糖 2)遵医嘱用药 3)规律运动 4)心态要好 5)定期复查。细节展开说…',
    likes: 256, comments: 78, views: 5200, time: '昨天',
    tags: ['经验分享', '心路历程'],
  },
];

const Page: React.FC = () => {
  const [sort, setSort] = useState<'hot' | 'new'>('hot');
  const [search, setSearch] = useState('');

  const sorted = [...hotPosts].sort((a, b) =>
    sort === 'hot' ? b.likes - a.likes : 0
  );

  return (
    <MpPageFrame title="糖友圈">
      <div style={{ padding: 12 }}>
        {/* 搜索 */}
        <Input
          prefix={<Text type="secondary">🔍</Text>}
          placeholder="搜索帖子内容…"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{ borderRadius: 16, marginBottom: 12 }}
        />

        {/* 排序 */}
        <Segmented
          block
          size="small"
          value={sort}
          onChange={(v) => setSort(v as 'hot' | 'new')}
          options={[
            { label: '热门', value: 'hot', icon: <FireOutlined /> },
            { label: '最新', value: 'new', icon: <ClockCircleOutlined /> },
          ]}
          style={{ marginBottom: 12 }}
        />

        {/* 帖子列表 */}
        {sorted.map(post => (
          <Card
            key={post.id}
            size="small"
            style={{
              marginBottom: 10, borderRadius: 10, background: '#fff',
              ...(post.pinned ? { borderLeft: '3px solid #1677ff' } : {}),
            }}
          >
            {post.pinned && (
              <Tag color="blue" style={{ fontSize: 10, marginBottom: 6 }}>置顶</Tag>
            )}
            <Space align="start">
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#f0f5ff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>{post.avatar}</div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 14 }}>{post.title}</Text>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                  {post.author} · {post.time}
                </Text>
                <Text
                  style={{ fontSize: 12, display: 'block', marginTop: 4, color: '#555', lineHeight: 1.5 }}
                >
                  {post.content.length > 80 ? post.content.slice(0, 80) + '…' : post.content}
                </Text>
              </div>
            </Space>

            {/* 标签 */}
            <Space size={4} wrap style={{ marginTop: 8 }}>
              {post.tags.map(t => (
                <Tag key={t} style={{ fontSize: 10, background: '#f0f5ff', border: 'none', borderRadius: 10 }}>
                  {t}
                </Tag>
              ))}
            </Space>

            <Divider style={{ margin: '8px 0' }} />

            {/* 互动数据 */}
            <Space size={16} style={{ width: '100%' }}>
              <Space size={4}>
                <LikeOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                <Text style={{ fontSize: 11 }}>{post.likes}</Text>
              </Space>
              <Space size={4}>
                <CommentOutlined style={{ color: '#1677ff', fontSize: 12 }} />
                <Text style={{ fontSize: 11 }}>{post.comments}</Text>
              </Space>
              <Space size={4}>
                <EyeOutlined style={{ color: '#888', fontSize: 12 }} />
                <Text style={{ fontSize: 11 }}>{post.views}</Text>
              </Space>
            </Space>
          </Card>
        ))}

        {/* APP下载引导卡片 */}
        <Card
          style={{
            borderRadius: 12, marginTop: 8,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
          }}
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ textAlign: 'center' }}>
            <WechatOutlined style={{ fontSize: 32, color: '#fff', opacity: 0.8 }} />
            <Text strong style={{ color: '#fff', fontSize: 14, display: 'block', marginTop: 8 }}>
              参与讨论，发现更多糖友
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginTop: 4 }}>
              下载APP解锁发帖/评论/关注/私信等完整社区功能
            </Text>
            <Button
              type="primary"
              shape="round"
              icon={<DownloadOutlined />}
              size="large"
              style={{
                marginTop: 12, background: '#fff', color: '#667eea',
                border: 'none', fontWeight: 'bold',
              }}
            >
              打开APP
            </Button>
          </div>
        </Card>
      </div>
    </MpPageFrame>
  );
};

export default Page;
