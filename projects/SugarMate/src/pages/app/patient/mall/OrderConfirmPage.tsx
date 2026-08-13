/**
 * 下单确认页 V1.0.0
 * 
 * 职能：
 * 1. 展示订单商品明细（含商品类型标签）
 * 2. 混合订单拆单提示（含冷链/处方药独立子包提示）
 * 3. 收货地址选择
 * 4. 优惠券/积分抵扣
 * 5. 提交订单
 * 
 * 商品类型路由：SCE-OTC/DEVICE/SUPPLEMENT→直接下单 | SCE-RX→提示需处方 | SCE-SERVICE→跳转服务下单页
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Typography, Card, Button, Space, Tag, Divider, Radio, Modal, message, List } from 'antd';
import {
  ShoppingCartOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  CoffeeOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import AppPageFrame from '../../../../components/AppPageFrame';
import type { OrderItem, ProductType } from '../../../../contracts/trade';
import { PRODUCT_TYPE_LABEL } from '../../../../contracts/trade';
import { useOrderStore } from '../../../../stores/orderStore';

// 商品类型→图标+颜色映射
const PRODUCT_TYPE_META: Record<ProductType, { icon: React.ReactNode; color: string }> = {
  OTC: { icon: <MedicineBoxOutlined />, color: '#52c41a' },
  RX: { icon: <SafetyCertificateOutlined />, color: '#f5222d' },
  DEVICE: { icon: <ExperimentOutlined />, color: '#722ed1' },
  SUPPLEMENT: { icon: <CoffeeOutlined />, color: '#fa8c16' },
  FOOD: { icon: <CoffeeOutlined />, color: '#1677ff' },
  DAILY: { icon: <ShoppingCartOutlined />, color: '#8c8c8c' },
  SERVICE: { icon: <CustomerServiceOutlined />, color: '#13c2c2' },
};

// Mock 购物车数据（实际应从卡包/购物车 Store 获取）
const MOCK_CART_ITEMS: OrderItem[] = [
  { product_id: 'p-004', sku_id: 's-001', product_name: '二甲双胍缓释片 0.5g×60片', product_type: 'OTC', quantity: 2, unit_price: 35 },
  { product_id: 'p-003', sku_id: 's-002', product_name: '胰岛素笔注射器（需冷链·处方药）', product_type: 'RX', quantity: 1, unit_price: 218, prescription_ref: 'RX202607001' },
];

export default function OrderConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createOrder } = useOrderStore();

  // 从 URL search 参数中解析推荐商品（来自 PostConsultRecommendPage）
  const recommendedProduct = useMemo((): OrderItem | null => {
    const pid = searchParams.get('product_id');
    if (!pid) return null;
    return {
      product_id: pid,
      sku_id: pid, // 推荐商品假定 sku 同 product
      product_name: searchParams.get('product_name') || '推荐商品',
      product_type: (searchParams.get('product_type') || 'OTC') as ProductType,
      quantity: 1,
      unit_price: Number(searchParams.get('price')) || 0,
      item_status: 'PENDING' as const,
      prescription_ref: searchParams.get('prescription_ref') || undefined,
    };
  }, [searchParams]);

  const [items] = useState<OrderItem[]>(() => {
    const rec = recommendedProduct;
    return rec ? [rec] : MOCK_CART_ITEMS;
  });
  const [splitStrategy, setSplitStrategy] = useState<'SPLIT_BY_TYPE' | 'UNIFIED_COLD_CHAIN'>('SPLIT_BY_TYPE');
  const [submitting, setSubmitting] = useState(false);

  // 分析商品类型组合
  const types = useMemo(() => [...new Set(items.map(i => i.product_type))], [items]);
  const hasRx = types.includes('RX');
  const hasColdChain = items.some(i => i.product_type === 'RX');

  const totalPrice = useMemo(() => 
    items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0), [items]
  );

  const handleSubmit = async () => {
    if (hasRx) {
      Modal.confirm({
        title: '处方药下单确认',
        icon: <AlertOutlined />,
        content: '您的订单中包含处方药，提交后将进入处方校验环节。处方药将与普通商品拆分为独立子订单分别处理。',
        okText: '确认下单',
        cancelText: '返回修改',
        onOk: doSubmit,
      });
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const { order, analysis } = await createOrder({
        items,
        address_id: 'addr-001',
        client_order_id: `CLIENT_${Date.now()}`,
        split_strategy: splitStrategy,
      });
      message.success(analysis.requires_split
        ? '订单已拆分提交，请关注各子包进度'
        : '下单成功'
      );
      // 跳转到支付页 — 场景2B闭环
      if (order.id) {
        navigate(`/app/mall/payment/${order.id}`);
      }
    } catch (e) {
      message.error('下单失败，请重试');
    }
    setSubmitting(false);
  };

  return (
    <AppPageFrame title="下单确认">
      <div style={{ padding: '16px', paddingBottom: 80 }}>
        {/* 收货地址 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
          <Space><EnvironmentOutlined /><Typography.Text strong>收货地址</Typography.Text></Space>
          <div style={{ paddingLeft: 24, marginTop: 8 }}>
            <Typography.Text>张患者 13800000001</Typography.Text><br/>
            <Typography.Text type="secondary">浙江省杭州市西湖区文三路138号</Typography.Text>
          </div>
        </Card>

        {/* 商品明细 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} title={`商品明细（${items.length}件）`}>
          {items.map((item, idx) => {
            const meta = PRODUCT_TYPE_META[item.product_type];
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: idx < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <Space size={4}>
                    <Tag color={meta.color} style={{ margin: 0, borderRadius: 4 }}>
                      {meta.icon} {PRODUCT_TYPE_LABEL[item.product_type]}
                    </Tag>
                    {item.product_type === 'RX' && (
                      <Tag color="error" style={{ margin: 0, borderRadius: 4 }}>需处方</Tag>
                    )}
                  </Space>
                  <div style={{ marginTop: 4, fontSize: 14 }}>
                    {item.product_name}
                  </div>
                </div>
                <Typography.Text style={{ marginRight: 16 }}>
                  x{item.quantity}
                </Typography.Text>
                <Typography.Text strong style={{ color: '#f5222d' }}>
                  ¥{item.unit_price * item.quantity}
                </Typography.Text>
              </div>
            );
          })}
        </Card>

        {/* 混合订单拆单策略 */}
        {types.length > 1 && (
          <Card size="small" style={{ borderRadius: 12, marginBottom: 12, borderColor: '#faad14' }}>
            <Space>
              <AlertOutlined style={{ color: '#faad14' }} />
              <Typography.Text strong style={{ color: '#faad14' }}>
                混合商品订单
              </Typography.Text>
            </Space>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0, fontSize: 13 }}>
              您的订单包含不同类型商品，将按以下策略拆分为独立子订单：
            </Typography.Paragraph>
            <Radio.Group
              value={splitStrategy}
              onChange={e => setSplitStrategy(e.target.value)}
              style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <Radio value="SPLIT_BY_TYPE">
                <Typography.Text>按商品类型拆单</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginLeft: 22 }}>
                  处方药独立审查·普通商品先行发货·冷链商品独立温控配送
                </Typography.Text>
              </Radio>
              <Radio value="UNIFIED_COLD_CHAIN">
                <Typography.Text>统一冷链配送</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginLeft: 22 }}>
                  所有商品统一冷链标准配送（配送费可能增加）
                </Typography.Text>
              </Radio>
            </Radio.Group>
          </Card>
        )}

        {/* 处方药提示 */}
        {hasRx && (
          <Card size="small" style={{ borderRadius: 12, marginBottom: 12, borderColor: '#f5222d', backgroundColor: '#fff2f0' }}>
            <Space>
              <SafetyCertificateOutlined style={{ color: '#f5222d' }} />
              <Typography.Text style={{ color: '#f5222d', fontSize: 13 }}>
                含处方药，下单后将进入药剂师审核环节
              </Typography.Text>
            </Space>
          </Card>
        )}

        {/* 金额汇总 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Typography.Text type="secondary">商品总额</Typography.Text>
            <Typography.Text>¥{totalPrice.toFixed(2)}</Typography.Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Typography.Text type="secondary">运费</Typography.Text>
            <Typography.Text>{hasColdChain ? '¥15.00（冷链）' : '免运费'}</Typography.Text>
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Typography.Text strong>实付金额</Typography.Text>
            <Typography.Text strong style={{ color: '#f5222d', fontSize: 18 }}>
              ¥{(totalPrice + (hasColdChain ? 15 : 0)).toFixed(2)}
            </Typography.Text>
          </div>
        </Card>
      </div>

      {/* 底部提交栏 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0', zIndex: 100 }}>
        <Button
          type="primary"
          size="large"
          block
          loading={submitting}
          onClick={handleSubmit}
          style={{ borderRadius: 12, height: 48 }}
        >
          提交订单 ¥{(totalPrice + (hasColdChain ? 15 : 0)).toFixed(2)}
        </Button>
      </div>
    </AppPageFrame>
  );
}
