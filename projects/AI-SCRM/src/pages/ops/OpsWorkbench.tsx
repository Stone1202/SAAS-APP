import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Skeleton, Tag, Space } from 'antd';
import { useDashboardStore } from '../../stores/useDashboardStore';

export default function OpsWorkbench() {
  const navigate = useNavigate();
  const { opsStats, loading, loadOpsStats } = useDashboardStore();

  useEffect(() => { loadOpsStats(); }, []);

  if (loading || !opsStats) {
    return <div className="page-container"><Skeleton active paragraph={{ rows: 8 }} /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>运营工作台</h1>
        <div className="description">SAAS平台运营总览，涵盖租户、交易、AI用量等核心指标</div>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-value">{opsStats.totalTenants}</div>
          <div className="stat-label">总租户</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{opsStats.activeTenants}</div>
          <div className="stat-label">活跃租户</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{opsStats.trialTenants}</div>
          <div className="stat-label">试用中</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{opsStats.newTenantsThisMonth}</div>
          <div className="stat-label">本月新增</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">¥{(opsStats.mrr / 1000).toFixed(0)}K</div>
          <div className="stat-label">月MRR</div>
        </div>
      </div>

      <div className="two-column-layout" style={{ marginBottom: 16 }}>
        <Card
          title="待审批事项"
          extra={<a onClick={() => navigate('/ops/tenants')}>查看全部 →</a>}
        >
          {opsStats.pendingApprovals.tenantReviews > 0 && (
            <div
              style={{ padding: '10px 0', borderBottom: '1px solid #F5F5F5', cursor: 'pointer' }}
              onClick={() => navigate('/ops/tenants')}
            >
              <Tag color="orange">待审核</Tag> 新租户审核 ×{opsStats.pendingApprovals.tenantReviews}
            </div>
          )}
          {opsStats.pendingApprovals.refundApprovals > 0 && (
            <div
              style={{ padding: '10px 0', borderBottom: '1px solid #F5F5F5', cursor: 'pointer' }}
              onClick={() => navigate('/ops/subscriptions')}
            >
              <Tag color="orange">待处理</Tag> 退款审批 ×{opsStats.pendingApprovals.refundApprovals}
            </div>
          )}
          {opsStats.pendingApprovals.thresholdAlerts > 0 && (
            <div style={{ padding: '10px 0' }}>
              <Tag color="red">告警</Tag> 阈值告警 ×{opsStats.pendingApprovals.thresholdAlerts}
            </div>
          )}
        </Card>

        <Card title="异常告警">
          <div style={{ padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
            <Tag color="red">异常</Tag> 租户A 连续3月AI用量下降40%
          </div>
          <div style={{ padding: '10px 0' }}>
            <Tag color="red">异常</Tag> 租户B 账单逾期7天
          </div>
        </Card>
      </div>

      <div className="two-column-layout">
        <Card title="租户注册趋势">
          <div style={{ height: 200, background: '#F5F5F5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#999' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#1677FF' }}>
                /\  /\  /\
                /  \/  \/  \
              </div>
              <div style={{ fontSize: 12, marginTop: 8 }}>折线图（注册趋势）</div>
            </div>
          </div>
        </Card>

        <Card title="版本分布">
          <div style={{ height: 200, background: '#F5F5F5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', fontSize: 14 }}>
              <div>体验版 <Tag color="green">40%</Tag></div>
              <div>基础版 <Tag color="blue">30%</Tag></div>
              <div>专业版 <Tag color="purple">20%</Tag></div>
              <div>企业版 <Tag color="red">10%</Tag></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
