import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Modal, Form, InputNumber, Input, message, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useOpsStore } from '../../stores/useOpsStore';
import type { SubscriptionOrder } from '../../contracts/schemas';

export default function SubscriptionOrders() {
  const navigate = useNavigate();
  const { orders, loading, loadOrders, approveRefund, rejectRefund } = useOpsStore();
  const [refundModal, setRefundModal] = useState<{ open: boolean; order: SubscriptionOrder | null }>({ open: false, order: null });
  const [form] = Form.useForm();

  useEffect(() => { loadOrders(); }, []);

  const columns: ColumnsType<SubscriptionOrder> = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 180 },
    { title: '租户', dataIndex: 'tenantName', key: 'tenantName', width: 140 },
    { title: '版本', dataIndex: 'version', key: 'version', width: 80, render: (v: string) => <Tag>{v}</Tag> },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (v: number) => <span style={{ color: '#FF4D4F' }}>¥{v?.toLocaleString()}</span>,
    },
    { title: '支付方式', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => {
        const map: Record<string, { color: string; label: string }> = {
          paid: { color: 'green', label: '已支付' },
          refunding: { color: 'orange', label: '退款中' },
          refunded: { color: 'default', label: '已退款' },
          cancelled: { color: 'red', label: '已取消' },
        };
        return <Tag color={map[v]?.color}>{map[v]?.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, r) => (
        <Space>
          <a onClick={() => navigate(`/ops/subscriptions/orders/${r.id}`)}>详情</a>
          {r.status === 'refunding' && (
            <a onClick={() => { setRefundModal({ open: true, order: r }); form.resetFields(); }}>
              审批
            </a>
          )}
        </Space>
      ),
    },
  ];

  const handleApproveRefund = async () => {
    try {
      const values = await form.validateFields();
      await approveRefund(refundModal.order!.id, values.adjustedAmount);
      message.success('退款已通过');
      setRefundModal({ open: false, order: null });
    } catch { /* validation */ }
  };

  const handleRejectRefund = () => {
    Modal.confirm({
      title: '拒绝退款申请',
      content: '确定拒绝该退款申请？',
      okType: 'danger',
      onOk: async () => {
        await rejectRefund(refundModal.order!.id);
        message.success('退款申请已拒绝');
        setRefundModal({ open: false, order: null });
      },
    });
  };

  const calculateRefund = (order: SubscriptionOrder) => {
    // 简化阶梯计算
    const daysUsed = 15;
    const refundRate = daysUsed < 7 ? 1 : daysUsed < 15 ? 0.7 : 0.5;
    return Math.floor((order.amount / 30) * daysUsed * refundRate * 0.95);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>订阅与订单</h1>
        <div className="description">管理所有租户的订阅订单和退款审批</div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 笔` }}
        />
      </Card>

      {/* 退款审批弹窗 */}
      <Modal
        title="退款审批"
        open={refundModal.open}
        onOk={handleApproveRefund}
        onCancel={() => setRefundModal({ open: false, order: null })}
        width={680}
        okText="通过，执行退款"
        footer={[
          <Button key="reject" danger onClick={handleRejectRefund}>拒绝</Button>,
          <Button key="approve" type="primary" onClick={handleApproveRefund}>通过，执行退款</Button>,
        ]}
      >
        {refundModal.order && (
          <div style={{ marginTop: 16 }}>
            <Card size="small" style={{ marginBottom: 16, background: '#F5F5F5' }}>
              <div>租户：{refundModal.order.tenantName}</div>
              <div>订单号：{refundModal.order.orderNo}</div>
              <div>金额：¥{refundModal.order.amount?.toLocaleString()}</div>
              <div>支付方式：{refundModal.order.paymentMethod}</div>
              <div>退款金额：¥{refundModal.order.refundAmount?.toLocaleString()}</div>
              <div>退款原因：{refundModal.order.refundReason || '-'}</div>
            </Card>

            <Card size="small" title="退款阶梯计算" style={{ marginBottom: 16 }}>
              <div>已使用天数：15天 | 总额：¥{refundModal.order.amount?.toLocaleString()}/月</div>
              <div>阶梯规则：&lt;7天全额退款 / 7-15天退70% / 15-30天退50%</div>
              <div style={{ marginTop: 8, fontWeight: 500 }}>
                → 退款金额 ¥{calculateRefund(refundModal.order).toLocaleString()}
              </div>
            </Card>

            <Form form={form} layout="vertical">
              <Form.Item name="adjustedAmount" label="调整金额（如需手动调整）" initialValue={calculateRefund(refundModal.order)}>
                <InputNumber style={{ width: 200 }} min={0} />
              </Form.Item>
              <Form.Item name="notes" label="审批备注">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
