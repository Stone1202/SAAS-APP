/**
 * PG-SUG-LIVE 讲堂直播 V1.0.0
 * 
 * 医生专题系列讲座：饮食/运动/用药/心理/并发症五大主题。
 * 支持系列化管理（多期关联）、预约提醒、回放关联。
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Space, Tag, Row, Col, List, Empty,
} from 'antd';
import {
  CalendarOutlined, PlayCircleOutlined, ClockCircleOutlined,
  UserOutlined, RightOutlined, CaretRightOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;

interface LectureSeries {
  id: string; title: string; host: string; hostTitle: string;
  episodes: number; watched: number; tags: string[]; category: string;
}

const series: LectureSeries[] = [
  {
    id: '1', title: '糖尿病饮食管理系列', host: '李医生', hostTitle: '内分泌科',
    episodes: 8, watched: 4560, tags: ['饮食', '营养', '血糖管理'], category: 'diet',
  },
  {
    id: '2', title: '科学运动控糖指南', host: '赵康复师', hostTitle: '运动医学',
    episodes: 5, watched: 3210, tags: ['运动', '康复', '血糖'], category: 'exercise',
  },
  {
    id: '3', title: '降糖药安全用药讲堂', host: '王药师', hostTitle: '临床药学',
    episodes: 6, watched: 5120, tags: ['用药', '安全', '科普'], category: 'medication',
  },
];

const upcomingLectures = [
  { id: '1', title: '第3期：胰岛素注射技巧', host: '王药师', time: '明晚 19:30' },
  { id: '2', title: '第9期：控糖餐如何搭配', host: '李医生', time: '周四 20:00' },
];

const Page: React.FC = () => {
  return (
    <MobileFrame title="讲堂直播" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        {/* Banner */}
        <Card style={{
          borderRadius: 12, marginBottom: 12,
          background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
          padding: 0, overflow: 'hidden',
        }} bodyStyle={{ padding: 16 }}>
          <Space>
            <CaretRightOutlined style={{ color: '#fa8c16', fontSize: 24 }} />
            <div>
              <Text strong style={{ color: '#fff', fontSize: 15 }}>专家讲堂</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'block' }}>
                系统化学习糖尿病管理知识
              </Text>
            </div>
          </Space>
          <Row gutter={8} style={{ marginTop: 12 }}>
            <Col span={6}><div style={{ color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 18 }}>12</div><div style={{ fontSize: 10, opacity: 0.5 }}>系列</div></div></Col>
            <Col span={6}><div style={{ color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 18 }}>68</div><div style={{ fontSize: 10, opacity: 0.5 }}>讲</div></div></Col>
            <Col span={6}><div style={{ color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 18 }}>1.2K</div><div style={{ fontSize: 10, opacity: 0.5 }}>听众</div></div></Col>
            <Col span={6}><div style={{ color: '#fff', textAlign: 'center' }}><div style={{ fontSize: 18 }}>8</div><div style={{ fontSize: 10, opacity: 0.5 }}>专家</div></div></Col>
          </Row>
        </Card>

        {/* 即将直播 */}
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>即将直播</Text>
        {upcomingLectures.map(lec => (
          <Card key={lec.id} size="small" style={{
            marginBottom: 8, borderRadius: 10,
            borderLeft: '3px solid #fa8c16',
          }}>
            <Row align="middle" justify="space-between">
              <Col flex={1}>
                <Text strong style={{ fontSize: 13 }}>{lec.title}</Text>
                <Space size={8} style={{ display: 'block', marginTop: 4 }}>
                  <Tag icon={<UserOutlined />} color="blue">{lec.host}</Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <ClockCircleOutlined /> {lec.time}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Button size="small" type="primary" shape="round" style={{ fontSize: 12 }}>
                  预约
                </Button>
              </Col>
            </Row>
          </Card>
        ))}

        {/* 讲堂系列 */}
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8, marginTop: 16 }}>
          讲堂系列
        </Text>

        {series.map(s => (
          <Card key={s.id} size="small" style={{ marginBottom: 10, borderRadius: 10 }}>
            <Row align="middle">
              <Col>
                <div style={{
                  width: 64, height: 64, borderRadius: 10,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: '#fff',
                }}>
                  {s.category === 'diet' ? '🥗' : s.category === 'exercise' ? '🏃' : '💊'}
                </div>
              </Col>
              <Col flex={1} style={{ paddingLeft: 12 }}>
                <Text strong style={{ fontSize: 14 }}>{s.title}</Text>
                <div style={{ marginTop: 4 }}>
                  <Space size={4} wrap>
                    <Tag icon={<UserOutlined />} color="blue" style={{ fontSize: 10 }}>
                      {s.host} · {s.hostTitle}
                    </Tag>
                    <Tag icon={<PlayCircleOutlined />} color="green" style={{ fontSize: 10 }}>
                      {s.episodes}讲
                    </Tag>
                    <Tag icon={<UserOutlined />} color="default" style={{ fontSize: 10 }}>
                      {s.watched}次观看
                    </Tag>
                  </Space>
                </div>
                <Space wrap size={4} style={{ marginTop: 4 }}>
                  {s.tags.map(t => (
                    <Tag key={t} style={{ fontSize: 10, background: '#f0f5ff', border: 'none' }}>{t}</Tag>
                  ))}
                </Space>
              </Col>
              <Col><RightOutlined style={{ color: '#aaa' }} /></Col>
            </Row>
          </Card>
        ))}
      </div>
    </MobileFrame>
  );
};

export default Page;
