/**
 * APP-健康管理师工作台
 */
import React from 'react';
import { Card, List, Tag, Row, Col } from 'antd';
import { BellOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import MobileFrame, { APP_HM_TABS } from '@/components/MobileFrame';

const AppHmWorkbenchPage: React.FC = () => {
  return (
    <MobileFrame title="HM工作台" tabs={APP_HM_TABS} basePath="/app/hm">
      <div style={{ padding: 12 }}>
        <Row gutter={8} style={{ marginBottom: 12 }}>
          {[
            { label: '预警', value: 3, color: 'var(--color-error)', icon: <WarningOutlined /> },
            { label: '待回访', value: 5, color: 'var(--color-warning)' },
            { label: '管理患者', value: 38, color: 'var(--color-primary)' },
          ].map(item => (
            <Col span={8} key={item.label}>
              <Card size="small" style={{ borderRadius: 8, textAlign: 'center' }} bodyStyle={{ padding: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 10, color: '#999' }}>{item.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<span style={{ fontSize: 13 }}><BellOutlined style={{ color: 'var(--color-error)' }} /> 预警列表 <Tag color="red">3</Tag></span>}>
          {[
            { name: '张先生', alert: '血糖持续偏高 >10mmol/L', time: '2小时前', level: '高', avatar: '👦' },
            { name: '王大爷', alert: '连续3天未记录血糖', time: '5小时前', level: '中', avatar: '👴' },
            { name: '李女士', alert: '夜间低血糖告警 3.2mmol/L', time: '昨天', level: '高', avatar: '👩' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ marginRight: 4 }}>{item.avatar}</span>{item.name}</span>
                <Tag color={item.level === '高' ? 'red' : 'orange'} style={{ fontSize: 10 }}>{item.level}</Tag>
              </div>
              <div style={{ fontSize: 11, color: '#666' }}>{item.alert}</div>
              <div style={{ fontSize: 10, color: '#999' }}>{item.time}</div>
            </div>
          ))}
        </Card>

        <Card size="small" style={{ borderRadius: 10 }}
          title={<span style={{ fontSize: 13 }}><ClockCircleOutlined /> 今日回访</span>}>
          {['09:00 张先生 · 血糖跟踪', '11:00 李女士 · 用药提醒', '14:00 王大爷 · 健康指导', '16:00 赵女士 · 新用户欢迎'].map((s, i) => (
            <div key={i} style={{ fontSize: 11, padding: '5px 0', borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
              <ClockCircleOutlined style={{ marginRight: 6 }} /> {s}
            </div>
          ))}
        </Card>
      </div>
    </MobileFrame>
  );
};

export default AppHmWorkbenchPage;
