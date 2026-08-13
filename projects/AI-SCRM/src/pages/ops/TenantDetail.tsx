import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Skeleton, Progress } from 'antd';
import { useOpsStore } from '../../stores/useOpsStore';

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const { tenants, loadTenants } = useOpsStore();
  const tenant = tenants.find(t => t.id === id);

  useEffect(() => { loadTenants(); }, []);

  if (!tenant) {
    return <div className="page-container"><Skeleton active paragraph={{ rows: 8 }} /></div>;
  }

  const healthScore = tenant.healthScore ?? 0;
  const aiUsagePercent = tenant.aiUsagePercent ?? 0;
  const status = tenant.status ?? 'UNKNOWN';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{tenant.companyName}</h1>
        <div className="description">{tenant.id} · {tenant.industry || '-'}</div>
      </div>

      <div className="two-column-layout">
        <Card title="基本信息">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="企业名称">{tenant.companyName}</Descriptions.Item>
            <Descriptions.Item label="行业"><Tag>{tenant.industry || '-'}</Tag></Descriptions.Item>
            <Descriptions.Item label="版本"><Tag color="purple">{tenant.version || '-'}</Tag></Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={
                status === 'ACTIVE' ? 'green' :
                status === 'PENDING' ? 'orange' :
                status === 'TRIAL' ? 'blue' : 'default'
              }>
                {status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="联系人">{tenant.contactName || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{tenant.contactPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="公司规模">{tenant.companySize || '-'}</Descriptions.Item>
            <Descriptions.Item label="注册时间">{tenant.registeredAt?.slice(0, 10)}</Descriptions.Item>
            <Descriptions.Item label="到期日期">{tenant.expireDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="是否启用">{tenant.enabled ? '启用' : '禁用'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="运营指标">
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>健康度评分</span>
                <Tag color={healthScore >= 80 ? 'green' : healthScore >= 60 ? 'orange' : 'red'}>
                  {healthScore}
                </Tag>
              </div>
              <Progress percent={healthScore} strokeColor={
                healthScore >= 80 ? '#52C41A' :
                healthScore >= 60 ? '#FAAD14' : '#FF4D4F'
              } />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>AI调用量占比</span>
                <span>{aiUsagePercent}%</span>
              </div>
              <Progress percent={aiUsagePercent} strokeColor="#1677FF" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
