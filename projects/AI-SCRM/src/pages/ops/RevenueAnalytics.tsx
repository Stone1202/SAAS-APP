import { useEffect } from 'react';
import { Card, Select, Space, Progress, Tag } from 'antd';
import { useDashboardStore } from '../../stores/useDashboardStore';

export default function RevenueAnalytics() {
  const { opsStats, loadOpsStats } = useDashboardStore();

  useEffect(() => { loadOpsStats(); }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>营收分析看板</h1>
        <div className="description">SAAS平台营收全景，涵盖MRR/ARR/留存/收入拆分等核心财务指标</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select defaultValue="month" style={{ width: 100 }} options={[
            { label: '本月', value: 'month' }, { label: '本季', value: 'quarter' }, { label: '本年', value: 'year' },
          ]} />
          <Select defaultValue="all" style={{ width: 100 }} options={[{ label: '全部版本', value: 'all' }]} />
        </Space>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-value">¥{(opsStats?.mrr || 0 / 1000).toFixed(0)}K</div>
          <div className="stat-label">MRR</div>
          <div className="stat-trend up">↑15% MoM</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">¥{(opsStats?.arr || 0 / 10000).toFixed(1)}M</div>
          <div className="stat-label">ARR</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">¥{opsStats?.arpu || '-'}</div>
          <div className="stat-label">ARPU</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{opsStats?.renewalRate || '-'}%</div>
          <div className="stat-label">续费率</div>
        </div>
      </div>

      <div className="two-column-layout" style={{ marginBottom: 16 }}>
        <Card title="MRR趋势">
          <div style={{ height: 200, background: '#F5F5F5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#999' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#1677FF' }}>
                /\
                /  \  /\
                /    \/  \___
              </div>
              <div style={{ fontSize: 12, marginTop: 8 }}>面积图（MRR月度趋势）</div>
            </div>
          </div>
        </Card>

        <Card title="收入拆分">
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 8 }}>
              订阅收入 <Progress percent={75} strokeColor="#1677FF" size="small" />
            </div>
            <div style={{ marginBottom: 8 }}>
              AI超额 <Progress percent={15} strokeColor="#52C41A" size="small" />
            </div>
            <div>
              增值服务 <Progress percent={10} strokeColor="#FAAD14" size="small" />
            </div>
          </div>
        </Card>
      </div>

      <div className="two-column-layout">
        <Card title="租户留存漏斗">
          <div style={{ padding: 8 }}>
            {[
              { label: '注册', count: opsStats?.totalTenants || 0, color: '#1677FF' },
              { label: '试用', count: opsStats?.trialTenants || 0, color: '#722ED1' },
              { label: '活跃', count: opsStats?.activeTenants || 0, color: '#52C41A' },
              { label: '续费', count: Math.round((opsStats?.activeTenants || 0) * 0.95), color: '#FAAD14' },
            ].map((s) => (
              <div key={s.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{s.label}</span>
                  <Tag color={s.color}>{s.count}</Tag>
                </div>
                <Progress
                  percent={Math.round((s.count / (opsStats?.totalTenants || 1)) * 100)}
                  strokeColor={s.color}
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top 10 租户收入排行">
          {[
            { name: '同仁堂', amount: 28000 },
            { name: '健康云科技', amount: 15000 },
            { name: '百草堂药业', amount: 12000 },
            { name: '美丽化妆', amount: 999 },
          ].map((t, i) => (
            <div key={t.name} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: i < 3 ? '1px solid #F5F5F5' : 'none',
            }}>
              <span>#{i + 1} {t.name}</span>
              <span style={{ color: '#FF4D4F', fontWeight: 500 }}>¥{t.amount.toLocaleString()}/月</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
