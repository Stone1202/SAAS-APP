import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCommunicationStore } from '../../stores/useCommunicationStore';
import type { CommunicationRecord } from '../../contracts/schemas';

const chanelColor: Record<string, string> = { '企微': 'green', '电话': 'blue', '短信': 'orange', '邮件': 'purple' };
const emotionLabel: Record<string, string> = { positive: '😊 正面', neutral: '😐 中性', negative: '😟 负面' };

export default function CommunicationRecords() {
  const navigate = useNavigate();
  const { records, loading, loadRecords } = useCommunicationStore();

  useEffect(() => { loadRecords(); }, []);

  const columns: ColumnsType<CommunicationRecord> = [
    { title: '客户', dataIndex: 'customerName', key: 'customerName', width: 100 },
    {
      title: '渠道',
      dataIndex: 'channel',
      key: 'channel',
      width: 80,
      render: (c: string) => <Tag color={chanelColor[c] || 'default'}>{c}</Tag>,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (c: string) => <span style={{ color: '#666' }}>{c?.slice(0, 50)}{c?.length > 50 ? '...' : ''}</span>,
    },
    {
      title: '情绪',
      dataIndex: 'emotion',
      key: 'emotion',
      width: 100,
      render: (e: string) => e ? <span>{emotionLabel[e]}</span> : '-',
    },
    {
      title: '意向',
      dataIndex: 'intent',
      key: 'intent',
      width: 90,
      render: (i: string) => i ? <Tag>{i}</Tag> : '-',
    },
    { title: '坐席', dataIndex: 'agentName', key: 'agentName', width: 100 },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, r) => <a onClick={() => navigate(`/tenant/communication/records/${r.id}`)}>详情</a>,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>沟通记录</h1>
        <div className="description">查看所有客户沟通记录，支持按渠道、情绪、意向筛选</div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          onRow={(r) => ({
            onClick: () => navigate(`/tenant/communication/records/${r.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
}
