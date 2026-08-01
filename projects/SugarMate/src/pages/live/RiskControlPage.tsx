/**
 * PG-SUG-LIVE 风控 V1.0.0
 * 
 * 敏感内容审核规则配置、违规主播封禁管理、
 * 风险词库维护、违规记录查询、处罚申诉入口。
 */
import React, { useState } from 'react';
import {
  Typography, Card, Table, Tag, Button, Space, Row, Col,
  Statistic, Segmented, Switch, Input, Modal, Select,
} from 'antd';
import {
  WarningOutlined, StopOutlined, SafetyCertificateOutlined,
  SearchOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;
const { Search } = Input;

interface Violation {
  id: string; host: string; room: string; type: string;
  reason: string; action: string; date: string; status: string;
}

const violations: Violation[] = [
  { id: '1', host: '李主播', room: '养生课堂', type: '虚假宣传', reason: '夸大产品功效', action: '封禁3天', date: '07-25', status: '已处罚' },
  { id: '2', host: '王营养师', room: '减肥秘诀', type: '内容违规', reason: '未授权售卖处方药', action: '警告', date: '07-13', status: '已处罚' },
];

const Page: React.FC = () => {
  const [tab, setTab] = useState<'records' | 'rules' | 'lexicon'>('records');
  const [violationDetail, setViolationDetail] = useState<Violation | null>(null);

  const vcols = [
    { title: '主播', dataIndex: 'host' },
    { title: '直播间', dataIndex: 'room' },
    { title: '违规类型', dataIndex: 'type', render: (v: string) => <Tag color="red">{v}</Tag> },
    { title: '原因', dataIndex: 'reason', ellipsis: true },
    { title: '处罚', dataIndex: 'action', render: (v: string) => <Tag color="orange">{v}</Tag> },
    { title: '日期', dataIndex: 'date', width: 60 },
    { title: '', dataIndex: 'id', width: 50, render: (_: string, r: Violation) => <Button size="small" type="link" onClick={() => setViolationDetail(r)}>详情</Button> },
  ];

  return (
    <MobileFrame title="风控" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        <Segmented
          block
          size="small"
          value={tab}
          onChange={(v) => setTab(v as 'records' | 'rules' | 'lexicon')}
          options={[
            { label: '违规记录', value: 'records' },
            { label: '审核规则', value: 'rules' },
            { label: '风险词库', value: 'lexicon' },
          ]}
          style={{ marginBottom: 12 }}
        />

        {tab === 'records' && (
          <>
            <Row gutter={8} style={{ marginBottom: 12 }}>
              <Col span={6}><Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}><Statistic title="违规总数" value={2} valueStyle={{ fontSize: 18, color: '#ff4d4f' }} /></Card></Col>
              <Col span={6}><Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}><Statistic title="处罚中" value={1} valueStyle={{ fontSize: 18, color: '#fa8c16' }} /></Card></Col>
              <Col span={6}><Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}><Statistic title="申诉中" value={0} valueStyle={{ fontSize: 18, color: '#1677ff' }} /></Card></Col>
              <Col span={6}><Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}><Statistic title="风险评分" value={28} suffix="分" valueStyle={{ fontSize: 18, color: '#52c41a' }} /></Card></Col>
            </Row>
            <Search prefix={<SearchOutlined />} placeholder="搜索主播/直播间" size="small" allowClear style={{ marginBottom: 10 }} />
            <div style={{ overflowX: 'auto' }}>
              <Table rowKey="id" dataSource={violations} columns={vcols} pagination={false} size="small" />
            </div>
          </>
        )}

        {tab === 'rules' && (
          <div>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Text strong style={{ fontSize: 13 }}>实时画面审核</Text>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>检测色情/政治/虚假宣传画面</Text>
                </div>
                <Switch defaultChecked size="small" />
              </Space>
            </Card>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Text strong style={{ fontSize: 13 }}>敏感词过滤</Text>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>弹幕/留言实时敏感词检测</Text>
                </div>
                <Switch defaultChecked size="small" />
              </Space>
            </Card>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Text strong style={{ fontSize: 13 }}>延时播出</Text>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>给审核留出缓冲时间</Text>
                </div>
                <Switch defaultChecked size="small" />
              </Space>
              <Select size="small" defaultValue={10} style={{ width: '100%', marginTop: 8 }}
                options={[
                  { label: '延时 5秒', value: 5 },
                  { label: '延时 10秒', value: 10 },
                  { label: '延时 30秒', value: 30 },
                ]} />
            </Card>
            <Card size="small" style={{ borderRadius: 10 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Text strong style={{ fontSize: 13 }}>自动处罚</Text>
                  <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>检测到违规自动执行处罚</Text>
                </div>
                <Switch size="small" />
              </Space>
            </Card>
          </div>
        )}

        {tab === 'lexicon' && (
          <div>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
              <Space><WarningOutlined style={{ color: '#ff4d4f' }} /><Text strong style={{ fontSize: 13 }}>高风险词</Text></Space>
              <Space wrap style={{ marginTop: 8 }}>
                {['微信号', '扫码加', '私聊', '加V', '代理'].map(w => (
                  <Tag key={w} closable color="red">{w}</Tag>
                ))}
              </Space>
              <Input size="small" placeholder="添加高风险词" style={{ marginTop: 8 }} />
            </Card>
            <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
              <Space><ExclamationCircleOutlined style={{ color: '#fa8c16' }} /><Text strong style={{ fontSize: 13 }}>医疗合规词</Text></Space>
              <Space wrap style={{ marginTop: 8 }}>
                {['根治', '特效', '祖传', '100%', '包好'].map(w => (
                  <Tag key={w} closable color="orange">{w}</Tag>
                ))}
              </Space>
              <Input size="small" placeholder="添加合规词" style={{ marginTop: 8 }} />
            </Card>
          </div>
        )}

        {/* 违规详情Modal */}
        <Modal title="违规详情" open={!!violationDetail} onCancel={() => setViolationDetail(null)} footer={null} width={320}>
          {violationDetail && (
            <>
              <Text strong>主播：</Text><Text>{violationDetail.host}</Text><br />
              <Text strong>直播间：</Text><Text>{violationDetail.room}</Text><br />
              <Text strong>违规类型：</Text><Tag color="red">{violationDetail.type}</Tag><br />
              <Text strong>违规原因：</Text><Text>{violationDetail.reason}</Text><br />
              <Text strong>处罚措施：</Text><Tag color="orange">{violationDetail.action}</Tag><br />
              <Text strong>日期：</Text><Text>{violationDetail.date}</Text><br />
              <Button type="primary" danger size="small" style={{ marginTop: 12 }} block>加重处罚</Button>
              <Button size="small" style={{ marginTop: 8 }} block>申诉处理</Button>
            </>
          )}
        </Modal>
      </div>
    </MobileFrame>
  );
};

export default Page;
