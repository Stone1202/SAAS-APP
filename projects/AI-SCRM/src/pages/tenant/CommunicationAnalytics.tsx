import { useEffect } from 'react';
import { Card, Select, Space, Progress, Tag } from 'antd';
import { useDashboardStore } from '../../stores/useDashboardStore';

export default function CommunicationAnalytics() {
  const { tenantStats, loading, loadTenantStats } = useDashboardStore();

  useEffect(() => { loadTenantStats(); }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>沟通分析看板</h1>
        <div className="description">数据分析看板，涵盖沟通量、渠道分布、情绪分析和AI辅助效果</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select defaultValue="month" style={{ width: 100 }} options={[
            { label: '本月', value: 'month' }, { label: '上周', value: 'week' }, { label: '本季', value: 'quarter' },
          ]} />
          <Select defaultValue="all" style={{ width: 100 }} options={[{ label: '全部坐席', value: 'all' }]} />
        </Space>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-value">{tenantStats?.totalCommunications || '-'}</div>
          <div className="stat-label">总沟通数</div>
          <div className="stat-trend up">↑12% vs 上月</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tenantStats?.aiAssistPercent || '-'}%</div>
          <div className="stat-label">AI辅助占比</div>
          <div className="stat-trend up">↑5% vs 上月</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tenantStats?.avgSatisfaction || '-'}</div>
          <div className="stat-label">平均满意度</div>
          <div className="stat-trend up">↑0.3 vs 上月</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">8min</div>
          <div className="stat-label">平均沟通时长</div>
        </div>
      </div>

      <div className="two-column-layout" style={{ marginBottom: 16 }}>
        <Card title="沟通量趋势">
          <div style={{ height: 200, background: '#F5F5F5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 18, color: '#1677FF', letterSpacing: 4 }}>
                /\  /\  /\  /\
                /  \/  \/  \/  \
              </div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>折线图（沟通量趋势）</div>
            </div>
          </div>
        </Card>

        <Card title="渠道分布">
          <div style={{ height: 200, background: '#F5F5F5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14 }}>
                <div>企微 <Tag color="green">55%</Tag></div>
                <div>电话 <Tag color="blue">25%</Tag></div>
                <div>短信 <Tag color="orange">12%</Tag></div>
                <div>邮件 <Tag color="purple">8%</Tag></div>
              </div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>饼图（渠道分布）</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="two-column-layout">
        <Card title="情绪分布">
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="emotion-dot positive" />
              正面 <Progress percent={65} strokeColor="#52C41A" size="small" />
            </div>
            <div style={{ marginBottom: 8 }}>
              <span className="emotion-dot neutral" />
              中性 <Progress percent={25} strokeColor="#1677FF" size="small" />
            </div>
            <div>
              <span className="emotion-dot negative" />
              负面 <Progress percent={10} strokeColor="#FF4D4F" size="small" />
            </div>
          </div>
        </Card>

        <Card title="实时情绪看板（主管）">
          <div style={{ padding: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {[
                { name: '坐席A', emo: 'positive' },
                { name: '坐席B', emo: 'neutral' },
                { name: '坐席C', emo: 'positive' },
                { name: '坐席D', emo: 'negative' },
                { name: '坐席E', emo: 'positive' },
              ].map((s) => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <span className={`emotion-dot ${s.emo}`} />
                    {s.name}
                  </Space>
                  {s.emo === 'negative' && (
                    <a style={{ color: '#FF4D4F', fontSize: 12 }}>点击介入 →</a>
                  )}
                </div>
              ))}
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}
