import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Skeleton } from 'antd';
import { useOpsStore } from '../../stores/useOpsStore';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { orders, loadOrders } = useOpsStore();
  const order = orders.find(o => o.id === id);

  useEffect(() => { loadOrders(); }, []);

  if (!order) {
    return <div className="page-container"><Skeleton active paragraph={{ rows: 8 }} /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>订单详情</h1>
        <div className="description">{order.orderNo}</div>
      </div>

      <Card>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="租户">{order.tenantName}</Descriptions.Item>
          <Descriptions.Item label="版本"><Tag>{order.version}</Tag></Descriptions.Item>
          <Descriptions.Item label="金额">
            <span style={{ color: '#FF4D4F', fontSize: 16, fontWeight: 600 }}>¥{order.amount?.toLocaleString()}</span>
          </Descriptions.Item>
          <Descriptions.Item label="支付方式">{order.paymentMethod}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={order.status === 'paid' ? 'green' : order.status === 'refunding' ? 'orange' : 'default'}>
              {order.status}
            </Tag>
          </Descriptions.Item>
          {order.refundAmount && (
            <Descriptions.Item label="退款金额">
              <span style={{ color: '#FF4D4F' }}>¥{order.refundAmount?.toLocaleString()}</span>
            </Descriptions.Item>
          )}
          {order.refundReason && (
            <Descriptions.Item label="退款原因" span={2}>{order.refundReason}</Descriptions.Item>
          )}
          <Descriptions.Item label="创建时间">{order.createdAt}</Descriptions.Item>
          <Descriptions.Item label="支付时间">{order.paidAt || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
