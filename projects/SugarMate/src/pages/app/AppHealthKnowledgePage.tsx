import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, Tag } from 'antd-mobile';
import { LeftOutline, SoundOutline, HeartOutline, StarOutline } from 'antd-mobile-icons';

const HEALTH_TIPS = [
  { id: 1, tag: '饮食', title: '糖友夏季水果怎么选？记住这3点', reads: '1.2k', icon: <SoundOutline /> },
  { id: 2, tag: '运动', title: '饭后半小时散步，血糖下降15%', reads: '980', icon: <HeartOutline /> },
  { id: 3, tag: '科普', title: 'CGM传感器佩戴注意事项', reads: '2.1k', icon: <StarOutline /> },
  { id: 4, tag: '饮食', title: '低GI主食替代方案，控糖又饱腹', reads: '3.4k', icon: <SoundOutline /> },
  { id: 5, tag: '用药', title: '胰岛素注射部位轮换技巧', reads: '2.8k', icon: <StarOutline /> },
  { id: 6, tag: '监测', title: '空腹血糖与餐后血糖的区别', reads: '1.6k', icon: <HeartOutline /> },
];

const TAG_COLORS: Record<string, string> = {
  饮食: '#52c41a',
  运动: '#fa8c16',
  科普: '#1890ff',
  用药: '#722ed1',
  监测: '#13c2c2',
};

const AppHealthKnowledgePage: React.FC = () => {
  const nav = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar
        backArrow={<LeftOutline />}
        onBack={() => nav(-1)}
        style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}
      >
        健康科普
      </NavBar>

      <div style={{ padding: '12px 16px' }}>
        {HEALTH_TIPS.map((tip, i) => (
          <Card
            key={tip.id}
            style={{ marginBottom: 10, borderRadius: 10, border: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '12px 14px' }}
            onClick={() => nav(`/app/health/knowledge/${tip.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${TAG_COLORS[tip.tag] || '#1890ff'}15`, color: TAG_COLORS[tip.tag] || '#1890ff', fontSize: 16,
              }}>
                {tip.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tip.title}
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  <Tag color={TAG_COLORS[tip.tag] || 'default'} style={{ fontSize: 10, marginRight: 8, borderRadius: 6 }}>{tip.tag}</Tag>
                  {tip.reads}阅读
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AppHealthKnowledgePage;
