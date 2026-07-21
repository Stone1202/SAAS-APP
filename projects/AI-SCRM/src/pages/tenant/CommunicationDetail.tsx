import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Space, Skeleton } from 'antd';
import { useCommunicationStore } from '../../stores/useCommunicationStore';
import type { CommunicationRecord } from '../../contracts/schemas';

export default function CommunicationDetail() {
  const { id } = useParams<{ id: string }>();
  const { records, loadRecords } = useCommunicationStore();
  const [record, setRecord] = useState<CommunicationRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (id && records.length > 0) {
      setRecord(records.find((r) => r.id === id) || null);
    }
  }, [id, records]);

  if (!record) {
    return <div className="page-container"><Skeleton active paragraph={{ rows: 8 }} /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>沟通记录详情</h1>
        <div className="description">
          {record.customerName} · {record.channel} · {new Date(record.createdAt).toLocaleString('zh-CN')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="沟通概要">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
            <Descriptions.Item label="渠道"><Tag>{record.channel}</Tag></Descriptions.Item>
            <Descriptions.Item label="方向">
              <Tag color={record.direction === 'inbound' ? 'blue' : 'green'}>
                {record.direction === 'inbound' ? '客户主动' : '坐席发起'}
              </Tag>
            </Descriptions.Item>
            {record.duration !== undefined && (
              <Descriptions.Item label="时长">
                {Math.floor(record.duration / 60)}分{record.duration % 60}秒
              </Descriptions.Item>
            )}
            <Descriptions.Item label="坐席">{record.agentName}</Descriptions.Item>
            <Descriptions.Item label="时间">
              {new Date(record.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {record.emotion && (
          <Card title="AI 分析">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="情绪">
                <Space>
                  <span className={`emotion-dot ${record.emotion}`} />
                  {record.emotion === 'positive' ? '正面' : record.emotion === 'neutral' ? '中性' : '负面'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="意向"><Tag>{record.intent}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Card title="沟通内容" style={{ gridColumn: '1 / -1' }}>
          <div style={{
            background: '#F5F5F5',
            padding: 20,
            borderRadius: 8,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8,
            fontSize: 14,
            color: '#333',
          }}>
            {record.content}
          </div>
        </Card>

        <Card title="沟通后AI处理" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📝</div>
              <div style={{ fontWeight: 500 }}>自动总结</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>客户对产品功能感兴趣，价格敏感</div>
            </Card>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 500 }}>质量检查</div>
              <div style={{ fontSize: 12, color: '#52C41A', marginTop: 4 }}>通过 95分</div>
            </Card>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🖼️</div>
              <div style={{ fontWeight: 500 }}>画像更新</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>已更新客户标签和意向度</div>
            </Card>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
              <div style={{ fontWeight: 500 }}>自动跟进</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>已生成跟进任务</div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
