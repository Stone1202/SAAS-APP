/**
 * APP营养师工作台
 */
import React from 'react';
import { Card, List, Tag, Row, Col } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import MobileFrame, { APP_NUTRITIONIST_TABS } from '@/components/MobileFrame';

const AppNutritionistWorkbenchPage: React.FC = () => {
  return (
    <MobileFrame title="营养师工作台" tabs={APP_NUTRITIONIST_TABS} basePath="/app/nutritionist">
      <div style={{ padding: 12 }}>
        <Row gutter={8} style={{ marginBottom: 12 }}>
          {[
            { label: '今日咨询', value: 8, color: 'var(--color-primary)' },
            { label: '待处理', value: 2, color: 'var(--color-error)' },
            { label: '方案跟踪', value: 15, color: 'var(--color-success)' },
          ].map(item => (
            <Col span={8} key={item.label}>
              <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }} bodyStyle={{ padding: '10px 8px' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 10, color: '#999' }}>{item.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<span style={{ fontSize: 13 }}>待处理 <Tag color="red">2</Tag></span>}>
          {[
            { name: '张先生', task: '饮食方案调整', time: '今天', note: '餐后血糖持续偏高' },
            { name: '李女士', task: '新用户首次评估', time: '今天', note: '刚确诊，需要全面饮食指导' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '8px 0', borderBottom: i < 1 ? '1px solid #f0f0f0' : 'none',
              fontSize: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>{item.name} · {item.task}</span>
                <span style={{ color: '#999' }}>{item.time}</span>
              </div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{item.note}</div>
            </div>
          ))}
        </Card>

        <Card size="small" style={{ borderRadius: 10 }}
          title={<span style={{ fontSize: 13 }}>今日日程</span>}>
          {['09:30 饮食方案制定 · 张先生', '11:00 视频咨询 · 新用户', '14:00 跟踪回访 · 王大爷', '19:30 直播 · 低GI饮食科普']
            .map((s, i) => (
              <div key={i} style={{ fontSize: 11, padding: '4px 0', borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
                <ClockCircleOutlined style={{ marginRight: 6 }} /> {s}
              </div>
            ))}
        </Card>
      </div>
    </MobileFrame>
  );
};

export default AppNutritionistWorkbenchPage;
