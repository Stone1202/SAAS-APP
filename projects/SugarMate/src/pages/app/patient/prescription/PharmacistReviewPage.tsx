/**
 * 药师审方·配药·物流进度页 V2.0.0 — 场景2A闭环核心页面
 *
 * 职能（对应 PRD §7.11.3 步骤⑦⑧⑨）：
 * 1. 处方审方状态跟踪（待审方→审核通过→审核驳回）
 * 2. 配药进度条（待配药→拣货→复核→打包）
 * 3. 物流追踪（物流单号+预计送达+冷链温度）
 * 4. 缺货处理入口（更换药房）
 *
 * 路由：/app/mine/prescription/:prescriptionId/review
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Steps,
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Divider,
  Progress,
  Timeline,
  Descriptions,
  message,
} from 'antd';
import {
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  CarOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';
import { useOrderStore } from '../../../../stores/orderStore';
import type { Prescription } from '../../../../contracts/consultation';
import type { Order } from '../../../../contracts/trade';

// 处方流转+订单 复合状态
type DeliveryStage = 'AUDITING' | 'AUDIT_PASSED' | 'AUDIT_REJECTED' | 'DISPENSING' | 'PACKING' | 'SHIPPED' | 'DELIVERED';

const STAGE_LABEL: Record<DeliveryStage, string> = {
  AUDITING: '药师审方中',
  AUDIT_PASSED: '审方通过',
  AUDIT_REJECTED: '审方驳回',
  DISPENSING: '配药中',
  PACKING: '打包出库',
  SHIPPED: '运输中',
  DELIVERED: '已签收',
};

const STAGE_ORDER: DeliveryStage[] = ['AUDITING', 'AUDIT_PASSED', 'DISPENSING', 'PACKING', 'SHIPPED', 'DELIVERED'];

export default function PharmacistReviewPage() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const {
    loadPrescriptionDetail, currentPrescription,
    handlePrescriptionStockout, switchPrescriptionPharmacy, init: initConsult,
  } = useConsultationStore();
  const { loadOrderDetail, currentOrder, loading: orderLoading } = useOrderStore();

  const [pres, setPres] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initConsult().then(async () => {
      if (prescriptionId) {
        await loadPrescriptionDetail(prescriptionId);
      }
      setLoading(false);
    });
  }, [prescriptionId]);

  useEffect(() => {
    setPres(currentPrescription);
  }, [currentPrescription]);

  // 加载关联的 trade order（含物流信息）
  useEffect(() => {
    if (pres?.trade_orders?.length) {
      pres.trade_orders.forEach(ref => {
        if (ref.trade_order_id) {
          loadOrderDetail(ref.trade_order_id);
        }
      });
    }
  }, [pres?.trade_orders]);

  // 根据处方状态 + 订单状态 判定当前配送阶段
  // 注：PRD v1.1.0 新增状态(ORDER_CREATED等)尚未纳入 TypeScript 类型定义，此处用 as string 兼容
  const currentStage: DeliveryStage = useMemo(() => {
    if (!pres) return 'AUDITING';
    const s = pres.status as string;
    switch (s) {
      case 'PENDING_AUDIT':
        return 'AUDITING'; // 药师审核中
      case 'AUDIT_REJECTED':
        return 'AUDIT_REJECTED'; // 审核驳回
      case 'AWAITING_PATIENT_CONFIRM':
      case 'PATIENT_AGREED':
        return 'AUDIT_PASSED'; // 审核通过（待患者确认或已确认）
      case 'ORDER_CREATED':
      case 'FLOWING':
      case 'PHARMACY_SWITCHING':
        return 'DISPENSING';
      case 'DISPENSING':
        return 'PACKING';
      case 'PACKING':
        return 'PACKING';
      case 'SHIPPED':
        return 'SHIPPED';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'DELIVERED';
      case 'OUT_OF_STOCK':
        return 'DISPENSING'; // 缺货显示在配药阶段但标记异常
      default:
        return currentOrder?.status === 'SHIPPED' ? 'SHIPPED'
          : currentOrder?.status === 'DELIVERED' ? 'DELIVERED'
          : 'AUDITING';
    }
  }, [pres, currentOrder]);

  const stageIndex = STAGE_ORDER.indexOf(currentStage);
  const isOutOfStock = (pres?.status as string) === 'OUT_OF_STOCK';
  const isAuditRejected = currentStage === 'AUDIT_REJECTED';

  // 模拟物流数据（实际从 orderStore/shipOrder 获取）
  const logisticsInfo = useMemo(() => ({
    company: '顺丰医药冷链',
    trackingNo: `SF${Date.now().toString(36).toUpperCase()}`,
    eta: '预计 2-3 天送达',
    currentTemp: '2.8°C',
    humidity: '45%',
    location: '深圳集散中心',
  }), []);

  // 模拟冷链温度曲线数据
  const tempHistory = useMemo(() => [
    { time: '08:00', temp: 2.5 },
    { time: '10:00', temp: 2.7 },
    { time: '12:00', temp: 3.0 },
    { time: '14:00', temp: 2.8 },
    { time: '16:00', temp: 2.6 },
    { time: '18:00', temp: 2.9 },
  ], []);

  if (loading) {
    return (
      <AppPageFrame title="处方·配药进度">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <SyncOutlined spin style={{ fontSize: 32, color: '#1677ff' }} />
          <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>加载中...</Typography.Paragraph>
        </div>
      </AppPageFrame>
    );
  }

  if (!pres) {
    return (
      <AppPageFrame title="处方·配药进度">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <Typography.Title level={5} style={{ marginTop: 16 }}>处方不存在</Typography.Title>
          <Button type="primary" onClick={() => navigate(-1)}>返回</Button>
        </div>
      </AppPageFrame>
    );
  }

  return (
    <AppPageFrame title="处方·配药进度">
      <div style={{ padding: '16px', paddingBottom: 80 }}>

        {/* ===== 1. 处方信息卡片 ===== */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <MedicineBoxOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <Typography.Text strong style={{ fontSize: 15 }}>
              {pres.drug_name || '处方药品'}
            </Typography.Text>
            <Tag color={isAuditRejected ? 'error' : isOutOfStock ? 'warning' : 'processing'}>
              {isOutOfStock ? '缺货' : isAuditRejected ? '已驳回' : '流转中'}
            </Tag>
          </Space>
          <Typography.Paragraph type="secondary" style={{ fontSize: 13, margin: 0 }}>
            诊断：{pres.diagnosis || '待查看'}
          </Typography.Paragraph>
          {(pres.items || []).length > 0 && (
            <div style={{ marginTop: 6 }}>
              {pres.items!.map((item, idx) => (
                <Tag key={idx} color={item.product_type === 'RX' ? 'red' : 'blue'} style={{ marginBottom: 4 }}>
                  {item.drug_name || item.product_id} x{item.quantity}
                </Tag>
              ))}
            </div>
          )}
        </Card>

        {/* ===== 2. 审方状态 + 进度条 ===== */}
        <Card
          size="small"
          style={{ borderRadius: 12, marginBottom: 12 }}
          title={
            <Space>
              <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
              <span>审方与配送进度</span>
            </Space>
          }
        >
          {isAuditRejected ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CloseCircleOutlined style={{ fontSize: 48, color: '#f5222d' }} />
              <Typography.Title level={5} style={{ color: '#f5222d', marginTop: 12 }}>
                审方未通过
              </Typography.Title>
              <Typography.Text type="secondary">
                处方合理性校验未通过，请联系医生修改处方
              </Typography.Text>
              <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={() => navigate(-1)}>
                  返回修改处方
                </Button>
              </div>
            </div>
          ) : (
            <Steps
              direction="vertical"
              size="small"
              current={isOutOfStock ? stageIndex : stageIndex}
              status={isOutOfStock ? 'error' : isAuditRejected ? 'error' : 'process'}
              items={STAGE_ORDER.map((stage, i) => {
                const isCurrent = i === stageIndex;
                const isDone = i < stageIndex;
                const icon = isDone ? <CheckCircleOutlined /> : isCurrent ? <SyncOutlined spin /> : <ClockCircleOutlined />;

                let description = '';
                if (stage === 'AUDITING' && isCurrent) description = '药师正在审核处方合理性（通过/驳回）...';
                if (stage === 'AUDIT_PASSED' && isDone) description = '审方通过，转入配药';
                if (stage === 'DISPENSING' && isCurrent) description = '拣货中...';
                if (stage === 'PACKING' && isCurrent) description = '复核打包中...';
                if (stage === 'SHIPPED' && isDone) {
                  description = `物流单号: ${logisticsInfo.trackingNo}`;
                }
                if (stage === 'DELIVERED' && isDone) description = '患者已签收';

                if (isOutOfStock && stage === 'DISPENSING') {
                  description = '⚠️ 库存不足，需更换药房';
                }

                return {
                  title: STAGE_LABEL[stage],
                  description,
                  icon,
                  status: isOutOfStock && stage === 'DISPENSING' ? 'error' as const
                    : isDone ? 'finish' as const
                    : isCurrent ? 'process' as const
                    : 'wait' as const,
                };
              }).filter(item => {
                // 驳回时只显示到审方步骤
                if (isAuditRejected && STAGE_ORDER.indexOf(item.title as never) > STAGE_ORDER.indexOf('AUDITING')) return false;
                return true;
              })}
            />
          )}

          {/* 缺货处理 */}
          {isOutOfStock && (
            <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 8 }}>
              <Space>
                <ExclamationCircleOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
                <Typography.Text style={{ color: '#d46b08', fontSize: 13 }}>
                  当前药房库存不足
                </Typography.Text>
              </Space>
              <div style={{ marginTop: 8 }}>
                <Button
                  size="small"
                  type="primary"
                  danger
                  onClick={async () => {
                    if (!prescriptionId) return;
                    try {
                      await switchPrescriptionPharmacy(prescriptionId, 'ph-002', '大参林药房·南山店');
                      await loadPrescriptionDetail(prescriptionId);
                      message.success('已更换药房，新药房配药中');
                    } catch {
                      message.error('更换药房失败');
                    }
                  }}
                >
                  更换药房
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ===== 3. 物流追踪（发货后显示） ===== */}
        {(currentStage === 'SHIPPED' || currentStage === 'DELIVERED') && (
          <Card
            size="small"
            style={{ borderRadius: 12, marginBottom: 12 }}
            title={
              <Space>
                <CarOutlined style={{ color: '#52c41a' }} />
                <span>物流追踪</span>
              </Space>
            }
          >
            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label="快递公司">{logisticsInfo.company}</Descriptions.Item>
              <Descriptions.Item label="运单号">
                <Typography.Text copyable>{logisticsInfo.trackingNo}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="预计送达">
                <Space>
                  <ClockCircleOutlined />
                  {logisticsInfo.eta}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="当前位置">
                <Space>
                  <EnvironmentOutlined />
                  {logisticsInfo.location}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '8px 0' }} />

            {/* 物流时间线 */}
            <Timeline
              items={[
                { children: `${logisticsInfo.location} — 快件已到达`, color: 'blue' },
                { children: '广州天河集散中心 — 快件已发出', color: 'green' },
                { children: `药房发货 — ${logisticsInfo.trackingNo}`, color: 'green' },
              ]}
            />

            <Divider style={{ margin: '8px 0' }} />

            {/* 冷链温度曲线 */}
            <Typography.Text strong style={{ fontSize: 13 }}>
              <ShopOutlined /> 冷链监控
            </Typography.Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, marginTop: 8 }}>
              <Tag color="success">当前温度 {logisticsInfo.currentTemp}</Tag>
              <Tag color="processing">湿度 {logisticsInfo.humidity}</Tag>
              <Tag color="success">正常范围</Tag>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {tempHistory.map((point, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${((point.temp - 2) / 2) * 60 + 10}px`,
                      background: point.temp > 4 ? '#ff4d4f' : point.temp > 3 ? '#faad14' : '#52c41a',
                      borderRadius: '4px 4px 0 0',
                      minWidth: 24,
                      transition: 'height 0.3s',
                    }}
                  />
                  <Typography.Text style={{ fontSize: 10, display: 'block' }}>
                    {point.temp}°C
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 9, display: 'block' }}>
                    {point.time}
                  </Typography.Text>
                </div>
              ))}
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4, textAlign: 'center' }}>
              冷链温度曲线（2°C-8°C 合格范围）
            </Typography.Text>
          </Card>
        )}

        {/* ===== 4. 操作按钮区 ===== */}
        <div style={{ marginTop: 12 }}>
          {currentStage === 'DELIVERED' && (
            <Button
              type="primary"
              block
              size="large"
              style={{ borderRadius: 12, height: 48 }}
              onClick={() => {
                message.success('已确认收货');
                // 跳转回问诊评价或订单详情
                const tradeOrderId = pres?.trade_orders?.[0]?.trade_order_id;
                if (tradeOrderId) {
                  navigate(`/app/mine/order/${tradeOrderId}`);
                }
              }}
            >
              <HomeOutlined /> 确认收货
            </Button>
          )}

          {(currentStage === 'SHIPPED' || currentStage === 'DISPENSING' || currentStage === 'PACKING' || currentStage === 'AUDIT_PASSED') && (
            <Button
              block
              size="small"
              style={{ borderRadius: 8, marginTop: 8 }}
              onClick={() => {
                const tradeOrderId = pres?.trade_orders?.[0]?.trade_order_id;
                if (tradeOrderId) {
                  navigate(`/app/mine/order/${tradeOrderId}/track`);
                } else {
                  message.info('暂无物流追踪数据');
                }
              }}
            >
              <EnvironmentOutlined /> 查看物流详情
            </Button>
          )}

          <Button
            block
            size="small"
            type="text"
            style={{ borderRadius: 8, marginTop: 8 }}
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </div>
      </div>
    </AppPageFrame>
  );
}
