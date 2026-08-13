/**
 * 订单列表页 V1.0.0
 * 
 * 职能：
 * 1. Tab栏按商品类型/订单状态筛选
 * 2. 订单卡片——含商品类型标签、状态进度、关键操作按钮
 * 3. 冷链订单温控状态显示
 * 4. 处方药订单处方校验进度
 */
import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Space, Tag, Tabs, Empty, message, Badge } from 'antd';
import {
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  CoffeeOutlined,
  ShoppingCartOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useOrderStore } from '../../../../stores/orderStore';
import type { ProductType, OrderStatus } from '../../../../contracts/trade';
import { PRODUCT_TYPE_LABEL, ORDER_STATUS_LABEL } from '../../../../contracts/trade';
import { getOrderNextActionHint } from '../../../../services/order-router';

const PRODUCT_TYPE_META: Record<ProductType, { icon: React.ReactNode; color: string }> = {
  OTC: { icon: <MedicineBoxOutlined />, color: '#52c41a' },
  RX: { icon: <SafetyCertificateOutlined />, color: '#f5222d' },
  DEVICE: { icon: <ExperimentOutlined />, color: '#722ed1' },
  SUPPLEMENT: { icon: <CoffeeOutlined />, color: '#fa8c16' },
  FOOD: { icon: <CoffeeOutlined />, color: '#1677ff' },
  DAILY: { icon: <ShoppingCartOutlined />, color: '#8c8c8c' },
  SERVICE: { icon: <CustomerServiceOutlined />, color: '#13c2c2' },
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAY: '#faad14', PAID: '#1677ff', PROCESSING: '#1677ff',
  RX_CHECKING: '#722ed1', AWAITING_SHIP: '#1677ff', SHIPPED: '#52c41a',
  COLD_CHAIN_EXCEPTION: '#f5222d', DELIVERED: '#52c41a', COMPLETED: '#8c8c8c',
  CANCELLED: '#8c8c8c', REFUNDING: '#fa8c16', REFUNDED: '#8c8c8c',
};

// 模拟订单
const MOCK_ORDERS: any[] = [
  { id: 'ord-001', order_no: 'SG202607290001', product_types: ['OTC'], has_rx_item: false, has_cold_chain_item: false, items_count: 2, total_amount: 256, pay_amount: 256, status: 'PAID', created_at: Date.now()/1000 - 3600 },
  { id: 'ord-002', order_no: 'SG202607290002', product_types: ['RX'], has_rx_item: true, has_cold_chain_item: true, items_count: 1, total_amount: 218, pay_amount: 218, status: 'RX_CHECKING', rx_check_result: { passed: false }, created_at: Date.now()/1000 - 7200 },
  { id: 'ord-004', order_no: 'SG202607270001', product_types: ['SUPPLEMENT'], items_count: 2, total_amount: 580, pay_amount: 560, status: 'COMPLETED', created_at: Date.now()/1000 - 172800 },
  { id: 'ord-005', order_no: 'SG202607260001', product_types: ['OTC'], has_cold_chain_item: true, items_count: 1, total_amount: 218, pay_amount: 218, status: 'SHIPPED', cold_chain_resend_count: 0, created_at: Date.now()/1000 - 259200 },
  { id: 'ord-006', order_no: 'SG202607250001', product_types: ['SERVICE'], items_count: 1, total_amount: 299, pay_amount: 299, status: 'PAID', created_at: Date.now()/1000 - 345600 },
  { id: 'ord-007', order_no: 'SG202607240001', product_types: ['RX', 'OTC'], has_rx_item: true, items_count: 3, total_amount: 586, pay_amount: 586, status: 'PROCESSING', created_at: Date.now()/1000 - 432000 },
  { id: 'ord-008', order_no: 'SG202607230001', product_types: ['RX'], has_rx_item: true, has_cold_chain_item: true, items_count: 1, total_amount: 328, pay_amount: 328, status: 'SHIPPED', rx_check_result: { passed: true }, created_at: Date.now()/1000 - 518400 },
];

const STATUS_TABS = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING_PAY', label: '待付款' },
  { key: 'RX_CHECKING', label: '处方审核' },
  { key: 'SHIPPED', label: '配送中' },
  { key: 'COMPLETED', label: '已完成' },
];

export default function OrderListPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [orders] = useState(MOCK_ORDERS);

  const filtered = activeTab === 'ALL'
    ? orders
    : orders.filter(o => o.status === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_PAY': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'COMPLETED': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'CANCELLED': case 'REFUNDED': return <CloseCircleOutlined style={{ color: '#8c8c8c' }} />;
      default: return null;
    }
  };

  const getOrderAction = (order: any) => {
    switch (order.status) {
      case 'PENDING_PAY':
        return <Button type="primary" size="small" style={{ borderRadius: 8 }}>去支付</Button>;
      case 'SHIPPED':
        if (order.has_cold_chain_item) {
          return <Button size="small" style={{ borderRadius: 8, color: '#1677ff' }}>查看温控</Button>;
        }
        return <Button size="small" style={{ borderRadius: 8 }}>查看物流</Button>;
      case 'DELIVERED':
        return <Button type="primary" size="small" style={{ borderRadius: 8 }}>确认收货</Button>;
      case 'RX_CHECKING':
        return <Typography.Text style={{ color: '#722ed1', fontSize: 12 }}>审核中...</Typography.Text>;
      case 'COMPLETED':
        return <Button size="small" style={{ borderRadius: 8 }}>再次购买</Button>;
      default:
        return <Button size="small" style={{ borderRadius: 8 }}>查看详情</Button>;
    }
  };

  return (
    <AppPageFrame title="我的订单">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ padding: '0 16px' }}
        tabBarStyle={{ marginBottom: 8 }}
        items={STATUS_TABS.map(t => ({ key: t.key, label: t.label }))}
      />

      <div style={{ padding: '0 16px 16px', overflow: 'auto', flex: 1 }}>
        {filtered.length === 0 ? (
          <Empty description="暂无订单" style={{ marginTop: 60 }} />
        ) : (
          filtered.map(order => {
            const types = order.product_types || [];
            const statusColor = STATUS_COLOR[order.status] || '#1677ff';
            const hint = getOrderNextActionHint(order.status, order.has_rx_item, order.has_cold_chain_item);
            
            return (
              <Card
                key={order.id}
                size="small"
                style={{ borderRadius: 12, marginBottom: 12 }}
                onClick={() => message.info('查看订单详情')}
              >
                {/* 商品类型标签行 */}
                <div style={{ marginBottom: 8 }}>
                  {types.map((t: ProductType) => {
                    const meta = PRODUCT_TYPE_META[t];
                    return (
                      <Tag key={t} color={meta.color} style={{ borderRadius: 4, marginBottom: 4 }}>
                        {meta.icon} {PRODUCT_TYPE_LABEL[t]}
                      </Tag>
                    );
                  })}
                  {order.has_cold_chain_item && (
                    <Badge status="processing" text={<Typography.Text style={{ fontSize: 11, color: '#1677ff' }}>冷链</Typography.Text>} />
                  )}
                  {order.has_rx_item && (
                    <Badge status="error" text={<Typography.Text style={{ fontSize: 11, color: '#f5222d' }}>处方药</Typography.Text>} />
                  )}
                </div>

                {/* 商品名称和金额 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Typography.Text style={{ flex: 1, fontSize: 14 }} ellipsis>
                    {order.has_rx_item ? '处方药订单' : '健康商品'} x{order.items_count}件
                  </Typography.Text>
                  <Space size={4}>
                    {getStatusIcon(order.status)}
                    <Typography.Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                      ¥{order.pay_amount}
                    </Typography.Text>
                  </Space>
                </div>

                {/* 状态信息 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography.Text style={{ color: statusColor, fontSize: 12, fontWeight: 600 }}>
                      {ORDER_STATUS_LABEL[order.status as OrderStatus]}
                    </Typography.Text>
                    {order.status === 'RX_CHECKING' && order.has_rx_item && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <SafetyCertificateOutlined style={{ fontSize: 10, color: '#722ed1' }} />
                        <Typography.Text style={{ fontSize: 10, color: '#722ed1' }}>
                          等待药剂师审核
                        </Typography.Text>
                      </div>
                    )}
                    {order.has_cold_chain_item && order.status === 'SHIPPED' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <EnvironmentOutlined style={{ fontSize: 10, color: '#1677ff' }} />
                        <Typography.Text style={{ fontSize: 10, color: '#1677ff' }}>温控正常 3.2°C</Typography.Text>
                      </div>
                    )}
                    {hint && (
                      <Typography.Text type="secondary" style={{ display: 'block', fontSize: 10, marginTop: 2 }}>
                        {hint}
                      </Typography.Text>
                    )}
                  </div>
                  {getOrderAction(order)}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </AppPageFrame>
  );
}
