/**
 * 仪表盘 —— 按角色展示不同内容（含趋势图表）
 * 对应 PRD FN-SUG-PC-014 经营看板
 */
import React, { useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography, Table, Tag, Empty } from 'antd';
import {
  ShoppingCartOutlined, TeamOutlined, DollarOutlined,
  RiseOutlined, FallOutlined, ProjectOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { useUserStore } from '@/stores/userStore';
import { useOrderStore } from '@/stores/orderStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// 模拟趋势数据
const TREND_DATA = (() => {
  const days = ['7/23', '7/24', '7/25', '7/26', '7/27', '7/28', '7/29'];
  return days.map((d, i) => ({
    date: d,
    GMV: 4200 + Math.random() * 3000,
    订单: 18 + Math.floor(Math.random() * 15),
    新增客户: 5 + Math.floor(Math.random() * 10),
    CGM绑定: 3 + Math.floor(Math.random() * 6),
    timestamp: 1699900000 + i * 86400,
  }));
})();

const DashboardPage: React.FC = () => {
  const { activeIdentity, account } = useUserStore();
  const { orders, total, loading, loadOrders } = useOrderStore();
  const navigate = useNavigate();
  const role = activeIdentity?.identity_role || 'PATIENT';

  useEffect(() => {
    loadOrders({ page: 1, page_size: 10 });
  }, []);

  const roleWelcome: Record<string, string> = {
    PATIENT: '欢迎回来，您的血糖数据一切正常！',
    DOCTOR: '上午好，今天有 3 位患者等待复诊。',
    PH: '本周订单量 +12%，营收持续增长！',
    OPS: '今日有待审核入驻申请 5 项。',
    NUTRITIONIST: '本月新增客户 8 人，饮食方案完成率 92%。',
  };

  const statCards: Record<string, { title: string; value: number; icon: React.ReactNode; color: string }[]> = {
    PATIENT: [
      { title: '本月订单', value: total, icon: <ShoppingCartOutlined />, color: 'var(--color-primary)' },
      { title: '血糖达标天数', value: 26, icon: <RiseOutlined />, color: 'var(--color-success)' },
    ],
    PH: [
      { title: '总订单', value: total, icon: <ShoppingCartOutlined />, color: 'var(--color-primary)' },
      { title: '本月营收', value: 36800, icon: <DollarOutlined />, color: 'var(--color-success)' },
      { title: '在售商品', value: 128, icon: <TeamOutlined />, color: 'var(--color-warning)' },
    ],
    OPS: [
      { title: '全平台订单', value: total, icon: <ShoppingCartOutlined />, color: 'var(--color-primary)' },
      { title: '待审入驻', value: 5, icon: <TeamOutlined />, color: 'var(--color-warning)' },
      { title: '本月GMV', value: 128600, icon: <DollarOutlined />, color: 'var(--color-success)' },
      { title: 'CGM绑定率', value: 68, icon: <ProjectOutlined />, color: 'var(--color-primary)' },
    ],
  };

  const cards = statCards[role] || statCards.PATIENT;
  const isBoss = role === 'OPS' || role === 'PH';

  const orderColumns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', render: (v: string) => <a onClick={() => navigate(`/orders/${v}`)}>{v}</a> },
    { title: '金额', dataIndex: 'pay_amount', key: 'pay_amount', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => {
      const colorMap: Record<string, string> = { PENDING_PAY: 'orange', PAID: 'blue', SHIPPED: 'cyan', DELIVERED: 'green', COMPLETED: 'green', REFUNDING: 'red', REFUNDED: 'red', CANCELLED: 'default' };
      const labelMap: Record<string, string> = { PENDING_PAY: '待支付', PAID: '已支付', SHIPPED: '已发货', DELIVERED: '已签收', COMPLETED: '已完成', REFUNDING: '退款中', REFUNDED: '已退款', CANCELLED: '已取消', PROCESSING: '处理中' };
      return <Tag color={colorMap[v] || 'default'}>{labelMap[v] || v}</Tag>;
    }},
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (v: number) => new Date(v * 1000).toLocaleDateString('zh-CN') },
  ];

  const colSpan = cards.length <= 2 ? 12 : cards.length <= 3 ? 8 : 6;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>{roleWelcome[role] || '欢迎使用糖伴平台'}</Title>
        <Text type="secondary">{account?.phone || ''} · {role}</Text>
      </div>

      {/* 统计卡片 */}
      {cards.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {cards.map((c, i) => (
            <Col span={colSpan} key={i}>
              <Card>
                <Statistic title={c.title} value={c.value} prefix={c.icon} valueStyle={{ color: c.color }} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 趋势图表 — 仅管理员/商家看 */}
      {isBoss && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="近7日GMV趋势">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="GMV" stroke="var(--color-primary)" fill="var(--color-primary-bg, #E3F2FD)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="近7日订单 & 新增客户">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="订单" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="新增客户" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card title="CGM绑定趋势">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="CGM绑定" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* 最近订单 */}
      <Card title="最近订单">
        {orders.length > 0 ? (
          <Table dataSource={orders} columns={orderColumns} rowKey="id" loading={loading} pagination={false} size="middle" />
        ) : (
          <Empty description="暂无订单" />
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
