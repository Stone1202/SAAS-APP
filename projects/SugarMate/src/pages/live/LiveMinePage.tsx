/**
 * LiveMinePage — 主播个人中心（直播端）
 * PRD 对应：主播资质/收入/历史/设置
 */
import React, { useState } from 'react';
import { Card, Descriptions, Tag, Button, Space, List, Progress, Divider } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  StarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  VerifiedOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const LiveMinePage: React.FC = () => {
  const [anchor] = useState({
    name: '张医生',
    title: '内分泌科主治医师 · 糖友健康主播',
    verified: true,
    level: 15,
    exp: 7280,
    expToNext: 10000,
    followers: 3842,
    totalSessions: 86,
    totalHours: 124,
    totalRevenue: 52800,
    certification: '执业医师资格证 No.2024-0123456',
    platform: 'SugarMate直播端 v3.0',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f5f5', overflow: 'auto' }}>
      {/* 头部 */}
      <div style={{
        padding: '20px 16px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff', textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
          background: 'linear-gradient(135deg, #e94560, #ff6b6b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>
          <UserOutlined style={{ color: '#fff' }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {anchor.name}
          {anchor.verified && <VerifiedOutlined style={{ color: '#52c41a', marginLeft: 6, fontSize: 14 }} />}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{anchor.title}</div>

        {/* 等级 */}
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>主播等级</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ffd700' }}>Lv.{anchor.level}</div>
          </div>
          <div style={{ flex: 1, maxWidth: 120 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>经验值</div>
            <Progress percent={Math.round((anchor.exp / anchor.expToNext) * 100)} showInfo={false}
              strokeColor="#ffd700" trailColor="rgba(255,255,255,0.2)" size="small" />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
              {anchor.exp} / {anchor.expToNext}
            </div>
          </div>
        </div>
      </div>

      {/* 核心数据 */}
      <Card size="small" style={{ margin: '8px 12px' }} bodyStyle={{ padding: '10px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', textAlign: 'center' }}>
          <div><div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}>{anchor.followers.toLocaleString()}</div><div style={{ fontSize: 10, color: '#999' }}>粉丝</div></div>
          <div><div style={{ fontSize: 18, fontWeight: 600 }}>{anchor.totalSessions}</div><div style={{ fontSize: 10, color: '#999' }}>直播场次</div></div>
          <div><div style={{ fontSize: 18, fontWeight: 600 }}>{anchor.totalHours}H</div><div style={{ fontSize: 10, color: '#999' }}>累计时长</div></div>
          <div><div style={{ fontSize: 18, fontWeight: 600, color: '#e94560' }}>¥{(anchor.totalRevenue / 10000).toFixed(1)}W</div><div style={{ fontSize: 10, color: '#999' }}>累计收入</div></div>
        </div>
      </Card>

      {/* 主播资质 */}
      <Card size="small" style={{ margin: '0 12px 8px' }} title={<Space><StarOutlined /> 主播资质</Space>}
        bodyStyle={{ padding: '8px 12px' }}>
        <Descriptions size="small" column={1} colon={false}>
          <Descriptions.Item label="认证"><Tag color="green">已认证</Tag></Descriptions.Item>
          <Descriptions.Item label="资质">{anchor.certification}</Descriptions.Item>
          <Descriptions.Item label="平台">{anchor.platform}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 设置 */}
      <Card size="small" style={{ margin: '0 12px 8px' }} title={<Space><SettingOutlined /> 设置</Space>}
        bodyStyle={{ padding: 0 }}>
        <List size="small" dataSource={[
          { icon: <EditOutlined />, label: '编辑个人资料' },
          { icon: <DollarOutlined />, label: '收入提现' },
          { icon: <ClockCircleOutlined />, label: '直播录像' },
          { icon: <TrophyOutlined />, label: '成就徽章' },
          { icon: <SettingOutlined />, label: '推流设置' },
        ]} renderItem={item => (
          <List.Item style={{ padding: '8px 12px', cursor: 'pointer' }}>
            <Space>{item.icon}<span style={{ fontSize: 12 }}>{item.label}</span></Space>
            <span style={{ color: '#bbb' }}>›</span>
          </List.Item>
        )} />
      </Card>

      <Divider style={{ margin: '4px 0', fontSize: 10, color: '#ccc' }}>SugarMate 直播端</Divider>
    </div>
  );
};

export default LiveMinePage;
