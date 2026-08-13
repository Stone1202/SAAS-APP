/**
 * MP科普页 — 糖尿病科普知识库
 */
import React from 'react';
import { Input, Card, Tag, Row, Col } from 'antd';
import { SearchOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import MobileFrame, { MP_TABS } from '@/components/MobileFrame';

const ARTICLES = [
  { title: '糖尿病患者可以吃水果吗？', tags: ['饮食', '热门'], views: '2.3k', likes: 156, hot: true },
  { title: '空腹血糖和餐后血糖哪个更重要？', tags: ['血糖', '科普'], views: '1.8k', likes: 128, hot: true },
  { title: '夏季运动降糖注意事项', tags: ['运动', '季节'], views: '1.2k', likes: 89 },
  { title: '胰岛素注射正确方法图解', tags: ['用药', '教程'], views: '3.1k', likes: 245, hot: true },
  { title: '糖尿病肾病早期信号有哪些？', tags: ['并发症', '预警'], views: '980', likes: 67 },
  { title: '低血糖急救处理三步法', tags: ['急救', '必备'], views: '4.5k', likes: 320, hot: true },
  { title: '糖友可以喝无糖饮料吗？', tags: ['饮食', '问答'], views: '1.6k', likes: 102 },
  { title: '2型糖尿病逆转可能性分析', tags: ['前沿', '研究'], views: '2.8k', likes: 198, hot: true },
];

const MpKnowledgePage: React.FC = () => {
  return (
    <MobileFrame title="科普知识" tabs={MP_TABS} basePath="/mp">
      <div style={{ padding: 12 }}>
        {/* 搜索栏 */}
        <Input
          prefix={<SearchOutlined style={{ color: '#999' }} />}
          placeholder="搜索糖尿病相关知识..."
          style={{ borderRadius: 20, marginBottom: 12 }}
        />

        {/* 分类 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {['全部', '血糖管理', '饮食营养', '运动健康', '用药指导', '并发症', '心理健康'].map(cat => (
            <Tag
              key={cat}
              color={cat === '全部' ? 'blue' : undefined}
              style={{ borderRadius: 12, padding: '2px 12px', cursor: 'pointer', fontSize: 12 }}
            >
              {cat}
            </Tag>
          ))}
        </div>

        {/* 文章列表 */}
        {ARTICLES.map((article, i) => (
          <Card
            key={i}
            size="small"
            style={{ borderRadius: 10, marginBottom: 8, cursor: 'pointer' }}
            bodyStyle={{ padding: '10px 12px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }}>
                  {article.hot && <Tag color="red" style={{ fontSize: 10, marginRight: 4, lineHeight: '16px' }}>热</Tag>}
                  {article.title}
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  {article.tags.map(tag => (
                    <Tag key={tag} style={{ fontSize: 10, borderRadius: 8, lineHeight: '16px' }}>{tag}</Tag>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#999' }}>
                  <EyeOutlined /> {article.views} · <LikeOutlined /> {article.likes}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MobileFrame>
  );
};

export default MpKnowledgePage;
