import { Card, Progress, Tag } from 'antd';

// PG-OPS-PC-007 AI用量统计（简化覆盖）
export default function AiUsageStats() {
  const tenants = [
    { name: '同仁堂', percent: 68, calls: 12800, color: '#1677FF' },
    { name: '百草堂药业', percent: 55, calls: 9800, color: '#52C41A' },
    { name: '健康云科技', percent: 42, calls: 7200, color: '#722ED1' },
    { name: '美丽化妆', percent: 28, calls: 4200, color: '#FAAD14' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI用量统计</h1>
        <div className="description">监控各租户的AI能力调用量、配额使用率和超额情况</div>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-value">34,000</div>
          <div className="stat-label">总AI调用次数</div>
          <div className="stat-trend up">↑18% vs 上月</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">68%</div>
          <div className="stat-label">平均使用率</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">8</div>
          <div className="stat-label">超额租户</div>
          <div className="stat-trend down">↓3</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">¥12K</div>
          <div className="stat-label">超额收入</div>
          <div className="stat-trend up">↑22%</div>
        </div>
      </div>

      <Card title="租户AI用量排行">
        {tenants.map((t) => (
          <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ width: 120 }}>{t.name}</span>
            <Progress percent={t.percent} strokeColor={t.color} style={{ flex: 1 }} />
            <Tag>{t.calls.toLocaleString()} 次</Tag>
          </div>
        ))}
      </Card>
    </div>
  );
}
