/**
 * PG-SUG-PC-018 会话存档
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Row, Col, Statistic, Select, Modal, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const CHANNEL_MAP: Record<string, string> = { IM: '在线客服', PHONE: '电话', VIDEO: '视频问诊' };

const ConversationArchivePage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [curConv, setCurConv] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/conversations');
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(c => {
    if (search && !c.participants?.join('')?.includes(search)) return false;
    if (channelFilter && c.channel !== channelFilter) return false;
    return true;
  });

  const cols = [
    { title: '会话ID', dataIndex: 'id', width: 130 },
    { title: '参与人', dataIndex: 'participants', width: 200, render: (p: string[]) => p?.join(', ') },
    { title: '渠道', dataIndex: 'channel', width: 100, render: (c: string) => <Tag>{CHANNEL_MAP[c] || c}</Tag> },
    { title: '消息数', dataIndex: 'message_count', width: 80 },
    { title: '时长', dataIndex: 'duration', width: 90 },
    { title: '满意度', dataIndex: 'satisfaction', width: 90, render: (v: number) => v ? `${v}/5` : '-' },
    { title: '开始时间', dataIndex: 'started_at', width: 110, render: (v: number) => v ? new Date(v * 1000).toLocaleString() : '-' },
    { title: '操作', width: 80, render: (_: any, r: any) => (
      <Button size="small" icon={<EyeOutlined />} onClick={() => { setCurConv(r); setDetailOpen(true); }}>查看</Button>
    )},
  ];

  const stats = { total: list.length, im: list.filter(c => c.channel === 'IM').length, video: list.filter(c => c.channel === 'VIDEO').length };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="会话总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="在线客服" value={stats.im} /></Card></Col>
        <Col span={6}><Card><Statistic title="视频问诊" value={stats.video} /></Card></Col>
      </Row>
      <Card title="会话存档">
        <Space style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="搜索参与人" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 200 }} />
          <Select placeholder="渠道" allowClear style={{ width: 130 }} value={channelFilter} onChange={setChannelFilter}
            options={Object.entries(CHANNEL_MAP).map(([k, v]) => ({ value: k, label: v }))} />
        </Space>
        <Table rowKey="id" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>
      <Modal title="会话详情" open={detailOpen} onCancel={() => { setDetailOpen(false); setCurConv(null); }} footer={null} width={640}>
        {curConv && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="会话ID" span={2}>{curConv.id}</Descriptions.Item>
            <Descriptions.Item label="参与人" span={2}>{curConv.participants?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="渠道" span={1}><Tag>{CHANNEL_MAP[curConv.channel] || curConv.channel}</Tag></Descriptions.Item>
            <Descriptions.Item label="消息数" span={1}>{curConv.message_count}</Descriptions.Item>
            <Descriptions.Item label="时长" span={1}>{curConv.duration}</Descriptions.Item>
            <Descriptions.Item label="满意度" span={1}>{curConv.satisfaction || '-'}</Descriptions.Item>
            <Descriptions.Item label="开始时间" span={2}>{curConv.started_at ? new Date(curConv.started_at * 1000).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="消息记录" span={2}>
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {(curConv.messages || []).map((m: any, i: number) => (
                  <div key={i} style={{ marginBottom: 8, padding: 4 }}>
                    <strong>{m.sender}:</strong> <span>{m.content}</span>
                    <div style={{ fontSize: 11, color: '#999' }}>{m.time}</div>
                  </div>
                ))}
                {(!curConv.messages || curConv.messages.length === 0) && '暂无消息记录'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ConversationArchivePage;
