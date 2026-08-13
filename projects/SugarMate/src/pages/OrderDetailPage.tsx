/**
 * 订单详情页
 */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Typography, Spin, Table, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useOrderStore } from '@/stores/orderStore';

const { Title } = Typography;

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAY: '待支付', PAID: '已支付', PROCESSING: '处理中', SHIPPED: '已发货',
  DELIVERED: '已签收', COMPLETED: '已完成', CANCELLED: '已取消', REFUNDING: '退款中', REFUNDED: '已退款',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING_PAY: 'orange', PAID: 'blue', PROCESSING: 'processing', SHIPPED: 'cyan',
  DELIVERED: 'geekblue', COMPLETED: 'green', CANCELLED: 'default', REFUNDING: 'red', REFUNDED: 'default',
};

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentOrder, loading, loadOrderDetail } = useOrderStore();

  useEffect(() => {
    if (orderId) loadOrderDetail(orderId);
  }, [orderId]);

  if (loading || !currentOrder) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  const itemColumns = [
    { title: '商品', dataIndex: 'product_name', key: 'product_name' },
    { title: '单价', dataIndex: 'unit_price', key: 'unit_price', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '小计', key: 'subtotal', render: (_: any, r: any) => `¥${(r.unit_price * r.quantity).toFixed(2)}` },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>返回</Button>
        <Title level={5} style={{ margin: 0 }}>订单详情</Title>
        <Tag color={STATUS_COLOR[currentOrder.status]}>{STATUS_LABEL[currentOrder.status]}</Tag>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={3} size="small">
          <Descriptions.Item label="订单号">{currentOrder.order_no}</Descriptions.Item>
          <Descriptions.Item label="支付方式">{currentOrder.pay_channel === 'WECHAT' ? '微信支付' : currentOrder.pay_channel === 'YEEPAY' ? '易宝支付' : '-'}</Descriptions.Item>
          <Descriptions.Item label="交易单号">{currentOrder.transaction_id || '-'}</Descriptions.Item>
          <Descriptions.Item label="下单时间">{new Date(currentOrder.created_at * 1000).toLocaleString('zh-CN')}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{new Date(currentOrder.updated_at * 1000).toLocaleString('zh-CN')}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="商品明细" style={{ marginBottom: 16 }}>
        <Table dataSource={currentOrder.items} columns={itemColumns} rowKey="product_id" pagination={false} size="small" />
        <Divider />
        <div style={{ textAlign: 'right', fontSize: 16 }}>
          <Space direction="vertical" style={{ alignItems: 'flex-end' }}>
            <span>商品总额：<b>¥{currentOrder.total_amount.toFixed(2)}</b></span>
            {currentOrder.discount_amount > 0 && <span>优惠：<span style={{ color: 'var(--color-success)' }}>-¥{currentOrder.discount_amount.toFixed(2)}</span></span>}
            <span style={{ fontSize: 18 }}>实付：<b style={{ color: 'var(--color-error)' }}>¥{currentOrder.pay_amount.toFixed(2)}</b></span>
          </Space>
        </div>
      </Card>

      {currentOrder.address && (
        <Card title="收货地址">
          <Descriptions size="small">
            <Descriptions.Item label="收货人">{currentOrder.address.contact_name}</Descriptions.Item>
            <Descriptions.Item label="电话">{currentOrder.address.contact_phone}</Descriptions.Item>
            <Descriptions.Item label="地址">
              {currentOrder.address.province}{currentOrder.address.city}{currentOrder.address.district}{currentOrder.address.detail}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {currentOrder.logistics && (
        <Card title="物流信息" style={{ marginTop: 16 }}>
          <Descriptions size="small">
            <Descriptions.Item label="快递公司">{currentOrder.logistics.company}</Descriptions.Item>
            <Descriptions.Item label="运单号">{currentOrder.logistics.tracking_no}</Descriptions.Item>
            <Descriptions.Item label="状态">{currentOrder.logistics.status}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default OrderDetailPage;
