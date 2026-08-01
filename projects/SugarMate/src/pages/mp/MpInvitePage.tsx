/**
 * PG-SUG-MP-013 邀请有礼 V1.0.0
 * 
 * 社交裂变活动：阶梯奖励（邀请N人得X）、专属邀请码+分享海报、
 * 微信分享卡片、实时进度、奖励即时发放、反作弊检测。
 * 关联UC-SUG-MP-007 邀请有礼·社交裂变
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Row, Col, Progress, Tag,
  Space, Divider, Modal, message, List,
} from 'antd';
import {
  GiftOutlined, ShareAltOutlined, UserOutlined,
  CopyOutlined, CrownOutlined, FireOutlined,
  CheckCircleOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import MpPageFrame from '../../components/MpPageFrame';

const { Text, Title } = Typography;

interface RewardTier {
  level: number; target: number; reward: string; icon: string;
  achieved: boolean; current: number;
}

const tiers: RewardTier[] = [
  { level: 1, target: 3, reward: '500积分', icon: '🥉', achieved: true, current: 3 },
  { level: 2, target: 5, reward: '20元优惠券', icon: '🥈', achieved: true, current: 5 },
  { level: 3, target: 10, reward: '免费问诊1次', icon: '🥇', achieved: false, current: 5 },
  { level: 4, target: 20, reward: '血糖仪套装', icon: '👑', achieved: false, current: 5 },
];

const inviteRecords = [
  { name: '张*华', action: '完成注册', time: '07-28', status: 'completed' },
  { name: '李*芳', action: '完成风险评估', time: '07-27', status: 'completed' },
  { name: '王*', action: '完成问诊', time: '07-26', status: 'completed' },
  { name: '刘*', action: '已注册,待完成首诊', time: '07-25', status: 'pending' },
  { name: '赵*', action: '已注册,待完成风评', time: '07-24', status: 'pending' },
];

const inviteCode = 'SUGAR2026';
const inviteLink = `https://sugarmate.com/invite/${inviteCode}`;

const Page: React.FC = () => {
  const [shareModal, setShareModal] = useState(false);
  const totalInvited = tiers[2].current; // 已邀请5人
  const completedCount = inviteRecords.filter(r => r.status === 'completed').length;

  return (
    <MpPageFrame title="邀请有礼">
      <div style={{ padding: 12 }}>
        {/* 头部Banner */}
        <Card style={{
          borderRadius: 12, marginBottom: 12,
          background: 'linear-gradient(135deg, #ff6b6b, #e74c3c)',
          border: 'none',
        }} bodyStyle={{ padding: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <CrownOutlined style={{ fontSize: 36, color: '#ffd700' }} />
            <Text strong style={{ color: '#fff', fontSize: 18, display: 'block', marginTop: 8 }}>
              邀请糖友，得超值好礼
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block', marginTop: 4 }}>
              被邀请人完成指定动作，双方各得奖励
            </Text>
          </div>
        </Card>

        {/* 活动规则 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <Space>
            <InfoCircleOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ fontSize: 13 }}>活动规则</Text>
          </Space>
          <div style={{ marginTop: 8 }}>
            {[
              '邀请好友注册SugarMate，好友完成指定动作后获得阶段奖励',
              '阶梯奖励：邀请3人得500积分，5人得优惠券，10人得免费问诊',
              '被邀请人需在30天内完成动作，超时标记为"已过期"',
              '同设备多账号注册将触发反作弊机制，奖励作废',
              '活动结束后，更多奖励请下载APP查看',
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 4, display: 'flex', alignItems: 'flex-start' }}>
                <Text style={{ marginRight: 6, color: '#1677ff', fontSize: 12 }}>{i + 1}.</Text>
                <Text style={{ fontSize: 11, color: '#555' }}>{r}</Text>
              </div>
            ))}
          </div>
        </Card>

        {/* 我的进度 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>我的进度</Text>
          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col span={8} style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1677ff', display: 'block' }}>
                {totalInvited}
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>已邀请</Text>
            </Col>
            <Col span={8} style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#52c41a', display: 'block' }}>
                {completedCount}
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>已完成</Text>
            </Col>
            <Col span={8} style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fa8c16', display: 'block' }}>
                2
              </Text>
              <Text type="secondary" style={{ fontSize: 10 }}>已获奖励</Text>
            </Col>
          </Row>

          {/* 阶梯进度 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            {tiers.map(t => (
              <div key={t.level} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: t.achieved ? '#f6ffed' : '#fafafa',
                  border: `2px solid ${t.achieved ? '#52c41a' : '#d9d9d9'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', fontSize: 16,
                }}>
                  {t.achieved ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : t.icon}
                </div>
                <Text style={{ fontSize: 10, display: 'block', marginTop: 4 }}>
                  邀请{t.target}人
                </Text>
                <Text style={{ fontSize: 9, color: t.achieved ? '#52c41a' : '#aaa', display: 'block' }}>
                  {t.reward}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        {/* 邀请码 & 分享 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>我的邀请码</Text>
          <div style={{
            background: '#f5f5f5', padding: '8px 12px', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Text strong style={{ fontSize: 18, letterSpacing: 2, color: '#1677ff' }}>
              {inviteCode}
            </Text>
            <Button size="small" icon={<CopyOutlined />}
              onClick={() => { navigator.clipboard.writeText(inviteCode); message.success('邀请码已复制'); }}>
              复制
            </Button>
          </div>
          <Button
            block
            type="primary"
            size="large"
            icon={<ShareAltOutlined />}
            style={{ marginTop: 12, borderRadius: 8 }}
            onClick={() => setShareModal(true)}
          >
            邀请微信好友
          </Button>
        </Card>

        {/* 邀请记录 */}
        <Card size="small" style={{ borderRadius: 10 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>邀请记录</Text>
          {inviteRecords.map((r, i) => (
            <div key={i} style={{
              padding: '8px 0', borderBottom: i < inviteRecords.length - 1 ? '1px solid #f5f5f5' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <Text style={{ fontSize: 12 }}>{r.name}</Text>
                <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>{r.action}</Text>
              </div>
              <Space size={4}>
                {r.status === 'completed' ? (
                  <Tag color="green" style={{ fontSize: 10 }}>已完成</Tag>
                ) : (
                  <Tag color="orange" style={{ fontSize: 10 }}>进行中</Tag>
                )}
                <Text type="secondary" style={{ fontSize: 10 }}>{r.time}</Text>
              </Space>
            </div>
          ))}
        </Card>

        {/* 分享预览弹窗 */}
        <Modal
          title="分享给微信好友"
          open={shareModal}
          onCancel={() => setShareModal(false)}
          footer={null}
          width={300}
        >
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{
              width: 200, height: 300, margin: '0 auto', borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}>
              <GiftOutlined style={{ fontSize: 48, color: '#ffd700' }} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 12 }}>
                SugarMate
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
                你的专属糖友管理平台
              </Text>
              <div style={{
                background: '#fff', color: '#667eea', padding: '4px 16px',
                borderRadius: 20, fontSize: 14, fontWeight: 'bold', marginTop: 12,
              }}>
                立即加入
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 12 }}>
                邀请码：{inviteCode}
              </Text>
            </div>
            <Button type="primary" block style={{ marginTop: 16, borderRadius: 8 }}>
              发送给朋友
            </Button>
          </div>
        </Modal>
      </div>
    </MpPageFrame>
  );
};

export default Page;
