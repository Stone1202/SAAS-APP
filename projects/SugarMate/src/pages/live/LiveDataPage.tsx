/**
 * LiveDataPage — 主播数据统计（直播端）
 * PRD FN-SUG-LIVE-020 对应：直播收入结算、观看数据、转化分析
 */
import React, { useState } from 'react';
import { Card, Statistic, Progress, Table, Tag, Space, Segmented, Empty } from 'antd';
import {
  RiseOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  FallOutlined,
} from '@ant-design/icons';

interface LiveSession {
  key: string;
  date: string;
  title: string;
  duration: number;
  peakViewers: number;
  avgViewers: number;
  orders: number;
  revenue: number;
  newFollowers: number;
  likes: number;
}

const MOCK_SESSIONS: LiveSession[] = [
  { key: '1', date: '2026-07-29', title: '糖尿病饮食指南',      duration: 92, peakViewers: 320, avgViewers: 186, orders: 45, revenue: 3250, newFollowers: 28, likes: 4200 },
  { key: '2', date: '2026-07-27', title: 'CGM使用技巧分享',      duration: 65, peakViewers: 280, avgViewers: 152, orders: 38, revenue: 2850, newFollowers: 22, likes: 3800 },
  { key: '3', date: '2026-07-25', title: '糖友互助交流会',        duration: 120,peakViewers: 410, avgViewers: 245, orders: 62, revenue: 5100, newFollowers: 45, likes: 6200 },
  { key: '4', date: '2026-07-22', title: '低血糖急救知识',       duration: 55, peakViewers: 250, avgViewers: 138, orders: 20, revenue: 1480, newFollowers: 15, likes: 2800 },
  { key: '5', date: '2026-07-20', title: '健康食品品鉴',          duration: 78, peakViewers: 350, avgViewers: 206, orders: 55, revenue: 4200, newFollowers: 32, likes: 5100 },
];

const COLUMNS = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 80, render: (d: string) => d.slice(5) },
  { title: '标题', dataIndex: 'title', key: 'title', width: 110, render: (t: string) => <span style={{ fontSize: 11 }}>{t}</span> },
  { title: '时长', dataIndex: 'duration', key: 'duration', width: 45, render: (d: number) => `${d}min` },
  { title: '峰值', dataIndex: 'peakViewers', key: 'peakViewers', width: 40 },
  { title: '订单', dataIndex: 'orders', key: 'orders', width: 35 },
  {
    title: '收入', dataIndex: 'revenue', key: 'revenue', width: 55,
    render: (r: number) => <span style={{ color: '#e94560', fontWeight: 600 }}>¥{r.toLocaleString()}</span>,
  },
];

const LiveDataPage: React.FC = () => {
  const [view, setView] = useState<'overview' | 'history'>('overview');

  const total = MOCK_SESSIONS.reduce((s, sess) => ({
    duration: s.duration + sess.duration,
    peakViewers: Math.max(s.peakViewers, sess.peakViewers),
    avgViewers: s.avgViewers + sess.avgViewers,
    orders: s.orders + sess.orders,
    revenue: s.revenue + sess.revenue,
    newFollowers: s.newFollowers + sess.newFollowers,
    likes: s.likes + sess.likes,
    sessions: s.sessions + 1,
  }), { duration: 0, peakViewers: 0, avgViewers: 0, orders: 0, revenue: 0, newFollowers: 0, likes: 0, sessions: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f5f5', overflow: 'hidden' }}>
      {/* 视图切换 */}
      <div style={{ padding: '8px 12px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Segmented size="small" options={[
          { label: <Space><RiseOutlined /> 概览</Space>, value: 'overview' },
          { label: <Space><ClockCircleOutlined /> 历史</Space>, value: 'history' },
        ]} value={view} onChange={v => setView(v as 'overview' | 'history')} block />
      </div>

      {view === 'overview' ? (
        /* ============ 概览 ============ */
        <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
          {/* 核心指标 */}
          <Card size="small" style={{ marginBottom: 8 }} bodyStyle={{ padding: '10px 12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 16px' }}>
              <Statistic title="总场次" value={total.sessions} suffix="场" valueStyle={{ fontSize: 18 }} />
              <Statistic title="总时长" value={total.duration} suffix="min" valueStyle={{ fontSize: 18 }} />
              <Statistic title="新增粉丝" value={total.newFollowers} suffix="人" valueStyle={{ fontSize: 18, color: '#52c41a' }} />
            </div>
          </Card>

          {/* 收入与转化 */}
          <Card size="small" style={{ marginBottom: 8 }} bodyStyle={{ padding: '10px 12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <Statistic title="总收入" value={total.revenue} prefix={<DollarOutlined />} suffix="元"
                valueStyle={{ fontSize: 20, color: '#e94560' }} />
              <Statistic title="总订单" value={total.orders} prefix={<ShoppingCartOutlined />} suffix="单"
                valueStyle={{ fontSize: 20 }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>平均转化率 (观众→下单)</div>
              <Progress percent={Math.round((total.orders / total.avgViewers) * 100) || 12}
                strokeColor="#e94560" format={p => `${p}%`} size="small" />
            </div>
          </Card>

          {/* 观众趋势 */}
          <Card size="small" title={<span style={{ fontSize: 12 }}>📈 观众趋势</span>} bodyStyle={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, justifyContent: 'center' }}>
              {MOCK_SESSIONS.slice().reverse().map((s, i) => (
                <div key={s.key} style={{ textAlign: 'center' }}>
                  <div style={{ width: 28, height: s.peakViewers / 5.5, background: 'linear-gradient(180deg, #e94560, #ff6b6b)', borderRadius: '4px 4px 0 0', margin: '0 auto' }} />
                  <div style={{ fontSize: 8, color: '#999', marginTop: 2 }}>{s.date.slice(5)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Space size={4}><span style={{ width: 8, height: 8, background: '#e94560', borderRadius: 2, display: 'inline-block' }} /><span style={{ fontSize: 10, color: '#999' }}>峰值</span></Space>
              <Space size={4}><span style={{ width: 8, height: 8, background: '#ff6b6b', borderRadius: 2, display: 'inline-block' }} /><span style={{ fontSize: 10, color: '#999' }}>平均</span></Space>
            </div>
          </Card>
        </div>
      ) : (
        /* ============ 历史场次 ============ */
        <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
          <Table dataSource={MOCK_SESSIONS} columns={COLUMNS} size="small" pagination={false}
            scroll={{ y: 'calc(100vh - 250px)' }} locale={{ emptyText: <Empty description="暂无直播记录" /> }} />
        </div>
      )}
    </div>
  );
};

export default LiveDataPage;
