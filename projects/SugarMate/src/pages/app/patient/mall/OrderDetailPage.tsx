/**
 * 订单详情页 V1.0.0
 * 
 * 职能：
 * 1. 订单完整信息（商品类型标签、状态、金额、地址）
 * 2. 订单时间线（含商品类型关键节点：处方校验/冷链异常）
 * 3. 冷链温控数据展示（实时温度曲线）
 * 4. 处方药审核状态展示
 * 5. 操作按钮（去支付/确认收货/申请退款/查看物流）
 */
import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Space, Tag, Timeline, Divider, Descriptions, message, Steps } from 'antd';
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
  ExclamationCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import AppPageFrame from '../../../../components/AppPageFrame';
import type { ProductType, OrderStatus, Order } from '../../../../contracts/trade';
import { PRODUCT_TYPE_LABEL, ORDER_STATUS_LABEL } from '../../../../contracts/trade';

const PRODUCT_TYPE_META: Record<ProductType, { icon: React.ReactNode; color: string }> = {
  OTC: { icon: <MedicineBoxOutlined />, color: '#52c41a' },
  RX: { icon: <SafetyCertificateOutlined />, color: '#f5222d' },
  DEVICE: { icon: <ExperimentOutlined />, color: '#722ed1' },
  SUPPLEMENT: { icon: <CoffeeOutlined />, color: '#fa8c16' },
  FOOD: { icon: <CoffeeOutlined />, color: '#1677ff' },
  DAILY: { icon: <ShoppingCartOutlined />, color: '#8c8c8c' },
  SERVICE: { icon: <CustomerServiceOutlined />, color: '#13c2c2' },
};

// Mock详情——处方药+冷链场景
const MOCK_DETAIL: any = {
  id: 'ord-008',
  order_no: 'SG202607230001',
  buyer_name: '周患者',
  buyer_phone: '13800000008',
  merchant_name: 'XX大药房',
  product_types: ['RX'],
  has_rx_item: true,
  has_cold_chain_item: true,
  items: [
    { product_id: 'p-003', product_name: '胰岛素笔注射器（甘精胰岛素）', product_type: 'RX', quantity: 1, unit_price: 218, item_status: 'SHIPPED', prescription_ref: 'RX20260723001' },
  ],
  total_amount: 328,
  pay_amount: 328,
  status: 'SHIPPED',
  pay_channel: 'WECHAT',
  rx_check_result: { passed: true, checked_at: Date.now()/1000 - 172800, pharmacist_id: 'pharm-001' },
  cold_chain_resend_count: 0,
  address: { province: '浙江省', city: '杭州市', district: '西湖区', detail: '文三路138号', contact_name: '周患者', contact_phone: '13800000008' },
  logistics: { company: '顺丰冷链', tracking_no: 'SFCLD20260723001', temperature: { current: '4.1°C', range: '2-8°C' } },
  timeline: [
    { time: Date.now()/1000 - 518400, event: '订单已创建', operator: '周患者', status: 'PENDING_PAY' },
    { time: Date.now()/1000 - 518100, event: '支付成功', operator: '微信支付', status: 'PAID' },
    { time: Date.now()/1000 - 517800, event: '进入处方校验', operator: '系统', status: 'RX_CHECKING' },
    { time: Date.now()/1000 - 517200, event: '处方校验通过', operator: 'pharm-001', status: 'AWAITING_SHIP' },
    { time: Date.now()/1000 - 432000, event: '药房发货·冷链配送', operator: 'XX大药房', status: 'SHIPPED' },
    { time: Date.now()/1000 - 431000, event: '温控数据采集·4.1°C/2~8°C·正常', operator: '冷链监控', status: 'SHIPPED' },
  ],
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAY: '#faad14', PAYING: '#1677ff', PAID: '#1677ff',
  PROCESSING: '#1677ff', RX_CHECKING: '#722ed1', AWAITING_SHIP: '#1677ff',
  SHIPPED: '#52c41a', COLD_CHAIN_EXCEPTION: '#f5222d', DELIVERED: '#52c41a',
  COMPLETED: '#8c8c8c', CANCELLED: '#8c8c8c', REFUNDING: '#fa8c16', REFUNDED: '#8c8c8c',
};

export default function OrderDetailPage() {
  const [order] = useState(MOCK_DETAIL);
  const types: ProductType[] = order.product_types || [];

  const getTimelineIcon = (_event: string, tlStatus: string) => {
    if (tlStatus === 'COLD_CHAIN_EXCEPTION' || tlStatus === 'CANCELLED' || tlStatus === 'REFUNDED') {
      return <CloseCircleOutlined style={{ fontSize: 16 }} />;
    }
    if (tlStatus === 'SHIPPED' || tlStatus === 'AWAITING_SHIP' || tlStatus === 'RX_CHECKING') {
      return <ClockCircleOutlined style={{ color: '#1677ff', fontSize: 16 }} />;
    }
    return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
  };

  const getBottomActions = (order: any) => {
    switch (order.status) {
      case 'PENDING_PAY':
        return <Button type="primary" block size="large" style={{ borderRadius: 12, height: 48 }}>去支付 ¥{order.pay_amount}</Button>;
      case 'SHIPPED':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            {order.has_cold_chain_item && (
              <Button block size="large" style={{ borderRadius: 12, height: 48 }} icon={<EnvironmentOutlined />}>
                查看冷链温控
              </Button>
            )}
            <Space style={{ width: '100%' }}>
              <Button block size="large" style={{ borderRadius: 12, height: 48 }}>查看物流</Button>
              <Button block size="large" style={{ borderRadius: 12, height: 48 }}>申请退款</Button>
            </Space>
          </Space>
        );
      case 'DELIVERED':
        return (
          <Space style={{ width: '100%' }}>
            <Button type="primary" block size="large" style={{ borderRadius: 12, height: 48 }}>确认收货</Button>
            <Button block size="large" style={{ borderRadius: 12, height: 48 }}>申请退货退款</Button>
          </Space>
        );
      case 'COMPLETED':
        return <Button block size="large" style={{ borderRadius: 12, height: 48 }}>再次购买</Button>;
      default:
        return <Button block size="large" style={{ borderRadius: 12, height: 48 }}>联系客服</Button>;
    }
  };

  return (
    <AppPageFrame title="订单详情">
      <div style={{ padding: '16px', paddingBottom: 100 }}>
        {/* 状态卡片 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12, textAlign: 'center', padding: '12px 0' }}>
          <Typography.Text style={{ color: STATUS_COLOR[order.status], fontSize: 18, fontWeight: 700 }}>
            {ORDER_STATUS_LABEL[order.status as OrderStatus]}
          </Typography.Text>
          {order.has_cold_chain_item && order.status === 'SHIPPED' && (
            <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
              冷链配送中·温控正常·<span style={{ color: '#52c41a' }}>4.1°C/2~8°C</span>
            </Typography.Text>
          )}
          {order.has_rx_item && order.status === 'RX_CHECKING' && (
            <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
              药剂师正在审核您的处方
            </Typography.Text>
          )}
        </Card>

        {/* 收货地址 */}
        {order.address && (
          <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
            <Space><EnvironmentOutlined /><Typography.Text strong>收货信息</Typography.Text></Space>
            <div style={{ marginTop: 8, paddingLeft: 24 }}>
              <Typography.Text>
                {order.address.contact_name} {order.address.contact_phone}
              </Typography.Text><br/>
              <Typography.Text type="secondary">
                {order.address.province}{order.address.city}{order.address.district} {order.address.detail}
              </Typography.Text>
            </div>
          </Card>
        )}

        {/* 商品信息 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} title="商品信息">
          {order.items.map((item: any, idx: number) => {
            const meta = PRODUCT_TYPE_META[item.product_type];
            return (
              <div key={idx} style={{ display: 'flex', padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <Space size={4}>
                    <Tag color={meta.color} style={{ borderRadius: 4 }}>{meta.icon} {PRODUCT_TYPE_LABEL[item.product_type]}</Tag>
                    {order.has_rx_item && <Tag color="error" style={{ borderRadius: 4 }}>处方药</Tag>}
                    {order.has_cold_chain_item && <Tag color="processing" style={{ borderRadius: 4 }}>冷链</Tag>}
                  </Space>
                  <Typography.Text style={{ display: 'block', marginTop: 4, fontSize: 14 }}>
                    {item.product_name}
                  </Typography.Text>
                  {order.rx_check_result?.passed && (
                    <Typography.Text style={{ color: '#52c41a', fontSize: 11 }}>
                      <CheckCircleOutlined style={{ marginRight: 4 }} />
                      处方已审核通过
                    </Typography.Text>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Typography.Text type="secondary" style={{ display: 'block' }}>x{item.quantity}</Typography.Text>
                  <Typography.Text strong style={{ color: '#f5222d' }}>
                    ¥{item.unit_price * item.quantity}
                  </Typography.Text>
                </div>
              </div>
            );
          })}
        </Card>

        {/* 订单时间线 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} title="订单进度">
          <Timeline
            items={order.timeline.map((t: any) => ({
              color: STATUS_COLOR[t.status],
              dot: getTimelineIcon(t.event, t.status),
              children: (
                <div>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {t.event}
                  </Typography.Text>
                  {t.operator && (
                    <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                      {t.operator}
                    </Typography.Text>
                  )}
                  <Typography.Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                    {new Date(t.time * 1000).toLocaleString('zh-CN')}
                  </Typography.Text>
                </div>
              ),
            }))}
          />
        </Card>

        {/* 订单信息 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} title="订单信息">
          <Descriptions size="small" column={1} labelStyle={{ color: '#8c8c8c' }}>
            <Descriptions.Item label="订单编号">
              <Space>
                {order.order_no}
                <CopyOutlined style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(order.order_no); message.success('已复制'); }} />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="下单时间">{new Date(order.timeline[0].time * 1000).toLocaleString('zh-CN')}</Descriptions.Item>
            <Descriptions.Item label="支付方式">{order.pay_channel === 'WECHAT' ? '微信支付' : '易宝支付'}</Descriptions.Item>
            <Descriptions.Item label="商家">{order.merchant_name}</Descriptions.Item>
            {order.logistics?.tracking_no && (
              <Descriptions.Item label="物流单号">{order.logistics.company} {order.logistics.tracking_no}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 金额明细 */}
        <Card size="small" style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Typography.Text type="secondary">商品总额</Typography.Text>
            <Typography.Text>¥{order.total_amount}</Typography.Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Typography.Text type="secondary">运费</Typography.Text>
            <Typography.Text>¥15.00（冷链）</Typography.Text>
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Typography.Text strong>实付金额</Typography.Text>
            <Typography.Text strong style={{ color: '#f5222d', fontSize: 20 }}>
              ¥{order.pay_amount}
            </Typography.Text>
          </div>
        </Card>
      </div>

      {/* 底部操作栏 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0', zIndex: 100 }}>
        {getBottomActions(order)}
      </div>
    </AppPageFrame>
  );
}
