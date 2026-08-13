/**
 * MpArticleDetailPage — PG-SUG-MP-002 科普内容详情
 */
import React from 'react';
import { Typography, Divider, Tag, Avatar, Space } from 'antd';
import { EyeOutlined, LikeOutlined, ShareAltOutlined } from '@ant-design/icons';
import MpPageFrame from '../../components/MpPageFrame';

const { Title, Paragraph, Text } = Typography;

const MpArticleDetailPage: React.FC = () => (
  <MpPageFrame title="科普详情">
    <div style={{ padding: 16, background: '#fff', minHeight: '100%' }}>
      <Title level={4}>糖尿病患者的饮食指南：GI值怎么看？</Title>
      <Space style={{ marginBottom: 8 }}>
        <Avatar size={24} style={{ background: '#2196F3' }}>李</Avatar>
        <Text type="secondary" style={{ fontSize: 12 }}>李医生 · 内分泌科主任</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>2025-07-28</Text>
      </Space>
      <div style={{ marginBottom: 12 }}>
        <Tag color="blue">糖尿病</Tag><Tag color="green">饮食管理</Tag><Tag color="orange">GI值</Tag>
      </div>
      <Divider />
      <Paragraph>
        <strong>食物的升糖指数（GI）</strong>是衡量碳水化合物对血糖影响的重要指标。低GI食物（GI≤55）消化吸收慢，血糖上升平缓；中GI食物（56-69）影响适中；高GI食物（≥70）速度较快。
      </Paragraph>
      <Paragraph>对于糖尿病患者，日常饮食应以低GI食物为主：</Paragraph>
      <ul>
        <li><strong>推荐主食：</strong>糙米、燕麦、全麦面包、荞麦</li>
        <li><strong>推荐蔬菜：</strong>西兰花、菠菜、苦瓜、番茄</li>
        <li><strong>推荐水果：</strong>苹果、柚子、樱桃、蓝莓</li>
        <li><strong>需要控制：</strong>白米饭、白面包、西瓜、荔枝</li>
      </ul>
      <Paragraph>记住一个小口诀：<strong>"粗粮代替细粮，先菜后饭，细嚼慢咽"</strong></Paragraph>
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'space-around', color: '#999', fontSize: 13 }}>
        <span><EyeOutlined /> 1.2k次阅读</span>
        <span><LikeOutlined /> 86赞</span>
        <span><ShareAltOutlined /> 分享</span>
      </div>
    </div>
  </MpPageFrame>
);
export default MpArticleDetailPage;
