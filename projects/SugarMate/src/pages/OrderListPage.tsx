/**
 * 订单列表页 —— 支持状态筛选
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Select, Space, Typography, Empty } from 'antd';
import { useOrderStore } from '@/stores/orderStore';

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING_PAY', label: '待支付' },
  { value: 'PAID', label: '已支付' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'DELIVERED', label: '已签收' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'REFUNDING', label: '退款中' },
  { value: 'REFUNDED', label: '已退款' },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAY: '待支付', PAID: '已支付', PROCESSING: '处理中', SHIPPED: '已发货',
  DELIVERED: '已签收', COMPLETED: '已完成', CANCELLED: '已取消', REFUNDING: '退款中', REFUNDED: '已退款',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING_PAY: 'orange', PAID: 'blue', PROCESSING: 'processing', SHIPPED: 'cyan',
  DELIVERED: 'geekblue', COMPLETED: 'green', CANCELLED: 'default', REFUNDING: 'red', REFUNDED: 'default',
};

const OrderListPage: React.FC = () => {
  const { orders, total, loading, loadOrders } = useOrderStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadOrders({ status: status || undefined, page: 1, page_size: 20 });
  }, [status]);

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', render: (v: string) => <a onClick={() => navigate(`/orders/${v}`)}>{v}</a> },
    {
      title: '商品', dataIndex: 'items', key: 'items',
      render: (items: any[]) => (
        <Space direction="vertical" size={0}>
          {items?.slice(0, 2).map((i: any, idx: number) => (
            <span key={idx}>{i.product_name} ×{i.quantity}</span>
          ))}
          {items?.length > 2 && <span style={{ color: '#999' }}>...等{items.length}件</span>}
        </Space>
      ),
    },
    { title: '金额', dataIndex: 'pay_amount', key: 'pay_amount', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v] || v}</Tag> },
    { title: '下单时间', dataIndex: 'created_at', key: 'created_at', render: (v: number) => new Date(v * 1000).toLocaleString('zh-CN') },
  ];

  return (
    <Card
      title={<Space><Title level={5} style={{ margin: 0 }}>订单管理</Title></Space>}
      extra={
        <Select value={status} onChange={setStatus} style={{ width: 120 }} options={STATUS_OPTIONS} />
      }
    >
      {orders.length > 0 ? (
        <Table
          dataSource={orders} columns={columns} rowKey="id" loading={loading}
          pagination={{ total, pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      ) : (
        <Empty description="暂无订单" />
      )}
    </Card>
  );
};

export default OrderListPage;
