/**
 * PG-SUG-LIVE 互动问答 V1.0.0
 * 
 * 观众提问→主播解答，AI精选高频问题自动聚合，
 * 问题筛选+答案高亮展示，主播实时回答。
 */
import React, { useState } from 'react';
import {
  Typography, Card, Input, Space, Tag, Button, List,
  Badge, Empty, Segmented,
} from 'antd';
import {
  QuestionCircleOutlined, CheckCircleOutlined,
  SearchOutlined, FireOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text } = Typography;
const { Search } = Input;

interface Question {
  id: string;
  user: string;
  content: string;
  likes: number;
  answered: boolean;
  timestamp: string;
  category: string;
}

const mockQuestions: Question[] = [
  { id: '1', user: '糖友小王', content: '餐后2小时血糖多少算正常？', likes: 45, answered: true, timestamp: '14:30', category: '血糖' },
  { id: '2', user: '健康达人', content: '二甲双胍饭前还是饭后吃比较好？', likes: 38, answered: true, timestamp: '14:28', category: '用药' },
  { id: '3', user: '新糖友', content: '糖尿病人能吃水果吗？哪些适合？', likes: 67, answered: false, timestamp: '14:25', category: '饮食' },
  { id: '4', user: '养生哥', content: '空腹血糖和餐后血糖哪个更重要？', likes: 32, answered: false, timestamp: '14:22', category: '血糖' },
  { id: '5', user: '运动达人', content: '糖尿病运动时低血糖怎么办？', likes: 28, answered: false, timestamp: '14:20', category: '运动' },
  { id: '6', user: '幸福大妈', content: '胰岛素要放在冰箱吗？夏天怎么保存？', likes: 15, answered: false, timestamp: '14:18', category: '用药' },
];

const Page: React.FC = () => {
  const [filter, setFilter] = useState<'hot' | 'all' | 'answered'>('hot');
  const [search, setSearch] = useState('');

  let questions = mockQuestions;
  if (filter === 'hot') questions = [...mockQuestions].sort((a, b) => b.likes - a.likes);
  if (filter === 'answered') questions = mockQuestions.filter(q => q.answered);
  if (search) questions = questions.filter(q => q.content.includes(search));

  return (
    <MobileFrame title="互动问答" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        {/* 统计 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1677ff' }}>{mockQuestions.length}</Text>
              <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>待回答</Text>
            </div>
            <div>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>2</Text>
              <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>已回答</Text>
            </div>
            <div>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fa8c16' }}>{mockQuestions.reduce((s, q) => s + q.likes, 0)}</Text>
              <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>总热度</Text>
            </div>
          </div>
        </Card>

        <Segmented
          block
          size="small"
          value={filter}
          onChange={(v) => setFilter(v as 'hot' | 'all' | 'answered')}
          options={[
            { label: '热门', value: 'hot', icon: <FireOutlined /> },
            { label: '全部', value: 'all' },
            { label: '已回答', value: 'answered', icon: <CheckCircleOutlined /> },
          ]}
          style={{ marginBottom: 10 }}
        />

        <Search
          placeholder="搜索问题"
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ marginBottom: 10 }}
        />

        {questions.length === 0 ? (
          <Empty description="暂无匹配的问题" />
        ) : (
          questions.map(q => (
            <Card
              key={q.id}
              size="small"
              style={{
                marginBottom: 6, borderRadius: 10,
                borderLeft: q.answered ? '3px solid #52c41a' : '3px solid #fa8c16',
              }}
            >
              <Space style={{ marginBottom: 4 }}>
                <Tag color={q.category === '血糖' ? 'blue' : q.category === '用药' ? 'purple' : q.category === '饮食' ? 'green' : 'orange'}>
                  {q.category}
                </Tag>
                {q.answered && <Tag color="green" icon={<CheckCircleOutlined />}>已答</Tag>}
                <Text type="secondary" style={{ fontSize: 10 }}>
                  {q.likes} 👍
                </Text>
              </Space>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>
                    <QuestionCircleOutlined style={{ color: '#1677ff', marginRight: 4 }} />
                    {q.content}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {q.user} · {q.timestamp}
                  </Text>
                </div>
                {!q.answered && (
                  <Button size="small" type="primary" ghost style={{ borderRadius: 14, fontSize: 11 }}>
                    回答
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}

        <Card size="small" style={{ borderRadius: 10, marginTop: 12, background: '#f9f0ff' }}>
          <Space>
            <FireOutlined style={{ color: '#722ed1' }} />
            <Text style={{ fontSize: 12, color: '#722ed1' }}>
              AI已自动聚合相似问题，可一键批量回复
            </Text>
          </Space>
        </Card>
      </div>
    </MobileFrame>
  );
};

export default Page;
