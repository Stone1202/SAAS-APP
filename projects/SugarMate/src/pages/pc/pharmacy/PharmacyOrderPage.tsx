/**
 * 药店订单履约管理页 (V2.2.1)
 * 
 * 订单流转链路：
 *   患者确认处方 → 订单生成(待支付) → 已支付 → 待履约 → 履约中(拣货/复核)
 *   → 已履约(待发货) → 已发货 → 配送中 → 已送达 → 已完成
 *   ↓（并行）冷链监控 → 售后工单
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tag, Button, Space, Card, Statistic, Row, Col, Select, Modal, Descriptions, Steps, Tooltip, message } from 'antd';
import { 
  ShoppingCartOutlined, CheckCircleOutlined, SendOutlined, CarOutlined, 
  HomeOutlined, CloseCircleOutlined, MedicineBoxOutlined, ExperimentOutlined,
  ExclamationCircleOutlined, SafetyCertificateOutlined, EyeOutlined,
  ClockCircleOutlined, ToolOutlined,
} from '@ant-design/icons';
import { useOrderStore } from '@/stores/orderStore';
import type { ColumnsType } from 'antd/es/table';

// ============ 订单履约状态流 ============
type FulfillmentStage = 'PENDING_PAY' | 'PAID' | 'PENDING_FULFILLMENT' | 'FULFILLING' | 'FULFILLED' | 'SHIPPED' | 'DELIVERING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDING';

const STAGE_LABEL: Record<FulfillmentStage, string> = {
  PENDING_PAY: '待支付',
  PAID: '已支付',
  PENDING_FULFILLMENT: '待履约',
  FULFILLING: '履约中',
  FULFILLED: '已履约',
  SHIPPED: '已发货',
  DELIVERING: '配送中',
  DELIVERED: '已送达',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
};

const STAGE_COLOR: Record<FulfillmentStage, string> = {
  PENDING_PAY: 'default',
  PAID: 'blue',
  PENDING_FULFILLMENT: 'orange',
  FULFILLING: 'processing',
  FULFILLED: 'cyan',
  SHIPPED: 'geekblue',
  DELIVERING: 'purple',
  DELIVERED: 'green',
  COMPLETED: 'success',
  CANCELLED: '#999',
  REFUNDING: 'error',
};

const STAGE_ICON: Record<FulfillmentStage, React.ReactNode> = {
  PENDING_PAY: <ClockCircleOutlined />,
  PAID: <CheckCircleOutlined />,
  PENDING_FULFILLMENT: <ClockCircleOutlined />,
  FULFILLING: <ToolOutlined />,
  FULFILLED: <MedicineBoxOutlined />,
  SHIPPED: <SendOutlined />,
  DELIVERING: <CarOutlined />,
  DELIVERED: <HomeOutlined />,
  COMPLETED: <CheckCircleOutlined />,
  CANCELLED: <CloseCircleOutlined />,
  REFUNDING: <ExclamationCircleOutlined />,
};

// 履约步骤序列（用于 Steps 组件）
const FULFILLMENT_STEPS = [
  { title: '已支付', key: 'PAID' as const },
  { title: '待履约', key: 'PENDING_FULFILLMENT' as const },
  { title: '履约中', key: 'FULFILLING' as const },
  { title: '已履约', key: 'FULFILLED' as const },
  { title: '已发货', key: 'SHIPPED' as const },
  { title: '已送达', key: 'DELIVERED' as const },
  { title: '已完成', key: 'COMPLETED' as const },
];

function getCurrentStep(stage: FulfillmentStage): number {
  if (stage === 'PENDING_PAY') return -1;
  const keys = FULFILLMENT_STEPS.map(s => s.key);
  const idx = keys.indexOf(stage as any);
  if (idx >= 0) return idx;
  // 兜底
  if (stage === 'DELIVERING') return keys.indexOf('SHIPPED' as any);
  if (stage === 'CANCELLED' || stage === 'REFUNDING') return -1;
  return 0;
}

const PharmacyOrderPage: React.FC = () => {
  const { orders, loadOrders, fulfillOrder, shipOrder, canFulfillOrder, canShipOrder } = useOrderStore();
  const [stageFilter, setStageFilter] = useState<FulfillmentStage | 'ALL'>('ALL');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // 药店履约相关状态筛查（含药店订单 + 问诊处方关联订单）
  const fulfillmentOrders = useMemo(() => {
    let list = orders.filter((o) => o?.id);
    if (stageFilter !== 'ALL') {
      list = list.filter((o) => (o as any).fulfillment_stage === stageFilter);
    }
    return list;
  }, [orders, stageFilter]);

  // 统计数据
  const stats = useMemo(() => {
    const total = fulfillmentOrders.length;
    const pendingFulfill = fulfillmentOrders.filter(o => (o as any).fulfillment_stage === 'PENDING_FULFILLMENT').length;
    const fulfilling = fulfillmentOrders.filter(o => (o as any).fulfillment_stage === 'FULFILLING').length;
    const fulfilled = fulfillmentOrders.filter(o => (o as any).fulfillment_stage === 'FULFILLED').length;
    return { total, pendingFulfill, fulfilling, fulfilled };
  }, [fulfillmentOrders]);

  // ---- 履约操作 ----
  const handleStartFulfill = async (orderId: string) => {
    setConfirmLoading(true);
    await fulfillOrder(orderId);
    setConfirmLoading(false);
    message.success('已开始履约，请在履约中页面完成拣货复核');
  };

  const handleCompleteFulfill = async (orderId: string) => {
    setConfirmLoading(true);
    // 履约完成 → 更新为 FULFILLED 状态
    await fulfillOrder(orderId);
    setConfirmLoading(false);
    message.success('履约完成，请安排发货');
  };

  const handleShip = async (orderId: string) => {
    setConfirmLoading(true);
    await shipOrder(orderId);
    setConfirmLoading(false);
    message.success('已发货');
  };

  const handleViewDetail = (record: any) => {
    setSelectedOrder(record);
    setDetailVisible(true);
  };

  // ---- 表格列 ----
  const columns: ColumnsType<any> = [
    { title: '订单编号', dataIndex: 'order_no', key: 'order_no', width: 180, render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v || '—'}</span> },
    { title: '患者', dataIndex: 'patient_name', key: 'patient_name', width: 100 },
    { title: '所属药店', dataIndex: 'merchant_name', key: 'merchant_name', width: 120 },
    {
      title: '商品清单', dataIndex: 'items', key: 'items', ellipsis: true,
      render: (items: Array<{ name: string }>) =>
        items?.map((it) => it.name).join('、') || '—',
    },
    {
      title: '金额', dataIndex: 'total_amount', key: 'total_amount', width: 100,
      render: (v: number) => `¥${(v || 0).toFixed(2)}`,
    },
    {
      title: '履约状态', dataIndex: 'fulfillment_stage', key: 'fulfillment_stage', width: 100,
      render: (stage: FulfillmentStage) => (
        <Tag color={STAGE_COLOR[stage] || 'default'}>{STAGE_LABEL[stage] || stage}</Tag>
      ),
    },
    {
      title: '冷链', dataIndex: 'cold_chain', key: 'cold_chain', width: 70,
      render: (v: boolean) => v ? <Tag color="blue">冷链</Tag> : <Tag>常温</Tag>,
    },
    {
      title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 120,
      render: (v: number) => v ? new Date(v * 1000).toLocaleDateString('zh-CN') : '—',
    },
    {
      title: '操作', key: 'actions', width: 180, fixed: 'right',
      render: (_, record) => {
        const stage: FulfillmentStage = (record as any).fulfillment_stage || 'PENDING_PAY';
        return (
          <Space size="small">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>详情</Button>
            {/* RX 审方守卫：含处方药但未审方通过的订单禁用履约/发货 */}
            {stage === 'PENDING_FULFILLMENT' && (
              <Tooltip title={canFulfillOrder(record).allowed ? '开始履约' : canFulfillOrder(record).reason}>
                <Button size="small" type="primary" icon={<ToolOutlined />}
                  disabled={!canFulfillOrder(record).allowed}
                  onClick={() => { if (canFulfillOrder(record).allowed) handleStartFulfill(record.id); }}>
                  开始履约
                </Button>
              </Tooltip>
            )}
            {stage === 'FULFILLING' && (
              <Tooltip title={canFulfillOrder(record).allowed ? '完成履约' : canFulfillOrder(record).reason}>
                <Button size="small" type="primary" ghost icon={<MedicineBoxOutlined />}
                  disabled={!canFulfillOrder(record).allowed}
                  onClick={() => { if (canFulfillOrder(record).allowed) handleCompleteFulfill(record.id); }}>
                  完成履约
                </Button>
              </Tooltip>
            )}
            {stage === 'FULFILLED' && (
              <Tooltip title={canShipOrder(record).allowed ? '发货' : canShipOrder(record).reason}>
                <Button size="small" type="primary" icon={<SendOutlined />}
                  disabled={!canShipOrder(record).allowed}
                  onClick={() => { if (canShipOrder(record).allowed) handleShip(record.id); }}>
                  发货
                </Button>
              </Tooltip>
            )}
            {/* 含处方药但未审方 → 警告标签 */}
            {(record as any).has_rx_item && !(record as any).rx_check_result?.passed && (
              <Tooltip title="该订单含处方药，需药师审方通过后方可操作">
                <Tag color="red" icon={<SafetyCertificateOutlined />}>待审方</Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '0 0 24px' }}>
      <h2 style={{ marginBottom: 16 }}>药店订单履约管理</h2>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="订单总数" value={stats.total} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="待履约" value={stats.pendingFulfill} valueStyle={{ color: '#fa8c16' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="履约中" value={stats.fulfilling} valueStyle={{ color: '#1677ff' }} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="已履约" value={stats.fulfilled} valueStyle={{ color: '#13c2c2' }} prefix={<MedicineBoxOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* 履约流程说明 */}
      <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
          <strong style={{ marginRight: 4 }}>履约流转：</strong>
          <Tag color="blue">已支付</Tag> → <Tag color="orange">待履约</Tag> → <Tag color="processing">履约中（拣货/复核）</Tag> → <Tag color="cyan">已履约</Tag> → <Tag color="geekblue">已发货</Tag> → <Tag color="purple">配送中</Tag> → <Tag color="green">已送达</Tag> → <Tag color="success">已完成</Tag>
          <span style={{ marginLeft: 12, color: '#999' }}>|</span>
          <SafetyCertificateOutlined style={{ color: '#1677ff' }} /> <span style={{ color: '#666' }}>冷链订单自动接入</span>&nbsp;<Tooltip title="冷链监控"><a href="#/pharmacy/coldchain" style={{ fontSize: 12 }}>冷链监控</a></Tooltip>
          <span style={{ marginLeft: 12, color: '#999' }}>|</span>
          <ExclamationCircleOutlined style={{ color: '#fa8c16' }} /> <span style={{ color: '#666' }}>已签收后可发起售后</span>&nbsp;<Tooltip title="售后工单"><a href="#/pharmacy/aftersale" style={{ fontSize: 12 }}>售后工单</a></Tooltip>
        </div>
      </Card>

      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <span>履约状态：</span>
          <Select 
            value={stageFilter} 
            onChange={setStageFilter}
            style={{ width: 140 }}
          >
            <Select.Option key="ALL" value="ALL">全部</Select.Option>
            {Object.entries(STAGE_LABEL).map(([k, v]) => (
              <Select.Option key={k} value={k}>{v}</Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* 订单表格 */}
      <Table 
        columns={columns} 
        dataSource={fulfillmentOrders} 
        rowKey="id" 
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `共 ${t} 条订单` }}
      />

      {/* 订单详情弹窗 */}
      <Modal
        title="订单履约详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={720}
      >
        {selectedOrder && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单编号" span={2}>
                <span style={{ fontFamily: 'monospace' }}>{selectedOrder.order_no}</span>
              </Descriptions.Item>
              <Descriptions.Item label="患者">{selectedOrder.patient_name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedOrder.patient_phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="所属药店">{selectedOrder.merchant_name}</Descriptions.Item>
              <Descriptions.Item label="药品/商品">{selectedOrder.items?.map((it: any) => it.name).join('、')}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{(selectedOrder.total_amount || 0).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="冷链">
                {(selectedOrder as any).cold_chain ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(selectedOrder.created_at * 1000).toLocaleString('zh-CN')}</Descriptions.Item>
              <Descriptions.Item label="更新日期">{new Date(selectedOrder.updated_at * 1000).toLocaleString('zh-CN')}</Descriptions.Item>
            </Descriptions>

            {/* 履约步骤 */}
            <h4 style={{ marginBottom: 12 }}>履约进度</h4>
            <Steps
              current={getCurrentStep((selectedOrder as any).fulfillment_stage || 'PAID')}
              status={(selectedOrder as any).fulfillment_stage === 'CANCELLED' ? 'error' : 'process'}
              size="small"
              items={FULFILLMENT_STEPS.map(s => ({
                title: s.title,
                description: s.key === (selectedOrder as any).fulfillment_stage ? '当前' : undefined,
              }))}
              style={{ marginBottom: 24 }}
            />

            {/* 操作按钮 */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <Space>
                {((selectedOrder as any).fulfillment_stage === 'PENDING_FULFILLMENT') && (
                  <Button type="primary" icon={<ToolOutlined />} onClick={() => { handleStartFulfill(selectedOrder.id); setDetailVisible(false); }}>开始履约</Button>
                )}
                {((selectedOrder as any).fulfillment_stage === 'FULFILLING') && (
                  <Button type="primary" ghost icon={<MedicineBoxOutlined />} onClick={() => { handleCompleteFulfill(selectedOrder.id); setDetailVisible(false); }}>完成履约</Button>
                )}
                {((selectedOrder as any).fulfillment_stage === 'FULFILLED') && (
                  <Button type="primary" icon={<SendOutlined />} onClick={() => { handleShip(selectedOrder.id); setDetailVisible(false); }}>确认发货</Button>
                )}
                {(selectedOrder as any).cold_chain && (
                  <Button icon={<ExperimentOutlined />} href="#/pharmacy/coldchain">冷链监控</Button>
                )}
                {['DELIVERED', 'COMPLETED'].includes((selectedOrder as any).fulfillment_stage) && (
                  <Button icon={<ExclamationCircleOutlined />} href="#/pharmacy/aftersale">售后工单</Button>
                )}
              </Space>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PharmacyOrderPage;
