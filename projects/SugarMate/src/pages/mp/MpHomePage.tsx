/**
 * MP首页 — 糖友健康总览
 * 实时血糖 + 今日摘要 + AI风险评估入口 + 服务快捷入口
 */
import React from 'react';
import { Card, Row, Col, Progress, Button, Badge, Space, Tag } from 'antd';
import {
  HeartOutlined, ThunderboltOutlined, FireOutlined, SunOutlined,
  RightOutlined, AlertOutlined, BookOutlined, MedicineBoxOutlined,
  EditOutlined,
} from '@ant-design/icons';
import MobileFrame, { MP_TABS } from '@/components/MobileFrame';

const MpHomePage: React.FC = () => {
  return (
    <MobileFrame title="SugarMate" tabs={MP_TABS} basePath="/mp">
      <div style={{ padding: 12 }}>
        {/* 血糖实时卡片 */}
        <Card
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #90CAF9 100%)',
            border: 'none',
            marginBottom: 12,
          }}
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>实时血糖 · 2分钟前更新</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 42, fontWeight: 700 }}>5.8</span>
              <span style={{ fontSize: 14, opacity: 0.85 }}>mmol/L</span>
              <Tag color="success" style={{ marginLeft: 8 }}>正常</Tag>
            </div>
            <div style={{ marginTop: 12 }}>
              <Progress percent={72} showInfo={false} strokeColor="#fff" trailColor="rgba(255,255,255,0.3)" size="small" />
              <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                今日在目标范围内时间 72%（10.4h / 14.4h）
              </div>
            </div>
          </div>
        </Card>

        {/* 快捷入口 */}
        <Row gutter={8} style={{ marginBottom: 12 }}>
          {[
            { icon: <EditOutlined />, label: '记录血糖', color: 'var(--color-primary)' },
            { icon: <HeartOutlined />, label: 'AI风险评估', color: 'var(--color-error)' },
            { icon: <BookOutlined />, label: '科普知识', color: 'var(--color-success)' },
            { icon: <MedicineBoxOutlined />, label: '用药提醒', color: 'var(--color-warning)' },
          ].map(item => (
            <Col span={6} key={item.label}>
              <div style={{
                background: '#fff', borderRadius: 10, padding: '10px 0',
                textAlign: 'center', cursor: 'pointer',
              }}>
                <div style={{ fontSize: 22, color: item.color, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{item.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* AI健康建议 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<Space><ThunderboltOutlined style={{ color: 'var(--color-warning)' }} /><span style={{ fontSize: 13 }}>AI健康管家</span></Space>}
          extra={<RightOutlined style={{ fontSize: 12, color: '#999' }} />}
        >
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
            今日血糖整体平稳，午餐后略有波动。建议下午增加15分钟散步。
            <Tag color="processing" style={{ marginLeft: 4, fontSize: 10 }}>查看详情</Tag>
          </div>
        </Card>

        {/* 今日摘要 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<span style={{ fontSize: 13 }}>今日摘要</span>}>
          <Row gutter={12}>
            {[
              { label: '运动', value: '4,200步', target: '6,000步', icon: '🏃' },
              { label: '饮食', value: '1,480kcal', target: '1,800kcal', icon: '🍚' },
              { label: '饮水', value: '1.2L', target: '2.0L', icon: '💧' },
            ].map(item => (
              <Col span={8} key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{item.value}</div>
                <div style={{ fontSize: 10, color: '#999' }}>目标 {item.target}</div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 直播预告 */}
        <Card size="small" style={{ borderRadius: 10 }}
          title={<Space><FireOutlined style={{ color: 'var(--color-error)' }} /><span style={{ fontSize: 13 }}>直播预告</span></Space>}
          extra={<Tag color="red" style={{ fontSize: 10 }}>即将开始</Tag>}
        >
          <div style={{ fontSize: 12, color: '#666' }}>
            <div style={{ fontWeight: 500, color: '#333', marginBottom: 4 }}>
              🩺 糖尿病患者夏季饮食指南
            </div>
            <div>👨‍⚕️ 李主任 · 内分泌科 ｜ ⏰ 今晚19:30</div>
          </div>
        </Card>
      </div>
    </MobileFrame>
  );
};

export default MpHomePage;
